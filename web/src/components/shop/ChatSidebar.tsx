/**
 * Chat Sidebar Component
 *
 * Right-side collapsible sidebar for product chat
 * - Exactly 33% width when open
 * - Collapses to thin bar when closed
 * - Smooth transitions like left sidebar
 * - Toggle button to open/close
 */

import { MessageSquare, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import ProductChatAssistantEnhanced from "./ProductChatAssistantEnhanced";

interface ChatSidebarProps {
  initialOpen?: boolean;
}

export function ChatSidebar({ initialOpen = true }: ChatSidebarProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // Start closed on mobile
  const [isHovering, setIsHovering] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // On desktop, respect initialOpen; on mobile, always start closed
      if (!mobile) {
        setIsOpen(initialOpen);
      } else {
        setIsOpen(false);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [initialOpen]);

  // Width calculations
  const closedWidth = "48px"; // Thin bar when closed (desktop only)
  const openWidth = isMobile ? "100vw" : "33.333%"; // Fullscreen on mobile, 1/3 on desktop
  const sidebarWidth = isOpen || isHovering ? openWidth : closedWidth;

  // Update main content padding when sidebar state changes
  useEffect(() => {
    const mainContent = document.getElementById("main-content");
    if (mainContent) {
      // On mobile, no padding (sidebar is fullscreen overlay)
      // On desktop, add padding for sidebar
      if (isMobile) {
        mainContent.style.paddingRight = "0";
      } else if (isOpen || isHovering) {
        mainContent.style.paddingRight = openWidth;
      } else {
        mainContent.style.paddingRight = closedWidth;
      }
    }
  }, [isOpen, isHovering, openWidth, isMobile]);

  return (
    <>
      {/* Right Sidebar - Hidden on mobile when closed */}
      {(!isMobile || isOpen) && (
        <aside
          className={`fixed right-0 top-0 h-screen flex flex-col border-l-4 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white transition-all duration-300 ease-in-out ${
            isMobile ? "z-50" : "z-40"
          }`}
          style={{ width: sidebarWidth }}
          onMouseEnter={() => {
            if (!isOpen && !isMobile) {
              setIsHovering(true);
            }
          }}
          onMouseLeave={() => {
            if (!isMobile) {
              setIsHovering(false);
            }
          }}
        >
          {/* Header with toggle button */}
          <div className="flex h-16 items-center border-b border-black dark:border-white shrink-0 relative z-10">
            {isOpen || isHovering ? (
              <>
                <div className="flex items-center gap-2 flex-1 px-4">
                  <MessageSquare className="w-5 h-5" />
                  <span className="font-semibold text-xs tracking-[0.2em] uppercase">
                    Chat Assistant
                  </span>
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
              <ProductChatAssistantEnhanced />
            </div>
          )}

          {/* Collapsed state hint (desktop only) */}
          {!isOpen && !isHovering && !isMobile && (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 p-2">
              <div className="writing-vertical-rl text-xs text-muted-foreground">Chat</div>
            </div>
          )}
        </aside>
      )}

      {/* Floating toggle button - Always show when closed */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed right-4 bottom-4 z-30 rounded-full shadow-lg w-14 h-14 md:w-12 md:h-12 bg-white dark:bg-black text-black dark:text-white border-2 border-black dark:border-white hover:bg-black/5 dark:hover:bg-white/5"
          size="icon"
          aria-label="Open chat"
        >
          <MessageSquare className="h-6 w-6 md:h-5 md:w-5" />
        </Button>
      )}
    </>
  );
}

export default ChatSidebar;
