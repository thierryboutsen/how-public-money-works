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
    "nav-subscribe": "Subscribe",
    
    // Hero Section
    "hero-eyebrow": "A Practice in Public Finance",
    "hero-title-1": "Bringing clarity",
    "hero-title-accent": "to public money.",
    "hero-lede": "For more than a decade, Eliana Faria Lima has worked at the intersection of public finance, government budgeting, and health governance — translating the language of public money into something a citizen can read.",
    "hero-btn-essay": "Read the Featured Essay",
    "hero-btn-about": "About Eliana",
    "hero-strip-1": "13+ years · public-sector practice",
    "hero-strip-2": "How Public Money Works · ongoing publication",
    "hero-strip-3": "EN / PT · bilingual practice",
    "hero-caption": "Documentary editorial photography · placeholder",
    "hero-card-label": "From the editor",
    "hero-card-quote": "A budget is a city's most honest piece of writing.",
    "hero-card-author": "— Eliana Faria Lima",
    
    // Areas / Disciplines
    "areas-title": "Six disciplines,",
    "areas-title-accent": "one practice.",
    "areas-lede": "The work that follows is one continuous body of thinking — on how public money is raised, spent, and made visible to the people it serves.",
    "areas-practice-glance": "Areas of practice — at a glance",
    
    "area-01-title": "Public Finance",
    "area-01-desc": "The economics of how governments raise, allocate, and account for public resources — from local treasuries to national systems.",
    "area-02-title": "Government Budgeting",
    "area-02-desc": "Designing, executing, and explaining budgets that translate political intent into operational reality.",
    "area-03-title": "Health Governance",
    "area-03-desc": "The financing and stewardship of public health systems — where fiscal decisions become matters of life and care.",
    "area-04-title": "Fiscal Modernization",
    "area-04-desc": "Re-engineering the practices, systems, and culture of public-sector finance for clarity, integrity, and resilience.",
    "area-05-title": "Transparency & Accountability",
    "area-05-desc": "Making the workings of public money visible — so that scrutiny becomes possible and trust becomes earned.",
    "area-06-title": "Civic Financial Education",
    "area-06-desc": "Bringing the language of public finance into civic life — for citizens, students, and community leaders.",
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
    "featured-caption": "Town hall · budget hearing · placeholder",
    
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
    "about-title": "A career spent",
    "about-title-accent": "reading budgets aloud,",
    "about-title-end": " so that more people can.",
    "about-p1": "For more than a decade, Eliana Faria Lima has worked at the intersection of public finance, government budgeting, and health governance — designing fiscal systems, advising public administrations, and writing on accountability and transparency.",
    "about-p2": "Her current work focuses on bringing American public-finance literacy into reach of the people it most affects: residents, small-business owners, students, civic organizations, and community leaders who live with the consequences of how budgets are written.",
    "about-quote": "The goal is simple, and the method is patient: clear language, plain numbers, and the conviction that public money belongs to the public.",
    "about-btn": "Read full biography",
    "about-caption-1": "Eliana Faria Lima · Portrait",
    "about-caption-2": "Context · placeholder",
    
    // Resources Section
    "res-eyebrow": "Resources",
    "res-title": "A small library,",
    "res-title-accent": "freely available.",
    
    "res-01-kind": "Reference",
    "res-01-title": "Glossary of Public Finance",
    "res-01-desc": "An evolving A–Z of public-finance terms, in plain English. From appropriation to zero-based budgeting.",
    "res-01-action": "Open glossary →",
    
    "res-02-kind": "Guide",
    "res-02-title": "How to Read a City Budget",
    "res-02-desc": "A short, illustrated guide to finding the four numbers that matter most in any municipal budget document.",
    "res-02-action": "Read guide →",
    
    "res-03-kind": "Primer",
    "res-03-title": "Understanding Property Tax",
    "res-03-desc": "What it is, how it's set, who decides, and where the money goes — for homeowners, renters, and small businesses.",
    "res-03-action": "Read primer →",
    
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
    "contact-desc": "For speaking, consulting, writing collaborations, or to suggest a topic for How Public Money Works.",
    "contact-based-lbl": "Based",
    "contact-based": "São Paulo · Brasil",
    "contact-speaks-lbl": "Speaks",
    "contact-speaks": "English · Português",
    
    // Newsletter Section
    "news-eyebrow": "Quietly delivered",
    "news-title": "One essay,",
    "news-title-accent": "once a month.",
    "news-desc": "A short, plain-language note from the practice — never more than once a month, never promotional.",
    "news-placeholder": "your.email@example.com",
    "news-btn": "Subscribe",
    "news-fine": "No tracking, no third parties, no noise.",
    "news-success": "Thank you! You have successfully subscribed to the publication.",
    
    // Footer Section
    "foot-desc": "Bringing clarity to public finance — for citizens, communities, and the institutions that serve them.",
    "foot-header-read": "Read",
    "foot-header-practice": "Practice",
    "foot-header-connect": "Connect",
    "foot-copyright": "© MMXXVI Eliana Faria Lima",
    "foot-tagline": "Bringing clarity to public finance.",

    // Blog Index specific
    "blog-pre": "A Publication by Eliana Faria Lima",
    "blog-title": "How Public Money",
    "blog-title-accent": "Works.",
    "blog-tagline": "Bringing clarity to public finance.",
    "blog-vol": "Vol. I · Twelve Essays · EN — bilingual editions to follow",
    "blog-browse": "Browse —",
    "blog-all-essays": "All Essays",
    "blog-twelve-essays": "— Twelve essays in Volume I",
    "blog-search-placeholder": "Search essays…",

    // Article Page specific
    "art-by": "By",
    "art-role": "Senior Practice, Public Finance",
    "art-stats": "<b>8 min</b> read &nbsp;·&nbsp; <b>1,920</b> words &nbsp;·&nbsp; March MMXXVI",
    "art-hero-cap": "A budget is a public document. The question is not whether it can be read; it is whether it will be.",
    "art-author-title": "About the author",
    "art-author-desc": "A senior practice in public finance, government budgeting, and health governance. Editor of <i>How Public Money Works</i>, a publication that brings plain-language clarity to the workings of American public money — from city hall to state capitol.",
    "art-related-title": "More from this volume",
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
    "nav-subscribe": "Inscrever-se",
    
    // Hero Section
    "hero-eyebrow": "Uma Prática em Finanças Públicas",
    "hero-title-1": "Trazendo clareza",
    "hero-title-accent": "ao dinheiro público.",
    "hero-lede": "Por mais de uma década, Eliana Faria Lima tem trabalhado na interseção de finanças públicas, orçamento governamental e governança de saúde — traduzindo a linguagem do dinheiro público para algo que um cidadão possa ler.",
    "hero-btn-essay": "Ler o Artigo de Destaque",
    "hero-btn-about": "Sobre Eliana",
    "hero-strip-1": "13+ anos · prática no setor público",
    "hero-strip-2": "How Public Money Works · publicação contínua",
    "hero-strip-3": "EN / PT · prática bilíngue",
    "hero-caption": "Fotografia documental editorial · marcador de posição",
    "hero-card-label": "Da editora",
    "hero-card-quote": "Um orçamento é o texto mais honesto que uma cidade produz.",
    "hero-card-author": "— Eliana Faria Lima",
    
    // Areas / Disciplines
    "areas-title": "Seis disciplinas,",
    "areas-title-accent": "uma prática.",
    "areas-lede": "O trabalho que se segue é um corpo contínuo de pensamento — sobre como o dinheiro público é arrecadado, gasto e tornado visível para as pessoas a quem serve.",
    "areas-practice-glance": "Áreas de atuação — visão geral",
    
    "area-01-title": "Finanças Públicas",
    "area-01-desc": "A economia de como os governos arrecadam, alocam e prestam contas dos recursos públicos — de tesourarias locais a sistemas nacionais.",
    "area-02-title": "Orçamento Governamental",
    "area-02-desc": "Projetar, executar e explicar orçamentos que traduzem a intenção política em realidade operacional.",
    "area-03-title": "Governança da Saúde",
    "area-03-desc": "O financiamento e gestão dos sistemas públicos de saúde — onde as decisões fiscais se tornam questões de vida e cuidado.",
    "area-04-title": "Modernização Fiscal",
    "area-04-desc": "Reengenharia de práticas, sistemas e cultura das finanças do setor público para clareza, integridade e resiliência.",
    "area-05-title": "Transparência & Prestação de Contas",
    "area-05-desc": "Tornar visível o funcionamento do dinheiro público — para que o escrutínio se torne possível e a confiança seja conquistada.",
    "area-06-title": "Educação Financeira Cívica",
    "area-06-desc": "Trazer a linguagem das finanças públicas para a vida cívica — para cidadãos, estudantes e líderes comunitários.",
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
    "featured-caption": "Reunião comunitária · audiência pública · marcador de posição",
    
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
    "about-title": "Uma carreira dedicada a",
    "about-title-accent": "ler orçamentos em voz alta,",
    "about-title-end": " para que mais pessoas possam ler também.",
    "about-p1": "Por mais de uma década, Eliana Faria Lima tem trabalhado na interseção de finanças públicas, orçamento governamental e governança de saúde — projetando sistemas fiscais, prestando assessoria a administrações públicas e escrevendo sobre integridade e transparência.",
    "about-p2": "Seu trabalho atual foca em trazer a alfabetização em finanças públicas ao alcance das pessoas que ela mais afeta: moradores, pequenos empresários, estudantes, organizações cívicas e líderes comunitários que vivem com as consequências de como os orçamentos são escritos.",
    "about-quote": "O objetivo é simples, e o método é paciente: linguagem clara, números simples e a convicção de que o dinheiro público pertence ao público.",
    "about-btn": "Ler biografia completa",
    "about-caption-1": "Eliana Faria Lima · Retrato",
    "about-caption-2": "Contexto · marcador de posição",
    
    // Resources Section
    "res-eyebrow": "Recursos",
    "res-title": "Uma pequena biblioteca,",
    "res-title-accent": "disponível gratuitamente.",
    
    "res-01-kind": "Referência",
    "res-01-title": "Glossário de Finanças Públicas",
    "res-01-desc": "Um A–Z em constante evolução dos termos de finanças públicas, em linguagem simples. De dotação a orçamento base zero.",
    "res-01-action": "Abrir glossário →",
    
    "res-02-kind": "Guia",
    "res-02-title": "Como Ler um Orçamento Municipal",
    "res-02-desc": "Um guia curto e ilustrado para encontrar os quatro números que mais importam em qualquer documento de orçamento municipal.",
    "res-02-action": "Ler guia →",
    
    "res-03-kind": "Manual",
    "res-03-title": "Entendendo o Imposto Predial",
    "res-03-desc": "O que é, como é definido, quem decide e para onde vai o dinheiro — para proprietários, inquilinos e pequenas empresas.",
    "res-03-action": "Ler manual →",
    
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
    "contact-desc": "Para palestras, consultorias, parcerias de escrita ou para sugerir um tema para How Public Money Works.",
    "contact-based-lbl": "Sede",
    "contact-based": "São Paulo · Brasil",
    "contact-speaks-lbl": "Idiomas",
    "contact-speaks": "Inglês · Português",
    
    // Newsletter Section
    "news-eyebrow": "Enviado silenciosamente",
    "news-title": "Um artigo,",
    "news-title-accent": "uma vez por mês.",
    "news-desc": "Uma nota curta e em linguagem simples direto da prática — no máximo uma vez por mês, nunca promocional.",
    "news-placeholder": "seu.email@exemplo.com",
    "news-btn": "Inscrever-se",
    "news-fine": "Sem rastreamento, sem terceiros, sem ruído.",
    "news-success": "Obrigado! Sua inscrição foi realizada com sucesso.",
    
    // Footer Section
    "foot-desc": "Trazendo clareza às finanças públicas — para cidadãos, comunidades e as instituições que os servem.",
    "foot-header-read": "Ler",
    "foot-header-practice": "Prática",
    "foot-header-connect": "Conectar",
    "foot-copyright": "© MMXXVI Eliana Faria Lima",
    "foot-tagline": "Trazendo clareza às finanças públicas.",

    // Blog Index specific
    "blog-pre": "Uma Publicação por Eliana Faria Lima",
    "blog-title": "Como Funciona o",
    "blog-title-accent": "Dinheiro Público.",
    "blog-tagline": "Trazendo clareza às finanças públicas.",
    "blog-vol": "Vol. I · Doze Artigos · EN — edições bilíngues em breve",
    "blog-browse": "Navegar —",
    "blog-all-essays": "Todos os Artigos",
    "blog-twelve-essays": "— Doze artigos no Volume I",
    "blog-search-placeholder": "Buscar artigos…",

    // Article Page specific
    "art-by": "Por",
    "art-role": "Especialista Sênior, Finanças Públicas",
    "art-stats": "<b>8 min</b> de leitura &nbsp;·&nbsp; <b>1.920</b> palavras &nbsp;·&nbsp; Março MMXXVI",
    "art-hero-cap": "Um orçamento é um documento público. A questão não é se ele pode ser lido; é se ele será.",
    "art-author-title": "Sobre a autora",
    "art-author-desc": "Especialista sênior em finanças públicas, orçamento governamental e governança da saúde. Editora do <i>How Public Money Works</i>, uma publicação que traz clareza e linguagem simples ao funcionamento das finanças públicas — da prefeitura ao capitólio estadual.",
    "art-related-title": "Mais deste volume",
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
    });
  }

  // Close mobile nav when link is clicked
  const navItems = document.querySelectorAll(".nav-links a");
  navItems.forEach(item => {
    item.addEventListener("click", () => {
      if (navLinks) navLinks.classList.remove("open");
    });
  });

  // 2. Setup Bilingual Language System
  const langSwitch = document.querySelector(".lang-switch");
  const pageLanguage = document.body.getAttribute("data-content-language");
  let currentLang = pageLanguage || localStorage.getItem("eliana-site-lang") || "en";

  const applyLanguage = (lang) => {
    currentLang = lang;
    localStorage.setItem("eliana-site-lang", lang);

    // Update switcher visuals
    if (langSwitch) {
      langSwitch.querySelectorAll("[data-lang]").forEach(el => el.classList.remove("on"));
      const activeSpan = langSwitch.querySelector(`span[data-lang="${lang.toUpperCase()}"]`);
      if (activeSpan) activeSpan.classList.add("on");
    }

    // Translate all elements marked with data-translate
    const translatableElements = document.querySelectorAll("[data-translate]");
    translatableElements.forEach(el => {
      const key = el.getAttribute("data-translate");
      if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
        el.classList.add("lang-fade-out");
        setTimeout(() => {
          el.innerHTML = TRANSLATIONS[lang][key];
          el.classList.remove("lang-fade-out");
        }, 150);
      }
    });

    // Translate placeholder inputs (such as search and email fields)
    const emailInput = document.querySelector("input[type='email']");
    if (emailInput) {
      emailInput.placeholder = TRANSLATIONS[lang]["news-placeholder"];
    }

    const searchInput = document.querySelector(".search input");
    if (searchInput && TRANSLATIONS[lang]["blog-search-placeholder"]) {
      searchInput.placeholder = TRANSLATIONS[lang]["blog-search-placeholder"];
    }
  };

  // Bind clicks on language switch
  if (langSwitch) {
    langSwitch.addEventListener("click", (e) => {
      const target = e.target;
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

  // 4. Newsletter Form submission micro-interaction
  const newsForms = document.querySelectorAll(".newsletter form");
  newsForms.forEach(form => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = form.querySelector("input");
      const button = form.querySelector("button");
      const email = input ? input.value : "";

      if (email) {
        form.innerHTML = `<div style="padding: 16px; border: 1px solid var(--gold); background: rgba(168,135,82,0.06); font-family: var(--font-display); font-style: italic; font-size: 18px; color: var(--gold-deep); text-align: center; width: 100%; animation: fadeIn 0.4s ease;">
          ${TRANSLATIONS[currentLang]["news-success"]}
        </div>`;
      }
    });
  });
});
