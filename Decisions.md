# Decisions

This document records the architectural and implementation decisions for the website of Eliana Faria Lima.

## 1. Directory Structure
To keep the site clean, fast, and simple to deploy, we have chosen the following structure:
```
/
├── index.html                   # Home Page (Concept B - Civic Modern)
├── insights.html                # Blog Index / Publications List
├── article-city-budget.html     # First Blog Post Template
├── Assumptions.md               # Project Assumptions (Mandatory)
├── Decisions.md                 # Technical Decisions (Mandatory)
├── DONE.md                      # Accomplished Tasks list (Mandatory)
├── README.md                    # Project Documentation
├── shared/
│   └── base.css                 # Core CSS Design System
└── assets/
    └── eliana-portrait.jpeg     # Portrait photo of Eliana
```

## 2. Responsive Web Design (RWD)
* **Problem**: The prototype from Claude Design was styled specifically for a static desktop width of `1440px`.
* **Decision**: We will refactor the CSS in `base.css` and the specific pages to replace hardcoded pixel widths with responsive units (like percentage, flexbox, CSS grid, and `clamp()` for typography). Navbars, grids, hero columns, and footer structures will stack beautifully on mobile viewports while maintaining their premium editorial proportion on large screens.

## 3. Bilingual Copy Engine
* **Decision**: Implement a native, lightweight bilingual switcher using JavaScript.
* **Mechanism**: 
  - Add standard `data-en` and `data-pt` attributes to translatable elements.
  - On page load, read the user's preferred language (defaulting to English or browser language).
  - Clicking `EN` or `PT` in the navigation bar will instantly switch the text content of all translatable elements with a fade-in/fade-out micro-animation.
  - Store the language preference in `localStorage` so it persists across page navigations.

## 4. Blog Index Interactive Category Filtering & Search
* **Decision**: Implement client-side filtering and live search directly in the browser using JavaScript.
* **Mechanism**:
  - Add data attributes `data-category` to each article card in `insights.html`.
  - When a user clicks a category tag (e.g. "Civic Education", "Property Tax", "Transparency"), the script will toggle visibility of the article cards using simple class switches.
  - The search input will perform case-insensitive character matching against titles and excerpts, hiding cards that do not match in real time with smooth CSS transitions.

## 5. Performance and Hosting
* **Decision**: The entire site is static and can be served directly from GitHub Pages, Vercel, Netlify, or a basic Apache/Nginx web server. 
* No build process is required, making loading instantaneous and ensuring perfect SEO tags and semantic markup work right out of the box.

## 6. Evolução para Lumina Smart Strategies (B2B)
* **Problem**: O site original focava no perfil pessoal de Eliana Faria Lima.
* **Decision**: A página principal (`index.html`) foi transformada no hub corporativo da Lumina Smart Strategies LLC, promovendo serviços de modernização fiscal e auditoria (conforme o Business Plan). O blog "How Public Money Works" foi isolado em uma seção exclusiva (`insights.html`), mantendo as raízes educacionais de Eliana mas separando claramente o funil de aquisição corporativo do consumo de conteúdo editorial.
