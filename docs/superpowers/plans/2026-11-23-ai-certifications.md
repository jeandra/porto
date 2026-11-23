# AI Certifications + Skills Row — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Add one grouped Udemy certification entry to Education and an "AI & ML" skills row.

**Architecture:** Static HTML/CSS. One `<li class="entry">` with a `.cert-list` inside, one Skills row, one small CSS block.

**Tech Stack:** HTML, CSS.

**Spec:** `docs/superpowers/specs/2026-11-23-ai-certifications-design.md`

## Global Constraints

- Course titles keep official certificate wording.
- Verification links use `https://ude.my/UC-…` and open in a new tab with `rel="noopener noreferrer"`.
- Hours: 6.5h, 8.5h, 8h, 2.5h, 4h; total 29.5 hours.
- No certificate images added to the repo.

## Review Focus

- Long course titles must wrap without overlapping the hours label.
- New entry must sit between the degree and the webinar.
- The AI row must not imply skills beyond the certificate content.

---

### Task 1: Certification entry

**Files:**
- Modify: `index.html` (inside `#education .entries`, after the S1 entry)

**Interfaces:**
- Produces: `.cert-list` and `.cert-list__hours` classes styled in Task 2.

- [x] **Step 1: Insert the entry** exactly as specified in the design doc, with all five `ude.my` links.
- [x] **Step 2: Verify order** — S1 Informatics, AI Engineering & Cybersecurity, Collaborative Webinar.

### Task 2: Skills row

**Files:**
- Modify: `index.html` (`#skills .skills`)

- [x] **Step 1: Insert the row** between Backend and "Tools & security" with label `AI &amp; ML` and tags `Ollama`, `AI Agents`, `Machine Learning`, `LLM Deployment`.

### Task 3: Cert list CSS

**Files:**
- Modify: `style.css` (after `.entry__download:hover`, before the Contact block)

- [x] **Step 1: Add `.cert-list` rules** — reset list, top borders, flex rows, orange hover, muted hours.
- [x] **Step 2: Verify at 1440px and 390px** — titles wrap, hours stay on the right, no overflow.
- [x] **Step 3: Commit** the docs, markup and CSS.
