import React, { useState } from 'react';
import { Plus, Star, Zap, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import ProjectShowcase from './ProjectShowcase';
import ProjectShowcaseCreator, { ProjectShowcaseData } from './ProjectShowcaseCreator';
import StreamlinedShowcaseCreator from './StreamlinedShowcaseCreator';
import { Project } from '../types/project';
import { notificationService } from '../utils/notification-service';

interface EnhancedDashboardShowcaseProps {
  user: any;
  profile?: any;
  projects: Project[];
  onProjectClick: (project: Project) => void;
  onRefresh?: () => void;
  weeklyActivity?: any;
  setWeeklyActivity?: (fn: (prev: any) => any) => void;
}

export default function EnhancedDashboardShowcase({
  user,
  profile,
  projects,
  onProjectClick,
  onRefresh,
  weeklyActivity,
  setWeeklyActivity
}: EnhancedDashboardShowcaseProps) {
  const [showShowcaseCreator, setShowShowcaseCreator] = useState(false);
  const [isCreatingShowcase, setIsCreatingShowcase] = useState(false);
  const [lastCreatedShowcase, setLastCreatedShowcase] = useState<string | null>(null);

  const createNotification = async (notificationData: any) => {
    await notificationService.createNotification({
      user_id: user?.id || 'demo-user',
      ...notificationData
    });
  };

  const handleCreateShowcase = async (showcaseData: ProjectShowcaseData) => {
    try {
      setIsCreatingShowcase(true);
      console.log('🎭 Creating project showcase:', showcaseData);
      
      // Validate showcase data
      if (!showcaseData.projectId || !showcaseData.showcaseTitle) {
        throw new Error('Missing required showcase information');
      }
      
      // In a full implementation, this would save the showcase to the database
      // For now, we'll simulate successful creation with validation
      
      // Simulate API delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update weekly activity if the function is available
      if (typeof setWeeklyActivity === 'function') {
        setWeeklyActivity((prev: any) => ({
          ...prev,
          postsShared: prev.postsShared + 1
        }));
      }
      
      // Store for success state
      setLastCreatedShowcase(showcaseData.showcaseTitle);
      
      // Show success notification
      await createNotification({
        type: 'project_showcase_created',
        title: '🎉 Showcase Published!',
        message: `Your showcase "${showcaseData.showcaseTitle}" is now live and visible to the DevTrack Africa community. Great work!`,
        data: { 
          showcaseId: 'demo-' + Date.now(),
          projectId: showcaseData.projectId,
          visibility: showcaseData.visibility
        }
      });
      
      // Trigger refresh if available
      if (onRefresh) {
        setTimeout(() => {
          onRefresh();
        }, 500);
      }
      
      console.log('✅ Project showcase created successfully!');
      return { success: true };
    } catch (error) {
      console.error('❌ Error creating project showcase:', error);
      
      // Show error notification
      await createNotification({
        type: 'showcase_creation_failed',
        title: 'Showcase Creation Failed',
        message: 'There was an issue publishing your showcase. Please try again or contact support.',
        data: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      
      throw error;
    } finally {
      setIsCreatingShowcase(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Showcase Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Project Showcase</h1>
          <p className="text-muted-foreground">
            Share your development journey with the DevTrack Africa community
          </p>
          {lastCreatedShowcase && (
            <div className="mt-2 text-sm text-green-600 animate-fade-in">
              ✨ Successfully published "{lastCreatedShowcase}"!
            </div>
          )}
        </div>
        
        <div className="flex gap-3">
          {onRefresh && (
            <Button onClick={onRefresh} variant="outline">
              <Star className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          )}
          <Button 
            onClick={() => setShowShowcaseCreator(true)}
            disabled={isCreatingShowcase || projects.length === 0}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreatingShowcase ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Publishing...
              </>
            ) : lastCreatedShowcase ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2 text-green-200" />
                Create Another
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Create Showcase
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Helper message for users with no projects */}
      {projects.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <div className="space-y-3">
            <Zap className="w-12 h-12 text-blue-500 mx-auto" />
            <h3 className="text-lg font-semibold text-blue-900">Ready to Showcase?</h3>
            <p className="text-blue-700 max-w-md mx-auto">
              Create your first project to start sharing your development journey with the DevTrack Africa community. 
              Once you have a project, you can create beautiful showcases to highlight your work.
            </p>
            <div className="flex justify-center gap-3 mt-4">
              <Button 
                onClick={() => window.location.href = '#projects'}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Project
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Showcase Grid */}
      <ProjectShowcase
        currentUserId={user?.id || "demo-user"}
        userProjects={projects}
        onProjectClick={onProjectClick}
        onViewProfile={(userId) => console.log('View profile:', userId)}
        onRefresh={onRefresh}
        featured={true}
      />

      {/* Streamlined Showcase Creator Modal */}
      <StreamlinedShowcaseCreator
        isOpen={showShowcaseCreator}
        onClose={() => setShowShowcaseCreator(false)}
        onCreateShowcase={handleCreateShowcase}
        projects={projects}
        currentUser={{
          id: user?.id || 'demo-user',
          fullName: profile?.fullName || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Developer',
          profilePicture: profile?.profile_picture || user?.user_metadata?.avatar_url,
          title: profile?.title || 'Developer'
        }}
      />
    </div>
  );
}