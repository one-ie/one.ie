"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { Breadcrumbs, type BreadcrumbStep } from "./Breadcrumbs";
import { QuickActions, type QuickActionsProps } from "./QuickActions";
import { KeyboardShortcuts } from "./KeyboardShortcuts";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export interface UnifiedNavProps {
	currentStep: BreadcrumbStep;
	onNavigate?: (step: BreadcrumbStep) => void;
	quickActions?: QuickActionsProps;
	showBreadcrumbs?: boolean;
	showQuickActions?: boolean;
	context?: "chat" | "builder" | "preview";
	websiteId?: string;
	pageId?: string;
	title?: string;
}

export function UnifiedNav({
	currentStep,
	onNavigate,
	quickActions,
	showBreadcrumbs = true,
	showQuickActions = true,
	context = "builder",
	websiteId,
	pageId,
	title = "Website Builder",
}: UnifiedNavProps) {
	const [showMenu, setShowMenu] = useState(false);
	const [isMobile, setIsMobile] = useState(false);

	// Handle keyboard shortcuts globally
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Ctrl/Cmd + K - Open chat/command palette
			if ((e.ctrlKey || e.metaKey) && e.key === "k") {
				e.preventDefault();
				onNavigate?.("chat");
			}
			// Ctrl/Cmd + B - Open builder
			if ((e.ctrlKey || e.metaKey) && e.key === "b") {
				e.preventDefault();
				onNavigate?.("builder");
			}
			// Ctrl/Cmd + P - Open component picker
			if ((e.ctrlKey || e.metaKey) && e.key === "p") {
				e.preventDefault();
				quickActions?.onBrowseComponents?.();
			}
			// Ctrl/Cmd + Enter - Generate/compile
			if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
				e.preventDefault();
				quickActions?.onGenerateCode?.();
			}
			// Ctrl/Cmd + Shift + P - Preview
			if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "p") {
				e.preventDefault();
				quickActions?.onPreview?.();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [onNavigate, quickActions]);

	// Detect mobile
	useEffect(() => {
		const checkMobile = () => setIsMobile(window.innerWidth < 768);
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	return (
		<nav className="border-b bg-background">
			<div className="px-4 py-3 space-y-3">
				{/* Header Row */}
				<div className="flex items-center justify-between gap-4">
					{/* Logo/Title */}
					<div className="flex items-center gap-2 min-w-0">
						<h1 className="text-lg font-semibold truncate">{title}</h1>
						{websiteId && pageId && (
							<span className="text-sm text-muted-foreground hidden sm:inline">
								{websiteId} / {pageId}
							</span>
						)}
					</div>

					{/* Desktop Quick Actions */}
					{!isMobile && showQuickActions && quickActions && (
						<QuickActions {...quickActions} context={context} />
					)}

					{/* Mobile Menu Toggle */}
					{isMobile && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setShowMenu(!showMenu)}
							className="h-9 w-9 p-0"
						>
							{showMenu ? (
								<X className="h-4 w-4" />
							) : (
								<Menu className="h-4 w-4" />
							)}
						</Button>
					)}
				</div>

				{/* Breadcrumbs */}
				{showBreadcrumbs && (
					<div className="flex items-center gap-2">
						<Breadcrumbs
							currentStep={currentStep}
							onNavigate={onNavigate}
							showDeploy={false}
						/>
					</div>
				)}

				{/* Mobile Menu */}
				{isMobile && showMenu && showQuickActions && quickActions && (
					<div className="flex flex-col gap-2 pt-2 border-t">
						<QuickActions {...quickActions} context={context} />
					</div>
				)}
			</div>

			{/* Keyboard Shortcuts Help (Optional) */}
			<KeyboardShortcuts />
		</nav>
	);
}
