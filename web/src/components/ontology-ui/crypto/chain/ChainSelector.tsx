/**
 * ChainSelector Component
 *
 * Select blockchain network with visual chain cards.
 * Uses 6-token design system.
 */

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export interface Chain {
  chainId: number;
  name: string;
  symbol: string;
  logo?: string;
  rpcUrl: string;
  explorerUrl: string;
  testnet?: boolean;
}

interface ChainSelectorProps {
  chains: Chain[];
  selectedChainId?: number;
  onSelectChain?: (chain: Chain) => void;
  showTestnets?: boolean;
  className?: string;
}

export function ChainSelector({
  chains,
  selectedChainId,
  onSelectChain,
  showTestnets = false,
  className,
}: ChainSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter chains
  const filteredChains = chains.filter((chain) => {
    const matchesSearch =
      chain.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chain.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTestnet = showTestnets || !chain.testnet;
    return matchesSearch && matchesTestnet;
  });

  return (
    <Card className={`bg-background p-1 shadow-sm rounded-md ${className || ""}`}>
      <CardContent className="bg-foreground p-4 rounded-md">
        <h3 className="text-font font-semibold text-lg mb-4">Select Network</h3>

        {/* Search */}
        <Input
          placeholder="Search networks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-background mb-4"
        />

        {/* Chain List */}
        <RadioGroup
          value={selectedChainId?.toString()}
          onValueChange={(value) => {
            const chain = chains.find((c) => c.chainId === parseInt(value));
            if (chain) onSelectChain?.(chain);
          }}
          className="space-y-2"
        >
          {filteredChains.map((chain) => (
            <div
              key={chain.chainId}
              className={`border-2 rounded-md p-3 cursor-pointer transition-all ${
                selectedChainId === chain.chainId
                  ? "border-primary bg-primary/5"
                  : "border-transparent bg-background hover:border-primary/30"
              }`}
              onClick={() => onSelectChain?.(chain)}
            >
              <div className="flex items-center gap-3">
                <RadioGroupItem
                  value={chain.chainId.toString()}
                  id={`chain-${chain.chainId}`}
                />
                {chain.logo && (
                  <img
                    src={chain.logo}
                    alt={chain.name}
                    className="h-8 w-8 rounded-full"
                  />
                )}
                <Label
                  htmlFor={`chain-${chain.chainId}`}
                  className="flex-1 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-font font-medium">{chain.name}</div>
                      <div className="text-font/60 text-xs">
                        Chain ID: {chain.chainId}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{chain.symbol}</Badge>
                      {chain.testnet && (
                        <Badge className="bg-secondary text-white">
                          Testnet
                        </Badge>
                      )}
                    </div>
                  </div>
                </Label>
              </div>
            </div>
          ))}
        </RadioGroup>

        {filteredChains.length === 0 && (
          <div className="bg-background rounded-md p-8 text-center">
            <p className="text-font/60">No networks found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
