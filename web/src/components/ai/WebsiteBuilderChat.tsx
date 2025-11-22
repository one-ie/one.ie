"use client";

import { useCallback, useState, useEffect } from "react";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import { Code2, FileCode, Sparkles, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import {
	Conversation,
	ConversationContent,
	ConversationScrollButton,
} from "@/components/ai/elements/conversation";
import {
	Message,
	MessageBranch,
	MessageBranchContent,
	MessageContent,
	MessageResponse,
} from "@/components/ai/elements/message";
import {
	PromptInput,
	PromptInputBody,
	PromptInputFooter,
	type PromptInputMessage,
	PromptInputSubmit,
	PromptInputTextarea,
	PromptInputTools,
} from "@/components/ai/elements/prompt-input";
import {
	Reasoning,
	ReasoningContent,
	ReasoningTrigger,
} from "@/components/ai/elements/reasoning";
import { Suggestion, Suggestions } from "@/components/ai/elements/suggestion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";

/**
 * Tool call type from the API
 */
type ToolCall = {
	name: string;
	args: Record<string, unknown>;
	result?: string;
	state: "input-available" | "output-available" | "error";
	error?: string;
};

/**
 * Message type for the chat
 */
type MessageType = {
	key: string;
	from: "user" | "assistant";
	content: string;
	reasoning?: string;
	tools?: ToolCall[];
	timestamp: number;
};

/**
 * WebsiteBuilderChat Component
 *
 * AI-powered chat interface for building websites with Claude Code
 *
 * Features:
 * - Real-time streaming responses
 * - Thinking/reasoning display
 * - Tool call visualization (Read, Write, Edit, Bash, etc.)
 * - Code block highlighting with expandable sections
 * - "Apply Changes" functionality
 * - Conversation history
 */
export function WebsiteBuilderChat() {
	const [text, setText] = useState<string>("");
	const [status, setStatus] = useState<"ready" | "streaming" | "error">("ready");
	const [messages, setMessages] = useState<MessageType[]>([]);
	const [currentReasoning, setCurrentReasoning] = useState<string>("");
	const [currentToolCalls, setCurrentToolCalls] = useState<ToolCall[]>([]);

	const suggestions = [
		"Create a landing page with hero section",
		"Build a product showcase page",
		"Add a pricing table component",
		"Create a contact form",
		"Generate a blog post layout",
		"Build an e-commerce product page",
	];

	/**
	 * Stream response from Claude Code API
	 */
	const streamResponse = useCallback(async (userMessage: string) => {
		setStatus("streaming");
		setCurrentReasoning("");
		setCurrentToolCalls([]);

		// Create assistant message placeholder
		const assistantMessageKey = `assistant-${Date.now()}`;
		const assistantMessage: MessageType = {
			key: assistantMessageKey,
			from: "assistant",
			content: "",
			timestamp: Date.now(),
		};

		setMessages((prev) => [...prev, assistantMessage]);

		try {
			const response = await fetch("/api/chat-claude-code", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					messages: [
						...messages.map((m) => ({
							role: m.from === "user" ? "user" : "assistant",
							content: m.content,
						})),
						{ role: "user", content: userMessage },
					],
					model: "sonnet",
				}),
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const reader = response.body?.getReader();
			const decoder = new TextDecoder();

			if (!reader) {
				throw new Error("No response body");
			}

			let buffer = "";

			while (true) {
				const { done, value } = await reader.read();

				if (done) break;

				buffer += decoder.decode(value, { stream: true });
				const lines = buffer.split("\n");
				buffer = lines.pop() || "";

				for (const line of lines) {
					if (!line.trim() || line === "data: [DONE]") continue;
					if (!line.startsWith("data: ")) continue;

					try {
						const data = JSON.parse(line.slice(6));

						// Handle text delta
						if (data.choices?.[0]?.delta?.content) {
							const contentDelta = data.choices[0].delta.content;
							setMessages((prev) =>
								prev.map((msg) =>
									msg.key === assistantMessageKey
										? { ...msg, content: msg.content + contentDelta }
										: msg,
								),
							);
						}

						// Handle reasoning delta
						if (data.choices?.[0]?.delta?.reasoning) {
							const reasoningDelta = data.choices[0].delta.reasoning;
							setCurrentReasoning((prev) => prev + reasoningDelta);
						}

						// Handle tool calls
						if (data.type === "tool_call") {
							const toolCall: ToolCall = {
								name: data.payload.name,
								args: data.payload.args,
								state: data.payload.state,
							};
							setCurrentToolCalls((prev) => [...prev, toolCall]);
						}

						// Handle tool results
						if (data.type === "tool_result") {
							setCurrentToolCalls((prev) =>
								prev.map((tool) =>
									tool.name === data.payload.name
										? { ...tool, result: data.payload.result, state: "output-available" }
										: tool,
								),
							);
						}
					} catch (e) {
						console.error("Failed to parse SSE data:", e);
					}
				}
			}

			// Update final message with reasoning and tools
			setMessages((prev) =>
				prev.map((msg) =>
					msg.key === assistantMessageKey
						? {
								...msg,
								reasoning: currentReasoning || undefined,
								tools: currentToolCalls.length > 0 ? currentToolCalls : undefined,
						  }
						: msg,
				),
			);

			setStatus("ready");
			setCurrentReasoning("");
			setCurrentToolCalls([]);
		} catch (error) {
			console.error("Streaming error:", error);
			setStatus("error");
			toast.error("Failed to get response", {
				description: error instanceof Error ? error.message : "Unknown error",
			});
		}
	}, [messages, currentReasoning, currentToolCalls]);

	/**
	 * Handle message submission
	 */
	const handleSubmit = useCallback(
		(message: PromptInputMessage) => {
			const hasText = Boolean(message.text?.trim());

			if (!hasText) {
				return;
			}

			// Add user message
			const userMessage: MessageType = {
				key: `user-${Date.now()}`,
				from: "user",
				content: message.text || "",
				timestamp: Date.now(),
			};

			setMessages((prev) => [...prev, userMessage]);
			setText("");

			// Stream assistant response
			streamResponse(message.text || "");
		},
		[streamResponse],
	);

	/**
	 * Handle suggestion click
	 */
	const handleSuggestionClick = useCallback(
		(suggestion: string) => {
			handleSubmit({ text: suggestion });
		},
		[handleSubmit],
	);

	return (
		<div className="relative flex size-full flex-col divide-y overflow-hidden">
			{/* Chat messages */}
			<Conversation>
				<ConversationContent>
					{messages.map((message) => (
						<MessageBranch defaultBranch={0} key={message.key}>
							<MessageBranchContent>
								<Message from={message.from}>
									<div className="space-y-4">
										{/* Reasoning section */}
										{message.reasoning && (
											<Reasoning duration={0}>
												<ReasoningTrigger />
												<ReasoningContent>{message.reasoning}</ReasoningContent>
											</Reasoning>
										)}

										{/* Tool calls section */}
										{message.tools && message.tools.length > 0 && (
											<div className="space-y-2">
												{message.tools.map((tool, idx) => (
													<ToolCallCard key={idx} tool={tool} />
												))}
											</div>
										)}

										{/* Message content */}
										<MessageContent>
											<MessageResponse>{message.content}</MessageResponse>
										</MessageContent>

										{/* Apply changes button for code generation */}
										{message.from === "assistant" && message.content.includes("```") && (
											<div className="flex gap-2 pt-2">
												<Button
													variant="default"
													size="sm"
													onClick={() => {
														toast.success("Code ready to apply", {
															description: "Review the generated code above",
														});
													}}
												>
													<CheckCircle2 className="mr-2 h-4 w-4" />
													Apply Changes
												</Button>
												<Button
													variant="outline"
													size="sm"
													onClick={() => {
														const codeBlocks = extractCodeBlocks(message.content);
														navigator.clipboard.writeText(codeBlocks.join("\n\n"));
														toast.success("Code copied to clipboard");
													}}
												>
													<FileCode className="mr-2 h-4 w-4" />
													Copy Code
												</Button>
											</div>
										)}
									</div>
								</Message>
							</MessageBranchContent>
						</MessageBranch>
					))}

					{/* Current streaming reasoning */}
					{status === "streaming" && currentReasoning && (
						<div className="px-4 py-2">
							<Card className="bg-muted/50">
								<CardHeader className="py-3">
									<CardTitle className="text-sm flex items-center gap-2">
										<Loader2 className="h-4 w-4 animate-spin" />
										Thinking...
									</CardTitle>
								</CardHeader>
								<CardContent className="py-2">
									<p className="text-sm text-muted-foreground">{currentReasoning}</p>
								</CardContent>
							</Card>
						</div>
					)}

					{/* Current tool calls */}
					{status === "streaming" && currentToolCalls.length > 0 && (
						<div className="px-4 py-2 space-y-2">
							{currentToolCalls.map((tool, idx) => (
								<ToolCallCard key={idx} tool={tool} />
							))}
						</div>
					)}
				</ConversationContent>
				<ConversationScrollButton />
			</Conversation>

			{/* Suggestions and input */}
			<div className="grid shrink-0 gap-4 pt-4">
				{messages.length === 0 && (
					<Suggestions className="px-4">
						{suggestions.map((suggestion) => (
							<Suggestion
								key={suggestion}
								onClick={() => handleSuggestionClick(suggestion)}
								suggestion={suggestion}
							/>
						))}
					</Suggestions>
				)}

				<div className="w-full px-4 pb-4">
					<PromptInput onSubmit={handleSubmit}>
						<PromptInputBody>
							<PromptInputTextarea
								onChange={(event) => setText(event.target.value)}
								value={text}
								placeholder="Describe what you want to build..."
								disabled={status === "streaming"}
							/>
						</PromptInputBody>
						<PromptInputFooter>
							<PromptInputTools>
								<div className="flex items-center gap-2">
									<Badge variant="outline" className="text-xs">
										<Sparkles className="mr-1 h-3 w-3" />
										Claude Code
									</Badge>
								</div>
							</PromptInputTools>
							<PromptInputSubmit
								disabled={!text.trim() || status === "streaming"}
								status={status === "streaming" ? "streaming" : "ready"}
							/>
						</PromptInputFooter>
					</PromptInput>
				</div>
			</div>
		</div>
	);
}

/**
 * Tool call card component
 */
function ToolCallCard({ tool }: { tool: ToolCall }) {
	const [isOpen, setIsOpen] = useState(false);

	const getToolIcon = (name: string) => {
		switch (name) {
			case "Read":
			case "Write":
			case "Edit":
				return <FileCode className="h-4 w-4" />;
			case "Bash":
				return <Code2 className="h-4 w-4" />;
			default:
				return <Sparkles className="h-4 w-4" />;
		}
	};

	const getStatusBadge = (state: ToolCall["state"]) => {
		switch (state) {
			case "input-available":
				return (
					<Badge variant="secondary" className="text-xs">
						<Loader2 className="mr-1 h-3 w-3 animate-spin" />
						Running
					</Badge>
				);
			case "output-available":
				return (
					<Badge variant="default" className="text-xs">
						<CheckCircle2 className="mr-1 h-3 w-3" />
						Complete
					</Badge>
				);
			case "error":
				return (
					<Badge variant="destructive" className="text-xs">
						<AlertCircle className="mr-1 h-3 w-3" />
						Error
					</Badge>
				);
		}
	};

	return (
		<Collapsible open={isOpen} onOpenChange={setIsOpen}>
			<Card className="bg-muted/30">
				<CardHeader className="py-3">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							{getToolIcon(tool.name)}
							<CardTitle className="text-sm font-medium">{tool.name}</CardTitle>
							{getStatusBadge(tool.state)}
						</div>
						<CollapsibleTrigger asChild>
							<Button variant="ghost" size="sm">
								{isOpen ? "Hide" : "Show"} Details
							</Button>
						</CollapsibleTrigger>
					</div>
				</CardHeader>
				<CollapsibleContent>
					<CardContent className="pt-0 space-y-3">
						<Separator />

						{/* Tool arguments */}
						<div>
							<p className="text-xs font-semibold mb-1">Arguments:</p>
							<pre className="text-xs bg-background p-2 rounded overflow-x-auto">
								{JSON.stringify(tool.args, null, 2)}
							</pre>
						</div>

						{/* Tool result */}
						{tool.result && (
							<div>
								<p className="text-xs font-semibold mb-1">Result:</p>
								<pre className="text-xs bg-background p-2 rounded overflow-x-auto max-h-[200px]">
									{tool.result}
								</pre>
							</div>
						)}

						{/* Tool error */}
						{tool.error && (
							<div>
								<p className="text-xs font-semibold mb-1 text-destructive">Error:</p>
								<pre className="text-xs bg-destructive/10 text-destructive p-2 rounded overflow-x-auto">
									{tool.error}
								</pre>
							</div>
						)}
					</CardContent>
				</CollapsibleContent>
			</Card>
		</Collapsible>
	);
}

/**
 * Extract code blocks from markdown content
 */
function extractCodeBlocks(content: string): string[] {
	const codeBlockRegex = /```[\s\S]*?```/g;
	const matches = content.match(codeBlockRegex) || [];
	return matches.map((block) => block.replace(/```\w*\n?/g, "").trim());
}
