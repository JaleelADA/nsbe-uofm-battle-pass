// ===== SHARED STYLE CONSTANTS (GLOBAL) =====
// Attach to window for global access in non-module environment.

window.SHARED_STYLES = {
  // Section backgrounds
  sectionBg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  
  // Clip paths
  clipPaths: {
    section: 'polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)',
    button: 'polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)',
    card: 'polygon(15px 0%, 100% 0%, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0% 100%, 0% 15px)',
    badge: 'polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)'
  },
  
  // Gradients
  gradients: {
    gold: 'linear-gradient(135deg, #ffd700, #ffed4e)',
    blue: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
    green: 'linear-gradient(135deg, #34d399, #10b981)',
    purple: 'linear-gradient(135deg, #a78bfa, #8b5cf6)',
    progress: 'linear-gradient(90deg, #34d399, #10b981)'
  },
  
  // Borders
  borders: {
    gold: '2px solid #ffd700',
    blue: '2px solid #3b82f6', 
    green: '2px solid #10b981',
    purple: '2px solid #8b5cf6'
  },
  
  // Shadows
  shadows: {
    gold: '0 0 20px rgba(255, 215, 0, 0.2)',
    blue: '0 0 20px rgba(59, 130, 246, 0.2)',
    green: '0 0 20px rgba(16, 185, 129, 0.2)',
    purple: '0 0 20px rgba(139, 92, 246, 0.2)'
  },
  
  // Add responsive utilities
  responsive: {
    mobile: 'max-width: 640px',
    tablet: 'max-width: 1024px', 
    desktop: 'min-width: 1025px'
  },
  
  // Responsive spacing
  spacing: {
    mobile: {
      padding: '1rem',
      margin: '0.5rem',
      gap: '0.5rem'
    },
    tablet: {
      padding: '1.5rem',
      margin: '1rem', 
      gap: '1rem'
    },
    desktop: {
      padding: '2rem',
      margin: '1.5rem',
      gap: '1.5rem'
    }
  }
};
