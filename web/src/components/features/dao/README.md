# DAO Governance Interface

A comprehensive DAO governance system built with React, TypeScript, and Convex real-time database.

## Features

### 1. DAO Overview
- **Total Members** - Number of DAO participants
- **Active Proposals** - Current proposals being voted on
- **Treasury Balance** - Available DAO funds
- **Participation Rate** - Average voter turnout percentage

### 2. Active Proposals
- List of all active proposals with real-time updates
- Status badges (pending, active, succeeded, defeated, executed, cancelled)
- Voting progress bars with percentages
- Quorum tracking
- Time remaining indicators

### 3. Proposal Details
- Full proposal description
- List of proposal actions (transfer, mint, parameter changes)
- Detailed voting breakdown with visual charts
- Timeline (start time, end time)
- Proposer information

### 4. Vote Casting
- **For** - Vote in favor of the proposal
- **Against** - Vote against the proposal
- **Abstain** - Abstain from voting
- Voting power display
- Real-time vote updates

### 5. Create Proposal
- Title and description fields
- Optional action configuration:
  - Transfer funds
  - Mint tokens
  - Parameter changes
  - Custom actions
- Target address/contract specification
- Amount/value input

### 6. Proposal History
- Past proposals (succeeded, defeated, executed)
- Historical voting results
- Execution status

## Components

### Main Component

**`<GovernanceInterface />`** - Complete DAO governance interface

```tsx
import { GovernanceInterface } from '@/components/features/dao';

<GovernanceInterface
  daoId="dao_123"
  groupId="group_456"
  userAddress="0x1234..."
/>
```

### Sub-Components

All sub-components are used internally by `GovernanceInterface`:

- **`DAOStats`** - Overview statistics cards
- **`VotingPowerBadge`** - User's voting power display
- **`ProposalCard`** - Individual proposal card with voting buttons
- **`VoteButton`** - Vote action button (For/Against/Abstain)
- **`ProposalStatusBadge`** - Colored status badge with icon
- **`ProposalDetailDialog`** - Full proposal details modal
- **`CreateProposalDialog`** - Create new proposal form
- **`GovernanceInterfaceSkeleton`** - Loading state

## Usage Examples

### Basic Usage

```tsx
import { GovernanceInterface } from '@/components/features/dao';

export function DAOPage() {
  return (
    <div className="container mx-auto py-8">
      <GovernanceInterface
        daoId="my-dao-id"
        groupId="my-group-id"
        userAddress="0x1234567890abcdef"
      />
    </div>
  );
}
```

### In Astro Page

```astro
---
// src/pages/dao/[id].astro
import Layout from '@/layouts/Layout.astro';
import { GovernanceInterface } from '@/components/features/dao';

const { id } = Astro.params;
---

<Layout title="DAO Governance">
  <GovernanceInterface
    client:load
    daoId={id}
    groupId="optional-group-id"
    userAddress="0x..."
  />
</Layout>
```

### With ConvexClientProvider

```tsx
import { ConvexClientProvider } from '@/components/ConvexClientProvider';
import { GovernanceInterface } from '@/components/features/dao';

export function App() {
  return (
    <ConvexClientProvider>
      <GovernanceInterface
        daoId="dao-123"
        userAddress="0x..."
      />
    </ConvexClientProvider>
  );
}
```

## Props

### GovernanceInterface Props

```typescript
interface GovernanceInterfaceProps {
  // Required: DAO identifier
  daoId: string;

  // Optional: Group ID for multi-tenant scoping
  groupId?: string;

  // Optional: Current user's wallet address
  userAddress?: string;

  // Optional: Additional CSS classes
  className?: string;
}
```

## Convex Integration

The component uses these Convex API endpoints (you need to implement them):

### Queries

```typescript
// Get DAO statistics
api.dao.getStats(args: { daoId: string; groupId?: string }): DAOStats

// List proposals with optional filtering
api.dao.listProposals(args: {
  daoId: string;
  groupId?: string;
  status?: ProposalStatus;
}): Proposal[]

// Get single proposal details
api.dao.getProposal(args: {
  proposalId: string;
  daoId: string;
  groupId?: string;
}): Proposal

// Get user's voting power
api.dao.getVotingPower(args: {
  daoId: string;
  userAddress: string;
}): number
```

### Mutations

```typescript
// Create a new proposal
api.dao.createProposal(args: {
  daoId: string;
  groupId?: string;
  title: string;
  description: string;
  actions: ProposalAction[];
}): void

// Cast a vote on a proposal
api.dao.vote(args: {
  daoId: string;
  groupId?: string;
  proposalId: string;
  voteType: 'for' | 'against' | 'abstain';
  votingPower: number;
  voter: string;
}): void
```

## Types

```typescript
// Proposal status
type ProposalStatus = 'pending' | 'active' | 'succeeded' | 'defeated' | 'executed' | 'cancelled';

// Vote type
type VoteType = 'for' | 'against' | 'abstain';

// Proposal action
interface ProposalAction {
  type: 'transfer' | 'mint' | 'parameter_change' | 'custom';
  target: string;
  value?: number;
  data?: string;
  description: string;
}

// Proposal
interface Proposal {
  _id: string;
  title: string;
  description: string;
  proposer: string;
  status: ProposalStatus;
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  totalVotes: number;
  quorum: number;
  startTime: number;
  endTime: number;
  actions: ProposalAction[];
  executed: boolean;
}

// DAO statistics
interface DAOStats {
  totalMembers: number;
  activeProposals: number;
  treasuryBalance: number;
  participationRate: number;
  totalProposals: number;
}
```

## Ontology Mapping

The DAO governance interface maps to the 6-dimension ontology:

1. **THINGS** - Proposals are things with `type: "proposal"`
2. **PEOPLE** - DAO members with voting power
3. **EVENTS** - Vote casting, proposal creation, proposal execution
4. **CONNECTIONS** - `member_of` (user → DAO), `voted_on` (user → proposal)
5. **GROUPS** - Multi-tenant DAO scoping via `groupId`
6. **KNOWLEDGE** - Proposal search and categorization

## Styling

Uses shadcn/ui components for consistent design:

- **Cards** - Proposal cards, stats cards
- **Badges** - Status badges, role badges
- **Progress** - Voting progress, quorum progress
- **Dialogs** - Proposal details, create proposal
- **Buttons** - Vote buttons, action buttons
- **Forms** - Create proposal form with validation
- **Tabs** - Active proposals vs history

Colors follow the design system:
- Green - For votes, succeeded proposals
- Red - Against votes, defeated proposals
- Gray - Abstain votes
- Blue - Active proposals
- Yellow - Pending proposals
- Purple - Executed proposals

## Real-time Updates

The component uses Convex subscriptions for real-time updates:

- Proposal list updates automatically when new proposals are created
- Vote counts update in real-time as users vote
- DAO stats refresh when members join or proposals are created
- No manual refresh needed

## Accessibility

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Screen reader friendly
- Color contrast meets WCAG AA standards

## Performance

- Optimistic UI updates for instant feedback
- Skeleton loading states
- Lazy loading for proposal details
- Efficient re-renders with React hooks
- Real-time subscriptions only for visible data

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Dependencies

```json
{
  "convex": "^1.x",
  "react": "^19.x",
  "date-fns": "^2.x",
  "lucide-react": "^0.x",
  "@/components/ui/*": "shadcn/ui components"
}
```

## Next Steps

1. **Implement Convex backend** - Create the required queries and mutations
2. **Add authentication** - Integrate wallet connection (MetaMask, WalletConnect)
3. **Add notifications** - Toast notifications for vote confirmations
4. **Add proposal templates** - Common proposal types (grants, parameter changes)
5. **Add delegation** - Allow users to delegate voting power
6. **Add execution** - Execute succeeded proposals on-chain
7. **Add discussion** - Comments and discussion threads on proposals

## License

Part of the ONE platform - MIT License
