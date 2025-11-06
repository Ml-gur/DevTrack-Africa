import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Shield,
  Users,
  MessageSquare,
  Database,
  Zap,
  Gauge,
  Upload,
  Timer,
  MousePointer,
  Keyboard
} from 'lucide-react';
import { validateCriticalFunctionality, productionTaskTimer } from '../utils/production-audit';
import { getDemoMode } from '../utils/supabase/client';

interface TestStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  details?: string;
  manual?: boolean;
  instructions?: string[];
}

interface TestSuite {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  steps: TestStep[];
  critical: boolean;
}

export default function CriticalFunctionalityTester() {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([
    {
      id: 'auth',
      name: 'Authentication System',
      icon: <Shield className="w-5 h-5" />,
      description: 'User registration, login, logout, and session management',
      critical: true,
      steps: [
        {
          id: 'auth-1',
          name: 'User Registration',
          description: 'Test complete user registration flow',
          status: 'pending',
          manual: true,
          instructions: [
            'Navigate to registration page',
            'Fill in all required fields',
            'Submit form and verify email confirmation',
            'Complete profile setup'
          ]
        },
        {
          id: 'auth-2', 
          name: 'User Login',
          description: 'Test user login with valid credentials',
          status: 'pending',
          manual: true,
          instructions: [
            'Navigate to login page',
            'Enter valid credentials',
            'Verify successful authentication',
            'Check dashboard loads correctly'
          ]
        },
        {
          id: 'auth-3',
          name: 'Session Persistence',
          description: 'Verify session persists across page refreshes',
          status: 'pending',
          manual: true,
          instructions: [
            'Login to application',
            'Refresh the page',
            'Verify user remains logged in',
            'Check all data persists'
          ]
        },
        {
          id: 'auth-4',
          name: 'Password Reset',
          description: 'Test password reset functionality',
          status: 'pending',
          manual: true,
          instructions: [
            'Navigate to login page',
            'Click "Forgot Password"',
            'Enter email address',
            'Verify reset email is sent'
          ]
        }
      ]
    },
    {
      id: 'kanban',
      name: 'Kanban Board System',
      icon: <Gauge className="w-5 h-5" />,
      description: 'Task management with drag-and-drop functionality',
      critical: true,
      steps: [
        {
          id: 'kanban-1',
          name: 'Task Creation',
          description: 'Create new tasks in different columns',
          status: 'pending',
          manual: true,
          instructions: [
            'Open a project with tasks',
            'Click "Add Task" button',
            'Fill in task details',
            'Verify task appears in correct column'
          ]
        },
        {
          id: 'kanban-2',
          name: 'Drag and Drop',
          description: 'Move tasks between columns using drag and drop',
          status: 'pending',
          manual: true,
          instructions: [
            'Open project with tasks',
            'Drag a task from "To Do" to "In Progress"',
            'Verify task moves correctly',
            'Check timer starts automatically'
          ]
        },
        {
          id: 'kanban-3',
          name: 'Task Editing',
          description: 'Edit task details and properties',
          status: 'pending',
          manual: true,
          instructions: [
            'Click on any task card',
            'Modify task title and description',
            'Change priority or estimated hours',
            'Save changes and verify updates'
          ]
        },
        {
          id: 'kanban-4',
          name: 'Bulk Operations',
          description: 'Test multi-select and bulk actions',
          status: 'pending',
          manual: true,
          instructions: [
            'Enable multi-select mode',
            'Select multiple tasks',
            'Perform bulk status change',
            'Verify all selected tasks updated'
          ]
        }
      ]
    },
    {
      id: 'timer',
      name: 'Task Timer System',
      icon: <Timer className="w-5 h-5" />,
      description: 'Automatic time tracking for tasks in progress',
      critical: true,
      steps: [
        {
          id: 'timer-1',
          name: 'Auto-Start Timer',
          description: 'Timer starts when task moves to "In Progress"',
          status: 'pending',
          manual: true,
          instructions: [
            'Create or find a task in "To Do"',
            'Drag task to "In Progress" column',
            'Verify timer starts automatically',
            'Check timer icon appears on task'
          ]
        },
        {
          id: 'timer-2',
          name: 'Auto-Stop Timer',
          description: 'Timer stops when task moves to "Completed"',
          status: 'pending',
          manual: true,
          instructions: [
            'Find a task with active timer',
            'Drag task to "Completed" column',
            'Verify timer stops automatically',
            'Check time is recorded in task details'
          ]
        },
        {
          id: 'timer-3',
          name: 'Time Accumulation',
          description: 'Verify time accumulates correctly',
          status: 'pending',
          manual: true,
          instructions: [
            'Start timer on a task',
            'Wait for 1-2 minutes',
            'Move task back and forth between columns',
            'Verify total time accumulates correctly'
          ]
        },
        {
          id: 'timer-4',
          name: 'Project Total Time',
          description: 'Project shows cumulative time from all tasks',
          status: 'pending',
          manual: true,
          instructions: [
            'Complete several tasks with time tracked',
            'Check project overview',
            'Verify total time equals sum of all task times',
            'Check time displays correctly formatted'
          ]
        }
      ]
    },
    {
      id: 'collaboration',
      name: 'Collaboration Features',
      icon: <Users className="w-5 h-5" />,
      description: 'Team collaboration and project sharing',
      critical: false,
      steps: [
        {
          id: 'collab-1',
          name: 'Invite Collaborators',
          description: 'Send invitations to team members',
          status: 'pending',
          manual: true,
          instructions: [
            'Open project collaboration tab',
            'Enter email address',
            'Select role (editor/viewer/admin)',
            'Send invitation and verify demo notification'
          ]
        },
        {
          id: 'collab-2',
          name: 'Manage Permissions',
          description: 'Change collaborator roles and permissions',
          status: 'pending',
          manual: true,
          instructions: [
            'View existing collaborators',
            'Change someone\'s role',
            'Remove a collaborator',
            'Verify permission changes take effect'
          ]
        }
      ]
    },
    {
      id: 'messaging',
      name: 'Real-time Messaging',
      icon: <MessageSquare className="w-5 h-5" />,
      description: 'Chat and communication system',
      critical: true,
      steps: [
        {
          id: 'msg-1',
          name: 'Send Messages',
          description: 'Send and receive messages',
          status: 'pending',
          manual: true,
          instructions: [
            'Navigate to messaging section',
            'Start or open a conversation',
            'Send a message',
            'Verify message appears in chat'
          ]
        },
        {
          id: 'msg-2',
          name: 'Real-time Updates',
          description: 'Messages update in real-time',
          status: 'pending',
          manual: true,
          instructions: [
            'Open messaging in two browser tabs (simulate two users)',
            'Send message from one tab',
            'Verify message appears in other tab immediately',
            'Check notification badge updates'
          ]
        }
      ]
    },
    {
      id: 'community',
      name: 'Community Features',
      icon: <Users className="w-5 h-5" />,
      description: 'Project showcase and social interactions',
      critical: false,
      steps: [
        {
          id: 'community-1',
          name: 'Create Progress Post',
          description: 'Share project progress with community',
          status: 'pending',
          manual: true,
          instructions: [
            'Navigate to community section',
            'Click "Create Post" or similar',
            'Share project progress update',
            'Verify post appears in community feed'
          ]
        },
        {
          id: 'community-2',
          name: 'Social Interactions',
          description: 'Like and comment on posts',
          status: 'pending',
          manual: true,
          instructions: [
            'Find posts in community feed',
            'Like a post',
            'Add a comment',
            'Verify interactions are recorded'
          ]
        }
      ]
    },
    {
      id: 'files',
      name: 'File Upload System',
      icon: <Upload className="w-5 h-5" />,
      description: 'Project file and resource management',
      critical: false,
      steps: [
        {
          id: 'files-1',
          name: 'Upload Files',
          description: 'Upload various file types',
          status: 'pending',
          manual: true,
          instructions: [
            'Navigate to project files tab',
            'Upload an image file',
            'Upload a document (PDF/DOC)',
            'Verify files appear in file list'
          ]
        },
        {
          id: 'files-2',
          name: 'File Management',
          description: 'Manage uploaded files',
          status: 'pending',
          manual: true,
          instructions: [
            'View uploaded files',
            'Download a file',
            'Delete a file',
            'Verify all operations work correctly'
          ]
        }
      ]
    }
  ]);

  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<any>(null);

  const runAutomatedTests = async () => {
    setCurrentTest('automated');
    
    try {
      const results = await validateCriticalFunctionality();
      setTestResults(results);
      
      // Update automated test statuses
      setTestSuites(prev => prev.map(suite => {
        if (suite.id === 'auth') {
          return {
            ...suite,
            steps: suite.steps.map(step => ({
              ...step,
              status: results.authWorks ? 'passed' : 'failed'
            }))
          };
        }
        if (suite.id === 'timer') {
          return {
            ...suite,
            steps: suite.steps.map(step => ({
              ...step,
              status: results.timerWorks ? 'passed' : 'failed'
            }))
          };
        }
        return suite;
      }));
      
    } catch (error) {
      console.error('Automated test error:', error);
    } finally {
      setCurrentTest(null);
    }
  };

  const markStepAs = (suiteId: string, stepId: string, status: 'passed' | 'failed') => {
    setTestSuites(prev => prev.map(suite => 
      suite.id === suiteId 
        ? {
            ...suite,
            steps: suite.steps.map(step =>
              step.id === stepId ? { ...step, status } : step
            )
          }
        : suite
    ));
  };

  const getOverallStatus = (suite: TestSuite) => {
    const passedSteps = suite.steps.filter(s => s.status === 'passed').length;
    const failedSteps = suite.steps.filter(s => s.status === 'failed').length;
    const totalSteps = suite.steps.length;
    
    if (failedSteps > 0) return 'failed';
    if (passedSteps === totalSteps) return 'passed';
    return 'pending';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running': return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default: return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const criticalSuites = testSuites.filter(s => s.critical);
  const nonCriticalSuites = testSuites.filter(s => !s.critical);

  const allCriticalPassed = criticalSuites.every(suite => getOverallStatus(suite) === 'passed');
  const someCriticalFailed = criticalSuites.some(suite => getOverallStatus(suite) === 'failed');

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">DevTrack Africa Functionality Tester</h1>
        <p className="text-muted-foreground">
          Comprehensive testing of all critical features for production readiness
        </p>
        
        <div className="flex justify-center gap-4">
          <Button onClick={runAutomatedTests} disabled={currentTest === 'automated'}>
            {currentTest === 'automated' ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Running Tests...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Automated Tests
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      {testResults && (
        <Alert className={allCriticalPassed ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
          <AlertDescription className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {allCriticalPassed ? 
                <CheckCircle className="w-5 h-5 text-green-500" /> : 
                <XCircle className="w-5 h-5 text-red-500" />
              }
              <span className="font-semibold">
                {allCriticalPassed ? 
                  '🎉 All Critical Features Working!' : 
                  '❌ Critical Issues Found'
                }
              </span>
            </div>
            <Badge className={allCriticalPassed ? 'bg-green-500' : 'bg-red-500'}>
              {allCriticalPassed ? 'PRODUCTION READY' : 'NEEDS FIXES'}
            </Badge>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="critical" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="critical">Critical Features</TabsTrigger>
          <TabsTrigger value="enhanced">Enhanced Features</TabsTrigger>
        </TabsList>

        <TabsContent value="critical" className="space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold mb-2">Critical Production Features</h2>
            <p className="text-muted-foreground">
              These features MUST work perfectly before production deployment
            </p>
          </div>

          {criticalSuites.map((suite) => (
            <Card key={suite.id} className={`border-2 ${
              getOverallStatus(suite) === 'passed' ? 'border-green-200' :
              getOverallStatus(suite) === 'failed' ? 'border-red-200' :
              'border-yellow-200'
            }`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  {suite.icon}
                  <span className="flex-1">{suite.name}</span>
                  {getStatusIcon(getOverallStatus(suite))}
                  <Badge variant="destructive" className="text-xs">CRITICAL</Badge>
                </CardTitle>
                <CardDescription>{suite.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {suite.steps.map((step) => (
                    <div key={step.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusIcon(step.status)}
                            <span className="font-medium">{step.name}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                        
                        {step.manual && (
                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markStepAs(suite.id, step.id, 'passed')}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markStepAs(suite.id, step.id, 'failed')}
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {step.instructions && (
                        <div className="mt-3 p-3 bg-muted rounded text-sm">
                          <strong>Test Instructions:</strong>
                          <ol className="mt-2 space-y-1 ml-4">
                            {step.instructions.map((instruction, i) => (
                              <li key={i} className="list-decimal">{instruction}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="enhanced" className="space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold mb-2">Enhanced Features</h2>
            <p className="text-muted-foreground">
              Additional features that improve user experience
            </p>
          </div>

          {nonCriticalSuites.map((suite) => (
            <Card key={suite.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  {suite.icon}
                  <span className="flex-1">{suite.name}</span>
                  {getStatusIcon(getOverallStatus(suite))}
                </CardTitle>
                <CardDescription>{suite.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {suite.steps.map((step) => (
                    <div key={step.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusIcon(step.status)}
                            <span className="font-medium">{step.name}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markStepAs(suite.id, step.id, 'passed')}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markStepAs(suite.id, step.id, 'failed')}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {step.instructions && (
                        <div className="mt-3 p-3 bg-muted rounded text-sm">
                          <strong>Test Instructions:</strong>
                          <ol className="mt-2 space-y-1 ml-4">
                            {step.instructions.map((instruction, i) => (
                              <li key={i} className="list-decimal">{instruction}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Production Requirements */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>🔥 PRODUCTION REQUIREMENTS - NO COMPROMISES 🔥</strong>
          <br /><br />
          <strong>CRITICAL FEATURES (MUST BE 100% FUNCTIONAL):</strong>
          <br />• Authentication (registration, login, logout, session persistence)
          <br />• Kanban board (task creation, drag-drop, editing)
          <br />• Timer system (auto-start on "In Progress", auto-stop on "Completed")
          <br />• Real-time messaging (send/receive messages, notifications)
          <br /><br />
          <strong>TESTING APPROACH:</strong>
          <br />• Test each feature manually following the provided instructions
          <br />• Mark each test step as PASS or FAIL
          <br />• All critical features must show PASS before production
          <br />• Enhanced features should work but are not deployment blockers
          <br /><br />
          🎯 <strong>GOAL:</strong> Achieve 100% PASS rate on all critical features.
        </AlertDescription>
      </Alert>
    </div>
  );
}