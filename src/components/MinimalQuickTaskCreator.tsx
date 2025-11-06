/**
 * Minimal Quick Task Creator - Inline task creation with smooth animations
 */

import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  Plus,
  X,
  Calendar,
  Flag,
  Tag,
  Check,
  Sparkles
} from 'lucide-react';
import { Task, TaskPriority, TaskStatus } from '../types/task';
import { toast } from 'sonner@2.0.3';

interface MinimalQuickTaskCreatorProps {
  projectId: string;
  status: TaskStatus;
  onTaskCreate: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  placeholder?: string;
}

export default function MinimalQuickTaskCreator({
  projectId,
  status,
  onTaskCreate,
  placeholder = 'Add a task...'
}: MinimalQuickTaskCreatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error('Task title is required');
      return;
    }

    setIsCreating(true);
    try {
      const newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
        projectId,
        title: title.trim(),
        description: '',
        status,
        priority,
        dueDate: dueDate || undefined,
        tags: tags.length > 0 ? tags : undefined,
        position: 0,
        timeSpentMinutes: 0
      };

      await onTaskCreate(newTask);
      
      // Reset form
      setTitle('');
      setPriority('medium');
      setDueDate('');
      setTags([]);
      setTagInput('');
      setIsExpanded(false);
      
      toast.success('Task created successfully');
    } catch (error) {
      toast.error('Failed to create task');
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCreate();
    } else if (e.key === 'Escape') {
      setIsExpanded(false);
      setTitle('');
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const getPriorityColor = (p: TaskPriority) => {
    switch (p) {
      case 'high':
        return 'bg-red-500 hover:bg-red-600';
      case 'medium':
        return 'bg-yellow-500 hover:bg-yellow-600';
      default:
        return 'bg-gray-400 hover:bg-gray-500';
    }
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full p-3 text-left text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 hover:border-gray-300 transition-all group"
      >
        <div className="flex items-center gap-2">
          <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span>{placeholder}</span>
          <Sparkles className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </button>
    );
  }

  return (
    <div className="bg-white rounded-lg border-2 border-blue-200 shadow-lg p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Title Input */}
      <Input
        ref={inputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="What needs to be done?"
        className="border-0 bg-transparent text-base font-medium focus-visible:ring-0 px-0"
      />

      {/* Quick Options */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Priority Selector */}
        <div className="flex items-center gap-1">
          <Flag className="w-3 h-3 text-gray-400" />
          <div className="flex gap-1">
            {(['low', 'medium', 'high'] as TaskPriority[]).map((p) => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={`w-6 h-6 rounded-full transition-all ${
                  priority === p
                    ? `${getPriorityColor(p)} scale-110`
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
                title={p}
              />
            ))}
          </div>
        </div>

        <div className="h-4 w-px bg-gray-200" />

        {/* Due Date */}
        <button
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'date';
            input.onchange = (e: any) => setDueDate(e.target.value);
            input.click();
          }}
          className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
        >
          <Calendar className="w-3 h-3" />
          {dueDate ? new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Due date'}
        </button>

        <div className="h-4 w-px bg-gray-200" />

        {/* Tags */}
        <div className="flex items-center gap-1 flex-1 min-w-0">
          <Tag className="w-3 h-3 text-gray-400 flex-shrink-0" />
          <div className="flex flex-wrap items-center gap-1 flex-1 min-w-0">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs gap-1 group"
              >
                {tag}
                <X
                  className="w-3 h-3 cursor-pointer opacity-50 group-hover:opacity-100"
                  onClick={() => removeTag(tag)}
                />
              </Badge>
            ))}
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder={tags.length === 0 ? 'Add tags...' : ''}
              className="flex-1 min-w-[60px] text-xs bg-transparent outline-none"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2 border-t">
        <div className="text-xs text-gray-500">
          Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">Enter</kbd> to save
          or <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">Esc</kbd> to cancel
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setIsExpanded(false);
              setTitle('');
            }}
          >
            <X className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            onClick={handleCreate}
            disabled={isCreating || !title.trim()}
            className="gap-2"
          >
            <Check className="w-4 h-4" />
            {isCreating ? 'Creating...' : 'Add Task'}
          </Button>
        </div>
      </div>
    </div>
  );
}
