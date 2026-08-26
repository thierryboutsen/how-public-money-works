'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {
  RESOURCE_MANIFEST,
  getHomepageResources,
  validateResourceManifest
} = require('../src/resources/manifest');
const { GLOSSARY_EN, GLOSSARY_PT, renderGlossaryBody } = require('../src/resources/glossary-data');
const {
  generateSitemap,
  renderIndexPage,
  renderResourcePage,
  renderResourceCards
} = require('../build');

const valid = validateResourceManifest();
assert(valid.pass, valid.errors.join('\n'));
assert.strictEqual(getHomepageResources().length, 6);
assert(GLOSSARY_EN.length >= 35 && GLOSSARY_EN.length <= 50);
assert.strictEqual(GLOSSARY_EN.length, GLOSSARY_PT.length);
assert(GLOSSARY_EN.every((entry) => entry.term && entry.plainEnglishDefinition && entry.whyItMatters && entry.jurisdictionNote && entry.sources.length > 0));
assert(GLOSSARY_EN.every((entry) => entry.relatedTerms.length >= 1));
assert.strictEqual(RESOURCE_MANIFEST.filter((resource) => resource.status === 'published').length, 5);
const glossaryEn = RESOURCE_MANIFEST.find((resource) => resource.id === 'glossary-of-public-finance-en');
const glossaryPt = RESOURCE_MANIFEST.find((resource) => resource.id === 'glossario-de-financas-publicas-pt-br');
assert.strictEqual(glossaryEn.status, 'published');
assert.strictEqual(glossaryPt.status, 'published');
assert.strictEqual(glossaryEn.contentStatus, 'approved');
assert.strictEqual(glossaryPt.reviewStatus, 'approved');
assert.strictEqual(glossaryEn.pairedResourceId, glossaryPt.id);
assert.strictEqual(glossaryPt.pairedResourceId, glossaryEn.id);
assert.strictEqual(glossaryEn.hreflang['pt-BR'], glossaryPt.canonical);
assert.strictEqual(glossaryPt.hreflang.en, glossaryEn.canonical);

const duplicateSlug = RESOURCE_MANIFEST.map((resource) => ({ ...resource }));
duplicateSlug.push({ ...duplicateSlug[0], id: 'duplicate-resource', pairedResourceId: duplicateSlug[1].id });
assert(validateResourceManifest(duplicateSlug).errors.some((error) => /duplicate slug/.test(error)), 'duplicate slugs must fail');

const brokenPair = RESOURCE_MANIFEST.map((resource) => ({ ...resource }));
brokenPair[0] = { ...brokenPair[0], pairedResourceId: 'missing-pair' };
assert(validateResourceManifest(brokenPair).errors.some((error) => /missing paired resource/.test(error)), 'missing pairs must fail');

const template = fs.readFileSync(path.join(__dirname, '..', 'src', 'index.html'), 'utf8');
const renderedCards = renderResourceCards();
assert.strictEqual((renderedCards.match(/data-resource-id=/g) || []).length, 6);
assert(renderedCards.includes('data-resource-status="coming-soon"'));
assert(renderedCards.includes('href="/resources/glossary-of-public-finance"'), 'published glossary must receive an English link');
assert(renderedCards.includes('data-href-pt="/pt-br/resources/glossario-de-financas-publicas"'), 'published glossary must receive a Portuguese link');
assert(!renderedCards.includes('href="/resources/open-data-portals"'), 'remaining coming-soon resources must not receive public links');
assert(renderedCards.includes('href="/what-is-a-city-budget-and-why-should-you-care"'));
assert(renderedCards.includes('href="/where-do-your-local-taxes-actually-go"'));

const homepage = renderIndexPage(template, []);
assert.strictEqual((homepage.match(/data-resource-id=/g) || []).length, 6);
assert(!homepage.includes('{{resourcesHtml}}'));

const sitemap = generateSitemap([], RESOURCE_MANIFEST);
assert(sitemap.includes('/what-is-a-city-budget-and-why-should-you-care'));
assert(sitemap.includes('/where-do-your-local-taxes-actually-go'));
assert(sitemap.includes('/resources/glossary-of-public-finance'));
assert(sitemap.includes('/pt-br/resources/glossario-de-financas-publicas'));
assert(!sitemap.includes('/resources/open-data-portals'));
assert(!sitemap.includes('/resources/civic-finance-reading-list'));
assert(!sitemap.includes('/resources/annual-reports-where-to-find-them'));

const resourceTemplate = fs.readFileSync(path.join(__dirname, '..', 'src', 'templates', 'resource.html'), 'utf8');
const pageResource = glossaryEn;
const pageHtml = renderResourcePage(pageResource, resourceTemplate);
assert(pageHtml.includes('rel="canonical"'));
assert(pageHtml.includes('application/ld+json'));
assert(pageHtml.includes('Glossary of Public Finance'));
assert((pageHtml.match(/class="glossary-entry"/g) || []).length === GLOSSARY_EN.length);
assert(pageHtml.includes('data-glossary-search'));
assert(pageHtml.includes('DefinedTermSet'));
assert(pageHtml.includes('reasonable assurance'));
assert(!pageHtml.includes('{{'));

const ptPageHtml = renderResourcePage(glossaryPt, resourceTemplate);
assert(ptPageHtml.includes('Glossário de Finanças Públicas'));
assert(ptPageHtml.includes('lang="pt-BR"'));
assert((ptPageHtml.match(/class="glossary-entry"/g) || []).length === GLOSSARY_PT.length);
console.log('Resources architecture tests passed: manifest, pairs, homepage cards, routes, sitemap, and resource template.');
