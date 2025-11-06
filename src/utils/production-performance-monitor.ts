/**
 * Production Performance Monitor
 * Tracks and reports performance metrics
 */

import { logger, PRODUCTION_CONFIG } from '../production.config';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  category: 'navigation' | 'resource' | 'custom' | 'vitals';
}

interface WebVitals {
  FCP?: number; // First Contentful Paint
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  TTFB?: number; // Time to First Byte
}

class PerformanceMonitorService {
  private metrics: PerformanceMetric[] = [];
  private vitals: WebVitals = {};
  private observers: Map<string, PerformanceObserver> = new Map();

  constructor() {
    if (PRODUCTION_CONFIG.features.enablePerformanceMonitoring) {
      this.initializeMonitoring();
    }
  }

  private initializeMonitoring() {
    // Monitor navigation timing
    this.observeNavigationTiming();

    // Monitor resource loading
    this.observeResourceTiming();

    // Monitor Web Vitals
    this.observeWebVitals();

    // Monitor long tasks
    this.observeLongTasks();

    // Log metrics on page unload
    this.setupUnloadHandler();
  }

  private observeNavigationTiming() {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming;
              this.recordMetric('DNS Lookup', navEntry.domainLookupEnd - navEntry.domainLookupStart, 'navigation');
              this.recordMetric('TCP Connection', navEntry.connectEnd - navEntry.connectStart, 'navigation');
              this.recordMetric('Request', navEntry.responseStart - navEntry.requestStart, 'navigation');
              this.recordMetric('Response', navEntry.responseEnd - navEntry.responseStart, 'navigation');
              this.recordMetric('DOM Processing', navEntry.domComplete - navEntry.domInteractive, 'navigation');
              this.recordMetric('Load Complete', navEntry.loadEventEnd - navEntry.loadEventStart, 'navigation');
              this.recordMetric('Total Page Load', navEntry.loadEventEnd - navEntry.fetchStart, 'navigation');
            }
          }
        });
        observer.observe({ entryTypes: ['navigation'] });
        this.observers.set('navigation', observer);
      } catch (error) {
        logger.warn('Navigation timing observation failed:', error);
      }
    }
  }

  private observeResourceTiming() {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const resourceEntry = entry as PerformanceResourceTiming;
            
            // Only track significant resources
            if (resourceEntry.duration > 100) { // > 100ms
              this.recordMetric(
                `Resource: ${this.getResourceName(resourceEntry.name)}`,
                resourceEntry.duration,
                'resource'
              );
            }
          }
        });
        observer.observe({ entryTypes: ['resource'] });
        this.observers.set('resource', observer);
      } catch (error) {
        logger.warn('Resource timing observation failed:', error);
      }
    }
  }

  private observeWebVitals() {
    // First Contentful Paint
    this.observePaint('first-contentful-paint', 'FCP');

    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            this.vitals.LCP = lastEntry.startTime;
            this.recordMetric('LCP', lastEntry.startTime, 'vitals');
          }
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.set('lcp', observer);
      } catch (error) {
        logger.warn('LCP observation failed:', error);
      }
    }

    // First Input Delay
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const fidEntry = entry as PerformanceEventTiming;
            this.vitals.FID = fidEntry.processingStart - fidEntry.startTime;
            this.recordMetric('FID', this.vitals.FID, 'vitals');
          }
        });
        observer.observe({ entryTypes: ['first-input'] });
        this.observers.set('fid', observer);
      } catch (error) {
        logger.warn('FID observation failed:', error);
      }
    }

    // Cumulative Layout Shift
    if ('PerformanceObserver' in window) {
      try {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
              this.vitals.CLS = clsValue;
            }
          }
          this.recordMetric('CLS', clsValue, 'vitals');
        });
        observer.observe({ entryTypes: ['layout-shift'] });
        this.observers.set('cls', observer);
      } catch (error) {
        logger.warn('CLS observation failed:', error);
      }
    }
  }

  private observePaint(name: string, vitalKey: keyof WebVitals) {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === name) {
              this.vitals[vitalKey] = entry.startTime;
              this.recordMetric(name, entry.startTime, 'vitals');
            }
          }
        });
        observer.observe({ entryTypes: ['paint'] });
        this.observers.set(name, observer);
      } catch (error) {
        logger.warn(`${name} observation failed:`, error);
      }
    }
  }

  private observeLongTasks() {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric('Long Task', entry.duration, 'custom');
            logger.warn('Long task detected:', entry.duration.toFixed(2), 'ms');
          }
        });
        observer.observe({ entryTypes: ['longtask'] });
        this.observers.set('longtask', observer);
      } catch (error) {
        // Long task API not supported
      }
    }
  }

  private setupUnloadHandler() {
    window.addEventListener('beforeunload', () => {
      this.reportMetrics();
    });

    // Also report on visibility change (when tab is closed or hidden)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.reportMetrics();
      }
    });
  }

  private recordMetric(
    name: string,
    value: number,
    category: PerformanceMetric['category']
  ) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      category,
    };

    this.metrics.push(metric);

    // Log in development
    if (PRODUCTION_CONFIG.isDevelopment) {
      logger.debug(`Performance: ${name} = ${value.toFixed(2)}ms`);
    }

    // Keep only recent metrics (last 100)
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  public mark(name: string) {
    if (PRODUCTION_CONFIG.features.enablePerformanceMonitoring) {
      performance.mark(name);
    }
  }

  public measure(name: string, startMark: string, endMark?: string) {
    if (PRODUCTION_CONFIG.features.enablePerformanceMonitoring) {
      try {
        performance.measure(name, startMark, endMark);
        const measures = performance.getEntriesByName(name, 'measure');
        if (measures.length > 0) {
          const measure = measures[measures.length - 1];
          this.recordMetric(name, measure.duration, 'custom');
        }
      } catch (error) {
        logger.warn('Performance measure failed:', error);
      }
    }
  }

  public measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const startMark = `${name}-start`;
    const endMark = `${name}-end`;
    
    this.mark(startMark);
    
    return fn().then(
      (result) => {
        this.mark(endMark);
        this.measure(name, startMark, endMark);
        return result;
      },
      (error) => {
        this.mark(endMark);
        this.measure(name, startMark, endMark);
        throw error;
      }
    );
  }

  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  public getWebVitals(): WebVitals {
    return { ...this.vitals };
  }

  public getSummary() {
    const summary = {
      vitals: this.vitals,
      navigation: this.metrics.filter(m => m.category === 'navigation'),
      resources: this.metrics.filter(m => m.category === 'resource'),
      custom: this.metrics.filter(m => m.category === 'custom'),
    };

    return summary;
  }

  private reportMetrics() {
    if (PRODUCTION_CONFIG.features.enablePerformanceMonitoring) {
      const summary = this.getSummary();
      
      // Log summary
      logger.info('Performance Summary:', summary);

      // Store in localStorage for analysis
      try {
        localStorage.setItem('performance_summary', JSON.stringify({
          timestamp: new Date().toISOString(),
          summary,
        }));
      } catch (error) {
        logger.warn('Failed to store performance summary:', error);
      }

      // TODO: Send to analytics service
      // if (PRODUCTION_CONFIG.analytics.enabled) {
      //   sendToAnalytics(summary);
      // }
    }
  }

  private getResourceName(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const parts = pathname.split('/');
      return parts[parts.length - 1] || 'root';
    } catch {
      return 'unknown';
    }
  }

  public disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitorService();

// Helper function to track component rendering
export function trackComponentRender(componentName: string) {
  return function <T extends React.ComponentType<any>>(Component: T): T {
    if (!PRODUCTION_CONFIG.features.enablePerformanceMonitoring) {
      return Component;
    }

    return class extends (Component as any) {
      componentDidMount() {
        performanceMonitor.mark(`${componentName}-mount-end`);
        super.componentDidMount?.();
      }

      componentWillUnmount() {
        performanceMonitor.mark(`${componentName}-unmount`);
        super.componentWillUnmount?.();
      }

      render() {
        performanceMonitor.mark(`${componentName}-render-start`);
        const result = super.render();
        performanceMonitor.mark(`${componentName}-render-end`);
        performanceMonitor.measure(
          `${componentName}-render`,
          `${componentName}-render-start`,
          `${componentName}-render-end`
        );
        return result;
      }
    } as any;
  };
}

// Hook for functional components
export function usePerformanceTracking(componentName: string) {
  React.useEffect(() => {
    const mountMark = `${componentName}-mount`;
    performanceMonitor.mark(mountMark);

    return () => {
      const unmountMark = `${componentName}-unmount`;
      performanceMonitor.mark(unmountMark);
      performanceMonitor.measure(
        `${componentName}-lifecycle`,
        mountMark,
        unmountMark
      );
    };
  }, [componentName]);
}

export default performanceMonitor;
