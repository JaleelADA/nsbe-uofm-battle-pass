// Standalone MentorshipHub component (was mixed into app-optimized previously)
const { useState } = React;
function MentorshipHub({ onBackClick, userData, eventData }) {
  const [activeFilter, setActiveFilter] = useState('all');

  // Calculate achievements based on user data and attendance
  const calculateAchievements = (userData, eventData) => {
    // Default achievements when no user data is available
    const defaultAchievements = [
      { name: 'Resume Workshop', status: 'locked', icon: '📝', color: '#6b7280', glow: 'rgba(75, 85, 99, 0.3)', desc: 'Attend PD Workshop (0/1)', xp: 25, category: 'pzone', requirement: 1, current: 0 },
      { name: 'Brand Revamp', status: 'locked', icon: '💼', color: '#6b7280', glow: 'rgba(75, 85, 99, 0.3)', desc: 'Attend 2+ PD Events (0/2)', xp: 20, category: 'pzone', requirement: 2, current: 0 },
      { name: 'Resume Reviewed', status: 'locked', icon: '✅', color: '#6b7280', glow: 'rgba(75, 85, 99, 0.3)', desc: 'Submit Resume (0/1)', xp: 10, category: 'pzone', requirement: 1, current: 0 },
      { name: 'Pod Meeting', status: 'locked', icon: '👥', color: '#6b7280', glow: 'rgba(75, 85, 99, 0.3)', desc: 'Join Pod Meeting (0/1)', xp: 15, category: 'nsbe', requirement: 1, current: 0 },
      { name: 'Study Jam', status: 'locked', icon: '📚', color: '#6b7280', glow: 'rgba(75, 85, 99, 0.3)', desc: 'Academic Session (0/1)', xp: 20, category: 'academic', requirement: 1, current: 0 },
      { name: 'GPA ≥ 3.0', status: 'locked', icon: '🎯', color: '#6b7280', glow: 'rgba(75, 85, 99, 0.3)', desc: 'Academic Excellence (0/100 XP)', xp: 40, category: 'academic', requirement: 100, current: 0 },
      { name: 'Career Mixer', status: 'locked', icon: '🎤', color: '#6b7280', glow: 'rgba(75, 85, 99, 0.3)', desc: 'Interview Ready (0/4)', xp: 35, category: 'pzone', requirement: 4, current: 0 },
      { name: '1-on-1 Mentorship', status: 'locked', icon: '🔥', color: '#6b7280', glow: 'rgba(75, 85, 99, 0.3)', desc: 'Mentorship Master (0/3)', xp: 50, category: 'nsbe', requirement: 3, current: 0 }
    ];

    if (!userData) return defaultAchievements;

    // Count different types of events attended
    const pdEvents = eventData?.filter(event => 
      event.type?.toLowerCase().includes('professional') || 
      event.type?.toLowerCase().includes('workshop') ||
      event.type?.toLowerCase().includes('resume') ||
      event.type?.toLowerCase().includes('interview')
    ).length || 0;

    const mentorshipEvents = eventData?.filter(event => 
      event.type?.toLowerCase().includes('mentorship') || 
      event.type?.toLowerCase().includes('pod') ||
      event.type?.toLowerCase().includes('mentor')
    ).length || 0;

    const academicEvents = eventData?.filter(event => 
      event.type?.toLowerCase().includes('study') || 
      event.type?.toLowerCase().includes('academic') ||
      event.type?.toLowerCase().includes('gpa')
    ).length || 0;

    return defaultAchievements.map(achievement => {
      let current = 0;
      let status = 'locked';
      let color = '#6b7280';
      let glow = 'rgba(75, 85, 99, 0.3)';

      if (achievement.category === 'pzone') {
        current = pdEvents;
      } else if (achievement.category === 'nsbe') {
        current = mentorshipEvents;
      } else if (achievement.category === 'academic') {
        current = academicEvents;
      }

      if (current >= achievement.requirement) {
        status = 'completed';
        color = '#22c55e';
        glow = 'rgba(34, 197, 94, 0.5)';
      }

      return {
        ...achievement,
        current,
        status,
        color,
        glow,
        desc: achievement.desc.replace(/\(\d+\/\d+\)/, `(${current}/${achievement.requirement})`)
      };
    });
  };

  // Calculate dynamic achievements based on current user data
  const achievements = calculateAchievements(userData, eventData);
  
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
            {/* Achievement Badges */}
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-400 mb-4 text-center">🏅 ACHIEVEMENT BADGES</h2>
              <div className="text-center mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-900/30 border border-blue-500/50 rounded-lg">
                <p className="text-blue-200 text-xs sm:text-sm">
                  🔗 <strong>Live Progress Tracking:</strong> Your achievements update automatically based on event attendance and XP earned. 
                  Complete more PD workshops, mentorship sessions, and academic activities to unlock new badges!
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className={`p-3 sm:p-4 text-center transition-all cursor-pointer hover:scale-105 ${
                      achievement.status === 'completed' ? 'opacity-100' : 'opacity-60'
                    }`}
                    style={{
                      background: achievement.status === 'completed' 
                        ? 'linear-gradient(135deg, #1e293b, #334155)' 
                        : 'linear-gradient(135deg, #374151, #4b5563)',
                      clipPath: 'polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)',
                      border: `2px solid ${achievement.color}`,
                      boxShadow: achievement.status === 'completed' ? `0 0 20px ${achievement.glow}` : 'none'
                    }}
                  >
                    <div className="text-2xl sm:text-3xl mb-2">{achievement.icon}</div>
                    <div className="text-xs font-bold text-white mb-1">{achievement.name}</div>
                    <div className="text-xs text-gray-300 mb-2">{achievement.desc}</div>
                    {achievement.status === 'completed' ? (
                      <div className="text-xs text-yellow-400 font-bold">+{achievement.xp} XP ✓</div>
                    ) : (
                      <div className="text-xs text-gray-500">+{achievement.xp} XP 🔒</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
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