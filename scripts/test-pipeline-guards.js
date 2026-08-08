'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  ROOT_DIR,
  listMarkdownFiles,
  loadMarkdownFile,
  validateDocuments
} = require('./content-utils');
const { auditOutput } = require('./audit-output');
const { copyRecursiveSync, parseMarkdownWithShortcodes } = require('../build');

function publicationGateTests() {
  const targetFileName = 'where-do-your-local-taxes-actually-go.md';
  const reviewSource = path.join(ROOT_DIR, 'content', 'review', targetFileName);
  const publishedSource = path.join(ROOT_DIR, 'content', 'posts', targetFileName);
  const sourcePath = fs.existsSync(reviewSource) ? reviewSource : publishedSource;
  const source = loadMarkdownFile(sourcePath);
  const publishedDocuments = listMarkdownFiles(path.join(ROOT_DIR, 'content', 'posts'))
    .map(loadMarkdownFile)
    .filter((document) => document.filePath !== source.filePath);
  const validData = {
    ...source.data,
    status: 'published',
    lifecycleStatus: 'published',
    humanDraftApproval: 'approved',
    publicationApproval: 'approved',
    publishAllowed: true,
    canonicalDecision: 'approved',
    slugDecision: 'approved',
    date: '2026-01-01'
  };

  function validateCandidate(overrides) {
    const candidate = {
      ...source,
      relativePath: `content/posts/${source.data.slug}.md`,
      data: { ...validData, ...overrides }
    };
    return validateDocuments([...publishedDocuments, candidate]);
  }

  const passing = validateCandidate({});
  assert.deepStrictEqual(passing.errors, [], `fully authorized publication should pass: ${passing.errors.join('; ')}`);

  const cases = [
    ['humanDraftApproval', 'pending', 'humanDraftApproval: approved'],
    ['publicationApproval', 'pending', 'publicationApproval: approved'],
    ['publishAllowed', false, 'publishAllowed: true'],
    ['canonicalDecision', 'pending-human-approval', 'canonicalDecision: approved'],
    ['slugDecision', 'pending-human-approval', 'slugDecision: approved'],
    ['lifecycleStatus', 'drafted', 'lifecycleStatus: published']
  ];
  for (const [field, value, expectedMessage] of cases) {
    const result = validateCandidate({ [field]: value });
    assert(result.errors.some((error) => error.includes(expectedMessage)), `${field}=${value} should fail with ${expectedMessage}`);
    const missing = validateCandidate({ [field]: undefined });
    assert(missing.errors.some((error) => error.includes(expectedMessage)), `missing ${field} should fail with ${expectedMessage}`);
  }
}

function diagramRegressionTest() {
  const html = parseMarkdownWithShortcodes('[diagram]How money moves[/diagram]');
  assert(html.includes('<svg'), '[diagram] must render its SVG component');
  assert(html.includes('How money moves'), '[diagram] must preserve its label');
}

function leakAuditTest() {
  const distDirectory = path.join(ROOT_DIR, 'dist');
  assert(fs.existsSync(distDirectory), 'dist/ must exist; run npm run build first');
  const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'hpw-audit-leak-'));
  try {
    copyRecursiveSync(distDirectory, temporaryDirectory);
    const unauthorizedSlug = 'unauthorized-review-article';
    const existingArticle = path.join(temporaryDirectory, 'what-is-a-city-budget-and-why-should-you-care.html');
    fs.copyFileSync(existingArticle, path.join(temporaryDirectory, `${unauthorizedSlug}.html`));
    const sitemapPath = path.join(temporaryDirectory, 'sitemap.xml');
    const sitemap = fs.readFileSync(sitemapPath, 'utf8').replace(
      '</urlset>',
      `  <url>\n    <loc>https://www.luminasmart.company/${unauthorizedSlug}</loc>\n  </url>\n</urlset>`
    );
    fs.writeFileSync(sitemapPath, sitemap);

    const result = auditOutput(temporaryDirectory);
    assert(result.errors.some((error) => error.includes(`${unauthorizedSlug}.html: unauthorized`)), 'audit must reject an unauthorized article HTML file');
    assert(result.errors.some((error) => error.includes(`sitemap.xml contains unauthorized URL`) && error.includes(unauthorizedSlug)), 'audit must reject an unauthorized sitemap URL');
  } finally {
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  }
}

publicationGateTests();
diagramRegressionTest();
leakAuditTest();
console.log('Pipeline guard tests passed: publication gates, diagram rendering, and unauthorized-output detection.');
