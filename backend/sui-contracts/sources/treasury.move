/// Treasury Multi-Signature Wallet Module
///
/// Implements a secure M-of-N multi-signature treasury for DAO fund management.
/// Supports multi-asset holdings (SUI + custom tokens), transaction proposals with expiry,
/// approval tracking, and owner management.
///
/// Key features:
/// - M-of-N multi-sig (e.g., 3 of 5 owners must approve)
/// - Transaction expiry (proposals expire after set time)
/// - Prevent double-approval from same owner
/// - Add/remove owners via multi-sig approval
/// - Update approval threshold via multi-sig
/// - Multi-asset support (SUI + any Coin<T>)
/// - Complete event emission for audit trail

module treasury::multi_sig {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::sui::SUI;
    use sui::event;
    use sui::vec_map::{Self, VecMap};
    use std::vector;
    use std::option::{Self, Option};

    // ====== Error Codes ======

    /// Caller is not an owner of the treasury
    const E_NOT_OWNER: u64 = 1;

    /// Transaction has already been executed
    const E_ALREADY_EXECUTED: u64 = 2;

    /// Transaction has expired and cannot be approved/executed
    const E_TRANSACTION_EXPIRED: u64 = 3;

    /// Owner has already approved this transaction
    const E_ALREADY_APPROVED: u64 = 4;

    /// Not enough approvals to execute transaction
    const E_INSUFFICIENT_APPROVALS: u64 = 5;

    /// Invalid threshold (must be > 0 and <= owner count)
    const E_INVALID_THRESHOLD: u64 = 6;

    /// Owner already exists in treasury
    const E_OWNER_ALREADY_EXISTS: u64 = 7;

    /// Owner does not exist in treasury
    const E_OWNER_NOT_FOUND: u64 = 8;

    /// Cannot remove owner: would violate threshold
    const E_CANNOT_REMOVE_OWNER: u64 = 9;

    /// Transaction not found
    const E_TRANSACTION_NOT_FOUND: u64 = 10;

    /// Insufficient balance in treasury
    const E_INSUFFICIENT_BALANCE: u64 = 11;

    /// Invalid transaction type
    const E_INVALID_TRANSACTION_TYPE: u64 = 12;

    // ====== Constants ======

    /// Default transaction expiry: 7 days in milliseconds
    const DEFAULT_EXPIRY_MS: u64 = 604800000;

    /// Transaction types
    const TX_TYPE_TRANSFER: u8 = 1;
    const TX_TYPE_ADD_OWNER: u8 = 2;
    const TX_TYPE_REMOVE_OWNER: u8 = 3;
    const TX_TYPE_UPDATE_THRESHOLD: u8 = 4;

    // ====== Structs ======

    /// Main Treasury object - holds multi-asset balances and configuration
    struct Treasury has key, store {
        id: UID,
        /// List of owner addresses (multi-sig participants)
        owners: vector<address>,
        /// Number of approvals required to execute transactions (M in M-of-N)
        threshold: u64,
        /// SUI balance held in treasury
        sui_balance: Balance<SUI>,
        /// Nonce for generating unique transaction IDs
        nonce: u64,
        /// Timestamp when treasury was created
        created_at: u64,
    }

    /// Pending transaction awaiting approvals
    struct PendingTransaction has key, store {
        id: UID,
        /// Treasury this transaction belongs to
        treasury_id: ID,
        /// Transaction type (transfer, add_owner, remove_owner, update_threshold)
        tx_type: u8,
        /// Recipient address (for transfers)
        to: Option<address>,
        /// Amount to transfer (for SUI transfers)
        amount: u64,
        /// Additional call data for complex operations
        calldata: vector<u8>,
        /// Addresses that have approved this transaction
        approvals: vector<address>,
        /// Whether transaction has been executed
        executed: bool,
        /// Timestamp when transaction was created
        created_at: u64,
        /// Timestamp when transaction expires
        expires_at: u64,
        /// Address that proposed the transaction
        proposer: address,
    }

    /// Generic balance holder for any Coin<T> type
    /// Allows treasury to hold multiple token types
    struct TokenBalance<phantom T> has key, store {
        id: UID,
        treasury_id: ID,
        balance: Balance<T>,
    }

    // ====== Events ======

    /// Emitted when a new treasury is created
    struct TreasuryCreated has copy, drop {
        treasury_id: ID,
        owners: vector<address>,
        threshold: u64,
        created_at: u64,
    }

    /// Emitted when a new transaction is proposed
    struct TransactionProposed has copy, drop {
        treasury_id: ID,
        transaction_id: ID,
        tx_type: u8,
        proposer: address,
        to: Option<address>,
        amount: u64,
        expires_at: u64,
    }

    /// Emitted when an owner approves a transaction
    struct TransactionApproved has copy, drop {
        treasury_id: ID,
        transaction_id: ID,
        approver: address,
        total_approvals: u64,
        threshold: u64,
    }

    /// Emitted when a transaction is executed
    struct TransactionExecuted has copy, drop {
        treasury_id: ID,
        transaction_id: ID,
        tx_type: u8,
        executor: address,
        executed_at: u64,
    }

    /// Emitted when an owner is added
    struct OwnerAdded has copy, drop {
        treasury_id: ID,
        new_owner: address,
        total_owners: u64,
    }

    /// Emitted when an owner is removed
    struct OwnerRemoved has copy, drop {
        treasury_id: ID,
        removed_owner: address,
        total_owners: u64,
    }

    /// Emitted when threshold is updated
    struct ThresholdUpdated has copy, drop {
        treasury_id: ID,
        old_threshold: u64,
        new_threshold: u64,
    }

    /// Emitted when funds are deposited
    struct FundsDeposited has copy, drop {
        treasury_id: ID,
        depositor: address,
        amount: u64,
        timestamp: u64,
    }

    // ====== Public Functions ======

    /// Create a new multi-sig treasury
    ///
    /// # Arguments
    /// * `owners` - Vector of owner addresses (must have at least `threshold` owners)
    /// * `threshold` - Number of approvals required (M in M-of-N)
    /// * `ctx` - Transaction context
    ///
    /// # Returns
    /// Treasury object transferred to sender
    public entry fun create_treasury(
        owners: vector<address>,
        threshold: u64,
        ctx: &mut TxContext
    ) {
        let owner_count = vector::length(&owners);

        // Validate threshold
        assert!(threshold > 0 && threshold <= owner_count, E_INVALID_THRESHOLD);

        // Validate no duplicate owners
        let i = 0;
        while (i < owner_count) {
            let owner = *vector::borrow(&owners, i);
            let j = i + 1;
            while (j < owner_count) {
                assert!(*vector::borrow(&owners, j) != owner, E_OWNER_ALREADY_EXISTS);
                j = j + 1;
            };
            i = i + 1;
        };

        let treasury = Treasury {
            id: object::new(ctx),
            owners,
            threshold,
            sui_balance: balance::zero(),
            nonce: 0,
            created_at: tx_context::epoch_timestamp_ms(ctx),
        };

        let treasury_id = object::uid_to_inner(&treasury.id);

        event::emit(TreasuryCreated {
            treasury_id,
            owners: treasury.owners,
            threshold,
            created_at: treasury.created_at,
        });

        transfer::share_object(treasury);
    }

    /// Deposit SUI into the treasury
    /// Anyone can deposit funds, but only owners can approve withdrawals
    public entry fun deposit_sui(
        treasury: &mut Treasury,
        payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let amount = coin::value(&payment);
        let depositor = tx_context::sender(ctx);

        balance::join(&mut treasury.sui_balance, coin::into_balance(payment));

        event::emit(FundsDeposited {
            treasury_id: object::uid_to_inner(&treasury.id),
            depositor,
            amount,
            timestamp: tx_context::epoch_timestamp_ms(ctx),
        });
    }

    /// Deposit any token type into the treasury
    /// Creates a new TokenBalance if this is the first deposit of this type
    public fun deposit_token<T>(
        treasury: &Treasury,
        payment: Coin<T>,
        ctx: &mut TxContext
    ): TokenBalance<T> {
        let amount = coin::value(&payment);
        let depositor = tx_context::sender(ctx);

        let token_balance = TokenBalance<T> {
            id: object::new(ctx),
            treasury_id: object::uid_to_inner(&treasury.id),
            balance: coin::into_balance(payment),
        };

        event::emit(FundsDeposited {
            treasury_id: object::uid_to_inner(&treasury.id),
            depositor,
            amount,
            timestamp: tx_context::epoch_timestamp_ms(ctx),
        });

        token_balance
    }

    /// Propose a new SUI transfer transaction
    ///
    /// # Arguments
    /// * `treasury` - Treasury to transfer from
    /// * `to` - Recipient address
    /// * `amount` - Amount of SUI to transfer (in MIST)
    /// * `expiry_ms` - Milliseconds until transaction expires (0 = use default)
    /// * `ctx` - Transaction context
    public entry fun propose_transfer(
        treasury: &mut Treasury,
        to: address,
        amount: u64,
        expiry_ms: u64,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(is_owner(treasury, sender), E_NOT_OWNER);
        assert!(balance::value(&treasury.sui_balance) >= amount, E_INSUFFICIENT_BALANCE);

        let expiry = if (expiry_ms == 0) { DEFAULT_EXPIRY_MS } else { expiry_ms };
        let created_at = tx_context::epoch_timestamp_ms(ctx);
        let expires_at = created_at + expiry;

        let pending_tx = PendingTransaction {
            id: object::new(ctx),
            treasury_id: object::uid_to_inner(&treasury.id),
            tx_type: TX_TYPE_TRANSFER,
            to: option::some(to),
            amount,
            calldata: vector::empty(),
            approvals: vector::empty(),
            executed: false,
            created_at,
            expires_at,
            proposer: sender,
        };

        let tx_id = object::uid_to_inner(&pending_tx.id);

        event::emit(TransactionProposed {
            treasury_id: object::uid_to_inner(&treasury.id),
            transaction_id: tx_id,
            tx_type: TX_TYPE_TRANSFER,
            proposer: sender,
            to: option::some(to),
            amount,
            expires_at,
        });

        treasury.nonce = treasury.nonce + 1;
        transfer::share_object(pending_tx);
    }

    /// Approve a pending transaction
    /// Owner can only approve once per transaction
    public entry fun approve_transaction(
        treasury: &Treasury,
        pending_tx: &mut PendingTransaction,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);

        // Verify sender is owner
        assert!(is_owner(treasury, sender), E_NOT_OWNER);

        // Verify transaction belongs to this treasury
        assert!(pending_tx.treasury_id == object::uid_to_inner(&treasury.id), E_TRANSACTION_NOT_FOUND);

        // Verify not already executed
        assert!(!pending_tx.executed, E_ALREADY_EXECUTED);

        // Verify not expired
        let now = tx_context::epoch_timestamp_ms(ctx);
        assert!(now < pending_tx.expires_at, E_TRANSACTION_EXPIRED);

        // Verify owner hasn't already approved
        assert!(!has_approved(pending_tx, sender), E_ALREADY_APPROVED);

        // Add approval
        vector::push_back(&mut pending_tx.approvals, sender);

        event::emit(TransactionApproved {
            treasury_id: pending_tx.treasury_id,
            transaction_id: object::uid_to_inner(&pending_tx.id),
            approver: sender,
            total_approvals: vector::length(&pending_tx.approvals),
            threshold: treasury.threshold,
        });
    }

    /// Execute a pending transaction after threshold approvals reached
    /// Can be called by any owner once threshold is met
    public entry fun execute_transaction(
        treasury: &mut Treasury,
        pending_tx: &mut PendingTransaction,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);

        // Verify sender is owner
        assert!(is_owner(treasury, sender), E_NOT_OWNER);

        // Verify transaction belongs to this treasury
        assert!(pending_tx.treasury_id == object::uid_to_inner(&treasury.id), E_TRANSACTION_NOT_FOUND);

        // Verify not already executed
        assert!(!pending_tx.executed, E_ALREADY_EXECUTED);

        // Verify not expired
        let now = tx_context::epoch_timestamp_ms(ctx);
        assert!(now < pending_tx.expires_at, E_TRANSACTION_EXPIRED);

        // Verify threshold met
        let approval_count = vector::length(&pending_tx.approvals);
        assert!(approval_count >= treasury.threshold, E_INSUFFICIENT_APPROVALS);

        // Mark as executed
        pending_tx.executed = true;

        // Execute based on transaction type
        if (pending_tx.tx_type == TX_TYPE_TRANSFER) {
            execute_transfer(treasury, pending_tx, ctx);
        } else if (pending_tx.tx_type == TX_TYPE_ADD_OWNER) {
            execute_add_owner(treasury, pending_tx);
        } else if (pending_tx.tx_type == TX_TYPE_REMOVE_OWNER) {
            execute_remove_owner(treasury, pending_tx);
        } else if (pending_tx.tx_type == TX_TYPE_UPDATE_THRESHOLD) {
            execute_update_threshold(treasury, pending_tx);
        } else {
            abort E_INVALID_TRANSACTION_TYPE
        };

        event::emit(TransactionExecuted {
            treasury_id: pending_tx.treasury_id,
            transaction_id: object::uid_to_inner(&pending_tx.id),
            tx_type: pending_tx.tx_type,
            executor: sender,
            executed_at: now,
        });
    }

    /// Propose adding a new owner (requires multi-sig approval)
    public entry fun propose_add_owner(
        treasury: &mut Treasury,
        new_owner: address,
        expiry_ms: u64,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(is_owner(treasury, sender), E_NOT_OWNER);
        assert!(!is_owner(treasury, new_owner), E_OWNER_ALREADY_EXISTS);

        let expiry = if (expiry_ms == 0) { DEFAULT_EXPIRY_MS } else { expiry_ms };
        let created_at = tx_context::epoch_timestamp_ms(ctx);
        let expires_at = created_at + expiry;

        // Encode new owner address in calldata
        let calldata = vector::empty<u8>();
        let owner_bytes = address_to_bytes(new_owner);
        vector::append(&mut calldata, owner_bytes);

        let pending_tx = PendingTransaction {
            id: object::new(ctx),
            treasury_id: object::uid_to_inner(&treasury.id),
            tx_type: TX_TYPE_ADD_OWNER,
            to: option::some(new_owner),
            amount: 0,
            calldata,
            approvals: vector::empty(),
            executed: false,
            created_at,
            expires_at,
            proposer: sender,
        };

        let tx_id = object::uid_to_inner(&pending_tx.id);

        event::emit(TransactionProposed {
            treasury_id: object::uid_to_inner(&treasury.id),
            transaction_id: tx_id,
            tx_type: TX_TYPE_ADD_OWNER,
            proposer: sender,
            to: option::some(new_owner),
            amount: 0,
            expires_at,
        });

        treasury.nonce = treasury.nonce + 1;
        transfer::share_object(pending_tx);
    }

    /// Propose removing an owner (requires multi-sig approval)
    public entry fun propose_remove_owner(
        treasury: &mut Treasury,
        owner_to_remove: address,
        expiry_ms: u64,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(is_owner(treasury, sender), E_NOT_OWNER);
        assert!(is_owner(treasury, owner_to_remove), E_OWNER_NOT_FOUND);

        // Verify removal won't violate threshold
        let owner_count = vector::length(&treasury.owners);
        assert!(owner_count - 1 >= treasury.threshold, E_CANNOT_REMOVE_OWNER);

        let expiry = if (expiry_ms == 0) { DEFAULT_EXPIRY_MS } else { expiry_ms };
        let created_at = tx_context::epoch_timestamp_ms(ctx);
        let expires_at = created_at + expiry;

        // Encode owner address in calldata
        let calldata = vector::empty<u8>();
        let owner_bytes = address_to_bytes(owner_to_remove);
        vector::append(&mut calldata, owner_bytes);

        let pending_tx = PendingTransaction {
            id: object::new(ctx),
            treasury_id: object::uid_to_inner(&treasury.id),
            tx_type: TX_TYPE_REMOVE_OWNER,
            to: option::some(owner_to_remove),
            amount: 0,
            calldata,
            approvals: vector::empty(),
            executed: false,
            created_at,
            expires_at,
            proposer: sender,
        };

        let tx_id = object::uid_to_inner(&pending_tx.id);

        event::emit(TransactionProposed {
            treasury_id: object::uid_to_inner(&treasury.id),
            transaction_id: tx_id,
            tx_type: TX_TYPE_REMOVE_OWNER,
            proposer: sender,
            to: option::some(owner_to_remove),
            amount: 0,
            expires_at,
        });

        treasury.nonce = treasury.nonce + 1;
        transfer::share_object(pending_tx);
    }

    /// Propose updating the approval threshold (requires multi-sig approval)
    public entry fun propose_update_threshold(
        treasury: &mut Treasury,
        new_threshold: u64,
        expiry_ms: u64,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(is_owner(treasury, sender), E_NOT_OWNER);

        let owner_count = vector::length(&treasury.owners);
        assert!(new_threshold > 0 && new_threshold <= owner_count, E_INVALID_THRESHOLD);

        let expiry = if (expiry_ms == 0) { DEFAULT_EXPIRY_MS } else { expiry_ms };
        let created_at = tx_context::epoch_timestamp_ms(ctx);
        let expires_at = created_at + expiry;

        let pending_tx = PendingTransaction {
            id: object::new(ctx),
            treasury_id: object::uid_to_inner(&treasury.id),
            tx_type: TX_TYPE_UPDATE_THRESHOLD,
            to: option::none(),
            amount: new_threshold,
            calldata: vector::empty(),
            approvals: vector::empty(),
            executed: false,
            created_at,
            expires_at,
            proposer: sender,
        };

        let tx_id = object::uid_to_inner(&pending_tx.id);

        event::emit(TransactionProposed {
            treasury_id: object::uid_to_inner(&treasury.id),
            transaction_id: tx_id,
            tx_type: TX_TYPE_UPDATE_THRESHOLD,
            proposer: sender,
            to: option::none(),
            amount: new_threshold,
            expires_at,
        });

        treasury.nonce = treasury.nonce + 1;
        transfer::share_object(pending_tx);
    }

    // ====== View Functions (Read-Only) ======

    /// Get treasury balance in SUI
    public fun get_balance(treasury: &Treasury): u64 {
        balance::value(&treasury.sui_balance)
    }

    /// Get treasury owners
    public fun get_owners(treasury: &Treasury): vector<address> {
        treasury.owners
    }

    /// Get approval threshold
    public fun get_threshold(treasury: &Treasury): u64 {
        treasury.threshold
    }

    /// Get transaction approval count
    public fun get_approval_count(pending_tx: &PendingTransaction): u64 {
        vector::length(&pending_tx.approvals)
    }

    /// Check if transaction is executed
    public fun is_executed(pending_tx: &PendingTransaction): bool {
        pending_tx.executed
    }

    /// Check if transaction has expired
    public fun is_expired(pending_tx: &PendingTransaction, now: u64): bool {
        now >= pending_tx.expires_at
    }

    /// Get transaction details
    public fun get_transaction_details(pending_tx: &PendingTransaction): (u8, Option<address>, u64, bool, u64, u64) {
        (
            pending_tx.tx_type,
            pending_tx.to,
            pending_tx.amount,
            pending_tx.executed,
            pending_tx.created_at,
            pending_tx.expires_at
        )
    }

    // ====== Internal Helper Functions ======

    /// Check if address is an owner
    fun is_owner(treasury: &Treasury, addr: address): bool {
        vector::contains(&treasury.owners, &addr)
    }

    /// Check if address has already approved transaction
    fun has_approved(pending_tx: &PendingTransaction, addr: address): bool {
        vector::contains(&pending_tx.approvals, &addr)
    }

    /// Execute a transfer transaction
    fun execute_transfer(
        treasury: &mut Treasury,
        pending_tx: &PendingTransaction,
        ctx: &mut TxContext
    ) {
        let amount = pending_tx.amount;
        let to = *option::borrow(&pending_tx.to);

        // Withdraw from treasury and transfer
        let payment = coin::from_balance(
            balance::split(&mut treasury.sui_balance, amount),
            ctx
        );

        transfer::public_transfer(payment, to);
    }

    /// Execute adding a new owner
    fun execute_add_owner(
        treasury: &mut Treasury,
        pending_tx: &PendingTransaction,
    ) {
        let new_owner = *option::borrow(&pending_tx.to);
        vector::push_back(&mut treasury.owners, new_owner);

        event::emit(OwnerAdded {
            treasury_id: object::uid_to_inner(&treasury.id),
            new_owner,
            total_owners: vector::length(&treasury.owners),
        });
    }

    /// Execute removing an owner
    fun execute_remove_owner(
        treasury: &mut Treasury,
        pending_tx: &PendingTransaction,
    ) {
        let owner_to_remove = *option::borrow(&pending_tx.to);
        let (found, index) = vector::index_of(&treasury.owners, &owner_to_remove);

        if (found) {
            vector::remove(&mut treasury.owners, index);

            event::emit(OwnerRemoved {
                treasury_id: object::uid_to_inner(&treasury.id),
                removed_owner: owner_to_remove,
                total_owners: vector::length(&treasury.owners),
            });
        };
    }

    /// Execute updating threshold
    fun execute_update_threshold(
        treasury: &mut Treasury,
        pending_tx: &PendingTransaction,
    ) {
        let old_threshold = treasury.threshold;
        let new_threshold = pending_tx.amount;

        treasury.threshold = new_threshold;

        event::emit(ThresholdUpdated {
            treasury_id: object::uid_to_inner(&treasury.id),
            old_threshold,
            new_threshold,
        });
    }

    /// Convert address to bytes (helper for calldata encoding)
    /// Note: This is a simplified version - production would use BCS encoding
    fun address_to_bytes(addr: address): vector<u8> {
        // In production, use proper BCS encoding
        // For now, return empty vector as placeholder
        vector::empty<u8>()
    }

    // ====== Test Helpers ======

    #[test_only]
    public fun create_treasury_for_testing(
        owners: vector<address>,
        threshold: u64,
        ctx: &mut TxContext
    ): Treasury {
        let owner_count = vector::length(&owners);
        assert!(threshold > 0 && threshold <= owner_count, E_INVALID_THRESHOLD);

        Treasury {
            id: object::new(ctx),
            owners,
            threshold,
            sui_balance: balance::zero(),
            nonce: 0,
            created_at: tx_context::epoch_timestamp_ms(ctx),
        }
    }
}
