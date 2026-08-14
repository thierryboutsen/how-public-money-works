# Workflow dinâmico de geração de ideias

Este workflow organiza a geração recorrente de pautas sem transformar sementes ou sugestões em compromissos editoriais.

## 1. Consultar o histórico

Antes de propor qualquer tema, consultar:

- `content/registry/article-registry.yml`;
- `content/registry/topic-registry.yml`;
- `content/calendar/editorial-calendar.yml`;
- `docs/editorial/STATUS_VOCABULARY.md`;
- `docs/editorial/TOPIC_TAXONOMY.md`.

O objetivo é identificar temas cobertos, ângulos usados, duplicidades bloqueadas, slots disponíveis e riscos de precisão.

## 2. Gerar propostas

Em cada ciclo, gerar de 3 a 5 ideias. A geração deve buscar variedade de tema, categoria, público, jurisdição e ângulo.

Cada ideia deve conter:

```yaml
workingTitle: ""
readerProblem: ""
uniqueAngle: ""
category: ""
tags: []
topicAngleSignature: ""
duplicateRisk: low
whyItMatters: ""
recommendedSlot: Tuesday
recommendation: proceed
```

Valores permitidos:

- `duplicateRisk`: `low`, `medium`, `high`;
- `recommendedSlot`: `Tuesday`, `Thursday`, `unscheduled`;
- `recommendation`: `proceed`, `rework`, `block`, `skip`.

Se `duplicateRisk` for `high`, `recommendation` nunca pode ser `proceed`. A ideia deve ser marcada como `rework` ou `block`. Se houver potencial editorial, reformular o ângulo e reavaliar como uma nova ideia, com nova assinatura e novo brief.

Use `skip` quando a ideia puder ser válida em princípio, mas não houver fontes suficientes, timing adequado ou qualidade editorial suficiente para avançar naquele ciclo.

## 3. Seleção humana

Uma pessoa responsável escolhe no máximo duas ideias por semana, respeitando os slots disponíveis. A escolha não aprova automaticamente o brief nem o artigo.

As ideias rejeitadas, adiadas ou reformuladas não viram obrigação editorial. Podem retornar ao conjunto de sugestões, ser marcadas como bloqueadas ou ser descartadas.

## 4. Uso de seedIdeas

As `seedIdeas` e `seedTopics` são apenas pontos de partida. Podem ser:

- usadas como estão, se ainda forem relevantes e distintas;
- ignoradas;
- combinadas com outra necessidade editorial;
- reformuladas para criar ângulo novo;
- bloqueadas quando o registry indicar repetição ou risco excessivo.

Uma seed nunca substitui a consulta ao histórico nem a aprovação humana.

## 5. Decisão de qualidade

Para cada ideia escolhida:

1. Confirmar o problema real do leitor.
2. Confirmar que o ângulo é diferente do conteúdo existente.
3. Verificar se as fontes necessárias são realistas.
4. Avaliar variações por estado, cidade, condado ou distrito.
5. Confirmar a categoria e as tags.
6. Registrar a assinatura `topicAngleSignature`.
7. Criar o brief usando `BRIEF_TEMPLATE.md`.

Se nenhuma ideia for suficientemente forte, ou se uma ideia exigir fontes/timing que não estejam disponíveis, usar `recommendation: skip` e recomendar pular o slot. Qualidade prevalece sobre a meta de cadência.

## 6. Próxima etapa

Somente após a aprovação humana do tópico e do brief poderá ser criado um draft em `content/drafts/`. O draft deve permanecer fora de `content/posts/` até passar por revisão, aprovação e preview manual.

Não existe autopublicação neste fluxo.
