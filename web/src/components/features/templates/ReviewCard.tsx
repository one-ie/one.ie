/**
 * Review Card Component
 * Displays individual review with helpful voting
 */

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ReviewStars } from "@/components/ecommerce/static/ReviewStars";
import { ThumbsUp } from "lucide-react";

interface ReviewCardProps {
	review: {
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
	};
	currentUserId?: string;
	onVoteHelpful?: (reviewId: string) => void;
	onDelete?: (reviewId: string) => void;
}

export function ReviewCard({
	review,
	currentUserId,
	onVoteHelpful,
	onDelete,
}: ReviewCardProps) {
	const [isVoting, setIsVoting] = useState(false);
	const hasVoted = currentUserId
		? review.helpfulVotes.includes(currentUserId)
		: false;
	const isAuthor = currentUserId === review.reviewer.id;

	const handleVoteHelpful = async () => {
		if (!onVoteHelpful || isVoting) return;
		setIsVoting(true);
		try {
			await onVoteHelpful(review.id);
		} finally {
			setIsVoting(false);
		}
	};

	return (
		<Card>
			<CardContent className="pt-6">
				{/* Reviewer Info */}
				<div className="flex items-start justify-between mb-3">
					<div className="flex items-center gap-3">
						<Avatar className="h-10 w-10">
							<AvatarImage src={review.reviewer.avatarUrl} />
							<AvatarFallback>
								{review.reviewer.name[0]?.toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<div>
							<div className="font-medium">{review.reviewer.name}</div>
							<div className="text-sm text-muted-foreground">
								{formatDistanceToNow(new Date(review.createdAt), {
									addSuffix: true,
								})}
							</div>
						</div>
					</div>
					{isAuthor && onDelete && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => onDelete(review.id)}
						>
							Delete
						</Button>
					)}
				</div>

				{/* Rating */}
				<div className="mb-3">
					<ReviewStars
						rating={review.rating}
						size="sm"
						showCount={false}
					/>
				</div>

				{/* Review Text */}
				<p className="text-sm mb-4 whitespace-pre-wrap">{review.reviewText}</p>

				{/* Helpful Button */}
				{onVoteHelpful && !isAuthor && (
					<div className="flex items-center gap-2">
						<Button
							variant={hasVoted ? "default" : "outline"}
							size="sm"
							onClick={handleVoteHelpful}
							disabled={isVoting}
						>
							<ThumbsUp className="h-4 w-4 mr-1" />
							Helpful ({review.helpfulCount})
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
