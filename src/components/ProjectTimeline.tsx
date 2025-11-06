import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download
} from 'lucide-react';
import { Task, PRIORITY_COLORS } from '../types/task';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isWithinInterval } from 'date-fns';

interface ProjectTimelineProps {
  tasks: Task[];
  projectStart: string;
  projectEnd?: string;
  onTaskClick?: (task: Task) => void;
}

type ViewMode = 'day' | 'week' | 'month';

export default function ProjectTimeline({ 
  tasks, 
  projectStart, 
  projectEnd,
  onTaskClick 
}: ProjectTimelineProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (filterStatus === 'all') return true;
      return task.status === filterStatus;
    });
  }, [tasks, filterStatus]);

  // Calculate timeline range
  const timelineRange = useMemo(() => {
    const start = startOfWeek(currentDate);
    const end = endOfWeek(currentDate);
    
    if (viewMode === 'month') {
      return {
        start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
        end: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      };
    }
    
    return { start, end };
  }, [currentDate, viewMode]);

  const days = eachDayOfInterval(timelineRange);

  // Get task position and width
  const getTaskStyle = (task: Task) => {
    const taskStart = task.startedAt ? new Date(task.startedAt) : new Date(task.createdAt);
    const taskEnd = task.completedAt 
      ? new Date(task.completedAt)
      : task.dueDate
      ? new Date(task.dueDate)
      : addDays(taskStart, task.estimatedHours ? Math.ceil(task.estimatedHours / 8) : 3);

    // Calculate position and width as percentage
    const totalDays = days.length;
    const rangeStart = timelineRange.start.getTime();
    const rangeEnd = timelineRange.end.getTime();
    const rangeDuration = rangeEnd - rangeStart;

    const taskStartTime = taskStart.getTime();
    const taskEndTime = taskEnd.getTime();

    // Calculate left position
    const leftPercent = Math.max(0, ((taskStartTime - rangeStart) / rangeDuration) * 100);
    
    // Calculate width
    const taskDuration = taskEndTime - taskStartTime;
    const widthPercent = Math.min(100 - leftPercent, (taskDuration / rangeDuration) * 100);

    return {
      left: `${leftPercent}%`,
      width: `${Math.max(2, widthPercent)}%`,
      isVisible: taskStartTime <= rangeEnd && taskEndTime >= rangeStart
    };
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    if (viewMode === 'week') {
      setCurrentDate(prev => addDays(prev, direction === 'next' ? 7 : -7));
    } else if (viewMode === 'month') {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + (direction === 'next' ? 1 : -1), 1));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const exportTimeline = () => {
    // Simple export to JSON
    const data = {
      project: {
        start: projectStart,
        end: projectEnd
      },
      tasks: filteredTasks.map(t => ({
        title: t.title,
        start: t.startedAt || t.createdAt,
        end: t.completedAt || t.dueDate,
        status: t.status,
        priority: t.priority
      }))
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timeline-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Project Timeline
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tasks</SelectItem>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-1 border rounded-lg p-1">
                <Button
                  variant={viewMode === 'week' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('week')}
                >
                  Week
                </Button>
                <Button
                  variant={viewMode === 'month' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('month')}
                >
                  Month
                </Button>
              </div>

              <Button variant="outline" size="sm" onClick={exportTimeline}>
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Timeline */}
      <Card>
        <CardContent className="p-6">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="font-semibold">
              {viewMode === 'month' 
                ? format(currentDate, 'MMMM yyyy')
                : `${format(timelineRange.start, 'MMM d')} - ${format(timelineRange.end, 'MMM d, yyyy')}`
              }
            </div>

            <Badge variant="secondary">
              {filteredTasks.length} tasks
            </Badge>
          </div>

          {/* Timeline Grid */}
          <div className="relative">
            {/* Date Headers */}
            <div className="flex border-b pb-2 mb-4">
              {days.map((day, index) => {
                const isToday = isSameDay(day, new Date());
                return (
                  <div
                    key={index}
                    className={`flex-1 text-center ${
                      isToday ? 'text-blue-600 font-semibold' : 'text-muted-foreground'
                    }`}
                  >
                    <div className="text-xs uppercase">
                      {format(day, 'EEE')}
                    </div>
                    <div className={`text-sm ${isToday ? 'w-6 h-6 bg-blue-600 text-white rounded-full mx-auto flex items-center justify-center' : ''}`}>
                      {format(day, 'd')}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tasks */}
            <div className="space-y-2 min-h-[400px]">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No tasks to display in this time range</p>
                </div>
              ) : (
                filteredTasks.map((task, index) => {
                  const style = getTaskStyle(task);
                  if (!style.isVisible) return null;

                  return (
                    <div key={task.id} className="relative h-12 group">
                      {/* Background grid */}
                      <div className="absolute inset-0 flex">
                        {days.map((_, i) => (
                          <div key={i} className="flex-1 border-r last:border-r-0 border-slate-100" />
                        ))}
                      </div>

                      {/* Task Bar */}
                      <div
                        className={`absolute top-1 h-10 rounded-lg cursor-pointer transition-all hover:shadow-lg hover:z-10 ${
                          PRIORITY_COLORS[task.priority]
                        } ${
                          task.status === 'completed' ? 'opacity-60' : ''
                        }`}
                        style={{
                          left: style.left,
                          width: style.width
                        }}
                        onClick={() => onTaskClick?.(task)}
                      >
                        <div className="h-full px-3 py-2 flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {task.title}
                            </p>
                            {task.estimatedHours && (
                              <p className="text-xs opacity-75">
                                {task.estimatedHours}h
                              </p>
                            )}
                          </div>
                          
                          {task.status === 'completed' && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              ✓
                            </Badge>
                          )}
                        </div>

                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-20">
                          <div className="bg-slate-900 text-white text-xs rounded-lg p-3 shadow-xl whitespace-nowrap">
                            <p className="font-semibold mb-1">{task.title}</p>
                            <p className="text-slate-300">
                              {task.startedAt 
                                ? format(new Date(task.startedAt), 'MMM d, yyyy')
                                : format(new Date(task.createdAt), 'MMM d, yyyy')}
                              {' → '}
                              {task.completedAt || task.dueDate
                                ? format(new Date(task.completedAt || task.dueDate || ''), 'MMM d, yyyy')
                                : 'Ongoing'}
                            </p>
                            <Badge 
                              variant="outline" 
                              className={`mt-1 ${PRIORITY_COLORS[task.priority]}`}
                            >
                              {task.priority}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Today Indicator */}
            {days.some(day => isSameDay(day, new Date())) && (
              <div className="absolute top-0 bottom-0 w-0.5 bg-blue-600 pointer-events-none"
                style={{
                  left: `${((new Date().getHours() / 24 + days.findIndex(day => isSameDay(day, new Date()))) / days.length) * 100}%`
                }}
              >
                <div className="w-3 h-3 bg-blue-600 rounded-full -ml-[5px] -mt-1" />
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">Priority:</span>
            <div className="flex gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-red-100 border border-red-200" />
                <span>High</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-200" />
                <span>Medium</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-green-100 border border-green-200" />
                <span>Low</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
