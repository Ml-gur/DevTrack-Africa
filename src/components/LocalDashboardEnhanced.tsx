/**
 * Enhanced Local Dashboard with Comprehensive Project Management
 * Integrates individual project management with resources and tasks
 */

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { LocalUser, LocalProfile, useAuth } from '../contexts/LocalOnlyAuthContext';
import { localDatabase, LocalProject, LocalTask, LocalPost } from '../utils/local-storage-database';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { toast } from 'sonner@2.0.3';
import { DashboardLoader } from './OptimizedLoader';
import {
  FolderOpen,
  Plus,
  CheckCircle,
  Clock,
  Target,
  TrendingUp,
  Users,
  Settings as SettingsIcon,
  LogOut,
  Edit,
  Trash2,
  ExternalLink,
  Github,
  Globe,
  Calendar,
  Tag,
  BarChart3,
  Activity,
  Brain,
  Rocket,
  Star,
  Heart,
  MessageCircle,
  Command,
  Eye,
  MoreVertical
} from 'lucide-react';

// Lazy load heavy components
const EnhancedComprehensiveProjectManager = lazy(() => import('./EnhancedComprehensiveProjectManager'));
const MinimalProjectManager = lazy(() => import('./MinimalProjectManager'));
const SettingsPanel = lazy(() => import('./SettingsPanel'));
const CommandPalette = lazy(() => import('./CommandPalette'));
const OnboardingTour = lazy(() => import('./OnboardingTour'));
const PerformanceDashboard = lazy(() => import('./PerformanceDashboard'));
const CommunityFeedFixed = lazy(() => import('./CommunityFeedFixed'));
const EnhancedProjectCreationWizard = lazy(() => import('./EnhancedProjectCreationWizard'));
const ProjectCreationHub = lazy(() => import('./ProjectCreationHub'));

export default function LocalDashboardEnhanced() {
  const { user, profile, signOut } = useAuth();
  const [projects, setProjects] = useState<LocalProject[]>([]);
  const [tasks, setTasks] = useState<LocalTask[]>([]);
  const [selectedProject, setSelectedProject] = useState<LocalProject | null>(null);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalTasks: 0,
    completedTasks: 0
  });
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showProjectCreation, setShowProjectCreation] = useState(false);
  const [currentTab, setCurrentTab] = useState<string>('projects');

  // Load data
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  // Command palette keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const userProjects = await localDatabase.getProjects(user.id);
      const userTasks = await localDatabase.getTasks(user.id);
      
      setProjects(userProjects);
      setTasks(userTasks);
      
      setStats({
        totalProjects: userProjects.length,
        activeProjects: userProjects.filter(p => p.status === 'active' || p.status === 'in_progress').length,
        completedProjects: userProjects.filter(p => p.status === 'completed').length,
        totalTasks: userTasks.length,
        completedTasks: userTasks.filter(t => t.status === 'completed').length
      });
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Project creation handler
  const handleCreateProject = async (projectData: any): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const newProject = await localDatabase.createProject({
        ...projectData,
        userId: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      await loadData();
      toast.success('Project created successfully!');
      return { success: true };
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  // Task handlers for project manager
  const handleTaskUpdate = async (taskId: string, updates: Partial<LocalTask>) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      
      const updated = { ...task, ...updates, updatedAt: new Date().toISOString() };
      await localDatabase.updateTask(taskId, updated);
      
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
      toast.success('Task updated successfully');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const handleTaskCreate = async (newTask: Omit<LocalTask, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    
    try {
      const task: LocalTask = {
        ...newTask,
        id: `task-${Date.now()}`,
        userId: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await localDatabase.createTask(task);
      setTasks(prev => [...prev, task]);
      toast.success('Task created successfully');
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      await localDatabase.deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const handleTaskTimeUpdate = async (taskId: string, minutes: number) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      
      const updated = {
        ...task,
        timeSpentMinutes: (task.timeSpentMinutes || 0) + minutes,
        updatedAt: new Date().toISOString()
      };
      
      await localDatabase.updateTask(taskId, updated);
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
    } catch (error) {
      console.error('Error updating task time:', error);
      toast.error('Failed to update time');
    }
  };

  const handleProjectUpdate = async (projectId: string, updates: Partial<LocalProject>) => {
    try {
      const project = projects.find(p => p.id === projectId);
      if (!project) return;
      
      const updated = { ...project, ...updates, updatedAt: new Date().toISOString() };
      await localDatabase.updateProject(projectId, updated);
      
      setProjects(prev => prev.map(p => p.id === projectId ? updated : p));
      if (selectedProject?.id === projectId) {
        setSelectedProject(updated);
      }
      toast.success('Project updated successfully');
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
    }
  };

  const handleProjectDelete = async (projectId: string) => {
    try {
      // Delete all tasks associated with the project
      const projectTasks = tasks.filter(t => t.projectId === projectId);
      await Promise.all(projectTasks.map(t => localDatabase.deleteTask(t.id)));
      
      // Delete the project
      await localDatabase.deleteProject(projectId);
      
      setProjects(prev => prev.filter(p => p.id !== projectId));
      setTasks(prev => prev.filter(t => t.projectId !== projectId));
      setSelectedProject(null);
      toast.success('Project deleted successfully');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      planning: 'bg-blue-100 text-blue-700',
      active: 'bg-purple-100 text-purple-700',
      in_progress: 'bg-purple-100 text-purple-700',
      completed: 'bg-green-100 text-green-700',
      'on-hold': 'bg-yellow-100 text-yellow-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-gray-100 text-gray-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-red-100 text-red-700'
    };
    return colors[priority] || 'bg-gray-100 text-gray-700';
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">
      <p>Please log in to continue</p>
    </div>;
  }

  if (loading) {
    return <DashboardLoader />;
  }

  // If a project is selected, show the minimal project manager
  if (selectedProject) {
    const projectTasks = tasks.filter(t => t.projectId === selectedProject.id);
    
    return (
      <Suspense fallback={<DashboardLoader />}>
        <MinimalProjectManager
          project={selectedProject}
          tasks={projectTasks}
          milestones={[]}
          currentUserId={user.id}
          onBack={() => setSelectedProject(null)}
          onTaskUpdate={handleTaskUpdate}
          onTaskCreate={handleTaskCreate}
          onTaskDelete={handleTaskDelete}
          onTaskTimeUpdate={handleTaskTimeUpdate}
          onProjectUpdate={(updates) => handleProjectUpdate(selectedProject.id, updates)}
          onProjectDelete={() => handleProjectDelete(selectedProject.id)}
        />
      </Suspense>
    );
  }

  // Main dashboard view
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-lg">DevTrack Africa</h1>
                  <p className="text-xs text-muted-foreground">
                    Welcome back, {profile?.fullName || user.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCommandPalette(true)}
                className="gap-2"
              >
                <Command className="w-4 h-4" />
                <span className="hidden sm:inline">Command</span>
                <kbd className="hidden sm:inline-block px-2 py-1 text-xs bg-muted rounded">
                  ⌘K
                </kbd>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(true)}
              >
                <SettingsIcon className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard
              icon={<FolderOpen className="w-5 h-5 text-blue-600" />}
              label="Total Projects"
              value={stats.totalProjects}
              color="blue"
            />
            <StatCard
              icon={<TrendingUp className="w-5 h-5 text-purple-600" />}
              label="Active Projects"
              value={stats.activeProjects}
              color="purple"
            />
            <StatCard
              icon={<CheckCircle className="w-5 h-5 text-green-600" />}
              label="Completed"
              value={stats.completedProjects}
              color="green"
            />
            <StatCard
              icon={<Target className="w-5 h-5 text-indigo-600" />}
              label="Total Tasks"
              value={stats.totalTasks}
              color="indigo"
            />
            <StatCard
              icon={<CheckCircle className="w-5 h-5 text-emerald-600" />}
              label="Tasks Done"
              value={stats.completedTasks}
              color="emerald"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-4">
            <TabsTrigger value="projects">
              <FolderOpen className="w-4 h-4 mr-2" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="community">
              <Users className="w-4 h-4 mr-2" />
              Community
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="performance" className="hidden md:flex">
              <Activity className="w-4 h-4 mr-2" />
              Performance
            </TabsTrigger>
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">My Projects</h2>
              <Suspense fallback={<Button disabled>Loading...</Button>}>
                <ProjectCreationHub
                  onCreateProject={handleCreateProject}
                  showTrigger={true}
                />
              </Suspense>
            </div>

            {projects.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FolderOpen className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Start your development journey by creating your first project.
                    Track tasks, upload resources, and showcase your work!
                  </p>
                  <Suspense fallback={<Button disabled>Loading...</Button>}>
                    <ProjectCreationHub
                      onCreateProject={handleCreateProject}
                      showTrigger={true}
                    />
                  </Suspense>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <Card
                    key={project.id}
                    className="hover:shadow-lg transition-all cursor-pointer group"
                    onClick={() => setSelectedProject(project)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                          {project.title}
                        </CardTitle>
                        <Badge className={getPriorityColor(project.priority)}>
                          {project.priority}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {project.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(project.status)}>
                            {project.status?.replace('_', ' ')}
                          </Badge>
                          {project.isPublic && (
                            <Badge variant="outline" className="text-xs">
                              <Globe className="w-3 h-3 mr-1" />
                              Public
                            </Badge>
                          )}
                        </div>

                        {project.tags && project.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {project.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {project.tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{project.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2">
                          <span className="text-xs text-muted-foreground">
                            {tasks.filter(t => t.projectId === project.id).length} tasks
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProject(project);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Community Tab */}
          <TabsContent value="community">
            <Suspense fallback={<DashboardLoader />}>
              <CommunityFeedFixed currentUserId={user.id} />
            </Suspense>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Coming Soon</CardTitle>
                <CardDescription>
                  Advanced analytics and insights for your projects
                </CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance">
            <Suspense fallback={<DashboardLoader />}>
              <PerformanceDashboard />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      {showSettings && (
        <Suspense fallback={null}>
          <SettingsPanel
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
          />
        </Suspense>
      )}

      {showCommandPalette && (
        <Suspense fallback={null}>
          <CommandPalette
            isOpen={showCommandPalette}
            onClose={() => setShowCommandPalette(false)}
            projects={projects}
            onSelectProject={setSelectedProject}
          />
        </Suspense>
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({
  icon,
  label,
  value,
  color
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50',
    purple: 'bg-purple-50',
    green: 'bg-green-50',
    indigo: 'bg-indigo-50',
    emerald: 'bg-emerald-50'
  };

  return (
    <div className={`p-4 rounded-lg ${colorClasses[color]} border border-${color}-200`}>
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">{icon}</div>
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </div>
    </div>
  );
}