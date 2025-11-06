// ⚠️ DEPRECATED - This file has been removed to maintain online-only functionality
// DevTrack Africa now requires Supabase connection - no offline fallbacks
// 
// For connection testing, use:
// - supabaseService.testConnection() from './supabase/database-service'
//
// This file is kept as placeholder to prevent import errors during cleanup

console.warn('⚠️ DATABASE AVAILABILITY MANAGER DEPRECATED - No offline fallbacks');

export type DatabaseAvailability = 'available' | 'unavailable';

// Simplified manager that only works online
class OnlineOnlyDatabaseManager {
  async isAvailable(): Promise<boolean> {
    throw new Error('Use supabaseService.testConnection() instead');
  }

  getAvailability(): DatabaseAvailability {
    return 'unavailable';
  }

  markUnavailable(): void {
    console.warn('Database availability manager deprecated');
  }

  markAvailable(): void {
    console.warn('Database availability manager deprecated');
  }
}

export const databaseManager = new OnlineOnlyDatabaseManager();

export const withDatabaseCheck = async <T>(
  operation: () => Promise<T>,
  fallback: T
): Promise<T> => {
  throw new Error('withDatabaseCheck deprecated - use direct Supabase operations');
};

export const isDatabaseAvailable = (): boolean => {
  throw new Error('isDatabaseAvailable deprecated - use supabaseService.testConnection()');
};

export const waitForDatabaseCheck = async (): Promise<boolean> => {
  throw new Error('waitForDatabaseCheck deprecated - use supabaseService.testConnection()');
};