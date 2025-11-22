import { v } from "convex/values";
import { mutation } from "../_generated/server";

/**
 * Website Mutations
 *
 * Implements CRUD operations for websites following the 6-dimension ontology:
 * - Websites are THINGS with type "website"
 * - ALWAYS scoped by groupId (multi-tenant isolation)
 * - ALWAYS log events after operations
 * - ALWAYS create connections (creator → website)
 */

// ============================================================================
// CREATE WEBSITE
// ============================================================================

export const create = mutation({
  args: {
    name: v.string(),
    domain: v.optional(v.string()),
    subdomain: v.string(),
    template: v.optional(
      v.union(v.literal("minimal"), v.literal("showcase"), v.literal("portfolio"))
    ),
    customCSS: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE: Get user identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get the creator (person) from identity
    const creator = await ctx.db
      .query("entities")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((q) => q.eq(q.field("properties.email"), identity.email))
      .first();

    if (!creator) {
      throw new Error("Creator not found");
    }

    // 2. VALIDATE GROUP: Check context and limits
    const groupId = creator.groupId;
    if (!groupId) {
      throw new Error("No group assigned to creator");
    }

    const group = await ctx.db.get(groupId);
    if (!group || group.status !== "active") {
      throw new Error("Invalid or inactive group");
    }

    // TODO: Check limits (websites per group)
    // const websiteCount = await ctx.db.query("entities")
    //   .withIndex("by_group_type", q => q.eq("groupId", groupId).eq("type", "website"))
    //   .collect();
    // if (websiteCount.length >= group.settings.limits.websites) {
    //   throw new Error("Website limit reached for this group");
    // }

    // 3. CREATE ENTITY: Insert into entities table
    const now = Date.now();
    const websiteId = await ctx.db.insert("entities", {
      type: "website",
      name: args.name,
      groupId: groupId, // REQUIRED for multi-tenant isolation
      properties: {
        domain: args.domain,
        subdomain: args.subdomain,
        template: args.template || "minimal",
        customCSS: args.customCSS,
        sslEnabled: false,
        analytics: {
          visitors30d: 0,
          pageViews: 0,
          conversionRate: 0,
        },
      },
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });

    // 4. CREATE CONNECTION: Link creator → website
    await ctx.db.insert("connections", {
      fromEntityId: creator._id,
      toEntityId: websiteId,
      relationshipType: "owns",
      metadata: {
        role: "owner",
        createdVia: "website_builder",
      },
      validFrom: now,
      createdAt: now,
    });

    // 5. LOG EVENT: Audit trail
    await ctx.db.insert("events", {
      type: "entity_created",
      actorId: creator._id,
      targetId: websiteId,
      timestamp: now,
      metadata: {
        entityType: "website",
        groupId: groupId,
        websiteName: args.name,
        subdomain: args.subdomain,
      },
    });

    // 6. RETURN: Website ID
    return websiteId;
  },
});

// ============================================================================
// UPDATE WEBSITE
// ============================================================================

export const update = mutation({
  args: {
    id: v.id("entities"),
    name: v.optional(v.string()),
    domain: v.optional(v.string()),
    customCSS: v.optional(v.string()),
    sslEnabled: v.optional(v.boolean()),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("active"),
        v.literal("published"),
        v.literal("archived")
      )
    ),
  },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const creator = await ctx.db
      .query("entities")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((q) => q.eq(q.field("properties.email"), identity.email))
      .first();

    if (!creator) {
      throw new Error("Creator not found");
    }

    // 2. VALIDATE OWNERSHIP: Check connection
    const website = await ctx.db.get(args.id);
    if (!website || website.type !== "website") {
      throw new Error("Website not found");
    }

    // Verify user owns this website
    const ownership = await ctx.db
      .query("connections")
      .withIndex("from_type", (q) =>
        q.eq("fromEntityId", creator._id).eq("relationshipType", "owns")
      )
      .filter((q) => q.eq(q.field("toEntityId"), args.id))
      .first();

    if (!ownership) {
      throw new Error("You do not own this website");
    }

    // 3. UPDATE ENTITY: Patch website
    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) {
      updates.name = args.name;
    }

    if (args.status !== undefined) {
      updates.status = args.status;
    }

    // Merge property updates
    const propertyUpdates: any = {};
    if (args.domain !== undefined) propertyUpdates.domain = args.domain;
    if (args.customCSS !== undefined) propertyUpdates.customCSS = args.customCSS;
    if (args.sslEnabled !== undefined) propertyUpdates.sslEnabled = args.sslEnabled;

    if (Object.keys(propertyUpdates).length > 0) {
      updates.properties = {
        ...website.properties,
        ...propertyUpdates,
      };
    }

    await ctx.db.patch(args.id, updates);

    // 4. LOG EVENT
    await ctx.db.insert("events", {
      type: "entity_updated",
      actorId: creator._id,
      targetId: args.id,
      timestamp: Date.now(),
      metadata: {
        entityType: "website",
        updates: Object.keys(updates),
      },
    });

    return args.id;
  },
});

// ============================================================================
// DELETE WEBSITE
// ============================================================================

export const deleteWebsite = mutation({
  args: {
    id: v.id("entities"),
  },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const creator = await ctx.db
      .query("entities")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((q) => q.eq(q.field("properties.email"), identity.email))
      .first();

    if (!creator) {
      throw new Error("Creator not found");
    }

    // 2. VALIDATE OWNERSHIP
    const website = await ctx.db.get(args.id);
    if (!website || website.type !== "website") {
      throw new Error("Website not found");
    }

    const ownership = await ctx.db
      .query("connections")
      .withIndex("from_type", (q) =>
        q.eq("fromEntityId", creator._id).eq("relationshipType", "owns")
      )
      .filter((q) => q.eq(q.field("toEntityId"), args.id))
      .first();

    if (!ownership) {
      throw new Error("You do not own this website");
    }

    // 3. SOFT DELETE: Mark as archived
    await ctx.db.patch(args.id, {
      status: "archived",
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });

    // 4. LOG EVENT
    await ctx.db.insert("events", {
      type: "entity_archived",
      actorId: creator._id,
      targetId: args.id,
      timestamp: Date.now(),
      metadata: {
        entityType: "website",
      },
    });

    return args.id;
  },
});
