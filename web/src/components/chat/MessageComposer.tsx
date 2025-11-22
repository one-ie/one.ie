/**
 * CYCLE 43-44: MessageComposer Component - Enhanced with @Mention Autocomplete
 *
 * Rich text input with markdown preview
 * @mention autocomplete with keyboard navigation
 * Emoji picker integration
 * File upload support (UI only for now)
 * "User is typing..." indicator
 */

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Smile, Paperclip } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { MentionAutocomplete } from "./MentionAutocomplete";

interface MessageComposerProps {
  channelId: string;
  threadId?: string;
  placeholder?: string;
}

interface MentionData {
  id: string;
  type: "user" | "agent" | "special";
  username: string;
  displayName: string;
}

export function MessageComposer({
  channelId,
  threadId,
  placeholder = "Type a message..."
}: MessageComposerProps) {
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mention autocomplete state
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionStart, setMentionStart] = useState(0);
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [mentions, setMentions] = useState<MentionData[]>([]);

  const sendMessage = useMutation(api.mutations.sendMessage);
  const updatePresence = useMutation(api.mutations.updatePresence);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  // Detect @ mention trigger
  const detectMentionTrigger = useCallback((text: string, cursorPos: number) => {
    // Find the last @ before cursor
    const beforeCursor = text.substring(0, cursorPos);
    const lastAtIndex = beforeCursor.lastIndexOf("@");

    // No @ found or @ is too far back
    if (lastAtIndex === -1 || cursorPos - lastAtIndex > 50) {
      setShowMentions(false);
      return;
    }

    // Check if there's a space between @ and cursor (means mention ended)
    const textBetween = beforeCursor.substring(lastAtIndex + 1);
    if (textBetween.includes(" ") || textBetween.includes("\n")) {
      setShowMentions(false);
      return;
    }

    // Extract query (text after @)
    const query = textBetween;

    // Calculate autocomplete position
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const rect = textarea.getBoundingClientRect();

      // Approximate position (below cursor)
      // In production, use a library like textarea-caret for precise positioning
      setMentionPosition({
        top: rect.bottom + 4,
        left: rect.left + 12
      });
    }

    setMentionQuery(query);
    setMentionStart(lastAtIndex);
    setShowMentions(true);
  }, []);

  // Handle content change
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    handleTyping();

    // Detect mention trigger
    const cursorPos = textareaRef.current?.selectionStart || 0;
    detectMentionTrigger(newContent, cursorPos);
  }, [handleTyping, detectMentionTrigger]);

  // Handle mention selection
  const handleMentionSelect = useCallback((mention: { id: string; type: string; name: string; username: string }) => {
    if (!textareaRef.current) return;

    // Insert mention into text
    const before = content.substring(0, mentionStart);
    const after = content.substring(textareaRef.current.selectionStart);
    const newContent = `${before}@${mention.username} ${after}`;

    setContent(newContent);

    // Store mention metadata
    setMentions((prev) => [
      ...prev,
      {
        id: mention.id,
        type: mention.type as "user" | "agent" | "special",
        username: mention.username,
        displayName: mention.name
      }
    ]);

    // Close autocomplete
    setShowMentions(false);

    // Focus textarea and position cursor after mention
    textareaRef.current.focus();
    const newCursorPos = mentionStart + mention.username.length + 2; // +2 for @ and space
    textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
  }, [content, mentionStart]);

  // Typing indicator with debounce
  const handleTyping = useCallback(() => {
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set typing status
    updatePresence({
      isTyping: true,
      channelId: channelId as Id<"groups">
    }).catch((err) => console.error("Failed to update typing status:", err));

    // Clear typing status after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      updatePresence({
        isTyping: false,
        channelId: channelId as Id<"groups">
      }).catch((err) => console.error("Failed to clear typing status:", err));
    }, 3000);
  }, [channelId, updatePresence]);

  // Clear typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      // Clear typing status on unmount
      updatePresence({
        isTyping: false,
        channelId: channelId as Id<"groups">
      }).catch((err) => console.error("Failed to clear typing on unmount:", err));
    };
  }, [channelId, updatePresence]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = content.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);

    // Clear typing indicator immediately
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    updatePresence({
      isTyping: false,
      channelId: channelId as Id<"groups">
    }).catch((err) => console.error("Failed to clear typing:", err));

    try {
      // Extract mention IDs for backend
      const mentionIds = mentions.map(m => m.id);

      await sendMessage({
        channelId: channelId as Id<"groups">,
        content: trimmed,
        threadId: threadId as Id<"things"> | undefined,
        mentions: mentionIds.length > 0 ? mentionIds : undefined
      });

      // Clear input and mentions on success
      setContent("");
      setMentions([]);
      textareaRef.current?.focus();
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to send message"
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // If autocomplete is open, don't handle keyboard events here
    // (MentionAutocomplete handles them)
    if (showMentions && ["ArrowUp", "ArrowDown", "Enter", "Escape"].includes(e.key)) {
      return;
    }

    // Send on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleEmojiClick = () => {
    // TODO: Implement emoji picker (Cycle 24)
    toast.info("Emoji picker coming soon!");
  };

  const handleFileUpload = () => {
    // TODO: Implement file upload (Cycle 24)
    toast.info("File upload coming soon!");
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <div className="flex items-end gap-2">
        {/* File upload button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleFileUpload}
          className="shrink-0"
          disabled={isSending}
        >
          <Paperclip className="h-5 w-5" />
          <span className="sr-only">Attach file</span>
        </Button>

        {/* Message input */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isSending}
            className="min-h-[44px] max-h-[200px] resize-none pr-12"
            rows={1}
          />

          {/* Emoji button (inside textarea) */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleEmojiClick}
            className="absolute right-1 bottom-1 h-8 w-8"
            disabled={isSending}
          >
            <Smile className="h-4 w-4" />
            <span className="sr-only">Add emoji</span>
          </Button>
        </div>

        {/* Send button */}
        <Button
          type="submit"
          size="icon"
          disabled={!content.trim() || isSending}
          className="shrink-0"
        >
          <Send className="h-5 w-5" />
          <span className="sr-only">Send message</span>
        </Button>
      </div>

      {/* Character count */}
      <div className="mt-1 text-xs text-muted-foreground text-right">
        {content.length > 3900 && (
          <span className={cn(
            content.length > 4000 ? "text-destructive" : "text-orange-600"
          )}>
            {content.length} / 4000 characters
          </span>
        )}
      </div>

      {/* Mention autocomplete dropdown */}
      {showMentions && (
        <MentionAutocomplete
          query={mentionQuery}
          channelId={channelId}
          onSelect={handleMentionSelect}
          onClose={() => setShowMentions(false)}
          position={mentionPosition}
        />
      )}
    </form>
  );
}
