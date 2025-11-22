/**
 * Performance Analyzer
 *
 * Tracks and analyzes:
 * - Core Web Vitals (LCP, FID, CLS)
 * - Performance metrics (TTFB, FCP, TTI)
 * - Resource loading times
 * - JavaScript bundle sizes
 * - Lighthouse-like scoring
 */

export interface CoreWebVitals {
  /** Largest Contentful Paint (ms) */
  lcp: number | null;
  /** First Input Delay (ms) */
  fid: number | null;
  /** Cumulative Layout Shift (score) */
  cls: number | null;
  /** Time to First Byte (ms) */
  ttfb: number | null;
  /** First Contentful Paint (ms) */
  fcp: number | null;
  /** Time to Interactive (ms) */
  tti: number | null;
}

export interface PerformanceMetrics extends CoreWebVitals {
  /** Page load time (ms) */
  loadTime: number;
  /** DOM Content Loaded (ms) */
  domContentLoaded: number;
  /** Total page size (bytes) */
  totalSize: number;
  /** Number of requests */
  requestCount: number;
  /** JavaScript size (bytes) */
  jsSize: number;
  /** CSS size (bytes) */
  cssSize: number;
  /** Image size (bytes) */
  imageSize: number;
  /** Performance score (0-100) */
  score: number;
}

export interface PerformanceIssue {
  type: 'critical' | 'warning' | 'info';
  metric: string;
  value: number;
  threshold: number;
  message: string;
  suggestion: string;
}

export interface PerformanceReport {
  metrics: PerformanceMetrics;
  issues: PerformanceIssue[];
  recommendations: string[];
  score: number;
  timestamp: number;
}

/**
 * Performance Analyzer Class
 */
export class PerformanceAnalyzer {
  private metrics: Partial<CoreWebVitals> = {
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
    fcp: null,
    tti: null,
  };

  private observers: PerformanceObserver[] = [];

  constructor() {
    if (typeof window === 'undefined') return;

    this.initWebVitals();
  }

  /**
   * Initialize Core Web Vitals tracking
   */
  private initWebVitals(): void {
    // Track LCP (Largest Contentful Paint)
    this.observeMetric('largest-contentful-paint', entries => {
      const lastEntry = entries[entries.length - 1] as any;
      this.metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
    });

    // Track FID (First Input Delay)
    this.observeMetric('first-input', entries => {
      const firstEntry = entries[0] as any;
      this.metrics.fid = firstEntry.processingStart - firstEntry.startTime;
    });

    // Track CLS (Cumulative Layout Shift)
    let clsScore = 0;
    this.observeMetric('layout-shift', entries => {
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsScore += entry.value;
          this.metrics.cls = clsScore;
        }
      });
    });

    // Track Navigation Timing
    if (performance.getEntriesByType) {
      const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationTiming) {
        this.metrics.ttfb = navigationTiming.responseStart - navigationTiming.requestStart;
      }
    }

    // Track FCP (First Contentful Paint)
    this.observeMetric('paint', entries => {
      const fcpEntry = entries.find((entry: any) => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        this.metrics.fcp = fcpEntry.startTime;
      }
    });
  }

  /**
   * Observe a performance metric
   */
  private observeMetric(type: string, callback: (entries: PerformanceEntry[]) => void): void {
    try {
      const observer = new PerformanceObserver(list => {
        callback(list.getEntries());
      });

      observer.observe({ type, buffered: true });
      this.observers.push(observer);
    } catch (error) {
      // Metric not supported in this browser
      console.debug(`Performance metric ${type} not supported`);
    }
  }

  /**
   * Get current Core Web Vitals
   */
  getWebVitals(): CoreWebVitals {
    return { ...this.metrics } as CoreWebVitals;
  }

  /**
   * Get complete performance metrics
   */
  async getMetrics(): Promise<PerformanceMetrics> {
    const timing = performance.timing;
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

    // Calculate resource sizes by type
    let jsSize = 0;
    let cssSize = 0;
    let imageSize = 0;
    let totalSize = 0;

    resources.forEach(resource => {
      const size = resource.transferSize || 0;
      totalSize += size;

      const type = resource.initiatorType;
      if (type === 'script') jsSize += size;
      else if (type === 'css' || type === 'link') cssSize += size;
      else if (type === 'img') imageSize += size;
    });

    const loadTime = timing.loadEventEnd - timing.navigationStart;
    const domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;

    const metrics: PerformanceMetrics = {
      ...this.metrics,
      loadTime,
      domContentLoaded,
      totalSize,
      requestCount: resources.length,
      jsSize,
      cssSize,
      imageSize,
      score: 0, // Will be calculated below
    };

    // Calculate performance score
    metrics.score = this.calculateScore(metrics);

    return metrics;
  }

  /**
   * Calculate Lighthouse-style performance score
   */
  private calculateScore(metrics: PerformanceMetrics): number {
    const weights = {
      fcp: 0.1,
      lcp: 0.25,
      fid: 0.1,
      cls: 0.15,
      ttfb: 0.1,
      tti: 0.1,
      size: 0.2,
    };

    let score = 0;

    // FCP score (0-3000ms)
    if (metrics.fcp !== null) {
      score += weights.fcp * this.getMetricScore(metrics.fcp, 1800, 3000);
    }

    // LCP score (0-4000ms)
    if (metrics.lcp !== null) {
      score += weights.lcp * this.getMetricScore(metrics.lcp, 2500, 4000);
    }

    // FID score (0-300ms)
    if (metrics.fid !== null) {
      score += weights.fid * this.getMetricScore(metrics.fid, 100, 300);
    }

    // CLS score (0-0.25)
    if (metrics.cls !== null) {
      score += weights.cls * this.getMetricScore(metrics.cls, 0.1, 0.25, true);
    }

    // TTFB score (0-600ms)
    if (metrics.ttfb !== null) {
      score += weights.ttfb * this.getMetricScore(metrics.ttfb, 200, 600);
    }

    // Size score (0-2MB)
    const sizeMB = metrics.totalSize / (1024 * 1024);
    score += weights.size * this.getMetricScore(sizeMB, 1, 2);

    return Math.round(score * 100);
  }

  /**
   * Convert metric value to 0-1 score
   */
  private getMetricScore(
    value: number,
    goodThreshold: number,
    poorThreshold: number,
    inverse: boolean = false
  ): number {
    if (inverse) {
      if (value <= goodThreshold) return 1;
      if (value >= poorThreshold) return 0;
      return 1 - (value - goodThreshold) / (poorThreshold - goodThreshold);
    }

    if (value <= goodThreshold) return 1;
    if (value >= poorThreshold) return 0;
    return 1 - (value - goodThreshold) / (poorThreshold - goodThreshold);
  }

  /**
   * Generate performance report with issues and recommendations
   */
  async generateReport(): Promise<PerformanceReport> {
    const metrics = await this.getMetrics();
    const issues: PerformanceIssue[] = [];
    const recommendations: string[] = [];

    // Check LCP
    if (metrics.lcp !== null) {
      if (metrics.lcp > 4000) {
        issues.push({
          type: 'critical',
          metric: 'LCP',
          value: metrics.lcp,
          threshold: 2500,
          message: 'Largest Contentful Paint is too slow',
          suggestion: 'Optimize images, remove render-blocking resources, use CDN',
        });
      } else if (metrics.lcp > 2500) {
        issues.push({
          type: 'warning',
          metric: 'LCP',
          value: metrics.lcp,
          threshold: 2500,
          message: 'Largest Contentful Paint needs improvement',
          suggestion: 'Preload critical images, optimize server response time',
        });
      }
    }

    // Check FID
    if (metrics.fid !== null) {
      if (metrics.fid > 300) {
        issues.push({
          type: 'critical',
          metric: 'FID',
          value: metrics.fid,
          threshold: 100,
          message: 'First Input Delay is too high',
          suggestion: 'Split JavaScript bundles, use code splitting, defer non-critical JS',
        });
      } else if (metrics.fid > 100) {
        issues.push({
          type: 'warning',
          metric: 'FID',
          value: metrics.fid,
          threshold: 100,
          message: 'First Input Delay needs improvement',
          suggestion: 'Reduce JavaScript execution time, use web workers',
        });
      }
    }

    // Check CLS
    if (metrics.cls !== null) {
      if (metrics.cls > 0.25) {
        issues.push({
          type: 'critical',
          metric: 'CLS',
          value: metrics.cls,
          threshold: 0.1,
          message: 'Cumulative Layout Shift is too high',
          suggestion: 'Add width/height to images, reserve space for ads, avoid inserting content above existing content',
        });
      } else if (metrics.cls > 0.1) {
        issues.push({
          type: 'warning',
          metric: 'CLS',
          value: metrics.cls,
          threshold: 0.1,
          message: 'Cumulative Layout Shift needs improvement',
          suggestion: 'Use aspect-ratio CSS, preload fonts, avoid layout shifts',
        });
      }
    }

    // Check page size
    const sizeMB = metrics.totalSize / (1024 * 1024);
    if (sizeMB > 3) {
      issues.push({
        type: 'critical',
        metric: 'Page Size',
        value: sizeMB,
        threshold: 1,
        message: 'Page size is too large',
        suggestion: 'Compress images, minify JS/CSS, use lazy loading, enable Brotli compression',
      });
    } else if (sizeMB > 1.5) {
      issues.push({
        type: 'warning',
        metric: 'Page Size',
        value: sizeMB,
        threshold: 1,
        message: 'Page size could be reduced',
        suggestion: 'Optimize images, remove unused CSS/JS, use code splitting',
      });
    }

    // Check JavaScript size
    const jsSizeMB = metrics.jsSize / (1024 * 1024);
    if (jsSizeMB > 1) {
      issues.push({
        type: 'warning',
        metric: 'JavaScript Size',
        value: jsSizeMB,
        threshold: 0.5,
        message: 'JavaScript bundle is large',
        suggestion: 'Use dynamic imports, tree-shake unused code, split vendors',
      });
    }

    // Generate recommendations based on score
    if (metrics.score < 50) {
      recommendations.push('Consider using a CDN for static assets');
      recommendations.push('Enable HTTP/2 or HTTP/3');
      recommendations.push('Implement aggressive caching strategies');
      recommendations.push('Use a service worker for offline support');
    } else if (metrics.score < 90) {
      recommendations.push('Optimize images using WebP or AVIF format');
      recommendations.push('Lazy load below-the-fold content');
      recommendations.push('Preload critical resources');
    }

    return {
      metrics,
      issues,
      recommendations,
      score: metrics.score,
      timestamp: Date.now(),
    };
  }

  /**
   * Track a custom performance mark
   */
  mark(name: string): void {
    performance.mark(name);
  }

  /**
   * Measure time between two marks
   */
  measure(name: string, startMark: string, endMark?: string): number {
    if (endMark) {
      performance.measure(name, startMark, endMark);
    } else {
      performance.measure(name, startMark);
    }

    const measure = performance.getEntriesByName(name, 'measure')[0];
    return measure?.duration || 0;
  }

  /**
   * Get resource timing for specific URLs
   */
  getResourceTiming(url: string): PerformanceResourceTiming | undefined {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    return resources.find(r => r.name.includes(url));
  }

  /**
   * Clear all performance data
   */
  clear(): void {
    performance.clearMarks();
    performance.clearMeasures();
    performance.clearResourceTimings();
  }

  /**
   * Disconnect all observers
   */
  disconnect(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

/**
 * Singleton instance
 */
let analyzerInstance: PerformanceAnalyzer | null = null;

export function getPerformanceAnalyzer(): PerformanceAnalyzer {
  if (!analyzerInstance) {
    analyzerInstance = new PerformanceAnalyzer();
  }
  return analyzerInstance;
}

/**
 * Monitor performance and send to analytics
 */
export async function monitorPerformance(
  callback: (report: PerformanceReport) => void
): Promise<void> {
  const analyzer = getPerformanceAnalyzer();

  // Wait for page load to complete
  if (document.readyState === 'complete') {
    const report = await analyzer.generateReport();
    callback(report);
  } else {
    window.addEventListener('load', async () => {
      // Wait a bit for LCP to stabilize
      setTimeout(async () => {
        const report = await analyzer.generateReport();
        callback(report);
      }, 1000);
    });
  }
}

/**
 * Get performance budget recommendations
 */
export interface PerformanceBudget {
  metric: string;
  budget: number;
  current: number;
  status: 'good' | 'warning' | 'critical';
}

export async function checkPerformanceBudget(): Promise<PerformanceBudget[]> {
  const analyzer = getPerformanceAnalyzer();
  const metrics = await analyzer.getMetrics();

  const budgets: PerformanceBudget[] = [
    {
      metric: 'LCP',
      budget: 2500,
      current: metrics.lcp || 0,
      status: (metrics.lcp || 0) <= 2500 ? 'good' : (metrics.lcp || 0) <= 4000 ? 'warning' : 'critical',
    },
    {
      metric: 'FID',
      budget: 100,
      current: metrics.fid || 0,
      status: (metrics.fid || 0) <= 100 ? 'good' : (metrics.fid || 0) <= 300 ? 'warning' : 'critical',
    },
    {
      metric: 'CLS',
      budget: 0.1,
      current: metrics.cls || 0,
      status: (metrics.cls || 0) <= 0.1 ? 'good' : (metrics.cls || 0) <= 0.25 ? 'warning' : 'critical',
    },
    {
      metric: 'Page Size (MB)',
      budget: 1,
      current: metrics.totalSize / (1024 * 1024),
      status:
        metrics.totalSize / (1024 * 1024) <= 1
          ? 'good'
          : metrics.totalSize / (1024 * 1024) <= 2
            ? 'warning'
            : 'critical',
    },
  ];

  return budgets;
}
