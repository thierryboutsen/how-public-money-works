'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const YAML = require('yaml');
const automationConfig = require('../../editorial.automation.config');
const siteConfig = require('../../site.config');
const {
  ROOT_DIR,
  listMarkdownFiles,
  loadMarkdownFile,
  publicPathForDocument,
  absoluteUrl,
  sourceAssetPath,
  validateFeaturedImageUniqueness,
  validateDocuments
} = require('../content-utils');

const REVIEW_DIR = path.join(ROOT_DIR, 'content', 'review');
const POSTS_DIR = path.join(ROOT_DIR, 'content', 'posts');
const DRAFTS_DIR = path.join(ROOT_DIR, 'content', 'drafts');
const RESOLVED_FACTUAL_STATUSES = new Set([
  'validated',
  'conceptually-validated',
  'conceptually-validated-local-source-required-if-example-added',
  'jurisdictional-variation-validated-no-national-rule-asserted',
  'removed-from-public-copy'
]);
const ARTIFICIAL_PATTERNS = [
  /\bin today(?:'s|’s) (?:fast-paced|complex|ever-changing) world\b/i,
  /\bgame[- ]changer\b/i,
  /\brevolutionary\b/i,
  /\bunlock(?:ing)? the (?:power|potential)\b/i,
  /\bseamless(?:ly)?\b/i,
  /\bdelve into\b/i,
  /\bjourney\b.*\b(?:understanding|discovering)\b/i
];

function readYaml(relativePath) {
  return YAML.parse(fs.readFileSync(path.join(ROOT_DIR, relativePath), 'utf8'), { maxAliasCount: 0, uniqueKeys: true });
}

function commandResult(command, args, options = {}) {
  const isWindowsNpm = process.platform === 'win32' && command === 'npm';
  const executable = isWindowsNpm ? process.execPath : command;
  const npmCli = isWindowsNpm ? path.join(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js') : null;
  const result = spawnSync(executable, isWindowsNpm ? [npmCli, ...args] : args, {
    cwd: ROOT_DIR,
    encoding: 'utf8',
    shell: false,
    stdio: options.inherit ? 'inherit' : 'pipe',
    env: { ...process.env, ...options.env }
  });
  return {
    pass: !result.error && result.status === 0,
    status: result.status,
    stdout: (result.stdout || '').trim(),
    stderr: (result.stderr || '').trim(),
    error: result.error?.message || null
  };
}

function parseBriefForSlug(slug) {
  const briefPath = path.join(DRAFTS_DIR, `brief-${slug}.md`);
  if (!fs.existsSync(briefPath)) return null;
  const text = fs.readFileSync(briefPath, 'utf8');
  const value = (field) => text.match(new RegExp(`^${field}:\\s*["']?([^"'\\r\\n]+)`, 'm'))?.[1]?.trim() || null;
  return {
    path: path.relative(ROOT_DIR, briefPath).replace(/\\/g, '/'),
    topicAngleSignature: value('topicAngleSignature'),
    duplicateRisk: value('duplicateRisk'),
    antiRepetitionDecision: value('antiRepetitionDecision'),
    sourceDecision: value('sourceDecision')
  };
}

function factualState(document) {
  const section = document.content.match(/Factual validation checklist:\s*([\s\S]*?)(?:-->|$)/i)?.[1] || '';
  const statuses = [...section.matchAll(/^\s*status:\s*([^\r\n]+)/gm)].map((match) => match[1].trim());
  const pending = statuses.filter((status) => !RESOLVED_FACTUAL_STATUSES.has(status));
  return {
    checklistPresent: statuses.length > 0,
    totalClaims: statuses.length,
    pendingClaims: pending.length,
    unresolvedStatuses: pending,
    complete: statuses.length > 0 && pending.length === 0
  };
}

function publicMarkdown(document) {
  return document.content.replace(/<!--[\s\S]*?-->/g, '').trim();
}

function extractExternalLinks(markdown) {
  return [...new Set([...markdown.matchAll(/\[[^\]]*\]\((https?:\/\/[^)\s]+)(?:\s+["'][^"']*["'])?\)/g)].map((match) => match[1]))];
}

function voiceCheck(document) {
  const text = publicMarkdown(document);
  const words = text.replace(/[#*_>`\[\]()|-]/g, ' ').split(/\s+/).filter(Boolean);
  const paragraphs = text.split(/\n\s*\n/).map((item) => item.trim()).filter((item) => item && !item.startsWith('#'));
  const normalizedParagraphs = paragraphs.map((item) => item.toLowerCase().replace(/\s+/g, ' '));
  const duplicateParagraphs = normalizedParagraphs.length - new Set(normalizedParagraphs).size;
  const listLines = (text.match(/^\s*[-*]\s+/gm) || []).length;
  const headingCount = (text.match(/^##+\s+/gm) || []).length;
  const artificialMatches = ARTIFICIAL_PATTERNS.filter((pattern) => pattern.test(text)).map((pattern) => pattern.source);
  const hasPracticalSection = /questions?|look for|how to read|what to ask|perguntas?|como ler|procure/i.test(text);
  const errors = [];
  if (words.length < 700) errors.push('public copy is too short for the approved explainer format');
  if (duplicateParagraphs > 0) errors.push('duplicate public paragraphs detected');
  if (artificialMatches.length) errors.push(`artificial-language pattern detected: ${artificialMatches.join(', ')}`);
  if (listLines > Math.max(28, Math.floor(words.length / 35))) errors.push('excessive list density');
  if (headingCount < 5) errors.push('insufficient explanatory structure');
  if (!hasPracticalSection) errors.push('reader-usefulness cue is missing');
  return {
    pass: errors.length === 0,
    errors,
    metrics: { wordCount: words.length, headingCount, listLines, duplicateParagraphs },
    profile: fs.existsSync(path.join(ROOT_DIR, automationConfig.voiceProfilePath)) ? 'configured-profile-present' : 'baseline-editorial-rules'
  };
}

function seoCheck(document) {
  const { data } = document;
  const errors = [];
  if (!data.seoTitle || data.seoTitle.length > 65) errors.push('seoTitle is missing or longer than 65 characters');
  if (!data.metaDescription || data.metaDescription.length < 120 || data.metaDescription.length > 165) errors.push('metaDescription must be 120-165 characters');
  if (!data.primaryKeyword) errors.push('primaryKeyword is missing');
  if (!Array.isArray(data.secondaryKeywords) || data.secondaryKeywords.length === 0) errors.push('secondaryKeywords are missing');
  if (data.searchIntent !== 'informational') errors.push('searchIntent must be informational');
  return { pass: errors.length === 0, errors };
}

function translationCheck(pair) {
  const errors = [];
  const languages = new Set(pair.map((document) => document.data.language));
  if (!languages.has('en')) errors.push('English version is missing');
  if (!languages.has('pt-BR')) errors.push('PT-BR version is missing');
  if (pair.length !== 2) errors.push(`translation pair must contain exactly two documents; found ${pair.length}`);
  for (const document of pair) {
    if (document.data.translationValidationStatus !== 'validated') errors.push(`${document.data.slug}: translationValidationStatus must be validated`);
  }
  const validation = validateDocuments([
    ...listMarkdownFiles(POSTS_DIR).map(loadMarkdownFile),
    ...pair
  ]);
  errors.push(...validation.errors.filter((error) => /translation|language|canonical path/i.test(error)));
  return { pass: errors.length === 0, errors };
}

function canonicalCheck(pair) {
  const errors = [];
  if (!/^https:\/\/[a-z0-9.-]+$/i.test(siteConfig.siteOrigin)) errors.push('SITE_ORIGIN is invalid');
  for (const document of pair) {
    const route = publicPathForDocument(document);
    const canonical = absoluteUrl(route);
    if (!canonical.startsWith(`${siteConfig.siteOrigin}/`)) errors.push(`${document.data.slug}: canonical does not use SITE_ORIGIN`);
    if (document.data.canonical && document.data.canonical !== canonical) errors.push(`${document.data.slug}: explicit canonical conflicts with generated canonical`);
  }
  return { pass: errors.length === 0, errors, siteOrigin: siteConfig.siteOrigin };
}

function imageCheck(pair) {
  const errors = [];
  for (const document of pair) {
    if (!document.data.featuredImage) errors.push(`${document.data.slug}: featuredImage is missing`);
    else if (!sourceAssetPath(document.data.featuredImage) || !fs.existsSync(sourceAssetPath(document.data.featuredImage))) errors.push(`${document.data.slug}: featuredImage asset is missing`);
    if (!document.data.featuredImageAlt) errors.push(`${document.data.slug}: featuredImageAlt is missing`);
  }
  return { pass: errors.length === 0, errors };
}

function imageUniqueCheck() {
  const documents = [
    ...listMarkdownFiles(POSTS_DIR).map(loadMarkdownFile),
    ...listMarkdownFiles(REVIEW_DIR).map(loadMarkdownFile)
  ];
  return validateFeaturedImageUniqueness(documents);
}

function internalLinkCheck(pair) {
  const all = [...listMarkdownFiles(POSTS_DIR).map(loadMarkdownFile), ...pair];
  const errors = validateDocuments(all).errors.filter((error) => error.includes('internal link'));
  return { pass: errors.length === 0, errors };
}

async function checkUrl(url, timeoutMs = 12000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    let response = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: controller.signal, headers: { 'User-Agent': 'HowPublicMoneyWorks-EditorialValidator/1.0' } });
    if (response.status >= 400) response = await fetch(url, { method: 'GET', redirect: 'follow', signal: controller.signal, headers: { 'User-Agent': 'Mozilla/5.0 (compatible; HowPublicMoneyWorks-EditorialValidator/1.0)', Range: 'bytes=0-1024' } });
    return { url, pass: response.status >= 200 && response.status < 400, status: response.status };
  } catch (error) {
    return { url, pass: false, status: null, error: error.name === 'AbortError' ? 'timeout' : error.message };
  } finally {
    clearTimeout(timeout);
  }
}

async function externalLinkCheck(pair, options = {}) {
  const urls = [...new Set(pair.flatMap((document) => extractExternalLinks(publicMarkdown(document))))];
  if (options.skipNetwork) return { pass: false, errors: ['network validation was not executed'], urls: [] };
  const results = await Promise.all(urls.map((url) => checkUrl(url)));
  const errors = results.filter((item) => !item.pass).map((item) => `${item.url}: ${item.status || item.error}`);
  return { pass: urls.length > 0 && errors.length === 0, errors: urls.length ? errors : ['no external institutional source links found'], urls: results };
}

function humanReviewState(pair) {
  const approvals = pair.map((document) => document.data.humanDraftApproval);
  const requestedChanges = pair.flatMap((document) => Array.isArray(document.data.requestedChanges) ? document.data.requestedChanges : []);
  if (approvals.some((value) => value === 'rejected')) return { status: 'rejected', requestedChanges };
  if (requestedChanges.length) return { status: 'changes-requested', requestedChanges };
  if (approvals.every((value) => value === 'approved')) return { status: 'approved', requestedChanges };
  return { status: 'awaiting-human-review', requestedChanges };
}

function zonedParts(date = new Date(), timeZone = automationConfig.timezone) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    weekday: 'long'
  }).formatToParts(date);
  const value = (type) => parts.find((part) => part.type === type)?.value;
  return {
    date: `${value('year')}-${value('month')}-${value('day')}`,
    time: `${value('hour')}:${value('minute')}`,
    weekday: value('weekday')
  };
}

function offsetDate(dateString, dayOffset) {
  const date = new Date(`${dateString}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + dayOffset);
  return date.toISOString().slice(0, 10);
}

function reviewWindowForPair(pair, now = new Date()) {
  const english = pair.find((document) => document.data.language === 'en') || pair[0];
  const publicationDate = english.data.targetPublicationDate || null;
  if (!publicationDate) return { state: 'unconfigured', reason: 'targetPublicationDate is missing' };
  const cutoffDate = offsetDate(publicationDate, automationConfig.humanReviewCutoff.dayOffset);
  const cutoffLocal = `${cutoffDate}T${automationConfig.humanReviewCutoff.time}`;
  const publicationLocal = `${publicationDate}T${automationConfig.publicationTime}`;
  const current = zonedParts(now);
  const currentLocal = `${current.date}T${current.time}`;
  return {
    state: currentLocal < cutoffLocal ? 'before-cutoff' : 'after-cutoff',
    currentLocal,
    cutoffLocal,
    publicationLocal,
    slot: publicationWeekday(publicationDate),
    publicationDate
  };
}

function publicationWeekday(publicationDate) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(publicationDate || '')) return null;
  return new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'UTC' })
    .format(new Date(`${publicationDate}T12:00:00Z`));
}

function scheduledDayCheck(targetDate) {
  const targetDay = publicationWeekday(targetDate);
  return {
    pass: Boolean(targetDate) && automationConfig.preferredDays.includes(targetDay),
    detail: { targetDate, targetDay }
  };
}

function slotLabelForEvaluation(evaluation) {
  return evaluation?.schedule?.slot || 'unscheduled';
}

function groupReviewPairs() {
  const documents = listMarkdownFiles(REVIEW_DIR).map(loadMarkdownFile);
  const groups = new Map();
  for (const document of documents) {
    const key = document.data.translationKey || document.data.slug;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(document);
  }
  return groups;
}

function choosePair(identifier) {
  const pairs = groupReviewPairs();
  if (!identifier) return [...pairs.values()].sort((a, b) => {
    const dateA = (a.find((document) => document.data.language === 'en') || a[0]).data.targetPublicationDate || '';
    const dateB = (b.find((document) => document.data.language === 'en') || b[0]).data.targetPublicationDate || '';
    return dateA.localeCompare(dateB);
  });
  const normalized = identifier.replace(/\.md$/, '');
  const match = [...pairs.entries()].find(([key, pair]) => key === normalized || pair.some((document) => document.data.slug === normalized || document.relativePath === identifier));
  if (!match) throw new Error(`No review translation pair found for ${identifier}`);
  return [match[1]];
}

function briefState(pair) {
  const english = pair.find((document) => document.data.language === 'en') || pair[0];
  return parseBriefForSlug(english.data.slug) || {};
}

function staticGateEvaluation(pair, overrides = {}) {
  const brief = { ...briefState(pair), ...(overrides.brief || {}) };
  const human = overrides.human || humanReviewState(pair);
  const factual = overrides.factual || pair.map(factualState);
  const voice = overrides.voice || pair.map(voiceCheck);
  const seo = overrides.seo || pair.map(seoCheck);
  const translation = overrides.translation || translationCheck(pair);
  const canonical = overrides.canonical || canonicalCheck(pair);
  const image = overrides.image || imageCheck(pair);
  const imageUnique = overrides.imageUnique || imageUniqueCheck();
  const internalLinks = overrides.internalLinks || internalLinkCheck(pair);
  const contentValidation = overrides.contentValidation || (() => {
    const validation = validateDocuments([...listMarkdownFiles(POSTS_DIR).map(loadMarkdownFile), ...pair]);
    return { pass: validation.errors.length === 0, errors: validation.errors };
  })();
  const english = pair.find((document) => document.data.language === 'en') || pair[0];
  const targetDate = english.data.targetPublicationDate;
  const checks = {
    humanDraftNotRejected: { pass: !['rejected', 'changes-requested'].includes(human.status), detail: human.status },
    requestedChangesClear: { pass: human.requestedChanges.length === 0, detail: human.requestedChanges },
    factualValidationComplete: { pass: factual.every((item) => item.complete), detail: factual },
    pendingClaimsZero: { pass: factual.every((item) => item.pendingClaims === 0), detail: factual.map((item) => item.pendingClaims) },
    duplicateRiskAcceptable: { pass: brief.duplicateRisk !== 'high' && Boolean(brief.duplicateRisk), detail: brief.duplicateRisk || 'missing' },
    antiRepetitionProceed: { pass: brief.antiRepetitionDecision === 'proceed', detail: brief.antiRepetitionDecision || 'missing' },
    sourceDecisionProceed: { pass: brief.sourceDecision === 'proceed', detail: brief.sourceDecision || 'missing' },
    editorialQuality: { pass: voice.every((item) => item.pass), detail: voice },
    elianaVoiceCheck: { pass: voice.every((item) => item.pass), detail: voice },
    seoValidation: { pass: seo.every((item) => item.pass), detail: seo },
    translationValidation: { pass: translation.pass, detail: translation },
    canonicalValidation: { pass: canonical.pass, detail: canonical },
    hreflangValidation: { pass: translation.pass && canonical.pass, detail: { translation, canonical } },
    featuredImageExists: { pass: image.pass, detail: image },
    featuredImageAltExists: { pass: image.pass, detail: image },
    featuredImageUnique: { pass: imageUnique.pass, detail: imageUnique },
    internalLinksValid: { pass: internalLinks.pass, detail: internalLinks },
    contentValidator: { pass: contentValidation.pass, detail: contentValidation },
    publicationGuards: { pass: contentValidation.pass, detail: contentValidation },
    scheduledDayValid: scheduledDayCheck(targetDate),
    noP1Blocker: { pass: pair.every((document) => Array.isArray(document.data.p1Blockers) && document.data.p1Blockers.length === 0), detail: pair.map((document) => document.data.p1Blockers) },
    noP2Blocker: { pass: pair.every((document) => Array.isArray(document.data.p2Blockers) && document.data.p2Blockers.length === 0), detail: pair.map((document) => document.data.p2Blockers) },
    noUnresolvedSecurityWarning: { pass: pair.every((document) => Array.isArray(document.data.securityWarnings) && document.data.securityWarnings.length === 0), detail: pair.map((document) => document.data.securityWarnings) }
  };
  return {
    brief,
    human,
    checks,
    schedule: reviewWindowForPair(pair, overrides.now || new Date()),
    pair: pair.map((document) => ({ slug: document.data.slug, language: document.data.language }))
  };
}

async function evaluateAutoPublish(pair, options = {}) {
  const result = staticGateEvaluation(pair, options.overrides || {});
  const externalLinks = options.overrides?.externalLinks || await externalLinkCheck(pair, { skipNetwork: options.skipNetwork });
  result.checks.externalSourceLinksValid = { pass: externalLinks.pass, detail: externalLinks };

  const runPipeline = options.runPipeline !== false;
  const pipeline = {};
  if (runPipeline) {
    pipeline.validator = commandResult('npm', ['run', 'content:validate']);
    pipeline.build = pipeline.validator.pass ? commandResult('npm', ['run', 'build']) : { pass: false, status: null, stderr: 'blocked by validator' };
    pipeline.guards = pipeline.build.pass ? commandResult('npm', ['run', 'content:test:guards']) : { pass: false, status: null, stderr: 'blocked by build' };
    pipeline.publicAudit = pipeline.guards.pass ? commandResult('npm', ['run', 'content:audit']) : { pass: false, status: null, stderr: 'blocked by guards' };
    pipeline.publicExposureAudit = pipeline.publicAudit.pass ? commandResult('npm', ['run', 'public:exposure-audit']) : { pass: false, status: null, stderr: 'blocked by content audit' };
    const english = pair.find((document) => document.data.language === 'en') || pair[0];
    pipeline.preview = pipeline.publicExposureAudit.pass ? commandResult('npm', ['run', 'content:preview', '--', english.filePath]) : { pass: false, status: null, stderr: 'blocked by public exposure audit' };
    pipeline.previewAudit = pipeline.preview.pass ? commandResult('npm', ['run', 'content:audit:preview']) : { pass: false, status: null, stderr: 'blocked by preview' };
    pipeline.previewExposureAudit = pipeline.previewAudit.pass ? commandResult('npm', ['run', 'public:exposure-audit:preview']) : { pass: false, status: null, stderr: 'blocked by preview audit' };
    pipeline.securityAudit = commandResult('npm', ['audit', '--omit=dev']);
  } else {
    for (const name of ['validator', 'guards', 'build', 'publicAudit', 'publicExposureAudit', 'preview', 'previewAudit', 'previewExposureAudit', 'securityAudit']) pipeline[name] = { pass: false, skipped: true };
  }
  result.pipeline = pipeline;
  result.checks.contentValidator = { pass: pipeline.validator?.pass === true, detail: pipeline.validator };
  result.checks.publicationGuards = { pass: pipeline.guards?.pass === true, detail: pipeline.guards };
  result.checks.buildPass = { pass: pipeline.build?.pass === true, detail: pipeline.build };
  result.checks.previewAuditPass = { pass: pipeline.previewAudit?.pass === true, detail: pipeline.previewAudit };
  result.checks.publicLeakAuditPass = { pass: pipeline.publicAudit?.pass === true, detail: pipeline.publicAudit };
  result.checks.publicExposureAudit = {
    pass: pipeline.publicExposureAudit?.pass === true && pipeline.previewExposureAudit?.pass === true,
    detail: { public: pipeline.publicExposureAudit, preview: pipeline.previewExposureAudit }
  };
  result.checks.noUnresolvedSecurityWarning = {
    pass: result.checks.noUnresolvedSecurityWarning.pass && pipeline.securityAudit?.pass === true,
    detail: { contentMetadata: result.checks.noUnresolvedSecurityWarning.detail, dependencyAudit: pipeline.securityAudit }
  };
  result.autoPublishEligible = Object.values(result.checks).every((check) => check.pass);
  result.failedGates = Object.entries(result.checks).filter(([, check]) => !check.pass).map(([name]) => name);
  return result;
}

function runnerDecision(evaluation, options = {}) {
  const human = evaluation.human.status;
  if (human === 'rejected' || human === 'changes-requested') return { decision: 'WOULD_HOLD', reason: human };
  if (human === 'approved') return evaluation.autoPublishEligible
    ? { decision: 'WOULD_PUBLISH', reason: 'human-approved-and-all-gates-pass', publicationPath: 'human-approved' }
    : { decision: 'WOULD_SKIP', reason: `failed-gates:${evaluation.failedGates.join(',')}` };
  if (!automationConfig.autoPublishFallback) return { decision: 'WOULD_HOLD', reason: 'auto-publish-fallback-disabled' };
  const cutoffReached = options.cutoffReached ?? evaluation.schedule?.state === 'after-cutoff';
  if (!cutoffReached) return { decision: 'WOULD_HOLD', reason: evaluation.schedule?.reason || 'awaiting-human-review-before-cutoff' };
  return evaluation.autoPublishEligible
    ? { decision: 'WOULD_PUBLISH_AUTO', reason: 'no-human-response-and-all-gates-pass', publicationPath: 'auto-publish-fallback' }
    : { decision: 'WOULD_SKIP', reason: `failed-gates:${evaluation.failedGates.join(',')}` };
}

async function inventory(options = {}) {
  const pairs = choosePair();
  const items = [];
  for (const pair of pairs) {
    const evaluation = await evaluateAutoPublish(pair, {
      runPipeline: options.runPipeline !== false,
      skipNetwork: options.skipNetwork === true
    });
    const human = evaluation.human.status;
    let state;
    if (human === 'rejected' || human === 'changes-requested') state = 'BLOCKED';
    else if (evaluation.failedGates.length) state = 'BLOCKED';
    else if (human === 'approved') state = 'READY';
    else state = 'HUMAN_REVIEW';
    items.push({
      state,
      fallbackEligible: human === 'awaiting-human-review' && evaluation.autoPublishEligible,
      targetPublicationDate: evaluation.schedule.publicationDate,
      slugs: evaluation.pair.map((item) => item.slug),
      failedGates: evaluation.failedGates,
      humanReviewStatus: human
    });
  }
  const counts = {
    READY: items.filter((item) => item.state === 'READY').length,
    HUMAN_REVIEW: items.filter((item) => item.state === 'HUMAN_REVIEW').length,
    FALLBACK_ELIGIBLE: items.filter((item) => item.fallbackEligible).length,
    BLOCKED: items.filter((item) => item.state === 'BLOCKED').length
  };
  const preparedPairs = counts.READY + counts.HUMAN_REVIEW;
  return {
    generatedAt: new Date().toISOString(),
    targetPairs: automationConfig.inventoryTargetPairs,
    minimumBufferPairs: automationConfig.minimumPreparedBufferPairs,
    counts,
    preparedPairs,
    slotsCovered: preparedPairs,
    scheduleCoverageWeeks: preparedPairs / automationConfig.postsPerWeek,
    bufferGap: Math.max(0, automationConfig.minimumPreparedBufferPairs - preparedPairs),
    items
  };
}

function selectNextPreparedPair(slotDate, excludedSlugs = new Set()) {
  const pairs = choosePair();
  const candidates = pairs.filter((pair) => {
    const english = pair.find((document) => document.data.language === 'en') || pair[0];
    if (excludedSlugs.has(english.data.slug)) return false;
    if (!english.data.targetPublicationDate || english.data.targetPublicationDate > slotDate) return false;
    const evaluation = staticGateEvaluation(pair);
    return !['rejected', 'changes-requested'].includes(evaluation.human.status)
      && Object.entries(evaluation.checks)
        .filter(([name]) => !['contentValidator', 'publicationGuards'].includes(name))
        .every(([, check]) => check.pass);
  });
  return candidates.find((pair) => (pair.find((document) => document.data.language === 'en') || pair[0]).data.targetPublicationDate === slotDate)
    || candidates[0]
    || null;
}

function planWeek() {
  const articles = readYaml('content/registry/article-registry.yml').articles || [];
  const topics = readYaml('content/registry/topic-registry.yml');
  const calendar = readYaml('content/calendar/editorial-calendar.yml');
  const publishedTitles = new Set(articles.filter((article) => article.status === 'published').map((article) => article.title.toLowerCase()));
  const publishedSignatures = new Set(articles.map((article) => article.duplicateCheckSignature).filter(Boolean));
  const prepared = [...groupReviewPairs().values()].map((pair) => {
    const english = pair.find((document) => document.data.language === 'en') || pair[0];
    const brief = briefState(pair);
    return {
      workingTitle: english.data.title,
      slug: english.data.slug,
      category: english.data.category,
      topicAngleSignature: brief.topicAngleSignature,
      duplicateRisk: brief.duplicateRisk || 'medium',
      antiRepetitionDecision: brief.antiRepetitionDecision || 'rework',
      sourceDecision: brief.sourceDecision || 'rework',
      preparedPair: pair.length === 2,
      targetPublicationDate: english.data.targetPublicationDate || null,
      recommendation: pair.length === 2 && brief.duplicateRisk === 'low' && brief.sourceDecision === 'proceed' ? 'proceed' : 'rework'
    };
  });
  const preparedTitles = new Set(prepared.map((candidate) => candidate.workingTitle.toLowerCase()));
  const seedCandidates = (calendar.seedIdeas || [])
    .filter((idea) => !publishedTitles.has(idea.title.toLowerCase()) && !preparedTitles.has(idea.title.toLowerCase()))
    .map((idea) => ({
      workingTitle: idea.title,
      slug: null,
      category: idea.category,
      topicAngleSignature: null,
      duplicateRisk: 'needs-evaluation',
      antiRepetitionDecision: 'rework',
      sourceDecision: 'rework',
      preparedPair: false,
      targetPublicationDate: null,
      recommendation: 'rework'
    }));
  const candidates = [...prepared.sort((a, b) => (a.targetPublicationDate || '').localeCompare(b.targetPublicationDate || '')), ...seedCandidates].slice(0, 5);
  const selected = candidates.filter((candidate) => candidate.recommendation === 'proceed' && !publishedSignatures.has(candidate.topicAngleSignature)).slice(0, automationConfig.postsPerWeek);
  return {
    generatedAt: new Date().toISOString(),
    policy: { postsPerWeek: automationConfig.postsPerWeek, preferredDays: automationConfig.preferredDays, qualityOverCadence: true },
    inputs: {
      articleRegistryCount: articles.length,
      coveredTopicCount: (topics.coveredTopics || []).length,
      seedTopicCount: (topics.seedTopics || []).length,
      calendarSlots: calendar.slots || []
    },
    candidates,
    selected,
    skippedSlots: Math.max(0, automationConfig.postsPerWeek - selected.length)
  };
}

function writeLog(cycle) {
  const directory = path.join(ROOT_DIR, automationConfig.logDirectory);
  fs.mkdirSync(directory, { recursive: true });
  const safeId = cycle.cycleId.replace(/[^a-zA-Z0-9_-]/g, '-');
  const filePath = path.join(directory, `${safeId}.json`);
  fs.writeFileSync(filePath, `${JSON.stringify(cycle, null, 2)}\n`, 'utf8');
  return path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');
}

function activationStatus() {
  const blockers = [];
  if (!automationConfig.publicationTime) blockers.push('publicationTime');
  if (!automationConfig.humanReviewCutoff?.time) blockers.push('humanReviewCutoff');
  if (!automationConfig.publicationAdapter || !fs.existsSync(path.join(ROOT_DIR, automationConfig.publicationAdapter))) blockers.push('publicationAdapter');
  if (!automationConfig.productionSecretsConfigured) blockers.push('productionSecrets');
  return {
    status: blockers.some((item) => item !== 'productionSecrets')
      ? 'AUTOMATION_BLOCKED'
      : (!automationConfig.productionSecretsConfigured
        ? 'AUTOMATION_READY_NEEDS_SECRETS'
        : (automationConfig.dryRun
          ? 'AUTOMATION_READY_DRY_RUN'
          : (!automationConfig.enabled ? 'AUTOMATION_READY_FOR_ACTIVATION' : 'AUTOMATION_ACTIVE'))),
    blockers,
    scheduler: automationConfig.scheduler
  };
}

module.exports = {
  RESOLVED_FACTUAL_STATUSES,
  activationStatus,
  choosePair,
  evaluateAutoPublish,
  externalLinkCheck,
  factualState,
  groupReviewPairs,
  humanReviewState,
  inventory,
  planWeek,
  publicationWeekday,
  runnerDecision,
  reviewWindowForPair,
  scheduledDayCheck,
  selectNextPreparedPair,
  slotLabelForEvaluation,
  staticGateEvaluation,
  voiceCheck,
  writeLog,
  zonedParts
};
