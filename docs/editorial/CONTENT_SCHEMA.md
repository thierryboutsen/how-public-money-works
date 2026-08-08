# Schema real de conteúdo

O frontmatter Markdown é lido com `gray-matter`. A configuração técnica central está em `site.config.js`; o domínio oficial é `https://www.luminasmart.company`.

## Campos renderizados

Todo artigo deve fornecer:

- `title`: título público;
- `subtitle`: subtítulo público;
- `slug`: letras minúsculas, números e hífens;
- `seoTitle`: título usado em SEO e redes sociais;
- `metaDescription`: descrição da página;
- `excerpt`: resumo usado no índice;
- `category`: uma categoria aceita por `site.config.js`;
- `tags`: lista YAML de tags;
- `author`: autor, com fallback técnico explícito em `site.config.js`;
- `readingTime`: texto de tempo de leitura;
- `featuredImage`: caminho `/assets/...` para um arquivo existente;
- `featuredImageAlt`: descrição obrigatória quando houver imagem;
- `date`: data `YYYY-MM-DD`, obrigatória para conteúdo publicado;
- `status`: status de publicação definido em `STATUS_VOCABULARY.md`.

O build usa `title`, `subtitle`, `slug`, `seoTitle`, `metaDescription`, `excerpt`, `category`, `tags`, `date`, `author`, `readingTime`, `featuredImage` e `featuredImageAlt`. Não usar `publishDate`; o campo técnico atual é `date`.

## Campos editoriais

Os campos abaixo controlam o processo, mas não precisam aparecer no HTML:

- `lifecycleStatus`;
- `humanDraftApproval`;
- `publicationApproval`;
- `publishAllowed`;
- `sourceLevel`;
- `precisionRisk`;
- `canonicalDecision`;
- `slugDecision`;
- `primaryKeyword`;
- `secondaryKeywords`;
- `searchIntent`.

## Gates de publicação

Um novo artigo em estado publicável deve satisfazer simultaneamente:

```yaml
humanDraftApproval: "approved"
publicationApproval: "approved"
publishAllowed: true
canonicalDecision: "approved"
slugDecision: "approved"
lifecycleStatus: "published"
status: "published"
```

O validator nunca altera esses campos. O artigo publicado anterior ao pipeline está explicitamente registrado como legado na configuração; essa exceção não se aplica a artigos novos.

## URLs e metadados

- Homepage: `/`;
- índice: `/insights`;
- artigo: `/{slug}`;
- canonical, Open Graph, Twitter e JSON-LD usam `siteOrigin` de `site.config.js`;
- o build gera `sitemap.xml` e `robots.txt` apenas a partir de conteúdo publicado.

## Comandos

```text
npm run content:validate
npm run content:validate:review
npm run content:validate:published
npm run build
npm run content:audit
npm run content:preview -- content/review/<arquivo>.md
npm run content:audit:preview
npm run content:test:guards
```

O preview é escrito em `.preview/`, ignorado pelo Git. Ele não move conteúdo, não altera gates e não publica. A página exclusiva de preview usa `noindex,nofollow` e omite canonical, `og:url` e JSON-LD de produção.
