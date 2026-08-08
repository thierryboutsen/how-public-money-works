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

  const autoCandidate = {
    ...source,
    relativePath: `content/posts/${source.data.slug}.md`,
    data: {
      ...validData,
      humanDraftApproval: 'pending',
      publicationPath: 'auto-publish-fallback',
      humanReviewOutcome: 'no-response-by-cutoff',
      autoPublishEligible: true,
      requestedChanges: []
    }
  };
  const validAuto = validateDocuments([...publishedDocuments, autoCandidate]);
  assert.deepStrictEqual(validAuto.errors, [], `fully gated auto-publish fallback should pass: ${validAuto.errors.join('; ')}`);

  const rejectedAuto = { ...autoCandidate, data: { ...autoCandidate.data, humanDraftApproval: 'rejected' } };
  assert(validateDocuments([...publishedDocuments, rejectedAuto]).errors.some((error) => error.includes('pending or approved')), 'auto fallback must not override rejection');
  const changedAuto = { ...autoCandidate, data: { ...autoCandidate.data, requestedChanges: ['Revise scope'] } };
  assert(validateDocuments([...publishedDocuments, changedAuto]).errors.some((error) => error.includes('requestedChanges: []')), 'auto fallback must not override requested changes');
  const ineligibleAuto = { ...autoCandidate, data: { ...autoCandidate.data, autoPublishEligible: false } };
  assert(validateDocuments([...publishedDocuments, ineligibleAuto]).errors.some((error) => error.includes('autoPublishEligible: true')), 'auto fallback must require a recorded passing gate');
}

function diagramRegressionTest() {
  const html = parseMarkdownWithShortcodes('[diagram]How money moves[/diagram]');
  assert(html.includes('<svg'), '[diagram] must render its SVG component');
  assert(html.includes('How money moves'), '[diagram] must preserve its label');
}

function translationGuardTests() {
  const documents = listMarkdownFiles(path.join(ROOT_DIR, 'content', 'posts')).map(loadMarkdownFile);
  const englishIndex = documents.findIndex((document) => document.data.slug === 'where-do-your-local-taxes-actually-go');
  assert(englishIndex >= 0, 'English translation source must exist');

  const unsupportedLanguage = documents.map((document, index) => index === englishIndex
    ? { ...document, data: { ...document.data, language: 'xx' } }
    : document);
  assert(validateDocuments(unsupportedLanguage).errors.some((error) => error.includes('unsupported language')), 'unsupported language must fail');

  const missingTranslation = documents.map((document, index) => index === englishIndex
    ? { ...document, data: { ...document.data, translations: { 'pt-BR': '/pt-br/missing-translation' } } }
    : document);
  assert(validateDocuments(missingTranslation).errors.some((error) => error.includes('translation route does not match published content')), 'missing translation route must fail');


  const portugueseIndex = documents.findIndex((document) => document.data.translationKey === documents[englishIndex].data.translationKey && document.data.language === 'pt-BR');
  assert(portugueseIndex >= 0, 'Portuguese translation source must exist');
  const anglePair = [
    {
      ...documents[englishIndex],
      content: 'Conceptual English test copy.',
      relativePath: 'content/review/shared-angle-en.md',
      data: {
        ...documents[englishIndex].data,
        slug: 'shared-angle-en',
        title: 'Shared angle English test',
        status: 'review',
        translationKey: 'shared-angle-test',
        translations: { 'pt-BR': '/pt-br/shared-angle-pt' },
        topicAngleSignature: 'shared-translation-angle-test'
      }
    },
    {
      ...documents[portugueseIndex],
      content: 'Texto conceitual de teste em português.',
      relativePath: 'content/review/shared-angle-pt.md',
      data: {
        ...documents[portugueseIndex].data,
        slug: 'shared-angle-pt',
        title: 'Teste em português com ângulo compartilhado',
        status: 'review',
        translationKey: 'shared-angle-test',
        translations: { en: '/shared-angle-en' },
        topicAngleSignature: 'shared-translation-angle-test'
      }
    }
  ];
  const pairAngleErrors = validateDocuments([...documents, ...anglePair]).errors.filter((error) => error.includes('topicAngleSignature'));
  assert.deepStrictEqual(pairAngleErrors, [], `translations may share one topic angle: ${pairAngleErrors.join('; ')}`);
  const duplicateAngle = {
    ...anglePair.find((document) => document.data.language === 'en'),
    relativePath: 'content/review/unrelated-angle-duplicate.md',
    data: {
      ...anglePair.find((document) => document.data.language === 'en').data,
      slug: 'unrelated-angle-duplicate',
      title: 'Unrelated angle duplicate',
      translationKey: 'unrelated-angle-duplicate',
      translations: {}
    }
  };
  assert(validateDocuments([...documents, ...anglePair, duplicateAngle]).errors.some((error) => error.includes('duplicate topicAngleSignature')), 'unrelated content must not reuse an exact topic angle');

  const duplicateCanonical = {
    ...documents[englishIndex],
    relativePath: 'content/posts/duplicate-canonical-test.md',
    data: { ...documents[englishIndex].data, title: 'Duplicate canonical test' }
  };
  assert(validateDocuments([...documents, duplicateCanonical]).errors.some((error) => error.includes('duplicate canonical path')), 'duplicate canonical must fail');
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
translationGuardTests();
leakAuditTest();
console.log('Pipeline guard tests passed: publication gates, translations, diagram rendering, and unauthorized-output detection.');
