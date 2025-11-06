/**
 * Production Configuration
 * Central configuration for production environment
 */

export const PRODUCTION_CONFIG = {
  // Environment
  environment: import.meta.env.MODE || 'development',
  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV,

  // Feature Flags
  features: {
    enableDebugTools: false, // Disable all debug tools in production
    enableTestComponents: false, // Disable test components
    enableDiagnostics: false, // Disable diagnostic panels
    enablePerformanceMonitoring: true, // Enable performance tracking
    enableErrorTracking: true, // Enable error tracking
    enableAnalytics: true, // Enable usage analytics
    enableServiceWorker: true, // Enable PWA features
    enableOfflineMode: true, // Enable offline capabilities
  },

  // Performance
  performance: {
    enableLazyLoading: true,
    enableCodeSplitting: true,
    enableImageOptimization: true,
    enableCaching: true,
    maxCacheAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    preloadImages: true,
  },

  // Storage Limits
  storage: {
    maxFileSize: 25 * 1024 * 1024, // 25MB per file
    maxTotalStorage: 500 * 1024 * 1024, // 500MB total
    maxProjectsPerUser: 100,
    maxTasksPerProject: 500,
    maxPostsCache: 200,
  },

  // Security
  security: {
    enableCSRF: true,
    enableXSSProtection: true,
    sanitizeUserInput: true,
    maxLoginAttempts: 5,
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  },

  // UI/UX
  ui: {
    animationDuration: 200,
    toastDuration: 3000,
    debounceDelay: 300,
    throttleDelay: 1000,
    enableAnimations: true,
    enableTransitions: true,
  },

  // Data Sync
  sync: {
    autoSaveInterval: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000,
    batchSize: 50,
  },

  // Logging
  logging: {
    enableConsoleLogging: false, // Disable in production
    enableErrorLogging: true,
    enablePerformanceLogging: true,
    logLevel: 'error', // 'debug' | 'info' | 'warn' | 'error'
  },

  // API Configuration
  api: {
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000,
  },

  // SEO
  seo: {
    appName: 'DevTrack Africa',
    appDescription: 'Professional developer portfolio and project tracking platform for African developers',
    appUrl: 'https://devtrack-africa.vercel.app',
    twitterHandle: '@devtrackafrica',
    ogImage: '/og-image.png',
  },

  // PWA
  pwa: {
    enableInstallPrompt: true,
    enablePushNotifications: false, // Future feature
    cacheName: 'devtrack-africa-v1',
    cacheVersion: 1,
  },

  // Analytics (placeholder for future integration)
  analytics: {
    enabled: false, // Enable when ready
    trackPageViews: true,
    trackEvents: true,
    trackErrors: true,
    trackPerformance: true,
  },
};

// Type-safe feature flag checker
export function isFeatureEnabled(feature: keyof typeof PRODUCTION_CONFIG.features): boolean {
  if (PRODUCTION_CONFIG.isProduction) {
    return PRODUCTION_CONFIG.features[feature];
  }
  // In development, all features are enabled by default
  return true;
}

// Environment checker
export function getEnvironment(): 'production' | 'development' {
  return PRODUCTION_CONFIG.isProduction ? 'production' : 'development';
}

// Logger utility that respects production config
export const logger = {
  debug: (...args: any[]) => {
    if (PRODUCTION_CONFIG.isDevelopment || PRODUCTION_CONFIG.logging.enableConsoleLogging) {
      console.log('[DEBUG]', ...args);
    }
  },
  info: (...args: any[]) => {
    if (PRODUCTION_CONFIG.isDevelopment || PRODUCTION_CONFIG.logging.enableConsoleLogging) {
      console.info('[INFO]', ...args);
    }
  },
  warn: (...args: any[]) => {
    if (PRODUCTION_CONFIG.logging.logLevel !== 'error') {
      console.warn('[WARN]', ...args);
    }
  },
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args);
    // In production, send to error tracking service
    if (PRODUCTION_CONFIG.features.enableErrorTracking && PRODUCTION_CONFIG.isProduction) {
      // TODO: Send to error tracking service (e.g., Sentry)
    }
  },
};

// Performance monitoring
export const performanceMonitor = {
  mark: (name: string) => {
    if (PRODUCTION_CONFIG.features.enablePerformanceMonitoring) {
      performance.mark(name);
    }
  },
  measure: (name: string, startMark: string, endMark: string) => {
    if (PRODUCTION_CONFIG.features.enablePerformanceMonitoring) {
      try {
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name)[0];
        logger.debug(`Performance: ${name} took ${measure.duration.toFixed(2)}ms`);
      } catch (error) {
        logger.warn('Performance measurement failed:', error);
      }
    }
  },
};

export default PRODUCTION_CONFIG;
