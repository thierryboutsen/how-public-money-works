'use strict';

module.exports = Object.freeze({
  enabled: false,
  postsPerWeek: 2,
  preferredDays: ['Tuesday', 'Thursday'],
  publicationTime: '09:00',
  timezone: 'America/Sao_Paulo',
  humanReviewPreferred: true,
  autoPublishFallback: true,
  humanReviewCutoff: Object.freeze({
    time: '18:00',
    dayOffset: -1
  }),
  skipOnFailedGate: true,
  dryRun: true,
  scheduler: 'github-actions',
  preparationOwner: 'codex-desktop',
  publicationAdapter: 'scripts/editorial/publication-adapter.js',
  productionMethod: 'vercel-cli',
  productionProjectName: 'elianafarialima',
  productionSecretsConfigured: false,
  registrySyncMode: 'post-verify-artifact-no-master-push',
  inventoryTargetPairs: 16,
  minimumPreparedBufferPairs: 8,
  logDirectory: '.editorial/logs',
  voiceProfilePath: 'docs/editorial/ELIANA_VOICE_PROFILE.md',
  requiredProductionEnvironmentVariables: [
    'VERCEL_TOKEN',
    'VERCEL_ORG_ID',
    'VERCEL_PROJECT_ID'
  ]
});
