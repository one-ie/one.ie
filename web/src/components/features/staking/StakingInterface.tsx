/**
 * StakingInterface Component
 *
 * Complete staking interface with pool stats, stake/unstake, rewards, and position management
 *
 * Features:
 * - Pool Stats: TVL, APY, participants, your stake
 * - Stake Form: Amount input, lock duration selector, APY preview
 * - Your Position: Staked amount, rewards earned, time remaining
 * - Claim Rewards: Button with pending rewards display
 * - Unstake: Unstake button with penalty warning (if applicable)
 * - Pool List: Browse all staking pools
 *
 * Integration:
 * - Convex queries: api.staking.getPool, api.staking.getUserStake, api.staking.getPendingRewards
 * - Convex mutations: api.staking.stake, api.staking.unstake, api.staking.claimRewards
 * - Real-time APY calculations
 *
 * Usage:
 * ```tsx
 * <StakingInterface
 *   userId={userId}
 *   client:load
 * />
 * ```
 */

import { useState } from 'react';
import type { StakingPool, UserStake, PendingRewards, StakeFormData } from './types';
import { StakingPoolCard } from './StakingPoolCard';
import { StakeForm } from './StakeForm';
import { UnstakeButton } from './UnstakeButton';
import { RewardsDisplay } from './RewardsDisplay';
import { PoolSelector } from './PoolSelector';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface StakingInterfaceProps {
  // User identification
  userId: string;

  // Optional initial data (can be fetched from Convex)
  initialPools?: StakingPool[];
  initialStakes?: UserStake[];
  initialRewards?: PendingRewards[];
  initialBalance?: number;

  // Callbacks for Convex integration
  onStake?: (poolId: string, data: StakeFormData) => Promise<void>;
  onUnstake?: (stakeId: string) => Promise<void>;
  onClaimRewards?: (poolId: string) => Promise<void>;

  // Loading states
  loading?: boolean;
}

export function StakingInterface({
  userId,
  initialPools = [],
  initialStakes = [],
  initialRewards = [],
  initialBalance = 0,
  onStake,
  onUnstake,
  onClaimRewards,
  loading = false,
}: StakingInterfaceProps) {
  const [selectedPoolId, setSelectedPoolId] = useState<string | null>(null);
  const [view, setView] = useState<'overview' | 'browse' | 'stake' | 'manage'>('overview');

  // In a real implementation, these would come from Convex useQuery
  const [pools] = useState<StakingPool[]>(initialPools);
  const [userStakes] = useState<UserStake[]>(initialStakes);
  const [pendingRewards] = useState<PendingRewards[]>(initialRewards);
  const [balance] = useState(initialBalance);

  const selectedPool = selectedPoolId ? pools.find(p => p._id === selectedPoolId) : null;
  const selectedStake = selectedPoolId
    ? userStakes.find(s => s.poolId === selectedPoolId && s.status === 'active')
    : null;

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  };

  const totalStaked = userStakes
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + s.amount, 0);

  const totalRewards = userStakes
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + s.rewards, 0);

  const handleStake = async (data: StakeFormData) => {
    if (!selectedPoolId || !onStake) return;
    await onStake(selectedPoolId, data);
    setView('manage');
  };

  const handleSelectPool = (poolId: string) => {
    setSelectedPoolId(poolId);
    const hasStake = userStakes.some(s => s.poolId === poolId && s.status === 'active');
    setView(hasStake ? 'manage' : 'stake');
  };

  return (
    <div className="space-y-6">
      {/* Header with View Navigation */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Staking</h1>
          <p className="text-muted-foreground mt-1">
            Stake tokens to earn rewards
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant={view === 'overview' ? 'default' : 'outline'}
            onClick={() => setView('overview')}
          >
            Overview
          </Button>
          <Button
            variant={view === 'browse' ? 'default' : 'outline'}
            onClick={() => setView('browse')}
          >
            Browse Pools
          </Button>
        </div>
      </div>

      {/* Overview View */}
      {view === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Stats and Active Stakes */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-1">Total Staked</p>
                  <p className="text-2xl font-bold">{formatNumber(totalStaked)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Across {userStakes.filter(s => s.status === 'active').length} pool(s)
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-1">Total Rewards</p>
                  <p className="text-2xl font-bold text-primary">{formatNumber(totalRewards)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Earned rewards</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-1">Available</p>
                  <p className="text-2xl font-bold">{formatNumber(balance)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Available to stake</p>
                </CardContent>
              </Card>
            </div>

            {/* Active Stakes */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Your Active Stakes</CardTitle>
                  <Badge variant="secondary">
                    {userStakes.filter(s => s.status === 'active').length} Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {userStakes.filter(s => s.status === 'active').length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No active stakes</p>
                    <Button onClick={() => setView('browse')}>
                      Browse Staking Pools
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userStakes
                      .filter(s => s.status === 'active')
                      .map(stake => {
                        const pool = pools.find(p => p._id === stake.poolId);
                        if (!pool) return null;

                        const timeRemaining = stake.endTime - Date.now();
                        const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));
                        const isUnlocked = timeRemaining <= 0;

                        return (
                          <div
                            key={stake._id}
                            className="rounded-lg border bg-card p-4 space-y-3"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium">{pool.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatNumber(stake.amount)} {pool.tokenSymbol}
                                </p>
                              </div>
                              <Badge variant={isUnlocked ? 'default' : 'secondary'}>
                                {isUnlocked ? 'Unlocked' : `${daysRemaining}d remaining`}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-muted-foreground">Rewards</p>
                                <p className="font-medium text-primary">
                                  +{formatNumber(stake.rewards)} {pool.tokenSymbol}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Lock Period</p>
                                <p className="font-medium">{stake.lockDuration} days</p>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => handleSelectPool(pool._id)}
                              >
                                Manage
                              </Button>
                              <UnstakeButton
                                stake={stake}
                                pool={pool}
                                onUnstake={onUnstake}
                                loading={loading}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Rewards */}
          <div>
            <RewardsDisplay
              rewards={pendingRewards}
              pools={pools}
              onClaim={onClaimRewards}
              loading={loading}
            />
          </div>
        </div>
      )}

      {/* Browse Pools View */}
      {view === 'browse' && (
        <PoolSelector
          pools={pools}
          userStakes={userStakes}
          onSelectPool={handleSelectPool}
          selectedPoolId={selectedPoolId || undefined}
        />
      )}

      {/* Stake View */}
      {view === 'stake' && selectedPool && (
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => setView('browse')}
            className="mb-4"
          >
            ← Back to Pools
          </Button>

          <div className="grid gap-6">
            <StakingPoolCard pool={selectedPool} userStake={selectedStake} />
            <StakeForm
              pool={selectedPool}
              balance={balance}
              onStake={handleStake}
              loading={loading}
            />
          </div>
        </div>
      )}

      {/* Manage Stake View */}
      {view === 'manage' && selectedPool && selectedStake && (
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => setView('overview')}
            className="mb-4"
          >
            ← Back to Overview
          </Button>

          <div className="grid gap-6">
            <StakingPoolCard pool={selectedPool} userStake={selectedStake} />

            <Card>
              <CardHeader>
                <CardTitle>Your Position</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Staked Amount</p>
                    <p className="text-xl font-bold">
                      {formatNumber(selectedStake.amount)} {selectedPool.tokenSymbol}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Rewards Earned</p>
                    <p className="text-xl font-bold text-primary">
                      +{formatNumber(selectedStake.rewards)} {selectedPool.tokenSymbol}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Time Remaining</p>
                    <p className="text-xl font-bold">
                      {Math.max(0, Math.ceil((selectedStake.endTime - Date.now()) / (1000 * 60 * 60 * 24)))} days
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Lock Duration</p>
                    <p className="text-xl font-bold">{selectedStake.lockDuration} days</p>
                  </div>
                </div>

                <UnstakeButton
                  stake={selectedStake}
                  pool={selectedPool}
                  onUnstake={onUnstake}
                  loading={loading}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
