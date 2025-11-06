import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react';
import { logger } from '../production.config';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

/**
 * Production-ready Error Boundary
 * Catches React errors and displays user-friendly fallback UI
 */
export default class ProductionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console and tracking service
    logger.error('React Error Boundary caught an error:', {
      error: error.toString(),
      componentStack: errorInfo.componentStack,
      errorCount: this.state.errorCount + 1,
    });

    // Update state
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // Store error info in localStorage for debugging
    try {
      const errorLog = {
        timestamp: new Date().toISOString(),
        error: error.toString(),
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('error_logs') || '[]');
      existingLogs.push(errorLog);
      
      // Keep only last 10 errors
      const recentLogs = existingLogs.slice(-10);
      localStorage.setItem('error_logs', JSON.stringify(recentLogs));
    } catch (storageError) {
      logger.warn('Failed to store error log:', storageError);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportError = () => {
    const { error, errorInfo } = this.state;
    const mailtoLink = `mailto:support@devtrackafrica.com?subject=Error Report&body=${encodeURIComponent(
      `Error: ${error?.toString()}\n\nComponent Stack: ${errorInfo?.componentStack || 'N/A'}\n\nTimestamp: ${new Date().toISOString()}`
    )}`;
    window.location.href = mailtoLink;
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Something went wrong</CardTitle>
                  <p className="text-muted-foreground mt-1">
                    We apologize for the inconvenience. The error has been logged.
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Error message for developers */}
              {import.meta.env.DEV && this.state.error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="font-semibold text-red-900 mb-2">Error Details (Dev Only):</p>
                  <p className="text-sm text-red-800 font-mono">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="text-sm text-red-700 cursor-pointer hover:text-red-900">
                        Component Stack
                      </summary>
                      <pre className="text-xs text-red-700 mt-2 overflow-x-auto whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* User-friendly message */}
              <div className="space-y-4">
                <h3 className="font-semibold">What you can do:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Try refreshing the page or going back to the homepage</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Clear your browser cache and cookies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>If the problem persists, please report it to our team</span>
                  </li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={this.handleReset}
                  className="flex-1 gap-2"
                  variant="default"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>

                <Button
                  onClick={this.handleReload}
                  className="flex-1 gap-2"
                  variant="outline"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reload Page
                </Button>

                <Button
                  onClick={this.handleGoHome}
                  className="flex-1 gap-2"
                  variant="outline"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </Button>
              </div>

              {/* Report error */}
              <div className="pt-4 border-t">
                <Button
                  onClick={this.handleReportError}
                  variant="ghost"
                  className="w-full gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Report this error
                </Button>
              </div>

              {/* Error count warning */}
              {this.state.errorCount > 3 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-900">
                    <strong>Multiple errors detected.</strong> Consider clearing your browser
                    data or contacting support if the issue persists.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper for functional components
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ProductionErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ProductionErrorBoundary>
    );
  };
}
