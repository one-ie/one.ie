import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowDown, Settings, AlertTriangle, Info } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

interface Token {
  id: string;
  symbol: string;
  name: string;
  icon?: string;
  balance: number;
  decimals: number;
}

interface SwapInterfaceProps {
  tokens: Token[];
  onSwap?: (fromToken: string, toToken: string, fromAmount: string, toAmount: string, slippage: number) => Promise<void>;
}

export function SwapInterface({ tokens, onSwap }: SwapInterfaceProps) {
  const [fromToken, setFromToken] = useState<Token | null>(tokens[0] || null);
  const [toToken, setToToken] = useState<Token | null>(tokens[1] || null);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [slippage, setSlippage] = useState(0.5); // Default 0.5%
  const [priceImpact, setPriceImpact] = useState(0);
  const [isSwapping, setIsSwapping] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);

  // Calculate price impact and estimated output
  useEffect(() => {
    if (!fromAmount || !fromToken || !toToken) {
      setToAmount("");
      setPriceImpact(0);
      setEstimatedPrice(null);
      return;
    }

    // Simulated price calculation (replace with actual DEX pricing)
    const mockExchangeRate = 1.5; // 1 tokenA = 1.5 tokenB
    const amount = parseFloat(fromAmount);

    if (isNaN(amount) || amount <= 0) {
      setToAmount("");
      return;
    }

    // Calculate output with simulated slippage
    const output = amount * mockExchangeRate;
    const impactPercent = (amount / 10000) * 100; // Simulated impact based on size

    setToAmount(output.toFixed(6));
    setPriceImpact(impactPercent);
    setEstimatedPrice(mockExchangeRate);
  }, [fromAmount, fromToken, toToken]);

  const handleSwapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const handleMaxClick = () => {
    if (fromToken) {
      setFromAmount(fromToken.balance.toString());
    }
  };

  const handleSwap = async () => {
    if (!fromToken || !toToken || !fromAmount || !toAmount) return;

    setIsSwapping(true);
    try {
      await onSwap?.(fromToken.id, toToken.id, fromAmount, toAmount, slippage);
      // Reset form on success
      setFromAmount("");
      setToAmount("");
    } finally {
      setIsSwapping(false);
    }
  };

  const getPriceImpactColor = (impact: number) => {
    if (impact < 1) return "text-green-600";
    if (impact < 3) return "text-yellow-600";
    return "text-red-600";
  };

  const isHighPriceImpact = priceImpact >= 3;
  const isInsufficientBalance = fromToken && parseFloat(fromAmount) > fromToken.balance;
  const canSwap = fromToken && toToken && fromAmount && toAmount && !isInsufficientBalance;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Swap Tokens</CardTitle>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <Settings className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Slippage Tolerance</Label>
                <div className="flex gap-2 mt-2">
                  {[0.1, 0.5, 1.0].map((value) => (
                    <Button
                      key={value}
                      variant={slippage === value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSlippage(value)}
                    >
                      {value}%
                    </Button>
                  ))}
                </div>
                <div className="mt-3 space-y-2">
                  <Slider
                    value={[slippage]}
                    onValueChange={([value]) => setSlippage(value)}
                    min={0.1}
                    max={5}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0.1%</span>
                    <span className="font-medium">{slippage.toFixed(1)}%</span>
                    <span>5%</span>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <Info className="h-3 w-3 mt-0.5 shrink-0" />
                <p>Your transaction will revert if the price changes unfavorably by more than this percentage.</p>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </CardHeader>

      <CardContent className="space-y-2">
        {/* From Token */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-sm text-muted-foreground">From</Label>
            {fromToken && (
              <span className="text-xs text-muted-foreground">
                Balance: {fromToken.balance.toFixed(4)}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Select
              value={fromToken?.id}
              onValueChange={(id) => setFromToken(tokens.find(t => t.id === id) || null)}
            >
              <SelectTrigger className="w-32">
                <SelectValue>
                  {fromToken ? (
                    <div className="flex items-center gap-2">
                      {fromToken.icon && <img src={fromToken.icon} alt="" className="w-4 h-4" />}
                      <span>{fromToken.symbol}</span>
                    </div>
                  ) : "Select"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {tokens.map((token) => (
                  <SelectItem key={token.id} value={token.id} disabled={token.id === toToken?.id}>
                    <div className="flex items-center gap-2">
                      {token.icon && <img src={token.icon} alt="" className="w-4 h-4" />}
                      <div>
                        <div className="font-medium">{token.symbol}</div>
                        <div className="text-xs text-muted-foreground">{token.name}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex-1 relative">
              <Input
                type="number"
                placeholder="0.0"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="pr-16"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 text-xs"
                onClick={handleMaxClick}
              >
                MAX
              </Button>
            </div>
          </div>
        </div>

        {/* Swap Direction Button */}
        <div className="flex justify-center -my-2 relative z-10">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={handleSwapTokens}
            className="rounded-full bg-background"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>

        {/* To Token */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">To</Label>
          <div className="flex gap-2">
            <Select
              value={toToken?.id}
              onValueChange={(id) => setToToken(tokens.find(t => t.id === id) || null)}
            >
              <SelectTrigger className="w-32">
                <SelectValue>
                  {toToken ? (
                    <div className="flex items-center gap-2">
                      {toToken.icon && <img src={toToken.icon} alt="" className="w-4 h-4" />}
                      <span>{toToken.symbol}</span>
                    </div>
                  ) : "Select"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {tokens.map((token) => (
                  <SelectItem key={token.id} value={token.id} disabled={token.id === fromToken?.id}>
                    <div className="flex items-center gap-2">
                      {token.icon && <img src={token.icon} alt="" className="w-4 h-4" />}
                      <div>
                        <div className="font-medium">{token.symbol}</div>
                        <div className="text-xs text-muted-foreground">{token.name}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="0.0"
              value={toAmount}
              readOnly
              className="flex-1"
            />
          </div>
        </div>

        {/* Price Impact Warning */}
        {isHighPriceImpact && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              High price impact ({priceImpact.toFixed(2)}%). You may lose a significant portion of your trade value.
            </AlertDescription>
          </Alert>
        )}

        {/* Trade Details */}
        {estimatedPrice && fromAmount && toAmount && (
          <>
            <Separator />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rate</span>
                <span className="font-medium">
                  1 {fromToken?.symbol} = {estimatedPrice.toFixed(4)} {toToken?.symbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price Impact</span>
                <span className={`font-medium ${getPriceImpactColor(priceImpact)}`}>
                  {priceImpact.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Slippage Tolerance</span>
                <span className="font-medium">{slippage.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Minimum Received</span>
                <span className="font-medium">
                  {(parseFloat(toAmount) * (1 - slippage / 100)).toFixed(6)} {toToken?.symbol}
                </span>
              </div>
            </div>
          </>
        )}
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          size="lg"
          onClick={handleSwap}
          disabled={!canSwap || isSwapping}
        >
          {isSwapping ? (
            "Swapping..."
          ) : isInsufficientBalance ? (
            "Insufficient Balance"
          ) : !fromToken || !toToken ? (
            "Select Tokens"
          ) : !fromAmount ? (
            "Enter Amount"
          ) : (
            "Swap"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
