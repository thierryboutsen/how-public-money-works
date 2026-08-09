'use strict';

const assert = require('assert');
const { TRANSACTION_STAGES, executeTransaction } = require('./publication-adapter');

function hooksForFailure(failAt) {
  const state = { calls: [], registryWrites: 0, rollbacks: 0 };
  const hooks = {};
  for (const stage of TRANSACTION_STAGES) {
    hooks[stage] = async () => {
      state.calls.push(stage);
      if (stage === failAt) throw new Error(`mock failure at ${stage}`);
      if (stage === 'registryUpdate') state.registryWrites += 1;
    };
  }
  hooks.rollback = async () => { state.rollbacks += 1; };
  return { hooks, state };
}

async function main() {
  assert(TRANSACTION_STAGES.indexOf('publicExposureAudit') > TRANSACTION_STAGES.indexOf('audit'), 'public exposure audit must run after content audit');
  assert(TRANSACTION_STAGES.indexOf('publicExposureAudit') < TRANSACTION_STAGES.indexOf('deploy'), 'public exposure audit must run before deploy');
  for (const stage of TRANSACTION_STAGES) {
    const { hooks, state } = hooksForFailure(stage);
    const result = await executeTransaction(hooks);
    assert.notStrictEqual(result.status, 'SUCCESS', `${stage} failure must not succeed`);
    assert.strictEqual(result.failedStage, stage, `${stage} must be reported as failed stage`);
    assert.strictEqual(result.registryUpdated, false, `${stage} failure must not report registry update`);
    assert.strictEqual(state.registryWrites, 0, `${stage} failure must not perform a completed registry write`);
    assert.strictEqual(state.rollbacks, 1, `${stage} failure must invoke rollback`);
  }

  const { hooks, state } = hooksForFailure(null);
  const success = await executeTransaction(hooks);
  assert.strictEqual(success.status, 'SUCCESS');
  assert.strictEqual(success.registryUpdated, true);
  assert.strictEqual(state.registryWrites, 1);
  assert.deepStrictEqual(success.completed, TRANSACTION_STAGES);

  const unavailable = hooksForFailure('deploy');
  const abort = await executeTransaction(unavailable.hooks);
  assert.strictEqual(abort.status, 'ABORTED_BEFORE_DEPLOY');
  assert.strictEqual(abort.registryUpdated, false);

  console.log('Publication transaction tests passed: success and fail-closed behavior at every stage, including unavailable deploy adapter.');
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
