/**
 * DAO Governance Components
 *
 * Complete suite of components for decentralized governance:
 * - ProposalCreator: Create new governance proposals
 * - ProposalCard: Display individual proposals with voting stats
 * - VoteModal: Cast votes on proposals
 * - DAODashboard: Complete DAO governance interface
 *
 * @example
 * ```tsx
 * import { DAODashboard } from '@/components/sui/launchpad/dao';
 *
 * export function GovernancePage() {
 *   return <DAODashboard userAddress="0x..." />;
 * }
 * ```
 */

export { ProposalCreator } from './ProposalCreator';
export { ProposalCard } from './ProposalCard';
export { VoteModal } from './VoteModal';
export { DAODashboard } from './DAODashboard';

// Re-export types for convenience
export type {
	Proposal,
	ProposalStatus,
	ProposalType,
	VoteChoice,
	ContractAction,
	DAOStats,
	DAOState,
} from '@/stores/dao';
