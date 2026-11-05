'use strict';

const TRACKS = Object.freeze([
  { id: 'start-here', en: 'Start here', pt: 'Comece aqui' },
  { id: 'budgets', en: 'Budgets & public decisions', pt: 'Orçamento e decisões públicas' },
  { id: 'revenue', en: 'Revenue, taxation & intergovernmental finance', pt: 'Receita, tributação e relações intergovernamentais' },
  { id: 'reporting', en: 'Government accounting & financial reporting', pt: 'Contabilidade governamental e relatórios financeiros' },
  { id: 'debt', en: 'Municipal debt & capital finance', pt: 'Dívida municipal e financiamento de capital' },
  { id: 'fiscal-condition', en: 'Fiscal condition, reserves & sustainability', pt: 'Condição fiscal, reservas e sustentabilidade' },
  { id: 'audit', en: 'Audit, accountability & transparency', pt: 'Auditoria, accountability e transparência' },
  { id: 'deeper-study', en: 'Deeper study', pt: 'Estudo aprofundado' }
]);

const ITEMS = Object.freeze([
  {
    id: 'financial-foundations-budgeting', track: 'start-here', title: 'Financial Foundations for Budgeting', creator: 'Government Finance Officers Association (GFOA)', type: 'Long-form professional guide', level: 'Introductory → Intermediate', access: 'Free', label: 'Start here · Practical guide', url: 'https://www.gfoa.org/long-form/financial-foundations-for-budgeting',
    why: { en: 'It gives the reader a mental model for public budgeting before introducing procedures. Its value is in explaining why budget choices are difficult: resources are shared, preferences differ, incentives matter, and sustainable decisions require more than balancing columns.', pt: 'Oferece um modelo mental para compreender o orçamento público antes de entrar nos procedimentos. O valor está em explicar por que escolhas orçamentárias são difíceis: os recursos são compartilhados, as preferências divergem, incentivos importam e sustentabilidade exige mais que fechar contas.' },
    helps: { en: 'Trade-offs, fairness, collective action, institutional design, sustainable budgeting.', pt: 'Trade-offs, equidade, ação coletiva, desenho institucional e orçamento sustentável.' }, quick: 1
  },
  {
    id: 'fiscal-fluency', track: 'start-here', title: 'Fiscal Fluency Made Easy', creator: 'GFOA', type: 'Research / communication guide', level: 'Introductory', access: 'Free', year: '2023', label: 'Start here · Practical guide', url: 'https://www.gfoa.org/materials/fiscalfluency',
    why: { en: 'Public-finance information often fails when technically correct numbers are presented without context. This guide is useful because it focuses on how people interpret quantities, comparisons, percentages, and risk.', pt: 'Informações de finanças públicas podem falhar mesmo quando os números estão tecnicamente corretos, simplesmente por falta de contexto. O guia é útil porque mostra como pessoas interpretam quantidades, comparações, percentuais e risco.' },
    helps: { en: 'Numerical communication, context, cognitive load, public-facing financial explanation.', pt: 'Comunicação numérica, contexto, carga cognitiva e explicação financeira para o público.' }
  },
  {
    id: 'census-glossary', track: 'start-here', title: 'Government Finances Glossary', creator: 'U.S. Census Bureau', type: 'Official statistical reference', level: 'Introductory → Intermediate', access: 'Free', label: 'Technical reference', url: 'https://www.census.gov/topics/public-sector/government-finances/about/glossary.html',
    why: { en: 'This is not a general-language dictionary. It shows the vocabulary used in federal statistical treatment of state and local government finance, making it especially valuable when reading datasets or methodology notes.', pt: 'Não é um dicionário de linguagem geral. Ele mostra o vocabulário usado no tratamento estatístico federal das finanças estaduais e locais, sendo especialmente útil ao ler bases de dados e notas metodológicas.' },
    helps: { en: 'Official statistical terminology and the difference between everyday labels and data definitions.', pt: 'Terminologia estatística oficial e a diferença entre rótulos cotidianos e definições de dados.' }, quick: 4, quickTitle: 'Government Finances Glossary + Classification Manual'
  },
  {
    id: 'budget-process', track: 'budgets', title: 'The Steps of the Budget Process', creator: 'GFOA', type: 'Long-form guide', level: 'Introductory → Intermediate', access: 'Free', label: 'Practical guide', url: 'https://www.gfoa.org/long-form/the-steps-of-the-budget-process',
    why: { en: 'It maps the budget as a decision process rather than a single annual vote. That helps readers distinguish preparation, prioritization, engagement, recommendation, adoption, and implementation.', pt: 'Mapeia o orçamento como um processo de decisão, e não como uma única votação anual. Isso ajuda a separar preparação, priorização, participação, recomendação, aprovação e implementação.' },
    helps: { en: 'Budget calendar, decision points, public engagement, adoption, process design.', pt: 'Calendário orçamentário, pontos de decisão, participação pública, aprovação e desenho do processo.' }, quick: 2
  },
  {
    id: 'public-engagement', track: 'budgets', title: 'Rethinking Public Engagement', creator: 'GFOA', type: 'Research report', level: 'Intermediate', access: 'Free', year: '2023', label: 'Practical guide', url: 'https://www.gfoa.org/materials/rethinking-public-engagement',
    why: { en: 'It challenges the idea that a public hearing at the end of the process is enough. The report is strongest when explaining how the timing and structure of engagement affect whether residents can influence real choices.', pt: 'Questiona a ideia de que uma audiência pública no fim do processo seja suficiente. O ponto mais forte é mostrar como o momento e a estrutura da participação determinam se moradores conseguem influenciar escolhas reais.' },
    helps: { en: 'Meaningful participation, timing, trust, representative input, budget legitimacy.', pt: 'Participação significativa, timing, confiança, representatividade e legitimidade orçamentária.' }
  },
  {
    id: 'priority-driven-budgeting', track: 'budgets', title: 'Anatomy of a Priority-Driven Budget Process', creator: 'GFOA', type: 'Research paper', level: 'Intermediate', access: 'Free', label: 'Practical guide', url: 'https://www.gfoa.org/materials/anatomy-of-a-priority-driven-budget-process',
    why: { en: 'A useful counterpoint to incremental budgeting. It shows how an organization can begin with desired results and priorities, then connect funding choices to those priorities rather than simply adjusting last year’s numbers.', pt: 'É um contraponto útil ao orçamento incremental. Mostra como uma organização pode começar pelos resultados e prioridades desejados e depois conectar recursos a essas prioridades, em vez de apenas ajustar os números do ano anterior.' },
    helps: { en: 'Priority-driven budgeting, service alignment, resource allocation, alternatives to incrementalism.', pt: 'Priority-driven budgeting, alinhamento de serviços, alocação de recursos e alternativas ao incrementalismo.' }
  },
  {
    id: 'census-classification-manual', track: 'revenue', title: 'Government Finance and Employment Classification Manual', creator: 'U.S. Census Bureau', type: 'Official technical manual', level: 'Intermediate → Advanced', access: 'Free', label: 'Technical reference', url: 'https://www.census.gov/programs-surveys/gov-finances/technical-documentation/classification-manuals.html',
    why: { en: 'The manual explains the classification architecture behind government-finance statistics. It is the place to go when you need to know why a revenue or expenditure appears in a particular statistical category.', pt: 'O manual explica a arquitetura de classificação por trás das estatísticas de finanças governamentais. É a referência para entender por que determinada receita ou despesa aparece em uma categoria estatística específica.' },
    helps: { en: 'Revenue classes, expenditure functions, debt statistics, data comparability, classification rules.', pt: 'Classes de receita, funções de despesa, estatísticas de dívida, comparabilidade e regras de classificação.' }
  },
  {
    id: 'federal-grants', track: 'revenue', title: 'What Types of Federal Grants Are Made to State and Local Governments and How Do They Work?', creator: 'Tax Policy Center', type: 'Briefing-book explainer', level: 'Introductory → Intermediate', access: 'Free', label: 'Practical explainer', url: 'https://taxpolicycenter.org/briefing-book/what-types-federal-grants-are-made-state-and-local-governments-and-how-do-they-work',
    why: { en: 'Intergovernmental revenue is easy to underestimate when looking only at local taxes. This explainer gives readers a practical overview of how federal money can reach states and local governments through different grant structures.', pt: 'Receitas intergovernamentais são fáceis de subestimar quando o olhar fica restrito aos impostos locais. O material oferece uma visão prática de como recursos federais podem chegar aos estados e governos locais por diferentes estruturas de grants.' },
    helps: { en: 'Grants, pass-through funding, block grants, categorical aid, fiscal federalism.', pt: 'Grants, recursos pass-through, block grants, categorical aid e federalismo fiscal.' }
  },
  {
    id: 'property-taxation-local-finance', track: 'revenue', title: 'Property Taxation and Local Government Finance', creator: 'Wallace E. Oates, ed. · Lincoln Institute of Land Policy', type: 'Book', level: 'Intermediate → Advanced', access: 'Book / library', year: '2001', label: 'Foundational reference', url: 'https://www.lincolninst.edu/publications/books/property-taxation-local-government-finance/', bookshelf: true, shelfOrder: 6, coverKind: 'book',
    why: { en: 'Property tax is central to local finance but often discussed through slogans. This volume gives the reader a deeper economic and policy treatment while remaining intentionally accessible to policy makers and noneconomists.', pt: 'O property tax é central nas finanças locais, mas muitas vezes é discutido por meio de slogans. Este volume oferece uma análise econômica e de políticas públicas mais profunda, mantendo uma linguagem pensada também para formuladores de políticas e não economistas.' },
    helps: { en: 'Property-tax economics, local revenue capacity, tax incidence, policy design, local public finance.', pt: 'Economia do property tax, capacidade de receita local, incidência tributária, desenho de políticas e finanças locais.' }
  },
  {
    id: 'government-accounting-different', track: 'reporting', title: 'Why Governmental Accounting and Financial Reporting Is—and Should Be—Different', creator: 'Governmental Accounting Standards Board (GASB)', type: 'White paper', level: 'Intermediate', access: 'Free PDF', label: 'Foundational reference', url: 'https://storage.gasb.org/White_Paper_Revised_September_2017.pdf',
    why: { en: 'It answers a foundational question: why government financial reporting should not simply imitate corporate reporting. The differences in objectives, accountability, resource restrictions, and users change what the statements need to communicate.', pt: 'Responde a uma pergunta fundamental: por que relatórios financeiros governamentais não devem simplesmente imitar relatórios corporativos. Objetivos, accountability, restrições sobre recursos e usuários mudam o que os demonstrativos precisam comunicar.' },
    helps: { en: 'Governmental vs. business accounting, accountability, resource restrictions, reporting objectives.', pt: 'Contabilidade governamental versus empresarial, accountability, restrições de recursos e objetivos de reporting.' }
  },
  {
    id: 'local-government-finances-guide', track: 'reporting', title: 'What You Should Know about Your Local Government’s Finances: A Guide to Financial Statements', creator: 'GASB', type: 'User guide · 3rd edition', level: 'Introductory → Intermediate', access: 'Free PDF', year: '2017', label: 'Start here · Practical guide', url: 'https://storage.gasb.org/Local%20Governments%20Finances%20User%20Guide.pdf',
    why: { en: 'One of the most useful documents in the entire list for a citizen or nonaccountant. It explains local-government financial statements from the user’s point of view and helps translate formal reporting into questions a reader can actually ask.', pt: 'É um dos documentos mais úteis de toda a lista para cidadãos e não contadores. Explica demonstrações financeiras de governos locais do ponto de vista de quem usa a informação e transforma reporting formal em perguntas que o leitor consegue fazer.' },
    helps: { en: 'Government-wide statements, funds, financial position, annual results, notes, user questions.', pt: 'Government-wide statements, funds, posição financeira, resultados anuais, notas e perguntas do usuário.' }, quick: 3
  },
  {
    id: 'popular-reporting', track: 'reporting', title: 'Popular Reporting of Financial Information', creator: 'GFOA', type: 'Best practice', level: 'Introductory → Intermediate', access: 'Free', year: '2020', label: 'Practical guide', url: 'https://www.gfoa.org/materials/popular-reporting-of-financial-information',
    why: { en: 'Useful for understanding what a PAFR is trying to do and why a shorter public-facing report is not a substitute for full audited reporting. It also shows what good financial communication should prioritize.', pt: 'Ajuda a entender o objetivo de um PAFR e por que um relatório mais curto, voltado ao público, não substitui o reporting auditado completo. Também mostra o que uma boa comunicação financeira deve priorizar.' },
    helps: { en: 'PAFRs, accessibility, public communication, relationship between summary and full reporting.', pt: 'PAFRs, acessibilidade, comunicação pública e relação entre resumo e relatório completo.' }
  },
  {
    id: 'gaafr-2024', track: 'reporting', title: 'Governmental Accounting, Auditing, and Financial Reporting (GAAFR) — 2024 Blue Book', creator: 'GFOA · Todd Buikema & Michele Mark Levine, eds.', type: 'Professional reference / textbook', level: 'Advanced', access: 'Professional publication / library', year: '2024', label: 'Professional standard', url: 'https://www.gfoa.org/materials/2024-gaafr', bookshelf: true, shelfOrder: 1, coverKind: 'professional',
    why: { en: 'This is the bookshelf reference for readers who need a practice-oriented treatment of governmental accounting, auditing, and financial reporting. It is not a quick read; it is a working reference and textbook.', pt: 'É a referência de estante para quem precisa de um tratamento prático e aprofundado de contabilidade governamental, auditoria e financial reporting. Não é leitura rápida; funciona como referência de trabalho e livro-texto.' },
    helps: { en: 'Governmental accounting practice, auditing, financial reporting, GASB implementation context, professional workflows.', pt: 'Prática contábil governamental, auditoria, financial reporting, contexto de implementação do GASB e rotinas profissionais.' }
  },
  {
    id: 'monitoring-bond-investments', track: 'debt', title: 'Monitoring Bond Investments / Financial-Disclosure Education Hub', creator: 'Municipal Securities Rulemaking Board (MSRB)', type: 'Official educational hub', level: 'Introductory → Intermediate', access: 'Free', label: 'Practical guide', url: 'https://www.msrb.org/Education/Monitoring-Bond-Investments',
    why: { en: 'It shows what information becomes available after municipal securities are issued and how audited statements, annual financial information, event notices, and EMMA fit together from the information-user side.', pt: 'Mostra quais informações passam a estar disponíveis depois da emissão de municipal securities e como demonstrações auditadas, annual financial information, event notices e EMMA se conectam do ponto de vista de quem usa a informação.' },
    helps: { en: 'Continuing disclosure, EMMA, audited reports, event notices, investor information.', pt: 'Continuing disclosure, EMMA, relatórios auditados, event notices e informação para investidores.' }
  },
  {
    id: 'issuing-municipal-bonds', track: 'debt', title: 'Issuing Municipal Bonds', creator: 'MSRB', type: 'Official educational guide / hub', level: 'Introductory → Intermediate', access: 'Free', label: 'Practical guide', url: 'https://www.msrb.org/Education/Issuing-Municipal-Bonds',
    why: { en: 'It complements the investor-side material by showing the issuance process from the public issuer’s perspective — participants, responsibilities, disclosure, and the market infrastructure around a bond issue.', pt: 'Complementa o material voltado ao investidor ao mostrar o processo de emissão pela perspectiva do public issuer — participantes, responsabilidades, disclosure e a infraestrutura de mercado ao redor de uma emissão.' },
    helps: { en: 'Issuance process, issuer responsibilities, municipal advisors, underwriters, disclosure, EMMA.', pt: 'Processo de emissão, responsabilidades do issuer, municipal advisors, underwriters, disclosure e EMMA.' }
  },
  {
    id: 'municipal-bonds-overview', track: 'debt', title: 'Municipal Bonds: An Overview', creator: 'U.S. Securities and Exchange Commission / Investor.gov', type: 'Investor bulletin', level: 'Introductory', access: 'Free', label: 'Start here · Practical guide', url: 'https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins-37',
    why: { en: 'A compact federal introduction for readers who need the vocabulary before going deeper. It establishes the basic issuer, bond, risk, disclosure, and information-source concepts without assuming market expertise.', pt: 'É uma introdução federal compacta para quem precisa dominar o vocabulário antes de aprofundar. Apresenta conceitos básicos de issuer, bond, risco, disclosure e fontes de informação sem presumir experiência no mercado.' },
    helps: { en: 'Municipal bonds, issuers, risks, disclosures, sources of information.', pt: 'Municipal bonds, issuers, riscos, disclosures e fontes de informação.' }, quick: 5
  },
  {
    id: 'multi-year-capital-planning', track: 'debt', title: 'Multi-Year Capital Planning', creator: 'GFOA', type: 'Best practice', level: 'Introductory → Intermediate', access: 'Free', label: 'Practical guide', url: 'https://www.gfoa.org/materials/multi-year-capital-planning',
    why: { en: 'Capital finance begins before borrowing. This best practice helps readers see the connection between long-lived assets, project prioritization, funding strategies, future operating costs, and multi-year planning.', pt: 'O financiamento de capital começa antes do endividamento. A best practice ajuda a enxergar a conexão entre ativos de longa duração, priorização de projetos, estratégias de financiamento, custos operacionais futuros e planejamento plurianual.' },
    helps: { en: 'Capital plans, infrastructure needs, project prioritization, funding options, operating impacts.', pt: 'Capital plans, necessidades de infraestrutura, priorização, opções de funding e impactos operacionais.' }
  },
  {
    id: 'rethink-reserves', track: 'fiscal-condition', title: 'Should We Rethink Reserves?', creator: 'GFOA', type: 'Research report', level: 'Intermediate', access: 'Free', label: 'Practical guide', url: 'https://www.gfoa.org/materials/rethinkingreserves',
    why: { en: 'Reserve debates often collapse into a single target percentage. This report is useful because it pushes the reader toward risk-based thinking: what shocks are plausible, what resources are available, and what resilience the government needs.', pt: 'Discussões sobre reservas muitas vezes se reduzem a um percentual-alvo. O relatório é útil porque leva o leitor a pensar em risco: quais choques são plausíveis, quais recursos existem e qual resiliência o governo precisa manter.' },
    helps: { en: 'Reserves, fund balance, risk, liquidity, resilience, policy design.', pt: 'Reserves, fund balance, risco, liquidez, resiliência e desenho de políticas.' }
  },
  {
    id: 'long-term-financial-planning', track: 'fiscal-condition', title: 'Long-Term Financial Planning', creator: 'GFOA', type: 'Best practice', level: 'Introductory → Intermediate', access: 'Free', year: '2022', label: 'Practical guide', url: 'https://www.gfoa.org/materials/long-term-financial-planning',
    why: { en: 'It moves the reader beyond one-year budget balance. Long-term planning connects revenue and expenditure trends, financial position, risks, capital needs, and policy responses over a multi-year horizon.', pt: 'Leva o leitor além do equilíbrio de um único exercício. O planejamento de longo prazo conecta tendências de receita e despesa, posição financeira, riscos, necessidades de capital e respostas de política ao longo de vários anos.' },
    helps: { en: 'Forecasting, structural balance, long-term risks, capital needs, policy scenarios.', pt: 'Forecasting, equilíbrio estrutural, riscos de longo prazo, necessidades de capital e cenários de política.' }
  },
  {
    id: 'evaluating-financial-condition', track: 'fiscal-condition', title: 'Evaluating Financial Condition: A Handbook for Local Government, 4th ed.', creator: 'Sanford M. Groves, Karl Nollenberger & Maureen Godsey Valente · ICMA', type: 'Professional handbook', level: 'Intermediate → Advanced', access: 'Book / library', year: '2003', label: 'Classic framework', url: 'https://search.worldcat.org/title/Evaluating-financial-condition-%3A-a-handbook-for-local-government/oclc/52416764', bookshelf: true, shelfOrder: 7, coverKind: 'classic',
    why: { en: 'A classic framework for thinking systematically about local financial condition. Its age should be visible, but its value lies in organizing indicators across revenues, expenditures, operating position, debt, and the surrounding economic and demographic environment.', pt: 'É uma estrutura clássica para pensar de forma sistemática sobre a condição financeira de governos locais. A idade da obra deve ficar visível, mas seu valor está em organizar indicadores de receitas, despesas, operating position, dívida e ambiente econômico e demográfico.' },
    helps: { en: 'Fiscal-condition indicators, trend analysis, environmental factors, warning signals, analytical frameworks.', pt: 'Indicadores de condição fiscal, análise de tendências, fatores ambientais, sinais de alerta e estruturas analíticas.' }
  },
  {
    id: 'yellow-book-2024', track: 'audit', title: 'Government Auditing Standards — 2024 Yellow Book', creator: 'U.S. Government Accountability Office (GAO)', type: 'Professional auditing standard', level: 'Advanced', access: 'Free digital edition', year: '2024', label: 'Professional standard', url: 'https://www.gao.gov/yellowbook',
    why: { en: 'This is not a citizen primer. It belongs here because it is the authoritative standards framework behind a large share of government audit work in the United States. Readers should use it as a technical reference when they need to understand the expectations placed on auditors.', pt: 'Não é um guia introdutório para cidadãos. Está na lista porque é uma referência normativa central para grande parte do trabalho de auditoria governamental nos EUA. Deve ser usada como referência técnica quando o leitor quiser entender as exigências aplicáveis aos auditores.' },
    helps: { en: 'Audit standards, independence, competence, quality management, reporting responsibilities.', pt: 'Padrões de auditoria, independência, competência, quality management e responsabilidades de reporting.' }
  },
  {
    id: 'state-local-public-finance', track: 'deeper-study', title: 'State and Local Public Finance, 5th ed.', creator: 'Ronald C. Fisher · Routledge', type: 'Textbook', level: 'Advanced', access: 'Book / library', year: '2023', label: 'Current textbook', url: 'https://www.routledge.com/State-and-Local-Public-Finance/Fisher/p/book/9780367467234', bookshelf: true, shelfOrder: 2, coverKind: 'book',
    why: { en: 'The most systematic economics-centered book in this list for understanding state and local public finance as a field. It connects public services, fiscal federalism, grants, taxation, capital investment, borrowing, debt, and policy analysis within one framework.', pt: 'É o livro mais sistemático da lista, com enfoque econômico, para entender finanças públicas estaduais e locais como campo de estudo. Conecta serviços públicos, federalismo fiscal, grants, tributação, investimento de capital, borrowing, dívida e análise de políticas numa única estrutura.' },
    helps: { en: 'Fiscal federalism, public services, taxation, grants, debt, capital investment, economic analysis.', pt: 'Federalismo fiscal, serviços públicos, tributação, grants, dívida, investimento de capital e análise econômica.' }
  },
  {
    id: 'public-budgeting-systems', track: 'deeper-study', title: 'Public Budgeting Systems, 10th ed.', creator: 'Robert D. Lee Jr., Ronald W. Johnson & Philip G. Joyce · Jones & Bartlett Learning', type: 'Textbook', level: 'Intermediate → Advanced', access: 'Book / library / sample', year: '2021', label: 'Current textbook', url: 'https://www.jblearning.com/catalog/productdetails/9781284198980', bookshelf: true, shelfOrder: 3, coverKind: 'book',
    why: { en: 'A broad public-budgeting textbook that connects process, revenues, expenditures, accounting, reporting, auditing, capital finance, debt, and intergovernmental relations. It is useful when you want the budget system as a whole rather than a single technique.', pt: 'É um livro-texto amplo sobre public budgeting que conecta processo, receitas, despesas, contabilidade, reporting, auditoria, capital finance, dívida e relações intergovernamentais. É útil quando o objetivo é entender o sistema orçamentário como um todo.' },
    helps: { en: 'Budget systems, financial management, accounting/reporting links, capital finance, debt, intergovernmental relations.', pt: 'Sistemas orçamentários, gestão financeira, conexão com contabilidade/reporting, capital finance, dívida e relações intergovernamentais.' }
  },
  {
    id: 'fiscal-administration', track: 'deeper-study', title: 'Fiscal Administration, 11th ed.', creator: 'John Mikesell & Justin Ross · Cengage', type: 'Textbook', level: 'Intermediate → Advanced', access: 'Book / library', year: '2025', label: 'Current textbook', url: 'https://www.cengage.com/c/fiscal-administration-11e-mikesell-ross/9798214135328/', bookshelf: true, shelfOrder: 4, coverKind: 'book',
    why: { en: 'A strongly applied text. It combines conceptual public finance with calculations, cases, revenue questions, and administrative practice, making it especially useful for readers who want to move from “understanding” to actually working with fiscal information.', pt: 'É um texto fortemente aplicado. Combina conceitos de finanças públicas com cálculos, casos, questões de receita e prática administrativa, sendo especialmente útil para quem quer passar de “entender” para efetivamente trabalhar com informação fiscal.' },
    helps: { en: 'Applied budgeting, revenue administration, quantitative analysis, fiscal operations, practical decision-making.', pt: 'Orçamento aplicado, administração de receitas, análise quantitativa, operações fiscais e decisão prática.' }
  },
  {
    id: 'politics-public-budgeting', track: 'deeper-study', title: 'The Politics of Public Budgeting: Getting and Spending, Borrowing and Balancing, 9th ed.', creator: 'Irene S. Rubin · CQ Press / SAGE', type: 'Textbook', level: 'Intermediate → Advanced', access: 'Book / library', year: '2019', label: 'Foundational reference', url: 'https://www.sagepub.com/shop/buy-a-book/the-politics-of-public-budgeting-9-259267', bookshelf: true, shelfOrder: 5, coverKind: 'book',
    why: { en: 'Technical descriptions can make a budget look neutral and mechanical. Rubin restores the political dimension: actors, bargaining, conflict, institutional constraints, competing priorities, and accountability. It is the best complement in this list to purely technical budgeting texts.', pt: 'Descrições técnicas podem fazer o orçamento parecer neutro e mecânico. Rubin recoloca a dimensão política no centro: atores, negociação, conflito, restrições institucionais, prioridades concorrentes e accountability. É o melhor complemento da lista para livros exclusivamente técnicos de orçamento.' },
    helps: { en: 'Budget politics, bargaining, actors, institutional constraints, conflict, accountability.', pt: 'Política orçamentária, negociação, atores, restrições institucionais, conflito e accountability.' }
  }
]);

const COPY = Object.freeze({
  en: {
    intro: 'You do not need to read everything at once. Start with the five-item path, then follow the track that matches the question you are trying to answer. Free institutional resources come first; deeper books and professional references are included when they add a perspective that shorter guides cannot.',
    howTitle: 'How to use this list',
    howText: 'This is a learning path, not a ranking. “Introductory” means a reader can begin without specialist training. “Intermediate” assumes familiarity with basic budget or financial-report terms. “Advanced” points to technical standards, professional references, or university-level treatments. Links go to the institution, publisher, or bibliographic source — never to unauthorized copies.',
    quickTitle: 'If you only read five things',
    quickIntro: 'A free starting path for building a useful mental model before you go deeper.',
    shelfTitle: 'The foundational bookshelf',
    shelfIntro: 'Seven deeper references worth knowing by name. They are not ranked and they do not need to be purchased to use this page. Think of them as the books and professional references you are likely to encounter in serious study or practice.',
    tracksTitle: 'Follow the question you are trying to answer',
    whyLabel: 'Why read it', helpsLabel: 'Helps you understand', sourceLabel: 'Open source', bookLabel: 'Publisher / bibliographic source', methodologyTitle: 'How this list was selected',
    methodology: 'Selection emphasizes durable educational value, authoritative provenance, state/local relevance, and complementarity. Institutional materials are preferred when they teach the concept well and are freely available. Older works are included only when they remain useful as foundational frameworks and are labeled with their publication context. Publisher and institutional links are provided for identification and further reading; inclusion is not an endorsement or a commercial recommendation.'
  },
  'pt-BR': {
    intro: 'Você não precisa ler tudo de uma vez. Comece pela trilha de cinco itens e depois siga o tema que responde à pergunta que você quer entender. Recursos institucionais gratuitos aparecem primeiro; livros e referências profissionais entram quando acrescentam uma profundidade que guias curtos não conseguem oferecer.',
    howTitle: 'Como usar esta lista',
    howText: 'Esta é uma trilha de aprendizagem, não um ranking. “Introdutório” significa que o leitor pode começar sem formação especializada. “Intermediário” pressupõe familiaridade com conceitos básicos de orçamento ou relatórios financeiros. “Avançado” indica normas técnicas, referências profissionais ou tratamentos de nível universitário. Os links levam à instituição, editora ou fonte bibliográfica — nunca a cópias não autorizadas.',
    quickTitle: 'Se você ler apenas cinco coisas',
    quickIntro: 'Uma trilha inicial gratuita para construir um bom modelo mental antes de aprofundar.',
    shelfTitle: 'A estante de referências fundamentais',
    shelfIntro: 'Sete referências mais profundas que vale a pena conhecer pelo nome. Elas não estão em ranking e você não precisa comprá-las para usar esta página. Pense nelas como livros e referências profissionais que aparecem com frequência em estudo ou prática mais aprofundados.',
    tracksTitle: 'Siga a pergunta que você quer responder',
    whyLabel: 'Por que ler', helpsLabel: 'Ajuda a entender', sourceLabel: 'Abrir fonte', bookLabel: 'Editora / fonte bibliográfica', methodologyTitle: 'Como esta lista foi selecionada',
    methodology: 'A seleção prioriza valor educacional duradouro, procedência confiável, relevância para finanças estaduais/locais e complementaridade. Materiais institucionais têm preferência quando ensinam bem o conceito e estão disponíveis gratuitamente. Obras mais antigas só entram quando ainda são úteis como estruturas fundamentais e aparecem com o contexto de publicação claramente indicado. Links de editoras e instituições servem para identificação e aprofundamento; a inclusão não representa endosso nem recomendação comercial.'
  }
});

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function localized(item, field, locale) {
  return item[field]?.[locale] || item[field]?.en || '';
}

function localizedLevel(level, locale) {
  if (locale !== 'pt-BR') return level;
  return level.replace('Introductory', 'Introdutório').replace('Intermediate', 'Intermediário').replace('Advanced', 'Avançado');
}

function localizedAccess(access, locale) {
  if (locale !== 'pt-BR') return access;
  return access.replace('Free digital edition', 'Edição digital gratuita').replace('Free PDF', 'PDF gratuito').replace('Free', 'Gratuito').replace('Book / library / sample', 'Livro / biblioteca / amostra').replace('Book / library', 'Livro / biblioteca').replace('Professional publication / library', 'Publicação profissional / biblioteca');
}

function localizedLabel(label, locale) {
  if (locale !== 'pt-BR') return label;
  const labels = {
    'Start here · Practical guide': 'Comece aqui · Guia prático',
    'Practical guide': 'Guia prático',
    'Practical explainer': 'Explicação prática',
    'Technical reference': 'Referência técnica',
    'Foundational reference': 'Referência fundamental',
    'Professional standard': 'Norma profissional',
    'Classic framework': 'Estrutura clássica',
    'Current textbook': 'Livro-texto atual'
  };
  return labels[label] || label;
}

function renderMeta(item, locale) {
  const parts = [localizedLevel(item.level, locale), localizedAccess(item.access, locale)];
  if (item.year) parts.push(item.year);
  return parts.map((part) => `<span>${escapeHtml(part)}</span>`).join('<span class="reading-dot" aria-hidden="true"></span>');
}

function renderQuickPath(locale) {
  const items = ITEMS.filter((item) => item.quick).sort((a, b) => a.quick - b.quick);
  return `<ol class="reading-quick-list">${items.map((item) => `<li><a href="#reading-${escapeHtml(item.id)}"><span class="reading-quick-num">${String(item.quick).padStart(2, '0')}</span><span><strong>${escapeHtml(item.quickTitle || item.title)}</strong><small>${escapeHtml(item.creator)}</small></span></a></li>`).join('')}</ol>`;
}

function renderCover(item, locale) {
  if (item.coverAsset) {
    const altPrefix = locale === 'pt-BR' ? 'Capa de' : 'Cover of';
    return `<img src="${escapeHtml(item.coverAsset)}" alt="${escapeHtml(altPrefix)} ${escapeHtml(item.title)}" loading="lazy" decoding="async" />`;
  }
  const shortCreator = item.creator.split('·')[0].trim();
  return `<div class="reading-cover-placeholder reading-cover-${escapeHtml(item.coverKind || 'book')}"><span>${escapeHtml(localizedLabel(item.label, locale))}</span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(shortCreator)}</small></div>`;
}

function renderBookshelf(locale, copy) {
  return `<div class="reading-bookshelf">${ITEMS.filter((item) => item.bookshelf).sort((a, b) => a.shelfOrder - b.shelfOrder).map((item) => `<a class="reading-book" href="#reading-${escapeHtml(item.id)}"><div class="reading-book-cover">${renderCover(item, locale)}</div><div class="reading-book-meta"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.year || '')}${item.label === 'Classic framework' ? (locale === 'pt-BR' ? ' · Clássico' : ' · Classic') : ''}</span></div></a>`).join('')}</div>`;
}

function renderTrackNav(locale) {
  return `<nav class="reading-track-nav" aria-label="${locale === 'pt-BR' ? 'Trilhas de leitura' : 'Reading tracks'}">${TRACKS.map((track, index) => `<a href="#track-${escapeHtml(track.id)}"><span>${String(index + 1).padStart(2, '0')}</span>${escapeHtml(locale === 'pt-BR' ? track.pt : track.en)}</a>`).join('')}</nav>`;
}

function renderItem(item, locale, copy) {
  const cta = /Book|Professional publication/.test(item.access) ? copy.bookLabel : copy.sourceLabel;
  return `<article class="reading-item" id="reading-${escapeHtml(item.id)}">
    <div class="reading-item-number">${String(ITEMS.indexOf(item) + 1).padStart(2, '0')}</div>
    <div class="reading-item-main">
      <div class="reading-item-label">${escapeHtml(localizedLabel(item.label, locale))}</div>
      <h3>${escapeHtml(item.title)}</h3>
      <p class="reading-creator">${escapeHtml(item.creator)}</p>
      <div class="reading-item-meta">${renderMeta(item, locale)}</div>
      <p><strong>${escapeHtml(copy.whyLabel)}.</strong> ${escapeHtml(localized(item, 'why', locale))}</p>
      <p class="reading-helps"><strong>${escapeHtml(copy.helpsLabel)}.</strong> ${escapeHtml(localized(item, 'helps', locale))}</p>
      <a class="reading-source-link" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(cta)} <span aria-hidden="true">↗</span></a>
    </div>
  </article>`;
}

function renderTracks(locale, copy) {
  return TRACKS.map((track, index) => {
    const items = ITEMS.filter((item) => item.track === track.id);
    return `<section class="reading-track" id="track-${escapeHtml(track.id)}"><div class="reading-track-heading"><span>${String(index + 1).padStart(2, '0')}</span><h2>${escapeHtml(locale === 'pt-BR' ? track.pt : track.en)}</h2></div>${items.map((item) => renderItem(item, locale, copy)).join('')}</section>`;
  }).join('\n');
}

function renderCivicFinanceReadingListBody(locale = 'en') {
  const copy = COPY[locale] || COPY.en;
  const bodyHtml = [
    `<p class="reading-intro">${escapeHtml(copy.intro)}</p>`,
    `<aside class="reading-how"><div class="reading-how-label">${escapeHtml(copy.howTitle)}</div><p>${escapeHtml(copy.howText)}</p></aside>`,
    `<section class="reading-quick"><div class="reading-section-kicker">${locale === 'pt-BR' ? '01 · COMEÇAR' : '01 · START'}</div><h2>${escapeHtml(copy.quickTitle)}</h2><p>${escapeHtml(copy.quickIntro)}</p>${renderQuickPath(locale)}</section>`,
    `<section class="reading-shelf"><div class="reading-section-kicker">${locale === 'pt-BR' ? '02 · ESTANTE' : '02 · BOOKSHELF'}</div><h2>${escapeHtml(copy.shelfTitle)}</h2><p>${escapeHtml(copy.shelfIntro)}</p>${renderBookshelf(locale, copy)}</section>`,
    `<section class="reading-map"><div class="reading-section-kicker">${locale === 'pt-BR' ? '03 · TRILHAS' : '03 · PATHS'}</div><h2>${escapeHtml(copy.tracksTitle)}</h2>${renderTrackNav(locale)}</section>`,
    renderTracks(locale, copy),
    `<section class="reading-methodology"><h2>${escapeHtml(copy.methodologyTitle)}</h2><p>${escapeHtml(copy.methodology)}</p></section>`
  ].join('\n');
  return { bodyHtml, referencesHtml: '' };
}

module.exports = { TRACKS, ITEMS, COPY, renderCivicFinanceReadingListBody };
