# How Public Money Works — Visual Style Guide

## Official cover system

All article covers must use the visual system `premium-civic-editorial-v1`.

The approved reference library is the collection of covers listed in `content/visual/cover-manifest.yml`. New cover work must begin by reviewing the gold-standard references in that manifest.

## Core visual language

- Premium civic editorial illustration, not generic stock art.
- Navy, warm gold, ivory/off-white and restrained slate/blue secondary tones.
- Layered physical depth, paper/cut-paper or tactile dimensional feeling, sophisticated lighting and texture.
- Strong central composition and clear visual hierarchy that survives the Insights card crop.
- Civic and public-finance objects: government buildings, ledgers, maps, public-service infrastructure, financial documents, charts, roads, schools, utilities, public facilities and budget artifacts.
- Conceptual storytelling rather than literal decoration.
- No embedded headline, article title, labels or explanatory text in the cover.
- No partisan, campaign or political-party symbols.
- No generic executives, corporate office stock scenes, raining money, floating dollar signs or piggy-bank clichés.
- Every article identity receives its own master cover. EN/PT-BR translations share that same master.

## Gold-standard references

The definitive references are listed under `goldStandardReferences` in the manifest. They are not templates to copy literally; they define the expected level of detail, palette, dimensionality, civic tone and editorial sophistication.

## Approval rule

A cover is publication-ready only when all of the following are true:

1. The physical asset exists in `src/assets`.
2. The asset is listed in `content/visual/cover-manifest.yml`.
3. Its manifest status is `approved`.
4. Its manifest style is `premium-civic-editorial-v1`.
5. `approval` is `human-approved`.
6. `referenceChecked` is `true`.
7. The file extension is one of the approved final raster formats.
8. The asset is unique to the article identity unless an explicit reuse override is approved.

Publication tooling must fail closed when these conditions are not satisfied.
