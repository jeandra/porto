# Running Shop + Recon Pipeline Cards — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Add two project cards to the portfolio's Selected work: running-shop (featured) and Recon Pipeline.

**Architecture:** Static HTML/CSS edit. Two new `<article>` cards prepended to `.work`, one media asset per card, one modifier class for the wide card. No JS changes.

**Tech Stack:** HTML, CSS, WebP assets; headless Edge for screenshots.

**Spec:** `docs/superpowers/specs/2026-11-23-ecommerce-and-pipeline-cards-design.md`

## Global Constraints

- Existing copy, sections, and responsive rules stay untouched except for the wide-card overrides.
- Card copy stays in English, matching the rest of the site.
- Media files live in `assets/work/`, 1600px wide, WebP.
- running-shop links to `https://github.com/jeandra/running-shop` only (no live demo).
- Recon Pipeline has no link; note reads `Research build · source not public`.

## Review Focus

- Wide card must not overflow or force horizontal scroll at any width.
- Card text must not claim a live demo or deploy that does not exist.
- New media must not be a fake screenshot of a UI.

---

### Task 1: Media assets

**Files:**
- Create: `assets/work/running-shop.webp`
- Create: `assets/work/recon-pipeline.webp`

**Interfaces:**
- Produces: two 1600×1000 WebP images referenced by Task 2's `<img src>`.

- [x] **Step 1: Capture the storefront**

Run headless Edge against the running app:

```powershell
& "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --headless=new --disable-gpu --hide-scrollbars --no-first-run --user-data-dir="$env:TEMP\opencode\edge-porto" --window-size=1600,1000 --virtual-time-budget=8000 --screenshot="$env:TEMP\opencode\rs-hero.png" http://localhost:3002/
```

Expected: `rs-hero.png` exists at 1600×1000.

- [x] **Step 2: Build the pipeline cover**

Create `$env:TEMP\opencode\recon-cover.html` — 1600×1000 dark panel (#16070e) with orange (#fb5b02) accents, a terminal frame, and these stage lines: `01 TARGET FILTERING`, `02 TARGET VALIDATION`, `03 INFRASTRUCTURE PROFILE`, `04 STRUCTURED OUTPUT → CSV / JSON`. Render it with the same Edge command, output `recon-cover.png`.

- [x] **Step 3: Convert both to WebP**

Convert to `assets/work/running-shop.webp` and `assets/work/recon-pipeline.webp` at 1600px wide, quality ≈ 82.

- [x] **Step 4: Verify**

Both files open at 1600×1000 and are under ~400 KB each.

- [x] **Step 5: Commit**

```bash
git add assets/work/running-shop.webp assets/work/recon-pipeline.webp
git commit -m "Add media for running-shop and recon pipeline cards"
```

---

### Task 2: Card markup

**Files:**
- Modify: `index.html` (inside `.work`, before the PRD Generator article at line ~141)

**Interfaces:**
- Consumes: `assets/work/running-shop.webp`, `assets/work/recon-pipeline.webp`
- Produces: `.work-card--wide` class used by Task 3's CSS.

- [x] **Step 1: Insert the running-shop card**

`<article class="work-card work-card--wide">` with media linking to the GitHub repo, meta `E-commerce platform · 2026`, title `Running Shop`, the description from the spec, tags `Next.js`, `NestJS`, `TypeScript`, `Prisma`, `PostgreSQL`, `Midtrans`, `GitHub Actions`, a `Source` link, and note `CI: migrate, lint, unit + e2e tests, build on every push`.

- [x] **Step 2: Insert the Recon Pipeline card**

`<article class="work-card">` with media `assets/work/recon-pipeline.webp` (no link wrapper target), meta `Research tool · 2026`, title `Recon Pipeline`, description from the spec, tags `Python`, `Requests`, `OSINT`, `CSV / JSON`, and note `Research build · source not public`.

- [x] **Step 3: Verify order**

`.work` children in order: running-shop, Recon Pipeline, PRD Generator, SIP-Warga, Fullstack CRUD.

- [x] **Step 4: Commit**

```bash
git add index.html
git commit -m "Add running-shop and recon pipeline to selected work"
```

---

### Task 3: Wide card CSS

**Files:**
- Modify: `style.css` (after `.work-card:hover .work-card__media img`, before `.work-card__body`; and inside `@media (max-width: 900px)`)

**Interfaces:**
- Consumes: `.work-card--wide` from Task 2.

- [x] **Step 1: Add wide-card rules**

```css
.work-card--wide {
  grid-column: span 2;
}

.work-card--wide .work-card__media {
  aspect-ratio: 16 / 9;
}
```

- [x] **Step 2: Reset at phone width**

Inside the existing `@media (max-width: 900px)` block:

```css
.work-card--wide {
  grid-column: auto;
}
```

- [x] **Step 3: Verify layout**

Serve the site, screenshot at 1440px and 390px widths. Expected: desktop shows 2+1 then 3 cards, no empty slot; phone shows one card per row; no horizontal scrollbar.

- [x] **Step 4: Commit**

```bash
git add style.css
git commit -m "Style featured wide work card"
```

---

### Task 4: Final check

**Files:** none

- [x] **Step 1: Check links and images return 200** on the local server, including the two new images.
- [x] **Step 2: Confirm the design doc and plan are committed.**
