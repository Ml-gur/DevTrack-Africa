import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { DevTrackTestingSuite, consoleTestCommands } from '../utils/automated-testing-suite';
import CriticalFunctionalityTester from './CriticalFunctionalityTester';
import { Play, RefreshCw, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface TestResult {
  testName: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  error?: any;
  duration: number;
}

interface TestSuite {
  suiteName: string;
  tests: TestResult[];
  totalTime: number;
  passCount: number;
  failCount: number;
  skipCount: number;
}

export default function TestingDashboard() {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestSuite[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);

  const addToConsole = (message: string) => {
    setConsoleOutput(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runFullTestSuite = async () => {
    setIsRunning(true);
    setTestResults([]);
    setSummary(null);
    setConsoleOutput([]);
    
    addToConsole('Starting DevTrack Africa Automated Testing Suite...');
    
    try {
      const testSuite = new DevTrackTestingSuite();
      const results = await testSuite.runAllTests();
      
      setTestResults(results.suites);
      setSummary(results.summary);
      addToConsole(`Testing completed. Overall status: ${results.summary.overallStatus}`);
    } catch (error) {
      addToConsole(`Test suite failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const runQuickDatabaseTest = async () => {
    addToConsole('Running quick database connectivity test...');
    try {
      const result = await consoleTestCommands.testDatabase();
      addToConsole(`Database test: ${result.error ? 'FAILED' : 'PASSED'}`);
    } catch (error) {
      addToConsole(`Database test failed: ${error}`);
    }
  };

  const runAuthTest = async () => {
    addToConsole('Testing authentication state...');
    try {
      const result = await consoleTestCommands.testCurrentUser();
      addToConsole(`Auth test: ${result.error ? 'FAILED' : 'PASSED'} - User: ${result.data.user?.email || 'None'}`);
    } catch (error) {
      addToConsole(`Auth test failed: ${error}`);
    }
  };

  const runProjectsTest = async () => {
    addToConsole('Testing projects functionality...');
    try {
      const result = await consoleTestCommands.testProjects();
      addToConsole(`Projects test: ${result.error ? 'FAILED' : 'PASSED'} - Found ${result.data?.length || 0} projects`);
    } catch (error) {
      addToConsole(`Projects test failed: ${error}`);
    }
  };

  const runPostsTest = async () => {
    addToConsole('Testing community posts...');
    try {
      const result = await consoleTestCommands.testPosts();
      addToConsole(`Posts test: ${result.error ? 'FAILED' : 'PASSED'} - Found ${result.data?.length || 0} posts`);
    } catch (error) {
      addToConsole(`Posts test failed: ${error}`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'FAIL': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'SKIP': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PASS': return <Badge variant="default" className="bg-green-500">PASS</Badge>;
      case 'FAIL': return <Badge variant="destructive">FAIL</Badge>;
      case 'SKIP': return <Badge variant="secondary">SKIP</Badge>;
      default: return <Badge variant="outline">PENDING</Badge>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">DevTrack Testing Dashboard</h1>
          <p className="text-muted-foreground">
            Automated testing suite for DevTrack Africa functionality verification
          </p>
        </div>
        <Button 
          onClick={runFullTestSuite} 
          disabled={isRunning}
          size="lg"
          className="gap-2"
        >
          {isRunning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Running Tests...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Run Full Test Suite
            </>
          )}
        </Button>
      </div>

      {summary && (
        <Alert className={summary.overallStatus === 'PASS' ? 'border-green-500' : 'border-red-500'}>
          <AlertDescription className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {getStatusIcon(summary.overallStatus)}
              <span className="font-semibold">
                Overall Status: {summary.overallStatus}
              </span>
            </div>
            <div className="text-sm">
              {summary.totalPassed}/{summary.totalTests} tests passed ({summary.passRate.toFixed(1)}%)
            </div>
            <div className="text-sm">
              Time: {summary.totalTime}ms
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="critical-testing" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="critical-testing">Critical Testing</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="quick-tests">Quick Tests</TabsTrigger>
          <TabsTrigger value="detailed-results">Detailed Results</TabsTrigger>
          <TabsTrigger value="console">Console Output</TabsTrigger>
        </TabsList>

        <TabsContent value="critical-testing">
          <CriticalFunctionalityTester />
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary.totalTests}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Passed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{summary.totalPassed}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Failed</CardTitle>
                  <XCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{summary.totalFailed}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Skipped</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{summary.totalSkipped}</div>
                </CardContent>
              </Card>
            </div>
          )}

          {testResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Test Suites Overview</CardTitle>
                <CardDescription>Summary of all test suite results</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {testResults.map((suite, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{suite.suiteName}</h3>
                      <div className="flex gap-2">
                        {getStatusBadge(suite.failCount > 0 ? 'FAIL' : 'PASS')}
                        <span className="text-sm text-muted-foreground">{suite.totalTime}ms</span>
                      </div>
                    </div>
                    <Progress 
                      value={(suite.passCount / suite.tests.length) * 100} 
                      className="mb-2"
                    />
                    <div className="text-sm text-muted-foreground">
                      {suite.passCount} passed, {suite.failCount} failed, {suite.skipCount} skipped
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="quick-tests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Verification Tests</CardTitle>
              <CardDescription>
                Run individual tests to quickly verify specific functionality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button onClick={runQuickDatabaseTest} variant="outline" className="gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Test Database Connection
                </Button>
                
                <Button onClick={runAuthTest} variant="outline" className="gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Test Authentication
                </Button>
                
                <Button onClick={runProjectsTest} variant="outline" className="gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Test Projects
                </Button>
                
                <Button onClick={runPostsTest} variant="outline" className="gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Test Community Posts
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed-results" className="space-y-6">
          {testResults.map((suite, suiteIndex) => (
            <Card key={suiteIndex}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {suite.suiteName}
                  {getStatusBadge(suite.failCount > 0 ? 'FAIL' : 'PASS')}
                </CardTitle>
                <CardDescription>
                  {suite.tests.length} tests • {suite.totalTime}ms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {suite.tests.map((test, testIndex) => (
                    <div key={testIndex} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(test.status)}
                        <div>
                          <p className="font-medium">{test.testName}</p>
                          <p className="text-sm text-muted-foreground">{test.message}</p>
                          {test.error && (
                            <details className="mt-2">
                              <summary className="text-xs text-red-500 cursor-pointer">Show Error</summary>
                              <pre className="text-xs mt-1 p-2 bg-red-50 rounded overflow-auto">
                                {JSON.stringify(test.error, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {test.duration}ms
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="console" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Console Output</CardTitle>
              <CardDescription>Real-time testing output and logs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-96 overflow-auto">
                {consoleOutput.length === 0 ? (
                  <p>No console output yet. Run tests to see logs here.</p>
                ) : (
                  consoleOutput.map((line, index) => (
                    <div key={index} className="mb-1">{line}</div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Testing Instructions:</strong>
          <br />
          1. Ensure your Supabase project is connected and configured
          <br />
          2. Run the full test suite to verify all functionality
          <br />
          3. Check the detailed results for any failures
          <br />
          4. Use quick tests to verify specific components
          <br />
          5. Review console output for debugging information
        </AlertDescription>
      </Alert>
    </div>
  );
}