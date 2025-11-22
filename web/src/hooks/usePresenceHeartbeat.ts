/**
 * CYCLE 32: Presence Heartbeat Hook
 *
 * Maintains user's online status with periodic heartbeat
 * Automatically marks user as online and updates every 30 seconds
 */

"use client";

import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../backend/convex/_generated/api";
import type { Id } from "../../../backend/convex/_generated/dataModel";

interface UsePresenceHeartbeatOptions {
  channelId?: string;
  enabled?: boolean;
  interval?: number; // milliseconds
}

export function usePresenceHeartbeat({
  channelId,
  enabled = true,
  interval = 30000 // 30 seconds
}: UsePresenceHeartbeatOptions = {}) {
  const updatePresence = useMutation(api.mutations.updatePresence);

  useEffect(() => {
    if (!enabled) return;

    // Initial heartbeat
    updatePresence({
      status: "online",
      channelId: channelId as Id<"groups"> | undefined
    }).catch((err) => console.error("Failed to send initial presence:", err));

    // Periodic heartbeat
    const heartbeatInterval = setInterval(() => {
      updatePresence({
        status: "online",
        channelId: channelId as Id<"groups"> | undefined
      }).catch((err) => console.error("Failed to send presence heartbeat:", err));
    }, interval);

    // Cleanup: Mark as offline on unmount
    return () => {
      clearInterval(heartbeatInterval);
      updatePresence({
        status: "offline"
      }).catch((err) => console.error("Failed to mark offline:", err));
    };
  }, [enabled, channelId, interval, updatePresence]);
}
