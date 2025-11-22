/**
 * WalletBalance Component
 *
 * Display native token balance with real-time updates
 * Shows ETH/MATIC/SOL balance and USD value
 */

import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatNumber, formatCurrency } from "../../utils";
import type { WalletBalanceProps } from "./types";

const NATIVE_SYMBOLS: Record<number, string> = {
  1: "ETH",
  137: "MATIC",
  42161: "ETH",
  10: "ETH",
  8453: "ETH",
};

export function WalletBalance({
  address,
  chainId = 1,
  showUsd = true,
  refreshInterval = 10000,
  variant = "default",
  size = "md",
  interactive = true,
  className,
}: WalletBalanceProps) {
  const [balance, setBalance] = useState<string | null>(null);
  const [usdValue, setUsdValue] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

  const symbol = NATIVE_SYMBOLS[chainId] || "ETH";

  useEffect(() => {
    if (!address) {
      setIsLoading(false);
      return;
    }

    const fetchBalance = async () => {
      setIsLoading(true);

      try {
        // Mock balance fetch (replace with actual viem/wagmi integration)
        await new Promise((resolve) => setTimeout(resolve, 500));

        const mockBalance = (Math.random() * 10).toFixed(6);
        const mockUsdPrice = chainId === 1 ? 2400 : chainId === 137 ? 0.85 : 2400;
        const mockUsdValue = parseFloat(mockBalance) * mockUsdPrice;

        setBalance(mockBalance);
        setUsdValue(mockUsdValue);
        setLastUpdated(Date.now());
      } catch (error) {
        console.error("Failed to fetch balance:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();

    const interval = setInterval(fetchBalance, refreshInterval);
    return () => clearInterval(interval);
  }, [address, chainId, refreshInterval]);

  if (!address) {
    return (
      <Card className={cn("bg-background p-1 shadow-sm rounded-md", className)}>
        <div className="bg-foreground p-6 rounded-md text-center">
          <p className="text-sm text-font/60">
            No wallet connected
          </p>
        </div>
      </Card>
    );
  }

  if (isLoading && balance === null) {
    return (
      <Card className={cn("bg-background p-1 shadow-sm rounded-md", className)}>
        <div className="bg-foreground p-6 rounded-md">
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "bg-background p-1 shadow-sm rounded-md group relative transition-all duration-300 ease-in-out",
        interactive && "cursor-pointer hover:shadow-xl",
        className
      )}
    >
      <div
        className={cn(
          "bg-foreground rounded-md text-font",
          size === "sm" && "p-3",
          size === "md" && "p-4",
          size === "lg" && "p-6"
        )}
      >
        <CardHeader className="pb-3 p-0 mb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 text-font">
                <span className="text-2xl">💰</span>
                <span>Balance</span>
              </CardTitle>
              <CardDescription className="mt-1 text-xs text-font/60">
                Updated {new Date(lastUpdated).toLocaleTimeString()}
              </CardDescription>
            </div>
            <Badge variant="outline" className="border-font/20">{symbol}</Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 p-0">
          <div className="space-y-1">
            <div className="text-3xl font-bold text-font">
              {balance ? formatNumber(parseFloat(balance)) : "0.000000"}
            </div>
            <div className="text-sm text-font/60">{symbol}</div>
          </div>

          {showUsd && usdValue !== null && (
            <div className="flex items-center justify-between p-3 bg-background rounded-md">
              <span className="text-sm text-font/60">USD Value</span>
              <span className="text-lg font-bold text-font">
                {formatCurrency(usdValue)}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-font/60 border-t border-font/10 pt-3">
            <span>Chain ID: {chainId}</span>
            {interactive && (
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                Refresh →
              </span>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
