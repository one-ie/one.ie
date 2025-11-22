/**
 * TokenDashboard Component (CYCLE-025-030)
 *
 * Token analytics dashboard with:
 * - Real-time metrics via Convex
 * - Price charts
 * - Holder analytics
 * - Transaction history
 * - Token actions
 * - Responsive layout
 * - Dark mode support
 */

'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  DollarSign,
  BarChart3,
  Settings,
  Share2,
  Copy,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

interface TokenDashboardProps {
  tokenId: string;
}

export function TokenDashboard({ tokenId }: TokenDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // TODO: Replace with actual Convex queries
  // const token = useQuery(api.queries.tokens.get, { tokenId });
  // const metrics = useQuery(api.queries.tokens.getMetrics, { tokenId });
  // const holders = useQuery(api.queries.tokens.getHolders, { tokenId });
  // const transactions = useQuery(api.queries.tokens.getTransactions, { tokenId });

  const isLoading = true; // Mock loading state

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success('Address copied to clipboard');
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Dashboard link copied to clipboard');
  };

  // Loading state
  if (isLoading) {
    return <TokenDashboardSkeleton />;
  }

  // Mock data for development
  const token = {
    _id: tokenId,
    name: 'Example Token',
    symbol: 'EXAM',
    description: 'An example token for testing',
    image: 'https://via.placeholder.com/100',
    mintAddress: 'ExAmPl3T0k3nAdDr3ss1234567890',
    decimals: 9,
    totalSupply: '1000000000',
    properties: {
      network: 'solana' as const,
      price: 0.0042,
      priceChange24h: 15.3,
      volume24h: 125000,
      holders: 1234,
      marketCap: 4200000,
      status: 'active' as const,
    },
    createdAt: Date.now() - 86400000 * 7,
  };

  const priceChange = token.properties.priceChange24h;
  const isPositive = priceChange >= 0;

  return (
    <div className="space-y-6">
      {/* Token Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            {/* Token Info */}
            <div className="flex items-start gap-4">
              {token.image ? (
                <img
                  src={token.image}
                  alt={token.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-2xl">
                  {token.symbol.slice(0, 2)}
                </div>
              )}

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold">{token.name}</h1>
                  <Badge variant="outline" className="text-lg">{token.symbol}</Badge>
                  {token.properties.status === 'active' && (
                    <Badge className="bg-green-500">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  )}
                </div>

                {token.description && (
                  <p className="text-muted-foreground mb-3">{token.description}</p>
                )}

                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyAddress(token.mintAddress)}
                    className="h-auto p-0 hover:bg-transparent"
                  >
                    <code className="px-2 py-1 rounded bg-muted">
                      {token.mintAddress.slice(0, 8)}...{token.mintAddress.slice(-6)}
                    </code>
                    <Copy className="w-3 h-3 ml-1" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`https://solscan.io/token/${token.mintAddress}`, '_blank')}
                  >
                    View on Solscan
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Button onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Price */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
              <DollarSign className="w-4 h-4" />
              Price
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">${token.properties.price.toFixed(4)}</span>
              <span className={`text-sm font-semibold flex items-center gap-1 ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {Math.abs(priceChange).toFixed(2)}%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Market Cap */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
              <BarChart3 className="w-4 h-4" />
              Market Cap
            </div>
            <div className="text-2xl font-bold">
              ${(token.properties.marketCap / 1e6).toFixed(2)}M
            </div>
          </CardContent>
        </Card>

        {/* Volume 24h */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
              <Activity className="w-4 h-4" />
              Volume 24h
            </div>
            <div className="text-2xl font-bold">
              ${(token.properties.volume24h / 1e3).toFixed(1)}K
            </div>
          </CardContent>
        </Card>

        {/* Holders */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
              <Users className="w-4 h-4" />
              Holders
            </div>
            <div className="text-2xl font-bold">
              {token.properties.holders.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="holders">Holders</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Token Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Total Supply</div>
                  <div className="font-semibold">{Number(token.totalSupply).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Decimals</div>
                  <div className="font-semibold">{token.decimals}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Network</div>
                  <div className="font-semibold capitalize">{token.properties.network}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Created</div>
                  <div className="font-semibold">
                    {new Date(token.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Price Chart</CardTitle>
              <CardDescription>7-day price history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Chart placeholder - integrate with charting library
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Holders Tab */}
        <TabsContent value="holders">
          <Card>
            <CardHeader>
              <CardTitle>Top Holders</CardTitle>
              <CardDescription>Addresses with the most tokens</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="text-muted-foreground font-mono">#{i}</div>
                      <code className="text-sm">
                        Addr{i}...xyz
                      </code>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{(1000000 / i).toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">
                        {((100 / i) / 10).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest token transfers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">Transfer</Badge>
                      <div className="text-sm">
                        <div className="font-mono text-xs text-muted-foreground">
                          {i} minutes ago
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{(1000 * i).toLocaleString()} {token.symbol}</div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 text-xs"
                        onClick={() => window.open('https://solscan.io', '_blank')}
                      >
                        View on Solscan
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-center justify-center text-muted-foreground">
                  Pie chart placeholder
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Volume History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-center justify-center text-muted-foreground">
                  Bar chart placeholder
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TokenDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Skeleton className="w-20 h-20 rounded-full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-full max-w-md" />
              <Skeleton className="h-6 w-48" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
