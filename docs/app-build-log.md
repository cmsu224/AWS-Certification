# App build log (webapp engine)

Spec: `docs/app-spec.md`. Classic `<script>` globals, load order:
`course.js → data.js → data-saa.js → util.js → model.js → session.js → speech.js → listen.js → today.js → views.js → app.js`

## Architecture
| File | Role / main functions |
|---|---|
| `js/util.js` | `today()` (honours `aws-study-fake-today`), `addDays`/`daysBetween`, `storeGet/SetJSON`, `$`/`esc`/`shuffle`, `toast()`, `ACTIONS` registry |
| `js/model.js` | `T(t)` track data (guarded getters, works with 0 items), `P` progress v2: `loadProgress/saveProgress/normalizeProgress/migrateV1`; SRS `gradeItem/dueItems/newItems/newQuota/markSeen/checkAnswer`; course `lecPos/setLecturePos/isSectionDone/courseStats/paceInfo`; stats `srsSummary/readiness/weakestDomain` |
| `js/session.js` | builders `buildReviewIds/buildQuizIds/buildCardIds/buildWeakIds`; `startSession/answerCurrent/gradeCard/nextItem/examNav/finishSession`; `renderSession/renderResult` |
| `js/speech.js` | hands-free: `hfBuildQueue/hfPlay/hfPause/hfJump`, sentence chunking, watchdog, wake lock, Media Session |
| `js/listen.js` | `loadAudioIndex/packsFor/playPack/savePack` (Cache `aws-audio`), persistent `#player-dock` |
| `js/today.js` | `nextLectureBlock`, `renderToday` (resume, pace, lecture block, review, hands-free, 5 Q; exam-prep mode; next-track card), `setTrack` |
| `js/views.js` | `renderCourse/renderReview/renderQuiz/renderMore` (+ Progress, Settings w/ export/import/reset, Help) |
| `js/app.js` | `UI` state, `render()/go()`, click→`ACTIONS`, change (settings/import), swipe, keyboard, exam timer, SW register + update toast, `boot()` |
| `sw.js` | precache shell (per-file, missing icons tolerated); network-first navigations/js/css; cache-first icons; audio from `aws-audio` with Range→206 |

## Status — all spec features implemented (2026-09-26)
- [x] util, model (v2 + v1 migration + backup key), session, speech, listen, today, views, app
- [x] index.html, style.css (rewritten, same tokens), manifest.webmanifest (manifest.json deleted), sw.js
- [x] Verified in headless Chrome @390×844: Today, review session, lecture Done + unlock toast, all views, exam resume after reload, v1 migration, corrupt storage, SAA multi-response, exam-prep mode, past-exam-date SAA switch card, Listen (mocked index), offline reload via SW.

## Remaining / ideas
- Icons appear in `webapp/icons/` from the icon maker (404 until then; SW install tolerates it).
- Not tested on a real iPhone (speech voices, wake lock).
- Bump `CACHE_NAME` in sw.js whenever shell files change.

## Decisions
- SRS entries get extra field `intro` (date first graded) to count new items/day; migrated v1 items have `intro:null`.
- Promotion only when item is due (not-yet-due correct → seen++ only); wrong always → box 0, lapses++ (incl. first attempt).
- New items interleave card/question within course order; review = due first, then new up to quota.
- Review sessions re-queue a wrong item once (4 positions later); quizzes don't. Exam mode: no feedback, graded at finish, timer only runs while visible.
- Full exam samples the WHOLE bank by domain weight; other quizzes use unlocked questions only.
- Lecture minutes logged per action capped at 90 (bulk catch-up ticks). Only Undo subtracts (exact logged amount).
- Hands-free only bumps `seen` on existing SRS entries; queue = due → most recent done section with items → random unlocked.
- SW: no auto skipWaiting; page shows "Update available" bar → SKIP_WAITING → reload on controllerchange (if page was already controlled or the user tapped Update).
- Boot always opens Today unless the user was inside a session (then resumes it).
- Extra TrackState fields: `startedAt` (SAA pace start), `checklist` (exam-prep checklist).

## Review round fixes (2026-09-26)
- SRS `intro` set only for items first graded in a **review** session (quizzes no longer eat newPerDay). Wrong answer always `lapses++`.
- Locked items never enter SRS: `gradeItem(..., {statsOnly})` for locked exam/quiz items (stats/readiness still count). `dueItems`/`srsSummary` skip locked items.
- `normSession()` fully normalizes stored sessions; exam `picks` keyed by **question id** (old position keys re-keyed). Multi-response counts as answered only when complete.
- Exam domain allocation = largest remainder (exactly 65; CLF 16/19/22/8).
- Import accepts only v2 (`version===2` + tracks/settings) or v1-shaped objects; unknown versions → defaults, never migrated.
- Corrupt progress JSON copied to `aws-study-progress-corrupt-backup` before defaults are saved.
- `setLecturePos(t,sid,pos,undoMin)`: plain unticks leave dayLog alone; Undo subtracts exactly what the tick logged (returned as `loggedMin`).
- v1 migration keeps per-quiz `domainScores`. New items ranked within their section (card/question alternate).
- History API: go()/More sub-pages push state, popstate restores view (Android back). Focus moves to the view h1; in-view re-renders restore focus. `#main` no longer aria-live.
- SW: network-first races a 3s timeout against the cache (fetch continues via waitUntil). Update toast reloads even on first-visit pages (`SW.accepted`).
- Speech: chunker splits only on `.!?;` + whitespace (not after e.g./vs.), never on ':'; 180-char cut at a space. Non-cancel speech errors pause + toast. Wake lock released if paused mid-request. Hands-free pauses the Listen pack and vice versa; Media Session playbackState maintained, cleared on dock close.
- Listen: saved packs stamped with `X-Pack-Version` (hash/version field if present, else seconds|items); stale copies deleted in refreshSaved. `navigator.storage.persist()` on save.
- CSS: `.btn.small`, `.pill`, `.toast-btn`, lecture/miss summaries ≥44px; More-menu rows keep card styling. Swipe: touchcancel reset, horizontal-only translate. Discard session has Undo.

## E2E smoke test (2026-09-26)
- `tests/smoke.mjs` — Playwright/Chromium @390×844, 9 checks (fresh load, v1 migration, lecture Done/unlock, SRS + fake tomorrow, quiz single + SAA multi + resume, settings date/export/import/inline reset with dialog trap, hands-free w/o speech, Listen w/ and w/o fake pack, SW + manifest + offline). Serves `webapp/` itself via `python -m http.server 8765`; fake audio pack is created and deleted by the test.
- Deps outside repo: `C:\Users\rschi\AppData\Local\Temp\aws-study-e2e` (`npm init -y && npm i playwright && npx playwright install chromium`). Run: `node tests/smoke.mjs` (or `node tests/smoke.mjs 2,5` for a subset).
- Fixed: hands-free without `speechSynthesis` showed only an error panel → now shows the queue as a read-along (Show answer / ⏭ / ⏮) plus a note linking to Listen; `handsfree` action no longer calls `hfPlay()` (and its toast) when speech is missing. `sw.js` cache → `aws-study-v2-2026-09-26c`.
- Note: More remembers its last sub-page (tapping More again returns to the menu) — by design.

## Review round 2 fixes (2026-09-26) — `sw.js` cache → `aws-study-v2-2026-09-26d`
- **Session slot guard**: `startSession(o, force)` won't overwrite a paused session that has progress (pos>0, results, picks or any exam) → `UI.pendingStart` + inline "Resume it / Replace it / Cancel" panel (rendered above any view by `render()`); Replace has an 8s Undo.
- **Settings**: `setSettingPath` compares the normalized value with the input; rejected values keep the *previous* value (not the factory default) and re-render the input.
- **Unlock stability**: `sectionUnlocked()` = lecturePos complete OR `sectionDoneAt` set, so lectures added by a course.js update don't relock items. Completing again keeps the original date; a real untick deletes `sectionDoneAt`; `undoLecture()` restores it.
- **Lecture minutes**: day total capped at 2× daily goal; Course "Mark whole section done" and ticks outside the current section log nothing (`setLecturePos(..., {noLog})`). Daybar shows "✓ Goal met".
- **Readiness**: domains with no answers count as 0; `provisional` until every domain has ≥10 answers (`READY_MIN_N`), labelled on Today + Progress.
- **Exam session**: retired ids at the end of an exam clamp `pos` instead of auto-submitting; cleaned queue is saved.
- **Results** carry `track`; `resultForTrack()` hides another track's result; `setTrack` clears `UI.result`/`pendingStart`.
- **Hands-free** queue rebuilt when built on another day or for the other track (`HF.builtOn/HF.track`).
- **loadProgress**: any non-v2 blob is backed up (v1 → v1 key, anything else → corrupt key); `backupRaw` never overwrites an existing backup (adds `-<timestamp>` key).
- **UI**: toast hidden on view change/session start; moves to the top when a `.thumb-bar`/`.hf-controls` is on screen (`body.has-thumbbar`); Undo button is ghost-styled. Hands-free controls are a sticky bottom bar. Update prompt is now an inline card at the top of Today (`#update-toast` removed from index.html). Exam-prep order: readiness (compact, domain bars folded) → full exam ("Next: … x of 2 at 80%+") → weak drills → review + hands-free → checklist; single "I passed" button. Lecture card: "Open Udemy ↗" primary until tapped, then Done; nowrap buttons; clearer pace line. Font floors raised (.small 14px, card-sub/lec rows 15px+, nav 12px, multi-select hint `.q-hint`). Course shows effective minutes, pluralised items, pace badge only for skim/deep. Quiz domain rows labelled; q-meta says new/learning/reviewing/mastered instead of "box N". `.opt.dim` uses muted colour at full opacity; More-menu chevrons centred.
- **Tests**: `firstSectionWithItems` now needs ≥2 cards + ≥2 questions (clf-01 has one card after the 15:02 content build); check 2 unlocks the migrated misses' sections before `dueItems`. New check 10 (paused exam guard, toast vs thumb bar, rejected settings kept, readiness). 10/10 pass.

## E2E round 3 (2026-09-26) — 13/13 pass, no app bugs found
- Data: `build-data` CLF 223q/135c · SAA 226q/186c; `validate-data` OK.
- Real audio packs (edge-tts via `tools/make-audio.py --sections clf-06,clf-19,saa-20,saa-31`): 441/296/480/334 s, ffprobe matches index.json ±1 s; saa-20 contains a "(Choose TWO.)" question. `webapp/audio/` stays local (gitignored).
- Check 8 now uses the real packs: 404 index → friendly message; list/titles; play (duration = index); Save offline → `aws-audio` entry with full size + `X-Pack-Version`; then context offline **and** server stopped → reload, Listen from SW cache, Range `bytes=1000-1999` / `bytes=-500` → 206 with correct Content-Range, unsaved pack unreachable, offline playback + seek near the end.
- New: 10 = SAA Today at fake 2026-11-20 with seeded realistic progress (`buildSaaProgress`: CLF passed 10-23, SAA started 10-26, ~40% done, next section half watched) — pace/per-day/behind/target recomputed independently; 11 = last lecture → exam-prep mode, 65-Q SAA exam, timer 2:10:00 ticking; 12 = 35+ screens at 360px incl. sessions, exam multi-response, hands-free, Listen + dock (overflow detector self-test: `E2E_SELFTEST=1`). Old 10 → 13.
