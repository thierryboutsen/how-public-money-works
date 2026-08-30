'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { publicationWeekday, reviewWindowForPair, runnerDecision, scheduledDayCheck, selectNextPreparedPair, slotLabelForEvaluation } = require('./engine');

function passingEvaluation() {
  const checks = {
    humanDraftNotRejected: { pass: true }, requestedChangesClear: { pass: true },
    factualValidationComplete: { pass: true }, pendingClaimsZero: { pass: true },
    duplicateRiskAcceptable: { pass: true }, antiRepetitionProceed: { pass: true },
    sourceDecisionProceed: { pass: true }, editorialQuality: { pass: true },
    elianaVoiceCheck: { pass: true }, seoValidation: { pass: true },
    translationValidation: { pass: true }, canonicalValidation: { pass: true },
    hreflangValidation: { pass: true }, featuredImageExists: { pass: true },
    featuredImageAltExists: { pass: true }, featuredImageUnique: { pass: true }, internalLinksValid: { pass: true },
    externalSourceLinksValid: { pass: true }, contentValidator: { pass: true },
    publicationGuards: { pass: true }, buildPass: { pass: true },
    previewAuditPass: { pass: true }, publicLeakAuditPass: { pass: true },
    publicExposureAudit: { pass: true },
    noP1Blocker: { pass: true }, noP2Blocker: { pass: true }, noUnresolvedSecurityWarning: { pass: true }
  };
  return {
    human: { status: 'awaiting-human-review', requestedChanges: [] },
    schedule: { state: 'after-cutoff' },
    checks,
    autoPublishEligible: true,
    failedGates: []
  };
}

function fail(base, gate) {
  const evaluation = JSON.parse(JSON.stringify(base));
  evaluation.checks[gate].pass = false;
  evaluation.autoPublishEligible = false;
  evaluation.failedGates = [gate];
  return evaluation;
}

const allPass = passingEvaluation();
const tuesdayPair = [{ data: { language: 'en', targetPublicationDate: '2026-08-11' } }];
const tuesdayBeforeCutoff = reviewWindowForPair(tuesdayPair, new Date('2026-08-10T20:59:00Z'));
const tuesdayAfterCutoff = reviewWindowForPair(tuesdayPair, new Date('2026-08-10T21:00:00Z'));
assert.strictEqual(tuesdayBeforeCutoff.state, 'before-cutoff', 'Monday 17:59 Sao Paulo must be before Tuesday cutoff');
assert.strictEqual(tuesdayAfterCutoff.state, 'after-cutoff', 'Monday 18:00 Sao Paulo must reach Tuesday cutoff');
assert.strictEqual(tuesdayBeforeCutoff.slot, 'Tuesday', 'Tuesday target must be labeled Tuesday before cutoff');
assert.strictEqual(tuesdayAfterCutoff.slot, 'Tuesday', 'Tuesday target must be labeled Tuesday after cutoff');
const thursdayPair = [{ data: { language: 'en', targetPublicationDate: '2026-08-13' } }];
const thursdayBeforeCutoff = reviewWindowForPair(thursdayPair, new Date('2026-08-12T20:59:00Z'));
const thursdayAfterCutoff = reviewWindowForPair(thursdayPair, new Date('2026-08-12T21:00:00Z'));
assert.strictEqual(thursdayBeforeCutoff.state, 'before-cutoff', 'Wednesday 17:59 Sao Paulo must be before Thursday cutoff');
assert.strictEqual(thursdayAfterCutoff.state, 'after-cutoff', 'Wednesday 18:00 Sao Paulo must reach Thursday cutoff');
assert.strictEqual(thursdayBeforeCutoff.slot, 'Thursday', 'Thursday target must be labeled Thursday before cutoff');
assert.strictEqual(thursdayAfterCutoff.slot, 'Thursday', 'Thursday target must be labeled Thursday after cutoff');
assert.strictEqual(publicationWeekday('2026-08-11'), 'Tuesday', 'Tuesday date must resolve to Tuesday');
assert.strictEqual(publicationWeekday('2026-08-13'), 'Thursday', 'Thursday date must resolve to Thursday');
assert.deepStrictEqual(scheduledDayCheck('2026-08-11'), { pass: true, detail: { targetDate: '2026-08-11', targetDay: 'Tuesday' } });
assert.deepStrictEqual(scheduledDayCheck('2026-08-13'), { pass: true, detail: { targetDate: '2026-08-13', targetDay: 'Thursday' } });
assert.strictEqual(slotLabelForEvaluation({ schedule: thursdayAfterCutoff }), 'Thursday', 'displayed label must use the real Thursday slot');
const workflowText = fs.readFileSync(path.join(__dirname, '../../.github/workflows/editorial-automation.yml'), 'utf8');
assert.ok(workflowText.includes("cron: '17 9 * * 2,4'"), 'scheduled workflow must avoid minute 00 while keeping the Tuesday/Thursday 09:xx window');
assert.ok(workflowText.includes("timezone: 'America/Sao_Paulo'"), 'scheduled workflow must keep the Sao Paulo timezone');
const syntheticPreparedPair = [
  { data: { language: 'en', slug: 'synthetic-exact-slot', targetPublicationDate: '2030-01-01' } },
  { data: { language: 'pt-BR', slug: 'synthetic-exact-slot-pt', targetPublicationDate: '2030-01-01' } }
];
const syntheticLaterPair = [
  { data: { language: 'en', slug: 'synthetic-later-slot', targetPublicationDate: '2030-01-03' } },
  { data: { language: 'pt-BR', slug: 'synthetic-later-slot-pt', targetPublicationDate: '2030-01-03' } }
];
const syntheticPairs = [syntheticPreparedPair, syntheticLaterPair];
const passingStaticGateEvaluation = () => ({
  human: { status: 'awaiting-human-review' },
  checks: {
    factualValidationComplete: { pass: true },
    contentValidator: { pass: true },
    publicationGuards: { pass: true }
  }
});
const exactSlotOptions = { exactSlotOnly: true, pairs: syntheticPairs, staticGateEvaluationFn: passingStaticGateEvaluation };
const exactTuesdayPair = selectNextPreparedPair('2030-01-01', new Set(), exactSlotOptions);
assert.ok(exactTuesdayPair, 'an exact reserved pair must be returned for a prepared synthetic slot');
const exactTuesdayEnglish = exactTuesdayPair.find((document) => document.data.language === 'en') || exactTuesdayPair[0];
assert.strictEqual(exactTuesdayEnglish.data.targetPublicationDate, '2030-01-01', 'scheduled execution must select only the pair reserved for the exact synthetic slot date');
assert.doesNotThrow(() => selectNextPreparedPair('2029-12-27', new Set(), exactSlotOptions), 'an absent historical reservation must not throw');
assert.strictEqual(selectNextPreparedPair('2029-12-27', new Set(), exactSlotOptions), null, 'an absent historical reservation must not be selected as prepared content');
assert.strictEqual(selectNextPreparedPair('2030-01-01', new Set(['synthetic-exact-slot']), exactSlotOptions), null, 'an excluded exact slot must not fall through to another pair');
assert.strictEqual(selectNextPreparedPair('2030-01-02', new Set(), exactSlotOptions), null, 'a date without an exact reservation must not consume later inventory');
const humanApproved = JSON.parse(JSON.stringify(allPass));
humanApproved.human.status = 'approved';
assert.strictEqual(runnerDecision(humanApproved).decision, 'WOULD_PUBLISH', 'human approval plus all gates must publish');

const beforeCutoff = JSON.parse(JSON.stringify(allPass));
beforeCutoff.schedule.state = 'before-cutoff';
assert.strictEqual(runnerDecision(beforeCutoff).decision, 'WOULD_HOLD', 'silence before cutoff must HOLD');
assert.strictEqual(runnerDecision(allPass).decision, 'WOULD_PUBLISH_AUTO', 'silence after cutoff plus all gates must use auto fallback');

const missedTuesdayPair = [{ data: { language: 'en', targetPublicationDate: '2026-08-18' } }];
const missedTuesdayBeforeCutoff = { ...allPass, schedule: reviewWindowForPair(missedTuesdayPair, new Date('2026-08-17T20:59:00Z')) };
const missedTuesdayAfterCutoff = { ...allPass, schedule: reviewWindowForPair(missedTuesdayPair, new Date('2026-08-17T21:01:00Z')) };
const missedTuesdayBeforePublication = { ...allPass, schedule: reviewWindowForPair(missedTuesdayPair, new Date('2026-08-18T11:59:00Z')) };
const missedTuesdayAtPublication = { ...allPass, schedule: reviewWindowForPair(missedTuesdayPair, new Date('2026-08-18T12:00:00Z')) };
const missedTuesdayAfterPublication = { ...allPass, schedule: reviewWindowForPair(missedTuesdayPair, new Date('2026-08-18T12:01:00Z')) };
assert.strictEqual(runnerDecision(missedTuesdayBeforeCutoff).decision, 'WOULD_HOLD', '2026-08-17 17:59 Sao Paulo must HOLD the 2026-08-18 slot');
assert.strictEqual(runnerDecision(missedTuesdayAfterCutoff).decision, 'WOULD_PUBLISH_AUTO', '2026-08-17 18:01 Sao Paulo must enable fallback for the 2026-08-18 slot');
assert.strictEqual(runnerDecision(missedTuesdayBeforePublication).decision, 'WOULD_PUBLISH_AUTO', '2026-08-18 08:59 Sao Paulo must keep fallback eligible');
assert.strictEqual(runnerDecision(missedTuesdayAtPublication).decision, 'WOULD_PUBLISH_AUTO', '2026-08-18 09:00 Sao Paulo must keep fallback eligible');
assert.strictEqual(runnerDecision(missedTuesdayAfterPublication).decision, 'WOULD_PUBLISH_AUTO', '2026-08-18 09:01 Sao Paulo must remain eligible inside the exact-date execution window');

for (const gate of ['factualValidationComplete', 'featuredImageExists', 'featuredImageUnique', 'duplicateRiskAcceptable', 'canonicalValidation', 'translationValidation', 'contentValidator', 'buildPass', 'publicExposureAudit', 'noUnresolvedSecurityWarning']) {
  assert.strictEqual(runnerDecision(fail(allPass, gate)).decision, 'WOULD_SKIP', `${gate} must produce SKIP`);
}
const rejected = JSON.parse(JSON.stringify(allPass));
rejected.human.status = 'rejected';
assert.strictEqual(runnerDecision(rejected).decision, 'WOULD_HOLD', 'human rejection must HOLD');
const changes = JSON.parse(JSON.stringify(allPass));
changes.human.status = 'changes-requested';
changes.human.requestedChanges = ['Revise scope'];
assert.strictEqual(runnerDecision(changes).decision, 'WOULD_HOLD', 'requested changes must HOLD');

console.log('Editorial automation scenarios passed: exact-slot idempotency, human approval, cutoff HOLD, auto fallback, rejection, changes, factual, image, duplicate, canonical, translation, validator, build, public exposure, and security.');
