# Regras de SEO editorial

## URL e slug

- Cada artigo deve ter slug único.
- A geração de ideias e drafts pode sugerir slug, mas o slug final só é confirmado após aprovação humana.
- O slug deve usar letras minúsculas, hífens e termos descritivos.
- Não usar datas no slug sem uma decisão editorial específica.
- Não mudar um slug publicado sem redirect e revisão de links.
- Não permitir duas URLs indexáveis para o mesmo artigo.

## Título e descrição

- `title` deve ser claro para o leitor.
- `seoTitle` pode ser otimizado, mas não deve prometer algo que o artigo não entrega.
- `metaDescription` deve resumir a resposta principal do texto.
- `excerpt` deve funcionar tanto no índice quanto como fallback editorial.
- Evitar repetição artificial de palavras-chave.

## Canonical

- O domínio oficial é definido uma única vez em `site.config.js`; atualmente, `https://www.luminasmart.company`.
- A rota pública de artigo é `/{slug}` e o índice usa `/insights`.
- Usar um único domínio oficial.
- A geração de conteúdo pode sugerir canonical, mas a canonical final só é confirmada após aprovação humana.
- A canonical deve apontar para a URL final escolhida para o artigo.
- Versões traduzidas têm canonicals próprios. Não apontar a canonical PT-BR para a versão EN.

## Idioma e hreflang

- Usar `language: en` para inglês e `language: pt-BR` para português brasileiro.
- Relacionar traduções com `translationKey` compartilhado e mapas `translations` recíprocos.
- Gerar alternates `en`, `pt-BR` e `x-default` no HTML e no sitemap.
- `x-default` deve apontar para a versão inglesa quando ela existir.
- A mesma URL deve ser usada no sitemap, Open Graph, Schema.org e links principais.
- Não manter referências a domínios antigos ou alternativos.

## Open Graph e Twitter Card

Cada página de artigo deve ter, no mínimo:

- `og:type`;
- `og:url`;
- `og:title`;
- `og:description`;
- `og:image`;
- `og:site_name`;
- `twitter:card`;
- `twitter:title`;
- `twitter:description`;
- `twitter:image`.

A imagem deve existir, ser legível em miniatura e ter texto alternativo no conteúdo quando também for exibida na página.

O build usa a featured image do artigo para Open Graph, Twitter e JSON-LD. Quando ela não existir, pode usar somente o fallback real definido em `site.config.js`; o hero público é omitido.

## Links internos

- Não gerar URLs públicas para artigos que ainda não foram aprovados.
- Cada artigo deve ter pelo menos um link para `/insights`.
- Quando útil, incluir links para artigos relacionados.
- Validar todos os slugs relacionados.
- Não criar links para rascunhos, arquivos de revisão ou ferramentas administrativas.

## Sitemap futuro

O sitemap deve ser gerado a partir dos artigos publicados, sem incluir rascunhos, artigos futuros ou páginas administrativas.

## Robots futuro

O `robots.txt` deve permitir as páginas públicas, apontar para o sitemap e bloquear áreas editoriais internas.

## Verificação antes da publicação

- [ ] Slug único.
- [ ] Título claro.
- [ ] `metaDescription` revisada.
- [ ] Canonical com o domínio oficial.
- [ ] Open Graph completo.
- [ ] Twitter Card completo.
- [ ] Sem URLs duplicadas.
- [ ] Links internos válidos.
- [ ] Inclusão futura no sitemap confirmada.
