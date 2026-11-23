# Selected work: Running Shop + Recon Pipeline cards

Date: 2026-11-23
Status: approved 2026-11-23

## Intent

Two new builds need to appear in the portfolio's "Selected work" section:

1. **running-shop** — a full e-commerce platform (Next.js storefront, NestJS API,
   Prisma/PostgreSQL), including its CI pipeline as a selling point.
2. **pipeline** — a passive reconnaissance pipeline written for research on
   gambling-defacement infrastructure on Indonesian education domains.

The person asked for both, not just one.

## Goals

- Both projects visible in `#work` with honest, specific copy (no inflated claims).
- Five cards still read as one grid at every breakpoint.
- New screenshots/covers match the site's dark warm palette and existing card media
  ratio conventions.

## Non-goals

- No redesign of the Work section, nav, hero, or other sections.
- No new pages or case-study detail views.
- No deploying running-shop; the card links to its GitHub source only.
- No public repo for the pipeline (none exists yet).

## Approaches considered

- **Five equal cards.** Simplest, but at 3 columns the second row holds two cards and
  leaves an empty slot that reads as unfinished.
- **Featured wide card (chosen).** running-shop spans two columns, pipeline takes the
  third; the three existing cards fill row two exactly. Puts the newest, largest build
  first without a layout rewrite. Below 1100px the grid is 2 columns, so the wide card
  becomes full width; below 900px it is a normal single column.
- **Separate "Pipeline" section.** Rejected: overkill for two cards and splits the
  portfolio's one-place-for-work story.

## Design

### Markup (`index.html`)

Insert at the top of `.work`, before the PRD Generator card:

1. `article.work-card.work-card--wide`
   - media: `assets/work/running-shop.webp`, links to the GitHub repo
   - meta: `E-commerce platform · 2026`
   - title: `Running Shop`
   - desc: full storefront + back office; catalog with size/SKU variants, guest and
     signed-in cart, checkout with order expiry, Midtrans payments with an idempotent
     webhook, email notifications, admin for products/orders/reports.
   - tags: Next.js, NestJS, TypeScript, Prisma, PostgreSQL, Midtrans, GitHub Actions
   - links: Source; note: `CI: migrate, lint, unit + e2e tests, build on every push`
2. `article.work-card`
   - media: `assets/work/recon-pipeline.webp` (designed cover, not a screenshot)
   - meta: `Research tool · 2026`
   - title: `Recon Pipeline`
   - desc: passive recon pipeline for a study of gambling-defacement infrastructure on
     Indonesian education domains; hand-collected dorking list goes through content
     validation and IP/ASN profiling into one CSV/JSON dataset.
   - tags: Python, Requests, OSINT, CSV / JSON
   - links: none; note: `Research build · source not public`

### CSS (`style.css`)

- `.work-card--wide { grid-column: span 2; }`
- `.work-card--wide .work-card__media { aspect-ratio: 16 / 9; }`
- At `max-width: 900px`, reset the span to `auto` so it behaves like a normal card.
- No other layout changes.

### Media

- `running-shop.webp`: headless screenshot of the local storefront hero
  (`http://localhost:3002/`) at 1600×1000, converted to WebP.
- `recon-pipeline.webp`: designed terminal-style cover rendered from HTML at 1600×1000,
  using the site's palette (#16070e / #fb5b02) and stage names taken from the script
  docstring. It is labelled as a cover, not presented as a screenshot.

## Left to the builder

- Exact image compression quality and crop position.
- Wording micro-edits that keep each description within the card's rhythm.
- Committing the design + implementation.
