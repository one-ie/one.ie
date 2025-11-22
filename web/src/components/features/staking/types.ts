/**
 * Staking Interface Types
 *
 * Type definitions for staking pools, user positions, and rewards
 */

export interface StakingPool {
  _id: string;
  name: string;
  tokenSymbol: string;
  tokenAddress: string;
  totalValueLocked: number;
  baseApy: number;
  maxApy: number;
  participants: number;
  minStake: number;
  maxStake?: number;
  lockPeriods: LockPeriod[];
  status: 'active' | 'paused' | 'ended';
  startDate: number;
  endDate?: number;
}

export interface LockPeriod {
  duration: number; // in days
  apyBonus: number; // percentage bonus (e.g., 5 = +5%)
  penaltyRate?: number; // early withdrawal penalty percentage
}

export interface UserStake {
  _id: string;
  poolId: string;
  userId: string;
  amount: number;
  lockDuration: number;
  startTime: number;
  endTime: number;
  rewards: number;
  status: 'active' | 'unstaked' | 'withdrawn';
}

export interface PendingRewards {
  poolId: string;
  amount: number;
  lastUpdated: number;
}

export interface StakeFormData {
  amount: number;
  lockDuration: number;
}
