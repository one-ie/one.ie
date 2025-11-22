/**
 * AI Image Suggestion Engine
 *
 * Suggests and generates images for funnel pages based on:
 * - Page type (landing, sales, checkout, thank-you)
 * - Industry/niche
 * - Style preferences
 * - Brand colors
 */

export type PageType = 'landing' | 'sales' | 'checkout' | 'thank-you';
export type ImageStyle = 'professional' | 'casual' | 'modern' | 'minimal';
export type AspectRatio = '16:9' | '1:1' | '4:3' | '9:16';
export type ImageSource = 'stock' | 'ai-generated' | 'template' | 'user-upload';

export interface ImageSuggestion {
  id: string;
  url: string;
  thumbnail: string;
  source: ImageSource;
  alt: string;
  title: string;
  tags: string[];
  aspectRatio: AspectRatio;
  author?: {
    name: string;
    url?: string;
  };
  downloadUrl?: string;
}

export interface ImageSuggestionRequest {
  pageType: PageType;
  industry: string;
  style: ImageStyle;
  aspectRatio?: AspectRatio;
  keywords?: string[];
  brandColors?: string[];
  limit?: number;
}

// ============================================================================
// KEYWORD GENERATION
// ============================================================================

/**
 * Generate search keywords based on page type and industry
 */
export function generateSearchKeywords(
  pageType: PageType,
  industry: string,
  style: ImageStyle
): string[] {
  const baseKeywords: Record<PageType, string[]> = {
    landing: ['hero', 'banner', 'header', 'hero image', 'welcome'],
    sales: ['product', 'showcase', 'professional', 'business', 'commercial'],
    checkout: ['payment', 'secure', 'trust', 'checkout', 'cart'],
    'thank-you': ['success', 'celebration', 'thank you', 'happy', 'achievement'],
  };

  const styleKeywords: Record<ImageStyle, string[]> = {
    professional: ['professional', 'business', 'corporate', 'formal'],
    casual: ['casual', 'friendly', 'relaxed', 'informal'],
    modern: ['modern', 'contemporary', 'sleek', 'minimalist'],
    minimal: ['minimal', 'simple', 'clean', 'elegant'],
  };

  // Combine page type, industry, and style keywords
  const keywords = [
    ...baseKeywords[pageType],
    industry,
    ...styleKeywords[style],
  ];

  return keywords;
}

/**
 * Generate AI image prompt from keywords and context
 */
export function generateImagePrompt(
  pageType: PageType,
  industry: string,
  style: ImageStyle,
  aspectRatio: AspectRatio = '16:9'
): string {
  const styleDescriptions: Record<ImageStyle, string> = {
    professional: 'professional, high-quality, business-focused',
    casual: 'casual, friendly, approachable',
    modern: 'modern, sleek, contemporary design',
    minimal: 'minimalist, clean, simple composition',
  };

  const pageDescriptions: Record<PageType, string> = {
    landing:
      'compelling hero image that captures attention and conveys value',
    sales: 'product showcase image that builds trust and desire',
    checkout: 'reassuring image that builds confidence in the purchase',
    'thank-you':
      'celebratory image that makes customers feel appreciated and successful',
  };

  return `Create a ${styleDescriptions[style]} ${pageDescriptions[pageType]} for a ${industry} business. Aspect ratio: ${aspectRatio}. High resolution, suitable for web use.`;
}

// ============================================================================
// ALT TEXT GENERATION
// ============================================================================

/**
 * Generate descriptive alt text for accessibility
 */
export function generateAltText(
  pageType: PageType,
  industry: string,
  keywords: string[]
): string {
  const context = keywords.slice(0, 3).join(', ');
  return `${industry} ${pageType} page featuring ${context}`;
}

// ============================================================================
// COLOR EXTRACTION
// ============================================================================

/**
 * Extract dominant colors from image (client-side)
 * Returns array of hex colors
 */
export async function extractImageColors(
  imageUrl: string
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Resize to small size for faster processing
        canvas.width = 100;
        canvas.height = 100;
        ctx.drawImage(img, 0, 0, 100, 100);

        const imageData = ctx.getImageData(0, 0, 100, 100);
        const colors = extractDominantColors(imageData.data);

        resolve(colors);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageUrl;
  });
}

/**
 * Extract dominant colors from image data
 */
function extractDominantColors(data: Uint8ClampedArray): string[] {
  const colorCounts: Map<string, number> = new Map();

  // Sample every 10th pixel for performance
  for (let i = 0; i < data.length; i += 40) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    // Skip transparent pixels
    if (a < 128) continue;

    // Convert to hex
    const hex = rgbToHex(r, g, b);

    // Count occurrences
    colorCounts.set(hex, (colorCounts.get(hex) || 0) + 1);
  }

  // Sort by frequency and return top 5
  return Array.from(colorCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([color]) => color);
}

/**
 * Convert RGB to hex color
 */
function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}

// ============================================================================
// IMAGE OPTIMIZATION
// ============================================================================

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

/**
 * Get optimized image URL (for Unsplash, Cloudinary, etc.)
 */
export function getOptimizedImageUrl(
  originalUrl: string,
  options: ImageOptimizationOptions = {}
): string {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 85,
    format = 'webp',
  } = options;

  // Unsplash optimization
  if (originalUrl.includes('unsplash.com')) {
    const url = new URL(originalUrl);
    url.searchParams.set('w', maxWidth.toString());
    url.searchParams.set('h', maxHeight.toString());
    url.searchParams.set('q', quality.toString());
    url.searchParams.set('fm', format);
    url.searchParams.set('fit', 'crop');
    return url.toString();
  }

  // Add support for other services here (Cloudinary, etc.)

  return originalUrl;
}

// ============================================================================
// SMART SUGGESTIONS
// ============================================================================

/**
 * Score images based on relevance to request
 */
export function scoreImageRelevance(
  image: ImageSuggestion,
  request: ImageSuggestionRequest
): number {
  let score = 0;

  // Keyword matching
  const keywords = request.keywords || [];
  const imageTags = image.tags.map((t) => t.toLowerCase());

  for (const keyword of keywords) {
    if (imageTags.some((tag) => tag.includes(keyword.toLowerCase()))) {
      score += 10;
    }
  }

  // Source preference (stock photos often better for professional use)
  if (request.style === 'professional' && image.source === 'stock') {
    score += 5;
  }

  // Aspect ratio match
  if (request.aspectRatio && image.aspectRatio === request.aspectRatio) {
    score += 15;
  }

  return score;
}

/**
 * Sort images by relevance
 */
export function sortImagesByRelevance(
  images: ImageSuggestion[],
  request: ImageSuggestionRequest
): ImageSuggestion[] {
  return images
    .map((image) => ({
      image,
      score: scoreImageRelevance(image, request),
    }))
    .sort((a, b) => b.score - a.score)
    .map(({ image }) => image);
}

// ============================================================================
// TEMPLATE IMAGES
// ============================================================================

/**
 * Get pre-designed template graphics for common use cases
 */
export function getTemplateImages(
  pageType: PageType,
  style: ImageStyle
): ImageSuggestion[] {
  // This would typically load from a CDN or asset library
  const templates: ImageSuggestion[] = [
    {
      id: 'template-gradient-1',
      url: '/images/templates/gradient-modern-1.webp',
      thumbnail: '/images/templates/gradient-modern-1-thumb.webp',
      source: 'template',
      alt: 'Modern gradient background',
      title: 'Modern Gradient',
      tags: ['gradient', 'modern', 'abstract'],
      aspectRatio: '16:9',
    },
    {
      id: 'template-minimal-1',
      url: '/images/templates/minimal-clean-1.webp',
      thumbnail: '/images/templates/minimal-clean-1-thumb.webp',
      source: 'template',
      alt: 'Minimal clean background',
      title: 'Clean Minimal',
      tags: ['minimal', 'clean', 'simple'],
      aspectRatio: '16:9',
    },
  ];

  return templates.filter(
    (t) => t.tags.includes(style) || t.tags.includes(pageType)
  );
}

// ============================================================================
// LAZY LOADING
// ============================================================================

/**
 * Generate lazy loading attributes for image
 */
export function getLazyLoadingAttributes() {
  return {
    loading: 'lazy' as const,
    decoding: 'async' as const,
  };
}

/**
 * Generate srcset for responsive images
 */
export function generateSrcSet(
  baseUrl: string,
  widths: number[] = [640, 768, 1024, 1280, 1536, 1920]
): string {
  return widths
    .map((width) => {
      const optimizedUrl = getOptimizedImageUrl(baseUrl, { maxWidth: width });
      return `${optimizedUrl} ${width}w`;
    })
    .join(', ');
}

// ============================================================================
// EXPORTS
// ============================================================================

export const imageSuggestions = {
  generateSearchKeywords,
  generateImagePrompt,
  generateAltText,
  extractImageColors,
  getOptimizedImageUrl,
  scoreImageRelevance,
  sortImagesByRelevance,
  getTemplateImages,
  getLazyLoadingAttributes,
  generateSrcSet,
};
