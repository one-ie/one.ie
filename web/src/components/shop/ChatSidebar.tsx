/**
 * Chat Sidebar Component
 *
 * Right-side collapsible AI shopping assistant
 * - Closed by default (full page width)
 * - Click floating button to open (45% width)
 * - Floating chat icon in bottom-right corner
 * - Smooth slide-in animation
 * - Page content adjusts when open
 */

import { MessageSquare, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import BuyInChatGPTEnhanced from "./buy-in-chatgpt/BuyInChatGPTEnhanced";

interface ProductData {
	id: string;
	name: string;
	price: number;
	description: string;
	category: string;
	brand?: string;
	stock: number;
	features?: string[];
	image?: string;
}

interface ChatSidebarProps {
	initialOpen?: boolean;
	product?: ProductData;
}

export function ChatSidebar({
	initialOpen = false,
	product,
}: ChatSidebarProps) {
	const [isOpen, setIsOpen] = useState(initialOpen);
	const [isHovering, setIsHovering] = useState(false);

	// Width calculations
	const openWidth = "45%"; // 45% of window

	// Update main content padding when sidebar state changes
	useEffect(() => {
		const mainContent = document.getElementById("main-content");
		if (mainContent) {
			if (isOpen) {
				mainContent.style.paddingRight = openWidth;
			} else {
				mainContent.style.paddingRight = "0";
			}
		}
	}, [isOpen, openWidth]);

	return (
		<>
			{/* Right Sidebar - Only visible when open */}
			{isOpen && (
				<aside
					className="fixed right-0 top-0 h-screen flex flex-col border-l border-border bg-[hsl(0,0%,10%)] text-foreground transition-all duration-300 ease-in-out z-40"
					style={{ width: openWidth }}
				>
					{/* Header with close button */}
					<div className="flex h-16 items-center border-b border-border shrink-0 relative z-10">
						<div className="flex items-center gap-2 flex-1 px-4">
							<MessageSquare className="w-5 h-5" />
							<span className="font-semibold text-xs tracking-[0.2em] uppercase">
								AI Shopping Assistant
							</span>
						</div>
						{/* Close button */}
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setIsOpen(false)}
							aria-label="Close chat"
							className="shrink-0 h-16 w-16 rounded-none hover:bg-muted"
						>
							<X className="h-5 w-5" />
						</Button>
					</div>

					{/* Chat Content */}
					<div className="flex-1 overflow-hidden">
						<BuyInChatGPTEnhanced product={product} />
					</div>
				</aside>
			)}

			{/* Floating chat icon button when sidebar is closed */}
			{!isOpen && (
				<button
					onClick={() => setIsOpen(true)}
					className="fixed right-6 bottom-6 z-50 w-14 h-14 sm:w-16 sm:h-16 bg-primary text-primary-foreground rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center group border-2 border-primary"
					aria-label="Open AI Shopping Assistant"
				>
					<MessageSquare className="h-6 w-6 sm:h-7 sm:w-7 group-hover:animate-pulse" />

					{/* Notification badge */}
					<span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-destructive rounded-full border-2 border-background flex items-center justify-center">
						<span className="text-[10px] font-bold text-destructive-foreground">
							AI
						</span>
					</span>

					{/* Tooltip */}
					<div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-popover text-popover-foreground text-xs font-medium rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-border">
						Chat with AI Assistant
						<div className="absolute top-full right-4 w-2 h-2 bg-popover border-r border-b border-border transform rotate-45 -mt-1" />
					</div>
				</button>
			)}
		</>
	);
}

export default ChatSidebar;
