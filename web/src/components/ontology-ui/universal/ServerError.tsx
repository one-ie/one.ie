/**
 * ServerError - 500 error component
 *
 * Uses 6-token design system for consistent server error pages.
 */

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "../utils";
import { ServerCrash, RefreshCw, Home, Mail } from "lucide-react";

export interface ServerErrorProps {
  title?: string;
  description?: string;
  errorId?: string;
  showRefresh?: boolean;
  showContact?: boolean;
  onRefresh?: () => void;
  onHomeClick?: () => void;
  onContactClick?: () => void;
  className?: string;
}

/**
 * ServerError - 500 server error page
 *
 * @example
 * ```tsx
 * <ServerError
 *   errorId="ERR-2025-001"
 *   onRefresh={() => window.location.reload()}
 *   onContactClick={() => navigate('/support')}
 * />
 * ```
 */
export function ServerError({
  title = "Server error",
  description = "Something went wrong on our end. We've been notified and are working to fix it.",
  errorId,
  showRefresh = true,
  showContact = true,
  onRefresh,
  onHomeClick,
  onContactClick,
  className,
}: ServerErrorProps) {
  return (
    <Card className={cn("bg-background p-1 shadow-md rounded-md max-w-2xl mx-auto mt-16", className)}>
      <CardContent className="bg-foreground p-12 rounded-md text-center">
        {/* Server Icon */}
        <div className="mb-6 flex justify-center">
          <div className="h-24 w-24 rounded-full bg-red-500/10 flex items-center justify-center">
            <ServerCrash className="h-12 w-12 text-red-500" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-font mb-3">
          {title}
        </h2>

        {/* Description */}
        <p className="text-sm text-font/60 mb-3 max-w-md mx-auto">
          {description}
        </p>

        {/* Error ID */}
        {errorId && (
          <p className="text-xs text-font/40 mb-8 font-mono">
            Error ID: {errorId}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-center">
          {showRefresh && onRefresh && (
            <Button
              onClick={onRefresh}
              variant="default"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Page
            </Button>
          )}

          {onHomeClick && (
            <Button
              onClick={onHomeClick}
              variant="outline"
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          )}

          {showContact && onContactClick && (
            <Button
              onClick={onContactClick}
              variant="secondary"
              className="gap-2"
            >
              <Mail className="h-4 w-4" />
              Contact Support
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
