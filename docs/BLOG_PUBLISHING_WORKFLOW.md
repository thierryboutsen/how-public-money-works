# Blog Publishing Workflow

This document explains how to publish new content to the "How Public Money Works" blog on the Lumina Smart Strategies website.

The site uses a custom Static Site Generator (SSG). Posts are stored as Markdown (`.md`) files in the `/content/posts/` directory.

## 1. Manual Publishing (For Eliana / Editors)

To write a new article manually without touching code:

1. Open the file `tools/admin-editor.html` directly in your browser. (Do not upload this file to the public server).
2. Fill out the form with your Title, Category, Reading Time, and Article Body.
3. Use the live preview to verify the layout and typography.
4. Click **"Export Markdown Post"**.
5. Click **"Download .md File"**.
6. Send the downloaded `.md` file to your developer or upload it directly to the `/content/posts/` folder in the project repository.

## 2. Publishing as a Developer

If you have the `.md` file:
1. Place the `.md` file inside the `content/posts/` directory.
2. Ensure the filename matches the slug (e.g., `my-new-post.md`).
3. Commit the file and push to the `main` branch.
4. Vercel will automatically trigger a build (`npm run build`) and the new post will be live.

## 3. Automated Publishing (Integration)

Because the site is generated from files, it is fully compatible with automations (like Zapier, Make, or AI generators):
1. Configure your external system to generate a Markdown file following the schema in `CONTENT_SCHEMA.md`.
2. Use the GitHub API to commit the new `.md` file to the `content/posts/` folder in the repository.
3. Vercel automatically deploys the new content.

## 4. Required Fields & Schema

Always ensure your post has the correct Frontmatter block at the top. See `CONTENT_SCHEMA.md` for a full list of required fields.
- **Slug**: Must be URL friendly (e.g. `my-new-article`).
- **Date**: Must be `YYYY-MM-DD`.

## 5. Adding Images

1. Place your image (e.g., `hero-tax.jpg`) in the `/src/assets/` folder.
2. In your Markdown Frontmatter, reference it exactly as: `featuredImage: "/assets/hero-tax.jpg"`.

## 6. SEO

The build script automatically handles:
- `<title>` and `<meta name="description">`
- `Open Graph` (og:image, og:title) for LinkedIn/Facebook sharing.
- `Twitter Cards`
- `Schema.org` structured data for Articles.

To optimize SEO, write a compelling `seoTitle` and `metaDescription` in the frontmatter.

## 7. Security Notes
- **Never publish `/tools/admin-editor.html` to Vercel/Production.** The `/tools` directory is excluded from the build output (`/dist`).
- There are no hardcoded passwords in the site source code.
- Always keep English and Portuguese content separated by categories or URL structures. Do not mix languages in the same `.md` file unless explicitly intended.
