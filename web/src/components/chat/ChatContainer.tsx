/**
 * CYCLE 22 + 51-60: ChatContainer Component
 *
 * 3-column layout: Sidebar | Messages | Thread/Details
 * Responsive: Stack on mobile
 * Real-time updates via Convex subscriptions
 *
 * UPDATED: Now includes ChatSidebar with 7 sections
 */

"use client";

import { useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { MessageList } from "./MessageList";
import { MessageComposer } from "./MessageComposer";
import { ThreadView } from "./ThreadView";
import { ChatSidebar } from "./ChatSidebar";
import { cn } from "@/lib/utils";

interface ChatContainerProps {
  channelId: string;
}

export function ChatContainer({ channelId }: ChatContainerProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Mobile: Stack layout with overlay sidebar
  if (isMobile) {
    return (
      <div className="flex h-full flex-col">
        {/* Mobile Sidebar (Sheet overlay) */}
        <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
          <SheetContent side="left" className="p-0 w-[280px]">
            <ChatSidebar />
          </SheetContent>
        </Sheet>

        {/* Messages area */}
        <div className="flex-1 overflow-hidden">
          <MessageList
            channelId={channelId}
            onThreadClick={(messageId) => setSelectedThreadId(messageId)}
          />
        </div>

        {/* Composer */}
        <div className="border-t">
          <MessageComposer channelId={channelId} />
        </div>

        {/* Thread view (overlay on mobile) */}
        {selectedThreadId && (
          <div className="absolute inset-0 bg-background z-50">
            <ThreadView
              threadId={selectedThreadId}
              onClose={() => setSelectedThreadId(null)}
            />
          </div>
        )}
      </div>
    );
  }

  // Desktop: 3-panel layout (Sidebar | Messages | Thread)
  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      {/* Sidebar Panel */}
      <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
        <ChatSidebar />
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Main chat area */}
      <ResizablePanel defaultSize={selectedThreadId ? 50 : 80} minSize={40}>
        <div className="flex h-full flex-col">
          {/* Messages list */}
          <div className="flex-1 overflow-hidden">
            <MessageList
              channelId={channelId}
              onThreadClick={(messageId) => setSelectedThreadId(messageId)}
            />
          </div>

          {/* Message composer */}
          <div className="border-t">
            <MessageComposer channelId={channelId} />
          </div>
        </div>
      </ResizablePanel>

      {/* Thread panel (only show when thread is selected) */}
      {selectedThreadId && (
        <>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={30} minSize={25} maxSize={40}>
            <ThreadView
              threadId={selectedThreadId}
              onClose={() => setSelectedThreadId(null)}
            />
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
}
