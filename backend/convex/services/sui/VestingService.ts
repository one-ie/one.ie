/**
 * VestingService - Token Vesting Schedule Management
 *
 * Effect.ts service for managing token vesting schedules on Sui blockchain.
 * Handles schedule creation, claims, calculations, and revocations.
 *
 * Maps to 6-dimension ontology:
 * - THINGS: vesting_schedule (type: "vesting_schedule")
 * - CONNECTIONS: vested_to (schedule → beneficiary)
 * - EVENTS: vesting_schedule_created, vesting_claimed, vesting_revoked
 *
 * @module VestingService
 * @version 1.0.0
 */

import { Effect, Data } from "effect";
import { Id } from "../../_generated/dataModel";
import type {
  VestingScheduleProperties,
  VestedToMetadata,
  VestingEventMetadata,
} from "../../types/crypto";
import type { SuiNetwork } from "../../types/sui";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Vesting schedule entity (database representation)
 */
export interface VestingScheduleEntity {
  _id: Id<"things">;
  type: "vesting_schedule";
  name: string;
  groupId?: Id<"groups">;
  properties: VestingScheduleProperties;
  status: "draft" | "active" | "published" | "archived" | "deleted";
  createdAt: number;
  updatedAt: number;
}

/**
 * Input for creating a vesting schedule
 */
export interface CreateVestingScheduleInput {
  tokenId: Id<"things">;
  beneficiaryId: Id<"things">;
  totalAmount: string;
  cliffDuration: number; // milliseconds
  vestingDuration: number; // milliseconds
  name?: string;
  groupId?: Id<"groups">;
  actorId: Id<"things">; // Who is creating this schedule
}

/**
 * Claim vested tokens input
 */
export interface ClaimVestedTokensInput {
  scheduleId: Id<"things">;
  claimerId: Id<"things">;
  timestamp?: number; // Optional, defaults to now
}

/**
 * Calculate vested amount input
 */
export interface CalculateVestedAmountInput {
  scheduleId: Id<"things">;
  timestamp?: number; // Optional, defaults to now
}

/**
 * Revoke vesting schedule input
 */
export interface RevokeVestingInput {
  scheduleId: Id<"things">;
  revokerId: Id<"things">;
}

// ============================================================================
// TAGGED ERRORS
// ============================================================================

/**
 * Vesting not started error (cliff period not ended)
 */
export class VestingNotStartedError extends Data.TaggedError("VestingNotStartedError")<{
  scheduleId: string;
  cliffEnd: number;
  currentTime: number;
}> {}

/**
 * Nothing to claim error (no vested tokens available)
 */
export class NothingToClaimError extends Data.TaggedError("NothingToClaimError")<{
  scheduleId: string;
  vestedAmount: string;
  claimedAmount: string;
}> {}

/**
 * Vesting revoked error (schedule was revoked)
 */
export class VestingRevokedError extends Data.TaggedError("VestingRevokedError")<{
  scheduleId: string;
  revokedAt: number;
}> {}

/**
 * Insufficient permissions error (user doesn't have permission)
 */
export class InsufficientPermissionsError extends Data.TaggedError("InsufficientPermissionsError")<{
  userId: string;
  requiredRole: string;
  action: string;
}> {}

/**
 * Schedule not found error
 */
export class ScheduleNotFoundError extends Data.TaggedError("ScheduleNotFoundError")<{
  scheduleId: string;
}> {}

/**
 * Invalid schedule error (validation failed)
 */
export class InvalidScheduleError extends Data.TaggedError("InvalidScheduleError")<{
  message: string;
  field?: string;
}> {}

/**
 * Union of all vesting service errors
 */
export type VestingServiceError =
  | VestingNotStartedError
  | NothingToClaimError
  | VestingRevokedError
  | InsufficientPermissionsError
  | ScheduleNotFoundError
  | InvalidScheduleError;

// ============================================================================
// SERVICE ERROR TYPE (for external consumers)
// ============================================================================

export type ServiceError = VestingServiceError;

// ============================================================================
// VESTING SERVICE INTERFACE
// ============================================================================

/**
 * VestingService interface for dependency injection
 */
export interface IVestingService {
  createVestingSchedule: (
    input: CreateVestingScheduleInput
  ) => Effect.Effect<VestingScheduleEntity, VestingServiceError>;

  claimVestedTokens: (
    input: ClaimVestedTokensInput
  ) => Effect.Effect<number, VestingServiceError>;

  calculateVestedAmount: (
    input: CalculateVestedAmountInput
  ) => Effect.Effect<number, VestingServiceError>;

  getVestingSchedules: (
    beneficiaryId: Id<"things">
  ) => Effect.Effect<VestingScheduleEntity[], VestingServiceError>;

  revokeVesting: (
    input: RevokeVestingInput
  ) => Effect.Effect<void, VestingServiceError>;
}

// ============================================================================
// SERVICE TAG (for Effect.ts context)
// ============================================================================

export class VestingService extends Effect.Tag("VestingService")<
  VestingService,
  IVestingService
>() {}

// ============================================================================
// SERVICE IMPLEMENTATION
// ============================================================================

/**
 * Create vesting service implementation
 *
 * @param ctx - Convex mutation/query context
 * @param suiProvider - Optional Sui provider service for on-chain operations
 */
export function makeVestingService(
  ctx: any, // Convex MutationCtx or QueryCtx
  suiProvider?: any // SuiProviderService (optional for now)
): IVestingService {
  return {
    /**
     * Create a new vesting schedule
     *
     * Creates:
     * 1. Vesting schedule thing in database
     * 2. Connection: vested_to (schedule → beneficiary)
     * 3. Event: vesting_schedule_created
     * 4. (Future) On-chain vesting contract
     *
     * @param input - Vesting schedule creation parameters
     * @returns Effect with created vesting schedule entity
     */
    createVestingSchedule: (input: CreateVestingScheduleInput) =>
      Effect.gen(function* () {
        // Validate inputs
        if (!input.tokenId) {
          return yield* new InvalidScheduleError({
            message: "Token ID is required",
            field: "tokenId",
          });
        }

        if (!input.beneficiaryId) {
          return yield* new InvalidScheduleError({
            message: "Beneficiary ID is required",
            field: "beneficiaryId",
          });
        }

        if (!input.totalAmount || parseFloat(input.totalAmount) <= 0) {
          return yield* new InvalidScheduleError({
            message: "Total amount must be greater than 0",
            field: "totalAmount",
          });
        }

        if (input.cliffDuration < 0) {
          return yield* new InvalidScheduleError({
            message: "Cliff duration cannot be negative",
            field: "cliffDuration",
          });
        }

        if (input.vestingDuration <= 0) {
          return yield* new InvalidScheduleError({
            message: "Vesting duration must be greater than 0",
            field: "vestingDuration",
          });
        }

        // Calculate timeline
        const now = Date.now();
        const cliffEnd = now + input.cliffDuration;
        const vestingEnd = now + input.vestingDuration;

        // Verify token exists
        const token = yield* Effect.promise(() => ctx.db.get(input.tokenId));
        if (!token || token.type !== "token") {
          return yield* new InvalidScheduleError({
            message: "Invalid token ID",
            field: "tokenId",
          });
        }

        // Verify beneficiary exists
        const beneficiary = yield* Effect.promise(() =>
          ctx.db.get(input.beneficiaryId)
        );
        if (!beneficiary) {
          return yield* new InvalidScheduleError({
            message: "Beneficiary not found",
            field: "beneficiaryId",
          });
        }

        // Create vesting schedule properties
        const properties: VestingScheduleProperties = {
          tokenId: input.tokenId,
          beneficiaryId: input.beneficiaryId,
          totalAmount: input.totalAmount,
          claimedAmount: "0",
          cliffEnd,
          vestingEnd,
          vestingDuration: input.vestingDuration,
          cliffDuration: input.cliffDuration,
        };

        // Generate schedule name
        const scheduleName =
          input.name ||
          `Vesting: ${beneficiary.name} - ${token.name} (${input.totalAmount})`;

        // Create vesting schedule thing
        const scheduleId = yield* Effect.promise(() =>
          ctx.db.insert("things", {
            type: "vesting_schedule",
            name: scheduleName,
            groupId: input.groupId,
            properties,
            status: "active",
            createdAt: now,
            updatedAt: now,
          })
        );

        // Create connection: vested_to (schedule → beneficiary)
        const connectionMetadata: VestedToMetadata = {
          amount: input.totalAmount,
          cliffEnd,
          vestingEnd,
          claimed: "0",
        };

        yield* Effect.promise(() =>
          ctx.db.insert("connections", {
            fromThingId: scheduleId,
            toThingId: input.beneficiaryId,
            relationshipType: "vested_to",
            metadata: connectionMetadata,
            validFrom: now,
            createdAt: now,
          })
        );

        // Log event: vesting_schedule_created
        const eventMetadata: VestingEventMetadata = {
          vestingScheduleId: scheduleId,
          beneficiaryId: input.beneficiaryId,
          amount: input.totalAmount,
          timestamp: now,
        };

        yield* Effect.promise(() =>
          ctx.db.insert("events", {
            type: "vesting_schedule_created",
            actorId: input.actorId,
            targetId: scheduleId,
            timestamp: now,
            metadata: eventMetadata,
          })
        );

        // TODO: Create on-chain vesting contract via SuiProviderService
        // if (suiProvider) {
        //   yield* suiProvider.createVestingContract(...)
        // }

        // Fetch and return created schedule
        const schedule = yield* Effect.promise(() => ctx.db.get(scheduleId));
        return schedule as VestingScheduleEntity;
      }),

    /**
     * Claim vested tokens from a schedule
     *
     * Calculates vested amount, executes claim, updates database and on-chain.
     * Logs vesting_claimed event.
     *
     * @param input - Claim parameters
     * @returns Effect with amount claimed
     */
    claimVestedTokens: (input: ClaimVestedTokensInput) =>
      Effect.gen(function* () {
        const now = input.timestamp || Date.now();

        // Fetch vesting schedule
        const schedule = yield* Effect.promise(() =>
          ctx.db.get(input.scheduleId)
        );

        if (!schedule || schedule.type !== "vesting_schedule") {
          return yield* new ScheduleNotFoundError({
            scheduleId: input.scheduleId,
          });
        }

        const props = schedule.properties as VestingScheduleProperties;

        // Check if schedule is revoked
        if (schedule.status === "archived") {
          return yield* new VestingRevokedError({
            scheduleId: input.scheduleId,
            revokedAt: schedule.updatedAt,
          });
        }

        // Verify claimer is beneficiary
        if (input.claimerId !== props.beneficiaryId) {
          return yield* new InsufficientPermissionsError({
            userId: input.claimerId,
            requiredRole: "beneficiary",
            action: "claim_vested_tokens",
          });
        }

        // Check if cliff period has ended
        if (now < props.cliffEnd) {
          return yield* new VestingNotStartedError({
            scheduleId: input.scheduleId,
            cliffEnd: props.cliffEnd,
            currentTime: now,
          });
        }

        // Calculate vested amount
        const totalAmount = parseFloat(props.totalAmount);
        const claimedAmount = parseFloat(props.claimedAmount);
        const vestingStart = props.cliffEnd;
        const vestingEnd = props.vestingEnd;

        let vestedAmount = 0;

        if (now >= vestingEnd) {
          // Full vesting
          vestedAmount = totalAmount;
        } else {
          // Partial vesting (linear)
          const vestingElapsed = now - vestingStart;
          const vestingTotal = vestingEnd - vestingStart;
          const vestingProgress = vestingElapsed / vestingTotal;
          vestedAmount = totalAmount * vestingProgress;
        }

        // Calculate claimable amount
        const claimableAmount = vestedAmount - claimedAmount;

        if (claimableAmount <= 0) {
          return yield* new NothingToClaimError({
            scheduleId: input.scheduleId,
            vestedAmount: vestedAmount.toString(),
            claimedAmount: props.claimedAmount,
          });
        }

        // Update claimed amount
        const newClaimedAmount = claimedAmount + claimableAmount;

        yield* Effect.promise(() =>
          ctx.db.patch(input.scheduleId, {
            properties: {
              ...props,
              claimedAmount: newClaimedAmount.toString(),
            },
            updatedAt: now,
          })
        );

        // Update connection metadata
        const connection = yield* Effect.promise(() =>
          ctx.db
            .query("connections")
            .withIndex("from_type", (q) =>
              q
                .eq("fromThingId", input.scheduleId)
                .eq("relationshipType", "vested_to")
            )
            .first()
        );

        if (connection) {
          const updatedMetadata: VestedToMetadata = {
            ...(connection.metadata as VestedToMetadata),
            claimed: newClaimedAmount.toString(),
          };

          yield* Effect.promise(() =>
            ctx.db.patch(connection._id, {
              metadata: updatedMetadata,
              updatedAt: now,
            })
          );
        }

        // Log event: vesting_claimed
        const eventMetadata: VestingEventMetadata = {
          vestingScheduleId: input.scheduleId,
          beneficiaryId: props.beneficiaryId,
          amount: claimableAmount.toString(),
          timestamp: now,
        };

        yield* Effect.promise(() =>
          ctx.db.insert("events", {
            type: "vesting_claimed",
            actorId: input.claimerId,
            targetId: input.scheduleId,
            timestamp: now,
            metadata: eventMetadata,
          })
        );

        // TODO: Execute on-chain claim via SuiProviderService
        // if (suiProvider) {
        //   yield* suiProvider.claimVestedTokens(...)
        // }

        return claimableAmount;
      }),

    /**
     * Calculate vested amount at a given timestamp
     *
     * Pure calculation based on vesting schedule parameters.
     * Does NOT execute claim or modify database.
     *
     * @param input - Calculation parameters
     * @returns Effect with vested amount
     */
    calculateVestedAmount: (input: CalculateVestedAmountInput) =>
      Effect.gen(function* () {
        const now = input.timestamp || Date.now();

        // Fetch vesting schedule
        const schedule = yield* Effect.promise(() =>
          ctx.db.get(input.scheduleId)
        );

        if (!schedule || schedule.type !== "vesting_schedule") {
          return yield* new ScheduleNotFoundError({
            scheduleId: input.scheduleId,
          });
        }

        const props = schedule.properties as VestingScheduleProperties;

        // If before cliff, nothing vested
        if (now < props.cliffEnd) {
          return 0;
        }

        const totalAmount = parseFloat(props.totalAmount);

        // If after vesting end, fully vested
        if (now >= props.vestingEnd) {
          return totalAmount;
        }

        // Linear vesting between cliff end and vesting end
        const vestingStart = props.cliffEnd;
        const vestingEnd = props.vestingEnd;
        const vestingElapsed = now - vestingStart;
        const vestingTotal = vestingEnd - vestingStart;
        const vestingProgress = vestingElapsed / vestingTotal;

        return totalAmount * vestingProgress;
      }),

    /**
     * Get all vesting schedules for a beneficiary
     *
     * Queries all vesting schedules where the user is the beneficiary.
     *
     * @param beneficiaryId - Beneficiary thing ID
     * @returns Effect with array of vesting schedules
     */
    getVestingSchedules: (beneficiaryId: Id<"things">) =>
      Effect.gen(function* () {
        // Query connections: vested_to → beneficiary
        const connections = yield* Effect.promise(() =>
          ctx.db
            .query("connections")
            .withIndex("to_type", (q) =>
              q
                .eq("toThingId", beneficiaryId)
                .eq("relationshipType", "vested_to")
            )
            .collect()
        );

        // Fetch all schedules
        const schedules = yield* Effect.all(
          connections.map((conn) =>
            Effect.promise(() => ctx.db.get(conn.fromThingId))
          )
        );

        // Filter and return valid schedules
        return schedules.filter(
          (s) => s && s.type === "vesting_schedule"
        ) as VestingScheduleEntity[];
      }),

    /**
     * Revoke a vesting schedule
     *
     * Admin-only operation. Returns unvested tokens and archives schedule.
     * Logs vesting_revoked event.
     *
     * @param input - Revocation parameters
     * @returns Effect with void
     */
    revokeVesting: (input: RevokeVestingInput) =>
      Effect.gen(function* () {
        const now = Date.now();

        // Fetch vesting schedule
        const schedule = yield* Effect.promise(() =>
          ctx.db.get(input.scheduleId)
        );

        if (!schedule || schedule.type !== "vesting_schedule") {
          return yield* new ScheduleNotFoundError({
            scheduleId: input.scheduleId,
          });
        }

        const props = schedule.properties as VestingScheduleProperties;

        // TODO: Check if revoker has admin permissions
        // For now, assume permission check is done at mutation level

        // Calculate unvested amount
        const totalAmount = parseFloat(props.totalAmount);
        const claimedAmount = parseFloat(props.claimedAmount);
        const vestedAmount = yield* Effect.promise(async () => {
          // Reuse calculateVestedAmount logic
          const service = makeVestingService(ctx, suiProvider);
          const amount = await Effect.runPromise(
            service.calculateVestedAmount({ scheduleId: input.scheduleId })
          );
          return amount;
        });

        const unvestedAmount = totalAmount - vestedAmount;

        // Archive schedule (soft delete)
        yield* Effect.promise(() =>
          ctx.db.patch(input.scheduleId, {
            status: "archived",
            updatedAt: now,
          })
        );

        // Update connection
        const connection = yield* Effect.promise(() =>
          ctx.db
            .query("connections")
            .withIndex("from_type", (q) =>
              q
                .eq("fromThingId", input.scheduleId)
                .eq("relationshipType", "vested_to")
            )
            .first()
        );

        if (connection) {
          yield* Effect.promise(() =>
            ctx.db.patch(connection._id, {
              validTo: now,
              updatedAt: now,
            })
          );
        }

        // Log event: vesting_revoked
        const eventMetadata: VestingEventMetadata = {
          vestingScheduleId: input.scheduleId,
          beneficiaryId: props.beneficiaryId,
          amount: unvestedAmount.toString(),
          timestamp: now,
        };

        yield* Effect.promise(() =>
          ctx.db.insert("events", {
            type: "vesting_revoked",
            actorId: input.revokerId,
            targetId: input.scheduleId,
            timestamp: now,
            metadata: eventMetadata,
          })
        );

        // TODO: Revoke on-chain vesting via SuiProviderService
        // if (suiProvider) {
        //   yield* suiProvider.revokeVesting(...)
        // }
      }),
  };
}

// ============================================================================
// CONVENIENCE FUNCTIONS (for direct use in mutations)
// ============================================================================

/**
 * Create a vesting schedule (convenience wrapper)
 *
 * @param ctx - Convex mutation context
 * @param input - Vesting schedule creation parameters
 * @returns Promise with created vesting schedule entity
 */
export async function createVestingSchedule(
  ctx: any,
  input: CreateVestingScheduleInput
): Promise<VestingScheduleEntity> {
  const service = makeVestingService(ctx);
  return Effect.runPromise(service.createVestingSchedule(input));
}

/**
 * Claim vested tokens (convenience wrapper)
 *
 * @param ctx - Convex mutation context
 * @param input - Claim parameters
 * @returns Promise with amount claimed
 */
export async function claimVestedTokens(
  ctx: any,
  input: ClaimVestedTokensInput
): Promise<number> {
  const service = makeVestingService(ctx);
  return Effect.runPromise(service.claimVestedTokens(input));
}

/**
 * Calculate vested amount (convenience wrapper)
 *
 * @param ctx - Convex query context
 * @param input - Calculation parameters
 * @returns Promise with vested amount
 */
export async function calculateVestedAmount(
  ctx: any,
  input: CalculateVestedAmountInput
): Promise<number> {
  const service = makeVestingService(ctx);
  return Effect.runPromise(service.calculateVestedAmount(input));
}

/**
 * Get vesting schedules (convenience wrapper)
 *
 * @param ctx - Convex query context
 * @param beneficiaryId - Beneficiary thing ID
 * @returns Promise with array of vesting schedules
 */
export async function getVestingSchedules(
  ctx: any,
  beneficiaryId: Id<"things">
): Promise<VestingScheduleEntity[]> {
  const service = makeVestingService(ctx);
  return Effect.runPromise(service.getVestingSchedules(beneficiaryId));
}

/**
 * Revoke vesting (convenience wrapper)
 *
 * @param ctx - Convex mutation context
 * @param input - Revocation parameters
 * @returns Promise with void
 */
export async function revokeVesting(
  ctx: any,
  input: RevokeVestingInput
): Promise<void> {
  const service = makeVestingService(ctx);
  return Effect.runPromise(service.revokeVesting(input));
}
