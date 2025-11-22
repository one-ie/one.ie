/**
 * CYCLE 45-46: MentionBadge Component
 *
 * Shows unread mention count in navigation
 * Real-time updates via Convex
 */

"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MentionBadgeProps {
  className?: string;
  showZero?: boolean;
}

export function MentionBadge({ className, showZero = false }: MentionBadgeProps) {
  const unreadCount = useQuery(api.queries.getUnreadMentionCount);

  if (unreadCount === undefined) {
    return null; // Loading
  }

  if (unreadCount === 0 && !showZero) {
    return null; // No unread mentions
  }

  return (
    <Badge
      variant="destructive"
      className={cn(
        "h-5 min-w-5 px-1.5 flex items-center justify-center text-xs font-bold",
        className
      )}
    >
      {unreadCount > 99 ? "99+" : unreadCount}
    </Badge>
  );
}
