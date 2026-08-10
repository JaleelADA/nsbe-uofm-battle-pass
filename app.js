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

   Nice-to-know: the page remembers the visitor's uniqname, celebrates newly
   earned badges with confetti, and can generate a shareable "battle card"
   image — all client-side, nothing is ever uploaded anywhere.
   ========================================================================= */

'use strict';

let CONFIG = null;        // contents of config.json
let MEMBERS = [];         // computed member stats, sorted by points (desc)
let PAID_SET = new Set(); // lowercase uniqnames of paid members
let TOTAL_SIGNINS = 0;    // counted sign-ins this semester
let EVENTS_HELD = 0;      // distinct event days this semester

const STORE = {           // localStorage keys (per-device personalization)
  uniqname: 'bp:uniqname',
  badges: 'bp:badges:',   // + uniqname -> JSON array of earned badge ids
  snapshot: 'bp:snap:'    // + uniqname -> JSON {points, rank, at}
};

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
  renderSkeleton();

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
    renderSeasonPulse();
    renderLeaderboard();
    renderLastUpdated();

    // Welcome back: auto-show the saved member's card, and bring their row
    // into view — outside the top 10 they'd otherwise have to hunt for it.
    const saved = localStorage.getItem(STORE.uniqname);
    if (saved && MEMBERS.some(m => m.uniqname === saved)) {
      document.getElementById('lookup-input').value = saved;
      showMember(saved, { auto: true });
      revealYourRow(saved);
    }
  } catch (err) {
    console.error(err);
    document.getElementById('leaderboard-body').innerHTML = '';
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
  const eventDays = new Set();  // distinct day+category -> "events held"
  const members = new Map();
  TOTAL_SIGNINS = 0;

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
    if (entry.date) eventDays.add(dayKey + '|' + category);
    TOTAL_SIGNINS++;

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

  EVENTS_HELD = eventDays.size;
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

/** Makes a non-button element behave like one: mouse, keyboard, and AT.
    Leaderboard rows and podium spots open a member card, so they need to be
    focusable and Enter/Space activated, not just clickable. */
function makeActivatable(node, uniqname, label) {
  node.tabIndex = 0;
  node.setAttribute('role', 'button');
  node.setAttribute('aria-label', label);
  node.addEventListener('click', () => showMember(uniqname));
  node.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      showMember(uniqname);
    }
  });
}

function renderStaticSections() {
  document.getElementById('season-label').textContent = CONFIG.season || '';
  document.title = 'NSBE UM Battle Pass — ' + (CONFIG.season || '');

  // Header buttons
  const nav = document.getElementById('header-links');
  nav.innerHTML = '';
  const links = CONFIG.links || {};
  if (links.signInForm)  nav.appendChild(linkButton('📝 Sign In to Event', links.signInForm, 'btn primary'));
  const careersBtn = el('a', 'btn', '💼 Jobs'); careersBtn.href = 'careers.html';
  nav.appendChild(careersBtn);
  const hubBtn = el('a', 'btn', '🏢 Companies'); hubBtn.href = 'outreach.html';
  nav.appendChild(hubBtn);
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
  document.getElementById('board-filter').addEventListener('input', renderLeaderboard);
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

/* Header stats strip: members, sign-ins, events, days left. */
function renderSeasonPulse() {
  const box = document.getElementById('season-pulse');
  box.innerHTML = '';
  const items = [
    [String(MEMBERS.length), 'members on the board'],
    [String(TOTAL_SIGNINS), 'sign-ins'],
    [String(EVENTS_HELD), 'events held']
  ];
  if (CONFIG.seasonEndDate) {
    const days = Math.ceil((new Date(CONFIG.seasonEndDate) - Date.now()) / 86400000);
    if (days > 0) items.push([String(days), 'days left this season']);
  }
  for (const [num, label] of items) {
    const it = el('div', 'pulse-item');
    it.appendChild(el('span', 'pulse-num', num));
    it.appendChild(el('span', 'pulse-label', label));
    box.appendChild(it);
  }
  box.hidden = false;
}

function renderSkeleton() {
  const tbody = document.getElementById('leaderboard-body');
  tbody.innerHTML = '';
  for (let i = 0; i < 5; i++) {
    const tr = el('tr', 'skeleton-row');
    for (let c = 0; c < 5; c++) {
      const td = el('td');
      td.appendChild(el('div', 'skeleton'));
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
}

function renderLeaderboard() {
  const tbody = document.getElementById('leaderboard-body');
  const podium = document.getElementById('podium');
  const filter = cleanUniqname(document.getElementById('board-filter').value);
  const you = localStorage.getItem(STORE.uniqname);
  tbody.innerHTML = '';

  if (MEMBERS.length === 0) {
    podium.hidden = true;
    const tr = el('tr');
    const td = el('td', 'muted center');
    td.colSpan = 5;
    td.textContent = 'No sign-ins yet this semester — be the first! ';
    if (CONFIG.links && CONFIG.links.signInForm) {
      const a = el('a', null, 'Sign in at an event →');
      a.href = CONFIG.links.signInForm; a.target = '_blank'; a.rel = 'noopener';
      td.appendChild(a);
    }
    tr.appendChild(td);
    tbody.appendChild(tr);
    document.getElementById('leaderboard-toggle').hidden = true;
    return;
  }

  // Podium for the top 3 (only when there are at least 3 and not filtering).
  if (MEMBERS.length >= 3 && !filter) {
    podium.innerHTML = '';
    const order = [MEMBERS[1], MEMBERS[0], MEMBERS[2]]; // silver, gold, bronze
    const places = ['second', 'first', 'third'];
    order.forEach((m, i) => {
      const spot = el('div', 'podium-spot ' + places[i]);
      spot.appendChild(el('div', 'podium-medal', ['🥈', '🥇', '🥉'][i]));
      spot.appendChild(el('div', 'podium-name', m.uniqname));
      spot.appendChild(el('div', 'podium-points', m.points + ' pts'));
      makeActivatable(spot, m.uniqname,
        'View ' + m.uniqname + ', rank ' + m.rank + ', ' + m.points + ' points');
      podium.appendChild(spot);
    });
    podium.hidden = false;
  } else {
    podium.hidden = true;
  }

  const matches = filter ? MEMBERS.filter(m => m.uniqname.includes(filter)) : MEMBERS;
  const showAll = document.getElementById('leaderboard-section').dataset.showAll === '1';
  const rows = (filter || showAll) ? matches : matches.slice(0, 10);

  if (rows.length === 0) {
    const tr = el('tr');
    const td = el('td', 'muted center', 'No members match “' + filter + '”.');
    td.colSpan = 5;
    tr.appendChild(td);
    tbody.appendChild(tr);
  }

  for (const m of rows) {
    const tr = el('tr');
    if (m.uniqname === you) tr.className = 'you-row';
    tr.appendChild(el('td', 'rank-cell', '#' + m.rank));
    tr.appendChild(el('td', 'tier-cell', m.tier.icon + ' ' + m.tier.name));
    tr.appendChild(el('td', 'uniq-cell', m.uniqname + (m.uniqname === you ? ' (you)' : '')));
    tr.appendChild(el('td', 'center', String(m.totalEvents)));
    tr.appendChild(el('td', 'points-cell', String(m.points)));
    makeActivatable(tr, m.uniqname,
      'View ' + m.uniqname + ', rank ' + m.rank + ', ' + m.points + ' points');
    tbody.appendChild(tr);
  }

  const toggle = document.getElementById('leaderboard-toggle');
  if (!filter && MEMBERS.length > 10) {
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

/* ------------------------------------------------------- member lookup -- */

function showMember(value, opts) {
  const auto = opts && opts.auto;
  const uniqname = cleanUniqname(value);
  const box = document.getElementById('member-card');
  const suggestBox = document.getElementById('lookup-suggest');
  suggestBox.hidden = true;
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
    renderSuggestions(uniqname);
    return;
  }

  // Remember this device's member and refresh the "you" highlight.
  const prevSaved = localStorage.getItem(STORE.uniqname);
  localStorage.setItem(STORE.uniqname, uniqname);
  if (prevSaved !== uniqname) renderLeaderboard();

  const head = el('div', 'member-head');
  head.appendChild(el('div', 'member-name', m.uniqname));
  const chip = el('div', 'tier-chip tier-' + m.tier.name.toLowerCase(),
    m.tier.icon + ' ' + m.tier.name + ' · Rank #' + m.rank + ' of ' + MEMBERS.length);
  head.appendChild(chip);

  const shareBtn = el('button', 'btn small', '📤 Share my card');
  shareBtn.addEventListener('click', () => shareCard(m));
  head.appendChild(shareBtn);

  const forgetBtn = el('button', 'btn small ghost', 'Not you?');
  forgetBtn.addEventListener('click', () => {
    localStorage.removeItem(STORE.uniqname);
    document.getElementById('lookup-input').value = '';
    box.hidden = true;
    renderLeaderboard();
  });
  head.appendChild(forgetBtn);
  box.appendChild(head);

  // "Since your last visit" delta (stored per device).
  const snapKey = STORE.snapshot + uniqname;
  let prev = null;
  try { prev = JSON.parse(localStorage.getItem(snapKey)); } catch (e) { /* ignore */ }
  if (prev && (prev.points !== m.points || prev.rank !== m.rank)) {
    const dp = m.points - prev.points;
    const dr = prev.rank - m.rank; // positive = climbed
    const bits = [];
    if (dp > 0) bits.push('+' + dp + ' points');
    if (dr > 0) bits.push('▲ up ' + dr + (dr === 1 ? ' spot' : ' spots'));
    else if (dr < 0) bits.push('▼ down ' + (-dr) + (dr === -1 ? ' spot' : ' spots'));
    if (bits.length) box.appendChild(el('p', 'delta-note', 'Since your last visit: ' + bits.join(' · ')));
  }
  localStorage.setItem(snapKey, JSON.stringify({ points: m.points, rank: m.rank, at: Date.now() }));

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

  // Badges with progress; celebrate ones earned since last look.
  const badgeKey = STORE.badges + uniqname;
  let known = [];
  try { known = JSON.parse(localStorage.getItem(badgeKey)) || []; } catch (e) { /* ignore */ }
  const earnedNow = [];
  const newlyEarned = [];

  const grid = el('div', 'member-badges');
  for (const b of CONFIG.badges) {
    const p = badgeProgress(b, m);
    const isNew = p.earned && !known.includes(b.id);
    if (p.earned) earnedNow.push(b.id);
    if (isNew) newlyEarned.push(b);
    const card = el('div', 'badge-card' + (p.earned ? ' earned' : '') + (isNew ? ' new-badge' : ''));
    card.appendChild(el('div', 'badge-icon', b.icon));
    card.appendChild(el('div', 'badge-name', b.name));
    card.appendChild(el('div', 'badge-desc', b.desc));
    if (isNew) card.appendChild(el('div', 'new-badge-tag', 'NEW!'));
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
  localStorage.setItem(badgeKey, JSON.stringify(earnedNow));

  box.appendChild(el('h3', 'member-badges-title', 'Badges'));
  box.appendChild(grid);

  // Only celebrate when the member actively looked themselves up (not on
  // page load) or genuinely earned something new since last time.
  if (newlyEarned.length > 0 && known.length > 0) fireConfetti();
  else if (!auto && newlyEarned.length > 0) fireConfetti();

  if (!auto) box.scrollIntoView({ behavior: REDUCED_MOTION ? 'auto' : 'smooth', block: 'nearest' });
}

/** "Did you mean…?" — closest uniqnames by edit distance or prefix. */
function renderSuggestions(input) {
  const boxEl = document.getElementById('lookup-suggest');
  const scored = MEMBERS
    .map(m => ({ u: m.uniqname, d: editDistance(input, m.uniqname) }))
    .filter(x => x.d <= 2 || x.u.startsWith(input.slice(0, 3)))
    .sort((a, b) => a.d - b.d)
    .slice(0, 3);
  if (scored.length === 0) { boxEl.hidden = true; return; }

  boxEl.innerHTML = '';
  boxEl.appendChild(el('span', 'muted', 'Did you mean: '));
  for (const s of scored) {
    const chip = el('button', 'suggest-chip', s.u);
    chip.addEventListener('click', () => {
      document.getElementById('lookup-input').value = s.u;
      showMember(s.u);
    });
    boxEl.appendChild(chip);
  }
  boxEl.hidden = false;
}

function editDistance(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return dp[a.length][b.length];
}

function statTile(big, label) {
  const tile = el('div', 'stat-tile');
  tile.appendChild(el('div', 'stat-big', big));
  tile.appendChild(el('div', 'stat-label', label));
  return tile;
}

/** If the saved member sits outside the default top 10, expand the board so
    their highlighted row is actually reachable, and note where they are. */
function revealYourRow(uniqname) {
  const idx = MEMBERS.findIndex(m => m.uniqname === uniqname);
  if (idx < 10) return;
  const section = document.getElementById('leaderboard-section');
  section.dataset.showAll = '1';
  renderLeaderboard();
  const row = document.querySelector('.you-row');
  if (row) row.scrollIntoView({ behavior: REDUCED_MOTION ? 'auto' : 'smooth', block: 'center' });
}

function renderLastUpdated() {
  document.getElementById('last-updated').textContent =
    'Data loaded ' + new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

/* ----------------------------------------------------- share card (🔥) -- */

/**
 * Draws a 1080x1350 (Instagram portrait) "battle card" PNG on a canvas and
 * shares it via the native share sheet (mobile) or downloads it (desktop).
 * Everything happens locally in the browser.
 */
function shareCard(m) {
  const W = 1080, H = 1350;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  const tierColors = {
    gold:        ['#ffd700', '#b8860b'],
    silver:      ['#e8e8e8', '#8a8a8a'],
    bronze:      ['#cd7f32', '#8b5a2b'],
    participant: ['#3b82f6', '#1d4ed8']
  };
  const [c1, c2] = tierColors[m.tier.name.toLowerCase()] || tierColors.participant;

  // Background
  ctx.fillStyle = '#0d1117';
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W / 2, 300, 50, W / 2, 300, 700);
  glow.addColorStop(0, hexWithAlpha(c1, 0.28));
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Border frame
  ctx.strokeStyle = c1;
  ctx.lineWidth = 10;
  roundRect(ctx, 40, 40, W - 80, H - 80, 36);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#8b949e';
  ctx.font = '600 34px system-ui, sans-serif';
  ctx.fillText('NSBE UNIVERSITY OF MICHIGAN', W / 2, 150);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 84px Orbitron, system-ui, sans-serif';
  ctx.fillText('BATTLE PASS', W / 2, 250);

  ctx.fillStyle = '#00ffab';
  ctx.font = '700 40px Orbitron, system-ui, sans-serif';
  ctx.fillText((CONFIG.season || '').toUpperCase(), W / 2, 320);

  // Tier medal
  ctx.font = '200px system-ui';
  ctx.fillText(m.tier.icon, W / 2, 560);

  const grad = ctx.createLinearGradient(0, 600, 0, 700);
  grad.addColorStop(0, c1); grad.addColorStop(1, c2);
  ctx.fillStyle = grad;
  ctx.font = '900 96px Orbitron, system-ui, sans-serif';
  ctx.fillText(m.tier.name, W / 2, 690);

  ctx.fillStyle = '#ffffff';
  ctx.font = '700 64px Orbitron, system-ui, sans-serif';
  ctx.fillText(m.uniqname, W / 2, 790);

  // Stat row
  const earned = CONFIG.badges.filter(b => badgeProgress(b, m).earned).length;
  const stats = [
    [String(m.points), 'POINTS'],
    ['#' + m.rank, 'RANK'],
    [String(m.totalEvents), 'EVENTS'],
    [String(earned), 'BADGES']
  ];
  const colW = (W - 160) / 4;
  stats.forEach(([num, label], i) => {
    const x = 80 + colW * i + colW / 2;
    ctx.fillStyle = c1;
    ctx.font = '900 72px Orbitron, system-ui, sans-serif';
    ctx.fillText(num, x, 950);
    ctx.fillStyle = '#8b949e';
    ctx.font = '600 28px system-ui, sans-serif';
    ctx.fillText(label, x, 1000);
  });

  // Earned badge icons
  const earnedBadges = CONFIG.badges.filter(b => badgeProgress(b, m).earned).slice(0, 8);
  ctx.font = '64px system-ui';
  const bw = 100;
  const startX = W / 2 - (earnedBadges.length - 1) * bw / 2;
  earnedBadges.forEach((b, i) => ctx.fillText(b.icon, startX + i * bw, 1120));

  ctx.fillStyle = '#8b949e';
  ctx.font = '600 30px system-ui, sans-serif';
  ctx.fillText('jaleelada.github.io/nsbe-uofm-battle-pass', W / 2, 1240);

  canvas.toBlob(async blob => {
    const file = new File([blob], 'nsbe-battle-card-' + m.uniqname + '.png', { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'My NSBE Battle Pass',
          text: 'My NSBE UM Battle Pass — ' + m.tier.name + ' tier, ' + m.points + ' points! 🥇'
        });
        return;
      } catch (e) { /* user cancelled or unsupported — fall through to download */ }
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(a.href);
  }, 'image/png');
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function hexWithAlpha(hex, alpha) {
  const n = parseInt(hex.slice(1), 16);
  return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + alpha + ')';
}

/* ----------------------------------------------------------- confetti -- */

function fireConfetti() {
  if (REDUCED_MOTION) return;
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.display = 'block';

  const colors = ['#ffd700', '#00ffab', '#00d4ff', '#ff6b6b', '#c084fc'];
  const parts = Array.from({ length: 140 }, () => ({
    x: Math.random() * canvas.width,
    y: -20 - Math.random() * canvas.height * 0.5,
    size: 6 + Math.random() * 8,
    color: colors[(Math.random() * colors.length) | 0],
    vy: 2.5 + Math.random() * 3.5,
    vx: -1.5 + Math.random() * 3,
    rot: Math.random() * Math.PI,
    vr: -0.1 + Math.random() * 0.2
  }));

  const t0 = performance.now();
  (function frame(t) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of parts) {
      p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    }
    if (t - t0 < 2800) requestAnimationFrame(frame);
    else { ctx.clearRect(0, 0, canvas.width, canvas.height); canvas.style.display = 'none'; }
  })(t0);
}

/* --------------------------------------------------------- banners etc -- */

function showBanner(kind, message) {
  const box = document.getElementById('banner');
  box.hidden = false;
  box.className = 'banner ' + kind;
  box.textContent = message;
}

function showSetupNeeded() {
  document.getElementById('setup-panel').hidden = false;
  document.getElementById('leaderboard-body').innerHTML =
    '<tr><td colspan="5" class="muted center">Waiting for setup…</td></tr>';
}
