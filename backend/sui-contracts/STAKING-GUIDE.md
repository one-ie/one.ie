# Staking Contract Complete Guide

## Overview

The staking contract (`sources/staking.move`) enables users to stake tokens and earn rewards based on time and amount staked. It's fully integrated with the ONE platform's 6-dimension ontology.

## File Structure

```
backend/sui-contracts/
├── Move.toml                          # Package manifest
├── README.md                          # Complete documentation
├── STAKING-GUIDE.md                   # This file
├── integration-example.ts             # Convex backend integration
└── sources/
    ├── staking.move                   # Main staking contract
    └── staking_tests.move            # Comprehensive test suite
```

## 6-Dimension Ontology Mapping

### 1. GROUPS (Organizations)
- `StakingPool.organization_id` - Multi-tenant scoping
- Each organization can create multiple staking pools
- Organization quotas enforced at Convex layer

### 2. PEOPLE (Stakers & Owners)
- `StakingPool.owner` - Pool creator with admin rights
- `StakePosition.staker` - Token stakers
- Wallet addresses mapped to Convex "people" entities

### 3. THINGS (Entities)
- **StakingPool** → `things` table with `type: "staking_pool"`
- Properties: poolId, tokenType, rewardRate, lockDuration, totalStaked
- Status: active, paused, archived

### 4. CONNECTIONS (Relationships)
- **owns** → Person owns StakingPool (admin capability)
- **staked_in** → Person staked_in StakingPool (StakePosition)
- Metadata tracks: positionId, amount, lockEnd, totalClaimed

### 5. EVENTS (Audit Trail)
- **entity_created** → Pool created
- **staked** → Tokens staked
- **rewards_claimed** → Rewards claimed
- **unstaked** → Tokens unstaked
- All events include: actorId, targetId, timestamp, metadata

### 6. KNOWLEDGE (Analytics)
- Pool performance metrics
- User staking patterns
- APY optimization insights
- Risk analytics

## Smart Contract Architecture

### Core Structs

#### StakingPool (Shared Object)
```move
public struct StakingPool<phantom T> has key {
    id: UID,
    total_staked: u64,              // Total tokens staked
    reward_rate: u64,               // APY in basis points (1000 = 10%)
    lock_duration: u64,             // Lock period in seconds
    owner: address,                 // Pool admin
    reward_balance: Balance<T>,     // Rewards pool
    organization_id: Option<address> // Multi-tenant scoping
}
```

#### StakePosition (Owned Object/NFT)
```move
public struct StakePosition<phantom T> has key, store {
    id: UID,
    pool_id: ID,                    // Reference to pool
    staker: address,                // Staker address
    amount: u64,                    // Tokens staked
    start_time: u64,                // When staked (ms)
    lock_end: u64,                  // When unlocked (ms)
    last_claim_time: u64,           // Last reward claim (ms)
    rewards_claimed: u64,           // Total rewards claimed
    staked_balance: Balance<T>      // Actual tokens
}
```

#### StakingPoolCap (Admin Capability)
```move
public struct StakingPoolCap has key, store {
    id: UID,
    pool_id: ID  // Pool this capability controls
}
```

## Reward Calculation Deep Dive

### Formula
```
rewards = (amount_staked × reward_rate × time_elapsed) / (SECONDS_PER_YEAR × PRECISION)
```

### Constants
- `PRECISION = 10000` (2 decimal places for APY)
- `SECONDS_PER_YEAR = 31536000` (365 days)

### Implementation
```move
fun calculate_rewards_internal(
    amount: u64,
    reward_rate: u64,
    last_claim_time: u64,
    current_time: u64
): u64 {
    let time_elapsed = (current_time - last_claim_time) / 1000; // ms → s

    // Use u128 to prevent overflow
    let amount_128 = (amount as u128);
    let reward_rate_128 = (reward_rate as u128);
    let time_elapsed_128 = (time_elapsed as u128);

    let numerator = amount_128 * reward_rate_128 * time_elapsed_128;
    let denominator = (SECONDS_PER_YEAR as u128) * (PRECISION as u128);

    let rewards_128 = numerator / denominator;
    (rewards_128 as u64)
}
```

### Example Calculations

#### Case 1: Standard 10% APY for 30 days
```
Given:
- amount_staked = 10,000 tokens
- reward_rate = 1000 (10% APY)
- time_elapsed = 2,592,000 seconds (30 days)

Calculation:
numerator = 10,000 × 1000 × 2,592,000 = 25,920,000,000,000
denominator = 31,536,000 × 10,000 = 315,360,000,000
rewards = 25,920,000,000,000 / 315,360,000,000 = 82.19 tokens

Result: ~82 tokens (0.82% return in 30 days)
```

#### Case 2: High APY 50% for 7 days
```
Given:
- amount_staked = 100,000 tokens
- reward_rate = 5000 (50% APY)
- time_elapsed = 604,800 seconds (7 days)

Calculation:
numerator = 100,000 × 5000 × 604,800 = 302,400,000,000,000
denominator = 31,536,000 × 10,000 = 315,360,000,000
rewards = 302,400,000,000,000 / 315,360,000,000 = 958.90 tokens

Result: ~959 tokens (~1% return in 7 days)
```

#### Case 3: Full year 15% APY
```
Given:
- amount_staked = 50,000 tokens
- reward_rate = 1500 (15% APY)
- time_elapsed = 31,536,000 seconds (365 days)

Calculation:
numerator = 50,000 × 1500 × 31,536,000 = 2,365,200,000,000,000
denominator = 31,536,000 × 10,000 = 315,360,000,000
rewards = 2,365,200,000,000,000 / 315,360,000,000 = 7,500 tokens

Result: 7,500 tokens (exactly 15% return)
```

### Why This Formula Works

1. **Time proportionality**: `time_elapsed / SECONDS_PER_YEAR` gives fraction of year
2. **Rate conversion**: `reward_rate / PRECISION` converts basis points to decimal (1000 → 0.10)
3. **Simple interest**: Rewards = Principal × Rate × Time
4. **Integer math**: Multiply before divide to maintain precision

## Function Reference

### create_pool
Create a new staking pool.

```move
public fun create_pool<T>(
    reward_rate: u64,           // APY in basis points (1000 = 10%)
    lock_duration: u64,         // Lock period in seconds
    initial_rewards: Coin<T>,   // Initial reward balance
    organization_id: Option<address>,  // Optional org ID
    clock: &Clock,
    ctx: &mut TxContext
): StakingPoolCap
```

**Events:** `PoolCreated`

### stake
Stake tokens in a pool.

```move
public fun stake<T>(
    pool: &mut StakingPool<T>,
    stake_coins: Coin<T>,
    clock: &Clock,
    ctx: &mut TxContext
): StakePosition<T>
```

**Events:** `Staked`

### claim_rewards
Claim accumulated rewards without unstaking.

```move
public fun claim_rewards<T>(
    pool: &mut StakingPool<T>,
    position: &mut StakePosition<T>,
    clock: &Clock,
    ctx: &mut TxContext
): Coin<T>
```

**Events:** `RewardsClaimed`

### unstake
Unstake tokens (requires lock period to be expired).

```move
public fun unstake<T>(
    pool: &mut StakingPool<T>,
    position: StakePosition<T>,
    clock: &Clock,
    ctx: &mut TxContext
): Coin<T>
```

**Events:** `Unstaked`

### calculate_rewards
Calculate pending rewards (view function).

```move
public fun calculate_rewards<T>(
    position: &StakePosition<T>,
    pool: &StakingPool<T>,
    clock: &Clock
): u64
```

### update_reward_rate
Update APY (owner only).

```move
public fun update_reward_rate<T>(
    pool: &mut StakingPool<T>,
    cap: &StakingPoolCap,
    new_rate: u64,
    clock: &Clock
)
```

**Events:** `RewardRateUpdated`

## Security Features

### 1. Lock Period Enforcement
```move
assert!(current_time >= position.lock_end, ELockPeriodActive);
```
Cannot unstake before lock period expires.

### 2. Overflow Protection
```move
let amount_128 = (amount as u128);  // Use u128 for intermediate calculations
assert!(rewards_128 <= (18446744073709551615u128), EOverflow);
```
Prevents arithmetic overflow in reward calculations.

### 3. Capability-Based Access Control
```move
public fun update_reward_rate<T>(
    pool: &mut StakingPool<T>,
    cap: &StakingPoolCap,  // Only owner has this
    new_rate: u64,
    clock: &Clock
)
```
Only pool owner can update reward rate.

### 4. Balance Validation
```move
assert!(balance::value(&pool.reward_balance) >= pending_rewards, EInsufficientPoolBalance);
```
Ensures sufficient rewards before claiming.

### 5. Zero Amount Protection
```move
assert!(amount > 0, EZeroAmount);
```
Prevents zero-amount stakes.

## Integration with Convex Backend

### Event Flow
```
Sui Move Contract → Event Emission → Event Listener → Convex Mutation → 6-Dimension Tables
```

### Example: Stake Event Integration

1. **User stakes on Sui:**
```move
let position = staking::stake(&mut pool, coins, &clock, ctx);
// Emits: Staked { pool_id, position_id, staker, amount, lock_end, timestamp }
```

2. **Event listener captures event:**
```typescript
suiClient.subscribeEvent({
  filter: { MoveEventModule: { package: PACKAGE_ID, module: 'staking' } },
  onMessage: (event) => {
    if (event.type.includes('::Staked')) {
      convexClient.mutation(api.staking.handleStaked, event.parsedJson);
    }
  }
});
```

3. **Convex mutation updates ontology:**
```typescript
// Create connection in 6-dimension model
await ctx.db.insert("connections", {
  fromThingId: staker._id,
  toThingId: poolThing._id,
  relationshipType: "staked_in",
  metadata: { positionId, amount, lockEnd },
  validFrom: timestamp
});

// Log event
await ctx.db.insert("events", {
  type: "staked",
  actorId: staker._id,
  targetId: poolThing._id,
  timestamp,
  metadata: { protocol: "sui", positionId, amount }
});
```

See `integration-example.ts` for complete implementation.

## Testing

### Run Tests
```bash
cd backend/sui-contracts
sui move test
```

### Test Coverage
- ✅ Pool creation
- ✅ Token staking
- ✅ Reward calculation (30 days)
- ✅ Claiming rewards
- ✅ Unstaking after lock period
- ✅ Unstaking before lock period (should fail)
- ✅ Updating reward rate
- ✅ Multiple stakers

See `sources/staking_tests.move` for all test cases.

## Gas Optimization Tips

1. **Use shared objects for pools** - Multiple users can interact without object transfers
2. **Batch operations** - Claim rewards less frequently to save gas
3. **Efficient queries** - Use view functions before transactions
4. **Minimal storage** - Position objects store only essential data

## Common Patterns

### Pattern 1: Create Pool and Stake
```move
// Admin creates pool
let cap = staking::create_pool<SUI>(1000, 2592000, rewards, none(), &clock, ctx);

// User stakes
let position = staking::stake<SUI>(&mut pool, coins, &clock, ctx);
```

### Pattern 2: Check and Claim
```move
// Check pending rewards first (view function)
let pending = staking::calculate_rewards(&position, &pool, &clock);

if (pending > 0) {
    // Claim rewards
    let rewards = staking::claim_rewards(&mut pool, &mut position, &clock, ctx);
}
```

### Pattern 3: Auto-compound
```move
// Claim rewards
let rewards = staking::claim_rewards(&mut pool, &mut position, &clock, ctx);

// Immediately re-stake them
let new_position = staking::stake(&mut pool, rewards, &clock, ctx);
```

## Deployment Checklist

- [ ] Build contract: `sui move build`
- [ ] Run tests: `sui move test`
- [ ] Set up wallet: `sui client active-address`
- [ ] Fund wallet with SUI for gas
- [ ] Publish contract: `sui client publish --gas-budget 100000000`
- [ ] Save package ID for event listener
- [ ] Set up Convex event handlers
- [ ] Configure event listener service
- [ ] Test on devnet before mainnet
- [ ] Monitor events and logs

## Support

- Sui Move Docs: https://docs.sui.io/guides/developer/sui-move
- Convex Docs: https://docs.convex.dev
- ONE Platform: https://one.ie

---

**Built for the ONE Platform's 6-dimension ontology**
**Sui Move • Convex • Effect.ts • 6 Dimensions**
