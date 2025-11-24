/**
 * Integration Example: Sui Staking Contract ↔ Convex Backend
 *
 * This file demonstrates how to integrate Sui Move staking events
 * into the ONE platform's 6-dimension ontology via Convex backend.
 *
 * Architecture:
 * Sui Move Contract → Event Listener → Convex Mutations → 6-Dimension Ontology
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ==================== Event Handlers ====================

/**
 * Handle PoolCreated event from Sui
 * Maps to: THINGS dimension (type: staking_pool)
 */
export const handlePoolCreated = mutation({
  args: {
    poolId: v.string(),
    tokenType: v.string(),
    rewardRate: v.number(),
    lockDuration: v.number(),
    owner: v.string(),
    organizationId: v.optional(v.string()),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE: Get user identity (pool creator)
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const person = await ctx.db
      .query("people")
      .withIndex("by_email", (q) => q.eq("email", identity.email))
      .first();

    if (!person?.organizationId) throw new Error("No organization");

    // 2. CREATE THING: Staking pool entity
    const poolThingId = await ctx.db.insert("things", {
      type: "staking_pool",
      name: `Staking Pool - ${args.tokenType}`,
      organizationId: person.organizationId,
      properties: {
        poolId: args.poolId,
        tokenType: args.tokenType,
        rewardRate: args.rewardRate,
        lockDuration: args.lockDuration,
        totalStaked: 0,
        protocol: "sui",
      },
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // 3. CREATE CONNECTION: Owner relationship
    await ctx.db.insert("connections", {
      fromThingId: person._id,
      toThingId: poolThingId,
      relationshipType: "owns",
      metadata: {
        role: "pool_owner",
        canUpdateRewardRate: true,
      },
      validFrom: args.timestamp,
      createdAt: Date.now(),
    });

    // 4. LOG EVENT: Pool creation
    await ctx.db.insert("events", {
      type: "entity_created",
      actorId: person._id,
      targetId: poolThingId,
      timestamp: args.timestamp,
      metadata: {
        entityType: "staking_pool",
        protocol: "sui",
        poolId: args.poolId,
        rewardRate: args.rewardRate,
        lockDuration: args.lockDuration,
      },
    });

    return poolThingId;
  },
});

/**
 * Handle Staked event from Sui
 * Maps to: CONNECTIONS dimension (staked_in relationship)
 */
export const handleStaked = mutation({
  args: {
    poolId: v.string(),
    positionId: v.string(),
    staker: v.string(),
    amount: v.number(),
    lockEnd: v.number(),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    // 1. Find pool thing
    const poolThing = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "staking_pool"))
      .filter((q) =>
        q.eq(q.field("properties.poolId"), args.poolId)
      )
      .first();

    if (!poolThing) throw new Error("Pool not found");

    // 2. Find staker person
    const staker = await ctx.db
      .query("people")
      .filter((q) => q.eq(q.field("walletAddress"), args.staker))
      .first();

    if (!staker) throw new Error("Staker not found");

    // 3. CREATE CONNECTION: Staked relationship
    const connectionId = await ctx.db.insert("connections", {
      fromThingId: staker._id,
      toThingId: poolThing._id,
      relationshipType: "staked_in",
      metadata: {
        positionId: args.positionId,
        amount: args.amount,
        lockEnd: args.lockEnd,
        protocol: "sui",
        status: "active",
      },
      validFrom: args.timestamp,
      createdAt: Date.now(),
    });

    // 4. UPDATE POOL: Increment total staked
    const currentTotal = poolThing.properties.totalStaked || 0;
    await ctx.db.patch(poolThing._id, {
      properties: {
        ...poolThing.properties,
        totalStaked: currentTotal + args.amount,
      },
      updatedAt: Date.now(),
    });

    // 5. LOG EVENT: Staked
    await ctx.db.insert("events", {
      type: "staked",
      actorId: staker._id,
      targetId: poolThing._id,
      timestamp: args.timestamp,
      metadata: {
        protocol: "sui",
        positionId: args.positionId,
        amount: args.amount,
        lockEnd: args.lockEnd,
        connectionId,
      },
    });

    return connectionId;
  },
});

/**
 * Handle RewardsClaimed event from Sui
 * Maps to: EVENTS dimension (rewards_claimed)
 */
export const handleRewardsClaimed = mutation({
  args: {
    poolId: v.string(),
    positionId: v.string(),
    staker: v.string(),
    rewards: v.number(),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    // 1. Find pool thing
    const poolThing = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "staking_pool"))
      .filter((q) =>
        q.eq(q.field("properties.poolId"), args.poolId)
      )
      .first();

    if (!poolThing) throw new Error("Pool not found");

    // 2. Find staker
    const staker = await ctx.db
      .query("people")
      .filter((q) => q.eq(q.field("walletAddress"), args.staker))
      .first();

    if (!staker) throw new Error("Staker not found");

    // 3. Update connection metadata (track total claimed)
    const connection = await ctx.db
      .query("connections")
      .filter((q) =>
        q.and(
          q.eq(q.field("fromThingId"), staker._id),
          q.eq(q.field("toThingId"), poolThing._id),
          q.eq(q.field("metadata.positionId"), args.positionId)
        )
      )
      .first();

    if (connection) {
      const totalClaimed = (connection.metadata.totalClaimed || 0) + args.rewards;
      await ctx.db.patch(connection._id, {
        metadata: {
          ...connection.metadata,
          totalClaimed,
          lastClaimTime: args.timestamp,
        },
      });
    }

    // 4. LOG EVENT: Rewards claimed
    await ctx.db.insert("events", {
      type: "rewards_claimed",
      actorId: staker._id,
      targetId: poolThing._id,
      timestamp: args.timestamp,
      metadata: {
        protocol: "sui",
        positionId: args.positionId,
        rewards: args.rewards,
      },
    });

    return args.rewards;
  },
});

/**
 * Handle Unstaked event from Sui
 * Maps to: CONNECTIONS dimension (update staked_in to completed)
 */
export const handleUnstaked = mutation({
  args: {
    poolId: v.string(),
    positionId: v.string(),
    staker: v.string(),
    amount: v.number(),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    // 1. Find pool thing
    const poolThing = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "staking_pool"))
      .filter((q) =>
        q.eq(q.field("properties.poolId"), args.poolId)
      )
      .first();

    if (!poolThing) throw new Error("Pool not found");

    // 2. Find staker
    const staker = await ctx.db
      .query("people")
      .filter((q) => q.eq(q.field("walletAddress"), args.staker))
      .first();

    if (!staker) throw new Error("Staker not found");

    // 3. UPDATE CONNECTION: Mark as completed
    const connection = await ctx.db
      .query("connections")
      .filter((q) =>
        q.and(
          q.eq(q.field("fromThingId"), staker._id),
          q.eq(q.field("toThingId"), poolThing._id),
          q.eq(q.field("metadata.positionId"), args.positionId)
        )
      )
      .first();

    if (connection) {
      await ctx.db.patch(connection._id, {
        metadata: {
          ...connection.metadata,
          status: "completed",
          unstakedAt: args.timestamp,
        },
        validTo: args.timestamp,
      });
    }

    // 4. UPDATE POOL: Decrement total staked
    const currentTotal = poolThing.properties.totalStaked || 0;
    await ctx.db.patch(poolThing._id, {
      properties: {
        ...poolThing.properties,
        totalStaked: Math.max(0, currentTotal - args.amount),
      },
      updatedAt: Date.now(),
    });

    // 5. LOG EVENT: Unstaked
    await ctx.db.insert("events", {
      type: "unstaked",
      actorId: staker._id,
      targetId: poolThing._id,
      timestamp: args.timestamp,
      metadata: {
        protocol: "sui",
        positionId: args.positionId,
        amount: args.amount,
      },
    });

    return connection?._id;
  },
});

// ==================== Query Functions ====================

/**
 * Get all staking pools for an organization
 */
export const getStakingPools = query({
  args: { organizationId: v.optional(v.id("organizations")) },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const person = await ctx.db
      .query("people")
      .withIndex("by_email", (q) => q.eq("email", identity.email))
      .first();

    if (!person?.organizationId) throw new Error("No organization");

    const orgId = args.organizationId || person.organizationId;

    // 2. QUERY POOLS: Filter by organization
    const pools = await ctx.db
      .query("things")
      .withIndex("by_org_type", (q) =>
        q.eq("organizationId", orgId).eq("type", "staking_pool")
      )
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    // 3. ENRICH WITH CONNECTIONS: Get stakers
    const enriched = await Promise.all(
      pools.map(async (pool) => {
        const stakers = await ctx.db
          .query("connections")
          .filter((q) =>
            q.and(
              q.eq(q.field("toThingId"), pool._id),
              q.eq(q.field("relationshipType"), "staked_in"),
              q.eq(q.field("metadata.status"), "active")
            )
          )
          .collect();

        return {
          ...pool,
          stakerCount: stakers.length,
          totalStaked: pool.properties.totalStaked || 0,
        };
      })
    );

    return enriched;
  },
});

/**
 * Get user's staking positions
 */
export const getMyStakingPositions = query({
  handler: async (ctx) => {
    // 1. AUTHENTICATE
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const person = await ctx.db
      .query("people")
      .withIndex("by_email", (q) => q.eq("email", identity.email))
      .first();

    if (!person) throw new Error("Person not found");

    // 2. QUERY POSITIONS: Get all staked_in connections
    const positions = await ctx.db
      .query("connections")
      .filter((q) =>
        q.and(
          q.eq(q.field("fromThingId"), person._id),
          q.eq(q.field("relationshipType"), "staked_in"),
          q.eq(q.field("metadata.status"), "active")
        )
      )
      .collect();

    // 3. ENRICH WITH POOL DATA
    const enriched = await Promise.all(
      positions.map(async (position) => {
        const pool = await ctx.db.get(position.toThingId);
        return {
          positionId: position.metadata.positionId,
          poolId: pool?.properties.poolId,
          poolName: pool?.name,
          amount: position.metadata.amount,
          lockEnd: position.metadata.lockEnd,
          totalClaimed: position.metadata.totalClaimed || 0,
          status: position.metadata.status,
          stakedAt: position.validFrom,
        };
      })
    );

    return enriched;
  },
});

/**
 * Get staking analytics for organization
 */
export const getStakingAnalytics = query({
  handler: async (ctx) => {
    // 1. AUTHENTICATE
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const person = await ctx.db
      .query("people")
      .withIndex("by_email", (q) => q.eq("email", identity.email))
      .first();

    if (!person?.organizationId) throw new Error("No organization");

    // 2. GET ALL POOLS
    const pools = await ctx.db
      .query("things")
      .withIndex("by_org_type", (q) =>
        q.eq("organizationId", person.organizationId).eq("type", "staking_pool")
      )
      .collect();

    // 3. AGGREGATE METRICS
    const totalPools = pools.length;
    const totalStaked = pools.reduce(
      (sum, pool) => sum + (pool.properties.totalStaked || 0),
      0
    );

    // 4. GET TOTAL STAKERS (unique)
    const allConnections = await ctx.db
      .query("connections")
      .filter((q) => q.eq(q.field("relationshipType"), "staked_in"))
      .collect();

    const uniqueStakers = new Set(
      allConnections.map((c) => c.fromThingId)
    ).size;

    // 5. GET RECENT EVENTS
    const recentEvents = await ctx.db
      .query("events")
      .withIndex("by_type", (q) => q.eq("type", "staked"))
      .order("desc")
      .take(10);

    return {
      totalPools,
      totalStaked,
      uniqueStakers,
      recentStakes: recentEvents.length,
      pools: pools.map((p) => ({
        name: p.name,
        totalStaked: p.properties.totalStaked || 0,
        rewardRate: p.properties.rewardRate,
      })),
    };
  },
});

// ==================== Event Listener Setup ====================

/**
 * Example: Set up Sui event listener with @mysten/sui.js
 *
 * This would run as a Node.js service that listens to Sui blockchain
 * events and calls the Convex mutations above.
 */
/*
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { ConvexClient } from 'convex/browser';

const suiClient = new SuiClient({ url: getFullnodeUrl('mainnet') });
const convexClient = new ConvexClient(process.env.CONVEX_URL!);

// Subscribe to staking events
const unsubscribe = await suiClient.subscribeEvent({
  filter: {
    MoveEventModule: {
      package: STAKING_PACKAGE_ID,
      module: 'staking'
    }
  },
  onMessage: async (event) => {
    const { type, parsedJson } = event;

    if (type.includes('::PoolCreated')) {
      await convexClient.mutation(api.staking.handlePoolCreated, parsedJson);
    } else if (type.includes('::Staked')) {
      await convexClient.mutation(api.staking.handleStaked, parsedJson);
    } else if (type.includes('::RewardsClaimed')) {
      await convexClient.mutation(api.staking.handleRewardsClaimed, parsedJson);
    } else if (type.includes('::Unstaked')) {
      await convexClient.mutation(api.staking.handleUnstaked, parsedJson);
    }
  }
});
*/
