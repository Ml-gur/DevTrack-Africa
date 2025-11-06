/**
 * Inline Task Creator - Ultra-fast task creation
 * Type and press Enter - no modals, no friction
 */

import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  Plus,
  Flag,
  Calendar,
  X,
  Sparkles,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { Task, TaskStatus } from '../types/task';
import { toast } from 'sonner@2.0.3';

interface InlineTaskCreatorProps {
  projectId: string;
  status: TaskStatus;
  onTaskCreate: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function InlineTaskCreator({
  projectId,
  status,
  onTaskCreate,
  placeholder = 'Type task and press Enter...',
  autoFocus = false
}: InlineTaskCreatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [showOptions, setShowOptions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = async () => {
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onTaskCreate({
        projectId,
        title: title.trim(),
        description: '',
        status,
        priority,
        tags: [],
        dependencies: [],
        userId: '' // Will be set by parent
      });

      // Success feedback
      toast.success('Task created!', {
        icon: <CheckCircle2 className="w-4 h-4" />
      });

      // Reset form
      setTitle('');
      setPriority('medium');
      setShowOptions(false);
      
      // Keep input focused for quick adding
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      setTitle('');
      setShowOptions(false);
      setIsExpanded(false);
    }
  };

  const handleFocus = () => {
    setIsExpanded(true);
  };

  const handleBlur = () => {
    // Don't collapse if we're showing options
    if (!showOptions && !title.trim()) {
      setIsExpanded(false);
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'high': return 'bg-red-100 text-red-700 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getPriorityIcon = (p: string) => {
    switch (p) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      default: return '⚪';
    }
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => {
          setIsExpanded(true);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className="w-full p-3 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all group text-left"
      >
        <div className="flex items-center gap-2 text-gray-500 group-hover:text-blue-600">
          <Plus className="w-5 h-5" />
          <span className="text-sm font-medium">{placeholder}</span>
        </div>
      </button>
    );
  }

  return (
    <div className="relative">
      <div className="p-3 rounded-lg border-2 border-blue-400 bg-white shadow-md">
        {/* Main Input */}
        <div className="flex items-center gap-2 mb-2">
          <Input
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyPress}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 text-base h-auto py-1"
            disabled={isSubmitting}
          />
        </div>

        {/* Quick Options Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Priority Selector */}
            <div className="flex items-center gap-1 bg-gray-50 rounded-md p-1">
              {(['low', 'medium', 'high'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                    priority === p 
                      ? getPriorityColor(p) 
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                  title={`${p.charAt(0).toUpperCase() + p.slice(1)} priority`}
                >
                  {getPriorityIcon(p)}
                </button>
              ))}
            </div>

            {/* Quick Add Hint */}
            <div className="text-xs text-gray-500 hidden sm:flex items-center gap-1">
              <Zap className="w-3 h-3" />
              <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">Enter</kbd>
              to add
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setTitle('');
                setPriority('medium');
                setIsExpanded(false);
              }}
              disabled={isSubmitting}
              className="h-7 px-2"
            >
              <X className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!title.trim() || isSubmitting}
              className="h-7 gap-1"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Smart Suggestions (if title has content) */}
        {title.length > 3 && (
          <div className="mt-2 pt-2 border-t">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-gray-600">
                Tip: Add time estimate or priority to track better
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts Hint */}
      {isExpanded && (
        <div className="absolute top-full left-0 right-0 mt-1 text-xs text-gray-500 flex items-center justify-center gap-4">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-gray-100 rounded font-mono">Enter</kbd>
            Create
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-gray-100 rounded font-mono">Esc</kbd>
            Cancel
          </span>
        </div>
      )}
    </div>
  );
}

// Floating Action Button version for mobile
export function FABTaskCreator({
  onClick
}: {
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center text-white z-40 md:hidden"
      aria-label="Quick add task"
    >
      <Plus className="w-6 h-6" />
    </button>
  );
}
