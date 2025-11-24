/**
 * TokenomicsCalculatorService Tests
 *
 * Simple tests to verify the service works correctly.
 */

import { Effect } from "effect";
import {
  TokenomicsCalculatorService,
  TokenomicsCalculatorServiceLive,
  TokenomicsCalculatorServiceDefault,
} from "./TokenomicsCalculatorService";

// ============================================================================
// Test Utilities
// ============================================================================

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function assertApproxEqual(
  actual: number,
  expected: number,
  tolerance: number = 0.01,
  message?: string
): void {
  const diff = Math.abs(actual - expected);
  if (diff > tolerance) {
    throw new Error(
      `Assertion failed: ${message || "Values not approximately equal"}. Expected ${expected}, got ${actual} (diff: ${diff})`
    );
  }
}

// ============================================================================
// Tests
// ============================================================================

/**
 * Test 1: Calculate standard distribution
 */
const testStandardDistribution = Effect.gen(function* () {
  console.log("Test 1: Standard Distribution");

  const distribution = yield* TokenomicsCalculatorServiceLive.calculateTokenDistribution(
    "standard",
    "1000000000"
  );

  // Verify allocations exist
  assert(distribution.allocations.length === 4, "Should have 4 allocations");

  // Verify percentages sum to 100
  const total = distribution.allocations.reduce((sum, a) => sum + a.percentage, 0);
  assertApproxEqual(total, 100, 0.1, "Percentages should sum to 100");

  // Verify summary
  assert(distribution.summary.publicAllocation === 40, "Public should be 40%");
  assert(distribution.summary.teamAllocation === 30, "Team should be 30%");
  assert(distribution.summary.treasuryAllocation === 10, "Treasury should be 10%");

  console.log("  ✓ Standard distribution calculates correctly");
  return distribution;
});

/**
 * Test 2: Simulate vesting
 */
const testVestingSimulation = Effect.gen(function* () {
  console.log("Test 2: Vesting Simulation");

  const simulation = yield* TokenomicsCalculatorServiceLive.simulateVesting(
    {
      totalAmount: "1000000",
      cliffMonths: 12,
      vestingMonths: 48,
    },
    60
  );

  // Verify data points exist
  assert(simulation.dataPoints.length === 61, "Should have 61 data points (0-60 months)");

  // Verify cliff behavior (month 0-11 should have 0 vested)
  const beforeCliff = simulation.dataPoints[11];
  assert(beforeCliff.cumulativeAmount === "0", "Nothing vested before cliff");
  assert(beforeCliff.percentageVested === 0, "0% vested before cliff");

  // Verify after cliff (month 12 should have first release)
  const afterCliff = simulation.dataPoints[12];
  assert(parseFloat(afterCliff.cumulativeAmount) > 0, "Tokens vested after cliff");

  // Verify completion (month 60 should have 100%)
  const atCompletion = simulation.dataPoints[60];
  assertApproxEqual(
    parseFloat(atCompletion.cumulativeAmount),
    1000000,
    1,
    "All tokens vested at completion"
  );
  assertApproxEqual(atCompletion.percentageVested, 100, 0.1, "100% vested at completion");

  console.log("  ✓ Vesting simulation works correctly");
  return simulation;
});

/**
 * Test 3: Calculate staking APY
 */
const testStakingAPY = Effect.gen(function* () {
  console.log("Test 3: Staking APY");

  // Simple APY (no compounding)
  const simpleAPY = yield* TokenomicsCalculatorServiceLive.calculateStakingAPY({
    totalStaked: "10000000",
    rewardRate: 0.05,
    lockDuration: 30,
    compoundingFrequency: "none",
  });

  assert(simpleAPY === 0.05, "Simple APY should equal reward rate");

  // Daily compounding APY
  const dailyAPY = yield* TokenomicsCalculatorServiceLive.calculateStakingAPY({
    totalStaked: "10000000",
    rewardRate: 0.05,
    lockDuration: 30,
    compoundingFrequency: "daily",
  });

  // Daily compounding should be slightly higher than simple
  assert(dailyAPY > simpleAPY, "Daily compound APY > simple APY");
  assertApproxEqual(dailyAPY, 0.05127, 0.0001, "Daily compound APY ~5.127%");

  console.log(`  ✓ Simple APY: ${(simpleAPY * 100).toFixed(2)}%`);
  console.log(`  ✓ Daily compound APY: ${(dailyAPY * 100).toFixed(2)}%`);
  return { simpleAPY, dailyAPY };
});

/**
 * Test 4: Project treasury growth
 */
const testTreasuryProjection = Effect.gen(function* () {
  console.log("Test 4: Treasury Projection");

  // Declining treasury (burn > revenue)
  const declining = yield* TokenomicsCalculatorServiceLive.projectTreasuryGrowth(
    {
      initialBalance: "5000000",
      monthlyInflow: "100000",
      monthlyOutflow: "150000",
    },
    36
  );

  // Verify runway calculation
  const expectedRunway = 5000000 / (150000 - 100000); // 100 months
  assertApproxEqual(
    declining.summary.runwayMonths,
    expectedRunway,
    1,
    "Runway should be ~100 months"
  );

  // Growing treasury (revenue > burn)
  const growing = yield* TokenomicsCalculatorServiceLive.projectTreasuryGrowth(
    {
      initialBalance: "1000000",
      monthlyInflow: "200000",
      monthlyOutflow: "150000",
    },
    36
  );

  // Final balance should be higher than initial
  const finalBalance = parseFloat(growing.summary.finalBalance);
  const initialBalance = parseFloat(growing.summary.initialBalance);
  assert(finalBalance > initialBalance, "Growing treasury should increase");

  // Calculate expected growth: initial + 36 * (inflow - outflow)
  const expectedGrowth = 1000000 + 36 * (200000 - 150000);
  assertApproxEqual(finalBalance, expectedGrowth, 1, "Final balance calculation");

  console.log(`  ✓ Declining runway: ${declining.summary.runwayMonths.toFixed(1)} months`);
  console.log(`  ✓ Growing treasury: $${initialBalance} → $${finalBalance}`);
  return { declining, growing };
});

/**
 * Test 5: Calculate market cap
 */
const testMarketCap = Effect.gen(function* () {
  console.log("Test 5: Market Cap");

  const marketCap = yield* TokenomicsCalculatorServiceLive.calculateMarketCap(
    "400000000", // 400M tokens
    "1.50" // $1.50 per token
  );

  // Expected: 400M × 1.50 = 600M
  const expected = 400000000 * 1.5;
  assertApproxEqual(parseFloat(marketCap), expected, 1, "Market cap calculation");

  console.log(`  ✓ Market cap: $${marketCap}`);
  return marketCap;
});

/**
 * Test 6: Calculate FDV
 */
const testFDV = Effect.gen(function* () {
  console.log("Test 6: Fully Diluted Valuation");

  const fdv = yield* TokenomicsCalculatorServiceLive.calculateFullyDilutedValuation(
    "1000000000", // 1B max supply
    "1.50" // $1.50 per token
  );

  // Expected: 1B × 1.50 = 1.5B
  const expected = 1000000000 * 1.5;
  assertApproxEqual(parseFloat(fdv), expected, 1, "FDV calculation");

  console.log(`  ✓ FDV: $${fdv}`);
  return fdv;
});

/**
 * Test 7: Custom allocations
 */
const testCustomAllocations = Effect.gen(function* () {
  console.log("Test 7: Custom Allocations");

  const distribution = yield* TokenomicsCalculatorServiceLive.calculateTokenDistribution(
    "standard",
    "1000000000",
    {
      "Public Sale": 50,
      Team: 25,
      Investors: 15,
      Treasury: 10,
    }
  );

  // Verify custom allocations applied
  const publicAlloc = distribution.allocations.find((a) => a.category === "Public Sale");
  assert(publicAlloc?.percentage === 50, "Public should be 50%");

  const teamAlloc = distribution.allocations.find((a) => a.category === "Team");
  assert(teamAlloc?.percentage === 25, "Team should be 25%");

  console.log("  ✓ Custom allocations applied correctly");
  return distribution;
});

/**
 * Test 8: All templates
 */
const testAllTemplates = Effect.gen(function* () {
  console.log("Test 8: All Templates");

  const templates: Array<{
    name: string;
    template: any;
    expectedCount: number;
  }> = [
    { name: "Standard", template: "standard", expectedCount: 4 },
    { name: "Team Vesting", template: "team_vesting", expectedCount: 3 },
    { name: "Fair Launch", template: "fair_launch", expectedCount: 1 },
    { name: "DAO", template: "dao", expectedCount: 3 },
    { name: "AI Agent", template: "ai_agent", expectedCount: 3 },
    { name: "Revenue Share", template: "revenue_share", expectedCount: 4 },
  ];

  for (const { name, template, expectedCount } of templates) {
    const distribution = yield* TokenomicsCalculatorServiceLive.calculateTokenDistribution(
      template,
      "1000000000"
    );

    assert(
      distribution.allocations.length === expectedCount,
      `${name} should have ${expectedCount} allocations`
    );

    // Verify total is 100%
    const total = distribution.allocations.reduce((sum, a) => sum + a.percentage, 0);
    assertApproxEqual(total, 100, 0.1, `${name} should total 100%`);

    console.log(`  ✓ ${name} template (${expectedCount} allocations)`);
  }

  return templates;
});

/**
 * Test 9: Error handling
 */
const testErrorHandling = Effect.gen(function* () {
  console.log("Test 9: Error Handling");

  // Test invalid token amount
  const invalidAmount = TokenomicsCalculatorServiceLive.calculateTokenDistribution(
    "standard",
    "invalid"
  ).pipe(
    Effect.catchTag("ValidationError", (error) => {
      console.log(`  ✓ Caught ValidationError: ${error.message}`);
      return Effect.succeed("error_caught");
    })
  );

  yield* invalidAmount;

  // Test negative vesting months
  const negativeVesting = TokenomicsCalculatorServiceLive.simulateVesting(
    {
      totalAmount: "1000000",
      cliffMonths: -1,
      vestingMonths: 48,
    },
    60
  ).pipe(
    Effect.catchTag("ValidationError", (error) => {
      console.log(`  ✓ Caught negative vesting: ${error.message}`);
      return Effect.succeed("error_caught");
    })
  );

  yield* negativeVesting;

  return "error_handling_complete";
});

// ============================================================================
// Run All Tests
// ============================================================================

/**
 * Run all tests
 */
export const runAllTests = Effect.gen(function* () {
  console.log("\n" + "=".repeat(60));
  console.log("TOKENOMICS CALCULATOR SERVICE - TEST SUITE");
  console.log("=".repeat(60) + "\n");

  yield* testStandardDistribution;
  yield* testVestingSimulation;
  yield* testStakingAPY;
  yield* testTreasuryProjection;
  yield* testMarketCap;
  yield* testFDV;
  yield* testCustomAllocations;
  yield* testAllTemplates;
  yield* testErrorHandling;

  console.log("\n" + "=".repeat(60));
  console.log("ALL TESTS PASSED ✓");
  console.log("=".repeat(60) + "\n");
});

// ============================================================================
// Execute Tests
// ============================================================================

/**
 * Run tests if executed directly
 */
if (require.main === module) {
  Effect.runPromise(runAllTests).catch((error) => {
    console.error("\n❌ TEST FAILED:");
    console.error(error);
    process.exit(1);
  });
}
