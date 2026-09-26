// ============================================================
//  AWS Cert Study — Sessions
//  Resumable review / quiz sessions stored in tracks[t].session.
//  Session shape:
//   { kind:'review'|'quiz', mode, title, queue:[ids], pos, phase:'ask'|'reveal',
//     pick, flipped, requeued:{id:1}, results:[{id,ok,pick}], exam:bool,
//     picks:{questionId:pick} (exam), timeLimitSec, elapsedSec, startedAt }
// ============================================================

const REVIEW_LIMIT = 15;

// ---------------- Builders ----------------
function buildReviewIds(t, limit, filter) {
  limit = limit || REVIEW_LIMIT;
  const due = dueItems(t, filter);
  let ids = due.slice(0, limit);
  if (ids.length < limit) {
    const quota = Math.min(newQuota(t), limit - ids.length);
    ids = ids.concat(newItems(t, filter).slice(0, quota));
  }
  // mix cards and questions but keep due-first priority loosely
  return interleave(ids, t);
}

function interleave(ids, t) {
  const cards = ids.filter((id) => (itemById(t, id) || {}).kind === 'c');
  const qs = ids.filter((id) => (itemById(t, id) || {}).kind === 'q');
  const out = [];
  while (cards.length || qs.length) {
    if (cards.length) out.push(cards.shift());
    if (cards.length) out.push(cards.shift());
    if (qs.length) out.push(qs.shift());
  }
  return out;
}

/** Pick n questions weighted to the weakest domain, preferring due/unseen/lapsed. */
function buildWeakIds(t, n) {
  const pool = unlockedQuestions(t);
  if (!pool.length) return [];
  const weak = weakestDomain(t, pool);
  const srs = TS(t).srs, t0 = today();
  const prio = (q) => { const e = srs[q.id]; return !e ? 1 : e.due <= t0 ? 0 : e.lapses ? 2 : 3; };
  const order = (arr) => shuffle(arr).sort((a, b) => prio(a) - prio(b));
  const inWeak = order(pool.filter((q) => q.domain === weak));
  const rest = order(pool.filter((q) => q.domain !== weak));
  const nWeak = Math.min(inWeak.length, Math.ceil(n * 0.6));
  let picked = inWeak.slice(0, nWeak).concat(rest.slice(0, n - nWeak));
  if (picked.length < n) picked = picked.concat(inWeak.slice(nWeak, nWeak + n - picked.length));
  return shuffle(picked).map((q) => q.id);
}

function buildQuizIds(t, mode, arg) {
  const d = T(t), srs = TS(t).srs, t0 = today();
  const pool = unlockedQuestions(t);
  if (mode === 'quick') return shuffle(pool).slice(0, 20).map((q) => q.id);
  if (mode === 'five') return buildWeakIds(t, 5);
  if (mode === 'domain') return shuffle(pool.filter((q) => q.domain === arg)).slice(0, 20).map((q) => q.id);
  if (mode === 'missed') {
    const m = pool.filter((q) => { const e = srs[q.id]; return e && (e.due <= t0 || (e.lapses > 0 && e.box < 3)); });
    return shuffle(m).slice(0, 30).map((q) => q.id);
  }
  if (mode === 'exam') {
    // Whole bank, sampled by domain weight (real-exam simulation).
    const total = Math.min(d.meta.examQ, d.questions.length);
    const wsum = d.domains.reduce((s, x) => s + x.w, 0) || 1;
    // Largest-remainder allocation so the shares add up to exactly `total`.
    const alloc = d.domains.map((dom) => {
      const exact = total * dom.w / wsum;
      return { dom, want: Math.floor(exact), frac: exact - Math.floor(exact) };
    });
    let spare = total - alloc.reduce((s, a) => s + a.want, 0);
    alloc.slice().sort((a, b) => b.frac - a.frac).forEach((a) => { if (spare > 0) { a.want++; spare--; } });
    let picked = [];
    alloc.forEach((a) => {
      picked = picked.concat(shuffle(d.questions.filter((q) => q.domain === a.dom.id)).slice(0, a.want));
    });
    if (picked.length < total) {
      const have = new Set(picked.map((q) => q.id));
      picked = picked.concat(shuffle(d.questions.filter((q) => !have.has(q.id))).slice(0, total - picked.length));
    }
    return shuffle(picked).slice(0, total).map((q) => q.id);
  }
  return [];
}

function buildCardIds(t, cat) {
  if (cat === 'due') return buildReviewIds(t, 25, (x) => x.kind === 'c');
  const cards = unlockedCards(t).filter((c) => cat === 'all' || c.category === cat);
  const srs = TS(t).srs, t0 = today();
  // due first, then unseen, then the rest by lowest box
  const key = (c) => { const e = srs[c.id]; return !e ? 1 : e.due <= t0 ? 0 : 2 + e.box; };
  return shuffle(cards).sort((a, b) => key(a) - key(b)).slice(0, 25).map((c) => c.id);
}

// ---------------- Lifecycle ----------------
function curSess() { return TS().session; }

function startSession(o, force) {
  const ids = listOr(o.ids);
  if (!ids.length) { toast(o.emptyMsg || 'Nothing to study here yet'); return false; }
  const old = curSess();
  if (old && !force && (old.pos > 0 || old.results.length || old.exam || Object.keys(old.picks).length)) {
    // One session slot per track: never silently throw away a paused session (esp. a timed exam).
    UI.pendingStart = o;
    render();
    window.scrollTo(0, 0);
    return false;
  }
  UI.pendingStart = null;
  hideToast();
  const s = {
    kind: o.kind || 'review', mode: o.mode || 'review', title: o.title || 'Review', queue: ids, pos: 0,
    phase: 'ask', pick: null, flipped: false, requeued: {}, results: [], exam: !!o.exam, picks: {},
    timeLimitSec: o.timeLimitSec || 0, elapsedSec: 0, startedAt: Date.now(), track: curTrack(),
  };
  TS().session = s;
  saveProgress();
  UI.result = null;
  UI.sessMenu = false;
  go('session');
  return true;
}

function sessionItem(s) {
  s = s || curSess();
  if (!s) return null;
  return itemById(curTrack(), s.queue[s.pos]);
}

function answerCurrent(pick) {
  const s = curSess(), it = sessionItem(s);
  if (!s || !it || it.kind !== 'q' || s.phase !== 'ask') return;
  const ok = checkAnswer(it.item, pick);
  const first = !s.results.some((r) => r.id === it.item.id);
  gradeItem(curTrack(), it.item.id, ok, { review: s.kind === 'review', statsOnly: !isUnlocked(curTrack(), it.item) });
  if (first) s.results.push({ id: it.item.id, ok, pick });
  if (!ok && s.kind === 'review') requeue(s, it.item.id);
  s.phase = 'reveal';
  s.pick = pick;
  saveProgress();
  render();
}

function gradeCard(ok) {
  const s = curSess(), it = sessionItem(s);
  if (!s || !it || it.kind !== 'c') return;
  const first = !s.results.some((r) => r.id === it.item.id);
  gradeItem(curTrack(), it.item.id, ok, { review: s.kind === 'review', statsOnly: !isUnlocked(curTrack(), it.item) });
  if (first) s.results.push({ id: it.item.id, ok });
  if (!ok) requeue(s, it.item.id);
  nextItem();
}

function requeue(s, id) {
  if (s.requeued[id]) return;
  s.requeued[id] = 1;
  const at = Math.min(s.queue.length, s.pos + 4);
  s.queue.splice(at, 0, id);
}

function nextItem() {
  const s = curSess();
  if (!s) return;
  s.pos++;
  s.phase = 'ask'; s.pick = null; s.flipped = false;
  if (s.pos >= s.queue.length) { finishSession(); return; }
  saveProgress();
  render();
  window.scrollTo(0, 0);
}

// ---- exam mode (no feedback until the end) ----
/** Exam answer counts only when complete (multi-response: all N options chosen). */
function examAnswered(s, id) {
  const pick = s.picks[id];
  if (pick == null) return false;
  const it = itemById(curTrack(), id);
  if (it && it.kind === 'q' && isMulti(it.item)) return listOr(pick).length === it.item.answer.length;
  return true;
}
function examAnsweredCount(s) { return s.queue.filter((id) => examAnswered(s, id)).length; }

function examSetPick(pick) {
  const s = curSess();
  if (!s) return;
  s.picks[s.queue[s.pos]] = pick;
  saveProgress();
  render();
}
function examNav(delta) {
  const s = curSess();
  if (!s) return;
  s.pos = clamp(s.pos + delta, 0, s.queue.length - 1);
  saveProgress();
  render();
  window.scrollTo(0, 0);
}

function finishSession() {
  const t = curTrack(), s = curSess();
  if (!s) return;
  if (s.exam) {
    s.results = [];
    s.queue.forEach((id) => {
      const it = itemById(t, id);
      if (!it) return;
      const pick = s.picks[id];
      const ok = pick != null && checkAnswer(it.item, pick);
      // Whole-bank exam: locked (unwatched) items feed stats/readiness only, never the SRS queue.
      gradeItem(t, id, ok, { statsOnly: !isUnlocked(t, it.item) });
      s.results.push({ id, ok, pick: pick == null ? null : pick });
    });
  }
  const qRes = s.results.filter((r) => (itemById(t, r.id) || {}).kind === 'q');
  const cRes = s.results.filter((r) => (itemById(t, r.id) || {}).kind === 'c');
  const domains = {};
  qRes.forEach((r) => {
    const q = itemById(t, r.id).item;
    const d = domains[q.domain] || (domains[q.domain] = { correct: 0, total: 0 });
    d.total++; if (r.ok) d.correct++;
  });
  const correct = qRes.filter((r) => r.ok).length;
  const res = {
    track: t, mode: s.mode, title: s.title, exam: s.exam, date: today(),
    total: qRes.length, correct, score: pct(correct, qRes.length), domains,
    cards: cRes.length, cardsKnew: cRes.filter((r) => r.ok).length,
    missed: s.results.filter((r) => !r.ok).map((r) => ({ id: r.id, pick: r.pick })),
    pass: s.exam ? T(t).meta.pass : null, elapsedSec: s.elapsedSec,
    unanswered: s.exam ? s.queue.length - examAnsweredCount(s) : 0,
  };
  if (qRes.length && s.kind === 'quiz') {
    TS(t).quizHistory.push({ date: res.date, mode: s.mode, score: res.score, total: res.total, correct, domains });
    if (TS(t).quizHistory.length > 200) TS(t).quizHistory.shift();
  }
  TS(t).session = null;
  saveProgress();
  UI.result = res;
  go('result');
}

function discardSession() {
  const tr = TS(), copy = tr.session;
  tr.session = null;
  saveProgress();
  UI.sessMenu = false;
  go('today');
  toast('Session discarded', { action: { label: 'Undo', fn: () => {
    if (!copy || tr.session) return;
    tr.session = copy; saveProgress(); go('session');
  } }, ms: 8000 });
}

// ---------------- Rendering ----------------
/** Inline "you already have a paused session" panel (rendered above the current view). */
function pendingStartPanel() {
  const o = UI.pendingStart, s = curSess();
  if (!o || !s) return '';
  const where = Math.min(s.pos + 1, s.queue.length) + '/' + s.queue.length;
  return '<div class="panel inline-panel pending-start" role="alert"><p><b>You have a paused ' + esc(s.title) + ' (' + where + ').</b> ' +
    (s.exam ? 'Starting ' + esc(o.title || 'something new') + ' would throw away this exam and its timer.' :
      'Starting ' + esc(o.title || 'something new') + ' replaces it.') + '</p>' +
    '<div class="btn-row"><button type="button" class="btn primary" data-act="pending-resume">⏯ Resume it</button>' +
    '<button type="button" class="btn' + (s.exam ? ' danger' : '') + '" data-act="pending-replace">Replace it</button></div>' +
    '<button type="button" class="btn ghost" data-act="pending-cancel">Cancel</button></div>';
}

function sessTitleBar(s) {
  const n = s.queue.length;
  const timer = s.timeLimitSec ? '<span class="sess-timer" id="sess-timer">' + fmtClock(s.timeLimitSec - s.elapsedSec) + '</span>' : '';
  return '<div class="sess-top">' +
    '<button type="button" class="icon-btn" data-act="sess-menu" aria-label="Session menu">☰</button>' +
    '<div class="sess-title">' + esc(s.title) + '</div>' + timer +
    '<div class="sess-count">' + Math.min(s.pos + 1, n) + '/' + n + '</div></div>' +
    '<div class="bar-bg thin"><div class="bar-fill" style="width:' + pct(s.pos, n) + '%"></div></div>' +
    (UI.sessMenu ? sessMenuPanel(s) : '');
}

function sessMenuPanel(s) {
  return '<div class="panel inline-panel">' +
    '<p class="muted">Your place is saved automatically — you can close the app any time.</p>' +
    '<button type="button" class="btn" data-act="sess-pause">⏸ Pause · resume later</button>' +
    (s.results.length || s.exam ? '<button type="button" class="btn" data-act="sess-finish">🏁 Finish now · see results</button>' : '') +
    '<button type="button" class="btn danger" data-act="sess-discard">🗑 Discard this session</button>' +
    '<button type="button" class="btn ghost" data-act="sess-menu">Close menu</button></div>';
}

function renderSession() {
  const s = curSess();
  if (!s) return '<div class="empty"><p>No session in progress.</p><button class="btn primary" data-act="nav" data-view="today">Go to Today</button></div>';
  let it = sessionItem(s);
  // Skip ids that no longer exist in the data (retired / data file missing)
  let guard = 0, spliced = false;
  while (!it && s.pos < s.queue.length && guard++ < 1000) { s.queue.splice(s.pos, 1); spliced = true; it = sessionItem(s); }
  // Exams only finish when the user presses Finish: step back to the last remaining question.
  if (!it && s.exam && s.queue.length) { s.pos = s.queue.length - 1; it = sessionItem(s); }
  if (spliced) saveProgress();
  if (!it) { setTimeout(finishSession, 0); return ''; }
  return '<div class="sess">' + sessTitleBar(s) +
    (it.kind === 'c' ? renderCard(s, it.item) : s.exam ? renderExamQ(s, it.item) : renderQ(s, it.item)) + '</div>';
}

function itemMeta(q) {
  const t = curTrack();
  const sec = q.section ? secById(t, q.section) : null;
  const parts = [];
  if (q.domain) parts.push(domainName(t, q.domain));
  if (q.category) parts.push(q.category);
  if (sec) parts.push('§' + sec.n + ' ' + sec.title);
  const e = TS(t).srs[q.id];
  parts.push(!e ? '✨ new' : e.box >= 4 ? 'mastered ⭐' : e.box >= 1 ? 'reviewing' : 'learning');
  return '<div class="q-meta">' + esc(parts.join(' · ')) + '</div>';
}

function renderCard(s, c) {
  const flipped = s.flipped;
  return itemMeta(c) +
    '<div class="fcard' + (flipped ? ' flipped' : '') + '" data-act="flip" data-swipe="' + (flipped ? '1' : '') + '">' +
    '<div class="fcard-term">' + esc(c.term) + '</div>' +
    (flipped ? '<div class="fcard-def">' + esc(c.definition) + '</div>' : '<div class="muted small">Say it in your head, then tap to check</div>') +
    '</div>' +
    '<div class="thumb-bar">' + (flipped
      ? '<button type="button" class="btn big miss" data-act="card-grade" data-ok="0">✗ Didn\'t know</button>' +
        '<button type="button" class="btn big know" data-act="card-grade" data-ok="1">✓ Knew it</button>'
      : '<button type="button" class="btn big primary wide" data-act="flip">Show answer</button>') +
    '</div>' + (flipped ? '<p class="muted small center">Swipe right = knew it · left = didn\'t</p>' : '');
}

function optClass(q, i, s, reveal) {
  const multi = isMulti(q);
  const correct = multi ? q.answer.includes(i) : q.answer === i;
  const picked = multi ? listOr(s.pick).includes(i) : s.pick === i;
  if (!reveal) return picked ? ' selected' : '';
  if (correct) return ' correct';
  if (picked) return ' wrong';
  return ' dim';
}

function renderQ(s, q) {
  const reveal = s.phase === 'reveal';
  const multi = isMulti(q);
  let h = itemMeta(q) + '<div class="q-text">' + esc(q.question) + '</div>';
  if (multi && !reveal) h += '<div class="q-hint">Select ' + q.answer.length + ' answers, then Submit.</div>';
  h += '<div class="opts">';
  q.options.forEach((o, i) => {
    h += '<button type="button" class="opt' + optClass(q, i, s, reveal) + '"' + (reveal ? ' disabled' : '') +
      ' data-act="' + (multi ? 'toggle-opt' : 'pick') + '" data-i="' + i + '"><b>' + LETTERS[i] + '</b><span>' + esc(o) + '</span></button>';
  });
  h += '</div>';
  if (!reveal && multi) {
    const n = listOr(s.pick).length;
    h += '<div class="thumb-bar"><button type="button" class="btn big primary wide" data-act="submit-multi"' +
      (n === q.answer.length ? '' : ' disabled') + '>Submit (' + n + '/' + q.answer.length + ')</button></div>';
  }
  if (reveal) {
    const ok = checkAnswer(q, s.pick);
    const ans = multi ? q.answer.map((i) => LETTERS[i]).join(' + ') : LETTERS[q.answer];
    h += '<div class="explain ' + (ok ? 'ok' : 'bad') + '"><div class="explain-head">' +
      (ok ? '✅ Correct' : '❌ Answer: ' + ans) + '</div><p>' + esc(q.explanation || '') + '</p></div>' +
      '<div class="thumb-bar"><button type="button" class="btn big primary wide" data-act="next">' +
      (s.pos + 1 >= s.queue.length ? 'See results →' : 'Next →') + '</button></div>';
  }
  return h;
}

function renderExamQ(s, q) {
  const multi = isMulti(q);
  const pick = s.picks[q.id];
  let h = '<div class="q-meta">Question ' + (s.pos + 1) + ' of ' + s.queue.length + ' · ' + examAnsweredCount(s) + ' answered</div>' +
    '<div class="q-text">' + esc(q.question) + '</div><div class="opts">';
  q.options.forEach((o, i) => {
    const sel = multi ? listOr(pick).includes(i) : pick === i;
    h += '<button type="button" class="opt' + (sel ? ' selected' : '') + '" data-act="exam-pick" data-i="' + i + '"><b>' +
      LETTERS[i] + '</b><span>' + esc(o) + '</span></button>';
  });
  h += '</div>';
  const last = s.pos + 1 >= s.queue.length;
  h += '<div class="thumb-bar">' +
    '<button type="button" class="btn big" data-act="exam-nav" data-d="-1"' + (s.pos ? '' : ' disabled') + '>← Back</button>' +
    (last ? '<button type="button" class="btn big primary" data-act="exam-finish">🏁 Finish</button>'
      : '<button type="button" class="btn big primary" data-act="exam-nav" data-d="1">Next →</button>') + '</div>';
  if (UI.confirmFinish) {
    const un = s.queue.length - examAnsweredCount(s);
    h += '<div class="panel inline-panel"><p>' + (un ? plural(un, 'question') + ' unanswered (they count as wrong). ' : '') +
      'Finish the exam?</p><button type="button" class="btn primary" data-act="sess-finish">Yes, finish</button>' +
      '<button type="button" class="btn ghost" data-act="exam-finish-cancel">Keep going</button></div>';
  }
  return h;
}

function renderResult() {
  const r = resultForTrack();
  if (!r) { return '<div class="empty"><p>No results to show.</p><button class="btn primary" data-act="nav" data-view="today">Go to Today</button></div>'; }
  const t = curTrack();
  let h = '<div class="result">';
  if (r.total) {
    const passed = r.pass != null ? r.score >= r.pass : null;
    h += '<div class="result-score ' + (r.score >= 80 ? 'good' : r.score >= 70 ? 'ok' : 'bad') + '">' + r.score + '%</div>' +
      '<div class="center">' + r.correct + ' / ' + r.total + ' questions correct' +
      (passed != null ? ' · ' + (passed ? '✅ above the ' + r.pass + '% pass mark' : '⚠️ below the ' + r.pass + '% pass mark') : '') + '</div>';
    if (r.exam && r.elapsedSec) h += '<div class="center muted small">Time used ' + fmtClock(r.elapsedSec) + (r.unanswered ? ' · ' + r.unanswered + ' unanswered' : '') + '</div>';
  }
  if (r.cards) h += '<div class="center big-note">🃏 ' + r.cardsKnew + ' / ' + r.cards + ' cards known</div>';
  h += '<p class="center muted">' + esc(r.title) + ' done · nice work' + (streakNow() > 1 ? ' · 🔥 ' + streakNow() + '-day streak' : '') + '</p>';
  const doms = Object.keys(r.domains);
  if (doms.length) {
    h += '<h2>By domain</h2>';
    T(t).domains.forEach((d) => {
      const v = r.domains[d.id];
      if (!v) return;
      h += barRow(d.name, pct(v.correct, v.total), v.correct + '/' + v.total);
    });
  }
  h += '<div class="stack">';
  if (r.missed.length) h += '<button type="button" class="btn big primary" data-act="review-missed">🔁 Review the ' + plural(r.missed.length, 'miss', 'misses') + ' now</button>';
  h += '<button type="button" class="btn big" data-act="nav" data-view="today">🏠 Back to Today</button></div>';
  if (r.missed.length) {
    h += '<h2>What you missed</h2>';
    r.missed.forEach((m) => {
      const it = itemById(t, m.id);
      if (!it) return;
      if (it.kind === 'c') {
        h += '<details class="miss-item"><summary>🃏 ' + esc(it.item.term) + '</summary><p>' + esc(it.item.definition) + '</p></details>';
      } else {
        const q = it.item;
        const ans = isMulti(q) ? q.answer.map((i) => LETTERS[i] + '. ' + q.options[i]).join('; ') : LETTERS[q.answer] + '. ' + q.options[q.answer];
        const yours = m.pick == null ? 'no answer' : (Array.isArray(m.pick) ? m.pick.map((i) => LETTERS[i]).join('+') : LETTERS[m.pick]);
        h += '<details class="miss-item"><summary>' + esc(q.question) + '</summary><p><b>Correct:</b> ' + esc(ans) +
          '</p><p class="muted">You: ' + esc(yours) + '</p><p>' + esc(q.explanation || '') + '</p></details>';
      }
    });
  }
  return h + '</div>';
}

/** The last result, only if it belongs to the track being studied now. */
function resultForTrack() {
  const r = UI.result;
  return r && (!r.track || r.track === curTrack()) ? r : null;
}

function barRow(label, p, right) {
  const cls = p >= 80 ? 'good' : p >= 60 ? 'ok' : 'bad';
  return '<div class="bar-row"><div class="bar-label"><span>' + esc(label) + '</span><span>' + esc(right) + '</span></div>' +
    '<div class="bar-bg"><div class="bar-fill ' + cls + '" style="width:' + clamp(p, 0, 100) + '%"></div></div></div>';
}

// ---------------- Actions ----------------
ACTIONS['flip'] = () => { const s = curSess(); if (s && !s.flipped) { s.flipped = true; saveProgress(); render(); } };
ACTIONS['card-grade'] = (el) => gradeCard(el.dataset.ok === '1');
ACTIONS['pick'] = (el) => answerCurrent(Number(el.dataset.i));
ACTIONS['toggle-opt'] = (el) => {
  const s = curSess(); if (!s) return;
  const i = Number(el.dataset.i), q = sessionItem(s).item;
  let p = listOr(s.pick).slice();
  p = p.includes(i) ? p.filter((x) => x !== i) : p.concat(i);
  if (p.length > q.answer.length) p.shift();
  s.pick = p; saveProgress(); render();
};
ACTIONS['submit-multi'] = () => { const s = curSess(); if (s) answerCurrent(listOr(s.pick)); };
ACTIONS['next'] = () => nextItem();
ACTIONS['exam-pick'] = (el) => {
  const s = curSess(); if (!s) return;
  const i = Number(el.dataset.i), q = sessionItem(s).item;
  if (isMulti(q)) {
    let p = listOr(s.picks[q.id]).slice();
    p = p.includes(i) ? p.filter((x) => x !== i) : p.concat(i);
    if (p.length > q.answer.length) p.shift();
    if (p.length) examSetPick(p); else { delete s.picks[q.id]; saveProgress(); render(); }
  } else examSetPick(i);
};
ACTIONS['exam-nav'] = (el) => examNav(Number(el.dataset.d));
ACTIONS['exam-finish'] = () => { UI.confirmFinish = true; render(); };
ACTIONS['exam-finish-cancel'] = () => { UI.confirmFinish = false; render(); };
ACTIONS['sess-menu'] = () => { UI.sessMenu = !UI.sessMenu; render(); };
ACTIONS['sess-pause'] = () => { UI.sessMenu = false; go('today'); toast('Paused — resume from Today'); };
ACTIONS['sess-finish'] = () => { UI.sessMenu = false; UI.confirmFinish = false; finishSession(); };
ACTIONS['sess-discard'] = () => discardSession();
ACTIONS['sess-resume'] = () => go('session');
ACTIONS['pending-resume'] = () => { UI.pendingStart = null; go('session'); };
ACTIONS['pending-cancel'] = () => { UI.pendingStart = null; render(); };
ACTIONS['pending-replace'] = () => {
  const o = UI.pendingStart, tr = TS(), copy = tr.session;
  UI.pendingStart = null;
  if (!o) { render(); return; }
  if (!startSession(o, true)) return;
  toast('Replaced ' + (copy ? copy.title : 'the old session'), { action: { label: 'Undo', fn: () => {
    const cur = tr.session;
    if (!copy || (cur && (cur.pos > 0 || cur.results.length || Object.keys(cur.picks).length))) return;
    tr.session = copy; saveProgress(); go('session');
  } }, ms: 8000 });
};
ACTIONS['review-missed'] = () => {
  const r = resultForTrack(); if (!r) return;
  startSession({ kind: 'review', mode: 'missed', title: 'Review misses', ids: r.missed.map((m) => m.id) });
};
