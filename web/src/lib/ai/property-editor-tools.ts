/**
 * Property Editor Tools - AI Tools for Conversational Property Editing
 *
 * Cycle 49: Conversational Property Editing
 *
 * Defines AI tools that use the property parser to edit element properties conversationally.
 */

import { z } from "zod";
import {
	parseColor,
	parseSize,
	parseSpacing,
	parseFont,
	parseContrast,
	parsePropertyChanges,
	parseStylePreset,
	type PropertyChanges,
} from "./property-parser";

// Re-export PropertyChanges for external use
export type { PropertyChanges };

// ============================================================================
// TOOL SCHEMAS
// ============================================================================

/**
 * Edit single property tool
 */
export const editPropertySchema = z.object({
	elementId: z.string().describe("ID of the element to edit"),
	propertyName: z.string().describe("CSS property name (e.g., 'color', 'fontSize', 'margin')"),
	naturalLanguageValue: z.string().describe("Natural language description of the new value"),
	currentValue: z.string().optional().describe("Current value of the property"),
});

export type EditPropertyInput = z.infer<typeof editPropertySchema>;

/**
 * Edit multiple properties tool
 */
export const editMultiplePropertiesSchema = z.object({
	elementId: z.string().describe("ID of the element to edit"),
	instruction: z
		.string()
		.describe("Natural language instruction (e.g., 'make it bigger and blue')"),
	currentProperties: z
		.record(z.string(), z.union([z.string(), z.number()]))
		.optional()
		.describe("Current CSS properties of the element"),
});

export type EditMultiplePropertiesInput = z.infer<typeof editMultiplePropertiesSchema>;

/**
 * Apply style preset tool
 */
export const applyStylePresetSchema = z.object({
	elementId: z.string().describe("ID of the element to edit"),
	presetName: z
		.string()
		.describe(
			"Style preset name (e.g., 'apple', 'stripe', 'minimalist', 'bold') or natural language description",
		),
});

export type ApplyStylePresetInput = z.infer<typeof applyStylePresetSchema>;

/**
 * Suggest improvements tool
 */
export const suggestImprovementsSchema = z.object({
	elementId: z.string().describe("ID of the element to analyze"),
	currentProperties: z.record(z.string(), z.union([z.string(), z.number()])).describe("Current CSS properties"),
	context: z
		.string()
		.optional()
		.describe("Context about the element (e.g., 'headline', 'button', 'form')"),
});

export type SuggestImprovementsInput = z.infer<typeof suggestImprovementsSchema>;

// ============================================================================
// TOOL IMPLEMENTATIONS
// ============================================================================

export interface PropertyEditResult {
	success: boolean;
	changes: PropertyChanges;
	message: string;
	suggestions?: string[];
}

/**
 * Edit a single property using natural language
 *
 * @example
 * editProperty({
 *   elementId: "headline-1",
 *   propertyName: "color",
 *   naturalLanguageValue: "green",
 *   currentValue: "#000000"
 * })
 * → { success: true, changes: { color: "#10b981" }, message: "Changed color to green (#10b981)" }
 */
export function editProperty(input: EditPropertyInput): PropertyEditResult {
	const { propertyName, naturalLanguageValue, currentValue } = input;

	const changes: PropertyChanges = { confidence: 0.7 };
	let message = "";
	const suggestions: string[] = [];

	try {
		// Color properties
		if (propertyName === "color" || propertyName === "backgroundColor") {
			const result = parseColor(naturalLanguageValue);

			if (result.confidence > 0.5) {
				changes[propertyName] = result.color;
				changes.confidence = result.confidence;
				message = `Changed ${propertyName} to ${result.color}`;

				if (result.confidence < 0.8) {
					suggestions.push("I'm not fully confident about this color. Would you like to try a specific hex code?");
				}
			} else {
				return {
					success: false,
					changes,
					message: `I couldn't understand the color "${naturalLanguageValue}". Try: green, blue, #ff0000, or rgb(255, 0, 0)`,
				};
			}
		}

		// Size properties
		else if (propertyName === "fontSize" || propertyName === "width" || propertyName === "height") {
			const currentSize = currentValue ? Number.parseInt(currentValue as string) : 16;
			const result = parseSize(naturalLanguageValue, currentSize);

			if (result.confidence > 0.5) {
				changes.fontSize = result.size;
				changes.confidence = result.confidence;
				message = `Changed ${propertyName} from ${currentSize}${result.unit} to ${result.size}${result.unit}`;

				if (result.change === "relative") {
					suggestions.push("Also update line height?", "Would you like to adjust padding to match?");
				}
			} else {
				return {
					success: false,
					changes,
					message: `I couldn't understand the size "${naturalLanguageValue}". Try: bigger, smaller, 24px, or 1.5rem`,
				};
			}
		}

		// Font properties
		else if (propertyName === "fontFamily" || propertyName === "fontWeight" || propertyName === "lineHeight") {
			const result = parseFont(naturalLanguageValue);

			if (result.fontFamily && propertyName === "fontFamily") {
				changes.fontFamily = result.fontFamily;
				message = `Changed font to ${result.fontFamily}`;
			} else if (result.fontWeight && propertyName === "fontWeight") {
				changes.fontWeight = result.fontWeight;
				message = `Changed font weight to ${result.fontWeight}`;
			} else if (result.lineHeight && propertyName === "lineHeight") {
				changes.lineHeight = result.lineHeight;
				message = `Changed line height to ${result.lineHeight}`;
			} else {
				return {
					success: false,
					changes,
					message: `I couldn't understand the font "${naturalLanguageValue}". Try: bold, Inter, or Apple-style`,
				};
			}

			changes.confidence = result.confidence;
		}

		// Spacing properties
		else if (
			propertyName.startsWith("margin") ||
			propertyName.startsWith("padding") ||
			propertyName === "gap"
		) {
			const currentSpacing = currentValue ? Number.parseInt(currentValue as string) : 16;
			const result = parseSpacing(naturalLanguageValue, currentSpacing);

			const propertyKey = `${result.property}${result.direction ? result.direction.charAt(0).toUpperCase() + result.direction.slice(1) : ""}` as keyof PropertyChanges;

			if (result.confidence > 0.5) {
				changes[propertyKey] = result.spacing;
				changes.confidence = result.confidence;
				message = `Changed ${propertyName} from ${currentSpacing}px to ${result.spacing}px`;

				suggestions.push(
					"Would you like to update other sides to match?",
					"Should I adjust the opposite side as well?",
				);
			} else {
				return {
					success: false,
					changes,
					message: `I couldn't understand the spacing "${naturalLanguageValue}". Try: more space, less padding, or 32px`,
				};
			}
		}

		// Unknown property
		else {
			return {
				success: false,
				changes,
				message: `I don't know how to edit "${propertyName}". I can edit: color, backgroundColor, fontSize, fontFamily, fontWeight, lineHeight, margin, padding, width, height`,
			};
		}

		return {
			success: true,
			changes,
			message,
			suggestions: suggestions.length > 0 ? suggestions : undefined,
		};
	} catch (error) {
		return {
			success: false,
			changes,
			message: `Error editing property: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Edit multiple properties at once using natural language
 *
 * @example
 * editMultipleProperties({
 *   elementId: "headline-1",
 *   instruction: "make it bigger and blue",
 *   currentProperties: { fontSize: 16, color: "#000000" }
 * })
 * → { success: true, changes: { fontSize: 24, color: "#3b82f6" }, message: "Updated 2 properties" }
 */
export function editMultipleProperties(input: EditMultiplePropertiesInput): PropertyEditResult {
	const { instruction, currentProperties = {} } = input;

	try {
		const changes = parsePropertyChanges(instruction, currentProperties as PropertyChanges);

		const changedProperties = Object.keys(changes).filter((key) => key !== "confidence");

		if (changedProperties.length === 0) {
			return {
				success: false,
				changes,
				message: `I couldn't understand "${instruction}". Try being more specific, like "make it bigger and blue" or "add more space above"`,
			};
		}

		const message = `Updated ${changedProperties.length} ${changedProperties.length === 1 ? "property" : "properties"}: ${changedProperties.join(", ")}`;

		const suggestions: string[] = [];

		// Suggest related changes
		if (changes.fontSize && !changes.lineHeight) {
			suggestions.push("Would you like me to adjust line height for better readability?");
		}

		if ((changes.marginTop || changes.marginBottom) && !changes.paddingTop && !changes.paddingBottom) {
			suggestions.push("Should I also adjust padding to maintain visual balance?");
		}

		if (changes.color && !changes.backgroundColor) {
			suggestions.push("Would you like me to adjust the background color for better contrast?");
		}

		return {
			success: true,
			changes,
			message,
			suggestions: suggestions.length > 0 ? suggestions : undefined,
		};
	} catch (error) {
		return {
			success: false,
			changes: { confidence: 0 },
			message: `Error editing properties: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Apply a style preset to an element
 *
 * @example
 * applyStylePreset({
 *   elementId: "headline-1",
 *   presetName: "apple"
 * })
 * → { success: true, changes: {...}, message: "Applied Apple style preset" }
 */
export function applyStylePreset(input: ApplyStylePresetInput): PropertyEditResult {
	const { presetName } = input;

	try {
		const preset = parseStylePreset(presetName);

		if (!preset) {
			return {
				success: false,
				changes: { confidence: 0 },
				message: `I don't recognize the "${presetName}" preset. Try: apple, stripe, minimalist, or bold`,
			};
		}

		return {
			success: true,
			changes: preset.changes,
			message: `Applied "${preset.name}" style preset: ${preset.description}`,
			suggestions: [
				"Would you like to adjust any specific property?",
				"Should I apply this style to other elements as well?",
			],
		};
	} catch (error) {
		return {
			success: false,
			changes: { confidence: 0 },
			message: `Error applying preset: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Suggest improvements for an element
 *
 * @example
 * suggestImprovements({
 *   elementId: "headline-1",
 *   currentProperties: { fontSize: 16, color: "#666666", lineHeight: 1.0 },
 *   context: "headline"
 * })
 * → { success: true, suggestions: [...] }
 */
export function suggestImprovements(input: SuggestImprovementsInput): PropertyEditResult {
	const { currentProperties, context } = input;

	const suggestions: string[] = [];
	const changes: PropertyChanges = { confidence: 0.9 };

	try {
		// Font size suggestions
		const fontSize = currentProperties.fontSize as number;
		if (context === "headline" && fontSize < 24) {
			suggestions.push("Headlines are usually 24px or larger for better visual hierarchy");
			changes.fontSize = 32;
		} else if (context === "body" && fontSize < 16) {
			suggestions.push("Body text should be at least 16px for readability");
			changes.fontSize = 16;
		}

		// Line height suggestions
		const lineHeight = currentProperties.lineHeight as number;
		if (!lineHeight || lineHeight < 1.4) {
			suggestions.push("Increase line height to 1.5-1.6 for better readability");
			changes.lineHeight = 1.5;
		}

		// Contrast suggestions
		const color = currentProperties.color as string;
		const backgroundColor = currentProperties.backgroundColor as string;

		if (color === "#666666" || color === "#999999") {
			suggestions.push("Consider using darker text (#000000 or #1a1a1a) for better contrast");
			changes.color = "#1a1a1a";
		}

		// Spacing suggestions
		const marginTop = currentProperties.marginTop as number;
		const marginBottom = currentProperties.marginBottom as number;

		if (context === "headline" && (!marginTop || marginTop < 24)) {
			suggestions.push("Add more space above headlines (32-48px) for visual breathing room");
			changes.marginTop = 32;
		}

		if (context === "headline" && (!marginBottom || marginBottom < 16)) {
			suggestions.push("Add space below headlines (16-24px) to separate from content");
			changes.marginBottom = 16;
		}

		// Font family suggestions
		const fontFamily = currentProperties.fontFamily as string;
		if (!fontFamily || fontFamily === "serif" || fontFamily.includes("Times")) {
			if (context === "headline") {
				suggestions.push("Consider a modern sans-serif font like Inter or system-ui for headlines");
				changes.fontFamily = "Inter, sans-serif";
			}
		}

		if (suggestions.length === 0) {
			return {
				success: true,
				changes: { confidence: 1.0 },
				message: "Your design looks good! No immediate suggestions.",
			};
		}

		return {
			success: true,
			changes,
			message: `Found ${suggestions.length} ${suggestions.length === 1 ? "suggestion" : "suggestions"}`,
			suggestions,
		};
	} catch (error) {
		return {
			success: false,
			changes: { confidence: 0 },
			message: `Error analyzing properties: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format property changes as CSS string
 */
export function formatChangesAsCSS(changes: PropertyChanges): string {
	const cssLines: string[] = [];

	for (const [key, value] of Object.entries(changes)) {
		if (key === "confidence") continue;

		// Convert camelCase to kebab-case
		const cssKey = key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

		// Add unit if needed
		let cssValue = value;
		if (typeof value === "number" && !["fontWeight", "lineHeight"].includes(key)) {
			cssValue = `${value}px`;
		}

		cssLines.push(`  ${cssKey}: ${cssValue};`);
	}

	return cssLines.join("\n");
}

/**
 * Apply changes to an element's style object
 */
export function applyChangesToElement(
	element: HTMLElement,
	changes: PropertyChanges,
): void {
	for (const [key, value] of Object.entries(changes)) {
		if (key === "confidence") continue;

		// Apply to element style
		const styleKey = key as keyof CSSStyleDeclaration;
		if (typeof value === "number") {
			(element.style as any)[styleKey] = `${value}px`;
		} else {
			(element.style as any)[styleKey] = value;
		}
	}
}

/**
 * Get all editable properties from an element
 */
export function getEditableProperties(element: HTMLElement): Record<string, string | number> {
	const computed = window.getComputedStyle(element);

	return {
		color: computed.color,
		backgroundColor: computed.backgroundColor,
		fontSize: Number.parseInt(computed.fontSize),
		fontFamily: computed.fontFamily,
		fontWeight: Number.parseInt(computed.fontWeight),
		lineHeight: Number.parseFloat(computed.lineHeight),
		marginTop: Number.parseInt(computed.marginTop),
		marginBottom: Number.parseInt(computed.marginBottom),
		marginLeft: Number.parseInt(computed.marginLeft),
		marginRight: Number.parseInt(computed.marginRight),
		paddingTop: Number.parseInt(computed.paddingTop),
		paddingBottom: Number.parseInt(computed.paddingBottom),
		paddingLeft: Number.parseInt(computed.paddingLeft),
		paddingRight: Number.parseInt(computed.paddingRight),
	};
}

// ============================================================================
// EXPORT ALL TOOLS
// ============================================================================

export const propertyEditorTools = {
	editProperty: {
		description:
			"Edit a single CSS property using natural language. Supports colors, sizes, fonts, and spacing.",
		parameters: editPropertySchema,
		execute: editProperty,
	},
	editMultipleProperties: {
		description:
			"Edit multiple CSS properties at once using a natural language instruction like 'make it bigger and blue'.",
		parameters: editMultiplePropertiesSchema,
		execute: editMultipleProperties,
	},
	applyStylePreset: {
		description:
			"Apply a complete style preset (apple, stripe, minimalist, bold) to quickly change the element's appearance.",
		parameters: applyStylePresetSchema,
		execute: applyStylePreset,
	},
	suggestImprovements: {
		description:
			"Analyze an element's current properties and suggest improvements for better design and readability.",
		parameters: suggestImprovementsSchema,
		execute: suggestImprovements,
	},
};
