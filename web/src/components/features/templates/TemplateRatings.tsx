/**
 * Template Ratings Component
 * Complete rating system with submission, display, and reviews
 */

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { RatingInput } from "./RatingInput";
import { RatingDisplay } from "./RatingDisplay";
import { ReviewList } from "./ReviewList";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface TemplateRatingsProps {
	templateId: Id<"things">;
	showSubmitForm?: boolean;
}

export function TemplateRatings({
	templateId,
	showSubmitForm = true,
}: TemplateRatingsProps) {
	const { toast } = useToast();

	// State
	const [rating, setRating] = useState(0);
	const [reviewText, setReviewText] = useState("");
	const [sortBy, setSortBy] = useState<"recent" | "helpful" | "rating">(
		"recent"
	);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Queries
	const stats = useQuery(api.queries.ratings.getTemplateRatings, {
		templateId,
	});
	const reviews = useQuery(api.queries.ratings.getTemplateReviews, {
		templateId,
		sortBy,
		limit: 50,
	});
	const userRating = useQuery(api.queries.ratings.getUserRating, {
		templateId,
	});

	// Mutations
	const rateTemplate = useMutation(api.mutations.ratings.rateTemplate);
	const voteHelpful = useMutation(api.mutations.ratings.voteReviewHelpful);
	const deleteRating = useMutation(api.mutations.ratings.deleteRating);

	// Handlers
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (rating === 0) {
			toast({
				title: "Rating required",
				description: "Please select a star rating",
				variant: "destructive",
			});
			return;
		}

		setIsSubmitting(true);

		try {
			await rateTemplate({
				templateId,
				rating,
				reviewText: reviewText.trim(),
			});

			toast({
				title: userRating ? "Rating updated" : "Rating submitted",
				description: "Thank you for your feedback!",
			});

			// Reset form if new submission
			if (!userRating) {
				setRating(0);
				setReviewText("");
			}
		} catch (error) {
			toast({
				title: "Error",
				description:
					error instanceof Error ? error.message : "Failed to submit rating",
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleVoteHelpful = async (connectionId: string) => {
		try {
			await voteHelpful({ connectionId: connectionId as Id<"connections"> });
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to vote",
				variant: "destructive",
			});
		}
	};

	const handleDeleteReview = async (connectionId: string) => {
		if (!confirm("Are you sure you want to delete your review?")) return;

		try {
			await deleteRating({ connectionId: connectionId as Id<"connections"> });
			toast({
				title: "Review deleted",
				description: "Your review has been removed",
			});
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to delete review",
				variant: "destructive",
			});
		}
	};

	// Initialize form with user's existing rating
	useState(() => {
		if (userRating) {
			setRating(userRating.rating);
			setReviewText(userRating.reviewText);
		}
	});

	// Loading state
	if (!stats || !reviews) {
		return <div className="animate-pulse h-64 bg-muted rounded-lg" />;
	}

	return (
		<div className="space-y-6">
			{/* Rating Statistics */}
			<div>
				<h2 className="text-2xl font-bold mb-4">Ratings & Reviews</h2>
				<RatingDisplay
					averageRating={stats.averageRating}
					totalRatings={stats.totalRatings}
					breakdown={stats.breakdown}
				/>
			</div>

			<Separator />

			{/* Submit/Edit Rating Form */}
			{showSubmitForm && (
				<Card>
					<CardHeader>
						<CardTitle>
							{userRating ? "Edit Your Review" : "Write a Review"}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-4">
							{/* Star Rating */}
							<div>
								<label className="text-sm font-medium mb-2 block">
									Your Rating
								</label>
								<RatingInput
									rating={rating}
									onRatingChange={setRating}
									size="lg"
									disabled={isSubmitting}
								/>
							</div>

							{/* Review Text */}
							<div>
								<label className="text-sm font-medium mb-2 block">
									Your Review (Optional)
								</label>
								<Textarea
									value={reviewText}
									onChange={(e) => setReviewText(e.target.value)}
									placeholder="Share your experience with this template..."
									rows={4}
									disabled={isSubmitting}
									maxLength={2000}
								/>
								<div className="text-xs text-muted-foreground mt-1 text-right">
									{reviewText.length}/2000
								</div>
							</div>

							{/* Submit Button */}
							<div className="flex gap-2">
								<Button type="submit" disabled={isSubmitting || rating === 0}>
									{isSubmitting
										? "Submitting..."
										: userRating
											? "Update Review"
											: "Submit Review"}
								</Button>
								{userRating && (
									<Button
										type="button"
										variant="outline"
										onClick={() => handleDeleteReview(userRating.id)}
										disabled={isSubmitting}
									>
										Delete
									</Button>
								)}
							</div>
						</form>
					</CardContent>
				</Card>
			)}

			<Separator />

			{/* Reviews List */}
			<ReviewList
				reviews={reviews}
				onVoteHelpful={handleVoteHelpful}
				onDelete={handleDeleteReview}
				onSortChange={setSortBy}
			/>
		</div>
	);
}
