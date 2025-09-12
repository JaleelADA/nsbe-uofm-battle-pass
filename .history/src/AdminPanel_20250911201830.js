// ===== ADMIN PANEL FOR MANUAL POINT OVERRIDES =====

window.AdminPanel = (() => {
  
  // Create admin interface HTML
  function createAdminInterface() {
    const adminHTML = `
      <div id="admin-panel" style="
        position: fixed;
        top: 20px;
        right: 20px;
        width: 400px;
        background: white;
        border: 2px solid #3b82f6;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        z-index: 10000;
        font-family: system-ui;
        display: none;
      ">
        <div style="
          background: #3b82f6;
          color: white;
          padding: 15px;
          border-radius: 6px 6px 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        ">
          <h3 style="margin: 0; font-size: 16px;">🔧 Admin Panel</h3>
          <button onclick="AdminPanel.hide()" style="
            background: none;
            border: none;
            color: white;
            font-size: 18px;
            cursor: pointer;
          ">×</button>
        </div>
        
        <div style="padding: 20px;">
          <!-- Point Override Section -->
          <div style="margin-bottom: 20px;">
            <h4 style="margin: 0 0 10px 0; color: #1f2937;">Point Override</h4>
            <input type="email" id="override-email" placeholder="Member Email" style="
              width: 100%;
              padding: 8px;
              margin-bottom: 8px;
              border: 1px solid #d1d5db;
              border-radius: 4px;
            ">
            <input type="number" id="override-points" placeholder="Point Adjustment (+/-)" style="
              width: 100%;
              padding: 8px;
              margin-bottom: 8px;
              border: 1px solid #d1d5db;
              border-radius: 4px;
            ">
            <input type="text" id="override-reason" placeholder="Reason (optional)" style="
              width: 100%;
              padding: 8px;
              margin-bottom: 10px;
              border: 1px solid #d1d5db;
              border-radius: 4px;
            ">
            <button onclick="AdminPanel.applyOverride()" style="
              background: #10b981;
              color: white;
              border: none;
              padding: 10px 15px;
              border-radius: 4px;
              cursor: pointer;
              margin-right: 8px;
            ">Apply Override</button>
            <button onclick="AdminPanel.removeOverride()" style="
              background: #ef4444;
              color: white;
              border: none;
              padding: 10px 15px;
              border-radius: 4px;
              cursor: pointer;
            ">Remove Override</button>
          </div>
          
          <!-- Current Overrides Section -->
          <div>
            <h4 style="margin: 0 0 10px 0; color: #1f2937;">Active Overrides</h4>
            <div id="current-overrides" style="
              max-height: 200px;
              overflow-y: auto;
              border: 1px solid #e5e7eb;
              border-radius: 4px;
              padding: 10px;
            ">
              <!-- Overrides will be populated here -->
            </div>
            <button onclick="AdminPanel.clearAllOverrides()" style="
              background: #f59e0b;
              color: white;
              border: none;
              padding: 8px 12px;
              border-radius: 4px;
              cursor: pointer;
              margin-top: 10px;
              font-size: 12px;
            ">Clear All Overrides</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', adminHTML);
  }
  
  // Show admin panel
  function show() {
    if (!document.getElementById('admin-panel')) {
      createAdminInterface();
    }
    document.getElementById('admin-panel').style.display = 'block';
    refreshOverridesList();
  }
  
  // Hide admin panel
  function hide() {
    const panel = document.getElementById('admin-panel');
    if (panel) {
      panel.style.display = 'none';
    }
  }
  
  // Apply point override
  function applyOverride() {
    const email = document.getElementById('override-email').value.trim();
    const points = parseInt(document.getElementById('override-points').value);
    const reason = document.getElementById('override-reason').value.trim();
    
    if (!email || isNaN(points)) {
      alert('Please enter a valid email and point adjustment');
      return;
    }
    
    try {
      LocalDataManager.setManualOverride(email, points, reason);
      alert(`Override applied: ${points > 0 ? '+' : ''}${points} points for ${email}`);
      
      // Clear form
      document.getElementById('override-email').value = '';
      document.getElementById('override-points').value = '';
      document.getElementById('override-reason').value = '';
      
      refreshOverridesList();
      
      // Trigger leaderboard refresh if the app has the capability
      if (window.refreshLeaderboard) {
        window.refreshLeaderboard();
      }
    } catch (error) {
      alert('Error applying override: ' + error.message);
    }
  }
  
  // Remove point override
  function removeOverride() {
    const email = document.getElementById('override-email').value.trim();
    
    if (!email) {
      alert('Please enter an email address');
      return;
    }
    
    try {
      LocalDataManager.removeManualOverride(email);
      alert(`Override removed for ${email}`);
      
      // Clear form
      document.getElementById('override-email').value = '';
      document.getElementById('override-points').value = '';
      document.getElementById('override-reason').value = '';
      
      refreshOverridesList();
      
      // Trigger leaderboard refresh if the app has the capability
      if (window.refreshLeaderboard) {
        window.refreshLeaderboard();
      }
    } catch (error) {
      alert('Error removing override: ' + error.message);
    }
  }
  
  // Clear all overrides
  function clearAllOverrides() {
    if (confirm('Are you sure you want to clear ALL point overrides? This cannot be undone.')) {
      try {
        LocalDataManager.clearAllOverrides();
        alert('All overrides cleared');
        refreshOverridesList();
        
        // Trigger leaderboard refresh if the app has the capability
        if (window.refreshLeaderboard) {
          window.refreshLeaderboard();
        }
      } catch (error) {
        alert('Error clearing overrides: ' + error.message);
      }
    }
  }
  
  // Refresh the overrides list display
  function refreshOverridesList() {
    const container = document.getElementById('current-overrides');
    if (!container) return;
    
    const overrides = LocalDataManager.getManualOverrides();
    
    if (Object.keys(overrides).length === 0) {
      container.innerHTML = '<em style="color: #6b7280;">No active overrides</em>';
      return;
    }
    
    let html = '';
    Object.entries(overrides).forEach(([email, data]) => {
      const adjustment = data.adjustment > 0 ? `+${data.adjustment}` : data.adjustment;
      const date = new Date(data.timestamp).toLocaleDateString();
      html += `
        <div style="
          border-bottom: 1px solid #e5e7eb;
          padding: 8px 0;
          font-size: 12px;
        ">
          <div style="font-weight: bold; color: #1f2937;">${email}</div>
          <div style="color: #059669;">Points: ${adjustment}</div>
          ${data.reason ? `<div style="color: #6b7280;">Reason: ${data.reason}</div>` : ''}
          <div style="color: #9ca3af;">Applied: ${date}</div>
        </div>
      `;
    });
    
    container.innerHTML = html;
  }
  
  // Console helper functions
  function consoleHelp() {
    console.log(`
🔧 NSBE Admin Panel Commands:
  
AdminPanel.show()                                 - Show admin interface
AdminPanel.hide()                                 - Hide admin interface
AdminPanel.setOverride(email, points, reason)    - Set point override via console
AdminPanel.removeOverride(email)                 - Remove override via console
AdminPanel.listOverrides()                       - List all current overrides
AdminPanel.clearAll()                            - Clear all overrides

Examples:
  AdminPanel.setOverride('jdoe@umich.edu', 15, 'Bonus for leadership')
  AdminPanel.setOverride('jane@umich.edu', -5, 'Penalty for late submission')
  AdminPanel.removeOverride('jdoe@umich.edu')
    `);
  }
  
  // Console-friendly override functions
  function setOverride(email, points, reason = '') {
    try {
      LocalDataManager.setManualOverride(email, points, reason);
      console.log(`✅ Override applied: ${points > 0 ? '+' : ''}${points} points for ${email}`);
      if (reason) console.log(`   Reason: ${reason}`);
    } catch (error) {
      console.error('❌ Error applying override:', error.message);
    }
  }
  
  function removeOverrideConsole(email) {
    try {
      LocalDataManager.removeManualOverride(email);
      console.log(`✅ Override removed for ${email}`);
    } catch (error) {
      console.error('❌ Error removing override:', error.message);
    }
  }
  
  function listOverrides() {
    const overrides = LocalDataManager.getManualOverrides();
    if (Object.keys(overrides).length === 0) {
      console.log('📋 No active overrides');
      return;
    }
    
    console.log('📋 Current Point Overrides:');
    Object.entries(overrides).forEach(([email, data]) => {
      const adjustment = data.adjustment > 0 ? `+${data.adjustment}` : data.adjustment;
      console.log(`   ${email}: ${adjustment} points`);
      if (data.reason) console.log(`      Reason: ${data.reason}`);
    });
  }
  
  function clearAll() {
    if (confirm('Clear all overrides? This cannot be undone.')) {
      LocalDataManager.clearAllOverrides();
      console.log('✅ All overrides cleared');
    }
  }
  
  // Public API
  return {
    show,
    hide,
    applyOverride,
    removeOverride,
    clearAllOverrides,
    refreshOverridesList,
    help: consoleHelp,
    setOverride,
    removeOverride: removeOverrideConsole,
    listOverrides,
    clearAll
  };
})();

// Auto-show help in console
console.log('🔧 NSBE Admin Panel loaded! Type AdminPanel.help() for commands or AdminPanel.show() for GUI');