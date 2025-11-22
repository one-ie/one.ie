/**
 * Component Search API Endpoint
 *
 * CYCLE 6: API endpoint for semantic component search
 *
 * POST /api/components/search
 * Body: { query: string, limit?: number, category?: string }
 * Returns: { results: ComponentSearchResult[] }
 *
 * This endpoint:
 * 1. Receives search query from frontend
 * 2. Generates embedding for query
 * 3. Performs vector search in Convex knowledge table
 * 4. Returns top matching components
 */

import type { APIRoute } from "astro";
import { Effect } from "effect";
import { makeConvexProvider } from "@/providers/convex/ConvexProvider";
import { searchComponentsWithProvider } from "@/lib/services/component-search";

// ============================================================================
// API HANDLER
// ============================================================================

export const POST: APIRoute = async ({ request }) => {
  try {
    // 1. Parse request body
    const body = await request.json();
    const { query, limit = 5, category } = body;

    // Validate query
    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return new Response(
        JSON.stringify({
          error: "Query is required and must be a non-empty string",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 2. Get Convex URL from environment
    const convexUrl = import.meta.env.PUBLIC_CONVEX_URL;

    if (!convexUrl) {
      console.error("PUBLIC_CONVEX_URL not configured");
      return new Response(
        JSON.stringify({
          error: "Search service not configured",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 3. Initialize provider
    const provider = makeConvexProvider({ url: convexUrl });

    // 4. Perform search
    const searchEffect = searchComponentsWithProvider(provider, query, {
      limit,
      category,
    });

    const results = await Effect.runPromise(searchEffect);

    // 5. Return results
    return new Response(
      JSON.stringify({
        results,
        query,
        count: results.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Component search error:", error);

    return new Response(
      JSON.stringify({
        error: "Search failed",
        message: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

// ============================================================================
// GET handler for health check
// ============================================================================

export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({
      status: "ok",
      endpoint: "/api/components/search",
      method: "POST",
      description: "Semantic component search",
      example: {
        query: "pricing table",
        limit: 5,
        category: "ui",
      },
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
};
