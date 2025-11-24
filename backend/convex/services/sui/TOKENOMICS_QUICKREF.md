# TokenomicsCalculatorService - Quick Reference

**Location:** `/home/user/one.ie/backend/convex/services/sui/TokenomicsCalculatorService.ts`

---

## Import

```typescript
import { Effect } from "effect";
import {
  TokenomicsCalculatorService,
  TokenomicsCalculatorServiceDefault,
} from "./services/sui/TokenomicsCalculatorService";
```

---

## 1. Calculate Distribution

```typescript
const distribution = yield* service.calculateTokenDistribution(
  "standard",      // Template
  "1000000000"     // Total supply
);

// Templates: "standard" | "team_vesting" | "fair_launch" | "dao" | "ai_agent" | "revenue_share"
```

---

## 2. Simulate Vesting

```typescript
const simulation = yield* service.simulateVesting(
  {
    totalAmount: "30000000",
    cliffMonths: 12,
    vestingMonths: 48,
  },
  60  // Projection months
);

// Access: simulation.dataPoints, simulation.summary
```

---

## 3. Calculate Staking APY

```typescript
const apy = yield* service.calculateStakingAPY({
  totalStaked: "10000000",
  rewardRate: 0.05,
  lockDuration: 30,
  compoundingFrequency: "daily",
});

// Returns: 0.05127 (5.127%)
```

---

## 4. Project Treasury

```typescript
const projection = yield* service.projectTreasuryGrowth(
  {
    initialBalance: "5000000",
    monthlyInflow: "100000",
    monthlyOutflow: "150000",
  },
  36
);

// Access: projection.summary.runwayMonths, projection.dataPoints
```

---

## 5. Market Cap

```typescript
const marketCap = yield* service.calculateMarketCap(
  "400000000",  // Circulating
  "1.50"        // Price
);
```

---

## 6. FDV

```typescript
const fdv = yield* service.calculateFullyDilutedValuation(
  "1000000000",  // Max supply
  "1.50"         // Price
);
```

---

## Run Program

```typescript
const program = Effect.gen(function* () {
  const service = yield* TokenomicsCalculatorService;
  const result = yield* service.calculateTokenDistribution("standard", "1000000000");
  return result;
});

const result = await Effect.runPromise(
  program.pipe(Effect.provide(TokenomicsCalculatorServiceDefault))
);
```

---

## Templates

| Template       | Public | Team | Investors | Treasury | Other |
|----------------|--------|------|-----------|----------|-------|
| Standard       | 40%    | 30%  | 20%       | 10%      | -     |
| Team Vesting   | 30%    | 60%  | -         | 10%      | -     |
| Fair Launch    | 100%   | -    | -         | -        | -     |
| DAO            | -      | 20%  | -         | 50%      | 30%*  |
| AI Agent       | -      | 10%  | -         | -        | 90%** |
| Revenue Share  | -      | 20%  | -         | 10%      | 70%*** |

*Community Airdrops | **Utility (70%) + Staking (20%) | ***Holders (40%) + Stakers (30%)

---

## Examples

```bash
# Run examples
npx tsx TokenomicsCalculatorService.example.ts

# Run tests
npx tsx TokenomicsCalculatorService.test.ts
```

---

**Full docs:** `TOKENOMICS_SUMMARY.md`
