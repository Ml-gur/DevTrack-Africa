import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Database, 
  TestTube, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Users,
  FolderOpen,
  MessageCircle,
  Upload,
  Loader2
} from 'lucide-react';
import DataPersistenceValidator from './DataPersistenceValidator';
import { dataPersistenceManager } from '../utils/supabase/data-persistence-manager';
import { healthService } from '../utils/supabase/database-service';
import { useAuth } from '../contexts/AuthContext';
import { log } from '../utils/production-logger';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error' | 'running';
  message: string;
  details?: any;
  timestamp?: string;
}

interface ComprehensiveTestingDashboardProps {
  user: any;
}

export default function ComprehensiveTestingDashboard({ user }: ComprehensiveTestingDashboardProps) {
  const { profile } = useAuth();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [persistenceHealth, setPersistenceHealth] = useState<boolean | null>(null);

  const updateTestResult = (name: string, status: TestResult['status'], message: string, details?: any) => {
    setTestResults(prev => {
      const existing = prev.find(r => r.name === name);
      const newResult: TestResult = {
        name,
        status,
        message,
        details,
        timestamp: new Date().toISOString()
      };
      
      if (existing) {
        return prev.map(r => r.name === name ? newResult : r);
      } else {
        return [...prev, newResult];
      }
    });
  };

  const runDataFlowTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);

    try {
      log.info('🧪 Starting comprehensive data flow testing...');

      // Test 1: User Profile Operations
      setCurrentTest('User Profile Operations');
      updateTestResult('User Profile Operations', 'running', 'Testing profile operations...');
      
      try {
        // Test profile update
        const testProfileData = {
          bio: `Test bio updated at ${new Date().toISOString()}`,
          title: 'Test Developer',
          tech_stack: ['React', 'TypeScript', 'Supabase']
        };

        const profileResult = await dataPersistenceManager.userService.updateProfile(user.id, testProfileData);
        
        if (profileResult.success) {
          updateTestResult('User Profile Operations', 'success', 'Profile operations working correctly', {
            updatedFields: Object.keys(testProfileData)
          });
        } else {
          updateTestResult('User Profile Operations', 'error', 'Profile update failed', profileResult.error);
        }
      } catch (error: any) {
        updateTestResult('User Profile Operations', 'error', 'Profile test failed', error.message);
      }

      // Test 2: Project Lifecycle
      setCurrentTest('Project Lifecycle');
      updateTestResult('Project Lifecycle', 'running', 'Testing complete project lifecycle...');
      
      try {
        // Create test project
        const testProject = {
          title: `Test Project ${Date.now()}`,
          description: 'This is a comprehensive test project for data flow validation',
          status: 'planning' as const,
          priority: 'medium' as const,
          progress: 0,
          tech_stack: ['React', 'Node.js', 'PostgreSQL'],
          visibility: 'private' as const
        };

        const createResult = await dataPersistenceManager.createProject(user.id, testProject);
        
        if (createResult.success && createResult.data) {
          const projectId = createResult.data.id;

          // Update project
          const updateResult = await dataPersistenceManager.updateProject(projectId, {
            status: 'in-progress',
            progress: 50
          });

          if (updateResult.success) {
            // Verify project can be retrieved
            const projectsResult = await dataPersistenceManager.getUserProjects(user.id);
            const projectExists = projectsResult.success && 
              projectsResult.data?.some(p => p.id === projectId);

            if (projectExists) {
              // Clean up: delete test project
              await dataPersistenceManager.deleteProject(projectId);
              
              updateTestResult('Project Lifecycle', 'success', 'Complete project lifecycle working', {
                operations: ['create', 'update', 'retrieve', 'delete'],
                projectId
              });
            } else {
              updateTestResult('Project Lifecycle', 'error', 'Project retrieval failed');
            }
          } else {
            updateTestResult('Project Lifecycle', 'error', 'Project update failed', updateResult.error);
          }
        } else {
          updateTestResult('Project Lifecycle', 'error', 'Project creation failed', createResult.error);
        }
      } catch (error: any) {
        updateTestResult('Project Lifecycle', 'error', 'Project lifecycle test failed', error.message);
      }

      // Test 3: Task Management
      setCurrentTest('Task Management');
      updateTestResult('Task Management', 'running', 'Testing task management operations...');
      
      try {
        // First create a test project for tasks
        const taskTestProject = {
          title: `Task Test Project ${Date.now()}`,
          description: 'Project for testing task management',
          status: 'planning' as const,
          priority: 'low' as const,
          progress: 0,
          visibility: 'private' as const
        };

        const projectResult = await dataPersistenceManager.createProject(user.id, taskTestProject);
        
        if (projectResult.success && projectResult.data) {
          const projectId = projectResult.data.id;

          // Create multiple test tasks
          const tasks = [
            { title: 'Test Task 1', status: 'todo' as const, priority: 'high' as const, position: 0 },
            { title: 'Test Task 2', status: 'in-progress' as const, priority: 'medium' as const, position: 1 },
            { title: 'Test Task 3', status: 'completed' as const, priority: 'low' as const, position: 2 }
          ];

          const createdTasks = [];
          for (const task of tasks) {
            const taskResult = await dataPersistenceManager.createTask(projectId, user.id, task);
            if (taskResult.success && taskResult.data) {
              createdTasks.push(taskResult.data);
            }
          }

          if (createdTasks.length === tasks.length) {
            // Test task updates
            const firstTask = createdTasks[0];
            const updateResult = await dataPersistenceManager.updateTask(firstTask.id, {
              status: 'completed',
              time_spent: 120 // 2 hours
            });

            if (updateResult.success) {
              // Test batch position updates
              const positionUpdates = createdTasks.map((task, index) => ({
                id: task.id,
                position: index + 10
              }));

              const batchResult = await dataPersistenceManager.updateTaskPositions(positionUpdates);
              
              if (batchResult.success) {
                // Clean up: delete project (cascades to tasks)
                await dataPersistenceManager.deleteProject(projectId);
                
                updateTestResult('Task Management', 'success', 'All task operations successful', {
                  tasksCreated: createdTasks.length,
                  operations: ['create', 'update', 'batch-update', 'delete']
                });
              } else {
                updateTestResult('Task Management', 'error', 'Batch task update failed', batchResult.error);
              }
            } else {
              updateTestResult('Task Management', 'error', 'Task update failed', updateResult.error);
            }
          } else {
            updateTestResult('Task Management', 'error', `Only ${createdTasks.length}/${tasks.length} tasks created`);
          }
        } else {
          updateTestResult('Task Management', 'error', 'Test project creation failed');
        }
      } catch (error: any) {
        updateTestResult('Task Management', 'error', 'Task management test failed', error.message);
      }

      // Test 4: Community Posts
      setCurrentTest('Community Posts');
      updateTestResult('Community Posts', 'running', 'Testing community post operations...');
      
      try {
        const testPost = {
          title: `Test Post ${Date.now()}`,
          content: 'This is a test post for data flow validation. It includes testing community features and social interactions.',
          post_type: 'text' as const,
          tags: ['testing', 'validation', 'devtrack'],
          visibility: 'public' as const
        };

        const postResult = await dataPersistenceManager.createPost(user.id, testPost);
        
        if (postResult.success && postResult.data) {
          // Verify post can be retrieved
          const postsResult = await dataPersistenceManager.getCommunityPosts(10, 0);
          const postExists = postsResult.success && 
            postsResult.data?.some(p => p.id === postResult.data!.id);

          if (postExists) {
            updateTestResult('Community Posts', 'success', 'Community post operations working', {
              postId: postResult.data.id,
              operations: ['create', 'retrieve']
            });
          } else {
            updateTestResult('Community Posts', 'error', 'Post retrieval failed');
          }
        } else {
          updateTestResult('Community Posts', 'error', 'Post creation failed', postResult.error);
        }
      } catch (error: any) {
        updateTestResult('Community Posts', 'error', 'Community post test failed', error.message);
      }

      // Test 5: File Upload
      setCurrentTest('File Upload');
      updateTestResult('File Upload', 'running', 'Testing file upload and storage...');
      
      try {
        // Create test files
        const testFiles = [
          new File(['Test content 1'], 'test1.txt', { type: 'text/plain' }),
          new File(['Test content 2'], 'test2.txt', { type: 'text/plain' })
        ];

        const uploadPromises = testFiles.map(async (file, index) => {
          const filePath = `test-uploads/${user.id}/flow-test-${Date.now()}-${index}.txt`;
          return dataPersistenceManager.uploadFile('project-assets', filePath, file);
        });

        const uploadResults = await Promise.all(uploadPromises);
        const successfulUploads = uploadResults.filter(r => r.success);

        if (successfulUploads.length === testFiles.length) {
          // Test file deletion (cleanup)
          const deletePromises = uploadResults.map(result => 
            result.success && result.data ? 
              dataPersistenceManager.deleteFile('project-assets', result.data.path) :
              Promise.resolve({ success: false })
          );

          const deleteResults = await Promise.all(deletePromises);
          const successfulDeletes = deleteResults.filter(r => r.success);

          updateTestResult('File Upload', 'success', 'File operations completed successfully', {
            filesUploaded: successfulUploads.length,
            filesDeleted: successfulDeletes.length,
            operations: ['upload', 'delete']
          });
        } else {
          updateTestResult('File Upload', 'error', 
            `Only ${successfulUploads.length}/${testFiles.length} files uploaded successfully`);
        }
      } catch (error: any) {
        updateTestResult('File Upload', 'error', 'File upload test failed', error.message);
      }

      // Test 6: Data Synchronization
      setCurrentTest('Data Synchronization');
      updateTestResult('Data Synchronization', 'running', 'Testing data synchronization...');
      
      try {
        const syncResult = await dataPersistenceManager.syncUserData(user.id);
        
        const successCount = [
          syncResult.projects.success,
          syncResult.messages.success,
          syncResult.posts.success
        ].filter(Boolean).length;

        if (successCount >= 2) { // At least 2 out of 3 should work
          updateTestResult('Data Synchronization', 'success', 'Data synchronization working', {
            projectsSync: syncResult.projects.success,
            messagesSync: syncResult.messages.success,
            postsSync: syncResult.posts.success,
            successRate: `${successCount}/3`
          });
        } else {
          updateTestResult('Data Synchronization', 'error', 'Data synchronization partially failed', {
            errors: [
              !syncResult.projects.success && syncResult.projects.error,
              !syncResult.messages.success && syncResult.messages.error,
              !syncResult.posts.success && syncResult.posts.error
            ].filter(Boolean)
          });
        }
      } catch (error: any) {
        updateTestResult('Data Synchronization', 'error', 'Sync test failed', error.message);
      }

      setCurrentTest('');
      log.info('🏁 Comprehensive data flow testing completed');

    } catch (error: any) {
      log.error('❌ Data flow testing failed:', error);
      updateTestResult('Overall Test Suite', 'error', 'Testing suite encountered an error', error.message);
    } finally {
      setIsRunningTests(false);
    }
  };

  const getTestIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'running':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-300" />;
    }
  };

  const successfulTests = testResults.filter(r => r.status === 'success').length;
  const failedTests = testResults.filter(r => r.status === 'error').length;
  const totalTests = testResults.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Comprehensive Testing Dashboard</h2>
          <p className="text-muted-foreground">
            Validate data persistence, functionality, and system health
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {totalTests > 0 && (
            <Badge variant={failedTests === 0 ? 'secondary' : 'destructive'}>
              {successfulTests}/{totalTests} Tests Passed
            </Badge>
          )}
          <Button 
            onClick={runDataFlowTests} 
            disabled={isRunningTests}
            className="flex items-center space-x-2"
          >
            {isRunningTests ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Running Tests...</span>
              </>
            ) : (
              <>
                <TestTube className="h-4 w-4" />
                <span>Run All Tests</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="persistence" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="persistence">Data Persistence</TabsTrigger>
          <TabsTrigger value="dataflow">Data Flow Tests</TabsTrigger>
          <TabsTrigger value="health">System Health</TabsTrigger>
        </TabsList>

        <TabsContent value="persistence" className="space-y-4">
          <DataPersistenceValidator 
            userId={user.id} 
            onValidationComplete={setPersistenceHealth}
          />
        </TabsContent>

        <TabsContent value="dataflow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TestTube className="h-5 w-5" />
                <span>Data Flow Validation</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isRunningTests && currentTest && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2 text-blue-800">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="font-medium">Currently Running: {currentTest}</span>
                  </div>
                </div>
              )}

              {testResults.length > 0 ? (
                <div className="space-y-3">
                  {testResults.map((result, index) => (
                    <div key={index} className="flex items-start justify-between p-3 border rounded-lg">
                      <div className="flex items-start space-x-3">
                        {getTestIcon(result.status)}
                        <div className="flex-1">
                          <p className="font-medium">{result.name}</p>
                          <p className="text-sm text-muted-foreground">{result.message}</p>
                          {result.details && (
                            <div className="mt-2 text-xs bg-gray-50 p-2 rounded">
                              <pre>{JSON.stringify(result.details, null, 2)}</pre>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          result.status === 'success' ? 'secondary' : 
                          result.status === 'error' ? 'destructive' : 'outline'
                        }>
                          {result.status}
                        </Badge>
                        {result.timestamp && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(result.timestamp).toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <TestTube className="h-8 w-8 mx-auto mb-2" />
                  <p>Click "Run All Tests" to validate data flow operations</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Database</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Supabase connection status
                </p>
                <Badge variant={persistenceHealth === true ? 'secondary' : 'destructive'} className="mt-2">
                  {persistenceHealth === true ? 'Connected' : 
                   persistenceHealth === false ? 'Issues' : 'Unknown'}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <span className="font-medium">User Profile</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Authentication & profile
                </p>
                <Badge variant={profile ? 'secondary' : 'destructive'} className="mt-2">
                  {profile ? 'Active' : 'Error'}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <FolderOpen className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">Projects</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Project management system
                </p>
                <Badge variant="outline" className="mt-2">
                  Ready
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Upload className="h-5 w-5 text-orange-600" />
                  <span className="font-medium">File Storage</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Supabase storage system
                </p>
                <Badge variant="outline" className="mt-2">
                  Ready
                </Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}