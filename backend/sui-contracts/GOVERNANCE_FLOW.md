# DAO Governance Process Flow

## Overview

This document describes the complete governance flow for the Sui Move DAO Governance smart contract.

---

## 1. Initialization Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    GOVERNANCE INITIALIZATION                     │
└─────────────────────────────────────────────────────────────────┘

Admin/DAO Creator
        │
        │ Calls: initialize_governance()
        │ Parameters:
        │   - dao_id (ID of the DAO entity)
        │   - proposal_threshold (min tokens to create proposal)
        │   - quorum_threshold (min % of supply must vote)
        │   - approval_threshold (min % yes votes to pass)
        │   - default_voting_period (in milliseconds)
        │   - total_supply (total token supply)
        │
        ▼
┌───────────────────────────────────────┐
│  Create GovernanceConfig (shared)    │ ───────┐
│  - Stores all governance parameters  │        │
│  - Accessible by all participants    │        │
└───────────────────────────────────────┘        │
                                                 │
                                                 │
┌───────────────────────────────────────┐        │
│  Create AdminCap (owned)              │◄───────┘
│  - Transferred to admin               │
│  - Allows parameter updates           │
└───────────────────────────────────────┘

        │
        │ Emits: GovernanceCreated
        │
        ▼
    [READY FOR PROPOSALS]
```

---

## 2. Proposal Creation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      PROPOSAL CREATION                           │
└─────────────────────────────────────────────────────────────────┘

Token Holder (with balance >= proposal_threshold)
        │
        │ Calls: create_proposal()
        │ Parameters:
        │   - governance (reference to config)
        │   - title (proposal name)
        │   - description (detailed explanation)
        │   - actions (executable contract calls)
        │   - voting_period (optional, uses default if not set)
        │   - proposer_balance (token balance for validation)
        │   - proposal_number (sequence number)
        │
        ▼
┌───────────────────────────────────────┐
│  VALIDATION                           │
│  ✓ proposer_balance >= threshold?    │
│  ✓ voting period valid?               │
└───────────────────────────────────────┘
        │
        │ All checks pass
        │
        ▼
┌───────────────────────────────────────┐
│  CREATE PROPOSAL (shared object)      │
│  - Unique ID generated                │
│  - Title & description stored         │
│  - Actions stored for execution       │
│  - Voting start/end timestamps set    │
│  - Vote counters initialized to 0     │
│  - Empty votes table created          │
└───────────────────────────────────────┘
        │
        │ Emits: ProposalCreated
        │
        ▼
    [PROPOSAL ACTIVE - VOTING OPEN]
```

---

## 3. Voting Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         VOTING PROCESS                           │
└─────────────────────────────────────────────────────────────────┘

Token Holder
        │
        │ Calls: cast_vote()
        │ Parameters:
        │   - governance (config reference)
        │   - proposal (mutable reference)
        │   - choice (FOR=1, AGAINST=2, ABSTAIN=3)
        │   - voter_balance (token balance for vote weight)
        │   - comment (optional vote comment)
        │   - clock (for timestamp)
        │
        ▼
┌───────────────────────────────────────┐
│  VALIDATION                           │
│  ✓ Valid vote choice? (1, 2, or 3)   │
│  ✓ Voting period active?              │
│  ✓ Not already voted?                 │
│  ✓ Has voting power? (balance > 0)    │
└───────────────────────────────────────┘
        │
        │ All checks pass
        │
        ▼
┌───────────────────────────────────────┐
│  CREATE VOTE RECORD                   │
│  - Voter address                      │
│  - Choice (for/against/abstain)       │
│  - Vote weight (token balance)        │
│  - Timestamp                          │
│  - Comment                            │
└───────────────────────────────────────┘
        │
        ├─────► IF choice == FOR
        │       │
        │       └──► votes_for += voter_balance
        │
        ├─────► IF choice == AGAINST
        │       │
        │       └──► votes_against += voter_balance
        │
        └─────► IF choice == ABSTAIN
                │
                └──► votes_abstain += voter_balance
        │
        ▼
┌───────────────────────────────────────┐
│  STORE VOTE                           │
│  - Add to proposal.votes table        │
│  - Increment voter_count              │
└───────────────────────────────────────┘
        │
        │ Emits: VoteCast
        │
        ▼
    [VOTE RECORDED]
```

---

## 4. Proposal Status Calculation

```
┌─────────────────────────────────────────────────────────────────┐
│                    PROPOSAL STATUS CALCULATION                   │
└─────────────────────────────────────────────────────────────────┘

Query: get_proposal_status(governance, proposal, clock)
        │
        ▼
┌───────────────────────────────────────┐
│  CALCULATE TOTALS                     │
│  total_votes = for + against + abstain│
│  non_abstain = for + against          │
└───────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────┐
│  CHECK QUORUM                         │
│  quorum % = (total_votes / total_supply) * 100│
│  quorum_reached = quorum % >= quorum_threshold│
└───────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────┐
│  CHECK APPROVAL                       │
│  approval % = (votes_for / non_abstain) * 100│
│  approval_reached = approval % >= approval_threshold│
└───────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────┐
│  DETERMINE STATUS                     │
│                                       │
│  IF executed → STATUS_EXECUTED (4)    │
│  ELSE IF voting not ended → STATUS_ACTIVE (1)│
│  ELSE IF quorum && approval → STATUS_PASSED (2)│
│  ELSE → STATUS_FAILED (3)             │
└───────────────────────────────────────┘
        │
        ▼
    Return ProposalStatus {
        proposal_id,
        status,
        votes_for,
        votes_against,
        votes_abstain,
        total_voting_power,
        quorum_reached,
        approval_reached,
        voting_ended,
        executed
    }
```

---

## 5. Proposal Execution Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     PROPOSAL EXECUTION                           │
└─────────────────────────────────────────────────────────────────┘

Any Address (typically proposer or executor)
        │
        │ Calls: execute_proposal()
        │ Parameters:
        │   - governance (config reference)
        │   - proposal (mutable reference)
        │   - clock (for timestamp)
        │
        ▼
┌───────────────────────────────────────┐
│  VALIDATION                           │
│  ✓ Voting period ended?               │
│  ✓ Not already executed?              │
│  ✓ Quorum reached?                    │
│  ✓ Approval threshold met?            │
└───────────────────────────────────────┘
        │
        │ All checks pass
        │
        ▼
┌───────────────────────────────────────┐
│  MARK AS EXECUTED                     │
│  proposal.executed = true             │
└───────────────────────────────────────┘
        │
        │ Emits: ProposalExecuted
        │
        ▼
┌───────────────────────────────────────┐
│  ACTIONS READY FOR EXECUTION          │
│  (Must be executed in separate txs)   │
│                                       │
│  Frontend reads proposal.actions:     │
│  - module_name                        │
│  - function_name                      │
│  - arguments                          │
│                                       │
│  Then calls those functions           │
└───────────────────────────────────────┘
        │
        ▼
    [PROPOSAL EXECUTED]
```

---

## 6. Complete Lifecycle Diagram

```
                  ┌────────────────────────────┐
                  │   Initialize Governance    │
                  │   (Admin creates config)   │
                  └────────────┬───────────────┘
                               │
                               ▼
                  ┌────────────────────────────┐
                  │    Create Proposal         │
                  │    (Token holder)          │
                  │  STATUS: ACTIVE (1)        │
                  └────────────┬───────────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
                ▼                             ▼
    ┌───────────────────────┐     ┌───────────────────────┐
    │  Users Cast Votes     │     │   Voting Period       │
    │  (FOR/AGAINST/ABSTAIN)│     │   In Progress         │
    └───────────────────────┘     └───────────────────────┘
                │                             │
                └──────────────┬──────────────┘
                               │
                               ▼
                  ┌────────────────────────────┐
                  │   Voting Period Ends       │
                  └────────────┬───────────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
                ▼                             ▼
    ┌───────────────────────┐     ┌───────────────────────┐
    │   Quorum Reached      │     │   Quorum NOT Reached  │
    │   Approval Reached    │     │   OR Approval Failed  │
    │ STATUS: PASSED (2)    │     │  STATUS: FAILED (3)   │
    └───────────┬───────────┘     └───────────────────────┘
                │                             │
                ▼                             ▼
    ┌───────────────────────┐          [PROPOSAL ENDS]
    │  Execute Proposal     │
    │ STATUS: EXECUTED (4)  │
    └───────────┬───────────┘
                │
                ▼
       [ACTIONS EXECUTED]
```

---

## 7. Voting Power Calculation

```
┌─────────────────────────────────────────────────────────────────┐
│                    VOTING POWER CALCULATION                      │
└─────────────────────────────────────────────────────────────────┘

Query: calculate_voting_power(token_balance)
        │
        ▼
┌───────────────────────────────────────┐
│  SIMPLE MODEL (v1)                    │
│  voting_power = token_balance         │
│                                       │
│  Future enhancements:                 │
│  - Delegated voting                   │
│  - Vote multipliers (stakers)         │
│  - Quadratic voting                   │
│  - Time-weighted voting               │
└───────────────────────────────────────┘
        │
        ▼
    Return voting_power
```

---

## 8. Threshold Examples

### Example 1: Standard DAO

```
Configuration:
- quorum_threshold: 1000 (10%)
- approval_threshold: 5000 (50%)
- total_supply: 1,000,000 tokens

Scenario:
- votes_for: 60,000 tokens
- votes_against: 40,000 tokens
- votes_abstain: 10,000 tokens

Calculations:
total_votes = 60,000 + 40,000 + 10,000 = 110,000
quorum = (110,000 / 1,000,000) * 10000 = 1100 basis points = 11%
✓ Quorum reached (11% >= 10%)

non_abstain = 60,000 + 40,000 = 100,000
approval = (60,000 / 100,000) * 10000 = 6000 basis points = 60%
✓ Approval reached (60% >= 50%)

Result: PROPOSAL PASSED ✓
```

### Example 2: High-Threshold DAO

```
Configuration:
- quorum_threshold: 3000 (30%)
- approval_threshold: 6667 (66.67%)
- total_supply: 10,000,000 tokens

Scenario:
- votes_for: 2,000,000 tokens
- votes_against: 1,000,000 tokens
- votes_abstain: 500,000 tokens

Calculations:
total_votes = 2,000,000 + 1,000,000 + 500,000 = 3,500,000
quorum = (3,500,000 / 10,000,000) * 10000 = 3500 basis points = 35%
✓ Quorum reached (35% >= 30%)

non_abstain = 2,000,000 + 1,000,000 = 3,000,000
approval = (2,000,000 / 3,000,000) * 10000 = 6667 basis points = 66.67%
✓ Approval reached (66.67% >= 66.67%)

Result: PROPOSAL PASSED ✓
```

### Example 3: Failed Quorum

```
Configuration:
- quorum_threshold: 2000 (20%)
- approval_threshold: 5000 (50%)
- total_supply: 1,000,000 tokens

Scenario:
- votes_for: 150,000 tokens
- votes_against: 50,000 tokens
- votes_abstain: 0 tokens

Calculations:
total_votes = 150,000 + 50,000 + 0 = 200,000
quorum = (200,000 / 1,000,000) * 10000 = 2000 basis points = 20%
✓ Quorum barely reached (20% >= 20%)

non_abstain = 150,000 + 50,000 = 200,000
approval = (150,000 / 200,000) * 10000 = 7500 basis points = 75%
✓ Approval reached (75% >= 50%)

Result: PROPOSAL PASSED ✓

BUT if only 190,000 tokens voted:
quorum = (190,000 / 1,000,000) * 10000 = 1900 basis points = 19%
✗ Quorum NOT reached (19% < 20%)

Result: PROPOSAL FAILED ✗
```

---

## 9. Integration with ONE Ontology

### Mapping to 6 Dimensions

```
┌─────────────────────────────────────────────────────────────────┐
│                    ONTOLOGY INTEGRATION                          │
└─────────────────────────────────────────────────────────────────┘

1. GROUPS (Multi-tenant isolation)
   - DAO represented by GovernanceConfig.dao_id
   - Scopes all proposals to specific organization

2. PEOPLE (Authorization)
   - platform_owner: Can deploy governance contracts
   - org_owner: Admin with AdminCap, creates proposals
   - org_user: Team members who vote
   - customer: Token holders who vote

3. THINGS (Entities)
   - Proposal → type: 'dao_proposal'
   - Vote → type: 'vote'
   - GovernanceConfig → type: 'governance_config'

4. CONNECTIONS (Relationships)
   - voted_on: person → proposal (metadata: choice, weight)
   - owns_treasury: dao → treasury
   - proposed_by: proposal → person

5. EVENTS (Audit trail)
   - ProposalCreated → type: 'proposal_created'
   - VoteCast → type: 'vote_cast'
   - ProposalExecuted → type: 'proposal_executed'
   - GovernanceUpdated → type: 'governance_updated'

6. KNOWLEDGE (AI/RAG)
   - Proposal descriptions indexed for search
   - Voting patterns analyzed
   - Governance best practices
```

### Backend Integration Flow

```
Sui Smart Contract Events
        │
        │ Event Listener Service
        │ (Convex service)
        │
        ▼
┌───────────────────────────────────────┐
│  Parse Sui Events                     │
│  - ProposalCreated                    │
│  - VoteCast                           │
│  - ProposalExecuted                   │
└───────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────┐
│  Map to Ontology                      │
│  - Create thing (type: 'dao_proposal')│
│  - Create connection (type: 'voted_on')│
│  - Create event in Convex             │
└───────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────┐
│  Store in Convex Database             │
│  - things table                       │
│  - connections table                  │
│  - events table                       │
└───────────────────────────────────────┘
        │
        ▼
    Frontend queries Convex
    (Real-time updates via subscriptions)
```

---

## 10. Security Considerations

### Access Control

```
┌────────────────────────────────────────────────────────────────┐
│                     ACCESS CONTROL MATRIX                       │
├────────────────────┬───────────────────────────────────────────┤
│ Function           │ Who Can Call                              │
├────────────────────┼───────────────────────────────────────────┤
│ initialize_gov     │ Any address (becomes admin)               │
│ create_proposal    │ Token holders with >= proposal_threshold  │
│ cast_vote          │ Token holders with > 0 balance            │
│ execute_proposal   │ Any address (if proposal passed)          │
│ get_status         │ Anyone (read-only)                        │
│ update_governance  │ Admin with AdminCap ONLY                  │
│ update_supply      │ Admin with AdminCap ONLY                  │
└────────────────────┴───────────────────────────────────────────┘
```

### Common Attack Vectors & Mitigations

```
1. Double Voting
   ✓ Mitigated: table::contains() check before adding vote

2. Vote After Deadline
   ✓ Mitigated: Timestamp validation in cast_vote()

3. Execute Before Voting Ends
   ✓ Mitigated: Timestamp check in execute_proposal()

4. Execute Without Quorum/Approval
   ✓ Mitigated: Quorum and approval calculations in execute_proposal()

5. Execute Multiple Times
   ✓ Mitigated: proposal.executed flag check

6. Flash Loan Attacks (buy tokens, vote, sell)
   ✓ Mitigated: Voting power snapshot at proposal creation
   ✓ Note: In production, integrate with token contract for balance snapshot

7. Admin Parameter Manipulation
   ✓ Mitigated: AdminCap required, events emitted for transparency

8. Sybil Attack (create many addresses)
   ✓ Mitigated: Voting power = token balance (cost to attack = buy majority)
```

---

## 11. Gas Optimization Notes

```
┌────────────────────────────────────────────────────────────────┐
│                      GAS OPTIMIZATION                           │
└────────────────────────────────────────────────────────────────┘

Low Gas Operations (<0.001 SUI):
- create_proposal (creates shared object)
- cast_vote (adds to table)
- get_proposal_status (read-only)

Medium Gas Operations (<0.01 SUI):
- initialize_governance (creates 2 objects)
- execute_proposal (marks executed)

High Gas Operations (variable):
- Actions execution (depends on action complexity)

Tips:
- Batch vote reads using multi-call
- Cache proposal status off-chain
- Use events for indexing (cheaper than querying chain)
```

---

## Summary

This governance system provides:
- ✅ Token-weighted voting
- ✅ Configurable thresholds (quorum, approval)
- ✅ Time-based voting periods
- ✅ One vote per address
- ✅ Executable actions
- ✅ Comprehensive events
- ✅ Admin controls
- ✅ Security against common attacks
- ✅ Integration with ONE ontology
- ✅ Gas-efficient design

Perfect for DAOs, token communities, and decentralized governance on Sui!
