// Full-featured MentorshipHub component with badge tracking
const { useState, useEffect } = React;

function MentorshipHub({ onBackClick, userData, eventData, localDataManager }) {
  const [activeFilter, setActiveFilter] = useState('badges');
  const [searchQuery, setSearchQuery] = useState('');
  const [memberBadges, setMemberBadges] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate badge progress for a member
  const calculateMemberBadgeProgress = (memberStats) => {
    if (!memberStats || !window.TRACKABLE_BADGES_CONFIG) return [];
    
    return window.TRACKABLE_BADGES_CONFIG.map(badge => {
      let earned = false;
      let progress = 0;
      let progressText = '';
      let requirementText = '';

      switch (badge.type) {
        case 'status':
          if (badge.requirement === 'paid_status') {
            earned = memberStats.paid_member === 'Yes';
            progressText = earned ? 'Paid Member' : 'Not paid member';
            requirementText = 'Must be a paid NSBE member';
            progress = earned ? 1 : 0;
          }
          break;
        
        case 'count':
          const currentCount = memberStats[badge.requirement.field] || 0;
          const targetCount = badge.requirement.value;
          earned = currentCount >= targetCount;
          progress = Math.min(currentCount / targetCount, 1);
          progressText = `${currentCount}/${targetCount} events`;
          requirementText = `Attend ${targetCount} ${badge.requirement.field.replace('_', ' ')} event${targetCount > 1 ? 's' : ''}`;
          break;
        
        case 'variety':
          // Count different event categories attended
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
          progressText = `${uniqueCategories}/${targetCategories} event types`;
          requirementText = `Attend ${targetCategories} different types of events`;
          break;
      }

      return {
        ...badge,
        earned,
        progress,
        progressText,
        requirementText
      };
    });
  };

  // Handle member lookup
  const handleMemberSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      // Use the global getMemberStats function from LocalDataManager
      const memberStats = await window.getMemberStats(searchQuery.trim());
      if (memberStats) {
        const badges = calculateMemberBadgeProgress(memberStats);
        setMemberBadges({ member: memberStats.member, badges, stats: memberStats });
      } else {
        setMemberBadges({ member: searchQuery, badges: [], stats: null, notFound: true });
      }
    } catch (error) {
      console.error('Error looking up member:', error);
      setMemberBadges({ member: searchQuery, badges: [], stats: null, notFound: true });
    } finally {
      setIsLoading(false);
    }
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

        {/* Filter Navigation */}
        <div className="mb-6 sm:mb-8 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {[
            { id: 'badges', label: 'Badge Tracker', icon: '🏆', color: 'orange' },
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

        {/* BADGE TRACKER SECTION */}
        {activeFilter === 'badges' && (
          <div className="space-y-8">
            {/* Badge Lookup */}
            <StyledSection theme="orange" className="p-6">
              <h3 className="text-xl font-bold text-orange-200 mb-4 text-center">🏆 Badge Progress Tracker</h3>
              <div className="max-w-md mx-auto mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter your uniqname..."
                    className="flex-1 p-3 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400"
                    onKeyPress={(e) => e.key === 'Enter' && handleMemberSearch()}
                  />
                  <button
                    onClick={handleMemberSearch}
                    disabled={isLoading}
                    className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded transition-colors disabled:opacity-50"
                  >
                    {isLoading ? '...' : 'Search'}
                  </button>
                </div>
              </div>

              {/* Badge Results */}
              {memberBadges && (
                <div className="mt-6">
                  {memberBadges.notFound ? (
                    <div className="text-center p-6 bg-red-900/30 border border-red-500 rounded">
                      <div className="text-red-300">Member "{memberBadges.member}" not found in the system.</div>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-lg font-bold text-orange-200 mb-4 text-center">
                        Badge Progress for {memberBadges.member}
                      </h4>
                      
                      {/* Progress Summary */}
                      <div className="mb-6 p-4 bg-gradient-to-r from-orange-900/30 to-yellow-900/30 border border-orange-400/50 rounded-lg">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-green-400">
                              {memberBadges.badges.filter(b => b.earned).length}
                            </div>
                            <div className="text-xs text-gray-300">Completed</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-blue-400">
                              {memberBadges.badges.filter(b => !b.earned && b.progress > 0).length}
                            </div>
                            <div className="text-xs text-gray-300">In Progress</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-gray-400">
                              {memberBadges.badges.filter(b => b.progress === 0).length}
                            </div>
                            <div className="text-xs text-gray-300">Not Started</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-yellow-400">
                              {memberBadges.badges.filter(b => b.earned).reduce((sum, b) => sum + (b.xp || 0), 0)}
                            </div>
                            <div className="text-xs text-gray-300">Total XP Earned</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {memberBadges.badges.map((badge, index) => (
                          <div
                            key={badge.id}
                            className={`relative p-6 border-2 transition-all duration-500 hover:scale-105 ${
                              badge.earned 
                                ? 'bg-gradient-to-br from-yellow-900/50 to-orange-900/50 border-yellow-400 animate-pulse' 
                                : badge.progress > 0
                                ? 'bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border-blue-400'
                                : 'bg-gradient-to-br from-gray-900/40 to-gray-800/40 border-gray-600'
                            }`}
                            style={{
                              boxShadow: badge.earned 
                                ? `0 0 30px ${badge.glow}, inset 0 0 20px rgba(255,255,255,0.15)` 
                                : badge.progress > 0
                                ? `0 0 15px rgba(59, 130, 246, 0.3), inset 0 0 10px rgba(255,255,255,0.05)`
                                : 'none',
                              animation: badge.earned ? 'pulse 2s infinite' : 'none'
                            }}
                          >
                            {/* Badge shine effect */}
                            {badge.earned && (
                              <div 
                                className="absolute inset-0 opacity-40 pointer-events-none animate-pulse"
                                style={{
                                  background: `linear-gradient(135deg, transparent 0%, ${badge.color}60 50%, transparent 100%)`
                                }}
                              />
                            )}
                            
                            {/* Progress shine effect for in-progress badges */}
                            {!badge.earned && badge.progress > 0 && (
                              <div 
                                className="absolute inset-0 opacity-20 pointer-events-none"
                                style={{
                                  background: `linear-gradient(135deg, transparent 0%, #3b82f640 50%, transparent 100%)`
                                }}
                              />
                            )}
                            
                            <div className="text-center mb-3 relative z-10">
                              <div className="text-3xl mb-2 transition-all duration-300" style={{
                                filter: badge.earned 
                                  ? 'drop-shadow(0 0 12px rgba(255,215,0,0.9))' 
                                  : badge.progress > 0 
                                  ? 'drop-shadow(0 0 6px rgba(59,130,246,0.6))' 
                                  : 'grayscale(1) brightness(0.6)'
                              }}>
                                {badge.icon}
                              </div>
                              <div className={`font-bold text-sm transition-all duration-300 ${
                                badge.earned 
                                  ? 'text-yellow-200' 
                                  : badge.progress > 0 
                                  ? 'text-blue-200' 
                                  : 'text-gray-400'
                              }`}
                                   style={{
                                     textShadow: badge.earned 
                                       ? '0 0 12px rgba(255,215,0,0.6)' 
                                       : badge.progress > 0 
                                       ? '0 0 8px rgba(59,130,246,0.4)' 
                                       : 'none',
                                     fontFamily: 'Orbitron, monospace'
                                   }}>
                                {badge.name}
                              </div>
                            </div>
                            
                            <div className="text-xs text-gray-300 mb-3 text-center relative z-10">
                              {badge.desc}
                            </div>
                            
                            <div className="text-xs relative z-10">
                              {/* Status Indicator */}
                              <div className={`font-semibold text-center mb-2 ${
                                badge.earned ? 'text-green-400' : badge.progress > 0 ? 'text-blue-400' : 'text-gray-400'
                              }`}>
                                {badge.earned ? (
                                  <div className="flex items-center justify-center gap-1">
                                    <span>✅ COMPLETED</span>
                                    <span className="text-yellow-400 font-bold">+{badge.xp} XP</span>
                                  </div>
                                ) : badge.progress > 0 ? (
                                  <div className="flex items-center justify-center gap-1">
                                    <span>🔄 IN PROGRESS</span>
                                    <span className="text-gray-300">({badge.progressText})</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center gap-1">
                                    <span>⏳ NOT STARTED</span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Progress Bar */}
                              {!badge.earned && badge.progress !== undefined && (
                                <div className="w-full bg-gray-700 rounded-full h-3 mb-2 overflow-hidden">
                                  <div 
                                    className="h-3 rounded-full transition-all duration-500 ease-out"
                                    style={{ 
                                      width: `${badge.progress * 100}%`,
                                      background: badge.progress > 0 
                                        ? 'linear-gradient(90deg, #3b82f6, #06b6d4)' 
                                        : 'transparent'
                                    }}
                                  />
                                  {/* Progress percentage */}
                                  <div className="text-center text-xs text-gray-400 mt-1">
                                    {Math.round(badge.progress * 100)}% Complete
                                  </div>
                                </div>
                              )}
                              
                              {/* Requirements hint for not started badges */}
                              {!badge.earned && badge.progress === 0 && (
                                <div className="text-center text-xs text-gray-500 mt-1">
                                  Need: {badge.requirementText || badge.progressText}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}


            </StyledSection>
          </div>
        )}

        {/* NSBE MENTORING SECTION */}
        {activeFilter === 'nsbe' && (
          <div className="space-y-8">
            <StyledSection theme="red" className="p-6">
              <h3 className="text-xl font-bold text-red-200 mb-4 text-center">🔥 NSBE MENTORING PROGRAM - FALL 2025</h3>
              
              {/* Program Status */}
              <div className="mb-8 text-center">
                <div className="inline-block p-4 bg-green-900/40 border-2 border-green-400 rounded-lg">
                  <div className="text-green-300 font-bold text-lg mb-2">✅ MENTORSHIP PAIRINGS COMPLETE</div>
                  <div className="text-green-100 text-sm">
                    Applications are now closed. All mentees have been successfully paired with their mentors!
                  </div>
                </div>
              </div>

              {/* Mentorship Pairs */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-red-300 mb-6 text-center">👥 MENTORSHIP PAIRINGS - FALL 2025</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {[
                    { mentee: "Aaron Hall", mentor: "Morgan Allen", menteeUniq: "aphall", mentorUniq: "morghan", menteeMajor: "BME", mentorMajor: "BME", interests: "BlueLab, electric bike, engineering projects" },
                    { mentee: "Jonathan Bishaw", mentor: "Jaleel Drones", menteeUniq: "jjbishaw", mentorUniq: "jdronesa", menteeMajor: "CS (CoE)", mentorMajor: "CS (LSA)", interests: "Both CS; ColorStack; tech-focused orgs" },
                    { mentee: "Rayan Kamdem", mentor: "Jaleel Drones", menteeUniq: "rayankdm", mentorUniq: "jdronesa", menteeMajor: "CS", mentorMajor: "CS (LSA)", interests: "ColorStack; business/tech orgs; Hackers/KTP" },
                    { mentee: "Jadon Oliver", mentor: "Desola Fujah", menteeUniq: "jadono", mentorUniq: "dfujah", menteeMajor: "CS", mentorMajor: "Computer Eng.", interests: "Rock climbing, walking; CSA involvement; strong CS/CE overlap" },
                    { mentee: "Savanna Evans", mentor: "Gianna Williams", menteeUniq: "savannae", mentorUniq: "giannaw", menteeMajor: "Robotics Eng.", mentorMajor: "Electrical Eng.", interests: "Engineering honor societies; diverse eng. pathways" },
                    { mentee: "Miraf Dinku", mentor: "Devin Maples", menteeUniq: "mdinku", mentorUniq: "devinmap", menteeMajor: "Chemical Eng.", mentorMajor: "Materials Sci", interests: "Running; ChemE/MatSci overlap; team projects" },
                    { mentee: "Zahra Kamara", mentor: "Ben Bradley", menteeUniq: "zkamara", mentorUniq: "bjbradl", menteeMajor: "Mechanical Eng.", mentorMajor: "MechE", interests: "MechE" },
                    { mentee: "Kaden Sanders", mentor: "Tiah Watt", menteeUniq: "kadensan", mentorUniq: "shantiah", menteeMajor: "CS (CoE)", mentorMajor: "Electrical Eng.", interests: "CoE foundation; shared sports/gym" },
                    { mentee: "Kaiden Davis", mentor: "Iman Ahmed", menteeUniq: "kaidend", mentorUniq: "imanahm", menteeMajor: "IOE", mentorMajor: "IOE", interests: "IOE coursework; STEM clubs; Shared Movie interests" },
                    { mentee: "Cameron Conner", mentor: "Mikko Hendricks", menteeUniq: "cconxav", mentorUniq: "mikkogbh", menteeMajor: "MechE", mentorMajor: "MechE", interests: "HEADS involvement; MechE foundation" },
                    { mentee: "James Willis", mentor: "Bruce Williams II", menteeUniq: "jamwill", mentorUniq: "Bwii", menteeMajor: "MechE", mentorMajor: "MechE", interests: "Gym interest; strong MechE alignment" },
                    { mentee: "Boyan Tiwang", mentor: "Choyce Jakes", menteeUniq: "btiwang", mentorUniq: "cjakes", menteeMajor: "Data Science", mentorMajor: "Info Science", interests: "Both computing-adjacent majors; gaming/music hobbies" },
                    { mentee: "Skylar Scott", mentor: "Adna Mohamed Saed", menteeUniq: "scskylar", mentorUniq: "adna", menteeMajor: "IOE", mentorMajor: "Civil Eng.", interests: "Michigan Natives; IOE/Civil overlap (shared electives)" }
                  ].map((pair, index) => (
                    <div key={index} className="p-4 bg-gradient-to-br from-red-900/40 to-orange-900/40 border border-red-400/60 rounded-lg hover:border-red-300 transition-all duration-300">
                      <div className="text-center mb-3">
                        <div className="text-yellow-300 font-bold text-lg mb-1">🤝 Pair #{index + 1}</div>
                      </div>
                      
                      <div className="space-y-3">
                        {/* Mentee */}
                        <div className="bg-blue-900/30 p-3 rounded border border-blue-400/50">
                          <div className="text-blue-200 font-semibold text-sm mb-1">👨‍🎓 MENTEE</div>
                          <div className="text-white font-bold">{pair.mentee}</div>
                          <div className="text-blue-100 text-xs">@{pair.menteeUniq} • {pair.menteeMajor}</div>
                        </div>
                        
                        {/* Mentor */}
                        <div className="bg-green-900/30 p-3 rounded border border-green-400/50">
                          <div className="text-green-200 font-semibold text-sm mb-1">👨‍🏫 MENTOR</div>
                          <div className="text-white font-bold">{pair.mentor}</div>
                          <div className="text-green-100 text-xs">@{pair.mentorUniq} • {pair.mentorMajor}</div>
                        </div>
                        
                        {/* Shared Interests */}
                        <div className="bg-purple-900/30 p-3 rounded border border-purple-400/50">
                          <div className="text-purple-200 font-semibold text-xs mb-1">🎯 SHARED INTERESTS</div>
                          <div className="text-purple-100 text-xs leading-relaxed">{pair.interests}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Program Information */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-red-300 mb-4">📋 Program Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-red-900/30 border border-red-400 rounded">
                    <div className="text-yellow-300 font-bold mb-2">📅 Program Timeline</div>
                    <div className="text-red-100 text-sm space-y-1">
                      <div>• Program Duration: Fall 2025 Semester</div>
                      <div>• Monthly Check-ins Required</div>
                      <div>• Mid-semester Progress Review</div>
                      <div>• End-of-semester Feedback</div>
                    </div>
                  </div>
                  <div className="p-4 bg-red-900/30 border border-red-400 rounded">
                    <div className="text-yellow-300 font-bold mb-2">🎯 Program Goals</div>
                    <div className="text-red-100 text-sm space-y-1">
                      <div>• Academic Success Support</div>
                      <div>• Career Development Guidance</div>
                      <div>• Professional Network Building</div>
                      <div>• Personal Growth & Leadership</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upcoming Event Announcement */}
              <div>
                <h4 className="text-lg font-semibold text-red-300 mb-4">� Upcoming Event</h4>
                <div className="p-6 bg-gradient-to-r from-yellow-900/50 to-orange-900/50 border-2 border-yellow-400 rounded-lg animate-pulse">
                  <div className="text-center mb-4">
                    <div className="text-yellow-300 font-bold text-xl mb-2">🎉 MENTORSHIP MIXER</div>
                    <div className="text-white font-semibold text-lg">Tomorrow - October 1st, 2025</div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="bg-red-900/40 p-3 rounded border border-red-400/60">
                      <div className="text-red-200 font-semibold text-sm mb-1">⏰ TIME</div>
                      <div className="text-white font-bold">6:00 - 7:30 PM</div>
                    </div>
                    <div className="bg-blue-900/40 p-3 rounded border border-blue-400/60">
                      <div className="text-blue-200 font-semibold text-sm mb-1">📍 LOCATION</div>
                      <div className="text-white font-bold">Mason Hall 1448</div>
                    </div>
                    <div className="bg-purple-900/40 p-3 rounded border border-purple-400/60">
                      <div className="text-purple-200 font-semibold text-sm mb-1">🎯 EVENT</div>
                      <div className="text-white font-bold">Estimathon</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-center">
                    <div className="text-yellow-200 text-sm mb-2">
                      Meet your mentor/mentee pairs and participate in fun estimation challenges!
                    </div>
                    <div className="text-white font-semibold bg-gradient-to-r from-red-600 to-orange-600 px-4 py-2 rounded inline-block">
                      🔥 All Mentorship Pairs Welcome! 🔥
                    </div>
                  </div>
                </div>
              </div>
            </StyledSection>
          </div>
        )}

        {/* P-ZONE PROFESSIONAL DEVELOPMENT */}
        {activeFilter === 'pzone' && (
          <div className="space-y-8">
            <StyledSection theme="blue" className="p-6">
              <h3 className="text-xl font-bold text-blue-200 mb-4 text-center">🚀 P-ZONE: PROFESSIONAL DEVELOPMENT</h3>
              
              {/* Career Services */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-blue-300 mb-4">💼 Career Services</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-blue-900/30 border border-blue-400 rounded">
                    <div className="text-yellow-300 font-bold mb-2">📄 Resume & Portfolio</div>
                    <div className="text-blue-100 text-sm mb-3">
                      Professional resume reviews, portfolio development, and LinkedIn optimization
                    </div>
                    <a href="https://docs.google.com/forms/d/e/1FAIpQLSfQgLB--SZ40hznFcCxUTUbAyz_dWQB4klCIvaZDPD29ibnLg/viewform" target="_blank"
                       className="text-yellow-400 hover:text-yellow-300 text-sm underline">
                      Submit to Resume Book →
                    </a>
                  </div>
                  <div className="p-4 bg-blue-900/30 border border-blue-400 rounded">
                    <div className="text-yellow-300 font-bold mb-2">🎤 Interview Prep</div>
                    <div className="text-blue-100 text-sm mb-3">
                      Mock interviews, technical interview practice, and behavioral interview training
                    </div>
                    <div className="text-gray-400 text-sm">Available during PD events</div>
                  </div>
                </div>
              </div>

              {/* Conferences & Events */}
              <div>
                <h4 className="text-lg font-semibold text-blue-300 mb-4">🏆 Conferences & Major Events</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-blue-900/30 border border-blue-400 rounded">
                    <div className="text-yellow-300 font-bold mb-2">🌟 NSBE Regional Conference</div>
                    <div className="text-blue-100 text-sm mb-3">
                      Annual regional conference with career fair, workshops, and networking
                    </div>
                    <a href="https://convention.nsbe.org/" target="_blank"
                       className="text-yellow-400 hover:text-yellow-300 text-sm underline">
                      Conference Information →
                    </a>
                  </div>
                  <div className="p-4 bg-blue-900/30 border border-blue-400 rounded">
                    <div className="text-yellow-300 font-bold mb-2">🏅 National Convention</div>
                    <div className="text-blue-100 text-sm mb-3">
                      The largest career fair for Black engineers in the world
                    </div>
                    <a href="https://convention.nsbe.org/" target="_blank"
                       className="text-yellow-400 hover:text-yellow-300 text-sm underline">
                      Learn More →
                    </a>
                  </div>
                </div>
              </div>
            </StyledSection>
          </div>
        )}

        {/* ACADEMIC CORNER */}
        {activeFilter === 'academic' && (
          <div className="space-y-8">
            <StyledSection theme="purple" className="p-6">
              <h3 className="text-xl font-bold text-purple-200 mb-4 text-center">📚 ACADEMIC EXCELLENCE CORNER</h3>
              
              {/* Study Resources */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-purple-300 mb-4">📖 Study Resources</h4>
                <div className="p-4 bg-purple-900/30 border border-purple-400 rounded">
                  <div className="text-yellow-300 font-bold mb-2">🧠 Wisdom Document</div>
                  <div className="text-purple-100 text-sm mb-3">
                    Comprehensive study guide with course resources, tips, and strategies from successful students
                  </div>
                  <a href="https://docs.google.com/spreadsheets/d/1QgiEN9uvriVSFjM0cr66UQFiCq2w08Qfmijlx4yfs6Q/edit?gid=0#gid=0" target="_blank"
                     className="text-yellow-400 hover:text-yellow-300 text-sm underline">
                    Access Wisdom Doc →
                  </a>
                </div>
              </div>

              {/* Academic Tips */}
              <div>
                <h4 className="text-lg font-semibold text-purple-300 mb-4">💡 Academic Success Tips</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-purple-900/30 border border-purple-400 rounded">
                    <div className="text-yellow-300 font-bold mb-2">⏰ Time Management</div>
                    <div className="text-purple-100 text-xs">
                      • Schedule study sessions during peak focus hours (9-11 AM)<br/>
                      • Use Pomodoro technique for difficult subjects<br/>
                      • Block schedule for deep work
                    </div>
                  </div>
                  <div className="p-4 bg-purple-900/30 border border-purple-400 rounded">
                    <div className="text-yellow-300 font-bold mb-2">📝 Study Techniques</div>
                    <div className="text-purple-100 text-xs">
                      • Active recall over passive reading<br/>
                      • Practice problems daily<br/>
                      • Form study groups with peers
                    </div>
                  </div>
                  <div className="p-4 bg-purple-900/30 border border-purple-400 rounded">
                    <div className="text-yellow-300 font-bold mb-2">🎯 Exam Prep</div>
                    <div className="text-purple-100 text-xs">
                      • Start reviewing 1 week before<br/>
                      • Use past exams for practice<br/>
                      • Join pre-exam study sessions
                    </div>
                  </div>
                </div>
              </div>
            </StyledSection>
          </div>
        )}
      </div>
    </div>
  );
}

// Expose globally so main App can render it
window.MentorshipHub = MentorshipHub;
