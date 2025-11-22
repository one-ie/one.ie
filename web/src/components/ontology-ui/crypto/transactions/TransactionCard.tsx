/**
 * TransactionCard Component
 *
 * Displays transaction summary in card format.
 * Uses 6-token design system with status badges.
 */

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  status: "pending" | "confirmed" | "failed";
  timestamp: Date;
  chainId: number;
  chainName: string;
  type: "send" | "receive" | "swap" | "approve" | "contract";
  gasUsed?: string;
  gasFee?: string;
}

interface TransactionCardProps {
  transaction: Transaction;
  onViewDetails?: (hash: string) => void;
  compact?: boolean;
  className?: string;
}

export function TransactionCard({
  transaction,
  onViewDetails,
  compact = false,
  className,
}: TransactionCardProps) {
  const statusColors: Record<string, string> = {
    pending: "bg-secondary text-white",
    confirmed: "bg-tertiary text-white",
    failed: "bg-destructive text-white",
  };

  const typeIcons: Record<string, string> = {
    send: "↑",
    receive: "↓",
    swap: "⇄",
    approve: "✓",
    contract: "⚙",
  };

  return (
    <Card
      className={`bg-background p-1 shadow-sm rounded-md hover:shadow-md transition-all duration-300 ${className || ""}`}
    >
      <CardContent className="bg-foreground p-3 rounded-md">
        <div className="flex items-start justify-between gap-3">
          {/* Icon and Type */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="flex-shrink-0 h-8 w-8 bg-background rounded-full flex items-center justify-center text-font">
              {typeIcons[transaction.type]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-font font-medium capitalize truncate">
                  {transaction.type}
                </span>
                <Badge className={statusColors[transaction.status]} >
                  {transaction.status}
                </Badge>
              </div>
              <div className="text-font/60 text-xs font-mono truncate">
                {transaction.hash.slice(0, 10)}...{transaction.hash.slice(-8)}
              </div>
            </div>
          </div>

          {/* Value and Details */}
          <div className="text-right flex-shrink-0">
            <div className="text-font font-semibold whitespace-nowrap">
              {transaction.value} ETH
            </div>
            <div className="text-font/60 text-xs">
              {transaction.timestamp.toLocaleDateString()}
            </div>
          </div>
        </div>

        {!compact && (
          <>
            {/* Addresses */}
            <div className="mt-3 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-font/60">From:</span>
                <span className="text-font font-mono">
                  {transaction.from.slice(0, 6)}...{transaction.from.slice(-4)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-font/60">To:</span>
                <span className="text-font font-mono">
                  {transaction.to.slice(0, 6)}...{transaction.to.slice(-4)}
                </span>
              </div>
              {transaction.gasFee && (
                <div className="flex items-center justify-between">
                  <span className="text-font/60">Gas Fee:</span>
                  <span className="text-font font-mono">{transaction.gasFee}</span>
                </div>
              )}
            </div>

            {/* View Details */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-3"
              onClick={() => onViewDetails?.(transaction.hash)}
            >
              View Details
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
