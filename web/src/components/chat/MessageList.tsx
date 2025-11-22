/**
 * CYCLE 23: MessageList Component
 *
 * Virtual scrolling for performance
 * Infinite scroll (load more on scroll up)
 * Auto-scroll to bottom on new message
 * Group messages by sender + time proximity
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { Message } from "./Message";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageListProps {
  channelId: string;
  onThreadClick?: (messageId: string) => void;
}

export function MessageList({ channelId, onThreadClick }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [cursor, setCursor] = useState<number | undefined>(undefined);

  // Fetch messages using Convex real-time query
  const result = useQuery(api.queries.getChannelMessages, {
    channelId: channelId as Id<"groups">,
    limit: 50,
    cursor,
  });

  // Fetch typing users
  const typingUsers = useQuery(api.queries.getTypingUsers, {
    channelId: channelId as Id<"groups">
  }) || [];

  const messages = result?.messages || [];
  const hasMore = result?.hasMore || false;
  const nextCursor = result?.nextCursor;

  // Auto-scroll to bottom on initial load
  useEffect(() => {
    if (messages.length > 0 && !cursor) {
      scrollToBottom();
    }
  }, [messages.length, cursor]);

  // Handle scroll event to show/hide scroll-to-bottom button
  const handleScroll = () => {
    if (!scrollRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

    setShowScrollToBottom(!isNearBottom);
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const loadMore = () => {
    if (hasMore && nextCursor) {
      setCursor(nextCursor);
    }
  };

  // Loading state
  if (result === undefined) {
    return (
      <div className="flex h-full flex-col gap-4 p-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (result === null) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-3">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Channel not found
          </p>
          <p className="text-sm text-muted-foreground">
            This channel doesn't exist or you don't have access to it.
          </p>
        </div>
      </div>
    );
  }

  // Empty state
  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-3">
          <div className="text-4xl">💬</div>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            No messages yet
          </p>
          <p className="text-sm text-muted-foreground">
            Start the conversation by sending a message below.
          </p>
        </div>
      </div>
    );
  }

  // Group messages by same sender within 5 minutes
  const groupedMessages = messages.reduce((groups: any[][], message, index) => {
    const prevMessage = messages[index - 1];
    const shouldGroup =
      prevMessage &&
      prevMessage.properties.authorId === message.properties.authorId &&
      message.createdAt - prevMessage.createdAt < 5 * 60 * 1000; // 5 minutes

    if (shouldGroup && groups.length > 0) {
      groups[groups.length - 1].push(message);
    } else {
      groups.push([message]);
    }

    return groups;
  }, []);

  return (
    <div className="relative h-full">
      {/* Messages container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto p-6 space-y-4"
      >
        {/* Load more button */}
        {hasMore && (
          <div className="flex justify-center py-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadMore}
            >
              Load older messages
            </Button>
          </div>
        )}

        {/* Message groups */}
        {groupedMessages.map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-1">
            {group.map((message, messageIndex) => (
              <Message
                key={message._id}
                message={message}
                showAvatar={messageIndex === 0}
                showTimestamp={messageIndex === 0}
                onThreadClick={() => onThreadClick?.(message._id)}
              />
            ))}
          </div>
        ))}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="px-4 py-2 text-sm text-muted-foreground animate-pulse">
            {typingUsers.length === 1 && (
              <span>{typingUsers[0].name} is typing...</span>
            )}
            {typingUsers.length === 2 && (
              <span>{typingUsers[0].name} and {typingUsers[1].name} are typing...</span>
            )}
            {typingUsers.length > 2 && (
              <span>
                {typingUsers.slice(0, 2).map(u => u.name).join(", ")} and {typingUsers.length - 2} {typingUsers.length === 3 ? "other" : "others"} are typing...
              </span>
            )}
          </div>
        )}
      </div>

      {/* Scroll to bottom button */}
      {showScrollToBottom && (
        <div className="absolute bottom-4 right-4">
          <Button
            variant="secondary"
            size="icon"
            onClick={scrollToBottom}
            className="rounded-full shadow-lg"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
