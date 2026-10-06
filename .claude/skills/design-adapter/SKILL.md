---
name: design-adapter
description: Extract all content from a source page (website A) and rebuild it as a new HTML/CSS page using the design system, header, and footer of a target website (website B). The new page matches website B's visual identity (colors, typography, spacing, components) while containing website A's content. Use this when the user wants to migrate content between websites, apply a new design to existing content, or create a page in website B's style with content from website A. Invoked as /design-adapter [page-a-url] [website-b-home-url] [output-folder].
argument-hint: "<page-a-url> <website-b-home-url> <output-folder>"
user-invocable: true
---

# Design Adapter — Content Migration with Design Rebrand

You are about to extract all content from **source page A** (`$ARGUMENTS[0]`) and rebuild it as a pixel-perfect HTML/CSS page using the design system, header, and footer extracted from **website B** (`$ARGUMENTS[1]`). The resulting file will be saved to **`$ARGUMENTS[2]`**.

Parse `$ARGUMENTS` as three space-separated tokens:
- `PAGE_A_URL` = first token (source page — content origin)
- `SITE_B_URL` = second token (target site home — design origin)
- `OUTPUT_FOLDER` = third token (destination folder for generated files)

If any token is missing or invalid, ask the user to correct them before proceeding.

---

## What This Skill Produces

A **standalone HTML/CSS page** that:
1. Contains **all content** scraped verbatim from `PAGE_A_URL` (text, images, videos, data)
2. Uses **website B's design system** (colors, fonts, spacing, button styles, card styles, icons)
3. Preserves **website B's header** (navigation, logo, links) exactly as found on `SITE_B_URL`
4. Preserves **website B's footer** exactly as found on `SITE_B_URL`
5. Is a **self-contained static file** — no build step, opens in any browser

The page content area between the header and footer is entirely new, built to display content from page A in website B's design language.

---

## Guiding Principles

### 1. Two Sources, One Output
You are a translator between two design languages. The **content** comes from Site A. The **visual rules** come from Site B. Never mix them up. Never use Site A's colors or fonts in the output.

### 2. Extract First, Build Second
Do NOT begin writing HTML until you have completed extraction from both sites. Incomplete extraction causes rebuilds. Follow the phases strictly.

### 3. Header and Footer are Sacred
The header and footer of website B must be reproduced **exactly** — same logo, same nav links, same styles, same hover states, same responsive behavior. They are the frame of the page and signal to users they are on website B.

### 4. Content Fidelity
Every piece of text from page A must appear in the output — verbatim. Every image must be downloaded and referenced. No placeholder text, no made-up content.

### 5. Design Fidelity
Use `getComputedStyle()` for every CSS value. Never guess. Never approximate. Every color, padding, border-radius, and font-weight must come from Site B's live computed styles.

### 6. Self-Contained Output
All CSS is inline in `<style>` tags or a `style.css` file co-located with the HTML. All assets are downloaded locally. The folder can be zipped and opened anywhere.

---

## Pre-Flight

1. **Check for browser MCP tools** (Chrome MCP, Playwright MCP, Browserbase MCP, Puppeteer MCP). Use whichever is available. Prefer Chrome MCP. If none are available, stop and ask the user.
2. **Validate URLs**: Normalize `PAGE_A_URL` and `SITE_B_URL`. If either fails to load, stop and report the error.
3. **Create output directory**: Create `OUTPUT_FOLDER/` with subdirectories:
   ```
   OUTPUT_FOLDER/
   ├── index.html
   ├── style.css
   ├── main.js
   └── assets/
       ├── images/
       ├── fonts/
       └── icons/
   ```
4. Confirm the plan with yourself: "I will extract content from `PAGE_A_URL` and apply the design of `SITE_B_URL`."

---

## Phase 1: Extract Design System from Website B

Navigate to `SITE_B_URL` with browser MCP. This is the **design source only**.

### 1.1 Full-Page Screenshots
Take full-page screenshots at desktop (1440px) and mobile (390px). Save them to `OUTPUT_FOLDER/assets/` as `siteb-desktop.png` and `siteb-mobile.png`. These are your visual reference for QA.

### 1.2 Extract Design Tokens
Run this script in the browser console on `SITE_B_URL`:

```javascript
JSON.stringify({
  fonts: {
    families: [...new Set([...document.querySelectorAll('*')].slice(0, 300).map(el => getComputedStyle(el).fontFamily))],
    googleFontsLinks: [...document.querySelectorAll('link[href*="fonts.googleapis.com"]')].map(l => l.href),
  },
  colors: {
    backgrounds: [...new Set([...document.querySelectorAll('*')].slice(0, 200).map(el => getComputedStyle(el).backgroundColor).filter(c => c !== 'rgba(0, 0, 0, 0)'))].slice(0, 20),
    texts: [...new Set([...document.querySelectorAll('h1,h2,h3,h4,p,a,span,li')].map(el => getComputedStyle(el).color))].slice(0, 15),
  },
  typography: {
    h1: (() => { const el = document.querySelector('h1'); if (!el) return null; const cs = getComputedStyle(el); return { fontSize: cs.fontSize, fontWeight: cs.fontWeight, lineHeight: cs.lineHeight, letterSpacing: cs.letterSpacing, color: cs.color }; })(),
    h2: (() => { const el = document.querySelector('h2'); if (!el) return null; const cs = getComputedStyle(el); return { fontSize: cs.fontSize, fontWeight: cs.fontWeight, lineHeight: cs.lineHeight, color: cs.color }; })(),
    body: (() => { const cs = getComputedStyle(document.body); return { fontSize: cs.fontSize, fontFamily: cs.fontFamily, lineHeight: cs.lineHeight, color: cs.color, backgroundColor: cs.backgroundColor }; })(),
  },
  buttons: (() => {
    const btns = [...document.querySelectorAll('button, a[class*="btn"], a[class*="button"], [class*="btn"]')].slice(0, 5);
    return btns.map(b => { const cs = getComputedStyle(b); return { classes: b.className, backgroundColor: cs.backgroundColor, color: cs.color, padding: cs.padding, borderRadius: cs.borderRadius, fontSize: cs.fontSize, fontWeight: cs.fontWeight }; });
  })(),
  favicons: [...document.querySelectorAll('link[rel*="icon"]')].map(l => ({ href: l.href, sizes: l.sizes?.toString() }))
});
```

Save the output as `OUTPUT_FOLDER/assets/siteb-design-tokens.json`.

### 1.3 Extract CSS Custom Properties (Design Tokens)

```javascript
(function() {
  const variables = {};
  try {
    [...document.styleSheets].forEach(sheet => {
      try {
        [...sheet.cssRules].forEach(rule => {
          if (rule.selectorText === ':root' || rule.selectorText === 'html') {
            const style = rule.style;
            for (let i = 0; i < style.length; i++) {
              const prop = style[i];
              if (prop.startsWith('--')) variables[prop] = style.getPropertyValue(prop).trim();
            }
          }
        });
      } catch(e) {}
    });
  } catch(e) {}
  return JSON.stringify(variables, null, 2);
})();
```

### 1.4 Extract Header (Exact Reproduction)

The header must be pixel-perfect. Extract it in full detail.

**Step A — Screenshot the header:**
Take a screenshot of just the header/navigation area. Save as `OUTPUT_FOLDER/assets/siteb-header.png`.

**Step B — Extract header HTML structure:**
```javascript
(function() {
  const header = document.querySelector('header, nav, [class*="header"], [class*="navbar"], [class*="nav-wrapper"]');
  if (!header) return JSON.stringify({ error: 'Header not found' });
  return JSON.stringify({
    outerHTML: header.outerHTML.slice(0, 8000),
    tag: header.tagName,
    classes: header.className,
    id: header.id
  });
})();
```

**Step C — Extract header computed styles:**
```javascript
(function() {
  const header = document.querySelector('header, nav, [class*="header"], [class*="navbar"]');
  if (!header) return '{}';
  const importantProps = ['display','position','top','left','right','width','height','backgroundColor','background','borderBottom','boxShadow','zIndex','padding','paddingTop','paddingBottom','paddingLeft','paddingRight','justifyContent','alignItems','gap','maxWidth','transition'];
  function getStyles(el) {
    const cs = getComputedStyle(el);
    const result = {};
    importantProps.forEach(p => { const v = cs[p]; if (v && v !== 'none' && v !== 'normal' && v !== 'auto' && v !== '0px' && v !== 'rgba(0, 0, 0, 0)') result[p] = v; });
    return result;
  }
  function walk(el, depth) {
    if (depth > 4) return null;
    return {
      tag: el.tagName, classes: el.className?.toString?.() || '', id: el.id,
      text: el.childNodes.length === 1 && el.childNodes[0].nodeType === 3 ? el.textContent.trim().slice(0, 100) : null,
      href: el.tagName === 'A' ? el.getAttribute('href') : null,
      src: el.tagName === 'IMG' ? el.src : null,
      alt: el.tagName === 'IMG' ? el.alt : null,
      styles: getStyles(el),
      children: [...el.children].slice(0, 15).map(c => walk(c, depth + 1)).filter(Boolean)
    };
  }
  return JSON.stringify(walk(header, 0), null, 2);
})();
```

**Step D — Extract header scroll behavior:**
Scroll the page 100px, then check if the header changes styles. Document any class added on scroll (`.scrolled`, `.sticky`, etc.).

**Step E — Download logo** to `OUTPUT_FOLDER/assets/icons/logo.*`.

**Step F — Extract navigation links:**
```javascript
(function() {
  const navLinks = [...document.querySelectorAll('header a, nav a')].map(a => ({
    text: a.textContent.trim(),
    href: a.getAttribute('href'),
    classes: a.className,
    isButton: a.className?.includes('btn') || a.className?.includes('button') || getComputedStyle(a).backgroundColor !== 'rgba(0, 0, 0, 0)'
  })).filter(l => l.text.length > 0);
  return JSON.stringify(navLinks);
})();
```

**Step G — Hover states on nav links:** Document default and hover colors + transition timing.

### 1.5 Extract Footer (Exact Reproduction)

**Step A — Screenshot the footer.** Save as `OUTPUT_FOLDER/assets/siteb-footer.png`.

**Step B — Extract footer HTML:**
```javascript
(function() {
  const footer = document.querySelector('footer, [class*="footer"]');
  if (!footer) return JSON.stringify({ error: 'Footer not found' });
  return JSON.stringify({ outerHTML: footer.outerHTML.slice(0, 10000), tag: footer.tagName, classes: footer.className });
})();
```

**Step C — Extract footer computed styles:**
```javascript
(function() {
  const footer = document.querySelector('footer, [class*="footer"]');
  if (!footer) return '{}';
  const props = ['display','backgroundColor','background','color','padding','paddingTop','paddingBottom','borderTop','marginTop','fontSize','fontFamily'];
  function getStyles(el) {
    const cs = getComputedStyle(el); const result = {};
    props.forEach(p => { const v = cs[p]; if (v && v !== 'rgba(0, 0, 0, 0)' && v !== '0px') result[p] = v; });
    return result;
  }
  function walk(el, depth) {
    if (depth > 3) return null;
    return {
      tag: el.tagName, classes: el.className?.toString?.() || '',
      text: el.childNodes.length === 1 && el.childNodes[0].nodeType === 3 ? el.textContent.trim().slice(0, 150) : null,
      href: el.tagName === 'A' ? el.getAttribute('href') : null,
      src: el.tagName === 'IMG' ? el.src : null,
      styles: getStyles(el),
      children: [...el.children].slice(0, 15).map(c => walk(c, depth + 1)).filter(Boolean)
    };
  }
  return JSON.stringify(walk(footer, 0), null, 2);
})();
```

**Step D — Download footer images/logos** if any.

### 1.6 Extract Reusable Component Styles from Site B

```javascript
(function() {
  const results = {};
  const sections = [...document.querySelectorAll('section, main > div, main > article')].slice(0, 5);
  results.sectionContainers = sections.map(s => { const cs = getComputedStyle(s); return { classes: s.className, padding: cs.padding, backgroundColor: cs.backgroundColor, maxWidth: cs.maxWidth }; });
  const h2s = [...document.querySelectorAll('section h2, main h2')].slice(0, 3);
  results.sectionHeadings = h2s.map(h => { const cs = getComputedStyle(h); return { fontSize: cs.fontSize, fontWeight: cs.fontWeight, color: cs.color, marginBottom: cs.marginBottom, lineHeight: cs.lineHeight }; });
  const ps = [...document.querySelectorAll('section p, main p')].slice(0, 3);
  results.paragraphs = ps.map(p => { const cs = getComputedStyle(p); return { fontSize: cs.fontSize, lineHeight: cs.lineHeight, color: cs.color, marginBottom: cs.marginBottom }; });
  const cards = [...document.querySelectorAll('[class*="card"], [class*="item"], [class*="tile"]')].slice(0, 3);
  results.cards = cards.map(c => { const cs = getComputedStyle(c); return { classes: c.className, backgroundColor: cs.backgroundColor, borderRadius: cs.borderRadius, boxShadow: cs.boxShadow, padding: cs.padding, border: cs.border }; });
  return JSON.stringify(results, null, 2);
})();
```

Save as `OUTPUT_FOLDER/assets/siteb-components.json`.

---

## Phase 2: Extract All Content from Page A

Navigate to `PAGE_A_URL`. This is the **content source only**. Extract everything.

### 2.1 Screenshots
Full-page screenshots at desktop (1440px) and mobile (390px). Save as `OUTPUT_FOLDER/assets/pagea-desktop.png` and `OUTPUT_FOLDER/assets/pagea-mobile.png`.

### 2.2 Page Meta
```javascript
JSON.stringify({
  title: document.title,
  metaDescription: document.querySelector('meta[name="description"]')?.content,
  h1: document.querySelector('h1')?.textContent?.trim(),
  lang: document.documentElement.lang
});
```

### 2.3 Full Content Extraction

```javascript
(function() {
  const main = document.querySelector('main, [role="main"], #content, .content, article') || document.body;
  const header = document.querySelector('header, nav, [class*="header"]');
  const footer = document.querySelector('footer, [class*="footer"]');

  const headings = [...main.querySelectorAll('h1,h2,h3,h4,h5,h6')]
    .filter(h => !header?.contains(h) && !footer?.contains(h))
    .map(h => ({ level: parseInt(h.tagName[1]), text: h.textContent.trim(), id: h.id }));

  const paragraphs = [...main.querySelectorAll('p')]
    .filter(p => !header?.contains(p) && !footer?.contains(p) && p.textContent.trim().length > 10)
    .map(p => p.textContent.trim());

  const lists = [...main.querySelectorAll('ul, ol')]
    .filter(l => !header?.contains(l) && !footer?.contains(l))
    .map(l => ({ type: l.tagName.toLowerCase(), items: [...l.querySelectorAll('li')].map(li => li.textContent.trim()) }));

  const tables = [...main.querySelectorAll('table')]
    .filter(t => !header?.contains(t) && !footer?.contains(t))
    .map(t => ({
      headers: [...t.querySelectorAll('th')].map(th => th.textContent.trim()),
      rows: [...t.querySelectorAll('tbody tr')].map(tr => [...tr.querySelectorAll('td')].map(td => td.textContent.trim()))
    }));

  const quotes = [...main.querySelectorAll('blockquote')]
    .filter(q => !header?.contains(q) && !footer?.contains(q))
    .map(q => q.textContent.trim());

  const cards = [...main.querySelectorAll('[class*="card"], [class*="item"], [class*="post"], [class*="article"], [class*="product"]')]
    .filter(c => !header?.contains(c) && !footer?.contains(c))
    .slice(0, 30)
    .map(c => ({
      classes: c.className?.toString?.()?.slice(0, 80),
      heading: c.querySelector('h1,h2,h3,h4,h5,h6')?.textContent?.trim(),
      text: [...c.querySelectorAll('p')].map(p => p.textContent.trim()).join(' ').slice(0, 500),
      links: [...c.querySelectorAll('a')].map(a => ({ text: a.textContent.trim(), href: a.getAttribute('href') })).slice(0, 5)
    }));

  return JSON.stringify({ headings, paragraphs, lists, tables, quotes, cards }, null, 2);
})();
```

Save as `OUTPUT_FOLDER/assets/pagea-content.json`.

### 2.4 Extract All Images

```javascript
(function() {
  const main = document.querySelector('main, [role="main"], #content, .content, article') || document.body;
  const header = document.querySelector('header, nav, [class*="header"]');
  const footer = document.querySelector('footer, [class*="footer"]');

  const images = [...main.querySelectorAll('img')]
    .filter(img => !header?.contains(img) && !footer?.contains(img))
    .map(img => ({ src: img.currentSrc || img.src, alt: img.alt, width: img.naturalWidth || img.width, height: img.naturalHeight || img.height, classes: img.className }));

  const backgroundImages = [...main.querySelectorAll('*')]
    .filter(el => !header?.contains(el) && !footer?.contains(el))
    .map(el => ({ url: getComputedStyle(el).backgroundImage, classes: el.className, tag: el.tagName }))
    .filter(el => el.url && el.url !== 'none');

  const svgs = [...main.querySelectorAll('svg')]
    .filter(s => !header?.contains(s) && !footer?.contains(s))
    .map(s => ({ outerHTML: s.outerHTML.slice(0, 2000) }));

  return JSON.stringify({ images, backgroundImages, svgs }, null, 2);
})();
```

**Download all images** from Page A to `OUTPUT_FOLDER/assets/images/`.

### 2.5 Determine Content Layout Type

Analyze the extracted topology and classify which layout best describes page A's content:
- **Article/Blog**: Linear reading with headings, paragraphs, inline images
- **Product/Service**: Feature grid + hero + CTA
- **Gallery/Portfolio**: Image grid with captions
- **Listing/Index**: Grid of cards (posts, products, events)
- **Team/About**: People cards or company info
- **FAQ/Docs**: Accordion or Q&A
- **Contact**: Form + contact info
- **Dashboard/Data**: Tables, stats

Document this as **CONTENT_LAYOUT_TYPE** for the build phase.

---

## Phase 3: Build the Output Page

Synthesize both extractions into a single output page. Follow this order strictly.

### 3.1 Write `style.css`

```css
/* ==============================================
   1. RESET
   ============================================== */
*, *::before, *::after { box-sizing: border-box; }
* { margin: 0; padding: 0; }
img, video, svg { display: block; max-width: 100%; }
input, button, textarea, select { font: inherit; }
a { color: inherit; text-decoration: none; }
ul, ol { list-style: none; }

/* ==============================================
   2. DESIGN TOKENS — from Website B
   ============================================== */
:root {
  /* All CSS custom properties from Phase 1 extraction */
  /* Colors — exact values from getComputedStyle */
  /* Typography scale */
  /* Spacing scale */
  /* Border radius, shadows, transitions */
}

/* ==============================================
   3. FONTS — from Website B
   ============================================== */
/* Google Fonts @import OR @font-face for self-hosted */

/* ==============================================
   4. GLOBAL — from Website B
   ============================================== */
/* body, html, ::selection, scrollbar */

/* ==============================================
   5. HEADER — exact Website B header styles
   ============================================== */

/* ==============================================
   6. FOOTER — exact Website B footer styles
   ============================================== */

/* ==============================================
   7. PAGE CONTENT — Site B design applied to Page A content
   ============================================== */
/* Headings, paragraphs, images, lists, cards, buttons, tables */
/* All using Site B's color/font/spacing tokens */
```

**Critical CSS rules for the content section (section 7):**
- Use `var(--color-*)` variables — not hardcoded hex
- Apply Site B's `border-radius`, `box-shadow`, and `padding` to cards/images
- Apply Site B's `font-size`, `font-weight`, `line-height`, `color` to all text
- Maintain Site B's responsive breakpoints and container max-width
- Use Site B's button styles for all CTAs from Page A

### 3.2 Write `index.html`

```html
<!DOCTYPE html>
<html lang="[LANG_FROM_PAGE_A]">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[TITLE_FROM_PAGE_A] — [SITE_B_BRAND_NAME]</title>
  <meta name="description" content="[META_DESCRIPTION_FROM_PAGE_A]">
  <link rel="icon" href="[SITE_B_FAVICON_PATH]">
  <link rel="stylesheet" href="style.css">
</head>
<body>

  <!-- ==========================================
       HEADER — Website B, exact reproduction
       ========================================== -->
  [HEADER_HTML_FROM_SITE_B]

  <!-- ==========================================
       MAIN CONTENT — Page A content, Site B design
       ========================================== -->
  <main>
    [CONTENT_FROM_PAGE_A_STYLED_WITH_SITE_B_DESIGN]
  </main>

  <!-- ==========================================
       FOOTER — Website B, exact reproduction
       ========================================== -->
  [FOOTER_HTML_FROM_SITE_B]

  <script src="main.js" defer></script>
</body>
</html>
```

#### Content Reconstruction Rules

When building the `<main>` block:

1. **Headings**: Preserve all headings from Page A verbatim. Apply Site B's heading font, size, weight, color, letter-spacing. Do not change the heading hierarchy (h1/h2/h3 order).

2. **Paragraphs**: Preserve all text verbatim. Apply Site B's body font, line-height, color, paragraph spacing.

3. **Lists**: Preserve all list items with correct text. Apply Site B's list styling (bullet, indent, color).

4. **Hero/intro**: If Page A has a hero image + heading + subtitle, wrap in a hero section styled with Site B's primary colors and hero padding.

5. **Images**: Every image from Page A goes into the output with its original alt text. Apply Site B's image border-radius and shadow.

6. **Cards/Grids**: If Page A content is a list/grid of items, use Site B's card style (border-radius, shadow, padding, background, hover state).

7. **CTAs/Buttons**: If Page A has call-to-action links, apply Site B's button style exactly (background, padding, border-radius, font-weight, hover).

8. **Tables**: Use Site B's color system to style tables from Page A.

9. **Section spacing**: Use Site B's section padding between major content blocks.

10. **Container**: Wrap content in a container matching Site B's max-width and horizontal centering.

### 3.3 Write `main.js`

```javascript
// Header scroll behavior (if Site B has it)
const header = document.querySelector('header, [class*="header"]');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });
}

// Mobile menu toggle (if Site B has one)
const menuToggle = document.querySelector('[class*="menu-toggle"], [class*="hamburger"], [class*="nav-toggle"]');
const mobileNav = document.querySelector('[class*="mobile-menu"], [class*="nav-links"]');
if (menuToggle && mobileNav) {
  menuToggle.addEventListener('click', () => {
    mobileNav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(mobileNav.classList.contains('is-open')));
  });
}

// Scroll-reveal animations
const animEls = document.querySelectorAll('[data-animate]');
if (animEls.length > 0) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  animEls.forEach(el => observer.observe(el));
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
  });
});
```

---

## Phase 4: Visual QA

### 4.1 Open and Verify
Open `OUTPUT_FOLDER/index.html` in the browser. Check:
- [ ] Header visually matches `siteb-header.png`
- [ ] Footer visually matches `siteb-footer.png`
- [ ] All text from Page A is present and readable
- [ ] All images from Page A appear without broken links
- [ ] Fonts match Site B's font stack
- [ ] Colors match Site B's color palette
- [ ] No layout overflow or visual breaks
- [ ] Network tab: Zero 404 errors
- [ ] Console: Zero JavaScript errors

### 4.2 Responsive Check
Resize to 768px and 390px:
- [ ] Header collapses correctly (matching Site B behavior)
- [ ] Content reflows correctly
- [ ] Footer collapses correctly
- [ ] No horizontal overflow

### 4.3 Interaction Check
- [ ] Navigation links are clickable
- [ ] Mobile menu opens/closes (if applicable)
- [ ] Buttons show correct hover states (Site B's hover colors)
- [ ] Header scroll behavior works (if Site B has it)

### 4.4 Fix Discrepancies
For each failed check: re-examine Phase 1 or 2 extraction, re-extract with more precise selectors if needed, fix CSS/HTML, re-verify.

---

## Phase 5: Completion Report

After all checks pass, report:

```
✅ Design Adapter Complete

SOURCE (Content):  [PAGE_A_URL]
DESIGN SOURCE:     [SITE_B_URL]
OUTPUT:            [OUTPUT_FOLDER]/index.html

CONTENT EXTRACTED FROM PAGE A:
- Headings: X (h1: X, h2: X, h3: X)
- Paragraphs: X
- Images downloaded: X
- Lists: X items across X lists
- Cards/items: X
- Tables: X

DESIGN ELEMENTS APPLIED FROM SITE B:
- Font family: [from Site B]
- Primary color: [from Site B]
- Background color: [from Site B]
- Header: ✅ reproduced exactly
- Footer: ✅ reproduced exactly
- Buttons: ✅ Site B style applied
- Cards: ✅ Site B style applied
- Container max-width: [from Site B]

QA RESULTS:
- Opens in browser without errors: ✅
- Zero 404s: ✅
- Desktop layout correct: ✅
- Mobile layout correct: ✅
- All Page A content present: ✅

KNOWN LIMITATIONS (if any):
- [list any content that could not be extracted or interactions not implemented]
```

---

## What NOT To Do

- **Don't use Page A's fonts or colors** in the output. Everything visual must come from Site B.
- **Don't omit any text content** from Page A. Every heading, paragraph, list item, and caption must be present.
- **Don't change Site B's header or footer** nav links to match Page A's structure.
- **Don't use absolute asset paths.** Always use relative: `assets/images/photo.webp` not `/assets/images/photo.webp`.
- **Don't guess CSS values.** Always use `getComputedStyle()` results from Site B.
- **Don't add content** that isn't on Page A or Site B. No placeholder text, no "Lorem ipsum."
- **Don't skip the QA phase.** A visually broken output is a failed output.
- **Don't use npm, bundlers, or build tools.** The output must open directly in any browser.
- **Don't use `var` in JavaScript.** Use `const` and `let` only.
- **Don't add `type="text/javascript"` to script tags.** Not needed in HTML5.
