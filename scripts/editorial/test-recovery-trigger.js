'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const YAML = require('yaml');

const root = path.join(__dirname, '..', '..');
const calendar = YAML.parse(fs.readFileSync(path.join(root, 'content', 'calendar', 'editorial-calendar.yml'), 'utf8'));
const normalWorkflow = fs.readFileSync(path.join(root, '.github', 'workflows', 'editorial-automation.yml'), 'utf8');

const cronMatch = normalWorkflow.match(/cron:\s*'(\d+)\s+9\s+\*\s+\*\s+2,4'/);
assert(cronMatch, 'normal Tuesday/Thursday 09:xx cron is missing');
assert.notStrictEqual(cronMatch[1], '0', 'normal workflow must avoid minute 00 to reduce schedule queueing risk');
assert(normalWorkflow.includes("timezone: 'America/Sao_Paulo'"), 'normal workflow timezone changed');
assert(!/cron:\s*'\d+\s+\d+\s+\*\s+\*\s+0'/.test(normalWorkflow), 'normal workflow must not contain a Sunday recovery cron');

const activeKeys = new Set();
for (const slot of calendar.recoverySlots || []) {
  if (!['armed', 'manual-recovery-authorized'].includes(slot.status)) continue;
  assert(slot.originalScheduledDate, `active recovery slot has no original date: ${slot.articleSlug}`);
  assert(slot.recoveryScheduledDate, `active recovery slot has no recovery date: ${slot.articleSlug}`);
  assert(slot.recoveryTime, `active recovery slot has no recovery time: ${slot.articleSlug}`);
  assert(slot.articleSlug, 'active recovery slot has no article slug');
  const key = `${slot.articleSlug}|${slot.recoveryScheduledDate}`;
  assert(!activeKeys.has(key), `duplicate active recovery slot: ${key}`);
  activeKeys.add(key);

  if (slot.status === 'armed') {
    assert(slot.triggerWorkflow, `armed recovery slot has no trigger workflow: ${slot.articleSlug}`);
    const workflowPath = path.join(root, '.github', 'workflows', slot.triggerWorkflow);
    assert(fs.existsSync(workflowPath), `armed recovery trigger is missing: ${slot.triggerWorkflow}`);
    const workflow = fs.readFileSync(workflowPath, 'utf8');
    assert(workflow.includes(slot.recoveryScheduledDate), `trigger does not guard ${slot.recoveryScheduledDate}`);
    assert(workflow.includes(slot.articleSlug), `trigger does not select exact pair ${slot.articleSlug}`);
    assert(workflow.includes('local_date'), `trigger has no local-date guard: ${slot.articleSlug}`);
  }
}

console.log('Recovery trigger tests passed: normal cron policy is stable, armed slots require explicit triggers, and manual recovery slots remain date-scoped.');
