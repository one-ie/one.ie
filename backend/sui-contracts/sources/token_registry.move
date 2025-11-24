// TokenRegistry Module
// Tracks all tokens launched on the ONE platform with verification status
//
// Architecture:
// - Shared TokenRegistry object (global state)
// - RegisteredToken entries stored in Table
// - Dual indexing: all_token_ids + verified_token_ids for efficient queries
// - Admin-controlled verification system
// - Event emission for all state changes

module one::token_registry {
    use sui::object::{Self, ID, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::event;
    use sui::table::{Self, Table};
    use std::string::{Self, String};
    use sui::clock::{Self, Clock};
    use std::vector;

    // ========== Error Codes ==========

    const ENotAdmin: u64 = 1;
    const ETokenAlreadyRegistered: u64 = 2;
    const ETokenNotFound: u64 = 3;
    const EInvalidPagination: u64 = 4;
    const ENotAuthorized: u64 = 5;

    // ========== Structs ==========

    /// Global registry tracking all tokens on the platform
    /// Shared object - accessible by all, mutable by authorized addresses
    struct TokenRegistry has key {
        id: UID,
        admin: address,                        // Platform admin who can verify tokens
        tokens: Table<ID, RegisteredToken>,   // token_id -> token data
        all_token_ids: vector<ID>,            // All registered tokens (for pagination)
        verified_token_ids: vector<ID>,       // Verified tokens only (for filtering)
        token_count: u64,                     // Total tokens registered
    }

    /// Individual token entry with metadata and verification status
    struct RegisteredToken has store {
        token_id: ID,           // The actual token/coin object ID
        creator: address,       // Address that created/registered the token
        coin_type: String,      // Fully qualified type (e.g., "0x123::mycoin::MYCOIN")
        verified: bool,         // Platform verification status
        created_at: u64,        // Timestamp (milliseconds)
        metadata_uri: String,   // URI to off-chain metadata (logo, description, etc.)
        holder_count: u64,      // Number of unique holders (updated externally)
        total_volume: u64,      // Total trading volume (updated externally)
    }

    // ========== Events ==========

    /// Emitted when a new token is registered
    struct TokenRegistered has copy, drop {
        token_id: ID,
        creator: address,
        coin_type: String,
        created_at: u64,
    }

    /// Emitted when a token is verified by admin
    struct TokenVerified has copy, drop {
        token_id: ID,
        verified_by: address,
        timestamp: u64,
    }

    /// Emitted when token verification is removed
    struct TokenUnverified has copy, drop {
        token_id: ID,
        unverified_by: address,
        timestamp: u64,
    }

    /// Emitted when token metrics are updated
    struct TokenMetricsUpdated has copy, drop {
        token_id: ID,
        holder_count: u64,
        total_volume: u64,
        updated_by: address,
        timestamp: u64,
    }

    /// Emitted when admin rights are transferred
    struct AdminTransferred has copy, drop {
        old_admin: address,
        new_admin: address,
        timestamp: u64,
    }

    // ========== Initialization ==========

    /// Initialize the TokenRegistry (called once on module publish)
    /// Creates a shared object accessible to all
    fun init(ctx: &mut TxContext) {
        let registry = TokenRegistry {
            id: object::new(ctx),
            admin: tx_context::sender(ctx),
            tokens: table::new(ctx),
            all_token_ids: vector::empty(),
            verified_token_ids: vector::empty(),
            token_count: 0,
        };

        transfer::share_object(registry);
    }

    // ========== Core Functions ==========

    /// Register a newly created token in the registry
    ///
    /// Args:
    ///   - registry: Shared TokenRegistry object
    ///   - token_id: Object ID of the token/coin treasury cap
    ///   - coin_type: Fully qualified type name (e.g., "0x123::mycoin::MYCOIN")
    ///   - metadata_uri: URI pointing to token metadata (logo, description, socials)
    ///   - clock: Sui Clock object for timestamps
    ///
    /// Requirements:
    ///   - Token must not already be registered
    ///   - Called by token creator after launching token
    ///
    /// Emits: TokenRegistered event
    public entry fun register_token(
        registry: &mut TokenRegistry,
        token_id: ID,
        coin_type: vector<u8>,
        metadata_uri: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Prevent duplicate registration
        assert!(!table::contains(&registry.tokens, token_id), ETokenAlreadyRegistered);

        let creator = tx_context::sender(ctx);
        let created_at = clock::timestamp_ms(clock);

        let registered_token = RegisteredToken {
            token_id,
            creator,
            coin_type: string::utf8(coin_type),
            verified: false,  // Starts unverified
            created_at,
            metadata_uri: string::utf8(metadata_uri),
            holder_count: 0,
            total_volume: 0,
        };

        // Add to storage
        table::add(&mut registry.tokens, token_id, registered_token);
        vector::push_back(&mut registry.all_token_ids, token_id);
        registry.token_count = registry.token_count + 1;

        // Emit event
        event::emit(TokenRegistered {
            token_id,
            creator,
            coin_type: string::utf8(coin_type),
            created_at,
        });
    }

    /// Verify a token (admin only)
    ///
    /// Args:
    ///   - registry: Shared TokenRegistry object
    ///   - token_id: ID of token to verify
    ///   - clock: Sui Clock object for timestamps
    ///
    /// Requirements:
    ///   - Caller must be admin
    ///   - Token must exist in registry
    ///
    /// Emits: TokenVerified event (if not already verified)
    public entry fun verify_token(
        registry: &mut TokenRegistry,
        token_id: ID,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);

        // Only admin can verify
        assert!(sender == registry.admin, ENotAdmin);
        assert!(table::contains(&registry.tokens, token_id), ETokenNotFound);

        let token = table::borrow_mut(&mut registry.tokens, token_id);

        // Only update if not already verified (idempotent)
        if (!token.verified) {
            token.verified = true;
            vector::push_back(&mut registry.verified_token_ids, token_id);

            event::emit(TokenVerified {
                token_id,
                verified_by: sender,
                timestamp: clock::timestamp_ms(clock),
            });
        }
    }

    /// Remove verification from a token (admin only)
    ///
    /// Args:
    ///   - registry: Shared TokenRegistry object
    ///   - token_id: ID of token to unverify
    ///   - clock: Sui Clock object for timestamps
    ///
    /// Requirements:
    ///   - Caller must be admin
    ///   - Token must exist in registry
    ///
    /// Emits: TokenUnverified event (if currently verified)
    public entry fun unverify_token(
        registry: &mut TokenRegistry,
        token_id: ID,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);

        // Only admin can unverify
        assert!(sender == registry.admin, ENotAdmin);
        assert!(table::contains(&registry.tokens, token_id), ETokenNotFound);

        let token = table::borrow_mut(&mut registry.tokens, token_id);

        // Only update if currently verified (idempotent)
        if (token.verified) {
            token.verified = false;

            // Remove from verified list
            let (found, index) = vector::index_of(&registry.verified_token_ids, &token_id);
            if (found) {
                vector::remove(&mut registry.verified_token_ids, index);
            };

            event::emit(TokenUnverified {
                token_id,
                unverified_by: sender,
                timestamp: clock::timestamp_ms(clock),
            });
        }
    }

    /// Update token metrics (holder count, volume)
    ///
    /// Args:
    ///   - registry: Shared TokenRegistry object
    ///   - token_id: ID of token to update
    ///   - holder_count: Number of unique holders
    ///   - total_volume: Total trading volume (in base units)
    ///   - clock: Sui Clock object for timestamps
    ///
    /// Requirements:
    ///   - Caller must be admin OR token creator
    ///   - Token must exist in registry
    ///
    /// Note: Allows token creators to update their own token's metrics
    /// Emits: TokenMetricsUpdated event
    public entry fun update_token_metrics(
        registry: &mut TokenRegistry,
        token_id: ID,
        holder_count: u64,
        total_volume: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(table::contains(&registry.tokens, token_id), ETokenNotFound);

        let token = table::borrow_mut(&mut registry.tokens, token_id);

        // Only admin or token creator can update metrics
        assert!(sender == registry.admin || sender == token.creator, ENotAuthorized);

        token.holder_count = holder_count;
        token.total_volume = total_volume;

        event::emit(TokenMetricsUpdated {
            token_id,
            holder_count,
            total_volume,
            updated_by: sender,
            timestamp: clock::timestamp_ms(clock),
        });
    }

    // ========== Query Functions ==========

    /// Get complete token details
    ///
    /// Returns: (creator, coin_type, verified, created_at, metadata_uri, holder_count, total_volume)
    ///
    /// Aborts if token not found
    public fun get_token_details(
        registry: &TokenRegistry,
        token_id: ID,
    ): (address, String, bool, u64, String, u64, u64) {
        assert!(table::contains(&registry.tokens, token_id), ETokenNotFound);
        let token = table::borrow(&registry.tokens, token_id);

        (
            token.creator,
            token.coin_type,
            token.verified,
            token.created_at,
            token.metadata_uri,
            token.holder_count,
            token.total_volume,
        )
    }

    /// Check if a token is verified
    public fun is_token_verified(
        registry: &TokenRegistry,
        token_id: ID,
    ): bool {
        if (!table::contains(&registry.tokens, token_id)) {
            return false
        };

        let token = table::borrow(&registry.tokens, token_id);
        token.verified
    }

    /// Check if a token is registered
    public fun is_token_registered(
        registry: &TokenRegistry,
        token_id: ID,
    ): bool {
        table::contains(&registry.tokens, token_id)
    }

    /// List all verified tokens
    ///
    /// Returns: Vector of verified token IDs
    ///
    /// Note: Returns copy of verified_token_ids vector
    public fun list_verified_tokens(
        registry: &TokenRegistry,
    ): vector<ID> {
        registry.verified_token_ids
    }

    /// List all tokens with pagination
    ///
    /// Args:
    ///   - offset: Starting index (0-based)
    ///   - limit: Maximum number of tokens to return
    ///
    /// Returns: Vector of token IDs (slice of all_token_ids)
    ///
    /// Example: list_all_tokens(registry, 0, 10) returns first 10 tokens
    ///          list_all_tokens(registry, 10, 10) returns next 10 tokens
    public fun list_all_tokens(
        registry: &TokenRegistry,
        offset: u64,
        limit: u64,
    ): vector<ID> {
        let total = vector::length(&registry.all_token_ids);

        // Validate pagination
        assert!(offset <= total, EInvalidPagination);

        let result = vector::empty<ID>();
        let end = if (offset + limit > total) { total } else { offset + limit };

        let i = offset;
        while (i < end) {
            let token_id = *vector::borrow(&registry.all_token_ids, i);
            vector::push_back(&mut result, token_id);
            i = i + 1;
        };

        result
    }

    /// Get total number of registered tokens
    public fun get_token_count(registry: &TokenRegistry): u64 {
        registry.token_count
    }

    /// Get number of verified tokens
    public fun get_verified_count(registry: &TokenRegistry): u64 {
        vector::length(&registry.verified_token_ids)
    }

    /// Get tokens created by a specific address
    ///
    /// Args:
    ///   - creator: Address to filter by
    ///   - offset: Starting index
    ///   - limit: Maximum results
    ///
    /// Returns: Vector of token IDs created by the address
    ///
    /// Note: This is O(n) - for production, consider indexing by creator
    public fun get_tokens_by_creator(
        registry: &TokenRegistry,
        creator: address,
        offset: u64,
        limit: u64,
    ): vector<ID> {
        let result = vector::empty<ID>();
        let total = vector::length(&registry.all_token_ids);

        let current_offset = 0u64;
        let count = 0u64;
        let i = 0u64;

        while (i < total && count < limit) {
            let token_id = *vector::borrow(&registry.all_token_ids, i);
            let token = table::borrow(&registry.tokens, token_id);

            if (token.creator == creator) {
                if (current_offset >= offset) {
                    vector::push_back(&mut result, token_id);
                    count = count + 1;
                };
                current_offset = current_offset + 1;
            };

            i = i + 1;
        };

        result
    }

    // ========== Admin Functions ==========

    /// Transfer admin rights to a new address
    ///
    /// Requirements:
    ///   - Caller must be current admin
    ///
    /// Emits: AdminTransferred event
    public entry fun transfer_admin(
        registry: &mut TokenRegistry,
        new_admin: address,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(sender == registry.admin, ENotAdmin);

        let old_admin = registry.admin;
        registry.admin = new_admin;

        event::emit(AdminTransferred {
            old_admin,
            new_admin,
            timestamp: clock::timestamp_ms(clock),
        });
    }

    /// Get current admin address
    public fun get_admin(registry: &TokenRegistry): address {
        registry.admin
    }

    // ========== Test-Only Functions ==========

    #[test_only]
    /// Initialize registry for testing
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx);
    }

    #[test_only]
    /// Get all token IDs for testing
    public fun get_all_token_ids_for_testing(registry: &TokenRegistry): vector<ID> {
        registry.all_token_ids
    }
}
