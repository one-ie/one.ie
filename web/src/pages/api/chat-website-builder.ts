import type { APIRoute } from "astro";
import { streamText } from "ai";
import { claudeCode } from "ai-sdk-provider-claude-code";
import {
	generateAstroPageTool,
	modifyCodeTool,
	searchComponentsTool,
} from "@/lib/ai/tools";

/**
 * Website Builder Chat API
 *
 * AI-powered website generation with Claude Code
 * Includes custom tools for code generation
 *
 * Features:
 * - generateAstroPage: Create complete pages from descriptions
 * - modifyCode: Update existing code based on requests
 * - searchComponents: Find relevant UI components
 */
export const POST: APIRoute = async ({ request }) => {
	try {
		const { messages, model = "sonnet" } = await request.json();

		if (!messages || messages.length === 0) {
			return new Response(JSON.stringify({ error: "No messages provided" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}

		// Add system prompt for website generation
		const systemPrompt = `You are an expert website builder powered by the ONE platform.

**Your Capabilities:**
1. **Generate Astro Pages** - Create complete .astro files from natural language
2. **Modify Code** - Update existing code based on user requests
3. **Search Components** - Find relevant shadcn/ui and custom components

**6-Dimension Ontology:**
- Groups: Multi-tenant containers
- People: Users with roles (platform_owner, org_owner, org_user, customer)
- Things: 66+ entity types (product, course, token, agent, etc.)
- Connections: 25+ relationship types
- Events: Complete audit trail
- Knowledge: Labels + vectors (RAG)

**Component Library:**
- shadcn/ui: 50+ pre-built components (Button, Card, Input, Dialog, etc.)
- Custom: ProductGallery, ChatClient, ThingCard, PersonCard
- Ontology: ThingCard (universal thing renderer), PersonCard, EventItem

**Templates Available:**
- /web/src/pages/shop/product-landing.astro - Full e-commerce template with Stripe
- Search templates BEFORE building from scratch

**Development Workflow:**
1. Search for existing templates/components FIRST
2. Use templates whenever possible (copy and customize)
3. Generate new pages only when no template exists
4. Use shadcn/ui components for UI primitives
5. Follow 6-dimension ontology patterns

**Golden Rules:**
- Template-first development (search before build)
- Use ThingCard for ALL thing types (not ProductCard, CourseCard, etc.)
- Use PersonCard for ALL people/users
- Scope pages by groupId for multi-tenancy
- Progressive complexity (start simple, add features incrementally)

When users ask to build pages:
1. Search templates first with searchComponents
2. If template exists, use it (just customize data)
3. If no template, use generateAstroPage
4. For modifications, use modifyCode
5. Always ask about Stripe integration for e-commerce pages`;

		const messagesWithSystem = [
			{ role: "system" as const, content: systemPrompt },
			...messages,
		];

		// Configure Claude Code model with tools
		const selectedModel = claudeCode(model);

		// Create abort controller with timeout
		const controller = new AbortController();
		const timeout = setTimeout(() => {
			console.error("[Website Builder] Timeout - aborting after 10 minutes");
			controller.abort();
		}, 10 * 60 * 1000);

		try {
			// Stream response with custom tools
			const result = await streamText({
				model: selectedModel,
				messages: messagesWithSystem,
				tools: {
					generateAstroPage: generateAstroPageTool,
					modifyCode: modifyCodeTool,
					searchComponents: searchComponentsTool,
				},
				abortSignal: controller.signal,
			});

			clearTimeout(timeout);

			// Convert to SSE stream
			const encoder = new TextEncoder();
			const stream = new ReadableStream({
				async start(controller) {
					try {
						for await (const part of result.fullStream) {
							console.log("[Website Builder] Received part:", part.type);

							// Handle different part types
							if (part.type === "text-delta") {
								const data = JSON.stringify({
									choices: [{ delta: { content: part.text } }],
								});
								controller.enqueue(encoder.encode(`data: ${data}\n\n`));
							} else if (part.type === "tool-call") {
								console.log(
									"[Website Builder] Tool call:",
									part.toolName,
									part.input,
								);
								const toolData = JSON.stringify({
									type: "tool_call",
									payload: {
										name: part.toolName,
										args: part.input,
										state: "input-available",
									},
								});
								controller.enqueue(encoder.encode(`data: ${toolData}\n\n`));
							} else if (part.type === "tool-result") {
								console.log("[Website Builder] Tool result:", part.toolName);
								const toolResultData = JSON.stringify({
									type: "tool_result",
									payload: {
										name: part.toolName,
										result: part.output,
										state: "output-available",
									},
								});
								controller.enqueue(
									encoder.encode(`data: ${toolResultData}\n\n`),
								);
							} else if (part.type === "reasoning-delta") {
								const data = JSON.stringify({
									choices: [{ delta: { reasoning: part.text } }],
								});
								controller.enqueue(encoder.encode(`data: ${data}\n\n`));
							}
						}

						// Send completion
						controller.enqueue(encoder.encode("data: [DONE]\n\n"));
						controller.close();
					} catch (error) {
						console.error("[Website Builder] Streaming error:", error);
						controller.error(error);
					}
				},
			});

			return new Response(stream, {
				headers: {
					"Content-Type": "text/event-stream",
					"Cache-Control": "no-cache",
					Connection: "keep-alive",
				},
			});
		} catch (streamError) {
			clearTimeout(timeout);
			console.error("[Website Builder] Stream creation error:", streamError);
			throw streamError;
		}
	} catch (error) {
		console.error("[Website Builder] Error:", error);

		let errorMessage = "Failed to process website builder request";
		if (error instanceof Error) {
			if (error.message.includes("auth") || error.message.includes("login")) {
				errorMessage =
					"Claude Code authentication required. Please run: claude login";
			} else if (
				error.message.includes("timeout") ||
				error.message.includes("abort")
			) {
				errorMessage =
					"Request timeout. Please try again or break down into smaller tasks.";
			} else {
				errorMessage = error.message;
			}
		}

		return new Response(JSON.stringify({ error: errorMessage }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
};
