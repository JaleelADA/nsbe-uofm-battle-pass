/* Careers page — renders data/jobs.json (built weekly by scripts/update_jobs.py).
   All filter vocabulary (disciplines, pathways, resources) comes from
   jobs-config.json so the board can tune it without touching code. */

'use strict';

let CFG = null, JOBS = [], SHOWN = 150;
const state = { level: 'intern', discs: new Set(), q: '', days: '', coop: false };

document.addEventListener('DOMContentLoaded', boot);

async function boot() {
  try {
    const [cfgRes, jobsRes] = await Promise.all([
      fetch('jobs-config.json?cb=' + Date.now()),
      fetch('data/jobs.json?cb=' + Date.now())
    ]);
    CFG = await cfgRes.json();
    if (jobsRes.ok) {
      const data = await jobsRes.json();
      JOBS = data.jobs || [];
      document.getElementById('updated-label').textContent = data.updated_at
        ? 'Updated ' + data.updated_at.slice(0, 10) + ' · ' + JOBS.length + ' live roles · refreshes weekly'
        : 'First data pull pending';
    } else {
      document.getElementById('updated-label').textContent = 'First data pull pending — runs every Monday';
    }
  } catch (err) {
    showBanner('Data could not be loaded. If this is a fresh setup, run the "Update careers data" workflow under the repo\'s Actions tab once.');
    return;
  }

  buildControls();
  render();
}

function buildControls() {
  // Major dropdown + discipline chips from config
  const sel = document.getElementById('major-select');
  const chips = document.getElementById('disc-chips');
  for (const [key, d] of Object.entries(CFG.disciplines)) {
    if (key === 'Other') continue;
    const opt = document.createElement('option');
    opt.value = key; opt.textContent = d.icon + ' ' + d.label;
    sel.appendChild(opt);
    const chip = document.createElement('button');
    chip.className = 'chip'; chip.dataset.disc = key;
    chip.textContent = d.icon + ' ' + key;
    chip.addEventListener('click', () => {
      state.discs.has(key) ? state.discs.delete(key) : state.discs.add(key);
      chip.classList.toggle('active');
      render();
    });
    chips.appendChild(chip);
  }

  // Restore saved profile
  const savedMajor = localStorage.getItem('bp:major') || '';
  const savedYear = localStorage.getItem('bp:gradyear') || '';
  sel.value = savedMajor;
  document.getElementById('year-select').value = savedYear;
  applyProfile(savedMajor, savedYear, false);

  sel.addEventListener('change', () => {
    localStorage.setItem('bp:major', sel.value);
    applyProfile(sel.value, document.getElementById('year-select').value, true);
  });
  document.getElementById('year-select').addEventListener('change', e => {
    localStorage.setItem('bp:gradyear', e.target.value);
    applyProfile(sel.value, e.target.value, true);
  });

  document.querySelectorAll('#level-tabs .tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#level-tabs .tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.level = tab.dataset.level;
      SHOWN = 150;
      render();
    });
  });

  document.getElementById('job-search').addEventListener('input', e => { state.q = e.target.value.toLowerCase(); render(); });
  document.getElementById('days-select').addEventListener('change', e => { state.days = e.target.value; render(); });
  document.getElementById('coop-only').addEventListener('change', e => { state.coop = e.target.checked; render(); });
  document.getElementById('more-btn').addEventListener('click', () => { SHOWN += 150; render(); });

  // Resource links
  const res = document.getElementById('resources');
  for (const r of (CFG.resources || [])) {
    const a = document.createElement('a');
    a.className = 'announcement'; a.href = r.url; a.target = '_blank'; a.rel = 'noopener';
    a.textContent = r.title;
    res.appendChild(a);
  }
}

function applyProfile(major, year, rerender) {
  // Major selects its discipline chip; year picks the level tab.
  state.discs.clear();
  document.querySelectorAll('#disc-chips .chip').forEach(c => c.classList.remove('active'));
  if (major) {
    state.discs.add(major);
    const chip = document.querySelector('#disc-chips .chip[data-disc="' + major + '"]');
    if (chip) chip.classList.add('active');
  }
  if (year) {
    state.level = year === 'freshman' ? 'fresh' : year === 'grad' ? 'newgrad' : 'intern';
    document.querySelectorAll('#level-tabs .tab').forEach(t =>
      t.classList.toggle('active', t.dataset.level === state.level));
  }

  // Pathways box
  const box = document.getElementById('pathways');
  const paths = major ? (CFG.pathways[major] || []) : [];
  box.innerHTML = '';
  if (paths.length) {
    const h = document.createElement('div');
    h.className = 'pathway-title';
    h.textContent = '🗺️ Career pathways for ' + (CFG.disciplines[major] ? CFG.disciplines[major].label : major);
    box.appendChild(h);
    for (const p of paths) {
      const d = document.createElement('div');
      d.className = 'pathway'; d.textContent = p;
      box.appendChild(d);
    }
    box.hidden = false;
  } else {
    box.hidden = true;
  }
  if (rerender) { SHOWN = 150; render(); }
}

function filtered() {
  const now = Date.now();
  return JOBS.filter(j => {
    if (state.level === 'fresh') { if (!j.fresh) return false; }
    else if (j.level !== state.level) return false;
    if (state.coop && !j.coop) return false;
    if (state.discs.size && !j.disc.some(d => state.discs.has(d))) return false;
    if (state.days) {
      if (!j.posted) return false;
      if ((now - new Date(j.posted).getTime()) / 86400000 > +state.days) return false;
    }
    if (state.q) {
      const hay = (j.company + ' ' + j.title + ' ' + j.locs.join(' ')).toLowerCase();
      if (!hay.includes(state.q)) return false;
    }
    return true;
  });
}

function render() {
  const list = document.getElementById('job-list');
  const jobs = filtered();
  document.getElementById('result-count').textContent = jobs.length + ' roles';
  list.innerHTML = '';

  // Freshman tab: always show the evergreen first-year programs list on top —
  // most of these open applications in specific windows and never hit job boards.
  if (state.level === 'fresh') {
    const intro = document.createElement('p');
    intro.className = 'muted';
    intro.textContent = '⭐ Flagship first-year & underrepresented-student programs (apply in their windows):';
    list.appendChild(intro);
    for (const p of (CFG.freshman_programs || [])) {
      const row = document.createElement('a');
      row.className = 'job-row';
      row.href = p.url; row.target = '_blank'; row.rel = 'noopener';
      const main = document.createElement('div');
      main.className = 'job-main';
      const co = document.createElement('span'); co.className = 'job-company'; co.textContent = p.name;
      const ti = document.createElement('span'); ti.className = 'job-title'; ti.textContent = p.for;
      main.appendChild(co); main.appendChild(ti);
      const meta = document.createElement('div'); meta.className = 'job-meta';
      const w = document.createElement('span'); w.className = 'job-badge fresh'; w.textContent = 'Opens ' + p.opens;
      meta.appendChild(w);
      row.appendChild(main); row.appendChild(meta);
      list.appendChild(row);
    }
    if (jobs.length) {
      const h = document.createElement('p');
      h.className = 'muted';
      h.style.marginTop = '0.8rem';
      h.textContent = '📋 Live freshman-friendly postings right now:';
      list.appendChild(h);
    }
  }

  if (jobs.length === 0) {
    document.getElementById('more-btn').hidden = true;
    if (state.level === 'fresh' && (CFG.freshman_programs || []).length) return;
    const p = document.createElement('p');
    p.className = 'muted center';
    p.style.padding = '1.5rem 0';
    p.textContent = JOBS.length === 0
      ? 'No data yet — the weekly pipeline hasn\'t run. An admin can trigger it under the repo\'s Actions tab.'
      : 'No roles match these filters. Try clearing a filter — or check the resources below.';
    list.appendChild(p);
    document.getElementById('more-btn').hidden = true;
    return;
  }

  const now = Date.now();
  for (const j of jobs.slice(0, SHOWN)) {
    const row = document.createElement('a');
    row.className = 'job-row';
    row.href = j.url; row.target = '_blank'; row.rel = 'noopener';

    const main = document.createElement('div');
    main.className = 'job-main';
    const co = document.createElement('span'); co.className = 'job-company'; co.textContent = j.company;
    const ti = document.createElement('span'); ti.className = 'job-title'; ti.textContent = j.title;
    main.appendChild(co); main.appendChild(ti);

    const meta = document.createElement('div');
    meta.className = 'job-meta';
    if (j.posted && (now - new Date(j.posted).getTime()) / 86400000 <= 7) {
      const n = document.createElement('span'); n.className = 'job-badge new'; n.textContent = 'NEW';
      meta.appendChild(n);
    }
    if (j.fresh) { const f = document.createElement('span'); f.className = 'job-badge fresh'; f.textContent = '🌱 First-year friendly'; meta.appendChild(f); }
    if (j.coop) { const c = document.createElement('span'); c.className = 'job-badge'; c.textContent = 'Co-op'; meta.appendChild(c); }
    for (const d of j.disc) {
      const s = document.createElement('span'); s.className = 'job-badge disc'; s.textContent = d; meta.appendChild(s);
    }
    if (j.locs.length) { const l = document.createElement('span'); l.className = 'job-loc'; l.textContent = '📍 ' + j.locs.join(' · '); meta.appendChild(l); }
    if (j.posted) { const p = document.createElement('span'); p.className = 'job-loc'; p.textContent = j.posted; meta.appendChild(p); }

    row.appendChild(main); row.appendChild(meta);
    list.appendChild(row);
  }

  document.getElementById('more-btn').hidden = jobs.length <= SHOWN;
}

function showBanner(msg) {
  const b = document.getElementById('banner');
  b.hidden = false; b.className = 'banner warn'; b.textContent = msg;
}
