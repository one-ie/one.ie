/**
 * Message - Individual message component
 * Renders user or assistant messages with proper styling
 * Supports code blocks with syntax highlighting
 */

import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import { CodeBlock } from "./CodeBlock";

export interface MessageProps {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: number;
  isLoading?: boolean;
  className?: string;
}

interface ContentPart {
  type: "text" | "code";
  content: string;
  language?: string;
}

/**
 * Parse message content into text and code blocks
 */
function parseContent(content: string): ContentPart[] {
  const parts: ContentPart[] = [];

  // Regex to match code blocks: ```language\ncode\n```
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;

  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      const textContent = content.substring(lastIndex, match.index);
      if (textContent.trim()) {
        parts.push({ type: "text", content: textContent });
      }
    }

    // Add code block
    const language = match[1] || "text";
    const code = match[2].trim();
    parts.push({ type: "code", content: code, language });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    const textContent = content.substring(lastIndex);
    if (textContent.trim()) {
      parts.push({ type: "text", content: textContent });
    }
  }

  // If no code blocks found, return original content as text
  if (parts.length === 0) {
    parts.push({ type: "text", content });
  }

  return parts;
}

/**
 * Render inline code (single backticks)
 */
function renderTextWithInlineCode(text: string) {
  const parts = text.split(/(`[^`]+`)/g);

  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      const code = part.slice(1, -1);
      return (
        <code
          key={index}
          className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm"
        >
          {code}
        </code>
      );
    }
    return <span key={index}>{part}</span>;
  });
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
  const parts = parseContent(content);

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
          "flex flex-col gap-3 max-w-[80%]",
          isUser && "items-end",
          isSystem && "items-center max-w-full"
        )}
      >
        {isLoading ? (
          <div
            className={cn(
              "rounded-lg px-4 py-2",
              isUser && "bg-primary text-primary-foreground",
              !isUser && !isSystem && "bg-muted",
              isSystem && "bg-muted/50 text-muted-foreground text-sm italic"
            )}
          >
            <div className="flex gap-1">
              <span className="h-2 w-2 animate-bounce rounded-full bg-current" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-current" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-current" />
            </div>
          </div>
        ) : (
          <>
            {parts.map((part, index) => {
              if (part.type === "code") {
                return (
                  <CodeBlock
                    key={index}
                    code={part.content}
                    language={part.language}
                    showLineNumbers={false}
                  />
                );
              }

              return (
                <div
                  key={index}
                  className={cn(
                    "rounded-lg px-4 py-2",
                    isUser && "bg-primary text-primary-foreground",
                    !isUser && !isSystem && "bg-muted",
                    isSystem && "bg-muted/50 text-muted-foreground text-sm italic"
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">
                    {renderTextWithInlineCode(part.content)}
                  </p>
                </div>
              );
            })}
          </>
        )}

        {timestamp && !isSystem && (
          <span className="text-xs text-muted-foreground">
            {new Date(timestamp).toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
}
