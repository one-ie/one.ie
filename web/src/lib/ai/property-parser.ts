/**
 * Property Parser - Natural Language to CSS Properties
 *
 * Cycle 49: Conversational Property Editing
 *
 * Parses natural language input like "make it bigger" and maps to CSS property changes.
 */

// ============================================================================
// COLOR PARSING
// ============================================================================

const colorMap: Record<string, string> = {
	// Basic colors
	red: "#ef4444",
	blue: "#3b82f6",
	green: "#10b981",
	yellow: "#eab308",
	orange: "#f97316",
	purple: "#a855f7",
	pink: "#ec4899",
	gray: "#6b7280",
	black: "#000000",
	white: "#ffffff",

	// Extended colors
	"dark red": "#dc2626",
	"light blue": "#60a5fa",
	"dark green": "#059669",
	"light green": "#34d399",
	"dark gray": "#374151",
	"light gray": "#d1d5db",
	gold: "#fbbf24",
	silver: "#9ca3af",
	bronze: "#92400e",

	// Brand colors
	primary: "#3b82f6",
	secondary: "#6b7280",
	accent: "#f59e0b",
	success: "#10b981",
	warning: "#f59e0b",
	error: "#ef4444",
	info: "#3b82f6",
};

export interface ColorParseResult {
	color: string;
	confidence: number;
	source: "exact" | "similar" | "hex" | "rgb" | "fallback";
}

/**
 * Parse color from natural language
 *
 * @example
 * parseColor("green") → { color: "#10b981", confidence: 1.0, source: "exact" }
 * parseColor("make it blue") → { color: "#3b82f6", confidence: 0.9, source: "exact" }
 * parseColor("#ff0000") → { color: "#ff0000", confidence: 1.0, source: "hex" }
 */
export function parseColor(input: string): ColorParseResult {
	const normalized = input.toLowerCase().trim();

	// Direct hex color
	const hexMatch = normalized.match(/#([a-f0-9]{6}|[a-f0-9]{3})/i);
	if (hexMatch) {
		return {
			color: hexMatch[0],
			confidence: 1.0,
			source: "hex",
		};
	}

	// RGB color
	const rgbMatch = normalized.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
	if (rgbMatch) {
		const r = Number.parseInt(rgbMatch[1]);
		const g = Number.parseInt(rgbMatch[2]);
		const b = Number.parseInt(rgbMatch[3]);
		const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
		return {
			color: hex,
			confidence: 1.0,
			source: "rgb",
		};
	}

	// Named color (exact match)
	for (const [name, hex] of Object.entries(colorMap)) {
		if (normalized.includes(name)) {
			return {
				color: hex,
				confidence: 1.0,
				source: "exact",
			};
		}
	}

	// Fallback: gray
	return {
		color: colorMap.gray,
		confidence: 0.3,
		source: "fallback",
	};
}

// ============================================================================
// SIZE PARSING
// ============================================================================

export interface SizeParseResult {
	size: number;
	unit: "px" | "rem" | "em" | "%";
	change: "absolute" | "relative";
	confidence: number;
}

/**
 * Parse size from natural language
 *
 * @example
 * parseSize("bigger", 16) → { size: 24, unit: "px", change: "relative", confidence: 0.9 }
 * parseSize("48px") → { size: 48, unit: "px", change: "absolute", confidence: 1.0 }
 * parseSize("double", 16) → { size: 32, unit: "px", change: "relative", confidence: 1.0 }
 */
export function parseSize(input: string, currentSize = 16): SizeParseResult {
	const normalized = input.toLowerCase().trim();

	// Absolute size with unit
	const absoluteMatch = normalized.match(/(\d+(?:\.\d+)?)(px|rem|em|%)/);
	if (absoluteMatch) {
		const value = Number.parseFloat(absoluteMatch[1]);
		const unit = absoluteMatch[2] as "px" | "rem" | "em" | "%";
		return {
			size: value,
			unit,
			change: "absolute",
			confidence: 1.0,
		};
	}

	// Relative size keywords
	const relativeMap: Record<string, number> = {
		"much bigger": 2.0,
		"way bigger": 2.0,
		bigger: 1.5,
		larger: 1.5,
		"a bit bigger": 1.25,
		"slightly bigger": 1.25,
		double: 2.0,
		triple: 3.0,
		"much smaller": 0.5,
		"way smaller": 0.5,
		smaller: 0.75,
		"a bit smaller": 0.85,
		"slightly smaller": 0.85,
		half: 0.5,
		tiny: 0.5,
		huge: 2.5,
		massive: 3.0,
		enormous: 3.5,
	};

	for (const [keyword, multiplier] of Object.entries(relativeMap)) {
		if (normalized.includes(keyword)) {
			return {
				size: Math.round(currentSize * multiplier),
				unit: "px",
				change: "relative",
				confidence: 0.9,
			};
		}
	}

	// Fallback: slightly bigger
	return {
		size: Math.round(currentSize * 1.25),
		unit: "px",
		change: "relative",
		confidence: 0.5,
	};
}

// ============================================================================
// SPACING PARSING
// ============================================================================

export interface SpacingParseResult {
	spacing: number;
	property: "margin" | "padding" | "gap";
	direction?: "top" | "right" | "bottom" | "left" | "all";
	confidence: number;
}

/**
 * Parse spacing from natural language
 *
 * @example
 * parseSpacing("more space above", 16) → { spacing: 32, property: "margin", direction: "top", confidence: 0.9 }
 * parseSpacing("add padding", 8) → { spacing: 16, property: "padding", direction: "all", confidence: 0.8 }
 */
export function parseSpacing(input: string, currentSpacing = 16): SpacingParseResult {
	const normalized = input.toLowerCase().trim();

	// Detect property
	let property: "margin" | "padding" | "gap" = "margin";
	if (normalized.includes("padding") || normalized.includes("inner space")) {
		property = "padding";
	} else if (normalized.includes("gap") || normalized.includes("between")) {
		property = "gap";
	}

	// Detect direction
	let direction: "top" | "right" | "bottom" | "left" | "all" = "all";
	if (normalized.includes("above") || normalized.includes("top")) {
		direction = "top";
	} else if (normalized.includes("below") || normalized.includes("bottom")) {
		direction = "bottom";
	} else if (normalized.includes("left")) {
		direction = "left";
	} else if (normalized.includes("right")) {
		direction = "right";
	}

	// Detect amount
	let multiplier = 1.5; // Default: 50% more
	if (normalized.includes("more") || normalized.includes("add")) {
		multiplier = 2.0;
	} else if (normalized.includes("less") || normalized.includes("reduce")) {
		multiplier = 0.5;
	} else if (normalized.includes("double")) {
		multiplier = 2.0;
	} else if (normalized.includes("remove") || normalized.includes("no space")) {
		multiplier = 0;
	}

	return {
		spacing: Math.round(currentSpacing * multiplier),
		property,
		direction,
		confidence: 0.85,
	};
}

// ============================================================================
// FONT PARSING
// ============================================================================

export interface FontParseResult {
	fontFamily?: string;
	fontSize?: number;
	fontWeight?: number;
	lineHeight?: number;
	confidence: number;
}

const fontMap: Record<string, string> = {
	apple: "system-ui, -apple-system, sans-serif",
	"san francisco": "system-ui, -apple-system, sans-serif",
	inter: "Inter, sans-serif",
	roboto: "Roboto, sans-serif",
	"open sans": "Open Sans, sans-serif",
	lato: "Lato, sans-serif",
	montserrat: "Montserrat, sans-serif",
	poppins: "Poppins, sans-serif",
	serif: "Georgia, serif",
	georgia: "Georgia, serif",
	"times new roman": "Times New Roman, serif",
	mono: "Monaco, monospace",
	monospace: "Monaco, monospace",
	code: "Monaco, monospace",
};

/**
 * Parse font from natural language
 *
 * @example
 * parseFont("like Apple's website") → { fontFamily: "system-ui, -apple-system, sans-serif", confidence: 0.9 }
 * parseFont("bold") → { fontWeight: 700, confidence: 1.0 }
 */
export function parseFont(input: string): FontParseResult {
	const normalized = input.toLowerCase().trim();
	const result: FontParseResult = { confidence: 0.7 };

	// Font family
	for (const [name, family] of Object.entries(fontMap)) {
		if (normalized.includes(name)) {
			result.fontFamily = family;
			result.confidence = 0.9;
		}
	}

	// Font weight
	if (normalized.includes("bold") || normalized.includes("bolder")) {
		result.fontWeight = 700;
		result.confidence = 1.0;
	} else if (normalized.includes("light") || normalized.includes("thin")) {
		result.fontWeight = 300;
		result.confidence = 1.0;
	} else if (normalized.includes("normal") || normalized.includes("regular")) {
		result.fontWeight = 400;
		result.confidence = 1.0;
	}

	// Line height (for readability)
	if (normalized.includes("line spacing") || normalized.includes("line height")) {
		if (normalized.includes("more") || normalized.includes("increase")) {
			result.lineHeight = 1.75;
		} else if (normalized.includes("less") || normalized.includes("decrease")) {
			result.lineHeight = 1.25;
		}
		result.confidence = 0.85;
	}

	return result;
}

// ============================================================================
// CONTRAST PARSING
// ============================================================================

export interface ContrastParseResult {
	action: "increase" | "decrease" | "fix";
	backgroundAdjustment?: number;
	foregroundAdjustment?: number;
	confidence: number;
}

/**
 * Parse contrast adjustment from natural language
 *
 * @example
 * parseContrast("text is hard to read") → { action: "increase", confidence: 0.9 }
 * parseContrast("better contrast") → { action: "fix", confidence: 0.8 }
 */
export function parseContrast(input: string): ContrastParseResult {
	const normalized = input.toLowerCase().trim();

	if (
		normalized.includes("hard to read") ||
		normalized.includes("can't see") ||
		normalized.includes("difficult to read")
	) {
		return {
			action: "increase",
			backgroundAdjustment: 20, // Lighten background 20%
			foregroundAdjustment: -20, // Darken foreground 20%
			confidence: 0.9,
		};
	}

	if (normalized.includes("better contrast") || normalized.includes("improve contrast")) {
		return {
			action: "fix",
			confidence: 0.8,
		};
	}

	return {
		action: "increase",
		confidence: 0.5,
	};
}

// ============================================================================
// MULTI-PROPERTY PARSING
// ============================================================================

export interface PropertyChanges {
	color?: string;
	backgroundColor?: string;
	fontSize?: number;
	fontFamily?: string;
	fontWeight?: number;
	lineHeight?: number;
	marginTop?: number;
	marginBottom?: number;
	marginLeft?: number;
	marginRight?: number;
	paddingTop?: number;
	paddingBottom?: number;
	paddingLeft?: number;
	paddingRight?: number;
	confidence: number;
}

/**
 * Parse multiple property changes from natural language
 *
 * @example
 * parsePropertyChanges("Make the text bigger and blue", { fontSize: 16 })
 * → { fontSize: 24, color: "#3b82f6", confidence: 0.9 }
 */
export function parsePropertyChanges(
	input: string,
	currentProperties: Partial<PropertyChanges> = {},
): PropertyChanges {
	const changes: PropertyChanges = { confidence: 0.7 };
	const normalized = input.toLowerCase().trim();

	// Color changes
	const colorResult = parseColor(input);
	if (colorResult.confidence > 0.7) {
		if (
			normalized.includes("background") ||
			normalized.includes("bg") ||
			normalized.includes("fill")
		) {
			changes.backgroundColor = colorResult.color;
		} else {
			changes.color = colorResult.color;
		}
		changes.confidence = Math.max(changes.confidence, colorResult.confidence);
	}

	// Size changes
	if (
		normalized.includes("bigger") ||
		normalized.includes("smaller") ||
		normalized.includes("size")
	) {
		const sizeResult = parseSize(input, currentProperties.fontSize);
		changes.fontSize = sizeResult.size;
		changes.confidence = Math.max(changes.confidence, sizeResult.confidence);
	}

	// Font changes
	const fontResult = parseFont(input);
	if (fontResult.fontFamily) {
		changes.fontFamily = fontResult.fontFamily;
		changes.confidence = Math.max(changes.confidence, fontResult.confidence);
	}
	if (fontResult.fontWeight) {
		changes.fontWeight = fontResult.fontWeight;
	}
	if (fontResult.lineHeight) {
		changes.lineHeight = fontResult.lineHeight;
	}

	// Spacing changes
	if (normalized.includes("space") || normalized.includes("margin") || normalized.includes("padding")) {
		const spacingResult = parseSpacing(
			input,
			currentProperties.marginTop || currentProperties.paddingTop || 16,
		);

		if (spacingResult.property === "margin") {
			if (spacingResult.direction === "top" || spacingResult.direction === "all") {
				changes.marginTop = spacingResult.spacing;
			}
			if (spacingResult.direction === "bottom" || spacingResult.direction === "all") {
				changes.marginBottom = spacingResult.spacing;
			}
		} else if (spacingResult.property === "padding") {
			if (spacingResult.direction === "top" || spacingResult.direction === "all") {
				changes.paddingTop = spacingResult.spacing;
			}
			if (spacingResult.direction === "bottom" || spacingResult.direction === "all") {
				changes.paddingBottom = spacingResult.spacing;
			}
		}

		changes.confidence = Math.max(changes.confidence, spacingResult.confidence);
	}

	return changes;
}

// ============================================================================
// STYLE PRESET PARSING
// ============================================================================

export interface StylePreset {
	name: string;
	changes: PropertyChanges;
	description: string;
}

const stylePresets: StylePreset[] = [
	{
		name: "apple",
		description: "Minimal, clean design like Apple's website",
		changes: {
			fontFamily: "system-ui, -apple-system, sans-serif",
			fontSize: 17,
			lineHeight: 1.5,
			color: "#1d1d1f",
			backgroundColor: "#ffffff",
			marginTop: 32,
			marginBottom: 32,
			confidence: 1.0,
		},
	},
	{
		name: "stripe",
		description: "Professional, modern design like Stripe",
		changes: {
			fontFamily: "Inter, sans-serif",
			fontSize: 16,
			lineHeight: 1.6,
			color: "#0a2540",
			backgroundColor: "#ffffff",
			confidence: 1.0,
		},
	},
	{
		name: "minimalist",
		description: "Extremely minimal with lots of whitespace",
		changes: {
			fontFamily: "system-ui, sans-serif",
			fontSize: 18,
			lineHeight: 1.8,
			color: "#000000",
			backgroundColor: "#ffffff",
			marginTop: 48,
			marginBottom: 48,
			paddingTop: 32,
			paddingBottom: 32,
			confidence: 1.0,
		},
	},
	{
		name: "bold",
		description: "High contrast, bold design",
		changes: {
			fontFamily: "Montserrat, sans-serif",
			fontSize: 20,
			fontWeight: 700,
			lineHeight: 1.4,
			color: "#000000",
			backgroundColor: "#ffffff",
			confidence: 1.0,
		},
	},
];

/**
 * Parse style preset from natural language
 *
 * @example
 * parseStylePreset("make it look like Apple's website")
 * → { name: "apple", changes: {...}, description: "..." }
 */
export function parseStylePreset(input: string): StylePreset | null {
	const normalized = input.toLowerCase().trim();

	for (const preset of stylePresets) {
		if (normalized.includes(preset.name)) {
			return preset;
		}
	}

	// Check for preset keywords
	if (normalized.includes("minimal") || normalized.includes("whitespace")) {
		return stylePresets.find((p) => p.name === "minimalist") || null;
	}

	if (normalized.includes("professional") || normalized.includes("modern")) {
		return stylePresets.find((p) => p.name === "stripe") || null;
	}

	if (normalized.includes("bold") || normalized.includes("strong")) {
		return stylePresets.find((p) => p.name === "bold") || null;
	}

	return null;
}
