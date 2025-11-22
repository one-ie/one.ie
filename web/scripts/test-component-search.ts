#!/usr/bin/env bun
/**
 * Test Component Semantic Search
 *
 * CYCLE 6: Test semantic search with sample queries
 *
 * This script tests the component search functionality with
 * predefined queries to ensure embeddings work correctly.
 *
 * Usage:
 *   bun run scripts/test-component-search.ts
 *   bun run scripts/test-component-search.ts "your custom query"
 *
 * Prerequisites:
 *   1. Run generate-component-embeddings.ts
 *   2. Run upload-embeddings-to-convex.ts
 *   3. Set OPENAI_API_KEY and CONVEX_URL
 */

import { Effect } from "effect";
import { makeConvexProvider } from "../src/lib/providers/convex/ConvexProvider";
import {
  searchComponentsWithProvider,
  formatSearchResults,
  SAMPLE_QUERIES,
} from "../src/lib/services/component-search";

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONVEX_URL = process.env.PUBLIC_CONVEX_URL || process.env.CONVEX_URL;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!CONVEX_URL) {
  console.error("❌ Error: CONVEX_URL environment variable is required");
  process.exit(1);
}

if (!OPENAI_API_KEY) {
  console.error("❌ Error: OPENAI_API_KEY environment variable is required");
  process.exit(1);
}

// ============================================================================
// TEST FUNCTIONS
// ============================================================================

async function testSingleQuery(provider: ReturnType<typeof makeConvexProvider>, query: string) {
  console.log(`\n🔍 Query: "${query}"`);
  console.log("-".repeat(60));

  try {
    const searchEffect = searchComponentsWithProvider(provider, query, { limit: 5 });
    const results = await Effect.runPromise(searchEffect);

    if (results.length === 0) {
      console.log("   No results found.");
      return;
    }

    console.log(formatSearchResults(results));
  } catch (error) {
    console.error(`   ❌ Error: ${error}`);
  }
}

async function testAllSampleQueries(provider: ReturnType<typeof makeConvexProvider>) {
  console.log("\n📊 Testing all sample queries...");
  console.log("=".repeat(60));

  for (const query of SAMPLE_QUERIES) {
    await testSingleQuery(provider, query);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Rate limiting
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log("🚀 Component Search Test - CYCLE 6");
  console.log("=".repeat(60));
  console.log(`🔗 Convex URL: ${CONVEX_URL}`);
  console.log(`🤖 OpenAI API Key: ${OPENAI_API_KEY ? "✓ Set" : "❌ Missing"}`);
  console.log("=".repeat(60));

  // Initialize provider
  console.log("\n1️⃣ Connecting to Convex...");
  const provider = makeConvexProvider({ url: CONVEX_URL });
  console.log("   ✓ Connected");

  // Get custom query from CLI args or use samples
  const customQuery = process.argv[2];

  if (customQuery) {
    // Test single custom query
    await testSingleQuery(provider, customQuery);
  } else {
    // Test all sample queries
    await testAllSampleQueries(provider);
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ Component search test complete!");
  console.log("=".repeat(60));
  console.log("\n📌 Usage:");
  console.log("   Test custom query: bun run scripts/test-component-search.ts \"your query\"");
  console.log("   Test all samples: bun run scripts/test-component-search.ts");
}

// Run if called directly
if (import.meta.main) {
  main().catch((error) => {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  });
}

export { testSingleQuery, testAllSampleQueries };
