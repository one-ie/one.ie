/**
 * Rating Display Component
 * Shows average rating, total reviews, and star breakdown
 */

import { ReviewStars } from "@/components/ecommerce/static/ReviewStars";
import { Progress } from "@/components/ui/progress";

interface RatingDisplayProps {
	averageRating: number;
	totalRatings: number;
	breakdown: {
		5: number;
		4: number;
		3: number;
		2: number;
		1: number;
	};
	compact?: boolean;
}

export function RatingDisplay({
	averageRating,
	totalRatings,
	breakdown,
	compact = false,
}: RatingDisplayProps) {
	if (totalRatings === 0) {
		return (
			<div className="text-sm text-muted-foreground">
				No ratings yet. Be the first to rate!
			</div>
		);
	}

	// Calculate percentages
	const percentages = {
		5: (breakdown[5] / totalRatings) * 100,
		4: (breakdown[4] / totalRatings) * 100,
		3: (breakdown[3] / totalRatings) * 100,
		2: (breakdown[2] / totalRatings) * 100,
		1: (breakdown[1] / totalRatings) * 100,
	};

	if (compact) {
		return (
			<div className="flex items-center gap-2">
				<ReviewStars rating={averageRating} reviewCount={totalRatings} />
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Average Rating */}
			<div className="flex items-center gap-4">
				<div className="text-center">
					<div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
					<ReviewStars rating={averageRating} size="md" showCount={false} />
					<div className="text-sm text-muted-foreground mt-1">
						{totalRatings} {totalRatings === 1 ? "rating" : "ratings"}
					</div>
				</div>

				{/* Star Breakdown */}
				<div className="flex-1 space-y-2">
					{[5, 4, 3, 2, 1].map((stars) => (
						<div key={stars} className="flex items-center gap-2">
							<div className="flex items-center gap-1 w-16">
								<span className="text-sm font-medium">{stars}</span>
								<svg
									className="h-4 w-4 text-yellow-400"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
								</svg>
							</div>
							<Progress
								value={percentages[stars as keyof typeof percentages]}
								className="flex-1"
							/>
							<span className="text-sm text-muted-foreground w-12 text-right">
								{breakdown[stars as keyof typeof breakdown]}
							</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
