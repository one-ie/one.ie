/**
 * VestingScheduleCard Component
 *
 * Displays a single vesting schedule with:
 * - Schedule info (beneficiary, amount, cliff, duration)
 * - Progress bar (claimed vs total)
 * - Claimable amount highlighted
 * - Claim button
 * - Timeline visualization
 *
 * Used in: VestingDashboard, individual vesting pages
 */

import { useState } from 'react';
import { formatDistance } from 'date-fns';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, Coins, TrendingUp, CheckCircle2 } from 'lucide-react';

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

interface VestingScheduleCardProps {
  schedule: VestingSchedule;
  onClaim?: (scheduleId: string) => Promise<void>;
  compact?: boolean;
  showTimeline?: boolean;
}

export function VestingScheduleCard({
  schedule,
  onClaim,
  compact = false,
  showTimeline = true,
}: VestingScheduleCardProps) {
  const [isClaiming, setIsClaiming] = useState(false);

  // Calculate progress percentage
  const progressPercentage = (schedule.claimedAmount / schedule.totalAmount) * 100;
  const remainingAmount = schedule.totalAmount - schedule.claimedAmount;

  // Check if cliff has passed
  const now = Date.now();
  const cliffPassed = now >= schedule.cliffEndTime;
  const isCompleted = schedule.status === 'completed' || schedule.claimedAmount >= schedule.totalAmount;
  const isRevoked = schedule.status === 'revoked';

  // Status badge variant
  const statusVariant = {
    active: 'default' as const,
    completed: 'secondary' as const,
    revoked: 'destructive' as const,
  }[schedule.status];

  const handleClaim = async () => {
    if (!onClaim || schedule.claimableAmount === 0) return;

    setIsClaiming(true);
    try {
      await onClaim(schedule.id);
    } finally {
      setIsClaiming(false);
    }
  };

  if (compact) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold">{schedule.tokenSymbol}</span>
                <Badge variant={statusVariant}>{schedule.status}</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {schedule.claimedAmount.toLocaleString()} / {schedule.totalAmount.toLocaleString()} claimed
              </div>
            </div>
            {schedule.claimableAmount > 0 && !isRevoked && (
              <Button
                onClick={handleClaim}
                disabled={isClaiming}
                size="sm"
              >
                {isClaiming ? 'Claiming...' : `Claim ${schedule.claimableAmount.toLocaleString()}`}
              </Button>
            )}
          </div>
          <Progress value={progressPercentage} className="mt-3 h-2" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Coins className="size-5" />
              {schedule.tokenSymbol} Vesting
            </CardTitle>
            <CardDescription>
              Beneficiary: {schedule.beneficiary.slice(0, 8)}...{schedule.beneficiary.slice(-6)}
            </CardDescription>
          </div>
          <Badge variant={statusVariant}>{schedule.status}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Amount Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Total Amount</div>
            <div className="text-lg font-bold">
              {schedule.totalAmount.toLocaleString()}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Claimed</div>
            <div className="text-lg font-bold text-green-600">
              {schedule.claimedAmount.toLocaleString()}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Remaining</div>
            <div className="text-lg font-bold text-blue-600">
              {remainingAmount.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progressPercentage.toFixed(1)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
        </div>

        {/* Claimable Amount - Highlighted */}
        {schedule.claimableAmount > 0 && !isRevoked && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Available to Claim</div>
                <div className="text-2xl font-bold text-primary">
                  {schedule.claimableAmount.toLocaleString()} {schedule.tokenSymbol}
                </div>
              </div>
              <TrendingUp className="size-8 text-primary opacity-50" />
            </div>
          </div>
        )}

        <Separator />

        {/* Schedule Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-muted-foreground" />
            <div>
              <div className="text-muted-foreground">Start Date</div>
              <div className="font-medium">
                {new Date(schedule.startTime).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="size-4 text-muted-foreground" />
            <div>
              <div className="text-muted-foreground">Cliff Period</div>
              <div className="font-medium">
                {formatDistance(0, schedule.cliffDuration)}
                {!cliffPassed && <span className="text-xs text-yellow-600 ml-1">(active)</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="size-4 text-muted-foreground" />
            <div>
              <div className="text-muted-foreground">Vesting Duration</div>
              <div className="font-medium">
                {formatDistance(0, schedule.vestingDuration)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-muted-foreground" />
            <div>
              <div className="text-muted-foreground">End Date</div>
              <div className="font-medium">
                {new Date(schedule.endTime).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Last Claim Time */}
        {schedule.lastClaimTime && (
          <div className="text-xs text-muted-foreground">
            Last claimed {formatDistance(schedule.lastClaimTime, now, { addSuffix: true })}
          </div>
        )}

        {/* Cliff Warning */}
        {!cliffPassed && !isRevoked && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              Cliff period ends in {formatDistance(schedule.cliffEndTime, now)}.
              No tokens can be claimed until then.
            </div>
          </div>
        )}

        {/* Revoked Notice */}
        {isRevoked && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <div className="text-sm text-destructive">
              This vesting schedule has been revoked. No further claims are possible.
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(`https://suiscan.xyz/address/${schedule.beneficiary}`, '_blank')}
        >
          View on Explorer
        </Button>

        {schedule.claimableAmount > 0 && !isRevoked && (
          <Button
            onClick={handleClaim}
            disabled={isClaiming || !cliffPassed}
            size="sm"
          >
            {isClaiming ? 'Claiming...' : `Claim ${schedule.claimableAmount.toLocaleString()}`}
          </Button>
        )}

        {isCompleted && !isRevoked && (
          <Badge variant="secondary" className="ml-auto">
            <CheckCircle2 className="size-3 mr-1" />
            Fully Vested
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
}
