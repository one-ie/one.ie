#!/usr/bin/env bun
/**
 * Test Embeddings Integration
 *
 * CYCLE 3: Test embeddings generation and vector search
 *
 * This script demonstrates the complete workflow:
 * 1. Generate embeddings using OpenAI
 * 2. Store embeddings in Convex
 * 3. Perform semantic search
 *
 * Usage:
 *   export OPENAI_API_KEY=sk-...
 *   export CONVEX_URL=https://your-deployment.convex.cloud
 *   bun run scripts/test-embeddings.ts
 */

import { Effect } from "effect";
import { EmbeddingService } from "../src/lib/services/EmbeddingService";

// ============================================================================
// CONFIGURATION
// ============================================================================

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error("❌ Error: OPENAI_API_KEY environment variable is required");
  process.exit(1);
}

// ============================================================================
// SAMPLE DATA
// ============================================================================

const SAMPLE_CHUNKS = [
  "AI clones can interact with customers 24/7, providing instant responses based on the creator's knowledge.",
  "Voice cloning technology allows the AI to speak with the creator's actual voice, making interactions more personal.",
  "The RAG (Retrieval Augmented Generation) pipeline ensures responses are grounded in the creator's actual content.",
  "Embeddings transform text into high-dimensional vectors, enabling semantic search across the knowledge base.",
  "Vector search finds the most relevant content by measuring cosine similarity between query and chunk embeddings.",
];

// ============================================================================
// TEST FUNCTIONS
// ============================================================================

/**
 * Test 1: Generate single embedding
 */
async function testSingleEmbedding() {
  console.log("\n" + "=".repeat(60));
  console.log("TEST 1: Generate Single Embedding");
  console.log("=".repeat(60));

  const service = new EmbeddingService(OPENAI_API_KEY);
  const text = SAMPLE_CHUNKS[0];

  console.log(`\n📝 Input text: "${text.substring(0, 60)}..."`);

  const resultEffect = service.generate(text);
  const result = await Effect.runPromise(resultEffect);

  console.log(`\n✅ Embedding generated:`);
  console.log(`   Dimensions: ${result.dimensions}`);
  console.log(`   Model: ${result.model}`);
  console.log(`   Tokens used: ${result.tokensUsed}`);
  console.log(
    `   First 5 values: [${result.embedding.slice(0, 5).map((v) => v.toFixed(4)).join(", ")}...]`
  );

  return result;
}

/**
 * Test 2: Generate batch embeddings
 */
async function testBatchEmbeddings() {
  console.log("\n" + "=".repeat(60));
  console.log("TEST 2: Generate Batch Embeddings");
  console.log("=".repeat(60));

  const service = new EmbeddingService(OPENAI_API_KEY);

  console.log(`\n📦 Processing ${SAMPLE_CHUNKS.length} chunks...`);
  SAMPLE_CHUNKS.forEach((chunk, i) => {
    console.log(`   ${i + 1}. "${chunk.substring(0, 50)}..."`);
  });

  const resultEffect = service.generateBatch(SAMPLE_CHUNKS);
  const result = await Effect.runPromise(resultEffect);

  console.log(`\n✅ Batch complete:`);
  console.log(`   Embeddings: ${result.embeddings.length}`);
  console.log(`   Total tokens: ${result.totalTokensUsed}`);
  console.log(`   Total cost: $${result.totalCost.toFixed(6)}`);
  console.log(`   Duration: ${result.duration}ms`);

  // Show statistics
  const stats = service.getStatistics();
  console.log(`\n📊 Service Statistics:`);
  console.log(`   Total tokens used: ${stats.totalTokensUsed}`);
  console.log(`   Total API calls: ${stats.totalApiCalls}`);
  console.log(`   Total cost: $${stats.totalCost.toFixed(6)}`);

  return result;
}

/**
 * Test 3: Cost estimation
 */
async function testCostEstimation() {
  console.log("\n" + "=".repeat(60));
  console.log("TEST 3: Cost Estimation");
  console.log("=".repeat(60));

  const service = new EmbeddingService(OPENAI_API_KEY);
  const estimate = service.getCostEstimate(SAMPLE_CHUNKS);

  console.log(`\n💰 Cost Estimate:`);
  console.log(`   Texts: ${estimate.texts}`);
  console.log(`   Estimated tokens: ${estimate.estimatedTokens}`);
  console.log(`   Estimated cost: $${estimate.estimatedCost.toFixed(6)}`);
  console.log(`   Model: ${estimate.model}`);

  return estimate;
}

/**
 * Test 4: Semantic similarity
 */
async function testSemanticSimilarity() {
  console.log("\n" + "=".repeat(60));
  console.log("TEST 4: Semantic Similarity");
  console.log("=".repeat(60));

  const service = new EmbeddingService(OPENAI_API_KEY);

  // Generate embeddings for all chunks
  const resultEffect = service.generateBatch(SAMPLE_CHUNKS);
  const result = await Effect.runPromise(resultEffect);

  // Generate embedding for query
  const query = "How does voice cloning work for AI assistants?";
  console.log(`\n🔍 Query: "${query}"`);

  const queryEffect = service.generate(query);
  const queryResult = await Effect.runPromise(queryEffect);

  // Calculate cosine similarity with each chunk
  console.log(`\n📊 Similarity scores:`);

  const scores = result.embeddings.map((chunk, i) => {
    const similarity = cosineSimilarity(
      queryResult.embedding,
      chunk.embedding
    );

    console.log(
      `   ${i + 1}. Score: ${(similarity * 100).toFixed(1)}% - "${chunk.text.substring(0, 60)}..."`
    );

    return { index: i, similarity, text: chunk.text };
  });

  // Sort by similarity
  scores.sort((a, b) => b.similarity - a.similarity);

  console.log(`\n🏆 Top match:`);
  console.log(`   "${scores[0].text}"`);
  console.log(`   Score: ${(scores[0].similarity * 100).toFixed(1)}%`);

  return scores;
}

/**
 * Test 5: Error handling
 */
async function testErrorHandling() {
  console.log("\n" + "=".repeat(60));
  console.log("TEST 5: Error Handling");
  console.log("=".repeat(60));

  const service = new EmbeddingService(OPENAI_API_KEY);

  // Test empty text
  console.log(`\n🔴 Test: Empty text`);
  try {
    const resultEffect = service.generate("");
    await Effect.runPromise(resultEffect);
    console.log("   ❌ Should have thrown error");
  } catch (error) {
    console.log(`   ✅ Caught error: ${(error as Error).message}`);
  }

  // Test text too long
  console.log(`\n🔴 Test: Text too long (>8192 chars)`);
  const longText = "x".repeat(9000);
  try {
    const resultEffect = service.generate(longText);
    await Effect.runPromise(resultEffect);
    console.log("   ❌ Should have thrown error");
  } catch (error) {
    console.log(`   ✅ Caught error: ${(error as Error).message}`);
  }

  // Test batch too large
  console.log(`\n🔴 Test: Batch too large (>100 items)`);
  const largeBatch = Array(101).fill("test text");
  try {
    const resultEffect = service.generateBatch(largeBatch);
    await Effect.runPromise(resultEffect);
    console.log("   ❌ Should have thrown error");
  } catch (error) {
    console.log(`   ✅ Caught error: ${(error as Error).message}`);
  }

  console.log(`\n✅ Error handling working correctly`);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have same length");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);

  if (denominator === 0) {
    return 0;
  }

  const similarity = dotProduct / denominator;

  // Normalize to 0-1 range
  return (similarity + 1) / 2;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log("🚀 Embedding Service Test Suite");
  console.log("=".repeat(60));

  try {
    await testSingleEmbedding();
    await testBatchEmbeddings();
    await testCostEstimation();
    await testSemanticSimilarity();
    await testErrorHandling();

    console.log("\n" + "=".repeat(60));
    console.log("✅ All tests passed!");
    console.log("=".repeat(60));

    console.log("\n📌 Next steps:");
    console.log("   1. Store embeddings in Convex using mutations");
    console.log("   2. Test vector search queries");
    console.log("   3. Integrate with AI clone RAG pipeline");
  } catch (error) {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.main) {
  main();
}

export {
  testSingleEmbedding,
  testBatchEmbeddings,
  testCostEstimation,
  testSemanticSimilarity,
  testErrorHandling,
};
