# Runbook manual de publicação

A rotina é dinâmica e assistida por geração de ideias, briefs e drafts. A publicação permanece manual. Nenhum arquivo deve ser movido para a área pública sem revisão e aprovação humana.

Os status usados neste runbook estão definidos em [`STATUS_VOCABULARY.md`](STATUS_VOCABULARY.md).

O modelo de brief está em [`BRIEF_TEMPLATE.md`](BRIEF_TEMPLATE.md) e o workflow de pauta está em [`IDEA_GENERATION_WORKFLOW.md`](IDEA_GENERATION_WORKFLOW.md).

## Fluxo de pauta e brief

```text
idea generation → human topic approval → brief creation → human brief approval → draft creation
```

O draft só pode ser criado depois da aprovação humana do tópico e do brief. Aprovar uma ideia ou um brief não publica conteúdo e não cria URL pública.

## 1. idea

O sistema pode gerar ideias sob demanda ou no ciclo semanal. Registrar a ideia candidata no processo com título provisório, categoria, ângulo, risco de precisão e observações.

Antes de avançar, comparar a pauta com `content/registry/topic-registry.yml` e `article-registry.yml`.

O calendário define cadência e slots, não uma lista fechada de artigos. Uma pauta seed pode ser ignorada, substituída ou reformulada.

## 2. brief

Definir:

- pergunta central;
- público leitor;
- resposta que o artigo deve oferecer;
- estrutura de headings;
- fontes pretendidas;
- variações locais relevantes;
- artigos relacionados;
- assinatura anti-repetição.

## 3. draft

Gerar o draft em inglês dentro de `content/drafts/`, usando o frontmatter definido em `docs/CONTENT_SCHEMA.md`.

O draft não deve ser considerado publicado e não deve ser colocado em `content/posts/`.

## 4. review

Mover manualmente para `content/review/` quando o texto estiver completo. Aplicar integralmente `QUALITY_CHECKLIST.md` e registrar pendências.

## 5. approval

Uma pessoa responsável deve escolher a pauta, aprovar o brief e depois aprovar conteúdo, fatos, imagem, metadados, links e data. Somente após essas aprovações o status pode ser `approved` ou `scheduled`.

## 6. Mover para `content/posts`

Somente depois da aprovação humana, transformar o draft em Markdown final e copiar ou mover manualmente o arquivo para `content/posts/`. Confirmar que:

- o slug é único;
- a imagem existe;
- o status está correto;
- a data não publica antes do planejado;
- nenhum artigo existente será sobrescrito.

## 7. Preview

Gerar um preview controlado e conferir:

- homepage e `/insights`;
- página do artigo;
- navegação;
- imagens;
- mobile;
- canonical, Open Graph e Twitter Card;
- links internos;
- sitemap e robots quando forem implementados.

## 8. Build

Executar o build somente depois da revisão, da aprovação e do preview planejado. Registrar o resultado e investigar qualquer warning ou diferença inesperada.

## 9. Deploy manual

O deploy deve ser uma ação manual e deliberada, feita após a conferência do preview. A rotina editorial não deve publicar automaticamente ao gerar ideias, briefs, drafts, aprovar conteúdo ou preencher um slot.

## 10. Validação pós-publicação

Conferir a URL pública, status HTTP, título, descrição, canonical, imagem social, links, sitemap e renderização mobile.

Registrar a data de publicação em `article-registry.yml` e atualizar `topic-registry.yml` de `seed` para `covered` quando aplicável.

## Estados permitidos

```text
idea → brief → drafted → reviewed → approved → scheduled → published → archived
```

Não pular etapas sem registrar a justificativa editorial. Se não houver qualidade suficiente, o slot deve ser pulado.
