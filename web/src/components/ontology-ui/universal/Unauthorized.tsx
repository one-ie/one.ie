/**
 * Unauthorized - 403/401 error component
 *
 * Uses 6-token design system for consistent permission denied pages.
 */

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "../utils";
import { Lock, LogIn, Home } from "lucide-react";

export interface UnauthorizedProps {
  title?: string;
  description?: string;
  showLogin?: boolean;
  onLoginClick?: () => void;
  onHomeClick?: () => void;
  className?: string;
}

/**
 * Unauthorized - Permission denied page
 *
 * @example
 * ```tsx
 * <Unauthorized
 *   title="Access denied"
 *   description="You don't have permission to view this page"
 *   onLoginClick={() => navigate('/login')}
 * />
 * ```
 */
export function Unauthorized({
  title = "Access denied",
  description = "You don't have permission to access this page. Please log in with an authorized account.",
  showLogin = true,
  onLoginClick,
  onHomeClick,
  className,
}: UnauthorizedProps) {
  return (
    <Card className={cn("bg-background p-1 shadow-md rounded-md max-w-2xl mx-auto mt-16", className)}>
      <CardContent className="bg-foreground p-12 rounded-md text-center">
        {/* Lock Icon */}
        <div className="mb-6 flex justify-center">
          <div className="h-24 w-24 rounded-full bg-font/5 flex items-center justify-center">
            <Lock className="h-12 w-12 text-font/40" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-font mb-3">
          {title}
        </h2>

        {/* Description */}
        <p className="text-sm text-font/60 mb-8 max-w-md mx-auto">
          {description}
        </p>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-center">
          {showLogin && onLoginClick && (
            <Button
              onClick={onLoginClick}
              variant="default"
              className="gap-2"
            >
              <LogIn className="h-4 w-4" />
              Log In
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
        </div>
      </CardContent>
    </Card>
  );
}
