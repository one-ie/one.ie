/**
 * TokenDashboard Usage Examples
 *
 * This file demonstrates how to use the TokenDashboard component
 * in different scenarios.
 */

import { TokenDashboard } from './TokenDashboard';

// ============================================================================
// Example 1: Basic usage with Convex backend (real-time data)
// ============================================================================

/**
 * In an Astro page with Convex integration:
 *
 * File: /web/src/pages/tokens/[id].astro
 */
/*
---
import Layout from '@/layouts/Layout.astro';
import { TokenDashboard } from '@/components/features/tokens/TokenDashboard';

const { id } = Astro.params;
---

<Layout title="Token Dashboard">
  <div class="container mx-auto py-8">
    <TokenDashboard tokenId={id} client:load />
  </div>
</Layout>
*/

// ============================================================================
// Example 2: Usage with static data (no backend)
// ============================================================================

/**
 * Using the dashboard with pre-fetched or static data
 *
 * File: /web/src/pages/tokens/demo.astro
 */
/*
---
import Layout from '@/layouts/Layout.astro';
import { TokenDashboard } from '@/components/features/tokens/TokenDashboard';

// Fetch from external API or use static data
const tokenData = {
  token: {
    _id: '1',
    name: 'Example Token',
    symbol: 'EXT',
    contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
    network: 'Ethereum',
    price: 1.23,
    marketCap: 123000000,
    totalSupply: 100000000,
    holders: 5432,
    volume24h: 1230000,
    priceChange24h: 5.67,
    website: 'https://example.com',
    twitter: 'https://twitter.com/example',
    discord: 'https://discord.gg/example',
    telegram: 'https://t.me/example',
    riskScore: 25,
  },
  holders: [
    {
      address: '0x1234567890abcdef1234567890abcdef12345678',
      balance: 10000000,
      percentage: 10,
      isContract: false,
    },
    // ... more holders
  ],
  transactions: [
    {
      _id: '1',
      hash: '0xabcdef...',
      type: 'transfer',
      from: '0x1234...',
      to: '0x5678...',
      amount: 1000,
      timestamp: Date.now() - 3600000,
    },
    // ... more transactions
  ],
  stats: [
    { timestamp: Date.now() - 86400000 * 7, price: 1.0, volume: 1000000 },
    { timestamp: Date.now() - 86400000 * 6, price: 1.1, volume: 1100000 },
    { timestamp: Date.now() - 86400000 * 5, price: 1.05, volume: 1050000 },
    { timestamp: Date.now() - 86400000 * 4, price: 1.15, volume: 1150000 },
    { timestamp: Date.now() - 86400000 * 3, price: 1.2, volume: 1200000 },
    { timestamp: Date.now() - 86400000 * 2, price: 1.18, volume: 1180000 },
    { timestamp: Date.now() - 86400000, price: 1.23, volume: 1230000 },
  ],
};
---

<Layout title="Token Demo">
  <div class="container mx-auto py-8">
    <TokenDashboard tokenId="demo" staticData={tokenData} client:load />
  </div>
</Layout>
*/

// ============================================================================
// Example 3: Usage in a React component (for islands)
// ============================================================================

export function TokenPage({ tokenId }: { tokenId: string }) {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Token Dashboard</h1>
      <TokenDashboard tokenId={tokenId} />
    </div>
  );
}

// ============================================================================
// Example 4: Backend Integration Setup
// ============================================================================

/**
 * Required Convex queries to implement in your backend:
 *
 * File: /backend/convex/tokens.ts
 */
/*
import { query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const token = await ctx.db
      .query("tokens")
      .filter((q) => q.eq(q.field("_id"), args.id))
      .first();

    return token;
  },
});

export const getHolders = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const holders = await ctx.db
      .query("tokenHolders")
      .filter((q) => q.eq(q.field("tokenId"), args.id))
      .order("desc")
      .take(100);

    return holders;
  },
});

export const getTransactions = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const transactions = await ctx.db
      .query("tokenTransactions")
      .filter((q) => q.eq(q.field("tokenId"), args.id))
      .order("desc")
      .take(100);

    return transactions;
  },
});

export const getStats = query({
  args: {
    id: v.string(),
    timeframe: v.union(v.literal("24h"), v.literal("7d"), v.literal("30d"))
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const timeMap = {
      "24h": 24 * 60 * 60 * 1000,
      "7d": 7 * 24 * 60 * 60 * 1000,
      "30d": 30 * 24 * 60 * 60 * 1000,
    };

    const startTime = now - timeMap[args.timeframe];

    const stats = await ctx.db
      .query("tokenStats")
      .filter((q) =>
        q.and(
          q.eq(q.field("tokenId"), args.id),
          q.gte(q.field("timestamp"), startTime)
        )
      )
      .order("asc")
      .collect();

    return stats;
  },
});
*/

// ============================================================================
// Example 5: Hydration strategies
// ============================================================================

/**
 * Different hydration strategies based on use case:
 */

// Strategy 1: Load immediately (critical, above fold)
// <TokenDashboard tokenId={id} client:load />

// Strategy 2: Load when idle (below fold, secondary)
// <TokenDashboard tokenId={id} client:idle />

// Strategy 3: Load when visible (far below fold)
// <TokenDashboard tokenId={id} client:visible />

// Strategy 4: Only on client (no SSR)
// <TokenDashboard tokenId={id} client:only="react" />

// ============================================================================
// TypeScript Types for Backend
// ============================================================================

/**
 * Add these types to your Convex schema:
 *
 * File: /backend/convex/schema.ts
 */
/*
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tokens: defineTable({
    name: v.string(),
    symbol: v.string(),
    contractAddress: v.string(),
    network: v.string(),
    price: v.number(),
    marketCap: v.number(),
    totalSupply: v.number(),
    holders: v.number(),
    volume24h: v.number(),
    priceChange24h: v.number(),
    website: v.optional(v.string()),
    twitter: v.optional(v.string()),
    discord: v.optional(v.string()),
    telegram: v.optional(v.string()),
    riskScore: v.optional(v.number()),
  })
    .index("by_symbol", ["symbol"])
    .index("by_contract", ["contractAddress"]),

  tokenHolders: defineTable({
    tokenId: v.id("tokens"),
    address: v.string(),
    balance: v.number(),
    percentage: v.number(),
    isContract: v.boolean(),
  })
    .index("by_token", ["tokenId"])
    .index("by_address", ["address"]),

  tokenTransactions: defineTable({
    tokenId: v.id("tokens"),
    hash: v.string(),
    type: v.union(v.literal("transfer"), v.literal("mint"), v.literal("burn")),
    from: v.string(),
    to: v.string(),
    amount: v.number(),
    timestamp: v.number(),
  })
    .index("by_token", ["tokenId"])
    .index("by_timestamp", ["timestamp"]),

  tokenStats: defineTable({
    tokenId: v.id("tokens"),
    timestamp: v.number(),
    price: v.number(),
    volume: v.number(),
  })
    .index("by_token", ["tokenId"])
    .index("by_timestamp", ["timestamp"]),
});
*/
