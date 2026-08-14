'use strict';

const { planWeek } = require('./engine');

const plan = planWeek();
console.log(JSON.stringify({
  mode: 'planning-only',
  selected: plan.selected,
  message: plan.selected.length
    ? 'Prepared content pairs were selected for validation. This command does not generate, approve, move, or publish content.'
    : 'No sufficiently prepared pair was selected. SKIP_SLOT_LOW_QUALITY is permitted and preferred to forced cadence.'
}, null, 2));
