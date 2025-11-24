# ONE Platform - Sui Move Contracts

Smart contracts for the ONE platform's crypto launchpad, built on the Sui blockchain.

## Architecture

These contracts integrate with the ONE platform's **6-dimension ontology**:

1. **GROUPS** → Organization scoping (organization_id in pools)
2. **PEOPLE** → Stakers and pool owners
3. **THINGS** → StakingPool entities (type: staking_pool)
4. **CONNECTIONS** → StakePosition (staked_in relationship)
5. **EVENTS** → PoolCreated, Staked, Unstaked, RewardsClaimed
6. **KNOWLEDGE** → Contract metadata and analytics

## Contracts

### 1. DAO Governance Contract (`sources/dao_governance.move`)

Token-based governance system for DAOs on Sui blockchain.

**Key Features:**
- Token-weighted voting (voting power = token balance)
- Configurable quorum and approval thresholds
- Time-based voting periods
- One vote per address per proposal
- Executable actions (contract calls if proposal passes)
- Comprehensive event emission

**Process Flow:** See [GOVERNANCE_FLOW.md](./GOVERNANCE_FLOW.md) for detailed diagrams

**Key Functions:**
- `initialize_governance()` - Create new DAO governance
- `create_proposal()` - Create governance proposal
- `cast_vote()` - Vote on proposal (FOR/AGAINST/ABSTAIN)
- `execute_proposal()` - Execute passed proposal
- `get_proposal_status()` - Get current proposal status
- `calculate_voting_power()` - Get user's voting weight

**Events:**
- `ProposalCreated` - New proposal created
- `VoteCast` - Vote cast on proposal
- `ProposalExecuted` - Proposal executed
- `GovernanceUpdated` - Parameters updated

### 2. Vesting Contract (`sources/vesting.move`)

Time-locked token distribution for team members and investors.

**Key Features:**
- Linear vesting with cliff period
- Incremental claiming (claim as tokens vest)
- Admin revocation (return unvested tokens)
- Safe against double-claiming and overflow
- Event emission for complete audit trail

**Example**: See [VESTING-EXAMPLE.md](./VESTING-EXAMPLE.md) for detailed calculation walkthrough

### 3. Staking Contract (`sources/staking.move`)

Allows users to stake tokens and earn rewards based on time and amount staked.

**Key Features:**
- Time-locked staking with configurable lock periods
- APY-based rewards with precise calculations
- Multi-tenant organization support
- Owner-controlled reward rate updates
- Event emission for all operations

## Staking Reward Formula

### Formula

```
rewards = (amount_staked × reward_rate × time_elapsed) / (SECONDS_PER_YEAR × PRECISION)
```

### Variables

- **amount_staked**: Number of tokens staked (in token's smallest unit)
- **reward_rate**: Annual percentage yield in basis points
  - Example: `1000` = 10% APY
  - Example: `1234` = 12.34% APY
  - Range: 0-10000 (0% to 100%)
- **time_elapsed**: Seconds since last claim or stake
- **PRECISION**: `10000` (allows 2 decimal places)
- **SECONDS_PER_YEAR**: `31536000` (365 days)

### Examples

#### Example 1: 10% APY for 30 days

```
Stake: 1000 tokens
APY: 10% (reward_rate = 1000)
Time: 30 days = 2,592,000 seconds

rewards = (1000 × 1000 × 2,592,000) / (31,536,000 × 10000)
        = 2,592,000,000,000 / 315,360,000,000
        = 8.22 tokens
```

#### Example 2: 25% APY for 1 year

```
Stake: 5000 tokens
APY: 25% (reward_rate = 2500)
Time: 1 year = 31,536,000 seconds

rewards = (5000 × 2500 × 31,536,000) / (31,536,000 × 10000)
        = 393,300,000,000,000 / 315,360,000,000
        = 1247 tokens (24.94% of stake)
```

#### Example 3: 12.34% APY for 7 days

```
Stake: 10000 tokens
APY: 12.34% (reward_rate = 1234)
Time: 7 days = 604,800 seconds

rewards = (10000 × 1234 × 604,800) / (31,536,000 × 10000)
        = 7,463,232,000,000 / 315,360,000,000
        = 23.67 tokens
```

### Overflow Protection

The contract uses `u128` for intermediate calculations to prevent overflow:

```move
let amount_128 = (amount as u128);
let reward_rate_128 = (reward_rate as u128);
let time_elapsed_128 = (time_elapsed as u128);

let numerator = amount_128 × reward_rate_128 × time_elapsed_128;
let denominator = (SECONDS_PER_YEAR as u128) × (PRECISION as u128);

let rewards_128 = numerator / denominator;
let rewards = (rewards_128 as u64);
```

This allows safe calculation for:
- Maximum stake: ~18.4 quintillion tokens (u64 max)
- Maximum APY: 100% (10000 basis points)
- Maximum time: ~584 billion years

## Usage

### Creating a Staking Pool

```move
use one_staking::staking;
use sui::coin::{Self, Coin};
use sui::sui::SUI;

// Create pool with 10% APY, 30-day lock, and initial rewards
let cap = staking::create_pool<SUI>(
    1000,                          // 10% APY
    2592000,                       // 30 days in seconds
    initial_rewards_coin,          // Coin<SUI> for rewards
    some(organization_address),    // Optional org ID
    &clock,
    ctx
);
```

### Staking Tokens

```move
// Stake 1000 SUI tokens
let position = staking::stake<SUI>(
    &mut pool,
    stake_coins,  // Coin<SUI> worth 1000
    &clock,
    ctx
);

// Position is an NFT owned by the staker
transfer::transfer(position, staker_address);
```

### Claiming Rewards

```move
// Claim rewards without unstaking
let rewards = staking::claim_rewards<SUI>(
    &mut pool,
    &mut position,
    &clock,
    ctx
);

transfer::public_transfer(rewards, staker_address);
```

### Unstaking

```move
// Unstake after lock period expires
let tokens = staking::unstake<SUI>(
    &mut pool,
    position,  // Position is consumed
    &clock,
    ctx
);

transfer::public_transfer(tokens, staker_address);
```

### Checking Pending Rewards

```move
// Calculate pending rewards (view function)
let pending = staking::calculate_rewards<SUI>(&position, &pool, &clock);
```

### Updating Reward Rate (Owner Only)

```move
// Update APY to 15%
staking::update_reward_rate<SUI>(
    &mut pool,
    &cap,           // Requires admin capability
    1500,           // 15% APY
    &clock
);
```

## DAO Governance Usage

### Initializing Governance

```move
use one_vesting::dao_governance;
use sui::object::{Self, ID};
use sui::clock::Clock;

// Initialize DAO governance
dao_governance::initialize_governance(
    dao_id,                    // ID of the DAO entity
    100_000,                   // Proposal threshold (min tokens to create proposal)
    1000,                      // Quorum threshold (10% of supply must vote)
    5000,                      // Approval threshold (50% yes votes to pass)
    604800000,                 // Default voting period (7 days in ms)
    10_000_000,                // Total token supply
    &clock,
    ctx
);
// Returns AdminCap to caller
```

### Creating a Proposal

```move
use std::string;
use std::option;

// Create proposal with custom actions
let actions = vector[
    dao_governance::Action {
        module_name: string::utf8(b"treasury"),
        function_name: string::utf8(b"transfer"),
        arguments: serialize_args(recipient, amount),
    }
];

dao_governance::create_proposal(
    &governance,
    b"Proposal Title",
    b"Detailed description in markdown",
    actions,
    option::some(1209600000),  // Custom 14-day voting period
    500_000,                   // Proposer's token balance
    1,                         // Proposal number
    &clock,
    ctx
);
```

### Casting a Vote

```move
// Vote FOR the proposal
dao_governance::cast_vote(
    &governance,
    &mut proposal,
    1,                         // VOTE_FOR (1=FOR, 2=AGAINST, 3=ABSTAIN)
    250_000,                   // Voter's token balance
    b"I support this proposal",  // Optional comment
    &clock,
    ctx
);
```

### Checking Proposal Status

```move
// Get proposal status (view function)
let status = dao_governance::get_proposal_status(
    &governance,
    &proposal,
    &clock
);

// status.status values:
// 0 = PENDING
// 1 = ACTIVE
// 2 = PASSED
// 3 = FAILED
// 4 = EXECUTED
```

### Executing a Proposal

```move
// Execute if voting ended and proposal passed
dao_governance::execute_proposal(
    &governance,
    &mut proposal,
    &clock,
    ctx
);
// Marks proposal as executed
// Frontend reads proposal.actions and executes them
```

### Updating Governance Parameters (Admin)

```move
use std::option;

// Update quorum to 20% and approval to 60%
dao_governance::update_governance(
    &admin_cap,               // Requires admin capability
    &mut governance,
    option::some(2000),       // New quorum (20%)
    option::some(6000),       // New approval (60%)
    option::none(),           // Keep proposal threshold
    option::none(),           // Keep voting period
    &clock,
    ctx
);
```

### Governance Timeline Example

```
Create Proposal (Day 0)    Voting Active (Day 0-7)    Execute (Day 8+)
         |                           |                        |
   Proposal created            Users vote FOR,           If passed and
   Voting starts               AGAINST, ABSTAIN          quorum met,
                                                         anyone can execute
```

**Key Points:**
- Voting power = token balance (snapshot at vote time)
- One vote per address per proposal
- Quorum = % of total supply that voted
- Approval = % of yes votes (excluding abstain)
- Proposal executes only if quorum AND approval thresholds met

## Vesting Contract Usage

### Creating a Vesting Schedule

```move
use one_vesting::vesting;
use sui::coin::{Self, Coin};
use sui::sui::SUI;

// Create vesting schedule: 1,200,000 tokens over 12 months with 3-month cliff
vesting::create_vesting_schedule<SUI>(
    &admin_cap,                   // Admin capability
    @0xBENEFICIARY,               // Beneficiary address
    tokens_coin,                  // Coin<SUI> with 1,200,000 tokens
    7776000000,                   // 90 days cliff (milliseconds)
    31536000000,                  // 365 days total vesting (milliseconds)
    &clock,
    ctx
);
```

### Claiming Vested Tokens

```move
// Beneficiary claims tokens (can call multiple times as tokens vest)
vesting::claim_vested_tokens<SUI>(
    &mut schedule,  // VestingSchedule object
    &clock,
    ctx
);
// Returns Coin<SUI> with claimable amount
```

### Checking Vested Amount

```move
// Calculate vested amount at current time (view function)
let vested = vesting::calculate_vested_amount<SUI>(&schedule, current_time);

// Get full schedule details
let (beneficiary, total, claimed, cliff_end, vesting_end, start, revoked) =
    vesting::get_vesting_details<SUI>(&schedule);
```

### Revoking Vesting (Admin Only)

```move
// Admin revokes vesting and gets unvested tokens back
vesting::revoke_vesting<SUI>(
    &admin_cap,
    &mut schedule,
    &clock,
    ctx
);
// Returns unvested tokens to admin, beneficiary keeps vested amount
```

### Vesting Timeline Example

```
Start (Day 0)    Cliff (Day 90)    Mid (Day 181)    End (Day 365)
      |                |                 |                 |
   0 tokens        300k tokens       600k tokens       1,200k tokens
  claimable         claimable         claimable         claimable
```

**Key Points:**
- Before cliff (Day 0-89): Cannot claim, `E_BEFORE_CLIFF` error
- At cliff (Day 90): Can claim ~25% of total (300k tokens)
- During vesting (Day 91-364): Linear unlock, claim incrementally
- After full vest (Day 365+): All tokens claimable (if not already claimed)
- Multiple claims: Tracks `claimed_amount` to prevent double-claiming

## Building and Testing

### Prerequisites

```bash
# Install Sui CLI
cargo install --locked --git https://github.com/MystenLabs/sui.git --branch mainnet sui
```

### Build

```bash
cd backend/sui-contracts
sui move build
```

### Test

```bash
sui move test
```

### Publish

```bash
sui client publish --gas-budget 100000000
```

## Integration with Convex Backend

The Sui contracts emit events that the Convex backend listens to:

```typescript
// backend/convex/mutations/staking.ts
export const handleStakedEvent = mutation({
  args: {
    poolId: v.string(),
    positionId: v.string(),
    staker: v.string(),
    amount: v.number(),
    lockEnd: v.number(),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    // 1. Create thing (type: staking_pool)
    const poolThingId = await ctx.db.insert("things", {
      type: "staking_pool",
      name: `Staking Pool ${args.poolId}`,
      properties: { poolId: args.poolId },
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // 2. Create connection (staked_in)
    await ctx.db.insert("connections", {
      fromThingId: args.staker,
      toThingId: poolThingId,
      relationshipType: "staked_in",
      metadata: {
        positionId: args.positionId,
        amount: args.amount,
        lockEnd: args.lockEnd,
      },
      validFrom: args.timestamp,
      createdAt: Date.now(),
    });

    // 3. Log event
    await ctx.db.insert("events", {
      type: "staked",
      actorId: args.staker,
      targetId: poolThingId,
      timestamp: args.timestamp,
      metadata: {
        protocol: "sui",
        positionId: args.positionId,
        amount: args.amount,
      },
    });
  },
});
```

## Security Considerations

1. **Lock Period Enforcement**: Cannot unstake before `lock_end` timestamp
2. **Overflow Protection**: Uses u128 for intermediate calculations
3. **Capability-Based Access**: Only pool owner can update reward rate
4. **Balance Checks**: Ensures sufficient rewards before claiming
5. **Event Logging**: All operations emit events for transparency

## Gas Optimization

- Shared objects for pools (accessible by all users)
- Owned objects for positions (efficient per-user access)
- Minimal storage in position objects
- Efficient reward calculation (no iteration)

## Future Enhancements

- [ ] Multiple reward tokens per pool
- [ ] Slashing for early unstaking
- [ ] Governance voting power based on stake
- [ ] NFT boost multipliers
- [ ] Auto-compounding rewards
- [ ] Emergency pause functionality

## License

MIT License - See LICENSE.md

---

**Built for the ONE Platform's 6-dimension ontology**
**Sui Move • Convex • Effect.ts**
