# Vesting Components

Three production-ready components for managing token vesting schedules on Sui blockchain.

## Components

### 1. VestingScheduleCard

Displays a single vesting schedule with full details and claim functionality.

**Features:**
- Schedule info (beneficiary, amount, cliff, duration)
- Progress bar showing claimed vs total
- Highlighted claimable amount
- Claim button with loading states
- Timeline visualization
- Status badges (active/completed/revoked)
- Cliff warnings and notices
- Link to explorer

**Usage:**

```tsx
import { VestingScheduleCard } from '@/components/sui/launchpad/vesting';

function MyPage() {
  const handleClaim = async (scheduleId: string) => {
    // Call Convex mutation
    await claim({ scheduleId });
  };

  return (
    <VestingScheduleCard
      schedule={schedule}
      onClaim={handleClaim}
      compact={false}
      showTimeline={true}
    />
  );
}
```

**Props:**
- `schedule: VestingSchedule` - The vesting schedule data
- `onClaim?: (scheduleId: string) => Promise<void>` - Claim handler
- `compact?: boolean` - Compact mode (default: false)
- `showTimeline?: boolean` - Show timeline (default: true)

### 2. VestingDashboard

Complete dashboard showing all vesting schedules for a user.

**Features:**
- Filter by active/completed/revoked
- Total vested and claimed amounts
- Upcoming claims calendar (next 30 days)
- Batch claim functionality
- Summary cards with stats
- Responsive grid layout

**Usage:**

```tsx
import { VestingDashboard } from '@/components/sui/launchpad/vesting';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

function VestingPage({ userAddress }: { userAddress: string }) {
  const schedules = useQuery(api.queries.sui.vesting.getByBeneficiary, {
    beneficiary: userAddress,
  });

  const claimMutation = useMutation(api.mutations.sui.vesting.claim);
  const batchClaimMutation = useMutation(api.mutations.sui.vesting.batchClaim);

  const handleClaim = async (scheduleId: string) => {
    await claimMutation({ scheduleId });
  };

  const handleBatchClaim = async (scheduleIds: string[]) => {
    await batchClaimMutation({ scheduleIds });
  };

  return (
    <VestingDashboard
      schedules={schedules || []}
      onClaim={handleClaim}
      onBatchClaim={handleBatchClaim}
      isLoading={schedules === undefined}
    />
  );
}
```

**Props:**
- `schedules: VestingSchedule[]` - Array of vesting schedules
- `onClaim?: (scheduleId: string) => Promise<void>` - Single claim handler
- `onBatchClaim?: (scheduleIds: string[]) => Promise<void>` - Batch claim handler
- `isLoading?: boolean` - Loading state

### 3. VestingTimeline

Visual timeline component showing vesting progress over time.

**Features:**
- Horizontal timeline with month markers
- Cliff period indicator
- Monthly unlock visualization
- Claimed vs unclaimed sections
- Current time indicator
- Zoom controls (full/months/weeks)
- Legend with color coding

**Usage:**

```tsx
import { VestingTimeline } from '@/components/sui/launchpad/vesting';

function ScheduleDetails({ schedule }: { schedule: VestingSchedule }) {
  return (
    <div>
      <h2>Vesting Timeline</h2>
      <VestingTimeline
        schedule={schedule}
        showLegend={true}
        compact={false}
      />
    </div>
  );
}
```

**Props:**
- `schedule: VestingSchedule` - The vesting schedule data
- `showLegend?: boolean` - Show color legend (default: true)
- `compact?: boolean` - Compact mode (default: false)

## Data Types

### VestingSchedule Interface

```typescript
interface VestingSchedule {
  id: string;                    // Unique schedule ID
  beneficiary: string;           // Beneficiary address (Sui address)
  tokenSymbol: string;           // Token symbol (e.g., "SUI", "USDC")
  totalAmount: number;           // Total tokens to be vested
  claimedAmount: number;         // Tokens already claimed
  claimableAmount: number;       // Tokens available to claim now
  startTime: number;             // Start timestamp (ms)
  cliffDuration: number;         // Cliff duration (ms)
  vestingDuration: number;       // Total vesting duration (ms)
  status: 'active' | 'completed' | 'revoked';
  lastClaimTime?: number;        // Last claim timestamp (ms)
  cliffEndTime: number;          // Cliff end timestamp (ms)
  endTime: number;               // Vesting end timestamp (ms)
}
```

## Integration with Convex

### Queries

```typescript
// Get all schedules for a beneficiary
const schedules = useQuery(api.queries.sui.vesting.getByBeneficiary, {
  beneficiary: userAddress,
});

// Calculate vested amount
const vested = useQuery(api.queries.sui.vesting.calculateVested, {
  scheduleId: "schedule123",
});
```

### Mutations

```typescript
// Claim from single schedule
const claim = useMutation(api.mutations.sui.vesting.claim);
await claim({ scheduleId: "schedule123" });

// Batch claim from multiple schedules
const batchClaim = useMutation(api.mutations.sui.vesting.batchClaim);
await batchClaim({ scheduleIds: ["schedule1", "schedule2"] });
```

## Page Integration Example

```astro
---
// src/pages/vesting.astro
import Layout from '@/layouts/Layout.astro';
import { VestingDashboardClient } from '@/components/sui/launchpad/vesting/VestingDashboardClient';
---

<Layout title="My Vesting" sidebarInitialCollapsed={false}>
  <div class="container mx-auto py-8">
    <h1 class="text-3xl font-bold mb-6">Token Vesting</h1>
    <VestingDashboardClient client:load />
  </div>
</Layout>
```

```tsx
// src/components/sui/launchpad/vesting/VestingDashboardClient.tsx
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { VestingDashboard } from './VestingDashboard';
import { useWallet } from '@mysten/wallet-kit';

export function VestingDashboardClient() {
  const { address } = useWallet();

  const schedules = useQuery(
    api.queries.sui.vesting.getByBeneficiary,
    address ? { beneficiary: address } : 'skip'
  );

  const claimMutation = useMutation(api.mutations.sui.vesting.claim);
  const batchClaimMutation = useMutation(api.mutations.sui.vesting.batchClaim);

  if (!address) {
    return <div>Please connect your wallet</div>;
  }

  return (
    <VestingDashboard
      schedules={schedules || []}
      onClaim={(id) => claimMutation({ scheduleId: id })}
      onBatchClaim={(ids) => batchClaimMutation({ scheduleIds: ids })}
      isLoading={schedules === undefined}
    />
  );
}
```

## Styling

All components use:
- **shadcn/ui** components (Card, Button, Badge, Progress)
- **Tailwind CSS** for styling
- **Lucide icons** for iconography
- **date-fns** for date formatting

Components are fully responsive and support dark mode out of the box.

## Features Summary

| Component | Compact Mode | Claim Button | Filters | Timeline | Batch Actions |
|-----------|--------------|--------------|---------|----------|---------------|
| VestingScheduleCard | ✓ | ✓ | - | ✓ | - |
| VestingDashboard | - | ✓ | ✓ | - | ✓ |
| VestingTimeline | ✓ | - | - | ✓ | - |

## Status Indicators

### Colors
- **Active** - Blue/Primary
- **Completed** - Green
- **Revoked** - Red/Destructive
- **Cliff Period** - Yellow
- **Claimable** - Primary (highlighted)

### Visual States
- Cliff period shown in yellow
- Claimed amounts in green
- Available to claim highlighted in primary color
- Current time indicated with vertical line
- Progress bars show percentage completed

## Accessibility

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus visible states
- Color-blind friendly color scheme
- Responsive text sizing

## Performance

- Memoized calculations for timeline data
- Optimistic UI updates on claims
- Efficient filtering and sorting
- Lazy loading of heavy date calculations
- Progressive enhancement with hydration directives

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive (iOS Safari, Chrome Android)
- Dark mode support
- Touch-friendly interactive elements

## Next Steps

1. **Connect to Sui Wallet** - Use `@mysten/wallet-kit`
2. **Integrate Convex** - Set up queries and mutations
3. **Add to Dashboard** - Place VestingDashboard in user dashboard
4. **Customize Styling** - Override Tailwind classes as needed
5. **Add Analytics** - Track claim events and user behavior

## Related Documentation

- [Sui Blockchain Documentation](https://docs.sui.io/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Convex React](https://docs.convex.dev/client/react)
- [date-fns Documentation](https://date-fns.org/)
