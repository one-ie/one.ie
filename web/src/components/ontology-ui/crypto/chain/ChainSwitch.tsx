/**
 * ChainSwitch Component
 *
 * Quick chain switcher button with dropdown.
 * Uses 6-token design system.
 */

import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export interface QuickChain {
  chainId: number;
  name: string;
  symbol: string;
  logo?: string;
  testnet?: boolean;
}

interface ChainSwitchProps {
  currentChain: QuickChain;
  chains: QuickChain[];
  onSwitchChain?: (chain: QuickChain) => Promise<void>;
  compact?: boolean;
  className?: string;
}

export function ChainSwitch({
  currentChain,
  chains,
  onSwitchChain,
  compact = false,
  className,
}: ChainSwitchProps) {
  const [isSwitching, setIsSwitching] = React.useState(false);

  const handleSwitch = async (chain: QuickChain) => {
    if (!onSwitchChain) return;
    setIsSwitching(true);
    try {
      await onSwitchChain(chain);
    } finally {
      setIsSwitching(false);
    }
  };

  // Group chains by mainnet/testnet
  const mainnets = chains.filter((c) => !c.testnet);
  const testnets = chains.filter((c) => c.testnet);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`${compact ? "h-8 px-2" : ""} ${className || ""}`}
          disabled={isSwitching}
        >
          {currentChain.logo && (
            <img
              src={currentChain.logo}
              alt={currentChain.name}
              className="h-4 w-4 rounded-full mr-2"
            />
          )}
          <span className="text-font">{currentChain.name}</span>
          {compact && (
            <Badge variant="secondary" className="ml-2">
              {currentChain.symbol}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-foreground border-font/10">
        {mainnets.length > 0 && (
          <>
            <DropdownMenuLabel className="text-font/60">
              Mainnets
            </DropdownMenuLabel>
            {mainnets.map((chain) => (
              <DropdownMenuItem
                key={chain.chainId}
                onClick={() => handleSwitch(chain)}
                className="cursor-pointer hover:bg-background"
              >
                <div className="flex items-center gap-2 w-full">
                  {chain.logo && (
                    <img
                      src={chain.logo}
                      alt={chain.name}
                      className="h-5 w-5 rounded-full"
                    />
                  )}
                  <span className="text-font flex-1">{chain.name}</span>
                  {currentChain.chainId === chain.chainId && (
                    <Badge className="bg-primary text-white">Active</Badge>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </>
        )}

        {testnets.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-font/60">
              Testnets
            </DropdownMenuLabel>
            {testnets.map((chain) => (
              <DropdownMenuItem
                key={chain.chainId}
                onClick={() => handleSwitch(chain)}
                className="cursor-pointer hover:bg-background"
              >
                <div className="flex items-center gap-2 w-full">
                  {chain.logo && (
                    <img
                      src={chain.logo}
                      alt={chain.name}
                      className="h-5 w-5 rounded-full"
                    />
                  )}
                  <span className="text-font flex-1">{chain.name}</span>
                  {currentChain.chainId === chain.chainId && (
                    <Badge className="bg-primary text-white">Active</Badge>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
