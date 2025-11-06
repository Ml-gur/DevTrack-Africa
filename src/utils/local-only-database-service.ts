// Local-only database service - no external connections
import { localDatabase } from './local-storage-database'

export class LocalOnlyDatabaseService {
  // Connection test - always succeeds for local storage
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // Test localStorage availability
      const testKey = 'devtrack_connection_test'
      localStorage.setItem(testKey, 'test')
      const value = localStorage.getItem(testKey)
      localStorage.removeItem(testKey)
      
      if (value === 'test') {
        return { 
          success: true, 
          message: 'Local storage is available and working correctly' 
        }
      } else {
        return { 
          success: false, 
          message: 'Local storage test failed' 
        }
      }
    } catch (error) {
      return { 
        success: false, 
        message: 'Local storage is not available in this browser' 
      }
    }
  }

  // Initialize demo data for a user
  async initializeDemoData(userId: string): Promise<void> {
    try {
      await localDatabase.initializeDemoData(userId)
      console.log('✅ Demo data initialized successfully for user:', userId)
    } catch (error) {
      console.error('❌ Failed to initialize demo data:', error)
      throw error
    }
  }

  // Get connection status - always returns 'connected' for local storage
  getConnectionStatus(): 'connected' | 'disconnected' | 'error' {
    try {
      // Test if localStorage is available
      localStorage.setItem('test', 'test')
      localStorage.removeItem('test')
      return 'connected'
    } catch {
      return 'error'
    }
  }

  // Check if database is available - always true for local storage
  async isAvailable(): Promise<boolean> {
    return true
  }

  // Get database info
  getDatabaseInfo(): { type: string; status: string; message: string } {
    return {
      type: 'Local Storage',
      status: 'active',
      message: 'Using browser local storage for data persistence'
    }
  }
}

// Export singleton instance
export const localOnlyDatabaseService = new LocalOnlyDatabaseService()

// Export for compatibility with existing code
export const databaseService = localOnlyDatabaseService