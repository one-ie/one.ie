/**
 * Rating Queries - Template Rating System
 *
 * Dimension 4 (CONNECTIONS): `rated` relationship (user → template)
 *
 * Connection metadata:
 * - rating: number (1-5 stars)
 * - reviewText: string (optional)
 * - helpfulVotes: string[] (user IDs who voted helpful)
 */

import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Get rating statistics for a template
 * Returns average rating and breakdown by star count
 */
export const getTemplateRatings = query({
  args: {
    templateId: v.id("things"),
  },
  handler: async (ctx, args) => {
    // Get all ratings for this template
    const ratings = await ctx.db
      .query("connections")
      .withIndex("to_type", (q) =>
        q.eq("toThingId", args.templateId).eq("relationshipType", "rated")
      )
      .collect();

    if (ratings.length === 0) {
      return {
        averageRating: 0,
        totalRatings: 0,
        breakdown: {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0,
        },
      };
    }

    // Calculate statistics
    const ratingValues = ratings.map((r) => r.metadata?.rating || 0);
    const averageRating =
      ratingValues.reduce((sum, r) => sum + r, 0) / ratingValues.length;

    // Count ratings by star value
    const breakdown = {
      5: ratingValues.filter((r) => r === 5).length,
      4: ratingValues.filter((r) => r === 4).length,
      3: ratingValues.filter((r) => r === 3).length,
      2: ratingValues.filter((r) => r === 2).length,
      1: ratingValues.filter((r) => r === 1).length,
    };

    return {
      averageRating,
      totalRatings: ratings.length,
      breakdown,
    };
  },
});

/**
 * Get all reviews for a template
 * Returns ratings with review text and helpful votes
 */
export const getTemplateReviews = query({
  args: {
    templateId: v.id("things"),
    sortBy: v.optional(v.union(v.literal("recent"), v.literal("helpful"), v.literal("rating"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get all ratings with review text
    const ratings = await ctx.db
      .query("connections")
      .withIndex("to_type", (q) =>
        q.eq("toThingId", args.templateId).eq("relationshipType", "rated")
      )
      .collect();

    // Filter only ratings with review text
    const reviews = ratings.filter(
      (r) => r.metadata?.reviewText && r.metadata.reviewText.trim() !== ""
    );

    // Get reviewer info for each review
    const reviewsWithUsers = await Promise.all(
      reviews.map(async (review) => {
        const user = await ctx.db.get(review.fromThingId);
        return {
          id: review._id,
          rating: review.metadata?.rating || 0,
          reviewText: review.metadata?.reviewText || "",
          helpfulVotes: review.metadata?.helpfulVotes || [],
          helpfulCount: (review.metadata?.helpfulVotes || []).length,
          createdAt: review.createdAt,
          reviewer: {
            id: user?._id,
            name: user?.name || "Anonymous",
            avatarUrl: user?.properties?.avatarUrl,
          },
        };
      })
    );

    // Sort reviews
    const sortBy = args.sortBy || "recent";
    const sorted = reviewsWithUsers.sort((a, b) => {
      switch (sortBy) {
        case "helpful":
          return b.helpfulCount - a.helpfulCount;
        case "rating":
          return b.rating - a.rating;
        case "recent":
        default:
          return b.createdAt - a.createdAt;
      }
    });

    // Apply limit
    const limit = args.limit || 50;
    return sorted.slice(0, limit);
  },
});

/**
 * Get user's rating for a template
 * Returns user's own rating/review if it exists
 */
export const getUserRating = query({
  args: {
    templateId: v.id("things"),
  },
  handler: async (ctx, args) => {
    // Get current user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!user) return null;

    // Get user's rating for this template
    const rating = await ctx.db
      .query("connections")
      .withIndex("from_type", (q) =>
        q.eq("fromThingId", user._id).eq("relationshipType", "rated")
      )
      .filter((c) => c.toThingId === args.templateId)
      .first();

    if (!rating) return null;

    return {
      id: rating._id,
      rating: rating.metadata?.rating || 0,
      reviewText: rating.metadata?.reviewText || "",
      helpfulVotes: rating.metadata?.helpfulVotes || [],
      createdAt: rating.createdAt,
    };
  },
});

/**
 * List templates sorted by rating
 * Used for template browsing/discovery
 */
export const listTemplatesByRating = query({
  args: {
    groupId: v.optional(v.id("groups")),
    type: v.optional(v.string()),
    minRating: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get all templates
    let templatesQuery = ctx.db.query("things");

    if (args.groupId && args.type) {
      templatesQuery = templatesQuery.withIndex("by_group_type", (q) =>
        q.eq("groupId", args.groupId).eq("type", args.type)
      );
    } else if (args.type) {
      templatesQuery = templatesQuery.withIndex("by_type", (q) =>
        q.eq("type", args.type)
      );
    }

    const templates = await templatesQuery
      .filter((t) =>
        t.type === "funnel_template" ||
        t.type === "page_template" ||
        t.type === "template"
      )
      .collect();

    // Get ratings for each template
    const templatesWithRatings = await Promise.all(
      templates.map(async (template) => {
        const ratings = await ctx.db
          .query("connections")
          .withIndex("to_type", (q) =>
            q.eq("toThingId", template._id).eq("relationshipType", "rated")
          )
          .collect();

        const ratingValues = ratings.map((r) => r.metadata?.rating || 0);
        const averageRating =
          ratingValues.length > 0
            ? ratingValues.reduce((sum, r) => sum + r, 0) / ratingValues.length
            : 0;

        return {
          ...template,
          averageRating,
          totalRatings: ratings.length,
        };
      })
    );

    // Filter by minimum rating
    const filtered = args.minRating
      ? templatesWithRatings.filter((t) => t.averageRating >= args.minRating)
      : templatesWithRatings;

    // Sort by rating (descending)
    const sorted = filtered.sort((a, b) => b.averageRating - a.averageRating);

    // Apply limit
    const limit = args.limit || 50;
    return sorted.slice(0, limit);
  },
});
