/**
 * CYCLE 25: Message Component
 *
 * Show avatar, username, timestamp
 * Render markdown content
 * Highlight @mentions (simple for now, full implementation in Cycles 41-50)
 * Show edit/delete actions (only for message author)
 * Reaction emojis display
 */

"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Pencil,
  Trash2,
  MessageSquare,
  Smile
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PresenceIndicator } from "./PresenceIndicator";

interface MessageProps {
  message: any; // Type from Convex query
  showAvatar?: boolean;
  showTimestamp?: boolean;
  onThreadClick?: () => void;
}

export function Message({
  message,
  showAvatar = true,
  showTimestamp = true,
  onThreadClick
}: MessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.properties.content);

  const deleteMessage = useMutation(api.mutations.deleteMessage);
  const editMessage = useMutation(api.mutations.editMessage);
  const addReaction = useMutation(api.mutations.addReaction);

  const author = message.author;
  const content = message.properties.content;
  const reactions = message.properties.reactions || [];
  const editedAt = message.properties.editedAt;

  // TODO: Get current user ID from auth context (Cycle 27)
  const isOwnMessage = false; // Placeholder

  const handleDelete = async () => {
    if (!confirm("Delete this message?")) return;

    try {
      await deleteMessage({ messageId: message._id });
      toast.success("Message deleted");
    } catch (error) {
      toast.error("Failed to delete message");
    }
  };

  const handleEdit = async () => {
    const trimmed = editContent.trim();
    if (!trimmed || trimmed === content) {
      setIsEditing(false);
      return;
    }

    try {
      await editMessage({
        messageId: message._id,
        content: trimmed,
      });
      setIsEditing(false);
      toast.success("Message updated");
    } catch (error) {
      toast.error("Failed to update message");
    }
  };

  const handleReaction = async (emoji: string) => {
    try {
      await addReaction({
        messageId: message._id,
        emoji,
      });
    } catch (error) {
      toast.error("Failed to add reaction");
    }
  };

  // Enhanced @mention rendering with click handlers
  const renderContent = (text: string) => {
    const parts = text.split(/(@\w+)/g);
    const mentions = message.properties.mentions || [];

    return parts.map((part, index) => {
      if (part.startsWith("@")) {
        const username = part.substring(1);
        const mention = mentions.find((m: any) => m.username === username);

        // Determine mention type and styling
        const isSpecial = username === "here" || username === "channel";
        const isAgent = mention?.type === "agent";
        const isCurrentUser = false; // TODO: Check if mention is current user

        return (
          <button
            key={index}
            onClick={() => {
              if (isSpecial) {
                toast.info(`@${username} mentions all ${username === "here" ? "online" : ""} members`);
              } else if (isAgent) {
                toast.info(`AI Agent: @${username}`);
              } else {
                toast.info(`View profile: @${username}`);
                // TODO: Open user profile modal
              }
            }}
            className={cn(
              "inline-flex items-center gap-1 font-semibold px-1.5 py-0.5 rounded transition-colors hover:underline cursor-pointer",
              isCurrentUser
                ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200"
                : isSpecial
                ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
                : isAgent
                ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
            )}
            title={
              isSpecial
                ? `Notify all ${username === "here" ? "online" : ""} members`
                : isAgent
                ? "AI Agent"
                : `View @${username}'s profile`
            }
          >
            {part}
          </button>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div
      className={cn(
        "group relative flex gap-3 px-4 py-1 hover:bg-muted/50 transition-colors",
        !showAvatar && "pl-[52px]" // Indent when avatar is hidden
      )}
    >
      {/* Avatar */}
      {showAvatar && (
        <div className="relative">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={author?.avatar} />
            <AvatarFallback>
              {author?.name?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          {/* Presence indicator */}
          <div className="absolute bottom-0 right-0">
            <PresenceIndicator
              userId={message.properties.authorId}
              size="sm"
              showTooltip={false}
            />
          </div>
        </div>
      )}

      {/* Message content */}
      <div className="flex-1 min-w-0">
        {/* Header (username + timestamp) */}
        {showTimestamp && (
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-semibold text-sm">
              {author?.name || "Unknown User"}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(message.createdAt, { addSuffix: true })}
            </span>
            {editedAt && (
              <span className="text-xs text-muted-foreground italic">
                (edited)
              </span>
            )}
          </div>
        )}

        {/* Message text */}
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleEdit();
                } else if (e.key === "Escape") {
                  setIsEditing(false);
                }
              }}
              className="w-full p-2 border rounded-md bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
              autoFocus
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Press <kbd className="px-1 py-0.5 rounded bg-muted">Enter</kbd> to save, <kbd className="px-1 py-0.5 rounded bg-muted">Esc</kbd> to cancel
              </span>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleEdit}>
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(content);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
            {renderContent(content)}
          </div>
        )}

        {/* Reactions */}
        {reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {reactions.map((reaction: any, index: number) => {
              // TODO: Get current user ID from auth to highlight user's reactions
              const isUserReacted = false; // Placeholder
              return (
                <button
                  key={index}
                  onClick={() => handleReaction(reaction.emoji)}
                  className={cn(
                    "px-2 py-1 rounded-full text-xs transition-all hover:scale-110",
                    isUserReacted
                      ? "bg-primary/20 border-2 border-primary"
                      : "bg-muted hover:bg-muted/80 border-2 border-transparent"
                  )}
                  title={`${reaction.count} reaction${reaction.count > 1 ? 's' : ''}`}
                >
                  <span className="text-base">{reaction.emoji}</span>
                  <span className="ml-1 font-medium">{reaction.count}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Actions menu (show on hover) */}
      <div className="absolute -top-3 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-1 bg-background border rounded-md shadow-sm p-1">
          {/* Emoji reactions picker */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-auto">
              <div className="grid grid-cols-5 gap-1 p-2">
                {["👍", "❤️", "😂", "🎉", "🔥", "👏", "✨", "💯", "🚀", "👀"].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(emoji)}
                    className="text-2xl hover:scale-125 transition-transform p-1 rounded hover:bg-muted"
                    title={`React with ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Reply in thread */}
          {onThreadClick && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onThreadClick}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          )}

          {/* More actions */}
          {isOwnMessage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
}
