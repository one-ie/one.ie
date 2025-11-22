/**
 * SmartContract Component
 *
 * Display smart contract overview with verification status.
 * Uses 6-token design system.
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export interface ContractData {
  address: string;
  name?: string;
  verified: boolean;
  compiler?: string;
  optimization?: boolean;
  license?: string;
  balance: string;
  transactionCount: number;
  createdAt?: Date;
  creator?: string;
}

interface SmartContractProps {
  contract: ContractData;
  onViewCode?: () => void;
  onInteract?: () => void;
  explorerUrl?: string;
  className?: string;
}

export function SmartContract({
  contract,
  onViewCode,
  onInteract,
  explorerUrl,
  className,
}: SmartContractProps) {
  return (
    <Card className={`bg-background p-1 shadow-sm rounded-md ${className || ""}`}>
      <CardContent className="bg-foreground p-4 rounded-md">
        <CardHeader className="px-0 pt-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-font text-lg">
                {contract.name || "Smart Contract"}
              </CardTitle>
              <div className="text-font/60 text-xs font-mono mt-1">
                {contract.address}
              </div>
            </div>
            <Badge
              className={
                contract.verified
                  ? "bg-tertiary text-white"
                  : "bg-secondary text-white"
              }
            >
              {contract.verified ? "✓ Verified" : "Unverified"}
            </Badge>
          </div>
        </CardHeader>

        {/* Balance & Transactions */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-background rounded-md p-3">
            <div className="text-font/60 text-xs mb-1">Balance</div>
            <div className="text-font font-semibold">{contract.balance} ETH</div>
          </div>
          <div className="bg-background rounded-md p-3">
            <div className="text-font/60 text-xs mb-1">Transactions</div>
            <div className="text-font font-semibold">
              {contract.transactionCount.toLocaleString()}
            </div>
          </div>
        </div>

        {contract.verified && (
          <>
            <Separator className="my-4" />

            {/* Contract Info */}
            <div className="space-y-2 text-sm mb-4">
              {contract.compiler && (
                <div className="flex items-center justify-between p-2 bg-background rounded-md">
                  <span className="text-font/60">Compiler</span>
                  <span className="text-font font-mono text-xs">
                    {contract.compiler}
                  </span>
                </div>
              )}
              {contract.optimization !== undefined && (
                <div className="flex items-center justify-between p-2 bg-background rounded-md">
                  <span className="text-font/60">Optimization</span>
                  <Badge variant={contract.optimization ? "secondary" : "outline"}>
                    {contract.optimization ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              )}
              {contract.license && (
                <div className="flex items-center justify-between p-2 bg-background rounded-md">
                  <span className="text-font/60">License</span>
                  <Badge variant="secondary">{contract.license}</Badge>
                </div>
              )}
            </div>
          </>
        )}

        {/* Creator & Date */}
        {(contract.creator || contract.createdAt) && (
          <>
            <Separator className="my-4" />
            <div className="space-y-2 text-sm">
              {contract.creator && (
                <div className="flex items-center justify-between">
                  <span className="text-font/60">Creator</span>
                  <span className="text-font font-mono text-xs">
                    {contract.creator.slice(0, 6)}...{contract.creator.slice(-4)}
                  </span>
                </div>
              )}
              {contract.createdAt && (
                <div className="flex items-center justify-between">
                  <span className="text-font/60">Created</span>
                  <span className="text-font text-xs">
                    {contract.createdAt.toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </>
        )}

        <Separator className="my-4" />

        {/* Actions */}
        <div className="flex gap-2">
          {contract.verified && onViewCode && (
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={onViewCode}
            >
              View Code
            </Button>
          )}
          {onInteract && (
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              onClick={onInteract}
            >
              Interact
            </Button>
          )}
          {explorerUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
                Explorer
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
