// ============================================================
//  AWS Cert Study — Today screen ("open app → know what to do")
// ============================================================

const BLOCK_MIN = 20;
const KIND_ICON = { v: '▶', h: '💻', a: '📄', q: '📝', p: '🏁', r: '🎭' };
const CHECKLIST = [
  ['book', 'Exam booked (Pearson VUE, online or test centre)'],
  ['guide', 'Skimmed the official exam guide'],
  ['two80', 'Two full practice exams at 80%+'],
  ['missed', 'Reviewed every missed question'],
  ['setup', 'ID ready · quiet room · webcam checked (if online)'],
];

/** Next ~20 effective minutes of lectures in the current section (never split a lecture, at least 1). */
function nextLectureBlock(t) {
  const sec = currentSection(t);
  if (!sec) return null;
  const from = lecPos(t, sec.id);
  const lectures = [];
  let eff = 0, i = from;
  while (i < sec.lectures.length) {
    const l = sec.lectures[i];
    const m = lecEffMin(sec, l);
    if (lectures.length && eff + m > BLOCK_MIN + 3 && eff >= BLOCK_MIN * 0.5) break;
    lectures.push({ i, title: l[0], sec: num(l[1]), kind: l[2], eff: m });
    eff += m;
    i++;
    if (eff >= BLOCK_MIN) break;
  }
  // Don't leave a tiny tail (< 4 min) for next time — swallow it.
  const tail = sectionEffMin(sec, i);
  if (i < sec.lectures.length && tail < 4) {
    for (; i < sec.lectures.length; i++) {
      const l = sec.lectures[i];
      lectures.push({ i, title: l[0], sec: num(l[1]), kind: l[2], eff: lecEffMin(sec, l) });
    }
    eff += tail;
  }
  return { sec, from, to: i, eff, lectures };
}

function countdownText(t) {
  const d = daysBetween(today(), examDate(t));
  const lab = T(t).meta.label;
  if (TS(t).passedAt) return 'Passed ' + lab + ' 🎉';
  if (d > 1) return d + ' days to ' + lab;
  if (d === 1) return 'Tomorrow: ' + lab + ' exam';
  if (d === 0) return lab + ' exam today 🍀';
  return lab + ' exam date passed';
}

function renderTodayHead(t) {
  const st = streakNow();
  return '<div class="today-head">' +
    '<button type="button" class="pill" data-act="toggle-track" aria-label="Switch track">' + T(t).meta.label + ' ⇄</button>' +
    '<span class="countdown">' + esc(countdownText(t)) + '</span>' +
    '<span class="streak" title="Day streak">' + (st ? '🔥 ' + st : '🔥 0') + '</span></div>';
}

function renderDayBar() {
  const done = todayStudyMin(), goal = P.settings.dailyMinutes;
  const d = todayLog();
  return '<div class="daybar"><div class="bar-label"><span>' + (done >= goal ? '✓ Goal met · ' + done + ' min' : 'Today ' + done + ' / ' + goal + ' min') + '</span><span class="muted small">' +
    (d.lectureMin ? Math.round(d.lectureMin) + ' min video · ' : '') + d.cards + ' cards · ' + d.questions + ' Qs</span></div>' +
    '<div class="bar-bg"><div class="bar-fill ' + (done >= goal ? 'good' : '') + '" style="width:' + clamp(pct(done, goal), 0, 100) + '%"></div></div></div>';
}

function renderPaceLine(t) {
  const p = paceInfo(t);
  if (p.cs.allDone) return '';
  let status;
  if (p.notStarted) status = 'Plan starts ' + fmtDay(p.start) + ' — starting early is a bonus';
  else if (p.pastTarget) status = 'Course target date passed — finish what\'s left, then exam prep';
  else if (p.behind > 10) {
    const blocks = Math.ceil(p.behind / BLOCK_MIN);
    status = '⚠️ ' + fmtMin(p.behind) + ' behind plan — ' + (blocks <= 1 ? 'one extra block catches up' : blocks + ' extra blocks catch up');
  }
  else status = 'On track ✅';
  const head = p.pastTarget ? 'Catch-up mode' : '~' + fmtMin(p.perDay) + ' of lectures/day';
  return '<div class="pace"><b>' + head + '</b> · ' + esc(status) +
    '<div class="muted small">' + fmtMin(p.cs.remainingEff) + ' left · course done by ' + fmtDay(p.target) + ' · ' + p.cs.pct + '% complete</div></div>';
}

function renderResumeCard(t) {
  const s = TS(t).session;
  if (!s) return '';
  return '<button type="button" class="card action resume" data-act="sess-resume">' +
    '<span class="card-kicker">⏯ Pick up where you left off</span>' +
    '<span class="card-title">' + esc(s.title) + ' · ' + Math.min(s.pos + 1, s.queue.length) + '/' + s.queue.length + '</span>' +
    '<span class="card-sub">Tap to resume</span></button>';
}

function renderLectureCard(t) {
  const b = nextLectureBlock(t);
  if (!b) return '';
  const course = T(t).course;
  const first = b.lectures[0].i + 1, last = b.lectures[b.lectures.length - 1].i + 1;
  const hands = b.lectures.filter((l) => l.kind === 'h').length;
  const quiz = b.lectures.filter((l) => l.kind === 'q').length;
  const prac = b.lectures.filter((l) => l.kind === 'p').length;
  const speed = paceSpeed(b.sec.pace);
  let flags = '';
  if (hands) flags += '<div class="flag">💻 ' + plural(hands, 'hands-on video') + ': watch now, try it on the laptop at the weekend</div>';
  if (quiz) flags += '<div class="flag">📝 Do the Udemy section quiz</div>';
  if (prac) flags += '<div class="flag">🏁 Udemy practice test — save it for a longer sit-down</div>';
  const unlockN = b.to >= b.sec.lectures.length && !TS(t).sectionDoneAt[b.sec.id] ? sectionItems(t, b.sec.id).length : 0;
  const blockKey = t + ':' + b.sec.id + ':' + b.from;
  const opened = UI.openedBlock === blockKey; // "Open Udemy" is the first step until it's been tapped
  let list = '<ul class="lec-list">';
  b.lectures.forEach((l) => {
    list += '<li><button type="button" class="lec-tick" data-act="lec-tick" data-sec="' + b.sec.id + '" data-i="' + l.i + '" aria-label="Mark done up to here">○</button>' +
      '<span class="lec-k">' + (KIND_ICON[l.kind] || '▶') + '</span><span class="lec-t">' + (l.i + 1) + '. ' + esc(l.title) +
      (l.kind === 'q' ? ' <i>(Udemy quiz)</i>' : '') + '</span><span class="lec-m">' + (l.sec ? fmtMin(l.eff) : '') + '</span></li>';
  });
  list += '</ul>';
  return '<div class="card action lecture">' +
    '<div class="card-kicker">🎓 Next lecture block</div>' +
    '<div class="card-title">§' + b.sec.n + ' ' + esc(b.sec.title) + '</div>' +
    '<div class="card-sub">lectures ' + first + (last !== first ? '–' + last : '') + ' of ' + b.sec.lectures.length + ' · ' +
    fmtMin(b.eff) + ' @' + speed + '×' + paceBadge(b.sec.pace) + '</div>' + flags +
    (unlockN ? '<div class="flag good">🔓 Finishing this unlocks ' + plural(unlockN, 'card/question', 'cards/questions') + '</div>' : '') +
    '<details class="lec-details"><summary>Show lectures</summary>' + list + '</details>' +
    '<div class="btn-row nowrap"><a class="btn big' + (opened ? '' : ' primary') + '" href="' + esc(course.url || '#') + '" target="_blank" rel="noopener" data-act="open-course" data-key="' + esc(blockKey) + '">Open Udemy ↗</a>' +
    '<button type="button" class="btn big' + (opened ? ' primary' : '') + '" data-act="lec-done" data-sec="' + b.sec.id + '" data-to="' + b.to + '">✓ Done</button></div>' +
    '<div class="card-note">Watch in the Udemy app at ' + speed + '× speed, then tap Done.</div></div>';
}

/** Pace badge only when it changes how to watch (skim / deep), not for the usual "normal". */
function paceBadge(pace) {
  return pace && pace !== 'normal' ? ' · <span class="badge pace-' + pace + '">' + pace + '</span>' : '';
}

function renderReviewCard(t) {
  const s = srsSummary(t);
  const n = Math.min(REVIEW_LIMIT, s.due + s.newToday);
  if (!n) {
    return '<div class="card action muted-card"><div class="card-kicker">⚡ 2-minute review</div><div class="card-title">All caught up ✅</div>' +
      '<div class="card-sub">' + (s.newAvail ? 'Daily new-item limit reached — more tomorrow' : 'Finish a lecture block to unlock more cards') + '</div></div>';
  }
  return '<button type="button" class="card action review" data-act="start-review">' +
    '<span class="card-kicker">⚡ 2-minute review</span>' +
    '<span class="card-title">' + (s.due ? s.due + ' due' : '') + (s.due && s.newToday ? ' · ' : '') + (s.newToday ? s.newToday + ' new' : '') + '</span>' +
    '<span class="card-sub">' + (n < s.due + s.newToday ? n + ' of ' + (s.due + s.newToday) + ' this round' : plural(n, 'item')) + ' · cards + questions mixed</span></button>';
}

function renderHandsFreeCard() {
  return '<button type="button" class="card action hf" data-act="handsfree">' +
    '<span class="card-kicker">🎧 Hands-free</span><span class="card-title">Listen & think along</span>' +
    '<span class="card-sub">For walking, rocking, driving — screen stays on</span></button>';
}

function renderFiveCard(t) {
  const pool = unlockedQuestions(t);
  if (!pool.length) return '';
  const weak = weakestDomain(t, pool);
  return '<button type="button" class="card action five" data-act="start-five">' +
    '<span class="card-kicker">📝 5 quick questions</span><span class="card-title">Focus: ' + esc(domainName(t, weak)) + '</span>' +
    '<span class="card-sub">Your weakest domain right now</span></button>';
}

function renderNextTrackCard(t) {
  const tr = TS(t);
  const after = today() > examDate(t);
  if (t === 'clf' && (tr.passedAt || after)) {
    return '<div class="card action next-track"><div class="card-kicker">🚀 Next up: SAA-C03</div>' +
      '<div class="card-title">' + (tr.passedAt ? 'Congrats on passing CLF! 🎉' : 'CLF exam date has passed') + '</div>' +
      '<div class="card-sub">Remember your <b>50% voucher</b>: AWS Certification account → Benefits. Use it when booking SAA.</div>' +
      '<div class="btn-row"><button type="button" class="btn big primary" data-act="set-track" data-t="saa">Switch to SAA →</button></div>' +
      (!tr.passedAt ? '<div class="btn-row"><button type="button" class="btn" data-act="passed">I passed 🎉</button></div>' + passedConfirm() : '') + '</div>';
  }
  if (t === 'saa' && tr.passedAt) {
    return '<div class="card action next-track"><div class="card-kicker">🏆 Solutions Architect</div><div class="card-title">You did it. Both certs!</div>' +
      '<div class="card-sub">Keep the hands-free review for interviews, or take a well-earned break.</div></div>';
  }
  return '';
}

function passedConfirm() {
  if (!UI.confirmPassed) return '';
  return '<div class="panel inline-panel"><p>Mark ' + T(curTrack()).meta.label + ' as passed today?</p>' +
    '<button type="button" class="btn primary" data-act="passed-yes">Yes 🎉</button> <button type="button" class="btn ghost" data-act="passed-no">Not yet</button></div>';
}

function renderExamPrep(t, middle) {
  const d = T(t), r = readiness(t), tr = TS(t);
  const good = fullExamsAtLeast(t, 80);
  // 1. compact readiness summary (domain bars folded away)
  let h = '<div class="card ready-card"><div class="card-kicker">🎯 Exam-prep mode · readiness</div>' +
    '<div class="ready-row"><span class="ready-num">' + (r.overall == null ? '—' : r.overall + '%') + '</span><span class="muted">' +
    (r.overall == null ? 'Answer some questions to see your readiness'
      : r.provisional ? 'provisional — answer at least ' + READY_MIN_N + ' questions in every domain' : 'last ' + Math.min(r.answers, 200) + ' answers, weighted by domain') +
    '</span></div><details class="ready-details"><summary>By domain</summary>';
  r.per.forEach((x) => {
    h += x.pct == null ? '<div class="bar-row"><div class="bar-label"><span>' + esc(x.name) + ' (' + x.w + '%)</span><span class="muted">no answers yet</span></div><div class="bar-bg"></div></div>'
      : barRow(x.name + ' (' + x.w + '%)', x.pct, x.pct + '% · ' + x.n);
  });
  h += '</details></div>';
  // 2. the key action this week
  h += '<button type="button" class="card action exam" data-act="start-exam"><span class="card-kicker">🏁 Next: full timed exam · ' + Math.min(good, 2) + ' of 2 at 80%+</span>' +
    '<span class="card-title">' + Math.min(d.meta.examQ, d.questions.length) + ' questions · ' + d.meta.examMin + ' min</span>' +
    '<span class="card-sub">' + (good >= 2 ? 'Two exams at 80%+ — book the real one! ✅' : 'Book the real exam after two full exams at 80%+') +
    ' · pass mark ' + d.meta.pass + '% · timer pauses if you leave the app</span></button>';
  const weakFirst = r.per.slice().sort((a, b) => (a.pct == null ? -1 : a.pct) - (b.pct == null ? -1 : b.pct));
  h += '<h2>Weak-domain drills</h2><div class="stack">';
  weakFirst.forEach((x) => {
    h += '<button type="button" class="btn big left" data-act="start-domain" data-d="' + x.id + '">🎯 ' + esc(x.name) +
      ' <span class="muted">' + (x.pct == null ? '' : x.pct + '%') + '</span></button>';
  });
  h += '</div>' + (middle || '') + '<h2>Exam checklist</h2><div class="stack">';
  CHECKLIST.forEach(([k, label]) => {
    const on = !!tr.checklist[k];
    h += '<button type="button" class="check' + (on ? ' on' : '') + '" data-act="check" data-k="' + k + '"><span>' + (on ? '☑' : '☐') + '</span> ' + esc(label) + '</button>';
  });
  h += '</div>';
  // The CLF next-track card already offers "I passed" once the exam date is behind us.
  const shownAbove = t === 'clf' && today() > examDate(t);
  if (!tr.passedAt && !shownAbove) h += '<div class="stack"><button type="button" class="btn big" data-act="passed">I passed 🎉</button>' + passedConfirm() + '</div>';
  return h;
}

function renderToday() {
  const t = curTrack();
  const cs = courseStats(t);
  let h = renderTodayHead(t) + renderDayBar() + renderResumeCard(t) + renderNextTrackCard(t);
  if (!T(t).sections.length) {
    h += '<div class="panel">Course data for ' + T(t).meta.label + ' is missing. Reload the app when online.</div>';
  } else if (cs.allDone) {
    h += renderExamPrep(t, renderReviewCard(t) + renderHandsFreeCard());
  } else {
    h += renderPaceLine(t) + renderLectureCard(t) + renderReviewCard(t) + renderHandsFreeCard() + renderFiveCard(t);
  }
  return h;
}

// ---------------- Actions ----------------
function unlockMsg(res) {
  return 'Section done 🎉' + (res.unlocked ? ' ' + plural(res.unlocked, 'new card/question', 'new cards/questions') + ' unlocked' : '');
}

function afterLectureChange(res, undo) {
  if (res.done) {
    toast(unlockMsg(res), { action: { label: 'Undo', fn: undo } });
  } else {
    toast('Nice — logged ✓', { action: { label: 'Undo', fn: undo } });
  }
  render();
}

ACTIONS['lec-done'] = (el) => {
  const t = curTrack(), sid = el.dataset.sec, before = lecPos(t, sid);
  const res = setLecturePos(t, sid, Number(el.dataset.to));
  UI.openedBlock = null;
  afterLectureChange(res, () => { undoLecture(t, sid, before, res); render(); });
};
ACTIONS['lec-tick'] = (el) => {
  const t = curTrack(), sid = el.dataset.sec, i = Number(el.dataset.i), before = lecPos(t, sid);
  // Catch-up ticks in sections other than the current one don't count as today's study time.
  const cur = currentSection(t);
  const res = setLecturePos(t, sid, i < before ? i : i + 1, null, { noLog: !cur || cur.id !== sid });
  if (UI.view === 'today') afterLectureChange(res, () => { undoLecture(t, sid, before, res); render(); });
  else { if (res.done) toast(unlockMsg(res)); render(); }
};
ACTIONS['start-review'] = () => startSession({ kind: 'review', mode: 'review', title: '2-minute review', ids: buildReviewIds(curTrack(), REVIEW_LIMIT) });
ACTIONS['start-five'] = () => startSession({ kind: 'quiz', mode: 'five', title: '5 quick questions', ids: buildQuizIds(curTrack(), 'five') });
ACTIONS['start-exam'] = () => {
  const t = curTrack();
  startSession({ kind: 'quiz', mode: 'exam', title: T(t).meta.label + ' full exam', exam: true,
    timeLimitSec: T(t).meta.examMin * 60, ids: buildQuizIds(t, 'exam') });
};
ACTIONS['start-domain'] = (el) => {
  const t = curTrack();
  startSession({ kind: 'quiz', mode: 'domain', title: domainName(t, el.dataset.d), ids: buildQuizIds(t, 'domain', el.dataset.d),
    emptyMsg: 'No unlocked questions in this domain yet' });
};
ACTIONS['open-course'] = (el) => { UI.openedBlock = el.dataset.key; setTimeout(render, 300); };
ACTIONS['check'] = (el) => { const c = TS().checklist; c[el.dataset.k] = !c[el.dataset.k]; saveProgress(); render(); };
ACTIONS['passed'] = () => { UI.confirmPassed = true; render(); };
ACTIONS['passed-no'] = () => { UI.confirmPassed = false; render(); };
ACTIONS['passed-yes'] = () => {
  UI.confirmPassed = false; TS().passedAt = today(); saveProgress(); render();
  toast('Congratulations! 🎉');
};

function setTrack(t) {
  if (!TRACK_IDS.includes(t) || t === curTrack()) return;
  const prev = curTrack();
  hfStop(); HF.queue = [];
  P.settings.track = t;
  if (t === 'saa' && !TS('saa').startedAt && (TS('clf').passedAt || today() > examDate('clf'))) TS('saa').startedAt = today();
  saveProgress();
  UI.result = null; UI.pendingStart = null; // results/pending starts belong to the old track
  if (UI.view === 'session' || UI.view === 'result') UI.view = 'today';
  render();
  toast('Now studying ' + T(t).meta.label, { action: { label: 'Undo', fn: () => setTrack(prev) } });
}
ACTIONS['set-track'] = (el) => setTrack(el.dataset.t);
ACTIONS['toggle-track'] = () => setTrack(curTrack() === 'clf' ? 'saa' : 'clf');
