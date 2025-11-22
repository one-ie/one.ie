/**
 * Event Queries - Read operations for audit trail
 *
 * All queries MUST filter by groupId to enforce multi-tenant isolation.
 * Every query validates user access before returning data.
 *
 * @see /backend/CLAUDE.md - Query patterns
 * @see /one/knowledge/ontology.md - 6-dimension ontology (Dimension 5: Events)
 */

import { query } from "../_generated/server";
import { v } from "convex/values";

// ============================================================================
// Get Events by Target (for version history)
// ============================================================================

/**
 * Get all events for a specific target (e.g., funnel, step, element)
 *
 * CRITICAL: Validates user has access to the target's group
 *
 * Use case: Version history, audit trail, change tracking
 * Example: Show all changes to a funnel over time
 */
export const byTarget = query({
  args: {
    targetId: v.id("things"),
    types: v.optional(v.array(v.string())), // Filter to specific event types
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

    // 3. Get target thing and verify access
    const target = await ctx.db.get(args.targetId);
    if (!target) {
      return [];
    }

    // 4. Check access (platform_owner can access all, others only their group)
    const role = person.properties?.role;
    const isAuthorized =
      role === "platform_owner" || target.groupId === person.groupId;

    if (!isAuthorized) {
      return []; // Not authorized (don't leak existence)
    }

    // 5. Query events by target
    const events = await ctx.db
      .query("events")
      .withIndex("by_target", (q) => q.eq("targetId", args.targetId))
      .collect();

    // 6. Filter by event types if provided
    const filtered = args.types
      ? events.filter((e) => args.types?.includes(e.type))
      : events;

    // 7. Sort by timestamp (newest first)
    const sorted = filtered.sort((a, b) => b.timestamp - a.timestamp);

    // 8. Limit results
    const limit = args.limit || 100;
    return sorted.slice(0, limit);
  },
});

// ============================================================================
// Get Events by Actor
// ============================================================================

/**
 * Get all events performed by a specific actor (user)
 *
 * CRITICAL: Only returns events within user's group scope
 *
 * Use case: User activity feed, "what did I do recently"
 */
export const byActor = query({
  args: {
    actorId: v.id("things"),
    types: v.optional(v.array(v.string())),
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

    // 3. Get actor and verify access
    const actor = await ctx.db.get(args.actorId);
    if (!actor) {
      return [];
    }

    // 4. Check access
    const role = person.properties?.role;
    const isAuthorized =
      role === "platform_owner" || actor.groupId === person.groupId;

    if (!isAuthorized) {
      return [];
    }

    // 5. Query events by actor
    const events = await ctx.db
      .query("events")
      .withIndex("by_actor", (q) => q.eq("actorId", args.actorId))
      .collect();

    // 6. Filter by event types if provided
    const filtered = args.types
      ? events.filter((e) => args.types?.includes(e.type))
      : events;

    // 7. Sort by timestamp (newest first)
    const sorted = filtered.sort((a, b) => b.timestamp - a.timestamp);

    // 8. Limit results
    const limit = args.limit || 100;
    return sorted.slice(0, limit);
  },
});

// ============================================================================
// Get Recent Events (Activity Feed)
// ============================================================================

/**
 * Get recent events for the current user's organization
 *
 * CRITICAL: Always scoped to user's groupId
 *
 * Use case: Organization activity feed, "what's happening"
 */
export const recent = query({
  args: {
    types: v.optional(v.array(v.string())),
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

    // 3. Query all events (we'll filter by group via metadata)
    // Note: This is less efficient than having a groupId field on events
    // Consider adding groupId to events schema for better performance
    const allEvents = await ctx.db
      .query("events")
      .withIndex("by_time")
      .order("desc")
      .take(1000); // Take more to ensure we have enough after filtering

    // 4. Filter to user's group by checking actor/target groupId
    const groupEvents = [];
    for (const event of allEvents) {
      // Check actor's group
      const actor = await ctx.db.get(event.actorId);
      if (actor?.groupId === person.groupId) {
        groupEvents.push(event);
      }

      // Stop if we have enough
      if (groupEvents.length >= (args.limit || 50)) {
        break;
      }
    }

    // 5. Filter by event types if provided
    const filtered = args.types
      ? groupEvents.filter((e) => args.types?.includes(e.type))
      : groupEvents;

    // 6. Limit results
    const limit = args.limit || 50;
    return filtered.slice(0, limit);
  },
});

// ============================================================================
// Get Events by Type
// ============================================================================

/**
 * Get all events of a specific type for the user's organization
 *
 * CRITICAL: Scoped to user's groupId
 *
 * Use case: "Show me all funnel_published events", analytics
 */
export const byType = query({
  args: {
    type: v.string(),
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

    // 3. Query events by type
    const events = await ctx.db
      .query("events")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .collect();

    // 4. Filter to user's group by checking actor groupId
    const groupEvents = [];
    for (const event of events) {
      const actor = await ctx.db.get(event.actorId);
      if (actor?.groupId === person.groupId) {
        groupEvents.push(event);
      }
    }

    // 5. Sort by timestamp (newest first)
    const sorted = groupEvents.sort((a, b) => b.timestamp - a.timestamp);

    // 6. Limit results
    const limit = args.limit || 100;
    return sorted.slice(0, limit);
  },
});

// ============================================================================
// Count Events
// ============================================================================

/**
 * Count total events for the current user's organization
 *
 * CRITICAL: Always scoped to user's groupId
 */
export const count = query({
  args: {
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
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

    // 3. Query events (optionally filtered by type)
    const events = args.type
      ? await ctx.db
          .query("events")
          .withIndex("by_type", (q) => q.eq("type", args.type))
          .collect()
      : await ctx.db.query("events").collect();

    // 4. Filter to user's group
    let count = 0;
    for (const event of events) {
      const actor = await ctx.db.get(event.actorId);
      if (actor?.groupId === person.groupId) {
        count++;
      }
    }

    return count;
  },
});
