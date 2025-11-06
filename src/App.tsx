// Initialize warning suppression FIRST, before any other imports
import { initializeWarningSuppression } from "./utils/suppress-react-warnings";
initializeWarningSuppression();

import React, {
  useState,
  useEffect,
  useCallback,
  lazy,
  Suspense,
} from "react";

import { LocalOnlyAuthProvider, useAuth } from "./contexts/LocalOnlyAuthContext";
import { StorageProvider, useStorage } from "./contexts/StorageContext";
import { localDatabase } from "./utils/local-storage-database";
import { Button } from "./components/ui/button";
import {
  DashboardLoader,
} from "./components/OptimizedLoader";
import {
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { StorageWarningToast } from "./components/StorageWarningToast";
import { StorageFullDialog } from "./components/StorageFullDialog";

// Import ErrorBoundary directly (don't lazy load error boundaries)
import ErrorBoundary from "./components/ErrorBoundary";

// PWA Components
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import PWAUpdatePrompt from "./components/PWAUpdatePrompt";
import OfflineIndicator from "./components/OfflineIndicator";

// Lazy load heavy components for better initial load performance
const StreamlinedDashboard = lazy(
  () => import("./components/StreamlinedDashboard"),
);
const Homepage = lazy(() => import("./components/Homepage"));
const LoginPage = lazy(() => import("./components/LoginPageFixed"));
const RegistrationPage = lazy(
  () => import("./components/RegistrationPage"),
);
const EmailConfirmationPage = lazy(
  () => import("./components/EmailConfirmationPage"),
);
const KanbanTestPage = lazy(() => import("./components/KanbanTestPage"));

type Page =
  | "homepage"
  | "login"
  | "register"
  | "dashboard"
  | "kanban-test";

// Environment check utility functions
const isProductionMode = (): boolean => {
  try {
    if (typeof window !== "undefined") {
      const hostname = window.location?.hostname;
      return (
        hostname !== "localhost" &&
        hostname !== "127.0.0.1" &&
        !hostname?.includes(".local")
      );
    }
    return false;
  } catch {
    return false;
  }
};

const isDevelopmentMode = (): boolean => {
  try {
    if (typeof window !== "undefined") {
      const hostname = window.location?.hostname;
      const port = window.location?.port;

      // Check for localhost
      if (hostname === "localhost" || hostname === "127.0.0.1")
        return true;

      // Check for common dev ports
      if (port === "5173" || port === "3000" || port === "8080")
        return true;
    }

    // Also check NODE_ENV if available
    if (
      typeof process !== "undefined" &&
      process.env?.NODE_ENV === "development"
    ) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
};

// Main App Content Component
const AppContent = React.memo(function AppContentComponent() {
  const { user, profile, loading: authLoading } = useAuth();
  const { showCleanupDialog, closeCleanupDialog, refreshStorage } = useStorage();
  const [currentPage, setCurrentPage] = useState<Page>("homepage");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);

  const handleDismissWelcome = useCallback(() => {
    setShowWelcomeMessage(false);
  }, []);

  // Navigation handlers
  const onEnterPlatform = useCallback(
    () => setCurrentPage("login"),
    [],
  );
  const onBackToHomepage = useCallback(
    () => setCurrentPage("homepage"),
    [],
  );
  const onLoginSuccess = useCallback(() => {
    console.log("🎉 Login successful, navigating to dashboard");
    setCurrentPage("dashboard");
  }, []);
  const onNavigateToRegister = useCallback(
    () => setCurrentPage("register"),
    [],
  );
  const onNavigateFromRegister = useCallback((page: string) => {
    if (page === "login") setCurrentPage("login");
    else if (page === "welcome") setCurrentPage("homepage");
  }, []);

  // Initialize app
  useEffect(() => {
    console.log('🚀 App initialization check...', { authLoading, loading })
    
    // Initialize the app - wait for auth to load
    if (!authLoading) {
      console.log('✅ Auth loaded, completing app initialization')
      setLoading(false);
    }
  }, [authLoading, loading]);

  // Initialize demo data for authenticated users
  useEffect(() => {
    if (!loading && !authLoading && user) {
      // Initialize demo data for new users
      const initializeDemoData = async () => {
        try {
          console.log('🔍 Initializing demo data for user:', user.email)
          await localDatabase.initializeDemoData(user.id)
          console.log('✅ Demo data initialized successfully')
        } catch (error) {
          console.error('❌ Error initializing demo data:', error)
        }
      }
      
      initializeDemoData()
    }
  }, [loading, authLoading, user]);

  // Welcome message for first-time users
  useEffect(() => {
    if (!loading && user && currentPage === "dashboard") {
      setShowWelcomeMessage(true);
    }
  }, [loading, user, currentPage]);

  // Authentication Navigation Logic
  useEffect(() => {
    if (loading) return;

    try {
      console.log("Authentication navigation check:", {
        user: user ? "authenticated" : "not authenticated",
        currentPage,
        userEmail: user?.email
      });

      // If user is authenticated, redirect to dashboard from auth pages
      if (
        user &&
        (currentPage === "login" ||
          currentPage === "register" ||
          currentPage === "homepage")
      ) {
        console.log("User authenticated, redirecting to dashboard");
        setCurrentPage("dashboard");
        return;
      }

      // If user is not authenticated and trying to access dashboard
      if (!user && currentPage === "dashboard") {
        console.log("User not authenticated, redirecting to login");
        setCurrentPage("login");
        return;
      }
    } catch (error) {
      console.error("Error in authentication navigation logic:", error);
      // Don't set error state here to avoid navigation loops
    }
  }, [user, loading, currentPage]);

  // Show loading screen while initializing
  if (loading || authLoading) {
    return <DashboardLoader />;
  }

  // Show error if initialization failed
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center">
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg border border-red-200">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <div className="font-semibold text-red-900 mb-2">
              Application Error
            </div>
            <p className="text-sm text-red-700 mb-4">
              {error}
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="w-full"
            >
              Refresh Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show homepage
  if (currentPage === "homepage") {
    return (
      <Suspense fallback={<DashboardLoader />}>
        <Homepage 
          onEnterPlatform={onEnterPlatform}
        />
      </Suspense>
    );
  }

  // Show login page
  if (currentPage === "login") {
    return (
      <Suspense fallback={<DashboardLoader />}>
        <LoginPage
          onBack={onBackToHomepage}
          onSuccess={onLoginSuccess}
          onNavigateToRegister={onNavigateToRegister}
        />
      </Suspense>
    );
  }

  // Show registration page
  if (currentPage === "register") {
    return (
      <Suspense fallback={<DashboardLoader />}>
        <RegistrationPage
          onNavigate={onNavigateFromRegister}
        />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Production Environment Indicator */}
      {isProductionMode() && (
        <div className="bg-green-600 text-white p-1 text-center text-xs">
          🚀 DevTrack Africa - Production Platform (Local Storage)
        </div>
      )}

      {/* Development Environment Indicator */}
      {isDevelopmentMode() && (
        <div className="bg-blue-600 text-white p-1 text-center text-xs">
          🔧 DevTrack Africa - Development Environment (Local Storage)
        </div>
      )}

      {/* Welcome Message for First-Time Users */}
      {showWelcomeMessage &&
        currentPage === "dashboard" &&
        user && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-green-200 p-4">
            <div className="container mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-green-900">
                      Welcome to DevTrack Africa,{" "}
                      {profile?.fullName ||
                        user.email?.split("@")[0] ||
                        "Developer"}
                      !
                    </div>
                    <p className="text-sm text-green-700">
                      Track your projects, manage tasks with Kanban boards, and monitor your productivity. All data is stored locally for fast, offline-capable performance.
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-green-600">
                    💾 Local Storage
                  </span>
                  <button
                    onClick={handleDismissWelcome}
                    className="text-sm text-green-600 underline hover:no-underline"
                  >
                    Got it!
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Main Dashboard Content */}
      {currentPage === "dashboard" && user && (
        <ErrorBoundary>
          <Suspense fallback={<DashboardLoader />}>
            <StreamlinedDashboard />
          </Suspense>
        </ErrorBoundary>
      )}
      
      {/* Kanban Test Page */}
      {currentPage === "kanban-test" && (
        <ErrorBoundary>
          <Suspense fallback={<DashboardLoader />}>
            <KanbanTestPage />
          </Suspense>
        </ErrorBoundary>
      )}

      {/* Storage Full Dialog */}
      <StorageFullDialog
        open={showCleanupDialog}
        onOpenChange={closeCleanupDialog}
        onCleanupComplete={refreshStorage}
      />
    </div>
  );
});

// Main App Component
function App() {
  return (
    <ErrorBoundary>
      <LocalOnlyAuthProvider>
        <StorageProvider>
          <Suspense fallback={<DashboardLoader />}>
            <StorageWarningToast />
            <AppContent />
            
            {/* PWA Features */}
            <PWAInstallPrompt />
            <PWAUpdatePrompt />
            <OfflineIndicator />
          </Suspense>
        </StorageProvider>
      </LocalOnlyAuthProvider>
    </ErrorBoundary>
  );
}

export default App;