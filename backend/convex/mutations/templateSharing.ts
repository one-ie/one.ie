/**
 * Template Sharing Mutations
 *
 * Cycle 59: Multi-tenant template sharing with permission controls
 */

import { mutation } from "../_generated/server";
import { v } from "convex/values";

/**
 * Update template share settings
 *
 * Creates connection to track share and logs event
 */
export const updateShareSettings = mutation({
  args: {
    templateId: v.id("things"),
    visibility: v.union(
      v.literal("private"),
      v.literal("team"),
      v.literal("public")
    ),
    permission: v.union(
      v.literal("view"),
      v.literal("duplicate")
    ),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. Get current user
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.eq(t.field("properties").email, identity.email))
      .first();

    if (!person || !person.groupId) {
      throw new Error("User not found or not in a group");
    }

    // 3. Get template and verify ownership
    const template = await ctx.db.get(args.templateId);

    if (!template) {
      throw new Error("Template not found");
    }

    if (template.groupId !== person.groupId) {
      throw new Error("Unauthorized - template belongs to different group");
    }

    if (!["funnel_template", "page_template"].includes(template.type)) {
      throw new Error("Invalid template type");
    }

    // 4. Update template properties
    await ctx.db.patch(args.templateId, {
      properties: {
        ...template.properties,
        visibility: args.visibility,
        sharePermission: args.permission,
        lastSharedAt: Date.now(),
        lastSharedBy: person._id,
      },
      updatedAt: Date.now(),
    });

    // 5. Create or update connection to track share
    // Check if connection already exists
    const existingConnection = await ctx.db
      .query("connections")
      .withIndex("from_type", (q) =>
        q
          .eq("fromThingId", person._id)
          .eq("relationshipType", "shared_template")
      )
      .filter((c) => c.eq(c.field("toThingId"), args.templateId))
      .first();

    if (existingConnection) {
      // Update existing connection
      await ctx.db.patch(existingConnection._id, {
        metadata: {
          visibility: args.visibility,
          permission: args.permission,
          sharedAt: Date.now(),
          shareCount: (existingConnection.metadata?.shareCount || 0) + 1,
        },
      });
    } else {
      // Create new connection
      await ctx.db.insert("connections", {
        fromThingId: person._id,
        toThingId: args.templateId,
        relationshipType: "shared_template",
        metadata: {
          visibility: args.visibility,
          permission: args.permission,
          sharedAt: Date.now(),
          shareCount: 1,
        },
        validFrom: Date.now(),
        createdAt: Date.now(),
      });
    }

    // 6. Log event
    await ctx.db.insert("events", {
      type: "template_shared",
      actorId: person._id,
      targetId: args.templateId,
      timestamp: Date.now(),
      metadata: {
        templateName: template.name,
        templateType: template.type,
        visibility: args.visibility,
        permission: args.permission,
        groupId: person.groupId,
      },
    });

    return {
      success: true,
      templateId: args.templateId,
      visibility: args.visibility,
      permission: args.permission,
    };
  },
});

/**
 * Duplicate a shared template
 *
 * Creates a copy in user's group if permission allows
 */
export const duplicateSharedTemplate = mutation({
  args: {
    templateId: v.id("things"),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. Get current user
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.eq(t.field("properties").email, identity.email))
      .first();

    if (!person || !person.groupId) {
      throw new Error("User not found or not in a group");
    }

    // 3. Get template
    const template = await ctx.db.get(args.templateId);

    if (!template) {
      throw new Error("Template not found");
    }

    // 4. Check if user has permission to duplicate
    const canDuplicate =
      template.groupId === person.groupId || // Own template
      template.properties?.visibility === "public" || // Public template
      (template.properties?.visibility === "team" &&
        template.groupId === person.groupId); // Team template in same group

    if (!canDuplicate) {
      throw new Error("Not authorized to duplicate this template");
    }

    // 5. Check share permission
    if (
      template.groupId !== person.groupId &&
      template.properties?.sharePermission !== "duplicate"
    ) {
      throw new Error("Template does not allow duplication");
    }

    // 6. Create duplicate
    const duplicateId = await ctx.db.insert("things", {
      type: template.type,
      name: `${template.name} (Copy)`,
      groupId: person.groupId, // Copy to user's group
      properties: {
        ...template.properties,
        // Reset share settings for duplicate
        visibility: "private",
        sharePermission: "view",
        originalTemplateId: args.templateId,
        duplicatedFrom: template.name,
        duplicatedAt: Date.now(),
        duplicatedBy: person._id,
      },
      status: "draft",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // 7. Create connection to track duplication
    await ctx.db.insert("connections", {
      fromThingId: duplicateId,
      toThingId: args.templateId,
      relationshipType: "duplicated_from",
      metadata: {
        duplicatedAt: Date.now(),
        duplicatedBy: person._id,
      },
      validFrom: Date.now(),
      createdAt: Date.now(),
    });

    // 8. Log event
    await ctx.db.insert("events", {
      type: "template_duplicated",
      actorId: person._id,
      targetId: duplicateId,
      timestamp: Date.now(),
      metadata: {
        originalTemplateId: args.templateId,
        originalTemplateName: template.name,
        groupId: person.groupId,
      },
    });

    return {
      success: true,
      duplicateId,
      originalId: args.templateId,
    };
  },
});

/**
 * Revoke template sharing (make private)
 */
export const revokeSharing = mutation({
  args: {
    templateId: v.id("things"),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. Get current user
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.eq(t.field("properties").email, identity.email))
      .first();

    if (!person || !person.groupId) {
      throw new Error("User not found or not in a group");
    }

    // 3. Get template and verify ownership
    const template = await ctx.db.get(args.templateId);

    if (!template || template.groupId !== person.groupId) {
      throw new Error("Unauthorized");
    }

    // 4. Update to private
    await ctx.db.patch(args.templateId, {
      properties: {
        ...template.properties,
        visibility: "private",
        sharePermission: "view",
        revokedAt: Date.now(),
        revokedBy: person._id,
      },
      updatedAt: Date.now(),
    });

    // 5. Archive all share connections
    const connections = await ctx.db
      .query("connections")
      .withIndex("from_type", (q) =>
        q
          .eq("fromThingId", person._id)
          .eq("relationshipType", "shared_template")
      )
      .filter((c) => c.eq(c.field("toThingId"), args.templateId))
      .collect();

    for (const conn of connections) {
      await ctx.db.patch(conn._id, {
        validTo: Date.now(), // Mark as expired
        metadata: {
          ...conn.metadata,
          revokedAt: Date.now(),
        },
      });
    }

    // 6. Log event
    await ctx.db.insert("events", {
      type: "template_share_revoked",
      actorId: person._id,
      targetId: args.templateId,
      timestamp: Date.now(),
      metadata: {
        templateName: template.name,
        connectionsRevoked: connections.length,
        groupId: person.groupId,
      },
    });

    return {
      success: true,
      templateId: args.templateId,
      connectionsRevoked: connections.length,
    };
  },
});
