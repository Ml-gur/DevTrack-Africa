/**
 * Project Status Calculator
 * Calculates the correct project status based on tasks and resources
 */

import { LocalTask } from './local-storage-database';
import { fileStorageDB } from './indexeddb-file-storage';

export type ProjectStatus = 'not-started' | 'planning' | 'active' | 'in-progress' | 'completed' | 'archived';

/**
 * Calculate the correct project status based on tasks and resources
 * Logic:
 * - "not-started": No tasks AND no resources uploaded
 * - "planning": Tasks exist but all are in 'todo' status
 * - "active"/"in-progress": At least one task is 'in_progress' OR some tasks completed but not all
 * - "completed": All tasks are 'completed' (and at least one task exists)
 * - "archived": Manual status, not auto-calculated
 */
export async function calculateProjectStatus(
  projectId: string,
  tasks: LocalTask[],
  currentStatus?: ProjectStatus
): Promise<ProjectStatus> {
  // If manually archived, keep that status
  if (currentStatus === 'archived') {
    return 'archived';
  }

  // Check if there are any resources uploaded for this project
  let hasResources = false;
  try {
    const resources = await fileStorageDB.getProjectFiles(projectId);
    hasResources = resources.length > 0;
  } catch (error) {
    // If there's an error accessing IndexedDB, assume no resources
    hasResources = false;
  }

  // No tasks case
  if (tasks.length === 0) {
    // If no tasks but has resources, project has started (planning phase)
    if (hasResources) {
      return 'planning';
    }
    // If no tasks and no resources, project has not started
    return 'not-started';
  }

  // Count task statuses
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const todoTasks = tasks.filter(t => t.status === 'todo').length;
  const totalTasks = tasks.length;

  // All tasks completed
  if (completedTasks === totalTasks && totalTasks > 0) {
    return 'completed';
  }

  // Has tasks in progress OR some tasks completed (project is active)
  if (inProgressTasks > 0 || completedTasks > 0) {
    return 'active';
  }

  // All tasks are in 'todo' status (planning phase)
  if (todoTasks === totalTasks) {
    return 'planning';
  }

  // Default fallback
  return 'planning';
}

/**
 * Calculate status synchronously (without checking resources)
 * Use this when you can't await async operations
 */
export function calculateProjectStatusSync(
  tasks: LocalTask[],
  hasResources: boolean = false,
  currentStatus?: ProjectStatus
): ProjectStatus {
  // If manually archived, keep that status
  if (currentStatus === 'archived') {
    return 'archived';
  }

  // No tasks case
  if (tasks.length === 0) {
    // If no tasks but has resources, project has started (planning phase)
    if (hasResources) {
      return 'planning';
    }
    // If no tasks and no resources, project has not started
    return 'not-started';
  }

  // Count task statuses
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const todoTasks = tasks.filter(t => t.status === 'todo').length;
  const totalTasks = tasks.length;

  // All tasks completed
  if (completedTasks === totalTasks && totalTasks > 0) {
    return 'completed';
  }

  // Has tasks in progress OR some tasks completed (project is active)
  if (inProgressTasks > 0 || completedTasks > 0) {
    return 'active';
  }

  // All tasks are in 'todo' status (planning phase)
  if (todoTasks === totalTasks) {
    return 'planning';
  }

  // Default fallback
  return 'planning';
}
