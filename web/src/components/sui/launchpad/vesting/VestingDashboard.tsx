/**
 * VestingDashboard Component
 *
 * Displays all vesting schedules for a user with:
 * - Filter by active/completed/revoked
 * - Total vested and claimed amounts
 * - Upcoming claims calendar
 * - Batch claim functionality
 *
 * Used in: User dashboard, vesting management pages
 */

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { VestingScheduleCard } from './VestingScheduleCard';
import { Coins, TrendingUp, Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface VestingSchedule {
  id: string;
  beneficiary: string;
  tokenSymbol: string;
  totalAmount: number;
  claimedAmount: number;
  claimableAmount: number;
  startTime: number;
  cliffDuration: number;
  vestingDuration: number;
  status: 'active' | 'completed' | 'revoked';
  lastClaimTime?: number;
  cliffEndTime: number;
  endTime: number;
}

interface VestingDashboardProps {
  schedules: VestingSchedule[];
  onClaim?: (scheduleId: string) => Promise<void>;
  onBatchClaim?: (scheduleIds: string[]) => Promise<void>;
  isLoading?: boolean;
}

type FilterType = 'all' | 'active' | 'completed' | 'revoked';

export function VestingDashboard({
  schedules,
  onClaim,
  onBatchClaim,
  isLoading = false,
}: VestingDashboardProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [isBatchClaiming, setIsBatchClaiming] = useState(false);

  // Filter schedules
  const filteredSchedules = useMemo(() => {
    if (filter === 'all') return schedules;
    return schedules.filter(s => s.status === filter);
  }, [schedules, filter]);

  // Calculate totals
  const totals = useMemo(() => {
    return schedules.reduce(
      (acc, schedule) => ({
        totalAmount: acc.totalAmount + schedule.totalAmount,
        claimedAmount: acc.claimedAmount + schedule.claimedAmount,
        claimableAmount: acc.claimableAmount + schedule.claimableAmount,
      }),
      { totalAmount: 0, claimedAmount: 0, claimableAmount: 0 }
    );
  }, [schedules]);

  // Count by status
  const counts = useMemo(() => {
    return schedules.reduce(
      (acc, schedule) => {
        acc[schedule.status]++;
        return acc;
      },
      { active: 0, completed: 0, revoked: 0 } as Record<'active' | 'completed' | 'revoked', number>
    );
  }, [schedules]);

  // Get schedules with claimable amounts
  const claimableSchedules = useMemo(() => {
    return schedules.filter(s => s.claimableAmount > 0 && s.status === 'active');
  }, [schedules]);

  // Upcoming claims (next 30 days)
  const upcomingClaims = useMemo(() => {
    const now = Date.now();
    const thirtyDaysFromNow = now + 30 * 24 * 60 * 60 * 1000;

    return schedules
      .filter(s => s.status === 'active' && s.cliffEndTime > now && s.cliffEndTime <= thirtyDaysFromNow)
      .sort((a, b) => a.cliffEndTime - b.cliffEndTime);
  }, [schedules]);

  const handleBatchClaim = async () => {
    if (!onBatchClaim || claimableSchedules.length === 0) return;

    setIsBatchClaiming(true);
    try {
      await onBatchClaim(claimableSchedules.map(s => s.id));
    } finally {
      setIsBatchClaiming(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="animate-pulse">Loading vesting schedules...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (schedules.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center space-y-2">
          <Coins className="size-12 mx-auto text-muted-foreground opacity-50" />
          <p className="text-lg font-medium">No Vesting Schedules</p>
          <p className="text-sm text-muted-foreground">
            You don't have any vesting schedules yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Total Vested</div>
                <div className="text-2xl font-bold">{totals.totalAmount.toLocaleString()}</div>
              </div>
              <Coins className="size-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Claimed</div>
                <div className="text-2xl font-bold text-green-600">
                  {totals.claimedAmount.toLocaleString()}
                </div>
              </div>
              <CheckCircle2 className="size-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Claimable Now</div>
                <div className="text-2xl font-bold text-primary">
                  {totals.claimableAmount.toLocaleString()}
                </div>
              </div>
              <TrendingUp className="size-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Active Schedules</div>
                <div className="text-2xl font-bold">{counts.active}</div>
              </div>
              <Clock className="size-8 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Batch Claim */}
      {claimableSchedules.length > 1 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold mb-1">Batch Claim Available</div>
                <div className="text-sm text-muted-foreground">
                  Claim from {claimableSchedules.length} schedules ({totals.claimableAmount.toLocaleString()} tokens)
                </div>
              </div>
              <Button onClick={handleBatchClaim} disabled={isBatchClaiming}>
                {isBatchClaiming ? 'Claiming...' : 'Claim All'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Claims */}
      {upcomingClaims.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="size-5" />
              Upcoming Claims (Next 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingClaims.map(schedule => (
              <div key={schedule.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <div className="font-medium">{schedule.tokenSymbol}</div>
                  <div className="text-sm text-muted-foreground">
                    {schedule.totalAmount.toLocaleString()} tokens
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {new Date(schedule.cliffEndTime).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Cliff ends
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Filter Tabs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Vesting Schedules</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All ({schedules.length})
              </Button>
              <Button
                variant={filter === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('active')}
              >
                Active ({counts.active})
              </Button>
              <Button
                variant={filter === 'completed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('completed')}
              >
                Completed ({counts.completed})
              </Button>
              {counts.revoked > 0 && (
                <Button
                  variant={filter === 'revoked' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('revoked')}
                >
                  Revoked ({counts.revoked})
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredSchedules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No {filter !== 'all' && filter} schedules found
            </div>
          ) : (
            filteredSchedules.map(schedule => (
              <VestingScheduleCard
                key={schedule.id}
                schedule={schedule}
                onClaim={onClaim}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
