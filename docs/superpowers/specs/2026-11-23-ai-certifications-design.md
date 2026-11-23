# AI certifications in Education + AI skills row

Date: 2026-11-23
Status: approved 2026-11-23

## Intent

Five new Udemy certificates (17 Nov 2026, 29.5 hours total) should appear in the
portfolio, and the toolkit should show the AI skills they represent.

Certificates (from `ude.my/UC-…` verification pages on the certificate images):

| Course | Hours | Verification |
|---|---|---|
| DeepSeek R1 AI: 25 Real World Projects in AI for Beginners | 6.5 | UC-4b5fa67b-d275-4445-83eb-82caa2827ee8 |
| AI-Driven Cybersecurity Automation | 8.5 | UC-3e4ea2ed-1f33-4f24-b9bd-12f80a2281f6 |
| Full-Stack AI Engineer 2026 – Machine Learning Foundations I | 8 | UC-82a51527-013f-4996-953f-bdca2ab455ea |
| Mastering AI Agents Bootcamp: Build Smart Chatbots & Tools | 2.5 | UC-3469b597-548a-48d3-b356-1cf18d17d926 |
| Full-Stack AI with Ollama: Llama, Deepseek, Mistral, QwQ | 4 | UC-0c7aaf71-35e6-4b4f-8b11-f43a47a1059b |

## Goals

- All five visible and verifiable from the portfolio.
- One compact entry, not five near-identical "Udemy" rows.
- Toolkit gains an "AI & ML" row consistent with the certificate content.

## Non-goals

- No certificate images stored in the repo; verification links replace them.
- No changes to Experience, Work, Hero, About or Contact copy.
- No new page.

## Approaches considered

- **Five separate entries.** Matches the one-row-per-item pattern, but repeats
  "Udemy" five times and pushes Education past a screenful.
- **One grouped entry with a course list (chosen).** Keeps the section readable,
  still links each course to its own verification page.
- **A separate Certifications section.** Rejected: the site already groups
  training under Education, and one entry does not justify a new section.

## Design

### `index.html` — Education order

1. S1 Informatics (existing)
2. **AI Engineering & Cybersecurity — Udemy** (new)
3. Collaborative Webinar (existing)

New entry:

```
2026
AI Engineering & Cybersecurity
Udemy · 5 courses · 29.5 hours
Coursework across AI agents, local LLM deployment, machine learning
foundations and AI-driven security automation.
<ul class="cert-list">
  <li><a href="https://ude.my/UC-…">course title</a><span class="cert-list__hours">6.5h</span></li>
  …
</ul>
```

Course titles keep their official wording, with en dashes where the certificate
uses them. Hours as `6.5h`, `8.5h`, `8h`, `2.5h`, `4h`; totals stay in `entry__org`.

### `index.html` — Skills

Add a row between Backend and "Tools & security":

- Label: `AI & ML`
- Tags: `Ollama`, `AI Agents`, `Machine Learning`, `LLM Deployment`

### `style.css`

One new block for `.cert-list` (list reset, thin top borders, link color, muted
hours on the right, max-width 660px). No changes to `.entry` or Skills styles.

## Left to the builder

- Exact line breaks in the description.
- Whether to trim long course titles; they keep official wording.
