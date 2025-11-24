import { mutation, internalMutation } from "../_generated/server";
import { v } from "convex/values";

/**
 * PHASE 3: USAGE TRACKING HELPERS
 *
 * Internal mutations to record usage for quota tracking
 * Called after operations that consume resources
 */

/**
 * Record a usage metric for quota tracking
 *
 * Called after:
 * - Entity creation (entities_total)
 * - Connection creation (connections_total)
 * - Storage upload (storage_gb)
 * - API call (api_calls_per_month)
 */
export const recordUsage = internalMutation({
  args: {
    groupId: v.id("groups"),
    metric: v.string(), // "users", "storage_gb", "api_calls_per_month", "entities_total", "connections_total"
    amount: v.number(), // Amount to add (usually 1 for counts, bytes for storage)
    period: v.optional(v.string()), // "daily", "monthly", "annual" - defaults to metric type
  },
  handler: async (ctx, args) => {
    // 1. FIND OR CREATE USAGE RECORD FOR THIS PERIOD
    const periodType = args.period || getPeriodForMetric(args.metric);
    const periodBounds = getPeriodBounds(periodType);

    const existing = await ctx.db
      .query("usage")
      .withIndex("by_group_metric_time", (q) =>
        q
          .eq("groupId", args.groupId)
          .eq("metric", args.metric)
          .eq("timestamp", Math.floor(Date.now() / 1000) * 1000) // Today's bucket
      )
      .first();

    if (existing) {
      // 2. INCREMENT EXISTING RECORD
      await ctx.db.patch(existing._id, {
        value: existing.value + args.amount,
        timestamp: Date.now()
      });

      return {
        action: "updated",
        metric: args.metric,
        newValue: existing.value + args.amount
      };
    } else {
      // 3. CREATE NEW RECORD
      const usageId = await ctx.db.insert("usage", {
        groupId: args.groupId,
        metric: args.metric,
        period: periodType,
        value: args.amount,
        limit: getQuotaLimitForMetric(args.metric), // Would fetch from group plan
        timestamp: Date.now(),
        periodStart: periodBounds.start,
        periodEnd: periodBounds.end
      });

      return {
        action: "created",
        metric: args.metric,
        value: args.amount,
        usageId
      };
    }
  }
});

/**
 * Check quota before operation
 *
 * Throws error if operation would exceed quota
 * Used in batch operations to prevent partial failures
 */
export const enforceQuota = mutation({
  args: {
    groupId: v.id("groups"),
    metric: v.string(),
    requestedAmount: v.number()
  },
  handler: async (ctx, args) => {
    // Get current usage
    const usage = await ctx.db
      .query("usage")
      .withIndex("by_group_metric", (q) =>
        q.eq("groupId", args.groupId).eq("metric", args.metric)
      )
      .first();

    const currentValue = usage?.value || 0;
    const limit = usage?.limit || getQuotaLimitForMetric(args.metric);

    // Check if would exceed
    if (currentValue + args.requestedAmount > limit) {
      throw new Error(
        `Quota exceeded for ${args.metric}: current=${currentValue}, requested=${args.requestedAmount}, limit=${limit}`
      );
    }

    return {
      metric: args.metric,
      current: currentValue,
      requested: args.requestedAmount,
      limit,
      available: limit - currentValue,
      canProceed: true
    };
  }
});

/**
 * Reset monthly/daily counters
 *
 * Called daily for daily metrics, monthly for monthly metrics
 */
export const resetPeriodCounter = internalMutation({
  args: {
    groupId: v.id("groups"),
    metric: v.string(),
    period: v.string()
  },
  handler: async (ctx, args) => {
    // Find all records for this metric/period that are expired
    const periodBounds = getPeriodBounds(args.period);

    // Fetch all records for this metric and filter in JavaScript
    const allRecords = await ctx.db
      .query("usage")
      .withIndex("by_group_metric", (q) =>
        q.eq("groupId", args.groupId).eq("metric", args.metric)
      )
      .collect();

    // Filter for expired records (where periodEnd < now)
    const expired = allRecords.filter(u =>
      u.periodEnd !== undefined && u.periodEnd < Date.now()
    );

    // Delete expired records and create new one for new period
    let resetCount = 0;
    for (const record of expired) {
      // Archive old record (optional)
      await ctx.db.delete(record._id);
      resetCount++;
    }

    // Create new record for this period
    if (resetCount > 0) {
      await ctx.db.insert("usage", {
        groupId: args.groupId,
        metric: args.metric,
        period: args.period,
        value: 0,
        limit: getQuotaLimitForMetric(args.metric),
        timestamp: Date.now(),
        periodStart: periodBounds.start,
        periodEnd: periodBounds.end
      });
    }

    return {
      metric: args.metric,
      period: args.period,
      recordsReset: resetCount
    };
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Determine period type for a metric
 */
function getPeriodForMetric(metric: string): string {
  if (metric === "api_calls_per_month" || metric === "revenue_per_month") {
    return "monthly";
  }
  if (metric === "entities_total" || metric === "connections_total" || metric === "users") {
    return "annual"; // These are cumulative
  }
  return "daily"; // Default to daily for most metrics
}

/**
 * Get period start/end timestamps
 */
function getPeriodBounds(period: string): { start: number; end: number } {
  const now = new Date();

  if (period === "daily") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start: start.getTime(), end: end.getTime() };
  }

  if (period === "monthly") {
    const start = new Date(now);
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    return { start: start.getTime(), end: end.getTime() };
  }

  // annual or other
  const start = new Date(now);
  start.setMonth(0);
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setFullYear(end.getFullYear() + 1);
  return { start: start.getTime(), end: end.getTime() };
}

/**
 * Get quota limit for a metric
 * In production, this would fetch from group's plan settings
 */
function getQuotaLimitForMetric(metric: string): number {
  const limits: Record<string, number> = {
    users: 50,
    storage_gb: 100,
    api_calls_per_month: 100000,
    entities_total: 10000,
    connections_total: 50000,
  };

  return limits[metric] || 1000;
}
