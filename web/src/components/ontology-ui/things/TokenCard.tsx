/**
 * TokenCard - Card for blockchain tokens and digital assets
 *
 * Displays token information with balance, contract details, and blockchain info.
 * Supports thing-level branding for different token ecosystems.
 */

import type { Thing } from "@/lib/ontology/types";
import { ThingCard } from "../universal/ThingCard";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNumber, cn } from "../utils";

interface TokenCardProps {
  token: Thing;
  balance?: number;
  symbol?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function TokenCard({
  token,
  balance,
  symbol,
  variant = "default",
  size = "md",
  interactive = true,
  onClick,
  className,
}: TokenCardProps) {
  const tokenBalance = balance ?? (token.properties?.balance as number);
  const tokenSymbol = symbol ?? (token.properties?.symbol as string) ?? token.name;
  const blockchain = token.properties?.blockchain as string;
  const contract = token.properties?.contract as string;
  const supply = token.properties?.supply as number;
  const decimals = token.properties?.decimals as number;
  const network = token.properties?.network as string;

  const contentPadding = {
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  return (
    <ThingCard
      thing={token}
      className={cn(
        interactive && "cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300",
        className
      )}
    >
      <div
        onClick={onClick}
        className={cn("bg-foreground rounded-md", contentPadding[size])}
      >
        <CardHeader className="px-0 pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className={cn(
                "flex items-center gap-2 text-font",
                size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg"
              )}>
                <span className="text-2xl">🪙</span>
                <span className="line-clamp-1">{tokenSymbol}</span>
              </CardTitle>
              {token.properties.description && (
                <CardDescription className="mt-1 line-clamp-2 text-font/70">
                  {token.properties.description}
                </CardDescription>
              )}
            </div>
            {blockchain && (
              <Badge
                variant="outline"
                className="ml-2 bg-primary/10 text-primary border-primary/20"
              >
                {blockchain}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-3 px-0">
          {tokenBalance !== undefined && (
            <div className="flex items-center justify-between p-3 bg-background rounded-md">
              <span className="text-sm text-font/60">Balance</span>
              <span className="text-lg font-bold text-primary">
                {formatNumber(tokenBalance)} {tokenSymbol}
              </span>
            </div>
          )}

          {supply !== undefined && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-font/60">Total Supply</span>
              <span className="font-mono text-font">{formatNumber(supply)}</span>
            </div>
          )}

          {decimals !== undefined && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-font/60">Decimals</span>
              <span className="font-mono text-font">{decimals}</span>
            </div>
          )}

          {contract && (
            <div className="space-y-1">
              <span className="text-xs text-font/60">Contract Address</span>
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono bg-background px-2 py-1 rounded truncate flex-1 text-font">
                  {contract}
                </code>
              </div>
            </div>
          )}

          {network && (
            <div className="flex items-center gap-2 text-sm text-font/60">
              <span>🌐</span>
              <span>{network}</span>
            </div>
          )}

          {interactive && (
            <div className="text-xs text-font/40 opacity-0 group-hover:opacity-100 transition-opacity border-t border-font/10 pt-2">
              View token details →
            </div>
          )}
        </CardContent>
      </div>
    </ThingCard>
  );
}
