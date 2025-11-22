/**
 * Page Builder Chat API
 *
 * Handles conversational page building with AI.
 */

import type { APIRoute } from "astro";
import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import {
	PAGE_BUILDER_SYSTEM_PROMPT,
	formatPageContext,
} from "@/lib/ai/page-builder-prompts";
import { PAGE_BUILDER_TOOLS } from "@/components/ai/tools/PageBuilderTools";

const openai = createOpenAI({
	apiKey: import.meta.env.OPENAI_API_KEY,
});

export const POST: APIRoute = async ({ request }) => {
	try {
		const { messages, context } = await request.json();

		// Format current page context
		let systemPrompt = PAGE_BUILDER_SYSTEM_PROMPT;

		if (context) {
			const elementSummaries = context.step.elements.map((el: any) => ({
				id: el.id,
				type: el.type,
				summary: getElementSummary(el),
			}));

			const pageContext = formatPageContext(
				context.step.name,
				context.step.type,
				elementSummaries
			);

			systemPrompt += `\n\n${pageContext}`;
		}

		// Stream AI response with tool support
		const result = await streamText({
			model: openai("gpt-4o-mini"),
			system: systemPrompt,
			messages,
			tools: PAGE_BUILDER_TOOLS,
			maxTokens: 1000,
			temperature: 0.7,
		});

		return result.toDataStreamResponse();
	} catch (error) {
		console.error("Page builder chat error:", error);
		return new Response(
			JSON.stringify({
				error: "Failed to process chat message",
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
};

/**
 * Generate human-readable summary of element
 */
function getElementSummary(element: any): string {
	switch (element.type) {
		case "headline":
			return `${element.level.toUpperCase()}: "${element.text}"`;

		case "subheadline":
			return `"${element.text}"`;

		case "text":
			return element.content.substring(0, 50) + "...";

		case "image":
			return `Image: ${element.alt || "No alt text"}`;

		case "video":
			return `Video: ${element.src}`;

		case "button":
			return `"${element.text}" (${element.action}${
				element.link ? ` → ${element.link}` : ""
			})`;

		case "form":
			return `Form with ${element.fields.length} fields: ${element.fields
				.map((f: any) => f.label)
				.join(", ")}`;

		case "countdown":
			return `Countdown to ${new Date(element.endDate).toLocaleDateString()}`;

		case "testimonial":
			return `"${element.quote.substring(0, 40)}..." - ${element.author}`;

		case "pricing-table":
			return `${element.plans.length} pricing plans`;

		case "divider":
			return `${element.style} divider`;

		case "spacer":
			return `${element.height}px spacer`;

		default:
			return `${element.type} element`;
	}
}
