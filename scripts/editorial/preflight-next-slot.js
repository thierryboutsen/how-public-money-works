'use strict';

const fs = require('fs');
const path = require('path');
const config = require('../../editorial.automation.config');
const {
  ROOT_DIR,
  inventory,
  publicationWeekday,
  selectNextPreparedPair,
  zonedParts
} = require('./engine');

function offsetDate(dateString, days) {
  const date = new Date(`${dateString}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function nextRegularSlot(now = new Date()) {
  const current = zonedParts(now);
  for (let offset = 0; offset <= 7; offset += 1) {
    const date = offsetDate(current.date, offset);
    const weekday = publicationWeekday(date);
    if (!config.preferredDays.includes(weekday)) continue;
    if (offset === 0 && current.time >= config.publicationTime) continue;
    return { date, weekday };
  }
  throw new Error('Unable to resolve the next regular editorial slot');
}

async function main() {
  const nowArg = process.argv.find((arg) => arg.startsWith('--now='));
  const now = nowArg ? new Date(nowArg.slice('--now='.length)) : new Date();
  if (Number.isNaN(now.getTime())) throw new Error('Invalid --now timestamp');

  const nextSlot = nextRegularSlot(now);
  const pair = selectNextPreparedPair(nextSlot.date, new Set(), {
    exactSlotOnly: true,
    excludeRecoveryPairs: true
  });
  const state = await inventory({
    runPipeline: false,
    skipNetwork: false
  });

  const result = {
    generatedAt: new Date().toISOString(),
    timezone: config.timezone,
    nextSlot,
    nextSlotReady: Boolean(pair),
    nextSlotPair: pair ? pair.map((doc) => ({
      slug: doc.data.slug,
      language: doc.data.language,
      targetPublicationDate: doc.data.targetPublicationDate
    })) : [],
    minimumPreparedBufferPairs: state.minimumBufferPairs,
    preparedPairs: state.preparedPairs,
    bufferGap: state.bufferGap,
    counts: state.counts,
    blocked: state.items
      .filter((item) => item.state === 'BLOCKED')
      .map((item) => ({
        targetPublicationDate: item.targetPublicationDate,
        slugs: item.slugs,
        failedGates: item.failedGates
      }))
  };

  const outputDir = path.join(ROOT_DIR, '.editorial');
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(
    path.join(outputDir, 'preflight-latest.json'),
    `${JSON.stringify(result, null, 2)}\n`,
    'utf8'
  );

  console.log(JSON.stringify(result, null, 2));

  const failures = [];
  if (!result.nextSlotReady) {
    failures.push(`next slot ${nextSlot.date} (${nextSlot.weekday}) has no exact bilingual pair passing static gates`);
  }
  if (result.bufferGap > 0) {
    failures.push(`prepared buffer is short by ${result.bufferGap} pair(s)`);
  }
  if (result.counts.BLOCKED > 0) {
    failures.push(`${result.counts.BLOCKED} review pair(s) are blocked`);
  }

  if (failures.length) {
    console.error('EDITORIAL_PREFLIGHT_FAIL');
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 3;
  } else {
    console.log('EDITORIAL_PREFLIGHT_PASS');
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
