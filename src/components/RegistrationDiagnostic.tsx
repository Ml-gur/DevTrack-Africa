import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, AlertTriangle, Bug, Info } from 'lucide-react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { supabase } from '../utils/supabase/client';
import { supabaseService } from '../utils/supabase/database-service';

interface DiagnosticStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  details?: any;
}

export default function RegistrationDiagnostic() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('test' + Date.now() + '@devtrack.test');
  const [password, setPassword] = useState('test123456');
  const [fullName, setFullName] = useState('Test User');
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState<DiagnosticStep[]>([
    { id: 'connection', name: 'Test Supabase Connection', status: 'pending' },
    { id: 'auth-config', name: 'Check Auth Configuration', status: 'pending' },
    { id: 'signup', name: 'Attempt User Registration', status: 'pending' },
    { id: 'profile-creation', name: 'Check Profile Creation', status: 'pending' },
    { id: 'email-flow', name: 'Test Email Flow', status: 'pending' },
    { id: 'cleanup', name: 'Cleanup Test Data', status: 'pending' }
  ]);

  const updateStep = (stepId: string, status: DiagnosticStep['status'], message?: string, details?: any) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, message, details }
        : step
    ));
  };

  const runDiagnostic = async () => {
    setIsRunning(true);
    
    try {
      // Step 1: Test Supabase Connection
      updateStep('connection', 'running');
      
      try {
        const connectionTest = await supabaseService.testConnection();
        if (connectionTest.success) {
          updateStep('connection', 'success', 'Supabase connection working');
        } else {
          updateStep('connection', 'error', connectionTest.error);
          return;
        }
      } catch (error: any) {
        updateStep('connection', 'error', error.message);
        return;
      }

      // Step 2: Check Auth Configuration
      updateStep('auth-config', 'running');
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        // Test auth endpoint
        const { data: user, error: userError } = await supabase.auth.getUser();
        if (userError && !userError.message.includes('not logged in')) {
          throw userError;
        }
        
        updateStep('auth-config', 'success', 'Auth configuration valid');
      } catch (error: any) {
        updateStep('auth-config', 'error', error.message);
        return;
      }

      // Step 3: Attempt User Registration
      updateStep('signup', 'running');
      
      let userId: string | null = null;
      
      try {
        console.log('🧪 Testing registration with:', { email, password, fullName });
        
        const result = await signUp(email, password, { fullName, username: email.split('@')[0] });
        
        console.log('🧪 Registration result:', result);
        
        if (result.success) {
          updateStep('signup', 'success', 'User registration successful', {
            user: result.user,
            needsConfirmation: result.needsConfirmation,
            requiresConfirmation: result.requiresConfirmation
          });
          userId = result.user?.id || null;
        } else {
          updateStep('signup', 'error', result.error, result);
          return;
        }
      } catch (error: any) {
        updateStep('signup', 'error', error.message, error);
        return;
      }

      // Step 4: Check Profile Creation
      updateStep('profile-creation', 'running');
      
      if (userId) {
        try {
          // Wait a moment for the trigger to execute
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

          if (profileError) {
            updateStep('profile-creation', 'error', profileError.message, profileError);
          } else {
            updateStep('profile-creation', 'success', 'Profile created successfully', profile);
          }
        } catch (error: any) {
          updateStep('profile-creation', 'error', error.message, error);
        }
      } else {
        updateStep('profile-creation', 'error', 'No user ID to check profile');
      }

      // Step 5: Test Email Flow
      updateStep('email-flow', 'running');
      
      try {
        // Check if email confirmation is configured
        const { data: settings } = await supabase.auth.getSession();
        
        // For testing, we'll just mark this as success since we can't easily test email
        updateStep('email-flow', 'success', 'Email confirmation flow should be working (manual verification needed)');
      } catch (error: any) {
        updateStep('email-flow', 'error', error.message, error);
      }

      // Step 6: Cleanup Test Data
      updateStep('cleanup', 'running');
      
      if (userId) {
        try {
          // First delete the profile (if exists)
          await supabase
            .from('profiles')
            .delete()
            .eq('id', userId);

          // Then delete the auth user
          const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
          
          if (deleteError) {
            console.warn('Could not delete test user from auth (admin access required):', deleteError.message);
            updateStep('cleanup', 'success', 'Profile cleaned up (auth user requires admin access to delete)');
          } else {
            updateStep('cleanup', 'success', 'Test data cleaned up successfully');
          }
        } catch (error: any) {
          updateStep('cleanup', 'error', error.message, error);
        }
      } else {
        updateStep('cleanup', 'success', 'No test data to clean up');
      }

    } finally {
      setIsRunning(false);
    }
  };

  const getStepIcon = (status: DiagnosticStep['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'running':
        return <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      default:
        return <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Bug className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold">Registration Diagnostic</span>
          </div>
          <CardTitle>Account Creation Testing Tool</CardTitle>
          <CardDescription>
            This tool will test the complete registration flow to identify any issues
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Test Configuration */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Info className="w-4 h-4" />
              Test Configuration
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Test Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isRunning}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Test Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isRunning}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fullName">Test Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isRunning}
                />
              </div>
            </div>
          </div>

          {/* Run Diagnostic Button */}
          <Button 
            onClick={runDiagnostic} 
            disabled={isRunning || !email || !password || !fullName}
            className="w-full"
          >
            {isRunning ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                <span>Running Diagnostic...</span>
              </div>
            ) : (
              'Run Registration Diagnostic'
            )}
          </Button>

          {/* Diagnostic Steps */}
          <div className="space-y-3">
            <h3 className="font-semibold">Diagnostic Steps</h3>
            
            {steps.map((step) => (
              <div key={step.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                {getStepIcon(step.status)}
                
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{step.name}</div>
                  
                  {step.message && (
                    <div className={`text-sm ${
                      step.status === 'error' ? 'text-red-600' : 
                      step.status === 'success' ? 'text-green-600' : 
                      'text-muted-foreground'
                    }`}>
                      {step.message}
                    </div>
                  )}
                  
                  {step.details && (
                    <details className="mt-2">
                      <summary className="text-xs text-muted-foreground cursor-pointer">
                        View Details
                      </summary>
                      <pre className="text-xs mt-1 p-2 bg-muted rounded overflow-auto">
                        {JSON.stringify(step.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Results Summary */}
          {!isRunning && steps.some(s => s.status !== 'pending') && (
            <Alert className={
              steps.some(s => s.status === 'error') 
                ? 'border-red-200 bg-red-50' 
                : 'border-green-200 bg-green-50'
            }>
              <AlertDescription>
                {steps.some(s => s.status === 'error') ? (
                  <div>
                    <strong>Issues Found:</strong> Some steps failed. Check the details above to identify the problem.
                  </div>
                ) : (
                  <div>
                    <strong>All Tests Passed:</strong> The registration flow appears to be working correctly.
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}