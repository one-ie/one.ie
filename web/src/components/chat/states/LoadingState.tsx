/**
 * CYCLE 75: LoadingState Component
 *
 * Enhanced skeleton loaders with shimmer animation:
 * - Message skeletons (grouped)
 * - Sidebar skeletons
 * - Composer skeleton
 * - Custom pattern support
 *
 * Features:
 * - Shimmer effect (gradient sweep)
 * - Respects prefers-reduced-motion
 * - Customizable count and pattern
 * - Dark mode support
 */

"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type LoadingStateType =
  | "messages"
  | "sidebar"
  | "composer"
  | "threads"
  | "search"
  | "custom";

interface LoadingStateProps {
  type: LoadingStateType;
  count?: number;
  className?: string;
  showShimmer?: boolean;
}

export function LoadingState({
  type,
  count = 5,
  className,
  showShimmer = true
}: LoadingStateProps) {
  const Shimmer = () =>
    showShimmer ? (
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent" />
    ) : null;

  if (type === "messages") {
    return (
      <div className={cn("flex flex-col gap-4 p-6", className)} role="status" aria-label="Loading messages">
        <span className="sr-only">Loading messages...</span>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex gap-3">
            {/* Avatar */}
            <div className="relative overflow-hidden">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Shimmer />
            </div>

            {/* Message content */}
            <div className="flex-1 space-y-2">
              {/* Username + timestamp */}
              <div className="flex gap-2">
                <div className="relative overflow-hidden">
                  <Skeleton className="h-4 w-32" />
                  <Shimmer />
                </div>
                <div className="relative overflow-hidden">
                  <Skeleton className="h-4 w-16" />
                  <Shimmer />
                </div>
              </div>

              {/* Message text (random widths for realism) */}
              <div className="relative overflow-hidden">
                <Skeleton
                  className={cn(
                    "h-16",
                    i % 3 === 0 ? "w-full" : i % 3 === 1 ? "w-3/4" : "w-5/6"
                  )}
                />
                <Shimmer />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "sidebar") {
    return (
      <div className={cn("flex flex-col gap-6 p-3", className)} role="status" aria-label="Loading sidebar">
        <span className="sr-only">Loading sidebar...</span>
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="space-y-2">
            {/* Section heading */}
            <div className="relative overflow-hidden">
              <Skeleton className="h-4 w-24" />
              <Shimmer />
            </div>

            {/* Section items */}
            <div className="space-y-1">
              {Array.from({ length: i % 2 === 0 ? 3 : 2 }).map((_, j) => (
                <div key={j} className="flex items-center gap-2">
                  <div className="relative overflow-hidden">
                    <Skeleton className="h-6 w-6 rounded" />
                    <Shimmer />
                  </div>
                  <div className="relative overflow-hidden flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Shimmer />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "composer") {
    return (
      <div className={cn("p-4 space-y-2", className)} role="status" aria-label="Loading composer">
        <span className="sr-only">Loading message composer...</span>
        <div className="flex items-end gap-2">
          {/* File button */}
          <div className="relative overflow-hidden">
            <Skeleton className="h-10 w-10 rounded" />
            <Shimmer />
          </div>

          {/* Textarea */}
          <div className="relative overflow-hidden flex-1">
            <Skeleton className="h-20 w-full rounded" />
            <Shimmer />
          </div>

          {/* Send button */}
          <div className="relative overflow-hidden">
            <Skeleton className="h-10 w-10 rounded" />
            <Shimmer />
          </div>
        </div>
      </div>
    );
  }

  if (type === "threads") {
    return (
      <div className={cn("flex flex-col gap-3 p-4", className)} role="status" aria-label="Loading threads">
        <span className="sr-only">Loading threads...</span>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="space-y-2 border-l-2 border-muted pl-4">
            {/* Thread header */}
            <div className="flex gap-2">
              <div className="relative overflow-hidden">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Shimmer />
              </div>
              <div className="relative overflow-hidden flex-1">
                <Skeleton className="h-4 w-48" />
                <Shimmer />
              </div>
            </div>

            {/* Thread message */}
            <div className="relative overflow-hidden">
              <Skeleton className="h-12 w-full" />
              <Shimmer />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "search") {
    return (
      <div className={cn("flex flex-col gap-4 p-6", className)} role="status" aria-label="Loading search results">
        <span className="sr-only">Searching...</span>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="space-y-2">
            {/* Result title */}
            <div className="flex items-center gap-2">
              <div className="relative overflow-hidden">
                <Skeleton className="h-4 w-4 rounded" />
                <Shimmer />
              </div>
              <div className="relative overflow-hidden flex-1">
                <Skeleton className="h-4 w-64" />
                <Shimmer />
              </div>
            </div>

            {/* Result content */}
            <div className="relative overflow-hidden">
              <Skeleton className="h-16 w-full" />
              <Shimmer />
            </div>

            {/* Result metadata */}
            <div className="flex gap-2">
              <div className="relative overflow-hidden">
                <Skeleton className="h-3 w-24" />
                <Shimmer />
              </div>
              <div className="relative overflow-hidden">
                <Skeleton className="h-3 w-32" />
                <Shimmer />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Custom pattern (simple stacked skeletons)
  return (
    <div className={cn("flex flex-col gap-2 p-4", className)} role="status" aria-label="Loading">
      <span className="sr-only">Loading...</span>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="relative overflow-hidden">
          <Skeleton
            className={cn(
              "h-4",
              i % 3 === 0 ? "w-full" : i % 3 === 1 ? "w-3/4" : "w-1/2"
            )}
          />
          <Shimmer />
        </div>
      ))}
    </div>
  );
}
