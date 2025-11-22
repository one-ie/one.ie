/**
 * TransactionSigner Component
 *
 * Sign transaction with wallet confirmation UI.
 * Uses 6-token design system with security warnings.
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export interface UnsignedTransaction {
  to: string;
  value: string;
  data?: string;
  gasLimit: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  nonce: number;
  chainId: number;
}

interface TransactionSignerProps {
  transaction: UnsignedTransaction;
  estimatedCostETH: number;
  estimatedCostUSD: number;
  onSign?: () => Promise<void>;
  onReject?: () => void;
  warningMessage?: string;
  className?: string;
}

export function TransactionSigner({
  transaction,
  estimatedCostETH,
  estimatedCostUSD,
  onSign,
  onReject,
  warningMessage,
  className,
}: TransactionSignerProps) {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSigning, setIsSigning] = useState(false);

  const handleSign = async () => {
    if (!onSign || !isConfirmed) return;

    setIsSigning(true);
    try {
      await onSign();
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <Card className={`bg-background p-1 shadow-sm rounded-md ${className || ""}`}>
      <CardContent className="bg-foreground p-4 rounded-md">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-font text-lg">Sign Transaction</CardTitle>
          <p className="text-font/60 text-sm">
            Review and confirm transaction details
          </p>
        </CardHeader>

        {/* Warning Message */}
        {warningMessage && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 mb-4">
            <div className="flex gap-2">
              <span className="text-destructive">⚠️</span>
              <p className="text-destructive text-sm">{warningMessage}</p>
            </div>
          </div>
        )}

        {/* Transaction Summary */}
        <div className="bg-background rounded-md p-4 mb-4">
          <div className="space-y-3">
            {/* Value */}
            <div>
              <div className="text-font/60 text-xs mb-1">Sending</div>
              <div className="text-font font-semibold text-2xl">
                {transaction.value} ETH
              </div>
            </div>

            <Separator />

            {/* Recipient */}
            <div>
              <div className="text-font/60 text-xs mb-1">To</div>
              <div className="text-font font-mono text-sm break-all">
                {transaction.to}
              </div>
            </div>

            <Separator />

            {/* Network */}
            <div className="flex items-center justify-between">
              <span className="text-font/60 text-sm">Network</span>
              <Badge variant="secondary">
                Chain ID: {transaction.chainId}
              </Badge>
            </div>

            {/* Nonce */}
            <div className="flex items-center justify-between">
              <span className="text-font/60 text-sm">Nonce</span>
              <span className="text-font font-mono">{transaction.nonce}</span>
            </div>
          </div>
        </div>

        {/* Gas Details */}
        <div className="bg-background rounded-md p-3 mb-4">
          <div className="text-font/60 text-xs mb-3">Gas Fees</div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <div className="text-font/60 text-xs">Gas Limit</div>
              <div className="text-font font-mono text-sm">
                {transaction.gasLimit}
              </div>
            </div>
            <div>
              <div className="text-font/60 text-xs">Max Fee</div>
              <div className="text-font font-mono text-sm">
                {transaction.maxFeePerGas} Gwei
              </div>
            </div>
          </div>
          <Separator className="my-2" />
          <div className="flex items-center justify-between">
            <span className="text-font/60 text-sm">Estimated Cost</span>
            <div className="text-right">
              <div className="text-font font-semibold">
                ${estimatedCostUSD.toFixed(2)}
              </div>
              <div className="text-font/60 text-xs">
                {estimatedCostETH.toFixed(6)} ETH
              </div>
            </div>
          </div>
        </div>

        {/* Data (if exists) */}
        {transaction.data && transaction.data !== "0x" && (
          <div className="bg-background rounded-md p-3 mb-4">
            <div className="text-font/60 text-xs mb-2">Contract Interaction</div>
            <div className="text-font font-mono text-xs break-all">
              {transaction.data.slice(0, 100)}
              {transaction.data.length > 100 && "..."}
            </div>
          </div>
        )}

        {/* Confirmation Checkbox */}
        <div className="flex items-start gap-3 p-3 bg-background rounded-md mb-4">
          <Checkbox
            id="confirm"
            checked={isConfirmed}
            onCheckedChange={(checked) => setIsConfirmed(checked as boolean)}
          />
          <Label htmlFor="confirm" className="text-font text-sm cursor-pointer">
            I have reviewed the transaction details and understand that this
            action is irreversible.
          </Label>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onReject}
            disabled={isSigning}
          >
            Reject
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleSign}
            disabled={!isConfirmed || isSigning}
          >
            {isSigning ? "Signing..." : "Sign & Send"}
          </Button>
        </div>

        {/* Security Notice */}
        <div className="bg-background rounded-md p-3 mt-4">
          <p className="text-font/60 text-xs text-center">
            🔒 This transaction will be signed with your connected wallet
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
