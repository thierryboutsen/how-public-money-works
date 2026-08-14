'use strict';

const config = require('../../editorial.automation.config');
const fs = require('fs');
const path = require('path');
const { activationStatus, groupReviewPairs, humanReviewState } = require('./engine');

const pairs = [...groupReviewPairs().entries()].map(([translationKey, documents]) => ({
  translationKey,
  slugs: documents.map((document) => document.data.slug),
  languages: documents.map((document) => document.data.language),
  humanReviewStatus: humanReviewState(documents).status,
  publishAllowed: documents.map((document) => document.data.publishAllowed),
  publicationApproval: documents.map((document) => document.data.publicationApproval)
}));

const linkedProjectPath = path.join(__dirname, '..', '..', '.vercel', 'project.json');
const linkedProject = fs.existsSync(linkedProjectPath) ? JSON.parse(fs.readFileSync(linkedProjectPath, 'utf8')) : null;

console.log(JSON.stringify({
  activation: activationStatus(),
  config,
  vercelProject: {
    expectedProductionName: config.productionProjectName,
    locallyLinkedName: linkedProject?.projectName || null,
    idsFromSecretsOverrideLocalLink: true,
    mismatch: Boolean(linkedProject?.projectName && linkedProject.projectName !== config.productionProjectName)
  },
  reviewPairs: pairs
}, null, 2));
