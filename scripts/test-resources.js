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
assert.strictEqual(RESOURCE_MANIFEST.filter((resource) => resource.status === 'published').length, 3);

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
assert(!/href="\/resources\//.test(renderedCards), 'coming-soon resources must not receive public links');
assert(renderedCards.includes('href="/what-is-a-city-budget-and-why-should-you-care"'));
assert(renderedCards.includes('href="/where-do-your-local-taxes-actually-go"'));

const homepage = renderIndexPage(template, []);
assert.strictEqual((homepage.match(/data-resource-id=/g) || []).length, 6);
assert(!homepage.includes('{{resourcesHtml}}'));

const sitemap = generateSitemap([], RESOURCE_MANIFEST);
assert(sitemap.includes('/what-is-a-city-budget-and-why-should-you-care'));
assert(sitemap.includes('/where-do-your-local-taxes-actually-go'));
assert(!sitemap.includes('/resources/glossary-of-public-finance'));
assert(!sitemap.includes('/resources/open-data-portals'));
assert(!sitemap.includes('/resources/glossary-of-public-finance'));

const resourceTemplate = fs.readFileSync(path.join(__dirname, '..', 'src', 'templates', 'resource.html'), 'utf8');
const pageResource = {
  ...RESOURCE_MANIFEST.find((resource) => resource.id === 'glossary-of-public-finance-en'),
  status: 'published',
  canonical: 'https://www.luminasmart.company/resources/glossary-of-public-finance',
  hreflang: { en: 'https://www.luminasmart.company/resources/glossary-of-public-finance' },
  content: { type: 'page', bodyHtml: renderGlossaryBody('en') }
};
const pageHtml = renderResourcePage(pageResource, resourceTemplate);
assert(pageHtml.includes('rel="canonical"'));
assert(pageHtml.includes('application/ld+json'));
assert(pageHtml.includes('Glossary of Public Finance'));
assert((pageHtml.match(/class="glossary-entry"/g) || []).length === GLOSSARY_EN.length);
assert(pageHtml.includes('data-glossary-search'));
assert(!pageHtml.includes('{{'));

assert.strictEqual(RESOURCE_MANIFEST.filter((resource) => resource.status === 'published' && resource.content?.type === 'page').length, 0, 'no substantive resource page content is published in v1');
console.log('Resources architecture tests passed: manifest, pairs, homepage cards, routes, sitemap, and resource template.');
