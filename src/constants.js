// Centralized shared constants for the NSBE battle pass application.
//
// These values were originally defined in the monolithic app‑optimized file.  
// Breaking them out into their own module makes it easier to see what external
// configuration is required and allows other modules to import just what
// they need without dragging in the entire application.  

// Google Sheets configuration
export const SHEET_CONFIG = {
  SHEET_ID: '1EkyzaNjTQ-5sKvqex5SnTTJ6SCdq-WYIJ_Y_wU34JIU',
  // When referencing the sheet URL throughout the app, use this helper
  // instead of hard coding a string. It avoids repeating the ID and
  // consolidates knowledge of the sheet structure in one place.
  get SHEET_URL() {
    return `https://docs.google.com/spreadsheets/d/${this.SHEET_ID}/edit#gid=0`;
  }
};

// External documentation links for the user. Each entry contains a title and
// a URL to a Google Doc. These are referenced in the UI when rendering
// documentation sections.
export const DOCUMENTATION_LINKS = [
  {
    title: 'Point System Overview',
    url: 'https://docs.google.com/document/d/1KNJ2CdsHd_fytD1nkW5MPc2LrK17E9LwsHBcc9r0ZXA/edit?usp=sharing'
  },
  {
    title: 'Battle Pass FAQs',
    url: 'https://docs.google.com/document/d/1Ss6W_MWxAeWA_UB8k2aZE67oa5kc4bTCWBI3B4Kvit8/edit?usp=sharing'
  },
  {
    title: 'Battle Pass Guide',
    url: 'https://docs.google.com/document/d/1k3yd2x2q0Th0Wo3jQKbvrSCagguMuAmpKG2ARvOVqAg/edit?usp=sharing'
  }
];

// A simple list of upcoming events. Each object defines the title, date,
// time and location used in the events carousel on the home page.
export const EVENTS_DATA = [
  {
    title: 'PD: Resume Workshop',
    date: 'Sept 5th',
    time: '6:00 PM',
    location: 'Mason Hall, Rm 3356'
  },
  {
    title: 'Corporate Mixer',
    date: 'Sept 7th',
    time: 'TBD',
    location: 'GG Brown Building'
  },
  {
    title: 'Networking Social',
    date: 'Sept 8th',
    time: 'TBD',
    location: 'Trotter'
  },
  {
    title: 'GBM w/ Ford',
    date: 'Sept 12th',
    time: '5:30 PM',
    location: 'IOE 1610'
  }
];
