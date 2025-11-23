# Data Cleansing System

## Overview

The NSBE Battle Pass now includes an **automatic data cleansing system** that ensures data accuracy by:

1. **Standardizing event types by date** - Uses majority voting to correct mismatched event types
2. **Removing duplicate sign-ins** - Eliminates multiple sign-ins from the same person on the same date

## How It Works

### Automatic Cleansing

Data is automatically cleansed every time it's loaded from Google Sheets:

```
User submits sign-in form → Google Sheets → Auto-Cleansing → Battle Pass System
```

### Standardization Rules

**Event Type Correction:**
- For each date, the system counts all event types submitted
- The most common event type becomes the "correct" one for that date
- All other entries are updated to match

**Example:**
```
Date: 11/21/2025
- 64 people marked "GBM"
- 2 people marked "Professional Development"
- 1 person marked "Social Events"

Result: All 67 entries standardized to "GBM"
```

**Duplicate Removal:**
- Same person (uniqname) + Same date = Duplicate
- First occurrence is kept, subsequent ones removed

**Example:**
```
Before: Jaleel Akins signed in 3 times on 11/21/2025
After: Only 1 sign-in counted for Jaleel on 11/21/2025
```

## Files

### Core Components

- **`src/DataCleanser.js`** - Main cleansing logic
- **`src/LocalDataManager.js`** - Integrates auto-cleansing into data loading
- **`cleanse_data.py`** - Python script for manual cleansing (backup)

### Configuration

Auto-cleansing is enabled by default. No configuration needed!

## Manual Cleansing (Python Script)

For one-time cleanups or data analysis:

```bash
# Install dependencies
pip install pandas

# Run cleansing script
python cleanse_data.py
```

**Outputs:**
- `data/membership/CLEANSED_NSBE_Sign_In_Responses.csv` - Clean data
- `data/membership/cleansing_report.txt` - Detailed report

## Admin Dashboard

The Admin Dashboard displays real-time cleansing statistics:

### Data Quality Panel

Located in the **Analytics** tab:

- **Auto-Cleansing Status** - Shows if cleansing is active
- **Event Standardization** - Number of event types corrected
- **Duplicate Removal** - Number of duplicates removed

### Viewing Stats

1. Navigate to `/admin-dashboard.html`
2. Click the **Analytics** tab
3. View the "Data Quality & Auto-Cleansing" panel at the top

## Monitoring

### Console Logs

When data loads, you'll see:

```
🧹 [Data Cleanser] Auto-cleansing sign-in data...
📅 2025-11-21: GBM (64/67 entries)
  🔧 Fixed: haarun on 2025-11-21: "Professional Development" → "GBM"
  🔧 Fixed: nnennabr on 2025-11-21: "Professional Development" → "GBM"
🗑️  Removed 6 duplicates:
  - Sloan Howard (howardsl) on 2025-11-21
  - Aria Fifer (ariaf) on 2025-11-21
✅ [Data Cleanser] Cleansing complete: { eventTypesFixed: 3, duplicatesRemoved: 6 }
```

### Validation

To check data quality:

```javascript
// In browser console
const cleanser = new DataCleanser();
const issues = cleanser.validateData(yourData);
console.log(issues);
```

## Benefits

✅ **Accuracy** - Correct point calculations based on clean data
✅ **Consistency** - Event types standardized across all entries  
✅ **Fairness** - No double-counting from duplicate sign-ins
✅ **Automatic** - No manual intervention required
✅ **Transparent** - Full logging and reporting

## Data Flow

```
┌─────────────────────┐
│  Google Sheets      │
│  (Raw Responses)    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  DataCleanser       │
│  - Standardize      │
│  - Deduplicate      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  LocalDataManager   │
│  (Clean Data)       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Battle Pass        │
│  (Accurate Points)  │
└─────────────────────┘
```

## Troubleshooting

### Cleansing Not Running

**Symptom:** No cleansing logs in console

**Solution:**
1. Check that `DataCleanser.js` loads before `LocalDataManager.js`
2. Verify in HTML: `<script src="src/DataCleanser.js"></script>`
3. Check browser console for script errors

### Incorrect Statistics

**Symptom:** Stats show 0 corrections but data has issues

**Solution:**
1. Refresh the page to reload data
2. Check `window.CLEANSING_STATS` in console
3. Verify Google Sheets connection

### Manual Override Needed

**Symptom:** Automatic cleansing not sufficient

**Solution:**
1. Run `python cleanse_data.py` for detailed analysis
2. Review `cleansing_report.txt` for specifics
3. Manually fix edge cases in Google Sheets if needed

## Future Enhancements

Potential improvements:

- [ ] Email notifications for large corrections
- [ ] Machine learning for event type prediction
- [ ] Historical cleansing reports archive
- [ ] Admin UI for manual override of specific entries
- [ ] Scheduled cleansing jobs (nightly)

## Support

For issues or questions:
- Check browser console for error messages
- Review `cleansing_report.txt` for details
- Contact the development team

---

**Last Updated:** November 23, 2025  
**Version:** 1.0.0
