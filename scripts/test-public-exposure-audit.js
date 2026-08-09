'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { ROOT_DIR } = require('./content-utils');
const { copyRecursiveSync } = require('../build');
const { auditPublicExposure, inspectJpegMetadata } = require('./public-exposure-audit');

const DIST_DIR = path.join(ROOT_DIR, 'dist');

function runCase(name, mutate, expected) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), `hpw-exposure-${name}-`));
  try {
    copyRecursiveSync(DIST_DIR, directory);
    mutate(directory);
    const result = auditPublicExposure(directory);
    assert(result.errors.some((error) => expected.test(error)), `${name} was not detected. Errors: ${result.errors.join('; ')}`);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
}

function write(directory, relativePath, content) {
  const target = path.join(directory, ...relativePath.split('/'));
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}

function append(directory, relativePath, content) {
  fs.appendFileSync(path.join(directory, ...relativePath.split('/')), content);
}

assert(fs.existsSync(DIST_DIR), 'dist/ must exist; run npm run build before public exposure tests');
assert.deepStrictEqual(auditPublicExposure(DIST_DIR).errors, [], 'clean dist must pass before negative cases');

runCase('review', (directory) => write(directory, 'content/review/fictitious.md', '# Internal review'), /outside the public output allowlist/);
runCase('draft', (directory) => write(directory, 'content/drafts/fictitious.md', '# Internal draft'), /outside the public output allowlist/);
runCase('map', (directory) => write(directory, 'shared/main.js.map', '{}'), /source maps are prohibited|outside the public output allowlist/);
runCase('markdown', (directory) => write(directory, 'internal-notes.md', '# Private notes'), /outside the public output allowlist/);
runCase('codex', (directory) => append(directory, 'index.html', '<p>Codex</p>'), /prohibited AI\/tool name/);
runCase('local-path', (directory) => append(directory, 'index.html', '<p>C:\\Projetos\\private</p>'), /prohibited local filesystem path/);
runCase('legacy-domain', (directory) => append(directory, 'index.html', '<a href="https:\/\/elianafariasima.com">legacy</a>'), /deprecated domain/);
runCase('preview-route', (directory) => fs.copyFileSync(path.join(directory, 'index.html'), path.join(directory, 'preview.html')), /unauthorized article\/page|outside the public output allowlist/);
runCase('internal-comment', (directory) => append(directory, 'index.html', '<!-- TODO: run editorial automation -->'), /internal HTML comment|editorial automation marker/);

const jpegWithExif = Buffer.from([
  0xFF, 0xD8,
  0xFF, 0xE1, 0x00, 0x08, 0x45, 0x78, 0x69, 0x66, 0x00, 0x00,
  0xFF, 0xDA, 0x00, 0x02, 0xFF, 0xD9
]);
assert(inspectJpegMetadata(jpegWithExif).includes('APP1-EXIF-or-XMP'), 'EXIF metadata must be detected');

console.log('Public exposure negative tests passed: review, draft, source map, markdown, tooling marker, local path, legacy domain, preview route, internal comment, and EXIF metadata.');
