'use strict';

module.exports = Object.freeze({
  enabled: true,
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
  dryRun: false,
  scheduler: 'github-actions',
  preparationOwner: 'codex-desktop',
  publicationAdapter: 'scripts/editorial/publication-adapter.js',
  productionMethod: 'vercel-git-integration',
  productionBranch: 'master',
  productionRepository: 'thierryboutsen/how-public-money-works',
  productionProjectName: 'elianafarialima',
  productionCredentialsMode: 'github-token',
  productionCredentialsConfigured: true,
  gitIntegrationTriggerVerified: false,
  registrySyncMode: 'post-verify-git-commit',
  inventoryTargetPairs: 16,
  minimumPreparedBufferPairs: 8,
  logDirectory: '.editorial/logs',
  voiceProfilePath: 'docs/editorial/ELIANA_VOICE_PROFILE.md',
  requiredProductionEnvironmentVariables: [
    'GITHUB_TOKEN',
    'GITHUB_REPOSITORY'
  ]
});
