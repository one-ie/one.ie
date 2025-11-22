import { v } from "convex/values";
import { query } from "../_generated/server";

/**
 * Deployment Queries
 *
 * Implements read operations for deployments following the 6-dimension ontology:
 * - ALWAYS filter by groupId (multi-tenant isolation)
 * - ALWAYS enrich with connections (parent website)
 * - Support filtering by websiteId and status
 */

// ============================================================================
// LIST DEPLOYMENTS
// ============================================================================

export const list = query({
  args: {
    websiteId: v.optional(v.id("entities")),
    status: v.optional(
      v.union(
        v.literal("deploying"),
        v.literal("live"),
        v.literal("failed")
      )
    ),
    environment: v.optional(
      v.union(
        v.literal("production"),
        v.literal("preview"),
        v.literal("development")
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
    let deploymentsQuery = ctx.db
      .query("entities")
      .withIndex("by_group_type", (q) =>
        q.eq("groupId", creator.groupId!).eq("type", "deployment")
      );

    // 3. APPLY FILTERS
    if (args.status) {
      deploymentsQuery = deploymentsQuery.filter((q) =>
        q.eq(q.field("status"), args.status)
      );
    }

    let deployments = await deploymentsQuery.collect();

    // Filter by websiteId (in properties)
    if (args.websiteId) {
      deployments = deployments.filter(
        (d) => d.properties.websiteId === args.websiteId
      );
    }

    // Filter by environment (in properties)
    if (args.environment) {
      deployments = deployments.filter(
        (d) => d.properties.environment === args.environment
      );
    }

    // Sort by creation date (newest first)
    deployments.sort((a, b) => b.createdAt - a.createdAt);

    // 4. LIMIT RESULTS
    if (args.limit) {
      deployments = deployments.slice(0, args.limit);
    }

    // 5. ENRICH WITH WEBSITE INFO
    const enriched = await Promise.all(
      deployments.map(async (deployment) => {
        const website = await ctx.db.get(deployment.properties.websiteId);

        return {
          ...deployment,
          _metadata: {
            websiteName: website?.name || "Unknown Website",
            duration: deployment.properties.completedAt
              ? deployment.properties.completedAt - deployment.properties.startedAt
              : Date.now() - deployment.properties.startedAt,
            isActive: deployment.status === "live",
          },
        };
      })
    );

    return enriched;
  },
});

// ============================================================================
// GET DEPLOYMENT
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

    // 2. GET DEPLOYMENT
    const deployment = await ctx.db.get(args.id);
    if (!deployment || deployment.type !== "deployment") {
      throw new Error("Deployment not found");
    }

    // 3. VERIFY ACCESS (must be in same group)
    if (deployment.groupId !== creator.groupId) {
      throw new Error("You do not have access to this deployment");
    }

    // 4. ENRICH WITH CONNECTIONS
    // Get parent website
    const website = await ctx.db.get(deployment.properties.websiteId);

    // Get creator
    const creatorConn = await ctx.db
      .query("connections")
      .withIndex("to_type", (q) =>
        q.eq("toEntityId", deployment._id).eq("relationshipType", "created_by")
      )
      .first();

    const deploymentCreator = creatorConn
      ? await ctx.db.get(creatorConn.fromEntityId)
      : null;

    return {
      ...deployment,
      _connections: {
        website,
        creator: deploymentCreator,
      },
      _metadata: {
        duration: deployment.properties.completedAt
          ? deployment.properties.completedAt - deployment.properties.startedAt
          : Date.now() - deployment.properties.startedAt,
        isActive: deployment.status === "live",
      },
    };
  },
});

// ============================================================================
// GET LATEST DEPLOYMENT FOR WEBSITE
// ============================================================================

export const getLatest = query({
  args: {
    websiteId: v.id("entities"),
    environment: v.optional(
      v.union(
        v.literal("production"),
        v.literal("preview"),
        v.literal("development")
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

    if (!creator || !creator.groupId) {
      return null;
    }

    // 2. GET WEBSITE AND VERIFY ACCESS
    const website = await ctx.db.get(args.websiteId);
    if (!website || website.type !== "website") {
      throw new Error("Website not found");
    }

    if (website.groupId !== creator.groupId) {
      throw new Error("You do not have access to this website");
    }

    // 3. GET DEPLOYMENTS
    let deployments = await ctx.db
      .query("entities")
      .withIndex("by_group_type", (q) =>
        q.eq("groupId", creator.groupId!).eq("type", "deployment")
      )
      .filter((q) => q.eq(q.field("properties.websiteId"), args.websiteId))
      .filter((q) => q.eq(q.field("status"), "live"))
      .collect();

    // Filter by environment if specified
    if (args.environment) {
      deployments = deployments.filter(
        (d) => d.properties.environment === args.environment
      );
    }

    // Sort by creation date (newest first)
    deployments.sort((a, b) => b.createdAt - a.createdAt);

    const latestDeployment = deployments[0] || null;

    if (!latestDeployment) {
      return null;
    }

    return {
      ...latestDeployment,
      _metadata: {
        websiteName: website.name,
        duration: latestDeployment.properties.completedAt
          ? latestDeployment.properties.completedAt - latestDeployment.properties.startedAt
          : null,
        isActive: true,
      },
    };
  },
});

// ============================================================================
// GET DEPLOYMENT HISTORY (for a website)
// ============================================================================

export const getHistory = query({
  args: {
    websiteId: v.id("entities"),
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

    // 2. GET WEBSITE AND VERIFY ACCESS
    const website = await ctx.db.get(args.websiteId);
    if (!website || website.type !== "website") {
      throw new Error("Website not found");
    }

    if (website.groupId !== creator.groupId) {
      throw new Error("You do not have access to this website");
    }

    // 3. GET ALL DEPLOYMENTS FOR THIS WEBSITE
    let deployments = await ctx.db
      .query("entities")
      .withIndex("by_group_type", (q) =>
        q.eq("groupId", creator.groupId!).eq("type", "deployment")
      )
      .filter((q) => q.eq(q.field("properties.websiteId"), args.websiteId))
      .collect();

    // Sort by creation date (newest first)
    deployments.sort((a, b) => b.createdAt - a.createdAt);

    // Limit results
    if (args.limit) {
      deployments = deployments.slice(0, args.limit);
    }

    // 4. ENRICH WITH METADATA
    const enriched = deployments.map((deployment) => ({
      ...deployment,
      _metadata: {
        duration: deployment.properties.completedAt
          ? deployment.properties.completedAt - deployment.properties.startedAt
          : Date.now() - deployment.properties.startedAt,
        isActive: deployment.status === "live",
        isLatest: deployment._id === deployments[0]._id,
      },
    }));

    return enriched;
  },
});
