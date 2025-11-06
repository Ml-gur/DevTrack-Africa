import { useState, useEffect } from 'react';
import KanbanBoard from './KanbanBoard';
import { Task, TaskStatus, TaskPriority } from '../types/task';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { RefreshCw } from 'lucide-react';

/**
 * Test page to verify WIP limits and dynamic color changes
 */
export default function KanbanTestPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [testLog, setTestLog] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestLog(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 20));
    console.log(`🧪 TEST: ${message}`);
  };

  // Initialize with test tasks
  useEffect(() => {
    const testTasks: Task[] = [
      {
        id: 'task-1',
        projectId: 'test-project',
        title: 'Task 1 - To Do',
        description: 'This is in To Do',
        status: 'todo' as TaskStatus,
        priority: 'high' as TaskPriority,
        position: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        timeSpentMinutes: 0
      },
      {
        id: 'task-2',
        projectId: 'test-project',
        title: 'Task 2 - To Do',
        description: 'This is in To Do',
        status: 'todo' as TaskStatus,
        priority: 'medium' as TaskPriority,
        position: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        timeSpentMinutes: 0
      },
      {
        id: 'task-3',
        projectId: 'test-project',
        title: 'Task 3 - To Do',
        description: 'This is in To Do',
        status: 'todo' as TaskStatus,
        priority: 'low' as TaskPriority,
        position: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        timeSpentMinutes: 0
      },
      {
        id: 'task-4',
        projectId: 'test-project',
        title: 'Task 4 - To Do (Should be BLOCKED at 4th)',
        description: 'This task should NOT be moveable to In Progress when 3 are already there',
        status: 'todo' as TaskStatus,
        priority: 'high' as TaskPriority,
        position: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        timeSpentMinutes: 0
      }
    ];
    setTasks(testTasks);
    addLog('Test initialized with 4 tasks in To Do');
  }, []);

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    addLog(`Updating task ${taskId}: ${JSON.stringify(updates)}`);
    
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.map(task => {
        if (task.id === taskId) {
          const updatedTask = { ...task, ...updates, updatedAt: new Date().toISOString() };
          addLog(`✅ Task updated - Status: ${task.status} → ${updatedTask.status}`);
          return updatedTask;
        }
        return task;
      });
      
      // Log current task distribution
      const distribution = updatedTasks.reduce((acc, t) => {
        acc[t.status] = (acc[t.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      addLog(`Current distribution: ${JSON.stringify(distribution)}`);
      return updatedTasks;
    });
  };

  const handleTaskCreate = async (newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const task: Task = {
      ...newTask,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setTasks(prev => [...prev, task]);
    addLog(`Created new task: ${task.title}`);
  };

  const handleTaskDelete = async (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    addLog(`Deleted task: ${taskId}`);
  };

  const handleTaskTimeUpdate = async (taskId: string, minutes: number) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId 
        ? { ...t, timeSpentMinutes: (t.timeSpentMinutes || 0) + minutes }
        : t
    ));
  };

  const resetTest = () => {
    window.location.reload();
  };

  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
  const todoCount = tasks.filter(t => t.status === 'todo').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>🧪 Kanban WIP Limit & Color Change Test</span>
              <Button onClick={resetTest} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset Test
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Test Instructions:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Try dragging Task 1, 2, and 3 from "To Do" to "In Progress" ✅ (Should work)</li>
                <li>Watch the task cards change color from gray to blue 🎨</li>
                <li>Try dragging Task 4 to "In Progress" ❌ (Should be BLOCKED - WIP limit reached)</li>
                <li>Drag a task from "In Progress" to "Completed" to see green color 🟢</li>
                <li>Open browser console to see detailed logs 📝</li>
              </ol>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-100 p-3 rounded-lg">
                <div className="text-sm text-gray-600">To Do</div>
                <div className="text-2xl font-bold">{todoCount}</div>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <div className="text-sm text-blue-600">In Progress</div>
                <div className="text-2xl font-bold text-blue-700">
                  {inProgressCount} / 3
                </div>
                {inProgressCount >= 3 && (
                  <div className="text-xs text-red-600 font-semibold mt-1">
                    ⚠️ WIP LIMIT REACHED
                  </div>
                )}
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <div className="text-sm text-green-600">Completed</div>
                <div className="text-2xl font-bold text-green-700">{completedCount}</div>
              </div>
            </div>

            <div className="bg-gray-100 rounded-lg p-4 max-h-60 overflow-y-auto">
              <h4 className="font-semibold mb-2">Test Log:</h4>
              <div className="space-y-1 text-xs font-mono">
                {testLog.length === 0 ? (
                  <div className="text-gray-500">No activity yet...</div>
                ) : (
                  testLog.map((log, i) => (
                    <div key={i} className="text-gray-700">{log}</div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <KanbanBoard
          projectId="test-project"
          tasks={tasks}
          onTaskUpdate={handleTaskUpdate}
          onTaskCreate={handleTaskCreate}
          onTaskDelete={handleTaskDelete}
          onTaskTimeUpdate={handleTaskTimeUpdate}
        />
      </div>
    </div>
  );
}
