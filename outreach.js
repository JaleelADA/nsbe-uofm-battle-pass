/* Companies page — renders data/companies.json (board-curated; open-role
   counts refreshed weekly by the pipeline). Discipline labels come from
   jobs-config.json when available. */

'use strict';

let COMPANIES = [], EVENTS = [], CYCLES = [], DISC_LABELS = {};
const state = { q: '', sectors: new Set(), majors: new Set(), orgs: new Set(), partnerOnly: false, openOnly: false, sort: 'az' };

const STATUS_LABELS = {
  target: 'On our radar',
  contacted: 'In conversation',
  confirmed: 'Active relationship',
  sponsor: 'Chapter sponsor'
};

const MONTHS = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const acadIdx = m => (m + 5) % 12; // calendar month (1-12) -> academic column (Jul=0)

document.addEventListener('DOMContentLoaded', boot);

function initTheme() {
  document.getElementById('theme-toggle').addEventListener('click', () => {
    const cur = document.documentElement.dataset.ptheme ||
      (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.ptheme = next;
    localStorage.setItem('bp:ptheme', next);
  });
}

async function boot() {
  initTheme();
  let doc;
  try {
    const [coRes, cfgRes] = await Promise.all([
      fetch('data/companies.json?cb=' + Date.now()),
      fetch('jobs-config.json?cb=' + Date.now())
    ]);
    doc = await coRes.json();
    try {
      const cfg = await cfgRes.json();
      for (const [k, d] of Object.entries(cfg.disciplines || {})) DISC_LABELS[k] = d.label;
    } catch (e) { /* labels are a nice-to-have */ }
  } catch (e) {
    document.getElementById('company-grid').textContent = 'Could not load data/companies.json.';
    return;
  }
  COMPANIES = doc.companies || [];
  EVENTS = doc.events || [];
  CYCLES = doc.recruiting_cycles || [];

  const partners = COMPANIES.filter(c => c.partner).length;
  const withRoles = COMPANIES.filter(c => (c.open_student_roles || 0) > 0).length;
  document.getElementById('hub-stats').innerHTML =
    '<strong>' + COMPANIES.length + '</strong> employers tracked · <strong>' + partners +
    '</strong> NSBE partners · <strong>' + withRoles + '</strong> with open student roles right now';

  buildFilters();
  renderEvents();
  renderCycles();
  render();
}

/* ----------------------------------------------------------- filters -- */

function countBy(fn) {
  const m = new Map();
  for (const c of COMPANIES) for (const v of (fn(c) || [])) m.set(v, (m.get(v) || 0) + 1);
  return m;
}

function buildChips(boxId, counts, set, labelFn) {
  const box = document.getElementById(boxId);
  const entries = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  for (const [v, n] of entries) {
    const chip = document.createElement('button');
    chip.className = 'fchip';
    chip.innerHTML = (labelFn ? labelFn(v) : v) + ' <span class="fchip-n">' + n + '</span>';
    chip.setAttribute('aria-pressed', 'false');
    chip.addEventListener('click', () => {
      set.has(v) ? set.delete(v) : set.add(v);
      const on = set.has(v);
      chip.classList.toggle('active', on);
      chip.setAttribute('aria-pressed', String(on));
      render();
    });
    box.appendChild(chip);
  }
}

function buildFilters() {
  buildChips('major-chips', countBy(c => c.majors), state.majors, v => DISC_LABELS[v] || v);
  buildChips('sector-chips', countBy(c => c.sectors), state.sectors);
  buildChips('org-chips', countBy(c => c.orgs), state.orgs);

  document.getElementById('co-search').addEventListener('input', e => { state.q = e.target.value.toLowerCase(); render(); });
  document.getElementById('co-sort').addEventListener('change', e => { state.sort = e.target.value; render(); });
  document.getElementById('partner-only').addEventListener('change', e => { state.partnerOnly = e.target.checked; render(); });
  document.getElementById('open-only').addEventListener('change', e => { state.openOnly = e.target.checked; render(); });
  document.getElementById('co-clear').addEventListener('click', () => {
    state.q = ''; state.sectors.clear(); state.majors.clear(); state.orgs.clear();
    state.partnerOnly = state.openOnly = false;
    document.getElementById('co-search').value = '';
    document.getElementById('partner-only').checked = false;
    document.getElementById('open-only').checked = false;
    document.querySelectorAll('.fchip').forEach(ch => { ch.classList.remove('active'); ch.setAttribute('aria-pressed', 'false'); });
    render();
  });
}

/* ------------------------------------------------------------ events -- */

function renderEvents() {
  const box = document.getElementById('events');
  if (!EVENTS.length) {
    box.innerHTML = '<p class="pmuted">No events listed yet — the board adds them in data/companies.json.</p>';
    return;
  }
  for (const e of EVENTS) {
    const a = document.createElement('a');
    a.className = 'event-row';
    a.href = e.url || '#'; a.target = '_blank'; a.rel = 'noopener';
    const when = document.createElement('div');
    when.className = 'event-when'; when.textContent = e.when || 'TBD';
    a.appendChild(when);
    const body = document.createElement('div');
    const t = document.createElement('div'); t.className = 'event-t'; t.textContent = e.title;
    body.appendChild(t);
    if (e.note) { const n = document.createElement('div'); n.className = 'event-n'; n.textContent = e.note; body.appendChild(n); }
    a.appendChild(body);
    box.appendChild(a);
  }
}

/* ------------------------------------------------------------ cycles -- */

function renderCycles() {
  if (!CYCLES.length) return;
  document.getElementById('cycles-section').hidden = false;
  const grid = document.getElementById('cycle-grid');

  grid.appendChild(document.createElement('div')); // corner
  for (const m of MONTHS) {
    const h = document.createElement('div');
    h.className = 'cy-head'; h.textContent = m;
    grid.appendChild(h);
  }

  const tips = document.getElementById('cycle-tips');
  for (const cy of CYCLES) {
    const label = document.createElement('div');
    label.className = 'cy-label'; label.textContent = cy.industry;
    if (cy.tip) label.title = cy.tip;
    grid.appendChild(label);

    // A window may wrap the academic-year axis (e.g. consulting: Mar–Sep).
    const inSpan = (i, from, to) => from <= to ? (i >= from && i <= to) : (i >= from || i <= to);
    const a = acadIdx(cy.opens), b = acadIdx(cy.closes);
    const pa = cy.peak_opens ? acadIdx(cy.peak_opens) : -1;
    const pb = cy.peak_closes ? acadIdx(cy.peak_closes) : -1;
    for (let i = 0; i < 12; i++) {
      const cell = document.createElement('div');
      cell.className = 'cy-cell';
      if (inSpan(i, a, b)) {
        cell.classList.add('on');
        if (i === a) cell.classList.add('start');
        if (i === b) cell.classList.add('end');
        if (pa >= 0 && inSpan(i, pa, pb)) cell.classList.add('peak');
      }
      if (cy.tip) cell.title = cy.industry + ': ' + cy.tip;
      grid.appendChild(cell);
    }

    if (cy.tip) {
      const t = document.createElement('div');
      t.className = 'cycle-tip';
      t.innerHTML = '<strong>' + cy.industry + ':</strong> ' + cy.tip;
      tips.appendChild(t);
    }
  }
}

/* ------------------------------------------------------------- cards -- */

function render() {
  const grid = document.getElementById('company-grid');
  grid.innerHTML = '';
  let rows = COMPANIES.filter(c => {
    if (state.partnerOnly && !c.partner) return false;
    if (state.openOnly && !((c.open_student_roles || 0) > 0)) return false;
    if (state.sectors.size && !(c.sectors || []).some(s => state.sectors.has(s))) return false;
    if (state.majors.size && !(c.majors || []).some(m => state.majors.has(m))) return false;
    if (state.orgs.size && !(c.orgs || []).some(o => state.orgs.has(o))) return false;
    if (state.q) {
      const hay = (c.name + ' ' + (c.sectors || []).join(' ') + ' ' + (c.notes || '')).toLowerCase();
      if (!hay.includes(state.q)) return false;
    }
    return true;
  });

  rows = state.sort === 'roles'
    ? rows.slice().sort((a, b) => (b.open_student_roles || 0) - (a.open_student_roles || 0) || a.name.localeCompare(b.name))
    : rows.slice().sort((a, b) => a.name.localeCompare(b.name));

  document.getElementById('company-count').innerHTML =
    '<strong>' + rows.length + '</strong> compan' + (rows.length === 1 ? 'y' : 'ies');

  for (const c of rows) grid.appendChild(companyCard(c));

  if (rows.length === 0) {
    const e = document.createElement('div');
    e.className = 'empty-state';
    e.style.gridColumn = '1 / -1';
    e.textContent = 'No companies match these filters.';
    grid.appendChild(e);
  }
}

function companyCard(c) {
  const card = document.createElement('div');
  card.className = 'co-card';

  const head = document.createElement('div');
  head.className = 'co-head';
  const name = document.createElement('a');
  name.className = 'co-name'; name.textContent = c.name;
  name.href = c.careers || '#'; name.target = '_blank'; name.rel = 'noopener';
  head.appendChild(name);
  if (c.partner) {
    const b = document.createElement('span');
    b.className = 'pill partner'; b.textContent = 'NSBE partner';
    head.appendChild(b);
  }
  card.appendChild(head);

  if ((c.sectors || []).length) {
    const s = document.createElement('div');
    s.className = 'co-sector'; s.textContent = c.sectors.join(' · ');
    card.appendChild(s);
  }

  if ((c.majors || []).length) {
    const chips = document.createElement('div');
    chips.className = 'co-chips';
    for (const m of c.majors) {
      const p = document.createElement('span');
      p.className = 'pill disc'; p.textContent = m;
      p.title = DISC_LABELS[m] || m;
      chips.appendChild(p);
    }
    card.appendChild(chips);
  }

  if ((c.orgs || []).length) {
    const line = document.createElement('div');
    line.className = 'co-line';
    line.innerHTML = '<span class="co-line-label">Recruits through:</span> ' + c.orgs.join(' · ');
    card.appendChild(line);
  }

  if (c.notes) {
    const n = document.createElement('div');
    n.className = 'co-notes'; n.textContent = c.notes;
    card.appendChild(n);
  }

  const foot = document.createElement('div');
  foot.className = 'co-foot';

  const status = document.createElement('span');
  status.className = 'status-pill s-' + (c.status || 'target');
  status.textContent = STATUS_LABELS[c.status] || c.status || '';
  status.title = 'Chapter outreach status (board-curated)';
  foot.appendChild(status);

  const n = c.open_student_roles;
  if (typeof n === 'number' && n > 0) {
    const roles = document.createElement('a');
    roles.className = 'co-roles';
    roles.textContent = n + ' open student role' + (n === 1 ? '' : 's') + ' →';
    roles.href = 'careers.html?q=' + encodeURIComponent(c.name);
    roles.title = c.roles_checked ? 'From the public job feed as of ' + c.roles_checked : '';
    foot.appendChild(roles);
  } else if (typeof n === 'number') {
    const roles = document.createElement('span');
    roles.className = 'co-roles zero';
    roles.textContent = 'No student roles in feed';
    roles.title = c.roles_checked ? 'As of ' + c.roles_checked : '';
    foot.appendChild(roles);
  }

  const go = document.createElement('a');
  go.className = 'pbtn ghost'; go.textContent = 'Careers ↗';
  go.href = c.careers || '#'; go.target = '_blank'; go.rel = 'noopener';
  foot.appendChild(go);

  card.appendChild(foot);
  return card;
}
