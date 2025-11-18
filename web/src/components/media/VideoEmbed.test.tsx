/**
 * VideoEmbed Component Test
 *
 * Tests the VideoEmbed component ported from Bull.fm
 *
 * Component capabilities:
 * - YouTube video embedding with @astro-community/astro-embed-youtube
 * - Customizable poster quality (max, high, default, low)
 * - Optional title and description display
 * - Optional timestamp information
 * - Custom URL parameters support
 * - Responsive card layout with shadcn/ui
 * - SSR-compatible for Astro pages
 */

import { VideoEmbed } from "./VideoEmbed";

// Example usage in Astro component:
// <VideoEmbed
//   id="dQw4w9WgXcQ"
//   title="Introduction to ONE Platform"
//   description="Learn about the 6-dimension ontology"
//   posterQuality="high"
//   client:load
// />

// Example usage without metadata:
// <VideoEmbed id="dQw4w9WgXcQ" client:load />

// Example with custom parameters:
// <VideoEmbed
//   id="dQw4w9WgXcQ"
//   params="start=30&autoplay=1"
//   client:load
// />

export const testVideoEmbed = (
	<VideoEmbed
		id="dQw4w9WgXcQ"
		title="Test Video"
		description="This is a test video"
		posterQuality="high"
	/>
);
