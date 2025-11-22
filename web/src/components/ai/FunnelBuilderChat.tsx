/**
 * Funnel Builder Chat Component
 *
 * Specialized ChatClientV2 for conversational funnel creation.
 * Guides users through:
 * - Understanding their goals
 * - Selecting templates
 * - Customizing design
 * - Building pages
 * - Publishing funnels
 *
 * Part of Cycle 43: Conversational Funnel Creation Flow
 */

import { ChatClientV2 } from "@/components/ai/ChatClientV2";
import {
	FUNNEL_BUILDER_SYSTEM_PROMPT,
	FUNNEL_SUGGESTIONS,
} from "@/lib/ai/funnel-prompts";
import { funnelBuilderTools } from "@/lib/ai/funnel-tools";

interface FunnelBuilderChatProps {
	/**
	 * Initial funnel ID if editing existing funnel
	 */
	funnelId?: string;

	/**
	 * Callback when funnel is created
	 */
	onFunnelCreated?: (funnelId: string) => void;

	/**
	 * Callback when funnel is published
	 */
	onFunnelPublished?: (funnelId: string, url: string) => void;
}

/**
 * Funnel-specific suggestion groups
 */
const FUNNEL_SUGGESTION_GROUPS = [
	{
		label: "Popular Funnels",
		highlight: "Popular",
		items: [
			"I want to sell an online course - help me create a high-converting funnel",
			"Create a webinar funnel for my $2,000 coaching program",
			"Build a lead magnet funnel to grow my email list with a free guide",
			"Set up a product launch funnel for my new book with pre-orders",
			"Design a simple sales page for my $47 template pack",
		],
	},
	{
		label: "E-commerce",
		highlight: "E-commerce",
		items: [
			"Create a product launch funnel with countdown timer and early bird pricing",
			"Build a cart abandonment recovery funnel",
			"Design an upsell funnel for my Shopify store",
			"Set up a subscription box funnel with recurring payments",
			"Create a flash sale funnel with limited-time offers",
		],
	},
	{
		label: "Lead Generation",
		highlight: "Lead Gen",
		items: [
			"Build a lead magnet funnel with free checklist download",
			"Create a consultation booking funnel for my agency",
			"Design a free trial funnel for my SaaS product",
			"Set up a quiz funnel to segment my audience",
			"Build a challenge registration funnel",
		],
	},
	{
		label: "Events & Webinars",
		highlight: "Events",
		items: [
			"Create a webinar registration funnel with automated reminders",
			"Build a virtual summit funnel with multiple speakers",
			"Design a workshop registration and replay funnel",
			"Set up a masterclass funnel with limited seating",
			"Create a live event registration with early bird tickets",
		],
	},
	{
		label: "Memberships",
		highlight: "Memberships",
		items: [
			"Build a membership funnel with 14-day free trial",
			"Create a course platform funnel with drip content",
			"Design a community funnel with tiered pricing",
			"Set up a SaaS onboarding funnel",
			"Build a subscription funnel with annual discount",
		],
	},
	{
		label: "Advanced",
		highlight: "Advanced",
		items: [
			"Create an application funnel for high-ticket coaching",
			"Build a product launch with pre-launch, launch, and evergreen phases",
			"Design an affiliate recruitment funnel",
			"Set up a certification program funnel",
			"Create a franchise or licensing funnel",
		],
	},
];

export function FunnelBuilderChat({
	funnelId,
	onFunnelCreated,
	onFunnelPublished,
}: FunnelBuilderChatProps) {
	// Customize system prompt based on context
	const systemPrompt = funnelId
		? `${FUNNEL_BUILDER_SYSTEM_PROMPT}\n\nYou are currently editing funnel ID: ${funnelId}. Help the user make improvements and optimizations.`
		: FUNNEL_BUILDER_SYSTEM_PROMPT;

	return (
		<ChatClientV2
			systemPrompt={systemPrompt}
			suggestionGroups={FUNNEL_SUGGESTION_GROUPS}
			// TODO: Wire up tools when backend is ready
			// tools={funnelBuilderTools}
			// onToolCall={(toolName, args) => {
			//   if (toolName === 'create_funnel') {
			//     onFunnelCreated?.(args.result.funnelId);
			//   } else if (toolName === 'publish_funnel') {
			//     onFunnelPublished?.(args.funnelId, args.result.url);
			//   }
			// }}
		/>
	);
}
