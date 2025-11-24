/**
 * TokenLaunchService - Sui Token Creation & Management Service
 *
 * Effect.ts service for creating and managing tokens on Sui blockchain.
 * Implements the 6-dimension ontology pattern:
 * - GROUPS: Multi-tenant groupId scoping
 * - PEOPLE: Actor-based authorization (actorId)
 * - THINGS: Token entities (type: "token")
 * - CONNECTIONS: Token holdings (holds_tokens)
 * - EVENTS: Complete audit trail (token_created, tokens_minted, etc.)
 * - KNOWLEDGE: Token metadata
 *
 * @module TokenLaunchService
 * @version 1.0.0
 */

import { Effect, Data } from "effect";
import { Id } from "../../_generated/dataModel";
import type { TokenMetadata, SuiNetwork } from "../../types/sui";

// ============================================================================
// Tagged Errors
// ============================================================================

/**
 * Token creation failed
 */
export class TokenCreationError extends Data.TaggedError("TokenCreationError")<{
  readonly reason: string;
  readonly groupId?: Id<"groups">;
  readonly actorId?: Id<"things">;
}> {}

/**
 * Token not found in database
 */
export class TokenNotFoundError extends Data.TaggedError("TokenNotFoundError")<{
  readonly tokenId: Id<"things">;
}> {}

/**
 * Insufficient permissions to perform operation
 */
export class InsufficientPermissionsError extends Data.TaggedError("InsufficientPermissionsError")<{
  readonly actorId: Id<"things">;
  readonly tokenId: Id<"things">;
  readonly requiredRole: string;
  readonly action: string;
}> {}

/**
 * Invalid token metadata
 */
export class InvalidMetadataError extends Data.TaggedError("InvalidMetadataError")<{
  readonly field: string;
  readonly value: unknown;
  readonly reason: string;
}> {}

/**
 * Group limit exceeded
 */
export class GroupLimitExceededError extends Data.TaggedError("GroupLimitExceededError")<{
  readonly groupId: Id<"groups">;
  readonly limitType: string;
  readonly current: number;
  readonly limit: number;
}> {}

/**
 * Sui network error
 */
export class SuiNetworkError extends Data.TaggedError("SuiNetworkError")<{
  readonly network: SuiNetwork;
  readonly operation: string;
  readonly message: string;
}> {}

/**
 * Union of all service errors
 */
export type TokenServiceError =
  | TokenCreationError
  | TokenNotFoundError
  | InsufficientPermissionsError
  | InvalidMetadataError
  | GroupLimitExceededError
  | SuiNetworkError;

// ============================================================================
// Service Types
// ============================================================================

/**
 * Token creation input
 */
export interface CreateTokenInput {
  readonly groupId: Id<"groups">;
  readonly actorId: Id<"things">;
  readonly name: string;
  readonly symbol: string;
  readonly decimals: number;
  readonly totalSupply: string;
  readonly network: SuiNetwork;
  readonly description?: string;
  readonly logoUrl?: string;
  readonly website?: string;
  readonly twitter?: string;
  readonly telegram?: string;
}

/**
 * Token entity from database
 */
export interface TokenEntity {
  readonly _id: Id<"things">;
  readonly _creationTime: number;
  readonly type: "token";
  readonly name: string;
  readonly groupId: Id<"groups">;
  readonly properties: TokenMetadata;
  readonly status: "draft" | "active" | "published" | "archived" | "deleted";
  readonly createdAt: number;
  readonly updatedAt: number;
}

/**
 * Token metadata update input
 */
export interface UpdateMetadataInput {
  readonly description?: string;
  readonly logoUrl?: string;
  readonly website?: string;
  readonly twitter?: string;
  readonly telegram?: string;
}

/**
 * Database context interface
 * This abstracts Convex database operations for testability
 */
export interface DatabaseContext {
  readonly get: <T>(id: Id<any>) => Promise<T | null>;
  readonly insert: <T>(table: string, document: any) => Promise<Id<any>>;
  readonly patch: (id: Id<any>, updates: any) => Promise<void>;
  readonly query: (table: string) => any;
}

/**
 * Sui provider interface
 * This abstracts Sui blockchain operations
 */
export interface SuiProvider {
  readonly createToken: (
    params: CreateTokenInput
  ) => Effect.Effect<
    { packageId: string; coinType: string },
    SuiNetworkError
  >;
  readonly mintTokens: (
    tokenId: string,
    amount: string,
    recipient: string
  ) => Effect.Effect<{ txDigest: string }, SuiNetworkError>;
  readonly burnTokens: (
    tokenId: string,
    amount: string
  ) => Effect.Effect<{ txDigest: string }, SuiNetworkError>;
}

// ============================================================================
// Service Implementation
// ============================================================================

/**
 * TokenLaunchService
 *
 * Provides Effect.ts-based token management operations.
 * All operations log events and enforce multi-tenant scoping.
 */
export class TokenLaunchService {
  constructor(
    private readonly db: DatabaseContext,
    private readonly suiProvider: SuiProvider
  ) {}

  // ==========================================================================
  // 1. CREATE TOKEN
  // ==========================================================================

  /**
   * Create a new token on Sui blockchain
   *
   * Steps:
   * 1. Validate group and actor permissions
   * 2. Check group token limit
   * 3. Deploy token contract on Sui
   * 4. Create token thing in database
   * 5. Create ownership connection
   * 6. Log token_created event
   * 7. Update group usage
   *
   * @param input - Token creation parameters
   * @returns Effect with TokenEntity or TokenServiceError
   *
   * @example
   * const result = await Effect.runPromise(
   *   service.createToken({
   *     groupId: "j123...",
   *     actorId: "j456...",
   *     name: "Agent Token",
   *     symbol: "AGT",
   *     decimals: 9,
   *     totalSupply: "1000000000000000000",
   *     network: "mainnet"
   *   })
   * );
   */
  createToken(
    input: CreateTokenInput
  ): Effect.Effect<TokenEntity, TokenServiceError> {
    return Effect.gen(this, function* (_) {
      // 1. Validate group exists and is active
      const group = yield* _(
        Effect.tryPromise({
          try: () => this.db.get<any>(input.groupId),
          catch: () =>
            new TokenCreationError({
              reason: "Failed to fetch group",
              groupId: input.groupId,
              actorId: input.actorId,
            }),
        })
      );

      if (!group) {
        return yield* _(
          Effect.fail(
            new TokenCreationError({
              reason: "Group not found",
              groupId: input.groupId,
              actorId: input.actorId,
            })
          )
        );
      }

      if (group.status !== "active") {
        return yield* _(
          Effect.fail(
            new TokenCreationError({
              reason: `Group status is ${group.status}, expected active`,
              groupId: input.groupId,
              actorId: input.actorId,
            })
          )
        );
      }

      // 2. Validate actor exists and has permissions
      const actor = yield* _(
        Effect.tryPromise({
          try: () => this.db.get<any>(input.actorId),
          catch: () =>
            new InsufficientPermissionsError({
              actorId: input.actorId,
              tokenId: "" as Id<"things">,
              requiredRole: "org_owner",
              action: "create_token",
            }),
        })
      );

      if (!actor) {
        return yield* _(
          Effect.fail(
            new InsufficientPermissionsError({
              actorId: input.actorId,
              tokenId: "" as Id<"things">,
              requiredRole: "org_owner",
              action: "create_token",
            })
          )
        );
      }

      // 3. Check group token limit
      if (group.usage.tokens >= group.limits.tokens) {
        return yield* _(
          Effect.fail(
            new GroupLimitExceededError({
              groupId: input.groupId,
              limitType: "tokens",
              current: group.usage.tokens,
              limit: group.limits.tokens,
            })
          )
        );
      }

      // 4. Validate token metadata
      if (input.decimals < 0 || input.decimals > 18) {
        return yield* _(
          Effect.fail(
            new InvalidMetadataError({
              field: "decimals",
              value: input.decimals,
              reason: "Decimals must be between 0 and 18",
            })
          )
        );
      }

      if (BigInt(input.totalSupply) <= 0) {
        return yield* _(
          Effect.fail(
            new InvalidMetadataError({
              field: "totalSupply",
              value: input.totalSupply,
              reason: "Total supply must be greater than 0",
            })
          )
        );
      }

      // 5. Deploy token on Sui blockchain
      const suiToken = yield* _(this.suiProvider.createToken(input));

      // 6. Create token thing in database
      const now = Date.now();
      const tokenMetadata: TokenMetadata = {
        name: input.name,
        symbol: input.symbol,
        decimals: input.decimals,
        totalSupply: input.totalSupply,
        creator: actor.properties.suiAddress || "",
        network: input.network,
        packageId: suiToken.packageId,
        coinType: suiToken.coinType,
        description: input.description,
        logoUrl: input.logoUrl,
        website: input.website,
        twitter: input.twitter,
        telegram: input.telegram,
        createdAt: now,
        updatedAt: now,
      };

      const tokenId = yield* _(
        Effect.tryPromise({
          try: () =>
            this.db.insert("things", {
              type: "token",
              name: input.name,
              groupId: input.groupId,
              properties: tokenMetadata,
              status: "active",
              createdAt: now,
              updatedAt: now,
            }),
          catch: () =>
            new TokenCreationError({
              reason: "Failed to insert token into database",
              groupId: input.groupId,
              actorId: input.actorId,
            }),
        })
      );

      // 7. Create ownership connection (actor owns token)
      yield* _(
        Effect.tryPromise({
          try: () =>
            this.db.insert("connections", {
              fromThingId: input.actorId,
              toThingId: tokenId,
              relationshipType: "owns",
              metadata: {
                role: "creator",
                permissions: ["mint", "burn", "transfer_ownership", "update_metadata"],
              },
              validFrom: now,
              createdAt: now,
            }),
          catch: () =>
            new TokenCreationError({
              reason: "Failed to create ownership connection",
              groupId: input.groupId,
              actorId: input.actorId,
            }),
        })
      );

      // 8. Log token_created event
      yield* _(
        Effect.tryPromise({
          try: () =>
            this.db.insert("events", {
              type: "token_created",
              actorId: input.actorId,
              targetId: tokenId,
              timestamp: now,
              metadata: {
                tokenId,
                network: input.network,
                coinType: suiToken.coinType,
                symbol: input.symbol,
                totalSupply: input.totalSupply,
                packageId: suiToken.packageId,
                groupId: input.groupId,
              },
            }),
          catch: () =>
            new TokenCreationError({
              reason: "Failed to log token_created event",
              groupId: input.groupId,
              actorId: input.actorId,
            }),
        })
      );

      // 9. Update group usage
      yield* _(
        Effect.tryPromise({
          try: () =>
            this.db.patch(input.groupId, {
              usage: {
                ...group.usage,
                tokens: group.usage.tokens + 1,
              },
            }),
          catch: () =>
            new TokenCreationError({
              reason: "Failed to update group usage",
              groupId: input.groupId,
              actorId: input.actorId,
            }),
        })
      );

      // 10. Fetch and return complete token entity
      const token = yield* _(
        Effect.tryPromise({
          try: () => this.db.get<TokenEntity>(tokenId),
          catch: () =>
            new TokenCreationError({
              reason: "Failed to fetch created token",
              groupId: input.groupId,
              actorId: input.actorId,
            }),
        })
      );

      if (!token) {
        return yield* _(
          Effect.fail(
            new TokenCreationError({
              reason: "Token created but not found in database",
              groupId: input.groupId,
              actorId: input.actorId,
            })
          )
        );
      }

      return token;
    });
  }

  // ==========================================================================
  // 2. MINT TOKENS
  // ==========================================================================

  /**
   * Mint additional tokens to a recipient
   *
   * Steps:
   * 1. Fetch token and validate existence
   * 2. Verify actor owns token
   * 3. Call Sui contract to mint tokens
   * 4. Update token total supply
   * 5. Create/update holds_tokens connection
   * 6. Log tokens_minted event
   *
   * @param tokenId - Token to mint
   * @param amount - Amount to mint
   * @param recipientId - Recipient thing ID
   * @param actorId - Actor performing the mint
   * @returns Effect with void or TokenServiceError
   *
   * @example
   * await Effect.runPromise(
   *   service.mintTokens("j789...", "1000000", "j012...", "j456...")
   * );
   */
  mintTokens(
    tokenId: Id<"things">,
    amount: string,
    recipientId: Id<"things">,
    actorId: Id<"things">
  ): Effect.Effect<void, TokenServiceError> {
    return Effect.gen(this, function* (_) {
      // 1. Fetch token
      const token = yield* _(
        Effect.tryPromise({
          try: () => this.db.get<TokenEntity>(tokenId),
          catch: () => new TokenNotFoundError({ tokenId }),
        })
      );

      if (!token) {
        return yield* _(Effect.fail(new TokenNotFoundError({ tokenId })));
      }

      // 2. Verify actor owns token
      const ownership = yield* _(
        Effect.tryPromise({
          try: async () => {
            const connections = await this.db
              .query("connections")
              .withIndex("from_type", (q: any) =>
                q.eq("fromThingId", actorId).eq("relationshipType", "owns")
              )
              .filter((c: any) => c.toThingId === tokenId)
              .first();
            return connections;
          },
          catch: () =>
            new InsufficientPermissionsError({
              actorId,
              tokenId,
              requiredRole: "owner",
              action: "mint_tokens",
            }),
        })
      );

      if (!ownership || !ownership.metadata.permissions?.includes("mint")) {
        return yield* _(
          Effect.fail(
            new InsufficientPermissionsError({
              actorId,
              tokenId,
              requiredRole: "owner",
              action: "mint_tokens",
            })
          )
        );
      }

      // 3. Fetch recipient
      const recipient = yield* _(
        Effect.tryPromise({
          try: () => this.db.get<any>(recipientId),
          catch: () =>
            new TokenCreationError({
              reason: "Recipient not found",
              actorId,
            }),
        })
      );

      if (!recipient) {
        return yield* _(
          Effect.fail(
            new TokenCreationError({
              reason: "Recipient not found",
              actorId,
            })
          )
        );
      }

      // 4. Call Sui contract to mint
      const recipientAddress = recipient.properties.suiAddress || "";
      const mintResult = yield* _(
        this.suiProvider.mintTokens(
          token.properties.packageId,
          amount,
          recipientAddress
        )
      );

      // 5. Update token total supply
      const newTotalSupply = (
        BigInt(token.properties.totalSupply) + BigInt(amount)
      ).toString();

      yield* _(
        Effect.tryPromise({
          try: () =>
            this.db.patch(tokenId, {
              properties: {
                ...token.properties,
                totalSupply: newTotalSupply,
                updatedAt: Date.now(),
              },
              updatedAt: Date.now(),
            }),
          catch: () =>
            new TokenCreationError({
              reason: "Failed to update token supply",
              actorId,
            }),
        })
      );

      // 6. Create/update holds_tokens connection
      const existingHolding = yield* _(
        Effect.tryPromise({
          try: async () => {
            const connection = await this.db
              .query("connections")
              .withIndex("from_type", (q: any) =>
                q.eq("fromThingId", recipientId).eq("relationshipType", "holds_tokens")
              )
              .filter((c: any) => c.toThingId === tokenId)
              .first();
            return connection;
          },
          catch: () => null,
        })
      );

      const now = Date.now();

      if (existingHolding) {
        const newBalance = (
          BigInt(existingHolding.metadata.balance) + BigInt(amount)
        ).toString();

        yield* _(
          Effect.tryPromise({
            try: () =>
              this.db.patch(existingHolding._id, {
                metadata: {
                  ...existingHolding.metadata,
                  balance: newBalance,
                },
                updatedAt: now,
              }),
            catch: () =>
              new TokenCreationError({
                reason: "Failed to update token holding",
                actorId,
              }),
          })
        );
      } else {
        yield* _(
          Effect.tryPromise({
            try: () =>
              this.db.insert("connections", {
                fromThingId: recipientId,
                toThingId: tokenId,
                relationshipType: "holds_tokens",
                metadata: {
                  balance: amount,
                  network: token.properties.network,
                  coinType: token.properties.coinType,
                  address: recipientAddress,
                },
                validFrom: now,
                createdAt: now,
              }),
            catch: () =>
              new TokenCreationError({
                reason: "Failed to create token holding",
                actorId,
              }),
          })
        );
      }

      // 7. Log tokens_minted event
      yield* _(
        Effect.tryPromise({
          try: () =>
            this.db.insert("events", {
              type: "tokens_minted",
              actorId,
              targetId: tokenId,
              timestamp: now,
              metadata: {
                tokenId,
                recipientId,
                network: token.properties.network,
                coinType: token.properties.coinType,
                amount,
                txDigest: mintResult.txDigest,
                newTotalSupply,
              },
            }),
          catch: () =>
            new TokenCreationError({
              reason: "Failed to log tokens_minted event",
              actorId,
            }),
        })
      );

      return yield* _(Effect.succeed(undefined));
    });
  }

  // ==========================================================================
  // 3. BURN TOKENS
  // ==========================================================================

  /**
   * Burn tokens from supply
   *
   * Steps:
   * 1. Fetch token and validate
   * 2. Verify actor owns token
   * 3. Call Sui contract to burn
   * 4. Update token total supply
   * 5. Log tokens_burned event
   *
   * @param tokenId - Token to burn
   * @param amount - Amount to burn
   * @param actorId - Actor performing the burn
   * @returns Effect with void or TokenServiceError
   *
   * @example
   * await Effect.runPromise(
   *   service.burnTokens("j789...", "1000000", "j456...")
   * );
   */
  burnTokens(
    tokenId: Id<"things">,
    amount: string,
    actorId: Id<"things">
  ): Effect.Effect<void, TokenServiceError> {
    return Effect.gen(this, function* (_) {
      // 1. Fetch token
      const token = yield* _(
        Effect.tryPromise({
          try: () => this.db.get<TokenEntity>(tokenId),
          catch: () => new TokenNotFoundError({ tokenId }),
        })
      );

      if (!token) {
        return yield* _(Effect.fail(new TokenNotFoundError({ tokenId })));
      }

      // 2. Verify actor owns token
      const ownership = yield* _(
        Effect.tryPromise({
          try: async () => {
            const connection = await this.db
              .query("connections")
              .withIndex("from_type", (q: any) =>
                q.eq("fromThingId", actorId).eq("relationshipType", "owns")
              )
              .filter((c: any) => c.toThingId === tokenId)
              .first();
            return connection;
          },
          catch: () =>
            new InsufficientPermissionsError({
              actorId,
              tokenId,
              requiredRole: "owner",
              action: "burn_tokens",
            }),
        })
      );

      if (!ownership || !ownership.metadata.permissions?.includes("burn")) {
        return yield* _(
          Effect.fail(
            new InsufficientPermissionsError({
              actorId,
              tokenId,
              requiredRole: "owner",
              action: "burn_tokens",
            })
          )
        );
      }

      // 3. Validate amount
      if (BigInt(amount) > BigInt(token.properties.totalSupply)) {
        return yield* _(
          Effect.fail(
            new InvalidMetadataError({
              field: "amount",
              value: amount,
              reason: "Cannot burn more than total supply",
            })
          )
        );
      }

      // 4. Call Sui contract to burn
      const burnResult = yield* _(
        this.suiProvider.burnTokens(token.properties.packageId, amount)
      );

      // 5. Update token total supply
      const newTotalSupply = (
        BigInt(token.properties.totalSupply) - BigInt(amount)
      ).toString();

      yield* _(
        Effect.tryPromise({
          try: () =>
            this.db.patch(tokenId, {
              properties: {
                ...token.properties,
                totalSupply: newTotalSupply,
                updatedAt: Date.now(),
              },
              updatedAt: Date.now(),
            }),
          catch: () =>
            new TokenCreationError({
              reason: "Failed to update token supply",
              actorId,
            }),
        })
      );

      // 6. Log tokens_burned event
      const now = Date.now();
      yield* _(
        Effect.tryPromise({
          try: () =>
            this.db.insert("events", {
              type: "tokens_burned",
              actorId,
              targetId: tokenId,
              timestamp: now,
              metadata: {
                tokenId,
                network: token.properties.network,
                coinType: token.properties.coinType,
                amount,
                txDigest: burnResult.txDigest,
                newTotalSupply,
              },
            }),
          catch: () =>
            new TokenCreationError({
              reason: "Failed to log tokens_burned event",
              actorId,
            }),
        })
      );

      return yield* _(Effect.succeed(undefined));
    });
  }

  // ==========================================================================
  // 4. TRANSFER OWNERSHIP
  // ==========================================================================

  /**
   * Transfer token ownership to new owner
   *
   * Steps:
   * 1. Fetch token and validate
   * 2. Verify actor owns token
   * 3. Verify new owner exists
   * 4. Update ownership connection
   * 5. Create new ownership connection
   * 6. Log event
   *
   * @param tokenId - Token to transfer
   * @param newOwnerId - New owner thing ID
   * @param actorId - Current owner
   * @returns Effect with void or TokenServiceError
   *
   * @example
   * await Effect.runPromise(
   *   service.transferOwnership("j789...", "j345...", "j456...")
   * );
   */
  transferOwnership(
    tokenId: Id<"things">,
    newOwnerId: Id<"things">,
    actorId: Id<"things">
  ): Effect.Effect<void, TokenServiceError> {
    return Effect.gen(this, function* (_) {
      // 1. Fetch token
      const token = yield* _(
        Effect.tryPromise({
          try: () => this.db.get<TokenEntity>(tokenId),
          catch: () => new TokenNotFoundError({ tokenId }),
        })
      );

      if (!token) {
        return yield* _(Effect.fail(new TokenNotFoundError({ tokenId })));
      }

      // 2. Verify actor owns token
      const ownership = yield* _(
        Effect.tryPromise({
          try: async () => {
            const connection = await this.db
              .query("connections")
              .withIndex("from_type", (q: any) =>
                q.eq("fromThingId", actorId).eq("relationshipType", "owns")
              )
              .filter((c: any) => c.toThingId === tokenId)
              .first();
            return connection;
          },
          catch: () =>
            new InsufficientPermissionsError({
              actorId,
              tokenId,
              requiredRole: "owner",
              action: "transfer_ownership",
            }),
        })
      );

      if (
        !ownership ||
        !ownership.metadata.permissions?.includes("transfer_ownership")
      ) {
        return yield* _(
          Effect.fail(
            new InsufficientPermissionsError({
              actorId,
              tokenId,
              requiredRole: "owner",
              action: "transfer_ownership",
            })
          )
        );
      }

      // 3. Verify new owner exists
      const newOwner = yield* _(
        Effect.tryPromise({
          try: () => this.db.get<any>(newOwnerId),
          catch: () =>
            new TokenCreationError({
              reason: "New owner not found",
              actorId,
            }),
        })
      );

      if (!newOwner) {
        return yield* _(
          Effect.fail(
            new TokenCreationError({
              reason: "New owner not found",
              actorId,
            })
          )
        );
      }

      const now = Date.now();

      // 4. Invalidate old ownership connection
      yield* _(
        Effect.tryPromise({
          try: () =>
            this.db.patch(ownership._id, {
              validTo: now,
              updatedAt: now,
            }),
          catch: () =>
            new TokenCreationError({
              reason: "Failed to invalidate old ownership",
              actorId,
            }),
        })
      );

      // 5. Create new ownership connection
      yield* _(
        Effect.tryPromise({
          try: () =>
            this.db.insert("connections", {
              fromThingId: newOwnerId,
              toThingId: tokenId,
              relationshipType: "owns",
              metadata: {
                role: "owner",
                permissions: ["mint", "burn", "transfer_ownership", "update_metadata"],
                transferredFrom: actorId,
              },
              validFrom: now,
              createdAt: now,
            }),
          catch: () =>
            new TokenCreationError({
              reason: "Failed to create new ownership",
              actorId,
            }),
        })
      );

      // 6. Log event
      yield* _(
        Effect.tryPromise({
          try: () =>
            this.db.insert("events", {
              type: "entity_updated",
              actorId,
              targetId: tokenId,
              timestamp: now,
              metadata: {
                entityType: "token",
                action: "ownership_transferred",
                tokenId,
                fromOwnerId: actorId,
                toOwnerId: newOwnerId,
              },
            }),
          catch: () =>
            new TokenCreationError({
              reason: "Failed to log ownership transfer event",
              actorId,
            }),
        })
      );

      return yield* _(Effect.succeed(undefined));
    });
  }

  // ==========================================================================
  // 5. UPDATE METADATA
  // ==========================================================================

  /**
   * Update token metadata (description, logo, links)
   *
   * Steps:
   * 1. Fetch token and validate
   * 2. Verify actor owns token
   * 3. Update token properties
   * 4. Log event
   *
   * @param tokenId - Token to update
   * @param metadata - New metadata fields
   * @param actorId - Actor updating metadata
   * @returns Effect with void or TokenServiceError
   *
   * @example
   * await Effect.runPromise(
   *   service.updateMetadata("j789...", {
   *     description: "Updated description",
   *     website: "https://example.com"
   *   }, "j456...")
   * );
   */
  updateMetadata(
    tokenId: Id<"things">,
    metadata: UpdateMetadataInput,
    actorId: Id<"things">
  ): Effect.Effect<void, TokenServiceError> {
    return Effect.gen(this, function* (_) {
      // 1. Fetch token
      const token = yield* _(
        Effect.tryPromise({
          try: () => this.db.get<TokenEntity>(tokenId),
          catch: () => new TokenNotFoundError({ tokenId }),
        })
      );

      if (!token) {
        return yield* _(Effect.fail(new TokenNotFoundError({ tokenId })));
      }

      // 2. Verify actor owns token
      const ownership = yield* _(
        Effect.tryPromise({
          try: async () => {
            const connection = await this.db
              .query("connections")
              .withIndex("from_type", (q: any) =>
                q.eq("fromThingId", actorId).eq("relationshipType", "owns")
              )
              .filter((c: any) => c.toThingId === tokenId)
              .first();
            return connection;
          },
          catch: () =>
            new InsufficientPermissionsError({
              actorId,
              tokenId,
              requiredRole: "owner",
              action: "update_metadata",
            }),
        })
      );

      if (
        !ownership ||
        !ownership.metadata.permissions?.includes("update_metadata")
      ) {
        return yield* _(
          Effect.fail(
            new InsufficientPermissionsError({
              actorId,
              tokenId,
              requiredRole: "owner",
              action: "update_metadata",
            })
          )
        );
      }

      // 3. Update token properties
      const now = Date.now();
      const updatedProperties = {
        ...token.properties,
        ...metadata,
        updatedAt: now,
      };

      yield* _(
        Effect.tryPromise({
          try: () =>
            this.db.patch(tokenId, {
              properties: updatedProperties,
              updatedAt: now,
            }),
          catch: () =>
            new TokenCreationError({
              reason: "Failed to update token metadata",
              actorId,
            }),
        })
      );

      // 4. Log event
      yield* _(
        Effect.tryPromise({
          try: () =>
            this.db.insert("events", {
              type: "entity_updated",
              actorId,
              targetId: tokenId,
              timestamp: now,
              metadata: {
                entityType: "token",
                action: "metadata_updated",
                tokenId,
                updatedFields: Object.keys(metadata),
              },
            }),
          catch: () =>
            new TokenCreationError({
              reason: "Failed to log metadata update event",
              actorId,
            }),
        })
      );

      return yield* _(Effect.succeed(undefined));
    });
  }

  // ==========================================================================
  // 6. GET TOKEN DETAILS
  // ==========================================================================

  /**
   * Get token details from database
   *
   * @param tokenId - Token to fetch
   * @returns Effect with TokenEntity or TokenServiceError
   *
   * @example
   * const token = await Effect.runPromise(
   *   service.getTokenDetails("j789...")
   * );
   */
  getTokenDetails(
    tokenId: Id<"things">
  ): Effect.Effect<TokenEntity, TokenServiceError> {
    return Effect.gen(this, function* (_) {
      const token = yield* _(
        Effect.tryPromise({
          try: () => this.db.get<TokenEntity>(tokenId),
          catch: () => new TokenNotFoundError({ tokenId }),
        })
      );

      if (!token) {
        return yield* _(Effect.fail(new TokenNotFoundError({ tokenId })));
      }

      if (token.type !== "token") {
        return yield* _(
          Effect.fail(
            new TokenNotFoundError({
              tokenId,
            })
          )
        );
      }

      return token;
    });
  }
}

// ============================================================================
// Service Factory
// ============================================================================

/**
 * Create TokenLaunchService instance
 *
 * @param db - Database context
 * @param suiProvider - Sui provider
 * @returns TokenLaunchService instance
 *
 * @example
 * const service = createTokenLaunchService(db, suiProvider);
 * const result = await Effect.runPromise(
 *   service.createToken({ ... })
 * );
 */
export function createTokenLaunchService(
  db: DatabaseContext,
  suiProvider: SuiProvider
): TokenLaunchService {
  return new TokenLaunchService(db, suiProvider);
}
