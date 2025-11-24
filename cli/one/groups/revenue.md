---
title: Revenue
dimension: groups
category: revenue.md
tags: ai, architecture, blockchain, cycle
related_dimensions: events, knowledge, things
scope: global
created: 2025-11-03
updated: 2025-11-03
version: 1.0.0
ai_context: |
  This document is part of the groups dimension in the revenue.md category.
  Location: one/groups/revenue.md
  Purpose: Documents cycle revenue strategy - crypto scale
  Related dimensions: events, knowledge, things
  For AI agents: Read this to understand revenue.
---

# Cycle Revenue Strategy - Crypto Scale

**Version:** 1.0.0
**Status:** Strategic
**Purpose:** Maximum revenue from AI cycle using optimal crypto infrastructure

---

## Executive Summary

**Goal:** Scale AI cycle revenue as fast as possible using blockchain infrastructure.

**Critical Insight:** Blockchain fees are the difference between 25% and 55% profit margins. Every basis point matters at scale.

**Recommendation:** **SUI-first architecture with sponsored transactions**

**Key Numbers:**

- **Revenue per cycle:** $0.10
- **Cycle cost (GPT-5):** $0.045
- **SUI gas cost:** $0.00005
- **Net margin:** 54.95%
- **Daily profit (100K cycles):** $5,495

Compare to Ethereum/Base:

- **Gas cost:** $0.03/tx
- **Net margin:** 25%
- **Daily profit (100K cycles):** $2,500

**SUI = 2.2x MORE PROFIT**

---

## Cycle Economics Breakdown

### Real-World Cycle Costs

**GPT-4 Turbo:**

- Input: $0.01 per 1K tokens
- Output: $0.03 per 1K tokens
- Average call: 500 input + 500 output tokens
- **Cost per cycle: $0.045**

**Claude 3.5 Sonnet:**

- Input: $0.003 per 1K tokens
- Output: $0.015 per 1K tokens
- Average call: 500 input + 500 output tokens
- **Cost per cycle: $0.009**

**Custom Models (self-hosted):**

- Llama 3 70B: ~$0.001/cycle (amortized GPU costs)
- Mixtral 8x7B: ~$0.0005/cycle
- **Cost per cycle: $0.001-$0.005**

### Revenue Model Analysis

**Target Pricing (2-3x markup on cycle):**

```
Model          | Cost    | Price   | Gross Margin
---------------|---------|---------|-------------
GPT-4          | $0.045  | $0.10   | 55%
Claude 3.5     | $0.009  | $0.025  | 64%
Llama 3 70B    | $0.002  | $0.005  | 60%
```

**Now Add Blockchain Costs:**

```
Network   | Gas Cost | GPT-4 Net Margin | Claude Net Margin
----------|----------|------------------|------------------
SUI       | $0.00005 | 54.95%          | 63.98%
Solana    | $0.00025 | 54.75%          | 63.00%
Base      | $0.03    | 25%             | 32%
Ethereum  | $0.10    | -55% (LOSS!)    | -36% (LOSS!)
```

**THE VERDICT IS CLEAR:**

- **SUI preserves margins** - gas is 0.05% of revenue
- **Base destroys margins** - gas is 30% of revenue
- **Ethereum is unusable** - gas exceeds gross profit

---

## SUI-First Architecture for Cycle Revenue

### 1. Sponsored Transactions (Critical for Scale)

**Pattern: Platform Pays Gas, User Pays Cycle**

```typescript
// convex/services/cycle/payment.ts
export class CyclePaymentService extends Effect.Service<CyclePaymentService>()(
  "CyclePaymentService",
  {
    effect: Effect.gen(function* () {
      const sui = yield* SuiProvider;
      const db = yield* ConvexDatabase;

      return {
        // Platform sponsors gas, user pays cycle fee only
        processCyclePayment: (args: CyclePaymentArgs) =>
          Effect.gen(function* () {
            // 1. Build transaction
            const tx = new Transaction();

            // 2. USER PAYS: Transfer cycle fee to platform
            const [coin] = tx.splitCoins(tx.object(args.userPaymentCoin), [
              tx.pure(args.cyclePrice), // e.g., $0.10 in USDC
            ]);
            tx.transferObjects([coin], tx.pure(PLATFORM_TREASURY_ADDRESS));

            // 3. PLATFORM PAYS: Sponsor gas from platform pool
            tx.setGasPayment([
              {
                objectId: PLATFORM_GAS_POOL, // Platform's SUI coin
                version: platformGasVersion,
                digest: platformGasDigest,
              },
            ]);

            // 4. Execute with platform signature (gas payer)
            const result = yield* sui.executeTransaction(tx);

            // 5. Record payment event
            yield* Effect.tryPromise(() =>
              db.insert("events", {
                type: "payment_event",
                actorId: args.userId,
                targetId: args.cycleRequestId,
                timestamp: Date.now(),
                metadata: {
                  network: "sui",
                  status: "completed",
                  amount: args.cyclePrice,
                  coinType: "USDC",
                  txDigest: result.digest,
                  gasSponsoredBy: "platform",
                  gasCostUSD: 0.00005,
                },
              }),
            );

            return {
              success: true,
              txDigest: result.digest,
              userPaid: args.cyclePrice,
              platformPaidGas: 0.00005,
            };
          }),
      };
    }),
    dependencies: [SuiProvider.Default, ConvexDatabase.Default],
  },
) {}
```

**User Experience:**

1. Sign in with Google (ZK Login - no wallet needed)
2. Click "Run Cycle" ($0.10)
3. Approve payment (USDC transfer)
4. Result appears in 500ms
5. **Never see "gas fees"**

**Platform Economics:**

- Revenue: $0.10
- Cycle cost: $0.045
- Gas sponsored: $0.00005
- **Net profit: $0.05495 (54.95% margin)**

### 2. Atomic Cycle + Payment

**Pattern: Bundle cycle request + payment in single transaction**

```typescript
// SUI Move contract
module cycle::payment {
    use sui::coin::{Self, Coin};
    use sui::usdc::USDC;

    /// Atomic: Pay + Request Cycle
    public entry fun pay_and_request_cycle(
        payment: Coin<USDC>,
        treasury: &mut Treasury,
        cycle_request: vector<u8>,  // Serialized request
        ctx: &mut TxContext
    ) {
        // 1. Validate payment amount
        let amount = coin::value(&payment);
        assert!(amount >= treasury.min_cycle_price, INSUFFICIENT_PAYMENT);

        // 2. Transfer payment to treasury
        coin::put(&mut treasury.balance, payment);

        // 3. Emit cycle request event
        event::emit(CycleRequested {
            user: tx_context::sender(ctx),
            request: cycle_request,
            amount_paid: amount,
            timestamp: tx_context::epoch_timestamp_ms(ctx),
        });

        // Off-chain: Backend listens to events, runs cycle, delivers result
    }

    /// Atomic: Verify + Deliver Result
    public entry fun deliver_cycle_result(
        request_id: ID,
        result: vector<u8>,  // Encrypted result
        proof: vector<u8>,   // Proof of computation
        ctx: &mut TxContext
    ) {
        // Only authorized cycle provider can call
        assert!(tx_context::sender(ctx) == CYCLEENCE_PROVIDER, UNAUTHORIZED);

        // Emit result event
        event::emit(CycleDelivered {
            request_id,
            result,
            proof,
            delivered_at: tx_context::epoch_timestamp_ms(ctx),
        });
    }
}
```

**Flow:**

```
User → pay_and_request_cycle (1 tx, 400ms finality)
  ↓
Platform backend listens to CycleRequested event
  ↓
Run cycle (GPT-4, Claude, etc.)
  ↓
Platform → deliver_cycle_result (1 tx, 400ms finality)
  ↓
User frontend listens to CycleDelivered event
  ↓
Display result

Total time: ~1 second
Total cost: 2 tx × $0.00005 = $0.0001
```

### 3. Subscription Model (Recurring Revenue)

**Pattern: Stake tokens for unlimited cycles**

```typescript
// SUI Move contract
module cycle::subscription {
    use sui::coin::{Self, Coin};
    use creator_token::CREATOR;

    struct Subscription has key {
        id: UID,
        user: address,
        staked_amount: u64,
        tier: u8,  // 1=Basic, 2=Pro, 3=Enterprise
        start_epoch: u64,
        end_epoch: u64,
        cycles_remaining: u64,
    }

    /// Stake tokens for subscription
    public entry fun subscribe(
        stake: Coin<CREATOR>,
        tier: u8,
        duration_days: u64,
        ctx: &mut TxContext
    ) {
        let staked_amount = coin::value(&stake);
        let required_stake = get_required_stake(tier);

        assert!(staked_amount >= required_stake, INSUFFICIENT_STAKE);

        let subscription = Subscription {
            id: object::new(ctx),
            user: tx_context::sender(ctx),
            staked_amount,
            tier,
            start_epoch: tx_context::epoch(ctx),
            end_epoch: tx_context::epoch(ctx) + duration_days,
            cycles_remaining: get_tier_cycles(tier),
        };

        // Lock tokens
        transfer::share_object(subscription);
        transfer::public_transfer(stake, STAKING_POOL);
    }

    /// Use subscription for cycle (free for user)
    public entry fun use_subscription_cycle(
        subscription: &mut Subscription,
        ctx: &mut TxContext
    ) {
        assert!(subscription.user == tx_context::sender(ctx), UNAUTHORIZED);
        assert!(subscription.cycles_remaining > 0, NO_CYCLEENCES_LEFT);
        assert!(tx_context::epoch(ctx) < subscription.end_epoch, SUBSCRIPTION_EXPIRED);

        subscription.cycles_remaining = subscription.cycles_remaining - 1;

        event::emit(SubscriptionCycleUsed {
            user: subscription.user,
            tier: subscription.tier,
            remaining: subscription.cycles_remaining,
        });
    }
}
```

**Subscription Tiers:**

```
Tier        | Stake Required | Cycles/Month | Effective Cost/Cycle
------------|----------------|------------------|--------------------------
Basic       | 1,000 tokens   | 100              | $0.10 (if token = $10)
Pro         | 5,000 tokens   | 1,000            | $0.05
Enterprise  | 25,000 tokens  | 10,000           | $0.025
```

**Revenue Impact:**

- **Upfront capital lock** - staked tokens create buying pressure
- **Recurring value** - monthly cycle usage
- **Reduced churn** - staking commitment
- **Lower marginal cost** - no per-cycle payment overhead

**Platform Economics (Pro Tier):**

- User stakes: $50,000 worth of tokens
- Platform can yield farm staked tokens at 5% APY = $2,500/year
- User gets 1,000 cycles/month = 12,000/year
- Cycle cost (Claude): 12,000 × $0.009 = $108/year
- **Platform profit: $2,500 (yield) - $108 (cycle) = $2,392/year**
- **Effective margin: 95.7%**

### 4. Batch Cycle (Cost Optimization)

**Pattern: Combine multiple cycle requests into single batch**

```typescript
// convex/services/cycle/batch.ts
export class BatchCycleService extends Effect.Service<BatchCycleService>()(
  "BatchCycleService",
  {
    effect: Effect.gen(function* () {
      const openai = yield* OpenAIProvider;
      const sui = yield* SuiProvider;

      return {
        // Batch multiple requests to save on per-request overhead
        processBatch: (requests: CycleRequest[]) =>
          Effect.gen(function* () {
            // 1. Collect all requests (wait 100ms for batching)
            const batchWindow = 100; // ms
            yield* Effect.sleep(batchWindow);

            // 2. Call OpenAI batch API (cheaper than individual calls)
            const results = yield* openai.createBatch({
              requests: requests.map((r) => ({
                model: "gpt-4-turbo",
                messages: r.messages,
              })),
            });

            // 3. Record SINGLE payment event for entire batch
            const totalRevenue = requests.reduce((sum, r) => sum + r.price, 0);
            const totalCost = results.usage.total_tokens * 0.00001; // GPT-4 pricing

            yield* Effect.tryPromise(() =>
              db.insert("events", {
                type: "batch_cycle_completed",
                actorId: "system",
                timestamp: Date.now(),
                metadata: {
                  network: "sui",
                  batchSize: requests.length,
                  totalRevenue,
                  totalCost,
                  grossProfit: totalRevenue - totalCost,
                  margin: ((totalRevenue - totalCost) / totalRevenue) * 100,
                },
              }),
            );

            // 4. Deliver results to individual users
            yield* Effect.all(
              results.map((result, i) =>
                this.deliverResult(requests[i].userId, result),
              ),
            );

            return { batchSize: requests.length, totalRevenue, totalCost };
          }),
      };
    }),
    dependencies: [OpenAIProvider.Default, SuiProvider.Default],
  },
) {}
```

**Batching Benefits:**

- **Lower cycle costs** - OpenAI batch API is 50% cheaper
- **Single gas transaction** - amortize $0.00005 across 100 requests = $0.0000005/request
- **Higher margins** - 50% cost reduction on cycle = margin jumps to 77%

---

## Revenue Scaling Strategy

### Phase 1: Launch (Month 1) - Prove Unit Economics

**Goal:** $1,000/day revenue, validate margins

**Tactics:**

- Deploy SUI contracts
- Launch pay-per-cycle model
- Target: 10,000 cycles/day @ $0.10 = $1,000/day
- Costs: $450 (cycle) + $0.50 (gas) = $450.50
- **Profit: $549.50/day (55% margin)**

**Metrics to Track:**

- Revenue per user
- Cycle cost per model
- Gas cost per transaction
- Margin %
- User retention

### Phase 2: Optimize (Month 2-3) - Improve Margins

**Goal:** $5,000/day revenue, 65% margins

**Tactics:**

- Add subscription tiers (lock in capital)
- Implement batch processing (reduce cycle costs 50%)
- Switch to Claude/Llama for cheaper cycles
- Target: 50,000 cycles/day
  - 10,000 pay-per @ $0.10 = $1,000
  - 40,000 subscription @ $0.025 effective = $1,000
  - Staking yield: $3,000/day
- **Total: $5,000/day**

**Improved Economics:**

- Batch cycle cost: 50,000 × $0.0045 = $225/day (50% reduction)
- Gas cost: 500 batches × $0.00005 = $0.025/day
- Staking yield: $3,000/day (passive)
- **Profit: $5,000 - $225 = $4,775/day (95.5% margin)**

### Phase 3: Scale (Month 4-6) - Go Viral

**Goal:** $50,000/day revenue, maintain 90% margins

**Tactics:**

- Launch viral features (AI agent marketplace)
- Integrate with ChatGPT, Claude, other AI platforms
- Multi-chain (add Solana for high-frequency traders)
- Target: 500,000 cycles/day
  - 100,000 pay-per @ $0.05 = $5,000
  - 400,000 subscription @ $0.01 effective = $4,000
  - Staking yield: $41,000/day
- **Total: $50,000/day**

**Scale Economics:**

- Batch cycle: 500,000 × $0.002 = $1,000/day (self-hosted Llama)
- Gas cost: 5,000 batches × $0.00005 = $0.25/day
- Infrastructure: $3,000/day (GPU servers)
- **Profit: $50,000 - $4,000 = $46,000/day (92% margin)**

### Phase 4: Dominate (Month 7-12) - Network Effects

**Goal:** $500,000/day revenue, 95% margins

**Tactics:**

- AI agent swarms (agents paying agents)
- Protocol integrations (A2A, ACP, AP2)
- Enterprise contracts
- Target: 5,000,000 cycles/day
  - 1,000,000 pay-per @ $0.025 = $25,000
  - 4,000,000 subscription @ $0.005 effective = $20,000
  - Staking yield: $455,000/day
- **Total: $500,000/day**

**Domination Economics:**

- Self-hosted cycle: 5M × $0.001 = $5,000/day
- Gas cost: 50,000 batches × $0.00005 = $2.50/day
- Infrastructure: $20,000/day (large GPU cluster)
- **Profit: $500,000 - $25,000 = $475,000/day (95% margin)**

---

## Competitive Moats

### 1. Lowest Marginal Cost

**SUI gas costs are 600x lower than Base:**

- SUI: $0.00005/tx
- Base: $0.03/tx
- **Moat:** Competitors on Base can't match our margins

### 2. Fastest Settlement

**400ms finality enables real-time cycle:**

- User pays → 400ms → Cycle runs → 400ms → Result delivered
- Total: ~1 second end-to-end
- **Moat:** Ethereum/Base can't compete on UX (1-2s soft, 7 days hard finality)

### 3. Parallel Execution

**SUI object model = unlimited scaling:**

- 1,000 users requesting cycle simultaneously → 1,000 parallel transactions
- Ethereum/Base → sequential bottleneck
- **Moat:** Competitors hit throughput ceiling, we don't

### 4. Sponsored Transactions

**Users never see "blockchain":**

- No wallet setup friction
- No gas fee confusion
- Platform abstracts all crypto complexity
- **Moat:** 10x better onboarding than competitors

### 5. Network Effects (Ontology)

**6-dimension design enables composability:**

- Agent A runs cycle
- Agent B uses Agent A's result
- Agent C builds on A + B
- All payments flow through same ontology
- **Moat:** Every cycle makes the platform more valuable

---

## Implementation Checklist

### Week 1: SUI Contracts

- [ ] Deploy cycle payment contract
- [ ] Implement sponsored transactions
- [ ] Test atomic payment + request flow
- [ ] Deploy to SUI testnet

### Week 2: Backend Integration

- [ ] Build SUI provider in Effect.ts
- [ ] Implement event listeners for cycle requests
- [ ] Connect OpenAI/Claude APIs
- [ ] Build result delivery system

### Week 3: Frontend

- [ ] ZK Login integration (Google/GitHub)
- [ ] Cycle request UI
- [ ] Real-time result streaming
- [ ] Payment flow (USDC)

### Week 4: Launch

- [ ] Deploy to SUI mainnet
- [ ] Onboard first 100 users
- [ ] Validate unit economics
- [ ] Measure margins

### Month 2: Optimize

- [ ] Add subscription tiers
- [ ] Implement batch processing
- [ ] Switch to cheaper models
- [ ] Add Solana for high-frequency

### Month 3+: Scale

- [ ] Viral growth loops
- [ ] Enterprise sales
- [ ] Protocol integrations
- [ ] AI agent marketplace

---

## Financial Projections

### Conservative Case (90% confidence)

```
Month  | Cycles/Day | Revenue/Day | Profit/Day | Margin
-------|----------------|-------------|------------|-------
1      | 10,000         | $1,000      | $550       | 55%
2      | 25,000         | $2,500      | $1,625     | 65%
3      | 50,000         | $5,000      | $3,750     | 75%
6      | 200,000        | $20,000     | $17,000    | 85%
12     | 1,000,000      | $100,000    | $92,000    | 92%

Year 1 Total Revenue: $13.5M
Year 1 Total Profit: $11.5M
```

### Aggressive Case (50% confidence)

```
Month  | Cycles/Day | Revenue/Day | Profit/Day | Margin
-------|----------------|-------------|------------|-------
1      | 50,000         | $5,000      | $3,750     | 75%
2      | 150,000        | $15,000     | $12,750    | 85%
3      | 500,000        | $50,000     | $45,000    | 90%
6      | 2,000,000      | $200,000    | $186,000   | 93%
12     | 10,000,000     | $1,000,000  | $950,000   | 95%

Year 1 Total Revenue: $135M
Year 1 Total Profit: $125M
```

### Moonshot Case (10% confidence)

```
Month  | Cycles/Day | Revenue/Day | Profit/Day | Margin
-------|----------------|-------------|------------|-------
3      | 1,000,000      | $100,000    | $92,000    | 92%
6      | 5,000,000      | $500,000    | $475,000   | 95%
12     | 50,000,000     | $5,000,000  | $4,800,000 | 96%

Year 1 Total Revenue: $650M
Year 1 Total Profit: $620M
```

**Key Driver:** Viral AI agent swarms where agents pay other agents for cycle. Network effects compound exponentially.

---

## Why This Works

### 1. Unit Economics Are Perfect

- 55% gross margin on pay-per-cycle
- 95% margin on subscriptions (yield farming)
- Margins IMPROVE with scale (batch processing)

### 2. SUI Infrastructure Is Ideal

- Lowest gas costs in crypto (600x cheaper than Base)
- Fastest finality (400ms)
- Parallel execution (unlimited scaling)
- Sponsored transactions (no user friction)

### 3. Ontology Enables Composability

- Every cycle is an event
- Events compose into higher-order services
- Network effects compound
- Platform becomes more valuable with each transaction

### 4. Multi-Revenue Streams

- Pay-per-cycle (immediate revenue)
- Subscriptions (recurring + yield farming)
- Enterprise contracts (high-margin)
- Protocol fees (agent-to-agent payments)

### 5. Competitive Moats

- Cost advantage (can't be matched on Ethereum/Base)
- Speed advantage (400ms vs 7 days)
- UX advantage (sponsored transactions)
- Network effects (ontology composability)

---

## Final Recommendation

**Deploy on SUI with this stack:**

1. **Smart Contracts:** SUI Move for payments + subscriptions
2. **Backend:** Effect.ts services for cycle orchestration
3. **Frontend:** Astro + React with ZK Login
4. **Cycle:** Start with OpenAI/Claude, migrate to self-hosted
5. **Payments:** USDC on SUI (sponsored gas)

**Revenue Model:**

- Launch: Pay-per-cycle ($0.10)
- Month 2: Add subscriptions (stake tokens)
- Month 3: Add batch processing (lower costs)
- Month 6: Enterprise contracts (high-margin)
- Month 12: Agent swarms (network effects)

**Financial Goal:**

- Year 1: $13.5M revenue (conservative)
- Year 1: $11.5M profit (85% margin)
- Year 2: $100M+ revenue (if viral)

**This is how you scale cycle revenue on crypto. Fast, profitable, unstoppable.**
