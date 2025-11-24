/**
 * TreasuryService - Multi-sig Treasury Management using Effect.ts
 *
 * Provides comprehensive treasury management with multi-signature support:
 * - Create multi-sig treasuries on Sui blockchain
 * - Propose, approve, and execute transactions
 * - Manage treasury owners and threshold
 * - Track balances across multiple asset types
 *
 * Maps to 6-dimension ontology:
 * - THINGS: treasury (type: "treasury")
 * - CONNECTIONS: owns_treasury (person → treasury)
 * - EVENTS: treasury_created, treasury_deposit, treasury_withdrawal, treasury_approval
 *
 * @module TreasuryService
 * @version 1.0.0
 */

import { Effect, Context } from "effect";
import { Doc, Id } from "../../_generated/dataModel";
import type {
  Treasury,
  PendingTransaction,
  SuiAddress,
  CoinAmount,
} from "../../types/sui";

// ============================================================================
// Service Interface
// ============================================================================

/**
 * TreasuryService - Effect.ts service for multi-sig treasury management
 *
 * @example
 * ```typescript
 * const program = TreasuryService.pipe(
 *   Effect.flatMap((service) =>
 *     service.createTreasury({
 *       daoId: "dao_123",
 *       owners: ["0x1111...", "0x2222...", "0x3333..."],
 *       threshold: 2,
 *       groupId: "group_456"
 *     })
 *   )
 * );
 * ```
 */
export class TreasuryService extends Context.Tag("TreasuryService")<
  TreasuryService,
  {
    /**
     * Create a new multi-sig treasury
     *
     * @param data - Treasury creation data
     * @returns Effect resolving to treasury entity
     */
    createTreasury: (
      data: CreateTreasuryInput
    ) => Effect.Effect<TreasuryEntity, TreasuryError>;

    /**
     * Propose a new transaction from treasury
     *
     * @param data - Transaction proposal data
     * @returns Effect resolving to transaction ID
     */
    proposeTransaction: (
      data: ProposeTransactionInput
    ) => Effect.Effect<string, TreasuryError>;

    /**
     * Approve a pending transaction
     *
     * @param data - Approval data
     * @returns Effect resolving to void when approved
     */
    approveTransaction: (
      data: ApproveTransactionInput
    ) => Effect.Effect<void, TreasuryError>;

    /**
     * Execute a transaction when threshold is met
     *
     * @param data - Execution data
     * @returns Effect resolving to void when executed
     */
    executeTransaction: (
      data: ExecuteTransactionInput
    ) => Effect.Effect<void, TreasuryError>;

    /**
     * Get treasury balance across all assets
     *
     * @param treasuryId - Treasury entity ID
     * @returns Effect resolving to balance map
     */
    getTreasuryBalance: (
      treasuryId: Id<"things">
    ) => Effect.Effect<Record<string, string>, TreasuryError>;

    /**
     * Get all pending transactions for treasury
     *
     * @param treasuryId - Treasury entity ID
     * @returns Effect resolving to array of pending transactions
     */
    getPendingTransactions: (
      treasuryId: Id<"things">
    ) => Effect.Effect<PendingTransaction[], TreasuryError>;

    /**
     * Add a new owner to treasury
     *
     * @param data - Add owner data
     * @returns Effect resolving to void when added
     */
    addOwner: (
      data: AddOwnerInput
    ) => Effect.Effect<void, TreasuryError>;

    /**
     * Remove an owner from treasury
     *
     * @param data - Remove owner data
     * @returns Effect resolving to void when removed
     */
    removeOwner: (
      data: RemoveOwnerInput
    ) => Effect.Effect<void, TreasuryError>;

    /**
     * Update the signature threshold
     *
     * @param data - Update threshold data
     * @returns Effect resolving to void when updated
     */
    updateThreshold: (
      data: UpdateThresholdInput
    ) => Effect.Effect<void, TreasuryError>;

    /**
     * Get treasury by ID
     *
     * @param treasuryId - Treasury entity ID
     * @returns Effect resolving to treasury entity
     */
    getById: (
      treasuryId: Id<"things">
    ) => Effect.Effect<TreasuryEntity, TreasuryError>;
  }
>() {}

// ============================================================================
// Input Types
// ============================================================================

/**
 * Input for creating a new treasury
 */
export interface CreateTreasuryInput {
  /** DAO or organization this treasury belongs to */
  daoId: Id<"things">;

  /** Array of owner Sui addresses */
  owners: SuiAddress[];

  /** Required number of signatures (M-of-N) */
  threshold: number;

  /** Group ID for multi-tenant scoping */
  groupId: Id<"groups">;

  /** Optional treasury name */
  name?: string;

  /** Actor creating the treasury */
  actorId: Id<"things">;
}

/**
 * Input for proposing a transaction
 */
export interface ProposeTransactionInput {
  /** Treasury entity ID */
  treasuryId: Id<"things">;

  /** Person proposing the transaction */
  proposerId: Id<"things">;

  /** Recipient Sui address */
  to: SuiAddress;

  /** Amount to send */
  amount: CoinAmount;

  /** Coin type to send */
  coinType: string;

  /** Optional transaction description */
  description?: string;

  /** Optional expiration timestamp (defaults to 7 days) */
  expiresAt?: number;
}

/**
 * Input for approving a transaction
 */
export interface ApproveTransactionInput {
  /** Treasury entity ID */
  treasuryId: Id<"things">;

  /** Person approving the transaction */
  approverId: Id<"things">;

  /** Transaction ID to approve */
  txId: string;
}

/**
 * Input for executing a transaction
 */
export interface ExecuteTransactionInput {
  /** Treasury entity ID */
  treasuryId: Id<"things">;

  /** Person executing the transaction */
  executorId: Id<"things">;

  /** Transaction ID to execute */
  txId: string;
}

/**
 * Input for adding an owner
 */
export interface AddOwnerInput {
  /** Treasury entity ID */
  treasuryId: Id<"things">;

  /** New owner Sui address */
  newOwner: SuiAddress;

  /** Person performing the action */
  actorId: Id<"things">;
}

/**
 * Input for removing an owner
 */
export interface RemoveOwnerInput {
  /** Treasury entity ID */
  treasuryId: Id<"things">;

  /** Owner Sui address to remove */
  ownerToRemove: SuiAddress;

  /** Person performing the action */
  actorId: Id<"things">;
}

/**
 * Input for updating threshold
 */
export interface UpdateThresholdInput {
  /** Treasury entity ID */
  treasuryId: Id<"things">;

  /** New signature threshold */
  newThreshold: number;

  /** Person performing the action */
  actorId: Id<"things">;
}

// ============================================================================
// Output Types
// ============================================================================

/**
 * Treasury entity (thing with treasury properties)
 */
export interface TreasuryEntity extends Doc<"things"> {
  type: "treasury";
  properties: Treasury;
}

// ============================================================================
// Error Types (Tagged Union)
// ============================================================================

/**
 * Tagged union of all treasury-related errors
 *
 * @example
 * ```typescript
 * if (error._tag === "InsufficientApprovalsError") {
 *   console.log(`Need ${error.required} approvals, have ${error.current}`);
 * }
 * ```
 */
export type TreasuryError =
  | {
      _tag: "TreasuryNotFoundError";
      treasuryId: string;
    }
  | {
      _tag: "InsufficientApprovalsError";
      txId: string;
      required: number;
      current: number;
    }
  | {
      _tag: "TransactionExpiredError";
      txId: string;
      expiresAt: number;
      currentTime: number;
    }
  | {
      _tag: "NotOwnerError";
      address: string;
      treasuryId: string;
    }
  | {
      _tag: "InvalidThresholdError";
      threshold: number;
      ownersCount: number;
      reason: string;
    }
  | {
      _tag: "TransactionNotFoundError";
      txId: string;
    }
  | {
      _tag: "TransactionAlreadyExecutedError";
      txId: string;
    }
  | {
      _tag: "InsufficientBalanceError";
      coinType: string;
      required: string;
      available: string;
    }
  | {
      _tag: "AlreadyApprovedError";
      txId: string;
      approverId: string;
    }
  | {
      _tag: "OwnerAlreadyExistsError";
      address: string;
    }
  | {
      _tag: "CannotRemoveLastOwnerError";
      treasuryId: string;
    }
  | {
      _tag: "DatabaseError";
      message: string;
    }
  | {
      _tag: "ValidationError";
      field: string;
      message: string;
    };

// ============================================================================
// Service Implementation
// ============================================================================

/**
 * Live implementation of TreasuryService
 *
 * Note: This implementation uses Effect.gen for async operations.
 * Database context (ctx.db) should be provided via dependency injection.
 *
 * @example
 * ```typescript
 * const program = TreasuryService.createTreasury({...});
 * await Effect.runPromise(
 *   program.pipe(Effect.provide(TreasuryServiceLive))
 * );
 * ```
 */
export const TreasuryServiceLive = (db: any, events: any) =>
  TreasuryService.of({
    // ========================================================================
    // Create Treasury
    // ========================================================================

    createTreasury: (data) =>
      Effect.gen(function* (_) {
        // Validate input
        if (data.owners.length === 0) {
          return yield* _(
            Effect.fail<TreasuryError>({
              _tag: "ValidationError",
              field: "owners",
              message: "Treasury must have at least one owner",
            })
          );
        }

        if (data.threshold < 1 || data.threshold > data.owners.length) {
          return yield* _(
            Effect.fail<TreasuryError>({
              _tag: "InvalidThresholdError",
              threshold: data.threshold,
              ownersCount: data.owners.length,
              reason:
                "Threshold must be between 1 and the number of owners",
            })
          );
        }

        // Create treasury properties
        const treasuryProps: Treasury = {
          owners: data.owners,
          threshold: data.threshold,
          balance: {}, // Empty balance initially
          nonce: 0,
          treasuryId: `treasury_${Date.now()}`, // Temporary ID, will be replaced by on-chain ID
          createdAt: Date.now(),
          metadata: {
            name: data.name,
            organizationId: data.groupId,
          },
        };

        // Insert treasury entity into things table
        const treasuryId = yield* _(
          Effect.tryPromise({
            try: () =>
              db.insert("things", {
                type: "treasury",
                name: data.name || `Treasury ${data.owners.length}-of-${data.threshold}`,
                groupId: data.groupId,
                properties: treasuryProps,
                status: "active",
                createdAt: Date.now(),
                updatedAt: Date.now(),
              }),
            catch: (error) => ({
              _tag: "DatabaseError" as const,
              message: String(error),
            }),
          })
        );

        // Create connections: owns_treasury (dao → treasury)
        yield* _(
          Effect.tryPromise({
            try: () =>
              db.insert("connections", {
                fromThingId: data.daoId,
                toThingId: treasuryId,
                relationshipType: "owns_treasury",
                metadata: {
                  isOwner: true,
                  canApprove: true,
                  threshold: data.threshold,
                },
                validFrom: Date.now(),
                createdAt: Date.now(),
              }),
            catch: (error) => ({
              _tag: "DatabaseError" as const,
              message: String(error),
            }),
          })
        );

        // Create connections for each owner
        for (const ownerAddress of data.owners) {
          yield* _(
            Effect.tryPromise({
              try: () =>
                db.insert("connections", {
                  fromThingId: data.actorId,
                  toThingId: treasuryId,
                  relationshipType: "owns_treasury",
                  metadata: {
                    isOwner: true,
                    canApprove: true,
                    address: ownerAddress,
                  },
                  validFrom: Date.now(),
                  createdAt: Date.now(),
                }),
              catch: (error) => ({
                _tag: "DatabaseError" as const,
                message: String(error),
              }),
            })
          );
        }

        // Log event: treasury_created
        yield* _(
          Effect.tryPromise({
            try: () =>
              events.log({
                type: "treasury_created",
                actorId: data.actorId,
                targetId: treasuryId,
                timestamp: Date.now(),
                metadata: {
                  treasuryId: treasuryId,
                  owners: data.owners,
                  threshold: data.threshold,
                  daoId: data.daoId,
                  groupId: data.groupId,
                },
              }),
            catch: (error) => ({
              _tag: "DatabaseError" as const,
              message: String(error),
            }),
          })
        );

        // Get and return treasury entity
        const treasury = yield* _(
          Effect.tryPromise({
            try: () => db.get(treasuryId),
            catch: () => ({
              _tag: "TreasuryNotFoundError" as const,
              treasuryId: treasuryId,
            }),
          })
        );

        return treasury as TreasuryEntity;
      }),

    // ========================================================================
    // Propose Transaction
    // ========================================================================

    proposeTransaction: (data) =>
      Effect.gen(function* (_) {
        // Get treasury
        const treasury = yield* _(
          Effect.tryPromise({
            try: () => db.get(data.treasuryId),
            catch: () => ({
              _tag: "TreasuryNotFoundError" as const,
              treasuryId: data.treasuryId,
            }),
          })
        );

        if (!treasury) {
          return yield* _(
            Effect.fail<TreasuryError>({
              _tag: "TreasuryNotFoundError",
              treasuryId: data.treasuryId,
            })
          );
        }

        // Verify proposer is an owner
        const treasuryProps = treasury.properties as Treasury;
        const proposerConnections = yield* _(
          Effect.tryPromise({
            try: () =>
              db
                .query("connections")
                .withIndex("from_type", (q: any) =>
                  q
                    .eq("fromThingId", data.proposerId)
                    .eq("relationshipType", "owns_treasury")
                )
                .filter((c: any) => c.toThingId === data.treasuryId)
                .first(),
            catch: (error) => ({
              _tag: "DatabaseError" as const,
              message: String(error),
            }),
          })
        );

        if (!proposerConnections) {
          return yield* _(
            Effect.fail<TreasuryError>({
              _tag: "NotOwnerError",
              address: data.proposerId,
              treasuryId: data.treasuryId,
            })
          );
        }

        // Check balance
        const currentBalance = treasuryProps.balance[data.coinType] || "0";
        if (BigInt(currentBalance) < BigInt(data.amount)) {
          return yield* _(
            Effect.fail<TreasuryError>({
              _tag: "InsufficientBalanceError",
              coinType: data.coinType,
              required: data.amount,
              available: currentBalance,
            })
          );
        }

        // Create pending transaction
        const txId = `tx_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const expiresAt = data.expiresAt || Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days default

        const pendingTx: PendingTransaction = {
          id: txId,
          to: data.to,
          amount: data.amount,
          coinType: data.coinType,
          approvals: [proposerConnections.metadata.address], // Proposer auto-approves
          executed: false,
          expiresAt: expiresAt,
          createdAt: Date.now(),
          proposedBy: proposerConnections.metadata.address,
          description: data.description,
        };

        // Store pending transaction in treasury properties
        const updatedProps = {
          ...treasuryProps,
          nonce: treasuryProps.nonce + 1,
        };

        yield* _(
          Effect.tryPromise({
            try: () =>
              db.patch(data.treasuryId, {
                properties: updatedProps,
                updatedAt: Date.now(),
              }),
            catch: (error) => ({
              _tag: "DatabaseError" as const,
              message: String(error),
            }),
          })
        );

        // Store pending transaction as a separate thing
        const txThingId = yield* _(
          Effect.tryPromise({
            try: () =>
              db.insert("things", {
                type: "treasury_transaction",
                name: `Transaction ${txId}`,
                groupId: treasury.groupId,
                properties: pendingTx,
                status: "active",
                createdAt: Date.now(),
                updatedAt: Date.now(),
              }),
            catch: (error) => ({
              _tag: "DatabaseError" as const,
              message: String(error),
            }),
          })
        );

        // Create connection: treasury → transaction
        yield* _(
          Effect.tryPromise({
            try: () =>
              db.insert("connections", {
                fromThingId: data.treasuryId,
                toThingId: txThingId,
                relationshipType: "pending_transaction",
                metadata: { txId, status: "pending" },
                validFrom: Date.now(),
                createdAt: Date.now(),
              }),
            catch: (error) => ({
              _tag: "DatabaseError" as const,
              message: String(error),
            }),
          })
        );

        // Log event: treasury_approval (initial approval)
        yield* _(
          Effect.tryPromise({
            try: () =>
              events.log({
                type: "treasury_approval",
                actorId: data.proposerId,
                targetId: data.treasuryId,
                timestamp: Date.now(),
                metadata: {
                  treasuryId: data.treasuryId,
                  txId: txId,
                  approvers: [proposerConnections.metadata.address],
                  to: data.to,
                  amount: data.amount,
                  coinType: data.coinType,
                },
              }),
            catch: (error) => ({
              _tag: "DatabaseError" as const,
              message: String(error),
            }),
          })
        );

        return txId;
      }),

    // ========================================================================
    // Approve Transaction
    // ========================================================================

    approveTransaction: (data) =>
      Effect.gen(function* (_) {
        // Get treasury
        const treasury = yield* _(
          Effect.tryPromise({
            try: () => db.get(data.treasuryId),
            catch: () => ({
              _tag: "TreasuryNotFoundError" as const,
              treasuryId: data.treasuryId,
            }),
          })
        );

        if (!treasury) {
          return yield* _(
            Effect.fail<TreasuryError>({
              _tag: "TreasuryNotFoundError",
              treasuryId: data.treasuryId,
            })
          );
        }

        // Verify approver is an owner
        const approverConnection = yield* _(
          Effect.tryPromise({
            try: () =>
              db
                .query("connections")
                .withIndex("from_type", (q: any) =>
                  q
                    .eq("fromThingId", data.approverId)
                    .eq("relationshipType", "owns_treasury")
                )
                .filter((c: any) => c.toThingId === data.treasuryId)
                .first(),
            catch: (error) => ({
              _tag: "DatabaseError" as const,
              message: String(error),
            }),
          })
        );

        if (!approverConnection) {
          return yield* _(
            Effect.fail<TreasuryError>({
              _tag: "NotOwnerError",
              address: data.approverId,
              treasuryId: data.treasuryId,
            })
          );
        }

        // Get pending transaction
        const txConnections = yield* _(
          Effect.tryPromise({
            try: () =>
              db
                .query("connections")
                .withIndex("from_type", (q: any) =>
                  q
                    .eq("fromThingId", data.treasuryId)
                    .eq("relationshipType", "pending_transaction")
                )
                .filter((c: any) => c.metadata.txId === data.txId)
                .first(),
            catch: (error) => ({
              _tag: "DatabaseError" as const,
              message: String(error),
            }),
          })
        );

        if (!txConnections) {
          return yield* _(
            Effect.fail<TreasuryError>({
              _tag: "TransactionNotFoundError",
              txId: data.txId,
            })
          );
        }

        const txThing = yield* _(
          Effect.tryPromise({
            try: () => db.get(txConnections.toThingId),
            catch: () => ({
              _tag: "TransactionNotFoundError" as const,
              txId: data.txId,
            }),
          })
        );

        const pendingTx = txThing.properties as PendingTransaction;

        // Check if already executed
        if (pendingTx.executed) {
          return yield* _(
            Effect.fail<TreasuryError>({
              _tag: "TransactionAlreadyExecutedError",
              txId: data.txId,
            })
          );
        }

        // Check if expired
        if (pendingTx.expiresAt < Date.now()) {
          return yield* _(
            Effect.fail<TreasuryError>({
              _tag: "TransactionExpiredError",
              txId: data.txId,
              expiresAt: pendingTx.expiresAt,
              currentTime: Date.now(),
            })
          );
        }

        // Check if already approved by this owner
        const approverAddress = approverConnection.metadata.address;
        if (pendingTx.approvals.includes(approverAddress)) {
          return yield* _(
            Effect.fail<TreasuryError>({
              _tag: "AlreadyApprovedError",
              txId: data.txId,
              approverId: data.approverId,
            })
          );
        }

        // Add approval
        const updatedTx: PendingTransaction = {
          ...pendingTx,
          approvals: [...pendingTx.approvals, approverAddress],
        };

        yield* _(
          Effect.tryPromise({
            try: () =>
              db.patch(txThing._id, {
                properties: updatedTx,
                updatedAt: Date.now(),
              }),
            catch: (error) => ({
              _tag: "DatabaseError" as const,
              message: String(error),
            }),
          })
        );

        // Log event: treasury_approval
        yield* _(
          Effect.tryPromise({
            try: () =>
              events.log({
                type: "treasury_approval",
                actorId: data.approverId,
                targetId: data.treasuryId,
                timestamp: Date.now(),
                metadata: {
                  treasuryId: data.treasuryId,
                  txId: data.txId,
                  approvers: updatedTx.approvals,
                  approvalsCount: updatedTx.approvals.length,
                  threshold: (treasury.properties as Treasury).threshold,
                },
              }),
            catch: (error) => ({
              _tag: "DatabaseError" as const,
              message: String(error),
            }),
          })
        );
      }),

    // ========================================================================
    // Execute Transaction
    // ========================================================================

    executeTransaction: (data) =>
      Effect.gen(function* (_) {
        // Get treasury
        const treasury = yield* _(
          Effect.tryPromise({
            try: () => db.get(data.treasuryId),
            catch: () => ({
              _tag: "TreasuryNotFoundError" as const,
              treasuryId: data.treasuryId,
            }),
          })
        );

        if (!treasury) {
          return yield* _(
            Effect.fail<TreasuryError>({
              _tag: "TreasuryNotFoundError",
              treasuryId: data.treasuryId,
            })
          );
        }

        const treasuryProps = treasury.properties as Treasury;

        // Get pending transaction
        const txConnections = yield* _(
          Effect.tryPromise({
            try: () =>
              db
                .query("connections")
                .withIndex("from_type", (q: any) =>
                  q
                    .eq("fromThingId", data.treasuryId)
                    .eq("relationshipType", "pending_transaction")
                )
                .filter((c: any) => c.metadata.txId === data.txId)
                .first(),
            catch: (error) => ({
              _tag: "DatabaseError" as const,
              message: String(error),
            }),
          })
        );

        if (!txConnections) {
          return yield* _(
            Effect.fail<TreasuryError>({
              _tag: "TransactionNotFoundError",
              txId: data.txId,
            })
          );
        }

        const txThing = yield* _(
          Effect.tryPromise({
            try: () => db.get(txConnections.toThingId),
            catch: () => ({
              _tag: "TransactionNotFoundError" as const,
              txId: data.txId,
            }),
          })
        );

        const pendingTx = txThing.properties as PendingTransaction;

        // Check if already executed
        if (pendingTx.executed) {
          return yield* _(
            Effect.fail<TreasuryError>({
              _tag: "TransactionAlreadyExecutedError",
              txId: data.txId,
            })
          );
        }

        // Check if expired
        if (pendingTx.expiresAt < Date.now()) {
          return yield* _(
            Effect.fail<TreasuryError>({
              _tag: "TransactionExpiredError",
              txId: data.txId,
              expiresAt: pendingTx.expiresAt,
              currentTime: Date.now(),
            })
          );
        }

        // Check if threshold is met
        if (pendingTx.approvals.length < treasuryProps.threshold) {
          return yield* _(
            Effect.fail<TreasuryError>({
              _tag: "InsufficientApprovalsError",
              txId: data.txId,
              required: treasuryProps.threshold,
              current: pendingTx.approvals.length,
            })
          );
        }

        // Mark transaction as executed
        const executedTx: PendingTransaction = {
          ...pendingTx,
          executed: true,
          executedAt: Date.now(),
          executionTxHash: `sui_tx_${Date.now()}`, // Placeholder for actual Sui tx hash
        };

        yield* _(
          Effect.tryPromise({
            try: () =>
              db.patch(txThing._id, {
                properties: executedTx,
                status: "archived",
                updatedAt: Date.now(),
              }),
            catch: (error) => ({
              _tag: "DatabaseError" as const,
              message: String(error),
            }),
          })
        );

        // Update treasury balance
        const updatedBalance = { ...treasuryProps.balance };
        const currentBalance = BigInt(updatedBalance[pendingTx.coinType] || "0");
        const newBalance = currentBalance - BigInt(pendingTx.amount);
        updatedBalance[pendingTx.coinType] = newBalance.toString();

        yield* _(
          Effect.tryPromise({
            try: () =>
              db.patch(data.treasuryId, {
                properties: {
                  ...treasuryProps,
                  balance: updatedBalance,
                },
                updatedAt: Date.now(),
              }),
            catch: (error) => ({
              _tag: "DatabaseError" as const,
              message: String(error),
            }),
          })
        );

        // Log event: treasury_withdrawal
        yield* _(
          Effect.tryPromise({
            try: () =>
              events.log({
                type: "treasury_withdrawal",
                actorId: data.executorId,
                targetId: data.treasuryId,
                timestamp: Date.now(),
                metadata: {
                  treasuryId: data.treasuryId,
                  amount: pendingTx.amount,
                  coinType: pendingTx.coinType,
                  to: pendingTx.to,
                  approvers: pendingTx.approvals,
                  txDigest: executedTx.executionTxHash,
                },
              }),
            catch: (error) => ({
              _tag: "DatabaseError" as const,
              message: String(error),
            }),
          })
        );
      }),

    // ========================================================================
    // Get Treasury Balance
    // ========================================================================

    getTreasuryBalance: (treasuryId) =>
      Effect.gen(function* (_) {
        const treasury = yield* _(
          Effect.tryPromise({
            try: () => db.get(treasuryId),
            catch: () => ({
              _tag: "TreasuryNotFoundError" as const,
              treasuryId: treasuryId,
            }),
          })
        );

        if (!treasury) {
          return yield* _(
            Effect.fail<TreasuryError>({
              _tag: "TreasuryNotFoundError",
              treasuryId: treasuryId,
            })
          );
        }

        const treasuryProps = treasury.properties as Treasury;
        return treasuryProps.balance;
      }),

    // ========================================================================
    // Get Pending Transactions
    // ========================================================================

    getPendingTransactions: (treasuryId) =>
      Effect.gen(function* (_) {
        const treasury = yield* _(
          Effect.tryPromise({
            try: () => db.get(treasuryId),
            catch: () => ({
              _tag: "TreasuryNotFoundError" as const,
              treasuryId: treasuryId,
            }),
          })
        );

        if (!treasury) {
          return yield* _(
            Effect.fail<TreasuryError>({
              _tag: "TreasuryNotFoundError",
              treasuryId: treasuryId,
            })
          );
        }

        // Get all pending transaction connections
        const txConnections = yield* _(
          Effect.tryPromise({
            try: () =>
              db
                .query("connections")
                .withIndex("from_type", (q: any) =>
                  q
                    .eq("fromThingId", treasuryId)
                    .eq("relationshipType", "pending_transaction")
                )
                .collect(),
            catch: (error) => ({
              _tag: "DatabaseError" as const,
              message: String(error),
            }),
          })
        );

        // Get all transaction things
        const txThings = yield* _(
          Effect.tryPromise({
            try: async () => {
              const promises = txConnections.map((conn: any) => db.get(conn.toThingId));
              return await Promise.all(promises);
            },
            catch: (error) => ({
              _tag: "DatabaseError" as const,
              message: String(error),
            }),
          })
        );

        // Filter out executed transactions and return
        const pendingTxs = txThings
          .filter((thing: any) => thing && thing.status === "active")
          .map((thing: any) => thing.properties as PendingTransaction);

        return pendingTxs;
      }),

    // ========================================================================
    // Add Owner
    // ========================================================================

    addOwner: (data) =>
      Effect.gen(function* (_) {
        const treasury = yield* _(
          Effect.tryPromise({
            try: () => db.get(data.treasuryId),
            catch: () => ({
              _tag: "TreasuryNotFoundError" as const,
              treasuryId: data.treasuryId,
            }),
          })
        );

        if (!treasury) {
          return yield* _(
            Effect.fail<TreasuryError>({
              _tag: "TreasuryNotFoundError",
              treasuryId: data.treasuryId,
            })
          );
        }

        const treasuryProps = treasury.properties as Treasury;

        // Check if owner already exists
        if (treasuryProps.owners.includes(data.newOwner)) {
          return yield* _(
            Effect.fail<TreasuryError>({
              _tag: "OwnerAlreadyExistsError",
              address: data.newOwner,
            })
          );
        }

        // Add new owner
        const updatedOwners = [...treasuryProps.owners, data.newOwner];

        yield* _(
          Effect.tryPromise({
            try: () =>
              db.patch(data.treasuryId, {
                properties: {
                  ...treasuryProps,
                  owners: updatedOwners,
                },
                updatedAt: Date.now(),
              }),
            catch: (error) => ({
              _tag: "DatabaseError" as const,
              message: String(error),
            }),
          })
        );

        // Create connection for new owner
        yield* _(
          Effect.tryPromise({
            try: () =>
              db.insert("connections", {
                fromThingId: data.actorId,
                toThingId: data.treasuryId,
                relationshipType: "owns_treasury",
                metadata: {
                  isOwner: true,
                  canApprove: true,
                  address: data.newOwner,
                },
                validFrom: Date.now(),
                createdAt: Date.now(),
              }),
            catch: (error) => ({
              _tag: "DatabaseError" as const,
              message: String(error),
            }),
          })
        );

        // Log event
        yield* _(
          Effect.tryPromise({
            try: () =>
              events.log({
                type: "entity_updated",
                actorId: data.actorId,
                targetId: data.treasuryId,
                timestamp: Date.now(),
                metadata: {
                  entityType: "treasury",
                  action: "owner_added",
                  newOwner: data.newOwner,
                  totalOwners: updatedOwners.length,
                },
              }),
            catch: (error) => ({
              _tag: "DatabaseError" as const,
              message: String(error),
            }),
          })
        );
      }),

    // ========================================================================
    // Remove Owner
    // ========================================================================

    removeOwner: (data) =>
      Effect.gen(function* (_) {
        const treasury = yield* _(
          Effect.tryPromise({
            try: () => db.get(data.treasuryId),
            catch: () => ({
              _tag: "TreasuryNotFoundError" as const,
              treasuryId: data.treasuryId,
            }),
          })
        );

        if (!treasury) {
          return yield* _(
            Effect.fail<TreasuryError>({
              _tag: "TreasuryNotFoundError",
              treasuryId: data.treasuryId,
            })
          );
        }

        const treasuryProps = treasury.properties as Treasury;

        // Cannot remove if only one owner
        if (treasuryProps.owners.length <= 1) {
          return yield* _(
            Effect.fail<TreasuryError>({
              _tag: "CannotRemoveLastOwnerError",
              treasuryId: data.treasuryId,
            })
          );
        }

        // Remove owner
        const updatedOwners = treasuryProps.owners.filter(
          (owner) => owner !== data.ownerToRemove
        );

        // Adjust threshold if needed
        let updatedThreshold = treasuryProps.threshold;
        if (updatedThreshold > updatedOwners.length) {
          updatedThreshold = updatedOwners.length;
        }

        yield* _(
          Effect.tryPromise({
            try: () =>
              db.patch(data.treasuryId, {
                properties: {
                  ...treasuryProps,
                  owners: updatedOwners,
                  threshold: updatedThreshold,
                },
                updatedAt: Date.now(),
              }),
            catch: (error) => ({
              _tag: "DatabaseError" as const,
              message: String(error),
            }),
          })
        );

        // Remove connection
        const ownerConnection = yield* _(
          Effect.tryPromise({
            try: () =>
              db
                .query("connections")
                .withIndex("to_type", (q: any) =>
                  q
                    .eq("toThingId", data.treasuryId)
                    .eq("relationshipType", "owns_treasury")
                )
                .filter((c: any) => c.metadata.address === data.ownerToRemove)
                .first(),
            catch: (error) => ({
              _tag: "DatabaseError" as const,
              message: String(error),
            }),
          })
        );

        if (ownerConnection) {
          yield* _(
            Effect.tryPromise({
              try: () => db.delete(ownerConnection._id),
              catch: (error) => ({
                _tag: "DatabaseError" as const,
                message: String(error),
              }),
            })
          );
        }

        // Log event
        yield* _(
          Effect.tryPromise({
            try: () =>
              events.log({
                type: "entity_updated",
                actorId: data.actorId,
                targetId: data.treasuryId,
                timestamp: Date.now(),
                metadata: {
                  entityType: "treasury",
                  action: "owner_removed",
                  removedOwner: data.ownerToRemove,
                  totalOwners: updatedOwners.length,
                  threshold: updatedThreshold,
                },
              }),
            catch: (error) => ({
              _tag: "DatabaseError" as const,
              message: String(error),
            }),
          })
        );
      }),

    // ========================================================================
    // Update Threshold
    // ========================================================================

    updateThreshold: (data) =>
      Effect.gen(function* (_) {
        const treasury = yield* _(
          Effect.tryPromise({
            try: () => db.get(data.treasuryId),
            catch: () => ({
              _tag: "TreasuryNotFoundError" as const,
              treasuryId: data.treasuryId,
            }),
          })
        );

        if (!treasury) {
          return yield* _(
            Effect.fail<TreasuryError>({
              _tag: "TreasuryNotFoundError",
              treasuryId: data.treasuryId,
            })
          );
        }

        const treasuryProps = treasury.properties as Treasury;

        // Validate new threshold
        if (
          data.newThreshold < 1 ||
          data.newThreshold > treasuryProps.owners.length
        ) {
          return yield* _(
            Effect.fail<TreasuryError>({
              _tag: "InvalidThresholdError",
              threshold: data.newThreshold,
              ownersCount: treasuryProps.owners.length,
              reason:
                "Threshold must be between 1 and the number of owners",
            })
          );
        }

        yield* _(
          Effect.tryPromise({
            try: () =>
              db.patch(data.treasuryId, {
                properties: {
                  ...treasuryProps,
                  threshold: data.newThreshold,
                },
                updatedAt: Date.now(),
              }),
            catch: (error) => ({
              _tag: "DatabaseError" as const,
              message: String(error),
            }),
          })
        );

        // Log event
        yield* _(
          Effect.tryPromise({
            try: () =>
              events.log({
                type: "entity_updated",
                actorId: data.actorId,
                targetId: data.treasuryId,
                timestamp: Date.now(),
                metadata: {
                  entityType: "treasury",
                  action: "threshold_updated",
                  oldThreshold: treasuryProps.threshold,
                  newThreshold: data.newThreshold,
                },
              }),
            catch: (error) => ({
              _tag: "DatabaseError" as const,
              message: String(error),
            }),
          })
        );
      }),

    // ========================================================================
    // Get Treasury By ID
    // ========================================================================

    getById: (treasuryId) =>
      Effect.gen(function* (_) {
        const treasury = yield* _(
          Effect.tryPromise({
            try: () => db.get(treasuryId),
            catch: () => ({
              _tag: "TreasuryNotFoundError" as const,
              treasuryId: treasuryId,
            }),
          })
        );

        if (!treasury) {
          return yield* _(
            Effect.fail<TreasuryError>({
              _tag: "TreasuryNotFoundError",
              treasuryId: treasuryId,
            })
          );
        }

        return treasury as TreasuryEntity;
      }),
  });
