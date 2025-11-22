/**
 * TransactionViewer Component
 *
 * Detailed transaction viewer with all transaction data.
 * Uses 6-token design system with expandable sections.
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface TransactionDetails {
  hash: string;
  status: "pending" | "confirmed" | "failed";
  blockNumber?: number;
  blockHash?: string;
  from: string;
  to: string;
  value: string;
  gasLimit: string;
  gasUsed?: string;
  gasPrice: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  nonce: number;
  data?: string;
  logs?: TransactionLog[];
  timestamp?: Date;
  confirmations?: number;
}

export interface TransactionLog {
  address: string;
  topics: string[];
  data: string;
  logIndex: number;
}

interface TransactionViewerProps {
  transaction: TransactionDetails;
  onCopyHash?: () => void;
  explorerUrl?: string;
  className?: string;
}

export function TransactionViewer({
  transaction,
  onCopyHash,
  explorerUrl,
  className,
}: TransactionViewerProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const statusColors: Record<string, string> = {
    pending: "bg-secondary text-white",
    confirmed: "bg-tertiary text-white",
    failed: "bg-destructive text-white",
  };

  return (
    <Card className={`bg-background p-1 shadow-sm rounded-md ${className || ""}`}>
      <CardContent className="bg-foreground p-4 rounded-md">
        <CardHeader className="px-0 pt-0">
          <div className="flex items-start justify-between mb-2">
            <CardTitle className="text-font text-lg">Transaction Details</CardTitle>
            <Badge className={statusColors[transaction.status]}>
              {transaction.status}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-font/60 text-xs font-mono">
              {transaction.hash}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCopyHash}
              className="h-6 px-2 text-xs"
            >
              Copy
            </Button>
          </div>
        </CardHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3 bg-background">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="logs">
              Logs {transaction.logs && `(${transaction.logs.length})`}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-3 mt-4">
            <div className="bg-background rounded-md p-3">
              <div className="text-font/60 text-xs mb-2">Value</div>
              <div className="text-font font-semibold text-xl">
                {transaction.value} ETH
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between p-2 bg-background rounded-md">
                <span className="text-font/60">From</span>
                <span className="text-font font-mono text-xs">
                  {transaction.from}
                </span>
              </div>
              <div className="flex items-center justify-center">
                <div className="text-font/60">↓</div>
              </div>
              <div className="flex items-center justify-between p-2 bg-background rounded-md">
                <span className="text-font/60">To</span>
                <span className="text-font font-mono text-xs">
                  {transaction.to}
                </span>
              </div>
            </div>

            {transaction.timestamp && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-font/60">Timestamp</span>
                <span className="text-font">
                  {transaction.timestamp.toLocaleString()}
                </span>
              </div>
            )}

            {transaction.confirmations !== undefined && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-font/60">Confirmations</span>
                <Badge variant="secondary">{transaction.confirmations}</Badge>
              </div>
            )}
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-2 mt-4">
            <div className="space-y-2 text-sm">
              {transaction.blockNumber && (
                <div className="flex items-center justify-between p-2 bg-background rounded-md">
                  <span className="text-font/60">Block Number</span>
                  <span className="text-font font-mono">
                    {transaction.blockNumber}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between p-2 bg-background rounded-md">
                <span className="text-font/60">Nonce</span>
                <span className="text-font font-mono">{transaction.nonce}</span>
              </div>

              <div className="flex items-center justify-between p-2 bg-background rounded-md">
                <span className="text-font/60">Gas Limit</span>
                <span className="text-font font-mono">
                  {transaction.gasLimit}
                </span>
              </div>

              {transaction.gasUsed && (
                <div className="flex items-center justify-between p-2 bg-background rounded-md">
                  <span className="text-font/60">Gas Used</span>
                  <span className="text-font font-mono">
                    {transaction.gasUsed}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between p-2 bg-background rounded-md">
                <span className="text-font/60">Gas Price</span>
                <span className="text-font font-mono">
                  {transaction.gasPrice} Gwei
                </span>
              </div>

              {transaction.maxFeePerGas && (
                <div className="flex items-center justify-between p-2 bg-background rounded-md">
                  <span className="text-font/60">Max Fee Per Gas</span>
                  <span className="text-font font-mono">
                    {transaction.maxFeePerGas} Gwei
                  </span>
                </div>
              )}

              {transaction.maxPriorityFeePerGas && (
                <div className="flex items-center justify-between p-2 bg-background rounded-md">
                  <span className="text-font/60">Priority Fee</span>
                  <span className="text-font font-mono">
                    {transaction.maxPriorityFeePerGas} Gwei
                  </span>
                </div>
              )}

              {transaction.data && transaction.data !== "0x" && (
                <div className="p-2 bg-background rounded-md">
                  <div className="text-font/60 text-xs mb-2">Input Data</div>
                  <div className="text-font font-mono text-xs break-all">
                    {transaction.data}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="space-y-2 mt-4">
            {transaction.logs && transaction.logs.length > 0 ? (
              transaction.logs.map((log, index) => (
                <div key={index} className="bg-background rounded-md p-3 text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-font font-medium">Log {index}</span>
                    <Badge variant="secondary">
                      Index {log.logIndex}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div>
                      <span className="text-font/60">Address: </span>
                      <span className="text-font font-mono">{log.address}</span>
                    </div>
                    <div>
                      <span className="text-font/60">Topics: </span>
                      <span className="text-font font-mono">
                        {log.topics.length} topics
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-background rounded-md p-8 text-center">
                <p className="text-font/60">No logs emitted</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {explorerUrl && (
          <>
            <Separator className="my-4" />
            <Button
              variant="outline"
              className="w-full"
              asChild
            >
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
