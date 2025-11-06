/**
 * Production-Optimized App Component
 * Main application entry point with production features
 */

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { LocalOnlyAuthProvider, useAuth } from './contexts/LocalOnlyAuthContext';
import ProductionErrorBoundary from './components/ProductionErrorBoundary';
import { DashboardLoader } from './components/OptimizedLoader';
import { performanceMonitor } from './utils/production-performance-monitor';
import { isFeatureEnabled, logger } from './production.config';

// Lazy load components for optimal bundle splitting
const LocalDashboard = lazy(() => import('./components/LocalDashboard'));
const Homepage = lazy(() => import('./components/Homepage'));
const LoginPage = lazy(() => import('./components/LoginPageFixed'));
const RegistrationPage = lazy(() => import('./components/RegistrationPage'));

type Page = 'homepage' | 'login' | 'register' | 'dashboard';

// App Content with Auth
function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('homepage');

  // Track app initialization
  useEffect(() => {
    performanceMonitor.mark('app-init-complete');
    logger.info('App initialized', { user: !!user });
  }, []);

  // Auto-navigate based on auth state
  useEffect(() => {
    if (!authLoading) {
      if (user && currentPage !== 'dashboard') {
        setCurrentPage('dashboard');
      } else if (!user && currentPage === 'dashboard') {
        setCurrentPage('homepage');
      }
    }
  }, [user, authLoading, currentPage]);

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <DashboardLoader />
      </div>
    );
  }

  // Render current page
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <DashboardLoader />
        </div>
      }
    >
      {currentPage === 'homepage' && <Homepage onNavigate={setCurrentPage} />}
      {currentPage === 'login' && <LoginPage onNavigate={setCurrentPage} />}
      {currentPage === 'register' && <RegistrationPage onNavigate={setCurrentPage} />}
      {currentPage === 'dashboard' && <LocalDashboard />}
    </Suspense>
  );
}

// Main App Component
export default function App() {
  useEffect(() => {
    // Mark app start
    performanceMonitor.mark('app-start');

    // Set up global error handlers
    const handleError = (event: ErrorEvent) => {
      logger.error('Global error:', event.error);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logger.error('Unhandled promise rejection:', event.reason);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Track page visibility
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        logger.debug('App hidden');
      } else {
        logger.debug('App visible');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <ProductionErrorBoundary>
      <LocalOnlyAuthProvider>
        <AppContent />
      </LocalOnlyAuthProvider>
    </ProductionErrorBoundary>
  );
}
