const { useState, useEffect } = React;

// Google Sheets integration
const SHEET_ID = '1EkyzaNjTQ-5sKvqex5SnTTJ6SCdq-WYIJ_Y_wU34JIU';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit#gid=0`;

// Helper function to check sheet accessibility
async function checkSheetAccess() {
  try {
    const response = await fetch(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Leaderboard`);
    return response.ok;
  } catch (error) {
    console.error('Sheet access check failed:', error);
    return false;
  }
}

// Alternative fetch method using CSV export (more reliable)
async function fetchLeaderboardCSV() {
  try {
    const response = await fetch(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`);
    const csvText = await response.text();
    
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',');
    
    return lines.slice(1).map((line, index) => {
      const values = line.split(',');
      return {
        rank: index + 1,
        name: values[0]?.replace(/"/g, '') || 'Unknown',
        score: parseInt(values[1]) || 0,
        tier: values[2]?.replace(/"/g, '') || 'Participant'
      };
    }).filter(item => item.name && item.name !== 'Unknown')
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  } catch (error) {
    console.error('CSV fetch failed:', error);
    throw error;
  }
}

function BattlePassHeader({ userLevel = null, userXP = null, maxXP = 6000, userName = '', onNameChange, hasUserData = false }) {
  const progress = hasUserData && userXP ? (userXP / maxXP) * 100 : 0;
  
  return (
    <div className="relative p-8 mb-8" style={{
      background: 'linear-gradient(135deg, #0a0f1c 0%, #1a1f2e 50%, #0a0f1c 100%)',
      clipPath: 'polygon(60px 0%, 100% 0%, 100% calc(100% - 60px), calc(100% - 60px) 100%, 0% 100%, 0% 60px)',
      border: '3px solid #FFD700',
      boxShadow: '0 0 30px rgba(255, 215, 0, 0.4), inset 0 0 50px rgba(255, 215, 0, 0.1)'
    }}>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-8">
          {/* NSBE Torch Logo */}
          <div className="relative">
            <div className="w-24 h-28 flex items-center justify-center relative" style={{
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              clipPath: 'polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)',
              boxShadow: '0 0 25px rgba(255, 215, 0, 0.6)'
            }}>
              {/* Inner design */}
              <div className="w-16 h-20 flex items-center justify-center relative" style={{
                background: 'linear-gradient(135deg, #0a0f1c, #1a1f2e)',
                clipPath: 'polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)',
                border: '2px solid #FFD700'
              }}>
                <div className="text-2xl">🔥</div>
              </div>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-6 mb-6">
              <h1 className="text-6xl font-black tracking-wider" style={{
                fontFamily: 'Orbitron, monospace',
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 30px rgba(255, 215, 0, 0.8)',
                letterSpacing: '0.15em'
              }}>NSBE</h1>
              <h2 className="text-4xl font-bold text-yellow-400" style={{
                fontFamily: 'Orbitron, monospace',
                letterSpacing: '0.1em'
              }}>UofM BATTLE PASS</h2>
            </div>
            
            {/* Name Input */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Enter your name to see your XP"
                value={userName}
                onChange={(e) => onNameChange(e.target.value)}
                className="bg-gray-900/90 border-2 border-yellow-400/60 px-4 py-3 text-yellow-100 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 transition-all duration-300"
                style={{ 
                  width: '380px',
                  fontFamily: 'Orbitron, monospace',
                  clipPath: 'polygon(15px 0%, 100% 0%, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0% 100%, 0% 15px)',
                  boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)'
                }}
              />
            </div>
            
            {/* Progress Bar - only show when user has data */}
            {hasUserData && (
              <div className="w-[400px] bg-gray-900 h-8 relative" style={{
                border: '3px solid #FFD700',
                clipPath: 'polygon(15px 0%, 100% 0%, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0% 100%, 0% 15px)',
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
          <div className="text-right">
            <div className="text-9xl font-black" style={{
              fontFamily: 'Orbitron, monospace',
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 40px rgba(255, 215, 0, 0.8)'
            }}>{userLevel}</div>
            <div className="text-xl text-yellow-300 font-bold" style={{
              fontFamily: 'Orbitron, monospace'
            }}>
              {userXP}/{maxXP} XP
            </div>
            {userName && (
              <div className="text-yellow-400 font-bold mt-3 text-lg" style={{
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
  return (
    <nav className="skip-nav fixed top-0 left-0 z-50">
      <a href="#tier-section" className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-yellow-400 text-black px-4 py-2 font-bold" style={{
        clipPath: 'polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)'
      }}>
        Skip to Tiers
      </a>
      <a href="#leaderboard-section" className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-16 focus:left-4 bg-yellow-400 text-black px-4 py-2 font-bold" style={{
        clipPath: 'polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)'
      }}>
        Skip to Leaderboard
      </a>
      <a href="#events-section" className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-28 focus:left-4 bg-yellow-400 text-black px-4 py-2 font-bold" style={{
        clipPath: 'polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)'
      }}>
        Skip to Events
      </a>
    </nav>
  );
}

function DocumentationSection() {
  return (
    <div className="p-6 relative mb-8" style={{
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      clipPath: 'polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)',
      border: '2px solid #3b82f6',
      boxShadow: '0 0 20px rgba(59, 130, 246, 0.2)'
    }}>
      <h2 className="text-2xl font-black mb-4 tracking-wider" style={{
        background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontFamily: 'Orbitron, monospace'
      }}>📄 DOCUMENTATION</h2>
      <div className="space-y-3">
        <a 
          href="https://docs.google.com/document/d/1KNJ2CdsHd_fytD1nkW5MPc2LrK17E9LwsHBcc9r0ZXA/edit?usp=sharing" 
          target="_blank" 
          rel="noopener noreferrer"
          className="block p-3 text-cyan-100 hover:text-cyan-200 transition-colors duration-300 hover:bg-gray-800/50"
          style={{
            clipPath: 'polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)',
            border: '1px solid #374151'
          }}
        >
          Point System Overview
        </a>
        <a 
          href="https://docs.google.com/document/d/1Ss6W_MWxAeWA_UB8k2aZE67oa5kc4bTCWBI3B4Kvit8/edit?usp=sharing" 
          target="_blank" 
          rel="noopener noreferrer"
          className="block p-3 text-cyan-100 hover:text-cyan-200 transition-colors duration-300 hover:bg-gray-800/50"
          style={{
            clipPath: 'polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)',
            border: '1px solid #374151'
          }}
        >
          Battle Pass FAQs
        </a>
        <a 
          href="https://docs.google.com/document/d/1k3yd2x2q0Th0Wo3jQKbvrSCagguMuAmpKG2ARvOVqAg/edit?usp=sharing" 
          target="_blank" 
          rel="noopener noreferrer"
          className="block p-3 text-cyan-100 hover:text-cyan-200 transition-colors duration-300 hover:bg-gray-800/50"
          style={{
            clipPath: 'polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)',
            border: '1px solid #374151'
          }}
        >
          Battle Pass Guide
        </a>
      </div>
    </div>
  );
}

function UpcomingEventsSection() {
  const events = [
    {
      title: "Workshop: Resume + LinkedIn",
      date: "Jul 10",
      time: "6:00 PM",
      location: "Duderstadt Center, Rm 1200"
    },
    {
      title: "GBM: Mock Interview Night", 
      date: "Jul 14",
      time: "7:00 PM",
      location: "EECS Bldg, Rm 3110"
    },
    {
      title: "Networking Social",
      date: "Jul 18", 
      time: "5:30 PM",
      location: "North Quad Lounge"
    },
    {
      title: "Industry Panel",
      date: "Jul 22",
      time: "6:30 PM", 
      location: "NSBE Alumni career paths discussion"
    }
  ];

  return (
    <div id="events-section" className="p-6 relative" style={{
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      clipPath: 'polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)',
      border: '2px solid #ffd700',
      boxShadow: '0 0 20px rgba(255, 215, 0, 0.2)'
    }}>
      <h2 className="text-2xl font-black mb-4 tracking-wider" style={{
        background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontFamily: 'Orbitron, monospace'
      }}>📅 UPCOMING EVENTS</h2>
      
      <div className="space-y-4 mb-6">
        {events.map((event, index) => (
          <div key={index} className="p-3 bg-gray-800/50 border border-gray-600" style={{
            clipPath: 'polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)'
          }}>
            <div className="font-bold text-yellow-400">{event.date} – {event.title}</div>
            <div className="text-sm text-gray-300">{event.time} · {event.location}</div>
          </div>
        ))}
      </div>
      
      <a 
        href="https://tr.ee/kXIev9hrt3" 
        target="_blank" 
        rel="noopener noreferrer"
        className="block p-3 text-center font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300"
        style={{
          clipPath: 'polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)'
        }}
      >
        📅 Add the NSBEUM Calendar
      </a>
    </div>
  );
}

function AnnouncementsSection() {
  const announcements = [
    { title: "Pay NSBE Dues", url: "https://mynsbe.nsbe.org/s/joinprocess" },
    { title: "Conference Info", url: "https://convention.nsbe.org/" },
    { title: "Scholarship Opportunities", url: "https://nsbe.org/scholarships/" },
    { title: "Resume Book", url: "https://docs.google.com/forms/d/e/1FAIpQLSfsQfpp76QkK9HdEAi0DQJftrnV3r1Gv8PsLmIJlLHIQVYnKA/viewform" },
    { title: "Mentorship Sign-ups", url: "#" },
    { title: "Committee Applications", url: "#" },
    { title: "Collab with NSBEUM!", url: "#" }
  ];

  return (
    <div className="p-6 relative mb-8" style={{
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      clipPath: 'polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)',
      border: '2px solid #10b981',
      boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)'
    }}>
      <h2 className="text-2xl font-black mb-4 tracking-wider" style={{
        background: 'linear-gradient(135deg, #34d399, #10b981)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontFamily: 'Orbitron, monospace'
      }}>📣 ANNOUNCEMENTS</h2>
      
      <div className="space-y-3">
        {announcements.map((announcement, index) => (
          <a 
            key={index}
            href={announcement.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block p-3 text-emerald-100 hover:text-emerald-200 transition-colors duration-300 hover:bg-gray-800/50"
            style={{
              clipPath: 'polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)',
              border: '1px solid #374151'
            }}
          >
            {announcement.title}
          </a>
        ))}
      </div>
    </div>
  );
}

function ContactSection() {
  return (
    <div className="p-6 relative" style={{
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      clipPath: 'polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)',
      border: '2px solid #8b5cf6',
      boxShadow: '0 0 20px rgba(139, 92, 246, 0.2)'
    }}>
      <h2 className="text-2xl font-black mb-4 tracking-wider" style={{
        background: 'linear-gradient(135deg, #a78bfa, #8b5cf6)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontFamily: 'Orbitron, monospace'
      }}>📞 CONTACT US</h2>
      
      <div className="space-y-3">
        <div className="p-3 bg-gray-800/50 border border-gray-600" style={{
          clipPath: 'polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)'
        }}>
          <span className="text-gray-300">Email: </span>
          <a href="mailto:nsbe.membership@umich.edu" className="text-purple-300 hover:text-purple-200 transition-colors">
            nsbe.membership@umich.edu
          </a>
        </div>
        
        <div className="p-3 bg-gray-800/50 border border-gray-600" style={{
          clipPath: 'polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)'
        }}>
          <span className="text-gray-300">Instagram: </span>
          <a href="https://instagram.com/nsbeum" target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:text-purple-200 transition-colors">
            @nsbeum
          </a>
        </div>
        
        <div className="p-3 bg-gray-800/50 border border-gray-600" style={{
          clipPath: 'polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)'
        }}>
          <span className="text-gray-300">Linktree: </span>
          <a href="https://linktr.ee/nsbe_um" target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:text-purple-200 transition-colors">
            NSBE UMich
          </a>
        </div>
      </div>
    </div>
  );
}

function InfoSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('tiers');
  
  const menuItems = [
    { id: 'tiers', label: 'Tiers', icon: '🏆' },
    { id: 'points', label: 'Points', icon: '⚡' },
    { id: 'docs', label: 'Docs', icon: '📄' },
    { id: 'events', label: 'Events', icon: '📅' },
    { id: 'announcements', label: 'News', icon: '📣' },
    { id: 'contact', label: 'Contact', icon: '📞' }
  ];

  const renderContent = () => {
    switch(activeSection) {
      case 'tiers':
        return (
          <div className="p-6">
            <h3 className="text-2xl font-black mb-6 tracking-wider" style={{
              background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontFamily: 'Orbitron, monospace'
            }}>BATTLE PASS TIERS</h3>
            
            <div className="space-y-4">
              {[
                { tier: 'GOLD', range: 'Top 25%', desc: 'NSBE Elite! Priority Conference RSVP, GBM shoutouts.', bg: 'linear-gradient(135deg, #ffd700, #ffa500)', color: '#000', icon: '🥇' },
                { tier: 'SILVER', range: '25–50%', desc: 'Consistent contributors. Prize raffles, mentorship perks, Free NSBE Swag.', bg: 'linear-gradient(135deg, #c0c0c0, #a0a0a0)', color: '#000', icon: '🥈' },
                { tier: 'BRONZE', range: '50–75%', desc: 'Active participants. Early invites to NSBE events.', bg: 'linear-gradient(135deg, #cd7f32, #b8860b)', color: '#fff', icon: '🥉' },
                { tier: 'PARTICIPANT', range: 'Below 75%', desc: 'You\'re on the board! Keep showing up to level up.', bg: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: '#fff', icon: '🏅' }
              ].map((tier, index) => (
                <div key={index} className="p-4 text-sm" style={{
                  background: tier.bg,
                  clipPath: 'polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)',
                  color: tier.color
                }}>
                  <div className="font-bold text-base mb-2">{tier.icon} {tier.tier} – {tier.range}</div>
                  <div className="font-semibold leading-relaxed">{tier.desc}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'points':
        return (
          <div className="p-6">
            <h3 className="text-2xl font-black mb-6 tracking-wider" style={{
              background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontFamily: 'Orbitron, monospace'
            }}>POINT SYSTEM</h3>
            
            <div className="space-y-3">
              {[
                { activity: '📚 PD & Mentoring', points: '+10 pts' },
                { activity: '🎉 General Attendance', points: '+7 pts' },
                { activity: '🎯 P or M-Zone', points: '+5 pts' },
                { activity: '🏆 Convention', points: '+15 pts' },
                { activity: '👥 Referral', points: '+3 pts' }
              ].map((item, index) => (
                <div key={index} className="p-3 bg-gray-800/50 border border-gray-600 text-sm" style={{
                  clipPath: 'polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)'
                }}>
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold">{item.activity}</span>
                    <span className="text-yellow-400 font-bold text-base">{item.points}</span>
                  </div>
                </div>
              ))}
              
              <div className="p-4 mt-6 text-sm text-center" style={{
                background: 'linear-gradient(135deg, #ffd700, #ffa500)',
                clipPath: 'polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)',
                color: '#000'
              }}>
                <div className="font-bold text-base mb-1">⚡ SPECIAL BONUS</div>
                <div className="font-semibold">1.5× Multiplier After Volunteering</div>
              </div>
            </div>
          </div>
        );
        break;

      case 'docs':
        return (
          <div className="p-6">
            <h3 className="text-2xl font-black mb-6 tracking-wider" style={{
              background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontFamily: 'Orbitron, monospace'
            }}>� DOCUMENTATION</h3>
            <div className="space-y-3">
              <a href="https://docs.google.com/document/d/1KNJ2CdsHd_fytD1nkW5MPc2LrK17E9LwsHBcc9r0ZXA/edit?usp=sharing" target="_blank" rel="noopener noreferrer" className="block p-3 text-sm text-cyan-100 hover:text-cyan-200 transition-colors border border-gray-600 hover:bg-gray-800/30" style={{ clipPath: 'polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)' }}>Point System Overview</a>
              <a href="https://docs.google.com/document/d/1Ss6W_MWxAeWA_UB8k2aZE67oa5kc4bTCWBI3B4Kvit8/edit?usp=sharing" target="_blank" rel="noopener noreferrer" className="block p-3 text-sm text-cyan-100 hover:text-cyan-200 transition-colors border border-gray-600 hover:bg-gray-800/30" style={{ clipPath: 'polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)' }}>Battle Pass FAQs</a>
              <a href="https://docs.google.com/document/d/1k3yd2x2q0Th0Wo3jQKbvrSCagguMuAmpKG2ARvOVqAg/edit?usp=sharing" target="_blank" rel="noopener noreferrer" className="block p-3 text-sm text-cyan-100 hover:text-cyan-200 transition-colors border border-gray-600 hover:bg-gray-800/30" style={{ clipPath: 'polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)' }}>Battle Pass Guide</a>
            </div>
          </div>
        );
        break;

      case 'events':
        return (
          <div className="p-6">
            <h3 className="text-2xl font-black mb-6 tracking-wider" style={{
              background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontFamily: 'Orbitron, monospace'
            }}>📅 UPCOMING EVENTS</h3>
            <div className="space-y-4">
              {[
                { title: "Workshop: Resume + LinkedIn", date: "Jul 10", time: "6:00 PM", location: "Duderstadt Center, Rm 1200" },
                { title: "GBM: Mock Interview Night", date: "Jul 14", time: "7:00 PM", location: "EECS Bldg, Rm 3110" },
                { title: "Networking Social", date: "Jul 18", time: "5:30 PM", location: "North Quad Lounge" },
                { title: "Industry Panel", date: "Jul 22", time: "6:30 PM", location: "Alumni career paths discussion" }
              ].map((event, index) => (
                <div key={index} className="p-4 bg-gray-800/50 border border-gray-600" style={{ clipPath: 'polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)' }}>
                  <div className="font-bold text-yellow-400 mb-2 text-base">{event.date} – {event.title}</div>
                  <div className="text-gray-300 text-sm mb-1">{event.time}</div>
                  <div className="text-gray-400 text-sm">{event.location}</div>
                </div>
              ))}
              <a href="https://tr.ee/kXIev9hrt3" target="_blank" rel="noopener noreferrer" className="block p-4 text-base text-center font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:from-yellow-500 hover:to-yellow-700 transition-all" style={{ clipPath: 'polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)' }}>📅 Add the NSBEUM Calendar</a>
            </div>
          </div>
        );

      case 'announcements':
        return (
          <div className="p-6">
            <h3 className="text-2xl font-black mb-6 tracking-wider" style={{
              background: 'linear-gradient(135deg, #34d399, #10b981)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontFamily: 'Orbitron, monospace'
            }}>📣 ANNOUNCEMENTS</h3>
            <div className="space-y-3">
              {[
                { title: "Pay NSBE Dues", url: "https://mynsbe.nsbe.org/s/joinprocess" },
                { title: "Conference Info", url: "https://convention.nsbe.org/" },
                { title: "Scholarship Opportunities", url: "https://nsbe.org/scholarships/" },
                { title: "Resume Book", url: "https://docs.google.com/forms/d/e/1FAIpQLSfsQfpp76QkK9HdEAi0DQJftrnV3r1Gv8PsLmIJlLHIQVYnKA/viewform" },
                { title: "Mentorship Sign-ups", url: "#" },
                { title: "Committee Applications", url: "#" }
              ].map((announcement, index) => (
                <a key={index} href={announcement.url} target="_blank" rel="noopener noreferrer" className="block p-3 text-sm text-emerald-100 hover:text-emerald-200 transition-colors border border-gray-600 hover:bg-gray-800/30" style={{ clipPath: 'polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)' }}>{announcement.title}</a>
              ))}
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="p-6">
            <h3 className="text-2xl font-black mb-6 tracking-wider" style={{
              background: 'linear-gradient(135deg, #a78bfa, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontFamily: 'Orbitron, monospace'
            }}>📞 CONTACT US</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-800/50 border border-gray-600" style={{ clipPath: 'polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)' }}>
                <span className="text-gray-300 text-base font-semibold">Email: </span>
                <div className="mt-1">
                  <a href="mailto:nsbe.membership@umich.edu" className="text-purple-300 hover:text-purple-200 transition-colors text-sm break-all">nsbe.membership@umich.edu</a>
                </div>
              </div>
              <div className="p-4 bg-gray-800/50 border border-gray-600" style={{ clipPath: 'polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)' }}>
                <span className="text-gray-300 text-base font-semibold">Instagram: </span>
                <div className="mt-1">
                  <a href="https://instagram.com/nsbeum" target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:text-purple-200 transition-colors text-sm">@nsbeum</a>
                </div>
              </div>
              <div className="p-4 bg-gray-800/50 border border-gray-600" style={{ clipPath: 'polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)' }}>
                <span className="text-gray-300 text-base font-semibold">Linktree: </span>
                <div className="mt-1">
                  <a href="https://linktr.ee/nsbe_um" target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:text-purple-200 transition-colors text-sm">NSBE UMich</a>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 p-3 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold transition-all duration-300 shadow-lg"
        style={{
          clipPath: 'polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)'
        }}
      >
        {isOpen ? '✕' : '📋'} INFO
      </button>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-96 z-40 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'} overflow-y-auto`} style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        clipPath: 'polygon(20px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 20px)',
        border: '2px solid #4a5568',
        boxShadow: '0 0 20px rgba(255, 215, 0, 0.1)'
      }}>
        <div className="p-6 pt-20">
          {/* Menu Buttons */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mb-6">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`p-2 text-xs font-semibold transition-all duration-300 ${
                  activeSection === item.id 
                    ? 'bg-yellow-400/20 text-yellow-300 border-yellow-400' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/30 border-gray-600'
                } border`}
                style={{
                  clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)'
                }}
              >
                <div className="text-base mb-1">{item.icon}</div>
                <div className="text-xs">{item.label}</div>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="pt-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </>
  );
}

function BadgeSection() {
  const badges = [
    { name: 'PARTICIPANT', color: 'from-blue-500 to-blue-700', active: true, textColor: 'text-white', border: '#3b82f6' },
    { name: 'BRONZE', color: 'from-yellow-600 to-orange-700', active: true, textColor: 'text-white', border: '#d97706' },
    { name: 'SILVER', color: 'from-gray-300 to-gray-500', active: true, textColor: 'text-black', border: '#6b7280' },
    { name: 'GOLD', color: 'from-yellow-400 to-yellow-600', active: false, textColor: 'text-black', border: '#fbbf24' }
  ];

  return (
    <div className="flex space-x-6 mb-8">
      {badges.map((badge, index) => (
        <div key={index} className={`bg-gradient-to-br ${badge.color} ${
          badge.active ? 'opacity-100' : 'opacity-40'
        } p-6 text-center min-w-[140px] transform hover:scale-105 transition-all duration-300 relative`}
        style={{
          clipPath: 'polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)',
          border: `3px solid ${badge.active ? badge.border : '#4a5568'}`,
          boxShadow: badge.active ? `0 0 25px ${badge.border}40, inset 0 0 15px rgba(255,255,255,0.1)` : 'none'
        }}>
          {/* Inner glow effect */}
          {badge.active && (
            <div className="absolute inset-0" style={{
              background: `linear-gradient(135deg, transparent 0%, ${badge.border}20 50%, transparent 100%)`,
              clipPath: 'polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)'
            }}></div>
          )}
          <div className={`${badge.textColor} font-bold text-sm tracking-wider relative z-10`} style={{
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
    <div className="p-8 h-fit relative" style={{
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      clipPath: 'polygon(30px 0%, 100% 0%, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0% 100%, 0% 30px)',
      border: '2px solid #4a5568',
      boxShadow: '0 0 20px rgba(255, 215, 0, 0.1)'
    }}>
      <div className="text-center">
        <div className="w-24 h-24 mx-auto mb-6 relative" style={{
          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          clipPath: 'polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)',
          boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)'
        }}>
          <div className="absolute inset-2 flex items-center justify-center" style={{
            background: 'linear-gradient(135deg, #1a1f2e, #16213e)',
            clipPath: 'polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)'
          }}>
            <span className="text-3xl">👥</span>
          </div>
        </div>
        <h2 className="text-2xl font-black font-futuristic mb-4 tracking-wider" style={{
          background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>MENTORSHIP</h2>
        <div className="p-4 mb-4 relative" style={{
          background: 'rgba(55, 65, 81, 0.7)',
          clipPath: 'polygon(15px 0%, 100% 0%, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0% 100%, 0% 15px)',
          border: '1px solid #6b7280'
        }}>
          <div className="font-bold text-xl mb-2" style={{
            background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>ONE-ON-ONE</div>
        </div>
        <button
          onClick={onMentorshipClick}
          className="text-white text-lg font-semibold tracking-wide cursor-pointer hover:scale-105 transition-all duration-300 hover:text-yellow-400 hover:shadow-lg"
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
    </div>
  );
}

function MemberStats({ userStats }) {
  return (
    <div className="p-8 h-fit relative" style={{
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      clipPath: 'polygon(30px 0%, 100% 0%, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0% 100%, 0% 30px)',
      border: '2px solid #4a5568',
      boxShadow: '0 0 20px rgba(255, 215, 0, 0.1)'
    }}>
      <div className="text-center">
        <div className="w-32 h-32 mx-auto mb-6 relative" style={{
          background: 'linear-gradient(135deg, #ffd700, #ffa500)',
          clipPath: 'polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)',
          boxShadow: '0 0 30px rgba(255, 215, 0, 0.5)'
        }}>
          <div className="absolute inset-4 flex items-center justify-center" style={{
            background: 'linear-gradient(135deg, #ffd700, #ffa500)',
            clipPath: 'polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)'
          }}>
            <div className="w-16 h-16 flex items-center justify-center relative" style={{
              background: 'linear-gradient(135deg, #ffd700, #ffa500)',
              clipPath: 'polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)'
            }}>
              <span className="text-black text-2xl font-bold">⚡</span>
            </div>
          </div>
        </div>
        <h2 className="text-2xl font-black font-futuristic tracking-wider" style={{
          background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>MEMBER STATS</h2>
        {userStats && userStats.rank && (
          <div className="mt-6 space-y-2">
            <div className="p-3 relative bg-gray-800/70 border border-gray-600" style={{
              clipPath: 'polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)'
            }}>
              <div className="text-sm text-gray-300">Tier: <span className="text-yellow-400 font-bold">{userStats.tier}</span></div>
            </div>
            <div className="p-3 relative bg-gray-800/70 border border-gray-600" style={{
              clipPath: 'polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)'
            }}>
              <div className="text-sm text-gray-300">Rank: <span className="text-yellow-400 font-bold">#{userStats.rank}</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Leaderboard({ userName, onUserDataFound }) {
  const [leaders, setLeaders] = useState([
    { rank: 1, name: 'Loading...', score: '---', tier: 'Participant' },
    { rank: 2, name: 'Loading...', score: '---', tier: 'Participant' },
    { rank: 3, name: 'Loading...', score: '---', tier: 'Participant' }
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeaderboardData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchLeaderboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Find user data when name changes
    if (userName && leaders.length > 0) {
      const userEntry = leaders.find(leader => 
        leader.name.toLowerCase().includes(userName.toLowerCase()) ||
        userName.toLowerCase().includes(leader.name.toLowerCase())
      );
      
      if (userEntry && onUserDataFound) {
        // Calculate level based on XP (15 XP per level)
        const level = Math.floor(userEntry.score / 15) + 1;
        const currentLevelXP = userEntry.score % 15;
        const nextLevelXP = 15;
        
        onUserDataFound({
          level: level,
          xp: userEntry.score,
          currentLevelXP: currentLevelXP,
          nextLevelXP: nextLevelXP,
          tier: userEntry.tier,
          rank: userEntry.rank
        });
      }
    }
  }, [userName, leaders, onUserDataFound]);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      
      // Try CSV method first (more reliable)
      try {
        const csvData = await fetchLeaderboardCSV();
        if (csvData.length > 0) {
          setLeaders(csvData);
          setLoading(false);
          setError(null);
          return;
        }
      } catch (csvError) {
        console.log('CSV method failed, trying JSON method...');
      }
      
      // Fallback to JSON method
      const response = await fetch(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Leaderboard`);
      const text = await response.text();
      
      // Parse Google's JSONP response
      const jsonText = text.substring(47).slice(0, -2);
      const data = JSON.parse(jsonText);
      
      if (data.table && data.table.rows) {
        const rows = data.table.rows.slice(1); // Skip header row
        const leaderboardData = rows
          .filter(row => row.c && row.c[0] && row.c[1]) // Filter out empty rows
          .map((row, index) => ({
            rank: index + 1,
            name: row.c[0]?.v || 'Unknown',
            score: row.c[1]?.v || 0,
            tier: row.c[2]?.v || 'Participant'
          }))
          .sort((a, b) => b.score - a.score) // Sort by score descending
          .slice(0, 10); // Take top 10

        setLeaders(leaderboardData.length > 0 ? leaderboardData : [
          { rank: 1, name: 'No data available', score: 0, tier: 'Participant' }
        ]);
      }
      
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to load leaderboard data. Please ensure the Google Sheet is publicly accessible.');
      setLoading(false);
      
      // Fallback data
      setLeaders([
        { rank: 1, name: 'Sheet Access Error', score: '---', tier: 'Participant' },
        { rank: 2, name: 'Check sheet permissions', score: '---', tier: 'Participant' },
        { rank: 3, name: 'Make sheet public', score: '---', tier: 'Participant' }
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
    <div className="p-8 h-fit relative" style={{
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      clipPath: 'polygon(30px 0%, 100% 0%, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0% 100%, 0% 30px)',
      border: '2px solid #4a5568',
      boxShadow: '0 0 20px rgba(255, 215, 0, 0.1)'
    }}>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-black font-futuristic tracking-wider" style={{
          background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 0 30px rgba(255, 215, 0, 0.8)'
        }}>LEADERBOARD</h2>
        {loading && (
          <div className="animate-spin w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full"></div>
        )}
      </div>
      
      {error && (
        <div className="text-red-400 text-center mb-4 p-2 bg-red-900/20 rounded-lg border border-red-600">
          {error}
        </div>
      )}
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {leaders.map((leader, index) => {
          const isCurrentUser = userName && (
            leader.name.toLowerCase().includes(userName.toLowerCase()) ||
            userName.toLowerCase().includes(leader.name.toLowerCase())
          );
          
          return (
            <div key={index} className={`flex justify-between items-center text-white p-4 border transition-all duration-300 ${
              isCurrentUser 
                ? 'bg-yellow-400/20 border-yellow-400 shadow-lg shadow-yellow-400/20' 
                : 'bg-gray-800/30 border-gray-600 hover:bg-gray-700/30'
            }`} style={{
              clipPath: 'polygon(15px 0%, 100%  0%, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0% 100%, 0% 15px)'
            }}>
              <div className="flex items-center space-x-4">
                <span className={`font-bold text-lg tracking-wide min-w-[20px] ${
                  isCurrentUser ? 'text-yellow-400' : 'text-white'
                }`}>{leader.rank}</span>
                <div>
                  <div className={`font-bold text-lg ${
                    isCurrentUser ? 'text-yellow-300' : 'text-white'
                  }`}>
                    {leader.name} {isCurrentUser && '(You)'}
                  </div>
                  <div className={`text-sm font-semibold ${getTierColor(leader.tier)}`}>
                    {leader.tier}
                  </div>
                </div>
              </div>
              <span className="font-black text-xl" style={{
                background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>{leader.score}</span>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 text-center">
        <button 
          onClick={fetchLeaderboardData}
          disabled={loading}
          className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 disabled:opacity-50 text-black font-bold py-3 px-6 transition-all duration-300 shadow-lg"
          style={{
            clipPath: 'polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)'
          }}
        >
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>
    </div>
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
      eventData={[]} // You can add event data here from Google Sheets later
    />;
  }

  return (
    <div className="min-h-screen p-8 font-futuristic" style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%)'
    }}>
      <SkipNavigation />
      <InfoSidebar />
      
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
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2">
              <BadgeSection />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <MentorshipSection onMentorshipClick={() => setMentorshipMode(true)} />
                <MemberStats userStats={userStats} />
              </div>
            </div>
            
            <div className="xl:col-span-1">
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
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2">
              <BadgeSection />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <MentorshipSection onMentorshipClick={() => setMentorshipMode(true)} />
                <div className="p-8 h-fit relative" style={{
                  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                  clipPath: 'polygon(30px 0%, 100% 0%, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0% 100%, 0% 30px)',
                  border: '2px solid #4a5568',
                  boxShadow: '0 0 20px rgba(255, 215, 0, 0.1)'
                }}>
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto mb-6 relative" style={{
                      background: 'linear-gradient(135deg, #ffd700, #ffa500)',
                      clipPath: 'polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)',
                      boxShadow: '0 0 30px rgba(255, 215, 0, 0.5)'
                    }}>
                      <div className="absolute inset-4 flex items-center justify-center" style={{
                        background: 'linear-gradient(135deg, #1a1f2e, #16213e)',
                        clipPath: 'polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)',
                        border: '2px solid #ffd700'
                      }}>
                        <div className="w-16 h-16 flex items-center justify-center relative" style={{
                          background: 'linear-gradient(135deg, #ffd700, #ffa500)',
                          clipPath: 'polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)'
                        }}>
                          <span className="text-black text-2xl font-bold">📋</span>
                        </div>
                      </div>
                    </div>
                    <h2 className="text-2xl font-black font-futuristic tracking-wider" style={{
                      background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>BATTLE PASS INFO</h2>
                    <p className="mt-4 text-gray-300">Click the INFO button in the top-right corner to view tiers, points system, events, and more!</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="xl:col-span-1">
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
          <div className="mt-8 text-center p-4" style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            clipPath: 'polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)',
            border: '2px solid #ffd700'
          }}>
            <p className="text-yellow-400 font-bold text-xl" style={{
              fontFamily: 'Orbitron, monospace'
            }}>
              {userName} - Rank #{userStats.rank} | {userStats.tier} Tier | {userStats.xp} XP
            </p>
          </div>
        )}
        
        {/* Debug info */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Connected to Google Sheet: {SHEET_ID}</p>
          <p>Last updated: {new Date().toLocaleTimeString()}</p>
        </div>
      </div>
    </div>
  );
}


// Mentorship & Professional Development Hub Component
function MentorshipHub({ onBackClick, userData, eventData }) {
  const [activeFilter, setActiveFilter] = useState('all');

  // Calculate achievements based on user data and attendance
  const calculateAchievements = (userData, eventData) => {
    // Default achievements when no user data is available
    const defaultAchievements = [
      { name: 'Resume Workshop', status: 'locked', icon: '📝', color: '#6b7280', glow: 'rgba(75, 85, 99, 0.3)', desc: 'Attend PD Workshop (0/1)', xp: 25, category: 'pzone', requirement: 1, current: 0 },
      { name: 'LinkedIn Revamp', status: 'locked', icon: '💼', color: '#6b7280', glow: 'rgba(75, 85, 99, 0.3)', desc: 'Attend 2+ PD Events (0/2)', xp: 20, category: 'pzone', requirement: 2, current: 0 },
      { name: 'Resume Reviewed', status: 'locked', icon: '✅', color: '#6b7280', glow: 'rgba(75, 85, 99, 0.3)', desc: 'PD Power User (0/3)', xp: 30, category: 'pzone', requirement: 3, current: 0 },
      { name: 'Pod Meeting', status: 'locked', icon: '👥', color: '#6b7280', glow: 'rgba(75, 85, 99, 0.3)', desc: 'Join Pod Meeting (0/1)', xp: 15, category: 'nsbe', requirement: 1, current: 0 },
      { name: 'Study Jam', status: 'locked', icon: '📚', color: '#6b7280', glow: 'rgba(75, 85, 99, 0.3)', desc: 'Academic Session (0/1)', xp: 20, category: 'academic', requirement: 1, current: 0 },
      { name: 'GPA ≥ 3.5', status: 'locked', icon: '🎯', color: '#6b7280', glow: 'rgba(75, 85, 99, 0.3)', desc: 'Academic Excellence (0/100 XP)', xp: 40, category: 'academic', requirement: 100, current: 0 },
      { name: 'Mock Interview', status: 'locked', icon: '🎤', color: '#6b7280', glow: 'rgba(75, 85, 99, 0.3)', desc: 'Interview Ready (0/4)', xp: 35, category: 'pzone', requirement: 4, current: 0 },
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

    return [
      { 
        name: 'Resume Workshop', 
        status: pdEvents >= 1 ? 'completed' : 'locked', 
        icon: '📝', 
        color: pdEvents >= 1 ? '#22c55e' : '#6b7280', 
        glow: pdEvents >= 1 ? 'rgba(34, 197, 94, 0.5)' : 'rgba(75, 85, 99, 0.3)', 
        desc: `Attend PD Workshop (${pdEvents}/1)`, 
        xp: 25, 
        category: 'pzone',
        requirement: 1,
        current: pdEvents
      },
      { 
        name: 'LinkedIn Revamp', 
        status: pdEvents >= 2 ? 'completed' : 'locked', 
        icon: '💼', 
        color: pdEvents >= 2 ? '#3b82f6' : '#6b7280', 
        glow: pdEvents >= 2 ? 'rgba(59, 130, 246, 0.5)' : 'rgba(75, 85, 99, 0.3)', 
        desc: `Attend 2+ PD Events (${pdEvents}/2)`, 
        xp: 20, 
        category: 'pzone',
        requirement: 2,
        current: pdEvents
      },
      { 
        name: 'Resume Reviewed', 
        status: pdEvents >= 3 ? 'completed' : 'locked', 
        icon: '✅', 
        color: pdEvents >= 3 ? '#ffd700' : '#6b7280', 
        glow: pdEvents >= 3 ? 'rgba(255, 215, 0, 0.6)' : 'rgba(75, 85, 99, 0.3)', 
        desc: `PD Power User (${pdEvents}/3)`, 
        xp: 30, 
        category: 'pzone',
        requirement: 3,
        current: pdEvents
      },
      { 
        name: 'Pod Meeting', 
        status: mentorshipEvents >= 1 ? 'completed' : 'locked', 
        icon: '👥', 
        color: mentorshipEvents >= 1 ? '#10b981' : '#6b7280', 
        glow: mentorshipEvents >= 1 ? 'rgba(16, 185, 129, 0.5)' : 'rgba(75, 85, 99, 0.3)', 
        desc: `Join Pod Meeting (${mentorshipEvents}/1)`, 
        xp: 15, 
        category: 'nsbe',
        requirement: 1,
        current: mentorshipEvents
      },
      { 
        name: 'Study Jam', 
        status: academicEvents >= 1 ? 'completed' : 'locked', 
        icon: '📚', 
        color: academicEvents >= 1 ? '#06b6d4' : '#6b7280', 
        glow: academicEvents >= 1 ? 'rgba(6, 182, 212, 0.5)' : 'rgba(75, 85, 99, 0.3)', 
        desc: `Academic Session (${academicEvents}/1)`, 
        xp: 20, 
        category: 'academic',
        requirement: 1,
        current: academicEvents
      },
      { 
        name: 'GPA ≥ 3.5', 
        status: userData.score >= 100 ? 'completed' : 'locked', 
        icon: '🎯', 
        color: userData.score >= 100 ? '#ffd700' : '#6b7280', 
        glow: userData.score >= 100 ? 'rgba(255, 215, 0, 0.7)' : 'rgba(75, 85, 99, 0.3)', 
        desc: `Academic Excellence (${userData.score}/100 XP)`, 
        xp: 40, 
        category: 'academic',
        requirement: 100,
        current: userData.score
      },
      { 
        name: 'Mock Interview', 
        status: pdEvents >= 4 ? 'completed' : 'locked', 
        icon: '🎤', 
        color: pdEvents >= 4 ? '#8b5cf6' : '#6b7280', 
        glow: pdEvents >= 4 ? 'rgba(139, 92, 246, 0.5)' : 'rgba(75, 85, 99, 0.3)', 
        desc: `Interview Ready (${pdEvents}/4)`, 
        xp: 35, 
        category: 'pzone',
        requirement: 4,
        current: pdEvents
      },
      { 
        name: '1-on-1 Mentorship', 
        status: mentorshipEvents >= 3 ? 'completed' : 'locked', 
        icon: '🔥', 
        color: mentorshipEvents >= 3 ? '#22c55e' : '#6b7280', 
        glow: mentorshipEvents >= 3 ? 'rgba(34, 197, 94, 0.7)' : 'rgba(75, 85, 99, 0.3)', 
        desc: `Mentorship Master (${mentorshipEvents}/3)`, 
        xp: 50, 
        category: 'nsbe',
        requirement: 3,
        current: mentorshipEvents
      }
    ];
  };

  // Calculate dynamic achievements based on current user data
  const achievements = calculateAchievements(userData, eventData);
  
  return (
    <div className="min-h-screen p-8 font-futuristic" style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%)'
    }}>
      {/* Back Button */}
      <button
        onClick={onBackClick}
        className="fixed top-4 left-4 z-50 p-3 bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold transition-all duration-300 shadow-lg"
        style={{
          clipPath: 'polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)'
        }}
      >
        ← BACK TO DASHBOARD
      </button>

      <div className="max-w-6xl mx-auto pt-16">
        {/* Section Title Bar */}
        <div className="mb-8 text-center p-8" style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          clipPath: 'polygon(30px 0%, 100% 0%, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0% 100%, 0% 30px)',
          border: '3px solid #ffd700',
          boxShadow: '0 0 40px rgba(255, 215, 0, 0.4)'
        }}>
          <h1 className="text-5xl font-black tracking-wider mb-4" style={{
            background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontFamily: 'Orbitron, monospace'
          }}>🔥 MENTORSHIP + DEVELOPMENT HUB</h1>
          <p className="text-xl text-gray-300 mb-6" style={{ fontFamily: 'Orbitron, monospace' }}>
            Powered by NSBE UofM × P-Zone × M-Zone
          </p>
          <div className="flex justify-center items-center space-x-8 text-4xl">
            <div className="text-center">
              <div>🔥</div>
              <div className="text-sm text-yellow-400 mt-2">NSBE</div>
            </div>
            <div className="text-center">
              <div>🎓</div>
              <div className="text-sm text-blue-400 mt-2">Academic</div>
            </div>
            <div className="text-center">
              <div>🚀</div>
              <div className="text-sm text-purple-400 mt-2">P-Zone</div>
            </div>
          </div>
        </div>

        {/* Progress HUD */}
        <div className="mb-8 p-6" style={{
          background: 'linear-gradient(135deg, #1e293b, #334155)',
          clipPath: 'polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)',
          border: '2px solid #60a5fa',
          boxShadow: '0 0 25px rgba(96, 165, 250, 0.4)'
        }}>
          <div className="text-center mb-4">
            <span className="text-2xl font-bold text-yellow-400">
              Mentorship XP: {userData?.xp || 0}/{userData?.nextLevelXP ? (userData.level * 15) : 500}
            </span>
            <div className="inline-block ml-4 px-4 py-2 text-lg font-bold" style={{
              background: 'linear-gradient(135deg, #ffd700, #ffa500)',
              color: '#000',
              clipPath: 'polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)'
            }}>{userData?.tier || 'Participant'}</div>
          </div>
          <div className="relative h-6 bg-gray-800 rounded-full overflow-hidden mb-2">
            <div 
              className="absolute left-0 top-0 h-full transition-all duration-1000 flex items-center justify-center"
              style={{
                width: `${userData?.currentLevelXP && userData?.nextLevelXP ? Math.round((userData.currentLevelXP / userData.nextLevelXP) * 100) : 0}%`,
                background: 'linear-gradient(90deg, #ffd700, #60a5fa, #ffd700)',
                boxShadow: '0 0 15px rgba(255, 215, 0, 0.8)'
              }}
            >
              <span className="text-sm font-bold text-black">
                {userData?.currentLevelXP && userData?.nextLevelXP ? Math.round((userData.currentLevelXP / userData.nextLevelXP) * 100) : 0}% Complete
              </span>
            </div>
          </div>
          <div className="text-center text-sm text-gray-300">Next Milestone: Platinum Mentor at 500 XP</div>
        </div>

        {/* Toggle Filters */}
        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { id: 'all', label: 'Progress', icon: '🌟' },
            { id: 'nsbe', label: 'NSBE Mentoring', icon: '🔥' },
            { id: 'pzone', label: 'Professional Dev', icon: '🚀' },
            { id: 'academic', label: 'Academic Corner', icon: '🎓' }
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`p-4 text-sm font-semibold transition-all duration-300 ${
                activeFilter === filter.id 
                  ? 'bg-yellow-400/20 text-yellow-300 border-yellow-400 shadow-lg' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/30 border-gray-600'
              } border-2`}
              style={{
                clipPath: 'polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)'
              }}
            >
              <div className="text-2xl mb-2">{filter.icon}</div>
              <div>{filter.label}</div>
            </button>
          ))}
        </div>

        {/* Academic Excellence Corner - Only show for Academic Corner */}
        {activeFilter === 'academic' && (
          <div className="mb-8 p-6" style={{
            background: 'linear-gradient(135deg, #dc2626, #991b1b)',
            clipPath: 'polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)',
            border: '2px solid #ef4444',
            boxShadow: '0 0 20px rgba(220, 38, 38, 0.3)'
          }}>
            <h3 className="text-2xl font-bold text-red-200 mb-4 text-center">📚 ACADEMIC EXCELLENCE CORNER</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-4 bg-red-900/50 border border-red-400" style={{
                clipPath: 'polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)'
              }}>
                <div className="text-yellow-300 font-bold mb-2">🌟 Current Recognition</div>
                <div className="text-red-100">"Study Star" - Top 10% GPA in your cohort</div>
              </div>
              <div className="p-4 bg-red-900/50 border border-red-400" style={{
                clipPath: 'polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)'
              }}>
                <div className="text-yellow-300 font-bold mb-2">💡 Tip of the Week</div>
                <div className="text-red-100 text-sm">Schedule study sessions during peak focus hours (9-11 AM)</div>
              </div>
              <div className="p-4 bg-red-900/50 border border-red-400" style={{
                clipPath: 'polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)'
              }}>
                <button className="w-full p-3 bg-red-400/30 text-red-100 hover:bg-red-400/40 transition-all font-bold" style={{
                  clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)'
                }}>
                  📖 Access Study Resources
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Professional Development Section - Only show for Professional Dev */}
        {activeFilter === 'pzone' && (
          <div className="mb-8 p-6" style={{
            background: 'linear-gradient(135deg, #0369a1, #0284c7)',
            clipPath: 'polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)',
            border: '2px solid #0ea5e9',
            boxShadow: '0 0 20px rgba(14, 165, 233, 0.3)'
          }}>
            <h3 className="text-2xl font-bold text-sky-200 mb-6 text-center">🚀 PROFESSIONAL DEVELOPMENT</h3>
            
            {/* Resume Resources */}
            <div className="mb-6">
              <h4 className="text-lg font-bold text-yellow-300 mb-4 flex items-center">
                📝 Resume Resources
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h5 className="text-sm font-bold text-sky-300">University of Michigan Resources</h5>
                  <a href="https://careercenter.umich.edu/article/resume-resources" target="_blank" rel="noopener noreferrer" className="block p-3 text-sm text-sky-100 hover:text-sky-200 transition-colors border border-sky-600 hover:bg-sky-800/30" style={{ clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)' }}>
                    Career Center Resume Resources
                  </a>
                  <a href="https://career.engin.umich.edu/resumes-cvs-cover-letters/" target="_blank" rel="noopener noreferrer" className="block p-3 text-sm text-sky-100 hover:text-sky-200 transition-colors border border-sky-600 hover:bg-sky-800/30" style={{ clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)' }}>
                    ECRC Resume, CVs, and Cover Letters
                  </a>
                  <a href="https://engin-umich.12twenty.com/appointments" target="_blank" rel="noopener noreferrer" className="block p-3 text-sm text-sky-100 hover:text-sky-200 transition-colors border border-sky-600 hover:bg-sky-800/30" style={{ clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)' }}>
                    ECRC Resume Advising Appointments
                  </a>
                  <a href="https://career.engin.umich.edu/events/workshops/" target="_blank" rel="noopener noreferrer" className="block p-3 text-sm text-sky-100 hover:text-sky-200 transition-colors border border-sky-600 hover:bg-sky-800/30" style={{ clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)' }}>
                    ECRC Career Workshops
                  </a>
                </div>
                <div className="space-y-3">
                  <h5 className="text-sm font-bold text-sky-300">Sample Resumes & Templates</h5>
                  <a href="https://career.engin.umich.edu/wp-content/uploads/sites/30/2024/05/Career-Guide-Resumes-24-25.pdf" target="_blank" rel="noopener noreferrer" className="block p-3 text-sm text-sky-100 hover:text-sky-200 transition-colors border border-sky-600 hover:bg-sky-800/30" style={{ clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)' }}>
                    Sample Resume (PDF)
                  </a>
                  <a href="https://career.engin.umich.edu/sample-resume-content/" target="_blank" rel="noopener noreferrer" className="block p-3 text-sm text-sky-100 hover:text-sky-200 transition-colors border border-sky-600 hover:bg-sky-800/30" style={{ clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)' }}>
                    Sample Resume Content
                  </a>
                  <a href="https://career.engin.umich.edu/sample-impact-statements/" target="_blank" rel="noopener noreferrer" className="block p-3 text-sm text-sky-100 hover:text-sky-200 transition-colors border border-sky-600 hover:bg-sky-800/30" style={{ clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)' }}>
                    Sample Impact Statements
                  </a>
                  <div className="p-3 bg-sky-900/50 border border-sky-600" style={{ clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)' }}>
                    <div className="text-xs text-sky-300 mb-2">Resume Creation Tools:</div>
                    <div className="text-xs text-sky-100 space-y-1">
                      <div>• Microsoft Word</div>
                      <div>• Google Docs</div>
                      <div>• Overleaf (LaTeX)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Verbs & Templates */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-sky-900/50 border border-sky-400" style={{
                clipPath: 'polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)'
              }}>
                <div className="text-yellow-300 font-bold mb-2">📄 Resume Templates</div>
                <div className="space-y-2 text-sm">
                  <button className="w-full p-2 text-left text-sky-100 hover:bg-sky-800/30 transition-colors">Empty Resume Template</button>
                  <button className="w-full p-2 text-left text-sky-100 hover:bg-sky-800/30 transition-colors">Resume Template 1</button>
                  <button className="w-full p-2 text-left text-sky-100 hover:bg-sky-800/30 transition-colors">Resume Template 2</button>
                </div>
              </div>
              <div className="p-4 bg-sky-900/50 border border-sky-400" style={{
                clipPath: 'polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)'
              }}>
                <div className="text-yellow-300 font-bold mb-2">🔥 Action Verbs</div>
                <div className="text-sm text-sky-100 mb-3">Power up your resume with impactful language</div>
                <button className="w-full p-2 bg-sky-400/30 text-sky-100 hover:bg-sky-400/40 transition-all font-bold" style={{
                  clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)'
                }}>
                  📥 Download Action Verbs PDF
                </button>
              </div>
            </div>
          </div>
        )}

        {/* NSBE Mentoring Content - Only show for NSBE Mentoring */}
        {activeFilter === 'nsbe' && (
          <div className="space-y-8">
            {/* NSBE Mentorship Program Objective */}
            <div className="p-6" style={{
              background: 'linear-gradient(135deg, #ffd700, #ffa500)',
              clipPath: 'polygon(15px 0%, 100% 0%, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0% 100%, 0% 15px)',
              border: '2px solid #ffed4e',
              boxShadow: '0 0 20px rgba(255, 215, 0, 0.4)',
              color: '#000'
            }}>
              <h3 className="text-xl font-bold mb-4 text-center">🎯 NSBE UofM Mentorship Program 2025 Objective</h3>
              <div className="text-sm mb-4 leading-relaxed">
                <p className="mb-3">
                  The NSBE UofM Mentorship Program empowers students through intentional, community-driven relationships that promote academic excellence, professional growth, and a strong cultural foundation.
                </p>
                <p className="mb-3">
                  Through a dynamic partnership with P-Zone and the M-Zone, the program supports students in reaching their full potential by providing access to mentorship, development workshops, and skill-based challenges—all integrated into our Battle Pass system to gamify progress and reward growth.
                </p>
                <p className="mb-4">
                  Whether you're a mentor, mentee, or pod participant, every connection and milestone moves you forward—academically, professionally, and personally.
                </p>
              </div>
              <a 
                href="#" 
                className="block w-full p-3 text-center font-bold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white transition-all duration-300 shadow-lg"
                style={{
                  clipPath: 'polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)'
                }}
              >
                🔥 Sign Up for Mentorship Program
              </a>
            </div>

            {/* Grid Layout for NSBE Content */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Mentorship Stats */}
              <div className="p-6" style={{
                background: 'linear-gradient(135deg, #065f46, #047857)',
                clipPath: 'polygon(15px 0%, 100% 0%, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0% 100%, 0% 15px)',
                border: '2px solid #10b981',
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)'
              }}>
                <h3 className="text-lg font-bold text-emerald-200 mb-4 text-center">🧠 YOUR JOURNEY</h3>
                <div className="space-y-3">
                  <div className="flex justify-between p-2 bg-emerald-900/40 rounded">
                    <span className="text-emerald-100">Role:</span>
                    <span className="text-white font-bold">Mentee</span>
                  </div>
                  <div className="flex justify-between p-2 bg-emerald-900/40 rounded">
                    <span className="text-emerald-100">Pod:</span>
                    <span className="text-white font-bold">Pod Alpha</span>
                  </div>
                  <div className="flex justify-between p-2 bg-emerald-900/40 rounded">
                    <span className="text-emerald-100">Active Streak:</span>
                    <span className="text-yellow-300 font-bold">4 weeks 🔥</span>
                  </div>
                  <div className="flex justify-between p-2 bg-emerald-900/40 rounded">
                    <span className="text-emerald-100">Sessions:</span>
                    <span className="text-yellow-300 font-bold">5 logged</span>
                  </div>
                </div>
              </div>

              {/* Upcoming Mentorship Opportunities */}
              <div className="p-6" style={{
                background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                clipPath: 'polygon(15px 0%, 100% 0%, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0% 100%, 0% 15px)',
                border: '2px solid #8b5cf6',
                boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)'
              }}>
                <h3 className="text-lg font-bold text-purple-200 mb-4 text-center">📅 MENTORSHIP OPPORTUNITIES</h3>
                <div className="space-y-4">
                  {[
                    { event: 'Pod Check-In Meeting', date: 'Jul 15', time: '6:00 PM', xp: '+25 XP', urgent: true },
                    { event: 'Mentor-Mentee Matching', date: 'Jul 22', time: '7:00 PM', xp: '+50 XP', urgent: false },
                    { event: '1-on-1 Session Goal', date: 'Ongoing', time: 'Schedule', xp: '+30 XP', urgent: false }
                  ].map((opportunity, index) => (
                    <div key={index} className={`p-3 ${opportunity.urgent ? 'bg-red-900/50 border border-red-400' : 'bg-purple-900/50 border border-purple-400'}`} style={{
                      clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)'
                    }}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="text-white font-bold text-sm">{opportunity.event}</div>
                          <div className="text-purple-200 text-xs">{opportunity.date} • {opportunity.time}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-yellow-300 font-bold text-sm">{opportunity.xp}</div>
                          {opportunity.urgent && <div className="text-red-300 text-xs font-bold">⚡ URGENT</div>}
                        </div>
                      </div>
                      <button className="w-full p-2 bg-yellow-400/20 text-yellow-300 hover:bg-yellow-400/30 transition-all text-xs font-bold" style={{
                        clipPath: 'polygon(6px 0%, 100% 0%, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0% 100%, 0% 6px)'
                      }}>
                        🎯 RSVP TO EARN XP
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid - Only show in Progress section */}
        {activeFilter === 'all' && (
          <div className="grid lg:grid-cols-3 gap-8">
          {/* Achievement Badges - Takes up 2 columns */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-yellow-400 mb-4 text-center">🏅 ACHIEVEMENT BADGES</h2>
              <div className="text-center mb-6 p-4 bg-blue-900/30 border border-blue-500/50 rounded-lg">
                <p className="text-blue-200 text-sm">
                  🔗 <strong>Live Progress Tracking:</strong> Your achievements update automatically based on event attendance and XP earned. 
                  Complete more PD workshops, mentorship sessions, and academic activities to unlock new badges!
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {achievements.filter(achievement => activeFilter === 'all' || achievement.category === activeFilter).map((achievement, index) => (
                  <div
                    key={index}
                    className={`p-4 text-center transition-all cursor-pointer hover:scale-105 ${
                      achievement.status === 'completed' ? 'opacity-100' : 'opacity-60'
                    }`}
                    style={{
                      background: achievement.status === 'completed' 
                        ? 'linear-gradient(135deg, #1e293b, #334155)' 
                        : 'linear-gradient(135deg, #374151, #4b5563)',
                      clipPath: 'polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)',
                      border: `3px solid ${achievement.color}`,
                      boxShadow: achievement.status === 'completed' 
                        ? `0 0 20px ${achievement.glow}` 
                        : 'none'
                    }}
                  >
                    <div className="text-3xl mb-2">{achievement.icon}</div>
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

          {/* Right Sidebar - Stats and Opportunities */}
          <div className="space-y-6">
            {/* Upcoming Opportunities - Show for Progress only */}
            <div className="p-6" style={{
              background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
              clipPath: 'polygon(15px 0%, 100% 0%, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0% 100%, 0% 15px)',
              border: '2px solid #8b5cf6',
              boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)'
            }}>
              <h3 className="text-lg font-bold text-purple-200 mb-4 text-center">📅 OPPORTUNITIES</h3>
              <div className="space-y-4">
                {[
                  { event: 'P-Zone × NSBE Resume Lab', date: 'Aug 22', time: '6:00 PM', xp: '+50 XP', urgent: false },
                  { event: 'Mock Interview Gauntlet', date: 'Sep 3', time: '7:00 PM', xp: '+75 XP', urgent: true },
                  { event: 'GPA Checkpoint #1', date: 'Oct 1', time: '5:30 PM', xp: '+25 XP', urgent: false }
                ].map((opportunity, index) => (
                  <div key={index} className={`p-3 ${opportunity.urgent ? 'bg-red-900/50 border border-red-400' : 'bg-purple-900/50 border border-purple-400'}`} style={{
                    clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)'
                  }}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="text-white font-bold text-sm">{opportunity.event}</div>
                        <div className="text-purple-200 text-xs">{opportunity.date} • {opportunity.time}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-yellow-300 font-bold text-sm">{opportunity.xp}</div>
                        {opportunity.urgent && <div className="text-red-300 text-xs font-bold">⚡ URGENT</div>}
                      </div>
                    </div>
                    <button className="w-full p-2 bg-yellow-400/20 text-yellow-300 hover:bg-yellow-400/30 transition-all text-xs font-bold" style={{
                      clipPath: 'polygon(6px 0%, 100% 0%, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0% 100%, 0% 6px)'
                    }}>
                      🎯 RSVP TO EARN XP
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Digital Trophy Case */}
            <div className="p-6 text-center" style={{
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              clipPath: 'polygon(15px 0%, 100% 0%, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0% 100%, 0% 15px)',
              border: '2px solid #fcd34d',
              color: '#000',
              boxShadow: '0 0 20px rgba(251, 191, 36, 0.3)'
            }}>
              <h3 className="text-lg font-bold mb-3">🏆 POWER-UP INVENTORY</h3>
              <div className="text-sm mb-4">Digital achievements unlock career advantages!</div>
              <div className="flex justify-center space-x-3 mb-3">
                <span className="text-2xl" title="Leadership Certified">🥇</span>
                <span className="text-2xl" title="Resume Mastery">📜</span>
                <span className="text-2xl" title="Interview Expert">🎯</span>
                <span className="text-2xl opacity-40" title="Locked">🚀</span>
                <span className="text-2xl opacity-40" title="Locked">💎</span>
              </div>
              <div className="text-sm font-semibold">5/8 Power-Ups Unlocked</div>
              <div className="text-xs mt-2">Compare with friends • Share achievements</div>
            </div>
          </div>
        </div>
        )}

      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
