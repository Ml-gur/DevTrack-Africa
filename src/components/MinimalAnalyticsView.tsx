/**
 * Minimal Analytics View - Clean project insights
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { Project } from '../types/database';
import { Task } from '../types/task';
import { format, differenceInDays, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';

interface MinimalAnalyticsViewProps {
  project: Project;
  tasks: Task[];
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

export default function MinimalAnalyticsView({ project, tasks = [] }: MinimalAnalyticsViewProps) {
  // Helper function to safely parse dates - must be defined first
  const getValidDate = (dateStr: string | undefined | null): Date | null => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  };

  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const todoTasks = tasks.filter(t => t.status === 'todo').length;
  
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Time tracking
  const totalTimeSpent = tasks.reduce((sum, task) => sum + (task.timeSpentMinutes || 0), 0);
  const avgTimePerTask = totalTasks > 0 ? Math.round(totalTimeSpent / totalTasks) : 0;
  
  // Priority distribution
  const highPriorityTasks = tasks.filter(t => t.priority === 'high').length;
  const mediumPriorityTasks = tasks.filter(t => t.priority === 'medium').length;
  const lowPriorityTasks = tasks.filter(t => t.priority === 'low').length;
  
  // Overdue tasks
  const now = new Date();
  const overdueTasks = tasks.filter(t => {
    if (!t.dueDate || t.status === 'completed') return false;
    const dueDate = getValidDate(t.dueDate);
    return dueDate && dueDate < now;
  }).length;
  
  // Tasks this week
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);
  const tasksThisWeek = tasks.filter(t => {
    const createdDate = getValidDate(t.createdAt || t.created_at);
    return createdDate && isWithinInterval(createdDate, { start: weekStart, end: weekEnd });
  }).length;
  
  const completedThisWeek = tasks.filter(t => {
    const completedDate = getValidDate(t.completedAt);
    return completedDate && isWithinInterval(completedDate, { start: weekStart, end: weekEnd });
  }).length;

  const projectStartDate = getValidDate(project.startDate) || getValidDate(project.created_at) || now;
  const projectEndDate = getValidDate(project.endDate) || getValidDate(project.due_date);
  const daysActive = differenceInDays(now, projectStartDate);
  const daysRemaining = projectEndDate ? differenceInDays(projectEndDate, now) : null;

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <Badge variant="outline" className="text-green-600 border-green-200">
                <TrendingUp className="w-3 h-3 mr-1" />
                {completionRate}%
              </Badge>
            </div>
            <p className="text-2xl font-bold text-gray-900">{completedTasks}</p>
            <p className="text-sm text-gray-500">Completed Tasks</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <Badge variant="outline" className="text-blue-600 border-blue-200">
                Active
              </Badge>
            </div>
            <p className="text-2xl font-bold text-gray-900">{inProgressTasks}</p>
            <p className="text-sm text-gray-500">In Progress</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <Badge variant="outline" className="text-orange-600 border-orange-200">
                Total
              </Badge>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatTime(totalTimeSpent)}</p>
            <p className="text-sm text-gray-500">Time Spent</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              {overdueTasks > 0 && (
                <Badge variant="destructive">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  {overdueTasks}
                </Badge>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900">{overdueTasks}</p>
            <p className="text-sm text-gray-500">Overdue Tasks</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <Target className="w-4 h-4 text-purple-600" />
              </div>
              Completion Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Overall Progress</span>
                <span className="text-sm font-semibold text-gray-900">{completionRate}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-900">Completed</span>
                </div>
                <span className="text-lg font-bold text-green-600">{completedTasks}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">In Progress</span>
                </div>
                <span className="text-lg font-bold text-blue-600">{inProgressTasks}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">To Do</span>
                </div>
                <span className="text-lg font-bold text-gray-600">{todoTasks}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <PieChart className="w-4 h-4 text-blue-600" />
              </div>
              Priority Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">High Priority</span>
                  <span className="text-sm font-semibold text-red-600">{highPriorityTasks}</span>
                </div>
                <Progress 
                  value={totalTasks > 0 ? (highPriorityTasks / totalTasks) * 100 : 0} 
                  className="h-2 [&>div]:bg-red-500" 
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Medium Priority</span>
                  <span className="text-sm font-semibold text-yellow-600">{mediumPriorityTasks}</span>
                </div>
                <Progress 
                  value={totalTasks > 0 ? (mediumPriorityTasks / totalTasks) * 100 : 0} 
                  className="h-2 [&>div]:bg-yellow-500" 
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Low Priority</span>
                  <span className="text-sm font-semibold text-gray-600">{lowPriorityTasks}</span>
                </div>
                <Progress 
                  value={totalTasks > 0 ? (lowPriorityTasks / totalTasks) * 100 : 0} 
                  className="h-2" 
                />
              </div>
            </div>

            <div className="pt-4 border-t space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Total Tasks</span>
                <span className="font-semibold text-gray-900">{totalTasks}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Avg. Time per Task</span>
                <span className="font-semibold text-gray-900">{formatTime(avgTimePerTask)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">This Week</p>
                <p className="text-lg font-bold text-gray-900">{completedThisWeek} completed</p>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {tasksThisWeek} tasks created this week
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Days Active</p>
                <p className="text-lg font-bold text-gray-900">{daysActive} days</p>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Since {formatDate(projectStartDate, 'MMM d, yyyy')}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-pink-50 flex items-center justify-center">
                <Target className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Days Remaining</p>
                <p className="text-lg font-bold text-gray-900">
                  {daysRemaining !== null ? `${daysRemaining} days` : 'No deadline'}
                </p>
              </div>
            </div>
            {projectEndDate && (
              <div className="text-xs text-gray-500">
                Due {formatDate(projectEndDate, 'MMM d, yyyy')}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary Card */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-purple-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Project Insights</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Your project is {completionRate}% complete with {completedTasks} tasks finished out of {totalTasks} total.
                {overdueTasks > 0 && (
                  <> You have {overdueTasks} overdue task{overdueTasks > 1 ? 's' : ''} that need attention.</>
                )}
                {' '}The team has invested {formatTime(totalTimeSpent)} of total effort so far.
                {daysRemaining !== null && daysRemaining > 0 && (
                  <> You have {daysRemaining} days remaining to complete this project.</>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
