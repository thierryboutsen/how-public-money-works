'use strict';

const crypto = require('crypto');
const config = require('../../editorial.automation.config');
const { absoluteUrl, publicPathForDocument } = require('../content-utils');
const { createProductionHooks, executeTransaction } = require('./publication-adapter');
const { choosePair, evaluateAutoPublish, planWeek, runnerDecision, selectNextPreparedPair, writeLog, zonedParts } = require('./engine');

async function main() {
  const args = process.argv.slice(2);
  const identifier = args.find((arg) => !arg.startsWith('--'));
  const execute = args.includes('--execute');
  const forcedCutoff = args.includes('--cutoff-reached') ? true : undefined;
  const nowArgument = args.find((arg) => arg.startsWith('--now='))?.slice('--now='.length);
  const now = nowArgument ? new Date(nowArgument) : new Date();
  if (Number.isNaN(now.getTime())) throw new Error(`Invalid --now value: ${nowArgument}`);
  if (execute) {
    const reasons = [];
    if (!config.enabled) reasons.push('editorialAutomation.enabled is false');
    if (config.dryRun) reasons.push('editorialAutomation.dryRun is true');
    if (!config.productionSecretsConfigured) reasons.push('production secrets are not confirmed');
    const local = zonedParts(now);
    if (!config.preferredDays.includes(local.weekday)) reasons.push(`current local day ${local.weekday} is not a publication slot`);
    if (local.time < config.publicationTime) reasons.push(`current local time ${local.time} is before ${config.publicationTime}`);
    if (reasons.length) throw new Error(`Production execution is fail-closed: ${reasons.join('; ')}`);
  }

  const localNow = zonedParts(now);
  let selected = null;
  if (execute && !identifier) {
    const excluded = new Set();
    while (true) {
      const candidate = selectNextPreparedPair(localNow.date, excluded);
      if (!candidate) break;
      const english = candidate.find((document) => document.data.language === 'en') || candidate[0];
      const response = await fetch(absoluteUrl(publicPathForDocument(english)), { method: 'HEAD', redirect: 'follow' });
      if (response.status === 404) {
        selected = candidate;
        break;
      }
      if (response.status === 200) {
        excluded.add(english.data.slug);
        continue;
      }
      throw new Error(`Public route precheck is ambiguous for ${english.data.slug}: HTTP ${response.status}`);
    }
  }
  const pairs = selected ? [selected] : (execute && !identifier ? [] : choosePair(identifier));
  const weeklyPlan = planWeek();
  const cycle = {
    cycleId: `${new Date().toISOString()}-${crypto.randomBytes(4).toString('hex')}`,
    timestamp: new Date().toISOString(),
    dryRun: !execute,
    timezone: config.timezone,
    ideasConsidered: weeklyPlan.candidates,
    selectedTopics: weeklyPlan.selected,
    results: []
  };
  if (pairs.length === 0) {
    cycle.results.push({
      slot: localNow.weekday,
      decision: 'WOULD_SKIP',
      reason: 'SKIP_PAIR_NO_PREPARED_UNPUBLISHED_CONTENT',
      deployResult: 'NOT_RUN',
      publicVerification: 'NOT_RUN'
    });
  }
  for (let index = 0; index < pairs.length; index += 1) {
    const pair = pairs[index];
    const evaluation = await evaluateAutoPublish(pair, { runPipeline: true, overrides: { now } });
    const decision = execute && evaluation.schedule.publicationDate > localNow.date
      ? { decision: 'WOULD_HOLD', reason: 'target-publication-date-is-in-the-future' }
      : runnerDecision(evaluation, { cutoffReached: forcedCutoff });
    const result = {
      slot: config.preferredDays[index] || 'unscheduled',
      slugs: evaluation.pair.map((item) => item.slug),
      chosenTopic: pair.find((document) => document.data.language === 'en')?.data.title || pair[0].data.title,
      antiRepetitionResult: {
        duplicateRisk: evaluation.brief.duplicateRisk,
        decision: evaluation.brief.antiRepetitionDecision
      },
      factualValidation: evaluation.checks.factualValidationComplete.detail,
      voiceCheck: evaluation.checks.elianaVoiceCheck,
      humanReviewStatus: evaluation.human.status,
      autoPublishEligible: evaluation.autoPublishEligible,
      failedGates: evaluation.failedGates,
      ...decision,
      validators: Object.fromEntries(Object.entries(evaluation.pipeline).map(([name, result]) => [name, result.pass])),
      buildResult: evaluation.pipeline.build.pass,
      previewResult: evaluation.pipeline.previewAudit.pass,
      deployResult: 'NOT_RUN_DRY_RUN',
      publicVerification: 'NOT_RUN_DRY_RUN'
    };
    if (execute) {
      if (!['WOULD_PUBLISH', 'WOULD_PUBLISH_AUTO'].includes(decision.decision)) {
        result.deployResult = 'NOT_RUN_INELIGIBLE';
        result.publicVerification = 'NOT_RUN_INELIGIBLE';
      } else {
        const publicationPath = decision.publicationPath;
        const hooks = createProductionHooks(pair, evaluation, {
          publicationPath,
          publicationDate: evaluation.schedule.publicationDate
        });
        const transaction = await executeTransaction(hooks, { cycleId: cycle.cycleId });
        result.transaction = transaction;
        result.deployResult = transaction.deployed ? transaction.status : 'NOT_DEPLOYED';
        result.publicVerification = transaction.completed.includes('publicVerify') ? 'PASS' : 'NOT_CONFIRMED';
      }
    }
    cycle.results.push(result);
  }
  cycle.finalDecision = cycle.results.some((result) => ['WOULD_PUBLISH', 'WOULD_PUBLISH_AUTO'].includes(result.decision))
    ? 'WOULD_PUBLISH'
    : cycle.results.some((result) => result.decision === 'WOULD_HOLD') ? 'WOULD_HOLD' : 'WOULD_SKIP';
  cycle.logPath = writeLog(cycle);
  console.log(JSON.stringify(cycle, null, 2));
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
