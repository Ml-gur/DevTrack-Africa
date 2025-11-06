/**
 * Enhanced Analytics Dashboard - Production-Ready Analytics with Advanced Insights
 * Combines real-time calculations, beautiful visualizations, and actionable insights
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { ScrollArea } from './ui/scroll-area';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select';
import { LocalProject, LocalTask } from '../utils/local-storage-database';
import {
  BarChart3,
  Clock,
  Target,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Calendar,
  FolderOpen,
  Zap,
  AlertCircle,
  Award,
  Activity,
  Flame,
  Trophy,
  Lightbulb,
  Coffee,
  Timer,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Brain,
  Rocket,
  Star,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus
} from 'lucide-react';
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
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  format, 
  differenceInDays, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  subDays,
  subWeeks,
  subMonths,
  startOfDay,
  parseISO
} from 'date-fns';

interface EnhancedAnalyticsDashboardProps {
  projects: LocalProject[];
  tasks: LocalTask[];
  userId: string;
}

type TimeFilter = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all';
type MetricTrend = 'up' | 'down' | 'neutral';

interface ProductivityInsight {
  id: string;
  type: 'achievement' | 'warning' | 'suggestion' | 'milestone';
  title: string;
  description: string;
  icon: React.ReactNode;
  priority: 'high' | 'medium' | 'low';
  actionable?: boolean;
  actionText?: string;
}

interface AnalyticsMetrics {
  // Task Metrics
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  overdueTasks: number;
  completionRate: number;
  
  // Time Metrics
  totalTimeSpent: number;
  avgTimePerTask: number;
  avgTimePerProject: number;
  
  // Project Metrics
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  projectCompletionRate: number;
  
  // Productivity Metrics
  productivityScore: number;
  streakDays: number;
  tasksPerDay: number;
  
  // Trends
  tasksTrend: MetricTrend;
  timeTrend: MetricTrend;
  productivityTrend: MetricTrend;
  
  // Peak Performance
  mostProductiveDay: string;
  mostProductiveHour: number;
  peakProductivityWeek: string;
}

const COLORS = {
  primary: '#3b82f6',
  success: '#10b981', 
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  teal: '#14b8a6',
  pink: '#ec4899',
  indigo: '#6366f1',
  emerald: '#059669'
};

const CHART_COLORS = [
  COLORS.primary,
  COLORS.success,
  COLORS.warning,
  COLORS.danger,
  COLORS.purple,
  COLORS.teal
];

export default function EnhancedAnalyticsDashboard({
  projects,
  tasks,
  userId
}: EnhancedAnalyticsDashboardProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');
  const [selectedTab, setSelectedTab] = useState('overview');

  // Calculate date range based on filter
  const dateRange = useMemo(() => {
    const now = new Date();
    let start: Date;
    
    switch (timeFilter) {
      case 'today':
        start = startOfDay(now);
        break;
      case 'week':
        start = startOfWeek(now);
        break;
      case 'month':
        start = startOfMonth(now);
        break;
      case 'quarter':
        start = subMonths(now, 3);
        break;
      case 'year':
        start = subMonths(now, 12);
        break;
      case 'all':
        start = new Date(2020, 0, 1);
        break;
      default:
        start = startOfMonth(now);
    }
    
    return { start, end: now };
  }, [timeFilter]);

  // Filter tasks and projects by date range
  const filteredData = useMemo(() => {
    const taskInRange = (task: LocalTask) => {
      const taskDate = task.updated_at ? parseISO(task.updated_at) : parseISO(task.created_at);
      return isWithinInterval(taskDate, dateRange);
    };

    const projectInRange = (project: LocalProject) => {
      const projectDate = project.updated_at ? parseISO(project.updated_at) : parseISO(project.created_at);
      return isWithinInterval(projectDate, dateRange);
    };

    return {
      tasks: tasks.filter(taskInRange),
      projects: projects.filter(projectInRange)
    };
  }, [tasks, projects, dateRange]);

  // Calculate comprehensive metrics
  const metrics: AnalyticsMetrics = useMemo(() => {
    const { tasks: filteredTasks, projects: filteredProjects } = filteredData;
    const now = new Date();
    
    // Task metrics
    const totalTasks = filteredTasks.length;
    const completedTasks = filteredTasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = filteredTasks.filter(t => t.status === 'in_progress').length;
    const todoTasks = filteredTasks.filter(t => t.status === 'todo').length;
    
    // Overdue tasks
    const overdueTasks = filteredTasks.filter(t => {
      if (t.status === 'completed' || !t.dueDate) return false;
      try {
        const dueDate = parseISO(t.dueDate);
        return dueDate < now;
      } catch {
        return false;
      }
    }).length;
    
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    // Time metrics
    const totalTimeSpent = filteredTasks.reduce((sum, task) => sum + (task.timeSpentMinutes || 0), 0);
    const avgTimePerTask = completedTasks > 0 ? totalTimeSpent / completedTasks : 0;
    
    // Project metrics
    const totalProjects = filteredProjects.length;
    const activeProjects = filteredProjects.filter(p => 
      p.status === 'active' || p.status === 'in_progress'
    ).length;
    const completedProjectsArray = filteredProjects.filter(p => p.status === 'completed');
    const completedProjects = completedProjectsArray.length;
    const projectCompletionRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;
    
    const avgTimePerProject = completedProjectsArray.length > 0 
      ? completedProjectsArray.reduce((sum, project) => {
          const projectTasks = tasks.filter(t => t.projectId === project.id);
          const projectTime = projectTasks.reduce((s, t) => s + (t.timeSpentMinutes || 0), 0);
          return sum + projectTime;
        }, 0) / completedProjectsArray.length
      : 0;
    
    // Productivity metrics
    const daysInRange = differenceInDays(dateRange.end, dateRange.start) || 1;
    const tasksPerDay = completedTasks / daysInRange;
    
    // Productivity score (0-100)
    const targetTasksPerDay = 3;
    const taskCompletionScore = Math.min(50, (tasksPerDay / targetTasksPerDay) * 50);
    const completionRateScore = completionRate * 0.5;
    const productivityScore = Math.round(taskCompletionScore + completionRateScore);
    
    // Calculate streak (consecutive days with completed tasks)
    let streakDays = 0;
    let currentDate = new Date(now);
    
    for (let i = 0; i < 365; i++) {
      const hasTasksOnDay = filteredTasks.some(t => {
        if (t.status !== 'completed') return false;
        try {
          const completedDate = t.completedAt ? parseISO(t.completedAt) : parseISO(t.updated_at);
          return format(completedDate, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd');
        } catch {
          return false;
        }
      });
      
      if (hasTasksOnDay) {
        streakDays++;
        currentDate = subDays(currentDate, 1);
      } else {
        break;
      }
    }
    
    // Find most productive day of week
    const dayTaskCount: Record<string, number> = {};
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    filteredTasks.forEach(task => {
      if (task.status === 'completed') {
        try {
          const date = parseISO(task.updated_at);
          const dayName = dayNames[date.getDay()];
          dayTaskCount[dayName] = (dayTaskCount[dayName] || 0) + 1;
        } catch {}
      }
    });
    
    const mostProductiveDay = Object.entries(dayTaskCount).reduce((max, [day, count]) => 
      count > (dayTaskCount[max] || 0) ? day : max, 'Monday'
    );
    
    // Calculate trends (compare with previous period)
    const previousPeriodStart = subDays(dateRange.start, daysInRange);
    const previousTasks = tasks.filter(t => {
      try {
        const taskDate = t.updated_at ? parseISO(t.updated_at) : parseISO(t.created_at);
        return isWithinInterval(taskDate, { start: previousPeriodStart, end: dateRange.start });
      } catch {
        return false;
      }
    });
    
    const previousCompleted = previousTasks.filter(t => t.status === 'completed').length;
    const tasksTrend: MetricTrend = 
      completedTasks > previousCompleted ? 'up' : 
      completedTasks < previousCompleted ? 'down' : 'neutral';
    
    const previousTime = previousTasks.reduce((sum, t) => sum + (t.timeSpentMinutes || 0), 0);
    const timeTrend: MetricTrend = 
      totalTimeSpent > previousTime ? 'up' : 
      totalTimeSpent < previousTime ? 'down' : 'neutral';
    
    const previousProductivity = previousCompleted > 0 
      ? ((previousCompleted / previousTasks.length) * 50 + (previousCompleted / daysInRange / targetTasksPerDay) * 50)
      : 0;
    const productivityTrend: MetricTrend = 
      productivityScore > previousProductivity ? 'up' : 
      productivityScore < previousProductivity ? 'down' : 'neutral';
    
    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      overdueTasks,
      completionRate,
      totalTimeSpent,
      avgTimePerTask,
      avgTimePerProject,
      totalProjects,
      activeProjects,
      completedProjects,
      projectCompletionRate,
      productivityScore,
      streakDays,
      tasksPerDay,
      tasksTrend,
      timeTrend,
      productivityTrend,
      mostProductiveDay,
      mostProductiveHour: 14, // Default to 2 PM
      peakProductivityWeek: format(now, 'MMM d, yyyy')
    };
  }, [filteredData, tasks, dateRange]);

  // Generate AI insights
  const insights: ProductivityInsight[] = useMemo(() => {
    const generated: ProductivityInsight[] = [];
    
    // Achievements
    if (metrics.streakDays >= 7) {
      generated.push({
        id: 'streak-achievement',
        type: 'achievement',
        title: '🔥 Amazing Streak!',
        description: `You've maintained a ${metrics.streakDays}-day productivity streak. Keep the momentum going!`,
        icon: <Flame className="w-5 h-5 text-orange-600" />,
        priority: 'high'
      });
    }
    
    if (metrics.completedTasks >= 50) {
      generated.push({
        id: 'task-master',
        type: 'milestone',
        title: '🏆 Task Master',
        description: `You've completed ${metrics.completedTasks} tasks! You're crushing your goals.`,
        icon: <Trophy className="w-5 h-5 text-yellow-600" />,
        priority: 'high'
      });
    }
    
    if (metrics.productivityScore >= 85) {
      generated.push({
        id: 'high-productivity',
        type: 'achievement',
        title: '⭐ Peak Performance',
        description: `Your productivity score is ${Math.round(metrics.productivityScore)}%. Excellent work!`,
        icon: <Star className="w-5 h-5 text-yellow-500" />,
        priority: 'high'
      });
    }
    
    // Warnings
    if (metrics.overdueTasks > 5) {
      generated.push({
        id: 'overdue-warning',
        type: 'warning',
        title: '⚠️ Overdue Tasks',
        description: `You have ${metrics.overdueTasks} overdue tasks. Consider reorganizing priorities.`,
        icon: <AlertCircle className="w-5 h-5 text-red-600" />,
        priority: 'high',
        actionable: true,
        actionText: 'Review Tasks'
      });
    }
    
    if (metrics.inProgressTasks > metrics.completedTasks * 2) {
      generated.push({
        id: 'too-many-wip',
        type: 'warning',
        title: '📊 Too Many WIP',
        description: `You have ${metrics.inProgressTasks} tasks in progress. Focus on completing before starting new ones.`,
        icon: <Activity className="w-5 h-5 text-orange-600" />,
        priority: 'medium',
        actionable: true,
        actionText: 'Prioritize'
      });
    }
    
    // Suggestions
    if (metrics.avgTimePerTask > 180) {
      generated.push({
        id: 'break-down-tasks',
        type: 'suggestion',
        title: '💡 Break Down Tasks',
        description: `Average task time is ${formatTime(metrics.avgTimePerTask)}. Consider splitting large tasks into smaller ones.`,
        icon: <Lightbulb className="w-5 h-5 text-blue-600" />,
        priority: 'medium',
        actionable: true,
        actionText: 'Learn More'
      });
    }
    
    if (metrics.mostProductiveDay && metrics.completedTasks > 10) {
      generated.push({
        id: 'productive-day',
        type: 'suggestion',
        title: '📅 Peak Day Pattern',
        description: `${metrics.mostProductiveDay} is your most productive day. Schedule important tasks then!`,
        icon: <Calendar className="w-5 h-5 text-purple-600" />,
        priority: 'low',
        actionable: true,
        actionText: 'Set Schedule'
      });
    }
    
    if (metrics.completionRate < 30 && metrics.totalTasks > 10) {
      generated.push({
        id: 'low-completion',
        type: 'suggestion',
        title: '🎯 Improve Focus',
        description: `Task completion rate is ${Math.round(metrics.completionRate)}%. Try the Eisenhower Matrix for better prioritization.`,
        icon: <Target className="w-5 h-5 text-indigo-600" />,
        priority: 'medium',
        actionable: true,
        actionText: 'Get Tips'
      });
    }
    
    return generated.slice(0, 6);
  }, [metrics]);

  // Chart data
  const dailyData = useMemo(() => {
    const days: Record<string, { tasks: number; time: number; completed: number }> = {};
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const key = format(date, 'yyyy-MM-dd');
      days[key] = { tasks: 0, time: 0, completed: 0 };
    }
    
    // Populate with task data
    filteredData.tasks.forEach(task => {
      try {
        const date = task.updated_at ? parseISO(task.updated_at) : parseISO(task.created_at);
        const key = format(date, 'yyyy-MM-dd');
        if (days[key]) {
          days[key].tasks++;
          days[key].time += task.timeSpentMinutes || 0;
          if (task.status === 'completed') days[key].completed++;
        }
      } catch {}
    });
    
    return Object.entries(days).map(([date, data]) => ({
      day: dayNames[new Date(date).getDay()],
      date,
      tasks: data.tasks,
      completed: data.completed,
      time: data.time
    }));
  }, [filteredData.tasks]);

  const statusData = useMemo(() => [
    { name: 'Completed', value: metrics.completedTasks, color: COLORS.success },
    { name: 'In Progress', value: metrics.inProgressTasks, color: COLORS.primary },
    { name: 'To Do', value: metrics.todoTasks, color: COLORS.warning },
    { name: 'Overdue', value: metrics.overdueTasks, color: COLORS.danger }
  ].filter(item => item.value > 0), [metrics]);

  const priorityData = useMemo(() => {
    const high = filteredData.tasks.filter(t => t.priority === 'high');
    const medium = filteredData.tasks.filter(t => t.priority === 'medium');
    const low = filteredData.tasks.filter(t => t.priority === 'low');
    
    return [
      { name: 'High', tasks: high.length, time: high.reduce((s, t) => s + (t.timeSpentMinutes || 0), 0), color: COLORS.danger },
      { name: 'Medium', tasks: medium.length, time: medium.reduce((s, t) => s + (t.timeSpentMinutes || 0), 0), color: COLORS.warning },
      { name: 'Low', tasks: low.length, time: low.reduce((s, t) => s + (t.timeSpentMinutes || 0), 0), color: COLORS.success }
    ].filter(item => item.tasks > 0);
  }, [filteredData.tasks]);

  const projectPerformanceData = useMemo(() => {
    return filteredData.projects.map(project => {
      const projectTasks = tasks.filter(t => t.projectId === project.id);
      const completed = projectTasks.filter(t => t.status === 'completed').length;
      const total = projectTasks.length;
      const timeSpent = projectTasks.reduce((sum, t) => sum + (t.timeSpentMinutes || 0), 0);
      
      return {
        name: project.title.substring(0, 20),
        completion: total > 0 ? (completed / total) * 100 : 0,
        tasks: total,
        time: timeSpent
      };
    }).slice(0, 10);
  }, [filteredData.projects, tasks]);

  // Format helpers
  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours < 24) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  };

  const getTrendIcon = (trend: MetricTrend) => {
    if (trend === 'up') return <ArrowUp className="w-4 h-4 text-green-600" />;
    if (trend === 'down') return <ArrowDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getTrendColor = (trend: MetricTrend) => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-500';
  };

  const getProductivityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getProductivityBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50';
    if (score >= 60) return 'bg-yellow-50';
    if (score >= 40) return 'bg-orange-50';
    return 'bg-red-50';
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered insights and performance metrics
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={timeFilter} onValueChange={(value: TimeFilter) => setTimeFilter(value)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">Last 3 Months</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Productivity Score */}
        <Card className={`${getProductivityBgColor(metrics.productivityScore)} border-0 shadow-sm hover:shadow-md transition-shadow`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
                  <Rocket className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Productivity</p>
                  <p className={`text-2xl font-bold ${getProductivityColor(metrics.productivityScore)}`}>
                    {Math.round(metrics.productivityScore)}%
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="gap-1">
                {getTrendIcon(metrics.productivityTrend)}
                {metrics.productivityTrend}
              </Badge>
            </div>
            <Progress value={metrics.productivityScore} className="h-2" />
            <p className="text-xs text-gray-600 mt-2">
              {metrics.productivityScore >= 80 ? 'Excellent performance!' : 
               metrics.productivityScore >= 60 ? 'Good progress' : 
               'Room for improvement'}
            </p>
          </CardContent>
        </Card>

        {/* Tasks Completed */}
        <Card className="bg-green-50 border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {metrics.completedTasks}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="gap-1">
                {getTrendIcon(metrics.tasksTrend)}
                {Math.round(metrics.completionRate)}%
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">of {metrics.totalTasks} total</span>
              <span className="font-medium text-green-600">
                {metrics.tasksPerDay.toFixed(1)}/day
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Time Tracking */}
        <Card className="bg-purple-50 border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Time Spent</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatTime(metrics.totalTimeSpent)}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="gap-1">
                {getTrendIcon(metrics.timeTrend)}
                time
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Avg per task</span>
              <span className="font-medium text-purple-600">
                {formatTime(metrics.avgTimePerTask)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Active Projects */}
        <Card className="bg-blue-50 border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
                  <FolderOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Projects</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {metrics.activeProjects}
                  </p>
                </div>
              </div>
              <Badge variant="outline">
                {metrics.completedProjects} done
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Total projects</span>
              <span className="font-medium text-blue-600">
                {metrics.totalProjects}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Streak & Special Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center">
                <Flame className="w-7 h-7 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Current Streak</p>
                <p className="text-3xl font-bold text-orange-600">{metrics.streakDays}</p>
                <p className="text-xs text-gray-500">consecutive days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center">
                <Calendar className="w-7 h-7 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Peak Day</p>
                <p className="text-2xl font-bold text-blue-600">{metrics.mostProductiveDay}</p>
                <p className="text-xs text-gray-500">most productive</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center">
                <AlertCircle className="w-7 h-7 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Overdue Tasks</p>
                <p className="text-3xl font-bold text-red-600">{metrics.overdueTasks}</p>
                <p className="text-xs text-gray-500">need attention</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-blue-50/50 to-purple-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              AI-Powered Insights
              <Badge variant="secondary" className="ml-2">
                {insights.length} insights
              </Badge>
            </CardTitle>
            <CardDescription>
              Smart recommendations to boost your productivity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.map(insight => (
                <div 
                  key={insight.id}
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                    insight.type === 'achievement' ? 'bg-green-50 border-green-200 hover:border-green-300' :
                    insight.type === 'warning' ? 'bg-red-50 border-red-200 hover:border-red-300' :
                    insight.type === 'suggestion' ? 'bg-blue-50 border-blue-200 hover:border-blue-300' :
                    'bg-purple-50 border-purple-200 hover:border-purple-300'
                  }`}
                >
                  <div className={`p-2.5 rounded-lg ${
                    insight.type === 'achievement' ? 'bg-green-100' :
                    insight.type === 'warning' ? 'bg-red-100' :
                    insight.type === 'suggestion' ? 'bg-blue-100' :
                    'bg-purple-100'
                  }`}>
                    {insight.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold mb-1">{insight.title}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {insight.description}
                    </p>
                    {insight.actionable && (
                      <Button variant="outline" size="sm" className="mt-3 h-8 text-xs">
                        {insight.actionText}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Section */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="trends">
            <LineChartIcon className="w-4 h-4 mr-2" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="distribution">
            <PieChartIcon className="w-4 h-4 mr-2" />
            Distribution
          </TabsTrigger>
          <TabsTrigger value="projects">
            <FolderOpen className="w-4 h-4 mr-2" />
            Projects
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Daily Activity
                </CardTitle>
                <CardDescription>Tasks and time tracked over the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dailyData}>
                    <defs>
                      <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="day" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value: any, name) => [
                        name === 'time' ? formatTime(Number(value)) : value,
                        name === 'completed' ? 'Completed' : name === 'tasks' ? 'Total Tasks' : 'Time'
                      ]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="completed" 
                      stroke={COLORS.success} 
                      fill="url(#colorTasks)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Task Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Task Status Distribution
                </CardTitle>
                <CardDescription>Current state of all tasks</CardDescription>
              </CardHeader>
              <CardContent>
                {statusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    <Coffee className="w-12 h-12 opacity-20 mb-2" />
                    <p>No task data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Weekly Progress Trend
              </CardTitle>
              <CardDescription>Completion rate and time investment</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                    formatter={(value: any, name) => [
                      name === 'time' ? formatTime(Number(value)) : value,
                      name === 'completed' ? 'Completed Tasks' : name === 'tasks' ? 'Total Tasks' : 'Time Spent'
                    ]}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="completed" 
                    stroke={COLORS.success} 
                    strokeWidth={3}
                    dot={{ r: 5 }}
                    name="Completed Tasks"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="tasks" 
                    stroke={COLORS.primary} 
                    strokeWidth={3}
                    dot={{ r: 5 }}
                    name="Total Tasks"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Distribution Tab */}
        <TabsContent value="distribution" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Priority Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Priority Distribution
                </CardTitle>
                <CardDescription>Tasks and time by priority level</CardDescription>
              </CardHeader>
              <CardContent>
                {priorityData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={priorityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip 
                        formatter={(value: any, name) => [
                          name === 'time' ? formatTime(Number(value)) : value,
                          name === 'tasks' ? 'Tasks' : 'Time'
                        ]}
                      />
                      <Legend />
                      <Bar dataKey="tasks" fill={COLORS.primary} radius={[8, 8, 0, 0]} />
                      <Bar dataKey="time" fill={COLORS.purple} radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground">
                    <Coffee className="w-12 h-12 opacity-20 mb-2" />
                    <p>No priority data</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Priority Breakdown Cards */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Priority Breakdown</h3>
              {priorityData.map((item, index) => (
                <Card key={item.name} className="border-l-4" style={{ borderLeftColor: item.color }}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-semibold">{item.name} Priority</span>
                      </div>
                      <Badge variant="outline">{item.tasks} tasks</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Total Time</p>
                        <p className="text-lg font-bold" style={{ color: item.color }}>
                          {formatTime(item.time)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Avg Time</p>
                        <p className="text-lg font-bold" style={{ color: item.color }}>
                          {formatTime(item.tasks > 0 ? item.time / item.tasks : 0)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-6">
          {projectPerformanceData.length > 0 ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart className="w-5 h-5" />
                    Project Completion Rates
                  </CardTitle>
                  <CardDescription>Performance across all active projects</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={projectPerformanceData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis type="number" domain={[0, 100]} stroke="#6b7280" />
                      <YAxis type="category" dataKey="name" stroke="#6b7280" width={150} />
                      <Tooltip 
                        formatter={(value: any, name) => [
                          `${Number(value).toFixed(1)}%`,
                          'Completion'
                        ]}
                      />
                      <Bar dataKey="completion" fill={COLORS.success} radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projectPerformanceData.map((project, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-1 truncate">{project.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Target className="w-4 h-4" />
                            {project.tasks} tasks
                            <Clock className="w-4 h-4 ml-2" />
                            {formatTime(project.time)}
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Completion</span>
                            <span className="font-semibold">{project.completion.toFixed(0)}%</span>
                          </div>
                          <Progress value={project.completion} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Projects Yet</h3>
                <p className="text-gray-500 mb-4">
                  Create your first project to see detailed analytics here.
                </p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Project
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Summary Card */}
      {metrics.totalTasks > 0 && (
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center flex-shrink-0">
                <Award className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2 text-gray-900">Performance Summary</h3>
                <p className="text-gray-700 leading-relaxed">
                  During this period, you've completed <strong>{metrics.completedTasks}</strong> tasks 
                  out of <strong>{metrics.totalTasks}</strong> total, achieving a <strong>{Math.round(metrics.completionRate)}%</strong> completion rate. 
                  You've invested <strong>{formatTime(metrics.totalTimeSpent)}</strong> of focused work 
                  with an average of <strong>{formatTime(metrics.avgTimePerTask)}</strong> per task.
                  {metrics.streakDays > 0 && (
                    <> You're on a <strong className="text-orange-600">{metrics.streakDays}-day streak</strong> 🔥</>
                  )}
                  {metrics.mostProductiveDay && (
                    <> Your most productive day is <strong className="text-blue-600">{metrics.mostProductiveDay}</strong>.</>
                  )}
                  {metrics.overdueTasks > 0 && (
                    <> Focus on clearing <strong className="text-red-600">{metrics.overdueTasks} overdue task{metrics.overdueTasks > 1 ? 's' : ''}</strong> for better productivity.</>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
