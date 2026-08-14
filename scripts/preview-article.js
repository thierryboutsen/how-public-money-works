'use strict';

const fs = require('fs');
const path = require('path');
const siteConfig = require('../site.config');
const {
  ROOT_DIR,
  listMarkdownFiles,
  loadMarkdownFile,
  validateDocuments,
  publicPathForDocument
} = require('./content-utils');
const { renderPostPage, copyPublicAsset, copyRecursiveSync } = require('../build');

function main() {
  const input = process.argv[2];
  if (!input) throw new Error('Usage: npm run content:preview -- <content/review/article.md>');

  const articlePath = path.resolve(ROOT_DIR, input);
  const reviewRoot = path.join(ROOT_DIR, 'content', 'review') + path.sep;
  if (!articlePath.startsWith(reviewRoot)) throw new Error('Preview input must be inside content/review/.');
  if (!fs.existsSync(articlePath)) throw new Error(`Review article not found: ${input}`);

  const publishedDocuments = listMarkdownFiles(path.join(ROOT_DIR, 'content', 'posts')).map(loadMarkdownFile);
  const reviewDocuments = listMarkdownFiles(path.join(ROOT_DIR, 'content', 'review')).map(loadMarkdownFile);
  const reviewDocument = reviewDocuments.find((document) => document.filePath === articlePath);
  if (!reviewDocument) throw new Error(`Review article could not be loaded: ${input}`);
  const documents = [...publishedDocuments, ...reviewDocuments];
  const validation = validateDocuments(documents, { requireReviewApproval: false });
  for (const warning of validation.warnings) console.warn(`Warning: ${warning}`);
  if (validation.errors.length) throw new Error(`Preview validation failed:\n- ${validation.errors.join('\n- ')}`);

  const distDirectory = path.join(ROOT_DIR, 'dist');
  if (!fs.existsSync(distDirectory)) throw new Error('dist/ does not exist. Run npm run build before preview.');

  const previewDirectory = path.join(ROOT_DIR, '.preview');
  if (path.resolve(previewDirectory) !== path.join(ROOT_DIR, '.preview')) throw new Error('Unsafe preview path.');
  if (fs.existsSync(previewDirectory)) fs.rmSync(previewDirectory, { recursive: true, force: true });
  copyRecursiveSync(distDirectory, previewDirectory);
  copyPublicAsset(siteConfig.defaultSocialImage, previewDirectory);

  const postTemplate = fs.readFileSync(path.join(ROOT_DIR, 'src', 'templates', 'post.html'), 'utf8');
  const previewDocuments = reviewDocument.data.translationKey
    ? reviewDocuments.filter((document) => document.data.translationKey === reviewDocument.data.translationKey)
    : [reviewDocument];

  for (const previewDocument of previewDocuments) {
    if (previewDocument.data.featuredImage) copyPublicAsset(previewDocument.data.featuredImage, previewDirectory);
    const posts = [previewDocument.data, ...publishedDocuments.map((document) => document.data)]
      .filter((post) => post.language === previewDocument.data.language);
    const html = renderPostPage(previewDocument, posts, postTemplate, posts.length, { mode: 'preview' });
    const relativeOutputPath = `${publicPathForDocument(previewDocument).replace(/^\//, '')}.html`;
    const outputPath = path.join(previewDirectory, relativeOutputPath);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, html);
    console.log(`Review preview generated without publication-state changes: ${path.relative(ROOT_DIR, outputPath)}`);
  }
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
