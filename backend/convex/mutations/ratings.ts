/**
 * Rating Mutations - Template Rating System
 *
 * Dimension 4 (CONNECTIONS): Create/update `rated` relationships
 * Dimension 5 (EVENTS): Log rating events
 */

import { mutation } from "../_generated/server";
import { v } from "convex/values";

/**
 * Submit or update a rating for a template
 * Creates a `rated` connection (user → template)
 */
export const rateTemplate = mutation({
  args: {
    templateId: v.id("things"),
    rating: v.number(), // 1-5 stars
    reviewText: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate rating
    if (args.rating < 1 || args.rating > 5) {
      throw new Error("Rating must be between 1 and 5 stars");
    }

    // Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get current user
    const user = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Verify template exists
    const template = await ctx.db.get(args.templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    // Check if user already rated this template
    const existingRating = await ctx.db
      .query("connections")
      .withIndex("from_type", (q) =>
        q.eq("fromThingId", user._id).eq("relationshipType", "rated")
      )
      .filter((c) => c.toThingId === args.templateId)
      .first();

    const now = Date.now();

    if (existingRating) {
      // Update existing rating
      await ctx.db.patch(existingRating._id, {
        metadata: {
          rating: args.rating,
          reviewText: args.reviewText || "",
          helpfulVotes: existingRating.metadata?.helpfulVotes || [],
        },
      });

      // Log update event
      await ctx.db.insert("events", {
        type: "review_updated",
        actorId: user._id,
        targetId: args.templateId,
        timestamp: now,
        metadata: {
          rating: args.rating,
          hasReview: !!args.reviewText,
          connectionId: existingRating._id,
        },
      });

      return existingRating._id;
    } else {
      // Create new rating
      const connectionId = await ctx.db.insert("connections", {
        fromThingId: user._id,
        toThingId: args.templateId,
        relationshipType: "rated",
        metadata: {
          rating: args.rating,
          reviewText: args.reviewText || "",
          helpfulVotes: [],
        },
        validFrom: now,
        createdAt: now,
      });

      // Log rating event
      await ctx.db.insert("events", {
        type: "rated",
        actorId: user._id,
        targetId: args.templateId,
        timestamp: now,
        metadata: {
          rating: args.rating,
          hasReview: !!args.reviewText,
          connectionId,
        },
      });

      return connectionId;
    }
  },
});

/**
 * Vote a review as helpful
 * Adds user ID to helpfulVotes array
 */
export const voteReviewHelpful = mutation({
  args: {
    connectionId: v.id("connections"),
  },
  handler: async (ctx, args) => {
    // Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get current user
    const user = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Get the rating connection
    const connection = await ctx.db.get(args.connectionId);
    if (!connection || connection.relationshipType !== "rated") {
      throw new Error("Rating not found");
    }

    // Check if user already voted
    const helpfulVotes = connection.metadata?.helpfulVotes || [];
    const userId = user._id.toString();

    if (helpfulVotes.includes(userId)) {
      // Remove vote (toggle)
      await ctx.db.patch(args.connectionId, {
        metadata: {
          ...connection.metadata,
          helpfulVotes: helpfulVotes.filter((id: string) => id !== userId),
        },
      });
    } else {
      // Add vote
      await ctx.db.patch(args.connectionId, {
        metadata: {
          ...connection.metadata,
          helpfulVotes: [...helpfulVotes, userId],
        },
      });

      // Log helpful vote event
      await ctx.db.insert("events", {
        type: "review_helpful_voted",
        actorId: user._id,
        targetId: connection.toThingId,
        timestamp: Date.now(),
        metadata: {
          connectionId: args.connectionId,
          reviewerId: connection.fromThingId,
        },
      });
    }
  },
});

/**
 * Delete a rating/review
 * Soft deletes by setting validTo
 */
export const deleteRating = mutation({
  args: {
    connectionId: v.id("connections"),
  },
  handler: async (ctx, args) => {
    // Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get current user
    const user = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Get the rating connection
    const connection = await ctx.db.get(args.connectionId);
    if (!connection || connection.relationshipType !== "rated") {
      throw new Error("Rating not found");
    }

    // Verify ownership
    if (connection.fromThingId !== user._id) {
      throw new Error("Unauthorized: You can only delete your own ratings");
    }

    // Soft delete (set validTo)
    await ctx.db.patch(args.connectionId, {
      validTo: Date.now(),
    });

    // Log deletion event
    await ctx.db.insert("events", {
      type: "review_deleted",
      actorId: user._id,
      targetId: connection.toThingId,
      timestamp: Date.now(),
      metadata: {
        connectionId: args.connectionId,
      },
    });
  },
});
