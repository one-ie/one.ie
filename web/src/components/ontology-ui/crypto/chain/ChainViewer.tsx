/**
 * ChainViewer Component
 *
 * Comprehensive blockchain viewer with recent blocks and transactions.
 * Uses 6-token design system.
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export interface RecentBlock {
  number: number;
  hash: string;
  timestamp: Date;
  transactionCount: number;
  miner: string;
}

export interface RecentTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: Date;
}

interface ChainViewerProps {
  chainName: string;
  recentBlocks: RecentBlock[];
  recentTransactions: RecentTransaction[];
  onViewBlock?: (blockNumber: number) => void;
  onViewTransaction?: (hash: string) => void;
  className?: string;
}

export function ChainViewer({
  chainName,
  recentBlocks,
  recentTransactions,
  onViewBlock,
  onViewTransaction,
  className,
}: ChainViewerProps) {
  const [activeTab, setActiveTab] = useState("blocks");

  return (
    <Card className={`bg-background p-1 shadow-sm rounded-md ${className || ""}`}>
      <CardContent className="bg-foreground p-4 rounded-md">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-font text-lg">{chainName} Explorer</CardTitle>
          <p className="text-font/60 text-sm">
            Recent blocks and transactions
          </p>
        </CardHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2 bg-background">
            <TabsTrigger value="blocks">Blocks ({recentBlocks.length})</TabsTrigger>
            <TabsTrigger value="transactions">
              Transactions ({recentTransactions.length})
            </TabsTrigger>
          </TabsList>

          {/* Blocks Tab */}
          <TabsContent value="blocks" className="space-y-2 mt-4">
            {recentBlocks.map((block) => (
              <div
                key={block.number}
                className="bg-background rounded-md p-3 hover:shadow-sm transition-shadow cursor-pointer"
                onClick={() => onViewBlock?.(block.number)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">#{block.number}</Badge>
                    <span className="text-font/60 text-xs">
                      {new Date(block.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <Badge className="bg-tertiary text-white">
                    {block.transactionCount} txs
                  </Badge>
                </div>
                <div className="space-y-1 text-xs">
                  <div>
                    <span className="text-font/60">Hash: </span>
                    <span className="text-font font-mono">
                      {block.hash.slice(0, 10)}...{block.hash.slice(-8)}
                    </span>
                  </div>
                  <div>
                    <span className="text-font/60">Miner: </span>
                    <span className="text-font font-mono">
                      {block.miner.slice(0, 6)}...{block.miner.slice(-4)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-2 mt-4">
            {recentTransactions.map((tx) => (
              <div
                key={tx.hash}
                className="bg-background rounded-md p-3 hover:shadow-sm transition-shadow cursor-pointer"
                onClick={() => onViewTransaction?.(tx.hash)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-font font-mono text-xs">
                    {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                  </span>
                  <span className="text-font/60 text-xs">
                    {new Date(tx.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-font/60">From: </span>
                    <span className="text-font font-mono">
                      {tx.from.slice(0, 6)}...{tx.from.slice(-4)}
                    </span>
                  </div>
                  <span className="text-font/60">→</span>
                  <div>
                    <span className="text-font/60">To: </span>
                    <span className="text-font font-mono">
                      {tx.to.slice(0, 6)}...{tx.to.slice(-4)}
                    </span>
                  </div>
                </div>
                <div className="text-font font-semibold text-sm mt-2">
                  {tx.value} ETH
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
