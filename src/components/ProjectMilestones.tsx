import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { 
  Flag, 
  Plus, 
  CheckCircle2, 
  Circle,
  Calendar,
  Target,
  TrendingUp,
  Edit,
  Trash2,
  Award
} from 'lucide-react';

export interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  completedAt?: string;
  progress: number;
  linkedTaskIds: string[];
  createdAt: string;
}

interface ProjectMilestonesProps {
  projectId: string;
  milestones: Milestone[];
  tasks: any[];
  onUpdate: (milestones: Milestone[]) => void;
}

export default function ProjectMilestones({ 
  projectId, 
  milestones = [], 
  tasks = [],
  onUpdate 
}: ProjectMilestonesProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);

  const sortedMilestones = [...milestones].sort((a, b) => {
    // Completed milestones go to bottom
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    // Sort by due date
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const upcomingMilestones = sortedMilestones.filter(m => !m.completed);
  const completedMilestones = sortedMilestones.filter(m => m.completed);

  const toggleMilestone = (milestoneId: string) => {
    const updated = milestones.map(m => {
      if (m.id === milestoneId) {
        return {
          ...m,
          completed: !m.completed,
          completedAt: !m.completed ? new Date().toISOString() : undefined,
          progress: !m.completed ? 100 : m.progress
        };
      }
      return m;
    });
    onUpdate(updated);
  };

  const deleteMilestone = (milestoneId: string) => {
    if (confirm('Are you sure you want to delete this milestone?')) {
      onUpdate(milestones.filter(m => m.id !== milestoneId));
    }
  };

  const addOrUpdateMilestone = (milestone: Omit<Milestone, 'id' | 'createdAt'>) => {
    if (editingMilestone) {
      // Update existing
      const updated = milestones.map(m => 
        m.id === editingMilestone.id 
          ? { ...m, ...milestone }
          : m
      );
      onUpdate(updated);
    } else {
      // Add new
      const newMilestone: Milestone = {
        ...milestone,
        id: `milestone-${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      onUpdate([...milestones, newMilestone]);
    }
    setShowAddDialog(false);
    setEditingMilestone(null);
  };

  const getDaysUntil = (date: string): number => {
    const diff = new Date(date).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const overallProgress = milestones.length > 0
    ? Math.round(milestones.reduce((sum, m) => sum + m.progress, 0) / milestones.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Flag className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">Milestones</h3>
            <p className="text-sm text-muted-foreground">
              {completedMilestones.length} of {milestones.length} completed
            </p>
          </div>
        </div>

        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Milestone
        </Button>
      </div>

      {/* Overall Progress */}
      {milestones.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-2xl font-bold">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </CardContent>
        </Card>
      )}

      {/* Upcoming Milestones */}
      {upcomingMilestones.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground uppercase">Upcoming</h4>
          {upcomingMilestones.map((milestone) => (
            <MilestoneCard
              key={milestone.id}
              milestone={milestone}
              tasks={tasks}
              onToggle={toggleMilestone}
              onEdit={(m) => {
                setEditingMilestone(m);
                setShowAddDialog(true);
              }}
              onDelete={deleteMilestone}
            />
          ))}
        </div>
      )}

      {/* Completed Milestones */}
      {completedMilestones.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground uppercase">Completed</h4>
          {completedMilestones.map((milestone) => (
            <MilestoneCard
              key={milestone.id}
              milestone={milestone}
              tasks={tasks}
              onToggle={toggleMilestone}
              onEdit={(m) => {
                setEditingMilestone(m);
                setShowAddDialog(true);
              }}
              onDelete={deleteMilestone}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {milestones.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Flag className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">No milestones yet</h3>
            <p className="text-muted-foreground mb-4">
              Set milestones to track major achievements in your project
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Milestone
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <MilestoneDialog
        isOpen={showAddDialog}
        milestone={editingMilestone}
        onClose={() => {
          setShowAddDialog(false);
          setEditingMilestone(null);
        }}
        onSubmit={addOrUpdateMilestone}
      />
    </div>
  );
}

function MilestoneCard({ 
  milestone, 
  tasks,
  onToggle, 
  onEdit, 
  onDelete 
}: { 
  milestone: Milestone;
  tasks: any[];
  onToggle: (id: string) => void;
  onEdit: (milestone: Milestone) => void;
  onDelete: (id: string) => void;
}) {
  const daysUntil = Math.ceil((new Date(milestone.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysUntil < 0 && !milestone.completed;
  const isDueSoon = daysUntil <= 7 && daysUntil >= 0 && !milestone.completed;

  const linkedTasks = tasks.filter(t => milestone.linkedTaskIds.includes(t.id));
  const completedLinkedTasks = linkedTasks.filter(t => t.status === 'completed').length;

  return (
    <Card className={`border-l-4 ${
      milestone.completed 
        ? 'border-l-green-500 bg-green-50/30' 
        : isOverdue 
        ? 'border-l-red-500'
        : isDueSoon
        ? 'border-l-yellow-500'
        : 'border-l-blue-500'
    }`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div 
            className="flex-shrink-0 mt-1 cursor-pointer"
            onClick={() => onToggle(milestone.id)}
          >
            {milestone.completed ? (
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            ) : (
              <Circle className="w-6 h-6 text-slate-400 hover:text-blue-600 transition-colors" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1">
                <h4 className={`font-semibold text-lg ${
                  milestone.completed ? 'line-through text-muted-foreground' : ''
                }`}>
                  {milestone.title}
                </h4>
                {milestone.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {milestone.description}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(milestone)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(milestone.id)}
                  className="h-8 w-8 p-0 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="outline" className="gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(milestone.dueDate).toLocaleDateString()}
              </Badge>

              {isOverdue && (
                <Badge variant="destructive" className="gap-1">
                  {Math.abs(daysUntil)} days overdue
                </Badge>
              )}

              {isDueSoon && (
                <Badge variant="outline" className="bg-yellow-50 border-yellow-200 text-yellow-700 gap-1">
                  Due in {daysUntil} day{daysUntil !== 1 ? 's' : ''}
                </Badge>
              )}

              {milestone.completed && milestone.completedAt && (
                <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700 gap-1">
                  <Award className="w-3 h-3" />
                  Completed {new Date(milestone.completedAt).toLocaleDateString()}
                </Badge>
              )}

              {linkedTasks.length > 0 && (
                <Badge variant="secondary" className="gap-1">
                  <Target className="w-3 h-3" />
                  {completedLinkedTasks}/{linkedTasks.length} tasks
                </Badge>
              )}
            </div>

            {!milestone.completed && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{milestone.progress}%</span>
                </div>
                <Progress value={milestone.progress} className="h-2" />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MilestoneDialog({ 
  isOpen, 
  milestone, 
  onClose, 
  onSubmit 
}: {
  isOpen: boolean;
  milestone: Milestone | null;
  onClose: () => void;
  onSubmit: (milestone: Omit<Milestone, 'id' | 'createdAt'>) => void;
}) {
  const [formData, setFormData] = useState({
    title: milestone?.title || '',
    description: milestone?.description || '',
    dueDate: milestone?.dueDate?.split('T')[0] || new Date().toISOString().split('T')[0],
    progress: milestone?.progress || 0,
    completed: milestone?.completed || false,
    linkedTaskIds: milestone?.linkedTaskIds || []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    onSubmit({
      title: formData.title,
      description: formData.description,
      dueDate: formData.dueDate,
      progress: formData.progress,
      completed: formData.completed,
      linkedTaskIds: formData.linkedTaskIds,
      completedAt: milestone?.completedAt
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {milestone ? 'Edit Milestone' : 'Create Milestone'}
          </DialogTitle>
          <DialogDescription>
            Set a major goal or checkpoint for your project
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Milestone Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Beta Launch, MVP Complete"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What does achieving this milestone mean?"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Target Date *</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="progress">Progress (%)</Label>
              <Input
                id="progress"
                type="number"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {milestone ? 'Update' : 'Create'} Milestone
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
