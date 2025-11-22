"use client";

import { ChatClientV2 } from "@/components/ai/ChatClientV2";

export function ChatPanel() {
	return (
		<div className="h-full flex flex-col bg-background">
			<div className="border-b px-4 py-3">
				<h2 className="text-lg font-semibold">AI Assistant</h2>
				<p className="text-sm text-muted-foreground">
					Chat with AI to build your website
				</p>
			</div>
			<div className="flex-1 overflow-hidden">
				<ChatClientV2 />
			</div>
		</div>
	);
}
