/**
 * Integration Queries (Cycle 66)
 *
 * Query integration configurations and logs.
 *
 * Features:
 * - List integrations for a funnel
 * - Get integration details
 * - Get integration event logs
 * - Multi-tenant isolation (groupId)
 */

import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Get all integrations for a funnel
 */
export const getIntegrations = query({
  args: {
    funnelId: v.id("things"),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // 2. Get user's person record
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person?.groupId) return [];

    // 3. Verify funnel access
    const funnel = await ctx.db.get(args.funnelId);
    if (!funnel || funnel.groupId !== person.groupId) {
      return [];
    }

    // 4. Get all integrated connections
    const connections = await ctx.db
      .query("connections")
      .withIndex("from_type", (q) =>
        q.eq("fromThingId", args.funnelId).eq("relationshipType", "integrated")
      )
      .collect();

    const integrationIds = connections.map((c) => c.toThingId);

    // 5. Get integration details
    const integrations = await Promise.all(
      integrationIds.map(async (id) => {
        const integration = await ctx.db.get(id);
        if (!integration || integration.groupId !== person.groupId) {
          return null;
        }

        // Get recent events for this integration
        const recentEvents = await ctx.db
          .query("events")
          .withIndex("by_target", (q) => q.eq("targetId", id))
          .filter((e) => e.type === "integration_event")
          .order("desc")
          .take(5);

        // Calculate success rate
        const successCount = recentEvents.filter(
          (e) =>
            e.metadata?.action === "triggered_succeeded" ||
            e.metadata?.action === "test_succeeded"
        ).length;
        const totalCount = recentEvents.length;
        const successRate = totalCount > 0 ? successCount / totalCount : 0;

        return {
          ...integration,
          recentEvents,
          successRate,
          totalEvents: totalCount,
        };
      })
    );

    return integrations.filter((i) => i !== null);
  },
});

/**
 * Get a single integration by ID
 */
export const getIntegration = query({
  args: {
    id: v.id("things"),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    // 2. Get user's person record
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person?.groupId) return null;

    // 3. Get integration and verify access
    const integration = await ctx.db.get(args.id);
    if (!integration || integration.groupId !== person.groupId) {
      return null;
    }

    // 4. Get events for this integration
    const events = await ctx.db
      .query("events")
      .withIndex("by_target", (q) => q.eq("targetId", args.id))
      .filter((e) => e.type === "integration_event")
      .order("desc")
      .take(50);

    return {
      ...integration,
      events,
    };
  },
});

/**
 * Get integration event logs
 */
export const getIntegrationLogs = query({
  args: {
    funnelId: v.id("things"),
    integrationId: v.optional(v.id("things")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // 2. Get user's person record
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person?.groupId) return [];

    // 3. Verify funnel access
    const funnel = await ctx.db.get(args.funnelId);
    if (!funnel || funnel.groupId !== person.groupId) {
      return [];
    }

    // 4. Get integration events
    let events = await ctx.db
      .query("events")
      .withIndex("by_type", (q) => q.eq("type", "integration_event"))
      .filter((e) => e.metadata?.funnelId === args.funnelId)
      .order("desc")
      .take(args.limit || 100);

    // 5. Filter by specific integration if provided
    if (args.integrationId) {
      events = events.filter((e) => e.targetId === args.integrationId);
    }

    // 6. Enrich with integration details
    const enrichedEvents = await Promise.all(
      events.map(async (event) => {
        const integration = event.targetId
          ? await ctx.db.get(event.targetId)
          : null;

        return {
          ...event,
          integrationName: integration?.name,
          integrationType: event.metadata?.integrationType,
        };
      })
    );

    return enrichedEvents;
  },
});

/**
 * Get integration statistics
 */
export const getIntegrationStats = query({
  args: {
    funnelId: v.id("things"),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        totalIntegrations: 0,
        activeIntegrations: 0,
        totalTriggers: 0,
        successfulTriggers: 0,
        failedTriggers: 0,
        successRate: 0,
      };
    }

    // 2. Get user's person record
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person?.groupId) {
      return {
        totalIntegrations: 0,
        activeIntegrations: 0,
        totalTriggers: 0,
        successfulTriggers: 0,
        failedTriggers: 0,
        successRate: 0,
      };
    }

    // 3. Verify funnel access
    const funnel = await ctx.db.get(args.funnelId);
    if (!funnel || funnel.groupId !== person.groupId) {
      return {
        totalIntegrations: 0,
        activeIntegrations: 0,
        totalTriggers: 0,
        successfulTriggers: 0,
        failedTriggers: 0,
        successRate: 0,
      };
    }

    // 4. Get all integrations
    const connections = await ctx.db
      .query("connections")
      .withIndex("from_type", (q) =>
        q.eq("fromThingId", args.funnelId).eq("relationshipType", "integrated")
      )
      .collect();

    const integrationIds = connections.map((c) => c.toThingId);
    const integrations = await Promise.all(
      integrationIds.map((id) => ctx.db.get(id))
    );

    const totalIntegrations = integrations.filter((i) => i !== null).length;
    const activeIntegrations = integrations.filter(
      (i) => i && i.status === "active" && i.properties?.enabled
    ).length;

    // 5. Get events within date range
    const days = args.days || 30;
    const cutoffDate = Date.now() - days * 24 * 60 * 60 * 1000;

    const events = await ctx.db
      .query("events")
      .withIndex("by_type", (q) => q.eq("type", "integration_event"))
      .filter((e) => e.metadata?.funnelId === args.funnelId)
      .filter((e) => (e.timestamp ?? 0) >= cutoffDate)
      .collect();

    // 6. Calculate statistics
    const totalTriggers = events.filter(
      (e) =>
        e.metadata?.action === "triggered_succeeded" ||
        e.metadata?.action === "triggered_failed"
    ).length;

    const successfulTriggers = events.filter(
      (e) => e.metadata?.action === "triggered_succeeded"
    ).length;

    const failedTriggers = events.filter(
      (e) => e.metadata?.action === "triggered_failed"
    ).length;

    const successRate =
      totalTriggers > 0 ? successfulTriggers / totalTriggers : 0;

    return {
      totalIntegrations,
      activeIntegrations,
      totalTriggers,
      successfulTriggers,
      failedTriggers,
      successRate,
    };
  },
});
