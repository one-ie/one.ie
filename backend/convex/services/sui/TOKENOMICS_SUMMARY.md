# TokenomicsCalculatorService - Implementation Summary

**Status:** Complete ✓
**Location:** `/home/user/one.ie/backend/convex/services/sui/TokenomicsCalculatorService.ts`
**Type:** Pure calculation service (no blockchain interaction)
**Framework:** Effect.ts

---

## Files Delivered

### 1. TokenomicsCalculatorService.ts (873 lines, 25KB)

**Main service implementation** with all requested features.

**Includes:**
- ✓ Error types (TokenomicsCalculationError, ValidationError)
- ✓ Template types (6 templates)
- ✓ Distribution types (Allocation, Distribution)
- ✓ Vesting types (VestingSchedule, VestingSimulation)
- ✓ Staking types (StakingPool)
- ✓ Treasury types (TreasuryParams, TreasuryProjection)
- ✓ Service definition (Effect.Service pattern)
- ✓ Live implementation (TokenomicsCalculatorServiceLive)
- ✓ Default layer (TokenomicsCalculatorServiceDefault)

### 2. TokenomicsCalculatorService.example.ts (13KB)

**8 comprehensive examples** demonstrating all features:
- Example 1: Standard distribution
- Example 2: Custom allocations
- Example 3: Team vesting simulation
- Example 4: Staking APY comparison (simple vs daily vs monthly)
- Example 5: Treasury projections (declining + growing)
- Example 6: Market metrics (market cap + FDV)
- Example 7: Complete tokenomics analysis
- Example 8: AI agent tokenomics

### 3. TokenomicsCalculatorService.test.ts (11KB)

**9 test suites** verifying correctness:
- Test 1: Standard distribution calculation
- Test 2: Vesting simulation (cliff + linear)
- Test 3: Staking APY (simple + compound)
- Test 4: Treasury projection (growth + runway)
- Test 5: Market cap calculation
- Test 6: Fully diluted valuation
- Test 7: Custom allocations
- Test 8: All 6 templates
- Test 9: Error handling

### 4. README.md (1.5KB)

Quick reference guide with usage examples.

---

## Features Implemented

### 1. calculateTokenDistribution()

**Purpose:** Calculate token allocation breakdown from templates

**Templates:**
1. **Standard Launch** - 40% public, 30% team (2yr), 20% investors (1yr), 10% treasury
2. **Team Vesting** - 60% team (4yr, 1yr cliff), 30% public, 10% treasury
3. **Fair Launch** - 100% public (no pre-sale)
4. **DAO Launch** - 50% treasury, 30% airdrops, 20% team (4yr)
5. **AI Agent** - 70% utility, 20% staking, 10% team (2yr)
6. **Revenue Share** - 40% holders, 30% stakers, 20% team (2yr), 10% dev fund

**Usage:**
```typescript
const distribution = yield* service.calculateTokenDistribution(
  "standard",
  "1000000000"  // 1B tokens
);

// Customize:
const custom = yield* service.calculateTokenDistribution(
  "standard",
  "1000000000",
  { "Public Sale": 50, Team: 25, Investors: 15, Treasury: 10 }
);
```

**Returns:**
```typescript
{
  template: "standard",
  totalSupply: "1000000000",
  allocations: [
    { category: "Public Sale", percentage: 40, amount: "400000000" },
    { category: "Team", percentage: 30, amount: "300000000", vestingMonths: 24 },
    ...
  ],
  summary: {
    publicAllocation: 40,
    teamAllocation: 30,
    treasuryAllocation: 10,
    otherAllocation: 20
  }
}
```

### 2. simulateVesting()

**Purpose:** Month-by-month vesting projection with cliff support

**Formula:**
- Before cliff: 0 tokens vested
- After cliff: Linear vesting (totalAmount / vestingMonths per month)
- Monthly release = totalAmount / vestingMonths

**Usage:**
```typescript
const simulation = yield* service.simulateVesting(
  {
    totalAmount: "30000000",
    cliffMonths: 12,      // 1-year cliff
    vestingMonths: 48,    // 4-year vesting
  },
  60 // Project 5 years
);
```

**Returns:**
```typescript
{
  schedule: { ... },
  projectionMonths: 60,
  dataPoints: [
    {
      month: 0,
      date: 1700000000000,
      vestedAmount: "0",
      cumulativeAmount: "0",
      percentageVested: 0,
      remainingAmount: "30000000"
    },
    // ... month 1-11 all have 0 vested (cliff)
    {
      month: 12,
      vestedAmount: "625000",    // First release after cliff
      cumulativeAmount: "625000",
      percentageVested: 2.08,
      remainingAmount: "29375000"
    },
    // ... months 13-59 linear vesting
    {
      month: 60,
      vestedAmount: "0",
      cumulativeAmount: "30000000",
      percentageVested: 100,
      remainingAmount: "0"
    }
  ],
  summary: {
    totalAmount: "30000000",
    cliffAmount: "625000",
    monthlyRelease: "625000",
    completionDate: 1763000000000
  }
}
```

### 3. calculateStakingAPY()

**Purpose:** Calculate effective APY with compounding

**Formulas:**
- **Simple (no compounding):** APY = r
- **Daily compounding:** APY = (1 + r/365)^365 - 1
- **Weekly compounding:** APY = (1 + r/52)^52 - 1
- **Monthly compounding:** APY = (1 + r/12)^12 - 1

**Usage:**
```typescript
const apy = yield* service.calculateStakingAPY({
  totalStaked: "10000000",
  rewardRate: 0.05,              // 5% base rate
  lockDuration: 30,              // 30 days
  compoundingFrequency: "daily"  // daily | weekly | monthly | none
});

// Returns: 0.05127 (5.127% APY with daily compounding)
```

**Comparison:**
```
Base rate: 5%
- Simple:  5.000% APY
- Daily:   5.127% APY (+0.127% bonus)
- Weekly:  5.125% APY (+0.125% bonus)
- Monthly: 5.116% APY (+0.116% bonus)
```

### 4. projectTreasuryGrowth()

**Purpose:** Project treasury balance and calculate runway

**Formulas:**
- Balance[n] = Balance[n-1] + Inflow - Outflow
- Runway = Balance / (Outflow - Inflow)  [if Outflow > Inflow]

**Usage:**
```typescript
const projection = yield* service.projectTreasuryGrowth(
  {
    initialBalance: "5000000",
    monthlyInflow: "100000",
    monthlyOutflow: "150000"
  },
  36  // 3-year projection
);
```

**Returns:**
```typescript
{
  params: { ... },
  projectionMonths: 36,
  dataPoints: [
    {
      month: 0,
      balance: "5000000",
      inflow: "100000",
      outflow: "150000",
      netChange: "-50000",
      runway: 100  // months until zero
    },
    // ... months 1-36
  ],
  summary: {
    initialBalance: "5000000",
    finalBalance: "3200000",
    totalInflow: "3600000",
    totalOutflow: "5400000",
    runwayMonths: 100,
    breakEvenMonth: undefined  // never breaks even (outflow > inflow)
  }
}
```

### 5. calculateMarketCap()

**Purpose:** Calculate market capitalization

**Formula:** MarketCap = CirculatingSupply × Price

**Usage:**
```typescript
const marketCap = yield* service.calculateMarketCap(
  "400000000",  // 400M circulating
  "1.50"        // $1.50 per token
);

// Returns: "600000000"  ($600M market cap)
```

### 6. calculateFullyDilutedValuation()

**Purpose:** Calculate fully diluted valuation

**Formula:** FDV = MaxSupply × Price

**Usage:**
```typescript
const fdv = yield* service.calculateFullyDilutedValuation(
  "1000000000",  // 1B max supply
  "1.50"         // $1.50 per token
);

// Returns: "1500000000"  ($1.5B FDV)
```

---

## How to Use

### From Convex Mutation

```typescript
import { mutation } from "./_generated/server";
import { Effect } from "effect";
import {
  TokenomicsCalculatorService,
  TokenomicsCalculatorServiceDefault,
} from "./services/sui/TokenomicsCalculatorService";

export const calculateDistribution = mutation({
  args: { template: v.string(), supply: v.string() },
  handler: async (ctx, args) => {
    const program = Effect.gen(function* () {
      const service = yield* TokenomicsCalculatorService;
      return yield* service.calculateTokenDistribution(
        args.template as any,
        args.supply
      );
    });

    return await Effect.runPromise(
      program.pipe(Effect.provide(TokenomicsCalculatorServiceDefault))
    );
  },
});
```

### From React Component

```typescript
import { useEffect, useState } from "react";
import { Effect } from "effect";
import {
  TokenomicsCalculatorService,
  TokenomicsCalculatorServiceDefault,
} from "./services/sui/TokenomicsCalculatorService";

function TokenomicsCalculator() {
  const [distribution, setDistribution] = useState(null);

  useEffect(() => {
    const program = Effect.gen(function* () {
      const service = yield* TokenomicsCalculatorService;
      return yield* service.calculateTokenDistribution("standard", "1000000000");
    });

    Effect.runPromise(
      program.pipe(Effect.provide(TokenomicsCalculatorServiceDefault))
    ).then(setDistribution);
  }, []);

  return <div>{/* Render distribution */}</div>;
}
```

### Run Examples

```bash
# From the backend directory
cd /home/user/one.ie/backend/convex/services/sui

# Run examples (requires Effect.ts installed)
npx tsx TokenomicsCalculatorService.example.ts

# Run tests
npx tsx TokenomicsCalculatorService.test.ts
```

---

## Design Highlights

### 1. Pure Calculations

All functions are **pure** - same inputs always produce same outputs. No database, no API calls, no randomness.

**Benefits:**
- Deterministic (predictable)
- Testable (no mocks needed)
- Cacheable (results can be memoized)
- Parallelizable (no side effects)

### 2. Effect.ts Integration

Every function returns `Effect<Success, Error>` for:
- **Composability** - Chain operations with `Effect.gen`
- **Type safety** - Compiler enforces error handling
- **Testability** - Replace layers for testing

### 3. Validated Inputs

Every function validates inputs before calculation:
```typescript
yield* validateTokenAmount("totalSupply", totalSupply);
yield* validatePositive("vestingMonths", vestingMonths);
yield* validatePercentage("rewardRate", rewardRate);
```

Returns typed errors:
```typescript
Effect.fail(new ValidationError("totalSupply", "Must be positive"))
```

### 4. BigInt Math

Uses BigInt for token calculations to avoid JavaScript float precision issues:
```typescript
const supply = parseTokenAmount("1000000000");  // BigInt
const allocation = (supply * BigInt(40)) / BigInt(100);
return formatTokenAmount(allocation);  // "400000000"
```

### 5. Template System

6 pre-built templates cover common tokenomics patterns. Users can:
- Use template as-is
- Customize allocations
- Mix templates (start with one, modify percentages)

### 6. Documentation

Every function has:
- JSDoc comment
- Formula documentation
- Usage example
- Return type specification

---

## Testing

**9 test suites** verify correctness:

```bash
# Run tests
npx tsx TokenomicsCalculatorService.test.ts

# Output:
# ============================================================
# TOKENOMICS CALCULATOR SERVICE - TEST SUITE
# ============================================================
#
# Test 1: Standard Distribution
#   ✓ Standard distribution calculates correctly
# Test 2: Vesting Simulation
#   ✓ Vesting simulation works correctly
# Test 3: Staking APY
#   ✓ Simple APY: 5.00%
#   ✓ Daily compound APY: 5.13%
# ...
# ALL TESTS PASSED ✓
```

---

## Integration Points

### With Convex Mutations

Service can be called from mutations to:
- Calculate distribution for token launch UI
- Simulate vesting for team dashboard
- Calculate APY for staking pool UI
- Project treasury for DAO dashboard

### With Frontend Components

Service can be used in React components to:
- Display tokenomics charts
- Show vesting schedules
- Compare staking options
- Visualize treasury runway

### With Other Services

Service can be composed with:
- **TokenLaunchService** - Use distributions when creating tokens
- **VestingService** - Use simulations for on-chain vesting
- **StakingService** - Use APY calculations for pool config
- **TreasuryService** - Use projections for DAO planning

---

## Next Steps

### Immediate Use

1. Import service in Convex mutations
2. Create frontend components for tokenomics UI
3. Build calculators for users to explore options
4. Display charts using dataPoints arrays

### Future Enhancements

1. **Add more templates** - Liquidity mining, burn mechanisms, etc.
2. **Advanced simulations** - Token price projections, market impact
3. **Monte Carlo** - Probabilistic treasury runway
4. **Optimization** - Find optimal allocation given constraints
5. **Benchmarking** - Compare against other projects

---

## Files Reference

All files located in: `/home/user/one.ie/backend/convex/services/sui/`

- **TokenomicsCalculatorService.ts** - Main service (873 lines)
- **TokenomicsCalculatorService.example.ts** - 8 examples (13KB)
- **TokenomicsCalculatorService.test.ts** - 9 test suites (11KB)
- **README.md** - Quick reference guide

---

**Status:** Ready for use ✓
**Testing:** All tests passing ✓
**Documentation:** Complete ✓
**Examples:** 8 comprehensive examples ✓
