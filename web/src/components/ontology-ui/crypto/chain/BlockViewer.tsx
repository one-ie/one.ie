/**
 * BlockViewer Component
 *
 * Display detailed block information.
 * Uses 6-token design system.
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export interface BlockData {
  number: number;
  hash: string;
  parentHash: string;
  timestamp: Date;
  miner: string;
  difficulty: string;
  totalDifficulty: string;
  size: number;
  gasUsed: number;
  gasLimit: number;
  transactionCount: number;
  baseFeePerGas?: number;
  extraData?: string;
}

interface BlockViewerProps {
  block: BlockData;
  onViewTransaction?: (hash: string) => void;
  explorerUrl?: string;
  className?: string;
}

export function BlockViewer({
  block,
  onViewTransaction,
  explorerUrl,
  className,
}: BlockViewerProps) {
  const gasUtilization = (block.gasUsed / block.gasLimit) * 100;

  return (
    <Card className={`bg-background p-1 shadow-sm rounded-md ${className || ""}`}>
      <CardContent className="bg-foreground p-4 rounded-md">
        <CardHeader className="px-0 pt-0">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-font text-lg">Block Details</CardTitle>
              <div className="text-font/60 text-sm mt-1">
                #{block.number.toLocaleString()}
              </div>
            </div>
            <Badge variant="secondary">{block.transactionCount} txs</Badge>
          </div>
        </CardHeader>

        {/* Hash */}
        <div className="bg-background rounded-md p-3 mb-4">
          <div className="text-font/60 text-xs mb-1">Block Hash</div>
          <div className="text-font font-mono text-xs break-all">
            {block.hash}
          </div>
        </div>

        {/* Timestamp & Miner */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-background rounded-md p-3">
            <div className="text-font/60 text-xs mb-1">Timestamp</div>
            <div className="text-font text-sm">
              {block.timestamp.toLocaleString()}
            </div>
          </div>
          <div className="bg-background rounded-md p-3">
            <div className="text-font/60 text-xs mb-1">Size</div>
            <div className="text-font text-sm font-semibold">
              {(block.size / 1024).toFixed(2)} KB
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Gas Usage */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-font/60">Gas Used</span>
            <span className="text-font font-medium">
              {block.gasUsed.toLocaleString()} / {block.gasLimit.toLocaleString()}
            </span>
          </div>
          <div className="bg-background rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-tertiary rounded-full transition-all duration-300"
              style={{ width: `${gasUtilization}%` }}
            />
          </div>
          <div className="text-font/60 text-xs mt-1 text-right">
            {gasUtilization.toFixed(1)}% utilized
          </div>
        </div>

        {/* Miner */}
        <div className="bg-background rounded-md p-3 mb-4">
          <div className="text-font/60 text-xs mb-1">Miner</div>
          <div className="text-font font-mono text-sm">
            {block.miner}
          </div>
        </div>

        {/* Additional Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between p-2 bg-background rounded-md">
            <span className="text-font/60">Parent Hash</span>
            <span className="text-font font-mono text-xs truncate max-w-[150px]">
              {block.parentHash}
            </span>
          </div>

          {block.baseFeePerGas !== undefined && (
            <div className="flex items-center justify-between p-2 bg-background rounded-md">
              <span className="text-font/60">Base Fee</span>
              <span className="text-font font-mono">
                {block.baseFeePerGas} Gwei
              </span>
            </div>
          )}

          <div className="flex items-center justify-between p-2 bg-background rounded-md">
            <span className="text-font/60">Difficulty</span>
            <span className="text-font font-mono text-xs">
              {block.difficulty}
            </span>
          </div>
        </div>

        {explorerUrl && (
          <>
            <Separator className="my-4" />
            <Button variant="outline" className="w-full" asChild>
              <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
                View on Block Explorer
              </a>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
