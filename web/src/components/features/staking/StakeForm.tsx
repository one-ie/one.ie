/**
 * StakeForm Component
 *
 * Form for staking tokens with amount input, lock duration selector, and APY preview
 */

import { useState } from 'react';
import type { StakingPool, StakeFormData } from './types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface StakeFormProps {
  pool: StakingPool;
  balance?: number;
  onStake?: (data: StakeFormData) => Promise<void>;
  loading?: boolean;
}

export function StakeForm({ pool, balance = 0, onStake, loading = false }: StakeFormProps) {
  const [amount, setAmount] = useState<string>('');
  const [lockDuration, setLockDuration] = useState<number>(pool.lockPeriods[0]?.duration || 30);
  const [submitting, setSubmitting] = useState(false);

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6,
    }).format(value);
  };

  const numericAmount = parseFloat(amount) || 0;

  const selectedPeriod = pool.lockPeriods.find(p => p.duration === lockDuration);
  const calculatedApy = pool.baseApy + (selectedPeriod?.apyBonus || 0);

  const estimatedRewards = (numericAmount * calculatedApy / 100 * lockDuration / 365);

  const canStake =
    numericAmount >= pool.minStake &&
    numericAmount <= balance &&
    (!pool.maxStake || numericAmount <= pool.maxStake) &&
    pool.status === 'active';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canStake || !onStake) return;

    setSubmitting(true);
    try {
      await onStake({
        amount: numericAmount,
        lockDuration,
      });
      setAmount('');
    } finally {
      setSubmitting(false);
    }
  };

  const setMaxAmount = () => {
    if (pool.maxStake && balance > pool.maxStake) {
      setAmount(pool.maxStake.toString());
    } else {
      setAmount(balance.toString());
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stake {pool.tokenSymbol}</CardTitle>
        <CardDescription>
          Lock your tokens to earn rewards • APY up to {pool.maxApy}%
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Amount</label>
              <button
                type="button"
                onClick={setMaxAmount}
                className="text-xs text-primary hover:underline"
              >
                Balance: {formatNumber(balance)} {pool.tokenSymbol}
              </button>
            </div>

            <div className="relative">
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="any"
                min={pool.minStake}
                max={pool.maxStake || balance}
                className="pr-20 text-lg"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Badge variant="outline">{pool.tokenSymbol}</Badge>
              </div>
            </div>

            {/* Validation Messages */}
            {numericAmount > 0 && numericAmount < pool.minStake && (
              <p className="text-xs text-destructive">
                Minimum stake: {formatNumber(pool.minStake)} {pool.tokenSymbol}
              </p>
            )}
            {numericAmount > balance && (
              <p className="text-xs text-destructive">Insufficient balance</p>
            )}
            {pool.maxStake && numericAmount > pool.maxStake && (
              <p className="text-xs text-destructive">
                Maximum stake: {formatNumber(pool.maxStake)} {pool.tokenSymbol}
              </p>
            )}
          </div>

          {/* Lock Duration Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Lock Duration</label>
            <Select
              value={lockDuration.toString()}
              onValueChange={(value) => setLockDuration(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pool.lockPeriods.map((period) => (
                  <SelectItem key={period.duration} value={period.duration.toString()}>
                    {period.duration} days • +{period.apyBonus}% APY
                    {period.penaltyRate && ` (${period.penaltyRate}% penalty if early)`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* APY Preview */}
          {numericAmount > 0 && (
            <div className="rounded-lg bg-primary/10 dark:bg-primary/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Your APY</span>
                <span className="text-xl font-bold text-primary">{calculatedApy}%</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Estimated Rewards</span>
                <span className="font-medium">
                  ~{formatNumber(estimatedRewards)} {pool.tokenSymbol}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Lock Period</span>
                <span className="font-medium">{lockDuration} days</span>
              </div>

              {selectedPeriod?.penaltyRate && (
                <div className="pt-2 border-t border-border/50">
                  <p className="text-xs text-destructive">
                    Early withdrawal penalty: {selectedPeriod.penaltyRate}% of staked amount
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={!canStake || submitting || loading}
          >
            {submitting ? 'Staking...' : `Stake ${pool.tokenSymbol}`}
          </Button>

          {/* Info Text */}
          <p className="text-xs text-center text-muted-foreground">
            Your tokens will be locked for {lockDuration} days and automatically earn rewards
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
