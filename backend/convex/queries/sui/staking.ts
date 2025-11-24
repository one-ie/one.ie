/**
 * Staking Queries - Convex Layer
 *
 * Read operations for staking pools and user stakes.
 * Some queries use StakingService for complex calculations.
 *
 * Maps to 6-dimension ontology:
 * - THINGS: staking_pool (pool entities)
 * - CONNECTIONS: staked_in (staker → pool)
 * - EVENTS: tokens_staked, tokens_unstaked, staking_reward_claimed
 *
 * @module queries/sui/staking
 */

import { query } from "../../_generated/server";
import { v } from "convex/values";
import { Effect, pipe } from "effect";
import {
  StakingService,
  StakingServiceLive,
  DatabaseContext,
  ServiceError,
  StakingPoolEntity,
  PoolStats,
} from "../../services/sui/StakingService";
import { Id } from "../../_generated/dataModel";
import {
  StakingPoolProperties,
  StakedInMetadata,
} from "../../types/crypto";

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
    return null; // Queries can be public
  }

  // Find person thing by tokenIdentifier
  const person = await ctx.db
    .query("things")
    .withIndex("by_type", (q: any) => q.eq("type", "creator"))
    .filter((q: any) =>
      q.eq(q.field("properties.tokenIdentifier"), identity.tokenIdentifier)
    )
    .first();

  return person;
};

// ============================================================================
// Queries
// ============================================================================

/**
 * Get staking pool by ID
 *
 * @example
 * const pool = await getPool({ poolId: "kg123..." });
 */
export const getPool = query({
  args: {
    poolId: v.id("things"),
  },
  handler: async (ctx, args): Promise<StakingPoolEntity | null> => {
    const pool = await ctx.db.get(args.poolId);

    if (!pool || pool.type !== "staking_pool") {
      return null;
    }

    const props = pool.properties as StakingPoolProperties;

    // Find the token this pool is for
    const connections = await ctx.db
      .query("connections")
      .withIndex("by_from", (q: any) => q.eq("fromThingId", args.poolId))
      .collect();

    // The pool should have a connection to a token (if we track it that way)
    // For now, get tokenId from the pool properties if available
    // or from creator's token ownership
    const tokenId = props.tokenType
      ? ((await ctx.db
          .query("things")
          .withIndex("by_type", (q: any) => q.eq("type", "token"))
          .filter((q: any) =>
            q.eq(q.field("properties.coinType"), props.tokenType)
          )
          .first())?._id as Id<"things">)
      : (args.poolId as Id<"things">); // Fallback

    return {
      poolId: pool._id,
      tokenId: tokenId || (pool._id as Id<"things">),
      rewardRate: props.rewardRate,
      lockDuration: props.lockDuration,
      totalStaked: props.totalStaked,
      groupId: pool.groupId as Id<"groups">,
      status: pool.status as "active" | "paused" | "closed",
      createdAt: pool.createdAt,
    };
  },
});

/**
 * Get all staking pools for a specific token
 *
 * @example
 * const pools = await getPoolsByToken({ tokenId: "kg123..." });
 */
export const getPoolsByToken = query({
  args: {
    tokenId: v.id("things"),
  },
  handler: async (ctx, args): Promise<StakingPoolEntity[]> => {
    // Get the token to find its coinType
    const token = await ctx.db.get(args.tokenId);
    if (!token || token.type !== "token") {
      return [];
    }

    const coinType = token.properties?.coinType;
    if (!coinType) {
      return [];
    }

    // Find all staking pools with this coinType
    const pools = await ctx.db
      .query("things")
      .withIndex("by_type", (q: any) => q.eq("type", "staking_pool"))
      .filter((q: any) => q.eq(q.field("properties.tokenType"), coinType))
      .collect();

    return pools.map((pool) => {
      const props = pool.properties as StakingPoolProperties;
      return {
        poolId: pool._id,
        tokenId: args.tokenId,
        rewardRate: props.rewardRate,
        lockDuration: props.lockDuration,
        totalStaked: props.totalStaked,
        groupId: pool.groupId as Id<"groups">,
        status: pool.status as "active" | "paused" | "closed",
        createdAt: pool.createdAt,
      };
    });
  },
});

/**
 * Get user's stakes across all pools
 *
 * @example
 * const stakes = await getUserStakes();
 * const stakes = await getUserStakes({ userId: "kg456..." });
 */
export const getUserStakes = query({
  args: {
    userId: v.optional(v.id("things")), // Optional: defaults to current user
  },
  handler: async (ctx, args) => {
    // Get user (provided or authenticated)
    const user = args.userId
      ? await ctx.db.get(args.userId)
      : await getAuthenticatedUser(ctx);

    if (!user) {
      return [];
    }

    // Find all staking connections for this user
    const stakes = await ctx.db
      .query("connections")
      .withIndex("from_type", (q: any) =>
        q.eq("fromThingId", user._id).eq("relationshipType", "staked_in")
      )
      .filter((q: any) => !q.field("validTo")) // Only active stakes
      .collect();

    // Enrich with pool information
    const enrichedStakes = await Promise.all(
      stakes.map(async (stake) => {
        const pool = await ctx.db.get(stake.toThingId);
        const metadata = stake.metadata as StakedInMetadata;

        return {
          poolId: stake.toThingId,
          poolName: pool?.name || "Unknown Pool",
          amount: metadata.amount,
          startTime: metadata.startTime,
          lockEnd: metadata.lockEnd,
          rewards: metadata.rewards,
          status: Date.now() >= metadata.lockEnd ? "unlocked" : "locked",
        };
      })
    );

    return enrichedStakes;
  },
});

/**
 * Calculate pending rewards for a staker
 *
 * @example
 * const { pendingRewards } = await calculateRewards({
 *   poolId: "kg123...",
 *   stakerId: "kg456..."
 * });
 */
export const calculateRewards = query({
  args: {
    poolId: v.id("things"),
    stakerId: v.optional(v.id("things")), // Optional: defaults to current user
  },
  handler: async (ctx, args) => {
    // Get staker (provided or authenticated)
    const staker = args.stakerId
      ? await ctx.db.get(args.stakerId)
      : await getAuthenticatedUser(ctx);

    if (!staker) {
      throw new Error("Not authenticated");
    }

    // Call StakingService to calculate rewards
    const dbContext = createDatabaseContext(ctx);

    const program = pipe(
      StakingService.calculateRewards({
        poolId: args.poolId,
        stakerId: staker._id,
      }),
      Effect.provideService(DatabaseContext, dbContext),
      Effect.provide(StakingServiceLive),
      Effect.runPromise
    );

    try {
      const pendingRewards = await program;
      return { pendingRewards: pendingRewards.toString() };
    } catch (error) {
      if (typeof error === "object" && error !== null && "_tag" in error) {
        const serviceError = error as ServiceError;
        if (serviceError._tag === "StakeNotFoundError") {
          return { pendingRewards: "0" };
        }
      }
      throw error;
    }
  },
});

/**
 * Get pool statistics (TVL, APY, stakers, status)
 *
 * @example
 * const stats = await getPoolStats({ poolId: "kg123..." });
 */
export const getPoolStats = query({
  args: {
    poolId: v.id("things"),
  },
  handler: async (ctx, args): Promise<PoolStats | null> => {
    // Call StakingService to get pool stats
    const dbContext = createDatabaseContext(ctx);

    const program = pipe(
      StakingService.getPoolStats({
        poolId: args.poolId,
      }),
      Effect.provideService(DatabaseContext, dbContext),
      Effect.provide(StakingServiceLive),
      Effect.runPromise
    );

    try {
      const stats = await program;
      return stats;
    } catch (error) {
      if (typeof error === "object" && error !== null && "_tag" in error) {
        const serviceError = error as ServiceError;
        if (serviceError._tag === "PoolNotFoundError") {
          return null;
        }
      }
      throw error;
    }
  },
});
