# Assumptions

Based on the handoff bundle from Claude Design and the user's instructions, we have made the following technical and business assumptions for the development of Eliana Faria Lima's website:

## 1. Chosen Design Concept
* **Concept B (Civic Modern)** is the selected direction as recommended by the Claude Design feedback. 
* It features warm ivory tones (`#FBF7EC`), deep navy accents (`#0C1A2C`), and sober gold lines (`#A88752`), conveying professional authority, warmth, and high accessibility.

## 2. Core Site Pages & Architecture
The production website will consist of:
1. **Homepage (`index.html`)**: Adapted from `home-civic.html`, acting as the main portal with biography, disciplines, featured essay, resources, and contact.
2. **Blog Index (`insights.html`)**: The listing page for the "How Public Money Works" publication, with fully working category filters and a search input.
3. **Blog Post (`article-city-budget.html`)**: The reading page for "What Is a City Budget and Why Should You Care?", utilizing premium editorial typesetting (drop caps, key terms, pulling quotes, budget anatomy diagram).

## 3. Bilingual Support (EN / PT)
* The site features a language switcher (`EN/PT`). 
* To deliver a **wow** factor, we will implement full client-side bilingual toggling. We will translate the core copy of the layout (menus, call-to-actions, buttons, headers) into Portuguese, allowing seamless transitions.

## 4. Responsive Design & Visual Polish
* The original prototypes contain static viewport tags (`<meta name="viewport" content="width=1440" />`). We will adapt these to be fully responsive (`width=device-width, initial-scale=1.0`) so they look stunning on mobile, tablet, and desktop viewports.
* We will preserve all premium design elements: HSL-curated warm color palette, custom Google Fonts (`Playfair Display`, `Libre Caslon Text`, `Inter`), subtle micro-animations for hover states, and smooth SVG illustrations.

## 5. Technology Stack
* Following developer guidelines, we will build this using pure, modern **HTML5, vanilla CSS3**, and **vanilla JavaScript** for premium speed, ease of hosting, and absolute control.

## 6. SEO & Social Metadata (Pre-Publication Requirement)
* Before any public staging or production deployment, all three public HTML files (`index.html`, `insights.html`, `article-city-budget.html`) must have:
  - `<meta name="description">` with tailored copy per page
  - `<link rel="canonical">` pointing to the production domain
  - Full **Open Graph** tags (`og:type`, `og:url`, `og:title`, `og:description`, `og:image`, `og:site_name`, `og:locale`)
  - Full **Twitter Card** tags (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`)
  - For article pages: additional `article:author`, `article:published_time`, `article:section`, `article:tag` OG properties
* The assumed production domain is `https://elianafariasima.com` — **update canonical URLs before go-live** if the domain differs.

## 7. Admin Editor Access Control
* `admin-editor.html` must **never be indexed or publicly linked**. 
* A client-side passcode gate (`localStorage` token) is implemented to prevent casual access.
* For production: add HTTP Basic Auth or move to a password-protected subdirectory at the server level.

