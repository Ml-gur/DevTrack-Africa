/**
 * Streamlined Dashboard - Focused on Project Management and Analytics
 * Removed: Community, Messaging, Collaboration, Templates
 * Kept: Projects (with full CRUD), Analytics (global dashboard)
 */

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useAuth } from '../contexts/LocalOnlyAuthContext';
import { localDatabase, LocalProject, LocalTask } from '../utils/local-storage-database';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { DashboardLoader } from './OptimizedLoader';
import {
  FolderOpen,
  Plus,
  CheckCircle,
  Clock,
  Target,
  TrendingUp,
  Settings as SettingsIcon,
  LogOut,
  Eye,
  BarChart3,
  Rocket,
  Globe,
  User
} from 'lucide-react';

// Import keyboard shortcuts manager (not lazy - needs to be active always)
import KeyboardShortcutsManager from './KeyboardShortcutsManager';

// Lazy load components
const EnhancedMinimalProjectManager = lazy(() => import('./EnhancedMinimalProjectManager'));
const SettingsPanel = lazy(() => import('./SettingsPanel'));
const ProjectCreationHub = lazy(() => import('./ProjectCreationHub'));
const EnhancedAnalyticsDashboard = lazy(() => import('./EnhancedAnalyticsDashboard'));
const ProfileViewer = lazy(() => import('./ProfileViewer'));

export default function StreamlinedDashboard() {
  const { user, profile, signOut } = useAuth();
  const [projects, setProjects] = useState<LocalProject[]>([]);
  const [tasks, setTasks] = useState<LocalTask[]>([]);
  const [selectedProject, setSelectedProject] = useState<LocalProject | null>(null);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    archivedProjects: 0,
    totalTasks: 0,
    completedTasks: 0
  });
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [currentTab, setCurrentTab] = useState<string>('projects');

  // Load data
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  // Auto-update all project statuses when tasks change
  useEffect(() => {
    if (tasks.length > 0 && projects.length > 0) {
      const projectsToUpdate = new Set(tasks.map(t => t.projectId).filter(Boolean));
      projectsToUpdate.forEach(projectId => {
        updateProjectStatus(projectId);
      });
    }
  }, [tasks.length, tasks.filter(t => t.status === 'completed').length]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const userProjects = await localDatabase.getProjects(user.id);
      const userTasks = await localDatabase.getUserTasks(user.id);
      
      setProjects(userProjects);
      setTasks(userTasks);
      
      setStats({
        totalProjects: userProjects.length,
        activeProjects: userProjects.filter(p => p.status === 'active' || p.status === 'in_progress').length,
        completedProjects: userProjects.filter(p => p.status === 'completed').length,
        archivedProjects: userProjects.filter(p => p.status === 'archived').length,
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

      await localDatabase.createProject(user.id, {
        ...projectData,
        status: projectData.status || 'in_progress'
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

  // Task handlers
  const handleTaskUpdate = async (taskId: string, updates: Partial<LocalTask>) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      // Handle time tracking
      let timeUpdates = {};
      
      // If moving to in_progress, start timer
      if (updates.status === 'in_progress' && task.status !== 'in_progress') {
        timeUpdates = { timerStartTime: new Date().toISOString() };
      }
      
      // If moving from in_progress to completed, calculate time spent
      if (updates.status === 'completed' && task.status === 'in_progress' && task.timerStartTime) {
        const startTime = new Date(task.timerStartTime).getTime();
        const endTime = new Date().getTime();
        const minutesSpent = Math.round((endTime - startTime) / (1000 * 60));
        timeUpdates = {
          timeSpentMinutes: (task.timeSpentMinutes || 0) + minutesSpent,
          timerStartTime: undefined
        };
      }
      
      const updated = {
        ...task,
        ...updates,
        ...timeUpdates,
        updated_at: new Date().toISOString()
      };
      
      await localDatabase.updateTask(taskId, updated);
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
      
      // Auto-update project status based on tasks
      if (task.projectId) {
        await updateProjectStatus(task.projectId);
      }
      
      toast.success('Task updated successfully');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const handleTaskCreate = async (newTask: Omit<LocalTask, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;
    
    try {
      const task = await localDatabase.createTask({
        ...newTask,
        userId: user.id
      });
      
      setTasks(prev => [...prev, task]);
      toast.success('Task created successfully');
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      await localDatabase.deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      
      // Auto-update project status after task deletion
      if (task?.projectId) {
        // Need to wait a bit for state to update
        setTimeout(() => updateProjectStatus(task.projectId), 100);
      }
      
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
        updated_at: new Date().toISOString()
      };
      
      await localDatabase.updateTask(taskId, updated);
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
    } catch (error) {
      console.error('Error updating task time:', error);
      toast.error('Failed to update time');
    }
  };

  // Auto-update project status based on tasks
  const updateProjectStatus = async (projectId: string) => {
    // Get fresh tasks for this project
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    const project = projects.find(p => p.id === projectId);
    
    if (!project) return;

    // Calculate progress percentage
    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const allCompleted = totalTasks > 0 && projectTasks.every(t => t.status === 'completed');
    const hasInProgress = projectTasks.some(t => t.status === 'in_progress');
    const hasTodo = projectTasks.some(t => t.status === 'todo');

    const updates: Partial<LocalProject> = {
      progress
    };

    // Auto-update status based on task completion
    if (allCompleted && totalTasks > 0 && project.status !== 'completed') {
      updates.status = 'completed';
      toast.success('🎉 Project completed! All tasks are done.', {
        duration: 4000
      });
    } else if ((hasInProgress || hasTodo) && project.status === 'completed') {
      // If project was completed but has active/pending tasks, move back to in_progress
      updates.status = 'in_progress';
    } else if (hasInProgress && project.status !== 'in_progress' && project.status !== 'completed') {
      // Auto-start project when first task is in progress
      updates.status = 'in_progress';
    }

    // Only update if there are changes
    if (updates.status !== project.status || updates.progress !== project.progress) {
      const updated = await localDatabase.updateProject(projectId, updates);
      if (updated) {
        setProjects(prev => prev.map(p => p.id === projectId ? updated : p));
        if (selectedProject?.id === projectId) {
          setSelectedProject(updated);
        }
      }
    }
  };

  const handleProjectUpdate = async (projectId: string, updates: Partial<LocalProject>) => {
    try {
      const project = projects.find(p => p.id === projectId);
      if (!project) return;

      // Prevent manual completion if there are incomplete tasks
      if (updates.status === 'completed') {
        const projectTasks = tasks.filter(t => t.projectId === projectId);
        const hasIncompleteTasks = projectTasks.some(t => t.status !== 'completed');
        
        if (hasIncompleteTasks) {
          toast.error('Cannot mark project as completed. Complete all tasks first.');
          return;
        }
      }
      
      const updated = await localDatabase.updateProject(projectId, updates);
      if (updated) {
        setProjects(prev => prev.map(p => p.id === projectId ? updated : p));
        if (selectedProject?.id === projectId) {
          setSelectedProject(updated);
        }
        toast.success('Project updated successfully');
        await loadData(); // Reload to update stats
      }
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
      await loadData(); // Reload stats
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
      planning: 'bg-blue-100 text-blue-700 border border-blue-200',
      active: 'bg-blue-100 text-blue-700 border border-blue-200',
      in_progress: 'bg-blue-100 text-blue-700 border border-blue-200',
      completed: 'bg-green-100 text-green-700 border border-green-200',
      archived: 'bg-gray-100 text-gray-700 border border-gray-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border border-gray-200';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-gray-100 text-gray-700 border border-gray-200',
      medium: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
      high: 'bg-red-100 text-red-700 border border-red-200'
    };
    return colors[priority] || 'bg-gray-100 text-gray-700 border border-gray-200';
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please log in to continue</p>
      </div>
    );
  }

  if (loading) {
    return <DashboardLoader />;
  }

  // If a project is selected, show the enhanced project manager
  if (selectedProject) {
    const projectTasks = tasks.filter(t => t.projectId === selectedProject.id);
    
    return (
      <Suspense fallback={<DashboardLoader />}>
        <EnhancedMinimalProjectManager
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-600 rounded-xl flex items-center justify-center shadow-sm">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-lg text-gray-900">DevTrack <span className="text-green-600">Africa</span></h1>
                  <p className="text-xs text-gray-600">
                    Welcome back, {profile?.fullName || user.email?.split('@')[0]}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Profile Dropdown */}
              <div className="relative group">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowProfile(true)}
                  className="flex items-center gap-2 hover:bg-blue-50"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {profile?.fullName ? profile.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                    </span>
                  </div>
                  <span className="hidden sm:inline text-gray-700">{profile?.fullName || user.email?.split('@')[0]}</span>
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(true)}
                className="hover:bg-blue-50"
              >
                <SettingsIcon className="w-4 h-4 text-gray-600" />
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
      <div className="bg-gradient-to-r from-blue-50 to-green-50 border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <StatCard
              icon={<FolderOpen className="w-5 h-5 text-blue-600" />}
              label="Total Projects"
              value={stats.totalProjects}
              color="blue"
            />
            <StatCard
              icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
              label="Active"
              value={stats.activeProjects}
              color="blue"
            />
            <StatCard
              icon={<CheckCircle className="w-5 h-5 text-green-600" />}
              label="Completed"
              value={stats.completedProjects}
              color="green"
            />
            <StatCard
              icon={<Target className="w-5 h-5 text-blue-600" />}
              label="Total Tasks"
              value={stats.totalTasks}
              color="blue"
            />
            <StatCard
              icon={<CheckCircle className="w-5 h-5 text-green-600" />}
              label="Tasks Done"
              value={stats.completedTasks}
              color="green"
            />
            <StatCard
              icon={<FolderOpen className="w-5 h-5 text-gray-600" />}
              label="Archived"
              value={stats.archivedProjects}
              color="gray"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="projects">
              <FolderOpen className="w-4 h-4 mr-2" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
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
              <Card className="border-blue-200 shadow-sm">
                <CardContent className="py-16 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FolderOpen className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">No projects yet</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Start your development journey by creating your first project.
                    Track tasks, add notes, upload resources, and monitor your progress!
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
                    className="hover:shadow-lg transition-all cursor-pointer group border-gray-200 shadow-sm"
                    onClick={() => setSelectedProject(project)}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-lg text-gray-900 group-hover:text-green-600 transition-colors line-clamp-1">
                          {project.title}
                        </h3>
                        <Badge className={getPriorityColor(project.priority)}>
                          {project.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {project.description}
                      </p>

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
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Suspense fallback={<DashboardLoader />}>
              <EnhancedAnalyticsDashboard
                userId={user.id}
                projects={projects}
                tasks={tasks}
              />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>

      {/* Keyboard Shortcuts Manager */}
      <KeyboardShortcutsManager
        onNavigate={(page) => {
          if (page === 'projects') setCurrentTab('projects');
          else if (page === 'analytics') setCurrentTab('analytics');
        }}
        onCreateProject={() => {
          // This will be handled by ProjectCreationHub trigger
          const createButton = document.querySelector('[data-project-create-trigger]') as HTMLElement;
          createButton?.click();
        }}
        onOpenSearch={() => {
          // Implement search functionality
          toast.info('Search feature coming soon!');
        }}
        onToggleSettings={() => setShowSettings(!showSettings)}
      />

      {/* Modals */}
      {showSettings && (
        <Suspense fallback={null}>
          <SettingsPanel
            open={showSettings}
            onOpenChange={setShowSettings}
          />
        </Suspense>
      )}

      {showProfile && (
        <Suspense fallback={null}>
          <ProfileViewer
            userId={user.id}
            onBack={() => setShowProfile(false)}
            currentUserId={user.id}
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
  const colorClasses: Record<string, { bg: string; border: string; icon: string }> = {
    blue: { bg: 'bg-white', border: 'border-blue-200', icon: 'bg-blue-100' },
    green: { bg: 'bg-white', border: 'border-green-200', icon: 'bg-green-100' },
    gray: { bg: 'bg-white', border: 'border-gray-200', icon: 'bg-gray-100' }
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <div className={`p-4 rounded-lg ${colors.bg} ${colors.border} border shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 ${colors.icon} rounded-lg flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          <div className="text-xs text-gray-600">{label}</div>
        </div>
      </div>
    </div>
  );
}
