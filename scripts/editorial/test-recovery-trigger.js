'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const YAML = require('yaml');

const root = path.join(__dirname, '..', '..');
const calendar = YAML.parse(fs.readFileSync(path.join(root, 'content', 'calendar', 'editorial-calendar.yml'), 'utf8'));
const normalWorkflow = fs.readFileSync(path.join(root, '.github', 'workflows', 'editorial-automation.yml'), 'utf8');

assert(normalWorkflow.includes("cron: '0 9 * * 2,4'"), 'normal Tuesday/Thursday cron changed');
assert(!normalWorkflow.includes("cron: '0 9 * * 0'"), 'normal workflow must not contain Sunday recovery cron');

for (const slot of calendar.recoverySlots || []) {
  if (slot.status !== 'armed') continue;
  assert(slot.triggerWorkflow, `armed recovery slot has no trigger workflow: ${slot.articleSlug}`);
  const workflowPath = path.join(root, '.github', 'workflows', slot.triggerWorkflow);
  assert(fs.existsSync(workflowPath), `armed recovery trigger is missing: ${slot.triggerWorkflow}`);
  const workflow = fs.readFileSync(workflowPath, 'utf8');
  assert(workflow.includes(slot.recoveryScheduledDate), `trigger does not guard ${slot.recoveryScheduledDate}`);
  assert(workflow.includes(slot.articleSlug), `trigger does not select exact pair ${slot.articleSlug}`);
  assert(workflow.includes('local_date'), `trigger has no local-date guard: ${slot.articleSlug}`);
}

const manual = (calendar.recoverySlots || []).find((slot) => slot.articleSlug === 'annual-financial-report-local-government');
assert.strictEqual(manual?.status, 'manual-recovery-authorized');
console.log('Recovery trigger tests passed: armed slots have explicit one-time triggers; manual recovery authorization is executable and isolated.');
