/**
 * ChainStats Component
 *
 * Display blockchain statistics and metrics.
 * Uses 6-token design system with progress indicators.
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export interface ChainMetrics {
  blockHeight: number;
  blockTime: number;
  tps: number;
  gasPrice: {
    slow: number;
    standard: number;
    fast: number;
  };
  totalTransactions: number;
  totalAddresses: number;
  networkHashrate?: string;
  difficulty?: string;
}

interface ChainStatsProps {
  chainName: string;
  metrics: ChainMetrics;
  isLive?: boolean;
  className?: string;
}

export function ChainStats({
  chainName,
  metrics,
  isLive = true,
  className,
}: ChainStatsProps) {
  return (
    <Card className={`bg-background p-1 shadow-sm rounded-md ${className || ""}`}>
      <CardContent className="bg-foreground p-4 rounded-md">
        <CardHeader className="px-0 pt-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-font text-lg">{chainName} Stats</CardTitle>
            {isLive && (
              <Badge className="bg-tertiary text-white">
                <span className="animate-pulse mr-1">●</span> Live
              </Badge>
            )}
          </div>
        </CardHeader>

        {/* Primary Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-background rounded-md p-3">
            <div className="text-font/60 text-xs mb-1">Block Height</div>
            <div className="text-font font-semibold text-lg">
              #{metrics.blockHeight.toLocaleString()}
            </div>
          </div>
          <div className="bg-background rounded-md p-3">
            <div className="text-font/60 text-xs mb-1">Block Time</div>
            <div className="text-font font-semibold text-lg">
              {metrics.blockTime}s
            </div>
          </div>
          <div className="bg-background rounded-md p-3">
            <div className="text-font/60 text-xs mb-1">TPS</div>
            <div className="text-font font-semibold text-lg">
              {metrics.tps.toFixed(2)}
            </div>
          </div>
          <div className="bg-background rounded-md p-3">
            <div className="text-font/60 text-xs mb-1">Transactions</div>
            <div className="text-font font-semibold text-lg">
              {(metrics.totalTransactions / 1000000).toFixed(1)}M
            </div>
          </div>
        </div>

        {/* Gas Prices */}
        <div className="mb-4">
          <h4 className="text-font font-medium text-sm mb-3">Gas Prices (Gwei)</h4>
          <div className="space-y-2">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-font/60">🐢 Slow</span>
                <span className="text-font font-medium">
                  {metrics.gasPrice.slow} Gwei
                </span>
              </div>
              <Progress value={33} className="h-1.5 bg-background">
                <div
                  className="h-full bg-secondary rounded-full"
                  style={{ width: "33%" }}
                />
              </Progress>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-font/60">⚡ Standard</span>
                <span className="text-font font-medium">
                  {metrics.gasPrice.standard} Gwei
                </span>
              </div>
              <Progress value={66} className="h-1.5 bg-background">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: "66%" }}
                />
              </Progress>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-font/60">🚀 Fast</span>
                <span className="text-font font-medium">
                  {metrics.gasPrice.fast} Gwei
                </span>
              </div>
              <Progress value={100} className="h-1.5 bg-background">
                <div
                  className="h-full bg-tertiary rounded-full"
                  style={{ width: "100%" }}
                />
              </Progress>
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        {(metrics.networkHashrate || metrics.difficulty) && (
          <div className="grid grid-cols-2 gap-3">
            {metrics.networkHashrate && (
              <div className="bg-background rounded-md p-3">
                <div className="text-font/60 text-xs mb-1">Hashrate</div>
                <div className="text-font font-semibold">
                  {metrics.networkHashrate}
                </div>
              </div>
            )}
            {metrics.difficulty && (
              <div className="bg-background rounded-md p-3">
                <div className="text-font/60 text-xs mb-1">Difficulty</div>
                <div className="text-font font-semibold">
                  {metrics.difficulty}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
