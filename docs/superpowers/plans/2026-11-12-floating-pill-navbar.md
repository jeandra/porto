# Floating Pill Navbar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the site's fixed top navbar into a floating pill centered near the top of the viewport, keeping the same contents (brand, Work/About/Experience/Contact links, orange CV pill).

**Architecture:** Pure CSS change in `style.css`. `.site-nav` switches from full-width top bar (with `border-bottom` on `.is-scrolled`) to a centered floating pill (border-radius 999px, translucent bg + backdrop blur + border, flex row). `.is-scrolled` visual state adapts to pill styling.

**Tech Stack:** Plain HTML/CSS/JS static site (no framework).

**Spec:** Conversational design agreed in-session (user direction): (1) pill positioned center-above-top; (2) contents kept the same (Opsi A: brand + 4 nav links + CV pill); (3) design approved ("betul").

## Global Constraints

- Palette must stay: bg `#16070e`, orange `#fb5b02`, white `#ffffff`, gray `#8c8c94`.
- Must not regress the already-applied scroll fix: `html, body { overflow-x: clip; overscroll-behavior: none; }`.
- Sections are content-only overlays over the fixed film canvas; scroll-driven frame animation must keep working.
- Site copy in English; CV link targets `resume.pdf`.

## Review Focus

- Pill must not overlap hero content at 375px and 1440px widths (check panel top padding / hero clearance).
- Pill must not cause horizontal overflow; must remain centered horizontally.

## Tasks

### Task 1: Floating pill navbar

**Files:**
- Modify: `style.css` (`.site-nav` block, `.is-scrolled`, possibly `--nav-h`)

**Interfaces:**
- Consumes: existing `.site-nav` / `.nav-links` / `.pill` / `.brand` markup in `index.html`.
- Produces: floating pill layout in `style.css`.

- [ ] **Step 1: Rewrite `.site-nav` to floating pill CSS**

```css
.site-nav {
  position: fixed;
  top: clamp(12px, 2.5vh, 20px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 5;
  display: flex;
  align-items: center;
  gap: clamp(14px, 2.4vw, 36px);
  padding: 10px clamp(14px, 2.5vw, 24px);
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(22, 7, 14, 0.55);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

.site-nav.is-scrolled {
  background-color: rgba(22, 7, 14, 0.75);
  border-color: rgba(255, 255, 255, 0.18);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45);
}
```

- [ ] **Step 2: Verify no regression**

Run headless Chrome check at 375x667 and 1440x900: pill centered, visible, links work, scroll + film animation intact, no horizontal overflow, no console errors.

- [ ] **Step 3: Commit**
