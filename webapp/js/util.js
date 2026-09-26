// ============================================================
//  AWS Cert Study — Utilities
//  Dates, safe storage, DOM helpers, toast, action registry.
//  Classic <script>: every top-level name here is a global used by
//  the other modules (model.js, session.js, today.js, views.js, ...).
// ============================================================

// ---- Action registry ----
// Buttons carry data-act="name"; app.js dispatches clicks to ACTIONS[name](el, event).
const ACTIONS = {};

// ============================================================
//  Safe storage (every localStorage access is wrapped)
// ============================================================
function storeGet(key) {
  try { return localStorage.getItem(key); } catch (e) { return null; }
}
function storeSet(key, value) {
  try { localStorage.setItem(key, value); return true; } catch (e) { return false; }
}
function storeRemove(key) {
  try { localStorage.removeItem(key); } catch (e) { /* storage blocked */ }
}
function storeGetJSON(key, fallback) {
  const raw = storeGet(key);
  if (raw == null) return fallback;
  try { return JSON.parse(raw); } catch (e) { return fallback; }
}
function storeSetJSON(key, value) {
  try { return storeSet(key, JSON.stringify(value)); } catch (e) { return false; }
}

// ============================================================
//  Dates — local "YYYY-MM-DD" strings everywhere
// ============================================================
const FAKE_TODAY_KEY = 'aws-study-fake-today';
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function ymd(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

/**
 * THE single source of "today" for all app logic.
 * Tests can pin the date: localStorage['aws-study-fake-today'] = '2026-10-05'.
 */
function today() {
  const fake = storeGet(FAKE_TODAY_KEY);
  if (fake && isYmd(fake)) return fake;
  return ymd(new Date());
}

function isYmd(s) {
  if (typeof s !== 'string' || !DATE_RE.test(s)) return false;
  const [y, m, d] = s.split('-').map(Number);
  return m >= 1 && m <= 12 && d >= 1 && d <= 31 && y > 1999 && y < 2200;
}

// Noon local time avoids DST edge cases when adding days.
function parseYmd(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

function addDays(s, n) {
  const d = parseYmd(s);
  d.setDate(d.getDate() + n);
  return ymd(d);
}

/** Whole days from a to b (b - a). */
function daysBetween(a, b) {
  const [y1, m1, d1] = a.split('-').map(Number);
  const [y2, m2, d2] = b.split('-').map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 864e5);
}

/** Convert anything date-like (ISO, toDateString, YYYY-MM-DD) to YYYY-MM-DD or null. */
function toYmd(v) {
  if (isYmd(v)) return v;
  if (v == null || v === '') return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : ymd(d);
}

function fmtDay(s) {
  if (!isYmd(s)) return '—';
  return parseYmd(s).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

// ============================================================
//  Small helpers
// ============================================================
const $ = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const pad3 = (n) => String(n).padStart(3, '0');
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
const pct = (c, t) => (t ? Math.round((c / t) * 100) : 0);
const isObj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
const listOr = (v) => (Array.isArray(v) ? v : []);

function num(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : (fallback || 0);
}
function numIn(v, lo, hi, fallback) {
  const n = Number(v);
  return Number.isFinite(n) && n >= lo && n <= hi ? n : fallback;
}

function fmtMin(m) {
  m = Math.max(0, Math.round(m));
  if (m < 60) return m + ' min';
  const h = Math.floor(m / 60), r = m % 60;
  return h + ' h' + (r ? ' ' + r + ' min' : '');
}

function fmtClock(sec) {
  sec = Math.max(0, Math.round(sec));
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(s).padStart(2, '0');
}

function plural(n, word, pl) {
  return n + ' ' + (n === 1 ? word : (pl || word + 's'));
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

// ============================================================
//  Toast — the only "dialog" the app uses (never alert/confirm)
// ============================================================
let toastTimer = null;

/**
 * toast('Saved') or toast('3 cards unlocked', { action: { label: 'Undo', fn } })
 */
function toast(msg, opts) {
  opts = opts || {};
  const el = $('#toast');
  if (!el) return;
  el.innerHTML = '<span class="toast-msg">' + esc(msg) + '</span>' +
    (opts.action ? '<button type="button" class="toast-btn">' + esc(opts.action.label) + '</button>' : '');
  if (opts.action) {
    el.querySelector('.toast-btn').addEventListener('click', () => {
      hideToast();
      opts.action.fn();
    });
  }
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(hideToast, opts.ms || (opts.action ? 6500 : 3200));
}

function hideToast() {
  const el = $('#toast');
  if (el) el.classList.remove('show');
}
