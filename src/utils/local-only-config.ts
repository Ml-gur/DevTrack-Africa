// Local-only configuration - replaces all Supabase dependencies

export const LOCAL_CONFIG = {
  STORAGE_PREFIX: 'devtrack_',
  APP_NAME: 'DevTrack Africa',
  APP_VERSION: '1.0.0',
  DEMO_USER: {
    email: 'demo@devtrack.africa',
    password: 'demo123',
    fullName: 'Demo User',
    username: 'demo_user'
  }
};

// Replace hasSupabaseConfig check
export const hasLocalConfig = (): boolean => {
  try {
    // Always return true for local storage mode
    return typeof localStorage !== 'undefined';
  } catch {
    return false;
  }
};

// Export for compatibility with existing code
export const hasSupabaseConfig = hasLocalConfig;