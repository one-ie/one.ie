/**
 * GasEstimator Component
 *
 * Display gas price tiers and estimated transaction costs.
 * Uses 6-token design system with price comparison.
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export interface GasTier {
  name: "slow" | "standard" | "fast";
  maxFeePerGas: number;
  maxPriorityFeePerGas: number;
  estimatedTime: string;
}

interface GasEstimatorProps {
  gasLimit: number;
  tiers: GasTier[];
  ethPriceUSD?: number;
  onSelectTier?: (tier: GasTier) => void;
  className?: string;
}

export function GasEstimator({
  gasLimit,
  tiers,
  ethPriceUSD = 2000,
  onSelectTier,
  className,
}: GasEstimatorProps) {
  const [selectedTier, setSelectedTier] = useState<GasTier>(tiers[1]); // Default to standard

  const calculateCost = (tier: GasTier) => {
    const costGwei = (tier.maxFeePerGas * gasLimit) / 1e9;
    const costETH = costGwei;
    const costUSD = costETH * ethPriceUSD;
    return { costGwei, costETH, costUSD };
  };

  const handleSelect = (tier: GasTier) => {
    setSelectedTier(tier);
    onSelectTier?.(tier);
  };

  const tierColors: Record<string, string> = {
    slow: "bg-secondary text-white",
    standard: "bg-primary text-white",
    fast: "bg-tertiary text-white",
  };

  const tierLabels: Record<string, string> = {
    slow: "🐢 Slow",
    standard: "⚡ Standard",
    fast: "🚀 Fast",
  };

  return (
    <Card className={`bg-background p-1 shadow-sm rounded-md ${className || ""}`}>
      <CardContent className="bg-foreground p-4 rounded-md">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-font text-lg">Gas Price</CardTitle>
          <p className="text-font/60 text-sm">
            Choose your transaction speed
          </p>
        </CardHeader>

        {/* Gas Price Tiers */}
        <RadioGroup
          value={selectedTier.name}
          onValueChange={(value) => {
            const tier = tiers.find((t) => t.name === value);
            if (tier) handleSelect(tier);
          }}
          className="space-y-3 mt-4"
        >
          {tiers.map((tier) => {
            const { costETH, costUSD } = calculateCost(tier);

            return (
              <div
                key={tier.name}
                className={`border-2 rounded-md p-3 cursor-pointer transition-all ${
                  selectedTier.name === tier.name
                    ? "border-primary bg-primary/5"
                    : "border-transparent bg-background hover:border-primary/30"
                }`}
                onClick={() => handleSelect(tier)}
              >
                <div className="flex items-start gap-3">
                  <RadioGroupItem
                    value={tier.name}
                    id={tier.name}
                    className="mt-1"
                  />
                  <Label htmlFor={tier.name} className="flex-1 cursor-pointer">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-font font-medium">
                          {tierLabels[tier.name]}
                        </span>
                        <Badge className={tierColors[tier.name]}>
                          {tier.estimatedTime}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-font font-semibold">
                          ${costUSD.toFixed(2)}
                        </div>
                        <div className="text-font/60 text-xs">
                          {costETH.toFixed(6)} ETH
                        </div>
                      </div>
                    </div>

                    {/* Gas Details */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-font/60">Base Fee: </span>
                        <span className="text-font font-mono">
                          {tier.maxFeePerGas} Gwei
                        </span>
                      </div>
                      <div>
                        <span className="text-font/60">Priority: </span>
                        <span className="text-font font-mono">
                          {tier.maxPriorityFeePerGas} Gwei
                        </span>
                      </div>
                    </div>
                  </Label>
                </div>
              </div>
            );
          })}
        </RadioGroup>

        {/* Gas Limit Info */}
        <div className="bg-background rounded-md p-3 mt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-font/60">Gas Limit:</span>
            <span className="text-font font-mono">{gasLimit.toLocaleString()} units</span>
          </div>
        </div>

        {/* Selected Summary */}
        <div className="bg-primary/10 border border-primary/20 rounded-md p-3 mt-4">
          <div className="text-sm mb-2">
            <span className="text-font/60">Selected: </span>
            <span className="text-font font-semibold">
              {tierLabels[selectedTier.name]}
            </span>
          </div>
          <div className="text-xs text-font/60">
            Your transaction will be processed in approximately{" "}
            <span className="text-font font-medium">{selectedTier.estimatedTime}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
