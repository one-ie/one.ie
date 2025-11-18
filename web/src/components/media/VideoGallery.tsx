/**
 * VideoGallery Component
 *
 * Displays a responsive grid of video cards with sorting, loading states, and empty states.
 * Automatically sorts videos by publishedAt (newest first).
 *
 * Responsive Layout:
 * - Mobile (<768px): 1 column, optimized spacing
 * - Tablet (768-1024px): 2 columns, balanced layout
 * - Desktop (>1024px): 3 columns, spacious grid
 *
 * Features:
 * - Auto-sorting by date (newest first)
 * - Skeleton loading states
 * - Empty state with icon
 * - Dark mode support
 * - Accessibility (ARIA labels, semantic HTML)
 * - Optional video limit
 *
 * @example
 * ```tsx
 * <VideoGallery
 *   videos={[
 *     {
 *       title: "Intro to Sui",
 *       description: "Learn Sui basics",
 *       thumbnail: "/thumb.jpg",
 *       duration: 420,
 *       slug: "intro-sui",
 *       publishedAt: new Date()
 *     }
 *   ]}
 * />
 * ```
 */

import { Skeleton } from "@/components/ui/skeleton";
import { VideoCard } from "./VideoCard";

export interface VideoGalleryProps {
	videos: Array<{
		title: string;
		description: string;
		thumbnail: string;
		duration: number;
		slug: string;
		author?: string;
		publishedAt: Date;
		youtubeId?: string; // Auto-generate thumbnail from YouTube
	}>;
	loading?: boolean;
	limit?: number;
}

/**
 * VideoGallery displays a responsive grid of video cards
 *
 * Features:
 * - Responsive grid (3/2/1 columns)
 * - Auto-sorts by newest first
 * - Loading state with skeleton cards
 * - Empty state message
 * - Dark mode support
 * - Consistent gap spacing
 * - Optional video limit
 */
export function VideoGallery({
	videos,
	loading = false,
	limit,
}: VideoGalleryProps) {
	// Sort videos by publishedAt (newest first)
	const sortedVideos = [...videos].sort(
		(a, b) => b.publishedAt.getTime() - a.publishedAt.getTime(),
	);

	// Apply limit if specified
	const displayedVideos = limit ? sortedVideos.slice(0, limit) : sortedVideos;

	// Loading state: Show skeleton cards
	if (loading) {
		return (
			<div
				className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
				role="status"
				aria-label="Loading videos"
			>
				{Array.from({ length: limit || 6 }).map((_, index) => (
					<VideoCardSkeleton key={index} />
				))}
			</div>
		);
	}

	// Empty state: No videos available
	if (displayedVideos.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
				<div className="text-center space-y-3 sm:space-y-4 max-w-md">
					<div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-muted flex items-center justify-center">
						<svg
							className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
							/>
						</svg>
					</div>
					<h3 className="text-lg sm:text-xl font-semibold">
						No videos available
					</h3>
					<p className="text-sm sm:text-base text-muted-foreground">
						Check back later for new video content.
					</p>
				</div>
			</div>
		);
	}

	// Render video grid - responsive spacing and columns
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
			{displayedVideos.map((video) => (
				<VideoCard
					key={video.slug}
					title={video.title}
					description={video.description}
					thumbnail={video.thumbnail}
					duration={video.duration}
					slug={video.slug}
					author={video.author}
					publishedAt={video.publishedAt}
					youtubeId={video.youtubeId}
				/>
			))}
		</div>
	);
}

/**
 * VideoCardSkeleton - Loading placeholder for VideoCard
 * Matches actual VideoCard layout for zero CLS (Cumulative Layout Shift)
 */
function VideoCardSkeleton() {
	return (
		<div className="space-y-3 sm:space-y-4" aria-hidden="true">
			{/* Thumbnail skeleton (16:9 aspect ratio) - prevent CLS */}
			<Skeleton className="aspect-video w-full rounded-xl" />

			{/* Title skeleton - responsive spacing */}
			<div className="space-y-2 px-4 sm:px-6">
				<Skeleton className="h-4 sm:h-5 w-3/4" />
				<Skeleton className="h-4 sm:h-5 w-1/2" />
			</div>

			{/* Description skeleton - responsive spacing */}
			<div className="space-y-2 px-4 sm:px-6">
				<Skeleton className="h-3 sm:h-4 w-full" />
				<Skeleton className="h-3 sm:h-4 w-5/6" />
			</div>

			{/* Footer skeleton - responsive spacing */}
			<div className="flex justify-between px-4 sm:px-6 pb-4 sm:pb-6">
				<Skeleton className="h-3 sm:h-4 w-24" />
				<Skeleton className="h-3 sm:h-4 w-20" />
			</div>
		</div>
	);
}
