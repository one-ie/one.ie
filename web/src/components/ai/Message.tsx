/**
 * Message - Individual message component
 * Renders user or assistant messages with proper styling
 */

import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

export interface MessageProps {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: number;
  isLoading?: boolean;
  className?: string;
}

export function Message({
  role,
  content,
  timestamp,
  isLoading = false,
  className = "",
}: MessageProps) {
  const isUser = role === "user";
  const isSystem = role === "system";

  return (
    <div
      className={cn(
        "flex gap-3 p-4",
        isUser && "flex-row-reverse",
        isSystem && "justify-center",
        className
      )}
    >
      {!isSystem && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback>
            {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "flex flex-col gap-1 max-w-[80%]",
          isUser && "items-end",
          isSystem && "items-center max-w-full"
        )}
      >
        <div
          className={cn(
            "rounded-lg px-4 py-2",
            isUser && "bg-primary text-primary-foreground",
            !isUser && !isSystem && "bg-muted",
            isSystem && "bg-muted/50 text-muted-foreground text-sm italic"
          )}
        >
          {isLoading ? (
            <div className="flex gap-1">
              <span className="h-2 w-2 animate-bounce rounded-full bg-current" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-current" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-current" />
            </div>
          ) : (
            <p className="whitespace-pre-wrap break-words">{content}</p>
          )}
        </div>

        {timestamp && !isSystem && (
          <span className="text-xs text-muted-foreground">
            {new Date(timestamp).toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
}
