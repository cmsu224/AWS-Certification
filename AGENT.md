# AGENT.md — AWS-Certification

## Current Session State
| | |
|---|---|
| **Last working on** | "Open Udemy" uses the app deep link udemy://discover?courseId=<id> (CLF 3142166 / SAA 2196488); Android wraps it in intent: with web fallback; "Open in browser instead" link. udemy.com universal links only cover /checkout-result, so https links never open the iOS app. SW 2026-09-29b |
| **Last file edited** | webapp/js/today.js, webapp/sw.js |
| **Next step** | Verify install on phone (Android + iPhone Safari). Done 2026-09-26: `main` pushed + default branch, Pages enabled (source: GitHub Actions). Git auth uses `gh auth setup-git` (wincredman store is broken on this PC). |
| **Pending** | User to confirm Open Udemy launches the app on their phone. Real-iPhone check of speech voices/wake lock. |

## Goal
Parent with a young kid studies ~45–60 min/day in 2–20 min phone pockets. Owns Maarek's Udemy CLF-C02 + SAA-C03 courses. Start Mon 2026-09-28 → CLF exam Fri 2026-10-23 → SAA exam Fri 2027-01-08 (50% voucher). The installable PWA at `https://cmsu224.github.io/AWS-Certification/` says exactly what to do next.

## Structure
- `docs/app-spec.md` — the spec (read first). `docs/app-build-log.md` — engine architecture, decisions, test rounds.
- `content/*.json` — questions/cards source of truth (one file per batch).
- `tools/build-data.js` (content → `webapp/js/data.js` + `data-saa.js`, stable ids) · `validate-data.js [--coverage]` · `rebalance-answers.js` · `make-audio.py` (edge-tts packs) · `udemy-curricula.json` (source of `js/course.js`).
- `webapp/` — PWA: `index.html`, `css/style.css`, `sw.js`, `manifest.webmanifest`, `icons/`, `js/` (course, data*, util, model, session, speech, listen, today, views, app). `webapp/audio/` gitignored.
- `tests/smoke.mjs` — Playwright e2e (deps in `%LOCALAPPDATA%\Temp\aws-study-e2e`).
- `.github/workflows/pages.yml` — validate → audio packs → deploy Pages.
- `study-plan/study-plan.md` — week-by-week plan. `cheat-sheets/`, `terminology/`, `flashcards/*.sh`, `quizzes/*.sh` — CLF reference + legacy terminal tools.
- `README.md` hub · `CLAUDE.md` AI guide · `AGENTS.md` Codex mirror of CLAUDE.md.

## Key decisions / history
- 2026-09-25: CLF then SAA; GitHub Pages with public repo; work on `main` (from `claude/aws-practitioner-study-We3vU`). Curricula from Udemy API (3142166 CLF, 2196488 SAA); pace speeds skim 2× / normal 1.5× / deep 1.25×.
- CLF bank had 73% answers at "B" → rebalanced; keep correct option index when editing.
- Stable ids (`clf-q-001`…), never reused (`content/retired.json`); v1 progress index i → `clf-q-(i+1)`; progress key `aws-study-progress` v2.
- Audio packs built in CI (edge-tts), not committed.
- 2026-09-26: first workflow hit usage limit; resumed. Multi-agent build finished: app engine (all spec features), 2 review rounds, icons, audio/CI, study plan.
- 2026-09-26 outcomes: **CLF 223 q / 135 c · SAA 226 q (31 multi-response) / 186 c**; `validate-data` OK; e2e **13/13 pass**; SW cache `aws-study-v2-2026-09-26d`; real audio packs verified locally (4 sections). Docs rewritten (README hub, CLAUDE.md conventions).
