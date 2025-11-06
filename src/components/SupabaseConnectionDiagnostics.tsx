import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Database,
  Wifi,
  Server,
  Eye,
  EyeOff
} from 'lucide-react';

interface DiagnosticResult {
  test: string;
  status: 'pass' | 'fail' | 'warning' | 'running';
  message: string;
  details?: string;
  timestamp: string;
}

const SupabaseConnectionDiagnostics: React.FC = () => {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showEnvVars, setShowEnvVars] = useState(false);

  const addResult = (test: string, status: 'pass' | 'fail' | 'warning', message: string, details?: string) => {
    const result: DiagnosticResult = {
      test,
      status,
      message,
      details,
      timestamp: new Date().toLocaleTimeString()
    };
    setResults(prev => [...prev, result]);
  };

  const getEnvVar = (key: string): string => {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env[key] || '';
    }
    return '';
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);

    // Test 1: Check environment variables
    addResult('Environment Variables', 'running', 'Checking Supabase configuration...');
    const url = getEnvVar('VITE_SUPABASE_URL');
    const key = getEnvVar('VITE_SUPABASE_ANON_KEY');

    if (!url || !key) {
      addResult(
        'Environment Variables',
        'fail',
        'Missing Supabase configuration',
        `URL: ${url ? 'Found' : 'Missing'}, Key: ${key ? 'Found' : 'Missing'}`
      );
      setIsRunning(false);
      return;
    } else {
      addResult(
        'Environment Variables',
        'pass',
        'Supabase configuration found',
        `URL: ${url.substring(0, 30)}..., Key: ${key.substring(0, 20)}...`
      );
    }

    // Test 2: Check if URL is local Supabase
    const isLocal = url.includes('127.0.0.1') || url.includes('localhost');
    addResult(
      'Instance Type',
      isLocal ? 'pass' : 'warning',
      isLocal ? 'Local Supabase instance detected' : 'Remote Supabase instance detected',
      `URL: ${url}`
    );

    // Test 3: Basic connectivity test
    addResult('Basic Connectivity', 'running', 'Testing basic connectivity...');
    try {
      const response = await fetch(`${url}/rest/v1/`, {
        method: 'HEAD',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`
        }
      });

      if (response.ok) {
        addResult(
          'Basic Connectivity',
          'pass',
          'Supabase API is reachable',
          `Status: ${response.status} ${response.statusText}`
        );
      } else {
        addResult(
          'Basic Connectivity',
          'fail',
          'Supabase API returned an error',
          `Status: ${response.status} ${response.statusText}`
        );
      }
    } catch (error: any) {
      addResult(
        'Basic Connectivity',
        'fail',
        'Failed to reach Supabase API',
        error.message
      );
    }

    // Test 4: Supabase client initialization
    addResult('Client Initialization', 'running', 'Testing Supabase client...');
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const testClient = createClient(url, key);
      
      if (testClient) {
        addResult(
          'Client Initialization',
          'pass',
          'Supabase client created successfully'
        );

        // Test 5: Database query test
        addResult('Database Query', 'running', 'Testing database connectivity...');
        try {
          const { data, error } = await testClient
            .from('users')
            .select('id')
            .limit(1);

          if (error) {
            if (error.code === '42P01' || error.message?.includes('does not exist')) {
              addResult(
                'Database Query',
                'warning',
                'Database connection works but tables missing',
                `Error: ${error.message} (Code: ${error.code})`
              );
            } else {
              addResult(
                'Database Query',
                'fail',
                'Database query failed',
                `Error: ${error.message} (Code: ${error.code})`
              );
            }
          } else {
            addResult(
              'Database Query',
              'pass',
              'Database query successful',
              `Found ${data?.length || 0} records`
            );
          }
        } catch (dbError: any) {
          addResult(
            'Database Query',
            'fail',
            'Database query exception',
            dbError.message
          );
        }
      } else {
        addResult(
          'Client Initialization',
          'fail',
          'Failed to create Supabase client'
        );
      }
    } catch (error: any) {
      addResult(
        'Client Initialization',
        'fail',
        'Error importing or creating Supabase client',
        error.message
      );
    }

    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'fail':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'running':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pass: 'default',
      fail: 'destructive',
      warning: 'secondary',
      running: 'outline'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Supabase Connection Diagnostics</h1>
        <p className="text-muted-foreground">
          Diagnose and troubleshoot your Supabase connection issues
        </p>
      </div>

      <div className="flex justify-center gap-4">
        <Button 
          onClick={runDiagnostics} 
          disabled={isRunning}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
          {isRunning ? 'Running Diagnostics...' : 'Run Diagnostics'}
        </Button>
        
        <Button 
          variant="outline"
          onClick={() => setShowEnvVars(!showEnvVars)}
          className="flex items-center gap-2"
        >
          {showEnvVars ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showEnvVars ? 'Hide' : 'Show'} Environment Variables
        </Button>
      </div>

      {showEnvVars && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Environment Variables
            </CardTitle>
            <CardDescription>
              Current Supabase configuration from environment variables
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 font-mono text-sm">
              <div>
                <strong>VITE_SUPABASE_URL:</strong> {getEnvVar('VITE_SUPABASE_URL') || '(not set)'}
              </div>
              <div>
                <strong>VITE_SUPABASE_ANON_KEY:</strong> {
                  getEnvVar('VITE_SUPABASE_ANON_KEY') 
                    ? `${getEnvVar('VITE_SUPABASE_ANON_KEY').substring(0, 30)}...` 
                    : '(not set)'
                }
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            Diagnostic Results
          </CardTitle>
          <CardDescription>
            Test results for your Supabase connection
          </CardDescription>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Click "Run Diagnostics" to start testing your connection
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((result, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-3 border rounded-lg"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getStatusIcon(result.status)}
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{result.test}</span>
                      {getStatusBadge(result.status)}
                      <span className="text-xs text-muted-foreground">
                        {result.timestamp}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {result.message}
                    </p>
                    {result.details && (
                      <p className="text-xs font-mono bg-muted p-2 rounded">
                        {result.details}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {results.some(r => r.status === 'fail') && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Connection Issues Detected:</strong>
            <br />
            • Make sure your local Supabase is running: <code>npx supabase start</code>
            <br />
            • Verify your .env file contains the correct VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
            <br />
            • Check that the URL is accessible: {getEnvVar('VITE_SUPABASE_URL')}
          </AlertDescription>
        </Alert>
      )}

      {results.some(r => r.status === 'warning') && !results.some(r => r.status === 'fail') && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Database Setup Required:</strong>
            <br />
            Your Supabase connection is working, but the database tables need to be set up.
            <br />
            You may need to run database migrations or create the required tables.
          </AlertDescription>
        </Alert>
      )}

      {results.every(r => r.status === 'pass') && results.length > 0 && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>All tests passed!</strong> Your Supabase connection is working perfectly.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SupabaseConnectionDiagnostics;