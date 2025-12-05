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
    title: "Study Jamz",
    date: "Sept 29th",
    time: "5 - 8 PM", 
    location: "MH 1448"
  },
  {
    title: "Grad School Declassified w/ GSBES", 
    date: "Sept 30th",
    time: "5:30 - 7pm",
    location: "1005 DOW"
  },
  {
    title: "Mentorship Kickoff: The Estimathon",
    date: "Oct 1st", 
    time: "6:00 - 7:30pm",
    location: "MH 1448"
  },
  {
    title: "Study Jamz",
    date: "Oct 6th",
    time: "5 - 8 PM", 
    location: "Trotter"
  }
];

// Announcements data
window.ANNOUNCEMENTS_DATA = [
  { title: "📝 Sign In to Events", url: "https://docs.google.com/forms/d/e/1FAIpQLSfXgbgogJ_yIhwgmjH6N--WQLRF2ewLf7KkJZTQSCndZCaiNQ/viewform?usp=share_link&ouid=105119752436265794522" },
  { title: "💳 Pay NSBE Dues", url: "https://mynsbe.nsbe.org/s/joinprocess" },
  { title: "🏆 Conference Info", url: "https://convention.nsbe.org/" },
  { title: "💰 Scholarship Opportunities", url: "https://nsbe.org/scholarships/" },
  { title: "📄 Resume Book", url: "https://docs.google.com/forms/d/e/1FAIpQLSfQgLB--SZ40hznFcCxUTUbAyz_dWQB4klCIvaZDPD29ibnLg/viewform?usp=header" },
  { title: "📋 Committee Applications", url: "https://forms.gle/yR66CddtQbMK4FZV8" },
  { title: "🏅 JEB Application", url: "https://docs.google.com/forms/d/e/1FAIpQLSeG1fifIlWu3M5S9OijspVQZ1IL2xycFHe-XGJ44RV0eMbsAg/viewform?usp=share_link&ouid=105119752436265794522" },
  { title: "🤝 Collab with NSBEUM!", url: "https://docs.google.com/forms/d/e/1FAIpQLSdVzBy08R3Ex8FMrmlJQ1uCq-TJdHzwr_wGk0cvxztrTL_6ng/viewform?usp=share_link&ouid=105119752436265794522" }
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
  { activity: '🏛️ General Body Meeting (GBM)', points: '+7 pts' },
  { activity: '🎉 Social Events', points: '+7 pts' },
  { activity: '📚 Professional Development', points: '+10 pts' },
  { activity: '👥 Mentorship Program', points: '+10 pts' },
  { activity: '🤝 Mentorship Events', points: '+7 pts' },
  { activity: '⚡ P-Zone / M-Zone', points: '+5 pts' },
  { activity: '🏆 Convention Attendance', points: '+15 pts' },
  { activity: '🤝 Community Service', points: '+5 pts' }
];

// Badges configuration - Legacy static badges for dashboard
window.BADGES_CONFIG = [
  { name: 'PARTICIPANT', color: 'from-blue-500 to-blue-700', active: true, textColor: 'text-white', border: '#3b82f6' },
  { name: 'BRONZE', color: 'from-yellow-600 to-orange-700', active: true, textColor: 'text-white', border: '#d97706' },
  { name: 'SILVER', color: 'from-gray-300 to-gray-500', active: true, textColor: 'text-black', border: '#6b7280' },
  { name: 'GOLD', color: 'from-yellow-400 to-yellow-600', active: false, textColor: 'text-black', border: '#fbbf24' }
];

// Trackable Badges Configuration - Realistic semester achievements
window.TRACKABLE_BADGES_CONFIG = [
  // Membership Status
  { 
    id: 'paid-member', 
    name: 'Paid Member', 
    icon: '💎', 
    color: '#3b82f6', 
    glow: 'rgba(59, 130, 246, 0.5)', 
    desc: 'Active Paid NSBE Member', 
    xp: 50, 
    category: 'membership', 
    type: 'status',
    requirement: 'paid_status'
  },
  
  // GBM Attendance
  { 
    id: 'gbm-starter', 
    name: 'GBM Starter', 
    icon: '🌟', 
    color: '#10b981', 
    glow: 'rgba(16, 185, 129, 0.5)', 
    desc: 'Attend Your First GBM', 
    xp: 15, 
    category: 'engagement', 
    type: 'count',
    requirement: { field: 'GBM', value: 1 }
  },
  { 
    id: 'gbm-regular', 
    name: 'GBM Regular', 
    icon: '📅', 
    color: '#8b5cf6', 
    glow: 'rgba(139, 92, 246, 0.5)', 
    desc: 'Attend 3 GBMs', 
    xp: 25, 
    category: 'engagement', 
    type: 'count',
    requirement: { field: 'GBM', value: 3 }
  },
  { 
    id: 'gbm-champion', 
    name: 'GBM Champion', 
    icon: '👑', 
    color: '#f59e0b', 
    glow: 'rgba(245, 158, 11, 0.5)', 
    desc: 'Attend All Semester GBMs (5+)', 
    xp: 50, 
    category: 'engagement', 
    type: 'count',
    requirement: { field: 'GBM', value: 5 }
  },
  
  // Professional Development
  { 
    id: 'pd-explorer', 
    name: 'PD Explorer', 
    icon: '🚀', 
    color: '#06b6d4', 
    glow: 'rgba(6, 182, 212, 0.5)', 
    desc: 'Attend 3 Professional Development Events', 
    xp: 35, 
    category: 'professional', 
    type: 'count',
    requirement: { field: 'Professional Development', value: 3 }
  },
  { 
    id: 'pd-master', 
    name: 'PD Master', 
    icon: '🎯', 
    color: '#8b5cf6', 
    glow: 'rgba(139, 92, 246, 0.5)', 
    desc: 'Attend 5+ Professional Development Events', 
    xp: 60, 
    category: 'professional', 
    type: 'count',
    requirement: { field: 'Professional Development', value: 5 }
  },
  
  // Conference and Major Events
  { 
    id: 'conference-attendee', 
    name: 'Conference Attendee', 
    icon: '🏆', 
    color: '#dc2626', 
    glow: 'rgba(220, 38, 38, 0.5)', 
    desc: 'Attend Regional/National Convention', 
    xp: 75, 
    category: 'achievement', 
    type: 'count',
    requirement: { field: 'Convention Attendance', value: 1 }
  },
  
  // Community and Service
  { 
    id: 'community-helper', 
    name: 'Community Helper', 
    icon: '🤝', 
    color: '#16a34a', 
    glow: 'rgba(22, 163, 74, 0.5)', 
    desc: 'Complete 2 Community Service Events', 
    xp: 25, 
    category: 'service', 
    type: 'count',
    requirement: { field: 'Community Service', value: 2 }
  },
  
  // Social Engagement
  { 
    id: 'social-connector', 
    name: 'Social Connector', 
    icon: '🎉', 
    color: '#ec4899', 
    glow: 'rgba(236, 72, 153, 0.5)', 
    desc: 'Attend 3 Social Events', 
    xp: 20, 
    category: 'social', 
    type: 'count',
    requirement: { field: 'Social Events', value: 3 }
  },
  
  // Academic Excellence
  { 
    id: 'study-warrior', 
    name: 'Study Warrior', 
    icon: '📚', 
    color: '#7c3aed', 
    glow: 'rgba(124, 58, 237, 0.5)', 
    desc: 'Attend 5 P-Zone Study Sessions', 
    xp: 25, 
    category: 'academic', 
    type: 'count',
    requirement: { field: 'P-Zone', value: 5 }
  },
  
  // Mentorship
  { 
    id: 'mentorship-seeker', 
    name: 'Mentorship Seeker', 
    icon: '🌱', 
    color: '#0891b2', 
    glow: 'rgba(8, 145, 178, 0.5)', 
    desc: 'Attend 2 Mentorship Events', 
    xp: 30, 
    category: 'mentorship', 
    type: 'count',
    requirement: { field: 'Mentorship Events', value: 2 }
  },
  
  // Leadership and Participation
  { 
    id: 'consistent-member', 
    name: 'Consistent Member', 
    icon: '⚡', 
    color: '#f59e0b', 
    glow: 'rgba(245, 158, 11, 0.5)', 
    desc: 'Attend 4 Different Event Types', 
    xp: 35, 
    category: 'achievement', 
    type: 'variety',
    requirement: { field: 'event_categories', value: 4 }
  },
  { 
    id: 'super-member', 
    name: 'Super Member', 
    icon: '🔥', 
    color: '#dc2626', 
    glow: 'rgba(220, 38, 38, 0.5)', 
    desc: 'Attend 15+ Events Total', 
    xp: 75, 
    category: 'achievement', 
    type: 'count',
    requirement: { field: 'total_events', value: 15 }
  }
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
