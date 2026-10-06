---
name: clone-adapter
description: Extract content and items from a source page (Website A) and render them using the layout, design system, component styling, header, and footer of a target page (Website B) that displays the same category of information (e.g., product listing, blog grid, detail page). All UI labels and content on the newly generated page MUST be in Vietnamese. Invoked as /clone-adapter [content-page-url] [design-page-url] [output-folder].
argument-hint: "<content-page-url> <design-page-url> <output-folder>"
user-invocable: true
---

# Clone Adapter — Same-Type Page Content & Design Fusion

You are tasked with cloning the **content and item data** from a **source page A** (`$ARGUMENTS[0]`) and re-housing it inside the **design system, component layout templates, header, and footer** of **target page B** (`$ARGUMENTS[1]`). Both pages present the same type/category of information (e.g. Product Listing, Category Page, Article List, Product Detail, Portfolio Grid, etc.). The resulting static HTML/CSS/JS web page will be saved to **`$ARGUMENTS[2]`**.

> [!IMPORTANT]
> **Language Standard**: The newly created page **MUST use Vietnamese (Tiếng Việt)** for all UI elements, headings, category names, filter controls, buttons, placeholders, and labels. If the source or design site contains English (e.g., "Category", "Shop All", "Sort by", "Add to Cart"), translate them accurately into Vietnamese (e.g., "Thể loại", "Sản phẩm", "Sắp xếp theo", "Thêm vào giỏ").

## Command Syntax
`/clone-adapter [PAGE_CONTENT_URL] [PAGE_DESIGN_URL] [OUTPUT_FOLDER]`

Parse `$ARGUMENTS` into three variables:
- `PAGE_CONTENT` = `$ARGUMENTS[0]` (Source URL on Website A: providing text, images, product/item lists, prices, metadata)
- `PAGE_DESIGN`  = `$ARGUMENTS[1]` (Target URL on Website B: providing header, footer, design system, component layout, styles, micro-interactions)
- `OUTPUT_FOLDER` = `$ARGUMENTS[2]` (Target local folder path to store generated HTML, CSS, JS, and local image assets)

If any parameter is missing, prompt the user with the correct usage format.

---

## Core Concept & Objective

| Element | Source | Rules |
| :--- | :--- | :--- |
| **Content & Data** | **Page A** (`$ARGUMENTS[0]`) | 100% verbatim text, titles, items list, prices, discounts, tags, specs, image files. |
| **Design System** | **Page B** (`$ARGUMENTS[1]`) | Colors, typography, spacing, border-radius, shadows, hover effects, CSS variables. |
| **Layout & Structure** | **Page B** (`$ARGUMENTS[1]`) | Grid/flex layouts, sidebar placement, sorting dropdowns, card structures, pagination. |
| **Header & Footer** | **Page B** (`$ARGUMENTS[1]`) | Exact pixel-perfect clone of Page B's global Header and Footer. |
| **Language** | **Vietnamese (Tiếng Việt)** | All UI text, filter labels, button texts, category titles MUST be written in Vietnamese (`lang="vi"`). |

The end result must look as if **Website B natively published Page A's content in Vietnamese**.

---

## Pre-Flight & Workspace Initialization

1. **Verify Browser MCP Tooling**: Ensure browser automation tool (Chrome MCP, Playwright, or Puppeteer) is active. Prefer Chrome MCP.
2. **Directory Structure Setup**: Create `OUTPUT_FOLDER` with the following layout:
   ```
   OUTPUT_FOLDER/
   ├── index.html
   ├── style.css
   ├── main.js
   └── assets/
       ├── images/
       └── icons/
   ```
3. **Validate Source URLs**: Ensure both `PAGE_CONTENT` and `PAGE_DESIGN` are reachable.

---

## Phase 1: Extract Design System & Component Templates from Page B

Navigate to `PAGE_DESIGN` (`$ARGUMENTS[1]`). This page serves strictly as the visual and structural blueprint.

### 1.1 Visual Capture
Take full-page screenshots at desktop (1440px) and mobile (390px). Save to `OUTPUT_FOLDER/assets/siteb-desktop.png` and `siteb-mobile.png` for QA reference.

### 1.2 Design Tokens Extraction
Run JS in the browser console on `PAGE_DESIGN` to capture:
- **Fonts**: `@font-face` links, Google Fonts URLs, font families, font weights, line heights.
- **Color Palette**: Background colors, primary/accent colors, text colors, border colors, badge colors.
- **Layout Math**: Container max-width, grid gaps, padding, margin patterns.
- **CSS Variables**: Extract `:root` custom properties if present.

### 1.3 Header & Footer Isolation
- Extract complete outer HTML of Page B's `<header>` (or top navigation element).
- Extract complete outer HTML of Page B's `<footer>`.
- Extract all associated CSS styles for header/footer (including responsive navigation breakpoints and JS behaviors).
- Translate header/footer menu labels into Vietnamese if needed.

### 1.4 Component Structural Blueprint
Analyze Page B's main content section and identify its core components:
1. **Page Title / Hero Section**: Heading style, breadcrumb structure, background styling.
2. **Toolbar / Controls**: Category filters, sorting selector (`<select>` or custom dropdown), view switchers (grid vs list), result counter text.
3. **Card Component Skeleton (Crucial)**:
   - Structure of a single product/item card in Page B.
   - Image wrapper aspect ratio, image hover effects, badge/tag position (e.g. "HOT", "-20%", "Sale").
   - Title tag level, font size, line-clamp rules.
   - Price display structure (sale price, list price, discount badge, currency symbol position).
   - Rating stars container, review count layout.
   - Call-to-Action button styling ("Add to Cart" -> "Thêm vào giỏ", "View Detail" -> "Xem chi tiết", icon buttons).
4. **Pagination / Infinite Scroll UI**: Previous/Next buttons, active page indicator styling.

---

## Phase 2: Extract Data & Assets from Page A

Navigate to `PAGE_CONTENT` (`$ARGUMENTS[0]`). This page provides all data payload.

### 2.1 Metadata Extraction
Extract:
- Page H1 title & category/collection name (translate/adapt to Vietnamese if source is in another language).
- Breadcrumb item hierarchy (translated to Vietnamese).
- SEO Meta Title & Meta Description in Vietnamese.

### 2.2 Item Collection Data Scraping
Run JS in browser console on `PAGE_CONTENT` to scrape all list items into a structured JSON array:

```javascript
// Example schema for items extracted from Page A
[
  {
    "id": 1,
    "title": "Tên sản phẩm/bài viết bằng Tiếng Việt",
    "url": "Original link if relevant",
    "image": "Absolute URL of primary image",
    "secondaryImage": "Hover image if available",
    "price": "Sale price string e.g. 150.000₫",
    "originalPrice": "Original strikethrough price e.g. 200.000₫",
    "discountBadge": "-25%",
    "rating": 4.8,
    "reviewCount": 12,
    "tags": ["Nổi bật", "Hàng mới"],
    "description": "Short summary or specs text in Vietnamese",
    "attributes": { "color": "Đỏ", "size": "M" }
  }
]
```

### 2.3 Asset Download
- Download all extracted images from Page A to `OUTPUT_FOLDER/assets/images/`.
- Rename files using clean slugified names (e.g., `item-01.jpg`, `item-02.jpg`).
- Replace remote image URLs in extracted data with local relative paths (`assets/images/item-01.jpg`).

---

## Phase 3: Content-to-Design Mapping & Vietnamese Localization

Now merge **Data (Page A)** into **Templates & Styles (Page B)** while applying **Vietnamese language standards**.

### 3.1 Mapping Rules
1. **Component Replacement**:
   - Take Page B's Card Component HTML template.
   - Loop over the structured JSON array extracted from Page A.
   - Instantiate Page B's card HTML for each item from Page A, replacing placeholders with Page A's data (title, image, price, rating, badges).

2. **Vietnamese UI Standardization**:
   - Page Title: Translate heading to Vietnamese (e.g. "Sản phẩm", "Tất cả sản phẩm", "Bồn cầu", "Vòi lavabo").
   - Sidebar Heading: Change "Category / Categories" to "Thể loại" or "Danh mục".
   - Filter Toggle Button: Change "Category & Filters" to "Thể loại & Bộ lọc".
   - Sort Selector Options: Translate "Default", "Price: Low to High", "Price: High to Low", "Newest" -> "Mặc định", "Giá: Thấp đến Cao", "Giá: Cao đến Thấp", "Mới nhất".
   - Item Buttons: "Add to Cart" -> "Thêm vào giỏ", "Buy Now" -> "Mua ngay", "View Details" -> "Xem chi tiết".
   - Result Counter: Change "Showing 24 results" -> "Hiển thị 24 kết quả".

3. **Graceful Attribute Handling**:
   - If Page A item has no discount price, conditionally hide Page B's strikethrough price element while keeping the layout intact.
   - If Page A provides extra attributes (e.g., brand, SKU) not present in Page B's default card template, seamlessly insert them using Page B's secondary text styling.

---

## Phase 4: Code Generation & File Assembly

Write clean, self-contained production code to `OUTPUT_FOLDER`.

### 4.1 HTML (`index.html`)
- Valid HTML5 boilerplate with `<html lang="vi">` and correct `<head>` tags (meta charset UTF-8, viewport, SEO title/description in Vietnamese from Page A, webfonts from Page B).
- Exact Page B Header HTML at the top (with Vietnamese navigation links).
- `<main>` container formatted according to Page B's layout grid & styling.
- Hero/Breadcrumb section displaying Page A's title/hierarchy in Vietnamese styled with Page B's CSS.
- Main items grid filled with Page A data items formatted inside Page B card templates.
- Toolbar & Pagination elements in Vietnamese (matching Page B style).
- Exact Page B Footer HTML at the bottom.

### 4.2 CSS (`style.css`)
- **CSS Resets & Root Variables**: Colors, fonts, container widths from Page B.
- **Header & Footer Styles**: Extracted verbatim from Page B.
- **Grid & Layout Styles**: CSS Grid / Flexbox rules matching Page B container math.
- **Card & Component Styles**: Exact typography, hover animations, shadow, padding, and border styles from Page B.
- **Responsive Media Queries**: Breakpoints at 1200px, 992px, 768px, 480px matching Page B responsiveness.

### 4.3 JavaScript (`main.js`)
- **Mobile Menu Toggle**: Replicate Page B's mobile navigation expand/collapse behavior.
- **Interactive Filtering/Sorting**: Implement client-side filter & sort logic for Page A's items using Page B's UI controls (sort by price ascending/descending, filter by tag).
- **Image Hover Effects / Lazy Loading**: Replicate Page B interaction effects.

---

## Phase 5: Verification & Quality Assurance (QA)

1. **Browser Testing**: Open `OUTPUT_FOLDER/index.html` in browser.
2. **Design Check**: Compare rendered page against `siteb-desktop.png` and `siteb-mobile.png`. Verify fonts, colors, spacings, header, and footer match Page B 100%.
3. **Language & Text Check**: Verify 100% of UI controls, categories, buttons, and headings are in **Vietnamese**.
4. **Content Check**: Verify every item, price, title, tag, and image from Page A is present and accurately rendered.
5. **Console & Asset Check**:
   - Check browser Console: **Zero JavaScript errors**.
   - Check Network tab: **Zero 404 broken image or font links**.
6. **Responsive Check**: Test viewport resizing (Desktop 1440px -> Tablet 768px -> Mobile 390px).

---

## Phase 6: Completion Report

Once QA passes, output a structured summary:

```
✅ Clone Adapter Completed Successfully (Vietnamese Edition)

SOURCE CONTENT (Website A):  [PAGE_CONTENT]
DESIGN & LAYOUT (Website B): [PAGE_DESIGN]
OUTPUT FOLDER:              [OUTPUT_FOLDER]
LANGUAGE:                   Tiếng Việt (lang="vi")

EXTRACTED & ADAPTED METRICS:
- Total items migrated: X items
- Images downloaded locally: X images
- Design system: Colors, Fonts, Cards & Layout from Website B
- Header & Footer: Cloned from Website B
- UI Localization: 100% Vietnamese (Thể loại, Bộ lọc, Nút bấm, Tiêu đề)

FILES GENERATED:
- [OUTPUT_FOLDER]/index.html
- [OUTPUT_FOLDER]/style.css
- [OUTPUT_FOLDER]/main.js
- [OUTPUT_FOLDER]/assets/images/ (local assets)

QA STATUS:
- Visual fidelity to Site B: 100% Pass
- Data fidelity to Site A: 100% Pass
- Language verification (Tiếng Việt): Pass
- Zero console JS errors: Pass
- Zero 404 asset errors: Pass
```

---

## Strict Rules & Constraints

1. **Vietnamese Language Standard**: All generated HTML must specify `<html lang="vi">`. All UI labels ("Category", "Filters", "Sort", "Add to Cart", "View Detail", "Showing X results") MUST be translated to Vietnamese.
2. **No Mixing Visuals**: Never use Website A's fonts, colors, or CSS variables. All visual styles come strictly from Website B.
3. **No Data Omission**: Never drop text, prices, or images from Website A. Every item payload from Page A must be rendered.
4. **Relative Paths Only**: Always use relative URLs (e.g. `assets/images/item-01.jpg`) so the output folder is completely portable.
5. **No Build Steps Required**: Output must be vanilla static HTML, CSS, and JS that opens directly in any browser without needing `npm` or bundlers.
6. **Exact Computed Styles**: Always use `getComputedStyle()` when extracting CSS from Page B to guarantee 100% exact design matching.
