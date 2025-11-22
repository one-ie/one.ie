/**
 * CYCLE 42-43: MentionAutocomplete Component
 *
 * Dropdown autocomplete for @mentions
 * - Triggers on @ character
 * - Fuzzy search users + agents
 * - Keyboard navigation (↑↓ Enter Esc)
 * - Shows avatar + name + @username
 * - Special entries: @here, @channel
 */

"use client";

import { useEffect, useState, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { User, Bot, Bell, Radio } from "lucide-react";

interface Mentionable {
  id: string;
  type: "user" | "agent" | "special";
  name: string;
  username: string;
  avatar?: string;
  description?: string;
  icon?: string;
}

interface MentionAutocompleteProps {
  query: string;
  channelId: string;
  onSelect: (mention: Mentionable) => void;
  onClose: () => void;
  position: { top: number; left: number };
}

export function MentionAutocomplete({
  query,
  channelId,
  onSelect,
  onClose,
  position
}: MentionAutocompleteProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  // Search for mentionables
  const results = useQuery(api.queries.searchMentionables, {
    query,
    channelId: channelId as Id<"groups">,
    limit: 10
  });

  // Flatten results into single array
  const mentionables: Mentionable[] = results
    ? [
        ...(results.special || []),
        ...(results.users || []),
        ...(results.agents || [])
      ]
    : [];

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!mentionables.length) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < mentionables.length - 1 ? prev + 1 : prev
          );
          break;

        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;

        case "Enter":
          e.preventDefault();
          if (mentionables[selectedIndex]) {
            onSelect(mentionables[selectedIndex]);
          }
          break;

        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mentionables, selectedIndex, onSelect, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selected = listRef.current.children[selectedIndex] as HTMLElement;
      if (selected) {
        selected.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [selectedIndex]);

  // Show loading state
  if (results === undefined) {
    return (
      <div
        className="absolute z-50 w-72 rounded-md border bg-popover p-3 text-popover-foreground shadow-md"
        style={{ top: position.top, left: position.left }}
      >
        <div className="text-sm text-muted-foreground">Searching...</div>
      </div>
    );
  }

  // No results
  if (mentionables.length === 0) {
    return (
      <div
        className="absolute z-50 w-72 rounded-md border bg-popover p-3 text-popover-foreground shadow-md"
        style={{ top: position.top, left: position.left }}
      >
        <div className="text-sm text-muted-foreground">
          No matches for &quot;{query}&quot;
        </div>
      </div>
    );
  }

  return (
    <div
      ref={listRef}
      className="absolute z-50 w-72 max-h-80 overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md"
      style={{ top: position.top, left: position.left }}
    >
      {mentionables.map((item, index) => (
        <button
          key={`${item.type}-${item.id}`}
          onClick={() => onSelect(item)}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 text-left transition-colors cursor-pointer",
            index === selectedIndex
              ? "bg-accent text-accent-foreground"
              : "hover:bg-accent/50"
          )}
        >
          {/* Icon/Avatar */}
          {item.type === "special" ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <span className="text-2xl">{item.icon}</span>
            </div>
          ) : item.type === "agent" ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
              <Bot className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          ) : (
            <Avatar className="h-10 w-10">
              <AvatarImage src={item.avatar} />
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium truncate">{item.name}</span>
              {item.type === "agent" && (
                <Badge variant="secondary" className="text-xs">
                  AI
                </Badge>
              )}
              {item.type === "special" && (
                <Badge variant="outline" className="text-xs">
                  {item.id === "here" ? (
                    <Bell className="h-3 w-3 mr-1" />
                  ) : (
                    <Radio className="h-3 w-3 mr-1" />
                  )}
                  {item.id}
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {item.description || `@${item.username}`}
            </div>
          </div>

          {/* Selection indicator */}
          {index === selectedIndex && (
            <div className="text-xs text-muted-foreground">↵</div>
          )}
        </button>
      ))}

      {/* Footer hint */}
      <div className="border-t px-3 py-2 text-xs text-muted-foreground flex items-center justify-between">
        <span>
          <kbd className="px-1.5 py-0.5 rounded bg-muted">↑↓</kbd> navigate
        </span>
        <span>
          <kbd className="px-1.5 py-0.5 rounded bg-muted">↵</kbd> select
        </span>
        <span>
          <kbd className="px-1.5 py-0.5 rounded bg-muted">esc</kbd> close
        </span>
      </div>
    </div>
  );
}
