import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { 
  Database, 
  AlertTriangle, 
  ExternalLink, 
  Copy, 
  CheckCircle, 
  XCircle,
  Loader2,
  RefreshCw,
  FileText
} from 'lucide-react';
import { healthService } from '../utils/supabase/database-service';
import { log } from '../utils/production-logger';

interface DatabaseSetupErrorHandlerProps {
  errors: string[];
  onRetry?: () => void;
  onSetupComplete?: () => void;
}

export default function DatabaseSetupErrorHandler({ 
  errors, 
  onRetry, 
  onSetupComplete 
}: DatabaseSetupErrorHandlerProps) {
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [healthStatus, setHealthStatus] = useState<'unknown' | 'healthy' | 'needs-setup'>('unknown');
  const [copiedScript, setCopiedScript] = useState(false);

  // Database setup SQL script
  const setupScript = `-- DevTrack Africa - Database Setup Script
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
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

-- Create other required tables
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

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies
CREATE POLICY IF NOT EXISTS "Users can view all profiles" ON public.users FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY IF NOT EXISTS "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can manage own projects" ON public.projects FOR ALL USING (user_id = auth.uid());
CREATE POLICY IF NOT EXISTS "Users can view public projects" ON public.projects FOR SELECT USING (visibility = 'public');

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Completion message
SELECT 'Database setup completed!' AS result;`;

  const hasTableErrors = errors.some(error => 
    error.includes('Could not find the table') || 
    error.includes('table') || 
    error.includes('relation')
  );

  const checkDatabaseHealth = async () => {
    setIsCheckingHealth(true);
    try {
      const health = await healthService.checkDatabaseHealth();
      
      if (health.success) {
        setHealthStatus('healthy');
        if (onSetupComplete) {
          onSetupComplete();
        }
      } else {
        setHealthStatus('needs-setup');
      }
    } catch (error) {
      log.error('Health check failed:', error);
      setHealthStatus('needs-setup');
    } finally {
      setIsCheckingHealth(false);
    }
  };

  const copySetupScript = async () => {
    try {
      await navigator.clipboard.writeText(setupScript);
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    } catch (error) {
      log.error('Failed to copy script:', error);
    }
  };

  useEffect(() => {
    if (hasTableErrors) {
      checkDatabaseHealth();
    }
  }, [hasTableErrors]);

  if (!hasTableErrors) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Database Setup Required:</strong> The required database tables are missing from your Supabase instance.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Database Setup Required</span>
            {healthStatus === 'healthy' && <Badge variant="secondary">✅ Fixed</Badge>}
            {healthStatus === 'needs-setup' && <Badge variant="destructive">❌ Setup Needed</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              DevTrack Africa requires specific database tables to function. These tables are missing from your Supabase instance.
            </p>
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <h4 className="font-medium text-red-900 mb-2">Current Errors:</h4>
              <ul className="text-sm text-red-700 space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <XCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Quick Fix Instructions:</h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">1</span>
                <span>Go to your Supabase Dashboard</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Open
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">2</span>
                <span>Navigate to SQL Editor</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">3</span>
                <span>Copy and run this setup script:</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copySetupScript}
                >
                  {copiedScript ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <Copy className="h-3 w-3 mr-1" />
                  )}
                  {copiedScript ? 'Copied!' : 'Copy Script'}
                </Button>
              </div>
            </div>

            <div className="bg-gray-50 rounded p-3 max-h-32 overflow-y-auto">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                {setupScript.split('\n').slice(0, 10).join('\n')}
                {setupScript.split('\n').length > 10 && '\n... (click Copy Script for full content)'}
              </pre>
            </div>

            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">4</span>
              <span>Test the setup:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={checkDatabaseHealth}
                disabled={isCheckingHealth}
              >
                {isCheckingHealth ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3 mr-1" />
                )}
                {isCheckingHealth ? 'Checking...' : 'Test Setup'}
              </Button>
            </div>
          </div>

          {healthStatus === 'healthy' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-green-800">
                <strong>Setup Complete!</strong> All database tables are now available. You can refresh the page to continue.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex space-x-2">
            <Button 
              onClick={() => window.location.reload()} 
              className="flex-1"
              disabled={healthStatus !== 'healthy'}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Application
            </Button>
            {onRetry && (
              <Button 
                variant="outline" 
                onClick={onRetry}
                className="flex-1"
              >
                Retry Connection
              </Button>
            )}
          </div>

          <div className="pt-3 border-t">
            <Button
              variant="ghost" 
              size="sm"
              onClick={() => window.open('/DATABASE_SETUP_GUIDE.md', '_blank')}
              className="w-full"
            >
              <FileText className="h-4 w-4 mr-2" />
              View Detailed Setup Guide
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}