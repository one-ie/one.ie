/**
 * LoadingState - Universal loading indicator
 *
 * Uses 6-token design system for consistent loading states.
 */

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "../utils";
import { Loader2 } from "lucide-react";

export interface LoadingStateProps {
  type?: "spinner" | "skeleton" | "pulse";
  message?: string;
  rows?: number;
  className?: string;
}

/**
 * LoadingState - Displays loading indicators
 *
 * @example
 * ```tsx
 * // Spinner with message
 * <LoadingState type="spinner" message="Loading products..." />
 *
 * // Skeleton cards
 * <LoadingState type="skeleton" rows={3} />
 *
 * // Simple pulse
 * <LoadingState type="pulse" />
 * ```
 */
export function LoadingState({
  type = "spinner",
  message,
  rows = 3,
  className,
}: LoadingStateProps) {
  if (type === "spinner") {
    return (
      <Card className={cn("bg-background p-1 shadow-sm rounded-md", className)}>
        <CardContent className="bg-foreground p-12 rounded-md flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          {message && (
            <p className="text-sm text-font/60">{message}</p>
          )}
        </CardContent>
      </Card>
    );
  }

  if (type === "skeleton") {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: rows }).map((_, i) => (
          <Card key={i} className="bg-background p-1 shadow-sm rounded-md">
            <CardContent className="bg-foreground p-4 rounded-md">
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-20 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Pulse
  return (
    <Card className={cn("bg-background p-1 shadow-sm rounded-md", className)}>
      <CardContent className="bg-foreground p-12 rounded-md">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-font/10 rounded w-3/4" />
          <div className="h-4 bg-font/10 rounded w-1/2" />
          <div className="h-32 bg-font/10 rounded w-full" />
        </div>
      </CardContent>
    </Card>
  );
}
