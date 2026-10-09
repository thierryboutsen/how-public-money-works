'use strict';

const fs = require('fs');
const path = require('path');
const siteConfig = require('../site.config');
const { RESOURCE_MANIFEST, validateResourceManifest } = require('../src/resources/manifest');
const {
  renderResourcePage,
  copyRecursiveSync,
  createSharedAssetManifest,
  writeSharedAssets,
  copyPublicAsset
} = require('../build');

const ROOT_DIR = path.resolve(__dirname, '..');

function main() {
  const input = process.argv[2];
  if (!input) throw new Error('Usage: npm run resources:preview -- <resource-id-or-route>');

  const resource = RESOURCE_MANIFEST.find((item) => item.id === input || item.route === input);
  if (!resource) throw new Error(`Resource not found: ${input}`);
  if (!resource.content?.type) throw new Error(`${resource.id}: resource has no previewable content payload`);

  const validation = validateResourceManifest();
  if (validation.errors.length) throw new Error(`Resource preview validation failed:\n- ${validation.errors.join('\n- ')}`);

  const distDirectory = path.join(ROOT_DIR, 'dist');
  if (!fs.existsSync(distDirectory)) throw new Error('dist/ does not exist. Run npm run build before resource preview.');

  const previewDirectory = path.join(ROOT_DIR, '.preview');
  if (path.resolve(previewDirectory) !== path.join(ROOT_DIR, '.preview')) throw new Error('Unsafe preview path.');
  if (fs.existsSync(previewDirectory)) fs.rmSync(previewDirectory, { recursive: true, force: true });
  copyRecursiveSync(distDirectory, previewDirectory);

  const sharedAssets = createSharedAssetManifest();
  writeSharedAssets(previewDirectory, sharedAssets);
  copyPublicAsset(siteConfig.defaultSocialImage, previewDirectory);

  const resourceTemplate = fs.readFileSync(path.join(ROOT_DIR, 'src', 'templates', 'resource.html'), 'utf8');
  const pair = resource.pairedResourceId
    ? RESOURCE_MANIFEST.find((item) => item.id === resource.pairedResourceId)
    : null;
  const previewResources = [resource, pair].filter((item, index, items) => item && item.content?.type && items.indexOf(item) === index);

  for (const previewResource of previewResources) {
    const html = renderResourcePage(previewResource, resourceTemplate, { mode: 'preview', sharedAssets });
    const relativeOutputPath = `${previewResource.route.replace(/^\//, '')}.html`;
    const outputPath = path.join(previewDirectory, relativeOutputPath);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, html);
    console.log(`Resource preview generated without publication-state changes: ${path.relative(ROOT_DIR, outputPath)}`);
  }
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
