'use strict';

const config = require('../../editorial.automation.config');
const { activationStatus, groupReviewPairs, humanReviewState } = require('./engine');

const pairs = [...groupReviewPairs().entries()].map(([translationKey, documents]) => ({
  translationKey,
  slugs: documents.map((document) => document.data.slug),
  languages: documents.map((document) => document.data.language),
  humanReviewStatus: humanReviewState(documents).status,
  publishAllowed: documents.map((document) => document.data.publishAllowed),
  publicationApproval: documents.map((document) => document.data.publicationApproval)
}));

console.log(JSON.stringify({
  activation: activationStatus(),
  config,
  productionIntegration: {
    method: config.productionMethod,
    expectedProductionName: config.productionProjectName,
    repository: config.productionRepository,
    branch: config.productionBranch,
    gitTriggerVerified: config.gitIntegrationTriggerVerified,
    vercelCliRequired: false
  },
  reviewPairs: pairs
}, null, 2));
