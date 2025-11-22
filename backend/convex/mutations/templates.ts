/**
 * Template Mutations - Event logging for template usage
 *
 * Tracks template interactions:
 * - template_viewed: When user views a template
 * - template_used: When user creates funnel from template
 *
 * All mutations MUST:
 * 1. Authenticate user
 * 2. Validate template access
 * 3. Log events for analytics
 *
 * Part of Cycle 58: Template Usage Statistics
 * @see /one/things/plans/clickfunnels-builder-100-cycles.md
 */

import { mutation } from "../_generated/server";
import { v } from "convex/values";

// ============================================================================
// Log Template Viewed Event
// ============================================================================

/**
 * Log when a user views a template
 *
 * Creates a template_viewed event for tracking popularity
 *
 * CRITICAL: Scoped to user's groupId for multi-tenant isolation
 */
export const logViewed = mutation({
  args: {
    templateId: v.id("things"),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. Get user
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person || !person.groupId) {
      throw new Error("User must belong to a group");
    }

    // 3. Verify template exists and user has access
    const template = await ctx.db.get(args.templateId);
    if (!template || template.type !== "funnel_template") {
      throw new Error("Template not found");
    }

    const role = person.properties?.role;
    const hasAccess =
      role === "platform_owner" || template.groupId === person.groupId;

    if (!hasAccess) {
      throw new Error("No access to this template");
    }

    // 4. Log template_viewed event
    await ctx.db.insert("events", {
      type: "template_viewed",
      actorId: person._id,
      targetId: args.templateId,
      timestamp: Date.now(),
      metadata: {
        templateName: template.name,
        groupId: person.groupId,
        ...args.metadata,
      },
    });

    return { success: true };
  },
});

// ============================================================================
// Log Template Used Event
// ============================================================================

/**
 * Log when a user creates a funnel from a template
 *
 * Creates:
 * - template_used event for tracking usage
 * - funnel_based_on_template connection for linking funnel to template
 *
 * CRITICAL: Scoped to user's groupId for multi-tenant isolation
 */
export const logUsed = mutation({
  args: {
    templateId: v.id("things"),
    funnelId: v.id("things"),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. Get user
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person || !person.groupId) {
      throw new Error("User must belong to a group");
    }

    // 3. Verify template exists and user has access
    const template = await ctx.db.get(args.templateId);
    if (!template || template.type !== "funnel_template") {
      throw new Error("Template not found");
    }

    const role = person.properties?.role;
    const hasAccess =
      role === "platform_owner" || template.groupId === person.groupId;

    if (!hasAccess) {
      throw new Error("No access to this template");
    }

    // 4. Verify funnel exists and user has access
    const funnel = await ctx.db.get(args.funnelId);
    if (!funnel || funnel.type !== "funnel") {
      throw new Error("Funnel not found");
    }

    const hasFunnelAccess =
      role === "platform_owner" || funnel.groupId === person.groupId;

    if (!hasFunnelAccess) {
      throw new Error("No access to this funnel");
    }

    // 5. Create connection: funnel → template
    await ctx.db.insert("connections", {
      fromThingId: args.funnelId,
      toThingId: args.templateId,
      relationshipType: "funnel_based_on_template",
      metadata: {
        createdBy: person._id,
        createdByEmail: identity.email,
        ...args.metadata,
      },
      validFrom: Date.now(),
      createdAt: Date.now(),
    });

    // 6. Log template_used event
    await ctx.db.insert("events", {
      type: "template_used",
      actorId: person._id,
      targetId: args.templateId,
      timestamp: Date.now(),
      metadata: {
        templateName: template.name,
        funnelId: args.funnelId,
        funnelName: funnel.name,
        groupId: person.groupId,
        ...args.metadata,
      },
    });

    return { success: true };
  },
});

// ============================================================================
// Update Template Properties
// ============================================================================

/**
 * Update template properties (name, description, category, etc.)
 *
 * CRITICAL:
 * - Validates user has access to template
 * - Logs entity_updated event
 */
export const update = mutation({
  args: {
    id: v.id("things"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    properties: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. Get user
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person || !person.groupId) {
      throw new Error("User must belong to a group");
    }

    // 3. Get template and verify access
    const template = await ctx.db.get(args.id);
    if (!template || template.type !== "funnel_template") {
      throw new Error("Template not found");
    }

    const role = person.properties?.role;
    const hasAccess =
      role === "platform_owner" || template.groupId === person.groupId;

    if (!hasAccess) {
      throw new Error("No access to this template");
    }

    // 4. Update template
    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) {
      updates.name = args.name;
    }

    if (args.description !== undefined) {
      updates.description = args.description;
    }

    if (args.properties !== undefined) {
      updates.properties = {
        ...template.properties,
        ...args.properties,
      };
    }

    await ctx.db.patch(args.id, updates);

    // 5. Log event
    await ctx.db.insert("events", {
      type: "entity_updated",
      actorId: person._id,
      targetId: args.id,
      timestamp: Date.now(),
      metadata: {
        entityType: "funnel_template",
        updatedFields: Object.keys(args).filter((k) => k !== "id"),
        groupId: person.groupId,
      },
    });

    return { success: true };
  },
});
