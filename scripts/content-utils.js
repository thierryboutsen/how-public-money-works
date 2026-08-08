'use strict';

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const siteConfig = require('../site.config');

const ROOT_DIR = path.resolve(__dirname, '..');
const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const NON_CONTENT_MARKDOWN = new Set(['README.md', 'brief-template.md']);

function listMarkdownFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory)
    .filter((file) => path.extname(file).toLowerCase() === '.md' && !NON_CONTENT_MARKDOWN.has(file))
    .map((file) => path.join(directory, file));
}

function loadMarkdownFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = matter(raw);
  const data = { ...parsed.data };
  data.slug = data.slug || path.basename(filePath, '.md');
  data.author = data.author || siteConfig.defaultAuthor;
  data.seoTitle = data.seoTitle || data.title;
  data.metaDescription = data.metaDescription || data.excerpt;
  data.tags = Array.isArray(data.tags) ? data.tags : [];
  return {
    filePath: path.resolve(filePath),
    relativePath: path.relative(ROOT_DIR, filePath).replace(/\\/g, '/'),
    data,
    content: parsed.content
  };
}

function isValidDate(value) {
  if (typeof value !== 'string' || !DATE_ONLY.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function publicPathForSlug(slug) {
  return `/${slug}`;
}

function absoluteUrl(publicPath) {
  return new URL(publicPath, `${siteConfig.siteOrigin}/`).toString();
}

function sourceAssetPath(publicPath) {
  if (!publicPath || typeof publicPath !== 'string' || !publicPath.startsWith('/assets/')) return null;
  return path.join(ROOT_DIR, 'src', publicPath.replace(/^\//, ''));
}

function extractInternalLinks(markdown) {
  const links = [];
  const pattern = /\[[^\]]*\]\((\/[^)\s]+)(?:\s+["'][^"']*["'])?\)/g;
  let match;
  while ((match = pattern.exec(markdown)) !== null) links.push(match[1]);
  return links;
}

function normalizeInternalRoute(link) {
  const withoutFragment = link.split('#')[0].split('?')[0];
  if (!withoutFragment) return '/';
  if (withoutFragment === '/index.html' || withoutFragment === '/index') return '/';
  if (withoutFragment === '/insights.html') return '/insights';
  return withoutFragment.replace(/\.html$/, '').replace(/\/$/, '') || '/';
}

function validateDocuments(documents, options = {}) {
  const errors = [];
  const warnings = [];
  const allowedCategories = new Set([...siteConfig.contentCategories, ...siteConfig.legacyCategories]);
  const knownRoutes = new Set([
    '/',
    '/insights',
    ...documents
      .filter((doc) => doc.data.status === 'published')
      .map((doc) => publicPathForSlug(doc.data.slug))
  ]);
  const slugOwners = new Map();
  const titleOwners = new Map();
  const angleOwners = new Map();

  function error(doc, message) {
    errors.push(`${doc.relativePath}: ${message}`);
  }

  function warning(doc, message) {
    warnings.push(`${doc.relativePath}: ${message}`);
  }

  for (const doc of documents) {
    const { data } = doc;
    const required = ['title', 'subtitle', 'slug', 'category', 'readingTime', 'excerpt', 'seoTitle', 'metaDescription'];
    for (const field of required) {
      if (typeof data[field] !== 'string' || !data[field].trim()) error(doc, `missing required field: ${field}`);
    }

    if (!SAFE_SLUG.test(data.slug || '')) error(doc, `unsafe slug: ${JSON.stringify(data.slug)}`);
    if (!siteConfig.publicationStatuses.includes(data.status)) error(doc, `invalid status: ${JSON.stringify(data.status)}`);
    if (!allowedCategories.has(data.category)) error(doc, `unsupported category: ${JSON.stringify(data.category)}`);
    if (!data.author) error(doc, 'author is missing and no default author is configured');

    if (data.date !== undefined && !isValidDate(data.date)) error(doc, `invalid date; expected YYYY-MM-DD: ${JSON.stringify(data.date)}`);
    if (data.status === 'published' && !isValidDate(data.date)) error(doc, 'published content requires a valid date');

    if (data.featuredImage) {
      const assetPath = sourceAssetPath(data.featuredImage);
      if (!assetPath) error(doc, 'featuredImage must use an /assets/... path');
      else if (!fs.existsSync(assetPath)) error(doc, `featuredImage does not exist: ${data.featuredImage}`);
      if (typeof data.featuredImageAlt !== 'string' || !data.featuredImageAlt.trim()) {
        error(doc, 'featuredImageAlt is required when featuredImage is set');
      }
    }

    const isLegacyPublished = data.status === 'published' && siteConfig.legacyPublishedSlugs.includes(data.slug);
    if (data.status === 'published' && !isLegacyPublished) {
      if (data.humanDraftApproval !== 'approved') error(doc, 'published content requires humanDraftApproval: approved');
      if (data.publicationApproval !== 'approved') error(doc, 'published content requires publicationApproval: approved');
      if (data.publishAllowed !== true) error(doc, 'published content requires publishAllowed: true');
      if (data.canonicalDecision !== 'approved') error(doc, 'published content requires canonicalDecision: approved');
      if (data.slugDecision !== 'approved') error(doc, 'published content requires slugDecision: approved');
      if (data.lifecycleStatus !== 'published') error(doc, 'published content requires lifecycleStatus: published');
    } else if (isLegacyPublished && (
      data.humanDraftApproval !== 'approved' ||
      data.publicationApproval !== 'approved' ||
      data.publishAllowed !== true ||
      data.canonicalDecision !== 'approved' ||
      data.slugDecision !== 'approved' ||
      data.lifecycleStatus !== 'published'
    )) {
      warning(doc, 'legacy published article is grandfathered; new publications must satisfy all publication gates');
    }

    if (doc.relativePath.startsWith('content/review/') && data.status === 'published') {
      error(doc, 'review content must not use status: published');
    }

    for (const link of extractInternalLinks(doc.content)) {
      const route = normalizeInternalRoute(link);
      if (!knownRoutes.has(route)) error(doc, `internal link does not match a known route: ${link}`);
    }

    const duplicateFields = [
      ['slug', data.slug, slugOwners],
      ['title', data.title && data.title.trim().toLowerCase(), titleOwners],
      ['topicAngleSignature', data.topicAngleSignature, angleOwners]
    ];
    for (const [field, value, owners] of duplicateFields) {
      if (!value) continue;
      if (owners.has(value)) error(doc, `duplicate ${field} with ${owners.get(value)}`);
      else owners.set(value, doc.relativePath);
    }

    if (doc.content.match(/^#\s+/gm)?.length > 1) warning(doc, 'body contains more than one H1; rendered articles use the template H1');
  }

  if (options.requireReviewApproval) {
    for (const doc of documents.filter((item) => item.relativePath.startsWith('content/review/'))) {
      if (doc.data.humanDraftApproval !== 'approved') error(doc, 'preview requires humanDraftApproval: approved');
    }
  }

  return { errors, warnings };
}

function stripLeadingArticleH1(markdown, title) {
  const lines = markdown.replace(/^\uFEFF/, '').split(/\r?\n/);
  const firstContentIndex = lines.findIndex((line) => line.trim() !== '');
  if (firstContentIndex === -1) return markdown;
  const match = lines[firstContentIndex].match(/^#\s+(.+?)\s*$/);
  if (match && match[1].trim() === title.trim()) {
    lines.splice(firstContentIndex, 1);
    if (lines[firstContentIndex] === '') lines.splice(firstContentIndex, 1);
  }
  return lines.join('\n');
}

module.exports = {
  ROOT_DIR,
  SAFE_SLUG,
  DATE_ONLY,
  listMarkdownFiles,
  loadMarkdownFile,
  isValidDate,
  publicPathForSlug,
  absoluteUrl,
  sourceAssetPath,
  extractInternalLinks,
  normalizeInternalRoute,
  validateDocuments,
  stripLeadingArticleH1
};
