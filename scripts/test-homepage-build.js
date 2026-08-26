'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const {
  buildSite,
  contentFingerprint,
  createSharedAssetManifest,
  renderIndexPage,
  selectHomepagePosts
} = require('../build');
const { ROOT_DIR } = require('./content-utils');

function fakePost(letter, date, overrides = {}) {
  const slug = `article-${letter.toLowerCase()}`;
  return {
    title: `Article ${letter}`,
    subtitle: `Subtitle ${letter}`,
    excerpt: `Excerpt ${letter}`,
    slug,
    language: 'en',
    category: 'Public Finance Basics',
    readingTime: '5 min read',
    date,
    featuredImage: '/assets/article-city-budget-hero.jpg',
    featuredImageAlt: `Illustration ${letter}`,
    tags: [],
    translations: {},
    ...overrides
  };
}

const a = fakePost('A', '2026-01-04');
const b = fakePost('B', '2026-01-03');
const c = fakePost('C', '2026-01-02');
const d = fakePost('D', '2026-01-01');
const firstSelection = selectHomepagePosts([c, a, d, b]);
assert.strictEqual(firstSelection.featured.title, 'Article A');
assert.deepStrictEqual(firstSelection.cards.map((post) => post.title), ['Article B', 'Article C', 'Article D']);

const e = fakePost('E', '2026-01-05');
const secondSelection = selectHomepagePosts([e, a, b, c, d]);
assert.strictEqual(secondSelection.featured.title, 'Article E');
assert.deepStrictEqual(secondSelection.cards.map((post) => post.title), ['Article A', 'Article B', 'Article C']);
assert(!secondSelection.cards.includes(secondSelection.featured), 'featured article must not repeat in the recent-card grid');

const explicitlyFeatured = selectHomepagePosts([e, a, b, c, { ...d, featured: true }]);
assert.strictEqual(explicitlyFeatured.featured.title, 'Article D');
assert.deepStrictEqual(explicitlyFeatured.cards.map((post) => post.title), ['Article E', 'Article A', 'Article B']);

const template = fs.readFileSync(path.join(ROOT_DIR, 'src', 'index.html'), 'utf8');
const sharedScript = fs.readFileSync(path.join(ROOT_DIR, 'src', 'shared', 'main.js'), 'utf8');
const translationSource = sharedScript.slice(
  sharedScript.indexOf('const TRANSLATIONS =') + 'const '.length,
  sharedScript.indexOf('document.addEventListener')
);
const translations = vm.runInNewContext(`${translationSource}; TRANSLATIONS;`);
const canonicalKeys = [
  'hero-eyebrow', 'hero-title-1', 'hero-title-accent', 'hero-lede',
  'areas-title', 'areas-title-accent', 'areas-lede',
  'area-01-title', 'area-01-desc', 'area-02-title', 'area-02-desc',
  'area-03-title', 'area-03-desc', 'area-04-title', 'area-04-desc',
  'area-05-title', 'area-05-desc', 'area-06-title', 'area-06-desc',
  'about-title', 'about-title-accent', 'about-title-end', 'about-p1', 'about-p2',
  'news-eyebrow', 'news-title', 'news-title-accent', 'news-desc', 'news-fine'
];
const homepageTranslationKeys = [...template.matchAll(/data-translate="([^"]+)"/g)].map((match) => match[1]);
for (const key of homepageTranslationKeys) {
  assert.strictEqual(typeof translations.en[key], 'string', `missing English homepage translation: ${key}`);
  assert.strictEqual(typeof translations.pt[key], 'string', `missing Portuguese homepage translation: ${key}`);
}
const normalizeText = (value) => value
  .replace(/<[^>]+>/g, '')
  .replace(/&amp;/g, '&')
  .replace(/&mdash;/g, '—')
  .replace(/\s+/g, ' ')
  .trim();
for (const key of canonicalKeys) {
  const pattern = new RegExp(`<[^>]+data-translate="${key}"[^>]*>([\\s\\S]*?)<\\/[^>]+>`, 'g');
  const matches = [...template.matchAll(pattern)].map((match) => normalizeText(match[1]));
  assert(matches.length > 0, `canonical homepage key is missing: ${key}`);
  for (const initialText of matches) {
    assert.strictEqual(initialText, normalizeText(translations.en[key]), `initial English copy drift for ${key}`);
  }
}
const rendered = renderIndexPage(template, [e, a, b, c, d]);
assert(rendered.includes('Article E'), 'rendered homepage must use the selected featured article');
assert(rendered.includes('Article A') && rendered.includes('Article B') && rendered.includes('Article C'), 'rendered homepage must include the next three posts');
assert(!rendered.includes('Article D'), 'rendered homepage must not include a stale fourth card');
assert(!rendered.includes('<form'), 'homepage must not render a nonfunctional subscription form');
assert(!/successfully subscribed|inscrição foi realizada com sucesso/i.test(rendered), 'homepage must not claim a subscription succeeded');
assert(rendered.includes('Coming soon'), 'unavailable resources and updates must be identified honestly');
assert(rendered.includes('href="/where-do-your-local-taxes-actually-go"'), 'live resource must link to its article route');
assert(!/Vol\. I|Twelve Essays|Doze Artigos/.test(rendered), 'homepage must not contain fixed-volume language');
assert(/\.hero-civic \.image-wrap \{[^}]*display:\s*flex;[^}]*flex-direction:\s*column;[^}]*\}/.test(template), 'homepage hero image and editorial card must use normal-flow stacking');
const heroImageCardRules = [...template.matchAll(/\.hero-civic \.image-card \{([^}]*)\}/g)].map((match) => match[1]);
const heroImageCardRule = heroImageCardRules[0] || '';
assert(/position:\s*relative;/.test(heroImageCardRule) && /align-self:\s*flex-end;/.test(heroImageCardRule), 'desktop editorial card must remain in normal flow below the hero image');
assert(!/position:\s*absolute;/.test(heroImageCardRule), 'homepage editorial card must never return to absolute overlay positioning');
assert(heroImageCardRules.some((rule) => /align-self:\s*stretch;/.test(rule) && /width:\s*100%;/.test(rule)), 'mobile editorial card must stack at full available width without overlap');

const firstManifest = createSharedAssetManifest();
const secondManifest = createSharedAssetManifest();
assert.deepStrictEqual(firstManifest, secondManifest, 'unchanged shared assets must keep stable content hashes');
assert.notStrictEqual(contentFingerprint('body{}'), contentFingerprint('body{color:red}'), 'changed shared content must produce a new filename hash');
assert(/^\/shared\/base\.[a-f0-9]{12}\.css$/.test(firstManifest.css));
assert(/^\/shared\/main\.[a-f0-9]{12}\.js$/.test(firstManifest.js));

const build = buildSite();
const builtHome = fs.readFileSync(path.join(build.outputDirectory, 'index.html'), 'utf8');
assert(builtHome.includes(firstManifest.css) && builtHome.includes(firstManifest.js), 'built homepage must reference hashed shared assets');
assert(!builtHome.includes('shared/base.css') && !builtHome.includes('shared/main.js'), 'built homepage must not reference unversioned shared assets');
assert(!builtHome.includes('<form'), 'built homepage must not contain a newsletter form');

console.log('Homepage build tests passed: dynamic selection, honest resources, newsletter state, canonical copy, and shared-asset hashing.');
