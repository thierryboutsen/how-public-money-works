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
→ deploy Vercel
→ verificação pública
→ atualização pós-verificação de registries/calendário
```

O scheduler não cria pauta, pesquisa, artigo, tradução ou imagem. A preparação de estoque continua no Codex Desktop. O alvo editorial é 16 pares, com buffer mínimo desejado de oito pares completos.

## Configuração central

`editorial.automation.config.js` é a fonte técnica de verdade. Os valores operacionais atuais são Tuesday e Thursday, publicação às 09:00 e cutoff às 18:00 do dia anterior, no timezone `America/Sao_Paulo`.

Enquanto a ativação não estiver concluída:

```text
enabled: false
dryRun: true
productionSecretsConfigured: false
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

No slot, a engine prefere um par reservado por `targetPublicationDate`. Sem reserva, pode escolher o próximo par preparado. Nunca escolhe par incompleto, rejeitado, com tradução ausente, duplicidade alta, fonte pendente ou blocker.

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
→ DEPLOY
→ PUBLIC_VERIFY
→ REGISTRY_UPDATE
→ SUCCESS
```

Falha antes do deploy restaura o workspace e aborta. Falha no deploy ou na verificação pública não grava falso `published` nos registries. O par EN/PT-BR é indivisível.

Depois de verificação pública, o adapter atualiza `article-registry`, `topic-registry` e o resultado do calendário no workspace do runner. Como a publicação não depende de push ou merge no branch principal, o workflow entrega um pacote de sincronização como artifact. A sincronização Git permanece uma operação separada: sem force-push, merge automático ou tentativa de resolver divergências silenciosamente.

## Vercel

O domínio canônico é `https://www.luminasmart.company`. A publicação usa o fluxo recomendado pela Vercel:

```text
vercel pull --environment=production
vercel build --prod
vercel deploy --prebuilt --prod
```

Secrets necessários no GitHub:

- `VERCEL_TOKEN`;
- `VERCEL_ORG_ID`;
- `VERCEL_PROJECT_ID`.

Os IDs informados por ambiente têm precedência sobre `.vercel/project.json`. Isso é importante porque o vínculo local ainda registra `banner-linkedin-eliana`, enquanto o projeto de produção informado é `elianafarialima`. Nenhum token ou valor de secret deve aparecer em logs ou arquivos.

## GitHub Actions e cron

O workflow está preparado para `workflow_dispatch` e contém o caminho de produção, mas o trigger `schedule` permanece comentado enquanto os secrets não estiverem configurados.

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

`editorial:run-slot` é dry-run por padrão. `--execute` falha se `enabled`, `dryRun` ou a confirmação de secrets não permitirem produção.

## Activation modes

- `AUTOMATION_READY_DRY_RUN`: tecnicamente pronta, ainda em dry-run.
- `AUTOMATION_READY_NEEDS_SECRETS`: gates técnicos prontos; faltam secrets de produção.
- `AUTOMATION_READY_FOR_ACTIVATION`: secrets confirmados, automação ainda desabilitada.
- `AUTOMATION_ACTIVE`: execução recorrente habilitada.
- `AUTOMATION_BLOCKED`: blocker técnico ou editorial impede ativação.

## Pausa, override e falhas

- Pausar tudo: `enabled: false` ou remover/commentar o schedule.
- Desligar fallback: `autoPublishFallback: false`.
- Forçar retenção humana: registrar rejeição ou `requestedChanges`.
- Fonte, claim, tradução, imagem, canonical, link, leak ou exposição pública inválida: SKIP.
- Rejeição ou mudança solicitada: HOLD.
- Deploy ambíguo: ABORT.
- Verificação pública falha: não atualizar registry.
- Segredo ausente: ABORT sem revelar valor.
- Pauta insuficiente: `SKIP_SLOT_LOW_QUALITY`.

O dry-run não move artigos, não altera gates, não atualiza registries e não executa deploy.
