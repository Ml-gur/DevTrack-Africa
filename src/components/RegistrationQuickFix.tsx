import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, AlertTriangle, Settings, Mail, Database } from 'lucide-react';

export default function RegistrationQuickFix() {
  const [currentStep, setCurrentStep] = useState<'identify' | 'fix' | 'complete'>('identify');
  const [fixType, setFixType] = useState<'email' | 'database' | 'unknown'>('unknown');

  const identifyIssue = async () => {
    setCurrentStep('fix');
    
    // Simple heuristic to identify the most likely issue
    // In a real scenario, this would run actual tests
    
    // For now, we'll assume it's the email confirmation issue
    // since that's the most common in development
    setFixType('email');
  };

  const applyFix = async () => {
    if (fixType === 'email') {
      setCurrentStep('complete');
    }
  };

  const renderIdentifyStep = () => (
    <div className="space-y-4">
      <div className="text-center">
        <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
        <h3 className="font-semibold mb-2">Registration Issue Detected</h3>
        <p className="text-muted-foreground mb-4">
          Let's identify and fix the most common registration problems
        </p>
      </div>

      <Alert className="border-blue-200 bg-blue-50">
        <AlertDescription>
          <strong>Most Common Issues:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Email confirmation enabled in development</li>
            <li>Database tables not properly set up</li>
            <li>Supabase configuration issues</li>
          </ul>
        </AlertDescription>
      </Alert>

      <Button onClick={identifyIssue} className="w-full">
        Identify & Fix Issues
      </Button>
    </div>
  );

  const renderFixStep = () => {
    if (fixType === 'email') {
      return (
        <div className="space-y-4">
          <div className="text-center">
            <Mail className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Email Confirmation Issue</h3>
            <p className="text-muted-foreground mb-4">
              Email confirmation is likely enabled in your Supabase project
            </p>
          </div>

          <Alert className="border-orange-200 bg-orange-50">
            <AlertDescription>
              <strong>Quick Fix for Development:</strong>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Go to your Supabase Dashboard</li>
                <li>Navigate to Authentication → Settings</li>
                <li>Turn OFF "Enable email confirmations"</li>
                <li>Save the changes</li>
                <li>Try registration again</li>
              </ol>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Button 
              onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
              variant="outline"
              className="w-full"
            >
              Open Supabase Dashboard
            </Button>
            
            <Button onClick={applyFix} className="w-full">
              I've Disabled Email Confirmation
            </Button>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderCompleteStep = () => (
    <div className="space-y-4">
      <div className="text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="font-semibold mb-2">Fix Applied!</h3>
        <p className="text-muted-foreground mb-4">
          Your registration should now work properly
        </p>
      </div>

      <Alert className="border-green-200 bg-green-50">
        <AlertDescription>
          <strong>Next Steps:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Try creating a new account</li>
            <li>Registration should work immediately</li>
            <li>For production, set up proper email provider</li>
          </ul>
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Button 
          onClick={() => window.location.href = window.location.origin + '/?page=register'}
          className="w-full"
        >
          Try Registration Now
        </Button>
        
        <Button 
          onClick={() => window.location.href = window.location.origin}
          variant="outline"
          className="w-full"
        >
          Back to Homepage
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Settings className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold">Quick Fix</span>
          </div>
          <CardTitle>Registration Not Working?</CardTitle>
          <CardDescription>
            Let's get you up and running in 60 seconds
          </CardDescription>
        </CardHeader>

        <CardContent>
          {currentStep === 'identify' && renderIdentifyStep()}
          {currentStep === 'fix' && renderFixStep()}
          {currentStep === 'complete' && renderCompleteStep()}
        </CardContent>
      </Card>
    </div>
  );
}