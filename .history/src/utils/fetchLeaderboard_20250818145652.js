// Helper function to check sheet accessibility
export async function checkSheetAccess() {
  try {
    const response = await fetch(`https://docs.google.com/spreadsheets/d/${SHEET_CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=Leaderboard`);
    return response.ok;
  } catch (error) {
    console.error('Sheet access check failed:', error);
    return false;
  }
}

// Alternative fetch method using CSV export (more reliable)
export async function fetchLeaderboardCSV() {
  try {
    const response = await fetch(`https://docs.google.com/spreadsheets/d/${SHEET_CONFIG.SHEET_ID}/export?format=csv&gid=0`);
    const csvText = await response.text();
    
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',');
    
    return lines.slice(1).map((line, index) => {
      const values = line.split(',');
      return {
        rank: index + 1,
        name: values[0]?.replace(/"/g, '') || 'Unknown',
        score: parseInt(values[1]) || 0,
        tier: values[2]?.replace(/"/g, '') || 'Participant'
      };
    }).filter(item => item.name && item.name !== 'Unknown')
      .sort((a, b) => b.score - a.score);
  } catch (error) {
    console.error('CSV fetch failed:', error);
    throw error;
  }
}
