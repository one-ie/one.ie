#!/usr/bin/env bun
/**
 * Upload Component Embeddings to Convex
 *
 * CYCLE 6: Store component embeddings in Convex knowledge table
 *
 * This script reads component-embeddings.json and uploads to Convex
 * using the DataProvider interface.
 *
 * Usage:
 *   bun run scripts/upload-embeddings-to-convex.ts
 *
 * Prerequisites:
 *   1. Run generate-component-embeddings.ts first
 *   2. Set CONVEX_URL environment variable
 */

import { readFileSync } from "fs";
import { join } from "path";
import { makeConvexProvider } from "../src/lib/providers/convex/ConvexProvider";
import { Effect } from "effect";

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONVEX_URL = process.env.PUBLIC_CONVEX_URL || process.env.CONVEX_URL;
const EMBEDDINGS_FILE = join(process.cwd(), "component-embeddings.json");
const BATCH_SIZE = 10; // Upload 10 at a time

if (!CONVEX_URL) {
  console.error("❌ Error: CONVEX_URL environment variable is required");
  console.error("   Set PUBLIC_CONVEX_URL in .env.local");
  process.exit(1);
}

// ============================================================================
// TYPES
// ============================================================================

interface ComponentEmbeddingData {
  knowledgeType: "component";
  text: string;
  embedding: number[];
  embeddingModel: string;
  embeddingDim: number;
  metadata: {
    filePath: string;
    relativePath: string;
    name: string;
    description: string;
    category: string;
    props?: string[];
    imports?: string[];
    exports?: string[];
    generatedAt: string;
  };
  labels: string[];
}

// ============================================================================
// UPLOAD LOGIC
// ============================================================================

async function uploadEmbedding(
  provider: ReturnType<typeof makeConvexProvider>,
  data: ComponentEmbeddingData
): Promise<string> {
  const program = Effect.gen(function* () {
    // Create knowledge entry
    const knowledgeId = yield* provider.knowledge.create({
      knowledgeType: "chunk", // Use "chunk" type for component embeddings
      text: data.text,
      embedding: data.embedding,
      embeddingModel: data.embeddingModel,
      embeddingDim: data.embeddingDim,
      labels: data.labels,
      metadata: {
        ...data.metadata,
        type: "component",
      },
    });

    return knowledgeId;
  });

  return Effect.runPromise(program);
}

async function uploadBatch(
  provider: ReturnType<typeof makeConvexProvider>,
  batch: ComponentEmbeddingData[]
): Promise<string[]> {
  const results: string[] = [];

  for (const data of batch) {
    try {
      const id = await uploadEmbedding(provider, data);
      results.push(id);
      console.log(`  ✓ Uploaded: ${data.metadata.name} (${id})`);
    } catch (error) {
      console.error(`  ❌ Failed: ${data.metadata.name}`, error);
    }
  }

  return results;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log("🚀 Component Embeddings Upload - CYCLE 6");
  console.log("=".repeat(60));
  console.log(`📂 Reading: ${EMBEDDINGS_FILE}`);
  console.log(`🔗 Convex URL: ${CONVEX_URL}`);
  console.log("=".repeat(60));

  // 1. Read embeddings file
  console.log("\n1️⃣ Loading embeddings...");
  let embeddings: ComponentEmbeddingData[];
  try {
    const content = readFileSync(EMBEDDINGS_FILE, "utf-8");
    embeddings = JSON.parse(content);
    console.log(`   Found ${embeddings.length} embeddings`);
  } catch (error) {
    console.error("❌ Error reading embeddings file:", error);
    console.error("   Run generate-component-embeddings.ts first!");
    process.exit(1);
  }

  // 2. Initialize Convex provider
  console.log("\n2️⃣ Connecting to Convex...");
  const provider = makeConvexProvider({ url: CONVEX_URL });
  console.log("   ✓ Connected");

  // 3. Upload in batches
  console.log("\n3️⃣ Uploading embeddings...");
  console.log(`   Processing in batches of ${BATCH_SIZE}`);

  const uploadedIds: string[] = [];
  for (let i = 0; i < embeddings.length; i += BATCH_SIZE) {
    const batch = embeddings.slice(i, i + BATCH_SIZE);
    console.log(`\n📦 Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(embeddings.length / BATCH_SIZE)}`);

    const ids = await uploadBatch(provider, batch);
    uploadedIds.push(...ids);

    // Rate limiting: wait 500ms between batches
    if (i + BATCH_SIZE < embeddings.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  // 4. Summary
  console.log("\n" + "=".repeat(60));
  console.log("✅ Upload complete!");
  console.log("=".repeat(60));
  console.log(`\n📊 Statistics:`);
  console.log(`   Total attempted: ${embeddings.length}`);
  console.log(`   Successfully uploaded: ${uploadedIds.length}`);
  console.log(`   Failed: ${embeddings.length - uploadedIds.length}`);

  if (uploadedIds.length > 0) {
    console.log(`\n📌 Next steps:`);
    console.log(`   1. Test semantic search with sample queries`);
    console.log(`   2. Integrate search into UI components`);
    console.log(`   3. Create component discovery interface`);
  }
}

// Run if called directly
if (import.meta.main) {
  main().catch((error) => {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  });
}

export { uploadEmbedding, uploadBatch };
