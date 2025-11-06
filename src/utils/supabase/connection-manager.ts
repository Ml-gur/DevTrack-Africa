// DEPRECATED: All Supabase connections have been replaced with local storage
// Local storage doesn't require connection management

export type DatabaseAvailability = 'available' | 'unavailable' | 'checking';

export const connectionManager = {
  async checkConnection() {
    console.warn('⚠️ connectionManager is deprecated. Local storage is always available.');
    return { status: 'connected', message: 'Local storage is available' };
  },
  
  async reconnect() {
    console.warn('⚠️ connectionManager.reconnect is deprecated. Local storage doesn\'t need reconnection.');
    return true;
  }
};

export const supabaseDatabaseManager = {
  async isAvailable(): Promise<boolean> {
    console.warn('⚠️ supabaseDatabaseManager is deprecated. Local storage is always available.');
    return true;
  },
  
  getAvailability(): DatabaseAvailability {
    console.warn('⚠️ supabaseDatabaseManager.getAvailability is deprecated. Local storage is always available.');
    return 'available';
  },
  
  async forceCheck(): Promise<boolean> {
    console.warn('⚠️ supabaseDatabaseManager.forceCheck is deprecated. Local storage is always available.');
    return true;
  }
};