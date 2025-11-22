/**
 * MaintenanceMode - Maintenance page component
 *
 * Uses 6-token design system for consistent maintenance pages.
 */

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "../utils";
import { Wrench, Clock, Bell } from "lucide-react";

export interface MaintenanceModeProps {
  title?: string;
  description?: string;
  estimatedTime?: string;
  showNotify?: boolean;
  onNotifyClick?: () => void;
  className?: string;
}

/**
 * MaintenanceMode - Scheduled maintenance page
 *
 * @example
 * ```tsx
 * <MaintenanceMode
 *   title="Scheduled maintenance"
 *   estimatedTime="2 hours"
 *   onNotifyClick={() => subscribeToUpdates()}
 * />
 * ```
 */
export function MaintenanceMode({
  title = "We'll be right back",
  description = "We're performing scheduled maintenance to improve your experience. We'll be back online shortly.",
  estimatedTime,
  showNotify = true,
  onNotifyClick,
  className,
}: MaintenanceModeProps) {
  return (
    <Card className={cn("bg-background p-1 shadow-md rounded-md max-w-2xl mx-auto mt-16", className)}>
      <CardContent className="bg-foreground p-12 rounded-md text-center">
        {/* Wrench Icon */}
        <div className="mb-6 flex justify-center">
          <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
            <Wrench className="h-12 w-12 text-primary" />
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-4 flex justify-center">
          <Badge variant="outline" className="gap-2 px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            Under Maintenance
          </Badge>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-font mb-3">
          {title}
        </h2>

        {/* Description */}
        <p className="text-sm text-font/60 mb-6 max-w-md mx-auto">
          {description}
        </p>

        {/* Estimated Time */}
        {estimatedTime && (
          <div className="mb-8 flex items-center justify-center gap-2 text-sm text-font/60">
            <Clock className="h-4 w-4" />
            <span>Estimated time: {estimatedTime}</span>
          </div>
        )}

        {/* Notify Action */}
        {showNotify && onNotifyClick && (
          <Button
            onClick={onNotifyClick}
            variant="default"
            className="gap-2"
          >
            <Bell className="h-4 w-4" />
            Notify Me When Ready
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
