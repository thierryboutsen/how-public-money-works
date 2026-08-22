'use strict';

const fs = require('fs');
const os = require('os');
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

const TRANSACTION_STAGES = ['precheck', 'promote', 'validate', 'build', 'audit', 'publicExposureAudit', 'deploy', 'publicVerify', 'registryUpdate'];

async function executeTransaction(hooks, context = {}) {
  const completed = [];
  let deployed = false;
  let registryUpdated = false;
  try {
    for (const stage of TRANSACTION_STAGES) {
      if (typeof hooks[stage] !== 'function') throw new Error(`Missing transaction hook: ${stage}`);
      await hooks[stage](context);
      completed.push(stage);
      if (stage === 'deploy') deployed = true;
      if (stage === 'registryUpdate') registryUpdated = true;
    }
    return { status: 'SUCCESS', completed, deployed, registryUpdated };
  } catch (error) {
    if (typeof hooks.rollback === 'function') await hooks.rollback(context, { completed, deployed, registryUpdated, error });
    return {
      status: deployed ? 'FAILED_AFTER_DEPLOY' : 'ABORTED_BEFORE_DEPLOY',
      failedStage: TRANSACTION_STAGES[completed.length],
      completed,
      deployed,
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

const DEPLOY_SOURCE_ALLOWLIST = Object.freeze([
  'build.js',
  'package.json',
  'package-lock.json',
  'site.config.js',
  'vercel.json',
  'src',
  path.join('content', 'posts'),
  path.join('scripts', 'content-utils.js')
]);

function createCleanDeploymentSource() {
  const stagingRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'hpwm-vercel-source-'));
  for (const relativePath of DEPLOY_SOURCE_ALLOWLIST) {
    const sourcePath = path.join(ROOT_DIR, relativePath);
    if (!fs.existsSync(sourcePath)) {
      fs.rmSync(stagingRoot, { recursive: true, force: true });
      throw new Error(`Required deployment source is missing: ${relativePath}`);
    }
    const destinationPath = path.join(stagingRoot, relativePath);
    fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
    fs.cpSync(sourcePath, destinationPath, { recursive: true });
  }
  return stagingRoot;
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

function writeVercelProjectLink(stagingRoot, productionEnvironment) {
  const vercelDirectory = path.join(stagingRoot, '.vercel');
  fs.mkdirSync(vercelDirectory, { recursive: true });
  fs.writeFileSync(path.join(vercelDirectory, 'project.json'), `${JSON.stringify({
    orgId: productionEnvironment.VERCEL_ORG_ID,
    projectId: productionEnvironment.VERCEL_PROJECT_ID,
    projectName: config.productionProjectName
  })}\n`, 'utf8');
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

function updateRegistries(pair, publicationDate, publicationPath, topicAngleSignature) {
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
      lastReviewed: publicationDate
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

  const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'UTC' }).format(new Date(`${publicationDate}T12:00:00Z`));
  const slot = calendar.slots.find((item) => item.slot === weekday);
  if (slot) {
    slot.status = 'published';
    slot.articleSlug = english.data.slug;
    slot.result = 'published';
    slot.publicationPath = publicationPath;
    slot.publishedAt = publicationDate;
  }

  fs.writeFileSync(articlePath, YAML.stringify(articleRegistry, { lineWidth: 0 }));
  fs.writeFileSync(topicPath, YAML.stringify(topicRegistry, { lineWidth: 0 }));
  fs.writeFileSync(calendarPath, YAML.stringify(calendar, { lineWidth: 0 }));
}

async function verifyPublicPair(pair) {
  let lastErrors = [];
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    lastErrors = [];
    for (const document of pair) {
      const url = absoluteUrl(publicPathForDocument(document));
      try {
        const response = await fetch(url, { redirect: 'follow', headers: { 'User-Agent': 'HowPublicMoneyWorks-PublicationVerifier/1.0' } });
        if (response.status !== 200) throw new Error(`${url} returned HTTP ${response.status}`);
        const html = await response.text();
        if (!html.includes(`<title>${document.data.seoTitle}`) && !html.includes(document.data.title)) throw new Error(`${url} does not contain the expected title`);
        if (!html.includes(`rel="canonical" href="${url}"`)) throw new Error(`${url} does not contain the expected canonical`);
      } catch (error) {
        lastErrors.push(error.message);
      }
    }
    if (lastErrors.length === 0) return;
    if (attempt < 5) await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  throw new Error(`Public verification failed after retries: ${lastErrors.join('; ')}`);
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
  const snapshots = snapshotsFor([...reviewPaths, ...postPaths, ...registryPaths]);
  let deploymentUrl = null;

  return {
    precheck: async () => {
      if (!evaluation.autoPublishEligible) throw new Error(`Auto-Publish Gate failed: ${evaluation.failedGates.join(', ')}`);
      if (pair.length !== 2 || !pair.some((document) => document.data.language === 'en') || !pair.some((document) => document.data.language === 'pt-BR')) throw new Error('SKIP_PAIR: complete EN/PT-BR pair is required');
      if (!['human-approved', 'auto-publish-fallback'].includes(publicationPath)) throw new Error('Invalid publicationPath');
      if (publicationPath === 'auto-publish-fallback' && evaluation.human.status !== 'awaiting-human-review') throw new Error('Auto fallback requires no human response');
      if (publicationPath === 'human-approved' && evaluation.human.status !== 'approved') throw new Error('Human publication path requires approval');
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
    deploy: () => {
      if (!process.env.GITHUB_ACTIONS) throw new Error('Production deploy is restricted to GitHub Actions');
      const productionEnvironment = normalizedProductionEnvironment();
      const vercel = process.platform === 'win32' ? 'vercel.cmd' : 'vercel';
      const token = productionEnvironment.VERCEL_TOKEN;
      const stagingRoot = createCleanDeploymentSource();
      try {
        writeVercelProjectLink(stagingRoot, productionEnvironment);
        run(vercel, ['pull', '--yes', '--environment=production', `--token=${token}`], { cwd: stagingRoot, label: 'vercel pull', env: productionEnvironment });
        run(vercel, ['build', '--prod', `--token=${token}`], { cwd: stagingRoot, label: 'vercel build', env: productionEnvironment });
        deploymentUrl = run(vercel, ['deploy', '--prebuilt', '--prod', `--token=${token}`], { cwd: stagingRoot, label: 'vercel deploy', env: productionEnvironment }).split(/\r?\n/).pop();
        if (!/^https:\/\//.test(deploymentUrl)) throw new Error('Vercel did not return a deployment URL');
      } finally {
        fs.rmSync(stagingRoot, { recursive: true, force: true });
      }
    },
    publicVerify: async () => {
      const deploymentResponse = await fetch(deploymentUrl, { method: 'HEAD', redirect: 'follow' });
      if (deploymentResponse.status !== 200) throw new Error(`Deployment URL returned HTTP ${deploymentResponse.status}`);
      await verifyPublicPair(pair);
    },
    registryUpdate: () => updateRegistries(pair, publicationDate, publicationPath, evaluation.brief.topicAngleSignature),
    rollback: () => restoreSnapshots(snapshots),
    getDeploymentUrl: () => deploymentUrl
  };
}

module.exports = {
  TRANSACTION_STAGES,
  DEPLOY_SOURCE_ALLOWLIST,
  createCleanDeploymentSource,
  createProductionHooks,
  executeTransaction,
  normalizedProductionEnvironment,
  promotedData,
  updateRegistries,
  verifyPublicPair,
  writeVercelProjectLink
};
