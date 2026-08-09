'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { marked } = require('marked');
const siteConfig = require('./site.config');
const {
  ROOT_DIR,
  listMarkdownFiles,
  loadMarkdownFile,
  publicPathForDocument,
  absoluteUrl,
  validateDocuments,
  stripLeadingArticleH1
} = require('./scripts/content-utils');

const DIST_DIR = path.join(ROOT_DIR, 'dist');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const POSTS_DIR = path.join(ROOT_DIR, 'content', 'posts');
const POST_TEMPLATE_PATH = path.join(SRC_DIR, 'templates', 'post.html');
const INSIGHTS_TEMPLATE_PATH = path.join(SRC_DIR, 'templates', 'insights.html');

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeXml(value) {
  return escapeHtml(value);
}

function replaceTokens(template, tokens, sourceName) {
  let output = template;
  for (const [name, value] of Object.entries(tokens)) {
    output = output.split(`{{${name}}}`).join(String(value ?? ''));
  }
  const unresolved = [...new Set(output.match(/{{[A-Za-z0-9_]+}}/g) || [])];
  if (unresolved.length > 0) {
    throw new Error(`${sourceName} has unresolved placeholders: ${unresolved.join(', ')}`);
  }
  return output;
}

function parseMarkdownWithShortcodes(markdown) {
  const processed = markdown
    .replace(/\[dropcap\](.*?)\[\/dropcap\]/g, '<span class="dropcap">$1</span>')
    .replace(/\[pullquote\](.*?)\[author\](.*?)\[\/pullquote\]/gs, '<div class="pull-quote"><blockquote>$1</blockquote><div class="attr">— $2</div></div>')
    .replace(/\[pullquote\](.*?)\[\/pullquote\]/gs, '<div class="pull-quote"><blockquote>$1</blockquote></div>')
    .replace(/\[keyterm\](.*?)\[def\](.*?)\[\/keyterm\]/gs, '<div class="key-term"><div class="label">Key Term</div><div class="term">$1</div><p class="definition">$2</p></div>')
    .replace(/\[diagram\](.*?)\[\/diagram\]/gs, `<div class="diagram"><div class="label">A Reader's Diagram</div><h4>$1</h4><svg width="100%" height="160" viewBox="0 0 560 160" fill="none" role="img" aria-label="Conceptual diagram blueprint" style="background:#FDFDFD; border:1px solid #E8DFC9;"><rect x="40" y="30" width="200" height="100" stroke="#A88752" stroke-dasharray="4"/><text x="140" y="85" text-anchor="middle" font-family="Playfair Display" font-size="16" fill="#0C1A2C">Diagram Blueprint</text><line x1="240" y1="80" x2="320" y2="80" stroke="#A88752" stroke-width="1.5"/><rect x="320" y="30" width="200" height="100" stroke="#A88752" stroke-dasharray="4"/></svg></div>`)
    .replace(/^## (.*?)$/gm, '<h2><span class="num">§</span> $1</h2>');
  return marked.parse(processed);
}

function stripInternalHtmlComments(markdown) {
  return markdown.replace(/<!--[\s\S]*?-->/g, '').trimEnd();
}

function formatDate(dateString, language = siteConfig.defaultLanguage) {
  if (!dateString) return '';
  return new Intl.DateTimeFormat(language === 'pt-BR' ? 'pt-BR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(`${dateString}T00:00:00Z`));
}

function imageUrl(imagePath) {
  return imagePath ? absoluteUrl(imagePath) : '';
}

function renderImageMeta(propertyName, imagePath) {
  if (!imagePath) return '';
  const attribute = propertyName.startsWith('og:') ? 'property' : 'name';
  return `<meta ${attribute}="${propertyName}" content="${escapeHtml(imageUrl(imagePath))}" />`;
}

function renderArticleTagMeta(tags) {
  return tags.map((tag) => `<meta property="article:tag" content="${escapeHtml(tag)}" />`).join('\n');
}

function renderHero(post) {
  if (!post.featuredImage) return '';
  const caption = post.featuredImageCaption
    ? `<figcaption class="cap">${escapeHtml(post.featuredImageCaption)}</figcaption>`
    : '';
  return `
<section class="article-hero">
  <div class="inner">
    <figure class="photo-slot light photo-illus">
      <img src="${escapeHtml(post.featuredImage)}" alt="${escapeHtml(post.featuredImageAlt)}" />
      ${caption}
    </figure>
  </div>
</section>`;
}

function renderTags(tags) {
  if (!tags.length) return '';
  return `<div class="tags">${tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div>`;
}

function renderPostNavigation(post, posts) {
  const index = posts.findIndex((item) => item.slug === post.slug);
  if (index === -1 || posts.length < 2) return '';
  const newer = index > 0 ? posts[index - 1] : null;
  const older = index < posts.length - 1 ? posts[index + 1] : null;
  const card = (label, item, extraClass = '') => item ? `
    <a class="pn-card ${extraClass}" href="${escapeHtml(publicPathForDocument(item))}">
      <div class="pn-label">${label}</div>
      <div class="pn-cat">${escapeHtml(item.category)}</div>
      <h4>${escapeHtml(item.title)}</h4>
    </a>` : '';
  return `<div class="prev-next">${card('Newer essay', newer)}${card('Older essay', older, 'next')}</div>`;
}

function renderRelatedPosts(post, posts) {
  const related = posts.filter((item) => item.slug !== post.slug && item.category === post.category).slice(0, 3);
  if (!related.length) return '';
  return `
<section class="related">
  <div class="head">
    <h2>Related essays</h2>
    <a class="btn btn-gold" href="/insights">Browse all essays <span>→</span></a>
  </div>
  <div class="grid">
    ${related.map((item) => `<a class="card" href="${escapeHtml(publicPathForDocument(item))}"><div class="cat">${escapeHtml(item.category)}</div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.excerpt)}</p></a>`).join('\n')}
  </div>
</section>`;
}

function buildJsonLd(post, canonicalUrl, socialImagePath) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl
    },
    headline: post.seoTitle,
    description: post.metaDescription,
    inLanguage: post.language,
    author: {
      '@type': 'Person',
      name: post.author,
      url: absoluteUrl(siteConfig.authorPath)
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.publisherName,
      logo: {
        '@type': 'ImageObject',
        url: imageUrl(siteConfig.defaultSocialImage)
      }
    }
  };
  if (post.date) schema.datePublished = post.date;
  if (socialImagePath) schema.image = imageUrl(socialImagePath);
  if (post.category) schema.articleSection = post.category;
  if (post.tags.length) schema.keywords = post.tags.join(', ');
  return JSON.stringify(schema, null, 2).replace(/</g, '\\u003c');
}

function renderAlternateLinks(post) {
  const entries = new Map([[post.language, publicPathForDocument(post)], ...Object.entries(post.translations)]);
  const englishPath = entries.get('en') || publicPathForDocument(post);
  const links = [...entries.entries()].map(([language, publicPath]) =>
    `<link rel="alternate" hreflang="${escapeHtml(language)}" href="${escapeHtml(absoluteUrl(publicPath))}" />`
  );
  links.push(`<link rel="alternate" hreflang="x-default" href="${escapeHtml(absoluteUrl(englishPath))}" />`);
  return links.join('\n');
}

function renderLanguageSwitch(post) {
  const currentPath = publicPathForDocument(post);
  const englishPath = post.language === 'en' ? currentPath : (post.translations.en || '/insights');
  const portuguesePath = post.language === 'pt-BR' ? currentPath : (post.translations['pt-BR'] || '/insights');
  return `<div class="lang-switch" aria-label="Article language">
    <a href="${escapeHtml(englishPath)}" hreflang="en" lang="en" data-lang="EN"${post.language === 'en' ? ' class="on" aria-current="page"' : ''}>EN</a>
    <span aria-hidden="true">/</span>
    <a href="${escapeHtml(portuguesePath)}" hreflang="pt-BR" lang="pt-BR" data-lang="PT"${post.language === 'pt-BR' ? ' class="on" aria-current="page"' : ''}>PT-BR</a>
  </div>`;
}

function getPostUi(language) {
  if (language === 'pt-BR') {
    return {
      navHome: 'Início',
      navServices: 'Serviços',
      navAbout: 'Sobre',
      navBlog: 'Blog da Eliana',
      navContact: 'Contato',
      navSubscribe: 'Assinar',
      navMenuLabel: 'Abrir menu',
      insightsLabel: 'Publicações',
      essayLabel: 'Artigo',
      publicFinanceTagline: 'Trazendo clareza às finanças públicas',
      byLabel: 'Por',
      authorRole: 'Especialista Sênior, Finanças Públicas',
      authorTitle: 'Sobre a autora',
      authorDescription: 'Especialista sênior em finanças públicas, orçamento governamental e governança da saúde. Editora do <em>How Public Money Works</em>, uma publicação que explica em linguagem clara o funcionamento do dinheiro público nos Estados Unidos — da prefeitura ao governo estadual.',
      footerDescription: 'Trazendo clareza às finanças públicas — para cidadãos, comunidades e as instituições que os atendem.',
      footerRead: 'Leia',
      footerFeatured: 'Artigo em destaque',
      footerCategory: 'Por categoria',
      footerGlossary: 'Glossário',
      footerPractice: 'Atuação',
      footerFocus: 'Áreas de atuação',
      footerResources: 'Recursos',
      footerSpeaking: 'Palestras',
      footerConnect: 'Contato',
      footerTagline: 'Trazendo clareza às finanças públicas.'
    };
  }
  return {
    navHome: 'Home',
    navServices: 'Services',
    navAbout: 'About Us',
    navBlog: "Eliana's Blog",
    navContact: 'Contact',
    navSubscribe: 'Subscribe',
    navMenuLabel: 'Toggle Menu',
    insightsLabel: 'Insights',
    essayLabel: 'Essay',
    publicFinanceTagline: 'Bringing clarity to public finance',
    byLabel: 'By',
    authorRole: 'Senior Practice, Public Finance',
    authorTitle: 'About the author',
    authorDescription: 'A senior practice in public finance, government budgeting, and health governance. Editor of <em>How Public Money Works</em>, a publication that brings plain-language clarity to the workings of American public money — from city hall to state capitol.',
    footerDescription: 'Bringing clarity to public finance — for citizens, communities, and the institutions that serve them.',
    footerRead: 'Read',
    footerFeatured: 'Featured Essay',
    footerCategory: 'By Category',
    footerGlossary: 'Glossary',
    footerPractice: 'Practice',
    footerFocus: 'Areas of Focus',
    footerResources: 'Resources',
    footerSpeaking: 'Speaking',
    footerConnect: 'Connect',
    footerTagline: 'Bringing clarity to public finance.'
  };
}

function renderPostPage(document, posts, template, essayNumber, options = {}) {
  const post = document.data;
  const isPreview = options.mode === 'preview';
  const canonicalUrl = absoluteUrl(publicPathForDocument(post));
  const socialImagePath = post.featuredImage || siteConfig.defaultSocialImage;
  const bodyMarkdown = stripInternalHtmlComments(stripLeadingArticleH1(document.content, post.title));
  const body = parseMarkdownWithShortcodes(bodyMarkdown);
  const wordCount = bodyMarkdown.trim() ? bodyMarkdown.trim().split(/\s+/).length : 0;
  const ui = getPostUi(post.language);

  return replaceTokens(template, {
    documentTitle: escapeHtml(`${post.seoTitle} — ${siteConfig.siteName}`),
    htmlLanguage: escapeHtml(post.language),
    uiLanguage: post.language === 'pt-BR' ? 'pt' : 'en',
    metaDescription: escapeHtml(post.metaDescription),
    robotsDirective: isPreview ? 'noindex,nofollow' : 'index, follow',
    canonicalLink: isPreview ? '' : `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`,
    ogUrlMeta: isPreview ? '' : `<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`,
    alternateLinks: isPreview ? '' : renderAlternateLinks(post),
    ogLocale: escapeHtml(siteConfig.localeByLanguage[post.language]),
    ogAlternateLocaleMeta: Object.keys(post.translations).map((language) => `<meta property="og:locale:alternate" content="${escapeHtml(siteConfig.localeByLanguage[language])}" />`).join('\n'),
    seoTitle: escapeHtml(post.seoTitle),
    ogImageMeta: renderImageMeta('og:image', socialImagePath),
    twitterImageMeta: renderImageMeta('twitter:image', socialImagePath),
    articlePublishedTimeMeta: post.date ? `<meta property="article:published_time" content="${escapeHtml(post.date)}" />` : '',
    articleSectionMeta: post.category ? `<meta property="article:section" content="${escapeHtml(post.category)}" />` : '',
    articleTagMeta: renderArticleTagMeta(post.tags),
    jsonLdScript: isPreview ? '' : `<script type="application/ld+json">\n${buildJsonLd(post, canonicalUrl, socialImagePath)}\n</script>`,
    title: escapeHtml(post.title),
    subtitle: escapeHtml(post.subtitle),
    author: escapeHtml(post.author),
    category: escapeHtml(post.category),
    essayNumber: String(essayNumber).padStart(2, '0'),
    readingTime: escapeHtml(post.readingTime),
    wordCount: wordCount.toLocaleString('en-US'),
    dateDisplayHtml: post.date ? `<span>${escapeHtml(formatDate(post.date, post.language))}</span>` : '',
    wordCountLabel: post.language === 'pt-BR' ? 'palavras' : 'words',
    languageSwitchHtml: renderLanguageSwitch(post),
    ...Object.fromEntries(Object.entries(ui).map(([key, value]) => [key, key === 'authorDescription' ? value : escapeHtml(value)])),
    shareLabel: post.language === 'pt-BR' ? 'Compartilhar —' : 'Share —',
    copyLinkLabel: post.language === 'pt-BR' ? 'Copiar link' : 'Copy link',
    printLabel: post.language === 'pt-BR' ? 'Imprimir' : 'Print',
    educationalDisclaimerHtml: post.language === 'pt-BR'
      ? `<b>Aviso educacional:</b> O conteúdo de "${escapeHtml(siteConfig.siteName)}" tem finalidade exclusivamente educativa e cívica. Não constitui orientação jurídica, financeira, contábil ou política. Estruturas de governo local, leis e práticas de finanças públicas variam significativamente entre estados, condados, cidades e distritos especiais. Consulte sempre os documentos oficiais do seu governo local e profissionais qualificados para obter orientação específica sobre sua jurisdição.`
      : `<b>Educational Disclaimer:</b> The content provided on "${escapeHtml(siteConfig.siteName)}" is intended strictly for civic educational purposes. It does not constitute legal, financial, accounting, or political advice. Local government structures, laws, and public finance practices vary significantly by state, county, city, and special district. Always consult your local government's official documents and qualified professionals for guidance specific to your jurisdiction.`,
    heroHtml: renderHero(post),
    body,
    tagsHtml: renderTags(post.tags),
    postNavigationHtml: renderPostNavigation(post, posts),
    relatedPostsHtml: renderRelatedPosts(post, posts),
    siteName: escapeHtml(siteConfig.siteName)
  }, 'src/templates/post.html');
}

function renderPostImage(post, className = 'photo-slot light photo-illus') {
  if (!post.featuredImage) return `<div class="${className}" aria-hidden="true"></div>`;
  return `<div class="${className}"><img src="${escapeHtml(post.featuredImage)}" alt="${escapeHtml(post.featuredImageAlt)}" loading="lazy" /></div>`;
}

function renderFeaturedPost(post) {
  if (!post) return '';
  return `
<section class="featured-essay">
  <div class="inner">
    <a href="${escapeHtml(publicPathForDocument(post))}" aria-label="Read ${escapeHtml(post.title)}">
      ${renderPostImage(post)}
    </a>
    <div class="text">
      <div class="badge">Featured Essay</div>
      <h2>${escapeHtml(post.title)}</h2>
      <div class="meta"><span>${escapeHtml(post.category)}</span><span class="dot"></span><span>${escapeHtml(post.readingTime)}</span></div>
      <p class="excerpt">${escapeHtml(post.excerpt)}</p>
      <a class="btn btn-primary" href="${escapeHtml(publicPathForDocument(post))}">Read the Essay <span>→</span></a>
    </div>
  </div>
</section>`;
}

function renderPostCards(posts) {
  return posts.map((post, index) => `
  <article class="essay-card" data-category="${escapeHtml(post.category.toLowerCase())}">
    <a href="${escapeHtml(publicPathForDocument(post))}" aria-label="Read ${escapeHtml(post.title)}">
      ${renderPostImage(post)}
    </a>
    <div class="body">
      <div class="meta-row"><span class="cat">${escapeHtml(post.category)}</span><span class="num">N.º ${String(posts.length - index).padStart(2, '0')}</span></div>
      <h3><a href="${escapeHtml(publicPathForDocument(post))}">${escapeHtml(post.title)}</a></h3>
      <p>${escapeHtml(post.excerpt)}</p>
      <div class="card-foot"><span class="time">${escapeHtml(post.readingTime)}</span><a class="read" href="${escapeHtml(publicPathForDocument(post))}">Read →</a></div>
    </div>
  </article>`).join('\n');
}

function renderCategoryFilters(posts) {
  const categories = [...new Set([
    ...siteConfig.contentCategories,
    ...posts.map((post) => post.category),
    ...siteConfig.legacyCategories
  ])];
  return ['All', ...categories].map((category, index) => `<button type="button" class="cat${index === 0 ? ' on' : ''}">${escapeHtml(category)}</button>`).join('\n');
}

function renderInsightsPage(posts, template) {
  const socialImageUrl = imageUrl(siteConfig.defaultSocialImage);
  return replaceTokens(template, {
    siteName: escapeHtml(siteConfig.siteName),
    insightsUrl: escapeHtml(absoluteUrl('/insights')),
    defaultSocialImageUrl: escapeHtml(socialImageUrl),
    categoryFilters: renderCategoryFilters(posts),
    featuredPostHtml: renderFeaturedPost(posts[0]),
    postsGrid: renderPostCards(posts),
    postCount: String(posts.length)
  }, 'src/templates/insights.html');
}

function renderIndexPage(template) {
  return replaceTokens(template, {
    homeUrl: escapeHtml(absoluteUrl('/')),
    defaultSocialImageUrl: escapeHtml(imageUrl(siteConfig.defaultSocialImage))
  }, 'src/index.html');
}

function copyRecursiveSync(source, destination) {
  const stats = fs.statSync(source);
  if (stats.isDirectory()) {
    fs.mkdirSync(destination, { recursive: true });
    for (const item of fs.readdirSync(source)) {
      copyRecursiveSync(path.join(source, item), path.join(destination, item));
    }
  } else {
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(source, destination);
  }
}

function sanitizeJpegMetadata(buffer, sourceName = '<jpeg>') {
  if (buffer.length < 4 || buffer[0] !== 0xFF || buffer[1] !== 0xD8) {
    throw new Error(`${sourceName} is not a valid JPEG file`);
  }
  const chunks = [buffer.subarray(0, 2)];
  let offset = 2;
  while (offset < buffer.length) {
    const markerStart = offset;
    if (buffer[offset] !== 0xFF) throw new Error(`${sourceName} has malformed JPEG metadata`);
    while (offset < buffer.length && buffer[offset] === 0xFF) offset += 1;
    const marker = buffer[offset];
    offset += 1;
    if (marker === 0xDA || marker === 0xD9) {
      chunks.push(buffer.subarray(markerStart));
      return Buffer.concat(chunks);
    }
    if (marker === 0x01 || (marker >= 0xD0 && marker <= 0xD7)) {
      chunks.push(buffer.subarray(markerStart, offset));
      continue;
    }
    if (offset + 2 > buffer.length) throw new Error(`${sourceName} has a truncated JPEG segment`);
    const segmentLength = buffer.readUInt16BE(offset);
    const segmentEnd = offset + segmentLength;
    if (segmentLength < 2 || segmentEnd > buffer.length) throw new Error(`${sourceName} has an invalid JPEG segment length`);
    const isPrivateMetadata = marker === 0xE1 || marker === 0xED || marker === 0xFE;
    if (!isPrivateMetadata) chunks.push(buffer.subarray(markerStart, segmentEnd));
    offset = segmentEnd;
  }
  throw new Error(`${sourceName} has no JPEG scan data`);
}

function copyPublicAsset(publicPath, outputDirectory) {
  const match = publicPath.match(/^\/assets\/([A-Za-z0-9][A-Za-z0-9._/-]*)$/);
  if (!match || match[1].split('/').includes('..')) throw new Error(`Unsafe public asset path: ${publicPath}`);
  const sourceRoot = path.join(SRC_DIR, 'assets');
  const sourcePath = path.resolve(sourceRoot, ...match[1].split('/'));
  if (!sourcePath.startsWith(`${sourceRoot}${path.sep}`) || !fs.existsSync(sourcePath) || !fs.statSync(sourcePath).isFile()) {
    throw new Error(`Referenced public asset does not exist: ${publicPath}`);
  }
  const destinationPath = path.join(outputDirectory, 'assets', ...match[1].split('/'));
  fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
  if (/\.jpe?g$/i.test(sourcePath)) {
    fs.writeFileSync(destinationPath, sanitizeJpegMetadata(fs.readFileSync(sourcePath), publicPath));
  } else {
    fs.copyFileSync(sourcePath, destinationPath);
  }
  return destinationPath;
}

function copyReferencedPublicAssets(outputDirectory) {
  const assetPaths = new Set();
  const textFiles = [];
  const visit = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(fullPath);
      else if (/\.(?:html|css|js|xml)$/i.test(entry.name)) {
        textFiles.push(fullPath);
        const text = fs.readFileSync(fullPath, 'utf8');
        for (const match of text.matchAll(/\/?assets\/[A-Za-z0-9][A-Za-z0-9._/-]*/g)) {
          assetPaths.add(`/${match[0].replace(/^\//, '')}`);
        }
      }
    }
  };
  visit(outputDirectory);
  const publicAssets = [];
  for (const assetPath of [...assetPaths].sort()) {
    const relativeSource = assetPath.replace(/^\/assets\//, '');
    const sourcePath = path.join(SRC_DIR, 'assets', ...relativeSource.split('/'));
    if (!fs.existsSync(sourcePath)) throw new Error(`Referenced public asset does not exist: ${assetPath}`);
    const sourceBuffer = fs.readFileSync(sourcePath);
    const publicBuffer = /\.jpe?g$/i.test(sourcePath) ? sanitizeJpegMetadata(sourceBuffer, assetPath) : sourceBuffer;
    const extension = path.extname(relativeSource);
    const baseName = relativeSource.slice(0, -extension.length);
    const fingerprint = crypto.createHash('sha256').update(publicBuffer).digest('hex').slice(0, 12);
    const fingerprintedPath = `/assets/${baseName}.${fingerprint}${extension}`;
    const destinationPath = path.join(outputDirectory, ...fingerprintedPath.replace(/^\//, '').split('/'));
    fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
    fs.writeFileSync(destinationPath, publicBuffer);
    for (const textFile of textFiles) {
      const text = fs.readFileSync(textFile, 'utf8');
      const relativeAssetPath = assetPath.replace(/^\//, '');
      const rewritten = text
        .split(assetPath).join(fingerprintedPath)
        .split(relativeAssetPath).join(fingerprintedPath);
      if (rewritten !== text) fs.writeFileSync(textFile, rewritten);
    }
    publicAssets.push(fingerprintedPath);
  }
  return publicAssets;
}

function generateSitemap(posts) {
  const entries = [
    { url: absoluteUrl('/') },
    { url: absoluteUrl('/insights') },
    ...posts.map((post) => ({ url: absoluteUrl(publicPathForDocument(post)), lastmod: post.date, post }))
  ];
  const urls = entries.map((entry) => {
    const alternates = entry.post ? new Map([[entry.post.language, publicPathForDocument(entry.post)], ...Object.entries(entry.post.translations)]) : null;
    const alternateXml = alternates
      ? [...alternates.entries(), ['x-default', alternates.get('en') || publicPathForDocument(entry.post)]]
        .map(([language, publicPath]) => `\n    <xhtml:link rel="alternate" hreflang="${escapeXml(language)}" href="${escapeXml(absoluteUrl(publicPath))}" />`).join('')
      : '';
    return `  <url>\n    <loc>${escapeXml(entry.url)}</loc>${entry.lastmod ? `\n    <lastmod>${escapeXml(entry.lastmod)}</lastmod>` : ''}${alternateXml}\n  </url>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`;
}

function generateRobots() {
  return `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl('/sitemap.xml')}\n`;
}

function loadPublishedDocuments() {
  const documents = listMarkdownFiles(POSTS_DIR).map(loadMarkdownFile);
  const validation = validateDocuments(documents);
  for (const warning of validation.warnings) console.warn(`Warning: ${warning}`);
  if (validation.errors.length) throw new Error(`Content validation failed:\n- ${validation.errors.join('\n- ')}`);
  return documents.filter((document) => document.data.status === 'published');
}

function buildSite() {
  const documents = loadPublishedDocuments();
  documents.sort((a, b) => new Date(b.data.date) - new Date(a.data.date));
  const posts = documents.map((document) => document.data);
  const indexPosts = posts.filter((post) => post.language === siteConfig.defaultLanguage);

  const postTemplate = fs.readFileSync(POST_TEMPLATE_PATH, 'utf8');
  const insightsTemplate = fs.readFileSync(INSIGHTS_TEMPLATE_PATH, 'utf8');
  const indexTemplate = fs.readFileSync(path.join(SRC_DIR, 'index.html'), 'utf8');

  const resolvedDist = path.resolve(DIST_DIR);
  if (resolvedDist !== path.join(ROOT_DIR, 'dist')) throw new Error(`Unsafe dist path: ${resolvedDist}`);
  if (fs.existsSync(resolvedDist)) fs.rmSync(resolvedDist, { recursive: true, force: true });
  fs.mkdirSync(resolvedDist, { recursive: true });

  fs.mkdirSync(path.join(resolvedDist, 'shared'), { recursive: true });
  fs.copyFileSync(path.join(SRC_DIR, 'shared', 'base.css'), path.join(resolvedDist, 'shared', 'base.css'));
  fs.copyFileSync(path.join(SRC_DIR, 'shared', 'main.js'), path.join(resolvedDist, 'shared', 'main.js'));
  fs.copyFileSync(path.join(SRC_DIR, '404.html'), path.join(resolvedDist, '404.html'));
  fs.writeFileSync(path.join(resolvedDist, 'index.html'), renderIndexPage(indexTemplate));

  documents.forEach((document) => {
    const sameLanguagePosts = posts.filter((post) => post.language === document.data.language);
    const languageIndex = sameLanguagePosts.findIndex((post) => post.slug === document.data.slug);
    const html = renderPostPage(document, sameLanguagePosts, postTemplate, sameLanguagePosts.length - languageIndex);
    const relativeOutputPath = `${publicPathForDocument(document).replace(/^\//, '')}.html`;
    const outputPath = path.join(resolvedDist, relativeOutputPath);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, html);
  });

  fs.writeFileSync(path.join(resolvedDist, 'insights.html'), renderInsightsPage(indexPosts, insightsTemplate));
  fs.writeFileSync(path.join(resolvedDist, 'sitemap.xml'), generateSitemap(posts));
  fs.writeFileSync(path.join(resolvedDist, 'robots.txt'), generateRobots());
  const publicAssets = copyReferencedPublicAssets(resolvedDist);

  console.log(`Build complete. Generated ${posts.length} published post(s), ${publicAssets.length} referenced asset(s), sitemap.xml, and robots.txt.`);
  return { posts, publicAssets, outputDirectory: resolvedDist };
}

if (require.main === module) {
  try {
    buildSite();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  buildSite,
  renderPostPage,
  renderInsightsPage,
  generateSitemap,
  generateRobots,
  copyRecursiveSync,
  copyPublicAsset,
  copyReferencedPublicAssets,
  sanitizeJpegMetadata,
  stripInternalHtmlComments,
  parseMarkdownWithShortcodes
};
