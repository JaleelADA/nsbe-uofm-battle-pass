import React, { useState, useEffect } from "react";
import Tabletop from "tabletop";
import { motion } from "framer-motion";
import Header from "../components/Header";
import { GOOGLE_SHEET_URL } from "../constants/sheetConfig";

// ===== CENTRALIZED DATA CONSTANTS =====

// Google Sheets configuration
const SHEET_CONFIG = {
  SHEET_ID: '1EkyzaNjTQ-5sKvqex5SnTTJ6SCdq-WYIJ_Y_wU34JIU',
  get SHEET_URL() { return `https://docs.google.com/spreadsheets/d/${this.SHEET_ID}/edit#gid=0`; }
};

// Documentation links
const DOCUMENTATION_LINKS = [
  {
    title: "Point System Overview",
    url: "https://docs.google.com/document/d/1KNJ2CdsHd_fytD1nkW5MPc2LrK17E9LwsHBcc9r0ZXA/edit?usp=sharing"
  },
  {
    title: "Battle Pass FAQs", 
    url: "https://docs.google.com/document/d/1Ss6W_MWxAeWA_UB8k2aZE67oa5kc4bTCWBI3B4Kvit8/edit?usp=sharing"
  },
  {
    title: "Battle Pass Guide",
    url: "https://docs.google.com/document/d/1k3yd2x2q0Th0Wo3jQKbvrSCagguMuAmpKG2ARvOVqAg/edit?usp=sharing"
  }
];

// Events data
const EVENTS_DATA = [
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

// Announcements data
const ANNOUNCEMENTS_DATA = [
  { title: "Pay NSBE Dues", url: "https://mynsbe.nsbe.org/s/joinprocess" },
  { title: "Conference Info", url: "https://convention.nsbe.org/" },
  { title: "Scholarship Opportunities", url: "https://nsbe.org/scholarships/" },
  { title: "Resume Book", url: "https://docs.google.com/forms/d/e/1FAIpQLSfsQfpp76QkK9HdEAi0DQJftrnV3r1Gv8PsLmIJlLHIQVYnKA/viewform" },
  { title: "Mentorship Sign-ups", url: "#" },
  { title: "Committee Applications", url: "#" },
  { title: "Collab with NSBEUM!", url: "#" }
];

// Tier definitions
const TIER_DEFINITIONS = [
  { 
    tier: 'GOLD', 
    range: 'Top 25%', 
    desc: 'NSBE Elite! Priority Conference RSVP, GBM shoutouts.', 
    bg: 'linear-gradient(135deg, #ffd700, #ffa500)', 
    color: '#000', 
    icon: '🥇' 
  },
  { 
    tier: 'SILVER', 
    range: '25–50%', 
    desc: 'Consistent contributors. Prize raffles, mentorship perks, Free NSBE Swag.', 
    bg: 'linear-gradient(135deg, #c0c0c0, #a0a0a0)', 
    color: '#000', 
    icon: '🥈' 
  },
  { 
    tier: 'BRONZE', 
    range: '50–75%', 
    desc: 'Active participants. Early invites to NSBE events.', 
    bg: 'linear-gradient(135deg, #cd7f32, #b8860b)', 
    color: '#fff', 
    icon: '🥉' 
  },
  { 
    tier: 'PARTICIPANT', 
    range: 'Below 75%', 
    desc: 'You\'re on the board! Keep showing up to level up.', 
    bg: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', 
    color: '#fff', 
    icon: '🏅' 
  }
];

// Point system data
const POINT_SYSTEM = [
  { activity: '📚 PD & Mentoring', points: '+10 pts' },
  { activity: '🎉 General Attendance', points: '+7 pts' },
  { activity: '🎯 P or M-Zone', points: '+5 pts' },
  { activity: '🏆 Convention', points: '+15 pts' },
  { activity: '👥 Referral', points: '+3 pts' }
];

// Badges configuration
const BADGES_CONFIG = [
  { name: 'PARTICIPANT', color: 'from-blue-500 to-blue-700', active: true, textColor: 'text-white', border: '#3b82f6' },
  { name: 'BRONZE', color: 'from-yellow-600 to-orange-700', active: true, textColor: 'text-white', border: '#d97706' },
  { name: 'SILVER', color: 'from-gray-300 to-gray-500', active: true, textColor: 'text-black', border: '#6b7280' },
  { name: 'GOLD', color: 'from-yellow-400 to-yellow-600', active: false, textColor: 'text-black', border: '#fbbf24' }
];

// Contact information
const CONTACT_INFO = [
  {
    type: "Email",
    label: "nsbe.membership@umich.edu",
    url: "mailto:nsbe.membership@umich.edu"
  },
  {
    type: "Instagram", 
    label: "@nsbeum",
    url: "https://instagram.com/nsbeum"
  },
  {
    type: "Linktree",
    label: "NSBE UMich", 
    url: "https://linktr.ee/nsbe_um"
  }
];

// ===== SHARED STYLE CONSTANTS =====

const SHARED_STYLES = {
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

// ===== HELPER FUNCTIONS =====

// Helper function to check sheet accessibility
async function checkSheetAccess() {
  try {
    const response = await fetch(`https://docs.google.com/spreadsheets/d/${SHEET_CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=Leaderboard`);
    return response.ok;
  } catch (error) {
    console.error('Sheet access check failed:', error);
    return false;
  }
}

// Alternative fetch method using CSV export (more reliable)
async function fetchLeaderboardCSV() {
  try {
    const response = await fetch(`https://docs.google.com/spreadsheets/d/${SHEET_CONFIG.SHEET_ID}/export?format=csv&gid=0`);
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
      .sort((a, b) => b.score - a.score);
  } catch (error) {
    console.error('CSV fetch failed:', error);
    throw error;
  }
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
                placeholder="Enter your name to see your XP"
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

function DocumentationSection() {
  return (
    <StyledSection theme="blue" className="mb-8">
      <SectionTitle theme="blue">📄 DOCUMENTATION</SectionTitle>
      <div className="space-y-3">
        {DOCUMENTATION_LINKS.map((doc, index) => (
          <StyledLink key={index} href={doc.url}>
            {doc.title}
          </StyledLink>
        ))}
      </div>
    </StyledSection>
  );
}

function UpcomingEventsSection() {
  return (
    <StyledSection id="events-section" theme="gold">
      <SectionTitle theme="gold">📅 UPCOMING EVENTS</SectionTitle>
      
      <div className="space-y-4 mb-6">
        {EVENTS_DATA.map((event, index) => (
          <div key={index} className="p-3 bg-gray-800/50 border border-gray-600" style={{
            clipPath: SHARED_STYLES.clipPaths.button
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
          clipPath: SHARED_STYLES.clipPaths.button
        }}
      >
        📅 Add the NSBEUM Calendar
      </a>
    </StyledSection>
  );
}

function AnnouncementsSection() {
  return (
    <StyledSection theme="green" className="mb-8">
      <SectionTitle theme="green">📣 ANNOUNCEMENTS</SectionTitle>
      
      <div className="space-y-3">
        {ANNOUNCEMENTS_DATA.map((announcement, index) => (
          <StyledLink 
            key={index}
            href={announcement.url}
            className="text-emerald-100 hover:text-emerald-200"
          >
            {announcement.title}
          </StyledLink>
        ))}
      </div>
    </StyledSection>
  );
}

function ContactSection() {
  return (
    <StyledSection theme="purple">
      <SectionTitle theme="purple">📞 CONTACT US</SectionTitle>
      
      <div className="space-y-3">
        {CONTACT_INFO.map((contact, index) => (
          <div key={index} className="p-3 bg-gray-800/50 border border-gray-600" style={{
            clipPath: SHARED_STYLES.clipPaths.button
          }}>
            <span className="text-gray-300">{contact.type}: </span>
            <a href={contact.url} className="text-purple-300 hover:text-purple-200 transition-colors">
              {contact.label}
            </a>
          </div>
        ))}
      </div>
    </StyledSection>
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
          <div className="p-4 sm:p-6">
            <SectionTitle theme="gold">BATTLE PASS TIERS</SectionTitle>
            
            <div className="space-y-3 sm:space-y-4">
              {TIER_DEFINITIONS.map((tier, index) => (
                <div key={index} className="p-3 sm:p-4 text-xs sm:text-sm" style={{
                  background: tier.bg,
                  clipPath: 'polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)',
                  color: tier.color
                }}>
                  <div className="font-bold text-sm sm:text-base mb-2">{tier.icon} {tier.tier} – {tier.range}</div>
                  <div className="font-semibold leading-relaxed">{tier.desc}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'points':
        return (
          <div className="p-4 sm:p-6">
            <SectionTitle theme="blue">POINT SYSTEM</SectionTitle>
            
            <div className="space-y-2 sm:space-y-3">
              {POINT_SYSTEM.map((item, index) => (
                <div key={index} className="p-2 sm:p-3 bg-gray-800/50 border border-gray-600 text-xs sm:text-sm" style={{
                  clipPath: SHARED_STYLES.clipPaths.button
                }}>
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold">{item.activity}</span>
                    <span className="text-yellow-400 font-bold text-sm sm:text-base">{item.points}</span>
                  </div>
                </div>
              ))}
              
              <div className="p-3 sm:p-4 mt-4 sm:mt-6 text-xs sm:text-sm text-center" style={{
                background: 'linear-gradient(135deg, #ffd700, #ffa500)',
                clipPath: 'polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)',
                color: '#000'
              }}>
                <div className="font-bold text-sm sm:text-base mb-1">⚡ SPECIAL BONUS</div>
                <div className="font-semibold">1.5× Multiplier After Volunteering</div>
              </div>
            </div>
          </div>
        );

      case 'docs':
        return (
          <div className="p-4 sm:p-6">
            <SectionTitle theme="blue">📄 DOCUMENTATION</SectionTitle>
            <div className="space-y-2 sm:space-y-3">
              {DOCUMENTATION_LINKS.map((doc, index) => (
                <a key={index} href={doc.url} target="_blank" rel="noopener noreferrer" 
                   className="block p-2 sm:p-3 text-xs sm:text-sm text-cyan-100 hover:text-cyan-200 transition-colors border border-gray-600 hover:bg-gray-800/30" 
                   style={{ clipPath: SHARED_STYLES.clipPaths.button }}>
                  {doc.title}
                </a>
              ))}
            </div>
          </div>
        );

      case 'events':
        return (
          <div className="p-4 sm:p-6">
            <SectionTitle theme="gold">📅 UPCOMING EVENTS</SectionTitle>
            <div className="space-y-3 sm:space-y-4">
              {EVENTS_DATA.map((event, index) => (
                <div key={index} className="p-3 sm:p-4 bg-gray-800/50 border border-gray-600" style={{ clipPath: 'polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)' }}>
                  <div className="font-bold text-yellow-400 mb-2 text-sm sm:text-base">{event.date} – {event.title}</div>
                  <div className="text-gray-300 text-xs sm:text-sm mb-1">{event.time}</div>
                  <div className="text-gray-400 text-xs sm:text-sm">{event.location}</div>
                </div>
              ))}
              <a href="https://tr.ee/kXIev9hrt3" target="_blank" rel="noopener noreferrer" 
                 className="block p-3 sm:p-4 text-sm sm:text-base text-center font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:from-yellow-500 hover:to-yellow-700 transition-all" 
                 style={{ clipPath: 'polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)' }}>
                📅 Add the NSBEUM Calendar
              </a>
            </div>
          </div>
        );

      case 'announcements':
        return (
          <div className="p-4 sm:p-6">
            <SectionTitle theme="green">📣 ANNOUNCEMENTS</SectionTitle>
            <div className="space-y-2 sm:space-y-3">
              {ANNOUNCEMENTS_DATA.map((announcement, index) => (
                <a key={index} href={announcement.url} target="_blank" rel="noopener noreferrer" 
                   className="block p-2 sm:p-3 text-xs sm:text-sm text-emerald-100 hover:text-emerald-200 transition-colors border border-gray-600 hover:bg-gray-800/30" 
                   style={{ clipPath: SHARED_STYLES.clipPaths.button }}>
                  {announcement.title}
                </a>
              ))}
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="p-4 sm:p-6">
            <SectionTitle theme="purple">📞 CONTACT US</SectionTitle>
            <div className="space-y-3 sm:space-y-4">
              {CONTACT_INFO.map((contact, index) => (
                <div key={index} className="p-3 sm:p-4 bg-gray-800/50 border border-gray-600" style={{ clipPath: 'polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)' }}>
                  <span className="text-gray-300 text-sm sm:text-base font-semibold">{contact.type}: </span>
                  <div className="mt-1">
                    <a href={contact.url} target="_blank" rel="noopener noreferrer" 
                       className="text-purple-300 hover:text-purple-200 transition-colors text-xs sm:text-sm">
                      {contact.label}
                    </a>
                  </div>
                </div>
              ))}
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
        className="fixed top-2 right-2 sm:top-4 sm:right-4 z-50 p-2 sm:p-3 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold transition-all duration-300 shadow-lg text-xs sm:text-sm"
        style={{
          clipPath: SHARED_STYLES.clipPaths.button
        }}
      >
        {isOpen ? '✕' : '📋'} <span className="hidden sm:inline">INFO</span>
      </button>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-80 lg:w-96 z-40 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'} overflow-y-auto`} style={{
        background: SHARED_STYLES.sectionBg,
        clipPath: 'polygon(20px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 20px)',
        border: '2px solid #4a5568',
        boxShadow: '0 0 20px rgba(255, 215, 0, 0.1)'
      }}>
        <div className="p-4 sm:p-6 pt-16 sm:pt-20">
          {/* Menu Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4 sm:mb-6">
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
                <div className="text-sm sm:text-base mb-1">{item.icon}</div>
                <div className="text-xs">{item.label}</div>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="pt-4 sm:pt-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </>
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
        userName.toLowerCase().includes(leader.name.toLowerCase())
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
          rank: userEntry.rank
        });
      }
    }
  }, [userName, allLeaders, onUserDataFound]);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      
      // Try CSV method first (more reliable)
      try {
        const csvData = await fetchLeaderboardCSV();
        if (csvData.length > 0) {
          setAllLeaders(csvData);
          setLeaders(csvData.slice(0, 10));
          setLoading(false);
          setError(null);
          return;
        }
      } catch (csvError) {
        console.log('CSV method failed, trying JSON method...');
      }
      
      // Fallback to JSON method
      const response = await fetch(`https://docs.google.com/spreadsheets/d/${SHEET_CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=Leaderboard`);
      const text = await response.text();
      
      // Parse Google's JSONP response
      const jsonText = text.substring(47).slice(0, -2);
      const data = JSON.parse(jsonText);
      
        if (data.table && data.table.rows) {
        const rows = data.table.rows.slice(1); // Skip header row
        const fullData = rows
          .filter(row => row.c && row.c[0] && row.c[1]) // Filter out empty rows
          .map((row, index) => ({
            rank: index + 1,
            name: row.c[0]?.v || 'Unknown',
            score: row.c[1]?.v || 0,
            tier: row.c[2]?.v || 'Participant'
          }))
          .sort((a, b) => b.score - a.score) // Sort by score descending
        const top10 = fullData.slice(0, 10);
        setAllLeaders(fullData);
        setLeaders(top10.length > 0 ? top10 : [
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
            userName.toLowerCase().includes(leader.name.toLowerCase())
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
                  </div>
                  <div className={`text-xs sm:text-xs font-semibold ${getTierColor(leader.tier)}`}>
                    {leader.tier}
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
  const [players, setPlayers] = useState([]);
  const [xp, setXp] = useState(0);

  useEffect(() => {
    Tabletop.init({
      key: GOOGLE_SHEET_URL,
      simpleSheet: true,
    })
      .then((data) => {
        setPlayers(data);
        if (data.length > 0) {
          setXp(data[0].XP || 0);
        }
      })
      .catch((err) => console.warn(err));
  }, []);

  return (
    <div>
      <Header xp={xp} />
      <motion.ul layout className="space-y-4">
        {players.map((player, i) => (
          <motion.li
            key={player.Name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-4 bg-gray-900 rounded-md border border-gray-700"
          >
            <h2 className="text-xl text-nsbeBlue font-semibold">{player.Name}</h2>
            <p>XP: {player.XP}</p>
            <p>Tier: {player.Tier}</p>
            <p>Recruits: {player.Recruits}</p>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);