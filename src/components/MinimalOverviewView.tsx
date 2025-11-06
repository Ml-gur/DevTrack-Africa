/**
 * Minimal Overview View - Clean project overview
 */

import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  Target,
  TrendingUp,
  Users,
  FileText,
  Zap
} from 'lucide-react';
import { Project } from '../types/database';
import { Task, TaskStatus } from '../types/task';
import { Milestone } from './ProjectMilestones';
import { format, isAfter, isBefore } from 'date-fns';
import MinimalEmptyState from './MinimalEmptyState';
import { toast } from 'sonner@2.0.3';

// Helper function to safely format dates
const formatDate = (date: string | Date | null | undefined, formatStr: string): string => {
  if (!date) return 'N/A';
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'N/A';
    return format(dateObj, formatStr);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'N/A';
  }
};

interface MinimalOverviewViewProps {
  project: Project;
  tasks: Task[];
  milestones?: Milestone[];
  onTaskCreate: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onMilestonesUpdate?: (milestones: Milestone[]) => void;
}

export default function MinimalOverviewView({
  project,
  tasks = [],
  milestones = [],
  onTaskCreate,
  onMilestonesUpdate
}: MinimalOverviewViewProps) {
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const todoTasks = tasks.filter(t => t.status === 'todo').length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Get recent tasks
  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
    .slice(0, 5);

  // Get high priority tasks
  const highPriorityTasks = tasks.filter(t => t.priority === 'high' && t.status !== 'completed').slice(0, 3);

  // Milestone progress
  const completedMilestones = milestones.filter(m => m.completed).length;
  const totalMilestones = milestones.length;

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Section */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Overall Progress</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{progressPercentage}%</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
              <span className="text-lg font-bold">{completedTasks}</span>
            </div>
          </div>
          
          <Progress value={progressPercentage} className="h-2 mb-4" />
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-gray-900">{todoTasks}</div>
              <div className="text-xs text-gray-500 mt-1">To Do</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-600">{inProgressTasks}</div>
              <div className="text-xs text-blue-600 mt-1">In Progress</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
              <div className="text-xs text-green-600 mt-1">Completed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* High Priority Tasks */}
      {highPriorityTasks.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                </div>
                <h3 className="font-semibold text-gray-900">High Priority</h3>
              </div>
              <Badge variant="destructive" className="text-xs">{highPriorityTasks.length}</Badge>
            </div>

            <div className="space-y-2">
              {highPriorityTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  {getStatusIcon(task.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                    {task.dueDate && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(task.dueDate, 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline" className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Milestones Progress */}
      {totalMilestones > 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Target className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Milestones</h3>
              </div>
              <span className="text-sm text-gray-500">
                {completedMilestones}/{totalMilestones} completed
              </span>
            </div>

            <div className="space-y-3">
              {milestones.slice(0, 4).map((milestone, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    milestone.completed ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {milestone.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${
                      milestone.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                    }`}>
                      {milestone.title}
                    </p>
                    {milestone.date && (
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(milestone.date, 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Recent Activity</h3>
            </div>
          </div>

          {recentTasks.length === 0 ? (
            <div className="py-4">
              <MinimalEmptyState
                variant="tasks"
                showIllustration={false}
                actionLabel="Create First Task"
                onAction={() => setShowQuickAdd(true)}
              />
            </div>
          ) : (
            <div className="space-y-2">
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  {getStatusIcon(task.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Updated {formatDate(task.updatedAt || task.createdAt, 'MMM d, h:mm a')}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {task.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card 
          className="border-2 border-dashed border-gray-200 hover:border-blue-400 transition-colors cursor-pointer"
          onClick={() => setShowQuickAdd(true)}
        >
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
              <Plus className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Add New Task</h4>
            <p className="text-xs text-gray-500">Create a new task for this project</p>
          </CardContent>
        </Card>

        <Card 
          className="border-2 border-dashed border-gray-200 hover:border-purple-400 transition-colors cursor-pointer"
          onClick={() => {
            // Add a new milestone
            const newMilestone: Milestone = {
              title: 'New Milestone',
              date: new Date().toISOString(),
              completed: false
            };
            const updatedMilestones = [...milestones, newMilestone];
            onMilestonesUpdate?.(updatedMilestones);
          }}
        >
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Add Milestone</h4>
            <p className="text-xs text-gray-500">Set a new project milestone</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Task Creation Modal */}
      {showQuickAdd && (
        <QuickTaskAddDialog
          projectId={project.id}
          onTaskCreate={onTaskCreate}
          onClose={() => setShowQuickAdd(false)}
        />
      )}

      {/* Project Details */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Project Details</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Status</span>
              <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                {project.status}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Created</span>
              <span className="text-gray-900">
                {formatDate(project.createdAt, 'MMM d, yyyy')}
              </span>
            </div>
            {project.startDate && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Start Date</span>
                <span className="text-gray-900">
                  {formatDate(project.startDate, 'MMM d, yyyy')}
                </span>
              </div>
            )}
            {project.endDate && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">End Date</span>
                <span className="text-gray-900">
                  {formatDate(project.endDate, 'MMM d, yyyy')}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Task Creation Modal */}
      {showQuickAdd && (
        <QuickTaskAddDialog
          projectId={project.id}
          onTaskCreate={onTaskCreate}
          onClose={() => setShowQuickAdd(false)}
        />
      )}
    </div>
  );
}

// Quick Task Add Dialog Component
function QuickTaskAddDialog({ 
  projectId, 
  onTaskCreate, 
  onClose 
}: { 
  projectId: string; 
  onTaskCreate: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.error('Task title is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await onTaskCreate({
        projectId,
        title: form.title,
        description: form.description,
        status: 'todo',
        priority: form.priority,
        tags: [],
        dependencies: [],
        dueDate: form.dueDate || undefined,
        userId: '' // Will be set by the parent component
      });
      toast.success('Task created successfully!');
      onClose();
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new task to your project
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="task-title">Task Title *</Label>
            <Input
              id="task-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Enter task title"
              autoFocus
            />
          </div>

          <div>
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Enter task description (optional)"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="task-priority">Priority</Label>
              <select
                id="task-priority"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as 'low' | 'medium' | 'high' })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <Label htmlFor="task-due-date">Due Date</Label>
              <Input
                id="task-due-date"
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Task'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}