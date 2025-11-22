/**
 * Funnel Builder AI Tools
 *
 * Tool definitions for AI to create and manage funnels conversationally.
 * These tools enable the AI to:
 * - Create funnels with proper settings
 * - Add steps to funnel sequences
 * - Customize branding and design
 * - Generate previews
 * - Publish funnels
 */

import { z } from "zod";

/**
 * Tool: Create Funnel
 * Creates a new funnel with initial settings
 */
export const createFunnelTool = {
	name: "create_funnel",
	description: "Create a new sales funnel with name, template, and initial settings",
	parameters: z.object({
		name: z.string().describe("Funnel name (e.g., 'Productivity Course Launch')"),
		template: z
			.enum([
				"product-launch",
				"webinar",
				"simple-sales",
				"lead-magnet",
				"book-launch",
				"membership",
				"summit",
			])
			.describe("Funnel template type"),
		description: z.string().optional().describe("Brief description of the funnel purpose"),
		primaryColor: z.string().optional().describe("Primary brand color (hex code)"),
		secondaryColor: z.string().optional().describe("Secondary brand color (hex code)"),
	}),
};

/**
 * Tool: Add Funnel Step
 * Adds a page to the funnel sequence
 */
export const addFunnelStepTool = {
	name: "add_funnel_step",
	description: "Add a page/step to the funnel sequence",
	parameters: z.object({
		funnelId: z.string().describe("ID of the funnel to add step to"),
		name: z.string().describe("Step name (e.g., 'Coming Soon Page')"),
		type: z
			.enum([
				"landing",
				"sales",
				"checkout",
				"thank-you",
				"webinar",
				"registration",
				"upsell",
				"downsell",
				"opt-in",
			])
			.describe("Type of page"),
		order: z.number().describe("Position in funnel sequence (1, 2, 3...)"),
		settings: z
			.object({
				headline: z.string().optional().describe("Main headline"),
				subheadline: z.string().optional().describe("Supporting subheadline"),
				ctaText: z.string().optional().describe("Call-to-action button text"),
				ctaUrl: z.string().optional().describe("Where CTA button links to"),
			})
			.optional(),
	}),
};

/**
 * Tool: Customize Funnel
 * Update funnel branding and settings
 */
export const customizeFunnelTool = {
	name: "customize_funnel",
	description: "Update funnel branding, colors, and settings",
	parameters: z.object({
		funnelId: z.string().describe("ID of the funnel to customize"),
		updates: z.object({
			name: z.string().optional().describe("Updated funnel name"),
			description: z.string().optional().describe("Updated description"),
			primaryColor: z.string().optional().describe("Primary brand color (hex)"),
			secondaryColor: z.string().optional().describe("Secondary brand color (hex)"),
			theme: z.enum(["light", "dark", "auto"]).optional().describe("Color theme"),
			customDomain: z.string().optional().describe("Custom domain for funnel"),
			googleAnalyticsId: z.string().optional().describe("Google Analytics tracking ID"),
			facebookPixelId: z.string().optional().describe("Facebook Pixel ID"),
		}),
	}),
};

/**
 * Tool: Preview Funnel
 * Generate preview of funnel flow and pages
 */
export const previewFunnelTool = {
	name: "preview_funnel",
	description: "Generate a preview of the complete funnel flow",
	parameters: z.object({
		funnelId: z.string().describe("ID of the funnel to preview"),
		includeAnalytics: z
			.boolean()
			.optional()
			.describe("Include projected conversion analytics"),
	}),
};

/**
 * Tool: Publish Funnel
 * Make funnel live and accessible
 */
export const publishFunnelTool = {
	name: "publish_funnel",
	description: "Publish funnel and make it live",
	parameters: z.object({
		funnelId: z.string().describe("ID of the funnel to publish"),
		enableTracking: z.boolean().optional().describe("Enable analytics tracking"),
		enableStripe: z.boolean().optional().describe("Enable Stripe payments"),
	}),
};

/**
 * Tool: Get Template Info
 * Get detailed information about a funnel template
 */
export const getTemplateInfoTool = {
	name: "get_template_info",
	description: "Get detailed information about a specific funnel template",
	parameters: z.object({
		template: z
			.enum([
				"product-launch",
				"webinar",
				"simple-sales",
				"lead-magnet",
				"book-launch",
				"membership",
				"summit",
			])
			.describe("Template to get info about"),
	}),
};

/**
 * All funnel builder tools
 */
export const funnelBuilderTools = [
	createFunnelTool,
	addFunnelStepTool,
	customizeFunnelTool,
	previewFunnelTool,
	publishFunnelTool,
	getTemplateInfoTool,
];

/**
 * Tool execution handlers (to be implemented)
 * These would connect to actual Convex mutations
 */
export const funnelToolHandlers = {
	create_funnel: async (args: any) => {
		// TODO: Call Convex mutation to create funnel
		return {
			success: true,
			funnelId: "temp_" + Date.now(),
			message: `Created funnel: ${args.name}`,
			url: `/funnels/temp_${Date.now()}`,
		};
	},

	add_funnel_step: async (args: any) => {
		// TODO: Call Convex mutation to add step
		return {
			success: true,
			stepId: "step_" + Date.now(),
			message: `Added step: ${args.name}`,
		};
	},

	customize_funnel: async (args: any) => {
		// TODO: Call Convex mutation to update funnel
		return {
			success: true,
			message: "Funnel customization updated",
		};
	},

	preview_funnel: async (args: any) => {
		// TODO: Generate funnel preview
		return {
			success: true,
			steps: [
				{ name: "Step 1", url: "/preview/step-1" },
				{ name: "Step 2", url: "/preview/step-2" },
			],
			estimatedConversion: "8-12%",
		};
	},

	publish_funnel: async (args: any) => {
		// TODO: Publish funnel
		return {
			success: true,
			url: `https://example.com/funnel-${args.funnelId}`,
			message: "Funnel is now live!",
		};
	},

	get_template_info: async (args: any) => {
		// TODO: Return template details
		const { FUNNEL_TEMPLATES } = await import("./funnel-prompts");
		return {
			success: true,
			template: FUNNEL_TEMPLATES[args.template as keyof typeof FUNNEL_TEMPLATES],
		};
	},
};
