/**
 * Minimal Project Manager - Clean, Modern Design
 * Focused on clarity, simplicity, and functionality
 */

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
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
  FileText
} from 'lucide-react';
import { Project } from '../types/database';
import { Task } from '../types/task';
import { Milestone } from './ProjectMilestones';

// Import sub-components
import MinimalKanbanView from './MinimalKanbanView';
import MinimalResourceView from './MinimalResourceView';
import MinimalAnalyticsView from './MinimalAnalyticsView';
import MinimalOverviewView from './MinimalOverviewView';
import MinimalProjectNotesView from './MinimalProjectNotesView';

interface MinimalProjectManagerProps {
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

export default function MinimalProjectManager({
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
}: MinimalProjectManagerProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isFavorite, setIsFavorite] = useState(false);

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
              
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
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
                <Badge variant={project.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                  {project.status}
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
    </div>
  );
}
