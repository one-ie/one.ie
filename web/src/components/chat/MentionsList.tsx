/**
 * CYCLE 45-46: MentionsList Component
 *
 * Displays all messages where user was @mentioned
 * - Filter by read/unread
 * - Mark as read functionality
 * - Jump to message in channel
 */

"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { CheckCheck, Hash } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function MentionsList() {
  const [filter, setFilter] = useState<"all" | "unread">("all");

  // Query mentions
  const allMentions = useQuery(api.queries.getUserMentions, {
    limit: 50,
    unreadOnly: false
  });

  const unreadMentions = useQuery(api.queries.getUserMentions, {
    limit: 50,
    unreadOnly: true
  });

  // Mutations
  const markAsRead = useMutation(api.mutations.markMentionAsRead);

  const mentions = filter === "all" ? allMentions : unreadMentions;

  // Mark single mention as read
  const handleMarkAsRead = async (messageId: string) => {
    try {
      await markAsRead({ messageId });
      toast.success("Marked as read");
    } catch (error) {
      toast.error("Failed to mark as read");
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    if (!unreadMentions || unreadMentions.length === 0) {
      toast.info("No unread mentions");
      return;
    }

    try {
      // Mark each unread mention
      await Promise.all(
        unreadMentions.map((mention: any) =>
          markAsRead({ messageId: mention._id })
        )
      );
      toast.success("All mentions marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  // Loading state
  if (mentions === undefined) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-20" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header controls */}
      <div className="flex items-center justify-between">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as "all" | "unread")}>
          <TabsList>
            <TabsTrigger value="all">
              All ({allMentions?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread ({unreadMentions?.length || 0})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkAllAsRead}
          disabled={!unreadMentions || unreadMentions.length === 0}
        >
          <CheckCheck className="h-4 w-4 mr-2" />
          Mark All Read
        </Button>
      </div>

      {/* Mentions list */}
      {mentions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>No {filter === "unread" ? "unread " : ""}mentions yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {mentions.map((mention: any) => (
            <Card
              key={mention._id}
              className={cn(
                "transition-colors hover:shadow-md",
                !mention.isRead && "border-primary/50 bg-primary/5"
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    {/* Author avatar */}
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={mention.author?.avatar} />
                      <AvatarFallback>
                        {mention.author?.name?.[0]?.toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">
                          {mention.author?.name || "Unknown User"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          mentioned you in
                        </span>
                        <Badge variant="outline" className="gap-1">
                          <Hash className="h-3 w-3" />
                          {mention.channel?.name || "channel"}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mb-2">
                        {formatDistanceToNow(mention.createdAt, { addSuffix: true })}
                      </p>

                      <div className="text-sm bg-muted/50 rounded-md p-3">
                        {mention.properties.content}
                      </div>
                    </div>
                  </div>

                  {/* Read status badge */}
                  {!mention.isRead && (
                    <Badge variant="default" className="shrink-0">
                      New
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-0 flex items-center justify-end gap-2">
                {!mention.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMarkAsRead(mention._id)}
                  >
                    <CheckCheck className="h-4 w-4 mr-2" />
                    Mark as Read
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // TODO: Navigate to message in channel
                    toast.info("Jump to message - coming soon!");
                  }}
                >
                  View Message
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
