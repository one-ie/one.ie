/**
 * Form Queries (Cycle 64)
 *
 * Queries for form submissions and form-related data.
 *
 * Features:
 * - Get submissions by funnel
 * - Filter by date range, status
 * - Search submissions
 * - Multi-tenant isolation (groupId)
 */

import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Get form submissions for a funnel
 *
 * Returns all form submissions with filtering and search capabilities.
 */
export const getSubmissions = query({
  args: {
    funnelId: v.id("things"),
    status: v.optional(v.union(v.literal("new"), v.literal("read"), v.literal("spam"), v.literal("archived"))),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    search: v.optional(v.string()),
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

    // 3. Verify funnel exists and user has access
    const funnel = await ctx.db.get(args.funnelId);
    if (!funnel || funnel.groupId !== person.groupId) {
      return [];
    }

    // 4. Query form submissions
    let query = ctx.db
      .query("things")
      .withIndex("by_group_type", (q) =>
        q.eq("groupId", person.groupId).eq("type", "form_submission")
      )
      .filter((t) => t.properties?.funnelId === args.funnelId);

    // 5. Apply status filter
    if (args.status) {
      query = query.filter((t) => t.status === args.status);
    }

    // 6. Apply date range filter
    if (args.startDate) {
      query = query.filter((t) => (t.createdAt ?? 0) >= args.startDate!);
    }
    if (args.endDate) {
      query = query.filter((t) => (t.createdAt ?? 0) <= args.endDate!);
    }

    // 7. Get submissions
    const limit = args.limit ?? 100;
    const submissions = await query.take(limit);

    // 8. Apply search filter (client-side for now)
    let results = submissions;
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      results = submissions.filter((sub) => {
        const name = (sub.properties?.name || "").toLowerCase();
        const email = (sub.properties?.email || "").toLowerCase();
        const phone = (sub.properties?.phone || "").toLowerCase();
        return (
          name.includes(searchLower) ||
          email.includes(searchLower) ||
          phone.includes(searchLower)
        );
      });
    }

    return results;
  },
});

/**
 * Get a single form submission by ID
 */
export const getSubmission = query({
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

    // 3. Get submission and verify access
    const submission = await ctx.db.get(args.id);
    if (!submission || submission.groupId !== person.groupId) {
      return null;
    }

    return submission;
  },
});

/**
 * Get submission statistics
 */
export const getSubmissionStats = query({
  args: {
    funnelId: v.id("things"),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        total: 0,
        new: 0,
        read: 0,
        spam: 0,
        archived: 0,
        todayCount: 0,
        weekCount: 0,
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
        total: 0,
        new: 0,
        read: 0,
        spam: 0,
        archived: 0,
        todayCount: 0,
        weekCount: 0,
      };
    }

    // 3. Verify funnel access
    const funnel = await ctx.db.get(args.funnelId);
    if (!funnel || funnel.groupId !== person.groupId) {
      return {
        total: 0,
        new: 0,
        read: 0,
        spam: 0,
        archived: 0,
        todayCount: 0,
        weekCount: 0,
      };
    }

    // 4. Get all submissions for this funnel
    const submissions = await ctx.db
      .query("things")
      .withIndex("by_group_type", (q) =>
        q.eq("groupId", person.groupId).eq("type", "form_submission")
      )
      .filter((t) => t.properties?.funnelId === args.funnelId)
      .collect();

    // 5. Calculate stats
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

    const stats = {
      total: submissions.length,
      new: submissions.filter((s) => s.status === "new").length,
      read: submissions.filter((s) => s.status === "read").length,
      spam: submissions.filter((s) => s.status === "spam").length,
      archived: submissions.filter((s) => s.status === "archived").length,
      todayCount: submissions.filter((s) => (s.createdAt ?? 0) >= oneDayAgo)
        .length,
      weekCount: submissions.filter((s) => (s.createdAt ?? 0) >= oneWeekAgo)
        .length,
    };

    return stats;
  },
});
