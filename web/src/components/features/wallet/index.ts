/**
 * Wallet Connection Components
 *
 * This module provides Web3 wallet connection functionality using RainbowKit and wagmi.
 *
 * Features:
 * - Connect to MetaMask, WalletConnect, Coinbase Wallet, etc.
 * - Support for Base mainnet (8453) and Base Sepolia (84532)
 * - Network switching
 * - Balance display
 * - Account management
 *
 * Setup:
 * 1. Add WalletProvider to your layout:
 *    ```astro
 *    <WalletProvider client:only="react">
 *      <slot />
 *    </WalletProvider>
 *    ```
 *
 * 2. Use wallet components:
 *    ```tsx
 *    <WalletConnect />
 *    <NetworkSwitcher />
 *    ```
 *
 * 3. Use wallet hooks in your components:
 *    ```tsx
 *    import { useAccount, useBalance } from 'wagmi';
 *
 *    function MyComponent() {
 *      const { address, isConnected } = useAccount();
 *      const { data: balance } = useBalance({ address });
 *      // ...
 *    }
 *    ```
 */

export { WalletProvider } from './WalletProvider';
export { WalletConnect, CompactWalletButton } from './WalletConnect';
export { NetworkSwitcher, CompactNetworkSwitcher } from './NetworkSwitcher';
export { WalletSync, AutoWalletSync } from './WalletSync';
export { TokenBalance, CompactTokenBalance } from './TokenBalance';
