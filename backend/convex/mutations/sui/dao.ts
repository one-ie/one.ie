/**
 * DAO Governance Mutations
 *
 * Convex mutations for DAO proposal creation, voting, and execution.
 *
 * Maps to 6-dimension ontology:
 * - THINGS: dao_proposal (proposals)
 * - CONNECTIONS: voted_on (voter → proposal), created_by (proposer → proposal)
 * - EVENTS: proposal_created, vote_cast, proposal_executed, proposal_rejected
 * - GROUPS: Organization scoping via groupId
 * - PEOPLE: Actors (proposers, voters) authenticated via ctx.auth
 *
 * @module mutations/sui/dao
 */

import { mutation } from "convex/server";
import { v } from "convex/values";
import { Effect } from "effect";
import { Id } from "../../_generated/dataModel";
import {
  DAOGovernanceService,
  ProposalEntity,
  ServiceContext,
  DatabaseContext,
  BlockchainContext,
  VoteChoice,
} from "../../services/sui/DAOGovernanceService";
import { ProposalAction } from "../../types/crypto";

// ============================================================================
// Helper: Build ServiceContext from Convex Context
// ============================================================================

/**
 * Build Effect.ts ServiceContext from Convex MutationCtx
 */
function buildServiceContext(ctx: any): ServiceContext {
  const db: DatabaseContext = {
    get: async (id: Id<"things">) => {
      return await ctx.db.get(id);
    },

    insert: async (table: "things", doc: any) => {
      return await ctx.db.insert(table, doc);
    },

    patch: async (id: Id<"things">, fields: Partial<any>) => {
      return await ctx.db.patch(id, fields);
    },

    queryConnections: async (params: {
      fromThingId?: Id<"things">;
      toThingId?: Id<"things">;
      relationshipType?: string;
    }) => {
      let query = ctx.db.query("connections");

      if (params.fromThingId && params.relationshipType) {
        // From + type (use from_type index)
        const results = await query
          .withIndex("from_type", (q: any) =>
            q
              .eq("fromThingId", params.fromThingId)
              .eq("relationshipType", params.relationshipType)
          )
          .collect();

        // Filter by toThingId if specified
        if (params.toThingId) {
          return results.filter((conn: any) => conn.toThingId === params.toThingId);
        }
        return results;
      } else if (params.toThingId && params.relationshipType) {
        // To + type (use to_type index)
        const results = await query
          .withIndex("to_type", (q: any) =>
            q
              .eq("toThingId", params.toThingId)
              .eq("relationshipType", params.relationshipType)
          )
          .collect();

        // Filter by fromThingId if specified
        if (params.fromThingId) {
          return results.filter((conn: any) => conn.fromThingId === params.fromThingId);
        }
        return results;
      } else if (params.fromThingId) {
        // From only (use by_from index)
        return await query
          .withIndex("by_from", (q: any) => q.eq("fromThingId", params.fromThingId))
          .collect();
      } else if (params.toThingId) {
        // To only (use by_to index)
        return await query
          .withIndex("by_to", (q: any) => q.eq("toThingId", params.toThingId))
          .collect();
      } else {
        // Fallback: collect all and filter
        const all = await query.collect();
        return all.filter((conn: any) => {
          if (params.fromThingId && conn.fromThingId !== params.fromThingId)
            return false;
          if (params.toThingId && conn.toThingId !== params.toThingId)
            return false;
          if (
            params.relationshipType &&
            conn.relationshipType !== params.relationshipType
          )
            return false;
          return true;
        });
      }
    },

    insertConnection: async (connection: {
      fromThingId: Id<"things">;
      toThingId: Id<"things">;
      relationshipType: string;
      metadata: any;
      validFrom: number;
    }) => {
      return await ctx.db.insert("connections", connection);
    },

    insertEvent: async (event: {
      type: string;
      actorId: Id<"things">;
      targetId?: Id<"things">;
      timestamp: number;
      metadata: any;
    }) => {
      return await ctx.db.insert("events", event);
    },

    getGroup: async (id: Id<"groups">) => {
      return await ctx.db.get(id);
    },

    updateGroupUsage: async (
      groupId: Id<"groups">,
      updates: { proposals?: number }
    ) => {
      const group = await ctx.db.get(groupId);
      if (!group) return;

      const updatedUsage = { ...group.usage };
      if (updates.proposals !== undefined) {
        updatedUsage.proposals = updates.proposals;
      }

      return await ctx.db.patch(groupId, { usage: updatedUsage });
    },
  };

  // Mock blockchain context (replace with real implementation)
  const blockchain: BlockchainContext = {
    submitProposal: async (proposal) => {
      // TODO: Implement real Sui blockchain submission
      console.log("Mock submitProposal:", proposal);
      return {
        proposalId: `sui_proposal_${Date.now()}`,
        txDigest: `mock_tx_${Date.now()}`,
      };
    },

    submitVote: async (vote) => {
      // TODO: Implement real Sui blockchain vote submission
      console.log("Mock submitVote:", vote);
      return {
        voteId: `sui_vote_${Date.now()}`,
        txDigest: `mock_tx_${Date.now()}`,
      };
    },

    executeProposal: async (proposalId) => {
      // TODO: Implement real Sui blockchain execution
      console.log("Mock executeProposal:", proposalId);
      return {
        executed: true,
        txDigest: `mock_tx_${Date.now()}`,
      };
    },

    getBalanceAtSnapshot: async (params) => {
      // TODO: Implement real Sui blockchain balance query
      console.log("Mock getBalanceAtSnapshot:", params);
      return "1000000000"; // 1B tokens with 9 decimals
    },
  };

  return { db, blockchain };
}

/**
 * Run an Effect and handle errors
 */
async function runEffect<T>(
  effect: Effect.Effect<T, any, ServiceContext>,
  context: ServiceContext
): Promise<T> {
  const result = await Effect.runPromise(
    effect.pipe(Effect.provide(Effect.succeed(context)))
  );
  return result;
}

// ============================================================================
// Mutations
// ============================================================================

/**
 * Create a new DAO proposal
 *
 * @param daoId - DAO thing ID or group ID
 * @param title - Proposal title
 * @param description - Detailed description (markdown supported)
 * @param actions - Array of executable actions if proposal passes
 * @param votingPeriod - Voting period in milliseconds
 * @param quorum - Optional quorum requirement (e.g., "1000000")
 * @param threshold - Optional approval threshold (e.g., "0.51" = 51%)
 *
 * @returns Created proposal ID
 */
export const createProposal = mutation({
  args: {
    daoId: v.string(), // Can be thing ID or group ID
    title: v.string(),
    description: v.string(),
    actions: v.array(
      v.object({
        type: v.string(),
        target: v.string(),
        data: v.any(),
      })
    ),
    votingPeriod: v.number(),
    quorum: v.optional(v.string()),
    threshold: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. Get user's person thing
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((q) => q.eq(q.field("properties.email"), identity.email))
      .first();

    if (!person) {
      throw new Error("User not found");
    }

    // 3. Call Effect.ts service
    const serviceContext = buildServiceContext(ctx);

    try {
      const proposal = await runEffect(
        DAOGovernanceService.createProposal(
          args.daoId as Id<"things">,
          person._id,
          args.title,
          args.description,
          args.actions as ProposalAction[],
          args.votingPeriod,
          args.quorum,
          args.threshold
        ),
        serviceContext
      );

      return proposal._id;
    } catch (error: any) {
      // Handle Effect errors
      if (error._tag) {
        throw new Error(`${error._tag}: ${JSON.stringify(error)}`);
      }
      throw error;
    }
  },
});

/**
 * Vote on a proposal
 *
 * @param proposalId - Proposal thing ID
 * @param vote - Vote choice ('for' | 'against' | 'abstain')
 */
export const vote = mutation({
  args: {
    proposalId: v.id("things"),
    vote: v.union(
      v.literal("for"),
      v.literal("against"),
      v.literal("abstain")
    ),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. Get user's person thing
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((q) => q.eq(q.field("properties.email"), identity.email))
      .first();

    if (!person) {
      throw new Error("User not found");
    }

    // 3. Call Effect.ts service
    const serviceContext = buildServiceContext(ctx);

    try {
      await runEffect(
        DAOGovernanceService.castVote(
          args.proposalId,
          person._id,
          args.vote as VoteChoice
        ),
        serviceContext
      );
    } catch (error: any) {
      // Handle Effect errors
      if (error._tag) {
        throw new Error(`${error._tag}: ${JSON.stringify(error)}`);
      }
      throw error;
    }
  },
});

/**
 * Execute a proposal if it has passed
 *
 * @param proposalId - Proposal thing ID
 */
export const executeProposal = mutation({
  args: {
    proposalId: v.id("things"),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. Get user's person thing
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((q) => q.eq(q.field("properties.email"), identity.email))
      .first();

    if (!person) {
      throw new Error("User not found");
    }

    // 3. Call Effect.ts service
    const serviceContext = buildServiceContext(ctx);

    try {
      await runEffect(
        DAOGovernanceService.executeProposal(args.proposalId, person._id),
        serviceContext
      );
    } catch (error: any) {
      // Handle Effect errors
      if (error._tag) {
        throw new Error(`${error._tag}: ${JSON.stringify(error)}`);
      }
      throw error;
    }
  },
});

/**
 * Cancel a proposal (proposer or admin only)
 *
 * @param proposalId - Proposal thing ID
 */
export const cancelProposal = mutation({
  args: {
    proposalId: v.id("things"),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. Get user's person thing
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((q) => q.eq(q.field("properties.email"), identity.email))
      .first();

    if (!person) {
      throw new Error("User not found");
    }

    // 3. Get proposal
    const proposal = await ctx.db.get(args.proposalId);
    if (!proposal) {
      throw new Error("Proposal not found");
    }

    // 4. Check permissions (must be proposer or admin)
    const isProposer = proposal.properties.proposer === person._id;
    const isAdmin = person.properties.role === "platform_owner"; // TODO: Better permission check

    if (!isProposer && !isAdmin) {
      throw new Error("Only proposer or admin can cancel proposal");
    }

    // 5. Update proposal status
    const now = Date.now();
    await ctx.db.patch(args.proposalId, {
      properties: {
        ...proposal.properties,
        status: "cancelled",
      },
      updatedAt: now,
    });

    // 6. Log event
    await ctx.db.insert("events", {
      type: "proposal_cancelled",
      actorId: person._id,
      targetId: args.proposalId,
      timestamp: now,
      metadata: {
        proposalId: args.proposalId,
        reason: "Cancelled by user",
      },
    });
  },
});
