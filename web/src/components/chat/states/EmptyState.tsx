/**
 * CYCLE 77: EmptyState Component
 *
 * Delightful empty states for various scenarios:
 * - No messages (with icebreakers)
 * - No channels (with templates)
 * - No mentions (with tips)
 * - No search results (with help)
 *
 * Features:
 * - Friendly icons and messaging
 * - Helpful CTAs and suggestions
 * - Dark mode support
 * - Accessibility compliant
 */

"use client";

import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Hash,
  AtSign,
  Search,
  Users,
  Inbox,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

export type EmptyStateType =
  | "no-messages"
  | "no-channels"
  | "no-mentions"
  | "no-search-results"
  | "no-threads"
  | "no-files"
  | "no-members";

interface EmptyStateProps {
  type: EmptyStateType;
  searchQuery?: string;
  onAction?: () => void;
  actionLabel?: string;
  className?: string;
}

interface EmptyStateConfig {
  icon: React.ReactNode;
  title: string;
  description: string;
  suggestions?: string[];
  action?: {
    label: string;
    variant?: "default" | "outline" | "secondary";
  };
}

export function EmptyState({
  type,
  searchQuery,
  onAction,
  actionLabel,
  className
}: EmptyStateProps) {
  const configs: Record<EmptyStateType, EmptyStateConfig> = {
    "no-messages": {
      icon: <MessageSquare className="h-12 w-12 text-muted-foreground" />,
      title: "No messages yet",
      description: "Start the conversation by sending a message below.",
      suggestions: [
        "Hello team! 👋",
        "What's everyone working on?",
        "Welcome to the channel!"
      ],
      action: {
        label: "Send a message",
        variant: "default"
      }
    },
    "no-channels": {
      icon: <Hash className="h-12 w-12 text-muted-foreground" />,
      title: "No channels available",
      description:
        "Create your first channel to start collaborating with your team.",
      suggestions: [
        "# general (team updates)",
        "# random (casual chat)",
        "# announcements (important news)"
      ],
      action: {
        label: "Create Channel",
        variant: "default"
      }
    },
    "no-mentions": {
      icon: <AtSign className="h-12 w-12 text-muted-foreground" />,
      title: "No mentions yet",
      description: "No one has mentioned you yet. Stay active to get noticed!",
      suggestions: [
        "Contribute to discussions",
        "Share helpful insights",
        "Ask thoughtful questions"
      ],
      action: {
        label: "Browse Channels",
        variant: "outline"
      }
    },
    "no-search-results": {
      icon: <Search className="h-12 w-12 text-muted-foreground" />,
      title: "No results found",
      description: searchQuery
        ? `No messages match your search query "${searchQuery}".`
        : "Try searching with different keywords.",
      suggestions: [
        "Try different keywords",
        "Check for typos",
        "Use @mentions for people",
        "Use #channel for channels"
      ],
      action: {
        label: "Clear Search",
        variant: "outline"
      }
    },
    "no-threads": {
      icon: <Inbox className="h-12 w-12 text-muted-foreground" />,
      title: "No threads yet",
      description:
        "Reply to a message to start a thread and keep conversations organized.",
      action: {
        label: "Browse Messages",
        variant: "outline"
      }
    },
    "no-files": {
      icon: <FileText className="h-12 w-12 text-muted-foreground" />,
      title: "No files shared",
      description:
        "Files shared in this channel will appear here for easy access.",
      action: {
        label: "Upload File",
        variant: "default"
      }
    },
    "no-members": {
      icon: <Users className="h-12 w-12 text-muted-foreground" />,
      title: "No members yet",
      description:
        "Invite team members to start collaborating in this channel.",
      action: {
        label: "Invite Members",
        variant: "default"
      }
    }
  };

  const config = configs[type];

  return (
    <div
      className={cn(
        "flex h-full items-center justify-center p-8",
        className
      )}
      role="status"
      aria-label={config.title}
    >
      <div className="max-w-md text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center" aria-hidden="true">
          {config.icon}
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">
            {config.title}
          </h2>
          <p className="text-sm text-muted-foreground">
            {config.description}
          </p>
        </div>

        {/* Suggestions */}
        {config.suggestions && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              {type === "no-messages" && "Suggested icebreakers:"}
              {type === "no-channels" && "Channel templates:"}
              {type === "no-mentions" && "Tips to get mentioned:"}
              {type === "no-search-results" && "Search tips:"}
            </p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {config.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-center justify-center gap-2">
                  <span className="text-primary">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Button */}
        {(config.action || onAction) && (
          <div className="pt-2">
            <Button
              variant={config.action?.variant || "default"}
              onClick={onAction}
            >
              {actionLabel || config.action?.label}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
