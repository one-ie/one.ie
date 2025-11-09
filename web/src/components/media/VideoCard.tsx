import { Play } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface VideoCardProps {
  title: string;
  description: string;
  thumbnail: string;
  duration: number;
  slug: string;
  author?: string;
  publishedAt: Date;
  youtubeId?: string; // Auto-generate thumbnail from YouTube if provided
}

/**
 * Format duration from seconds to MM:SS or HH:MM:SS
 */
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

/**
 * Format date to relative time or absolute date
 */
function formatPublishDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * VideoCard component for displaying video thumbnails in a gallery
 *
 * Features:
 * - 16:9 aspect ratio thumbnail with loading="lazy"
 * - Touch-friendly play icon (larger on mobile)
 * - Duration badge with high contrast
 * - Title truncation (responsive font sizes)
 * - Author and publish date
 * - Hover effects (desktop only, no hover on touch devices)
 * - Dark mode support with semantic tokens
 * - Accessible with ARIA labels and focus states
 * - Links to /videos/[slug]
 *
 * Responsive breakpoints:
 * - Mobile (<768px): Touch-friendly, single column
 * - Tablet (768-1024px): Balanced spacing
 * - Desktop (>1024px): Hover effects enabled
 *
 * @example
 * ```tsx
 * <VideoCard
 *   title="Sui Blockchain Gaming"
 *   description="Explore how Sui transforms gaming"
 *   thumbnail="/images/sui-gaming.jpg"
 *   duration={420}
 *   slug="sui-blockchain-gaming"
 *   author="Bull.fm Team"
 *   publishedAt={new Date('2025-01-15')}
 * />
 * ```
 */
export function VideoCard({
  title,
  description,
  thumbnail,
  duration,
  slug,
  author,
  publishedAt,
  youtubeId
}: VideoCardProps) {
  // Auto-generate YouTube thumbnail if youtubeId is provided and no custom thumbnail
  // YouTube thumbnail URLs: https://img.youtube.com/vi/{VIDEO_ID}/hqdefault.jpg
  const thumbnailUrl = youtubeId && (!thumbnail || !thumbnail.startsWith('http'))
    ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
    : thumbnail;

  return (
    <a
      href={`/videos/${slug}`}
      aria-label={`Watch ${title}`}
      className="group block transition-transform md:hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-xl touch-manipulation"
    >
      <Card className="overflow-hidden h-full transition-shadow md:hover:shadow-xl md:dark:hover:shadow-2xl">
        {/* Thumbnail with 16:9 aspect ratio - prevent CLS */}
        <div className="relative aspect-video bg-muted overflow-hidden">
          <img
            src={thumbnailUrl}
            alt={`${title} thumbnail`}
            className="w-full h-full object-cover transition-transform md:group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />

          {/* Play icon overlay - larger on mobile for touch targets */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            <div className="w-20 h-20 sm:w-16 sm:h-16 rounded-full bg-primary/90 flex items-center justify-center backdrop-blur-sm shadow-lg">
              <Play
                className="w-10 h-10 sm:w-8 sm:h-8 text-primary-foreground fill-primary-foreground ml-1"
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Duration badge - high contrast for accessibility */}
          <div className="absolute bottom-2 right-2">
            <Badge
              variant="secondary"
              className="bg-black/90 text-white hover:bg-black/90 backdrop-blur-sm font-mono text-xs sm:text-sm px-2 py-0.5"
            >
              {formatDuration(duration)}
            </Badge>
          </div>
        </div>

        {/* Content - responsive padding and font sizes */}
        <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
          <h3 className="font-semibold text-base sm:text-lg leading-tight line-clamp-2 md:group-hover:text-primary transition-colors">
            {title}
          </h3>
        </CardHeader>

        <CardContent className="pb-3 px-4 sm:px-6">
          <p className="text-sm sm:text-base text-muted-foreground line-clamp-2">
            {description}
          </p>
        </CardContent>

        {/* Footer with author and date - responsive text size */}
        <CardFooter className="pt-0 px-4 sm:px-6 pb-4 sm:pb-6 flex items-center justify-between text-xs sm:text-sm text-muted-foreground gap-2">
          {author && (
            <span className="font-medium truncate">{author}</span>
          )}
          <span className={author ? 'ml-auto shrink-0' : ''}>
            {formatPublishDate(publishedAt)}
          </span>
        </CardFooter>
      </Card>
    </a>
  );
}
