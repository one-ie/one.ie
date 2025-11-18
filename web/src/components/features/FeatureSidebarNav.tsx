"use client";

import type { CollectionEntry } from "astro:content";
import { ArrowRight, BookOpen, Code, Users } from "lucide-react";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

type Feature = CollectionEntry<"features">;

interface FeatureSidebarNavProps {
	feature: Feature;
	allFeatures: Feature[];
	className?: string;
}

const statusColors = {
	completed: "bg-green-100 text-green-700 border-green-200",
	beta: "bg-blue-100 text-blue-700 border-blue-200",
	in_development: "bg-yellow-100 text-yellow-700 border-yellow-200",
	planned: "bg-gray-100 text-gray-700 border-gray-200",
	deprecated: "bg-red-100 text-red-700 border-red-200",
} as const;

/**
 * FeatureSidebarNav Component
 * Sidebar navigation component for feature detail pages.
 * Shows:
 * - Quick stats (status, version, complexity)
 * - Related features
 * - Documentation links
 * - On this page navigation
 */
export function FeatureSidebarNav({
	feature,
	allFeatures,
	className = "",
}: FeatureSidebarNavProps): React.ReactElement {
	const status = feature.data.status as keyof typeof statusColors;
	const displayStatus =
		status.replace("-", " ").charAt(0).toUpperCase() +
		status.replace("-", " ").slice(1);

	// Get related features
	const relatedFeatureObjects = React.useMemo(() => {
		if (
			!feature.data.relatedFeatures ||
			feature.data.relatedFeatures.length === 0
		) {
			return [];
		}

		return feature.data.relatedFeatures
			.map((relatedSlug) => allFeatures.find((f) => f.slug === relatedSlug))
			.filter((f): f is Feature => Boolean(f))
			.slice(0, 3); // Show max 3 related features
	}, [feature, allFeatures]);

	const hasDocumentation =
		feature.data.documentation &&
		Object.values(feature.data.documentation).some((v) => v);

	const onThisPageSections = React.useMemo(() => {
		const sections = [];
		if (feature.data.marketingPosition) sections.push("Marketing");
		if (feature.data.ontologyMapping) sections.push("Ontology Alignment");
		if (feature.data.features?.length) sections.push("Capabilities");
		if (feature.data.useCases?.length) sections.push("Use Cases");
		if (feature.data.examples?.length) sections.push("Code Examples");
		if (feature.data.specification) sections.push("Technical Specifications");
		if (feature.data.metrics) sections.push("Quality Metrics");
		if (relatedFeatureObjects.length > 0) sections.push("Related Features");
		return sections;
	}, [feature, relatedFeatureObjects]);

	return (
		<div className={`space-y-6 sticky top-8 ${className}`}>
			{/* Quick Stats */}
			<Card className="border-border/50 bg-card/50 backdrop-blur">
				<CardHeader className="space-y-4 pb-3">
					<CardTitle className="text-base">Quick Info</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
							Status
						</div>
						<Badge
							className={`capitalize ${statusColors[status]}`}
							variant="secondary"
						>
							{displayStatus}
						</Badge>
					</div>

					{feature.data.version && (
						<div className="space-y-2">
							<div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
								Version
							</div>
							<Badge variant="outline">v{feature.data.version}</Badge>
						</div>
					)}

					{feature.data.specification?.complexity && (
						<div className="space-y-2">
							<div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
								Complexity
							</div>
							<Badge variant="outline" className="capitalize">
								{feature.data.specification.complexity}
							</Badge>
						</div>
					)}

					{feature.data.specification?.estimatedHours && (
						<div className="space-y-2">
							<div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
								Est. Hours
							</div>
							<div className="text-sm font-semibold">
								{feature.data.specification.estimatedHours}h
							</div>
						</div>
					)}

					{feature.data.priority && (
						<div className="space-y-2">
							<div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
								Priority
							</div>
							<Badge variant="outline" className="capitalize">
								{feature.data.priority}
							</Badge>
						</div>
					)}
				</CardContent>
			</Card>

			{/* On This Page */}
			{onThisPageSections.length > 0 && (
				<Card className="border-border/50 bg-card/50 backdrop-blur">
					<CardHeader className="space-y-4 pb-3">
						<CardTitle className="text-base">On This Page</CardTitle>
					</CardHeader>
					<CardContent>
						<nav className="space-y-2">
							{onThisPageSections.map((section) => (
								<a
									key={section}
									href={`#${section.toLowerCase().replace(/\s+/g, "-")}`}
									className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-1 px-2 rounded hover:bg-muted/50"
								>
									{section}
								</a>
							))}
						</nav>
					</CardContent>
				</Card>
			)}

			{/* Documentation Links */}
			{hasDocumentation && (
				<Card className="border-border/50 bg-card/50 backdrop-blur">
					<CardHeader className="space-y-4 pb-3">
						<CardTitle className="text-base flex items-center gap-2">
							<BookOpen className="h-4 w-4" />
							Documentation
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2">
						{feature.data.documentation?.userGuide && (
							<a
								href={feature.data.documentation.userGuide}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center justify-between text-sm text-primary hover:underline py-1"
							>
								User Guide
								<ArrowRight className="h-3 w-3" />
							</a>
						)}
						{feature.data.documentation?.apiReference && (
							<a
								href={feature.data.documentation.apiReference}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center justify-between text-sm text-primary hover:underline py-1"
							>
								API Reference
								<ArrowRight className="h-3 w-3" />
							</a>
						)}
						{feature.data.documentation?.videoTutorial && (
							<a
								href={feature.data.documentation.videoTutorial}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center justify-between text-sm text-primary hover:underline py-1"
							>
								Video Tutorial
								<ArrowRight className="h-3 w-3" />
							</a>
						)}
						{feature.data.documentation?.blogPost && (
							<a
								href={feature.data.documentation.blogPost}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center justify-between text-sm text-primary hover:underline py-1"
							>
								Blog Post
								<ArrowRight className="h-3 w-3" />
							</a>
						)}
					</CardContent>
				</Card>
			)}

			{/* Related Features */}
			{relatedFeatureObjects.length > 0 && (
				<Card className="border-border/50 bg-card/50 backdrop-blur">
					<CardHeader className="space-y-4 pb-3">
						<CardTitle className="text-base flex items-center gap-2">
							<Code className="h-4 w-4" />
							Related Features
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						{relatedFeatureObjects.map((relatedFeature) => (
							<a
								key={relatedFeature.slug}
								href={`/features/${relatedFeature.slug}`}
								className="block p-3 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors border border-border/30"
							>
								<div className="text-sm font-medium leading-tight mb-1 line-clamp-2">
									{relatedFeature.data.title}
								</div>
								<div className="flex items-center gap-2">
									<Badge variant="secondary" className="capitalize text-xs h-5">
										{relatedFeature.data.status.replace("-", " ")}
									</Badge>
									<ArrowRight className="h-3 w-3 text-muted-foreground" />
								</div>
							</a>
						))}
					</CardContent>
				</Card>
			)}

			{/* Share & Actions */}
			<Card className="border-border/50 bg-card/50 backdrop-blur">
				<CardHeader className="space-y-4 pb-3">
					<CardTitle className="text-base flex items-center gap-2">
						<Users className="h-4 w-4" />
						Share
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							const url = `${window.location.origin}/features/${feature.slug}`;
							navigator.clipboard.writeText(url);
						}}
						className="w-full text-xs"
					>
						Copy Link
					</Button>
					<Button
						variant="outline"
						size="sm"
						asChild
						className="w-full text-xs"
					>
						<a
							href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
								`Check out ${feature.data.title} on ONE Platform: `,
							)}&url=${encodeURIComponent(
								`${typeof window !== "undefined" ? window.location.origin : ""}/features/${feature.slug}`,
							)}`}
							target="_blank"
							rel="noopener noreferrer"
						>
							Share on Twitter
						</a>
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
