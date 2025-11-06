import { createClient } from '@supabase/supabase-js'

// Local Supabase configuration
const supabaseUrl = 'http://localhost:54321'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Test connection function
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" which is OK
      throw error
    }

    return { success: true, message: 'Supabase connection successful' }
  } catch (error: any) {
    console.error('Supabase connection test failed:', error)
    return {
      success: false,
      message: `Connection failed: ${error.message || 'Unknown error'}`,
      error
    }
  }
}

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          full_name: string
          email: string
          country: string | null
          phone: string | null
          title: string | null
          tech_stack: string[] | null
          bio: string | null
          profile_image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          email: string
          country?: string | null
          phone?: string | null
          title?: string | null
          tech_stack?: string[] | null
          bio?: string | null
          profile_image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          country?: string | null
          phone?: string | null
          title?: string | null
          tech_stack?: string[] | null
          bio?: string | null
          profile_image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          status: 'planning' | 'in-progress' | 'completed' | 'on-hold'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          start_date: string | null
          end_date: string | null
          progress: number
          tags: string[]
          tech_stack: string[]
          repository_url: string | null
          live_url: string | null
          visibility: 'private' | 'public' | 'shared'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          status?: 'planning' | 'in-progress' | 'completed' | 'on-hold'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          start_date?: string | null
          end_date?: string | null
          progress?: number
          tags?: string[]
          tech_stack?: string[]
          repository_url?: string | null
          live_url?: string | null
          visibility?: 'private' | 'public' | 'shared'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          status?: 'planning' | 'in-progress' | 'completed' | 'on-hold'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          start_date?: string | null
          end_date?: string | null
          progress?: number
          tags?: string[]
          tech_stack?: string[]
          repository_url?: string | null
          live_url?: string | null
          visibility?: 'private' | 'public' | 'shared'
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          project_id: string
          user_id: string
          title: string
          description: string | null
          status: 'todo' | 'in-progress' | 'completed' | 'blocked'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          assignee_id: string | null
          due_date: string | null
          time_estimate: number
          time_spent: number
          tags: string[]
          position: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          title: string
          description?: string | null
          status?: 'todo' | 'in-progress' | 'completed' | 'blocked'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          assignee_id?: string | null
          due_date?: string | null
          time_estimate?: number
          time_spent?: number
          tags?: string[]
          position?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          title?: string
          description?: string | null
          status?: 'todo' | 'in-progress' | 'completed' | 'blocked'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          assignee_id?: string | null
          due_date?: string | null
          time_estimate?: number
          time_spent?: number
          tags?: string[]
          position?: number
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          title: string
          content: string
          post_type: 'text' | 'project' | 'progress' | 'question' | 'showcase' | 'help'
          tags: string[]
          tech_stack: string[]
          visibility: 'public' | 'private'
          likes_count: number
          comments_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          title: string
          content: string
          post_type?: 'text' | 'project' | 'progress' | 'question' | 'showcase' | 'help'
          tags?: string[]
          tech_stack?: string[]
          visibility?: 'public' | 'private'
          likes_count?: number
          comments_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string | null
          title?: string
          content?: string
          post_type?: 'text' | 'project' | 'progress' | 'question' | 'showcase' | 'help'
          tags?: string[]
          tech_stack?: string[]
          visibility?: 'public' | 'private'
          likes_count?: number
          comments_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          parent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          content: string
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          content?: string
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      likes: {
        Row: {
          id: string
          user_id: string
          post_id: string | null
          comment_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          post_id?: string | null
          comment_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          post_id?: string | null
          comment_id?: string | null
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          recipient_id: string | null
          project_id: string | null
          content: string
          message_type: 'direct' | 'project' | 'group'
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          recipient_id?: string | null
          project_id?: string | null
          content: string
          message_type?: 'direct' | 'project' | 'group'
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          recipient_id?: string | null
          project_id?: string | null
          content?: string
          message_type?: 'direct' | 'project' | 'group'
          read_at?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string | null
          type: 'info' | 'success' | 'warning' | 'error'
          action_url: string | null
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content?: string | null
          type?: 'info' | 'success' | 'warning' | 'error'
          action_url?: string | null
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string | null
          type?: 'info' | 'success' | 'warning' | 'error'
          action_url?: string | null
          read_at?: string | null
          created_at?: string
        }
      }
      collaborations: {
        Row: {
          id: string
          project_id: string
          user_id: string
          role: 'owner' | 'editor' | 'viewer'
          invited_by: string | null
          accepted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          role?: 'owner' | 'editor' | 'viewer'
          invited_by?: string | null
          accepted_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          role?: 'owner' | 'editor' | 'viewer'
          invited_by?: string | null
          accepted_at?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
