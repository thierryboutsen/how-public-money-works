'use strict';

const { inventory } = require('./engine');

inventory({
  runPipeline: process.argv.includes('--pipeline'),
  skipNetwork: process.argv.includes('--skip-network')
}).then((result) => {
  console.log(JSON.stringify(result, null, 2));
  if (result.counts.BLOCKED > 0 && !process.argv.includes('--report-only')) process.exitCode = 2;
}).catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
