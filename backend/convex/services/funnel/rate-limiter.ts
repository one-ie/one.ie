/**
 * Rate Limiting Service for Funnel Builder
 *
 * Prevents abuse by enforcing resource limits:
 * - Max 100 funnels per organization (groupId)
 * - Max 50 steps per funnel
 *
 * Part of Cycle 19: Add Rate Limiting
 * @see /one/things/plans/clickfunnels-builder-100-cycles.md
 */

import { Effect } from "effect";
import { Id } from "../../_generated/dataModel";

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Rate limit exceeded error
 */
export class RateLimitError {
  readonly _tag = "RateLimitError";

  constructor(
    public readonly message: string,
    public readonly resourceType: "funnel" | "step",
    public readonly currentCount: number,
    public readonly limit: number,
    public readonly resourceId?: string
  ) {}
}

/**
 * Resource not found error
 */
export class ResourceNotFoundError {
  readonly _tag = "ResourceNotFoundError";

  constructor(
    public readonly resourceType: string,
    public readonly resourceId: string
  ) {}
}

// ============================================================================
// TYPES
// ============================================================================

export interface FunnelCount {
  groupId: Id<"groups">;
  count: number;
}

export interface StepCount {
  funnelId: Id<"things">;
  count: number;
}

export interface RateLimitCheck {
  allowed: boolean;
  currentCount: number;
  limit: number;
  remaining: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const RATE_LIMITS = {
  MAX_FUNNELS_PER_GROUP: 100,
  MAX_STEPS_PER_FUNNEL: 50,
} as const;

// ============================================================================
// SERVICE INTERFACE
// ============================================================================

/**
 * Rate Limiter Service
 *
 * Pure business logic for rate limiting validation.
 * Database queries should be provided by the caller (Convex mutations).
 */
export const RateLimiterService = {
  /**
   * Check if a group can create a new funnel
   *
   * @param currentCount - Current number of funnels in the group
   * @returns Effect that succeeds if limit not reached, fails with RateLimitError otherwise
   */
  checkFunnelCreation: (currentCount: number, groupId: string) =>
    Effect.gen(function* () {
      const limit = RATE_LIMITS.MAX_FUNNELS_PER_GROUP;

      if (currentCount >= limit) {
        return yield* Effect.fail(
          new RateLimitError(
            `Maximum ${limit} funnels per organization. Current: ${currentCount}`,
            "funnel",
            currentCount,
            limit,
            groupId
          )
        );
      }

      return {
        allowed: true,
        currentCount,
        limit,
        remaining: limit - currentCount,
      };
    }),

  /**
   * Check if a funnel can add a new step
   *
   * @param currentCount - Current number of steps in the funnel
   * @param funnelId - ID of the funnel
   * @returns Effect that succeeds if limit not reached, fails with RateLimitError otherwise
   */
  checkStepCreation: (currentCount: number, funnelId: string) =>
    Effect.gen(function* () {
      const limit = RATE_LIMITS.MAX_STEPS_PER_FUNNEL;

      if (currentCount >= limit) {
        return yield* Effect.fail(
          new RateLimitError(
            `Maximum ${limit} steps per funnel. Current: ${currentCount}`,
            "step",
            currentCount,
            limit,
            funnelId
          )
        );
      }

      return {
        allowed: true,
        currentCount,
        limit,
        remaining: limit - currentCount,
      };
    }),

  /**
   * Validate funnel count for a group
   *
   * @param funnelCount - Funnel count data
   * @returns Effect with validation result
   */
  validateFunnelCount: (funnelCount: FunnelCount) =>
    Effect.gen(function* () {
      return yield* RateLimiterService.checkFunnelCreation(
        funnelCount.count,
        funnelCount.groupId
      );
    }),

  /**
   * Validate step count for a funnel
   *
   * @param stepCount - Step count data
   * @returns Effect with validation result
   */
  validateStepCount: (stepCount: StepCount) =>
    Effect.gen(function* () {
      return yield* RateLimiterService.checkStepCreation(
        stepCount.count,
        stepCount.funnelId
      );
    }),

  /**
   * Get rate limit status for a group
   *
   * @param currentCount - Current funnel count
   * @returns Rate limit check result (non-throwing)
   */
  getFunnelLimitStatus: (currentCount: number): RateLimitCheck => {
    const limit = RATE_LIMITS.MAX_FUNNELS_PER_GROUP;
    return {
      allowed: currentCount < limit,
      currentCount,
      limit,
      remaining: Math.max(0, limit - currentCount),
    };
  },

  /**
   * Get rate limit status for a funnel
   *
   * @param currentCount - Current step count
   * @returns Rate limit check result (non-throwing)
   */
  getStepLimitStatus: (currentCount: number): RateLimitCheck => {
    const limit = RATE_LIMITS.MAX_STEPS_PER_FUNNEL;
    return {
      allowed: currentCount < limit,
      currentCount,
      limit,
      remaining: Math.max(0, limit - currentCount),
    };
  },
};

// ============================================================================
// UTILITY FUNCTIONS FOR CONVEX INTEGRATION
// ============================================================================

/**
 * Helper to count funnels for a group (to be used in Convex mutations)
 *
 * Example usage in mutation:
 * ```typescript
 * const count = await countFunnelsForGroup(ctx.db, groupId);
 * const check = await Effect.runPromise(
 *   RateLimiterService.checkFunnelCreation(count, groupId)
 * );
 * ```
 */
export async function countFunnelsForGroup(
  db: any, // DatabaseReader from Convex
  groupId: Id<"groups">
): Promise<number> {
  const funnels = await db
    .query("things")
    .withIndex("by_group_type", (q: any) =>
      q.eq("groupId", groupId).eq("type", "funnel")
    )
    .filter((thing: any) => thing.status !== "archived")
    .collect();

  return funnels.length;
}

/**
 * Helper to count steps for a funnel (to be used in Convex mutations)
 *
 * Example usage in mutation:
 * ```typescript
 * const count = await countStepsForFunnel(ctx.db, funnelId);
 * const check = await Effect.runPromise(
 *   RateLimiterService.checkStepCreation(count, funnelId)
 * );
 * ```
 */
export async function countStepsForFunnel(
  db: any, // DatabaseReader from Convex
  funnelId: Id<"things">
): Promise<number> {
  // Query connections to count steps
  const connections = await db
    .query("connections")
    .withIndex("from_type", (q: any) =>
      q.eq("fromThingId", funnelId).eq("relationshipType", "funnel_contains_step")
    )
    .collect();

  return connections.length;
}

/**
 * Alternative: Count steps by querying things directly if steps reference funnel in properties
 */
export async function countStepsForFunnelDirect(
  db: any, // DatabaseReader from Convex
  funnelId: Id<"things">
): Promise<number> {
  const steps = await db
    .query("things")
    .withIndex("by_type", (q: any) => q.eq("type", "funnel_step"))
    .filter((thing: any) =>
      thing.properties?.funnelId === funnelId &&
      thing.status !== "archived"
    )
    .collect();

  return steps.length;
}

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

/**
 * Example integration in a Convex mutation:
 *
 * ```typescript
 * // mutations/funnels.ts
 * import { mutation } from "./_generated/server";
 * import { v } from "convex/values";
 * import { Effect } from "effect";
 * import {
 *   RateLimiterService,
 *   countFunnelsForGroup,
 *   RateLimitError
 * } from "../services/funnel/rate-limiter";
 *
 * export const create = mutation({
 *   args: {
 *     name: v.string(),
 *     description: v.optional(v.string()),
 *   },
 *   handler: async (ctx, args) => {
 *     // 1. Authenticate
 *     const identity = await ctx.auth.getUserIdentity();
 *     if (!identity) throw new Error("Not authenticated");
 *
 *     // 2. Get user's group
 *     const person = await ctx.db.query("things")
 *       .withIndex("by_type", q => q.eq("type", "creator"))
 *       .filter(t => t.properties?.email === identity.email)
 *       .first();
 *
 *     if (!person?.groupId) throw new Error("User must belong to a group");
 *
 *     // 3. Check rate limit
 *     const currentCount = await countFunnelsForGroup(ctx.db, person.groupId);
 *
 *     try {
 *       await Effect.runPromise(
 *         RateLimiterService.checkFunnelCreation(currentCount, person.groupId)
 *       );
 *     } catch (error) {
 *       if (error instanceof RateLimitError) {
 *         throw new Error(error.message);
 *       }
 *       throw error;
 *     }
 *
 *     // 4. Create funnel
 *     const funnelId = await ctx.db.insert("things", {
 *       type: "funnel",
 *       name: args.name,
 *       groupId: person.groupId,
 *       properties: {
 *         description: args.description,
 *         slug: args.name.toLowerCase().replace(/\s+/g, "-"),
 *       },
 *       status: "draft",
 *       createdAt: Date.now(),
 *       updatedAt: Date.now(),
 *     });
 *
 *     // 5. Log event
 *     await ctx.db.insert("events", {
 *       type: "funnel_created",
 *       actorId: person._id,
 *       targetId: funnelId,
 *       timestamp: Date.now(),
 *       metadata: {
 *         funnelName: args.name,
 *         groupId: person.groupId,
 *       },
 *     });
 *
 *     return funnelId;
 *   },
 * });
 * ```
 */
