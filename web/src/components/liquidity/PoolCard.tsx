import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, ExternalLink } from "lucide-react";

interface Token {
  symbol: string;
  icon?: string;
}

interface PoolCardProps {
  pool: {
    id: string;
    tokenA: Token;
    tokenB: Token;
    tvl: number;
    volume24h: number;
    fees24h: number;
    apy: number;
    priceChange24h: number;
  };
  onClick?: () => void;
}

export function PoolCard({ pool, onClick }: PoolCardProps) {
  const isPositiveChange = pool.priceChange24h >= 0;
  const isHighAPY = pool.apy >= 50;

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {pool.tokenA.icon && pool.tokenB.icon && (
              <div className="flex items-center -space-x-2">
                <img src={pool.tokenA.icon} alt="" className="w-8 h-8 rounded-full border-2 border-background" />
                <img src={pool.tokenB.icon} alt="" className="w-8 h-8 rounded-full border-2 border-background" />
              </div>
            )}
            <CardTitle className="text-lg">
              {pool.tokenA.symbol} / {pool.tokenB.symbol}
            </CardTitle>
          </div>
          {isHighAPY && (
            <Badge variant="default" className="bg-green-500">
              Hot
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* APY Highlight */}
        <div className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border">
          <div className="text-xs text-muted-foreground mb-1">APY</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {pool.apy.toFixed(2)}%
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-xs text-muted-foreground mb-1">TVL</div>
            <div className="font-medium">
              ${pool.tvl >= 1000000
                ? `${(pool.tvl / 1000000).toFixed(2)}M`
                : `${(pool.tvl / 1000).toFixed(1)}K`}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">24h Volume</div>
            <div className="font-medium">
              ${pool.volume24h >= 1000000
                ? `${(pool.volume24h / 1000000).toFixed(2)}M`
                : `${(pool.volume24h / 1000).toFixed(1)}K`}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">24h Fees</div>
            <div className="font-medium text-green-600">
              ${pool.fees24h.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">24h Change</div>
            <div className={`font-medium flex items-center gap-1 ${isPositiveChange ? 'text-green-600' : 'text-red-600'}`}>
              {isPositiveChange ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {isPositiveChange ? '+' : ''}{pool.priceChange24h.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button variant="outline" className="w-full" size="sm">
          View Pool Details
          <ExternalLink className="h-3 w-3 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
