// DEPRECATED: All Supabase database operations have been replaced with local storage
// Use localDatabase from /utils/local-storage-database.ts instead

import { localDatabase } from '../local-storage-database';

export const userService = {
  async getProfile(userId: string) {
    console.warn('⚠️ userService.getProfile is deprecated. Use localDatabase.getProfile instead.');
    return await localDatabase.getProfile(userId);
  }
};

export const healthService = {
  async checkConnection() {
    console.warn('⚠️ healthService.checkConnection is deprecated. Local storage is always available.');
    return { status: 'ok', message: 'Local storage is available' };
  }
};

export const projectService = {
  async getProjects(userId: string) {
    console.warn('⚠️ projectService.getProjects is deprecated. Use localDatabase.getProjects instead.');
    return await localDatabase.getProjects(userId);
  }
};

export const taskService = {
  async getTasks(projectId: string) {
    console.warn('⚠️ taskService.getTasks is deprecated. Use localDatabase.getTasks instead.');
    return await localDatabase.getTasks(projectId);
  }
};