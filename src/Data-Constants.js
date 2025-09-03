// ===== CENTRALIZED DATA CONSTANTS (GLOBAL) =====
// Expose constants on window so they can be consumed by other Babel scripts without ESM tooling.

// Google Sheets configuration
window.SHEET_CONFIG = {
  SHEET_ID: '1EkyzaNjTQ-5sKvqex5SnTTJ6SCdq-WYIJ_Y_wU34JIU',
  get SHEET_URL() { return `https://docs.google.com/spreadsheets/d/${this.SHEET_ID}/edit#gid=0`; }
};

// Documentation links
window.DOCUMENTATION_LINKS = [
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
window.EVENTS_DATA = [
  {
    title: "PD: Resume Workshop",
    date: "Sept 5th",
    time: "6:00 PM",
    location: "Mason Hall, Rm 3356"
  },
  {
    title: "Corporate Mixer", 
    date: "Sept 7th",
    time: "TBD",
    location: "GG Brown Building"
  },
  {
    title: "Networking Social",
    date: "Sept 8th", 
    time: "TBD",
    location: "Trotter"
  },
  {
    title: "GBM w/ Ford",
    date: "Sept 12th",
    time: "5:30 PM", 
    location: "IOE 1610"
  }
];

// Announcements data
window.ANNOUNCEMENTS_DATA = [
  { title: "Pay NSBE Dues", url: "https://mynsbe.nsbe.org/s/joinprocess" },
  { title: "Conference Info", url: "https://convention.nsbe.org/" },
  { title: "Scholarship Opportunities", url: "https://nsbe.org/scholarships/" },
  { title: "Resume Book", url: "https://docs.google.com/forms/d/e/1FAIpQLSfsQfpp76QkK9HdEAi0DQJftrnV3r1Gv8PsLmIJlLHIQVYnKA/viewform" },
  { title: "Mentorship Sign-ups", url: "#" },
  { title: "Committee Applications", url: "#" },
  { title: "Collab with NSBEUM!", url: "#" }
];

// Tier definitions
window.TIER_DEFINITIONS = [
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
window.POINT_SYSTEM = [
  { activity: '📚 PD & Mentoring', points: '+10 pts' },
  { activity: '🎉 General Attendance', points: '+7 pts' },
  { activity: '🎯 P or M-Zone', points: '+5 pts' },
  { activity: '🏆 Convention', points: '+15 pts' },
  { activity: '👥 Referral', points: '+3 pts' }
];

// Badges configuration
window.BADGES_CONFIG = [
  { name: 'PARTICIPANT', color: 'from-blue-500 to-blue-700', active: true, textColor: 'text-white', border: '#3b82f6' },
  { name: 'BRONZE', color: 'from-yellow-600 to-orange-700', active: true, textColor: 'text-white', border: '#d97706' },
  { name: 'SILVER', color: 'from-gray-300 to-gray-500', active: true, textColor: 'text-black', border: '#6b7280' },
  { name: 'GOLD', color: 'from-yellow-400 to-yellow-600', active: false, textColor: 'text-black', border: '#fbbf24' }
];

// Contact information
window.CONTACT_INFO = [
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
