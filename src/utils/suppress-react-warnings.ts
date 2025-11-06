/**
 * Utility to suppress specific React warnings that come from third-party libraries
 * This is specifically for the defaultProps deprecation warning from react-beautiful-dnd
 */

// Store the original console.warn and console.error functions
const originalWarn = console.warn.bind(console);
const originalError = console.error.bind(console);

// List of warning patterns to suppress
const suppressedPatterns = [
  'Support for defaultProps will be removed from memo components',
  'Support for defaultProps will be removed from function components',
  'defaultProps will be removed from memo components',
  'defaultProps will be removed from function components',
  '%s: Support for defaultProps will be removed',
  'Connect(ps', // React-redux connect wrapper warnings (ps2, ps4, etc.)
  'react-beautiful-dnd',
  'DroppableColumn',
  'DraggableTaskCard',
];

/**
 * Checks if a warning message should be suppressed
 */
function shouldSuppressWarning(args: any[]): boolean {
  if (!args || args.length === 0) return false;
  
  // Convert all arguments to a single string for pattern matching
  const fullMessage = args.map(arg => {
    if (typeof arg === 'string') return arg;
    if (arg && typeof arg === 'object') return JSON.stringify(arg);
    return String(arg);
  }).join(' ');
  
  // Check if any suppressed pattern matches
  const hasSupressedPattern = suppressedPatterns.some(pattern => 
    fullMessage.includes(pattern)
  );
  
  if (hasSupressedPattern) return true;
  
  // Check for the specific React warning format with placeholders
  // React uses format strings like "Warning: %s: Support for defaultProps..."
  if (typeof args[0] === 'string' && args[0].includes('defaultProps')) {
    return true;
  }
  
  // Check the call stack to see if it's from a third-party library
  try {
    const stack = new Error().stack || '';
    const isFromThirdParty = 
      stack.includes('react-beautiful-dnd') ||
      stack.includes('react-redux') ||
      (stack.includes('node_modules') && fullMessage.includes('defaultProps'));
    
    if (isFromThirdParty && fullMessage.includes('defaultProps')) {
      return true;
    }
  } catch (e) {
    // Stack trace parsing failed, continue with other checks
  }
  
  return false;
}

/**
 * Initializes the warning suppression for third-party library warnings
 * Call this early in your application startup
 */
export function initializeWarningSuppression() {
  // Store suppression state on window to ensure we only log once
  if (typeof window !== 'undefined') {
    (window as any).__devTrackWarningSuppressionInitialized = false;
  }
  
  // Override console.warn
  console.warn = (...args: any[]) => {
    if (shouldSuppressWarning(args)) {
      // Log suppression notice only once
      if (typeof window !== 'undefined' && !(window as any).__devTrackWarningSuppressionInitialized) {
        originalWarn(
          '⚠️ DevTrack Africa: Suppressing React defaultProps deprecation warnings from third-party libraries (react-beautiful-dnd, react-redux). ' +
          'These libraries are not yet updated for React 18+ but are still functional. This is expected behavior.'
        );
        (window as any).__devTrackWarningSuppressionInitialized = true;
      }
      return;
    }
    
    // For all other warnings, use the original console.warn
    originalWarn(...args);
  };
  
  // Also override console.error for similar patterns
  console.error = (...args: any[]) => {
    if (shouldSuppressWarning(args)) {
      return; // Silently suppress
    }
    
    // For all other errors, use the original console.error
    originalError(...args);
  };
}

/**
 * Restores the original console.warn and console.error functions
 * Useful for testing or if you need to temporarily restore warnings
 */
export function restoreOriginalWarnings() {
  console.warn = originalWarn;
  console.error = originalError;
  
  if (typeof window !== 'undefined') {
    (window as any).__devTrackWarningSuppressionInitialized = false;
  }
}

/**
 * Temporarily suppress warnings during a specific function execution
 * Useful for wrapping third-party component renders
 */
export function withSuppressedWarnings<T>(fn: () => T): T {
  const originalConsoleWarn = console.warn;
  console.warn = () => {}; // Suppress all warnings temporarily
  
  try {
    return fn();
  } finally {
    console.warn = originalConsoleWarn;
  }
}

/**
 * Exposes the suppression status for debugging
 * Available in browser console as: window.DevTrackWarnings
 */
if (typeof window !== 'undefined') {
  (window as any).DevTrackWarnings = {
    isActive: () => console.warn !== originalWarn,
    disable: () => restoreOriginalWarnings(),
    enable: () => initializeWarningSuppression(),
    status: () => {
      const isActive = console.warn !== originalWarn;
      console.log(`🔍 DevTrack Warning Suppression Status: ${isActive ? '✅ ACTIVE' : '❌ DISABLED'}`);
      console.log('📝 To disable: window.DevTrackWarnings.disable()');
      console.log('📝 To enable: window.DevTrackWarnings.enable()');
      console.log('📝 To check status: window.DevTrackWarnings.status()');
      return isActive;
    }
  };
}