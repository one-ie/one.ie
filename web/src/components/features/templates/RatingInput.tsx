/**
 * Rating Input Component
 * Interactive 5-star rating input
 */

import { useState } from "react";

interface RatingInputProps {
	rating: number;
	onRatingChange: (rating: number) => void;
	size?: "sm" | "md" | "lg";
	disabled?: boolean;
}

export function RatingInput({
	rating,
	onRatingChange,
	size = "md",
	disabled = false,
}: RatingInputProps) {
	const [hoverRating, setHoverRating] = useState(0);

	const sizeClasses = {
		sm: "h-5 w-5",
		md: "h-7 w-7",
		lg: "h-10 w-10",
	};

	const displayRating = hoverRating || rating;

	return (
		<div className="flex items-center gap-1">
			{[1, 2, 3, 4, 5].map((star) => (
				<button
					key={star}
					type="button"
					disabled={disabled}
					onClick={() => onRatingChange(star)}
					onMouseEnter={() => !disabled && setHoverRating(star)}
					onMouseLeave={() => !disabled && setHoverRating(0)}
					className={`transition-transform ${
						disabled ? "cursor-default" : "cursor-pointer hover:scale-110"
					}`}
					aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
				>
					<svg
						className={`${sizeClasses[size]} transition-colors ${
							star <= displayRating
								? "text-yellow-400"
								: "text-muted-foreground/30"
						}`}
						fill="currentColor"
						viewBox="0 0 20 20"
					>
						<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
					</svg>
				</button>
			))}
		</div>
	);
}
