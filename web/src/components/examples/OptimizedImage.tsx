/**
 * Optimized Image Component Example
 *
 * Demonstrates usage of the image optimization utilities
 * with automatic WebP/AVIF conversion, lazy loading, and responsive images.
 */

import { useEffect, useRef, useState } from 'react';
import { LazyImageLoader, generateResponsiveSources, getBestFormat } from '@/lib/performance/image-optimizer';

interface OptimizedImageProps {
  src: string;
  alt: string;
  /** Widths for responsive images (default: [640, 768, 1024, 1280]) */
  widths?: number[];
  /** Image quality 1-100 (default: 85) */
  quality?: number;
  /** Enable lazy loading (default: true) */
  lazy?: boolean;
  /** CDN base URL */
  cdnUrl?: string;
  /** Additional CSS classes */
  className?: string;
  /** Priority image (preload, no lazy) */
  priority?: boolean;
}

/**
 * Optimized Image Component
 *
 * Features:
 * - Auto-detects best format (AVIF > WebP > JPG)
 * - Generates responsive srcSet
 * - Lazy loads by default
 * - Supports CDN
 * - Shows loading state
 */
export function OptimizedImage({
  src,
  alt,
  widths = [640, 768, 1024, 1280],
  quality = 85,
  lazy = true,
  cdnUrl = '',
  className = '',
  priority = false,
}: OptimizedImageProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [format, setFormat] = useState<'avif' | 'webp' | 'jpg'>('webp');

  // Detect best supported format
  useEffect(() => {
    getBestFormat().then(setFormat);
  }, []);

  // Set up lazy loading
  useEffect(() => {
    if (!lazy || priority || !imgRef.current) return;

    const loader = new LazyImageLoader();
    loader.observe(imgRef.current);

    return () => {
      if (imgRef.current) {
        loader.unobserve(imgRef.current);
      }
      loader.disconnect();
    };
  }, [lazy, priority]);

  // Generate optimized sources
  const optimized = generateResponsiveSources(src, {
    widths,
    format,
    quality,
    lazy: lazy && !priority,
    cdnUrl,
  });

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Loading placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}

      {/* Optimized image */}
      <img
        ref={imgRef}
        src={optimized.src}
        srcSet={optimized.srcSet}
        sizes={optimized.sizes}
        alt={alt}
        loading={optimized.loading}
        onLoad={() => setIsLoaded(true)}
        className={`
          w-full h-auto
          transition-opacity duration-300
          ${isLoaded ? 'opacity-100' : 'opacity-0'}
        `}
      />

      {/* Format badge (dev only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          {format.toUpperCase()}
        </div>
      )}
    </div>
  );
}

/**
 * Example: Product Gallery with Optimized Images
 */
export function ProductGallery({ images }: { images: string[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {images.map((src, index) => (
        <OptimizedImage
          key={src}
          src={src}
          alt={`Product image ${index + 1}`}
          widths={[320, 640, 768]}
          quality={85}
          lazy={index > 0} // First image eager, rest lazy
          priority={index === 0}
          className="rounded-lg"
        />
      ))}
    </div>
  );
}

/**
 * Example: Hero Image (Priority)
 */
export function HeroImage({ src, alt }: { src: string; alt: string }) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      widths={[768, 1024, 1280, 1536, 1920]}
      quality={90}
      priority={true} // Disable lazy loading for hero
      className="w-full h-auto"
    />
  );
}

/**
 * Example: Thumbnail (Small, Lazy)
 */
export function Thumbnail({ src, alt }: { src: string; alt: string }) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      widths={[128, 256]}
      quality={80}
      lazy={true}
      className="w-32 h-32 object-cover rounded"
    />
  );
}
