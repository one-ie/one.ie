/**
 * Vesting Queries - Token Vesting Schedule Reads
 *
 * Convex queries for reading token vesting schedules on Sui blockchain.
 * These are thin wrappers around VestingService (Effect.ts business logic).
 *
 * Follows 6-dimension ontology:
 * - THINGS: vesting_schedule (type: "vesting_schedule")
 * - CONNECTIONS: vested_to (schedule → beneficiary)
 *
 * @module queries/sui/vesting
 * @version 1.0.0
 */

import { v } from "convex/values";
import { query } from "../../_generated/server";
import {
  calculateVestedAmount as calculateVestedAmountService,
  getVestingSchedules as getVestingSchedulesService,
} from "../../services/sui/VestingService";
import type { VestingScheduleEntity } from "../../services/sui/VestingService";

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get vesting schedule by ID
 *
 * Returns full vesting schedule details including timeline, amounts,
 * and current claimed status.
 *
 * @param scheduleId - Vesting schedule thing ID
 *
 * @returns VestingScheduleEntity or null if not found
 *
 * @example
 * const schedule = await ctx.runQuery(api.queries.sui.vesting.getSchedule, {
 *   scheduleId: "j97abc...",
 * });
 * // {
 * //   _id: "j97abc...",
 * //   type: "vesting_schedule",
 * //   name: "Vesting: Alice - TOKEN (1000000)",
 * //   properties: {
 * //     tokenId: "j97def...",
 * //     beneficiaryId: "j97ghi...",
 * //     totalAmount: "1000000",
 * //     claimedAmount: "250000",
 * //     cliffEnd: 1704067200000,
 * //     vestingEnd: 1735689600000,
 * //   },
 * //   status: "active",
 * //   ...
 * // }
 */
export const getSchedule = query({
  args: {
    scheduleId: v.id("things"),
  },
  handler: async (ctx, args): Promise<VestingScheduleEntity | null> => {
    // Fetch schedule directly from database
    const schedule = await ctx.db.get(args.scheduleId);

    // Validate type
    if (!schedule || schedule.type !== "vesting_schedule") {
      return null;
    }

    return schedule as VestingScheduleEntity;
  },
});

/**
 * Get vesting schedules for a beneficiary
 *
 * Returns all vesting schedules where the specified user (or current user)
 * is the beneficiary.
 *
 * @param beneficiaryId - Optional beneficiary thing ID (defaults to current user)
 *
 * @returns Array of VestingScheduleEntity
 *
 * @example
 * // Get current user's vesting schedules
 * const schedules = await ctx.runQuery(api.queries.sui.vesting.getByBeneficiary, {});
 *
 * // Get specific user's vesting schedules
 * const schedules = await ctx.runQuery(api.queries.sui.vesting.getByBeneficiary, {
 *   beneficiaryId: "j97abc...",
 * });
 */
export const getByBeneficiary = query({
  args: {
    beneficiaryId: v.optional(v.id("things")),
  },
  handler: async (ctx, args): Promise<VestingScheduleEntity[]> => {
    let targetBeneficiaryId = args.beneficiaryId;

    // If no beneficiaryId provided, use current authenticated user
    if (!targetBeneficiaryId) {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new Error("Not authenticated");
      }

      // Find person thing from identity
      const person = await ctx.db
        .query("things")
        .filter((q) => q.eq(q.field("properties.email"), identity.email))
        .first();

      if (!person) {
        throw new Error("User not found");
      }

      targetBeneficiaryId = person._id;
    }

    // Call service to get schedules
    try {
      const schedules = await getVestingSchedulesService(ctx, targetBeneficiaryId);
      return schedules;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get vesting schedules: ${error.message}`);
      }
      throw error;
    }
  },
});

/**
 * Calculate vested amount at a given timestamp
 *
 * Pure calculation based on vesting schedule parameters.
 * Does NOT execute claim or modify database.
 *
 * @param scheduleId - Vesting schedule thing ID
 * @param timestamp - Optional timestamp (defaults to now)
 *
 * @returns { vestedAmount: number, claimableAmount: number }
 *
 * @example
 * const result = await ctx.runQuery(api.queries.sui.vesting.calculateVested, {
 *   scheduleId: "j97abc...",
 * });
 * // {
 * //   vestedAmount: 500000,    // Total vested so far
 * //   claimableAmount: 250000  // Available to claim (vested - claimed)
 * // }
 *
 * // Calculate vested amount at specific timestamp
 * const futureResult = await ctx.runQuery(api.queries.sui.vesting.calculateVested, {
 *   scheduleId: "j97abc...",
 *   timestamp: Date.now() + 86400000 * 30, // 30 days from now
 * });
 */
export const calculateVested = query({
  args: {
    scheduleId: v.id("things"),
    timestamp: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<{ vestedAmount: number; claimableAmount: number }> => {
    // Fetch schedule to get claimed amount
    const schedule = await ctx.db.get(args.scheduleId);

    if (!schedule || schedule.type !== "vesting_schedule") {
      throw new Error("Vesting schedule not found");
    }

    // Calculate vested amount using service
    try {
      const vestedAmount = await calculateVestedAmountService(ctx, {
        scheduleId: args.scheduleId,
        timestamp: args.timestamp,
      });

      // Calculate claimable (vested - claimed)
      const claimedAmount = parseFloat(schedule.properties.claimedAmount || "0");
      const claimableAmount = Math.max(0, vestedAmount - claimedAmount);

      return {
        vestedAmount,
        claimableAmount,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to calculate vested amount: ${error.message}`);
      }
      throw error;
    }
  },
});

/**
 * Get claimable amount for a schedule
 *
 * Convenience query that returns only the amount the user can claim now.
 * Equivalent to calculateVested().claimableAmount.
 *
 * @param scheduleId - Vesting schedule thing ID
 *
 * @returns number - Claimable amount (vested - claimed)
 *
 * @example
 * const claimable = await ctx.runQuery(api.queries.sui.vesting.getClaimableAmount, {
 *   scheduleId: "j97abc...",
 * });
 * // 250000
 */
export const getClaimableAmount = query({
  args: {
    scheduleId: v.id("things"),
  },
  handler: async (ctx, args): Promise<number> => {
    // Fetch schedule
    const schedule = await ctx.db.get(args.scheduleId);

    if (!schedule || schedule.type !== "vesting_schedule") {
      throw new Error("Vesting schedule not found");
    }

    // Calculate vested amount at current time
    try {
      const vestedAmount = await calculateVestedAmountService(ctx, {
        scheduleId: args.scheduleId,
        timestamp: Date.now(),
      });

      // Calculate claimable (vested - claimed)
      const claimedAmount = parseFloat(schedule.properties.claimedAmount || "0");
      const claimableAmount = Math.max(0, vestedAmount - claimedAmount);

      return claimableAmount;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get claimable amount: ${error.message}`);
      }
      throw error;
    }
  },
});

/**
 * Get all vesting schedules (admin/debug)
 *
 * Returns all vesting schedules in the system. Useful for admin dashboards.
 * In production, this should be restricted to admin users.
 *
 * @param status - Optional filter by status
 * @param limit - Optional limit on results (default: 100)
 *
 * @returns Array of VestingScheduleEntity
 *
 * @example
 * const allSchedules = await ctx.runQuery(api.queries.sui.vesting.listAll, {
 *   status: "active",
 *   limit: 50,
 * });
 */
export const listAll = query({
  args: {
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<VestingScheduleEntity[]> => {
    // TODO: Add admin permission check in production
    // const identity = await ctx.auth.getUserIdentity();
    // ... check if user is admin ...

    // Query all vesting schedules
    let q = ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "vesting_schedule"));

    // Apply status filter if provided
    if (args.status) {
      q = q.filter((q) => q.eq(q.field("status"), args.status));
    }

    // Collect with limit
    const limit = args.limit || 100;
    const schedules = await q.take(limit);

    return schedules as VestingScheduleEntity[];
  },
});
