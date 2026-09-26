// ============================================================
//  AWS Cert Study — Listen (pre-generated audio packs)
//  audio/index.json = { generated, tracks: { clf:[{section,title,file,seconds,items}], saa:[...] } }
//  Player lives in #player-dock (outside #main) so it keeps playing across views.
// ============================================================

const AUDIO_CACHE = 'aws-audio';
const LS = { index: null, loading: false, error: null, saved: {}, current: null, busy: {} };

function audioUrl(file) { try { return new URL(file, location.href).href; } catch (e) { return file; } }

function loadAudioIndex(force) {
  if (LS.loading || (LS.index && !force)) return;
  LS.loading = true; LS.error = null;
  fetch('audio/index.json', { cache: 'no-cache' })
    .then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then((j) => { LS.index = isObj(j) && isObj(j.tracks) ? j : { tracks: {} }; return refreshSaved(); })
    .catch((e) => { LS.error = String(e && e.message || e); LS.index = null; })
    .then(() => { LS.loading = false; if (UI.view === 'more' && UI.more === 'listen') render(); });
}

/**
 * Version stamp of a pack as listed in index.json. Uses an explicit hash/version
 * field if the generator provides one, else seconds+items (change when content changes).
 */
function packVersion(p) { return String(p.hash || p.version || '') + '|' + num(p.seconds) + '|' + num(p.items); }
const PACK_VER_HEADER = 'X-Pack-Version';

/** Mark saved packs; a saved copy whose version no longer matches index.json is stale → deleted. */
function refreshSaved() {
  if (!('caches' in window) || !LS.index) return Promise.resolve();
  return caches.open(AUDIO_CACHE).then((c) => {
    LS.saved = {};
    const jobs = [];
    TRACK_IDS.forEach((t) => listOr(LS.index.tracks[t]).forEach((p) => {
      if (!p || !p.file) return;
      const url = audioUrl(p.file);
      jobs.push(c.match(url).then((r) => {
        if (!r) return;
        if (r.headers.get(PACK_VER_HEADER) === packVersion(p)) LS.saved[p.file] = true;
        else return c.delete(url); // stale copy: the SW would keep serving old audio forever
      }));
    }));
    return Promise.all(jobs);
  }).catch(() => {});
}

function packsFor(t) {
  const packs = LS.index ? listOr(LS.index.tracks[t]).filter((p) => p && p.file) : [];
  const d = T(t);
  const unl = (p) => !p.section || isSectionDone(t, p.section);
  const order = (p) => (d.secIndex[p.section] != null ? d.secIndex[p.section] : 999);
  return packs.slice().sort((a, b) => (unl(b) - unl(a)) || (order(a) - order(b)));
}

function playPack(file) {
  const t = curTrack();
  const p = packsFor(t).find((x) => x.file === file);
  if (!p) return;
  hfStop(); // never play over hands-free speech
  const dock = $('#player-dock');
  const audio = $('#dock-audio');
  if (!dock || !audio) return;
  LS.current = p;
  $('#dock-title').textContent = p.title;
  dock.hidden = false;
  document.body.classList.add('has-dock');
  audio.src = audioUrl(p.file);
  audio.play().catch(() => toast('Tap ▶ on the player to start'));
  wireDockAudio(audio);
  if ('mediaSession' in navigator) {
    try {
      navigator.mediaSession.metadata = new MediaMetadata({ title: p.title, artist: 'AWS Cert Study · ' + T(t).meta.label, album: 'Audio review' });
      const list = packsFor(t);
      const idx = list.findIndex((x) => x.file === file);
      navigator.mediaSession.setActionHandler('play', () => audio.play());
      navigator.mediaSession.setActionHandler('pause', () => audio.pause());
      navigator.mediaSession.setActionHandler('nexttrack', idx < list.length - 1 ? () => playPack(list[idx + 1].file) : null);
      navigator.mediaSession.setActionHandler('previoustrack', idx > 0 ? () => playPack(list[idx - 1].file) : null);
      navigator.mediaSession.setActionHandler('seekbackward', () => { audio.currentTime = Math.max(0, audio.currentTime - 10); });
      navigator.mediaSession.setActionHandler('seekforward', () => { audio.currentTime = audio.currentTime + 10; });
    } catch (e) { /* partial support */ }
  }
  if (UI.view === 'more' && UI.more === 'listen') render();
}

function wireDockAudio(audio) {
  if (audio.dataset.wired) return;
  audio.dataset.wired = '1';
  const setState = (st) => { try { if ('mediaSession' in navigator && LS.current) navigator.mediaSession.playbackState = st; } catch (e) { /* ignore */ } };
  audio.addEventListener('play', () => { hfStop(); setState('playing'); });
  audio.addEventListener('pause', () => setState('paused'));
}

function closeDock() {
  const audio = $('#dock-audio');
  if (audio) { audio.pause(); audio.removeAttribute('src'); audio.load(); }
  if ('mediaSession' in navigator) {
    try { navigator.mediaSession.metadata = null; navigator.mediaSession.playbackState = 'none'; } catch (e) { /* ignore */ }
  }
  const dock = $('#player-dock');
  if (dock) dock.hidden = true;
  document.body.classList.remove('has-dock');
  LS.current = null;
}

function savePack(file) {
  if (!('caches' in window)) { toast('Offline saving is not supported here'); return; }
  LS.busy[file] = true; render();
  const pack = LS.index ? TRACK_IDS.map((t) => listOr(LS.index.tracks[t]).find((x) => x && x.file === file)).find(Boolean) : null;
  const ver = pack ? packVersion(pack) : '';
  // Ask the browser not to evict saved packs (best effort; iOS/Chrome may otherwise clear them).
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {}); } catch (e) { /* ignore */ }
  caches.open(AUDIO_CACHE)
    .then((c) => fetch(audioUrl(file), { cache: 'no-cache' }).then((r) => {
      if (!r.ok || r.status !== 200) throw new Error('HTTP ' + r.status);
      return r.blob().then((b) => {
        const h = new Headers(r.headers);
        h.set(PACK_VER_HEADER, ver);
        h.set('Content-Length', String(b.size));
        return c.put(audioUrl(file), new Response(b, { status: 200, headers: h }));
      });
    }))
    .then(() => { LS.saved[file] = true; toast('Saved for offline ✓'); })
    .catch(() => toast('Could not save — check your connection'))
    .then(() => { delete LS.busy[file]; render(); });
}

function unsavePack(file) {
  if (!('caches' in window)) return;
  caches.open(AUDIO_CACHE).then((c) => c.delete(audioUrl(file)))
    .then(() => { delete LS.saved[file]; toast('Removed offline copy'); render(); });
}

function renderListen() {
  const t = curTrack();
  let h = '<div class="view-head"><button class="icon-btn" data-act="more" data-page="menu" aria-label="Back">←</button><h1>🎵 Listen</h1></div>' +
    '<p class="muted">Spoken review packs, one per course section. Great for walks, rocking the baby, or the car. Lock-screen controls work.</p>';
  if (!LS.index && !LS.error) { loadAudioIndex(); return h + '<div class="panel">Loading packs…</div>'; }
  if (LS.error || !LS.index) {
    return h + '<div class="panel"><p>Audio packs are generated when the site is deployed, so none are available here yet.</p>' +
      '<p class="muted small">Meanwhile, Hands-free mode reads cards and questions aloud with your phone\'s voice.</p>' +
      '<button class="btn primary" data-act="handsfree">🎧 Start hands-free</button> <button class="btn ghost" data-act="listen-reload">↻ Try again</button></div>';
  }
  const packs = packsFor(t);
  if (!packs.length) return h + '<div class="panel">No audio packs for ' + T(t).meta.label + ' yet.</div>';
  h += '<div class="list">';
  packs.forEach((p) => {
    const unl = !p.section || isSectionDone(t, p.section);
    const playing = LS.current && LS.current.file === p.file;
    h += '<div class="list-row' + (unl ? '' : ' locked') + '">' +
      '<button type="button" class="row-main" data-act="listen-play" data-file="' + esc(p.file) + '">' +
      '<span class="row-icon">' + (playing ? '🔊' : unl ? '▶' : '🔒') + '</span>' +
      '<span class="row-text"><b>' + esc(p.title) + '</b><small>' + fmtClock(num(p.seconds)) + ' · ' + plural(num(p.items), 'item') +
      (unl ? '' : ' · section not done yet') + '</small></span></button>' +
      (LS.busy[p.file] ? '<span class="row-side muted">…</span>'
        : LS.saved[p.file] ? '<button type="button" class="row-side" data-act="listen-unsave" data-file="' + esc(p.file) + '" aria-label="Remove offline copy">✓ Saved</button>'
          : '<button type="button" class="row-side" data-act="listen-save" data-file="' + esc(p.file) + '" aria-label="Save offline">⬇</button>') +
      '</div>';
  });
  h += '</div>';
  if (LS.index.generated) h += '<p class="muted small center">Packs generated ' + esc(String(LS.index.generated).slice(0, 10)) + '</p>';
  return h;
}

ACTIONS['listen-play'] = (el) => playPack(el.dataset.file);
ACTIONS['listen-save'] = (el) => savePack(el.dataset.file);
ACTIONS['listen-unsave'] = (el) => unsavePack(el.dataset.file);
ACTIONS['listen-reload'] = () => { LS.index = null; LS.error = null; loadAudioIndex(true); render(); };
ACTIONS['dock-close'] = () => closeDock();
