/**
 * Treasury Mutations - Convex mutations for multi-sig treasury management
 *
 * Provides Convex mutation handlers that wrap TreasuryService operations:
 * - Create multi-sig treasuries
 * - Propose transactions
 * - Approve pending transactions
 * - Execute approved transactions
 * - Manage treasury owners
 *
 * Maps to 6-dimension ontology:
 * - THINGS: treasury (type: "treasury")
 * - CONNECTIONS: owns_treasury (person → treasury)
 * - EVENTS: treasury_created, treasury_withdrawal, treasury_approval
 *
 * @module mutations/sui/treasury
 * @version 1.0.0
 */

import { mutation } from "convex/server";
import { v } from "convex/values";
import { Effect } from "effect";
import { TreasuryServiceLive } from "../../services/sui/TreasuryService";

/**
 * Create a new multi-sig treasury
 *
 * @param daoId - DAO or organization this treasury belongs to
 * @param owners - Array of owner Sui addresses
 * @param threshold - Required number of signatures (M-of-N)
 * @param name - Optional treasury name
 * @returns Treasury entity ID
 *
 * @example
 * ```typescript
 * const treasuryId = await ctx.runMutation(api.mutations.sui.treasury.create, {
 *   daoId: dao._id,
 *   owners: ["0x1111...", "0x2222...", "0x3333..."],
 *   threshold: 2,
 *   name: "DAO Treasury"
 * });
 * ```
 */
export const create = mutation({
  args: {
    daoId: v.id("things"),
    owners: v.array(v.string()),
    threshold: v.number(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE: Get user identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. Get person (actor)
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((q) => q.eq(q.field("properties.email"), identity.email))
      .first();

    if (!person) {
      throw new Error("User not found");
    }

    // 3. Get DAO to extract groupId
    const dao = await ctx.db.get(args.daoId);
    if (!dao) {
      throw new Error("DAO not found");
    }

    if (!dao.groupId) {
      throw new Error("DAO must belong to a group");
    }

    // 4. Create event logger helper
    const events = {
      log: async (event: any) => {
        return await ctx.db.insert("events", event);
      },
    };

    // 5. Create treasury using TreasuryService
    const program = Effect.gen(function* (_) {
      const service = yield* _(TreasuryServiceLive(ctx.db, events));
      return yield* _(
        service.createTreasury({
          daoId: args.daoId,
          owners: args.owners,
          threshold: args.threshold,
          groupId: dao.groupId,
          name: args.name,
          actorId: person._id,
        })
      );
    });

    const result = await Effect.runPromise(program);
    return result._id;
  },
});

/**
 * Propose a new transaction from treasury
 *
 * @param treasuryId - Treasury entity ID
 * @param to - Recipient Sui address
 * @param amount - Amount to send
 * @param coinType - Coin type to send
 * @param description - Optional transaction description
 * @param expiresAt - Optional expiration timestamp (defaults to 7 days)
 * @returns Transaction ID
 *
 * @example
 * ```typescript
 * const txId = await ctx.runMutation(api.mutations.sui.treasury.proposeTransaction, {
 *   treasuryId: treasury._id,
 *   to: "0x9999...",
 *   amount: "1000000000",
 *   coinType: "0x2::sui::SUI",
 *   description: "Payment for services"
 * });
 * ```
 */
export const proposeTransaction = mutation({
  args: {
    treasuryId: v.id("things"),
    to: v.string(),
    amount: v.string(),
    coinType: v.string(),
    description: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE: Get user identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. Get person (proposer)
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((q) => q.eq(q.field("properties.email"), identity.email))
      .first();

    if (!person) {
      throw new Error("User not found");
    }

    // 3. Create event logger helper
    const events = {
      log: async (event: any) => {
        return await ctx.db.insert("events", event);
      },
    };

    // 4. Propose transaction using TreasuryService
    const program = Effect.gen(function* (_) {
      const service = yield* _(TreasuryServiceLive(ctx.db, events));
      return yield* _(
        service.proposeTransaction({
          treasuryId: args.treasuryId,
          proposerId: person._id,
          to: args.to,
          amount: args.amount,
          coinType: args.coinType,
          description: args.description,
          expiresAt: args.expiresAt,
        })
      );
    });

    const txId = await Effect.runPromise(program);
    return txId;
  },
});

/**
 * Approve a pending transaction
 *
 * @param treasuryId - Treasury entity ID
 * @param txId - Transaction ID to approve
 *
 * @example
 * ```typescript
 * await ctx.runMutation(api.mutations.sui.treasury.approve, {
 *   treasuryId: treasury._id,
 *   txId: "tx_12345"
 * });
 * ```
 */
export const approve = mutation({
  args: {
    treasuryId: v.id("things"),
    txId: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE: Get user identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. Get person (approver)
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((q) => q.eq(q.field("properties.email"), identity.email))
      .first();

    if (!person) {
      throw new Error("User not found");
    }

    // 3. Create event logger helper
    const events = {
      log: async (event: any) => {
        return await ctx.db.insert("events", event);
      },
    };

    // 4. Approve transaction using TreasuryService
    const program = Effect.gen(function* (_) {
      const service = yield* _(TreasuryServiceLive(ctx.db, events));
      return yield* _(
        service.approveTransaction({
          treasuryId: args.treasuryId,
          approverId: person._id,
          txId: args.txId,
        })
      );
    });

    await Effect.runPromise(program);
  },
});

/**
 * Execute a transaction when threshold is met
 *
 * @param treasuryId - Treasury entity ID
 * @param txId - Transaction ID to execute
 *
 * @example
 * ```typescript
 * await ctx.runMutation(api.mutations.sui.treasury.execute, {
 *   treasuryId: treasury._id,
 *   txId: "tx_12345"
 * });
 * ```
 */
export const execute = mutation({
  args: {
    treasuryId: v.id("things"),
    txId: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE: Get user identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. Get person (executor)
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((q) => q.eq(q.field("properties.email"), identity.email))
      .first();

    if (!person) {
      throw new Error("User not found");
    }

    // 3. Create event logger helper
    const events = {
      log: async (event: any) => {
        return await ctx.db.insert("events", event);
      },
    };

    // 4. Execute transaction using TreasuryService
    const program = Effect.gen(function* (_) {
      const service = yield* _(TreasuryServiceLive(ctx.db, events));
      return yield* _(
        service.executeTransaction({
          treasuryId: args.treasuryId,
          executorId: person._id,
          txId: args.txId,
        })
      );
    });

    await Effect.runPromise(program);
  },
});

/**
 * Add a new owner to treasury
 *
 * @param treasuryId - Treasury entity ID
 * @param newOwner - New owner Sui address
 *
 * @example
 * ```typescript
 * await ctx.runMutation(api.mutations.sui.treasury.addOwner, {
 *   treasuryId: treasury._id,
 *   newOwner: "0x4444..."
 * });
 * ```
 */
export const addOwner = mutation({
  args: {
    treasuryId: v.id("things"),
    newOwner: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE: Get user identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. Get person (actor)
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((q) => q.eq(q.field("properties.email"), identity.email))
      .first();

    if (!person) {
      throw new Error("User not found");
    }

    // 3. Create event logger helper
    const events = {
      log: async (event: any) => {
        return await ctx.db.insert("events", event);
      },
    };

    // 4. Add owner using TreasuryService
    const program = Effect.gen(function* (_) {
      const service = yield* _(TreasuryServiceLive(ctx.db, events));
      return yield* _(
        service.addOwner({
          treasuryId: args.treasuryId,
          newOwner: args.newOwner,
          actorId: person._id,
        })
      );
    });

    await Effect.runPromise(program);
  },
});

/**
 * Remove an owner from treasury
 *
 * @param treasuryId - Treasury entity ID
 * @param ownerToRemove - Owner Sui address to remove
 *
 * @example
 * ```typescript
 * await ctx.runMutation(api.mutations.sui.treasury.removeOwner, {
 *   treasuryId: treasury._id,
 *   ownerToRemove: "0x4444..."
 * });
 * ```
 */
export const removeOwner = mutation({
  args: {
    treasuryId: v.id("things"),
    ownerToRemove: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE: Get user identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. Get person (actor)
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((q) => q.eq(q.field("properties.email"), identity.email))
      .first();

    if (!person) {
      throw new Error("User not found");
    }

    // 3. Create event logger helper
    const events = {
      log: async (event: any) => {
        return await ctx.db.insert("events", event);
      },
    };

    // 4. Remove owner using TreasuryService
    const program = Effect.gen(function* (_) {
      const service = yield* _(TreasuryServiceLive(ctx.db, events));
      return yield* _(
        service.removeOwner({
          treasuryId: args.treasuryId,
          ownerToRemove: args.ownerToRemove,
          actorId: person._id,
        })
      );
    });

    await Effect.runPromise(program);
  },
});

/**
 * Update the signature threshold
 *
 * @param treasuryId - Treasury entity ID
 * @param newThreshold - New signature threshold
 *
 * @example
 * ```typescript
 * await ctx.runMutation(api.mutations.sui.treasury.updateThreshold, {
 *   treasuryId: treasury._id,
 *   newThreshold: 3
 * });
 * ```
 */
export const updateThreshold = mutation({
  args: {
    treasuryId: v.id("things"),
    newThreshold: v.number(),
  },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE: Get user identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. Get person (actor)
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((q) => q.eq(q.field("properties.email"), identity.email))
      .first();

    if (!person) {
      throw new Error("User not found");
    }

    // 3. Create event logger helper
    const events = {
      log: async (event: any) => {
        return await ctx.db.insert("events", event);
      },
    };

    // 4. Update threshold using TreasuryService
    const program = Effect.gen(function* (_) {
      const service = yield* _(TreasuryServiceLive(ctx.db, events));
      return yield* _(
        service.updateThreshold({
          treasuryId: args.treasuryId,
          newThreshold: args.newThreshold,
          actorId: person._id,
        })
      );
    });

    await Effect.runPromise(program);
  },
});
