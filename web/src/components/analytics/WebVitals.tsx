/**
 * Web Vitals Monitoring Component
 *
 * Tracks Core Web Vitals and logs them to console (and optionally to Convex).
 * Monitors: LCP, FID, CLS, FCP, TTFB, INP
 *
 * @see /one/events/performance-baseline-cycle-81.md
 */

"use client";

import { useEffect } from "react";

type Metric = {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  id: string;
};

/**
 * Report metric to analytics
 * TODO: Send to Convex or analytics service
 */
function reportMetric(metric: Metric) {
  // Log to console for now
  console.log(`[Web Vitals] ${metric.name}:`, {
    value: metric.value,
    rating: metric.rating,
    id: metric.id,
  });

  // TODO: Send to Convex
  // await convex.mutation(api.mutations.analytics.logWebVital, {
  //   metric: metric.name,
  //   value: metric.value,
  //   rating: metric.rating,
  //   page: window.location.pathname,
  //   sessionId: getSessionId(),
  // });
}

export function WebVitals() {
  useEffect(() => {
    // Dynamic import to avoid SSR issues
    if (typeof window === "undefined") return;

    import("web-vitals").then(({ onCLS, onFID, onLCP, onFCP, onTTFB, onINP }) => {
      // Cumulative Layout Shift (target: < 0.1)
      onCLS(reportMetric);

      // First Input Delay (target: < 100ms)
      onFID(reportMetric);

      // Largest Contentful Paint (target: < 2.5s)
      onLCP(reportMetric);

      // First Contentful Paint (target: < 1.8s)
      onFCP(reportMetric);

      // Time to First Byte (target: < 800ms)
      onTTFB(reportMetric);

      // Interaction to Next Paint (target: < 200ms)
      onINP(reportMetric);
    });
  }, []);

  // No UI rendered
  return null;
}
