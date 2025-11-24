/**
 * Staking Service - Effect.ts Business Logic Layer
 *
 * Handles staking pool creation, token staking/unstaking, rewards calculation.
 * Maps to 6-dimension ontology:
 * - THINGS: staking_pool (pool entities)
 * - CONNECTIONS: staked_in (staker → pool)
 * - EVENTS: tokens_staked, tokens_unstaked, staking_reward_claimed
 *
 * @module StakingService
 * @version 1.0.0
 */

import { Effect, Context } from "effect";
import { Id } from "../../_generated/dataModel";
import {
  StakingPoolProperties,
  StakedInMetadata,
  StakingEventMetadata,
} from "../../types/crypto";

// ============================================================================
// Service Interface
// ============================================================================

/**
 * StakingService - Pure business logic for staking operations
 *
 * All methods return Effect for composability and error handling.
 * Database access is injected via context.
 */
export class StakingService extends Context.Tag("StakingService")<
  StakingService,
  {
    /**
     * Create a new staking pool
     *
     * @example
     * const pool = yield* _(StakingService.createStakingPool({
     *   tokenId: "kg123...",
     *   rewardRate: "0.15", // 15% APY
     *   lockDuration: 90 * 24 * 60 * 60 * 1000, // 90 days
     *   groupId: "kg456...",
     *   creatorId: "kg789..."
     * }));
     */
    createStakingPool: (
      data: CreateStakingPoolInput
    ) => Effect.Effect<StakingPoolEntity, ServiceError>;

    /**
     * Stake tokens in a pool
     *
     * @example
     * yield* _(StakingService.stakeTokens({
     *   poolId: "kg123...",
     *   stakerId: "kg456...",
     *   amount: "1000000000000000", // 1M tokens
     * }));
     */
    stakeTokens: (
      data: StakeTokensInput
    ) => Effect.Effect<void, ServiceError>;

    /**
     * Unstake tokens from a pool
     *
     * @example
     * yield* _(StakingService.unstakeTokens({
     *   poolId: "kg123...",
     *   stakerId: "kg456...",
     *   amount: "500000000000000", // 500K tokens
     * }));
     */
    unstakeTokens: (
      data: UnstakeTokensInput
    ) => Effect.Effect<void, ServiceError>;

    /**
     * Claim rewards without unstaking
     *
     * @example
     * const rewards = yield* _(StakingService.claimRewards({
     *   poolId: "kg123...",
     *   stakerId: "kg456..."
     * }));
     */
    claimRewards: (
      data: ClaimRewardsInput
    ) => Effect.Effect<number, ServiceError>;

    /**
     * Calculate pending rewards for a staker
     *
     * @example
     * const pending = yield* _(StakingService.calculateRewards({
     *   poolId: "kg123...",
     *   stakerId: "kg456..."
     * }));
     */
    calculateRewards: (
      data: CalculateRewardsInput
    ) => Effect.Effect<number, ServiceError>;

    /**
     * Get pool statistics
     *
     * @example
     * const stats = yield* _(StakingService.getPoolStats({
     *   poolId: "kg123..."
     * }));
     */
    getPoolStats: (
      data: GetPoolStatsInput
    ) => Effect.Effect<PoolStats, ServiceError>;
  }
>() {}

// ============================================================================
// Error Types (Tagged Union)
// ============================================================================

/**
 * Service error types for staking operations
 */
export type ServiceError =
  | InsufficientBalanceError
  | StillLockedError
  | PoolNotFoundError
  | InvalidAmountError
  | StakeNotFoundError
  | DatabaseError;

export interface InsufficientBalanceError {
  _tag: "InsufficientBalanceError";
  stakerId: string;
  required: string;
  available: string;
}

export interface StillLockedError {
  _tag: "StillLockedError";
  stakerId: string;
  poolId: string;
  lockEnd: number;
  currentTime: number;
}

export interface PoolNotFoundError {
  _tag: "PoolNotFoundError";
  poolId: string;
}

export interface InvalidAmountError {
  _tag: "InvalidAmountError";
  amount: string;
  message: string;
}

export interface StakeNotFoundError {
  _tag: "StakeNotFoundError";
  stakerId: string;
  poolId: string;
}

export interface DatabaseError {
  _tag: "DatabaseError";
  message: string;
}

// ============================================================================
// Input Types
// ============================================================================

export interface CreateStakingPoolInput {
  tokenId: Id<"things">; // Reference to token thing
  rewardRate: string; // APY as decimal string (e.g., "0.15" = 15%)
  lockDuration: number; // Lock duration in milliseconds
  groupId: Id<"groups">; // Organization scope
  creatorId: Id<"things">; // Person who created the pool
  minStake?: string; // Minimum stake amount (optional)
  maxStake?: string; // Maximum stake amount (optional)
  name?: string; // Pool name (optional)
}

export interface StakeTokensInput {
  poolId: Id<"things">; // Reference to staking pool
  stakerId: Id<"things">; // Reference to person thing
  amount: string; // Amount to stake (as string for big numbers)
}

export interface UnstakeTokensInput {
  poolId: Id<"things">; // Reference to staking pool
  stakerId: Id<"things">; // Reference to person thing
  amount: string; // Amount to unstake (as string for big numbers)
}

export interface ClaimRewardsInput {
  poolId: Id<"things">; // Reference to staking pool
  stakerId: Id<"things">; // Reference to person thing
}

export interface CalculateRewardsInput {
  poolId: Id<"things">; // Reference to staking pool
  stakerId: Id<"things">; // Reference to person thing
}

export interface GetPoolStatsInput {
  poolId: Id<"things">; // Reference to staking pool
}

// ============================================================================
// Output Types
// ============================================================================

/**
 * Staking pool entity (returned from createStakingPool)
 */
export interface StakingPoolEntity {
  poolId: Id<"things">;
  tokenId: Id<"things">;
  rewardRate: string;
  lockDuration: number;
  totalStaked: string;
  groupId: Id<"groups">;
  status: "active" | "paused" | "closed";
  createdAt: number;
}

/**
 * Pool statistics (returned from getPoolStats)
 */
export interface PoolStats {
  poolId: Id<"things">;
  totalStaked: string; // Total amount staked in pool
  totalStakers: number; // Number of unique stakers
  rewardRate: string; // APY
  lockDuration: number; // Lock duration in ms
  tvl: string; // Total Value Locked (same as totalStaked)
  apy: string; // Annual Percentage Yield (same as rewardRate)
  createdAt: number;
  status: "active" | "paused" | "closed";
}

// ============================================================================
// Database Context (Injected Dependency)
// ============================================================================

/**
 * Database operations interface
 * This is injected as a dependency to keep the service pure
 */
export interface DatabaseOperations {
  // Things table operations
  insertThing: (data: {
    type: string;
    name: string;
    groupId?: Id<"groups">;
    properties: any;
    status: string;
    createdAt: number;
    updatedAt: number;
  }) => Promise<Id<"things">>;

  getThing: (id: Id<"things">) => Promise<any | null>;

  patchThing: (id: Id<"things">, data: any) => Promise<void>;

  queryThings: (filter: {
    type: string;
    groupId?: Id<"groups">;
  }) => Promise<any[]>;

  // Connections table operations
  insertConnection: (data: {
    fromThingId: Id<"things">;
    toThingId: Id<"things">;
    relationshipType: string;
    metadata: any;
    validFrom: number;
    createdAt: number;
  }) => Promise<Id<"connections">>;

  getConnection: (filter: {
    fromThingId: Id<"things">;
    toThingId: Id<"things">;
    relationshipType: string;
  }) => Promise<any | null>;

  patchConnection: (id: Id<"connections">, data: any) => Promise<void>;

  // Events table operations
  insertEvent: (data: {
    type: string;
    actorId: Id<"things">;
    targetId?: Id<"things">;
    timestamp: number;
    metadata: any;
  }) => Promise<Id<"events">>;

  // Count operations
  countConnections: (filter: {
    toThingId: Id<"things">;
    relationshipType: string;
  }) => Promise<number>;
}

/**
 * Database context tag for dependency injection
 */
export class DatabaseContext extends Context.Tag("DatabaseContext")<
  DatabaseContext,
  DatabaseOperations
>() {}

// ============================================================================
// Service Implementation
// ============================================================================

/**
 * StakingService implementation
 *
 * Pure business logic, all database operations are injected via context.
 */
export const StakingServiceLive = StakingService.of({
  /**
   * Create a new staking pool
   */
  createStakingPool: (data) =>
    Effect.gen(function* (_) {
      const db = yield* _(DatabaseContext);

      // Validate reward rate
      const rewardRate = parseFloat(data.rewardRate);
      if (isNaN(rewardRate) || rewardRate < 0 || rewardRate > 1) {
        return yield* _(
          Effect.fail<ServiceError>({
            _tag: "InvalidAmountError",
            amount: data.rewardRate,
            message: "Reward rate must be between 0 and 1 (e.g., 0.15 for 15%)",
          })
        );
      }

      // Validate lock duration
      if (data.lockDuration <= 0) {
        return yield* _(
          Effect.fail<ServiceError>({
            _tag: "InvalidAmountError",
            amount: String(data.lockDuration),
            message: "Lock duration must be positive",
          })
        );
      }

      // Verify token exists
      const token = yield* _(
        Effect.tryPromise({
          try: () => db.getThing(data.tokenId),
          catch: (error) => ({
            _tag: "DatabaseError" as const,
            message: `Failed to verify token: ${String(error)}`,
          }),
        })
      );

      if (!token || token.type !== "token") {
        return yield* _(
          Effect.fail<ServiceError>({
            _tag: "InvalidAmountError",
            amount: data.tokenId,
            message: "Invalid token ID",
          })
        );
      }

      // Get token coin type from properties
      const tokenType = token.properties?.coinType || "";

      // Create staking pool properties
      const poolProperties: StakingPoolProperties = {
        tokenType,
        totalStaked: "0",
        rewardRate: data.rewardRate,
        lockDuration: data.lockDuration,
        minStake: data.minStake,
        maxStake: data.maxStake,
        startTime: Date.now(),
      };

      // Insert pool into things table
      const poolId = yield* _(
        Effect.tryPromise({
          try: () =>
            db.insertThing({
              type: "staking_pool",
              name: data.name || `Staking Pool for ${token.name}`,
              groupId: data.groupId,
              properties: poolProperties,
              status: "active",
              createdAt: Date.now(),
              updatedAt: Date.now(),
            }),
          catch: (error) => ({
            _tag: "DatabaseError" as const,
            message: `Failed to create staking pool: ${String(error)}`,
          }),
        })
      );

      // Create connection: creator owns pool
      yield* _(
        Effect.tryPromise({
          try: () =>
            db.insertConnection({
              fromThingId: data.creatorId,
              toThingId: poolId,
              relationshipType: "owns",
              metadata: {
                role: "creator",
                createdAt: Date.now(),
              },
              validFrom: Date.now(),
              createdAt: Date.now(),
            }),
          catch: (error) => ({
            _tag: "DatabaseError" as const,
            message: `Failed to create ownership connection: ${String(error)}`,
          }),
        })
      );

      // Log event: staking pool created
      const eventMetadata: StakingEventMetadata = {
        poolId,
        stakerId: data.creatorId,
        amount: "0",
      };

      yield* _(
        Effect.tryPromise({
          try: () =>
            db.insertEvent({
              type: "entity_created",
              actorId: data.creatorId,
              targetId: poolId,
              timestamp: Date.now(),
              metadata: {
                ...eventMetadata,
                entityType: "staking_pool",
                groupId: data.groupId,
              },
            }),
          catch: (error) => ({
            _tag: "DatabaseError" as const,
            message: `Failed to log event: ${String(error)}`,
          }),
        })
      );

      // Return pool entity
      return {
        poolId,
        tokenId: data.tokenId,
        rewardRate: data.rewardRate,
        lockDuration: data.lockDuration,
        totalStaked: "0",
        groupId: data.groupId,
        status: "active" as const,
        createdAt: Date.now(),
      };
    }),

  /**
   * Stake tokens in a pool
   */
  stakeTokens: (data) =>
    Effect.gen(function* (_) {
      const db = yield* _(DatabaseContext);

      // Validate amount
      const amount = BigInt(data.amount);
      if (amount <= 0n) {
        return yield* _(
          Effect.fail<ServiceError>({
            _tag: "InvalidAmountError",
            amount: data.amount,
            message: "Stake amount must be positive",
          })
        );
      }

      // Get pool
      const pool = yield* _(
        Effect.tryPromise({
          try: () => db.getThing(data.poolId),
          catch: () => ({
            _tag: "PoolNotFoundError" as const,
            poolId: data.poolId,
          }),
        })
      );

      if (!pool || pool.type !== "staking_pool") {
        return yield* _(
          Effect.fail<ServiceError>({
            _tag: "PoolNotFoundError",
            poolId: data.poolId,
          })
        );
      }

      const poolProps = pool.properties as StakingPoolProperties;

      // Validate min/max stake
      if (poolProps.minStake && amount < BigInt(poolProps.minStake)) {
        return yield* _(
          Effect.fail<ServiceError>({
            _tag: "InvalidAmountError",
            amount: data.amount,
            message: `Stake amount must be at least ${poolProps.minStake}`,
          })
        );
      }

      if (poolProps.maxStake && amount > BigInt(poolProps.maxStake)) {
        return yield* _(
          Effect.fail<ServiceError>({
            _tag: "InvalidAmountError",
            amount: data.amount,
            message: `Stake amount must not exceed ${poolProps.maxStake}`,
          })
        );
      }

      // Check if staker already has a stake in this pool
      const existingStake = yield* _(
        Effect.tryPromise({
          try: () =>
            db.getConnection({
              fromThingId: data.stakerId,
              toThingId: data.poolId,
              relationshipType: "staked_in",
            }),
          catch: (error) => ({
            _tag: "DatabaseError" as const,
            message: `Failed to check existing stake: ${String(error)}`,
          }),
        })
      );

      const now = Date.now();
      const lockEnd = now + poolProps.lockDuration;

      if (existingStake) {
        // Update existing stake
        const metadata = existingStake.metadata as StakedInMetadata;
        const newAmount = (BigInt(metadata.amount) + amount).toString();

        yield* _(
          Effect.tryPromise({
            try: () =>
              db.patchConnection(existingStake._id, {
                metadata: {
                  ...metadata,
                  amount: newAmount,
                  startTime: now, // Reset start time for new stake
                  lockEnd: lockEnd, // Reset lock end
                },
              }),
            catch: (error) => ({
              _tag: "DatabaseError" as const,
              message: `Failed to update stake: ${String(error)}`,
            }),
          })
        );
      } else {
        // Create new stake connection
        const metadata: StakedInMetadata = {
          amount: data.amount,
          startTime: now,
          lockEnd: lockEnd,
          rewards: "0",
        };

        yield* _(
          Effect.tryPromise({
            try: () =>
              db.insertConnection({
                fromThingId: data.stakerId,
                toThingId: data.poolId,
                relationshipType: "staked_in",
                metadata,
                validFrom: now,
                createdAt: now,
              }),
            catch: (error) => ({
              _tag: "DatabaseError" as const,
              message: `Failed to create stake connection: ${String(error)}`,
            }),
          })
        );
      }

      // Update pool total staked
      const newTotalStaked = (BigInt(poolProps.totalStaked) + amount).toString();

      yield* _(
        Effect.tryPromise({
          try: () =>
            db.patchThing(data.poolId, {
              properties: {
                ...poolProps,
                totalStaked: newTotalStaked,
              },
              updatedAt: now,
            }),
          catch: (error) => ({
            _tag: "DatabaseError" as const,
            message: `Failed to update pool: ${String(error)}`,
          }),
        })
      );

      // Log event: tokens staked
      const eventMetadata: StakingEventMetadata = {
        poolId: data.poolId,
        stakerId: data.stakerId,
        amount: data.amount,
      };

      yield* _(
        Effect.tryPromise({
          try: () =>
            db.insertEvent({
              type: "tokens_staked",
              actorId: data.stakerId,
              targetId: data.poolId,
              timestamp: now,
              metadata: eventMetadata,
            }),
          catch: (error) => ({
            _tag: "DatabaseError" as const,
            message: `Failed to log event: ${String(error)}`,
          }),
        })
      );
    }),

  /**
   * Unstake tokens from a pool
   */
  unstakeTokens: (data) =>
    Effect.gen(function* (_) {
      const db = yield* _(DatabaseContext);

      // Validate amount
      const amount = BigInt(data.amount);
      if (amount <= 0n) {
        return yield* _(
          Effect.fail<ServiceError>({
            _tag: "InvalidAmountError",
            amount: data.amount,
            message: "Unstake amount must be positive",
          })
        );
      }

      // Get pool
      const pool = yield* _(
        Effect.tryPromise({
          try: () => db.getThing(data.poolId),
          catch: () => ({
            _tag: "PoolNotFoundError" as const,
            poolId: data.poolId,
          }),
        })
      );

      if (!pool || pool.type !== "staking_pool") {
        return yield* _(
          Effect.fail<ServiceError>({
            _tag: "PoolNotFoundError",
            poolId: data.poolId,
          })
        );
      }

      // Get stake connection
      const stake = yield* _(
        Effect.tryPromise({
          try: () =>
            db.getConnection({
              fromThingId: data.stakerId,
              toThingId: data.poolId,
              relationshipType: "staked_in",
            }),
          catch: () => ({
            _tag: "StakeNotFoundError" as const,
            stakerId: data.stakerId,
            poolId: data.poolId,
          }),
        })
      );

      if (!stake) {
        return yield* _(
          Effect.fail<ServiceError>({
            _tag: "StakeNotFoundError",
            stakerId: data.stakerId,
            poolId: data.poolId,
          })
        );
      }

      const metadata = stake.metadata as StakedInMetadata;
      const now = Date.now();

      // Check if still locked
      if (now < metadata.lockEnd) {
        return yield* _(
          Effect.fail<ServiceError>({
            _tag: "StillLockedError",
            stakerId: data.stakerId,
            poolId: data.poolId,
            lockEnd: metadata.lockEnd,
            currentTime: now,
          })
        );
      }

      // Check if sufficient balance
      const stakedAmount = BigInt(metadata.amount);
      if (amount > stakedAmount) {
        return yield* _(
          Effect.fail<ServiceError>({
            _tag: "InsufficientBalanceError",
            stakerId: data.stakerId,
            required: data.amount,
            available: metadata.amount,
          })
        );
      }

      // Calculate rewards before unstaking
      const rewards = yield* _(
        StakingService.calculateRewards({
          poolId: data.poolId,
          stakerId: data.stakerId,
        })
      );

      // Update stake amount
      const newAmount = (stakedAmount - amount).toString();

      if (newAmount === "0") {
        // Remove stake connection if fully unstaked
        yield* _(
          Effect.tryPromise({
            try: () =>
              db.patchConnection(stake._id, {
                validTo: now,
              }),
            catch: (error) => ({
              _tag: "DatabaseError" as const,
              message: `Failed to remove stake: ${String(error)}`,
            }),
          })
        );
      } else {
        // Update stake amount
        yield* _(
          Effect.tryPromise({
            try: () =>
              db.patchConnection(stake._id, {
                metadata: {
                  ...metadata,
                  amount: newAmount,
                  rewards: (BigInt(metadata.rewards) + BigInt(Math.floor(rewards))).toString(),
                },
              }),
            catch: (error) => ({
              _tag: "DatabaseError" as const,
              message: `Failed to update stake: ${String(error)}`,
            }),
          })
        );
      }

      // Update pool total staked
      const poolProps = pool.properties as StakingPoolProperties;
      const newTotalStaked = (BigInt(poolProps.totalStaked) - amount).toString();

      yield* _(
        Effect.tryPromise({
          try: () =>
            db.patchThing(data.poolId, {
              properties: {
                ...poolProps,
                totalStaked: newTotalStaked,
              },
              updatedAt: now,
            }),
          catch: (error) => ({
            _tag: "DatabaseError" as const,
            message: `Failed to update pool: ${String(error)}`,
          }),
        })
      );

      // Log event: tokens unstaked
      const eventMetadata: StakingEventMetadata = {
        poolId: data.poolId,
        stakerId: data.stakerId,
        amount: data.amount,
        rewards: String(Math.floor(rewards)),
      };

      yield* _(
        Effect.tryPromise({
          try: () =>
            db.insertEvent({
              type: "tokens_unstaked",
              actorId: data.stakerId,
              targetId: data.poolId,
              timestamp: now,
              metadata: eventMetadata,
            }),
          catch: (error) => ({
            _tag: "DatabaseError" as const,
            message: `Failed to log event: ${String(error)}`,
          }),
        })
      );
    }),

  /**
   * Claim rewards without unstaking
   */
  claimRewards: (data) =>
    Effect.gen(function* (_) {
      const db = yield* _(DatabaseContext);

      // Get stake connection
      const stake = yield* _(
        Effect.tryPromise({
          try: () =>
            db.getConnection({
              fromThingId: data.stakerId,
              toThingId: data.poolId,
              relationshipType: "staked_in",
            }),
          catch: () => ({
            _tag: "StakeNotFoundError" as const,
            stakerId: data.stakerId,
            poolId: data.poolId,
          }),
        })
      );

      if (!stake) {
        return yield* _(
          Effect.fail<ServiceError>({
            _tag: "StakeNotFoundError",
            stakerId: data.stakerId,
            poolId: data.poolId,
          })
        );
      }

      // Calculate rewards
      const rewards = yield* _(
        StakingService.calculateRewards({
          poolId: data.poolId,
          stakerId: data.stakerId,
        })
      );

      // Update rewards claimed in metadata
      const metadata = stake.metadata as StakedInMetadata;
      const now = Date.now();

      yield* _(
        Effect.tryPromise({
          try: () =>
            db.patchConnection(stake._id, {
              metadata: {
                ...metadata,
                rewards: (BigInt(metadata.rewards) + BigInt(Math.floor(rewards))).toString(),
                startTime: now, // Reset start time for next reward calculation
              },
            }),
          catch: (error) => ({
            _tag: "DatabaseError" as const,
            message: `Failed to update rewards: ${String(error)}`,
          }),
        })
      );

      // Log event: staking reward claimed
      const eventMetadata: StakingEventMetadata = {
        poolId: data.poolId,
        stakerId: data.stakerId,
        amount: "0",
        rewards: String(Math.floor(rewards)),
      };

      yield* _(
        Effect.tryPromise({
          try: () =>
            db.insertEvent({
              type: "staking_reward_claimed",
              actorId: data.stakerId,
              targetId: data.poolId,
              timestamp: now,
              metadata: eventMetadata,
            }),
          catch: (error) => ({
            _tag: "DatabaseError" as const,
            message: `Failed to log event: ${String(error)}`,
          }),
        })
      );

      return rewards;
    }),

  /**
   * Calculate pending rewards for a staker
   */
  calculateRewards: (data) =>
    Effect.gen(function* (_) {
      const db = yield* _(DatabaseContext);

      // Get pool
      const pool = yield* _(
        Effect.tryPromise({
          try: () => db.getThing(data.poolId),
          catch: () => ({
            _tag: "PoolNotFoundError" as const,
            poolId: data.poolId,
          }),
        })
      );

      if (!pool || pool.type !== "staking_pool") {
        return yield* _(
          Effect.fail<ServiceError>({
            _tag: "PoolNotFoundError",
            poolId: data.poolId,
          })
        );
      }

      // Get stake connection
      const stake = yield* _(
        Effect.tryPromise({
          try: () =>
            db.getConnection({
              fromThingId: data.stakerId,
              toThingId: data.poolId,
              relationshipType: "staked_in",
            }),
          catch: () => ({
            _tag: "StakeNotFoundError" as const,
            stakerId: data.stakerId,
            poolId: data.poolId,
          }),
        })
      );

      if (!stake) {
        return yield* _(
          Effect.fail<ServiceError>({
            _tag: "StakeNotFoundError",
            stakerId: data.stakerId,
            poolId: data.poolId,
          })
        );
      }

      const poolProps = pool.properties as StakingPoolProperties;
      const metadata = stake.metadata as StakedInMetadata;

      // Calculate rewards based on time staked and APY
      const now = Date.now();
      const timeStaked = now - metadata.startTime; // milliseconds
      const stakedAmount = BigInt(metadata.amount);
      const rewardRate = parseFloat(poolProps.rewardRate);

      // Calculate annualized rewards
      // rewards = (amount * rate * time) / year_in_ms
      const yearInMs = 365 * 24 * 60 * 60 * 1000;
      const rewardsFloat =
        Number(stakedAmount) * rewardRate * (timeStaked / yearInMs);

      return Math.floor(rewardsFloat);
    }),

  /**
   * Get pool statistics
   */
  getPoolStats: (data) =>
    Effect.gen(function* (_) {
      const db = yield* _(DatabaseContext);

      // Get pool
      const pool = yield* _(
        Effect.tryPromise({
          try: () => db.getThing(data.poolId),
          catch: () => ({
            _tag: "PoolNotFoundError" as const,
            poolId: data.poolId,
          }),
        })
      );

      if (!pool || pool.type !== "staking_pool") {
        return yield* _(
          Effect.fail<ServiceError>({
            _tag: "PoolNotFoundError",
            poolId: data.poolId,
          })
        );
      }

      const poolProps = pool.properties as StakingPoolProperties;

      // Count total stakers
      const totalStakers = yield* _(
        Effect.tryPromise({
          try: () =>
            db.countConnections({
              toThingId: data.poolId,
              relationshipType: "staked_in",
            }),
          catch: (error) => ({
            _tag: "DatabaseError" as const,
            message: `Failed to count stakers: ${String(error)}`,
          }),
        })
      );

      // Return pool stats
      return {
        poolId: data.poolId,
        totalStaked: poolProps.totalStaked,
        totalStakers,
        rewardRate: poolProps.rewardRate,
        lockDuration: poolProps.lockDuration,
        tvl: poolProps.totalStaked, // TVL = total staked
        apy: poolProps.rewardRate, // APY = reward rate
        createdAt: pool.createdAt,
        status: pool.status as "active" | "paused" | "closed",
      };
    }),
});

// ============================================================================
// Convenience Helpers
// ============================================================================

/**
 * Error helper: Create InsufficientBalanceError
 */
export const insufficientBalance = (
  stakerId: string,
  required: string,
  available: string
): ServiceError => ({
  _tag: "InsufficientBalanceError",
  stakerId,
  required,
  available,
});

/**
 * Error helper: Create StillLockedError
 */
export const stillLocked = (
  stakerId: string,
  poolId: string,
  lockEnd: number,
  currentTime: number
): ServiceError => ({
  _tag: "StillLockedError",
  stakerId,
  poolId,
  lockEnd,
  currentTime,
});

/**
 * Error helper: Create PoolNotFoundError
 */
export const poolNotFound = (poolId: string): ServiceError => ({
  _tag: "PoolNotFoundError",
  poolId,
});

/**
 * Error helper: Create InvalidAmountError
 */
export const invalidAmount = (amount: string, message: string): ServiceError => ({
  _tag: "InvalidAmountError",
  amount,
  message,
});

/**
 * Error helper: Create StakeNotFoundError
 */
export const stakeNotFound = (stakerId: string, poolId: string): ServiceError => ({
  _tag: "StakeNotFoundError",
  stakerId,
  poolId,
});

/**
 * Error helper: Create DatabaseError
 */
export const databaseError = (message: string): ServiceError => ({
  _tag: "DatabaseError",
  message,
});
