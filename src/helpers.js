// ===== HELPER FUNCTIONS (GLOBAL) =====
// Attach helpers to window for global access in non-module environment.

// Utility function for formatting dates
window.formatEventDate = function(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
}

// Utility function for cleaning names/emails
window.cleanString = function(str) {
  return str ? str.trim().toLowerCase() : '';
}

// Utility function for validating email format
window.isValidEmail = function(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
