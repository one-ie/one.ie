/**
 * Treasury Overview Component
 *
 * Displays DAO treasury holdings and total value.
 *
 * @dimension things (treasury)
 * @category solana-components
 */

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Wallet, TrendingUp, Coins, ExternalLink } from 'lucide-react';
import type { Id } from '@/convex/_generated/dataModel';

interface TreasuryOverviewProps {
  daoId: string;
}

export function TreasuryOverview({ daoId }: TreasuryOverviewProps) {
  const treasury = useQuery(api.queries.dao.getTreasury, {
    daoId: daoId as Id<'things'>,
  });

  if (treasury === undefined) {
    return <TreasuryOverviewSkeleton />;
  }

  if (!treasury) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Treasury not found</p>
        </CardContent>
      </Card>
    );
  }

  const holdings = treasury.properties?.holdings || [];
  const totalValueUSD = treasury.properties?.totalValueUSD || 0;
  const treasuryAddress = treasury.properties?.walletAddress || '';

  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatTokenAmount = (balance: string) => {
    // Assuming 9 decimals for Solana tokens
    const amount = Number(balance) / 1e9;
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Treasury Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Treasury Overview
              </CardTitle>
              <CardDescription className="mt-2">
                Community-controlled funds
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{formatUSD(totalValueUSD)}</p>
              <p className="text-sm text-muted-foreground">Total Value</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs">
              {treasuryAddress.slice(0, 8)}...{treasuryAddress.slice(-8)}
            </Badge>
            <a
              href={`https://explorer.solana.com/address/${treasuryAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              View on Explorer
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Holdings List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Holdings
          </CardTitle>
          <CardDescription>
            {holdings.length} token{holdings.length !== 1 ? 's' : ''} in treasury
          </CardDescription>
        </CardHeader>
        <CardContent>
          {holdings.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No holdings in treasury yet</p>
              <p className="text-sm mt-1">
                Treasury will receive funds through proposals
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {holdings.map((holding, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center text-white font-bold">
                      {holding.mint.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">
                        {formatTokenAmount(holding.balance)}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {holding.mint.slice(0, 8)}...{holding.mint.slice(-8)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatUSD(holding.valueUSD)}</p>
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <TrendingUp className="h-3 w-3" />
                      <span>Live</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TreasuryOverviewSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-12 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-6 w-64" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
