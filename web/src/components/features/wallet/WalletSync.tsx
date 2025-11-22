import { useAccount } from 'wagmi';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, Check, AlertCircle } from 'lucide-react';

/**
 * WalletSync - Sync wallet address with Convex user entity
 *
 * Features:
 * - Detect when wallet connects
 * - Save wallet address to user profile
 * - Show sync status
 * - Handle errors gracefully
 *
 * Usage:
 * ```tsx
 * <WalletSync />
 * ```
 *
 * Backend requirement:
 * Create a mutation in `/backend/convex/mutations/users.ts`:
 *
 * ```typescript
 * export const updateWalletAddress = mutation({
 *   args: { walletAddress: v.string() },
 *   handler: async (ctx, args) => {
 *     const userId = await ctx.auth.getUserIdentity();
 *     if (!userId) throw new Error('Not authenticated');
 *
 *     await ctx.db.patch(userId.tokenIdentifier, {
 *       walletAddress: args.walletAddress,
 *     });
 *   },
 * });
 * ```
 */
export function WalletSync() {
  const { address, isConnected } = useAccount();
  const [synced, setSynced] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // NOTE: This assumes you have a mutation at api.mutations.users.updateWalletAddress
  // You'll need to create this in your backend
  const updateWalletAddress = useMutation(api.mutations.users.updateWalletAddress);

  const handleSync = async () => {
    if (!address) {
      setError('No wallet connected');
      return;
    }

    try {
      setError(null);
      await updateWalletAddress({ walletAddress: address });
      setSynced(true);
      toast.success('Wallet address saved to profile');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sync wallet';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Auto-sync on connect
  useEffect(() => {
    if (isConnected && address && !synced) {
      handleSync();
    }
  }, [isConnected, address]);

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Sync
          </CardTitle>
          <CardDescription>
            Connect your wallet to sync with your profile
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Wallet Sync
        </CardTitle>
        <CardDescription>
          Sync your wallet address with your ONE Platform profile
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center gap-2">
          {synced ? (
            <>
              <Badge variant="default" className="gap-1">
                <Check className="h-3 w-3" />
                Synced
              </Badge>
              <span className="text-sm text-muted-foreground">
                Wallet address saved to profile
              </span>
            </>
          ) : (
            <>
              <Badge variant="secondary">Not Synced</Badge>
              <span className="text-sm text-muted-foreground">
                Wallet not synced with profile
              </span>
            </>
          )}
        </div>

        {/* Address */}
        <div>
          <div className="text-sm text-muted-foreground mb-1">Wallet Address</div>
          <code className="text-sm bg-muted px-2 py-1 rounded">
            {address}
          </code>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="text-sm text-destructive">{error}</div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={handleSync}
            disabled={synced}
            variant={synced ? 'outline' : 'default'}
          >
            {synced ? 'Synced' : 'Sync to Profile'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * AutoWalletSync - Silent background sync (no UI)
 *
 * Usage:
 * ```tsx
 * <AutoWalletSync />
 * ```
 */
export function AutoWalletSync() {
  const { address, isConnected } = useAccount();
  const updateWalletAddress = useMutation(api.mutations.users.updateWalletAddress);

  useEffect(() => {
    if (isConnected && address) {
      updateWalletAddress({ walletAddress: address }).catch((error) => {
        console.error('Failed to sync wallet:', error);
      });
    }
  }, [isConnected, address, updateWalletAddress]);

  return null;
}
