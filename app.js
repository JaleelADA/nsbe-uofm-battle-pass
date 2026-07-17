/* =========================================================================
   NSBE UM Battle Pass — app.js
   -------------------------------------------------------------------------
   Plain JavaScript, no frameworks, no build step. Everything a future board
   needs to change lives in config.json — you should never need to edit this
   file for a new semester.

   How data flows:
     Google Form (members sign in at events)
       -> Google Sheet ("Form Responses" tab)
       -> this page fetches the sheet (shared link or Apps Script URL)
       -> points, tiers, and badges are calculated right here in the browser.
   ========================================================================= */

'use strict';

let CONFIG = null;      // contents of config.json
let MEMBERS = [];       // computed member stats, sorted by points (desc)
let PAID_SET = new Set(); // lowercase uniqnames of paid members

/* ---------------------------------------------------------------- boot -- */

document.addEventListener('DOMContentLoaded', boot);

async function boot() {
  try {
    const res = await fetch('config.json?cb=' + Date.now());
    CONFIG = await res.json();
  } catch (err) {
    showBanner('error',
      'config.json could not be read. It may have a typo (a missing comma or quote). ' +
      'Open it on GitHub, compare with the example in SETUP.md, and fix the last edit.');
    return;
  }

  renderStaticSections();

  const url = (CONFIG.signInDataUrl || '').trim();
  if (!url || url.toUpperCase().includes('PASTE')) {
    showSetupNeeded();
    return;
  }

  await loadData();
}

async function loadData() {
  const board = document.getElementById('leaderboard-body');
  board.innerHTML = '<tr><td colspan="5" class="muted center">Loading sign-in data…</td></tr>';

  try {
    const [signIns, paid] = await Promise.all([
      fetchRows(CONFIG.signInDataUrl),
      CONFIG.paidMembersUrl ? fetchRows(CONFIG.paidMembersUrl).catch(err => {
        console.warn('Paid members sheet could not be read:', err);
        showBanner('warn',
          'The paid-members sheet could not be read, so everyone is scored as unpaid for now. ' +
          'Check that the sheet is shared as “Anyone with the link → Viewer”.');
        return [];
      }) : Promise.resolve([])
    ]);

    PAID_SET = buildPaidSet(paid);
    MEMBERS = computeStats(signIns);
    renderLeaderboard();
    renderLastUpdated();
  } catch (err) {
    console.error(err);
    board.innerHTML = '';
    showBanner('error',
      'Could not read the sign-in data. Most common fix: open the Google Sheet → Share → ' +
      'set “Anyone with the link” to “Viewer”. (Details for admins: ' + err.message + ')');
  }
}

/* ------------------------------------------------------- data fetching -- */

/**
 * Accepts any of:
 *  - a Google Sheet link (docs.google.com/spreadsheets/...) shared as
 *    "Anyone with the link: Viewer"  -> fetched as CSV
 *  - a Google Apps Script web-app URL (script.google.com/.../exec)
 *    returning JSON               -> the privacy-friendly option
 *  - any other URL ending in .csv or .json
 * Returns an array of row objects keyed by column header.
 */
async function fetchRows(url) {
  const src = resolveDataUrl(url);
  const res = await fetch(src.url + (src.url.includes('?') ? '&' : '?') + 'cb=' + Date.now());
  if (!res.ok) throw new Error('HTTP ' + res.status + ' from data source');

  if (src.kind === 'json') {
    const data = await res.json();
    if (Array.isArray(data)) return data;                    // [{...}, {...}]
    if (data && Array.isArray(data.values)) return valuesToObjects(data.values);
    throw new Error('Unrecognized JSON from data source');
  }

  const text = await res.text();
  if (text.trimStart().startsWith('<')) {
    throw new Error('Got a login page instead of data — the sheet is not shared publicly');
  }
  return valuesToObjects(parseCSV(text));
}

function resolveDataUrl(url) {
  if (/script\.google(usercontent)?\.com/.test(url)) return { url, kind: 'json' };

  const sheet = url.match(/docs\.google\.com\/spreadsheets\/d\/([\w-]+)/);
  if (sheet) {
    const gid = (url.match(/[#?&]gid=(\d+)/) || [])[1];
    return {
      url: 'https://docs.google.com/spreadsheets/d/' + sheet[1] +
           '/gviz/tq?tqx=out:csv' + (gid ? '&gid=' + gid : ''),
      kind: 'csv'
    };
  }

  return { url, kind: /\.json(\?|$)/.test(url) ? 'json' : 'csv' };
}

/** Minimal CSV parser that handles quoted fields, "" escapes, and newlines in cells. */
function parseCSV(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field); field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some(f => f.trim() !== '')) rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  row.push(field);
  if (row.some(f => f.trim() !== '')) rows.push(row);
  return rows;
}

/** Turns [[header,...], [cell,...], ...] into [{header: cell, ...}, ...]. */
function valuesToObjects(values) {
  if (!values || values.length === 0) return [];
  const headers = values[0].map(h => String(h || '').trim());
  return values.slice(1).map(rowArr => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = String(rowArr[i] == null ? '' : rowArr[i]).trim(); });
    return obj;
  });
}

/* ----------------------------------------------- row field extraction -- */

/** Finds the first column whose header passes `test` (case-insensitive). */
function findColumn(row, test) {
  for (const key of Object.keys(row)) {
    if (test(key.toLowerCase())) return row[key];
  }
  return '';
}

function extractSignIn(row) {
  let uniqname = findColumn(row, h => h.includes('uniqname'));
  const email  = findColumn(row, h => h.includes('email'));
  if (!uniqname && email.includes('@')) uniqname = email.split('@')[0];
  uniqname = cleanUniqname(uniqname);

  const rawEvent = findColumn(row, h => h.includes('event'));
  const timestamp = findColumn(row, h => h.includes('timestamp') || h === 'date');

  const friendYes = findColumn(row, h => h.includes('friend'));
  const friendNum = parseInt(findColumn(row, h => h.includes('how many')), 10) || 0;
  const broughtFriend = /^y/i.test(friendYes.trim()) && friendNum > 0;

  return { uniqname, rawEvent, date: parseDate(timestamp), broughtFriend, friendCount: friendNum };
}

function cleanUniqname(value) {
  let v = String(value || '').trim().toLowerCase();
  if (v.includes('@')) v = v.split('@')[0];
  return v.replace(/[^a-z0-9]/g, '');
}

/** Handles "9/26/2025", "9/26/2025 14:03:11", and ISO dates. Returns Date or null. */
function parseDate(value) {
  const s = String(value || '').trim();
  if (!s) return null;
  const mdy = s.split(/[\s,]+/)[0].match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mdy) return new Date(+mdy[3], +mdy[1] - 1, +mdy[2]);
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

/* -------------------------------------------------- event categorizing -- */

/**
 * Maps whatever was typed in the form ("GBM #2", "2", "Study Jamz") to a
 * category from config.json. Matching order: exact numeric code, then
 * keywords. Unknown events land in "Other".
 */
function categorize(rawEvent) {
  const raw = String(rawEvent || '').trim().toLowerCase();
  if (!raw) return 'Other';

  for (const [name, def] of Object.entries(CONFIG.eventTypes)) {
    if (def.code && raw === String(def.code)) return name;
  }
  for (const [name, def] of Object.entries(CONFIG.eventTypes)) {
    for (const kw of (def.keywords || [])) {
      const k = kw.toLowerCase();
      // Short keywords ("pd") must match as whole words so "pd" never
      // matches inside an unrelated word; longer ones may match anywhere.
      const hit = k.length < 4
        ? new RegExp('\\b' + k.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&') + '\\b').test(raw)
        : raw.includes(k);
      if (hit) return name;
    }
  }
  return 'Other';
}

function pointsFor(category) {
  const def = CONFIG.eventTypes[category];
  return def ? def.points : (CONFIG.otherEventPoints || 0);
}

/* ------------------------------------------------------- computing stats -- */

function buildPaidSet(rows) {
  const set = new Set();
  for (const row of rows) {
    // Take any cell that looks like an email, plus any "uniqname" column.
    for (const [key, value] of Object.entries(row)) {
      const v = String(value || '').trim();
      if (v.includes('@')) set.add(cleanUniqname(v));
      else if (key.toLowerCase().includes('uniqname') && v) set.add(cleanUniqname(v));
    }
  }
  set.delete('');
  return set;
}

function computeStats(rows) {
  const cutoff = CONFIG.countPointsFrom ? new Date(CONFIG.countPointsFrom) : null;
  const seen = new Set();       // dedupe: one credit per person/event/day
  const members = new Map();

  for (const row of rows) {
    const entry = extractSignIn(row);
    if (!entry.uniqname) continue;

    // Rows before the season start date are ignored (old-semester data).
    // Rows with no readable date are counted, matching previous behavior.
    if (cutoff && entry.date && entry.date < cutoff) continue;

    const category = categorize(entry.rawEvent);
    const dayKey = entry.date ? entry.date.toISOString().slice(0, 10) : 'undated-' + seen.size;
    const dedupeKey = entry.uniqname + '|' + dayKey + '|' + category;
    if (entry.date && seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    let m = members.get(entry.uniqname);
    if (!m) {
      m = { uniqname: entry.uniqname, points: 0, totalEvents: 0, counts: {}, events: [] };
      members.set(entry.uniqname, m);
    }

    const isPaid = PAID_SET.has(entry.uniqname);
    let pts = pointsFor(category);
    if (!isPaid && CONFIG.unpaidPointsCap != null) pts = Math.min(pts, CONFIG.unpaidPointsCap);

    if (entry.broughtFriend && CONFIG.bonuses) {
      pts += (CONFIG.bonuses.broughtFriendFirst || 0) +
             Math.max(0, entry.friendCount - 1) * (CONFIG.bonuses.broughtFriendAdditional || 0);
    }

    m.points += pts;
    m.totalEvents += 1;
    m.counts[category] = (m.counts[category] || 0) + 1;
    m.events.push({ category, date: entry.date, points: pts });
  }

  const list = [...members.values()].sort((a, b) => b.points - a.points);

  // Competition ranking (ties share a rank) + quartile tiers.
  list.forEach((m, i) => {
    m.rank = (i > 0 && m.points === list[i - 1].points) ? list[i - 1].rank : i + 1;
    m.tier = tierFor(m.rank, list.length, m.points);
  });
  return list;
}

function tierFor(rank, total, points) {
  const tiers = CONFIG.tiers;
  if (points <= 0 || total === 0) return tiers[tiers.length - 1];
  const pct = (rank - 1) / total;
  if (pct < 0.25) return tiers[0];
  if (pct < 0.50) return tiers[1];
  if (pct < 0.75) return tiers[2];
  return tiers[3];
}

/* -------------------------------------------------------------- badges -- */

/** Returns { earned: bool, progress: 0..1, current, target } for a member. */
function badgeProgress(badge, member) {
  let current = 0, target = badge.count || 1;
  if (badge.type === 'paid') {
    current = PAID_SET.has(member.uniqname) ? 1 : 0;
  } else if (badge.type === 'category') {
    current = member.counts[badge.category] || 0;
  } else if (badge.type === 'total') {
    current = member.totalEvents;
  } else if (badge.type === 'variety') {
    current = Object.keys(member.counts).length;
  }
  return { earned: current >= target, progress: Math.min(1, current / target), current, target };
}

/* ----------------------------------------------------------- rendering -- */

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function renderStaticSections() {
  document.getElementById('season-label').textContent = CONFIG.season || '';
  document.title = 'NSBE UM Battle Pass — ' + (CONFIG.season || '');

  // Header buttons
  const nav = document.getElementById('header-links');
  nav.innerHTML = '';
  const links = CONFIG.links || {};
  if (links.signInForm)  nav.appendChild(linkButton('📝 Sign In to Event', links.signInForm, 'btn primary'));
  if (links.chapterSite) nav.appendChild(linkButton('🌐 Chapter Site', links.chapterSite, 'btn'));
  if (links.linktree)    nav.appendChild(linkButton('🔗 Linktree', links.linktree, 'btn'));

  // Point system table
  const tbody = document.getElementById('points-body');
  tbody.innerHTML = '';
  for (const [name, def] of Object.entries(CONFIG.eventTypes)) {
    const tr = el('tr');
    tr.appendChild(el('td', null, (def.icon ? def.icon + ' ' : '') + (def.label || name)));
    tr.appendChild(el('td', 'points-cell', '+' + def.points + ' pts'));
    tbody.appendChild(tr);
  }

  // Tier cards
  const tiersBox = document.getElementById('tier-cards');
  tiersBox.innerHTML = '';
  for (const t of CONFIG.tiers) {
    const card = el('div', 'tier-card tier-' + t.name.toLowerCase());
    card.appendChild(el('div', 'tier-icon', t.icon));
    card.appendChild(el('div', 'tier-name', t.name));
    card.appendChild(el('div', 'tier-range', t.range));
    card.appendChild(el('div', 'tier-desc', t.desc));
    tiersBox.appendChild(card);
  }

  // Badge gallery
  const badgeBox = document.getElementById('badge-gallery');
  badgeBox.innerHTML = '';
  for (const b of CONFIG.badges) {
    const card = el('div', 'badge-card');
    card.appendChild(el('div', 'badge-icon', b.icon));
    card.appendChild(el('div', 'badge-name', b.name));
    card.appendChild(el('div', 'badge-desc', b.desc));
    badgeBox.appendChild(card);
  }

  // Announcements
  const annBox = document.getElementById('announcements');
  annBox.innerHTML = '';
  for (const a of (CONFIG.announcements || [])) {
    const link = el('a', 'announcement');
    link.href = a.url; link.target = '_blank'; link.rel = 'noopener';
    link.textContent = a.title;
    annBox.appendChild(link);
  }

  // Footer contacts
  const foot = document.getElementById('footer-links');
  foot.innerHTML = '';
  if (links.email)     foot.appendChild(footerLink('📧 ' + links.email, 'mailto:' + links.email));
  if (links.instagram) foot.appendChild(footerLink('📸 Instagram', links.instagram));
  if (links.payDues)   foot.appendChild(footerLink('💳 Pay Dues', links.payDues));
  if (links.chapterSite) foot.appendChild(footerLink('🌐 NSBEUM Chapter Site', links.chapterSite));

  // Lookup wiring
  const input = document.getElementById('lookup-input');
  document.getElementById('lookup-btn').addEventListener('click', () => showMember(input.value));
  input.addEventListener('keydown', e => { if (e.key === 'Enter') showMember(input.value); });
  document.getElementById('refresh-btn').addEventListener('click', loadData);
}

function linkButton(text, href, cls) {
  const a = el('a', cls, text);
  a.href = href; a.target = '_blank'; a.rel = 'noopener';
  return a;
}

function footerLink(text, href) {
  const a = el('a', null, text);
  a.href = href; a.target = '_blank'; a.rel = 'noopener';
  return a;
}

function renderLeaderboard() {
  const tbody = document.getElementById('leaderboard-body');
  tbody.innerHTML = '';

  if (MEMBERS.length === 0) {
    const tr = el('tr');
    const td = el('td', 'muted center');
    td.colSpan = 5;
    td.innerHTML = 'No sign-ins yet this semester — be the first! ';
    if (CONFIG.links && CONFIG.links.signInForm) {
      const a = el('a', null, 'Sign in at an event →');
      a.href = CONFIG.links.signInForm; a.target = '_blank'; a.rel = 'noopener';
      td.appendChild(a);
    }
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  const showAll = document.getElementById('leaderboard-section').dataset.showAll === '1';
  const rows = showAll ? MEMBERS : MEMBERS.slice(0, 10);

  for (const m of rows) {
    const tr = el('tr');
    tr.appendChild(el('td', 'rank-cell', '#' + m.rank));
    tr.appendChild(el('td', 'tier-cell', m.tier.icon + ' ' + m.tier.name));
    tr.appendChild(el('td', 'uniq-cell', m.uniqname));
    tr.appendChild(el('td', 'center', String(m.totalEvents)));
    tr.appendChild(el('td', 'points-cell', String(m.points)));
    tr.addEventListener('click', () => showMember(m.uniqname));
    tbody.appendChild(tr);
  }

  const toggle = document.getElementById('leaderboard-toggle');
  if (MEMBERS.length > 10) {
    toggle.hidden = false;
    toggle.textContent = showAll ? 'Show top 10' : 'Show all ' + MEMBERS.length + ' members';
    toggle.onclick = () => {
      document.getElementById('leaderboard-section').dataset.showAll = showAll ? '0' : '1';
      renderLeaderboard();
    };
  } else {
    toggle.hidden = true;
  }
}

function showMember(value) {
  const uniqname = cleanUniqname(value);
  const box = document.getElementById('member-card');
  box.hidden = false;
  box.innerHTML = '';

  if (!uniqname) {
    box.appendChild(el('p', 'muted', 'Type your uniqname above to see your progress.'));
    return;
  }

  const m = MEMBERS.find(x => x.uniqname === uniqname);
  if (!m) {
    box.appendChild(el('p', 'muted',
      'No sign-ins found for “' + uniqname + '” this semester yet. ' +
      'Sign in at your next event and check back!'));
    return;
  }

  const head = el('div', 'member-head');
  head.appendChild(el('div', 'member-name', m.uniqname));
  const chip = el('div', 'tier-chip tier-' + m.tier.name.toLowerCase(),
    m.tier.icon + ' ' + m.tier.name + ' · Rank #' + m.rank + ' of ' + MEMBERS.length);
  head.appendChild(chip);
  box.appendChild(head);

  const stats = el('div', 'member-stats');
  stats.appendChild(statTile(String(m.points), 'points'));
  stats.appendChild(statTile(String(m.totalEvents), 'events attended'));
  stats.appendChild(statTile(PAID_SET.has(m.uniqname) ? '💎 Paid' : '—', 'membership'));
  box.appendChild(stats);

  // Per-category attendance
  const cats = el('div', 'member-cats');
  for (const [cat, count] of Object.entries(m.counts)) {
    const def = CONFIG.eventTypes[cat] || {};
    cats.appendChild(el('span', 'cat-chip', (def.icon ? def.icon + ' ' : '') + cat + ' ×' + count));
  }
  box.appendChild(cats);

  // Badges with progress
  const grid = el('div', 'member-badges');
  for (const b of CONFIG.badges) {
    const p = badgeProgress(b, m);
    const card = el('div', 'badge-card' + (p.earned ? ' earned' : ''));
    card.appendChild(el('div', 'badge-icon', b.icon));
    card.appendChild(el('div', 'badge-name', b.name));
    card.appendChild(el('div', 'badge-desc', b.desc));
    if (!p.earned) {
      const bar = el('div', 'progress');
      const fill = el('div', 'progress-fill');
      fill.style.width = Math.round(p.progress * 100) + '%';
      bar.appendChild(fill);
      card.appendChild(bar);
      card.appendChild(el('div', 'progress-label', p.current + ' / ' + p.target));
    }
    grid.appendChild(card);
  }
  box.appendChild(el('h3', 'member-badges-title', 'Badges'));
  box.appendChild(grid);

  box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function statTile(big, label) {
  const tile = el('div', 'stat-tile');
  tile.appendChild(el('div', 'stat-big', big));
  tile.appendChild(el('div', 'stat-label', label));
  return tile;
}

function renderLastUpdated() {
  document.getElementById('last-updated').textContent =
    'Data loaded ' + new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

/* --------------------------------------------------------- banners etc -- */

function showBanner(kind, message) {
  const box = document.getElementById('banner');
  box.hidden = false;
  box.className = 'banner ' + kind;
  box.textContent = message;
}

function showSetupNeeded() {
  const box = document.getElementById('setup-panel');
  box.hidden = true;
  box.hidden = false;
  document.getElementById('leaderboard-body').innerHTML =
    '<tr><td colspan="5" class="muted center">Waiting for setup…</td></tr>';
}
