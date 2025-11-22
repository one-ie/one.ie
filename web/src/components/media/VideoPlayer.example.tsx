/**
 * VideoPlayer Component - Usage Examples
 *
 * This file demonstrates the different ways to use the VideoPlayer component
 * with Mux Player and YouTube embeds.
 */

import { VideoPlayer } from "./VideoPlayer";

/**
 * Example 1: Mux Video with Metadata Tracking
 * Production-ready video player with built-in analytics
 */
export function MuxVideoExample() {
	return (
		<VideoPlayer
			playbackId="a4nOgmxGWg6gULfcBbAa00gXyfcwPnAFldF8RdsNyk8M"
			title="Tutorial: Getting Started"
			videoId="tutorial-getting-started"
			viewerUserId="user-123"
			poster="/thumbnails/tutorial.jpg"
			aspectRatio="16/9"
			autoplay={false}
			muted={false}
		/>
	);
}

/**
 * Example 2: YouTube Video Fallback
 * Automatically detects YouTube URLs and renders iframe embed
 */
export function YouTubeExample() {
	return (
		<VideoPlayer
			youtubeId="dQw4w9WgXcQ"
			title="YouTube Video Example"
			aspectRatio="16/9"
			autoplay={false}
			muted={true}
		/>
	);
}

/**
 * Example 3: Mux Video with Auto-generated Metadata
 * Metadata is automatically populated from playbackId
 */
export function MuxVideoMinimalExample() {
	return (
		<VideoPlayer
			playbackId="DS00Spx1CV902MCtPj5WknGlR102V5HFkDe"
			title="Big Buck Bunny"
		/>
	);
}

/**
 * Example 4: Custom Styling with Tailwind Classes
 * Override default styles with custom className
 */
export function CustomStyledExample() {
	return (
		<VideoPlayer
			playbackId="a4nOgmxGWg6gULfcBbAa00gXyfcwPnAFldF8RdsNyk8M"
			title="Custom Styled Video"
			className="shadow-2xl border-4 border-primary/40"
			aspectRatio="21/9"
		/>
	);
}

/**
 * Example 5: Different Aspect Ratios
 * Supports 16/9, 4/3, 21/9, 1/1 (square)
 */
export function AspectRatioExamples() {
	return (
		<div className="grid grid-cols-2 gap-4">
			{/* 16:9 - Standard widescreen */}
			<VideoPlayer
				playbackId="a4nOgmxGWg6gULfcBbAa00gXyfcwPnAFldF8RdsNyk8M"
				title="16:9 Aspect Ratio"
				aspectRatio="16/9"
			/>

			{/* 4:3 - Classic aspect ratio */}
			<VideoPlayer
				youtubeId="dQw4w9WgXcQ"
				title="4:3 Aspect Ratio"
				aspectRatio="4/3"
			/>

			{/* 21:9 - Ultra-wide */}
			<VideoPlayer
				playbackId="a4nOgmxGWg6gULfcBbAa00gXyfcwPnAFldF8RdsNyk8M"
				title="21:9 Aspect Ratio"
				aspectRatio="21/9"
			/>

			{/* 1:1 - Square */}
			<VideoPlayer
				youtubeId="dQw4w9WgXcQ"
				title="1:1 Square Aspect Ratio"
				aspectRatio="1/1"
			/>
		</div>
	);
}

/**
 * Example 6: Autoplay and Looping Video
 * Note: Autoplay typically requires muted=true for browser policies
 */
export function AutoplayLoopExample() {
	return (
		<VideoPlayer
			playbackId="a4nOgmxGWg6gULfcBbAa00gXyfcwPnAFldF8RdsNyk8M"
			title="Background Video"
			autoplay={true}
			muted={true}
			loop={true}
			aspectRatio="16/9"
		/>
	);
}

/**
 * Example 7: Mux Video with Full Metadata
 * Complete example with all metadata options
 */
export function MuxVideoFullExample() {
	return (
		<VideoPlayer
			playbackId="a4nOgmxGWg6gULfcBbAa00gXyfcwPnAFldF8RdsNyk8M"
			muxAssetId="asset-123456"
			title="Advanced Tutorial"
			videoId="advanced-tutorial-001"
			viewerUserId="user-456"
			poster="/thumbnails/advanced-tutorial.jpg"
			aspectRatio="16/9"
			autoplay={false}
			muted={false}
			loop={false}
		/>
	);
}

/**
 * Example 8: No Video Source (Fallback UI)
 * Shows placeholder when no playbackId or youtubeId provided
 */
export function NoSourceExample() {
	return <VideoPlayer title="Missing Video" aspectRatio="16/9" />;
}

/**
 * Example 9: Page Integration Example
 * How to use VideoPlayer in an Astro page
 */
export function PageIntegrationExample() {
	return (
		<div className="max-w-4xl mx-auto py-8">
			<h1 className="text-3xl font-bold mb-6">Video Tutorial</h1>

			<VideoPlayer
				playbackId="a4nOgmxGWg6gULfcBbAa00gXyfcwPnAFldF8RdsNyk8M"
				title="Complete Tutorial"
				videoId="tutorial-complete"
				viewerUserId="user-789"
				poster="/thumbnails/tutorial.jpg"
			/>

			<div className="mt-6 prose prose-lg">
				<h2>About This Video</h2>
				<p>
					This tutorial covers everything you need to know about the ONE
					Platform.
				</p>
			</div>
		</div>
	);
}
