// NSBE UofM Battle Pass - Local Data Manager
// Handles CSV data override and paid member verification

// Google Sheets IDs and configuration
const SHEETS_CONFIG = {
  SIGN_IN_SHEET_ID: '1VBgKrJ-loc18MJ0G5hHADz6ZBUJFS1-A7wP3YFx7yLk',
  SIGN_IN_SHEET_GID: '803070541',
  PAID_MEMBERS_SHEET_ID: '1INkzEpMsH8Ow85FtKv6DnbKxI1ysu6SKYsmu3JcXDKg',
  API_KEY: 'AIzaSyDSy7s_QYYX26D0ySIJQJ7zWAfBxUIGvOg'
};

// Application state
window.CSV_OVERRIDE_DATA = null;
window.CSV_CUTOFF_DATE = new Date('2025-09-26T00:00:00');
window.EMAIL_UNIQNAME_MAPPING = new Map();

// Function to parse and prepare CSV data for use in the system
async function parseCSVData() {
  try {
    const response = await fetch('./event_data.csv');
    const csvText = await response.text();
    
    // Parse CSV manually to handle the space-padded headers
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      console.warn('[CSV Parser] No data in CSV file');
      return [];
    }
    
    // Parse headers and normalize them
    const rawHeaders = lines[0].split(',');
    
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Split line into values, handling commas in quoted fields
      const values = [];
      let current = '';
      let inQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim()); // Add the last value
      
      // Create entry object
      const entry = {};
      rawHeaders.forEach((header, index) => {
        const cleanHeader = header.trim();
        entry[cleanHeader] = values[index] || '';
      });
      
      // Find the email field (handle variations in spacing)
      const emailField = rawHeaders.find(h => h.toLowerCase().includes('email'));
      const emailValue = emailField ? entry[emailField.trim()]?.trim() : '';
      
      if (emailField && emailValue) {
        // Normalize common fields for easier access
        entry['Email Address'] = emailValue;
        
        const eventField = rawHeaders.find(h => h.toLowerCase().includes('event'));
        entry['Event'] = eventField ? entry[eventField.trim()]?.trim() || '' : '';
        
        const uniqnameField = rawHeaders.find(h => h.toLowerCase().includes('uniqname'));
        entry['Uniqname'] = uniqnameField ? entry[uniqnameField.trim()]?.trim().toLowerCase() || '' : '';
        
        // Fix name field detection - look for "full name" with first/last indicators
        const nameField = rawHeaders.find(h => {
          const lowerH = h.toLowerCase();
          return lowerH.includes('full name') && (
            (lowerH.includes('first') && lowerH.includes('last')) ||
            (lowerH.includes('first') && lowerH.includes('&')) ||
            lowerH === 'full name'
          );
        });
        entry['Full Name'] = nameField ? entry[nameField.trim()]?.trim() || '' : '';
        
        // Fallback: if no full name found, try to use uniqname as display name
        if (!entry['Full Name'] && entry['Uniqname']) {
          entry['Full Name'] = entry['Uniqname'];
        }
        
        const timestampField = rawHeaders.find(h => h.toLowerCase().includes('timestamp'));
        entry['Timestamp'] = timestampField ? entry[timestampField.trim()]?.trim() || '' : '';
        
        // Only add if we have both email and event
        if (entry['Email Address'] && entry['Event']) {
          data.push(entry);
        }
      }
    }
    
    return data;
    
  } catch (error) {
    console.error('[CSV Parser] Error loading CSV:', error);
    return [];
  }
}

// Initialize CSV data (async)
parseCSVData().then(data => {
    window.CSV_OVERRIDE_DATA = data;
}).catch(error => {
    console.error('[CSV Parser] Failed to load CSV data:', error);
});

// Function to fetch sign-in data (CSV override + live data combined)
async function fetchSignInData() {
    // Start with CSV override data
    let csvData = [];
    if (window.CSV_OVERRIDE_DATA) {
        csvData = window.CSV_OVERRIDE_DATA;
    } else if (window.CSV_OVERRIDE_DATA === null) {
        // Wait for CSV data to load if not ready yet
        await new Promise(resolve => {
            const checkData = () => {
                if (window.CSV_OVERRIDE_DATA !== null) {
                    resolve();
                } else {
                    setTimeout(checkData, 100);
                }
            };
            checkData();
        });
        csvData = window.CSV_OVERRIDE_DATA || [];
    }
    
    // Try to get live data from new sign-in sheet
    let liveData = [];
    try {
        liveData = await getLiveSheetData();
    } catch (error) {
        console.warn('[Data Manager] Could not fetch live data, using CSV only:', error.message);
    }
    
    // Combine CSV and live data - include ALL events from both sources
    const combinedData = [...csvData];
    
    // Add ALL live data entries (they represent new events after CSV cutoff)
    for (const liveEntry of liveData) {
        const liveUniqname = (liveEntry['Uniqname'] || '').toLowerCase();
        if (liveUniqname) {
            // Add event timestamp if missing to distinguish from CSV events
            if (!liveEntry['Timestamp']) {
                liveEntry['Timestamp'] = new Date().toISOString();
            }
            combinedData.push(liveEntry);
        }
    }
    
    const liveEntriesAdded = combinedData.length - csvData.length;
    return combinedData;
}

// Function to fetch live Google Sheets sign-in data (for future use)
async function getLiveSheetData() {
    // URLs to try (multiple fallbacks for sheet access)
    const accessMethods = [
        // Method 1: CSV export with specific gid (most reliable)
        async () => {
            const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEETS_CONFIG.SIGN_IN_SHEET_ID}/export?format=csv&gid=${SHEETS_CONFIG.SIGN_IN_SHEET_GID}`;
            const response = await fetch(csvUrl);
            if (!response.ok) throw new Error(`CSV export with gid ${SHEETS_CONFIG.SIGN_IN_SHEET_GID} failed: ${response.status}`);
            
            const csvText = await response.text();
            
            // Parse CSV properly handling line breaks in fields and quoted values
            const parseCSV = (csvText) => {
                const result = [];
                const lines = csvText.split('\n');
                let currentRow = [];
                let inQuotedField = false;
                let currentField = '';
                
                for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
                    const line = lines[lineIndex];
                    
                    for (let i = 0; i < line.length; i++) {
                        const char = line[i];
                        
                        if (char === '"' && !inQuotedField) {
                            inQuotedField = true;
                        } else if (char === '"' && inQuotedField) {
                            inQuotedField = false;
                        } else if (char === ',' && !inQuotedField) {
                            currentRow.push(currentField.trim());
                            currentField = '';
                        } else {
                            currentField += char;
                        }
                    }
                    
                    // If we're in a quoted field, add a newline and continue
                    if (inQuotedField) {
                        currentField += ' '; // Replace newline with space for headers
                    } else {
                        // End of row
                        if (currentField.trim() || currentRow.length > 0) {
                            currentRow.push(currentField.trim());
                            if (currentRow.some(field => field)) { // Only add non-empty rows
                                result.push(currentRow);
                            }
                        }
                        currentRow = [];
                        currentField = '';
                    }
                }
                
                return result;
            };
            
            const parsedData = parseCSV(csvText);
            if (parsedData.length === 0) throw new Error('No CSV data');
            
            const values = parsedData;
            
            return { values };
        },
        // Method 2: CSV export with default gid
        async () => {
            const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEETS_CONFIG.SIGN_IN_SHEET_ID}/export?format=csv&gid=0`;
            const response = await fetch(csvUrl);
            if (!response.ok) throw new Error(`CSV export with gid=0 failed: ${response.status}`);
            
            const csvText = await response.text();
            const lines = csvText.split('\n').filter(line => line.trim());
            if (lines.length === 0) throw new Error('No CSV data');
            
            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            const values = [headers];
            
            for (let i = 1; i < lines.length; i++) {
                const row = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
                values.push(row);
            }
            
            return { values };
        },
        // Method 3: API with Sheet1
        async () => {
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_CONFIG.SIGN_IN_SHEET_ID}/values/Sheet1?key=${SHEETS_CONFIG.API_KEY}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error(`API Sheet1 failed: ${response.status}`);
            return await response.json();
        },
        // Method 4: API with Form Responses 1
        async () => {
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_CONFIG.SIGN_IN_SHEET_ID}/values/Form%20Responses%201?key=${SHEETS_CONFIG.API_KEY}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error(`API Form Responses 1 failed: ${response.status}`);
            return await response.json();
        }
    ];
    
    let data = null;
    let lastError = null;
    
    for (let i = 0; i < accessMethods.length; i++) {
        try {
            data = await accessMethods[i]();
            break;
        } catch (error) {
            lastError = error;
        }
    }
    
    if (!data) {
        console.warn('[Data Manager] All sign-in sheet access methods failed. Using CSV override data only.');
        return [];
    }
    
    if (!data.values || data.values.length === 0) {
        return [];
    }
    
    const headers = data.values[0];
    const processedData = [];
    
    for (let i = 1; i < data.values.length; i++) {
        const row = data.values[i];
        const entry = {};
        
        headers.forEach((header, index) => {
            entry[header] = row[index] || '';
        });
        
        // Process the new nationals-required fields
        if (entry['Email Address'] && entry['Email Address'].trim()) {
            // Normalize field names for consistency
            entry['Email Address'] = entry['Email Address'].trim();
            entry['Uniqname'] = (entry['Uniqname'] || '').trim();
            entry['Full Name'] = (entry['Full Name (First & Last)'] || entry['Full Name'] || '').trim();
            entry['Event'] = (entry['Event'] || '').trim();
            entry['Major'] = (entry['Major'] || '').trim();
            entry['Year'] = (entry['Year'] || '').trim();
            
            // Process other nationals-required fields (Major, Year) but not paid dues
            // Paid dues verification is handled only through the dedicated paid members sheet
            
            // Add timestamp if available
            entry['Timestamp'] = (entry['Timestamp'] || '').trim();
            
            processedData.push(entry);
        }
    }
    
    return processedData;
}

// Function to fetch paid members data
async function fetchPaidMembers() {
    try {
        // Use direct CSV export (more reliable for public sheets)
        const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEETS_CONFIG.PAID_MEMBERS_SHEET_ID}/export?format=csv&gid=0`;
        
        const response = await fetch(csvUrl);
        
        if (!response.ok) {
            console.error(`[Data Manager] Paid members CSV fetch error: ${response.status} - ${response.statusText}`);
            const errorText = await response.text();
            console.error('[Data Manager] Error details:', errorText);
            throw new Error(`Paid members CSV fetch error: ${response.status}`);
        }
        
        const csvText = await response.text();
        
        const lines = csvText.split('\n').filter(line => line.trim());
        
        if (lines.length <= 2) {
            console.warn('[Data Manager] Insufficient paid members data found');
            return [];
        }
        
        // Skip title row (row 0), use row 1 as headers
        const headerLine = lines[1];
        const headers = headerLine.split(',').map(h => h.trim().replace(/"/g, ''));
        
        const processedData = [];
        
        // Process data rows (starting from row 2)
        for (let i = 2; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            const entry = {};
            
            headers.forEach((header, index) => {
                entry[header] = values[index] || '';
            });
            
            processedData.push(entry);
        }
        
        return processedData;
    } catch (error) {
        console.error('[Data Manager] Error fetching paid members:', error);
        // For now, return empty array to allow testing with CSV data
        return [];
    }
}

// Enhanced paid member verification with multiple sources
async function isPaidMemberEnhanced(email) {
    try {
        // Method 1: Check the dedicated paid members sheet
        const paidMembersData = await fetchPaidMembers();
        
        // Only use the dedicated paid members sheet for dues verification
        // (Removed sign-in sheet national dues checking as requested)
        
        // If we can't fetch paid members data, check CSV data for paid status
        if (paidMembersData.length === 0) {
            // Check if user is in CSV with paid status
            const csvData = window.CSV_OVERRIDE_DATA || [];
            const csvEntry = csvData.find(entry => {
                const csvEmailField = Object.keys(entry).find(k => k.toLowerCase().includes('email'));
                const csvEmail = csvEmailField ? entry[csvEmailField] : '';
                return csvEmail && csvEmail.toLowerCase().trim() === email.toLowerCase().trim();
            });
            
            if (csvEntry) {
                // For now, treat all CSV entries as paid members (since they're historical NSBE members)
                return true;
            }
            
            // If not found anywhere, default to unpaid
            return false;
        }
        
        const normalizedEmail = email.toLowerCase().trim();
        
        // Check against all entries in the paid members sheet
        // As requested, treat everyone in the sheet as a paid member
        for (const member of paidMembersData) {
            for (const key in member) {
                const value = member[key];
                if (value && typeof value === 'string') {
                    // Check if this field contains an email
                    if (value.includes('@')) {
                        const memberEmail = value.toLowerCase().trim();
                        if (memberEmail === normalizedEmail) {
                            console.log(`[Paid Members] ✅ ${email} found as paid member`);
                            return true;
                        }
                    }
                }
            }
        }
        
        return false;
    } catch (error) {
        console.error(`[Paid Members] Error checking paid status for ${email}:`, error);
        // If there's an error, assume paid for now to allow testing
        return true;
    }
}

// Legacy paid member function (simplified)
async function isPaidMember(email) {
    return isPaidMemberEnhanced(email);
}

// Debug function to inspect the paid members sheet
async function debugPaidMembersSheet() {
    try {
        const paidMembersData = await fetchPaidMembers();
            
        return paidMembersData;
    } catch (error) {
        console.error('[Debug] Error inspecting paid members sheet:', error);
        return [];
    }
}

// Build email-to-uniqname mapping from sign-in data
function buildEmailUniqnameMapping(signInData) {
    window.EMAIL_UNIQNAME_MAPPING.clear();
    
    signInData.forEach(entry => {
        const email = entry['Email Address'];
        const uniqname = entry['Uniqname'];
        
        if (email && uniqname) {
            const normalizedEmail = email.toLowerCase().trim();
            const normalizedUniqname = uniqname.toLowerCase().trim();
            window.EMAIL_UNIQNAME_MAPPING.set(normalizedEmail, normalizedUniqname);
        }
    });
}

// Your original point system configuration
window.NEW_POINT_SYSTEM = {
  // Activity point values
  activities: {
    'GBM': 7,                           // General Body Meeting
    'Professional Development': 10,      // PD Events, workshops, panels
    'P-Zone': 5,                        // Peer Zone events
    'Mentorship Events': 7,             // Mentor mixers, speed mentoring
    'E-Board Meeting': 7,               // Leadership meetings
    'JEB Events': 7,                    // Junior Exec Board events
    'Community Service': 5,             // Volunteering events
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

// Calculate points for a member based on their activities (your original function)
function calculateMemberPointsOriginal(memberData, paidMembersList = [], memberHistory = []) {
  let basePoints = 0;
  const activities = [];
  
  // Extract data from form response using flexible column header matching
  const eventTypeHeaders = [
    'Event (1. GBM\n2. Professional Development\n3. P-Zone\n4. Mentorship Events\n5. E-Board Meeting\n6. JEB Events\n7. Community Service\n8. Convention Attendance)',
    'Event (1. GBM 2. Professional Development 3. P-Zone 4. Mentorship Events 5. E-Board Meeting 6. JEB Events 7. Community Service 8. Convention Attendance)',
    'Event Type',
    'Event',
    'What type of event is this?'
  ];
  
  let eventType = '';
  for (const header of eventTypeHeaders) {
    if (memberData[header]) {
      eventType = memberData[header];
      break;
    }
  }
  
  // If no exact match, try to find header containing "event"
  if (!eventType) {
    const eventHeader = Object.keys(memberData).find(key => 
      key.toLowerCase().includes('event') && memberData[key]
    );
    if (eventHeader) {
      eventType = memberData[eventHeader];
    }
  }
  
  const email = memberData['Email Address'] || memberData['Email'];
  const uniqname = memberData['Uniqname'] || memberData['uniqname'];
  const fullName = memberData['Full Name (First & Last)'] || memberData['Full Name'];
  // Handle friend referral fields with flexible matching (accounting for line breaks)
  const broughtFriend = memberData['Did you bring a friend?'] || 
                       memberData['Did you bring a friend ?'] || 
                       memberData['Brought Friend'];
  const friendCount = parseInt(memberData['How many (Enter a Number Only, e.g.1,2,3 etc.)'] || 
                              memberData['How many (Enter a Number)'] || 
                              memberData['Friend Count'] || '0');
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
    '8': 'Convention Attendance',
    '9': 'Social Events'
  };
  
  // Parse event type (could be number or text)
  let normalizedEventType = '';
  const eventTypeLower = eventType.toLowerCase();
  
  if (eventType.includes('1') || eventTypeLower.includes('gbm')) {
    normalizedEventType = 'GBM';
  } else if (eventType.includes('2') || eventTypeLower.includes('professional')) {
    normalizedEventType = 'Professional Development';
  } else if (eventType.includes('3') || eventTypeLower.includes('p-zone')) {
    normalizedEventType = 'P-Zone';
  } else if (eventType.includes('4') || eventTypeLower.includes('mentorship')) {
    normalizedEventType = 'Mentorship Events';
  } else if (eventType.includes('5') || eventTypeLower.includes('e-board')) {
    normalizedEventType = 'E-Board Meeting';
  } else if (eventType.includes('6') || eventTypeLower.includes('jeb')) {
    normalizedEventType = 'JEB Events';
  } else if (eventType.includes('7') || eventTypeLower.includes('community') || eventTypeLower.includes('service')) {
    normalizedEventType = 'Community Service';
  } else if (eventType.includes('8') || eventTypeLower.includes('convention')) {
    normalizedEventType = 'Convention Attendance';
  } else if (eventType.includes('9') || eventTypeLower.includes('social')) {
    normalizedEventType = 'Social Events';
  } else {
    normalizedEventType = 'Unknown Event';
  }
  
  // Get base points for event type
  eventPoints = window.NEW_POINT_SYSTEM.activities[normalizedEventType] || 0;
  
  // Special case: Community Service is always worth 5 points regardless of other factors
  if (normalizedEventType === 'Community Service') {
    eventPoints = 5; // All community service events worth 5 points
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
  
  // Apply 5-point cap for unpaid members (community service already at 5, so no change needed)
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

// Calculate member points and participation (adapted to work with CSV data but using your original logic)
async function calculateMemberPoints(signInData) {
    console.log('[Points] Calculating member points using original system...');
    
    const memberStats = {};
    
    // Fetch paid members data ONCE at the beginning
    const paidMembersList = await fetchPaidMembers();
    
    // Build email-to-uniqname mapping first
    buildEmailUniqnameMapping(signInData);
    
    // Create a Set of paid member emails for fast lookups (from paid members sheet)
    const paidMemberEmails = new Set();
    paidMembersList.forEach(member => {
        if (member.email) {
            paidMemberEmails.add(member.email.toLowerCase().trim());
        }
    });
    
    // Helper function to check if member is paid (using only paid members sheet and CSV data)
    const isPaidMemberFast = (email) => {
        const normalizedEmail = email.toLowerCase().trim();
        return (
            paidMemberEmails.has(normalizedEmail) ||  // From paid members sheet only
            // For CSV data, treat all as paid (historical NSBE members)
            (window.CSV_OVERRIDE_DATA && window.CSV_OVERRIDE_DATA.some(csvEntry => {
                const csvEmailField = Object.keys(csvEntry).find(k => k.toLowerCase().includes('email'));
                const csvEmail = csvEmailField ? csvEntry[csvEmailField] : '';
                return csvEmail && csvEmail.toLowerCase().trim() === normalizedEmail;
            }))
        );
    };
    
    // Process each entry
    for (const entry of signInData) {
        const email = entry['Email Address'];
        const uniqname = entry['Uniqname'];
        const fullName = entry['Full Name'] || entry['Full Name (First & Last)'];
        
        if (!email || !uniqname) continue;
        
        const normalizedEmail = email.toLowerCase().trim();
        const normalizedUniqname = uniqname.toLowerCase().trim();
        
        // Initialize member if not exists
        if (!memberStats[normalizedUniqname]) {
            // Determine best display name: Full Name > Uniqname > Email username
            let displayName = fullName;
            if (!displayName || displayName.trim() === '') {
                displayName = uniqname;
            }
            if (!displayName || displayName.trim() === '') {
                displayName = email.split('@')[0]; // Use email username as fallback
            }
            
            memberStats[normalizedUniqname] = {
                email: normalizedEmail,
                uniqname: normalizedUniqname,
                displayName: displayName,
                totalPoints: 0,
                eventHistory: [],
                eventCount: 0,
                isPaid: isPaidMemberFast(normalizedEmail) // Set paid status here
            };
        }
        
        // Calculate points for this specific event using your original system
        const pointResult = calculateMemberPointsOriginal(entry, paidMembersList, memberStats[normalizedUniqname].eventHistory);
        
        // Add to member's history and total if this is a new event
        const eventKey = `${pointResult.eventType}-${entry['Timestamp']}`;
        const alreadyExists = memberStats[normalizedUniqname].eventHistory.some(e => 
            e.eventType === pointResult.eventType && e.timestamp === pointResult.timestamp
        );
        
        if (!alreadyExists) {
            // Use the fast paid member check (already cached)
            const isPaidMember = memberStats[normalizedUniqname].isPaid;
            
            // Apply dues cap: Non-paying members are capped at 5 points per event
            let pointsToAdd = pointResult.totalPoints;
            if (!isPaidMember && pointsToAdd > 5) {
                pointsToAdd = 5;
                pointResult.duesCapped = true;
                pointResult.originalPoints = pointResult.totalPoints;
                pointResult.totalPoints = 5; // Update the point result for history
            }
            
            memberStats[normalizedUniqname].eventHistory.push(pointResult);
            memberStats[normalizedUniqname].totalPoints += pointsToAdd;
            memberStats[normalizedUniqname].eventCount++;
        }
    }
    
    console.log(`[Points] Calculated points for ${Object.keys(memberStats).length} members using original system (performance optimized)`);
    return memberStats;
}

// Generate leaderboard from member stats
function generateLeaderboard(memberStats) {
    console.log('[Leaderboard] Generating leaderboard...');
    
    const members = Object.values(memberStats);
    
    // Sort by total points (descending)
    members.sort((a, b) => b.totalPoints - a.totalPoints);
    
    // Calculate percentile-based tiers
    const totalMembers = members.length;
    const goldThreshold = Math.ceil(totalMembers * 0.25); // Top 25%
    const silverThreshold = Math.ceil(totalMembers * 0.50); // Next 25% (top 50% - top 25%)
    const bronzeThreshold = Math.ceil(totalMembers * 0.75); // Next 25% (top 75% - top 50%)
    // Bottom 25% are Participants
    
    console.log(`[Tiers] Calculating percentile-based tiers for ${totalMembers} members:`);
    console.log(`[Tiers] Gold: Top ${goldThreshold} members (25%)`);
    console.log(`[Tiers] Silver: Next ${silverThreshold - goldThreshold} members (25%)`);
    console.log(`[Tiers] Bronze: Next ${bronzeThreshold - silverThreshold} members (25%)`);
    console.log(`[Tiers] Participant: Bottom ${totalMembers - bronzeThreshold} members (25%)`);
    
    // Add tier information and rank to each member
    members.forEach((member, index) => {
        member.rank = index + 1;
        
        // Assign tier based on rank percentile
        if (index < goldThreshold) {
            member.tier = 'Gold';
        } else if (index < silverThreshold) {
            member.tier = 'Silver';
        } else if (index < bronzeThreshold) {
            member.tier = 'Bronze';
        } else {
            member.tier = 'Participant';
        }
        
        // Format for app compatibility (app expects these field names)
        member.name = member.displayName;
        member.score = member.totalPoints;
    });
    
    console.log(`[Leaderboard] Generated leaderboard with ${members.length} members using percentile-based tier system`);
    return members;
}

// Calculate tier based on rank position (percentile-based system)
// NOTE: This function is now deprecated in favor of percentile calculation in generateLeaderboard
// Kept for backward compatibility but tiers are now calculated based on ranking
function calculateTier(totalPoints, rank = null, totalMembers = null) {
    // If rank information is provided, use percentile-based calculation
    if (rank !== null && totalMembers !== null) {
        const percentile = rank / totalMembers;
        if (percentile <= 0.25) return 'Gold';      // Top 25%
        if (percentile <= 0.50) return 'Silver';    // Next 25%
        if (percentile <= 0.75) return 'Bronze';    // Next 25%
        return 'Participant';                       // Bottom 25%
    }
    
    // Fallback to old point-based system (deprecated)
    if (totalPoints >= window.NEW_POINT_SYSTEM.tiers.GOLD) return 'Gold';
    if (totalPoints >= window.NEW_POINT_SYSTEM.tiers.SILVER) return 'Silver';
    if (totalPoints >= window.NEW_POINT_SYSTEM.tiers.BRONZE) return 'Bronze';
    return 'Participant';
}

// Calculate tier thresholds (your original point-based system)
function calculateDynamicTierThresholds(leaderboard) {
    return {
        gold: window.NEW_POINT_SYSTEM.tiers.GOLD,
        silver: window.NEW_POINT_SYSTEM.tiers.SILVER, 
        bronze: window.NEW_POINT_SYSTEM.tiers.BRONZE,
        participant: window.NEW_POINT_SYSTEM.tiers.PARTICIPANT,
        total: leaderboard.length
    };
}

// Get local leaderboard (main function used by the app)
async function getLocalLeaderboard() {
    console.log('[Main] Getting local leaderboard...');
    
    try {
        const signInData = await fetchSignInData();
        console.log(`[Main] Loaded ${signInData.length} sign-in records`);
        
        const memberStats = await calculateMemberPoints(signInData);
        const leaderboard = generateLeaderboard(memberStats);
        const tierThresholds = calculateDynamicTierThresholds(leaderboard);
        
        console.log('[Main] Leaderboard generated successfully');
        
        // Return in the format expected by the app
        return {
            leaderboard: leaderboard,
            tierThresholds: tierThresholds,
            totalMembers: leaderboard.length
        };
    } catch (error) {
        console.error('[Main] Error generating leaderboard:', error);
        return {
            leaderboard: [],
            tierThresholds: { gold: 0, silver: 0, bronze: 0, total: 0 },
            totalMembers: 0
        };
    }
}

// Get member's attendance history
async function getMemberAttendanceHistory(memberIdentifier) {
    console.log(`[Attendance] Getting attendance history for: ${memberIdentifier}`);
    
    try {
        const signInData = await fetchSignInData();
        const memberStats = await calculateMemberPoints(signInData);
        
        // Find member by email, uniqname, or display name
        const identifier = memberIdentifier.toLowerCase().trim();
        let targetMember = null;
        
        for (const uniqname in memberStats) {
            const member = memberStats[uniqname];
            if (
                member.uniqname.toLowerCase().includes(identifier) ||
                member.email.toLowerCase().includes(identifier) ||
                member.displayName.toLowerCase().includes(identifier) ||
                identifier.includes(member.uniqname.toLowerCase()) ||
                identifier.includes(member.displayName.toLowerCase())
            ) {
                targetMember = member;
                break;
            }
        }
        
        if (!targetMember) {
            console.log(`[Attendance] No member found matching: ${memberIdentifier}`);
            return null;
        }
        
        // Sort events by timestamp (most recent first)
        const sortedHistory = [...targetMember.eventHistory].sort((a, b) => {
            const timeA = new Date(a.timestamp || 0).getTime();
            const timeB = new Date(b.timestamp || 0).getTime();
            return timeB - timeA;
        });
        
        // Format attendance history
        const attendanceHistory = {
            member: {
                displayName: targetMember.displayName,
                uniqname: targetMember.uniqname,
                email: targetMember.email,
                totalPoints: targetMember.totalPoints,
                eventCount: targetMember.eventCount,
                isPaid: targetMember.isPaid,
                tier: targetMember.tier || 'Calculating...'
            },
            events: sortedHistory.map((event, index) => ({
                id: index + 1,
                eventType: event.eventType || 'Unknown Event',
                pointsEarned: event.totalPoints || 0,
                originalPoints: event.originalPoints || event.totalPoints || 0,
                duesCapped: event.duesCapped || false,
                timestamp: event.timestamp || 'Unknown Date',
                formattedDate: event.timestamp ? new Date(event.timestamp).toLocaleDateString() : 'Unknown Date',
                broughtFriend: event.broughtFriend || false,
                friendCount: event.friendCount || 0,
                friendPoints: event.friendPoints || 0,
                hadVolunteeringBonus: event.hasVolunteeringBonus || false
            })),
            summary: {
                totalEvents: sortedHistory.length,
                totalPoints: targetMember.totalPoints,
                averagePointsPerEvent: sortedHistory.length > 0 ? Math.round((targetMember.totalPoints / sortedHistory.length) * 10) / 10 : 0,
                cappedEvents: sortedHistory.filter(event => event.duesCapped).length,
                friendReferrals: sortedHistory.filter(event => event.friendCount > 0).length,
                volunteeringBonuses: sortedHistory.filter(event => event.hasVolunteeringBonus).length
            }
        };
        
        console.log(`[Attendance] Found ${attendanceHistory.events.length} events for ${targetMember.displayName}`);
        return attendanceHistory;
        
    } catch (error) {
        console.error('[Attendance] Error getting attendance history:', error);
        return null;
    }
}

// Get member stats for badge tracking
async function getMemberStats(memberIdentifier) {
    try {
        const signInData = await fetchSignInData();
        const memberStats = await calculateMemberPoints(signInData);
        
        // Find member by email, uniqname, or display name
        const identifier = memberIdentifier.toLowerCase().trim();
        let targetMember = null;
        
        for (const uniqname in memberStats) {
            const member = memberStats[uniqname];
            if (
                member.uniqname.toLowerCase().includes(identifier) ||
                member.email.toLowerCase().includes(identifier) ||
                member.displayName.toLowerCase().includes(identifier) ||
                identifier.includes(member.uniqname.toLowerCase()) ||
                identifier.includes(member.displayName.toLowerCase())
            ) {
                targetMember = member;
                break;
            }
        }
        
        if (!targetMember) {
            return null;
        }
        
        // Count events by category for badge tracking
        const eventCounts = {};
        const eventCategories = new Set();
        
        targetMember.eventHistory.forEach(event => {
            const eventType = event.eventType || 'Unknown';
            eventCounts[eventType] = (eventCounts[eventType] || 0) + 1;
            eventCategories.add(eventType);
        });
        
        // Format for badge system
        const badgeStats = {
            // Basic info
            member: targetMember.displayName,
            uniqname: targetMember.uniqname,
            email: targetMember.email,
            paid_member: targetMember.isPaid ? 'Yes' : 'No',
            
            // Event counts (match badge requirements)
            'GBM': eventCounts['GBM'] || 0,
            'Professional Development': eventCounts['Professional Development'] || 0,
            'Convention Attendance': eventCounts['Convention Attendance'] || 0,
            'Community Service': eventCounts['Community Service'] || 0,
            'Social Events': eventCounts['Social Events'] || 0,
            'P-Zone': eventCounts['P-Zone'] || 0,
            'Mentorship Events': eventCounts['Mentorship Events'] || 0,
            
            // Totals
            total_events: targetMember.eventCount,
            total_points: targetMember.totalPoints,
            event_categories: eventCategories.size,
            
            // Event history for debugging
            eventHistory: targetMember.eventHistory
        };
        
        return badgeStats;
        
    } catch (error) {
        console.error('[Badge Tracker] Error getting member stats:', error);
        return null;
    }
}

// LocalDataManager class for admin dashboard
class LocalDataManager {
  constructor() {
    this.memberData = null;
    this.liveData = null;
  }

  async loadMemberData() {
    if (!this.memberData) {
      console.log('🔄 Loading member data...');
      const leaderboard = await getLocalLeaderboard();
      this.memberData = leaderboard;
    }
    return this.memberData;
  }

  async getLiveSheetData() {
    if (!this.liveData) {
      console.log('🔄 Loading live sheet data...');
      this.liveData = await getLiveSheetData();
    }
    return this.liveData;
  }

  calculateLeaderboard(memberData) {
    // Ensure memberData is an array
    if (!Array.isArray(memberData)) {
      console.warn('memberData is not an array:', typeof memberData, memberData);
      return [];
    }
    
    // Return memberData with rank information
    return memberData.map((member, index) => ({
      ...member,
      rank: index + 1
    }));
  }

  calculateMemberBadges(uniqname, memberData) {
    // Find the member
    const member = memberData.find(m => m.uniqname === uniqname);
    if (!member) return [];

    // Calculate badges using existing badge system
    if (!window.TRACKABLE_BADGES_CONFIG) return [];

    return window.TRACKABLE_BADGES_CONFIG.map(badgeConfig => {
      let earned = false;
      let progress = 0;
      let progressText = 'Not started';

      try {
        // Use the existing badge calculation logic
        switch (badgeConfig.id) {
          case 'firstEvent':
            earned = member.totalPoints > 0;
            progress = earned ? 1 : 0;
            progressText = earned ? 'Completed' : 'Attend your first event';
            break;
          case 'regular':
            const requiredEvents = 3;
            const attendedEvents = member.events ? member.events.length : 0;
            earned = attendedEvents >= requiredEvents;
            progress = Math.min(attendedEvents / requiredEvents, 1);
            progressText = earned ? 'Completed' : `${attendedEvents}/${requiredEvents} events`;
            break;
          case 'dedicated':
            const requiredDedicated = 5;
            const attendedDedicated = member.events ? member.events.length : 0;
            earned = attendedDedicated >= requiredDedicated;
            progress = Math.min(attendedDedicated / requiredDedicated, 1);
            progressText = earned ? 'Completed' : `${attendedDedicated}/${requiredDedicated} events`;
            break;
          case 'loyalist':
            const requiredLoyalist = 8;
            const attendedLoyalist = member.events ? member.events.length : 0;
            earned = attendedLoyalist >= requiredLoyalist;
            progress = Math.min(attendedLoyalist / requiredLoyalist, 1);
            progressText = earned ? 'Completed' : `${attendedLoyalist}/${requiredLoyalist} events`;
            break;
          case 'goldTier':
            earned = member.tier === 'Gold';
            progress = earned ? 1 : 0;
            progressText = earned ? 'Completed' : 'Reach Gold tier';
            break;
          default:
            progressText = 'Progress not tracked';
        }
      } catch (error) {
        console.warn('Error calculating badge:', badgeConfig.id, error);
      }

      return {
        id: badgeConfig.id,
        name: badgeConfig.name,
        icon: badgeConfig.icon,
        desc: badgeConfig.desc,
        earned,
        progress,
        progressText,
        color: badgeConfig.color,
        glow: badgeConfig.glow
      };
    });
  }
}

// Expose functions to global scope
window.fetchSignInData = fetchSignInData;
window.fetchPaidMembers = fetchPaidMembers;
window.getLiveSheetData = getLiveSheetData;
window.isPaidMember = isPaidMember;
window.isPaidMemberEnhanced = isPaidMemberEnhanced;
window.buildEmailUniqnameMapping = buildEmailUniqnameMapping;
window.calculateMemberPoints = calculateMemberPoints;
window.generateLeaderboard = generateLeaderboard;
window.calculateTier = calculateTier;
window.calculateDynamicTierThresholds = calculateDynamicTierThresholds;
window.parseCSVData = parseCSVData;
window.getLocalLeaderboard = getLocalLeaderboard;
window.debugPaidMembersSheet = debugPaidMembersSheet;
window.getMemberAttendanceHistory = getMemberAttendanceHistory;
window.getMemberStats = getMemberStats;

// Expose LocalDataManager class
window.LocalDataManager = LocalDataManager;