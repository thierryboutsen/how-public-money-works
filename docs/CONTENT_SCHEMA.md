# Content Schema

Every blog post must be a Markdown (`.md`) file placed in `/content/posts/`.
The file must begin with a YAML Frontmatter block surrounded by `---`.

## Valid Example

```markdown
---
title: "Why Public Budgets Matter More Than Most People Think"
subtitle: "A plain-English guide to how public money choices shape daily life."
slug: "why-public-budgets-matter"
date: "2026-05-31"
author: "Eliana Faria Lima"
category: "Public Finance"
tags:
  - public finance
  - local government
readingTime: "6 min read"
excerpt: "Public budgets are more than spreadsheets. They are choices about roads, schools, safety, water, and the daily services people rely on."
featuredImage: "/assets/article-city-budget-hero.jpg"
status: "published"
language: "en"
seoTitle: "Why Public Budgets Matter More Than Most People Think"
metaDescription: "A clear, plain-English explanation of why public budgets shape daily life."
---

Your article body text goes here.

You can use standard markdown:
## Subheading
- List item 1
- List item 2

And custom shortcodes:
[dropcap]Y[/dropcap]our text here...
[pullquote]A quote here[author]Eliana Lima[/pullquote]
```

## Validation Rules

- `title` (String): Required. The main H1 title.
- `subtitle` (String): Required. Displayed below the title.
- `slug` (String): Required. Becomes the URL (e.g. `your-slug.html`). No spaces.
- `date` (String): Required. Format YYYY-MM-DD. Used for sorting.
- `author` (String): Required. (Default: "Eliana Faria Lima").
- `category` (String): Required. Displayed on the blog grid and post header.
- `readingTime` (String): Required. (e.g., "8 min read").
- `excerpt` (String): Required. Used for the blog grid card and meta description fallback.
- `featuredImage` (String): Optional. Path to the image (e.g., `/assets/image.jpg`).
- `status` (String): Must be "published". If set to "draft", the build script will ignore it.
- `seoTitle` (String): Optional. Overrides `<title>`.
- `metaDescription` (String): Optional. Overrides `<meta name="description">`.
