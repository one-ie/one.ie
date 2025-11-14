/**
 * Product Feed API
 *
 * Exports products in OpenAI Product Feed Spec format
 * Supports JSON, CSV, TSV, XML via query param ?format=json|csv|tsv|xml
 *
 * Endpoint: GET /api/commerce/feed.json?format=json
 *
 * Update frequency: Every 15 minutes (cached)
 */

import type { APIRoute } from 'astro';
import { getAllProducts } from '@/lib/data/products-multi-category';
import {
  generateProductFeed,
  exportProductFeed,
  getContentType,
  getFileExtension,
} from '@/lib/utils/product-feed-generator';
import type { ProductFeedFormat } from '@/lib/types/product-feed';

// Merchant configuration
const MERCHANT_INFO = {
  name: 'ONE Platform',
  id: 'merchant_one_platform',
  url: 'https://one.ie',
  privacyPolicy: 'https://one.ie/privacy',
  tos: 'https://one.ie/terms',
  returnPolicy: 'https://one.ie/returns',
  returnWindow: 30, // days
};

// Cache configuration (15 minutes per ACP spec)
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds
let cachedFeed: any = null;
let cacheTimestamp = 0;

export const GET: APIRoute = async ({ url }) => {
  try {
    // Get format from query param (default: json)
    const format = (url.searchParams.get('format') || 'json') as ProductFeedFormat;

    // Validate format
    if (!['json', 'csv', 'tsv', 'xml'].includes(format)) {
      return new Response(
        JSON.stringify({
          error: 'Invalid format. Supported: json, csv, tsv, xml',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Check cache
    const now = Date.now();
    if (cachedFeed && now - cacheTimestamp < CACHE_DURATION) {
      // Return cached feed in requested format
      const output = exportProductFeed(cachedFeed, format);
      return new Response(output, {
        status: 200,
        headers: {
          'Content-Type': getContentType(format),
          'Cache-Control': `public, max-age=${Math.floor(CACHE_DURATION / 1000)}`,
          'X-Cache': 'HIT',
          'X-Generated-At': new Date(cacheTimestamp).toISOString(),
        },
      });
    }

    // Generate fresh feed
    const products = getAllProducts();
    const feed = generateProductFeed(products, MERCHANT_INFO);

    // Update cache
    cachedFeed = feed;
    cacheTimestamp = now;

    // Export in requested format
    const output = exportProductFeed(feed, format);

    return new Response(output, {
      status: 200,
      headers: {
        'Content-Type': getContentType(format),
        'Cache-Control': `public, max-age=${Math.floor(CACHE_DURATION / 1000)}`,
        'X-Cache': 'MISS',
        'X-Generated-At': new Date(cacheTimestamp).toISOString(),
        'X-Total-Products': feed.meta.total_products.toString(),
      },
    });
  } catch (error) {
    console.error('Product feed error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to generate product feed',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

// Prefetch handler for faster responses
export const prerender = false;
