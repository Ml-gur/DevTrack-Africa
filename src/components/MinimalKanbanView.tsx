/**
 * Minimal Kanban View - Clean, modern task board
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Clock,
  Calendar,
  Flag,
  CheckCircle2,
  Circle,
  PlayCircle,
  Zap,
  SortAsc
} from 'lucide-react';
import { Task, TaskStatus } from '../types/task';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { format } from 'date-fns';
import MinimalTaskDetailModal from './MinimalTaskDetailModal';
import MinimalQuickTaskCreator from './MinimalQuickTaskCreator';
import { toast } from 'sonner@2.0.3';

interface MinimalKanbanViewProps {
  projectId: string;
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onTaskCreate: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onTaskDelete: (taskId: string) => Promise<void>;
  onTaskTimeUpdate: (taskId: string, minutes: number) => Promise<void>;
}

const columns: { id: TaskStatus; title: string; icon: any; color: string }[] = [
  { id: 'todo', title: 'To Do', icon: Circle, color: 'gray' },
  { id: 'in_progress', title: 'In Progress', icon: PlayCircle, color: 'blue' },
  { id: 'completed', title: 'Completed', icon: CheckCircle2, color: 'green' }
];

export default function MinimalKanbanView({
  projectId,
  tasks = [],
  onTaskUpdate,
  onTaskCreate,
  onTaskDelete,
  onTaskTimeUpdate
}: MinimalKanbanViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate' | 'created'>('created');

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Filter tasks by search and priority
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  // Group tasks by status
  const tasksByStatus = columns.reduce((acc, column) => {
    acc[column.id] = filteredTasks
      .filter(task => task.status === column.id)
      .sort((a, b) => (a.position || 0) - (b.position || 0));
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const taskId = draggableId;
    const newStatus = destination.droppableId as TaskStatus;
    const oldStatus = source.droppableId as TaskStatus;
    const task = tasks.find(t => t.id === taskId);

    if (!task) return;

    const updates: Partial<Task> = {
      status: newStatus,
      position: destination.index
    };

    // Timer logic: Start timer when moving to in_progress
    if (newStatus === 'in_progress' && oldStatus !== 'in_progress') {
      updates.timerStartTime = new Date().toISOString();
      updates.startedAt = new Date().toISOString();
      toast.success('⏱️ Timer started for this task');
    }

    // Timer logic: Stop timer and calculate time when moving to completed
    if (newStatus === 'completed' && oldStatus === 'in_progress' && task.timerStartTime) {
      const startTime = new Date(task.timerStartTime).getTime();
      const endTime = new Date().getTime();
      const minutesSpent = Math.round((endTime - startTime) / (1000 * 60));
      
      updates.timeSpentMinutes = (task.timeSpentMinutes || 0) + minutesSpent;
      updates.timerStartTime = undefined; // Clear timer
      updates.completedAt = new Date().toISOString();
      
      toast.success(`✅ Task completed! Time tracked: ${Math.floor(minutesSpent / 60)}h ${minutesSpent % 60}m`);
    } else if (newStatus === 'completed' && task.status !== 'completed') {
      updates.completedAt = new Date().toISOString();
      toast.success('✅ Task completed!');
    }

    // Stop timer when moving from in_progress to todo (pausing)
    if (oldStatus === 'in_progress' && newStatus === 'todo' && task.timerStartTime) {
      const startTime = new Date(task.timerStartTime).getTime();
      const endTime = new Date().getTime();
      const minutesSpent = Math.round((endTime - startTime) / (1000 * 60));
      
      updates.timeSpentMinutes = (task.timeSpentMinutes || 0) + minutesSpent;
      updates.timerStartTime = undefined; // Clear timer
      
      toast.info(`⏸️ Timer paused. Time tracked: ${Math.floor(minutesSpent / 60)}h ${minutesSpent % 60}m`);
    }

    await onTaskUpdate(taskId, updates);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50/50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50/50';
      default:
        return 'border-l-gray-300 bg-white';
    }
  };

  const TaskCard = ({ task }: { task: Task }) => (
    <Card 
      className={`border-l-4 ${getPriorityColor(task.priority)} hover:shadow-md transition-all cursor-pointer group`}
      onClick={() => setSelectedTask(task)}
    >
      <CardContent className="p-4 space-y-3">
        {/* Title */}
        <div>
          <h4 className="font-medium text-gray-900 text-sm mb-1 group-hover:text-blue-600 transition-colors">
            {task.title}
          </h4>
          {task.description && (
            <p className="text-xs text-gray-500 line-clamp-2">{task.description}</p>
          )}
        </div>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {task.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">+{task.tags.length - 3}</Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            {task.priority && (
              <Badge
                variant="outline"
                className={`text-xs ${
                  task.priority === 'high' ? 'border-red-200 text-red-700' :
                  task.priority === 'medium' ? 'border-yellow-200 text-yellow-700' :
                  'border-gray-200 text-gray-700'
                }`}
              >
                <Flag className="w-3 h-3 mr-1" />
                {task.priority}
              </Badge>
            )}
          </div>

          {task.dueDate && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              {format(new Date(task.dueDate), 'MMM d')}
            </div>
          )}
        </div>

        {/* Time tracking */}
        {task.timeSpentMinutes && task.timeSpentMinutes > 0 && (
          <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
            <Clock className="w-3 h-3" />
            {Math.floor(task.timeSpentMinutes / 60)}h {task.timeSpentMinutes % 60}m
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-0 bg-gray-50"
              />
            </div>
            
            {/* Quick Filters */}
            <div className="flex items-center gap-2">
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-2 text-sm border rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">⚪ Low</option>
              </select>

              <Button variant="outline" size="sm" className="gap-2">
                <SortAsc className="w-4 h-4" />
                <span className="hidden sm:inline">Sort</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kanban Board */}
      {isClient ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {columns.map((column) => {
              const Icon = column.icon;
              const columnTasks = tasksByStatus[column.id] || [];
              
              return (
                <div key={column.id} className="space-y-4">
                  {/* Column Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg bg-${column.color}-50 flex items-center justify-center`}>
                        <Icon className={`w-4 h-4 text-${column.color}-600`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{column.title}</h3>
                        <p className="text-xs text-gray-500">{columnTasks.length} tasks</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>

  {/* Quick Task Creator */}
                  <MinimalQuickTaskCreator
                    projectId={projectId}
                    status={column.id}
                    onTaskCreate={onTaskCreate}
                    placeholder={`Add ${column.title.toLowerCase()} task...`}
                  />

                  {/* Droppable Column */}
                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`space-y-3 min-h-[300px] p-3 rounded-lg transition-all duration-200 ${
                          snapshot.isDraggingOver 
                            ? 'bg-blue-50 ring-2 ring-blue-200 ring-inset' 
                            : 'bg-transparent'
                        }`}
                      >
                        {columnTasks.length === 0 ? (
                          <div className="text-center py-12 text-gray-400">
                            <Icon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No tasks yet</p>
                            <p className="text-xs mt-1">Drag tasks here or create new ones</p>
                          </div>
                        ) : (
                          columnTasks.map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={{
                                    ...provided.draggableProps.style,
                                    transform: snapshot.isDragging
                                      ? `${provided.draggableProps.style?.transform} rotate(3deg) scale(1.02)`
                                      : provided.draggableProps.style?.transform
                                  }}
                                  className={`transition-opacity ${snapshot.isDragging ? 'opacity-60 shadow-xl' : ''}`}
                                >
                                  <TaskCard task={task} />
                                </div>
                              )}
                            </Draggable>
                          ))
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((column) => (
            <div key={column.id} className="space-y-4">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg bg-${column.color}-50 flex items-center justify-center`}>
                  <column.icon className={`w-4 h-4 text-${column.color}-600`} />
                </div>
                <h3 className="font-semibold text-gray-900">{column.title}</h3>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-gray-500 text-center py-8">Loading...</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <MinimalTaskDetailModal
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={async (updates) => {
            await onTaskUpdate(selectedTask.id, updates);
            setSelectedTask({ ...selectedTask, ...updates });
          }}
          onDelete={async () => {
            await onTaskDelete(selectedTask.id);
            setSelectedTask(null);
          }}
          onStartTimer={() => {
            // Timer logic would go here
          }}
          onStopTimer={() => {
            // Timer logic would go here
          }}
        />
      )}
    </div>
  );
}
