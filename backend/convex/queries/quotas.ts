import { query } from "../_generated/server";
import { v } from "convex/values";
import type { QueryCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import type { Doc } from "../_generated/dataModel";

/**
 * PHASE 3: QUOTA ENFORCEMENT QUERIES
 *
 * Queries to check usage quotas and verify operations won't exceed limits
 *
 * Patterns:
 * - getGroupQuotas: Current usage for all metrics
 * - checkCanCreateEntities: Can we create N items before hitting limit?
 * - checkCanStore: Can we store N bytes before hitting limit?
 * - getQuotaStatus: Human-readable quota status
 * - getUpgradePricing: Plan upgrade pricing information
 *
 * Convex 1.5+ Patterns:
 * - Use .withIndex() for efficient lookups
 * - Filter in code after .collect() (NOT chained to index)
 * - No ctx.runQuery() - call helper functions directly
 * - All price calculations use number types
 *
 * Performance:
 * - < 50ms for quota lookups (cached index)
 * - < 100ms for full quota check with calculations
 */

/**
 * Quota metric definitions
 * Maps metric names to their limits by plan
 */
const QUOTA_LIMITS = {
  starter: {
    users: 5,
    storage_gb: 1,
    api_calls_per_month: 1000,
    entities_total: 100,
    connections_total: 500,
    events_retention_days: 90
  },
  pro: {
    users: 50,
    storage_gb: 100,
    api_calls_per_month: 100000,
    entities_total: 10000,
    connections_total: 50000,
    events_retention_days: 365
  },
  enterprise: {
    users: Infinity,
    storage_gb: Infinity,
    api_calls_per_month: Infinity,
    entities_total: Infinity,
    connections_total: Infinity,
    events_retention_days: Infinity
  }
};

/**
 * HELPER: Calculate group quotas (shared logic between queries)
 *
 * This is extracted as a reusable function so both getGroupQuotas query
 * and getQuotaStatus query can use the same calculation logic.
 */
async function getGroupQuotasHandler(ctx: QueryCtx, args: { groupId: Id<"groups"> }) {
  // 1. GET GROUP AND PLAN
  const group = await ctx.db.get(args.groupId);
  if (!group) {
    throw new Error("Group not found");
  }

  const plan = (group.settings?.plan || "starter") as keyof typeof QUOTA_LIMITS;
  const limits = QUOTA_LIMITS[plan];

  // 2. COUNT USERS (members - count user entities in group)
  // Correct Convex 1.5+ pattern: collect first, then filter in code
  const allEntities = await ctx.db
    .query("entities")
    .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
    .collect();
  const userEntities = allEntities.filter((e) => e.type === "user");
  const userCount = userEntities.length;

  // 3. CALCULATE STORAGE (reuse allEntities from step 2)
  const storageBytes = allEntities.reduce((sum: number, e: Doc<"entities">) => {
    const json = JSON.stringify(e.properties);
    return sum + (1024 + json.length); // 1KB base + properties size
  }, 0);
  const storageGB = storageBytes / (1024 * 1024 * 1024);

  // Add knowledge embeddings storage
  const knowledge = await ctx.db
    .query("knowledge")
    .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
    .collect();

  const embeddingStorageBytes = knowledge.reduce((sum: number, k: Doc<"knowledge">) => {
    if (k.embedding) {
      // Each embedding is array of numbers (typically 1536 or 3072 dimensions)
      // Rough: 8 bytes per number
      return sum + (k.embedding.length * 8);
    }
    return sum;
  }, 0);

  const totalStorageGB = (storageBytes + embeddingStorageBytes) / (1024 * 1024 * 1024);

  // 4. COUNT API CALLS THIS MONTH
  const now = Date.now();
  const monthAgo = now - 30 * 24 * 60 * 60 * 1000;

  const monthlyEvents = await ctx.db
    .query("events")
    .withIndex("group_timestamp", (q) =>
      q.eq("groupId", args.groupId).gt("timestamp", monthAgo)
    )
    .collect();

  // Count payment events as API calls
  const apiCallCount = monthlyEvents.filter((e) => e.type === "payment_processed").length;

  // 5. COUNT ENTITIES AND CONNECTIONS
  const entityCount = allEntities.length;

  const connections = await ctx.db
    .query("connections")
    .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
    .collect();
  const connectionCount = connections.length;

  // 6. BUILD QUOTA STATUS
  const quotas = {
    users: {
      current: userCount,
      limit: limits.users,
      percentUsed: limits.users === Infinity ? 0 : Math.round((userCount / limits.users) * 100),
      status: limits.users === Infinity ? "unlimited" :
        userCount >= limits.users ? "exceeded" :
          userCount >= limits.users * 0.95 ? "critical" :
            userCount >= limits.users * 0.8 ? "warning" : "ok"
    },
    storage_gb: {
      current: Math.round(totalStorageGB * 100) / 100,
      limit: limits.storage_gb,
      percentUsed: limits.storage_gb === Infinity ? 0 : Math.round((totalStorageGB / limits.storage_gb) * 100),
      status: limits.storage_gb === Infinity ? "unlimited" :
        totalStorageGB >= limits.storage_gb ? "exceeded" :
          totalStorageGB >= limits.storage_gb * 0.95 ? "critical" :
            totalStorageGB >= limits.storage_gb * 0.8 ? "warning" : "ok"
    },
    api_calls_per_month: {
      current: apiCallCount,
      limit: limits.api_calls_per_month,
      percentUsed: limits.api_calls_per_month === Infinity ? 0 : Math.round((apiCallCount / limits.api_calls_per_month) * 100),
      status: limits.api_calls_per_month === Infinity ? "unlimited" :
        apiCallCount >= limits.api_calls_per_month ? "exceeded" :
          apiCallCount >= limits.api_calls_per_month * 0.95 ? "critical" :
            apiCallCount >= limits.api_calls_per_month * 0.8 ? "warning" : "ok"
    },
    entities_total: {
      current: entityCount,
      limit: limits.entities_total,
      percentUsed: limits.entities_total === Infinity ? 0 : Math.round((entityCount / limits.entities_total) * 100),
      status: limits.entities_total === Infinity ? "unlimited" :
        entityCount >= limits.entities_total ? "exceeded" :
          entityCount >= limits.entities_total * 0.95 ? "critical" :
            entityCount >= limits.entities_total * 0.8 ? "warning" : "ok"
    },
    connections_total: {
      current: connectionCount,
      limit: limits.connections_total,
      percentUsed: limits.connections_total === Infinity ? 0 : Math.round((connectionCount / limits.connections_total) * 100),
      status: limits.connections_total === Infinity ? "unlimited" :
        connectionCount >= limits.connections_total ? "exceeded" :
          connectionCount >= limits.connections_total * 0.95 ? "critical" :
            connectionCount >= limits.connections_total * 0.8 ? "warning" : "ok"
    },
    events_retention_days: {
      current: 90, // Would calculate from archival timestamps
      limit: limits.events_retention_days,
      percentUsed: limits.events_retention_days === Infinity ? 0 : 0,
      status: "ok"
    }
  };

  type QuotaEntry = typeof quotas[keyof typeof quotas];

  return {
    groupId: args.groupId,
    plan,
    quotas,
    warnings: Object.entries(quotas)
      .filter(([_, q]) => q.status === "warning" || q.status === "critical")
      .map(([metric, q]) => ({
        metric,
        current: q.current,
        limit: q.limit,
        percentUsed: q.percentUsed,
        status: q.status
      })),
    summary: {
      allOk: Object.values(quotas).every((q: QuotaEntry) => q.status === "ok" || q.status === "unlimited"),
      warningCount: Object.values(quotas).filter((q: QuotaEntry) => q.status === "warning").length,
      criticalCount: Object.values(quotas).filter((q: QuotaEntry) => q.status === "critical").length,
      exceededCount: Object.values(quotas).filter((q: QuotaEntry) => q.status === "exceeded").length
    }
  };
}

/**
 * Get current usage for all metrics in a group
 *
 * Returns:
 * - Current value for each metric
 * - Limit for each metric (based on group plan)
 * - Percentage used
 * - Warning level (80%+) or critical (95%+)
 *
 * Metrics tracked:
 * - users: COUNT of user entities in group
 * - storage_gb: SUM of entity storage + knowledge embeddings
 * - api_calls_per_month: COUNT of payment_processed events this month
 * - entities_total: COUNT of entities in group
 * - connections_total: COUNT of connections in group
 */
export const getGroupQuotas = query({
  args: {
    groupId: v.id("groups")
  },
  handler: async (ctx, args) => {
    // Delegate to helper function that computes all quotas
    return await getGroupQuotasHandler(ctx, { groupId: args.groupId });
  }
});

/**
 * Check if creating N items would exceed entity quota
 *
 * Returns:
 * - canCreate: boolean
 * - reason: why not (if applicable)
 * - availableSlots: how many more can be created
 * - suggestion: upgrade plan if needed
 *
 * Used before batch operations to fail-fast
 */
export const checkCanCreateEntities = query({
  args: {
    groupId: v.id("groups"),
    count: v.number() // How many items we want to create
  },
  handler: async (ctx, args) => {
    // Get group and plan
    const group = await ctx.db.get(args.groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    const plan = (group.settings?.plan || "starter") as keyof typeof QUOTA_LIMITS;
    const limits = QUOTA_LIMITS[plan];

    // Count current entities
    const entities = await ctx.db
      .query("entities")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    const currentCount = entities.length;
    const limit = limits.entities_total;

    // Check if we can create
    const canCreate = currentCount + args.count <= limit;
    const availableSlots = limit === Infinity ? Infinity : Math.max(0, limit - currentCount);

    return {
      canCreate,
      requested: args.count,
      current: currentCount,
      limit,
      availableSlots,
      utilization: limit === Infinity ? 0 : Math.round((currentCount / limit) * 100),
      reason: !canCreate
        ? `Cannot create ${args.count} entities. Current: ${currentCount}, Limit: ${limit === Infinity ? "unlimited" : limit}, Available: ${availableSlots}`
        : undefined,
      suggestion: !canCreate && plan !== "enterprise"
        ? `Upgrade to ${plan === "starter" ? "pro" : "enterprise"} plan for more capacity`
        : undefined
    };
  }
});

/**
 * Check if storing N bytes would exceed storage quota
 *
 * Returns:
 * - canStore: boolean
 * - reason: why not (if applicable)
 * - availableBytes: how much more can be stored
 */
export const checkCanStore = query({
  args: {
    groupId: v.id("groups"),
    bytes: v.number()
  },
  handler: async (ctx, args) => {
    // Get group and plan
    const group = await ctx.db.get(args.groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    const plan = (group.settings?.plan || "starter") as keyof typeof QUOTA_LIMITS;
    const limits = QUOTA_LIMITS[plan];

    // Calculate current storage
    const entities = await ctx.db
      .query("entities")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    const storageBytes = entities.reduce((sum, e) => {
      const json = JSON.stringify(e.properties);
      return sum + (1024 + json.length);
    }, 0);

    // Add knowledge embeddings
    const knowledge = await ctx.db
      .query("knowledge")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    const embeddingBytes = knowledge.reduce((sum, k) => {
      if (k.embedding) {
        return sum + (k.embedding.length * 8);
      }
      return sum;
    }, 0);

    const currentBytes = storageBytes + embeddingBytes;
    const limitBytes = limits.storage_gb * (1024 * 1024 * 1024);

    // Check if we can store
    const canStore = currentBytes + args.bytes <= limitBytes;
    const availableBytes = limitBytes === Infinity ? Infinity : Math.max(0, limitBytes - currentBytes);

    return {
      canStore,
      requested: args.bytes,
      requestedMB: Math.round(args.bytes / (1024 * 1024) * 100) / 100,
      current: currentBytes,
      currentGB: Math.round(currentBytes / (1024 * 1024 * 1024) * 100) / 100,
      limit: limitBytes,
      limitGB: limits.storage_gb === Infinity ? Infinity : limits.storage_gb,
      availableBytes,
      availableGB: availableBytes === Infinity ? Infinity : Math.round(availableBytes / (1024 * 1024 * 1024) * 100) / 100,
      utilization: limitBytes === Infinity ? 0 : Math.round((currentBytes / limitBytes) * 100),
      reason: !canStore
        ? `Cannot store ${Math.round(args.bytes / (1024 * 1024))} MB. Current: ${Math.round(currentBytes / (1024 * 1024 * 1024))} GB, Limit: ${limits.storage_gb === Infinity ? "unlimited" : limits.storage_gb} GB, Available: ${availableBytes === Infinity ? "unlimited" : Math.round(availableBytes / (1024 * 1024 * 1024))} GB`
        : undefined,
      suggestion: !canStore && plan !== "enterprise"
        ? `Upgrade to ${plan === "starter" ? "pro" : "enterprise"} plan for more storage`
        : undefined
    };
  }
});

/**
 * Get human-readable quota status
 *
 * Shows current usage, warnings, and recommendations
 *
 * NOTE: This query calls getGroupQuotas internally by calling the handler logic.
 * We cannot use ctx.runQuery() in Convex 1.5+, so we inline the calculation
 * and extract the status summary.
 */
export const getQuotaStatus = query({
  args: {
    groupId: v.id("groups")
  },
  handler: async (ctx, args) => {
    // Get detailed quotas by calling the internal logic
    const quotaResult = await getGroupQuotasHandler(ctx, args);

    return {
      group: {
        id: quotaResult.groupId,
        plan: quotaResult.plan
      },
      status: quotaResult.summary.exceededCount > 0 ? "exceeded" :
        quotaResult.summary.criticalCount > 0 ? "critical" :
          quotaResult.summary.warningCount > 0 ? "warning" : "healthy",
      metrics: quotaResult.quotas,
      warnings: quotaResult.warnings,
      recommendations: generateRecommendations(quotaResult),
      lastUpdated: Date.now()
    };
  }
});

/**
 * Get quota upgrade pricing info
 *
 * Shows cost to upgrade plan
 */
export const getUpgradePricing = query({
  args: {
    currentPlan: v.union(v.literal("starter"), v.literal("pro"), v.literal("enterprise"))
  },
  handler: async (ctx, args) => {
    // Pricing data with consistent number types (custom pricing shown as null/contact sales)
    const pricing: Record<string, { name: string; monthlyPrice: number | null; annualPrice: number | null; quotas: typeof QUOTA_LIMITS[keyof typeof QUOTA_LIMITS] }> = {
      starter: {
        name: "Starter",
        monthlyPrice: 0,
        annualPrice: 0,
        quotas: QUOTA_LIMITS.starter
      },
      pro: {
        name: "Pro",
        monthlyPrice: 49,
        annualPrice: 490,
        quotas: QUOTA_LIMITS.pro
      },
      enterprise: {
        name: "Enterprise",
        monthlyPrice: null, // null indicates "custom pricing"
        annualPrice: null,
        quotas: QUOTA_LIMITS.enterprise
      }
    };

    const plans = ["starter", "pro", "enterprise"] as const;
    const currentIndex = plans.indexOf(args.currentPlan);

    // Helper to safely extract numeric price
    const getPrice = (price: number | null): number => price === null ? 0 : price;

    return {
      current: pricing[args.currentPlan],
      upgrades: plans
        .slice(currentIndex + 1)
        .map(plan => {
          const currentPrice = getPrice(pricing[args.currentPlan].monthlyPrice);
          const upgradedPrice = getPrice(pricing[plan].monthlyPrice);

          return {
            plan,
            ...pricing[plan],
            upgrade: {
              monthlyDifference: pricing[plan].monthlyPrice === null
                ? null // Cannot calculate - enterprise has custom pricing
                : upgradedPrice - currentPrice,
              annualDifference: pricing[plan].annualPrice === null
                ? null // Cannot calculate - enterprise has custom pricing
                : (pricing[plan].annualPrice || 0) - (pricing[args.currentPlan].annualPrice || 0)
            }
          };
        })
    };
  }
});

/**
 * Generate upgrade recommendations based on current usage
 */
function generateRecommendations(
  quotas: Awaited<ReturnType<typeof getGroupQuotasHandler>>
): string[] {
  const recommendations: string[] = [];

  // Check for critical metrics
  for (const [metric, q] of Object.entries(quotas.quotas)) {
    if (q.status === "exceeded") {
      recommendations.push(`CRITICAL: ${metric} limit exceeded. Upgrade plan required.`);
    } else if (q.status === "critical") {
      recommendations.push(`WARNING: ${metric} at ${q.percentUsed}% capacity. Consider upgrading.`);
    }
  }

  // Plan-specific recommendations
  if (quotas.plan === "starter") {
    if (quotas.summary.warningCount > 0) {
      recommendations.push("Consider upgrading to Pro plan for 10x more capacity.");
    }
  } else if (quotas.plan === "pro") {
    if (quotas.summary.criticalCount > 0 || quotas.summary.exceededCount > 0) {
      recommendations.push("Contact sales for Enterprise plan (unlimited quotas).");
    }
  }

  // No warnings
  if (recommendations.length === 0) {
    recommendations.push("All quotas healthy. Keep monitoring usage.");
  }

  return recommendations;
}
