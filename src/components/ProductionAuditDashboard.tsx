import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Play, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Shield, 
  Zap,
  Users,
  MessageSquare,
  Database,
  Gauge,
  Rocket
} from 'lucide-react';
import { productionAuditor, validateCriticalFunctionality, ProductionAudit, AuditResult } from '../utils/production-audit';

export default function ProductionAuditDashboard() {
  const [isRunning, setIsRunning] = useState(false);
  const [auditResults, setAuditResults] = useState<ProductionAudit[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [criticalValidation, setCriticalValidation] = useState<any>(null);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);

  const addToConsole = (message: string) => {
    setConsoleOutput(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runFullProductionAudit = async () => {
    setIsRunning(true);
    setAuditResults([]);
    setSummary(null);
    setConsoleOutput([]);

    addToConsole('🔥 STARTING DEVTRACK AFRICA PRODUCTION AUDIT 🔥');
    addToConsole('This audit ensures the platform meets gold standard production requirements');

    try {
      // Run comprehensive audit
      const auditResult = await productionAuditor.runFullAudit();
      setAuditResults(auditResult.results);
      setSummary(auditResult.summary);

      // Run critical functionality validation
      addToConsole('Running critical functionality validation...');
      const validation = await validateCriticalFunctionality();
      setCriticalValidation(validation);

      if (auditResult.summary.overallStatus === 'PASS') {
        addToConsole('🎉 ALL SYSTEMS GO! DevTrack Africa is production-ready! 🎉');
      } else if (auditResult.summary.overallStatus === 'WARNING') {
        addToConsole('⚠️ Production ready with warnings. Review recommendations.');
      } else {
        addToConsole('❌ CRITICAL ISSUES FOUND. Must fix before production deployment.');
      }

      validation.errors.forEach(error => addToConsole(`ERROR: ${error}`));

    } catch (error) {
      addToConsole(`❌ Audit failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const runQuickValidation = async () => {
    addToConsole('Running quick production validation...');
    try {
      const validation = await validateCriticalFunctionality();
      setCriticalValidation(validation);
      
      const workingFeatures = Object.entries(validation)
        .filter(([key, value]) => key !== 'errors' && value === true)
        .map(([key]) => key);
      
      addToConsole(`✅ Working features: ${workingFeatures.join(', ')}`);
      validation.errors.forEach(error => addToConsole(`❌ ${error}`));
    } catch (error) {
      addToConsole(`❌ Quick validation failed: ${error}`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'FAIL': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'WARNING': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <RefreshCw className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PASS': return <Badge className="bg-green-500 text-white">PRODUCTION READY</Badge>;
      case 'FAIL': return <Badge variant="destructive">CRITICAL ISSUES</Badge>;
      case 'WARNING': return <Badge variant="secondary" className="bg-yellow-500 text-white">NEEDS ATTENTION</Badge>;
      default: return <Badge variant="outline">PENDING</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Authentication & Account Management': return <Shield className="w-5 h-5" />;
      case 'Kanban Board Functionality': return <Gauge className="w-5 h-5" />;
      case 'Timer System': return <Zap className="w-5 h-5" />;
      case 'Collaboration Features': return <Users className="w-5 h-5" />;
      case 'Real-time Messaging': return <MessageSquare className="w-5 h-5" />;
      case 'Database Integrity': return <Database className="w-5 h-5" />;
      case 'Deployment Readiness': return <Rocket className="w-5 h-5" />;
      default: return <CheckCircle className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">DT</span>
          </div>
          <div>
            <h1 className="text-4xl font-bold">DevTrack Africa</h1>
            <p className="text-xl text-muted-foreground">Production Readiness Audit</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-4">
          <Button 
            onClick={runFullProductionAudit} 
            disabled={isRunning}
            size="lg"
            className="gap-2"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Running Production Audit...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                Run Full Production Audit
              </>
            )}
          </Button>
          
          <Button 
            onClick={runQuickValidation}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            <Zap className="w-4 h-4" />
            Quick Validation
          </Button>
        </div>
      </div>

      {/* Summary Alert */}
      {summary && (
        <Alert className={`border-2 ${
          summary.overallStatus === 'PASS' ? 'border-green-500 bg-green-50' : 
          summary.overallStatus === 'WARNING' ? 'border-yellow-500 bg-yellow-50' : 
          'border-red-500 bg-red-50'
        }`}>
          <AlertDescription className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {getStatusIcon(summary.overallStatus)}
              <div>
                <div className="font-bold text-lg">
                  {summary.overallStatus === 'PASS' && '🎉 PRODUCTION READY!'}
                  {summary.overallStatus === 'WARNING' && '⚠️ READY WITH WARNINGS'}
                  {summary.overallStatus === 'FAIL' && '❌ CRITICAL ISSUES FOUND'}
                </div>
                <div className="text-sm">
                  {summary.passed}/{summary.totalTests} tests passed 
                  {summary.failed > 0 && ` • ${summary.failed} critical issues`}
                  {summary.warnings > 0 && ` • ${summary.warnings} warnings`}
                </div>
              </div>
            </div>
            {getStatusBadge(summary.overallStatus)}
          </AlertDescription>
        </Alert>
      )}

      {/* Critical Functionality Status */}
      {criticalValidation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Critical Functionality Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(criticalValidation)
                .filter(([key]) => key !== 'errors')
                .map(([feature, working]) => (
                  <div key={feature} className="text-center">
                    <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                      working ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {working ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                    </div>
                    <div className="text-sm font-medium capitalize">
                      {feature.replace(/([A-Z])/g, ' $1').replace('Works', '')}
                    </div>
                    <div className={`text-xs ${working ? 'text-green-600' : 'text-red-600'}`}>
                      {working ? 'Working' : 'Failed'}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Results */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Audit Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Results</TabsTrigger>
          <TabsTrigger value="console">Console Output</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {auditResults.length > 0 && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{auditResults.length}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Passing</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {auditResults.filter(r => r.overallStatus === 'PASS').length}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Warnings</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">
                      {auditResults.filter(r => r.overallStatus === 'WARNING').length}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
                    <XCircle className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {auditResults.filter(r => r.overallStatus === 'FAIL').length}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Category Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {auditResults.map((category, index) => (
                  <Card key={index} className={`border-2 ${
                    category.overallStatus === 'PASS' ? 'border-green-200' :
                    category.overallStatus === 'WARNING' ? 'border-yellow-200' :
                    'border-red-200'
                  }`}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        {getCategoryIcon(category.category)}
                        <span className="flex-1">{category.category}</span>
                        {getStatusIcon(category.overallStatus)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Progress 
                          value={(category.tests.filter(t => t.status === 'PASS').length / category.tests.length) * 100}
                          className="h-2"
                        />
                        <div className="flex justify-between text-sm">
                          <span>{category.tests.filter(t => t.status === 'PASS').length}/{category.tests.length} tests passed</span>
                          <span>
                            {category.criticalIssues > 0 && (
                              <Badge variant="destructive" className="text-xs mr-2">
                                {category.criticalIssues} critical
                              </Badge>
                            )}
                            {category.warnings > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {category.warnings} warnings
                              </Badge>
                            )}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          {auditResults.map((category, categoryIndex) => (
            <Card key={categoryIndex}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  {getCategoryIcon(category.category)}
                  {category.category}
                  {getStatusBadge(category.overallStatus)}
                </CardTitle>
                <CardDescription>
                  {category.tests.length} tests • {category.tests.filter(t => t.status === 'PASS').length} passed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {category.tests.map((test, testIndex) => (
                    <div key={testIndex} className="flex items-start gap-3 p-3 border rounded">
                      {getStatusIcon(test.status)}
                      <div className="flex-1">
                        <p className="font-medium">{test.testName}</p>
                        <p className="text-sm text-muted-foreground">{test.message}</p>
                        {test.fixes && test.fixes.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-blue-600">Recommended fixes:</p>
                            <ul className="text-xs text-blue-600 mt-1 ml-4">
                              {test.fixes.map((fix, fixIndex) => (
                                <li key={fixIndex} className="list-disc">{fix}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {test.details && (
                          <details className="mt-2">
                            <summary className="text-xs text-gray-500 cursor-pointer">Show Details</summary>
                            <pre className="text-xs mt-1 p-2 bg-gray-50 rounded overflow-auto">
                              {JSON.stringify(test.details, null, 2)}
                            </pre>
                          </details>
                        )}
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
              <CardTitle>Production Audit Console</CardTitle>
              <CardDescription>Real-time audit output and system logs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-96 overflow-auto">
                {consoleOutput.length === 0 ? (
                  <p>No console output yet. Run the production audit to see detailed logs.</p>
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

      {/* Production Instructions */}
      <Alert>
        <Rocket className="h-4 w-4" />
        <AlertDescription>
          <strong>🔥 DevTrack Africa Production Standards:</strong>
          <br />
          <br />
          <strong>CRITICAL REQUIREMENTS (Must Pass):</strong>
          <br />
          • All authentication flows work flawlessly
          <br />
          • Kanban drag-and-drop functions perfectly
          <br />
          • Timers auto-start/stop on task status changes
          <br />
          • Database connectivity and data persistence
          <br />
          • Real-time messaging operates correctly
          <br />
          <br />
          <strong>DEPLOYMENT CHECKLIST:</strong>
          <br />
          • All tests show PASS status
          <br />
          • No critical issues remain unresolved
          <br />
          • Performance optimizations implemented
          <br />
          • Environment variables configured
          <br />
          • Supabase project properly set up
          <br />
          <br />
          🎯 <strong>Goal:</strong> Achieve 100% PASS rate with zero critical issues before production deployment.
        </AlertDescription>
      </Alert>
    </div>
  );
}