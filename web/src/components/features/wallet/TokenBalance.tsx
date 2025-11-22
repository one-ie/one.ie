import { useReadContract, useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Coins } from 'lucide-react';

/**
 * ERC20 Token ABI - Standard interface for reading token data
 */
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    type: 'function',
  },
] as const;

interface TokenBalanceProps {
  tokenAddress: `0x${string}`;
  tokenSymbol?: string;
  tokenDecimals?: number;
  showName?: boolean;
}

/**
 * TokenBalance - Display ERC20 token balance
 *
 * Features:
 * - Read token balance from smart contract
 * - Auto-fetch token symbol and decimals
 * - Format balance with proper decimals
 * - Loading states
 * - Error handling
 *
 * Usage:
 * ```tsx
 * <TokenBalance
 *   tokenAddress="0x..."
 *   tokenSymbol="USDC"
 *   tokenDecimals={6}
 * />
 * ```
 */
export function TokenBalance({
  tokenAddress,
  tokenSymbol,
  tokenDecimals,
  showName = false,
}: TokenBalanceProps) {
  const { address } = useAccount();

  // Read token name
  const { data: tokenName } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'name',
  });

  // Read token symbol
  const { data: symbol } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'symbol',
  });

  // Read token decimals
  const { data: decimals } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'decimals',
  });

  // Read token balance
  const { data: balance, isLoading } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const displaySymbol = tokenSymbol || symbol || 'TOKEN';
  const displayDecimals = tokenDecimals ?? decimals ?? 18;

  const formattedBalance = balance
    ? formatUnits(balance, displayDecimals)
    : '0';

  const displayBalance = Number(formattedBalance).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });

  if (!address) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Token Balance
          </CardTitle>
          <CardDescription>
            Connect wallet to view balance
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5" />
          {showName && tokenName ? tokenName : displaySymbol}
        </CardTitle>
        <CardDescription>
          Token: {tokenAddress.slice(0, 6)}...{tokenAddress.slice(-4)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-12 w-full" />
        ) : (
          <div className="text-3xl font-bold">
            {displayBalance} {displaySymbol}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * CompactTokenBalance - Compact inline version
 *
 * Usage:
 * ```tsx
 * <CompactTokenBalance tokenAddress="0x..." />
 * ```
 */
export function CompactTokenBalance({
  tokenAddress,
  tokenSymbol,
  tokenDecimals,
}: Omit<TokenBalanceProps, 'showName'>) {
  const { address } = useAccount();

  const { data: symbol } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'symbol',
  });

  const { data: decimals } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'decimals',
  });

  const { data: balance, isLoading } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const displaySymbol = tokenSymbol || symbol || 'TOKEN';
  const displayDecimals = tokenDecimals ?? decimals ?? 18;

  if (!address) {
    return <span className="text-muted-foreground">Connect wallet</span>;
  }

  if (isLoading) {
    return <Skeleton className="h-6 w-24 inline-block" />;
  }

  const formattedBalance = balance
    ? formatUnits(balance, displayDecimals)
    : '0';

  const displayBalance = Number(formattedBalance).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });

  return (
    <span className="font-mono">
      {displayBalance} {displaySymbol}
    </span>
  );
}
