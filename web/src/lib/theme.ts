/**
 * Theme Utilities - 6-Token Design System
 *
 * Provides utilities for theme management, persistence, and thing-level color overrides.
 *
 * DESIGN SYSTEM:
 * - 6 Core Tokens: background, foreground, font, primary, secondary, tertiary
 * - 3 Adaptive (change in dark mode): background, foreground, font
 * - 3 Constant (same in dark/light): primary, secondary, tertiary
 *
 * USAGE:
 * ```typescript
 * import { getTheme, setTheme, applyThingColors } from '@/lib/theme';
 *
 * // Get current theme
 * const theme = getTheme(); // 'light' | 'dark' | 'system'
 *
 * // Set theme
 * setTheme('dark');
 *
 * // Apply thing-level colors
 * applyThingColors(element, {
 *   background: '270 50% 92%',
 *   foreground: '270 50% 98%',
 *   font: '270 50% 15%',
 *   primary: '280 100% 60%',
 *   secondary: '200 100% 50%',
 *   tertiary: '150 80% 40%'
 * });
 * ```
 */

export type Theme = 'light' | 'dark' | 'system';

export interface ThingColors {
	background: string; // HSL format: "H S% L%"
	foreground: string;
	font: string;
	primary: string;
	secondary: string;
	tertiary: string;
}

/**
 * Default platform colors (from global.css)
 */
export const DEFAULT_COLORS: ThingColors = {
	background: '0 0% 93%',
	foreground: '0 0% 100%',
	font: '0 0% 13%',
	primary: '216 55% 25%',
	secondary: '219 14% 28%',
	tertiary: '105 22% 25%',
};

/**
 * Default dark mode colors (from global.css)
 */
export const DEFAULT_DARK_COLORS: ThingColors = {
	background: '0 0% 10%',
	foreground: '0 0% 13%',
	font: '0 0% 100%',
	primary: '216 55% 25%',
	secondary: '219 14% 32%',
	tertiary: '105 22% 35%',
};

/**
 * Get the current theme preference
 */
export function getTheme(): Theme {
	if (typeof window === 'undefined') return 'light';

	const stored = localStorage.getItem('theme') as Theme | null;
	if (stored) return stored;

	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Set the theme and persist to localStorage
 */
export function setTheme(theme: Theme): void {
	if (typeof window === 'undefined') return;

	localStorage.setItem('theme', theme);

	const isDark =
		theme === 'dark' ||
		(theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

	if (isDark) {
		document.documentElement.classList.add('dark');
	} else {
		document.documentElement.classList.remove('dark');
	}
}

/**
 * Toggle between light and dark theme
 */
export function toggleTheme(): void {
	const current = getTheme();
	const next = current === 'dark' ? 'light' : 'dark';
	setTheme(next);
}

/**
 * Check if dark mode is currently active
 */
export function isDarkMode(): boolean {
	if (typeof window === 'undefined') return false;
	return document.documentElement.classList.contains('dark');
}

/**
 * Apply thing-level color overrides to an element
 *
 * This allows individual things (products, courses, etc.) to have their own
 * brand colors while maintaining the same component structure.
 *
 * @param element - The element to apply colors to
 * @param colors - The 6 color tokens in HSL format
 *
 * @example
 * ```typescript
 * const card = document.querySelector('.thing-card');
 * applyThingColors(card, {
 *   background: '270 50% 92%',
 *   foreground: '270 50% 98%',
 *   font: '270 50% 15%',
 *   primary: '280 100% 60%',
 *   secondary: '200 100% 50%',
 *   tertiary: '150 80% 40%'
 * });
 * ```
 */
export function applyThingColors(
	element: HTMLElement,
	colors: Partial<ThingColors>
): void {
	const fullColors = { ...DEFAULT_COLORS, ...colors };

	element.style.setProperty('--color-background', fullColors.background);
	element.style.setProperty('--color-foreground', fullColors.foreground);
	element.style.setProperty('--color-font', fullColors.font);
	element.style.setProperty('--color-primary', fullColors.primary);
	element.style.setProperty('--color-secondary', fullColors.secondary);
	element.style.setProperty('--color-tertiary', fullColors.tertiary);
}

/**
 * Remove thing-level color overrides from an element
 */
export function removeThingColors(element: HTMLElement): void {
	element.style.removeProperty('--color-background');
	element.style.removeProperty('--color-foreground');
	element.style.removeProperty('--color-font');
	element.style.removeProperty('--color-primary');
	element.style.removeProperty('--color-secondary');
	element.style.removeProperty('--color-tertiary');
}

/**
 * Generate CSS custom properties string for thing colors
 *
 * Useful for inline styles or dynamic style injection
 *
 * @param colors - The 6 color tokens in HSL format
 * @returns CSS custom properties string
 *
 * @example
 * ```typescript
 * const style = generateColorVars({
 *   primary: '280 100% 60%',
 *   secondary: '200 100% 50%'
 * });
 * // Returns: "--color-primary: 280 100% 60%; --color-secondary: 200 100% 50%;"
 * ```
 */
export function generateColorVars(colors: Partial<ThingColors>): string {
	const entries = Object.entries(colors);
	return entries
		.map(([key, value]) => `--color-${key}: ${value}`)
		.join('; ');
}

/**
 * Convert hex color to HSL format
 *
 * @param hex - Hex color code (e.g., "#FF5733")
 * @returns HSL string in format "H S% L%"
 *
 * @example
 * ```typescript
 * hexToHSL('#FF5733'); // Returns: "9 100% 60%"
 * ```
 */
export function hexToHSL(hex: string): string {
	// Remove # if present
	hex = hex.replace(/^#/, '');

	// Convert to RGB
	const r = parseInt(hex.slice(0, 2), 16) / 255;
	const g = parseInt(hex.slice(2, 4), 16) / 255;
	const b = parseInt(hex.slice(4, 6), 16) / 255;

	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const delta = max - min;

	let h = 0;
	let s = 0;
	const l = (max + min) / 2;

	if (delta !== 0) {
		s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

		switch (max) {
			case r:
				h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
				break;
			case g:
				h = ((b - r) / delta + 2) / 6;
				break;
			case b:
				h = ((r - g) / delta + 4) / 6;
				break;
		}
	}

	return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/**
 * Listen for system theme changes
 *
 * @param callback - Function to call when system theme changes
 * @returns Cleanup function to remove listener
 *
 * @example
 * ```typescript
 * const cleanup = onSystemThemeChange((isDark) => {
 *   console.log('System theme changed to', isDark ? 'dark' : 'light');
 * });
 *
 * // Later, remove listener
 * cleanup();
 * ```
 */
export function onSystemThemeChange(callback: (isDark: boolean) => void): () => void {
	if (typeof window === 'undefined') return () => {};

	const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
	const handler = (e: MediaQueryListEvent) => callback(e.matches);

	mediaQuery.addEventListener('change', handler);

	return () => mediaQuery.removeEventListener('change', handler);
}

/**
 * Get the effective theme (resolves 'system' to 'light' or 'dark')
 */
export function getEffectiveTheme(): 'light' | 'dark' {
	const theme = getTheme();

	if (theme === 'system') {
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}

	return theme;
}
