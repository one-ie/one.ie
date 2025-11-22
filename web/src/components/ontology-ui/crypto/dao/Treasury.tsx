/**
 * Treasury Component
 *
 * Displays DAO treasury holdings and transactions.
 * Uses 6-token design system with asset breakdown.
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

export interface TreasuryAsset {
  symbol: string;
  name: string;
  balance: number;
  valueUSD: number;
  percentage: number;
  logo?: string;
}

export interface TreasuryTransaction {
  id: string;
  type: "received" | "sent" | "swap";
  asset: string;
  amount: number;
  valueUSD: number;
  from?: string;
  to?: string;
  timestamp: Date;
  txHash: string;
}

interface TreasuryProps {
  totalValueUSD: number;
  assets: TreasuryAsset[];
  recentTransactions: TreasuryTransaction[];
  onViewAsset?: (symbol: string) => void;
  onViewTransaction?: (txHash: string) => void;
  className?: string;
}

export function Treasury({
  totalValueUSD,
  assets,
  recentTransactions,
  onViewAsset,
  onViewTransaction,
  className,
}: TreasuryProps) {
  const [activeTab, setActiveTab] = useState("assets");

  // Sort assets by value
  const sortedAssets = [...assets].sort((a, b) => b.valueUSD - a.valueUSD);

  return (
    <Card className={`bg-background p-1 shadow-sm rounded-md ${className || ""}`}>
      <CardContent className="bg-foreground p-4 rounded-md">
        <CardHeader className="px-0 pt-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-font text-lg">DAO Treasury</CardTitle>
            <Badge variant="secondary" className="text-base font-bold">
              ${totalValueUSD.toLocaleString()}
            </Badge>
          </div>
          <p className="text-font/60 text-sm">
            {assets.length} assets • {recentTransactions.length} recent transactions
          </p>
        </CardHeader>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2 bg-background">
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          {/* Assets Tab */}
          <TabsContent value="assets" className="space-y-3 mt-4">
            {sortedAssets.map((asset) => (
              <div
                key={asset.symbol}
                className="bg-background rounded-md p-3 hover:shadow-sm transition-shadow cursor-pointer"
                onClick={() => onViewAsset?.(asset.symbol)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {asset.logo && (
                      <img
                        src={asset.logo}
                        alt={asset.symbol}
                        className="h-8 w-8 rounded-full"
                      />
                    )}
                    <div>
                      <div className="text-font font-medium">{asset.symbol}</div>
                      <div className="text-font/60 text-xs">{asset.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-font font-semibold">
                      ${asset.valueUSD.toLocaleString()}
                    </div>
                    <div className="text-font/60 text-xs">
                      {asset.balance.toLocaleString()} {asset.symbol}
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-font/60">Portfolio</span>
                    <span className="text-font font-medium">
                      {asset.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={asset.percentage} className="h-1.5 bg-background">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${asset.percentage}%` }}
                    />
                  </Progress>
                </div>
              </div>
            ))}

            {sortedAssets.length === 0 && (
              <div className="bg-background rounded-md p-8 text-center">
                <p className="text-font/60">No assets in treasury</p>
              </div>
            )}
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-2 mt-4">
            {recentTransactions.map((tx) => {
              const typeColors = {
                received: "bg-tertiary text-white",
                sent: "bg-destructive text-white",
                swap: "bg-secondary text-white",
              };

              return (
                <div
                  key={tx.id}
                  className="bg-background rounded-md p-3 hover:shadow-sm transition-shadow cursor-pointer"
                  onClick={() => onViewTransaction?.(tx.txHash)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={typeColors[tx.type]}>
                        {tx.type}
                      </Badge>
                      <div>
                        <div className="text-font font-medium">
                          {tx.amount.toLocaleString()} {tx.asset}
                        </div>
                        <div className="text-font/60 text-xs">
                          ${tx.valueUSD.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-font/60 text-xs">
                        {new Date(tx.timestamp).toLocaleDateString()}
                      </div>
                      <div className="text-font/60 text-xs font-mono">
                        {tx.txHash.slice(0, 6)}...{tx.txHash.slice(-4)}
                      </div>
                    </div>
                  </div>
                  {(tx.from || tx.to) && (
                    <div className="text-font/60 text-xs">
                      {tx.from && <span>From: {tx.from.slice(0, 6)}...{tx.from.slice(-4)}</span>}
                      {tx.from && tx.to && <span className="mx-2">→</span>}
                      {tx.to && <span>To: {tx.to.slice(0, 6)}...{tx.to.slice(-4)}</span>}
                    </div>
                  )}
                </div>
              );
            })}

            {recentTransactions.length === 0 && (
              <div className="bg-background rounded-md p-8 text-center">
                <p className="text-font/60">No recent transactions</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
