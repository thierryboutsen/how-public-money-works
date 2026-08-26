'use strict';

const SOURCE_LINKS = Object.freeze({
  gfoaChecklist: 'https://www.gfoa.org/comprehensive-general-purpose-checklist',
  gfoaPopular: 'https://www.gfoa.org/materials/popular-reporting-of-financial-information',
  gfoaPeriodic: 'https://www.gfoa.org/materials/periodic-disclosure-and-the-annual-comprehensive-financial-report',
  investorSources: 'https://www.investor.gov/introduction-investing/investing-basics/glossary/sources-municipal-securities-information',
  investorEmma: 'https://www.investor.gov/introduction-investing/getting-started/researching-investments/using-emma-researching-municipal',
  emmaAbout: 'https://www.msrb.org/Transparency-and-Technology/About-EMMA',
  emmaPortal: 'https://emma.msrb.org/',
  milwaukeeCity: 'https://city.milwaukee.gov/Comptroller/AnnualComprehensiveFinancial',
  nyc: 'https://comptroller.nyc.gov/reports/annual-comprehensive-financial-reports/',
  marinCounty: 'https://www.marincounty.gov/departments/finance/accounting/annual-comprehensive-financial-reports-acfr',
  milwaukeeCounty: 'https://county.milwaukee.gov/EN/Comptroller/Accounting',
  illinois: 'https://illinoiscomptroller.gov/financial-reports-data/find-a-report/comprehensive-reporting/annual-comprehensive-financial-report/',
  northCarolina: 'https://www.ncosc.gov/public-information/annual-report-and-popular-report-archives'
});

const CONTENT = Object.freeze({
  en: {
    intro: 'Find the right annual financial report, understand what kind of document you opened, and verify that it belongs to the government and fiscal year you intended to research.',
    reportNamesTitle: 'Start with the report name',
    reportNamesIntro: 'U.S. state and local governments do not all use the same page title or filing pattern. These are the most useful terms to search on an official website:',
    reportNames: [
      ['Annual Comprehensive Financial Report (ACFR)', 'A detailed annual financial report commonly used by state and local governments. GASB Statement No. 98 replaced the former name “Comprehensive Annual Financial Report” with “Annual Comprehensive Financial Report.” Older archives may still use the former long-form title.'],
      ['Annual Financial Report', 'Some governments use a simpler title even when the document contains audited financial statements and other year-end financial information.'],
      ['Audited Financial Statements', 'This phrase can lead directly to the core financial statements and independent auditor’s report, even when no ACFR is published under that name.'],
      ['Popular Annual Financial Report (PAFR)', 'A shorter, citizen-facing report that presents selected financial information in a more accessible format. It is useful, but it is not a substitute for the full ACFR or audited financial statements when you need detailed reporting.']
    ],
    finderTitle: 'Where to look first',
    finder: [
      '<strong>The government’s official Finance, Comptroller, Controller, Auditor, Accounting, or Financial Reporting page.</strong> Start with the government’s own website rather than a third-party PDF mirror.',
      '<strong>A Financial Reports, Accounting, Investor Relations, or Reports section.</strong> The report may be filed under a department rather than linked from the homepage.',
      '<strong>A state controller, comptroller, auditor, or statewide reporting repository.</strong> These can be especially useful for state reports and, in some jurisdictions, local-government filings.',
      '<strong>EMMA for municipal-securities disclosures.</strong> The Municipal Securities Rulemaking Board’s EMMA system is the official source for municipal continuing-disclosure documents and can include annual financial information and audited financial statements associated with municipal securities.',
      '<strong>An official-domain search as a fallback.</strong> Try searches such as <code>site:cityname.gov ACFR</code>, <code>site:countyname.gov annual financial report</code>, or <code>site:state.xx.us audited financial statements</code>.'
    ],
    verifyTitle: 'How to verify the document',
    verifyIntro: 'Before relying on a report, check:',
    verify: [
      ['Government entity', 'Is this the exact city, county, state, authority, district, or component unit you intended to research?'],
      ['Fiscal year', 'Confirm the year-end date, not only the PDF upload date.'],
      ['Report type', 'ACFR, annual financial report, audited financial statements, PAFR, budget, and single-audit reports serve different purposes.'],
      ['Audit status', 'Look for an independent auditor’s report when audited financial statements are important to your research.'],
      ['Publication or revision date', 'A later revision can replace an earlier posting.'],
      ['Primary government vs. component unit', 'A legally separate component unit may have its own statements or appear separately within the government-wide report.'],
      ['Source', 'Prefer the government’s official domain or a recognized disclosure system such as EMMA.']
    ],
    examplesTitle: 'Official examples by government level',
    examplesIntro: 'These examples show the kinds of official pages to look for. They are examples, not a claim that every U.S. government uses the same reporting model.',
    levels: [
      ['Cities', [
        ['City of Milwaukee, Office of the Comptroller', 'Official multi-year Annual Comprehensive Financial Report archive.', 'milwaukeeCity'],
        ['New York City Comptroller', 'Official ACFR page with current and historical reports and an explanation of report contents.', 'nyc']
      ]],
      ['Counties', [
        ['Marin County, Department of Finance', 'Official ACFR page with the current report and historical archives.', 'marinCounty'],
        ['Milwaukee County, Office of the Comptroller', 'ACFR materials published through the county comptroller/accounting function.', 'milwaukeeCounty']
      ]],
      ['States', [
        ['Illinois Office of Comptroller', 'Official annual report page describing the State’s financial position and results of operations.', 'illinois'],
        ['North Carolina Office of the State Controller', 'Official controller site publishing and highlighting the State’s Annual Comprehensive Financial Report.', 'northCarolina']
      ]]
    ],
    comparisonTitle: 'ACFR vs. budget vs. PAFR',
    comparisonHeaders: ['Document', 'Main purpose', 'Time orientation', 'Typical level of detail'],
    comparisonRows: [
      ['Adopted budget', 'Authorizes or plans how resources will be raised and used', 'Forward-looking', 'Detailed by appropriations, departments, funds, programs, or other local structures'],
      ['ACFR / annual financial report', 'Reports completed-period financial position and activity', 'Backward-looking', 'High; often includes audited statements, notes, MD&A, supplementary and statistical information'],
      ['PAFR', 'Communicates selected annual financial information to a broad audience', 'Backward-looking', 'Condensed and reader-friendly']
    ],
    comparisonNote: 'A budget and an annual financial report answer different questions. The budget describes what a government planned or authorized; the annual report helps show what happened during the completed reporting period and how it was reported under the applicable accounting framework.',
    emmaTitle: 'Using EMMA',
    emmaParagraphs: [
      'EMMA is especially useful when the government or another public issuer has municipal securities outstanding and has continuing-disclosure obligations. It can provide official statements, annual financial information, operating data, audited financial statements when filed, event notices, and voluntary disclosures.',
      'Use EMMA as a disclosure source, not as a universal directory of every state or local annual report. Not every government report will be easiest to find there, and the disclosure set can vary by security and continuing-disclosure undertaking. When possible, compare the EMMA filing with the issuer’s own official finance or investor-relations page.'
    ],
    sequenceTitle: 'A practical search sequence',
    sequenceIntro: 'If you are starting from zero:',
    sequence: [
      'Search the official government website for <strong>ACFR</strong>.',
      'If that fails, search <strong>annual financial report</strong>.',
      'Then try <strong>audited financial statements</strong>.',
      'Check the Finance / Comptroller / Controller / Auditor / Accounting section.',
      'If municipal debt is relevant, search the issuer on <strong>EMMA</strong>.',
      'Verify the entity, fiscal year, report type, audit status, and source before using the numbers.'
    ],
    referencesTitle: 'Primary references'
  },
  'pt-BR': {
    intro: 'Encontre o relatório financeiro anual correto, entenda que tipo de documento você abriu e confirme se ele pertence ao governo e ao exercício fiscal que você realmente pretende pesquisar.',
    reportNamesTitle: 'Comece pelo nome do relatório',
    reportNamesIntro: 'Governos estaduais e locais dos Estados Unidos não usam todos o mesmo título de página nem o mesmo padrão de publicação. Estes são os termos mais úteis para procurar em um site oficial:',
    reportNames: [
      ['Annual Comprehensive Financial Report (ACFR)', 'Relatório financeiro anual abrangente usado por muitos governos estaduais e locais. O GASB Statement No. 98 substituiu o antigo nome “Comprehensive Annual Financial Report” por “Annual Comprehensive Financial Report”. Arquivos históricos ainda podem usar o título anterior.'],
      ['Annual Financial Report', 'Alguns governos usam um título mais simples, mesmo quando o documento contém demonstrações financeiras auditadas e outras informações financeiras de encerramento do exercício.'],
      ['Audited Financial Statements', 'A expressão pode levar diretamente às demonstrações financeiras e ao relatório do auditor independente, mesmo quando não existe uma página intitulada ACFR.'],
      ['Popular Annual Financial Report (PAFR)', 'Relatório mais curto, voltado ao público geral, que apresenta informações financeiras selecionadas de forma mais acessível. É útil, mas não substitui o ACFR completo ou as demonstrações financeiras auditadas quando a análise exige maior detalhe.']
    ],
    finderTitle: 'Onde procurar primeiro',
    finder: [
      '<strong>Página oficial de Finance, Comptroller, Controller, Auditor, Accounting ou Financial Reporting.</strong> Comece pelo site do próprio governo, não por um espelho de PDF de terceiros.',
      '<strong>Seção Financial Reports, Accounting, Investor Relations ou Reports.</strong> O relatório pode estar dentro de um departamento e não na página inicial.',
      '<strong>Repositório estadual de Controller, Comptroller ou Auditor, quando aplicável.</strong> Esses portais são especialmente úteis para relatórios estaduais e, em alguns estados, para informações de governos locais.',
      '<strong>EMMA para divulgações relacionadas a títulos municipais.</strong> O sistema EMMA, do Municipal Securities Rulemaking Board, é uma fonte oficial de continuing disclosures e pode conter informações financeiras anuais e demonstrações financeiras auditadas associadas a municipal securities.',
      '<strong>Busca restrita ao domínio oficial como último recurso.</strong> Exemplos: <code>site:cityname.gov ACFR</code>, <code>site:countyname.gov annual financial report</code> ou <code>site:state.xx.us audited financial statements</code>.'
    ],
    verifyTitle: 'Como verificar se o documento é o certo',
    verifyIntro: 'Antes de usar os números, confirme:',
    verify: [
      ['Entidade governamental', 'É exatamente a cidade, o county, o estado, a authority, o district ou a component unit que você queria pesquisar?'],
      ['Exercício fiscal', 'Confira a data de encerramento do fiscal year, e não apenas a data em que o PDF foi enviado ao site.'],
      ['Tipo de relatório', 'ACFR, annual financial report, audited financial statements, PAFR, budget e single audit não são documentos equivalentes.'],
      ['Situação da auditoria', 'Procure o independent auditor’s report quando a análise depender de demonstrações auditadas.'],
      ['Data de publicação ou revisão', 'Uma versão revisada pode substituir um arquivo anterior.'],
      ['Primary government x component unit', 'Uma component unit juridicamente separada pode ter demonstrações próprias ou aparecer separadamente no relatório do governo principal.'],
      ['Fonte', 'Dê preferência ao domínio oficial do governo ou a um sistema reconhecido de divulgação, como o EMMA.']
    ],
    examplesTitle: 'Exemplos oficiais por nível de governo',
    examplesIntro: 'Os exemplos abaixo mostram tipos de páginas oficiais que o leitor pode encontrar. Eles não significam que todos os governos dos Estados Unidos usem a mesma estrutura.',
    levels: [
      ['Cidades', [
        ['City of Milwaukee, Office of the Comptroller', 'Página oficial com arquivo de Annual Comprehensive Financial Reports.', 'milwaukeeCity'],
        ['New York City Comptroller', 'Página oficial do ACFR, com explicação e relatórios atuais e históricos.', 'nyc']
      ]],
      ['Counties', [
        ['Marin County, Department of Finance', 'Página oficial com ACFR atual e arquivos históricos.', 'marinCounty'],
        ['Milwaukee County, Office of the Comptroller', 'Materiais do ACFR publicados pela função de comptroller/accounting do county.', 'milwaukeeCounty']
      ]],
      ['Estados', [
        ['Illinois Office of Comptroller', 'Página oficial do relatório anual sobre posição financeira e resultados das operações do Estado.', 'illinois'],
        ['North Carolina Office of the State Controller', 'Site oficial do Controller que publica e destaca o Annual Comprehensive Financial Report do Estado.', 'northCarolina']
      ]]
    ],
    comparisonTitle: 'ACFR x orçamento x PAFR',
    comparisonHeaders: ['Documento', 'Objetivo principal', 'Orientação temporal', 'Nível típico de detalhe'],
    comparisonRows: [
      ['Adopted budget', 'Autorizar ou planejar como recursos serão arrecadados e utilizados', 'Futuro', 'Detalhado por appropriations, departamentos, funds, programas ou estruturas locais'],
      ['ACFR / annual financial report', 'Relatar a posição financeira e a atividade do período encerrado', 'Passado', 'Elevado; pode incluir demonstrações auditadas, notas, MD&A, informações suplementares e estatísticas'],
      ['PAFR', 'Comunicar informações financeiras anuais selecionadas a um público amplo', 'Passado', 'Resumido e mais acessível']
    ],
    comparisonNote: 'Orçamento e relatório financeiro anual respondem a perguntas diferentes. O orçamento mostra o que o governo planejou ou autorizou; o relatório anual ajuda a mostrar o que ocorreu no período concluído e como esse resultado foi apresentado segundo a estrutura contábil aplicável.',
    emmaTitle: 'Como usar o EMMA',
    emmaParagraphs: [
      'O EMMA é especialmente útil quando o governo ou outro public issuer possui municipal securities e obrigações de continuing disclosure. O sistema pode oferecer official statements, annual financial information, operating data, audited financial statements quando apresentadas, event notices e voluntary disclosures.',
      'Use o EMMA como fonte de disclosure, e não como diretório universal de todos os relatórios anuais estaduais e locais. Nem todo relatório será mais fácil de encontrar ali, e o conjunto de documentos varia conforme o security e o continuing-disclosure undertaking. Sempre que possível, compare o arquivo do EMMA com a página oficial de finance ou investor relations do issuer.'
    ],
    sequenceTitle: 'Sequência prática de busca',
    sequenceIntro: 'Se você estiver começando do zero:',
    sequence: [
      'Procure <strong>ACFR</strong> no site oficial do governo.',
      'Se não encontrar, procure <strong>annual financial report</strong>.',
      'Depois, tente <strong>audited financial statements</strong>.',
      'Verifique as áreas Finance / Comptroller / Controller / Auditor / Accounting.',
      'Se houver dívida municipal relevante, pesquise o issuer no <strong>EMMA</strong>.',
      'Confirme entidade, exercício fiscal, tipo de relatório, situação da auditoria e fonte antes de usar os números.'
    ],
    referencesTitle: 'Referências primárias'
  }
});

const REFERENCES = Object.freeze([
  ['Government Finance Officers Association — ACFR terminology and reporting structure', 'gfoaChecklist'],
  ['Government Finance Officers Association — Popular Reporting of Financial Information', 'gfoaPopular'],
  ['Government Finance Officers Association — Periodic Disclosure and the ACFR', 'gfoaPeriodic'],
  ['Investor.gov — Sources of Municipal Securities Information', 'investorSources'],
  ['Investor.gov — Using EMMA', 'investorEmma'],
  ['Municipal Securities Rulemaking Board — About EMMA', 'emmaAbout'],
  ['City of Milwaukee Office of the Comptroller — Annual Comprehensive Financial Reports', 'milwaukeeCity'],
  ['New York City Comptroller — Annual Comprehensive Financial Reports', 'nyc'],
  ['Marin County Department of Finance — Annual Comprehensive Financial Reports', 'marinCounty'],
  ['Milwaukee County Office of the Comptroller — Accounting / ACFR', 'milwaukeeCounty'],
  ['Illinois Office of Comptroller — Annual Comprehensive Financial Report', 'illinois'],
  ['North Carolina Office of the State Controller — Annual Comprehensive Financial Report', 'northCarolina']
]);

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderTermList(items) {
  return items.map(([term, definition]) => `<p><strong>${escapeHtml(term)}.</strong> ${escapeHtml(definition)}</p>`).join('\n');
}

function renderOrdered(items) {
  return `<ol>${items.map((item) => `<li>${item}</li>`).join('')}</ol>`;
}

function renderChecklist(items) {
  return `<ul>${items.map(([label, text]) => `<li><strong>${escapeHtml(label)}:</strong> ${escapeHtml(text)}</li>`).join('')}</ul>`;
}

function renderExamples(levels) {
  return levels.map(([level, entries]) => `<h3>${escapeHtml(level)}</h3><ul>${entries.map(([name, description, sourceKey]) => `<li><a href="${escapeHtml(SOURCE_LINKS[sourceKey])}">${escapeHtml(name)}</a> — ${escapeHtml(description)}</li>`).join('')}</ul>`).join('\n');
}

function renderComparison(headers, rows) {
  return `<div class="resource-table-wrap"><table><thead><tr>${headers.map((header) => `<th scope="col">${escapeHtml(header)}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

function renderReferences(title) {
  return `<section class="resource-references"><h2>${escapeHtml(title)}</h2><ul>${REFERENCES.map(([label, sourceKey]) => `<li><a href="${escapeHtml(SOURCE_LINKS[sourceKey])}">${escapeHtml(label)}</a></li>`).join('')}</ul></section>`;
}

function renderAnnualReportsBody(locale = 'en') {
  const content = CONTENT[locale] || CONTENT.en;
  const bodyHtml = [
    `<p>${escapeHtml(content.intro)}</p>`,
    `<h2>${escapeHtml(content.reportNamesTitle)}</h2>`,
    `<p>${escapeHtml(content.reportNamesIntro)}</p>`,
    renderTermList(content.reportNames),
    `<h2>${escapeHtml(content.finderTitle)}</h2>`,
    renderOrdered(content.finder),
    `<h2>${escapeHtml(content.verifyTitle)}</h2>`,
    `<p>${escapeHtml(content.verifyIntro)}</p>`,
    renderChecklist(content.verify),
    `<h2>${escapeHtml(content.examplesTitle)}</h2>`,
    `<p>${escapeHtml(content.examplesIntro)}</p>`,
    renderExamples(content.levels),
    `<h2>${escapeHtml(content.comparisonTitle)}</h2>`,
    renderComparison(content.comparisonHeaders, content.comparisonRows),
    `<p>${escapeHtml(content.comparisonNote)}</p>`,
    `<h2>${escapeHtml(content.emmaTitle)}</h2>`,
    ...content.emmaParagraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`),
    `<p><a href="${escapeHtml(SOURCE_LINKS.emmaPortal)}">${locale === 'pt-BR' ? 'Abrir o EMMA' : 'Open EMMA'}</a></p>`,
    `<h2>${escapeHtml(content.sequenceTitle)}</h2>`,
    `<p>${escapeHtml(content.sequenceIntro)}</p>`,
    renderOrdered(content.sequence)
  ].join('\n');

  return {
    bodyHtml,
    referencesHtml: renderReferences(content.referencesTitle)
  };
}

module.exports = {
  SOURCE_LINKS,
  CONTENT,
  REFERENCES,
  renderAnnualReportsBody
};
