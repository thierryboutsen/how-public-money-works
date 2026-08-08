# TEMPLATE ONLY

# NOT AN ARTICLE

# NOT APPROVED

# NOT PUBLISHED

# DO NOT MOVE TO content/posts/

Este arquivo é uma cópia prática do modelo de brief. Duplique-o quando um brief real for criado e mantenha o arquivo dentro de `content/drafts/` até a aprovação humana.

Consulte [`docs/editorial/BRIEF_TEMPLATE.md`](../../docs/editorial/BRIEF_TEMPLATE.md) para as instruções completas.

## Regras de decisão

- `antiRepetitionDecision` decide se tema e ângulo podem avançar quanto à duplicidade.
- Se `duplicateRisk` for `high`, `antiRepetitionDecision` deve ser `rework` ou `block`; nunca `proceed`.
- Qualquer exceção exige reformulação do ângulo e novo brief.
- `sourceDecision` decide se o plano de fontes é suficiente para avançar.
- `sourceDecision` aceita `proceed`, `rework` ou `skip`; `skip` pertence à decisão de fontes/editorial.
- `approvalDecision` registra a aprovação humana final.
- Nenhum campo genérico chamado `decision` deve ser usado neste brief.

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
