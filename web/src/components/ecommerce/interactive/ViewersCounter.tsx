/**
 * Real-Time Viewers Counter Component
 * Displays "X people viewing this now" with eye icon
 * Randomizes viewer count for urgency
 */

'use client';

import { useEffect, useState, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ViewersCounterProps {
  productId: string;
  minViewers?: number;
  maxViewers?: number;
  updateInterval?: number; // milliseconds
  size?: 'sm' | 'md' | 'lg';
}

// Deterministic random generator using product ID and timestamp
function getInitialViewerCount(productId: string, minViewers: number, maxViewers: number): number {
  // Use product ID hash to seed deterministic value
  let hash = 0;
  for (let i = 0; i < productId.length; i++) {
    hash = ((hash << 5) - hash) + productId.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  // Ensure positive number and map to range
  const normalized = Math.abs(hash) % (maxViewers - minViewers + 1);
  return minViewers + normalized;
}

export function ViewersCounter({
  productId,
  minViewers = 2,
  maxViewers = 15,
  updateInterval = 8000,
  size = 'sm'
}: ViewersCounterProps) {
  const clientId = useId();
  const [viewerCount, setViewerCount] = useState<number>(() =>
    getInitialViewerCount(productId, minViewers, maxViewers)
  );
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Set mounted flag to indicate hydration is complete
    setIsMounted(true);

    // Update viewer count at intervals with realistic fluctuation
    const timer = setInterval(() => {
      setViewerCount((prev) => {
        // Small random change (-2 to +3)
        const change = Math.floor(Math.random() * 6) - 2;
        const newCount = prev + change;

        // Keep within bounds
        return Math.max(minViewers, Math.min(maxViewers, newCount));
      });
    }, updateInterval);

    return () => clearInterval(timer);
  }, [minViewers, maxViewers, updateInterval]);

  const sizeClasses = {
    sm: 'text-xs gap-1.5',
    md: 'text-sm gap-2',
    lg: 'text-base gap-2.5',
  };

  const iconSize = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div className={`inline-flex items-center ${sizeClasses[size]} text-muted-foreground`}>
      {/* Eye Icon */}
      <svg
        className={`${iconSize[size]} text-primary`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
      </svg>

      {/* Animated Count */}
      <span className="font-medium">
        <AnimatePresence mode="wait">
          {isMounted && (
            <motion.span
              key={viewerCount}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="inline-block"
            >
              {viewerCount}
            </motion.span>
          )}
          {!isMounted && <span className="inline-block">{viewerCount}</span>}
        </AnimatePresence>
        {' '}
        {viewerCount === 1 ? 'person' : 'people'} viewing
      </span>

      {/* Pulse indicator */}
      {isMounted && (
        <motion.span
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`inline-block rounded-full bg-green-500 ${
            size === 'sm' ? 'h-1.5 w-1.5' : size === 'md' ? 'h-2 w-2' : 'h-2.5 w-2.5'
          }`}
          aria-hidden="true"
        />
      )}
      {!isMounted && (
        <span
          className={`inline-block rounded-full bg-green-500 ${
            size === 'sm' ? 'h-1.5 w-1.5' : size === 'md' ? 'h-2 w-2' : 'h-2.5 w-2.5'
          }`}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
