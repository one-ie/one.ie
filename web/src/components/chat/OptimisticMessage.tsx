/**
 * CYCLE 34: Optimistic Message Component
 *
 * Shows pending message with loading indicator
 * Handles retry on failure
 */

"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface OptimisticMessageProps {
  content: string;
  userName: string;
  userAvatar?: string;
  status: "sending" | "failed";
  onRetry?: () => void;
  onCancel?: () => void;
}

export function OptimisticMessage({
  content,
  userName,
  userAvatar,
  status,
  onRetry,
  onCancel
}: OptimisticMessageProps) {
  return (
    <div
      className={cn(
        "group relative flex gap-3 px-4 py-1 transition-opacity",
        status === "sending" && "opacity-60",
        status === "failed" && "bg-destructive/10"
      )}
    >
      {/* Avatar */}
      <Avatar className="h-10 w-10 shrink-0">
        {userAvatar && <img src={userAvatar} alt={userName} />}
        <AvatarFallback>{userName[0]?.toUpperCase() || "U"}</AvatarFallback>
      </Avatar>

      {/* Message content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-semibold text-sm">{userName}</span>
          {status === "sending" && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="inline-block h-1 w-1 rounded-full bg-current animate-pulse" />
              Sending...
            </span>
          )}
          {status === "failed" && (
            <span className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Failed to send
            </span>
          )}
        </div>

        {/* Message text */}
        <div className="text-sm text-foreground/80">{content}</div>

        {/* Retry/Cancel actions for failed messages */}
        {status === "failed" && (
          <div className="flex gap-2 mt-2">
            {onRetry && (
              <Button
                size="sm"
                variant="outline"
                onClick={onRetry}
                className="text-xs h-7"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            )}
            {onCancel && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onCancel}
                className="text-xs h-7"
              >
                Cancel
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
