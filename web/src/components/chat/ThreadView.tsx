/**
 * CYCLE 26: ThreadView Component
 *
 * Show parent message at top
 * Show all replies below (chronological)
 * Inline reply composer
 * "Back to channel" button
 * Real-time updates for new replies
 */

"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";
import { Message } from "./Message";
import { MessageComposer } from "./MessageComposer";
import { Skeleton } from "@/components/ui/skeleton";

interface ThreadViewProps {
  threadId: string;
  onClose: () => void;
}

export function ThreadView({ threadId, onClose }: ThreadViewProps) {
  // Fetch thread data using Convex query
  const thread = useQuery(api.queries.getThread, {
    messageId: threadId as Id<"things">,
  });

  const parentMessage = thread?.parent;
  const replies = thread?.replies || [];

  // Loading state
  if (thread === undefined) {
    return (
      <div className="flex h-full flex-col border-l">
        <div className="flex items-center justify-between p-4 border-b">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <div className="flex-1 p-6 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (!parentMessage) {
    return (
      <div className="flex h-full flex-col border-l">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Thread</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Thread not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col border-l">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">
          Thread {replies.length > 0 && `(${replies.length} ${replies.length === 1 ? 'reply' : 'replies'})`}
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close thread</span>
        </Button>
      </div>

      {/* Parent message */}
      <div className="border-b bg-muted/30">
        <Message
          message={parentMessage}
          showAvatar={true}
          showTimestamp={true}
        />
      </div>

      {/* Replies */}
      <div className="flex-1 overflow-y-auto">
        {replies.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-sm text-muted-foreground">
              No replies yet. Start the conversation!
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {replies.map((reply: any) => (
              <Message
                key={reply._id}
                message={reply}
                showAvatar={true}
                showTimestamp={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* Reply composer */}
      <div className="border-t">
        <MessageComposer
          channelId={parentMessage.properties.channelId}
          threadId={threadId}
          placeholder="Reply to thread..."
        />
      </div>
    </div>
  );
}
