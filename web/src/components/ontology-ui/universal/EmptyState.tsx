/**
 * EmptyState - Universal empty state component
 *
 * Uses 6-token design system for consistent empty states across the platform.
 */

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "../utils";
import { Inbox, Plus } from "lucide-react";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary" | "tertiary";
  };
  className?: string;
}

/**
 * EmptyState - Displays when no data is available
 *
 * @example
 * ```tsx
 * <EmptyState
 *   title="No products found"
 *   description="Create your first product to get started"
 *   action={{
 *     label: "Create Product",
 *     onClick: () => navigate('/products/new')
 *   }}
 * />
 * ```
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <Card className={cn("bg-background p-1 shadow-sm rounded-md", className)}>
      <CardContent className="bg-foreground p-12 rounded-md text-center">
        {/* Icon */}
        <div className="mb-4 flex justify-center text-font/40">
          {icon || <Inbox className="h-16 w-16" />}
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-font mb-2">{title}</h3>

        {/* Description */}
        {description && (
          <p className="text-sm text-font/60 mb-6 max-w-md mx-auto">
            {description}
          </p>
        )}

        {/* Action */}
        {action && (
          <Button
            onClick={action.onClick}
            variant={action.variant === "secondary" ? "secondary" : action.variant === "tertiary" ? "outline" : "default"}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
