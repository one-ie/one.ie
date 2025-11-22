/**
 * Funnel Mutations - Example Implementation with Event Logging
 *
 * This file demonstrates how to use FunnelService event logging functions
 * in Convex mutations. Every operation MUST log an event to the events table
 * for audit trail compliance.
 *
 * Pattern: Standard Mutation with Event Logging
 * 1. Authenticate user
 * 2. Validate organization context
 * 3. Perform operation (create/update/delete)
 * 4. Log event to events table
 * 5. Return result
 *
 * @see /one/things/plans/clickfunnels-builder-100-cycles.md - Cycle 017
 * @see /backend/convex/services/funnel/funnel.ts - FunnelService
 */

import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { FunnelService } from "../services/funnel/funnel";

// ============================================================================
// CREATE FUNNEL
// ============================================================================

/**
 * Create a new funnel
 *
 * Steps:
 * 1. Authenticate user
 * 2. Validate group access and limits
 * 3. Create funnel in things table
 * 4. Create ownership connection
 * 5. Log funnel_created event
 * 6. Return funnel ID
 */
export const create = mutation({
  args: {
    name: v.string(),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE: Get user identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get person record
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((q) => q.eq(q.field("properties.email"), identity.email))
      .first();

    if (!person || !person.groupId) {
      throw new Error("User must belong to a group");
    }

    // 2. VALIDATE GROUP: Check group exists and is active
    const group = await ctx.db.get(person.groupId);
    if (!group || group.status !== "active") {
      throw new Error("Invalid or inactive group");
    }

    // Check funnel limit
    const currentFunnelCount = await ctx.db
      .query("things")
      .withIndex("by_group_type", (q) =>
        q.eq("groupId", person.groupId).eq("type", "funnel")
      )
      .collect()
      .then((funnels) => funnels.filter((f) => f.status !== "archived").length);

    const maxFunnels = group.settings?.limits?.maxFunnels ?? 100;
    if (currentFunnelCount >= maxFunnels) {
      throw new Error(
        `Funnel limit exceeded. Current: ${currentFunnelCount}, Limit: ${maxFunnels}`
      );
    }

    // Generate slug if not provided
    const slug =
      args.slug ||
      args.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    // 3. CREATE FUNNEL: Insert into things table
    const funnelId = await ctx.db.insert("things", {
      type: "funnel",
      name: args.name,
      groupId: person.groupId,
      properties: {
        slug,
        description: args.description,
        category: args.category,
        stepCount: 0,
        settings: {},
        metadata: {
          totalViews: 0,
          totalConversions: 0,
          conversionRate: 0,
          revenue: 0,
        },
      },
      status: "draft",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // 4. CREATE CONNECTION: Link person → funnel (ownership)
    await ctx.db.insert("connections", {
      fromThingId: person._id,
      toThingId: funnelId,
      relationshipType: "owns",
      metadata: {
        role: "creator",
      },
      validFrom: Date.now(),
      createdAt: Date.now(),
    });

    // 5. LOG EVENT: Record funnel creation
    const eventData = FunnelService.prepareFunnelCreatedEvent(
      funnelId,
      person._id,
      person.groupId,
      args.name,
      args.category
    );

    await ctx.db.insert("events", eventData);

    // 6. RETURN: Funnel ID
    return funnelId;
  },
});

// ============================================================================
// UPDATE FUNNEL
// ============================================================================

/**
 * Update an existing funnel
 *
 * Steps:
 * 1. Authenticate user
 * 2. Validate funnel ownership
 * 3. Update funnel data
 * 4. Log entity_updated event (funnel type)
 * 5. Return success
 */
export const update = mutation({
  args: {
    funnelId: v.id("things"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    settings: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((q) => q.eq(q.field("properties.email"), identity.email))
      .first();

    if (!person?.groupId) throw new Error("User must belong to a group");

    // 2. VALIDATE OWNERSHIP
    const funnel = await ctx.db.get(args.funnelId);
    if (!funnel || funnel.groupId !== person.groupId) {
      throw new Error("Funnel not found or unauthorized");
    }

    // 3. UPDATE FUNNEL
    const updateData: any = {
      updatedAt: Date.now(),
    };

    const updatedFields: string[] = [];

    if (args.name !== undefined) {
      updateData.name = args.name;
      updatedFields.push("name");
    }

    if (
      args.slug ||
      args.description !== undefined ||
      args.category ||
      args.settings
    ) {
      const currentProps = funnel.properties as any;
      updateData.properties = {
        ...currentProps,
        ...(args.slug && { slug: args.slug }),
        ...(args.description !== undefined && { description: args.description }),
        ...(args.category && { category: args.category }),
        ...(args.settings && {
          settings: { ...currentProps.settings, ...args.settings },
        }),
      };

      if (args.slug) updatedFields.push("slug");
      if (args.description !== undefined) updatedFields.push("description");
      if (args.category) updatedFields.push("category");
      if (args.settings) updatedFields.push("settings");
    }

    await ctx.db.patch(args.funnelId, updateData);

    // 4. LOG EVENT
    const eventData = FunnelService.prepareFunnelUpdatedEvent(
      args.funnelId,
      person._id,
      person.groupId,
      updatedFields
    );

    await ctx.db.insert("events", eventData);

    return { success: true };
  },
});

// ============================================================================
// PUBLISH FUNNEL
// ============================================================================

/**
 * Publish a funnel (make it live)
 *
 * Steps:
 * 1. Authenticate user
 * 2. Validate funnel can be published (has steps)
 * 3. Update status to published
 * 4. Log funnel_published event
 * 5. Return success
 */
export const publish = mutation({
  args: {
    funnelId: v.id("things"),
  },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((q) => q.eq(q.field("properties.email"), identity.email))
      .first();

    if (!person?.groupId) throw new Error("User must belong to a group");

    // 2. VALIDATE
    const funnel = await ctx.db.get(args.funnelId);
    if (!funnel || funnel.groupId !== person.groupId) {
      throw new Error("Funnel not found or unauthorized");
    }

    if (funnel.status === "published") {
      throw new Error("Funnel is already published");
    }

    const properties = funnel.properties as any;
    if (!properties?.stepCount || properties.stepCount === 0) {
      throw new Error("Funnel must have at least one step before publishing");
    }

    // 3. UPDATE STATUS
    await ctx.db.patch(args.funnelId, {
      status: "published",
      properties: {
        ...properties,
        metadata: {
          ...properties.metadata,
          lastPublished: Date.now(),
          publishedVersion: (properties.metadata?.publishedVersion ?? 0) + 1,
        },
      },
      updatedAt: Date.now(),
    });

    // 4. LOG EVENT
    const eventData = FunnelService.prepareFunnelPublishedEvent(
      args.funnelId,
      person._id,
      person.groupId,
      funnel.name
    );

    await ctx.db.insert("events", eventData);

    return { success: true };
  },
});

// ============================================================================
// UNPUBLISH FUNNEL
// ============================================================================

/**
 * Unpublish a funnel (take it offline)
 */
export const unpublish = mutation({
  args: {
    funnelId: v.id("things"),
  },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((q) => q.eq(q.field("properties.email"), identity.email))
      .first();

    if (!person?.groupId) throw new Error("User must belong to a group");

    // 2. VALIDATE
    const funnel = await ctx.db.get(args.funnelId);
    if (!funnel || funnel.groupId !== person.groupId) {
      throw new Error("Funnel not found or unauthorized");
    }

    if (funnel.status !== "published") {
      throw new Error("Only published funnels can be unpublished");
    }

    // 3. UPDATE STATUS
    await ctx.db.patch(args.funnelId, {
      status: "active",
      updatedAt: Date.now(),
    });

    // 4. LOG EVENT
    const eventData = FunnelService.prepareFunnelUnpublishedEvent(
      args.funnelId,
      person._id,
      person.groupId,
      funnel.name
    );

    await ctx.db.insert("events", eventData);

    return { success: true };
  },
});

// ============================================================================
// DUPLICATE FUNNEL
// ============================================================================

/**
 * Duplicate an existing funnel (clone all steps and elements)
 */
export const duplicate = mutation({
  args: {
    funnelId: v.id("things"),
    newName: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((q) => q.eq(q.field("properties.email"), identity.email))
      .first();

    if (!person?.groupId) throw new Error("User must belong to a group");

    // 2. VALIDATE
    const originalFunnel = await ctx.db.get(args.funnelId);
    if (!originalFunnel || originalFunnel.groupId !== person.groupId) {
      throw new Error("Funnel not found or unauthorized");
    }

    // 3. CREATE DUPLICATE
    const originalProps = originalFunnel.properties as any;
    const newSlug = args.newName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const newFunnelId = await ctx.db.insert("things", {
      type: "funnel",
      name: args.newName,
      groupId: person.groupId,
      properties: {
        ...originalProps,
        slug: newSlug,
        metadata: {
          totalViews: 0,
          totalConversions: 0,
          conversionRate: 0,
          revenue: 0,
        },
      },
      status: "draft",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create ownership connection
    await ctx.db.insert("connections", {
      fromThingId: person._id,
      toThingId: newFunnelId,
      relationshipType: "owns",
      metadata: { role: "creator" },
      validFrom: Date.now(),
      createdAt: Date.now(),
    });

    // Create template connection (tracks duplication lineage)
    await ctx.db.insert("connections", {
      fromThingId: newFunnelId,
      toThingId: args.funnelId,
      relationshipType: "funnel_based_on_template",
      metadata: { duplicatedAt: Date.now() },
      validFrom: Date.now(),
      createdAt: Date.now(),
    });

    // 4. LOG EVENT
    const eventData = FunnelService.prepareFunnelDuplicatedEvent(
      args.funnelId,
      newFunnelId,
      person._id,
      person.groupId,
      originalFunnel.name,
      args.newName
    );

    await ctx.db.insert("events", eventData);

    return newFunnelId;
  },
});

// ============================================================================
// ARCHIVE FUNNEL
// ============================================================================

/**
 * Archive a funnel (soft delete)
 */
export const archive = mutation({
  args: {
    funnelId: v.id("things"),
  },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((q) => q.eq(q.field("properties.email"), identity.email))
      .first();

    if (!person?.groupId) throw new Error("User must belong to a group");

    // 2. VALIDATE
    const funnel = await ctx.db.get(args.funnelId);
    if (!funnel || funnel.groupId !== person.groupId) {
      throw new Error("Funnel not found or unauthorized");
    }

    // 3. SOFT DELETE (change status to archived)
    await ctx.db.patch(args.funnelId, {
      status: "archived",
      updatedAt: Date.now(),
    });

    // 4. LOG EVENT
    const eventData = FunnelService.prepareFunnelArchivedEvent(
      args.funnelId,
      person._id,
      person.groupId,
      funnel.name
    );

    await ctx.db.insert("events", eventData);

    return { success: true };
  },
});
