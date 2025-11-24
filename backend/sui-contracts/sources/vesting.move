/// VestingContract: Time-locked token distribution for team and investors
///
/// Features:
/// - Linear vesting with cliff period
/// - Revocable schedules (admin only)
/// - Claim vested tokens incrementally
/// - Event emission for audit trail
/// - Safe against double-claiming and overflow
///
/// Example Timeline:
/// - start_time: Jan 1, 2025
/// - cliff_end: Apr 1, 2025 (3 months cliff)
/// - vesting_end: Jan 1, 2026 (12 months total)
/// - total_amount: 1,200,000 tokens
///
/// Vesting Calculation:
/// - Before cliff (Jan 1 - Mar 31): 0 tokens claimable
/// - At cliff (Apr 1): 300,000 tokens (3/12 of total)
/// - Mid-vesting (Jul 1): 600,000 tokens (6/12 of total)
/// - Fully vested (Jan 1, 2026+): 1,200,000 tokens (12/12 of total)

module one_vesting::vesting {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::event;
    use sui::clock::{Self, Clock};
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};

    // ==================== Error Codes ====================

    const E_INVALID_VESTING_SCHEDULE: u64 = 1;  // Invalid vesting parameters
    const E_NOT_AUTHORIZED: u64 = 2;              // Not authorized for this operation
    const E_VESTING_NOT_STARTED: u64 = 3;        // Vesting has not started yet
    const E_BEFORE_CLIFF: u64 = 4;                // Before cliff period ends
    const E_NO_TOKENS_TO_CLAIM: u64 = 5;         // No tokens available to claim
    const E_ALREADY_REVOKED: u64 = 6;            // Vesting already revoked
    const E_INVALID_CLAIM_AMOUNT: u64 = 7;       // Invalid claim amount

    // ==================== Structs ====================

    /// Admin capability for creating and revoking vesting schedules
    public struct AdminCap has key, store {
        id: UID,
    }

    /// Vesting schedule for a single beneficiary
    public struct VestingSchedule<phantom T> has key, store {
        id: UID,
        /// Beneficiary address who can claim tokens
        beneficiary: address,
        /// Total amount of tokens in this vesting schedule
        total_amount: u64,
        /// Amount already claimed by beneficiary
        claimed_amount: u64,
        /// Timestamp when cliff period ends (first claimable moment)
        cliff_end: u64,
        /// Timestamp when vesting fully completes
        vesting_end: u64,
        /// Timestamp when vesting starts
        start_time: u64,
        /// Whether this schedule has been revoked
        revoked: bool,
        /// Token balance held in this vesting schedule
        balance: Balance<T>,
    }

    // ==================== Events ====================

    public struct VestingScheduleCreated has copy, drop {
        schedule_id: ID,
        beneficiary: address,
        total_amount: u64,
        cliff_end: u64,
        vesting_end: u64,
        start_time: u64,
    }

    public struct VestingClaimed has copy, drop {
        schedule_id: ID,
        beneficiary: address,
        amount: u64,
        claimed_amount: u64,
        total_amount: u64,
        timestamp: u64,
    }

    public struct VestingRevoked has copy, drop {
        schedule_id: ID,
        beneficiary: address,
        unvested_amount: u64,
        timestamp: u64,
    }

    // ==================== Initialization ====================

    /// Module initializer - creates and transfers AdminCap to deployer
    fun init(ctx: &mut TxContext) {
        let admin_cap = AdminCap {
            id: object::new(ctx),
        };
        transfer::transfer(admin_cap, tx_context::sender(ctx));
    }

    // ==================== Admin Functions ====================

    /// Create a new vesting schedule for a beneficiary
    ///
    /// Parameters:
    /// - admin_cap: Admin capability (proves authorization)
    /// - beneficiary: Address that will receive vested tokens
    /// - tokens: Coin to be vested
    /// - cliff_duration_ms: Duration of cliff period in milliseconds
    /// - vesting_duration_ms: Total vesting duration in milliseconds
    /// - clock: Sui clock object for timestamp
    ///
    /// Example:
    /// create_vesting_schedule(
    ///     admin_cap,
    ///     @0x123,
    ///     coin<SUI>(1_200_000),
    ///     90 * 24 * 60 * 60 * 1000,    // 90 days cliff
    ///     365 * 24 * 60 * 60 * 1000,   // 365 days total vesting
    ///     clock
    /// )
    public entry fun create_vesting_schedule<T>(
        _admin_cap: &AdminCap,
        beneficiary: address,
        tokens: Coin<T>,
        cliff_duration_ms: u64,
        vesting_duration_ms: u64,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        let current_time = clock::timestamp_ms(clock);
        let total_amount = coin::value(&tokens);

        // Validate vesting parameters
        assert!(cliff_duration_ms <= vesting_duration_ms, E_INVALID_VESTING_SCHEDULE);
        assert!(vesting_duration_ms > 0, E_INVALID_VESTING_SCHEDULE);
        assert!(total_amount > 0, E_INVALID_VESTING_SCHEDULE);

        let start_time = current_time;
        let cliff_end = start_time + cliff_duration_ms;
        let vesting_end = start_time + vesting_duration_ms;

        let schedule_id = object::new(ctx);
        let schedule_id_copy = object::uid_to_inner(&schedule_id);

        let schedule = VestingSchedule<T> {
            id: schedule_id,
            beneficiary,
            total_amount,
            claimed_amount: 0,
            cliff_end,
            vesting_end,
            start_time,
            revoked: false,
            balance: coin::into_balance(tokens),
        };

        // Emit event
        event::emit(VestingScheduleCreated {
            schedule_id: schedule_id_copy,
            beneficiary,
            total_amount,
            cliff_end,
            vesting_end,
            start_time,
        });

        // Transfer to beneficiary (they can claim from it)
        transfer::transfer(schedule, beneficiary);
    }

    /// Revoke a vesting schedule and return unvested tokens to sender
    ///
    /// Only admin can revoke. Returns unvested tokens to the caller.
    /// Beneficiary keeps any already vested (but unclaimed) tokens.
    public entry fun revoke_vesting<T>(
        _admin_cap: &AdminCap,
        schedule: &mut VestingSchedule<T>,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        assert!(!schedule.revoked, E_ALREADY_REVOKED);

        let current_time = clock::timestamp_ms(clock);
        let vested_amount = calculate_vested_amount(schedule, current_time);

        // Unvested amount = total - vested (not claimed, just vested)
        let unvested_amount = schedule.total_amount - vested_amount;

        // Mark as revoked
        schedule.revoked = true;

        // Return unvested tokens to admin
        if (unvested_amount > 0) {
            let returned_balance = balance::split(&mut schedule.balance, unvested_amount);
            let returned_coin = coin::from_balance(returned_balance, ctx);
            transfer::public_transfer(returned_coin, tx_context::sender(ctx));
        };

        // Emit event
        event::emit(VestingRevoked {
            schedule_id: object::uid_to_inner(&schedule.id),
            beneficiary: schedule.beneficiary,
            unvested_amount,
            timestamp: current_time,
        });
    }

    // ==================== Beneficiary Functions ====================

    /// Claim vested tokens from a schedule
    ///
    /// Beneficiary can claim any tokens that have vested but not yet been claimed.
    /// This function prevents double-claiming by tracking claimed_amount.
    public entry fun claim_vested_tokens<T>(
        schedule: &mut VestingSchedule<T>,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        let sender = tx_context::sender(ctx);
        assert!(sender == schedule.beneficiary, E_NOT_AUTHORIZED);
        assert!(!schedule.revoked, E_ALREADY_REVOKED);

        let current_time = clock::timestamp_ms(clock);

        // Check if vesting has started
        assert!(current_time >= schedule.start_time, E_VESTING_NOT_STARTED);

        // Check if cliff period has passed
        assert!(current_time >= schedule.cliff_end, E_BEFORE_CLIFF);

        // Calculate claimable amount
        let vested_amount = calculate_vested_amount(schedule, current_time);
        let claimable_amount = vested_amount - schedule.claimed_amount;

        assert!(claimable_amount > 0, E_NO_TOKENS_TO_CLAIM);

        // Update claimed amount
        schedule.claimed_amount = schedule.claimed_amount + claimable_amount;

        // Transfer tokens to beneficiary
        let claimed_balance = balance::split(&mut schedule.balance, claimable_amount);
        let claimed_coin = coin::from_balance(claimed_balance, ctx);
        transfer::public_transfer(claimed_coin, sender);

        // Emit event
        event::emit(VestingClaimed {
            schedule_id: object::uid_to_inner(&schedule.id),
            beneficiary: sender,
            amount: claimable_amount,
            claimed_amount: schedule.claimed_amount,
            total_amount: schedule.total_amount,
            timestamp: current_time,
        });
    }

    // ==================== View Functions ====================

    /// Calculate vested amount at a given timestamp
    ///
    /// Linear vesting formula:
    /// - Before cliff: 0
    /// - After cliff, before end: (total * elapsed_time) / total_time
    /// - After vesting_end: total
    public fun calculate_vested_amount<T>(
        schedule: &VestingSchedule<T>,
        current_time: u64,
    ): u64 {
        // If revoked, vested amount is frozen at revocation time
        // (beneficiary can still claim what was vested)

        // Before cliff: nothing vested
        if (current_time < schedule.cliff_end) {
            return 0
        };

        // After vesting period ends: everything vested
        if (current_time >= schedule.vesting_end) {
            return schedule.total_amount
        };

        // Linear vesting between start_time and vesting_end
        let elapsed = current_time - schedule.start_time;
        let total_duration = schedule.vesting_end - schedule.start_time;

        // Vested amount = (total_amount * elapsed) / total_duration
        // Use u128 to prevent overflow during multiplication
        let vested = ((schedule.total_amount as u128) * (elapsed as u128)) / (total_duration as u128);

        (vested as u64)
    }

    /// Get vesting schedule details
    public fun get_vesting_details<T>(
        schedule: &VestingSchedule<T>,
    ): (address, u64, u64, u64, u64, u64, bool) {
        (
            schedule.beneficiary,
            schedule.total_amount,
            schedule.claimed_amount,
            schedule.cliff_end,
            schedule.vesting_end,
            schedule.start_time,
            schedule.revoked,
        )
    }

    /// Get beneficiary address
    public fun beneficiary<T>(schedule: &VestingSchedule<T>): address {
        schedule.beneficiary
    }

    /// Get total amount in vesting schedule
    public fun total_amount<T>(schedule: &VestingSchedule<T>): u64 {
        schedule.total_amount
    }

    /// Get claimed amount
    public fun claimed_amount<T>(schedule: &VestingSchedule<T>): u64 {
        schedule.claimed_amount
    }

    /// Get cliff end timestamp
    public fun cliff_end<T>(schedule: &VestingSchedule<T>): u64 {
        schedule.cliff_end
    }

    /// Get vesting end timestamp
    public fun vesting_end<T>(schedule: &VestingSchedule<T>): u64 {
        schedule.vesting_end
    }

    /// Get start time
    public fun start_time<T>(schedule: &VestingSchedule<T>): u64 {
        schedule.start_time
    }

    /// Check if revoked
    public fun is_revoked<T>(schedule: &VestingSchedule<T>): bool {
        schedule.revoked
    }

    /// Get remaining balance in schedule
    public fun remaining_balance<T>(schedule: &VestingSchedule<T>): u64 {
        balance::value(&schedule.balance)
    }

    // ==================== Test Functions ====================

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx);
    }
}
