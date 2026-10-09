'use strict';

const path = require('path');
const {
  ROOT_DIR,
  listMarkdownFiles,
  loadMarkdownFile,
  validateVisualCoverStandard,
  VISUAL_STYLE_ID
} = require('./content-utils');

const posts = listMarkdownFiles(path.join(ROOT_DIR, 'content', 'posts')).map(loadMarkdownFile);
const current = validateVisualCoverStandard(posts);
if (!current.pass) {
  throw new Error(`Current published cover library failed validation:\n${current.errors.join('\n')}`);
}

const source = posts.find((doc) => doc.data.featuredImage);
if (!source) throw new Error('No published article with featuredImage was found for negative visual-policy test');

const rejected = {
  ...source,
  relativePath: 'synthetic/rejected-cover.md',
  data: {
    ...source.data,
    featuredImage: '/assets/article-structural-budget-balance-hero.svg',
    status: 'published'
  }
};
const negative = validateVisualCoverStandard([rejected], { forceAll: true });
if (negative.pass || !negative.errors.some((error) => error.includes('retired emergency cover'))) {
  throw new Error('Visual policy failed to reject a retired emergency SVG cover');
}

console.log(`Visual cover policy passed for ${posts.length} published document(s) using ${VISUAL_STYLE_ID}.`);
