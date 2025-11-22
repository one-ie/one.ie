import { v } from "convex/values";
import { query } from "../_generated/server";

/**
 * Page Queries
 *
 * Implements read operations for pages following the 6-dimension ontology:
 * - ALWAYS filter by groupId (multi-tenant isolation)
 * - ALWAYS enrich with connections (parent website)
 * - Support filtering by websiteId
 */

// ============================================================================
// LIST PAGES
// ============================================================================

export const list = query({
  args: {
    websiteId: v.optional(v.id("entities")),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("active"),
        v.literal("published"),
        v.literal("archived")
      )
    ),
    pageType: v.optional(
      v.union(v.literal("landing_page"), v.literal("page"), v.literal("blog_post"))
    ),
    limit: v.optional(v.number()),
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

    if (!creator || !creator.groupId) {
      return [];
    }

    // 2. FILTER BY WEBSITE (if provided)
    if (args.websiteId) {
      // Get pages via connections
      const connections = await ctx.db
        .query("connections")
        .withIndex("from_type", (q) =>
          q.eq("fromEntityId", args.websiteId).eq("relationshipType", "contains")
        )
        .collect();

      const pageIds = connections.map((conn) => conn.toEntityId);

      // Get the pages
      let pages = await Promise.all(
        pageIds.map(async (id) => {
          const page = await ctx.db.get(id);
          return page;
        })
      );

      // Filter out null pages and apply filters
      pages = pages.filter(Boolean);

      if (args.status) {
        pages = pages.filter((p) => p!.status === args.status);
      }

      if (args.pageType) {
        pages = pages.filter((p) => p!.type === args.pageType);
      }

      // Exclude deleted
      pages = pages.filter((p) => !p!.deletedAt);

      // Limit
      if (args.limit) {
        pages = pages.slice(0, args.limit);
      }

      // Enrich with metadata
      const enriched = await Promise.all(
        pages.map(async (page) => {
          const websiteConn = connections.find((c) => c.toEntityId === page!._id);
          return {
            ...page,
            _metadata: {
              websiteId: args.websiteId,
              path: websiteConn?.metadata?.path || "",
            },
          };
        })
      );

      return enriched;
    }

    // 3. LIST ALL PAGES FOR USER'S GROUP (if no websiteId)
    let pagesQuery = ctx.db.query("entities").withIndex("by_group", (q) =>
      q.eq("groupId", creator.groupId!)
    );

    // Filter by page types
    pagesQuery = pagesQuery.filter((q) =>
      q.or(
        q.eq(q.field("type"), "page"),
        q.eq(q.field("type"), "landing_page"),
        q.eq(q.field("type"), "blog_post")
      )
    );

    // Apply additional filters
    if (args.status) {
      pagesQuery = pagesQuery.filter((q) => q.eq(q.field("status"), args.status));
    }

    if (args.pageType) {
      pagesQuery = pagesQuery.filter((q) => q.eq(q.field("type"), args.pageType));
    }

    // Exclude deleted
    pagesQuery = pagesQuery.filter((q) => q.eq(q.field("deletedAt"), undefined));

    let pages = await pagesQuery.collect();

    // Limit
    if (args.limit) {
      pages = pages.slice(0, args.limit);
    }

    // 4. ENRICH WITH WEBSITE INFO
    const enriched = await Promise.all(
      pages.map(async (page) => {
        // Get parent website
        const websiteConn = await ctx.db
          .query("connections")
          .withIndex("to_type", (q) =>
            q.eq("toEntityId", page._id).eq("relationshipType", "contains")
          )
          .first();

        const website = websiteConn
          ? await ctx.db.get(websiteConn.fromEntityId)
          : null;

        return {
          ...page,
          _metadata: {
            websiteId: website?._id || null,
            websiteName: website?.name || null,
            path: page.properties.path || "",
          },
        };
      })
    );

    return enriched;
  },
});

// ============================================================================
// GET PAGE
// ============================================================================

export const get = query({
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

    // 2. GET PAGE
    const page = await ctx.db.get(args.id);
    if (!page || !["page", "landing_page", "blog_post"].includes(page.type)) {
      throw new Error("Page not found");
    }

    // 3. VERIFY ACCESS (must be in same group)
    if (page.groupId !== creator.groupId) {
      throw new Error("You do not have access to this page");
    }

    // 4. ENRICH WITH CONNECTIONS
    // Get parent website
    const websiteConn = await ctx.db
      .query("connections")
      .withIndex("to_type", (q) =>
        q.eq("toEntityId", page._id).eq("relationshipType", "contains")
      )
      .first();

    const website = websiteConn ? await ctx.db.get(websiteConn.fromEntityId) : null;

    // Get creator
    const creatorConn = await ctx.db
      .query("connections")
      .withIndex("to_type", (q) =>
        q.eq("toEntityId", page._id).eq("relationshipType", "created_by")
      )
      .first();

    const pageCreator = creatorConn
      ? await ctx.db.get(creatorConn.fromEntityId)
      : null;

    // Get modification history (from connections)
    const modifications = await ctx.db
      .query("connections")
      .withIndex("to_type", (q) =>
        q.eq("toEntityId", page._id).eq("relationshipType", "modified")
      )
      .collect();

    return {
      ...page,
      _connections: {
        website,
        creator: pageCreator,
        modifications: modifications.sort((a, b) => b.createdAt - a.createdAt),
      },
    };
  },
});

// ============================================================================
// GET PAGE BY PATH (for rendering)
// ============================================================================

export const getByPath = query({
  args: {
    websiteId: v.id("entities"),
    path: v.string(),
  },
  handler: async (ctx, args) => {
    // This query is for rendering pages (can be public or authenticated)

    // Get website
    const website = await ctx.db.get(args.websiteId);
    if (!website || website.type !== "website") {
      return null;
    }

    // Find page by path via connections
    const pageConnections = await ctx.db
      .query("connections")
      .withIndex("from_type", (q) =>
        q.eq("fromEntityId", args.websiteId).eq("relationshipType", "contains")
      )
      .collect();

    // Find the connection with matching path
    const targetConnection = pageConnections.find(
      (conn) => conn.metadata?.path === args.path
    );

    if (!targetConnection) {
      return null;
    }

    const page = await ctx.db.get(targetConnection.toEntityId);

    if (!page) {
      return null;
    }

    // For public rendering, only return published pages
    // (Skip this check if user is authenticated and owns the website)
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // Public access - only show published
      if (page.status !== "published" || website.status !== "published") {
        return null;
      }
    }

    return {
      ...page,
      _metadata: {
        websiteId: args.websiteId,
        websiteName: website.name,
        path: args.path,
      },
    };
  },
});
