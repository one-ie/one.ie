/**
 * TemplateCardWithStats - Template card with integrated usage statistics
 *
 * Displays a template card with:
 * - Template preview
 * - Basic info (name, description, category)
 * - Usage stats (compact view)
 * - Trending badge
 * - Action buttons
 *
 * Example usage on template gallery pages.
 *
 * Part of Cycle 58: Template Usage Statistics
 * @see /one/things/plans/clickfunnels-builder-100-cycles.md
 */

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TemplateStatsCard } from "./TemplateStatsCard";
import { TrendingBadge } from "./TrendingBadge";
import { toast } from "sonner";

interface TemplateCardWithStatsProps {
	/**
	 * Template ID
	 */
	templateId: Id<"things">;
	/**
	 * Show stats in compact mode
	 */
	compactStats?: boolean;
	/**
	 * Enable click tracking
	 */
	trackViews?: boolean;
	/**
	 * Callback when template is selected
	 */
	onSelect?: (templateId: Id<"things">) => void;
}

export function TemplateCardWithStats({
	templateId,
	compactStats = true,
	trackViews = true,
	onSelect,
}: TemplateCardWithStatsProps) {
	const [hasTrackedView, setHasTrackedView] = useState(false);

	// Fetch template data
	const template = useQuery(api.queries.funnels.get, {
		id: templateId,
	});

	// Fetch template statistics
	const stats = useQuery(api.queries.templates.getStats, {
		templateId,
	});

	// Log template view mutation
	const logViewed = useMutation(api.mutations.templates.logViewed);

	// Track view when component becomes visible
	useEffect(() => {
		if (trackViews && !hasTrackedView && template) {
			// Track view once
			logViewed({
				templateId,
				metadata: {
					source: "template_gallery",
				},
			})
				.then(() => setHasTrackedView(true))
				.catch((err) => console.error("Failed to track view:", err));
		}
	}, [trackViews, hasTrackedView, template, templateId, logViewed]);

	// Loading state
	if (template === undefined || stats === undefined) {
		return (
			<Card>
				<CardHeader>
					<Skeleton className="h-6 w-3/4" />
					<Skeleton className="h-4 w-full mt-2" />
				</CardHeader>
				<CardContent>
					<Skeleton className="h-32" />
				</CardContent>
			</Card>
		);
	}

	// Template not found
	if (!template) {
		return (
			<Card>
				<CardContent className="py-12 text-center text-sm text-muted-foreground">
					Template not found
				</CardContent>
			</Card>
		);
	}

	// Calculate recent usage for trending badge
	const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
	const recentUsage = stats?.timesUsed || 0; // Simplified - in production would check date

	// Handle template selection
	const handleSelect = () => {
		if (onSelect) {
			onSelect(templateId);
		} else {
			// Default: Navigate to template detail
			window.location.href = `/templates/${templateId}`;
		}
	};

	return (
		<Card className="group overflow-hidden transition-all hover:shadow-lg">
			<CardHeader>
				<div className="flex items-start justify-between gap-2">
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2">
							<CardTitle className="truncate text-lg">{template.name}</CardTitle>
							{recentUsage >= 3 && <TrendingBadge recentUsage={recentUsage} size="sm" />}
						</div>
						{template.properties?.description && (
							<CardDescription className="mt-1 line-clamp-2">
								{template.properties.description}
							</CardDescription>
						)}
					</div>
				</div>

				{/* Category Badge */}
				{template.properties?.category && (
					<div className="mt-2">
						<Badge variant="outline">{template.properties.category}</Badge>
					</div>
				)}
			</CardHeader>

			<CardContent className="space-y-4">
				{/* Template Preview */}
				{template.properties?.thumbnailUrl && (
					<div className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
						<img
							src={template.properties.thumbnailUrl}
							alt={template.name}
							className="h-full w-full object-cover transition-transform group-hover:scale-105"
						/>
					</div>
				)}

				{/* Usage Statistics */}
				<TemplateStatsCard stats={stats} recentUsage={recentUsage} compact={compactStats} />

				{/* Actions */}
				<div className="flex gap-2">
					<Button onClick={handleSelect} className="flex-1">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							className="mr-2"
						>
							<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
							<polyline points="10 17 15 12 10 7" />
							<line x1="15" y1="12" x2="3" y2="12" />
						</svg>
						Use Template
					</Button>
					<Button variant="outline" asChild>
						<a href={`/templates/${templateId}/stats`}>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								className="mr-2"
							>
								<path d="M3 3v18h18" />
								<path d="m19 9-5 5-4-4-3 3" />
							</svg>
							Stats
						</a>
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

/**
 * Example Usage in Template Gallery Page
 *
 * ```tsx
 * import { TemplateCardWithStats } from '@/components/features/funnels/TemplateCardWithStats';
 *
 * export function TemplateGallery() {
 *   const templates = useQuery(api.queries.templates.list);
 *
 *   return (
 *     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 *       {templates?.map(template => (
 *         <TemplateCardWithStats
 *           key={template._id}
 *           templateId={template._id}
 *           trackViews={true}
 *           onSelect={(id) => {
 *             // Handle template selection
 *             createFunnelFromTemplate(id);
 *           }}
 *         />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
