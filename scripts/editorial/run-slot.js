'use strict';

const crypto = require('crypto');
const config = require('../../editorial.automation.config');
const { absoluteUrl, publicPathForDocument } = require('../content-utils');
const { createProductionHooks, executeTransaction } = require('./publication-adapter');
const { choosePair, evaluateAutoPublish, planWeek, recoverySlotForPair, runnerDecision, selectNextPreparedPair, slotLabelForEvaluation, writeLog, zonedParts } = require('./engine');

function cycleHasTransactionFailure(cycle) {
  return cycle.results.some((result) => result.transaction && result.transaction.status !== 'SUCCESS');
}

function finalDecisionForCycle(cycle) {
  if (cycleHasTransactionFailure(cycle)) return 'ABORTED';
  if (cycle.results.some((result) => ['WOULD_PUBLISH', 'WOULD_PUBLISH_AUTO'].includes(result.decision))) return 'WOULD_PUBLISH';
  return cycle.results.some((result) => result.decision === 'WOULD_HOLD') ? 'WOULD_HOLD' : 'WOULD_SKIP';
}

async function main() {
  const args = process.argv.slice(2);
  const identifier = args.find((arg) => !arg.startsWith('--'));
  const execute = args.includes('--execute');
  const forcedCutoff = args.includes('--cutoff-reached') ? true : undefined;
  const recoveryDateArgument = args.find((arg) => arg.startsWith('--recovery-date='))?.slice('--recovery-date='.length) || null;
  const nowArgument = args.find((arg) => arg.startsWith('--now='))?.slice('--now='.length);
  const now = nowArgument ? new Date(nowArgument) : new Date();
  if (Number.isNaN(now.getTime())) throw new Error(`Invalid --now value: ${nowArgument}`);
  let requestedRecoverySlot = null;
  if (recoveryDateArgument && !identifier) throw new Error('--recovery-date requires an exact article identifier');
  if (identifier) {
    const requestedPair = choosePair(identifier)[0];
    const configuredRecoverySlot = recoverySlotForPair(requestedPair);
    if (recoveryDateArgument) {
      if (!configuredRecoverySlot || configuredRecoverySlot.recoveryScheduledDate !== recoveryDateArgument) {
        throw new Error(`No armed recovery slot matches ${identifier} on ${recoveryDateArgument}`);
      }
      requestedRecoverySlot = configuredRecoverySlot;
    }
  }
  if (execute) {
    const reasons = [];
    if (!config.enabled) reasons.push('editorialAutomation.enabled is false');
    if (config.dryRun) reasons.push('editorialAutomation.dryRun is true');
    if (!config.productionCredentialsConfigured) reasons.push('production credentials are not confirmed');
    if (!config.gitIntegrationTriggerVerified) reasons.push('GitHub Actions push to Vercel production trigger is not verified');
    const local = zonedParts(now);
    if (requestedRecoverySlot) {
      if (local.date !== requestedRecoverySlot.recoveryScheduledDate) reasons.push(`current local date ${local.date} does not match recovery date ${requestedRecoverySlot.recoveryScheduledDate}`);
      if (local.time < requestedRecoverySlot.recoveryTime) reasons.push(`current local time ${local.time} is before recovery time ${requestedRecoverySlot.recoveryTime}`);
    } else {
      if (!config.preferredDays.includes(local.weekday)) reasons.push(`current local day ${local.weekday} is not a publication slot`);
      if (local.time < config.publicationTime) reasons.push(`current local time ${local.time} is before ${config.publicationTime}`);
    }
    if (reasons.length) throw new Error(`Production execution is fail-closed: ${reasons.join('; ')}`);
  }

  const localNow = zonedParts(now);
  let selected = null;
  if (execute && !identifier) {
    const candidate = selectNextPreparedPair(localNow.date, new Set(), { exactSlotOnly: true });
    if (candidate) {
      const english = candidate.find((document) => document.data.language === 'en') || candidate[0];
      const response = await fetch(absoluteUrl(publicPathForDocument(english)), { method: 'HEAD', redirect: 'follow' });
      if (response.status === 404) {
        selected = candidate;
      } else if (response.status !== 200) {
        throw new Error(`Public route precheck is ambiguous for ${english.data.slug}: HTTP ${response.status}`);
      }
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
    const evaluation = await evaluateAutoPublish(pair, { runPipeline: true, overrides: { now, recoverySlot: requestedRecoverySlot } });
    const decision = execute && evaluation.schedule.publicationDate > localNow.date
      ? { decision: 'WOULD_HOLD', reason: 'target-publication-date-is-in-the-future' }
      : runnerDecision(evaluation, { cutoffReached: forcedCutoff });
    const result = {
      slot: slotLabelForEvaluation(evaluation),
      slugs: evaluation.pair.map((item) => item.slug),
      targetPublicationDate: evaluation.schedule.publicationDate,
      originalScheduledDate: evaluation.schedule.originalScheduledDate,
      recoveryScheduledDate: requestedRecoverySlot?.recoveryScheduledDate || null,
      recoveryReason: requestedRecoverySlot?.recoveryReason || null,
      scheduledDay: evaluation.schedule.slot,
      cutoff: evaluation.schedule.cutoffLocal,
      publicationTime: evaluation.schedule.publicationLocal,
      chosenTopic: pair.find((document) => document.data.language === 'en')?.data.title || pair[0].data.title,
      antiRepetitionResult: {
        duplicateRisk: evaluation.brief.duplicateRisk,
        decision: evaluation.brief.antiRepetitionDecision
      },
      factualValidation: evaluation.checks.factualValidationComplete.detail,
      voiceCheck: evaluation.checks.elianaVoiceCheck,
      humanReviewStatus: evaluation.human.status,
      humanDraftApproval: pair.map((document) => document.data.humanDraftApproval),
      publicationApproval: pair.map((document) => document.data.publicationApproval),
      publishAllowed: pair.map((document) => document.data.publishAllowed),
      requestedChanges: evaluation.human.requestedChanges,
      autoPublishEligible: evaluation.autoPublishEligible,
      failedGates: evaluation.failedGates,
      externalSourceLinks: evaluation.checks.externalSourceLinksValid.detail,
      ...decision,
      validators: Object.fromEntries(Object.entries(evaluation.pipeline).map(([name, result]) => [name, result.pass])),
      buildResult: evaluation.pipeline.build.pass,
      previewResult: evaluation.pipeline.previewAudit.pass,
      adapterStarted: false,
      publicationCommitPushed: false,
      publicationCommitSha: null,
      deploymentVerified: false,
      deploymentId: null,
      deployResult: 'NOT_RUN_DRY_RUN',
      publicVerification: 'NOT_RUN_DRY_RUN',
      registryUpdate: false,
      registryCommitSha: null
    };
    if (execute) {
      if (!['WOULD_PUBLISH', 'WOULD_PUBLISH_AUTO'].includes(decision.decision)) {
        result.deployResult = 'NOT_RUN_INELIGIBLE';
        result.publicVerification = 'NOT_RUN_INELIGIBLE';
      } else {
        result.adapterStarted = true;
        const publicationPath = decision.publicationPath;
        const hooks = createProductionHooks(pair, evaluation, {
          publicationPath,
          publicationDate: evaluation.schedule.publicationDate,
          recoverySlot: requestedRecoverySlot
        });
        const transaction = await executeTransaction(hooks, { cycleId: cycle.cycleId });
        result.transaction = transaction;
        result.publicationCommitPushed = transaction.publicationCommitPushed;
        result.publicationCommitSha = hooks.getPublicationCommitSha();
        result.deploymentVerified = transaction.deploymentVerified;
        result.deploymentId = hooks.getDeploymentId();
        result.deployResult = transaction.deploymentVerified ? 'PASS' : 'NOT_CONFIRMED';
        result.publicVerification = transaction.completed.includes('publicVerify') ? 'PASS' : 'NOT_CONFIRMED';
        result.registryUpdate = transaction.registryUpdated;
        result.registryCommitSha = hooks.getRegistryCommitSha();
      }
    }
    cycle.results.push(result);
  }
  const transactionFailed = cycleHasTransactionFailure(cycle);
  cycle.finalDecision = finalDecisionForCycle(cycle);
  cycle.logPath = writeLog(cycle);
  console.log(JSON.stringify(cycle, null, 2));
  if (transactionFailed) process.exitCode = 1;
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  });
}

module.exports = { cycleHasTransactionFailure, finalDecisionForCycle };
