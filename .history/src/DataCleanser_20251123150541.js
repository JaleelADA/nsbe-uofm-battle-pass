/**
 * DataCleanser.js
 * Automatically cleanses NSBE sign-in data:
 * 1. Standardizes event types by date (majority vote)
 * 2. Removes duplicate sign-ins (same person, same date)
 */

class DataCleanser {
    constructor() {
        this.eventTypeMapping = {};
        this.corrections = {
            eventTypesFixed: 0,
            duplicatesRemoved: 0,
            totalProcessed: 0
        };
    }

    /**
     * Main cleansing function - processes raw data and returns cleansed data
     * @param {Array} rawData - Array of sign-in objects
     * @returns {Object} { cleansedData, report }
     */
    cleanseData(rawData) {
        console.log(`🧹 Starting data cleansing... (${rawData.length} entries)`);
        
        // Reset corrections
        this.corrections = {
            eventTypesFixed: 0,
            duplicatesRemoved: 0,
            totalProcessed: rawData.length
        };

        // Step 1: Extract dates and analyze event types
        const dataWithDates = this.addDateField(rawData);
        
        // Step 2: Determine correct event type for each date
        this.buildEventTypeMapping(dataWithDates);
        
        // Step 3: Standardize event types
        const standardizedData = this.standardizeEventTypes(dataWithDates);
        
        // Step 4: Remove duplicates
        const deduplicatedData = this.removeDuplicates(standardizedData);
        
        // Step 5: Clean up temporary fields
        const cleansedData = this.cleanupTempFields(deduplicatedData);
        
        const report = this.generateReport();
        
        console.log(`✅ Cleansing complete: ${cleansedData.length} entries (removed ${this.corrections.duplicatesRemoved})`);
        
        return {
            cleansedData,
            report,
            corrections: this.corrections
        };
    }

    /**
     * Add date field extracted from timestamp
     */
    addDateField(data) {
        return data.map(entry => {
            const timestamp = entry.Timestamp || entry.timestamp;
            let date;
            
            if (timestamp) {
                // Handle various timestamp formats
                const parsedDate = new Date(timestamp);
                if (!isNaN(parsedDate)) {
                    date = parsedDate.toISOString().split('T')[0]; // YYYY-MM-DD
                } else {
                    // Try parsing MM/DD/YYYY format
                    const parts = timestamp.split(/[\s,]+/)[0].split('/');
                    if (parts.length === 3) {
                        const [month, day, year] = parts;
                        date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                    }
                }
            }
            
            return { ...entry, _date: date };
        });
    }

    /**
     * Analyze event types by date and determine the correct one (majority vote)
     */
    buildEventTypeMapping(data) {
        const dateEventCounts = {};
        
        // Count event types for each date
        data.forEach(entry => {
            const date = entry._date;
            const eventType = entry['Event (If you are unsure ask an E-board member, false reporting will result in a lack of points)'] 
                           || entry.event 
                           || entry.eventType;
            
            if (date && eventType) {
                if (!dateEventCounts[date]) {
                    dateEventCounts[date] = {};
                }
                dateEventCounts[date][eventType] = (dateEventCounts[date][eventType] || 0) + 1;
            }
        });
        
        // Determine majority event type for each date
        this.eventTypeMapping = {};
        Object.keys(dateEventCounts).forEach(date => {
            const eventCounts = dateEventCounts[date];
            const sortedEvents = Object.entries(eventCounts).sort((a, b) => b[1] - a[1]);
            if (sortedEvents.length > 0) {
                this.eventTypeMapping[date] = sortedEvents[0][0]; // Most common event type
                
                console.log(`📅 ${date}: ${this.eventTypeMapping[date]} (${sortedEvents[0][1]}/${Object.values(eventCounts).reduce((a, b) => a + b, 0)} entries)`);
            }
        });
    }

    /**
     * Standardize event types based on the mapping
     */
    standardizeEventTypes(data) {
        return data.map(entry => {
            const date = entry._date;
            const eventField = 'Event (If you are unsure ask an E-board member, false reporting will result in a lack of points)';
            const currentEvent = entry[eventField] || entry.event || entry.eventType;
            const correctEvent = this.eventTypeMapping[date];
            
            if (correctEvent && currentEvent !== correctEvent) {
                this.corrections.eventTypesFixed++;
                console.log(`  🔧 Fixed: ${entry.Uniqname || entry.uniqname} on ${date}: "${currentEvent}" → "${correctEvent}"`);
            }
            
            // Update the event field
            const updatedEntry = { ...entry };
            if (correctEvent) {
                updatedEntry[eventField] = correctEvent;
                if (entry.event) updatedEntry.event = correctEvent;
                if (entry.eventType) updatedEntry.eventType = correctEvent;
            }
            
            return updatedEntry;
        });
    }

    /**
     * Remove duplicate sign-ins (same person, same date)
     */
    removeDuplicates(data) {
        const seen = new Set();
        const deduplicatedData = [];
        const duplicates = [];
        
        data.forEach(entry => {
            const uniqname = (entry.Uniqname || entry.uniqname || '').toLowerCase().trim();
            const date = entry._date;
            const key = `${uniqname}_${date}`;
            
            if (!seen.has(key)) {
                seen.add(key);
                deduplicatedData.push(entry);
            } else {
                duplicates.push({
                    uniqname,
                    name: entry['Full Name (First & Last)'] || entry.name,
                    date
                });
                this.corrections.duplicatesRemoved++;
            }
        });
        
        if (duplicates.length > 0) {
            console.log(`🗑️  Removed ${duplicates.length} duplicates:`);
            duplicates.forEach(dup => {
                console.log(`  - ${dup.name} (${dup.uniqname}) on ${dup.date}`);
            });
        }
        
        return deduplicatedData;
    }

    /**
     * Remove temporary fields added during processing
     */
    cleanupTempFields(data) {
        return data.map(entry => {
            const cleaned = { ...entry };
            delete cleaned._date;
            return cleaned;
        });
    }

    /**
     * Generate a human-readable report
     */
    generateReport() {
        const lines = [
            '═══════════════════════════════════════════════════════════════════',
            '                    DATA CLEANSING REPORT',
            '═══════════════════════════════════════════════════════════════════',
            `Date: ${new Date().toLocaleString()}`,
            '',
            'SUMMARY',
            '───────────────────────────────────────────────────────────────────',
            `Original entries:      ${this.corrections.totalProcessed}`,
            `Event types corrected: ${this.corrections.eventTypesFixed}`,
            `Duplicates removed:    ${this.corrections.duplicatesRemoved}`,
            `Final entries:         ${this.corrections.totalProcessed - this.corrections.duplicatesRemoved}`,
            '',
            'EVENT TYPE STANDARDIZATION',
            '───────────────────────────────────────────────────────────────────',
        ];
        
        Object.entries(this.eventTypeMapping).sort().forEach(([date, eventType]) => {
            lines.push(`${date}: ${eventType}`);
        });
        
        lines.push('═══════════════════════════════════════════════════════════════════');
        
        return lines.join('\n');
    }

    /**
     * Quick validation check - returns issues if found
     */
    validateData(data) {
        const issues = [];
        const dateUniqnames = {};
        
        data.forEach((entry, index) => {
            const uniqname = (entry.Uniqname || entry.uniqname || '').toLowerCase().trim();
            const timestamp = entry.Timestamp || entry.timestamp;
            const eventType = entry['Event (If you are unsure ask an E-board member, false reporting will result in a lack of points)'] 
                           || entry.event 
                           || entry.eventType;
            
            // Check for missing required fields
            if (!uniqname) {
                issues.push(`Entry ${index + 1}: Missing uniqname`);
            }
            if (!timestamp) {
                issues.push(`Entry ${index + 1}: Missing timestamp`);
            }
            if (!eventType) {
                issues.push(`Entry ${index + 1}: Missing event type`);
            }
            
            // Check for potential duplicates
            if (timestamp && uniqname) {
                const date = new Date(timestamp).toISOString().split('T')[0];
                const key = `${uniqname}_${date}`;
                if (dateUniqnames[key]) {
                    issues.push(`Potential duplicate: ${uniqname} on ${date}`);
                } else {
                    dateUniqnames[key] = true;
                }
            }
        });
        
        return issues;
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.DataCleanser = DataCleanser;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataCleanser;
}
