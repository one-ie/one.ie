/**
 * Review List Component
 * Displays list of reviews with sorting options
 */

import { useState } from "react";
import { ReviewCard } from "./ReviewCard";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface ReviewListProps {
	reviews: Array<{
		id: string;
		rating: number;
		reviewText: string;
		helpfulVotes: string[];
		helpfulCount: number;
		createdAt: number;
		reviewer: {
			id: string;
			name: string;
			avatarUrl?: string;
		};
	}>;
	currentUserId?: string;
	onVoteHelpful?: (reviewId: string) => void;
	onDelete?: (reviewId: string) => void;
	onSortChange?: (sortBy: "recent" | "helpful" | "rating") => void;
}

export function ReviewList({
	reviews,
	currentUserId,
	onVoteHelpful,
	onDelete,
	onSortChange,
}: ReviewListProps) {
	const [sortBy, setSortBy] = useState<"recent" | "helpful" | "rating">(
		"recent"
	);

	const handleSortChange = (value: "recent" | "helpful" | "rating") => {
		setSortBy(value);
		onSortChange?.(value);
	};

	if (reviews.length === 0) {
		return (
			<div className="text-center py-8 text-muted-foreground">
				No reviews yet. Be the first to write a review!
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Sort Controls */}
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold">
					Reviews ({reviews.length})
				</h3>
				<Select value={sortBy} onValueChange={handleSortChange}>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Sort by" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="recent">Most Recent</SelectItem>
						<SelectItem value="helpful">Most Helpful</SelectItem>
						<SelectItem value="rating">Highest Rating</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<Separator />

			{/* Reviews */}
			<div className="space-y-4">
				{reviews.map((review) => (
					<ReviewCard
						key={review.id}
						review={review}
						currentUserId={currentUserId}
						onVoteHelpful={onVoteHelpful}
						onDelete={onDelete}
					/>
				))}
			</div>
		</div>
	);
}
