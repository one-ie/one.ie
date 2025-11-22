/**
 * BlockExplorer Component
 *
 * Search and navigate blockchain data.
 * Uses 6-token design system with search interface.
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type SearchType = "address" | "transaction" | "block";

interface SearchResult {
  type: SearchType;
  value: string;
  label?: string;
  metadata?: string;
}

interface BlockExplorerProps {
  onSearch?: (query: string, type: SearchType) => Promise<SearchResult[]>;
  onNavigate?: (result: SearchResult) => void;
  className?: string;
}

export function BlockExplorer({
  onSearch,
  onNavigate,
  className,
}: BlockExplorerProps) {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("address");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!query || !onSearch) return;

    setIsSearching(true);
    try {
      const searchResults = await onSearch(query, searchType);
      setResults(searchResults);
    } finally {
      setIsSearching(false);
    }
  };

  const getPlaceholder = () => {
    switch (searchType) {
      case "address":
        return "0x... or ENS name";
      case "transaction":
        return "Transaction hash (0x...)";
      case "block":
        return "Block number or hash";
      default:
        return "Search...";
    }
  };

  const typeIcons: Record<SearchType, string> = {
    address: "👤",
    transaction: "📝",
    block: "📦",
  };

  return (
    <Card className={`bg-background p-1 shadow-sm rounded-md ${className || ""}`}>
      <CardContent className="bg-foreground p-4 rounded-md">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-font text-lg">Block Explorer</CardTitle>
          <p className="text-font/60 text-sm">
            Search addresses, transactions, and blocks
          </p>
        </CardHeader>

        {/* Search Type Tabs */}
        <Tabs
          value={searchType}
          onValueChange={(value: any) => setSearchType(value)}
          className="mt-4"
        >
          <TabsList className="grid w-full grid-cols-3 bg-background mb-4">
            <TabsTrigger value="address">
              {typeIcons.address} Address
            </TabsTrigger>
            <TabsTrigger value="transaction">
              {typeIcons.transaction} Tx
            </TabsTrigger>
            <TabsTrigger value="block">
              {typeIcons.block} Block
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search Input */}
        <div className="flex gap-2 mb-4">
          <Input
            placeholder={getPlaceholder()}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="bg-background font-mono"
          />
          <Button
            variant="primary"
            onClick={handleSearch}
            disabled={!query || isSearching}
          >
            {isSearching ? "..." : "Search"}
          </Button>
        </div>

        {/* Search Results */}
        {results.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-font font-medium text-sm">
              Results ({results.length})
            </h4>
            {results.map((result, index) => (
              <div
                key={index}
                className="bg-background rounded-md p-3 hover:shadow-sm transition-shadow cursor-pointer"
                onClick={() => onNavigate?.(result)}
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">
                    {typeIcons[result.type]} {result.type}
                  </Badge>
                  {result.label && (
                    <span className="text-font text-sm">{result.label}</span>
                  )}
                </div>
                <div className="text-font font-mono text-xs break-all">
                  {result.value}
                </div>
                {result.metadata && (
                  <div className="text-font/60 text-xs mt-1">
                    {result.metadata}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {results.length === 0 && query && !isSearching && (
          <div className="bg-background rounded-md p-8 text-center">
            <p className="text-font/60">No results found</p>
          </div>
        )}

        {/* Quick Links */}
        <div className="bg-background rounded-md p-3 mt-4">
          <div className="text-font/60 text-xs mb-2">Quick Links</div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setQuery("");
                setResults([]);
              }}
            >
              Latest Blocks
            </Button>
            <Button variant="ghost" size="sm">
              Latest Transactions
            </Button>
            <Button variant="ghost" size="sm">
              Top Accounts
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
