/**
 * Chat Sidebar Component
 *
 * Right-side collapsible sidebar for product chat
 * - Exactly 33% width when open
 * - Collapses to thin bar when closed
 * - Smooth transitions like left sidebar
 * - Toggle button to open/close
 */

import { useState, useEffect } from 'react';
import { X, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductChatAssistant from './ProductChatAssistant';

interface ChatSidebarProps {
  initialOpen?: boolean;
}

export function ChatSidebar({ initialOpen = true }: ChatSidebarProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [isHovering, setIsHovering] = useState(false);

  // Width calculations
  const closedWidth = '48px'; // Thin bar when closed
  const openWidth = '33.333%'; // Exactly 1/3 of window
  const sidebarWidth = isOpen || isHovering ? openWidth : closedWidth;

  // Update main content padding when sidebar state changes
  useEffect(() => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      if (isOpen || isHovering) {
        mainContent.style.paddingRight = openWidth;
      } else {
        mainContent.style.paddingRight = closedWidth;
      }
    }
  }, [isOpen, isHovering, openWidth]);

  return (
    <>
      {/* Right Sidebar */}
      <aside
        className="fixed right-0 top-0 h-screen flex flex-col border-l-4 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white transition-all duration-300 ease-in-out z-40"
        style={{ width: sidebarWidth }}
        onMouseEnter={() => {
          if (!isOpen) {
            setIsHovering(true);
          }
        }}
        onMouseLeave={() => {
          setIsHovering(false);
        }}
      >
        {/* Header with toggle button */}
        <div className="flex h-16 items-center border-b border-black dark:border-white shrink-0 relative z-10">
          {(isOpen || isHovering) ? (
            <>
              <div className="flex items-center gap-2 flex-1 px-4">
                <MessageSquare className="w-5 h-5" />
                <span className="font-semibold text-xs tracking-[0.2em] uppercase">Chat Assistant</span>
              </div>
              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
                className="shrink-0 h-16 w-16 rounded-none hover:bg-black/5 dark:hover:bg-white/5"
              >
                <X className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(true)}
              aria-label="Open chat"
              className="mx-auto"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Chat Content */}
        {(isOpen || isHovering) && (
          <div className="flex-1 overflow-hidden">
            <ProductChatAssistant />
          </div>
        )}

        {/* Collapsed state hint */}
        {!isOpen && !isHovering && (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 p-2">
            <div className="writing-vertical-rl text-xs text-muted-foreground">
              Chat
            </div>
          </div>
        )}
      </aside>

      {/* Floating toggle button when sidebar is closed */}
      {!isOpen && !isHovering && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed right-4 bottom-4 z-30 rounded-full shadow-lg"
          size="icon"
          aria-label="Open chat"
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
      )}
    </>
  );
}

export default ChatSidebar;
