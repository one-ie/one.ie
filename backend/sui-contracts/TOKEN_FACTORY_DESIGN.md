# TokenFactory Design Documentation

## Overview

The TokenFactory smart contract enables permissionless creation of custom fungible tokens on Sui. This implementation uses a capability-based access control model and the Sui object model for efficient parallel processing.

## Architecture

### Core Components

1. **TokenMetadata** - Stores token information (name, symbol, supply, etc.)
2. **TokenCap** - Capability object granting minting/burning permissions
3. **TokenBalance** - Individual balance objects per user per token
4. **TokenRegistry** - Shared object tracking all created tokens

## Design Decisions

### 1. Custom Fungible Token (Not Sui Coin Standard)

**Decision**: Implement a custom fungible token system instead of using `sui::coin::Coin<T>`.

**Rationale**:
- Sui's Coin standard requires **compile-time type witnesses** (one-time witness pattern)
- Each token type needs its own module with a unique witness type
- Dynamic token creation at runtime is not possible with the standard Coin type
- A custom implementation allows **runtime token creation** via a factory pattern

**Trade-off**:
- ✅ Enables dynamic token creation by any user
- ✅ Single factory contract manages all tokens
- ❌ Not compatible with native Sui Coin utilities
- ❌ Requires custom wallet/DEX integration

### 2. Capability-Based Access Control

**Decision**: Use `TokenCap` objects for ownership and permissions.

**Rationale**:
- Sui's object model makes capabilities first-class assets
- Transferring the `TokenCap` transfers all minting/burning rights
- Clear separation between token metadata and permissions
- No need for complex role-based access control

**Benefits**:
- Simple ownership transfer (just transfer the cap)
- Explicit permission model
- Can be extended with multi-sig or DAO governance

### 3. Separate Balance Objects Per User

**Decision**: Each user's balance is a separate `TokenBalance` object.

**Rationale**:
- **Parallel processing**: Multiple users can transfer tokens simultaneously
- Sui's object model optimizes for owned objects (no contention)
- Each balance has its own ID and can be independently managed

**Trade-off**:
- ✅ Maximum parallelization (no shared object bottlenecks)
- ✅ User-owned balances (self-custodial)
- ❌ More objects created (higher storage)
- ❌ Users must manage multiple balance objects for one token

### 4. Shared TokenRegistry

**Decision**: Use a shared object to track all created tokens.

**Rationale**:
- Enables global discovery of all tokens
- Provides total token count statistics
- Off-chain indexers can query the registry

**Note**: The registry is updated only on token creation (low contention).

### 5. Event-Driven Architecture

**Decision**: Emit events for all operations (created, minted, burned, transferred, updated).

**Rationale**:
- Off-chain indexers can build token databases
- Analytics and dashboards can track token activity
- Audit trail for compliance and transparency

**Events Emitted**:
- `TokenCreated` - New token created
- `TokenMinted` - Tokens minted to a user
- `TokenBurned` - Tokens burned from supply
- `TokenTransferred` - Tokens transferred between users
- `OwnershipTransferred` - Token ownership changed
- `MetadataUpdated` - Metadata fields updated
- `MintingFrozen` - Minting permanently disabled

### 6. Immutable and Mutable Metadata

**Decision**: Some fields are immutable (name, symbol, decimals, creator), others mutable (icon, description, website).

**Rationale**:
- Core identity (name/symbol) should not change to avoid confusion
- Display metadata (icon/description) can be updated for branding
- Creator is permanently recorded for provenance

**Mutable Fields**:
- `icon_url` - Can be updated by owner
- `description` - Can be updated by owner
- `website` - Can be updated by owner
- `owner` - Can be transferred

**Immutable Fields**:
- `name`, `symbol`, `decimals` - Never change
- `creator` - Permanent record
- `timestamp` - Permanent record

### 7. Supply Management

**Decision**: Support both capped and uncapped supply models.

**Rationale**:
- `max_supply = 0` → Unlimited supply (owner can mint indefinitely)
- `max_supply > 0` → Fixed cap (minting stops at cap)
- `minting_frozen = true` → Permanently disable minting

**Use Cases**:
- Unlimited: Stablecoins, governance tokens with inflation
- Capped: Utility tokens, NFT collections with fixed supply
- Frozen: One-time mint, then lock minting forever

## Function Reference

### Creation
- `create_token()` - Create new token with metadata and initial supply

### Minting & Burning
- `mint_tokens()` - Mint tokens to a recipient (requires TokenCap)
- `burn_tokens()` - Burn tokens from a balance (any holder can burn)

### Transfers
- `transfer_tokens()` - Transfer tokens between users

### Ownership
- `transfer_ownership()` - Transfer token ownership (transfers TokenCap and updates metadata)

### Metadata Updates (Owner Only)
- `update_icon_url()` - Update icon URL
- `update_description()` - Update description
- `update_website()` - Update website URL
- `freeze_minting()` - Permanently disable minting

### View Functions (Read-Only)
- `name()`, `symbol()`, `decimals()`, `total_supply()`, `max_supply()`
- `creator()`, `owner()`, `timestamp()`, `is_minting_frozen()`
- `balance_amount()`, `balance_owner()`, `total_tokens()`

## Gas Optimization

1. **Owned Objects**: Balances are owned objects (no shared object contention)
2. **Minimal Shared Access**: Only registry is shared (updated rarely)
3. **Event Emission**: Off-chain indexing reduces on-chain queries
4. **Object Reuse**: Balances are destroyed and recreated (no nested objects)

## Security Features

1. **Access Control**: Only TokenCap owner can mint/burn
2. **Supply Validation**: Max supply enforced on every mint
3. **Ownership Verification**: All operations verify sender == owner
4. **Amount Validation**: Zero-amount operations rejected
5. **Frozen Minting**: Irreversible minting freeze for security

## Integration Guide

### Creating a Token
```move
token_factory::factory::create_token(
    b"My Token",        // name
    b"MTK",            // symbol
    9,                 // decimals (Sui standard)
    1_000_000_000,     // max_supply (1B tokens with 9 decimals)
    100_000_000,       // initial_supply (100M tokens)
    b"https://...",    // icon_url
    b"Description",    // description
    b"https://...",    // website
    &clock,            // clock object
    &mut registry,     // shared registry
    ctx                // tx context
);
```

### Minting Tokens
```move
token_factory::factory::mint_tokens(
    &cap,              // TokenCap
    &mut metadata,     // TokenMetadata
    1_000_000,         // amount
    recipient_address, // recipient
    &clock,            // clock
    ctx                // tx context
);
```

### Transferring Tokens
```move
token_factory::factory::transfer_tokens(
    balance,           // TokenBalance (consumed)
    500_000,           // amount
    recipient_address, // recipient
    &clock,            // clock
    ctx                // tx context
);
```

## Future Enhancements

1. **Merging Balances**: Function to merge multiple TokenBalance objects into one
2. **Splitting Balances**: Function to split a balance into multiple objects
3. **Batch Operations**: Mint/transfer to multiple recipients at once
4. **Vesting Schedules**: Time-locked token releases
5. **DAO Integration**: TokenCap owned by DAO for governance
6. **DEX Integration**: Liquidity pool creation for token pairs
7. **Staking**: Native staking mechanism with rewards

## Testing Strategy

1. **Unit Tests**: Test each function in isolation
2. **Integration Tests**: Test full token lifecycle (create → mint → transfer → burn)
3. **Access Control Tests**: Verify only owners can mint/burn
4. **Edge Cases**: Test max supply limits, zero amounts, frozen minting
5. **Gas Tests**: Measure gas costs for common operations

## Comparison to Other Chains

| Feature | Sui (This Contract) | Ethereum ERC20 | Solana SPL Token |
|---------|-------------------|----------------|------------------|
| Token Creation | Runtime (factory) | Deploy new contract | Runtime (SPL factory) |
| Access Model | Capability objects | Role-based (owner) | Account-based (authority) |
| Balances | Owned objects | Storage mapping | Token accounts |
| Parallelization | High (owned objects) | Low (shared state) | Medium (account model) |
| Gas Efficiency | Very high | Medium | Very high |

## File Locations

- **Contract**: `/home/user/one.ie/backend/sui-contracts/sources/token_factory.move`
- **Documentation**: `/home/user/one.ie/backend/sui-contracts/TOKEN_FACTORY_DESIGN.md`

## License

MIT License - Copyright (c) ONE Platform
