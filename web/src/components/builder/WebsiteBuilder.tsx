"use client";

import * as React from "react";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
	MessageSquare,
	Monitor,
	Code2,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import { ChatPanel } from "./panels/ChatPanel";
import { PreviewPanel } from "./panels/PreviewPanel";
import { CodeEditorPanel } from "./panels/CodeEditorPanel";

interface WebsiteBuilderProps {
	websiteId: string;
	pageId: string;
	defaultLayout?: number[];
}

export function WebsiteBuilder({
	websiteId,
	pageId,
	defaultLayout = [25, 50, 25],
}: WebsiteBuilderProps) {
	const [showChat, setShowChat] = React.useState(true);
	const [showCode, setShowCode] = React.useState(true);
	const [activePanel, setActivePanel] = React.useState<
		"chat" | "preview" | "code"
	>("preview");
	const isMobile = useMediaQuery("(max-width: 768px)");

	// Mobile layout - show one panel at a time
	if (isMobile) {
		return (
			<div className="h-full flex flex-col">
				{/* Mobile Navigation */}
				<div className="border-b bg-background px-4 py-2 flex items-center gap-2">
					<Button
						variant={activePanel === "chat" ? "default" : "ghost"}
						size="sm"
						onClick={() => setActivePanel("chat")}
						className="flex-1"
					>
						<MessageSquare className="h-4 w-4 mr-2" />
						Chat
					</Button>
					<Button
						variant={activePanel === "preview" ? "default" : "ghost"}
						size="sm"
						onClick={() => setActivePanel("preview")}
						className="flex-1"
					>
						<Monitor className="h-4 w-4 mr-2" />
						Preview
					</Button>
					<Button
						variant={activePanel === "code" ? "default" : "ghost"}
						size="sm"
						onClick={() => setActivePanel("code")}
						className="flex-1"
					>
						<Code2 className="h-4 w-4 mr-2" />
						Code
					</Button>
				</div>

				{/* Active Panel */}
				<div className="flex-1 overflow-hidden">
					{activePanel === "chat" && <ChatPanel />}
					{activePanel === "preview" && (
						<PreviewPanel websiteId={websiteId} pageId={pageId} />
					)}
					{activePanel === "code" && (
						<CodeEditorPanel websiteId={websiteId} pageId={pageId} />
					)}
				</div>
			</div>
		);
	}

	// Desktop layout - resizable three-panel layout
	return (
		<div className="h-full flex flex-col">
			{/* Desktop Panel Toggles */}
			<div className="border-b bg-background px-4 py-2 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<h1 className="text-lg font-semibold">Website Builder</h1>
					<span className="text-sm text-muted-foreground">
						{websiteId} / {pageId}
					</span>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant={showChat ? "default" : "outline"}
						size="sm"
						onClick={() => setShowChat(!showChat)}
					>
						{showChat ? (
							<ChevronLeft className="h-4 w-4 mr-2" />
						) : (
							<ChevronRight className="h-4 w-4 mr-2" />
						)}
						<MessageSquare className="h-4 w-4 mr-2" />
						Chat
					</Button>
					<Button
						variant={showCode ? "default" : "outline"}
						size="sm"
						onClick={() => setShowCode(!showCode)}
					>
						<Code2 className="h-4 w-4 mr-2" />
						Code
						{showCode ? (
							<ChevronRight className="h-4 w-4 ml-2" />
						) : (
							<ChevronLeft className="h-4 w-4 ml-2" />
						)}
					</Button>
				</div>
			</div>

			{/* Resizable Panels */}
			<ResizablePanelGroup
				direction="horizontal"
				className="flex-1"
				onLayout={(sizes: number[]) => {
					// Persist layout to localStorage
					localStorage.setItem(
						"builder-layout",
						JSON.stringify(sizes),
					);
				}}
			>
				{/* Left Panel - AI Chat */}
				{showChat && (
					<>
						<ResizablePanel
							defaultSize={defaultLayout[0]}
							minSize={20}
							maxSize={40}
							className="min-w-[300px]"
						>
							<ChatPanel />
						</ResizablePanel>
						<ResizableHandle withHandle />
					</>
				)}

				{/* Center Panel - Live Preview */}
				<ResizablePanel
					defaultSize={
						showChat && showCode
							? defaultLayout[1]
							: showChat || showCode
								? 75
								: 100
					}
					minSize={30}
				>
					<PreviewPanel websiteId={websiteId} pageId={pageId} />
				</ResizablePanel>

				{/* Right Panel - Code Editor */}
				{showCode && (
					<>
						<ResizableHandle withHandle />
						<ResizablePanel
							defaultSize={defaultLayout[2]}
							minSize={20}
							maxSize={40}
							className="min-w-[300px]"
						>
							<CodeEditorPanel websiteId={websiteId} pageId={pageId} />
						</ResizablePanel>
					</>
				)}
			</ResizablePanelGroup>
		</div>
	);
}
