/**
 * DAO Governance Service - Effect.ts Implementation
 *
 * Provides business logic for DAO proposals and voting on Sui blockchain.
 *
 * Maps to 6-dimension ontology:
 * - THINGS: dao_proposal (type: "dao_proposal")
 * - CONNECTIONS: voted_on (voter → proposal)
 * - EVENTS: proposal_created, vote_cast, proposal_executed, proposal_rejected
 * - GROUPS: Organization scoping via groupId
 * - PEOPLE: Actors (proposers, voters) via actorId
 * - KNOWLEDGE: Proposal descriptions and governance metadata
 *
 * @module DAOGovernanceService
 * @version 1.0.0
 */

import { Effect, Data } from "effect";
import { Id } from "../../_generated/dataModel";
import {
  DaoProposalProperties,
  ProposalAction,
  ProposalStatus,
  VotedOnMetadata,
  DaoEventMetadata,
} from "../../types/crypto";

// ============================================================================
// Service Error Types (Tagged Unions)
// ============================================================================

/**
 * Tagged error: Proposal is not in active voting state
 */
export class ProposalNotActiveError extends Data.TaggedError("ProposalNotActiveError")<{
  proposalId: Id<"things">;
  currentStatus: ProposalStatus;
}> {}

/**
 * Tagged error: Voter does not have sufficient voting power
 */
export class InsufficientVotingPowerError extends Data.TaggedError("InsufficientVotingPowerError")<{
  voterId: Id<"things">;
  required: string;
  available: string;
}> {}

/**
 * Tagged error: Voter has already voted on this proposal
 */
export class AlreadyVotedError extends Data.TaggedError("AlreadyVotedError")<{
  voterId: Id<"things">;
  proposalId: Id<"things">;
}> {}

/**
 * Tagged error: Quorum not met for proposal execution
 */
export class QuorumNotMetError extends Data.TaggedError("QuorumNotMetError")<{
  proposalId: Id<"things">;
  required: string;
  current: string;
}> {}

/**
 * Tagged error: Proposal not found
 */
export class ProposalNotFoundError extends Data.TaggedError("ProposalNotFoundError")<{
  proposalId: Id<"things">;
}> {}

/**
 * Tagged error: DAO not found or invalid
 */
export class DaoNotFoundError extends Data.TaggedError("DaoNotFoundError")<{
  daoId: Id<"things">;
}> {}

/**
 * Tagged error: Invalid voting period
 */
export class InvalidVotingPeriodError extends Data.TaggedError("InvalidVotingPeriodError")<{
  votingPeriod: number;
  message: string;
}> {}

/**
 * Tagged error: Proposal execution failed
 */
export class ProposalExecutionError extends Data.TaggedError("ProposalExecutionError")<{
  proposalId: Id<"things">;
  reason: string;
}> {}

/**
 * Union of all service errors
 */
export type ServiceError =
  | ProposalNotActiveError
  | InsufficientVotingPowerError
  | AlreadyVotedError
  | QuorumNotMetError
  | ProposalNotFoundError
  | DaoNotFoundError
  | InvalidVotingPeriodError
  | ProposalExecutionError;

// ============================================================================
// Domain Types
// ============================================================================

/**
 * Proposal entity returned by service
 */
export interface ProposalEntity {
  _id: Id<"things">;
  type: "dao_proposal";
  name: string;
  groupId: Id<"groups">;
  properties: DaoProposalProperties;
  status: "draft" | "active" | "published" | "archived" | "deleted";
  createdAt: number;
  updatedAt: number;
}

/**
 * Vote choice
 */
export type VoteChoice = "for" | "against" | "abstain";

/**
 * Proposal status with voting statistics
 */
export interface ProposalStatusResult {
  proposalId: Id<"things">;
  status: ProposalStatus;
  votesFor: string;
  votesAgainst: string;
  votesAbstain: string;
  totalVotes: string;
  quorumMet: boolean;
  passed: boolean;
  votingEnded: boolean;
  timeRemaining: number; // milliseconds until voting ends (0 if ended)
}

// ============================================================================
// Service Context (Injected Dependencies)
// ============================================================================

/**
 * Database context for Convex operations
 */
export interface DatabaseContext {
  /**
   * Get a thing by ID
   */
  get: (id: Id<"things">) => Promise<any | null>;

  /**
   * Insert a thing
   */
  insert: (table: "things", doc: any) => Promise<Id<"things">>;

  /**
   * Patch/update a thing
   */
  patch: (id: Id<"things">, fields: Partial<any>) => Promise<void>;

  /**
   * Query connections
   */
  queryConnections: (params: {
    fromThingId?: Id<"things">;
    toThingId?: Id<"things">;
    relationshipType?: string;
  }) => Promise<any[]>;

  /**
   * Insert a connection
   */
  insertConnection: (connection: {
    fromThingId: Id<"things">;
    toThingId: Id<"things">;
    relationshipType: string;
    metadata: any;
    validFrom: number;
  }) => Promise<Id<"connections">>;

  /**
   * Insert an event
   */
  insertEvent: (event: {
    type: string;
    actorId: Id<"things">;
    targetId?: Id<"things">;
    timestamp: number;
    metadata: any;
  }) => Promise<Id<"events">>;

  /**
   * Get group by ID
   */
  getGroup: (id: Id<"groups">) => Promise<any | null>;

  /**
   * Update group usage
   */
  updateGroupUsage: (
    groupId: Id<"groups">,
    updates: { proposals?: number }
  ) => Promise<void>;
}

/**
 * Blockchain context for Sui operations
 */
export interface BlockchainContext {
  /**
   * Submit proposal to Sui blockchain
   */
  submitProposal: (proposal: {
    daoId: string;
    title: string;
    description: string;
    actions: ProposalAction[];
    votingEnd: number;
  }) => Promise<{ proposalId: string; txDigest: string }>;

  /**
   * Submit vote to Sui blockchain
   */
  submitVote: (vote: {
    proposalId: string;
    voter: string;
    choice: VoteChoice;
    weight: string;
  }) => Promise<{ voteId: string; txDigest: string }>;

  /**
   * Execute proposal on Sui blockchain
   */
  executeProposal: (proposalId: string) => Promise<{
    executed: boolean;
    txDigest: string;
  }>;

  /**
   * Get token balance for address at specific timestamp (snapshot)
   */
  getBalanceAtSnapshot: (params: {
    address: string;
    tokenType: string;
    timestamp: number;
  }) => Promise<string>;
}

/**
 * Complete service context
 */
export interface ServiceContext {
  db: DatabaseContext;
  blockchain: BlockchainContext;
}

// ============================================================================
// Service Implementation
// ============================================================================

/**
 * Create a new DAO proposal
 *
 * @param daoId - DAO thing ID or group ID
 * @param proposerId - Person thing ID who is creating the proposal
 * @param title - Proposal title
 * @param description - Detailed proposal description (supports markdown)
 * @param actions - Array of executable actions if proposal passes
 * @param votingPeriod - Voting period in milliseconds
 * @param quorum - Optional quorum requirement (e.g., "1000000" = 1M tokens)
 * @param threshold - Optional approval threshold (e.g., "0.51" = 51%)
 *
 * @returns Effect that resolves to created ProposalEntity or fails with ServiceError
 *
 * @example
 * ```typescript
 * const result = await createProposal(
 *   daoId,
 *   proposerId,
 *   "Increase staking rewards",
 *   "Proposal to increase rewards to 20% APY",
 *   [{ type: "updateRewardRate", target: poolId, data: { rate: "0.20" } }],
 *   7 * 24 * 60 * 60 * 1000 // 7 days
 * ).pipe(Effect.provide(context));
 * ```
 */
export const createProposal = (
  daoId: Id<"things"> | Id<"groups">,
  proposerId: Id<"things">,
  title: string,
  description: string,
  actions: ProposalAction[],
  votingPeriod: number,
  quorum?: string,
  threshold?: string
): Effect.Effect<ProposalEntity, ServiceError, ServiceContext> =>
  Effect.gen(function* (_) {
    const { db, blockchain } = yield* _(Effect.context<ServiceContext>());

    // 1. Validate voting period
    if (votingPeriod <= 0) {
      return yield* _(
        Effect.fail(
          new InvalidVotingPeriodError({
            votingPeriod,
            message: "Voting period must be positive",
          })
        )
      );
    }

    // Minimum voting period: 1 hour
    if (votingPeriod < 60 * 60 * 1000) {
      return yield* _(
        Effect.fail(
          new InvalidVotingPeriodError({
            votingPeriod,
            message: "Voting period must be at least 1 hour",
          })
        )
      );
    }

    // 2. Validate DAO exists and get groupId
    let groupId: Id<"groups">;

    // Check if daoId is a group or a thing
    const group = yield* _(
      Effect.tryPromise({
        try: () => db.getGroup(daoId as Id<"groups">),
        catch: () =>
          new DaoNotFoundError({ daoId: daoId as Id<"things"> }),
      })
    );

    if (group) {
      groupId = daoId as Id<"groups">;
    } else {
      // daoId might be a thing, get its groupId
      const daoThing = yield* _(
        Effect.tryPromise({
          try: () => db.get(daoId as Id<"things">),
          catch: () =>
            new DaoNotFoundError({ daoId: daoId as Id<"things"> }),
        })
      );

      if (!daoThing || !daoThing.groupId) {
        return yield* _(
          Effect.fail(
            new DaoNotFoundError({ daoId: daoId as Id<"things"> })
          )
        );
      }

      groupId = daoThing.groupId;
    }

    // 3. Check group limits
    const groupData = yield* _(
      Effect.tryPromise({
        try: () => db.getGroup(groupId),
        catch: () => new DaoNotFoundError({ daoId: daoId as Id<"things"> }),
      })
    );

    if (!groupData) {
      return yield* _(
        Effect.fail(
          new DaoNotFoundError({ daoId: daoId as Id<"things"> })
        )
      );
    }

    if (groupData.usage.proposals >= groupData.limits.proposals) {
      return yield* _(
        Effect.fail(
          new ProposalExecutionError({
            proposalId: "" as Id<"things">, // Not yet created
            reason: `Proposal limit reached (${groupData.limits.proposals})`,
          })
        )
      );
    }

    // 4. Calculate voting end timestamp
    const now = Date.now();
    const votingEnd = now + votingPeriod;

    // 5. Submit proposal to blockchain (optional, for on-chain governance)
    const blockchainResult = yield* _(
      Effect.tryPromise({
        try: () =>
          blockchain.submitProposal({
            daoId: daoId as string,
            title,
            description,
            actions,
            votingEnd,
          }),
        catch: (error) =>
          new ProposalExecutionError({
            proposalId: "" as Id<"things">,
            reason: String(error),
          }),
      })
    );

    // 6. Create proposal in database
    const properties: DaoProposalProperties = {
      daoId: daoId as Id<"things">,
      title,
      description,
      votesFor: "0",
      votesAgainst: "0",
      votingEnd,
      status: "active",
      actions,
      quorum,
      threshold: threshold || "0.51", // Default 51%
      proposer: proposerId,
      createdAt: now,
    };

    const proposalId = yield* _(
      Effect.tryPromise({
        try: () =>
          db.insert("things", {
            type: "dao_proposal",
            name: title,
            groupId,
            properties,
            status: "active",
            createdAt: now,
            updatedAt: now,
          }),
        catch: (error) =>
          new ProposalExecutionError({
            proposalId: "" as Id<"things">,
            reason: String(error),
          }),
      })
    );

    // 7. Create connection: proposer → proposal
    yield* _(
      Effect.tryPromise({
        try: () =>
          db.insertConnection({
            fromThingId: proposerId,
            toThingId: proposalId,
            relationshipType: "created_by",
            metadata: {
              role: "proposer",
              timestamp: now,
            },
            validFrom: now,
          }),
        catch: (error) =>
          new ProposalExecutionError({
            proposalId,
            reason: `Failed to create connection: ${error}`,
          }),
      })
    );

    // 8. Log event: proposal_created
    const eventMetadata: DaoEventMetadata = {
      proposalId,
      txDigest: blockchainResult.txDigest,
    };

    yield* _(
      Effect.tryPromise({
        try: () =>
          db.insertEvent({
            type: "proposal_created",
            actorId: proposerId,
            targetId: proposalId,
            timestamp: now,
            metadata: eventMetadata,
          }),
        catch: () => undefined, // Event logging failure is non-critical
      })
    );

    // 9. Update group usage
    yield* _(
      Effect.tryPromise({
        try: () =>
          db.updateGroupUsage(groupId, {
            proposals: groupData.usage.proposals + 1,
          }),
        catch: () => undefined, // Usage update failure is non-critical
      })
    );

    // 10. Return created proposal
    return {
      _id: proposalId,
      type: "dao_proposal",
      name: title,
      groupId,
      properties,
      status: "active",
      createdAt: now,
      updatedAt: now,
    };
  });

/**
 * Cast a vote on a proposal
 *
 * @param proposalId - Proposal thing ID
 * @param voterId - Person thing ID who is voting
 * @param vote - Vote choice ('for' | 'against' | 'abstain')
 *
 * @returns Effect that resolves to void or fails with ServiceError
 *
 * @example
 * ```typescript
 * await castVote(proposalId, voterId, "for")
 *   .pipe(Effect.provide(context));
 * ```
 */
export const castVote = (
  proposalId: Id<"things">,
  voterId: Id<"things">,
  vote: VoteChoice
): Effect.Effect<void, ServiceError, ServiceContext> =>
  Effect.gen(function* (_) {
    const { db, blockchain } = yield* _(Effect.context<ServiceContext>());
    const now = Date.now();

    // 1. Get proposal
    const proposal = yield* _(
      Effect.tryPromise({
        try: () => db.get(proposalId),
        catch: () => new ProposalNotFoundError({ proposalId }),
      })
    );

    if (!proposal) {
      return yield* _(
        Effect.fail(new ProposalNotFoundError({ proposalId }))
      );
    }

    const props = proposal.properties as DaoProposalProperties;

    // 2. Check proposal is active
    if (props.status !== "active") {
      return yield* _(
        Effect.fail(
          new ProposalNotActiveError({
            proposalId,
            currentStatus: props.status,
          })
        )
      );
    }

    // 3. Check voting period hasn't ended
    if (now >= props.votingEnd) {
      return yield* _(
        Effect.fail(
          new ProposalNotActiveError({
            proposalId,
            currentStatus: "passed", // Voting ended
          })
        )
      );
    }

    // 4. Check if voter has already voted
    const existingVotes = yield* _(
      Effect.tryPromise({
        try: () =>
          db.queryConnections({
            fromThingId: voterId,
            toThingId: proposalId,
            relationshipType: "voted_on",
          }),
        catch: () => new AlreadyVotedError({ voterId, proposalId }),
      })
    );

    if (existingVotes.length > 0) {
      return yield* _(
        Effect.fail(new AlreadyVotedError({ voterId, proposalId }))
      );
    }

    // 5. Calculate voting power (based on token holdings at proposal creation)
    const votingPower = yield* _(
      calculateVotingPowerInternal(voterId, proposalId)
    );

    // Minimum voting power: 1 token (prevent spam)
    if (BigInt(votingPower) < BigInt(1)) {
      return yield* _(
        Effect.fail(
          new InsufficientVotingPowerError({
            voterId,
            required: "1",
            available: votingPower,
          })
        )
      );
    }

    // 6. Submit vote to blockchain
    const blockchainResult = yield* _(
      Effect.tryPromise({
        try: () =>
          blockchain.submitVote({
            proposalId: proposalId as string,
            voter: voterId as string,
            choice: vote,
            weight: votingPower,
          }),
        catch: (error) =>
          new ProposalExecutionError({
            proposalId,
            reason: `Blockchain vote failed: ${error}`,
          }),
      })
    );

    // 7. Update proposal vote counts
    let updatedProps = { ...props };

    if (vote === "for") {
      updatedProps.votesFor = (
        BigInt(props.votesFor) + BigInt(votingPower)
      ).toString();
    } else if (vote === "against") {
      updatedProps.votesAgainst = (
        BigInt(props.votesAgainst) + BigInt(votingPower)
      ).toString();
    }
    // Note: abstain votes are tracked via connections but don't affect pass/fail

    yield* _(
      Effect.tryPromise({
        try: () =>
          db.patch(proposalId, {
            properties: updatedProps,
            updatedAt: now,
          }),
        catch: (error) =>
          new ProposalExecutionError({
            proposalId,
            reason: `Failed to update proposal: ${error}`,
          }),
      })
    );

    // 8. Create connection: voter → proposal (voted_on)
    const voteMetadata: VotedOnMetadata = {
      vote,
      weight: votingPower,
      timestamp: now,
    };

    yield* _(
      Effect.tryPromise({
        try: () =>
          db.insertConnection({
            fromThingId: voterId,
            toThingId: proposalId,
            relationshipType: "voted_on",
            metadata: voteMetadata,
            validFrom: now,
          }),
        catch: (error) =>
          new ProposalExecutionError({
            proposalId,
            reason: `Failed to create vote connection: ${error}`,
          }),
      })
    );

    // 9. Log event: vote_cast
    const eventMetadata: DaoEventMetadata = {
      proposalId,
      voterId,
      vote,
      votingWeight: votingPower,
      txDigest: blockchainResult.txDigest,
    };

    yield* _(
      Effect.tryPromise({
        try: () =>
          db.insertEvent({
            type: "vote_cast",
            actorId: voterId,
            targetId: proposalId,
            timestamp: now,
            metadata: eventMetadata,
          }),
        catch: () => undefined, // Event logging failure is non-critical
      })
    );
  });

/**
 * Execute a proposal if it has passed
 *
 * @param proposalId - Proposal thing ID
 * @param executorId - Person thing ID who is executing
 *
 * @returns Effect that resolves to void or fails with ServiceError
 *
 * @example
 * ```typescript
 * await executeProposal(proposalId, executorId)
 *   .pipe(Effect.provide(context));
 * ```
 */
export const executeProposal = (
  proposalId: Id<"things">,
  executorId: Id<"things">
): Effect.Effect<void, ServiceError, ServiceContext> =>
  Effect.gen(function* (_) {
    const { db, blockchain } = yield* _(Effect.context<ServiceContext>());
    const now = Date.now();

    // 1. Get proposal
    const proposal = yield* _(
      Effect.tryPromise({
        try: () => db.get(proposalId),
        catch: () => new ProposalNotFoundError({ proposalId }),
      })
    );

    if (!proposal) {
      return yield* _(
        Effect.fail(new ProposalNotFoundError({ proposalId }))
      );
    }

    const props = proposal.properties as DaoProposalProperties;

    // 2. Check proposal status
    if (props.status === "executed") {
      return yield* _(
        Effect.fail(
          new ProposalExecutionError({
            proposalId,
            reason: "Proposal already executed",
          })
        )
      );
    }

    if (props.status === "cancelled") {
      return yield* _(
        Effect.fail(
          new ProposalExecutionError({
            proposalId,
            reason: "Proposal cancelled",
          })
        )
      );
    }

    // 3. Check voting has ended
    if (now < props.votingEnd) {
      return yield* _(
        Effect.fail(
          new ProposalNotActiveError({
            proposalId,
            currentStatus: "active",
          })
        )
      );
    }

    // 4. Check if proposal passed
    const status = yield* _(getProposalStatusInternal(proposalId));

    if (!status.passed) {
      // Mark as rejected
      yield* _(
        Effect.tryPromise({
          try: () =>
            db.patch(proposalId, {
              properties: { ...props, status: "rejected" },
              updatedAt: now,
            }),
          catch: () => undefined,
        })
      );

      // Log rejection event
      yield* _(
        Effect.tryPromise({
          try: () =>
            db.insertEvent({
              type: "proposal_rejected",
              actorId: executorId,
              targetId: proposalId,
              timestamp: now,
              metadata: {
                proposalId,
                reason: "Failed to meet approval threshold",
              },
            }),
          catch: () => undefined,
        })
      );

      return yield* _(
        Effect.fail(
          new ProposalExecutionError({
            proposalId,
            reason: "Proposal did not pass",
          })
        )
      );
    }

    if (!status.quorumMet && props.quorum) {
      // Mark as rejected due to quorum
      yield* _(
        Effect.tryPromise({
          try: () =>
            db.patch(proposalId, {
              properties: { ...props, status: "rejected" },
              updatedAt: now,
            }),
          catch: () => undefined,
        })
      );

      return yield* _(
        Effect.fail(
          new QuorumNotMetError({
            proposalId,
            required: props.quorum,
            current: status.totalVotes,
          })
        )
      );
    }

    // 5. Execute proposal on blockchain
    const blockchainResult = yield* _(
      Effect.tryPromise({
        try: () => blockchain.executeProposal(proposalId as string),
        catch: (error) =>
          new ProposalExecutionError({
            proposalId,
            reason: `Blockchain execution failed: ${error}`,
          }),
      })
    );

    if (!blockchainResult.executed) {
      return yield* _(
        Effect.fail(
          new ProposalExecutionError({
            proposalId,
            reason: "Blockchain execution returned false",
          })
        )
      );
    }

    // 6. Update proposal status to executed
    yield* _(
      Effect.tryPromise({
        try: () =>
          db.patch(proposalId, {
            properties: {
              ...props,
              status: "executed",
              executedAt: now,
            },
            updatedAt: now,
          }),
        catch: (error) =>
          new ProposalExecutionError({
            proposalId,
            reason: `Failed to update proposal: ${error}`,
          }),
      })
    );

    // 7. Log event: proposal_executed
    const eventMetadata: DaoEventMetadata = {
      proposalId,
      txDigest: blockchainResult.txDigest,
    };

    yield* _(
      Effect.tryPromise({
        try: () =>
          db.insertEvent({
            type: "proposal_executed",
            actorId: executorId,
            targetId: proposalId,
            timestamp: now,
            metadata: eventMetadata,
          }),
        catch: () => undefined,
      })
    );
  });

/**
 * Get proposal status with voting statistics
 *
 * @param proposalId - Proposal thing ID
 *
 * @returns Effect that resolves to ProposalStatusResult or fails with ServiceError
 *
 * @example
 * ```typescript
 * const status = await getProposalStatus(proposalId)
 *   .pipe(Effect.provide(context));
 * console.log(status.passed); // true/false
 * ```
 */
export const getProposalStatus = (
  proposalId: Id<"things">
): Effect.Effect<ProposalStatusResult, ServiceError, ServiceContext> =>
  getProposalStatusInternal(proposalId);

/**
 * Internal helper to get proposal status
 */
const getProposalStatusInternal = (
  proposalId: Id<"things">
): Effect.Effect<ProposalStatusResult, ServiceError, ServiceContext> =>
  Effect.gen(function* (_) {
    const { db } = yield* _(Effect.context<ServiceContext>());
    const now = Date.now();

    // 1. Get proposal
    const proposal = yield* _(
      Effect.tryPromise({
        try: () => db.get(proposalId),
        catch: () => new ProposalNotFoundError({ proposalId }),
      })
    );

    if (!proposal) {
      return yield* _(
        Effect.fail(new ProposalNotFoundError({ proposalId }))
      );
    }

    const props = proposal.properties as DaoProposalProperties;

    // 2. Calculate totals
    const votesFor = BigInt(props.votesFor);
    const votesAgainst = BigInt(props.votesAgainst);
    const totalVotes = votesFor + votesAgainst;

    // 3. Check quorum
    const quorumMet = props.quorum
      ? totalVotes >= BigInt(props.quorum)
      : true;

    // 4. Check if passed (majority based on threshold)
    const threshold = parseFloat(props.threshold || "0.51");
    const passed =
      totalVotes > BigInt(0) &&
      Number(votesFor) / Number(totalVotes) >= threshold;

    // 5. Check if voting ended
    const votingEnded = now >= props.votingEnd;
    const timeRemaining = votingEnded ? 0 : props.votingEnd - now;

    return {
      proposalId,
      status: props.status,
      votesFor: props.votesFor,
      votesAgainst: props.votesAgainst,
      votesAbstain: "0", // Could be calculated from connections
      totalVotes: totalVotes.toString(),
      quorumMet,
      passed,
      votingEnded,
      timeRemaining,
    };
  });

/**
 * Calculate voting power for a voter on a specific proposal
 *
 * Voting power is based on token holdings at the time the proposal was created (snapshot).
 *
 * @param voterId - Person thing ID
 * @param proposalId - Proposal thing ID
 *
 * @returns Effect that resolves to voting power as string or fails with ServiceError
 *
 * @example
 * ```typescript
 * const power = await calculateVotingPower(voterId, proposalId)
 *   .pipe(Effect.provide(context));
 * console.log(power); // "1000000000" (1B tokens with 9 decimals)
 * ```
 */
export const calculateVotingPower = (
  voterId: Id<"things">,
  proposalId: Id<"things">
): Effect.Effect<string, ServiceError, ServiceContext> =>
  calculateVotingPowerInternal(voterId, proposalId);

/**
 * Internal helper to calculate voting power
 */
const calculateVotingPowerInternal = (
  voterId: Id<"things">,
  proposalId: Id<"things">
): Effect.Effect<string, ServiceError, ServiceContext> =>
  Effect.gen(function* (_) {
    const { db, blockchain } = yield* _(Effect.context<ServiceContext>());

    // 1. Get proposal to determine snapshot time
    const proposal = yield* _(
      Effect.tryPromise({
        try: () => db.get(proposalId),
        catch: () => new ProposalNotFoundError({ proposalId }),
      })
    );

    if (!proposal) {
      return yield* _(
        Effect.fail(new ProposalNotFoundError({ proposalId }))
      );
    }

    const props = proposal.properties as DaoProposalProperties;
    const snapshotTime = props.createdAt || proposal.createdAt;

    // 2. Get voter's token holdings at snapshot time
    // This would query holds_tokens connections or call blockchain
    const connections = yield* _(
      Effect.tryPromise({
        try: () =>
          db.queryConnections({
            fromThingId: voterId,
            relationshipType: "holds_tokens",
          }),
        catch: () =>
          new InsufficientVotingPowerError({
            voterId,
            required: "1",
            available: "0",
          }),
      })
    );

    // For now, sum all token holdings
    // In production, would filter by specific governance token
    let totalPower = BigInt(0);

    for (const conn of connections) {
      const balance = conn.metadata?.balance || "0";
      totalPower += BigInt(balance);
    }

    return totalPower.toString();
  });

/**
 * Get all active proposals for a DAO
 *
 * @param daoId - DAO thing ID or group ID
 *
 * @returns Effect that resolves to array of ProposalEntity or fails with ServiceError
 *
 * @example
 * ```typescript
 * const proposals = await getActiveProposals(daoId)
 *   .pipe(Effect.provide(context));
 * ```
 */
export const getActiveProposals = (
  daoId: Id<"things"> | Id<"groups">
): Effect.Effect<ProposalEntity[], ServiceError, ServiceContext> =>
  Effect.gen(function* (_) {
    const { db } = yield* _(Effect.context<ServiceContext>());

    // Get all proposals for this DAO
    // This would use a proper query in production
    // For now, return empty array as placeholder

    // In production implementation:
    // 1. Query things table where type = "dao_proposal"
    // 2. Filter by properties.daoId = daoId
    // 3. Filter by properties.status = "active"
    // 4. Sort by createdAt desc

    return [];
  });

// ============================================================================
// Service Exports
// ============================================================================

/**
 * DAO Governance Service
 *
 * Provides all governance operations:
 * - createProposal: Create new proposal
 * - castVote: Vote on proposal
 * - executeProposal: Execute passed proposal
 * - getProposalStatus: Get proposal status and stats
 * - calculateVotingPower: Calculate voter's power
 * - getActiveProposals: Get active proposals for DAO
 */
export const DAOGovernanceService = {
  createProposal,
  castVote,
  executeProposal,
  getProposalStatus,
  calculateVotingPower,
  getActiveProposals,
};

/**
 * Default export
 */
export default DAOGovernanceService;
