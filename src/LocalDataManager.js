// NSBE UofM Battle Pass - Local Data Manager
// Handles CSV data override and paid member verification

// Google Sheets IDs and configuration
const SHEETS_CONFIG = {
  // SECURE: Apps Script endpoint - only exposes Timestamp, Uniqname, Event (no PII)
  SIGN_IN_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbz-XkiwyBLy4dGVBDg9sdDiXSAodHc5hHovW2oXy3hzHTJHdbi97g0CUQR8APDXYVk9Mg/exec',
  // Legacy direct sheet access (kept for fallback, but sheet should be private)
  SIGN_IN_SHEET_ID: '13V1DAObDLnUP48n7Tv70aPfU_B26SklxCsz-RLs1fjk',
  SIGN_IN_SHEET_GID: '1227397870', // "Form Responses 1" tab
  PAID_MEMBERS_SHEET_ID: '1INkzEpMsH8Ow85FtKv6DnbKxI1ysu6SKYsmu3JcXDKg',
  API_KEY: 'AIzaSyDSy7s_QYYX26D0ySIJQJ7zWAfBxUIGvOg'
};

// Member demographics mapping
const MEMBER_DEMOGRAPHICS = {
    'makaelaw': { major: 'Civil Engineering, Architecture', year: '2nd' },
    'ericahay': { major: 'Computer Science (LSA)', year: '3rd' },
    'natoriaw': { major: 'Mechanical Engineering', year: '5th+' },
    'mdlong': { major: 'Industrial and Operations Engineering', year: '3rd' },
    'ericdom': { major: 'Biomedical Engineering', year: '2nd' },
    'bsnkpah': { major: 'Data Science', year: '4th' },
    'devinmap': { major: 'Materials Science and Engineering', year: '5th+' },
    'ugonnao': { major: 'Computer Science (CoE)', year: '4th' },
    'malawis': { major: 'Computer Science (LSA)', year: '4th' },
    'desta': { major: 'Civil Engineering', year: '3rd' },
    'giannaw': { major: 'Electrical Engineering', year: '4th' },
    'cmonie': { major: 'Industrial and Operations Engineering', year: '3rd' },
    'cjakombi': { major: 'Mechanical Engineering', year: '4th' },
    'regind': { major: 'Electrical Engineering', year: '3rd' },
    'kingjj': { major: 'Urban Technology', year: '3rd' },
    'plafave': { major: 'Biomedical Engineering, Cellular and Molecular Biomedical Sciences', year: '4th' },
    'sayoodus': { major: 'Computer Science (LSA)', year: '2nd' },
    'msmbayo': { major: 'Computer Science (LSA)', year: '2nd' },
    'brynnw': { major: 'Computer Science (LSA)', year: '2nd' },
    'kwabenaf': { major: 'Mechanical Engineering', year: '2nd' },
    'donjm': { major: 'Computer Engineering', year: '5th+' },
    'landond': { major: 'Computer Science (LSA)', year: '2nd' },
    'daniecam': { major: 'Civil Engineering', year: '3rd' },
    'hunegnaw': { major: 'Industrial and Operations Engineering', year: '2nd' },
    'adna@umich.edu': { major: 'Civil Engineering', year: '4th' },
    'owadugea': { major: 'Computer Science (LSA)', year: '4th' },
    'ariaf': { major: 'Computer Science (LSA)', year: '3rd' },
    'laurennn': { major: 'Biomedical Engineering', year: '5th+' },
    'ayeyiyp': { major: 'Civil Engineering', year: '4th' },
    'obiohac': { major: 'Computer Science (LSA)', year: '2nd' },
    'aressom': { major: 'Computer Science (LSA)', year: '2nd' },
    'gpears': { major: 'Biomedical Engineering', year: '3rd' },
    'samueltk@umich.edu': { major: 'Computer Science (CoE)', year: '3rd' },
    'akodjo': { major: 'Electrical Engineering', year: '3rd' },
    'bsoumare': { major: 'Biomedical Engineering', year: '4th' },
    'kylemoni': { major: 'Electrical Engineering', year: '1st' },
    'kaibilal': { major: 'Engineering Physics', year: '1st' },
    'grcesar': { major: 'Industrial and Operations Engineering, Robotics, Undeclared', year: '1st' },
    'stjulius': { major: 'Computer Engineering', year: '1st' },
    'alexbing': { major: 'Computer Science (CoE)', year: '1st' },
    'aayungo': { major: 'Computer Science (CoE)', year: '1st' },
    'jjbishaw': { major: 'Computer Science (CoE)', year: '1st' },
    'haarun': { major: 'Computer Science (LSA)', year: '1st' },
    'mekiyabe': { major: 'Biomedical Engineering, Undeclared', year: '1st' },
    'aphall': { major: 'Biomedical Engineering', year: '1st' },
    'onimisi': { major: 'Computer Engineering', year: '1st' },
    'kerylfo@umich.edu': { major: 'Electrical Engineering', year: '1st' },
    'kmonie': { major: 'Mechanical Engineering', year: '1st' },
    'njokuc': { major: 'Mechanical Engineering', year: '1st' },
    'tparham': { major: 'Undeclared', year: '1st' },
    'gomarr': { major: 'Computer Science (LSA)', year: '1st' },
    'lsfifer': { major: 'Computer Science (LSA)', year: '1st' },
    'matipa': { major: 'Computer Science (CoE)', year: '1st' },
    'rareno': { major: 'Mechanical Engineering', year: '2nd' },
    'jadlewis': { major: 'Naval Architecture and Marine Engineering', year: '4th' },
    'hadegbit': { major: 'Mechanical Engineering', year: '3rd' },
    'tchonang': { major: 'Industrial and Operations Engineering', year: '4th' },
    'justn': { major: 'Computer Science (CoE)', year: '1st' },
    'lindsis': { major: 'Electrical Engineering', year: '1st' },
    'dcadjer': { major: 'Undeclared', year: '1st' },
    'kenley': { major: 'Electrical Engineering', year: '4th' },
    'dantepar': { major: 'Computer Science (LSA)', year: '2nd' },
    'howardsl': { major: 'Computer Science (LSA)', year: '4th' },
    'gavynw': { major: 'Mechanical Engineering', year: '1st' },
    'ghonore': { major: 'Aerospace Engineering', year: '2nd' },
    'mdinku': { major: 'Chemical Engineering', year: '2nd' },
    'layiolus': { major: 'Computer Science (LSA)', year: '4th' },
    'jaedarae': { major: 'Biomedical Engineering', year: '2nd' },
    'uneak': { major: 'Electrical Engineering', year: '4th' },
    'jadaree': { major: 'Materials Science and Engineering', year: '3rd' },
    'dtellis': { major: 'Computer Science (LSA)', year: '1st' },
    'mseade': { major: 'Computer Science (LSA)', year: '1st' },
    'zakyahe': { major: 'Chemical Engineering', year: '4th' },
    'travic': { major: 'Mechanical Engineering', year: '5th+' },
    'ihairsto': { major: 'Computer Engineering', year: '4th' },
    'nnennabr': { major: 'Biomedical Engineering', year: '3rd' },
    'achoroj': { major: 'Computer Science (CoE)', year: '2nd' },
    'odumk': { major: 'Computer Science (LSA)', year: '3rd' },
    'mirionb': { major: 'Aerospace Engineering', year: '2nd' },
    'jodhiamb': { major: 'Public policy', year: '4th' },
    'sjjohn': { major: 'Industrial and Operations Engineering', year: '1st' },
    'shantiah': { major: 'Electrical Engineering', year: '3rd' },
    'sbroddie': { major: 'Electrical Engineering', year: '5th+' },
    'wcjulian': { major: 'Mechanical Engineering', year: '1st' },
    'orukotan': { major: 'Biomedical Engineering', year: '1st' }
};

// Paid members are tracked via Google Sheet: https://docs.google.com/spreadsheets/d/1INkzEpMsH8Ow85FtKv6DnbKxI1ysu6SKYsmu3JcXDKg
// Everyone whose name appears in that sheet is considered a paid member
// No hardcoded list needed - the sheet is the source of truth

// Application state
window.CSV_OVERRIDE_DATA = null;
window.CSV_CUTOFF_DATE = new Date('2025-09-26T00:00:00');
window.EMAIL_UNIQNAME_MAPPING = new Map();

// Semester configuration - Points reset for Winter 2026
// Events before this date are archived for records but don't count towards current leaderboard
const SEMESTER_CONFIG = {
    currentSemester: 'Winter 2026',
    // Only events on or after January 1, 2026 count for points
    pointsCutoffDate: new Date('2026-01-01T00:00:00'),
    // Live secure feed sometimes omits timestamp; treat undated rows as current semester.
    countUndatedAsCurrentSemester: true,
    // Keep all attendance records for historical tracking
    archiveAllAttendance: true
};

// Export for use in other modules
window.SEMESTER_CONFIG = SEMESTER_CONFIG;

// Helper function to check if an event counts for current semester points
function isEventInCurrentSemester(timestamp) {
    if (!timestamp || (typeof timestamp === 'string' && !timestamp.trim())) {
        return SEMESTER_CONFIG.countUndatedAsCurrentSemester === true;
    }
    
    // Parse various timestamp formats (MM/DD/YYYY, M/D/YYYY, etc.)
    let eventDate;
    
    if (typeof timestamp === 'string') {
        // Handle Google Sheets format: "1/15/2026 10:30:00" or "01/15/2026"
        const datePart = timestamp.split(/[\s,]+/)[0]; // Get date part only
        const parts = datePart.split('/');
        if (parts.length === 3) {
            const month = parseInt(parts[0], 10) - 1; // JS months are 0-indexed
            const day = parseInt(parts[1], 10);
            const year = parseInt(parts[2], 10);
            eventDate = new Date(year, month, day);
        } else {
            eventDate = new Date(timestamp);
        }
    } else {
        eventDate = new Date(timestamp);
    }
    
    // Check if valid date and on/after cutoff
    if (isNaN(eventDate.getTime())) {
        console.warn('[Semester] Invalid date format:', timestamp);
        return SEMESTER_CONFIG.countUndatedAsCurrentSemester === true;
    }
    
    return eventDate >= SEMESTER_CONFIG.pointsCutoffDate;
}

window.isEventInCurrentSemester = isEventInCurrentSemester;

// Cache for API requests with timestamps
const API_CACHE = {
    paidMembers: { data: null, timestamp: 0, ttl: 5 * 60 * 1000 }, // 5 minutes cache
    signInData: { data: null, timestamp: 0, ttl: 2 * 60 * 1000 }   // 2 minutes cache
};

// Function to manually clear API cache (useful for debugging)
window.clearAPICache = function() {
    API_CACHE.paidMembers.data = null;
    API_CACHE.paidMembers.timestamp = 0;
    API_CACHE.signInData.data = null;
    API_CACHE.signInData.timestamp = 0;
    console.log('[Data Manager] API cache cleared');
};

// Check if running from file:// protocol and warn
if (window.location.protocol === 'file:') {
    console.warn('⚠️ [Data Manager] Running from file:// protocol may cause CORS issues.');
    console.warn('💡 [Data Manager] For best results, serve via HTTP: python3 test-server.py');
}

// Rate limiting helper with exponential backoff
async function fetchWithRetry(url, maxRetries = 2, initialDelay = 2000) {
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(url);
            
            if (response.ok) {
                return response;
            }
            
            // If rate limited, wait longer
            if (response.status === 429) {
                const delay = initialDelay * Math.pow(2, attempt);
                console.warn(`[Data Manager] Rate limited. Waiting ${delay}ms before retry ${attempt + 1}/${maxRetries}`);
                
                if (attempt < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }
            }
            
            lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
            
        } catch (error) {
            lastError = error;
            console.error(`[Data Manager] Fetch attempt ${attempt + 1} failed:`, error.message);
            
            if (attempt < maxRetries) {
                const delay = initialDelay * Math.pow(2, attempt);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    
    throw lastError;
}

// =====================================================
// WINTER 2026 - CLEAN SLATE
// All Fall 2025 data is archived in: data/FALL_2025_FINAL_LEADERBOARD.csv
// Now using only live Google Sheets data via secure Apps Script
// Legacy CSV parsing has been removed for clean slate
// =====================================================

// No legacy CSV data - fresh start for Winter 2026
window.CSV_OVERRIDE_DATA = [];

// Function to fetch sign-in data (now uses only live Apps Script data)
async function fetchSignInData() {
    // Get live data from secure Apps Script endpoint
    let liveData = [];
    try {
        liveData = await getLiveSheetData();
        console.log(`[Data Manager] ✅ Fetched ${liveData.length} entries from live data`);
    } catch (error) {
        console.error('[Data Manager] ❌ Could not fetch live data:', error.message);
        return [];
    }
    
    // AUTO-CLEANSE DATA: Standardize event types and remove duplicates
    if (window.DataCleanser && liveData.length > 0) {
        console.log('🧹 [Data Cleanser] Auto-cleansing sign-in data...');
        const cleanser = new window.DataCleanser();
        const { cleansedData, report, corrections } = cleanser.cleanseData(liveData);
        
        // Store cleansing stats globally for admin dashboard
        window.CLEANSING_STATS = corrections;
        
        // Log cleansing results
        if (corrections.eventTypesFixed > 0 || corrections.duplicatesRemoved > 0) {
            console.log('✅ [Data Cleanser] Cleansing complete:', corrections);
            console.log(report);
        } else {
            console.log('✅ [Data Cleanser] No issues found - data already clean');
        }
        
        return cleansedData;
    }
    
    return liveData;
}

// Function to fetch live Google Sheets sign-in data (for future use)
async function getLiveSheetData() {
    // Check cache first
    const now = Date.now();
    const cached = API_CACHE.signInData;
    
    if (cached.data && (now - cached.timestamp) < cached.ttl) {
        console.log('[Data Manager] Using cached sign-in data');
        return cached.data;
    }
    
    // URLs to try (multiple fallbacks for sheet access)
    const accessMethods = [
        // Method 1 (PRIMARY): Secure Apps Script endpoint - only exposes safe data
        async () => {
            console.log('[Data Manager] Fetching from secure Apps Script endpoint...');
            const response = await fetchWithRetry(SHEETS_CONFIG.SIGN_IN_SCRIPT_URL, 2, 3000);
            if (!response.ok) throw new Error(`Apps Script failed: ${response.status}`);
            
            const jsonData = await response.json();
            if (!jsonData.values || jsonData.values.length === 0) throw new Error('No data from Apps Script');
            
            console.log(`[Data Manager] ✅ Got ${jsonData.values.length - 1} entries from secure endpoint`);
            return { source: 'apps-script', values: jsonData.values };
        },
        // Method 2 (FALLBACK): CSV export with specific gid
        async () => {
            console.log('[Data Manager] Fallback: trying CSV export...');
            const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEETS_CONFIG.SIGN_IN_SHEET_ID}/export?format=csv&gid=${SHEETS_CONFIG.SIGN_IN_SHEET_GID}`;
            const response = await fetchWithRetry(csvUrl, 1, 3000);
            if (!response.ok) throw new Error(`CSV export with gid ${SHEETS_CONFIG.SIGN_IN_SHEET_GID} failed: ${response.status}`);
            
            const csvText = await response.text();
            
            // Check if we got HTML (login page) instead of CSV
            if (csvText.includes('<!DOCTYPE html>') || csvText.includes('<html')) {
                throw new Error('CSV export requires authentication - sheet may be private');
            }
            
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
            
            return { source: 'csv-export', values };
        }
    ];

    let appsScriptData = null;
    let csvExportData = null;

    for (let i = 0; i < accessMethods.length; i++) {
        try {
            const result = await accessMethods[i]();
            if (result?.source === 'csv-export') {
                csvExportData = result;
            } else if (result?.source === 'apps-script') {
                appsScriptData = result;
            }
        } catch (error) {
            console.warn(`[Data Manager] Access method ${i + 1} failed:`, error.message);
        }
    }

    // Prefer CSV export when available because it contains full sheet history.
    const data = csvExportData || appsScriptData;

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
        
        // Handle both old format (with Email) and new secure format (Uniqname only)
        const hasUniqname = entry['Uniqname'] && entry['Uniqname'].trim();
        const hasEmail = entry['Email Address'] && entry['Email Address'].trim();
        
        if (hasUniqname || hasEmail) {
            // Normalize field names for consistency
            entry['Uniqname'] = (entry['Uniqname'] || '').trim();
            entry['Email Address'] = (entry['Email Address'] || '').trim();
            entry['Full Name'] = (entry['Full Name (First & Last)'] || entry['Full Name'] || '').trim();
            const rawEvent = entry['Event'] || entry['Event Type'] || entry['What type of event is this?'] || '';
            const rawTimestamp = entry['Timestamp'] || entry['Column 1'] || entry['Date'] || '';

            entry['Event'] = rawEvent.trim();
            entry['Major'] = (entry['Major'] || '').trim();
            entry['Year'] = (entry['Year'] || '').trim();
            
            // Add timestamp if available (supports alternate export headers)
            entry['Timestamp'] = rawTimestamp.trim();
            
            // If no email but has uniqname, generate email from uniqname
            if (!entry['Email Address'] && entry['Uniqname']) {
                entry['Email Address'] = `${entry['Uniqname'].toLowerCase()}@umich.edu`;
            }
            
            processedData.push(entry);
        }
    }
    
    // Update cache
    API_CACHE.signInData.data = processedData;
    API_CACHE.signInData.timestamp = Date.now();
    
    console.log(`[Data Manager] Fetched ${processedData.length} live sign-in entries from ${data.source} (cached for ${API_CACHE.signInData.ttl / 1000}s)`);
    
    return processedData;
}

// Function to fetch paid members data
async function fetchPaidMembers() {
    // Check cache first
    const now = Date.now();
    const cached = API_CACHE.paidMembers;
    
    // Validate cached data format - should be array of objects, not array of arrays
    if (cached.data && (now - cached.timestamp) < cached.ttl) {
        if (cached.data.length > 0 && typeof cached.data[0] === 'object' && !Array.isArray(cached.data[0])) {
            console.log('[Data Manager] Using cached paid members data');
            return cached.data;
        } else {
            console.warn('[Data Manager] Cache has invalid format, re-fetching...');
        }
    }
    
    try {
        // Use direct CSV export (more reliable for public sheets)
        const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEETS_CONFIG.PAID_MEMBERS_SHEET_ID}/export?format=csv&gid=0`;
        
        const response = await fetchWithRetry(csvUrl, 1, 3000); // Reduced retries, longer initial delay
        
        if (!response.ok) {
            console.error(`[Data Manager] Paid members fetch failed: ${response.status}`);
            // Return cached data if available, even if expired
            if (cached.data) {
                console.warn('[Data Manager] Using expired cache due to fetch failure');
                return cached.data;
            }
            return [];
        }
        
        const csvText = await response.text();
        
        const lines = csvText.split('\n').filter(line => line.trim());
        
        if (lines.length <= 2) {
            console.warn('[Data Manager] Insufficient paid members data found');
            return [];
        }
        
        // This sheet has no header row - just a title row and data
        // Columns are: [blank, ID, First Name, Last Name, Year, Date, National Dues, Email]
        const headers = ['', 'ID', 'First Name', 'Last Name', 'Year', 'Date', 'National Dues', 'email'];
        
        console.log('[Data Manager] Using manual headers for paid members:', headers);
        
        const processedData = [];
        
        // Process data rows (starting from row 1 - no header row exists!)
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            // Better CSV parsing that handles quoted commas
            const values = [];
            let currentValue = '';
            let inQuotes = false;
            
            for (let j = 0; j < line.length; j++) {
                const char = line[j];
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    values.push(currentValue.trim());
                    currentValue = '';
                } else {
                    currentValue += char;
                }
            }
            values.push(currentValue.trim()); // Add last value
            
            const entry = {};
            headers.forEach((header, index) => {
                entry[header] = values[index] || '';
            });
            
            processedData.push(entry);
        }
        
        // Update cache
        API_CACHE.paidMembers.data = processedData;
        API_CACHE.paidMembers.timestamp = now;
        
        console.log(`[Data Manager] Fetched ${processedData.length} paid members (cached for ${cached.ttl / 1000}s)`);
        if (processedData.length > 0) {
            console.log('[Data Manager] Sample parsed entry:', processedData[0]);
        }
        
        return processedData;
    } catch (error) {
        console.error('[Data Manager] Error fetching paid members:', error.message);
        
        // Return cached data if available, even if expired
        if (cached.data) {
            console.warn('[Data Manager] Using expired cache due to error');
            return cached.data;
        }
        
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
    'Mentorship': 7,                    // Alias for Mentorship Events
    'E-Board Meeting': 7,               // Leadership meetings
    'JEB Events': 7,                    // Junior Exec Board events
    'Community Service': 5,             // Volunteering events
    'Convention Attendance': 15,        // Regional/National conventions
    'Conference': 15,                   // Alias for Convention Attendance
    'Social Events': 7,                 // BBQ, flag football, game nights
    'Social': 7,                        // Alias for Social Events
    'Academic': 5,                      // Study sessions, academic events
    'Tabling': 3,                       // Tabling events
    'PCI': 5,                           // Pre-college initiative events
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
    'Event (If you are unsure ask an E-board member, false reporting will result in a lack of points)',
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
  } else if (eventType.includes('2') || eventTypeLower.includes('professional') || eventTypeLower === 'pd') {
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
  } else if (eventType.includes('8') || eventTypeLower.includes('convention') || eventTypeLower.includes('conference')) {
    normalizedEventType = 'Convention Attendance';
  } else if (eventType.includes('9') || eventTypeLower.includes('social')) {
    normalizedEventType = 'Social Events';
  } else if (eventTypeLower.includes('academic') || eventTypeLower.includes('study')) {
    normalizedEventType = 'Academic';
  } else if (eventTypeLower.includes('tabling')) {
    normalizedEventType = 'Tabling';
  } else if (eventTypeLower.includes('pci')) {
    normalizedEventType = 'PCI';
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
    console.log(`[Demographics] Loaded ${paidMembersList.length} paid members for demographics merge`);
    if (paidMembersList.length > 0) {
        const sample = paidMembersList[0];
        console.log('[Demographics] Sample paid member fields:', Object.keys(sample));
        console.log('[Demographics] Sample data:', {
            email: sample.email,
            Major: sample.Major,
            Year: sample.Year,
            'National Dues': sample['National Dues']
        });
    }
    
    // Build email-to-uniqname mapping first
    buildEmailUniqnameMapping(signInData);
    
    // Create a Set of paid member emails for fast lookups (from paid members sheet)
    const paidMemberEmails = new Set();
    paidMembersList.forEach(member => {
        if (member.email) {
            paidMemberEmails.add(member.email.toLowerCase().trim());
        }
    });
    
    // Helper function to check if member is paid (using paid members sheet only)
    // The Google Sheet is the source of truth for paid members
    const isPaidMemberFast = (email, uniqname) => {
        const normalizedEmail = email.toLowerCase().trim();
        const normalizedUniqname = uniqname ? uniqname.toLowerCase().trim() : '';
        
        // Check paid members sheet by email
        if (paidMemberEmails.has(normalizedEmail)) return true;
        
        // Also check by uniqname@umich.edu format
        if (normalizedUniqname && paidMemberEmails.has(`${normalizedUniqname}@umich.edu`)) return true;
        
        return false;
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
            
            // Get demographics from sign-in entry first
            let major = entry['Major'] || '';
            let year = entry['Year'] || '';
            const nationalDues = entry['Paid National Dues? (Note this due is separate from the chapter dues and required for conferences & scholarships)'] || '';
            
            // Override with hardcoded demographics if available
            if (MEMBER_DEMOGRAPHICS[normalizedUniqname]) {
                major = MEMBER_DEMOGRAPHICS[normalizedUniqname].major;
                year = MEMBER_DEMOGRAPHICS[normalizedUniqname].year;
            }
            
            memberStats[normalizedUniqname] = {
                email: normalizedEmail,
                uniqname: normalizedUniqname,
                displayName: displayName,
                totalPoints: 0,
                eventHistory: [],
                eventCount: 0,
                isPaid: isPaidMemberFast(normalizedEmail, normalizedUniqname),
                major: major,
                Major: major, // Alias
                year: year,
                Year: year, // Alias
                national_dues: nationalDues,
                'National Dues': nationalDues // Alias
            };
        } else {
            // Update demographics if this entry has more complete data
            // But always prefer hardcoded demographics
            if (MEMBER_DEMOGRAPHICS[normalizedUniqname]) {
                memberStats[normalizedUniqname].major = MEMBER_DEMOGRAPHICS[normalizedUniqname].major;
                memberStats[normalizedUniqname].Major = MEMBER_DEMOGRAPHICS[normalizedUniqname].major;
                memberStats[normalizedUniqname].year = MEMBER_DEMOGRAPHICS[normalizedUniqname].year;
                memberStats[normalizedUniqname].Year = MEMBER_DEMOGRAPHICS[normalizedUniqname].year;
            } else {
                if (entry['Major'] && !memberStats[normalizedUniqname].major) {
                    memberStats[normalizedUniqname].major = entry['Major'];
                    memberStats[normalizedUniqname].Major = entry['Major'];
                }
                if (entry['Year'] && !memberStats[normalizedUniqname].year) {
                    memberStats[normalizedUniqname].year = entry['Year'];
                    memberStats[normalizedUniqname].Year = entry['Year'];
                }
            }
            if (entry['Paid National Dues? (Note this due is separate from the chapter dues and required for conferences & scholarships)'] && !memberStats[normalizedUniqname].national_dues) {
                memberStats[normalizedUniqname].national_dues = entry['Paid National Dues? (Note this due is separate from the chapter dues and required for conferences & scholarships)'];
                memberStats[normalizedUniqname]['National Dues'] = entry['Paid National Dues? (Note this due is separate from the chapter dues and required for conferences & scholarships)'];
            }
        }
        
        // Calculate points for this specific event using your original system
        const pointResult = calculateMemberPointsOriginal(entry, paidMembersList, memberStats[normalizedUniqname].eventHistory);
        
        // Create a unique event identifier using timestamp + event type
        const timestamp = entry['Timestamp'] || '';
        const eventDate = timestamp.split(/[\s,]+/)[0]; // Get date part only (MM/DD/YYYY)
        
        // Check if this exact event already exists (same date + same event type)
        const alreadyExists = memberStats[normalizedUniqname].eventHistory.some(e => {
            const existingDate = (e.timestamp || '').split(/[\s,]+/)[0];
            return e.eventType === pointResult.eventType && existingDate === eventDate;
        });
        
        if (!alreadyExists) {
            // Check if this event counts for current semester points
            const countsForPoints = isEventInCurrentSemester(timestamp);
            
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
            
            // Mark if event is from previous semester (for display purposes)
            pointResult.isArchived = !countsForPoints;
            pointResult.semester = countsForPoints ? SEMESTER_CONFIG.currentSemester : 'Fall 2025';
            
            // Always add to event history for records
            memberStats[normalizedUniqname].eventHistory.push(pointResult);
            memberStats[normalizedUniqname].eventCount++;
            
            // Only add points if event is in current semester
            if (countsForPoints) {
                memberStats[normalizedUniqname].totalPoints += pointsToAdd;
            }
        }
    }
    
    // After processing all events, merge national dues data from paid members sheet
    console.log('[Demographics] Merging national dues data from paid members sheet...');
    let nationalDuesMerged = 0;
    paidMembersList.forEach(paidMember => {
        if (!paidMember.email) return;
        
        const normalizedEmail = paidMember.email.toLowerCase().trim();
        
        // Find the member in memberStats by email
        for (const uniqname in memberStats) {
            const member = memberStats[uniqname];
            if (member.email === normalizedEmail) {
                // Only update if the paid members sheet has national dues data
                const nationalDues = paidMember['National Dues'] || paidMember['national_dues'] || '';
                if (nationalDues && nationalDues.toString().trim() !== '') {
                    // Only override if the member doesn't already have national dues data
                    if (!member.national_dues || member.national_dues.toString().trim() === '') {
                        member.national_dues = nationalDues;
                        member['National Dues'] = nationalDues;
                        nationalDuesMerged++;
                    }
                }
                break;
            }
        }
    });
    console.log(`[Demographics] Merged national dues data for ${nationalDuesMerged} members from paid members sheet`);
    
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

// NOTE: Fall 2025 events have been archived to data/archive/fall_2025/
// Winter 2026 data comes from the live Google Sheet via Apps Script

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
// Winter 2026 - Clean slate, all data from live Google Sheet
async function getLocalLeaderboard() {
    console.log('[Main] Getting local leaderboard for Winter 2026...');
    
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
// Winter 2026 - Clean slate, all data from live Google Sheet
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
        
        console.log(`[Attendance] Found member ${targetMember.displayName} with ${targetMember.eventHistory.length} events`);
        
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
      try {
        const leaderboardResult = await getLocalLeaderboard();
        console.log('📊 Raw leaderboard result:', typeof leaderboardResult, leaderboardResult);
        
        // Handle the object structure returned by getLocalLeaderboard
        if (leaderboardResult && leaderboardResult.leaderboard && Array.isArray(leaderboardResult.leaderboard)) {
          this.memberData = leaderboardResult.leaderboard;
          console.log('✅ Successfully loaded member data array:', this.memberData.length, 'members');
        } else if (Array.isArray(leaderboardResult)) {
          // Fallback if it's directly an array
          this.memberData = leaderboardResult;
          console.log('✅ Successfully loaded member data direct array:', this.memberData.length, 'members');
        } else {
          console.warn('⚠️ getLocalLeaderboard did not return expected format, trying alternative method...');
          // Try to use the leaderboard data from the main app directly
          const signInData = await fetchSignInData();
          console.log('📊 Sign in data loaded:', signInData.length, 'records');
          
          const memberStats = await calculateMemberPoints(signInData);
          const leaderboard = generateLeaderboard(memberStats);
          console.log('📊 Generated leaderboard:', leaderboard.length, 'members');
          
          this.memberData = leaderboard || [];
        }
      } catch (error) {
        console.error('❌ Error loading member data:', error);
        this.memberData = [];
      }
    }
    return this.memberData;
  }

  async getLiveSheetData() {
    if (!this.liveData) {
      console.log('🔄 Loading live sheet data...');
      try {
        this.liveData = await getLiveSheetData();
        console.log('📊 Live sheet data loaded:', typeof this.liveData, Array.isArray(this.liveData) ? this.liveData.length : 'not array');
      } catch (error) {
        console.error('❌ Error loading live sheet data:', error);
        this.liveData = [];
      }
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
      let attendanceDetails = '';

      try {
        // Get actual event attendance data
        const eventHistory = member.eventHistory || member.events || [];
        const eventCount = member.eventCount || eventHistory.length;
        const totalPoints = member.totalPoints || 0;
        
        // Enhanced badge calculation with real attendance data
        switch (badgeConfig.id) {
          case 'firstEvent':
            earned = eventCount > 0 && totalPoints > 0;
            progress = earned ? 1 : 0;
            progressText = earned ? 'Completed' : 'Attend your first event';
            attendanceDetails = earned ? `First event: ${eventHistory[0]?.eventType || eventHistory[0]?.name || 'Event attended'}` : '';
            break;
            
          case 'regular':
            const requiredRegular = 3;
            earned = eventCount >= requiredRegular;
            progress = Math.min(eventCount / requiredRegular, 1);
            progressText = earned ? 'Completed' : `${eventCount}/${requiredRegular} events attended`;
            attendanceDetails = `Events: ${eventHistory.slice(0, 3).map(e => e.eventType || e.name || e).join(', ')}`;
            break;
            
          case 'dedicated':
            const requiredDedicated = 5;
            earned = eventCount >= requiredDedicated;
            progress = Math.min(eventCount / requiredDedicated, 1);
            progressText = earned ? 'Completed' : `${eventCount}/${requiredDedicated} events attended`;
            attendanceDetails = `Recent events: ${eventHistory.slice(0, 5).map(e => e.eventType || e.name || e).join(', ')}`;
            break;
            
          case 'loyalist':
            const requiredLoyalist = 8;
            earned = eventCount >= requiredLoyalist;
            progress = Math.min(eventCount / requiredLoyalist, 1);
            progressText = earned ? 'Completed' : `${eventCount}/${requiredLoyalist} events attended`;
            attendanceDetails = `Total events: ${eventCount}`;
            break;
            
          case 'goldTier':
            earned = member.tier === 'Gold';
            progress = earned ? 1 : 0;
            const currentTier = member.tier || 'Unranked';
            progressText = earned ? 'Completed' : `Currently ${currentTier} tier`;
            attendanceDetails = `Points: ${totalPoints}, Tier: ${currentTier}`;
            break;
            
          case 'consistent':
            // Check for consistent attendance (attending events regularly)
            const recentEventCount = eventCount >= 4 ? eventCount : 0;
            earned = recentEventCount >= 4 && totalPoints >= 10;
            progress = Math.min((recentEventCount + (totalPoints / 10)) / 8, 1);
            progressText = earned ? 'Completed' : `${eventCount} events, ${totalPoints} points`;
            attendanceDetails = `Consistency score: ${(progress * 100).toFixed(0)}%`;
            break;
            
          case 'engaged':
            // High engagement badge based on points and events
            const engagementScore = totalPoints + (eventCount * 2);
            earned = engagementScore >= 20;
            progress = Math.min(engagementScore / 20, 1);
            progressText = earned ? 'Completed' : `${engagementScore}/20 engagement score`;
            attendanceDetails = `${eventCount} events, ${totalPoints} points`;
            break;
            
          case 'semester':
            // Full semester participation
            const semesterTarget = 6;
            earned = eventCount >= semesterTarget && totalPoints >= 15;
            progress = Math.min((eventCount / semesterTarget + totalPoints / 15) / 2, 1);
            progressText = earned ? 'Completed' : `${eventCount}/${semesterTarget} events, ${totalPoints}/15 points`;
            attendanceDetails = `Semester progress: ${(progress * 100).toFixed(0)}%`;
            break;
            
          default:
            // Generic calculation for any other badges
            earned = eventCount >= 1;
            progress = eventCount > 0 ? Math.min(eventCount / 3, 1) : 0;
            progressText = `${eventCount} events attended`;
            attendanceDetails = eventCount > 0 ? `Latest: ${eventHistory[eventHistory.length - 1]?.eventType || eventHistory[eventHistory.length - 1]?.name || 'Event attended'}` : '';
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
        attendanceDetails,
        eventCount: member.events ? member.events.length : 0,
        totalPoints: member.totalPoints || 0,
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
window.getLocalLeaderboard = getLocalLeaderboard;
window.debugPaidMembersSheet = debugPaidMembersSheet;
window.getMemberAttendanceHistory = getMemberAttendanceHistory;
window.getMemberStats = getMemberStats;

// Expose LocalDataManager class
window.LocalDataManager = LocalDataManager;