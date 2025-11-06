import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { 
  LayoutDashboard,
  ListTodo,
  BarChart3,
  Calendar,
  Flag,
  Settings,
  ArrowLeft,
  Download,
  Upload,
  Plus,
  TrendingUp,
  Clock,
  CheckCircle2,
  Target
} from 'lucide-react';
import { Project } from '../types/database';
import { Task } from '../types/task';
import KanbanBoard from './KanbanBoard';
import ProjectAnalytics from './ProjectAnalytics';
import ProjectTimeline from './ProjectTimeline';
import ProjectMilestones, { Milestone } from './ProjectMilestones';
import QuickTaskCreator from './QuickTaskCreator';
import ProjectExportImport from './ProjectExportImport';
import SubtaskManager, { Subtask } from './SubtaskManager';

interface UnifiedProjectDashboardProps {
  project: Project;
  tasks: Task[];
  milestones?: Milestone[];
  onBack: () => void;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onTaskCreate: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onTaskDelete: (taskId: string) => Promise<void>;
  onTaskTimeUpdate: (taskId: string, minutes: number) => Promise<void>;
  onMilestonesUpdate?: (milestones: Milestone[]) => void;
  onProjectUpdate?: (updates: Partial<Project>) => void;
}

export default function UnifiedProjectDashboard({
  project,
  tasks = [],
  milestones = [],
  onBack,
  onTaskUpdate,
  onTaskCreate,
  onTaskDelete,
  onTaskTimeUpdate,
  onMilestonesUpdate,
  onProjectUpdate
}: UnifiedProjectDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showExportImport, setShowExportImport] = useState<'export' | 'import' | null>(null);

  // Calculate project statistics
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
    highPriorityTasks: tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const handleImport = async (data: any) => {
    // Handle import logic
    console.log('Importing data:', data);
    // This would typically create tasks, update project, etc.
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">{project.title}</h1>
                  <Badge className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {project.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowExportImport('import')}
              >
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>

              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowExportImport('export')}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>

              <Button size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-6 gap-4 mt-4">
            <QuickStat
              icon={<Target className="w-4 h-4 text-blue-600" />}
              label="Progress"
              value={`${stats.completionRate}%`}
              color="blue"
            />
            <QuickStat
              icon={<CheckCircle2 className="w-4 h-4 text-green-600" />}
              label="Completed"
              value={stats.completedTasks.toString()}
              color="green"
            />
            <QuickStat
              icon={<ListTodo className="w-4 h-4 text-yellow-600" />}
              label="To Do"
              value={stats.todoTasks.toString()}
              color="yellow"
            />
            <QuickStat
              icon={<TrendingUp className="w-4 h-4 text-purple-600" />}
              label="In Progress"
              value={stats.inProgressTasks.toString()}
              color="purple"
            />
            <QuickStat
              icon={<Clock className="w-4 h-4 text-indigo-600" />}
              label="Time Spent"
              value={formatTime(stats.totalTimeSpent)}
              color="indigo"
            />
            <QuickStat
              icon={<Flag className="w-4 h-4 text-pink-600" />}
              label="Milestones"
              value={`${milestones.filter(m => m.completed).length}/${milestones.length}`}
              color="pink"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview" className="gap-2">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="kanban" className="gap-2">
              <ListTodo className="w-4 h-4" />
              <span className="hidden sm:inline">Board</span>
              {stats.inProgressTasks > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {stats.inProgressTasks}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="timeline" className="gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Timeline</span>
            </TabsTrigger>
            <TabsTrigger value="milestones" className="gap-2">
              <Flag className="w-4 h-4" />
              <span className="hidden sm:inline">Milestones</span>
              {milestones.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {milestones.filter(m => m.completed).length}/{milestones.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Project Health */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Project Health</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-900">Completion Rate</span>
                        <Badge variant="outline" className="bg-white">
                          {stats.completionRate}%
                        </Badge>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${stats.completionRate}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-green-900">Tasks Done</span>
                        <Badge variant="outline" className="bg-white">
                          {stats.completedTasks}/{stats.totalTasks}
                        </Badge>
                      </div>
                      <p className="text-2xl font-bold text-green-700">
                        {stats.completedTasks}
                      </p>
                    </div>
                  </div>

                  {stats.overdueTasks > 0 && (
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-red-900">Overdue Tasks</p>
                          <p className="text-sm text-red-700">
                            {stats.overdueTasks} task{stats.overdueTasks > 1 ? 's need' : ' needs'} attention
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setActiveTab('kanban')}
                          className="border-red-300 text-red-700 hover:bg-red-100"
                        >
                          View Tasks
                        </Button>
                      </div>
                    </div>
                  )}

                  {stats.highPriorityTasks > 0 && (
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-yellow-900">High Priority</p>
                          <p className="text-sm text-yellow-700">
                            {stats.highPriorityTasks} task{stats.highPriorityTasks > 1 ? 's' : ''} pending
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-white border-yellow-300 text-yellow-700">
                          {stats.highPriorityTasks}
                        </Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full justify-start gap-2"
                    onClick={() => setActiveTab('kanban')}
                  >
                    <Plus className="w-4 h-4" />
                    Add New Task
                  </Button>

                  <Button 
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => setActiveTab('milestones')}
                  >
                    <Flag className="w-4 h-4" />
                    Create Milestone
                  </Button>

                  <Button 
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => setActiveTab('timeline')}
                  >
                    <Calendar className="w-4 h-4" />
                    View Timeline
                  </Button>

                  <Button 
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => setActiveTab('analytics')}
                  >
                    <BarChart3 className="w-4 h-4" />
                    View Analytics
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity Preview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Tasks</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setActiveTab('kanban')}
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {tasks.slice(0, 5).map((task) => (
                    <div 
                      key={task.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      onClick={() => setActiveTab('kanban')}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          task.status === 'completed' ? 'bg-green-500' :
                          task.status === 'in_progress' ? 'bg-blue-500' :
                          'bg-yellow-500'
                        }`} />
                        <span className="font-medium">{task.title}</span>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {task.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Kanban Board Tab */}
          <TabsContent value="kanban">
            <KanbanBoard
              projectId={project.id}
              tasks={tasks}
              onTaskUpdate={onTaskUpdate}
              onTaskCreate={onTaskCreate}
              onTaskDelete={onTaskDelete}
              onTaskTimeUpdate={onTaskTimeUpdate}
            />
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline">
            <ProjectTimeline
              tasks={tasks}
              projectStart={project.created_at}
              projectEnd={project.due_date}
            />
          </TabsContent>

          {/* Milestones Tab */}
          <TabsContent value="milestones">
            <ProjectMilestones
              projectId={project.id}
              milestones={milestones}
              tasks={tasks}
              onUpdate={onMilestonesUpdate || (() => {})}
            />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <ProjectAnalytics
              project={project}
              tasks={tasks}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Quick Task Creator (Floating) */}
      <QuickTaskCreator
        projectId={project.id}
        onCreateTask={onTaskCreate}
        defaultStatus="todo"
      />

      {/* Export/Import Dialog */}
      {showExportImport && (
        <ProjectExportImport
          isOpen={true}
          onClose={() => setShowExportImport(null)}
          mode={showExportImport}
          project={project}
          tasks={tasks}
          onImport={handleImport}
        />
      )}
    </div>
  );
}

function QuickStat({ 
  icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${color}-100`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'active': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'planning': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'on-hold': return 'bg-orange-100 text-orange-700 border-orange-200';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}
