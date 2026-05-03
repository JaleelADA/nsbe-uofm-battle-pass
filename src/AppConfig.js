window.APP_CONFIG = {
  closedSeason: {
    enabled: true,
    schoolYear: '2025-26',
    headline: 'Battle Pass Closed',
    message: 'The NSBE UofM Battle Pass is closed for the school year. Points, event sign-ins, and live leaderboard updates are no longer active.',
    nextSeasonMessage: 'We will reopen with a fresh board when the next school year starts.',
    archiveUrl: './data/FALL_2025_FINAL_LEADERBOARD.csv'
  },
  dataSource: 'auto',
  supabase: {
    enabled: false,
    url: '',
    anonKey: '',
    schema: 'public',
    attendanceTable: 'attendance_logs',
    membersTable: 'members',
    realtimeTables: ['attendance_logs', 'members']
  }
};
