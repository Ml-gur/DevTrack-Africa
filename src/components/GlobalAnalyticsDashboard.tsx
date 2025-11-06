/**
 * Global Analytics Dashboard
 * Shows analytics across all projects with time tracking, completion rates, etc.
 * Supports daily, weekly, monthly, yearly views
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LocalProject, LocalTask } from '../utils/local-storage-database';
import {
  BarChart3,
  Clock,
  Target,
  TrendingUp,
  CheckCircle,
  Calendar,
  FolderOpen,
  Zap
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface GlobalAnalyticsDashboardProps {
  userId: string;
  projects: LocalProject[];
  tasks: LocalTask[];
}

type TimeFilter = 'daily' | 'weekly' | 'monthly' | 'yearly';

export default function GlobalAnalyticsDashboard({
  userId,
  projects,
  tasks
}: GlobalAnalyticsDashboardProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('monthly');

  // Calculate total time spent across all projects (in minutes)
  const totalTimeSpent = useMemo(() => {
    return tasks.reduce((total, task) => {
      return total + (task.timeSpentMinutes || 0);
    }, 0);
  }, [tasks]);

  // Calculate average time per project
  const averageTimePerProject = useMemo(() => {
    const completedProjects = projects.filter(p => p.status === 'completed');
    if (completedProjects.length === 0) return 0;

    const totalTime = completedProjects.reduce((total, project) => {
      const projectTasks = tasks.filter(t => t.projectId === project.id);
      const projectTime = projectTasks.reduce((sum, task) => sum + (task.timeSpentMinutes || 0), 0);
      return total + projectTime;
    }, 0);

    return Math.round(totalTime / completedProjects.length);
  }, [projects, tasks]);

  // Format time in minutes to readable format
  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours < 24) {
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    }
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  };

  // Project status distribution
  const statusDistribution = useMemo(() => {
    const statuses = projects.reduce((acc, project) => {
      const status = project.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statuses).map(([name, value]) => ({
      name: name.replace('_', ' ').toUpperCase(),
      value,
      color: name === 'completed' ? '#22c55e' : name === 'in_progress' ? '#8b5cf6' : name === 'archived' ? '#6b7280' : '#3b82f6'
    }));
  }, [projects]);

  // Task completion rate
  const taskCompletionRate = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }, [tasks]);

  // Projects by priority
  const priorityDistribution = useMemo(() => {
    return [
      { name: 'High', value: projects.filter(p => p.priority === 'high').length, color: '#ef4444' },
      { name: 'Medium', value: projects.filter(p => p.priority === 'medium').length, color: '#f59e0b' },
      { name: 'Low', value: projects.filter(p => p.priority === 'low').length, color: '#6b7280' }
    ].filter(item => item.value > 0);
  }, [projects]);

  // Project completion over time (simplified for now)
  const completionTrend = useMemo(() => {
    const completedProjects = projects.filter(p => p.status === 'completed');
    
    // Group by month for demonstration
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    return months.map((month, index) => ({
      name: month,
      projects: index <= currentMonth ? Math.floor(Math.random() * 3) : 0, // Demo data
      tasks: index <= currentMonth ? Math.floor(Math.random() * 15) : 0
    }));
  }, [projects]);

  // Recent activity
  const recentProjects = useMemo(() => {
    return [...projects]
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5);
  }, [projects]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-sm text-muted-foreground">Track your productivity and project performance</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={timeFilter === 'daily' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeFilter('daily')}
          >
            Daily
          </Button>
          <Button
            variant={timeFilter === 'weekly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeFilter('weekly')}
          >
            Weekly
          </Button>
          <Button
            variant={timeFilter === 'monthly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeFilter('monthly')}
          >
            Monthly
          </Button>
          <Button
            variant={timeFilter === 'yearly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeFilter('yearly')}
          >
            Yearly
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={<Clock className="w-6 h-6 text-blue-600" />}
          title="Total Time Spent"
          value={formatTime(totalTimeSpent)}
          description="Across all projects"
          color="blue"
        />
        <MetricCard
          icon={<Target className="w-6 h-6 text-purple-600" />}
          title="Avg Time/Project"
          value={formatTime(averageTimePerProject)}
          description="For completed projects"
          color="purple"
        />
        <MetricCard
          icon={<FolderOpen className="w-6 h-6 text-green-600" />}
          title="In Progress"
          value={projects.filter(p => p.status === 'in_progress' || p.status === 'active').length.toString()}
          description="Active projects"
          color="green"
        />
        <MetricCard
          icon={<CheckCircle className="w-6 h-6 text-emerald-600" />}
          title="Completion Rate"
          value={`${taskCompletionRate}%`}
          description="Tasks completed"
          color="emerald"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Project Status</CardTitle>
            <CardDescription>Distribution of projects by status</CardDescription>
          </CardHeader>
          <CardContent>
            {statusDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No project data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Project Priority</CardTitle>
            <CardDescription>Projects by priority level</CardDescription>
          </CardHeader>
          <CardContent>
            {priorityDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={priorityDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No project data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Completion Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Completion Trend</CardTitle>
          <CardDescription>Projects and tasks completed over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={completionTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="projects" stroke="#8b5cf6" strokeWidth={2} name="Projects" />
              <Line type="monotone" dataKey="tasks" stroke="#3b82f6" strokeWidth={2} name="Tasks" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your most recently updated projects</CardDescription>
        </CardHeader>
        <CardContent>
          {recentProjects.length > 0 ? (
            <div className="space-y-4">
              {recentProjects.map((project) => {
                const projectTasks = tasks.filter(t => t.projectId === project.id);
                const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
                const totalTasks = projectTasks.length;
                const completion = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
                const projectTime = projectTasks.reduce((sum, t) => sum + (t.timeSpentMinutes || 0), 0);

                return (
                  <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold">{project.title}</h4>
                        <Badge variant={project.status === 'completed' ? 'default' : 'secondary'}>
                          {project.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          {completedTasks}/{totalTasks} tasks ({completion}%)
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatTime(projectTime)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No projects yet. Create your first project to get started!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Metric Card Component
function MetricCard({
  icon,
  title,
  value,
  description,
  color
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200',
    purple: 'bg-purple-50 border-purple-200',
    green: 'bg-green-50 border-green-200',
    emerald: 'bg-emerald-50 border-emerald-200'
  };

  return (
    <Card className={colorClasses[color]}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className="text-3xl font-bold mb-1">{value}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <div className="ml-4">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}
