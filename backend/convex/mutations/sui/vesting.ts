/**
 * Vesting Mutations - Token Vesting Schedule Operations
 *
 * Convex mutations for managing token vesting schedules on Sui blockchain.
 * These are thin wrappers around VestingService (Effect.ts business logic).
 *
 * Follows 6-dimension ontology:
 * - THINGS: vesting_schedule (type: "vesting_schedule")
 * - CONNECTIONS: vested_to (schedule → beneficiary)
 * - EVENTS: vesting_schedule_created, vesting_claimed, vesting_revoked
 *
 * @module mutations/sui/vesting
 * @version 1.0.0
 */

import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import {
  createVestingSchedule as createVestingScheduleService,
  claimVestedTokens as claimVestedTokensService,
  revokeVesting as revokeVestingService,
} from "../../services/sui/VestingService";

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new vesting schedule
 *
 * Creates:
 * 1. Vesting schedule thing in database
 * 2. Connection: vested_to (schedule → beneficiary)
 * 3. Event: vesting_schedule_created
 *
 * @requires Authentication
 * @requires Valid token and beneficiary
 *
 * @param tokenId - Token thing ID to vest
 * @param beneficiaryId - Beneficiary person thing ID
 * @param totalAmount - Total amount to vest (as string)
 * @param cliffDuration - Cliff duration in milliseconds
 * @param vestingDuration - Total vesting duration in milliseconds
 * @param name - Optional schedule name
 * @param groupId - Optional organization/group ID
 *
 * @returns scheduleId - Created vesting schedule thing ID
 *
 * @example
 * const scheduleId = await ctx.runMutation(api.mutations.sui.vesting.createSchedule, {
 *   tokenId: "j97abc...",
 *   beneficiaryId: "j97def...",
 *   totalAmount: "1000000",
 *   cliffDuration: 86400000 * 30, // 30 days
 *   vestingDuration: 86400000 * 365, // 1 year
 * });
 */
export const createSchedule = mutation({
  args: {
    tokenId: v.id("things"),
    beneficiaryId: v.id("things"),
    totalAmount: v.string(),
    cliffDuration: v.number(),
    vestingDuration: v.number(),
    name: v.optional(v.string()),
    groupId: v.optional(v.id("groups")),
  },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE: Get user identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. GET ACTOR: Find person thing from identity
    const person = await ctx.db
      .query("things")
      .filter((q) => q.eq(q.field("properties.email"), identity.email))
      .first();

    if (!person || !["creator", "org_owner", "org_user"].includes(person.type)) {
      throw new Error("User not found or invalid user type");
    }

    // 3. CREATE SCHEDULE: Call service
    try {
      const schedule = await createVestingScheduleService(ctx, {
        tokenId: args.tokenId,
        beneficiaryId: args.beneficiaryId,
        totalAmount: args.totalAmount,
        cliffDuration: args.cliffDuration,
        vestingDuration: args.vestingDuration,
        name: args.name,
        groupId: args.groupId || person.groupId,
        actorId: person._id,
      });

      return schedule._id;
    } catch (error) {
      // Handle Effect.ts errors
      if (error instanceof Error) {
        throw new Error(`Failed to create vesting schedule: ${error.message}`);
      }
      throw error;
    }
  },
});

/**
 * Claim vested tokens from a schedule
 *
 * Calculates vested amount based on current time, executes claim,
 * updates database and on-chain state. Logs vesting_claimed event.
 *
 * @requires Authentication
 * @requires User is beneficiary of the schedule
 * @requires Cliff period has ended
 * @requires Claimable amount > 0
 *
 * @param scheduleId - Vesting schedule thing ID
 *
 * @returns { success: true, amountClaimed: number }
 *
 * @throws VestingNotStartedError - Cliff period not ended yet
 * @throws NothingToClaimError - No vested tokens available to claim
 * @throws VestingRevokedError - Schedule was revoked
 * @throws InsufficientPermissionsError - User is not beneficiary
 *
 * @example
 * const result = await ctx.runMutation(api.mutations.sui.vesting.claim, {
 *   scheduleId: "j97abc...",
 * });
 * // { success: true, amountClaimed: 250000 }
 */
export const claim = mutation({
  args: {
    scheduleId: v.id("things"),
  },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE: Get user identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. GET ACTOR: Find person thing from identity
    const person = await ctx.db
      .query("things")
      .filter((q) => q.eq(q.field("properties.email"), identity.email))
      .first();

    if (!person || !["creator", "org_owner", "org_user"].includes(person.type)) {
      throw new Error("User not found or invalid user type");
    }

    // 3. CLAIM TOKENS: Call service
    try {
      const amountClaimed = await claimVestedTokensService(ctx, {
        scheduleId: args.scheduleId,
        claimerId: person._id,
        timestamp: Date.now(),
      });

      return {
        success: true,
        amountClaimed,
      };
    } catch (error) {
      // Handle Effect.ts errors with user-friendly messages
      if (error instanceof Error) {
        // Check for specific error types in message
        const message = error.message;

        if (message.includes("VestingNotStartedError")) {
          throw new Error("Cliff period has not ended yet. Please wait until vesting starts.");
        }

        if (message.includes("NothingToClaimError")) {
          throw new Error("No vested tokens available to claim at this time.");
        }

        if (message.includes("VestingRevokedError")) {
          throw new Error("This vesting schedule has been revoked.");
        }

        if (message.includes("InsufficientPermissionsError")) {
          throw new Error("You are not the beneficiary of this vesting schedule.");
        }

        throw new Error(`Failed to claim vested tokens: ${message}`);
      }
      throw error;
    }
  },
});

/**
 * Revoke a vesting schedule (admin only)
 *
 * Admin-only operation. Returns unvested tokens and archives schedule.
 * Logs vesting_revoked event.
 *
 * @requires Authentication
 * @requires platform_owner or org_owner role
 *
 * @param scheduleId - Vesting schedule thing ID
 *
 * @returns { success: true }
 *
 * @throws Error if user lacks permissions
 * @throws ScheduleNotFoundError if schedule doesn't exist
 *
 * @example
 * await ctx.runMutation(api.mutations.sui.vesting.revoke, {
 *   scheduleId: "j97abc...",
 * });
 */
export const revoke = mutation({
  args: {
    scheduleId: v.id("things"),
  },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE: Get user identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. GET ACTOR: Find person thing from identity
    const person = await ctx.db
      .query("things")
      .filter((q) => q.eq(q.field("properties.email"), identity.email))
      .first();

    if (!person) {
      throw new Error("User not found");
    }

    // 3. CHECK PERMISSIONS: Only platform_owner or org_owner can revoke
    const role = person.properties?.role;
    if (role !== "platform_owner" && role !== "org_owner") {
      throw new Error(
        "Insufficient permissions. Only platform owners or organization owners can revoke vesting schedules."
      );
    }

    // 4. REVOKE SCHEDULE: Call service
    try {
      await revokeVestingService(ctx, {
        scheduleId: args.scheduleId,
        revokerId: person._id,
      });

      return { success: true };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to revoke vesting schedule: ${error.message}`);
      }
      throw error;
    }
  },
});
