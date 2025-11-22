# Wallet Connection with RainbowKit & wagmi

Web3 wallet connection components for the ONE Platform, built with RainbowKit and wagmi.

## Features

- 🔌 **Easy Wallet Connection** - Connect with MetaMask, WalletConnect, Coinbase Wallet, Rainbow, and more
- 🌐 **Multi-Network Support** - Base mainnet (8453) and Base Sepolia testnet (84532)
- 🔄 **Network Switching** - Easy network switching with visual interface
- 💰 **Balance Display** - Show user's ETH balance
- 🎨 **Theme Integration** - Automatically syncs with app light/dark theme
- ⚡ **Optimized** - Lazy loading and hydration for optimal performance

## Quick Start

### 1. Environment Setup

Add your WalletConnect Project ID to `.env`:

```bash
PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

Get your free Project ID at [WalletConnect Cloud](https://cloud.walletconnect.com/)

### 2. Wrap Your App

Add `WalletProvider` to your Astro layout:

```astro
---
import { WalletProvider } from '@/components/features/wallet';
---

<html>
  <body>
    <WalletProvider client:only="react">
      <slot />
    </WalletProvider>
  </body>
</html>
```

### 3. Use Components

```astro
---
import { WalletConnect, NetworkSwitcher } from '@/components/features/wallet';
---

<div>
  <WalletConnect client:load />
  <NetworkSwitcher client:load />
</div>
```

## Components

### WalletProvider

Required wrapper that provides wagmi and RainbowKit context.

**Props:**
- `children` - React children to wrap

**Usage:**
```tsx
<WalletProvider client:only="react">
  <YourApp />
</WalletProvider>
```

### WalletConnect

Main wallet connection component with full UI.

**Features:**
- Connect/disconnect button
- Address display
- Balance display
- Network status indicator
- Wrong network warning

**Usage:**
```tsx
<WalletConnect client:load />
```

### CompactWalletButton

Compact version for header/navigation.

**Usage:**
```tsx
<CompactWalletButton client:load />
```

### NetworkSwitcher

Network selection interface.

**Features:**
- Visual network selector
- Current network indicator
- Loading states
- Network descriptions

**Usage:**
```tsx
<NetworkSwitcher client:load />
```

### CompactNetworkSwitcher

Compact network toggle button.

**Usage:**
```tsx
<CompactNetworkSwitcher client:load />
```

## Hooks

Use wagmi hooks in your React components:

### useAccount

Get connected account information.

```tsx
import { useAccount } from 'wagmi';

export function MyComponent() {
  const { address, isConnected, chain } = useAccount();

  if (!isConnected) {
    return <div>Not connected</div>;
  }

  return <div>Connected: {address}</div>;
}
```

### useBalance

Get account balance.

```tsx
import { useBalance } from 'wagmi';

export function Balance({ address }: { address: string }) {
  const { data: balance } = useBalance({ address });

  return (
    <div>
      {balance?.formatted} {balance?.symbol}
    </div>
  );
}
```

### useSwitchChain

Switch networks programmatically.

```tsx
import { useSwitchChain } from 'wagmi';
import { base } from 'wagmi/chains';

export function SwitchToBase() {
  const { switchChain } = useSwitchChain();

  return (
    <button onClick={() => switchChain({ chainId: base.id })}>
      Switch to Base
    </button>
  );
}
```

### useSignMessage

Sign messages with the connected wallet.

```tsx
import { useSignMessage } from 'wagmi';

export function SignMessage() {
  const { signMessage } = useSignMessage();

  const handleSign = () => {
    signMessage({ message: 'Hello from ONE Platform!' });
  };

  return <button onClick={handleSign}>Sign Message</button>;
}
```

### useReadContract

Read from smart contracts.

```tsx
import { useReadContract } from 'wagmi';

export function ReadContract() {
  const { data } = useReadContract({
    address: '0x...',
    abi: contractABI,
    functionName: 'balanceOf',
    args: [userAddress],
  });

  return <div>Balance: {data?.toString()}</div>;
}
```

### useWriteContract

Write to smart contracts.

```tsx
import { useWriteContract } from 'wagmi';

export function WriteContract() {
  const { writeContract } = useWriteContract();

  const handleMint = () => {
    writeContract({
      address: '0x...',
      abi: contractABI,
      functionName: 'mint',
      args: [amount],
    });
  };

  return <button onClick={handleMint}>Mint</button>;
}
```

## Integration with Convex

Save wallet address to user entity:

```tsx
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAccount } from 'wagmi';
import { useEffect } from 'react';

export function SyncWalletAddress() {
  const { address, isConnected } = useAccount();
  const updateUser = useMutation(api.mutations.users.update);

  useEffect(() => {
    if (isConnected && address) {
      updateUser({ walletAddress: address });
    }
  }, [isConnected, address, updateUser]);

  return null; // Silent background sync
}
```

## Supported Networks

- **Base** (8453) - Ethereum L2 production network
- **Base Sepolia** (84532) - Testnet for development

## Configuration

Edit `/web/src/lib/wagmi.ts` to customize:

```typescript
export const config = getDefaultConfig({
  appName: 'Your App Name',
  projectId: 'YOUR_PROJECT_ID',
  chains: [base, baseSepolia],
  ssr: false,
});
```

## Utilities

### isCorrectNetwork(chainId)

Check if user is on a supported network:

```tsx
import { isCorrectNetwork } from '@/lib/wagmi';

const correct = isCorrectNetwork(chain?.id);
```

### getNetworkName(chainId)

Get human-readable network name:

```tsx
import { getNetworkName } from '@/lib/wagmi';

const name = getNetworkName(chain?.id); // "Base" or "Base Sepolia"
```

### getDefaultChain()

Get default chain based on environment:

```tsx
import { getDefaultChain } from '@/lib/wagmi';

const defaultChain = getDefaultChain(); // baseSepolia in dev, base in production
```

## Auto-Switch Network

Automatically switch to the correct network:

```tsx
import { useAccount, useSwitchChain } from 'wagmi';
import { isCorrectNetwork, getDefaultChain } from '@/lib/wagmi';
import { useEffect } from 'react';

export function AutoSwitchNetwork() {
  const { chain, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    if (isConnected && !isCorrectNetwork(chain?.id)) {
      const defaultChain = getDefaultChain();
      switchChain({ chainId: defaultChain.id });
    }
  }, [isConnected, chain, switchChain]);

  return null;
}
```

## Performance

All components use Astro's client directives for optimal performance:

```astro
<!-- Load immediately (critical) -->
<WalletConnect client:load />

<!-- Load when idle (non-critical) -->
<NetworkSwitcher client:idle />

<!-- Load when visible (below fold) -->
<WalletStats client:visible />
```

## Demo

Visit `/wallet-demo` to see a full integration example.

## Resources

- [RainbowKit Documentation](https://www.rainbowkit.com/docs/introduction)
- [wagmi Documentation](https://wagmi.sh/react/getting-started)
- [Base Network Documentation](https://docs.base.org/)
- [WalletConnect Cloud](https://cloud.walletconnect.com/)

## Troubleshooting

### "Project ID is required"

Make sure you've added `PUBLIC_WALLETCONNECT_PROJECT_ID` to your `.env` file.

### Wallet not connecting

1. Check that you're using a supported browser (Chrome, Firefox, Brave)
2. Make sure MetaMask or another wallet is installed
3. Check browser console for errors

### Wrong network warning

Use the `NetworkSwitcher` component or auto-switch feature to guide users to the correct network.

### Theme not syncing

The `WalletProvider` automatically detects theme changes. Make sure your theme switcher adds/removes the `dark` class on `document.documentElement`.
