import { v } from "convex/values";
import { mutation } from "../_generated/server";

/**
 * Deployment Mutations
 *
 * Implements deployment operations following the 6-dimension ontology:
 * - Deployments are THINGS with type "deployment"
 * - ALWAYS connected to parent website
 * - ALWAYS log deployment events
 * - Track Cloudflare deployment status
 */

// ============================================================================
// CREATE DEPLOYMENT
// ============================================================================

export const create = mutation({
  args: {
    websiteId: v.id("entities"),
    environment: v.optional(
      v.union(v.literal("production"), v.literal("preview"), v.literal("development"))
    ),
    branch: v.optional(v.string()),
    commitMessage: v.optional(v.string()),
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

    // 2. VALIDATE WEBSITE
    const website = await ctx.db.get(args.websiteId);
    if (!website || website.type !== "website") {
      throw new Error("Website not found");
    }

    // Verify ownership
    const ownership = await ctx.db
      .query("connections")
      .withIndex("from_type", (q) =>
        q.eq("fromEntityId", creator._id).eq("relationshipType", "owns")
      )
      .filter((q) => q.eq(q.field("toEntityId"), args.websiteId))
      .first();

    if (!ownership) {
      throw new Error("You do not own this website");
    }

    // 3. CHECK GROUP LIMITS
    if (!website.groupId) {
      throw new Error("Website has no group assigned");
    }

    const group = await ctx.db.get(website.groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    if (group.usage.deployments >= group.limits.deployments) {
      throw new Error("Deployment limit reached. Please upgrade your plan.");
    }

    // 4. CREATE DEPLOYMENT ENTITY
    const now = Date.now();
    const environment = args.environment || "production";

    const deploymentId = await ctx.db.insert("entities", {
      type: "deployment",
      name: `${website.name} - ${environment} - ${new Date(now).toISOString()}`,
      groupId: website.groupId,
      properties: {
        websiteId: args.websiteId,
        environment: environment,
        branch: args.branch || "main",
        commitMessage: args.commitMessage || "Deploy via ONE Platform",
        deploymentStatus: "pending",
        buildLogs: [],
        startedAt: now,
        // Cloudflare-specific (will be populated by deployment process)
        cloudflare: {
          projectId: website.properties.cloudflare?.projectId,
          accountId: website.properties.cloudflare?.accountId,
          deploymentId: null,
        },
      },
      status: "deploying",
      createdAt: now,
      updatedAt: now,
    });

    // 5. CREATE CONNECTION: website → deployment
    await ctx.db.insert("connections", {
      fromEntityId: args.websiteId,
      toEntityId: deploymentId,
      relationshipType: "part_of",
      metadata: {
        environment: environment,
        deploymentType: "cloudflare_pages",
      },
      createdAt: now,
    });

    // Also create creator → deployment connection
    await ctx.db.insert("connections", {
      fromEntityId: creator._id,
      toEntityId: deploymentId,
      relationshipType: "created_by",
      metadata: {
        deployedVia: "website_builder",
      },
      createdAt: now,
    });

    // 6. UPDATE GROUP USAGE
    await ctx.db.patch(website.groupId, {
      usage: {
        ...group.usage,
        deployments: group.usage.deployments + 1,
      },
      updatedAt: now,
    });

    // 7. LOG EVENT
    await ctx.db.insert("events", {
      type: "deployment_started",
      actorId: creator._id,
      targetId: deploymentId,
      timestamp: now,
      metadata: {
        websiteId: args.websiteId,
        environment: environment,
        branch: args.branch || "main",
        groupId: website.groupId,
      },
    });

    // TODO: Trigger actual Cloudflare deployment process
    // This would be done via a separate action or webhook

    return deploymentId;
  },
});

// ============================================================================
// UPDATE DEPLOYMENT STATUS
// ============================================================================

export const updateStatus = mutation({
  args: {
    id: v.id("entities"),
    deploymentStatus: v.union(
      v.literal("pending"),
      v.literal("building"),
      v.literal("deploying"),
      v.literal("live"),
      v.literal("failed")
    ),
    url: v.optional(v.string()),
    buildLogs: v.optional(v.array(v.string())),
    error: v.optional(v.string()),
    cloudflareDeploymentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE (could be system user for webhooks)
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

    // 2. VALIDATE DEPLOYMENT
    const deployment = await ctx.db.get(args.id);
    if (!deployment || deployment.type !== "deployment") {
      throw new Error("Deployment not found");
    }

    // 3. UPDATE DEPLOYMENT
    const now = Date.now();
    const updates: any = {
      updatedAt: now,
    };

    // Update status
    if (args.deploymentStatus === "live") {
      updates.status = "live";
    } else if (args.deploymentStatus === "failed") {
      updates.status = "failed";
    } else {
      updates.status = "deploying";
    }

    // Update properties
    const propertyUpdates: any = {
      ...deployment.properties,
      deploymentStatus: args.deploymentStatus,
    };

    if (args.url) {
      propertyUpdates.url = args.url;
    }

    if (args.buildLogs) {
      propertyUpdates.buildLogs = args.buildLogs;
    }

    if (args.error) {
      propertyUpdates.error = args.error;
    }

    if (args.cloudflareDeploymentId) {
      propertyUpdates.cloudflare = {
        ...propertyUpdates.cloudflare,
        deploymentId: args.cloudflareDeploymentId,
      };
    }

    // Set completion time if deployment is done
    if (args.deploymentStatus === "live" || args.deploymentStatus === "failed") {
      propertyUpdates.completedAt = now;
      propertyUpdates.duration = now - deployment.properties.startedAt;
    }

    updates.properties = propertyUpdates;

    await ctx.db.patch(args.id, updates);

    // 4. LOG EVENT
    const eventType =
      args.deploymentStatus === "live"
        ? "deployment_completed"
        : args.deploymentStatus === "failed"
          ? "deployment_failed"
          : "entity_updated";

    await ctx.db.insert("events", {
      type: eventType,
      actorId: creator._id,
      targetId: args.id,
      timestamp: now,
      metadata: {
        deploymentStatus: args.deploymentStatus,
        url: args.url,
        error: args.error,
        duration: propertyUpdates.duration,
        websiteId: deployment.properties.websiteId,
      },
    });

    return args.id;
  },
});

// ============================================================================
// ROLLBACK DEPLOYMENT
// ============================================================================

export const rollback = mutation({
  args: {
    websiteId: v.id("entities"),
    targetDeploymentId: v.id("entities"), // Deployment to roll back to
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

    // 2. VALIDATE WEBSITE AND DEPLOYMENT
    const website = await ctx.db.get(args.websiteId);
    if (!website || website.type !== "website") {
      throw new Error("Website not found");
    }

    const targetDeployment = await ctx.db.get(args.targetDeploymentId);
    if (!targetDeployment || targetDeployment.type !== "deployment") {
      throw new Error("Target deployment not found");
    }

    if (targetDeployment.status !== "live") {
      throw new Error("Can only roll back to live deployments");
    }

    // Verify ownership
    const ownership = await ctx.db
      .query("connections")
      .withIndex("from_type", (q) =>
        q.eq("fromEntityId", creator._id).eq("relationshipType", "owns")
      )
      .filter((q) => q.eq(q.field("toEntityId"), args.websiteId))
      .first();

    if (!ownership) {
      throw new Error("You do not own this website");
    }

    // 3. CREATE NEW DEPLOYMENT (rollback deployment)
    const now = Date.now();
    const rollbackDeploymentId = await ctx.db.insert("entities", {
      type: "deployment",
      name: `${website.name} - Rollback to ${new Date(targetDeployment.createdAt).toISOString()}`,
      groupId: website.groupId,
      properties: {
        websiteId: args.websiteId,
        environment: targetDeployment.properties.environment,
        branch: targetDeployment.properties.branch,
        commitMessage: `Rollback to deployment ${args.targetDeploymentId}`,
        deploymentStatus: "pending",
        buildLogs: [],
        startedAt: now,
        rollbackFrom: targetDeployment._id,
        cloudflare: {
          projectId: website.properties.cloudflare?.projectId,
          accountId: website.properties.cloudflare?.accountId,
          deploymentId: null,
        },
      },
      status: "deploying",
      createdAt: now,
      updatedAt: now,
    });

    // 4. CREATE CONNECTIONS
    await ctx.db.insert("connections", {
      fromEntityId: args.websiteId,
      toEntityId: rollbackDeploymentId,
      relationshipType: "part_of",
      metadata: {
        environment: targetDeployment.properties.environment,
        deploymentType: "rollback",
      },
      createdAt: now,
    });

    // 5. LOG EVENT
    await ctx.db.insert("events", {
      type: "deployment_started",
      actorId: creator._id,
      targetId: rollbackDeploymentId,
      timestamp: now,
      metadata: {
        websiteId: args.websiteId,
        rollbackTo: args.targetDeploymentId,
        environment: targetDeployment.properties.environment,
        groupId: website.groupId,
      },
    });

    return rollbackDeploymentId;
  },
});
