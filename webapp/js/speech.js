// ============================================================
//  AWS Cert Study — Hands-free spoken review (Web Speech API)
//  Does not grade: only bumps `seen` on items already in SRS.
// ============================================================

const HF = { queue: [], pos: 0, step: 0, playing: false, segs: [], token: 0, timers: [], wake: null, source: '', revealed: false };

function speechOK() { return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window; }

function hfBuildQueue() {
  const t = curTrack();
  let ids = dueItems(t), src = 'Due today';
  if (!ids.length) {
    const sid = recentSectionId(t);
    const sec = sid ? secById(t, sid) : null;
    ids = sid ? sectionItems(t, sid).filter((x) => isUnlocked(t, x)).map((x) => x.id) : [];
    src = sec ? '§' + sec.n + ' ' + sec.title : '';
  }
  if (!ids.length) {
    ids = shuffle(unlockedCards(t).concat(unlockedQuestions(t))).slice(0, 40).map((x) => x.id);
    src = 'Random mix';
  }
  HF.queue = interleave(ids.slice(0, 60), t);
  HF.pos = 0; HF.step = 0; HF.source = src; HF.revealed = false; HF.done = false;
  HF.builtOn = today(); HF.track = t;
  hfLoadSegs();
}

/** A queue built on another day or for the other track is stale (PWA left in memory overnight). */
function hfStale() { return !HF.queue.length || HF.builtOn !== today() || HF.track !== curTrack(); }

/**
 * Split into sentence-sized utterances (Chrome cuts off long ones).
 * Only split on . ! ? ; followed by whitespace, so "99.99%", "3.5" and "e.g. S3"
 * stay intact. Never on ':' ("A: option" is one utterance).
 */
function sentenceChunks(text) {
  const parts = String(text || '').replace(/\s+/g, ' ').trim().split(/(?<=[.!?;])(?<!\b(?:e\.g|i\.e|vs|etc|approx|incl|Mr|Mrs|Dr|St|No)\.)\s+/i);
  const out = [];
  parts.forEach((p) => {
    p = p.trim();
    while (p.length > 180) {
      let cut = p.lastIndexOf(', ', 180);
      if (cut > 60) cut += 1; // keep the comma with the first half
      else { cut = p.lastIndexOf(' ', 180); if (cut < 60) cut = 180; }
      out.push(p.slice(0, cut).trim()); p = p.slice(cut).trim();
    }
    if (p) out.push(p);
  });
  return out;
}

function hfLoadSegs() {
  const it = HF.queue[HF.pos] ? itemById(curTrack(), HF.queue[HF.pos]) : null;
  const pause = P.settings.speech.pauseSec;
  HF.revealed = false;
  if (!it) { HF.segs = []; return; }
  if (it.kind === 'c') {
    HF.segs = [{ text: it.item.term }, { pause, reveal: true }, { text: it.item.definition }, { pause: 1.5 }];
  } else {
    const q = it.item;
    const segs = [{ text: q.question.replace(/\(Choose TWO\.?\)/i, 'Choose two.') }];
    q.options.forEach((o, i) => segs.push({ text: LETTERS[i] + ': ' + o }));
    segs.push({ pause, reveal: true });
    const ans = isMulti(q) ? 'Answers: ' + q.answer.map((i) => LETTERS[i] + ', ' + q.options[i]).join('. And ') + '.'
      : 'Answer: ' + LETTERS[q.answer] + '. ' + q.options[q.answer] + '.';
    segs.push({ text: ans + ' ' + (q.explanation || '') });
    segs.push({ pause: 2 });
    HF.segs = segs;
  }
}

function hfVoice() {
  if (!speechOK()) return null;
  const voices = speechSynthesis.getVoices() || [];
  const want = P.settings.speech.voiceURI;
  return voices.find((v) => v.voiceURI === want) || voices.find((v) => /^en[-_]US/i.test(v.lang) && v.localService) ||
    voices.find((v) => /^en/i.test(v.lang)) || null;
}

function hfClearTimers() { HF.timers.forEach(clearTimeout); HF.timers = []; }

function hfSpeakChunks(chunks, token, done) {
  if (token !== HF.token) return;
  if (!chunks.length) { done(); return; }
  const text = chunks[0];
  const u = new SpeechSynthesisUtterance(text);
  const v = hfVoice();
  if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'en-US';
  u.rate = P.settings.speech.rate;
  let finished = false;
  const next = () => { if (finished) return; finished = true; hfSpeakChunks(chunks.slice(1), token, done); };
  u.onend = next;
  u.onerror = (e) => {
    if (finished || token !== HF.token) return;
    const err = e && e.error;
    if (err === 'interrupted' || err === 'canceled') return; // our own cancel(); token check covers it
    // Engine refused (not-allowed, audio-busy, synthesis-failed…): stop instead of racing silently through the queue.
    finished = true;
    hfPause();
    toast('Speech stopped — tap ▶ to continue');
  };
  // Watchdog: some engines drop onend. Only advance if nothing is being spoken.
  const est = Math.max(6000, (text.length * 90) / u.rate + 3000);
  const watch = () => {
    if (finished || token !== HF.token) return;
    if (speechSynthesis.speaking) HF.timers.push(setTimeout(watch, 1500)); else next();
  };
  HF.timers.push(setTimeout(watch, est));
  speechSynthesis.speak(u);
}

function hfRun() {
  if (!HF.playing) return;
  const token = HF.token;
  const seg = HF.segs[HF.step];
  if (!seg) {
    const id = HF.queue[HF.pos];
    if (id) { markSeen(curTrack(), id); saveProgress(); }
    if (HF.pos + 1 >= HF.queue.length) { hfPause(); HF.done = true; hfRender(); toast('Hands-free round complete 🎉'); return; }
    HF.pos++; HF.step = 0; hfLoadSegs(); hfRender();
    HF.timers.push(setTimeout(() => { if (token === HF.token) hfRun(); }, 400));
    return;
  }
  if (seg.reveal) { HF.revealed = true; hfRender(); }
  const advance = () => { if (token !== HF.token) return; HF.step++; hfRun(); };
  if (seg.pause != null) HF.timers.push(setTimeout(advance, seg.pause * 1000));
  else hfSpeakChunks(sentenceChunks(seg.text), token, advance);
}

async function hfWake(on) {
  try {
    if (on && 'wakeLock' in navigator && document.visibilityState === 'visible') {
      if (!HF.wake) {
        const lock = await navigator.wakeLock.request('screen');
        if (!HF.playing || HF.wake) { lock.release().catch(() => {}); return; } // paused while the request was pending
        HF.wake = lock;
        lock.addEventListener('release', () => { if (HF.wake === lock) HF.wake = null; });
      }
    } else if (!on && HF.wake) { const w = HF.wake; HF.wake = null; await w.release(); }
  } catch (e) { HF.wake = null; }
}

function hfPlay() {
  if (!speechOK()) { toast('Speech is not supported in this browser'); return; }
  if (hfStale() || HF.done) { HF.done = false; hfBuildQueue(); }
  if (!HF.queue.length) { toast('Nothing unlocked yet — finish a course section first'); return; }
  const a = $('#dock-audio');
  if (a && !a.paused) a.pause(); // never talk over a Listen pack
  HF.token++;
  speechSynthesis.cancel();
  HF.playing = true;
  HF.step = 0; HF.revealed = false; // restart current item from the top
  hfWake(true);
  hfMediaSession();
  hfRender();
  hfRun();
}

function hfPause() {
  HF.playing = false;
  HF.token++;
  hfClearTimers();
  if (speechOK()) speechSynthesis.cancel();
  hfWake(false);
  try { if ('mediaSession' in navigator && !LS.current) navigator.mediaSession.playbackState = 'paused'; } catch (e) { /* ignore */ }
  hfRender();
}

function hfJump(delta) {
  const was = HF.playing;
  HF.token++;
  hfClearTimers();
  if (speechOK()) speechSynthesis.cancel();
  if (delta > 0 && HF.queue[HF.pos]) { markSeen(curTrack(), HF.queue[HF.pos]); saveProgress(); }
  HF.pos = clamp(HF.pos + delta, 0, Math.max(0, HF.queue.length - 1));
  HF.step = 0; HF.done = false;
  hfLoadSegs();
  hfRender();
  if (was) { HF.playing = true; hfRun(); }
}

function hfStop() { if (HF.playing) hfPause(); }

function hfMediaSession() {
  if (!('mediaSession' in navigator)) return;
  try {
    navigator.mediaSession.metadata = new MediaMetadata({ title: 'Hands-free review', artist: 'AWS Cert Study · ' + T(curTrack()).meta.label });
    navigator.mediaSession.setActionHandler('play', hfPlay);
    navigator.mediaSession.setActionHandler('pause', hfPause);
    navigator.mediaSession.setActionHandler('nexttrack', () => hfJump(1));
    navigator.mediaSession.setActionHandler('previoustrack', () => hfJump(-1));
    for (const act of ['seekbackward', 'seekforward']) { try { navigator.mediaSession.setActionHandler(act, null); } catch (e2) { /* unsupported */ } }
    navigator.mediaSession.playbackState = 'playing';
  } catch (e) { /* unsupported action */ }
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && HF.playing) hfWake(true);
});
if (speechOK()) {
  try { speechSynthesis.addEventListener('voiceschanged', () => { if (typeof UI !== 'undefined' && UI.view === 'more' && UI.more === 'settings') render(); }); } catch (e) { /* old engine */ }
}

// ---------------- Rendering ----------------
function renderHandsFree() {
  if (!HF.playing && hfStale()) hfBuildQueue();
  // No Web Speech (some browsers / webviews): still show the items so it works as a read-along deck.
  const note = speechOK() ? '' : '<div class="panel"><p>This browser cannot speak text, so hands-free works as a read-along here: tap <b>Show answer</b>, then ⏭. ' +
    'For real audio try Chrome or Safari, or the <b>Listen</b> packs.</p><button type="button" class="btn" data-act="more" data-page="listen">🎵 Open Listen</button></div>';
  return '<div id="hf">' + hfInner() + '</div>' + note;
}

function hfInner() {
  const t = curTrack();
  const it = HF.queue[HF.pos] ? itemById(t, HF.queue[HF.pos]) : null;
  let body = '<p class="muted">Nothing to play yet — finish a course section first.</p>';
  if (it && it.kind === 'c') {
    body = '<div class="hf-term">' + esc(it.item.term) + '</div>' +
      (HF.revealed ? '<div class="hf-def">' + esc(it.item.definition) + '</div>' : '<div class="muted">…think of the answer…</div>');
  } else if (it) {
    const q = it.item;
    body = '<div class="hf-q">' + esc(q.question) + '</div><ol class="hf-opts">' +
      q.options.map((o, i) => {
        const ok = isMulti(q) ? q.answer.includes(i) : q.answer === i;
        return '<li class="' + (HF.revealed && ok ? 'correct' : '') + '"><b>' + LETTERS[i] + '</b> ' + esc(o) + '</li>';
      }).join('') + '</ol>' + (HF.revealed ? '<div class="hf-def small">' + esc(q.explanation || '') + '</div>' : '');
  }
  return '<div class="view-head"><h1>🎧 Hands-free</h1><p class="muted">' + esc(HF.source) + ' · ' +
    (HF.queue.length ? (HF.pos + 1) + ' / ' + HF.queue.length : '0 items') + '</p></div>' +
    '<div class="hf-body">' + body + '</div>' +
    '<div class="hf-controls">' +
    '<button type="button" class="btn big round" data-act="hf-jump" data-d="-1" aria-label="Previous">⏮</button>' +
    (speechOK()
      ? '<button type="button" class="btn huge round primary" data-act="hf-toggle" aria-label="' + (HF.playing ? 'Pause' : 'Play') + '">' + (HF.playing ? '⏸' : '▶') + '</button>'
      : '<button type="button" class="btn big primary" data-act="hf-reveal"' + (HF.revealed || !it ? ' disabled' : '') + '>Show answer</button>') +
    '<button type="button" class="btn big round" data-act="hf-jump" data-d="1" aria-label="Next">⏭</button></div>' +
    '<p class="muted small center">Speed ' + P.settings.speech.rate + '× · pause ' + P.settings.speech.pauseSec + 's · change in More → Settings. Screen stays on while playing.</p>' +
    '<div class="center"><button type="button" class="btn ghost" data-act="hf-restart">↻ New round</button></div>';
}

function hfRender() {
  const el = document.getElementById('hf');
  if (el && UI.view === 'handsfree') el.innerHTML = hfInner();
}

ACTIONS['hf-toggle'] = () => (HF.playing ? hfPause() : hfPlay());
ACTIONS['hf-jump'] = (el) => hfJump(Number(el.dataset.d));
ACTIONS['hf-restart'] = () => { const was = HF.playing; hfPause(); hfBuildQueue(); hfRender(); if (was) hfPlay(); };
ACTIONS['hf-reveal'] = () => { HF.revealed = true; hfRender(); };
ACTIONS['handsfree'] = () => { go('handsfree'); if (speechOK()) hfPlay(); };
