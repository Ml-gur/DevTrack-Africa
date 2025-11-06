import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Checkbox } from './ui/checkbox';
import { Plus, Clock, AlertCircle, Keyboard, Info, CheckSquare } from 'lucide-react';
import { Task, TaskStatus, TaskProgress, STATUS_ICONS, STATUS_LABELS } from '../types/task';
import TaskCard from './TaskCard';
import AddTaskModal from './AddTaskModal';
import TaskDetailModal from './TaskDetailModal';
import TaskFiltersComponent, { TaskFilters } from './TaskFilters';
import FilterPresets from './FilterPresets';
import BulkActionsToolbar from './BulkActionsToolbar';
import { useTaskFilters } from './hooks/useTaskFilters';
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation';
import { useBulkOperations } from './hooks/useBulkOperations';

interface KanbanBoardProps {
  projectId: string;
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onTaskCreate: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onTaskDelete: (taskId: string) => Promise<void>;
  onTaskTimeUpdate: (taskId: string, minutes: number) => Promise<void>;
}

const COLUMNS: { id: TaskStatus; title: string; icon: string }[] = [
  { id: 'todo', title: STATUS_LABELS.todo, icon: STATUS_ICONS.todo },
  { id: 'in_progress', title: STATUS_LABELS.in_progress, icon: STATUS_ICONS.in_progress },
  { id: 'completed', title: STATUS_LABELS.completed, icon: STATUS_ICONS.completed }
];

// WIP (Work In Progress) Limit - maximum 3 tasks ONLY for "In Progress" column
const WIP_LIMIT = 3;
const WIP_COLUMN = 'in_progress'; // Only apply limit to In Progress column

// Status-based color schemes for task cards - these change when tasks move between columns
const STATUS_COLORS = {
  todo: 'border-l-4 border-l-gray-500 bg-white',
  in_progress: 'border-l-4 border-l-blue-500 bg-blue-50/30',
  completed: 'border-l-4 border-l-green-500 bg-green-50/30'
};

const defaultFilters: TaskFilters = {
  search: '',
  priority: 'all',
  status: 'all',
  sortBy: 'created',
  sortOrder: 'desc'
};

// Enhanced draggable task wrapper with selection support
interface DraggableTaskCardProps {
  task: Task;
  onTaskClick: () => void;
  isTimerActive?: boolean;
  onStartTimer: () => void;
  onStopTimer: () => void;
  isDragging?: boolean;
  isFocused?: boolean;
  isKeyboardMode?: boolean;
  isSelected?: boolean;
  isSelectionMode?: boolean;
  onSelectionToggle: () => void;
  timerStartTime?: number;
  statusColor?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}

const DraggableTaskCard = React.memo(React.forwardRef<HTMLDivElement, DraggableTaskCardProps>(({ 
  task, 
  onTaskClick, 
  isTimerActive, 
  onStartTimer, 
  onStopTimer, 
  isDragging, 
  isFocused, 
  isKeyboardMode, 
  isSelected,
  isSelectionMode,
  onSelectionToggle,
  timerStartTime,
  statusColor,
  style, 
  ...props 
}, ref) => {
  // Set default values in component body instead of parameter destructuring
  const safeIsTimerActive = isTimerActive ?? false;
  const safeIsDragging = isDragging ?? false;
  const safeIsFocused = isFocused ?? false;
  const safeIsKeyboardMode = isKeyboardMode ?? false;
  const safeIsSelected = isSelected ?? false;
  const safeIsSelectionMode = isSelectionMode ?? false;

  return (
    <div 
      ref={ref} 
      style={style} 
      {...props}
      className={`relative ${safeIsFocused && safeIsKeyboardMode ? 'ring-2 ring-primary ring-offset-2' : ''} ${
        safeIsSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''
      }`}
    >
      {safeIsSelectionMode && (
        <div className="absolute top-2 left-2 z-10">
          <Checkbox
            checked={safeIsSelected}
            onCheckedChange={onSelectionToggle}
            className="bg-white shadow-md"
          />
        </div>
      )}
      
      <div 
        className={`${safeIsSelectionMode ? 'ml-8' : ''} transition-all duration-200`}
        onClick={safeIsSelectionMode ? onSelectionToggle : onTaskClick}
      >
        <TaskCard
          task={task}
          onTaskClick={safeIsSelectionMode ? onSelectionToggle : onTaskClick}
          isTimerActive={safeIsTimerActive}
          onStartTimer={onStartTimer}
          onStopTimer={onStopTimer}
          isDragging={safeIsDragging}
          timerStartTime={timerStartTime}
          statusColor={statusColor}
        />
      </div>
    </div>
  );
}));

DraggableTaskCard.displayName = 'DraggableTaskCard';

interface DroppableColumnProps {
  column: { id: TaskStatus; title: string; icon: string };
  tasks?: Task[];
  isKeyboardMode?: boolean;
  focusedColumn?: string | null;
  bulkOps: any;
  isClient?: boolean;
  hasFilters?: boolean;
  defaultFilters: TaskFilters;
  setFilters: (filters: TaskFilters) => void;
  setShowAddTask: (show: boolean) => void;
  formatTime: (minutes: number) => string;
  activeTimers?: Record<string, any>;
  startTimer: (taskId: string) => void;
  stopTimer: (taskId: string) => void;
  setSelectedTask: (task: Task) => void;
  focusedTaskId?: string | null;
  wipLimit?: number;
}

const DroppableColumn = React.memo(function DroppableColumn(props: DroppableColumnProps) {
  // Destructure props in function body with default values
  const {
    column,
    tasks = [],
    isKeyboardMode = false,
    focusedColumn = null,
    bulkOps,
    isClient = false,
    hasFilters = false,
    defaultFilters,
    setFilters,
    setShowAddTask,
    formatTime,
    activeTimers = {},
    startTimer,
    stopTimer,
    setSelectedTask,
    focusedTaskId = null,
    wipLimit = WIP_LIMIT
  } = props;

  // Calculate WIP limit status - ONLY for In Progress column
  const isWipColumn = column.id === 'in_progress';
  const isAtLimit = isWipColumn && tasks.length >= wipLimit;
  const isNearLimit = isWipColumn && tasks.length >= wipLimit - 1;
  const limitColor = isAtLimit ? 'text-red-600' : isNearLimit ? 'text-orange-600' : 'text-muted-foreground';

  if (!isClient) {
    return (
      <Card className="h-fit">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>{column.icon}</span>
              <span>{column.title}</span>
              <Badge variant="secondary" className="ml-2">
                {tasks.length}/{wipLimit}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 min-h-[200px]">
          <div className="text-center py-8 text-muted-foreground">
            <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-lg">⏳</span>
            </div>
            <p className="text-sm">Loading board...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`h-fit ${
      isKeyboardMode && focusedColumn === column.id && !bulkOps.isSelectionMode ? 'ring-2 ring-primary/50' : ''
    } ${isAtLimit ? 'ring-2 ring-red-300' : ''}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {bulkOps.isSelectionMode && (
              <Checkbox
                checked={tasks.every(task => 
                  bulkOps.selectedTaskIds.has(task.id)
                ) && tasks.length > 0}
                onCheckedChange={(checked) => {
                  if (checked) {
                    tasks.forEach(task => 
                      bulkOps.selectTask(task.id)
                    );
                  } else {
                    tasks.forEach(task => 
                      bulkOps.unselectTask(task.id)
                    );
                  }
                }}
                className="mr-1"
              />
            )}
            
            <span>{column.icon}</span>
            <span>{column.title}</span>
            {isWipColumn && (
              <>
                <Badge 
                  variant={isAtLimit ? 'destructive' : isNearLimit ? 'default' : 'secondary'} 
                  className="ml-2"
                >
                  <span className={limitColor}>
                    {tasks.length}/{wipLimit}
                  </span>
                </Badge>
                {isAtLimit && (
                  <Badge variant="destructive" className="ml-1 text-xs">
                    FULL
                  </Badge>
                )}
              </>
            )}
            {!isWipColumn && (
              <Badge variant="outline" className="ml-2">
                {tasks.length}
              </Badge>
            )}
          </div>
          
          {column.id === 'todo' && (
            <Button
              size="sm"
              onClick={() => setShowAddTask(true)}
              className="h-8 w-8 p-0"
              title="Add new task"
            >
              <Plus className="w-4 h-4" />
            </Button>
          )}
          
          {column.id === 'in_progress' && tasks.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {formatTime(
                tasks.reduce((sum, task) => sum + (task.timeSpentMinutes || 0), 0)
              )}
            </div>
          )}
        </CardTitle>

        {/* WIP Limit Indicator - ONLY for In Progress column */}
        {isWipColumn && isNearLimit && (
          <div className="mt-2">
            <div className="text-xs text-muted-foreground mb-1">
              {isAtLimit ? 'WIP Limit Reached' : 'Near WIP Limit'}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  isAtLimit ? 'bg-red-500' : 'bg-orange-500'
                }`}
                style={{ width: `${(tasks.length / wipLimit) * 100}%` }}
              />
            </div>
          </div>
        )}
      </CardHeader>

      <Droppable droppableId={column.id} isDropDisabled={bulkOps.isSelectionMode || isAtLimit}>
        {(provided, snapshot) => (
          <CardContent
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`space-y-3 min-h-[200px] transition-colors ${
              snapshot.isDraggingOver && !bulkOps.isSelectionMode 
                ? isAtLimit 
                  ? 'bg-red-50 border-2 border-red-300 border-dashed' 
                  : 'bg-muted/50' 
                : ''
            }`}
          >
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {hasFilters ? (
                  <div>
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No tasks match current filters</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFilters(defaultFilters)}
                      className="mt-2"
                    >
                      Clear filters
                    </Button>
                  </div>
                ) : column.id === 'todo' ? (
                  <div>
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No tasks yet</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAddTask(true)}
                      className="mt-2"
                    >
                      Add your first task
                    </Button>
                  </div>
                ) : (
                  <div>
                    <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-muted flex items-center justify-center opacity-50">
                      {column.icon}
                    </div>
                    <p className="text-sm">
                      {column.id === 'in_progress' ? 'No active tasks' : 'No completed tasks'}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <>
                {isWipColumn && isAtLimit && snapshot.isDraggingOver && (
                  <div className="p-3 bg-red-100 border-2 border-red-400 rounded-lg text-center mb-3 animate-pulse">
                    <AlertCircle className="w-5 h-5 mx-auto mb-1 text-red-600" />
                    <p className="text-xs text-red-700 font-medium">
                      WIP Limit Reached ({wipLimit} tasks max)
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      Finish a task before starting more!
                    </p>
                  </div>
                )}
                {tasks.map((task, index) => (
                  <Draggable 
                    key={task.id} 
                    draggableId={task.id} 
                    index={index}
                    isDragDisabled={bulkOps.isSelectionMode}
                  >
                    {(provided, snapshot) => (
                      <DraggableTaskCard
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          ...provided.draggableProps.style,
                          transform: snapshot.isDragging && !bulkOps.isSelectionMode
                            ? `${provided.draggableProps.style?.transform} rotate(2deg)` 
                            : provided.draggableProps.style?.transform
                        }}
                        task={task}
                        onTaskClick={() => setSelectedTask(task)}
                        isTimerActive={!!activeTimers[task.id]}
                        onStartTimer={() => startTimer(task.id)}
                        onStopTimer={() => stopTimer(task.id)}
                        isDragging={snapshot.isDragging}
                        isFocused={focusedTaskId === task.id}
                        isKeyboardMode={isKeyboardMode}
                        isSelected={bulkOps.selectedTaskIds.has(task.id)}
                        isSelectionMode={bulkOps.isSelectionMode}
                        onSelectionToggle={() => bulkOps.toggleTaskSelection(task.id)}
                        timerStartTime={activeTimers[task.id]?.startTime}
                        statusColor={STATUS_COLORS[task.status]}
                      />
                    )}
                  </Draggable>
                ))}
              </>
            )}
            {provided.placeholder}
          </CardContent>
        )}
      </Droppable>
    </Card>
  );
});

export default function KanbanBoard({
  projectId,
  tasks = [],
  onTaskUpdate,
  onTaskCreate,
  onTaskDelete,
  onTaskTimeUpdate
}: KanbanBoardProps) {
  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeTimers, setActiveTimers] = useState<{ [taskId: string]: { startTime: number; interval: NodeJS.Timeout } }>({});
  const [filters, setFilters] = useState<TaskFilters>(defaultFilters);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);

  // Apply filters to tasks
  const safeTasksArray = Array.isArray(tasks) ? tasks : [];
  const filteredTasks = useTaskFilters(safeTasksArray, filters);

  // Bulk operations
  const bulkOps = useBulkOperations({
    tasks: filteredTasks,
    onTaskUpdate,
    onTaskDelete
  });

  // Group filtered tasks by status
  const tasksByStatus = COLUMNS.reduce((acc, column) => {
    acc[column.id] = filteredTasks
      .filter(task => task?.status === column.id)
      .sort((a, b) => (a?.position || 0) - (b?.position || 0));
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  // Timer functions
  const formatTime = useCallback((minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }, []);

  const startTimer = useCallback((taskId: string) => {
    if (activeTimers[taskId]) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 60000);
      if (elapsed > 0) {
        onTaskTimeUpdate(taskId, elapsed);
      }
    }, 60000);

    setActiveTimers(prev => ({
      ...prev,
      [taskId]: { startTime, interval }
    }));
  }, [activeTimers, onTaskTimeUpdate]);

  const stopTimer = useCallback((taskId: string) => {
    const timer = activeTimers[taskId];
    if (!timer) return;

    clearInterval(timer.interval);
    const totalMinutes = Math.floor((Date.now() - timer.startTime) / 60000);
    
    if (totalMinutes > 0) {
      onTaskTimeUpdate(taskId, totalMinutes);
    }

    setActiveTimers(prev => {
      const newTimers = { ...prev };
      delete newTimers[taskId];
      return newTimers;
    });
  }, [activeTimers, onTaskTimeUpdate]);

  // Keyboard navigation
  const {
    focusedTaskId,
    focusedColumn,
    isKeyboardMode
  } = useKeyboardNavigation({
    tasks: filteredTasks,
    onTaskSelect: (task) => {
      try {
        if (bulkOps.isSelectionMode) {
          bulkOps.toggleTaskSelection(task.id);
        } else {
          setSelectedTask(task);
        }
      } catch (error) {
        console.error('Error handling task selection:', error);
      }
    },
    onTaskMove: async (taskId: string, newStatus: TaskStatus) => {
      try {
        const task = safeTasksArray.find(t => t.id === taskId);
        if (!task) return;

        // Check WIP limit ONLY for "In Progress" column
        if (newStatus === 'in_progress' && newStatus !== task.status) {
          // Count tasks that are currently in In Progress (excluding the task being moved)
          const currentInProgressTasks = safeTasksArray.filter(t => 
            t.status === 'in_progress' && t.id !== taskId
          );
          
          if (currentInProgressTasks.length >= WIP_LIMIT) {
            setDragError(`Cannot move task to In Progress. WIP limit reached (${WIP_LIMIT} tasks maximum). Complete or move out a task first.`);
            return;
          }
        }

        const updates: Partial<Task> = { status: newStatus };
        
        if (newStatus === 'in_progress' && task.status !== 'in_progress') {
          updates.startedAt = new Date().toISOString();
          // Auto-start timer when task moves to in_progress
          startTimer(taskId);
        } else if (newStatus === 'completed' && task.status !== 'completed') {
          updates.completedAt = new Date().toISOString();
          // Auto-stop timer when task moves to completed
          stopTimer(taskId);
        } else if (task.status === 'in_progress' && newStatus !== 'in_progress') {
          // Stop timer if task is moved out of in_progress to another status
          stopTimer(taskId);
        }

        await onTaskUpdate(taskId, updates);
      } catch (error) {
        console.error('Error handling task move:', error);
      }
    },
    enabled: !bulkOps.isSelectionMode
  });

  // Calculate progress from filtered tasks
  const progress: TaskProgress = {
    totalTasks: filteredTasks.length,
    completedTasks: filteredTasks.filter(t => t.status === 'completed').length,
    inProgressTasks: filteredTasks.filter(t => t.status === 'in_progress').length,
    todoTasks: filteredTasks.filter(t => t.status === 'todo').length,
    totalTimeSpent: filteredTasks.reduce((sum, task) => sum + (task.timeSpentMinutes || 0), 0),
    completionPercentage: filteredTasks.length > 0 ? Math.round((filteredTasks.filter(t => t.status === 'completed').length / filteredTasks.length) * 100) : 0
  };

  // Drag end handler with WIP limit enforcement
  const onDragEnd = useCallback(async (result: DropResult) => {
    try {
      setDragError(null);
      const { destination, source, draggableId } = result;

      if (!destination) return;

      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      ) {
        return;
      }

      const taskId = draggableId;
      const newStatus = destination.droppableId as TaskStatus;
      const sourceStatus = source.droppableId as TaskStatus;
      const task = safeTasksArray.find(t => t.id === taskId);

      if (!task) return;

      // Check WIP limit ONLY for "In Progress" column
      if (newStatus === 'in_progress' && newStatus !== sourceStatus) {
        // Count tasks that are currently in In Progress (excluding the task being moved)
        const currentInProgressTasks = safeTasksArray.filter(t => 
          t.status === 'in_progress' && t.id !== taskId
        );
        
        console.log('🔍 WIP Check:', {
          newStatus,
          sourceStatus,
          taskId,
          currentInProgressCount: currentInProgressTasks.length,
          wipLimit: WIP_LIMIT,
          willBlock: currentInProgressTasks.length >= WIP_LIMIT
        });
        
        if (currentInProgressTasks.length >= WIP_LIMIT) {
          setDragError(`Cannot move task to In Progress. WIP limit reached (${WIP_LIMIT} tasks maximum). Complete or move out a task first.`);
          console.error('❌ WIP LIMIT BLOCKED - Cannot add more tasks to In Progress');
          return;
        }
      }

      const updates: Partial<Task> = {
        status: newStatus,
        position: destination.index
      };
      
      console.log('✅ WIP Check PASSED - Moving task:', {
        taskId,
        from: sourceStatus,
        to: newStatus,
        taskTitle: task.title
      });

      if (newStatus === 'in_progress' && task.status !== 'in_progress') {
        updates.startedAt = new Date().toISOString();
        // Auto-start timer when task moves to in_progress
        startTimer(taskId);
      } else if (newStatus === 'completed' && task.status !== 'completed') {
        updates.completedAt = new Date().toISOString();
        // Auto-stop timer when task moves to completed
        stopTimer(taskId);
      } else if (task.status === 'in_progress' && newStatus !== 'in_progress') {
        // Stop timer if task is moved out of in_progress to another status (like back to todo)
        stopTimer(taskId);
      }

      await onTaskUpdate(taskId, updates);
      console.log('💾 Task updated in storage with new status:', { taskId, newStatus, oldStatus: task.status });
    } catch (error) {
      console.error('Error handling drag end:', error);
      setDragError('Failed to move task. Please try again.');
    }
  }, [safeTasksArray, onTaskUpdate, stopTimer, tasksByStatus]);

  // Keyboard shortcuts for bulk operations
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        if (!bulkOps.isSelectionMode) {
          bulkOps.enterSelectionMode();
        }
        bulkOps.toggleSelectAll(filteredTasks);
      }

      if (e.key === 'Escape') {
        if (bulkOps.isSelectionMode) {
          bulkOps.exitSelectionMode();
        }
      }

      if (e.key === 'm' && !bulkOps.isSelectionMode) {
        e.preventDefault();
        bulkOps.enterSelectionMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [bulkOps, filteredTasks]);

  // Handle client-side mounting for react-beautiful-dnd
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsClient(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(activeTimers).forEach(timer => {
        clearInterval(timer.interval);
      });
    };
  }, [activeTimers]);

  const hasFilters = filters.search || filters.priority !== 'all' || filters.status !== 'all' || 
                    filters.sortBy !== 'created' || filters.sortOrder !== 'desc';

  return (
    <div className="space-y-6">
      {/* WIP Limit Information */}
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-sm text-blue-800">
          <strong>WIP Limit Active:</strong> "In Progress" column is limited to {WIP_LIMIT} tasks maximum to maintain focus and flow. 
          Complete tasks before starting new ones to prevent bottlenecks and improve quality. Stop starting, start finishing!
        </AlertDescription>
      </Alert>

      {/* Filters and Presets */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-4xl">
            <TaskFiltersComponent
              filters={filters}
              onFiltersChange={setFilters}
              tasks={tasks}
            />
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <FilterPresets
              currentFilters={filters}
              onApplyPreset={setFilters}
              taskCount={tasks.length}
            />
            
            {!bulkOps.isSelectionMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={bulkOps.enterSelectionMode}
                title="Multi-select mode (M)"
              >
                <CheckSquare className="w-4 h-4 mr-1" />
                Select
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {dragError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {dragError}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDragError(null)}
              className="ml-2"
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Keyboard Navigation Help */}
      {isKeyboardMode && !bulkOps.isSelectionMode && (
        <Alert>
          <Keyboard className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              Keyboard navigation active. Use arrow keys to navigate, Enter to select, numbers 1-3 to move between columns.
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
            >
              <Info className="w-4 h-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Selection Mode Help */}
      {bulkOps.isSelectionMode && (
        <Alert>
          <CheckSquare className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                Multi-select mode active. Click tasks to select, use toolbar below for bulk actions.
              </span>
              <div className="flex gap-2 text-xs">
                <kbd className="px-1.5 py-0.5 bg-muted rounded">Ctrl+A</kbd>
                <span>Select all</span>
                <kbd className="px-1.5 py-0.5 bg-muted rounded">Esc</kbd>
                <span>Exit</span>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {showKeyboardHelp && (
        <Alert>
          <AlertDescription>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Navigation:</strong>
                  <ul className="mt-1 space-y-1 text-muted-foreground">
                    <li>↑↓ - Navigate tasks</li>
                    <li>←→ - Switch columns</li>
                    <li>Tab/Shift+Tab - Column navigation</li>
                  </ul>
                </div>
                <div>
                  <strong>Actions:</strong>
                  <ul className="mt-1 space-y-1 text-muted-foreground">
                    <li>Enter/Space - Open task</li>
                    <li>1/2/3 - Move to column</li>
                    <li>M - Multi-select mode</li>
                    <li>Esc - Exit modes</li>
                  </ul>
                </div>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Progress Header */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{progress.totalTasks}</div>
              <div className="text-sm text-muted-foreground">
                {hasFilters ? 'Filtered Tasks' : 'Total Tasks'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{progress.completedTasks}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{progress.inProgressTasks}</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{formatTime(progress.totalTimeSpent)}</div>
              <div className="text-sm text-muted-foreground">Time Spent</div>
            </div>
          </div>

          {/* WIP Limits Summary */}
          <div className="mt-6 pt-6 border-t">
            <div className="text-sm font-medium mb-3">Column Capacity (WIP Limits)</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {COLUMNS.map(column => {
                const columnTasks = tasksByStatus[column.id] || [];
                const isAtLimit = columnTasks.length >= WIP_LIMIT;
                const isNearLimit = columnTasks.length >= WIP_LIMIT - 1;
                
                return (
                  <div key={column.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{column.icon}</span>
                      <span className="text-sm">{column.title}</span>
                    </div>
                    <Badge 
                      variant={isAtLimit ? 'destructive' : isNearLimit ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {columnTasks.length}/{WIP_LIMIT}
                      {isAtLimit && ' FULL'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
          
          {progress.totalTasks > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Progress</span>
                <span className="text-sm font-medium">{progress.completionPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.completionPercentage}%` }}
                />
              </div>
              {progress.completionPercentage >= 25 && progress.completionPercentage % 25 === 0 && (
                <div className="mt-2 text-sm text-green-600 font-medium">
                  🎉 {progress.completionPercentage}% Complete! Keep going!
                </div>
              )}
            </div>
          )}

          {hasFilters && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                Showing {filteredTasks.length} of {tasks.length} tasks
                {filteredTasks.length !== tasks.length && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setFilters(defaultFilters)}
                    className="ml-2 h-auto p-0 text-blue-600"
                  >
                    Show all tasks
                  </Button>
                )}
              </p>
            </div>
          )}

          {bulkOps.selectedTaskIds.size > 0 && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                {bulkOps.selectedTaskIds.size} task{bulkOps.selectedTaskIds.size > 1 ? 's' : ''} selected
                • Use the toolbar below for bulk actions
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Kanban Board */}
      {isClient ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {COLUMNS.map(column => (
              <DroppableColumn
                key={column.id}
                column={column}
                tasks={tasksByStatus[column.id] || []}
                isKeyboardMode={isKeyboardMode}
                focusedColumn={focusedColumn}
                bulkOps={bulkOps}
                isClient={true}
                hasFilters={hasFilters}
                defaultFilters={defaultFilters}
                setFilters={setFilters}
                setShowAddTask={setShowAddTask}
                formatTime={formatTime}
                activeTimers={activeTimers}
                startTimer={startTimer}
                stopTimer={stopTimer}
                setSelectedTask={setSelectedTask}
                focusedTaskId={focusedTaskId}
                wipLimit={WIP_LIMIT}
              />
            ))}
          </div>
        </DragDropContext>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COLUMNS.map(column => (
            <DroppableColumn
              key={column.id}
              column={column}
              tasks={tasksByStatus[column.id] || []}
              isKeyboardMode={false}
              focusedColumn={null}
              bulkOps={{
                isSelectionMode: false,
                selectedTaskIds: new Set(),
                selectTask: () => {},
                unselectTask: () => {}
              }}
              isClient={false}
              hasFilters={hasFilters}
              defaultFilters={defaultFilters}
              setFilters={setFilters}
              setShowAddTask={setShowAddTask}
              formatTime={formatTime}
              activeTimers={{}}
              startTimer={() => {}}
              stopTimer={() => {}}
              setSelectedTask={() => {}}
              focusedTaskId={null}
              wipLimit={WIP_LIMIT}
            />
          ))}
        </div>
      )}

      {/* Bulk Actions Toolbar */}
      {bulkOps.isSelectionMode && bulkOps.selectedTaskIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
          <BulkActionsToolbar
            selectedTaskIds={Array.from(bulkOps.selectedTaskIds)}
            onBulkUpdate={bulkOps.bulkUpdate}
            onBulkDelete={bulkOps.bulkDelete}
            onClearSelection={bulkOps.clearSelection}
            onExitSelectionMode={bulkOps.exitSelectionMode}
          />
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTask && (
        <AddTaskModal
          projectId={projectId}
          onClose={() => setShowAddTask(false)}
          onSubmit={onTaskCreate}
        />
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onTaskUpdate={onTaskUpdate}
          onTaskDelete={onTaskDelete}
          isTimerActive={!!activeTimers[selectedTask.id]}
          onStartTimer={() => startTimer(selectedTask.id)}
          onStopTimer={() => stopTimer(selectedTask.id)}
        />
      )}

      {/* Add Task Modal */}
      {showAddTask && (
        <AddTaskModal
          projectId={projectId}
          onClose={() => setShowAddTask(false)}
          onSubmit={onTaskCreate}
        />
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onTaskUpdate={onTaskUpdate}
          onTaskDelete={onTaskDelete}
          isTimerActive={!!activeTimers[selectedTask.id]}
          onStartTimer={() => startTimer(selectedTask.id)}
          onStopTimer={() => stopTimer(selectedTask.id)}
        />
      )}
    </div>
  );
}