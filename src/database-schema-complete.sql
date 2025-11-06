-- DevTrack Africa Complete Database Schema
-- This creates all tables, policies, and functions needed for the application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable Row Level Security on auth.users if not already enabled
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- =============================================
-- CORE TABLES
-- =============================================

-- User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    username TEXT UNIQUE,
    avatar_url TEXT,
    bio TEXT,
    location TEXT,
    website TEXT,
    github_username TEXT,
    linkedin_url TEXT,
    twitter_handle TEXT,
    skills TEXT[] DEFAULT '{}',
    experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'expert')) DEFAULT 'beginner',
    is_verified BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT CHECK (status IN ('planning', 'active', 'completed', 'on-hold')) DEFAULT 'planning',
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    category TEXT DEFAULT 'Web Development',
    tags TEXT[] DEFAULT '{}',
    tech_stack TEXT[] DEFAULT '{}',
    github_repo TEXT,
    live_url TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project Collaborators Table
CREATE TABLE IF NOT EXISTS public.project_collaborators (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role TEXT CHECK (role IN ('owner', 'admin', 'member', 'viewer')) DEFAULT 'member',
    permissions TEXT[] DEFAULT '{}',
    invited_by UUID REFERENCES public.profiles(id),
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    joined_at TIMESTAMPTZ,
    status TEXT CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
    UNIQUE(project_id, user_id)
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK (status IN ('todo', 'in-progress', 'review', 'done')) DEFAULT 'todo',
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    assigned_to UUID REFERENCES public.profiles(id),
    created_by UUID REFERENCES public.profiles(id) NOT NULL,
    due_date TIMESTAMPTZ,
    estimated_time INTEGER, -- in minutes
    time_spent INTEGER DEFAULT 0, -- in minutes
    tags TEXT[] DEFAULT '{}',
    position INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task Dependencies Table
CREATE TABLE IF NOT EXISTS public.task_dependencies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
    depends_on_task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(task_id, depends_on_task_id)
);

-- =============================================
-- MESSAGING SYSTEM
-- =============================================

-- Conversations Table
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type TEXT CHECK (type IN ('direct', 'group', 'project')) DEFAULT 'direct',
    title TEXT,
    description TEXT,
    created_by UUID REFERENCES public.profiles(id) NOT NULL,
    project_id UUID REFERENCES public.projects(id),
    is_active BOOLEAN DEFAULT TRUE,
    last_message_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversation Participants Table
CREATE TABLE IF NOT EXISTS public.conversation_participants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role TEXT CHECK (role IN ('admin', 'member')) DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_read_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(conversation_id, user_id)
);

-- Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    type TEXT CHECK (type IN ('text', 'file', 'image', 'code', 'system')) DEFAULT 'text',
    metadata JSONB DEFAULT '{}',
    edited_at TIMESTAMPTZ,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- COMMUNITY FEATURES
-- =============================================

-- Community Posts Table
CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT CHECK (type IN ('project-showcase', 'discussion', 'help', 'achievement', 'tutorial')) DEFAULT 'discussion',
    project_id UUID REFERENCES public.projects(id),
    tags TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT TRUE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post Likes Table
CREATE TABLE IF NOT EXISTS public.post_likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    parent_comment_id UUID REFERENCES public.comments(id),
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comment Likes Table
CREATE TABLE IF NOT EXISTS public.comment_likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);

-- =============================================
-- NOTIFICATIONS SYSTEM
-- =============================================

-- Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT CHECK (type IN ('project_update', 'task_assigned', 'message', 'community', 'system', 'collaboration')) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    action_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- FILE STORAGE
-- =============================================

-- File Attachments Table
CREATE TABLE IF NOT EXISTS public.file_attachments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    file_size BIGINT,
    mime_type TEXT,
    storage_path TEXT NOT NULL,
    uploaded_by UUID REFERENCES public.profiles(id) NOT NULL,
    entity_type TEXT CHECK (entity_type IN ('task', 'message', 'post', 'profile')) NOT NULL,
    entity_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ANALYTICS & TRACKING
-- =============================================

-- User Activity Log Table
CREATE TABLE IF NOT EXISTS public.user_activity (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    activity_type TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project Analytics Table
CREATE TABLE IF NOT EXISTS public.project_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    metric_name TEXT NOT NULL,
    metric_value NUMERIC NOT NULL,
    metric_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_skills ON public.profiles USING GIN(skills);

-- Projects indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_is_public ON public.projects(is_public);
CREATE INDEX IF NOT EXISTS idx_projects_tags ON public.projects USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_projects_tech_stack ON public.projects USING GIN(tech_stack);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);

-- Tasks indexes
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON public.tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_position ON public.tasks(project_id, position);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(conversation_id, created_at DESC);

-- Community posts indexes
CREATE INDEX IF NOT EXISTS idx_community_posts_author_id ON public.community_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_type ON public.community_posts(type);
CREATE INDEX IF NOT EXISTS idx_community_posts_is_public ON public.community_posts(is_public);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON public.community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_tags ON public.community_posts USING GIN(tags);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(user_id, created_at DESC);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_analytics ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PROFILES POLICIES
-- =============================================

-- Profiles: Users can view public profiles and their own profile
CREATE POLICY "Users can view public profiles"
ON public.profiles FOR SELECT
USING (is_public = true OR auth.uid() = id);

-- Profiles: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Profiles: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Profiles: Users can delete their own profile
CREATE POLICY "Users can delete own profile"
ON public.profiles FOR DELETE
USING (auth.uid() = id);

-- =============================================
-- PROJECTS POLICIES
-- =============================================

-- Projects: Users can view public projects and their own projects
CREATE POLICY "Users can view public projects and own projects"
ON public.projects FOR SELECT
USING (
    is_public = true 
    OR user_id = auth.uid() 
    OR EXISTS (
        SELECT 1 FROM public.project_collaborators 
        WHERE project_id = id AND user_id = auth.uid() AND status = 'accepted'
    )
);

-- Projects: Users can insert their own projects
CREATE POLICY "Users can insert own projects"
ON public.projects FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Projects: Users can update their own projects or projects they have admin access to
CREATE POLICY "Users can update own projects or admin projects"
ON public.projects FOR UPDATE
USING (
    user_id = auth.uid() 
    OR EXISTS (
        SELECT 1 FROM public.project_collaborators 
        WHERE project_id = id AND user_id = auth.uid() AND role IN ('admin', 'owner') AND status = 'accepted'
    )
);

-- Projects: Users can delete their own projects
CREATE POLICY "Users can delete own projects"
ON public.projects FOR DELETE
USING (user_id = auth.uid());

-- =============================================
-- PROJECT COLLABORATORS POLICIES
-- =============================================

-- Project collaborators: Users can view collaborators of projects they have access to
CREATE POLICY "Users can view project collaborators"
ON public.project_collaborators FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = project_id 
        AND (
            p.user_id = auth.uid() 
            OR p.is_public = true
            OR EXISTS (
                SELECT 1 FROM public.project_collaborators pc 
                WHERE pc.project_id = p.id AND pc.user_id = auth.uid() AND pc.status = 'accepted'
            )
        )
    )
);

-- Project collaborators: Project owners and admins can invite collaborators
CREATE POLICY "Project owners and admins can invite collaborators"
ON public.project_collaborators FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = project_id 
        AND (
            p.user_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM public.project_collaborators pc 
                WHERE pc.project_id = p.id AND pc.user_id = auth.uid() AND pc.role IN ('admin', 'owner') AND pc.status = 'accepted'
            )
        )
    )
);

-- Project collaborators: Users can update their own collaboration status
CREATE POLICY "Users can update own collaboration status"
ON public.project_collaborators FOR UPDATE
USING (user_id = auth.uid() OR invited_by = auth.uid());

-- =============================================
-- TASKS POLICIES
-- =============================================

-- Tasks: Users can view tasks in projects they have access to
CREATE POLICY "Users can view accessible project tasks"
ON public.tasks FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = project_id 
        AND (
            p.user_id = auth.uid() 
            OR p.is_public = true
            OR EXISTS (
                SELECT 1 FROM public.project_collaborators pc 
                WHERE pc.project_id = p.id AND pc.user_id = auth.uid() AND pc.status = 'accepted'
            )
        )
    )
);

-- Tasks: Users can insert tasks in projects they have write access to
CREATE POLICY "Users can insert tasks in accessible projects"
ON public.tasks FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = project_id 
        AND (
            p.user_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM public.project_collaborators pc 
                WHERE pc.project_id = p.id AND pc.user_id = auth.uid() AND pc.role IN ('admin', 'member', 'owner') AND pc.status = 'accepted'
            )
        )
    )
);

-- Tasks: Users can update tasks they created or are assigned to, or in projects they have write access
CREATE POLICY "Users can update accessible tasks"
ON public.tasks FOR UPDATE
USING (
    created_by = auth.uid() 
    OR assigned_to = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = project_id 
        AND (
            p.user_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM public.project_collaborators pc 
                WHERE pc.project_id = p.id AND pc.user_id = auth.uid() AND pc.role IN ('admin', 'member', 'owner') AND pc.status = 'accepted'
            )
        )
    )
);

-- Tasks: Users can delete tasks they created or in projects they own/admin
CREATE POLICY "Users can delete own tasks or admin project tasks"
ON public.tasks FOR DELETE
USING (
    created_by = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = project_id 
        AND (
            p.user_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM public.project_collaborators pc 
                WHERE pc.project_id = p.id AND pc.user_id = auth.uid() AND pc.role IN ('admin', 'owner') AND pc.status = 'accepted'
            )
        )
    )
);

-- =============================================
-- MESSAGING POLICIES
-- =============================================

-- Conversations: Users can view conversations they participate in
CREATE POLICY "Users can view their conversations"
ON public.conversations FOR SELECT
USING (
    created_by = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.conversation_participants 
        WHERE conversation_id = id AND user_id = auth.uid()
    )
);

-- Conversations: Users can create conversations
CREATE POLICY "Users can create conversations"
ON public.conversations FOR INSERT
WITH CHECK (created_by = auth.uid());

-- Conversation participants: Users can view participants of their conversations
CREATE POLICY "Users can view conversation participants"
ON public.conversation_participants FOR SELECT
USING (
    user_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.conversation_participants cp 
        WHERE cp.conversation_id = conversation_id AND cp.user_id = auth.uid()
    )
);

-- Messages: Users can view messages in conversations they participate in
CREATE POLICY "Users can view conversation messages"
ON public.messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.conversation_participants 
        WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
    )
);

-- Messages: Users can send messages to conversations they participate in
CREATE POLICY "Users can send messages to their conversations"
ON public.messages FOR INSERT
WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM public.conversation_participants 
        WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
    )
);

-- =============================================
-- COMMUNITY POLICIES
-- =============================================

-- Community posts: Users can view public posts and their own posts
CREATE POLICY "Users can view public posts and own posts"
ON public.community_posts FOR SELECT
USING (is_public = true OR author_id = auth.uid());

-- Community posts: Users can create their own posts
CREATE POLICY "Users can create own posts"
ON public.community_posts FOR INSERT
WITH CHECK (author_id = auth.uid());

-- Community posts: Users can update their own posts
CREATE POLICY "Users can update own posts"
ON public.community_posts FOR UPDATE
USING (author_id = auth.uid());

-- Community posts: Users can delete their own posts
CREATE POLICY "Users can delete own posts"
ON public.community_posts FOR DELETE
USING (author_id = auth.uid());

-- Post likes: Users can view all post likes
CREATE POLICY "Users can view post likes"
ON public.post_likes FOR SELECT
USING (true);

-- Post likes: Users can manage their own likes
CREATE POLICY "Users can manage own post likes"
ON public.post_likes FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- =============================================
-- NOTIFICATIONS POLICIES
-- =============================================

-- Notifications: Users can view their own notifications
CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT
USING (user_id = auth.uid());

-- Notifications: System can create notifications for users
CREATE POLICY "System can create notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

-- Notifications: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
USING (user_id = auth.uid());

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON public.community_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, username)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'fullName', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update conversation last_message_at
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations 
    SET 
        last_message_at = NEW.created_at,
        updated_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update conversation when message is sent
CREATE TRIGGER update_conversation_on_message
    AFTER INSERT ON public.messages
    FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Grant SELECT on auth.users to authenticated users for profile queries
GRANT SELECT ON auth.users TO authenticated;