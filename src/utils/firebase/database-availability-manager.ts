// ⚠️ DEPRECATED - Firebase database availability manager deprecated in favor of Supabase
// Use Supabase service testConnection() method instead

console.warn('⚠️ FIREBASE DATABASE AVAILABILITY MANAGER DEPRECATED - Use Supabase service instead');

export class FirebaseDatabaseManager {
  constructor() {
    throw new Error('FirebaseDatabaseManager deprecated - use supabaseService.testConnection()');
  }
}

export const firebaseDatabaseManager = null;
export default null;