# TokenRegistry Architecture

## Overview

The **TokenRegistry** is a Sui Move smart contract that tracks all tokens launched on the ONE platform, providing a centralized verification system and token discovery mechanism.

## File Location

`/home/user/one.ie/backend/sui-contracts/sources/token_registry.move`

---

## Architecture

### 1. Core Data Structures

#### TokenRegistry (Shared Object)

```move
struct TokenRegistry has key {
    id: UID,
    admin: address,                        // Platform admin
    tokens: Table<ID, RegisteredToken>,   // All token data
    all_token_ids: vector<ID>,            // For pagination
    verified_token_ids: vector<ID>,       // Verified tokens only
    token_count: u64,                     // Total count
}
```

**Design Decisions:**
- **Shared Object**: Accessible by all users, mutable by authorized addresses
- **Dual Indexing**: Maintains both `all_token_ids` (for pagination) and `verified_token_ids` (for filtering)
- **Table Storage**: Efficient key-value storage for token data (O(1) lookups)
- **Vector Indexing**: Enables pagination and iteration over token sets

#### RegisteredToken (Stored Value)

```move
struct RegisteredToken has store {
    token_id: ID,           // The actual token object
    creator: address,       // Token creator
    coin_type: String,      // Fully qualified type
    verified: bool,         // Verification status
    created_at: u64,        // Timestamp
    metadata_uri: String,   // Off-chain metadata
    holder_count: u64,      // Metrics
    total_volume: u64,      // Metrics
}
```

**Key Features:**
- Stores both on-chain (coin_type, creator) and off-chain (metadata_uri) references
- Includes real-time metrics (holder_count, total_volume)
- Immutable creation timestamp for sorting/filtering

---

## 2. Core Functions

### Registration Flow

```
Token Launch → register_token() → TokenRegistered event
     ↓
Token exists in registry (unverified)
     ↓
Admin review → verify_token() → TokenVerified event
     ↓
Token appears in verified listings
```

#### `register_token()`

**Purpose**: Register a newly created token in the global registry

**Parameters**:
- `token_id: ID` - Object ID of the token treasury cap
- `coin_type: vector<u8>` - Fully qualified type (e.g., "0x123::mycoin::MYCOIN")
- `metadata_uri: vector<u8>` - URI to token metadata JSON

**Validation**:
- Token must not already be registered (`ETokenAlreadyRegistered`)
- Caller becomes the token creator (for later metric updates)

**Effects**:
1. Creates `RegisteredToken` entry with `verified: false`
2. Adds to `tokens` table
3. Appends to `all_token_ids` vector
4. Increments `token_count`
5. Emits `TokenRegistered` event

**Gas Efficiency**: O(1) - constant time operation

---

### Verification Flow

#### `verify_token()`

**Purpose**: Mark a token as platform-verified (admin only)

**Requirements**:
- Caller must be `admin` (`ENotAdmin`)
- Token must exist (`ETokenNotFound`)

**Effects**:
1. Sets `verified: true` on token
2. Adds to `verified_token_ids` vector
3. Emits `TokenVerified` event

**Idempotent**: Safe to call multiple times (no-op if already verified)

#### `unverify_token()`

**Purpose**: Remove verification status (e.g., for scams, rug pulls)

**Requirements**:
- Caller must be `admin`
- Token must exist

**Effects**:
1. Sets `verified: false`
2. Removes from `verified_token_ids` vector (O(n) operation)
3. Emits `TokenUnverified` event

---

### Query Functions

#### `get_token_details()`

**Returns**: Complete token information tuple
```move
(creator, coin_type, verified, created_at, metadata_uri, holder_count, total_volume)
```

**Use Case**: Display token profile page

---

#### `list_verified_tokens()`

**Returns**: `vector<ID>` of all verified tokens

**Use Case**: Featured tokens page, verified listings

**Complexity**: O(1) - returns copy of `verified_token_ids` vector

**Note**: Since `ID` has `copy` ability, the vector is copied (not moved)

---

#### `list_all_tokens(offset, limit)`

**Returns**: Paginated slice of all tokens

**Parameters**:
- `offset: u64` - Starting index (0-based)
- `limit: u64` - Max results to return

**Example**:
```move
// First page (10 tokens)
list_all_tokens(registry, 0, 10)

// Second page
list_all_tokens(registry, 10, 10)

// Third page
list_all_tokens(registry, 20, 10)
```

**Complexity**: O(limit) - iterates only over requested range

**Validation**: `offset <= total` (`EInvalidPagination`)

---

#### `get_tokens_by_creator(creator, offset, limit)`

**Returns**: Tokens created by a specific address

**Complexity**: O(n) - full scan with filtering

**Note**: For production, consider maintaining a `creator_index: Table<address, vector<ID>>`

---

### Metrics Updates

#### `update_token_metrics(token_id, holder_count, total_volume)`

**Purpose**: Update real-time token metrics

**Authorization**:
- Admin (can update any token)
- Token creator (can update own token only)

**Use Case**: Periodic updates from indexer/oracle

**Emits**: `TokenMetricsUpdated` event

**Design Note**: Allows token creators to self-report metrics (verify via off-chain indexer)

---

## 3. Event System

All state changes emit events for off-chain indexing:

```move
struct TokenRegistered has copy, drop {
    token_id: ID,
    creator: address,
    coin_type: String,
    created_at: u64,
}

struct TokenVerified has copy, drop {
    token_id: ID,
    verified_by: address,
    timestamp: u64,
}

struct TokenUnverified has copy, drop {
    token_id: ID,
    unverified_by: address,
    timestamp: u64,
}

struct TokenMetricsUpdated has copy, drop {
    token_id: ID,
    holder_count: u64,
    total_volume: u64,
    updated_by: address,
    timestamp: u64,
}

struct AdminTransferred has copy, drop {
    old_admin: address,
    new_admin: address,
    timestamp: u64,
}
```

**Usage**: Backend indexer subscribes to events to build:
- Token discovery database
- Verification history
- Metrics timeline
- Creator portfolio

---

## 4. Security Model

### Access Control

| Function | Caller | Validation |
|----------|--------|------------|
| `register_token()` | Anyone | Token must not exist |
| `verify_token()` | Admin only | `assert!(sender == admin)` |
| `unverify_token()` | Admin only | `assert!(sender == admin)` |
| `update_token_metrics()` | Admin or Creator | `assert!(sender == admin \|\| sender == creator)` |
| `transfer_admin()` | Admin only | `assert!(sender == admin)` |

### Duplicate Prevention

```move
// Prevents re-registering the same token
assert!(!table::contains(&registry.tokens, token_id), ETokenAlreadyRegistered);
```

### Idempotent Operations

- `verify_token()` checks `if (!token.verified)` before updating
- `unverify_token()` checks `if (token.verified)` before updating
- Safe to call multiple times without side effects

---

## 5. Integration with Token Launchpad

### Full Launch Flow

```
1. User creates token via TokenLaunchpad
   └─> TokenLaunchpad creates CoinMetadata + TreasuryCap

2. Launchpad automatically registers token
   └─> register_token(treasury_cap_id, coin_type, metadata_uri)

3. Token appears in registry (unverified)
   └─> Discoverable via list_all_tokens()

4. Platform reviews token
   └─> Admin calls verify_token()

5. Token appears in verified listings
   └─> Discoverable via list_verified_tokens()

6. Metrics updated periodically
   └─> Indexer calls update_token_metrics()
```

### Code Example: Launchpad Integration

```move
// In token_launchpad.move
public entry fun create_token(...) {
    // ... create token ...

    // Auto-register in registry
    token_registry::register_token(
        registry,
        object::id(&treasury_cap),
        type_name::get<T>(),
        metadata_uri,
        clock,
        ctx
    );
}
```

---

## 6. Frontend Integration

### Verified Tokens Page

```typescript
// Get all verified tokens
const verifiedIds = await suiClient.devInspectTransactionBlock({
  transactionBlock: tx,
  sender: address,
});

// Fetch details for each token
const tokens = await Promise.all(
  verifiedIds.map(id =>
    suiClient.getObject({ id, options: { showContent: true } })
  )
);
```

### Pagination Example

```typescript
const PAGE_SIZE = 20;

// Page 1
const page1 = await listAllTokens(registry, 0, PAGE_SIZE);

// Page 2
const page2 = await listAllTokens(registry, PAGE_SIZE, PAGE_SIZE);

// Total pages
const totalTokens = await getTokenCount(registry);
const totalPages = Math.ceil(totalTokens / PAGE_SIZE);
```

### Creator Dashboard

```typescript
// Get tokens by creator
const myTokens = await getTokensByCreator(
  registry,
  creatorAddress,
  0,  // offset
  10  // limit
);

// Get details for each
const tokenDetails = await Promise.all(
  myTokens.map(id => getTokenDetails(registry, id))
);
```

---

## 7. Performance Characteristics

| Operation | Complexity | Gas Cost |
|-----------|-----------|----------|
| `register_token()` | O(1) | Low |
| `verify_token()` | O(1) | Low |
| `unverify_token()` | O(n) | Medium (vector remove) |
| `get_token_details()` | O(1) | Very Low (read-only) |
| `list_verified_tokens()` | O(1) | Low (vector copy) |
| `list_all_tokens(limit)` | O(limit) | Low |
| `get_tokens_by_creator()` | O(n) | High (full scan) |

**Optimization Opportunities**:
- Add `creator_index: Table<address, vector<ID>>` for O(1) creator lookups
- Add `coin_type_index: Table<String, ID>` for reverse lookups
- Consider `VerifiedTokens` as separate shared object for better concurrency

---

## 8. Error Codes

```move
const ENotAdmin: u64 = 1;                 // Caller is not admin
const ETokenAlreadyRegistered: u64 = 2;   // Token already in registry
const ETokenNotFound: u64 = 3;            // Token ID not found
const EInvalidPagination: u64 = 4;        // offset > total tokens
const ENotAuthorized: u64 = 5;            // Not admin or creator
```

---

## 9. Testing Strategy

### Unit Tests (to be added)

```move
#[test]
fun test_register_token() {
    // Test successful registration
}

#[test]
#[expected_failure(abort_code = ETokenAlreadyRegistered)]
fun test_duplicate_registration() {
    // Test duplicate prevention
}

#[test]
#[expected_failure(abort_code = ENotAdmin)]
fun test_verify_non_admin() {
    // Test admin-only verification
}

#[test]
fun test_pagination() {
    // Test list_all_tokens with various offsets
}
```

### Integration Tests

1. **Launch + Register Flow**: Create token via launchpad, verify registration
2. **Verification Flow**: Register → verify → check verified list
3. **Metrics Update**: Register → update metrics → query details
4. **Admin Transfer**: Transfer admin → verify new admin can verify

---

## 10. Future Enhancements

### Phase 2: Advanced Indexing

```move
// Add to TokenRegistry
coin_type_index: Table<String, ID>,      // Reverse lookup by type
creator_index: Table<address, vector<ID>>, // O(1) creator queries
```

### Phase 3: Token Categories

```move
// Add to RegisteredToken
category: String,  // "meme", "defi", "nft", "utility"

// Add to TokenRegistry
category_index: Table<String, vector<ID>>,
```

### Phase 4: Social Features

```move
// Add to RegisteredToken
upvotes: u64,
downvotes: u64,
comment_count: u64,

// Add social functions
public entry fun upvote_token(registry, token_id, ctx)
public entry fun downvote_token(registry, token_id, ctx)
```

### Phase 5: Decay-Based Verification

```move
// Verification expires after 90 days
verified_until: Option<u64>,

// Admin must periodically re-verify active tokens
public entry fun extend_verification(registry, token_id, duration, ctx)
```

---

## 11. Deployment Checklist

- [ ] Deploy `token_registry.move` module
- [ ] Initialize registry (automatic on module publish)
- [ ] Transfer admin to platform multisig
- [ ] Set up event indexer for `TokenRegistered`, `TokenVerified`
- [ ] Build frontend components for token discovery
- [ ] Create admin dashboard for verification
- [ ] Set up metrics update cron job
- [ ] Document API for external integrators

---

## Summary

The **TokenRegistry** provides:

1. **Centralized Discovery**: All tokens in one place
2. **Trust Signal**: Platform verification badge
3. **Real-Time Metrics**: Holder count, volume tracking
4. **Event Audit Trail**: Complete history of all changes
5. **Efficient Queries**: Pagination, filtering, creator lookup
6. **Admin Control**: Verification management, metrics oversight
7. **Gas Efficient**: O(1) operations for common queries
8. **Extensible**: Easy to add new fields/indexes

**Built on 6-Dimension Ontology**:
- **Groups**: Platform (registry admin)
- **People**: Token creators, admin
- **Things**: Tokens (RegisteredToken entries)
- **Connections**: creator → token (implicit via `creator` field)
- **Events**: TokenRegistered, TokenVerified, TokenUnverified, TokenMetricsUpdated
- **Knowledge**: metadata_uri (off-chain token data)

---

**Next Steps**: Deploy to Sui testnet and integrate with TokenLaunchpad module.
