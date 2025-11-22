/**
 * RewardsDisplay Component
 *
 * Shows pending rewards with claim button
 */

import { useState } from 'react';
import type { PendingRewards, StakingPool } from './types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface RewardsDisplayProps {
  rewards: PendingRewards[];
  pools: StakingPool[];
  onClaim?: (poolId: string) => Promise<void>;
  loading?: boolean;
}

export function RewardsDisplay({ rewards, pools, onClaim, loading = false }: RewardsDisplayProps) {
  const [claiming, setClaiming] = useState<string | null>(null);

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(value);
  };

  const getPoolSymbol = (poolId: string) => {
    const pool = pools.find(p => p._id === poolId);
    return pool?.tokenSymbol || 'TOKEN';
  };

  const getTotalRewardsValue = () => {
    // This would typically convert to USD based on token prices
    return rewards.reduce((sum, r) => sum + r.amount, 0);
  };

  const handleClaim = async (poolId: string) => {
    if (!onClaim) return;

    setClaiming(poolId);
    try {
      await onClaim(poolId);
    } finally {
      setClaiming(null);
    }
  };

  if (rewards.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Rewards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No pending rewards</p>
            <p className="text-sm text-muted-foreground mt-2">
              Stake tokens to start earning rewards
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Pending Rewards</CardTitle>
          <Badge variant="secondary">
            {rewards.length} Pool{rewards.length > 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Total Rewards Summary */}
        <div className="rounded-lg bg-primary/10 dark:bg-primary/20 p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Pending</p>
          <p className="text-3xl font-bold text-primary">
            {formatNumber(getTotalRewardsValue())}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Across {rewards.length} pool{rewards.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Individual Pool Rewards */}
        <div className="space-y-3">
          <p className="text-sm font-medium">Claimable by Pool</p>
          {rewards.map((reward) => (
            <div
              key={reward.poolId}
              className="flex items-center justify-between p-3 rounded-lg border bg-card"
            >
              <div>
                <p className="font-medium">
                  {formatNumber(reward.amount)} {getPoolSymbol(reward.poolId)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Updated {new Date(reward.lastUpdated).toLocaleDateString()}
                </p>
              </div>

              {onClaim && (
                <Button
                  size="sm"
                  onClick={() => handleClaim(reward.poolId)}
                  disabled={claiming !== null || loading}
                >
                  {claiming === reward.poolId ? 'Claiming...' : 'Claim'}
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Claim All Button */}
        {onClaim && rewards.length > 1 && (
          <Button
            className="w-full"
            variant="default"
            onClick={async () => {
              for (const reward of rewards) {
                await handleClaim(reward.poolId);
              }
            }}
            disabled={claiming !== null || loading}
          >
            {claiming ? 'Claiming...' : 'Claim All Rewards'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
