import React from 'react';
import MuxPlayer from '@mux/mux-player-react';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  // Mux Video
  playbackId?: string;
  muxAssetId?: string;

  // YouTube support
  youtubeId?: string;

  // Direct video URL support
  videoUrl?: string;
  src?: string; // Alternative to videoUrl

  // Metadata
  title?: string;
  videoId?: string; // For metadata tracking
  poster?: string;
  className?: string;

  // Media type
  type?: 'video' | 'audio';

  // Player options
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  aspectRatio?: string;

  // Chapter support
  chapters?: Array<{
    startTime: number;
    endTime?: number;
    value: string;
  }>;

  // Features
  enableProgressTracking?: boolean;
  enableTimestampSharing?: boolean;

  // Tracking metadata
  viewerUserId?: string;
}

/**
 * VideoPlayer Component - Mux Player Integration
 *
 * Modern video player using official @mux/mux-player-react package.
 *
 * ## Features:
 * - **Mux Video CDN**: Production-ready adaptive streaming
 * - **Automatic Quality**: Adaptive bitrate streaming
 * - **Built-in Controls**: Professional video player controls
 * - **Metadata Tracking**: Built-in analytics via metadata prop
 * - **YouTube Fallback**: Seamless YouTube embed support
 * - **Lazy Loading**: Performance-optimized loading
 * - **Responsive**: Mobile-optimized with aspect ratio support
 * - **Dark Mode**: Automatic theme adaptation
 *
 * ## Mux Player Advantages:
 * - Official Mux package (production-ready)
 * - Automatic quality selection
 * - Built-in buffering and error handling
 * - HLS streaming support
 * - Picture-in-picture support
 * - Keyboard shortcuts
 * - ARIA accessibility
 *
 * @example Basic Mux Video
 * ```tsx
 * <VideoPlayer
 *   playbackId="a4nOgmxGWg6gULfcBbAa00gXyfcwPnAFldF8RdsNyk8M"
 *   title="Tutorial Video"
 *   videoId="tutorial-1"
 *   viewerUserId="user-123"
 *   client:visible
 * />
 * ```
 *
 * @example YouTube Fallback
 * ```tsx
 * <VideoPlayer
 *   youtubeId="dQw4w9WgXcQ"
 *   title="YouTube Video"
 *   client:visible
 * />
 * ```
 *
 * @example With All Options
 * ```tsx
 * <VideoPlayer
 *   playbackId="DS00Spx1CV902MCtPj5WknGlR102V5HFkDe"
 *   title="Big Buck Bunny"
 *   videoId="big-buck-bunny"
 *   viewerUserId="user-456"
 *   poster="/thumbnails/big-buck-bunny.jpg"
 *   aspectRatio="16/9"
 *   autoplay={false}
 *   muted={false}
 *   client:visible
 * />
 * ```
 */
export function VideoPlayer({
  playbackId,
  muxAssetId,
  youtubeId,
  videoUrl,
  title = 'Video Player',
  videoId,
  poster,
  className = '',
  autoplay = false,
  muted = false,
  loop = false,
  aspectRatio = '16/9',
  viewerUserId,
}: VideoPlayerProps) {
  // Map aspect ratio to Tailwind classes
  const getAspectClass = (ratio: string) => {
    switch (ratio) {
      case '16/9':
        return 'aspect-video';
      case '4/3':
        return 'aspect-[4/3]';
      case '21/9':
        return 'aspect-[21/9]';
      case '1/1':
        return 'aspect-square';
      default:
        return 'aspect-video';
    }
  };

  // Direct video URL (native HTML5 video)
  if (videoUrl && !playbackId && !youtubeId) {
    return (
      <div className={cn('one-video-player-wrapper w-full', className)}>
        <div
          className={cn(
            'one-video-player relative overflow-hidden rounded-xl w-full group',
            'border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5',
            'shadow-lg shadow-primary/10',
            'hover:border-primary/40 hover:shadow-xl hover:shadow-primary/20',
            'transition-all duration-500',
            getAspectClass(aspectRatio)
          )}
        >
          <video
            src={videoUrl}
            poster={poster}
            title={title}
            className="w-full h-full object-cover rounded-lg"
            autoPlay={autoplay}
            muted={muted}
            loop={loop}
            controls
            preload="metadata"
            playsInline
            controlsList="nodownload"
          >
            Your browser does not support the video tag.
          </video>

          {/* ONE Platform Brand Overlay */}
          <div className="absolute top-3 left-3 z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden sm:block">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-black/70 backdrop-blur-md rounded-full text-xs font-semibold text-white shadow-lg">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="tracking-wide">ONE</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // YouTube embed
  if (youtubeId && !playbackId) {
    const autoplayParam = autoplay ? '&autoplay=1' : '';
    const muteParam = muted ? '&mute=1' : '';
    const loopParam = loop ? '&loop=1' : '';

    return (
      <div
        className={cn(
          'one-video-player relative overflow-hidden w-full',
          'rounded-xl border bg-card shadow',
          getAspectClass(aspectRatio),
          className
        )}
      >
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1${autoplayParam}${muteParam}${loopParam}`}
          title={title}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
        />

        {/* ONE Platform Brand Overlay */}
        <div className="absolute top-3 left-3 z-50 opacity-20 hover:opacity-60 transition-opacity duration-300 pointer-events-none">
          <div className="flex items-center gap-2 px-2.5 py-1 bg-gradient-to-r from-primary/60 to-accent/60 backdrop-blur-sm rounded-full text-xs font-medium text-primary-foreground shadow-md border border-primary-foreground/10">
            <span className="w-1.5 h-1.5 bg-primary-foreground/80 rounded-full animate-pulse" />
            <span className="tracking-wide">ONE</span>
          </div>
        </div>
      </div>
    );
  }

  // Mux video player
  if (playbackId) {
    return (
      <div className={cn('one-video-player-wrapper w-full', className)}>
        <div
          className={cn(
            'one-video-player relative overflow-hidden rounded-xl w-full',
            'border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5',
            'shadow-lg shadow-primary/10',
            'hover:border-primary/40 hover:shadow-xl hover:shadow-primary/20',
            'transition-all duration-500',
            getAspectClass(aspectRatio)
          )}
        >
          <MuxPlayer
            playbackId={playbackId}
            metadata={{
              video_id: videoId || muxAssetId || playbackId,
              video_title: title,
              viewer_user_id: viewerUserId || 'anonymous',
            }}
            poster={poster}
            autoPlay={autoplay}
            muted={muted}
            loop={loop}
            style={{ height: '100%', width: '100%' }}
            streamType="on-demand"
            accentColor="#0A0A0A"
          />

          {/* ONE Platform Brand Overlay */}
          <div className="absolute top-3 left-3 z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden sm:block">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-black/70 backdrop-blur-md rounded-full text-xs font-semibold text-white shadow-lg">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="tracking-wide">ONE</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback: No video source provided
  return (
    <div
      className={cn(
        'flex items-center justify-center w-full bg-muted rounded-xl border',
        getAspectClass(aspectRatio),
        className
      )}
    >
      <div className="text-center p-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
        <p className="text-sm text-muted-foreground font-medium">No video source</p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Provide playbackId or youtubeId
        </p>
      </div>
    </div>
  );
}
