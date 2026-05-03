(function () {
  const config = window.NSBE_POINTS_CONFIG || {};
  const root = document.getElementById('root');

  const state = {
    rows: [],
    filteredRows: [],
    headers: [],
    query: '',
    lastUpdated: null,
    isLoading: true,
    error: ''
  };

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function parseCsv(text) {
    const rows = [];
    let currentRow = [];
    let currentValue = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i += 1) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"' && inQuotes && nextChar === '"') {
        currentValue += '"';
        i += 1;
        continue;
      }

      if (char === '"') {
        inQuotes = !inQuotes;
        continue;
      }

      if (char === ',' && !inQuotes) {
        currentRow.push(currentValue.trim());
        currentValue = '';
        continue;
      }

      if ((char === '\n' || char === '\r') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') i += 1;
        currentRow.push(currentValue.trim());
        if (currentRow.some(Boolean)) rows.push(currentRow);
        currentRow = [];
        currentValue = '';
        continue;
      }

      currentValue += char;
    }

    currentRow.push(currentValue.trim());
    if (currentRow.some(Boolean)) rows.push(currentRow);

    if (rows.length === 0) return { headers: [], records: [] };

    const headers = rows[0].map((header) => header.trim());
    const records = rows.slice(1).map((row) => {
      return headers.reduce((record, header, index) => {
        record[header] = row[index] || '';
        return record;
      }, {});
    });

    return { headers, records };
  }

  function getField(row, names) {
    const keys = Object.keys(row);
    const normalizedNames = names.map((name) => name.toLowerCase());
    const match = keys.find((key) => normalizedNames.includes(key.toLowerCase()));
    return match ? row[match] : '';
  }

  function toNumber(value) {
    const number = Number(String(value || '').replace(/[^0-9.-]/g, ''));
    return Number.isFinite(number) ? number : 0;
  }

  function formatNumber(value) {
    return new Intl.NumberFormat('en-US').format(toNumber(value));
  }

  function getRank(row, index) {
    return toNumber(getField(row, ['Rank', 'Place'])) || index + 1;
  }

  function getPoints(row) {
    return toNumber(getField(row, ['Points', 'Total Points', 'Score', 'XP']));
  }

  function getEvents(row) {
    return toNumber(getField(row, ['Events', 'Total Events', 'Event Count']));
  }

  function getMemberName(row) {
    return getField(row, ['Name', 'Full Name', 'Member', 'Display Name']) || getUniqname(row) || 'Member';
  }

  function getUniqname(row) {
    const explicitUniqname = getField(row, ['Uniqname', 'Unique Name', 'Username']);
    if (explicitUniqname) return explicitUniqname;

    const email = getField(row, ['Email', 'Email Address']);
    return email.includes('@') ? email.split('@')[0] : email;
  }

  function getTier(row, index, totalRows) {
    const savedTier = getField(row, ['Tier', 'Level']);
    if (savedTier) return savedTier;

    const percentile = getRank(row, index) / Math.max(totalRows, 1);
    if (percentile <= 0.25) return 'Gold';
    if (percentile <= 0.5) return 'Silver';
    if (percentile <= 0.75) return 'Bronze';
    return 'Participant';
  }

  function tierClass(tier) {
    const normalizedTier = String(tier || '').toLowerCase();
    if (normalizedTier.includes('gold')) return 'gold';
    if (normalizedTier.includes('silver')) return 'silver';
    if (normalizedTier.includes('bronze')) return 'bronze';
    return 'participant';
  }

  function getSearchText(row, index) {
    return [
      getRank(row, index),
      getMemberName(row),
      getUniqname(row),
      getPoints(row),
      getEvents(row),
      getTier(row, index, state.rows.length)
    ].join(' ').toLowerCase();
  }

  function sortRows(rows) {
    return [...rows].sort((a, b) => {
      const rankA = toNumber(getField(a, ['Rank', 'Place']));
      const rankB = toNumber(getField(b, ['Rank', 'Place']));
      if (rankA && rankB) return rankA - rankB;
      return getPoints(b) - getPoints(a);
    });
  }

  function filterRows() {
    const query = state.query.trim().toLowerCase();
    state.filteredRows = query
      ? state.rows.filter((row, index) => getSearchText(row, index).includes(query))
      : state.rows;
  }

  function calculateSummary() {
    const totalMembers = state.rows.length;
    const totalPoints = state.rows.reduce((sum, row) => sum + getPoints(row), 0);
    const topScore = state.rows.reduce((max, row) => Math.max(max, getPoints(row)), 0);
    const totalEvents = state.rows.reduce((sum, row) => sum + getEvents(row), 0);

    return { totalMembers, totalPoints, topScore, totalEvents };
  }

  function renderHeader() {
    const signInLink = config.signInFormUrl
      ? `<a class="button primary" href="${escapeHtml(config.signInFormUrl)}" target="_blank" rel="noopener noreferrer">Sign In</a>`
      : '';
    const guideLink = config.pointTrackingGuideUrl
      ? `<a class="button" href="${escapeHtml(config.pointTrackingGuideUrl)}">Chair Guide</a>`
      : '';

    return `
      <header class="topbar">
        <div>
          <p class="eyebrow">${escapeHtml(config.chapterName || 'NSBE')}</p>
          <h1>${escapeHtml(config.pageTitle || 'Chapter Points')}</h1>
          <p class="subtitle">${escapeHtml(config.schoolYear || 'Current Year')} Leaderboard</p>
        </div>
        <div class="actions">
          ${signInLink}
          ${guideLink}
          <button class="button" type="button" data-refresh>Refresh</button>
        </div>
      </header>
    `;
  }

  function renderSummary() {
    const summary = calculateSummary();
    return `
      <section class="summary" aria-label="Leaderboard summary">
        <div class="metric">
          <p class="metric-label">Members</p>
          <p class="metric-value">${formatNumber(summary.totalMembers)}</p>
        </div>
        <div class="metric">
          <p class="metric-label">Total Points</p>
          <p class="metric-value">${formatNumber(summary.totalPoints)}</p>
        </div>
        <div class="metric">
          <p class="metric-label">Events</p>
          <p class="metric-value">${formatNumber(summary.totalEvents)}</p>
        </div>
        <div class="metric">
          <p class="metric-label">Top Score</p>
          <p class="metric-value">${formatNumber(summary.topScore)}</p>
        </div>
      </section>
    `;
  }

  function renderToolbar() {
    const statusClass = state.error ? 'status error' : 'status';
    const updated = state.lastUpdated
      ? `Updated ${state.lastUpdated.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
      : '';
    const statusText = state.error || (
      state.isLoading
        ? 'Loading leaderboard...'
        : `${state.filteredRows.length} shown${updated ? ` - ${updated}` : ''}`
    );

    return `
      <section class="toolbar">
        <input
          class="search"
          type="search"
          placeholder="Search name or uniqname"
          value="${escapeHtml(state.query)}"
          data-search
        />
        <div class="${statusClass}">${escapeHtml(statusText)}</div>
      </section>
    `;
  }

  function renderRows() {
    if (state.isLoading) {
      return '<tr><td colspan="5"><div class="empty">Loading leaderboard...</div></td></tr>';
    }

    if (state.error) {
      return `<tr><td colspan="5"><div class="empty">${escapeHtml(state.error)}</div></td></tr>`;
    }

    if (state.filteredRows.length === 0) {
      return '<tr><td colspan="5"><div class="empty">No matching members.</div></td></tr>';
    }

    return state.filteredRows.map((row, index) => {
      const originalIndex = state.rows.indexOf(row);
      const tier = getTier(row, originalIndex, state.rows.length);
      const name = getMemberName(row);
      const uniqname = getUniqname(row);

      return `
        <tr>
          <td class="rank">#${escapeHtml(getRank(row, originalIndex))}</td>
          <td>
            <div class="member-main">${escapeHtml(name)}</div>
            ${uniqname && uniqname !== name ? `<div class="member-sub">${escapeHtml(uniqname)}</div>` : ''}
          </td>
          <td class="points">${formatNumber(getPoints(row))}</td>
          <td>${formatNumber(getEvents(row))}</td>
          <td><span class="tier ${tierClass(tier)}">${escapeHtml(tier)}</span></td>
        </tr>
      `;
    }).join('');
  }

  function renderLeaderboard() {
    return `
      <section class="leaderboard">
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Member</th>
              <th>Points</th>
              <th>Events</th>
              <th>Tier</th>
            </tr>
          </thead>
          <tbody>${renderRows()}</tbody>
        </table>
      </section>
    `;
  }

  function bindEvents() {
    const searchInput = root.querySelector('[data-search]');
    const refreshButton = root.querySelector('[data-refresh]');

    if (searchInput) {
      searchInput.addEventListener('input', (event) => {
        state.query = event.target.value;
        filterRows();
        render();
        const nextInput = root.querySelector('[data-search]');
        if (nextInput) {
          nextInput.focus();
          nextInput.setSelectionRange(state.query.length, state.query.length);
        }
      });
    }

    if (refreshButton) {
      refreshButton.addEventListener('click', loadLeaderboard);
    }
  }

  function render() {
    root.innerHTML = `
      <main class="app">
        ${renderHeader()}
        ${renderSummary()}
        ${renderToolbar()}
        ${renderLeaderboard()}
      </main>
    `;
    bindEvents();
  }

  async function loadLeaderboard() {
    state.isLoading = true;
    state.error = '';
    render();

    try {
      if (!config.leaderboardCsvUrl) {
        throw new Error('Missing leaderboard CSV URL.');
      }

      const response = await fetch(config.leaderboardCsvUrl, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Could not load leaderboard (${response.status}).`);
      }

      const csvText = await response.text();
      const parsed = parseCsv(csvText);
      state.headers = parsed.headers;
      state.rows = sortRows(parsed.records);
      state.lastUpdated = new Date();
      filterRows();
    } catch (error) {
      state.rows = [];
      state.filteredRows = [];
      state.error = error.message || 'Could not load leaderboard.';
    } finally {
      state.isLoading = false;
      render();
    }
  }

  loadLeaderboard();
})();
