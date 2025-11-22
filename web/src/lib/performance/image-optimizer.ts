/**
 * Image Optimization Utilities
 *
 * Provides tools for:
 * - Auto-conversion to WebP/AVIF
 * - Lazy loading with intersection observer
 * - Responsive image generation
 * - Image compression and optimization
 * - CDN URL generation
 */

export interface ImageOptimizationConfig {
  /** Target width(s) for responsive images */
  widths?: number[];
  /** Image format (webp, avif, auto) */
  format?: 'webp' | 'avif' | 'auto';
  /** Quality (1-100) */
  quality?: number;
  /** Enable lazy loading */
  lazy?: boolean;
  /** CDN base URL */
  cdnUrl?: string;
  /** Placeholder strategy */
  placeholder?: 'blur' | 'dominant-color' | 'none';
}

export interface OptimizedImage {
  src: string;
  srcSet: string;
  sizes: string;
  width: number;
  height: number;
  format: string;
  placeholder?: string;
  loading: 'lazy' | 'eager';
}

/**
 * Generate optimized image URLs for different screen sizes
 */
export function generateResponsiveSources(
  src: string,
  config: ImageOptimizationConfig = {}
): OptimizedImage {
  const {
    widths = [640, 768, 1024, 1280, 1536],
    format = 'webp',
    quality = 85,
    lazy = true,
    cdnUrl = '',
  } = config;

  // Generate srcSet for responsive images
  const srcSet = widths
    .map(width => {
      const url = generateOptimizedUrl(src, { width, format, quality, cdnUrl });
      return `${url} ${width}w`;
    })
    .join(', ');

  // Generate sizes attribute
  const sizes = widths
    .map((width, index) => {
      if (index === widths.length - 1) return `${width}px`;
      return `(max-width: ${width}px) ${width}px`;
    })
    .join(', ');

  return {
    src: generateOptimizedUrl(src, { width: widths[widths.length - 1], format, quality, cdnUrl }),
    srcSet,
    sizes,
    width: widths[widths.length - 1],
    height: 0, // Will be calculated from aspect ratio
    format,
    loading: lazy ? 'lazy' : 'eager',
  };
}

/**
 * Generate optimized image URL with CDN support
 */
export function generateOptimizedUrl(
  src: string,
  options: {
    width?: number;
    height?: number;
    format?: string;
    quality?: number;
    cdnUrl?: string;
  } = {}
): string {
  const { width, height, format = 'webp', quality = 85, cdnUrl = '' } = options;

  // If using Cloudflare Images or similar CDN
  if (cdnUrl) {
    const params = new URLSearchParams();
    if (width) params.set('width', width.toString());
    if (height) params.set('height', height.toString());
    params.set('format', format);
    params.set('quality', quality.toString());

    return `${cdnUrl}/${src}?${params.toString()}`;
  }

  // For Astro's built-in image optimization
  const params = new URLSearchParams();
  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  params.set('f', format);
  params.set('q', quality.toString());

  return `/_image?href=${encodeURIComponent(src)}&${params.toString()}`;
}

/**
 * Lazy load images using Intersection Observer
 */
export class LazyImageLoader {
  private observer: IntersectionObserver | null = null;
  private images: Set<HTMLImageElement> = new Set();

  constructor(
    private options: IntersectionObserverInit = {
      root: null,
      rootMargin: '50px',
      threshold: 0.01,
    }
  ) {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(this.handleIntersection.bind(this), options);
    }
  }

  /**
   * Observe an image element for lazy loading
   */
  observe(img: HTMLImageElement): void {
    if (!this.observer) {
      // Fallback: Load immediately if IntersectionObserver not supported
      this.loadImage(img);
      return;
    }

    this.images.add(img);
    this.observer.observe(img);
  }

  /**
   * Stop observing an image
   */
  unobserve(img: HTMLImageElement): void {
    if (this.observer) {
      this.observer.unobserve(img);
    }
    this.images.delete(img);
  }

  /**
   * Handle intersection events
   */
  private handleIntersection(entries: IntersectionObserverEntry[]): void {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        this.loadImage(img);
        this.unobserve(img);
      }
    });
  }

  /**
   * Load an image by swapping data-src to src
   */
  private loadImage(img: HTMLImageElement): void {
    const src = img.dataset.src;
    const srcset = img.dataset.srcset;

    if (src) {
      img.src = src;
      img.removeAttribute('data-src');
    }

    if (srcset) {
      img.srcset = srcset;
      img.removeAttribute('data-srcset');
    }

    // Add loaded class for CSS transitions
    img.classList.add('lazy-loaded');
  }

  /**
   * Disconnect observer and clean up
   */
  disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.images.clear();
  }
}

/**
 * Generate blur placeholder using canvas
 */
export async function generateBlurPlaceholder(
  src: string,
  width: number = 20,
  height: number = 20
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/webp', 0.1));
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}

/**
 * Extract dominant color from image
 */
export async function getDominantColor(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      resolve(`rgb(${r}, ${g}, ${b})`);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}

/**
 * Preload critical images
 */
export function preloadImage(src: string, options: { as?: string; type?: string } = {}): void {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = options.as || 'image';
  link.href = src;

  if (options.type) {
    link.type = options.type;
  }

  document.head.appendChild(link);
}

/**
 * Preload multiple images
 */
export function preloadImages(sources: string[]): void {
  sources.forEach(src => preloadImage(src));
}

/**
 * Check if WebP is supported
 */
export async function supportsWebP(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(img.width > 0 && img.height > 0);
    img.onerror = () => resolve(false);
    img.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
  });
}

/**
 * Check if AVIF is supported
 */
export async function supportsAVIF(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(img.width > 0 && img.height > 0);
    img.onerror = () => resolve(false);
    img.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';
  });
}

/**
 * Get best supported format
 */
export async function getBestFormat(): Promise<'avif' | 'webp' | 'jpg'> {
  const [avif, webp] = await Promise.all([supportsAVIF(), supportsWebP()]);

  if (avif) return 'avif';
  if (webp) return 'webp';
  return 'jpg';
}

/**
 * Calculate image file size reduction
 */
export interface ImageStats {
  originalSize: number;
  optimizedSize: number;
  reduction: number;
  reductionPercent: number;
}

export async function calculateImageSavings(
  originalUrl: string,
  optimizedUrl: string
): Promise<ImageStats> {
  const [originalRes, optimizedRes] = await Promise.all([
    fetch(originalUrl, { method: 'HEAD' }),
    fetch(optimizedUrl, { method: 'HEAD' }),
  ]);

  const originalSize = parseInt(originalRes.headers.get('content-length') || '0');
  const optimizedSize = parseInt(optimizedRes.headers.get('content-length') || '0');
  const reduction = originalSize - optimizedSize;
  const reductionPercent = (reduction / originalSize) * 100;

  return {
    originalSize,
    optimizedSize,
    reduction,
    reductionPercent,
  };
}
