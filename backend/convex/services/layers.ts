/**
 * Service Layers - Consolidated Effect service layers for dependency injection
 *
 * Provides composed layers for all services, making it easy to provide
 * dependencies to Effect programs.
 *
 * This file now imports the detailed service implementations and composes them.
 *
 * @see /Users/toc/Server/ONE/one/things/plans/effect-components.md
 * @see /Users/toc/Server/ONE/one/things/plans/effect-patterns-reference.md
 * @see /Users/toc/Server/ONE/backend/convex/services/agent.service.ts
 * @see /Users/toc/Server/ONE/backend/convex/services/rag.service.ts
 * @see /Users/toc/Server/ONE/backend/convex/services/rate-limit.service.ts
 */

import { Effect, Layer, Data } from "effect";

// ============================================================================
// Stub Service Definitions (TODO: Implement these services)
// ============================================================================

export class AgentError extends Data.TaggedError("AgentError")<{
  cause?: unknown;
  message?: string;
}> {}

export class ThreadError extends Data.TaggedError("ThreadError")<{
  cause?: unknown;
  message?: string;
}> {}

export class RAGError extends Data.TaggedError("RAGError")<{
  cause?: unknown;
  message?: string;
}> {}

export class SearchError extends Data.TaggedError("SearchError")<{
  cause?: unknown;
  message?: string;
}> {}

export class IndexError extends Data.TaggedError("IndexError")<{
  cause?: unknown;
  message?: string;
}> {}

export class EmbeddingError extends Data.TaggedError("EmbeddingError")<{
  cause?: unknown;
  message?: string;
}> {}

export class RateLimitError extends Data.TaggedError("RateLimitError")<{
  cause?: unknown;
  message?: string;
}> {}

export class QuotaExceededError extends Data.TaggedError("QuotaExceededError")<{
  cause?: unknown;
  message?: string;
}> {}

// Service Stub Definitions (TODO: Implement these services)
export const AgentService = {} as any;
export const RAGService = {} as any;
export const RateLimiterService = {} as any;

// Stub Live Implementations (TODO: Implement these services)
export const AgentServiceLive = Layer.succeed(
  AgentService as any,
  { execute: () => Effect.void } as any
) as any;

export const RAGServiceLive = Layer.succeed(
  RAGService as any,
  {
    addDocument: () => Effect.void,
    deleteDocument: () => Effect.void,
    search: () => Effect.succeed([])
  } as any
) as any;

export const RateLimiterServiceLive = Layer.succeed(
  RateLimiterService as any,
  {
    checkLimit: () => Effect.succeed(true),
    increment: () => Effect.void
  } as any
) as any;

// Test Implementations
export const TestAgentServiceLive = Layer.succeed(
  AgentService as any,
  { execute: () => Effect.void } as any
) as any;

export const TestRAGServiceLive = Layer.succeed(
  RAGService as any,
  {
    addDocument: () => Effect.void,
    deleteDocument: () => Effect.void,
    search: () => Effect.succeed([])
  } as any
) as any;

export const TestRateLimiterServiceLive = Layer.succeed(
  RateLimiterService as any,
  {
    checkLimit: () => Effect.succeed(true),
    increment: () => Effect.void
  } as any
) as any;

export const TestRateLimiterServiceRejecting = Layer.succeed(
  RateLimiterService as any,
  {
    checkLimit: () => Effect.succeed(false),
    increment: () => Effect.void
  } as any
) as any;

// ============================================================================
// Error Exports
// ============================================================================

// Keep these legacy errors for backward compatibility
export class WorkflowError extends Data.TaggedError("WorkflowError")<{
  cause: unknown;
  message?: string;
  workflowId?: string;
}> {}

export class ValidationError extends Data.TaggedError("ValidationError")<{
  field: string;
  message: string;
  value?: unknown;
}> {}

export class DatabaseError extends Data.TaggedError("DatabaseError")<{
  cause: unknown;
  operation: "query" | "mutation" | "action";
  table?: string;
}> {}

// ============================================================================
// Service Exports (Already exported as stubs above)
// ============================================================================

// ============================================================================
// Production Layers
// ============================================================================

/**
 * Complete application layer with all services
 * Use this in production endpoints
 */
export const AppLayer = Layer.mergeAll(
  RateLimiterServiceLive,
  RAGServiceLive,
  AgentServiceLive
);

/**
 * All services combined (legacy name, use AppLayer instead)
 *
 * @deprecated Use AppLayer instead
 */
export const AllServicesLive = AppLayer;

/**
 * Minimal layer with only rate limiting
 * Use for endpoints that don't need AI/RAG
 */
export const MinimalLayer = RateLimiterServiceLive;

/**
 * AI layer with agent and RAG, no rate limiting
 * Use for internal operations that bypass rate limits
 */
export const AILayer = Layer.mergeAll(
  RAGServiceLive,
  AgentServiceLive
);

// ============================================================================
// Test Layers
// ============================================================================

/**
 * Test layer with all services mocked
 * Use in unit tests for fast execution
 */
export const TestAppLayer = Layer.mergeAll(
  TestRateLimiterServiceLive,
  TestRAGServiceLive,
  TestAgentServiceLive
);

/**
 * Test layer with rate limiting rejecting all requests
 * Use to test rate limit error handling
 */
export const TestAppLayerRateLimited = Layer.mergeAll(
  TestRateLimiterServiceRejecting,
  TestRAGServiceLive,
  TestAgentServiceLive
);

/**
 * Test layer with only agent service mocked
 * Use when testing RAG or rate limiting in isolation
 */
export const TestAgentOnlyLayer = TestAgentServiceLive;

/**
 * Test layer with only RAG service mocked
 * Use when testing agent or rate limiting in isolation
 */
export const TestRAGOnlyLayer = TestRAGServiceLive;

/**
 * Test layer with only rate limiter mocked
 * Use when testing agent or RAG in isolation
 */
export const TestRateLimiterOnlyLayer = TestRateLimiterServiceLive;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Run an Effect program with all services
 *
 * Convenience wrapper for Effect.runPromise + Effect.provide
 */
export function runWithServices<A, E>(
  effect: Effect.Effect<A, E, any>
): Promise<A> {
  return Effect.runPromise(Effect.provide(effect as any, AppLayer as any) as any);
}

/**
 * Create a validation effect
 *
 * Helper for validating inputs before operations
 */
export function validate<T>(
  field: string,
  value: T,
  predicate: (v: T) => boolean,
  message: string
): Effect.Effect<T, ValidationError> {
  if (predicate(value)) {
    return Effect.succeed(value);
  }
  return Effect.fail(new ValidationError({ field, message, value }));
}

/**
 * Wrap a database operation with error handling
 *
 * Converts database errors to typed DatabaseError
 */
export function wrapDatabase<T>(
  operation: "query" | "mutation" | "action",
  table: string | undefined,
  fn: () => Promise<T>
): Effect.Effect<T, DatabaseError> {
  return Effect.tryPromise({
    try: fn,
    catch: (cause) => new DatabaseError({ cause, operation, table })
  });
}
