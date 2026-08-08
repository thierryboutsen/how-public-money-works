'use strict';

const path = require('path');
const {
  ROOT_DIR,
  listMarkdownFiles,
  loadMarkdownFile,
  validateDocuments
} = require('./content-utils');

function parseScope(argv) {
  const scopeIndex = argv.indexOf('--scope');
  return scopeIndex >= 0 ? argv[scopeIndex + 1] : 'all';
}

function main() {
  const scope = parseScope(process.argv.slice(2));
  if (!['all', 'review', 'published'].includes(scope)) {
    throw new Error(`Unknown scope: ${scope}. Use all, review, or published.`);
  }

  const postsDirectory = path.join(ROOT_DIR, 'content', 'posts');
  const reviewDirectory = path.join(ROOT_DIR, 'content', 'review');
  const postFiles = listMarkdownFiles(postsDirectory);
  const reviewFiles = scope === 'published' ? [] : listMarkdownFiles(reviewDirectory);
  const documents = [...postFiles, ...reviewFiles].map(loadMarkdownFile);
  const validation = validateDocuments(documents, {
    requireReviewApproval: false
  });

  for (const warning of validation.warnings) console.warn(`Warning: ${warning}`);
  if (validation.errors.length) {
    console.error(`Content validation failed with ${validation.errors.length} error(s):`);
    for (const error of validation.errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }

  console.log(`Content validation passed for ${documents.length} document(s) in ${scope} scope.`);
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
