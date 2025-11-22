/**
 * TrendingBadge - Badge indicating trending template
 *
 * Shows when a template has high recent usage (3+ uses in last 7 days)
 *
 * Part of Cycle 58: Template Usage Statistics
 * @see /one/things/plans/clickfunnels-builder-100-cycles.md
 */

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TrendingBadgeProps {
	/**
	 * Number of times used in last 7 days
	 */
	recentUsage: number;
	/**
	 * Threshold for "trending" status (default: 3)
	 */
	threshold?: number;
	/**
	 * Size variant
	 */
	size?: "sm" | "md" | "lg";
	/**
	 * Additional CSS classes
	 */
	className?: string;
}

export function TrendingBadge({
	recentUsage,
	threshold = 3,
	size = "md",
	className,
}: TrendingBadgeProps) {
	// Not trending if below threshold
	if (recentUsage < threshold) {
		return null;
	}

	const sizeClasses = {
		sm: "text-xs px-2 py-0.5",
		md: "text-sm px-2.5 py-0.5",
		lg: "text-base px-3 py-1",
	};

	return (
		<Badge
			className={cn(
				"bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold shadow-sm",
				"hover:from-orange-600 hover:to-pink-600 transition-all",
				"animate-pulse",
				sizeClasses[size],
				className
			)}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="12"
				height="12"
				viewBox="0 0 24 24"
				fill="currentColor"
				className="mr-1"
			>
				<path d="M13 10h5l-6-6-6 6h5v10h2V10z" />
			</svg>
			Trending
		</Badge>
	);
}
