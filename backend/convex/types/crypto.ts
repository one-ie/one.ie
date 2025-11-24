/**
 * Sui Launchpad Type Definitions
 *
 * Type-safe interfaces for the Sui crypto features.
 * These types align with the properties field in the things table.
 */

import { Id } from "../_generated/dataModel";

// ============================================================================
// Network Types
// ============================================================================

export type SuiNetwork = "sui-mainnet" | "sui-testnet" | "sui-devnet";

// ============================================================================
// Token Properties
// ============================================================================

export interface TokenProperties {
  // Network details
  network: SuiNetwork;
  packageId: string;        // Sui package ID
  coinType: string;         // Full coin type (0x...::coin::COIN)

  // Token metadata
  symbol: string;           // Token symbol (e.g., "USDC")
  decimals: number;         // Token decimals (e.g., 6)
  totalSupply: string;      // Total supply (as string for big numbers)

  // Verification
  verified: boolean;        // Community verification status

  // Optional metadata
  description?: string;
  iconUrl?: string;
  website?: string;
  twitter?: string;
  telegram?: string;

  // Launch details
  launchDate?: number;      // Timestamp
  initialPrice?: string;    // Launch price
  marketCap?: string;       // Current market cap
}

// ============================================================================
// Vesting Schedule Properties
// ============================================================================

export interface VestingScheduleProperties {
  tokenId: Id<"things">;        // Reference to token thing
  beneficiaryId: Id<"things">;  // Reference to person thing

  // Vesting amounts
  totalAmount: string;          // Total vested amount
  claimedAmount: string;        // Amount already claimed

  // Vesting timeline
  cliffEnd: number;             // Timestamp when cliff ends
  vestingEnd: number;           // Timestamp when vesting completes
  vestingInterval?: number;     // Optional: release interval (e.g., monthly)

  // Calculation helpers
  vestingDuration?: number;     // Total vesting duration in ms
  cliffDuration?: number;       // Cliff duration in ms
}

// ============================================================================
// Staking Pool Properties
// ============================================================================

export interface StakingPoolProperties {
  // Token details
  tokenType: string;      // Coin type being staked

  // Pool state
  totalStaked: string;    // Total amount staked
  rewardRate: string;     // Reward rate (e.g., "0.05" for 5% APY)

  // Staking rules
  lockDuration: number;   // Lock duration in milliseconds
  minStake?: string;      // Minimum stake amount
  maxStake?: string;      // Maximum stake amount

  // Pool metadata
  startTime?: number;     // Pool start timestamp
  endTime?: number;       // Pool end timestamp (if time-limited)
  totalRewards?: string;  // Total rewards allocated to pool
}

// ============================================================================
// DAO Proposal Properties
// ============================================================================

export type ProposalStatus = "active" | "passed" | "rejected" | "executed" | "cancelled";

export interface ProposalAction {
  type: string;           // Action type (e.g., "transfer", "upgrade")
  target: string;         // Target address or object
  data: any;              // Action-specific data
}

export interface DaoProposalProperties {
  daoId: Id<"things">;         // Reference to DAO (group or thing)

  // Proposal details
  title: string;
  description: string;

  // Voting state
  votesFor: string;            // Total votes in favor
  votesAgainst: string;        // Total votes against
  votingEnd: number;           // Timestamp when voting ends
  status: ProposalStatus;

  // Execution
  actions: ProposalAction[];   // Actions to execute if passed

  // Voting rules
  quorum?: string;             // Required quorum
  threshold?: string;          // Passing threshold (e.g., "0.51" for 51%)

  // Metadata
  proposer?: Id<"things">;     // Proposer ID
  createdAt?: number;
  executedAt?: number;
}

// ============================================================================
// Treasury Properties
// ============================================================================

export interface TreasuryProperties {
  // Multi-sig configuration
  owners: string[];       // Array of Sui addresses
  threshold: number;      // Required signatures (e.g., 2 of 3)

  // Balances
  balance: {              // Balance by coin type
    [coinType: string]: string;
  };

  // Security
  nonce: number;          // Transaction nonce for replay protection

  // Metadata
  name?: string;          // Treasury name
  description?: string;
}

// ============================================================================
// Connection Metadata Types
// ============================================================================

export interface HoldsTokensMetadata {
  balance: string;        // Token balance
  network: string;        // Sui network
  coinType: string;       // Coin type
  address?: string;       // Sui wallet address
}

export interface VestedToMetadata {
  amount: string;         // Total vested amount
  cliffEnd: number;       // Cliff end timestamp
  vestingEnd: number;     // Vesting end timestamp
  claimed: string;        // Amount claimed so far
}

export interface StakedInMetadata {
  amount: string;         // Staked amount
  startTime: number;      // Stake start timestamp
  lockEnd: number;        // Lock end timestamp
  rewards: string;        // Accumulated rewards
}

export interface VotedOnMetadata {
  vote: "for" | "against" | "abstain";
  weight: string;         // Voting weight (token amount)
  timestamp: number;      // Vote timestamp
}

export interface OwnsTreasuryMetadata {
  isOwner: boolean;       // Is this address an owner?
  canApprove: boolean;    // Can approve transactions?
  address: string;        // Sui address
}

export interface PurchasedInLaunchMetadata {
  amount: string;         // Token amount purchased
  price: string;          // Price paid (in SUI or other token)
  timestamp: number;      // Purchase timestamp
  txDigest?: string;      // Sui transaction digest
}

// ============================================================================
// Event Metadata Types
// ============================================================================

export interface TokenEventMetadata {
  tokenId: Id<"things">;
  network: string;
  coinType: string;
  amount: string;
  txDigest?: string;      // Sui transaction digest
}

export interface VestingEventMetadata {
  vestingScheduleId: Id<"things">;
  beneficiaryId: Id<"things">;
  amount: string;
  timestamp: number;
  txDigest?: string;
}

export interface StakingEventMetadata {
  poolId: Id<"things">;
  stakerId: Id<"things">;
  amount: string;
  rewards?: string;
  txDigest?: string;
}

export interface DaoEventMetadata {
  proposalId: Id<"things">;
  voterId?: Id<"things">;
  vote?: "for" | "against" | "abstain";
  votingWeight?: string;
  txDigest?: string;
}

export interface TreasuryEventMetadata {
  treasuryId: Id<"things">;
  amount: string;
  coinType: string;
  from?: string;          // Sui address
  to?: string;            // Sui address
  approvers: string[];    // Addresses that approved
  txDigest?: string;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Helper type to extract properties for a specific thing type
 */
export type ThingProperties<T extends string> =
  T extends "token" ? TokenProperties :
  T extends "vesting_schedule" ? VestingScheduleProperties :
  T extends "staking_pool" ? StakingPoolProperties :
  T extends "dao_proposal" ? DaoProposalProperties :
  T extends "treasury" ? TreasuryProperties :
  any; // Fallback for other types

/**
 * Helper type to extract metadata for a specific connection type
 */
export type ConnectionMetadata<T extends string> =
  T extends "holds_tokens" ? HoldsTokensMetadata :
  T extends "vested_to" ? VestedToMetadata :
  T extends "staked_in" ? StakedInMetadata :
  T extends "voted_on" ? VotedOnMetadata :
  T extends "owns_treasury" ? OwnsTreasuryMetadata :
  T extends "purchased_in_launch" ? PurchasedInLaunchMetadata :
  any; // Fallback for other types

/**
 * Helper type to extract metadata for a specific event type
 */
export type EventMetadata<T extends string> =
  T extends "token_created" | "tokens_minted" | "tokens_burned" | "tokens_transferred" ? TokenEventMetadata :
  T extends "vesting_schedule_created" | "vesting_claimed" ? VestingEventMetadata :
  T extends "tokens_staked" | "tokens_unstaked" | "staking_reward_claimed" ? StakingEventMetadata :
  T extends "proposal_created" | "vote_cast" | "proposal_executed" | "proposal_rejected" ? DaoEventMetadata :
  T extends "treasury_created" | "treasury_deposit" | "treasury_withdrawal" | "treasury_approval" ? TreasuryEventMetadata :
  any; // Fallback for other types
