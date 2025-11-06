// DEPRECATED: All Supabase functionality has been replaced with local storage
// Use /utils/local-storage-database.ts instead

export const supabase = null;
export const createClient = () => {
  throw new Error('Supabase client is deprecated. Use localDatabase from /utils/local-storage-database.ts instead.');
};

export default null;