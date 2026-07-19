/* Careers ("Jobs") page — renders data/jobs.json (built weekly by
   scripts/update_jobs.py). All filter vocabulary (disciplines, pathways,
   programs, resources) comes from jobs-config.json so the board can tune it
   without touching code.

   Supports deep links: careers.html?q=Boeing&level=intern&disc=ME,EE */

'use strict';

let CFG = null, JOBS = [], SHOWN = 50;
const PAGE = 50;
const state = {
  level: 'intern',          // intern | newgrad | fresh | saved
  discs: new Set(),
  q: '', loc: '', days: '',
  coop: false, fresh: false, spons: false,
  sort: 'new'
};

const SAVED_KEY = 'bp:savedJobs';

document.addEventListener('DOMContentLoaded', boot);

/* ------------------------------------------------------------ theme -- */

function initTheme() {
  const btn = document.getElementById('theme-toggle');
  btn.addEventListener('click', () => {
    const cur = document.documentElement.dataset.ptheme ||
      (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.ptheme = next;
    localStorage.setItem('bp:ptheme', next);
  });
}

/* ------------------------------------------------------------- boot -- */

async function boot() {
  initTheme();
  try {
    const [cfgRes, jobsRes] = await Promise.all([
      fetch('jobs-config.json?cb=' + Date.now()),
      fetch('data/jobs.json?cb=' + Date.now())
    ]);
    CFG = await cfgRes.json();
    if (jobsRes.ok) {
      const data = await jobsRes.json();
      JOBS = data.jobs || [];
      const nice = data.updated_at ? new Date(data.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '';
      document.getElementById('updated-label').innerHTML =
        '<strong>' + JOBS.length.toLocaleString() + '</strong> live roles across ' +
        Object.keys(CFG.disciplines).filter(k => k !== 'Other').length +
        ' engineering disciplines' + (nice ? ' · updated ' + nice : '') + ' · refreshes every Monday';
    } else {
      document.getElementById('updated-label').textContent = 'First data pull pending — runs every Monday';
    }
  } catch (err) {
    showBanner('Data could not be loaded. If this is a fresh setup, run the "Update careers data" workflow under the repo\'s Actions tab once.');
    return;
  }

  readUrlParams();
  buildControls();
  render();
}

const urlLock = { level: false, discs: false };

function readUrlParams() {
  const p = new URLSearchParams(location.search);
  if (p.get('q')) state.q = p.get('q').toLowerCase();
  if (p.get('level') && ['intern', 'newgrad', 'fresh', 'saved'].includes(p.get('level'))) {
    state.level = p.get('level');
    urlLock.level = true;
  }
  if (p.get('disc')) {
    p.get('disc').split(',').forEach(d => { if (CFG.disciplines[d]) state.discs.add(d); });
    urlLock.discs = state.discs.size > 0;
  }
}

/* ------------------------------------------------------- saved jobs -- */

function savedStore() {
  try { return JSON.parse(localStorage.getItem(SAVED_KEY)) || {}; }
  catch (e) { return {}; }
}
function toggleSaved(job) {
  const s = savedStore();
  if (s[job.url]) delete s[job.url];
  else s[job.url] = { company: job.company, title: job.title, url: job.url, locs: job.locs || [], level: job.level, savedAt: new Date().toISOString().slice(0, 10) };
  localStorage.setItem(SAVED_KEY, JSON.stringify(s));
  updateTabCounts();
  render();
}

/* ----------------------------------------------------------- controls -- */

function buildControls() {
  // Major dropdown + discipline checkboxes from config
  const sel = document.getElementById('major-select');
  const discList = document.getElementById('disc-list');
  for (const [key, d] of Object.entries(CFG.disciplines)) {
    if (key === 'Other') continue;
    const opt = document.createElement('option');
    opt.value = key; opt.textContent = d.label;
    sel.appendChild(opt);

    const lab = document.createElement('label');
    lab.className = 'fopt';
    const cb = document.createElement('input');
    cb.type = 'checkbox'; cb.value = key; cb.checked = state.discs.has(key);
    cb.addEventListener('change', () => {
      cb.checked ? state.discs.add(key) : state.discs.delete(key);
      resetPage(); render();
    });
    const txt = document.createElement('span'); txt.textContent = d.label;
    const n = document.createElement('span'); n.className = 'fcount'; n.dataset.disc = key;
    lab.appendChild(cb); lab.appendChild(txt); lab.appendChild(n);
    discList.appendChild(lab);
  }

  // Restore saved profile (shared keys with the old page)
  const savedMajor = localStorage.getItem('bp:major') || '';
  const savedYear = localStorage.getItem('bp:gradyear') || '';
  sel.value = savedMajor;
  document.getElementById('year-select').value = savedYear;
  const urlDiscs = new Set(state.discs), urlLevel = state.level;
  applyProfile(savedMajor, savedYear, false);
  // Deep-link params (?disc= / ?level=) beat the remembered profile.
  if (urlLock.discs) {
    state.discs.clear();
    document.querySelectorAll('#disc-list input').forEach(c => { c.checked = urlDiscs.has(c.value); });
    urlDiscs.forEach(d => state.discs.add(d));
  }
  if (urlLock.level) { state.level = urlLevel; setTabUI(); }

  sel.addEventListener('change', () => {
    localStorage.setItem('bp:major', sel.value);
    applyProfile(sel.value, document.getElementById('year-select').value, true);
  });
  document.getElementById('year-select').addEventListener('change', e => {
    localStorage.setItem('bp:gradyear', e.target.value);
    applyProfile(sel.value, e.target.value, true);
  });

  // Tabs
  document.querySelectorAll('#level-tabs .ptab').forEach(tab => {
    tab.addEventListener('click', () => setLevel(tab.dataset.level));
  });
  setTabUI();

  // Search / sort / filters
  const search = document.getElementById('job-search');
  search.value = state.q;
  search.addEventListener('input', e => { state.q = e.target.value.toLowerCase(); resetPage(); render(); });
  document.getElementById('sort-select').addEventListener('change', e => { state.sort = e.target.value; render(); });
  document.getElementById('loc-input').addEventListener('input', e => { state.loc = e.target.value.toLowerCase(); resetPage(); render(); });
  document.querySelectorAll('#posted-group input').forEach(r =>
    r.addEventListener('change', () => { state.days = r.value; resetPage(); render(); }));
  document.getElementById('coop-only').addEventListener('change', e => { state.coop = e.target.checked; resetPage(); render(); });
  document.getElementById('fresh-only').addEventListener('change', e => { state.fresh = e.target.checked; resetPage(); render(); });
  document.getElementById('spons-only').addEventListener('change', e => { state.spons = e.target.checked; resetPage(); render(); });
  document.getElementById('clear-filters').addEventListener('click', clearFilters);
  document.getElementById('more-btn').addEventListener('click', () => { SHOWN += PAGE; render(); });

  // Mobile filters toggle
  const fbtn = document.getElementById('filters-btn');
  fbtn.addEventListener('click', () => {
    const panel = document.getElementById('filters-panel');
    const open = panel.classList.toggle('open');
    fbtn.setAttribute('aria-expanded', String(open));
  });

  // Resource links
  const res = document.getElementById('resources');
  for (const r of (CFG.resources || [])) {
    const a = document.createElement('a');
    a.className = 'res-card'; a.href = r.url; a.target = '_blank'; a.rel = 'noopener';
    const t = document.createElement('div'); t.className = 'res-t'; t.textContent = r.title;
    a.appendChild(t);
    if (r.desc) { const d = document.createElement('div'); d.className = 'res-d'; d.textContent = r.desc; a.appendChild(d); }
    res.appendChild(a);
  }

  updateTabCounts();
}

function setLevel(level) {
  state.level = level;
  resetPage();
  setTabUI();
  render();
}

function setTabUI() {
  document.querySelectorAll('#level-tabs .ptab').forEach(t =>
    t.classList.toggle('active', t.dataset.level === state.level));
}

function updateTabCounts() {
  const counts = {
    intern: JOBS.filter(j => j.level === 'intern').length,
    newgrad: JOBS.filter(j => j.level === 'newgrad').length,
    fresh: JOBS.filter(j => j.fresh).length + (CFG.freshman_programs || []).length,
    saved: Object.keys(savedStore()).length
  };
  document.querySelectorAll('[data-count]').forEach(el => {
    el.textContent = (counts[el.dataset.count] || 0).toLocaleString();
  });
}

function resetPage() { SHOWN = PAGE; }

function clearFilters() {
  state.discs.clear(); state.q = ''; state.loc = ''; state.days = '';
  state.coop = state.fresh = state.spons = false;
  document.getElementById('job-search').value = '';
  document.getElementById('loc-input').value = '';
  document.querySelectorAll('#disc-list input').forEach(c => { c.checked = false; });
  document.querySelectorAll('#posted-group input').forEach(r => { r.checked = r.value === ''; });
  document.getElementById('coop-only').checked = false;
  document.getElementById('fresh-only').checked = false;
  document.getElementById('spons-only').checked = false;
  resetPage(); render();
}

function applyProfile(major, year, rerender) {
  // Major checks its discipline box; year picks the tab.
  state.discs.clear();
  document.querySelectorAll('#disc-list input').forEach(c => { c.checked = false; });
  if (major) {
    state.discs.add(major);
    const cb = document.querySelector('#disc-list input[value="' + major + '"]');
    if (cb) cb.checked = true;
  }
  if (year) {
    state.level = year === 'freshman' ? 'fresh' : year === 'grad' ? 'newgrad' : 'intern';
    setTabUI();
  }

  // Pathways card
  const card = document.getElementById('pathways');
  const list = document.getElementById('pathway-list');
  const paths = major ? (CFG.pathways[major] || []) : [];
  list.innerHTML = '';
  if (paths.length) {
    document.getElementById('pathway-title').textContent =
      'Pathways · ' + (CFG.disciplines[major] ? CFG.disciplines[major].label : major);
    for (const p of paths) {
      const d = document.createElement('div');
      d.className = 'pathway-item'; d.textContent = p;
      list.appendChild(d);
    }
    card.hidden = false;
  } else {
    card.hidden = true;
  }
  if (rerender) { resetPage(); render(); }
}

/* ---------------------------------------------------------- filtering -- */

function passesSharedFilters(j, skipDiscs) {
  const now = Date.now();
  if (state.coop && !j.coop) return false;
  if (state.fresh && !j.fresh) return false;
  if (state.spons && j.spons !== 'Offers Sponsorship') return false;
  if (!skipDiscs && state.discs.size && !j.disc.some(d => state.discs.has(d))) return false;
  if (state.days) {
    if (!j.posted) return false;
    if ((now - new Date(j.posted).getTime()) / 86400000 > +state.days) return false;
  }
  if (state.loc && !(j.locs || []).join(' ').toLowerCase().includes(state.loc)) return false;
  if (state.q) {
    const hay = (j.company + ' ' + j.title + ' ' + (j.locs || []).join(' ')).toLowerCase();
    if (!hay.includes(state.q)) return false;
  }
  return true;
}

function inLevel(j) {
  if (state.level === 'fresh') return !!j.fresh;
  return j.level === state.level;
}

function filtered(skipDiscs) {
  return JOBS.filter(j => inLevel(j) && passesSharedFilters(j, skipDiscs));
}

function sortJobs(jobs) {
  if (state.sort === 'co') {
    return jobs.slice().sort((a, b) =>
      a.company.localeCompare(b.company) || a.title.localeCompare(b.title));
  }
  return jobs.slice().sort((a, b) => (b.posted || '').localeCompare(a.posted || ''));
}

/* ---------------------------------------------------------- rendering -- */

function relTime(posted) {
  if (!posted) return '';
  const days = Math.floor((Date.now() - new Date(posted).getTime()) / 86400000);
  if (isNaN(days) || days < 0) return posted;
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return days + 'd ago';
  if (days < 30) return Math.floor(days / 7) + 'w ago';
  return Math.floor(days / 30) + 'mo ago';
}

function pill(text, cls) {
  const s = document.createElement('span');
  s.className = 'pill' + (cls ? ' ' + cls : '');
  s.textContent = text;
  return s;
}

function jobRow(j, opts) {
  opts = opts || {};
  const row = document.createElement('div');
  row.className = 'jrow';

  const body = document.createElement('div');
  body.className = 'jbody';

  const top = document.createElement('div');
  const co = document.createElement('span'); co.className = 'jco'; co.textContent = j.company;
  top.appendChild(co);
  const days = j.posted ? (Date.now() - new Date(j.posted).getTime()) / 86400000 : 999;
  if (days <= 7) top.appendChild(pillSpaced('New', 'new'));
  if (j.coop) top.appendChild(pillSpaced('Co-op', 'coop'));
  if (j.fresh && state.level !== 'fresh') top.appendChild(pillSpaced('First-year friendly', 'fresh'));
  if (j.spons === 'Offers Sponsorship') top.appendChild(pillSpaced('Sponsorship', 'fresh'));
  else if (j.spons === 'Does Not Offer Sponsorship') top.appendChild(pillSpaced('No sponsorship', 'warn'));
  else if (j.spons === 'U.S. Citizenship is Required') top.appendChild(pillSpaced('US citizenship req.', 'warn'));
  if (opts.gone) top.appendChild(pillSpaced('No longer listed', 'warn'));
  body.appendChild(top);

  const title = document.createElement('a');
  title.className = 'jtitle'; title.textContent = j.title;
  title.href = j.url; title.target = '_blank'; title.rel = 'noopener';
  body.appendChild(title);

  const sub = document.createElement('div');
  sub.className = 'jsub';
  if ((j.locs || []).length) {
    const l = document.createElement('span'); l.textContent = '📍 ' + j.locs.join(' · ');
    sub.appendChild(l);
  }
  if (j.posted) { const p = document.createElement('span'); p.textContent = relTime(j.posted); sub.appendChild(p); }
  for (const d of (j.disc || [])) {
    if (d === 'Other') continue;
    sub.appendChild(pill(d, 'disc'));
  }
  body.appendChild(sub);
  row.appendChild(body);

  const actions = document.createElement('div');
  actions.className = 'jactions';
  const saved = !!savedStore()[j.url];
  const star = document.createElement('button');
  star.className = 'save-btn';
  star.setAttribute('aria-pressed', String(saved));
  star.setAttribute('aria-label', saved ? 'Unsave this role' : 'Save this role');
  star.textContent = saved ? '★' : '☆';
  star.addEventListener('click', () => toggleSaved(j));
  actions.appendChild(star);
  const apply = document.createElement('a');
  apply.className = 'pbtn'; apply.textContent = 'Apply ↗';
  apply.href = j.url; apply.target = '_blank'; apply.rel = 'noopener';
  actions.appendChild(apply);
  row.appendChild(actions);

  return row;
}

function pillSpaced(text, cls) {
  const s = pill(text, cls);
  s.style.marginLeft = '0.45rem';
  return s;
}

function programRow(p) {
  const row = document.createElement('div');
  row.className = 'jrow';
  const body = document.createElement('div');
  body.className = 'jbody';
  const top = document.createElement('div');
  const co = document.createElement('span'); co.className = 'jco'; co.textContent = p.name;
  top.appendChild(co);
  top.appendChild(pillSpaced('Opens ' + p.opens, 'coop'));
  body.appendChild(top);
  const title = document.createElement('a');
  title.className = 'jtitle'; title.textContent = p.for;
  title.href = p.url; title.target = '_blank'; title.rel = 'noopener';
  body.appendChild(title);
  row.appendChild(body);
  const actions = document.createElement('div');
  actions.className = 'jactions';
  const go = document.createElement('a');
  go.className = 'pbtn ghost'; go.textContent = 'Program page ↗';
  go.href = p.url; go.target = '_blank'; go.rel = 'noopener';
  actions.appendChild(go);
  row.appendChild(actions);
  return row;
}

function listLabel(text) {
  const el = document.createElement('div');
  el.className = 'list-label'; el.textContent = text;
  return el;
}

function updateFacetCounts() {
  // Discipline counts within the current level + all non-discipline filters.
  const pool = state.level === 'saved' ? [] : filtered(true);
  const counts = {};
  for (const j of pool) for (const d of j.disc) counts[d] = (counts[d] || 0) + 1;
  document.querySelectorAll('#disc-list .fcount').forEach(el => {
    el.textContent = (counts[el.dataset.disc] || 0).toLocaleString();
  });
}

function renderActivePills() {
  const box = document.getElementById('active-pills');
  box.innerHTML = '';
  const items = [];
  for (const d of state.discs) items.push({ label: CFG.disciplines[d] ? CFG.disciplines[d].label : d, undo: () => {
    state.discs.delete(d);
    const cb = document.querySelector('#disc-list input[value="' + d + '"]');
    if (cb) cb.checked = false;
  }});
  if (state.q) items.push({ label: '“' + state.q + '”', undo: () => { state.q = ''; document.getElementById('job-search').value = ''; } });
  if (state.loc) items.push({ label: '📍 ' + state.loc, undo: () => { state.loc = ''; document.getElementById('loc-input').value = ''; } });
  if (state.days) items.push({ label: 'Past ' + (state.days === '7' ? 'week' : 'month'), undo: () => {
    state.days = '';
    document.querySelectorAll('#posted-group input').forEach(r => { r.checked = r.value === ''; });
  }});
  if (state.coop) items.push({ label: 'Co-op', undo: () => { state.coop = false; document.getElementById('coop-only').checked = false; } });
  if (state.fresh) items.push({ label: 'First-year', undo: () => { state.fresh = false; document.getElementById('fresh-only').checked = false; } });
  if (state.spons) items.push({ label: 'Sponsorship', undo: () => { state.spons = false; document.getElementById('spons-only').checked = false; } });
  for (const it of items) {
    const b = document.createElement('button');
    b.className = 'active-pill'; b.textContent = it.label + ' ✕';
    b.title = 'Remove this filter';
    b.addEventListener('click', () => { it.undo(); resetPage(); render(); });
    box.appendChild(b);
  }
}

function render() {
  const list = document.getElementById('job-list');
  list.innerHTML = '';
  updateFacetCounts();
  renderActivePills();
  const moreBtn = document.getElementById('more-btn');
  moreBtn.hidden = true;

  // ---- Saved tab ----
  if (state.level === 'saved') {
    const store = savedStore();
    const saved = Object.values(store).sort((a, b) => (b.savedAt || '').localeCompare(a.savedAt || ''));
    document.getElementById('result-count').innerHTML = '<strong>' + saved.length + '</strong> saved role' + (saved.length === 1 ? '' : 's');
    if (!saved.length) {
      list.appendChild(emptyState('Nothing saved yet. Hit the ☆ on any role to keep it here.'));
      return;
    }
    const liveByUrl = new Map(JOBS.map(j => [j.url, j]));
    for (const s of saved) {
      const live = liveByUrl.get(s.url);
      list.appendChild(jobRow(live || s, { gone: !live }));
    }
    return;
  }

  const jobs = sortJobs(filtered(false));
  document.getElementById('result-count').innerHTML =
    '<strong>' + jobs.length.toLocaleString() + '</strong> role' + (jobs.length === 1 ? '' : 's');

  // ---- Freshman tab: evergreen program directory first ----
  if (state.level === 'fresh') {
    const programs = (CFG.freshman_programs || []).filter(p =>
      !state.discs.size || !p.discs || p.discs.some(d => state.discs.has(d)));
    if (programs.length) {
      list.appendChild(listLabel('Flagship first-year & early-talent programs — apply in their windows'));
      for (const p of programs) list.appendChild(programRow(p));
    }
    if (jobs.length) list.appendChild(listLabel('Live first-year-friendly postings right now'));
  }

  if (jobs.length === 0) {
    if (!(state.level === 'fresh' && list.children.length)) {
      list.appendChild(emptyState(
        JOBS.length === 0
          ? 'No data yet — the weekly pipeline hasn\'t run. An admin can trigger it under the repo\'s Actions tab.'
          : 'No roles match these filters.', JOBS.length !== 0));
    }
    return;
  }

  for (const j of jobs.slice(0, SHOWN)) list.appendChild(jobRow(j));
  if (jobs.length > SHOWN) {
    moreBtn.hidden = false;
    moreBtn.textContent = 'Show more roles (' + (jobs.length - SHOWN).toLocaleString() + ' left)';
  }
}

function emptyState(msg, withClear) {
  const box = document.createElement('div');
  box.className = 'empty-state';
  const p = document.createElement('div'); p.textContent = msg;
  box.appendChild(p);
  if (withClear) {
    const b = document.createElement('button');
    b.className = 'pbtn ghost'; b.textContent = 'Clear all filters';
    b.addEventListener('click', clearFilters);
    box.appendChild(b);
  }
  return box;
}

function showBanner(msg) {
  const b = document.getElementById('banner');
  b.hidden = false; b.textContent = msg;
}
