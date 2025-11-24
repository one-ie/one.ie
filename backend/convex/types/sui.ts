/**
 * Sui Launchpad TypeScript Types
 *
 * Comprehensive type definitions for Sui blockchain integration supporting:
 * - Token creation and management
 * - Vesting schedules
 * - Staking pools
 * - DAO governance
 * - Multi-sig treasuries
 *
 * Maps to 6-dimension ontology:
 * - THINGS: tokens, vesting_schedules, staking_pools, dao_proposals, treasuries
 * - CONNECTIONS: holds_tokens, vested_to, staked_in, voted_on, owns_treasury
 * - EVENTS: token_created, vesting_claimed, tokens_staked, vote_cast, treasury_withdrawal
 *
 * @module sui-types
 * @version 1.0.0
 */

import { Id } from "../_generated/dataModel";

// ============================================================================
// Network Types
// ============================================================================

/**
 * Sui network identifiers
 *
 * @example
 * const network: SuiNetwork = 'mainnet';
 */
export type SuiNetwork = 'mainnet' | 'testnet' | 'devnet';

/**
 * Transaction status on Sui network
 *
 * @example
 * const status: TransactionStatus = 'confirmed';
 */
export type TransactionStatus = 'pending' | 'confirmed' | 'failed';

// ============================================================================
// Token Types
// ============================================================================

/**
 * Token metadata for launched tokens on Sui
 *
 * Maps to ontology thing type: 'token'
 *
 * @example
 * const token: TokenMetadata = {
 *   name: "Agent Token",
 *   symbol: "AGT",
 *   decimals: 9,
 *   totalSupply: "1000000000000000000", // 1B tokens with 9 decimals
 *   creator: "0x1234...5678",
 *   network: "mainnet",
 *   packageId: "0xabcd...ef01",
 *   coinType: "0xabcd...ef01::agent_token::AGENT_TOKEN",
 *   description: "Utility token for AI agent services",
 *   logoUrl: "https://example.com/logo.png",
 *   website: "https://example.com",
 *   twitter: "@agenttoken",
 *   discord: "https://discord.gg/agenttoken"
 * };
 */
export interface TokenMetadata {
  /** Token name (e.g., "Agent Token") */
  name: string;

  /** Token symbol (e.g., "AGT") */
  symbol: string;

  /** Number of decimal places (typically 9 for Sui) */
  decimals: number;

  /** Total supply as string to handle large numbers (e.g., "1000000000000000000") */
  totalSupply: string;

  /** Sui address of token creator */
  creator: string;

  /** Sui network where token is deployed */
  network: SuiNetwork;

  /** Sui package ID where token contract is deployed */
  packageId: string;

  /** Full coin type identifier (packageId::module::type) */
  coinType: string;

  /** Optional token description */
  description?: string;

  /** Optional logo image URL */
  logoUrl?: string;

  /** Optional project website */
  website?: string;

  /** Optional Twitter handle */
  twitter?: string;

  /** Optional Discord invite link */
  discord?: string;

  /** Optional Telegram group link */
  telegram?: string;

  /** Timestamp when token was created */
  createdAt?: number;

  /** Timestamp when token was last updated */
  updatedAt?: number;
}

// ============================================================================
// Vesting Types
// ============================================================================

/**
 * Vesting schedule for token distribution
 *
 * Maps to ontology thing type: 'vesting_schedule'
 * Creates connection: vested_to (vesting_schedule → beneficiary)
 *
 * @example
 * const vestingSchedule: VestingSchedule = {
 *   beneficiary: "0x1234...5678",
 *   totalAmount: "1000000000000000", // 1M tokens
 *   claimedAmount: "250000000000000", // 250K claimed
 *   cliffEnd: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year cliff
 *   vestingEnd: Date.now() + 4 * 365 * 24 * 60 * 60 * 1000, // 4 year vesting
 *   startTime: Date.now(),
 *   tokenId: "0xabcd...ef01",
 *   scheduleId: "0x9876...5432",
 *   status: "active"
 * };
 */
export interface VestingSchedule {
  /** Sui address of beneficiary who will receive tokens */
  beneficiary: string;

  /** Total amount to be vested (as string for large numbers) */
  totalAmount: string;

  /** Amount already claimed by beneficiary */
  claimedAmount: string;

  /** Timestamp when cliff period ends (tokens start unlocking) */
  cliffEnd: number;

  /** Timestamp when vesting period ends (all tokens unlocked) */
  vestingEnd: number;

  /** Timestamp when vesting schedule started */
  startTime: number;

  /** Reference to token being vested */
  tokenId: string;

  /** Unique identifier for this vesting schedule on Sui */
  scheduleId: string;

  /** Current status of vesting schedule */
  status: 'active' | 'completed' | 'revoked';

  /** Optional metadata for tracking */
  metadata?: {
    /** Purpose of this vesting (e.g., "team", "advisors", "investors") */
    purpose?: string;

    /** Notes about this schedule */
    notes?: string;
  };
}

// ============================================================================
// Staking Types
// ============================================================================

/**
 * Staking pool configuration
 *
 * Maps to ontology thing type: 'staking_pool'
 *
 * @example
 * const pool: StakingPool = {
 *   tokenType: "0xabcd...ef01::agent_token::AGENT_TOKEN",
 *   totalStaked: "5000000000000000", // 5M tokens staked
 *   rewardRate: "0.15", // 15% APY
 *   lockDuration: 90 * 24 * 60 * 60 * 1000, // 90 days
 *   owner: "0x1234...5678",
 *   poolId: "0x5555...6666",
 *   status: "active",
 *   createdAt: Date.now()
 * };
 */
export interface StakingPool {
  /** Coin type being staked */
  tokenType: string;

  /** Total amount currently staked in pool */
  totalStaked: string;

  /** Annual reward rate as decimal string (e.g., "0.15" = 15% APY) */
  rewardRate: string;

  /** Lock duration in milliseconds */
  lockDuration: number;

  /** Sui address of pool owner/creator */
  owner: string;

  /** Unique identifier for this pool on Sui */
  poolId: string;

  /** Pool status */
  status: 'active' | 'paused' | 'closed';

  /** Timestamp when pool was created */
  createdAt: number;

  /** Optional reward token (if different from staked token) */
  rewardTokenType?: string;

  /** Optional pool metadata */
  metadata?: {
    /** Pool name/description */
    name?: string;

    /** Minimum stake amount */
    minStake?: string;

    /** Maximum stake amount */
    maxStake?: string;

    /** Maximum total pool size */
    poolCap?: string;
  };
}

/**
 * User's stake position in a pool
 *
 * Creates connection: staked_in (staker → staking_pool)
 *
 * @example
 * const position: StakePosition = {
 *   staker: "0x1234...5678",
 *   poolId: "0x5555...6666",
 *   amount: "1000000000000000", // 1M tokens
 *   startTime: Date.now(),
 *   lockEnd: Date.now() + 90 * 24 * 60 * 60 * 1000, // 90 days
 *   rewardsClaimed: "50000000000000", // 50K rewards claimed
 *   positionId: "0x7777...8888"
 * };
 */
export interface StakePosition {
  /** Sui address of staker */
  staker: string;

  /** Reference to staking pool */
  poolId: string;

  /** Amount staked */
  amount: string;

  /** Timestamp when stake was created */
  startTime: number;

  /** Timestamp when stake lock expires */
  lockEnd: number;

  /** Total rewards claimed so far */
  rewardsClaimed: string;

  /** Unique identifier for this position */
  positionId: string;

  /** Optional position metadata */
  metadata?: {
    /** Pending rewards (calculated, not on-chain) */
    pendingRewards?: string;

    /** Last reward calculation timestamp */
    lastRewardUpdate?: number;
  };
}

// ============================================================================
// DAO Governance Types
// ============================================================================

/**
 * DAO governance proposal
 *
 * Maps to ontology thing type: 'dao_proposal'
 *
 * @example
 * const proposal: Proposal = {
 *   id: "0xaaaa...bbbb",
 *   title: "Increase staking rewards to 20% APY",
 *   description: "Proposal to increase staking rewards...",
 *   proposer: "0x1234...5678",
 *   votesFor: "2500000000000000", // 2.5M votes
 *   votesAgainst: "500000000000000", // 500K votes
 *   votingEnd: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
 *   status: "active",
 *   actions: [
 *     {
 *       target: "0x5555...6666",
 *       function: "updateRewardRate",
 *       arguments: ["0.20"]
 *     }
 *   ],
 *   createdAt: Date.now()
 * };
 */
export interface Proposal {
  /** Unique proposal ID on Sui */
  id: string;

  /** Proposal title */
  title: string;

  /** Detailed proposal description (supports markdown) */
  description: string;

  /** Sui address of proposer */
  proposer: string;

  /** Total votes in favor */
  votesFor: string;

  /** Total votes against */
  votesAgainst: string;

  /** Timestamp when voting period ends */
  votingEnd: number;

  /** Current proposal status */
  status: 'pending' | 'active' | 'passed' | 'failed' | 'executed' | 'cancelled';

  /** Executable actions if proposal passes */
  actions: ProposalAction[];

  /** Timestamp when proposal was created */
  createdAt: number;

  /** Optional abstain votes */
  votesAbstain?: string;

  /** Optional quorum requirement */
  quorumRequired?: string;

  /** Optional approval threshold (e.g., "0.51" = 51%) */
  approvalThreshold?: string;

  /** Optional execution timestamp (when proposal was executed) */
  executedAt?: number;

  /** Optional DAO ID this proposal belongs to */
  daoId?: string;
}

/**
 * Executable action in a proposal
 *
 * @example
 * const action: ProposalAction = {
 *   target: "0x5555...6666",
 *   function: "updateRewardRate",
 *   arguments: ["0.20"],
 *   value: "0"
 * };
 */
export interface ProposalAction {
  /** Target contract address */
  target: string;

  /** Function name to call */
  function: string;

  /** Function arguments */
  arguments: string[];

  /** Optional SUI value to send with transaction */
  value?: string;

  /** Optional description of this action */
  description?: string;
}

/**
 * Vote cast on a proposal
 *
 * Creates connection: voted_on (voter → proposal)
 * Emits event: vote_cast
 *
 * @example
 * const vote: Vote = {
 *   voter: "0x1234...5678",
 *   proposalId: "0xaaaa...bbbb",
 *   choice: "for",
 *   weight: "100000000000000", // 100K voting power
 *   timestamp: Date.now(),
 *   voteId: "0xcccc...dddd"
 * };
 */
export interface Vote {
  /** Sui address of voter */
  voter: string;

  /** Reference to proposal being voted on */
  proposalId: string;

  /** Vote choice */
  choice: 'for' | 'against' | 'abstain';

  /** Voting power/weight (based on token holdings) */
  weight: string;

  /** Timestamp when vote was cast */
  timestamp: number;

  /** Unique identifier for this vote */
  voteId: string;

  /** Optional vote comment/reasoning */
  comment?: string;

  /** Optional transaction hash */
  txHash?: string;
}

// ============================================================================
// Treasury Types
// ============================================================================

/**
 * Multi-sig treasury configuration
 *
 * Maps to ontology thing type: 'treasury'
 * Creates connection: owns_treasury (dao → treasury)
 *
 * @example
 * const treasury: Treasury = {
 *   owners: ["0x1111...2222", "0x3333...4444", "0x5555...6666"],
 *   threshold: 2, // 2 of 3 signatures required
 *   balance: {
 *     "0x2::sui::SUI": "5000000000000", // 5000 SUI
 *     "0xabcd...ef01::agent_token::AGT": "1000000000000000" // 1M AGT
 *   },
 *   nonce: 42,
 *   treasuryId: "0xeeee...ffff",
 *   createdAt: Date.now()
 * };
 */
export interface Treasury {
  /** Array of owner addresses (multi-sig) */
  owners: string[];

  /** Number of signatures required to execute transaction */
  threshold: number;

  /** Treasury balances by coin type */
  balance: Record<string, string>;

  /** Nonce for transaction ordering */
  nonce: number;

  /** Unique identifier for this treasury on Sui */
  treasuryId: string;

  /** Timestamp when treasury was created */
  createdAt: number;

  /** Optional treasury metadata */
  metadata?: {
    /** Treasury name/description */
    name?: string;

    /** Associated DAO or organization */
    organizationId?: string;

    /** Treasury purpose */
    purpose?: string;
  };
}

/**
 * Pending transaction awaiting approvals
 *
 * @example
 * const pendingTx: PendingTransaction = {
 *   id: "tx_001",
 *   to: "0x9999...0000",
 *   amount: "1000000000", // 1000 SUI
 *   coinType: "0x2::sui::SUI",
 *   approvals: ["0x1111...2222", "0x3333...4444"],
 *   executed: false,
 *   expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
 *   createdAt: Date.now(),
 *   proposedBy: "0x1111...2222"
 * };
 */
export interface PendingTransaction {
  /** Unique transaction ID */
  id: string;

  /** Recipient address */
  to: string;

  /** Amount to send */
  amount: string;

  /** Coin type to send */
  coinType: string;

  /** Array of addresses that have approved */
  approvals: string[];

  /** Whether transaction has been executed */
  executed: boolean;

  /** Timestamp when transaction proposal expires */
  expiresAt: number;

  /** Timestamp when transaction was proposed */
  createdAt: number;

  /** Address of proposer */
  proposedBy: string;

  /** Optional transaction data for contract calls */
  calldata?: {
    /** Target contract */
    target: string;

    /** Function to call */
    function: string;

    /** Function arguments */
    arguments: string[];
  };

  /** Optional description */
  description?: string;

  /** Optional execution timestamp */
  executedAt?: number;

  /** Optional execution transaction hash */
  executionTxHash?: string;
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * Tagged union of all Sui-related errors
 *
 * @example
 * const error: SuiError = {
 *   _tag: "InsufficientBalance",
 *   address: "0x1234...5678",
 *   required: "1000000000",
 *   available: "500000000"
 * };
 */
export type SuiError =
  | {
      _tag: "NetworkError";
      network: SuiNetwork;
      message: string;
    }
  | {
      _tag: "TransactionFailed";
      txHash: string;
      reason: string;
    }
  | {
      _tag: "InsufficientBalance";
      address: string;
      required: string;
      available: string;
    }
  | {
      _tag: "InsufficientPermissions";
      address: string;
      requiredRole: string;
      action: string;
    }
  | {
      _tag: "TokenNotFound";
      tokenId: string;
    }
  | {
      _tag: "VestingNotStarted";
      scheduleId: string;
      cliffEnd: number;
    }
  | {
      _tag: "NothingToClaim";
      scheduleId: string;
    }
  | {
      _tag: "StillLocked";
      positionId: string;
      lockEnd: number;
    }
  | {
      _tag: "ProposalNotActive";
      proposalId: string;
      status: Proposal['status'];
    }
  | {
      _tag: "InsufficientVotingPower";
      voter: string;
      required: string;
      available: string;
    }
  | {
      _tag: "InsufficientApprovals";
      txId: string;
      required: number;
      current: number;
    }
  | {
      _tag: "TransactionExpired";
      txId: string;
      expiresAt: number;
    }
  | {
      _tag: "InvalidNetwork";
      expected: SuiNetwork;
      actual: SuiNetwork;
    }
  | {
      _tag: "ContractError";
      contractId: string;
      function: string;
      message: string;
    }
  | {
      _tag: "ValidationError";
      field: string;
      message: string;
    };

// ============================================================================
// Event Types
// ============================================================================

/**
 * Sui event type constants
 * Maps to ontology events dimension
 *
 * @example
 * const eventType = SuiEventTypes.TOKEN_CREATED;
 * // Logs to events table with type: 'token_created'
 */
export const SuiEventTypes = {
  // Token events
  TOKEN_CREATED: 'token_created',
  TOKENS_MINTED: 'tokens_minted',
  TOKENS_BURNED: 'tokens_burned',
  TOKEN_TRANSFERRED: 'token_transferred',
  TOKEN_METADATA_UPDATED: 'token_metadata_updated',

  // Vesting events
  VESTING_SCHEDULE_CREATED: 'vesting_schedule_created',
  VESTING_CLAIMED: 'vesting_claimed',
  VESTING_REVOKED: 'vesting_revoked',

  // Staking events
  STAKING_POOL_CREATED: 'staking_pool_created',
  TOKENS_STAKED: 'tokens_staked',
  TOKENS_UNSTAKED: 'tokens_unstaked',
  STAKING_REWARD_CLAIMED: 'staking_reward_claimed',
  STAKING_POOL_UPDATED: 'staking_pool_updated',

  // Governance events
  PROPOSAL_CREATED: 'proposal_created',
  VOTE_CAST: 'vote_cast',
  PROPOSAL_EXECUTED: 'proposal_executed',
  PROPOSAL_CANCELLED: 'proposal_cancelled',

  // Treasury events
  TREASURY_CREATED: 'treasury_created',
  TREASURY_DEPOSIT: 'treasury_deposit',
  TREASURY_WITHDRAWAL: 'treasury_withdrawal',
  TREASURY_TRANSACTION_PROPOSED: 'treasury_transaction_proposed',
  TREASURY_TRANSACTION_APPROVED: 'treasury_transaction_approved',
  TREASURY_TRANSACTION_EXECUTED: 'treasury_transaction_executed',
  TREASURY_OWNER_ADDED: 'treasury_owner_added',
  TREASURY_OWNER_REMOVED: 'treasury_owner_removed',

  // AI Agent events
  AI_AGENT_TOKEN_USED: 'ai_agent_token_used',
  AI_AGENT_REVENUE_DISTRIBUTED: 'ai_agent_revenue_distributed',
} as const;

/**
 * Type-safe event type
 */
export type SuiEventType = typeof SuiEventTypes[keyof typeof SuiEventTypes];

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard for TokenMetadata
 *
 * @example
 * if (isTokenMetadata(data)) {
 *   console.log(data.symbol); // TypeScript knows this is TokenMetadata
 * }
 */
export function isTokenMetadata(value: unknown): value is TokenMetadata {
  return (
    typeof value === 'object' &&
    value !== null &&
    'name' in value &&
    'symbol' in value &&
    'decimals' in value &&
    'totalSupply' in value &&
    'creator' in value &&
    'network' in value &&
    'packageId' in value &&
    'coinType' in value &&
    typeof (value as TokenMetadata).name === 'string' &&
    typeof (value as TokenMetadata).symbol === 'string' &&
    typeof (value as TokenMetadata).decimals === 'number' &&
    typeof (value as TokenMetadata).totalSupply === 'string' &&
    typeof (value as TokenMetadata).creator === 'string' &&
    ['mainnet', 'testnet', 'devnet'].includes((value as TokenMetadata).network) &&
    typeof (value as TokenMetadata).packageId === 'string' &&
    typeof (value as TokenMetadata).coinType === 'string'
  );
}

/**
 * Type guard for VestingSchedule
 *
 * @example
 * if (isVestingSchedule(data)) {
 *   console.log(data.beneficiary);
 * }
 */
export function isVestingSchedule(value: unknown): value is VestingSchedule {
  return (
    typeof value === 'object' &&
    value !== null &&
    'beneficiary' in value &&
    'totalAmount' in value &&
    'claimedAmount' in value &&
    'cliffEnd' in value &&
    'vestingEnd' in value &&
    'startTime' in value &&
    'tokenId' in value &&
    'scheduleId' in value &&
    'status' in value &&
    typeof (value as VestingSchedule).beneficiary === 'string' &&
    typeof (value as VestingSchedule).totalAmount === 'string' &&
    typeof (value as VestingSchedule).claimedAmount === 'string' &&
    typeof (value as VestingSchedule).cliffEnd === 'number' &&
    typeof (value as VestingSchedule).vestingEnd === 'number' &&
    typeof (value as VestingSchedule).startTime === 'number' &&
    typeof (value as VestingSchedule).tokenId === 'string' &&
    typeof (value as VestingSchedule).scheduleId === 'string' &&
    ['active', 'completed', 'revoked'].includes((value as VestingSchedule).status)
  );
}

/**
 * Type guard for StakingPool
 *
 * @example
 * if (isStakingPool(data)) {
 *   console.log(data.rewardRate);
 * }
 */
export function isStakingPool(value: unknown): value is StakingPool {
  return (
    typeof value === 'object' &&
    value !== null &&
    'tokenType' in value &&
    'totalStaked' in value &&
    'rewardRate' in value &&
    'lockDuration' in value &&
    'owner' in value &&
    'poolId' in value &&
    'status' in value &&
    typeof (value as StakingPool).tokenType === 'string' &&
    typeof (value as StakingPool).totalStaked === 'string' &&
    typeof (value as StakingPool).rewardRate === 'string' &&
    typeof (value as StakingPool).lockDuration === 'number' &&
    typeof (value as StakingPool).owner === 'string' &&
    typeof (value as StakingPool).poolId === 'string' &&
    ['active', 'paused', 'closed'].includes((value as StakingPool).status)
  );
}

/**
 * Type guard for StakePosition
 *
 * @example
 * if (isStakePosition(data)) {
 *   console.log(data.amount);
 * }
 */
export function isStakePosition(value: unknown): value is StakePosition {
  return (
    typeof value === 'object' &&
    value !== null &&
    'staker' in value &&
    'poolId' in value &&
    'amount' in value &&
    'startTime' in value &&
    'lockEnd' in value &&
    'rewardsClaimed' in value &&
    'positionId' in value &&
    typeof (value as StakePosition).staker === 'string' &&
    typeof (value as StakePosition).poolId === 'string' &&
    typeof (value as StakePosition).amount === 'string' &&
    typeof (value as StakePosition).startTime === 'number' &&
    typeof (value as StakePosition).lockEnd === 'number' &&
    typeof (value as StakePosition).rewardsClaimed === 'string' &&
    typeof (value as StakePosition).positionId === 'string'
  );
}

/**
 * Type guard for Proposal
 *
 * @example
 * if (isProposal(data)) {
 *   console.log(data.title);
 * }
 */
export function isProposal(value: unknown): value is Proposal {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'title' in value &&
    'description' in value &&
    'proposer' in value &&
    'votesFor' in value &&
    'votesAgainst' in value &&
    'votingEnd' in value &&
    'status' in value &&
    'actions' in value &&
    typeof (value as Proposal).id === 'string' &&
    typeof (value as Proposal).title === 'string' &&
    typeof (value as Proposal).description === 'string' &&
    typeof (value as Proposal).proposer === 'string' &&
    typeof (value as Proposal).votesFor === 'string' &&
    typeof (value as Proposal).votesAgainst === 'string' &&
    typeof (value as Proposal).votingEnd === 'number' &&
    ['pending', 'active', 'passed', 'failed', 'executed', 'cancelled'].includes(
      (value as Proposal).status
    ) &&
    Array.isArray((value as Proposal).actions)
  );
}

/**
 * Type guard for Vote
 *
 * @example
 * if (isVote(data)) {
 *   console.log(data.choice);
 * }
 */
export function isVote(value: unknown): value is Vote {
  return (
    typeof value === 'object' &&
    value !== null &&
    'voter' in value &&
    'proposalId' in value &&
    'choice' in value &&
    'weight' in value &&
    'timestamp' in value &&
    'voteId' in value &&
    typeof (value as Vote).voter === 'string' &&
    typeof (value as Vote).proposalId === 'string' &&
    ['for', 'against', 'abstain'].includes((value as Vote).choice) &&
    typeof (value as Vote).weight === 'string' &&
    typeof (value as Vote).timestamp === 'number' &&
    typeof (value as Vote).voteId === 'string'
  );
}

/**
 * Type guard for Treasury
 *
 * @example
 * if (isTreasury(data)) {
 *   console.log(data.owners);
 * }
 */
export function isTreasury(value: unknown): value is Treasury {
  return (
    typeof value === 'object' &&
    value !== null &&
    'owners' in value &&
    'threshold' in value &&
    'balance' in value &&
    'nonce' in value &&
    'treasuryId' in value &&
    Array.isArray((value as Treasury).owners) &&
    typeof (value as Treasury).threshold === 'number' &&
    typeof (value as Treasury).balance === 'object' &&
    typeof (value as Treasury).nonce === 'number' &&
    typeof (value as Treasury).treasuryId === 'string'
  );
}

/**
 * Type guard for PendingTransaction
 *
 * @example
 * if (isPendingTransaction(data)) {
 *   console.log(data.approvals.length);
 * }
 */
export function isPendingTransaction(value: unknown): value is PendingTransaction {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'to' in value &&
    'amount' in value &&
    'coinType' in value &&
    'approvals' in value &&
    'executed' in value &&
    'expiresAt' in value &&
    'createdAt' in value &&
    'proposedBy' in value &&
    typeof (value as PendingTransaction).id === 'string' &&
    typeof (value as PendingTransaction).to === 'string' &&
    typeof (value as PendingTransaction).amount === 'string' &&
    typeof (value as PendingTransaction).coinType === 'string' &&
    Array.isArray((value as PendingTransaction).approvals) &&
    typeof (value as PendingTransaction).executed === 'boolean' &&
    typeof (value as PendingTransaction).expiresAt === 'number' &&
    typeof (value as PendingTransaction).createdAt === 'number' &&
    typeof (value as PendingTransaction).proposedBy === 'string'
  );
}

/**
 * Type guard for SuiError
 *
 * @example
 * if (isSuiError(error)) {
 *   switch (error._tag) {
 *     case "InsufficientBalance":
 *       console.log(`Need ${error.required}, have ${error.available}`);
 *       break;
 *   }
 * }
 */
export function isSuiError(value: unknown): value is SuiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    '_tag' in value &&
    typeof (value as SuiError)._tag === 'string'
  );
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Helper type for Sui addresses
 *
 * @example
 * const address: SuiAddress = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
 */
export type SuiAddress = string;

/**
 * Helper type for transaction digests
 *
 * @example
 * const txDigest: TransactionDigest = "9vKHQ8xKzKzKzKzKzKzKzKzKzKzKzKzKzKzKzKzKzKz";
 */
export type TransactionDigest = string;

/**
 * Helper type for coin amounts (always strings to handle large numbers)
 *
 * @example
 * const amount: CoinAmount = "1000000000000000"; // 1M tokens with 9 decimals
 */
export type CoinAmount = string;

/**
 * Helper type for percentage values (as decimal strings)
 *
 * @example
 * const apy: Percentage = "0.15"; // 15%
 */
export type Percentage = string;

/**
 * Sui transaction options
 *
 * @example
 * const options: SuiTransactionOptions = {
 *   gasBudget: 10000000,
 *   sender: "0x1234...5678"
 * };
 */
export interface SuiTransactionOptions {
  /** Gas budget for transaction */
  gasBudget?: number;

  /** Sender address */
  sender?: SuiAddress;

  /** Optional sponsor address (for sponsored transactions) */
  sponsor?: SuiAddress;
}
