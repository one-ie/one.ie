import React, { useEffect, useRef } from "react";
import { Message, type MessageProps } from "./Message";
import { LoadingIndicator } from "./LoadingIndicator";

export interface MessageListProps {
  messages: Array<MessageProps & { id: string }>;
  isLoading?: boolean;
}

export function MessageList({ messages, isLoading = false }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-muted-foreground">
        <div>
          <p className="text-lg font-medium">Start a conversation</p>
          <p className="text-sm">Send a message below</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {messages.map((msg) => (
        <Message key={msg.id} {...msg} />
      ))}
      {isLoading && <div className="p-4"><LoadingIndicator /></div>}
      <div ref={bottomRef} />
    </div>
  );
}
