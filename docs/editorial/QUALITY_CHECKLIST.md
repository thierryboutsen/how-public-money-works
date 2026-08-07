# Checklist obrigatório de publicação

Um artigo só pode avançar para `approved` quando todos os itens aplicáveis forem verificados.

Os status e suas diferenças por contexto estão definidos em [`STATUS_VOCABULARY.md`](STATUS_VOCABULARY.md).

## Gates do fluxo dinâmico

- [ ] Dynamic Topic Check: a pauta foi proposta depois da consulta ao registro de artigos e temas.
- [ ] Anti-Repetition Check: tema, ângulo, título, slug e assinatura foram comparados.
- [ ] Human Topic Approval: uma pessoa aprovou a pauta escolhida.
- [ ] Human Brief Approval: uma pessoa aprovou a pergunta central, estrutura e fontes previstas.
- [ ] Human Draft Approval: uma pessoa aprovou o draft completo.
- [ ] Manual Publish Approval: uma pessoa autorizou a publicação após preview.
- [ ] Skip If Quality Is Not High Enough: o slot será pulado se o material não atingir o padrão.

## Anti-duplicate

- [ ] O slug é único.
- [ ] O título não repete título existente.
- [ ] O tema, subtema e ângulo foram comparados com `topic-registry.yml`.
- [ ] A assinatura `duplicateCheckSignature` foi registrada.
- [ ] O artigo não repete a mesma introdução, estrutura ou conclusão de outro artigo.
- [ ] Os links relacionados são realmente complementares.

## Precisão factual

- [ ] As afirmações centrais foram verificadas.
- [ ] Fontes adequadas foram consultadas e registradas no processo editorial.
- [ ] Números, datas, nomes e definições foram conferidos.
- [ ] O campo `sourceLevel` representa corretamente a base do texto.
- [ ] O campo `precisionRisk` foi avaliado.

## Variação local

- [ ] O texto informa quando regras variam entre estados, cidades, condados ou distritos.
- [ ] Nenhuma prática local foi apresentada como regra universal.
- [ ] Exemplos locais estão identificados como exemplos.
- [ ] Procedimentos, prazos e responsabilidades foram contextualizados.

## Linguagem editorial

- [ ] O conteúdo público está em inglês.
- [ ] O texto usa plain English.
- [ ] Termos técnicos são explicados.
- [ ] O tom é cívico, educativo e não partidário.
- [ ] Não há hype, arrogância ou tom político.

## SEO

- [ ] `title`, `seoTitle`, `metaDescription`, `excerpt` e `slug` foram revisados.
- [ ] O slug é curto, estável e único.
- [ ] A canonical corresponde ao domínio oficial e ao URL escolhido.
- [ ] Open Graph está completo.
- [ ] Twitter Card está completo.
- [ ] O artigo não cria uma segunda URL indexável para o mesmo conteúdo.

## Acessibilidade

- [ ] `featuredImageAlt` descreve a função ou o conteúdo da imagem.
- [ ] Headings seguem uma hierarquia lógica.
- [ ] Links têm texto descritivo.
- [ ] Listas usam marcação apropriada.
- [ ] O conteúdo é compreensível sem depender de cor.

## Links e mídia

- [ ] Links internos apontam para páginas existentes.
- [ ] `relatedPosts` contém somente slugs válidos.
- [ ] A imagem existe em `src/assets`.
- [ ] A imagem tem dimensões e proporção adequadas.
- [ ] Não há links quebrados ou placeholders.

## Experiência e aprovação

- [ ] O layout foi conferido em desktop e mobile.
- [ ] A página foi visualizada em preview.
- [ ] O artigo foi revisado por uma pessoa responsável.
- [ ] A pessoa responsável aprovou título, conteúdo, imagem e data.
- [ ] O status só foi alterado para publicação após aprovação humana.
