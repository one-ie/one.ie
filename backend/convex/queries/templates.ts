/**
 * Template Queries - Read operations for funnel templates
 *
 * Track template usage statistics:
 * - Times used (connections where type = "funnel_based_on_template")
 * - Funnels created from template
 * - Total conversions (purchase_completed events)
 * - Average conversion rate
 *
 * Part of Cycle 58: Template Usage Statistics
 * @see /one/things/plans/clickfunnels-builder-100-cycles.md
 */

import { query } from "../_generated/server";
import { v } from "convex/values";

// ============================================================================
// Get Template Statistics
// ============================================================================

/**
 * Get usage statistics for a template
 *
 * Returns:
 * - timesUsed: Count of funnels created from this template
 * - funnelsCreated: List of funnel IDs
 * - totalConversions: Count of purchase_completed events across all funnels
 * - avgConversionRate: Average conversion rate across funnels
 * - lastUsed: Timestamp of most recent usage
 *
 * CRITICAL: Scoped to user's groupId for multi-tenant isolation
 */
export const getStats = query({
  args: {
    templateId: v.id("things"),
  },
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

    // 3. Get template and verify access
    const template = await ctx.db.get(args.templateId);
    if (!template || template.type !== "funnel_template") {
      return null;
    }

    const role = person.properties?.role;
    const isAuthorized =
      role === "platform_owner" || template.groupId === person.groupId;

    if (!isAuthorized) {
      return null;
    }

    // 4. Get all connections where funnels are based on this template
    const templateConnections = await ctx.db
      .query("connections")
      .withIndex("to_type", (q) =>
        q
          .eq("toThingId", args.templateId)
          .eq("relationshipType", "funnel_based_on_template")
      )
      .collect();

    const timesUsed = templateConnections.length;
    const funnelIds = templateConnections.map((conn) => conn.fromThingId);

    // 5. Get funnels created from this template
    const funnels = await Promise.all(
      funnelIds.map(async (id) => {
        const funnel = await ctx.db.get(id);
        return funnel;
      })
    );

    // Filter out null/archived funnels
    const activeFunnels = funnels.filter(
      (f) => f && f.status !== "archived"
    );

    // 6. Calculate conversions across all funnels
    let totalConversions = 0;
    let totalVisitors = 0;

    for (const funnel of activeFunnels) {
      if (!funnel) continue;

      // Get purchase_completed events for this funnel
      const purchaseEvents = await ctx.db
        .query("events")
        .withIndex("by_type", (q) => q.eq("type", "purchase_completed"))
        .filter(
          (e) => e.metadata?.funnelId === funnel._id
        )
        .collect();

      totalConversions += purchaseEvents.length;

      // Get visitor_entered_funnel events to calculate conversion rate
      const visitorEvents = await ctx.db
        .query("events")
        .withIndex("by_type", (q) => q.eq("type", "visitor_entered_funnel"))
        .filter(
          (e) => e.metadata?.funnelId === funnel._id
        )
        .collect();

      totalVisitors += visitorEvents.length;
    }

    // 7. Calculate average conversion rate
    const avgConversionRate =
      totalVisitors > 0 ? (totalConversions / totalVisitors) * 100 : 0;

    // 8. Get last usage timestamp
    const sortedConnections = templateConnections.sort(
      (a, b) => b.createdAt - a.createdAt
    );
    const lastUsed = sortedConnections[0]?.createdAt || template.createdAt;

    return {
      templateId: args.templateId,
      timesUsed,
      funnelsCreated: funnelIds,
      totalConversions,
      avgConversionRate: Math.round(avgConversionRate * 100) / 100, // Round to 2 decimals
      lastUsed,
      activeFunnels: activeFunnels.length,
    };
  },
});

// ============================================================================
// Get All Template Statistics (for trending detection)
// ============================================================================

/**
 * Get statistics for all templates in user's organization
 *
 * Used to identify trending templates (high recent usage)
 *
 * CRITICAL: Scoped to user's groupId
 */
export const getAllStats = query({
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

    // 3. Get all templates in group
    const templates = await ctx.db
      .query("things")
      .withIndex("by_group_type", (q) =>
        q.eq("groupId", person.groupId).eq("type", "funnel_template")
      )
      .filter((t) => t.status !== "archived")
      .collect();

    // 4. Get stats for each template
    const templateStats = await Promise.all(
      templates.map(async (template) => {
        // Get connections for this template
        const connections = await ctx.db
          .query("connections")
          .withIndex("to_type", (q) =>
            q
              .eq("toThingId", template._id)
              .eq("relationshipType", "funnel_based_on_template")
          )
          .collect();

        // Count recent usage (last 7 days)
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const recentUsage = connections.filter(
          (c) => c.createdAt > sevenDaysAgo
        ).length;

        return {
          templateId: template._id,
          templateName: template.name,
          timesUsed: connections.length,
          recentUsage,
          lastUsed:
            connections.sort((a, b) => b.createdAt - a.createdAt)[0]?.createdAt ||
            template.createdAt,
        };
      })
    );

    // 5. Sort by recent usage (trending)
    const sorted = templateStats.sort((a, b) => b.recentUsage - a.recentUsage);

    // 6. Limit results
    const limit = args.limit || 100;
    return sorted.slice(0, limit);
  },
});

// ============================================================================
// Get Trending Templates
// ============================================================================

/**
 * Get trending templates (high usage in last 7 days)
 *
 * Returns templates with at least 3 uses in the last week
 *
 * CRITICAL: Scoped to user's groupId
 */
export const getTrending = query({
  args: {
    threshold: v.optional(v.number()), // Minimum uses in last 7 days to be "trending"
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

    // 3. Get all template stats
    const allStats = await ctx.db
      .query("things")
      .withIndex("by_group_type", (q) =>
        q.eq("groupId", person.groupId).eq("type", "funnel_template")
      )
      .filter((t) => t.status !== "archived")
      .collect();

    // 4. Calculate recent usage for each
    const threshold = args.threshold || 3;
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    const trending = await Promise.all(
      allStats.map(async (template) => {
        const connections = await ctx.db
          .query("connections")
          .withIndex("to_type", (q) =>
            q
              .eq("toThingId", template._id)
              .eq("relationshipType", "funnel_based_on_template")
          )
          .filter((c) => c.createdAt > sevenDaysAgo)
          .collect();

        return {
          template,
          recentUsage: connections.length,
        };
      })
    );

    // 5. Filter to only trending (above threshold)
    const filtered = trending
      .filter((t) => t.recentUsage >= threshold)
      .sort((a, b) => b.recentUsage - a.recentUsage);

    // 6. Limit results
    const limit = args.limit || 10;
    return filtered.slice(0, limit).map((t) => ({
      ...t.template,
      recentUsage: t.recentUsage,
    }));
  },
});
