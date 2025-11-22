/**
 * StakingPoolCard Component
 *
 * Displays staking pool statistics including TVL, APY, participants, and user's stake
 */

import type { StakingPool, UserStake } from './types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface StakingPoolCardProps {
  pool: StakingPool;
  userStake?: UserStake;
  onSelect?: (poolId: string) => void;
  selected?: boolean;
}

export function StakingPoolCard({ pool, userStake, onSelect, selected = false }: StakingPoolCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const getStatusColor = (status: StakingPool['status']) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'paused':
        return 'secondary';
      case 'ended':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <Card
      className={`transition-all hover:shadow-lg ${
        selected ? 'ring-2 ring-primary' : ''
      }`}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{pool.name}</CardTitle>
            <CardDescription className="mt-1">
              Stake {pool.tokenSymbol} • Earn Rewards
            </CardDescription>
          </div>
          <Badge variant={getStatusColor(pool.status)}>
            {pool.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Pool Statistics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Total Value Locked</p>
            <p className="text-lg font-bold">{formatCurrency(pool.totalValueLocked)}</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">APY Range</p>
            <p className="text-lg font-bold text-primary">
              {pool.baseApy}% - {pool.maxApy}%
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Participants</p>
            <p className="text-lg font-bold">{formatNumber(pool.participants)}</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Min Stake</p>
            <p className="text-lg font-bold">
              {formatNumber(pool.minStake)} {pool.tokenSymbol}
            </p>
          </div>
        </div>

        {/* User Stake (if exists) */}
        {userStake && userStake.status === 'active' && (
          <div className="rounded-lg bg-secondary/50 p-3 space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Your Stake</p>
            <p className="text-xl font-bold text-primary">
              {formatNumber(userStake.amount)} {pool.tokenSymbol}
            </p>
            <p className="text-xs text-muted-foreground">
              Locked for {userStake.lockDuration} days
            </p>
          </div>
        )}

        {/* Action Button */}
        {onSelect && pool.status === 'active' && (
          <Button
            className="w-full"
            onClick={() => onSelect(pool._id)}
            variant={selected ? 'secondary' : 'default'}
          >
            {selected ? 'Selected' : userStake ? 'Manage Stake' : 'Stake Now'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
