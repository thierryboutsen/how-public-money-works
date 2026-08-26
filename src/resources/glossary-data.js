'use strict';

const SOURCES = Object.freeze({
  census: 'https://www.census.gov/programs-surveys/gov-finances/about/glossary.html',
  censusFinance: 'https://www.census.gov/topics/public-sector/government-finances/about/glossary.html',
  gasb34: 'https://storage.gasb.org/gasbs34.pdf',
  gasb54: 'https://gasb.org/page/getarticle?uid=gasb_NewsRelease03-11-09Body_0228221200',
  gasbAcfr: 'https://storage.gasb.org/GASB_ED-The_Annual_Comprehensive_Financial_Report.pdf',
  gfoaBudget: 'https://www.gfoa.org/planning-and-budgeting-overview',
  gfoaBudgeting: 'https://www.gfoa.org/best-practices/budgeting',
  gfoaFundBalance: 'https://www.gfoa.org/materials/fund-balance-guidelines-for-the-general-fund',
  gfoaCapital: 'https://www.gfoa.org/best-practices/capital-planning-and-infrastructure',
  gfoaCapitalBudget: 'https://www.gfoa.org/materials/capital-budget-presentation',
  gfoaDebt: 'https://www.gfoa.org/materials/debt-management-policy',
  gaoAudit: 'https://www.gao.gov/assets/a76972.html',
  gaoGreenBook: 'https://www.gao.gov/greenbook',
  gaoBudgetGlossary: 'https://www.gao.gov/assets/a76916.html',
  massBalance: 'https://budget.digital.mass.gov/bb/h1/fy12h1/prnt_12/brec_12/ga_12/pfinexp.htm',
  bostonBudgetGlossary: 'https://www.boston.gov/departments/budget/glossary-budget-terms',
  idahoFallsBudgetGlossary: 'https://www.idahofallsidaho.gov/DocumentCenter/View/17879/DRAFT-Adopted-Budget-8-20-24',
  marylandBudgetGlossary: 'https://dbm.maryland.gov/budget/Pages/glossary.aspx',
  caEBudgetGlossary: 'https://ebudget.ca.gov/reference/GlossaryOfTerms.pdf',
  rolesvilleBudgetGlossary: 'https://www.rolesvillenc.gov/sites/default/files/uploads/financial-documents/fy24-25-proposed-budget-web.pdf',
  concordBudgetGlossary: 'https://concordma.gov/DocumentCenter/View/47284/Glossary-of-Terms-Commonly-Used-in-Municipal-Finance',
  seminoleGlossary: 'https://www.seminolecountyfl.gov/departments-services/resource-management/resource-management-administration/glossary-of-terms',
  saoWaBudgetAmendments: 'https://sao.wa.gov/bars-annual-filing/bars-gaap-manual/budgeting/budget-compliance/budget-adoption-and-amendments',
  msrbRepayment: 'https://www.msrb.org/Sources-Repayment',
  secMunicipalBonds: 'https://www.sec.gov/munied',
  massBudgetGlossary: 'https://budget.digital.mass.gov/bb/h1/fy14h1/lnk_14/hglossary.htm',
  massBudgetGlossaryUnrestricted: 'https://budget.digital.mass.gov/bb/h1/fy10h1/prnt10/lnk10/pglossary.htm',
  tennesseeTax: 'https://comptroller.tn.gov/office-functions/pa/property-taxes/tennessee-property-assessment-glossary.html',
  floridaTax: 'https://www.flsenate.gov/Laws/Statutes/2026/192.001'
});

const articleBudget = ['/what-is-a-city-budget-and-why-should-you-care'];
const articleTaxes = ['/where-do-your-local-taxes-actually-go', '/pt-br/para-onde-vao-os-seus-impostos-locais'];

const RAW_ENTRIES = [
  {
    category: 'Budgeting', sourceRefs: ['bostonBudgetGlossary', 'gfoaBudget', 'gfoaBudgeting'],
    en: { term: 'Appropriation', definition: 'An appropriation is legal authority granted by a governing body to spend public money for a stated purpose and period. It is an authorization to spend, not proof that the money has already been spent.', why: 'It helps readers distinguish permission to spend from an actual payment.', note: 'The legal form, level of detail, and expiration rules vary by state and local charter.', related: ['Budget Adoption', 'Expenditure'], content: articleBudget },
    pt: { term: 'Appropriation (autorização de despesa)', definition: 'Appropriation é a autorização legal dada pelo órgão governante para gastar dinheiro público em uma finalidade e período definidos. É uma autorização para gastar, não prova de que o dinheiro já foi gasto.', why: 'Ajuda a distinguir autorização orçamentária de pagamento efetivo.', note: 'A forma legal, o nível de detalhamento e as regras de validade variam por estado e governo local.', related: ['Budget Adoption', 'Expenditure'], content: articleBudget }
  },
  {
    category: 'Revenues & Taxes', sourceRefs: ['tennesseeTax', 'census'],
    en: { term: 'Assessed Value', definition: 'Assessed value is the value assigned to property for applying a property-tax levy or rate. It may differ from market value because state law can use assessment ratios, classifications, exemptions, or other adjustments.', why: 'It is one of the inputs used to understand a property-tax bill.', note: 'Assessment systems and ratios are set by state and local law; do not assume assessed value equals market value.', related: ['Property Tax', 'Tax Base', 'Tax Rate'], content: articleTaxes },
    pt: { term: 'Assessed Value (valor avaliado para fins tributários)', definition: 'Assessed value é o valor atribuído ao imóvel para fins tributários e usado na aplicação de uma cobrança ou taxa de property tax. Pode diferir do valor de mercado porque a lei estadual pode usar percentuais de avaliação, classificações, isenções ou outros ajustes.', why: 'É um dos elementos usados para entender uma conta de property tax.', note: 'Os sistemas e percentuais de avaliação dependem da lei estadual e local; valor avaliado para fins tributários não deve ser tratado como sinônimo automático de valor de mercado ou taxable value.', related: ['Property Tax', 'Tax Base', 'Tax Rate'], content: articleTaxes }
  },
  {
    category: 'Oversight & Transparency', sourceRefs: ['gaoAudit'],
    en: { term: 'Audit', definition: 'An audit is an independent, objective examination performed for a defined purpose, scope, and set of criteria. Government audits may address financial statements, compliance, operations, or program performance.', why: 'The audit type and scope determine what conclusions a report can support.', note: 'Requirements and terminology differ across federal, state, local, and specialized audit settings.', related: ['Internal Control', 'Performance Audit', 'Transparency'], content: ['/what-is-a-local-government-audit'] },
    pt: { term: 'Audit (auditoria)', definition: 'Audit é um exame independente e objetivo realizado para uma finalidade, escopo e critérios definidos. Auditorias governamentais podem tratar de demonstrações financeiras, conformidade, operações ou desempenho de programas.', why: 'O tipo e o escopo da auditoria determinam quais conclusões o relatório pode sustentar.', note: 'Requisitos e terminologia variam entre contextos federal, estadual, local e especializado.', related: ['Internal Control', 'Performance Audit', 'Transparency'], content: ['/pt-br/o-que-e-uma-auditoria-de-governo-local'] }
  },
  {
    category: 'Financial Reporting', sourceRefs: ['gasb34', 'gasbAcfr'],
    en: { term: 'Annual Financial Report', definition: 'An annual financial report presents a government’s financial activity and position for a completed reporting period. It answers what was reported after the period ended, not simply what a budget authorized beforehand.', why: 'It prevents readers from treating a plan and a report of results as the same document.', note: 'The format, name, filing deadline, and required sections vary by government and applicable standards.', related: ['Annual Comprehensive Financial Report (ACFR)', 'Operating Budget'], content: ['/annual-financial-report-local-government'] },
    pt: { term: 'Annual Financial Report (relatório financeiro anual)', definition: 'Annual Financial Report apresenta a atividade e a posição financeira de um governo em um período já encerrado. Responde ao que foi reportado depois do período, e não apenas ao que um orçamento autorizou antes dele.', why: 'Evita tratar um plano e um relatório de resultados como se fossem o mesmo documento.', note: 'Formato, nome, prazo e seções obrigatórias variam conforme o governo e as normas aplicáveis.', related: ['Annual Comprehensive Financial Report (ACFR)', 'Operating Budget'], content: ['/pt-br/relatorio-financeiro-anual-governo-local'] }
  },
  {
    category: 'Financial Reporting', sourceRefs: ['gasbAcfr'],
    en: { term: 'Annual Comprehensive Financial Report (ACFR)', definition: 'An Annual Comprehensive Financial Report, or ACFR, is a government’s comprehensive annual financial reporting package, typically including introductory information, management’s discussion and analysis, basic financial statements, and other required or supplementary information under the applicable reporting framework. The name ACFR replaced Comprehensive Annual Financial Report in GASB terminology; governments do not all publish identical packages or face identical requirements.', why: 'The acronym ACFR helps readers find the government’s broader annual financial reporting package.', note: 'The contents, format, and applicable reporting requirements depend on the government and framework; there is no single uniform legal package for every government.', related: ['Annual Financial Report', 'Transparency'], content: ['/annual-financial-report-local-government'] },
    pt: { term: 'Annual Comprehensive Financial Report (ACFR)', definition: 'Annual Comprehensive Financial Report, ou ACFR, é o conjunto abrangente de informações financeiras anuais de um governo, geralmente incluindo informações introdutórias, análise e discussão da administração, demonstrações financeiras básicas e outras informações exigidas ou suplementares conforme a estrutura de reporte aplicável. O nome ACFR substituiu Comprehensive Annual Financial Report na terminologia do GASB; os governos não publicam conjuntos idênticos nem estão sujeitos a requisitos idênticos.', why: 'A sigla ACFR ajuda o leitor a localizar o conjunto mais amplo de informações financeiras anuais.', note: 'Conteúdo, formato e requisitos aplicáveis dependem do governo e da estrutura de reporte; não existe um pacote legal único e uniforme para todos os governos.', related: ['Annual Financial Report', 'Transparency'], content: ['/pt-br/relatorio-financeiro-anual-governo-local'] }
  },
  {
    category: 'Budgeting', sourceRefs: ['gaoBudgetGlossary', 'massBalance', 'gfoaBudgeting', 'gfoaBudget'],
    en: { term: 'Balanced Budget', definition: 'A budgetary or legal balance means that a proposed or adopted budget meets the balance rule that applies to the government. A structurally balanced budget is a stronger planning concept: recurring revenues support recurring expenditures over time, without relying on one-time fixes.', why: 'A budget can satisfy a legal balance rule and still depend on temporary resources.', note: 'The legal definition, budget basis, and meaning of structural balance differ across jurisdictions.', related: ['Operating Budget', 'Revenue', 'Fund Balance'], content: articleBudget },
    pt: { term: 'Balanced Budget (orçamento equilibrado)', definition: 'Equilíbrio orçamentário ou legal significa que a proposta ou o orçamento adotado atende à regra de equilíbrio aplicável ao governo. Um orçamento estruturalmente equilibrado é um conceito de planejamento mais forte: receitas recorrentes sustentam despesas recorrentes ao longo do tempo, sem depender de soluções pontuais.', why: 'Um orçamento pode atender à regra legal de equilíbrio e ainda depender de recursos temporários.', note: 'A definição legal, a base orçamentária e o significado de equilíbrio estrutural variam entre jurisdições.', related: ['Operating Budget', 'Revenue', 'Fund Balance'], content: articleBudget }
  },
  {
    category: 'Debt & Capital', sourceRefs: ['seminoleGlossary', 'gfoaDebt'],
    en: { term: 'Bond', definition: 'A bond is a debt instrument through which an issuer borrows money from investors and promises repayment under stated terms. The terms normally describe principal, interest, maturity, security, and permitted use of proceeds.', why: 'A bond creates a long-term obligation that future budgets must recognize.', note: 'Authorization, tax treatment, disclosure, and repayment rules depend on state law and the bond documents.', related: ['Debt', 'Debt Service', 'General Obligation Bond', 'Revenue Bond'], content: ['/how-local-governments-borrow-money'] },
    pt: { term: 'Bond (título de dívida)', definition: 'Bond é um instrumento de dívida pelo qual um emissor toma dinheiro de investidores e promete pagar conforme condições definidas. Essas condições normalmente tratam de principal, juros, vencimento, garantia e uso permitido dos recursos.', why: 'Um bond cria uma obrigação de longo prazo que os orçamentos futuros precisam reconhecer.', note: 'Autorização, divulgação e regras de pagamento dependem da lei estadual e dos documentos da emissão.', related: ['Debt', 'Debt Service', 'General Obligation Bond', 'Revenue Bond'], content: ['/pt-br/como-governos-locais-tomam-dinheiro-emprestado'] }
  },
  {
    category: 'Budgeting', sourceRefs: ['saoWaBudgetAmendments', 'marylandBudgetGlossary', 'gfoaBudgeting'],
    en: { term: 'Budget Amendment', definition: 'A budget amendment is a formal change to an adopted budget. It may change an appropriation, revenue estimate, spending purpose, fund balance use, or another authorized budget element.', why: 'Amendments show that the adopted plan changed and should be read with its approval record.', note: 'Some amendments require legislative action or public notice; others may be allowed administratively.', related: ['Appropriation', 'Budget Adoption', 'Expenditure'], content: ['/local-budget-changes-midyear'] },
    pt: { term: 'Budget Amendment (alteração orçamentária)', definition: 'Budget amendment é uma mudança formal em um orçamento adotado. Pode alterar uma autorização de despesa, estimativa de receita, finalidade do gasto, uso de fund balance ou outro elemento autorizado.', why: 'Alterações mostram que o plano adotado mudou e devem ser lidas junto ao registro de aprovação.', note: 'Algumas exigem ação legislativa ou aviso público; outras podem ser permitidas administrativamente.', related: ['Appropriation', 'Budget Adoption', 'Expenditure'], content: ['/pt-br/mudancas-no-orcamento-local-durante-o-ano'] }
  },
  {
    category: 'Budgeting', sourceRefs: ['idahoFallsBudgetGlossary', 'gfoaBudget'],
    en: { term: 'Budget Adoption', definition: 'Budget adoption is the formal approval of a government’s budget by the body authorized to approve it. Adoption turns a proposed plan into the budget that governs spending and financing for the period, subject to local rules.', why: 'The adopted budget is the authoritative starting point for comparing plan and execution.', note: 'The approving body, hearing requirements, timing, and legal effect vary by jurisdiction.', related: ['Budget Hearing', 'Appropriation', 'Operating Budget'], content: articleBudget },
    pt: { term: 'Budget Adoption (adoção do orçamento)', definition: 'Budget adoption é a aprovação formal do orçamento de um governo pelo órgão autorizado a aprová-lo. A adoção transforma uma proposta no orçamento que orienta gastos e financiamento do período, sujeito às regras locais.', why: 'O orçamento adotado é o ponto de partida oficial para comparar plano e execução.', note: 'Órgão aprovador, audiências, prazos e efeito legal variam por jurisdição.', related: ['Budget Hearing', 'Appropriation', 'Operating Budget'], content: articleBudget }
  },
  {
    category: 'Budgeting', sourceRefs: ['idahoFallsBudgetGlossary', 'gfoaBudget'],
    en: { term: 'Budget Hearing', definition: 'A budget hearing is a public meeting or proceeding in which residents may receive information about a proposed budget and, where allowed, provide comments before or during adoption.', why: 'It is one point at which the public can examine proposed priorities before they become final.', note: 'Notice, timing, participation rights, and whether a hearing is required depend on local and state law.', related: ['Budget Adoption', 'Operating Budget'], content: ['/what-is-a-public-budget-hearing'] },
    pt: { term: 'Budget Hearing (audiência sobre o orçamento)', definition: 'Budget hearing é uma reunião ou procedimento público em que moradores podem receber informações sobre uma proposta orçamentária e, quando permitido, comentar antes ou durante sua adoção.', why: 'É um momento em que o público pode examinar prioridades propostas antes de elas se tornarem definitivas.', note: 'Aviso, prazo, participação e obrigatoriedade dependem da lei estadual e local.', related: ['Budget Adoption', 'Operating Budget'], content: ['/pt-br/o-que-e-uma-audiencia-publica-sobre-orcamento'] }
  },
  {
    category: 'Debt & Capital', sourceRefs: ['idahoFallsBudgetGlossary', 'gfoaCapitalBudget'],
    en: { term: 'Capital Budget', definition: 'A capital budget is the part of a budget that plans and authorizes major long-lived assets, facilities, infrastructure, or projects. It is often connected to a multi-year capital improvement plan.', why: 'Capital decisions create both upfront costs and future operating responsibilities.', note: 'Thresholds for capital items and the separation between operating and capital budgets vary locally.', related: ['Capital Expenditure', 'Capital Improvement Plan (CIP)', 'Debt'], content: ['/operating-budget-vs-capital-budget'] },
    pt: { term: 'Capital Budget (orçamento de capital)', definition: 'Capital budget é a parte do orçamento que planeja e autoriza ativos, instalações, infraestrutura ou projetos relevantes e duradouros. Frequentemente está ligado a um plano plurianual de melhorias de capital.', why: 'Decisões de capital criam custos iniciais e responsabilidades operacionais futuras.', note: 'Limites para classificar itens de capital e separação entre orçamento operacional e de capital variam localmente.', related: ['Capital Expenditure', 'Capital Improvement Plan (CIP)', 'Debt'], content: ['/pt-br/orcamento-operacional-vs-orcamento-de-capital'] }
  },
  {
    category: 'Debt & Capital', sourceRefs: ['idahoFallsBudgetGlossary', 'gfoaCapital', 'gfoaCapitalBudget'],
    en: { term: 'Capital Improvement Plan (CIP)', definition: 'A Capital Improvement Plan is a multi-year plan for identifying, prioritizing, scheduling, and financing major public capital projects. It can connect project needs to the capital budget and long-term financial planning.', why: 'A CIP shows how a project fits into a sequence of needs rather than presenting it as an isolated purchase.', note: 'Names, time horizons, approval status, and required detail differ by government.', related: ['Capital Budget', 'Capital Expenditure', 'Debt'], content: ['/capital-improvement-plan-explained'] },
    pt: { term: 'Capital Improvement Plan (plano de melhorias de capital)', definition: 'Capital Improvement Plan é um plano plurianual para identificar, priorizar, programar e financiar grandes projetos públicos de capital. Pode conectar necessidades de projetos ao orçamento de capital e ao planejamento financeiro de longo prazo.', why: 'O CIP mostra como um projeto se encaixa em uma sequência de necessidades, em vez de tratá-lo como compra isolada.', note: 'Nome, horizonte, aprovação e nível de detalhe variam conforme o governo.', related: ['Capital Budget', 'Capital Expenditure', 'Debt'], content: ['/pt-br/plano-de-melhorias-de-capital-explicado'] }
  },
  {
    category: 'Debt & Capital', sourceRefs: ['idahoFallsBudgetGlossary', 'gfoaCapitalBudget'],
    en: { term: 'Capital Expenditure', definition: 'A capital expenditure is spending to acquire, construct, improve, or extend the useful life of a long-lived asset. A capital purchase is not automatically the same as a complete capital project or a particular funding source.', why: 'It helps readers separate investment in assets from routine operating costs.', note: 'Capitalization thresholds and classifications are set by the government’s accounting and budget policies.', related: ['Capital Budget', 'Capital Improvement Plan (CIP)', 'Expenditure'], content: ['/operating-budget-vs-capital-budget'] },
    pt: { term: 'Capital Expenditure (despesa de capital)', definition: 'Capital expenditure é o gasto para adquirir, construir, melhorar ou prolongar a vida útil de um ativo duradouro. Uma compra de capital não é automaticamente o mesmo que um projeto completo ou uma fonte específica de financiamento.', why: 'Ajuda a separar investimento em ativos de custos operacionais rotineiros.', note: 'Limites e classificações de capital são definidos pelas políticas contábeis e orçamentárias do governo.', related: ['Capital Budget', 'Capital Improvement Plan (CIP)', 'Expenditure'], content: ['/pt-br/orcamento-operacional-vs-orcamento-de-capital'] }
  },
  {
    category: 'Debt & Capital', sourceRefs: ['censusFinance', 'gfoaDebt'],
    en: { term: 'Debt', definition: 'Debt is an obligation to repay borrowed money or another financing commitment under stated terms. Government debt can support capital projects, but it also creates future principal, interest, disclosure, and compliance responsibilities.', why: 'Debt changes future budget capacity even when the borrowed money arrives today.', note: 'Legal limits, permitted uses, and repayment structures differ among governments and debt instruments.', related: ['Bond', 'Debt Service', 'General Obligation Bond', 'Revenue Bond'], content: ['/how-local-governments-borrow-money'] },
    pt: { term: 'Debt (dívida)', definition: 'Debt é uma obrigação de devolver dinheiro emprestado ou cumprir outro compromisso de financiamento conforme condições definidas. A dívida governamental pode apoiar projetos de capital, mas cria responsabilidades futuras de principal, juros, divulgação e conformidade.', why: 'A dívida altera a capacidade orçamentária futura mesmo quando o dinheiro emprestado chega hoje.', note: 'Limites legais, usos permitidos e formas de pagamento variam entre governos e instrumentos.', related: ['Bond', 'Debt Service', 'General Obligation Bond', 'Revenue Bond'], content: ['/pt-br/como-governos-locais-tomam-dinheiro-emprestado'] }
  },
  {
    category: 'Debt & Capital', sourceRefs: ['rolesvilleBudgetGlossary', 'gfoaDebt'],
    en: { term: 'Debt Service', definition: 'Debt service is the scheduled payment of principal and interest on debt. A government may also need to budget related fees, reserves, or coverage requirements depending on the financing documents.', why: 'Debt service is a recurring claim on future resources.', note: 'Payment schedules, coverage tests, and accounting treatment depend on the instrument and its documents.', related: ['Debt', 'Bond', 'General Obligation Bond'], content: ['/how-local-governments-borrow-money'] },
    pt: { term: 'Debt Service (serviço da dívida)', definition: 'Debt service é o pagamento programado de principal e juros de uma dívida. Dependendo dos documentos do financiamento, o governo também pode precisar orçar taxas, reservas ou requisitos de cobertura.', why: 'O serviço da dívida é uma obrigação recorrente sobre recursos futuros.', note: 'Cronograma, testes de cobertura e tratamento contábil dependem do instrumento e de seus documentos.', related: ['Debt', 'Bond', 'General Obligation Bond'], content: ['/pt-br/como-governos-locais-tomam-dinheiro-emprestado'] }
  },
  {
    category: 'Funds & Accounting', sourceRefs: ['bostonBudgetGlossary', 'marylandBudgetGlossary'],
    en: { term: 'Encumbrance', definition: 'An encumbrance is a commitment, such as a purchase order or contract, that reserves part of an appropriation for a future obligation. It is not necessarily a cash payment or a final expenditure.', why: 'Encumbrances can explain why an appropriation is not freely available even before payment.', note: 'Whether and when encumbrances are recognized differs between budgetary systems and GAAP financial reporting.', related: ['Appropriation', 'Expenditure', 'Fund Balance'], content: [] },
    pt: { term: 'Encumbrance (compromisso orçamentário)', definition: 'Encumbrance é um compromisso, como uma ordem de compra ou contrato, que reserva parte de uma autorização para uma obrigação futura. Não é necessariamente pagamento em dinheiro nem despesa final.', why: 'Encumbrances podem explicar por que uma autorização não está livre mesmo antes do pagamento.', note: 'Reconhecimento e momento variam entre sistemas orçamentários e relatórios em GAAP.', related: ['Appropriation', 'Expenditure', 'Fund Balance'], content: [] }
  },
  {
    category: 'Funds & Accounting', sourceRefs: ['caEBudgetGlossary', 'gasb34'],
    en: { term: 'Enterprise Fund', definition: 'An enterprise fund is a proprietary fund used for a government activity that provides goods or services, often charging users and operating in a business-like way. It focuses on economic resources, revenues, expenses, and cash flows.', why: 'The fund type signals that readers should examine costs, rates, and financial position differently from a general governmental activity.', note: 'The decision to use an enterprise fund depends on the government’s facts, policies, and applicable standards.', related: ['Fund', 'Operating Revenue', 'User Fee'], content: [] },
    pt: { term: 'Enterprise Fund (fundo empresarial)', definition: 'Enterprise fund é um proprietary fund usado para uma atividade governamental que oferece bens ou serviços, frequentemente cobrando usuários e operando de modo semelhante a uma empresa. Ele se concentra em recursos econômicos, receitas, despesas e fluxos de caixa.', why: 'O tipo de fundo indica que custos, tarifas e posição financeira devem ser analisados de forma diferente de uma atividade governamental geral.', note: 'O uso de enterprise fund depende dos fatos, políticas e normas aplicáveis ao governo.', related: ['Fund', 'Operating Revenue', 'User Fee'], content: [] }
  },
  {
    category: 'Funds & Accounting', sourceRefs: ['marylandBudgetGlossary', 'censusFinance', 'gasb34'],
    en: { term: 'Expenditure', definition: 'An expenditure is an outflow or use of financial resources for a government purpose, such as paying for services, supplies, benefits, or capital items. In governmental funds, the term is used differently from expense in proprietary accounting.', why: 'The word helps readers identify which accounting model a report is using.', note: 'Recognition timing and classification depend on the fund type and accounting or budget basis.', related: ['Appropriation', 'Capital Expenditure', 'Operating Budget'], content: articleBudget },
    pt: { term: 'Expenditure (despesa em governmental funds)', definition: 'Expenditure é uma saída ou uso de recursos financeiros para uma finalidade governamental, como pagar serviços, materiais, benefícios ou itens de capital. Em governmental funds, o termo não é exatamente igual a expense na contabilidade proprietary.', why: 'A palavra ajuda a identificar qual modelo contábil o relatório está usando.', note: 'Momento de reconhecimento e classificação dependem do tipo de fundo e da base contábil ou orçamentária.', related: ['Appropriation', 'Capital Expenditure', 'Operating Budget'], content: articleBudget }
  },
  {
    category: 'Budgeting', sourceRefs: ['censusFinance', 'gfoaBudget'],
    en: { term: 'Fiscal Year', definition: 'A fiscal year is the twelve-month period a government uses for budgeting, accounting, and reporting. It does not have to match the calendar year.', why: 'Comparing documents from different fiscal years can otherwise create misleading conclusions.', note: 'Start and end dates are set by law, policy, or the government’s governing documents.', related: ['Annual Financial Report', 'Operating Budget', 'Budget Adoption'], content: articleBudget },
    pt: { term: 'Fiscal Year (ano fiscal)', definition: 'Fiscal year é o período de doze meses que um governo usa para orçamento, contabilidade e relatórios. Ele não precisa coincidir com o ano-calendário.', why: 'Comparar documentos de anos fiscais diferentes pode levar a conclusões enganosas.', note: 'As datas de início e fim são definidas por lei, política ou documentos de governo.', related: ['Annual Financial Report', 'Operating Budget', 'Budget Adoption'], content: articleBudget }
  },
  {
    category: 'Funds & Accounting', sourceRefs: ['gasb34', 'gasb54'],
    en: { term: 'Fund', definition: 'A fund is a fiscal and accounting entity with a self-balancing set of accounts used to track resources, obligations, and activity for a particular purpose or legal requirement. It is not automatically a separate bank account.', why: 'Fund structure helps readers see restrictions, responsibilities, and reporting boundaries.', note: 'Fund names and required types vary, and one government’s fund structure should not be assumed universal.', related: ['Fund Balance', 'General Fund', 'Governmental Fund', 'Special Revenue Fund'], content: ['/where-do-your-local-taxes-actually-go'] },
    pt: { term: 'Fund (fundo contábil)', definition: 'Fund é uma entidade fiscal e contábil com conjunto de contas próprio, usado para acompanhar recursos, obrigações e atividades de uma finalidade ou exigência legal. Não é automaticamente uma conta bancária separada.', why: 'A estrutura de fundos ajuda a enxergar restrições, responsabilidades e limites de reporte.', note: 'Nomes e tipos obrigatórios variam; a estrutura de um governo não deve ser tratada como universal.', related: ['Fund Balance', 'General Fund', 'Governmental Fund', 'Special Revenue Fund'], content: ['/pt-br/para-onde-vao-os-seus-impostos-locais'] }
  },
  {
    category: 'Funds & Accounting', sourceRefs: ['gasb54', 'gfoaFundBalance'],
    en: { term: 'Fund Balance', definition: 'Fund balance is the reported difference between assets and liabilities of a governmental fund, presented under applicable financial-reporting or budgetary rules. It describes a fund’s reported resources after liabilities; it is not the same thing as cash available to spend.', why: 'The classification and availability of fund balance matter more than the headline number alone.', note: 'GAAP fund balance and budgetary fund balance may differ because recognition and timing rules differ; neither headline balance alone proves spendable cash.', related: ['General Fund', 'Restricted Revenue', 'Unrestricted Revenue', 'Encumbrance'], content: ['/where-do-your-local-taxes-actually-go', '/what-does-fund-balance-mean'] },
    pt: { term: 'Fund Balance (saldo de fundo)', definition: 'Fund balance é a diferença reportada entre ativos e passivos de um governmental fund, apresentada conforme as regras de reporte financeiro ou orçamento aplicáveis. Descreve os recursos reportados do fundo depois dos passivos; não é o mesmo que caixa disponível para gastar.', why: 'A classificação e a disponibilidade importam mais do que o número principal isolado.', note: 'Fund balance em GAAP e fund balance orçamentário podem divergir por causa de regras diferentes de reconhecimento e timing; o saldo isolado não prova a existência de caixa disponível.', related: ['General Fund', 'Restricted Revenue', 'Unrestricted Revenue', 'Encumbrance'], content: ['/pt-br/para-onde-vao-os-seus-impostos-locais', '/pt-br/o-que-significa-fund-balance'] }
  },
  {
    category: 'Funds & Accounting', sourceRefs: ['gasb54'],
    en: { term: 'General Fund', definition: 'The general fund is the primary governmental fund used to account for and report many general government activities and resources that are not required to be reported in another fund. It is not necessarily the place where every unrestricted dollar sits.', why: 'The general fund is often central to operating-budget discussions, but its balance is not automatically spendable.', note: 'The legal role and contents of a general fund depend on the government and applicable standards.', related: ['Fund', 'Fund Balance', 'Governmental Fund'], content: ['/general-fund-vs-special-revenue-funds'] },
    pt: { term: 'General Fund (fundo geral)', definition: 'General fund é o principal governmental fund usado para contabilizar e reportar muitas atividades e recursos gerais do governo que não precisam ser apresentados em outro fundo. Isso não significa que todo dólar sem restrição esteja nesse fundo.', why: 'O general fund costuma ser central no orçamento operacional, mas seu saldo não é automaticamente disponível para qualquer gasto.', note: 'Papel legal e conteúdo dependem do governo e das normas aplicáveis.', related: ['Fund', 'Fund Balance', 'Governmental Fund'], content: ['/pt-br/fundo-geral-vs-fundos-de-receita-especial'] }
  },
  {
    category: 'Debt & Capital', sourceRefs: ['msrbRepayment', 'secMunicipalBonds'],
    en: { term: 'General Obligation Bond', definition: 'A general obligation bond is a municipal debt obligation typically supported by the issuer’s pledge of full faith, credit, and taxing power, subject to the pledge and legal terms of the issue. The precise source and priority of payment can vary under state or local law.', why: 'The security pledge helps readers understand which resources may support repayment.', note: 'Pledge language, voter approval, tax limits, and legal treatment vary by jurisdiction.', related: ['Bond', 'Debt Service', 'Property Tax'], content: ['/how-local-governments-borrow-money'] },
    pt: { term: 'General Obligation Bond (título de obrigação geral)', definition: 'General obligation bond é um título de dívida municipal normalmente apoiado pelo compromisso de full faith and credit e pelo poder tributário do emissor, conforme a garantia e os termos legais da emissão. A fonte e a prioridade exatas de pagamento podem variar segundo a lei estadual ou local.', why: 'A garantia ajuda a entender quais recursos podem sustentar o pagamento.', note: 'Texto da garantia, aprovação popular, limites tributários e tratamento legal variam por jurisdição.', related: ['Bond', 'Debt Service', 'Property Tax'], content: ['/pt-br/como-governos-locais-tomam-dinheiro-emprestado'] }
  },
  {
    category: 'Funds & Accounting', sourceRefs: ['gasb34'],
    en: { term: 'Governmental Fund', definition: 'A governmental fund is a fund type used to account for the government’s general governmental activities and resources, with a focus on current financial resources and expenditures. General, special revenue, debt service, and capital projects funds are common governmental fund types.', why: 'It signals that readers should look for fund balance and expenditures rather than proprietary-style net income.', note: 'Fund classification follows applicable standards and the government’s activities, not just the fund’s name.', related: ['Fund', 'General Fund', 'Special Revenue Fund', 'Fund Balance'], content: ['/general-fund-vs-special-revenue-funds'] },
    pt: { term: 'Governmental Fund (fundo governamental)', definition: 'Governmental fund é um tipo de fundo usado para contabilizar atividades e recursos governamentais gerais, com foco em recursos financeiros correntes e expenditures. General, special revenue, debt service e capital projects funds são tipos comuns.', why: 'Indica que o leitor deve procurar fund balance e expenditures, e não lucro líquido no modelo proprietary.', note: 'A classificação segue normas aplicáveis e as atividades do governo, não apenas o nome do fundo.', related: ['Fund', 'General Fund', 'Special Revenue Fund', 'Fund Balance'], content: ['/pt-br/fundo-geral-vs-fundos-de-receita-especial'] }
  },
  {
    category: 'Revenues & Taxes', sourceRefs: ['censusFinance'],
    en: { term: 'Grant', definition: 'A grant is funding provided by one government or organization to another government or recipient for an approved purpose, often subject to conditions, reporting, or matching requirements. A grant is not automatically unrestricted revenue.', why: 'The grant agreement may determine what the recipient can spend and what it must report.', note: 'Eligibility, allowable costs, matching rules, and clawback provisions vary by program and grantor.', related: ['Intergovernmental Revenue', 'Restricted Revenue', 'Revenue'], content: ['/state-federal-funding-local-governments'] },
    pt: { term: 'Grant (subvenção ou repasse condicionado)', definition: 'Grant é um financiamento fornecido por governo ou organização a outro governo ou beneficiário para uma finalidade aprovada, frequentemente com condições, relatórios ou contrapartida. Um grant não é automaticamente receita sem restrição.', why: 'O acordo do grant pode determinar o que pode ser gasto e o que deve ser reportado.', note: 'Elegibilidade, custos permitidos, contrapartidas e devolução variam por programa e concedente.', related: ['Intergovernmental Revenue', 'Restricted Revenue', 'Revenue'], content: ['/pt-br/como-governos-locais-recebem-recursos-estaduais-e-federais'] }
  },
  {
    category: 'Revenues & Taxes', sourceRefs: ['censusFinance'],
    en: { term: 'Intergovernmental Revenue', definition: 'Intergovernmental revenue is financial assistance or shared revenue received from another government, including grants, shared taxes, reimbursements, and certain payments in lieu of taxes. It is distinct from a sale of goods or services to another government.', why: 'The source of money can be as important as the amount when restrictions and accountability are analyzed.', note: 'Classification and eligible uses depend on the transaction and applicable reporting system.', related: ['Grant', 'Restricted Revenue', 'Revenue'], content: ['/state-federal-funding-local-governments'] },
    pt: { term: 'Intergovernmental Revenue (receita intergovernamental)', definition: 'Intergovernmental revenue é assistência financeira ou receita compartilhada recebida de outro governo, incluindo grants, tributos compartilhados, reembolsos e certos pagamentos em substituição a tributos. É diferente da venda de bens ou serviços a outro governo.', why: 'A origem do dinheiro pode ser tão importante quanto o valor ao analisar restrições e prestação de contas.', note: 'Classificação e usos permitidos dependem da transação e do sistema de reporte aplicável.', related: ['Grant', 'Restricted Revenue', 'Revenue'], content: ['/pt-br/como-governos-locais-recebem-recursos-estaduais-e-federais'] }
  },
  {
    category: 'Oversight & Transparency', sourceRefs: ['gaoGreenBook'],
    en: { term: 'Internal Control', definition: 'Internal control is the set of ongoing processes used by management to provide reasonable assurance about effective operations, reliable reporting, compliance, and safeguarding of resources. It is not a guarantee that every error or fraud will be prevented.', why: 'Controls explain how an organization reduces risk in everyday decisions and transactions.', note: 'Frameworks and requirements differ; GAO’s Green Book is a federal framework that may also inform nonfederal organizations.', related: ['Audit', 'Transparency', 'Encumbrance'], content: ['/what-is-a-local-government-audit'] },
    pt: { term: 'Internal Control (controle interno)', definition: 'Internal control é o conjunto de processos contínuos usados pela administração para oferecer segurança razoável (reasonable assurance) sobre operações eficazes, relatórios confiáveis, conformidade e proteção de recursos. Não é garantia de que todo erro ou fraude será evitado.', why: 'Controles mostram como uma organização reduz riscos em decisões e transações cotidianas.', note: 'Estruturas e exigências variam; o Green Book da GAO é federal, embora possa informar organizações não federais.', related: ['Audit', 'Transparency', 'Encumbrance'], content: ['/pt-br/o-que-e-uma-auditoria-de-governo-local'] }
  },
  {
    category: 'Revenues & Taxes', sourceRefs: ['tennesseeTax', 'floridaTax'],
    en: { term: 'Levy', definition: 'A levy is the legal act of imposing a tax or the total amount of tax authorized by a government, depending on context. In property taxation, a levy is often discussed alongside the assessed tax base and rate.', why: 'Levy explains the government’s authority or target amount, not necessarily the final bill for one property.', note: 'The term can mean an action, an authorized amount, or a rate depending on the state and document.', related: ['Assessed Value', 'Property Tax', 'Tax Base', 'Tax Rate'], content: articleTaxes },
    pt: { term: 'Levy (termo tributário dos EUA)', definition: 'Levy é um termo usado no contexto tributário dos EUA para o ato de impor um tributo, o montante autorizado ou, em alguns documentos, uma referência à taxa, dependendo da jurisdição. Em property tax, costuma ser analisado junto da base tributável e da taxa aplicada.', why: 'Levy ajuda a distinguir a autoridade ou meta do governo da conta final de um imóvel.', note: 'Não há equivalência universal com “lançamento” ou “cobrança” no Brasil; o significado deve ser lido no contexto estadual ou local dos EUA.', related: ['Assessed Value', 'Property Tax', 'Tax Base', 'Tax Rate'], content: articleTaxes }
  },
  {
    category: 'Revenues & Taxes', sourceRefs: ['tennesseeTax', 'floridaTax'],
    en: { term: 'Millage Rate', definition: 'A millage rate is a property-tax rate expressed in mills. One mill commonly represents one dollar of tax for each one thousand dollars of taxable value, although the exact presentation and calculation are set by state and local rules.', why: 'Millage is a common U.S. term that appears on property-tax documents but has no single Brazilian equivalent.', note: 'Assessment ratios, exemptions, and the presentation of one mill vary across jurisdictions.', related: ['Assessed Value', 'Levy', 'Property Tax', 'Tax Rate'], content: articleTaxes },
    pt: { term: 'Millage Rate (taxa em mills)', definition: 'Millage rate é uma taxa de property tax expressa em mills. Um mill normalmente representa um dólar de tributo para cada mil dólares de valor tributável, embora a apresentação e o cálculo exatos dependam das regras estaduais e locais.', why: 'Millage é um termo comum nos EUA que aparece em documentos de property tax e não tem equivalente único no Brasil.', note: 'Percentuais de avaliação, isenções e a apresentação de um mill variam entre jurisdições.', related: ['Assessed Value', 'Levy', 'Property Tax', 'Tax Rate'], content: articleTaxes }
  },
  {
    category: 'Budgeting', sourceRefs: ['idahoFallsBudgetGlossary', 'gfoaBudget'],
    en: { term: 'Operating Budget', definition: 'An operating budget plans recurring revenues and expenditures for the government’s day-to-day services and operations during a fiscal period. It may also include transfers, reserves, or other financing elements under local practice.', why: 'It is the main document for seeing how recurring services are expected to be financed.', note: 'The boundary between operating and capital spending is defined by local policy and accounting rules.', related: ['Capital Budget', 'Revenue', 'Expenditure', 'Fiscal Year'], content: ['/operating-budget-vs-capital-budget'] },
    pt: { term: 'Operating Budget (orçamento operacional)', definition: 'Operating budget planeja receitas e despesas recorrentes para serviços e operações cotidianas durante um período fiscal. Pode incluir transfers, reservas ou outros elementos de financiamento conforme a prática local.', why: 'É o documento principal para ver como serviços recorrentes devem ser financiados.', note: 'A fronteira entre gasto operacional e de capital é definida por política local e regras contábeis.', related: ['Capital Budget', 'Revenue', 'Expenditure', 'Fiscal Year'], content: ['/pt-br/orcamento-operacional-vs-orcamento-de-capital'] }
  },
  {
    category: 'Revenues & Taxes', sourceRefs: ['censusFinance'],
    en: { term: 'Operating Revenue', definition: 'Operating revenue is revenue generated from a government’s ongoing activities, such as charges for services, sales, or other recurring sources associated with an operation. The label and recognition can vary by reporting framework and fund type; it should not automatically be treated as tax revenue or as unrestricted.', why: 'Recurring operating revenue supports services but may have cost, legal, or use restrictions.', note: 'Classification depends on the activity, fund type, and reporting framework.', related: ['Revenue', 'Enterprise Fund', 'User Fee'], content: [] },
    pt: { term: 'Operating Revenue (receita operacional)', definition: 'Operating revenue é a receita gerada pelas atividades contínuas de um governo, como cobrança por serviços, vendas ou outras fontes recorrentes ligadas a uma operação. O rótulo e o reconhecimento podem variar conforme a estrutura de reporte e o tipo de fundo; não deve ser tratada automaticamente como receita tributária ou sem restrição.', why: 'Receita operacional recorrente apoia serviços, mas pode ter restrições legais, de custo ou de uso.', note: 'Classificação depende da atividade, do tipo de fundo e da estrutura de reporte.', related: ['Revenue', 'Enterprise Fund', 'User Fee'], content: [] }
  },
  {
    category: 'Oversight & Transparency', sourceRefs: ['gaoAudit'],
    en: { term: 'Performance Audit', definition: 'A performance audit evaluates a program, activity, or function against stated criteria and develops evidence-based conclusions about performance, economy, efficiency, or effectiveness. It is different from an audit limited to financial statement opinions.', why: 'It helps readers understand that an audit report may ask whether a program worked, not only whether numbers were recorded.', note: 'Objectives, criteria, scope, and reporting language must be read in the individual audit.', related: ['Audit', 'Internal Control', 'Transparency'], content: ['/what-is-a-local-government-audit'] },
    pt: { term: 'Performance Audit (auditoria de desempenho)', definition: 'Performance audit avalia um programa, atividade ou função segundo critérios definidos e desenvolve conclusões baseadas em evidências sobre desempenho, economia, eficiência ou eficácia. É diferente de uma auditoria limitada à opinião sobre demonstrações financeiras.', why: 'Ajuda a entender que um relatório pode perguntar se um programa funcionou, e não apenas se os números foram registrados.', note: 'Objetivos, critérios, escopo e linguagem devem ser lidos no relatório específico.', related: ['Audit', 'Internal Control', 'Transparency'], content: ['/pt-br/o-que-e-uma-auditoria-de-governo-local'] }
  },
  {
    category: 'Revenues & Taxes', sourceRefs: ['censusFinance', 'tennesseeTax'],
    en: { term: 'Property Tax', definition: 'Property tax is a tax imposed on property under the authority of applicable state and local law. In many U.S. systems, the bill reflects taxable value, rates or levies, exemptions, and the taxing bodies that share the bill.', why: 'A property-tax bill may combine decisions from more than one government.', note: 'Assessment, exemptions, payment dates, and rate formulas vary widely by state and locality.', related: ['Assessed Value', 'Levy', 'Millage Rate', 'Tax Base'], content: articleTaxes },
    pt: { term: 'Property Tax (imposto sobre propriedade)', definition: 'Property tax é um tributo incidente sobre propriedade conforme a autoridade da lei estadual e local. Em muitos sistemas dos EUA, a conta reflete valor tributável, taxas ou levies, isenções e os órgãos que compartilham a cobrança.', why: 'Uma conta de property tax pode combinar decisões de mais de um governo.', note: 'Avaliação, isenções, vencimentos e fórmulas variam muito entre estados e localidades.', related: ['Assessed Value', 'Levy', 'Millage Rate', 'Tax Base'], content: articleTaxes }
  },
  {
    category: 'Revenues & Taxes', sourceRefs: ['censusFinance'],
    en: { term: 'Revenue', definition: 'Revenue is money received by a government from external sources, excluding items such as debt issuance, liquidation of investments, and certain agency transactions. Revenue is not the same as cash on hand or borrowing.', why: 'It is the starting point for asking where funding came from and what conditions attach to it.', note: 'Classification and recognition depend on the government’s reporting system and transaction type.', related: ['Operating Revenue', 'Grant', 'Intergovernmental Revenue'], content: ['/where-do-your-local-taxes-actually-go'] },
    pt: { term: 'Revenue (receita)', definition: 'Revenue é dinheiro recebido por um governo de fontes externas, excluindo itens como emissão de dívida, liquidação de investimentos e certas transações de agência. Receita não é sinônimo de caixa disponível ou empréstimo.', why: 'É o ponto de partida para perguntar de onde veio o financiamento e quais condições o acompanham.', note: 'Classificação e reconhecimento dependem do sistema de reporte e do tipo de transação.', related: ['Operating Revenue', 'Grant', 'Intergovernmental Revenue'], content: ['/pt-br/para-onde-vao-os-seus-impostos-locais'] }
  },
  {
    category: 'Debt & Capital', sourceRefs: ['msrbRepayment', 'secMunicipalBonds'],
    en: { term: 'Revenue Bond', definition: 'A revenue bond is a municipal debt obligation payable from a specified source of revenue, such as charges from a utility or facility, under the bond’s legal pledge. The issuer’s general taxing power is not automatically pledged; the official bond documents control.', why: 'The repayment source affects risk, rates, and which users or activities may bear the cost.', note: 'A government’s legal pledge may include reserves, additional bonds tests, or other support; read the documents.', related: ['Bond', 'Debt Service', 'Enterprise Fund', 'User Fee'], content: ['/how-local-governments-borrow-money'] },
    pt: { term: 'Revenue Bond (título garantido por receita)', definition: 'Revenue bond é um título de dívida municipal pagável por uma fonte específica de receita, como cobranças de uma utility ou instalação, conforme a garantia legal da emissão. O poder tributário geral do emissor não é automaticamente oferecido em garantia; os documentos oficiais da emissão prevalecem.', why: 'A fonte de pagamento afeta risco, taxas e quais usuários ou atividades podem suportar o custo.', note: 'A receita dada em garantia, as reservas, os testes para novas emissões e outros apoios devem ser verificados nos documentos da emissão.', related: ['Bond', 'Debt Service', 'Enterprise Fund', 'User Fee'], content: ['/pt-br/como-governos-locais-tomam-dinheiro-emprestado'] }
  },
  {
    category: 'Revenues & Taxes', sourceRefs: ['massBudgetGlossary', 'gasb54'],
    en: { term: 'Restricted Revenue', definition: 'Restricted revenue is revenue whose use is limited by an external party, law, contract, grant, voter action, or another enforceable requirement. The limitation applies to how the revenue may be used; it does not by itself identify a particular fund type.', why: 'A restricted receipt may not be available for a new priority even when it increases total revenue.', note: 'The source and legal terms determine whether a restriction is external, formal, temporary, or permanent.', related: ['Grant', 'Fund', 'Special Revenue Fund', 'Unrestricted Revenue'], content: ['/where-do-your-local-taxes-actually-go'] },
    pt: { term: 'Restricted Revenue (receita restrita)', definition: 'Restricted revenue é uma receita cujo uso é limitado por uma fonte externa, lei, contrato, grant, decisão popular ou outra exigência aplicável. A limitação diz respeito à forma de uso da receita; por si só, não identifica um tipo específico de fundo.', why: 'Uma receita restrita pode não estar disponível para uma nova prioridade mesmo aumentando a receita total.', note: 'Fonte e termos legais determinam se a restrição é externa, formal, temporária ou permanente.', related: ['Grant', 'Fund', 'Special Revenue Fund', 'Unrestricted Revenue'], content: ['/pt-br/para-onde-vao-os-seus-impostos-locais'] }
  },
  {
    category: 'Funds & Accounting', sourceRefs: ['gasb54'],
    en: { term: 'Special Revenue Fund', definition: 'A special revenue fund is a governmental fund used in circumstances where specific restricted or committed revenue sources support specified purposes, subject to applicable standards. Here, “committed” refers to a technical fund-balance classification created by formal action of the government’s highest-level decision-making authority; it is not the same as externally restricted revenue.', why: 'The distinction prevents readers from inferring a fund type from a restriction alone.', note: 'The criteria and classification must be checked against the government’s financial report and applicable standards.', related: ['Fund', 'Governmental Fund', 'Restricted Revenue', 'General Fund'], content: ['/general-fund-vs-special-revenue-funds'] },
    pt: { term: 'Special Revenue Fund (fundo de receita especial)', definition: 'Special revenue fund é um governmental fund usado quando fontes específicas de receita restrita ou committed sustentam finalidades determinadas, conforme normas aplicáveis. Aqui, “committed” é uma classificação técnica de fund balance criada por ação formal do órgão decisório de mais alto nível do governo; não é o mesmo que receita restrita externamente.', why: 'A distinção impede inferir o tipo de fundo apenas pela existência de uma restrição.', note: 'Critérios e classificação devem ser verificados no relatório financeiro e nas normas aplicáveis.', related: ['Fund', 'Governmental Fund', 'Restricted Revenue', 'General Fund'], content: ['/pt-br/fundo-geral-vs-fundos-de-receita-especial'] }
  },
  {
    category: 'Revenues & Taxes', sourceRefs: ['tennesseeTax', 'floridaTax'],
    en: { term: 'Tax Base', definition: 'A tax base is the value, income, transaction, or other measure to which a tax rate is applied. For property tax, it is commonly tied to taxable assessed value, but special taxes may use another measure.', why: 'Changes in the base can change revenue even when the rate does not change.', note: 'The base, exclusions, assessment method, and timing are defined by the tax law.', related: ['Assessed Value', 'Property Tax', 'Tax Rate'], content: articleTaxes },
    pt: { term: 'Tax Base (base tributável)', definition: 'Tax base é o valor, renda, transação ou outra medida à qual uma taxa tributária é aplicada. Em property tax, costuma estar ligada ao valor tributável avaliado, mas tributos especiais podem usar outra medida.', why: 'Mudanças na base podem alterar a receita mesmo quando a taxa não muda.', note: 'Base, exclusões, método de avaliação e timing são definidos pela lei tributária.', related: ['Assessed Value', 'Property Tax', 'Tax Rate'], content: articleTaxes }
  },
  {
    category: 'Revenues & Taxes', sourceRefs: ['tennesseeTax', 'floridaTax'],
    en: { term: 'Tax Rate', definition: 'A tax rate is the rate applied to a tax base to calculate a tax amount. In property taxation, the displayed rate may interact with assessment ratios, exemptions, caps, or multiple taxing authorities.', why: 'The rate alone may not explain why two properties or jurisdictions have different bills.', note: 'Units, formulas, and statutory limits vary by tax and jurisdiction.', related: ['Tax Base', 'Property Tax', 'Millage Rate', 'Levy'], content: articleTaxes },
    pt: { term: 'Tax Rate (taxa tributária)', definition: 'Tax rate é a taxa aplicada a uma base tributável para calcular o valor do tributo. Em property tax, a taxa exibida pode interagir com percentuais de avaliação, isenções, limites ou vários órgãos tributantes.', why: 'A taxa isolada pode não explicar por que dois imóveis ou jurisdições têm contas diferentes.', note: 'Unidades, fórmulas e limites legais variam conforme o tributo e a jurisdição.', related: ['Tax Base', 'Property Tax', 'Millage Rate', 'Levy'], content: articleTaxes }
  },
  {
    category: 'Oversight & Transparency', sourceRefs: ['gaoGreenBook'],
    en: { term: 'Transparency', definition: 'Transparency is the practical availability of understandable, timely, and relevant information about public decisions, resources, and results. Posting a document is not enough if the document is inaccessible, incomplete, or impossible to interpret.', why: 'Transparency connects publication to the public’s ability to ask informed questions.', note: 'Disclosure duties, records rules, and budget publication formats vary by jurisdiction.', related: ['Audit', 'Internal Control', 'Budget Hearing', 'Annual Financial Report'], content: ['/what-is-a-local-government-audit'] },
    pt: { term: 'Transparency (transparência)', definition: 'Transparency é a disponibilidade prática de informações compreensíveis, oportunas e relevantes sobre decisões, recursos e resultados públicos. Publicar um documento não basta se ele for inacessível, incompleto ou impossível de interpretar.', why: 'Transparência conecta publicação à capacidade de o público fazer perguntas informadas.', note: 'Deveres de divulgação, regras de registros e formatos variam por jurisdição.', related: ['Audit', 'Internal Control', 'Budget Hearing', 'Annual Financial Report'], content: ['/pt-br/o-que-e-uma-auditoria-de-governo-local'] }
  },
  {
    category: 'Revenues & Taxes', sourceRefs: ['massBudgetGlossaryUnrestricted', 'gfoaBudgeting'],
    en: { term: 'Unrestricted Revenue', definition: 'Unrestricted revenue is revenue without an external restriction that limits it to a particular purpose. It may still be subject to legal, policy, budgetary, timing, or existing-obligation constraints, so “unrestricted” does not mean immediately spendable.', why: 'Availability depends on obligations, appropriations, timing, and policy—not only on the absence of a restriction.', note: 'The classification and practical availability must be checked in the relevant budget and financial report.', related: ['Restricted Revenue', 'Revenue', 'General Fund', 'Fund Balance'], content: ['/where-do-your-local-taxes-actually-go'] },
    pt: { term: 'Unrestricted Revenue (receita sem restrição externa)', definition: 'Unrestricted revenue é uma receita sem uma restrição externa que a limite a uma finalidade específica. Ela ainda pode estar sujeita a restrições legais, políticas, orçamentárias, de timing ou de obrigações existentes; por isso, “sem restrição externa” não significa imediatamente disponível para gastar.', why: 'Disponibilidade depende de obrigações, autorizações, timing e política, não apenas da ausência de restrição.', note: 'Classificação e disponibilidade prática devem ser verificadas no orçamento e relatório pertinentes.', related: ['Restricted Revenue', 'Revenue', 'General Fund', 'Fund Balance'], content: ['/pt-br/para-onde-vao-os-seus-impostos-locais'] }
  },
  {
    category: 'Revenues & Taxes', sourceRefs: ['marylandBudgetGlossary', 'gfoaBudgeting'],
    en: { term: 'User Fee', definition: 'A user fee is a charge paid by a person or organization for a government service or facility, often designed to recover some or all of the cost. It is not automatically a tax, and the legal distinction depends on the jurisdiction.', why: 'Fee policy affects who pays, how much is recovered, and whether a service is subsidized.', note: 'Authority, cost-recovery limits, exemptions, and naming conventions vary by state and local law.', related: ['Operating Revenue', 'Enterprise Fund', 'Revenue'], content: ['/taxes-fees-and-fines-difference'] },
    pt: { term: 'User Fee (tarifa ou cobrança por serviço)', definition: 'User fee é uma cobrança paga por pessoa ou organização por um serviço ou instalação governamental, muitas vezes para recuperar parte ou todo o custo. Não é automaticamente um tributo; a distinção legal depende da jurisdição.', why: 'A política de tarifas afeta quem paga, quanto é recuperado e se o serviço recebe subsídio.', note: 'Autoridade, limites de recuperação, isenções e nomes variam pela lei estadual e local.', related: ['Operating Revenue', 'Enterprise Fund', 'Revenue'], content: ['/pt-br/impostos-taxas-e-multas-diferenca'] }
  }
];

function materialize(locale) {
  return RAW_ENTRIES.map((entry) => {
    const value = entry[locale];
    return {
      term: value.term,
      plainEnglishDefinition: value.definition,
      whyItMatters: value.why,
      jurisdictionNote: value.note,
      relatedTerms: value.related,
      relatedLuminaContent: value.content,
      sources: entry.sourceRefs.map((sourceRef) => SOURCES[sourceRef]),
      category: entry.category,
      locale
    };
  });
}

const GLOSSARY_EN = Object.freeze(materialize('en'));
const GLOSSARY_PT = Object.freeze(materialize('pt'));

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function renderGlossaryBody(locale = 'en') {
  const entries = locale === 'pt-BR' ? GLOSSARY_PT : GLOSSARY_EN;
  const categories = [...new Set(entries.map((entry) => entry.category))];
  const letters = [...new Set(entries.map((entry) => entry.term[0].toUpperCase()))].sort();
  const labels = locale === 'pt-BR'
    ? { search: 'Buscar um termo', all: 'Todos', letterFilter: 'Filtrar pela letra inicial', why: 'Por que importa', note: 'Nota de jurisdição', related: 'Termos relacionados', sources: 'Fontes' }
    : { search: 'Search the glossary', all: 'All', letterFilter: 'Filter by initial letter', why: 'Why it matters', note: 'Jurisdiction note', related: 'Related terms', sources: 'Sources' };
  const filters = categories.map((category) => `<button type="button" aria-pressed="false" data-glossary-filter="${escapeHtml(category)}">${escapeHtml(category)}</button>`).join('');
  const letterNav = letters.map((letter) => `<button type="button" aria-pressed="false" data-glossary-letter="${escapeHtml(letter)}">${escapeHtml(letter)}</button>`).join('');
  const entriesHtml = entries.map((entry) => `<article class="glossary-entry" id="glossary-${escapeHtml(entry.term.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}" data-glossary-term="${escapeHtml(entry.term.toLowerCase())}" data-glossary-category="${escapeHtml(entry.category)}" data-glossary-letter="${escapeHtml(entry.term[0].toUpperCase())}">
  <div class="glossary-entry-meta">${escapeHtml(entry.category)}</div>
  <h2>${escapeHtml(entry.term)}</h2>
  <p>${escapeHtml(entry.plainEnglishDefinition)}</p>
  <p><strong>${escapeHtml(labels.why)}:</strong> ${escapeHtml(entry.whyItMatters)}</p>
  <p><strong>${escapeHtml(labels.note)}:</strong> ${escapeHtml(entry.jurisdictionNote)}</p>
  <p class="glossary-related"><strong>${escapeHtml(labels.related)}:</strong> ${entry.relatedTerms.map(escapeHtml).join(' · ')}</p>
</article>`).join('\n');
  const references = [...new Set(entries.flatMap((entry) => entry.sources))].map((source) => `<li><a href="${escapeHtml(source)}">${escapeHtml(new URL(source).hostname.replace(/^www\./, ''))}</a></li>`).join('');
  const editorialNote = locale === 'pt-BR'
    ? '<p class="glossary-editorial-note"><strong>Nota editorial:</strong> Estes conceitos são apresentados no contexto dos Estados Unidos. Alguns termos não têm equivalente exato no Brasil; quando isso importa, o termo em inglês é preservado.</p>'
    : '<p class="glossary-editorial-note"><strong>Editorial note:</strong> These concepts are presented in the context of the United States. Some terms do not have an exact Brazilian equivalent; where that matters, the English term is preserved.</p>';
  return `${editorialNote}
<div class="glossary-tools">
  <label><span class="sr-only">${escapeHtml(labels.search)}</span><input type="search" data-glossary-search placeholder="${escapeHtml(labels.search)}" /></label>
  <div class="glossary-filters"><button type="button" class="on" aria-pressed="true" data-glossary-filter="all">${escapeHtml(labels.all)}</button>${filters}</div>
  <nav class="glossary-letters" aria-label="${escapeHtml(labels.letterFilter)}">${letterNav}</nav>
</div>
<div class="glossary-entries">${entriesHtml}</div>
<section class="resource-references"><h2>${escapeHtml(labels.sources)}</h2><ul>${references}</ul></section>`;
}

function renderGlossaryReferences(locale = 'en') {
  const entries = locale === 'pt-BR' ? GLOSSARY_PT : GLOSSARY_EN;
  const sources = [...new Set(entries.flatMap((entry) => entry.sources))];
  return `<section class="resource-references"><h2>${locale === 'pt-BR' ? 'Referências' : 'References'}</h2><ul>${sources.map((source) => `<li><a href="${escapeHtml(source)}">${escapeHtml(source)}</a></li>`).join('')}</ul></section>`;
}

module.exports = {
  GLOSSARY_EN,
  GLOSSARY_PT,
  SOURCES,
  RAW_ENTRIES,
  renderGlossaryBody,
  renderGlossaryReferences
};
