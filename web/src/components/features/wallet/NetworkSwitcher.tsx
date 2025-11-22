import { useSwitchChain, useAccount } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Network, Check, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { isCorrectNetwork } from '@/lib/wagmi';

interface NetworkOption {
  id: number;
  name: string;
  description: string;
  icon: string;
  testnet: boolean;
}

const SUPPORTED_NETWORKS: NetworkOption[] = [
  {
    id: base.id,
    name: 'Base',
    description: 'Base mainnet (Ethereum L2)',
    icon: '🔵',
    testnet: false,
  },
  {
    id: baseSepolia.id,
    name: 'Base Sepolia',
    description: 'Base testnet for development',
    icon: '🔷',
    testnet: true,
  },
];

/**
 * NetworkSwitcher - Switch between Base mainnet and testnet
 *
 * Features:
 * - Visual network selector
 * - Current network indicator
 * - Auto-switch to default network
 * - Loading states
 * - Error handling
 *
 * Usage:
 * ```tsx
 * <NetworkSwitcher />
 * ```
 */
export function NetworkSwitcher() {
  const { chain, isConnected } = useAccount();
  const { switchChain, isPending } = useSwitchChain();
  const [switchingTo, setSwitchingTo] = useState<number | null>(null);

  const handleSwitch = async (chainId: number) => {
    if (!switchChain) return;

    setSwitchingTo(chainId);
    try {
      await switchChain({ chainId });
    } catch (error) {
      console.error('Failed to switch network:', error);
    } finally {
      setSwitchingTo(null);
    }
  };

  if (!isConnected) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Network Switcher
          </CardTitle>
          <CardDescription>
            Connect your wallet to switch networks
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const currentNetworkCorrect = isCorrectNetwork(chain?.id);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5" />
          Select Network
        </CardTitle>
        <CardDescription>
          Switch between Base mainnet and testnet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {!currentNetworkCorrect && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-4">
            <div className="text-sm text-destructive">
              You're currently on <strong>{chain?.name || 'an unsupported network'}</strong>.
              Please switch to Base or Base Sepolia.
            </div>
          </div>
        )}

        {SUPPORTED_NETWORKS.map((network) => {
          const isCurrent = chain?.id === network.id;
          const isSwitching = switchingTo === network.id;

          return (
            <Button
              key={network.id}
              variant={isCurrent ? 'default' : 'outline'}
              className="w-full justify-start h-auto p-4"
              onClick={() => handleSwitch(network.id)}
              disabled={isCurrent || isPending}
            >
              <div className="flex items-start gap-3 w-full">
                <div className="text-2xl">{network.icon}</div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{network.name}</span>
                    {network.testnet && (
                      <Badge variant="secondary" className="text-xs">
                        Testnet
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {network.description}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {isSwitching ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : isCurrent ? (
                    <Check className="h-5 w-5" />
                  ) : null}
                </div>
              </div>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}

/**
 * CompactNetworkSwitcher - Compact version for header/navigation
 *
 * Usage:
 * ```tsx
 * <CompactNetworkSwitcher />
 * ```
 */
export function CompactNetworkSwitcher() {
  const { chain } = useAccount();
  const { switchChain } = useSwitchChain();

  const handleToggle = () => {
    if (!switchChain) return;

    // Toggle between Base mainnet and Sepolia
    const targetChain = chain?.id === base.id ? baseSepolia.id : base.id;
    switchChain({ chainId: targetChain });
  };

  const currentNetwork = SUPPORTED_NETWORKS.find(n => n.id === chain?.id);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      className="gap-2"
    >
      <Network className="h-4 w-4" />
      {currentNetwork ? (
        <>
          {currentNetwork.icon} {currentNetwork.name}
        </>
      ) : (
        'Switch Network'
      )}
    </Button>
  );
}
