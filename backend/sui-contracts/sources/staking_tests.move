// SPDX-License-Identifier: MIT
#[test_only]
module one_staking::staking_tests {
    use sui::test_scenario::{Self as test, Scenario, next_tx, ctx};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::clock::{Self, Clock};
    use one_staking::staking::{Self, StakingPool, StakePosition, StakingPoolCap};

    // Test addresses
    const ADMIN: address = @0xAD;
    const STAKER1: address = @0x1;
    const STAKER2: address = @0x2;

    // Test constants
    const INITIAL_BALANCE: u64 = 100000;
    const STAKE_AMOUNT: u64 = 10000;
    const REWARD_RATE: u64 = 1000; // 10% APY
    const LOCK_DURATION: u64 = 2592000; // 30 days in seconds

    // Helper: Create test clock
    fun create_test_clock(scenario: &mut Scenario): Clock {
        clock::create_for_testing(ctx(scenario))
    }

    // Helper: Advance clock by seconds
    fun advance_clock(clock: &mut Clock, seconds: u64) {
        clock::increment_for_testing(clock, seconds * 1000); // Convert to milliseconds
    }

    // Helper: Create test coin
    fun mint_coin(amount: u64, scenario: &mut Scenario): Coin<SUI> {
        coin::mint_for_testing<SUI>(amount, ctx(scenario))
    }

    #[test]
    /// Test creating a staking pool
    fun test_create_pool() {
        let mut scenario = test::begin(ADMIN);
        let mut clock = create_test_clock(&mut scenario);

        next_tx(&mut scenario, ADMIN);
        {
            let initial_rewards = mint_coin(INITIAL_BALANCE, &mut scenario);
            let cap = staking::create_pool<SUI>(
                REWARD_RATE,
                LOCK_DURATION,
                initial_rewards,
                option::none(),
                &clock,
                ctx(&mut scenario)
            );
            transfer::public_transfer(cap, ADMIN);
        };

        next_tx(&mut scenario, ADMIN);
        {
            let pool = test::take_shared<StakingPool<SUI>>(&scenario);

            assert!(staking::pool_reward_rate(&pool) == REWARD_RATE, 0);
            assert!(staking::pool_lock_duration(&pool) == LOCK_DURATION, 1);
            assert!(staking::pool_total_staked(&pool) == 0, 2);
            assert!(staking::pool_owner(&pool) == ADMIN, 3);
            assert!(staking::pool_reward_balance(&pool) == INITIAL_BALANCE, 4);

            test::return_shared(pool);
        };

        clock::destroy_for_testing(clock);
        test::end(scenario);
    }

    #[test]
    /// Test staking tokens
    fun test_stake() {
        let mut scenario = test::begin(ADMIN);
        let mut clock = create_test_clock(&mut scenario);

        // Create pool
        next_tx(&mut scenario, ADMIN);
        {
            let initial_rewards = mint_coin(INITIAL_BALANCE, &mut scenario);
            let cap = staking::create_pool<SUI>(
                REWARD_RATE,
                LOCK_DURATION,
                initial_rewards,
                option::none(),
                &clock,
                ctx(&mut scenario)
            );
            transfer::public_transfer(cap, ADMIN);
        };

        // Stake tokens
        next_tx(&mut scenario, STAKER1);
        {
            let mut pool = test::take_shared<StakingPool<SUI>>(&scenario);
            let stake_coins = mint_coin(STAKE_AMOUNT, &mut scenario);

            let position = staking::stake(&mut pool, stake_coins, &clock, ctx(&mut scenario));

            assert!(staking::pool_total_staked(&pool) == STAKE_AMOUNT, 0);
            assert!(staking::position_amount(&position) == STAKE_AMOUNT, 1);
            assert!(staking::position_staker(&position) == STAKER1, 2);

            transfer::public_transfer(position, STAKER1);
            test::return_shared(pool);
        };

        clock::destroy_for_testing(clock);
        test::end(scenario);
    }

    #[test]
    /// Test reward calculation after 30 days
    fun test_calculate_rewards_30_days() {
        let mut scenario = test::begin(ADMIN);
        let mut clock = create_test_clock(&mut scenario);

        // Create pool
        next_tx(&mut scenario, ADMIN);
        {
            let initial_rewards = mint_coin(INITIAL_BALANCE, &mut scenario);
            let cap = staking::create_pool<SUI>(
                REWARD_RATE,
                LOCK_DURATION,
                initial_rewards,
                option::none(),
                &clock,
                ctx(&mut scenario)
            );
            transfer::public_transfer(cap, ADMIN);
        };

        // Stake tokens
        next_tx(&mut scenario, STAKER1);
        {
            let mut pool = test::take_shared<StakingPool<SUI>>(&scenario);
            let stake_coins = mint_coin(STAKE_AMOUNT, &mut scenario);
            let position = staking::stake(&mut pool, stake_coins, &clock, ctx(&mut scenario));
            transfer::public_transfer(position, STAKER1);
            test::return_shared(pool);
        };

        // Advance 30 days
        advance_clock(&mut clock, LOCK_DURATION);

        // Check rewards
        next_tx(&mut scenario, STAKER1);
        {
            let pool = test::take_shared<StakingPool<SUI>>(&scenario);
            let position = test::take_from_sender<StakePosition<SUI>>(&scenario);

            let rewards = staking::calculate_rewards(&position, &pool, &clock);

            // Expected: (10000 * 1000 * 2592000) / (31536000 * 10000) ≈ 82.19
            assert!(rewards >= 82 && rewards <= 83, 0);

            test::return_to_sender(&scenario, position);
            test::return_shared(pool);
        };

        clock::destroy_for_testing(clock);
        test::end(scenario);
    }

    #[test]
    /// Test claiming rewards
    fun test_claim_rewards() {
        let mut scenario = test::begin(ADMIN);
        let mut clock = create_test_clock(&mut scenario);

        // Create pool
        next_tx(&mut scenario, ADMIN);
        {
            let initial_rewards = mint_coin(INITIAL_BALANCE, &mut scenario);
            let cap = staking::create_pool<SUI>(
                REWARD_RATE,
                LOCK_DURATION,
                initial_rewards,
                option::none(),
                &clock,
                ctx(&mut scenario)
            );
            transfer::public_transfer(cap, ADMIN);
        };

        // Stake tokens
        next_tx(&mut scenario, STAKER1);
        {
            let mut pool = test::take_shared<StakingPool<SUI>>(&scenario);
            let stake_coins = mint_coin(STAKE_AMOUNT, &mut scenario);
            let position = staking::stake(&mut pool, stake_coins, &clock, ctx(&mut scenario));
            transfer::public_transfer(position, STAKER1);
            test::return_shared(pool);
        };

        // Advance 30 days
        advance_clock(&mut clock, LOCK_DURATION);

        // Claim rewards
        next_tx(&mut scenario, STAKER1);
        {
            let mut pool = test::take_shared<StakingPool<SUI>>(&scenario);
            let mut position = test::take_from_sender<StakePosition<SUI>>(&scenario);

            let rewards_coin = staking::claim_rewards(&mut pool, &mut position, &clock, ctx(&mut scenario));
            let rewards_amount = coin::value(&rewards_coin);

            assert!(rewards_amount >= 82 && rewards_amount <= 83, 0);
            assert!(staking::position_rewards_claimed(&position) == rewards_amount, 1);

            coin::burn_for_testing(rewards_coin);
            test::return_to_sender(&scenario, position);
            test::return_shared(pool);
        };

        clock::destroy_for_testing(clock);
        test::end(scenario);
    }

    #[test]
    /// Test unstaking after lock period
    fun test_unstake() {
        let mut scenario = test::begin(ADMIN);
        let mut clock = create_test_clock(&mut scenario);

        // Create pool
        next_tx(&mut scenario, ADMIN);
        {
            let initial_rewards = mint_coin(INITIAL_BALANCE, &mut scenario);
            let cap = staking::create_pool<SUI>(
                REWARD_RATE,
                LOCK_DURATION,
                initial_rewards,
                option::none(),
                &clock,
                ctx(&mut scenario)
            );
            transfer::public_transfer(cap, ADMIN);
        };

        // Stake tokens
        next_tx(&mut scenario, STAKER1);
        {
            let mut pool = test::take_shared<StakingPool<SUI>>(&scenario);
            let stake_coins = mint_coin(STAKE_AMOUNT, &mut scenario);
            let position = staking::stake(&mut pool, stake_coins, &clock, ctx(&mut scenario));
            transfer::public_transfer(position, STAKER1);
            test::return_shared(pool);
        };

        // Advance 30 days
        advance_clock(&mut clock, LOCK_DURATION);

        // Unstake
        next_tx(&mut scenario, STAKER1);
        {
            let mut pool = test::take_shared<StakingPool<SUI>>(&scenario);
            let position = test::take_from_sender<StakePosition<SUI>>(&scenario);

            let total_coins = staking::unstake(&mut pool, position, &clock, ctx(&mut scenario));
            let total_amount = coin::value(&total_coins);

            // Should get stake + rewards
            assert!(total_amount >= STAKE_AMOUNT + 82, 0);
            assert!(staking::pool_total_staked(&pool) == 0, 1);

            coin::burn_for_testing(total_coins);
            test::return_shared(pool);
        };

        clock::destroy_for_testing(clock);
        test::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = staking::ELockPeriodActive)]
    /// Test unstaking before lock period expires (should fail)
    fun test_unstake_before_lock_fails() {
        let mut scenario = test::begin(ADMIN);
        let mut clock = create_test_clock(&mut scenario);

        // Create pool
        next_tx(&mut scenario, ADMIN);
        {
            let initial_rewards = mint_coin(INITIAL_BALANCE, &mut scenario);
            let cap = staking::create_pool<SUI>(
                REWARD_RATE,
                LOCK_DURATION,
                initial_rewards,
                option::none(),
                &clock,
                ctx(&mut scenario)
            );
            transfer::public_transfer(cap, ADMIN);
        };

        // Stake tokens
        next_tx(&mut scenario, STAKER1);
        {
            let mut pool = test::take_shared<StakingPool<SUI>>(&scenario);
            let stake_coins = mint_coin(STAKE_AMOUNT, &mut scenario);
            let position = staking::stake(&mut pool, stake_coins, &clock, ctx(&mut scenario));
            transfer::public_transfer(position, STAKER1);
            test::return_shared(pool);
        };

        // Try to unstake immediately (should fail)
        next_tx(&mut scenario, STAKER1);
        {
            let mut pool = test::take_shared<StakingPool<SUI>>(&scenario);
            let position = test::take_from_sender<StakePosition<SUI>>(&scenario);

            let coins = staking::unstake(&mut pool, position, &clock, ctx(&mut scenario));
            coin::burn_for_testing(coins);
            test::return_shared(pool);
        };

        clock::destroy_for_testing(clock);
        test::end(scenario);
    }

    #[test]
    /// Test updating reward rate
    fun test_update_reward_rate() {
        let mut scenario = test::begin(ADMIN);
        let mut clock = create_test_clock(&mut scenario);

        // Create pool
        next_tx(&mut scenario, ADMIN);
        {
            let initial_rewards = mint_coin(INITIAL_BALANCE, &mut scenario);
            let cap = staking::create_pool<SUI>(
                REWARD_RATE,
                LOCK_DURATION,
                initial_rewards,
                option::none(),
                &clock,
                ctx(&mut scenario)
            );
            transfer::public_transfer(cap, ADMIN);
        };

        // Update reward rate
        next_tx(&mut scenario, ADMIN);
        {
            let mut pool = test::take_shared<StakingPool<SUI>>(&scenario);
            let cap = test::take_from_sender<StakingPoolCap>(&scenario);

            let new_rate = 2000; // 20% APY
            staking::update_reward_rate(&mut pool, &cap, new_rate, &clock);

            assert!(staking::pool_reward_rate(&pool) == new_rate, 0);

            test::return_to_sender(&scenario, cap);
            test::return_shared(pool);
        };

        clock::destroy_for_testing(clock);
        test::end(scenario);
    }

    #[test]
    /// Test multiple stakers
    fun test_multiple_stakers() {
        let mut scenario = test::begin(ADMIN);
        let mut clock = create_test_clock(&mut scenario);

        // Create pool
        next_tx(&mut scenario, ADMIN);
        {
            let initial_rewards = mint_coin(INITIAL_BALANCE, &mut scenario);
            let cap = staking::create_pool<SUI>(
                REWARD_RATE,
                LOCK_DURATION,
                initial_rewards,
                option::none(),
                &clock,
                ctx(&mut scenario)
            );
            transfer::public_transfer(cap, ADMIN);
        };

        // Staker1 stakes
        next_tx(&mut scenario, STAKER1);
        {
            let mut pool = test::take_shared<StakingPool<SUI>>(&scenario);
            let stake_coins = mint_coin(STAKE_AMOUNT, &mut scenario);
            let position = staking::stake(&mut pool, stake_coins, &clock, ctx(&mut scenario));
            transfer::public_transfer(position, STAKER1);
            test::return_shared(pool);
        };

        // Staker2 stakes
        next_tx(&mut scenario, STAKER2);
        {
            let mut pool = test::take_shared<StakingPool<SUI>>(&scenario);
            let stake_coins = mint_coin(STAKE_AMOUNT * 2, &mut scenario);
            let position = staking::stake(&mut pool, stake_coins, &clock, ctx(&mut scenario));

            assert!(staking::pool_total_staked(&pool) == STAKE_AMOUNT * 3, 0);

            transfer::public_transfer(position, STAKER2);
            test::return_shared(pool);
        };

        clock::destroy_for_testing(clock);
        test::end(scenario);
    }
}
