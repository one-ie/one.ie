/**
 * Treasury Queries - Convex queries for multi-sig treasury data retrieval
 *
 * Provides Convex query handlers that wrap TreasuryService operations:
 * - Get treasury by ID
 * - Get pending transactions
 * - Get treasury balance
 * - Get transaction history
 * - Get treasury owners
 *
 * Maps to 6-dimension ontology:
 * - THINGS: treasury (type: "treasury")
 * - CONNECTIONS: owns_treasury (person → treasury)
 * - EVENTS: treasury_withdrawal, treasury_approval
 *
 * @module queries/sui/treasury
 * @version 1.0.0
 */

import { query } from "convex/server";
import { v } from "convex/values";
import { Effect } from "effect";
import { TreasuryServiceLive } from "../../services/sui/TreasuryService";
import type { Treasury, PendingTransaction } from "../../types/sui";

/**
 * Get treasury by ID
 *
 * @param treasuryId - Treasury entity ID
 * @returns Treasury entity with properties
 *
 * @example
 * ```typescript
 * const treasury = await ctx.runQuery(api.queries.sui.treasury.get, {
 *   treasuryId: treasury._id
 * });
 * ```
 */
export const get = query({
  args: {
    treasuryId: v.id("things"),
  },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE: Get user identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. Create empty events helper (not needed for queries)
    const events = {
      log: async (event: any) => {
        return await ctx.db.insert("events", event);
      },
    };

    // 3. Get treasury using TreasuryService
    const program = Effect.gen(function* (_) {
      const service = yield* _(TreasuryServiceLive(ctx.db, events));
      return yield* _(service.getById(args.treasuryId));
    });

    const treasury = await Effect.runPromise(program);
    return treasury;
  },
});

/**
 * Get pending transactions for a treasury
 *
 * @param treasuryId - Treasury entity ID
 * @returns Array of pending transactions
 *
 * @example
 * ```typescript
 * const pending = await ctx.runQuery(api.queries.sui.treasury.getPendingTransactions, {
 *   treasuryId: treasury._id
 * });
 * ```
 */
export const getPendingTransactions = query({
  args: {
    treasuryId: v.id("things"),
  },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE: Get user identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. Create empty events helper (not needed for queries)
    const events = {
      log: async (event: any) => {
        return await ctx.db.insert("events", event);
      },
    };

    // 3. Get pending transactions using TreasuryService
    const program = Effect.gen(function* (_) {
      const service = yield* _(TreasuryServiceLive(ctx.db, events));
      return yield* _(service.getPendingTransactions(args.treasuryId));
    });

    const pendingTxs = await Effect.runPromise(program);
    return pendingTxs;
  },
});

/**
 * Get treasury balance across all assets
 *
 * @param treasuryId - Treasury entity ID
 * @returns Object mapping coin type to balance
 *
 * @example
 * ```typescript
 * const balance = await ctx.runQuery(api.queries.sui.treasury.getBalance, {
 *   treasuryId: treasury._id
 * });
 * // Returns: { "0x2::sui::SUI": "5000000000", "0xabc...::token::TOKEN": "1000000" }
 * ```
 */
export const getBalance = query({
  args: {
    treasuryId: v.id("things"),
  },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE: Get user identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. Create empty events helper (not needed for queries)
    const events = {
      log: async (event: any) => {
        return await ctx.db.insert("events", event);
      },
    };

    // 3. Get balance using TreasuryService
    const program = Effect.gen(function* (_) {
      const service = yield* _(TreasuryServiceLive(ctx.db, events));
      return yield* _(service.getTreasuryBalance(args.treasuryId));
    });

    const balance = await Effect.runPromise(program);
    return { balances: balance };
  },
});

/**
 * Get transaction history for a treasury
 *
 * @param treasuryId - Treasury entity ID
 * @param limit - Optional limit on number of transactions (default: 50)
 * @returns Array of completed transactions
 *
 * @example
 * ```typescript
 * const history = await ctx.runQuery(api.queries.sui.treasury.getTransactionHistory, {
 *   treasuryId: treasury._id,
 *   limit: 20
 * });
 * ```
 */
export const getTransactionHistory = query({
  args: {
    treasuryId: v.id("things"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE: Get user identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const limit = args.limit || 50;

    // 2. Query events table for treasury_withdrawal events
    const withdrawalEvents = await ctx.db
      .query("events")
      .withIndex("by_target", (q) =>
        q.eq("targetId", args.treasuryId)
      )
      .filter((q) => q.eq(q.field("type"), "treasury_withdrawal"))
      .order("desc")
      .take(limit);

    // 3. Format as transaction objects
    const transactions = withdrawalEvents.map((event) => ({
      id: event.metadata.txDigest || event._id,
      to: event.metadata.to,
      amount: event.metadata.amount,
      coinType: event.metadata.coinType,
      approvers: event.metadata.approvers || [],
      executedAt: event.timestamp,
      txDigest: event.metadata.txDigest,
      actorId: event.actorId,
    }));

    return transactions;
  },
});

/**
 * Get treasury owners and threshold
 *
 * @param treasuryId - Treasury entity ID
 * @returns Object with owners array and threshold
 *
 * @example
 * ```typescript
 * const { owners, threshold } = await ctx.runQuery(api.queries.sui.treasury.getOwners, {
 *   treasuryId: treasury._id
 * });
 * ```
 */
export const getOwners = query({
  args: {
    treasuryId: v.id("things"),
  },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE: Get user identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. Get treasury
    const treasury = await ctx.db.get(args.treasuryId);
    if (!treasury) {
      throw new Error("Treasury not found");
    }

    if (treasury.type !== "treasury") {
      throw new Error("Entity is not a treasury");
    }

    // 3. Extract owners and threshold from properties
    const treasuryProps = treasury.properties as Treasury;

    return {
      owners: treasuryProps.owners,
      threshold: treasuryProps.threshold,
    };
  },
});

/**
 * List all treasuries for current user's organization
 *
 * @param groupId - Optional group ID to filter by
 * @returns Array of treasury entities
 *
 * @example
 * ```typescript
 * const treasuries = await ctx.runQuery(api.queries.sui.treasury.list, {
 *   groupId: group._id
 * });
 * ```
 */
export const list = query({
  args: {
    groupId: v.optional(v.id("groups")),
  },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE: Get user identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. Get person to determine organization
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((q) => q.eq(q.field("properties.email"), identity.email))
      .first();

    if (!person) {
      throw new Error("User not found");
    }

    if (!person.groupId && !args.groupId) {
      throw new Error("No group specified");
    }

    const groupId = args.groupId || person.groupId;

    // 3. Query treasuries for this organization
    const treasuries = await ctx.db
      .query("things")
      .withIndex("by_group_type", (q) =>
        q.eq("groupId", groupId!).eq("type", "treasury")
      )
      .filter((q) => q.neq(q.field("status"), "deleted"))
      .collect();

    return treasuries;
  },
});

/**
 * Get treasury statistics
 *
 * @param treasuryId - Treasury entity ID
 * @returns Statistics about treasury activity
 *
 * @example
 * ```typescript
 * const stats = await ctx.runQuery(api.queries.sui.treasury.getStats, {
 *   treasuryId: treasury._id
 * });
 * ```
 */
export const getStats = query({
  args: {
    treasuryId: v.id("things"),
  },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE: Get user identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. Get treasury
    const treasury = await ctx.db.get(args.treasuryId);
    if (!treasury) {
      throw new Error("Treasury not found");
    }

    const treasuryProps = treasury.properties as Treasury;

    // 3. Get pending transactions count
    const pendingConnections = await ctx.db
      .query("connections")
      .withIndex("from_type", (q) =>
        q.eq("fromThingId", args.treasuryId).eq("relationshipType", "pending_transaction")
      )
      .collect();

    const pendingCount = pendingConnections.length;

    // 4. Get total withdrawals
    const withdrawalEvents = await ctx.db
      .query("events")
      .withIndex("by_target", (q) =>
        q.eq("targetId", args.treasuryId)
      )
      .filter((q) => q.eq(q.field("type"), "treasury_withdrawal"))
      .collect();

    const totalWithdrawals = withdrawalEvents.length;

    // 5. Calculate total value (sum of all balances)
    let totalValue = 0n;
    for (const balance of Object.values(treasuryProps.balance)) {
      try {
        totalValue += BigInt(balance);
      } catch (e) {
        // Skip invalid balance values
      }
    }

    // 6. Get approval count
    const approvalEvents = await ctx.db
      .query("events")
      .withIndex("by_target", (q) =>
        q.eq("targetId", args.treasuryId)
      )
      .filter((q) => q.eq(q.field("type"), "treasury_approval"))
      .collect();

    const totalApprovals = approvalEvents.length;

    return {
      ownersCount: treasuryProps.owners.length,
      threshold: treasuryProps.threshold,
      pendingTransactions: pendingCount,
      totalWithdrawals,
      totalApprovals,
      assetTypes: Object.keys(treasuryProps.balance).length,
      createdAt: treasuryProps.createdAt,
    };
  },
});
