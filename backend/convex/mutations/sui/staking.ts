/**
 * Staking Mutations - Convex Layer
 *
 * Thin wrappers around StakingService (Effect.ts business logic).
 * Handles authentication, database injection, and error mapping.
 *
 * Maps to 6-dimension ontology:
 * - THINGS: staking_pool (pool entities)
 * - CONNECTIONS: staked_in (staker → pool)
 * - EVENTS: tokens_staked, tokens_unstaked, staking_reward_claimed
 *
 * @module mutations/sui/staking
 */

import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { Effect, pipe } from "effect";
import {
  StakingService,
  StakingServiceLive,
  DatabaseContext,
  ServiceError,
} from "../../services/sui/StakingService";
import { Id } from "../../_generated/dataModel";

// ============================================================================
// Database Context Provider (Dependency Injection)
// ============================================================================

/**
 * Create database operations context from Convex ctx
 */
const createDatabaseContext = (ctx: any) => ({
  // Things table operations
  insertThing: async (data: any) => await ctx.db.insert("things", data),
  getThing: async (id: Id<"things">) => await ctx.db.get(id),
  patchThing: async (id: Id<"things">, data: any) =>
    await ctx.db.patch(id, data),
  queryThings: async (filter: any) => {
    let q = ctx.db.query("things");
    if (filter.type) {
      q = q.withIndex("by_type", (q: any) => q.eq("type", filter.type));
    }
    if (filter.groupId) {
      q = q.withIndex("by_group_type", (q: any) =>
        q.eq("groupId", filter.groupId).eq("type", filter.type)
      );
    }
    return await q.collect();
  },

  // Connections table operations
  insertConnection: async (data: any) =>
    await ctx.db.insert("connections", data),
  getConnection: async (filter: {
    fromThingId: Id<"things">;
    toThingId: Id<"things">;
    relationshipType: string;
  }) => {
    const connection = await ctx.db
      .query("connections")
      .withIndex("from_type", (q: any) =>
        q
          .eq("fromThingId", filter.fromThingId)
          .eq("relationshipType", filter.relationshipType)
      )
      .filter((q: any) => q.eq(q.field("toThingId"), filter.toThingId))
      .first();
    return connection;
  },
  patchConnection: async (id: Id<"connections">, data: any) =>
    await ctx.db.patch(id, data),

  // Events table operations
  insertEvent: async (data: any) => await ctx.db.insert("events", data),

  // Count operations
  countConnections: async (filter: {
    toThingId: Id<"things">;
    relationshipType: string;
  }) => {
    const connections = await ctx.db
      .query("connections")
      .withIndex("to_type", (q: any) =>
        q
          .eq("toThingId", filter.toThingId)
          .eq("relationshipType", filter.relationshipType)
      )
      .filter((q: any) => !q.field("validTo")) // Only active connections
      .collect();
    return connections.length;
  },
});

/**
 * Get authenticated user (person thing) from context
 */
const getAuthenticatedUser = async (ctx: any) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  // Find person thing by tokenIdentifier
  const person = await ctx.db
    .query("things")
    .withIndex("by_type", (q: any) => q.eq("type", "creator"))
    .filter((q: any) =>
      q.eq(q.field("properties.tokenIdentifier"), identity.tokenIdentifier)
    )
    .first();

  if (!person) {
    throw new Error("User not found");
  }

  return person;
};

// ============================================================================
// Error Mapping (Effect → Convex)
// ============================================================================

/**
 * Map Effect errors to user-friendly error messages
 */
const mapServiceError = (error: ServiceError): string => {
  switch (error._tag) {
    case "InsufficientBalanceError":
      return `Insufficient balance. Required: ${error.required}, Available: ${error.available}`;
    case "StillLockedError":
      const lockEndDate = new Date(error.lockEnd).toISOString();
      return `Tokens are still locked until ${lockEndDate}`;
    case "PoolNotFoundError":
      return `Staking pool not found: ${error.poolId}`;
    case "InvalidAmountError":
      return error.message;
    case "StakeNotFoundError":
      return `No stake found in this pool`;
    case "DatabaseError":
      return `Database error: ${error.message}`;
  }
};

// ============================================================================
// Mutations
// ============================================================================

/**
 * Create a new staking pool
 *
 * @example
 * await createPool({
 *   tokenId: "kg123...",
 *   rewardRate: "0.15",  // 15% APY
 *   lockDuration: 7776000000, // 90 days in ms
 *   name: "90-Day Staking Pool"
 * });
 */
export const createPool = mutation({
  args: {
    tokenId: v.id("things"),
    rewardRate: v.string(), // APY as decimal string (e.g., "0.15" = 15%)
    lockDuration: v.number(), // Lock duration in milliseconds
    minStake: v.optional(v.string()),
    maxStake: v.optional(v.string()),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE: Get user identity
    const person = await getAuthenticatedUser(ctx);

    // 2. VALIDATE GROUP: Check context
    if (!person.groupId) {
      throw new Error("No organization context");
    }

    const group = await ctx.db.get(person.groupId);
    if (!group || group.status !== "active") {
      throw new Error("Invalid organization");
    }

    // 3. CREATE POOL: Call StakingService
    const dbContext = createDatabaseContext(ctx);

    const program = pipe(
      StakingService.createStakingPool({
        tokenId: args.tokenId,
        rewardRate: args.rewardRate,
        lockDuration: args.lockDuration,
        groupId: person.groupId,
        creatorId: person._id,
        minStake: args.minStake,
        maxStake: args.maxStake,
        name: args.name,
      }),
      Effect.provideService(DatabaseContext, dbContext),
      Effect.provide(StakingServiceLive),
      Effect.runPromise
    );

    try {
      const pool = await program;
      return pool.poolId;
    } catch (error) {
      if (typeof error === "object" && error !== null && "_tag" in error) {
        throw new Error(mapServiceError(error as ServiceError));
      }
      throw error;
    }
  },
});

/**
 * Stake tokens in a pool
 *
 * @example
 * await stake({
 *   poolId: "kg123...",
 *   amount: "1000000000000000" // 1M tokens
 * });
 */
export const stake = mutation({
  args: {
    poolId: v.id("things"),
    amount: v.string(), // Amount as string for big numbers
  },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE: Get user identity
    const person = await getAuthenticatedUser(ctx);

    // 2. STAKE TOKENS: Call StakingService
    const dbContext = createDatabaseContext(ctx);

    const program = pipe(
      StakingService.stakeTokens({
        poolId: args.poolId,
        stakerId: person._id,
        amount: args.amount,
      }),
      Effect.provideService(DatabaseContext, dbContext),
      Effect.provide(StakingServiceLive),
      Effect.runPromise
    );

    try {
      await program;
      return { success: true };
    } catch (error) {
      if (typeof error === "object" && error !== null && "_tag" in error) {
        throw new Error(mapServiceError(error as ServiceError));
      }
      throw error;
    }
  },
});

/**
 * Unstake tokens from a pool
 *
 * @example
 * await unstake({
 *   poolId: "kg123...",
 *   amount: "500000000000000" // 500K tokens
 * });
 */
export const unstake = mutation({
  args: {
    poolId: v.id("things"),
    amount: v.string(), // Amount as string for big numbers
  },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE: Get user identity
    const person = await getAuthenticatedUser(ctx);

    // 2. CALCULATE REWARDS BEFORE UNSTAKING
    const dbContext = createDatabaseContext(ctx);

    const rewardsProgram = pipe(
      StakingService.calculateRewards({
        poolId: args.poolId,
        stakerId: person._id,
      }),
      Effect.provideService(DatabaseContext, dbContext),
      Effect.provide(StakingServiceLive),
      Effect.runPromise
    );

    // 3. UNSTAKE TOKENS: Call StakingService
    const unstakeProgram = pipe(
      StakingService.unstakeTokens({
        poolId: args.poolId,
        stakerId: person._id,
        amount: args.amount,
      }),
      Effect.provideService(DatabaseContext, dbContext),
      Effect.provide(StakingServiceLive),
      Effect.runPromise
    );

    try {
      const rewards = await rewardsProgram;
      await unstakeProgram;

      return {
        stake: args.amount,
        rewards: rewards.toString(),
      };
    } catch (error) {
      if (typeof error === "object" && error !== null && "_tag" in error) {
        throw new Error(mapServiceError(error as ServiceError));
      }
      throw error;
    }
  },
});

/**
 * Claim staking rewards without unstaking
 *
 * @example
 * await claimRewards({
 *   poolId: "kg123..."
 * });
 */
export const claimRewards = mutation({
  args: {
    poolId: v.id("things"),
  },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE: Get user identity
    const person = await getAuthenticatedUser(ctx);

    // 2. CLAIM REWARDS: Call StakingService
    const dbContext = createDatabaseContext(ctx);

    const program = pipe(
      StakingService.claimRewards({
        poolId: args.poolId,
        stakerId: person._id,
      }),
      Effect.provideService(DatabaseContext, dbContext),
      Effect.provide(StakingServiceLive),
      Effect.runPromise
    );

    try {
      const rewards = await program;
      return { amountClaimed: rewards.toString() };
    } catch (error) {
      if (typeof error === "object" && error !== null && "_tag" in error) {
        throw new Error(mapServiceError(error as ServiceError));
      }
      throw error;
    }
  },
});
