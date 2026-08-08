'use strict';

const fs = require('fs');
const path = require('path');
const siteConfig = require('../site.config');
const {
  ROOT_DIR,
  listMarkdownFiles,
  loadMarkdownFile,
  publicPathForSlug,
  absoluteUrl,
  validateDocuments
} = require('./content-utils');

const PUBLIC_BASE_FILES = new Set(['index.html', 'insights.html', '404.html']);

function countMatches(text, pattern) {
  return (text.match(pattern) || []).length;
}

function attributeContent(html, attribute, value) {
  const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`<meta[^>]+${attribute}=["']${escapedValue}["'][^>]+content=["']([^"']*)["'][^>]*>`, 'i');
  return html.match(pattern)?.[1] || '';
}

function localTarget(outputDirectory, href) {
  const clean = href.split('#')[0].split('?')[0];
  if (!clean || clean === '#' || /^(https?:|mailto:|tel:|javascript:)/i.test(clean)) return null;
  let relative = clean.startsWith('/') ? clean.slice(1) : clean;
  if (!relative) relative = 'index.html';
  if (relative === 'insights') relative = 'insights.html';
  if (!path.extname(relative)) relative = `${relative}.html`;
  return path.join(outputDirectory, relative);
}

function loadAuthorizedPublishedState() {
  const postsDirectory = path.join(ROOT_DIR, 'content', 'posts');
  const documents = listMarkdownFiles(postsDirectory).map(loadMarkdownFile);
  const validation = validateDocuments(documents);
  const published = documents.filter((document) => document.data.status === 'published');
  return {
    errors: validation.errors,
    warnings: validation.warnings,
    articleFiles: new Set(published.map((document) => `${document.data.slug}.html`)),
    sitemapUrls: new Set([
      absoluteUrl('/'),
      absoluteUrl('/insights'),
      ...published.map((document) => absoluteUrl(publicPathForSlug(document.data.slug)))
    ])
  };
}

function auditHtmlFile(filePath, outputDirectory, options = {}) {
  const html = fs.readFileSync(filePath, 'utf8');
  const name = path.relative(outputDirectory, filePath).replace(/\\/g, '/');
  const errors = [];
  const isPage = name !== '404.html';

  if (/{{[A-Za-z0-9_]+}}/.test(html)) errors.push('contains unresolved template placeholders');
  if (html.includes('elianafariasima.com')) errors.push('contains deprecated domain elianafariasima.com');

  if (isPage) {
    if (countMatches(html, /<title>/gi) !== 1) errors.push('must contain exactly one title');
    if (countMatches(html, /<meta\s+name=["']description["']/gi) !== 1) errors.push('must contain exactly one meta description');
    if (countMatches(html, /<h1(?:\s|>)/gi) !== 1) errors.push('must contain exactly one H1');

    if (options.isPreviewArticle) {
      const robots = attributeContent(html, 'name', 'robots').replace(/\s/g, '').toLowerCase();
      if (robots !== 'noindex,nofollow') errors.push(`preview must use robots noindex,nofollow: ${robots || '(missing)'}`);
      if (countMatches(html, /<link\s+rel=["']canonical["']/gi) !== 0) errors.push('preview article must not emit a production canonical');
      if (attributeContent(html, 'property', 'og:url')) errors.push('preview article must not emit a production og:url');
      if (countMatches(html, /<script\s+type=["']application\/ld\+json["']/gi) !== 0) errors.push('preview article must not emit production JSON-LD');
    } else {
      if (countMatches(html, /<link\s+rel=["']canonical["']/gi) !== 1) errors.push('must contain exactly one canonical');
      const canonical = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)/i)?.[1] || '';
      if (!canonical.startsWith(siteConfig.siteOrigin)) errors.push(`canonical does not use SITE_ORIGIN: ${canonical}`);
      if (!attributeContent(html, 'property', 'og:url')) errors.push('missing og:url');
    }

    for (const property of ['og:type', 'og:title', 'og:description', 'og:image']) {
      if (!attributeContent(html, 'property', property)) errors.push(`missing ${property}`);
    }
    for (const property of ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']) {
      if (!attributeContent(html, 'name', property)) errors.push(`missing ${property}`);
    }
  }

  for (const image of html.match(/<img\b[^>]*>/gi) || []) {
    if (!/\balt=["'][^"']+["']/i.test(image)) errors.push(`image missing non-empty alt: ${image.slice(0, 100)}`);
  }

  for (const match of html.matchAll(/href=["']([^"']+)["']/gi)) {
    const target = localTarget(outputDirectory, match[1]);
    if (target && !fs.existsSync(target)) errors.push(`broken internal href: ${match[1]}`);
  }

  for (const match of html.matchAll(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)) {
    try {
      JSON.parse(match[1].trim());
    } catch (error) {
      errors.push(`invalid JSON-LD: ${error.message}`);
    }
  }

  return { name, errors };
}

function parseSitemapUrls(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim());
}

function auditOutput(outputDirectory, options = {}) {
  const resolvedOutput = path.resolve(outputDirectory);
  if (!fs.existsSync(resolvedOutput)) return { errors: [`output directory not found: ${resolvedOutput}`], files: [] };

  const state = loadAuthorizedPublishedState();
  const errors = state.errors.map((error) => `content authorization failed: ${error}`);
  const files = fs.readdirSync(resolvedOutput).filter((file) => file.endsWith('.html'));
  const allowedPublicFiles = new Set([...PUBLIC_BASE_FILES, ...state.articleFiles]);

  for (const file of files) {
    const isUnexpectedArticle = !allowedPublicFiles.has(file);
    if (isUnexpectedArticle && !options.preview) {
      errors.push(`${file}: unauthorized article/page exists in public output`);
    }
    const result = auditHtmlFile(path.join(resolvedOutput, file), resolvedOutput, {
      isPreviewArticle: options.preview && isUnexpectedArticle
    });
    errors.push(...result.errors.map((error) => `${result.name}: ${error}`));
  }

  for (const expectedFile of allowedPublicFiles) {
    if (!files.includes(expectedFile)) errors.push(`${expectedFile}: expected public page is missing`);
  }

  const sitemapPath = path.join(resolvedOutput, 'sitemap.xml');
  const robotsPath = path.join(resolvedOutput, 'robots.txt');
  if (!fs.existsSync(sitemapPath)) errors.push('sitemap.xml is missing');
  if (!fs.existsSync(robotsPath)) errors.push('robots.txt is missing');

  if (fs.existsSync(sitemapPath)) {
    const actualUrls = parseSitemapUrls(fs.readFileSync(sitemapPath, 'utf8'));
    const actualUrlSet = new Set(actualUrls);
    if (actualUrlSet.size !== actualUrls.length) errors.push('sitemap.xml contains duplicate URLs');
    for (const url of actualUrlSet) {
      if (!state.sitemapUrls.has(url)) errors.push(`sitemap.xml contains unauthorized URL: ${url}`);
    }
    for (const url of state.sitemapUrls) {
      if (!actualUrlSet.has(url)) errors.push(`sitemap.xml is missing authorized URL: ${url}`);
    }
  }

  if (fs.existsSync(robotsPath)) {
    const robots = fs.readFileSync(robotsPath, 'utf8');
    if (!robots.includes('User-agent: *') || !robots.includes('Allow: /')) errors.push('robots.txt does not allow public crawling as expected');
    if (!robots.includes(`Sitemap: ${siteConfig.siteOrigin}/sitemap.xml`)) errors.push('robots.txt has an incorrect sitemap URL');
  }

  return { errors, files, warnings: state.warnings };
}

function main() {
  const requestedDirectory = process.argv[2] || 'dist';
  const outputDirectory = path.resolve(ROOT_DIR, requestedDirectory);
  const result = auditOutput(outputDirectory, { preview: requestedDirectory === '.preview' });
  for (const warning of result.warnings || []) console.warn(`Warning: ${warning}`);
  if (result.errors.length) {
    console.error(`Output audit failed with ${result.errors.length} error(s):`);
    for (const error of result.errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }
  console.log(`Output audit passed for ${result.files.length} HTML file(s) in ${requestedDirectory}.`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { auditOutput, auditHtmlFile, parseSitemapUrls };
