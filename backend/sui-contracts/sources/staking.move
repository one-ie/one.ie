// SPDX-License-Identifier: MIT
/// Module: staking
///
/// Staking pool contract for the ONE platform's 6-dimension ontology.
/// Maps to: THINGS (staking_pool), CONNECTIONS (staked_in), EVENTS (staked, unstaked, rewards_claimed)
///
/// Features:
/// - Create staking pools with custom token types
/// - Stake tokens with lock periods
/// - Earn rewards based on time and amount staked
/// - Claim rewards at any time
/// - Unstake after lock period expires
/// - Owner-controlled reward rate updates
///
/// Reward Formula:
/// rewards = (amount_staked * reward_rate * time_elapsed) / (SECONDS_PER_YEAR * PRECISION)
/// Where:
/// - reward_rate: Annual percentage rate (e.g., 1000 = 10% APY) with 2 decimal precision
/// - time_elapsed: Seconds since last claim or stake
/// - PRECISION: 10000 (allows 2 decimal places, e.g., 1234 = 12.34%)
/// - SECONDS_PER_YEAR: 31536000 (365 days)

module one_staking::staking {
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::sui::SUI;
    use sui::event;

    // ==================== Constants ====================

    /// Precision multiplier for reward rate calculations (10000 = 2 decimal places)
    const PRECISION: u64 = 10000;

    /// Seconds per year for APY calculations (365 days)
    const SECONDS_PER_YEAR: u64 = 31536000;

    // ==================== Error Codes ====================

    /// Error: Not authorized (only pool owner can perform this action)
    const ENotAuthorized: u64 = 1;

    /// Error: Lock period not expired
    const ELockPeriodActive: u64 = 2;

    /// Error: Insufficient balance in pool for rewards
    const EInsufficientPoolBalance: u64 = 3;

    /// Error: Zero amount not allowed
    const EZeroAmount: u64 = 4;

    /// Error: Invalid reward rate (must be > 0)
    const EInvalidRewardRate: u64 = 5;

    /// Error: Calculation overflow
    const EOverflow: u64 = 6;

    // ==================== Structs ====================

    /// StakingPool - Shared object representing a staking pool
    /// Maps to THINGS dimension (type: staking_pool)
    public struct StakingPool<phantom T> has key {
        id: UID,
        /// Total amount of tokens currently staked in the pool
        total_staked: u64,
        /// Annual reward rate (basis points, e.g., 1000 = 10% APY)
        reward_rate: u64,
        /// Lock duration in seconds (minimum time before unstaking)
        lock_duration: u64,
        /// Pool owner (can update reward rate)
        owner: address,
        /// Token balance for paying rewards
        reward_balance: Balance<T>,
        /// Organization ID for multi-tenant scoping (optional)
        organization_id: Option<address>,
    }

    /// StakePosition - Owned object representing a user's stake
    /// Maps to CONNECTIONS dimension (staked_in relationship)
    public struct StakePosition<phantom T> has key, store {
        id: UID,
        /// Pool ID this position belongs to
        pool_id: ID,
        /// Staker's address
        staker: address,
        /// Amount of tokens staked
        amount: u64,
        /// Timestamp when stake was created (in milliseconds)
        start_time: u64,
        /// Timestamp when lock period ends (start_time + lock_duration)
        lock_end: u64,
        /// Last time rewards were claimed (for incremental calculation)
        last_claim_time: u64,
        /// Total rewards claimed so far
        rewards_claimed: u64,
        /// Staked token balance
        staked_balance: Balance<T>,
    }

    /// Admin capability for pool management
    public struct StakingPoolCap has key, store {
        id: UID,
        pool_id: ID,
    }

    // ==================== Events ====================
    // Maps to EVENTS dimension in the ontology

    /// Event: Staking pool created
    public struct PoolCreated has copy, drop {
        pool_id: ID,
        token_type: std::ascii::String,
        reward_rate: u64,
        lock_duration: u64,
        owner: address,
        organization_id: Option<address>,
        timestamp: u64,
    }

    /// Event: Tokens staked
    public struct Staked has copy, drop {
        pool_id: ID,
        position_id: ID,
        staker: address,
        amount: u64,
        lock_end: u64,
        timestamp: u64,
    }

    /// Event: Tokens unstaked
    public struct Unstaked has copy, drop {
        pool_id: ID,
        position_id: ID,
        staker: address,
        amount: u64,
        timestamp: u64,
    }

    /// Event: Rewards claimed
    public struct RewardsClaimed has copy, drop {
        pool_id: ID,
        position_id: ID,
        staker: address,
        rewards: u64,
        timestamp: u64,
    }

    /// Event: Reward rate updated
    public struct RewardRateUpdated has copy, drop {
        pool_id: ID,
        old_rate: u64,
        new_rate: u64,
        timestamp: u64,
    }

    // ==================== Functions ====================

    /// Create a new staking pool
    ///
    /// # Arguments
    /// * `reward_rate` - Annual reward rate in basis points (e.g., 1000 = 10% APY)
    /// * `lock_duration` - Lock period in seconds
    /// * `initial_rewards` - Initial token balance for rewards
    /// * `organization_id` - Optional organization ID for multi-tenant scoping
    /// * `clock` - Sui clock for timestamp
    /// * `ctx` - Transaction context
    ///
    /// # Returns
    /// * StakingPoolCap - Capability for managing the pool
    public fun create_pool<T>(
        reward_rate: u64,
        lock_duration: u64,
        initial_rewards: Coin<T>,
        organization_id: Option<address>,
        clock: &sui::clock::Clock,
        ctx: &mut TxContext
    ): StakingPoolCap {
        assert!(reward_rate > 0, EInvalidRewardRate);

        let pool_uid = object::new(ctx);
        let pool_id = object::uid_to_inner(&pool_uid);
        let owner = tx_context::sender(ctx);

        let pool = StakingPool<T> {
            id: pool_uid,
            total_staked: 0,
            reward_rate,
            lock_duration,
            owner,
            reward_balance: coin::into_balance(initial_rewards),
            organization_id,
        };

        // Emit pool created event
        event::emit(PoolCreated {
            pool_id,
            token_type: std::type_name::into_string(std::type_name::get<T>()),
            reward_rate,
            lock_duration,
            owner,
            organization_id,
            timestamp: sui::clock::timestamp_ms(clock),
        });

        // Share the pool so anyone can stake
        transfer::share_object(pool);

        // Return admin capability to creator
        let cap = StakingPoolCap {
            id: object::new(ctx),
            pool_id,
        };

        cap
    }

    /// Stake tokens in the pool
    ///
    /// # Arguments
    /// * `pool` - The staking pool
    /// * `stake_coins` - Tokens to stake
    /// * `clock` - Sui clock for timestamp
    /// * `ctx` - Transaction context
    ///
    /// # Returns
    /// * StakePosition - NFT representing the stake position
    public fun stake<T>(
        pool: &mut StakingPool<T>,
        stake_coins: Coin<T>,
        clock: &sui::clock::Clock,
        ctx: &mut TxContext
    ): StakePosition<T> {
        let amount = coin::value(&stake_coins);
        assert!(amount > 0, EZeroAmount);

        let staker = tx_context::sender(ctx);
        let current_time = sui::clock::timestamp_ms(clock);
        let lock_end = current_time + (pool.lock_duration * 1000); // Convert seconds to milliseconds

        let position_uid = object::new(ctx);
        let position_id = object::uid_to_inner(&position_uid);

        let position = StakePosition<T> {
            id: position_uid,
            pool_id: object::id(pool),
            staker,
            amount,
            start_time: current_time,
            lock_end,
            last_claim_time: current_time,
            rewards_claimed: 0,
            staked_balance: coin::into_balance(stake_coins),
        };

        // Update pool state
        pool.total_staked = pool.total_staked + amount;

        // Emit staked event
        event::emit(Staked {
            pool_id: object::id(pool),
            position_id,
            staker,
            amount,
            lock_end,
            timestamp: current_time,
        });

        position
    }

    /// Unstake tokens from the pool (lock period must be expired)
    ///
    /// # Arguments
    /// * `pool` - The staking pool
    /// * `position` - The stake position to unstake
    /// * `clock` - Sui clock for timestamp
    /// * `ctx` - Transaction context
    ///
    /// # Returns
    /// * Coin<T> - The unstaked tokens (including any unclaimed rewards)
    public fun unstake<T>(
        pool: &mut StakingPool<T>,
        position: StakePosition<T>,
        clock: &sui::clock::Clock,
        ctx: &mut TxContext
    ): Coin<T> {
        let current_time = sui::clock::timestamp_ms(clock);

        // Check lock period has expired
        assert!(current_time >= position.lock_end, ELockPeriodActive);

        let StakePosition {
            id,
            pool_id: _,
            staker,
            amount,
            start_time: _,
            lock_end: _,
            last_claim_time,
            rewards_claimed: _,
            staked_balance,
        } = position;

        let position_id = object::uid_to_inner(&id);

        // Calculate pending rewards
        let pending_rewards = calculate_rewards_internal(
            amount,
            pool.reward_rate,
            last_claim_time,
            current_time
        );

        // Extract rewards from pool
        let rewards_balance = if (pending_rewards > 0) {
            assert!(balance::value(&pool.reward_balance) >= pending_rewards, EInsufficientPoolBalance);
            balance::split(&mut pool.reward_balance, pending_rewards)
        } else {
            balance::zero<T>()
        };

        // Update pool state
        pool.total_staked = pool.total_staked - amount;

        // Combine staked tokens and rewards
        balance::join(&mut staked_balance, rewards_balance);
        let total_coins = coin::from_balance(staked_balance, ctx);

        // Emit unstaked event
        event::emit(Unstaked {
            pool_id: object::id(pool),
            position_id,
            staker,
            amount: amount + pending_rewards,
            timestamp: current_time,
        });

        // Delete the position object
        object::delete(id);

        total_coins
    }

    /// Claim accumulated rewards without unstaking
    ///
    /// # Arguments
    /// * `pool` - The staking pool
    /// * `position` - The stake position
    /// * `clock` - Sui clock for timestamp
    /// * `ctx` - Transaction context
    ///
    /// # Returns
    /// * Coin<T> - The claimed rewards
    public fun claim_rewards<T>(
        pool: &mut StakingPool<T>,
        position: &mut StakePosition<T>,
        clock: &sui::clock::Clock,
        ctx: &mut TxContext
    ): Coin<T> {
        let current_time = sui::clock::timestamp_ms(clock);

        // Calculate pending rewards
        let pending_rewards = calculate_rewards_internal(
            position.amount,
            pool.reward_rate,
            position.last_claim_time,
            current_time
        );

        assert!(pending_rewards > 0, EZeroAmount);
        assert!(balance::value(&pool.reward_balance) >= pending_rewards, EInsufficientPoolBalance);

        // Extract rewards from pool
        let rewards_balance = balance::split(&mut pool.reward_balance, pending_rewards);
        let rewards_coin = coin::from_balance(rewards_balance, ctx);

        // Update position state
        position.last_claim_time = current_time;
        position.rewards_claimed = position.rewards_claimed + pending_rewards;

        // Emit rewards claimed event
        event::emit(RewardsClaimed {
            pool_id: object::id(pool),
            position_id: object::id(position),
            staker: position.staker,
            rewards: pending_rewards,
            timestamp: current_time,
        });

        rewards_coin
    }

    /// Calculate pending rewards for a stake position
    ///
    /// # Arguments
    /// * `position` - The stake position
    /// * `pool` - The staking pool
    /// * `clock` - Sui clock for current timestamp
    ///
    /// # Returns
    /// * u64 - Amount of pending rewards
    public fun calculate_rewards<T>(
        position: &StakePosition<T>,
        pool: &StakingPool<T>,
        clock: &sui::clock::Clock
    ): u64 {
        let current_time = sui::clock::timestamp_ms(clock);
        calculate_rewards_internal(
            position.amount,
            pool.reward_rate,
            position.last_claim_time,
            current_time
        )
    }

    /// Internal reward calculation function
    ///
    /// Formula: rewards = (amount * reward_rate * time_elapsed_seconds) / (SECONDS_PER_YEAR * PRECISION)
    ///
    /// Example:
    /// - Stake: 1000 tokens
    /// - APY: 10% (reward_rate = 1000)
    /// - Time: 30 days (2,592,000 seconds)
    /// - Rewards = (1000 * 1000 * 2592000) / (31536000 * 10000)
    ///          = 2,592,000,000,000 / 315,360,000,000
    ///          = ~8.22 tokens
    fun calculate_rewards_internal(
        amount: u64,
        reward_rate: u64,
        last_claim_time: u64,
        current_time: u64
    ): u64 {
        if (current_time <= last_claim_time) {
            return 0
        };

        // Convert time from milliseconds to seconds
        let time_elapsed = (current_time - last_claim_time) / 1000;

        if (time_elapsed == 0) {
            return 0
        };

        // Calculate rewards with overflow protection
        // rewards = (amount * reward_rate * time_elapsed) / (SECONDS_PER_YEAR * PRECISION)

        // Use u128 for intermediate calculations to prevent overflow
        let amount_128 = (amount as u128);
        let reward_rate_128 = (reward_rate as u128);
        let time_elapsed_128 = (time_elapsed as u128);
        let seconds_per_year_128 = (SECONDS_PER_YEAR as u128);
        let precision_128 = (PRECISION as u128);

        let numerator = amount_128 * reward_rate_128 * time_elapsed_128;
        let denominator = seconds_per_year_128 * precision_128;

        let rewards_128 = numerator / denominator;

        // Ensure result fits in u64
        assert!(rewards_128 <= (18446744073709551615u128), EOverflow);

        (rewards_128 as u64)
    }

    /// Update the reward rate (owner only)
    ///
    /// # Arguments
    /// * `pool` - The staking pool
    /// * `_cap` - Pool admin capability
    /// * `new_rate` - New annual reward rate in basis points
    /// * `clock` - Sui clock for timestamp
    public fun update_reward_rate<T>(
        pool: &mut StakingPool<T>,
        _cap: &StakingPoolCap,
        new_rate: u64,
        clock: &sui::clock::Clock
    ) {
        assert!(new_rate > 0, EInvalidRewardRate);

        let old_rate = pool.reward_rate;
        pool.reward_rate = new_rate;

        // Emit reward rate updated event
        event::emit(RewardRateUpdated {
            pool_id: object::id(pool),
            old_rate,
            new_rate,
            timestamp: sui::clock::timestamp_ms(clock),
        });
    }

    /// Add more rewards to the pool
    ///
    /// # Arguments
    /// * `pool` - The staking pool
    /// * `rewards` - Additional reward tokens
    public fun add_rewards<T>(
        pool: &mut StakingPool<T>,
        rewards: Coin<T>
    ) {
        let reward_balance = coin::into_balance(rewards);
        balance::join(&mut pool.reward_balance, reward_balance);
    }

    // ==================== View Functions ====================

    /// Get pool total staked amount
    public fun pool_total_staked<T>(pool: &StakingPool<T>): u64 {
        pool.total_staked
    }

    /// Get pool reward rate
    public fun pool_reward_rate<T>(pool: &StakingPool<T>): u64 {
        pool.reward_rate
    }

    /// Get pool lock duration
    public fun pool_lock_duration<T>(pool: &StakingPool<T>): u64 {
        pool.lock_duration
    }

    /// Get pool owner
    public fun pool_owner<T>(pool: &StakingPool<T>): address {
        pool.owner
    }

    /// Get pool reward balance
    public fun pool_reward_balance<T>(pool: &StakingPool<T>): u64 {
        balance::value(&pool.reward_balance)
    }

    /// Get pool organization ID
    public fun pool_organization_id<T>(pool: &StakingPool<T>): Option<address> {
        pool.organization_id
    }

    /// Get position staker address
    public fun position_staker<T>(position: &StakePosition<T>): address {
        position.staker
    }

    /// Get position staked amount
    public fun position_amount<T>(position: &StakePosition<T>): u64 {
        position.amount
    }

    /// Get position start time
    public fun position_start_time<T>(position: &StakePosition<T>): u64 {
        position.start_time
    }

    /// Get position lock end time
    public fun position_lock_end<T>(position: &StakePosition<T>): u64 {
        position.lock_end
    }

    /// Get position total rewards claimed
    public fun position_rewards_claimed<T>(position: &StakePosition<T>): u64 {
        position.rewards_claimed
    }

    /// Check if position can be unstaked
    public fun can_unstake<T>(position: &StakePosition<T>, clock: &sui::clock::Clock): bool {
        sui::clock::timestamp_ms(clock) >= position.lock_end
    }

    // ==================== Test Functions ====================

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        // Test initialization if needed
    }
}
