"use client";

import * as React from "react";
import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

interface ShortcutGroup {
	category: string;
	shortcuts: Array<{
		keys: string[];
		description: string;
	}>;
}

const shortcuts: ShortcutGroup[] = [
	{
		category: "Navigation",
		shortcuts: [
			{
				keys: ["⌘", "K"],
				description: "Open chat / command palette",
			},
			{
				keys: ["⌘", "B"],
				description: "Open builder",
			},
			{
				keys: ["⌘", "P"],
				description: "Open component picker",
			},
			{
				keys: ["⌘", "⇧", "P"],
				description: "Open preview",
			},
		],
	},
	{
		category: "Actions",
		shortcuts: [
			{
				keys: ["⌘", "↵"],
				description: "Generate / Compile code",
			},
			{
				keys: ["⌘", "S"],
				description: "Save changes",
			},
			{
				keys: ["⌘", "Z"],
				description: "Undo",
			},
			{
				keys: ["⌘", "⇧", "Z"],
				description: "Redo",
			},
		],
	},
	{
		category: "Editor",
		shortcuts: [
			{
				keys: ["⌘", "/"],
				description: "Toggle comment",
			},
			{
				keys: ["⌘", "A"],
				description: "Select all",
			},
			{
				keys: ["⌘", "F"],
				description: "Find and replace",
			},
		],
	},
];

/**
 * Keyboard Shortcuts Dialog
 * Displays available keyboard shortcuts to users
 * Accessible via ? key or help button
 */
export function KeyboardShortcuts() {
	const [open, setOpen] = useState(false);

	// Listen for ? key to open shortcuts
	React.useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
				setOpen(true);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	return (
		<>
			{/* Help Button (visible in bottom right when not on mobile) */}
			<div className="fixed bottom-6 right-6 hidden md:block">
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setOpen(true)}
								className="h-9 w-9 p-0 rounded-full bg-background border shadow-sm hover:shadow-md transition-shadow"
							>
								<HelpCircle className="h-4 w-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent side="left" className="text-xs">
							Keyboard shortcuts (Press ?)
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</div>

			{/* Shortcuts Dialog */}
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Keyboard Shortcuts</DialogTitle>
						<DialogDescription>
							Use these keyboard shortcuts to navigate and control the builder faster
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-6 py-4">
						{shortcuts.map((group, index) => (
							<div key={index}>
								<h3 className="text-sm font-semibold mb-3 text-foreground">
									{group.category}
								</h3>
								<div className="space-y-2">
									{group.shortcuts.map((shortcut, shortcutIndex) => (
										<div
											key={shortcutIndex}
											className="flex items-center justify-between gap-4 rounded-lg border border-secondary px-3 py-2 hover:bg-secondary/50 transition-colors"
										>
											<div className="flex items-center gap-2">
												{shortcut.keys.map((key, keyIndex) => (
													<React.Fragment key={keyIndex}>
														<kbd className="rounded bg-background px-2 py-1 text-xs font-semibold border border-border">
															{key}
														</kbd>
														{keyIndex < shortcut.keys.length - 1 && (
															<span className="text-muted-foreground text-xs">+</span>
														)}
													</React.Fragment>
												))}
											</div>
											<span className="text-sm text-muted-foreground">
												{shortcut.description}
											</span>
										</div>
									))}
								</div>
							</div>
						))}
					</div>

					<div className="rounded-lg bg-secondary/30 p-3 text-xs text-muted-foreground">
						<p>
							<strong>Tip:</strong> Press <kbd className="rounded bg-background px-1.5 py-0.5 border border-border text-xs font-semibold">?</kbd> at any time to open this dialog
						</p>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
