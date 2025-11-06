import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Target,
  Activity,
  Calendar,
  Award,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Timer,
  Users,
  Download,
  Filter
} from 'lucide-react';
import { Project } from '../types/database';
import { Task } from '../types/task';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

interface ProjectAnalyticsProps {
  project: Project;
  tasks: Task[];
  onClose?: () => void;
}

export default function ProjectAnalytics({ project, tasks, onClose }: ProjectAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month');

  // Calculate comprehensive metrics
  const metrics = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const filterByTime = (task: Task) => {
      const createdAt = new Date(task.createdAt);
      if (timeRange === 'week') return createdAt >= weekAgo;
      if (timeRange === 'month') return createdAt >= monthAgo;
      return true;
    };

    const filteredTasks = tasks.filter(filterByTime);

    const completedTasks = filteredTasks.filter(t => t.status === 'completed');
    const inProgressTasks = filteredTasks.filter(t => t.status === 'in_progress');
    const todoTasks = filteredTasks.filter(t => t.status === 'todo');

    const totalTimeSpent = tasks.reduce((sum, t) => sum + (t.timeSpentMinutes || 0), 0);
    const totalEstimatedHours = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0) * 60, 0);

    const avgCompletionTime = completedTasks.length > 0
      ? completedTasks.reduce((sum, t) => {
          if (t.completedAt && t.createdAt) {
            const diff = new Date(t.completedAt).getTime() - new Date(t.createdAt).getTime();
            return sum + diff;
          }
          return sum;
        }, 0) / completedTasks.length / (1000 * 60 * 60 * 24) // Convert to days
      : 0;

    const highPriorityTasks = filteredTasks.filter(t => t.priority === 'high');
    const overdueTasks = filteredTasks.filter(t => {
      if (!t.dueDate) return false;
      return new Date(t.dueDate) < now && t.status !== 'completed';
    });

    // Task completion trend (last 7 days)
    const completionTrend = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const completed = completedTasks.filter(t => {
        if (!t.completedAt) return false;
        const completedDate = new Date(t.completedAt);
        return completedDate.toDateString() === date.toDateString();
      }).length;
      
      return { date: dateStr, completed };
    });

    // Priority distribution
    const priorityDist = {
      high: filteredTasks.filter(t => t.priority === 'high').length,
      medium: filteredTasks.filter(t => t.priority === 'medium').length,
      low: filteredTasks.filter(t => t.priority === 'low').length
    };

    // Status distribution
    const statusDist = {
      todo: todoTasks.length,
      inProgress: inProgressTasks.length,
      completed: completedTasks.length
    };

    // Velocity (tasks completed per week)
    const weeksActive = Math.max(1, Math.ceil((now.getTime() - new Date(project.created_at).getTime()) / (7 * 24 * 60 * 60 * 1000)));
    const velocity = completedTasks.length / weeksActive;

    // Estimated completion date
    const remainingTasks = todoTasks.length + inProgressTasks.length;
    const daysToComplete = velocity > 0 ? (remainingTasks / velocity) * 7 : 0;
    const estimatedCompletion = new Date(now.getTime() + daysToComplete * 24 * 60 * 60 * 1000);

    return {
      total: filteredTasks.length,
      completed: completedTasks.length,
      inProgress: inProgressTasks.length,
      todo: todoTasks.length,
      completionRate: filteredTasks.length > 0 ? (completedTasks.length / filteredTasks.length) * 100 : 0,
      totalTimeSpent,
      totalEstimatedHours,
      avgCompletionTime,
      highPriorityTasks: highPriorityTasks.length,
      overdueTasks: overdueTasks.length,
      completionTrend,
      priorityDist,
      statusDist,
      velocity,
      estimatedCompletion,
      efficiency: totalEstimatedHours > 0 ? (totalTimeSpent / totalEstimatedHours) * 100 : 0
    };
  }, [tasks, project, timeRange]);

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const COLORS = {
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#06b6d4',
    purple: '#8b5cf6'
  };

  const priorityChartData = [
    { name: 'High', value: metrics.priorityDist.high, color: COLORS.danger },
    { name: 'Medium', value: metrics.priorityDist.medium, color: COLORS.warning },
    { name: 'Low', value: metrics.priorityDist.low, color: COLORS.success }
  ];

  const statusChartData = [
    { name: 'To Do', value: metrics.statusDist.todo, color: COLORS.warning },
    { name: 'In Progress', value: metrics.statusDist.inProgress, color: COLORS.primary },
    { name: 'Completed', value: metrics.statusDist.completed, color: COLORS.success }
  ];

  const exportAnalytics = () => {
    const data = {
      project: {
        title: project.title,
        status: project.status,
        created: project.created_at
      },
      metrics,
      tasks: tasks.map(t => ({
        title: t.title,
        status: t.status,
        priority: t.priority,
        timeSpent: t.timeSpentMinutes,
        created: t.createdAt,
        completed: t.completedAt
      }))
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title}-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Project Analytics</h1>
            <p className="text-slate-600">{project.title}</p>
          </div>
          
          <div className="flex gap-3">
            <div className="flex gap-1 border rounded-lg p-1 bg-white">
              <Button
                variant={timeRange === 'week' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange('week')}
              >
                Week
              </Button>
              <Button
                variant={timeRange === 'month' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange('month')}
              >
                Month
              </Button>
              <Button
                variant={timeRange === 'all' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange('all')}
              >
                All Time
              </Button>
            </div>

            <Button variant="outline" onClick={exportAnalytics}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>

            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Completion Rate"
            value={`${metrics.completionRate.toFixed(1)}%`}
            subtitle={`${metrics.completed} of ${metrics.total} tasks`}
            icon={<Target className="w-5 h-5" />}
            color="blue"
            trend={metrics.completionRate > 50 ? 'up' : 'down'}
          />

          <MetricCard
            title="Time Tracked"
            value={formatTime(metrics.totalTimeSpent)}
            subtitle={`Est: ${formatTime(metrics.totalEstimatedHours)}`}
            icon={<Clock className="w-5 h-5" />}
            color="purple"
          />

          <MetricCard
            title="Velocity"
            value={metrics.velocity.toFixed(1)}
            subtitle="tasks per week"
            icon={<Zap className="w-5 h-5" />}
            color="green"
            trend="up"
          />

          <MetricCard
            title="Overdue Tasks"
            value={metrics.overdueTasks.toString()}
            subtitle={`${metrics.highPriorityTasks} high priority`}
            icon={<AlertTriangle className="w-5 h-5" />}
            color={metrics.overdueTasks > 0 ? 'red' : 'green'}
            trend={metrics.overdueTasks > 0 ? 'down' : 'neutral'}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Completion Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Completion Trend (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={metrics.completionTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="completed" 
                    stroke={COLORS.primary} 
                    fill={COLORS.primary}
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Priority Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Priority Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={priorityChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {priorityChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Project Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Project Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Avg. Task Completion</span>
                  <span className="font-medium">{metrics.avgCompletionTime.toFixed(1)} days</span>
                </div>
                <Progress value={Math.min(100, (metrics.avgCompletionTime / 7) * 100)} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Time Efficiency</span>
                  <span className="font-medium">{metrics.efficiency.toFixed(0)}%</span>
                </div>
                <Progress value={metrics.efficiency} className="h-2" />
              </div>

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Estimated Completion</span>
                </div>
                <p className="text-sm text-blue-700">
                  {metrics.velocity > 0 
                    ? metrics.estimatedCompletion.toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })
                    : 'Unable to estimate'}
                </p>
              </div>

              {metrics.overdueTasks > 0 && (
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-900">Action Required</span>
                  </div>
                  <p className="text-sm text-red-700">
                    {metrics.overdueTasks} task{metrics.overdueTasks > 1 ? 's are' : ' is'} overdue
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-900 mb-1">
                  {metrics.completed}
                </div>
                <div className="text-sm text-blue-700">Tasks Completed</div>
              </div>

              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Timer className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-purple-900 mb-1">
                  {formatTime(metrics.totalTimeSpent)}
                </div>
                <div className="text-sm text-purple-700">Time Invested</div>
              </div>

              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-900 mb-1">
                  {metrics.velocity.toFixed(1)}
                </div>
                <div className="text-sm text-green-700">Tasks/Week</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  color: 'blue' | 'purple' | 'green' | 'red';
  trend?: 'up' | 'down' | 'neutral';
}

function MetricCard({ title, value, subtitle, icon, color, trend }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600'
  };

  const trendIcons = {
    up: <TrendingUp className="w-3 h-3 text-green-600" />,
    down: <AlertTriangle className="w-3 h-3 text-red-600" />,
    neutral: null
  };

  return (
    <Card className="bg-white border-slate-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
            {icon}
          </div>
          {trend && trendIcons[trend]}
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-bold mb-1">{value}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );
}
