/**
 * Project Quick Actions Panel
 * One-click access to all project management features
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import {
  Edit,
  Trash2,
  Upload,
  Download,
  Share2,
  FolderOpen,
  ListTodo,
  Flag,
  BarChart3,
  FileText,
  Star,
  Calendar,
  Users,
  Settings,
  Copy,
  Archive,
  Play,
  Pause,
  CheckCircle
} from 'lucide-react';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

interface ProjectQuickActionsProps {
  onEditProject: () => void;
  onDeleteProject: () => void;
  onUploadResource: () => void;
  onExportProject: () => void;
  onShareProject: () => void;
  onArchiveProject: () => void;
  onAddTask: () => void;
  onAddMilestone: () => void;
  onViewAnalytics: () => void;
  onToggleFavorite: () => void;
  isFavorite: boolean;
  projectStatus: string;
  onChangeStatus: (status: string) => void;
}

export default function ProjectQuickActions({
  onEditProject,
  onDeleteProject,
  onUploadResource,
  onExportProject,
  onShareProject,
  onArchiveProject,
  onAddTask,
  onAddMilestone,
  onViewAnalytics,
  onToggleFavorite,
  isFavorite,
  projectStatus,
  onChangeStatus
}: ProjectQuickActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Quick Actions
        </CardTitle>
        <CardDescription>
          Manage your project with one click
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primary Actions */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Common Actions</h4>
          
          <Button
            className="w-full justify-start gap-2"
            variant="default"
            onClick={onAddTask}
          >
            <ListTodo className="w-4 h-4" />
            Add Task
          </Button>

          <Button
            className="w-full justify-start gap-2"
            variant="outline"
            onClick={onUploadResource}
          >
            <Upload className="w-4 h-4" />
            Upload Files
          </Button>

          <Button
            className="w-full justify-start gap-2"
            variant="outline"
            onClick={onAddMilestone}
          >
            <Flag className="w-4 h-4" />
            Add Milestone
          </Button>

          <Button
            className="w-full justify-start gap-2"
            variant="outline"
            onClick={onEditProject}
          >
            <Edit className="w-4 h-4" />
            Edit Project
          </Button>
        </div>

        <Separator />

        {/* Status Quick Change */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Status</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant={projectStatus === 'planning' ? 'default' : 'outline'}
              className="justify-start gap-2"
              onClick={() => onChangeStatus('planning')}
            >
              <FileText className="w-3 h-3" />
              Planning
            </Button>
            <Button
              size="sm"
              variant={projectStatus === 'in_progress' ? 'default' : 'outline'}
              className="justify-start gap-2"
              onClick={() => onChangeStatus('in_progress')}
            >
              <Play className="w-3 h-3" />
              Active
            </Button>
            <Button
              size="sm"
              variant={projectStatus === 'on_hold' ? 'default' : 'outline'}
              className="justify-start gap-2"
              onClick={() => onChangeStatus('on_hold')}
            >
              <Pause className="w-3 h-3" />
              On Hold
            </Button>
            <Button
              size="sm"
              variant={projectStatus === 'completed' ? 'default' : 'outline'}
              className="justify-start gap-2"
              onClick={() => onChangeStatus('completed')}
            >
              <CheckCircle className="w-3 h-3" />
              Done
            </Button>
          </div>
        </div>

        <Separator />

        {/* Data Actions */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Data & Sharing</h4>
          
          <Button
            className="w-full justify-start gap-2"
            variant="outline"
            onClick={onShareProject}
          >
            <Share2 className="w-4 h-4" />
            Share Project
          </Button>

          <Button
            className="w-full justify-start gap-2"
            variant="outline"
            onClick={onExportProject}
          >
            <Download className="w-4 h-4" />
            Export Data
          </Button>

          <Button
            className="w-full justify-start gap-2"
            variant="outline"
            onClick={onToggleFavorite}
          >
            <Star className={`w-4 h-4 ${isFavorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
            {isFavorite ? 'Unfavorite' : 'Add to Favorites'}
          </Button>
        </div>

        <Separator />

        {/* Analytics */}
        <div className="space-y-2">
          <Button
            className="w-full justify-start gap-2"
            variant="outline"
            onClick={onViewAnalytics}
          >
            <BarChart3 className="w-4 h-4" />
            View Analytics
          </Button>
        </div>

        <Separator />

        {/* Archive & Delete */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Manage</h4>
          
          <Button
            className="w-full justify-start gap-2"
            variant="outline"
            onClick={onArchiveProject}
          >
            <Archive className="w-4 h-4" />
            Archive Project
          </Button>

          <Button
            className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            variant="outline"
            onClick={onDeleteProject}
          >
            <Trash2 className="w-4 h-4" />
            Delete Project
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
