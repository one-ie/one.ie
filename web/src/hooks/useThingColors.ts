/**
 * useThingColors Hook
 *
 * React hook for accessing thing-level color overrides.
 * Returns thing.colors if present, otherwise returns default platform colors.
 *
 * Integrates with color-utils.ts for comprehensive color management:
 * - Default platform colors
 * - Brand presets (Stripe, Shopify, GitHub, etc.)
 * - WCAG contrast validation
 * - Color manipulation utilities
 *
 * @example
 * ```tsx
 * import { useThingColors } from '@/hooks/useThingColors';
 *
 * export function ProductCard({ product }: { product: Thing }) {
 *   const colors = useThingColors(product);
 *
 *   return (
 *     <Card
 *       style={{
 *         '--color-background': colors.background,
 *         '--color-foreground': colors.foreground,
 *         '--color-font': colors.font,
 *         '--color-primary': colors.primary,
 *         '--color-secondary': colors.secondary,
 *         '--color-tertiary': colors.tertiary
 *       } as React.CSSProperties}
 *     >
 *       <CardContent className="bg-foreground text-font">
 *         <h3>{product.name}</h3>
 *         <Button variant="primary">Action</Button>
 *       </CardContent>
 *     </Card>
 *   );
 * }
 * ```
 */

import { useMemo } from "react";
import type { Thing, ColorTokens } from "@/lib/ontology/types";
import { getDefaultColors } from "@/lib/color-utils";

/**
 * Hook to get color tokens for a thing
 * @param thing - Thing entity (optional)
 * @returns ColorTokens (thing-level override or platform defaults)
 */
export function useThingColors(thing?: Thing | null): ColorTokens {
	const colors = useMemo(() => {
		// Return thing colors if present (uses thing.colors, not thing.properties.colors)
		if (thing?.colors) {
			return thing.colors;
		}

		// Fall back to platform defaults
		return getDefaultColors();
	}, [thing?.colors]);

	return colors;
}

/**
 * Hook to get CSS custom properties for thing colors
 * Useful for applying colors to component styles
 *
 * @param thing - Thing entity (optional)
 * @returns CSS custom properties object
 *
 * @example
 * ```tsx
 * const style = useThingColorStyles(product);
 *
 * return (
 *   <div style={style}>
 *     <p className="text-font">Uses thing colors via CSS variables</p>
 *     <Button className="bg-primary">Primary Action</Button>
 *   </div>
 * );
 * ```
 */
export function useThingColorStyles(
	thing?: Thing | null,
): React.CSSProperties {
	const colors = useThingColors(thing);

	return useMemo(
		() => ({
			"--color-background": colors.background,
			"--color-foreground": colors.foreground,
			"--color-font": colors.font,
			"--color-primary": colors.primary,
			"--color-secondary": colors.secondary,
			"--color-tertiary": colors.tertiary,
		}),
		[colors],
	) as React.CSSProperties;
}

/**
 * Hook to check if a thing has custom colors
 * @param thing - Thing entity (optional)
 * @returns true if thing has custom colors defined
 */
export function useHasCustomColors(thing?: Thing | null): boolean {
	return useMemo(() => {
		return thing?.colors !== undefined;
	}, [thing?.colors]);
}

/**
 * DEPRECATED: Use useThingColors() instead
 * Get thing colors as object (not CSS properties)
 * Useful when you need to access individual color values
 *
 * @deprecated Use useThingColors() directly - it returns ColorTokens object
 * @param thing - Thing entity with optional colors property
 * @returns ColorTokens object with all 6 color values
 */
export function getThingColors(thing?: Thing | null): ColorTokens {
	if (thing?.colors) {
		return thing.colors;
	}
	return getDefaultColors();
}

/**
 * DEPRECATED: Use useHasCustomColors() instead
 * Check if thing has custom colors
 *
 * @deprecated Use useHasCustomColors() hook for React components
 * @param thing - Thing entity
 * @returns true if thing has custom colors, false if using defaults
 */
export function hasCustomColors(thing?: Thing | null): boolean {
	return thing?.colors !== undefined;
}
