/**
 * TokenCard Component (CYCLE-023)
 *
 * Token display card with:
 * - Token metadata display
 * - Price and market stats
 * - Quick actions
 * - Real-time updates via Convex
 * - Responsive design
 * - Dark mode support
 */

'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  ExternalLink,
  MoreVertical,
  Edit,
  Share2,
  Copy
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface Token {
  _id: string;
  name: string;
  symbol: string;
  description?: string;
  image?: string;
  mintAddress: string;
  decimals: number;
  totalSupply: string;
  properties: {
    network: 'solana';
    price?: number;
    priceChange24h?: number;
    volume24h?: number;
    holders?: number;
    marketCap?: number;
    status?: 'active' | 'paused' | 'deprecated';
  };
  createdAt: number;
}

interface TokenCardProps {
  token: Token;
  variant?: 'default' | 'compact' | 'featured';
  showActions?: boolean;
  onSelect?: (tokenId: string) => void;
}

export function TokenCard({
  token,
  variant = 'default',
  showActions = true,
  onSelect
}: TokenCardProps) {
  const priceChange = token.properties.priceChange24h || 0;
  const isPositive = priceChange >= 0;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(token.mintAddress);
    toast.success('Token address copied to clipboard');
  };

  const handleShare = () => {
    const url = `${window.location.origin}/launchpad/${token._id}`;
    navigator.clipboard.writeText(url);
    toast.success('Token link copied to clipboard');
  };

  const formatNumber = (num: number | undefined) => {
    if (!num) return '0';
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toFixed(2);
  };

  if (variant === 'compact') {
    return (
      <div
        className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
        onClick={() => onSelect?.(token._id)}
      >
        {token.image ? (
          <img
            src={token.image}
            alt={token.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
            {token.symbol.slice(0, 2)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold truncate">{token.symbol}</span>
            {token.properties.status === 'active' && (
              <Badge variant="outline" className="text-xs">Active</Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground truncate">{token.name}</div>
        </div>
        {token.properties.price && (
          <div className="text-right">
            <div className="font-semibold">${token.properties.price.toFixed(4)}</div>
            <div className={`text-xs flex items-center gap-1 ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(priceChange).toFixed(2)}%
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {token.image ? (
              <img
                src={token.image}
                alt={token.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">
                {token.symbol.slice(0, 2)}
              </div>
            )}
            <div>
              <CardTitle className="text-xl">{token.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{token.symbol}</Badge>
                {token.properties.status && (
                  <Badge variant={token.properties.status === 'active' ? 'default' : 'secondary'}>
                    {token.properties.status}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onSelect?.(token._id)}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyAddress}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Address
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {token.description && (
          <CardDescription className="line-clamp-2 mt-2">
            {token.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent>
        {/* Price Stats */}
        {token.properties.price && (
          <div className="mb-4 p-4 rounded-lg bg-muted">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-bold">${token.properties.price.toFixed(4)}</span>
              <span className={`text-sm font-semibold flex items-center gap-1 ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {Math.abs(priceChange).toFixed(2)}%
              </span>
            </div>
            <div className="text-xs text-muted-foreground">24h Change</div>
          </div>
        )}

        {/* Token Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-1 text-muted-foreground text-sm mb-1">
              <Users className="w-4 h-4" />
              Holders
            </div>
            <div className="font-semibold">{formatNumber(token.properties.holders)}</div>
          </div>

          <div>
            <div className="flex items-center gap-1 text-muted-foreground text-sm mb-1">
              <Activity className="w-4 h-4" />
              Volume 24h
            </div>
            <div className="font-semibold">${formatNumber(token.properties.volume24h)}</div>
          </div>

          {token.properties.marketCap && (
            <>
              <div>
                <div className="text-muted-foreground text-sm mb-1">Market Cap</div>
                <div className="font-semibold">${formatNumber(token.properties.marketCap)}</div>
              </div>

              <div>
                <div className="text-muted-foreground text-sm mb-1">Supply</div>
                <div className="font-semibold">{formatNumber(Number(token.totalSupply))}</div>
              </div>
            </>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button
          className="flex-1"
          onClick={() => onSelect?.(token._id)}
        >
          View Dashboard
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => window.open(`https://solscan.io/token/${token.mintAddress}`, '_blank')}
        >
          <ExternalLink className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

export function TokenCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}
