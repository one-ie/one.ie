"use client";

import type { CollectionEntry } from "astro:content";
import {
	AlertCircle,
	ArrowRight,
	CheckCircle2,
	Clock,
	Zap,
} from "lucide-react";
import type React from "react";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

type Feature = CollectionEntry<"features">;

interface FeatureCardProps {
	feature: Feature;
	showCategory?: boolean;
	className?: string;
}

const statusIcons = {
	completed: CheckCircle2,
	beta: Zap,
	in_development: Clock,
	planned: AlertCircle,
	deprecated: AlertCircle,
} as const;

const statusColors = {
	completed: "bg-green-100 text-green-700 border-green-200",
	beta: "bg-blue-100 text-blue-700 border-blue-200",
	in_development: "bg-yellow-100 text-yellow-700 border-yellow-200",
	planned: "bg-gray-100 text-gray-700 border-gray-200",
	deprecated: "bg-red-100 text-red-700 border-red-200",
} as const;

const statusHoverColors = {
	completed: "hover:border-green-200 hover:shadow-lg hover:shadow-green-500/5",
	beta: "hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5",
	in_development:
		"hover:border-yellow-200 hover:shadow-lg hover:shadow-yellow-500/5",
	planned: "hover:border-gray-300 hover:shadow-lg",
	deprecated: "hover:border-red-300 hover:shadow-lg",
} as const;

const categoryColors = {
	authentication: "bg-purple-50 text-purple-700 border-purple-200",
	ecommerce: "bg-blue-50 text-blue-700 border-blue-200",
	"ai-agents": "bg-pink-50 text-pink-700 border-pink-200",
	protocols: "bg-indigo-50 text-indigo-700 border-indigo-200",
	payments: "bg-emerald-50 text-emerald-700 border-emerald-200",
	analytics: "bg-cyan-50 text-cyan-700 border-cyan-200",
	content: "bg-orange-50 text-orange-700 border-orange-200",
	communication: "bg-rose-50 text-rose-700 border-rose-200",
	infrastructure: "bg-slate-50 text-slate-700 border-slate-200",
	integrations: "bg-lime-50 text-lime-700 border-lime-200",
	"developer-tools": "bg-amber-50 text-amber-700 border-amber-200",
	other: "bg-gray-50 text-gray-700 border-gray-200",
} as const;

/**
 * FeatureCard Component
 * Renders a feature in a card format with status, category, and description.
 * Used on the features index page and in feature lists.
 */
export function FeatureCard({
	feature,
	showCategory = true,
	className = "",
}: FeatureCardProps): React.ReactElement {
	const status = feature.data.status as keyof typeof statusColors;
	const hoverClass = statusHoverColors[status] || statusHoverColors.planned;
	const category = feature.data.category as
		| keyof typeof categoryColors
		| undefined;
	const categoryClass = category
		? categoryColors[category] || categoryColors.other
		: null;

	const displayStatus =
		status.replace("-", " ").charAt(0).toUpperCase() +
		status.replace("-", " ").slice(1);

	return (
		<a
			href={`/features/${feature.slug}`}
			className={`block transition-all ${className}`}
		>
			<Card
				className={`group border-border/50 bg-card/50 backdrop-blur transition-all hover:scale-[1.02] hover:bg-card h-full ${hoverClass}`}
			>
				<CardHeader className="space-y-4">
					<div className="flex items-start justify-between gap-2 flex-wrap">
						<Badge
							variant="secondary"
							className={`capitalize ${statusColors[status]}`}
						>
							{displayStatus}
						</Badge>
						{showCategory && categoryClass && (
							<Badge
								variant="outline"
								className={`capitalize text-xs ${categoryClass}`}
							>
								{feature.data.category?.replace("-", " ")}
							</Badge>
						)}
					</div>
					<div className="space-y-2">
						<CardTitle className="text-xl line-clamp-2">
							{feature.data.title}
						</CardTitle>
						<CardDescription className="leading-relaxed line-clamp-2">
							{feature.data.description}
						</CardDescription>
					</div>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{feature.data.features && feature.data.features.length > 0 && (
							<div className="text-sm text-muted-foreground">
								<strong>{feature.data.features.length}</strong> capabilities
							</div>
						)}
						{feature.data.version && (
							<div className="text-sm text-muted-foreground">
								v{feature.data.version}
							</div>
						)}
						{feature.data.releaseDate && (
							<div className="text-sm text-muted-foreground">
								Released:{" "}
								{new Date(feature.data.releaseDate).toLocaleDateString(
									"en-US",
									{ month: "short", year: "numeric" },
								)}
							</div>
						)}
						{feature.data.plannedDate && !feature.data.releaseDate && (
							<div className="text-sm text-muted-foreground">
								Planned:{" "}
								{new Date(feature.data.plannedDate).toLocaleDateString(
									"en-US",
									{ month: "short", year: "numeric" },
								)}
							</div>
						)}
						<a
							href={`/features/${feature.slug}`}
							className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
						>
							{status === "in_development" ? "View Progress" : "View Details"}
							<ArrowRight className="h-3 w-3" />
						</a>
					</div>
				</CardContent>
			</Card>
		</a>
	);
}
