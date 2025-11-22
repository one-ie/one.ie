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
import { UnifiedNav, type BreadcrumbStep } from "./navigation/UnifiedNav";
import { KeyboardShortcuts } from "./navigation/KeyboardShortcuts";
import { CollaborationWrapper } from "./CollaborationWrapper";

interface WebsiteBuilderProps {
	websiteId: string;
	pageId: string;
	defaultLayout?: number[];
	userId?: string;
	userName?: string;
}

export function WebsiteBuilder({
	websiteId,
	pageId,
	defaultLayout = [25, 50, 25],
	userId = "anonymous",
	userName = "Guest User",
}: WebsiteBuilderProps) {
	const [showChat, setShowChat] = React.useState(true);
	const [showCode, setShowCode] = React.useState(true);
	const [activePanel, setActivePanel] = React.useState<
		"chat" | "preview" | "code"
	>("preview");
	const [currentStep, setCurrentStep] = React.useState<BreadcrumbStep>("builder");
	const isMobile = useMediaQuery("(max-width: 768px)");

	// Handle navigation between different screens
	const handleNavigate = React.useCallback((step: BreadcrumbStep) => {
		setCurrentStep(step);
		// In a real app, this would navigate to /chat or other routes
		// For now, it updates the active panel in the builder
		if (step === "chat") {
			setActivePanel("chat");
		} else if (step === "preview") {
			setActivePanel("preview");
		}
	}, []);

	// Wrap mobile and desktop layouts with collaboration
	const MobileLayout = () => (
		<div className="h-full flex flex-col">
				{/* Unified Navigation */}
				<UnifiedNav
					currentStep={currentStep}
					onNavigate={handleNavigate}
					context="builder"
					websiteId={websiteId}
					pageId={pageId}
					showBreadcrumbs={false}
					showQuickActions={true}
					quickActions={{
						onAskAI: () => setActivePanel("chat"),
						onBrowseComponents: () => {
							// Emit event to open component picker modal
							window.dispatchEvent(
								new CustomEvent("open-component-picker")
							);
						},
						onPreview: () => setActivePanel("preview"),
						context: "builder",
					}}
				/>

				{/* Mobile Panel Navigation */}
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

			{/* Keyboard Shortcuts */}
			<KeyboardShortcuts />
		</div>
	);

	const DesktopLayout = () => (
		<div className="h-full flex flex-col">
			{/* Unified Navigation */}
			<UnifiedNav
				currentStep={currentStep}
				onNavigate={handleNavigate}
				context="builder"
				websiteId={websiteId}
				pageId={pageId}
				showBreadcrumbs={true}
				showQuickActions={true}
				quickActions={{
					onAskAI: () => setShowChat(true),
					onBrowseComponents: () => {
						// Emit event to open component picker modal
						window.dispatchEvent(
							new CustomEvent("open-component-picker")
						);
					},
					onPreview: () => setCurrentStep("preview"),
					onGenerateCode: () => {
						// Focus on chat panel to continue conversation
						setActivePanel("chat");
					},
					context: "builder",
				}}
			/>

			{/* Desktop Panel Toggles (legacy, kept for backward compatibility) */}
			<div className="border-b bg-secondary/30 px-4 py-2 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<span className="text-sm text-muted-foreground">Panel visibility:</span>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant={showChat ? "default" : "outline"}
						size="sm"
						onClick={() => setShowChat(!showChat)}
						title="Toggle chat panel"
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
						title="Toggle code panel"
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

			{/* Keyboard Shortcuts */}
			<KeyboardShortcuts />
		</div>
	);

	// Wrap with collaboration features
	return (
		<CollaborationWrapper
			websiteId={websiteId}
			pageId={pageId}
			userId={userId}
			userName={userName}
		>
			{isMobile ? <MobileLayout /> : <DesktopLayout />}
		</CollaborationWrapper>
	);
}
