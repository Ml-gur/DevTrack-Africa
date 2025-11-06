# 🚨 IMMEDIATE ACTION REQUIRED - Database Setup

## Current Issue
Your Supabase database is missing the required tables. The errors you're seeing are:

```
❌ Failed to load profile from database: Database table "users" not found. Please run the database setup script to create all required tables.
❌ Failed to fetch posts from database: Database table "posts" not found. Please run the database setup script to create all required tables.
❌ Failed to fetch messages from database: Database table "messages" not found. Please run the database setup script to create all required tables.
❌ Failed to fetch projects from database: Database table "projects" not found. Please run the database setup script to create all required tables.
```

## QUICK FIX (5 minutes)

### Step 1: Open Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in and select your DevTrack Africa project

### Step 2: Go to SQL Editor
1. Click **"SQL Editor"** in the left sidebar
2. Click **"+ New Query"**

### Step 3: Copy and Run This Script
Copy this entire script and paste it into the SQL Editor, then click **"Run"**:

```sql
-- DevTrack Africa - Database Setup Script
-- Copy this entire script and run it in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    country TEXT,
    phone TEXT,
    title TEXT,
    tech_stack TEXT[] DEFAULT '{}',
    bio TEXT,
    profile_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'planning',
    priority TEXT NOT NULL DEFAULT 'medium',
    start_date DATE,
    end_date DATE,
    progress INTEGER DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    tech_stack TEXT[] DEFAULT '{}',
    repository_url TEXT,
    live_url TEXT,
    visibility TEXT NOT NULL DEFAULT 'private',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'todo',
    priority TEXT NOT NULL DEFAULT 'medium',
    assignee_id UUID REFERENCES public.users(id),
    due_date TIMESTAMP WITH TIME ZONE,
    time_estimate INTEGER DEFAULT 0,
    time_spent INTEGER DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create posts table
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    post_type TEXT NOT NULL DEFAULT 'text',
    tags TEXT[] DEFAULT '{}',
    tech_stack TEXT[] DEFAULT '{}',
    visibility TEXT NOT NULL DEFAULT 'public',
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table  
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type TEXT NOT NULL DEFAULT 'direct',
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create additional helper tables
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, post_id),
    UNIQUE(user_id, comment_id),
    CHECK ((post_id IS NOT NULL AND comment_id IS NULL) OR (post_id IS NULL AND comment_id IS NOT NULL))
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    type TEXT NOT NULL DEFAULT 'info',
    action_url TEXT,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY IF NOT EXISTS "Users can view all profiles" ON public.users FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY IF NOT EXISTS "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can manage own projects" ON public.projects FOR ALL USING (user_id = auth.uid());
CREATE POLICY IF NOT EXISTS "Users can view public projects" ON public.projects FOR SELECT USING (visibility = 'public');

CREATE POLICY IF NOT EXISTS "Users can manage own tasks" ON public.tasks FOR ALL USING (user_id = auth.uid());
CREATE POLICY IF NOT EXISTS "Users can view public posts" ON public.posts FOR SELECT USING (visibility = 'public');
CREATE POLICY IF NOT EXISTS "Users can manage own posts" ON public.posts FOR ALL USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can view own messages" ON public.messages FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());
CREATE POLICY IF NOT EXISTS "Users can send messages" ON public.messages FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can view comments on accessible posts" ON public.comments FOR SELECT USING (post_id IN (SELECT id FROM public.posts WHERE visibility = 'public' OR user_id = auth.uid()));
CREATE POLICY IF NOT EXISTS "Users can manage own comments" ON public.comments FOR ALL USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can view all likes" ON public.likes FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Users can manage own likes" ON public.likes FOR ALL USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can view own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY IF NOT EXISTS "Users can update own notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Success message
SELECT 'Database setup completed successfully!' AS result;
```

### Step 4: Verify Tables Were Created
1. Go to **"Table Editor"** in the left sidebar
2. You should now see these tables:
   - users
   - projects  
   - tasks
   - posts
   - messages
   - comments
   - likes
   - notifications

### Step 5: Refresh Your Application
1. Go back to your DevTrack Africa application
2. Refresh the page (Ctrl+R or Cmd+R)
3. The errors should now be resolved!

## What This Fixes

✅ Creates all required database tables  
✅ Sets up proper relationships between tables  
✅ Enables Row Level Security for data protection  
✅ Creates security policies for user access  
✅ Grants necessary permissions  

## If You Still Get Errors After Setup

1. **Check that the script ran without errors** in the SQL Editor
2. **Verify all tables exist** in the Table Editor
3. **Clear your browser cache** and refresh
4. **Check the browser console** for any remaining errors

## For Login Issues

If you can't log in after setup, create a test user:
1. In Supabase Dashboard, go to **Authentication** → **Users**
2. Click **"Add user"**
3. Email: `test@devtrack.africa`
4. Password: `TestPassword123!`
5. Check **"Auto Confirm User"**
6. Click **"Create user"**

---

**This setup is required once and will fix all the current errors. The application will work normally after completing these steps.**