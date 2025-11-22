import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowDown } from "lucide-react";

interface Token {
  symbol: string;
  icon?: string;
}

interface LPPosition {
  poolId: string;
  tokenA: Token;
  tokenB: Token;
  lpTokens: number;
  shareOfPool: number;
  valueA: number;
  valueB: number;
}

interface RemoveLiquidityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  position: LPPosition;
  onRemove?: (percentage: number) => Promise<void>;
}

export function RemoveLiquidityDialog({
  open,
  onOpenChange,
  position,
  onRemove,
}: RemoveLiquidityDialogProps) {
  const [percentage, setPercentage] = useState(50);
  const [isRemoving, setIsRemoving] = useState(false);

  const lpTokensToRemove = (position.lpTokens * percentage) / 100;
  const amountA = (position.valueA * percentage) / 100;
  const amountB = (position.valueB * percentage) / 100;

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await onRemove?.(percentage);
      onOpenChange(false);
      setPercentage(50); // Reset
    } finally {
      setIsRemoving(false);
    }
  };

  const presetPercentages = [25, 50, 75, 100];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Remove Liquidity</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Percentage Selector */}
          <div className="space-y-4">
            <div className="flex justify-between items-baseline">
              <Label>Amount to Remove</Label>
              <div className="text-3xl font-bold">{percentage}%</div>
            </div>

            <Slider
              value={[percentage]}
              onValueChange={([value]) => setPercentage(value)}
              min={1}
              max={100}
              step={1}
              className="w-full"
            />

            <div className="flex gap-2">
              {presetPercentages.map((preset) => (
                <Button
                  key={preset}
                  variant={percentage === preset ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPercentage(preset)}
                  className="flex-1"
                >
                  {preset}%
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* LP Tokens to Burn */}
          <div className="p-4 rounded-lg bg-muted/50 space-y-2">
            <div className="text-sm text-muted-foreground">LP Tokens to Burn</div>
            <div className="text-2xl font-bold">{lpTokensToRemove.toFixed(6)}</div>
            <div className="text-xs text-muted-foreground">
              of {position.lpTokens.toFixed(6)} total
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowDown className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* Tokens to Receive */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-muted-foreground">You will receive</div>

            <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
              <div className="flex items-center gap-2">
                {position.tokenA.icon && (
                  <img src={position.tokenA.icon} alt="" className="w-6 h-6" />
                )}
                <span className="font-medium">{position.tokenA.symbol}</span>
              </div>
              <div className="text-right">
                <div className="font-bold">{amountA.toFixed(6)}</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
              <div className="flex items-center gap-2">
                {position.tokenB.icon && (
                  <img src={position.tokenB.icon} alt="" className="w-6 h-6" />
                )}
                <span className="font-medium">{position.tokenB.symbol}</span>
              </div>
              <div className="text-right">
                <div className="font-bold">{amountB.toFixed(6)}</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Remaining Position */}
          {percentage < 100 && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Remaining LP tokens</span>
                <span className="font-medium">
                  {(position.lpTokens - lpTokensToRemove).toFixed(6)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Remaining pool share</span>
                <span className="font-medium">
                  {(position.shareOfPool * (100 - percentage) / 100).toFixed(4)}%
                </span>
              </div>
            </div>
          )}

          {percentage === 100 && (
            <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900">
              <p className="text-sm text-orange-900 dark:text-orange-100">
                You are removing your entire liquidity position. This action cannot be undone.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isRemoving}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleRemove}
            disabled={isRemoving}
            variant={percentage === 100 ? "destructive" : "default"}
            className="flex-1"
          >
            {isRemoving ? "Removing..." : percentage === 100 ? "Remove All" : "Remove"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
