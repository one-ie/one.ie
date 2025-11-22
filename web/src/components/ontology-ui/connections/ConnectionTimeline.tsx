/**
 * ConnectionTimeline - Timeline of connection changes
 *
 * Displays a chronological timeline of connection-related events
 * showing when connections were created, updated, or deleted.
 *
 * Design System: Uses 6-token system with vertical timeline and event badges
 */

import type { Connection, Event } from "../types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatRelativeTime, getConnectionTypeDisplay } from "../utils";

export interface ConnectionTimelineProps {
  connections: Connection[];
  events: Event[];
  className?: string;
  compact?: boolean;
  limit?: number;
}

interface TimelineItem {
  id: string;
  type: "connection_created" | "connection_updated" | "connection_deleted";
  connectionType: string;
  timestamp: number;
  fromId: string;
  toId: string;
  metadata?: Record<string, any>;
}

export function ConnectionTimeline({
  connections,
  events,
  className,
  compact = false,
  limit,
}: ConnectionTimelineProps) {
  // Merge connections and events into timeline items
  const timelineItems: TimelineItem[] = [
    ...connections.map(conn => ({
      id: conn._id,
      type: "connection_created" as const,
      connectionType: conn.type,
      timestamp: conn.createdAt,
      fromId: conn.fromId,
      toId: conn.toId,
      metadata: conn.metadata,
    })),
    ...events
      .filter(e =>
        e.type === "created" ||
        e.type === "updated" ||
        e.type === "deleted"
      )
      .map(event => ({
        id: event._id,
        type: `connection_${event.type}` as "connection_created" | "connection_updated" | "connection_deleted",
        connectionType: event.metadata?.connectionType || "unknown",
        timestamp: event.timestamp,
        fromId: event.actorId,
        toId: event.targetId || "",
        metadata: event.metadata,
      })),
  ].sort((a, b) => b.timestamp - a.timestamp);

  const displayItems = limit ? timelineItems.slice(0, limit) : timelineItems;

  const getEventIcon = (type: string) => {
    switch (type) {
      case "connection_created":
        return "✨";
      case "connection_updated":
        return "🔄";
      case "connection_deleted":
        return "🗑️";
      default:
        return "🔗";
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "connection_created":
        return "bg-tertiary/10 text-tertiary border-tertiary/20"; // Success green
      case "connection_updated":
        return "bg-primary/10 text-primary border-primary/20"; // Primary blue
      case "connection_deleted":
        return "bg-font/10 text-font/80 border-font/20"; // Gray
      default:
        return "bg-secondary/10 text-secondary border-secondary/20";
    }
  };

  if (displayItems.length === 0) {
    return (
      <Card className={cn("bg-background p-1 shadow-sm rounded-md", className)}>
        <div className="bg-foreground rounded-md">
          <CardContent className="py-8 text-center text-font/60">
            No connection activity yet
          </CardContent>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-background p-1 shadow-sm rounded-md", className)}>
      <div className="bg-foreground rounded-md">
        {!compact && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-font">
              <span className="text-2xl">⏱️</span>
              Connection Timeline
            </CardTitle>
          </CardHeader>
        )}

        <CardContent className={cn("space-y-4", compact && "pt-6")}>
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-primary/20" />

            {/* Timeline items */}
            <div className="space-y-6">
              {displayItems.map((item, index) => (
                <div key={item.id} className="relative flex gap-4">
                  {/* Timeline dot */}
                  <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-foreground border-2 border-primary shadow-sm">
                    <span className="text-sm" aria-label={item.type}>
                      {getEventIcon(item.type)}
                    </span>
                  </div>

                  {/* Timeline content */}
                  <div className="flex-1 pb-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className={cn("capitalize", getEventColor(item.type))}
                          >
                            {item.type.replace("connection_", "")}
                          </Badge>
                          <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
                            {getConnectionTypeDisplay(item.connectionType as any)}
                          </Badge>
                        </div>

                        {!compact && item.metadata && (
                          <p className="text-sm text-font/60 mt-2">
                            {item.metadata.description ||
                             `Connection between ${item.fromId.slice(0, 8)}... and ${item.toId.slice(0, 8)}...`}
                          </p>
                        )}
                      </div>

                      <span className="text-xs text-font/40 whitespace-nowrap">
                        {formatRelativeTime(item.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {limit && timelineItems.length > limit && (
            <p className="text-sm text-center text-font/60 pt-2 border-t border-font/10">
              +{timelineItems.length - limit} more events
            </p>
          )}
        </CardContent>
      </div>
    </Card>
  );
}
