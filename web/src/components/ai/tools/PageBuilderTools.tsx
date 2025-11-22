/**
 * Page Builder AI Tools
 *
 * Function definitions that the AI can call to modify pages.
 */

import type { ElementType, PageElement } from "@/types/funnel-builder";

/**
 * Tool definitions for AI page builder
 */
export const PAGE_BUILDER_TOOLS = {
	add_element: {
		description:
			"Add a new element to the current page (headline, text, image, video, button, form, countdown, testimonial, pricing-table, divider, spacer)",
		parameters: {
			type: "object",
			properties: {
				elementType: {
					type: "string",
					enum: [
						"headline",
						"subheadline",
						"text",
						"image",
						"video",
						"button",
						"form",
						"countdown",
						"testimonial",
						"pricing-table",
						"divider",
						"spacer",
					],
					description: "Type of element to add",
				},
				properties: {
					type: "object",
					description: "Element-specific properties",
					properties: {
						// Headline/Subheadline
						text: {
							type: "string",
							description: "Text content for headline, subheadline, text, or button",
						},
						level: {
							type: "string",
							enum: ["h1", "h2", "h3"],
							description: "Heading level (for headline only)",
						},
						align: {
							type: "string",
							enum: ["left", "center", "right", "justify"],
							description: "Text alignment",
						},
						color: {
							type: "string",
							description: "Text or element color (hex or CSS color)",
						},
						fontSize: {
							type: "string",
							description: "Font size (e.g., '24px', '2rem')",
						},

						// Text
						content: {
							type: "string",
							description: "Paragraph content (for text element)",
						},

						// Image
						src: {
							type: "string",
							description: "Image or video URL",
						},
						alt: {
							type: "string",
							description: "Image alt text for accessibility",
						},
						rounded: {
							type: "boolean",
							description: "Apply rounded corners to image",
						},
						shadow: {
							type: "boolean",
							description: "Apply shadow to image",
						},

						// Video
						thumbnail: {
							type: "string",
							description: "Video thumbnail image URL",
						},
						autoplay: {
							type: "boolean",
							description: "Auto-play video",
						},
						controls: {
							type: "boolean",
							description: "Show video controls",
						},

						// Button
						action: {
							type: "string",
							enum: ["link", "scroll", "submit", "popup"],
							description: "Button action type",
						},
						link: {
							type: "string",
							description: "URL for button link action",
						},
						scrollTo: {
							type: "string",
							description: "Element ID to scroll to",
						},
						variant: {
							type: "string",
							enum: ["primary", "secondary", "outline", "ghost"],
							description: "Button style variant",
						},
						size: {
							type: "string",
							enum: ["sm", "md", "lg"],
							description: "Button size",
						},
						fullWidth: {
							type: "boolean",
							description: "Make button full width",
						},

						// Form
						fields: {
							type: "array",
							description: "Form fields configuration",
							items: {
								type: "object",
								properties: {
									type: {
										type: "string",
										enum: [
											"text",
											"email",
											"phone",
											"select",
											"checkbox",
											"textarea",
										],
									},
									label: { type: "string" },
									placeholder: { type: "string" },
									required: { type: "boolean" },
									options: {
										type: "array",
										items: { type: "string" },
									},
								},
							},
						},
						submitText: {
							type: "string",
							description: "Form submit button text",
						},
						successMessage: {
							type: "string",
							description: "Message shown after successful form submission",
						},

						// Countdown
						endDate: {
							type: "string",
							description: "Countdown end date (ISO format)",
						},
						title: {
							type: "string",
							description: "Countdown title",
						},
						urgencyText: {
							type: "string",
							description: "Urgency message for countdown",
						},

						// Testimonial
						quote: {
							type: "string",
							description: "Testimonial quote text",
						},
						author: {
							type: "string",
							description: "Testimonial author name",
						},
						role: {
							type: "string",
							description: "Author's role or title",
						},
						avatar: {
							type: "string",
							description: "Author's avatar image URL",
						},
						rating: {
							type: "number",
							description: "Star rating (1-5)",
						},

						// Pricing Table
						plans: {
							type: "array",
							description: "Pricing plans",
							items: {
								type: "object",
								properties: {
									name: { type: "string" },
									price: { type: "string" },
									period: { type: "string" },
									features: {
										type: "array",
										items: { type: "string" },
									},
									highlighted: { type: "boolean" },
									buttonText: { type: "string" },
									buttonLink: { type: "string" },
								},
							},
						},

						// Divider
						style: {
							type: "string",
							enum: ["solid", "dashed", "dotted"],
							description: "Divider line style",
						},

						// Spacer
						height: {
							type: "number",
							description: "Spacer height in pixels",
						},
					},
				},
				position: {
					type: "object",
					description: "Element position in grid (optional, defaults to bottom)",
					properties: {
						row: { type: "number", description: "Grid row (0-based)" },
						col: { type: "number", description: "Grid column (0-11)" },
						width: {
							type: "number",
							description: "Width in grid columns (1-12)",
						},
						height: {
							type: "number",
							description: "Height in grid rows",
						},
					},
				},
			},
			required: ["elementType", "properties"],
		},
	},

	update_element: {
		description: "Update properties of an existing element",
		parameters: {
			type: "object",
			properties: {
				elementId: {
					type: "string",
					description:
						"ID of element to update, or description like 'the headline that says...'",
				},
				updates: {
					type: "object",
					description: "Properties to update (same as add_element properties)",
				},
			},
			required: ["elementId", "updates"],
		},
	},

	remove_element: {
		description: "Remove an element from the page",
		parameters: {
			type: "object",
			properties: {
				elementId: {
					type: "string",
					description:
						"ID of element to remove, or description like 'the button at the bottom'",
				},
			},
			required: ["elementId"],
		},
	},

	reorder_elements: {
		description: "Change the order of elements on the page",
		parameters: {
			type: "object",
			properties: {
				elementIds: {
					type: "array",
					items: { type: "string" },
					description: "Array of element IDs in new order (top to bottom)",
				},
			},
			required: ["elementIds"],
		},
	},

	duplicate_element: {
		description: "Duplicate an existing element",
		parameters: {
			type: "object",
			properties: {
				elementId: {
					type: "string",
					description:
						"ID of element to duplicate, or description like 'the pricing table'",
				},
			},
			required: ["elementId"],
		},
	},

	get_suggestions: {
		description:
			"Get AI-powered suggestions for next elements to add based on current page state",
		parameters: {
			type: "object",
			properties: {},
		},
	},

	preview_page: {
		description: "Generate a preview of the current page state",
		parameters: {
			type: "object",
			properties: {
				device: {
					type: "string",
					enum: ["desktop", "tablet", "mobile"],
					description: "Device to preview on",
				},
			},
		},
	},
};

/**
 * Tool execution functions
 */
export interface ToolExecutor {
	add_element: (params: {
		elementType: ElementType;
		properties: Record<string, unknown>;
		position?: { row: number; col: number; width: number; height: number };
	}) => Promise<{ success: boolean; elementId: string; message: string }>;

	update_element: (params: {
		elementId: string;
		updates: Record<string, unknown>;
	}) => Promise<{ success: boolean; message: string }>;

	remove_element: (params: {
		elementId: string;
	}) => Promise<{ success: boolean; message: string }>;

	reorder_elements: (params: {
		elementIds: string[];
	}) => Promise<{ success: boolean; message: string }>;

	duplicate_element: (params: {
		elementId: string;
	}) => Promise<{ success: boolean; newElementId: string; message: string }>;

	get_suggestions: () => Promise<{
		suggestions: string[];
		tips: string[];
	}>;

	preview_page: (params: {
		device?: "desktop" | "tablet" | "mobile";
	}) => Promise<{ previewUrl: string }>;
}

/**
 * Create default element properties based on type
 */
export function createDefaultElement(
	type: ElementType,
	properties: Record<string, unknown>,
	position?: { row: number; col: number; width: number; height: number }
): Partial<PageElement> {
	const id = `${type}-${Date.now()}`;
	const defaultPosition = position || {
		row: 0,
		col: 0,
		width: 12,
		height: 1,
	};

	const baseElement = {
		id,
		type,
		position: defaultPosition,
		visible: true,
	};

	// Type-specific defaults
	switch (type) {
		case "headline":
			return {
				...baseElement,
				type: "headline",
				text: (properties.text as string) || "Your Headline Here",
				level: (properties.level as "h1" | "h2" | "h3") || "h1",
				align: (properties.align as "left" | "center" | "right") || "center",
				...properties,
			};

		case "subheadline":
			return {
				...baseElement,
				type: "subheadline",
				text: (properties.text as string) || "Your subheadline here",
				align: (properties.align as "left" | "center" | "right") || "center",
				...properties,
			};

		case "text":
			return {
				...baseElement,
				type: "text",
				content:
					(properties.content as string) ||
					"Add your paragraph content here.",
				align:
					(properties.align as "left" | "center" | "right" | "justify") ||
					"left",
				...properties,
			};

		case "button":
			return {
				...baseElement,
				type: "button",
				text: (properties.text as string) || "Click Here",
				action: (properties.action as "link" | "scroll" | "submit" | "popup") || "link",
				variant:
					(properties.variant as "primary" | "secondary" | "outline" | "ghost") ||
					"primary",
				size: (properties.size as "sm" | "md" | "lg") || "lg",
				...properties,
			};

		case "form":
			return {
				...baseElement,
				type: "form",
				fields: (properties.fields as any[]) || [
					{
						id: "email",
						type: "email",
						label: "Email",
						placeholder: "Enter your email",
						required: true,
					},
				],
				submitText: (properties.submitText as string) || "Submit",
				...properties,
			};

		case "countdown":
			return {
				...baseElement,
				type: "countdown",
				endDate:
					(properties.endDate as string) ||
					new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
				showDays: true,
				showHours: true,
				showMinutes: true,
				showSeconds: true,
				...properties,
			};

		default:
			return {
				...baseElement,
				...properties,
			} as Partial<PageElement>;
	}
}
