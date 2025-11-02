/**
 * Provider Factory - DEPRECATED
 *
 * This file is deprecated. Use `/src/providers/factory.ts` instead.
 *
 * The new DataProvider factory provides:
 * - Type-safe provider creation via `createDataProvider()`
 * - Effect.ts layer support via `createDataProviderLayer()`
 * - Default provider management via `getDefaultProvider()`
 * - Support for multiple backend types (Convex, WordPress, Notion, etc.)
 *
 * Migration Guide:
 * OLD: import { getProvider } from './lib/ontology/factory';
 * NEW: import { getDefaultProvider } from '@/providers/factory';
 *
 * See `/src/providers/factory.ts` for the current implementation.
 */

// This file is kept for backward compatibility but all functions are deprecated
import type { IOntologyProvider } from "./types";

/**
 * @deprecated Use `getDefaultProvider()` from `@/providers/factory` instead
 */
export async function getProvider(): Promise<IOntologyProvider | null> {
  console.warn(
    "getProvider() is deprecated. Use getDefaultProvider() from @/providers/factory instead."
  );
  return null;
}

/**
 * @deprecated Use `createDataProvider()` from `@/providers/factory` instead
 */
export async function createConvexProvider(
  url: string,
  userId?: string
): Promise<IOntologyProvider> {
  console.warn(
    "createConvexProvider() is deprecated. Use createDataProvider() from @/providers/factory instead."
  );
  throw new Error(
    "ConvexProvider moved to @/providers/factory. Update your imports."
  );
}

/**
 * @deprecated Use `createDataProvider()` from `@/providers/factory` instead
 */
export async function createHTTPProvider(
  baseUrl: string
): Promise<IOntologyProvider> {
  console.warn(
    "createHTTPProvider() is deprecated. Use createDataProvider() from @/providers/factory instead."
  );
  throw new Error(
    "HTTPProvider moved to @/providers/factory. Update your imports."
  );
}

/**
 * @deprecated Use `createDataProvider()` from `@/providers/factory` instead
 */
export async function createMarkdownProvider(
  contentDir: string
): Promise<IOntologyProvider> {
  console.warn(
    "createMarkdownProvider() is deprecated. Use createDataProvider() from @/providers/factory instead."
  );
  throw new Error(
    "MarkdownProvider moved to @/providers/factory. Update your imports."
  );
}
