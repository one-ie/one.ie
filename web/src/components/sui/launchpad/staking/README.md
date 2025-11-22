# Sui Launchpad Staking Components

Complete staking component suite for Sui blockchain token staking functionality.

## Components

### 1. StakingPoolCard

Display individual staking pool information with interactive stake/unstake actions.

**Features:**
- Pool details (token, APY, lock duration)
- Total staked and rewards metrics
- User's stake and pending rewards
- Stake/Unstake/Claim action buttons
- Real-time updates

**Usage:**
```tsx
import { StakingPoolCard } from '@/components/sui/launchpad/staking';

<StakingPoolCard
  pool={{
    id: "pool-123",
    tokenSymbol: "SUI",
    tokenAddress: "0x...",
    apy: 15.5,
    lockDuration: 30,
    totalStaked: "1000000",
    totalRewards: "50000",
    userStake: "1000",
    userPendingRewards: "15.5",
    isActive: true
  }}
  onStakeSuccess={() => refetchPoolData()}
  onUnstakeSuccess={() => refetchPoolData()}
  onClaimSuccess={() => refetchRewards()}
/>
```

### 2. StakeTokensModal

Modal dialog for staking tokens with configurable lock periods.

**Features:**
- Amount input with balance validation
- Lock duration selector (1 week to 1 year)
- APY multipliers based on lock duration
- Estimated rewards calculator
- Approve + Stake two-step flow
- Early withdrawal warnings

**Lock Duration Options:**
- 1 Week (7 days) - 1.0x APY
- 1 Month (30 days) - 1.2x APY
- 3 Months (90 days) - 1.5x APY
- 6 Months (180 days) - 2.0x APY
- 1 Year (365 days) - 2.5x APY

**Usage:**
```tsx
import { StakeTokensModal } from '@/components/sui/launchpad/staking';

const [isOpen, setIsOpen] = useState(false);

<StakeTokensModal
  open={isOpen}
  onOpenChange={setIsOpen}
  pool={poolData}
  onSuccess={() => {
    setIsOpen(false);
    refetchPoolData();
  }}
/>
```

### 3. UnstakeTokensModal

Modal dialog for unstaking tokens with automatic rewards claiming.

**Features:**
- Staked amount display
- Amount to unstake input
- Lock period check with countdown
- Early withdrawal penalty warnings (5%)
- Rewards summary
- Combined unstake + claim flow

**Usage:**
```tsx
import { UnstakeTokensModal } from '@/components/sui/launchpad/staking';

const [isOpen, setIsOpen] = useState(false);

<UnstakeTokensModal
  open={isOpen}
  onOpenChange={setIsOpen}
  pool={poolData}
  onSuccess={() => {
    setIsOpen(false);
    refetchPoolData();
  }}
/>
```

### 4. StakingDashboard

Comprehensive dashboard showing all user stakes across multiple pools.

**Features:**
- Summary cards (total staked, total rewards, active tokens)
- Aggregated view by token
- Detailed stakes table
- Pool performance comparison
- Claim all rewards button
- Quick navigation to pools

**Usage:**
```tsx
import { StakingDashboard } from '@/components/sui/launchpad/staking';

<StakingDashboard
  userStakes={[
    {
      id: "stake-1",
      poolId: "pool-123",
      poolName: "SUI Staking Pool",
      tokenSymbol: "SUI",
      stakedAmount: "1000",
      pendingRewards: "15.5",
      apy: 15.5,
      lockEndDate: new Date('2025-12-31'),
      isLocked: true
    },
    // ... more stakes
  ]}
  onClaimAll={() => refetchAllRewards()}
  onViewPool={(poolId) => router.push(`/staking/pools/${poolId}`)}
/>
```

## Integration with Convex

### Backend Queries

Create these Convex queries in `/backend/convex/queries/sui/staking.ts`:

```typescript
// api.queries.sui.staking.getPool
export const getPool = query({
  args: { poolId: v.string() },
  handler: async (ctx, { poolId }) => {
    const pool = await ctx.db
      .query("stakingPools")
      .filter((q) => q.eq(q.field("id"), poolId))
      .first();

    return pool;
  }
});

// api.queries.sui.staking.getUserStakes
export const getUserStakes = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const stakes = await ctx.db
      .query("stakes")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    return stakes;
  }
});

// api.queries.sui.staking.calculateRewards
export const calculateRewards = query({
  args: {
    poolId: v.string(),
    userId: v.string()
  },
  handler: async (ctx, { poolId, userId }) => {
    const stake = await ctx.db
      .query("stakes")
      .filter((q) =>
        q.and(
          q.eq(q.field("poolId"), poolId),
          q.eq(q.field("userId"), userId)
        )
      )
      .first();

    if (!stake) return "0";

    const pool = await ctx.db.get(stake.poolId);
    const timeStaked = Date.now() - stake.stakedAt;
    const daysStaked = timeStaked / (1000 * 60 * 60 * 24);

    const rewards =
      (parseFloat(stake.amount) * pool.apy / 100) *
      (daysStaked / 365);

    return rewards.toString();
  }
});
```

### Backend Mutations

Create these Convex mutations in `/backend/convex/mutations/sui/staking.ts`:

```typescript
// api.mutations.sui.staking.stake
export const stake = mutation({
  args: {
    poolId: v.string(),
    amount: v.string(),
    lockDuration: v.number()
  },
  handler: async (ctx, { poolId, amount, lockDuration }) => {
    const userId = await getUserId(ctx);

    const stakeId = await ctx.db.insert("stakes", {
      poolId,
      userId,
      amount,
      lockDuration,
      stakedAt: Date.now(),
      lockEndDate: Date.now() + (lockDuration * 24 * 60 * 60 * 1000)
    });

    return stakeId;
  }
});

// api.mutations.sui.staking.unstake
export const unstake = mutation({
  args: {
    poolId: v.string(),
    amount: v.string()
  },
  handler: async (ctx, { poolId, amount }) => {
    const userId = await getUserId(ctx);

    const stake = await ctx.db
      .query("stakes")
      .filter((q) =>
        q.and(
          q.eq(q.field("poolId"), poolId),
          q.eq(q.field("userId"), userId)
        )
      )
      .first();

    if (!stake) throw new Error("Stake not found");

    // Check if locked and calculate penalty
    const isLocked = Date.now() < stake.lockEndDate;
    const penalty = isLocked ? 0.05 : 0; // 5% early withdrawal penalty

    // Update stake amount or delete if fully unstaking
    const remaining = parseFloat(stake.amount) - parseFloat(amount);

    if (remaining <= 0) {
      await ctx.db.delete(stake._id);
    } else {
      await ctx.db.patch(stake._id, {
        amount: remaining.toString()
      });
    }

    return { amount, penalty };
  }
});

// api.mutations.sui.staking.claimRewards
export const claimRewards = mutation({
  args: { poolId: v.string() },
  handler: async (ctx, { poolId }) => {
    const userId = await getUserId(ctx);

    const stake = await ctx.db
      .query("stakes")
      .filter((q) =>
        q.and(
          q.eq(q.field("poolId"), poolId),
          q.eq(q.field("userId"), userId)
        )
      )
      .first();

    if (!stake) throw new Error("Stake not found");

    // Calculate rewards
    const pool = await ctx.db.get(stake.poolId);
    const timeStaked = Date.now() - stake.stakedAt;
    const daysStaked = timeStaked / (1000 * 60 * 60 * 24);

    const rewards =
      (parseFloat(stake.amount) * pool.apy / 100) *
      (daysStaked / 365);

    // Reset rewards tracking
    await ctx.db.patch(stake._id, {
      lastClaimedAt: Date.now()
    });

    return rewards.toString();
  }
});
```

### Using with Convex Hooks

```tsx
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { StakingPoolCard } from "@/components/sui/launchpad/staking";

export function StakingPoolPage({ poolId }: { poolId: string }) {
  // Fetch pool data
  const pool = useQuery(api.queries.sui.staking.getPool, { poolId });

  // Mutations
  const stake = useMutation(api.mutations.sui.staking.stake);
  const unstake = useMutation(api.mutations.sui.staking.unstake);
  const claimRewards = useMutation(api.mutations.sui.staking.claimRewards);

  if (!pool) return <div>Loading...</div>;

  return (
    <StakingPoolCard
      pool={pool}
      onStakeSuccess={() => {
        // Pool data auto-updates via useQuery
        console.log("Staked successfully");
      }}
      onUnstakeSuccess={() => {
        console.log("Unstaked successfully");
      }}
      onClaimSuccess={async () => {
        await claimRewards({ poolId });
      }}
    />
  );
}
```

## APY Calculation Helper

Add this helper function to calculate effective APY with lock duration multipliers:

```typescript
// /web/src/lib/helpers/stakingHelpers.ts

export const LOCK_DURATION_MULTIPLIERS = {
  7: 1.0,    // 1 week
  30: 1.2,   // 1 month
  90: 1.5,   // 3 months
  180: 2.0,  // 6 months
  365: 2.5,  // 1 year
};

export function calculateEffectiveAPY(
  baseAPY: number,
  lockDurationDays: number
): number {
  const multiplier = LOCK_DURATION_MULTIPLIERS[lockDurationDays] || 1.0;
  return baseAPY * multiplier;
}

export function calculateEstimatedRewards(
  amount: number,
  apy: number,
  durationDays: number
): number {
  const yearlyReturn = amount * (apy / 100);
  return (yearlyReturn * durationDays) / 365;
}

export function calculatePenalty(
  amount: number,
  isLocked: boolean,
  penaltyRate: number = 0.05
): number {
  return isLocked ? amount * penaltyRate : 0;
}
```

## Example Page Implementation

```tsx
// /web/src/pages/staking/index.astro
---
import Layout from '@/layouts/Layout.astro';
import { StakingDashboard } from '@/components/sui/launchpad/staking';
---

<Layout title="Staking Dashboard">
  <div class="container mx-auto py-8">
    <h1 class="text-3xl font-bold mb-6">Staking Dashboard</h1>
    <StakingDashboard client:load />
  </div>
</Layout>
```

## TypeScript Interfaces

```typescript
// Shared types for staking components
export interface StakingPool {
  id: string;
  tokenSymbol: string;
  tokenAddress: string;
  apy: number;
  lockDuration: number;
  totalStaked: string;
  totalRewards: string;
  userStake?: string;
  userPendingRewards?: string;
  isActive: boolean;
}

export interface UserStake {
  id: string;
  poolId: string;
  poolName: string;
  tokenSymbol: string;
  stakedAmount: string;
  pendingRewards: string;
  apy: number;
  lockEndDate: Date;
  isLocked: boolean;
}
```

## Design Features

- **Responsive Design**: All components are mobile-optimized
- **Dark Mode**: Full dark mode support via Tailwind
- **Accessibility**: ARIA labels and keyboard navigation
- **Loading States**: Skeleton loaders and disabled states
- **Error Handling**: Validation messages and error feedback
- **Animations**: Smooth transitions and hover effects

## Next Steps

1. **Backend Integration**: Implement Convex queries/mutations
2. **Wallet Connection**: Add Sui wallet integration for approvals
3. **Transaction Signing**: Implement on-chain staking transactions
4. **Real-time Updates**: Add Convex subscriptions for live data
5. **Analytics**: Track staking metrics and user behavior
6. **Testing**: Add unit tests for all components

## Related Components

- Token Components: `/components/sui/launchpad/tokens/`
- Pool Management: `/components/sui/launchpad/pools/`
- Analytics: `/components/sui/launchpad/analytics/`
