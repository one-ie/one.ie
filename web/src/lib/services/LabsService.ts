/**
 * Labs Service - Experimental Features Management
 *
 * Manages feature flags, experiment tracking, and A/B testing
 *
 * Ontology Integration:
 * - Feature flags scoped by groupId
 * - Tracks usage per experiment
 * - Collects feedback as knowledge chunks
 * - A/B test framework for variant testing
 */

import { Effect, Context, pipe } from 'effect';

// ============================================================================
// ERRORS
// ============================================================================

export class ExperimentNotFoundError extends Error {
  readonly _tag = 'ExperimentNotFoundError';
  constructor(experimentId: string) {
    super(`Experiment not found: ${experimentId}`);
  }
}

export class ExperimentDisabledError extends Error {
  readonly _tag = 'ExperimentDisabledError';
  constructor(experimentName: string) {
    super(`Experiment is disabled: ${experimentName}`);
  }
}

export class InvalidRatingError extends Error {
  readonly _tag = 'InvalidRatingError';
  constructor(rating: number) {
    super(`Rating must be between 1-5, got: ${rating}`);
  }
}

// ============================================================================
// TYPES
// ============================================================================

export interface Experiment {
  id: string;
  name: string;
  description: string;
  experimentType: string;
  status: 'draft' | 'active' | 'archived';
  isEnabled: boolean;
  usageCount: number;
  feedbackCount: number;
  avgRating: number;
  properties: Record<string, any>;
}

export interface ExperimentUsageEvent {
  experimentId: string;
  eventType: 'viewed' | 'clicked' | 'completed' | 'error';
  metadata?: Record<string, any>;
}

export interface ExperimentFeedback {
  experimentId: string;
  rating: number; // 1-5
  feedback: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export interface ABTestVariant {
  id: string;
  name: string;
  weight: number; // 0-100 percentage
  config: Record<string, any>;
}

export interface ABTest {
  experimentId: string;
  variants: ABTestVariant[];
  userAssignments: Map<string, string>; // userId -> variantId
}

// ============================================================================
// SERVICE
// ============================================================================

export class LabsService extends Context.Tag('LabsService')<
  LabsService,
  {
    /**
     * Enable or disable an experiment for current user
     */
    setFeatureFlag: (
      experimentId: string,
      enabled: boolean
    ) => Effect.Effect<{ success: boolean; enabled: boolean }, Error>;

    /**
     * Get all active experiments for current user
     */
    getActiveExperiments: () => Effect.Effect<Experiment[], Error>;

    /**
     * Track experiment usage event
     */
    trackUsage: (
      event: ExperimentUsageEvent
    ) => Effect.Effect<{ success: boolean }, Error>;

    /**
     * Submit feedback for experiment
     */
    submitFeedback: (
      feedback: ExperimentFeedback
    ) => Effect.Effect<{ success: boolean; knowledgeId: string }, Error>;

    /**
     * List all experiments (with enabled status)
     */
    listExperiments: (
      statusFilter?: string
    ) => Effect.Effect<Experiment[], Error>;

    /**
     * Check if experiment is enabled
     */
    isExperimentEnabled: (
      experimentId: string
    ) => Effect.Effect<boolean, Error>;

    /**
     * A/B Testing: Assign user to variant
     */
    assignToVariant: (
      test: ABTest,
      userId: string
    ) => Effect.Effect<ABTestVariant, Error>;

    /**
     * A/B Testing: Get assigned variant for user
     */
    getAssignedVariant: (
      test: ABTest,
      userId: string
    ) => Effect.Effect<ABTestVariant, Error>;
  }
>() {}

// ============================================================================
// IMPLEMENTATION
// ============================================================================

/**
 * Create LabsService implementation
 */
export const makeLabsService = (convex: any) =>
  Effect.succeed(
    LabsService.of({
      /**
       * Set feature flag (enable/disable experiment)
       */
      setFeatureFlag: (experimentId: string, enabled: boolean) =>
        Effect.tryPromise({
          try: async () =>
            await convex.mutation('mutations/feature-flags:setFeatureFlag', {
              experimentId,
              enabled,
            }),
          catch: (error) =>
            new Error(
              `Failed to set feature flag: ${error instanceof Error ? error.message : String(error)}`
            ),
        }),

      /**
       * Get active experiments for current user
       */
      getActiveExperiments: () =>
        Effect.tryPromise({
          try: async () =>
            await convex.mutation(
              'mutations/feature-flags:getActiveExperiments',
              {}
            ),
          catch: (error) =>
            new Error(
              `Failed to get active experiments: ${error instanceof Error ? error.message : String(error)}`
            ),
        }),

      /**
       * Track experiment usage
       */
      trackUsage: (event: ExperimentUsageEvent) =>
        Effect.tryPromise({
          try: async () =>
            await convex.mutation(
              'mutations/feature-flags:trackExperimentUsage',
              {
                experimentId: event.experimentId,
                eventType: event.eventType,
                metadata: event.metadata,
              }
            ),
          catch: (error) =>
            new Error(
              `Failed to track usage: ${error instanceof Error ? error.message : String(error)}`
            ),
        }),

      /**
       * Submit feedback
       */
      submitFeedback: (feedback: ExperimentFeedback) =>
        Effect.gen(function* () {
          // Validate rating
          if (feedback.rating < 1 || feedback.rating > 5) {
            return yield* Effect.fail(new InvalidRatingError(feedback.rating));
          }

          // Submit to backend
          return yield* Effect.tryPromise({
            try: async () =>
              await convex.mutation(
                'mutations/feature-flags:submitExperimentFeedback',
                feedback
              ),
            catch: (error) =>
              new Error(
                `Failed to submit feedback: ${error instanceof Error ? error.message : String(error)}`
              ),
          });
        }),

      /**
       * List all experiments
       */
      listExperiments: (statusFilter?: string) =>
        Effect.tryPromise({
          try: async () =>
            await convex.mutation('mutations/feature-flags:listExperiments', {
              status: statusFilter,
            }),
          catch: (error) =>
            new Error(
              `Failed to list experiments: ${error instanceof Error ? error.message : String(error)}`
            ),
        }),

      /**
       * Check if experiment is enabled
       */
      isExperimentEnabled: (experimentId: string) =>
        Effect.gen(function* () {
          const activeExperiments = yield* Effect.tryPromise({
            try: async () =>
              await convex.mutation(
                'mutations/feature-flags:getActiveExperiments',
                {}
              ),
            catch: (error) =>
              new Error(
                `Failed to check experiment: ${error instanceof Error ? error.message : String(error)}`
              ),
          });

          return activeExperiments.some(
            (exp: any) => exp.experimentId === experimentId
          );
        }),

      /**
       * Assign user to A/B test variant
       * Uses deterministic hashing for consistent assignment
       */
      assignToVariant: (test: ABTest, userId: string) =>
        Effect.gen(function* () {
          // Check if already assigned
          const existing = test.userAssignments.get(userId);
          if (existing) {
            const variant = test.variants.find((v) => v.id === existing);
            if (variant) return variant;
          }

          // Assign using weighted random distribution
          const hash = yield* Effect.sync(() => simpleHash(userId));
          const totalWeight = test.variants.reduce((sum, v) => sum + v.weight, 0);
          const target = (hash % totalWeight) + 1;

          let cumulative = 0;
          for (const variant of test.variants) {
            cumulative += variant.weight;
            if (target <= cumulative) {
              test.userAssignments.set(userId, variant.id);
              return variant;
            }
          }

          // Fallback to first variant
          const fallback = test.variants[0];
          test.userAssignments.set(userId, fallback.id);
          return fallback;
        }),

      /**
       * Get assigned variant for user
       */
      getAssignedVariant: (test: ABTest, userId: string) =>
        Effect.gen(function* () {
          const variantId = test.userAssignments.get(userId);
          if (!variantId) {
            // Not assigned yet, assign now
            return yield* Effect.succeed(
              test.variants[0]
            ); // Or call assignToVariant
          }

          const variant = test.variants.find((v) => v.id === variantId);
          if (!variant) {
            return yield* Effect.fail(
              new ExperimentNotFoundError(variantId)
            );
          }

          return variant;
        }),
    })
  );

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Simple hash function for deterministic user assignment
 * Uses djb2 algorithm
 */
function simpleHash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i);
  }
  return Math.abs(hash);
}

/**
 * Auto-detect sentiment from feedback text
 */
export function detectSentiment(text: string): 'positive' | 'neutral' | 'negative' {
  const lowerText = text.toLowerCase();

  const positiveWords = ['great', 'awesome', 'love', 'excellent', 'amazing', 'fantastic', 'helpful'];
  const negativeWords = ['bad', 'terrible', 'hate', 'awful', 'useless', 'broken', 'frustrating'];

  let positiveCount = 0;
  let negativeCount = 0;

  positiveWords.forEach(word => {
    if (lowerText.includes(word)) positiveCount++;
  });

  negativeWords.forEach(word => {
    if (lowerText.includes(word)) negativeCount++;
  });

  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

/**
 * Calculate experiment health score (0-100)
 */
export function calculateHealthScore(experiment: Experiment): number {
  if (experiment.feedbackCount === 0) return 50; // No feedback yet

  // Weight: 70% rating, 30% usage
  const ratingScore = (experiment.avgRating / 5) * 70;
  const usageScore = Math.min(experiment.usageCount / 100, 1) * 30;

  return Math.round(ratingScore + usageScore);
}

/**
 * Determine if experiment should be promoted from lab to production
 */
export function shouldPromote(experiment: Experiment): boolean {
  return (
    experiment.feedbackCount >= 10 &&
    experiment.avgRating >= 4.0 &&
    experiment.usageCount >= 50
  );
}
