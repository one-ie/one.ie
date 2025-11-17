/**
 * WalletConnector - Blockchain wallet connection component
 *
 * Allows users to connect their Ethereum/Web3 wallet
 * with support for MetaMask, WalletConnect, and other providers
 */

import { AlertCircle, Check, Unlink, Wallet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useConnectWallet } from "@/hooks/useOnboarding";

interface WalletConnectorProps {
  userId: string;
  connectedWallet?: string;
  onSuccess: () => void;
  onSkip?: () => void;
}

export function WalletConnector({
  userId,
  connectedWallet,
  onSuccess,
  onSkip,
}: WalletConnectorProps) {
  const [walletType, setWalletType] = useState<
    "metamask" | "walletconnect" | "rainbowkit" | "other"
  >("metamask");
  const [walletAddress, setWalletAddress] = useState(connectedWallet || "");
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [error, setError] = useState("");
  const [chainId, setChainId] = useState<number>(1);
  const { mutate: connectWallet, loading } = useConnectWallet();

  const validateAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const handleDetectWallet = async () => {
    setError("");

    if (walletType === "metamask") {
      if (!window.ethereum) {
        setError("MetaMask is not installed. Please install MetaMask extension first.");
        toast.error("MetaMask not found", {
          description: "Please install the MetaMask extension from metamask.io",
        });
        return;
      }

      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const address = accounts[0];
        const chainIdHex = await window.ethereum.request({
          method: "eth_chainId",
        });
        const chain = parseInt(chainIdHex, 16);

        setWalletAddress(address);
        setChainId(chain);
        setIsManualEntry(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to connect MetaMask";
        setError(message);
      }
    } else {
      toast.info("WalletConnect coming soon", {
        description: "WalletConnect integration is under development",
      });
    }
  };

  const handleManualConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!walletAddress) {
      setError("Please enter a wallet address");
      return;
    }

    if (!validateAddress(walletAddress)) {
      setError("Invalid wallet address format (must be 0x + 40 hex characters)");
      return;
    }

    try {
      const result = await connectWallet({
        userId,
        walletAddress: walletAddress.toLowerCase(),
        chainId,
        walletType,
      });

      if (result.success) {
        toast.success("Wallet connected!", {
          description: "Your wallet has been connected successfully.",
        });
        onSuccess();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Connection failed";
      setError(message);
    }
  };

  const handleDisconnect = () => {
    setWalletAddress("");
    setIsManualEntry(false);
    setError("");
  };

  // Check if wallet is already connected
  const hasConnectedWallet = walletAddress && validateAddress(walletAddress);

  if (hasConnectedWallet && !isManualEntry) {
    return (
      <div className="space-y-6">
        <div className="p-4 rounded-lg border border-green-500/30 bg-green-500/10 space-y-3">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="font-semibold text-green-900 dark:text-green-100">
              Wallet Connected
            </span>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Connected Address:</p>
            <code className="block bg-background p-2 rounded text-xs font-mono break-all">
              {walletAddress}
            </code>
          </div>

          {chainId && (
            <p className="text-xs text-muted-foreground">
              Chain ID: {chainId === 1 ? "Ethereum Mainnet" : `Chain ${chainId}`}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Button type="button" className="w-full" onClick={onSuccess}>
            Continue
          </Button>

          <Button type="button" variant="outline" className="w-full" onClick={handleDisconnect}>
            <Unlink className="w-4 h-4 mr-2" />
            Disconnect
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleManualConnect} className="space-y-4">
        {/* Wallet Type Selection */}
        <div className="space-y-2">
          <Label htmlFor="wallet-type">Wallet Type</Label>
          <Select
            value={walletType}
            onValueChange={(value) => {
              setWalletType(value as any);
              setWalletAddress("");
              setError("");
            }}
            disabled={loading}
          >
            <SelectTrigger id="wallet-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="metamask">MetaMask</SelectItem>
              <SelectItem value="walletconnect">WalletConnect</SelectItem>
              <SelectItem value="rainbowkit">Rainbow Wallet</SelectItem>
              <SelectItem value="other">Other Wallet</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Auto-Detect Button */}
        {!isManualEntry && (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleDetectWallet}
            disabled={loading}
          >
            <Wallet className="w-4 h-4 mr-2" />
            Detect {walletType === "metamask" ? "MetaMask" : "Wallet"}
          </Button>
        )}

        {/* Manual Entry */}
        {isManualEntry && (
          <>
            <div className="space-y-2">
              <Label htmlFor="address">Wallet Address</Label>
              <Input
                id="address"
                type="text"
                placeholder="0x1234567890abcdef1234567890abcdef12345678"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                disabled={loading}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Enter a valid Ethereum wallet address (0x...)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="chain">Network</Label>
              <Select
                value={chainId.toString()}
                onValueChange={(value) => setChainId(parseInt(value, 10))}
                disabled={loading}
              >
                <SelectTrigger id="chain">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Ethereum Mainnet</SelectItem>
                  <SelectItem value="137">Polygon</SelectItem>
                  <SelectItem value="42161">Arbitrum</SelectItem>
                  <SelectItem value="10">Optimism</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !validateAddress(walletAddress)}
            >
              {loading ? "Connecting..." : "Connect Wallet"}
            </Button>
          </>
        )}

        {/* Toggle Manual Entry */}
        {!isManualEntry && (
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => setIsManualEntry(true)}
            disabled={loading}
          >
            Enter Manually
          </Button>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </form>

      {/* Info Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-sm">
          Wallet connection is optional. You can always add or change your wallet later in account
          settings.
        </AlertDescription>
      </Alert>

      {/* Skip Button */}
      {onSkip && (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={onSkip}
          disabled={loading}
        >
          Skip for Now
        </Button>
      )}
    </div>
  );
}

// Extend Window interface for Web3 wallet detection
declare global {
  interface Window {
    ethereum?: any;
  }
}
