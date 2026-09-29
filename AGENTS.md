# AGENTS.md — AI Assistant Guide for AWS-Certification (mirror of CLAUDE.md for Codex)

## Project Overview

A **phone-first study system for AWS CLF-C02 → SAA-C03**: an installable PWA (GitHub Pages: `https://cmsu224.github.io/AWS-Certification/`) that follows Stéphane Maarek's Udemy courses, unlocks cards/questions per finished section, schedules them with spaced repetition, reads them aloud, and runs timed exams. Plus a study plan, CLF cheat sheets, a terminology guide and legacy bash quiz tools.

**Read `docs/app-spec.md` first** — it is the spec (data contracts, progress model v2, SRS, Today engine, hands-free, audio packs, PWA, file ownership). `docs/app-build-log.md` = engine architecture, decisions, test history. `AGENT.md` = session state.

## Repository Structure

```
AWS-Certification/
├── README.md · CLAUDE.md · AGENT.md (session state) · AGENTS.md (Codex mirror of CLAUDE.md)
├── docs/
│   ├── app-spec.md            # THE spec
│   └── app-build-log.md       # engine architecture, decisions, review/test rounds
├── content/                   # SOURCE OF TRUTH: question/card batches (JSON arrays)
│   ├── clf-q-domain1..4.json, clf-q-topup.json, clf-cards*.json
│   └── saa-q-seed|g1..g8|topup-a|topup-b.json, saa-cards-*.json
├── tools/
│   ├── build-data.js          # content/*.json → webapp/js/data.js + data-saa.js; assigns ids
│   ├── validate-data.js       # schema / dup / answer / section checks; --coverage per section
│   ├── rebalance-answers.js   # evens out correct-answer positions (keeps content intact)
│   ├── make-audio.py          # edge-tts + ffmpeg → webapp/audio/<track>/<section>.mp3 + index.json
│   └── udemy-curricula.json   # raw Udemy curricula (CLF 3142166, SAA 2196488) → js/course.js
├── webapp/                    # no-build PWA (deployed as the Pages root)
│   ├── index.html · css/style.css · manifest.webmanifest · sw.js · icons/ (192, 512, maskable, apple-touch)
│   ├── audio/                 # generated audio packs — gitignored, built in CI
│   └── js/ (load order) course.js → data.js → data-saa.js → util → model → session
│                             → speech → listen → today → views → app
├── tests/smoke.mjs            # Playwright e2e smoke test (13 checks)
├── .github/workflows/pages.yml  # validate → audio packs (cached) → deploy Pages
├── study-plan/study-plan.md   # week-by-week CLF → SAA plan
├── cheat-sheets/01..04-*.md   # CLF domain cheat sheets (ASCII diagrams)
├── terminology/aws-terminology-guide.md
├── flashcards/flashcard-quiz.sh · quizzes/practice-exam.sh   # legacy CLF terminal tools
```

## Content (questions & flashcards)

- **`content/*.json` is the source of truth. Never hand-edit `webapp/js/data.js` / `data-saa.js`** — run `node tools/build-data.js` then `node tools/validate-data.js --coverage` (must print `OK`).
- Track from filename prefix (`clf-`/`saa-`); kind from `-cards` (card) vs otherwise (question).
- **Stable ids** `clf-q-001`, `clf-c-001`, `saa-q-001`, `saa-c-001`. `build-data.js` assigns the next free number to items without an id and writes it back. Ids are **never reused or renumbered**; to retire an item delete it and record its id in `content/retired.json` (honoured by the builder). Progress references ids only.
- Flashcard: `{ id, term, definition, category, section }`
  - CLF categories: compute, storage, database, network, security, billing
  - SAA categories: + integration, management, analytics
- Question: `{ id, question, options, answer, explanation, domain, section }`
  - Single answer: 4 options, `answer` = index 0–3.
  - Multi-response (SAA only, ~15%): 5 options, `answer` = `[i, j]`, text contains "(Choose TWO.)"; graded all-or-nothing.
  - Domains: CLF `domain1..4` (24/30/34/12), SAA `saa1..4` (Secure 30 / Resilient 26 / High-Performing 24 / Cost 20).
- `section` = a section id from `COURSES.<track>.sections` (e.g. `clf-05`), or `null` (always unlocked). Items unlock when their section is done.
- Keep correct answers spread across positions (use `tools/rebalance-answers.js`); when editing a question keep the correct option at its index.
- Current counts (2026-09-26): CLF 223 q / 135 c · SAA 226 q (31 multi) / 186 c.

## Course data

`webapp/js/course.js` (`COURSES.clf|saa`, `PACE_SPEED`) was generated from `tools/udemy-curricula.json` with hand-assigned `pace` per section (trivial/skim/normal/deep → 2/2/1.5/1.25× playback). Lectures: `[title, seconds, kind]` (v video, h hands-on, a article, q quiz, p practice test, r role-play). Don't edit course.js unless told to; section ids are referenced by content and progress.

## Web App (`webapp/`)

- **Pure HTML/CSS/vanilla JS, classic `<script>` globals, no build, no deps, no external calls** (except its own `audio/`). Relative URLs only (served from a sub-path).
- Mobile-first (390×844, ≥44px targets, safe areas), dark theme tokens in `style.css`. No `alert/confirm/prompt` — inline panels/toasts.
- Module map: `util.js` (dates incl. `aws-study-fake-today`, storage wrappers, toast, `ACTIONS`) · `model.js` (progress v2, migration, SRS, course pace, readiness) · `session.js` (review/quiz/exam sessions, results) · `speech.js` (hands-free, wake lock, Media Session) · `listen.js` (audio packs, Cache `aws-audio`) · `today.js` (Today + exam-prep) · `views.js` (Course/Review/Quiz/More) · `app.js` (router, events, timer, SW registration/update).
- **Progress**: localStorage `aws-study-progress`, `version: 2` (shape in the spec). v1 is migrated (backup `aws-study-progress-v1-backup`); corrupt data backed up to `aws-study-progress-corrupt-backup`. Every storage access in try/catch.
- **Service worker**: bump `CACHE_NAME` in `webapp/sw.js` (currently `aws-study-v2-2026-09-29a`) whenever any shell file (html/css/js/manifest/icons) changes. Must keep a `fetch` handler; the manifest + 192/512 icons keep it installable.
- **Audio packs** are built by `tools/make-audio.py` in the Pages workflow (cached by data/course hash) — never commit `webapp/audio/`. Local: `python tools/make-audio.py --sections clf-06,saa-20` (needs `pip install edge-tts`, ffmpeg).

## Testing

- `node tools/validate-data.js --coverage` — data checks.
- `node tests/smoke.mjs` (or `node tests/smoke.mjs 2,5` for a subset) — Playwright/Chromium e2e; serves `webapp/` via `python -m http.server 8765`. Deps live **outside the repo** in `C:\Users\rschi\AppData\Local\Temp\aws-study-e2e` (`npm init -y && npm i playwright && npx playwright install chromium`; override with `E2E_DEPS`). Check 8 needs real audio packs in `webapp/audio/`. Status 2026-09-26: 13/13 pass.

## Deployment

Push to `main` → `.github/workflows/pages.yml`: validate → generate audio packs → upload `webapp/` → deploy. Repo must be public with Pages source = **GitHub Actions**.

## Other content conventions

### Study plan (`study-plan/study-plan.md`)
Explains how the app drives each day and gives the week-by-week CLF → SAA map (dates, sections, effective minutes). Keep dates consistent with `docs/app-spec.md`.

### Cheat sheets (`cheat-sheets/`)
- One file per CLF domain, prefixed `01-`…`04-`; new files kebab-case with numeric prefix.
- **ASCII box-drawing diagrams** (`┌─┐│└─┘═╔╗╚╝`), tables, memory tricks and analogies. Open with domain name, weight and why it matters.

### Terminology (`terminology/`)
Three columns **Term | Definition | Analogy**; ends with an acronym decoder table.

### Legacy terminal tools (`flashcards/`, `quizzes/`)
- Bash only, no external deps; `$RANDOM` shuffle; ANSI colors (RED, GREEN, YELLOW, BLUE, CYAN, BOLD, NC).
- Pipe-delimited data: cards `"TERM|DEFINITION|CATEGORY"`, questions `"QUESTION|A|B|C|D|CORRECT_LETTER|EXPLANATION|DOMAIN"` — no unescaped `|` in fields.
- Optional category/domain argument filters content. These are independent of `content/` (not generated).

## General

- No package manager / build step in the repo; e2e deps stay outside it.
- README.md is the navigation hub — update its tables, counts and repo map when adding files.
- Work on `main`. An autosave loop may commit WIP; don't rewrite history.
