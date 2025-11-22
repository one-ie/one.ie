import { useState } from "react";
import { Star, ThumbsUp, Flag } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

interface Review {
  id: string;
  author: {
    name: string;
    avatar?: string;
  };
  rating: number;
  text: string;
  timestamp: Date;
  helpful: number;
  verified: boolean;
}

interface PluginRatingSystemProps {
  pluginId: string;
  averageRating: number;
  totalReviews: number;
  reviews: Review[];
  userCanReview: boolean;
  onSubmitReview?: (rating: number, text: string) => Promise<void>;
  onMarkHelpful?: (reviewId: string) => void;
  onReportReview?: (reviewId: string) => void;
}

export function PluginRatingSystem({
  pluginId,
  averageRating,
  totalReviews,
  reviews,
  userCanReview,
  onSubmitReview,
  onMarkHelpful,
  onReportReview,
}: PluginRatingSystemProps) {
  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);

  // Calculate rating distribution
  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((review) => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating as 1 | 2 | 3 | 4 | 5]++;
      }
    });
    return distribution;
  };

  const distribution = getRatingDistribution();

  const handleSubmitReview = async () => {
    if (!selectedRating || !reviewText.trim() || !onSubmitReview) return;

    setSubmitting(true);
    try {
      await onSubmitReview(selectedRating, reviewText);
      setShowReviewDialog(false);
      setSelectedRating(0);
      setReviewText("");
    } catch (error) {
      console.error("Failed to submit review:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  };

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="text-5xl font-bold">{averageRating.toFixed(1)}</div>
                <div>
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.round(averageRating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
                  </p>
                </div>
              </div>
            </div>
            {userCanReview && (
              <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
                <DialogTrigger asChild>
                  <Button>Write Review</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Write a Review</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    {/* Star Rating */}
                    <div className="space-y-2">
                      <Label>Your Rating</Label>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setSelectedRating(i + 1)}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`w-8 h-8 transition-colors ${
                                i < selectedRating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground hover:text-yellow-400"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Review Text */}
                    <div className="space-y-2">
                      <Label htmlFor="review-text">Your Review</Label>
                      <Textarea
                        id="review-text"
                        placeholder="Share your experience with this plugin..."
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        rows={5}
                      />
                      <p className="text-xs text-muted-foreground">
                        {reviewText.length}/500 characters
                      </p>
                    </div>

                    {/* Submit Button */}
                    <Button
                      className="w-full"
                      onClick={handleSubmitReview}
                      disabled={!selectedRating || !reviewText.trim() || submitting}
                    >
                      {submitting ? "Submitting..." : "Submit Review"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = distribution[rating as 1 | 2 | 3 | 4 | 5];
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

              return (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-12">
                    <span className="text-sm">{rating}</span>
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  </div>
                  <Progress value={percentage} className="flex-1 h-2" />
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Reviews</h3>

        {reviews.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No reviews yet</p>
              {userCanReview && (
                <Button className="mt-4" onClick={() => setShowReviewDialog(true)}>
                  Be the first to review
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          reviews.map((review, index) => (
            <div key={review.id}>
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarImage src={review.author.avatar} />
                        <AvatarFallback>{review.author.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{review.author.name}</p>
                          {review.verified && (
                            <Badge variant="secondary" className="text-xs">
                              Verified
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(review.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{review.text}</p>
                </CardContent>
                <CardFooter className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onMarkHelpful?.(review.id)}
                  >
                    <ThumbsUp className="w-4 h-4 mr-1" />
                    Helpful ({review.helpful})
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onReportReview?.(review.id)}
                  >
                    <Flag className="w-4 h-4 mr-1" />
                    Report
                  </Button>
                </CardFooter>
              </Card>
              {index < reviews.length - 1 && <Separator className="my-4" />}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
