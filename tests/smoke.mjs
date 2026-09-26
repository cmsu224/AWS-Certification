// ============================================================
//  AWS Cert Study — end-to-end smoke test (Playwright, Chromium, 390x844)
//
//  Deps live OUTSIDE the repo (no package.json / node_modules here):
//    mkdir %LOCALAPPDATA%\Temp\aws-study-e2e   (C:\Users\rschi\AppData\Local\Temp\aws-study-e2e)
//    cd C:\Users\rschi\AppData\Local\Temp\aws-study-e2e
//    npm init -y && npm i playwright && npx playwright install chromium
//
//  Run (from anywhere; playwright is resolved from the dir above, override with E2E_DEPS):
//    node "C:\Git\Personal Projects\AWS-Certification\tests\smoke.mjs"
//
//  The script serves webapp/ itself with `python -m http.server` (port 8765, override PORT)
//  and stops it at the end (check 8 stops + restarts it to prove offline playback).
//  Check 8 needs REAL packs in webapp/audio/ (gitignored), e.g.
//    python tools/make-audio.py --sections clf-06,clf-19,saa-20,saa-31
//  ffprobe on PATH (optional) cross-checks index.json durations.
//  Exit code 0 = all green, 1 = at least one check failed.
// ============================================================
import { createRequire } from 'node:module';
import { spawn, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const DEPS = process.env.E2E_DEPS || 'C:/Users/rschi/AppData/Local/Temp/aws-study-e2e';
const require = createRequire(path.join(DEPS, 'package.json'));
const { chromium } = require('playwright');

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WEBAPP = path.join(REPO, 'webapp');
const PORT = Number(process.env.PORT || 8765);
const BASE = `http://127.0.0.1:${PORT}/`;
const VIEWPORT = { width: 390, height: 844 };

const results = [];
let server = null;
let browser = null;

function assert(cond, msg) { if (!cond) throw new Error(msg); }
const listOr = (v) => (Array.isArray(v) ? v : []);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------- server ----------------
async function startServer() {
  server = spawn('python', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: WEBAPP, stdio: 'ignore' });
  for (let i = 0; i < 50; i++) {
    try { const r = await fetch(BASE + 'index.html'); if (r.ok) return; } catch (e) { /* not up yet */ }
    await sleep(200);
  }
  throw new Error('python http.server did not start on port ' + PORT);
}
function stopServer() { if (server) { try { server.kill(); } catch (e) { /* ignore */ } server = null; } }

// ---------------- page helpers ----------------
/** New isolated context + page that records console errors, page errors and dialogs. */
async function newPage(opts = {}) {
  const ctx = await browser.newContext({ viewport: opts.viewport || VIEWPORT, isMobile: true, hasTouch: true,
    serviceWorkers: opts.sw ? 'allow' : 'block', acceptDownloads: true });
  if (opts.init) await ctx.addInitScript(opts.init);
  const page = await ctx.newPage();
  const errors = [];
  const allow = opts.allowErrors || [];
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const txt = m.text() + ' @ ' + ((m.location() || {}).url || '');
    if (allow.some((re) => re.test(txt))) return;
    errors.push('console: ' + txt);
  });
  page.on('pageerror', (e) => errors.push('pageerror: ' + (e && e.stack || e)));
  page.on('dialog', async (d) => { errors.push('DIALOG fired (' + d.type() + '): ' + d.message()); try { await d.dismiss(); } catch (e) { /* ignore */ } });
  page.errors = errors;
  page.ctx = ctx;
  return page;
}
async function open(page) {
  await page.goto(BASE, { waitUntil: 'load' });
  await page.waitForFunction(() => typeof P !== 'undefined' && P && document.querySelector('#main .today-head, #main .sess, #main .view-head'));
}
/** Seed localStorage keys (object of key → string|object) then reload the app. */
async function seed(page, items) {
  // Leave the app first (it saves progress on hide/unload), then write storage from a same-origin non-app URL.
  await page.goto(BASE + 'manifest.webmanifest');
  await page.evaluate((items) => {
    localStorage.clear();
    for (const k in items) localStorage.setItem(k, typeof items[k] === 'string' ? items[k] : JSON.stringify(items[k]));
  }, items);
  await open(page);
}
function noErrors(page, label) {
  assert(!page.errors.length, (label || '') + ' errors:\n  ' + page.errors.join('\n  '));
}
const ev = (page, fn, arg) => page.evaluate(fn, arg);
async function click(page, sel) { await page.locator(sel).first().click(); }
async function text(page, sel) { return (await page.locator(sel).first().textContent()) || ''; }

/** Open a More sub-page (More remembers the last sub-page, so tap More again to reach the menu if needed). */
async function gotoMore(page, sub) {
  await click(page, '#bottom-nav [data-view="more"]');
  if (!(await page.locator('#main [data-act="more"][data-page="' + sub + '"]').count())) await click(page, '#bottom-nav [data-view="more"]');
  await click(page, '#main [data-act="more"][data-page="' + sub + '"]');
}

async function check(name, fn) {
  const t0 = Date.now();
  try {
    await fn();
    results.push({ name, ok: true, ms: Date.now() - t0 });
    console.log('PASS  ' + name);
  } catch (e) {
    results.push({ name, ok: false, err: String(e && e.message || e) });
    console.log('FAIL  ' + name + '\n      ' + String(e && e.message || e).split('\n').join('\n      '));
  }
}

// Returns the first section (course order) whose completion unlocks at least 2 cards and 2 questions
// (tiny intro sections with a single card can't exercise Knew it + Didn't know).
async function firstSectionWithItems(page, t) {
  return ev(page, (t) => {
    const s = T(t).sections.find((x) => {
      const its = sectionItems(t, x.id);
      return its.filter((i) => i.options).length >= 2 && its.filter((i) => !i.options).length >= 2;
    });
    return s ? { id: s.id, n: s.lectures.length, items: sectionItems(t, s.id).map((i) => i.id) } : null;
  }, t);
}

// ============================================================
//  Checks
// ============================================================
async function check1() {
  const page = await newPage({ sw: true });
  try {
    await open(page);
    await page.waitForTimeout(800);
    const head = await text(page, '.today-head .countdown');
    assert(/\d+ days to CLF|CLF exam/.test(head), 'countdown missing, got "' + head + '"');
    const pace = await text(page, '.pace');
    assert(/lectures\/day|Catch-up/.test(pace), 'pace line missing, got "' + pace + '"');
    assert(await page.locator('.card.lecture [data-act="lec-done"]').count() === 1, 'next lecture block (with Done) missing');
    const title = await text(page, '.card.lecture .card-title');
    assert(/§\d+/.test(title), 'lecture block title looks wrong: ' + title);
    const overflow = await ev(page, () => document.documentElement.scrollWidth > window.innerWidth + 1);
    assert(!overflow, 'horizontal page scroll at 390px');
    noErrors(page, 'fresh load');
  } finally { await page.ctx.close(); }
}

async function check2() {
  const page = await newPage();
  try {
    await open(page);
    const v1 = { quizHistory: [{ date: '2026-09-20T10:00:00Z', mode: 'Quick Quiz', score: 60, total: 5, correct: 3 }],
      missedQuestions: [0, 5], seenQuestions: [0, 1, 5], cardsStudied: 10, lastActiveDate: 'Sun Sep 20 2026', streak: 2,
      domainScores: { domain1: { correct: 3, total: 5 } } };
    await seed(page, { 'aws-study-progress': v1 });
    const r = await ev(page, () => {
      const saved = JSON.parse(localStorage.getItem('aws-study-progress'));
      const tr = saved.tracks.clf, t0 = today();
      return { version: saved.version, t0, s1: tr.srs['clf-q-001'], s6: tr.srs['clf-q-006'], s2: tr.srs['clf-q-002'],
        // Locked items never show as due: unlock the sections of the migrated misses first.
        dueNow: (['clf-q-001', 'clf-q-006'].forEach((id) => { const it = itemById('clf', id); const sec = it && it.item.section && secById('clf', it.item.section);
          if (sec) setLecturePos('clf', sec.id, sec.lectures.length); }), dueItems('clf')), hist: tr.quizHistory, ds: tr.domainStats, streak: saved.streak,
        backup: localStorage.getItem('aws-study-progress-v1-backup') };
    });
    assert(r.version === 2, 'version is ' + r.version);
    for (const [id, e] of [['clf-q-001', r.s1], ['clf-q-006', r.s6]]) {
      assert(e && e.box === 0 && e.due <= r.t0, id + ' not due: ' + JSON.stringify(e));
    }
    assert(r.dueNow.includes('clf-q-001') && r.dueNow.includes('clf-q-006'), 'dueItems() lacks migrated misses: ' + JSON.stringify(r.dueNow));
    assert(r.s2 && r.s2.box === 1, 'seen clf-q-002 not box 1: ' + JSON.stringify(r.s2));
    assert(r.hist.length === 1 && r.hist[0].score === 60 && r.hist[0].correct === 3 && r.hist[0].date === '2026-09-20', 'quizHistory not kept: ' + JSON.stringify(r.hist));
    assert(r.ds.domain1 && r.ds.domain1.correct === 3 && r.ds.domain1.total === 5, 'domainStats not migrated');
    assert(r.streak.count === 2, 'streak not carried');
    assert(r.backup && JSON.parse(r.backup).missedQuestions.length === 2, 'v1 backup key missing');
    // Reload again: stays v2, backup untouched, still renders
    await open(page);
    assert(await page.locator('.today-head').count() === 1, 'Today not rendered after migration');
    noErrors(page, 'migration');
  } finally { await page.ctx.close(); }
}

const FAKE_DAY = '2026-09-28';

async function check3() {
  const page = await newPage();
  try {
    await open(page);
    await seed(page, { 'aws-study-fake-today': FAKE_DAY });
    const sid = await page.locator('.card.lecture [data-act="lec-done"]').getAttribute('data-sec');
    const to = Number(await page.locator('.card.lecture [data-act="lec-done"]').getAttribute('data-to'));
    const before = await ev(page, (sid) => lecPos('clf', sid), sid);
    await click(page, '.card.lecture [data-act="lec-done"]');
    const after = await ev(page, (sid) => JSON.parse(localStorage.getItem('aws-study-progress')).tracks.clf.lecturePos[sid], sid);
    assert(after === to && after > before, `lecturePos ${sid}: before ${before}, expected ${to}, got ${after}`);

    // Keep pressing Done until the first section that has items completes.
    const target = await firstSectionWithItems(page, 'clf');
    assert(target, 'no CLF section has items');
    const lockedBefore = await ev(page, (ids) => ids.filter((id) => !isUnlocked('clf', itemById('clf', id).item)).length, target.items);
    assert(lockedBefore === target.items.length, 'items of ' + target.id + ' unlocked before section done');
    let toastText = '';
    for (let i = 0; i < 200; i++) {
      const done = await ev(page, (sid) => isSectionDone('clf', sid), target.id);
      if (done) break;
      const btn = page.locator('.card.lecture [data-act="lec-done"]');
      const bsid = await btn.getAttribute('data-sec');
      const bto = Number(await btn.getAttribute('data-to'));
      await btn.click();
      if (bsid === target.id && bto === target.n) toastText = await text(page, '#toast');
    }
    const r = await ev(page, (s) => ({ done: isSectionDone('clf', s.id), unlocked: s.items.filter((id) => isUnlocked('clf', itemById('clf', id).item)).length,
      doneAt: TS('clf').sectionDoneAt[s.id], newN: newItems('clf').filter((id) => s.items.includes(id)).length }), target);
    assert(r.done, 'section ' + target.id + ' not done');
    assert(r.unlocked === target.items.length, `unlocked ${r.unlocked}/${target.items.length}`);
    assert(r.doneAt === FAKE_DAY, 'sectionDoneAt not set: ' + r.doneAt);
    assert(r.newN === target.items.length, 'unlocked items not offered as new');
    assert(/unlocked/.test(toastText), 'no unlock toast, got "' + toastText + '"');
    noErrors(page, 'lecture');
  } finally { await page.ctx.close(); }
}

/** Mark CLF sections done (via the app model) up to and including the first one with items. */
async function unlockFirstSection(page, t) {
  const target = await firstSectionWithItems(page, t);
  await ev(page, ({ t, sid }) => {
    for (const s of T(t).sections) { setLecturePos(t, s.id, s.lectures.length); if (s.id === sid) break; }
    render();
  }, { t, sid: target.id });
  return target;
}

async function check4() {
  const page = await newPage();
  try {
    await open(page);
    await seed(page, { 'aws-study-fake-today': FAKE_DAY });
    await unlockFirstSection(page, 'clf');
    await click(page, 'button[data-act="start-review"]');
    await page.waitForSelector('.sess');
    const graded = {};
    for (let i = 0; i < 40 && (!graded.knew || !graded.miss); i++) {
      if (!(await page.locator('.sess').count())) break;
      const id = await ev(page, () => curSess().queue[curSess().pos]);
      if (await page.locator('.fcard').count()) {
        await click(page, '.thumb-bar [data-act="flip"]');
        const ok = !graded.knew;
        await click(page, `[data-act="card-grade"][data-ok="${ok ? 1 : 0}"]`);
        if (ok) graded.knew = id; else if (id !== graded.knew) graded.miss = id;
      } else {
        await click(page, '.opt[data-act="pick"]');
        await click(page, '[data-act="next"]');
      }
    }
    assert(graded.knew && graded.miss, 'did not get two flashcards in the review: ' + JSON.stringify(graded));
    const r = await ev(page, (g) => { const s = JSON.parse(localStorage.getItem('aws-study-progress')).tracks.clf.srs; return { k: s[g.knew], m: s[g.miss] }; }, graded);
    assert(r.k && r.k.box === 1 && r.k.due === '2026-09-29', 'Knew it → expected box 1 due 2026-09-29, got ' + JSON.stringify(r.k));
    assert(r.m && r.m.box === 0 && r.m.due === FAKE_DAY && r.m.lapses >= 1, "Didn't know → expected box 0 due today, got " + JSON.stringify(r.m));
    const dueToday = await ev(page, () => dueItems('clf'));
    assert(!dueToday.includes(graded.knew), 'known card is due today');
    assert(dueToday.includes(graded.miss), 'missed card not due today');
    // Fake tomorrow
    await ev(page, () => localStorage.setItem('aws-study-fake-today', '2026-09-29'));
    await open(page);
    const due2 = await ev(page, () => ({ t: today(), due: dueItems('clf') }));
    assert(due2.t === '2026-09-29', 'fake today not honoured');
    assert(due2.due.includes(graded.knew) && due2.due.includes(graded.miss), 'tomorrow: expected both cards due, got ' + JSON.stringify(due2.due.slice(0, 20)));
    // Another day on: knew box 1→2 = due +3
    await ev(page, () => { localStorage.setItem('aws-study-fake-today', '2026-09-30'); });
    await open(page);
    const e = await ev(page, (id) => { gradeItem('clf', id, true, { review: true }); return TS('clf').srs[id]; }, graded.knew);
    assert(e.box === 2 && e.due === '2026-10-03', 'box 1→2 interval wrong: ' + JSON.stringify(e));
    noErrors(page, 'flashcards');
  } finally { await page.ctx.close(); }
}

async function check5() {
  const page = await newPage();
  try {
    await open(page);
    await seed(page, { 'aws-study-fake-today': FAKE_DAY });
    await unlockFirstSection(page, 'clf');
    // --- single answer, via the Quiz view ---
    await click(page, '#bottom-nav [data-view="quiz"]');
    await click(page, '[data-act="start-quiz"][data-mode="quick"]');
    await page.waitForSelector('.sess .opt');
    const q1 = await ev(page, () => { const s = curSess(); const q = itemById('clf', s.queue[s.pos]).item; return { id: q.id, answer: q.answer, n: s.queue.length }; });
    assert(typeof q1.answer === 'number', 'CLF question should be single-answer');
    await click(page, `.opt[data-i="${q1.answer}"]`);
    assert(/Correct/.test(await text(page, '.explain-head')), 'correct pick not shown as correct');
    const q1e = await ev(page, (id) => TS('clf').srs[id], q1.id);
    assert(q1e && q1e.seen >= 1, 'answer not recorded in srs');
    if (q1.n > 1) {
      await click(page, '[data-act="next"]');
      const q2 = await ev(page, () => { const s = curSess(); return itemById('clf', s.queue[s.pos]).item; });
      const wrong = (q2.answer + 1) % 4;
      await click(page, `.opt[data-i="${wrong}"]`);
      assert(/Answer:/.test(await text(page, '.explain-head')), 'wrong pick not shown as wrong');
    }
    // --- leave mid-quiz, reload, resume ---
    const posBefore = await ev(page, () => curSess().pos);
    await click(page, '#bottom-nav [data-view="today"]');
    await open(page);
    assert(await page.locator('[data-act="sess-resume"]').count() === 1, 'resume card missing after reload');
    await click(page, '[data-act="sess-resume"]');
    await page.waitForSelector('.sess');
    const posAfter = await ev(page, () => curSess().pos);
    assert(posAfter === posBefore, `resume pos ${posAfter} != ${posBefore}`);
    // Also reload while ON the session screen → reopens straight into it
    await open(page);
    assert(await page.locator('.sess').count() === 1, 'reload inside a session did not resume it');
    await ev(page, () => { TS('clf').session = null; saveProgress(); });

    // --- SAA multi-response, all-or-nothing ---
    await open(page);
    await click(page, '.today-head [data-act="toggle-track"]');
    assert(await ev(page, () => curTrack()) === 'saa', 'track toggle failed');
    const multi = await ev(page, () => T('saa').questions.filter((q) => Array.isArray(q.answer)).slice(0, 2).map((q) => ({ id: q.id, answer: q.answer, n: q.options.length, text: q.question })));
    assert(multi.length === 2, 'need 2 SAA multi-response questions');
    assert(multi.every((m) => m.n === 5 && /Choose TWO/i.test(m.text)), 'multi-response shape wrong');
    await ev(page, (ids) => startSession({ kind: 'quiz', mode: 'quick', title: 'Multi test', ids }), multi.map((m) => m.id));
    await page.waitForSelector('.sess [data-act="toggle-opt"]');
    // Q1: one right + one wrong → graded wrong
    const m1 = multi[0];
    const wrongOpt = [0, 1, 2, 3, 4].find((i) => !m1.answer.includes(i));
    await click(page, `.opt[data-i="${m1.answer[0]}"]`);
    assert(await page.locator('[data-act="submit-multi"]').isDisabled(), 'Submit enabled with 1 of 2 picks');
    await click(page, `.opt[data-i="${wrongOpt}"]`);
    assert(!(await page.locator('[data-act="submit-multi"]').isDisabled()), 'Submit disabled with 2 picks');
    await click(page, '[data-act="submit-multi"]');
    assert(/Answer:/.test(await text(page, '.explain-head')), 'partially-correct multi answer was not graded wrong');
    let rec = await ev(page, () => TS('saa').recent.slice(-1)[0]);
    assert(rec && rec.id === m1.id && rec.ok === false, 'recent for partial multi: ' + JSON.stringify(rec));
    await click(page, '[data-act="next"]');
    // Mid-question reload keeps the partial multi pick
    const m2 = multi[1];
    await click(page, `.opt[data-i="${m2.answer[0]}"]`);
    await open(page);
    assert(await page.locator('.sess').count() === 1, 'SAA session did not resume after reload');
    assert(await page.locator(`.opt.selected[data-i="${m2.answer[0]}"]`).count() === 1, 'partial multi pick lost on reload');
    await click(page, `.opt[data-i="${m2.answer[1]}"]`);
    await click(page, '[data-act="submit-multi"]');
    assert(/Correct/.test(await text(page, '.explain-head')), 'fully-correct multi answer not graded correct');
    rec = await ev(page, () => TS('saa').recent.slice(-1)[0]);
    assert(rec && rec.id === m2.id && rec.ok === true, 'recent for correct multi: ' + JSON.stringify(rec));
    await click(page, '[data-act="next"]');
    await page.waitForSelector('.result');
    assert(/1 \/ 2 questions correct/.test(await text(page, '.result')), 'result should be 1/2: ' + (await text(page, '.result')).slice(0, 120));
    noErrors(page, 'quiz');
  } finally { await page.ctx.close(); }
}

async function check6() {
  const page = await newPage();
  try {
    await open(page);
    await seed(page, { 'aws-study-fake-today': FAKE_DAY });
    await unlockFirstSection(page, 'clf');
    await gotoMore(page, 'settings');
    const inp = page.locator('input[data-set="examDates.clf"]');
    await inp.fill('2026-11-06');
    await inp.dispatchEvent('change');
    const saved = await ev(page, () => JSON.parse(localStorage.getItem('aws-study-progress')).settings.examDates.clf);
    assert(saved === '2026-11-06', 'exam date not saved: ' + saved);
    await click(page, '#bottom-nav [data-view="today"]');
    const cd = await text(page, '.today-head .countdown');
    assert(cd.includes('39 days to CLF'), 'countdown not updated (expected 39 days): ' + cd);
    // Export
    await gotoMore(page, 'settings');
    const [dl] = await Promise.all([page.waitForEvent('download'), click(page, '[data-act="export"]')]);
    const file = await dl.path();
    const exported = JSON.parse(fs.readFileSync(file, 'utf8'));
    assert(exported.version === 2 && exported.settings.examDates.clf === '2026-11-06', 'export JSON wrong');
    const doneCount = Object.keys(exported.tracks.clf.sectionDoneAt).length;
    assert(doneCount > 0, 'export lacks progress');
    // Reset (inline confirm, no dialogs)
    await click(page, '[data-act="reset"]');
    assert(await page.locator('[data-act="reset-yes"]').count() === 1, 'inline reset confirm missing');
    await click(page, '[data-act="reset-yes"]');
    const afterReset = await ev(page, () => JSON.parse(localStorage.getItem('aws-study-progress')));
    assert(afterReset.settings.examDates.clf === '2026-10-23' && !Object.keys(afterReset.tracks.clf.sectionDoneAt).length, 'reset did not clear progress');
    // Import the exported file
    await page.locator('input[data-import-file]').setInputFiles(file);
    await page.waitForSelector('[data-act="import-yes"]');
    await click(page, '[data-act="import-yes"]');
    const restored = await ev(page, () => JSON.parse(localStorage.getItem('aws-study-progress')));
    assert(restored.settings.examDates.clf === '2026-11-06', 'import did not restore exam date');
    assert(Object.keys(restored.tracks.clf.sectionDoneAt).length === doneCount, 'import did not restore course progress');
    // Import survives reload
    await open(page);
    assert((await text(page, '.today-head .countdown')).includes('39 days'), 'restored data lost after reload');
    noErrors(page, 'settings');
  } finally { await page.ctx.close(); }
}

async function check7() {
  const page = await newPage({ init: () => { try { delete window.speechSynthesis; delete window.SpeechSynthesisUtterance; } catch (e) { /* ignore */ }
    try { Object.defineProperty(window, 'speechSynthesis', { value: undefined, configurable: true }); } catch (e) { /* ignore */ } } });
  try {
    await open(page);
    await seed(page, { 'aws-study-fake-today': FAKE_DAY });
    assert(await ev(page, () => !speechOK()), 'speechSynthesis still present');
    await unlockFirstSection(page, 'clf');
    await click(page, '[data-act="handsfree"]');
    await page.waitForFunction(() => UI.view === 'handsfree');
    assert(/Hands-free/.test(await text(page, '#main h1')), 'hands-free heading missing');
    const n = await page.locator('#main .hf-term, #main .hf-q').count();
    assert(n === 1, 'hands-free does not show the first item without speech');
    // Next works too
    await page.locator('[data-act="hf-jump"][data-d="1"]').first().click().catch(() => {});
    noErrors(page, 'hands-free');
  } finally { await page.ctx.close(); }
}

/** Wait until the dock <audio> is really playing (time advancing, no media error). */
async function waitPlaying(page, minT) {
  await page.waitForFunction((minT) => { const a = document.querySelector('#dock-audio'); return a && !a.error && !a.paused && a.currentTime > minT; },
    minT || 0.3, { timeout: 15000 });
}

// Real packs made by tools/make-audio.py (webapp/audio/ is gitignored, generated locally).
async function check8() {
  const idxPath = path.join(WEBAPP, 'audio', 'index.json');
  assert(fs.existsSync(idxPath), 'no real audio packs — run: python tools/make-audio.py --sections clf-06,clf-19,saa-20,saa-31');
  const idx = JSON.parse(fs.readFileSync(idxPath, 'utf8'));
  const packs = { clf: listOr(idx.tracks && idx.tracks.clf), saa: listOr(idx.tracks && idx.tracks.saa) };
  assert(packs.clf.length >= 2 && packs.saa.length >= 2, 'need ≥2 CLF and ≥2 SAA packs in index.json, got ' + packs.clf.length + '/' + packs.saa.length);
  const sizes = {};
  for (const p of packs.clf.concat(packs.saa)) {
    const f = path.join(WEBAPP, p.file);
    assert(/^audio\/(clf|saa)\/[a-z]+-\d+\.mp3$/.test(p.file) && fs.existsSync(f), 'pack file missing: ' + p.file);
    sizes[p.file] = fs.statSync(f).size;
    assert(p.seconds > 30 && p.items > 0 && p.title && p.section, 'pack entry incomplete: ' + JSON.stringify(p));
    let dur = null;
    try { dur = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString().trim()); } catch (e) { /* no ffprobe */ }
    if (dur != null) assert(Math.abs(dur - p.seconds) <= 2, p.file + ': ffprobe ' + dur + 's vs index ' + p.seconds + 's');
  }

  // 8a. Friendly message when index.json is missing (simulated 404, SW off).
  const p0 = await newPage({ allowErrors: [/Failed to load resource.*404/i] });
  try {
    await p0.route('**/audio/index.json', (r) => r.fulfill({ status: 404, body: 'not found' }));
    await open(p0);
    await gotoMore(p0, 'listen');
    await p0.waitForFunction(() => /Audio packs are generated when the site is deployed/.test(document.querySelector('#main').textContent), null, { timeout: 5000 });
    noErrors(p0, 'listen (no index)');
  } finally { await p0.ctx.close(); }

  // 8b. Real packs through the service worker: list, play, save offline, offline playback + Range → 206.
  const page = await newPage({ sw: true, allowErrors: [/ERR_INTERNET_DISCONNECTED|ERR_CONNECTION_REFUSED|Failed to load resource|Failed to fetch/i] });
  let serverDown = false;
  try {
    await open(page);
    await page.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 10000 });
    await gotoMore(page, 'listen');
    await page.waitForSelector('[data-act="listen-play"]', { timeout: 8000 });
    const listed = await page.locator('[data-act="listen-play"]').evaluateAll((els) => els.map((e) => e.dataset.file));
    assert(listed.length === packs.clf.length && packs.clf.every((p) => listed.includes(p.file)), 'CLF list ' + listed + ' != index');
    for (const p of packs.clf) assert(await page.locator('#main', { hasText: p.title }).count(), 'title not shown: ' + p.title);
    // Play the first listed CLF pack
    const cf = listed[0], cp = packs.clf.find((p) => p.file === cf);
    await click(page, `[data-act="listen-play"][data-file="${cf}"]`);
    await waitPlaying(page);
    const d1 = await ev(page, () => document.querySelector('#dock-audio').duration);
    assert(Math.abs(d1 - cp.seconds) <= 2, 'played duration ' + d1 + ' vs ' + cp.seconds);
    assert((await text(page, '#dock-title')) === cp.title, 'dock title wrong');
    // Save it offline
    const saveAndVerify = async (file, ver) => {
      await click(page, `[data-act="listen-save"][data-file="${file}"]`);
      await page.waitForSelector(`[data-act="listen-unsave"][data-file="${file}"]`, { timeout: 20000 });
      const c = await ev(page, async (file) => { const r = await (await caches.open('aws-audio')).match(new URL(file, location.href).href);
        return r ? { ver: r.headers.get('X-Pack-Version'), size: (await r.arrayBuffer()).byteLength } : null; }, file);
      assert(c && c.size === sizes[file], file + ' not cached whole: ' + JSON.stringify(c) + ' expected ' + sizes[file]);
      assert(c.ver && c.ver.startsWith(ver), file + ' cached without version stamp: ' + c.ver);
    };
    await saveAndVerify(cf, String(cp.hash || ''));
    // SAA: the pack whose section has a "(Choose TWO.)" question
    await ev(page, () => { closeDock(); setTrack('saa'); });
    await gotoMore(page, 'listen');
    await page.waitForSelector('[data-act="listen-play"]');
    const multiSecs = await ev(page, () => T('saa').questions.filter((q) => Array.isArray(q.answer) && /Choose TWO/i.test(q.question)).map((q) => q.section));
    const sp = packs.saa.find((p) => multiSecs.includes(p.section));
    assert(sp, 'no SAA pack covers a section with a "(Choose TWO.)" question: ' + packs.saa.map((p) => p.section));
    const other = packs.saa.find((p) => p !== sp);
    await saveAndVerify(sp.file, String(sp.hash || ''));

    // --- offline: browser offline AND the server stopped ---
    await page.ctx.setOffline(true);
    stopServer(); serverDown = true;
    await page.reload({ waitUntil: 'load' });
    await page.waitForFunction(() => typeof P !== 'undefined' && P && document.querySelector('#main .today-head, #main .view-head'), null, { timeout: 10000 });
    await gotoMore(page, 'listen');
    await page.waitForSelector(`[data-act="listen-unsave"][data-file="${sp.file}"]`, { timeout: 8000 });
    const rg = await ev(page, async (file) => {
      const u = new URL(file, location.href).href;
      const a = await fetch(u, { headers: { Range: 'bytes=1000-1999' } });
      const ab = (await a.arrayBuffer()).byteLength;
      const b = await fetch(u, { headers: { Range: 'bytes=-500' } });
      const bb = (await b.arrayBuffer()).byteLength;
      const full = await fetch(u);
      const fb = (await full.arrayBuffer()).byteLength;
      return { a: a.status, acr: a.headers.get('Content-Range'), ab, b: b.status, bcr: b.headers.get('Content-Range'), bb, full: full.status, fb };
    }, sp.file);
    const size = sizes[sp.file];
    assert(rg.a === 206 && rg.acr === `bytes 1000-1999/${size}` && rg.ab === 1000, 'Range 1000-1999 offline: ' + JSON.stringify(rg));
    assert(rg.b === 206 && rg.bcr === `bytes ${size - 500}-${size - 1}/${size}` && rg.bb === 500, 'suffix Range offline: ' + JSON.stringify(rg));
    assert(rg.full === 200 && rg.fb === size, 'full offline fetch: ' + JSON.stringify(rg));
    // An unsaved pack really is unreachable (proves we are offline)
    const unsavedOk = await ev(page, (f) => fetch(new URL(f, location.href).href).then((r) => r.ok, () => false), other.file);
    assert(!unsavedOk, 'unsaved pack loaded while offline — offline simulation is not working');
    // Offline playback through the SW, then seek near the end (media Range request)
    await click(page, `[data-act="listen-play"][data-file="${sp.file}"]`);
    await waitPlaying(page);
    const d2 = await ev(page, () => document.querySelector('#dock-audio').duration);
    assert(Math.abs(d2 - sp.seconds) <= 2, 'offline duration ' + d2 + ' vs ' + sp.seconds);
    await ev(page, () => { const a = document.querySelector('#dock-audio'); a.currentTime = a.duration - 20; });
    await waitPlaying(page, sp.seconds - 20);
    assert(/Solutions Architect|SAA/.test(await ev(page, () => (navigator.mediaSession.metadata || {}).artist || '')), 'media session metadata missing');
    noErrors(page, 'listen (real packs)');
  } finally {
    await page.ctx.close();
    if (serverDown) await startServer();
  }
}

async function check9() {
  const page = await newPage({ sw: true });
  try {
    await open(page);
    await ev(page, () => navigator.serviceWorker.ready.then(() => true));
    await page.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 10000 });
    const man = await ev(page, async () => {
      const href = document.querySelector('link[rel="manifest"]').getAttribute('href');
      const r = await fetch(href);
      return { href, status: r.status, ct: r.headers.get('content-type'), body: await r.text() };
    });
    assert(man.href === 'manifest.webmanifest', 'manifest link href: ' + man.href);
    const m = JSON.parse(man.body);
    const sizes = (m.icons || []).map((i) => i.sizes);
    assert(sizes.includes('192x192') && sizes.includes('512x512'), 'manifest icons: ' + sizes);
    assert(m.start_url === './' && m.scope === './' && m.display === 'standalone', 'manifest start_url/scope/display wrong');
    for (const ic of m.icons) {
      const st = await ev(page, (src) => fetch(src).then((r) => r.status + ' ' + r.headers.get('content-type')), ic.src);
      assert(/^200 image\/png/.test(st), 'icon ' + ic.src + ' → ' + st);
    }
    assert(!fs.existsSync(path.join(WEBAPP, 'manifest.json')), 'old webapp/manifest.json still present');
    const hasFetch = /addEventListener\(\s*['"]fetch['"]/.test(fs.readFileSync(path.join(WEBAPP, 'sw.js'), 'utf8'));
    assert(hasFetch, 'sw.js has no fetch handler');
    // Offline reload
    await page.ctx.setOffline(true);
    await page.reload({ waitUntil: 'load' });
    await page.waitForSelector('.today-head .countdown', { timeout: 10000 });
    assert(await page.locator('.card.lecture').count() === 1, 'offline Today missing lecture block');
    await page.ctx.setOffline(false);
    noErrors(page, 'pwa');
  } finally { await page.ctx.close(); }
}

/**
 * Realistic mid-SAA progress: CLF finished + passed 2026-10-23, SAA started 2026-10-26,
 * ~40% of SAA (by effective minutes) done, the next section half watched, some SRS history.
 * opts.allSaaButLast: every SAA section done except the last lecture of the last section.
 * Built in the page (needs the course data), returned as a plain progress object.
 */
async function buildSaaProgress(page, opts = {}) {
  return ev(page, (opts) => {
    const add = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
    const speed = (p) => ({ trivial: 2, skim: 2, normal: 1.5, deep: 1.25 }[p] || 1.5);
    const eff = (s) => s.lectures.reduce((m, l) => m + (Number(l[1]) || 0) / 60 / speed(s.pace), 0);
    const mk = () => ({ lecturePos: {}, sectionDoneAt: {}, srs: {}, quizHistory: [], domainStats: {}, recent: [], session: null, passedAt: null, startedAt: null, checklist: {} });
    const clf = mk(), saa = mk();
    COURSES.clf.sections.forEach((s) => { clf.lecturePos[s.id] = s.lectures.length; clf.sectionDoneAt[s.id] = '2026-10-15'; });
    clf.passedAt = '2026-10-23';
    clf.quizHistory = [{ date: '2026-10-20', mode: 'exam', score: 84, total: 65, correct: 55, domains: {} }];
    saa.startedAt = '2026-10-26';
    const secs = COURSES.saa.sections;
    const total = secs.reduce((m, s) => m + eff(s), 0);
    let doneK, partial;
    if (opts.allSaaButLast) { doneK = secs.length - 1; partial = secs[secs.length - 1].lectures.length - 1; }
    else {
      let acc = 0; doneK = 0;
      while (doneK < secs.length && acc + eff(secs[doneK]) <= total * 0.4) acc += eff(secs[doneK++]);
      partial = Math.floor(secs[doneK].lectures.length / 2);
    }
    const doneIds = [];
    for (let i = 0; i < doneK; i++) {
      const s = secs[i];
      saa.lecturePos[s.id] = s.lectures.length;
      saa.sectionDoneAt[s.id] = add('2026-10-26', Math.round(i * 24 / Math.max(1, doneK)));
      doneIds.push(s.id);
    }
    saa.lecturePos[secs[doneK].id] = partial;
    // SRS: items of done sections; every 3rd due today, others later
    const items = SAA_QUESTIONS.concat(SAA_FLASHCARDS).filter((x) => doneIds.includes(x.section)).slice(0, 60);
    let due = 0;
    items.forEach((x, i) => {
      const isDue = i % 3 === 0; if (isDue) due++;
      saa.srs[x.id] = { box: isDue ? 1 : 2, due: isDue ? opts.today : add(opts.today, 3), seen: 2, lapses: i % 5 === 0 ? 1 : 0, intro: '2026-11-01' };
      if (x.options) saa.recent.push({ id: x.id, domain: x.domain, ok: i % 4 !== 0 });
    });
    const dayLog = {};
    for (let i = 1; i <= 5; i++) dayLog[add(opts.today, -i)] = { cards: 12, questions: 6, lectureMin: 30 };
    const prog = { version: 2, settings: { track: 'saa', startDate: '2026-09-28', examDates: { clf: '2026-10-23', saa: '2027-01-08' },
      dailyMinutes: 50, reviewDays: { clf: 7, saa: 21 }, newPerDay: 20, speech: { rate: 1, pauseSec: 5, voiceURI: null } },
      streak: { count: 5, lastDate: add(opts.today, -1) }, dayLog, tracks: { clf, saa } };
    return { prog, doneK, partial, next: secs[doneK], due, total,
      doneEff: secs.slice(0, doneK).reduce((m, s) => m + eff(s), 0) + secs[doneK].lectures.slice(0, partial).reduce((m, l) => m + (Number(l[1]) || 0) / 60 / speed(secs[doneK].pace), 0) };
  }, opts);
}

async function check10() {
  const page = await newPage();
  try {
    const DAY = '2026-11-20';
    await open(page);
    const s = await buildSaaProgress(page, { today: DAY });
    await seed(page, { 'aws-study-progress': s.prog, 'aws-study-fake-today': DAY });
    assert(await ev(page, () => curTrack() === 'saa' && today()), 'not on SAA track');
    assert((await text(page, '.today-head .countdown')) === '49 days to SAA', 'countdown: ' + await text(page, '.today-head .countdown'));
    assert(!(await page.locator('.ready-card').count()), 'exam-prep shown mid-course');
    // Pace — expected values computed independently from the seeded data:
    // start 2026-10-26, target = 2027-01-08 − 21 = 2026-12-18 → span 54 days, 25 elapsed, 29 left incl. today.
    const expBehind = Math.round(s.total * 25 / 54 - s.doneEff);
    const perDay = (s.total - s.doneEff) / 29;
    const pace = (await text(page, '.pace')).replace(/\s+/g, ' ');
    const fm = await ev(page, (a) => ({ per: fmtMin(a.perDay), behind: fmtMin(a.expBehind), target: fmtDay('2026-12-18'), left: fmtMin(a.left) }),
      { perDay, expBehind, left: s.total - s.doneEff });
    console.log('      info: ' + pace + ' | next ' + s.next.id + ' from lecture ' + (s.partial + 1) + ' | ' + s.due + ' due');
    assert(pace.includes('~' + fm.per + ' of lectures/day'), `pace per-day: expected ~${fm.per}, got "${pace}"`);
    assert(expBehind > 10 ? pace.includes(fm.behind + ' behind plan') : pace.includes('On track'), `pace status (behind ${expBehind}): "${pace}"`);
    assert(pace.includes('course done by ' + fm.target) && pace.includes(fm.left + ' left'), 'pace target/left: "' + pace + '"');
    // Next block = the half-watched section, starting right after the last watched lecture
    const btn = page.locator('.card.lecture [data-act="lec-done"]');
    assert(await btn.getAttribute('data-sec') === s.next.id, 'next block section ' + await btn.getAttribute('data-sec') + ' != ' + s.next.id);
    assert(Number(await btn.getAttribute('data-to')) > s.partial, 'data-to not past lecturePos');
    const title = await text(page, '.card.lecture .card-title');
    assert(title === '§' + s.next.n + ' ' + s.next.title, 'block title "' + title + '"');
    const sub = await text(page, '.card.lecture .card-sub');
    assert(sub.startsWith('lectures ' + (s.partial + 1)) && sub.includes('of ' + s.next.lectures.length), 'block lectures: "' + sub + '"');
    // Review card: seeded due count
    const rv = await text(page, '.card.review .card-title');
    assert(rv.startsWith(s.due + ' due'), `review card: expected ${s.due} due, got "${rv}"`);
    assert(await page.locator('.card.five').count() === 1, '5-question card missing');
    noErrors(page, 'SAA today');
  } finally { await page.ctx.close(); }
}

async function check11() {
  const page = await newPage();
  try {
    const DAY = '2026-12-20';
    await open(page);
    const s = await buildSaaProgress(page, { today: DAY, allSaaButLast: true });
    await seed(page, { 'aws-study-progress': s.prog, 'aws-study-fake-today': DAY });
    // One lecture left → normal Today, no exam-prep yet
    assert(await page.locator('.card.lecture').count() === 1 && !(await page.locator('.ready-card').count()), 'exam-prep shown before the last lecture');
    await click(page, '.card.lecture [data-act="lec-done"]');
    await page.waitForSelector('.ready-card');
    assert(await ev(page, () => courseStats('saa').allDone), 'course not all done');
    assert(!(await page.locator('.card.lecture, .pace').count()), 'lecture block/pace still shown in exam-prep');
    for (const sel of ['[data-act="start-domain"]', '.card.review, .muted-card', '.card.hf', '[data-act="check"]', '[data-act="passed"]'])
      assert(await page.locator(sel).count(), 'exam-prep lacks ' + sel);
    const ex = await text(page, '[data-act="start-exam"] .card-title');
    assert(ex === '65 questions · 130 min', 'exam card: "' + ex + '"');
    // Timed exam
    await click(page, '[data-act="start-exam"]');
    await page.waitForSelector('.sess .opt[data-act="exam-pick"]');
    const sess = await ev(page, () => { const x = curSess(); return { n: x.queue.length, exam: x.exam, lim: x.timeLimitSec, uniq: new Set(x.queue).size,
      multi: x.queue.filter((id) => Array.isArray(itemById('saa', id).item.answer)).length }; });
    assert(sess.exam && sess.n === 65 && sess.uniq === 65 && sess.lim === 130 * 60, 'exam session: ' + JSON.stringify(sess));
    const t1 = await text(page, '#sess-timer');
    assert(/^2:(10:00|09:5\d)$/.test(t1), 'timer text "' + t1 + '"');
    assert(await page.locator('#sess-timer').isVisible(), 'timer not visible');
    await page.waitForTimeout(2500);
    const t2 = await text(page, '#sess-timer');
    assert(t2 !== t1 && /^2:09:\d\d$/.test(t2), 'timer not ticking: ' + t1 + ' → ' + t2);
    noErrors(page, 'exam-prep');
  } finally { await page.ctx.close(); }
}

/** Elements sticking out past the viewport (for a readable failure message). */
async function overflowReport(page) {
  return ev(page, () => {
    const W = document.documentElement.clientWidth;
    if (document.documentElement.scrollWidth <= W + 1 && document.body.scrollWidth <= W + 1) return null;
    const bad = [];
    document.querySelectorAll('body *').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width && r.right > W + 1 && getComputedStyle(el).position !== 'fixed') {
        bad.push((el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : '')) + ' r=' + Math.round(r.right));
      }
    });
    return { sw: document.documentElement.scrollWidth, W, bad: bad.slice(0, 8) };
  });
}

async function check12() {
  const page = await newPage({ viewport: { width: 360, height: 740 } });
  const fails = [];
  let checked = 0;
  const at = async (label) => {
    checked++;
    await page.waitForTimeout(150);
    const r = await overflowReport(page);
    if (r) fails.push(label + ': ' + JSON.stringify(r));
  };
  try {
    const DAY = '2026-11-20';
    await open(page);
    const s = await buildSaaProgress(page, { today: DAY });
    await seed(page, { 'aws-study-progress': s.prog, 'aws-study-fake-today': DAY });
    for (const tr of ['saa', 'clf']) {
      await ev(page, (tr) => { if (curTrack() !== tr) setTrack(tr); go('today'); }, tr);
      await at(tr + ' today');
      await ev(page, () => { const d = document.querySelector('.lec-details'); if (d) d.open = true; });
      await at(tr + ' today (lectures expanded)');
      for (const v of ['course', 'review', 'quiz']) { await click(page, `#bottom-nav [data-view="${v}"]`); await at(tr + ' ' + v); }
      for (const m of ['listen', 'progress', 'settings', 'help']) {
        await gotoMore(page, m);
        await page.waitForTimeout(m === 'listen' ? 800 : 0);
        await ev(page, () => document.querySelectorAll('#main details').forEach((d) => { d.open = true; }));
        await at(tr + ' more/' + m);
      }
      await click(page, '#bottom-nav [data-view="more"]');
      await at(tr + ' more menu');
    }
    // Listen with the dock open
    if (await page.locator('[data-act="listen-play"]').count()) {
      await gotoMore(page, 'listen');
      await page.waitForSelector('[data-act="listen-play"]', { timeout: 5000 }).catch(() => {});
      if (await page.locator('[data-act="listen-play"]').count()) { await click(page, '[data-act="listen-play"]'); await at('listen + dock'); await ev(page, () => closeDock()); }
    }
    // Sessions (SAA: long multi-response questions)
    await ev(page, () => setTrack('saa'));
    await click(page, '#bottom-nav [data-view="today"]');
    await click(page, '[data-act="start-review"]');
    await page.waitForSelector('.sess');
    for (let i = 0; i < 6 && await page.locator('.sess').count(); i++) {
      await at('review item ' + i);
      if (await page.locator('.fcard').count()) { await click(page, '.thumb-bar [data-act="flip"]'); await at('review card back ' + i); await click(page, '[data-act="card-grade"][data-ok="1"]'); }
      else if (await page.locator('[data-act="toggle-opt"]').count()) { await click(page, '.opt[data-i="0"]'); await click(page, '.opt[data-i="1"]'); await click(page, '[data-act="submit-multi"]'); await at('review multi reveal ' + i); await click(page, '[data-act="next"]'); }
      else { await click(page, '.opt[data-act="pick"]'); await at('review reveal ' + i); await click(page, '[data-act="next"]'); }
    }
    await ev(page, () => { TS().session = null; saveProgress(); go('quiz'); });
    await click(page, '[data-act="start-exam"]');
    await page.waitForSelector('.sess .opt');
    await at('exam');
    // Jump to a multi-response question in the exam
    await ev(page, () => { const x = curSess(); const i = x.queue.findIndex((id) => Array.isArray(itemById('saa', id).item.answer)); if (i >= 0) { x.pos = i; render(); } });
    await at('exam multi');
    await ev(page, () => { TS().session = null; saveProgress(); go('today'); });
    await click(page, '[data-act="handsfree"]');
    await page.waitForFunction(() => UI.view === 'handsfree');
    await at('hands-free');
    await ev(page, () => { if (typeof hfStop === 'function') hfStop(); });
    if (process.env.E2E_SELFTEST) { await ev(page, () => { const d = document.createElement('div'); d.style.width = '500px'; d.textContent = 'x'; document.querySelector('#main').appendChild(d); }); await at('selftest'); }
    console.log('      info: ' + checked + ' screens checked at 360px');
    assert(!fails.length, 'horizontal scroll at 360px:\n  ' + fails.join('\n  '));
    noErrors(page, '360px');
  } finally { await page.ctx.close(); }
}

async function check13() {
  const page = await newPage();
  try {
    await open(page);
    await seed(page, { 'aws-study-fake-today': FAKE_DAY });
    await unlockFirstSection(page, 'clf');
    // Paused timed exam is never replaced silently.
    await click(page, '#bottom-nav [data-view="quiz"]');
    await click(page, '[data-act="start-exam"]');
    await page.waitForSelector('.sess .opt');
    await click(page, '.opt[data-act="exam-pick"]');
    await click(page, '[data-act="exam-nav"][data-d="1"]');
    const examQ = await ev(page, () => curSess().queue.slice());
    await click(page, '#bottom-nav [data-view="today"]');
    await click(page, '[data-act="start-review"]');
    assert(await page.locator('.pending-start').count() === 1, 'no "paused session" panel before replacing an exam');
    assert(await ev(page, (q) => curSess().exam && curSess().queue.join() === q.join(), examQ), 'exam session was overwritten');
    await click(page, '[data-act="pending-resume"]');
    await page.waitForSelector('.sess');
    assert(await ev(page, () => curSess().exam && curSess().pos === 1), 'resume did not return to the exam');
    // Toast moves to the top while a sticky thumb bar is on screen.
    await ev(page, () => toast('test', { action: { label: 'Undo', fn: () => {} } }));
    const pos = await ev(page, () => { const t = document.querySelector('#toast').getBoundingClientRect(); const b = document.querySelector('.thumb-bar').getBoundingClientRect(); return { tb: t.bottom, bt: b.top }; });
    assert(pos.tb < pos.bt, 'toast overlaps the thumb bar: ' + JSON.stringify(pos));
    // Settings: an out-of-range value keeps the previous value (not the factory default).
    await ev(page, () => { P.settings.newPerDay = 30; P.settings.dailyMinutes = 30; saveProgress(); });
    await gotoMore(page, 'settings');
    await page.fill('input[data-set="newPerDay"]', '1000'); await page.locator('input[data-set="newPerDay"]').dispatchEvent('change');
    await page.fill('input[data-set="dailyMinutes"]', '0'); await page.locator('input[data-set="dailyMinutes"]').dispatchEvent('change');
    await page.fill('input[data-set="startDate"]', ''); await page.locator('input[data-set="startDate"]').dispatchEvent('change');
    const st = await ev(page, () => ({ n: P.settings.newPerDay, d: P.settings.dailyMinutes, s: P.settings.startDate, v: document.querySelector('input[data-set="newPerDay"]').value }));
    assert(st.n === 30 && st.d === 30 && st.s === '2026-09-28' && st.v === '30', 'rejected settings not kept: ' + JSON.stringify(st));
    // Readiness counts domains with no answers as 0 and says provisional.
    const r = await ev(page, () => { const tr = TS('clf'); tr.recent = []; for (let i = 0; i < 20; i++) tr.recent.push({ id: 'x' + i, domain: 'domain1', ok: true }); return readiness('clf'); });
    assert(r.overall === 24 && r.provisional, 'readiness should be 24% provisional, got ' + JSON.stringify({ o: r.overall, p: r.provisional }));
    noErrors(page, 'regressions');
  } finally { await page.ctx.close(); }
}

// ============================================================
async function main() {
  await startServer();
  browser = await chromium.launch();
  const only = process.argv[2] ? process.argv[2].split(',').map(Number) : null;
  const all = [
    [1, 'Fresh load: no errors; countdown, pace line, next lecture block', check1],
    [2, 'v1 migration → v2, missed due, history kept, backup key', check2],
    [3, 'Lecture Done advances lecturePos; section completion unlocks items', check3],
    [4, 'Flashcard review Knew/Didn\'t know → SRS box + due; fake tomorrow', check4],
    [5, 'Quiz single + SAA multi-response all-or-nothing; resume after reload', check5],
    [6, 'Settings: exam date → countdown; export; import; inline reset (no dialogs)', check6],
    [7, 'Hands-free without speechSynthesis shows first item', check7],
    [8, 'Listen (REAL packs): no-index message; list, play, Save offline → cache; offline playback via SW + Range 206', check8],
    [9, 'Service worker, manifest icons 192/512, offline reload', check9],
    [10, 'SAA Today @2026-11-20, realistic progress: countdown, pace, next block in the right section, due count', check10],
    [11, 'Exam-prep mode after the last lecture; 65-question timed SAA exam starts, timer ticks', check11],
    [12, 'No horizontal scroll at 360px on any main view (both tracks, sessions, hands-free)', check12],
    [13, 'Review-round guards: paused exam not replaced, toast clear of thumb bar, rejected settings kept, honest readiness', check13],
  ];
  for (const [n, name, fn] of all) if (!only || only.includes(n)) await check(n + '. ' + name, fn);
}

main().catch((e) => { console.error('FATAL', e); results.push({ name: 'harness', ok: false, err: String(e) }); })
  .finally(async () => {
    try { if (browser) await browser.close(); } catch (e) { /* ignore */ }
    stopServer();
    const failed = results.filter((r) => !r.ok);
    console.log('\n' + (results.length - failed.length) + '/' + results.length + ' checks passed');
    process.exit(failed.length ? 1 : 0);
  });
