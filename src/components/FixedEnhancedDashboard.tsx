import React, { useState, useEffect } from 'react';
import { Plus, FolderOpen, BarChart3, Users, MessageCircle, Search, Menu, TestTube, Database, UserCircle, Star, Code2, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar } from './ui/avatar';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import MinimalProjectCreator from './MinimalProjectCreator';
import ProjectCard from './ProjectCard';
import ProjectDetailsPage from './ProjectDetailsPage';
import CommunityFeed from './CommunityFeed';
import RealTimeMessagingHub from './RealTimeMessagingHub';
import UserProfileManager from './UserProfileManager';
import SupabasePersistenceTester from './SupabasePersistenceTester';
import { 
  enhancedUserService, 
  enhancedProjectService, 
  enhancedTaskService, 
  syncUserData, 
  validateDatabaseConnection 
} from '../utils/supabase/enhanced-persistence';
import { UserProfile } from '../utils/supabase/auth-client';
import { log } from '../utils/production-logger';
import { Task } from '../types/task';
import { Project } from '../types/project';

interface FixedEnhancedDashboardProps {
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
  | 'community' 
  | 'messaging' 
  | 'profile'
  | 'testing';

export default function FixedEnhancedDashboard({ 
  user, 
  profile, 
  onLogout, 
  onNavigateToSetup, 
  databaseConnected 
}: FixedEnhancedDashboardProps) {
  const [currentView, setCurrentView] = useState<DashboardView>('overview');
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectTasks, setProjectTasks] = useState<{ [projectId: string]: Task[] }>({});
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dbHealthy, setDbHealthy] = useState<boolean | null>(null);

  // Database health check and initialization
  useEffect(() => {
    initializeDashboard();
  }, [user?.id, databaseConnected]);

  const initializeDashboard = async () => {
    if (!user || !databaseConnected) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      log.info('🚀 Initializing dashboard with database persistence...');

      // Validate database connection first
      const connectionResult = await validateDatabaseConnection();
      
      if (!connectionResult.success) {
        log.error('❌ Database connection validation failed:', connectionResult.error?.message);
        setDbHealthy(false);
        setLoading(false);
        return;
      }

      setDbHealthy(true);

      // Ensure user profile exists and is properly loaded
      const profileResult = await enhancedUserService.ensureUserProfile(user);
      
      if (!profileResult.success) {
        log.error('❌ Failed to ensure user profile:', profileResult.error?.message);
      }

      // Sync and load all user data
      const syncResult = await syncUserData(user.id);
      
      if (syncResult.projects.success && syncResult.projects.data) {
        const userProjects = syncResult.projects.data;
        setProjects(userProjects);
        log.info(`✅ Loaded ${userProjects.length} projects from database`);

        // Load tasks for each project
        const tasksMap: { [projectId: string]: Task[] } = {};
        
        for (const project of userProjects) {
          const tasksResult = await enhancedTaskService.getProjectTasks(project.id);
          if (tasksResult.success && tasksResult.data) {
            tasksMap[project.id] = tasksResult.data;
          } else {
            log.warn(`Failed to load tasks for project ${project.id}:`, tasksResult.error?.message);
            tasksMap[project.id] = [];
          }
        }
        
        setProjectTasks(tasksMap);
        log.info(`✅ Loaded tasks for ${Object.keys(tasksMap).length} projects`);
      } else {
        log.error('❌ Failed to load projects:', syncResult.projects.error?.message);
        setProjects([]);
      }

    } catch (error: any) {
      log.error('❌ Dashboard initialization failed:', error);
      setDbHealthy(false);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSave = async (projectData: any) => {
    if (!user || !databaseConnected) {
      return { success: false, error: 'Database connection required' };
    }

    setIsLoading(true);
    try {
      log.info('💾 Creating project with guaranteed persistence...');

      const result = await enhancedProjectService.createProject(user.id, {
        title: projectData.title,
        description: projectData.description,
        status: projectData.status || 'planning',
        priority: projectData.priority || 'medium',
        progress: 0,
        tech_stack: projectData.techStack || [],
        repository_url: projectData.githubUrl,
        live_url: projectData.liveUrl,
        visibility: projectData.isPublic ? 'public' : 'private',
        start_date: projectData.startDate,
        end_date: projectData.endDate
      });

      if (result.success && result.data) {
        // Update state only after confirmed database save
        setProjects(prev => [result.data, ...prev]);
        setShowProjectForm(false);
        
        log.info('✅ Project created and confirmed in database!');
        return { 
          success: true, 
          message: 'Project created successfully and saved to database!' 
        };
      } else {
        throw new Error(result.error?.message || 'Failed to save project');
      }
    } catch (error: any) {
      log.error('❌ Error saving project:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to save project' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectClick = async (project: Project) => {
    setSelectedProject(project);
    setCurrentView('project-details');
    
    // Load tasks with persistence guarantee
    log.info(`🔍 Loading tasks for project ${project.id}...`);
    const tasksResult = await enhancedTaskService.getProjectTasks(project.id);
    
    if (tasksResult.success && tasksResult.data) {
      setProjectTasks(prev => ({ ...prev, [project.id]: tasksResult.data }));
      log.info(`✅ Loaded ${tasksResult.data.length} tasks for project`);
    } else {
      log.error(`❌ Failed to load tasks:`, tasksResult.error?.message);
      setProjectTasks(prev => ({ ...prev, [project.id]: [] }));
    }
  };

  const handleTaskCreate = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('User not authenticated');

    const taskData = {
      project_id: task.projectId,
      user_id: user.id,
      title: task.title,
      description: task.description,
      status: task.status || 'todo',
      priority: task.priority || 'medium',
      position: task.position || 0,
      time_spent: 0
    };

    const result = await enhancedTaskService.createTask(taskData);
    
    if (result.success && result.data) {
      setProjectTasks(prev => ({
        ...prev,
        [task.projectId]: [...(prev[task.projectId] || []), result.data]
      }));
      log.info('✅ Task created and confirmed in database');
    } else {
      throw new Error(result.error?.message || 'Failed to create task');
    }
  };

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    const result = await enhancedTaskService.updateTask(taskId, updates);
    
    if (result.success && result.data) {
      setProjectTasks(prev => {
        const newTasks = { ...prev };
        Object.keys(newTasks).forEach(projectId => {
          newTasks[projectId] = newTasks[projectId].map(task => 
            task.id === taskId ? result.data : task
          );
        });
        return newTasks;
      });
      log.info('✅ Task updated and confirmed in database');
    } else {
      throw new Error(result.error?.message || 'Failed to update task');
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    if (!supabase) throw new Error('Database not available');

    const { error } = await supabase.from('tasks').delete().eq('id', taskId);
    
    if (error) {
      throw new Error(error.message);
    }

    setProjectTasks(prev => {
      const newTasks = { ...prev };
      Object.keys(newTasks).forEach(projectId => {
        newTasks[projectId] = newTasks[projectId].filter(task => task.id !== taskId);
      });
      return newTasks;
    });
    log.info('✅ Task deleted and confirmed in database');
  };

  const handleTaskTimeUpdate = async (taskId: string, minutes: number) => {
    let currentTask: Task | undefined;
    Object.values(projectTasks).forEach(tasks => {
      const found = tasks.find(t => t.id === taskId);
      if (found) currentTask = found;
    });

    if (!currentTask) return;

    const newTimeSpent = (currentTask.timeSpentMinutes || 0) + minutes;
    await handleTaskUpdate(taskId, { timeSpentMinutes: newTimeSpent });
  };

  // Show database connection error if not connected
  if (!databaseConnected || dbHealthy === false) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center">
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg border border-red-200">
          <div className="text-center">
            <Database className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <div className="font-semibold text-red-900 mb-2">
              Database Connection Required
            </div>
            <p className="text-sm text-red-700 mb-4">
              DevTrack Africa requires a working Supabase database connection. 
              {dbHealthy === false && ' Database validation failed.'}
            </p>
            <div className="space-y-2">
              <Button onClick={() => window.location.reload()} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Connection
              </Button>
              <Button onClick={onLogout} variant="ghost" className="w-full">
                Back to Homepage
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'projects', label: 'My Projects', icon: FolderOpen, badge: projects.length },
    { id: 'profile', label: 'My Profile', icon: UserCircle },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'messaging', label: 'Messages', icon: MessageCircle },
    { id: 'testing', label: 'Database Testing', icon: TestTube }
  ];

  const SidebarContent = () => (
    <div className="space-y-2">
      <div className="p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <img
              src={profile?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.fullName || 'DevTrack User')}&background=f0f0f0&color=333`}
              alt={profile?.fullName || 'DevTrack User'}
            />
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{profile?.fullName || 'DevTrack User'}</p>
            <p className="text-sm text-muted-foreground truncate">{profile?.title || 'Developer'}</p>
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
              <Badge variant="secondary" className="text-xs">
                {item.badge}
              </Badge>
            )}
          </Button>
        ))}
      </nav>

      <Separator />

      <div className="p-2">
        <Button variant="ghost" className="w-full justify-start" onClick={onLogout}>
          <span>← Back to Homepage</span>
        </Button>
      </div>
    </div>
  );

  const renderCurrentView = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Database className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Loading your data from database...</p>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl">Welcome back, {profile?.fullName || 'Developer'}!</h2>
                <p className="text-muted-foreground">Here's your project overview</p>
              </div>
              <Button onClick={() => setShowProjectForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Total Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{projects.length}</div>
                  <p className="text-xs text-muted-foreground">Stored in database</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Total Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Object.values(projectTasks).flat().length}
                  </div>
                  <p className="text-xs text-muted-foreground">Across all projects</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Completed Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Object.values(projectTasks).flat().filter(t => t.status === 'completed').length}
                  </div>
                  <p className="text-xs text-muted-foreground">Tasks finished</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Projects</CardTitle>
              </CardHeader>
              <CardContent>
                {projects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projects.slice(0, 4).map((project) => (
                      <div key={project.id} className="p-3 border rounded-lg cursor-pointer hover:bg-accent"
                           onClick={() => handleProjectClick(project)}>
                        <h4 className="font-medium">{project.title}</h4>
                        <p className="text-sm text-muted-foreground truncate">{project.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="outline">{project.status}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {projectTasks[project.id]?.length || 0} tasks
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">No projects yet</p>
                    <Button onClick={() => setShowProjectForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Project
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 'projects':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl">My Projects</h2>
                <p className="text-muted-foreground">Manage your development projects</p>
              </div>
              <Button onClick={() => setShowProjectForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects
                .filter(project =>
                  project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  project.description?.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onClick={() => handleProjectClick(project)}
                    taskCount={projectTasks[project.id]?.length || 0}
                  />
                ))}
            </div>

            {projects.length === 0 && (
              <div className="text-center py-12">
                <FolderOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No projects yet</h3>
                <p className="text-muted-foreground mb-4">Start your development journey by creating your first project</p>
                <Button onClick={() => setShowProjectForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Project
                </Button>
              </div>
            )}
          </div>
        );

      case 'project-details':
        return selectedProject ? (
          <ProjectDetailsPage
            project={selectedProject}
            tasks={projectTasks[selectedProject.id] || []}
            onBack={() => setCurrentView('projects')}
            onUpdate={async (updatedProject) => {
              const result = await enhancedProjectService.updateProject(selectedProject.id, updatedProject);
              if (result.success && result.data) {
                setProjects(prev => prev.map(p => p.id === selectedProject.id ? result.data : p));
                setSelectedProject(result.data);
              }
            }}
            onDelete={async (projectId) => {
              await supabase?.from('projects').delete().eq('id', projectId);
              setProjects(prev => prev.filter(p => p.id !== projectId));
              setCurrentView('projects');
            }}
            currentUser={{ id: user.id, fullName: profile?.fullName || 'User' }}
            onTaskCreate={handleTaskCreate}
            onTaskUpdate={handleTaskUpdate}
            onTaskDelete={handleTaskDelete}
            onTaskTimeUpdate={handleTaskTimeUpdate}
          />
        ) : null;

      case 'community':
        return (
          <CommunityFeed
            currentUser={{ id: user.id, fullName: profile?.fullName || 'User' }}
          />
        );

      case 'messaging':
        return (
          <RealTimeMessagingHub
            currentUser={{ id: user.id, fullName: profile?.fullName || 'User' }}
          />
        );

      case 'profile':
        return (
          <UserProfileManager
            user={user}
            profile={profile}
            onProfileUpdate={async (updates) => {
              const result = await enhancedUserService.updateUserProfile(user.id, updates);
              if (result.success) {
                log.info('✅ Profile updated successfully');
                return { success: true };
              } else {
                return { success: false, error: result.error?.message };
              }
            }}
          />
        );

      case 'testing':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl">Database Persistence Testing</h2>
              <p className="text-muted-foreground">
                Validate that your data is being reliably stored and retrieved from Supabase
              </p>
            </div>
            <SupabasePersistenceTester
              user={user}
              onTestComplete={(passed) => {
                if (passed) {
                  log.info('✅ All persistence tests passed');
                } else {
                  log.warn('⚠️ Some persistence tests failed');
                }
              }}
            />
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Select a section from the sidebar</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 border-r bg-background">
          <div className="sticky top-0 h-screen overflow-y-auto">
            <SidebarContent />
          </div>
        </div>

        {/* Mobile Sidebar */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetContent side="left" className="p-0 w-64">
            <SidebarContent />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <div className="flex-1">
          <header className="sticky top-0 z-40 border-b bg-background">
            <div className="flex items-center justify-between h-16 px-4">
              <div className="flex items-center space-x-4">
                <Sheet>
                  <SheetTrigger asChild className="lg:hidden">
                    <Button variant="outline" size="sm">
                      <Menu className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                </Sheet>
                <div>
                  <h1 className="font-semibold">DevTrack Africa</h1>
                  <p className="text-sm text-muted-foreground">Development Project Manager</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Database Connected
                </Badge>
              </div>
            </div>
          </header>

          <main className="p-6">
            {renderCurrentView()}
          </main>
        </div>
      </div>

      {/* Project Creation Modal */}
      {showProjectForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <MinimalProjectCreator
              onSave={handleProjectSave}
              onCancel={() => setShowProjectForm(false)}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
}