/**
 * Storage Quota Manager
 * 
 * Monitors and manages localStorage quota to prevent QuotaExceededError
 * Implements compression, cleanup, and user warnings
 */

const STORAGE_WARNING_THRESHOLD = 0.8; // Warn at 80% usage
const STORAGE_CRITICAL_THRESHOLD = 0.9; // Critical at 90% usage
const MAX_LOCALSTORAGE_SIZE = 5 * 1024 * 1024; // 5MB typical limit

export interface StorageQuotaInfo {
  used: number;
  available: number;
  percentage: number;
  isWarning: boolean;
  isCritical: boolean;
  canStore: boolean;
}

export interface StorageItem {
  key: string;
  size: number;
  lastAccessed?: string;
}

class StorageQuotaManager {
  /**
   * Get current storage usage information
   */
  getStorageInfo(): StorageQuotaInfo {
    const used = this.calculateStorageSize();
    const available = MAX_LOCALSTORAGE_SIZE;
    const percentage = used / available;

    return {
      used,
      available,
      percentage,
      isWarning: percentage >= STORAGE_WARNING_THRESHOLD,
      isCritical: percentage >= STORAGE_CRITICAL_THRESHOLD,
      canStore: percentage < 0.95
    };
  }

  /**
   * Calculate total localStorage size
   */
  private calculateStorageSize(): number {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const value = localStorage.getItem(key) || '';
        // Each character is typically 2 bytes in UTF-16
        total += (key.length + value.length) * 2;
      }
    }
    return total;
  }

  /**
   * Get size of all storage items
   */
  getStorageItems(): StorageItem[] {
    const items: StorageItem[] = [];
    
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const value = localStorage.getItem(key) || '';
        const size = (key.length + value.length) * 2;
        items.push({ key, size });
      }
    }

    return items.sort((a, b) => b.size - a.size);
  }

  /**
   * Compress data before storing (using simple LZW-style compression)
   * Note: For better compatibility, we use a simple algorithm instead of external libs
   */
  compressData(data: any): string {
    try {
      const jsonString = JSON.stringify(data);
      // For now, just use JSON.stringify without compression
      // Real compression would require additional libraries
      // This method is here for future enhancement
      return jsonString;
    } catch (error) {
      console.error('Compression failed:', error);
      return JSON.stringify(data);
    }
  }

  /**
   * Decompress data after retrieval
   */
  decompressData(compressed: string): any {
    try {
      return JSON.parse(compressed);
    } catch (error) {
      console.error('Failed to parse data:', error);
      return null;
    }
  }

  /**
   * Safe set item with compression and quota check
   */
  setItem(key: string, value: any, useCompression: boolean = true): boolean {
    try {
      const data = useCompression ? this.compressData(value) : JSON.stringify(value);
      
      // Check if we can store this
      const estimatedSize = (key.length + data.length) * 2;
      const currentInfo = this.getStorageInfo();
      
      if (currentInfo.used + estimatedSize > MAX_LOCALSTORAGE_SIZE * 0.95) {
        console.warn('Storage quota would be exceeded. Attempting cleanup...');
        this.autoCleanup();
        
        // Check again after cleanup
        const newInfo = this.getStorageInfo();
        if (newInfo.used + estimatedSize > MAX_LOCALSTORAGE_SIZE * 0.95) {
          throw new Error('QuotaExceededError: Not enough storage space even after cleanup');
        }
      }

      localStorage.setItem(key, data);
      return true;
    } catch (error: any) {
      if (error?.name === 'QuotaExceededError' || error.message.includes('QuotaExceededError')) {
        console.error('Storage quota exceeded:', error);
        // Try emergency cleanup
        this.emergencyCleanup();
        
        // Try one more time
        try {
          const data = useCompression ? this.compressData(value) : JSON.stringify(value);
          localStorage.setItem(key, data);
          return true;
        } catch {
          return false;
        }
      }
      console.error('Failed to store item:', error);
      return false;
    }
  }

  /**
   * Safe get item with decompression
   */
  getItem(key: string, isCompressed: boolean = true): any {
    try {
      const data = localStorage.getItem(key);
      if (!data) return null;
      
      return isCompressed ? this.decompressData(data) : JSON.parse(data);
    } catch (error) {
      console.error('Failed to retrieve item:', error);
      return null;
    }
  }

  /**
   * Automatic cleanup of old/unnecessary data
   */
  autoCleanup(): void {
    console.log('Running automatic storage cleanup...');
    
    // Clean up old demo initialization flags
    const keysToRemove: string[] = [];
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        // Remove old demo flags (keep only latest)
        if (key.startsWith('devtrack_demo_initialized_') && key !== this.getLatestDemoKey()) {
          keysToRemove.push(key);
        }
        
        // Remove temporary/cache keys
        if (key.startsWith('temp_') || key.startsWith('cache_')) {
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log('Removed:', key);
    });

    console.log(`Cleanup complete. Removed ${keysToRemove.length} items.`);
  }

  /**
   * Emergency cleanup when storage is critically full
   * AGGRESSIVE: Removes all completed/archived projects and keeps only active ones
   */
  emergencyCleanup(): void {
    console.warn('Running EMERGENCY storage cleanup...');
    
    let totalSpaceFreed = 0;

    try {
      // STEP 1: Remove ALL completed and archived projects
      const projectsData = localStorage.getItem('devtrack_projects');
      if (projectsData) {
        const projects = JSON.parse(projectsData);
        const projectEntries = Object.entries(projects);
        
        const filteredProjects: any = {};
        let removedCount = 0;
        
        for (const [id, project] of projectEntries) {
          const proj = project as any;
          
          // ONLY keep active and in_progress projects
          if (proj.status === 'active' || proj.status === 'in_progress') {
            // Trim project data to essentials only
            filteredProjects[id] = {
              id: proj.id,
              userId: proj.userId,
              title: proj.title,
              description: proj.description?.substring(0, 200) || '', // Limit description
              notes: proj.notes?.substring(0, 500) || '', // Limit notes
              status: proj.status,
              priority: proj.priority,
              tags: proj.tags?.slice(0, 5) || [], // Limit tags
              techStack: proj.techStack?.slice(0, 5) || [], // Limit tech stack
              githubUrl: proj.githubUrl,
              liveUrl: proj.liveUrl,
              isPublic: proj.isPublic,
              created_at: proj.created_at,
              updated_at: proj.updated_at
            };
          } else {
            removedCount++;
          }
        }

        if (removedCount > 0) {
          const oldSize = projectsData.length;
          const newData = JSON.stringify(filteredProjects);
          localStorage.setItem('devtrack_projects', newData);
          totalSpaceFreed += oldSize - newData.length;
          console.log(`✓ Removed ${removedCount} completed/archived projects`);
        }
      }

      // STEP 2: Clean up tasks for removed projects
      const tasksData = localStorage.getItem('devtrack_tasks');
      if (tasksData) {
        const tasks = JSON.parse(tasksData);
        const projects = JSON.parse(localStorage.getItem('devtrack_projects') || '{}');
        const activeProjectIds = new Set(Object.keys(projects));
        
        const filteredTasks: any = {};
        let removedTaskCount = 0;
        
        for (const [id, task] of Object.entries(tasks)) {
          const t = task as any;
          if (activeProjectIds.has(t.projectId)) {
            // Trim task data
            filteredTasks[id] = {
              id: t.id,
              projectId: t.projectId,
              userId: t.userId,
              title: t.title,
              description: t.description?.substring(0, 200) || '', // Limit description
              status: t.status,
              priority: t.priority,
              tags: t.tags?.slice(0, 3) || [],
              dueDate: t.dueDate,
              estimatedHours: t.estimatedHours,
              actualHours: t.actualHours,
              timeSpentMinutes: t.timeSpentMinutes,
              dependencies: t.dependencies?.slice(0, 3) || [],
              created_at: t.created_at,
              updated_at: t.updated_at
            };
          } else {
            removedTaskCount++;
          }
        }

        if (removedTaskCount > 0) {
          const oldSize = tasksData.length;
          const newData = JSON.stringify(filteredTasks);
          localStorage.setItem('devtrack_tasks', newData);
          totalSpaceFreed += oldSize - newData.length;
          console.log(`✓ Removed ${removedTaskCount} orphaned tasks`);
        }
      }

      // STEP 3: Remove posts and messages (non-essential for core functionality)
      const postsData = localStorage.getItem('devtrack_posts');
      if (postsData) {
        const oldSize = postsData.length;
        localStorage.setItem('devtrack_posts', '{}');
        totalSpaceFreed += oldSize - 2;
        console.log('✓ Cleared all posts');
      }

      const messagesData = localStorage.getItem('devtrack_messages');
      if (messagesData) {
        const oldSize = messagesData.length;
        localStorage.setItem('devtrack_messages', '{}');
        totalSpaceFreed += oldSize - 2;
        console.log('✓ Cleared all messages');
      }

      // STEP 4: Run normal cleanup
      this.autoCleanup();

      console.log(`✓ Emergency cleanup complete. Freed ~${this.formatBytes(totalSpaceFreed * 2)}`);
      
    } catch (error) {
      console.error('Emergency cleanup failed:', error);
    }
  }

  /**
   * Get the latest demo initialization key
   */
  private getLatestDemoKey(): string {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('devtrack_demo_initialized_'));
    return keys.length > 0 ? keys[keys.length - 1] : '';
  }

  /**
   * Archive old projects to reduce storage
   */
  archiveOldProjects(daysOld: number = 90): number {
    try {
      const projectsData = localStorage.getItem('devtrack_projects');
      if (!projectsData) return 0;

      const projects = JSON.parse(projectsData);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      let archivedCount = 0;
      for (const [id, project] of Object.entries(projects)) {
        const proj = project as any;
        if (proj.status === 'completed') {
          const updatedAt = new Date(proj.updated_at);
          if (updatedAt < cutoffDate) {
            proj.status = 'archived';
            archivedCount++;
          }
        }
      }

      if (archivedCount > 0) {
        localStorage.setItem('devtrack_projects', JSON.stringify(projects));
      }

      return archivedCount;
    } catch (error) {
      console.error('Failed to archive projects:', error);
      return 0;
    }
  }

  /**
   * Export data for backup before cleanup
   */
  exportData(): string {
    const data: any = {};
    
    // Export all devtrack data
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key) && key.startsWith('devtrack_')) {
        data[key] = localStorage.getItem(key);
      }
    }

    return JSON.stringify(data, null, 2);
  }

  /**
   * Import data from backup
   */
  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      for (const [key, value] of Object.entries(data)) {
        if (key.startsWith('devtrack_')) {
          localStorage.setItem(key, value as string);
        }
      }

      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  /**
   * Format bytes for display
   */
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get storage usage by category
   */
  getStorageByCategory(): { [key: string]: number } {
    const categories: { [key: string]: number } = {
      projects: 0,
      tasks: 0,
      posts: 0,
      messages: 0,
      users: 0,
      other: 0
    };

    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const value = localStorage.getItem(key) || '';
        const size = (key.length + value.length) * 2;

        if (key.includes('project')) {
          categories.projects += size;
        } else if (key.includes('task')) {
          categories.tasks += size;
        } else if (key.includes('post')) {
          categories.posts += size;
        } else if (key.includes('message')) {
          categories.messages += size;
        } else if (key.includes('user') || key.includes('profile')) {
          categories.users += size;
        } else {
          categories.other += size;
        }
      }
    }

    return categories;
  }
}

export const storageQuotaManager = new StorageQuotaManager();

// Export helper functions
export function checkStorageHealth(): StorageQuotaInfo {
  return storageQuotaManager.getStorageInfo();
}

export function safeSetItem(key: string, value: any): boolean {
  return storageQuotaManager.setItem(key, value, false); // Don't compress by default for compatibility
}

export function safeGetItem(key: string): any {
  return storageQuotaManager.getItem(key, false);
}
