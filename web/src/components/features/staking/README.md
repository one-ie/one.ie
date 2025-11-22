# Staking Interface Components

Complete staking interface for token staking with rewards, built with React and shadcn/ui.

## Features

### 1. Pool Stats
- **Total Value Locked (TVL)** - Total value staked in pool
- **APY Range** - Base APY to maximum APY with bonuses
- **Participants** - Number of active stakers
- **Your Stake** - User's current stake in pool

### 2. Stake Form
- **Amount Input** - Enter amount to stake with balance display
- **Lock Duration Selector** - Choose lock period for APY bonuses
- **APY Preview** - Real-time calculation of APY and rewards
- **Validation** - Min/max stake amounts, balance checks

### 3. Your Position
- **Staked Amount** - Total tokens staked
- **Rewards Earned** - Accumulated rewards
- **Time Remaining** - Days until unlock
- **Lock Duration** - Original lock period

### 4. Claim Rewards
- **Pending Rewards Display** - View rewards by pool
- **Claim Button** - Claim rewards from individual or all pools
- **Total Pending** - Aggregated rewards across pools

### 5. Unstake
- **Unstake Button** - Withdraw staked tokens
- **Penalty Warning** - Shows early withdrawal penalty if applicable
- **Confirmation Dialog** - Detailed breakdown before unstaking

### 6. Pool List
- **Browse All Pools** - View all available staking pools
- **Search & Filter** - Find pools by name, token, or status
- **Sort Options** - By APY, TVL, or participants

## Components

### StakingInterface (Main Component)

Complete staking interface with all features.

```tsx
import { StakingInterface } from '@/components/features/staking';

<StakingInterface
  userId="user_123"
  initialPools={pools}
  initialStakes={stakes}
  initialRewards={rewards}
  initialBalance={1000}
  onStake={handleStake}
  onUnstake={handleUnstake}
  onClaimRewards={handleClaimRewards}
  loading={false}
  client:load
/>
```

**Props:**
- `userId` (required) - Current user ID
- `initialPools` - Array of staking pools
- `initialStakes` - User's active stakes
- `initialRewards` - Pending rewards
- `initialBalance` - Available token balance
- `onStake` - Callback for staking tokens
- `onUnstake` - Callback for unstaking
- `onClaimRewards` - Callback for claiming rewards
- `loading` - Loading state

### StakingPoolCard

Display pool statistics and user's stake.

```tsx
import { StakingPoolCard } from '@/components/features/staking';

<StakingPoolCard
  pool={pool}
  userStake={userStake}
  onSelect={(poolId) => console.log(poolId)}
  selected={false}
/>
```

### StakeForm

Form for staking tokens with APY preview.

```tsx
import { StakeForm } from '@/components/features/staking';

<StakeForm
  pool={pool}
  balance={1000}
  onStake={async (data) => {
    console.log('Staking:', data.amount, 'for', data.lockDuration, 'days');
  }}
  loading={false}
/>
```

### UnstakeButton

Button with penalty warning dialog.

```tsx
import { UnstakeButton } from '@/components/features/staking';

<UnstakeButton
  stake={userStake}
  pool={pool}
  onUnstake={async (stakeId) => {
    console.log('Unstaking:', stakeId);
  }}
  loading={false}
/>
```

### RewardsDisplay

Display and claim pending rewards.

```tsx
import { RewardsDisplay } from '@/components/features/staking';

<RewardsDisplay
  rewards={pendingRewards}
  pools={pools}
  onClaim={async (poolId) => {
    console.log('Claiming rewards from:', poolId);
  }}
  loading={false}
/>
```

### PoolSelector

Browse and filter staking pools.

```tsx
import { PoolSelector } from '@/components/features/staking';

<PoolSelector
  pools={pools}
  userStakes={userStakes}
  onSelectPool={(poolId) => console.log('Selected:', poolId)}
  selectedPoolId={selectedId}
/>
```

## Convex Integration

### Queries

Create these queries in your Convex backend:

```typescript
// convex/staking/queries.ts
import { query } from './_generated/server';
import { v } from 'convex/values';

export const getPool = query({
  args: { poolId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('staking_pools')
      .filter(q => q.eq(q.field('_id'), args.poolId))
      .first();
  },
});

export const getUserStakes = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('user_stakes')
      .filter(q => q.eq(q.field('userId'), args.userId))
      .collect();
  },
});

export const getPendingRewards = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const stakes = await ctx.db
      .query('user_stakes')
      .filter(q => q.eq(q.field('userId'), args.userId))
      .filter(q => q.eq(q.field('status'), 'active'))
      .collect();

    // Calculate pending rewards for each stake
    return stakes.map(stake => ({
      poolId: stake.poolId,
      amount: stake.rewards, // Pre-calculated in backend
      lastUpdated: Date.now(),
    }));
  },
});

export const listPools = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('staking_pools').collect();
  },
});
```

### Mutations

Create these mutations in your Convex backend:

```typescript
// convex/staking/mutations.ts
import { mutation } from './_generated/server';
import { v } from 'convex/values';

export const stake = mutation({
  args: {
    poolId: v.string(),
    userId: v.string(),
    amount: v.number(),
    lockDuration: v.number(),
  },
  handler: async (ctx, args) => {
    const pool = await ctx.db.get(args.poolId);
    if (!pool || pool.status !== 'active') {
      throw new Error('Pool not available');
    }

    const lockPeriod = pool.lockPeriods.find(p => p.duration === args.lockDuration);
    if (!lockPeriod) {
      throw new Error('Invalid lock duration');
    }

    const startTime = Date.now();
    const endTime = startTime + (args.lockDuration * 24 * 60 * 60 * 1000);

    return await ctx.db.insert('user_stakes', {
      poolId: args.poolId,
      userId: args.userId,
      amount: args.amount,
      lockDuration: args.lockDuration,
      startTime,
      endTime,
      rewards: 0,
      status: 'active',
    });
  },
});

export const unstake = mutation({
  args: {
    stakeId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const stake = await ctx.db.get(args.stakeId);
    if (!stake || stake.userId !== args.userId) {
      throw new Error('Stake not found');
    }

    // Calculate penalty if early withdrawal
    const now = Date.now();
    const isEarly = now < stake.endTime;
    let penalty = 0;

    if (isEarly) {
      const pool = await ctx.db.get(stake.poolId);
      const lockPeriod = pool.lockPeriods.find(p => p.duration === stake.lockDuration);
      penalty = (stake.amount * (lockPeriod?.penaltyRate || 0)) / 100;
    }

    await ctx.db.patch(args.stakeId, {
      status: 'unstaked',
    });

    return {
      amount: stake.amount - penalty,
      rewards: stake.rewards,
      penalty,
    };
  },
});

export const claimRewards = mutation({
  args: {
    poolId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const stakes = await ctx.db
      .query('user_stakes')
      .filter(q => q.eq(q.field('userId'), args.userId))
      .filter(q => q.eq(q.field('poolId'), args.poolId))
      .filter(q => q.eq(q.field('status'), 'active'))
      .collect();

    let totalRewards = 0;

    for (const stake of stakes) {
      totalRewards += stake.rewards;
      await ctx.db.patch(stake._id, { rewards: 0 });
    }

    return { amount: totalRewards };
  },
});
```

### Usage in Astro Page

```astro
---
// src/pages/staking.astro
import { StakingInterface } from '@/components/features/staking';
import Layout from '@/layouts/Layout.astro';
---

<Layout title="Staking">
  <StakingInterface
    userId="user_123"
    client:load
  />
</Layout>
```

### Usage with Convex Hooks

```tsx
// src/components/features/staking/ConvexStakingInterface.tsx
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { StakingInterface } from './StakingInterface';

export function ConvexStakingInterface({ userId }: { userId: string }) {
  // Queries
  const pools = useQuery(api.staking.queries.listPools) || [];
  const userStakes = useQuery(api.staking.queries.getUserStakes, { userId }) || [];
  const pendingRewards = useQuery(api.staking.queries.getPendingRewards, { userId }) || [];

  // Mutations
  const stakeMutation = useMutation(api.staking.mutations.stake);
  const unstakeMutation = useMutation(api.staking.mutations.unstake);
  const claimRewardsMutation = useMutation(api.staking.mutations.claimRewards);

  const handleStake = async (poolId: string, data: StakeFormData) => {
    await stakeMutation({
      poolId,
      userId,
      amount: data.amount,
      lockDuration: data.lockDuration,
    });
  };

  const handleUnstake = async (stakeId: string) => {
    await unstakeMutation({ stakeId, userId });
  };

  const handleClaimRewards = async (poolId: string) => {
    await claimRewardsMutation({ poolId, userId });
  };

  return (
    <StakingInterface
      userId={userId}
      initialPools={pools}
      initialStakes={userStakes}
      initialRewards={pendingRewards}
      onStake={handleStake}
      onUnstake={handleUnstake}
      onClaimRewards={handleClaimRewards}
    />
  );
}
```

## Real-Time APY Calculations

APY is calculated based on:
1. **Base APY** - Pool's base annual percentage yield
2. **Lock Period Bonus** - Additional APY for longer lock periods
3. **Time-weighted rewards** - Proportional to lock duration

```typescript
const lockPeriod = pool.lockPeriods.find(p => p.duration === selectedDuration);
const calculatedApy = pool.baseApy + (lockPeriod?.apyBonus || 0);
const estimatedRewards = (amount * calculatedApy / 100 * lockDuration / 365);
```

## Types

All TypeScript types are exported from `types.ts`:

```typescript
import type {
  StakingPool,
  LockPeriod,
  UserStake,
  PendingRewards,
  StakeFormData,
} from '@/components/features/staking';
```

## Styling

All components use shadcn/ui components and Tailwind CSS. They automatically support:
- Dark mode
- Responsive design
- Consistent spacing and typography
- Accessible focus states

## Example Data

```typescript
const examplePool: StakingPool = {
  _id: 'pool_1',
  name: 'ETH Staking',
  tokenSymbol: 'ETH',
  tokenAddress: '0x...',
  totalValueLocked: 10_000_000,
  baseApy: 5,
  maxApy: 15,
  participants: 1234,
  minStake: 0.1,
  maxStake: 100,
  lockPeriods: [
    { duration: 30, apyBonus: 2, penaltyRate: 5 },
    { duration: 90, apyBonus: 5, penaltyRate: 3 },
    { duration: 180, apyBonus: 10, penaltyRate: 2 },
  ],
  status: 'active',
  startDate: Date.now(),
};

const exampleStake: UserStake = {
  _id: 'stake_1',
  poolId: 'pool_1',
  userId: 'user_123',
  amount: 10,
  lockDuration: 90,
  startTime: Date.now(),
  endTime: Date.now() + (90 * 24 * 60 * 60 * 1000),
  rewards: 1.23,
  status: 'active',
};
```

## Best Practices

1. **Always use client:load** - Components require React hydration
2. **Validate stakes** - Check min/max amounts and balance before submission
3. **Show penalties clearly** - Warn users about early withdrawal penalties
4. **Real-time updates** - Use Convex subscriptions for live data
5. **Error handling** - Handle network errors and show user-friendly messages
6. **Loading states** - Show loading indicators during mutations

## Future Enhancements

- Multi-token staking
- Compound staking (auto-reinvest rewards)
- Staking history and analytics
- Pool creation interface
- Governance voting with staked tokens
- NFT staking support
