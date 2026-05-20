# CODING AGENTS: READ THIS FIRST

This is a **handoff bundle** from Claude Design (claude.ai/design).

A user mocked up designs in HTML/CSS/JS using an AI design tool, then exported this bundle so a coding agent can implement the designs for real.

## What you should do — IMPORTANT

**Read `banner-linkedin-eliana/project/Eliana - Website Concepts.html` in full.** The user had this file open when they triggered the handoff, so it's almost certainly the primary design they want built. Read it top to bottom — don't skim. Then **follow its imports**: open every file it pulls in (shared components, CSS, scripts) so you understand how the pieces fit together before you start implementing.

**If anything is ambiguous, ask the user to confirm before you start implementing.** It's much cheaper to clarify scope up front than to build the wrong thing.

## About the design files

The design medium is **HTML/CSS/JS** — these are prototypes, not production code. Your job is to **recreate them pixel-perfectly** in whatever technology makes sense for the target codebase (React, Vue, native, whatever fits). Match the visual output; don't copy the prototype's internal structure unless it happens to fit.

**Don't render these files in a browser or take screenshots unless the user asks you to.** Everything you need — dimensions, colors, layout rules — is spelled out in the source. Read the HTML and CSS directly; a screenshot won't tell you anything they don't.

## Bundle contents

- `banner-linkedin-eliana/README.md` — this file
- `banner-linkedin-eliana/project/` — the `Banner LinkedIn Eliana` project files (HTML prototypes, assets, components)

---

# PRODUCTION WEBSITE

The production website for **Eliana Faria Lima** has been successfully built and is located in the workspace root. It leverages the Civic Modern design concept, featuring high responsiveness, fully functional bilingual toggles (EN / PT), dynamic blog category filtering, live article search, and a quiet newsletter subscription form.

## Production Files

*   **`index.html`**: The main homepage portal. Features bilingual copy sections, dynamic SVG vectors, biography, focus disciplines, resources grid, and contact links.
*   **`insights.html`**: The blog listing and insights index. Connects live category filtering and search in vanilla JS.
*   **`article-city-budget.html`**: The reading layout for the first blog post "What Is a City Budget and Why Should You Care?". Employs premium editorial typesetting, anatomical diagrams, drop caps, and key term callouts.
*   **`shared/base.css`**: The core, responsive layout styling incorporating HSL colors, Google Fonts, and fluid viewport adjustments.
*   **`shared/main.js`**: Core script handling client-side language switching (EN/PT), mobile nav toggles, blog category filters, live search, and newsletter subscriptions.
*   **`assets/eliana-portrait.jpeg`**: Portrait photo of Eliana.

## Mandatory Architectural Documents

*   [Assumptions.md](file:///c:/Projetos/SITES/banner-linkedin-eliana/Assumptions.md)
*   [Decisions.md](file:///c:/Projetos/SITES/banner-linkedin-eliana/Decisions.md)
*   [DONE.md](file:///c:/Projetos/SITES/banner-linkedin-eliana/DONE.md)

