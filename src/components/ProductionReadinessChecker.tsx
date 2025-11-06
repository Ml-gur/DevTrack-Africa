/**
 * Production Readiness Checker - Quality Assurance Dashboard
 * Validates app health, data integrity, and production readiness
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Shield,
  Database,
  Zap,
  FileCheck,
  Activity,
  Eye,
  Info
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface CheckResult {
  id: string;
  category: 'critical' | 'warning' | 'info';
  status: 'pass' | 'fail' | 'warning';
  title: string;
  description: string;
  details?: string;
}

export default function ProductionReadinessChecker() {
  const [checks, setChecks] = useState<CheckResult[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [overallScore, setOverallScore] = useState(0);

  useEffect(() => {
    runAllChecks();
  }, []);

  const runAllChecks = async () => {
    setIsChecking(true);
    const results: CheckResult[] = [];

    try {
      // 1. Local Storage Availability
      try {
        localStorage.setItem('_test', 'test');
        localStorage.removeItem('_test');
        results.push({
          id: 'storage-available',
          category: 'critical',
          status: 'pass',
          title: 'Local Storage Available',
          description: 'Local storage is accessible and functioning'
        });
      } catch {
        results.push({
          id: 'storage-available',
          category: 'critical',
          status: 'fail',
          title: 'Local Storage Unavailable',
          description: 'Critical: Local storage is not accessible',
          details: 'The app requires local storage to function. Check browser settings.'
        });
      }

      // 2. Storage Capacity Check
      try {
        let totalSize = 0;
        for (let key in localStorage) {
          if (localStorage.hasOwnProperty(key)) {
            totalSize += localStorage[key].length + key.length;
          }
        }
        const usedKB = totalSize / 1024;
        const limitKB = 5120;
        const percentage = (usedKB / limitKB) * 100;

        if (percentage < 70) {
          results.push({
            id: 'storage-capacity',
            category: 'info',
            status: 'pass',
            title: 'Storage Capacity Healthy',
            description: `Using ${percentage.toFixed(1)}% of available storage`,
            details: `${usedKB.toFixed(2)} KB / ${limitKB} KB`
          });
        } else if (percentage < 90) {
          results.push({
            id: 'storage-capacity',
            category: 'warning',
            status: 'warning',
            title: 'Storage Usage High',
            description: `Using ${percentage.toFixed(1)}% of available storage`,
            details: 'Consider exporting and archiving old data'
          });
        } else {
          results.push({
            id: 'storage-capacity',
            category: 'critical',
            status: 'fail',
            title: 'Storage Almost Full',
            description: `Using ${percentage.toFixed(1)}% of available storage`,
            details: 'Export data immediately to avoid data loss'
          });
        }
      } catch {
        results.push({
          id: 'storage-capacity',
          category: 'warning',
          status: 'warning',
          title: 'Cannot Check Storage Capacity',
          description: 'Unable to determine storage usage'
        });
      }

      // 3. Data Integrity Check
      try {
        const projects = JSON.parse(localStorage.getItem('devtrack_projects') || '{}');
        const tasks = JSON.parse(localStorage.getItem('devtrack_tasks') || '{}');
        const users = JSON.parse(localStorage.getItem('devtrack_users') || '{}');

        const projectCount = Object.keys(projects).length;
        const taskCount = Object.keys(tasks).length;
        const userCount = Object.keys(users).length;

        if (userCount > 0) {
          results.push({
            id: 'data-integrity',
            category: 'info',
            status: 'pass',
            title: 'Data Integrity Verified',
            description: `Found ${userCount} users, ${projectCount} projects, ${taskCount} tasks`,
            details: 'All data structures are valid JSON'
          });
        } else {
          results.push({
            id: 'data-integrity',
            category: 'info',
            status: 'warning',
            title: 'No User Data Found',
            description: 'No users registered yet',
            details: 'This is normal for a fresh installation'
          });
        }
      } catch (error) {
        results.push({
          id: 'data-integrity',
          category: 'critical',
          status: 'fail',
          title: 'Data Corruption Detected',
          description: 'Unable to parse stored data',
          details: 'Consider clearing corrupted data or restoring from backup'
        });
      }

      // 4. Authentication System Check
      try {
        const currentUser = localStorage.getItem('devtrack_current_user');
        if (currentUser) {
          const user = JSON.parse(currentUser);
          if (user.id && user.email) {
            results.push({
              id: 'auth-system',
              category: 'info',
              status: 'pass',
              title: 'Authentication Active',
              description: `Logged in as ${user.email}`,
              details: 'Authentication system is working correctly'
            });
          } else {
            throw new Error('Invalid user structure');
          }
        } else {
          results.push({
            id: 'auth-system',
            category: 'info',
            status: 'warning',
            title: 'No Active Session',
            description: 'No user is currently logged in',
            details: 'This is normal when not authenticated'
          });
        }
      } catch {
        results.push({
          id: 'auth-system',
          category: 'warning',
          status: 'fail',
          title: 'Authentication Error',
          description: 'Invalid authentication state detected',
          details: 'May need to clear session and log in again'
        });
      }

      // 5. Backup Status Check
      try {
        const lastBackup = localStorage.getItem('devtrack_last_backup');
        if (lastBackup) {
          const backupDate = new Date(lastBackup);
          const daysSinceBackup = Math.floor(
            (Date.now() - backupDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (daysSinceBackup < 7) {
            results.push({
              id: 'backup-status',
              category: 'info',
              status: 'pass',
              title: 'Recent Backup Found',
              description: `Last backup: ${daysSinceBackup} days ago`,
              details: backupDate.toLocaleDateString()
            });
          } else {
            results.push({
              id: 'backup-status',
              category: 'warning',
              status: 'warning',
              title: 'Backup Outdated',
              description: `Last backup: ${daysSinceBackup} days ago`,
              details: 'Consider creating a fresh backup'
            });
          }
        } else {
          results.push({
            id: 'backup-status',
            category: 'warning',
            status: 'warning',
            title: 'No Backup Found',
            description: 'No backup has been created yet',
            details: 'Create a backup to protect your data'
          });
        }
      } catch {
        results.push({
          id: 'backup-status',
          category: 'warning',
          status: 'warning',
          title: 'Cannot Check Backup Status',
          description: 'Unable to verify backup information'
        });
      }

      // 6. Performance Check
      try {
        const startTime = performance.now();
        const testData = { test: 'data' };
        localStorage.setItem('_perf_test', JSON.stringify(testData));
        const retrieved = JSON.parse(localStorage.getItem('_perf_test') || '{}');
        localStorage.removeItem('_perf_test');
        const endTime = performance.now();
        const duration = endTime - startTime;

        if (duration < 10) {
          results.push({
            id: 'performance',
            category: 'info',
            status: 'pass',
            title: 'Performance Optimal',
            description: `Storage operations: ${duration.toFixed(2)}ms`,
            details: 'Storage read/write performance is excellent'
          });
        } else if (duration < 50) {
          results.push({
            id: 'performance',
            category: 'info',
            status: 'warning',
            title: 'Performance Acceptable',
            description: `Storage operations: ${duration.toFixed(2)}ms`,
            details: 'Performance is within acceptable range'
          });
        } else {
          results.push({
            id: 'performance',
            category: 'warning',
            status: 'warning',
            title: 'Performance Degraded',
            description: `Storage operations: ${duration.toFixed(2)}ms`,
            details: 'Consider clearing old data to improve performance'
          });
        }
      } catch {
        results.push({
          id: 'performance',
          category: 'warning',
          status: 'warning',
          title: 'Cannot Check Performance',
          description: 'Unable to run performance tests'
        });
      }

      // 7. Browser Compatibility
      const features = {
        localStorage: typeof Storage !== 'undefined',
        promises: typeof Promise !== 'undefined',
        fetch: typeof fetch !== 'undefined',
        es6: typeof Symbol !== 'undefined'
      };

      const unsupported = Object.entries(features)
        .filter(([, supported]) => !supported)
        .map(([feature]) => feature);

      if (unsupported.length === 0) {
        results.push({
          id: 'browser-compat',
          category: 'info',
          status: 'pass',
          title: 'Browser Fully Compatible',
          description: 'All required features are supported',
          details: 'Your browser supports all required APIs'
        });
      } else {
        results.push({
          id: 'browser-compat',
          category: 'critical',
          status: 'fail',
          title: 'Browser Compatibility Issues',
          description: `Missing features: ${unsupported.join(', ')}`,
          details: 'Update your browser or use a modern browser'
        });
      }

      setChecks(results);

      // Calculate overall score
      const passCount = results.filter(r => r.status === 'pass').length;
      const score = Math.round((passCount / results.length) * 100);
      setOverallScore(score);

      if (score === 100) {
        toast.success('All checks passed! ✅');
      } else if (score >= 70) {
        toast.info(`${passCount}/${results.length} checks passed`);
      } else {
        toast.warning('Some critical checks failed');
      }
    } catch (error) {
      console.error('Error running checks:', error);
      toast.error('Failed to complete health checks');
    } finally {
      setIsChecking(false);
    }
  };

  const criticalChecks = checks.filter(c => c.category === 'critical');
  const warningChecks = checks.filter(c => c.category === 'warning');
  const infoChecks = checks.filter(c => c.category === 'info');

  const failedCritical = criticalChecks.filter(c => c.status === 'fail').length;
  const totalCritical = criticalChecks.length;

  return (
    <div className="space-y-6">
      {/* Overall Health Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <CardTitle>Production Readiness</CardTitle>
            </div>
            <Button
              onClick={runAllChecks}
              disabled={isChecking}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
              Re-check
            </Button>
          </div>
          <CardDescription>
            System health and production readiness validation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Score */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Health Score</span>
              <Badge
                variant={
                  overallScore === 100 ? 'default' :
                  overallScore >= 70 ? 'secondary' : 'destructive'
                }
              >
                {overallScore}%
              </Badge>
            </div>
            <Progress value={overallScore} className="h-3" />
          </div>

          {/* Critical Issues Alert */}
          {failedCritical > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>{failedCritical}</strong> critical issue{failedCritical > 1 ? 's' : ''} detected.
                These must be resolved before production deployment.
              </AlertDescription>
            </Alert>
          )}

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-700">
                {checks.filter(c => c.status === 'pass').length}
              </div>
              <div className="text-xs text-green-600">Passed</div>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-200">
              <div className="text-2xl font-bold text-amber-700">
                {checks.filter(c => c.status === 'warning').length}
              </div>
              <div className="text-xs text-amber-600">Warnings</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-700">
                {checks.filter(c => c.status === 'fail').length}
              </div>
              <div className="text-xs text-red-600">Failed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Checks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="w-5 h-5" />
            Detailed Checks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">
                All ({checks.length})
              </TabsTrigger>
              <TabsTrigger value="critical">
                Critical ({criticalChecks.length})
              </TabsTrigger>
              <TabsTrigger value="warning">
                Warnings ({warningChecks.length})
              </TabsTrigger>
              <TabsTrigger value="info">
                Info ({infoChecks.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3 mt-4">
              {checks.map(check => (
                <CheckItem key={check.id} check={check} />
              ))}
            </TabsContent>

            <TabsContent value="critical" className="space-y-3 mt-4">
              {criticalChecks.map(check => (
                <CheckItem key={check.id} check={check} />
              ))}
            </TabsContent>

            <TabsContent value="warning" className="space-y-3 mt-4">
              {warningChecks.map(check => (
                <CheckItem key={check.id} check={check} />
              ))}
            </TabsContent>

            <TabsContent value="info" className="space-y-3 mt-4">
              {infoChecks.map(check => (
                <CheckItem key={check.id} check={check} />
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// Check Item Component
function CheckItem({ check }: { check: CheckResult }) {
  const getIcon = () => {
    switch (check.status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
    }
  };

  const getBgColor = () => {
    switch (check.status) {
      case 'pass':
        return 'bg-green-50 border-green-200';
      case 'fail':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-amber-50 border-amber-200';
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${getBgColor()}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className="font-medium text-sm">{check.title}</h4>
            <Badge
              variant={check.category === 'critical' ? 'destructive' : 'secondary'}
              className="text-xs"
            >
              {check.category}
            </Badge>
          </div>
          <p className="text-sm text-gray-700 mb-1">{check.description}</p>
          {check.details && (
            <p className="text-xs text-gray-600 flex items-start gap-1">
              <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
              {check.details}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
