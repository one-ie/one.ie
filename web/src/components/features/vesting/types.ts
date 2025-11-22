/**
 * Vesting Dashboard Types
 *
 * Type definitions for vesting schedules, claims, and milestones.
 */

export interface VestingSchedule {
	_id: string;
	beneficiary: string;
	tokenId: string;
	tokenSymbol: string;
	totalAmount: number;
	claimedAmount: number;
	startTime: number;
	cliffDuration: number;
	vestingDuration: number;
	status: 'active' | 'completed' | 'revoked';
	createdAt: number;
}

export interface ClaimRecord {
	_id: string;
	scheduleId: string;
	amount: number;
	timestamp: number;
	txHash?: string;
	status: 'pending' | 'completed' | 'failed';
}

export interface VestingMilestone {
	date: number;
	amount: number;
	percentage: number;
	claimed: boolean;
	isCliff?: boolean;
}
