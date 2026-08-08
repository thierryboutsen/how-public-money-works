'use strict';

const assert = require('assert');
const { parseMarkdownFrontmatter, stringifyMarkdownFrontmatter } = require('./content-utils');

const sample = `---
title: "Safe parser sample"
slug: safe-parser-sample
tags:
  - public finance
translations:
  pt-BR: /pt-br/exemplo
---

# Body
`;
const parsed = parseMarkdownFrontmatter(sample, 'sample.md');
assert.strictEqual(parsed.data.title, 'Safe parser sample');
assert.deepStrictEqual(parsed.data.tags, ['public finance']);
assert(parsed.content.includes('# Body'));

const roundTrip = parseMarkdownFrontmatter(stringifyMarkdownFrontmatter(parsed.data, parsed.content), 'round-trip.md');
assert.deepStrictEqual(roundTrip.data, parsed.data);

assert.throws(
  () => parseMarkdownFrontmatter('---\ntitle: one\ntitle: two\n---\n', 'duplicate.md'),
  /Map keys must be unique|unique/i,
  'duplicate YAML keys must be rejected'
);
assert.throws(
  () => parseMarkdownFrontmatter('---\nbase: &base { title: unsafe }\ncopy: *base\n---\n', 'alias.md'),
  /Excessive alias count|alias/i,
  'YAML aliases must be rejected'
);

console.log('Frontmatter parser tests passed: existing structures round-trip, duplicate keys rejected, aliases rejected.');
