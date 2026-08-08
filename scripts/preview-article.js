'use strict';

const fs = require('fs');
const path = require('path');
const {
  ROOT_DIR,
  listMarkdownFiles,
  loadMarkdownFile,
  validateDocuments,
  publicPathForDocument
} = require('./content-utils');
const { renderPostPage, copyRecursiveSync } = require('../build');

function main() {
  const input = process.argv[2];
  if (!input) throw new Error('Usage: npm run content:preview -- <content/review/article.md>');

  const articlePath = path.resolve(ROOT_DIR, input);
  const reviewRoot = path.join(ROOT_DIR, 'content', 'review') + path.sep;
  if (!articlePath.startsWith(reviewRoot)) throw new Error('Preview input must be inside content/review/.');
  if (!fs.existsSync(articlePath)) throw new Error(`Review article not found: ${input}`);

  const publishedDocuments = listMarkdownFiles(path.join(ROOT_DIR, 'content', 'posts')).map(loadMarkdownFile);
  const reviewDocument = loadMarkdownFile(articlePath);
  const documents = [...publishedDocuments, reviewDocument];
  const validation = validateDocuments(documents, { requireReviewApproval: true });
  for (const warning of validation.warnings) console.warn(`Warning: ${warning}`);
  if (validation.errors.length) throw new Error(`Preview validation failed:\n- ${validation.errors.join('\n- ')}`);

  const distDirectory = path.join(ROOT_DIR, 'dist');
  if (!fs.existsSync(distDirectory)) throw new Error('dist/ does not exist. Run npm run build before preview.');

  const previewDirectory = path.join(ROOT_DIR, '.preview');
  if (path.resolve(previewDirectory) !== path.join(ROOT_DIR, '.preview')) throw new Error('Unsafe preview path.');
  if (fs.existsSync(previewDirectory)) fs.rmSync(previewDirectory, { recursive: true, force: true });
  copyRecursiveSync(distDirectory, previewDirectory);

  const postTemplate = fs.readFileSync(path.join(ROOT_DIR, 'src', 'templates', 'post.html'), 'utf8');
  const posts = [reviewDocument.data, ...publishedDocuments.map((document) => document.data)]
    .filter((post) => post.language === reviewDocument.data.language);
  const html = renderPostPage(reviewDocument, posts, postTemplate, posts.length, { mode: 'preview' });
  const relativeOutputPath = `${publicPathForDocument(reviewDocument).replace(/^\//, '')}.html`;
  const outputPath = path.join(previewDirectory, relativeOutputPath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, html);

  console.log(`Review preview generated without publication-state changes: ${path.relative(ROOT_DIR, outputPath)}`);
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
