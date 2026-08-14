'use strict';

const assert = require('assert');
const { publicationWeekday, reviewWindowForPair, runnerDecision, scheduledDayCheck, slotLabelForEvaluation } = require('./engine');

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
const humanApproved = JSON.parse(JSON.stringify(allPass));
humanApproved.human.status = 'approved';
assert.strictEqual(runnerDecision(humanApproved).decision, 'WOULD_PUBLISH', 'human approval plus all gates must publish');

const beforeCutoff = JSON.parse(JSON.stringify(allPass));
beforeCutoff.schedule.state = 'before-cutoff';
assert.strictEqual(runnerDecision(beforeCutoff).decision, 'WOULD_HOLD', 'silence before cutoff must HOLD');
assert.strictEqual(runnerDecision(allPass).decision, 'WOULD_PUBLISH_AUTO', 'silence after cutoff plus all gates must use auto fallback');

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

console.log('Editorial automation scenarios passed: human approval, cutoff HOLD, auto fallback, rejection, changes, factual, image, duplicate, canonical, translation, validator, build, public exposure, and security.');
