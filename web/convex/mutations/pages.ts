import { v } from "convex/values";
import { mutation } from "../_generated/server";

/**
 * Page Mutations
 *
 * Implements CRUD operations for pages following the 6-dimension ontology:
 * - Pages are THINGS with type "landing_page" or "page"
 * - ALWAYS connected to a parent website
 * - ALWAYS scoped by groupId (inherited from website)
 * - ALWAYS log events after operations
 */

// ============================================================================
// CREATE PAGE
// ============================================================================

export const create = mutation({
  args: {
    websiteId: v.id("entities"),
    name: v.string(),
    path: v.string(), // URL path (e.g., "/about", "/products")
    pageType: v.optional(
      v.union(v.literal("landing_page"), v.literal("page"), v.literal("blog_post"))
    ),
    content: v.optional(v.string()), // HTML/Markdown content
    seo: v.optional(
      v.object({
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        keywords: v.optional(v.array(v.string())),
        ogImage: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx: any, args: any) => {
    // 1. AUTHENTICATE
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const creator = await ctx.db
      .query("entities")
      .withIndex("by_type", (q: any) => q.eq("type", "creator"))
      .filter((q: any) => q.eq(q.field("properties.email"), identity.email))
      .first();

    if (!creator) {
      throw new Error("Creator not found");
    }

    // 2. VALIDATE WEBSITE: Check ownership and group
    const website = await ctx.db.get(args.websiteId);
    if (!website || website.type !== "website") {
      throw new Error("Website not found");
    }

    // Verify user owns the parent website
    const ownership = await ctx.db
      .query("connections")
      .withIndex("from_type", (q: any) =>
        q.eq("fromEntityId", creator._id).eq("relationshipType", "owns")
      )
      .filter((q: any) => q.eq(q.field("toEntityId"), args.websiteId))
      .first();

    if (!ownership) {
      throw new Error("You do not own this website");
    }

    // 3. CREATE PAGE ENTITY
    const now = Date.now();
    const pageId = await ctx.db.insert("entities", {
      type: args.pageType || "page",
      name: args.name,
      groupId: website.groupId, // Inherit from parent website
      properties: {
        path: args.path,
        content: args.content || "",
        seo: args.seo || {
          title: args.name,
          description: "",
          keywords: [],
        },
        views: 0,
        lastPublished: null,
      },
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });

    // 4. CREATE CONNECTION: website → page (part_of)
    await ctx.db.insert("connections", {
      fromEntityId: pageId,
      toEntityId: args.websiteId,
      relationshipType: "part_of",
      metadata: {
        path: args.path,
        pageType: args.pageType || "page",
      },
      validFrom: now,
      createdAt: now,
    });

    // Also create creator → page connection
    await ctx.db.insert("connections", {
      fromEntityId: creator._id,
      toEntityId: pageId,
      relationshipType: "created_by",
      metadata: {
        createdVia: "website_builder",
      },
      validFrom: now,
      createdAt: now,
    });

    // 5. LOG EVENT
    await ctx.db.insert("events", {
      type: "entity_created",
      actorId: creator._id,
      targetId: pageId,
      timestamp: now,
      metadata: {
        entityType: args.pageType || "page",
        websiteId: args.websiteId,
        path: args.path,
        groupId: website.groupId,
      },
    });

    return pageId;
  },
});

// ============================================================================
// UPDATE PAGE
// ============================================================================

export const update = mutation({
  args: {
    id: v.id("entities"),
    name: v.optional(v.string()),
    path: v.optional(v.string()),
    content: v.optional(v.string()),
    seo: v.optional(
      v.object({
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        keywords: v.optional(v.array(v.string())),
        ogImage: v.optional(v.string()),
      })
    ),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("active"),
        v.literal("published"),
        v.literal("archived")
      )
    ),
  },
  handler: async (ctx: any, args: any) => {
    // 1. AUTHENTICATE
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const creator = await ctx.db
      .query("entities")
      .withIndex("by_type", (q: any) => q.eq("type", "creator"))
      .filter((q: any) => q.eq(q.field("properties.email"), identity.email))
      .first();

    if (!creator) {
      throw new Error("Creator not found");
    }

    // 2. VALIDATE PAGE: Check existence and ownership
    const page = await ctx.db.get(args.id);
    if (!page || !["page", "landing_page", "blog_post"].includes(page.type)) {
      throw new Error("Page not found");
    }

    // Get parent website
    const websiteConnection = await ctx.db
      .query("connections")
      .withIndex("from_type", (q: any) =>
        q.eq("fromEntityId", args.id).eq("relationshipType", "part_of")
      )
      .first();

    if (!websiteConnection) {
      throw new Error("Page is not connected to a website");
    }

    // Verify user owns the parent website
    const ownership = await ctx.db
      .query("connections")
      .withIndex("from_type", (q: any) =>
        q.eq("fromEntityId", creator._id).eq("relationshipType", "owns")
      )
      .filter((q: any) => q.eq(q.field("toEntityId"), websiteConnection.toEntityId))
      .first();

    if (!ownership) {
      throw new Error("You do not own this page's website");
    }

    // 3. UPDATE PAGE
    const now = Date.now();
    const updates: any = {
      updatedAt: now,
    };

    if (args.name !== undefined) {
      updates.name = args.name;
    }

    if (args.status !== undefined) {
      updates.status = args.status;
    }

    // Merge property updates
    const propertyUpdates: any = {};
    if (args.path !== undefined) propertyUpdates.path = args.path;
    if (args.content !== undefined) propertyUpdates.content = args.content;
    if (args.seo !== undefined) {
      propertyUpdates.seo = {
        ...page.properties.seo,
        ...args.seo,
      };
    }

    // Update lastPublished if publishing
    if (args.status === "published") {
      propertyUpdates.lastPublished = now;
    }

    if (Object.keys(propertyUpdates).length > 0) {
      updates.properties = {
        ...page.properties,
        ...propertyUpdates,
      };
    }

    await ctx.db.patch(args.id, updates);

    // 4. LOG EVENT
    await ctx.db.insert("events", {
      type: "entity_updated",
      actorId: creator._id,
      targetId: args.id,
      timestamp: now,
      metadata: {
        entityType: page.type,
        updates: Object.keys(updates),
        websiteId: websiteConnection.toEntityId,
      },
    });

    return args.id;
  },
});

// ============================================================================
// DELETE PAGE
// ============================================================================

export const deletePage = mutation({
  args: {
    id: v.id("entities"),
  },
  handler: async (ctx: any, args: any) => {
    // 1. AUTHENTICATE
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const creator = await ctx.db
      .query("entities")
      .withIndex("by_type", (q: any) => q.eq("type", "creator"))
      .filter((q: any) => q.eq(q.field("properties.email"), identity.email))
      .first();

    if (!creator) {
      throw new Error("Creator not found");
    }

    // 2. VALIDATE PAGE
    const page = await ctx.db.get(args.id);
    if (!page || !["page", "landing_page", "blog_post"].includes(page.type)) {
      throw new Error("Page not found");
    }

    // Get parent website
    const websiteConnection = await ctx.db
      .query("connections")
      .withIndex("from_type", (q: any) =>
        q.eq("fromEntityId", args.id).eq("relationshipType", "part_of")
      )
      .first();

    if (!websiteConnection) {
      throw new Error("Page is not connected to a website");
    }

    // Verify ownership
    const ownership = await ctx.db
      .query("connections")
      .withIndex("from_type", (q: any) =>
        q.eq("fromEntityId", creator._id).eq("relationshipType", "owns")
      )
      .filter((q: any) => q.eq(q.field("toEntityId"), websiteConnection.toEntityId))
      .first();

    if (!ownership) {
      throw new Error("You do not own this page's website");
    }

    // 3. SOFT DELETE
    const now = Date.now();
    await ctx.db.patch(args.id, {
      status: "archived",
      deletedAt: now,
      updatedAt: now,
    });

    // 4. LOG EVENT
    await ctx.db.insert("events", {
      type: "entity_archived",
      actorId: creator._id,
      targetId: args.id,
      timestamp: now,
      metadata: {
        entityType: page.type,
        websiteId: websiteConnection.toEntityId,
      },
    });

    return args.id;
  },
});
