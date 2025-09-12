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
    title: "GBM w/ Ford",
    date: "Sept 12th",
    time: "5:30 PM", 
    location: "IOE 1610"
  },
  {
    title: "Golfing with Ford", 
    date: "Sept 18th",
    time: "5 - 7:30pm",
    location: "Indian Trails Golf Center"
  },
  {
    title: "Study Jamz",
    date: "Sept 22th", 
    time: "5:30 - 8pm",
    location: "LSA BLDG 3254"
  },
  {
    title: "Mentorship Mixer",
    date: "Sept 23rd",
    time: "5:30 PM", 
    location: "TBA"
  }
];

// Announcements data
window.ANNOUNCEMENTS_DATA = [
  { title: "📝 Sign In to Events", url: "https://docs.google.com/forms/d/e/1FAIpQLSe81BszYqfzLxpaZn-CyBaP3YnPuktAYRMHh517p5kwQ5Qg0Q/viewform?usp=header" },
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
  { activity: '🤝 Community Service', points: '+5 pts' },
  { activity: '👫 Bring a Friend', points: '+3 (first), +1 per extra' }
];

// Badges configuration - Legacy static badges for dashboard
window.BADGES_CONFIG = [
  { name: 'PARTICIPANT', color: 'from-blue-500 to-blue-700', active: true, textColor: 'text-white', border: '#3b82f6' },
  { name: 'BRONZE', color: 'from-yellow-600 to-orange-700', active: true, textColor: 'text-white', border: '#d97706' },
  { name: 'SILVER', color: 'from-gray-300 to-gray-500', active: true, textColor: 'text-black', border: '#6b7280' },
  { name: 'GOLD', color: 'from-yellow-400 to-yellow-600', active: false, textColor: 'text-black', border: '#fbbf24' }
];

// New Trackable Badges Configuration for MentorshipHub
window.TRACKABLE_BADGES_CONFIG = [
  // Membership Status Badges
  { 
    id: 'paid_member', 
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
  
  // Event Attendance Badges  
  { 
    id: 'first_event', 
    name: 'First Steps', 
    icon: '🌟', 
    color: '#10b981', 
    glow: 'rgba(16, 185, 129, 0.5)', 
    desc: 'Attend Your First Event', 
    xp: 15, 
    category: 'engagement', 
    type: 'count',
    requirement: { field: 'total_events', value: 1 }
  },
  { 
    id: 'gbm_regular', 
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
    id: 'pd_champion', 
    name: 'PD Champion', 
    icon: '🚀', 
    color: '#f59e0b', 
    glow: 'rgba(245, 158, 11, 0.5)', 
    desc: 'Attend 5 Professional Development Events', 
    xp: 35, 
    category: 'pzone', 
    type: 'count',
    requirement: { field: 'Professional Development', value: 5 }
  },
  { 
    id: 'mentor_master', 
    name: 'Mentor Master', 
    icon: '🔥', 
    color: '#ef4444', 
    glow: 'rgba(239, 68, 68, 0.5)', 
    desc: 'Attend 3 Mentorship Events', 
    xp: 30, 
    category: 'nsbe', 
    type: 'count',
    requirement: { field: 'Mentorship Events', value: 3 }
  },
  { 
    id: 'volunteer_hero', 
    name: 'Volunteer Hero', 
    icon: '🤝', 
    color: '#06b6d4', 
    glow: 'rgba(6, 182, 212, 0.5)', 
    desc: 'Complete 2 Community Service Events', 
    xp: 25, 
    category: 'engagement', 
    type: 'count',
    requirement: { field: 'Community Service', value: 2 }
  },
  { 
    id: 'convention_attendee', 
    name: 'Convention Explorer', 
    icon: '✈️', 
    color: '#ec4899', 
    glow: 'rgba(236, 72, 153, 0.5)', 
    desc: 'Attend Regional/National Convention', 
    xp: 50, 
    category: 'nsbe', 
    type: 'count',
    requirement: { field: 'Convention Attendance', value: 1 }
  },
  
  // Point Milestone Badges
  { 
    id: 'bronze_tier', 
    name: 'Bronze Achiever', 
    icon: '🥉', 
    color: '#cd7f32', 
    glow: 'rgba(205, 127, 50, 0.5)', 
    desc: 'Earn 35+ Points', 
    xp: 20, 
    category: 'achievement', 
    type: 'points',
    requirement: { field: 'total_points', value: 35 }
  },
  { 
    id: 'silver_tier', 
    name: 'Silver Star', 
    icon: '🥈', 
    color: '#c0c0c0', 
    glow: 'rgba(192, 192, 192, 0.5)', 
    desc: 'Earn 75+ Points', 
    xp: 30, 
    category: 'achievement', 
    type: 'points',
    requirement: { field: 'total_points', value: 75 }
  },
  { 
    id: 'gold_tier', 
    name: 'Gold Legend', 
    icon: '🥇', 
    color: '#ffd700', 
    glow: 'rgba(255, 215, 0, 0.5)', 
    desc: 'Earn 150+ Points', 
    xp: 50, 
    category: 'achievement', 
    type: 'points',
    requirement: { field: 'total_points', value: 150 }
  },
  
  // Social Impact Badges
  { 
    id: 'friend_recruiter', 
    name: 'Friend Recruiter', 
    icon: '👥', 
    color: '#84cc16', 
    glow: 'rgba(132, 204, 22, 0.5)', 
    desc: 'Bring 3 Friends to Events', 
    xp: 20, 
    category: 'engagement', 
    type: 'count',
    requirement: { field: 'friends_brought', value: 3 }
  },
  { 
    id: 'consistent_contributor', 
    name: 'Consistent Contributor', 
    icon: '⚡', 
    color: '#a855f7', 
    glow: 'rgba(168, 85, 247, 0.5)', 
    desc: 'Attend Events in 3 Different Categories', 
    xp: 40, 
    category: 'engagement', 
    type: 'variety',
    requirement: { field: 'event_categories', value: 3 }
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
