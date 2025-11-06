/**
 * Safe Storage Operations
 * 
 * Wrapper functions that handle storage quota errors gracefully
 */

import { localDatabase, LocalProject, LocalTask } from './local-storage-database';
import { checkStorageHealth } from './storage-quota-manager';
import { toast } from 'sonner@2.0.3';

export interface StorageOperationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  needsCleanup?: boolean;
}

/**
 * Safely create a project with storage quota handling
 */
export async function safeCreateProject(
  userId: string,
  projectData: Omit<LocalProject, 'id' | 'userId' | 'created_at' | 'updated_at'>
): Promise<StorageOperationResult<LocalProject>> {
  try {
    // Pre-flight check
    const health = checkStorageHealth();
    
    if (!health.canStore) {
      return {
        success: false,
        error: 'Storage is full. Please clean up old data before creating new projects.',
        needsCleanup: true
      };
    }

    // Attempt to create
    const project = await localDatabase.createProject(userId, projectData);
    
    return {
      success: true,
      data: project
    };
  } catch (error: any) {
    console.error('Failed to create project:', error);

    // Check if it's a storage quota error
    if (
      error?.message?.includes('quota') ||
      error?.message?.includes('Storage is full')
    ) {
      return {
        success: false,
        error: 'Storage is full. Please clean up old data.',
        needsCleanup: true
      };
    }

    return {
      success: false,
      error: error?.message || 'Failed to create project'
    };
  }
}

/**
 * Safely create a task with storage quota handling
 */
export async function safeCreateTask(
  taskData: Omit<LocalTask, 'id' | 'created_at' | 'updated_at'>
): Promise<StorageOperationResult<LocalTask>> {
  try {
    // Pre-flight check
    const health = checkStorageHealth();
    
    if (!health.canStore) {
      return {
        success: false,
        error: 'Storage is full. Please clean up old data before creating new tasks.',
        needsCleanup: true
      };
    }

    // Attempt to create
    const task = await localDatabase.createTask(taskData);
    
    return {
      success: true,
      data: task
    };
  } catch (error: any) {
    console.error('Failed to create task:', error);

    // Check if it's a storage quota error
    if (
      error?.message?.includes('quota') ||
      error?.message?.includes('Storage is full')
    ) {
      return {
        success: false,
        error: 'Storage is full. Please clean up old data.',
        needsCleanup: true
      };
    }

    return {
      success: false,
      error: error?.message || 'Failed to create task'
    };
  }
}

/**
 * Safely update a project with storage quota handling
 */
export async function safeUpdateProject(
  projectId: string,
  updates: Partial<LocalProject>
): Promise<StorageOperationResult<LocalProject>> {
  try {
    const project = await localDatabase.updateProject(projectId, updates);
    
    if (!project) {
      return {
        success: false,
        error: 'Project not found'
      };
    }
    
    return {
      success: true,
      data: project
    };
  } catch (error: any) {
    console.error('Failed to update project:', error);

    if (
      error?.message?.includes('quota') ||
      error?.message?.includes('Storage is full')
    ) {
      return {
        success: false,
        error: 'Storage is full. Please clean up old data.',
        needsCleanup: true
      };
    }

    return {
      success: false,
      error: error?.message || 'Failed to update project'
    };
  }
}

/**
 * Safely update a task with storage quota handling
 */
export async function safeUpdateTask(
  taskId: string,
  updates: Partial<LocalTask>
): Promise<StorageOperationResult<LocalTask>> {
  try {
    const task = await localDatabase.updateTask(taskId, updates);
    
    if (!task) {
      return {
        success: false,
        error: 'Task not found'
      };
    }
    
    return {
      success: true,
      data: task
    };
  } catch (error: any) {
    console.error('Failed to update task:', error);

    if (
      error?.message?.includes('quota') ||
      error?.message?.includes('Storage is full')
    ) {
      return {
        success: false,
        error: 'Storage is full. Please clean up old data.',
        needsCleanup: true
      };
    }

    return {
      success: false,
      error: error?.message || 'Failed to update task'
    };
  }
}

/**
 * Show user-friendly error message for storage operations
 */
export function handleStorageError(result: StorageOperationResult<any>, openCleanupDialog?: () => void) {
  if (result.success) return;

  if (result.needsCleanup) {
    toast.error('Storage Full', {
      description: result.error,
      duration: 5000,
      action: openCleanupDialog ? {
        label: 'Clean Up',
        onClick: openCleanupDialog
      } : undefined
    });
  } else {
    toast.error('Error', {
      description: result.error,
      duration: 4000
    });
  }
}
