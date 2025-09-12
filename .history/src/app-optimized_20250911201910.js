
// Expect globals injected by separate scripts (Data-Constants.js, Shared-style.js, helpers.js)
const {
  BADGES_CONFIG,
  SHARED_STYLES
} = window;

// Basic runtime guard
if (!SHARED_STYLES) {
  console.warn('Global dependencies not loaded before app-optimized.js');
}

const { useState, useEffect } = React;

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

// Expose reusable UI components to global scope for use in other modules
window.StyledSection = StyledSection;
window.SectionTitle = SectionTitle;
window.StyledLink = StyledLink;
window.StyledButton = StyledButton;

// ===== MAIN COMPONENTS =====

function BattlePassHeader({ userLevel = null, userXP = null, maxXP = 6000, userName = '', onNameChange, hasUserData = false }) {
  const progress = hasUserData && userXP ? (userXP / maxXP) * 100 : 0;
  
  return (
    <div className="relative p-3 sm:p-4 lg:p-5 mb-3 sm:mb-4 lg:mb-5" style={{
      background: 'linear-gradient(135deg, #0a0f1c 0%, #1a1f2e 50%, #0a0f1c 100%)',
      clipPath: 'polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)',
      border: '2px solid #FFD700',
      boxShadow: '0 0 30px rgba(255, 215, 0, 0.4), inset 0 0 50px rgba(255, 215, 0, 0.1)'
    }}>
      
      <div className="flex flex-col lg:flex-row items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3 lg:space-x-6 w-full lg:w-auto">
          {/* NSBE Torch Logo */}
          <div className="relative shrink-0">
            <div className="w-14 h-16 sm:w-16 sm:h-20 lg:w-20 lg:h-24 flex items-center justify-center relative" style={{
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              clipPath: SHARED_STYLES.clipPaths.badge,
              boxShadow: '0 0 25px rgba(255, 215, 0, 0.6)'
            }}>
              <div className="w-10 h-14 sm:w-12 sm:h-16 lg:w-14 lg:h-18 flex items-center justify-center relative" style={{
                background: 'linear-gradient(135deg, #0a0f1c, #1a1f2e)',
                clipPath: SHARED_STYLES.clipPaths.badge,
                border: '2px solid #FFD700'
              }}>
                <div className="text-base sm:text-lg lg:text-xl">🔥</div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 text-center sm:text-left w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 lg:space-x-4 mb-3 lg:mb-4">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-black tracking-wider" style={{
                fontFamily: 'Orbitron, monospace',
                background: SHARED_STYLES.gradients.gold,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 30px rgba(255, 215, 0, 0.8)',
                letterSpacing: '0.15em'
              }}>NSBE</h1>
              <h2 className="text-base sm:text-lg md:text-xl lg:text-3xl font-bold text-yellow-400" style={{
                fontFamily: 'Orbitron, monospace',
                letterSpacing: '0.1em'
              }}>UofM BATTLE PASS</h2>
            </div>
            
            {/* Name Input */}
            <div className="mb-3 lg:mb-4">
              <input
                type="text"
                placeholder="Enter your name, uniqname, or email to see your XP"
                value={userName}
                onChange={(e) => onNameChange(e.target.value)}
                className="w-full max-w-sm lg:max-w-md bg-gray-900/90 border-2 border-yellow-400/60 px-3 py-2 lg:px-3 lg:py-2 text-sm lg:text-base text-yellow-100 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 transition-all duration-300"
                style={{ 
                  fontFamily: 'Orbitron, monospace',
                  clipPath: SHARED_STYLES.clipPaths.card,
                  boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)'
                }}
              />
            </div>
            
            {/* Progress Bar - only show when user has data */}
            {hasUserData && (
              <div className="w-full max-w-sm lg:max-w-md bg-gray-900 h-5 lg:h-6 relative" style={{
                border: '2px lg:border-3 solid #FFD700',
                clipPath: SHARED_STYLES.clipPaths.card,
                boxShadow: '0 0 25px rgba(255, 215, 0, 0.4)'
              }}>
                <div className="h-full relative overflow-hidden transition-all duration-1000" 
                     style={{
                       width: `${progress}%`,
                       background: 'linear-gradient(90deg, #FFD700, #FFA500, #FF8C00)',
                       boxShadow: '0 0 30px rgba(255, 215, 0, 0.8)'
                     }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse"></div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Level/XP display - only show when user has data */}
        {hasUserData && (
          <div className="text-center lg:text-right">
            <div className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black" style={{
              fontFamily: 'Orbitron, monospace',
              background: SHARED_STYLES.gradients.gold,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 40px rgba(255, 215, 0, 0.8)'
            }}>{userLevel}</div>
            <div className="text-sm sm:text-base lg:text-lg text-yellow-300 font-bold" style={{
              fontFamily: 'Orbitron, monospace'
            }}>
              {userXP}/{maxXP} XP
            </div>
            {userName && (
              <div className="text-yellow-400 font-bold mt-2 lg:mt-2 text-sm sm:text-base lg:text-base" style={{
                fontFamily: 'Orbitron, monospace'
              }}>
                Welcome, {userName}!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SkipNavigation() {
  const skipLinkStyle = {
    clipPath: SHARED_STYLES.clipPaths.button
  };
  
  return (
    <nav className="skip-nav fixed top-0 left-0 z-50">
      <a href="#tier-section" className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-yellow-400 text-black px-4 py-2 font-bold" style={skipLinkStyle}>
        Skip to Tiers
      </a>
      <a href="#leaderboard-section" className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-16 focus:left-4 bg-yellow-400 text-black px-4 py-2 font-bold" style={skipLinkStyle}>
        Skip to Leaderboard
      </a>
      <a href="#events-section" className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-28 focus:left-4 bg-yellow-400 text-black px-4 py-2 font-bold" style={skipLinkStyle}>
        Skip to Events
      </a>
    </nav>
  );
}

function BadgeSection() {
  return (
    <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-5">
      {BADGES_CONFIG.map((badge, index) => (
        <div key={index} className={`bg-gradient-to-br ${badge.color} ${
          badge.active ? 'opacity-100' : 'opacity-40'
        } p-2 sm:p-3 lg:p-4 text-center min-w-[90px] sm:min-w-[110px] lg:min-w-[120px] transform hover:scale-105 transition-all duration-300 relative`}
        style={{
          clipPath: 'polygon(15px 0%, 100% 0%, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0% 100%, 0% 15px)',
          border: `2px solid ${badge.active ? badge.border : '#4a5568'}`,
          boxShadow: badge.active ? `0 0 25px ${badge.border}40, inset 0 0 15px rgba(255,255,255,0.1)` : 'none'
        }}>
          {/* Inner glow effect */}
          {badge.active && (
            <div className="absolute inset-0" style={{
              background: `linear-gradient(135deg, transparent 0%, ${badge.border}20 50%, transparent 100%)`,
              clipPath: 'polygon(15px 0%, 100% 0%, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0% 100%, 0% 15px)'
            }}></div>
          )}
          <div className={`${badge.textColor} font-bold text-xs sm:text-sm tracking-wider relative z-10`} style={{
            fontFamily: 'Orbitron, monospace',
            textShadow: badge.active ? '0 0 10px rgba(0,0,0,0.5)' : 'none'
          }}>{badge.name}</div>
        </div>
      ))}
    </div>
  );
}

function MentorshipSection({ onMentorshipClick }) {
  return (
    <StyledSection style={{
      clipPath: 'polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)',
    }} className="p-3 sm:p-4 lg:p-5 h-fit">
      <div className="text-center">
        <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mx-auto mb-3 sm:mb-4 relative" style={{
          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          clipPath: SHARED_STYLES.clipPaths.badge,
          boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)'
        }}>
          <div className="absolute inset-1 sm:inset-2 flex items-center justify-center" style={{
            background: 'linear-gradient(135deg, #1a1f2e, #16213e)',
            clipPath: SHARED_STYLES.clipPaths.badge
          }}>
            <span className="text-xl sm:text-2xl lg:text-3xl">👥</span>
          </div>
        </div>
        <SectionTitle theme="blue">MENTORSHIP</SectionTitle>
        <div className="p-2 sm:p-3 mb-2 sm:mb-3 relative" style={{
          background: 'rgba(55, 65, 81, 0.7)',
          clipPath: SHARED_STYLES.clipPaths.card,
          border: '1px solid #6b7280'
        }}>
          <div className="font-bold text-sm sm:text-base lg:text-lg mb-1" style={{
            background: SHARED_STYLES.gradients.gold,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>ONE-ON-ONE</div>
        </div>
        <button
          onClick={onMentorshipClick}
          className="text-white text-sm sm:text-base lg:text-lg font-semibold tracking-wide cursor-pointer hover:scale-105 transition-all duration-300 hover:text-yellow-400 hover:shadow-lg"
          style={{
            fontFamily: 'Orbitron, monospace',
            background: 'none',
            border: 'none',
            textShadow: '0 0 10px rgba(255, 215, 0, 0.3)'
          }}
        >
          🔥 MENTORSHIP MODE
        </button>
      </div>
    </StyledSection>
  );
}

function MemberStats({ userStats }) {
  return (
    <StyledSection style={{
      clipPath: 'polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)',
    }} className="p-3 sm:p-4 lg:p-5 h-fit">
      <div className="text-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto mb-3 sm:mb-4 relative" style={{
          background: SHARED_STYLES.gradients.gold.replace('135deg', '135deg'),
          clipPath: SHARED_STYLES.clipPaths.badge,
          boxShadow: '0 0 30px rgba(255, 215, 0, 0.5)'
        }}>
          <div className="absolute inset-2 sm:inset-3 lg:inset-4 flex items-center justify-center" style={{
            background: SHARED_STYLES.gradients.gold.replace('135deg', '135deg'),
            clipPath: SHARED_STYLES.clipPaths.badge
          }}>
            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 flex items-center justify-center relative" style={{
              background: SHARED_STYLES.gradients.gold.replace('135deg', '135deg'),
              clipPath: SHARED_STYLES.clipPaths.badge
            }}>
              <span className="text-black text-lg sm:text-xl lg:text-2xl font-bold">⚡</span>
            </div>
          </div>
        </div>
        <SectionTitle theme="gold">MEMBER STATS</SectionTitle>
        {userStats && userStats.rank && (
          <div className="mt-3 sm:mt-4 space-y-2">
            <div className="p-2 sm:p-2 relative bg-gray-800/70 border border-gray-600" style={{
              clipPath: SHARED_STYLES.clipPaths.button
            }}>
              <div className="text-xs sm:text-sm text-gray-300">Tier: <span className="text-yellow-400 font-bold">{userStats.tier}</span></div>
            </div>
            <div className="p-2 sm:p-2 relative bg-gray-800/70 border border-gray-600" style={{
              clipPath: SHARED_STYLES.clipPaths.button
            }}>
              <div className="text-xs sm:text-sm text-gray-300">Rank: <span className="text-yellow-400 font-bold">#{userStats.rank}</span></div>
            </div>
          </div>
        )}
      </div>
    </StyledSection>
  );
}

function Leaderboard({ userName, onUserDataFound }) {
  const [leaders, setLeaders] = useState([]);
  // All entries for search
  const [allLeaders, setAllLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeaderboardData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchLeaderboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Update displayed leaders based on search input
    if (!userName.trim()) {
      // No search: show top 10
      setLeaders(allLeaders.slice(0, 10));
      return;
    }
    if (allLeaders.length > 0) {
      // Filter full list for matches
      const matches = allLeaders.filter(leader => 
        leader.name.toLowerCase().includes(userName.toLowerCase()) ||
        userName.toLowerCase().includes(leader.name.toLowerCase()) ||
        (leader.email && leader.email.toLowerCase().includes(userName.toLowerCase())) ||
        (leader.uniqname && leader.uniqname.toLowerCase().includes(userName.toLowerCase()))
      );
      // Display matches
      setLeaders(matches);
      // If first match exists, notify parent for stats
      if (matches.length > 0 && onUserDataFound) {
        const userEntry = matches[0];
        const level = Math.floor(userEntry.score / 15) + 1;
        const currentLevelXP = userEntry.score % 15;
        const nextLevelXP = 15;
        onUserDataFound({
          level,
          xp: userEntry.score,
          currentLevelXP,
          nextLevelXP,
          tier: userEntry.tier,
          rank: userEntry.rank,
          isPaid: userEntry.isPaid
        });
      }
    }
  }, [userName, allLeaders, onUserDataFound]);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      
      // Use new local leaderboard system ONLY
      if (window.getLocalLeaderboard) {
        const leaderboardResult = await window.getLocalLeaderboard();
        
        if (leaderboardResult && leaderboardResult.leaderboard && leaderboardResult.leaderboard.length > 0) {
          setAllLeaders(leaderboardResult.leaderboard);
          setLeaders(leaderboardResult.leaderboard.slice(0, 10));
          
          // Store dynamic tier thresholds globally for display
          window.CURRENT_TIER_THRESHOLDS = leaderboardResult.tierThresholds;
          
          setLoading(false);
          setError(null);
          return;
        } else {
          // No data from forms yet
          setAllLeaders([]);
          setLeaders([]);
          setError('No sign-in data found. Make sure members are using the new sign-in form!');
          setLoading(false);
          return;
        }
      }
      
      // If the local system function doesn't exist
      setError('Local leaderboard system not loaded. Please refresh the page.');
      setLoading(false);
      setLeaders([
        { rank: 1, name: 'System Loading...', score: '---', tier: 'Participant', isPaid: false },
        { rank: 2, name: 'Please refresh page', score: '---', tier: 'Participant', isPaid: false },
        { rank: 3, name: 'Check console for errors', score: '---', tier: 'Participant', isPaid: false }
      ]);
      
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to load leaderboard data from sign-in forms. Please check your internet connection.');
      setLoading(false);
      
      // Fallback data
      setLeaders([
        { rank: 1, name: 'Loading Error', score: '---', tier: 'Participant', isPaid: false },
        { rank: 2, name: 'Check connection', score: '---', tier: 'Participant', isPaid: false },
        { rank: 3, name: 'Try refreshing', score: '---', tier: 'Participant', isPaid: false }
      ]);
    }
  };

  const getTierColor = (tier) => {
    switch(tier?.toLowerCase()) {
      case 'gold': return 'text-nsbeGold';
      case 'silver': return 'text-gray-300';
      case 'bronze': return 'text-yellow-600';
      default: return 'text-blue-400';
    }
  };

  return (
    <StyledSection style={{
      clipPath: 'polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)',
    }} className="p-3 sm:p-4 lg:p-5 h-fit">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-5 space-y-2 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-black font-futuristic tracking-wider text-center sm:text-left" style={{
          background: SHARED_STYLES.gradients.gold,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 0 30px rgba(255, 215, 0, 0.8)'
        }}>LEADERBOARD</h2>
        {loading && (
          <div className="animate-spin w-5 h-5 sm:w-6 sm:h-6 border-2 border-yellow-400 border-t-transparent rounded-full"></div>
        )}
      </div>
      
      {error && (
        <div className="text-red-400 text-center mb-4 p-2 bg-red-900/20 rounded-lg border border-red-600 text-xs sm:text-sm">
          {error}
        </div>
      )}
      
      <div className="space-y-2 sm:space-y-3 max-h-64 sm:max-h-80 overflow-y-auto">
        {leaders.map((leader, index) => {
          const isCurrentUser = userName && (
            leader.name.toLowerCase().includes(userName.toLowerCase()) ||
            userName.toLowerCase().includes(leader.name.toLowerCase()) ||
            (leader.email && leader.email.toLowerCase().includes(userName.toLowerCase())) ||
            (leader.uniqname && leader.uniqname.toLowerCase().includes(userName.toLowerCase()))
          );
          
          return (
            <div key={index} className={`flex justify-between items-center text-white p-2 sm:p-3 border transition-all duration-300 ${
              isCurrentUser 
                ? 'bg-yellow-400/20 border-yellow-400 shadow-lg shadow-yellow-400/20' 
                : 'bg-gray-800/30 border-gray-600 hover:bg-gray-700/30'
            }`} style={{
              clipPath: SHARED_STYLES.clipPaths.card
            }}>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <span className={`font-bold text-sm sm:text-base tracking-wide min-w-[15px] ${
                  isCurrentUser ? 'text-yellow-400' : 'text-white'
                }`}>{leader.rank}</span>
                <div>
                  <div className={`font-bold text-xs sm:text-sm lg:text-base ${
                    isCurrentUser ? 'text-yellow-300' : 'text-white'
                  }`}>
                    {leader.name} {isCurrentUser && '(You)'}
                    {leader.isPaid && <span className="ml-1 text-xs text-green-400">💳</span>}
                  </div>
                  <div className={`text-xs sm:text-xs font-semibold ${getTierColor(leader.tier)}`}>
                    {leader.tier} {leader.isPaid && <span className="text-green-400">• PAID</span>}
                  </div>
                </div>
              </div>
              <span className="font-black text-base sm:text-lg" style={{
                background: SHARED_STYLES.gradients.gold,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>{leader.score}</span>
            </div>
          );
        })}
      </div>
      
      <div className="mt-3 sm:mt-4 text-center">
        <StyledButton 
          onClick={fetchLeaderboardData}
          disabled={loading}
          className="text-xs sm:text-sm py-2 px-3 sm:py-2 sm:px-4"
        >
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </StyledButton>
      </div>
    </StyledSection>
  );
}

function App() {
  const [userName, setUserName] = useState('');
  const [mentorshipMode, setMentorshipMode] = useState(false);
  const [userStats, setUserStats] = useState({
    level: null,
    xp: null,
    maxXP: 6000,
    tier: null,
    rank: null
  });

  // Admin panel keyboard shortcut (Ctrl+Shift+A)
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'A') {
        event.preventDefault();
        if (window.AdminPanel) {
          window.AdminPanel.show();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleUserDataFound = (userData) => {
    setUserStats({
      level: userData.level,
      xp: userData.xp,
      maxXP: userData.nextLevelXP * userData.level, // Dynamic max XP based on level
      tier: userData.tier,
      rank: userData.rank
    });
  };

  const handleNameChange = (name) => {
    setUserName(name);
    // Reset to default if name is cleared
    if (!name.trim()) {
      setUserStats({
        level: null,
        xp: null,
        maxXP: 6000,
        tier: null,
        rank: null
      });
    }
  };

  const hasUserData = userName.trim() && userStats.level !== null;

  // If mentorship mode is active, render the MentorshipHub
  if (mentorshipMode) {
    return <MentorshipHub 
      onBackClick={() => setMentorshipMode(false)} 
      userData={userStats}
      eventData={[]} // Legacy prop, now using localDataManager
      localDataManager={window.LocalDataManager} // Pass the data manager for live tracking
    />;
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 font-futuristic" style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%)'
    }}>
      <SkipNavigation />
      {window.InfoSidebar && React.createElement(window.InfoSidebar)}
      
      <div className="max-w-7xl mx-auto">
        <BattlePassHeader 
          userLevel={userStats.level} 
          userXP={userStats.xp} 
          maxXP={userStats.maxXP}
          userName={userName}
          onNameChange={handleNameChange}
          hasUserData={hasUserData}
        />
        
        {/* Show main dashboard content */}
        {hasUserData ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
            <div className="lg:col-span-2 xl:col-span-2">
              <BadgeSection />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-5">
                <MentorshipSection onMentorshipClick={() => setMentorshipMode(true)} />
                <MemberStats userStats={userStats} />
              </div>
            </div>
            
            <div className="lg:col-span-2 xl:col-span-1">
              <div id="leaderboard-section">
                <Leaderboard 
                  userName={userName}
                  onUserDataFound={handleUserDataFound}
                />
              </div>
            </div>
          </div>
        ) : (
          /* Show main dashboard without user-specific data */
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
            <div className="lg:col-span-2 xl:col-span-2">
              <BadgeSection />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-5">
                <MentorshipSection onMentorshipClick={() => setMentorshipMode(true)} />
                <StyledSection style={{
                  clipPath: 'polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)',
                }} className="p-3 sm:p-4 lg:p-5 h-fit">
                  <div className="text-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto mb-3 sm:mb-4 relative" style={{
                      background: SHARED_STYLES.gradients.gold.replace('135deg', '135deg'),
                      clipPath: SHARED_STYLES.clipPaths.badge,
                      boxShadow: '0 0 30px rgba(255, 215, 0, 0.5)'
                    }}>
                      <div className="absolute inset-2 sm:inset-3 lg:inset-4 flex items-center justify-center" style={{
                        background: 'linear-gradient(135deg, #1a1f2e, #16213e)',
                        clipPath: SHARED_STYLES.clipPaths.badge,
                        border: '2px solid #ffd700'
                      }}>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 flex items-center justify-center relative" style={{
                          background: SHARED_STYLES.gradients.gold.replace('135deg', '135deg'),
                          clipPath: SHARED_STYLES.clipPaths.badge
                        }}>
                          <span className="text-black text-lg sm:text-xl lg:text-2xl font-bold">📋</span>
                        </div>
                      </div>
                    </div>
                    <SectionTitle theme="gold">BATTLE PASS INFO</SectionTitle>
                    <p className="mt-4 text-gray-300 text-sm sm:text-base">Click the INFO button in the top-right corner to view tiers, points system, events, and more!</p>
                  </div>
                </StyledSection>
              </div>
            </div>
            
            <div className="lg:col-span-2 xl:col-span-1">
              <div id="leaderboard-section">
                <Leaderboard 
                  userName={userName}
                  onUserDataFound={handleUserDataFound}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* User stats display when name is entered */}
        {userName && userStats.rank && (
          <StyledSection theme="gold" className="mt-4 sm:mt-5 text-center p-2 sm:p-3">
            <p className="text-yellow-400 font-bold text-sm sm:text-base lg:text-lg" style={{
              fontFamily: 'Orbitron, monospace'
            }}>
              {userName} - Rank #{userStats.rank} | {userStats.tier} Tier | {userStats.xp} XP
            </p>
          </StyledSection>
        )}
        
        {/* Debug info */}
        <div className="mt-4 sm:mt-5 text-center text-gray-500 text-xs sm:text-sm">
          <p>Data Source: Sign-in Forms & Paid Members Directory</p>
          <p>Last updated: {new Date().toLocaleTimeString()}</p>
        </div>
      </div>
    </div>
  );
}

// Mount App once scripts are loaded
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);