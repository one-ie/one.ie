/**
 * CYCLE 32: PresenceIndicator Component
 *
 * Shows online/offline/away/busy status with color-coded dots
 * Real-time updates via Convex subscription
 */

"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { cn } from "@/lib/utils";

interface PresenceIndicatorProps {
  userId: string;
  className?: string;
  showTooltip?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-2 w-2",
  md: "h-3 w-3",
  lg: "h-4 w-4"
};

const statusColors = {
  online: "bg-green-500",
  away: "bg-yellow-500",
  busy: "bg-red-500",
  offline: "bg-gray-400"
};

const statusLabels = {
  online: "Online",
  away: "Away",
  busy: "Busy",
  offline: "Offline"
};

export function PresenceIndicator({
  userId,
  className,
  showTooltip = true,
  size = "md"
}: PresenceIndicatorProps) {
  const presence = useQuery(api.queries.getUserPresence, {
    userId: userId as Id<"things">
  });

  const status = presence?.status || "offline";

  return (
    <div
      className={cn("relative inline-block", className)}
      title={showTooltip ? statusLabels[status] : undefined}
    >
      <div
        className={cn(
          "rounded-full border-2 border-background",
          sizeClasses[size],
          statusColors[status],
          status === "online" && "shadow-sm shadow-green-500/50"
        )}
      >
        {/* Pulse animation for online status */}
        {status === "online" && (
          <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
        )}
      </div>
    </div>
  );
}
