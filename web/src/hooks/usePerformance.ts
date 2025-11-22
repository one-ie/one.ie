/**
 * Performance Monitoring Hooks
 *
 * React hooks for tracking performance metrics in components
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  getPerformanceAnalyzer,
  type PerformanceReport,
  type CoreWebVitals,
  type PerformanceMetrics,
} from '@/lib/performance/performance-analyzer';

/**
 * Hook to monitor Core Web Vitals
 *
 * @example
 * ```tsx
 * function App() {
 *   const vitals = useWebVitals();
 *
 *   return (
 *     <div>
 *       <p>LCP: {vitals.lcp}ms</p>
 *       <p>FID: {vitals.fid}ms</p>
 *       <p>CLS: {vitals.cls}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useWebVitals() {
  const [vitals, setVitals] = useState<CoreWebVitals>({
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
    fcp: null,
    tti: null,
  });

  useEffect(() => {
    const analyzer = getPerformanceAnalyzer();

    // Update vitals periodically
    const interval = setInterval(() => {
      setVitals(analyzer.getWebVitals());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return vitals;
}

/**
 * Hook to get full performance metrics
 *
 * @example
 * ```tsx
 * function PerformanceWidget() {
 *   const { metrics, loading, refresh } = usePerformanceMetrics();
 *
 *   if (loading) return <p>Loading...</p>;
 *
 *   return (
 *     <div>
 *       <p>Score: {metrics.score}/100</p>
 *       <p>Page Size: {metrics.totalSize} bytes</p>
 *       <button onClick={refresh}>Refresh</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const analyzer = getPerformanceAnalyzer();
      const newMetrics = await analyzer.getMetrics();
      setMetrics(newMetrics);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load metrics'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  return {
    metrics,
    loading,
    error,
    refresh: loadMetrics,
  };
}

/**
 * Hook to generate performance report
 *
 * @example
 * ```tsx
 * function PerformanceReport() {
 *   const { report, loading, refresh } = usePerformanceReport();
 *
 *   if (loading) return <p>Generating report...</p>;
 *
 *   return (
 *     <div>
 *       <h2>Performance Score: {report.score}/100</h2>
 *       <h3>Issues ({report.issues.length})</h3>
 *       {report.issues.map((issue, i) => (
 *         <div key={i}>
 *           <p>{issue.message}</p>
 *           <p>{issue.suggestion}</p>
 *         </div>
 *       ))}
 *       <button onClick={refresh}>Refresh</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function usePerformanceReport() {
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const generateReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const analyzer = getPerformanceAnalyzer();
      const newReport = await analyzer.generateReport();
      setReport(newReport);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to generate report'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    generateReport();
  }, [generateReport]);

  return {
    report,
    loading,
    error,
    refresh: generateReport,
  };
}

/**
 * Hook to track custom performance marks
 *
 * @example
 * ```tsx
 * function CheckoutFlow() {
 *   const { mark, measure } = usePerformanceMark('checkout');
 *
 *   const handleCheckout = async () => {
 *     mark('start');
 *
 *     // ... checkout process ...
 *
 *     mark('end');
 *     const duration = measure('start', 'end');
 *     console.log(`Checkout took ${duration}ms`);
 *   };
 *
 *   return <button onClick={handleCheckout}>Checkout</button>;
 * }
 * ```
 */
export function usePerformanceMark(name: string) {
  const analyzer = useRef(getPerformanceAnalyzer());

  const mark = useCallback(
    (label: string) => {
      analyzer.current.mark(`${name}-${label}`);
    },
    [name]
  );

  const measure = useCallback(
    (startLabel: string, endLabel?: string) => {
      const startMark = `${name}-${startLabel}`;
      const endMark = endLabel ? `${name}-${endLabel}` : undefined;
      return analyzer.current.measure(`${name}-duration`, startMark, endMark);
    },
    [name]
  );

  return { mark, measure };
}

/**
 * Hook to track component render performance
 *
 * @example
 * ```tsx
 * function ExpensiveComponent() {
 *   const renderTime = useRenderTime('ExpensiveComponent');
 *
 *   return (
 *     <div>
 *       <p>Last render: {renderTime}ms</p>
 *       {/* ... component content ... *\/}
 *     </div>
 *   );
 * }
 * ```
 */
export function useRenderTime(componentName: string) {
  const [renderTime, setRenderTime] = useState<number>(0);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    // Measure render time
    const endTime = performance.now();
    const duration = endTime - startTimeRef.current;
    setRenderTime(duration);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName} rendered in ${duration.toFixed(2)}ms`);
    }
  });

  // Record start time before each render
  startTimeRef.current = performance.now();

  return renderTime;
}

/**
 * Hook to monitor page visibility and performance
 *
 * @example
 * ```tsx
 * function App() {
 *   const { isVisible, timeHidden, timeVisible } = usePageVisibility();
 *
 *   return (
 *     <div>
 *       <p>Page is {isVisible ? 'visible' : 'hidden'}</p>
 *       <p>Time visible: {timeVisible}ms</p>
 *       <p>Time hidden: {timeHidden}ms</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function usePageVisibility() {
  const [isVisible, setIsVisible] = useState(!document.hidden);
  const [timeVisible, setTimeVisible] = useState(0);
  const [timeHidden, setTimeHidden] = useState(0);
  const lastChangeRef = useRef(Date.now());

  useEffect(() => {
    const handleVisibilityChange = () => {
      const now = Date.now();
      const duration = now - lastChangeRef.current;

      if (document.hidden) {
        setIsVisible(false);
        setTimeVisible(prev => prev + duration);
      } else {
        setIsVisible(true);
        setTimeHidden(prev => prev + duration);
      }

      lastChangeRef.current = now;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return {
    isVisible,
    timeVisible,
    timeHidden,
  };
}

/**
 * Hook to track resource loading
 *
 * @example
 * ```tsx
 * function ResourceMonitor() {
 *   const resources = useResourceTiming();
 *
 *   return (
 *     <ul>
 *       {resources.map((resource, i) => (
 *         <li key={i}>
 *           {resource.name}: {resource.duration}ms
 *         </li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export function useResourceTiming() {
  const [resources, setResources] = useState<PerformanceResourceTiming[]>([]);

  useEffect(() => {
    const updateResources = () => {
      const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      setResources(entries);
    };

    // Initial load
    updateResources();

    // Update on new resources
    const observer = new PerformanceObserver(() => {
      updateResources();
    });

    observer.observe({ entryTypes: ['resource'] });

    return () => observer.disconnect();
  }, []);

  return resources;
}

/**
 * Hook to detect slow network
 *
 * @example
 * ```tsx
 * function App() {
 *   const isSlowNetwork = useSlowNetwork();
 *
 *   return (
 *     <div>
 *       {isSlowNetwork && (
 *         <Banner>You're on a slow network. Some features may be limited.</Banner>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useSlowNetwork() {
  const [isSlowNetwork, setIsSlowNetwork] = useState(false);

  useEffect(() => {
    // Check Network Information API
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;

      const checkConnection = () => {
        const effectiveType = connection.effectiveType;
        // Consider 'slow-2g', '2g' as slow
        setIsSlowNetwork(effectiveType === 'slow-2g' || effectiveType === '2g');
      };

      checkConnection();
      connection.addEventListener('change', checkConnection);

      return () => {
        connection.removeEventListener('change', checkConnection);
      };
    }
  }, []);

  return isSlowNetwork;
}

/**
 * Hook to detect save-data mode
 *
 * @example
 * ```tsx
 * function ImageGallery() {
 *   const saveDataMode = useSaveDataMode();
 *
 *   return (
 *     <div>
 *       {saveDataMode ? (
 *         <p>Images hidden to save data</p>
 *       ) : (
 *         <img src="large-image.jpg" />
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useSaveDataMode() {
  const [saveData, setSaveData] = useState(false);

  useEffect(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setSaveData(connection.saveData === true);
    }
  }, []);

  return saveData;
}
