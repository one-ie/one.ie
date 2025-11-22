"use client";

import * as React from "react";
import {
	MessageSquare,
	Wand2,
	Package,
	Eye,
	Zap,
	Code2,
	FileCode,
	Download,
	MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

export interface QuickActionsProps {
	onAskAI?: () => void;
	onBrowseComponents?: () => void;
	onPreview?: () => void;
	onGenerateCode?: () => void;
	onExportCode?: () => void;
	onDeploy?: () => void;
	isDarkMode?: boolean;
	onToggleDarkMode?: (enabled: boolean) => void;
	context?: "chat" | "builder" | "preview";
}

export function QuickActions({
	onAskAI,
	onBrowseComponents,
	onPreview,
	onGenerateCode,
	onExportCode,
	onDeploy,
	isDarkMode = false,
	onToggleDarkMode,
	context = "builder",
}: QuickActionsProps) {
	const ActionButton = ({
		icon: Icon,
		label,
		shortcut,
		onClick,
		variant = "ghost",
	}: {
		icon: React.ReactNode;
		label: string;
		shortcut?: string;
		onClick?: () => void;
		variant?: "ghost" | "default" | "outline";
	}) => (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant={variant}
						size="sm"
						onClick={onClick}
						className="h-9"
					>
						{Icon}
						<span className="ml-2 text-xs">{label}</span>
					</Button>
				</TooltipTrigger>
				<TooltipContent side="bottom" className="text-xs">
					{label}
					{shortcut && <span className="ml-2 text-muted-foreground">{shortcut}</span>}
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);

	// Context-specific actions
	const primaryActions = {
		chat: [
			{
				icon: <Wand2 className="h-4 w-4" />,
				label: "Generate Code",
				shortcut: "⌘↵",
				onClick: onGenerateCode,
			},
		],
		builder: [
			{
				icon: <MessageSquare className="h-4 w-4" />,
				label: "Ask AI",
				shortcut: "⌘K",
				onClick: onAskAI,
			},
			{
				icon: <Package className="h-4 w-4" />,
				label: "Components",
				shortcut: "⌘P",
				onClick: onBrowseComponents,
			},
			{
				icon: <Eye className="h-4 w-4" />,
				label: "Preview",
				shortcut: "⌘⇧P",
				onClick: onPreview,
			},
		],
		preview: [
			{
				icon: <Code2 className="h-4 w-4" />,
				label: "View Code",
				shortcut: "⌘E",
				onClick: onExportCode,
			},
		],
	};

	const actions = primaryActions[context] || [];

	return (
		<div className="flex items-center gap-2">
			{/* Primary Actions */}
			{actions.map((action, index) => (
				<React.Fragment key={`${context}-${index}`}>
					<ActionButton {...action} />
				</React.Fragment>
			))}

			{/* More Actions Menu */}
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="sm" className="h-9 w-9 p-0">
						<MoreHorizontal className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-56">
					<DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
					<DropdownMenuSeparator />

					{context === "builder" && (
						<DropdownMenuGroup>
							<DropdownMenuItem onClick={onAskAI}>
								<MessageSquare className="h-4 w-4 mr-2" />
								<span>Ask AI</span>
								<span className="ml-auto text-xs text-muted-foreground">⌘K</span>
							</DropdownMenuItem>
							<DropdownMenuItem onClick={onBrowseComponents}>
								<Package className="h-4 w-4 mr-2" />
								<span>Browse Components</span>
								<span className="ml-auto text-xs text-muted-foreground">⌘P</span>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
						</DropdownMenuGroup>
					)}

					<DropdownMenuGroup>
						{onGenerateCode && (
							<DropdownMenuItem onClick={onGenerateCode}>
								<Wand2 className="h-4 w-4 mr-2" />
								<span>Generate Code</span>
								<span className="ml-auto text-xs text-muted-foreground">⌘↵</span>
							</DropdownMenuItem>
						)}
						{onExportCode && (
							<DropdownMenuItem onClick={onExportCode}>
								<FileCode className="h-4 w-4 mr-2" />
								<span>Export Code</span>
							</DropdownMenuItem>
						)}
						{onPreview && (
							<DropdownMenuItem onClick={onPreview}>
								<Eye className="h-4 w-4 mr-2" />
								<span>Preview</span>
								<span className="ml-auto text-xs text-muted-foreground">⌘⇧P</span>
							</DropdownMenuItem>
						)}
					</DropdownMenuGroup>

					{onDeploy && (
						<>
							<DropdownMenuSeparator />
							<DropdownMenuGroup>
								<DropdownMenuItem onClick={onDeploy}>
									<Download className="h-4 w-4 mr-2" />
									<span>Deploy</span>
								</DropdownMenuItem>
							</DropdownMenuGroup>
						</>
					)}

					<DropdownMenuSeparator />

					<DropdownMenuGroup>
						<DropdownMenuItem
							onClick={() => onToggleDarkMode?.(!isDarkMode)}
						>
							<Zap className="h-4 w-4 mr-2" />
							<span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
						</DropdownMenuItem>
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
