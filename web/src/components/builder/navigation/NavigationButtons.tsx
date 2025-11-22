"use client";

import * as React from "react";
import { ArrowRight, Code2, Eye, Wand2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

export interface NavigationButtonsProps {
	onOpenInBuilder?: () => void;
	onAskAI?: () => void;
	onBrowseComponents?: () => void;
	onPreview?: () => void;
	context?: "chat" | "builder" | "preview";
	orientation?: "horizontal" | "vertical";
	size?: "sm" | "md" | "lg";
}

/**
 * Navigation Buttons Component
 * Provides context-aware navigation buttons for different screens
 *
 * Usage in chat: After code generation, show "Open in Builder" button
 * Usage in builder: Show "Ask AI", "Browse Components", "Preview" buttons
 * Usage in preview: Show "Edit Code", "Ask AI" buttons
 */
export function NavigationButtons({
	onOpenInBuilder,
	onAskAI,
	onBrowseComponents,
	onPreview,
	context = "builder",
	orientation = "horizontal",
	size = "md",
}: NavigationButtonsProps) {
	const buttonSize = {
		sm: "h-8 text-xs",
		md: "h-9 text-sm",
		lg: "h-10 text-base",
	}[size];

	const containerClass =
		orientation === "vertical"
			? "flex flex-col gap-2 w-full"
			: "flex flex-row gap-2";

	// Context-specific button groups
	const buttons = {
		chat: [
			{
				label: "Open in Builder",
				icon: <Code2 className="h-4 w-4" />,
				onClick: onOpenInBuilder,
				variant: "default" as const,
				tooltip: "Open this code in the website builder (⌘B)",
			},
		],
		builder: [
			{
				label: "Ask AI",
				icon: <MessageSquare className="h-4 w-4" />,
				onClick: onAskAI,
				variant: "outline" as const,
				tooltip: "Ask AI to modify or enhance your page (⌘K)",
			},
			{
				label: "Browse Components",
				icon: <Wand2 className="h-4 w-4" />,
				onClick: onBrowseComponents,
				variant: "outline" as const,
				tooltip: "Browse and add components from the library (⌘P)",
			},
			{
				label: "Preview",
				icon: <Eye className="h-4 w-4" />,
				onClick: onPreview,
				variant: "outline" as const,
				tooltip: "View the live preview (⌘⇧P)",
			},
		],
		preview: [
			{
				label: "Edit Code",
				icon: <Code2 className="h-4 w-4" />,
				onClick: onAskAI,
				variant: "outline" as const,
				tooltip: "Edit the code directly",
			},
			{
				label: "Ask AI",
				icon: <MessageSquare className="h-4 w-4" />,
				onClick: onAskAI,
				variant: "default" as const,
				tooltip: "Ask AI to modify the preview (⌘K)",
			},
		],
	};

	const activeButtons = buttons[context] || [];

	return (
		<div className={containerClass}>
			{activeButtons.map((button, index) => (
				<TooltipProvider key={`${context}-${index}`}>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								onClick={button.onClick}
								variant={button.variant}
								className={`${buttonSize} ${
									orientation === "vertical"
										? "w-full justify-start"
										: "gap-2"
								}`}
							>
								{button.icon}
								<span className={orientation === "vertical" ? "ml-2" : ""}>
									{button.label}
								</span>
								{index === activeButtons.length - 1 &&
									context === "chat" && (
										<ArrowRight className="h-4 w-4 ml-auto opacity-50" />
									)}
							</Button>
						</TooltipTrigger>
						<TooltipContent side="top" className="text-xs">
							{button.tooltip}
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			))}
		</div>
	);
}

/**
 * Inline Navigation Button
 * Use this for showing a single "Open in Builder" button after code generation
 */
export function InlineNavigationButton({
	label = "Open in Builder",
	onClick,
	isPending = false,
}: {
	label?: string;
	onClick?: () => void;
	isPending?: boolean;
}) {
	return (
		<Button
			onClick={onClick}
			disabled={isPending}
			variant="default"
			className="gap-2"
		>
			{isPending ? (
				<div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
			) : (
				<Code2 className="h-4 w-4" />
			)}
			{label}
		</Button>
	);
}
