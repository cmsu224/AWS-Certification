# SPEC — Phone-first AWS study app (CLF-C02 → SAA-C03)

Repo: `C:\Git\Personal Projects\AWS-Certification` (branch `main`). Read its `CLAUDE.md`.
Content source of truth: `content/*.json` (one file per batch). Build: `node tools/build-data.js` then `node tools/validate-data.js --coverage`.

## The user
Parent of a young kid. Studies ~45–60 min/day total, in 2–20 min pockets, mostly on a PHONE (sometimes laptop), often interrupted, sometimes hands busy (walking/rocking/driving → audio). Owns Stéphane Maarek's Udemy courses for CLF-C02 and SAA-C03 (not started). Path: CLF first (exam ≈ Fri 2026-10-23), then SAA (exam ≈ Fri 2027-01-08, using the 50% voucher earned by passing CLF). Start date Mon 2026-09-28.

## Hard constraints
- Pure HTML/CSS/vanilla JS. No build step, no npm deps, no frameworks, no external network calls from the app (except fetching its own `audio/index.json` + mp3s). Must work opened via GitHub Pages at `https://cmsu224.github.io/AWS-Certification/` (sub-path! use relative URLs everywhere).
- Mobile-first (test at 390×844), one-thumb reachable controls, big tap targets (≥44px), dark theme using existing tokens in `webapp/css/style.css`. Respect safe-area insets.
- Every `localStorage` access wrapped in try/catch. The app must render correctly with empty/corrupt storage.
- Interruption-proof: never use `alert/confirm/prompt` (use inline panels/toasts). Persist in-progress quiz/flashcard sessions so reopening resumes them.

## Data contracts (globals loaded via <script> tags, in this order)
`js/course.js` → `js/data.js` → `js/data-saa.js` → app scripts.

- `COURSES.clf|saa = { title, author, url, totalMinutes, sections: [ { id:"clf-05", n:5, title, minutes, pace, lectures:[[title, seconds, kind], ...] } ] }`
  - kind: v video, h hands-on video, a article, q Udemy section quiz, p practice test, r role-play. Quizzes/practice tests have seconds 0.
  - pace: trivial | skim | normal | deep. `PACE_SPEED = {trivial:2, skim:2, normal:1.5, deep:1.25}` = suggested playback speed; "effective minutes" = minutes / speed.
- CLF: `FLASHCARDS`, `QUESTIONS`, `FLASHCARD_CATEGORIES` (compute, storage, database, network, security, billing), `QUIZ_DOMAINS` (domain1..4, weights 24/30/34/12).
- SAA: `SAA_FLASHCARDS`, `SAA_QUESTIONS`, `SAA_FLASHCARD_CATEGORIES` (compute, storage, database, network, security, integration, management, analytics), `SAA_QUIZ_DOMAINS` (saa1 Secure 30%, saa2 Resilient 26%, saa3 High-Performing 24%, saa4 Cost-Optimized 20%).
- Flashcard: `{ id:"clf-c-001", term, definition, category, section }`
- Question: `{ id:"saa-q-001", question, options, answer, explanation, domain, section }`
  - Single-answer: 4 options, `answer` = index 0–3.
  - Multi-response (SAA only, ~15%): 5 options, `answer` = [i, j], question text contains "(Choose TWO.)". Graded all-or-nothing, like the real exam.
- `section` = a section id of that track's course (or null = not tied to a section → always unlocked).
- ids are stable forever. Never reuse a retired id. Progress references ids only.

Validate data anytime: `node tools/validate-data.js --coverage` (from repo root).

## Progress model (localStorage key `aws-study-progress`, version 2)
```
{ version: 2,
  settings: { track:"clf", startDate:"2026-09-28", examDates:{clf:"2026-10-23", saa:"2027-01-08"},
              dailyMinutes:50, reviewDays:{clf:7, saa:21}, newPerDay:20,
              speech:{rate:1, pauseSec:5, voiceURI:null} },
  streak: { count, lastDate },            // YYYY-MM-DD local dates
  dayLog: { "YYYY-MM-DD": { cards, questions, lectureMin } },
  tracks: { clf: TrackState, saa: TrackState } }
TrackState = { lecturePos: { sectionId: nextLectureIndex },   // section done when == lectures.length
               sectionDoneAt: { sectionId: "YYYY-MM-DD" },
               srs: { itemId: { box, due:"YYYY-MM-DD", seen, lapses } },
               quizHistory: [ { date, mode, score, total, correct, domains:{d:{correct,total}} } ],
               domainStats: { d: { correct, total } },         // lifetime
               recent: [ { id, domain, ok } ],                 // last 200 answers, for readiness
               session: null | {...}                           // resumable quiz/card session
               passedAt: null | "YYYY-MM-DD" }
```
**Migration from v1** (old shape: `{quizHistory, missedQuestions:[index], seenQuestions:[index], cardsStudied, lastActiveDate, streak, domainScores}`): v1 index `i` refers to CLF question id `clf-q-${pad3(i+1)}`. Map missed → srs box 0 due today, seen → srs box 1; carry quizHistory, domainScores→domainStats, streak. Keep a one-time backup at `aws-study-progress-v1-backup`.

## Spaced repetition (Leitner) — cards AND questions
- Boxes 0..5, intervals `[0, 1, 3, 7, 16, 35]` days. Correct/"Knew it" → box+1 (max 5), due = today + interval[newBox]. Wrong/"Didn't know" → box 0, due today, lapses++.
- An item is **unlocked** when its section is done (or section null). Unlocked items not yet in `srs` are "new"; introduce up to `newPerDay` new items/day, in course order.
- "Due today" = srs items with due ≤ today. Wrong answers re-appear later in the same session once.

## Today screen (default view) — "open app → know what to do"
Header: track pill (CLF/SAA) · exam countdown ("27 days to CLF") · streak.
Pace line: remaining effective lecture minutes ÷ days until course-done target (examDate − reviewDays) → "~24 min of lectures/day · On track ✅ / Behind by 40 min ⚠️".
Big action cards (full-width, thumb-friendly), in this order:
1. 🎓 **Next lecture block** — next ~20 effective minutes of lectures from the current `lecturePos` (never split a lecture; at least 1 lecture), e.g. "§27 Networking – VPC · lectures 7–12 · 19 min @1.5× · open Udemy app". Shows lecture titles collapsed. Buttons: "✓ Done" (advances lecturePos; when a section completes, unlock its items + toast "12 new cards unlocked") and "Open course" (link to course url). Hands-on lectures flagged 💻 "watch now, try on laptop at weekend". Udemy section quizzes (kind q) listed as "do the Udemy quiz".
2. ⚡ **2-minute review** — due count; runs up to 15 due items (cards + questions mixed).
3. 🎧 **Hands-free** — starts spoken review.
4. 📝 **5 quick questions** — weighted to weakest domain among unlocked questions.
When all sections done → switch Today to **Exam-prep mode**: readiness % per domain (from `recent`, weighted by domain weight), full timed exam button (CLF 65Q/90min pass 70%; SAA 65Q/130min pass 72%), weak-domain drills, "Book the exam when you score ≥80% on two full exams", checklist. After exam date or "I passed 🎉" → offer switching to SAA (and remind about the 50% voucher).

## Other views (bottom nav, max 5): Today · Course · Review · Quiz · More
- **Course**: section checklist for the track (collapsible, lecture-level tick boxes, pace badge skim/deep, effective minutes, % complete). Tick/untick any lecture.
- **Review**: flashcards by category or "due", SRS-driven, "Knew it / Didn't know", swipe or buttons.
- **Quiz**: existing modes (quick 20, full exam, by domain, missed/due) for the active track; multi-response UI (checkbox-style, Submit); timer; results with domain breakdown; resumable.
- **More**: Listen (audio packs), Progress (history, coverage, readiness), Settings (track, exam dates, daily minutes, new/day, speech rate/pause/voice, export/import JSON, reset with inline confirm), About/Help ("how to study with a kid" tips).

## Hands-free mode
Web Speech `speechSynthesis`. Queue = due items, else items of the current/most recent section, else random unlocked. Card: speak term → pause `pauseSec` → speak definition. Question: speak question + "A: … B: …" → pause → "Answer: B. …" + explanation. Auto-advance. Huge Play/Pause, Next, Back buttons; show text on screen. Request Screen Wake Lock while playing (re-acquire on visibilitychange). Handle voices loading async (`voiceschanged`). Chrome bug: long utterances cut off → split text into sentences. Does not grade (marks items seen only).

## Audio packs (Listen)
Generated by `tools/make-audio.py` into `webapp/audio/` (NOT committed; built in the GitHub Pages workflow; `.gitignore` it). Format:
`webapp/audio/index.json` = `{ "generated": "ISO date", "tracks": { "clf": [ { "section":"clf-05", "title":"EC2 - Elastic Compute Cloud", "file":"audio/clf/clf-05.mp3", "seconds": 312, "items": 18 } ], "saa": [...] } }`
Each MP3 = spoken review of that section's items (card term → ~2s pause → definition; question → options → pause → answer + explanation). App's Listen view fetches `audio/index.json` (gracefully shows "Audio packs are generated when the site is deployed" if missing), lists packs for the active track (unlocked sections first), plays via `<audio>`, sets Media Session metadata (lock-screen controls), and offers "⬇ Save offline" per pack (stores in Cache Storage `aws-audio`).

## PWA
- `webapp/manifest.webmanifest` (replace manifest.json): name "AWS Cert Study", short_name "AWS Study", id "./", start_url "./", scope "./", display standalone, dark colors, icons `icons/icon-192.png`, `icons/icon-512.png`, `icons/maskable-512.png` (purpose maskable); `apple-touch-icon` link to `icons/apple-touch-icon.png` (180).
- `webapp/sw.js`: precache the shell (index.html, css, all js, manifest, icons); network-first (with cache fallback) for navigations + `js/*` so content updates arrive; cache-first for icons; audio: serve from `aws-audio` cache if present (answer Range requests with a 206 slice), else pass through to network. Bump cache name. Has a `fetch` handler.
- In-app "Update available — tap to refresh" toast when a new SW is waiting.

## File ownership (parallel agents — do NOT edit files you don't own)
- App engineer: `webapp/index.html`, `webapp/css/*`, `webapp/js/app.js` (+ any new `webapp/js/*.js` except course.js/data*.js), `webapp/sw.js`, `webapp/manifest.webmanifest` (delete `webapp/manifest.json`).
- Audio/deploy engineer: `tools/make-audio.py`, `.github/workflows/pages.yml`, `.gitignore`.
- Icon maker: `webapp/icons/*`.
- Plan writer: `study-plan/*`.
- Content agents: only their own batch JSON in `content/`. `tools/build-data.js` rebuilds `webapp/js/data.js` + `data-saa.js` from the batches (orchestrator runs it).
- Nobody edits `webapp/js/course.js` or `tools/validate-data.js` without being told to.
- Do not commit or push. Do not run `git checkout`/`reset`/`stash`.
