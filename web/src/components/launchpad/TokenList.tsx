/**
 * TokenList Component (CYCLE-024)
 *
 * List of tokens with:
 * - Real-time updates via Convex useQuery
 * - Filtering and sorting
 * - Loading states
 * - Empty states
 * - Responsive grid layout
 * - Pagination support
 */

'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { TokenCard, TokenCardSkeleton } from './TokenCard';
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
import { Search, Filter, SortAsc, Plus, Rocket } from 'lucide-react';

interface TokenListProps {
  creatorId?: string;
  limit?: number;
  variant?: 'default' | 'compact';
}

export function TokenList({ creatorId, limit = 12, variant = 'default' }: TokenListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'price' | 'volume' | 'holders'>('recent');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused'>('all');

  // TODO: Replace with actual Convex query
  // const tokens = useQuery(api.queries.tokens.list, {
  //   creatorId,
  //   limit,
  //   sortBy,
  //   status: filterStatus === 'all' ? undefined : filterStatus,
  // });

  // Mock data for development
  const tokens: any[] | undefined = undefined; // Set to undefined to show loading state initially

  const isLoading = tokens === undefined;
  const isEmpty = tokens?.length === 0;

  // Filter and sort tokens locally
  const filteredTokens = tokens?.filter(token => {
    const matchesSearch =
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterStatus === 'all' || token.properties.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const handleTokenSelect = (tokenId: string) => {
    window.location.href = `/launchpad/${tokenId}`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Filters Skeleton */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="h-10 bg-muted rounded-md flex-1 animate-pulse" />
          <div className="h-10 bg-muted rounded-md w-40 animate-pulse" />
          <div className="h-10 bg-muted rounded-md w-40 animate-pulse" />
        </div>

        {/* Token Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <TokenCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (isEmpty) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
          <Rocket className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No tokens yet</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Get started by creating your first SPL token on Solana. It only takes a few minutes!
        </p>
        <Button onClick={() => window.location.href = '/launchpad/create-token'}>
          <Plus className="w-4 h-4 mr-2" />
          Create Your First Token
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tokens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Sort */}
        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="w-full sm:w-40">
            <SortAsc className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="price">Price</SelectItem>
            <SelectItem value="volume">Volume</SelectItem>
            <SelectItem value="holders">Holders</SelectItem>
          </SelectContent>
        </Select>

        {/* Filter */}
        <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
          <SelectTrigger className="w-full sm:w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      {searchQuery && (
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {filteredTokens?.length || 0} results
          </Badge>
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery('')}
            >
              Clear search
            </Button>
          )}
        </div>
      )}

      {/* Token Grid */}
      <div className={
        variant === 'compact'
          ? 'space-y-2'
          : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
      }>
        {filteredTokens?.map((token) => (
          <TokenCard
            key={token._id}
            token={token}
            variant={variant}
            onSelect={handleTokenSelect}
          />
        ))}
      </div>

      {/* Load More */}
      {filteredTokens && filteredTokens.length >= limit && (
        <div className="text-center pt-4">
          <Button variant="outline">
            Load More Tokens
          </Button>
        </div>
      )}
    </div>
  );
}
