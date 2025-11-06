// DEPRECATED: This file has been replaced with /utils/local-storage-database.ts
// All database operations now use local storage only

import { localDatabase } from '../utils/local-storage-database';
import { Project, ProjectStatus, ProjectCategory } from '../types/project';
import { Task } from '../types/task';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  title?: string;
  country?: string;
  phone?: string;
  tech_stack?: string[];
  bio?: string;
  profile_image_url?: string;
  created_at?: string;
  updated_at?: string;
}

// Redirect all database operations to local storage
export const databaseService = {
  // Project operations
  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    console.warn('⚠️ databaseService.createProject is deprecated. Use localDatabase.createProject instead.');
    return await localDatabase.createProject(project);
  },

  async getProjects(userId: string): Promise<Project[]> {
    console.warn('⚠️ databaseService.getProjects is deprecated. Use localDatabase.getProjects instead.');
    return await localDatabase.getProjects(userId);
  },

  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
    console.warn('⚠️ databaseService.updateProject is deprecated. Use localDatabase.updateProject instead.');
    return await localDatabase.updateProject(projectId, updates);
  },

  async deleteProject(projectId: string): Promise<void> {
    console.warn('⚠️ databaseService.deleteProject is deprecated. Use localDatabase.deleteProject instead.');
    return await localDatabase.deleteProject(projectId);
  },

  // Task operations
  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    console.warn('⚠️ databaseService.createTask is deprecated. Use localDatabase.createTask instead.');
    return await localDatabase.createTask(task);
  },

  async getTasks(projectId: string): Promise<Task[]> {
    console.warn('⚠️ databaseService.getTasks is deprecated. Use localDatabase.getTasks instead.');
    return await localDatabase.getTasks(projectId);
  },

  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    console.warn('⚠️ databaseService.updateTask is deprecated. Use localDatabase.updateTask instead.');
    return await localDatabase.updateTask(taskId, updates);
  },

  async deleteTask(taskId: string): Promise<void> {
    console.warn('⚠️ databaseService.deleteTask is deprecated. Use localDatabase.deleteTask instead.');
    return await localDatabase.deleteTask(taskId);
  },

  // Profile operations
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    console.warn('⚠️ databaseService.getUserProfile is deprecated. Use localDatabase.getProfile instead.');
    const profile = await localDatabase.getProfile(userId);
    if (!profile) return null;
    
    return {
      id: profile.id,
      email: profile.email,
      full_name: profile.fullName,
      title: profile.title,
      country: profile.country,
      phone: profile.phone,
      tech_stack: profile.techStack,
      bio: profile.bio,
      profile_image_url: profile.profileImageUrl,
      created_at: profile.createdAt,
      updated_at: profile.updatedAt,
    };
  },

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    console.warn('⚠️ databaseService.updateUserProfile is deprecated. Use localDatabase.updateProfile instead.');
    const updatedProfile = await localDatabase.updateProfile(userId, {
      fullName: updates.full_name,
      title: updates.title,
      country: updates.country,
      phone: updates.phone,
      techStack: updates.tech_stack,
      bio: updates.bio,
      profileImageUrl: updates.profile_image_url,
    });

    return {
      id: updatedProfile.id,
      email: updatedProfile.email,
      full_name: updatedProfile.fullName,
      title: updatedProfile.title,
      country: updatedProfile.country,
      phone: updatedProfile.phone,
      tech_stack: updatedProfile.techStack,
      bio: updatedProfile.bio,
      profile_image_url: updatedProfile.profileImageUrl,
      created_at: updatedProfile.createdAt,
      updated_at: updatedProfile.updatedAt,
    };
  },

  // Health check
  async healthCheck(): Promise<{ status: 'ok' | 'error', message: string }> {
    console.warn('⚠️ databaseService.healthCheck is deprecated. Local storage is always available.');
    return { status: 'ok', message: 'Local storage is available' };
  }
};

export default databaseService;