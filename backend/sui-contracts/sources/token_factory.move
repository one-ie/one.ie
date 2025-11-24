// Copyright (c) ONE Platform
// SPDX-License-Identifier: MIT

/// TokenFactory Module
///
/// This module implements a fungible token factory on Sui that allows users to create
/// custom tokens with metadata, minting, burning, and ownership transfer capabilities.
///
/// Design Decisions:
/// 1. Custom Token Implementation: Since Sui's Coin standard requires compile-time type witnesses,
///    we implement a custom fungible token system that allows runtime token creation.
/// 2. Capability-based Access Control: Uses TokenCap objects for minting/burning permissions.
/// 3. Shared Metadata: TokenRegistry is a shared object tracking all created tokens.
/// 4. Balance Objects: Each user's balance is stored as a separate object for parallelization.
/// 5. Event Emission: All operations emit events for off-chain indexing and analytics.

module token_factory::factory {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;
    use sui::balance::{Self, Balance};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::clock::{Self, Clock};
    use std::string::{Self, String};
    use std::option::{Self, Option};
    use sui::vec_map::{Self, VecMap};

    // ==================== Error Codes ====================

    const ENotOwner: u64 = 1;
    const EInsufficientBalance: u64 = 2;
    const EInvalidAmount: u64 = 3;
    const ETokenNotFound: u64 = 4;
    const EInvalidDecimals: u64 = 5;
    const ESupplyOverflow: u64 = 6;

    // ==================== Structs ====================

    /// TokenMetadata stores immutable and mutable information about a token
    struct TokenMetadata has key, store {
        id: UID,
        /// Token name (e.g., "My Token")
        name: String,
        /// Token symbol (e.g., "MTK")
        symbol: String,
        /// Decimal places (typically 9 on Sui)
        decimals: u8,
        /// Total supply of tokens ever minted
        total_supply: u64,
        /// Maximum supply cap (0 = unlimited)
        max_supply: u64,
        /// Creator address
        creator: address,
        /// Current owner (can mint/burn)
        owner: address,
        /// Creation timestamp (milliseconds since epoch)
        timestamp: u64,
        /// Optional icon URL
        icon_url: Option<String>,
        /// Optional description
        description: Option<String>,
        /// Optional website URL
        website: Option<String>,
        /// Is minting frozen?
        minting_frozen: bool,
    }

    /// TokenCap grants minting and burning permissions for a specific token
    /// Only the owner can use this capability
    struct TokenCap has key, store {
        id: UID,
        /// Reference to the token metadata
        token_id: ID,
        /// Owner of this capability
        owner: address,
    }

    /// TokenBalance represents a user's balance for a specific token
    /// Each user has a separate Balance object for parallel processing
    struct TokenBalance has key, store {
        id: UID,
        /// Reference to the token type
        token_id: ID,
        /// Owner of this balance
        owner: address,
        /// Amount held
        amount: u64,
    }

    /// TokenRegistry tracks all created tokens (shared object)
    struct TokenRegistry has key {
        id: UID,
        /// Map of token_id -> token metadata ID
        tokens: VecMap<ID, ID>,
        /// Total number of tokens created
        total_tokens: u64,
    }

    // ==================== Events ====================

    struct TokenCreated has copy, drop {
        token_id: ID,
        name: String,
        symbol: String,
        decimals: u8,
        max_supply: u64,
        creator: address,
        timestamp: u64,
    }

    struct TokenMinted has copy, drop {
        token_id: ID,
        amount: u64,
        recipient: address,
        new_total_supply: u64,
        timestamp: u64,
    }

    struct TokenBurned has copy, drop {
        token_id: ID,
        amount: u64,
        burner: address,
        new_total_supply: u64,
        timestamp: u64,
    }

    struct TokenTransferred has copy, drop {
        token_id: ID,
        from: address,
        to: address,
        amount: u64,
        timestamp: u64,
    }

    struct OwnershipTransferred has copy, drop {
        token_id: ID,
        old_owner: address,
        new_owner: address,
        timestamp: u64,
    }

    struct MetadataUpdated has copy, drop {
        token_id: ID,
        field: String,
        timestamp: u64,
    }

    struct MintingFrozen has copy, drop {
        token_id: ID,
        timestamp: u64,
    }

    // ==================== Initialization ====================

    /// Initialize the token factory (called once at deployment)
    fun init(ctx: &mut TxContext) {
        let registry = TokenRegistry {
            id: object::new(ctx),
            tokens: vec_map::empty(),
            total_tokens: 0,
        };
        transfer::share_object(registry);
    }

    // ==================== Token Creation ====================

    /// Create a new token with specified metadata
    ///
    /// # Arguments
    /// * `name` - Token name (e.g., "My Token")
    /// * `symbol` - Token symbol (e.g., "MTK")
    /// * `decimals` - Decimal places (recommend 9 for Sui)
    /// * `max_supply` - Maximum supply (0 = unlimited)
    /// * `initial_supply` - Initial tokens to mint to creator
    /// * `icon_url` - Optional icon URL
    /// * `description` - Optional description
    /// * `website` - Optional website URL
    /// * `clock` - Sui clock object for timestamps
    /// * `registry` - TokenRegistry shared object
    /// * `ctx` - Transaction context
    ///
    /// # Returns
    /// * TokenMetadata object (transferred to creator)
    /// * TokenCap object (transferred to creator)
    /// * Initial TokenBalance if initial_supply > 0
    public entry fun create_token(
        name: vector<u8>,
        symbol: vector<u8>,
        decimals: u8,
        max_supply: u64,
        initial_supply: u64,
        icon_url: vector<u8>,
        description: vector<u8>,
        website: vector<u8>,
        clock: &Clock,
        registry: &mut TokenRegistry,
        ctx: &mut TxContext,
    ) {
        // Validate inputs
        assert!(decimals <= 18, EInvalidDecimals);
        if (max_supply > 0) {
            assert!(initial_supply <= max_supply, ESupplyOverflow);
        };

        let creator = tx_context::sender(ctx);
        let timestamp = clock::timestamp_ms(clock);

        // Create token metadata
        let metadata = TokenMetadata {
            id: object::new(ctx),
            name: string::utf8(name),
            symbol: string::utf8(symbol),
            decimals,
            total_supply: initial_supply,
            max_supply,
            creator,
            owner: creator,
            timestamp,
            icon_url: if (vector::length(&icon_url) > 0) {
                option::some(string::utf8(icon_url))
            } else {
                option::none()
            },
            description: if (vector::length(&description) > 0) {
                option::some(string::utf8(description))
            } else {
                option::none()
            },
            website: if (vector::length(&website) > 0) {
                option::some(string::utf8(website))
            } else {
                option::none()
            },
            minting_frozen: false,
        };

        let token_id = object::id(&metadata);

        // Create capability
        let cap = TokenCap {
            id: object::new(ctx),
            token_id,
            owner: creator,
        };

        // Register token in registry
        vec_map::insert(&mut registry.tokens, token_id, object::id(&metadata));
        registry.total_tokens = registry.total_tokens + 1;

        // Emit creation event
        event::emit(TokenCreated {
            token_id,
            name: metadata.name,
            symbol: metadata.symbol,
            decimals,
            max_supply,
            creator,
            timestamp,
        });

        // Mint initial supply if requested
        if (initial_supply > 0) {
            let balance = TokenBalance {
                id: object::new(ctx),
                token_id,
                owner: creator,
                amount: initial_supply,
            };

            event::emit(TokenMinted {
                token_id,
                amount: initial_supply,
                recipient: creator,
                new_total_supply: initial_supply,
                timestamp,
            });

            transfer::transfer(balance, creator);
        };

        // Transfer metadata and cap to creator
        transfer::transfer(metadata, creator);
        transfer::transfer(cap, creator);
    }

    // ==================== Minting ====================

    /// Mint new tokens to a recipient
    /// Only the token owner (via TokenCap) can mint
    ///
    /// # Arguments
    /// * `cap` - TokenCap granting minting permission
    /// * `metadata` - Mutable reference to token metadata
    /// * `amount` - Amount to mint
    /// * `recipient` - Address to receive minted tokens
    /// * `clock` - Sui clock for timestamp
    /// * `ctx` - Transaction context
    public entry fun mint_tokens(
        cap: &TokenCap,
        metadata: &mut TokenMetadata,
        amount: u64,
        recipient: address,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        // Verify ownership
        let sender = tx_context::sender(ctx);
        assert!(cap.owner == sender, ENotOwner);
        assert!(cap.token_id == object::id(metadata), ETokenNotFound);
        assert!(metadata.owner == sender, ENotOwner);
        assert!(!metadata.minting_frozen, ENotOwner);
        assert!(amount > 0, EInvalidAmount);

        // Check max supply
        if (metadata.max_supply > 0) {
            assert!(
                metadata.total_supply + amount <= metadata.max_supply,
                ESupplyOverflow
            );
        };

        // Update total supply
        metadata.total_supply = metadata.total_supply + amount;

        // Create or update balance for recipient
        let balance = TokenBalance {
            id: object::new(ctx),
            token_id: object::id(metadata),
            owner: recipient,
            amount,
        };

        let timestamp = clock::timestamp_ms(clock);

        // Emit event
        event::emit(TokenMinted {
            token_id: object::id(metadata),
            amount,
            recipient,
            new_total_supply: metadata.total_supply,
            timestamp,
        });

        // Transfer balance to recipient
        transfer::transfer(balance, recipient);
    }

    // ==================== Burning ====================

    /// Burn tokens from a balance
    /// Anyone can burn their own tokens
    ///
    /// # Arguments
    /// * `metadata` - Mutable reference to token metadata
    /// * `balance` - TokenBalance to burn from (consumed)
    /// * `amount` - Amount to burn
    /// * `clock` - Sui clock for timestamp
    /// * `ctx` - Transaction context
    public entry fun burn_tokens(
        metadata: &mut TokenMetadata,
        balance: TokenBalance,
        amount: u64,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        let sender = tx_context::sender(ctx);

        // Verify balance ownership and token match
        assert!(balance.owner == sender, ENotOwner);
        assert!(balance.token_id == object::id(metadata), ETokenNotFound);
        assert!(balance.amount >= amount, EInsufficientBalance);
        assert!(amount > 0, EInvalidAmount);

        // Update total supply
        metadata.total_supply = metadata.total_supply - amount;

        let timestamp = clock::timestamp_ms(clock);

        // Emit event
        event::emit(TokenBurned {
            token_id: object::id(metadata),
            amount,
            burner: sender,
            new_total_supply: metadata.total_supply,
            timestamp,
        });

        // Destroy balance or return remaining
        let TokenBalance { id, token_id: _, owner: _, amount: balance_amount } = balance;
        object::delete(id);

        if (balance_amount > amount) {
            let remaining = TokenBalance {
                id: object::new(ctx),
                token_id: object::id(metadata),
                owner: sender,
                amount: balance_amount - amount,
            };
            transfer::transfer(remaining, sender);
        };
    }

    // ==================== Transfers ====================

    /// Transfer tokens from one balance to another
    ///
    /// # Arguments
    /// * `balance` - TokenBalance to transfer from (consumed)
    /// * `amount` - Amount to transfer
    /// * `recipient` - Recipient address
    /// * `clock` - Sui clock for timestamp
    /// * `ctx` - Transaction context
    public entry fun transfer_tokens(
        balance: TokenBalance,
        amount: u64,
        recipient: address,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        let sender = tx_context::sender(ctx);

        // Verify balance ownership
        assert!(balance.owner == sender, ENotOwner);
        assert!(balance.amount >= amount, EInsufficientBalance);
        assert!(amount > 0, EInvalidAmount);

        let token_id = balance.token_id;
        let balance_amount = balance.amount;

        // Destroy original balance
        let TokenBalance { id, token_id: _, owner: _, amount: _ } = balance;
        object::delete(id);

        // Create balance for recipient
        let recipient_balance = TokenBalance {
            id: object::new(ctx),
            token_id,
            owner: recipient,
            amount,
        };

        let timestamp = clock::timestamp_ms(clock);

        // Emit event
        event::emit(TokenTransferred {
            token_id,
            from: sender,
            to: recipient,
            amount,
            timestamp,
        });

        // Transfer to recipient
        transfer::transfer(recipient_balance, recipient);

        // Return remaining balance to sender if any
        if (balance_amount > amount) {
            let remaining = TokenBalance {
                id: object::new(ctx),
                token_id,
                owner: sender,
                amount: balance_amount - amount,
            };
            transfer::transfer(remaining, sender);
        };
    }

    // ==================== Ownership Management ====================

    /// Transfer token ownership (transfers the cap and updates metadata)
    ///
    /// # Arguments
    /// * `cap` - TokenCap (consumed and transferred)
    /// * `metadata` - Mutable reference to token metadata
    /// * `new_owner` - New owner address
    /// * `clock` - Sui clock for timestamp
    /// * `ctx` - Transaction context
    public entry fun transfer_ownership(
        cap: TokenCap,
        metadata: &mut TokenMetadata,
        new_owner: address,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        let sender = tx_context::sender(ctx);

        // Verify ownership
        assert!(cap.owner == sender, ENotOwner);
        assert!(cap.token_id == object::id(metadata), ETokenNotFound);
        assert!(metadata.owner == sender, ENotOwner);

        let old_owner = metadata.owner;

        // Update metadata owner
        metadata.owner = new_owner;

        // Update cap owner
        let TokenCap { id, token_id, owner: _ } = cap;
        let new_cap = TokenCap {
            id,
            token_id,
            owner: new_owner,
        };

        let timestamp = clock::timestamp_ms(clock);

        // Emit event
        event::emit(OwnershipTransferred {
            token_id: object::id(metadata),
            old_owner,
            new_owner,
            timestamp,
        });

        // Transfer cap to new owner
        transfer::transfer(new_cap, new_owner);
    }

    // ==================== Metadata Updates ====================

    /// Update token icon URL
    public entry fun update_icon_url(
        cap: &TokenCap,
        metadata: &mut TokenMetadata,
        new_icon_url: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        verify_cap_ownership(cap, metadata, ctx);

        metadata.icon_url = if (vector::length(&new_icon_url) > 0) {
            option::some(string::utf8(new_icon_url))
        } else {
            option::none()
        };

        event::emit(MetadataUpdated {
            token_id: object::id(metadata),
            field: string::utf8(b"icon_url"),
            timestamp: clock::timestamp_ms(clock),
        });
    }

    /// Update token description
    public entry fun update_description(
        cap: &TokenCap,
        metadata: &mut TokenMetadata,
        new_description: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        verify_cap_ownership(cap, metadata, ctx);

        metadata.description = if (vector::length(&new_description) > 0) {
            option::some(string::utf8(new_description))
        } else {
            option::none()
        };

        event::emit(MetadataUpdated {
            token_id: object::id(metadata),
            field: string::utf8(b"description"),
            timestamp: clock::timestamp_ms(clock),
        });
    }

    /// Update token website
    public entry fun update_website(
        cap: &TokenCap,
        metadata: &mut TokenMetadata,
        new_website: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        verify_cap_ownership(cap, metadata, ctx);

        metadata.website = if (vector::length(&new_website) > 0) {
            option::some(string::utf8(new_website))
        } else {
            option::none()
        };

        event::emit(MetadataUpdated {
            token_id: object::id(metadata),
            field: string::utf8(b"website"),
            timestamp: clock::timestamp_ms(clock),
        });
    }

    /// Freeze minting permanently (cannot be undone)
    public entry fun freeze_minting(
        cap: &TokenCap,
        metadata: &mut TokenMetadata,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        verify_cap_ownership(cap, metadata, ctx);

        metadata.minting_frozen = true;

        event::emit(MintingFrozen {
            token_id: object::id(metadata),
            timestamp: clock::timestamp_ms(clock),
        });
    }

    // ==================== View Functions ====================

    /// Get token name
    public fun name(metadata: &TokenMetadata): String {
        metadata.name
    }

    /// Get token symbol
    public fun symbol(metadata: &TokenMetadata): String {
        metadata.symbol
    }

    /// Get token decimals
    public fun decimals(metadata: &TokenMetadata): u8 {
        metadata.decimals
    }

    /// Get total supply
    public fun total_supply(metadata: &TokenMetadata): u64 {
        metadata.total_supply
    }

    /// Get max supply
    public fun max_supply(metadata: &TokenMetadata): u64 {
        metadata.max_supply
    }

    /// Get creator address
    public fun creator(metadata: &TokenMetadata): address {
        metadata.creator
    }

    /// Get current owner address
    public fun owner(metadata: &TokenMetadata): address {
        metadata.owner
    }

    /// Get creation timestamp
    public fun timestamp(metadata: &TokenMetadata): u64 {
        metadata.timestamp
    }

    /// Check if minting is frozen
    public fun is_minting_frozen(metadata: &TokenMetadata): bool {
        metadata.minting_frozen
    }

    /// Get balance amount
    public fun balance_amount(balance: &TokenBalance): u64 {
        balance.amount
    }

    /// Get balance owner
    public fun balance_owner(balance: &TokenBalance): address {
        balance.owner
    }

    /// Get total tokens created
    public fun total_tokens(registry: &TokenRegistry): u64 {
        registry.total_tokens
    }

    // ==================== Helper Functions ====================

    /// Verify cap ownership (internal helper)
    fun verify_cap_ownership(
        cap: &TokenCap,
        metadata: &TokenMetadata,
        ctx: &TxContext,
    ) {
        let sender = tx_context::sender(ctx);
        assert!(cap.owner == sender, ENotOwner);
        assert!(cap.token_id == object::id(metadata), ETokenNotFound);
        assert!(metadata.owner == sender, ENotOwner);
    }

    // ==================== Test Functions ====================

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx);
    }
}
