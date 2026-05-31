#!/usr/bin/env python3
"""Publish approved Eliana blog packages into the static website.

Workflow:
1. Editorial team saves a JSON package under content/blog/.
2. Human approval flips `approved` to true and `status` to "approved".
3. This script generates article HTML, updates insights.html, sitemap.xml, rss.xml,
   and publication registry data.
4. Commit/push to GitHub; Vercel deploys the static site.

No secrets are required by this script.
"""
from __future__ import annotations

import argparse
import datetime as dt
import html
import json
import re
import sys
from dataclasses import dataclass
from email.utils import format_datetime
from pathlib import Path
from typing import Any, NoReturn
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]
CONTENT_DIR = ROOT / "content" / "blog"
DATA_DIR = ROOT / "data"
REGISTRY_PATH = DATA_DIR / "published-posts.json"
INSIGHTS_PATH = ROOT / "insights.html"
SITEMAP_PATH = ROOT / "sitemap.xml"
RSS_PATH = ROOT / "rss.xml"
SITE_URL_DEFAULT = "https://www.luminasmart.company"
GENERATED_START = "<!-- AUTO-PUBLISHED POSTS:START -->"
GENERATED_END = "<!-- AUTO-PUBLISHED POSTS:END -->"


@dataclass
class Post:
    source: Path
    slug: str
    title: str
    subtitle: str
    excerpt: str
    category: str
    tags: list[str]
    language: str
    read_time: str
    published_date: str
    seo_title: str
    meta_description: str
    hero_image: str
    hero_caption: str
    body_markdown: str
    approved_by: str
    approved_at: str
    author: str = "Eliana Faria Lima"

    @property
    def filename(self) -> str:
        return f"{self.slug}.html"

    @property
    def path(self) -> Path:
        return ROOT / self.filename


def die(message: str) -> NoReturn:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = re.sub(r"-+", "-", value).strip("-")
    return value or "untitled"


def read_json(path: Path) -> dict[str, Any]:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        die(f"Invalid JSON in {path}: {exc}")


def load_approved_posts(paths: list[Path] | None = None) -> list[Post]:
    if paths:
        files = paths
    else:
        files = sorted(CONTENT_DIR.glob("*.json")) if CONTENT_DIR.exists() else []

    posts: list[Post] = []
    for path in files:
        data = read_json(path)
        approved = data.get("approved") is True and data.get("status") == "approved"
        if not approved:
            print(f"Skipping {path.relative_to(ROOT)}: not approved")
            continue

        required = [
            "title",
            "excerpt",
            "category",
            "published_date",
            "body_markdown",
            "approved_by",
            "approved_at",
        ]
        missing = [key for key in required if not str(data.get(key, "")).strip()]
        if missing:
            die(f"Approved post {path} is missing required fields: {', '.join(missing)}")

        slug = slugify(str(data.get("slug") or data["title"]))
        tags = data.get("tags") or []
        if not isinstance(tags, list):
            die(f"{path}: tags must be a list")

        posts.append(
            Post(
                source=path,
                slug=slug,
                title=str(data["title"]).strip(),
                subtitle=str(data.get("subtitle") or data["excerpt"]).strip(),
                excerpt=str(data["excerpt"]).strip(),
                category=str(data["category"]).strip(),
                tags=[str(tag).strip() for tag in tags if str(tag).strip()],
                language=str(data.get("language") or "en").strip(),
                read_time=str(data.get("read_time") or estimate_read_time(str(data["body_markdown"]))).strip(),
                published_date=str(data["published_date"]).strip(),
                seo_title=str(data.get("seo_title") or data["title"]).strip(),
                meta_description=str(data.get("meta_description") or data["excerpt"]).strip(),
                hero_image=str(data.get("hero_image") or "assets/eliana-portrait.jpeg").strip(),
                hero_caption=str(data.get("hero_caption") or data["excerpt"]).strip(),
                body_markdown=str(data["body_markdown"]).strip(),
                approved_by=str(data["approved_by"]).strip(),
                approved_at=str(data["approved_at"]).strip(),
                author=str(data.get("author") or "Eliana Faria Lima").strip(),
            )
        )
    return sorted(posts, key=lambda p: (p.published_date, p.slug), reverse=True)


def estimate_read_time(markdown: str) -> str:
    words = re.findall(r"\w+", markdown)
    minutes = max(1, round(len(words) / 220))
    return f"{minutes} min read"


def iso_date(value: str) -> str:
    try:
        return dt.date.fromisoformat(value[:10]).isoformat()
    except ValueError:
        die(f"Invalid published_date {value!r}; use YYYY-MM-DD")


def pretty_date(value: str) -> str:
    date = dt.date.fromisoformat(iso_date(value))
    return date.strftime("%B %d, %Y")


def escape_attr(value: str) -> str:
    return html.escape(value, quote=True)


def render_inline_markdown(text: str) -> str:
    escaped = html.escape(text)
    escaped = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", escaped)
    escaped = re.sub(r"\*(.+?)\*", r"<em>\1</em>", escaped)
    return escaped


def markdown_to_html(markdown: str) -> str:
    lines = markdown.splitlines()
    blocks: list[str] = []
    para: list[str] = []
    list_items: list[str] = []

    def flush_para() -> None:
        nonlocal para
        if para:
            text = " ".join(part.strip() for part in para).strip()
            cls = ' class="lede"' if not any(b.startswith("<p") for b in blocks) else ""
            if cls:
                first = text[:1]
                rest = text[1:]
                text_html = render_inline_markdown(first + rest)
            else:
                text_html = render_inline_markdown(text)
            blocks.append(f"    <p{cls}>{text_html}</p>")
            para = []

    def flush_list() -> None:
        nonlocal list_items
        if list_items:
            blocks.append("    <ol class=\"numbered-list\">\n" + "\n".join(list_items) + "\n    </ol>")
            list_items = []

    for raw in lines:
        line = raw.rstrip()
        stripped = line.strip()
        if not stripped:
            flush_para()
            flush_list()
            continue
        if stripped.startswith("## "):
            flush_para(); flush_list()
            blocks.append(f"    <h2>{render_inline_markdown(stripped[3:].strip())}</h2>")
            continue
        if stripped.startswith("> "):
            flush_para(); flush_list()
            quote_text = render_inline_markdown(stripped[2:].strip())
            blocks.append(f"    <div class=\"pull-quote\"><blockquote>{quote_text}</blockquote></div>")
            continue
        ordered = re.match(r"^\d+\.\s+(.+)$", stripped)
        if ordered:
            flush_para()
            list_items.append(f"      <li>{render_inline_markdown(ordered.group(1))}</li>")
            continue
        para.append(stripped)
    flush_para(); flush_list()
    return "\n\n".join(blocks)


def render_article(post: Post, site_url: str) -> str:
    published = iso_date(post.published_date)
    tags_meta = ", ".join(post.tags)
    tags_html = "\n".join(f'        <span class="tag">{html.escape(tag)}</span>' for tag in post.tags)
    body_html = markdown_to_html(post.body_markdown)
    canonical = f"{site_url}/{post.filename}"
    hero_style = ""
    if post.hero_image:
        hero_style = f" style=\"background-image: url('{escape_attr(post.hero_image)}'); background-size: cover; background-position: center;\""

    return f"""<!DOCTYPE html>
<html lang="{escape_attr(post.language)}">
<head>
<meta charset="UTF-8" />
<title>{html.escape(post.seo_title)} — How Public Money Works</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="description" content="{escape_attr(post.meta_description)}" />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="{escape_attr(canonical)}" />
<meta property="og:type" content="article" />
<meta property="og:url" content="{escape_attr(canonical)}" />
<meta property="og:title" content="{escape_attr(post.title)}" />
<meta property="og:description" content="{escape_attr(post.meta_description)}" />
<meta property="og:image" content="{escape_attr(site_url + '/' + post.hero_image.lstrip('/'))}" />
<meta property="og:site_name" content="How Public Money Works" />
<meta property="og:locale" content="en_US" />
<meta property="article:author" content="{escape_attr(post.author)}" />
<meta property="article:published_time" content="{escape_attr(published)}" />
<meta property="article:section" content="{escape_attr(post.category)}" />
<meta property="article:tag" content="{escape_attr(tags_meta)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="{escape_attr(post.title)}" />
<meta name="twitter:description" content="{escape_attr(post.meta_description)}" />
<meta name="twitter:image" content="{escape_attr(site_url + '/' + post.hero_image.lstrip('/'))}" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="shared/base.css" />
<style>
  body {{ background: #FBF7EC; color: #1A1F2E; }}
  .nav.civic {{ background: rgba(251,247,236,0.94); padding: 20px 64px; border-bottom: 1px solid #E8DFC9; }}
  .breadcrumb {{ border-bottom: 1px solid #E8DFC9; padding: 14px 0; background: #FBF7EC; font-family: var(--font-ui); font-size: 10.5px; letter-spacing: 0.32em; text-transform: uppercase; color: var(--muted); }}
  .breadcrumb .inner {{ max-width: 1320px; margin: 0 auto; padding: 0 64px; display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }}
  .breadcrumb a {{ color: var(--muted); }} .breadcrumb .sep {{ color: var(--gold-deep); }} .breadcrumb .here {{ color: var(--ink); font-weight: 600; }}
  .article-header {{ padding: 80px 0 60px; background: #FBF7EC; border-bottom: 1px solid #E8DFC9; }}
  .article-header .inner, .article-body .inner {{ max-width: 760px; margin: 0 auto; padding: 0 64px; }}
  .article-header .meta {{ display: flex; align-items: center; gap: 16px; font-family: var(--font-ui); font-size: 10.5px; letter-spacing: 0.36em; text-transform: uppercase; margin-bottom: 36px; flex-wrap: wrap; }}
  .article-header .meta .cat {{ color: var(--gold-deep); font-weight: 600; }}
  .article-header .meta .sep {{ width: 3px; height: 3px; background: var(--gold); border-radius: 50%; }}
  .article-header h1 {{ font-family: var(--font-display); font-size: clamp(36px, 4.5vw, 64px); line-height: 1.05; color: #0C1A2C; font-weight: 500; letter-spacing: -0.018em; margin-bottom: 22px; }}
  .article-header .subtitle {{ font-family: var(--font-editorial); font-style: italic; font-size: clamp(17px, 1.8vw, 22px); line-height: 1.45; color: var(--ink-soft); margin-bottom: 38px; max-width: 720px; }}
  .byline {{ display: flex; align-items: center; gap: 20px; padding-top: 28px; border-top: 1px solid #E8DFC9; }}
  .byline-avatar, .a-avatar {{ width: 52px; height: 52px; border-radius: 50%; background-image: url('assets/eliana-portrait.jpeg'); background-size: cover; background-position: 50% 30%; border: 1px solid #D8D2C2; flex: 0 0 auto; }}
  .byline-info .by, .article-foot .label {{ font-family: var(--font-ui); font-size: 10px; letter-spacing: 0.34em; text-transform: uppercase; color: var(--muted); margin-bottom: 4px; font-weight: 500; }}
  .byline-info .name, .article-foot .name {{ font-family: var(--font-display); font-size: 18px; color: #0C1A2C; font-weight: 500; }}
  .byline-info .role {{ font-family: var(--font-editorial); font-style: italic; font-size: 13.5px; color: var(--muted); }}
  .article-hero {{ background: #FBF7EC; padding: 60px 0 0; }} .article-hero .inner {{ max-width: 1200px; margin: 0 auto; padding: 0 64px; }}
  .article-hero .photo-slot {{ height: 540px; }} .article-hero .cap {{ font-family: var(--font-editorial); font-style: italic; font-size: 13.5px; color: var(--muted); margin-top: 16px; text-align: center; }}
  .article-body {{ padding: 80px 0 100px; background: #FBF7EC; }}
  .article-body p, .article-body li {{ font-family: var(--font-editorial); font-size: 19px; line-height: 1.65; color: #14192A; }}
  .article-body p {{ margin-bottom: 1.4em; }} .article-body p.lede {{ font-size: 24px; line-height: 1.45; color: #0C1A2C; margin-bottom: 36px; }}
  .article-body h2 {{ font-family: var(--font-display); font-size: 34px; line-height: 1.15; color: #0C1A2C; font-weight: 500; margin: 54px 0 22px; }}
  .numbered-list {{ padding-left: 1.4em; margin: 0 0 32px; }} .numbered-list li {{ margin-bottom: 14px; }}
  .pull-quote {{ border-left: 2px solid var(--gold); padding: 20px 0 20px 28px; margin: 46px 0; }} .pull-quote blockquote {{ margin: 0; font-family: var(--font-display); font-style: italic; font-size: 28px; line-height: 1.25; color: #0C1A2C; }}
  .end-mark {{ width: 44px; height: 1px; background: var(--gold); margin: 54px auto 0; }}
  .article-foot {{ background: #F2EBD9; padding: 70px 0; border-top: 1px solid #E8DFC9; }} .article-foot .inner {{ max-width: 880px; margin: 0 auto; padding: 0 64px; }}
  .tags {{ display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 30px; }} .tag {{ border: 1px solid #C8C2B2; padding: 8px 12px; font-family: var(--font-ui); font-size: 10px; letter-spacing: 0.24em; text-transform: uppercase; color: var(--gold-deep); background: rgba(255,255,255,0.35); }}
  .author-block {{ display: flex; gap: 22px; align-items: flex-start; padding-top: 30px; border-top: 1px solid #D8D2C2; }} .author-block p {{ font-family: var(--font-editorial); color: var(--ink-soft); line-height: 1.6; }}
  @media (max-width: 768px) {{ .nav.civic, .article-header .inner, .article-body .inner, .article-hero .inner, .article-foot .inner, .breadcrumb .inner {{ padding-left: 24px; padding-right: 24px; }} .article-hero .photo-slot {{ height: 320px; }} .byline {{ align-items: flex-start; }} }}
</style>
</head>
<body>
<nav class="nav civic">
  <a class="brand" href="index.html"><span class="mark">ecfl</span><span class="brand-text">Eliana Faria Lima</span></a>
  <div class="links"><a href="index.html">Home</a><a href="insights.html">Insights</a><a href="index.html#contact">Contact</a></div>
</nav>
<div class="breadcrumb"><div class="inner"><a href="index.html">Home</a><span class="sep">/</span><a href="insights.html">Insights</a><span class="sep">/</span><span>{html.escape(post.category)}</span><span class="sep">/</span><span class="here">{html.escape(post.title)}</span></div></div>
<header class="article-header"><div class="inner"><div class="meta"><span class="cat">{html.escape(post.category)}</span><span class="sep"></span><span>{html.escape(pretty_date(post.published_date))}</span><span class="sep"></span><span>{html.escape(post.read_time)}</span></div><h1>{html.escape(post.title)}</h1><div class="subtitle">{html.escape(post.subtitle)}</div><div class="byline"><div class="byline-avatar"></div><div class="byline-info"><div class="by">By</div><div class="name">{html.escape(post.author)}</div><div class="role">Senior Practice, Public Finance</div></div></div></div></header>
<section class="article-hero"><div class="inner"><div class="photo-slot light photo-illus"{hero_style}><div class="cap">{html.escape(post.hero_caption)}</div></div></div></section>
<article class="article-body"><div class="inner">
{body_html}
    <div class="end-mark"></div>
</div></article>
<section class="article-foot"><div class="inner"><div class="tags">
{tags_html}
      </div><div class="author-block"><div class="a-avatar"></div><div><div class="label">About the author</div><div class="name">{html.escape(post.author)}</div><p>A senior practice in public finance, government budgeting, and health governance. Editor of <em>How Public Money Works</em>, a publication that brings plain-language clarity to the workings of American public money.</p></div></div></div></section>
<footer class="footer"><div class="inner"><div class="brand">ecfl</div><div class="links"><a href="index.html">Home</a><a href="insights.html">Insights</a></div></div></footer>
<script src="shared/main.js"></script>
</body>
</html>
"""


def render_card(post: Post, index: int) -> str:
    return f"""    <!-- Published automatically from {post.source.relative_to(ROOT)} -->
    <article class="essay-card" data-category="{escape_attr(post.category.lower())}" onclick="window.location.href='{escape_attr(post.filename)}'">
      <div class="photo-slot light photo-illus" style="background-image: url('{escape_attr(post.hero_image)}'); background-size: cover; background-position: center;"></div>
      <div class="body">
        <div class="meta-row"><span class="cat">{html.escape(post.category)}</span><span class="num">Published</span></div>
        <h3>{html.escape(post.title)}</h3>
        <p>{html.escape(post.excerpt)}</p>
        <div class="card-foot"><span class="time">{html.escape(post.read_time)}</span><span class="read">Read →</span></div>
      </div>
    </article>"""


def update_insights(posts: list[Post]) -> None:
    text = INSIGHTS_PATH.read_text(encoding="utf-8")
    generated = GENERATED_START + "\n"
    if posts:
        generated += "\n\n".join(render_card(post, i + 1) for i, post in enumerate(posts)) + "\n"
    else:
        generated += "    <!-- No approved auto-published posts yet. -->\n"
    generated += "    " + GENERATED_END

    if GENERATED_START in text and GENERATED_END in text:
        pattern = re.compile(re.escape(GENERATED_START) + r".*?" + re.escape(GENERATED_END), re.S)
        text = pattern.sub(generated, text)
    else:
        marker = "  <div class=\"grid\">\n"
        if marker not in text:
            die("Could not find insights.html essay grid")
        text = text.replace(marker, marker + generated + "\n\n", 1)
    INSIGHTS_PATH.write_text(text, encoding="utf-8")


def update_registry(posts: list[Post], site_url: str) -> None:
    DATA_DIR.mkdir(exist_ok=True)
    entries = [
        {
            "slug": post.slug,
            "title": post.title,
            "url": f"{site_url}/{post.filename}",
            "category": post.category,
            "published_date": iso_date(post.published_date),
            "source": str(post.source.relative_to(ROOT)),
            "approved_by": post.approved_by,
            "approved_at": post.approved_at,
        }
        for post in posts
    ]
    REGISTRY_PATH.write_text(json.dumps(entries, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def update_sitemap(posts: list[Post], site_url: str) -> None:
    static_pages = ["index.html", "insights.html", "article-city-budget.html"]
    today = dt.date.today().isoformat()
    urls = []
    for page in static_pages:
        loc = site_url if page == "index.html" else f"{site_url}/{page}"
        urls.append((loc, today))
    for post in posts:
        urls.append((f"{site_url}/{post.filename}", iso_date(post.published_date)))
    body = "\n".join(
        f"  <url><loc>{html.escape(loc)}</loc><lastmod>{lastmod}</lastmod></url>" for loc, lastmod in urls
    )
    SITEMAP_PATH.write_text(f"<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n{body}\n</urlset>\n", encoding="utf-8")


def update_rss(posts: list[Post], site_url: str) -> None:
    now = format_datetime(dt.datetime.now(dt.timezone.utc))
    items = []
    for post in posts[:20]:
        pub_date = dt.datetime.fromisoformat(iso_date(post.published_date)).replace(tzinfo=dt.timezone.utc)
        items.append(f"""    <item>
      <title>{html.escape(post.title)}</title>
      <link>{site_url}/{quote(post.filename)}</link>
      <guid>{site_url}/{quote(post.filename)}</guid>
      <pubDate>{format_datetime(pub_date)}</pubDate>
      <description>{html.escape(post.excerpt)}</description>
    </item>""")
    RSS_PATH.write_text(f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>How Public Money Works</title>
    <link>{site_url}/insights.html</link>
    <description>Plain-language essays on public finance by Eliana Faria Lima.</description>
    <lastBuildDate>{now}</lastBuildDate>
{chr(10).join(items)}
  </channel>
</rss>
""", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Publish approved blog JSON packages into the static site")
    parser.add_argument("packages", nargs="*", type=Path, help="Optional specific content/blog/*.json packages")
    parser.add_argument("--site-url", default=SITE_URL_DEFAULT, help="Canonical production site URL")
    parser.add_argument("--check", action="store_true", help="Validate packages only; do not write files")
    args = parser.parse_args()

    package_paths = [p if p.is_absolute() else ROOT / p for p in args.packages] or None
    posts = load_approved_posts(package_paths)
    if args.check:
        print(f"Approved packages ready: {len(posts)}")
        for post in posts:
            print(f"- {post.slug}: {post.title}")
        return

    for post in posts:
        post.path.write_text(render_article(post, args.site_url.rstrip("/")), encoding="utf-8")
        print(f"Generated {post.path.relative_to(ROOT)}")
    update_insights(posts)
    update_registry(posts, args.site_url.rstrip("/"))
    update_sitemap(posts, args.site_url.rstrip("/"))
    update_rss(posts, args.site_url.rstrip("/"))
    print(f"Published {len(posts)} approved post(s).")


if __name__ == "__main__":
    main()
