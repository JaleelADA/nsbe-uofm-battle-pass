
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

// ===== WELCOME POPUP =====
function WelcomePopup({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
      <div 
        className="relative max-w-md w-full p-6 sm:p-8 text-center"
        style={{
          background: 'linear-gradient(135deg, #0a0f1c 0%, #1a1f2e 50%, #0a0f1c 100%)',
          border: '3px solid #FFD700',
          clipPath: 'polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)',
          boxShadow: '0 0 60px rgba(255, 215, 0, 0.4), inset 0 0 40px rgba(255, 215, 0, 0.1)'
        }}
      >
        {/* Decorative corner accents */}
        <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-yellow-400"></div>
        <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-yellow-400"></div>
        <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-yellow-400"></div>
        <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-yellow-400"></div>
        
        {/* Fire emoji header */}
        <div className="text-5xl sm:text-6xl mb-4 animate-bounce">🔥</div>
        
        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-black mb-2 tracking-wider" style={{
          fontFamily: 'Orbitron, monospace',
          background: 'linear-gradient(135deg, #FFD700, #FFA500)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          WELCOME BACK!
        </h2>
        
        {/* Subtitle */}
        <div className="text-lg sm:text-xl text-yellow-400 font-bold mb-4" style={{ fontFamily: 'Orbitron, monospace' }}>
          SEMESTER TWO
        </div>
        
        {/* Message */}
        <p className="text-gray-300 text-sm sm:text-base mb-4 leading-relaxed">
          Ready to level up? New semester, <span className="text-cyan-400 font-semibold">fresh points reset!</span> 
          Your Fall '25 attendance is archived, but Winter '26 is a clean slate.
        </p>
        
        <p className="text-gray-400 text-xs sm:text-sm mb-6 leading-relaxed">
          Keep attending events, paying your dues, and climbing the leaderboard. 
          <span className="text-yellow-400 font-semibold"> Let's get it! 💪</span>
        </p>
        
        {/* Stats teaser */}
        <div className="grid grid-cols-3 gap-2 mb-6 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
          <div className="text-center">
            <div className="text-xl sm:text-2xl">🔄</div>
            <div className="text-xs text-gray-400">Points Reset</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl">📚</div>
            <div className="text-xs text-gray-400">F25 Archived</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl">🎯</div>
            <div className="text-xs text-gray-400">New Goals</div>
          </div>
        </div>
        
        {/* CTA Button */}
        <button
          onClick={onClose}
          className="w-full py-3 px-6 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-black text-sm sm:text-base tracking-wider transition-all duration-300 transform hover:scale-105"
          style={{
            fontFamily: 'Orbitron, monospace',
            clipPath: 'polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)'
          }}
        >
          LET'S GO! 🚀
        </button>
        
        {/* Skip link */}
        <button 
          onClick={onClose}
          className="mt-3 text-gray-500 hover:text-gray-300 text-xs transition-colors"
        >
          Don't show again this session
        </button>
      </div>
    </div>
  );
}

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

// Slim, compact header - follows Fitts's Law (important elements easily reachable)
function BattlePassHeader({ userLevel = null, userXP = null, maxXP = 6000, userName = '', onNameChange, hasUserData = false, userStats = {} }) {
  const progress = hasUserData && userXP ? Math.min((userXP / maxXP) * 100, 100) : 0;
  
  return (
    <div className="relative p-3 sm:p-4 mb-3 sm:mb-4" style={{
      background: 'linear-gradient(135deg, #0a0f1c 0%, #1a1f2e 50%, #0a0f1c 100%)',
      clipPath: 'polygon(15px 0%, 100% 0%, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0% 100%, 0% 15px)',
      border: '2px solid #FFD700',
      boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)'
    }}>
      {/* Top row: Logo, Title, Search */}
      <div className="flex items-center justify-between gap-3 sm:gap-4">
        {/* Logo + Title */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center" style={{
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            clipPath: SHARED_STYLES.clipPaths.badge,
            boxShadow: '0 0 15px rgba(255, 215, 0, 0.5)'
          }}>
            <span className="text-lg sm:text-xl">🔥</span>
          </div>
          <div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-black tracking-wider leading-none" style={{
              fontFamily: 'Orbitron, monospace',
              background: SHARED_STYLES.gradients.gold,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>NSBE BATTLE PASS</h1>
            <div className="text-xs text-yellow-400/70" style={{ fontFamily: 'Orbitron, monospace' }}>UofM Chapter</div>
          </div>
        </div>
        
        {/* Search Input - centered/flexible */}
        <div className="flex-1 max-w-xs sm:max-w-sm lg:max-w-md">
          <input
            type="text"
            placeholder="🔍 Search by name or uniqname..."
            value={userName}
            onChange={(e) => onNameChange(e.target.value)}
            className="w-full bg-gray-900/80 border border-yellow-400/50 px-3 py-2 text-sm text-yellow-100 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400/30 transition-all"
            style={{ 
              fontFamily: 'Orbitron, monospace',
              clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)'
            }}
          />
        </div>
      </div>
      
      {/* Stats Bar - only show when user has data (Progressive Disclosure) */}
      {hasUserData && (
        <div className="mt-3 pt-3 border-t border-yellow-400/30">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Quick Stats - Miller's Law: chunked info */}
            <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl font-black" style={{
                  fontFamily: 'Orbitron, monospace',
                  background: SHARED_STYLES.gradients.gold,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>LV{userLevel}</span>
              </div>
              <div className="h-6 w-px bg-yellow-400/30 hidden sm:block"></div>
              <div className="text-sm">
                <span className="text-gray-400">XP:</span>
                <span className="text-yellow-400 font-bold ml-1">{userXP}</span>
              </div>
              <div className="h-6 w-px bg-yellow-400/30 hidden sm:block"></div>
              <div className="text-sm">
                <span className="text-gray-400">Rank:</span>
                <span className="text-yellow-400 font-bold ml-1">#{userStats.rank || '-'}</span>
              </div>
              <div className="h-6 w-px bg-yellow-400/30 hidden sm:block"></div>
              <div className="text-sm">
                <span className={`font-bold px-2 py-0.5 rounded text-xs ${
                  userStats.tier === 'Gold' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/50' :
                  userStats.tier === 'Silver' ? 'bg-gray-400/20 text-gray-300 border border-gray-400/50' :
                  userStats.tier === 'Bronze' ? 'bg-orange-500/20 text-orange-400 border border-orange-400/50' :
                  'bg-blue-500/20 text-blue-400 border border-blue-400/50'
                }`}>{userStats.tier || 'Participant'}</span>
              </div>
            </div>
            
            {/* XP Progress Bar */}
            <div className="flex-1 min-w-[150px] max-w-xs">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="bg-gray-800 h-2 rounded-full overflow-hidden" style={{ border: '1px solid #4a5568' }}>
                <div className="h-full transition-all duration-700" style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #FFD700, #FFA500)'
                }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
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

// Compact tier badges - visual hierarchy showing available tiers
function BadgeSection() {
  return null; // Removed - tiers now shown in InfoSidebar only to reduce clutter
}

// Compact Badge Progress Grid - follows Miller's Law (chunked visual info)
function BadgeProgressTracker({ userName }) {
  const [memberBadges, setMemberBadges] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedBadge, setExpandedBadge] = useState(null);

  // Auto-search when userName changes
  useEffect(() => {
    if (userName && userName.trim()) {
      handleMemberSearch(userName);
    } else {
      setMemberBadges(null);
    }
  }, [userName]);

  // Calculate badge progress for a member
  const calculateMemberBadgeProgress = (memberStats) => {
    if (!memberStats || !window.TRACKABLE_BADGES_CONFIG) return [];
    
    return window.TRACKABLE_BADGES_CONFIG.map(badge => {
      let earned = false;
      let progress = 0;
      let progressText = '';

      switch (badge.type) {
        case 'status':
          if (badge.requirement === 'paid_status') {
            earned = memberStats.paid_member === 'Yes';
            progressText = earned ? 'Paid Member' : 'Not paid';
            progress = earned ? 1 : 0;
          }
          break;
        case 'count':
          const currentCount = memberStats[badge.requirement.field] || 0;
          const targetCount = badge.requirement.value;
          earned = currentCount >= targetCount;
          progress = Math.min(currentCount / targetCount, 1);
          progressText = `${currentCount}/${targetCount}`;
          break;
        case 'variety':
          const eventCategories = [];
          Object.keys(memberStats).forEach(key => {
            if (memberStats[key] > 0 && !['total_points', 'total_events', 'paid_member', 'member', 'uniqname', 'email', 'event_categories', 'eventHistory'].includes(key)) {
              eventCategories.push(key);
            }
          });
          const uniqueCategories = memberStats.event_categories || eventCategories.length;
          const targetCategories = badge.requirement.value;
          earned = uniqueCategories >= targetCategories;
          progress = Math.min(uniqueCategories / targetCategories, 1);
          progressText = `${uniqueCategories}/${targetCategories} types`;
          break;
      }

      return { ...badge, earned, progress, progressText };
    });
  };

  const handleMemberSearch = async (query) => {
    if (!query || !query.trim()) return;
    setIsLoading(true);
    try {
      const memberStats = await window.getMemberStats(query.trim());
      if (memberStats) {
        const badges = calculateMemberBadgeProgress(memberStats);
        setMemberBadges({ member: memberStats.member, badges, stats: memberStats });
      } else {
        setMemberBadges(null);
      }
    } catch (error) {
      console.error('Error looking up member:', error);
      setMemberBadges(null);
    } finally {
      setIsLoading(false);
    }
  };

  const earnedCount = memberBadges?.badges?.filter(b => b.earned).length || 0;
  const totalCount = memberBadges?.badges?.length || 0;

  // Don't render if no user searched
  if (!userName) return null;

  return (
    <StyledSection style={{
      clipPath: 'polygon(15px 0%, 100% 0%, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0% 100%, 0% 15px)',
    }} className="p-3 sm:p-4">
      {/* Header with count */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm sm:text-base font-bold text-yellow-400" style={{ fontFamily: 'Orbitron, monospace' }}>
          🏆 BADGES
        </h3>
        {memberBadges && (
          <span className="text-xs text-gray-400">
            {earnedCount}/{totalCount} earned
          </span>
        )}
        {isLoading && <div className="animate-spin w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full"></div>}
      </div>

      {/* Compact Badge Grid - Gestalt Principle of Proximity */}
      {memberBadges?.badges && (
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
          {memberBadges.badges.map((badge) => (
            <div
              key={badge.id}
              onClick={() => setExpandedBadge(expandedBadge === badge.id ? null : badge.id)}
              className={`relative p-2 text-center cursor-pointer transition-all duration-200 hover:scale-110 ${
                badge.earned 
                  ? 'bg-gradient-to-br from-yellow-900/60 to-orange-900/60 border-yellow-400' 
                  : badge.progress > 0
                  ? 'bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border-blue-400/50'
                  : 'bg-gray-800/50 border-gray-600/50'
              } border rounded-lg`}
              title={`${badge.name}: ${badge.progressText}`}
            >
              <span className="text-xl sm:text-2xl block" style={{
                filter: badge.earned ? 'drop-shadow(0 0 8px rgba(255,215,0,0.8))' : badge.progress > 0 ? 'none' : 'grayscale(1) brightness(0.5)'
              }}>{badge.icon}</span>
              
              {/* Progress indicator ring */}
              {!badge.earned && badge.progress > 0 && (
                <div className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-blue-500 text-[8px] text-white flex items-center justify-center font-bold">
                  {Math.round(badge.progress * 100) > 99 ? '!' : Math.round(badge.progress * 10)}
                </div>
              )}
              
              {/* Earned checkmark */}
              {badge.earned && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 text-[10px] text-white flex items-center justify-center">✓</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Expanded badge details - Progressive Disclosure */}
      {expandedBadge && memberBadges?.badges && (
        <div className="mt-3 p-2 bg-gray-800/50 border border-gray-600 rounded-lg text-xs">
          {(() => {
            const badge = memberBadges.badges.find(b => b.id === expandedBadge);
            if (!badge) return null;
            return (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{badge.icon}</span>
                  <div>
                    <div className="font-bold text-white">{badge.name}</div>
                    <div className="text-gray-400">{badge.desc}</div>
                  </div>
                </div>
                <div className="text-right">
                  {badge.earned ? (
                    <span className="text-green-400 font-bold">+{badge.xp} XP ✓</span>
                  ) : (
                    <div>
                      <div className="text-gray-300">{badge.progressText}</div>
                      <div className="w-16 h-1.5 bg-gray-700 rounded-full mt-1">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${badge.progress * 100}%` }}></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Empty/Loading state */}
      {!memberBadges && !isLoading && userName && (
        <div className="text-center py-4 text-gray-500 text-xs">No badge data found</div>
      )}
    </StyledSection>
  );
}

// Compact action card - Fitts's Law (large touch targets for key actions)
function MemberStats({ userStats, userName, onViewHistory }) {
  if (!userStats || !userStats.rank) return null;
  
  return (
    <StyledSection style={{
      clipPath: 'polygon(15px 0%, 100% 0%, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0% 100%, 0% 15px)',
    }} className="p-3 sm:p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm sm:text-base font-bold text-yellow-400" style={{ fontFamily: 'Orbitron, monospace' }}>
          ⚡ QUICK ACTIONS
        </h3>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => onViewHistory(userName)}
          className="flex-1 p-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-xs sm:text-sm font-bold transition-all rounded-lg border border-blue-400/50"
        >
          📋 View History
        </button>
        <a
          href="https://mynsbe.nsbe.org/s/joinprocess"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 p-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white text-xs sm:text-sm font-bold transition-all rounded-lg border border-green-400/50 text-center"
        >
          💳 Pay Dues
        </a>
      </div>
    </StyledSection>
  );
}

function AttendanceHistory({ userName, onClose }) {
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAttendanceHistory();
  }, [userName]);

  const fetchAttendanceHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (window.getMemberAttendanceHistory) {
        const history = await window.getMemberAttendanceHistory(userName);
        if (history) {
          setAttendanceData(history);
        } else {
          setError('No attendance history found for this member.');
        }
      } else {
        setError('Attendance history system not loaded.');
      }
    } catch (err) {
      console.error('Error fetching attendance history:', err);
      setError('Failed to load attendance history.');
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeColor = (eventType) => {
    switch(eventType) {
      case 'GBM': return 'text-yellow-400';
      case 'Professional Development': return 'text-blue-400';
      case 'P-Zone': return 'text-green-400';
      case 'Community Service': return 'text-purple-400';
      case 'Convention Attendance': return 'text-red-400';
      case 'Social Events': return 'text-pink-400';
      default: return 'text-gray-300';
    }
  };

  return (
    <StyledSection style={{
      clipPath: 'polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)',
    }} className="p-3 sm:p-4 lg:p-5">
      <div className="flex justify-between items-center mb-4">
        <SectionTitle theme="blue">ATTENDANCE HISTORY</SectionTitle>
        <StyledButton onClick={onClose} className="text-xs py-1 px-3" theme="blue">
          ✕ Close
        </StyledButton>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-300">Loading attendance history...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-8">
          <p className="text-red-400 mb-4">{error}</p>
          <StyledButton onClick={fetchAttendanceHistory} className="text-xs py-2 px-4">
            Retry
          </StyledButton>
        </div>
      )}

      {attendanceData && !loading && (
        <div>
          {/* Member Summary */}
          <div className="mb-6 p-4 bg-gray-800/50 border border-gray-600" style={{
            clipPath: SHARED_STYLES.clipPaths.card
          }}>
            <h3 className="text-lg font-bold text-yellow-400 mb-2">{attendanceData.member.displayName}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Total Points: </span>
                <span className="text-yellow-400 font-bold">{attendanceData.member.totalPoints}</span>
              </div>
              <div>
                <span className="text-gray-400">Events: </span>
                <span className="text-blue-400 font-bold">{attendanceData.summary.totalEvents}</span>
              </div>
              <div>
                <span className="text-gray-400">Average: </span>
                <span className="text-green-400 font-bold">{attendanceData.summary.averagePointsPerEvent} pts/event</span>
              </div>
              <div>
                <span className="text-gray-400">Tier: </span>
                <span className="text-yellow-400 font-bold">{attendanceData.member.tier}</span>
              </div>
            </div>
            {attendanceData.summary.cappedEvents > 0 && (
              <div className="mt-2 text-xs text-orange-400">
                ⚠️ {attendanceData.summary.cappedEvents} events capped at 5 points (unpaid dues)
              </div>
            )}
          </div>

          {/* Events List */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {attendanceData.events.map((event, index) => (
              <div key={event.id} className="p-3 bg-gray-800/30 border border-gray-600 hover:bg-gray-700/30" style={{
                clipPath: SHARED_STYLES.clipPaths.card
              }}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className={`font-bold ${getEventTypeColor(event.eventType)}`}>
                      {event.eventType}
                    </div>
                    <div className="text-xs text-gray-400">
                      {event.formattedDate}
                    </div>
                    {event.broughtFriend && (
                      <div className="text-xs text-blue-400 mt-1">
                        👥 Brought {event.friendCount} friend{event.friendCount > 1 ? 's' : ''} (+{event.friendPoints} pts)
                      </div>
                    )}
                    {event.duesCapped && (
                      <div className="text-xs text-orange-400 mt-1">
                        🔒 Capped at 5 points (was {event.originalPoints} points)
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-yellow-400">
                      {event.pointsEarned}
                    </div>
                    <div className="text-xs text-gray-400">points</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {attendanceData.events.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No events found for this member.
            </div>
          )}
        </div>
      )}
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
  }, [userName, allLeaders]); // Fixed: added allLeaders to dependency array

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      
      console.log('[Leaderboard] Checking for window.getLocalLeaderboard...', typeof window.getLocalLeaderboard);
      
      // Use new local leaderboard system ONLY
      if (window.getLocalLeaderboard) {
        console.log('[Leaderboard] Calling getLocalLeaderboard...');
        const leaderboardResult = await window.getLocalLeaderboard();
        
        console.log('[Leaderboard] Result:', leaderboardResult);
        
        if (leaderboardResult && leaderboardResult.leaderboard && leaderboardResult.leaderboard.length > 0) {
          console.log('[Leaderboard] Setting leaders:', leaderboardResult.leaderboard.length, 'members');
          setAllLeaders(leaderboardResult.leaderboard);
          setLeaders(leaderboardResult.leaderboard.slice(0, 10));
          
          // Store dynamic tier thresholds globally for display
          window.CURRENT_TIER_THRESHOLDS = leaderboardResult.tierThresholds;
          
          setLoading(false);
          setError(null);
          return;
        } else {
          // No data from forms yet
          console.warn('[Leaderboard] No data in result');
          setAllLeaders([]);
          setLeaders([]);
          setError('No sign-in data found. Make sure members are using the new sign-in form!');
          setLoading(false);
          return;
        }
      }
      
      // If the local system function doesn't exist
      console.error('[Leaderboard] window.getLocalLeaderboard not found!');
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
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black font-futuristic tracking-wider text-center sm:text-left" style={{
            background: SHARED_STYLES.gradients.gold,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 30px rgba(255, 215, 0, 0.8)'
          }}>LEADERBOARD</h2>
          <div className="text-xs text-cyan-400 text-center sm:text-left">
            Winter 2026 • Points Reset
          </div>
        </div>
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
  const [attendanceHistoryMode, setAttendanceHistoryMode] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(() => {
    // Check if user has already dismissed the popup this session
    return !sessionStorage.getItem('nsbe_welcome_dismissed_w25');
  });
  const [userStats, setUserStats] = useState({
    level: null,
    xp: null,
    maxXP: 6000,
    tier: null,
    rank: null
  });
  
  const handleCloseWelcome = () => {
    setShowWelcomePopup(false);
    sessionStorage.setItem('nsbe_welcome_dismissed_w25', 'true');
  };

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

  // If attendance history mode is active, render the AttendanceHistory
  if (attendanceHistoryMode) {
    return <AttendanceHistory 
      userName={userName}
      onClose={() => setAttendanceHistoryMode(false)}
    />;
  }

  return (
    <div className="min-h-screen p-3 sm:p-4 lg:p-6 font-futuristic" style={{
      background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)'
    }}>
      {/* Welcome Back Popup */}
      {showWelcomePopup && <WelcomePopup onClose={handleCloseWelcome} />}
      
      <SkipNavigation />
      {window.InfoSidebar && React.createElement(window.InfoSidebar)}
      
      <div className="max-w-6xl mx-auto">
        {/* Slim Header */}
        <BattlePassHeader 
          userLevel={userStats.level} 
          userXP={userStats.xp} 
          maxXP={userStats.maxXP}
          userName={userName}
          onNameChange={handleNameChange}
          hasUserData={hasUserData}
          userStats={userStats}
        />
        
        {/* Main Dashboard - Side by side layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* Left Column: Stats & Badges (3/5 width) */}
          <div className="lg:col-span-3 space-y-3">
            {/* Quick Actions - only show when user has data */}
            {hasUserData && (
              <MemberStats 
                userStats={userStats} 
                userName={userName}
                onViewHistory={() => setAttendanceHistoryMode(true)}
              />
            )}
            
            {/* Badge Progress Grid */}
            <BadgeProgressTracker userName={userName} />
            
            {/* Welcome message when no user */}
            {!hasUserData && (
              <StyledSection style={{
                clipPath: 'polygon(15px 0%, 100% 0%, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0% 100%, 0% 15px)',
              }} className="p-4 sm:p-6 text-center">
                <div className="text-4xl mb-3">🎮</div>
                <h3 className="text-lg sm:text-xl font-bold text-yellow-400 mb-2" style={{ fontFamily: 'Orbitron, monospace' }}>
                  Welcome to Battle Pass!
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Search your name or uniqname above to see your stats, rank, and badge progress.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <a
                    href="https://docs.google.com/forms/d/e/1FAIpQLSfXgbgogJ_yIhwgmjH6N--WQLRF2ewLf7KkJZTQSCndZCaiNQ/viewform"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-bold rounded-lg transition-all"
                  >
                    📝 Sign In to Events
                  </a>
                  <a
                    href="https://mynsbe.nsbe.org/s/joinprocess"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-bold rounded-lg transition-all"
                  >
                    💳 Pay NSBE Dues
                  </a>
                </div>
              </StyledSection>
            )}
          </div>
          
          {/* Right Column: Leaderboard (2/5 width) */}
          <div className="lg:col-span-2">
            <div id="leaderboard-section">
              <Leaderboard 
                userName={userName}
                onUserDataFound={handleUserDataFound}
              />
            </div>
          </div>
        </div>
        
        {/* Minimal footer */}
        <div className="mt-4 text-center text-gray-600 text-xs">
          <p>Data refreshes automatically • Last updated: {new Date().toLocaleTimeString()}</p>
        </div>
      </div>
    </div>
  );
}

// Mount App once scripts are loaded
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);