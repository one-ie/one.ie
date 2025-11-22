/**
 * ThingCard Component
 *
 * Universal wrapper for Thing entities that supports thing-level color overrides.
 * Uses the 6-color design system with optional per-thing branding.
 *
 * @example Basic usage (platform defaults)
 * ```tsx
 * <ThingCard thing={product}>
 *   <CardHeader>
 *     <CardTitle>{product.name}</CardTitle>
 *   </CardHeader>
 *   <CardContent>
 *     <p>{product.properties.description}</p>
 *   </CardContent>
 * </ThingCard>
 * ```
 *
 * @example With custom colors
 * ```tsx
 * // Thing with colors defined in properties.colors
 * const customThing = {
 *   _id: '1',
 *   name: 'Custom Product',
 *   properties: {
 *     colors: {
 *       background: '270 50% 92%',
 *       foreground: '270 50% 98%',
 *       font: '270 50% 15%',
 *       primary: '280 100% 60%',
 *       secondary: '200 100% 50%',
 *       tertiary: '150 80% 40%'
 *     }
 *   }
 * };
 *
 * <ThingCard thing={customThing}>
 *   <CardHeader>
 *     <CardTitle>Custom Branded Product</CardTitle>
 *   </CardHeader>
 * </ThingCard>
 * ```
 */

import { Card } from '@/components/ui/card';
import { useThingColors } from '@/hooks/useThingColors';
import type { Thing } from '@/lib/ontology/types';

export interface ThingCardProps {
	/** Thing entity with optional colors in properties */
	thing: Thing;
	/** Child elements to render inside the card */
	children?: React.ReactNode;
	/** Show action buttons (View, Edit, Delete) */
	showActions?: boolean;
	/** Additional CSS classes */
	className?: string;
	/** Additional inline styles */
	style?: React.CSSProperties;
}

/**
 * ThingCard - Universal card wrapper with thing-level branding
 *
 * Automatically applies thing colors or falls back to platform defaults.
 * All child components inherit the 6-color design system via CSS variables.
 */
export function ThingCard({
	thing,
	children,
	className,
	style,
}: ThingCardProps) {
	const thingColors = useThingColors(thing);

	// Merge thing colors with any additional styles
	const mergedStyles = {
		...thingColors,
		...style,
	};

	return (
		<Card
			style={mergedStyles}
			className={className}
			data-thing-id={thing._id}
			data-thing-type={thing.type}
		>
			{children}
		</Card>
	);
}
