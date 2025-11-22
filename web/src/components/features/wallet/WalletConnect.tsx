import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, LogOut, AlertCircle } from 'lucide-react';
import { getNetworkName, isCorrectNetwork } from '@/lib/wagmi';
import { useMemo } from 'react';

/**
 * WalletConnect - Main wallet connection component
 *
 * Features:
 * - Connect wallet button with RainbowKit modal
 * - Display connected address and balance
 * - Network status indicator
 * - Disconnect button
 * - Wrong network warning
 *
 * Usage:
 * ```tsx
 * <WalletConnect />
 * ```
 */
export function WalletConnect() {
  const { address, isConnected, chain } = useAccount();
  const { data: balance } = useBalance({ address });
  const { disconnect } = useDisconnect();

  const networkCorrect = useMemo(
    () => isCorrectNetwork(chain?.id),
    [chain?.id]
  );

  const networkName = useMemo(
    () => getNetworkName(chain?.id),
    [chain?.id]
  );

  if (!isConnected) {
    return (
      <ConnectButton.Custom>
        {({ openConnectModal }) => (
          <Button
            onClick={openConnectModal}
            size="lg"
            className="gap-2"
          >
            <Wallet className="h-5 w-5" />
            Connect Wallet
          </Button>
        )}
      </ConnectButton.Custom>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Connected
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => disconnect()}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Disconnect
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Address */}
        <div>
          <div className="text-sm text-muted-foreground mb-1">Address</div>
          <code className="text-sm bg-muted px-2 py-1 rounded">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </code>
        </div>

        {/* Balance */}
        {balance && (
          <div>
            <div className="text-sm text-muted-foreground mb-1">Balance</div>
            <div className="text-2xl font-bold">
              {Number(balance.formatted).toFixed(4)} {balance.symbol}
            </div>
          </div>
        )}

        {/* Network */}
        <div>
          <div className="text-sm text-muted-foreground mb-1">Network</div>
          <div className="flex items-center gap-2">
            <Badge variant={networkCorrect ? 'default' : 'destructive'}>
              {networkName}
            </Badge>
            {!networkCorrect && (
              <div className="flex items-center gap-1 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                Wrong network
              </div>
            )}
          </div>
        </div>

        {/* Wrong network warning */}
        {!networkCorrect && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <div className="flex gap-2">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-destructive mb-1">
                  Please switch to Base network
                </div>
                <div className="text-muted-foreground">
                  This app requires Base mainnet or Base Sepolia testnet.
                  Use the network switcher to change networks.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full connect button for advanced options */}
        <div className="pt-2">
          <ConnectButton showBalance={false} chainStatus="icon" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * CompactWalletButton - Compact version for header/navigation
 *
 * Usage:
 * ```tsx
 * <CompactWalletButton />
 * ```
 */
export function CompactWalletButton() {
  return (
    <ConnectButton
      showBalance={true}
      chainStatus="icon"
      accountStatus="avatar"
    />
  );
}
