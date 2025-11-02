/**
 * EventHistory Component
 *
 * Display event history for an entity in a compact timeline.
 */

import React from "react";
import { Badge } from "@/components/ui/badge";

interface Event {
  _id: string;
  type: string;
  actorId: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface EventHistoryProps {
  events: Event[];
}

export function EventHistory({ events }: EventHistoryProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEventIcon = (type: string) => {
    if (type.includes("created")) return "➕";
    if (type.includes("updated")) return "✏️";
    if (type.includes("deleted") || type.includes("archived")) return "🗑️";
    if (type.includes("published")) return "📢";
    return "📝";
  };

  return (
    <div className="space-y-3">
      {events.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No activity yet
        </p>
      ) : (
        events.map((event, index) => (
          <div
            key={event._id}
            className={`flex gap-3 ${
              index !== events.length - 1
                ? "border-l-2 border-gray-200 dark:border-gray-700 pb-3"
                : ""
            }`}
          >
            <div className="flex-shrink-0 text-xl">
              {getEventIcon(event.type)}
            </div>
            <div className="flex-grow">
              <div className="flex items-start justify-between">
                <Badge variant="outline" className="text-xs">
                  {event.type.replace(/_/g, " ")}
                </Badge>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(event.timestamp)}
                </span>
              </div>
              {event.metadata && Object.keys(event.metadata).length > 0 && (
                <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  {Object.entries(event.metadata)
                    .slice(0, 2)
                    .map(([key, value]) => (
                      <div key={key}>
                        {key}: {JSON.stringify(value)}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
