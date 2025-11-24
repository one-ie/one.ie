import { mutation } from "../_generated/server";
import { v } from "convex/values";

/**
 * DIMENSION 1: GROUPS
 *
 * Hierarchical containers for multi-tenant isolation and data scoping
 * All data (things, connections, events, knowledge) are scoped by groupId
 *
 * Group Types:
 * - friend_circle: Small groups for personal collaboration (2-10 people)
 * - business: Commercial organizations (10-1000+ people)
 * - community: Open groups with shared interests
 * - dao: Decentralized autonomous organizations (blockchain-native)
 * - government: Regulatory bodies at any scale
 * - organization: Generic container (default)
 *
 * Hierarchical Nesting:
 * Groups can contain subgroups via parentGroupId (infinite depth)
 * Example: Government > Department > Team > Squad
 *
 * Mutation Pattern: authenticate → validate → create/update → log event
 */
export const create = mutation({
  args: {
    slug: v.string(),
    name: v.string(),
    type: v.union(
      v.literal("friend_circle"),
      v.literal("business"),
      v.literal("community"),
      v.literal("dao"),
      v.literal("government"),
      v.literal("organization")
    ),
    parentGroupId: v.optional(v.id("groups")),
    description: v.optional(v.string()),
    metadata: v.optional(v.any()),
    settings: v.optional(v.object({
      visibility: v.union(v.literal("public"), v.literal("private")),
      joinPolicy: v.union(
        v.literal("open"),
        v.literal("invite_only"),
        v.literal("approval_required")
      ),
      plan: v.optional(v.union(
        v.literal("starter"),
        v.literal("pro"),
        v.literal("enterprise")
      )),
      limits: v.optional(v.object({
        users: v.number(),
        storage: v.number(),
        apiCalls: v.number()
      }))
    }))
  },
  handler: async (ctx, args) => {
    // Check if slug already exists
    const existing = await ctx.db
      .query("groups")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existing) {
      throw new Error(`Group with slug "${args.slug}" already exists`);
    }

    // Default settings based on group type
    const defaultSettings = getDefaultSettings(args.type);
    const settings = args.settings || defaultSettings;

    // Create the group
    const groupId = await ctx.db.insert("groups", {
      slug: args.slug,
      name: args.name,
      type: args.type,
      parentGroupId: args.parentGroupId,
      description: args.description,
      metadata: args.metadata || {},
      settings,
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    // Log creation event (if there's an authenticated user)
    const identity = await ctx.auth.getUserIdentity();
    if (identity) {
      // Find the user entity
      const user = await ctx.db
        .query("entities")
        .filter((q) =>
          q.and(
            q.eq(q.field("type"), "user"),
            q.eq(q.field("properties.userId"), identity.tokenIdentifier)
          )
        )
        .first();

      if (user) {
        await ctx.db.insert("events", {
          groupId,
          type: "thing_created",
          actorId: user._id,
          targetId: undefined,
          timestamp: Date.now(),
          metadata: {
            thingType: "group",
            groupType: args.type,
            slug: args.slug,
            name: args.name,
            parentGroupId: args.parentGroupId,
            source: "api"
          }
        });
      }
    }

    return groupId;
  }
});

/**
 * Update an existing group
 */
export const update = mutation({
  args: {
    groupId: v.id("groups"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    metadata: v.optional(v.any()),
    settings: v.optional(v.object({
      visibility: v.union(v.literal("public"), v.literal("private")),
      joinPolicy: v.union(
        v.literal("open"),
        v.literal("invite_only"),
        v.literal("approval_required")
      ),
      plan: v.optional(v.union(
        v.literal("starter"),
        v.literal("pro"),
        v.literal("enterprise")
      )),
      limits: v.optional(v.object({
        users: v.number(),
        storage: v.number(),
        apiCalls: v.number()
      }))
    }))
  },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    // Build update object
    const updates: any = {
      updatedAt: Date.now()
    };

    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.metadata !== undefined) updates.metadata = args.metadata;
    if (args.settings !== undefined) updates.settings = args.settings;

    await ctx.db.patch(args.groupId, updates);

    // Log update event
    const identity = await ctx.auth.getUserIdentity();
    if (identity) {
      const actor = await ctx.db
        .query("entities")
        .filter((q) =>
          q.and(
            q.eq(q.field("type"), "user"),
            q.eq(q.field("properties.userId"), identity.tokenIdentifier)
          )
        )
        .first();

      if (actor) {
        await ctx.db.insert("events", {
          groupId: args.groupId,
          type: "thing_updated",
          actorId: actor._id,
          targetId: undefined,
          timestamp: Date.now(),
          metadata: {
            thingType: "group",
            action: "updated",
            changes: Object.keys(updates).filter(k => k !== "updatedAt"),
            source: "api"
          }
        });
      }
    }

    return args.groupId;
  }
});

/**
 * Archive a group (soft delete)
 * Does NOT delete data - maintains audit trail
 */
export const archive = mutation({
  args: {
    groupId: v.id("groups")
  },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    await ctx.db.patch(args.groupId, {
      status: "archived",
      updatedAt: Date.now()
    });

    // Log archive event
    const identity = await ctx.auth.getUserIdentity();
    if (identity) {
      const actor = await ctx.db
        .query("entities")
        .filter((q) =>
          q.and(
            q.eq(q.field("type"), "user"),
            q.eq(q.field("properties.userId"), identity.tokenIdentifier)
          )
        )
        .first();

      if (actor) {
        await ctx.db.insert("events", {
          groupId: args.groupId,
          type: "thing_deleted",
          actorId: actor._id,
          targetId: undefined,
          timestamp: Date.now(),
          metadata: {
            thingType: "group",
            action: "archived",
            deletionType: "soft",
            source: "api"
          }
        });
      }
    }

    return args.groupId;
  }
});

/**
 * Restore an archived group
 */
export const restore = mutation({
  args: {
    groupId: v.id("groups")
  },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    if (group.status !== "archived") {
      throw new Error("Group is not archived");
    }

    await ctx.db.patch(args.groupId, {
      status: "active",
      updatedAt: Date.now()
    });

    // Log restore event
    const identity = await ctx.auth.getUserIdentity();
    if (identity) {
      const actor = await ctx.db
        .query("entities")
        .filter((q) =>
          q.and(
            q.eq(q.field("type"), "user"),
            q.eq(q.field("properties.userId"), identity.tokenIdentifier)
          )
        )
        .first();

      if (actor) {
        await ctx.db.insert("events", {
          groupId: args.groupId,
          type: "thing_updated",
          actorId: actor._id,
          targetId: undefined,
          timestamp: Date.now(),
          metadata: {
            thingType: "group",
            action: "restored",
            statusChange: "archived → active",
            source: "api"
          }
        });
      }
    }

    return args.groupId;
  }
});

/**
 * Get default settings based on group type
 */
function getDefaultSettings(type: string) {
  switch (type) {
    case "friend_circle":
      return {
        visibility: "private" as const,
        joinPolicy: "invite_only" as const,
        plan: "starter" as const
      };
    case "business":
      return {
        visibility: "private" as const,
        joinPolicy: "invite_only" as const,
        plan: "pro" as const
      };
    case "community":
      return {
        visibility: "public" as const,
        joinPolicy: "approval_required" as const,
        plan: "pro" as const
      };
    case "dao":
      return {
        visibility: "public" as const,
        joinPolicy: "open" as const,
        plan: "pro" as const
      };
    case "government":
      return {
        visibility: "public" as const,
        joinPolicy: "approval_required" as const,
        plan: "enterprise" as const
      };
    case "organization":
      return {
        visibility: "private" as const,
        joinPolicy: "invite_only" as const,
        plan: "starter" as const
      };
    default:
      return {
        visibility: "private" as const,
        joinPolicy: "invite_only" as const,
        plan: "starter" as const
      };
  }
}
