'use strict';

const RESOURCE_STATUSES = Object.freeze(['published', 'coming-soon', 'draft']);
const RESOURCE_LANGUAGES = Object.freeze(['en', 'pt-BR']);

const RESOURCE_MANIFEST = Object.freeze([
  {
    id: 'glossary-of-public-finance-en',
    slug: 'glossary-of-public-finance',
    locale: 'en',
    title: 'Glossary of Public Finance',
    shortTitle: 'Public Finance Glossary',
    category: 'Reference',
    description: 'An evolving A–Z of public-finance terms, in plain English. From appropriation to zero-based budgeting.',
    subtitle: 'A reference structure for public-finance terms in plain language.',
    status: 'published',
    contentStatus: 'approved',
    reviewStatus: 'approved',
    seoTitle: 'Glossary of Public Finance | Lumina Smart Strategies',
    metaDescription: 'A plain-language reference to public-finance terms used in U.S. local government budgeting, revenue, funds, debt, reporting, and oversight.',
    route: '/resources/glossary-of-public-finance',
    pairedResourceId: 'glossario-de-financas-publicas-pt-br',
    canonical: 'https://www.luminasmart.company/resources/glossary-of-public-finance',
    hreflang: {
      en: 'https://www.luminasmart.company/resources/glossary-of-public-finance',
      'pt-BR': 'https://www.luminasmart.company/pt-br/resources/glossario-de-financas-publicas'
    },
    cardOrder: 1,
    featured: false,
    publishedAt: '2026-08-25',
    updatedAt: '2026-08-25',
    action: 'Read glossary →',
    content: { type: 'page', source: 'src/resources/glossary-data.js' }
  },
  {
    id: 'glossario-de-financas-publicas-pt-br',
    slug: 'glossario-de-financas-publicas',
    locale: 'pt-BR',
    title: 'Glossário de Finanças Públicas',
    shortTitle: 'Glossário de Finanças Públicas',
    category: 'Referência',
    description: 'Uma estrutura de referência para termos de finanças públicas em linguagem simples.',
    subtitle: 'Uma estrutura de referência para termos de finanças públicas em linguagem simples.',
    status: 'published',
    contentStatus: 'approved',
    reviewStatus: 'approved',
    seoTitle: 'Glossário de Finanças Públicas | Lumina Smart Strategies',
    metaDescription: 'Uma referência em linguagem simples para termos de finanças públicas usados no orçamento e na prestação de contas de governos locais dos EUA.',
    route: '/pt-br/resources/glossario-de-financas-publicas',
    pairedResourceId: 'glossary-of-public-finance-en',
    canonical: 'https://www.luminasmart.company/pt-br/resources/glossario-de-financas-publicas',
    hreflang: {
      en: 'https://www.luminasmart.company/resources/glossary-of-public-finance',
      'pt-BR': 'https://www.luminasmart.company/pt-br/resources/glossario-de-financas-publicas'
    },
    cardOrder: 1,
    featured: false,
    publishedAt: '2026-08-25',
    updatedAt: '2026-08-25',
    action: 'Ler glossário →',
    content: { type: 'page', source: 'src/resources/glossary-data.js' }
  },
  {
    id: 'how-to-read-a-city-budget-en',
    slug: 'how-to-read-a-city-budget',
    locale: 'en',
    title: 'How to Read a City Budget',
    shortTitle: 'How to Read a City Budget',
    category: 'Article guide',
    description: 'A plain-language article about what a city budget is, how it shapes public choices, and why residents may want to read it.',
    subtitle: 'An existing published guide presented through the Resources library.',
    status: 'published',
    route: '/what-is-a-city-budget-and-why-should-you-care',
    pairedResourceId: 'como-ler-um-orcamento-municipal-pt-br',
    canonical: 'https://www.luminasmart.company/what-is-a-city-budget-and-why-should-you-care',
    hreflang: {
      en: 'https://www.luminasmart.company/what-is-a-city-budget-and-why-should-you-care',
      'pt-BR': 'https://www.luminasmart.company/insights'
    },
    cardOrder: 2,
    featured: true,
    publishedAt: null,
    updatedAt: null,
    action: 'Read article →',
    content: { type: 'article', route: '/what-is-a-city-budget-and-why-should-you-care' }
  },
  {
    id: 'como-ler-um-orcamento-municipal-pt-br',
    slug: 'como-ler-um-orcamento-municipal',
    locale: 'pt-BR',
    title: 'Como Ler um Orçamento Municipal',
    shortTitle: 'Como Ler um Orçamento Municipal',
    category: 'Artigo-guia',
    description: 'Um artigo em linguagem simples sobre o que é um orçamento municipal, como ele orienta escolhas públicas e por que vale a pena consultá-lo.',
    subtitle: 'Um guia publicado apresentado pela biblioteca de Recursos.',
    status: 'draft',
    route: '/pt-br/resources/como-ler-um-orcamento-municipal',
    pairedResourceId: 'how-to-read-a-city-budget-en',
    canonical: null,
    hreflang: {},
    cardOrder: 2,
    featured: true,
    publishedAt: null,
    updatedAt: null,
    action: 'Disponível em inglês →',
    content: null
  },
  {
    id: 'where-do-your-local-taxes-actually-go-en',
    slug: 'where-do-your-local-taxes-actually-go',
    locale: 'en',
    title: 'Where Do Your Local Taxes Actually Go?',
    shortTitle: 'Where Do Your Local Taxes Go?',
    category: 'Article guide',
    description: 'A conceptual guide to revenue sources, local governments, funds, and the services they support.',
    subtitle: 'An existing published guide presented through the Resources library.',
    status: 'published',
    route: '/where-do-your-local-taxes-actually-go',
    pairedResourceId: 'para-onde-vao-os-seus-impostos-locais-pt-br',
    canonical: 'https://www.luminasmart.company/where-do-your-local-taxes-actually-go',
    hreflang: {
      en: 'https://www.luminasmart.company/where-do-your-local-taxes-actually-go',
      'pt-BR': 'https://www.luminasmart.company/pt-br/para-onde-vao-os-seus-impostos-locais'
    },
    cardOrder: 3,
    featured: false,
    publishedAt: null,
    updatedAt: null,
    action: 'Read article →',
    content: { type: 'article', route: '/where-do-your-local-taxes-actually-go' }
  },
  {
    id: 'para-onde-vao-os-seus-impostos-locais-pt-br',
    slug: 'para-onde-vao-os-seus-impostos-locais',
    locale: 'pt-BR',
    title: 'Para Onde Vão os Seus Impostos Locais?',
    shortTitle: 'Para Onde Vão os Seus Impostos Locais?',
    category: 'Artigo-guia',
    description: 'Um guia conceitual sobre fontes de receita, governos locais, fundos e os serviços que eles sustentam.',
    subtitle: 'Um guia publicado apresentado pela biblioteca de Recursos.',
    status: 'published',
    route: '/pt-br/para-onde-vao-os-seus-impostos-locais',
    pairedResourceId: 'where-do-your-local-taxes-actually-go-en',
    canonical: 'https://www.luminasmart.company/pt-br/para-onde-vao-os-seus-impostos-locais',
    hreflang: {
      en: 'https://www.luminasmart.company/where-do-your-local-taxes-actually-go',
      'pt-BR': 'https://www.luminasmart.company/pt-br/para-onde-vao-os-seus-impostos-locais'
    },
    cardOrder: 3,
    featured: false,
    publishedAt: null,
    updatedAt: null,
    action: 'Ler artigo →',
    content: { type: 'article', route: '/pt-br/para-onde-vao-os-seus-impostos-locais' }
  },
  {
    id: 'open-data-portals-en',
    slug: 'open-data-portals',
    locale: 'en',
    title: 'Open-Data Portals — A Map',
    shortTitle: 'Open-Data Portals',
    category: 'Index',
    description: "Where to find your city's, county's, and state's published financial data — with notes on what each portal offers.",
    subtitle: 'A prepared directory structure for public financial data portals.',
    status: 'coming-soon',
    route: '/resources/open-data-portals',
    pairedResourceId: 'portais-de-dados-abertos-pt-br',
    canonical: null,
    hreflang: {},
    cardOrder: 4,
    featured: false,
    publishedAt: null,
    updatedAt: null,
    action: 'Coming soon',
    content: null
  },
  {
    id: 'portais-de-dados-abertos-pt-br',
    slug: 'portais-de-dados-abertos',
    locale: 'pt-BR',
    title: 'Portais de Dados Abertos — Um Mapa',
    shortTitle: 'Portais de Dados Abertos',
    category: 'Índice',
    description: 'Uma estrutura preparada para organizar portais de dados financeiros públicos.',
    subtitle: 'Uma estrutura preparada para organizar portais de dados financeiros públicos.',
    status: 'coming-soon',
    route: '/pt-br/resources/portais-de-dados-abertos',
    pairedResourceId: 'open-data-portals-en',
    canonical: null,
    hreflang: {},
    cardOrder: 4,
    featured: false,
    publishedAt: null,
    updatedAt: null,
    action: 'Em breve',
    content: null
  },
  {
    id: 'civic-finance-reading-list-en',
    slug: 'civic-finance-reading-list',
    locale: 'en',
    title: 'Reading List · Civic Finance',
    shortTitle: 'Civic Finance Reading List',
    category: 'Bibliography',
    description: 'A curated learning path through U.S. state and local public finance, with annotated institutional resources, professional references, and foundational books.',
    subtitle: 'A curated path through U.S. state and local public finance — from budgets and taxes to financial statements, municipal debt, fiscal condition, and accountability.',
    status: 'coming-soon',
    contentStatus: 'draft',
    reviewStatus: 'draft',
    seoTitle: 'Civic Finance Reading List | U.S. Public Finance Resources | Lumina Smart Strategies',
    metaDescription: 'A curated reading list for understanding U.S. state and local public finance, including budgeting, government accounting, municipal debt, taxation, fiscal health, and transparency.',
    route: '/resources/civic-finance-reading-list',
    pairedResourceId: 'lista-de-leituras-financas-civicas-pt-br',
    canonical: null,
    hreflang: {},
    cardOrder: 5,
    featured: false,
    publishedAt: null,
    updatedAt: null,
    action: 'Coming soon',
    content: { type: 'page', source: 'src/resources/civic-finance-reading-list-data.js' }
  },
  {
    id: 'lista-de-leituras-financas-civicas-pt-br',
    slug: 'lista-de-leituras-financas-civicas',
    locale: 'pt-BR',
    title: 'Lista de Leitura · Finanças Cívicas',
    shortTitle: 'Lista de Leitura · Finanças Cívicas',
    category: 'Bibliografia',
    description: 'Uma trilha de aprendizagem curada sobre finanças públicas estaduais e locais dos EUA, com recursos institucionais, referências profissionais e livros fundamentais.',
    subtitle: 'Um percurso curado pelas finanças públicas estaduais e locais dos Estados Unidos — de orçamento e tributação a demonstrações financeiras, dívida municipal, condição fiscal e accountability.',
    status: 'coming-soon',
    contentStatus: 'draft',
    reviewStatus: 'draft',
    seoTitle: 'Lista de Leitura de Finanças Públicas dos EUA | Lumina Smart Strategies',
    metaDescription: 'Uma lista de leitura curada para entender finanças públicas estaduais e locais dos EUA: orçamento, contabilidade governamental, dívida municipal, tributação, saúde fiscal e transparência.',
    route: '/pt-br/resources/lista-de-leituras-financas-civicas',
    pairedResourceId: 'civic-finance-reading-list-en',
    canonical: null,
    hreflang: {},
    cardOrder: 5,
    featured: false,
    publishedAt: null,
    updatedAt: null,
    action: 'Em breve',
    content: { type: 'page', source: 'src/resources/civic-finance-reading-list-data.js' }
  },
  {
    id: 'annual-reports-where-to-find-them-en',
    slug: 'annual-reports-where-to-find-them',
    locale: 'en',
    title: 'Annual Reports — Where to Find Them',
    shortTitle: 'Where to Find Annual Reports',
    category: 'Directory',
    description: 'A practical guide to finding official annual financial reports from U.S. cities, counties, and states — and verifying what you found.',
    subtitle: 'Find official annual financial reports and verify the government, fiscal year, report type, and source.',
    status: 'published',
    contentStatus: 'approved',
    reviewStatus: 'approved',
    seoTitle: 'Annual Reports — Where to Find Them | Lumina Smart Strategies',
    metaDescription: 'A practical guide to finding official U.S. state and local annual financial reports, including ACFRs, audited statements, PAFRs, and EMMA disclosures.',
    route: '/resources/annual-reports-where-to-find-them',
    pairedResourceId: 'relatorios-anuais-onde-encontrar-pt-br',
    canonical: 'https://www.luminasmart.company/resources/annual-reports-where-to-find-them',
    hreflang: {
      en: 'https://www.luminasmart.company/resources/annual-reports-where-to-find-them',
      'pt-BR': 'https://www.luminasmart.company/pt-br/resources/relatorios-anuais-onde-encontrar'
    },
    cardOrder: 6,
    featured: false,
    publishedAt: '2026-08-30',
    updatedAt: '2026-08-30',
    action: 'Read guide →',
    content: { type: 'page', source: 'src/resources/annual-reports-data.js' }
  },
  {
    id: 'relatorios-anuais-onde-encontrar-pt-br',
    slug: 'relatorios-anuais-onde-encontrar',
    locale: 'pt-BR',
    title: 'Relatórios Anuais — Onde Encontrá-los',
    shortTitle: 'Onde Encontrar Relatórios Anuais',
    category: 'Diretório',
    description: 'Um guia prático para encontrar relatórios financeiros anuais oficiais de cidades, counties e estados dos EUA — e verificar o documento encontrado.',
    subtitle: 'Encontre relatórios financeiros anuais oficiais e confirme governo, exercício fiscal, tipo de relatório e fonte.',
    status: 'published',
    contentStatus: 'approved',
    reviewStatus: 'approved',
    seoTitle: 'Relatórios Anuais — Onde Encontrá-los | Lumina Smart Strategies',
    metaDescription: 'Um guia prático para encontrar relatórios financeiros anuais oficiais de governos estaduais e locais dos EUA, incluindo ACFR, demonstrações auditadas, PAFR e disclosures no EMMA.',
    route: '/pt-br/resources/relatorios-anuais-onde-encontrar',
    pairedResourceId: 'annual-reports-where-to-find-them-en',
    canonical: 'https://www.luminasmart.company/pt-br/resources/relatorios-anuais-onde-encontrar',
    hreflang: {
      en: 'https://www.luminasmart.company/resources/annual-reports-where-to-find-them',
      'pt-BR': 'https://www.luminasmart.company/pt-br/resources/relatorios-anuais-onde-encontrar'
    },
    cardOrder: 6,
    featured: false,
    publishedAt: '2026-08-30',
    updatedAt: '2026-08-30',
    action: 'Ler guia →',
    content: { type: 'page', source: 'src/resources/annual-reports-data.js' }
  }
]);

function validateResourceManifest(manifest = RESOURCE_MANIFEST) {
  const errors = [];
  const ids = new Set();
  const routes = new Set();
  const slugsByLocale = new Set();
  const requiredFields = ['id', 'slug', 'locale', 'title', 'shortTitle', 'category', 'description', 'status', 'route', 'pairedResourceId', 'canonical', 'hreflang', 'cardOrder', 'featured', 'publishedAt', 'updatedAt'];

  for (const resource of manifest) {
    for (const field of requiredFields) {
      if (!Object.prototype.hasOwnProperty.call(resource, field)) errors.push(`${resource.id || '<unknown>'}: missing ${field}`);
    }
    if (ids.has(resource.id)) errors.push(`${resource.id}: duplicate id`);
    ids.add(resource.id);
    if (!RESOURCE_LANGUAGES.includes(resource.locale)) errors.push(`${resource.id}: unsupported locale ${resource.locale}`);
    if (!RESOURCE_STATUSES.includes(resource.status)) errors.push(`${resource.id}: unsupported status ${resource.status}`);
    const localeSlug = `${resource.locale}:${resource.slug}`;
    if (slugsByLocale.has(localeSlug)) errors.push(`${resource.id}: duplicate slug for ${resource.locale}`);
    slugsByLocale.add(localeSlug);
    if (routes.has(resource.route)) errors.push(`${resource.id}: duplicate route`);
    routes.add(resource.route);
    if (!ids.has(resource.pairedResourceId) && !manifest.some((candidate) => candidate.id === resource.pairedResourceId)) errors.push(`${resource.id}: missing paired resource ${resource.pairedResourceId}`);
    if (resource.status === 'published' && (!resource.route || !resource.canonical)) errors.push(`${resource.id}: published resource requires route and canonical`);
    if (resource.status !== 'published' && (resource.canonical !== null || Object.keys(resource.hreflang || {}).length > 0)) errors.push(`${resource.id}: unpublished resource cannot expose canonical or hreflang`);
  }

  for (const resource of manifest) {
    const pair = manifest.find((candidate) => candidate.id === resource.pairedResourceId);
    if (!pair) continue;
    if (pair.pairedResourceId !== resource.id) errors.push(`${resource.id}: pairing is not reciprocal`);
    if (pair.locale === resource.locale) errors.push(`${resource.id}: pair must use the other locale`);
    if (resource.status === 'published' && pair.status === 'published' && resource.hreflang[pair.locale] !== pair.canonical) errors.push(`${resource.id}: hreflang does not point to pair canonical`);
  }

  return { pass: errors.length === 0, errors };
}

const validation = validateResourceManifest();
if (!validation.pass) throw new Error(`Invalid Resources manifest:\n- ${validation.errors.join('\n- ')}`);

function getHomepageResources(manifest = RESOURCE_MANIFEST) {
  return manifest.filter((resource) => resource.locale === 'en' && resource.cardOrder).sort((left, right) => left.cardOrder - right.cardOrder);
}

module.exports = {
  RESOURCE_LANGUAGES,
  RESOURCE_MANIFEST,
  RESOURCE_STATUSES,
  getHomepageResources,
  validateResourceManifest
};
