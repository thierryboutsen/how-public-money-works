'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const YAML = require('yaml');
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
  const parsed = parseMarkdownFrontmatter(raw, filePath);
  const data = { ...parsed.data };
  data.slug = data.slug || path.basename(filePath, '.md');
  data.author = data.author || siteConfig.defaultAuthor;
  data.seoTitle = data.seoTitle || data.title;
  data.metaDescription = data.metaDescription || data.excerpt;
  data.tags = Array.isArray(data.tags) ? data.tags : [];
  data.language = data.language || data.publicLanguage || siteConfig.defaultLanguage;
  data.translations = data.translations && typeof data.translations === 'object' && !Array.isArray(data.translations)
    ? data.translations
    : {};
  return {
    filePath: path.resolve(filePath),
    relativePath: path.relative(ROOT_DIR, filePath).replace(/\\/g, '/'),
    data,
    content: parsed.content
  };
}

function parseMarkdownFrontmatter(raw, filePath = '<markdown>') {
  const text = raw.replace(/^\uFEFF/, '');
  const lines = text.split(/\r?\n/);
  if (lines[0]?.trim() !== '---') throw new Error(`${filePath}: missing opening YAML frontmatter delimiter`);
  const closingIndex = lines.findIndex((line, index) => index > 0 && line.trim() === '---');
  if (closingIndex < 0) throw new Error(`${filePath}: missing closing YAML frontmatter delimiter`);
  const yamlSource = lines.slice(1, closingIndex).join('\n');
  const document = YAML.parseDocument(yamlSource, {
    maxAliasCount: 0,
    prettyErrors: true,
    strict: true,
    uniqueKeys: true
  });
  if (document.errors.length) throw new Error(`${filePath}: invalid YAML frontmatter: ${document.errors.map((error) => error.message).join('; ')}`);
  const data = document.toJS({ maxAliasCount: 0 }) || {};
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error(`${filePath}: YAML frontmatter must be a mapping`);
  return { data, content: lines.slice(closingIndex + 1).join('\n') };
}

function stringifyMarkdownFrontmatter(data, content) {
  const yamlSource = YAML.stringify(data, { aliasDuplicateObjects: false, lineWidth: 0 }).trimEnd();
  return `---\n${yamlSource}\n---\n${content.replace(/^\s*\n/, '\n')}`;
}

function isValidDate(value) {
  if (typeof value !== 'string' || !DATE_ONLY.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function publicPathForSlug(slug) {
  return `/${slug}`;
}

function publicPathForDocument(documentOrData) {
  const data = documentOrData.data || documentOrData;
  return data.language === 'pt-BR' ? `/pt-br/${data.slug}` : publicPathForSlug(data.slug);
}

function absoluteUrl(publicPath) {
  return new URL(publicPath, `${siteConfig.siteOrigin}/`).toString();
}

function sourceAssetPath(publicPath) {
  if (!publicPath || typeof publicPath !== 'string' || !publicPath.startsWith('/assets/')) return null;
  return path.join(ROOT_DIR, 'src', publicPath.replace(/^\//, ''));
}

function featuredImageArticleIdentity(doc) {
  return doc.data.translationKey
    ? `translation:${doc.data.translationKey}`
    : `document:${doc.relativePath}`;
}

function validFeaturedImageReuseOverride(doc, ownerSlugs) {
  const override = doc.data.featuredImageReuseOverride;
  return Boolean(
    override
    && typeof override === 'object'
    && !Array.isArray(override)
    && override.approved === true
    && typeof override.reason === 'string'
    && override.reason.trim().length >= 10
    && typeof override.duplicateOf === 'string'
    && ownerSlugs.has(override.duplicateOf)
  );
}

function validateFeaturedImageUniqueness(documents) {
  const byHash = new Map();
  const errors = [];

  for (const doc of documents) {
    if (!doc.data.featuredImage) continue;
    const assetPath = sourceAssetPath(doc.data.featuredImage);
    if (!assetPath || !fs.existsSync(assetPath)) continue;
    const hash = crypto.createHash('sha256').update(fs.readFileSync(assetPath)).digest('hex');
    if (!byHash.has(hash)) byHash.set(hash, new Map());
    const byArticle = byHash.get(hash);
    const identity = featuredImageArticleIdentity(doc);
    if (!byArticle.has(identity)) byArticle.set(identity, []);
    byArticle.get(identity).push(doc);
  }

  for (const [hash, byArticle] of byHash.entries()) {
    if (byArticle.size < 2) continue;
    const articleGroups = [...byArticle.values()].sort((left, right) => {
      const leftPublished = left.some((doc) => doc.data.status === 'published') ? 0 : 1;
      const rightPublished = right.some((doc) => doc.data.status === 'published') ? 0 : 1;
      return leftPublished - rightPublished || left[0].relativePath.localeCompare(right[0].relativePath);
    });
    const ownerGroup = articleGroups[0];
    const ownerSlugs = new Set(ownerGroup.map((doc) => doc.data.slug));
    const ownerLabel = ownerGroup.map((doc) => doc.relativePath).join(', ');

    for (const duplicateGroup of articleGroups.slice(1)) {
      for (const doc of duplicateGroup) {
        if (validFeaturedImageReuseOverride(doc, ownerSlugs)) continue;
        errors.push(`${doc.relativePath}: featuredImageUnique FAIL: ${doc.data.featuredImage} reuses SHA-256 ${hash.slice(0, 12)} from ${ownerLabel}; add a documented featuredImageReuseOverride only when reuse is explicitly approved`);
      }
    }
  }

  return { pass: errors.length === 0, errors };
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
  const allowedCategories = new Set([...siteConfig.contentCategories, ...siteConfig.legacyCategories, ...siteConfig.localizedCategories]);
  const knownRoutes = new Set([
    '/',
    '/insights',
    ...documents
      .filter((doc) => doc.data.status === 'published')
      .map((doc) => publicPathForDocument(doc))
  ]);
  const slugOwners = new Map();
  const titleOwners = new Map();
  const angleOwners = new Map();
  const canonicalOwners = new Map();
  const translationOwners = new Map();
  const routeOwners = new Map(documents.map((doc) => [publicPathForDocument(doc), doc]));

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
    if (!siteConfig.supportedLanguages.includes(data.language)) error(doc, `unsupported language: ${JSON.stringify(data.language)}`);
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
      const isAutoPublishFallback = data.publicationPath === 'auto-publish-fallback';
      if (!isAutoPublishFallback && data.humanDraftApproval !== 'approved') error(doc, 'human-approved publication requires humanDraftApproval: approved');
      if (isAutoPublishFallback) {
        if (!['pending', 'approved'].includes(data.humanDraftApproval)) error(doc, 'auto-publish fallback requires humanDraftApproval to be pending or approved');
        if (data.humanReviewOutcome !== 'no-response-by-cutoff') error(doc, 'auto-publish fallback requires humanReviewOutcome: no-response-by-cutoff');
        if (data.autoPublishEligible !== true) error(doc, 'auto-publish fallback requires autoPublishEligible: true');
        if (!Array.isArray(data.requestedChanges) || data.requestedChanges.length) error(doc, 'auto-publish fallback requires requestedChanges: []');
      }
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

    const canonicalPath = publicPathForDocument(doc);
    if (canonicalOwners.has(canonicalPath)) error(doc, `duplicate canonical path with ${canonicalOwners.get(canonicalPath)}`);
    else canonicalOwners.set(canonicalPath, doc.relativePath);

    if (data.translationKey) {
      const translationIdentity = `${data.translationKey}|${data.language}`;
      if (translationOwners.has(translationIdentity)) error(doc, `duplicate translationKey/language with ${translationOwners.get(translationIdentity)}`);
      else translationOwners.set(translationIdentity, doc.relativePath);
    }

    for (const link of extractInternalLinks(doc.content)) {
      const route = normalizeInternalRoute(link);
      if (!knownRoutes.has(route)) error(doc, `internal link does not match a known route: ${link}`);
    }

    const duplicateFields = [
      ['slug', data.slug, slugOwners],
      ['title', data.title && data.title.trim().toLowerCase(), titleOwners]
    ];
    for (const [field, value, owners] of duplicateFields) {
      if (!value) continue;
      if (owners.has(value)) error(doc, `duplicate ${field} with ${owners.get(value)}`);
      else owners.set(value, doc.relativePath);
    }
    if (data.topicAngleSignature) {
      const angleOwner = angleOwners.get(data.topicAngleSignature);
      const isTranslationOfOwner = angleOwner
        && data.translationKey
        && angleOwner.data.translationKey === data.translationKey
        && angleOwner.data.language !== data.language;
      if (angleOwner && !isTranslationOfOwner) error(doc, `duplicate topicAngleSignature with ${angleOwner.relativePath}`);
      else if (!angleOwner) angleOwners.set(data.topicAngleSignature, doc);
    }

    if (doc.content.match(/^#\s+/gm)?.length > 1) warning(doc, 'body contains more than one H1; rendered articles use the template H1');
  }

  for (const doc of documents) {
    const currentRoute = publicPathForDocument(doc);
    for (const [language, translationRoute] of Object.entries(doc.data.translations)) {
      if (!siteConfig.supportedLanguages.includes(language)) {
        error(doc, `translation uses unsupported language: ${JSON.stringify(language)}`);
        continue;
      }
      if (typeof translationRoute !== 'string' || !translationRoute.startsWith('/')) {
        error(doc, `translation route must be an absolute site path: ${JSON.stringify(translationRoute)}`);
        continue;
      }
      const normalizedRoute = normalizeInternalRoute(translationRoute);
      const target = routeOwners.get(normalizedRoute);
      if (!target) {
        error(doc, `translation route does not match known content: ${translationRoute}`);
        continue;
      }
      if (target.data.language !== language) error(doc, `translation route language mismatch for ${translationRoute}`);
      if (!doc.data.translationKey || target.data.translationKey !== doc.data.translationKey) {
        error(doc, `translationKey does not match ${target.relativePath}`);
      }
      if (target.data.translations[doc.data.language] !== currentRoute) {
        error(doc, `translation relationship is not reciprocal with ${target.relativePath}`);
      }
    }
  }

  errors.push(...validateFeaturedImageUniqueness(documents).errors);

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
  parseMarkdownFrontmatter,
  stringifyMarkdownFrontmatter,
  isValidDate,
  publicPathForSlug,
  publicPathForDocument,
  absoluteUrl,
  sourceAssetPath,
  validateFeaturedImageUniqueness,
  extractInternalLinks,
  normalizeInternalRoute,
  validateDocuments,
  stripLeadingArticleH1
};
