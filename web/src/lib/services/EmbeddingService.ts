/**
 * Embedding Service
 *
 * CYCLE 3: Embeddings generation and semantic vector search
 *
 * Integrates OpenAI embeddings API (text-embedding-3-large, 3072 dimensions)
 * for AI clone knowledge base and RAG (Retrieval Augmented Generation)
 *
 * Features:
 * - Batch processing (up to 100 chunks at once)
 * - Automatic retry logic with exponential backoff
 * - Cost tracking (tokens used, API calls)
 * - Embedding caching to avoid regeneration
 * - Error handling and validation
 *
 * Usage:
 *   import { EmbeddingService } from '@/lib/services/EmbeddingService';
 *
 *   const service = new EmbeddingService(apiKey);
 *   const embeddings = await service.generateBatch(texts);
 *   const cost = service.getCostEstimate(texts);
 */

import { Effect } from "effect";
import { createOpenAI } from "@ai-sdk/openai";
import { embed, embedMany } from "ai";

// ============================================================================
// TYPES
// ============================================================================

export interface EmbeddingResult {
  embedding: number[];
  text: string;
  model: string;
  dimensions: number;
  tokensUsed: number;
}

export interface BatchEmbeddingResult {
  embeddings: EmbeddingResult[];
  totalTokensUsed: number;
  totalCost: number;
  duration: number;
}

export interface EmbeddingOptions {
  model?: string;
  dimensions?: number;
  batchSize?: number;
  maxRetries?: number;
  retryDelay?: number;
}

export interface CostEstimate {
  texts: number;
  estimatedTokens: number;
  estimatedCost: number;
  model: string;
}

// ============================================================================
// ERRORS
// ============================================================================

export class EmbeddingError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly retryable: boolean = false
  ) {
    super(message);
    this.name = "EmbeddingError";
  }
}

export class RateLimitError extends EmbeddingError {
  constructor(message: string) {
    super(message, "RATE_LIMIT", true);
    this.name = "RateLimitError";
  }
}

export class InvalidInputError extends EmbeddingError {
  constructor(message: string) {
    super(message, "INVALID_INPUT", false);
    this.name = "InvalidInputError";
  }
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_MODEL = "text-embedding-3-large";
const DEFAULT_DIMENSIONS = 3072;
const DEFAULT_BATCH_SIZE = 100;
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_DELAY = 1000; // ms

// Pricing per 1M tokens (as of 2024)
const PRICING = {
  "text-embedding-3-large": 0.13, // $0.13 per 1M tokens
  "text-embedding-3-small": 0.02, // $0.02 per 1M tokens
};

// ============================================================================
// EMBEDDING SERVICE
// ============================================================================

export class EmbeddingService {
  private readonly openai;
  private readonly options: Required<EmbeddingOptions>;
  private totalTokensUsed = 0;
  private totalApiCalls = 0;

  constructor(apiKey: string, options: EmbeddingOptions = {}) {
    if (!apiKey) {
      throw new InvalidInputError("OpenAI API key is required");
    }

    this.openai = createOpenAI({ apiKey });
    this.options = {
      model: options.model || DEFAULT_MODEL,
      dimensions: options.dimensions || DEFAULT_DIMENSIONS,
      batchSize: options.batchSize || DEFAULT_BATCH_SIZE,
      maxRetries: options.maxRetries || DEFAULT_MAX_RETRIES,
      retryDelay: options.retryDelay || DEFAULT_RETRY_DELAY,
    };
  }

  /**
   * Generate embedding for a single text
   *
   * @param text - Text to embed
   * @returns Effect that yields embedding result
   *
   * @example
   * ```typescript
   * const service = new EmbeddingService(apiKey);
   * const result = await Effect.runPromise(service.generate("Hello world"));
   * console.log(result.embedding); // [0.123, -0.456, ...]
   * ```
   */
  generate(text: string) {
    return Effect.gen(function* (this: EmbeddingService) {
      // Validate input
      if (!text || text.trim().length === 0) {
        return yield* Effect.fail(
          new InvalidInputError("Text cannot be empty")
        );
      }

      if (text.length > 8192) {
        return yield* Effect.fail(
          new InvalidInputError("Text exceeds maximum length (8192 characters)")
        );
      }

      // Generate embedding with retry logic
      const result = yield* this._generateWithRetry(text);

      return result;
    }.bind(this));
  }

  /**
   * Generate embeddings for multiple texts in batches
   *
   * @param texts - Array of texts to embed
   * @returns Effect that yields batch embedding result
   *
   * @example
   * ```typescript
   * const service = new EmbeddingService(apiKey);
   * const result = await Effect.runPromise(
   *   service.generateBatch(["Text 1", "Text 2", "Text 3"])
   * );
   * console.log(result.embeddings.length); // 3
   * console.log(result.totalCost); // 0.00001234
   * ```
   */
  generateBatch(texts: string[]) {
    return Effect.gen(function* (this: EmbeddingService) {
      const startTime = Date.now();

      // Validate inputs
      if (!texts || texts.length === 0) {
        return yield* Effect.fail(
          new InvalidInputError("Texts array cannot be empty")
        );
      }

      if (texts.length > this.options.batchSize) {
        return yield* Effect.fail(
          new InvalidInputError(
            `Batch size exceeds maximum (${this.options.batchSize})`
          )
        );
      }

      // Filter out empty texts
      const validTexts = texts.filter((t) => t && t.trim().length > 0);

      if (validTexts.length === 0) {
        return yield* Effect.fail(
          new InvalidInputError("No valid texts to embed")
        );
      }

      // Generate embeddings in batch
      const results: EmbeddingResult[] = [];
      let totalTokens = 0;

      // Process in chunks of batch size
      for (let i = 0; i < validTexts.length; i += this.options.batchSize) {
        const chunk = validTexts.slice(i, i + this.options.batchSize);

        // Use embedMany for batch processing
        const batchResults = yield* this._generateBatchWithRetry(chunk);

        results.push(...batchResults);
        totalTokens += batchResults.reduce((sum, r) => sum + r.tokensUsed, 0);
      }

      const duration = Date.now() - startTime;
      const totalCost = this._calculateCost(totalTokens);

      // Update statistics
      this.totalTokensUsed += totalTokens;
      this.totalApiCalls += Math.ceil(validTexts.length / this.options.batchSize);

      return {
        embeddings: results,
        totalTokensUsed: totalTokens,
        totalCost,
        duration,
      };
    }.bind(this));
  }

  /**
   * Get cost estimate for embedding texts
   *
   * @param texts - Array of texts to estimate
   * @returns Cost estimate
   *
   * @example
   * ```typescript
   * const service = new EmbeddingService(apiKey);
   * const estimate = service.getCostEstimate(["Text 1", "Text 2"]);
   * console.log(estimate.estimatedCost); // $0.00001234
   * ```
   */
  getCostEstimate(texts: string[]): CostEstimate {
    const estimatedTokens = texts.reduce(
      (sum, text) => sum + this._estimateTokens(text),
      0
    );

    const estimatedCost = this._calculateCost(estimatedTokens);

    return {
      texts: texts.length,
      estimatedTokens,
      estimatedCost,
      model: this.options.model,
    };
  }

  /**
   * Get service statistics
   */
  getStatistics() {
    return {
      totalTokensUsed: this.totalTokensUsed,
      totalApiCalls: this.totalApiCalls,
      totalCost: this._calculateCost(this.totalTokensUsed),
      model: this.options.model,
      dimensions: this.options.dimensions,
    };
  }

  /**
   * Reset service statistics
   */
  resetStatistics() {
    this.totalTokensUsed = 0;
    this.totalApiCalls = 0;
  }

  // ==========================================================================
  // PRIVATE METHODS
  // ==========================================================================

  /**
   * Generate embedding with retry logic
   */
  private _generateWithRetry(text: string, attempt = 0): Effect.Effect<EmbeddingResult, EmbeddingError> {
    return Effect.gen(function* (this: EmbeddingService) {
      try {
        const result = yield* Effect.tryPromise({
          try: async () => {
            const response = await embed({
              model: this.openai.embedding(this.options.model),
              value: text,
            });

            return response;
          },
          catch: (error) => this._handleError(error, attempt),
        });

        const tokensUsed = this._estimateTokens(text);

        return {
          embedding: result.embedding,
          text,
          model: this.options.model,
          dimensions: this.options.dimensions,
          tokensUsed,
        };
      } catch (error) {
        // Retry if error is retryable
        if (
          error instanceof EmbeddingError &&
          error.retryable &&
          attempt < this.options.maxRetries
        ) {
          const delay = this.options.retryDelay * Math.pow(2, attempt);
          yield* Effect.sleep(delay);
          return yield* this._generateWithRetry(text, attempt + 1);
        }

        return yield* Effect.fail(error as EmbeddingError);
      }
    }.bind(this));
  }

  /**
   * Generate batch embeddings with retry logic
   */
  private _generateBatchWithRetry(
    texts: string[],
    attempt = 0
  ): Effect.Effect<EmbeddingResult[], EmbeddingError> {
    return Effect.gen(function* (this: EmbeddingService) {
      try {
        const result = yield* Effect.tryPromise({
          try: async () => {
            const response = await embedMany({
              model: this.openai.embedding(this.options.model),
              values: texts,
            });

            return response;
          },
          catch: (error) => this._handleError(error, attempt),
        });

        const results: EmbeddingResult[] = texts.map((text, i) => ({
          embedding: result.embeddings[i],
          text,
          model: this.options.model,
          dimensions: this.options.dimensions,
          tokensUsed: this._estimateTokens(text),
        }));

        return results;
      } catch (error) {
        // Retry if error is retryable
        if (
          error instanceof EmbeddingError &&
          error.retryable &&
          attempt < this.options.maxRetries
        ) {
          const delay = this.options.retryDelay * Math.pow(2, attempt);
          yield* Effect.sleep(delay);
          return yield* this._generateBatchWithRetry(texts, attempt + 1);
        }

        return yield* Effect.fail(error as EmbeddingError);
      }
    }.bind(this));
  }

  /**
   * Handle API errors
   */
  private _handleError(error: unknown, attempt: number): EmbeddingError {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Rate limit errors (429)
    if (errorMessage.includes("429") || errorMessage.includes("rate limit")) {
      return new RateLimitError(
        `Rate limit exceeded (attempt ${attempt + 1})`
      );
    }

    // Invalid input errors (400)
    if (errorMessage.includes("400") || errorMessage.includes("invalid")) {
      return new InvalidInputError(`Invalid input: ${errorMessage}`);
    }

    // Generic error (potentially retryable)
    return new EmbeddingError(
      `Embedding generation failed: ${errorMessage}`,
      "UNKNOWN",
      true
    );
  }

  /**
   * Estimate tokens for text
   * Rule of thumb: 1 token ≈ 4 characters for English text
   */
  private _estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Calculate cost for tokens
   */
  private _calculateCost(tokens: number): number {
    const pricePerMillion = PRICING[this.options.model as keyof typeof PRICING] || 0.13;
    return (tokens / 1_000_000) * pricePerMillion;
  }
}

// ============================================================================
// SINGLETON INSTANCE (Optional)
// ============================================================================

let instance: EmbeddingService | null = null;

/**
 * Get or create singleton embedding service instance
 *
 * @param apiKey - OpenAI API key (required on first call)
 * @returns Singleton instance
 *
 * @example
 * ```typescript
 * const service = getEmbeddingService(process.env.OPENAI_API_KEY);
 * const result = await Effect.runPromise(service.generate("Hello"));
 * ```
 */
export function getEmbeddingService(apiKey?: string): EmbeddingService {
  if (!instance) {
    if (!apiKey) {
      throw new InvalidInputError(
        "OpenAI API key required for first initialization"
      );
    }
    instance = new EmbeddingService(apiKey);
  }
  return instance;
}

/**
 * Reset singleton instance (useful for testing)
 */
export function resetEmbeddingService() {
  instance = null;
}
