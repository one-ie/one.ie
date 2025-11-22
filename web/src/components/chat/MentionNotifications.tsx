/**
 * CYCLE 45-46: MentionNotifications Component
 *
 * Listens for new @mentions and shows toast notifications
 * Real-time via Convex subscriptions
 */

"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Bell } from "lucide-react";

export function MentionNotifications() {
  const mentions = useQuery(api.queries.getUserMentions, {
    limit: 1,
    unreadOnly: true
  });

  const previousCountRef = useRef(0);

  useEffect(() => {
    if (mentions === undefined) return;

    const currentCount = mentions.length;

    // New mention received
    if (currentCount > previousCountRef.current) {
      const newMention = mentions[0];

      if (newMention) {
        toast(
          `${newMention.author?.name || "Someone"} mentioned you`,
          {
            description: `in #${newMention.channel?.name || "channel"}`,
            icon: <Bell className="h-4 w-4" />,
            action: {
              label: "View",
              onClick: () => {
                // Navigate to mentions page
                window.location.href = "/app/mentions";
              }
            },
            duration: 5000
          }
        );
      }
    }

    previousCountRef.current = currentCount;
  }, [mentions]);

  return null; // This component doesn't render anything
}
