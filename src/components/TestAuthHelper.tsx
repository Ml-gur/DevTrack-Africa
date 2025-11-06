import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { 
  TestTube, 
  User, 
  Mail, 
  Lock, 
  AlertTriangle, 
  CheckCircle,
  Loader2,
  ExternalLink 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { log } from '../utils/production-logger';

export default function TestAuthHelper() {
  const { signUp, signIn, signInAsTestUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);
  const [credentials, setCredentials] = useState({
    email: 'test@devtrack.africa',
    password: 'TestPassword123!',
    fullName: 'Test User'
  });

  const createTestAccount = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      log.info('🧪 Creating test account...');
      
      const result = await signUp({
        email: credentials.email,
        password: credentials.password,
        fullName: credentials.fullName,
        country: 'Nigeria',
        phone: '+234123456789'
      });

      if (result.success) {
        setTestResult({
          success: true,
          message: 'Test account created successfully!',
          details: { 
            email: credentials.email,
            needsConfirmation: result.requiresConfirmation 
          }
        });
      } else {
        setTestResult({
          success: false,
          message: result.error || 'Failed to create test account',
          details: result
        });
      }
    } catch (error: any) {
      log.error('❌ Test account creation failed:', error);
      setTestResult({
        success: false,
        message: `Test account creation failed: ${error.message}`,
        details: error
      });
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      log.info('🔐 Testing login...');
      
      const result = await signIn(credentials.email, credentials.password);

      if (result.success) {
        setTestResult({
          success: true,
          message: 'Login test successful!',
          details: result
        });
      } else {
        setTestResult({
          success: false,
          message: result.error || 'Login test failed',
          details: result
        });
      }
    } catch (error: any) {
      log.error('❌ Login test failed:', error);
      setTestResult({
        success: false,
        message: `Login test failed: ${error.message}`,
        details: error
      });
    } finally {
      setLoading(false);
    }
  };

  const tryDemoLogin = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      log.info('🎭 Trying demo login...');
      
      const result = await signInAsTestUser();

      if (result.success) {
        setTestResult({
          success: true,
          message: 'Demo login successful!',
          details: result
        });
      } else {
        setTestResult({
          success: false,
          message: result.error || 'Demo login failed',
          details: result
        });
      }
    } catch (error: any) {
      log.error('❌ Demo login failed:', error);
      setTestResult({
        success: false,
        message: `Demo login failed: ${error.message}`,
        details: error
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TestTube className="h-5 w-5" />
          <span>Authentication Test Helper</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Use this tool to test authentication and create test accounts for development.
        </div>

        <div className="space-y-3">
          <div>
            <Label htmlFor="email">Test Email</Label>
            <Input
              id="email"
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
              placeholder="test@devtrack.africa"
            />
          </div>

          <div>
            <Label htmlFor="password">Test Password</Label>
            <Input
              id="password"
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              placeholder="TestPassword123!"
            />
          </div>

          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              value={credentials.fullName}
              onChange={(e) => setCredentials(prev => ({ ...prev, fullName: e.target.value }))}
              placeholder="Test User"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Button 
            onClick={createTestAccount} 
            disabled={loading}
            className="w-full"
            variant="outline"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <User className="h-4 w-4 mr-2" />
            )}
            Create Test Account
          </Button>

          <Button 
            onClick={testLogin} 
            disabled={loading}
            className="w-full"
            variant="outline"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Lock className="h-4 w-4 mr-2" />
            )}
            Test Login
          </Button>

          <Button 
            onClick={tryDemoLogin} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <TestTube className="h-4 w-4 mr-2" />
            )}
            Try Demo Login
          </Button>
        </div>

        {testResult && (
          <Alert variant={testResult.success ? "default" : "destructive"}>
            {testResult.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">{testResult.message}</p>
                {testResult.details && (
                  <details className="text-xs">
                    <summary className="cursor-pointer">View Details</summary>
                    <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                      {JSON.stringify(testResult.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="pt-3 border-t">
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>Tip:</strong> If login fails, you may need to create the account in Supabase Dashboard first.</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
              className="text-xs h-auto p-1"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Open Supabase Dashboard
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}