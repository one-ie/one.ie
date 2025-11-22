/**
 * TemplateStatsCard - Display template usage statistics
 *
 * Shows key metrics for a template:
 * - Times used (total funnels created from template)
 * - Total conversions across all funnels
 * - Average conversion rate
 * - Recent usage (last 7 days)
 *
 * Part of Cycle 58: Template Usage Statistics
 * @see /one/things/plans/clickfunnels-builder-100-cycles.md
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { TrendingBadge } from "./TrendingBadge";

interface TemplateStats {
	templateId: string;
	timesUsed: number;
	funnelsCreated: string[];
	totalConversions: number;
	avgConversionRate: number;
	lastUsed: number;
	activeFunnels: number;
}

interface TemplateStatsCardProps {
	/**
	 * Template statistics data
	 */
	stats: TemplateStats | null | undefined;
	/**
	 * Recent usage count (for trending detection)
	 */
	recentUsage?: number;
	/**
	 * Show full details or compact view
	 */
	compact?: boolean;
	/**
	 * Additional CSS classes
	 */
	className?: string;
}

export function TemplateStatsCard({
	stats,
	recentUsage,
	compact = false,
	className,
}: TemplateStatsCardProps) {
	// Loading state
	if (stats === undefined) {
		return (
			<Card className={className}>
				<CardHeader className="pb-3">
					<Skeleton className="h-4 w-32" />
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 gap-3">
						<Skeleton className="h-16" />
						<Skeleton className="h-16" />
						<Skeleton className="h-16" />
						<Skeleton className="h-16" />
					</div>
				</CardContent>
			</Card>
		);
	}

	// No stats available
	if (!stats) {
		return (
			<Card className={className}>
				<CardContent className="py-6 text-center text-sm text-muted-foreground">
					No usage data available yet
				</CardContent>
			</Card>
		);
	}

	// Format last used date
	const formatLastUsed = (timestamp: number) => {
		const now = Date.now();
		const diff = now - timestamp;
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));

		if (days === 0) return "Today";
		if (days === 1) return "Yesterday";
		if (days < 7) return `${days} days ago`;
		if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
		if (days < 365) return `${Math.floor(days / 30)} months ago`;
		return `${Math.floor(days / 365)} years ago`;
	};

	if (compact) {
		// Compact view - single row of stats
		return (
			<div className={cn("flex items-center gap-4 text-sm", className)}>
				<div className="flex items-center gap-2">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						className="text-muted-foreground"
					>
						<path d="M3 3v18h18" />
						<path d="m19 9-5 5-4-4-3 3" />
					</svg>
					<span className="font-medium">{stats.timesUsed}</span>
					<span className="text-muted-foreground">uses</span>
				</div>
				<div className="flex items-center gap-2">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						className="text-muted-foreground"
					>
						<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
						<circle cx="9" cy="7" r="4" />
						<path d="M22 21v-2a4 4 0 0 0-3-3.87" />
						<path d="M16 3.13a4 4 0 0 1 0 7.75" />
					</svg>
					<span className="font-medium">{stats.totalConversions}</span>
					<span className="text-muted-foreground">conversions</span>
				</div>
				<div className="flex items-center gap-2">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						className="text-muted-foreground"
					>
						<circle cx="12" cy="12" r="10" />
						<polyline points="12 6 12 12 16 14" />
					</svg>
					<span className="font-medium">{stats.avgConversionRate.toFixed(1)}%</span>
					<span className="text-muted-foreground">avg rate</span>
				</div>
				{recentUsage !== undefined && recentUsage >= 3 && (
					<TrendingBadge recentUsage={recentUsage} size="sm" />
				)}
			</div>
		);
	}

	// Full card view
	return (
		<Card className={className}>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<CardTitle className="text-base">Usage Statistics</CardTitle>
					{recentUsage !== undefined && <TrendingBadge recentUsage={recentUsage} size="sm" />}
				</div>
				<CardDescription className="text-xs">
					Last used {formatLastUsed(stats.lastUsed)}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-2 gap-3">
					{/* Times Used */}
					<div className="rounded-lg bg-muted/50 p-3">
						<div className="flex items-center gap-2 text-xs text-muted-foreground">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="12"
								height="12"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path d="M3 3v18h18" />
								<path d="m19 9-5 5-4-4-3 3" />
							</svg>
							Times Used
						</div>
						<div className="mt-1 text-xl font-bold">{stats.timesUsed}</div>
						<div className="mt-0.5 text-xs text-muted-foreground">
							{stats.activeFunnels} active
						</div>
					</div>

					{/* Total Conversions */}
					<div className="rounded-lg bg-muted/50 p-3">
						<div className="flex items-center gap-2 text-xs text-muted-foreground">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="12"
								height="12"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
								<circle cx="9" cy="7" r="4" />
								<path d="M22 21v-2a4 4 0 0 0-3-3.87" />
								<path d="M16 3.13a4 4 0 0 1 0 7.75" />
							</svg>
							Conversions
						</div>
						<div className="mt-1 text-xl font-bold">{stats.totalConversions}</div>
						<div className="mt-0.5 text-xs text-muted-foreground">total sales</div>
					</div>

					{/* Average Conversion Rate */}
					<div className="rounded-lg bg-muted/50 p-3">
						<div className="flex items-center gap-2 text-xs text-muted-foreground">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="12"
								height="12"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path d="M22 12h-4l-3 9L9 3l-3 9H2" />
							</svg>
							Avg Rate
						</div>
						<div className="mt-1 text-xl font-bold">{stats.avgConversionRate.toFixed(1)}%</div>
						<div className="mt-0.5 text-xs text-muted-foreground">conversion</div>
					</div>

					{/* Funnels Created */}
					<div className="rounded-lg bg-muted/50 p-3">
						<div className="flex items-center gap-2 text-xs text-muted-foreground">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="12"
								height="12"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
							</svg>
							Funnels
						</div>
						<div className="mt-1 text-xl font-bold">{stats.funnelsCreated.length}</div>
						<div className="mt-0.5 text-xs text-muted-foreground">created</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
