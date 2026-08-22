'use strict';

const assert = require('assert');
const path = require('path');
const config = require('../../editorial.automation.config');
const {
  TRANSACTION_STAGES,
  commitAndPushPaths,
  executeTransaction,
  normalizedProductionEnvironment,
  verifyPublicRelease,
  waitForGitDeployment
} = require('./publication-adapter');
const { cycleHasTransactionFailure, finalDecisionForCycle } = require('./run-slot');

function hooksForFailure(failAt) {
  const state = { calls: [], registryWrites: 0, rollbacks: 0 };
  const hooks = {};
  for (const stage of TRANSACTION_STAGES) {
    hooks[stage] = async () => {
      state.calls.push(stage);
      if (stage === failAt) throw new Error(`mock failure at ${stage}`);
      if (stage === 'registryCommit') state.registryWrites += 1;
    };
  }
  hooks.rollback = async () => { state.rollbacks += 1; };
  return { hooks, state };
}

function mockResponse(status, body = '', jsonValue = null) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => body,
    json: async () => jsonValue
  };
}

async function main() {
  const productionEnvironment = normalizedProductionEnvironment({
    GITHUB_TOKEN: ' test-github-token ',
    GITHUB_REPOSITORY: ` ${config.productionRepository} `
  });
  assert.deepStrictEqual(productionEnvironment, {
    GITHUB_TOKEN: 'test-github-token',
    GITHUB_REPOSITORY: config.productionRepository
  });
  assert.throws(() => normalizedProductionEnvironment({}), /GITHUB_TOKEN, GITHUB_REPOSITORY/);
  assert(!config.requiredProductionEnvironmentVariables.some((name) => name.startsWith('VERCEL_')), 'publication must not require Vercel secrets');
  assert.strictEqual(config.gitIntegrationTriggerVerified, true, 'the Actions push trigger was verified by the controlled canary');

  assert(TRANSACTION_STAGES.indexOf('publicExposureAudit') > TRANSACTION_STAGES.indexOf('audit'));
  assert(TRANSACTION_STAGES.indexOf('publicExposureAudit') < TRANSACTION_STAGES.indexOf('publishCommit'));
  assert(TRANSACTION_STAGES.indexOf('publishCommit') < TRANSACTION_STAGES.indexOf('deployWait'));
  assert(TRANSACTION_STAGES.indexOf('publicVerify') < TRANSACTION_STAGES.indexOf('registryCommit'));

  for (const stage of TRANSACTION_STAGES) {
    const { hooks, state } = hooksForFailure(stage);
    const result = await executeTransaction(hooks);
    assert.notStrictEqual(result.status, 'SUCCESS', `${stage} failure must not succeed`);
    assert.strictEqual(result.failedStage, stage);
    assert.strictEqual(result.registryUpdated, false);
    assert.strictEqual(state.registryWrites, 0, `${stage} failure must not complete registry commit`);
    assert.strictEqual(state.rollbacks, 1);
    if (TRANSACTION_STAGES.indexOf(stage) > TRANSACTION_STAGES.indexOf('publishCommit')) {
      assert.strictEqual(result.status, 'FAILED_AFTER_PUBLICATION_COMMIT');
      assert.strictEqual(result.publicationCommitPushed, true);
    }
  }

  const { hooks, state } = hooksForFailure(null);
  const success = await executeTransaction(hooks);
  assert.strictEqual(success.status, 'SUCCESS');
  assert.strictEqual(success.registryUpdated, true);
  assert.strictEqual(state.registryWrites, 1);
  assert.deepStrictEqual(success.completed, TRANSACTION_STAGES);

  const deploymentFailure = hooksForFailure('deployWait');
  const abort = await executeTransaction(deploymentFailure.hooks);
  assert.strictEqual(abort.status, 'FAILED_AFTER_PUBLICATION_COMMIT');
  assert.strictEqual(abort.publicationCommitPushed, true);
  assert.strictEqual(abort.deploymentVerified, false);
  assert.strictEqual(abort.registryUpdated, false);
  const failureCycle = { results: [{ adapterStarted: true, registryUpdate: false, transaction: abort }] };
  assert.strictEqual(cycleHasTransactionFailure(failureCycle), true);
  assert.strictEqual(finalDecisionForCycle(failureCycle), 'ABORTED');

  const gitCalls = [];
  const authorizedPaths = [
    path.join(process.cwd(), 'content', 'review', 'pair-en.md'),
    path.join(process.cwd(), 'content', 'posts', 'pair-en.md')
  ];
  const expectedRelative = ['content/posts/pair-en.md', 'content/review/pair-en.md'];
  const commitSha = commitAndPushPaths(authorizedPaths, 'content: publish pair-en', {
    runCommand(command, args) {
      gitCalls.push([command, ...args]);
      if (args[0] === 'diff') return expectedRelative.join('\n');
      if (args[0] === 'rev-parse') return 'abc123';
      return '';
    }
  });
  assert.strictEqual(commitSha, 'abc123');
  assert(gitCalls.some((call) => call.join(' ') === `git add -- ${expectedRelative.join(' ')}`));
  assert(gitCalls.some((call) => call.join(' ') === `git push origin HEAD:${config.productionBranch}`));
  assert(!gitCalls.some((call) => call.includes('--force')), 'publication push must never force-push');

  const ambiguousSha = commitAndPushPaths(authorizedPaths, 'content: publish pair-en', {
    runCommand(_command, args) {
      if (args[0] === 'diff') return expectedRelative.join('\n');
      if (args[0] === 'rev-parse') return 'abc123';
      if (args[0] === 'push') throw new Error('mock transport interruption');
      if (args[0] === 'ls-remote') return `abc123\trefs/heads/${config.productionBranch}`;
      return '';
    }
  });
  assert.strictEqual(ambiguousSha, 'abc123', 'remote SHA must resolve a transport-ambiguous successful push');

  let deploymentPoll = 0;
  const deployment = await waitForGitDeployment('abc123', {
    environment: productionEnvironment,
    maxAttempts: 2,
    intervalMs: 0,
    sleep: async () => {},
    fetchFn: async (url) => {
      if (url.includes('/statuses')) return mockResponse(200, '', [{ state: 'success', environment_url: 'https://deployment.example' }]);
      deploymentPoll += 1;
      return mockResponse(200, '', deploymentPoll === 1 ? [] : [{ id: 42, sha: 'abc123', environment: 'Production' }]);
    }
  });
  assert.deepStrictEqual(deployment, { deploymentId: 42, deploymentUrl: 'https://deployment.example', state: 'success' });

  await assert.rejects(() => waitForGitDeployment('bad123', {
    environment: productionEnvironment,
    maxAttempts: 1,
    fetchFn: async (url) => url.includes('/statuses')
      ? mockResponse(200, '', [{ state: 'failure' }])
      : mockResponse(200, '', [{ id: 43, sha: 'bad123', environment: 'Production' }])
  }), /deployment failure/);

  const pair = [
    { data: { language: 'en', slug: 'test-en', title: 'Test EN', seoTitle: 'Test EN' } },
    { data: { language: 'pt-BR', slug: 'teste-pt', title: 'Teste PT', seoTitle: 'Teste PT' } }
  ];
  const fetchFn = async (url) => {
    if (url.endsWith('/test-en')) return mockResponse(200, '<title>Test EN</title><link rel="canonical" href="https://www.luminasmart.company/test-en">');
    if (url.endsWith('/pt-br/teste-pt')) return mockResponse(200, '<title>Teste PT</title><link rel="canonical" href="https://www.luminasmart.company/pt-br/teste-pt">');
    if (url.endsWith('/insights')) return mockResponse(200, '<a href="/test-en">EN</a><a href="/pt-br/teste-pt">PT</a>');
    if (url.endsWith('/sitemap.xml')) return mockResponse(200, '<loc>https://www.luminasmart.company/test-en</loc><loc>https://www.luminasmart.company/pt-br/teste-pt</loc>');
    return mockResponse(200, '<html>home</html>');
  };
  await verifyPublicRelease(pair, { fetchFn, maxAttempts: 1 });
  await assert.rejects(() => verifyPublicRelease(pair, {
    fetchFn: async (url) => url.endsWith('/insights') ? mockResponse(500) : fetchFn(url),
    maxAttempts: 1
  }), /insights returned HTTP 500/);

  console.log('Git-native publication transaction tests passed: exact-path push, deployment wait, public verification, and post-verify registry gating.');
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
