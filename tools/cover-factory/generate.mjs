import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { generateImage } from 'ai';

const repoRawBase = process.env.HPW_REFERENCE_BASE
  || 'https://raw.githubusercontent.com/thierryboutsen/how-public-money-works/master/src/assets/';
const requestedSlug = process.env.COVER_SLUG || '';
const queuePath = resolve(process.cwd(), 'queue.json');
const queue = JSON.parse(await readFile(queuePath, 'utf8'));
const selected = requestedSlug
  ? queue.items.filter((item) => item.slug === requestedSlug)
  : queue.items.filter((item) => item.status === 'ready-for-generation');

if (!selected.length) {
  throw new Error(requestedSlug
    ? `No queue item found for COVER_SLUG=${requestedSlug}`
    : 'No ready-for-generation cover items found');
}

const referenceNames = queue.references.map((value) => value.replace('/assets/', ''));
const referenceImages = [];
for (const name of referenceNames) {
  const response = await fetch(new URL(name, repoRawBase));
  if (!response.ok) throw new Error(`Reference fetch failed ${response.status}: ${name}`);
  referenceImages.push(new Uint8Array(await response.arrayBuffer()));
}

await mkdir('public', { recursive: true });
const generated = [];

for (const item of selected) {
  const prompt = {
    text: `Create one original landscape editorial cover illustration for the premium U.S. civic public-finance publication "How Public Money Works".

ARTICLE TOPIC: ${item.topic}

CORE VISUAL CONCEPT: ${item.visualConcept}

OFFICIAL STYLE: ${queue.style}. Use the supplied approved covers only as visual-language references. Preserve their sophisticated premium civic-editorial character: deep navy and slate blue, restrained warm gold, ivory and paper tones; layered tactile cut-paper / painted editorial illustration; dimensional depth; refined institutional atmosphere; subtle shadows; balanced dense composition; civic documents, municipal architecture, charts, maps, infrastructure and public-service objects used as visual metaphors.

ORIGINALITY: The new composition must be unique to this article. Do not copy the layout or objects of a reference image. EN and PT-BR will share this single master image.

COMPOSITION: landscape 3:2, visually rich enough for a magazine feature, strong central hierarchy, readable when cropped into the Insights card grid, no large dead zones.

STRICTLY AVOID: readable text, letters, numbers, currency symbols, dollar signs, piggy banks, generic office workers, stock-photo aesthetics, campaign or partisan symbols, flags as decoration, logos, screenshots, UI/dashboard styling, flat vector infographic styling, clip-art, childish icons, exaggerated crisis imagery, or generic business-finance imagery.

The result should feel like it belongs next to the approved reference covers without looking duplicated.`,
    images: referenceImages
  };

  const result = await generateImage({
    model: queue.model,
    prompt,
    aspectRatio: queue.aspectRatio,
    n: 1
  });

  const outputPath = resolve(process.cwd(), 'public', item.output);
  await writeFile(outputPath, result.image.uint8Array);
  generated.push({
    slug: item.slug,
    targetPublicationDate: item.targetPublicationDate,
    output: item.output,
    mimeType: result.image.mimeType,
    bytes: result.image.uint8Array.byteLength,
    model: result.responses?.[0]?.modelId || queue.model,
    warnings: result.warnings || []
  });
  console.log('generated', item.slug, item.output, result.image.uint8Array.byteLength);
}

await writeFile(
  resolve(process.cwd(), 'public', 'generation-report.json'),
  JSON.stringify({
    generatedAt: new Date().toISOString(),
    style: queue.style,
    references: referenceNames,
    items: generated
  }, null, 2)
);
