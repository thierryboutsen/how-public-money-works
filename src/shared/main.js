/* ============================================================
   Eliana Faria Lima — Shared JS System
   Handles: responsive navbar, bilingual translation, blog filters,
   live search, and micro-interactions.
   ============================================================ */

const TRANSLATIONS = {
  en: {
    // Navigation
    "nav-home": "Home",
    "nav-about": "About",
    "nav-focus": "Focus",
    "nav-insights": "Insights",
    "nav-resources": "Resources",
    "nav-contact": "Contact",
    "nav-subscribe": "Updates",
    
    // Hero Section
    "hero-eyebrow": "Public Finance and Civic Education",
    "hero-title-1": "Bringing clarity",
    "hero-title-accent": "to public money.",
    "hero-lede": "Eliana Faria Lima writes and works across public finance, government budgeting, health governance, and transparency—turning complex public-money questions into practical, plain-language guidance.",
    "hero-btn-essay": "Read the Latest Essay",
    "hero-btn-about": "About Eliana",
    "hero-strip-1": "Public Finance",
    "hero-strip-2": "How Public Money Works · ongoing publication",
    "hero-strip-3": "English / Portuguese",
    "hero-caption": "Lumina Smart Strategies · Public finance and civic education",
    "hero-card-label": "From the editor",
    "hero-card-quote": "Public money becomes more useful when people can understand the choices behind it.",
    "hero-card-author": "— Eliana Faria Lima",
    
    // Areas / Disciplines
    "areas-title": "Six areas,",
    "areas-title-accent": "one clear purpose.",
    "areas-lede": "The work connects public-finance practice with civic explanation: how public resources are raised, budgeted, governed, and made understandable.",
    "areas-practice-glance": "Areas of focus — at a glance",
    
    "area-01-title": "Public Finance",
    "area-01-desc": "How governments raise, allocate, and account for public resources, explained with attention to local variation.",
    "area-02-title": "Government Budgeting",
    "area-02-desc": "How budgets turn public priorities into plans, appropriations, services, and choices that residents can examine.",
    "area-03-title": "Health Governance",
    "area-03-desc": "The connection between public resources, institutional stewardship, and the systems that support community health.",
    "area-04-title": "Fiscal Modernization",
    "area-04-desc": "Clearer practices, systems, and public-facing information that can make financial administration easier to understand.",
    "area-05-title": "Transparency & Accountability",
    "area-05-desc": "The documents, decisions, and oversight processes that help the public see how money is managed.",
    "area-06-title": "Civic Financial Education",
    "area-06-desc": "Plain-language guidance for residents, taxpayers, small-business owners, students, and community leaders.",
    "areas-read-more": "Read more →",
    
    // Featured Essay
    "featured-essay-eyebrow": "Featured Essay · How Public Money Works",
    "featured-essay-title": "What Is a City Budget",
    "featured-essay-title-accent": "— and Why Should You Care?",
    "featured-essay-category": "Civic Education",
    "featured-essay-read-time": "8 min read",
    "featured-essay-excerpt-1": "Every year, your city decides how to spend hundreds of millions of dollars — on streets, schools, libraries, parks, fire trucks, water lines. That decision is called a budget. It is not a technical document for accountants. It is a public statement of priorities, written in numbers.",
    "featured-essay-excerpt-2": "This essay walks through how a city budget is built, who has a voice in it, and what a citizen can actually see by reading one.",
    "featured-essay-btn": "Read the article",
    "featured-caption": "City hall · civic public architecture",
    
    // Blog section homepage
    "blog-sec-eyebrow": "A publication by Eliana Faria Lima",
    "blog-sec-title": "How Public Money",
    "blog-sec-title-accent": "Works.",
    "blog-sec-tagline": "Bringing clarity to public finance.",
    "blog-sec-desc": "Short, plain-language essays on how American government raises, spends, and accounts for public money — from city hall to state capitol. Written for the people who live with the consequences.",
    "blog-sec-btn-browse": "Browse all Insights",
    "blog-sec-read-article": "Read article →",
    
    // About Section
    "about-eyebrow": "About",
    "about-title": "Public-finance experience,",
    "about-title-accent": "made useful",
    "about-title-end": " to more readers.",
    "about-p1": "Eliana Faria Lima is a public finance specialist whose work and writing connect government budgeting, health governance, transparency, and accountability.",
    "about-p2": "Through How Public Money Works, she explains public documents and financial concepts for residents, taxpayers, small-business owners, students, and civic professionals—without treating local examples as universal rules.",
    "about-quote": "The goal is practical: help readers understand the documents, choices, and institutions behind public money.",
    "about-btn": "Contact Eliana",
    "about-caption-1": "Eliana Faria Lima · Founder",
    "about-caption-2": "How Public Money Works · Civic education",
    
    // Resources Section
    "res-eyebrow": "Resources",
    "res-title": "A small library,",
    "res-title-accent": "freely available.",
    
    "res-01-kind": "Reference",
    "res-01-title": "Glossary of Public Finance",
    "res-01-desc": "An evolving A–Z of public-finance terms, in plain English. From appropriation to zero-based budgeting.",
    "res-coming-soon": "Coming soon",
    
    "res-02-kind": "Article guide",
    "res-02-title": "How to Read a City Budget",
    "res-02-desc": "A plain-language article about what a city budget is, how it shapes public choices, and why residents may want to read it.",
    "res-02-action": "Read article →",
    
    "res-03-kind": "Article guide",
    "res-03-title": "Where Do Your Local Taxes Actually Go?",
    "res-03-desc": "A conceptual guide to revenue sources, local governments, funds, and the services they support.",
    "res-03-action": "Read article →",
    
    "res-04-kind": "Index",
    "res-04-title": "Open-Data Portals — A Map",
    "res-04-desc": "Where to find your city's, county's, and state's published financial data — with notes on what each portal offers.",
    "res-04-action": "Open index →",
    
    "res-05-kind": "Bibliography",
    "res-05-title": "Reading List · Civic Finance",
    "res-05-desc": "Books and long-form essays for citizens, students, and local-government practitioners — curated and annotated.",
    "res-05-action": "View list →",
    
    "res-06-kind": "Directory",
    "res-06-title": "Annual Reports — Where to Find Them",
    "res-06-desc": "A directory of where to find the comprehensive annual financial reports for U.S. cities, counties, and states.",
    "res-06-action": "Open directory →",
    
    // Contact Section
    "contact-eyebrow": "Get in touch",
    "contact-title": "For institutions, journalists,",
    "contact-title-accent": "and the curious citizen.",
    "contact-desc": "For speaking, writing collaborations, or to suggest a topic for How Public Money Works.",
    "contact-based-lbl": "Based",
    "contact-based": "São Paulo · Brasil",
    "contact-speaks-lbl": "Speaks",
    "contact-speaks": "English · Português",
    
    // Newsletter Section
    "news-eyebrow": "Publication updates",
    "news-title": "Email updates are",
    "news-title-accent": "coming soon.",
    "news-desc": "There is no subscription form yet. Until a real delivery service is available, new essays remain available in Insights.",
    "news-status": "Coming soon",
    "news-fine": "No spam. Just occasional updates when this becomes available.",
    
    // Footer Section
    "foot-desc": "Bringing clarity to public finance — for citizens, communities, and the institutions that serve them.",
    "foot-header-read": "Read",
    "foot-header-practice": "Practice",
    "foot-header-connect": "Connect",
    "foot-copyright": "© MMXXVI Eliana Faria Lima",
    "foot-tagline": "Bringing clarity to public finance.",
    "foot-featured-link": "Latest essays",
    "foot-category-link": "By category",
    "foot-glossary-soon": "Glossary · Coming soon",
    "foot-updates-link": "Updates · Coming soon",

    // Blog Index specific
    "blog-pre": "A Publication by Eliana Faria Lima",
    "blog-title": "How Public Money",
    "blog-title-accent": "Works.",
    "blog-tagline": "Bringing clarity to public finance.",
    "blog-vol": "An ongoing publication on public money and local government",
    "blog-browse": "Browse —",
    "blog-all-essays": "All Essays",
    "blog-twelve-essays": "Published essays",
    "blog-search-placeholder": "Search essays…",

    // Article Page specific
    "art-by": "By",
    "art-role": "Public Finance Specialist",
    "art-stats": "<b>8 min</b> read &nbsp;·&nbsp; <b>1,920</b> words &nbsp;·&nbsp; March MMXXVI",
    "art-hero-cap": "A budget is a public document. The question is not whether it can be read; it is whether it will be.",
    "art-author-title": "About the author",
    "art-author-desc": "A public finance specialist working across government budgeting and health governance. Editor of <i>How Public Money Works</i>, a publication that brings plain-language clarity to American public money — from city hall to state government.",
    "art-related-title": "More from the publication",
    "art-related-btn": "Browse all essays"
  },
  pt: {
    // Navigation
    "nav-home": "Início",
    "nav-about": "Sobre",
    "nav-focus": "Áreas",
    "nav-insights": "Publicações",
    "nav-resources": "Recursos",
    "nav-contact": "Contato",
    "nav-subscribe": "Atualizações",
    
    // Hero Section
    "hero-eyebrow": "Finanças Públicas e Educação Cívica",
    "hero-title-1": "Trazendo clareza",
    "hero-title-accent": "ao dinheiro público.",
    "hero-lede": "Eliana Faria Lima escreve e trabalha com finanças públicas, orçamento governamental, governança da saúde e transparência—transformando questões complexas sobre dinheiro público em orientação prática e acessível.",
    "hero-btn-essay": "Ler o Artigo Mais Recente",
    "hero-btn-about": "Sobre Eliana",
    "hero-strip-1": "Finanças Públicas",
    "hero-strip-2": "How Public Money Works · publicação contínua",
    "hero-strip-3": "Inglês / Português",
    "hero-caption": "Lumina Smart Strategies · Finanças públicas e educação cívica",
    "hero-card-label": "Da editora",
    "hero-card-quote": "O dinheiro público se torna mais útil quando as pessoas entendem as escolhas por trás dele.",
    "hero-card-author": "— Eliana Faria Lima",
    
    // Areas / Disciplines
    "areas-title": "Seis áreas,",
    "areas-title-accent": "um propósito claro.",
    "areas-lede": "O trabalho conecta a prática das finanças públicas à explicação cívica: como os recursos são arrecadados, orçados, governados e tornados compreensíveis.",
    "areas-practice-glance": "Áreas de foco — visão geral",
    
    "area-01-title": "Finanças Públicas",
    "area-01-desc": "Como os governos arrecadam, alocam e prestam contas dos recursos públicos, com atenção às variações locais.",
    "area-02-title": "Orçamento Governamental",
    "area-02-desc": "Como os orçamentos transformam prioridades públicas em planos, dotações, serviços e escolhas que os moradores podem examinar.",
    "area-03-title": "Governança da Saúde",
    "area-03-desc": "A conexão entre recursos públicos, responsabilidade institucional e os sistemas que apoiam a saúde da comunidade.",
    "area-04-title": "Modernização Fiscal",
    "area-04-desc": "Práticas, sistemas e informações públicas mais claros, que tornam a administração financeira mais fácil de entender.",
    "area-05-title": "Transparência & Prestação de Contas",
    "area-05-desc": "Documentos, decisões e processos de fiscalização que ajudam o público a ver como o dinheiro é administrado.",
    "area-06-title": "Educação Financeira Cívica",
    "area-06-desc": "Orientação em linguagem simples para moradores, contribuintes, pequenos empresários, estudantes e lideranças comunitárias.",
    "areas-read-more": "Saber mais →",
    
    // Featured Essay
    "featured-essay-eyebrow": "Artigo em Destaque · How Public Money Works",
    "featured-essay-title": "O que é um Orçamento Municipal",
    "featured-essay-title-accent": "— e por que você deve se importar?",
    "featured-essay-category": "Educação Cívica",
    "featured-essay-read-time": "8 min de leitura",
    "featured-essay-excerpt-1": "Todos os anos, sua cidade decide como gastar centenas de milhões de dólares — em ruas, escolas, bibliotecas, parques, caminhões de bombeiros, redes de água. Essa decisão se chama orçamento. Não é um documento técnico para contadores. É uma declaração pública de prioridades, escrita em números.",
    "featured-essay-excerpt-2": "Este artigo detalha como um orçamento municipal é construído, quem tem voz nele e o que um cidadão pode de fato ver ao ler um.",
    "featured-essay-btn": "Ler o artigo",
    "featured-caption": "Prefeitura · arquitetura pública cívica",
    
    // Blog section homepage
    "blog-sec-eyebrow": "Uma publicação de Eliana Faria Lima",
    "blog-sec-title": "Como Funciona o",
    "blog-sec-title-accent": "Dinheiro Público.",
    "blog-sec-tagline": "Trazendo clareza às finanças públicas.",
    "blog-sec-desc": "Artigos curtos e em linguagem simples sobre como o governo arrecada, gasta e presta contas do dinheiro público — da prefeitura ao capitólio estadual. Escrito para as pessoas que vivem com as consequências.",
    "blog-sec-btn-browse": "Navegar por todos os Artigos",
    "blog-sec-read-article": "Ler artigo →",
    
    // About Section
    "about-eyebrow": "Sobre",
    "about-title": "Experiência em finanças públicas,",
    "about-title-accent": "tornada útil",
    "about-title-end": " para mais leitores.",
    "about-p1": "Eliana Faria Lima é especialista em finanças públicas, e seu trabalho e sua escrita conectam orçamento governamental, governança da saúde, transparência e prestação de contas.",
    "about-p2": "Por meio do How Public Money Works, ela explica documentos públicos e conceitos financeiros para moradores, contribuintes, pequenos empresários, estudantes e profissionais interessados em cidadania—sem tratar exemplos locais como regras universais.",
    "about-quote": "O objetivo é prático: ajudar leitores a entender os documentos, as escolhas e as instituições por trás do dinheiro público.",
    "about-btn": "Falar com Eliana",
    "about-caption-1": "Eliana Faria Lima · Fundadora",
    "about-caption-2": "How Public Money Works · Educação cívica",
    
    // Resources Section
    "res-eyebrow": "Recursos",
    "res-title": "Uma pequena biblioteca,",
    "res-title-accent": "disponível gratuitamente.",
    
    "res-01-kind": "Referência",
    "res-01-title": "Glossário de Finanças Públicas",
    "res-01-desc": "Um A–Z em constante evolução dos termos de finanças públicas, em linguagem simples. De dotação a orçamento base zero.",
    "res-coming-soon": "Em breve",
    
    "res-02-kind": "Artigo-guia",
    "res-02-title": "Como Ler um Orçamento Municipal",
    "res-02-desc": "Um artigo em linguagem simples sobre o que é um orçamento municipal, como ele orienta escolhas públicas e por que vale a pena consultá-lo.",
    "res-02-action": "Ler artigo →",
    
    "res-03-kind": "Artigo-guia",
    "res-03-title": "Para Onde Vão os Seus Impostos Locais?",
    "res-03-desc": "Um guia conceitual sobre fontes de receita, governos locais, fundos e os serviços que eles sustentam.",
    "res-03-action": "Ler artigo →",
    
    "res-04-kind": "Índice",
    "res-04-title": "Portais de Dados Abertos — Um Mapa",
    "res-04-desc": "Onde encontrar os dados financeiros publicados de sua cidade, condado e estado — com observações sobre o que cada portal oferece.",
    "res-04-action": "Abrir índice →",
    
    "res-05-kind": "Bibliografia",
    "res-05-title": "Lista de Leitura · Finanças Cívicas",
    "res-05-desc": "Livros e artigos de fôlego para cidadãos, estudantes e profissionais de governos locais — curados e anotados.",
    "res-05-action": "Ver lista →",
    
    "res-06-kind": "Diretório",
    "res-06-title": "Relatórios Anuais — Onde Encontrá-los",
    "res-06-desc": "Um diretório de onde encontrar os relatórios financeiros anuais abrangentes de cidades, condados e estados dos EUA.",
    "res-06-action": "Abrir diretório →",
    
    // Contact Section
    "contact-eyebrow": "Contato",
    "contact-title": "Para instituições, jornalistas",
    "contact-title-accent": "e o cidadão curioso.",
    "contact-desc": "Para palestras, parcerias de escrita ou para sugerir um tema para How Public Money Works.",
    "contact-based-lbl": "Sede",
    "contact-based": "São Paulo · Brasil",
    "contact-speaks-lbl": "Idiomas",
    "contact-speaks": "Inglês · Português",
    
    // Newsletter Section
    "news-eyebrow": "Atualizações da publicação",
    "news-title": "As atualizações por e-mail",
    "news-title-accent": "chegarão em breve.",
    "news-desc": "Ainda não há formulário de inscrição. Até existir um serviço real de envio, os novos artigos continuam disponíveis em Publicações.",
    "news-status": "Em breve",
    "news-fine": "Sem spam. Apenas atualizações ocasionais quando este recurso estiver disponível.",
    
    // Footer Section
    "foot-desc": "Trazendo clareza às finanças públicas — para cidadãos, comunidades e as instituições que os servem.",
    "foot-header-read": "Ler",
    "foot-header-practice": "Prática",
    "foot-header-connect": "Conectar",
    "foot-copyright": "© MMXXVI Eliana Faria Lima",
    "foot-tagline": "Trazendo clareza às finanças públicas.",
    "foot-featured-link": "Artigos mais recentes",
    "foot-category-link": "Por categoria",
    "foot-glossary-soon": "Glossário · Em breve",
    "foot-updates-link": "Atualizações · Em breve",

    // Blog Index specific
    "blog-pre": "Uma Publicação por Eliana Faria Lima",
    "blog-title": "Como Funciona o",
    "blog-title-accent": "Dinheiro Público.",
    "blog-tagline": "Trazendo clareza às finanças públicas.",
    "blog-vol": "Uma publicação contínua sobre dinheiro público e governo local",
    "blog-browse": "Navegar —",
    "blog-all-essays": "Todos os Artigos",
    "blog-twelve-essays": "Artigos publicados",
    "blog-search-placeholder": "Buscar artigos…",

    // Article Page specific
    "art-by": "Por",
    "art-role": "Especialista em Finanças Públicas",
    "art-stats": "<b>8 min</b> de leitura &nbsp;·&nbsp; <b>1.920</b> palavras &nbsp;·&nbsp; Março MMXXVI",
    "art-hero-cap": "Um orçamento é um documento público. A questão não é se ele pode ser lido; é se ele será.",
    "art-author-title": "Sobre a autora",
    "art-author-desc": "Especialista em finanças públicas, orçamento governamental e governança da saúde. Editora do <i>How Public Money Works</i>, uma publicação que traz clareza e linguagem simples ao funcionamento das finanças públicas — da prefeitura ao governo estadual.",
    "art-related-title": "Mais da publicação",
    "art-related-btn": "Navegar por todos os artigos"
  }
};

document.addEventListener("DOMContentLoaded", () => {
  // 1. Setup Mobile Menu Toggle
  const toggleBtn = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");
  
  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener("click", () => {
      navLinks.classList.toggle("open");
      toggleBtn.setAttribute("aria-expanded", String(navLinks.classList.contains("open")));
    });
  }

  // Close mobile nav when link is clicked
  const navItems = document.querySelectorAll(".nav-links a");
  navItems.forEach(item => {
    item.addEventListener("click", () => {
      if (navLinks) navLinks.classList.remove("open");
      if (toggleBtn) toggleBtn.setAttribute("aria-expanded", "false");
    });
  });

  // 2. Setup Bilingual Language System
  const langSwitch = document.querySelector(".lang-switch");
  const pageLanguage = document.body.getAttribute("data-content-language");
  let currentLang = pageLanguage || localStorage.getItem("eliana-site-lang") || "en";

  const applyLanguage = (lang) => {
    if (!TRANSLATIONS[lang]) lang = "en";
    currentLang = lang;
    localStorage.setItem("eliana-site-lang", lang);
    document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";

    // Update switcher visuals
    if (langSwitch) {
      langSwitch.querySelectorAll("[data-lang]").forEach(el => {
        const isActive = el.getAttribute("data-lang") === lang.toUpperCase();
        el.classList.toggle("on", isActive);
        if (el.tagName === "BUTTON") el.setAttribute("aria-pressed", String(isActive));
      });
    }

    // Translate all elements marked with data-translate
    const translatableElements = document.querySelectorAll("[data-translate]");
    translatableElements.forEach(el => {
      const key = el.getAttribute("data-translate");
      if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
        el.innerHTML = TRANSLATIONS[lang][key];
      }
    });

    document.querySelectorAll("[data-localize-text]").forEach(el => {
      const value = el.getAttribute(`data-text-${lang}`);
      if (value !== null) el.textContent = value;
    });

    document.querySelectorAll("[data-localize-link]").forEach(el => {
      const value = el.getAttribute(`data-href-${lang}`);
      if (value) el.setAttribute("href", value);
    });

    document.querySelectorAll("[data-localize-alt]").forEach(el => {
      const value = el.getAttribute(`data-alt-${lang}`);
      if (value !== null) el.setAttribute("alt", value);
    });

    document.querySelectorAll("[data-localize-aria-label]").forEach(el => {
      const value = el.getAttribute(`data-aria-label-${lang}`);
      if (value !== null) el.setAttribute("aria-label", value);
    });

    const searchInput = document.querySelector(".search input");
    if (searchInput && TRANSLATIONS[lang]["blog-search-placeholder"]) {
      searchInput.placeholder = TRANSLATIONS[lang]["blog-search-placeholder"];
    }
  };

  // Bind clicks on language switch
  if (langSwitch) {
    langSwitch.addEventListener("click", (e) => {
      const target = e.target.closest("[data-lang]");
      if (!target) return;
      const langAttr = target.getAttribute("data-lang");
      if (langAttr) {
        applyLanguage(langAttr.toLowerCase());
      }
    });
  }

  // Initial language application
  applyLanguage(currentLang);

  // 3. Setup Blog Category Filtering and live search (Only runs on insights.html)
  const categoryChips = document.querySelectorAll(".filter-bar .cat");
  const articleGrid = document.querySelector(".all-essays .grid");
  const searchInput = document.querySelector(".search input");

  if (categoryChips.length > 0 && articleGrid) {
    const articleCards = articleGrid.querySelectorAll("article, .essay-card");

    const filterArticles = () => {
      const activeChip = document.querySelector(".filter-bar .cat.on");
      const activeCategory = activeChip ? activeChip.textContent.trim().toLowerCase() : "all";
      const searchText = searchInput ? searchInput.value.toLowerCase().trim() : "";

      articleCards.forEach(card => {
        const cardCategory = card.getAttribute("data-category") ? card.getAttribute("data-category").toLowerCase() : "";
        const cardTitle = card.querySelector("h3").textContent.toLowerCase();
        const cardExcerpt = card.querySelector("p").textContent.toLowerCase();
        
        const matchesCategory = (activeCategory === "all" || cardCategory.includes(activeCategory));
        const matchesSearch = (cardTitle.includes(searchText) || cardExcerpt.includes(searchText));

        if (matchesCategory && matchesSearch) {
          card.style.display = "flex";
          // Smooth fade-in
          setTimeout(() => { card.style.opacity = "1"; }, 10);
        } else {
          card.style.opacity = "0";
          card.style.display = "none";
        }
      });
    };

    // Category click listener
    categoryChips.forEach(chip => {
      chip.addEventListener("click", () => {
        categoryChips.forEach(c => c.classList.remove("on"));
        chip.classList.add("on");
        filterArticles();
      });
    });

    // Search input typing listener
    if (searchInput) {
      searchInput.addEventListener("input", filterArticles);
    }
  }

});
