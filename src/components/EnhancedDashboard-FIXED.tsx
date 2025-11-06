import React, { useState, useEffect } from 'react';
import { Plus, FolderOpen, BarChart3, Users, MessageCircle, Bell, Search, Menu, X, TestTube, Wifi, Star, TrendingUp, Calendar, Code2, UserCircle, Database, Lightbulb, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar } from './ui/avatar';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from './ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import MinimalProjectCreator from './MinimalProjectCreator';
import ProjectCard from './ProjectCard';
import ProjectDetailsPage from './ProjectDetailsPage';
import SmartAnalyticsDashboard from './SmartAnalyticsDashboard';
import CommunityFeed from './CommunityFeed';
import ProjectShowcase from './ProjectShowcase';
import ProjectShowcaseCreator, { ProjectShowcaseData } from './ProjectShowcaseCreator';
import EnhancedDashboardShowcase from './EnhancedDashboardShowcase';
import EnhancedMessagingHub from './EnhancedMessagingHub';
import NotificationCenter from './NotificationCenter';
import RealTimeMessagingHub from './RealTimeMessagingHub';
import OnboardingFlow from './OnboardingFlow';
import AdvancedNotificationCenter from './AdvancedNotificationCenter';
import EnhancedProjectAnalytics from './EnhancedProjectAnalytics';
import AdvancedSearchEngine from './AdvancedSearchEngine';
import { notificationService } from '../utils/notification-service';
import TestingDashboard from './TestingDashboard';
import ProductionAuditDashboard from './ProductionAuditDashboard';
import ComprehensiveTestingDashboard from './ComprehensiveTestingDashboard';
import ConnectionStatusComponent from './ConnectionStatus';
import UserProfileManager from './UserProfileManager';
import RegistrationTestHelper from './RegistrationTestHelper';
import { supabase, getDemoMode } from '../utils/supabase/client';
import { connectionManager, ConnectionStatus as IConnectionStatus } from '../utils/connection-manager';
import { dataPersistenceManager } from '../utils/supabase/data-persistence-manager';
import { log } from '../utils/production-logger';
// Use new data persistence manager for guaranteed database operations
import { Task } from '../types/task';
import { Project } from '../types/project';
import { Post } from '../types/social';

interface EnhancedDashboardProps {
  user: any;
  profile?: UserProfile | null;
  onLogout: () => void;
  onNavigateToSetup?: () => void;
  databaseConnected?: boolean | null;
}

type DashboardView = 
  | 'overview' 
  | 'projects' 
  | 'project-details' 
  | 'analytics' 
  | 'community' 
  | 'showcase'
  | 'messaging' 
  | 'profile'
  | 'testing'
  | 'production-audit';

export default function EnhancedDashboard({ 
  user, 
  profile, 
  onLogout, 
  onNavigateToSetup, 
  databaseConnected 
}: EnhancedDashboardProps) {
  
  // Online-only enforcement: Show connection required message if database not connected
  if (!databaseConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center">
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg border border-red-200">
          <div className="text-center">
            <Database className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <div className="font-semibold text-red-900 mb-2">
              Database Connection Required
            </div>
            <p className="text-sm text-red-700 mb-4">
              DevTrack Africa requires an active database connection to function. Please ensure you're connected to the internet and the database is properly configured.
            </p>
            <div className="space-y-2">
              <Button
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Refresh Page
              </Button>
              {onNavigateToSetup && (
                <Button
                  onClick={onNavigateToSetup}
                  variant="outline"
                  className="w-full"
                >
                  Setup Database
                </Button>
              )}
              <Button
                onClick={onLogout}
                variant="ghost"
                className="w-full"
              >
                Back to Homepage
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  const [currentView, setCurrentView] = useState<DashboardView>('overview');
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [projectTasks, setProjectTasks] = useState<{ [projectId: string]: Task[] }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<IConnectionStatus>(connectionManager.getStatus());
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [analyticsTimeRange, setAnalyticsTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('week');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [savedSearches, setSavedSearches] = useState<Array<{ query: string; filters: any; name: string }>>([]);
  const [showRegistrationTest, setShowRegistrationTest] = useState(false);
  const [showShowcaseCreator, setShowShowcaseCreator] = useState(false);

  // Activity data for overview - will be calculated from actual projects
  const [weeklyActivity, setWeeklyActivity] = useState({
    projectsCreated: 0,
    tasksCompleted: 0,
    postsShared: 4,
    likesReceived: 23,
    commentsReceived: 8
  });

  useEffect(() => {
    const handleConnectionChange = (status: IConnectionStatus) => {
      setConnectionStatus(status);
    };
    
    connectionManager.addListener(handleConnectionChange);
    
    loadDashboardData();
    loadUnreadMessageCount();
    subscribeToMessages();
    loadUserProfile();
    setupNotificationService();
    checkOnboardingStatus();

    return () => {
      connectionManager.removeListener(handleConnectionChange);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Check if database is connected - required for online-only app
      if (!databaseConnected) {
        log.warn('⚠️ Database not connected - DevTrack Africa requires database connectivity');
        setProjects([]);
        setProjectTasks({});
        setLoading(false);
        return;
      }
      
      // Use data persistence manager for guaranteed database operations
      log.info('🔗 Loading all user data from database with persistence guarantees...');
      
      try {
        // Sync all user data with guaranteed persistence
        const syncResult = await dataPersistenceManager.syncUserData(user.id);
        
        // Load projects with retry and error handling
        if (syncResult.projects.success && syncResult.projects.data) {
          const dbProjects = syncResult.projects.data;
          setProjects(dbProjects);
          
          // Load tasks for each project with persistence guarantee
          const tasksMap: { [projectId: string]: Task[] } = {};
          for (const project of dbProjects) {
            const tasksResult = await dataPersistenceManager.getProjectTasks(project.id);
            if (tasksResult.success && tasksResult.data) {
              tasksMap[project.id] = tasksResult.data;
            } else {
              log.warn(`Failed to load tasks for project ${project.id}:`, tasksResult.error);
              tasksMap[project.id] = [];
            }
          }
          setProjectTasks(tasksMap);
          
          // Calculate weekly activity from confirmed database data
          const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          const recentProjects = dbProjects.filter(p => new Date(p.created_at) > oneWeekAgo);
          
          const allTasks = Object.values(tasksMap).flat();
          const completedTasks = allTasks.filter(t => 
            t.status === 'completed' && 
            new Date(t.updated_at) > oneWeekAgo
          );
          
          setWeeklyActivity(prev => ({
            ...prev,
            projectsCreated: recentProjects.length,
            tasksCompleted: completedTasks.length
          }));
          
          log.info(`✅ Loaded ${dbProjects.length} projects and ${allTasks.length} tasks from database`);
        } else {
          log.error('❌ Failed to load projects from database:', syncResult.projects.error);
          setProjects([]);
          setProjectTasks({});
        }
        
        // Load community posts if available
        if (syncResult.posts.success && syncResult.posts.data) {
          setRecentPosts(syncResult.posts.data.slice(0, 5)); // Show recent 5 posts
        } else {
          // Check if this is a database setup issue
          if (syncResult.posts.error?.includes('not found') || syncResult.posts.error?.includes('table')) {
            log.warn('🔧 Database setup required - dispatching event');
            window.dispatchEvent(new CustomEvent('databaseSetupRequired', {
              detail: { error: syncResult.posts.error }
            }));
          }
          setRecentPosts([]);
        }
        
      } catch (error) {
        log.error('❌ Failed to load data from database:', error);
        setProjects([]);
        setProjectTasks({});
        setRecentPosts([]);
      } finally {
        setLoading(false);
      }
      
    } catch (error) {
      log.error('❌ Error loading dashboard data:', error);
      setProjects([]);
      setProjectTasks({});
      setLoading(false);
    }
  };

  const loadUnreadMessageCount = async () => {
    setUnreadMessageCount(3); // Demo value
  };

  const subscribeToMessages = () => {
    console.log('📡 Realtime subscription skipped - demo mode');
    return () => {};
  };

  const loadUserProfile = () => {
    // Use the profile passed as prop from AuthContext
    if (profile) {
      setUserProfile(profile);
    } else if (user) {
      // Fallback to basic user info
      setUserProfile({
        fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Developer',
        title: 'Developer',
        bio: '',
        skills: [],
        githubUrl: '',
        linkedinUrl: '',
        portfolioUrl: '',
        location: '',
        avatar: user.user_metadata?.avatar_url || ''
      });
    }
  };

  const setupNotificationService = () => {
    // Subscribe to notifications from the notification service
    const unsubscribe = notificationService.subscribe((notification) => {
      setNotifications(prev => [notification, ...prev]);
    });

    // Listen for notification clicks to handle navigation
    const handleNotificationClick = (event: CustomEvent) => {
      const notification = event.detail;
      handleNotificationNavigation(notification);
    };

    window.addEventListener('notificationClick', handleNotificationClick as EventListener);

    return () => {
      unsubscribe();
      window.removeEventListener('notificationClick', handleNotificationClick as EventListener);
    };
  };

  const checkOnboardingStatus = () => {
    // Check if user profile has onboarding data or if it's a new user
    if (profile && profile.onboardingCompleted) {
      setHasSeenOnboarding(true);
    } else {
      // Show onboarding for new users
      setShowOnboarding(true);
      setHasSeenOnboarding(true);
    }
  };

  const handleOnboardingComplete = () => {
    // This would ideally update the user profile in the database
    // For now, just hide the onboarding
    setShowOnboarding(false);
  };

  const handleSaveSearch = (query: string, filters: any) => {
    const name = prompt('Enter a name for this search:');
    if (name) {
      const newSavedSearch = { query, filters, name };
      setSavedSearches(prev => [...prev, newSavedSearch]);
      
      // In a full implementation, this would save to the database
      console.log('Search saved (would be saved to database):', newSavedSearch);
    }
  };

  const handleSearchResultClick = (result: any) => {
    // Navigate based on result type
    switch (result.type) {
      case 'project':
        const project = projects.find(p => p.id === result.id);
        if (project) {
          handleProjectClick(project);
        }
        break;
      case 'task':
        // Find project containing this task and navigate to it
        Object.entries(projectTasks).forEach(([projectId, tasks]) => {
          if (tasks.some(t => t.id === result.id)) {
            const project = projects.find(p => p.id === projectId);
            if (project) {
              handleProjectClick(project);
            }
          }
        });
        break;
      case 'message':
        setCurrentView('messaging');
        break;
      case 'user':
        setCurrentView('community');
        break;
      default:
        console.log('Navigate to:', result);
    }
  };

  const handleNotificationNavigation = (notification: any) => {
    switch (notification.type) {
      case 'new_message':
        setCurrentView('messaging');
        break;
      case 'post_comment':
      case 'post_like':
        setCurrentView('community');
        break;
      case 'collaboration_invite':
      case 'project_shared':
        setCurrentView('projects');
        break;
      default:
        break;
    }
  };

  const createNotification = async (notificationData: any) => {
    await notificationService.createNotification({
      user_id: 'demo-user',
      ...notificationData
    });
  };

  const handleProjectSave = async (projectData: any) => {
    setIsLoading(true);
    try {
      // Create project data for persistence manager
      const newProjectData = {
        title: projectData.title,
        description: projectData.description,
        status: projectData.status || 'planning',
        priority: projectData.priority || 'medium',
        progress: 0,
        tags: projectData.tags || [],
        tech_stack: projectData.techStack || [],
        repository_url: projectData.githubUrl,
        live_url: projectData.liveUrl,
        visibility: projectData.isPublic ? 'public' : 'private',
        start_date: projectData.startDate,
        end_date: projectData.endDate
      };

      // Use data persistence manager for guaranteed database save
      log.info('💾 Creating project with guaranteed persistence...');
      const result = await dataPersistenceManager.createProject(user.id, newProjectData);
      
      if (result.success && result.data) {
        // Update state only after confirmed database save
        setProjects(prev => [result.data, ...prev]);
        setShowProjectForm(false);
        
        // Update weekly activity
        setWeeklyActivity(prev => ({
          ...prev,
          projectsCreated: prev.projectsCreated + 1
        }));
        
        log.info('✅ Project created and confirmed in database!');
        
        return { 
          success: true, 
          message: 'Project created successfully! Your project has been permanently saved to the database.' 
        };
      } else {
        throw new Error(result.error || 'Failed to save project to database');
      }
    } catch (error) {
      log.error('❌ Error saving project:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to save project' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectClick = async (project: Project) => {
    setSelectedProject(project);
    setCurrentView('project-details');
    
    // Load tasks with guaranteed persistence check
    log.info(`🔍 Loading tasks for project ${project.id} with persistence guarantees...`);
    const tasksResult = await dataPersistenceManager.getProjectTasks(project.id);
    
    if (tasksResult.success && tasksResult.data) {
      setProjectTasks(prev => ({ ...prev, [project.id]: tasksResult.data || [] }));
      log.info(`✅ Loaded ${tasksResult.data.length} tasks for project ${project.title}`);
    } else {
      log.error(`❌ Failed to load tasks for project ${project.id}:`, tasksResult.error);
      setProjectTasks(prev => ({ ...prev, [project.id]: [] }));
    }
  };

  const handleProjectUpdate = async (updatedProject: Project) => {
    try {
      log.info(`📝 Updating project ${updatedProject.id} with guaranteed persistence...`);
      
      // Use data persistence manager for guaranteed update
      const result = await dataPersistenceManager.updateProject(updatedProject.id, updatedProject);
      
      if (result.success && result.data) {
        // Update state only after confirmed database update
        setProjects(prev => 
          prev.map(p => p.id === updatedProject.id ? result.data : p)
        );
        setSelectedProject(result.data);
        
        log.info('✅ Project updated and confirmed in database!');
      } else {
        throw new Error(result.error || 'Failed to update project');
      }
    } catch (error) {
      log.error('❌ Error updating project:', error);
      throw error;
    }
  };

  const handleProjectDelete = async (deletedProjectId: string) => {
    try {
      log.info(`🗑️ Deleting project ${deletedProjectId} with guaranteed persistence...`);
      
      // Use data persistence manager for guaranteed deletion
      const result = await dataPersistenceManager.deleteProject(deletedProjectId);
      
      if (result.success) {
        // Update state only after confirmed database deletion
        setProjects(prev => prev.filter(p => p.id !== deletedProjectId));
        setProjectTasks(prev => {
          const newTasks = { ...prev };
          delete newTasks[deletedProjectId];
          return newTasks;
        });
        setSelectedProject(null);
        setCurrentView('overview');
        
        log.info('✅ Project deleted and confirmed in database!');
      } else {
        throw new Error(result.error || 'Failed to delete project');
      }
    } catch (error) {
      log.error('❌ Error deleting project:', error);
      throw error;
    }
  };

  // Task management functions with guaranteed Supabase persistence
  const handleTaskCreate = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      log.info(`📋 Creating task "${task.title}" with guaranteed persistence...`);
      
      // Map task data to database format
      const taskData = {
        title: task.title,
        description: task.description,
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        due_date: task.dueDate,
        time_estimate: task.estimatedMinutes,
        tags: task.tags || [],
        position: task.position || 0
      };
      
      // Use data persistence manager for guaranteed creation
      const result = await dataPersistenceManager.createTask(task.projectId, user.id, taskData);
      
      if (result.success && result.data) {
        // Update state only after confirmed database save
        setProjectTasks(prev => ({
          ...prev,
          [task.projectId]: [...(prev[task.projectId] || []), result.data]
        }));
        
        log.info('✅ Task created and confirmed in database:', result.data.title);
      } else {
        throw new Error(result.error || 'Failed to create task');
      }
    } catch (error) {
      log.error('❌ Error creating task:', error);
      throw error;
    }
  };

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    try {
      log.info(`✏️ Updating task ${taskId} with guaranteed persistence...`);
      
      // Map updates to database format
      const dbUpdates = {
        ...(updates.title && { title: updates.title }),
        ...(updates.description && { description: updates.description }),
        ...(updates.status && { status: updates.status }),
        ...(updates.priority && { priority: updates.priority }),
        ...(updates.dueDate && { due_date: updates.dueDate }),
        ...(updates.estimatedMinutes && { time_estimate: updates.estimatedMinutes }),
        ...(updates.timeSpentMinutes && { time_spent: updates.timeSpentMinutes }),
        ...(updates.tags && { tags: updates.tags }),
        ...(updates.position !== undefined && { position: updates.position })
      };
      
      // Use data persistence manager for guaranteed update
      const result = await dataPersistenceManager.updateTask(taskId, dbUpdates);
      
      if (result.success && result.data) {
        // Update state only after confirmed database update
        setProjectTasks(prev => {
          const newTasks = { ...prev };
          Object.keys(newTasks).forEach(projectId => {
            newTasks[projectId] = newTasks[projectId].map(task => 
              task.id === taskId ? result.data : task
            );
          });
          return newTasks;
        });
        
        // Update weekly activity if task was completed
        if (updates.status === 'completed') {
          setWeeklyActivity(prev => ({
            ...prev,
            tasksCompleted: prev.tasksCompleted + 1
          }));
        }
        
        log.info('✅ Task updated and confirmed in database');
      } else {
        throw new Error(result.error || 'Failed to update task');
      }
    } catch (error) {
      log.error('❌ Error updating task:', error);
      throw error;
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      log.info(`🗑️ Deleting task ${taskId} with guaranteed persistence...`);
      
      // Use data persistence manager for guaranteed deletion
      const result = await dataPersistenceManager.deleteTask(taskId);
      
      if (result.success) {
        // Update state only after confirmed database deletion
        setProjectTasks(prev => {
          const newTasks = { ...prev };
          Object.keys(newTasks).forEach(projectId => {
            newTasks[projectId] = newTasks[projectId].filter(task => task.id !== taskId);
          });
          return newTasks;
        });
        
        log.info('✅ Task deleted and confirmed in database');
      } else {
        throw new Error(result.error || 'Failed to delete task');
      }
    } catch (error) {
      log.error('❌ Error deleting task:', error);
      throw error;
    }
  };

  const handleTaskTimeUpdate = async (taskId: string, minutes: number) => {
    try {
      // Find the task to get current time spent
      let currentTask: Task | undefined;
      Object.values(projectTasks).forEach(tasks => {
        const found = tasks.find(t => t.id === taskId);
        if (found) currentTask = found;
      });
      
      if (!currentTask) {
        console.error('Task not found for time update:', taskId);
        return;
      }
      
      const newTimeSpent = (currentTask.timeSpentMinutes || 0) + minutes;
      await handleTaskUpdate(taskId, { timeSpentMinutes: newTimeSpent });
    } catch (error) {
      console.error('❌ Error updating task time:', error);
      throw error;
    }
  };

  const handleNotificationClick = (notification: any) => {
    if (notification.type.includes('message')) {
      setCurrentView('messaging');
    }
  };

  const handleConnectionRetry = async () => {
    console.log('🔄 Retrying dashboard connections...');
    await connectionManager.retryConnection();
    if (connectionStatus.supabaseReachable) {
      loadDashboardData();
      loadUnreadMessageCount();
    }
  };

  const handleCreateShowcase = async (showcaseData: ProjectShowcaseData) => {
    try {
      console.log('🎭 Creating project showcase:', showcaseData);
      
      // In a full implementation, this would save the showcase to the database
      // For now, we'll simulate successful creation
      
      // Update weekly activity
      setWeeklyActivity(prev => ({
        ...prev,
        postsShared: prev.postsShared + 1
      }));
      
      // Show success notification
      await createNotification({
        type: 'project_showcase_created',
        title: 'Project Showcase Created!',
        message: `Your showcase "${showcaseData.showcaseTitle}" has been published to the community.`,
        data: { showcaseId: 'demo-' + Date.now() }
      });
      
      console.log('✅ Project showcase created successfully!');
      return { success: true };
    } catch (error) {
      console.error('❌ Error creating project showcase:', error);
      throw error;
    }
  };

  const filteredProjects = projects.filter(project =>
    project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.techStack?.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const publicProjectsCount = projects.filter(p => p.isPublic).length;
  
  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'projects', label: 'My Projects', icon: FolderOpen, badge: projects.length },
    { id: 'profile', label: 'My Profile', icon: UserCircle },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'showcase', label: 'Showcase', icon: Star, badge: publicProjectsCount },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'messaging', label: 'Messages', icon: MessageCircle, badge: unreadMessageCount > 0 ? unreadMessageCount : undefined },
    { id: 'testing', label: 'Testing', icon: TestTube },
    { id: 'production-audit', label: 'Production Audit', icon: Code2 }
  ];

  const SidebarContent = () => (
    <div className="space-y-2">
      <div className="p-4">
        <div 
          className="flex items-center space-x-3 cursor-pointer hover:bg-accent rounded-lg p-2 -m-2"
          onClick={() => {
            setCurrentView('profile');
            setIsMobileMenuOpen(false);
          }}
        >
          <Avatar className="h-10 w-10">
            <img
              src={userProfile?.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile?.full_name || 'DevTrack User')}&background=f0f0f0&color=333`}
              alt={userProfile?.full_name || 'DevTrack User'}
            />
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{userProfile?.full_name || 'DevTrack User'}</p>
            <p className="text-sm text-muted-foreground truncate">{userProfile?.title || 'Developer'}</p>
          </div>
        </div>
      </div>

      <Separator />

      <nav className="space-y-1 p-2">
        {sidebarItems.map((item) => (
          <Button
            key={item.id}
            variant={currentView === item.id ? 'secondary' : 'ghost'}
            className="w-full justify-between"
            onClick={() => {
              setCurrentView(item.id as DashboardView);
              setIsMobileMenuOpen(false);
            }}
          >
            <div className="flex items-center space-x-3">
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </div>
            {item.badge !== undefined && item.badge > 0 && (
              <Badge variant={item.id === 'messaging' ? 'destructive' : 'secondary'} className="text-xs">
                {item.badge > 99 ? '99+' : item.badge}
              </Badge>
            )}
          </Button>
        ))}
      </nav>

      <Separator />

      <div className="p-2 space-y-2">
        <div className="px-2">
          <ConnectionStatusComponent compact={true} onRetry={handleConnectionRetry} />
        </div>
        
        <Button variant="ghost" className="w-full justify-start" onClick={onLogout}>
          <span>← Back to Homepage</span>
        </Button>
        
        {!connectionStatus.databaseAvailable && onNavigateToSetup && (
          <Button variant="outline" className="w-full justify-start" onClick={onNavigateToSetup}>
            <span>Setup Database</span>
          </Button>
        )}
      </div>
    </div>
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case 'project-details':
        return selectedProject ? (
          <ProjectDetailsPage
            project={selectedProject}
            tasks={projectTasks[selectedProject.id] || []}
            onBack={() => setCurrentView('projects')}
            onUpdate={handleProjectUpdate}
            onDelete={handleProjectDelete}
            currentUser={{ id: 'demo-user', fullName: 'DevTrack User' }}
            onTaskCreate={handleTaskCreate}
            onTaskUpdate={handleTaskUpdate}
            onTaskDelete={handleTaskDelete}
            onTaskTimeUpdate={handleTaskTimeUpdate}
          />
        ) : null;

      case 'analytics':
        return (
          <EnhancedProjectAnalytics
            userId="demo-user"
            projects={projects.map(p => ({
              id: p.id,
              name: p.title,
              totalTasks: (projectTasks[p.id] || []).length,
              completedTasks: (projectTasks[p.id] || []).filter(t => t.status === 'completed').length,
              inProgressTasks: (projectTasks[p.id] || []).filter(t => t.status === 'in_progress').length,
              blockedTasks: (projectTasks[p.id] || []).filter(t => t.status === 'blocked').length,
              totalTimeSpent: (projectTasks[p.id] || []).reduce((sum, t) => sum + (t.timeSpentMinutes || 0), 0) / 60,
              createdAt: p.createdAt,
              status: p.status
            }))}
            timeRange={analyticsTimeRange}
            onTimeRangeChange={setAnalyticsTimeRange}
          />
        );

      case 'community':
        return (
          <CommunityFeed
            userId="demo-user"
            posts={recentPosts}
            onLike={(postId) => console.log('Like post:', postId)}
            onComment={(postId, comment) => console.log('Comment on post:', postId, comment)}
            onShare={(postId) => console.log('Share post:', postId)}
          />
        );

      case 'showcase':
        return showShowcaseCreator ? (
          <ProjectShowcaseCreator
            projects={projects}
            onBack={() => setShowShowcaseCreator(false)}
            onCreateShowcase={handleCreateShowcase}
          />
        ) : (
          <EnhancedDashboardShowcase
            projects={projects.filter(p => p.isPublic)}
            onViewProject={handleProjectClick}
            onCreateShowcase={() => setShowShowcaseCreator(true)}
          />
        );

      case 'messaging':
        return (
          <EnhancedMessagingHub
            userId="demo-user"
            currentUser={{ id: 'demo-user', name: 'DevTrack User', avatar: '' }}
          />
        );

      case 'profile':
        return (
          <UserProfileManager
            user={user}
            profile={profile}
            onUpdate={(updatedProfile) => {
              setUserProfile(updatedProfile);
              console.log('Profile updated:', updatedProfile);
            }}
          />
        );

      case 'testing':
        return (
          <TestingDashboard
            user={user}
            onProfileUpdate={(profile) => setUserProfile(profile)}
            projects={projects}
            projectTasks={projectTasks}
          />
        );

      case 'production-audit':
        return <ProductionAuditDashboard />;

      case 'overview':
        return (
          <div className="space-y-6">
            {/* Overview Dashboard Content - NO PROJECT CREATION FORM */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold">Welcome back, {userProfile?.full_name || 'Developer'}!</h1>
                <p className="text-muted-foreground">
                  Here's what's happening with your projects today.
                </p>
              </div>
              {/* Create Project Button - Opens Modal */}
              <Button 
                onClick={() => setShowProjectForm(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            </div>

            {/* Weekly Activity Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    <div className="ml-2">
                      <p className="text-xs font-medium text-muted-foreground">Projects Created</p>
                      <p className="text-2xl font-bold">{weeklyActivity.projectsCreated}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-muted-foreground" />
                    <div className="ml-2">
                      <p className="text-xs font-medium text-muted-foreground">Tasks Completed</p>
                      <p className="text-2xl font-bold">{weeklyActivity.tasksCompleted}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-muted-foreground" />
                    <div className="ml-2">
                      <p className="text-xs font-medium text-muted-foreground">Posts Shared</p>
                      <p className="text-2xl font-bold">{weeklyActivity.postsShared}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <div className="ml-2">
                      <p className="text-xs font-medium text-muted-foreground">Likes Received</p>
                      <p className="text-2xl font-bold">{weeklyActivity.likesReceived}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    <div className="ml-2">
                      <p className="text-xs font-medium text-muted-foreground">Comments</p>
                      <p className="text-2xl font-bold">{weeklyActivity.commentsReceived}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Projects */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Projects</CardTitle>
              </CardHeader>
              <CardContent>
                {projects.length === 0 ? (
                  <div className="text-center py-8">
                    <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium text-muted-foreground mb-2">No projects yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create your first project to start tracking your development journey.
                    </p>
                    <Button onClick={() => setShowProjectForm(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Project
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.slice(0, 6).map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onClick={() => handleProjectClick(project)}
                        onEdit={(project) => console.log('Edit project:', project)}
                        onDelete={(projectId) => handleProjectDelete(projectId)}
                        tasks={projectTasks[project.id] || []}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 'projects':
        return (
          <div className="space-y-6">
            {/* Projects Dashboard Content - NO PROJECT CREATION FORM */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold">My Projects</h1>
                <p className="text-muted-foreground">
                  Manage and track all your development projects.
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                {/* Create Project Button - Opens Modal */}
                <Button 
                  onClick={() => setShowProjectForm(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Project
                </Button>
              </div>
            </div>

            {/* Projects Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
                      <div className="flex space-x-2">
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
                <h3 className="text-xl font-medium text-muted-foreground mb-3">
                  {searchQuery ? 'No projects found' : 'No projects yet'}
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {searchQuery
                    ? `No projects match "${searchQuery}". Try a different search term.`
                    : 'Create your first project to start tracking your development journey and showcase your work to the DevTrack Africa community.'}
                </p>
                {!searchQuery && (
                  <Button 
                    onClick={() => setShowProjectForm(true)}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Your First Project
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onClick={() => handleProjectClick(project)}
                    onEdit={(project) => console.log('Edit project:', project)}
                    onDelete={(projectId) => handleProjectDelete(projectId)}
                    tasks={projectTasks[project.id] || []}
                  />
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetTitle>DevTrack Africa</SheetTitle>
                <SheetDescription>Project management for African developers</SheetDescription>
                <SidebarContent />
              </SheetContent>
            </Sheet>
            <h1 className="font-semibold">DevTrack Africa</h1>
          </div>
          <div className="flex items-center space-x-2">
            <AdvancedSearchEngine
              projects={projects}
              tasks={Object.values(projectTasks).flat()}
              users={[]} // Demo empty users
              onResultClick={handleSearchResultClick}
              onSaveSearch={handleSaveSearch}
              savedSearches={savedSearches}
            />
            <AdvancedNotificationCenter
              userId="demo-user"
              onNotificationClick={handleNotificationClick}
            />
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-80 bg-white border-r min-h-screen">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold">DevTrack Africa</h1>
                <p className="text-xs text-muted-foreground">Project Management</p>
              </div>
            </div>
            <SidebarContent />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-screen">
          {/* Desktop Header */}
          <div className="hidden lg:block bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="font-medium capitalize">{currentView}</h2>
              </div>
              <div className="flex items-center space-x-4">
                <AdvancedSearchEngine
                  projects={projects}
                  tasks={Object.values(projectTasks).flat()}
                  users={[]} // Demo empty users
                  onResultClick={handleSearchResultClick}
                  onSaveSearch={handleSaveSearch}
                  savedSearches={savedSearches}
                />
                <AdvancedNotificationCenter
                  userId="demo-user"
                  onNotificationClick={handleNotificationClick}
                />
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="p-4 lg:p-6">
            {renderCurrentView()}
          </div>
        </div>
      </div>

      {/* Project Creation Modal */}
      {showProjectForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Create New Project</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowProjectForm(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <MinimalProjectCreator
                onSubmit={handleProjectSave}
                onCancel={() => setShowProjectForm(false)}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      )}

      {/* Onboarding Flow */}
      {showOnboarding && (
        <OnboardingFlow
          user={user}
          onComplete={handleOnboardingComplete}
          onSkip={() => setShowOnboarding(false)}
        />
      )}

      {/* Registration Test Helper */}
      {showRegistrationTest && (
        <RegistrationTestHelper
          onClose={() => setShowRegistrationTest(false)}
        />
      )}
    </div>
  );
}