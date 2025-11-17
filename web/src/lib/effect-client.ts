/**
 * Effect.ts Client-Side Utilities
 *
 * Provides helpers for running Effect programs with DataProvider layer on the client side.
 */

import { ConvexReactClient } from "convex/react";
import { createDataProvider, createDataProviderLayer } from "@/providers/factory";

/**
 * Get the DataProvider layer for client-side use
 *
 * Creates a Convex client from the PUBLIC_CONVEX_URL environment variable
 * and returns an Effect Layer for dependency injection.
 */
export function getDataProviderLayer() {
  const convexUrl = import.meta.env.PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    throw new Error("PUBLIC_CONVEX_URL environment variable is not set");
  }

  const convexClient = new ConvexReactClient(convexUrl);
  const provider = createDataProvider({
    type: "convex",
    client: convexClient,
  });

  return createDataProviderLayer(provider);
}

/**
 * Singleton instance of the provider layer for client-side use
 */
let cachedLayer: ReturnType<typeof createDataProviderLayer> | null = null;

export function getOrCreateDataProviderLayer() {
  if (!cachedLayer) {
    cachedLayer = getDataProviderLayer();
  }
  return cachedLayer;
}
