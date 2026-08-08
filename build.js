'use strict';

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const siteConfig = require('./site.config');
const {
  ROOT_DIR,
  listMarkdownFiles,
  loadMarkdownFile,
  publicPathForSlug,
  absoluteUrl,
  validateDocuments,
  stripLeadingArticleH1
} = require('./scripts/content-utils');

const DIST_DIR = path.join(ROOT_DIR, 'dist');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const POSTS_DIR = path.join(ROOT_DIR, 'content', 'posts');
const POST_TEMPLATE_PATH = path.join(SRC_DIR, 'templates', 'post.html');
const INSIGHTS_TEMPLATE_PATH = path.join(SRC_DIR, 'templates', 'insights.html');

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeXml(value) {
  return escapeHtml(value);
}

function replaceTokens(template, tokens, sourceName) {
  let output = template;
  for (const [name, value] of Object.entries(tokens)) {
    output = output.split(`{{${name}}}`).join(String(value ?? ''));
  }
  const unresolved = [...new Set(output.match(/{{[A-Za-z0-9_]+}}/g) || [])];
  if (unresolved.length > 0) {
    throw new Error(`${sourceName} has unresolved placeholders: ${unresolved.join(', ')}`);
  }
  return output;
}

function parseMarkdownWithShortcodes(markdown) {
  const processed = markdown
    .replace(/\[dropcap\](.*?)\[\/dropcap\]/g, '<span class="dropcap">$1</span>')
    .replace(/\[pullquote\](.*?)\[author\](.*?)\[\/pullquote\]/gs, '<div class="pull-quote"><blockquote>$1</blockquote><div class="attr">— $2</div></div>')
    .replace(/\[pullquote\](.*?)\[\/pullquote\]/gs, '<div class="pull-quote"><blockquote>$1</blockquote></div>')
    .replace(/\[keyterm\](.*?)\[def\](.*?)\[\/keyterm\]/gs, '<div class="key-term"><div class="label">Key Term</div><div class="term">$1</div><p class="definition">$2</p></div>')
    .replace(/\[diagram\](.*?)\[\/diagram\]/gs, `<div class="diagram"><div class="label">A Reader's Diagram</div><h4>$1</h4><svg width="100%" height="160" viewBox="0 0 560 160" fill="none" role="img" aria-label="Conceptual diagram blueprint" style="background:#FDFDFD; border:1px solid #E8DFC9;"><rect x="40" y="30" width="200" height="100" stroke="#A88752" stroke-dasharray="4"/><text x="140" y="85" text-anchor="middle" font-family="Playfair Display" font-size="16" fill="#0C1A2C">Diagram Blueprint</text><line x1="240" y1="80" x2="320" y2="80" stroke="#A88752" stroke-width="1.5"/><rect x="320" y="30" width="200" height="100" stroke="#A88752" stroke-dasharray="4"/></svg></div>`)
    .replace(/^## (.*?)$/gm, '<h2><span class="num">§</span> $1</h2>');
  return marked.parse(processed);
}

function formatDate(dateString) {
  if (!dateString) return '';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(`${dateString}T00:00:00Z`));
}

function imageUrl(imagePath) {
  return imagePath ? absoluteUrl(imagePath) : '';
}

function renderImageMeta(propertyName, imagePath) {
  if (!imagePath) return '';
  const attribute = propertyName.startsWith('og:') ? 'property' : 'name';
  return `<meta ${attribute}="${propertyName}" content="${escapeHtml(imageUrl(imagePath))}" />`;
}

function renderArticleTagMeta(tags) {
  return tags.map((tag) => `<meta property="article:tag" content="${escapeHtml(tag)}" />`).join('\n');
}

function renderHero(post) {
  if (!post.featuredImage) return '';
  const caption = post.featuredImageCaption
    ? `<figcaption class="cap">${escapeHtml(post.featuredImageCaption)}</figcaption>`
    : '';
  return `
<section class="article-hero">
  <div class="inner">
    <figure class="photo-slot light photo-illus">
      <img src="${escapeHtml(post.featuredImage)}" alt="${escapeHtml(post.featuredImageAlt)}" />
      ${caption}
    </figure>
  </div>
</section>`;
}

function renderTags(tags) {
  if (!tags.length) return '';
  return `<div class="tags">${tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div>`;
}

function renderPostNavigation(post, posts) {
  const index = posts.findIndex((item) => item.slug === post.slug);
  if (index === -1 || posts.length < 2) return '';
  const newer = index > 0 ? posts[index - 1] : null;
  const older = index < posts.length - 1 ? posts[index + 1] : null;
  const card = (label, item, extraClass = '') => item ? `
    <a class="pn-card ${extraClass}" href="${escapeHtml(publicPathForSlug(item.slug))}">
      <div class="pn-label">${label}</div>
      <div class="pn-cat">${escapeHtml(item.category)}</div>
      <h4>${escapeHtml(item.title)}</h4>
    </a>` : '';
  return `<div class="prev-next">${card('Newer essay', newer)}${card('Older essay', older, 'next')}</div>`;
}

function renderRelatedPosts(post, posts) {
  const related = posts.filter((item) => item.slug !== post.slug && item.category === post.category).slice(0, 3);
  if (!related.length) return '';
  return `
<section class="related">
  <div class="head">
    <h2>Related essays</h2>
    <a class="btn btn-gold" href="/insights">Browse all essays <span>→</span></a>
  </div>
  <div class="grid">
    ${related.map((item) => `<a class="card" href="${escapeHtml(publicPathForSlug(item.slug))}"><div class="cat">${escapeHtml(item.category)}</div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.excerpt)}</p></a>`).join('\n')}
  </div>
</section>`;
}

function buildJsonLd(post, canonicalUrl, socialImagePath) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl
    },
    headline: post.seoTitle,
    description: post.metaDescription,
    author: {
      '@type': 'Person',
      name: post.author,
      url: absoluteUrl(siteConfig.authorPath)
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.publisherName,
      logo: {
        '@type': 'ImageObject',
        url: imageUrl(siteConfig.defaultSocialImage)
      }
    }
  };
  if (post.date) schema.datePublished = post.date;
  if (socialImagePath) schema.image = imageUrl(socialImagePath);
  if (post.category) schema.articleSection = post.category;
  if (post.tags.length) schema.keywords = post.tags.join(', ');
  return JSON.stringify(schema, null, 2).replace(/</g, '\\u003c');
}

function renderPostPage(document, posts, template, essayNumber, options = {}) {
  const post = document.data;
  const isPreview = options.mode === 'preview';
  const canonicalUrl = absoluteUrl(publicPathForSlug(post.slug));
  const socialImagePath = post.featuredImage || siteConfig.defaultSocialImage;
  const bodyMarkdown = stripLeadingArticleH1(document.content, post.title);
  const body = parseMarkdownWithShortcodes(bodyMarkdown);
  const wordCount = bodyMarkdown.trim() ? bodyMarkdown.trim().split(/\s+/).length : 0;

  return replaceTokens(template, {
    documentTitle: escapeHtml(`${post.seoTitle} — ${siteConfig.siteName}`),
    metaDescription: escapeHtml(post.metaDescription),
    robotsDirective: isPreview ? 'noindex,nofollow' : 'index, follow',
    canonicalLink: isPreview ? '' : `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`,
    ogUrlMeta: isPreview ? '' : `<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`,
    seoTitle: escapeHtml(post.seoTitle),
    ogImageMeta: renderImageMeta('og:image', socialImagePath),
    twitterImageMeta: renderImageMeta('twitter:image', socialImagePath),
    articlePublishedTimeMeta: post.date ? `<meta property="article:published_time" content="${escapeHtml(post.date)}" />` : '',
    articleSectionMeta: post.category ? `<meta property="article:section" content="${escapeHtml(post.category)}" />` : '',
    articleTagMeta: renderArticleTagMeta(post.tags),
    jsonLdScript: isPreview ? '' : `<script type="application/ld+json">\n${buildJsonLd(post, canonicalUrl, socialImagePath)}\n</script>`,
    title: escapeHtml(post.title),
    subtitle: escapeHtml(post.subtitle),
    author: escapeHtml(post.author),
    category: escapeHtml(post.category),
    essayNumber: String(essayNumber).padStart(2, '0'),
    readingTime: escapeHtml(post.readingTime),
    wordCount: wordCount.toLocaleString('en-US'),
    dateDisplayHtml: post.date ? `<span>${escapeHtml(formatDate(post.date))}</span>` : '',
    heroHtml: renderHero(post),
    body,
    tagsHtml: renderTags(post.tags),
    postNavigationHtml: renderPostNavigation(post, posts),
    relatedPostsHtml: renderRelatedPosts(post, posts),
    siteName: escapeHtml(siteConfig.siteName)
  }, 'src/templates/post.html');
}

function renderPostImage(post, className = 'photo-slot light photo-illus') {
  if (!post.featuredImage) return `<div class="${className}" aria-hidden="true"></div>`;
  return `<div class="${className}"><img src="${escapeHtml(post.featuredImage)}" alt="${escapeHtml(post.featuredImageAlt)}" loading="lazy" /></div>`;
}

function renderFeaturedPost(post) {
  if (!post) return '';
  return `
<section class="featured-essay">
  <div class="inner">
    <a href="${escapeHtml(publicPathForSlug(post.slug))}" aria-label="Read ${escapeHtml(post.title)}">
      ${renderPostImage(post)}
    </a>
    <div class="text">
      <div class="badge">Featured Essay</div>
      <h2>${escapeHtml(post.title)}</h2>
      <div class="meta"><span>${escapeHtml(post.category)}</span><span class="dot"></span><span>${escapeHtml(post.readingTime)}</span></div>
      <p class="excerpt">${escapeHtml(post.excerpt)}</p>
      <a class="btn btn-primary" href="${escapeHtml(publicPathForSlug(post.slug))}">Read the Essay <span>→</span></a>
    </div>
  </div>
</section>`;
}

function renderPostCards(posts) {
  return posts.map((post, index) => `
  <article class="essay-card" data-category="${escapeHtml(post.category.toLowerCase())}">
    <a href="${escapeHtml(publicPathForSlug(post.slug))}" aria-label="Read ${escapeHtml(post.title)}">
      ${renderPostImage(post)}
    </a>
    <div class="body">
      <div class="meta-row"><span class="cat">${escapeHtml(post.category)}</span><span class="num">N.º ${String(posts.length - index).padStart(2, '0')}</span></div>
      <h3><a href="${escapeHtml(publicPathForSlug(post.slug))}">${escapeHtml(post.title)}</a></h3>
      <p>${escapeHtml(post.excerpt)}</p>
      <div class="card-foot"><span class="time">${escapeHtml(post.readingTime)}</span><a class="read" href="${escapeHtml(publicPathForSlug(post.slug))}">Read →</a></div>
    </div>
  </article>`).join('\n');
}

function renderCategoryFilters(posts) {
  const categories = [...new Set([
    ...siteConfig.contentCategories,
    ...posts.map((post) => post.category),
    ...siteConfig.legacyCategories
  ])];
  return ['All', ...categories].map((category, index) => `<button type="button" class="cat${index === 0 ? ' on' : ''}">${escapeHtml(category)}</button>`).join('\n');
}

function renderInsightsPage(posts, template) {
  const socialImageUrl = imageUrl(siteConfig.defaultSocialImage);
  return replaceTokens(template, {
    siteName: escapeHtml(siteConfig.siteName),
    insightsUrl: escapeHtml(absoluteUrl('/insights')),
    defaultSocialImageUrl: escapeHtml(socialImageUrl),
    categoryFilters: renderCategoryFilters(posts),
    featuredPostHtml: renderFeaturedPost(posts[0]),
    postsGrid: renderPostCards(posts),
    postCount: String(posts.length)
  }, 'src/templates/insights.html');
}

function renderIndexPage(template) {
  return replaceTokens(template, {
    homeUrl: escapeHtml(absoluteUrl('/')),
    defaultSocialImageUrl: escapeHtml(imageUrl(siteConfig.defaultSocialImage))
  }, 'src/index.html');
}

function copyRecursiveSync(source, destination) {
  const stats = fs.statSync(source);
  if (stats.isDirectory()) {
    fs.mkdirSync(destination, { recursive: true });
    for (const item of fs.readdirSync(source)) {
      copyRecursiveSync(path.join(source, item), path.join(destination, item));
    }
  } else {
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(source, destination);
  }
}

function generateSitemap(posts) {
  const entries = [
    { url: absoluteUrl('/') },
    { url: absoluteUrl('/insights') },
    ...posts.map((post) => ({ url: absoluteUrl(publicPathForSlug(post.slug)), lastmod: post.date }))
  ];
  const urls = entries.map((entry) => `  <url>\n    <loc>${escapeXml(entry.url)}</loc>${entry.lastmod ? `\n    <lastmod>${escapeXml(entry.lastmod)}</lastmod>` : ''}\n  </url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function generateRobots() {
  return `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl('/sitemap.xml')}\n`;
}

function loadPublishedDocuments() {
  const documents = listMarkdownFiles(POSTS_DIR).map(loadMarkdownFile);
  const validation = validateDocuments(documents);
  for (const warning of validation.warnings) console.warn(`Warning: ${warning}`);
  if (validation.errors.length) throw new Error(`Content validation failed:\n- ${validation.errors.join('\n- ')}`);
  return documents.filter((document) => document.data.status === 'published');
}

function buildSite() {
  const documents = loadPublishedDocuments();
  documents.sort((a, b) => new Date(b.data.date) - new Date(a.data.date));
  const posts = documents.map((document) => document.data);

  const postTemplate = fs.readFileSync(POST_TEMPLATE_PATH, 'utf8');
  const insightsTemplate = fs.readFileSync(INSIGHTS_TEMPLATE_PATH, 'utf8');
  const indexTemplate = fs.readFileSync(path.join(SRC_DIR, 'index.html'), 'utf8');

  const resolvedDist = path.resolve(DIST_DIR);
  if (resolvedDist !== path.join(ROOT_DIR, 'dist')) throw new Error(`Unsafe dist path: ${resolvedDist}`);
  if (fs.existsSync(resolvedDist)) fs.rmSync(resolvedDist, { recursive: true, force: true });
  fs.mkdirSync(resolvedDist, { recursive: true });

  copyRecursiveSync(path.join(SRC_DIR, 'assets'), path.join(resolvedDist, 'assets'));
  copyRecursiveSync(path.join(SRC_DIR, 'shared'), path.join(resolvedDist, 'shared'));
  fs.copyFileSync(path.join(SRC_DIR, '404.html'), path.join(resolvedDist, '404.html'));
  fs.writeFileSync(path.join(resolvedDist, 'index.html'), renderIndexPage(indexTemplate));

  documents.forEach((document, index) => {
    const html = renderPostPage(document, posts, postTemplate, posts.length - index);
    fs.writeFileSync(path.join(resolvedDist, `${document.data.slug}.html`), html);
  });

  fs.writeFileSync(path.join(resolvedDist, 'insights.html'), renderInsightsPage(posts, insightsTemplate));
  fs.writeFileSync(path.join(resolvedDist, 'sitemap.xml'), generateSitemap(posts));
  fs.writeFileSync(path.join(resolvedDist, 'robots.txt'), generateRobots());

  console.log(`Build complete. Generated ${posts.length} published post(s), sitemap.xml, and robots.txt.`);
  return { posts, outputDirectory: resolvedDist };
}

if (require.main === module) {
  try {
    buildSite();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  buildSite,
  renderPostPage,
  renderInsightsPage,
  generateSitemap,
  generateRobots,
  copyRecursiveSync,
  parseMarkdownWithShortcodes
};
