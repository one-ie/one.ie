/**
 * UnstakeButton Component
 *
 * Button to unstake tokens with penalty warning if applicable
 */

import { useState } from 'react';
import type { UserStake, StakingPool } from './types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface UnstakeButtonProps {
  stake: UserStake;
  pool: StakingPool;
  onUnstake?: (stakeId: string) => Promise<void>;
  loading?: boolean;
}

export function UnstakeButton({ stake, pool, onUnstake, loading = false }: UnstakeButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [unstaking, setUnstaking] = useState(false);

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(value);
  };

  const now = Date.now();
  const isLocked = now < stake.endTime;
  const timeRemaining = stake.endTime - now;
  const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));

  const lockPeriod = pool.lockPeriods.find(p => p.duration === stake.lockDuration);
  const penaltyRate = lockPeriod?.penaltyRate || 0;
  const penaltyAmount = isLocked ? (stake.amount * penaltyRate) / 100 : 0;
  const amountAfterPenalty = stake.amount - penaltyAmount;

  const handleUnstake = async () => {
    if (!onUnstake) return;

    setUnstaking(true);
    try {
      await onUnstake(stake._id);
      setIsOpen(false);
    } finally {
      setUnstaking(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={isLocked ? 'destructive' : 'default'}
          className="w-full"
          disabled={stake.status !== 'active' || loading}
        >
          {isLocked ? 'Unstake Early (Penalty)' : 'Unstake'}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isLocked ? 'Unstake Early?' : 'Unstake Tokens'}
          </DialogTitle>
          <DialogDescription>
            {isLocked
              ? 'Your stake is still locked. Early withdrawal will incur a penalty.'
              : 'Your lock period has ended. You can unstake without penalty.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Stake Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Staked Amount</span>
              <span className="font-medium">
                {formatNumber(stake.amount)} {pool.tokenSymbol}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Rewards Earned</span>
              <span className="font-medium text-primary">
                +{formatNumber(stake.rewards)} {pool.tokenSymbol}
              </span>
            </div>

            {isLocked && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Days Remaining</span>
                  <Badge variant="secondary">{daysRemaining} days</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Penalty Rate</span>
                  <span className="font-medium text-destructive">{penaltyRate}%</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Penalty Amount</span>
                  <span className="font-medium text-destructive">
                    -{formatNumber(penaltyAmount)} {pool.tokenSymbol}
                  </span>
                </div>
              </>
            )}

            {/* Total After Penalty */}
            <div className="rounded-lg bg-secondary/50 p-3 mt-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">You Will Receive</span>
                <span className={`text-xl font-bold ${isLocked ? 'text-destructive' : 'text-primary'}`}>
                  {formatNumber(amountAfterPenalty + stake.rewards)} {pool.tokenSymbol}
                </span>
              </div>
              {isLocked && (
                <p className="text-xs text-muted-foreground">
                  Stake + Rewards - Penalty
                </p>
              )}
            </div>
          </div>

          {/* Warning for Early Unstake */}
          {isLocked && penaltyAmount > 0 && (
            <div className="rounded-lg bg-destructive/10 dark:bg-destructive/20 p-3">
              <p className="text-sm font-medium text-destructive mb-1">
                Warning: Early Withdrawal Penalty
              </p>
              <p className="text-xs text-muted-foreground">
                You will lose {formatNumber(penaltyAmount)} {pool.tokenSymbol} ({penaltyRate}%) if you unstake now.
                Consider waiting {daysRemaining} more days to avoid this penalty.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            variant={isLocked ? 'destructive' : 'default'}
            onClick={handleUnstake}
            disabled={unstaking || loading}
          >
            {unstaking ? 'Unstaking...' : isLocked ? 'Unstake Anyway' : 'Confirm Unstake'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
