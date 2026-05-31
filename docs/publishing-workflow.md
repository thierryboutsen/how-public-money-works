# Blog publishing automation workflow

This repo now supports a human-approved static publishing flow for Eliana's blog.

```text
Editorial agents draft/review article
  ↓
Human approves publication package JSON
  ↓
python3 scripts/publish_approved_posts.py
  ↓
Article HTML is generated
  ↓
insights.html receives the listing card
  ↓
sitemap.xml, rss.xml, and data/published-posts.json are updated
  ↓
Git commit/push or PR triggers Vercel deploy
  ↓
Smoke test live URL and index
```

## Human approval gate

The publisher ignores any package that is not explicitly approved:

```json
{
  "status": "approved",
  "approved": true,
  "approved_by": "Name of approver",
  "approved_at": "2026-05-31T12:00:00Z"
}
```

Do not put secrets, tokens, or private operational notes in publication packages.

## Publishing command

```bash
python3 scripts/publish_approved_posts.py --site-url https://www.luminasmart.company
```

Use `--check` first to validate package readiness without writing site files:

```bash
python3 scripts/publish_approved_posts.py --check
```

## Output files

- `<slug>.html` — article page
- `insights.html` — auto-published cards are inserted between `AUTO-PUBLISHED POSTS` markers
- `sitemap.xml` — canonical URLs for static and generated pages
- `rss.xml` — RSS feed for generated posts
- `data/published-posts.json` — operational registry for audits and future agents

## Deployment

After validating locally, commit changes on a feature branch and push/open a PR. Vercel should deploy from the connected GitHub branch when merged or pushed, depending on project settings.
