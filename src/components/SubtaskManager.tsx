import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Card, CardContent } from './ui/card';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

interface SubtaskManagerProps {
  taskId: string;
  subtasks: Subtask[];
  onUpdate: (subtasks: Subtask[]) => void;
  isExpanded?: boolean;
}

export default function SubtaskManager({ 
  taskId, 
  subtasks = [], 
  onUpdate,
  isExpanded: initialExpanded = true
}: SubtaskManagerProps) {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  const completedCount = subtasks.filter(st => st.completed).length;
  const totalCount = subtasks.length;
  const completionPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const addSubtask = () => {
    if (!newSubtaskTitle.trim()) return;

    const newSubtask: Subtask = {
      id: `${taskId}-subtask-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    };

    onUpdate([...subtasks, newSubtask]);
    setNewSubtaskTitle('');
  };

  const toggleSubtask = (subtaskId: string) => {
    const updated = subtasks.map(st => {
      if (st.id === subtaskId) {
        return {
          ...st,
          completed: !st.completed,
          completedAt: !st.completed ? new Date().toISOString() : undefined
        };
      }
      return st;
    });
    onUpdate(updated);
  };

  const deleteSubtask = (subtaskId: string) => {
    onUpdate(subtasks.filter(st => st.id !== subtaskId));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSubtask();
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="gap-2 h-8 px-2"
        >
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          <span className="font-medium">Subtasks</span>
          {totalCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {completedCount}/{totalCount}
            </Badge>
          )}
        </Button>

        {totalCount > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{completionPercentage.toFixed(0)}%</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && isExpanded && (
        <Progress value={completionPercentage} className="h-1.5" />
      )}

      {/* Subtasks List */}
      {isExpanded && (
        <div className="space-y-2">
          {subtasks.length > 0 && (
            <div className="space-y-1.5">
              {subtasks.map((subtask) => (
                <Card 
                  key={subtask.id}
                  className={`border-slate-200 transition-all ${
                    subtask.completed ? 'bg-slate-50/50' : 'bg-white'
                  }`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3 group">
                      {/* Drag Handle */}
                      <div className="cursor-move text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <GripVertical className="w-4 h-4" />
                      </div>

                      {/* Checkbox */}
                      <div className="flex-shrink-0">
                        <Checkbox
                          checked={subtask.completed}
                          onCheckedChange={() => toggleSubtask(subtask.id)}
                          className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                        />
                      </div>

                      {/* Title */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${
                          subtask.completed 
                            ? 'line-through text-muted-foreground' 
                            : 'text-slate-900'
                        }`}>
                          {subtask.title}
                        </p>
                        {subtask.completedAt && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Completed {new Date(subtask.completedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      {/* Status Icon */}
                      <div className="flex-shrink-0">
                        {subtask.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-300" />
                        )}
                      </div>

                      {/* Delete Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSubtask(subtask.id)}
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-600" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Add New Subtask */}
          <div className="flex gap-2">
            <Input
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add a subtask..."
              className="flex-1 h-9 text-sm"
            />
            <Button
              size="sm"
              onClick={addSubtask}
              disabled={!newSubtaskTitle.trim()}
              className="h-9 px-3"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>

          {/* Empty State */}
          {subtasks.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              <Circle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No subtasks yet</p>
              <p className="text-xs mt-1">Break down this task into smaller steps</p>
            </div>
          )}
        </div>
      )}

      {/* Compact View Summary */}
      {!isExpanded && totalCount > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground pl-6">
          <Progress value={completionPercentage} className="h-1 flex-1 max-w-[100px]" />
          <span className="text-xs">
            {completedCount} of {totalCount} completed
          </span>
        </div>
      )}
    </div>
  );
}

// Helper component for task cards to show subtask summary
export function SubtaskSummary({ subtasks }: { subtasks: Subtask[] }) {
  if (subtasks.length === 0) return null;

  const completed = subtasks.filter(st => st.completed).length;
  const total = subtasks.length;
  const percentage = (completed / total) * 100;

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <CheckCircle2 className="w-3 h-3" />
      <span>{completed}/{total}</span>
      <Progress value={percentage} className="h-1 w-12" />
    </div>
  );
}
