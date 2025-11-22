import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, TrendingDown, Plus, Minus, ExternalLink } from "lucide-react";
import { RemoveLiquidityDialog } from "./RemoveLiquidityDialog";

interface Token {
  symbol: string;
  icon?: string;
}

interface LPPositionCardProps {
  position: {
    poolId: string;
    tokenA: Token;
    tokenB: Token;
    lpTokens: number;
    shareOfPool: number;
    valueA: number;
    valueB: number;
    initialValueA: number;
    initialValueB: number;
    feesEarnedUSD: number;
    currentValueUSD: number;
    initialValueUSD: number;
  };
  onAddMore?: () => void;
  onRemove?: (percentage: number) => Promise<void>;
}

export function LPPositionCard({ position, onAddMore, onRemove }: LPPositionCardProps) {
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  // Calculate PnL
  const totalPnL = position.currentValueUSD - position.initialValueUSD;
  const pnlPercentage = (totalPnL / position.initialValueUSD) * 100;
  const isProfit = totalPnL >= 0;

  // Calculate impermanent loss
  const calculateImpermanentLoss = () => {
    // IL = 2 * sqrt(priceRatio) / (1 + priceRatio) - 1
    const currentRatio = position.valueB / position.valueA;
    const initialRatio = position.initialValueB / position.initialValueA;
    const priceRatio = currentRatio / initialRatio;

    const ilValue = (2 * Math.sqrt(priceRatio)) / (1 + priceRatio) - 1;
    const ilPercentage = ilValue * 100;

    return ilPercentage;
  };

  const impermanentLoss = calculateImpermanentLoss();
  const hasImpermanentLoss = Math.abs(impermanentLoss) > 0.01;

  // Net PnL including fees
  const netPnL = totalPnL + position.feesEarnedUSD;
  const netPnLPercentage = (netPnL / position.initialValueUSD) * 100;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {position.tokenA.icon && (
                  <img src={position.tokenA.icon} alt="" className="w-5 h-5" />
                )}
                {position.tokenB.icon && (
                  <img src={position.tokenB.icon} alt="" className="w-5 h-5 -ml-2" />
                )}
                <CardTitle className="text-lg">
                  {position.tokenA.symbol} / {position.tokenB.symbol}
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {position.shareOfPool.toFixed(4)}% of pool
                </Badge>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={onAddMore}
                title="Add more liquidity"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setShowRemoveDialog(true)}
                title="Remove liquidity"
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Position Value */}
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Total Value</div>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold">
                ${position.currentValueUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                {isProfit ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {isProfit ? '+' : ''}{pnlPercentage.toFixed(2)}%
              </div>
            </div>
          </div>

          <Separator />

          {/* Token Balances */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Pooled {position.tokenA.symbol}</div>
              <div className="font-medium">{position.valueA.toFixed(6)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Pooled {position.tokenB.symbol}</div>
              <div className="font-medium">{position.valueB.toFixed(6)}</div>
            </div>
          </div>

          <Separator />

          {/* LP Tokens */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">LP Tokens</span>
            <span className="font-medium">{position.lpTokens.toFixed(6)}</span>
          </div>

          <Separator />

          {/* PnL Breakdown */}
          <div className="space-y-2 text-sm">
            <div className="font-medium">Position Performance</div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Fees Earned</span>
              <span className="font-medium text-green-600">
                +${position.feesEarnedUSD.toFixed(2)}
              </span>
            </div>

            {hasImpermanentLoss && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Impermanent Loss</span>
                <span className={`font-medium ${impermanentLoss < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {impermanentLoss.toFixed(2)}%
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-muted-foreground">Token Value Change</span>
              <span className={`font-medium ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                {isProfit ? '+' : ''}${totalPnL.toFixed(2)}
              </span>
            </div>

            <Separator />

            <div className="flex justify-between font-medium">
              <span>Net Profit/Loss</span>
              <span className={netPnL >= 0 ? 'text-green-600' : 'text-red-600'}>
                {netPnL >= 0 ? '+' : ''}${netPnL.toFixed(2)} ({netPnL >= 0 ? '+' : ''}{netPnLPercentage.toFixed(2)}%)
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={onAddMore}>
              <Plus className="h-3 w-3 mr-1" />
              Add Liquidity
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={() => setShowRemoveDialog(true)}>
              <Minus className="h-3 w-3 mr-1" />
              Remove
            </Button>
            <Button variant="ghost" size="icon-sm">
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <RemoveLiquidityDialog
        open={showRemoveDialog}
        onOpenChange={setShowRemoveDialog}
        position={position}
        onRemove={onRemove}
      />
    </>
  );
}
