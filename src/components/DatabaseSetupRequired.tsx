import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Database, CheckCircle, AlertTriangle, Copy, ExternalLink, PlayCircle } from 'lucide-react';
import { supabaseService } from '../utils/supabase/database-service';

interface DatabaseSetupRequiredProps {
  onBack: () => void;
}

export default function DatabaseSetupRequired({ onBack }: DatabaseSetupRequiredProps) {
  const [setupStep, setSetupStep] = useState<'instructions' | 'testing' | 'complete' | 'error'>('instructions');
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [scriptCopied, setScriptCopied] = useState(false);

  const databaseSetupSQL = `-- =============================================
-- DevTrack Africa Complete Database Schema
-- =============================================
-- 🚀 Production-Ready Database Setup
-- Copy and paste this entire script into your Supabase SQL Editor
-- =============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable Row Level Security on auth.users
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
    estimated_time INTEGER,
    time_spent INTEGER DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    position INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID DEFAULT uuid_generate_v4() NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    type TEXT CHECK (type IN ('text', 'file', 'image', 'code', 'system')) DEFAULT 'text',
    metadata JSONB DEFAULT '{}',
    edited_at TIMESTAMPTZ,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

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
-- PERFORMANCE INDEXES
-- =============================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Projects indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);

-- Tasks indexes
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(conversation_id, created_at DESC);

-- Community indexes
CREATE INDEX IF NOT EXISTS idx_community_posts_author_id ON public.community_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON public.community_posts(created_at DESC);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(user_id, is_read);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- =============================================
-- SECURITY POLICIES
-- =============================================

-- Profiles policies
DROP POLICY IF EXISTS "Users can view public profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can view public profiles"
ON public.profiles FOR SELECT
USING (is_public = true OR auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Projects policies
DROP POLICY IF EXISTS "Users can view public projects and own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;

CREATE POLICY "Users can view public projects and own projects"
ON public.projects FOR SELECT
USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "Users can insert own projects"
ON public.projects FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own projects"
ON public.projects FOR UPDATE
USING (user_id = auth.uid());

-- Tasks policies
DROP POLICY IF EXISTS "Users can view accessible project tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can insert tasks in accessible projects" ON public.tasks;
DROP POLICY IF EXISTS "Users can update accessible tasks" ON public.tasks;

CREATE POLICY "Users can view accessible project tasks"
ON public.tasks FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = project_id 
        AND (p.user_id = auth.uid() OR p.is_public = true)
    )
);

CREATE POLICY "Users can insert tasks in accessible projects"
ON public.tasks FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = project_id AND p.user_id = auth.uid()
    )
);

CREATE POLICY "Users can update accessible tasks"
ON public.tasks FOR UPDATE
USING (
    created_by = auth.uid() 
    OR assigned_to = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = project_id AND p.user_id = auth.uid()
    )
);

-- Community posts policies
DROP POLICY IF EXISTS "Users can view public posts" ON public.community_posts;
DROP POLICY IF EXISTS "Users can create own posts" ON public.community_posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.community_posts;

CREATE POLICY "Users can view public posts"
ON public.community_posts FOR SELECT
USING (is_public = true OR author_id = auth.uid());

CREATE POLICY "Users can create own posts"
ON public.community_posts FOR INSERT
WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can update own posts"
ON public.community_posts FOR UPDATE
USING (author_id = auth.uid());

-- Messages policies
DROP POLICY IF EXISTS "Users can view own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;

CREATE POLICY "Users can view own messages"
ON public.messages FOR SELECT
USING (sender_id = auth.uid());

CREATE POLICY "Users can send messages"
ON public.messages FOR INSERT
WITH CHECK (sender_id = auth.uid());

-- Notifications policies
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

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

-- Function to handle profile creation
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers (drop existing first)
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
DROP TRIGGER IF EXISTS update_community_posts_updated_at ON public.community_posts;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create updated_at triggers
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_posts_updated_at
    BEFORE UPDATE ON public.community_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto profile creation trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- =============================================
-- 🎉 SETUP COMPLETE!
-- =============================================
-- ✅ Created 6 essential tables with security
-- ✅ Added performance indexes  
-- ✅ Configured RLS policies
-- ✅ Set up triggers and functions
-- ✅ Ready for production use!
-- =============================================`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(databaseSetupSQL);
      setScriptCopied(true);
      setTimeout(() => setScriptCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = databaseSetupSQL;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setScriptCopied(true);
      setTimeout(() => setScriptCopied(false), 3000);
    }
  };

  const testConnection = async () => {
    setIsLoading(true);
    setSetupStep('testing');
    
    try {
      console.log('🔍 Testing database connection after setup...');
      
      // Wait a moment for any potential database changes to propagate
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = await supabaseService.testConnection();
      
      if (result.success) {
        setTestResult('✅ Database setup successful! All tables found and accessible.');
        setSetupStep('complete');
        console.log('✅ Database connection test passed');
      } else {
        console.error('❌ Database connection test failed:', result.error);
        setTestResult(`❌ Setup incomplete: ${result.error || 'Unknown error'}`);
        setSetupStep('error');
      }
    } catch (error: any) {
      console.error('❌ Connection test exception:', error);
      setTestResult(`❌ Connection test failed: ${error.message || 'Unknown error'}`);
      setSetupStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  const renderInstructions = () => (
    <div className="space-y-6">
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>🚨 Database Tables Missing</strong><br />
          Your DevTrack Africa database needs to be set up. The required tables don't exist yet.
          <br /><br />
          This is a <strong>one-time setup</strong> that takes 30 seconds.
        </AlertDescription>
      </Alert>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
          <PlayCircle className="w-5 h-5" />
          Quick Setup (3 Steps)
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
            <div>
              <div className="font-medium text-blue-900">Copy the Database Script</div>
              <div className="text-sm text-blue-700">Click the "Copy Script" button below</div>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">2</div>
            <div>
              <div className="font-medium text-blue-900">Run in Supabase</div>
              <div className="text-sm text-blue-700">Go to Supabase Dashboard → SQL Editor → Paste & Run</div>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">3</div>
            <div>
              <div className="font-medium text-blue-900">Test Connection</div>
              <div className="text-sm text-blue-700">Come back here and click "Test Database"</div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-lg">Database Setup Script</h4>
          <div className="flex space-x-2">
            <Button
              onClick={copyToClipboard}
              variant={scriptCopied ? "default" : "outline"}
              size="sm"
              className="flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              {scriptCopied ? '✅ Copied!' : 'Copy Script'}
            </Button>
            <Button
              onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Open Supabase
            </Button>
          </div>
        </div>
        
        <div className="bg-gray-900 border rounded-lg p-4 max-h-80 overflow-y-auto">
          <pre className="text-xs text-green-400 whitespace-pre-wrap font-mono">
            {databaseSetupSQL}
          </pre>
        </div>
        
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>After running the script:</strong> You'll see "Setup Complete!" message in the SQL editor.
            Then come back here and test your connection.
          </AlertDescription>
        </Alert>
      </div>

      <div className="flex space-x-3">
        <Button 
          onClick={testConnection} 
          className="flex-1"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              <span>Testing...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4" />
              <span>Test Database Connection</span>
            </div>
          )}
        </Button>
        <Button onClick={onBack} variant="outline">
          Back
        </Button>
      </div>
    </div>
  );

  const renderTesting = () => (
    <div className="space-y-6 text-center">
      <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <div>
        <h3 className="text-xl font-semibold mb-2">Testing Database Connection...</h3>
        <p className="text-muted-foreground">
          Checking if all tables were created successfully
        </p>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          This may take a few seconds while we verify your database setup
        </p>
      </div>
    </div>
  );

  const renderComplete = () => (
    <div className="space-y-6 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>
      <div>
        <h3 className="text-xl font-semibold text-green-900">🎉 Database Setup Complete!</h3>
        <p className="text-green-700 mt-2">{testResult}</p>
      </div>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-semibold text-green-900 mb-2">What's Ready:</h4>
        <ul className="text-sm text-green-800 space-y-1">
          <li>✅ User profiles and authentication</li>
          <li>✅ Project and task management</li>
          <li>✅ Community features</li>
          <li>✅ Messaging system</li>
          <li>✅ Notifications</li>
          <li>✅ Security policies</li>
        </ul>
      </div>
      
      <div className="space-y-3">
        <Button onClick={() => window.location.reload()} className="w-full" size="lg">
          🚀 Launch DevTrack Africa
        </Button>
        <Button onClick={testConnection} variant="outline" size="sm">
          Test Connection Again
        </Button>
      </div>
    </div>
  );

  const renderError = () => (
    <div className="space-y-6">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Setup Issue Detected</strong><br />
          {testResult}
        </AlertDescription>
      </Alert>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-900 mb-2">Troubleshooting Steps:</h4>
        <ol className="list-decimal list-inside text-sm text-yellow-800 space-y-1">
          <li>Make sure you copied the <strong>entire</strong> SQL script</li>
          <li>Paste it in Supabase Dashboard → <strong>SQL Editor</strong></li>
          <li>Click the <strong>RUN</strong> button (not just paste)</li>
          <li>Wait for "Setup Complete!" message</li>
          <li>Come back here and test again</li>
        </ol>
      </div>
      
      <div className="space-y-2">
        <Button onClick={testConnection} className="w-full" disabled={isLoading}>
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              <span>Testing...</span>
            </div>
          ) : (
            'Test Database Again'
          )}
        </Button>
        <div className="flex space-x-2">
          <Button onClick={() => setSetupStep('instructions')} variant="outline" className="flex-1">
            Back to Instructions
          </Button>
          <Button
            onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3" />
            Supabase
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-red-50 to-orange-50">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Database className="w-8 h-8 text-red-600" />
            <span className="text-xl font-bold">Database Setup Required</span>
          </div>
          <CardTitle className="text-2xl">DevTrack Africa Database Configuration</CardTitle>
          <CardDescription>
            Your database needs to be set up before you can use DevTrack Africa
          </CardDescription>
        </CardHeader>

        <CardContent>
          {setupStep === 'instructions' && renderInstructions()}
          {setupStep === 'testing' && renderTesting()}
          {setupStep === 'complete' && renderComplete()}
          {setupStep === 'error' && renderError()}
        </CardContent>
      </Card>
    </div>
  );
}