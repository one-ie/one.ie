/**
 * Sui Launchpad Staking Components
 *
 * A complete suite of staking components for Sui blockchain tokens:
 * - StakingPoolCard: Display individual pool information
 * - StakeTokensModal: Modal for staking tokens with lock duration selection
 * - UnstakeTokensModal: Modal for unstaking with penalty calculations
 * - StakingDashboard: Overview of all user stakes across pools
 *
 * Features:
 * - APY calculations with lock duration multipliers
 * - Balance validation and max amount helpers
 * - Estimated rewards calculator
 * - Lock period warnings and penalty display
 * - Claim rewards functionality
 * - Pool performance comparison
 *
 * Integration:
 * - Uses Convex for backend queries/mutations
 * - shadcn/ui components for consistent UI
 * - TypeScript for type safety
 * - React hooks for state management
 *
 * Usage:
 * ```tsx
 * import { StakingPoolCard, StakingDashboard } from '@/components/sui/launchpad/staking';
 *
 * // Display a single pool
 * <StakingPoolCard
 *   pool={pool}
 *   onStakeSuccess={() => refetch()}
 * />
 *
 * // Display all user stakes
 * <StakingDashboard
 *   userStakes={stakes}
 *   onClaimAll={() => refetchAll()}
 * />
 * ```
 */

export { StakingPoolCard } from "./StakingPoolCard";
export { StakeTokensModal } from "./StakeTokensModal";
export { UnstakeTokensModal } from "./UnstakeTokensModal";
export { StakingDashboard } from "./StakingDashboard";
