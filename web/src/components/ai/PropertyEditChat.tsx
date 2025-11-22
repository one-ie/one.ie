/**
 * Property Edit Chat - Conversational Property Editing Interface
 *
 * Cycle 49: Conversational Property Editing
 *
 * Chat interface for editing element properties using natural language.
 */

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Send,
	Sparkles,
	Wand2,
	CheckCircle2,
	XCircle,
	Lightbulb,
	Undo,
	Redo,
	Eye,
} from "lucide-react";
import {
	editProperty,
	editMultipleProperties,
	applyStylePreset,
	suggestImprovements,
	formatChangesAsCSS,
	applyChangesToElement,
	getEditableProperties,
	type PropertyEditResult,
	type PropertyChanges,
} from "@/lib/ai/property-editor-tools";

// ============================================================================
// TYPES
// ============================================================================

interface Message {
	id: string;
	role: "user" | "assistant";
	content: string;
	result?: PropertyEditResult;
	timestamp: Date;
}

interface PropertyEditChatProps {
	/** ID of the element being edited */
	elementId: string;

	/** Reference to the actual DOM element (optional, for live preview) */
	elementRef?: React.RefObject<HTMLElement>;

	/** Current properties of the element */
	currentProperties?: Record<string, string | number>;

	/** Callback when properties are changed */
	onPropertiesChange?: (changes: PropertyChanges) => void;

	/** Show live preview */
	showPreview?: boolean;

	/** Enable undo/redo */
	enableHistory?: boolean;
}

interface HistoryEntry {
	changes: PropertyChanges;
	message: string;
	timestamp: Date;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function PropertyEditChat({
	elementId,
	elementRef,
	currentProperties = {},
	onPropertiesChange,
	showPreview = true,
	enableHistory = true,
}: PropertyEditChatProps) {
	const [messages, setMessages] = useState<Message[]>([
		{
			id: "welcome",
			role: "assistant",
			content:
				"Hi! I can help you edit this element's properties. Try saying things like:\n\n• \"Make it bigger\"\n• \"Change the color to blue\"\n• \"Add more space above\"\n• \"Make it look like Apple's website\"",
			timestamp: new Date(),
		},
	]);

	const [input, setInput] = useState("");
	const [isProcessing, setIsProcessing] = useState(false);
	const [history, setHistory] = useState<HistoryEntry[]>([]);
	const [historyIndex, setHistoryIndex] = useState(-1);
	const [previewEnabled, setPreviewEnabled] = useState(showPreview);

	const scrollRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	// Auto-scroll to bottom on new messages
	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [messages]);

	// ========================================================================
	// MESSAGE HANDLERS
	// ========================================================================

	const addMessage = (role: "user" | "assistant", content: string, result?: PropertyEditResult) => {
		const message: Message = {
			id: `msg-${Date.now()}-${Math.random()}`,
			role,
			content,
			result,
			timestamp: new Date(),
		};

		setMessages((prev) => [...prev, message]);
	};

	const handleSend = async () => {
		if (!input.trim() || isProcessing) return;

		const userMessage = input.trim();
		setInput("");
		setIsProcessing(true);

		// Add user message
		addMessage("user", userMessage);

		// Process the instruction
		try {
			const result = await processInstruction(userMessage);

			// Add assistant response
			if (result.success) {
				addMessage("assistant", result.message, result);

				// Apply changes
				if (onPropertiesChange) {
					onPropertiesChange(result.changes);
				}

				// Apply to DOM element for live preview
				if (previewEnabled && elementRef?.current) {
					applyChangesToElement(elementRef.current, result.changes);
				}

				// Add to history
				if (enableHistory) {
					const newHistory = history.slice(0, historyIndex + 1);
					newHistory.push({
						changes: result.changes,
						message: result.message,
						timestamp: new Date(),
					});
					setHistory(newHistory);
					setHistoryIndex(newHistory.length - 1);
				}

				// Show suggestions
				if (result.suggestions && result.suggestions.length > 0) {
					setTimeout(() => {
						addMessage(
							"assistant",
							`**Suggestions:**\n\n${result.suggestions!.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
						);
					}, 500);
				}
			} else {
				addMessage("assistant", `❌ ${result.message}`, result);
			}
		} catch (error) {
			addMessage(
				"assistant",
				`Error: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		} finally {
			setIsProcessing(false);
		}
	};

	const processInstruction = async (instruction: string): Promise<PropertyEditResult> => {
		const normalized = instruction.toLowerCase().trim();

		// Check for preset keywords
		if (
			normalized.includes("like apple") ||
			normalized.includes("like stripe") ||
			normalized.includes("minimalist") ||
			normalized.includes("bold style")
		) {
			return applyStylePreset({
				elementId,
				presetName: instruction,
			});
		}

		// Check for suggestions request
		if (
			normalized.includes("suggest") ||
			normalized.includes("improve") ||
			normalized.includes("what should")
		) {
			return suggestImprovements({
				elementId,
				currentProperties,
				context: determineContext(currentProperties),
			});
		}

		// Check for single property edit
		const singlePropertyMatch = normalized.match(
			/change (?:the )?(\w+) to (.+)|make (?:the )?(\w+) (.+)|set (?:the )?(\w+) to (.+)/,
		);

		if (singlePropertyMatch) {
			const propertyName =
				singlePropertyMatch[1] || singlePropertyMatch[3] || singlePropertyMatch[5];
			const value = singlePropertyMatch[2] || singlePropertyMatch[4] || singlePropertyMatch[6];

			return editProperty({
				elementId,
				propertyName,
				naturalLanguageValue: value,
				currentValue: currentProperties[propertyName]?.toString(),
			});
		}

		// Default: multi-property edit
		return editMultipleProperties({
			elementId,
			instruction,
			currentProperties,
		});
	};

	const determineContext = (properties: Record<string, string | number>): string => {
		const fontSize = properties.fontSize as number;
		const fontWeight = properties.fontWeight as number;

		if (fontSize >= 24 || fontWeight >= 700) {
			return "headline";
		}

		if (fontSize >= 16 && fontSize < 24) {
			return "body";
		}

		return "text";
	};

	// ========================================================================
	// HISTORY HANDLERS
	// ========================================================================

	const handleUndo = () => {
		if (historyIndex > 0) {
			const previousEntry = history[historyIndex - 1];
			setHistoryIndex(historyIndex - 1);

			if (onPropertiesChange) {
				onPropertiesChange(previousEntry.changes);
			}

			if (previewEnabled && elementRef?.current) {
				applyChangesToElement(elementRef.current, previousEntry.changes);
			}

			addMessage("assistant", `⏪ Undid: ${previousEntry.message}`);
		}
	};

	const handleRedo = () => {
		if (historyIndex < history.length - 1) {
			const nextEntry = history[historyIndex + 1];
			setHistoryIndex(historyIndex + 1);

			if (onPropertiesChange) {
				onPropertiesChange(nextEntry.changes);
			}

			if (previewEnabled && elementRef?.current) {
				applyChangesToElement(elementRef.current, nextEntry.changes);
			}

			addMessage("assistant", `⏩ Redid: ${nextEntry.message}`);
		}
	};

	// ========================================================================
	// QUICK ACTIONS
	// ========================================================================

	const handleQuickAction = (action: string) => {
		setInput(action);
		inputRef.current?.focus();
	};

	const quickActions = [
		{ label: "Make bigger", action: "Make it bigger" },
		{ label: "Change color", action: "Change the color to blue" },
		{ label: "Add spacing", action: "Add more space above" },
		{ label: "Apple style", action: "Make it look like Apple's website" },
		{ label: "Bold", action: "Make it bold" },
		{ label: "Suggest improvements", action: "What improvements would you suggest?" },
	];

	// ========================================================================
	// RENDER
	// ========================================================================

	return (
		<Card className="w-full max-w-2xl">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Wand2 className="h-5 w-5 text-primary" />
						<CardTitle>Property Editor</CardTitle>
					</div>

					<div className="flex items-center gap-2">
						{enableHistory && (
							<>
								<Button
									variant="ghost"
									size="sm"
									onClick={handleUndo}
									disabled={historyIndex <= 0}
								>
									<Undo className="h-4 w-4" />
								</Button>
								<Button
									variant="ghost"
									size="sm"
									onClick={handleRedo}
									disabled={historyIndex >= history.length - 1}
								>
									<Redo className="h-4 w-4" />
								</Button>
							</>
						)}

						<Button
							variant={previewEnabled ? "default" : "outline"}
							size="sm"
							onClick={() => setPreviewEnabled(!previewEnabled)}
						>
							<Eye className="h-4 w-4 mr-1" />
							Preview
						</Button>
					</div>
				</div>

				<div className="text-sm text-muted-foreground">
					Editing element: <Badge variant="outline">{elementId}</Badge>
				</div>
			</CardHeader>

			<Separator />

			<CardContent className="p-0">
				{/* Quick Actions */}
				<div className="p-4 border-b bg-muted/50">
					<div className="text-xs font-medium text-muted-foreground mb-2">Quick Actions:</div>
					<div className="flex flex-wrap gap-2">
						{quickActions.map((qa) => (
							<Button
								key={qa.label}
								variant="outline"
								size="sm"
								onClick={() => handleQuickAction(qa.action)}
								className="text-xs"
							>
								<Sparkles className="h-3 w-3 mr-1" />
								{qa.label}
							</Button>
						))}
					</div>
				</div>

				{/* Messages */}
				<ScrollArea className="h-[400px] p-4" ref={scrollRef}>
					<div className="space-y-4">
						{messages.map((message) => (
							<MessageBubble key={message.id} message={message} />
						))}

						{isProcessing && (
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<div className="flex gap-1">
									<div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
									<div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
									<div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
								</div>
								<span>Processing...</span>
							</div>
						)}
					</div>
				</ScrollArea>

				{/* Input */}
				<div className="p-4 border-t">
					<form
						onSubmit={(e) => {
							e.preventDefault();
							handleSend();
						}}
						className="flex gap-2"
					>
						<Input
							ref={inputRef}
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder="Tell me what to change..."
							disabled={isProcessing}
							className="flex-1"
						/>
						<Button type="submit" disabled={!input.trim() || isProcessing}>
							<Send className="h-4 w-4" />
						</Button>
					</form>

					<div className="mt-2 text-xs text-muted-foreground">
						Try: "make it bigger", "change color to blue", "add more space", or "like Apple's
						website"
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

// ============================================================================
// MESSAGE BUBBLE COMPONENT
// ============================================================================

function MessageBubble({ message }: { message: Message }) {
	const isUser = message.role === "user";

	return (
		<div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
			<div
				className={`max-w-[80%] rounded-lg p-3 ${
					isUser ? "bg-primary text-primary-foreground" : "bg-muted"
				}`}
			>
				{/* Message content */}
				<div className="text-sm whitespace-pre-wrap">{message.content}</div>

				{/* Result indicator */}
				{message.result && (
					<div className="mt-2 pt-2 border-t border-border/50">
						{message.result.success ? (
							<div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
								<CheckCircle2 className="h-3 w-3" />
								<span>Applied successfully</span>
							</div>
						) : (
							<div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
								<XCircle className="h-3 w-3" />
								<span>Could not apply</span>
							</div>
						)}

						{/* Show CSS changes */}
						{message.result.success && Object.keys(message.result.changes).length > 1 && (
							<details className="mt-2">
								<summary className="text-xs cursor-pointer text-muted-foreground hover:text-foreground">
									View CSS changes
								</summary>
								<pre className="mt-2 p-2 bg-background/50 rounded text-xs overflow-x-auto">
									<code>{formatChangesAsCSS(message.result.changes)}</code>
								</pre>
							</details>
						)}

						{/* Confidence indicator */}
						{message.result.changes.confidence !== undefined && (
							<div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
								<span>Confidence:</span>
								<div className="flex-1 h-1 bg-background/50 rounded-full overflow-hidden">
									<div
										className="h-full bg-primary transition-all"
										style={{ width: `${message.result.changes.confidence * 100}%` }}
									/>
								</div>
								<span>{Math.round(message.result.changes.confidence * 100)}%</span>
							</div>
						)}
					</div>
				)}

				{/* Timestamp */}
				<div className="mt-2 text-xs opacity-60">
					{message.timestamp.toLocaleTimeString([], {
						hour: "2-digit",
						minute: "2-digit",
					})}
				</div>
			</div>
		</div>
	);
}

// ============================================================================
// EXPORT
// ============================================================================

export default PropertyEditChat;
