import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Database, AlertTriangle, ExternalLink, RefreshCw } from 'lucide-react';

interface DatabaseErrorInterceptorProps {
  onDatabaseSetupRequired: () => void;
}

export default function DatabaseErrorInterceptor({ onDatabaseSetupRequired }: DatabaseErrorInterceptorProps) {
  const [hasDetectedError, setHasDetectedError] = useState(false);

  useEffect(() => {
    // Listen for console errors that indicate database table issues
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    const checkForDatabaseErrors = (message: string) => {
      const isDatabaseTableError = 
        message.includes('Could not find the table') ||
        message.includes('schema cache') ||
        message.includes('profiles') ||
        message.includes('relation') ||
        message.includes('does not exist') ||
        message.includes('Database tables not found');

      if (isDatabaseTableError && !hasDetectedError) {
        console.log('🚨 DATABASE ERROR INTERCEPTED:', message);
        setHasDetectedError(true);
        
        // Wait a moment then redirect to setup
        setTimeout(() => {
          onDatabaseSetupRequired();
        }, 100);
      }
    };

    console.error = (...args) => {
      const message = args.join(' ');
      checkForDatabaseErrors(message);
      originalConsoleError.apply(console, args);
    };

    console.warn = (...args) => {
      const message = args.join(' ');
      checkForDatabaseErrors(message);
      originalConsoleWarn.apply(console, args);
    };

    // Also listen for unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const message = event.reason?.message || event.reason?.toString() || '';
      checkForDatabaseErrors(message);
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [hasDetectedError, onDatabaseSetupRequired]);

  // If we've detected an error, show an immediate action banner
  if (hasDetectedError) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white p-3 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5" />
            <div>
              <div className="font-semibold">Database Setup Required</div>
              <div className="text-sm text-red-100">
                Missing database tables detected - redirecting to setup...
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={onDatabaseSetupRequired}
              variant="secondary"
              size="sm"
              className="bg-white text-red-600 hover:bg-red-50"
            >
              <Database className="w-4 h-4 mr-1" />
              Setup Now
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}