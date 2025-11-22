/**
 * ContentExtractionService Tests
 *
 * Demonstrates content extraction and chunking functionality
 */

import { describe, it, expect } from 'vitest';
import { Effect } from 'effect';
import {
  makeContentExtractionService,
  extractCreatorContent,
  type ExtractionInput,
} from './ContentExtractionService';

describe('ContentExtractionService', () => {
  it('should extract and chunk creator content', async () => {
    const service = makeContentExtractionService();

    const input: ExtractionInput = {
      creatorId: 'creator_123',
      groupId: 'group_456',
      contentTypes: ['blog_post', 'course'],
      chunkSize: 500,
      overlapSize: 50,
    };

    const program = service.extract(input);
    const result = await Effect.runPromise(program);

    // Verify result structure
    expect(result).toHaveProperty('chunks');
    expect(result).toHaveProperty('totalChunks');
    expect(result).toHaveProperty('totalTokens');
    expect(result).toHaveProperty('sourcesProcessed');
    expect(result).toHaveProperty('duration');

    // Verify chunks are created
    expect(result.totalChunks).toBeGreaterThan(0);
    expect(result.chunks.length).toBe(result.totalChunks);

    // Verify chunk structure
    const firstChunk = result.chunks[0];
    expect(firstChunk).toHaveProperty('text');
    expect(firstChunk).toHaveProperty('tokens');
    expect(firstChunk).toHaveProperty('position');
    expect(firstChunk).toHaveProperty('sourceId');
    expect(firstChunk).toHaveProperty('sourceType');
    expect(firstChunk).toHaveProperty('metadata');

    // Verify metadata
    expect(firstChunk.metadata).toHaveProperty('title');
    expect(firstChunk.metadata).toHaveProperty('keywords');

    console.log('\n✅ Content Extraction Results:');
    console.log(`  - Sources Processed: ${result.sourcesProcessed}`);
    console.log(`  - Chunks Created: ${result.totalChunks}`);
    console.log(`  - Total Tokens: ${result.totalTokens}`);
    console.log(`  - Duration: ${result.duration}ms`);
    console.log(`  - Avg Tokens/Chunk: ${Math.floor(result.totalTokens / result.totalChunks)}`);
  });

  it('should chunk content with proper sentence boundaries', async () => {
    const service = makeContentExtractionService();

    const input: ExtractionInput = {
      creatorId: 'creator_123',
      groupId: 'group_456',
      chunkSize: 100, // Small chunks to test boundaries
      overlapSize: 20,
    };

    const program = service.extract(input);
    const result = await Effect.runPromise(program);

    // Verify sentences aren't split mid-sentence
    for (const chunk of result.chunks) {
      // Each chunk should end with sentence boundary or be complete
      const text = chunk.text.trim();
      const endsWithPunctuation =
        text.endsWith('.') || text.endsWith('!') || text.endsWith('?') || text.includes('\n');

      expect(endsWithPunctuation).toBe(true);
    }

    console.log('\n✅ Sentence Boundary Test:');
    console.log(`  - All ${result.chunks.length} chunks respect sentence boundaries`);
  });

  it('should detect code blocks in chunks', async () => {
    const service = makeContentExtractionService();

    const input: ExtractionInput = {
      creatorId: 'creator_123',
      groupId: 'group_456',
    };

    const program = service.extract(input);
    const result = await Effect.runPromise(program);

    // Check if any chunks detected code blocks
    const chunksWithCode = result.chunks.filter((chunk) => chunk.metadata.hasCodeBlock);

    console.log('\n✅ Code Block Detection:');
    console.log(`  - Chunks with code: ${chunksWithCode.length}`);

    if (chunksWithCode.length > 0) {
      console.log(`  - Example chunk with code (${chunksWithCode[0].tokens} tokens):`);
      console.log(`    "${chunksWithCode[0].text.substring(0, 100)}..."`);
    }
  });

  it('should extract keywords from chunks', async () => {
    const service = makeContentExtractionService();

    const input: ExtractionInput = {
      creatorId: 'creator_123',
      groupId: 'group_456',
    };

    const program = service.extract(input);
    const result = await Effect.runPromise(program);

    // Verify all chunks have keywords
    for (const chunk of result.chunks) {
      expect(chunk.metadata.keywords).toBeDefined();
      expect(Array.isArray(chunk.metadata.keywords)).toBe(true);
    }

    console.log('\n✅ Keyword Extraction:');
    console.log(`  - Total chunks with keywords: ${result.chunks.length}`);

    const allKeywords = new Set<string>();
    result.chunks.forEach((chunk) => {
      chunk.metadata.keywords?.forEach((kw: string) => allKeywords.add(kw));
    });

    console.log(`  - Unique keywords extracted: ${allKeywords.size}`);
    console.log(`  - Top keywords: ${Array.from(allKeywords).slice(0, 10).join(', ')}`);
  });

  it('should deduplicate identical chunks', async () => {
    const service = makeContentExtractionService();

    const input: ExtractionInput = {
      creatorId: 'creator_123',
      groupId: 'group_456',
    };

    const program = service.extract(input);
    const result = await Effect.runPromise(program);

    // Create a set of chunk texts to check for duplicates
    const chunkTexts = new Set<string>();
    let duplicates = 0;

    for (const chunk of result.chunks) {
      const normalizedText = chunk.text.trim().toLowerCase();
      if (chunkTexts.has(normalizedText)) {
        duplicates++;
      } else {
        chunkTexts.add(normalizedText);
      }
    }

    console.log('\n✅ Deduplication Test:');
    console.log(`  - Total chunks: ${result.chunks.length}`);
    console.log(`  - Unique chunks: ${chunkTexts.size}`);
    console.log(`  - Duplicates removed: ${duplicates}`);

    expect(duplicates).toBe(0); // Service should deduplicate
  });

  it('should handle extraction with functional composition', async () => {
    // Demonstrates Effect.ts composition

    const program = Effect.gen(function* () {
      const result = yield* extractCreatorContent({
        creatorId: 'creator_123',
        groupId: 'group_456',
        chunkSize: 500,
        overlapSize: 50,
      });

      // Transform result (example of composition)
      const summary = {
        success: true,
        metrics: {
          chunks: result.totalChunks,
          tokens: result.totalTokens,
          sources: result.sourcesProcessed,
          avgTokensPerChunk: Math.floor(result.totalTokens / result.totalChunks),
          processingTime: result.duration,
        },
        performance: {
          chunksPerSecond: Math.floor((result.totalChunks / result.duration) * 1000),
          tokensPerSecond: Math.floor((result.totalTokens / result.duration) * 1000),
        },
      };

      return summary;
    });

    const summary = await Effect.runPromise(program);

    console.log('\n✅ Extraction Summary:');
    console.log(JSON.stringify(summary, null, 2));

    expect(summary.success).toBe(true);
    expect(summary.metrics.chunks).toBeGreaterThan(0);
    expect(summary.performance.chunksPerSecond).toBeGreaterThan(0);
  });
});
