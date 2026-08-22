# Esteira editorial automatizada

## Arquitetura

A preparação e a publicação são responsabilidades separadas:

```text
Codex Desktop
→ pauta dinâmica
→ brief e fontes
→ drafts EN/PT-BR
→ revisão factual e editorial
→ imagem, SEO, preview e gates
→ preparedInventory

GitHub Actions
→ identifica o slot
→ escolhe somente um par preparado
→ verifica revisão humana e cutoff
→ executa Auto-Publish Gate
→ promove o par em workspace efêmero
→ validate → build → content audit → public exposure audit
→ commit editorial e push normal para master
→ deploy pela integração Git nativa da Vercel
→ verificação pública
→ commit pós-verificação de registries/calendário
```

O scheduler não cria pauta, pesquisa, artigo, tradução ou imagem. A preparação de estoque continua no Codex Desktop. O alvo editorial é 16 pares, com buffer mínimo desejado de oito pares completos.

## Configuração central

`editorial.automation.config.js` é a fonte técnica de verdade. Os valores operacionais atuais são Tuesday e Thursday, publicação às 09:00 e cutoff às 18:00 do dia anterior, no timezone `America/Sao_Paulo`.

Com a ativação de produção concluída, a configuração esperada é:

```text
enabled: true
dryRun: false
productionCredentialsMode: github-token
productionCredentialsConfigured: true
gitIntegrationTriggerVerified: true
```

Não copiar regras editoriais para o workflow. O YAML do GitHub Actions chama a engine.

## Cutoff e revisão humana

- Tuesday 09:00: cutoff Monday 18:00.
- Thursday 09:00: cutoff Wednesday 18:00.
- Aprovação humana e gates verdes: `WOULD_PUBLISH`, caminho `human-approved`.
- Sem resposta antes do cutoff: `WOULD_HOLD`.
- Sem resposta depois do cutoff e gates verdes: `WOULD_PUBLISH_AUTO`, caminho `auto-publish-fallback`.
- Rejeição ou `requestedChanges`: `WOULD_HOLD`.
- Falha factual, editorial, de tradução, fonte, SEO, asset, segurança, validator, build ou preview: `WOULD_SKIP`.

Silêncio nunca substitui uma rejeição ou alteração registrada.

## Prepared inventory

Executar:

```powershell
npm run editorial:inventory
```

A saída informa `READY`, `HUMAN_REVIEW`, `FALLBACK_ELIGIBLE`, `BLOCKED`, pares preparados, slots cobertos, semanas de cobertura e a diferença para o buffer mínimo.

No cron, a engine aceita somente o único par reservado por `targetPublicationDate` exatamente igual à data local do slot. Se a rota desse par já estiver pública, se não houver reserva exata ou se houver mais de um par elegível para a mesma data, o runner falha de forma segura e não consome outro artigo. Publicação manual fora desse mecanismo exige identificador explícito. A engine nunca escolhe par incompleto, rejeitado, com tradução ausente, duplicidade alta, fonte pendente ou blocker.

## Auto-Publish Gate

Todos os itens precisam passar:

- ausência de rejeição e alterações pendentes;
- checklist factual completo e zero claims pendentes;
- `duplicateRisk` aceitável, anti-repetição e fontes aprovadas;
- qualidade editorial e `ElianaVoiceCheck`;
- SEO;
- par EN/PT-BR e validação de tradução;
- canonical, hreflang, idioma, OG e JSON-LD;
- imagem e alt text;
- links internos e externos acessíveis;
- content validator e publication guards;
- build, preview audit, public leak audit e public exposure audit;
- zero blockers P1/P2;
- zero alertas editoriais de segurança;
- `npm audit --omit=dev` sem vulnerabilidade bloqueante.

O parser de frontmatter usa `yaml` moderno em modo estrito, sem aliases e com chaves únicas.

## Transação de publicação

O adapter `scripts/editorial/publication-adapter.js` executa:

```text
PRECHECK
→ PROMOTE_PAIR
→ VALIDATE
→ BUILD
→ AUDIT
→ PUBLIC_EXPOSURE_AUDIT
→ PUBLICATION_COMMIT
→ WAIT_FOR_GIT_DEPLOYMENT
→ PUBLIC_VERIFY
→ REGISTRY_COMMIT
→ SUCCESS
```

Falha antes do commit editorial restaura o workspace e aborta. Depois do push, o commit é preservado como evidência do incidente, o runner não tenta outro par e registries/calendário continuam sem `published`/`covered`. O par EN/PT-BR é indivisível.

Somente depois da verificação pública, o adapter atualiza `article-registry`, `topic-registry` e o calendário e cria um segundo commit. Ambos os commits usam staging por lista exata de paths e push normal; não há `git add .`, force-push, merge automático ou tentativa de resolver divergências silenciosamente.

## Deploy pela integração Git da Vercel

O domínio canônico é `https://www.luminasmart.company`. O projeto Vercel `elianafarialima` está conectado ao repositório e acompanha `master`. O adapter não usa Vercel CLI, token Vercel ou `.vercel/project.json`:

```text
git push normal para master
→ integração Git cria o Production Deployment
→ GitHub Deployments API localiza o deployment pelo commit SHA
→ domínio público é verificado por HTTP
```

O job de publicação recebe apenas `contents: write` e `deployments: read`. Usa o `GITHUB_TOKEN` efêmero do próprio job e confirma que `GITHUB_REPOSITORY` corresponde a `thierryboutsen/how-public-money-works`. Não exige PAT nem secrets `VERCEL_*`.

No estado auditado, `master` não possui branch protection nem ruleset. Se essa política mudar e bloquear o push do job, a execução deve abortar. A alternativa futura é branch editorial automática + PR/auto-merge sujeito às proteções existentes; o pipeline não deve reduzir proteção para contornar o gate.

O vínculo master→Vercel foi comprovado por commits normais e pelo canário controlado `07dc5dcbfe8ed016f3d85a1571d018dd81b95c47`, criado pelo `GITHUB_TOKEN`. O deployment de produção `6041044697` foi associado ao mesmo SHA e terminou com sucesso; as rotas públicas foram verificadas sem publicação editorial. Branch protection não deve ser enfraquecida silenciosamente.

### Limite transacional

O push para `master` antecede a confirmação pública. Se o deployment ou a verificação falhar, o adapter não grava registries, retorna erro e não seleciona outro par. O commit publicado permanece no histórico para diagnóstico e exige intervenção humana (correção ou revert explícito). Um deploy posterior de outro commit poderia tornar esse conteúdo público; portanto não se deve retomar o scheduler até resolver o incidente.

## GitHub Actions e cron

O workflow aceita `workflow_dispatch` para verificações controladas e possui um único trigger `schedule`: Tuesday e Thursday às 09:00 em `America/Sao_Paulo`. A engine continua responsável por decidir `PUBLISH`, `SKIP` ou `HOLD`; o disparo do cron não autoriza publicação por si só.

GitHub Actions aceita timezone IANA no schedule. Ao ativar, usar a política da configuração central para Tuesday/Thursday às 09:00 em `America/Sao_Paulo`; isso evita manter manualmente um offset UTC que possa ficar incorreto se regras de timezone mudarem. Workflows agendados usam o último commit do default branch, portanto divergências de branches precisam ser tratadas separadamente e nunca por force-push automático.

## Comandos

```powershell
npm run editorial:status
npm run editorial:inventory
npm run editorial:plan-week
npm run editorial:prepare-next
npm run editorial:test
npm run editorial:test:transaction
npm run editorial:auto-publish-check -- <slug-en>
npm run editorial:run-slot -- <slug-en>
npm run editorial:preview -- <arquivo-en>
npm run public:exposure-audit
npm run public:test:exposure-audit
```

`editorial:run-slot` é dry-run por padrão. `--execute` falha se `enabled`, `dryRun` ou a confirmação das credenciais efêmeras GitHub não permitirem produção.

## Activation modes

- `AUTOMATION_READY_DRY_RUN`: tecnicamente pronta, ainda em dry-run.
- `AUTOMATION_READY_NEEDS_CREDENTIALS`: faltam as credenciais efêmeras esperadas pelo runner.
- `AUTOMATION_READY_FOR_ACTIVATION`: integração e permissões confirmadas, automação ainda desabilitada.
- `AUTOMATION_ACTIVE`: execução recorrente habilitada.
- `AUTOMATION_BLOCKED`: blocker técnico ou editorial impede ativação.

## Pausa, override e falhas

- Pausar imediatamente: alterar `enabled: false` em `editorial.automation.config.js`. Para suspender também os disparos, desabilitar o workflow no GitHub Actions ou remover/commentar o bloco `schedule` em mudança revisada.
- Desligar fallback: `autoPublishFallback: false`.
- Forçar retenção humana: registrar rejeição ou `requestedChanges`.
- Fonte, claim, tradução, imagem, canonical, link, leak ou exposição pública inválida: SKIP.
- Rejeição ou mudança solicitada: HOLD.
- Deploy ambíguo: ABORT.
- Verificação pública falha: não atualizar registry.
- Credencial GitHub ausente ou repositório divergente: ABORT sem revelar valor.
- Pauta insuficiente: `SKIP_SLOT_LOW_QUALITY`.

O dry-run não move artigos, não altera gates, não atualiza registries e não executa deploy.
