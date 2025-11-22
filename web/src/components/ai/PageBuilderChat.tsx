/**
 * Page Builder Chat Component
 *
 * Conversational interface for building funnel pages.
 */

import { useCallback, useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { useChat } from "ai/react";
import {
	MessageSquare,
	Sparkles,
	Send,
	Loader2,
	Lightbulb,
	Undo2,
	Redo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
	pageBuilderContext$,
	selectedElement$,
	addElement,
	updateElement,
	removeElement,
	reorderElements,
	duplicateElement,
	undo,
	redo,
	historyIndex$,
	historyStack$,
} from "@/stores/pageBuilder";
import type { ElementType, PageElement } from "@/types/funnel-builder";
import {
	PAGE_BUILDER_SYSTEM_PROMPT,
	formatPageContext,
	getQuickSuggestions,
	getOptimizationTips,
} from "@/lib/ai/page-builder-prompts";
import {
	PAGE_BUILDER_TOOLS,
	createDefaultElement,
	type ToolExecutor,
} from "@/components/ai/tools/PageBuilderTools";

interface PageBuilderChatProps {
	/**
	 * Whether the chat is collapsed (icon only)
	 */
	collapsed?: boolean;
	/**
	 * Callback when collapse state should change
	 */
	onToggleCollapse?: () => void;
}

export function PageBuilderChat({
	collapsed = false,
	onToggleCollapse,
}: PageBuilderChatProps) {
	const context = useStore(pageBuilderContext$);
	const selectedElement = useStore(selectedElement$);
	const historyIndex = useStore(historyIndex$);
	const historyStack = useStore(historyStack$);

	const canUndo = historyIndex > 0;
	const canRedo = historyIndex < historyStack.length - 1;

	// Quick suggestions
	const [suggestions, setSuggestions] = useState<string[]>([]);
	const [tips, setTips] = useState<string[]>([]);

	// Update suggestions when page changes
	useEffect(() => {
		if (!context) return;

		const elements = context.step.elements.map((el) => ({
			type: el.type,
		}));

		const newSuggestions = getQuickSuggestions(elements);
		const newTips = getOptimizationTips(elements);

		setSuggestions(newSuggestions);
		setTips(newTips);
	}, [context?.step.elements]);

	/**
	 * Tool executor implementation
	 */
	const toolExecutor: ToolExecutor = {
		add_element: async ({ elementType, properties, position }) => {
			const element = createDefaultElement(
				elementType,
				properties,
				position
			) as PageElement;
			addElement(element);

			return {
				success: true,
				elementId: element.id,
				message: `Added ${elementType} element`,
			};
		},

		update_element: async ({ elementId, updates }) => {
			updateElement(elementId, updates);
			return {
				success: true,
				message: `Updated element ${elementId}`,
			};
		},

		remove_element: async ({ elementId }) => {
			removeElement(elementId);
			return {
				success: true,
				message: `Removed element ${elementId}`,
			};
		},

		reorder_elements: async ({ elementIds }) => {
			reorderElements(elementIds);
			return {
				success: true,
				message: "Reordered elements",
			};
		},

		duplicate_element: async ({ elementId }) => {
			duplicateElement(elementId);
			return {
				success: true,
				newElementId: `${elementId}-copy`,
				message: `Duplicated element ${elementId}`,
			};
		},

		get_suggestions: async () => {
			return {
				suggestions,
				tips,
			};
		},

		preview_page: async ({ device = "desktop" }) => {
			return {
				previewUrl: `/funnels/${context?.funnelId}/steps/${context?.stepId}/preview?device=${device}`,
			};
		},
	};

	/**
	 * Chat hook with tool support
	 */
	const { messages, input, setInput, handleSubmit, isLoading, append } =
		useChat({
			api: "/api/chat/page-builder",
			initialMessages: [
				{
					id: "welcome",
					role: "assistant",
					content: `Hi! I'm your AI page builder assistant. I'll help you create a beautiful, high-converting page through conversation.

What would you like to add first? Here are some ideas:
- Add a compelling headline
- Add a call-to-action button
- Add a lead capture form
- Add testimonials for social proof

Just tell me what you need!`,
				},
			],
			onToolCall: async ({ toolCall }) => {
				const toolName = toolCall.toolName as keyof ToolExecutor;
				const toolArgs = toolCall.args as any;

				if (toolName in toolExecutor) {
					const result = await toolExecutor[toolName](toolArgs);
					return result;
				}

				return { error: "Unknown tool" };
			},
		});

	/**
	 * Handle suggestion click
	 */
	const handleSuggestionClick = useCallback(
		(suggestion: string) => {
			setInput(suggestion);
		},
		[setInput]
	);

	/**
	 * Handle quick action
	 */
	const handleQuickAction = useCallback(
		async (action: string) => {
			await append({
				role: "user",
				content: action,
			});
		},
		[append]
	);

	if (!context) {
		return (
			<div className="flex items-center justify-center h-full p-8 text-center">
				<div className="space-y-4">
					<MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
					<p className="text-muted-foreground">
						Select a funnel step to start building
					</p>
				</div>
			</div>
		);
	}

	if (collapsed) {
		return (
			<div className="flex flex-col items-center gap-4 p-4">
				<Button
					variant="ghost"
					size="icon"
					onClick={onToggleCollapse}
					title="Expand chat"
				>
					<Sparkles className="h-5 w-5" />
				</Button>
				<Separator />
				<Button
					variant="ghost"
					size="icon"
					onClick={() => undo()}
					disabled={!canUndo}
					title="Undo"
				>
					<Undo2 className="h-4 w-4" />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					onClick={() => redo()}
					disabled={!canRedo}
					title="Redo"
				>
					<Redo2 className="h-4 w-4" />
				</Button>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full">
			{/* Header */}
			<div className="flex items-center justify-between p-4 border-b">
				<div className="flex items-center gap-2">
					<Sparkles className="h-5 w-5 text-primary" />
					<div>
						<h3 className="font-semibold">AI Page Builder</h3>
						<p className="text-xs text-muted-foreground">
							{context.step.name} • {context.step.elements.length} elements
						</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => undo()}
						disabled={!canUndo}
					>
						<Undo2 className="h-4 w-4 mr-1" />
						Undo
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => redo()}
						disabled={!canRedo}
					>
						<Redo2 className="h-4 w-4 mr-1" />
						Redo
					</Button>
				</div>
			</div>

			{/* Optimization Tips */}
			{tips.length > 0 && (
				<div className="p-4 bg-amber-50 dark:bg-amber-950/20 border-b">
					<div className="flex items-start gap-2">
						<Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
						<div className="flex-1 space-y-1">
							{tips.map((tip, i) => (
								<p key={i} className="text-xs text-amber-900 dark:text-amber-100">
									{tip}
								</p>
							))}
						</div>
					</div>
				</div>
			)}

			{/* Messages */}
			<div className="flex-1 overflow-y-auto p-4 space-y-4">
				{messages.map((message) => (
					<div
						key={message.id}
						className={`flex ${
							message.role === "user" ? "justify-end" : "justify-start"
						}`}
					>
						<div
							className={`max-w-[80%] rounded-lg px-4 py-2 ${
								message.role === "user"
									? "bg-primary text-primary-foreground"
									: "bg-muted"
							}`}
						>
							<p className="text-sm whitespace-pre-wrap">{message.content}</p>
						</div>
					</div>
				))}

				{isLoading && (
					<div className="flex justify-start">
						<div className="bg-muted rounded-lg px-4 py-2">
							<Loader2 className="h-4 w-4 animate-spin" />
						</div>
					</div>
				)}
			</div>

			{/* Quick Suggestions */}
			{suggestions.length > 0 && !isLoading && (
				<div className="p-4 border-t space-y-2">
					<p className="text-xs font-medium text-muted-foreground">
						Quick suggestions:
					</p>
					<div className="flex flex-wrap gap-2">
						{suggestions.map((suggestion, i) => (
							<Button
								key={i}
								variant="outline"
								size="sm"
								onClick={() => handleSuggestionClick(suggestion)}
							>
								{suggestion}
							</Button>
						))}
					</div>
				</div>
			)}

			{/* Input */}
			<form onSubmit={handleSubmit} className="p-4 border-t">
				<div className="flex gap-2">
					<Input
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder="Tell me what you'd like to add or change..."
						disabled={isLoading}
					/>
					<Button type="submit" size="icon" disabled={isLoading || !input}>
						{isLoading ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<Send className="h-4 w-4" />
						)}
					</Button>
				</div>
			</form>
		</div>
	);
}

/**
 * Collapsed chat sidebar button
 */
export function PageBuilderChatButton({
	onClick,
}: {
	onClick: () => void;
}) {
	return (
		<Button
			variant="outline"
			size="icon"
			className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg z-50"
			onClick={onClick}
		>
			<Sparkles className="h-5 w-5" />
		</Button>
	);
}
