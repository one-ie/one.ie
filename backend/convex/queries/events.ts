import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * DIMENSION 5: EVENTS - Query Layer
 *
 * All read operations for audit trail and action history
 * Every query scoped by groupId for multi-tenant isolation
 *
 * Events record:
 * - WHAT: Event type (thing_created, thing_updated, thing_deleted, etc.)
 * - WHO: Actor (person entity who performed the action)
 * - WHEN: Timestamp (precise moment the event occurred)
 * - WHAT_HAPPENED_TO: Target entity (optional, what was affected)
 * - EXTRA_INFO: Metadata (rich context about the change)
 *
 * Supports:
 * - Timeline view (all events ordered by timestamp, most recent first)
 * - Activity feed (all events by a specific actor/person)
 * - Audit trail (all events affecting a specific entity)
 * - Time range queries (daily summary, weekly reports, trending)
 * - Statistics (count by type, top actors, top entities affected)
 *
 * Use Cases:
 * - User activity streams
 * - Admin audit logs
 * - Notification feeds (what changed in groups I care about)
 * - Analytics (popular entities, active users, growth)
 * - Compliance (record of all actions in system)
 * - Debugging (understand what happened when and why)
 *
 * Performance:
 * - CRITICAL: Use group_timestamp index for timeline queries (most common)
 * - Use by_actor for activity feeds
 * - Use by_target for entity audit trails
 * - Use by_type for event analytics
 *
 * Query Pattern: Start with group ID, optionally filter by actor/target/type, order by timestamp
 */

/**
 * List events in a group (timeline view)
 *
 * Returns events ordered by timestamp descending (most recent first)
 * CRITICAL: Always filtered by groupId for multi-tenant isolation
 */
export const list = query({
  args: {
    groupId: v.id("groups"),
    eventType: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("events")
      .withIndex("group_timestamp", (q) => q.eq("groupId", args.groupId))
      .order("desc"); // Most recent first

    const events = await query.collect();

    // Filter by event type if provided
    let filtered = events;
    if (args.eventType) {
      filtered = events.filter(e => e.type === args.eventType);
    }

    // Apply pagination
    const offset = args.offset || 0;
    const limit = args.limit || 100;

    return filtered.slice(offset, offset + limit);
  }
});

/**
 * Get events by actor (person who performed the action)
 *
 * Returns all events where actorId matches
 * Useful for "activity feed" or "user history"
 */
export const byActor = query({
  args: {
    groupId: v.id("groups"),
    actorId: v.id("entities"),
    eventType: v.optional(v.string()),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("events")
      .withIndex("by_actor", (q) => q.eq("actorId", args.actorId))
      .filter((q) => q.eq(q.field("groupId"), args.groupId))
      .order("desc")
      .collect();

    // Filter by event type if provided
    let filtered = events;
    if (args.eventType) {
      filtered = events.filter(e => e.type === args.eventType);
    }

    // Apply limit
    const limit = args.limit || 100;
    return filtered.slice(0, limit);
  }
});

/**
 * Get events by target (thing that was affected)
 *
 * Returns all events where targetId matches
 * Useful for "entity history" or "audit trail"
 */
export const byTarget = query({
  args: {
    groupId: v.id("groups"),
    targetId: v.id("entities"),
    eventType: v.optional(v.string()),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("events")
      .withIndex("by_target", (q) => q.eq("targetId", args.targetId))
      .filter((q) => q.eq(q.field("groupId"), args.groupId))
      .order("desc")
      .collect();

    // Filter by event type if provided
    let filtered = events;
    if (args.eventType) {
      filtered = events.filter(e => e.type === args.eventType);
    }

    // Apply limit
    const limit = args.limit || 100;
    return filtered.slice(0, limit);
  }
});

/**
 * Get events by time range
 *
 * Returns events between startTime and endTime
 * Useful for "daily summary" or "weekly report"
 */
export const byTimeRange = query({
  args: {
    groupId: v.id("groups"),
    startTime: v.number(),
    endTime: v.number(),
    eventType: v.optional(v.string()),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("events")
      .withIndex("by_timestamp", (q) =>
        q.gte("timestamp", args.startTime).lte("timestamp", args.endTime)
      )
      .filter((q) => q.eq(q.field("groupId"), args.groupId))
      .order("desc")
      .collect();

    // Filter by event type if provided
    let filtered = events;
    if (args.eventType) {
      filtered = events.filter(e => e.type === args.eventType);
    }

    // Apply limit
    const limit = args.limit || 1000;
    return filtered.slice(0, limit);
  }
});

/**
 * Get event statistics for a group
 *
 * Returns counts by event type for the specified time range
 * Useful for analytics dashboards
 */
export const stats = query({
  args: {
    groupId: v.id("groups"),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("events")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    // Filter by time range if provided
    let filtered = events;
    if (args.startTime) {
      filtered = filtered.filter(e => e.timestamp >= args.startTime!);
    }
    if (args.endTime) {
      filtered = filtered.filter(e => e.timestamp <= args.endTime!);
    }

    // Count by event type
    const byType: Record<string, number> = {};
    for (const event of filtered) {
      byType[event.type] = (byType[event.type] || 0) + 1;
    }

    // Count by actor
    const byActor: Record<string, number> = {};
    for (const event of filtered) {
      if (event.actorId) {
        byActor[event.actorId] = (byActor[event.actorId] || 0) + 1;
      }
    }

    // Top event types
    const topTypes = Object.entries(byType)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([type, count]) => ({ type, count }));

    // Top actors
    const topActors = Object.entries(byActor)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([actorId, count]) => ({ actorId, count }));

    return {
      total: filtered.length,
      byType,
      byActor,
      topTypes,
      topActors,
      timeRange: {
        start: args.startTime,
        end: args.endTime
      }
    };
  }
});

/**
 * Get recent events (last N events)
 *
 * Simple helper for showing "recent activity"
 */
export const recent = query({
  args: {
    groupId: v.id("groups"),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;

    const events = await ctx.db
      .query("events")
      .withIndex("group_timestamp", (q) => q.eq("groupId", args.groupId))
      .order("desc")
      .take(limit);

    return events;
  }
});

/**
 * Get a single event by ID
 */
export const getById = query({
  args: {
    eventId: v.id("events"),
    groupId: v.optional(v.id("groups")) // For security validation
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);

    // Optional: Validate event belongs to expected group
    if (args.groupId && event?.groupId !== args.groupId) {
      throw new Error("Event not found in specified group");
    }

    return event;
  }
});
