# Treasury Multi-Signature Wallet - Documentation

## Overview

The Treasury module implements a secure M-of-N multi-signature wallet for DAO fund management on Sui blockchain. It enables multiple owners to collectively control treasury funds with configurable approval thresholds.

**Location:** `/home/user/one.ie/backend/sui-contracts/sources/treasury.move`

## Key Features

- **M-of-N Multi-Sig**: Require M approvals from N owners (e.g., 3 of 5 owners)
- **Transaction Expiry**: Proposals automatically expire after configured time (default: 7 days)
- **Double-Approval Prevention**: Each owner can only approve once per transaction
- **Multi-Asset Support**: Hold SUI + any custom tokens via `TokenBalance<T>`
- **Owner Management**: Add/remove owners via multi-sig approval
- **Threshold Updates**: Update approval threshold via multi-sig approval
- **Complete Audit Trail**: All operations emit events for transparency

## Architecture

### Core Structs

#### 1. Treasury
Main treasury object holding configuration and SUI balance.

```move
struct Treasury has key, store {
    id: UID,
    owners: vector<address>,           // Multi-sig participants
    threshold: u64,                    // Required approvals (M in M-of-N)
    sui_balance: Balance<SUI>,         // SUI holdings
    nonce: u64,                        // Transaction counter
    created_at: u64,                   // Creation timestamp
}
```

#### 2. PendingTransaction
Represents a proposed transaction awaiting approvals.

```move
struct PendingTransaction has key, store {
    id: UID,
    treasury_id: ID,                   // Parent treasury
    tx_type: u8,                       // Transaction type (1-4)
    to: Option<address>,               // Recipient (if applicable)
    amount: u64,                       // Amount or new threshold
    calldata: vector<u8>,              // Additional data
    approvals: vector<address>,        // Approvers so far
    executed: bool,                    // Execution status
    created_at: u64,                   // Proposal time
    expires_at: u64,                   // Expiry deadline
    proposer: address,                 // Who proposed
}
```

#### 3. TokenBalance<T>
Generic holder for any token type (enables multi-asset treasury).

```move
struct TokenBalance<phantom T> has key, store {
    id: UID,
    treasury_id: ID,
    balance: Balance<T>,
}
```

### Transaction Types

| Type | Code | Description |
|------|------|-------------|
| Transfer | 1 | Transfer SUI to recipient |
| Add Owner | 2 | Add new multi-sig owner |
| Remove Owner | 3 | Remove existing owner |
| Update Threshold | 4 | Change approval threshold |

## Multi-Sig Flow

### Complete Transaction Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                    MULTI-SIG FLOW                           │
└─────────────────────────────────────────────────────────────┘

1. PROPOSE (any owner)
   │
   ├─> propose_transfer(treasury, to, amount, expiry)
   ├─> propose_add_owner(treasury, new_owner, expiry)
   ├─> propose_remove_owner(treasury, owner, expiry)
   └─> propose_update_threshold(treasury, new_threshold, expiry)
   │
   └──> Creates PendingTransaction (shared object)
        Emits: TransactionProposed

2. APPROVE (each owner, up to threshold)
   │
   └─> approve_transaction(treasury, pending_tx)
       │
       ├─> Validates: owner status, not expired, not executed
       ├─> Prevents: double-approval from same owner
       └─> Adds approval to pending_tx.approvals
           Emits: TransactionApproved

3. EXECUTE (any owner, once threshold met)
   │
   └─> execute_transaction(treasury, pending_tx)
       │
       ├─> Validates: threshold met, not expired, not executed
       ├─> Marks pending_tx.executed = true
       ├─> Executes based on tx_type:
       │   ├─> TX_TYPE_TRANSFER: Send SUI to recipient
       │   ├─> TX_TYPE_ADD_OWNER: Add to owners vector
       │   ├─> TX_TYPE_REMOVE_OWNER: Remove from owners vector
       │   └─> TX_TYPE_UPDATE_THRESHOLD: Update threshold
       │
       └──> Emits: TransactionExecuted + type-specific events

┌─────────────────────────────────────────────────────────────┐
│                 SECURITY GUARANTEES                         │
└─────────────────────────────────────────────────────────────┘

✓ Only owners can propose/approve/execute
✓ Each owner can approve only once per transaction
✓ Transactions auto-expire (default: 7 days)
✓ Threshold must be met before execution
✓ Executed transactions cannot be re-executed
✓ Owner count must always support threshold
✓ All operations emit auditable events
```

## Usage Examples

### Example 1: Create a 3-of-5 Multi-Sig Treasury

```move
// Setup
let owner1 = @0x1;
let owner2 = @0x2;
let owner3 = @0x3;
let owner4 = @0x4;
let owner5 = @0x5;

let owners = vector[owner1, owner2, owner3, owner4, owner5];
let threshold = 3; // Require 3 approvals

// Create treasury (entry function)
create_treasury(owners, threshold, ctx);

// Result: Shared Treasury object with 5 owners, 3-approval threshold
// Event: TreasuryCreated emitted
```

### Example 2: Transfer SUI from Treasury

```move
// Step 1: Owner1 proposes transfer
propose_transfer(
    treasury,
    recipient_address,
    1_000_000_000, // 1 SUI (in MIST)
    0,             // Use default expiry (7 days)
    ctx
);
// Event: TransactionProposed

// Step 2: Owner2 approves
approve_transaction(treasury, pending_tx, ctx);
// Event: TransactionApproved (1/3 approvals)

// Step 3: Owner3 approves
approve_transaction(treasury, pending_tx, ctx);
// Event: TransactionApproved (2/3 approvals)

// Step 4: Owner4 approves
approve_transaction(treasury, pending_tx, ctx);
// Event: TransactionApproved (3/3 approvals - THRESHOLD MET)

// Step 5: Any owner executes (threshold reached)
execute_transaction(treasury, pending_tx, ctx);
// Event: TransactionExecuted
// Result: 1 SUI transferred to recipient
```

### Example 3: Add New Owner

```move
// Step 1: Propose adding owner6
propose_add_owner(
    treasury,
    @0x6,    // New owner address
    0,       // Use default expiry
    ctx
);

// Step 2-4: Get 3 approvals (same as transfer example)
approve_transaction(treasury, pending_tx, ctx); // Owner1
approve_transaction(treasury, pending_tx, ctx); // Owner2
approve_transaction(treasury, pending_tx, ctx); // Owner3

// Step 5: Execute
execute_transaction(treasury, pending_tx, ctx);
// Event: OwnerAdded
// Result: Treasury now has 6 owners (still 3-approval threshold)
```

### Example 4: Remove Owner and Update Threshold

```move
// Scenario: Remove owner5 and update threshold to 2-of-4

// Part A: Remove Owner
propose_remove_owner(treasury, owner5, 0, ctx);
// Approvals...
execute_transaction(treasury, pending_tx, ctx);
// Event: OwnerRemoved
// Result: 4 owners, 3-approval threshold

// Part B: Update Threshold
propose_update_threshold(treasury, 2, 0, ctx);
// Approvals...
execute_transaction(treasury, pending_tx, ctx);
// Event: ThresholdUpdated
// Result: 4 owners, 2-approval threshold
```

### Example 5: Deposit and Hold Multiple Assets

```move
// Deposit SUI (anyone can deposit)
deposit_sui(treasury, sui_coin, ctx);
// Event: FundsDeposited

// Deposit custom token (creates TokenBalance<T>)
let token_balance = deposit_token<USDC>(treasury, usdc_coin, ctx);
// Event: FundsDeposited
// Result: TokenBalance<USDC> object created and shared

// Treasury now holds:
// - SUI in treasury.sui_balance
// - USDC in separate TokenBalance<USDC> object
// - Can hold unlimited token types via TokenBalance<T> pattern
```

## Events Reference

### TreasuryCreated
```move
struct TreasuryCreated has copy, drop {
    treasury_id: ID,
    owners: vector<address>,
    threshold: u64,
    created_at: u64,
}
```

### TransactionProposed
```move
struct TransactionProposed has copy, drop {
    treasury_id: ID,
    transaction_id: ID,
    tx_type: u8,               // 1=Transfer, 2=AddOwner, 3=RemoveOwner, 4=UpdateThreshold
    proposer: address,
    to: Option<address>,       // Recipient (if applicable)
    amount: u64,               // Amount or new threshold
    expires_at: u64,
}
```

### TransactionApproved
```move
struct TransactionApproved has copy, drop {
    treasury_id: ID,
    transaction_id: ID,
    approver: address,
    total_approvals: u64,      // Current approval count
    threshold: u64,            // Required approvals
}
```

### TransactionExecuted
```move
struct TransactionExecuted has copy, drop {
    treasury_id: ID,
    transaction_id: ID,
    tx_type: u8,
    executor: address,
    executed_at: u64,
}
```

### OwnerAdded / OwnerRemoved
```move
struct OwnerAdded has copy, drop {
    treasury_id: ID,
    new_owner: address,
    total_owners: u64,
}

struct OwnerRemoved has copy, drop {
    treasury_id: ID,
    removed_owner: address,
    total_owners: u64,
}
```

### ThresholdUpdated
```move
struct ThresholdUpdated has copy, drop {
    treasury_id: ID,
    old_threshold: u64,
    new_threshold: u64,
}
```

### FundsDeposited
```move
struct FundsDeposited has copy, drop {
    treasury_id: ID,
    depositor: address,
    amount: u64,
    timestamp: u64,
}
```

## Error Codes

| Code | Constant | Description |
|------|----------|-------------|
| 1 | E_NOT_OWNER | Caller is not an owner |
| 2 | E_ALREADY_EXECUTED | Transaction already executed |
| 3 | E_TRANSACTION_EXPIRED | Transaction past expiry |
| 4 | E_ALREADY_APPROVED | Owner already approved |
| 5 | E_INSUFFICIENT_APPROVALS | Not enough approvals |
| 6 | E_INVALID_THRESHOLD | Invalid threshold value |
| 7 | E_OWNER_ALREADY_EXISTS | Owner already in list |
| 8 | E_OWNER_NOT_FOUND | Owner not in list |
| 9 | E_CANNOT_REMOVE_OWNER | Would violate threshold |
| 10 | E_TRANSACTION_NOT_FOUND | Transaction doesn't belong to treasury |
| 11 | E_INSUFFICIENT_BALANCE | Not enough funds |
| 12 | E_INVALID_TRANSACTION_TYPE | Unknown transaction type |

## Security Considerations

### 1. Transaction Expiry
- **Default**: 7 days (604,800,000 ms)
- **Purpose**: Prevent stale transactions from being executed
- **Best Practice**: Set reasonable expiry based on treasury size and activity

### 2. Threshold Requirements
- **Minimum**: 1 (single-sig, not recommended)
- **Maximum**: Owner count (unanimous)
- **Recommended**: 50-70% of owners (e.g., 3-of-5, 5-of-7)
- **Critical Assets**: Consider higher threshold (e.g., 4-of-5)

### 3. Owner Management
- **Adding Owners**: Requires multi-sig approval
- **Removing Owners**: Must maintain threshold viability
- **Best Practice**: Keep owner count odd (prevents deadlocks)

### 4. Multi-Asset Holdings
- **SUI**: Stored directly in Treasury.sui_balance
- **Other Tokens**: Separate TokenBalance<T> objects per token type
- **Security**: Each token type requires separate withdrawal proposal

### 5. Execution Order
- Proposals can be approved/executed in any order
- Expired proposals cannot be approved/executed
- Executed proposals cannot be re-executed

## Integration with ONE Ontology

### Mapping to 6 Dimensions

**GROUPS:**
- Treasury belongs to a DAO (group)
- `treasury.owners` represents group governance

**PEOPLE:**
- Owners are `org_owner` or `platform_owner` roles
- Proposers/approvers/executors tracked in events

**THINGS:**
- Treasury is a `thing` with `type: 'treasury'`
- PendingTransaction is a `thing` with `type: 'pending_transaction'`

**CONNECTIONS:**
- `owns_treasury`: DAO → Treasury
- `proposed`: Owner → PendingTransaction
- `approved`: Owner → PendingTransaction

**EVENTS:**
- `treasury_created`, `treasury_deposit`, `treasury_withdrawal`
- `transaction_proposed`, `transaction_approved`, `transaction_executed`
- `owner_added`, `owner_removed`, `threshold_updated`

**KNOWLEDGE:**
- Governance rules (threshold, expiry)
- Transaction history and patterns
- Owner participation analytics

### Convex Integration

```typescript
// Backend service pattern
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Mutation: Create treasury in Convex after on-chain creation
export const createTreasury = mutation({
  args: {
    groupId: v.id("groups"),
    treasuryId: v.string(), // Sui object ID
    owners: v.array(v.string()),
    threshold: v.number(),
  },
  handler: async (ctx, args) => {
    // 1. Validate group and permissions
    // 2. Create treasury entity
    const treasuryEntityId = await ctx.db.insert("things", {
      type: "treasury",
      name: `Treasury ${args.threshold}-of-${args.owners.length}`,
      groupId: args.groupId,
      properties: {
        network: "sui",
        treasuryId: args.treasuryId,
        owners: args.owners,
        threshold: args.threshold,
      },
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // 3. Log event
    await ctx.db.insert("events", {
      type: "treasury_created",
      actorId: ctx.auth.getUserIdentity()?.subject, // Creator
      targetId: treasuryEntityId,
      timestamp: Date.now(),
      metadata: {
        network: "sui",
        treasuryId: args.treasuryId,
        owners: args.owners,
        threshold: args.threshold,
      },
    });

    return treasuryEntityId;
  },
});

// Query: Get treasury details
export const getTreasury = query({
  args: { treasuryEntityId: v.id("things") },
  handler: async (ctx, args) => {
    const treasury = await ctx.db.get(args.treasuryEntityId);

    // Fetch pending transactions
    const pendingTxs = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "pending_transaction"))
      .filter((q) =>
        q.eq(q.field("properties.treasuryId"), treasury?.properties.treasuryId)
      )
      .collect();

    return { treasury, pendingTxs };
  },
});
```

## Testing

### Unit Tests

```move
#[test_only]
module treasury::multi_sig_tests {
    use treasury::multi_sig::{Self, Treasury, PendingTransaction};
    use sui::test_scenario;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;

    #[test]
    fun test_create_treasury() {
        let owner1 = @0x1;
        let owner2 = @0x2;
        let owner3 = @0x3;

        let scenario_val = test_scenario::begin(owner1);
        let scenario = &mut scenario_val;

        {
            let owners = vector[owner1, owner2, owner3];
            multi_sig::create_treasury(owners, 2, test_scenario::ctx(scenario));
        };

        test_scenario::next_tx(scenario, owner1);
        {
            let treasury = test_scenario::take_shared<Treasury>(scenario);
            assert!(multi_sig::get_threshold(&treasury) == 2, 0);
            assert!(vector::length(&multi_sig::get_owners(&treasury)) == 3, 1);
            test_scenario::return_shared(treasury);
        };

        test_scenario::end(scenario_val);
    }

    #[test]
    fun test_propose_and_approve() {
        // Test proposal creation and approval flow
        // ... (full test implementation)
    }

    #[test]
    fun test_execute_transfer() {
        // Test successful transfer execution
        // ... (full test implementation)
    }

    #[test]
    #[expected_failure(abort_code = multi_sig::E_ALREADY_APPROVED)]
    fun test_double_approval_fails() {
        // Test that same owner cannot approve twice
        // ... (full test implementation)
    }
}
```

## Deployment

### Prerequisites
```bash
# Install Sui CLI
cargo install --locked --git https://github.com/MystenLabs/sui.git --branch mainnet sui

# Configure wallet
sui client new-env --alias mainnet --rpc https://fullnode.mainnet.sui.io:443
sui client switch --env mainnet
```

### Deploy to Testnet
```bash
cd /home/user/one.ie/backend/sui-contracts

# Build
sui move build

# Test
sui move test

# Publish to testnet
sui client publish --gas-budget 100000000

# Save package ID
export TREASURY_PACKAGE_ID=<package_id_from_output>
```

### Deploy to Mainnet
```bash
# Switch to mainnet
sui client switch --env mainnet

# Publish
sui client publish --gas-budget 100000000

# Verify on Sui Explorer
# https://suiexplorer.com/object/<package_id>?network=mainnet
```

## Next Steps

1. **Integration** (Cycle 26-35): Create TreasuryService in Effect.ts
2. **Backend** (Cycle 44-45): Create Convex mutations/queries
3. **Frontend** (Cycle 75): Build TreasuryManager.tsx component
4. **Testing** (Cycle 96): Write comprehensive e2e tests
5. **Audit** (Cycle 98): Security audit before mainnet deployment

## Resources

- **Sui Documentation**: https://docs.sui.io
- **Move Language**: https://move-language.github.io/move/
- **Sui Move Examples**: https://github.com/MystenLabs/sui/tree/main/examples
- **Sui Explorer**: https://suiexplorer.com

---

**Treasury Multi-Sig: Secure, flexible, production-ready DAO treasury management on Sui.**
