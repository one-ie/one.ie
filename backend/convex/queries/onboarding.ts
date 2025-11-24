/**
 * Onboarding Queries
 *
 * Read onboarding state and recommendations
 */

import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Get group by slug
 */
export const getGroupBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const group = await ctx.db
      .query("groups")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    return group;
  },
});

/**
 * Check if slug is available
 */
export const checkSlugAvailability = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("groups")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    return {
      available: !existing,
      slug: args.slug,
    };
  },
});

/**
 * Get onboarding events for a group
 */
export const getOnboardingEvents = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("events")
      .withIndex("group_type", (q) => q.eq("groupId", args.groupId))
      .filter((q) =>
        q.or(
          q.eq(q.field("type"), "group_created"),
          q.eq(q.field("type"), "entity_created"),
          q.eq(q.field("type"), "user_registered")
        )
      )
      .order("desc")
      .take(50);

    return events;
  },
});
