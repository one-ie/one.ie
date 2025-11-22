import { v } from "convex/values";
import { query } from "../_generated/server";

/**
 * Website Queries
 *
 * Implements read operations for websites following the 6-dimension ontology:
 * - ALWAYS filter by groupId (multi-tenant isolation)
 * - ALWAYS enrich with connections (pages, deployments)
 * - NO mutations in queries
 */

// ============================================================================
// LIST WEBSITES
// ============================================================================

export const list = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("active"),
        v.literal("published"),
        v.literal("archived")
      )
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

    // 2. FILTER BY GROUP (multi-tenant isolation)
    let websitesQuery = ctx.db
      .query("entities")
      .withIndex("by_group_type", (q) =>
        q.eq("groupId", creator.groupId!).eq("type", "website")
      );

    // 3. APPLY FILTERS
    if (args.status) {
      websitesQuery = websitesQuery.filter((q) => q.eq(q.field("status"), args.status));
    }

    // Exclude deleted websites
    websitesQuery = websitesQuery.filter((q) => q.eq(q.field("deletedAt"), undefined));

    let websites = await websitesQuery.collect();

    // 4. LIMIT RESULTS
    if (args.limit) {
      websites = websites.slice(0, args.limit);
    }

    // 5. ENRICH WITH METADATA
    const enriched = await Promise.all(
      websites.map(async (website) => {
        // Count pages
        const pages = await ctx.db
          .query("connections")
          .withIndex("from_type", (q) =>
            q.eq("fromEntityId", website._id).eq("relationshipType", "contains")
          )
          .collect();

        // Count deployments
        const deployments = await ctx.db
          .query("entities")
          .withIndex("by_group_type", (q) =>
            q.eq("groupId", creator.groupId!).eq("type", "deployment")
          )
          .filter((q) => q.eq(q.field("properties.websiteId"), website._id))
          .collect();

        // Get latest deployment
        const liveDeployments = deployments
          .filter((d) => d.status === "live")
          .sort((a, b) => b.createdAt - a.createdAt);

        return {
          ...website,
          _metadata: {
            pageCount: pages.length,
            deploymentCount: deployments.length,
            latestDeployment: liveDeployments[0] || null,
          },
        };
      })
    );

    return enriched;
  },
});

// ============================================================================
// GET WEBSITE
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

    // 2. GET WEBSITE
    const website = await ctx.db.get(args.id);
    if (!website || website.type !== "website") {
      throw new Error("Website not found");
    }

    // 3. VERIFY ACCESS (must be in same group)
    if (website.groupId !== creator.groupId) {
      throw new Error("You do not have access to this website");
    }

    // 4. ENRICH WITH CONNECTIONS
    // Get pages
    const pageConnections = await ctx.db
      .query("connections")
      .withIndex("from_type", (q) =>
        q.eq("fromEntityId", website._id).eq("relationshipType", "contains")
      )
      .collect();

    const pages = await Promise.all(
      pageConnections.map(async (conn) => {
        const page = await ctx.db.get(conn.toEntityId);
        return page;
      })
    );

    // Get deployments
    const deployments = await ctx.db
      .query("entities")
      .withIndex("by_group_type", (q) =>
        q.eq("groupId", website.groupId!).eq("type", "deployment")
      )
      .filter((q) => q.eq(q.field("properties.websiteId"), website._id))
      .collect();

    // Get latest live deployment
    const liveDeployments = deployments
      .filter((d) => d.status === "live")
      .sort((a, b) => b.createdAt - a.createdAt);

    // Get owner
    const ownerConnection = await ctx.db
      .query("connections")
      .withIndex("to_type", (q) =>
        q.eq("toEntityId", website._id).eq("relationshipType", "owns")
      )
      .first();

    const owner = ownerConnection
      ? await ctx.db.get(ownerConnection.fromEntityId)
      : null;

    return {
      ...website,
      _connections: {
        pages: pages.filter(Boolean),
        deployments: deployments.sort((a, b) => b.createdAt - a.createdAt),
        latestDeployment: liveDeployments[0] || null,
        owner,
      },
    };
  },
});

// ============================================================================
// GET WEBSITE BY SLUG/SUBDOMAIN
// ============================================================================

export const getBySubdomain = query({
  args: {
    subdomain: v.string(),
  },
  handler: async (ctx, args) => {
    // This query is for public access (no auth required)
    // Used for rendering the actual website

    // Find website by subdomain
    const website = await ctx.db
      .query("entities")
      .withIndex("by_type", (q) => q.eq("type", "website"))
      .filter((q) => q.eq(q.field("properties.subdomain"), args.subdomain))
      .first();

    if (!website) {
      return null;
    }

    // Only return published websites for public access
    if (website.status !== "published") {
      return null;
    }

    // Get pages
    const pageConnections = await ctx.db
      .query("connections")
      .withIndex("from_type", (q) =>
        q.eq("fromEntityId", website._id).eq("relationshipType", "contains")
      )
      .collect();

    const pages = await Promise.all(
      pageConnections.map(async (conn) => {
        const page = await ctx.db.get(conn.toEntityId);
        // Only return published pages
        if (page && page.status === "published") {
          return page;
        }
        return null;
      })
    );

    return {
      ...website,
      _connections: {
        pages: pages.filter(Boolean),
      },
    };
  },
});
