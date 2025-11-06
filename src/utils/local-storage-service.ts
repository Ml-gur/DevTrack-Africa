// ⚠️ DEPRECATED - This file has been removed to maintain online-only functionality
// DevTrack Africa now operates exclusively with Supabase cloud storage
// 
// If you're looking for data operations, use:
// - supabaseService from './supabase/database-service'
// - SupabaseAuthContext from '../contexts/SupabaseAuthContext'
//
// This file is kept as placeholder to prevent import errors during cleanup

console.warn('⚠️ LOCAL STORAGE SERVICE DEPRECATED - Use Supabase services only');

export const localStorageService = null;
export const STORAGE_KEYS = null;

// Throw error if anyone tries to use this
export default {
  get: () => { throw new Error('Local storage disabled - use Supabase only') },
  set: () => { throw new Error('Local storage disabled - use Supabase only') }
};