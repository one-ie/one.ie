/**
 * Token Mutations - Sui Token Creation & Management
 *
 * Thin wrappers around TokenLaunchService (Effect.ts business logic).
 * Implements the 6-dimension ontology pattern:
 * - GROUPS: Multi-tenant groupId scoping
 * - PEOPLE: Actor-based authorization (actorId)
 * - THINGS: Token entities (type: "token")
 * - CONNECTIONS: Token holdings (holds_tokens), ownership (owns)
 * - EVENTS: Complete audit trail (token_created, tokens_minted, etc.)
 * - KNOWLEDGE: Token metadata
 *
 * @module mutations/sui/tokens
 * @version 1.0.0
 */

import { Effect } from "effect";
import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import {
  createTokenLaunchService,
  type CreateTokenInput,
  type UpdateMetadataInput,
  type DatabaseContext,
  type SuiProvider,
  type TokenServiceError,
} from "../../services/sui/TokenLaunchService";
import type { Id } from "../../_generated/dataModel";
import type { SuiNetwork } from "../../types/sui";

// ============================================================================
// Database Context Adapter (Convex → Service)
// ============================================================================

/**
 * Adapt Convex database operations to service interface
 */
function createDatabaseContext(ctx: any): DatabaseContext {
  return {
    get: async <T>(id: Id<any>): Promise<T | null> => {
      return ctx.db.get(id) as Promise<T | null>;
    },
    insert: async <T>(table: string, document: any): Promise<Id<any>> => {
      return ctx.db.insert(table, document);
    },
    patch: async (id: Id<any>, updates: any): Promise<void> => {
      return ctx.db.patch(id, updates);
    },
    query: (table: string) => {
      return ctx.db.query(table);
    },
  };
}

// ============================================================================
// Sui Provider (Mock for now, will be replaced with real implementation)
// ============================================================================

/**
 * Mock Sui provider for development
 * TODO: Replace with real Sui SDK integration
 */
function createMockSuiProvider(): SuiProvider {
  return {
    createToken: (params: CreateTokenInput) => {
      // Mock deployment - returns fake package ID and coin type
      return Effect.succeed({
        packageId: `0x${Math.random().toString(16).slice(2, 42).padEnd(40, "0")}`,
        coinType: `0x${Math.random().toString(16).slice(2, 42).padEnd(40, "0")}::${params.symbol.toLowerCase()}::${params.symbol.toUpperCase()}`,
      });
    },
    mintTokens: (tokenId: string, amount: string, recipient: string) => {
      // Mock mint - returns fake transaction digest
      return Effect.succeed({
        txDigest: `0x${Math.random().toString(16).slice(2, 66).padEnd(64, "0")}`,
      });
    },
    burnTokens: (tokenId: string, amount: string) => {
      // Mock burn - returns fake transaction digest
      return Effect.succeed({
        txDigest: `0x${Math.random().toString(16).slice(2, 66).padEnd(64, "0")}`,
      });
    },
  };
}

// ============================================================================
// Error Conversion (Effect.ts → Convex)
// ============================================================================

/**
 * Convert Effect.ts service errors to Convex error messages
 */
function convertServiceError(error: TokenServiceError): string {
  switch (error._tag) {
    case "TokenCreationError":
      return `Token creation failed: ${error.reason}`;
    case "TokenNotFoundError":
      return `Token not found: ${error.tokenId}`;
    case "InsufficientPermissionsError":
      return `Insufficient permissions: ${error.action} requires ${error.requiredRole}`;
    case "InvalidMetadataError":
      return `Invalid metadata: ${error.field} - ${error.reason}`;
    case "GroupLimitExceededError":
      return `Group limit exceeded: ${error.limitType} (${error.current}/${error.limit})`;
    case "SuiNetworkError":
      return `Sui network error: ${error.operation} on ${error.network} - ${error.message}`;
    default:
      return "Unknown error occurred";
  }
}

// ============================================================================
// MUTATION 1: CREATE TOKEN
// ============================================================================

/**
 * Create a new token on Sui blockchain
 *
 * Steps:
 * 1. Authenticate user (ctx.auth)
 * 2. Get actorId from email
 * 3. Call TokenLaunchService.createToken()
 * 4. Return tokenId
 *
 * @example
 * await ctx.runMutation(api.mutations.sui.tokens.create, {
 *   groupId: "j123...",
 *   name: "Agent Token",
 *   symbol: "AGT",
 *   decimals: 9,
 *   totalSupply: "1000000000000000000",
 *   network: "mainnet",
 *   description: "Token for AI agents",
 *   logoUrl: "https://...",
 *   website: "https://..."
 * });
 */
export const create = mutation({
  args: {
    groupId: v.id("groups"),
    name: v.string(),
    symbol: v.string(),
    decimals: v.number(),
    totalSupply: v.string(),
    network: v.union(
      v.literal("mainnet"),
      v.literal("testnet"),
      v.literal("devnet")
    ),
    description: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    website: v.optional(v.string()),
    twitter: v.optional(v.string()),
    telegram: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE: Get user identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. GET ACTOR: Find person thing by email
    const actor = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((q) => q.eq(q.field("properties.email"), identity.email))
      .first();

    if (!actor) {
      throw new Error("User not found");
    }

    // 3. CREATE SERVICE: Initialize TokenLaunchService
    const db = createDatabaseContext(ctx);
    const suiProvider = createMockSuiProvider();
    const service = createTokenLaunchService(db, suiProvider);

    // 4. PREPARE INPUT: Map Convex args to service input
    const input: CreateTokenInput = {
      groupId: args.groupId,
      actorId: actor._id,
      name: args.name,
      symbol: args.symbol,
      decimals: args.decimals,
      totalSupply: args.totalSupply,
      network: args.network as SuiNetwork,
      description: args.description,
      logoUrl: args.logoUrl,
      website: args.website,
      twitter: args.twitter,
      telegram: args.telegram,
    };

    // 5. CALL SERVICE: Execute token creation
    const result = await Effect.runPromise(
      service.createToken(input).pipe(
        Effect.mapError((error) => {
          throw new Error(convertServiceError(error));
        })
      )
    );

    // 6. RETURN: Token ID
    return result._id;
  },
});

// ============================================================================
// MUTATION 2: MINT TOKENS
// ============================================================================

/**
 * Mint additional tokens to a recipient
 *
 * Steps:
 * 1. Authenticate user
 * 2. Get actorId
 * 3. Call TokenLaunchService.mintTokens()
 *
 * @example
 * await ctx.runMutation(api.mutations.sui.tokens.mint, {
 *   tokenId: "j789...",
 *   amount: "1000000",
 *   recipientId: "j012..."
 * });
 */
export const mint = mutation({
  args: {
    tokenId: v.id("things"),
    amount: v.string(),
    recipientId: v.id("things"),
  },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. GET ACTOR
    const actor = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((q) => q.eq(q.field("properties.email"), identity.email))
      .first();

    if (!actor) {
      throw new Error("User not found");
    }

    // 3. CREATE SERVICE
    const db = createDatabaseContext(ctx);
    const suiProvider = createMockSuiProvider();
    const service = createTokenLaunchService(db, suiProvider);

    // 4. CALL SERVICE
    await Effect.runPromise(
      service.mintTokens(args.tokenId, args.amount, args.recipientId, actor._id).pipe(
        Effect.mapError((error) => {
          throw new Error(convertServiceError(error));
        })
      )
    );

    return { success: true };
  },
});

// ============================================================================
// MUTATION 3: BURN TOKENS
// ============================================================================

/**
 * Burn tokens from supply
 *
 * Steps:
 * 1. Authenticate user
 * 2. Get actorId
 * 3. Call TokenLaunchService.burnTokens()
 *
 * @example
 * await ctx.runMutation(api.mutations.sui.tokens.burn, {
 *   tokenId: "j789...",
 *   amount: "1000000"
 * });
 */
export const burn = mutation({
  args: {
    tokenId: v.id("things"),
    amount: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. GET ACTOR
    const actor = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((q) => q.eq(q.field("properties.email"), identity.email))
      .first();

    if (!actor) {
      throw new Error("User not found");
    }

    // 3. CREATE SERVICE
    const db = createDatabaseContext(ctx);
    const suiProvider = createMockSuiProvider();
    const service = createTokenLaunchService(db, suiProvider);

    // 4. CALL SERVICE
    await Effect.runPromise(
      service.burnTokens(args.tokenId, args.amount, actor._id).pipe(
        Effect.mapError((error) => {
          throw new Error(convertServiceError(error));
        })
      )
    );

    return { success: true };
  },
});

// ============================================================================
// MUTATION 4: UPDATE METADATA
// ============================================================================

/**
 * Update token metadata (description, logo, links)
 *
 * Steps:
 * 1. Authenticate user
 * 2. Get actorId
 * 3. Call TokenLaunchService.updateMetadata()
 *
 * @example
 * await ctx.runMutation(api.mutations.sui.tokens.updateMetadata, {
 *   tokenId: "j789...",
 *   description: "Updated description",
 *   website: "https://example.com"
 * });
 */
export const updateMetadata = mutation({
  args: {
    tokenId: v.id("things"),
    description: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    website: v.optional(v.string()),
    twitter: v.optional(v.string()),
    telegram: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. GET ACTOR
    const actor = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((q) => q.eq(q.field("properties.email"), identity.email))
      .first();

    if (!actor) {
      throw new Error("User not found");
    }

    // 3. CREATE SERVICE
    const db = createDatabaseContext(ctx);
    const suiProvider = createMockSuiProvider();
    const service = createTokenLaunchService(db, suiProvider);

    // 4. PREPARE METADATA
    const metadata: UpdateMetadataInput = {};
    if (args.description !== undefined) metadata.description = args.description;
    if (args.logoUrl !== undefined) metadata.logoUrl = args.logoUrl;
    if (args.website !== undefined) metadata.website = args.website;
    if (args.twitter !== undefined) metadata.twitter = args.twitter;
    if (args.telegram !== undefined) metadata.telegram = args.telegram;

    // 5. CALL SERVICE
    await Effect.runPromise(
      service.updateMetadata(args.tokenId, metadata, actor._id).pipe(
        Effect.mapError((error) => {
          throw new Error(convertServiceError(error));
        })
      )
    );

    return { success: true };
  },
});

// ============================================================================
// MUTATION 5: TRANSFER OWNERSHIP
// ============================================================================

/**
 * Transfer token ownership to new owner
 *
 * Steps:
 * 1. Authenticate user
 * 2. Get actorId
 * 3. Call TokenLaunchService.transferOwnership()
 *
 * @example
 * await ctx.runMutation(api.mutations.sui.tokens.transferOwnership, {
 *   tokenId: "j789...",
 *   newOwnerId: "j345..."
 * });
 */
export const transferOwnership = mutation({
  args: {
    tokenId: v.id("things"),
    newOwnerId: v.id("things"),
  },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. GET ACTOR
    const actor = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((q) => q.eq(q.field("properties.email"), identity.email))
      .first();

    if (!actor) {
      throw new Error("User not found");
    }

    // 3. CREATE SERVICE
    const db = createDatabaseContext(ctx);
    const suiProvider = createMockSuiProvider();
    const service = createTokenLaunchService(db, suiProvider);

    // 4. CALL SERVICE
    await Effect.runPromise(
      service.transferOwnership(args.tokenId, args.newOwnerId, actor._id).pipe(
        Effect.mapError((error) => {
          throw new Error(convertServiceError(error));
        })
      )
    );

    return { success: true };
  },
});
