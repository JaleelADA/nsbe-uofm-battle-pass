// ===== REUSABLE UI COMPONENTS =====

function StyledSection({ children, theme = 'blue', className = '', style = {} }) {
  const sectionStyle = {
    background: SHARED_STYLES.sectionBg,
    clipPath: SHARED_STYLES.clipPaths.section,
    border: SHARED_STYLES.borders[theme],
    boxShadow: SHARED_STYLES.shadows[theme],
    ...style
  };
  
  return (
    <div className={`p-6 relative ${className}`} style={sectionStyle}>
      {children}
    </div>
  );
}

function SectionTitle({ children, theme = 'gold', className = '' }) {
  const titleStyle = {
    background: SHARED_STYLES.gradients[theme],
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontFamily: 'Orbitron, monospace'
  };
  
  return (
    <h2 className={`text-2xl font-black mb-4 tracking-wider ${className}`} style={titleStyle}>
      {children}
    </h2>
  );
}

function StyledLink({ href, children, className = '' }) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className={`block p-3 text-cyan-100 hover:text-cyan-200 transition-colors duration-300 hover:bg-gray-800/50 ${className}`}
      style={{
        clipPath: SHARED_STYLES.clipPaths.button,
        border: '1px solid #374151'
      }}
    >
      {children}
    </a>
  );
}

function StyledButton({ onClick, children, theme = 'gold', className = '', disabled = false }) {
  const buttonClass = theme === 'gold' 
    ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black'
    : 'bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white';
    
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${buttonClass} disabled:opacity-50 font-bold py-3 px-6 transition-all duration-300 shadow-lg ${className}`}
      style={{
        clipPath: SHARED_STYLES.clipPaths.button
      }}
    >
      {children}
    </button>
  );
}