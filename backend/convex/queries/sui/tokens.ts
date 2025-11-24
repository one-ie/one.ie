/**
 * Token Queries - Sui Token Data Retrieval
 *
 * Read-only operations for token data.
 * Implements the 6-dimension ontology pattern:
 * - GROUPS: Multi-tenant groupId filtering
 * - PEOPLE: Actor-based data access
 * - THINGS: Token entities (type: "token")
 * - CONNECTIONS: Enrich with holdings and ownership
 * - EVENTS: Query event history
 * - KNOWLEDGE: Search token metadata
 *
 * @module queries/sui/tokens
 * @version 1.0.0
 */

import { query } from "../../_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "../../_generated/dataModel";

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Token entity with enriched data
 */
export interface TokenWithConnections extends Doc<"things"> {
  owners?: Array<{
    actorId: Id<"things">;
    permissions: string[];
    role: string;
  }>;
  holders?: Array<{
    holderId: Id<"things">;
    balance: string;
    address?: string;
  }>;
  eventCount?: number;
}

// ============================================================================
// QUERY 1: GET TOKEN BY ID
// ============================================================================

/**
 * Get token details by ID
 *
 * Returns complete token data with ownership and holding connections.
 *
 * @example
 * const token = await ctx.runQuery(api.queries.sui.tokens.get, {
 *   tokenId: "j789..."
 * });
 */
export const get = query({
  args: {
    tokenId: v.id("things"),
  },
  handler: async (ctx, args): Promise<TokenWithConnections | null> => {
    // 1. FETCH TOKEN
    const token = await ctx.db.get(args.tokenId);

    if (!token || token.type !== "token") {
      return null;
    }

    // 2. ENRICH WITH OWNERSHIP
    const ownershipConnections = await ctx.db
      .query("connections")
      .withIndex("to_type", (q) =>
        q.eq("toThingId", args.tokenId).eq("relationshipType", "owns")
      )
      .filter((q) => q.eq(q.field("validTo"), undefined))
      .collect();

    const owners = ownershipConnections.map((conn) => ({
      actorId: conn.fromThingId,
      permissions: conn.metadata?.permissions || [],
      role: conn.metadata?.role || "owner",
    }));

    // 3. ENRICH WITH HOLDERS
    const holdingConnections = await ctx.db
      .query("connections")
      .withIndex("to_type", (q) =>
        q.eq("toThingId", args.tokenId).eq("relationshipType", "holds_tokens")
      )
      .collect();

    const holders = holdingConnections.map((conn) => ({
      holderId: conn.fromThingId,
      balance: conn.metadata?.balance || "0",
      address: conn.metadata?.address,
    }));

    // 4. COUNT EVENTS
    const eventCount = await ctx.db
      .query("events")
      .withIndex("by_target", (q) => q.eq("targetId", args.tokenId))
      .collect()
      .then((events) => events.length);

    // 5. RETURN ENRICHED TOKEN
    return {
      ...token,
      owners,
      holders,
      eventCount,
    };
  },
});

// ============================================================================
// QUERY 2: GET TOKENS BY GROUP
// ============================================================================

/**
 * Get all tokens for an organization
 *
 * Multi-tenant scoped: returns only tokens for the specified group.
 *
 * @example
 * const tokens = await ctx.runQuery(api.queries.sui.tokens.getByGroup, {
 *   groupId: "j123...",
 *   status: "active"
 * });
 */
export const getByGroup = query({
  args: {
    groupId: v.id("groups"),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("active"),
        v.literal("published"),
        v.literal("archived"),
        v.literal("deleted")
      )
    ),
  },
  handler: async (ctx, args): Promise<TokenWithConnections[]> => {
    // 1. AUTHENTICATE: Get user identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. VALIDATE GROUP ACCESS: Check user belongs to group
    const actor = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((q) => q.eq(q.field("properties.email"), identity.email))
      .first();

    if (!actor || actor.groupId !== args.groupId) {
      throw new Error("Access denied: user not in group");
    }

    // 3. QUERY TOKENS: Filter by group and type
    let tokensQuery = ctx.db
      .query("things")
      .withIndex("by_group_type", (q) =>
        q.eq("groupId", args.groupId).eq("type", "token")
      );

    // 4. APPLY STATUS FILTER
    if (args.status) {
      tokensQuery = tokensQuery.filter((q) => q.eq(q.field("status"), args.status));
    }

    const tokens = await tokensQuery.collect();

    // 5. ENRICH WITH CONNECTIONS
    const enrichedTokens = await Promise.all(
      tokens.map(async (token) => {
        // Get ownership
        const ownershipConnections = await ctx.db
          .query("connections")
          .withIndex("to_type", (q) =>
            q.eq("toThingId", token._id).eq("relationshipType", "owns")
          )
          .filter((q) => q.eq(q.field("validTo"), undefined))
          .collect();

        const owners = ownershipConnections.map((conn) => ({
          actorId: conn.fromThingId,
          permissions: conn.metadata?.permissions || [],
          role: conn.metadata?.role || "owner",
        }));

        // Get holder count (not full list for performance)
        const holderCount = await ctx.db
          .query("connections")
          .withIndex("to_type", (q) =>
            q.eq("toThingId", token._id).eq("relationshipType", "holds_tokens")
          )
          .collect()
          .then((conns) => conns.length);

        return {
          ...token,
          owners,
          holders: [], // Don't return full holder list in group query
          holderCount,
        };
      })
    );

    return enrichedTokens;
  },
});

// ============================================================================
// QUERY 3: GET TOKENS BY CREATOR
// ============================================================================

/**
 * Get all tokens created by a specific person
 *
 * Returns tokens where the person has an "owns" connection with creator role.
 *
 * @example
 * const tokens = await ctx.runQuery(api.queries.sui.tokens.getByCreator, {
 *   creatorId: "j456..."
 * });
 */
export const getByCreator = query({
  args: {
    creatorId: v.id("things"),
  },
  handler: async (ctx, args): Promise<TokenWithConnections[]> => {
    // 1. AUTHENTICATE
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. FIND OWNED TOKENS
    const ownershipConnections = await ctx.db
      .query("connections")
      .withIndex("from_type", (q) =>
        q.eq("fromThingId", args.creatorId).eq("relationshipType", "owns")
      )
      .filter((q) => q.eq(q.field("validTo"), undefined))
      .collect();

    // 3. FETCH TOKENS
    const tokens = await Promise.all(
      ownershipConnections.map(async (conn) => {
        const token = await ctx.db.get(conn.toThingId);
        if (!token || token.type !== "token") return null;

        // Get holder count
        const holderCount = await ctx.db
          .query("connections")
          .withIndex("to_type", (q) =>
            q.eq("toThingId", token._id).eq("relationshipType", "holds_tokens")
          )
          .collect()
          .then((conns) => conns.length);

        return {
          ...token,
          owners: [
            {
              actorId: args.creatorId,
              permissions: conn.metadata?.permissions || [],
              role: conn.metadata?.role || "creator",
            },
          ],
          holders: [],
          holderCount,
        };
      })
    );

    // 4. FILTER OUT NULLS
    return tokens.filter((token): token is TokenWithConnections => token !== null);
  },
});

// ============================================================================
// QUERY 4: GET VERIFIED TOKENS
// ============================================================================

/**
 * Get all verified tokens
 *
 * Returns tokens where properties.verified === true.
 * Used for displaying trusted tokens in marketplace.
 *
 * @example
 * const verifiedTokens = await ctx.runQuery(api.queries.sui.tokens.getVerified, {
 *   network: "mainnet"
 * });
 */
export const getVerified = query({
  args: {
    network: v.optional(
      v.union(
        v.literal("mainnet"),
        v.literal("testnet"),
        v.literal("devnet")
      )
    ),
  },
  handler: async (ctx, args): Promise<TokenWithConnections[]> => {
    // 1. QUERY ALL ACTIVE TOKENS
    const allTokens = await ctx.db
      .query("things")
      .withIndex("by_type_status", (q) =>
        q.eq("type", "token").eq("status", "active")
      )
      .collect();

    // 2. FILTER BY VERIFIED AND NETWORK
    const verifiedTokens = allTokens.filter((token) => {
      const isVerified = token.properties?.verified === true;
      const networkMatches = args.network
        ? token.properties?.network === args.network
        : true;
      return isVerified && networkMatches;
    });

    // 3. ENRICH WITH BASIC DATA
    const enrichedTokens = await Promise.all(
      verifiedTokens.map(async (token) => {
        // Get holder count
        const holderCount = await ctx.db
          .query("connections")
          .withIndex("to_type", (q) =>
            q.eq("toThingId", token._id).eq("relationshipType", "holds_tokens")
          )
          .collect()
          .then((conns) => conns.length);

        return {
          ...token,
          holders: [],
          holderCount,
        };
      })
    );

    return enrichedTokens;
  },
});

// ============================================================================
// QUERY 5: SEARCH TOKENS
// ============================================================================

/**
 * Search tokens by name or symbol
 *
 * Uses Convex search index for fast text search.
 *
 * @example
 * const results = await ctx.runQuery(api.queries.sui.tokens.search, {
 *   query: "agent",
 *   groupId: "j123..."
 * });
 */
export const search = query({
  args: {
    query: v.string(),
    groupId: v.optional(v.id("groups")),
    network: v.optional(
      v.union(
        v.literal("mainnet"),
        v.literal("testnet"),
        v.literal("devnet")
      )
    ),
  },
  handler: async (ctx, args): Promise<TokenWithConnections[]> => {
    // 1. AUTHENTICATE
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. SEARCH BY NAME
    const searchResults = await ctx.db
      .query("things")
      .withSearchIndex("search_things", (q) =>
        q.search("name", args.query).eq("type", "token")
      )
      .collect();

    // 3. FILTER BY GROUP (if provided)
    let filteredResults = searchResults;
    if (args.groupId) {
      filteredResults = searchResults.filter(
        (token) => token.groupId === args.groupId
      );
    }

    // 4. FILTER BY NETWORK (if provided)
    if (args.network) {
      filteredResults = filteredResults.filter(
        (token) => token.properties?.network === args.network
      );
    }

    // 5. ALSO SEARCH BY SYMBOL (manual filter)
    const symbolMatches = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "token"))
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "active"),
          args.groupId ? q.eq(q.field("groupId"), args.groupId) : true
        )
      )
      .collect()
      .then((tokens) =>
        tokens.filter((token) => {
          const symbol = token.properties?.symbol?.toLowerCase() || "";
          const queryLower = args.query.toLowerCase();
          return symbol.includes(queryLower);
        })
      );

    // 6. COMBINE RESULTS (deduplicate by ID)
    const allResults = [...filteredResults, ...symbolMatches];
    const uniqueResults = Array.from(
      new Map(allResults.map((token) => [token._id, token])).values()
    );

    // 7. ENRICH WITH BASIC DATA
    const enrichedResults = await Promise.all(
      uniqueResults.map(async (token) => {
        // Get holder count
        const holderCount = await ctx.db
          .query("connections")
          .withIndex("to_type", (q) =>
            q.eq("toThingId", token._id).eq("relationshipType", "holds_tokens")
          )
          .collect()
          .then((conns) => conns.length);

        return {
          ...token,
          holders: [],
          holderCount,
        };
      })
    );

    return enrichedResults;
  },
});

// ============================================================================
// QUERY 6: GET TOKEN EVENTS
// ============================================================================

/**
 * Get event history for a token
 *
 * Returns all events where targetId = tokenId, ordered by timestamp.
 *
 * @example
 * const events = await ctx.runQuery(api.queries.sui.tokens.getEvents, {
 *   tokenId: "j789...",
 *   limit: 50
 * });
 */
export const getEvents = query({
  args: {
    tokenId: v.id("things"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. QUERY EVENTS
    let eventsQuery = ctx.db
      .query("events")
      .withIndex("by_target", (q) => q.eq("targetId", args.tokenId))
      .order("desc"); // Most recent first

    // 3. APPLY LIMIT
    const events = await eventsQuery.collect();
    const limitedEvents = args.limit ? events.slice(0, args.limit) : events;

    // 4. ENRICH WITH ACTOR NAMES
    const enrichedEvents = await Promise.all(
      limitedEvents.map(async (event) => {
        const actor = await ctx.db.get(event.actorId);
        return {
          ...event,
          actorName: actor?.name || "Unknown",
        };
      })
    );

    return enrichedEvents;
  },
});

// ============================================================================
// QUERY 7: GET TOKEN HOLDERS
// ============================================================================

/**
 * Get all holders of a token (with pagination)
 *
 * Returns people/wallets that hold the token with their balances.
 *
 * @example
 * const holders = await ctx.runQuery(api.queries.sui.tokens.getHolders, {
 *   tokenId: "j789...",
 *   limit: 100
 * });
 */
export const getHolders = query({
  args: {
    tokenId: v.id("things"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. QUERY HOLDINGS
    const holdings = await ctx.db
      .query("connections")
      .withIndex("to_type", (q) =>
        q.eq("toThingId", args.tokenId).eq("relationshipType", "holds_tokens")
      )
      .collect();

    // 3. APPLY LIMIT
    const limitedHoldings = args.limit ? holdings.slice(0, args.limit) : holdings;

    // 4. ENRICH WITH HOLDER DATA
    const enrichedHolders = await Promise.all(
      limitedHoldings.map(async (holding) => {
        const holder = await ctx.db.get(holding.fromThingId);
        return {
          holderId: holding.fromThingId,
          holderName: holder?.name || "Unknown",
          holderType: holder?.type || "unknown",
          balance: holding.metadata?.balance || "0",
          address: holding.metadata?.address,
          network: holding.metadata?.network,
          validFrom: holding.validFrom,
        };
      })
    );

    // 5. SORT BY BALANCE (descending)
    enrichedHolders.sort((a, b) => {
      const balanceA = BigInt(a.balance || "0");
      const balanceB = BigInt(b.balance || "0");
      return balanceB > balanceA ? 1 : balanceB < balanceA ? -1 : 0;
    });

    return enrichedHolders;
  },
});
