// Standalone MentorshipHub component with live badge tracking
const { useState, useEffect } = React;
function MentorshipHub({ onBackClick, userData, eventData, localDataManager }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [trackableAchievements, setTrackableAchievements] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Use trackable badges from global configuration
  const TRACKABLE_BADGES = window.TRACKABLE_BADGES_CONFIG || [];

  // Load and process user data for badge tracking
  useEffect(() => {
    async function loadUserData() {
      if (!localDataManager) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Get current user from localStorage or user input
        const storedUser = localStorage.getItem('currentUserUniqname');
        if (!storedUser) {
          // Prompt user for uniqname if not stored
          const userUniqname = prompt("Enter your uniqname to track your badges:");
          if (userUniqname) {
            localStorage.setItem('currentUserUniqname', userUniqname.trim().toLowerCase());
            setCurrentUser(userUniqname.trim().toLowerCase());
          }
        } else {
          setCurrentUser(storedUser);
        }

        // Calculate achievements for current user
        if (storedUser || currentUser) {
          const achievements = await calculateTrackableAchievements(storedUser || currentUser);
          setTrackableAchievements(achievements);
        }
        
      } catch (error) {
        console.error('Error loading user data for badges:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadUserData();
  }, [localDataManager, currentUser]);

  // Calculate trackable achievements based on real data
  const calculateTrackableAchievements = async (userUniqname) => {
    if (!userUniqname || !localDataManager) {
      return TRACKABLE_BADGES.map(badge => ({
        ...badge,
        status: 'locked',
        current: 0,
        progress: 0
      }));
    }

    try {
      // Fetch live data including leaderboard for dynamic tier calculation
      const leaderboardResult = await localDataManager.getLocalLeaderboard();
      const signInData = await localDataManager.fetchSignInData();
      const paidMembers = await localDataManager.fetchPaidMembers();
      
      // Filter user's activities
      const userActivities = signInData.filter(entry => {
        const entryUniqname = (entry['Uniqname'] || entry['uniqname'] || '').toLowerCase().trim();
        return entryUniqname === userUniqname.toLowerCase().trim();
      });

      // Process user statistics
      const userStats = processUserStats(userActivities, paidMembers, userUniqname);
      
      // Get all member points for dynamic tier calculation
      const allMemberPoints = leaderboardResult.leaderboard ? 
        leaderboardResult.leaderboard.map(member => member.score) : [];
      
      // Calculate badge progress with dynamic tier info
      return TRACKABLE_BADGES.map(badge => {
        const progress = calculateBadgeProgress(badge, userStats, userActivities, allMemberPoints, leaderboardResult.tierThresholds);
        return {
          ...badge,
          ...progress
        };
      });

    } catch (error) {
      console.error('Error calculating achievements:', error);
      return TRACKABLE_BADGES.map(badge => ({
        ...badge,
        status: 'locked',
        current: 0,
        progress: 0
      }));
    }
  };

  // Process user statistics from activities
  const processUserStats = (userActivities, paidMembers, userUniqname) => {
    const stats = {
      total_events: userActivities.length,
      total_points: 0,
      friends_brought: 0,
      event_categories: new Set(),
      is_paid_member: false
    };

    // Initialize event type counters
    Object.keys(window.NEW_POINT_SYSTEM.activities).forEach(eventType => {
      stats[eventType] = 0;
    });

    // Process each activity
    userActivities.forEach(activity => {
      const pointsCalc = localDataManager.calculateMemberPoints(activity, paidMembers, userActivities);
      stats.total_points += pointsCalc.totalPoints;
      
      if (pointsCalc.friendCount > 0) {
        stats.friends_brought += pointsCalc.friendCount;
      }

      if (pointsCalc.eventType) {
        stats[pointsCalc.eventType] = (stats[pointsCalc.eventType] || 0) + 1;
        stats.event_categories.add(pointsCalc.eventType);
      }
    });

    // Check paid member status
    if (userActivities.length > 0) {
      const userEmail = userActivities[0]['Email Address'] || userActivities[0]['Email'];
      stats.is_paid_member = localDataManager.isPaidMember(userEmail, paidMembers);
    }

    stats.event_categories = stats.event_categories.size;
    return stats;
  };

  // Calculate individual badge progress with dynamic tier support
  const calculateBadgeProgress = (badge, userStats, userActivities, allMemberPoints = [], tierThresholds = null) => {
    let current = 0;
    let status = 'locked';
    let progress = 0;
    let requirement = badge.requirement?.value || 1;

    switch (badge.type) {
      case 'status':
        if (badge.requirement === 'paid_status') {
          current = userStats.is_paid_member ? 1 : 0;
          progress = current * 100;
          requirement = 1;
        }
        break;

      case 'count':
        current = userStats[badge.requirement.field] || 0;
        progress = Math.min((current / badge.requirement.value) * 100, 100);
        requirement = badge.requirement.value;
        break;

      case 'points':
        current = userStats[badge.requirement.field] || 0;
        
        // Use dynamic tier thresholds for point-based badges
        if (tierThresholds && badge.id === 'bronze_tier') {
          requirement = tierThresholds.BRONZE;
        } else if (tierThresholds && badge.id === 'silver_tier') {
          requirement = tierThresholds.SILVER;
        } else if (tierThresholds && badge.id === 'gold_tier') {
          requirement = tierThresholds.GOLD;
        } else {
          requirement = badge.requirement.value; // Fallback to fixed requirement
        }
        
        progress = requirement > 0 ? Math.min((current / requirement) * 100, 100) : 0;
        break;

      case 'variety':
        current = userStats[badge.requirement.field] || 0;
        progress = Math.min((current / badge.requirement.value) * 100, 100);
        requirement = badge.requirement.value;
        break;
    }

    // Determine status
    if (progress >= 100) {
      status = 'completed';
    } else if (progress > 0) {
      status = 'in_progress';
    }

    // Update description with current progress and dynamic requirements
    let updatedDesc = badge.desc;
    if (badge.type === 'points' && tierThresholds) {
      // Update point badge descriptions with dynamic thresholds
      if (badge.id === 'bronze_tier') {
        updatedDesc = `Earn ${Math.round(requirement)}+ Points (${current}/${Math.round(requirement)})`;
      } else if (badge.id === 'silver_tier') {
        updatedDesc = `Earn ${Math.round(requirement)}+ Points (${current}/${Math.round(requirement)})`;
      } else if (badge.id === 'gold_tier') {
        updatedDesc = `Earn ${Math.round(requirement)}+ Points (${current}/${Math.round(requirement)})`;
      }
    } else {
      // Standard description update
      updatedDesc = badge.desc.includes('(') 
        ? badge.desc.replace(/\(.*?\)/, `(${current}/${requirement})`)
        : `${badge.desc} (${current}/${requirement})`;
    }

    return {
      status,
      current,
      progress: Math.round(progress),
      desc: updatedDesc,
      requirement: Math.round(requirement),
      color: status === 'completed' ? badge.color : (status === 'in_progress' ? '#fbbf24' : '#6b7280'),
      glow: status === 'completed' ? badge.glow : (status === 'in_progress' ? 'rgba(251, 191, 36, 0.5)' : 'rgba(75, 85, 99, 0.3)')
    };
  };
  
  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 font-futuristic" style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%)'
    }}>
      {/* Back Button */}
      <button
        onClick={onBackClick}
        className="fixed top-2 left-2 sm:top-4 sm:left-4 z-50 p-2 sm:p-3 bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold transition-all duration-300 shadow-lg text-xs sm:text-sm"
        style={{
          clipPath: SHARED_STYLES.clipPaths.button
        }}
      >
        ← <span className="hidden sm:inline">BACK TO DASHBOARD</span>
      </button>

      <div className="max-w-6xl mx-auto pt-12 sm:pt-16">
        {/* Section Title Bar */}
        <StyledSection theme="gold" className="mb-6 sm:mb-8 text-center p-4 sm:p-6 lg:p-8" style={{
          clipPath: 'polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)',
          border: '2px sm:border-3 solid #ffd700',
          boxShadow: '0 0 40px rgba(255, 215, 0, 0.4)'
        }}>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black tracking-wider mb-2 sm:mb-4" style={{
            background: SHARED_STYLES.gradients.gold,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontFamily: 'Orbitron, monospace'
          }}>🔥 MENTORSHIP + DEVELOPMENT HUB</h1>
          <p className="text-xs sm:text-sm md:text-base lg:text-xl text-gray-300 mb-3 sm:mb-4 md:mb-6" style={{ fontFamily: 'Orbitron, monospace' }}>
            Powered by NSBE UofM × P-Zone × M-Zone
          </p>
          <div className="flex justify-center items-center space-x-4 sm:space-x-6 lg:space-x-8 text-lg sm:text-xl md:text-2xl lg:text-4xl">
            <div className="text-center">
              <div>🔥</div>
              <div className="text-xs sm:text-sm text-yellow-400 mt-1 sm:mt-2">M-Zone</div>
            </div>
            <div className="text-center">
              <div>🎓</div>
              <div className="text-xs sm:text-sm text-blue-400 mt-1 sm:mt-2">Academic</div>
            </div>
            <div className="text-center">
              <div>🚀</div>
              <div className="text-xs sm:text-sm text-purple-400 mt-1 sm:mt-2">P-Zone</div>
            </div>
          </div>
        </StyledSection>

        {/* Filter Buttons for Subsections */}
        <div className="mb-6 sm:mb-8 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {[
            { id: 'all', label: 'Progress', icon: '🌟', color: 'yellow' },
            { id: 'nsbe', label: 'NSBE Mentoring', icon: '🔥', color: 'red' },
            { id: 'pzone', label: 'Professional Dev', icon: '🚀', color: 'blue' },
            { id: 'academic', label: 'Academic Corner', icon: '🎓', color: 'purple' }
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`p-2 sm:p-3 lg:p-4 text-xs sm:text-sm font-semibold transition-all duration-300 border-2 ${
                activeFilter === filter.id 
                  ? `bg-${filter.color}-400/20 text-${filter.color}-300 border-${filter.color}-400 shadow-lg` 
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/30 border-gray-600'
              }`}
              style={{ 
                clipPath: 'polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)',
                fontFamily: 'Orbitron, monospace'
              }}
            >
              <div className="text-base sm:text-lg lg:text-xl mb-1">{filter.icon}</div>
              <div className="text-xs">{filter.label}</div>
            </button>
          ))}
        </div>

        {/* Content based on active filter */}
        {activeFilter === 'all' && (
          <div>
            {/* User Info Section */}
            {currentUser && (
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-500/50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-white">🎯 Tracking Progress for: {currentUser}</h3>
                    <p className="text-sm text-blue-200">Live data updates automatically from event sign-ins</p>
                  </div>
                  <button 
                    onClick={() => {
                      localStorage.removeItem('currentUserUniqname');
                      setCurrentUser(null);
                      window.location.reload();
                    }}
                    className="px-3 py-1 bg-red-500/20 border border-red-400 text-red-200 text-xs rounded hover:bg-red-500/30 transition-colors"
                  >
                    Switch User
                  </button>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-8">
                <div className="text-2xl">⚡</div>
                <div className="text-yellow-400 font-bold">Loading your achievements...</div>
              </div>
            )}

            {/* Achievement Badges */}
            {!isLoading && (
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-400 mb-4 text-center">🏅 TRACKABLE ACHIEVEMENTS</h2>
                <div className="text-center mb-4 sm:mb-6 p-3 sm:p-4 bg-green-900/30 border border-green-500/50 rounded-lg">
                  <p className="text-green-200 text-xs sm:text-sm">
                    🚀 <strong>Real-Time Badge Tracking:</strong> Your achievements sync automatically with Google Sheets data from event sign-ins, 
                    paid member verification, and point calculations. Your progress is always up-to-date!
                  </p>
                </div>
                
                {/* Dynamic Tier Notice */}
                <div className="text-center mb-4 sm:mb-6 p-3 sm:p-4 bg-purple-900/30 border border-purple-500/50 rounded-lg">
                  <p className="text-purple-200 text-xs sm:text-sm">
                    ⚡ <strong>Dynamic Tier System:</strong> Bronze, Silver, and Gold point thresholds adjust automatically based on all members' performance. 
                    Top 25% = Gold, 25-50% = Silver, 50-75% = Bronze. Compete for your spot!
                  </p>
                </div>
                
                {/* Badge Summary Stats */}
                {trackableAchievements.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6 text-center">
                    <div className="p-3 bg-green-900/30 border border-green-500/50 rounded">
                      <div className="text-2xl text-green-400">{trackableAchievements.filter(a => a.status === 'completed').length}</div>
                      <div className="text-xs text-green-200">Completed</div>
                    </div>
                    <div className="p-3 bg-yellow-900/30 border border-yellow-500/50 rounded">
                      <div className="text-2xl text-yellow-400">{trackableAchievements.filter(a => a.status === 'in_progress').length}</div>
                      <div className="text-xs text-yellow-200">In Progress</div>
                    </div>
                    <div className="p-3 bg-gray-900/30 border border-gray-500/50 rounded">
                      <div className="text-2xl text-gray-400">{trackableAchievements.filter(a => a.status === 'locked').length}</div>
                      <div className="text-xs text-gray-200">Locked</div>
                    </div>
                    <div className="p-3 bg-purple-900/30 border border-purple-500/50 rounded">
                      <div className="text-2xl text-purple-400">{trackableAchievements.filter(a => a.status === 'completed').reduce((sum, a) => sum + a.xp, 0)}</div>
                      <div className="text-xs text-purple-200">Total XP</div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {trackableAchievements.map((achievement, index) => (
                    <div
                      key={achievement.id}
                      className={`p-3 sm:p-4 text-center transition-all cursor-pointer hover:scale-105 ${
                        achievement.status === 'completed' ? 'opacity-100' : 
                        achievement.status === 'in_progress' ? 'opacity-90' : 'opacity-60'
                      }`}
                      style={{
                        background: achievement.status === 'completed' 
                          ? 'linear-gradient(135deg, #1e293b, #334155)' 
                          : achievement.status === 'in_progress'
                          ? 'linear-gradient(135deg, #451a03, #78350f)'
                          : 'linear-gradient(135deg, #374151, #4b5563)',
                        clipPath: 'polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)',
                        border: `2px solid ${achievement.color}`,
                        boxShadow: achievement.status === 'completed' ? `0 0 20px ${achievement.glow}` : 
                                  achievement.status === 'in_progress' ? `0 0 15px ${achievement.glow}` : 'none'
                      }}
                    >
                      <div className="text-2xl sm:text-3xl mb-2">{achievement.icon}</div>
                      <div className="text-xs font-bold text-white mb-1">{achievement.name}</div>
                      <div className="text-xs text-gray-300 mb-2">{achievement.desc}</div>
                      
                      {/* Progress Bar for In Progress Badges */}
                      {achievement.status === 'in_progress' && achievement.progress < 100 && (
                        <div className="w-full bg-gray-700 h-2 rounded-full mb-2">
                          <div 
                            className="h-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400"
                            style={{ width: `${achievement.progress}%` }}
                          ></div>
                        </div>
                      )}

                      {/* XP Display */}
                      {achievement.status === 'completed' ? (
                        <div className="text-xs text-yellow-400 font-bold">+{achievement.xp} XP ✓</div>
                      ) : achievement.status === 'in_progress' ? (
                        <div className="text-xs text-orange-400 font-bold">{achievement.progress}% Complete</div>
                      ) : (
                        <div className="text-xs text-gray-500">+{achievement.xp} XP 🔒</div>
                      )}

                      {/* Category Tag */}
                      <div className={`text-xs mt-2 px-2 py-1 rounded-full ${
                        achievement.category === 'membership' ? 'bg-blue-900/50 text-blue-200' :
                        achievement.category === 'engagement' ? 'bg-green-900/50 text-green-200' :
                        achievement.category === 'pzone' ? 'bg-purple-900/50 text-purple-200' :
                        achievement.category === 'nsbe' ? 'bg-red-900/50 text-red-200' :
                        'bg-yellow-900/50 text-yellow-200'
                      }`}>
                        {achievement.category.charAt(0).toUpperCase() + achievement.category.slice(1)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* NSBE Mentoring Section*/} 
          {activeFilter === 'nsbe' && (
            <div className="space-y-6 sm:space-y-8">
              <StyledSection theme="gold" className="p-4 sm:p-6" style={{
                clipPath: 'polygon(15px 0%, 100% 0%, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0% 100%, 0% 15px)',
                border: '2px solid #ffed4e',
                color: '#fff'
              }}>
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-center text-white">🎯 NSBE UofM Mentorship Program 2025</h3>
                <p className="text-xs sm:text-sm mb-3 sm:mb-4 text-white">
            The NSBE UofM Mentorship Program empowers students through intentional, community-driven relationships 
            that promote academic excellence, professional growth, and a strong cultural foundation.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-black/20 rounded">
              <strong className="text-yellow-300">🔥 Mentorship Benefits:</strong>
              <ul className="text-xs sm:text-sm mt-2 space-y-1 text-white">
                <li>• 1-on-1 career guidance</li>
                <li>• Industry connections</li>
                <li>• Personal development</li>
                <li>• Academic support</li>
              </ul>
            </div>
            <div className="p-2 sm:p-3 bg-black/20 rounded">
              <strong className="text-yellow-300">🎯 Program Structure:</strong>
              <ul className="text-xs sm:text-sm mt-2 space-y-1 text-white">
                <li>• Monthly mentor meetings</li>
                <li>• Group activities</li>
                <li>• Professional workshops</li>
                <li>• Networking events</li>
              </ul>
            </div>
                </div>
                <a 
            href="https://docs.google.com/forms/d/e/1FAIpQLSc0oAEFKY8soIdmfZRztUfULO7n8hKvmSGZpXm4xQr_L_pkyQ/viewform" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full block p-2 sm:p-3 text-center font-bold bg-gradient-to-r from-red-600 to-red-700 text-white transition-all duration-300 hover:from-red-700 hover:to-red-800 text-xs sm:text-sm"
                >
            🔥 Sign Up for Mentorship Program
                </a>
              </StyledSection>
            </div>
          )}

          {/* Professional Dev Section */}
        {activeFilter === 'pzone' && (
          <StyledSection theme="blue" className="p-4 sm:p-6" style={{
            clipPath: 'polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)',
            border: '2px solid #0ea5e9'
          }}>
            <h3 className="text-lg sm:text-xl font-bold text-sky-200 mb-3 sm:mb-4 text-center">🚀 PROFESSIONAL DEVELOPMENT</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <h4 className="text-base sm:text-lg font-bold text-yellow-300 mb-2 sm:mb-3">📝 Resume Resources</h4>
                <div className="space-y-2">
                  <a href="https://careercenter.umich.edu/article/resume-resources" target="_blank" className="block p-2 text-xs sm:text-sm text-sky-100 hover:text-sky-200 border border-sky-600 transition-colors rounded">
                    📄 Career Center Resources
                  </a>
                  <a href="https://career.engin.umich.edu/resumes-cvs-cover-letters/" target="_blank" className="block p-2 text-xs sm:text-sm text-sky-100 hover:text-sky-200 border border-sky-600 transition-colors rounded">
                    🔧 ECRC Resume Guide
                  </a>
                </div>
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-bold text-yellow-300 mb-2 sm:mb-3">🎯 Internship Prep</h4>
                <div className="space-y-2">
                   <a href="https://docs.google.com/spreadsheets/d/1MTxHzpXYLvEsUvbZDw6YH8CoI-xZo4JrflNCy1vWkRc/edit?gid=2125915776#gid=2125915776" target="_blank" className="block p-2 text-xs sm:text-sm text-sky-100 hover:text-sky-200 border border-sky-600 transition-colors rounded">
                    📄 Internship List
                  </a>
                   <a href="https://docs.google.com/spreadsheets/d/1MTxHzpXYLvEsUvbZDw6YH8CoI-xZo4JrflNCy1vWkRc/edit?gid=2125915776#gid=2125915776" target="_blank" className="block p-2 text-xs sm:text-sm text-sky-100 hover:text-sky-200 border border-sky-600 transition-colors rounded">
                    📄 Scholarship List
                  </a>
                </div>
              </div>
            </div>
          </StyledSection>
        )}

        {/* Academic Corner */}
        {activeFilter === 'academic' && (
          <StyledSection theme="red" className="p-4 sm:p-6" style={{
            clipPath: 'polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)',
            border: '2px solid #ef4444'
          }}>
            <h3 className="text-lg sm:text-xl font-bold text-red-200 mb-3 sm:mb-4 text-center">📚 ACADEMIC EXCELLENCE CORNER</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              <div className="p-3 sm:p-4 bg-red-900/50 border border-red-400">
                <div className="text-yellow-300 font-bold mb-2 text-sm sm:text-base">🌟 Current Recognition</div>
                <div className="text-red-100 text-xs sm:text-sm">"Study Star" - Top 10% GPA in your cohort</div>
              </div>
              <div className="p-3 sm:p-4 bg-red-900/50 border border-red-400">
                <div className="text-yellow-300 font-bold mb-2 text-sm sm:text-base">💡 Tip of the Week</div>
                <div className="text-red-100 text-xs sm:text-sm">Schedule study sessions during peak focus hours (9-11 AM)</div>
              </div>
              <div className="p-3 sm:p-4 bg-red-900/50 border border-red-400">
                <button className="w-full p-2 sm:p-3 bg-red-400/30 text-red-100 hover:bg-red-400/40 transition-all font-bold text-xs sm:text-sm">
                  📖 Access Study Resources
                </button>
              </div>
            </div>
          </StyledSection>
        )}
      </div>
    </div>
  );
}

// Expose globally so main App can render it
window.MentorshipHub = MentorshipHub;