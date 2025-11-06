/**
 * DEPRECATED: Database Service Compatibility Layer
 * 
 * This file provides backward compatibility for components still importing
 * from the old database-service. All functionality now uses local storage.
 * 
 * NEW CODE SHOULD USE: /utils/local-storage-database.ts
 */

import { localDatabase } from './local-storage-database';
import { Project, ProjectStatus, ProjectCategory } from '../types/project';
import { Task } from '../types/task';

// Silenced deprecation warning - this file is a compatibility layer
// New code should use: /utils/local-storage-database.ts

// Re-export types for compatibility
export { Project, ProjectStatus, ProjectCategory };
export type { Task };

// User Profile Interface
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

// Messaging Interfaces
export interface DiscoverableUser {
  id: string;
  full_name: string;
  email: string;
  title?: string;
  country?: string;
  phone?: string;
  tech_stack?: string[];
  bio?: string;
  profile_image_url?: string;
  created_at?: string;
  updated_at?: string;
  projects_count?: number;
  online_status?: 'online' | 'away' | 'offline';
  last_seen?: string;
}

export interface MessagingMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  message_type: 'text' | 'file' | 'image';
  status: 'sending' | 'sent' | 'delivered' | 'read';
  created_at: string;
  updated_at: string;
  sender_profile?: DiscoverableUser;
}

export interface MessagingConversation {
  id: string;
  participants: string[];
  last_message_at: string;
  created_at: string;
  updated_at: string;
  other_participant?: DiscoverableUser;
  last_message?: MessagingMessage;
  unread_count?: { [userId: string]: number };
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'message' | 'message_read' | 'message_delivered' | 'system';
  title: string;
  content?: string;
  related_id?: string;
  is_read: boolean;
  created_at: string;
}

// Auth Functions (Mock - local storage doesn't need real auth)
export async function signUpUser(userData: {
  email: string;
  password: string;
  full_name: string;
  country: string;
  phone: string;
}): Promise<{ user: any | null; error: any | null }> {
  console.log('🔄 Mock signup (local storage mode)');
  const userId = `user-${Date.now()}`;
  return {
    user: { id: userId, email: userData.email },
    error: null
  };
}

export async function signInUser(
  email: string,
  password: string
): Promise<{ user: any | null; error: any | null }> {
  console.log('🔄 Mock signin (local storage mode)');
  return {
    user: { id: 'mock-user-id', email },
    error: null
  };
}

export async function getCurrentUser(): Promise<{
  user: any | null;
  profile: UserProfile | null;
} | null> {
  console.log('🔄 Mock getCurrentUser (local storage mode)');
  return null;
}

export async function testDatabaseConnection(): Promise<boolean> {
  console.log('✅ Local storage is always available');
  return true;
}

// User Profile Functions
export async function ensureUserExists(
  userId: string,
  userData: Partial<UserProfile>
): Promise<{ data: UserProfile | null; error: any }> {
  console.log('📱 Using local storage for user profile');
  const profile: UserProfile = {
    id: userId,
    email: userData.email || '',
    full_name: userData.full_name || '',
    ...userData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  return { data: profile, error: null };
}

export async function createUserProfile(
  userData: Omit<UserProfile, 'created_at' | 'updated_at'>
): Promise<{ data: UserProfile | null; error: any }> {
  console.log('📱 Using local storage for user profile creation');
  return ensureUserExists(userData.id, userData);
}

export async function getUserProfile(
  userId: string
): Promise<{ data: UserProfile | null; error: any }> {
  console.log('📱 Getting user profile from local storage');
  const profile = await localDatabase.getProfile(userId);
  return { data: profile, error: null };
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<{ data: UserProfile | null; error: any }> {
  console.log('📱 Updating user profile in local storage');
  await localDatabase.updateProfile(userId, updates as any);
  const profile = await localDatabase.getProfile(userId);
  return { data: profile, error: null };
}

// Project Functions
export async function createProject(
  projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>,
  userId: string
): Promise<{ data: Project | null; error: any }> {
  console.log('📱 Creating project in local storage');
  const project = await localDatabase.createProject({
    ...projectData,
    userId
  } as any);
  return { data: project, error: null };
}

export async function getUserProjects(
  userId: string
): Promise<{ data: Project[] | null; error: any }> {
  console.log('📱 Getting user projects from local storage');
  const projects = await localDatabase.getProjects(userId);
  return { data: projects, error: null };
}

export async function getAllPublicProjects(): Promise<{
  data: Project[] | null;
  error: any;
}> {
  console.log('📱 Getting public projects from local storage');
  const projects = await localDatabase.getAllProjects();
  const publicProjects = projects.filter((p) => p.isPublic !== false);
  return { data: publicProjects, error: null };
}

export async function updateProject(
  projectId: string,
  updates: Partial<Project>
): Promise<{ data: Project | null; error: any }> {
  console.log('📱 Updating project in local storage');
  await localDatabase.updateProject(projectId, updates as any);
  const projects = await localDatabase.getAllProjects();
  const project = projects.find((p) => p.id === projectId);
  return { data: project || null, error: null };
}

export async function deleteProject(
  projectId: string
): Promise<{ error: any }> {
  console.log('📱 Deleting project from local storage');
  await localDatabase.deleteProject(projectId);
  return { error: null };
}

export async function toggleProjectLike(
  projectId: string,
  userId: string
): Promise<{ liked: boolean; error: any }> {
  console.log('📱 Mock toggle like (local storage mode)');
  return { liked: true, error: null };
}

export async function getProjectLikeStatus(
  projectId: string,
  userId: string
): Promise<{ liked: boolean; error: any }> {
  console.log('📱 Mock get like status (local storage mode)');
  return { liked: false, error: null };
}

// Task Functions
export async function createTask(
  taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
): Promise<{ data: Task | null; error: any }> {
  console.log('📱 Creating task in local storage');
  const task = await localDatabase.createTask(taskData as any);
  return { data: task, error: null };
}

export async function getProjectTasks(
  projectId: string
): Promise<{ data: Task[] | null; error: any }> {
  console.log('📱 Getting project tasks from local storage');
  const tasks = await localDatabase.getTasks(projectId);
  return { data: tasks, error: null };
}

export async function updateTask(
  taskId: string,
  updates: Partial<Task>
): Promise<{ data: Task | null; error: any }> {
  console.log('📱 Updating task in local storage');
  await localDatabase.updateTask(taskId, updates as any);
  const allTasks = JSON.parse(localStorage.getItem('local_tasks') || '[]');
  const task = allTasks.find((t: Task) => t.id === taskId);
  return { data: task || null, error: null };
}

export async function deleteTask(taskId: string): Promise<{ error: any }> {
  console.log('📱 Deleting task from local storage');
  await localDatabase.deleteTask(taskId);
  return { error: null };
}

// Posts Functions (Mock)
export async function createPost(postData: any): Promise<{
  data: any | null;
  error: any;
}> {
  console.log('📱 Mock create post (local storage mode)');
  const post = {
    id: `post-${Date.now()}`,
    ...postData,
    created_at: new Date().toISOString()
  };
  return { data: post, error: null };
}

export async function getAllPosts(): Promise<{
  data: any[] | null;
  error: any;
}> {
  console.log('📱 Mock get posts (local storage mode)');
  const posts = JSON.parse(localStorage.getItem('local_posts') || '[]');
  return { data: posts, error: null };
}

export async function getUserPosts(userId: string): Promise<{
  data: any[] | null;
  error: any;
}> {
  console.log('📱 Mock get user posts (local storage mode)');
  const posts = JSON.parse(localStorage.getItem('local_posts') || '[]');
  const userPosts = posts.filter((p: any) => p.author_id === userId);
  return { data: userPosts, error: null };
}

// Messaging Functions (Mock)
export async function searchUsers(
  query: string
): Promise<{ data: DiscoverableUser[] | null; error: any }> {
  console.log('📱 Mock search users (local storage mode)');
  return { data: [], error: null };
}

export async function createConversation(
  participantIds: string[],
  currentUserId: string
): Promise<{ data: MessagingConversation | null; error: any }> {
  console.log('📱 Mock create conversation (local storage mode)');
  const conversation: MessagingConversation = {
    id: `conv-${Date.now()}`,
    participants: participantIds,
    last_message_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  return { data: conversation, error: null };
}

export async function getUserConversations(
  userId: string
): Promise<{ data: MessagingConversation[] | null; error: any }> {
  console.log('📱 Mock get conversations (local storage mode)');
  return { data: [], error: null };
}

export async function getConversationMessages(
  conversationId: string
): Promise<{ data: MessagingMessage[] | null; error: any }> {
  console.log('📱 Mock get messages (local storage mode)');
  return { data: [], error: null };
}

export async function sendMessage(
  messageData: Partial<MessagingMessage>
): Promise<{ data: MessagingMessage | null; error: any }> {
  console.log('📱 Mock send message (local storage mode)');
  const message: MessagingMessage = {
    id: `msg-${Date.now()}`,
    conversation_id: messageData.conversation_id || '',
    sender_id: messageData.sender_id || '',
    recipient_id: messageData.recipient_id || '',
    content: messageData.content || '',
    message_type: messageData.message_type || 'text',
    status: 'sent',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  return { data: message, error: null };
}

// Sync Functions
export async function syncAllTemporaryProjects(
  userId: string
): Promise<{ synced: number; failed: number }> {
  console.log('📱 No sync needed for local storage');
  return { synced: 0, failed: 0 };
}

// Health Service Export
export const healthService = {
  async checkConnection() {
    return { status: 'ok', message: 'Local storage is available' };
  }
};

// Supabase Service Export (for compatibility)
export const supabaseService = {
  async isAvailable() {
    return true;
  },
  async testConnection() {
    return { success: true, message: 'Local storage is available' };
  }
};