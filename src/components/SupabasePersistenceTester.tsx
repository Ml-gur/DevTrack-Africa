import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, XCircle, Loader2, Database, AlertTriangle, RefreshCw } from 'lucide-react';
import { 
  validateDatabaseConnection,
  enhancedUserService,
  enhancedProjectService,
  enhancedTaskService,
  syncUserData 
} from '../utils/supabase/enhanced-persistence';
import { log } from '../utils/production-logger';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message: string;
  details?: any;
  timestamp?: Date;
}

interface SupabasePersistenceTesterProps {
  user: any;
  onTestComplete?: (allPassed: boolean) => void;
}

export default function SupabasePersistenceTester({ user, onTestComplete }: SupabasePersistenceTesterProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [overallStatus, setOverallStatus] = useState<'unknown' | 'success' | 'error'>('unknown');

  const updateTest = (name: string, status: TestResult['status'], message: string, details?: any) => {
    setTestResults(prev => {
      const existing = prev.find(t => t.name === name);
      const newTest: TestResult = {
        name,
        status,
        message,
        details,
        timestamp: new Date()
      };

      if (existing) {
        return prev.map(t => t.name === name ? newTest : t);
      } else {
        return [...prev, newTest];
      }
    });
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    setOverallStatus('unknown');

    log.info('🧪 Starting Supabase persistence testing suite...');

    try {
      // Test 1: Database Connection
      updateTest('Database Connection', 'running', 'Validating database connection...');
      const connectionResult = await validateDatabaseConnection();
      
      if (connectionResult.success) {
        updateTest('Database Connection', 'success', 'Connection validated successfully');
      } else {
        updateTest('Database Connection', 'error', connectionResult.error?.message || 'Connection failed', connectionResult.error);
        // If connection fails, skip other tests
        setOverallStatus('error');
        if (onTestComplete) onTestComplete(false);
        return;
      }

      // Test 2: User Profile Operations
      updateTest('User Profile Operations', 'running', 'Testing profile persistence...');
      try {
        const profileResult = await enhancedUserService.ensureUserProfile(user);
        
        if (profileResult.success) {
          // Test profile update
          const updateResult = await enhancedUserService.updateUserProfile(user.id, {
            bio: `Test bio updated at ${new Date().toISOString()}`,
            title: 'Test Developer'
          });
          
          if (updateResult.success) {
            updateTest('User Profile Operations', 'success', 'Profile operations working correctly');
          } else {
            updateTest('User Profile Operations', 'error', updateResult.error?.message || 'Profile update failed');
          }
        } else {
          updateTest('User Profile Operations', 'error', profileResult.error?.message || 'Profile operations failed');
        }
      } catch (error: any) {
        updateTest('User Profile Operations', 'error', `Profile test failed: ${error.message}`);
      }

      // Test 3: Project CRUD Operations
      updateTest('Project CRUD Operations', 'running', 'Testing project persistence...');
      try {
        // Create test project
        const testProjectData = {
          title: `Test Project ${Date.now()}`,
          description: 'This is a test project for persistence validation',
          status: 'planning',
          priority: 'low',
          progress: 0,
          visibility: 'private'
        };

        const createResult = await enhancedProjectService.createProject(user.id, testProjectData);
        
        if (createResult.success && createResult.data) {
          const testProjectId = createResult.data.id;

          // Test project update
          const updateResult = await enhancedProjectService.updateProject(testProjectId, {
            description: 'Updated test project description',
            status: 'in-progress',
            progress: 50
          });

          if (updateResult.success) {
            // Test project retrieval
            const projectsResult = await enhancedProjectService.getUserProjects(user.id);
            const projectExists = projectsResult.success && 
              projectsResult.data?.some((p: any) => p.id === testProjectId);

            if (projectExists) {
              updateTest('Project CRUD Operations', 'success', 'All project operations successful', {
                operations: ['create', 'update', 'retrieve'],
                projectId: testProjectId
              });

              // Cleanup: Delete test project
              try {
                const { supabase } = await import('../utils/supabase/client');
                if (supabase) {
                  await supabase.from('projects').delete().eq('id', testProjectId);
                  log.info('🧹 Test project cleaned up');
                }
              } catch (cleanupError) {
                log.warn('⚠️ Failed to cleanup test project:', cleanupError);
              }
            } else {
              updateTest('Project CRUD Operations', 'error', 'Project retrieval failed after creation');
            }
          } else {
            updateTest('Project CRUD Operations', 'error', updateResult.error?.message || 'Project update failed');
          }
        } else {
          updateTest('Project CRUD Operations', 'error', createResult.error?.message || 'Project creation failed');
        }
      } catch (error: any) {
        updateTest('Project CRUD Operations', 'error', `Project operations failed: ${error.message}`);
      }

      // Test 4: Task Operations
      updateTest('Task Operations', 'running', 'Testing task persistence...');
      try {
        // First create a test project for tasks
        const taskTestProject = await enhancedProjectService.createProject(user.id, {
          title: `Task Test Project ${Date.now()}`,
          description: 'Project for testing task operations',
          status: 'planning',
          priority: 'low',
          progress: 0,
          visibility: 'private'
        });

        if (taskTestProject.success && taskTestProject.data) {
          const testProjectId = taskTestProject.data.id;

          // Test task creation
          const taskResult = await enhancedTaskService.createTask({
            project_id: testProjectId,
            user_id: user.id,
            title: 'Test Task',
            description: 'This is a test task',
            status: 'todo',
            priority: 'medium',
            position: 0,
            time_spent: 0
          });

          if (taskResult.success && taskResult.data) {
            const testTaskId = taskResult.data.id;

            // Test task update
            const updateTaskResult = await enhancedTaskService.updateTask(testTaskId, {
              status: 'completed',
              time_spent: 120
            });

            if (updateTaskResult.success) {
              updateTest('Task Operations', 'success', 'Task operations successful', {
                operations: ['create', 'update'],
                taskId: testTaskId
              });
            } else {
              updateTest('Task Operations', 'error', updateTaskResult.error?.message || 'Task update failed');
            }

            // Cleanup
            try {
              const { supabase } = await import('../utils/supabase/client');
              if (supabase) {
                await supabase.from('projects').delete().eq('id', testProjectId);
              }
            } catch (cleanupError) {
              log.warn('⚠️ Failed to cleanup test project for tasks:', cleanupError);
            }
          } else {
            updateTest('Task Operations', 'error', taskResult.error?.message || 'Task creation failed');
          }
        } else {
          updateTest('Task Operations', 'error', 'Test project creation failed for task tests');
        }
      } catch (error: any) {
        updateTest('Task Operations', 'error', `Task operations failed: ${error.message}`);
      }

      // Test 5: Data Synchronization
      updateTest('Data Synchronization', 'running', 'Testing data sync...');
      try {
        const syncResult = await syncUserData(user.id);
        
        if (syncResult.overallSuccess) {
          updateTest('Data Synchronization', 'success', 'Data synchronization working correctly');
        } else {
          const errors = [];
          if (!syncResult.profile.success) errors.push('Profile sync failed');
          if (!syncResult.projects.success) errors.push('Projects sync failed');
          
          updateTest('Data Synchronization', 'error', `Partial sync failure: ${errors.join(', ')}`);
        }
      } catch (error: any) {
        updateTest('Data Synchronization', 'error', `Sync test failed: ${error.message}`);
      }

      // Determine overall status
      const hasErrors = testResults.some(t => t.status === 'error');
      const finalStatus = hasErrors ? 'error' : 'success';
      setOverallStatus(finalStatus);

      if (onTestComplete) {
        onTestComplete(finalStatus === 'success');
      }

      log.info(`🏁 Persistence testing completed with status: ${finalStatus}`);

    } catch (error: any) {
      log.error('❌ Testing suite encountered an error:', error);
      setOverallStatus('error');
      
      if (onTestComplete) {
        onTestComplete(false);
      }
    } finally {
      setIsRunning(false);
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

  const passedTests = testResults.filter(t => t.status === 'success').length;
  const totalTests = testResults.length;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Supabase Persistence Tester</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              {overallStatus !== 'unknown' && (
                <Badge variant={overallStatus === 'success' ? 'secondary' : 'destructive'}>
                  {passedTests}/{totalTests} Tests Passed
                </Badge>
              )}
              <Button 
                onClick={runAllTests} 
                disabled={isRunning}
                size="sm"
                variant="outline"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Run Tests
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {overallStatus === 'success' && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-green-800">
                All persistence tests passed! Your data will be reliably stored and retrieved from Supabase.
              </AlertDescription>
            </Alert>
          )}

          {overallStatus === 'error' && (
            <Alert className="mb-4" variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Some tests failed. Please check your Supabase configuration and database setup.
              </AlertDescription>
            </Alert>
          )}

          {testResults.length > 0 ? (
            <div className="space-y-3">
              {testResults.map((test, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-start space-x-3">
                    {getTestIcon(test.status)}
                    <div className="flex-1">
                      <p className="font-medium">{test.name}</p>
                      <p className="text-sm text-muted-foreground">{test.message}</p>
                      {test.details && test.status === 'error' && (
                        <details className="mt-2">
                          <summary className="text-xs cursor-pointer text-red-600">View Error Details</summary>
                          <pre className="mt-1 text-xs bg-red-50 p-2 rounded overflow-auto">
                            {JSON.stringify(test.details, null, 2)}
                          </pre>
                        </details>
                      )}
                      {test.details && test.status === 'success' && (
                        <div className="mt-1 text-xs text-green-600">
                          {Array.isArray(test.details?.operations) && 
                            `Operations: ${test.details.operations.join(', ')}`}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      test.status === 'success' ? 'secondary' : 
                      test.status === 'error' ? 'destructive' : 
                      test.status === 'running' ? 'outline' : 'outline'
                    }>
                      {test.status}
                    </Badge>
                    {test.timestamp && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {test.timestamp.toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="h-8 w-8 mx-auto mb-2" />
              <p>Click "Run Tests" to validate Supabase persistence</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}