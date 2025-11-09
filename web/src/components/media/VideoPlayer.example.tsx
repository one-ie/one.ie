/**
 * VideoPlayer Component - Usage Examples
 *
 * This file demonstrates the different ways to use the VideoPlayer component
 * with various media types and configurations.
 */

import { VideoPlayer } from './VideoPlayer';

/**
 * Example 1: YouTube Video Embed
 * Automatically detects YouTube URLs and renders iframe embed
 */
export function YouTubeExample() {
  return (
    <VideoPlayer
      src="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      title="YouTube Video Example"
      aspectRatio="16/9"
      autoplay={false}
      muted={true}
    />
  );
}

/**
 * Example 2: Native Video Player (MP4, WebM, etc.)
 * Renders HTML5 video element for direct video files
 */
export function NativeVideoExample() {
  return (
    <VideoPlayer
      src="https://example.com/sample-video.mp4"
      poster="https://example.com/thumbnail.jpg"
      title="Native Video Example"
      aspectRatio="16/9"
      autoplay={false}
      muted={false}
      loop={false}
    />
  );
}

/**
 * Example 3: Audio Player with Poster Image
 * Renders audio player with optional poster image
 */
export function AudioExample() {
  return (
    <VideoPlayer
      type="audio"
      src="https://example.com/podcast-episode.mp3"
      poster="https://example.com/podcast-cover.jpg"
      title="Podcast Episode Title"
      autoplay={false}
      muted={false}
      loop={false}
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
      src="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      title="Custom Styled Video"
      className="shadow-2xl border-2 border-primary"
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
        src="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        title="16:9 Aspect Ratio"
        aspectRatio="16/9"
      />

      {/* 4:3 - Classic aspect ratio */}
      <VideoPlayer
        src="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        title="4:3 Aspect Ratio"
        aspectRatio="4/3"
      />

      {/* 21:9 - Ultra-wide */}
      <VideoPlayer
        src="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        title="21:9 Aspect Ratio"
        aspectRatio="21/9"
      />

      {/* 1:1 - Square */}
      <VideoPlayer
        src="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
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
      src="https://example.com/background-video.mp4"
      title="Background Video"
      autoplay={true}
      muted={true}
      loop={true}
      aspectRatio="16/9"
    />
  );
}

/**
 * Example 7: Future Vidstack Integration
 * Props are ready for enhanced Vidstack features
 */
export function VidstackReadyExample() {
  return (
    <VideoPlayer
      src="https://example.com/video.mp4"
      title="Advanced Video"
      thumbnails="https://example.com/thumbnails.vtt"
      chapters={[
        { startTime: 0, endTime: 60, text: 'Introduction' },
        { startTime: 60, endTime: 180, text: 'Main Content' },
        { startTime: 180, endTime: 240, text: 'Conclusion' },
      ]}
      streamType="on-demand"
    />
  );
}
