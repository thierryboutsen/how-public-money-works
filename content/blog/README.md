# Approved blog publication packages

Save one JSON file per approved article in this directory, then run:

```bash
python3 scripts/publish_approved_posts.py
```

The publisher only processes packages where both fields are present:

```json
{
  "status": "approved",
  "approved": true
}
```

This keeps the editorial workflow human-gated: agents can draft the package, but a human must explicitly approve it before the site files are generated.

## Required fields

- `title`
- `excerpt`
- `category`
- `published_date` (`YYYY-MM-DD`)
- `body_markdown`
- `approved_by`
- `approved_at`

## Optional fields

- `slug`
- `subtitle`
- `author`
- `language`
- `tags`
- `read_time`
- `seo_title`
- `meta_description`
- `hero_image`
- `hero_caption`
