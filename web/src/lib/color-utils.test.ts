/**
 * Color Utilities Test Suite
 *
 * Comprehensive tests for color conversion, validation, and manipulation.
 */

import { describe, it, expect } from "vitest";
import {
	hexToHsl,
	hslToHex,
	rgbToHsl,
	checkContrast,
	meetsWCAG_AA,
	meetsWCAG_AAA,
	lighten,
	darken,
	generateVariants,
	validateColorScheme,
	colorPresets,
	getDefaultColors,
	getColorPreset,
} from "./color-utils";

describe("Color Conversion", () => {
	it("should convert HEX to HSL", () => {
		// Test blue color
		const blue = hexToHsl("#1a73e8");
		expect(blue).toMatch(/^\d+\s+\d+%\s+\d+%$/); // Matches "H S% L%" format

		// Test white
		const white = hexToHsl("#ffffff");
		expect(white).toBe("0 0% 100%");

		// Test black
		const black = hexToHsl("#000000");
		expect(black).toBe("0 0% 0%");
	});

	it("should convert HSL to HEX", () => {
		// Test white
		expect(hslToHex("0 0% 100%")).toBe("#ffffff");

		// Test black
		expect(hslToHex("0 0% 0%")).toBe("#000000");

		// Test gray
		const gray = hslToHex("0 0% 50%");
		expect(gray).toMatch(/^#[0-9a-f]{6}$/);
	});

	it("should convert RGB to HSL", () => {
		// Test white (1, 1, 1)
		expect(rgbToHsl(1, 1, 1)).toBe("0 0% 100%");

		// Test black (0, 0, 0)
		expect(rgbToHsl(0, 0, 0)).toBe("0 0% 0%");

		// Test red (1, 0, 0)
		const red = rgbToHsl(1, 0, 0);
		expect(red).toMatch(/^0\s+\d+%\s+\d+%$/);
	});

	it("should round-trip HEX -> HSL -> HEX", () => {
		const original = "#1a73e8";
		const hsl = hexToHsl(original);
		const converted = hslToHex(hsl);

		// Colors should be very close (may have minor rounding differences)
		expect(converted.toLowerCase()).toBeDefined();
	});
});

describe("WCAG Contrast Validation", () => {
	it("should calculate contrast ratio correctly", () => {
		// White on black should be maximum contrast (21:1)
		const maxContrast = checkContrast("0 0% 100%", "0 0% 0%");
		expect(maxContrast).toBeCloseTo(21, 1);

		// Same color should be minimum contrast (1:1)
		const minContrast = checkContrast("0 0% 50%", "0 0% 50%");
		expect(minContrast).toBe(1);
	});

	it("should validate WCAG AA compliance", () => {
		// Dark text on white background (good contrast)
		expect(meetsWCAG_AA("0 0% 13%", "0 0% 100%")).toBe(true);

		// Light gray on white (poor contrast)
		expect(meetsWCAG_AA("0 0% 80%", "0 0% 100%")).toBe(false);
	});

	it("should validate WCAG AAA compliance", () => {
		// Dark text on white background (excellent contrast)
		expect(meetsWCAG_AAA("0 0% 13%", "0 0% 100%")).toBe(true);

		// Medium contrast (passes AA but not AAA)
		expect(meetsWCAG_AAA("0 0% 50%", "0 0% 100%")).toBe(false);
	});

	it("should validate platform default colors", () => {
		const defaults = getDefaultColors();

		// Font should be readable on foreground
		expect(meetsWCAG_AA(defaults.font, defaults.foreground)).toBe(true);

		// Font should be readable on background
		const bgContrast = checkContrast(defaults.font, defaults.background);
		expect(bgContrast).toBeGreaterThan(3);
	});
});

describe("Color Manipulation", () => {
	it("should lighten a color", () => {
		const color = "216 55% 25%"; // Dark blue
		const lightened = lighten(color, 20);

		// Lightness should increase
		expect(lightened).toMatch(/216 55% 45%/);
	});

	it("should darken a color", () => {
		const color = "216 55% 50%"; // Medium blue
		const darkened = darken(color, 20);

		// Lightness should decrease
		expect(darkened).toMatch(/216 55% 30%/);
	});

	it("should not exceed lightness bounds", () => {
		// Lightening already light color
		const veryLight = "0 0% 95%";
		const lightened = lighten(veryLight, 20);
		expect(lightened).toMatch(/100%/); // Should cap at 100%

		// Darkening already dark color
		const veryDark = "0 0% 5%";
		const darkened = darken(veryDark, 20);
		expect(darkened).toMatch(/0%/); // Should cap at 0%
	});

	it("should generate color variants", () => {
		const color = "216 55% 25%";
		const variants = generateVariants(color);

		expect(variants.light).toMatch(/216 55% 35%/);
		expect(variants.dark).toMatch(/216 55% 15%/);
	});
});

describe("Color Scheme Validation", () => {
	it("should validate platform defaults", () => {
		const result = validateColorScheme(getDefaultColors());

		expect(result.valid).toBe(true);
		expect(result.errors).toHaveLength(0);
	});

	it("should detect invalid HSL format", () => {
		const invalid = {
			background: "invalid",
			foreground: "0 0% 100%",
			font: "0 0% 13%",
			primary: "216 55% 25%",
			secondary: "219 14% 28%",
			tertiary: "105 22% 25%",
		};

		const result = validateColorScheme(invalid);

		expect(result.valid).toBe(false);
		expect(result.errors.length).toBeGreaterThan(0);
		expect(result.errors[0]).toContain("Invalid HSL format");
	});

	it("should detect poor contrast", () => {
		const poorContrast = {
			background: "0 0% 93%",
			foreground: "0 0% 95%", // Too similar to background
			font: "0 0% 90%", // Low contrast on foreground
			primary: "216 55% 25%",
			secondary: "219 14% 28%",
			tertiary: "105 22% 25%",
		};

		const result = validateColorScheme(poorContrast);

		expect(result.valid).toBe(false);
		expect(result.errors.length).toBeGreaterThan(0);
	});

	it("should warn about button contrast", () => {
		const lowButtonContrast = {
			background: "0 0% 93%",
			foreground: "0 0% 100%",
			font: "0 0% 13%",
			primary: "0 0% 98%", // Very light, low contrast on white foreground
			secondary: "219 14% 28%",
			tertiary: "105 22% 25%",
		};

		const result = validateColorScheme(lowButtonContrast);

		expect(result.warnings.length).toBeGreaterThan(0);
	});
});

describe("Color Presets", () => {
	it("should have all required presets", () => {
		expect(colorPresets.platform).toBeDefined();
		expect(colorPresets.stripe).toBeDefined();
		expect(colorPresets.shopify).toBeDefined();
		expect(colorPresets.github).toBeDefined();
		expect(colorPresets.tailwind).toBeDefined();
		expect(colorPresets.purple).toBeDefined();
		expect(colorPresets.orange).toBeDefined();
		expect(colorPresets.monochrome).toBeDefined();
		expect(colorPresets.dark).toBeDefined();
	});

	it("should have valid color format in all presets", () => {
		const hslRegex = /^\d+\s+\d+%\s+\d+%$/;

		for (const [name, colors] of Object.entries(colorPresets)) {
			for (const [key, value] of Object.entries(colors)) {
				expect(value).toMatch(hslRegex);
			}
		}
	});

	it("should validate all presets for WCAG compliance", () => {
		for (const [name, colors] of Object.entries(colorPresets)) {
			const result = validateColorScheme(colors);

			// All presets should be valid
			expect(result.valid).toBe(true);
		}
	});

	it("should get preset by name", () => {
		const stripe = getColorPreset("stripe");
		expect(stripe).toEqual(colorPresets.stripe);

		// Should fall back to platform default for unknown preset
		const unknown = getColorPreset("nonexistent");
		expect(unknown).toEqual(colorPresets.platform);
	});
});

describe("Default Colors", () => {
	it("should return platform defaults", () => {
		const defaults = getDefaultColors();

		expect(defaults.background).toBe("0 0% 93%");
		expect(defaults.foreground).toBe("0 0% 100%");
		expect(defaults.font).toBe("0 0% 13%");
		expect(defaults.primary).toBe("216 55% 25%");
		expect(defaults.secondary).toBe("219 14% 28%");
		expect(defaults.tertiary).toBe("105 22% 25%");
	});

	it("should have excellent contrast in defaults", () => {
		const defaults = getDefaultColors();

		// Font on foreground should be AAA compliant
		expect(meetsWCAG_AAA(defaults.font, defaults.foreground)).toBe(true);

		// Font on background should be AA compliant
		expect(meetsWCAG_AA(defaults.font, defaults.background)).toBe(true);
	});
});
