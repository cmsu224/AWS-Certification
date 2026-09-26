// ============================================================
//  AWS Cert Study — App shell: state, router, event wiring, PWA
// ============================================================

const UI_KEY = 'aws-study-ui';
const UI = {
  view: 'today', more: 'menu', result: null, openSec: {}, lastDay: null,
  sessMenu: false, pendingStart: null, openedBlock: null, confirmFinish: false, confirmPassed: false, confirmReset: false, pendingImport: null,
};
const VIEWS = ['today', 'course', 'review', 'quiz', 'more', 'session', 'result', 'handsfree'];

function navFor(view) {
  if (view === 'session') { const s = curSess(); return s && s.kind === 'quiz' ? 'quiz' : 'review'; }
  if (view === 'result') return 'today';
  if (view === 'handsfree') return 'more';
  return view;
}

const FOCUS_KEYS = ['act', 'i', 'sec', 'view', 'page', 'd', 'ok', 'pos', 'set'];
function focusKey(el) {
  if (!el || !el.dataset || !el.closest || !el.closest('#main')) return null;
  const parts = FOCUS_KEYS.filter((k) => el.dataset[k] != null)
    .map((k) => '[data-' + k + '="' + String(el.dataset[k]).replace(/["\\]/g, '\\$&') + '"]');
  return parts.length ? parts.join('') : null;
}

function render() {
  const main = $('#main');
  if (!main) return;
  const keep = focusKey(document.activeElement);
  UI.lastDay = today();
  let html = '';
  try {
    switch (UI.view) {
      case 'course': html = renderCourse(); break;
      case 'review': html = renderReview(); break;
      case 'quiz': html = renderQuiz(); break;
      case 'more': html = renderMore(); break;
      case 'session': html = renderSession(); break;
      case 'result': html = renderResult(); break;
      case 'handsfree': html = renderHandsFree(); break;
      default: html = renderToday();
    }
  } catch (e) {
    console.error(e);
    html = '<div class="panel"><p>Something went wrong drawing this screen.</p><p class="muted small">' + esc(e && e.message) +
      '</p><button class="btn primary" data-act="nav" data-view="today">Go to Today</button></div>';
  }
  if (UI.pendingStart && UI.view !== 'session') html = pendingStartPanel() + html;
  if (SW.waiting && !SW.dismissed && UI.view === 'today') html = updateCard() + html;
  main.innerHTML = html;
  main.className = 'view-' + UI.view;
  // Sticky bottom controls on screen → toasts move to the top so Undo never sits where Next is.
  document.body.classList.toggle('has-thumbbar', !!main.querySelector('.thumb-bar, .hf-controls'));
  const nav = navFor(UI.view);
  $$('#bottom-nav .nav-btn').forEach((b) => b.classList.toggle('active', b.dataset.view === nav));
  storeSetJSON(UI_KEY, { view: UI.view, more: UI.more });
  if (keep) {
    let el = null;
    try { el = main.querySelector(keep); } catch (e) { el = null; }
    if (el && !el.disabled) el.focus({ preventScroll: true });
  }
}

/** After a view change: move focus to the new view's heading (screen readers / keyboards). */
function focusView() {
  const main = $('#main');
  if (!main) return;
  const h = main.querySelector('h1') || main;
  if (h !== main) h.setAttribute('tabindex', '-1');
  try { h.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
}

// ---------------- History (Android back button / gesture) ----------------
function histState() { return { view: UI.view, more: UI.more }; }
function pushHist(replace) {
  try {
    const cur = history.state;
    if (!replace && isObj(cur) && cur.view === UI.view && cur.more === UI.more) return;
    if (replace) history.replaceState(histState(), ''); else history.pushState(histState(), '');
  } catch (e) { /* history unavailable */ }
}
window.addEventListener('popstate', (e) => {
  const st = e.state;
  if (!isObj(st) || !P) return;
  let v = VIEWS.includes(st.view) ? st.view : 'today';
  if (v === 'session' && !curSess()) v = 'today';
  if (v === 'result' && !resultForTrack()) v = 'today';
  if (UI.view === 'handsfree' && v !== 'handsfree') hfStop();
  if (UI.view !== v) { hideToast(); UI.pendingStart = null; }
  UI.view = v;
  UI.more = typeof st.more === 'string' ? st.more : 'menu';
  UI.confirmFinish = false; UI.confirmPassed = false; UI.confirmReset = false; UI.pendingImport = null;
  if (v !== 'session') UI.sessMenu = false;
  render();
  focusView();
  window.scrollTo(0, 0);
});

function go(view) {
  if (!VIEWS.includes(view)) view = 'today';
  if (UI.view === 'handsfree' && view !== 'handsfree') hfStop();
  const changed = UI.view !== view;
  if (changed) { hideToast(); UI.pendingStart = null; }
  UI.view = view;
  UI.confirmFinish = false; UI.confirmPassed = false;
  if (view !== 'session') UI.sessMenu = false;
  render();
  // Finishing a session replaces its history entry so Back doesn't land on a dead session.
  pushHist(!changed || view === 'result');
  if (changed) focusView();
  window.scrollTo(0, 0);
}

ACTIONS['nav'] = (el) => {
  const v = el.dataset.view;
  if (v === 'more' && UI.view === 'more') UI.more = 'menu';
  go(v);
};

// ---------------- Event wiring ----------------
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]');
  if (!el || el.disabled) return;
  const fn = ACTIONS[el.dataset.act];
  if (!fn) return;
  if (el.tagName === 'A' && el.getAttribute('href') && el.getAttribute('href') !== '#') { // real links: let them open
    try { fn(el, e); } catch (err) { console.error(err); }
    return;
  }
  e.preventDefault();
  try { fn(el, e); } catch (err) { console.error(err); toast('Oops — that didn\'t work'); }
});

document.addEventListener('change', (e) => {
  const el = e.target;
  if (el.dataset && el.dataset.set) { setSettingPath(el.dataset.set, el.value); return; }
  if (el.hasAttribute && el.hasAttribute('data-import-file') && el.files && el.files[0]) {
    const r = new FileReader();
    r.onload = () => beginImport(String(r.result || ''));
    r.onerror = () => toast('Could not read that file');
    r.readAsText(el.files[0]);
    el.value = '';
  }
});

// Course sections: remember open/closed; render lecture rows lazily on open.
document.addEventListener('toggle', (e) => {
  const d = e.target;
  if (!d.matches || !d.matches('details.sec')) return;
  const sid = d.dataset.sec;
  const wasOpen = !!UI.openSec[sid];
  UI.openSec[sid] = d.open;
  if (d.open && !wasOpen && !d.querySelector('.lec-list')) render();
}, true);

// Swipe on a flipped flashcard: right = knew it, left = didn't.
let swipe = null;
document.addEventListener('touchstart', (e) => {
  const c = e.target.closest('.fcard');
  swipe = c && c.dataset.swipe === '1' ? { x: e.touches[0].clientX, y: e.touches[0].clientY, el: c } : null;
}, { passive: true });
document.addEventListener('touchmove', (e) => {
  if (!swipe) return;
  const dx = e.touches[0].clientX - swipe.x, dy = e.touches[0].clientY - swipe.y;
  swipe.el.style.transform = Math.abs(dx) > Math.abs(dy) ? 'translateX(' + dx + 'px) rotate(' + dx / 30 + 'deg)' : '';
}, { passive: true });
document.addEventListener('touchcancel', () => {
  if (swipe && swipe.el) swipe.el.style.transform = '';
  swipe = null;
}, { passive: true });
document.addEventListener('touchend', (e) => {
  if (!swipe) return;
  const t = e.changedTouches[0];
  const dx = t.clientX - swipe.x, dy = t.clientY - swipe.y;
  const el = swipe.el;
  swipe = null;
  if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) gradeCard(dx > 0);
  else el.style.transform = '';
});

// Keyboard shortcuts for laptop use in sessions.
document.addEventListener('keydown', (e) => {
  if (UI.view !== 'session' || e.ctrlKey || e.metaKey || e.altKey) return;
  if (/INPUT|TEXTAREA|SELECT/.test((e.target.tagName || ''))) return;
  const k = e.key.toLowerCase();
  const idx = '12345'.indexOf(k) >= 0 ? '12345'.indexOf(k) : 'abcde'.indexOf(k);
  const click = (sel) => { const b = $(sel); if (b && !b.disabled) { b.click(); return true; } return false; };
  if (idx >= 0 && click('.opt[data-i="' + idx + '"]')) { e.preventDefault(); return; }
  if (k === ' ' || k === 'enter') {
    if (click('[data-act="next"]') || click('[data-act="submit-multi"]') || click('.thumb-bar [data-act="flip"]')) e.preventDefault();
  } else if (k === 'arrowright') { if (click('[data-act="card-grade"][data-ok="1"]') || click('[data-act="exam-nav"][data-d="1"]')) e.preventDefault(); }
  else if (k === 'arrowleft') { if (click('[data-act="card-grade"][data-ok="0"]') || click('[data-act="exam-nav"][data-d="-1"]')) e.preventDefault(); }
});

// Exam timer: only runs while the exam is on screen and the app is visible.
setInterval(() => {
  if (UI.view !== 'session' || document.visibilityState !== 'visible' || !P) return;
  const s = curSess();
  if (!s || !s.timeLimitSec) return;
  s.elapsedSec++;
  const el = $('#sess-timer');
  const left = s.timeLimitSec - s.elapsedSec;
  if (el) { el.textContent = fmtClock(left); el.classList.toggle('low', left < 300); }
  if (s.elapsedSec % 10 === 0) saveProgress();
  if (left <= 0) { finishSession(); toast('⏰ Time\'s up'); }
}, 1000);

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') { if (P) saveProgress(); return; }
  if (UI.lastDay && UI.lastDay !== today() && UI.view !== 'session') render(); // new day while app was open
  if (SW.reg) SW.reg.update().catch(() => {});
});

// ---------------- Service worker + update toast ----------------
const SW = { reg: null, waiting: null, reloading: false, accepted: false, dismissed: false };

/** New version waiting: shown as an inline card at the top of Today (never over the header or thumb bar). */
function showUpdateToast(worker) {
  SW.waiting = worker;
  if (UI.view === 'today') render();
}
function updateCard() {
  return '<div class="card update-card"><button type="button" class="update-main" data-act="sw-update">✨ Update available — tap to refresh</button>' +
    '<button type="button" class="icon-btn" data-act="sw-dismiss" aria-label="Later">✕</button></div>';
}
ACTIONS['sw-update'] = () => {
  SW.accepted = true;
  if (SW.waiting) SW.waiting.postMessage({ type: 'SKIP_WAITING' });
  else location.reload();
};
ACTIONS['sw-dismiss'] = () => { SW.dismissed = true; render(); };

function registerSW() {
  if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
  navigator.serviceWorker.register('sw.js').then((reg) => {
    SW.reg = reg;
    if (reg.waiting && navigator.serviceWorker.controller) showUpdateToast(reg.waiting);
    reg.addEventListener('updatefound', () => {
      const w = reg.installing;
      if (!w) return;
      w.addEventListener('statechange', () => {
        if (w.state === 'installed' && navigator.serviceWorker.controller) showUpdateToast(w);
      });
    });
  }).catch(() => { /* offline support unavailable */ });
  const hadController = !!navigator.serviceWorker.controller; // first install claims silently, no reload
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    // First install claims silently; reload only if a controller existed or the user tapped Update.
    if (SW.reloading || !(hadController || SW.accepted)) return;
    SW.reloading = true;
    if (P) saveProgress();
    location.reload();
  });
}

// ---------------- Boot ----------------
function boot() {
  loadProgress();
  const last = storeGetJSON(UI_KEY, null);
  if (isObj(last)) {
    if (last.view === 'session' && curSess()) UI.view = 'session';
  }
  render();
  pushHist(true);
  registerSW();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
