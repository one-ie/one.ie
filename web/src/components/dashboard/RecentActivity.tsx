/**
 * RecentActivity Component
 *
 * Display recent events in a timeline format.
 */

import { Badge } from "@/components/ui/badge";

interface Event {
  _id: string;
  type: string;
  actorId: string;
  targetId?: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface RecentActivityProps {
  events: Event[];
}

export function RecentActivity({ events }: RecentActivityProps) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getEventIcon = (type: string) => {
    if (type.includes("created")) return "➕";
    if (type.includes("updated")) return "✏️";
    if (type.includes("deleted") || type.includes("archived")) return "🗑️";
    if (type.includes("published")) return "📢";
    return "📝";
  };

  const getEventDescription = (event: Event) => {
    const { type, metadata } = event;

    if (type === "entity_created") {
      return `Created ${metadata?.entityType || "entity"}`;
    }
    if (type === "entity_updated") {
      return `Updated ${metadata?.entityType || "entity"}`;
    }
    if (type === "entity_archived") {
      return `Archived ${metadata?.entityType || "entity"}`;
    }
    if (type === "connection_created") {
      return `Created ${metadata?.relationshipType || "connection"}`;
    }
    if (type === "connection_deleted") {
      return `Deleted ${metadata?.relationshipType || "connection"}`;
    }

    return type.replace(/_/g, " ");
  };

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      {events.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">No recent activity</div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event._id}
              className="flex items-start gap-3 border-l-2 border-gray-200 dark:border-gray-700 pl-3"
            >
              <div className="flex-shrink-0 text-2xl">{getEventIcon(event.type)}</div>
              <div className="flex-grow">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {getEventDescription(event)}
                </p>
                {event.targetId && (
                  <a
                    href={`/dashboard/things/${event.targetId}`}
                    className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    View entity →
                  </a>
                )}
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(event.timestamp)}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {event.type}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
