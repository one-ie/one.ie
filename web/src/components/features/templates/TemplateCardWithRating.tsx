/**
 * Template Card with Rating
 * Shows template preview with average rating
 */

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RatingDisplay } from "./RatingDisplay";
import { Eye } from "lucide-react";

interface TemplateCardWithRatingProps {
	template: {
		_id: Id<"things">;
		name: string;
		type: string;
		properties?: {
			description?: string;
			category?: string;
			thumbnail?: string;
			previewUrl?: string;
			usageCount?: number;
		};
	};
	onSelect?: (id: Id<"things">) => void;
	onPreview?: (id: Id<"things">) => void;
}

export function TemplateCardWithRating({
	template,
	onSelect,
	onPreview,
}: TemplateCardWithRatingProps) {
	// Get rating stats
	const stats = useQuery(api.queries.ratings.getTemplateRatings, {
		templateId: template._id,
	});

	return (
		<Card className="hover:shadow-lg transition-shadow">
			<CardHeader>
				{/* Thumbnail */}
				{template.properties?.thumbnail && (
					<div className="aspect-video w-full overflow-hidden rounded-md mb-3">
						<img
							src={template.properties.thumbnail}
							alt={template.name}
							className="w-full h-full object-cover"
						/>
					</div>
				)}

				{/* Title & Category */}
				<div className="space-y-2">
					<CardTitle className="line-clamp-2">{template.name}</CardTitle>
					{template.properties?.category && (
						<Badge variant="secondary">{template.properties.category}</Badge>
					)}
				</div>
			</CardHeader>

			<CardContent>
				{/* Description */}
				{template.properties?.description && (
					<p className="text-sm text-muted-foreground line-clamp-3 mb-3">
						{template.properties.description}
					</p>
				)}

				{/* Rating */}
				{stats && (
					<RatingDisplay
						averageRating={stats.averageRating}
						totalRatings={stats.totalRatings}
						breakdown={stats.breakdown}
						compact
					/>
				)}

				{/* Usage Count */}
				{template.properties?.usageCount !== undefined && (
					<div className="text-xs text-muted-foreground mt-2">
						Used {template.properties.usageCount.toLocaleString()} times
					</div>
				)}
			</CardContent>

			<CardFooter className="flex gap-2">
				{onPreview && (
					<Button
						variant="outline"
						size="sm"
						onClick={() => onPreview(template._id)}
					>
						<Eye className="h-4 w-4 mr-1" />
						Preview
					</Button>
				)}
				{onSelect && (
					<Button size="sm" onClick={() => onSelect(template._id)}>
						Use Template
					</Button>
				)}
			</CardFooter>
		</Card>
	);
}
