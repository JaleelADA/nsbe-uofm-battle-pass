// Local Data Manager - Handles fetching from Google Sheets and local calculations
// New system: Form responses + Paid member verification + Local point calculations

// Enhanced configuration for new data sources with email-uniqname linking
window.NEW_DATA_CONFIG = {
  // Your actual sheet IDs
  SIGNIN_FORM_SHEET_ID: '1ckiwFLGI_bBsZ0Zs6EIP4IZaX1tVtwBzs84VPB1lqb4',
  PAID_MEMBERS_SHEET_ID: '1INkzEpMsH8Ow85FtKv6DnbKxI1ysu6SKYsmu3JcXDKg',
  
  // Sheet tab names (corrected)
  SIGNIN_SHEET_NAME: 'Sign-ins',
  PAID_MEMBERS_SHEET_NAME: 'PaidMembers',
  SIGNIN_SHEET_GID: '554738007'
};

// Email-to-Uniqname mapping system
// This will be built dynamically from sign-in data to link dues (email) with points (uniqname)
window.EMAIL_UNIQNAME_MAPPING = new Map();
window.EMAIL_UNIQNAME_MAPPING = new Map();

// New Point System Logic based on your specifications
window.NEW_POINT_SYSTEM = {
  // Activity point values
  activities: {
    'GBM': 7,                           // General Body Meeting
    'Professional Development': 10,      // PD Events, workshops, panels
    'P-Zone': 5,                        // Peer Zone events
    'Mentorship Events': 7,             // Mentor mixers, speed mentoring
    'E-Board Meeting': 7,               // Leadership meetings
    'JEB Events': 7,                    // Junior Exec Board events
    'Community Service': 3,             // First volunteering event
    'Convention Attendance': 15,        // Regional/National conventions
    'Social Events': 7,                 // BBQ, flag football, game nights
    'Mentorship Program Participation': 10 // Active mentorship engagement
  },
  
  // Multipliers and bonuses
  multipliers: {
    'VOLUNTEERING_BONUS': 1.5,  // 1.5x for next two events after volunteering
    'BRING_FRIEND_FIRST': 3,    // 3 points for first friend brought
    'BRING_FRIEND_ADDITIONAL': 1 // 1 point for each additional friend
  },
  
  // Tier thresholds (points needed for each tier)
  tiers: {
    'GOLD': 75,      // Top performers
    'SILVER': 50,    // Consistent contributors  
    'BRONZE': 25,    // Active participants
    'PARTICIPANT': 0 // Everyone else
  }
};

// Build email-to-uniqname mapping from sign-in data
function buildEmailUniqnameMapping(signInData) {
  // Clear existing mapping
  window.EMAIL_UNIQNAME_MAPPING.clear();
  
  // Build mapping from all sign-in entries
  signInData.forEach(entry => {
    const email = (entry['Email Address'] || entry['Email'] || '').toLowerCase().trim();
    const uniqname = (entry['Uniqname'] || entry['uniqname'] || '').toLowerCase().trim();
    const fullName = entry['Full Name (First & Last)'] || entry['Full Name'] || '';
    
    if (email && uniqname) {
      // Store the most recent full name and uniqname for this email
      if (!window.EMAIL_UNIQNAME_MAPPING.has(email) || 
          new Date(entry['Timestamp'] || 0) > new Date(window.EMAIL_UNIQNAME_MAPPING.get(email).lastSeen)) {
        
        window.EMAIL_UNIQNAME_MAPPING.set(email, {
          uniqname: uniqname,
          fullName: fullName,
          lastSeen: entry['Timestamp'] || new Date().toISOString()
        });
      }
    }
  });
  
  return window.EMAIL_UNIQNAME_MAPPING;
}

// Enhanced paid member verification using email-uniqname mapping
function isPaidMemberEnhanced(uniqname, email, paidMembersList) {
  if (!paidMembersList || paidMembersList.length === 0) return false;
  
  // Try direct email match first
  if (email) {
    const directMatch = paidMembersList.some(member => {
      const memberEmail = (member.Email || member['Email'] || '').toLowerCase().trim();
      const isPaid = member['Paid AC Chapter Fee? (Y / N)'] || member['Paid AC Chapter Fee'];
      
      return memberEmail === email.toLowerCase().trim() &&
             (isPaid === 'Y' || isPaid === 'Yes' || isPaid === 'yes');
    });
    
    if (directMatch) return true;
  }
  
  // Try to find email through uniqname mapping
  if (uniqname && window.EMAIL_UNIQNAME_MAPPING) {
    for (const [mappedEmail, mappingData] of window.EMAIL_UNIQNAME_MAPPING) {
      if (mappingData.uniqname === uniqname.toLowerCase().trim()) {
        // Found the email for this uniqname, check if that email is paid
        const emailMatch = paidMembersList.some(member => {
          const memberEmail = (member.Email || member['Email'] || '').toLowerCase().trim();
          const isPaid = member['Paid AC Chapter Fee? (Y / N)'] || member['Paid AC Chapter Fee'];
          
          return memberEmail === mappedEmail &&
                 (isPaid === 'Y' || isPaid === 'Yes' || isPaid === 'yes');
        });
        
        if (emailMatch) return true;
      }
    }
  }
  
  return false;
}

// Check if a member is a paid member (legacy function - now uses enhanced version)
function isPaidMember(email, paidMembersList) {
  if (!email || !paidMembersList) return false;
  
  return isPaidMemberEnhanced(null, email, paidMembersList);
}

// Fetch data from Google Sheets
async function fetchSheetData(sheetId, sheetName) {
  try {
    const response = await fetch(
      `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`
    );
    const text = await response.text();
    
    // Parse Google's JSONP response
    const jsonText = text.substring(47).slice(0, -2);
    const data = JSON.parse(jsonText);
    
    if (data.table && data.table.rows) {
      const headers = data.table.cols.map(col => col.label || col.id);
      // Don't skip any rows - let the data speak for itself
      const rows = data.table.rows;
      
      return rows
        .filter(row => row.c && row.c.some(cell => cell && cell.v)) // Filter empty rows
        .map(row => {
          const rowData = {};
          let isHeaderRow = false;
          
          headers.forEach((header, index) => {
            const cellValue = row.c[index]?.v || '';
            // Check if this looks like a header row
            if (cellValue === 'Timestamp' || cellValue === 'Email Address') {
              isHeaderRow = true;
            }
            rowData[header] = cellValue;
          });
          
          // Return null for header rows
          return isHeaderRow ? null : rowData;
        })
        .filter(row => row !== null && Object.values(row).some(val => val && val !== '')); // Filter out null rows and completely empty rows
    }
    
    return [];
  } catch (error) {
    console.error(`Error fetching data from ${sheetName}:`, error);
    return [];
  }
}

// Fetch sign-in form responses
async function fetchSignInData() {
  return await fetchSheetData(
    window.NEW_DATA_CONFIG.SIGNIN_FORM_SHEET_ID, 
    window.NEW_DATA_CONFIG.SIGNIN_SHEET_NAME
  );
}

// Fetch paid members list
async function fetchPaidMembers() {
  return await fetchSheetData(
    window.NEW_DATA_CONFIG.PAID_MEMBERS_SHEET_ID, 
    window.NEW_DATA_CONFIG.PAID_MEMBERS_SHEET_NAME
  );
}

// Calculate points for a member based on their activities
function calculateMemberPoints(memberData, paidMembersList = [], memberHistory = []) {
  let basePoints = 0;
  const activities = [];
  
  // Extract data from form response using your actual column headers
  const eventType = memberData['Event (1. GBM\n2. Professional Development\n3. P-Zone\n4. Mentorship Events\n5. E-Board Meeting\n6. JEB Events\n7. Community Service\n8. Convention Attendance)'] || 
                   memberData['Event'] || '';
  const email = memberData['Email Address'] || memberData['Email'];
  const uniqname = memberData['Uniqname'] || memberData['uniqname'];
  const fullName = memberData['Full Name (First & Last)'] || memberData['Full Name'];
  const broughtFriend = memberData['Did you bring a friend?'] || memberData['Brought Friend'];
  const friendCount = parseInt(memberData['How many (Enter a Number)'] || memberData['Friend Count'] || '0');
  const timestamp = memberData['Timestamp'] || new Date().toISOString();
  
  // Map event types to point values
  let eventPoints = 0;
  const eventTypeMap = {
    '1': 'GBM',
    '2': 'Professional Development', 
    '3': 'P-Zone',
    '4': 'Mentorship Events',
    '5': 'E-Board Meeting',
    '6': 'JEB Events',
    '7': 'Community Service',
    '8': 'Convention Attendance'
  };
  
  // Parse event type (could be number or text)
  let normalizedEventType = '';
  if (eventType.includes('1') || eventType.toLowerCase().includes('gbm')) {
    normalizedEventType = 'GBM';
  } else if (eventType.includes('2') || eventType.toLowerCase().includes('professional')) {
    normalizedEventType = 'Professional Development';
  } else if (eventType.includes('3') || eventType.toLowerCase().includes('p-zone')) {
    normalizedEventType = 'P-Zone';
  } else if (eventType.includes('4') || eventType.toLowerCase().includes('mentorship event')) {
    normalizedEventType = 'Mentorship Events';
  } else if (eventType.includes('5') || eventType.toLowerCase().includes('e-board')) {
    normalizedEventType = 'E-Board Meeting';
  } else if (eventType.includes('6') || eventType.toLowerCase().includes('jeb')) {
    normalizedEventType = 'JEB Events';
  } else if (eventType.includes('7') || eventType.toLowerCase().includes('community') || eventType.toLowerCase().includes('service')) {
    normalizedEventType = 'Community Service';
  } else if (eventType.includes('8') || eventType.toLowerCase().includes('convention')) {
    normalizedEventType = 'Convention Attendance';
  }
  
  // Get base points for event type
  eventPoints = window.NEW_POINT_SYSTEM.activities[normalizedEventType] || 0;
  
  // Community service events are always 3 points each
  if (normalizedEventType === 'Community Service') {
    eventPoints = 3; // All community service events worth 3 points
  }
  
  // Add friend referral points
  let friendPoints = 0;
  if (broughtFriend && (broughtFriend.toLowerCase() === 'yes' || broughtFriend === 'Y') && friendCount > 0) {
    friendPoints = window.NEW_POINT_SYSTEM.multipliers.BRING_FRIEND_FIRST; // 3 points for first friend
    if (friendCount > 1) {
      friendPoints += (friendCount - 1) * window.NEW_POINT_SYSTEM.multipliers.BRING_FRIEND_ADDITIONAL; // 1 point each additional
    }
  }
  
  // Check if member has volunteering bonus (1.5x for next two events after volunteering)
  let hasVolunteeringBonus = false;
  if (memberHistory && memberHistory.length > 0) {
    // Find most recent volunteering event
    const recentVolunteering = memberHistory
      .filter(event => event.eventType === 'Community Service')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
    
    if (recentVolunteering) {
      // Count events after most recent volunteering
      const eventsAfterVolunteering = memberHistory.filter(event => 
        new Date(event.timestamp) > new Date(recentVolunteering.timestamp) &&
        event.eventType !== 'Community Service'
      ).length;
      
      // Apply bonus for next 2 events after volunteering
      if (eventsAfterVolunteering < 2 && normalizedEventType !== 'Community Service') {
        hasVolunteeringBonus = true;
        eventPoints *= window.NEW_POINT_SYSTEM.multipliers.VOLUNTEERING_BONUS; // 1.5x multiplier
      }
    }
  }
  
  // Apply 5-point cap for unpaid members (except for community service which stays at 3)
  const isPaid = isPaidMemberEnhanced(uniqname, email, paidMembersList);
  if (!isPaid && normalizedEventType !== 'Community Service') {
    eventPoints = Math.min(eventPoints, 5); // Cap at 5 points for unpaid members
  }
  
  const totalEventPoints = Math.round(eventPoints + friendPoints);
  
  return {
    eventType: normalizedEventType,
    basePoints: window.NEW_POINT_SYSTEM.activities[normalizedEventType] || 0,
    eventPoints: Math.round(eventPoints),
    friendPoints,
    totalPoints: totalEventPoints,
    hasVolunteeringBonus,
    timestamp,
    uniqname,
    email,
    fullName,
    friendCount: friendCount || 0,
    broughtFriend: broughtFriend === 'yes' || broughtFriend === 'Y'
  };
}

// Calculate badge XP for a member based on their achievements
function calculateBadgeXP(member, eventPoints, paidMembersList) {
  if (!window.TRACKABLE_BADGES_CONFIG) {
    return 0;
  }
  
  let totalBadgeXP = 0;
  const email = member.email;
  const isPaid = isPaidMemberEnhanced(null, email, paidMembersList);
  
  // Process user activities to get stats needed for badge calculation
  const userStats = {
    total_events: member.activities.length,
    total_points: eventPoints,
    friends_brought: 0,
    event_categories: new Set(),
    is_paid_member: isPaid
  };
  
  // Count activities by type and other stats
  member.activities.forEach(activity => {
    const entry = activity.rawEntry;
    
    // Count different event types
    if (entry['Select Event Type:']) {
      const eventType = entry['Select Event Type:'].trim();
      userStats.event_categories.add(eventType);
      userStats[eventType] = (userStats[eventType] || 0) + 1;
    }
    
    // Count friends brought
    const friendsField = entry['How many friends did you bring? (First friend +3 points, each additional +1 point)'];
    if (friendsField && !isNaN(friendsField)) {
      userStats.friends_brought += parseInt(friendsField);
    }
  });
  
  // Convert Set to count for event_categories
  userStats.event_categories = userStats.event_categories.size;
  
  // Check each badge and award XP if earned
  window.TRACKABLE_BADGES_CONFIG.forEach(badge => {
    let isEarned = false;
    
    switch (badge.type) {
      case 'status':
        if (badge.requirement === 'paid_status') {
          isEarned = userStats.is_paid_member;
        }
        break;
        
      case 'count':
        const countValue = userStats[badge.requirement.field] || 0;
        isEarned = countValue >= badge.requirement.value;
        break;
        
      case 'points':
        const pointsValue = userStats[badge.requirement.field] || 0;
        isEarned = pointsValue >= badge.requirement.value;
        break;
        
      case 'variety':
        const varietyValue = userStats[badge.requirement.field] || 0;
        isEarned = varietyValue >= badge.requirement.value;
        break;
    }
    
    if (isEarned) {
      totalBadgeXP += badge.xp || 0;
    }
  });
  
  return totalBadgeXP;
}

// Generate leaderboard from processed data
function generateLeaderboard(signInData, paidMembersList) {
  // Build email-uniqname mapping from sign-in data
  buildEmailUniqnameMapping(signInData);
  
  const memberStats = {};
  
  // First pass: collect all activities by uniqname
  const memberActivities = {};
  signInData.forEach(entry => {
    const uniqname = entry['Uniqname'] || entry['uniqname'];
    const email = entry['Email Address'] || entry['Email'];
    const fullName = entry['Full Name (First & Last)'] || entry['Full Name'];
    
    if (!uniqname || !email || !fullName) return; // Skip entries without required data
    
    if (!memberActivities[uniqname]) {
      memberActivities[uniqname] = {
        email,
        fullName,
        activities: []
      };
    }
    
    // Add this activity to the member's history
    memberActivities[uniqname].activities.push({
      eventType: entry['Event (1. GBM\n2. Professional Development\n3. P-Zone\n4. Mentorship Events\n5. E-Board Meeting\n6. JEB Events\n7. Community Service\n8. Convention Attendance)'] || entry['Event'],
      timestamp: entry['Timestamp'] || new Date().toISOString(),
      broughtFriend: entry['Did you bring a friend?'],
      friendCount: parseInt(entry['How many (Enter a Number)'] || '0'),
      rawEntry: entry
    });
  });
  
  // Second pass: calculate points for each member with full activity history
  Object.keys(memberActivities).forEach(uniqname => {
    const member = memberActivities[uniqname];
    
    // Sort activities by timestamp
    member.activities.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    let totalPoints = 0;
    const processedActivities = [];
    
    // Process each activity in chronological order
    member.activities.forEach((activity, index) => {
      // Get history up to this point for context (for volunteering bonus calculation)
      const historyUpToNow = processedActivities.slice();
      
      const activityData = calculateMemberPoints(
        activity.rawEntry, 
        paidMembersList, 
        historyUpToNow
      );
      
      totalPoints += activityData.totalPoints;
      processedActivities.push(activityData);
    });
    
    // Calculate badge XP for this member
    const badgeXP = calculateBadgeXP(member, totalPoints, paidMembersList);
    let finalTotalPoints = totalPoints + badgeXP;
    
    // Apply manual override if one exists
    const manualOverrides = getManualOverrides();
    const overrideData = manualOverrides[member.email];
    let manualAdjustment = 0;
    
    if (overrideData) {
      manualAdjustment = overrideData.adjustment || 0;
      finalTotalPoints += manualAdjustment;
    }
    
    memberStats[uniqname] = {
      name: member.fullName,
      email: member.email,
      uniqname: uniqname,
      totalPoints: Math.round(finalTotalPoints),
      eventPoints: Math.round(totalPoints),
      badgeXP: Math.round(badgeXP),
      manualAdjustment: Math.round(manualAdjustment),
      overrideReason: overrideData?.reason || null,
      activities: processedActivities,
      isPaid: isPaidMemberEnhanced(uniqname, member.email, paidMembersList),
      eventCount: member.activities.length
    };
  });
  
  // Convert to array and sort by points
  const sortedMembers = Object.values(memberStats).sort((a, b) => b.totalPoints - a.totalPoints);
  
  // Extract all points for dynamic tier calculation
  const allMemberPoints = sortedMembers.map(member => member.totalPoints);
  
  // Generate leaderboard with dynamic tiers
  const leaderboard = sortedMembers.map((member, index) => ({
      rank: index + 1,
      name: member.name,
      email: member.email,
      uniqname: member.uniqname,
      score: member.totalPoints,
      tier: calculateTier(member.totalPoints, allMemberPoints),
      isPaid: member.isPaid,
      activities: member.activities,
      eventCount: member.eventCount
    }));
  
  return leaderboard;
}

// Calculate tier based on percentile ranking (dynamic quartiles)
function calculateTier(points, allMemberPoints = null) {
  // If no comparison data provided, fall back to fixed thresholds for individual calculations
  if (!allMemberPoints || allMemberPoints.length === 0) {
    const tiers = window.NEW_POINT_SYSTEM.tiers;
    if (points >= tiers.GOLD) return 'GOLD';
    if (points >= tiers.SILVER) return 'SILVER';
    if (points >= tiers.BRONZE) return 'BRONZE';
    return 'PARTICIPANT';
  }
  
  // Dynamic quartile-based tier calculation
  const sortedPoints = [...allMemberPoints].sort((a, b) => b - a);
  const totalMembers = sortedPoints.length;
  
  // Find user's rank
  const userRank = sortedPoints.findIndex(p => p <= points) + 1;
  const percentile = (userRank / totalMembers) * 100;
  
  // Assign tiers based on percentiles
  if (percentile <= 25) return 'GOLD';     // Top 25%
  if (percentile <= 50) return 'SILVER';   // 25-50%
  if (percentile <= 75) return 'BRONZE';   // 50-75%
  return 'PARTICIPANT';                    // Bottom 25%
}

// Calculate dynamic tier thresholds for display
function calculateDynamicTierThresholds(allMemberPoints) {
  if (!allMemberPoints || allMemberPoints.length === 0) {
    return window.NEW_POINT_SYSTEM.tiers; // Fallback to fixed thresholds
  }
  
  const sortedPoints = [...allMemberPoints].sort((a, b) => b - a);
  const totalMembers = sortedPoints.length;
  
  // Calculate quartile boundaries
  const goldIndex = Math.floor(totalMembers * 0.25);
  const silverIndex = Math.floor(totalMembers * 0.50);
  const bronzeIndex = Math.floor(totalMembers * 0.75);
  
  return {
    GOLD: sortedPoints[goldIndex] || 0,
    SILVER: sortedPoints[silverIndex] || 0,
    BRONZE: sortedPoints[bronzeIndex] || 0,
    PARTICIPANT: 0
  };
}

// Main function to get complete leaderboard data with dynamic tier thresholds
async function getLocalLeaderboard() {
  try {
    // Fetch data from both sheets
    const [signInData, paidMembersList] = await Promise.all([
      fetchSignInData(),
      fetchPaidMembers()
    ]);
    
    // Generate leaderboard
    const leaderboard = generateLeaderboard(signInData, paidMembersList);
    
    // Calculate dynamic tier thresholds for display
    const allPoints = leaderboard.map(member => member.score);
    const dynamicThresholds = calculateDynamicTierThresholds(allPoints);
    
    return {
      leaderboard,
      tierThresholds: dynamicThresholds,
      totalMembers: leaderboard.length
    };
  } catch (error) {
    console.error('Error generating local leaderboard:', error);
    return {
      leaderboard: [],
      tierThresholds: window.NEW_POINT_SYSTEM.tiers,
      totalMembers: 0
    };
  }
}

// Expose functions to global scope
window.fetchSignInData = fetchSignInData;
window.fetchPaidMembers = fetchPaidMembers;
window.isPaidMember = isPaidMember;
window.isPaidMemberEnhanced = isPaidMemberEnhanced;
window.buildEmailUniqnameMapping = buildEmailUniqnameMapping;
window.calculateMemberPoints = calculateMemberPoints;
window.generateLeaderboard = generateLeaderboard;
window.calculateTier = calculateTier;
window.calculateDynamicTierThresholds = calculateDynamicTierThresholds;
window.getLocalLeaderboard = getLocalLeaderboard;

// Manual point override system
function getManualOverrides() {
  const overrides = localStorage.getItem('nsbe_point_overrides');
  return overrides ? JSON.parse(overrides) : {};
}

function setManualOverride(email, pointAdjustment, reason = '') {
  const overrides = getManualOverrides();
  overrides[email] = {
    adjustment: pointAdjustment,
    reason: reason,
    timestamp: new Date().toISOString(),
    appliedBy: 'admin' // Could be enhanced to track actual admin user
  };
  localStorage.setItem('nsbe_point_overrides', JSON.stringify(overrides));
  return true;
}

function removeManualOverride(email) {
  const overrides = getManualOverrides();
  delete overrides[email];
  localStorage.setItem('nsbe_point_overrides', JSON.stringify(overrides));
  return true;
}

function clearAllOverrides() {
  localStorage.removeItem('nsbe_point_overrides');
  return true;
}

// Create a LocalDataManager object for easier access
window.LocalDataManager = {
  fetchSignInData,
  fetchPaidMembers,
  isPaidMember,
  isPaidMemberEnhanced,
  buildEmailUniqnameMapping,
  calculateMemberPoints,
  generateLeaderboard,
  calculateTier,
  calculateDynamicTierThresholds,
  getLocalLeaderboard,
  getEmailUniqnameMapping: () => window.EMAIL_UNIQNAME_MAPPING,
  // Manual override functions
  getManualOverrides,
  setManualOverride,
  removeManualOverride,
  clearAllOverrides
};