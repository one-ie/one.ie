# DAO Governance Components

Complete suite of React components for decentralized autonomous organization (DAO) governance on the Sui blockchain.

## Components

### 1. ProposalCreator

Form component for creating new governance proposals.

**Features:**
- Title and markdown description editor
- Proposal type selector (parameter change, treasury spend, custom)
- Actions builder for contract calls
- Voting period, quorum, and threshold configuration
- Form validation and preview

**Usage:**
```tsx
import { ProposalCreator } from '@/components/sui/launchpad/dao';

<ProposalCreator
  userAddress="0x1234...5678"
  onSuccess={(proposalId) => console.log('Created:', proposalId)}
/>
```

**Props:**
- `userAddress?: string` - Connected wallet address
- `onSuccess?: (proposalId: string) => void` - Callback when proposal created

---

### 2. ProposalCard

Display component for individual proposals with voting visualization.

**Features:**
- Status badges (active, passed, failed, executed, cancelled)
- Real-time countdown timer
- Voting bar visualization (for/against/abstain)
- Quorum and threshold progress indicators
- User's previous vote display
- Vote button integration

**Usage:**
```tsx
import { ProposalCard } from '@/components/sui/launchpad/dao';

<ProposalCard
  proposal={proposal}
  onVoteClick={() => openVoteModal()}
  showActions={true}
/>
```

**Props:**
- `proposal: Proposal` - Proposal data object
- `onVoteClick?: () => void` - Custom vote button handler
- `showActions?: boolean` - Show action buttons (default: true)

---

### 3. VoteModal

Modal dialog for casting votes on proposals.

**Features:**
- Three vote options: For, Against, Abstain
- Voting power display
- Optional comment field
- Previous vote indication
- Vote summary confirmation
- Automatic modal state management via nanostores

**Usage:**
```tsx
import { VoteModal } from '@/components/sui/launchpad/dao';

// Modal state managed by store, just render it
<VoteModal />
```

**Opening the modal:**
```tsx
import { daoActions } from '@/stores/dao';

// Open modal for a specific proposal
daoActions.openVoteModal(proposal);
```

---

### 4. DAODashboard

Complete governance dashboard with all features.

**Features:**
- DAO statistics cards (members, proposals, treasury, tokens)
- User voting power display
- Proposal creation interface
- Proposals list with filters
- Recent activity feed
- Tabbed interface (proposals/activity)
- Integrated vote modal

**Usage:**
```tsx
import { DAODashboard } from '@/components/sui/launchpad/dao';

<DAODashboard
  userAddress="0x1234...5678"
  onConnect={() => connectWallet()}
/>
```

**Props:**
- `userAddress?: string` - Connected wallet address
- `onConnect?: () => void` - Wallet connection handler

---

## State Management

All components use **nanostores** for state management, with persistence to localStorage.

### Store: `/stores/dao.ts`

**State:**
```typescript
interface DAOState {
  proposals: Proposal[];
  stats: DAOStats;
  userAddress?: string;
  updatedAt: number;
}
```

**Actions:**
```typescript
import { daoActions } from '@/stores/dao';

// Set user address
daoActions.setUserAddress("0x1234...5678");

// Update DAO stats
daoActions.updateStats({ totalMembers: 1500 });

// Create proposal
daoActions.createProposal({
  title: "Increase Staking Rewards",
  description: "# Proposal...",
  type: "parameter_change",
  proposer: "0x...",
  actions: [...],
  votingPeriodEnd: Date.now() + 7 * 24 * 60 * 60 * 1000,
  quorum: 40,
  threshold: 60,
  totalVotingPower: 2000000,
});

// Cast vote
daoActions.castVote(
  "proposal-1",
  "for",
  5000, // voting power
  "I support this proposal because..." // optional comment
);

// Update proposal status
daoActions.updateProposalStatus("proposal-1", "passed");

// Open/close vote modal
daoActions.openVoteModal(proposal);
daoActions.closeVoteModal();

// Add sample data (for demo)
daoActions.addSampleProposals();
```

**Computed values:**
```typescript
import { useStore } from '@nanostores/react';
import { $daoState, $activeProposals, $userHasVotingPower } from '@/stores/dao';

const daoState = useStore($daoState);
const activeProposals = useStore($activeProposals);
const hasVotingPower = useStore($userHasVotingPower);
```

---

## Types

### Proposal
```typescript
interface Proposal {
  id: string;
  title: string;
  description: string;
  type: "parameter_change" | "treasury_spend" | "custom";
  proposer: string;
  status: "active" | "passed" | "failed" | "executed" | "cancelled";
  actions: ContractAction[];

  votingPeriodEnd: number;
  quorum: number;
  threshold: number;

  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  totalVotingPower: number;

  userVote?: {
    choice: "for" | "against" | "abstain";
    votingPower: number;
    comment?: string;
  };

  createdAt: number;
  executedAt?: number;
}
```

### ContractAction
```typescript
interface ContractAction {
  id: string;
  target: string;      // Contract address
  function: string;    // Function name
  args: string[];      // Function arguments
  value?: string;      // SUI to send (optional)
}
```

---

## Integration Examples

### Basic Page Setup

```astro
---
// src/pages/dao.astro
import Layout from '@/layouts/Layout.astro';
import { DAODashboard } from '@/components/sui/launchpad/dao';

const title = 'DAO Governance';
---

<Layout title={title}>
  <DAODashboard client:load />
</Layout>
```

### Custom Proposal List

```tsx
import { useStore } from '@nanostores/react';
import { $daoState } from '@/stores/dao';
import { ProposalCard } from '@/components/sui/launchpad/dao';

export function MyProposalList() {
  const daoState = useStore($daoState);

  const activeProposals = daoState.proposals.filter(
    p => p.status === 'active'
  );

  return (
    <div className="grid gap-4">
      {activeProposals.map(proposal => (
        <ProposalCard key={proposal.id} proposal={proposal} />
      ))}
    </div>
  );
}
```

### Standalone Proposal Creator

```tsx
import { useState } from 'react';
import { ProposalCreator } from '@/components/sui/launchpad/dao';
import { useRouter } from 'next/navigation';

export function CreateProposalPage() {
  const [userAddress] = useState("0x1234...5678");
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <ProposalCreator
        userAddress={userAddress}
        onSuccess={(id) => router.push(`/dao/proposal/${id}`)}
      />
    </div>
  );
}
```

---

## Backend Integration

### Using Convex Queries/Mutations

To integrate with backend, modify the store actions to call Convex:

```typescript
// stores/dao.ts (with Convex)
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export const daoActions = {
  createProposal: async (data) => {
    // Call Convex mutation instead of localStorage
    const result = await fetch('/api/dao/proposals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return result.json();
  },

  castVote: async (proposalId, choice, votingPower, comment) => {
    // Call Convex mutation
    const result = await fetch(`/api/dao/proposals/${proposalId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ choice, votingPower, comment }),
    });
    return result.json();
  },
};
```

### Real-time Updates with Convex

```tsx
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export function LiveProposalList() {
  const proposals = useQuery(api.queries.sui.dao.listProposals, {
    status: 'active'
  });

  if (!proposals) return <Skeleton />;

  return (
    <div className="grid gap-4">
      {proposals.map(proposal => (
        <ProposalCard key={proposal.id} proposal={proposal} />
      ))}
    </div>
  );
}
```

---

## Styling

All components use **shadcn/ui** and **Tailwind CSS v4**:

- Fully responsive (mobile, tablet, desktop)
- Dark mode support
- Accessible (ARIA labels, keyboard navigation)
- Consistent design system

**Color Scheme:**
- Green (#10b981) for "For" votes
- Red (#ef4444) for "Against" votes
- Gray (#9ca3af) for "Abstain" votes

---

## Performance

- **Static by default**: Components render as static HTML unless interactive
- **Strategic hydration**: Use `client:load`, `client:idle`, or `client:visible`
- **Lazy loading**: Vote modal loads only when opened
- **Optimized re-renders**: Nanostores minimize unnecessary updates

---

## Accessibility

- Semantic HTML
- ARIA labels and roles
- Keyboard navigation
- Screen reader support
- Focus management
- Color contrast (WCAG AA)

---

## Testing

```tsx
import { render, screen } from '@testing-library/react';
import { ProposalCard } from './ProposalCard';

test('renders proposal title', () => {
  const proposal = {
    id: '1',
    title: 'Test Proposal',
    // ... other required fields
  };

  render(<ProposalCard proposal={proposal} />);
  expect(screen.getByText('Test Proposal')).toBeInTheDocument();
});
```

---

## Future Enhancements

Potential features to add:

- [ ] Markdown preview for proposal description
- [ ] Proposal discussion/comments
- [ ] Vote delegation
- [ ] Voting history timeline
- [ ] Multi-sig execution
- [ ] Snapshot integration
- [ ] IPFS proposal storage
- [ ] Token-weighted voting visualization
- [ ] Proposal templates
- [ ] Email/notification system

---

## License

MIT License - See project LICENSE.md

---

## Support

For issues or questions:
- GitHub: https://github.com/one-ie/one
- Docs: https://one.ie/docs
- Discord: https://discord.gg/one

---

**Built with React 19, Tailwind CSS v4, shadcn/ui, and nanostores.**
