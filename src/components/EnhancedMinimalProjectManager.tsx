/**
 * Enhanced Minimal Project Manager - With Auto Status Updates & Full CRUD
 * Features:
 * - Automatic status updates based on tasks (Not Started, In Progress, Complete)
 * - Project editing and deletion
 * - Working task creation buttons
 * - Timer automation on drag and drop
 */

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  ArrowLeft,
  LayoutGrid,
  CheckSquare,
  FolderOpen,
  BarChart3,
  MoreHorizontal,
  Star,
  Clock,
  Target,
  TrendingUp,
  FileText,
  Edit,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { Project } from '../types/database';
import { Task } from '../types/task';
import { Milestone } from './ProjectMilestones';
import { toast } from 'sonner@2.0.3';

// Import sub-components
import MinimalKanbanView from './MinimalKanbanView';
import MinimalResourceView from './MinimalResourceView';
import MinimalAnalyticsView from './MinimalAnalyticsView';
import MinimalOverviewView from './MinimalOverviewView';
import MinimalProjectNotesView from './MinimalProjectNotesView';

interface EnhancedMinimalProjectManagerProps {
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

export default function EnhancedMinimalProjectManager({
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
}: EnhancedMinimalProjectManagerProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isFavorite, setIsFavorite] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    title: project.title,
    description: project.description || '',
    priority: project.priority || 'medium',
    tags: project.tags?.join(', ') || ''
  });

  // Auto-calculate and update project status based on tasks
  useEffect(() => {
    calculateAndUpdateProjectStatus();
  }, [tasks]);

  const calculateAndUpdateProjectStatus = () => {
    let newStatus: 'planning' | 'active' | 'in_progress' | 'completed' | 'archived' = 'planning';

    if (tasks.length === 0) {
      // No tasks = Not Started (planning)
      newStatus = 'planning';
    } else {
      const completedTasks = tasks.filter(t => t.status === 'completed').length;
      
      if (completedTasks === tasks.length) {
        // All tasks completed = Complete
        newStatus = 'completed';
      } else {
        // Has tasks but not all completed = In Progress
        newStatus = 'in_progress';
      }
    }

    // Only update if status actually changed
    if (project.status !== newStatus && onProjectUpdate) {
      onProjectUpdate({ status: newStatus });
    }
  };

  // Calculate project statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorite_projects') || '[]');
    if (isFavorite) {
      const updated = favorites.filter((id: string) => id !== project.id);
      localStorage.setItem('favorite_projects', JSON.stringify(updated));
    } else {
      favorites.push(project.id);
      localStorage.setItem('favorite_projects', JSON.stringify(favorites));
    }
    setIsFavorite(!isFavorite);
  };

  const handleEditProject = async () => {
    if (!editForm.title.trim()) {
      toast.error('Project title is required');
      return;
    }

    try {
      if (onProjectUpdate) {
        await onProjectUpdate({
          title: editForm.title,
          description: editForm.description,
          priority: editForm.priority as 'low' | 'medium' | 'high',
          tags: editForm.tags.split(',').map(t => t.trim()).filter(Boolean)
        });
        toast.success('Project updated successfully!');
        setShowEditDialog(false);
      }
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
    }
  };

  const handleDeleteProject = async () => {
    try {
      if (onProjectDelete) {
        await onProjectDelete();
        toast.success('Project deleted successfully');
        setShowDeleteDialog(false);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  const getStatusDisplay = () => {
    switch (project.status) {
      case 'planning':
        return { label: 'Not Started', color: 'bg-gray-100 text-gray-700' };
      case 'in_progress':
        return { label: 'In Progress', color: 'bg-blue-100 text-blue-700' };
      case 'completed':
        return { label: 'Complete', color: 'bg-green-100 text-green-700' };
      case 'archived':
        return { label: 'Archived', color: 'bg-gray-100 text-gray-500' };
      default:
        return { label: project.status, color: 'bg-gray-100 text-gray-700' };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Minimal Header */}
      <header className="bg-white border-b sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Navigation */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              
              <div className="h-8 w-px bg-gray-200 hidden sm:block" />
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                  {project.title?.charAt(0).toUpperCase() || 'P'}
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">{project.title}</h1>
                  <p className="text-xs text-gray-500 hidden sm:block">{project.description || 'No description'}</p>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFavorite}
                className="hidden sm:flex"
              >
                <Star className={`w-4 h-4 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEditDialog(true)}
              >
                <Edit className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="flex items-center gap-6 pb-3 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <CheckSquare className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Progress</div>
                <div className="font-semibold text-gray-900">{progressPercentage}%</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                <Target className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Completed</div>
                <div className="font-semibold text-gray-900">{completedTasks}/{totalTasks}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <Clock className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Active</div>
                <div className="font-semibold text-gray-900">{inProgressTasks}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Status</div>
                <Badge className={statusDisplay.color}>
                  {statusDisplay.label}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Minimal Tab Navigation */}
          <TabsList className="inline-flex h-10 items-center justify-center rounded-lg bg-white p-1 shadow-sm border">
            <TabsTrigger value="overview" className="gap-2 data-[state=active]:bg-gray-100">
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2 data-[state=active]:bg-gray-100">
              <CheckSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Tasks</span>
            </TabsTrigger>
            <TabsTrigger value="notes" className="gap-2 data-[state=active]:bg-gray-100">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Notes</span>
            </TabsTrigger>
            <TabsTrigger value="resources" className="gap-2 data-[state=active]:bg-gray-100">
              <FolderOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Resources</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2 data-[state=active]:bg-gray-100">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Contents */}
          <TabsContent value="overview" className="space-y-6">
            <MinimalOverviewView
              project={project}
              tasks={tasks}
              milestones={milestones}
              onTaskCreate={onTaskCreate}
              onMilestonesUpdate={onMilestonesUpdate}
            />
          </TabsContent>

          <TabsContent value="tasks">
            <MinimalKanbanView
              projectId={project.id}
              tasks={tasks}
              onTaskUpdate={onTaskUpdate}
              onTaskCreate={onTaskCreate}
              onTaskDelete={onTaskDelete}
              onTaskTimeUpdate={onTaskTimeUpdate}
            />
          </TabsContent>

          <TabsContent value="notes">
            <MinimalProjectNotesView
              project={project}
              onUpdate={(updates) => onProjectUpdate?.(updates)}
            />
          </TabsContent>

          <TabsContent value="resources">
            <MinimalResourceView
              projectId={project.id}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <MinimalAnalyticsView
              project={project}
              tasks={tasks}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Edit Project Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update your project details
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">Project Title</Label>
              <Input
                id="title"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="Enter project title"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Enter project description"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                value={editForm.priority}
                onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={editForm.tags}
                onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                placeholder="react, web, mobile"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditProject}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Delete Project
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this project? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-900">
                <strong>Warning:</strong> This will permanently delete:
              </p>
              <ul className="text-sm text-red-800 mt-2 space-y-1 list-disc list-inside">
                <li>{totalTasks} task{totalTasks !== 1 ? 's' : ''}</li>
                <li>All project notes and resources</li>
                <li>All project analytics data</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProject}>
              Delete Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
