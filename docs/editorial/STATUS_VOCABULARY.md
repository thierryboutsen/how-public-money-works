# Vocabulário editorial de status

Este documento define os status válidos por contexto. Um status descreve o estado editorial; nenhum status autoriza autopublicação.

Não usar um campo genérico chamado `decision` quando houver mais de um tipo de decisão no mesmo documento. Usar os campos específicos abaixo:

- `antiRepetitionDecision`: controle de duplicidade de tema e ângulo;
- `sourceDecision`: viabilidade factual e suficiência do plano de fontes;
- `approvalDecision`: aprovação humana final;
- `recommendation`: triagem de ideias.

## A) Article lifecycle

Usado para acompanhar o ciclo completo de uma pauta ou artigo:

```text
idea → brief → drafted → reviewed → approved → scheduled → published → archived
```

- `idea`: pauta candidata, ainda sem brief aprovado.
- `brief`: pauta com pergunta central, ângulo e estrutura em preparação ou revisão. É um status intermediário: não é draft, não é artigo e não é publicação. Autoriza apenas planejamento.
- `drafted`: draft completo, ainda não aprovado.
- `reviewed`: draft revisado, aguardando decisão final.
- `approved`: conteúdo aprovado por uma pessoa responsável.
- `scheduled`: conteúdo aprovado com slot ou data definida.
- `published`: conteúdo efetivamente publicado ou pronto em `content/posts/` para publicação controlada.
- `archived`: conteúdo retirado do ciclo ativo, sem ser apagado do histórico.

Um item em `brief` só pode virar base para draft depois de aprovação humana explícita do tópico e do próprio brief. A automação recorrente não cria exceção para este gate de preparação.

## B) Calendar slot status

Usado somente para os slots de cadência em `content/calendar/`:

- `open`: slot disponível; não representa um artigo.
- `selected`: uma pauta foi escolhida para o slot, mas ainda pode estar em desenvolvimento.
- `skipped`: slot deliberadamente não preenchido porque não houve qualidade suficiente ou aprovação.
- `filled`: slot associado a conteúdo aprovado e pronto para o fluxo manual de publicação.
- `failed`: execução iniciada, mas interrompida por falha técnica; não implica publicação.
- `manually-held`: slot retido por rejeição, alterações solicitadas ou decisão humana explícita.
- `published`: resultado registrado somente depois de deploy e verificação pública bem-sucedidos.

`open` não é sinônimo de `idea`, e um slot `filled` não significa publicação automática.

## C) Topic registry status

Usado para o histórico e a taxonomia em `content/registry/topic-registry.yml`:

- `covered`: tema e ângulo já cobertos por conteúdo publicado.
- `reserved`: tema e assinatura formalmente selecionados ou mantidos como backup durante preparação; bloqueia duplicidade, mas não significa conteúdo coberto, aprovado ou publicado.
- `seed`: sugestão de geração; não é compromisso editorial.
- `blocked`: tema ou combinação de tema e ângulo que deve ser evitada por repetição, risco ou decisão editorial.
- `retired`: item removido da rotação ativa, preservado apenas para histórico.

`planned` não é status ativo. Sementes podem ser avaliadas, reformuladas ou descartadas, mas não representam planejamento aprovado.

## D) Publication status

Usado para descrever a situação de publicação do conteúdo:

- `draft`: rascunho ainda em elaboração.
- `review`: conteúdo aguardando revisão ou aprovação humana.
- `approved`: conteúdo aprovado, mas ainda não publicado.
- `scheduled`: conteúdo aprovado com publicação planejada.
- `published`: conteúdo efetivamente publicado ou localizado em `content/posts/` como parte do conjunto público aprovado.

## Regras gerais

- `published` só pode aparecer para conteúdo efetivamente publicado ou pronto em `content/posts/`.
- `seed` não é compromisso editorial.
- `reserved` protege uma pauta em preparação contra repetição e só vira `covered` depois de publicação e verificação pública.
- `open` não é artigo.
- `skipped` é aceitável quando não houver qualidade suficiente.
- `skipped` não é falha; é uma decisão editorial aceitável por qualidade, fontes ou timing.
- Nenhum status isolado autoriza autopublicação.
- A revisão humana é preferencial. A ausência de resposta até o cutoff configurado só pode acionar o fallback automático quando todos os Auto-Publish Gates determinísticos passam.
- Rejeição humana ou `requestedChanges` pendentes bloqueiam o fallback automático e resultam em `manually-held`.
- `awaiting-human-review` é um estado operacional da automação, não um `lifecycleStatus` nem um `status` de publicação.
- Se qualquer gate factual, editorial, técnico, de segurança, tradução ou qualidade falhar, o slot deve ser `skipped`; nenhum gate pode ser relaxado para cumprir cadência.
- No caminho humano, `status: published` só é tecnicamente válido quando `lifecycleStatus: published`, `humanDraftApproval: approved`, `publicationApproval: approved`, `publishAllowed: true`, `canonicalDecision: approved` e `slugDecision: approved` também estiverem presentes.
- No fallback automático, `humanDraftApproval` pode permanecer sem resposta, mas nunca `rejected`; são obrigatórios `publicationPath: auto-publish-fallback`, `humanReviewOutcome: no-response-by-cutoff`, `autoPublishEligible: true`, `requestedChanges: []` e todos os demais gates de publicação. Validators e builds não alteram esses gates automaticamente.

No fallback automático, esses campos só podem ser finalizados pelo runner após o cutoff e antes da promoção controlada, desde que todos os Auto-Publish Gates tenham passado. Registries e calendário só podem receber `published`/`covered` depois de deploy e verificação pública bem-sucedidos.
