# Treasury Multi-Sig - Quick Start

## Files Created

```
/home/user/one.ie/backend/sui-contracts/
├── Move.toml                     # Project configuration
├── sources/
│   └── treasury.move             # Main contract (830 lines)
├── tests/
│   └── treasury_tests.move       # Test suite (400+ lines, 12 tests)
├── TREASURY-README.md            # Complete documentation
└── QUICK-START.md                # This file
```

## Build & Test

```bash
cd /home/user/one.ie/backend/sui-contracts

# Build the contract
sui move build

# Run tests
sui move test

# Run specific test
sui move test test_create_treasury_success
```

## Deploy

### Testnet
```bash
# Publish
sui client publish --gas-budget 100000000

# Save the package ID from output
export TREASURY_PACKAGE=0x...
```

### Mainnet
```bash
sui client switch --env mainnet
sui client publish --gas-budget 100000000
```

## Usage Example

### 1. Create Treasury (3-of-5 multi-sig)

```bash
sui client call \
  --package $TREASURY_PACKAGE \
  --module multi_sig \
  --function create_treasury \
  --args "[0x1,0x2,0x3,0x4,0x5]" 3 \
  --gas-budget 10000000
```

### 2. Deposit SUI

```bash
sui client call \
  --package $TREASURY_PACKAGE \
  --module multi_sig \
  --function deposit_sui \
  --args $TREASURY_ID $COIN_ID \
  --gas-budget 10000000
```

### 3. Propose Transfer

```bash
sui client call \
  --package $TREASURY_PACKAGE \
  --module multi_sig \
  --function propose_transfer \
  --args $TREASURY_ID $RECIPIENT_ADDRESS 1000000000 0 \
  --gas-budget 10000000
```

### 4. Approve Transaction (3 owners)

```bash
# Owner 2 approves
sui client call \
  --package $TREASURY_PACKAGE \
  --module multi_sig \
  --function approve_transaction \
  --args $TREASURY_ID $PENDING_TX_ID \
  --gas-budget 10000000

# Owner 3 approves
# (repeat with different signer)

# Owner 4 approves (threshold met!)
# (repeat with different signer)
```

### 5. Execute Transaction

```bash
sui client call \
  --package $TREASURY_PACKAGE \
  --module multi_sig \
  --function execute_transaction \
  --args $TREASURY_ID $PENDING_TX_ID \
  --gas-budget 10000000
```

## Multi-Sig Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│              3-OF-5 MULTI-SIG FLOW                  │
└─────────────────────────────────────────────────────┘

1. PROPOSE (Owner 1)
   │
   └─> propose_transfer(treasury, recipient, 1 SUI)
       Creates: PendingTransaction
       Status: 0/3 approvals ❌

2. APPROVE (Owner 2)
   │
   └─> approve_transaction(treasury, pending_tx)
       Status: 1/3 approvals ⏳

3. APPROVE (Owner 3)
   │
   └─> approve_transaction(treasury, pending_tx)
       Status: 2/3 approvals ⏳

4. APPROVE (Owner 4)
   │
   └─> approve_transaction(treasury, pending_tx)
       Status: 3/3 approvals ✅ THRESHOLD MET

5. EXECUTE (Any owner)
   │
   └─> execute_transaction(treasury, pending_tx)
       Action: Transfer 1 SUI to recipient
       Status: EXECUTED ✅
```

## Key Features

- ✅ **M-of-N Multi-Sig**: 3-of-5, 2-of-3, 5-of-7, etc.
- ✅ **Transaction Expiry**: Auto-expire after 7 days (configurable)
- ✅ **Double-Approval Prevention**: Each owner approves once
- ✅ **Multi-Asset Support**: SUI + any token via `TokenBalance<T>`
- ✅ **Owner Management**: Add/remove owners (requires approval)
- ✅ **Threshold Updates**: Update M-of-N (requires approval)
- ✅ **Complete Events**: Full audit trail
- ✅ **Gas Efficient**: Optimized for low transaction costs

## Security

| Check | Implementation |
|-------|----------------|
| Only owners can propose | ✅ `assert!(is_owner())` |
| Only owners can approve | ✅ `assert!(is_owner())` |
| No double-approval | ✅ `assert!(!has_approved())` |
| No expired execution | ✅ `assert!(now < expires_at)` |
| No re-execution | ✅ `assert!(!executed)` |
| Threshold enforced | ✅ `assert!(approvals >= threshold)` |
| Balance check | ✅ `assert!(balance >= amount)` |

## Next Steps

1. **Backend Integration** (Cycle 31): Create TreasuryService.ts
2. **Convex Sync** (Cycle 44-45): Sync on-chain events to Convex
3. **Frontend** (Cycle 75): Build TreasuryManager.tsx
4. **Testing** (Cycle 96): E2E tests
5. **Audit** (Cycle 98): Security audit

## Resources

- **Full Documentation**: `TREASURY-README.md`
- **Contract Code**: `sources/treasury.move`
- **Tests**: `tests/treasury_tests.move`
- **Sui Docs**: https://docs.sui.io
- **Sui Explorer**: https://suiexplorer.com

---

**Treasury Multi-Sig: Production-ready DAO treasury management on Sui.**
