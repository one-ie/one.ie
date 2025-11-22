/**
 * DAO Governance State Management
 * Uses Nanostores for lightweight reactive state
 * Persists to localStorage for data persistence across sessions
 */

import { atom, computed } from "nanostores";

export type ProposalStatus = "active" | "passed" | "failed" | "executed" | "cancelled";
export type ProposalType = "parameter_change" | "treasury_spend" | "custom";
export type VoteChoice = "for" | "against" | "abstain";

export interface ContractAction {
	id: string;
	target: string;
	function: string;
	args: string[];
	value?: string;
}

export interface Proposal {
	id: string;
	title: string;
	description: string;
	type: ProposalType;
	proposer: string;
	status: ProposalStatus;
	actions: ContractAction[];

	// Voting configuration
	votingPeriodEnd: number; // timestamp
	quorum: number; // percentage (0-100)
	threshold: number; // percentage (0-100)

	// Vote counts
	votesFor: number;
	votesAgainst: number;
	votesAbstain: number;
	totalVotingPower: number;

	// User's vote (if any)
	userVote?: {
		choice: VoteChoice;
		votingPower: number;
		comment?: string;
	};

	createdAt: number;
	executedAt?: number;
}

export interface DAOStats {
	totalMembers: number;
	totalProposals: number;
	activeProposals: number;
	treasuryBalance: string;
	governanceTokenSupply: string;
	userVotingPower: number;
}

export interface DAOState {
	proposals: Proposal[];
	stats: DAOStats;
	userAddress?: string;
	updatedAt: number;
}

// Load DAO state from localStorage
const loadDAOState = (): DAOState => {
	if (typeof window === "undefined") {
		return {
			proposals: [],
			stats: {
				totalMembers: 0,
				totalProposals: 0,
				activeProposals: 0,
				treasuryBalance: "0",
				governanceTokenSupply: "0",
				userVotingPower: 0,
			},
			updatedAt: Date.now(),
		};
	}

	try {
		const stored = localStorage.getItem("dao-state");
		if (stored) {
			const state = JSON.parse(stored) as DAOState;
			return state;
		}
	} catch (error) {
		console.error("Failed to load DAO state from localStorage:", error);
	}

	return {
		proposals: [],
		stats: {
			totalMembers: 0,
			totalProposals: 0,
			activeProposals: 0,
			treasuryBalance: "0",
			governanceTokenSupply: "0",
			userVotingPower: 0,
		},
		updatedAt: Date.now(),
	};
};

// Save DAO state to localStorage
const saveDAOState = (state: DAOState): void => {
	if (typeof window === "undefined") return;

	try {
		localStorage.setItem("dao-state", JSON.stringify(state));
	} catch (error) {
		console.error("Failed to save DAO state to localStorage:", error);
	}
};

// DAO state atom
export const $daoState = atom<DAOState>(loadDAOState());

// Modal state for voting
export const $voteModalOpen = atom<boolean>(false);
export const $selectedProposal = atom<Proposal | null>(null);

// Computed values
export const $activeProposals = computed($daoState, (state) =>
	state.proposals.filter((p) => p.status === "active")
);

export const $userHasVotingPower = computed(
	$daoState,
	(state) => state.stats.userVotingPower > 0
);

// DAO actions
export const daoActions = {
	/**
	 * Set user address
	 */
	setUserAddress: (address: string) => {
		const state = $daoState.get();
		const newState = {
			...state,
			userAddress: address,
			updatedAt: Date.now(),
		};
		$daoState.set(newState);
		saveDAOState(newState);
	},

	/**
	 * Update DAO stats
	 */
	updateStats: (stats: Partial<DAOStats>) => {
		const state = $daoState.get();
		const newState = {
			...state,
			stats: { ...state.stats, ...stats },
			updatedAt: Date.now(),
		};
		$daoState.set(newState);
		saveDAOState(newState);
	},

	/**
	 * Create a new proposal
	 */
	createProposal: (proposal: Omit<Proposal, "id" | "createdAt" | "status" | "votesFor" | "votesAgainst" | "votesAbstain">) => {
		const state = $daoState.get();

		const newProposal: Proposal = {
			...proposal,
			id: `proposal-${Date.now()}`,
			status: "active",
			votesFor: 0,
			votesAgainst: 0,
			votesAbstain: 0,
			createdAt: Date.now(),
		};

		const newState = {
			...state,
			proposals: [newProposal, ...state.proposals],
			stats: {
				...state.stats,
				totalProposals: state.stats.totalProposals + 1,
				activeProposals: state.stats.activeProposals + 1,
			},
			updatedAt: Date.now(),
		};

		$daoState.set(newState);
		saveDAOState(newState);

		return newProposal;
	},

	/**
	 * Cast a vote on a proposal
	 */
	castVote: (proposalId: string, choice: VoteChoice, votingPower: number, comment?: string) => {
		const state = $daoState.get();

		const proposals = state.proposals.map((p) => {
			if (p.id !== proposalId) return p;

			// Remove previous vote if exists
			let votesFor = p.votesFor;
			let votesAgainst = p.votesAgainst;
			let votesAbstain = p.votesAbstain;

			if (p.userVote) {
				if (p.userVote.choice === "for") votesFor -= p.userVote.votingPower;
				if (p.userVote.choice === "against") votesAgainst -= p.userVote.votingPower;
				if (p.userVote.choice === "abstain") votesAbstain -= p.userVote.votingPower;
			}

			// Add new vote
			if (choice === "for") votesFor += votingPower;
			if (choice === "against") votesAgainst += votingPower;
			if (choice === "abstain") votesAbstain += votingPower;

			return {
				...p,
				votesFor,
				votesAgainst,
				votesAbstain,
				userVote: {
					choice,
					votingPower,
					comment,
				},
			};
		});

		const newState = {
			...state,
			proposals,
			updatedAt: Date.now(),
		};

		$daoState.set(newState);
		saveDAOState(newState);
	},

	/**
	 * Update proposal status
	 */
	updateProposalStatus: (proposalId: string, status: ProposalStatus) => {
		const state = $daoState.get();

		const proposals = state.proposals.map((p) => {
			if (p.id !== proposalId) return p;

			return {
				...p,
				status,
				executedAt: status === "executed" ? Date.now() : p.executedAt,
			};
		});

		// Update active proposals count
		const activeCount = proposals.filter((p) => p.status === "active").length;

		const newState = {
			...state,
			proposals,
			stats: {
				...state.stats,
				activeProposals: activeCount,
			},
			updatedAt: Date.now(),
		};

		$daoState.set(newState);
		saveDAOState(newState);
	},

	/**
	 * Open vote modal for a proposal
	 */
	openVoteModal: (proposal: Proposal) => {
		$selectedProposal.set(proposal);
		$voteModalOpen.set(true);
	},

	/**
	 * Close vote modal
	 */
	closeVoteModal: () => {
		$voteModalOpen.set(false);
		setTimeout(() => $selectedProposal.set(null), 300); // Delay to allow animation
	},

	/**
	 * Add sample proposals (for demo)
	 */
	addSampleProposals: () => {
		const state = $daoState.get();

		const sampleProposals: Proposal[] = [
			{
				id: "proposal-1",
				title: "Increase Staking Rewards by 10%",
				description: "# Proposal: Increase Staking Rewards\n\nThis proposal aims to increase staking rewards from 5% APY to 15% APY to incentivize more token holders to participate in network security.\n\n## Rationale\n- Current rewards are below industry average\n- Increased participation will improve network security\n- Treasury has sufficient funds to support higher rewards\n\n## Impact\n- Estimated cost: 100,000 tokens per year\n- Expected increase in staking participation: 30%",
				type: "parameter_change",
				proposer: "0x1234...5678",
				status: "active",
				actions: [
					{
						id: "action-1",
						target: "0xStakingContract",
						function: "setRewardRate",
						args: ["1500"], // 15%
					},
				],
				votingPeriodEnd: Date.now() + 5 * 24 * 60 * 60 * 1000, // 5 days
				quorum: 40,
				threshold: 60,
				votesFor: 1250000,
				votesAgainst: 450000,
				votesAbstain: 100000,
				totalVotingPower: 2000000,
				createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
			},
			{
				id: "proposal-2",
				title: "Allocate 50,000 SUI to Marketing",
				description: "# Marketing Budget Proposal\n\nRequest to allocate 50,000 SUI from the treasury for Q1 2025 marketing initiatives.\n\n## Budget Breakdown\n- Social media campaigns: 20,000 SUI\n- Partnership announcements: 15,000 SUI\n- Community events: 10,000 SUI\n- Content creation: 5,000 SUI\n\n## Expected Outcomes\n- 50% increase in social media engagement\n- 3-5 new strategic partnerships\n- 10+ community events worldwide",
				type: "treasury_spend",
				proposer: "0xABCD...EF01",
				status: "active",
				actions: [
					{
						id: "action-2",
						target: "0xTreasuryContract",
						function: "transfer",
						args: ["0xMarketingWallet", "50000000000000"], // 50k SUI
					},
				],
				votingPeriodEnd: Date.now() + 3 * 24 * 60 * 60 * 1000, // 3 days
				quorum: 30,
				threshold: 50,
				votesFor: 890000,
				votesAgainst: 620000,
				votesAbstain: 50000,
				totalVotingPower: 2000000,
				createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
			},
			{
				id: "proposal-3",
				title: "Implement Auto-Compounding for Staking",
				description: "# Auto-Compounding Feature\n\nProposal to add automatic reward compounding for stakers.\n\n## Features\n- Automatic reinvestment of staking rewards\n- Optional opt-in/opt-out mechanism\n- Gas-efficient batch processing\n\n## Benefits\n- Improved UX for long-term stakers\n- Higher effective APY through compounding\n- Reduced manual transaction overhead",
				type: "custom",
				proposer: "0x9876...5432",
				status: "passed",
				actions: [
					{
						id: "action-3",
						target: "0xStakingContract",
						function: "enableAutoCompound",
						args: ["true"],
					},
				],
				votingPeriodEnd: Date.now() - 1 * 24 * 60 * 60 * 1000, // Ended 1 day ago
				quorum: 40,
				threshold: 66,
				votesFor: 1450000,
				votesAgainst: 350000,
				votesAbstain: 200000,
				totalVotingPower: 2000000,
				createdAt: Date.now() - 8 * 24 * 60 * 60 * 1000, // 8 days ago
			},
		];

		const newState = {
			...state,
			proposals: [...sampleProposals, ...state.proposals],
			stats: {
				...state.stats,
				totalMembers: 1247,
				totalProposals: sampleProposals.length + state.proposals.length,
				activeProposals: sampleProposals.filter((p) => p.status === "active").length,
				treasuryBalance: "1250000",
				governanceTokenSupply: "10000000",
				userVotingPower: 5000,
			},
			updatedAt: Date.now(),
		};

		$daoState.set(newState);
		saveDAOState(newState);
	},
};
