/**
 * ContentExtractionService - Effect.ts Service Layer
 *
 * Intelligent content extraction and chunking for AI clone training
 *
 * Features:
 * - Extract text from creator content (blog posts, courses, videos, products)
 * - Intelligent chunking with sentence boundaries
 * - Token-accurate chunking using tiktoken
 * - Preserve code blocks and headings
 * - Generate rich metadata for each chunk
 * - Deduplicate chunks
 * - Track extraction progress
 */

import { Effect, Context } from 'effect';
import { encoding_for_model } from 'tiktoken';

/**
 * Content source types supported
 */
export type ContentType = 'blog_post' | 'course' | 'lesson' | 'video' | 'product' | 'document';

/**
 * Content chunk with metadata
 */
export interface ContentChunk {
  text: string;
  tokens: number;
  position: number;
  sourceId: string;
  sourceType: ContentType;
  metadata: {
    title?: string;
    url?: string;
    chapterTitle?: string;
    keywords?: string[];
    hasCodeBlock?: boolean;
    hasHeading?: boolean;
    language?: string;
  };
}

/**
 * Extraction input
 */
export interface ExtractionInput {
  creatorId: string;
  groupId: string;
  contentTypes?: ContentType[];
  maxChunks?: number;
  chunkSize?: number; // tokens
  overlapSize?: number; // tokens
}

/**
 * Extraction result
 */
export interface ExtractionResult {
  chunks: ContentChunk[];
  totalChunks: number;
  totalTokens: number;
  sourcesProcessed: number;
  duration: number;
  errors?: string[];
}

/**
 * Content extraction errors
 */
export class ContentNotFoundError extends Error {
  constructor(public creatorId: string) {
    super(`No content found for creator: ${creatorId}`);
    this.name = 'ContentNotFoundError';
  }
}

export class ChunkingFailedError extends Error {
  constructor(
    message: string,
    public sourceId: string,
    public cause?: unknown
  ) {
    super(`Chunking failed for ${sourceId}: ${message}`);
    this.name = 'ChunkingFailedError';
  }
}

export class ExtractionError extends Error {
  constructor(
    message: string,
    public cause?: unknown
  ) {
    super(message);
    this.name = 'ExtractionError';
  }
}

/**
 * ContentExtractionService
 *
 * Pure business logic for content extraction and chunking
 */
export class ContentExtractionService {
  /**
   * Extract and chunk all content for a creator
   */
  extract(input: ExtractionInput): Effect.Effect<ExtractionResult, ExtractionError | ContentNotFoundError> {
    return this._extract(input);
  }

  /**
   * Chunk a single piece of content
   */
  chunkContent(
    text: string,
    sourceId: string,
    sourceType: ContentType,
    metadata: ContentChunk['metadata'],
    chunkSize = 500,
    overlapSize = 50
  ): Effect.Effect<ContentChunk[], ChunkingFailedError> {
    return this._chunkContent(text, sourceId, sourceType, metadata, chunkSize, overlapSize);
  }

  /**
   * Internal: Extract and process all creator content
   */
  private _extract(
    input: ExtractionInput
  ): Effect.Effect<ExtractionResult, ExtractionError | ContentNotFoundError> {
    const self = this;
    return Effect.gen(function* () {
      const startTime = Date.now();
      const errors: string[] = [];
      const allChunks: ContentChunk[] = [];

      // TODO: In real implementation, fetch content from database via connections
      // For now, return mock data demonstrating the pattern
      const mockContent = yield* Effect.succeed([
        {
          id: 'blog_1',
          type: 'blog_post' as ContentType,
          title: 'Introduction to AI Clones',
          content: `# Introduction to AI Clones

AI clones represent a revolutionary way for creators to scale their expertise.
By training an AI on your content, voice, and appearance, you can provide
24/7 personalized interactions with your audience.

## How It Works

The process involves three key steps:

1. Content Extraction: We analyze all your blog posts, courses, and videos
2. Voice Cloning: Upload 3-5 minutes of voice samples
3. Appearance Cloning: Provide photos for avatar generation

## Benefits

- Scale your reach without sacrificing personal touch
- Provide instant responses to audience questions
- Monetize your knowledge through AI conversations
- Free up time for creating more content

Let's dive deeper into each component...`,
          url: '/blog/intro-to-ai-clones',
        },
        {
          id: 'course_1',
          type: 'course' as ContentType,
          title: 'AI Clone Mastery',
          content: `# Course: AI Clone Mastery

Welcome to AI Clone Mastery! In this course, you'll learn everything needed
to create, train, and deploy your own AI clone.

## Module 1: Understanding AI Clones

AI clones are more than chatbots. They're digital representations of you that
can think, speak, and interact like you do. The key is in the training data.

### Lesson 1.1: What Makes a Good Clone?

A good AI clone needs three ingredients:
- Comprehensive knowledge base (your content)
- Authentic voice (your speaking style)
- Visual presence (your appearance)

The more content you provide, the better your clone performs.`,
          url: '/courses/ai-clone-mastery',
        },
      ]);

      // Process each content source
      for (const content of mockContent) {
        try {
          const chunks = yield* self._chunkContent(
            content.content,
            content.id,
            content.type,
            {
              title: content.title,
              url: content.url,
            },
            input.chunkSize || 500,
            input.overlapSize || 50
          );

          allChunks.push(...chunks);
        } catch (error) {
          errors.push(`Failed to process ${content.id}: ${error}`);
        }
      }

      // Deduplicate chunks
      const uniqueChunks = yield* self._deduplicateChunks(allChunks);

      // Calculate totals
      const totalTokens = uniqueChunks.reduce((sum, chunk) => sum + chunk.tokens, 0);

      const duration = Date.now() - startTime;

      return {
        chunks: uniqueChunks,
        totalChunks: uniqueChunks.length,
        totalTokens,
        sourcesProcessed: mockContent.length,
        duration,
        errors: errors.length > 0 ? errors : undefined,
      };
    });
  }

  /**
   * Internal: Chunk a single content piece
   */
  private _chunkContent(
    text: string,
    sourceId: string,
    sourceType: ContentType,
    metadata: ContentChunk['metadata'],
    chunkSize: number,
    overlapSize: number
  ): Effect.Effect<ContentChunk[], ChunkingFailedError> {
    const self = this;
    return Effect.gen(function* () {
      try {
        // Get tiktoken encoder for GPT-4
        const encoder = encoding_for_model('gpt-4');

        // Split text into sentences (respecting boundaries)
        const sentences = self._splitIntoSentences(text);

        const chunks: ContentChunk[] = [];
        let currentChunk: string[] = [];
        let currentTokens = 0;
        let position = 0;

        for (const sentence of sentences) {
          const sentenceTokens = encoder.encode(sentence).length;

          // If adding this sentence exceeds chunk size, save current chunk
          if (currentTokens + sentenceTokens > chunkSize && currentChunk.length > 0) {
            const chunkText = currentChunk.join(' ');
            const tokens = encoder.encode(chunkText).length;

            chunks.push({
              text: chunkText,
              tokens,
              position,
              sourceId,
              sourceType,
              metadata: {
                ...metadata,
                hasCodeBlock: self._hasCodeBlock(chunkText),
                hasHeading: self._hasHeading(chunkText),
                keywords: self._extractKeywords(chunkText),
              },
            });

            position++;

            // Keep overlap sentences
            const overlapSentences = self._getOverlapSentences(
              currentChunk,
              encoder,
              overlapSize
            );
            currentChunk = overlapSentences;
            currentTokens = encoder.encode(currentChunk.join(' ')).length;
          }

          currentChunk.push(sentence);
          currentTokens += sentenceTokens;
        }

        // Add final chunk
        if (currentChunk.length > 0) {
          const chunkText = currentChunk.join(' ');
          const tokens = encoder.encode(chunkText).length;

          chunks.push({
            text: chunkText,
            tokens,
            position,
            sourceId,
            sourceType,
            metadata: {
              ...metadata,
              hasCodeBlock: self._hasCodeBlock(chunkText),
              hasHeading: self._hasHeading(chunkText),
              keywords: self._extractKeywords(chunkText),
            },
          });
        }

        // Free encoder
        encoder.free();

        return chunks;
      } catch (error) {
        return yield* Effect.fail(
          new ChunkingFailedError('Chunking failed', sourceId, error)
        );
      }
    });
  }

  /**
   * Split text into sentences (respecting code blocks)
   */
  private _splitIntoSentences(text: string): string[] {
    const sentences: string[] = [];
    let currentSentence = '';
    let inCodeBlock = false;

    const lines = text.split('\n');

    for (const line of lines) {
      // Detect code block boundaries
      if (line.trim().startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        currentSentence += line + '\n';
        continue;
      }

      // Inside code block: don't split
      if (inCodeBlock) {
        currentSentence += line + '\n';
        continue;
      }

      // Heading: treat as own sentence
      if (line.trim().startsWith('#')) {
        if (currentSentence.trim()) {
          sentences.push(currentSentence.trim());
        }
        sentences.push(line.trim());
        currentSentence = '';
        continue;
      }

      // Regular text: split on sentence boundaries
      const parts = line.split(/(?<=[.!?])\s+/);
      for (let i = 0; i < parts.length; i++) {
        currentSentence += parts[i];
        if (i < parts.length - 1) {
          sentences.push(currentSentence.trim());
          currentSentence = '';
        } else {
          currentSentence += ' ';
        }
      }
    }

    if (currentSentence.trim()) {
      sentences.push(currentSentence.trim());
    }

    return sentences.filter((s) => s.length > 0);
  }

  /**
   * Get sentences for overlap
   */
  private _getOverlapSentences(
    sentences: string[],
    encoder: any,
    overlapTokens: number
  ): string[] {
    const overlapSentences: string[] = [];
    let tokens = 0;

    // Add sentences from end until we reach overlap size
    for (let i = sentences.length - 1; i >= 0; i--) {
      const sentenceTokens = encoder.encode(sentences[i]).length;
      if (tokens + sentenceTokens > overlapTokens) {
        break;
      }
      overlapSentences.unshift(sentences[i]);
      tokens += sentenceTokens;
    }

    return overlapSentences;
  }

  /**
   * Check if text contains code block
   */
  private _hasCodeBlock(text: string): boolean {
    return text.includes('```');
  }

  /**
   * Check if text contains heading
   */
  private _hasHeading(text: string): boolean {
    return /^#{1,6}\s/.test(text.trim());
  }

  /**
   * Extract keywords from text (simple implementation)
   */
  private _extractKeywords(text: string): string[] {
    // Remove markdown syntax
    const cleanText = text
      .replace(/```[\s\S]*?```/g, '')
      .replace(/#{1,6}\s/g, '')
      .replace(/[*_`]/g, '');

    // Extract words > 4 characters
    const words = cleanText.toLowerCase().match(/\b\w{5,}\b/g) || [];

    // Count frequency
    const frequency: Record<string, number> = {};
    words.forEach((word) => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    // Return top 5 most frequent
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }

  /**
   * Deduplicate chunks (same text = same chunk)
   */
  private _deduplicateChunks(
    chunks: ContentChunk[]
  ): Effect.Effect<ContentChunk[], never> {
    return Effect.gen(function* () {
      const seen = new Set<string>();
      const unique: ContentChunk[] = [];

      for (const chunk of chunks) {
        const key = chunk.text.trim().toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(chunk);
        }
      }

      return unique;
    });
  }
}

/**
 * Create ContentExtractionService instance
 *
 * @example
 * ```typescript
 * const service = makeContentExtractionService();
 * const result = yield* service.extract({
 *   creatorId: 'creator_123',
 *   groupId: 'group_456',
 *   contentTypes: ['blog_post', 'course'],
 *   chunkSize: 500,
 *   overlapSize: 50
 * });
 * ```
 */
export const makeContentExtractionService = () => new ContentExtractionService();

/**
 * Extract and chunk content for a creator
 *
 * @example
 * ```typescript
 * const program = Effect.gen(function* () {
 *   const service = makeContentExtractionService();
 *   return yield* service.extract({
 *     creatorId: 'creator_123',
 *     groupId: 'group_456',
 *     chunkSize: 500,
 *     overlapSize: 50
 *   });
 * });
 *
 * const result = await Effect.runPromise(program);
 * console.log(`Extracted ${result.totalChunks} chunks (${result.totalTokens} tokens)`);
 * ```
 */
export const extractCreatorContent = (input: ExtractionInput) =>
  Effect.gen(function* () {
    const service = makeContentExtractionService();
    return yield* service.extract(input);
  });
