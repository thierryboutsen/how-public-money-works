'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const {
  RESOURCE_MANIFEST,
  getHomepageResources,
  validateResourceManifest
} = require('../src/resources/manifest');
const { GLOSSARY_EN, GLOSSARY_PT, renderGlossaryBody } = require('../src/resources/glossary-data');
const { SOURCE_LINKS, renderAnnualReportsBody } = require('../src/resources/annual-reports-data');
const { TRACKS: READING_TRACKS, ITEMS: READING_ITEMS, renderCivicFinanceReadingListBody } = require('../src/resources/civic-finance-reading-list-data');
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
assert.strictEqual(RESOURCE_MANIFEST.filter((resource) => resource.status === 'published').length, 7);
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

const annualEn = RESOURCE_MANIFEST.find((resource) => resource.id === 'annual-reports-where-to-find-them-en');
const annualPt = RESOURCE_MANIFEST.find((resource) => resource.id === 'relatorios-anuais-onde-encontrar-pt-br');
assert(annualEn && annualPt, 'Annual Reports EN/PT resources must exist');
assert.strictEqual(annualEn.status, 'published');
assert.strictEqual(annualPt.status, 'published');
assert.strictEqual(annualEn.contentStatus, 'approved');
assert.strictEqual(annualPt.contentStatus, 'approved');
assert.strictEqual(annualEn.reviewStatus, 'approved');
assert.strictEqual(annualPt.reviewStatus, 'approved');
assert.strictEqual(annualEn.canonical, 'https://www.luminasmart.company/resources/annual-reports-where-to-find-them');
assert.strictEqual(annualPt.canonical, 'https://www.luminasmart.company/pt-br/resources/relatorios-anuais-onde-encontrar');
assert.strictEqual(annualEn.hreflang.en, annualEn.canonical);
assert.strictEqual(annualEn.hreflang['pt-BR'], annualPt.canonical);
assert.strictEqual(annualPt.hreflang.en, annualEn.canonical);
assert.strictEqual(annualPt.hreflang['pt-BR'], annualPt.canonical);
assert.strictEqual(annualEn.publishedAt, '2026-08-30');
assert.strictEqual(annualPt.publishedAt, '2026-08-30');
assert.strictEqual(annualEn.updatedAt, '2026-08-30');
assert.strictEqual(annualPt.updatedAt, '2026-08-30');
assert.strictEqual(annualEn.action, 'Read guide →');
assert.strictEqual(annualPt.action, 'Ler guia →');
assert.strictEqual(annualEn.content.source, 'src/resources/annual-reports-data.js');
assert.strictEqual(annualPt.content.source, 'src/resources/annual-reports-data.js');
assert.strictEqual(annualEn.pairedResourceId, annualPt.id);
assert.strictEqual(annualPt.pairedResourceId, annualEn.id);

const annualEnContent = renderAnnualReportsBody('en');
const annualPtContent = renderAnnualReportsBody('pt-BR');
assert(annualEnContent.bodyHtml.includes('Start with the report name'));
assert(annualEnContent.bodyHtml.includes('Official examples by government level'));
assert(annualEnContent.bodyHtml.includes('ACFR vs. budget vs. PAFR'));
assert(annualEnContent.bodyHtml.includes('Using EMMA'));
assert(annualEnContent.bodyHtml.includes('A practical search sequence'));
assert(annualEnContent.bodyHtml.includes('class="resource-table-wrap"'));
assert(annualPtContent.bodyHtml.includes('Comece pelo nome do relatório'));
assert(annualPtContent.bodyHtml.includes('Exemplos oficiais por nível de governo'));
assert(annualPtContent.bodyHtml.includes('ACFR x orçamento x PAFR'));
assert(annualPtContent.bodyHtml.includes('Como usar o EMMA'));
assert(annualPtContent.bodyHtml.includes('Sequência prática de busca'));
assert(Object.values(SOURCE_LINKS).every((url) => /^https:\/\//.test(url)), 'Annual Reports references must use HTTPS primary-source links');
assert(annualEnContent.referencesHtml.includes(SOURCE_LINKS.milwaukeeCity));
assert(annualEnContent.referencesHtml.includes(SOURCE_LINKS.nyc));
assert(annualEnContent.referencesHtml.includes(SOURCE_LINKS.marinCounty));
assert(annualEnContent.referencesHtml.includes(SOURCE_LINKS.illinois));
assert(annualEnContent.referencesHtml.includes(SOURCE_LINKS.northCarolina));
assert(annualEnContent.referencesHtml.includes(SOURCE_LINKS.emmaAbout));
assert(annualEnContent.bodyHtml.includes(SOURCE_LINKS.emmaPortal));

const readingEn = RESOURCE_MANIFEST.find((resource) => resource.id === 'civic-finance-reading-list-en');
const readingPt = RESOURCE_MANIFEST.find((resource) => resource.id === 'lista-de-leituras-financas-civicas-pt-br');
assert(readingEn && readingPt, 'Reading List EN/PT resources must exist');
assert.strictEqual(readingEn.status, 'coming-soon');
assert.strictEqual(readingPt.status, 'coming-soon');
assert.strictEqual(readingEn.contentStatus, 'draft');
assert.strictEqual(readingPt.contentStatus, 'draft');
assert.strictEqual(readingEn.reviewStatus, 'draft');
assert.strictEqual(readingPt.reviewStatus, 'draft');
assert.strictEqual(readingEn.canonical, null);
assert.strictEqual(readingPt.canonical, null);
assert.deepStrictEqual(readingEn.hreflang, {});
assert.deepStrictEqual(readingPt.hreflang, {});
assert.strictEqual(readingEn.pairedResourceId, readingPt.id);
assert.strictEqual(readingPt.pairedResourceId, readingEn.id);
assert.strictEqual(readingEn.content.source, 'src/resources/civic-finance-reading-list-data.js');
assert.strictEqual(readingPt.content.source, 'src/resources/civic-finance-reading-list-data.js');
assert.strictEqual(READING_ITEMS.length, 25, 'Reading List V1 must contain exactly 25 curated items');
assert.strictEqual(READING_TRACKS.length, 8, 'Reading List V1 must contain exactly eight learning tracks');
assert.strictEqual(READING_ITEMS.filter((item) => item.quick).length, 5, 'starter pathway must contain exactly five steps');
assert.strictEqual(READING_ITEMS.filter((item) => item.bookshelf).length, 7, 'foundational bookshelf must contain exactly seven references');
assert(READING_ITEMS.every((item) => /^https:\/\//.test(item.url)), 'Reading List sources must use HTTPS');
assert(READING_ITEMS.every((item) => item.why?.en && item.why?.pt && item.helps?.en && item.helps?.pt), 'every Reading List item must have paired EN/PT-BR annotations');
assert(READING_ITEMS.every((item) => !/amazon\.|ebay\.|abebooks\./i.test(item.url)), 'Reading List must not use marketplace or affiliate-style source links');

const readingEnContent = renderCivicFinanceReadingListBody('en');
const readingPtContent = renderCivicFinanceReadingListBody('pt-BR');
assert(readingEnContent.bodyHtml.includes('If you only read five things'));
assert(readingEnContent.bodyHtml.includes('The foundational bookshelf'));
assert(readingEnContent.bodyHtml.includes('Government Finances Glossary + Classification Manual'));
assert.strictEqual((readingEnContent.bodyHtml.match(/class="reading-quick-num"/g) || []).length, 5);
assert.strictEqual((readingEnContent.bodyHtml.match(/class="reading-book"/g) || []).length, 7);
assert.strictEqual((readingEnContent.bodyHtml.match(/class="reading-cover-placeholder/g) || []).length, 7, 'bookshelf must have safe typographic placeholders until approved cover assets are added');
assert.strictEqual((readingEnContent.bodyHtml.match(/class="reading-track"/g) || []).length, 8);
assert.strictEqual((readingEnContent.bodyHtml.match(/class="reading-item"/g) || []).length, 25);
assert(readingEnContent.bodyHtml.includes('Why read it'));
assert(readingEnContent.bodyHtml.includes('Helps you understand'));
assert(readingPtContent.bodyHtml.includes('Se você ler apenas cinco coisas'));
assert(readingPtContent.bodyHtml.includes('A estante de referências fundamentais'));
assert(readingPtContent.bodyHtml.includes('Por que ler'));
assert(readingPtContent.bodyHtml.includes('Ajuda a entender'));
assert.strictEqual((readingPtContent.bodyHtml.match(/class="reading-item"/g) || []).length, 25);

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
assert(!renderedCards.includes('href="/resources/civic-finance-reading-list"'), 'Reading List must remain unlinked while coming-soon');
assert(renderedCards.includes('href="/resources/annual-reports-where-to-find-them"'), 'published Annual Reports must receive an English link');
assert(renderedCards.includes('data-href-pt="/pt-br/resources/relatorios-anuais-onde-encontrar"'), 'published Annual Reports must receive a Portuguese link');
assert(renderedCards.includes('data-text-en="Read guide"'), 'resource card action text must rely on the shared CSS arrow instead of embedding a duplicate arrow');
assert(renderedCards.includes('data-text-pt="Ler guia"'), 'Portuguese resource card action must rely on the shared CSS arrow instead of embedding a duplicate arrow');
assert(!renderedCards.includes('Read guide →'), 'resource card markup must not embed an arrow when .arrow::after already supplies one');
assert(!renderedCards.includes('Ler guia →'), 'Portuguese resource card markup must not embed a duplicate arrow');
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
assert(!sitemap.includes('/pt-br/resources/lista-de-leituras-financas-civicas'));
assert(sitemap.includes('/resources/annual-reports-where-to-find-them'));
assert(sitemap.includes('/pt-br/resources/relatorios-anuais-onde-encontrar'));
assert(sitemap.includes('hreflang="x-default" href="https://www.luminasmart.company/resources/annual-reports-where-to-find-them"'));

const resourceTemplate = fs.readFileSync(path.join(__dirname, '..', 'src', 'templates', 'resource.html'), 'utf8');
const resourceCss = fs.readFileSync(path.join(__dirname, '..', 'src', 'shared', 'base.css'), 'utf8');
assert(resourceCss.includes('.resource-table-wrap { max-width: 100%; overflow-x: auto;'), 'resource tables must be horizontally scrollable on narrow screens');
assert(resourceCss.includes('.reading-bookshelf { display: grid; grid-auto-flow: column;'), 'Reading List bookshelf must support horizontal cover browsing');
assert(resourceCss.includes('.reading-track-nav { display: grid;'), 'Reading List must expose a responsive learning-track navigation');
assert(resourceCss.includes('.resource-content .reading-item h3'), 'Reading List item titles must override generic uppercase resource h3 styling');

const readingPreviewResource = {
  ...readingEn,
  status: 'published',
  canonical: 'https://www.luminasmart.company/resources/civic-finance-reading-list',
  hreflang: {
    en: 'https://www.luminasmart.company/resources/civic-finance-reading-list',
    'pt-BR': 'https://www.luminasmart.company/pt-br/resources/lista-de-leituras-financas-civicas'
  },
  publishedAt: '2026-08-30',
  updatedAt: '2026-08-30'
};
const readingPreviewHtml = renderResourcePage(readingPreviewResource, resourceTemplate);
assert(readingPreviewHtml.includes('Reading List · Civic Finance'));
assert(readingPreviewHtml.includes('If you only read five things'));
assert.strictEqual((readingPreviewHtml.match(/class="reading-item"/g) || []).length, 25);
assert(readingPreviewHtml.includes('CollectionPage'));
assert(readingPreviewHtml.includes('"@type": "ItemList"'));
assert(readingPreviewHtml.includes('"numberOfItems": 25'));
assert(readingPreviewHtml.includes('"position": 25'));
assert(!readingPreviewHtml.includes('{{'));

const annualPreviewEnHtml = renderResourcePage(annualEn, resourceTemplate);
const annualPreviewPtHtml = renderResourcePage(annualPt, resourceTemplate);
assert(annualPreviewEnHtml.includes('Annual Reports — Where to Find Them'));
assert(annualPreviewEnHtml.includes('Start with the report name'));
assert(annualPreviewEnHtml.includes('Official examples by government level'));
assert(annualPreviewEnHtml.includes(SOURCE_LINKS.milwaukeeCity));
assert(annualPreviewEnHtml.includes(SOURCE_LINKS.illinois));
assert(annualPreviewEnHtml.includes(SOURCE_LINKS.northCarolina));
assert(annualPreviewEnHtml.includes('<table>'));
assert(annualPreviewEnHtml.includes('rel="canonical"'));
assert(annualPreviewEnHtml.includes('hreflang="x-default" href="https://www.luminasmart.company/resources/annual-reports-where-to-find-them"'));
assert(annualPreviewEnHtml.includes('application/ld+json'));
assert(annualPreviewEnHtml.includes('"datePublished": "2026-08-30"'));
assert(!annualPreviewEnHtml.includes('{{'));
assert(annualPreviewPtHtml.includes('Relatórios Anuais — Onde Encontrá-los'));
assert(annualPreviewPtHtml.includes('Comece pelo nome do relatório'));
assert(annualPreviewPtHtml.includes('Exemplos oficiais por nível de governo'));
assert(annualPreviewPtHtml.includes('lang="pt-BR"'));
assert(annualPreviewPtHtml.includes('<link rel="canonical" href="https://www.luminasmart.company/pt-br/resources/relatorios-anuais-onde-encontrar"'));
assert(!annualPreviewPtHtml.includes('{{'));

const pageResource = glossaryEn;
const pageHtml = renderResourcePage(pageResource, resourceTemplate);
assert(pageHtml.includes('rel="canonical"'));
assert(pageHtml.includes('application/ld+json'));
assert(pageHtml.includes('Glossary of Public Finance'));
assert((pageHtml.match(/class="glossary-entry"/g) || []).length === GLOSSARY_EN.length);
assert(pageHtml.includes('data-glossary-search'));
assert(pageHtml.includes('aria-label="Filter by initial letter"'), 'English glossary must expose the letter filter accessibly');
assert(pageHtml.includes('<button type="button" aria-pressed="false" data-glossary-letter="A">A</button>'), 'glossary letters must render as filter buttons');
assert(pageHtml.includes('data-glossary-letter="A"'), 'glossary entries must expose their initial letter');
assert(resourceTemplate.includes("var matchesLetter = letter === 'all' || entry.getAttribute('data-glossary-letter') === letter;"), 'resource template must combine letter filtering with search and category filters');
assert(resourceTemplate.includes('resetGlossaryLetters()'), 'resource template must support clearing the active letter filter');
assert(pageHtml.includes('DefinedTermSet'));
assert(pageHtml.includes('reasonable assurance'));
assert(pageHtml.includes('<nav class="nav civic" aria-label="Primary navigation">'), 'resource pages must include the Lumina global navigation');
assert(pageHtml.includes('href="/#services" data-translate="nav-focus"'), 'resource navigation must link back to the homepage Focus section');
assert(pageHtml.includes('href="/insights" data-translate="nav-insights"'), 'resource navigation must link to Insights');
assert(pageHtml.includes('href="/#newsletter-section" data-translate="nav-subscribe"'), 'resource navigation must link to Updates');
assert(pageHtml.includes('class="menu-toggle"'), 'resource navigation must include the responsive menu toggle');
assert.strictEqual((pageHtml.match(/class="lang-switch"/g) || []).length, 1, 'resource pages must render exactly one language switcher');
assert(!pageHtml.includes('class="resource-topline"'), 'legacy resource topline must not duplicate the global navigation');
assert(!pageHtml.includes('{{'));

const inlineScripts = [...pageHtml.matchAll(/<script>([\s\S]*?)<\/script>/g)];
const glossaryScript = inlineScripts[inlineScripts.length - 1]?.[1];
assert(glossaryScript && glossaryScript.includes('filterGlossary'), 'rendered resource page must include the glossary filter script');

function createGlossaryControl(kind, attributeName, attributeValue, active = false) {
  const attributes = {};
  if (attributeName) attributes[attributeName] = attributeValue;
  attributes['aria-pressed'] = active ? 'true' : 'false';
  const classes = new Set(active ? ['on'] : []);
  const listeners = {};
  return {
    kind,
    value: '',
    listeners,
    classList: {
      add: (name) => classes.add(name),
      remove: (name) => classes.delete(name),
      contains: (name) => classes.has(name)
    },
    addEventListener(type, handler) { listeners[type] = handler; },
    getAttribute(name) { return Object.prototype.hasOwnProperty.call(attributes, name) ? attributes[name] : null; },
    setAttribute(name, value) { attributes[name] = String(value); },
    matches(selector) {
      return (kind === 'category' && selector === '[data-glossary-filter]')
        || (kind === 'letter' && selector === '[data-glossary-letter]');
    }
  };
}

const searchControl = createGlossaryControl('search');
const categoryControls = ['all', ...new Set(GLOSSARY_EN.map((entry) => entry.category))]
  .map((category) => createGlossaryControl('category', 'data-glossary-filter', category, category === 'all'));
const letterControls = [...new Set(GLOSSARY_EN.map((entry) => entry.term[0].toUpperCase()))].sort()
  .map((letter) => createGlossaryControl('letter', 'data-glossary-letter', letter));
const glossaryEntryNodes = GLOSSARY_EN.map((entry) => ({
  hidden: false,
  getAttribute(name) {
    if (name === 'data-glossary-term') return entry.term.toLowerCase();
    if (name === 'data-glossary-category') return entry.category;
    if (name === 'data-glossary-letter') return entry.term[0].toUpperCase();
    return null;
  }
}));
const glossaryRoot = {
  querySelectorAll(selector) {
    return selector === '[data-glossary-term]' ? glossaryEntryNodes : [];
  }
};
const fakeDocument = {
  querySelectorAll(selector) {
    if (selector === '[data-glossary-search]') return [searchControl];
    if (selector === '[data-glossary-filter], [data-glossary-letter]') return [...categoryControls, ...letterControls];
    if (selector === '[data-glossary-letter]') return letterControls;
    if (selector === '[data-glossary-filter]') return categoryControls;
    return [];
  },
  querySelector(selector) {
    if (selector === '.glossary-entries') return glossaryRoot;
    if (selector === '[data-glossary-search]') return searchControl;
    if (selector === '[data-glossary-filter].on') return categoryControls.find((control) => control.classList.contains('on')) || null;
    if (selector === '[data-glossary-letter].on') return letterControls.find((control) => control.classList.contains('on')) || null;
    return null;
  }
};

vm.runInNewContext(glossaryScript, { document: fakeDocument });
const clickControl = (control) => control.listeners.click({ target: control });
const visibleEntries = () => glossaryEntryNodes.filter((entry) => !entry.hidden);
const letterR = letterControls.find((control) => control.getAttribute('data-glossary-letter') === 'R');
assert(letterR, 'R letter control must exist');
clickControl(letterR);
assert(visibleEntries().length > 0, 'letter filter must leave matching terms visible');
assert(visibleEntries().every((entry) => entry.getAttribute('data-glossary-letter') === 'R'), 'R filter must hide terms beginning with other letters');
assert.strictEqual(letterR.getAttribute('aria-pressed'), 'true');
clickControl(letterR);
assert.strictEqual(visibleEntries().length, GLOSSARY_EN.length, 'clicking the active letter again must clear the letter filter');

clickControl(letterR);
const revenuesControl = categoryControls.find((control) => control.getAttribute('data-glossary-filter') === 'Revenues & Taxes');
clickControl(revenuesControl);
assert(visibleEntries().length > 0, 'combined category and letter filters must keep matching terms visible');
assert(visibleEntries().every((entry) => entry.getAttribute('data-glossary-letter') === 'R' && entry.getAttribute('data-glossary-category') === 'Revenues & Taxes'), 'letter and category filters must combine');
const allControl = categoryControls.find((control) => control.getAttribute('data-glossary-filter') === 'all');
clickControl(allControl);
assert.strictEqual(visibleEntries().length, GLOSSARY_EN.length, 'All category must clear the active letter filter');
assert.strictEqual(letterR.getAttribute('aria-pressed'), 'false');

searchControl.value = 'revenue';
searchControl.listeners.input({ target: searchControl });
assert(visibleEntries().length > 0, 'search must still work after letter filtering is introduced');
assert(visibleEntries().every((entry) => entry.getAttribute('data-glossary-term').includes('revenue')), 'search results must still match the query');

const ptPageHtml = renderResourcePage(glossaryPt, resourceTemplate);
assert(ptPageHtml.includes('Glossário de Finanças Públicas'));
assert(ptPageHtml.includes('lang="pt-BR"'));
assert(ptPageHtml.includes('aria-label="Filtrar pela letra inicial"'), 'PT-BR glossary must expose the letter filter accessibly');
assert(ptPageHtml.includes('<nav class="nav civic" aria-label="Primary navigation">'));
assert(ptPageHtml.includes('href="/resources/glossary-of-public-finance" hreflang="en"'), 'PT-BR resource navigation must link to the English pair');
assert.strictEqual((ptPageHtml.match(/class="lang-switch"/g) || []).length, 1);
assert((ptPageHtml.match(/class="glossary-entry"/g) || []).length === GLOSSARY_PT.length);
console.log('Resources architecture tests passed: manifest, pairs, homepage cards, routes, sitemap, Reading List draft architecture, global navigation, glossary letter filtering, and resource template.');
