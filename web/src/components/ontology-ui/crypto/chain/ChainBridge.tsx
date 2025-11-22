/**
 * ChainBridge Component
 *
 * Cross-chain bridge interface for transferring assets.
 * Uses 6-token design system.
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export interface BridgeChain {
  chainId: number;
  name: string;
  logo?: string;
  balance: string;
}

interface ChainBridgeProps {
  fromChain: BridgeChain;
  toChain: BridgeChain;
  onSwapChains?: () => void;
  onBridge?: (amount: string) => Promise<void>;
  estimatedFee?: string;
  estimatedTime?: string;
  className?: string;
}

export function ChainBridge({
  fromChain,
  toChain,
  onSwapChains,
  onBridge,
  estimatedFee = "~0.005 ETH",
  estimatedTime = "~5-10 minutes",
  className,
}: ChainBridgeProps) {
  const [amount, setAmount] = useState("");
  const [isBridging, setIsBridging] = useState(false);

  const handleBridge = async () => {
    if (!onBridge || !amount) return;
    setIsBridging(true);
    try {
      await onBridge(amount);
      setAmount("");
    } finally {
      setIsBridging(false);
    }
  };

  const isValid = amount && parseFloat(amount) > 0;

  return (
    <Card className={`bg-background p-1 shadow-sm rounded-md ${className || ""}`}>
      <CardContent className="bg-foreground p-4 rounded-md">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-font text-lg">Bridge Assets</CardTitle>
          <p className="text-font/60 text-sm">
            Transfer assets between blockchains
          </p>
        </CardHeader>

        {/* From Chain */}
        <div className="mb-3">
          <Label className="text-font text-sm mb-2 block">From</Label>
          <div className="bg-background rounded-md p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {fromChain.logo && (
                  <img
                    src={fromChain.logo}
                    alt={fromChain.name}
                    className="h-6 w-6 rounded-full"
                  />
                )}
                <span className="text-font font-medium">{fromChain.name}</span>
              </div>
              <Badge variant="secondary">
                Balance: {fromChain.balance}
              </Badge>
            </div>
            <Input
              type="number"
              step="0.000001"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-foreground text-font text-lg font-semibold"
            />
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSwapChains}
            className="rounded-full h-8 w-8 p-0 bg-background hover:bg-primary/10"
          >
            <span className="text-font">⇅</span>
          </Button>
        </div>

        {/* To Chain */}
        <div className="mb-4">
          <Label className="text-font text-sm mb-2 block">To</Label>
          <div className="bg-background rounded-md p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {toChain.logo && (
                  <img
                    src={toChain.logo}
                    alt={toChain.name}
                    className="h-6 w-6 rounded-full"
                  />
                )}
                <span className="text-font font-medium">{toChain.name}</span>
              </div>
              <Badge variant="secondary">
                Balance: {toChain.balance}
              </Badge>
            </div>
            <div className="text-font/60 text-lg">
              {amount || "0.0"} (estimated)
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Fees & Time */}
        <div className="bg-background rounded-md p-3 mb-4">
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-font/60">Bridge Fee</span>
              <span className="text-font font-medium">{estimatedFee}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-font/60">Estimated Time</span>
              <span className="text-font font-medium">{estimatedTime}</span>
            </div>
            {amount && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-font/60">You will receive</span>
                  <span className="text-font font-semibold">
                    ~{(parseFloat(amount) * 0.995).toFixed(6)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Warning */}
        <div className="bg-secondary/10 border border-secondary/20 rounded-md p-3 mb-4">
          <p className="text-font/60 text-xs">
            ⚠️ Bridging assets involves risks. Always verify destination address
            and ensure you're using official bridges.
          </p>
        </div>

        {/* Bridge Button */}
        <Button
          variant="primary"
          className="w-full"
          onClick={handleBridge}
          disabled={!isValid || isBridging}
        >
          {isBridging ? "Bridging..." : "Bridge Assets"}
        </Button>
      </CardContent>
    </Card>
  );
}
