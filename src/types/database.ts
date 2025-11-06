// Database types for Supabase integration

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: ProfileInsert
        Update: ProfileUpdate
      }
      projects: {
        Row: Project
        Insert: ProjectInsert
        Update: ProjectUpdate
      }
      project_collaborators: {
        Row: ProjectCollaborator
        Insert: ProjectCollaboratorInsert
        Update: ProjectCollaboratorUpdate
      }
      tasks: {
        Row: Task
        Insert: TaskInsert
        Update: TaskUpdate
      }
      task_dependencies: {
        Row: TaskDependency
        Insert: TaskDependencyInsert
        Update: TaskDependencyUpdate
      }
      conversations: {
        Row: Conversation
        Insert: ConversationInsert
        Update: ConversationUpdate
      }
      conversation_participants: {
        Row: ConversationParticipant
        Insert: ConversationParticipantInsert
        Update: ConversationParticipantUpdate
      }
      messages: {
        Row: Message
        Insert: MessageInsert
        Update: MessageUpdate
      }
      community_posts: {
        Row: CommunityPost
        Insert: CommunityPostInsert
        Update: CommunityPostUpdate
      }
      post_likes: {
        Row: PostLike
        Insert: PostLikeInsert
        Update: PostLikeUpdate
      }
      comments: {
        Row: Comment
        Insert: CommentInsert
        Update: CommentUpdate
      }
      comment_likes: {
        Row: CommentLike
        Insert: CommentLikeInsert
        Update: CommentLikeUpdate
      }
      notifications: {
        Row: Notification
        Insert: NotificationInsert
        Update: NotificationUpdate
      }
      file_attachments: {
        Row: FileAttachment
        Insert: FileAttachmentInsert
        Update: FileAttachmentUpdate
      }
      user_activity: {
        Row: UserActivity
        Insert: UserActivityInsert
        Update: UserActivityUpdate
      }
      project_analytics: {
        Row: ProjectAnalytics
        Insert: ProjectAnalyticsInsert
        Update: ProjectAnalyticsUpdate
      }
    }
  }
}

// Core Types
export interface Profile {
  id: string
  email: string
  full_name: string | null
  username: string | null
  avatar_url: string | null
  bio: string | null
  location: string | null
  website: string | null
  github_username: string | null
  linkedin_url: string | null
  twitter_handle: string | null
  skills: string[]
  experience_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  is_verified: boolean
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface ProfileInsert {
  id: string
  email: string
  full_name?: string | null
  username?: string | null
  avatar_url?: string | null
  bio?: string | null
  location?: string | null
  website?: string | null
  github_username?: string | null
  linkedin_url?: string | null
  twitter_handle?: string | null
  skills?: string[]
  experience_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  is_verified?: boolean
  is_public?: boolean
}

export interface ProfileUpdate {
  email?: string
  full_name?: string | null
  username?: string | null
  avatar_url?: string | null
  bio?: string | null
  location?: string | null
  website?: string | null
  github_username?: string | null
  linkedin_url?: string | null
  twitter_handle?: string | null
  skills?: string[]
  experience_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  is_verified?: boolean
  is_public?: boolean
}

export interface Project {
  id: string
  title: string
  description: string | null
  notes?: string | null // Project notes - editable rich text
  user_id?: string
  userId?: string
  status: 'planning' | 'active' | 'in_progress' | 'completed' | 'archived' | 'on-hold'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category?: string
  tags: string[]
  tech_stack?: string[]
  techStack?: string[]
  github_repo?: string | null
  githubUrl?: string | null
  live_url?: string | null
  liveUrl?: string | null
  is_public?: boolean
  isPublic?: boolean
  due_date?: string | null
  created_at?: string
  updated_at?: string
}

export interface ProjectInsert {
  title: string
  description?: string | null
  user_id: string
  status?: 'planning' | 'active' | 'completed' | 'on-hold'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  category?: string
  tags?: string[]
  tech_stack?: string[]
  github_repo?: string | null
  live_url?: string | null
  is_public?: boolean
  due_date?: string | null
}

export interface ProjectUpdate {
  title?: string
  description?: string | null
  status?: 'planning' | 'active' | 'completed' | 'on-hold'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  category?: string
  tags?: string[]
  tech_stack?: string[]
  github_repo?: string | null
  live_url?: string | null
  is_public?: boolean
  due_date?: string | null
}

export interface ProjectCollaborator {
  id: string
  project_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  permissions: string[]
  invited_by: string | null
  invited_at: string
  joined_at: string | null
  status: 'pending' | 'accepted' | 'declined'
}

export interface ProjectCollaboratorInsert {
  project_id: string
  user_id: string
  role?: 'owner' | 'admin' | 'member' | 'viewer'
  permissions?: string[]
  invited_by?: string | null
  joined_at?: string | null
  status?: 'pending' | 'accepted' | 'declined'
}

export interface ProjectCollaboratorUpdate {
  role?: 'owner' | 'admin' | 'member' | 'viewer'
  permissions?: string[]
  joined_at?: string | null
  status?: 'pending' | 'accepted' | 'declined'
}

export interface Task {
  id: string
  project_id: string
  title: string
  description: string | null
  status: 'todo' | 'in-progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assigned_to: string | null
  created_by: string
  due_date: string | null
  estimated_time: number | null
  time_spent: number
  tags: string[]
  position: number
  created_at: string
  updated_at: string
}

export interface TaskInsert {
  project_id: string
  title: string
  description?: string | null
  status?: 'todo' | 'in-progress' | 'review' | 'done'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  assigned_to?: string | null
  created_by: string
  due_date?: string | null
  estimated_time?: number | null
  time_spent?: number
  tags?: string[]
  position?: number
}

export interface TaskUpdate {
  title?: string
  description?: string | null
  status?: 'todo' | 'in-progress' | 'review' | 'done'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  assigned_to?: string | null
  due_date?: string | null
  estimated_time?: number | null
  time_spent?: number
  tags?: string[]
  position?: number
}

export interface TaskDependency {
  id: string
  task_id: string
  depends_on_task_id: string
  created_at: string
}

export interface TaskDependencyInsert {
  task_id: string
  depends_on_task_id: string
}

export interface TaskDependencyUpdate {
  // No updatable fields for dependencies
}

export interface Conversation {
  id: string
  type: 'direct' | 'group' | 'project'
  title: string | null
  description: string | null
  created_by: string
  project_id: string | null
  is_active: boolean
  last_message_at: string | null
  created_at: string
  updated_at: string
}

export interface ConversationInsert {
  type?: 'direct' | 'group' | 'project'
  title?: string | null
  description?: string | null
  created_by: string
  project_id?: string | null
  is_active?: boolean
}

export interface ConversationUpdate {
  title?: string | null
  description?: string | null
  is_active?: boolean
}

export interface ConversationParticipant {
  id: string
  conversation_id: string
  user_id: string
  role: 'admin' | 'member'
  joined_at: string
  last_read_at: string
}

export interface ConversationParticipantInsert {
  conversation_id: string
  user_id: string
  role?: 'admin' | 'member'
  last_read_at?: string
}

export interface ConversationParticipantUpdate {
  role?: 'admin' | 'member'
  last_read_at?: string
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  type: 'text' | 'file' | 'image' | 'code' | 'system'
  metadata: Record<string, any>
  edited_at: string | null
  is_deleted: boolean
  created_at: string
}

export interface MessageInsert {
  conversation_id: string
  sender_id: string
  content: string
  type?: 'text' | 'file' | 'image' | 'code' | 'system'
  metadata?: Record<string, any>
}

export interface MessageUpdate {
  content?: string
  metadata?: Record<string, any>
  edited_at?: string | null
  is_deleted?: boolean
}

export interface CommunityPost {
  id: string
  author_id: string
  title: string
  content: string
  type: 'project-showcase' | 'discussion' | 'help' | 'achievement' | 'tutorial'
  project_id: string | null
  tags: string[]
  is_public: boolean
  view_count: number
  created_at: string
  updated_at: string
}

export interface CommunityPostInsert {
  author_id: string
  title: string
  content: string
  type?: 'project-showcase' | 'discussion' | 'help' | 'achievement' | 'tutorial'
  project_id?: string | null
  tags?: string[]
  is_public?: boolean
}

export interface CommunityPostUpdate {
  title?: string
  content?: string
  type?: 'project-showcase' | 'discussion' | 'help' | 'achievement' | 'tutorial'
  project_id?: string | null
  tags?: string[]
  is_public?: boolean
  view_count?: number
}

export interface PostLike {
  id: string
  post_id: string
  user_id: string
  created_at: string
}

export interface PostLikeInsert {
  post_id: string
  user_id: string
}

export interface PostLikeUpdate {
  // No updatable fields for likes
}

export interface Comment {
  id: string
  post_id: string
  author_id: string
  content: string
  parent_comment_id: string | null
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export interface CommentInsert {
  post_id: string
  author_id: string
  content: string
  parent_comment_id?: string | null
}

export interface CommentUpdate {
  content?: string
  is_deleted?: boolean
}

export interface CommentLike {
  id: string
  comment_id: string
  user_id: string
  created_at: string
}

export interface CommentLikeInsert {
  comment_id: string
  user_id: string
}

export interface CommentLikeUpdate {
  // No updatable fields for comment likes
}

export interface Notification {
  id: string
  user_id: string
  type: 'project_update' | 'task_assigned' | 'message' | 'community' | 'system' | 'collaboration'
  title: string
  message: string
  metadata: Record<string, any>
  action_url: string | null
  is_read: boolean
  created_at: string
}

export interface NotificationInsert {
  user_id: string
  type: 'project_update' | 'task_assigned' | 'message' | 'community' | 'system' | 'collaboration'
  title: string
  message: string
  metadata?: Record<string, any>
  action_url?: string | null
}

export interface NotificationUpdate {
  is_read?: boolean
}

export interface FileAttachment {
  id: string
  filename: string
  original_filename: string
  file_size: number | null
  mime_type: string | null
  storage_path: string
  uploaded_by: string
  entity_type: 'task' | 'message' | 'post' | 'profile'
  entity_id: string
  created_at: string
}

export interface FileAttachmentInsert {
  filename: string
  original_filename: string
  file_size?: number | null
  mime_type?: string | null
  storage_path: string
  uploaded_by: string
  entity_type: 'task' | 'message' | 'post' | 'profile'
  entity_id: string
}

export interface FileAttachmentUpdate {
  filename?: string
  original_filename?: string
  file_size?: number | null
  mime_type?: string | null
  storage_path?: string
}

export interface UserActivity {
  id: string
  user_id: string
  activity_type: string
  entity_type: string | null
  entity_id: string | null
  metadata: Record<string, any>
  created_at: string
}

export interface UserActivityInsert {
  user_id: string
  activity_type: string
  entity_type?: string | null
  entity_id?: string | null
  metadata?: Record<string, any>
}

export interface UserActivityUpdate {
  // No updatable fields for activity logs
}

export interface ProjectAnalytics {
  id: string
  project_id: string
  metric_name: string
  metric_value: number
  metric_date: string
  created_at: string
}

export interface ProjectAnalyticsInsert {
  project_id: string
  metric_name: string
  metric_value: number
  metric_date?: string
}

export interface ProjectAnalyticsUpdate {
  metric_value?: number
  metric_date?: string
}

// Utility types for joins and extended data
export interface ProjectWithCollaborators extends Project {
  collaborators?: (ProjectCollaborator & { profile: Profile })[]
  owner?: Profile
}

export interface TaskWithAssignee extends Task {
  assignee?: Profile
  creator?: Profile
}

export interface CommunityPostWithAuthor extends CommunityPost {
  author: Profile
  project?: Project
  likes_count?: number
  comments_count?: number
  user_has_liked?: boolean
}

export interface ConversationWithParticipants extends Conversation {
  participants: (ConversationParticipant & { profile: Profile })[]
  last_message?: Message
  unread_count?: number
}

export interface MessageWithSender extends Message {
  sender: Profile
}