/**
 * Component Semantic Search Service
 *
 * CYCLE 6: Semantic search for components using embeddings
 *
 * Provides natural language component discovery:
 * - "pricing table" → finds pricing components
 * - "dark mode toggle" → finds theme switchers
 * - "user avatar" → finds avatar components
 *
 * Usage:
 *   import { searchComponents } from '@/lib/services/component-search';
 *
 *   const results = await searchComponents("pricing table");
 *   // returns: [{ name, path, description, score }]
 */

import { Effect } from "effect";
import { createOpenAI } from "@ai-sdk/openai";
import { embed } from "ai";
import type { DataProvider } from "../providers/DataProvider";

// ============================================================================
// TYPES
// ============================================================================

export interface ComponentSearchResult {
  id: string;
  name: string;
  path: string;
  relativePath: string;
  description: string;
  category: string;
  props?: string[];
  score: number;
  metadata?: Record<string, unknown>;
}

export interface ComponentSearchOptions {
  limit?: number;
  category?: string;
  minScore?: number;
}

// ============================================================================
// EMBEDDING GENERATION
// ============================================================================

/**
 * Generate embedding for search query
 */
async function generateQueryEmbedding(query: string): Promise<number[]> {
  const apiKey = import.meta.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY not configured");
  }

  const openai = createOpenAI({ apiKey });

  const result = await embed({
    model: openai.embedding("text-embedding-3-large"),
    value: query,
  });

  return result.embedding;
}

// ============================================================================
// SEARCH FUNCTION
// ============================================================================

/**
 * Search components by natural language query
 *
 * @param query - Natural language search query (e.g., "pricing table")
 * @param options - Search options (limit, category filter, min score)
 * @returns Array of matching components with scores
 *
 * @example
 * ```typescript
 * const results = await searchComponents("dark mode toggle", { limit: 5 });
 * console.log(results[0].name); // "ThemeToggle"
 * console.log(results[0].path); // "src/components/ui/theme-toggle.tsx"
 * ```
 */
export async function searchComponents(
  query: string,
  options: ComponentSearchOptions = {}
): Promise<ComponentSearchResult[]> {
  const { limit = 5, category, minScore = 0.5 } = options;

  // 1. Generate embedding for query
  const queryEmbedding = await generateQueryEmbedding(query);

  // 2. Search knowledge base
  // NOTE: This requires provider context - see searchComponentsWithProvider
  console.warn("searchComponents requires DataProvider context. Use searchComponentsWithProvider instead.");

  return [];
}

/**
 * Search components with DataProvider context (Effect.ts)
 *
 * @param provider - DataProvider instance
 * @param query - Natural language search query
 * @param options - Search options
 * @returns Effect that yields search results
 *
 * @example
 * ```typescript
 * const searchEffect = searchComponentsWithProvider(provider, "pricing table");
 * const results = await Effect.runPromise(searchEffect);
 * ```
 */
export function searchComponentsWithProvider(
  provider: DataProvider,
  query: string,
  options: ComponentSearchOptions = {}
) {
  return Effect.gen(function* () {
    const { limit = 5, category, minScore = 0.5 } = options;

    // 1. Generate embedding for query
    const queryEmbedding = yield* Effect.tryPromise({
      try: () => generateQueryEmbedding(query),
      catch: (error) => new Error(`Failed to generate embedding: ${String(error)}`),
    });

    // 2. Search knowledge base (vector search)
    const searchOptions = {
      knowledgeType: "chunk" as const,
      limit: limit * 2, // Get more results to filter
    };

    const knowledge = yield* provider.knowledge.search(queryEmbedding, searchOptions);

    // 3. Filter component embeddings
    const componentResults = knowledge
      .filter((k) => {
        // Must have component metadata
        const metadata = k.metadata as any;
        if (metadata?.type !== "component") return false;

        // Category filter
        if (category && metadata.category !== category) return false;

        return true;
      })
      .map((k) => {
        const metadata = k.metadata as any;

        return {
          id: k._id,
          name: metadata.name || "Unknown",
          path: metadata.filePath || "",
          relativePath: metadata.relativePath || "",
          description: metadata.description || "",
          category: metadata.category || "general",
          props: metadata.props,
          score: k._score || 0,
          metadata: metadata,
        };
      })
      .filter((r) => r.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return componentResults;
  });
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get component suggestions for category
 */
export function getComponentSuggestions(category: string) {
  const suggestions: Record<string, string[]> = {
    ui: [
      "button component",
      "input field",
      "card layout",
      "dialog modal",
      "dropdown menu",
      "form component",
    ],
    dashboard: [
      "analytics chart",
      "statistics card",
      "activity feed",
      "data table",
      "metrics display",
    ],
    ai: [
      "chat interface",
      "message bubble",
      "streaming response",
      "ai assistant",
    ],
    shop: [
      "product card",
      "pricing table",
      "checkout form",
      "cart display",
      "payment button",
    ],
  };

  return suggestions[category] || [];
}

/**
 * Format search results for display
 */
export function formatSearchResults(results: ComponentSearchResult[]): string {
  if (results.length === 0) {
    return "No components found.";
  }

  return results
    .map((r, i) => {
      const emoji = i === 0 ? "🏆" : i === 1 ? "🥈" : i === 2 ? "🥉" : "📦";
      const score = (r.score * 100).toFixed(1);
      return `${emoji} ${r.name} (${score}%)\n   ${r.description}\n   ${r.relativePath}`;
    })
    .join("\n\n");
}

// ============================================================================
// SAMPLE QUERIES (for testing)
// ============================================================================

export const SAMPLE_QUERIES = [
  "pricing table",
  "dark mode toggle",
  "user avatar",
  "navigation menu",
  "search input",
  "analytics chart",
  "product card",
  "login form",
  "file upload",
  "notification badge",
];
