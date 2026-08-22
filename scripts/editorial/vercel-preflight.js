'use strict';

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const config = require('../../editorial.automation.config');
const {
  createCleanDeploymentSource,
  normalizedProductionEnvironment,
  writeVercelProjectLink
} = require('./publication-adapter');

const EXPECTED_PROJECT_ID = 'prj_59LQ2J5dM5OPTsHQQkvMxmBFKL9H';
const EXPECTED_ORG_ID_SHA256 = '7727b055efe8f79d8e49faa5b72d8cd938d941ddf26679539c65f4e420994052';
let sensitiveEnvironment = {};

function sha256(value) {
  return crypto.createHash('sha256').update(value, 'utf8').digest('hex');
}

function sanitize(value, environment) {
  let sanitized = String(value || '');
  for (const secret of Object.values(environment)) {
    if (secret) sanitized = sanitized.split(secret).join('[REDACTED]');
  }
  return sanitized.replace(/\s+/g, ' ').trim().slice(0, 500);
}

function runVercel(args, options) {
  const executable = process.platform === 'win32' ? 'vercel.cmd' : 'vercel';
  const result = spawnSync(executable, args, {
    cwd: options.cwd,
    env: { ...process.env, ...options.environment },
    encoding: 'utf8',
    shell: false
  });
  if (result.status !== 0) {
    const detail = sanitize(result.stderr || result.stdout || result.error?.message, options.environment);
    throw new Error(`${options.stage}: ${detail || `exit ${result.status}`}`);
  }
}

async function verifyProjectAccess(environment) {
  const url = new URL(`https://api.vercel.com/v9/projects/${encodeURIComponent(environment.VERCEL_PROJECT_ID)}`);
  url.searchParams.set('teamId', environment.VERCEL_ORG_ID);
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${environment.VERCEL_TOKEN}` },
    redirect: 'error'
  });
  if (!response.ok) throw new Error(`project-access-api: HTTP ${response.status}`);
  const project = await response.json();
  assert.strictEqual(project.id, EXPECTED_PROJECT_ID, 'project-access-api: unexpected project');
  assert.strictEqual(project.name, config.productionProjectName, 'project-access-api: unexpected project name');
}

async function main() {
  if (process.env.GITHUB_ACTIONS !== 'true') throw new Error('This preflight is restricted to GitHub Actions');
  const environment = normalizedProductionEnvironment();
  sensitiveEnvironment = environment;
  console.log('VERCEL_SECRETS_PRESENT=3/3');

  if (environment.VERCEL_PROJECT_ID !== EXPECTED_PROJECT_ID) {
    throw new Error('project-id-check: VERCEL_PROJECT_ID_MISMATCH');
  }
  console.log('VERCEL_PROJECT_ID_MATCH');

  if (sha256(environment.VERCEL_ORG_ID) !== EXPECTED_ORG_ID_SHA256) {
    throw new Error('org-id-check: VERCEL_ORG_ID_MISMATCH');
  }
  console.log('VERCEL_ORG_ID_MATCH');

  await verifyProjectAccess(environment);
  console.log('VERCEL_TOKEN_PROJECT_ACCESS_OK');

  const stagingRoot = createCleanDeploymentSource();
  try {
    writeVercelProjectLink(stagingRoot, environment);
    const linkPath = path.join(stagingRoot, '.vercel', 'project.json');
    const link = JSON.parse(fs.readFileSync(linkPath, 'utf8'));
    assert.strictEqual(link.projectId, EXPECTED_PROJECT_ID);
    assert.strictEqual(sha256(link.orgId), EXPECTED_ORG_ID_SHA256);
    assert.strictEqual(link.projectName, config.productionProjectName);
    console.log('VERCEL_PROJECT_LINK_VALID');

    runVercel(['pull', '--yes', '--environment=production', `--token=${environment.VERCEL_TOKEN}`], {
      cwd: stagingRoot,
      environment,
      stage: 'vercel-pull'
    });
    console.log('VERCEL_PULL_PASS');

    runVercel(['build', '--prod', `--token=${environment.VERCEL_TOKEN}`], {
      cwd: stagingRoot,
      environment,
      stage: 'vercel-build'
    });
    console.log('VERCEL_BUILD_PASS');
    console.log('VERCEL_PREFLIGHT_PASS');
  } finally {
    fs.rmSync(stagingRoot, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(`VERCEL_PREFLIGHT_FAIL ${sanitize(error.message, sensitiveEnvironment)}`);
  process.exitCode = 1;
});
