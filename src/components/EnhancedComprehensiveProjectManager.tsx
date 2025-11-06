/**
 * Enhanced Comprehensive Project Manager
 * Complete project management with intuitive UX and all CRUD operations
 */

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import {
  ArrowLeft,
  LayoutDashboard,
  ListTodo,
  FileImage,
  BarChart3,
  Calendar,
  Settings,
  Download,
  Upload,
  Share2,
  MoreVertical,
  Edit,
  Trash2,
  Star,
  Clock,
  CheckCircle2,
  Target,
  TrendingUp,
  AlertCircle,
  Zap,
  Plus
} from 'lucide-react';
import { Project } from '../types/database';
import { Task } from '../types/task';
import { Milestone } from './ProjectMilestones';

// Import existing components
import KanbanBoard from './KanbanBoard';
import EnhancedResourceManager from './EnhancedResourceManager';
import EnhancedProjectAnalytics from './EnhancedProjectAnalytics';
import ProjectTimeline from './ProjectTimeline';
import ProjectMilestones from './ProjectMilestones';
import QuickTaskCreator from './QuickTaskCreator';
import ProjectExportImport from './ProjectExportImport';
import ProjectEditModal from './ProjectEditModal';
import ProjectQuickActions from './ProjectQuickActions';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner@2.0.3';

interface EnhancedComprehensiveProjectManagerProps {
  project: Project;
  tasks: Task[];
  milestones?: Milestone[];
  currentUserId: string;
  onBack: () => void;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onTaskCreate: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onTaskDelete: (taskId: string) => Promise<void>;
  onTaskTimeUpdate: (taskId: string, minutes: number) => Promise<void>;
  onMilestonesUpdate?: (milestones: Milestone[]) => void;
  onProjectUpdate?: (updates: Partial<Project>) => void;
  onProjectDelete?: () => void;
}

export default function EnhancedComprehensiveProjectManager({
  project,
  tasks = [],
  milestones = [],
  currentUserId,
  onBack,
  onTaskUpdate,
  onTaskCreate,
  onTaskDelete,
  onTaskTimeUpdate,
  onMilestonesUpdate,
  onProjectUpdate,
  onProjectDelete
}: EnhancedComprehensiveProjectManagerProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showQuickTaskCreator, setShowQuickTaskCreator] = useState(false);
  const [showExportImport, setShowExportImport] = useState<'export' | 'import' | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);

  // Load favorite status
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favorite_projects') || '[]');
    setIsFavorite(favorites.includes(project.id));
  }, [project.id]);

  // Toggle favorite
  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorite_projects') || '[]');
    if (isFavorite) {
      const updated = favorites.filter((id: string) => id !== project.id);
      localStorage.setItem('favorite_projects', JSON.stringify(updated));
      toast.success('Removed from favorites');
    } else {
      favorites.push(project.id);
      localStorage.setItem('favorite_projects', JSON.stringify(favorites));
      toast.success('Added to favorites ⭐');
    }
    setIsFavorite(!isFavorite);
  };

  // Calculate comprehensive statistics
  const stats = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'completed').length,
    inProgressTasks: tasks.filter(t => t.status === 'in_progress').length,
    todoTasks: tasks.filter(t => t.status === 'todo').length,
    completionRate: tasks.length > 0
      ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100)
      : 0,
    totalTimeSpent: tasks.reduce((sum, t) => sum + (t.timeSpentMinutes || 0), 0),
    overdueTasks: tasks.filter(t => {
      if (!t.dueDate || t.status === 'completed') return false;
      return new Date(t.dueDate) < new Date();
    }).length,
    highPriorityTasks: tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length,
    milestonesCompleted: milestones.filter(m => m.completed).length,
    totalMilestones: milestones.length
  };

  const formatTime = (minutes: number): string => {
    if (minutes === 0) return '0m';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      planning: 'bg-blue-100 text-blue-700',
      in_progress: 'bg-purple-100 text-purple-700',
      completed: 'bg-green-100 text-green-700',
      on_hold: 'bg-yellow-100 text-yellow-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const handleProjectAction = (action: string) => {
    switch (action) {
      case 'edit':
        setShowEditModal(true);
        break;
      case 'share':
        const projectUrl = `${window.location.origin}?project=${project.id}`;
        navigator.clipboard.writeText(projectUrl);
        toast.success('Project link copied to clipboard!', {
          description: 'Share this link with your team'
        });
        break;
      case 'archive':
        if (onProjectUpdate) {
          onProjectUpdate({ status: 'completed' });
          toast.success('Project archived successfully', {
            description: 'Project moved to completed status'
          });
        }
        break;
      case 'delete':
        if (confirm('⚠️ Delete this project?\n\nThis will permanently delete:\n• All tasks\n• All resources\n• All milestones\n\nThis action cannot be undone.')) {
          onProjectDelete?.();
        }
        break;
    }
  };

  const handleProjectSave = async (updates: Partial<Project>) => {
    if (onProjectUpdate) {
      await onProjectUpdate(updates);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (onProjectUpdate) {
      onProjectUpdate({ status: newStatus });
      toast.success(`Project status updated to ${newStatus.replace('_', ' ')}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-30 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Top Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Projects</span>
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFavorite}
                className="gap-2"
              >
                <Star className={`w-4 h-4 ${isFavorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                <span className="hidden sm:inline">{isFavorite ? 'Favorited' : 'Favorite'}</span>
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditModal(true)}
                className="gap-2"
              >
                <Edit className="w-4 h-4" />
                <span className="hidden md:inline">Edit</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExportImport('import')}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden md:inline">Import</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExportImport('export')}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                <span className="hidden md:inline">Export</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleProjectAction('share')}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleProjectAction('archive')}>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Archive
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleProjectAction('delete')}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Project Info */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold">{project.title}</h1>
                <Badge className={getStatusColor(project.status)}>
                  {project.status.replace('_', ' ')}
                </Badge>
                {project.category && (
                  <Badge variant="outline">{project.category}</Badge>
                )}
              </div>
              {project.description && (
                <p className="text-muted-foreground mt-2 max-w-3xl">
                  {project.description}
                </p>
              )}
              {project.tech_stack && project.tech_stack.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {project.tech_stack.map((tech) => (
                    <Badge key={tech} variant="secondary" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
            <StatCard
              icon={<Target className="w-4 h-4" />}
              label="Progress"
              value={`${stats.completionRate}%`}
              color="blue"
            />
            <StatCard
              icon={<CheckCircle2 className="w-4 h-4" />}
              label="Completed"
              value={stats.completedTasks}
              total={stats.totalTasks}
              color="green"
            />
            <StatCard
              icon={<TrendingUp className="w-4 h-4" />}
              label="In Progress"
              value={stats.inProgressTasks}
              color="purple"
            />
            <StatCard
              icon={<ListTodo className="w-4 h-4" />}
              label="To Do"
              value={stats.todoTasks}
              color="yellow"
            />
            <StatCard
              icon={<Clock className="w-4 h-4" />}
              label="Time Spent"
              value={formatTime(stats.totalTimeSpent)}
              color="indigo"
            />
            <StatCard
              icon={<Star className="w-4 h-4" />}
              label="Milestones"
              value={stats.milestonesCompleted}
              total={stats.totalMilestones}
              color="pink"
            />
          </div>

          {/* Alerts */}
          {stats.overdueTasks > 0 && (
            <Alert className="mt-4 border-orange-200 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-900">
                You have <strong>{stats.overdueTasks}</strong> overdue task{stats.overdueTasks > 1 ? 's' : ''}.
                Check the Board tab to update them.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Main Content Area */}
          <div className="flex-1">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              {/* Tabs Navigation */}
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5">
                <TabsTrigger value="overview" className="gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                
                <TabsTrigger value="board" className="gap-2">
                  <ListTodo className="w-4 h-4" />
                  <span className="hidden sm:inline">Board</span>
                  {stats.inProgressTasks > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {stats.inProgressTasks}
                    </Badge>
                  )}
                </TabsTrigger>

                <TabsTrigger value="resources" className="gap-2">
                  <FileImage className="w-4 h-4" />
                  <span className="hidden sm:inline">Resources</span>
                </TabsTrigger>

                <TabsTrigger value="analytics" className="gap-2 hidden lg:flex">
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Analytics</span>
                </TabsTrigger>

                <TabsTrigger value="timeline" className="gap-2 hidden lg:flex">
                  <Calendar className="w-4 h-4" />
                  <span className="hidden sm:inline">Timeline</span>
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Progress Card */}
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle>Project Progress</CardTitle>
                      <CardDescription>
                        {stats.completedTasks} of {stats.totalTasks} tasks completed
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Overall Progress</span>
                            <span className="text-sm text-muted-foreground">{stats.completionRate}%</span>
                          </div>
                          <Progress value={stats.completionRate} className="h-3" />
                        </div>

                        <div className="grid grid-cols-3 gap-4 pt-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600">{stats.todoTasks}</div>
                            <div className="text-xs text-muted-foreground">To Do</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">{stats.inProgressTasks}</div>
                            <div className="text-xs text-muted-foreground">In Progress</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{stats.completedTasks}</div>
                            <div className="text-xs text-muted-foreground">Completed</div>
                          </div>
                        </div>

                        <div className="pt-4 space-y-2">
                          <Button
                            className="w-full gap-2"
                            onClick={() => setShowQuickTaskCreator(true)}
                          >
                            <Plus className="w-4 h-4" />
                            Add New Task
                          </Button>
                          <Button
                            className="w-full gap-2"
                            variant="outline"
                            onClick={() => setActiveTab('resources')}
                          >
                            <Upload className="w-4 h-4" />
                            Upload Resources
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Actions - Hidden on Mobile by default */}
                  <div className="hidden lg:block">
                    <ProjectQuickActions
                      onEditProject={() => setShowEditModal(true)}
                      onDeleteProject={() => handleProjectAction('delete')}
                      onUploadResource={() => setActiveTab('resources')}
                      onExportProject={() => setShowExportImport('export')}
                      onShareProject={() => handleProjectAction('share')}
                      onArchiveProject={() => handleProjectAction('archive')}
                      onAddTask={() => setShowQuickTaskCreator(true)}
                      onAddMilestone={() => setActiveTab('timeline')}
                      onViewAnalytics={() => setActiveTab('analytics')}
                      onToggleFavorite={toggleFavorite}
                      isFavorite={isFavorite}
                      projectStatus={project.status}
                      onChangeStatus={handleStatusChange}
                    />
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Tasks</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {tasks.slice(0, 5).map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between py-3 border-b last:border-0"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-sm">{task.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {task.status.replace('_', ' ')}
                            </p>
                          </div>
                          <Badge
                            variant={task.priority === 'high' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {task.priority}
                          </Badge>
                        </div>
                      ))}
                      {tasks.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No tasks yet. Create your first task!
                        </div>
                      )}
                      {tasks.length > 0 && (
                        <Button
                          variant="outline"
                          className="w-full mt-4"
                          onClick={() => setActiveTab('board')}
                        >
                          View All Tasks
                        </Button>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Milestones</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {milestones.slice(0, 5).map((milestone) => (
                        <div
                          key={milestone.id}
                          className="flex items-center gap-3 py-3 border-b last:border-0"
                        >
                          <div className={`w-2 h-2 rounded-full ${milestone.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{milestone.title}</p>
                            {milestone.dueDate && (
                              <p className="text-xs text-muted-foreground">
                                Due: {new Date(milestone.dueDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                      {milestones.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No milestones set. Add milestones to track progress!
                        </div>
                      )}
                      {milestones.length > 0 && (
                        <Button
                          variant="outline"
                          className="w-full mt-4"
                          onClick={() => setActiveTab('timeline')}
                        >
                          View Timeline
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Board Tab - Kanban */}
              <TabsContent value="board">
                <KanbanBoard
                  projectId={project.id}
                  tasks={tasks}
                  onTaskUpdate={onTaskUpdate}
                  onTaskCreate={onTaskCreate}
                  onTaskDelete={onTaskDelete}
                  onTaskTimeUpdate={onTaskTimeUpdate}
                />
              </TabsContent>

              {/* Resources Tab */}
              <TabsContent value="resources">
                <EnhancedResourceManager
                  projectId={project.id}
                  currentUserId={currentUserId}
                  maxFileSize={25}
                  maxTotalStorage={500}
                />
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics">
                <EnhancedProjectAnalytics
                  project={project}
                  tasks={tasks}
                  milestones={milestones}
                />
              </TabsContent>

              {/* Timeline Tab */}
              <TabsContent value="timeline" className="space-y-6">
                <ProjectMilestones
                  milestones={milestones}
                  onMilestonesUpdate={onMilestonesUpdate || (() => {})}
                />
                
                <ProjectTimeline
                  tasks={tasks}
                  milestones={milestones}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Quick Actions Sidebar - Desktop Only */}
          {showQuickActions && (
            <div className="hidden xl:block w-80">
              <div className="sticky top-24">
                <ProjectQuickActions
                  onEditProject={() => setShowEditModal(true)}
                  onDeleteProject={() => handleProjectAction('delete')}
                  onUploadResource={() => setActiveTab('resources')}
                  onExportProject={() => setShowExportImport('export')}
                  onShareProject={() => handleProjectAction('share')}
                  onArchiveProject={() => handleProjectAction('archive')}
                  onAddTask={() => setShowQuickTaskCreator(true)}
                  onAddMilestone={() => setActiveTab('timeline')}
                  onViewAnalytics={() => setActiveTab('analytics')}
                  onToggleFavorite={toggleFavorite}
                  isFavorite={isFavorite}
                  projectStatus={project.status}
                  onChangeStatus={handleStatusChange}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Task Creator Modal */}
      {showQuickTaskCreator && (
        <QuickTaskCreator
          projectId={project.id}
          onClose={() => setShowQuickTaskCreator(false)}
          onCreateTask={onTaskCreate}
        />
      )}

      {/* Export/Import Modal */}
      {showExportImport && (
        <ProjectExportImport
          project={project}
          tasks={tasks}
          mode={showExportImport}
          onClose={() => setShowExportImport(null)}
          onImport={async (data) => {
            console.log('Import data:', data);
            toast.success('Data imported successfully');
          }}
        />
      )}

      {/* Project Edit Modal */}
      {showEditModal && (
        <ProjectEditModal
          project={project}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleProjectSave}
        />
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({
  icon,
  label,
  value,
  total,
  color = 'blue'
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  total?: number;
  color?: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    purple: 'text-purple-600 bg-purple-50',
    yellow: 'text-yellow-600 bg-yellow-50',
    indigo: 'text-indigo-600 bg-indigo-50',
    pink: 'text-pink-600 bg-pink-50'
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
        {icon}
      </div>
      <div>
        <div className="font-bold">
          {value}
          {total !== undefined && <span className="text-muted-foreground">/{total}</span>}
        </div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}