import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

interface PerformanceMetrics {
  cls: number;
  fid: number;
  fcp: number;
  lcp: number;
  ttfb: number;
}

let metrics: Partial<PerformanceMetrics> = {};

export function reportWebVitals(onPerfEntry?: (metric: any) => void) {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
}

export function collectMetrics(metric: any) {
  metrics[metric.name as keyof PerformanceMetrics] = metric.value;

  // Log metrics in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`📊 ${metric.name}:`, metric.value, metric);
  }

  // Send to analytics in production
  if (process.env.NODE_ENV === 'production' && window.gtag) {
    window.gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_category: 'Web Vitals',
      event_label: metric.id,
      non_interaction: true,
    });
  }
}

export function getMetrics(): Partial<PerformanceMetrics> {
  return metrics;
}

// Custom performance monitoring
export class PerformanceMonitor {
  private static measurements: Map<string, number> = new Map();

  static start(label: string) {
    this.measurements.set(label, performance.now());
  }

  static end(label: string): number {
    const start = this.measurements.get(label);
    if (!start) return 0;

    const duration = performance.now() - start;
    this.measurements.delete(label);

    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ ${label}:`, duration.toFixed(2), 'ms');
    }

    return duration;
  }

  static measure<T>(label: string, fn: () => T): T {
    this.start(label);
    const result = fn();
    this.end(label);
    return result;
  }

  static async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.start(label);
    const result = await fn();
    this.end(label);
    return result;
  }
}

// Memory usage monitoring
export function getMemoryUsage(): MemoryInfo | null {
  return 'memory' in performance ? (performance as any).memory : null;
}

// Intersection Observer for lazy loading performance
export function createIntersectionObserver(
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
): IntersectionObserver {
  return new IntersectionObserver(callback, {
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  });
}

// Resource timing monitoring
export function getResourceTiming(): PerformanceResourceTiming[] {
  return performance.getEntriesByType('resource') as PerformanceResourceTiming[];
}

export function analyzeResources() {
  const resources = getResourceTiming();
  const analysis = {
    totalResources: resources.length,
    totalSize: 0,
    slowResources: resources.filter(r => r.duration > 1000),
    largeResources: resources.filter(r => r.transferSize > 100000),
  };

  if (process.env.NODE_ENV === 'development') {
    console.log('📦 Resource Analysis:', analysis);
  }

  return analysis;
}

// Performance monitoring hook
export function usePerformanceMonitor() {
  const mark = (name: string) => {
    if (typeof window !== 'undefined') {
      performance.mark(`${name}-start`);
    }
  };

  const measure = (name: string) => {
    if (typeof window !== 'undefined') {
      try {
        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);
        const entry = performance.getEntriesByName(name, 'measure')[0];
        return entry.duration;
      } catch (error) {
        console.warn('Performance measurement failed:', error);
        return 0;
      }
    }
    return 0;
  };

  return { mark, measure };
}

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}