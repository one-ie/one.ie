/**
 * TokenRegistryService - Token Discovery and Verification Service
 *
 * Provides Effect.ts-based services for token registration, verification,
 * and discovery in the Sui launchpad ecosystem.
 *
 * This service implements the following operations:
 * - registerToken: Register new tokens in the on-chain registry and database
 * - verifyToken: Mark tokens as verified (platform_owner only, trust badge)
 * - unverifyToken: Remove verification status (for scam tokens)
 * - getVerifiedTokens: List all verified tokens
 * - searchTokens: Full-text search by name/symbol
 * - getTokensByCreator: List tokens created by a specific creator
 *
 * ## 6-Dimension Mapping
 *
 * - **THINGS**: Tokens stored in things table with type: "token"
 * - **PEOPLE**: Actor validation (platform_owner for verification)
 * - **CONNECTIONS**: creator → owns → token, user → holds_tokens → token
 * - **EVENTS**: token_created, entity_updated (verification changes)
 * - **GROUPS**: Organization scoping for multi-tenant isolation
 * - **KNOWLEDGE**: Token metadata for discovery and search
 *
 * ## Error Types
 *
 * All errors are tagged for Effect.ts exhaustive error handling:
 * - TokenNotFoundError: Token with given ID doesn't exist
 * - InsufficientPermissionsError: Actor lacks required permissions (platform_owner)
 * - AlreadyRegisteredError: Token already exists in registry
 * - ServiceError: Generic service failures
 *
 * @module TokenRegistryService
 */

import { Effect, Data } from "effect";
import type { GenericDatabaseWriter, GenericQueryCtx } from "convex/server";
import type { DataModel } from "../../_generated/dataModel";
import type { Id } from "../../_generated/dataModel";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Token entity from the things table
 */
export interface TokenEntity {
  _id: Id<"things">;
  type: "token";
  name: string;
  groupId?: Id<"groups">;
  status: "draft" | "active" | "published" | "archived" | "deleted";
  properties: {
    // Sui network configuration
    network: "sui-mainnet" | "sui-testnet" | "sui-devnet";
    packageId: string; // Sui package ID
    coinType: string; // Full coin type (0x...::coin::COIN)
    symbol: string; // Token symbol (e.g., "USDC")
    decimals: number; // Token decimals (e.g., 6)
    totalSupply: string; // Total supply (as string for big numbers)

    // Verification status
    verified: boolean; // Community verification status
    verifiedAt?: number; // Timestamp of verification
    verifiedBy?: Id<"things">; // ID of person who verified

    // Metadata
    description?: string;
    iconUrl?: string;
    website?: string;
    twitter?: string;
    telegram?: string;

    // Registry data
    registryObjectId?: string; // On-chain registry object ID
    registeredAt?: number; // Timestamp of registration
  };
  createdAt: number;
  updatedAt: number;
}

/**
 * Input for registering a new token
 */
export interface RegisterTokenInput {
  // Token identity
  name: string;
  symbol: string;
  decimals: number;

  // Sui network configuration
  network: "sui-mainnet" | "sui-testnet" | "sui-devnet";
  packageId: string;
  coinType: string;
  totalSupply: string;

  // Organization context
  groupId?: Id<"groups">;

  // Optional metadata
  description?: string;
  iconUrl?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
}

/**
 * Search query options
 */
export interface SearchTokensOptions {
  query: string; // Search term (name or symbol)
  network?: "sui-mainnet" | "sui-testnet" | "sui-devnet"; // Filter by network
  verifiedOnly?: boolean; // Only return verified tokens
  limit?: number; // Maximum results (default: 50)
}

// ============================================================================
// ERRORS (Tagged for Effect.ts)
// ============================================================================

/**
 * Token not found error
 *
 * Thrown when a requested token doesn't exist in the database.
 */
export class TokenNotFoundError extends Data.TaggedError("TokenNotFoundError")<{
  tokenId: string;
  message: string;
}> {}

/**
 * Insufficient permissions error
 *
 * Thrown when an actor attempts an operation without required permissions.
 * Verification operations require platform_owner role.
 */
export class InsufficientPermissionsError extends Data.TaggedError(
  "InsufficientPermissionsError"
)<{
  actorId: string;
  requiredRole: string;
  actualRole?: string;
  message: string;
}> {}

/**
 * Already registered error
 *
 * Thrown when attempting to register a token that already exists.
 * Prevents duplicate token registrations.
 */
export class AlreadyRegisteredError extends Data.TaggedError(
  "AlreadyRegisteredError"
)<{
  coinType: string;
  existingTokenId: string;
  message: string;
}> {}

/**
 * Generic service error
 *
 * Thrown for unexpected failures during service operations.
 */
export class ServiceError extends Data.TaggedError("ServiceError")<{
  operation: string;
  message: string;
  cause?: unknown;
}> {}

// ============================================================================
// SERVICE IMPLEMENTATION
// ============================================================================

/**
 * Token Registry Service
 *
 * Provides token discovery and verification functionality for the Sui launchpad.
 *
 * @example
 * ```typescript
 * // Register a new token
 * const result = await Effect.runPromise(
 *   registerToken(ctx, {
 *     tokenId: "abc123",
 *     creatorId: creatorPersonId,
 *     metadata: {
 *       name: "My Token",
 *       symbol: "MTK",
 *       decimals: 9,
 *       network: "sui-testnet",
 *       packageId: "0x...",
 *       coinType: "0x...::coin::MTK",
 *       totalSupply: "1000000000"
 *     }
 *   })
 * );
 * ```
 */
export class TokenRegistryService {
  /**
   * Register a new token in the registry
   *
   * Creates a token entity in the things table and registers it in the
   * on-chain Sui registry. Validates that the token doesn't already exist
   * and that the creator has proper permissions.
   *
   * ## Implementation Steps
   * 1. Validate creator exists and has groupId
   * 2. Check if token already exists (by coinType)
   * 3. Create token entity in things table
   * 4. Create ownership connection (creator → owns → token)
   * 5. Log token_created event
   * 6. Update organization usage (tokens count)
   * 7. [TODO] Register on-chain in Sui registry
   *
   * @param ctx - Convex query context with database access
   * @param creatorId - ID of the person creating the token
   * @param input - Token registration data
   * @returns Effect that resolves to the token ID
   *
   * @throws {AlreadyRegisteredError} If token with same coinType exists
   * @throws {ServiceError} If creator not found or database operation fails
   *
   * @example
   * ```typescript
   * const tokenId = await Effect.runPromise(
   *   TokenRegistryService.registerToken(ctx, creatorId, {
   *     name: "Example Token",
   *     symbol: "EXT",
   *     decimals: 9,
   *     network: "sui-testnet",
   *     packageId: "0x123...",
   *     coinType: "0x123...::coin::EXT",
   *     totalSupply: "1000000000",
   *     groupId: groupId,
   *   })
   * );
   * ```
   */
  static registerToken(
    ctx: GenericQueryCtx<DataModel> & {
      db: GenericDatabaseWriter<DataModel>;
    },
    creatorId: Id<"things">,
    input: RegisterTokenInput
  ): Effect.Effect<Id<"things">, AlreadyRegisteredError | ServiceError, never> {
    return Effect.gen(function* () {
      // 1. Validate creator exists
      const creator = yield* Effect.tryPromise({
        try: () => ctx.db.get(creatorId),
        catch: (error) =>
          new ServiceError({
            operation: "registerToken",
            message: "Failed to fetch creator",
            cause: error,
          }),
      });

      if (!creator) {
        return yield* Effect.fail(
          new ServiceError({
            operation: "registerToken",
            message: `Creator with id ${creatorId} not found`,
          })
        );
      }

      // 2. Check if token already exists (by coinType)
      const existingToken = yield* Effect.tryPromise({
        try: async () => {
          const tokens = await ctx.db
            .query("things")
            .withIndex("by_type", (q) => q.eq("type", "token"))
            .collect();

          return tokens.find(
            (t) =>
              t.properties?.coinType === input.coinType &&
              t.properties?.network === input.network
          );
        },
        catch: (error) =>
          new ServiceError({
            operation: "registerToken",
            message: "Failed to check for existing token",
            cause: error,
          }),
      });

      if (existingToken) {
        return yield* Effect.fail(
          new AlreadyRegisteredError({
            coinType: input.coinType,
            existingTokenId: existingToken._id,
            message: `Token with coinType ${input.coinType} on ${input.network} already registered`,
          })
        );
      }

      // 3. Create token entity in things table
      const now = Date.now();
      const tokenId = yield* Effect.tryPromise({
        try: () =>
          ctx.db.insert("things", {
            type: "token",
            name: input.name,
            groupId: input.groupId || creator.groupId,
            status: "active",
            properties: {
              network: input.network,
              packageId: input.packageId,
              coinType: input.coinType,
              symbol: input.symbol,
              decimals: input.decimals,
              totalSupply: input.totalSupply,
              verified: false,
              description: input.description,
              iconUrl: input.iconUrl,
              website: input.website,
              twitter: input.twitter,
              telegram: input.telegram,
              registeredAt: now,
            },
            createdAt: now,
            updatedAt: now,
          }),
        catch: (error) =>
          new ServiceError({
            operation: "registerToken",
            message: "Failed to create token entity",
            cause: error,
          }),
      });

      // 4. Create ownership connection (creator → owns → token)
      yield* Effect.tryPromise({
        try: () =>
          ctx.db.insert("connections", {
            fromThingId: creatorId,
            toThingId: tokenId,
            relationshipType: "owns",
            metadata: {
              role: "creator",
              createdAt: now,
            },
            validFrom: now,
            createdAt: now,
          }),
        catch: (error) =>
          new ServiceError({
            operation: "registerToken",
            message: "Failed to create ownership connection",
            cause: error,
          }),
      });

      // 5. Log token_created event
      yield* Effect.tryPromise({
        try: () =>
          ctx.db.insert("events", {
            type: "token_created",
            actorId: creatorId,
            targetId: tokenId,
            timestamp: now,
            metadata: {
              tokenType: "token",
              symbol: input.symbol,
              network: input.network,
              coinType: input.coinType,
              groupId: input.groupId || creator.groupId,
            },
          }),
        catch: (error) =>
          new ServiceError({
            operation: "registerToken",
            message: "Failed to log token_created event",
            cause: error,
          }),
      });

      // 6. Update organization usage (tokens count)
      if (input.groupId || creator.groupId) {
        const groupId = input.groupId || creator.groupId;
        yield* Effect.tryPromise({
          try: async () => {
            const group = await ctx.db.get(groupId!);
            if (group) {
              await ctx.db.patch(groupId!, {
                usage: {
                  ...group.usage,
                  tokens: group.usage.tokens + 1,
                },
                updatedAt: now,
              });
            }
          },
          catch: (error) =>
            new ServiceError({
              operation: "registerToken",
              message: "Failed to update group usage",
              cause: error,
            }),
        });
      }

      // 7. [TODO] Register on-chain in Sui registry
      // This would involve calling a Sui smart contract to register the token
      // For now, we just store it in the database

      return tokenId;
    });
  }

  /**
   * Verify a token (platform_owner only)
   *
   * Marks a token as verified, adding a trust badge. Only platform_owner
   * role can verify tokens. This is used for community curation to prevent
   * scam tokens.
   *
   * ## Implementation Steps
   * 1. Validate verifier is platform_owner
   * 2. Fetch token entity
   * 3. Update token properties (verified: true, verifiedAt, verifiedBy)
   * 4. Log entity_updated event
   *
   * @param ctx - Convex query context with database access
   * @param tokenId - ID of the token to verify
   * @param verifierId - ID of the person verifying (must be platform_owner)
   * @returns Effect that resolves to void on success
   *
   * @throws {TokenNotFoundError} If token doesn't exist
   * @throws {InsufficientPermissionsError} If verifier is not platform_owner
   * @throws {ServiceError} If database operation fails
   *
   * @example
   * ```typescript
   * await Effect.runPromise(
   *   TokenRegistryService.verifyToken(ctx, tokenId, platformOwnerId)
   * );
   * ```
   */
  static verifyToken(
    ctx: GenericQueryCtx<DataModel> & {
      db: GenericDatabaseWriter<DataModel>;
    },
    tokenId: Id<"things">,
    verifierId: Id<"things">
  ): Effect.Effect<
    void,
    TokenNotFoundError | InsufficientPermissionsError | ServiceError,
    never
  > {
    return Effect.gen(function* () {
      // 1. Validate verifier is platform_owner
      const verifier = yield* Effect.tryPromise({
        try: () => ctx.db.get(verifierId),
        catch: (error) =>
          new ServiceError({
            operation: "verifyToken",
            message: "Failed to fetch verifier",
            cause: error,
          }),
      });

      if (!verifier) {
        return yield* Effect.fail(
          new ServiceError({
            operation: "verifyToken",
            message: `Verifier with id ${verifierId} not found`,
          })
        );
      }

      const verifierRole = verifier.properties?.role;
      if (verifierRole !== "platform_owner") {
        return yield* Effect.fail(
          new InsufficientPermissionsError({
            actorId: verifierId,
            requiredRole: "platform_owner",
            actualRole: verifierRole,
            message: "Only platform_owner can verify tokens",
          })
        );
      }

      // 2. Fetch token entity
      const token = yield* Effect.tryPromise({
        try: () => ctx.db.get(tokenId),
        catch: (error) =>
          new ServiceError({
            operation: "verifyToken",
            message: "Failed to fetch token",
            cause: error,
          }),
      });

      if (!token) {
        return yield* Effect.fail(
          new TokenNotFoundError({
            tokenId,
            message: `Token with id ${tokenId} not found`,
          })
        );
      }

      if (token.type !== "token") {
        return yield* Effect.fail(
          new ServiceError({
            operation: "verifyToken",
            message: `Entity ${tokenId} is not a token (type: ${token.type})`,
          })
        );
      }

      // 3. Update token properties
      const now = Date.now();
      yield* Effect.tryPromise({
        try: () =>
          ctx.db.patch(tokenId, {
            properties: {
              ...token.properties,
              verified: true,
              verifiedAt: now,
              verifiedBy: verifierId,
            },
            updatedAt: now,
          }),
        catch: (error) =>
          new ServiceError({
            operation: "verifyToken",
            message: "Failed to update token verification status",
            cause: error,
          }),
      });

      // 4. Log entity_updated event
      yield* Effect.tryPromise({
        try: () =>
          ctx.db.insert("events", {
            type: "entity_updated",
            actorId: verifierId,
            targetId: tokenId,
            timestamp: now,
            metadata: {
              entityType: "token",
              updateType: "verification",
              verified: true,
              verifiedBy: verifierId,
            },
          }),
        catch: (error) =>
          new ServiceError({
            operation: "verifyToken",
            message: "Failed to log verification event",
            cause: error,
          }),
      });
    });
  }

  /**
   * Remove verification from a token
   *
   * Unverifies a token (removes trust badge). Used when a token is discovered
   * to be a scam or no longer meets verification criteria. Only platform_owner
   * can unverify tokens.
   *
   * ## Implementation Steps
   * 1. Validate unverifier is platform_owner
   * 2. Fetch token entity
   * 3. Update token properties (verified: false, remove verifiedAt/verifiedBy)
   * 4. Log entity_updated event
   *
   * @param ctx - Convex query context with database access
   * @param tokenId - ID of the token to unverify
   * @param verifierId - ID of the person unverifying (must be platform_owner)
   * @returns Effect that resolves to void on success
   *
   * @throws {TokenNotFoundError} If token doesn't exist
   * @throws {InsufficientPermissionsError} If unverifier is not platform_owner
   * @throws {ServiceError} If database operation fails
   *
   * @example
   * ```typescript
   * await Effect.runPromise(
   *   TokenRegistryService.unverifyToken(ctx, scamTokenId, platformOwnerId)
   * );
   * ```
   */
  static unverifyToken(
    ctx: GenericQueryCtx<DataModel> & {
      db: GenericDatabaseWriter<DataModel>;
    },
    tokenId: Id<"things">,
    verifierId: Id<"things">
  ): Effect.Effect<
    void,
    TokenNotFoundError | InsufficientPermissionsError | ServiceError,
    never
  > {
    return Effect.gen(function* () {
      // 1. Validate verifier is platform_owner
      const verifier = yield* Effect.tryPromise({
        try: () => ctx.db.get(verifierId),
        catch: (error) =>
          new ServiceError({
            operation: "unverifyToken",
            message: "Failed to fetch verifier",
            cause: error,
          }),
      });

      if (!verifier) {
        return yield* Effect.fail(
          new ServiceError({
            operation: "unverifyToken",
            message: `Verifier with id ${verifierId} not found`,
          })
        );
      }

      const verifierRole = verifier.properties?.role;
      if (verifierRole !== "platform_owner") {
        return yield* Effect.fail(
          new InsufficientPermissionsError({
            actorId: verifierId,
            requiredRole: "platform_owner",
            actualRole: verifierRole,
            message: "Only platform_owner can unverify tokens",
          })
        );
      }

      // 2. Fetch token entity
      const token = yield* Effect.tryPromise({
        try: () => ctx.db.get(tokenId),
        catch: (error) =>
          new ServiceError({
            operation: "unverifyToken",
            message: "Failed to fetch token",
            cause: error,
          }),
      });

      if (!token) {
        return yield* Effect.fail(
          new TokenNotFoundError({
            tokenId,
            message: `Token with id ${tokenId} not found`,
          })
        );
      }

      if (token.type !== "token") {
        return yield* Effect.fail(
          new ServiceError({
            operation: "unverifyToken",
            message: `Entity ${tokenId} is not a token (type: ${token.type})`,
          })
        );
      }

      // 3. Update token properties
      const now = Date.now();
      const updatedProperties = { ...token.properties };
      updatedProperties.verified = false;
      delete updatedProperties.verifiedAt;
      delete updatedProperties.verifiedBy;

      yield* Effect.tryPromise({
        try: () =>
          ctx.db.patch(tokenId, {
            properties: updatedProperties,
            updatedAt: now,
          }),
        catch: (error) =>
          new ServiceError({
            operation: "unverifyToken",
            message: "Failed to update token verification status",
            cause: error,
          }),
      });

      // 4. Log entity_updated event
      yield* Effect.tryPromise({
        try: () =>
          ctx.db.insert("events", {
            type: "entity_updated",
            actorId: verifierId,
            targetId: tokenId,
            timestamp: now,
            metadata: {
              entityType: "token",
              updateType: "unverification",
              verified: false,
              unverifiedBy: verifierId,
            },
          }),
        catch: (error) =>
          new ServiceError({
            operation: "unverifyToken",
            message: "Failed to log unverification event",
            cause: error,
          }),
      });
    });
  }

  /**
   * Get all verified tokens
   *
   * Returns a list of all tokens that have been verified by platform_owner.
   * Useful for displaying trusted tokens to users.
   *
   * @param ctx - Convex query context
   * @returns Effect that resolves to array of verified token entities
   *
   * @throws {ServiceError} If database query fails
   *
   * @example
   * ```typescript
   * const verifiedTokens = await Effect.runPromise(
   *   TokenRegistryService.getVerifiedTokens(ctx)
   * );
   * ```
   */
  static getVerifiedTokens(
    ctx: GenericQueryCtx<DataModel>
  ): Effect.Effect<TokenEntity[], ServiceError, never> {
    return Effect.gen(function* () {
      const tokens = yield* Effect.tryPromise({
        try: async () => {
          const allTokens = await ctx.db
            .query("things")
            .withIndex("by_type", (q) => q.eq("type", "token"))
            .filter((q) => q.eq(q.field("status"), "active"))
            .collect();

          // Filter for verified tokens
          return allTokens.filter(
            (t) => t.properties?.verified === true
          ) as TokenEntity[];
        },
        catch: (error) =>
          new ServiceError({
            operation: "getVerifiedTokens",
            message: "Failed to fetch verified tokens",
            cause: error,
          }),
      });

      return tokens;
    });
  }

  /**
   * Search tokens by name or symbol
   *
   * Full-text search across token names and symbols. Supports filtering by
   * network and verification status.
   *
   * @param ctx - Convex query context
   * @param options - Search options (query, network, verifiedOnly, limit)
   * @returns Effect that resolves to array of matching token entities
   *
   * @throws {ServiceError} If search operation fails
   *
   * @example
   * ```typescript
   * const tokens = await Effect.runPromise(
   *   TokenRegistryService.searchTokens(ctx, {
   *     query: "USD",
   *     network: "sui-mainnet",
   *     verifiedOnly: true,
   *     limit: 10
   *   })
   * );
   * ```
   */
  static searchTokens(
    ctx: GenericQueryCtx<DataModel>,
    options: SearchTokensOptions
  ): Effect.Effect<TokenEntity[], ServiceError, never> {
    return Effect.gen(function* () {
      const { query, network, verifiedOnly, limit = 50 } = options;

      const tokens = yield* Effect.tryPromise({
        try: async () => {
          // Use search index for name/symbol search
          let results = await ctx.db
            .query("things")
            .withSearchIndex("search_things", (q) =>
              q.search("name", query).eq("type", "token").eq("status", "active")
            )
            .take(limit * 2); // Get more results for filtering

          // Convert to TokenEntity type
          let tokenEntities = results as TokenEntity[];

          // Filter by network if specified
          if (network) {
            tokenEntities = tokenEntities.filter(
              (t) => t.properties?.network === network
            );
          }

          // Filter by verification status if specified
          if (verifiedOnly) {
            tokenEntities = tokenEntities.filter(
              (t) => t.properties?.verified === true
            );
          }

          // Also search by symbol (in properties)
          const symbolQuery = query.toUpperCase();
          tokenEntities = tokenEntities.filter(
            (t) =>
              t.name.toLowerCase().includes(query.toLowerCase()) ||
              t.properties?.symbol?.toUpperCase().includes(symbolQuery)
          );

          // Apply final limit
          return tokenEntities.slice(0, limit);
        },
        catch: (error) =>
          new ServiceError({
            operation: "searchTokens",
            message: "Failed to search tokens",
            cause: error,
          }),
      });

      return tokens;
    });
  }

  /**
   * Get tokens created by a specific creator
   *
   * Returns all tokens owned by the specified creator (via owns connection).
   *
   * @param ctx - Convex query context
   * @param creatorId - ID of the creator person
   * @returns Effect that resolves to array of token entities
   *
   * @throws {ServiceError} If database query fails
   *
   * @example
   * ```typescript
   * const myTokens = await Effect.runPromise(
   *   TokenRegistryService.getTokensByCreator(ctx, creatorId)
   * );
   * ```
   */
  static getTokensByCreator(
    ctx: GenericQueryCtx<DataModel>,
    creatorId: Id<"things">
  ): Effect.Effect<TokenEntity[], ServiceError, never> {
    return Effect.gen(function* () {
      const tokens = yield* Effect.tryPromise({
        try: async () => {
          // Find all ownership connections from creator
          const connections = await ctx.db
            .query("connections")
            .withIndex("from_type", (q) =>
              q.eq("fromThingId", creatorId).eq("relationshipType", "owns")
            )
            .collect();

          // Fetch all tokens
          const tokenIds = connections.map((c) => c.toThingId);
          const tokenPromises = tokenIds.map((id) => ctx.db.get(id));
          const tokenResults = await Promise.all(tokenPromises);

          // Filter for token entities only
          return tokenResults.filter(
            (t) => t !== null && t.type === "token"
          ) as TokenEntity[];
        },
        catch: (error) =>
          new ServiceError({
            operation: "getTokensByCreator",
            message: "Failed to fetch tokens by creator",
            cause: error,
          }),
      });

      return tokens;
    });
  }
}
