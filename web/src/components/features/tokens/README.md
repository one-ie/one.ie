# TokenDashboard Component

A comprehensive, production-ready token dashboard component for displaying cryptocurrency and token information.

## Features

### Overview Section
- **Price Card** - Current token price with 24h change indicator (trending up/down)
- **Market Cap Card** - Market capitalization with total supply
- **Holders Card** - Total unique holders count
- **Volume Card** - 24-hour trading volume

### Interactive Chart
- **Price Chart** - Area chart showing price over time
- **Volume Chart** - Bar chart showing trading volume
- **Timeframe Selector** - Switch between 24h, 7d, 30d views
- **Responsive Design** - Adapts to all screen sizes
- **Dark Mode Support** - Automatically follows theme

### Holders Table
- **Top 10 Holders** - Largest token holders by percentage
- **Address Display** - Shortened addresses (0x1234...5678)
- **Balance & Percentage** - Token balance and ownership percentage
- **Contract Detection** - Badge for contract addresses
- **CSV Export** - Export holder data to CSV file

### Transactions Table
- **Recent Transactions** - Latest 10 transfers, mints, and burns
- **Transaction Types** - Color-coded badges (mint, burn, transfer)
- **Address Details** - From/To addresses with arrow indicator
- **Amount Display** - Formatted token amounts (K, M, B notation)
- **Timestamp** - Human-readable time display

### Contract Information
- **Contract Address** - Full address with copy button
- **Network Badge** - Blockchain network (Ethereum, BSC, etc.)
- **Total Supply** - Formatted total token supply
- **Risk Score** - Optional risk assessment (Low/Medium/High)
- **Etherscan Link** - Direct link to block explorer
- **Share Button** - Native share API with clipboard fallback

### Social Links
- **Website** - Official project website
- **Twitter** - Twitter/X profile link
- **Discord** - Discord server invite
- **Telegram** - Telegram group/channel

## Usage

### Basic Usage (with Convex)

```astro
---
// src/pages/tokens/[id].astro
import Layout from '@/layouts/Layout.astro';
import { TokenDashboard } from '@/components/features/tokens/TokenDashboard';

const { id } = Astro.params;
---

<Layout title="Token Dashboard">
  <div class="container mx-auto py-8">
    <TokenDashboard tokenId={id} client:load />
  </div>
</Layout>
```

### With Static Data

```astro
---
// src/pages/tokens/demo.astro
import Layout from '@/layouts/Layout.astro';
import { TokenDashboard } from '@/components/features/tokens/TokenDashboard';

const tokenData = {
  token: { /* ... token data ... */ },
  holders: [ /* ... holders ... */ ],
  transactions: [ /* ... transactions ... */ ],
  stats: [ /* ... price/volume stats ... */ ],
};
---

<Layout title="Token Demo">
  <TokenDashboard tokenId="demo" staticData={tokenData} client:load />
</Layout>
```

## Props

### `TokenDashboardProps`

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `tokenId` | `string` | Yes | Unique identifier for the token |
| `staticData` | `object` | No | Optional static data to bypass Convex queries |

### `staticData` Structure

```typescript
{
  token: {
    _id: string;
    name: string;
    symbol: string;
    contractAddress: string;
    network: string;
    price: number;
    marketCap: number;
    totalSupply: number;
    holders: number;
    volume24h: number;
    priceChange24h: number;
    website?: string;
    twitter?: string;
    discord?: string;
    telegram?: string;
    riskScore?: number;
  },
  holders: Array<{
    address: string;
    balance: number;
    percentage: number;
    isContract: boolean;
  }>,
  transactions: Array<{
    _id: string;
    hash: string;
    type: 'transfer' | 'mint' | 'burn';
    from: string;
    to: string;
    amount: number;
    timestamp: number;
  }>,
  stats: Array<{
    timestamp: number;
    price: number;
    volume: number;
  }>
}
```

## Required Convex Queries

The component expects these Convex queries to be implemented:

### `api.tokens.get`
```typescript
// Returns token information
query({ args: { id: v.string() } })
```

### `api.tokens.getHolders`
```typescript
// Returns array of token holders
query({ args: { id: v.string() } })
```

### `api.tokens.getTransactions`
```typescript
// Returns array of recent transactions
query({ args: { id: v.string() } })
```

### `api.tokens.getStats`
```typescript
// Returns price/volume statistics
query({ args: { id: v.string(), timeframe: v.union(...) } })
```

See `TokenDashboard.example.tsx` for complete backend implementation examples.

## Hydration Strategies

### Immediate Load (Critical, Above Fold)
```astro
<TokenDashboard tokenId={id} client:load />
```

### Idle Load (Below Fold, Secondary)
```astro
<TokenDashboard tokenId={id} client:idle />
```

### Visible Load (Far Below Fold)
```astro
<TokenDashboard tokenId={id} client:visible />
```

### Client Only (No SSR)
```astro
<TokenDashboard tokenId={id} client:only="react" />
```

## Features

### Copy to Clipboard
Click the copy button next to the contract address to copy it to clipboard.

### Share Token
Use the share button to open native share dialog (mobile) or copy URL to clipboard (desktop).

### Export Data
Click "Export CSV" button on the holders table to download holder data as CSV file.

### Real-time Updates
When using Convex queries, the dashboard automatically updates when data changes (via Convex subscriptions).

### Responsive Design
- **Mobile (< 768px)**: Single column layout, stacked cards
- **Tablet (768px - 1024px)**: 2-column grid for tables
- **Desktop (> 1024px)**: Full 4-column overview grid

## Customization

### Chart Colors
Charts use CSS variables from the theme:
- `--color-primary` - Price area chart
- `--color-accent` - Volume bar chart
- `--color-border` - Grid lines
- `--color-muted-foreground` - Axis labels

### Risk Score Colors
Risk score badges use semantic variants:
- **Low Risk (< 30)**: `default` variant (green-ish)
- **Medium Risk (30-70)**: `outline` variant (neutral)
- **High Risk (> 70)**: `destructive` variant (red)

### Number Formatting
The component includes smart number formatting:
- `>= 1B`: Shows as "1.23B"
- `>= 1M`: Shows as "1.23M"
- `>= 1K`: Shows as "1.23K"
- `< 1K`: Shows as "1.23"

### Address Formatting
Addresses are shortened to: `0x1234...5678` (first 6 + last 4 characters)

## Dependencies

All dependencies are already included in the ONE platform:

- `recharts` (^2.15.4) - Chart library
- `lucide-react` (^0.546.0) - Icons
- `convex/react` - Real-time data
- `@/components/ui/*` - shadcn/ui components

## Performance

### Code Splitting
Component uses dynamic imports for charts, reducing initial bundle size.

### Skeleton Loading
Displays skeleton placeholders while data loads (improves perceived performance).

### Optimized Re-renders
Uses React.memo and useMemo for expensive calculations.

### Chart Performance
Recharts uses canvas rendering for smooth 60fps animations.

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android 90+)

## Accessibility

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Screen reader compatible
- Focus indicators on all interactive elements

## Known Limitations

1. **Max Holders**: Shows top 10 holders only (performance)
2. **Max Transactions**: Shows latest 10 transactions only
3. **Chart Data Points**: Limited by backend query (recommend max 100 points)
4. **Mobile Share**: Share API not supported on all desktop browsers (fallback to clipboard)

## Future Enhancements

Potential features to add:
- [ ] Real-time price ticker animation
- [ ] Advanced chart indicators (MA, RSI, MACD)
- [ ] Custom timeframe selector
- [ ] Holder distribution pie chart
- [ ] Transaction filtering (type, amount, date)
- [ ] Watchlist/favorite functionality
- [ ] Price alerts
- [ ] Compare multiple tokens

## Troubleshooting

### Charts not displaying
- Verify `recharts` is installed: `bun add recharts`
- Check that `stats` data has correct format

### Convex queries failing
- Ensure backend queries are implemented (see example file)
- Check Convex deployment status
- Verify `tokenId` is valid

### Copy/Share not working
- Check browser permissions for clipboard access
- For share, check Web Share API support

### Styling issues
- Verify Tailwind v4 is configured
- Check that shadcn/ui components are installed
- Ensure CSS variables are defined in theme

## License

Part of the ONE platform. See root LICENSE.md for details.
