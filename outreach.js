/* Company Hub — renders data/companies.json (board-curated; open-role counts
   refreshed weekly by the pipeline). */

'use strict';

let COMPANIES = [], EVENTS = [];
const state = { q: '', sectors: new Set(), majors: new Set(), partnerOnly: false };

const STATUS_LABELS = { target: '🎯 Target', contacted: '✉️ Contacted', confirmed: '🤝 Confirmed', sponsor: '⭐ Sponsor' };

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('data/companies.json?cb=' + Date.now());
    const doc = await res.json();
    COMPANIES = doc.companies || [];
    EVENTS = doc.events || [];
  } catch (e) {
    document.getElementById('company-grid').textContent = 'Could not load data/companies.json.';
    return;
  }

  const partners = COMPANIES.filter(c => c.partner).length;
  document.getElementById('hub-stats').textContent =
    COMPANIES.length + ' companies tracked · ' + partners + ' NSBE partners';

  // Events
  const ev = document.getElementById('events');
  for (const e of EVENTS) {
    const a = document.createElement('a');
    a.className = 'announcement';
    a.href = e.url || '#'; a.target = '_blank'; a.rel = 'noopener';
    a.textContent = '📅 ' + e.title + ' — ' + (e.when || 'TBD') + (e.note ? ' · ' + e.note : '');
    ev.appendChild(a);
  }
  if (EVENTS.length === 0) ev.innerHTML = '<p class="muted">No events listed yet — the board adds them in data/companies.json.</p>';

  // Filter chips
  const sectors = [...new Set(COMPANIES.flatMap(c => c.sectors || []))].sort();
  const majors = [...new Set(COMPANIES.flatMap(c => c.majors || []))].sort();
  buildChips('sector-chips', sectors, state.sectors);
  buildChips('major-chips', majors, state.majors);

  document.getElementById('co-search').addEventListener('input', e => { state.q = e.target.value.toLowerCase(); render(); });
  document.getElementById('partner-only').addEventListener('change', e => { state.partnerOnly = e.target.checked; render(); });

  render();
});

function buildChips(boxId, values, set) {
  const box = document.getElementById(boxId);
  for (const v of values) {
    const chip = document.createElement('button');
    chip.className = 'chip'; chip.textContent = v;
    chip.addEventListener('click', () => {
      set.has(v) ? set.delete(v) : set.add(v);
      chip.classList.toggle('active');
      render();
    });
    box.appendChild(chip);
  }
}

function render() {
  const grid = document.getElementById('company-grid');
  grid.innerHTML = '';
  const rows = COMPANIES.filter(c => {
    if (state.partnerOnly && !c.partner) return false;
    if (state.sectors.size && !(c.sectors || []).some(s => state.sectors.has(s))) return false;
    if (state.majors.size && !(c.majors || []).some(m => state.majors.has(m))) return false;
    if (state.q && !(c.name + ' ' + (c.notes || '')).toLowerCase().includes(state.q)) return false;
    return true;
  });
  document.getElementById('company-count').textContent = rows.length + ' companies';

  for (const c of rows) {
    const card = document.createElement('div');
    card.className = 'company-card' + (c.partner ? ' partner' : '');

    const head = document.createElement('div');
    head.className = 'company-head';
    const name = document.createElement('a');
    name.className = 'company-name';
    name.textContent = c.name;
    name.href = c.careers || '#'; name.target = '_blank'; name.rel = 'noopener';
    head.appendChild(name);
    if (c.partner) {
      const b = document.createElement('span'); b.className = 'job-badge fresh'; b.textContent = 'NSBE Partner';
      head.appendChild(b);
    }
    card.appendChild(head);

    const meta = document.createElement('div');
    meta.className = 'job-meta';
    for (const s of (c.sectors || [])) { const t = document.createElement('span'); t.className = 'job-badge'; t.textContent = s; meta.appendChild(t); }
    for (const m of (c.majors || [])) { const t = document.createElement('span'); t.className = 'job-badge disc'; t.textContent = m; meta.appendChild(t); }
    card.appendChild(meta);

    if ((c.orgs || []).length) {
      const orgs = document.createElement('div');
      orgs.className = 'muted company-orgs';
      orgs.textContent = '🤝 Recruits via: ' + c.orgs.join(', ');
      card.appendChild(orgs);
    }
    if (c.notes) {
      const n = document.createElement('div'); n.className = 'muted company-notes'; n.textContent = c.notes;
      card.appendChild(n);
    }

    const foot = document.createElement('div');
    foot.className = 'company-foot';
    const status = document.createElement('span');
    status.className = 'job-badge status-' + (c.status || 'target');
    status.textContent = STATUS_LABELS[c.status] || c.status || '';
    foot.appendChild(status);
    if (typeof c.open_student_roles === 'number') {
      const roles = document.createElement('span');
      roles.className = 'muted';
      roles.textContent = c.open_student_roles + ' open student roles' + (c.roles_checked ? ' (as of ' + c.roles_checked + ')' : '');
      foot.appendChild(roles);
    }
    card.appendChild(foot);
    grid.appendChild(card);
  }

  if (rows.length === 0) grid.innerHTML = '<p class="muted center" style="padding:1.5rem">No companies match.</p>';
}
