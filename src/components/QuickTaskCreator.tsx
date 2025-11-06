import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { 
  Plus, 
  Zap, 
  Flag,
  Calendar,
  Clock,
  Tag,
  X,
  Check
} from 'lucide-react';
import { Task, TaskPriority } from '../types/task';

interface QuickTaskCreatorProps {
  projectId: string;
  onCreateTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onClose?: () => void;
  defaultStatus?: 'todo' | 'in_progress' | 'completed';
}

export default function QuickTaskCreator({ 
  projectId, 
  onCreateTask,
  onClose,
  defaultStatus = 'todo'
}: QuickTaskCreatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Keyboard shortcut: Cmd/Ctrl + K to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      
      if (e.key === 'Escape' && isOpen) {
        handleCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleCreate = async () => {
    if (!title.trim()) return;

    setIsCreating(true);
    try {
      const newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
        projectId,
        title: title.trim(),
        status: defaultStatus,
        priority,
        estimatedHours: estimatedHours ? Number(estimatedHours) : undefined,
        timeSpentMinutes: 0,
        position: 0
      };

      await onCreateTask(newTask);
      
      // Reset form
      setTitle('');
      setPriority('medium');
      setEstimatedHours('');
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setPriority('medium');
    setEstimatedHours('');
    setIsOpen(false);
    if (onClose) {
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCreate();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="h-14 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all gap-2 rounded-full"
        >
          <Plus className="w-5 h-5" />
          Quick Add Task
          <kbd className="ml-2 px-2 py-1 text-xs bg-white/20 rounded">⌘K</kbd>
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
        onClick={handleCancel}
      />

      {/* Quick Creator Card */}
      <div className="fixed bottom-6 right-6 z-50 w-full max-w-md">
        <Card className="shadow-2xl border-2 border-blue-200 bg-white">
          <CardContent className="p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold">Quick Add Task</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Task Title Input */}
            <div className="space-y-2">
              <Input
                ref={inputRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="What needs to be done?"
                className="text-base font-medium"
              />
              <p className="text-xs text-muted-foreground">
                Press Enter to create • Esc to cancel
              </p>
            </div>

            {/* Quick Options */}
            <div className="space-y-3">
              {/* Priority */}
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium w-20">Priority:</span>
                <div className="flex gap-1">
                  {(['low', 'medium', 'high'] as TaskPriority[]).map((p) => (
                    <Button
                      key={p}
                      variant={priority === p ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPriority(p)}
                      className={`h-7 text-xs capitalize ${
                        priority === p 
                          ? p === 'high' 
                            ? 'bg-red-600 hover:bg-red-700' 
                            : p === 'medium'
                            ? 'bg-yellow-600 hover:bg-yellow-700'
                            : 'bg-green-600 hover:bg-green-700'
                          : ''
                      }`}
                    >
                      {p}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Estimated Hours */}
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium w-20">Estimate:</span>
                <Input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(e.target.value)}
                  placeholder="Hours"
                  className="h-7 text-sm w-24"
                />
                <span className="text-sm text-muted-foreground">hours</span>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium w-20">Status:</span>
                <Badge variant="outline" className={
                  defaultStatus === 'completed' 
                    ? 'bg-green-100 text-green-700 border-green-200'
                    : defaultStatus === 'in_progress'
                    ? 'bg-blue-100 text-blue-700 border-blue-200'
                    : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                }>
                  {defaultStatus === 'in_progress' ? 'In Progress' : defaultStatus}
                </Badge>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleCreate}
                disabled={!title.trim() || isCreating}
                className="flex-1 gap-2"
              >
                <Check className="w-4 h-4" />
                {isCreating ? 'Creating...' : 'Create Task'}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isCreating}
              >
                Cancel
              </Button>
            </div>

            {/* Tips */}
            <div className="pt-2 border-t text-xs text-muted-foreground space-y-1">
              <p className="flex items-center gap-2">
                <Zap className="w-3 h-3" />
                Pro tip: Use keyboard shortcuts for faster task creation
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

// Floating action button component for mobile
export function FloatingQuickAdd({ onClick }: { onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      size="lg"
      className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all p-0 md:hidden"
    >
      <Plus className="w-6 h-6" />
    </Button>
  );
}