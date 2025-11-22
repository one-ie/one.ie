/**
 * Funnel Queries - Read operations with multi-tenant scoping
 *
 * All queries MUST filter by groupId to enforce multi-tenant isolation.
 * Every query validates user access before returning data.
 *
 * @see /backend/CLAUDE.md - Query patterns
 * @see /one/knowledge/ontology.md - 6-dimension ontology
 */

import { query } from "../_generated/server";
import { v } from "convex/values";
import { RateLimiterService } from "../services/funnel/rate-limiter";

// ============================================================================
// List Funnels
// ============================================================================

/**
 * List all funnels for the current user's organization
 *
 * CRITICAL: Always filters by groupId for multi-tenant isolation
 */
export const list = query({
  args: {
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // 2. Get user's group
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person?.groupId) {
      return [];
    }

    // 3. Query with groupId scope (CRITICAL for multi-tenant)
    let q = ctx.db
      .query("things")
      .withIndex("by_group_type", (q) =>
        q.eq("groupId", person.groupId).eq("type", "funnel")
      );

    // 4. Apply filters
    const funnels = await q.collect();

    // Filter by status if provided
    const filtered = args.status
      ? funnels.filter((f) => f.status === args.status)
      : funnels;

    // 5. Limit results
    const limit = args.limit || 100;
    return filtered.slice(0, limit);
  },
});

// ============================================================================
// Get Funnel by ID
// ============================================================================

/**
 * Get a single funnel by ID
 *
 * CRITICAL: Validates user has access to the funnel's group
 */
export const get = query({
  args: { id: v.id("things") },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // 2. Get user's group
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person?.groupId) {
      return null;
    }

    // 3. Get funnel and verify group ownership
    const funnel = await ctx.db.get(args.id);
    if (!funnel || funnel.type !== "funnel") {
      return null;
    }

    // 4. Check access (platform_owner can access all, others only their group)
    const role = person.properties?.role;
    const isAuthorized =
      role === "platform_owner" || funnel.groupId === person.groupId;

    if (!isAuthorized) {
      return null; // Not found or unauthorized (don't leak existence)
    }

    return funnel;
  },
});

// ============================================================================
// Get Funnel by Slug
// ============================================================================

/**
 * Get a funnel by its slug within the user's organization
 *
 * CRITICAL: Scoped to user's groupId
 */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // 2. Get user's group
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person?.groupId) {
      return null;
    }

    // 3. Query with groupId scope
    const funnel = await ctx.db
      .query("things")
      .withIndex("by_group_type", (q) =>
        q.eq("groupId", person.groupId).eq("type", "funnel")
      )
      .filter((f) => f.properties?.slug === args.slug)
      .first();

    return funnel;
  },
});

// ============================================================================
// Get Published Funnels
// ============================================================================

/**
 * List all published funnels for the current user's organization
 *
 * CRITICAL: Always filters by groupId and status="published"
 */
export const getPublished = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // 2. Get user's group
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person?.groupId) {
      return [];
    }

    // 3. Query with groupId scope and published status
    const funnels = await ctx.db
      .query("things")
      .withIndex("by_group_type", (q) =>
        q.eq("groupId", person.groupId).eq("type", "funnel")
      )
      .filter((f) => f.status === "published")
      .collect();

    // 4. Limit results
    const limit = args.limit || 100;
    return funnels.slice(0, limit);
  },
});

// ============================================================================
// Count Funnels
// ============================================================================

/**
 * Count total funnels for the current user's organization
 *
 * CRITICAL: Always scoped to user's groupId
 */
export const count = query({
  args: {},
  handler: async (ctx) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return 0;
    }

    // 2. Get user's group
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person?.groupId) {
      return 0;
    }

    // 3. Count funnels with groupId scope
    const funnels = await ctx.db
      .query("things")
      .withIndex("by_group_type", (q) =>
        q.eq("groupId", person.groupId).eq("type", "funnel")
      )
      .collect();

    return funnels.length;
  },
});

// ============================================================================
// Get Funnel with Steps
// ============================================================================

/**
 * Get a funnel with all its steps (enriched query)
 *
 * CRITICAL: Validates access and enriches with connections
 */
export const getWithSteps = query({
  args: { id: v.id("things") },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // 2. Get user's group
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person?.groupId) {
      return null;
    }

    // 3. Get funnel and verify access
    const funnel = await ctx.db.get(args.id);
    if (!funnel || funnel.type !== "funnel") {
      return null;
    }

    const role = person.properties?.role;
    const isAuthorized =
      role === "platform_owner" || funnel.groupId === person.groupId;

    if (!isAuthorized) {
      return null;
    }

    // 4. Get funnel steps via connections
    const stepConnections = await ctx.db
      .query("connections")
      .withIndex("from_type", (q) =>
        q.eq("fromThingId", funnel._id).eq("relationshipType", "funnel_contains_step")
      )
      .collect();

    // 5. Fetch step details
    const steps = await Promise.all(
      stepConnections.map(async (conn) => {
        const step = await ctx.db.get(conn.toThingId);
        return {
          ...step,
          sequence: conn.metadata?.sequence || 0,
        };
      })
    );

    // Sort steps by sequence
    steps.sort((a, b) => (a.sequence || 0) - (b.sequence || 0));

    return {
      ...funnel,
      steps,
    };
  },
});

// ============================================================================
// Get Rate Limit Status (CYCLE 19)
// ============================================================================

/**
 * Get rate limit status for the current user's organization
 *
 * Returns:
 * - Current funnel count
 * - Funnel limit (100)
 * - Remaining funnels available
 *
 * Part of Cycle 19: Add Rate Limiting
 * @see /one/things/plans/clickfunnels-builder-100-cycles.md
 */
export const getRateLimitStatus = query({
  args: {},
  handler: async (ctx) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // 2. Get user's group
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person?.groupId) {
      return null;
    }

    // 3. Count funnels (excluding archived)
    const funnels = await ctx.db
      .query("things")
      .withIndex("by_group_type", (q) =>
        q.eq("groupId", person.groupId).eq("type", "funnel")
      )
      .filter((f) => f.status !== "archived")
      .collect();

    const funnelCount = funnels.length;

    // 4. Get rate limit status using service
    const funnelLimitStatus = RateLimiterService.getFunnelLimitStatus(funnelCount);

    return {
      groupId: person.groupId,
      funnelLimitStatus,
    };
  },
});
