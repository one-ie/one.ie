# Vesting Dashboard Components

Complete React component suite for managing token vesting schedules with real-time updates, claim functionality, and comprehensive visualization.

## Components

### VestingDashboard (Main Component)

The main dashboard component that orchestrates all vesting functionality.

**Features:**
- Schedule list with progress bars
- Claimable amount highlighting
- Schedule details (cliff, duration, amounts)
- Timeline milestone visualization
- Claim history with transaction links
- Real-time updates via Convex
- Three tabs: Schedules, Timeline, Claim History

**Usage:**

```tsx
import { VestingDashboard } from '@/components/features/vesting';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

export function VestingPage() {
  const userId = "user_123";

  // Fetch data from Convex
  const schedules = useQuery(api.vesting.listSchedules, { userId });
  const claims = useQuery(api.vesting.getClaimHistory, { userId });
  const claim = useMutation(api.vesting.claim);

  const handleClaim = async (scheduleId: string) => {
    await claim({ scheduleId });
  };

  const handleRefresh = () => {
    // Convex auto-refreshes, but you can trigger manual refresh if needed
    window.location.reload();
  };

  return (
    <VestingDashboard
      userId={userId}
      schedules={schedules}
      claims={claims}
      loading={schedules === undefined}
      onClaim={handleClaim}
      onRefresh={handleRefresh}
    />
  );
}
```

### VestingScheduleCard

Individual vesting schedule card with progress bar and claim button.

**Props:**
- `schedule` - VestingSchedule object
- `vestedAmount` - Currently vested amount (calculated)
- `claimableAmount` - Amount available to claim (calculated)
- `onClaim` - Optional claim handler

**Usage:**

```tsx
import { VestingScheduleCard } from '@/components/features/vesting';

<VestingScheduleCard
  schedule={scheduleData}
  vestedAmount={calculateVestedAmount(scheduleData)}
  claimableAmount={calculateClaimableAmount(scheduleData)}
  onClaim={handleClaim}
/>
```

### VestingProgressBar

Visual progress bar showing vesting progress and claimed amount.

**Props:**
- `totalAmount` - Total vesting amount
- `vestedAmount` - Currently vested amount
- `claimedAmount` - Amount already claimed
- `showLabels` - Show/hide percentage labels (default: true)

**Usage:**

```tsx
import { VestingProgressBar } from '@/components/features/vesting';

<VestingProgressBar
  totalAmount={1000000}
  vestedAmount={500000}
  claimedAmount={250000}
  showLabels={true}
/>
```

### VestingTimeline

Timeline visualization showing past, current, and future vesting milestones.

**Props:**
- `milestones` - Array of VestingMilestone objects
- `tokenSymbol` - Token symbol (e.g., "USDC", "ETH")

**Usage:**

```tsx
import { VestingTimeline } from '@/components/features/vesting';

const milestones = [
  {
    date: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
    amount: 100000,
    percentage: 25,
    claimed: true,
  },
  {
    date: Date.now(),
    amount: 200000,
    percentage: 50,
    claimed: false,
    isCliff: true,
  },
  // ...more milestones
];

<VestingTimeline
  milestones={milestones}
  tokenSymbol="USDC"
/>
```

### ClaimButton

Button to claim vested tokens with loading states and validation.

**Props:**
- `scheduleId` - ID of vesting schedule
- `claimableAmount` - Amount available to claim
- `tokenSymbol` - Token symbol
- `disabled` - Disable button (default: false)
- `onClaim` - Claim handler (async function)

**Usage:**

```tsx
import { ClaimButton } from '@/components/features/vesting';

<ClaimButton
  scheduleId="schedule_123"
  claimableAmount={50000}
  tokenSymbol="USDC"
  disabled={false}
  onClaim={async (scheduleId) => {
    await claim({ scheduleId });
  }}
/>
```

### ClaimHistoryTable

Table displaying past claim transactions with blockchain explorer links.

**Props:**
- `claims` - Array of ClaimRecord objects
- `tokenSymbol` - Token symbol
- `blockExplorerUrl` - Base URL for block explorer (default: "https://etherscan.io/tx")

**Usage:**

```tsx
import { ClaimHistoryTable } from '@/components/features/vesting';

<ClaimHistoryTable
  claims={claimHistory}
  tokenSymbol="USDC"
  blockExplorerUrl="https://basescan.org/tx"
/>
```

## Types

### VestingSchedule

```typescript
interface VestingSchedule {
  _id: string;
  beneficiary: string;
  tokenId: string;
  tokenSymbol: string;
  totalAmount: number;
  claimedAmount: number;
  startTime: number;
  cliffDuration: number;        // in seconds
  vestingDuration: number;      // in seconds
  status: 'active' | 'completed' | 'revoked';
  createdAt: number;
}
```

### ClaimRecord

```typescript
interface ClaimRecord {
  _id: string;
  scheduleId: string;
  amount: number;
  timestamp: number;
  txHash?: string;
  status: 'pending' | 'completed' | 'failed';
}
```

### VestingMilestone

```typescript
interface VestingMilestone {
  date: number;
  amount: number;
  percentage: number;
  claimed: boolean;
  isCliff?: boolean;
}
```

## Convex Integration

### Required Convex Queries

Create these queries in your Convex backend:

```typescript
// convex/queries/vesting.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const listSchedules = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // Return all vesting schedules for user
    return await ctx.db
      .query("vesting_schedules")
      .filter((q) => q.eq(q.field("beneficiary"), args.userId))
      .collect();
  },
});

export const getClaimableAmount = query({
  args: { scheduleId: v.id("vesting_schedules") },
  handler: async (ctx, args) => {
    const schedule = await ctx.db.get(args.scheduleId);
    if (!schedule) return 0;

    // Calculate vested amount based on time elapsed
    const now = Date.now();
    const cliffTime = schedule.startTime + schedule.cliffDuration * 1000;

    if (now < cliffTime) return 0;

    const vestingElapsed = now - schedule.startTime;
    const vestingTotal = schedule.vestingDuration * 1000;
    const vestedPercentage = Math.min(1, vestingElapsed / vestingTotal);
    const vested = Math.floor(schedule.totalAmount * vestedPercentage);

    return Math.max(0, vested - schedule.claimedAmount);
  },
});

export const getClaimHistory = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // Return all claims for user's schedules
    const schedules = await ctx.db
      .query("vesting_schedules")
      .filter((q) => q.eq(q.field("beneficiary"), args.userId))
      .collect();

    const scheduleIds = schedules.map(s => s._id);

    return await ctx.db
      .query("claims")
      .filter((q) => scheduleIds.some(id => q.eq(q.field("scheduleId"), id)))
      .collect();
  },
});
```

### Required Convex Mutations

```typescript
// convex/mutations/vesting.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const claim = mutation({
  args: { scheduleId: v.id("vesting_schedules") },
  handler: async (ctx, args) => {
    const schedule = await ctx.db.get(args.scheduleId);
    if (!schedule) throw new Error("Schedule not found");

    // Calculate claimable amount
    const now = Date.now();
    const cliffTime = schedule.startTime + schedule.cliffDuration * 1000;

    if (now < cliffTime) {
      throw new Error("Cliff period not reached");
    }

    const vestingElapsed = now - schedule.startTime;
    const vestingTotal = schedule.vestingDuration * 1000;
    const vestedPercentage = Math.min(1, vestingElapsed / vestingTotal);
    const vested = Math.floor(schedule.totalAmount * vestedPercentage);
    const claimable = vested - schedule.claimedAmount;

    if (claimable <= 0) {
      throw new Error("Nothing to claim");
    }

    // Create claim record
    const claimId = await ctx.db.insert("claims", {
      scheduleId: args.scheduleId,
      amount: claimable,
      timestamp: now,
      status: "pending",
    });

    // Update schedule
    await ctx.db.patch(args.scheduleId, {
      claimedAmount: schedule.claimedAmount + claimable,
    });

    // TODO: Trigger blockchain transaction
    // When tx completes, update claim with txHash and status: "completed"

    return claimId;
  },
});
```

## Example Page Integration

### Astro Page

```astro
---
// src/pages/vesting/index.astro
import Layout from '@/layouts/Layout.astro';
import { VestingPage } from '@/components/features/vesting/VestingPage';

const title = 'Vesting Dashboard';
---

<Layout title={title}>
  <VestingPage client:load />
</Layout>
```

### React Page Component

```tsx
// src/components/features/vesting/VestingPage.tsx
import { VestingDashboard } from './VestingDashboard';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

export function VestingPage() {
  // Get current user
  const user = useQuery(api.queries.users.getCurrentUser);

  // Fetch vesting data
  const schedules = useQuery(
    api.queries.vesting.listSchedules,
    user ? { userId: user._id } : "skip"
  );

  const claims = useQuery(
    api.queries.vesting.getClaimHistory,
    user ? { userId: user._id } : "skip"
  );

  // Claim mutation
  const claim = useMutation(api.mutations.vesting.claim);

  const handleClaim = async (scheduleId: string) => {
    try {
      await claim({ scheduleId });
    } catch (error) {
      console.error('Claim failed:', error);
      throw error;
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Please sign in to view your vesting schedules.</p>
      </div>
    );
  }

  return (
    <VestingDashboard
      userId={user._id}
      schedules={schedules}
      claims={claims}
      loading={schedules === undefined || claims === undefined}
      onClaim={handleClaim}
    />
  );
}
```

## Features

### Real-Time Updates

All components automatically update when data changes thanks to Convex's real-time subscriptions.

### Responsive Design

All components are fully responsive and work on mobile, tablet, and desktop.

### Dark Mode

Full dark mode support using Tailwind's dark mode utilities.

### Accessibility

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Screen reader support

### Performance

- Optimized rendering
- Memoized calculations
- Lazy loading for heavy components
- Skeleton loading states

## Styling

Components use Tailwind CSS v4 and shadcn/ui for consistent styling that matches the ONE platform design system.

### Customization

Override styles using Tailwind classes:

```tsx
<VestingDashboard
  className="max-w-7xl mx-auto"
  schedules={schedules}
  // ...
/>
```

## Testing

Example test for ClaimButton:

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ClaimButton } from './ClaimButton';

describe('ClaimButton', () => {
  it('disables when claimable amount is 0', () => {
    render(
      <ClaimButton
        scheduleId="test"
        claimableAmount={0}
        tokenSymbol="USDC"
      />
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Nothing to Claim');
  });

  it('calls onClaim when clicked', async () => {
    const mockClaim = jest.fn().mockResolvedValue(undefined);

    render(
      <ClaimButton
        scheduleId="test"
        claimableAmount={1000}
        tokenSymbol="USDC"
        onClaim={mockClaim}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockClaim).toHaveBeenCalledWith('test');
    });
  });
});
```

## License

Part of the ONE platform. See LICENSE.md in repository root.
