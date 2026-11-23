# AI mentions in hero & about — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Update hero and About copy to reflect the AI Engineering identity alongside the full-stack brand.

**Architecture:** Copy-only HTML edits; no layout or CSS changes.

**Spec:** `docs/superpowers/specs/2026-11-23-ai-content-design.md`

## Global Constraints

- Copy stays in English and matches the existing tone.
- HTML entities where the original used them (`&amp;`).
- No changes outside `#top` and `#about`.

## Review Focus

- The hero blurb must still fit the hero's copy column at desktop and mobile widths.

---

### Task 1: Hero copy

**Files:**
- Modify: `index.html` (hero `#top`)

- [x] **Step 1: Update label** to `Full Stack Developer &amp; AI Engineer Bandung, Indonesia`.
- [x] **Step 2: Update blurb** to include the AI sentence.
- [x] **Step 3: Commit** (with the rest of this change).

### Task 2: About lede

**Files:**
- Modify: `index.html` (section `#about`)

- [x] **Step 1: Append** the AI sentence to the lede.
- [x] **Step 2: Verify** at desktop and mobile widths.

### Task 3: Final

- [x] **Step 1: Screenshot hero and About to confirm copy renders.**
- [x] **Step 2: Commit** docs, markup, and everything else for this change.
