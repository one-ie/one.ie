/**
 * HeroVideo Component
 *
 * A hero section with video background or embedded video player.
 * Perfect for product demos, brand stories, and immersive experiences.
 *
 * Features:
 * - Video background with overlay
 * - Autoplay and loop support
 * - Responsive video sizing
 * - Text overlay with contrast
 * - Play/pause controls (optional)
 * - Dark mode overlay
 *
 * Semantic tags: hero, video, background, media, immersive, demo
 */

'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause } from 'lucide-react';
import { useState, useRef } from 'react';

export interface HeroVideoProps {
  badge?: string;
  headline: string;
  subheadline: string;
  primaryCTA: {
    text: string;
    href: string;
  };
  video: {
    src: string;
    poster?: string;
  };
  showControls?: boolean;
  overlayOpacity?: number; // 0-100
  className?: string;
}

export function HeroVideo({
  badge,
  headline,
  subheadline,
  primaryCTA,
  video,
  showControls = false,
  overlayOpacity = 60,
  className = '',
}: HeroVideoProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <section className={`relative min-h-[700px] flex items-center justify-center overflow-hidden ${className}`}>
      {/* Video Background */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        poster={video.poster}
      >
        <source src={video.src} type="video/mp4" />
      </video>

      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black"
        style={{ opacity: overlayOpacity / 100 }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center px-4 space-y-8">
        {badge && (
          <Badge variant="secondary" className="text-sm font-medium bg-white/90 text-foreground">
            {badge}
          </Badge>
        )}

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight text-white">
          {headline}
        </h1>

        <p className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed">
          {subheadline}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <a href={primaryCTA.href}>
            <Button size="lg" className="text-lg px-8 h-12">
              {primaryCTA.text}
            </Button>
          </a>

          {showControls && (
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 h-12 bg-white/10 border-white/30 text-white hover:bg-white/20"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <>
                  <Pause className="mr-2 h-5 w-5" />
                  Pause Video
                </>
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5" />
                  Play Video
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
