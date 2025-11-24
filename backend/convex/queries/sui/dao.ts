/**
 * DAO Governance Queries
 *
 * Convex queries for reading DAO proposals, votes, and voting power.
 *
 * Maps to 6-dimension ontology:
 * - THINGS: dao_proposal (proposals)
 * - CONNECTIONS: voted_on (voter → proposal)
 * - EVENTS: Audit trail of all governance actions
 * - GROUPS: Organization scoping via groupId
 *
 * @module queries/sui/dao
 */

import { query } from "convex/server";
import { v } from "convex/values";
import { Effect } from "effect";
import { Id } from "../../_generated/dataModel";
import {
  DAOGovernanceService,
  ProposalEntity,
  ProposalStatusResult,
  ServiceContext,
  DatabaseContext,
  BlockchainContext,
} from "../../services/sui/DAOGovernanceService";

// ============================================================================
// Helper: Build ServiceContext from Convex Context
// ============================================================================

/**
 * Build Effect.ts ServiceContext from Convex QueryCtx
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
      console.log("Mock submitProposal:", proposal);
      return {
        proposalId: `sui_proposal_${Date.now()}`,
        txDigest: `mock_tx_${Date.now()}`,
      };
    },

    submitVote: async (vote) => {
      console.log("Mock submitVote:", vote);
      return {
        voteId: `sui_vote_${Date.now()}`,
        txDigest: `mock_tx_${Date.now()}`,
      };
    },

    executeProposal: async (proposalId) => {
      console.log("Mock executeProposal:", proposalId);
      return {
        executed: true,
        txDigest: `mock_tx_${Date.now()}`,
      };
    },

    getBalanceAtSnapshot: async (params) => {
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
// Queries
// ============================================================================

/**
 * Get proposal by ID
 *
 * @param proposalId - Proposal thing ID
 * @returns ProposalEntity with vote counts
 */
export const getProposal = query({
  args: {
    proposalId: v.id("things"),
  },
  handler: async (ctx, args) => {
    // 1. Get proposal from database
    const proposal = await ctx.db.get(args.proposalId);

    if (!proposal) {
      throw new Error("Proposal not found");
    }

    if (proposal.type !== "dao_proposal") {
      throw new Error("Thing is not a proposal");
    }

    // 2. Enrich with vote counts (already in properties)
    return proposal as ProposalEntity;
  },
});

/**
 * Get all proposals for a DAO
 *
 * @param daoId - DAO thing ID or group ID
 * @returns Array of ProposalEntity
 */
export const getProposalsByDAO = query({
  args: {
    daoId: v.string(), // Can be thing ID or group ID
  },
  handler: async (ctx, args) => {
    // Query all proposals where properties.daoId matches
    const allProposals = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "dao_proposal"))
      .collect();

    // Filter by daoId
    const daoProposals = allProposals.filter(
      (p) => p.properties.daoId === args.daoId
    );

    return daoProposals as ProposalEntity[];
  },
});

/**
 * Get active proposals for a DAO
 *
 * @param daoId - DAO thing ID or group ID
 * @returns Array of active ProposalEntity
 */
export const getActiveProposals = query({
  args: {
    daoId: v.string(), // Can be thing ID or group ID
  },
  handler: async (ctx, args) => {
    // 1. Call Effect.ts service
    const serviceContext = buildServiceContext(ctx);

    try {
      const proposals = await runEffect(
        DAOGovernanceService.getActiveProposals(args.daoId as Id<"things">),
        serviceContext
      );

      // Service returns empty array currently, fallback to manual query
      if (proposals.length === 0) {
        // Manual implementation until service is complete
        const allProposals = await ctx.db
          .query("things")
          .withIndex("by_type", (q) => q.eq("type", "dao_proposal"))
          .collect();

        const now = Date.now();

        const activeProposals = allProposals.filter(
          (p) =>
            p.properties.daoId === args.daoId &&
            p.properties.status === "active" &&
            p.properties.votingEnd > now
        );

        return activeProposals as ProposalEntity[];
      }

      return proposals;
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
 * Get user's voting power for a proposal
 *
 * @param proposalId - Proposal thing ID
 * @param userId - Optional user ID (defaults to current user)
 * @returns { votingPower: string }
 */
export const getVotingPower = query({
  args: {
    proposalId: v.id("things"),
    userId: v.optional(v.id("things")),
  },
  handler: async (ctx, args) => {
    // 1. Determine user
    let userId = args.userId;

    if (!userId) {
      // Get current user
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new Error("Not authenticated");
      }

      const person = await ctx.db
        .query("things")
        .withIndex("by_type", (q) => q.eq("type", "creator"))
        .filter((q) => q.eq(q.field("properties.email"), identity.email))
        .first();

      if (!person) {
        throw new Error("User not found");
      }

      userId = person._id;
    }

    // 2. Call Effect.ts service
    const serviceContext = buildServiceContext(ctx);

    try {
      const votingPower = await runEffect(
        DAOGovernanceService.calculateVotingPower(userId, args.proposalId),
        serviceContext
      );

      return { votingPower };
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
 * Get proposal results (status, vote counts, quorum, passed)
 *
 * @param proposalId - Proposal thing ID
 * @returns ProposalStatusResult
 */
export const getProposalResults = query({
  args: {
    proposalId: v.id("things"),
  },
  handler: async (ctx, args) => {
    // Call Effect.ts service
    const serviceContext = buildServiceContext(ctx);

    try {
      const status = await runEffect(
        DAOGovernanceService.getProposalStatus(args.proposalId),
        serviceContext
      );

      return status;
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
 * Get user's vote on a proposal (if they voted)
 *
 * @param proposalId - Proposal thing ID
 * @param userId - Optional user ID (defaults to current user)
 * @returns { voted: boolean, vote?: 'for' | 'against' | 'abstain', weight?: string }
 */
export const getUserVote = query({
  args: {
    proposalId: v.id("things"),
    userId: v.optional(v.id("things")),
  },
  handler: async (ctx, args) => {
    // 1. Determine user
    let userId = args.userId;

    if (!userId) {
      // Get current user
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new Error("Not authenticated");
      }

      const person = await ctx.db
        .query("things")
        .withIndex("by_type", (q) => q.eq("type", "creator"))
        .filter((q) => q.eq(q.field("properties.email"), identity.email))
        .first();

      if (!person) {
        throw new Error("User not found");
      }

      userId = person._id;
    }

    // 2. Query voted_on connection (use from_type index and filter by toThingId)
    const voteConnection = await ctx.db
      .query("connections")
      .withIndex("from_type", (q) =>
        q
          .eq("fromThingId", userId)
          .eq("relationshipType", "voted_on")
      )
      .filter((q) => q.eq(q.field("toThingId"), args.proposalId))
      .first();

    if (!voteConnection) {
      return { voted: false };
    }

    return {
      voted: true,
      vote: voteConnection.metadata.vote as "for" | "against" | "abstain",
      weight: voteConnection.metadata.weight,
      timestamp: voteConnection.metadata.timestamp,
    };
  },
});

/**
 * Get all voters for a proposal
 *
 * @param proposalId - Proposal thing ID
 * @returns Array of { voterId, vote, weight, timestamp }
 */
export const getProposalVoters = query({
  args: {
    proposalId: v.id("things"),
  },
  handler: async (ctx, args) => {
    // Query all voted_on connections for this proposal
    const voteConnections = await ctx.db
      .query("connections")
      .withIndex("to_type", (q) =>
        q
          .eq("toThingId", args.proposalId)
          .eq("relationshipType", "voted_on")
      )
      .collect();

    // Map to voter details
    return voteConnections.map((conn) => ({
      voterId: conn.fromThingId,
      vote: conn.metadata.vote as "for" | "against" | "abstain",
      weight: conn.metadata.weight,
      timestamp: conn.metadata.timestamp,
    }));
  },
});
