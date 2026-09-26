// ============================================================
//  AWS Cert Study — Model
//  Track data access, progress v2 (global P), v1 migration,
//  Leitner SRS, unlock logic, lecture progress, stats.
// ============================================================

const PROGRESS_KEY = 'aws-study-progress';
const V1_BACKUP_KEY = 'aws-study-progress-v1-backup';
const SRS_INTERVALS = [0, 1, 3, 7, 16, 35];
const RECENT_MAX = 200;
const READY_MIN_N = 10; // answers per domain before readiness is more than provisional
const TRACK_IDS = ['clf', 'saa'];

// ============================================================
//  Track data (guards: any data file may be missing/empty)
// ============================================================
// Top-level const globals are not on window; reference them inside try so a
// missing data file just yields undefined instead of a ReferenceError.
const DATA_GETTERS = {
  COURSES: () => COURSES, PACE_SPEED: () => PACE_SPEED,
  QUESTIONS: () => QUESTIONS, FLASHCARDS: () => FLASHCARDS, QUIZ_DOMAINS: () => QUIZ_DOMAINS,
  FLASHCARD_CATEGORIES: () => FLASHCARD_CATEGORIES,
  SAA_QUESTIONS: () => SAA_QUESTIONS, SAA_FLASHCARDS: () => SAA_FLASHCARDS, SAA_QUIZ_DOMAINS: () => SAA_QUIZ_DOMAINS,
  SAA_FLASHCARD_CATEGORIES: () => SAA_FLASHCARD_CATEGORIES,
};
function gv(name) {
  try { return DATA_GETTERS[name](); } catch (e) { return undefined; }
}

const TRACK_META = {
  clf: { label: 'CLF', name: 'Cloud Practitioner', code: 'CLF-C02', examQ: 65, examMin: 90, pass: 70,
    q: 'QUESTIONS', c: 'FLASHCARDS', d: 'QUIZ_DOMAINS', cat: 'FLASHCARD_CATEGORIES' },
  saa: { label: 'SAA', name: 'Solutions Architect', code: 'SAA-C03', examQ: 65, examMin: 130, pass: 72,
    q: 'SAA_QUESTIONS', c: 'SAA_FLASHCARDS', d: 'SAA_QUIZ_DOMAINS', cat: 'SAA_FLASHCARD_CATEGORIES' },
};

const _trackCache = {};
function T(t) {
  if (_trackCache[t]) return _trackCache[t];
  const m = TRACK_META[t];
  const courses = gv('COURSES') || {};
  const course = isObj(courses[t]) ? courses[t] : { title: m.name, url: '#', sections: [] };
  const sections = listOr(course.sections).filter((s) => s && s.id);
  const secIndex = {};
  sections.forEach((s, i) => { secIndex[s.id] = i; s.lectures = listOr(s.lectures); });
  const questions = listOr(gv(m.q)).filter((q) => q && q.id && Array.isArray(q.options));
  const cards = listOr(gv(m.c)).filter((c) => c && c.id);
  const domains = listOr(gv(m.d)).map((d) => ({ id: d.id, name: d.name, w: parseFloat(d.weight) || 25, weight: d.weight }));
  const categories = listOr(gv(m.cat));
  const data = { id: t, meta: m, course, sections, secIndex, questions, cards, domains, categories, items: {} };
  questions.forEach((q) => { data.items[q.id] = { kind: 'q', item: q }; });
  cards.forEach((c) => { data.items[c.id] = { kind: 'c', item: c }; });
  _trackCache[t] = data;
  return data;
}

function itemById(t, id) { return T(t).items[id] || null; }
function trackOfId(id) { return String(id).slice(0, 3) === 'saa' ? 'saa' : 'clf'; }
function isMulti(q) { return Array.isArray(q.answer); }
function domainName(t, id) { const d = T(t).domains.find((x) => x.id === id); return d ? d.name : id; }
function paceSpeed(p) { const ps = gv('PACE_SPEED') || { trivial: 2, skim: 2, normal: 1.5, deep: 1.25 }; return ps[p] || 1.5; }

// ============================================================
//  Progress v2
// ============================================================
function defaultSettings() {
  return {
    track: 'clf', startDate: '2026-09-28', examDates: { clf: '2026-10-23', saa: '2027-01-08' },
    dailyMinutes: 50, reviewDays: { clf: 7, saa: 21 }, newPerDay: 20,
    speech: { rate: 1, pauseSec: 5, voiceURI: null },
  };
}
function defaultTrack() {
  return { lecturePos: {}, sectionDoneAt: {}, srs: {}, quizHistory: [], domainStats: {}, recent: [],
    session: null, passedAt: null, startedAt: null, checklist: {} };
}
function defaultProgress() {
  return { version: 2, settings: defaultSettings(), streak: { count: 0, lastDate: null }, dayLog: {},
    tracks: { clf: defaultTrack(), saa: defaultTrack() } };
}

function normSettings(s) {
  const d = defaultSettings();
  s = isObj(s) ? s : {};
  const ex = isObj(s.examDates) ? s.examDates : {};
  const rd = isObj(s.reviewDays) ? s.reviewDays : {};
  const sp = isObj(s.speech) ? s.speech : {};
  return {
    track: TRACK_IDS.includes(s.track) ? s.track : d.track,
    startDate: isYmd(s.startDate) ? s.startDate : d.startDate,
    examDates: { clf: isYmd(ex.clf) ? ex.clf : d.examDates.clf, saa: isYmd(ex.saa) ? ex.saa : d.examDates.saa },
    dailyMinutes: numIn(s.dailyMinutes, 5, 600, d.dailyMinutes),
    reviewDays: { clf: numIn(rd.clf, 0, 120, d.reviewDays.clf), saa: numIn(rd.saa, 0, 120, d.reviewDays.saa) },
    newPerDay: numIn(s.newPerDay, 0, 500, d.newPerDay),
    speech: { rate: numIn(sp.rate, 0.5, 2, 1), pauseSec: numIn(sp.pauseSec, 0, 30, 5),
      voiceURI: typeof sp.voiceURI === 'string' ? sp.voiceURI : null },
  };
}

function normTrack(tr) {
  const d = defaultTrack();
  tr = isObj(tr) ? tr : {};
  const out = d;
  if (isObj(tr.lecturePos)) for (const k in tr.lecturePos) out.lecturePos[k] = Math.floor(num(tr.lecturePos[k]));
  if (isObj(tr.sectionDoneAt)) for (const k in tr.sectionDoneAt) { const v = toYmd(tr.sectionDoneAt[k]); if (v) out.sectionDoneAt[k] = v; }
  if (isObj(tr.srs)) {
    for (const id in tr.srs) {
      const e = tr.srs[id];
      if (!isObj(e)) continue;
      out.srs[id] = { box: clamp(Math.floor(num(e.box)), 0, 5), due: toYmd(e.due) || today(),
        seen: Math.floor(num(e.seen)), lapses: Math.floor(num(e.lapses)), intro: toYmd(e.intro) || null };
    }
  }
  out.quizHistory = listOr(tr.quizHistory).filter(isObj).slice(-200).map((h) => ({
    date: toYmd(h.date) || today(), mode: String(h.mode || 'quiz'), score: num(h.score), total: num(h.total),
    correct: num(h.correct), domains: isObj(h.domains) ? h.domains : {} }));
  if (isObj(tr.domainStats)) for (const k in tr.domainStats) {
    const v = tr.domainStats[k];
    if (isObj(v)) out.domainStats[k] = { correct: num(v.correct), total: num(v.total) };
  }
  out.recent = listOr(tr.recent).filter((r) => isObj(r) && r.id).slice(-RECENT_MAX)
    .map((r) => ({ id: String(r.id), domain: String(r.domain || ''), ok: !!r.ok }));
  out.session = normSession(tr.session);
  out.passedAt = toYmd(tr.passedAt);
  out.startedAt = toYmd(tr.startedAt);
  out.checklist = isObj(tr.checklist) ? tr.checklist : {};
  return out;
}

/** Fully normalize a stored resumable session (null if unusable). */
function normSession(s) {
  if (!isObj(s) || !Array.isArray(s.queue)) return null;
  const queue = s.queue.filter((id) => typeof id === 'string' && id);
  if (!queue.length) return null;
  const normPick = (v) => (Array.isArray(v) ? v.map(Number).filter(Number.isInteger)
    : (v == null || !Number.isInteger(Number(v)) ? null : Number(v)));
  const picks = {};
  if (isObj(s.picks)) {
    for (const k in s.picks) {
      const v = normPick(s.picks[k]);
      if (v == null) continue;
      // Older builds keyed exam picks by queue position → re-key by question id.
      const key = /^\d+$/.test(k) ? queue[Number(k)] : k;
      if (key && queue.includes(key)) picks[key] = v;
    }
  }
  const requeued = {};
  if (isObj(s.requeued)) for (const k in s.requeued) requeued[k] = 1;
  return {
    kind: s.kind === 'quiz' ? 'quiz' : 'review', mode: String(s.mode || 'review'), title: String(s.title || 'Review'),
    queue, pos: clamp(Math.floor(num(s.pos)), 0, queue.length), phase: s.phase === 'reveal' ? 'reveal' : 'ask',
    pick: normPick(s.pick), flipped: !!s.flipped, requeued,
    results: listOr(s.results).filter((r) => isObj(r) && typeof r.id === 'string')
      .map((r) => ({ id: r.id, ok: !!r.ok, pick: normPick(r.pick) })),
    exam: !!s.exam, picks, timeLimitSec: num(s.timeLimitSec), elapsedSec: num(s.elapsedSec),
    startedAt: num(s.startedAt) || Date.now(), track: TRACK_IDS.includes(s.track) ? s.track : undefined,
  };
}

/** True if the object looks like a v1 (pre-versioned) progress blob. */
function isV1Shape(raw) {
  return isObj(raw) && raw.version == null &&
    ['seenQuestions', 'missedQuestions', 'quizHistory'].some((k) => Array.isArray(raw[k]));
}
/** True if the object looks like a v2 backup / progress blob. */
function isV2Shape(raw) {
  return isObj(raw) && raw.version === 2 && (isObj(raw.tracks) || isObj(raw.settings));
}

function normalizeProgress(raw) {
  if (!isObj(raw)) return defaultProgress();
  if (raw.version !== 2) return isV1Shape(raw) ? migrateV1(raw) : defaultProgress();
  const p = defaultProgress();
  p.settings = normSettings(raw.settings);
  const st = isObj(raw.streak) ? raw.streak : {};
  p.streak = { count: Math.floor(num(st.count)), lastDate: toYmd(st.lastDate) };
  if (isObj(raw.dayLog)) for (const k in raw.dayLog) {
    const v = raw.dayLog[k];
    if (isYmd(k) && isObj(v)) p.dayLog[k] = { cards: num(v.cards), questions: num(v.questions), lectureMin: num(v.lectureMin) };
  }
  const tracks = isObj(raw.tracks) ? raw.tracks : {};
  TRACK_IDS.forEach((t) => { p.tracks[t] = normTrack(tracks[t]); });
  return p;
}

/** v1 shape: {quizHistory, missedQuestions:[i], seenQuestions:[i], cardsStudied, lastActiveDate, streak, domainScores} */
function migrateV1(old) {
  const p = defaultProgress();
  const tr = p.tracks.clf;
  const t0 = today();
  const qid = (i) => 'clf-q-' + pad3(Number(i) + 1);
  listOr(old.seenQuestions).forEach((i) => {
    if (!Number.isInteger(Number(i))) return;
    tr.srs[qid(i)] = { box: 1, due: addDays(t0, 1), seen: 1, lapses: 0, intro: null };
  });
  listOr(old.missedQuestions).forEach((i) => {
    if (!Number.isInteger(Number(i))) return;
    const e = tr.srs[qid(i)];
    tr.srs[qid(i)] = { box: 0, due: t0, seen: e ? e.seen : 1, lapses: 1, intro: null };
  });
  tr.quizHistory = listOr(old.quizHistory).filter(isObj).map((h) => ({
    date: toYmd(h.date) || t0, mode: String(h.mode || 'quiz'),
    score: num(h.score != null ? h.score : pct(h.correct, h.total)), total: num(h.total), correct: num(h.correct),
    domains: isObj(h.domainScores) ? h.domainScores : (isObj(h.domains) ? h.domains : {}) }));
  if (isObj(old.domainScores)) for (const k in old.domainScores) {
    const v = old.domainScores[k];
    if (isObj(v)) tr.domainStats[k] = { correct: num(v.correct), total: num(v.total) };
  }
  const last = toYmd(old.lastActiveDate);
  p.streak = { count: Math.floor(num(old.streak)), lastDate: last };
  return p;
}

let P = null;

const CORRUPT_BACKUP_KEY = 'aws-study-progress-corrupt-backup';

/** Store a raw progress string without ever overwriting an earlier backup. */
function backupRaw(key, str) {
  if (str == null) return;
  const old = storeGet(key);
  if (old == null) storeSet(key, str);
  else if (old !== str) storeSet(key + '-' + Date.now(), str);
}

function loadProgress() {
  const rawStr = storeGet(PROGRESS_KEY);
  let raw = null;
  if (rawStr != null) {
    try { raw = JSON.parse(rawStr); } catch (e) {
      // Never overwrite the only copy of unreadable data: stash it first.
      backupRaw(CORRUPT_BACKUP_KEY, rawStr);
      setTimeout(() => { try { toast('Saved progress was unreadable. A copy was kept; starting fresh.'); } catch (e2) { /* no UI */ } }, 600);
    }
  }
  if (raw != null && !(isObj(raw) && raw.version === 2)) {
    // Anything that isn't current v2 data is kept before it gets replaced: v1 blobs in the
    // v1 backup key, anything else (newer version, arrays, odd shapes) in the corrupt key.
    backupRaw(isV1Shape(raw) ? V1_BACKUP_KEY : CORRUPT_BACKUP_KEY, rawStr);
  }
  try { P = normalizeProgress(raw); } catch (e) { P = defaultProgress(); }
  saveProgress();
  return P;
}

function saveProgress() {
  if (!storeSetJSON(PROGRESS_KEY, P)) {
    // Storage full? Trim history and retry once.
    TRACK_IDS.forEach((t) => { P.tracks[t].quizHistory = P.tracks[t].quizHistory.slice(-50); });
    storeSetJSON(PROGRESS_KEY, P);
  }
}

function curTrack() { return P.settings.track; }
function TS(t) { return P.tracks[t || curTrack()]; }

// ============================================================
//  Activity: streak + day log
// ============================================================
function touchStreak() {
  const t0 = today();
  const s = P.streak;
  if (s.lastDate === t0) return;
  s.count = s.lastDate === addDays(t0, -1) ? s.count + 1 : 1;
  s.lastDate = t0;
}
function streakNow() {
  const s = P.streak, t0 = today();
  return (s.lastDate === t0 || s.lastDate === addDays(t0, -1)) ? s.count : 0;
}
function logDay(field, n) {
  const t0 = today();
  const d = P.dayLog[t0] || (P.dayLog[t0] = { cards: 0, questions: 0, lectureMin: 0 });
  d[field] = Math.max(0, Math.round((d[field] + n) * 10) / 10);
  touchStreak();
  // keep ~1 year of day log
  const keys = Object.keys(P.dayLog);
  if (keys.length > 400) keys.sort().slice(0, keys.length - 400).forEach((k) => delete P.dayLog[k]);
}
function todayLog() { return P.dayLog[today()] || { cards: 0, questions: 0, lectureMin: 0 }; }
function todayStudyMin() {
  const d = todayLog();
  return Math.round(d.lectureMin + d.cards * 0.25 + d.questions * 1);
}

// ============================================================
//  Course / lecture progress
// ============================================================
function secById(t, sid) { const d = T(t); return d.sections[d.secIndex[sid]] || null; }
function lecPos(t, sid) {
  const s = secById(t, sid);
  return s ? clamp(TS(t).lecturePos[sid] || 0, 0, s.lectures.length) : 0;
}
function isSectionDone(t, sid) {
  const s = secById(t, sid);
  if (!s) return true; // unknown section id → treat as unlocked
  return lecPos(t, sid) >= s.lectures.length;
}
/** Items unlock once a section has been completed, even if a later content update added lectures to it. */
function sectionUnlocked(t, sid) { return isSectionDone(t, sid) || !!TS(t).sectionDoneAt[sid]; }
function lecEffMin(sec, lec) { return (num(lec[1]) / 60) / paceSpeed(sec.pace); }
function sectionEffMin(sec, from) {
  let m = 0;
  for (let i = from || 0; i < sec.lectures.length; i++) m += lecEffMin(sec, sec.lectures[i]);
  return m;
}

/**
 * Set a section's next-lecture index. Handles unlock bookkeeping.
 * undoMin: pass only from an Undo callback = the loggedMin the original call returned.
 * Returns { unlocked, done, loggedMin }.
 */
function setLecturePos(t, sid, pos, undoMin, opts) {
  opts = opts || {};
  const sec = secById(t, sid);
  if (!sec) return { unlocked: 0, loggedMin: 0 };
  const tr = TS(t);
  const before = lecPos(t, sid);
  pos = clamp(Math.floor(pos), 0, sec.lectures.length);
  if (pos === before) return { unlocked: 0, loggedMin: 0 };
  const wasDone = before >= sec.lectures.length;
  const prevDoneAt = tr.sectionDoneAt[sid] || null;
  tr.lecturePos[sid] = pos;
  let loggedMin = 0;
  if (pos > before) {
    let m = 0;
    for (let i = before; i < pos; i++) m += lecEffMin(sec, sec.lectures[i]);
    if (undoMin == null && !opts.noLog) { // an Undo that restores unticked lectures logs nothing new
      // Bulk catch-up ticks shouldn't fake a huge study day: max 90 per action, and the
      // day's lecture minutes never exceed twice the daily goal.
      const room = Math.max(0, P.settings.dailyMinutes * 2 - todayLog().lectureMin);
      loggedMin = Math.round(Math.min(m, 90, room) * 10) / 10;
      if (loggedMin > 0) logDay('lectureMin', loggedMin); else touchStreak();
    }
  } else if (undoMin > 0) {
    // Only an Undo of a tick made today gives back exactly what that tick logged;
    // plain unticks (fixing an old checklist mistake) leave the day log alone.
    const d = P.dayLog[today()];
    if (d) d.lectureMin = Math.max(0, Math.round((d.lectureMin - undoMin) * 10) / 10);
  }
  const nowDone = pos >= sec.lectures.length;
  let unlocked = 0;
  if (nowDone && !wasDone) {
    // Keep the original completion date if the section was finished before new lectures were added.
    tr.sectionDoneAt[sid] = prevDoneAt || today();
    unlocked = prevDoneAt ? 0 : sectionItems(t, sid).length;
  } else if (!nowDone && (wasDone || pos < before)) {
    delete tr.sectionDoneAt[sid]; // a real untick relocks (undoLecture restores prevDoneAt)
  }
  saveProgress();
  return { unlocked, done: nowDone && !wasDone, loggedMin, prevDoneAt };
}

/** Undo a lecture change made by setLecturePos (restores the logged minutes and completion date). */
function undoLecture(t, sid, before, res) {
  setLecturePos(t, sid, before, res.loggedMin || 0);
  if (res.prevDoneAt) { TS(t).sectionDoneAt[sid] = res.prevDoneAt; saveProgress(); }
}

function sectionItems(t, sid) {
  const d = T(t);
  return d.questions.filter((q) => q.section === sid).concat(d.cards.filter((c) => c.section === sid));
}

function courseStats(t) {
  const d = T(t);
  let totalEff = 0, doneEff = 0, lecTotal = 0, lecDone = 0, secDone = 0;
  d.sections.forEach((s) => {
    const p = lecPos(t, s.id);
    s.lectures.forEach((l, i) => {
      const m = lecEffMin(s, l);
      totalEff += m; lecTotal++;
      if (i < p) { doneEff += m; lecDone++; }
    });
    if (p >= s.lectures.length) secDone++;
  });
  return { totalEff, doneEff, remainingEff: totalEff - doneEff, lecTotal, lecDone, secDone,
    secTotal: d.sections.length, allDone: d.sections.length > 0 && secDone === d.sections.length,
    pct: pct(lecDone, lecTotal) };
}

function currentSection(t) {
  return T(t).sections.find((s) => !isSectionDone(t, s.id)) || null;
}

/** Most recently completed (or current) section id for hands-free fallback. */
function recentSectionId(t) {
  const tr = TS(t), d = T(t);
  const withItems = (sid) => sectionItems(t, sid).length > 0;
  const done = Object.keys(tr.sectionDoneAt).filter((sid) => d.secIndex[sid] != null && withItems(sid))
    .sort((a, b) => (tr.sectionDoneAt[a] < tr.sectionDoneAt[b] ? -1 : tr.sectionDoneAt[a] > tr.sectionDoneAt[b] ? 1 : d.secIndex[a] - d.secIndex[b]));
  if (done.length) return done[done.length - 1];
  const cur = currentSection(t);
  return cur ? cur.id : null;
}

function trackStart(t) {
  if (t === 'clf') return P.settings.startDate;
  const tr = TS('saa');
  if (tr.startedAt) return tr.startedAt;
  const after = addDays(P.tracks.clf.passedAt || P.settings.examDates.clf, 1);
  return after > P.settings.startDate ? after : P.settings.startDate;
}
function examDate(t) { return P.settings.examDates[t || curTrack()]; }
function courseTarget(t) { return addDays(examDate(t), -P.settings.reviewDays[t]); }

/** Pace line data. */
function paceInfo(t) {
  const cs = courseStats(t);
  const t0 = today();
  const start = trackStart(t);
  const target = courseTarget(t);
  const from = t0 > start ? t0 : start;
  const daysLeft = Math.max(1, daysBetween(from, target) + 1);
  const perDay = cs.remainingEff / daysLeft;
  const span = Math.max(1, daysBetween(start, target) + 1);
  const elapsed = clamp(daysBetween(start, t0), 0, span); // days fully behind us
  const expected = cs.totalEff * (elapsed / span);
  const behind = Math.round(expected - cs.doneEff);
  return { cs, start, target, daysLeft, perDay, behind, notStarted: t0 < start, pastTarget: t0 > target };
}

// ============================================================
//  Unlocking + SRS
// ============================================================
function isUnlocked(t, item) { return item.section == null || sectionUnlocked(t, item.section); }
function unlockedQuestions(t) { return T(t).questions.filter((q) => isUnlocked(t, q)); }
function unlockedCards(t) { return T(t).cards.filter((c) => isUnlocked(t, c)); }

function itemOrderKey(t, item) {
  const si = item.section == null ? -1 : (T(t).secIndex[item.section] != null ? T(t).secIndex[item.section] : 999);
  return si;
}

function dueItems(t, filter) {
  const tr = TS(t), t0 = today(), out = [];
  for (const id in tr.srs) {
    const e = tr.srs[id];
    if (e.due > t0) continue;
    const it = itemById(t, id);
    if (!it || !isUnlocked(t, it.item)) continue;
    if (filter && !filter(it)) continue;
    out.push({ id, e, it });
  }
  out.sort((a, b) => (a.e.due < b.e.due ? -1 : a.e.due > b.e.due ? 1 : a.e.box - b.e.box));
  return out.map((x) => x.id);
}

function introducedToday(t) {
  const t0 = today(), srs = TS(t).srs;
  let n = 0;
  for (const id in srs) if (srs[id].intro === t0) n++;
  return n;
}

/** New (unlocked, never graded) items in course order. */
function newItems(t, filter) {
  const d = T(t), srs = TS(t).srs;
  const pick = (arr, kind) => {
    const perSec = {};
    return arr.filter((it) => !srs[it.id] && isUnlocked(t, it))
      .map((it) => {
        const k = it.section == null ? '' : it.section;
        const rank = perSec[k] = (perSec[k] == null ? 0 : perSec[k] + 1); // rank within its own section
        return { kind, item: it, rank };
      }).filter((x) => !filter || filter(x));
  };
  const out = pick(d.cards, 'c').concat(pick(d.questions, 'q'));
  // course order; within a section alternate card, question, card, question...
  out.sort((a, b) => (itemOrderKey(t, a.item) - itemOrderKey(t, b.item)) || (a.rank - b.rank) || (a.kind < b.kind ? -1 : 1));
  return out.map((x) => x.item.id);
}
function newQuota(t) { return Math.max(0, P.settings.newPerDay - introducedToday(t)); }

/**
 * Grade an item. ok=true "knew it"/correct.
 * opts.review: item came through a review session, so a brand-new item counts
 *   toward today's newPerDay quota (intro=today). Quiz-graded new items do not.
 * opts.statsOnly: update domain stats / readiness / day log but never touch srs
 *   (locked items answered in a whole-bank exam).
 */
function gradeItem(t, id, ok, opts) {
  opts = opts || {};
  const it = itemById(t, id);
  if (!it) return;
  const tr = TS(t), t0 = today();
  if (!opts.statsOnly) {
    let e = tr.srs[id];
    if (!e) e = tr.srs[id] = { box: 0, due: t0, seen: 0, lapses: 0, intro: opts.review ? t0 : null };
    e.seen++;
    if (ok) {
      if (e.due <= t0) {
        e.box = Math.min(5, e.box + 1);
        e.due = addDays(t0, SRS_INTERVALS[e.box]);
      }
    } else {
      e.lapses++;
      e.box = 0;
      e.due = t0;
    }
  }
  if (it.kind === 'q') {
    const dom = it.item.domain;
    const ds = tr.domainStats[dom] || (tr.domainStats[dom] = { correct: 0, total: 0 });
    ds.total++; if (ok) ds.correct++;
    tr.recent.push({ id, domain: dom, ok: !!ok });
    if (tr.recent.length > RECENT_MAX) tr.recent.splice(0, tr.recent.length - RECENT_MAX);
    logDay('questions', 1);
  } else {
    logDay('cards', 1);
  }
}

function markSeen(t, id) {
  const e = TS(t).srs[id];
  if (e) e.seen++;
}

function checkAnswer(q, pick) {
  if (isMulti(q)) {
    const a = [...q.answer].sort().join(',');
    const b = [...listOr(pick)].sort().join(',');
    return a === b;
  }
  return Number(pick) === q.answer;
}

// ============================================================
//  Stats / readiness
// ============================================================
function srsSummary(t) {
  const tr = TS(t), t0 = today();
  const boxes = [0, 0, 0, 0, 0, 0];
  let due = 0, dueCards = 0, dueQ = 0;
  for (const id in tr.srs) {
    const it = itemById(t, id);
    if (!it || !isUnlocked(t, it.item)) continue;
    const e = tr.srs[id];
    boxes[e.box]++;
    if (e.due <= t0) { due++; if (it.kind === 'c') dueCards++; else dueQ++; }
  }
  const newAvail = newItems(t).length;
  return { boxes, due, dueCards, dueQ, newAvail, newToday: Math.min(newAvail, newQuota(t)), mastered: boxes[4] + boxes[5] };
}

function readiness(t) {
  const d = T(t), tr = TS(t);
  const per = d.domains.map((dom) => {
    const r = tr.recent.filter((x) => x.domain === dom.id).slice(-40);
    const c = r.filter((x) => x.ok).length;
    const qs = d.questions.filter((q) => q.domain === dom.id);
    const seen = qs.filter((q) => tr.srs[q.id]).length;
    return { id: dom.id, name: dom.name, w: dom.w, n: r.length, pct: r.length ? pct(c, r.length) : null,
      coverage: pct(seen, qs.length), qTotal: qs.length };
  });
  // Domains with no answers count as 0 so a few answers in one domain can't look like exam readiness.
  const wsum = per.reduce((s, x) => s + x.w, 0);
  const any = per.some((x) => x.n);
  const overall = wsum && any ? Math.round(per.reduce((s, x) => s + (x.pct || 0) * x.w, 0) / wsum) : null;
  const provisional = per.some((x) => x.n < READY_MIN_N);
  return { per, overall, provisional, answers: tr.recent.length };
}

function weakestDomain(t, pool) {
  const d = T(t), tr = TS(t);
  let best = null, bestScore = 2;
  d.domains.forEach((dom) => {
    if (pool && !pool.some((q) => q.domain === dom.id)) return;
    const r = tr.recent.filter((x) => x.domain === dom.id).slice(-40);
    const c = r.filter((x) => x.ok).length;
    const score = (c + 1) / (r.length + 2) - dom.w / 1000; // tie-break: heavier domain first
    if (score < bestScore) { bestScore = score; best = dom.id; }
  });
  return best;
}

function fullExamsAtLeast(t, minScore) {
  return TS(t).quizHistory.filter((h) => h.mode === 'exam' && h.score >= minScore).length;
}
