'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const YAML = require('yaml');
const config = require('../../editorial.automation.config');
const siteConfig = require('../../site.config');
const {
  ROOT_DIR,
  absoluteUrl,
  publicPathForDocument,
  stringifyMarkdownFrontmatter
} = require('../content-utils');

const TRANSACTION_STAGES = ['precheck', 'promote', 'validate', 'build', 'audit', 'publicExposureAudit', 'publishCommit', 'deployWait', 'publicVerify', 'registryCommit'];

async function executeTransaction(hooks, context = {}) {
  const completed = [];
  let publicationCommitPushed = false;
  let deploymentVerified = false;
  let registryUpdated = false;
  try {
    for (const stage of TRANSACTION_STAGES) {
      if (typeof hooks[stage] !== 'function') throw new Error(`Missing transaction hook: ${stage}`);
      await hooks[stage](context);
      completed.push(stage);
      if (stage === 'publishCommit') publicationCommitPushed = true;
      if (stage === 'deployWait') deploymentVerified = true;
      if (stage === 'registryCommit') registryUpdated = true;
    }
    return { status: 'SUCCESS', completed, publicationCommitPushed, deploymentVerified, registryUpdated };
  } catch (error) {
    if (typeof hooks.rollback === 'function') await hooks.rollback(context, { completed, publicationCommitPushed, deploymentVerified, registryUpdated, error });
    return {
      status: publicationCommitPushed ? 'FAILED_AFTER_PUBLICATION_COMMIT' : 'ABORTED_BEFORE_PUBLICATION_COMMIT',
      failedStage: TRANSACTION_STAGES[completed.length],
      completed,
      publicationCommitPushed,
      deploymentVerified,
      registryUpdated: false,
      error: error.message
    };
  }
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd || ROOT_DIR,
    encoding: 'utf8',
    shell: false,
    env: { ...process.env, ...(options.env || {}) }
  });
  if (result.error || result.status !== 0) {
    throw new Error(`${options.label || command} failed: ${result.error?.message || (result.stderr || '').trim() || `exit ${result.status}`}`);
  }
  return (result.stdout || '').trim();
}

function normalizedProductionEnvironment(source = process.env) {
  const normalized = {};
  const missing = [];
  for (const name of config.requiredProductionEnvironmentVariables) {
    const value = typeof source[name] === 'string' ? source[name].trim() : '';
    if (!value) missing.push(name);
    else normalized[name] = value;
  }
  if (missing.length) throw new Error(`Missing required production environment variable names: ${missing.join(', ')}`);
  return normalized;
}

function gitPath(filePath) {
  return path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');
}

function commitAndPushPaths(filePaths, message, options = {}) {
  const runCommand = options.runCommand || run;
  const relativePaths = [...new Set(filePaths.map(gitPath))].sort();
  const relativeDeletionPaths = [...new Set((options.deletedPaths || []).map(gitPath))].sort();
  if (relativePaths.length === 0) throw new Error('Git publication commit has no authorized paths');
  runCommand('git', ['config', 'user.name', 'github-actions[bot]'], { label: 'git configure author name' });
  runCommand('git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com'], { label: 'git configure author email' });
  if (relativeDeletionPaths.length) {
    runCommand('git', ['add', '--update', '--', ...relativeDeletionPaths], { label: 'git stage authorized publication deletions' });
  }
  const relativeAdditionPaths = relativePaths.filter((filePath) => !relativeDeletionPaths.includes(filePath));
  if (relativeAdditionPaths.length) {
    runCommand('git', ['add', '--', ...relativeAdditionPaths], { label: 'git stage authorized publication paths' });
  }
  const staged = runCommand('git', ['diff', '--cached', '--no-renames', '--name-only'], { label: 'git inspect staged publication paths' })
    .split(/\r?\n/).filter(Boolean).sort();
  if (JSON.stringify(staged) !== JSON.stringify(relativePaths)) {
    throw new Error(`Git staged path mismatch: expected ${relativePaths.join(', ')}, received ${staged.join(', ')}`);
  }
  runCommand('git', ['commit', '-m', message], { label: 'git create publication commit' });
  const commitSha = runCommand('git', ['rev-parse', 'HEAD'], { label: 'git read publication commit SHA' });
  try {
    runCommand('git', ['push', 'origin', `HEAD:${config.productionBranch}`], { label: 'git push publication commit' });
  } catch (error) {
    const remoteLine = runCommand('git', ['ls-remote', 'origin', `refs/heads/${config.productionBranch}`], { label: 'git resolve ambiguous publication push' });
    const remoteSha = remoteLine.split(/\s+/)[0];
    if (remoteSha !== commitSha) throw error;
  }
  return commitSha;
}

async function githubApi(pathname, options = {}) {
  const environment = options.environment || normalizedProductionEnvironment();
  if (environment.GITHUB_REPOSITORY !== config.productionRepository) throw new Error('GitHub repository identity mismatch');
  const response = await (options.fetchFn || fetch)(`https://api.github.com${pathname}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${environment.GITHUB_TOKEN}`,
      'User-Agent': 'HowPublicMoneyWorks-PublicationVerifier/1.0',
      'X-GitHub-Api-Version': '2022-11-28'
    }
  });
  if (!response.ok) throw new Error(`GitHub deployment API returned HTTP ${response.status}`);
  return response.json();
}

async function waitForGitDeployment(commitSha, options = {}) {
  const maxAttempts = options.maxAttempts || 60;
  const intervalMs = options.intervalMs ?? 10000;
  const sleep = options.sleep || ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
  const repository = (options.environment || process.env).GITHUB_REPOSITORY || config.productionRepository;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const deployments = await githubApi(`/repos/${repository}/deployments?sha=${encodeURIComponent(commitSha)}&environment=Production&per_page=10`, options);
    const deployment = deployments.find((item) => item.sha === commitSha && item.environment === 'Production');
    if (deployment) {
      const statuses = await githubApi(`/repos/${repository}/deployments/${deployment.id}/statuses?per_page=10`, options);
      const latest = statuses[0];
      if (latest?.state === 'success') {
        return { deploymentId: deployment.id, deploymentUrl: latest.environment_url || null, state: latest.state };
      }
      if (['error', 'failure', 'inactive'].includes(latest?.state)) throw new Error(`Vercel Git deployment ${latest.state} for commit ${commitSha}`);
    }
    if (attempt < maxAttempts) await sleep(intervalMs);
  }
  throw new Error(`Timed out waiting for Vercel Git deployment associated with commit ${commitSha}`);
}

function npmCommand(args, label) {
  const npmCli = process.platform === 'win32'
    ? path.join(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js')
    : process.env.npm_execpath;
  if (!npmCli) throw new Error('npm CLI path is unavailable');
  return run(process.execPath, [npmCli, ...args], { label });
}

function npmRun(script) {
  return npmCommand(['run', script], `npm run ${script}`);
}

function snapshotsFor(paths) {
  return new Map(paths.map((filePath) => [filePath, fs.existsSync(filePath) ? fs.readFileSync(filePath) : null]));
}

function restoreSnapshots(snapshots) {
  for (const [filePath, content] of snapshots) {
    if (content === null) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } else {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, content);
    }
  }
}

function promotedData(document, publicationPath, publicationDate, topicAngleSignature) {
  const auto = publicationPath === 'auto-publish-fallback';
  return {
    ...document.data,
    date: publicationDate,
    status: 'published',
    lifecycleStatus: 'published',
    publicationApproval: 'approved',
    publishAllowed: true,
    canonicalDecision: 'approved',
    slugDecision: 'approved',
    publicationPath,
    autoPublishEligible: true,
    topicAngleSignature: document.data.topicAngleSignature || topicAngleSignature,
    ...(auto ? { humanReviewOutcome: 'no-response-by-cutoff' } : {})
  };
}

function updateRegistries(pair, publicationDate, publicationPath, topicAngleSignature, recoverySlot = null) {
  const articlePath = path.join(ROOT_DIR, 'content', 'registry', 'article-registry.yml');
  const topicPath = path.join(ROOT_DIR, 'content', 'registry', 'topic-registry.yml');
  const calendarPath = path.join(ROOT_DIR, 'content', 'calendar', 'editorial-calendar.yml');
  const articleRegistry = YAML.parse(fs.readFileSync(articlePath, 'utf8'));
  const topicRegistry = YAML.parse(fs.readFileSync(topicPath, 'utf8'));
  const calendar = YAML.parse(fs.readFileSync(calendarPath, 'utf8'));
  const english = pair.find((document) => document.data.language === 'en') || pair[0];

  for (const document of pair) {
    if (articleRegistry.articles.some((article) => article.slug === document.data.slug)) continue;
    articleRegistry.articles.push({
      slug: document.data.slug,
      title: document.data.title,
      language: document.data.language,
      status: 'published',
      publishDate: publicationDate,
      category: document.data.category,
      tags: document.data.tags,
      duplicateCheckSignature: document.data.topicAngleSignature || english.data.topicAngleSignature || topicAngleSignature,
      sourceLevel: document.data.sourceLevel,
      publicationPath,
      lastReviewed: publicationDate,
      ...(recoverySlot ? {
        originalScheduledDate: recoverySlot.originalScheduledDate,
        recoveryScheduledDate: recoverySlot.recoveryScheduledDate,
        recoveryReason: recoverySlot.recoveryReason,
        actualPublishedAt: publicationDate
      } : {})
    });
  }

  if (!topicRegistry.coveredTopics.some((topic) => topic.relatedSlug === english.data.slug)) {
    topicRegistry.coveredTopics.push({
      topic: english.data.category,
      subtopic: english.data.title,
      angle: english.data.topicAngleSignature || topicAngleSignature,
      status: 'covered',
      relatedSlug: english.data.slug,
      notes: 'Marked covered only after successful deploy and public verification.'
    });
  }

  if (recoverySlot) {
    const original = calendar.slots.find((item) => item.date === recoverySlot.originalScheduledDate);
    if (original) {
      original.recoveryScheduledDate = recoverySlot.recoveryScheduledDate;
      original.recoveryReason = recoverySlot.recoveryReason;
      original.recoveryStatus = 'recovered';
      original.actualPublishedAt = publicationDate;
      original.recoveredArticleSlug = english.data.slug;
    }
    const recovered = (calendar.recoverySlots || []).find((item) => item.recoveryScheduledDate === recoverySlot.recoveryScheduledDate && item.articleSlug === english.data.slug);
    if (recovered) {
      recovered.status = 'published';
      recovered.publicationDecision = 'published';
      recovered.result = 'published';
      recovered.publicationPath = publicationPath;
      recovered.publishedAt = publicationDate;
    }
  } else {
    const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'UTC' }).format(new Date(`${publicationDate}T12:00:00Z`));
    const slot = calendar.slots.find((item) => item.date === publicationDate) || calendar.slots.find((item) => item.slot === weekday && item.status !== 'published');
    if (slot) {
      slot.status = 'published';
      slot.articleSlug = english.data.slug;
      slot.result = 'published';
      slot.publicationPath = publicationPath;
      slot.publishedAt = publicationDate;
    }
  }

  fs.writeFileSync(articlePath, YAML.stringify(articleRegistry, { lineWidth: 0 }));
  fs.writeFileSync(topicPath, YAML.stringify(topicRegistry, { lineWidth: 0 }));
  fs.writeFileSync(calendarPath, YAML.stringify(calendar, { lineWidth: 0 }));
}

async function verifyPublicPair(pair, options = {}) {
  const fetchFn = options.fetchFn || fetch;
  const sleep = options.sleep || ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
  const maxAttempts = options.maxAttempts || 12;
  const intervalMs = options.intervalMs ?? 10000;
  let lastErrors = [];
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    lastErrors = [];
    for (const document of pair) {
      const url = absoluteUrl(publicPathForDocument(document));
      try {
        const response = await fetchFn(url, { redirect: 'follow', headers: { 'User-Agent': 'HowPublicMoneyWorks-PublicationVerifier/1.0' } });
        if (response.status !== 200) throw new Error(`${url} returned HTTP ${response.status}`);
        const html = await response.text();
        if (!html.includes(`<title>${document.data.seoTitle}`) && !html.includes(document.data.title)) throw new Error(`${url} does not contain the expected title`);
        if (!html.includes(`rel="canonical" href="${url}"`)) throw new Error(`${url} does not contain the expected canonical`);
      } catch (error) {
        lastErrors.push(error.message);
      }
    }
    if (lastErrors.length === 0) return;
    if (attempt < maxAttempts) await sleep(intervalMs);
  }
  throw new Error(`Public verification failed after retries: ${lastErrors.join('; ')}`);
}

async function verifyPublicRelease(pair, options = {}) {
  const fetchFn = options.fetchFn || fetch;
  await verifyPublicPair(pair, options);
  const pages = ['/', '/insights', '/sitemap.xml'];
  const bodies = new Map();
  for (const publicPath of pages) {
    const response = await fetchFn(absoluteUrl(publicPath), { redirect: 'follow', headers: { 'User-Agent': 'HowPublicMoneyWorks-PublicationVerifier/1.0' } });
    if (response.status !== 200) throw new Error(`${publicPath} returned HTTP ${response.status}`);
    bodies.set(publicPath, await response.text());
  }
    const englishDocument = pair.find((document) => document.data.language === 'en');
    if (!englishDocument) throw new Error('Public verification requires an English document');
    const englishPath = publicPathForDocument(englishDocument);
    if (!bodies.get('/insights').includes(englishPath)) throw new Error(`/insights does not link to ${englishPath}`);
    for (const document of pair) {
      const publicPath = publicPathForDocument(document);
      if (!bodies.get('/sitemap.xml').includes(absoluteUrl(publicPath))) throw new Error(`/sitemap.xml does not contain ${absoluteUrl(publicPath)}`);
    }
}

function createProductionHooks(pair, evaluation, options) {
  const publicationPath = options.publicationPath;
  const publicationDate = options.publicationDate;
  const reviewPaths = pair.map((document) => document.filePath);
  const postPaths = pair.map((document) => path.join(ROOT_DIR, 'content', 'posts', `${document.data.slug}.md`));
  const registryPaths = [
    path.join(ROOT_DIR, 'content', 'registry', 'article-registry.yml'),
    path.join(ROOT_DIR, 'content', 'registry', 'topic-registry.yml'),
    path.join(ROOT_DIR, 'content', 'calendar', 'editorial-calendar.yml')
  ];
  const publicationPaths = [...reviewPaths, ...postPaths];
  const snapshots = snapshotsFor([...publicationPaths, ...registryPaths]);
  let deploymentUrl = null;
  let deploymentId = null;
  let publicationCommitSha = null;
  let registryCommitSha = null;

  return {
    precheck: async () => {
      if (!evaluation.autoPublishEligible) throw new Error(`Auto-Publish Gate failed: ${evaluation.failedGates.join(', ')}`);
      if (pair.length !== 2 || !pair.some((document) => document.data.language === 'en') || !pair.some((document) => document.data.language === 'pt-BR')) throw new Error('SKIP_PAIR: complete EN/PT-BR pair is required');
      if (!['human-approved', 'auto-publish-fallback'].includes(publicationPath)) throw new Error('Invalid publicationPath');
      if (publicationPath === 'auto-publish-fallback' && evaluation.human.status !== 'awaiting-human-review') throw new Error('Auto fallback requires no human response');
      if (publicationPath === 'human-approved' && evaluation.human.status !== 'approved') throw new Error('Human publication path requires approval');
      const branch = run('git', ['branch', '--show-current'], { label: 'git verify production branch' });
      if (branch !== config.productionBranch) throw new Error(`Publication runner must be on ${config.productionBranch}, received ${branch || 'detached HEAD'}`);
      const localSha = run('git', ['rev-parse', 'HEAD'], { label: 'git read local production SHA' });
      const remoteSha = run('git', ['rev-parse', `origin/${config.productionBranch}`], { label: 'git read remote production SHA' });
      if (localSha !== remoteSha) throw new Error('Production branch is not synchronized with origin; refusing publication');
      for (const document of pair) {
        const url = absoluteUrl(publicPathForDocument(document));
        const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
        if (response.status === 200) throw new Error(`Public route already exists; repository synchronization is required before another publication: ${url}`);
        if (response.status !== 404) throw new Error(`Public route availability is ambiguous for ${url}: HTTP ${response.status}`);
      }
    },
    promote: () => {
      for (let index = 0; index < pair.length; index += 1) {
        const document = pair[index];
        if (fs.existsSync(postPaths[index])) throw new Error(`Target post already exists: ${postPaths[index]}`);
        const data = promotedData(document, publicationPath, publicationDate, evaluation.brief.topicAngleSignature);
        fs.writeFileSync(postPaths[index], stringifyMarkdownFrontmatter(data, document.content), 'utf8');
        fs.unlinkSync(reviewPaths[index]);
      }
    },
    validate: () => npmRun('content:validate'),
    build: () => npmRun('build'),
    audit: () => {
      npmRun('content:test:guards');
      npmRun('content:audit');
      npmCommand(['audit', '--omit=dev'], 'npm audit');
    },
    publicExposureAudit: () => npmRun('public:exposure-audit'),
    publishCommit: () => {
      if (process.env.GITHUB_ACTIONS !== 'true') throw new Error('Production publication commits are restricted to GitHub Actions');
      const productionEnvironment = normalizedProductionEnvironment();
      if (productionEnvironment.GITHUB_REPOSITORY !== config.productionRepository) throw new Error('GitHub repository identity mismatch');
      publicationCommitSha = commitAndPushPaths(publicationPaths, `content: publish ${pair.find((document) => document.data.language === 'en').data.slug}`, { deletedPaths: reviewPaths });
    },
    deployWait: async () => {
      if (!publicationCommitSha) throw new Error('Publication commit SHA is unavailable');
      const deployment = await waitForGitDeployment(publicationCommitSha);
      deploymentId = deployment.deploymentId;
      deploymentUrl = deployment.deploymentUrl;
    },
    publicVerify: async () => {
      if (deploymentUrl) {
        const deploymentResponse = await fetch(deploymentUrl, { method: 'HEAD', redirect: 'follow' });
        if (deploymentResponse.status !== 200) throw new Error(`Deployment URL returned HTTP ${deploymentResponse.status}`);
      }
      await verifyPublicRelease(pair);
    },
    registryCommit: () => {
      updateRegistries(pair, publicationDate, publicationPath, evaluation.brief.topicAngleSignature, options.recoverySlot || null);
      registryCommitSha = commitAndPushPaths(registryPaths, `chore: record verified publication for ${pair.find((document) => document.data.language === 'en').data.slug} [skip ci]`);
    },
    rollback: (_context, transaction) => {
      if (!transaction.publicationCommitPushed) {
        restoreSnapshots(snapshots);
        return;
      }
      // The publication commit is already remote and is preserved as incident evidence.
      // Registry/calendar files remain local-only until public verification succeeds.
      restoreSnapshots(new Map(registryPaths.map((filePath) => [filePath, snapshots.get(filePath)])));
    },
    getDeploymentUrl: () => deploymentUrl,
    getDeploymentId: () => deploymentId,
    getPublicationCommitSha: () => publicationCommitSha,
    getRegistryCommitSha: () => registryCommitSha
  };
}

module.exports = {
  TRANSACTION_STAGES,
  commitAndPushPaths,
  createProductionHooks,
  executeTransaction,
  githubApi,
  normalizedProductionEnvironment,
  promotedData,
  updateRegistries,
  verifyPublicPair,
  verifyPublicRelease,
  waitForGitDeployment
};
