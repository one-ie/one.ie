/**
 * Funnel Mutations - Write operations with organization scoping and event logging
 *
 * All mutations MUST:
 * 1. Authenticate user
 * 2. Validate groupId access
 * 3. Enforce resource limits
 * 4. Log events after operations
 *
 * @see /backend/CLAUDE.md - Mutation patterns
 * @see /one/knowledge/ontology.md - 6-dimension ontology
 */

import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { FunnelService } from "../services/funnel/funnel";

// ============================================================================
// Create Funnel
// ============================================================================

/**
 * Create a new funnel
 *
 * CRITICAL:
 * - Validates user has access to groupId
 * - Enforces funnel limits
 * - Logs funnel_created event
 */
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    groupId: v.optional(v.id("groups")),
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

    // 3. Determine target groupId (use user's group if not specified)
    const targetGroupId = args.groupId || person.groupId;

    // 4. Validate access to target group
    const role = person.properties?.role;
    if (role === "customer") {
      throw new Error("Customers cannot create funnels");
    }

    // Platform owners can create for any group, others only their own
    if (role !== "platform_owner" && targetGroupId !== person.groupId) {
      throw new Error("No access to this group");
    }

    // 5. Get group and validate it's active
    const group = await ctx.db.get(targetGroupId);
    if (!group || group.status !== "active") {
      throw new Error("Group is not active");
    }

    // 6. Check funnel limit
    const existingFunnels = await ctx.db
      .query("things")
      .withIndex("by_group_type", (q) =>
        q.eq("groupId", targetGroupId).eq("type", "funnel")
      )
      .collect();

    const maxFunnels = group.settings?.limits?.maxFunnels ?? 100;
    if (existingFunnels.length >= maxFunnels) {
      throw new Error(
        `Group has reached maximum funnel limit of ${maxFunnels}`
      );
    }

    // 7. Check for duplicate name
    const duplicateFunnel = existingFunnels.find(
      (f) => f.name.toLowerCase() === args.name.toLowerCase()
    );

    if (duplicateFunnel) {
      throw new Error(
        `A funnel with the name "${args.name}" already exists in this organization`
      );
    }

    // 8. Generate slug
    const slug = args.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // 9. Create funnel
    const funnelId = await ctx.db.insert("things", {
      type: "funnel",
      name: args.name,
      groupId: targetGroupId,
      properties: {
        slug,
        description: args.description,
        stepCount: 0,
        settings: {
          seo: {},
          tracking: {},
          branding: {},
        },
      },
      status: "draft",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // 10. Create ownership connection
    await ctx.db.insert("connections", {
      fromThingId: person._id,
      toThingId: funnelId,
      relationshipType: "owns",
      metadata: { role: person.properties?.role },
      validFrom: Date.now(),
      createdAt: Date.now(),
    });

    // 11. Log event using FunnelService helper
    const eventData = FunnelService.prepareFunnelCreatedEvent(
      funnelId,
      person._id,
      targetGroupId,
      args.name,
      "other" // category not provided in create args, default to "other"
    );
    await ctx.db.insert("events", eventData);

    return funnelId;
  },
});

// ============================================================================
// Update Funnel
// ============================================================================

/**
 * Update a funnel's properties
 *
 * CRITICAL:
 * - Validates user has modify access
 * - Logs entity_updated event
 */
export const update = mutation({
  args: {
    id: v.id("things"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    settings: v.optional(v.any()),
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

    if (!person?.groupId) {
      throw new Error("User must belong to a group");
    }

    // 3. Get funnel and verify ownership
    const funnel = await ctx.db.get(args.id);
    if (!funnel || funnel.type !== "funnel") {
      throw new Error("Funnel not found");
    }

    // 4. Validate access
    const role = person.properties?.role;
    const hasAccess =
      role === "platform_owner" || funnel.groupId === person.groupId;

    if (!hasAccess) {
      throw new Error("Unauthorized");
    }

    // 5. Only org_owner and platform_owner can modify
    if (role !== "platform_owner" && role !== "org_owner") {
      throw new Error("Only organization owners can modify funnels");
    }

    // 6. Update funnel
    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.name) {
      updates.name = args.name;
      // Regenerate slug if name changes
      const slug = args.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      updates.properties = {
        ...funnel.properties,
        slug,
      };
    }

    if (args.description !== undefined) {
      updates.properties = {
        ...(updates.properties || funnel.properties),
        description: args.description,
      };
    }

    if (args.settings) {
      updates.properties = {
        ...(updates.properties || funnel.properties),
        settings: args.settings,
      };
    }

    await ctx.db.patch(args.id, updates);

    // 7. Log event using FunnelService helper
    const eventData = FunnelService.prepareFunnelUpdatedEvent(
      args.id,
      person._id,
      funnel.groupId,
      Object.keys(args).filter((k) => k !== "id")
    );
    await ctx.db.insert("events", eventData);

    return args.id;
  },
});

// ============================================================================
// Publish Funnel
// ============================================================================

/**
 * Publish a funnel (make it live)
 *
 * CRITICAL:
 * - Validates funnel has at least one step
 * - Changes status to "published"
 * - Logs funnel_published event
 */
export const publish = mutation({
  args: { id: v.id("things") },
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

    if (!person?.groupId) {
      throw new Error("User must belong to a group");
    }

    // 3. Get funnel and verify ownership
    const funnel = await ctx.db.get(args.id);
    if (!funnel || funnel.type !== "funnel") {
      throw new Error("Funnel not found");
    }

    // 4. Validate access
    const role = person.properties?.role;
    const hasAccess =
      role === "platform_owner" || funnel.groupId === person.groupId;

    if (!hasAccess) {
      throw new Error("Unauthorized");
    }

    // 5. Only org_owner and platform_owner can publish
    if (role !== "platform_owner" && role !== "org_owner") {
      throw new Error("Only organization owners can publish funnels");
    }

    // 6. Validate can publish
    if (funnel.status === "published") {
      throw new Error("Funnel is already published");
    }

    const stepCount = funnel.properties?.stepCount ?? 0;
    if (stepCount === 0) {
      throw new Error("Funnel must have at least one step before publishing");
    }

    // 7. Publish funnel
    await ctx.db.patch(args.id, {
      status: "published",
      updatedAt: Date.now(),
    });

    // 8. Log event using FunnelService helper
    const eventData = FunnelService.prepareFunnelPublishedEvent(
      args.id,
      person._id,
      funnel.groupId,
      funnel.name
    );
    await ctx.db.insert("events", eventData);

    return args.id;
  },
});

// ============================================================================
// Unpublish Funnel
// ============================================================================

/**
 * Unpublish a funnel (take it offline)
 *
 * CRITICAL:
 * - Changes status to "active"
 * - Logs funnel_unpublished event
 */
export const unpublish = mutation({
  args: { id: v.id("things") },
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

    if (!person?.groupId) {
      throw new Error("User must belong to a group");
    }

    // 3. Get funnel and verify ownership
    const funnel = await ctx.db.get(args.id);
    if (!funnel || funnel.type !== "funnel") {
      throw new Error("Funnel not found");
    }

    // 4. Validate access
    const role = person.properties?.role;
    const hasAccess =
      role === "platform_owner" || funnel.groupId === person.groupId;

    if (!hasAccess) {
      throw new Error("Unauthorized");
    }

    // 5. Only org_owner and platform_owner can unpublish
    if (role !== "platform_owner" && role !== "org_owner") {
      throw new Error("Only organization owners can unpublish funnels");
    }

    // 6. Validate can unpublish
    if (funnel.status !== "published") {
      throw new Error("Only published funnels can be unpublished");
    }

    // 7. Unpublish funnel
    await ctx.db.patch(args.id, {
      status: "active",
      updatedAt: Date.now(),
    });

    // 8. Log event using FunnelService helper
    const eventData = FunnelService.prepareFunnelUnpublishedEvent(
      args.id,
      person._id,
      funnel.groupId,
      funnel.name
    );
    await ctx.db.insert("events", eventData);

    return args.id;
  },
});

// ============================================================================
// Archive Funnel (Soft Delete)
// ============================================================================

/**
 * Archive a funnel (soft delete)
 *
 * CRITICAL:
 * - Changes status to "archived"
 * - Logs funnel_archived event
 * - NEVER hard deletes
 */
export const archive = mutation({
  args: { id: v.id("things") },
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

    if (!person?.groupId) {
      throw new Error("User must belong to a group");
    }

    // 3. Get funnel and verify ownership
    const funnel = await ctx.db.get(args.id);
    if (!funnel || funnel.type !== "funnel") {
      throw new Error("Funnel not found");
    }

    // 4. Validate access
    const role = person.properties?.role;
    const hasAccess =
      role === "platform_owner" || funnel.groupId === person.groupId;

    if (!hasAccess) {
      throw new Error("Unauthorized");
    }

    // 5. Only org_owner and platform_owner can archive
    if (role !== "platform_owner" && role !== "org_owner") {
      throw new Error("Only organization owners can archive funnels");
    }

    // 6. Archive funnel (soft delete)
    await ctx.db.patch(args.id, {
      status: "archived",
      updatedAt: Date.now(),
    });

    // 7. Log event using FunnelService helper
    const eventData = FunnelService.prepareFunnelArchivedEvent(
      args.id,
      person._id,
      funnel.groupId,
      funnel.name
    );
    await ctx.db.insert("events", eventData);

    return args.id;
  },
});

// ============================================================================
// Duplicate Funnel
// ============================================================================

/**
 * Duplicate a funnel (create a copy)
 *
 * CRITICAL:
 * - Creates new funnel with same settings
 * - Validates access to source funnel
 * - Logs funnel_duplicated event
 */
export const duplicate = mutation({
  args: {
    id: v.id("things"),
    name: v.optional(v.string()),
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

    if (!person?.groupId) {
      throw new Error("User must belong to a group");
    }

    // 3. Get source funnel and verify ownership
    const sourceFunnel = await ctx.db.get(args.id);
    if (!sourceFunnel || sourceFunnel.type !== "funnel") {
      throw new Error("Funnel not found");
    }

    // 4. Validate access
    const role = person.properties?.role;
    const hasAccess =
      role === "platform_owner" || sourceFunnel.groupId === person.groupId;

    if (!hasAccess) {
      throw new Error("Unauthorized");
    }

    // 5. Create duplicate funnel
    const newName = args.name || `${sourceFunnel.name} (Copy)`;
    const slug = newName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const newFunnelId = await ctx.db.insert("things", {
      type: "funnel",
      name: newName,
      groupId: sourceFunnel.groupId,
      properties: {
        ...sourceFunnel.properties,
        slug,
        stepCount: 0, // Will be updated when steps are duplicated
      },
      status: "draft",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // 6. Create ownership connection
    await ctx.db.insert("connections", {
      fromThingId: person._id,
      toThingId: newFunnelId,
      relationshipType: "owns",
      metadata: { role: person.properties?.role },
      validFrom: Date.now(),
      createdAt: Date.now(),
    });

    // 7. Log event using FunnelService helper
    const eventData = FunnelService.prepareFunnelDuplicatedEvent(
      args.id,
      newFunnelId,
      person._id,
      sourceFunnel.groupId,
      sourceFunnel.name,
      newName
    );
    await ctx.db.insert("events", eventData);

    return newFunnelId;
  },
});
