import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, baseSepolia } from 'wagmi/chains';

/**
 * Wagmi configuration for wallet connection
 *
 * Supports:
 * - Base mainnet (8453)
 * - Base Sepolia testnet (84532)
 *
 * Wallets supported via RainbowKit:
 * - MetaMask
 * - WalletConnect
 * - Coinbase Wallet
 * - Rainbow Wallet
 * - And more...
 */
export const config = getDefaultConfig({
  appName: 'ONE Platform',
  projectId: import.meta.env.PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_WALLETCONNECT_PROJECT_ID',
  chains: [base, baseSepolia],
  ssr: false, // Astro doesn't use SSR for RainbowKit
});

/**
 * Helper to check if user is on the correct network
 */
export function isCorrectNetwork(chainId: number | undefined): boolean {
  if (!chainId) return false;
  return chainId === base.id || chainId === baseSepolia.id;
}

/**
 * Get network name from chain ID
 */
export function getNetworkName(chainId: number | undefined): string {
  if (!chainId) return 'Unknown';

  switch (chainId) {
    case base.id:
      return 'Base';
    case baseSepolia.id:
      return 'Base Sepolia';
    default:
      return 'Unknown Network';
  }
}

/**
 * Get the default chain (Base mainnet in production, Sepolia in dev)
 */
export function getDefaultChain() {
  return import.meta.env.MODE === 'production' ? base : baseSepolia;
}
