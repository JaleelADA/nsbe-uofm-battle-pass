# NSBE Battle Pass - Admin Override System

## 🔐 Security & Authentication

### Simple Password Access
- **Default Password**: `nsbe2024`
- **Keyboard Shortcut**: `Ctrl + Shift + A` to open admin panel
- **Console Access**: `AdminPanel.show()` 

### Changing the Password

1. **Open AdminPanel.js** in your code editor

2. **Find this line** (around line 6):
   ```javascript
   const ADMIN_PASSWORD = 'nsbe2024';
   ```

3. **Change to your desired password**:
   ```javascript
   const ADMIN_PASSWORD = 'your_new_password_here';
   ```

4. **Recommended passwords**:
   - `nsbe2024` (default)
   - `umichnsbe2024`
   - `battlepass2024`
   - Or any password your team agrees on

**That's it!** No complex hashing or generation needed.

---

## 📊 Manual Point Override System

## Overview
The manual override system allows administrators to adjust member points for special circumstances, corrections, or bonus awards.

## Access Methods

### 1. GUI Admin Panel
- **Keyboard Shortcut**: `Ctrl + Shift + A` 
- **Console Command**: `AdminPanel.show()`

### 2. Console Commands
- **Show Help**: `AdminPanel.help()`
- **Set Override**: `AdminPanel.setOverride(email, points, reason)`
- **Remove Override**: `AdminPanel.removeOverride(email)`
- **List Overrides**: `AdminPanel.listOverrides()`
- **Clear All**: `AdminPanel.clearAll()`

## Features

### Point Adjustment
- **Positive Points**: Add bonus points (e.g., `+15` for leadership)
- **Negative Points**: Apply penalties (e.g., `-5` for rule violations)
- **Reason Tracking**: Optional reason field for documentation

### Data Persistence
- Overrides are stored in `localStorage`
- Survives browser sessions
- Includes timestamp and reason tracking

### Real-time Updates
- Overrides are immediately applied to leaderboard calculations
- Badge XP + Event Points + Manual Adjustment = Final Score

## Usage Examples

### Console Examples
```javascript
// Add bonus points
AdminPanel.setOverride('jdoe@umich.edu', 15, 'Leadership bonus for organizing event')

// Apply penalty
AdminPanel.setOverride('jane@umich.edu', -5, 'Late submission penalty')

// Remove override
AdminPanel.removeOverride('jdoe@umich.edu')

// View all overrides
AdminPanel.listOverrides()
```

### GUI Usage
1. Press `Ctrl + Shift + A` to open admin panel
2. Enter member email address
3. Enter point adjustment (+/- number)
4. Optionally add reason
5. Click "Apply Override" or "Remove Override"

## Point Calculation Order
1. **Event Points**: Base points from event attendance (with unpaid member caps)
2. **Badge XP**: Achievement badge rewards
3. **Manual Adjustment**: Admin-applied overrides
4. **Final Total**: Sum of all three components

## Override Management
- **View Active Overrides**: See all current adjustments in the admin panel
- **Override History**: Each override includes timestamp and reason
- **Bulk Operations**: Clear all overrides at once (with confirmation)

## Security Notes
- Admin panel only appears when explicitly called
- All operations logged to browser console
- Confirmation required for destructive operations
- Override data persists locally (not synced to Google Sheets)

## Troubleshooting
- **Panel not showing**: Ensure `AdminPanel.js` is loaded, check console for errors
- **Overrides not applying**: Check console for error messages, verify email format
- **Lost overrides**: Overrides are stored in localStorage - clearing browser data will remove them