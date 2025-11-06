/**
 * Mobile-Optimized Kanban - Swipeable columns, touch-friendly
 * Designed specifically for mobile devices with gestures
 */

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import {
  ChevronLeft,
  ChevronRight,
  Circle,
  PlayCircle,
  CheckCircle2,
  MoreHorizontal,
  Clock,
  Flag,
  Calendar,
  Edit,
  Trash2,
  ArrowRight
} from 'lucide-react';
import { Task, TaskStatus } from '../types/task';
import { format } from 'date-fns';
import InlineTaskCreator from './InlineTaskCreator';

interface MobileOptimizedKanbanProps {
  projectId: string;
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onTaskCreate: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onTaskDelete: (taskId: string) => Promise<void>;
}

const columns: { id: TaskStatus; title: string; icon: any; color: string }[] = [
  { id: 'todo', title: 'To Do', icon: Circle, color: 'gray' },
  { id: 'in_progress', title: 'In Progress', icon: PlayCircle, color: 'blue' },
  { id: 'completed', title: 'Completed', icon: CheckCircle2, color: 'green' }
];

export default function MobileOptimizedKanban({
  projectId,
  tasks = [],
  onTaskUpdate,
  onTaskCreate,
  onTaskDelete
}: MobileOptimizedKanbanProps) {
  const [activeColumnIndex, setActiveColumnIndex] = useState(0);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentColumn = columns[activeColumnIndex];
  const columnTasks = tasks.filter(task => task.status === currentColumn.id);

  // Swipe threshold
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && activeColumnIndex < columns.length - 1) {
      setActiveColumnIndex(activeColumnIndex + 1);
    }
    if (isRightSwipe && activeColumnIndex > 0) {
      setActiveColumnIndex(activeColumnIndex - 1);
    }
  };

  const handlePrevColumn = () => {
    if (activeColumnIndex > 0) {
      setActiveColumnIndex(activeColumnIndex - 1);
    }
  };

  const handleNextColumn = () => {
    if (activeColumnIndex < columns.length - 1) {
      setActiveColumnIndex(activeColumnIndex + 1);
    }
  };

  const handleMoveTask = async (task: Task, newStatus: TaskStatus) => {
    try {
      await onTaskUpdate(task.id, { status: newStatus });
      setSelectedTask(null);
    } catch (error) {
      console.error('Error moving task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await onTaskDelete(taskId);
      setSelectedTask(null);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50/50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50/50';
      default: return 'border-l-gray-300 bg-white';
    }
  };

  const Icon = currentColumn.icon;

  return (
    <div className="flex flex-col h-full">
      {/* Column Navigation Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrevColumn}
          disabled={activeColumnIndex === 0}
          className="px-2"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        <div className="flex items-center gap-3 flex-1 justify-center">
          <div className={`w-10 h-10 rounded-lg bg-${currentColumn.color}-50 flex items-center justify-center`}>
            <Icon className={`w-5 h-5 text-${currentColumn.color}-600`} />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">{currentColumn.title}</h2>
            <p className="text-xs text-gray-500">{columnTasks.length} tasks</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleNextColumn}
          disabled={activeColumnIndex === columns.length - 1}
          className="px-2"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Column Indicators */}
      <div className="flex items-center justify-center gap-2 py-3 bg-gray-50">
        {columns.map((col, index) => (
          <button
            key={col.id}
            onClick={() => setActiveColumnIndex(index)}
            className={`h-1.5 rounded-full transition-all ${
              index === activeColumnIndex 
                ? 'w-8 bg-blue-600' 
                : 'w-1.5 bg-gray-300'
            }`}
            aria-label={`Go to ${col.title}`}
          />
        ))}
      </div>

      {/* Tasks Container with Swipe */}
      <div
        ref={containerRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {/* Inline Task Creator */}
        <InlineTaskCreator
          projectId={projectId}
          status={currentColumn.id}
          onTaskCreate={onTaskCreate}
          placeholder={`Add ${currentColumn.title.toLowerCase()} task...`}
        />

        {/* Task Cards */}
        {columnTasks.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Icon className="w-16 h-16 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No tasks in {currentColumn.title}</p>
            <p className="text-xs mt-1">Swipe to view other columns</p>
          </div>
        ) : (
          columnTasks.map((task) => (
            <Card
              key={task.id}
              className={`border-l-4 ${getPriorityColor(task.priority)} hover:shadow-lg transition-all active:scale-98`}
              onClick={() => setSelectedTask(task)}
            >
              <CardContent className="p-4">
                {/* Task Title */}
                <h4 className="font-medium text-gray-900 mb-2">{task.title}</h4>

                {/* Task Meta */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {task.priority && (
                    <Badge
                      variant="outline"
                      className={
                        task.priority === 'high' ? 'border-red-300 text-red-700' :
                        task.priority === 'medium' ? 'border-yellow-300 text-yellow-700' :
                        'border-gray-300 text-gray-700'
                      }
                    >
                      <Flag className="w-3 h-3 mr-1" />
                      {task.priority}
                    </Badge>
                  )}

                  {task.dueDate && (
                    <Badge variant="secondary" className="gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(task.dueDate), 'MMM d')}
                    </Badge>
                  )}

                  {task.timeSpentMinutes && task.timeSpentMinutes > 0 && (
                    <Badge variant="secondary" className="gap-1">
                      <Clock className="w-3 h-3" />
                      {Math.floor(task.timeSpentMinutes / 60)}h {task.timeSpentMinutes % 60}m
                    </Badge>
                  )}
                </div>

                {/* Description Preview */}
                {task.description && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{task.description}</p>
                )}

                {/* Tap to open hint */}
                <div className="flex items-center justify-end mt-3 text-xs text-gray-400">
                  <span>Tap for details</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Swipe Hint */}
      <div className="bg-gray-50 border-t px-4 py-2 text-center text-xs text-gray-500">
        👈 Swipe left or right to view other columns 👉
      </div>

      {/* Task Detail Sheet */}
      {selectedTask && (
        <Sheet open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
          <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
            <SheetHeader className="mb-6">
              <SheetTitle>{selectedTask.title}</SheetTitle>
              {selectedTask.description && (
                <SheetDescription className="text-left">
                  {selectedTask.description}
                </SheetDescription>
              )}
            </SheetHeader>

            <div className="space-y-6">
              {/* Task Info */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <Badge>
                    {columns.find(c => c.id === selectedTask.status)?.title}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Priority</span>
                  <Badge
                    variant="outline"
                    className={
                      selectedTask.priority === 'high' ? 'border-red-300 text-red-700' :
                      selectedTask.priority === 'medium' ? 'border-yellow-300 text-yellow-700' :
                      'border-gray-300 text-gray-700'
                    }
                  >
                    {selectedTask.priority}
                  </Badge>
                </div>

                {selectedTask.dueDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Due Date</span>
                    <span className="text-sm font-medium">
                      {format(new Date(selectedTask.dueDate), 'MMM d, yyyy')}
                    </span>
                  </div>
                )}

                {selectedTask.timeSpentMinutes && selectedTask.timeSpentMinutes > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Time Spent</span>
                    <span className="text-sm font-medium">
                      {Math.floor(selectedTask.timeSpentMinutes / 60)}h {selectedTask.timeSpentMinutes % 60}m
                    </span>
                  </div>
                )}
              </div>

              {/* Move Actions */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 mb-3">Move to:</p>
                <div className="grid grid-cols-1 gap-2">
                  {columns
                    .filter(col => col.id !== selectedTask.status)
                    .map((col) => {
                      const ColIcon = col.icon;
                      return (
                        <Button
                          key={col.id}
                          variant="outline"
                          className="w-full justify-start gap-3 h-auto py-3"
                          onClick={() => handleMoveTask(selectedTask, col.id)}
                        >
                          <ColIcon className={`w-5 h-5 text-${col.color}-600`} />
                          <span className="flex-1 text-left">{col.title}</span>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </Button>
                      );
                    })}
                </div>
              </div>

              {/* Danger Zone */}
              <div className="pt-6 border-t">
                <Button
                  variant="destructive"
                  className="w-full gap-2"
                  onClick={() => handleDeleteTask(selectedTask.id)}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Task
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
