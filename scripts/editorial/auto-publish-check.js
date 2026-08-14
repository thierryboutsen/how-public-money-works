'use strict';

const { choosePair, evaluateAutoPublish } = require('./engine');

async function main() {
  const args = process.argv.slice(2);
  const identifier = args.find((arg) => !arg.startsWith('--'));
  const skipNetwork = args.includes('--skip-network');
  const skipPipeline = args.includes('--skip-pipeline');
  const pairs = choosePair(identifier);
  const results = [];
  for (const pair of pairs) {
    results.push(await evaluateAutoPublish(pair, { skipNetwork, runPipeline: !skipPipeline }));
  }
  console.log(JSON.stringify(results, null, 2));
  if (results.some((result) => !result.autoPublishEligible)) process.exitCode = 2;
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
