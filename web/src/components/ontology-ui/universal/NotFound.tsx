/**
 * NotFound - 404 error component
 *
 * Uses 6-token design system for consistent 404 pages.
 */

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "../utils";
import { Search, Home, ArrowLeft } from "lucide-react";

export interface NotFoundProps {
  title?: string;
  description?: string;
  showSearch?: boolean;
  onSearchClick?: () => void;
  onHomeClick?: () => void;
  onBackClick?: () => void;
  className?: string;
}

/**
 * NotFound - 404 error page
 *
 * @example
 * ```tsx
 * <NotFound
 *   title="Product not found"
 *   description="The product you're looking for doesn't exist"
 *   onHomeClick={() => navigate('/')}
 *   onSearchClick={() => setShowSearch(true)}
 * />
 * ```
 */
export function NotFound({
  title = "Page not found",
  description = "The page you're looking for doesn't exist or has been moved.",
  showSearch = true,
  onSearchClick,
  onHomeClick,
  onBackClick,
  className,
}: NotFoundProps) {
  return (
    <Card className={cn("bg-background p-1 shadow-md rounded-md max-w-2xl mx-auto mt-16", className)}>
      <CardContent className="bg-foreground p-12 rounded-md text-center">
        {/* 404 Number */}
        <div className="mb-6">
          <h1 className="text-9xl font-bold text-font/10">404</h1>
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
          {onBackClick && (
            <Button
              onClick={onBackClick}
              variant="outline"
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          )}

          {onHomeClick && (
            <Button
              onClick={onHomeClick}
              variant="default"
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          )}

          {showSearch && onSearchClick && (
            <Button
              onClick={onSearchClick}
              variant="secondary"
              className="gap-2"
            >
              <Search className="h-4 w-4" />
              Search
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
