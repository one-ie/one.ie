import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Info, Plus } from "lucide-react";

interface Token {
  id: string;
  symbol: string;
  name: string;
  icon?: string;
  balance: number;
  decimals: number;
}

interface Pool {
  id: string;
  tokenA: Token;
  tokenB: Token;
  reserveA: number;
  reserveB: number;
  totalLPTokens: number;
}

interface AddLiquidityFormProps {
  pool: Pool;
  onAddLiquidity?: (amountA: string, amountB: string) => Promise<void>;
}

export function AddLiquidityForm({ pool, onAddLiquidity }: AddLiquidityFormProps) {
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [shareOfPool, setShareOfPool] = useState(0);
  const [lpTokensToReceive, setLpTokensToReceive] = useState(0);

  // Calculate amounts and pool share
  useEffect(() => {
    if (!amountA) {
      setAmountB("");
      setShareOfPool(0);
      setLpTokensToReceive(0);
      return;
    }

    const inputA = parseFloat(amountA);
    if (isNaN(inputA) || inputA <= 0) {
      setAmountB("");
      return;
    }

    // Calculate proportional amount B
    const ratio = pool.reserveB / pool.reserveA;
    const calculatedB = inputA * ratio;
    setAmountB(calculatedB.toFixed(6));

    // Calculate LP tokens to receive
    // LP tokens = (amountA / reserveA) * totalLPTokens
    const lpTokens = (inputA / pool.reserveA) * pool.totalLPTokens;
    setLpTokensToReceive(lpTokens);

    // Calculate share of pool
    const newTotalLP = pool.totalLPTokens + lpTokens;
    const share = (lpTokens / newTotalLP) * 100;
    setShareOfPool(share);
  }, [amountA, pool]);

  const handleMaxA = () => {
    setAmountA(pool.tokenA.balance.toString());
  };

  const handleMaxB = () => {
    // Calculate max B and proportional A
    const maxB = pool.tokenB.balance;
    const proportionalA = maxB / (pool.reserveB / pool.reserveA);

    if (proportionalA <= pool.tokenA.balance) {
      setAmountA(proportionalA.toFixed(6));
    } else {
      handleMaxA();
    }
  };

  const handleAddLiquidity = async () => {
    if (!amountA || !amountB) return;

    setIsAdding(true);
    try {
      await onAddLiquidity?.(amountA, amountB);
      // Reset form on success
      setAmountA("");
      setAmountB("");
    } finally {
      setIsAdding(false);
    }
  };

  const isInsufficientA = parseFloat(amountA) > pool.tokenA.balance;
  const isInsufficientB = parseFloat(amountB) > pool.tokenB.balance;
  const canAdd = amountA && amountB && !isInsufficientA && !isInsufficientB;

  const currentPrice = pool.reserveB / pool.reserveA;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Add Liquidity</CardTitle>
          <Badge variant="outline">
            {pool.tokenA.symbol} / {pool.tokenB.symbol}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Pool Info */}
        <div className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-muted/50">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Pool Reserves</div>
            <div className="font-medium">
              {pool.reserveA.toLocaleString()} {pool.tokenA.symbol}
            </div>
            <div className="font-medium">
              {pool.reserveB.toLocaleString()} {pool.tokenB.symbol}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Current Price</div>
            <div className="text-sm">
              1 {pool.tokenA.symbol} = {currentPrice.toFixed(4)} {pool.tokenB.symbol}
            </div>
          </div>
        </div>

        {/* Token A Input */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>Amount {pool.tokenA.symbol}</Label>
            <span className="text-xs text-muted-foreground">
              Balance: {pool.tokenA.balance.toFixed(4)}
            </span>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                type="number"
                placeholder="0.0"
                value={amountA}
                onChange={(e) => setAmountA(e.target.value)}
                className="pr-16"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 text-xs"
                onClick={handleMaxA}
              >
                MAX
              </Button>
            </div>
            <div className="w-20 flex items-center justify-center border rounded-md bg-muted/50">
              <span className="font-medium text-sm">{pool.tokenA.symbol}</span>
            </div>
          </div>
          {isInsufficientA && (
            <p className="text-xs text-destructive">Insufficient {pool.tokenA.symbol} balance</p>
          )}
        </div>

        {/* Plus Icon */}
        <div className="flex justify-center">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <Plus className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* Token B Input */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>Amount {pool.tokenB.symbol}</Label>
            <span className="text-xs text-muted-foreground">
              Balance: {pool.tokenB.balance.toFixed(4)}
            </span>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                type="number"
                placeholder="0.0"
                value={amountB}
                readOnly
                className="pr-16 bg-muted/50"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 text-xs"
                onClick={handleMaxB}
              >
                MAX
              </Button>
            </div>
            <div className="w-20 flex items-center justify-center border rounded-md bg-muted/50">
              <span className="font-medium text-sm">{pool.tokenB.symbol}</span>
            </div>
          </div>
          {isInsufficientB && (
            <p className="text-xs text-destructive">Insufficient {pool.tokenB.symbol} balance</p>
          )}
        </div>

        {/* Pool Share Info */}
        {lpTokensToReceive > 0 && (
          <>
            <Separator />
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                <div className="space-y-1 flex-1">
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    You will receive
                  </p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {lpTokensToReceive.toFixed(6)} LP
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Your pool share</span>
                  <span className="font-medium">{shareOfPool.toFixed(4)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pool ratio</span>
                  <span className="font-medium">
                    1 : {currentPrice.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            By adding liquidity, you'll earn a share of trading fees proportional to your pool ownership.
            You may also be exposed to impermanent loss if token prices diverge.
          </AlertDescription>
        </Alert>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          size="lg"
          onClick={handleAddLiquidity}
          disabled={!canAdd || isAdding}
        >
          {isAdding ? (
            "Adding Liquidity..."
          ) : isInsufficientA || isInsufficientB ? (
            "Insufficient Balance"
          ) : !amountA ? (
            "Enter Amount"
          ) : (
            "Add Liquidity"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
