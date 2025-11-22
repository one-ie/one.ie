"use client";

/**
 * Component Suggestions Panel
 *
 * CYCLE 15: AI-powered component suggestions
 * Shows relevant components based on chat context or user intent
 */

import { useMemo } from "react";
import { getSmartSuggestions, detectIntent } from "@/lib/ai/componentSuggestions";
import type { ComponentItem } from "@/stores/componentPicker";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SparklesIcon, LightbulbIcon } from "lucide-react";
import { CATEGORY_LABELS } from "@/lib/componentLibrary";

interface ComponentSuggestionsProps {
	context?: string;
	messages?: Array<{ role: string; content: string }>;
	onInsert?: (component: ComponentItem) => void;
	limit?: number;
}

export function ComponentSuggestions({
	context = "",
	messages = [],
	onInsert,
	limit = 5,
}: ComponentSuggestionsProps) {
	// Get AI suggestions
	const suggestions = useMemo(() => {
		// Use chat messages if available
		if (messages.length > 0) {
			const recentUserMessages = messages
				.filter((m) => m.role === "user")
				.slice(-3)
				.map((m) => m.content)
				.join(" ");

			return getSmartSuggestions(recentUserMessages, limit);
		}

		// Otherwise use context
		return context ? getSmartSuggestions(context, limit) : [];
	}, [context, messages, limit]);

	// Detect intent for smart messaging
	const intent = useMemo(() => {
		const text = messages.length > 0
			? messages.filter((m) => m.role === "user").slice(-1)[0]?.content || ""
			: context;

		return detectIntent(text);
	}, [context, messages]);

	if (suggestions.length === 0) {
		return null;
	}

	return (
		<Card>
			<CardHeader className="pb-3">
				<div className="flex items-center gap-2">
					<SparklesIcon className="h-4 w-4 text-primary" />
					<CardTitle className="text-sm">AI Suggestions</CardTitle>
				</div>
				{intent.confidence > 0.5 && (
					<p className="text-xs text-muted-foreground mt-1">
						Detected intent: {formatIntent(intent.type)}
					</p>
				)}
			</CardHeader>
			<CardContent className="space-y-2">
				{suggestions.map((component) => (
					<SuggestionItem
						key={component.id}
						component={component}
						onInsert={onInsert}
					/>
				))}
			</CardContent>
		</Card>
	);
}

/**
 * Individual suggestion item
 */
interface SuggestionItemProps {
	component: ComponentItem;
	onInsert?: (component: ComponentItem) => void;
}

function SuggestionItem({ component, onInsert }: SuggestionItemProps) {
	return (
		<div className="flex items-start justify-between gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors">
			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-2 mb-1">
					<LightbulbIcon className="h-3 w-3 text-yellow-500 shrink-0" />
					<h4 className="text-sm font-medium truncate">{component.name}</h4>
					<Badge variant="outline" className="text-xs shrink-0">
						{CATEGORY_LABELS[component.category]}
					</Badge>
				</div>
				<p className="text-xs text-muted-foreground line-clamp-1">
					{component.description}
				</p>
			</div>
			{onInsert && (
				<Button
					variant="ghost"
					size="sm"
					onClick={() => onInsert(component)}
					className="shrink-0"
				>
					Insert
				</Button>
			)}
		</div>
	);
}

/**
 * Format intent type for display
 */
function formatIntent(intent: string): string {
	const intentLabels: Record<string, string> = {
		"create-page": "Creating a new page",
		"add-form": "Adding a form",
		"show-data": "Displaying data",
		"user-profile": "User profile/account",
		"e-commerce": "E-commerce features",
		dashboard: "Dashboard/analytics",
		chat: "Chat/messaging",
		other: "General",
	};

	return intentLabels[intent] || intent;
}

/**
 * Inline suggestions (compact version)
 */
interface InlineSuggestionsProps {
	context: string;
	onInsert?: (component: ComponentItem) => void;
	limit?: number;
}

export function InlineSuggestions({
	context,
	onInsert,
	limit = 3,
}: InlineSuggestionsProps) {
	const suggestions = useMemo(
		() => (context ? getSmartSuggestions(context, limit) : []),
		[context, limit]
	);

	if (suggestions.length === 0) {
		return null;
	}

	return (
		<div className="flex items-center gap-2">
			<SparklesIcon className="h-4 w-4 text-primary shrink-0" />
			<span className="text-sm text-muted-foreground">Suggested:</span>
			<div className="flex gap-2 overflow-x-auto">
				{suggestions.map((component) => (
					<Button
						key={component.id}
						variant="outline"
						size="sm"
						onClick={() => onInsert?.(component)}
						className="whitespace-nowrap"
					>
						{component.name}
					</Button>
				))}
			</div>
		</div>
	);
}
