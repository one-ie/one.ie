/**
 * Onboarding Mutations
 *
 * Handle website analysis, ontology generation, and onboarding state
 */

import { mutation } from "../_generated/server";
import { v } from "convex/values";

/**
 * Analyze website and map to universal ontology
 *
 * This is the main entry point called by the CLI
 */
export const analyzeWebsite = mutation({
  args: {
    name: v.string(),
    organizationName: v.string(),
    websiteUrl: v.string(),
    email: v.string(),
    installationSlug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Import services (dynamic to avoid bundling issues)
    const { runWebsiteAnalysis } = await import("../services/websiteAnalyzer");
    const { runOntologyMapping } = await import("../services/ontologyMapper");
    const { runBrandGuideGeneration } = await import("../services/brandGuideGenerator");
    const { runFeatureRecommendation } = await import("../services/featureRecommender");

    try {
      // 1. Analyze website
      const analysis = await runWebsiteAnalysis(args.websiteUrl);

      // 2. Map to universal ontology (does NOT create custom ontology)
      const { document: mappingDoc, markdown: mappingMarkdown } =
        await runOntologyMapping(analysis, args.organizationName);

      // 3. Generate brand guide
      const { guide: brandGuide, markdown: brandMarkdown } =
        await runBrandGuideGeneration(
          analysis.brand,
          args.organizationName,
          args.websiteUrl
        );

      // 4. Recommend features
      const recommendations = await runFeatureRecommendation(analysis.features);

      // 5. Create installation slug
      const installationSlug =
        args.installationSlug ||
        args.organizationName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      // 6. Return complete onboarding data
      return {
        success: true,
        data: {
          installationSlug,
          analysis: {
            url: analysis.url,
            brand: analysis.brand,
            features: analysis.features,
            businessModel: analysis.businessModel,
            analyzedAt: analysis.analyzedAt,
          },
          ontologyMapping: {
            document: mappingDoc,
            markdown: mappingMarkdown,
          },
          brandGuide: {
            guide: brandGuide,
            markdown: brandMarkdown,
          },
          recommendations: recommendations.map((r) => ({
            feature: r.feature,
            reason: r.reason,
            priority: r.priority,
          })),
        },
      };
    } catch (error) {
      console.error("Website analysis failed:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error during website analysis",
      };
    }
  },
});

/**
 * Create initial group for onboarding
 */
export const createOnboardingGroup = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    ownerEmail: v.string(),
    plan: v.optional(
      v.union(v.literal("starter"), v.literal("pro"), v.literal("enterprise"))
    ),
  },
  handler: async (ctx, args) => {
    // Check if group already exists
    const existing = await ctx.db
      .query("groups")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existing) {
      return {
        success: false,
        error: `Group with slug "${args.slug}" already exists`,
      };
    }

    // Create group
    const groupId = await ctx.db.insert("groups", {
      slug: args.slug,
      name: args.name,
      type: "organization",
      metadata: {
        ownerEmail: args.ownerEmail,
      },
      settings: {
        visibility: "private",
        joinPolicy: "invite_only",
        plan: args.plan || "starter",
        limits: {
          users: args.plan === "enterprise" ? 1000 : args.plan === "pro" ? 100 : 10,
          storage: args.plan === "enterprise" ? 1000 : args.plan === "pro" ? 100 : 10,
          apiCalls: args.plan === "enterprise" ? 1000000 : args.plan === "pro" ? 100000 : 10000,
        },
      },
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return {
      success: true,
      groupId,
    };
  },
});

/**
 * Log onboarding event
 */
export const logOnboardingEvent = mutation({
  args: {
    groupId: v.id("groups"),
    actorId: v.id("entities"),
    eventType: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("events", {
      groupId: args.groupId,
      type: args.eventType,
      actorId: args.actorId,
      timestamp: Date.now(),
      metadata: args.metadata || {},
    });

    return { success: true };
  },
});
