/**
 * NotificationProvider Component
 *
 * Wraps NotificationCenter with Convex real-time data
 * Provides funnel-specific notifications with event logging
 *
 * Features:
 * - Real-time event subscription via Convex
 * - Funnel-specific event filtering
 * - Mark as read functionality
 * - Dismiss notifications
 * - Unread count badge
 *
 * @see /web/src/components/ontology-ui/events/NotificationCenter.tsx
 * @see /backend/convex/queries/events.ts
 */

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { NotificationCenter } from "@/components/ontology-ui/events";
import type { Event } from "@/components/ontology-ui/types";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";

interface NotificationProviderProps {
  className?: string;
}

/**
 * Funnel event types that should trigger notifications
 */
const FUNNEL_EVENT_TYPES = [
  "funnel_created",
  "funnel_published",
  "funnel_unpublished",
  "funnel_duplicated",
  "funnel_archived",
  "step_added",
  "step_removed",
  "step_reordered",
  "element_added",
  "element_updated",
  "element_removed",
];

/**
 * Get user-friendly notification message for event type
 */
function getNotificationMessage(event: Event): string {
  const entityName = event.metadata?.entityName || "Item";

  switch (event.type) {
    case "funnel_published":
      return `Funnel "${entityName}" published successfully`;
    case "funnel_duplicated":
      return `Funnel "${entityName}" duplicated`;
    case "funnel_archived":
      return `Funnel "${entityName}" archived`;
    case "funnel_created":
      return `Funnel "${entityName}" created`;
    case "step_added":
      return `Step added to funnel "${entityName}"`;
    case "element_added":
      return `Element added to "${entityName}"`;
    case "element_updated":
      return `Element updated in "${entityName}"`;
    default:
      return `${event.type.replace(/_/g, " ")}`;
  }
}

/**
 * Get notification variant based on event type
 */
function getNotificationVariant(eventType: string): "success" | "info" | "warning" | "error" {
  if (eventType.includes("published")) return "success";
  if (eventType.includes("archived")) return "warning";
  if (eventType.includes("failed") || eventType.includes("error")) return "error";
  return "info";
}

export function NotificationProvider({ className }: NotificationProviderProps) {
  const { toast } = useToast();
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  // Get current user
  const currentUser = useQuery(api.queries.users.getCurrentUser);

  // Subscribe to events for current user
  const events = useQuery(
    api.queries.events.byActor,
    currentUser?._id
      ? {
          actorId: currentUser._id,
          types: FUNNEL_EVENT_TYPES,
          limit: 50,
        }
      : "skip"
  );

  // Transform events to notification format and filter dismissed
  const notifications = useMemo(() => {
    if (!events) return [];

    return events
      .filter((event) => !dismissedIds.has(event._id))
      .map((event) => ({
        ...event,
        metadata: {
          ...event.metadata,
          unread: !readIds.has(event._id),
          message: getNotificationMessage(event),
          variant: getNotificationVariant(event.type),
        },
      }));
  }, [events, dismissedIds, readIds]);

  // Count unread notifications
  const unreadCount = notifications.filter(
    (n) => n.metadata?.unread === true
  ).length;

  // Handle notification click
  const handleNotificationClick = (notification: Event) => {
    // Mark as read
    setReadIds((prev) => new Set(prev).add(notification._id));

    // Show toast with notification details
    toast({
      title: getNotificationMessage(notification),
      description: new Date(notification.timestamp).toLocaleString(),
      variant: getNotificationVariant(notification.type) as any,
    });

    // Navigate to related funnel if targetId exists
    if (notification.targetId) {
      const targetId = notification.targetId;
      // You can navigate to the funnel builder here
      // For example: window.location.href = `/funnels/${targetId}`;
    }
  };

  // Mark all as read
  const handleMarkAllRead = () => {
    const allIds = notifications.map((n) => n._id);
    setReadIds(new Set(allIds));

    toast({
      title: "All notifications marked as read",
      variant: "default",
    });
  };

  // Mark single notification as read
  const handleRead = (id: string) => {
    setReadIds((prev) => new Set(prev).add(id));
  };

  // Dismiss notification (remove from list)
  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => new Set(prev).add(id));

    toast({
      title: "Notification dismissed",
      variant: "default",
    });
  };

  // Don't render if no user or events loaded yet
  if (!currentUser || !events) {
    return null;
  }

  return (
    <NotificationCenter
      notifications={notifications}
      unreadCount={unreadCount}
      onNotificationClick={handleNotificationClick}
      onMarkAllRead={handleMarkAllRead}
      onRead={handleRead}
      onDismiss={handleDismiss}
      className={className}
    />
  );
}
