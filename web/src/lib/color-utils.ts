/**
 * Color Utilities for ONE Platform Design System
 *
 * Comprehensive color conversion, validation, and manipulation utilities
 * for the 6-token design system (background, foreground, font, primary, secondary, tertiary).
 *
 * Key Features:
 * - Color format conversion (HEX ↔ HSL ↔ RGB)
 * - WCAG contrast validation (AA/AAA compliance)
 * - Color manipulation (lighten, darken, variants)
 * - Color scheme validation
 * - Brand presets (Stripe, Shopify, GitHub, Tailwind)
 */

import type { ColorTokens } from "@/lib/ontology/types";

// ============================================================================
// Color Conversion
// ============================================================================

/**
 * Convert HEX color to HSL format (without hsl() wrapper)
 * @param hex - HEX color string (e.g., "#1a73e8" or "1a73e8")
 * @returns HSL string in format "H S% L%" (e.g., "216 55% 25%")
 */
export function hexToHsl(hex: string): string {
	// Remove # if present
	hex = hex.replace("#", "");

	// Parse RGB values
	const r = Number.parseInt(hex.substring(0, 2), 16) / 255;
	const g = Number.parseInt(hex.substring(2, 4), 16) / 255;
	const b = Number.parseInt(hex.substring(4, 6), 16) / 255;

	return rgbToHsl(r, g, b);
}

/**
 * Convert HSL color to HEX format
 * @param hsl - HSL string in format "H S% L%" (e.g., "216 55% 25%")
 * @returns HEX color string (e.g., "#1a73e8")
 */
export function hslToHex(hsl: string): string {
	// Parse HSL values
	const parts = hsl.split(/\s+/);
	const h = Number.parseFloat(parts[0]);
	const s = Number.parseFloat(parts[1].replace("%", "")) / 100;
	const l = Number.parseFloat(parts[2].replace("%", "")) / 100;

	// Convert HSL to RGB
	const c = (1 - Math.abs(2 * l - 1)) * s;
	const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
	const m = l - c / 2;

	let r = 0;
	let g = 0;
	let b = 0;

	if (h >= 0 && h < 60) {
		r = c;
		g = x;
		b = 0;
	} else if (h >= 60 && h < 120) {
		r = x;
		g = c;
		b = 0;
	} else if (h >= 120 && h < 180) {
		r = 0;
		g = c;
		b = x;
	} else if (h >= 180 && h < 240) {
		r = 0;
		g = x;
		b = c;
	} else if (h >= 240 && h < 300) {
		r = x;
		g = 0;
		b = c;
	} else {
		r = c;
		g = 0;
		b = x;
	}

	// Convert to 0-255 range and format as HEX
	const rHex = Math.round((r + m) * 255)
		.toString(16)
		.padStart(2, "0");
	const gHex = Math.round((g + m) * 255)
		.toString(16)
		.padStart(2, "0");
	const bHex = Math.round((b + m) * 255)
		.toString(16)
		.padStart(2, "0");

	return `#${rHex}${gHex}${bHex}`;
}

/**
 * Convert RGB color to HSL format (without hsl() wrapper)
 * @param r - Red component (0-1)
 * @param g - Green component (0-1)
 * @param b - Blue component (0-1)
 * @returns HSL string in format "H S% L%" (e.g., "216 55% 25%")
 */
export function rgbToHsl(r: number, g: number, b: number): string {
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const l = (max + min) / 2;

	let h = 0;
	let s = 0;

	if (max !== min) {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

		switch (max) {
			case r:
				h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
				break;
			case g:
				h = ((b - r) / d + 2) / 6;
				break;
			case b:
				h = ((r - g) / d + 4) / 6;
				break;
		}
	}

	// Format as "H S% L%"
	const hue = Math.round(h * 360);
	const saturation = Math.round(s * 100);
	const lightness = Math.round(l * 100);

	return `${hue} ${saturation}% ${lightness}%`;
}

// ============================================================================
// WCAG Contrast Validation
// ============================================================================

/**
 * Calculate relative luminance of a color
 * @param r - Red component (0-1)
 * @param g - Green component (0-1)
 * @param b - Blue component (0-1)
 * @returns Relative luminance (0-1)
 */
function getRelativeLuminance(r: number, g: number, b: number): number {
	// Convert to linear RGB
	const rsRGB = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
	const gsRGB = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
	const bsRGB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

	// Calculate luminance
	return 0.2126 * rsRGB + 0.7152 * gsRGB + 0.0722 * bsRGB;
}

/**
 * Convert HSL color to RGB components (0-1 range)
 * @param hsl - HSL string in format "H S% L%"
 * @returns Object with r, g, b components (0-1)
 */
function hslToRgb(hsl: string): { r: number; g: number; b: number } {
	const parts = hsl.split(/\s+/);
	const h = Number.parseFloat(parts[0]) / 360;
	const s = Number.parseFloat(parts[1].replace("%", "")) / 100;
	const l = Number.parseFloat(parts[2].replace("%", "")) / 100;

	let r: number;
	let g: number;
	let b: number;

	if (s === 0) {
		r = g = b = l; // Achromatic
	} else {
		const hue2rgb = (p: number, q: number, t: number) => {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1 / 6) return p + (q - p) * 6 * t;
			if (t < 1 / 2) return q;
			if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
			return p;
		};

		const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		const p = 2 * l - q;

		r = hue2rgb(p, q, h + 1 / 3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1 / 3);
	}

	return { r, g, b };
}

/**
 * Check contrast ratio between two colors
 * @param foreground - Foreground color (HSL format "H S% L%")
 * @param background - Background color (HSL format "H S% L%")
 * @returns Contrast ratio (1-21)
 */
export function checkContrast(foreground: string, background: string): number {
	const fg = hslToRgb(foreground);
	const bg = hslToRgb(background);

	const fgLuminance = getRelativeLuminance(fg.r, fg.g, fg.b);
	const bgLuminance = getRelativeLuminance(bg.r, bg.g, bg.b);

	const lighter = Math.max(fgLuminance, bgLuminance);
	const darker = Math.min(fgLuminance, bgLuminance);

	return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if color combination meets WCAG AA standards
 * @param foreground - Foreground color (HSL format)
 * @param background - Background color (HSL format)
 * @returns true if contrast ratio >= 4.5:1
 */
export function meetsWCAG_AA(foreground: string, background: string): boolean {
	return checkContrast(foreground, background) >= 4.5;
}

/**
 * Check if color combination meets WCAG AAA standards
 * @param foreground - Foreground color (HSL format)
 * @param background - Background color (HSL format)
 * @returns true if contrast ratio >= 7:1
 */
export function meetsWCAG_AAA(
	foreground: string,
	background: string,
): boolean {
	return checkContrast(foreground, background) >= 7.0;
}

// ============================================================================
// Color Manipulation
// ============================================================================

/**
 * Lighten a color by adjusting its lightness
 * @param hsl - HSL color string "H S% L%"
 * @param amount - Amount to lighten (0-100)
 * @returns Lightened HSL color string
 */
export function lighten(hsl: string, amount: number): string {
	const parts = hsl.split(/\s+/);
	const h = Number.parseFloat(parts[0]);
	const s = Number.parseFloat(parts[1].replace("%", ""));
	const l = Number.parseFloat(parts[2].replace("%", ""));

	const newL = Math.min(100, l + amount);

	return `${h} ${s}% ${newL}%`;
}

/**
 * Darken a color by adjusting its lightness
 * @param hsl - HSL color string "H S% L%"
 * @param amount - Amount to darken (0-100)
 * @returns Darkened HSL color string
 */
export function darken(hsl: string, amount: number): string {
	const parts = hsl.split(/\s+/);
	const h = Number.parseFloat(parts[0]);
	const s = Number.parseFloat(parts[1].replace("%", ""));
	const l = Number.parseFloat(parts[2].replace("%", ""));

	const newL = Math.max(0, l - amount);

	return `${h} ${s}% ${newL}%`;
}

/**
 * Generate light and dark variants of a color
 * @param color - HSL color string "H S% L%"
 * @returns Object with light and dark variants
 */
export function generateVariants(color: string): {
	light: string;
	dark: string;
} {
	return {
		light: lighten(color, 10),
		dark: darken(color, 10),
	};
}

// ============================================================================
// Color Scheme Validation
// ============================================================================

export interface ColorValidationResult {
	valid: boolean;
	errors: string[];
	warnings: string[];
}

/**
 * Validate a complete color scheme for WCAG compliance and design system rules
 * @param colors - ColorTokens object to validate
 * @returns Validation result with errors and warnings
 */
export function validateColorScheme(
	colors: ColorTokens,
): ColorValidationResult {
	const errors: string[] = [];
	const warnings: string[] = [];

	// Validate format
	const hslRegex = /^\d+\s+\d+%\s+\d+%$/;
	for (const [key, value] of Object.entries(colors)) {
		if (!hslRegex.test(value)) {
			errors.push(
				`${key}: Invalid HSL format "${value}". Expected "H S% L%" (e.g., "216 55% 25%")`,
			);
		}
	}

	// If format is invalid, return early (don't check contrast on malformed colors)
	if (errors.length > 0) {
		return {
			valid: false,
			errors,
			warnings,
		};
	}

	// Validate contrast ratios (font must be readable on all surfaces)
	const fontOnForeground = checkContrast(colors.font, colors.foreground);
	if (fontOnForeground < 4.5) {
		errors.push(
			`font on foreground: Contrast ratio ${fontOnForeground.toFixed(2)}:1 is below WCAG AA (4.5:1)`,
		);
	}

	const fontOnBackground = checkContrast(colors.font, colors.background);
	if (fontOnBackground < 3.0) {
		warnings.push(
			`font on background: Contrast ratio ${fontOnBackground.toFixed(2)}:1 is below recommended 3:1`,
		);
	}

	// Validate button colors (primary, secondary, tertiary should be visible on foreground)
	const primaryOnForeground = checkContrast(colors.primary, colors.foreground);
	if (primaryOnForeground < 3.0) {
		warnings.push(
			`primary on foreground: Contrast ratio ${primaryOnForeground.toFixed(2)}:1 may be too low for buttons`,
		);
	}

	const secondaryOnForeground = checkContrast(
		colors.secondary,
		colors.foreground,
	);
	if (secondaryOnForeground < 3.0) {
		warnings.push(
			`secondary on foreground: Contrast ratio ${secondaryOnForeground.toFixed(2)}:1 may be too low for buttons`,
		);
	}

	const tertiaryOnForeground = checkContrast(
		colors.tertiary,
		colors.foreground,
	);
	if (tertiaryOnForeground < 3.0) {
		warnings.push(
			`tertiary on foreground: Contrast ratio ${tertiaryOnForeground.toFixed(2)}:1 may be too low for buttons`,
		);
	}

	// Check if background and foreground are identical (which would be problematic)
	// Note: Low contrast between background/foreground is intentional in frame+content pattern
	// Background is the outer frame, foreground is the inner content area
	const backgroundForegroundContrast = checkContrast(
		colors.background,
		colors.foreground,
	);
	if (backgroundForegroundContrast < 1.05) {
		errors.push(
			`background and foreground: Colors are identical or nearly identical (${backgroundForegroundContrast.toFixed(2)}:1 contrast)`,
		);
	} else if (backgroundForegroundContrast < 1.3) {
		warnings.push(
			`background and foreground: Colors are very similar (${backgroundForegroundContrast.toFixed(2)}:1 contrast). This is OK for frame+content patterns.`,
		);
	}

	return {
		valid: errors.length === 0,
		errors,
		warnings,
	};
}

// ============================================================================
// Color Presets
// ============================================================================

/**
 * Pre-configured color schemes from popular brands
 * All colors validated for WCAG AA compliance
 */
export const colorPresets: Record<string, ColorTokens> = {
	/**
	 * Platform Default (Blue theme)
	 * Modern blue palette with excellent contrast
	 */
	platform: {
		background: "0 0% 93%", // Light gray card surface
		foreground: "0 0% 100%", // White content area
		font: "0 0% 13%", // Dark text
		primary: "216 55% 25%", // Deep blue
		secondary: "219 14% 28%", // Gray-blue
		tertiary: "105 22% 25%", // Forest green
	},

	/**
	 * Stripe-inspired color scheme
	 * Professional blue with subtle grays
	 */
	stripe: {
		background: "220 14% 96%", // Light gray surface
		foreground: "0 0% 100%", // White content
		font: "220 39% 11%", // Deep charcoal
		primary: "229 84% 55%", // Stripe blue
		secondary: "220 14% 40%", // Gray
		tertiary: "151 55% 42%", // Stripe green
	},

	/**
	 * Shopify-inspired color scheme
	 * Bold green with professional contrast
	 */
	shopify: {
		background: "152 20% 95%", // Mint surface
		foreground: "0 0% 100%", // White content
		font: "0 0% 13%", // Dark text
		primary: "152 60% 40%", // Shopify green
		secondary: "210 30% 50%", // Slate blue
		tertiary: "340 80% 50%", // Accent red
	},

	/**
	 * GitHub-inspired color scheme
	 * Clean, minimal, developer-focused
	 */
	github: {
		background: "210 15% 96%", // Light gray
		foreground: "0 0% 100%", // White
		font: "210 12% 16%", // Almost black
		primary: "212 100% 48%", // GitHub blue
		secondary: "210 12% 45%", // Gray
		tertiary: "137 55% 40%", // Success green
	},

	/**
	 * Tailwind-inspired color scheme
	 * Vibrant cyan with modern feel
	 */
	tailwind: {
		background: "186 20% 95%", // Light cyan
		foreground: "0 0% 100%", // White
		font: "210 24% 16%", // Dark slate
		primary: "198 93% 60%", // Tailwind cyan
		secondary: "217 91% 60%", // Blue
		tertiary: "162 63% 41%", // Teal
	},

	/**
	 * Purple theme
	 * Bold purple for creative brands
	 */
	purple: {
		background: "270 50% 92%", // Light purple
		foreground: "270 50% 98%", // Very light purple
		font: "270 50% 15%", // Dark purple
		primary: "280 100% 60%", // Vibrant purple
		secondary: "200 100% 50%", // Blue
		tertiary: "150 80% 40%", // Green
	},

	/**
	 * Orange theme
	 * Warm, energetic palette
	 */
	orange: {
		background: "30 50% 92%", // Light orange
		foreground: "30 50% 98%", // Very light orange
		font: "30 50% 15%", // Dark orange-brown
		primary: "25 100% 55%", // Vibrant orange
		secondary: "45 100% 50%", // Yellow-orange
		tertiary: "340 80% 50%", // Red accent
	},

	/**
	 * Monochrome theme
	 * Grayscale for minimal brands
	 */
	monochrome: {
		background: "0 0% 93%", // Light gray
		foreground: "0 0% 100%", // White
		font: "0 0% 13%", // Dark gray
		primary: "0 0% 25%", // Charcoal
		secondary: "0 0% 40%", // Medium gray
		tertiary: "0 0% 60%", // Light gray
	},

	/**
	 * Dark mode example
	 * Inverted colors for dark themes
	 */
	dark: {
		background: "0 0% 10%", // Dark gray surface
		foreground: "0 0% 13%", // Darker content
		font: "0 0% 100%", // White text
		primary: "216 55% 25%", // Blue (same as platform)
		secondary: "219 14% 28%", // Gray-blue
		tertiary: "105 22% 25%", // Green
	},
};

/**
 * Get default platform colors
 * @returns Default ColorTokens for the platform
 */
export function getDefaultColors(): ColorTokens {
	return colorPresets.platform;
}

/**
 * Get a color preset by name
 * @param name - Preset name (platform, stripe, shopify, github, tailwind, purple, orange, monochrome, dark)
 * @returns ColorTokens for the preset, or default if not found
 */
export function getColorPreset(name: string): ColorTokens {
	return colorPresets[name] || getDefaultColors();
}
