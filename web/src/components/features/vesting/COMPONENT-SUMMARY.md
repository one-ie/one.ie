# Vesting Dashboard - Component Summary

## Files Created

```
/web/src/components/features/vesting/
├── types.ts                      # TypeScript type definitions
├── index.ts                      # Barrel exports for easy imports
├── VestingDashboard.tsx          # Main dashboard component (273 lines)
├── VestingScheduleCard.tsx       # Individual schedule card (218 lines)
├── VestingProgressBar.tsx        # Progress visualization (69 lines)
├── VestingTimeline.tsx           # Milestone timeline (129 lines)
├── ClaimButton.tsx               # Claim action button (65 lines)
├── ClaimHistoryTable.tsx         # Claim history table (129 lines)
├── README.md                     # Complete documentation
└── COMPONENT-SUMMARY.md          # This file
```

**Total:** 993 lines of code across 9 files

## Component Hierarchy

```
VestingDashboard (Main)
├── Stats Summary Card
│   ├── Total Vested
│   ├── Total Claimed
│   └── Claimable Now
│
├── Tabs
│   ├── Schedules Tab
│   │   └── VestingScheduleCard (multiple)
│   │       ├── VestingProgressBar
│   │       ├── Schedule Details
│   │       └── ClaimButton
│   │
│   ├── Timeline Tab
│   │   ├── Schedule Selector (if multiple)
│   │   └── VestingTimeline
│   │       └── Milestone Items (past/current/future)
│   │
│   └── History Tab
│       └── ClaimHistoryTable
│           └── Claim Rows (with tx links)
```

## Quick Start

### 1. Import Components

```tsx
import { VestingDashboard } from '@/components/features/vesting';
```

### 2. Use with Convex

```tsx
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

export function VestingPage() {
  const userId = "user_123";
  const schedules = useQuery(api.vesting.listSchedules, { userId });
  const claims = useQuery(api.vesting.getClaimHistory, { userId });
  const claim = useMutation(api.vesting.claim);

  return (
    <VestingDashboard
      userId={userId}
      schedules={schedules}
      claims={claims}
      onClaim={async (scheduleId) => await claim({ scheduleId })}
    />
  );
}
```

### 3. Add to Page

```astro
---
// src/pages/vesting/index.astro
import Layout from '@/layouts/Layout.astro';
import { VestingPage } from '@/components/features/vesting/VestingPage';
---

<Layout title="Vesting Dashboard">
  <VestingPage client:load />
</Layout>
```

## Key Features

### Real-Time Updates
- Automatic refresh via Convex subscriptions
- Live progress bars update as time passes
- Instant UI updates when claims are processed

### Smart Calculations
- Vested amount: Linear calculation from start to end
- Cliff handling: No vesting before cliff date
- Claimable amount: Vested minus already claimed

### Visual Progress
- Dual-color progress bar (vested vs claimed)
- Timeline with past/current/future milestones
- Status badges (Active, Completed, Revoked)

### User Actions
- One-click claim with loading states
- Transaction hash links to block explorer
- Claim history with status tracking

### Responsive Design
- Mobile-optimized layouts
- Collapsible tables on small screens
- Touch-friendly controls

### Dark Mode
- Full dark mode support
- Automatic theme detection
- Consistent with ONE platform design

## Component Props

### VestingDashboard
```typescript
interface VestingDashboardProps {
  userId?: string;                              // Current user ID
  schedules?: VestingSchedule[];                // Vesting schedules
  claims?: ClaimRecord[];                       // Claim history
  loading?: boolean;                            // Loading state
  onClaim?: (scheduleId: string) => Promise<void>; // Claim handler
  onRefresh?: () => void;                       // Refresh handler
}
```

### VestingScheduleCard
```typescript
interface VestingScheduleCardProps {
  schedule: VestingSchedule;                    // Schedule data
  vestedAmount: number;                         // Calculated vested
  claimableAmount: number;                      // Calculated claimable
  onClaim?: (scheduleId: string) => Promise<void>; // Claim handler
}
```

### VestingProgressBar
```typescript
interface VestingProgressBarProps {
  totalAmount: number;                          // Total tokens
  vestedAmount: number;                         // Currently vested
  claimedAmount: number;                        // Already claimed
  showLabels?: boolean;                         // Show percentages
}
```

### VestingTimeline
```typescript
interface VestingTimelineProps {
  milestones: VestingMilestone[];               // Timeline events
  tokenSymbol: string;                          // Token symbol
}
```

### ClaimButton
```typescript
interface ClaimButtonProps {
  scheduleId: string;                           // Schedule ID
  claimableAmount: number;                      // Amount to claim
  tokenSymbol: string;                          // Token symbol
  disabled?: boolean;                           // Disable button
  onClaim?: (scheduleId: string) => Promise<void>; // Claim handler
}
```

### ClaimHistoryTable
```typescript
interface ClaimHistoryTableProps {
  claims: ClaimRecord[];                        // Claim records
  tokenSymbol: string;                          // Token symbol
  blockExplorerUrl?: string;                    // Explorer URL
}
```

## Data Types

### VestingSchedule
```typescript
{
  _id: string;                    // Unique ID
  beneficiary: string;            // User ID
  tokenId: string;                // Token ID
  tokenSymbol: string;            // Display symbol
  totalAmount: number;            // Total to vest
  claimedAmount: number;          // Already claimed
  startTime: number;              // Unix timestamp
  cliffDuration: number;          // Seconds
  vestingDuration: number;        // Seconds
  status: 'active' | 'completed' | 'revoked';
  createdAt: number;              // Unix timestamp
}
```

### ClaimRecord
```typescript
{
  _id: string;                    // Unique ID
  scheduleId: string;             // Schedule reference
  amount: number;                 // Claimed amount
  timestamp: number;              // Unix timestamp
  txHash?: string;                // Blockchain tx
  status: 'pending' | 'completed' | 'failed';
}
```

### VestingMilestone
```typescript
{
  date: number;                   // Unix timestamp
  amount: number;                 // Tokens at milestone
  percentage: number;             // % of total
  claimed: boolean;               // Already claimed
  isCliff?: boolean;              // Is cliff event
}
```

## shadcn/ui Components Used

- **Card** - Container layouts
- **Button** - Action buttons
- **Badge** - Status indicators
- **Table** - Claim history
- **Tabs** - Content organization
- **Progress** - Visual progress bars
- **Skeleton** - Loading states
- **Separator** - Visual dividers

## Next Steps

1. **Backend Setup**
   - Create Convex schema for vesting_schedules and claims
   - Implement queries: listSchedules, getClaimableAmount, getClaimHistory
   - Implement mutations: claim
   - Add blockchain transaction integration

2. **Page Integration**
   - Create /pages/vesting/index.astro
   - Add navigation link to sidebar
   - Protect route with authentication

3. **Testing**
   - Write unit tests for calculation functions
   - Test claim flow with mock data
   - Test real-time updates
   - Verify responsive layouts

4. **Enhancements**
   - Add email notifications for claims
   - Add CSV export of claim history
   - Add vesting schedule creation UI
   - Add admin panel for managing schedules

## Architecture Notes

### Pattern Convergence
- Follows ONE platform's pattern convergence principle
- Uses generic ontology types (Thing, Event, Connection)
- Reusable across different token types

### Progressive Complexity
- Layer 1: Static display (if using content collections)
- Layer 3: State management (Nanostores if needed)
- Layer 5: Backend integration (Convex real-time)

### Performance
- Client-side calculations (no backend load)
- Memoized expensive computations
- Lazy loading for timeline visualization
- Skeleton states for loading

### Accessibility
- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Screen reader friendly

## Support

For questions or issues:
- Read `/web/src/components/features/vesting/README.md` for detailed docs
- Check `/one/knowledge/ontology.md` for ontology patterns
- See `/web/CLAUDE.md` for component guidelines
- Review `/CLAUDE.md` for architecture overview

---

**Built with ONE platform's progressive complexity architecture and pattern convergence principles.**
