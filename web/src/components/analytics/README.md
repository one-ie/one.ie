# Analytics Components

Complete analytics dashboard for Solana token tracking and risk assessment. Built for CYCLE-064-068 of the Solana Launchpad implementation.

## Components

### TokenAnalyticsDashboard

Main dashboard component that orchestrates all analytics views.

```tsx
import { TokenAnalyticsDashboard } from '@/components/analytics';

<TokenAnalyticsDashboard
  tokenId="token_123"
  metrics={tokenMetrics}
  riskScore={riskScore}
  holders={holders}
  pattern={tradingPattern}
  isLoading={false}
/>
```

**Features:**
- Tabbed interface (Overview, Holders, Risk Analysis)
- Real-time metrics updates
- Trading pattern alerts
- Comprehensive risk assessment

### PriceChart

Displays token price history with area chart visualization.

```tsx
import { PriceChart } from '@/components/analytics';

<PriceChart
  data={priceHistory}
  isLoading={false}
/>
```

**Features:**
- Area chart with gradient fill
- 24h price change percentage
- Color-coded trends (green/red)
- Responsive design

### VolumeChart

Shows trading volume over time using bar chart.

```tsx
import { VolumeChart } from '@/components/analytics';

<VolumeChart
  data={volumeHistory}
  isLoading={false}
/>
```

**Features:**
- Bar chart visualization
- Average volume display
- Smart number formatting (K/M)
- Hover tooltips

### HolderDistribution

Pie chart showing token distribution among top holders.

```tsx
import { HolderDistribution } from '@/components/analytics';

<HolderDistribution
  holders={holders}
  isLoading={false}
/>
```

**Features:**
- Top 10 holders visualization
- Concentration risk indicator
- Color-coded segments
- "Others" category for remaining holders

### RiskScoreCard

Comprehensive risk assessment with score and factors.

```tsx
import { RiskScoreCard } from '@/components/analytics';

<RiskScoreCard
  score={riskScore}
  isLoading={false}
/>
```

**Features:**
- Overall risk score (0-100)
- Risk level badge (Low/Medium/High)
- Individual risk factors breakdown
- Red/yellow/green flags

### MetricsOverview

Grid of key metrics cards (price, market cap, volume, holders).

```tsx
import { MetricsOverview } from '@/components/analytics';

<MetricsOverview
  metrics={tokenMetrics}
  isLoading={false}
/>
```

**Features:**
- 4-card grid layout
- Current price with 24h change
- Market cap with formatting
- Volume and transaction count
- Holder statistics

### TradingPatternAlert

Alert banner for detected trading patterns.

```tsx
import { TradingPatternAlert } from '@/components/analytics';

<TradingPatternAlert
  pattern={tradingPattern}
/>
```

**Features:**
- Pattern type detection (accumulation, distribution, pump, stable)
- Confidence level indicator
- Time since detection
- Color-coded alerts

### HolderList

Table of top token holders with detailed information.

```tsx
import { HolderList } from '@/components/analytics';

<HolderList
  holders={holders}
  isLoading={false}
  limit={50}
/>
```

**Features:**
- Ranked holder list with medals (🥇🥈🥉)
- Wallet address with copy functionality
- Balance, percentage, and USD value
- Solscan integration links
- Risk badges for large holders

## Data Types

### TokenMetrics

```typescript
interface TokenMetrics {
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  holders: number;
  transactions24h: number;
  priceHistory: PriceDataPoint[];
  volumeHistory: VolumeDataPoint[];
  distribution: {
    top10Holders: number;
    walletConcentration: number;
  };
}
```

### RiskScore

```typescript
interface RiskScore {
  overallScore: number;
  factors: {
    rugPullRisk: number;
    liquidityRisk: number;
    concentrationRisk: number;
    contractRisk: number;
  };
  signals: {
    redFlags: string[];
    yellowFlags: string[];
    greenFlags: string[];
  };
}
```

### Holder

```typescript
interface Holder {
  walletAddress: string;
  balance: string;
  percentage: number;
  valueUSD: number;
  rank: number;
}
```

### TradingPattern

```typescript
interface TradingPattern {
  pattern: "accumulation" | "distribution" | "pump" | "stable";
  confidence: number;
  detectedAt: number;
  description: string;
}
```

## Usage with Convex

Example integration with Convex real-time queries:

```tsx
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { TokenAnalyticsDashboard } from "@/components/analytics";

export function TokenPage({ tokenId }: { tokenId: string }) {
  const metrics = useQuery(api.analytics.getTokenMetrics, { tokenId });
  const riskScore = useQuery(api.analytics.getRiskScore, { tokenId });
  const holders = useQuery(api.analytics.getHolders, { tokenId });
  const pattern = useQuery(api.analytics.detectPattern, { tokenId });

  const isLoading =
    metrics === undefined ||
    riskScore === undefined ||
    holders === undefined;

  return (
    <TokenAnalyticsDashboard
      tokenId={tokenId}
      metrics={metrics || null}
      riskScore={riskScore || null}
      holders={holders || []}
      pattern={pattern || null}
      isLoading={isLoading}
    />
  );
}
```

## Usage in Astro Pages

```astro
---
// src/pages/token/[id]/analytics.astro
import Layout from '@/layouts/Layout.astro';
import { TokenAnalyticsDashboard } from '@/components/analytics';

const { id } = Astro.params;
---

<Layout title="Token Analytics">
  <div class="container mx-auto py-8">
    <h1 class="text-3xl font-bold mb-6">Token Analytics</h1>

    <!-- Use client:load for real-time data -->
    <TokenAnalyticsDashboard
      client:load
      tokenId={id}
      metrics={null}
      riskScore={null}
      holders={[]}
      pattern={null}
      isLoading={true}
    />
  </div>
</Layout>
```

## Features

### Loading States
All components include skeleton loaders for smooth loading experience.

### Error Handling
Components gracefully handle missing or null data with empty state messages.

### Responsive Design
All components are mobile-responsive with Tailwind breakpoints.

### Dark Mode
Full dark mode support using Tailwind dark mode utilities.

### Real-time Updates
Designed to work with Convex real-time subscriptions.

### Accessibility
- Proper ARIA labels
- Keyboard navigation
- Screen reader support
- Color contrast compliance

## Performance

- Components use React.memo where appropriate
- Charts use ResponsiveContainer for optimal sizing
- Lazy loading for below-fold content
- Efficient re-renders with proper dependencies

## Dependencies

- `recharts` - Chart visualizations
- `lucide-react` - Icons
- `date-fns` - Date formatting
- `sonner` - Toast notifications
- `shadcn/ui` - UI components

## Related Cycles

This implementation covers:
- **CYCLE-064**: Analytics Dashboard (Frontend)
- **CYCLE-065**: Chart Components
- **CYCLE-066**: Risk Score Visualization
- **CYCLE-067**: Holder Analytics
- **CYCLE-068**: Pattern Detection UI

## Next Steps

To integrate with backend:
1. Implement `api.analytics.getTokenMetrics` query
2. Implement `api.analytics.getRiskScore` query
3. Implement `api.analytics.getHolders` query
4. Implement `api.analytics.detectPattern` query
5. Set up real-time sync with scheduled cron jobs (CYCLE-063)
