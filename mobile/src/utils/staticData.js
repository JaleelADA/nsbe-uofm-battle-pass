// Static data for the mobile app

export const EVENTS_DATA = [
  {
    id: 1,
    title: "Workshop: Resume + LinkedIn",
    date: "Jul 10",
    time: "6:00 PM",
    location: "Duderstadt Center, Rm 1200"
  },
  {
    id: 2,
    title: "GBM: Mock Interview Night", 
    date: "Jul 14",
    time: "7:00 PM",
    location: "EECS Bldg, Rm 3110"
  },
  {
    id: 3,
    title: "Networking Social",
    date: "Jul 18", 
    time: "5:30 PM",
    location: "North Quad Lounge"
  },
  {
    id: 4,
    title: "Industry Panel",
    date: "Jul 22",
    time: "6:30 PM", 
    location: "NSBE Alumni career paths discussion"
  }
];

export const ANNOUNCEMENTS_DATA = [
  { 
    id: 1,
    title: "Pay NSBE Dues", 
    url: "https://mynsbe.nsbe.org/s/joinprocess" 
  },
  { 
    id: 2,
    title: "Conference Info", 
    url: "https://convention.nsbe.org/" 
  },
  { 
    id: 3,
    title: "Scholarship Opportunities", 
    url: "https://nsbe.org/scholarships/" 
  },
  { 
    id: 4,
    title: "Resume Book", 
    url: "https://docs.google.com/forms/d/e/1FAIpQLSfsQfpp76QkK9HdEAi0DQJftrnV3r1Gv8PsLmIJlLHIQVYnKA/viewform" 
  },
  { 
    id: 5,
    title: "Mentorship Sign-ups", 
    url: "#" 
  },
  { 
    id: 6,
    title: "Committee Applications", 
    url: "#" 
  },
  { 
    id: 7,
    title: "Collab with NSBEUM!", 
    url: "#" 
  }
];

export const TIER_DEFINITIONS = [
  { 
    tier: 'GOLD', 
    range: 'Top 25%', 
    desc: 'NSBE Elite! Priority Conference RSVP, GBM shoutouts.', 
    bg: ['#ffd700', '#ffa500'], 
    color: '#000', 
    icon: '🥇' 
  },
  { 
    tier: 'SILVER', 
    range: '25–50%', 
    desc: 'Consistent contributors. Prize raffles, mentorship perks, Free NSBE Swag.', 
    bg: ['#c0c0c0', '#a0a0a0'], 
    color: '#000', 
    icon: '🥈' 
  },
  { 
    tier: 'BRONZE', 
    range: '50–75%', 
    desc: 'Active participants. Early invites to NSBE events.', 
    bg: ['#cd7f32', '#b8860b'], 
    color: '#fff', 
    icon: '🥉' 
  },
  { 
    tier: 'PARTICIPANT', 
    range: 'Below 75%', 
    desc: 'You\'re on the board! Keep showing up to level up.', 
    bg: ['#3b82f6', '#1d4ed8'], 
    color: '#fff', 
    icon: '🏅' 
  }
];

export const POINT_SYSTEM = [
  { id: 1, activity: '📚 PD & Mentoring', points: '+10 pts' },
  { id: 2, activity: '🎉 General Attendance', points: '+7 pts' },
  { id: 3, activity: '🎯 P or M-Zone', points: '+5 pts' },
  { id: 4, activity: '🏆 Convention', points: '+15 pts' },
  { id: 5, activity: '👥 Referral', points: '+3 pts' }
];

export const BADGES_CONFIG = [
  { 
    name: 'PARTICIPANT', 
    colors: ['#3b82f6', '#1d4ed8'], 
    active: true, 
    textColor: '#ffffff', 
    border: '#3b82f6' 
  },
  { 
    name: 'BRONZE', 
    colors: ['#d97706', '#92400e'], 
    active: true, 
    textColor: '#ffffff', 
    border: '#d97706' 
  },
  { 
    name: 'SILVER', 
    colors: ['#9ca3af', '#6b7280'], 
    active: true, 
    textColor: '#000000', 
    border: '#6b7280' 
  },
  { 
    name: 'GOLD', 
    colors: ['#fbbf24', '#f59e0b'], 
    active: false, 
    textColor: '#000000', 
    border: '#fbbf24' 
  }
];

export const CONTACT_INFO = [
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
    type: "Website",
    label: "NSBE UofM",
    url: "https://maizepages.umich.edu/organization/nsbe"
  }
];

export const DOCUMENTATION_LINKS = [
  {
    id: 1,
    title: "Point System Overview",
    url: "https://docs.google.com/document/d/1KNJ2CdsHd_fytD1nkW5MPc2LrK17E9LwsHBcc9r0ZXA/edit?usp=sharing"
  },
  {
    id: 2,
    title: "Battle Pass FAQs", 
    url: "https://docs.google.com/document/d/1Ss6W_MWxAeWA_UB8k2aZE67oa5kc4bTCWBI3B4Kvit8/edit?usp=sharing"
  },
  {
    id: 3,
    title: "Battle Pass Guide",
    url: "https://docs.google.com/document/d/1k3yd2x2q0Th0Wo3jQKbvrSCagguMuAmpKG2ARvOVqAg/edit?usp=sharing"
  }
];