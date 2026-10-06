---
name: clone-website-static
description: Reverse-engineer and clone one or more websites as pixel-perfect static HTML/CSS/JS replicas — no framework, no build step, opens directly in any browser. Use this whenever the user wants to clone a website as plain HTML, static files, "no framework", "just HTML", or "vanilla JS". Provide one or more target URLs as arguments.
argument-hint: "<url1> [<url2> ...]"
user-invocable: true
---

# Clone Website — Static HTML/CSS/JS

You are about to reverse-engineer and rebuild **$ARGUMENTS** as pixel-perfect static clones using only HTML, CSS, and vanilla JavaScript.

No React. No TypeScript. No build step. The output opens directly in any browser.

When multiple URLs are provided, each becomes its own set of HTML/CSS/JS files under a namespaced output directory. Parallelize page work only after the shared foundation and output plan are fixed so concurrent builders cannot overwrite one another.

This is not a two-phase process (inspect then build). You are a **foreman walking the job site** — as you inspect each section of the page, you write a detailed specification to a file, then hand that file to a specialist builder agent with everything they need. Extraction and construction happen in parallel, but extraction is meticulous and produces auditable artifacts.

## Scope Defaults

The target is whatever page `$ARGUMENTS` resolves to. Clone exactly what's visible at that URL. Unless the user specifies otherwise:

- **Fidelity level:** Pixel-perfect — exact match in colors, spacing, typography, animations
- **Output format:** Vanilla HTML5 + CSS (custom properties, no preprocessors) + ES6+ JavaScript (no bundler)
- **In scope:** Visual layout and styling, component structure and interactions, responsive design, mock data for demo purposes
- **Out of scope:** Real backend / database, authentication, real-time features, server-side rendering, Node.js dependencies
- **Customization:** None — pure emulation

If the user provides additional instructions (specific fidelity, extra context), honor those over the defaults.

## Output Isolation and Naming

### Site Key & Page Key

Assign each target URL:

- A collision-resistant **`<site-key>`**: readable origin slug + first 8 lowercase hex characters of SHA-256 over the normalized origin. Example: `linear-app-a1b2c3d4`.
- A collision-resistant **`<page-key>`**: segment-preserving readable pathname slug + first 8 hex characters of SHA-256 over the normalized pathname. Use `root-<hash>` for `/`. Example: `features-e5f6g7h8`.

### Output Directory Structure

All output lives under `output/<site-key>/`:

```
output/
└── <site-key>/
    ├── index.html                        ← Root page (or <page-key>.html for non-root pages)
    ├── <page-key>.html                   ← Additional pages
    │
    ├── css/
    │   ├── variables.css                 ← Design tokens as CSS custom properties
    │   ├── reset.css                     ← Normalize/reset
    │   ├── fonts.css                     ← @font-face or Google Fonts @import
    │   ├── global.css                    ← Body, typography, utility classes
    │   └── components/
    │       ├── nav.css
    │       ├── hero.css
    │       ├── footer.css
    │       └── <section-name>.css        ← One file per section
    │
    ├── js/
    │   ├── main.js                       ← Entry point, initializes everything
    │   └── components/
    │       ├── nav.js                    ← Scroll behavior, mobile menu
    │       ├── carousel.js               ← Sliders, tabs, cycling content
    │       └── <section-name>.js         ← One file per interactive section
    │
    ├── assets/
    │   ├── images/                       ← All downloaded images (webp, png, jpg, svg)
    │   ├── videos/                       ← Downloaded videos
    │   └── fonts/                        ← Self-hosted fonts (if applicable)
    │
    └── docs/
        ├── research/
        │   ├── BEHAVIORS.md              ← All animations & interactions
        │   ├── PAGE_TOPOLOGY.md          ← Section map top-to-bottom
        │   └── components/
        │       └── <component>.spec.md   ← Spec file per section/component
        └── design-references/
            ├── desktop-1440.png
            └── mobile-390.png
```

Every path in each HTML file must be **relative** so the output folder is portable (drag to desktop, open in browser — it just works).

Before writing, verify every planned output file path is unique and no two pages share the same asset namespace.

## Pre-Flight

1. **Browser automation is required.** Check for available browser MCP tools (Chrome MCP, Playwright MCP, Browserbase MCP, Puppeteer MCP). Use whichever is available — prefer Chrome MCP. If none detected, ask the user.
2. Parse `$ARGUMENTS` as one or more URLs. Normalize and validate each; if any are invalid, ask the user to correct them.
3. Determine output plan: for each URL, assign `<site-key>`, `<page-key>`, the destination HTML filename, and the asset/CSS/JS paths. Resolve any collisions before editing.
4. Create the planned output directory structure. Use a unique asset-download script name: `output/download-assets-<site-key>-<page-key>.mjs`.
5. For multiple pages from one origin, build the shared foundation (variables, reset, fonts, global CSS) once before parallel page work.

## Guiding Principles

### 1. Completeness Beats Speed

Every builder agent must receive **everything** it needs: screenshot, exact CSS values, downloaded assets with relative paths, real text content, DOM structure. If a builder has to guess anything, you have failed at extraction.

### 2. Small Tasks, Perfect Results

When an agent gets "build the entire features section," it approximates. When it gets a single focused section with exact CSS values, it nails it.

**Complexity budget rule:** If a builder prompt exceeds ~150 lines of spec content, the section is too complex for one agent. Break it. Do not override this.

### 3. Real Content, Real Assets

Extract actual text, images, videos, and SVGs from the live site. Use `element.textContent`, download every `<img>` and `<video>`, extract inline `<svg>` elements. **Layered assets matter** — inspect every container's full DOM tree for multiple `<img>` elements and CSS `background-image` overlays.

### 4. Foundation First

Nothing can be built until the foundation exists: `variables.css` with design tokens, `reset.css`, `fonts.css`, downloaded assets. This is sequential and non-negotiable. Everything after this can be parallel.

### 5. Extract How It Looks AND How It Behaves

For every element, extract its **appearance** (exact computed CSS) AND its **behavior** (what changes, what triggers the change, how the transition happens).

Behaviors to watch for:
- A navbar that shrinks, changes background, or gains a shadow after scrolling past a threshold
- Elements that animate into view when they enter the viewport (fade-up, slide-in, stagger delays)
- Sections that snap into place on scroll (`scroll-snap-type`)
- Parallax layers that move at different rates than the scroll
- Hover states that animate (duration and easing matter)
- Dropdowns, modals, accordions with enter/exit animations
- Auto-playing carousels or cycling content
- Tabbed/pill content that cycles between visible card sets
- Scroll-driven tab switching (IntersectionObserver, not click handlers)
- Smooth scroll libraries (Lenis, Locomotive Scroll — check for `.lenis` class)

In vanilla JS, implement these with `IntersectionObserver`, `window.addEventListener('scroll', ...)`, CSS transitions triggered by class toggles, and `requestAnimationFrame` for smooth animations.

### 6. Identify the Interaction Model Before Building

Before writing any builder prompt for an interactive section, answer definitively: **Is this driven by clicks, scrolls, hovers, time, or a combination?**

1. **Don't click first.** Scroll slowly and observe if things change on their own.
2. If they do, it's scroll-driven — extract the mechanism.
3. If nothing changes on scroll, THEN test click/hover.
4. Document explicitly: "INTERACTION MODEL: scroll-driven with IntersectionObserver" or "INTERACTION MODEL: click-to-switch with CSS opacity transition."

Getting this wrong means a complete rewrite.

### 7. Extract Every State, Not Just the Default

For tabbed/stateful content: click each tab, extract content and styles per state, note transition animations.

For scroll-dependent elements: capture computed styles at scroll position 0, scroll past the trigger, capture again. Diff the two. Record the transition CSS and exact trigger threshold.

### 8. Spec Files Are the Source of Truth

Every section gets a specification file under `output/<site-key>/docs/research/components/` BEFORE any builder is dispatched. This file is the contract between extraction and building. Not optional.

### 9. Output Must Open in Browser with Zero Errors

Every builder verifies their section HTML/CSS/JS opens without console errors. After assembly, zero 404s in the Network tab. All relative paths must resolve.

## Phase 1: Reconnaissance

Navigate to the target URL with browser MCP.

### Screenshots
- Full-page screenshots at desktop (1440px) and mobile (390px)
- Save to `output/<site-key>/docs/design-references/`

### Global Extraction

**Fonts** — Inspect `<link>` tags for Google Fonts or self-hosted. Check computed `font-family` on key elements. Document every family, weight, and style. For Google Fonts, use `@import` in `fonts.css`. For self-hosted, download to `assets/fonts/` and use `@font-face`.

**Colors** — Extract the site's color palette from computed styles across the page. Map to meaningful names (`--color-bg`, `--color-text-primary`, `--color-accent`, `--color-border`) and store in `variables.css` as CSS custom properties.

**Spacing scale** — Identify the spacing system (usually multiples of 4px or 8px). Document as `--space-1: 4px`, `--space-2: 8px`, etc.

**Typography scale** — Document all font-size/line-height/weight/letter-spacing combinations as CSS custom properties.

**Favicons & Meta** — Download to `assets/` and reference in each HTML `<head>`.

**Global UI patterns** — Identify site-wide CSS: custom scrollbar hiding, scroll-snap on page container, global keyframe animations, smooth scroll libraries.

### Mandatory Interaction Sweep

**Scroll sweep:** Scroll slowly from top to bottom. At each section:
- Does the header change appearance? Record scroll position where it triggers.
- Do elements animate into view? Record which ones and animation type.
- Does a sidebar or tab indicator auto-switch? Record the mechanism.
- Are there scroll-snap points?

**Click sweep:** Click every interactive element. For tabs: click EACH ONE and record content per state.

**Hover sweep:** Hover over everything. Record: color, scale, shadow, underline, opacity changes and transition timing.

**Responsive sweep:** Test at 1440px, 768px, 390px. Note which sections change layout and at what breakpoint.

Save all findings to `output/<site-key>/docs/research/BEHAVIORS.md`.

### Page Topology

Map every distinct section from top to bottom. Document:
- Visual order
- Fixed/sticky overlays vs. flow content
- Overall layout (scroll container, column structure, z-index layers)
- Dependencies between sections
- **Interaction model** of each section (static, click-driven, scroll-driven, time-driven)

Save as `output/<site-key>/docs/research/PAGE_TOPOLOGY.md`.

## Phase 2: Foundation Build

Do this yourself (not delegated to an agent) — touches shared files.

### 1. `css/reset.css`
```css
*, *::before, *::after { box-sizing: border-box; }
* { margin: 0; padding: 0; }
img, video, svg { display: block; max-width: 100%; }
input, button, textarea, select { font: inherit; }
a { color: inherit; text-decoration: none; }
ul, ol { list-style: none; }
```

### 2. `css/fonts.css`
Google Fonts `@import` or `@font-face` for self-hosted. One import per font family.

### 3. `css/variables.css`
All design tokens as CSS custom properties:
```css
:root {
  /* Colors — exact values from getComputedStyle on key elements */
  --color-bg: #0a0a0a;
  --color-text-primary: #ffffff;
  --color-text-secondary: rgba(255,255,255,0.6);
  --color-accent: #6366f1;
  --color-border: rgba(255,255,255,0.08);

  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-4xl: 2.25rem;
  --text-6xl: 3.75rem;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;
  --space-24: 96px;

  /* Border radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 20px rgba(0,0,0,0.4);

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
  --transition-slow: 400ms ease;

  /* Layout */
  --max-width: 1200px;
}
```

### 4. `css/global.css`
Body defaults, typography base styles, link resets, utility classes actually used by the site.

### 5. Asset Download Script
Create `output/download-assets-<site-key>-<page-key>.mjs` and run it to fetch all images/videos/fonts into `output/<site-key>/assets/`. Use batched parallel downloads (4 at a time) with error handling.

Asset discovery script to run via browser MCP:
```javascript
JSON.stringify({
  images: [...document.querySelectorAll('img')].map(img => ({
    src: img.src || img.currentSrc,
    alt: img.alt,
    parentClasses: img.parentElement?.className,
    siblings: img.parentElement ? [...img.parentElement.querySelectorAll('img')].length : 0,
    position: getComputedStyle(img).position,
    zIndex: getComputedStyle(img).zIndex
  })),
  videos: [...document.querySelectorAll('video')].map(v => ({
    src: v.src || v.querySelector('source')?.src,
    poster: v.poster,
    autoplay: v.autoplay,
    loop: v.loop,
    muted: v.muted
  })),
  backgroundImages: [...document.querySelectorAll('*')].filter(el => {
    const bg = getComputedStyle(el).backgroundImage;
    return bg && bg !== 'none';
  }).map(el => ({
    url: getComputedStyle(el).backgroundImage,
    element: el.tagName + '.' + el.className?.split(' ')[0]
  })),
  svgCount: document.querySelectorAll('svg').length,
  fonts: [...new Set([...document.querySelectorAll('*')].slice(0, 200).map(el => getComputedStyle(el).fontFamily))],
  favicons: [...document.querySelectorAll('link[rel*="icon"]')].map(l => ({ href: l.href, sizes: l.sizes?.toString() }))
});
```

### 6. HTML Base Template

Every page file follows this structure:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Title — Site Name</title>
  <meta name="description" content="...">
  <link rel="icon" href="assets/favicon.ico">
  <link rel="stylesheet" href="css/fonts.css">
  <link rel="stylesheet" href="css/reset.css">
  <link rel="stylesheet" href="css/variables.css">
  <link rel="stylesheet" href="css/global.css">
  <!-- Section CSS in visual order, top to bottom -->
  <link rel="stylesheet" href="css/components/nav.css">
  <link rel="stylesheet" href="css/components/hero.css">
  <link rel="stylesheet" href="css/components/footer.css">
</head>
<body>
  <!-- Sections in visual order -->
  <nav class="nav">...</nav>
  <main>...</main>
  <footer class="footer">...</footer>

  <!-- Scripts deferred, in dependency order -->
  <script src="js/components/nav.js" defer></script>
  <script src="js/main.js" defer></script>
</body>
</html>
```

## Phase 3: Component Specification & Dispatch

For each section in your page topology (top to bottom): **extract**, **write the spec file**, then **dispatch builders**.

### Step 1: Extract

For each section, use browser MCP to extract:

1. **Screenshot** the section in isolation. Save to `output/<site-key>/docs/design-references/`.

2. **Extract CSS** using the extraction script:
```javascript
(function(selector) {
  const el = document.querySelector(selector);
  if (!el) return JSON.stringify({ error: 'Element not found: ' + selector });
  const props = [
    'fontSize','fontWeight','fontFamily','lineHeight','letterSpacing','color',
    'textTransform','textDecoration','backgroundColor','background',
    'padding','paddingTop','paddingRight','paddingBottom','paddingLeft',
    'margin','marginTop','marginRight','marginBottom','marginLeft',
    'width','height','maxWidth','minWidth','maxHeight','minHeight',
    'display','flexDirection','justifyContent','alignItems','gap',
    'gridTemplateColumns','gridTemplateRows',
    'borderRadius','border','borderTop','borderBottom','borderLeft','borderRight',
    'boxShadow','overflow','overflowX','overflowY',
    'position','top','right','bottom','left','zIndex',
    'opacity','transform','transition','cursor',
    'objectFit','objectPosition','mixBlendMode','filter','backdropFilter',
    'whiteSpace','textOverflow','WebkitLineClamp'
  ];
  function extractStyles(element) {
    const cs = getComputedStyle(element);
    const styles = {};
    props.forEach(p => { const v = cs[p]; if (v && v !== 'none' && v !== 'normal' && v !== 'auto' && v !== '0px' && v !== 'rgba(0, 0, 0, 0)') styles[p] = v; });
    return styles;
  }
  function walk(element, depth) {
    if (depth > 4) return null;
    const children = [...element.children];
    return {
      tag: element.tagName.toLowerCase(),
      classes: element.className?.toString().split(' ').slice(0, 5).join(' '),
      text: element.childNodes.length === 1 && element.childNodes[0].nodeType === 3 ? element.textContent.trim().slice(0, 200) : null,
      styles: extractStyles(element),
      images: element.tagName === 'IMG' ? { src: element.src, alt: element.alt, naturalWidth: element.naturalWidth, naturalHeight: element.naturalHeight } : null,
      childCount: children.length,
      children: children.slice(0, 20).map(c => walk(c, depth + 1)).filter(Boolean)
    };
  }
  return JSON.stringify(walk(el, 0), null, 2);
})('SELECTOR');
```

3. **Extract multi-state styles** — for scroll-triggered, hover, or tab-switched elements, capture BOTH states and diff them explicitly.

4. **Extract real content** — all text verbatim, alt attributes, aria labels. For tabbed content, click each tab and extract content per state.

5. **Identify assets** — which images/videos/SVGs this section uses, including layered images.

6. **Assess complexity** — if the builder prompt would exceed ~150 lines, split the section.

### Step 2: Write the Component Spec File

**File path:** `output/<site-key>/docs/research/components/<component-name>.spec.md`

**Template:**
```markdown
# <ComponentName> Specification

## Overview
- **Target HTML:** section block inside `index.html`
- **Target CSS:** `css/components/<component-name>.css`
- **Target JS:** `js/components/<component-name>.js` (or N/A if static)
- **Screenshot:** `docs/design-references/<screenshot-name>.png`
- **Interaction model:** <static | click-driven | scroll-driven | time-driven>

## HTML Structure
Describe the element hierarchy. Use semantic elements. Include actual class names.

Example:
```html
<section class="hero">
  <div class="hero__container">
    <h1 class="hero__title">...</h1>
    <p class="hero__subtitle">...</p>
    <a href="#" class="btn btn--primary">Get started</a>
  </div>
  <div class="hero__visual">
    <img src="assets/images/hero-bg.webp" alt="..." class="hero__bg">
    <img src="assets/images/hero-ui.png" alt="..." class="hero__ui">
  </div>
</section>
```

## Computed Styles (exact values from getComputedStyle)

### .hero (section container)
- display: flex
- padding: 120px 24px
- maxWidth: 1200px (inner .hero__container)
- backgroundColor: #0a0a0a

### .hero__title
- fontSize: 60px
- fontWeight: 700
- lineHeight: 1.1
- letterSpacing: -0.04em
- color: #ffffff

### .btn--primary
- display: inline-flex
- padding: 12px 24px
- backgroundColor: #6366f1
- borderRadius: 8px
- fontSize: 15px
- transition: background-color 200ms ease, transform 200ms ease

## States & Behaviors

### <Behavior name>
- **Trigger:** <scroll position, IntersectionObserver, hover, click>
- **State A (before):** prop: value
- **State B (after):** prop: value
- **Transition:** transition: all 300ms ease
- **JS implementation:** Add/remove `.nav--scrolled` via scroll listener / IntersectionObserver / click handler

### Hover states
- **.btn--primary:hover:** backgroundColor: #6366f1 → #4f46e5, transform: none → scale(1.02)

## Per-State Content (if applicable)

### Tab: "Featured"
- Heading: "..."
- Cards: [{ title, description, image: "assets/images/card-1.webp" }, ...]

### Tab: "Productivity"
- Cards: [...]

## Assets
- Background: `assets/images/hero-bg.webp`
- Overlay: `assets/images/hero-ui.png`
- SVG icon: <paste full inline SVG markup>

## Text Content (verbatim)
<All text copy-pasted from the live site>

## Responsive Behavior
- **Desktop (1440px):** Two-column flex, image on right
- **Tablet (768px):** Single column, image below text, padding 64px 24px
- **Mobile (390px):** Single column, image hidden, padding 40px 16px
- **Breakpoints:** @media (max-width: 768px), @media (max-width: 480px)

## CSS Classes
List every class for this section:
- `.hero`, `.hero__container`, `.hero__title`, `.hero__subtitle`, `.hero__visual`, `.hero__bg`, `.hero__ui`
- `.btn`, `.btn--primary`
```

### Step 3: Dispatch Builders

**Simple section** (1-2 sub-components): One builder for the entire section.

**Complex section** (3+ distinct sub-components): One agent per sub-component, plus one for the section wrapper.

**Every builder agent receives:**
- Full contents of its component spec file (inline — never "go read the spec file")
- Path to the section screenshot
- Naming convention: BEM-style classes (`.block__element--modifier`)
- CSS custom property names to use: `var(--color-accent)` not hardcoded hex
- Relative path convention: `../assets/images/` from CSS, `assets/images/` from HTML
- Verification instruction: open HTML in browser, check console for errors, verify zero 404s in Network tab

**Don't wait.** Dispatch builders for one section then immediately move to extracting the next.

### Step 4: Merge

As builders complete:
- Add their CSS file to `css/components/` (no overwrites)
- Add their JS file to `js/components/` (no overwrites)
- Add `<link>` and `<script>` tags to `index.html` in visual order
- Open in browser, verify no errors, verify no other section was broken

## Phase 4: Page Assembly

After all sections are built:

1. **Assemble `index.html`** — combine all section HTML in topology order, using semantic elements (`<nav>`, `<main>`, `<section>`, `<footer>`)
2. **CSS link order** — reset → variables → fonts → global → components (top to bottom, visual order)
3. **Script order** — component scripts in dependency order, `main.js` last, all `defer`
4. **Page-level behaviors via `js/main.js`:**
   - IntersectionObserver for scroll-driven animations
   - Smooth scroll for anchor links
   - Any global state (mobile menu, theme toggle)
5. **Verify relative paths** — open `output/<site-key>/index.html` with no server. All assets, CSS, JS load. Zero 404s.

### IntersectionObserver Pattern (scroll-driven animations)
```javascript
// js/main.js
const animatedEls = document.querySelectorAll('[data-animate]');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
animatedEls.forEach(el => observer.observe(el));
```
```css
/* css/global.css */
[data-animate] { opacity: 0; transform: translateY(24px); transition: opacity 0.6s ease, transform 0.6s ease; }
[data-animate].is-visible { opacity: 1; transform: none; }
```

### Scroll Header Pattern
```javascript
// js/components/nav.js
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('nav--scrolled', window.scrollY > 50);
}, { passive: true });
```

## Phase 5: Visual QA Diff

After assembly, compare side-by-side with the original:

1. Open original site and cloned `index.html` at the same viewport widths
2. Compare section by section, top to bottom, at desktop (1440px)
3. Compare again at mobile (390px)
4. For each discrepancy: check the spec, re-extract if needed, fix to match
5. Test all interactions: scroll, click every button/tab, hover over interactive elements
6. Open DevTools → Network. Reload. Confirm zero 404s for any asset.

Only after this QA pass is the clone complete.

## Pre-Dispatch Checklist

Before dispatching ANY builder agent:

- [ ] Spec file written with ALL sections filled
- [ ] Every CSS value is from `getComputedStyle()`, not estimated
- [ ] Interaction model is identified (static / click / scroll / time)
- [ ] For stateful components: every state's content and styles are captured
- [ ] For scroll-driven: trigger threshold, before/after styles, transition recorded
- [ ] For hover states: before/after values and transition timing recorded
- [ ] All images identified (including overlays and layered compositions)
- [ ] Responsive behavior documented for desktop and mobile
- [ ] Text content is verbatim from the site
- [ ] Asset paths will be **relative** (not absolute, not `/`-rooted)
- [ ] Builder prompt is under ~150 lines; if over, split

## What NOT to Do

- **Don't hardcode hex values in component CSS.** Use `var(--color-accent)` not `#6366f1`. This keeps the design system maintainable.
- **Don't use absolute asset paths.** `src="/assets/images/hero.webp"` breaks when the folder is moved. Use `src="assets/images/hero.webp"`.
- **Don't build click-based tabs when the original is scroll-driven.** Determine the interaction model FIRST by scrolling before clicking.
- **Don't extract only the default state.** Click every tab and capture all content variants.
- **Don't miss overlay/layered images.** Check every container's DOM tree for multiple `<img>` elements and CSS background-images.
- **Don't use `<div>` for everything.** Use semantic HTML: `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`, `<header>`, `<button>`, `<a>`.
- **Don't bundle unrelated sections into one agent.** A CTA and a footer are different components.
- **Don't skip responsive extraction.** Test at 1440, 768, and 390.
- **Don't forget smooth scroll libraries.** Check for Lenis (`.lenis` class) or Locomotive Scroll. Implement equivalent with CSS `scroll-behavior: smooth` + lightweight JS if needed.
- **Don't add `type="text/javascript"`.** It's unnecessary in HTML5.
- **Don't use `var` in JavaScript.** Use `const` and `let` (ES6+).
- **Don't dispatch builders without a spec file.** No exceptions.
- **Don't include npm packages, bundlers, or build steps.** The output must open directly in a browser — no toolchain.
- **Don't reference docs from builder prompts.** Each builder gets the CSS spec inline.

## Completion

When done, report:
- Source URL to output file mapping for every page built
- Total sections built
- Total CSS component files created
- Total JS component files created  
- Total spec files written (should match sections)
- Total assets downloaded (images, videos, SVGs, fonts)
- Browser test result (zero 404s, zero console errors)
- Visual QA results (any remaining discrepancies)
- Any known gaps or limitations
