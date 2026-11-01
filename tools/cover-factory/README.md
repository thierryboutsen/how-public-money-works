# How Public Money Works — Editorial Cover Factory

This isolated tool generates article-cover candidates for the official `premium-civic-editorial-v1` visual system.

It is intentionally separate from the public-site build. The normal `elianafarialima` deployment must never generate images or incur model usage.

## Safety model

- Approved covers in `src/assets` are visual-language references.
- Each article identity receives a unique master cover shared by EN/PT-BR.
- No generated file is considered publication-ready automatically.
- Generated covers must be copied into `src/assets`, added to `content/visual/cover-manifest.yml`, and pass the existing visual policy before publication.
- The public scheduler remains fail-closed while a cover is missing or unapproved.
- Do not store provider API keys in this directory. Vercel-hosted execution should use Vercel OIDC / AI Gateway authentication.

## Queue

The operational queue is `queue.json`. Set `COVER_SLUG` to generate one item, or omit it to generate all items with `status: ready-for-generation`.

## Vercel

Use the protected Vercel project dedicated to cover generation, not the production blog project.

Current account-level prerequisite: AI Gateway requires billing verification / a valid payment method before requests are serviced. This is an account setting, not a repository secret.
