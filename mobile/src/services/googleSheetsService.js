// Google Sheets configuration and data service
export const SHEET_CONFIG = {
  SHEET_ID: '1EkyzaNjTQ-5sKvqex5SnTTJ6SCdq-WYIJ_Y_wU34JIU',
  get SHEET_URL() { 
    return `https://docs.google.com/spreadsheets/d/${this.SHEET_ID}/edit#gid=0`; 
  }
};

// Check if Google Sheet is accessible
export async function checkSheetAccess() {
  try {
    const response = await fetch(`https://docs.google.com/spreadsheets/d/${SHEET_CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=Leaderboard`);
    return response.ok;
  } catch (error) {
    console.error('Sheet access check failed:', error);
    return false;
  }
}

// Fetch full leaderboard data from Google Sheets (CSV format)
export async function fetchFullLeaderboard() {
  try {
    const response = await fetch(`https://docs.google.com/spreadsheets/d/${SHEET_CONFIG.SHEET_ID}/export?format=csv&gid=0`);
    const csvText = await response.text();
    
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',');
    
    const allData = lines.slice(1).map((line, index) => {
      const values = line.split(',');
      return {
        rank: index + 1,
        name: values[0]?.replace(/"/g, '') || 'Unknown',
        score: parseInt(values[1]) || 0,
        tier: values[2]?.replace(/"/g, '') || 'Participant',
        recruits: parseInt(values[3]) || 0
      };
    }).filter(item => item.name && item.name !== 'Unknown')
      .sort((a, b) => b.score - a.score);

    // Update ranks after sorting
    return allData.map((item, index) => ({
      ...item,
      rank: index + 1
    }));
  } catch (error) {
    console.error('CSV fetch failed:', error);
    throw error;
  }
}

// Get top N users from leaderboard
export async function fetchTopLeaderboard(limit = 10) {
  try {
    const allData = await fetchFullLeaderboard();
    return allData.slice(0, limit);
  } catch (error) {
    console.error('Top leaderboard fetch failed:', error);
    throw error;
  }
}

// Search for a specific user in the full leaderboard
export async function searchUser(searchName) {
  try {
    const allData = await fetchFullLeaderboard();
    const normalizedSearch = searchName.toLowerCase().trim();
    
    return allData.filter(user => 
      user.name.toLowerCase().includes(normalizedSearch)
    );
  } catch (error) {
    console.error('User search failed:', error);
    throw error;
  }
}

// Get user's specific data and rank
export async function getUserData(userName) {
  try {
    const allData = await fetchFullLeaderboard();
    const normalizedName = userName.toLowerCase().trim();
    
    return allData.find(user => 
      user.name.toLowerCase() === normalizedName
    );
  } catch (error) {
    console.error('Get user data failed:', error);
    return null;
  }
}