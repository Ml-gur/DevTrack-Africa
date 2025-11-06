// ⚠️ DEPRECATED - Firebase connection manager deprecated in favor of Supabase
// Use Supabase connection manager from '/utils/supabase/connection-manager.ts' instead

console.warn('⚠️ FIREBASE CONNECTION MANAGER DEPRECATED - Use Supabase connection manager instead');

export class FirebaseConnectionManager {
  constructor() {
    throw new Error('FirebaseConnectionManager deprecated - use Supabase connection manager');
  }
}

export const firebaseConnectionManager = null;
export default null;