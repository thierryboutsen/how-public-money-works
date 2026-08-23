'use strict';

const assert = require('node:assert/strict');
const { externalLinkCheck } = require('./engine');

function neverResponds(_url, { signal }) {
  return new Promise((_resolve, reject) => {
    const abort = () => {
      const error = new Error('aborted');
      error.name = 'AbortError';
      reject(error);
    };
    if (signal.aborted) abort();
    else signal.addEventListener('abort', abort, { once: true });
  });
}

async function main() {
  const pair = [{ content: '[Official source](https://example.invalid/slow-source)' }];
  const startedAt = Date.now();
  const result = await externalLinkCheck(pair, {
    fetchFn: neverResponds,
    timeoutMs: 20,
    retries: 0,
    concurrency: 1,
    deadlineMs: 80
  });
  const durationMs = Date.now() - startedAt;
  assert.equal(result.pass, false, 'a timed-out source must not pass');
  assert.equal(result.urls[0].classification, 'SOURCE_TRANSIENT_TIMEOUT');
  assert.equal(result.diagnostics.timeoutMs, 20);
  assert.equal(result.diagnostics.retries, 0);
  assert(durationMs < 500, `inventory source timeout exceeded deterministic bound: ${durationMs}ms`);
  console.log('Inventory timeout tests passed: bounded source timeout, no retry escalation, and fail-closed classification.');
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
