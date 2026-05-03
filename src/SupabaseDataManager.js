window.SupabaseDataManager = (() => {
  let supabaseClient = null;
  let realtimeChannel = null;

  function getAppConfig() {
    const defaultConfig = {
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

    if (!window.APP_CONFIG) {
      return defaultConfig;
    }

    return {
      ...defaultConfig,
      ...window.APP_CONFIG,
      supabase: {
        ...defaultConfig.supabase,
        ...(window.APP_CONFIG.supabase || {})
      }
    };
  }

  function getSupabaseLibrary() {
    return window.supabase || null;
  }

  function isConfigured() {
    const config = getAppConfig();
    const supabase = getSupabaseLibrary();

    return Boolean(
      config.supabase.enabled &&
      config.supabase.url &&
      config.supabase.anonKey &&
      supabase &&
      typeof supabase.createClient === 'function'
    );
  }

  function shouldUseSupabase() {
    const config = getAppConfig();

    if (config.dataSource === 'supabase') {
      return isConfigured();
    }

    if (config.dataSource === 'google-sheets') {
      return false;
    }

    return isConfigured();
  }

  function getClient() {
    if (!shouldUseSupabase()) {
      return null;
    }

    if (supabaseClient) {
      return supabaseClient;
    }

    const config = getAppConfig();
    const supabase = getSupabaseLibrary();

    supabaseClient = supabase.createClient(config.supabase.url, config.supabase.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });

    return supabaseClient;
  }

  function getConnectionLabel() {
    const config = getAppConfig();

    if (shouldUseSupabase()) {
      return 'supabase';
    }

    if (config.dataSource === 'supabase') {
      return 'supabase-not-configured';
    }

    return 'google-sheets';
  }

  function normalizeAttendanceRow(row) {
    const uniqname = (row.uniqname || row.member_uniqname || row.uniq || '').toString().trim();
    const emailValue = (row.email || row.member_email || '').toString().trim().toLowerCase();
    const derivedEmail = uniqname ? `${uniqname.toLowerCase()}@umich.edu` : '';
    const email = emailValue || derivedEmail;
    const fullName = (row.full_name || row.display_name || row.name || '').toString().trim();
    const event = (
      row.event ||
      row.event_name ||
      row.event_type ||
      row.event_category ||
      row.category ||
      ''
    ).toString().trim();

    const timestamp = (
      row.timestamp ||
      row.attended_at ||
      row.event_timestamp ||
      row.created_at ||
      ''
    ).toString().trim();

    const broughtFriend = Boolean(row.brought_friend);
    const friendCount = Number.isFinite(Number(row.friend_count)) ? Number(row.friend_count) : 0;
    const nationalDues = (
      row.paid_national_dues ||
      row.national_dues ||
      row.national_dues_status ||
      ''
    ).toString().trim();

    return {
      Uniqname: uniqname,
      'Email Address': email,
      'Full Name': fullName,
      Event: event,
      Timestamp: timestamp,
      Major: (row.major || '').toString().trim(),
      Year: (row.year || '').toString().trim(),
      'Did you bring a friend?': broughtFriend ? 'Yes' : 'No',
      'How many (Enter a Number Only, e.g.1,2,3 etc.)': friendCount,
      'Paid National Dues? (Note this due is separate from the chapter dues and required for conferences & scholarships)': nationalDues
    };
  }

  function normalizeMemberRow(row) {
    const uniqname = (row.uniqname || row.member_uniqname || '').toString().trim().toLowerCase();
    const emailValue = (row.email || '').toString().trim().toLowerCase();
    const email = emailValue || (uniqname ? `${uniqname}@umich.edu` : '');

    return {
      uniqname,
      email,
      display_name: (row.display_name || row.full_name || row.name || uniqname).toString().trim(),
      Major: (row.major || '').toString().trim(),
      Year: (row.year || '').toString().trim(),
      'National Dues': (row.national_dues || row.national_dues_status || '').toString().trim(),
      is_paid: Boolean(row.is_paid)
    };
  }

  async function fetchAttendanceData() {
    const client = getClient();
    const config = getAppConfig();

    if (!client) {
      return [];
    }

    const { data, error } = await client
      .from(config.supabase.attendanceTable)
      .select('*')
      .order('attended_at', { ascending: false })
      .limit(5000);

    if (error) {
      throw error;
    }

    return (data || []).map(normalizeAttendanceRow).filter(entry => entry.Uniqname || entry['Email Address']);
  }

  async function fetchMembersData() {
    const client = getClient();
    const config = getAppConfig();

    if (!client) {
      return [];
    }

    const { data, error } = await client
      .from(config.supabase.membersTable)
      .select('*')
      .limit(5000);

    if (error) {
      throw error;
    }

    return (data || []).map(normalizeMemberRow).filter(entry => entry.email || entry.uniqname);
  }

  function subscribeToLeaderboardChanges(onChange) {
    const client = getClient();
    const config = getAppConfig();

    if (!client || typeof onChange !== 'function') {
      return () => {};
    }

    if (realtimeChannel) {
      client.removeChannel(realtimeChannel);
      realtimeChannel = null;
    }

    realtimeChannel = client.channel('battle-pass-leaderboard');

    const realtimeTables = Array.isArray(config.supabase.realtimeTables) && config.supabase.realtimeTables.length > 0
      ? config.supabase.realtimeTables
      : [config.supabase.attendanceTable, config.supabase.membersTable];

    realtimeTables.forEach((table) => {
      realtimeChannel.on(
        'postgres_changes',
        { event: '*', schema: config.supabase.schema, table },
        () => onChange()
      );
    });

    realtimeChannel.subscribe();

    return () => {
      if (realtimeChannel) {
        client.removeChannel(realtimeChannel);
        realtimeChannel = null;
      }
    };
  }

  return {
    getClient,
    getConnectionLabel,
    fetchAttendanceData,
    fetchMembersData,
    isConfigured,
    shouldUseSupabase,
    subscribeToLeaderboardChanges
  };
})();
