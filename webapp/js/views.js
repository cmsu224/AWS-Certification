// ============================================================
//  AWS Cert Study — Views: Course, Review, Quiz, More
//  (More = menu, Listen [listen.js], Progress, Settings, Help)
// ============================================================

const CAT_ICON = { compute: '🖥️', storage: '💾', database: '🗄️', network: '🌐', security: '🔒', billing: '💰',
  integration: '🔗', management: '🛠️', analytics: '📊' };

function viewHead(title, sub, back) {
  return '<div class="view-head">' + (back ? '<button type="button" class="icon-btn" data-act="more" data-page="menu" aria-label="Back">←</button>' : '') +
    '<h1>' + title + '</h1>' + (sub ? '<p class="muted">' + sub + '</p>' : '') + '</div>';
}

// ============================================================
//  Course
// ============================================================
function renderCourse() {
  const t = curTrack(), d = T(t), cs = courseStats(t);
  let h = viewHead('🎓 ' + esc(d.course.title || 'Course'), esc(d.course.author || '') + ' · ' + cs.pct + '% · ' +
    cs.lecDone + '/' + cs.lecTotal + ' lectures · ' + fmtMin(cs.remainingEff) + ' left at your pace');
  h += '<div class="bar-bg"><div class="bar-fill" style="width:' + cs.pct + '%"></div></div>';
  h += '<p class="muted small">Tick lectures as you watch. Finishing a section unlocks its cards and questions. Lecture times are at your playback speed: skim 2× · normal 1.5× · deep 1.25×.</p>';
  if (!d.sections.length) return h + '<div class="panel">No course data.</div>';
  const cur = currentSection(t);
  d.sections.forEach((s) => {
    const p = lecPos(t, s.id), n = s.lectures.length, done = p >= n;
    const open = UI.openSec[s.id] != null ? UI.openSec[s.id] : (cur && cur.id === s.id);
    const items = sectionItems(t, s.id).length;
    const unl = sectionUnlocked(t, s.id);
    h += '<details class="sec' + (done ? ' done' : '') + '" data-sec="' + s.id + '"' + (open ? ' open' : '') + '>' +
      '<summary><span class="sec-state">' + (done ? '✅' : p ? '◐' : '○') + '</span><span class="sec-name">§' + s.n + ' ' + esc(s.title) +
      '<small>' + p + '/' + n + ' · ' + fmtMin(sectionEffMin(s, 0)) + ' @' + paceSpeed(s.pace) + '×' + paceBadge(s.pace) +
      (items ? ' · ' + (unl ? '🔓 ' : '🔒 ') + plural(items, 'item') : '') + '</small></span></summary>';
    if (open) {
      h += '<ul class="lec-list">';
      s.lectures.forEach((l, i) => {
        const ticked = i < p;
        h += '<li class="' + (ticked ? 'ticked' : '') + '"><button type="button" class="lec-tick" data-act="lec-tick" data-sec="' + s.id + '" data-i="' + i + '" aria-label="' +
          (ticked ? 'Untick' : 'Tick') + ' lecture ' + (i + 1) + '">' + (ticked ? '✓' : '○') + '</button>' +
          '<span class="lec-k">' + (KIND_ICON[l[2]] || '▶') + '</span><span class="lec-t">' + (i + 1) + '. ' + esc(l[0]) + '</span>' +
          '<span class="lec-m"' + (l[1] ? ' title="' + fmtClock(l[1]) + ' at 1×"' : '') + '>' + (l[1] ? fmtMin(lecEffMin(s, l)) : '') + '</span></li>';
      });
      h += '</ul><div class="btn-row">' + (done
        ? '<button type="button" class="btn small ghost" data-act="sec-set" data-sec="' + s.id + '" data-pos="0">Reset section</button>'
        : '<button type="button" class="btn small" data-act="sec-set" data-sec="' + s.id + '" data-pos="' + n + '">✓ Mark whole section done</button>') + '</div>';
    }
    h += '</details>';
  });
  return h;
}

ACTIONS['sec-set'] = (el) => {
  const t = curTrack(), sid = el.dataset.sec, before = lecPos(t, sid);
  // "Mark whole section done" is catch-up bookkeeping, not today's study time.
  const res = setLecturePos(t, sid, Number(el.dataset.pos), null, { noLog: true });
  toast(res.done ? unlockMsg(res) : 'Section updated',
    { action: { label: 'Undo', fn: () => { undoLecture(t, sid, before, res); render(); } } });
  render();
};

// ============================================================
//  Review (flashcards, SRS-driven)
// ============================================================
function renderReview() {
  const t = curTrack(), d = T(t), s = srsSummary(t);
  const unl = unlockedCards(t);
  let h = viewHead('🃏 Review', T(t).meta.label + ' · ' + unl.length + ' of ' + d.cards.length + ' cards unlocked');
  h += '<div class="stats-grid">' + stat(s.due, 'due now') + stat(s.newToday, 'new today') + stat(s.mastered, 'mastered') + stat(streakNow(), 'day streak') + '</div>';
  h += '<div class="stack">';
  const n = Math.min(REVIEW_LIMIT, s.due + s.newToday);
  h += '<button type="button" class="btn big primary" data-act="start-review"' + (n ? '' : ' disabled') + '>⚡ Review due + new (' + n + ')</button>';
  const dueCards = buildReviewIds(t, 25, (x) => x.kind === 'c').length;
  h += '<button type="button" class="btn big" data-act="start-cards" data-cat="due"' + (dueCards ? '' : ' disabled') + '>🃏 Cards only (' + dueCards + ')</button>';
  h += '</div><h2>By category</h2><div class="cat-grid">';
  d.categories.forEach((c) => {
    const all = d.cards.filter((x) => x.category === c).length;
    const u = unl.filter((x) => x.category === c).length;
    h += '<button type="button" class="cat-btn" data-act="start-cards" data-cat="' + esc(c) + '"' + (u ? '' : ' disabled') + '>' +
      '<span class="cat-icon">' + (CAT_ICON[c] || '📘') + '</span><span class="cat-name">' + esc(c) + '</span><span class="cat-count">' + u + '/' + all + '</span></button>';
  });
  h += '</div><div class="stack"><button type="button" class="btn" data-act="start-cards" data-cat="all"' + (unl.length ? '' : ' disabled') + '>🔀 Shuffle all unlocked cards</button></div>';
  h += '<h2>Memory boxes</h2>' + boxChart(s.boxes);
  h += '<p class="muted small">Box 0 = review today · 1 = tomorrow · 2 = 3 days · 3 = a week · 4 = 16 days · 5 = 35 days. Wrong answers go back to box 0.</p>';
  return h;
}

function stat(n, label) { return '<div class="stat-card"><div class="stat-number">' + n + '</div><div class="stat-label">' + label + '</div></div>'; }

function boxChart(boxes) {
  const max = Math.max(1, ...boxes);
  return '<div class="boxes">' + boxes.map((b, i) => '<div class="box-col"><div class="box-bar" style="height:' +
    Math.max(4, Math.round((b / max) * 80)) + 'px"></div><div class="small">' + b + '</div><div class="muted small">B' + i + '</div></div>').join('') + '</div>';
}

ACTIONS['start-cards'] = (el) => {
  const t = curTrack(), cat = el.dataset.cat;
  startSession({ kind: 'review', mode: 'cards', title: cat === 'due' ? 'Cards' : cat === 'all' ? 'All cards' : 'Cards · ' + cat,
    ids: buildCardIds(t, cat), emptyMsg: 'No cards here yet — finish a course section' });
};

// ============================================================
//  Quiz
// ============================================================
function renderQuiz() {
  const t = curTrack(), d = T(t);
  const pool = unlockedQuestions(t);
  const missed = buildQuizIds(t, 'missed').length;
  let h = viewHead('📝 Quiz', T(t).meta.label + ' · ' + pool.length + ' of ' + d.questions.length + ' questions unlocked');
  h += '<div class="stack">' +
    qBtn('start-five', '🎯 5 quick questions', 'weighted to your weakest domain', !pool.length) +
    qBtn('start-quiz', '⚡ Quick 20', 'random unlocked questions', !pool.length, 'quick') +
    qBtn('start-quiz', '🔁 Missed & due', missed + ' questions to fix', !missed, 'missed') +
    qBtn('start-exam', '🏁 Full timed exam', Math.min(d.meta.examQ, d.questions.length) + ' Q · ' + d.meta.examMin + ' min · pass ' + d.meta.pass + '% · whole bank', !d.questions.length) +
    '</div>';
  if (pool.length < d.questions.length) h += '<p class="muted small">🔒 ' + (d.questions.length - pool.length) + ' questions unlock as you finish course sections. The full exam uses the whole bank.</p>';
  h += '<h2>By domain</h2><div class="stack">';
  d.domains.forEach((dom) => {
    const u = pool.filter((q) => q.domain === dom.id).length;
    const st = TS(t).domainStats[dom.id];
    h += '<button type="button" class="btn big left" data-act="start-domain" data-d="' + dom.id + '"' + (u ? '' : ' disabled') + '>' +
      esc(dom.name) + ' <small class="muted">' + u + ' Q unlocked · exam weight ' + esc(dom.weight) + (st && st.total ? ' · your score ' + pct(st.correct, st.total) + '%' : '') + '</small></button>';
  });
  h += '</div>';
  const hist = TS(t).quizHistory.slice(-5).reverse();
  if (hist.length) {
    h += '<h2>Recent</h2><div class="list">';
    hist.forEach((x) => { h += '<div class="list-row"><span class="row-text"><b>' + x.score + '%</b> · ' + esc(x.mode) + ' · ' + x.correct + '/' + x.total + '<small>' + fmtDay(x.date) + '</small></span></div>'; });
    h += '</div>';
  }
  return h;
}

function qBtn(act, title, sub, disabled, mode) {
  return '<button type="button" class="btn big left" data-act="' + act + '"' + (mode ? ' data-mode="' + mode + '"' : '') + (disabled ? ' disabled' : '') +
    '><span>' + title + '</span><small class="muted">' + esc(sub) + '</small></button>';
}

ACTIONS['start-quiz'] = (el) => {
  const t = curTrack(), m = el.dataset.mode;
  startSession({ kind: 'quiz', mode: m, title: m === 'quick' ? 'Quick 20' : 'Missed & due', ids: buildQuizIds(t, m) });
};

// ============================================================
//  More
// ============================================================
function renderMore() {
  switch (UI.more) {
    case 'listen': return renderListen();
    case 'progress': return renderProgress();
    case 'settings': return renderSettings();
    case 'help': return renderHelp();
    default: return renderMoreMenu();
  }
}

function renderMoreMenu() {
  const row = (page, icon, title, sub, act) => '<button type="button" class="list-row row-main" data-act="' + (act || 'more') + '" data-page="' + page + '">' +
    '<span class="row-icon">' + icon + '</span><span class="row-text"><b>' + title + '</b><small>' + sub + '</small></span><span class="row-side">›</span></button>';
  return viewHead('☰ More') + '<div class="list">' +
    row('listen', '🎵', 'Listen', 'Audio review packs · save offline') +
    row('', '🎧', 'Hands-free', 'Your phone reads cards & questions aloud', 'handsfree') +
    row('progress', '📈', 'Progress', 'History, coverage, readiness') +
    row('settings', '⚙️', 'Settings', 'Track, exam dates, pace, voice, backup') +
    row('help', '💡', 'How to study with a kid', 'Tips + how this app works') + '</div>';
}

function renderProgress() {
  const t = curTrack(), d = T(t), r = readiness(t), s = srsSummary(t), cs = courseStats(t);
  let h = viewHead('📈 Progress', T(t).meta.label, true);
  h += '<div class="stats-grid">' + stat(cs.pct + '%', 'course') + stat(r.overall == null ? '—' : r.overall + '%', r.provisional && r.overall != null ? 'readiness (provisional)' : 'readiness') +
    stat(Object.keys(TS(t).srs).length, 'items studied') + stat(streakNow(), 'day streak') + '</div>';
  // last 14 days
  h += '<h2>Last 14 days</h2><div class="days">';
  const t0 = today();
  const days = [];
  for (let i = 13; i >= 0; i--) days.push(addDays(t0, -i));
  const mins = days.map((k) => { const x = P.dayLog[k]; return x ? Math.round(x.lectureMin + x.cards * 0.25 + x.questions) : 0; });
  const max = Math.max(P.settings.dailyMinutes, ...mins);
  days.forEach((k, i) => {
    h += '<div class="day-col" title="' + k + ': ' + mins[i] + ' min"><div class="day-bar' + (mins[i] >= P.settings.dailyMinutes ? ' good' : '') +
      '" style="height:' + Math.max(2, Math.round((mins[i] / max) * 70)) + 'px"></div><div class="muted small">' + parseYmd(k).toLocaleDateString(undefined, { weekday: 'narrow' }) + '</div></div>';
  });
  h += '</div>';
  h += '<h2>Readiness by domain</h2>';
  if (r.provisional) h += '<p class="muted small">Readiness is provisional until you have answered at least ' + READY_MIN_N + ' questions in every domain. Domains with no answers count as 0%.</p>';
  r.per.forEach((x) => {
    h += x.pct == null ? '<div class="bar-row"><div class="bar-label"><span>' + esc(x.name) + '</span><span class="muted">no answers yet</span></div><div class="bar-bg"></div></div>'
      : barRow(x.name, x.pct, x.pct + '% of last ' + x.n);
  });
  h += '<h2>Question coverage</h2>';
  r.per.forEach((x) => { h += barRow(x.name, x.coverage, x.coverage + '% of ' + x.qTotal); });
  h += '<h2>Memory boxes</h2>' + boxChart(s.boxes);
  const hist = TS(t).quizHistory.slice().reverse();
  h += '<h2>Quiz history</h2>';
  if (!hist.length) h += '<p class="muted">No quizzes yet.</p>';
  else {
    h += '<div class="list">';
    hist.slice(0, 30).forEach((x) => { h += '<div class="list-row"><span class="row-text"><b>' + x.score + '%</b> · ' + esc(x.mode) + ' · ' + x.correct + '/' + x.total + '<small>' + fmtDay(x.date) + '</small></span></div>'; });
    h += '</div>';
  }
  return h;
}

// ---------------- Settings ----------------
function field(label, path, type, value, extra) {
  return '<label class="field"><span>' + label + '</span><input type="' + type + '" data-set="' + path + '" value="' + esc(value == null ? '' : value) + '"' + (extra || '') + '></label>';
}

function renderSettings() {
  const s = P.settings;
  let h = viewHead('⚙️ Settings', '', true);
  h += '<div class="panel"><h3>Track</h3><div class="seg">' + TRACK_IDS.map((t) =>
    '<button type="button" class="seg-btn' + (s.track === t ? ' on' : '') + '" data-act="set-track" data-t="' + t + '">' + T(t).meta.label + ' · ' + T(t).meta.code + '</button>').join('') + '</div></div>';
  h += '<div class="panel"><h3>Plan</h3>' +
    field('Start date', 'startDate', 'date', s.startDate) +
    field('CLF exam date', 'examDates.clf', 'date', s.examDates.clf) +
    field('SAA exam date', 'examDates.saa', 'date', s.examDates.saa) +
    field('Finish CLF course N days before exam', 'reviewDays.clf', 'number', s.reviewDays.clf, ' min="0" max="120" inputmode="numeric"') +
    field('Finish SAA course N days before exam', 'reviewDays.saa', 'number', s.reviewDays.saa, ' min="0" max="120" inputmode="numeric"') +
    field('Daily study minutes', 'dailyMinutes', 'number', s.dailyMinutes, ' min="5" max="600" inputmode="numeric"') +
    field('New cards/questions per day', 'newPerDay', 'number', s.newPerDay, ' min="0" max="500" inputmode="numeric"') + '</div>';
  const voices = speechOK() ? (speechSynthesis.getVoices() || []).filter((v) => /^en/i.test(v.lang)) : [];
  h += '<div class="panel"><h3>Hands-free voice</h3>' +
    field('Speed (0.5–2)', 'speech.rate', 'number', s.speech.rate, ' min="0.5" max="2" step="0.1" inputmode="decimal"') +
    field('Think-pause before the answer (seconds)', 'speech.pauseSec', 'number', s.speech.pauseSec, ' min="0" max="30" inputmode="numeric"') +
    '<label class="field"><span>Voice</span><select data-set="speech.voiceURI"><option value="">Default English voice</option>' +
    voices.map((v) => '<option value="' + esc(v.voiceURI) + '"' + (v.voiceURI === s.speech.voiceURI ? ' selected' : '') + '>' + esc(v.name + ' (' + v.lang + ')') + '</option>').join('') +
    '</select></label>' + (speechOK() ? '<button type="button" class="btn" data-act="speech-test">🔊 Test voice</button>' : '<p class="muted small">Speech not supported in this browser.</p>') + '</div>';
  h += '<div class="panel"><h3>Backup</h3><p class="muted small">Progress lives only on this device. Export now and then, or to move to another device.</p>' +
    '<div class="btn-row"><button type="button" class="btn" data-act="export">⬇ Export file</button><button type="button" class="btn" data-act="export-copy">📋 Copy</button></div>' +
    '<label class="btn file-btn">⬆ Import file<input type="file" accept="application/json,.json" data-import-file hidden></label>' +
    '<textarea id="import-text" rows="3" placeholder="…or paste exported JSON here"></textarea>' +
    '<button type="button" class="btn" data-act="import-paste">Import pasted text</button>';
  if (UI.pendingImport) {
    h += '<div class="panel inline-panel"><p>Replace this device\'s progress with the imported backup (' +
      Object.keys(UI.pendingImport.tracks.clf.srs).length + ' CLF + ' + Object.keys(UI.pendingImport.tracks.saa.srs).length + ' SAA items)?</p>' +
      '<button type="button" class="btn primary" data-act="import-yes">Replace</button> <button type="button" class="btn ghost" data-act="import-no">Cancel</button></div>';
  }
  h += '</div><div class="panel danger-zone"><h3>Reset</h3>' + (UI.confirmReset
    ? '<p>This erases ALL progress on this device. Export first if unsure.</p><button type="button" class="btn danger" data-act="reset-yes">Yes, erase everything</button> <button type="button" class="btn ghost" data-act="reset-no">Cancel</button>'
    : '<button type="button" class="btn danger" data-act="reset">Reset all progress…</button>') + '</div>';
  const fake = storeGet(FAKE_TODAY_KEY);
  if (fake) h += '<div class="panel"><p>🧪 Test date override active: <b>' + esc(fake) + '</b></p><button type="button" class="btn" data-act="clear-fake">Use the real date</button></div>';
  h += '<p class="muted small center">AWS Cert Study · data: ' + T('clf').questions.length + ' CLF Q · ' + T('clf').cards.length + ' CLF cards · ' +
    T('saa').questions.length + ' SAA Q · ' + T('saa').cards.length + ' SAA cards</p>';
  return h;
}

function setSettingPath(path, raw) {
  const s = JSON.parse(JSON.stringify(P.settings));
  const keys = path.split('.');
  let o = s;
  for (let i = 0; i < keys.length - 1; i++) o = o[keys[i]];
  const k = keys[keys.length - 1];
  const cur = o[k];
  const want = typeof cur === 'number' ? (String(raw).trim() === '' ? NaN : Number(raw)) : (raw === '' && path === 'speech.voiceURI' ? null : raw);
  o[k] = want;
  const next = normSettings(s);
  let got = next;
  keys.forEach((key) => { got = got == null ? undefined : got[key]; });
  if (got !== want) {
    // Rejected (out of range / cleared date): keep the user's previous value, not the factory default.
    toast('That value isn\'t allowed — kept the old one');
  } else if (JSON.stringify(next) !== JSON.stringify(P.settings)) {
    P.settings = next;
    saveProgress();
    toast('Saved ✓');
  }
  render();
}

function exportJSON() { return JSON.stringify(P, null, 1); }

function beginImport(text) {
  let raw;
  try { raw = JSON.parse(text); } catch (e) { toast('That isn\'t valid JSON'); return; }
  if (!isV2Shape(raw) && !isV1Shape(raw)) { toast('That doesn\'t look like an AWS Study backup'); return; }
  UI.pendingImport = normalizeProgress(raw);
  render();
}

ACTIONS['more'] = (el) => {
  UI.more = el.dataset.page || 'menu'; UI.confirmReset = false; UI.pendingImport = null;
  if (UI.view !== 'more') go('more'); else { render(); pushHist(false); focusView(); }
  window.scrollTo(0, 0);
};
ACTIONS['speech-test'] = () => {
  if (!speechOK()) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance('This is how hands-free review will sound. Amazon S3 stores objects in buckets.');
  const v = hfVoice(); if (v) { u.voice = v; u.lang = v.lang; }
  u.rate = P.settings.speech.rate;
  speechSynthesis.speak(u);
};
ACTIONS['export'] = () => {
  try {
    const blob = new Blob([exportJSON()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'aws-study-progress-' + today() + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    toast('Exported ✓');
  } catch (e) { toast('Export failed — try Copy instead'); }
};
ACTIONS['export-copy'] = () => {
  const text = exportJSON();
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => toast('Copied ✓ — paste it into a note or email'), () => toast('Copy blocked — use Export file'));
  } else { const ta = $('#import-text'); if (ta) { ta.value = text; ta.select(); toast('Selected — copy it manually'); } }
};
ACTIONS['import-paste'] = () => { const ta = $('#import-text'); if (ta && ta.value.trim()) beginImport(ta.value); else toast('Paste a backup first'); };
ACTIONS['import-yes'] = () => { P = UI.pendingImport; UI.pendingImport = null; saveProgress(); HF.queue = []; render(); toast('Backup restored ✓'); };
ACTIONS['import-no'] = () => { UI.pendingImport = null; render(); };
ACTIONS['reset'] = () => { UI.confirmReset = true; render(); };
ACTIONS['reset-no'] = () => { UI.confirmReset = false; render(); };
ACTIONS['reset-yes'] = () => {
  const backup = exportJSON();
  P = defaultProgress(); saveProgress(); UI.confirmReset = false; HF.queue = []; render();
  toast('Progress erased', { action: { label: 'Undo', fn: () => { P = normalizeProgress(JSON.parse(backup)); saveProgress(); render(); } }, ms: 10000 });
};
ACTIONS['clear-fake'] = () => { storeRemove(FAKE_TODAY_KEY); render(); toast('Using the real date'); };


// ---------------- Help ----------------
function renderHelp() {
  const tips = [
    ['🌅', 'Open the app, do the top card.', 'Today always shows the next thing. Lecture blocks are ~20 minutes at your playback speed, so one nap = one block.'],
    ['⚡', '2-minute pockets → Review.', 'Waiting for the kettle or a bottle to warm? Tap the 2-minute review. It remembers exactly where you stopped.'],
    ['🎧', 'Hands busy → Hands-free.', 'Rocking, walking, driving: your phone reads a card, pauses so you can answer in your head, then says the answer.'],
    ['📱', 'Watch lectures at speed.', 'Use the Udemy app at the suggested speed. Hands-on labs (💻): watch now, try them on the laptop at the weekend.'],
    ['🔓', 'Finishing a section unlocks its cards and questions.', 'You only review what you\'ve actually watched, so nothing feels random.'],
    ['😴', 'Missed a day? Nothing breaks.', 'Due items wait for you. The pace line tells you honestly if you\'re behind; one extra block fixes most of it.'],
    ['🎯', 'Last week = exam prep.', 'When the course is done, Today switches to readiness, full timed exams and weak-domain drills. Book when you hit 80% twice.'],
    ['💾', 'Back up now and then.', 'Settings → Export. Progress only lives on this device.'],
  ];
  return viewHead('💡 How to study with a kid', 'CLF-C02 first, then SAA-C03 with the 50% voucher', true) +
    '<div class="list">' + tips.map((x) => '<div class="list-row"><span class="row-icon">' + x[0] + '</span><span class="row-text"><b>' + esc(x[1]) + '</b><small>' + esc(x[2]) + '</small></span></div>').join('') + '</div>' +
    '<p class="muted small">Add to Home Screen for the full-screen app. Works offline once opened. Not affiliated with AWS or Udemy.</p>';
}
