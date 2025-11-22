/**
 * PoolSelector Component
 *
 * Browse and filter all available staking pools
 */

import { useState } from 'react';
import type { StakingPool, UserStake } from './types';
import { StakingPoolCard } from './StakingPoolCard';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface PoolSelectorProps {
  pools: StakingPool[];
  userStakes?: UserStake[];
  onSelectPool?: (poolId: string) => void;
  selectedPoolId?: string;
}

export function PoolSelector({
  pools,
  userStakes = [],
  onSelectPool,
  selectedPoolId,
}: PoolSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'ended'>('all');
  const [sortBy, setSortBy] = useState<'apy' | 'tvl' | 'participants'>('apy');

  const getUserStakeForPool = (poolId: string) => {
    return userStakes.find(stake => stake.poolId === poolId && stake.status === 'active');
  };

  // Filter pools
  const filteredPools = pools.filter(pool => {
    const matchesSearch = pool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pool.tokenSymbol.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || pool.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Sort pools
  const sortedPools = [...filteredPools].sort((a, b) => {
    switch (sortBy) {
      case 'apy':
        return b.maxApy - a.maxApy;
      case 'tvl':
        return b.totalValueLocked - a.totalValueLocked;
      case 'participants':
        return b.participants - a.participants;
      default:
        return 0;
    }
  });

  const activePoolsCount = pools.filter(p => p.status === 'active').length;
  const totalTVL = pools.reduce((sum, p) => sum + p.totalValueLocked, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground mb-1">Active Pools</p>
          <p className="text-2xl font-bold">{activePoolsCount}</p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Value Locked</p>
          <p className="text-2xl font-bold text-primary">{formatCurrency(totalTVL)}</p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground mb-1">Your Stakes</p>
          <p className="text-2xl font-bold">{userStakes.filter(s => s.status === 'active').length}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Search pools by name or token..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Pools</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="ended">Ended</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apy">Highest APY</SelectItem>
            <SelectItem value="tvl">Highest TVL</SelectItem>
            <SelectItem value="participants">Most Participants</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {sortedPools.length} of {pools.length} pools
        </p>
        {userStakes.filter(s => s.status === 'active').length > 0 && (
          <Badge variant="secondary">
            You have active stakes in {new Set(userStakes.filter(s => s.status === 'active').map(s => s.poolId)).size} pool(s)
          </Badge>
        )}
      </div>

      {/* Pool Grid */}
      {sortedPools.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No pools found matching your criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedPools.map(pool => (
            <StakingPoolCard
              key={pool._id}
              pool={pool}
              userStake={getUserStakeForPool(pool._id)}
              onSelect={onSelectPool}
              selected={selectedPoolId === pool._id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
