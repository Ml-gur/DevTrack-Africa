import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, RefreshCw, Database, AlertTriangle, Loader2 } from 'lucide-react';
import { dataPersistenceManager } from '../utils/supabase/data-persistence-manager';
import { healthService } from '../utils/supabase/database-service';
import { log } from '../utils/production-logger';

interface ValidationResult {
  testName: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: string;
}

interface DataPersistenceValidatorProps {
  userId: string;
  onValidationComplete?: (isHealthy: boolean) => void;
}

export default function DataPersistenceValidator({ 
  userId, 
  onValidationComplete 
}: DataPersistenceValidatorProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [overallHealth, setOverallHealth] = useState<'unknown' | 'healthy' | 'unhealthy'>('unknown');

  const validationTests = [
    'Database Connection',
    'Table Schema Validation',
    'User Profile Access',
    'Project CRUD Operations',
    'Task Management',
    'File Upload System',
    'Data Synchronization'
  ];

  useEffect(() => {
    // Initialize validation results
    setValidationResults(validationTests.map(test => ({
      testName: test,
      status: 'pending',
      message: 'Waiting to run...'
    })));
  }, []);

  const updateTestResult = (testName: string, status: ValidationResult['status'], message: string, details?: string) => {
    setValidationResults(prev => prev.map(result => 
      result.testName === testName 
        ? { ...result, status, message, details }
        : result
    ));
  };

  const runValidation = async () => {
    setIsValidating(true);
    setOverallHealth('unknown');
    let hasErrors = false;

    try {
      log.info('🔍 Starting comprehensive data persistence validation...');

      // Test 1: Database Connection
      updateTestResult('Database Connection', 'pending', 'Testing connection...');
      try {
        const healthCheck = await healthService.checkDatabaseHealth();
        if (healthCheck.success) {
          updateTestResult('Database Connection', 'success', 'Connected successfully');
        } else {
          updateTestResult('Database Connection', 'error', 'Connection failed', healthCheck.error);
          hasErrors = true;
        }
      } catch (error: any) {
        updateTestResult('Database Connection', 'error', 'Connection error', error.message);
        hasErrors = true;
      }

      // Test 2: Table Schema Validation
      updateTestResult('Table Schema Validation', 'pending', 'Validating tables...');
      try {
        const schemaCheck = await healthService.checkDatabaseHealth();
        if (schemaCheck.success && schemaCheck.data?.tables) {
          const expectedTables = ['users', 'projects', 'tasks', 'posts', 'messages'];
          const missingTables = expectedTables.filter(table => 
            !schemaCheck.data.tables.includes(table)
          );
          
          if (missingTables.length === 0) {
            updateTestResult('Table Schema Validation', 'success', 'All required tables found');
          } else {
            updateTestResult('Table Schema Validation', 'error', 
              `Missing tables: ${missingTables.join(', ')}`);
            hasErrors = true;
          }
        } else {
          updateTestResult('Table Schema Validation', 'error', 'Unable to verify schema');
          hasErrors = true;
        }
      } catch (error: any) {
        updateTestResult('Table Schema Validation', 'error', 'Schema validation failed', error.message);
        hasErrors = true;
      }

      // Test 3: User Profile Access
      updateTestResult('User Profile Access', 'pending', 'Testing profile operations...');
      try {
        const profileResult = await dataPersistenceManager.userService.getProfile(userId);
        if (profileResult.success) {
          updateTestResult('User Profile Access', 'success', 'Profile accessible');
        } else {
          updateTestResult('User Profile Access', 'error', 'Profile access failed', profileResult.error);
          hasErrors = true;
        }
      } catch (error: any) {
        updateTestResult('User Profile Access', 'error', 'Profile test failed', error.message);
        hasErrors = true;
      }

      // Test 4: Project CRUD Operations
      updateTestResult('Project CRUD Operations', 'pending', 'Testing project operations...');
      try {
        // Create test project
        const createResult = await dataPersistenceManager.createProject(userId, {
          title: 'Data Validation Test Project',
          description: 'This is a test project for data persistence validation',
          status: 'planning',
          priority: 'low',
          progress: 0,
          visibility: 'private'
        });

        if (createResult.success && createResult.data) {
          const testProjectId = createResult.data.id;

          // Update test project
          const updateResult = await dataPersistenceManager.updateProject(testProjectId, {
            description: 'Updated test project description',
            status: 'in-progress'
          });

          if (updateResult.success) {
            // Delete test project (cleanup)
            const deleteResult = await dataPersistenceManager.deleteProject(testProjectId);
            
            if (deleteResult.success) {
              updateTestResult('Project CRUD Operations', 'success', 'All CRUD operations successful');
            } else {
              updateTestResult('Project CRUD Operations', 'error', 'Delete operation failed', deleteResult.error);
              hasErrors = true;
            }
          } else {
            updateTestResult('Project CRUD Operations', 'error', 'Update operation failed', updateResult.error);
            hasErrors = true;
          }
        } else {
          updateTestResult('Project CRUD Operations', 'error', 'Create operation failed', createResult.error);
          hasErrors = true;
        }
      } catch (error: any) {
        updateTestResult('Project CRUD Operations', 'error', 'CRUD test failed', error.message);
        hasErrors = true;
      }

      // Test 5: Task Management
      updateTestResult('Task Management', 'pending', 'Testing task operations...');
      try {
        // First create a test project for tasks
        const projectResult = await dataPersistenceManager.createProject(userId, {
          title: 'Task Test Project',
          description: 'Project for testing task operations',
          status: 'planning',
          priority: 'low',
          progress: 0,
          visibility: 'private'
        });

        if (projectResult.success && projectResult.data) {
          const testProjectId = projectResult.data.id;

          // Test task creation
          const taskResult = await dataPersistenceManager.createTask(testProjectId, userId, {
            title: 'Test Task',
            description: 'This is a test task',
            status: 'todo',
            priority: 'medium',
            position: 0
          });

          if (taskResult.success && taskResult.data) {
            const testTaskId = taskResult.data.id;

            // Test task update
            const updateTaskResult = await dataPersistenceManager.updateTask(testTaskId, {
              status: 'completed'
            });

            if (updateTaskResult.success) {
              // Cleanup: delete task and project
              await dataPersistenceManager.deleteTask(testTaskId);
              await dataPersistenceManager.deleteProject(testProjectId);
              
              updateTestResult('Task Management', 'success', 'Task operations successful');
            } else {
              updateTestResult('Task Management', 'error', 'Task update failed', updateTaskResult.error);
              hasErrors = true;
            }
          } else {
            updateTestResult('Task Management', 'error', 'Task creation failed', taskResult.error);
            hasErrors = true;
          }
        } else {
          updateTestResult('Task Management', 'error', 'Test project creation failed');
          hasErrors = true;
        }
      } catch (error: any) {
        updateTestResult('Task Management', 'error', 'Task test failed', error.message);
        hasErrors = true;
      }

      // Test 6: File Upload System
      updateTestResult('File Upload System', 'pending', 'Testing file operations...');
      try {
        // Create a small test file
        const testFile = new File(['test file content'], 'test.txt', { type: 'text/plain' });
        const testFilePath = `test-uploads/${userId}/validation-test-${Date.now()}.txt`;

        const uploadResult = await dataPersistenceManager.uploadFile('project-assets', testFilePath, testFile);
        
        if (uploadResult.success && uploadResult.data) {
          // Test file deletion (cleanup)
          const deleteResult = await dataPersistenceManager.deleteFile('project-assets', testFilePath);
          
          if (deleteResult.success) {
            updateTestResult('File Upload System', 'success', 'File operations successful');
          } else {
            updateTestResult('File Upload System', 'error', 'File deletion failed', deleteResult.error);
            hasErrors = true;
          }
        } else {
          updateTestResult('File Upload System', 'error', 'File upload failed', uploadResult.error);
          hasErrors = true;
        }
      } catch (error: any) {
        updateTestResult('File Upload System', 'error', 'File system test failed', error.message);
        hasErrors = true;
      }

      // Test 7: Data Synchronization
      updateTestResult('Data Synchronization', 'pending', 'Testing data sync...');
      try {
        const syncResult = await dataPersistenceManager.syncUserData(userId);
        
        if (syncResult.projects.success || syncResult.messages.success || syncResult.posts.success) {
          updateTestResult('Data Synchronization', 'success', 'Data sync operational');
        } else {
          updateTestResult('Data Synchronization', 'error', 'Data sync failed');
          hasErrors = true;
        }
      } catch (error: any) {
        updateTestResult('Data Synchronization', 'error', 'Sync test failed', error.message);
        hasErrors = true;
      }

      // Set overall health status
      const finalHealth = hasErrors ? 'unhealthy' : 'healthy';
      setOverallHealth(finalHealth);
      
      if (onValidationComplete) {
        onValidationComplete(finalHealth === 'healthy');
      }

      log.info(`🏁 Data persistence validation completed. Status: ${finalHealth}`);

    } catch (error: any) {
      log.error('❌ Validation process failed:', error);
      setOverallHealth('unhealthy');
      
      if (onValidationComplete) {
        onValidationComplete(false);
      }
    } finally {
      setIsValidating(false);
    }
  };

  const getStatusIcon = (status: ValidationResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return isValidating ? 
          <Loader2 className="h-4 w-4 text-blue-600 animate-spin" /> :
          <div className="h-4 w-4 rounded-full bg-gray-300" />;
    }
  };

  const getStatusBadge = (status: ValidationResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Passed</Badge>;
      case 'error':
        return <Badge variant="destructive">Failed</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const getOverallHealthIcon = () => {
    switch (overallHealth) {
      case 'healthy':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'unhealthy':
        return <XCircle className="h-6 w-6 text-red-600" />;
      default:
        return <Database className="h-6 w-6 text-gray-600" />;
    }
  };

  const passedTests = validationResults.filter(r => r.status === 'success').length;
  const totalTests = validationResults.length;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            {getOverallHealthIcon()}
            <span>Data Persistence Validation</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            {overallHealth !== 'unknown' && (
              <Badge variant={overallHealth === 'healthy' ? 'secondary' : 'destructive'}>
                {passedTests}/{totalTests} Tests Passed
              </Badge>
            )}
            <Button 
              onClick={runValidation} 
              disabled={isValidating}
              size="sm"
              variant="outline"
            >
              {isValidating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Run Validation
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {overallHealth === 'unhealthy' && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Data Persistence Issues Detected</span>
            </div>
            <p className="text-sm text-red-700 mt-1">
              Some validation tests failed. Please check the database configuration and connectivity.
            </p>
          </div>
        )}

        {overallHealth === 'healthy' && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">Data Persistence Validated</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              All tests passed. Your data will be reliably stored and retrieved from the database.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {validationResults.map((result, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(result.status)}
                <div>
                  <p className="font-medium">{result.testName}</p>
                  <p className="text-sm text-muted-foreground">{result.message}</p>
                  {result.details && (
                    <p className="text-xs text-red-600 mt-1">{result.details}</p>
                  )}
                </div>
              </div>
              {getStatusBadge(result.status)}
            </div>
          ))}
        </div>

        {overallHealth === 'unknown' && !isValidating && (
          <div className="mt-4 p-4 text-center text-muted-foreground">
            <Database className="h-8 w-8 mx-auto mb-2" />
            <p>Click "Run Validation" to test data persistence</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}