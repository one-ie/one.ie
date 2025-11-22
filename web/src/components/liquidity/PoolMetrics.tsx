import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Activity, Droplets, Percent } from "lucide-react";

interface PoolMetricsProps {
  metrics: {
    tvl: number;
    tvlChange24h: number;
    volume24h: number;
    volumeChange24h: number;
    fees24h: number;
    feesChange24h: number;
    apy: number;
    apyChange7d: number;
    totalTransactions: number;
    uniqueTraders24h: number;
  };
}

export function PoolMetrics({ metrics }: PoolMetricsProps) {
  const formatLargeNumber = (value: number) => {
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(2)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const formatPercentChange = (value: number) => {
    const isPositive = value >= 0;
    return (
      <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        <span>{isPositive ? '+' : ''}{value.toFixed(2)}%</span>
      </div>
    );
  };

  const metricCards = [
    {
      title: "Total Value Locked",
      value: formatLargeNumber(metrics.tvl),
      change: metrics.tvlChange24h,
      icon: DollarSign,
      description: "Total liquidity in pool",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
    },
    {
      title: "24h Volume",
      value: formatLargeNumber(metrics.volume24h),
      change: metrics.volumeChange24h,
      icon: Activity,
      description: "Trading volume last 24 hours",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
    },
    {
      title: "24h Fees",
      value: formatLargeNumber(metrics.fees24h),
      change: metrics.feesChange24h,
      icon: Droplets,
      description: "Fees earned by LPs",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/20",
    },
    {
      title: "APY",
      value: `${metrics.apy.toFixed(2)}%`,
      change: metrics.apyChange7d,
      icon: Percent,
      description: "Annual percentage yield",
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((metric) => (
          <Card key={metric.title}>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-lg ${metric.bgColor} flex items-center justify-center`}>
                    <metric.icon className={`h-5 w-5 ${metric.color}`} />
                  </div>
                  {formatPercentChange(metric.change)}
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-1">{metric.title}</div>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{metric.description}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pool Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Total Transactions</div>
              <div className="text-xl font-bold">{metrics.totalTransactions.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">24h Traders</div>
              <div className="text-xl font-bold">{metrics.uniqueTraders24h.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Volume/TVL Ratio</div>
              <div className="text-xl font-bold">
                {((metrics.volume24h / metrics.tvl) * 100).toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Fees/Volume</div>
              <div className="text-xl font-bold">
                {((metrics.fees24h / metrics.volume24h) * 100).toFixed(2)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* APY Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">APY Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
              <div>
                <div className="font-medium">Trading Fees APY</div>
                <div className="text-sm text-muted-foreground">
                  Based on 24h fees × 365
                </div>
              </div>
              <div className="text-xl font-bold text-green-600">
                {((metrics.fees24h * 365 / metrics.tvl) * 100).toFixed(2)}%
              </div>
            </div>

            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
              <div>
                <div className="font-medium">Total APY</div>
                <div className="text-sm text-muted-foreground">
                  Including all rewards
                </div>
              </div>
              <div className="text-xl font-bold text-blue-600">
                {metrics.apy.toFixed(2)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-sm text-muted-foreground">Pool Efficiency</div>
              <div className="text-3xl font-bold">
                {((metrics.volume24h / metrics.tvl) * 100).toFixed(1)}%
              </div>
              <Badge variant="outline">
                {(metrics.volume24h / metrics.tvl) > 0.5 ? 'Excellent' :
                 (metrics.volume24h / metrics.tvl) > 0.2 ? 'Good' : 'Fair'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-sm text-muted-foreground">LP Returns (24h)</div>
              <div className="text-3xl font-bold text-green-600">
                ${metrics.fees24h.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <Badge variant="outline">
                Per $1M TVL: ${((metrics.fees24h / metrics.tvl) * 1000000).toFixed(2)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-sm text-muted-foreground">Avg Transaction</div>
              <div className="text-3xl font-bold">
                ${(metrics.volume24h / metrics.totalTransactions).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </div>
              <Badge variant="outline">
                {metrics.totalTransactions} txs total
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
