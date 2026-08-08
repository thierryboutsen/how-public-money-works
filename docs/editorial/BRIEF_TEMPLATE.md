# Template de brief editorial

> Este documento é um modelo interno de planejamento. O conteúdo público do artigo deve ser escrito em inglês.

## Regras de uso

- Um brief não é artigo.
- Um brief não deve ser publicado.
- Um brief não cria URL pública.
- Um brief só autoriza a criação de draft após aprovação humana explícita.
- Se `duplicateRisk` for `high`, `antiRepetitionDecision` deve ser `rework` ou `block`.
- Se `sourceNeeds` não puderem ser satisfeitas, `sourceDecision` deve ser `skip` e não criar o draft.
- O brief deve consultar o article registry e o topic registry antes de ser submetido à aprovação.

## Brief metadata

```yaml
workingTitle: ""
proposedSlug: ""
articleType: "explainer"
lifecycleStatus: brief
targetSlot: unscheduled
proposedCategory: ""
proposedTags: []
intendedAudience: ""
readingLevel: "plain English"
estimatedLength: ""
publicLanguage: en
internalWorkflowLanguage: pt-BR
```

## Strategic purpose

```yaml
whyThisArticle: ""
readerProblem: ""
civicValue: ""
relationshipToExistingContent: ""
whyNow: ""
```

## Anti-repetition check

```yaml
checkedArticleRegistry: false
checkedTopicRegistry: false
similarExistingContent: []
topicAngleSignature: ""
duplicateRisk: medium
antiRepetitionDecision: rework
```

Valores permitidos:

- `duplicateRisk`: `low`, `medium`, `high`;
- `antiRepetitionDecision`: `proceed`, `rework`, `block`.

`antiRepetitionDecision` decide se o tema e o ângulo podem avançar do ponto de vista de duplicidade. Quando `duplicateRisk` for `high`, nunca usar `proceed`. Qualquer exceção exige reformulação do ângulo e um novo brief.

## Editorial angle

```yaml
coreQuestion: ""
uniqueAngle: ""
whatThisArticleWillNotCover: []
jurisdictionScope: ""
examplesAllowed: []
examplesToAvoid: []
```

## Source and precision plan

```yaml
sourceNeeds: []
claimsThatNeedVerification: []
dataSensitivity: "low"
precisionRisk: "medium"
citationPlan: ""
evergreenAssumptions: []
sourceDecision: rework
```

Valores sugeridos:

- `dataSensitivity`: `low`, `medium`, `high`;
- `precisionRisk`: `low`, `medium`, `high`.
- `sourceDecision`: `proceed`, `rework`, `skip`.

`sourceDecision` decide se o plano de fontes é suficiente para avançar. `skip` pertence à decisão editorial/de fontes, não à decisão anti-repetição.

## Structure

```yaml
proposedH1: ""
proposedSubtitle: ""
proposedOutline: []
requiredSections: []
optionalSections: []
suggestedInternalLinks: []
suggestedExternalSourceTypes: []
```

## SEO package

```yaml
seoTitle: ""
metaDescription: ""
primaryKeyword: ""
secondaryKeywords: []
searchIntent: "informational"
canonicalDecision: pending-human-approval
slugDecision: pending-human-approval
```

SEO, slug e canonical são sugestões de planejamento. Nenhum deles está finalizado antes da aprovação humana.

## Quality gates

```yaml
humanTopicApproval: pending
humanBriefApproval: pending
draftAllowed: false
publishAllowed: false
skipIfQualityInsufficient: true
```

## Approval notes

```yaml
reviewer: ""
approvalDecision: pending
requestedChanges: []
approvedAt: null
```

Valores permitidos para `approvalDecision`: `pending`, `approved`, `rework`, `blocked`, `skipped`.

`approvalDecision` registra a decisão humana final sobre o brief.

Não usar um campo genérico chamado `decision` quando houver mais de um tipo de decisão no mesmo documento.

## Transição autorizada

Somente quando `humanTopicApproval` e `humanBriefApproval` forem aprovados por uma pessoa responsável, o brief poderá servir de base para um draft em `content/drafts/`. Mesmo nesse caso, `draftAllowed` deve ser alterado conscientemente e o draft continua sem autorização de publicação.
