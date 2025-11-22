/**
 * Chat With History
 *
 * Complete chat interface with conversation history management:
 * - Automatic message persistence
 * - Conversation history sidebar
 * - Resume from any point
 * - Undo/redo code changes
 * - Export as markdown
 * - Search functionality
 */

import { useStore } from '@nanostores/react';
import { useEffect, useState } from 'react';
import {
  addMessage,
  currentConversationId,
  createConversation,
  getCurrentConversation,
  type ConversationMessage,
  trackCodeVersion,
} from '@/stores/conversationHistory';
import { ConversationHistorySidebar } from './ConversationHistorySidebar';
import { ConversationHistoryPanel } from './ConversationHistoryPanel';
import { ConversationControls } from './ConversationControls';
import { Button } from '@/components/ui/button';
import { MessageSquare, Sidebar } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface ChatWithHistoryProps {
  children: React.ReactNode;
  onMessagesChange?: (messages: ConversationMessage[]) => void;
  onCodeRevert?: (code: string, file: string) => void;
  enableAutoSave?: boolean;
}

export function ChatWithHistory({
  children,
  onMessagesChange,
  onCodeRevert,
  enableAutoSave = true,
}: ChatWithHistoryProps) {
  const $currentConversationId = useStore(currentConversationId);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);

  // Initialize conversation if none exists
  useEffect(() => {
    if (!$currentConversationId && enableAutoSave) {
      createConversation('New Conversation');
    }
  }, [$currentConversationId, enableAutoSave]);

  // Load current conversation messages
  useEffect(() => {
    const conversation = getCurrentConversation();
    if (conversation) {
      setMessages(conversation.messages);
      onMessagesChange?.(conversation.messages);
    }
  }, [$currentConversationId]);

  const handleConversationLoad = (loadedMessages: ConversationMessage[]) => {
    setMessages(loadedMessages);
    onMessagesChange?.(loadedMessages);
  };

  const handleResumeFromMessage = (resumedMessages: ConversationMessage[]) => {
    setMessages(resumedMessages);
    onMessagesChange?.(resumedMessages);
  };

  const handleClear = () => {
    setMessages([]);
    onMessagesChange?.([]);
  };

  const handleSearchResults = (results: ConversationMessage[]) => {
    // Could highlight search results in the UI
    console.log('Search results:', results);
  };

  return (
    <div className="relative h-full">
      {/* Main Chat Area */}
      <div className="h-full flex flex-col">
        {/* Controls Bar */}
        <div className="flex items-center justify-between p-3 border-b border-border bg-background">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            <h2 className="font-semibold">
              {getCurrentConversation()?.title || 'Chat'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <ConversationControls
              messageCount={messages.length}
              onClear={handleClear}
              onSearchResults={handleSearchResults}
            />

            {/* Mobile History Panel Trigger */}
            <Sheet open={showHistoryPanel} onOpenChange={setShowHistoryPanel}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="md:hidden">
                  <Sidebar className="h-4 w-4 mr-2" />
                  History
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[400px] p-0">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle>Conversation History</SheetTitle>
                  <SheetDescription>
                    View and manage your conversation history
                  </SheetDescription>
                </SheetHeader>
                <div className="h-[calc(100%-80px)]">
                  <ConversationHistoryPanel
                    onResumeFromMessage={handleResumeFromMessage}
                    onRevertToVersion={onCodeRevert}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Chat Content */}
        <div className="flex-1 overflow-hidden">{children}</div>
      </div>

      {/* History Sidebar (Desktop) */}
      <ConversationHistorySidebar onConversationLoad={handleConversationLoad} />
    </div>
  );
}

/**
 * Hook to add messages to conversation history
 */
export function useConversationHistory() {
  const $currentConversationId = useStore(currentConversationId);

  const addMessageToHistory = (message: Omit<ConversationMessage, 'id' | 'timestamp'>) => {
    if (!$currentConversationId) {
      createConversation('New Conversation');
    }

    const fullMessage: ConversationMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    addMessage(fullMessage);
    return fullMessage;
  };

  const trackCode = (messageId: string, code: string, file: string) => {
    trackCodeVersion(messageId, code, file);
  };

  return {
    addMessage: addMessageToHistory,
    trackCodeVersion: trackCode,
    currentConversationId: $currentConversationId,
  };
}
