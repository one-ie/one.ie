"use client";

/**
 * CollaborationWrapper - Real-time collaboration integration
 *
 * Integrates all ontology-ui streaming components for the website builder:
 * - PresenceIndicator (online users)
 * - CollaborationCursor (multi-user cursors)
 * - LiveActivityFeed (team actions)
 * - LiveNotifications (real-time updates)
 */

import { useEffect, useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PresenceIndicator } from "@/components/ontology-ui/streaming/PresenceIndicator";
import { CollaborationCursor, useCursorBroadcast, type CursorPosition } from "@/components/ontology-ui/streaming/CollaborationCursor";
import { LiveActivityFeed } from "@/components/ontology-ui/streaming/LiveActivityFeed";
import { LiveNotifications } from "@/components/ontology-ui/streaming/LiveNotifications";
import { Card, CardContent } from "@/components/ui/card";

interface CollaborationWrapperProps {
  websiteId: string;
  pageId: string;
  userId: string;
  userName: string;
  children: React.ReactNode;
}

// Generate random color for user
const generateUserColor = (userId: string) => {
  const colors = [
    "#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6",
    "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16"
  ];
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

export function CollaborationWrapper({
  websiteId,
  pageId,
  userId,
  userName,
  children,
}: CollaborationWrapperProps) {
  const [userColor] = useState(() => generateUserColor(userId));
  const [showActivityFeed, setShowActivityFeed] = useState(false);

  // Real-time queries
  const onlineUsers = useQuery(api.queries.presence.getOnlineUsers, { pageId });
  const cursors = useQuery(api.queries.presence.getCursors, { pageId });
  const events = useQuery(api.queries.presence.getPageEvents, { pageId, limit: 50 });

  // Mutations
  const updatePresence = useMutation(api.mutations.presence.updatePresence);
  const updateCursor = useMutation(api.mutations.presence.updateCursor);
  const removeCursor = useMutation(api.mutations.presence.removeCursor);
  const logEvent = useMutation(api.mutations.presence.logCollaborationEvent);

  // Update presence on mount and periodically
  useEffect(() => {
    // Set online status
    updatePresence({
      userId,
      status: 'online',
      pageId,
      websiteId,
    });

    // Heartbeat every 30 seconds
    const interval = setInterval(() => {
      updatePresence({
        userId,
        status: 'online',
        pageId,
        websiteId,
      });
    }, 30000);

    // Set offline on unmount
    return () => {
      clearInterval(interval);
      updatePresence({
        userId,
        status: 'offline',
        pageId,
        websiteId,
      });
      removeCursor({ userId, pageId });
    };
  }, [userId, pageId, websiteId, updatePresence, removeCursor]);

  // Handle cursor movement
  const handleCursorMove = useCallback((position: { x: number; y: number }) => {
    updateCursor({
      userId,
      userName,
      color: userColor,
      x: position.x,
      y: position.y,
      pageId,
      websiteId,
    });
  }, [userId, userName, userColor, pageId, websiteId, updateCursor]);

  // Transform cursors for CollaborationCursor component
  const cursorPositions: CursorPosition[] = (cursors || [])
    .filter(c => c.userId !== userId) // Don't show own cursor
    .map(c => ({
      userId: c.userId,
      userName: c.userName,
      x: c.x,
      y: c.y,
      color: c.color,
      timestamp: c.timestamp,
    }));

  // Transform events for LiveActivityFeed
  const activityEvents = (events || []).map(e => ({
    _id: e._id,
    type: e.type,
    timestamp: e.timestamp,
    data: {
      userName: e.userName,
      ...e.metadata,
    },
  }));

  return (
    <div className="relative h-full w-full">
      {/* Collaboration Cursors Overlay */}
      <CollaborationCursor
        cursors={cursorPositions}
        onCursorMove={handleCursorMove}
        showLabels={true}
        className="absolute inset-0 pointer-events-none"
      />

      {/* Online Users - Top Right */}
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        {/* Live Notifications */}
        <LiveNotifications
          queryPath={api.queries.presence.getNotifications}
          args={{ userId }}
          markAsReadMutation={undefined} // We don't have read tracking yet
          showToasts={true}
          limit={10}
          position="right"
        />

        {/* Activity Feed Toggle */}
        <button
          onClick={() => setShowActivityFeed(!showActivityFeed)}
          className="p-2 rounded-lg bg-background border hover:bg-accent"
          title="Show Activity Feed"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M8 16H3v5" />
          </svg>
        </button>

        {/* Online Users Presence Indicators */}
        <Card className="max-w-xs">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                Online ({(onlineUsers || []).length})
              </span>
              <div className="flex -space-x-2">
                {(onlineUsers || []).slice(0, 5).map((user) => (
                  <PresenceIndicator
                    key={user.userId}
                    userId={user.userId}
                    status={user.status}
                    size="sm"
                    className="ring-2 ring-background"
                  />
                ))}
                {(onlineUsers || []).length > 5 && (
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-xs font-medium ring-2 ring-background">
                    +{(onlineUsers || []).length - 5}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed - Slide in from right */}
      {showActivityFeed && (
        <div className="absolute top-0 right-0 h-full w-96 z-40 p-4">
          <div className="h-full">
            <LiveActivityFeed
              events={activityEvents}
              hasMore={false}
              isLoading={false}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="h-full w-full">
        {children}
      </div>
    </div>
  );
}
