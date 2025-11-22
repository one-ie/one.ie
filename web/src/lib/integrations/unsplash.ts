/**
 * Unsplash Integration
 *
 * Free stock photo API integration for funnel builder
 * https://unsplash.com/developers
 */

import type { ImageSuggestion, AspectRatio } from '@/lib/ai/image-suggestions';

const UNSPLASH_API_URL = 'https://api.unsplash.com';
const UNSPLASH_ACCESS_KEY = import.meta.env.PUBLIC_UNSPLASH_ACCESS_KEY || '';

export interface UnsplashPhoto {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string | null;
  description: string | null;
  user: {
    name: string;
    username: string;
    links: {
      html: string;
    };
  };
  links: {
    html: string;
    download: string;
    download_location: string;
  };
  width: number;
  height: number;
  color: string;
  tags?: Array<{ title: string }>;
}

export interface UnsplashSearchParams {
  query: string;
  page?: number;
  perPage?: number;
  orientation?: 'landscape' | 'portrait' | 'squarish';
  color?: string;
}

// ============================================================================
// API REQUESTS
// ============================================================================

/**
 * Search Unsplash photos
 */
export async function searchUnsplashPhotos(
  params: UnsplashSearchParams
): Promise<UnsplashPhoto[]> {
  if (!UNSPLASH_ACCESS_KEY) {
    console.warn('Unsplash API key not configured. Using fallback images.');
    return getFallbackImages(params.query);
  }

  const { query, page = 1, perPage = 10, orientation, color } = params;

  const url = new URL(`${UNSPLASH_API_URL}/search/photos`);
  url.searchParams.set('query', query);
  url.searchParams.set('page', page.toString());
  url.searchParams.set('per_page', perPage.toString());

  if (orientation) {
    url.searchParams.set('orientation', orientation);
  }

  if (color) {
    url.searchParams.set('color', color);
  }

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Failed to fetch from Unsplash:', error);
    return getFallbackImages(query);
  }
}

/**
 * Get random Unsplash photo
 */
export async function getRandomUnsplashPhoto(
  query?: string
): Promise<UnsplashPhoto | null> {
  if (!UNSPLASH_ACCESS_KEY) {
    const fallback = getFallbackImages(query || 'random');
    return fallback[0] || null;
  }

  const url = new URL(`${UNSPLASH_API_URL}/photos/random`);

  if (query) {
    url.searchParams.set('query', query);
  }

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch random photo from Unsplash:', error);
    return null;
  }
}

/**
 * Download photo (triggers Unsplash download tracking)
 */
export async function triggerUnsplashDownload(
  downloadLocation: string
): Promise<void> {
  if (!UNSPLASH_ACCESS_KEY) return;

  try {
    await fetch(downloadLocation, {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    });
  } catch (error) {
    console.error('Failed to trigger Unsplash download:', error);
  }
}

// ============================================================================
// CONVERSION TO IMAGE SUGGESTIONS
// ============================================================================

/**
 * Convert Unsplash photo to ImageSuggestion format
 */
export function unsplashToImageSuggestion(
  photo: UnsplashPhoto
): ImageSuggestion {
  const aspectRatio = calculateAspectRatio(photo.width, photo.height);

  return {
    id: `unsplash-${photo.id}`,
    url: photo.urls.regular,
    thumbnail: photo.urls.thumb,
    source: 'stock',
    alt:
      photo.alt_description ||
      photo.description ||
      'Stock photo from Unsplash',
    title: photo.description || photo.alt_description || 'Unsplash Photo',
    tags: photo.tags?.map((t) => t.title) || [],
    aspectRatio,
    author: {
      name: photo.user.name,
      url: photo.user.links.html,
    },
    downloadUrl: photo.links.download_location,
  };
}

/**
 * Calculate aspect ratio from dimensions
 */
function calculateAspectRatio(
  width: number,
  height: number
): AspectRatio {
  const ratio = width / height;

  // 16:9 (landscape)
  if (ratio >= 1.7 && ratio <= 1.8) return '16:9';

  // 4:3 (landscape)
  if (ratio >= 1.3 && ratio <= 1.35) return '4:3';

  // 1:1 (square)
  if (ratio >= 0.95 && ratio <= 1.05) return '1:1';

  // 9:16 (portrait)
  if (ratio >= 0.55 && ratio <= 0.6) return '9:16';

  // Default to closest match
  if (ratio > 1) return '16:9';
  return '9:16';
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get orientation from aspect ratio
 */
export function getOrientationFromAspectRatio(
  aspectRatio?: AspectRatio
): 'landscape' | 'portrait' | 'squarish' | undefined {
  if (!aspectRatio) return undefined;

  switch (aspectRatio) {
    case '16:9':
    case '4:3':
      return 'landscape';
    case '9:16':
      return 'portrait';
    case '1:1':
      return 'squarish';
    default:
      return undefined;
  }
}

/**
 * Search for images with keywords
 */
export async function searchImages(
  keywords: string[],
  options: {
    limit?: number;
    aspectRatio?: AspectRatio;
    color?: string;
  } = {}
): Promise<ImageSuggestion[]> {
  const { limit = 10, aspectRatio, color } = options;

  const query = keywords.join(' ');
  const orientation = getOrientationFromAspectRatio(aspectRatio);

  const photos = await searchUnsplashPhotos({
    query,
    perPage: limit,
    orientation,
    color,
  });

  return photos.map(unsplashToImageSuggestion);
}

// ============================================================================
// FALLBACK IMAGES (when Unsplash API not available)
// ============================================================================

/**
 * Get fallback images using placeholder service
 */
function getFallbackImages(query: string): UnsplashPhoto[] {
  // Use placeholder images when Unsplash API is not available
  const placeholders: UnsplashPhoto[] = [];

  for (let i = 1; i <= 6; i++) {
    const width = 1920;
    const height = 1080;
    const seed = query + i;

    placeholders.push({
      id: `fallback-${seed}-${i}`,
      urls: {
        raw: `https://picsum.photos/seed/${seed}/${width}/${height}`,
        full: `https://picsum.photos/seed/${seed}/${width}/${height}`,
        regular: `https://picsum.photos/seed/${seed}/1280/720`,
        small: `https://picsum.photos/seed/${seed}/640/360`,
        thumb: `https://picsum.photos/seed/${seed}/200/120`,
      },
      alt_description: `Placeholder image for ${query}`,
      description: `Placeholder image ${i}`,
      user: {
        name: 'Placeholder',
        username: 'placeholder',
        links: {
          html: 'https://picsum.photos',
        },
      },
      links: {
        html: 'https://picsum.photos',
        download: `https://picsum.photos/seed/${seed}/${width}/${height}`,
        download_location: `https://picsum.photos/seed/${seed}/${width}/${height}`,
      },
      width,
      height,
      color: '#cccccc',
      tags: [{ title: query }],
    });
  }

  return placeholders;
}

// ============================================================================
// EXPORTS
// ============================================================================

export const unsplash = {
  search: searchUnsplashPhotos,
  getRandom: getRandomUnsplashPhoto,
  triggerDownload: triggerUnsplashDownload,
  searchImages,
  toImageSuggestion: unsplashToImageSuggestion,
};
