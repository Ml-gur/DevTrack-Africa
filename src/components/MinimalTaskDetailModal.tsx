/**
 * Minimal Task Detail Modal - Beautiful task details with smooth animations
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  X,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  Flag,
  Tag,
  User,
  CheckCircle2,
  Play,
  Pause,
  Save,
  MoreHorizontal,
  Link as LinkIcon,
  Paperclip,
  MessageSquare,
  TrendingUp
} from 'lucide-react';
import { Task, TaskStatus, TaskPriority } from '../types/task';
import { format } from 'date-fns';
import { toast } from 'sonner@2.0.3';

interface MinimalTaskDetailModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updates: Partial<Task>) => Promise<void>;
  onDelete: () => Promise<void>;
  onStartTimer?: () => void;
  onStopTimer?: () => void;
}

// Safe date formatter that handles undefined/null/invalid dates
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

export default function MinimalTaskDetailModal({
  task,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  onStartTimer,
  onStopTimer
}: MinimalTaskDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Partial<Task>>(task);
  const [isSaving, setIsSaving] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate(editedTask);
      setIsEditing(false);
      toast.success('Task updated successfully');
    } catch (error) {
      toast.error('Failed to update task');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await onDelete();
      onClose();
      toast.success('Task deleted');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const handleTimerToggle = () => {
    if (isTimerRunning) {
      onStopTimer?.();
      setIsTimerRunning(false);
    } else {
      onStartTimer?.();
      setIsTimerRunning(true);
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader>
          <DialogDescription className="sr-only">
            View and manage task details, including description, status, priority, time tracking, notes, and file resources.
          </DialogDescription>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <Input
                  value={editedTask.title || ''}
                  onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                  className="text-xl font-semibold mb-2"
                  placeholder="Task title..."
                />
              ) : (
                <DialogTitle className="text-2xl pr-8">{task.title}</DialogTitle>
              )}
              
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <Badge variant="outline" className={getStatusColor(task.status)}>
                  {task.status.replace('_', ' ')}
                </Badge>
                <Badge variant="outline" className={getPriorityColor(task.priority)}>
                  <Flag className="w-3 h-3 mr-1" />
                  {task.priority}
                </Badge>
                {task.tags && task.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleDelete}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        <Separator className="my-4" />

        {/* Content */}
        <div className="space-y-6">
          {/* Description */}
          <div>
            <Label className="text-sm font-medium mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Description
            </Label>
            {isEditing ? (
              <Textarea
                value={editedTask.description || ''}
                onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                placeholder="Add a description..."
                className="min-h-[100px] resize-none"
              />
            ) : (
              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-4">
                {task.description || 'No description provided'}
              </p>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Status
              </Label>
              {isEditing ? (
                <Select
                  value={editedTask.status}
                  onValueChange={(value: TaskStatus) => setEditedTask({ ...editedTask, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Badge variant="outline" className={getStatusColor(task.status)}>
                    {task.status.replace('_', ' ')}
                  </Badge>
                </div>
              )}
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Flag className="w-4 h-4" />
                Priority
              </Label>
              {isEditing ? (
                <Select
                  value={editedTask.priority}
                  onValueChange={(value: TaskPriority) => setEditedTask({ ...editedTask, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Badge variant="outline" className={getPriorityColor(task.priority)}>
                    <Flag className="w-3 h-3 mr-1" />
                    {task.priority}
                  </Badge>
                </div>
              )}
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Due Date
              </Label>
              {isEditing ? (
                <Input
                  type="date"
                  value={editedTask.dueDate ? formatDate(editedTask.dueDate, 'yyyy-MM-dd') : ''}
                  onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
                />
              ) : (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                  {task.dueDate ? formatDate(task.dueDate, 'MMM dd, yyyy') : 'No due date'}
                </div>
              )}
            </div>

            {/* Time Tracking */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Time Spent
              </Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-3 bg-gray-50 rounded-lg text-sm font-semibold text-blue-600">
                  {formatTime(task.timeSpentMinutes || 0)}
                </div>
                {onStartTimer && onStopTimer && (
                  <Button
                    size="sm"
                    variant={isTimerRunning ? 'destructive' : 'default'}
                    onClick={handleTimerToggle}
                    className="gap-2"
                  >
                    {isTimerRunning ? (
                      <>
                        <Pause className="w-4 h-4" />
                        Stop
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Start
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Activity</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg text-sm">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 font-medium">Task created</p>
                  <p className="text-xs text-gray-500">
                    {formatDate(task.createdAt || task.created_at, 'MMM dd, yyyy • h:mm a')}
                  </p>
                </div>
              </div>

              {task.startedAt && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg text-sm">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Play className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 font-medium">Started working</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(task.startedAt, 'MMM dd, yyyy • h:mm a')}
                    </p>
                  </div>
                </div>
              )}

              {task.completedAt && (
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg text-sm">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 font-medium">Completed</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(task.completedAt, 'MMM dd, yyyy • h:mm a')}
                    </p>
                  </div>
                </div>
              )}

              {(task.updatedAt || task.updated_at) && ((task.updatedAt !== task.createdAt) || (task.updated_at !== task.created_at)) && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg text-sm">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Edit2 className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 font-medium">Last updated</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(task.updatedAt || task.updated_at, 'MMM dd, yyyy • h:mm a')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
