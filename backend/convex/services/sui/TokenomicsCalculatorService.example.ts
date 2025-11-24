/**
 * TokenomicsCalculatorService Examples
 *
 * Demonstrates how to use the tokenomics calculator service for various scenarios.
 */

import { Effect } from "effect";
import {
  TokenomicsCalculatorService,
  TokenomicsCalculatorServiceDefault,
} from "./TokenomicsCalculatorService";

// ============================================================================
// Example 1: Calculate Standard Token Distribution
// ============================================================================

export const exampleStandardDistribution = Effect.gen(function* () {
  const service = yield* TokenomicsCalculatorService;

  const distribution = yield* service.calculateTokenDistribution(
    "standard",
    "1000000000" // 1 billion tokens
  );

  console.log("Standard Distribution:");
  console.log(`Total Supply: ${distribution.totalSupply}`);
  console.log(`\nAllocations:`);
  distribution.allocations.forEach((alloc) => {
    console.log(
      `  ${alloc.category}: ${alloc.percentage}% (${alloc.amount} tokens)`
    );
    if (alloc.vestingMonths) {
      console.log(`    Vesting: ${alloc.vestingMonths} months`);
    }
  });
  console.log(`\nSummary:`);
  console.log(`  Public: ${distribution.summary.publicAllocation}%`);
  console.log(`  Team: ${distribution.summary.teamAllocation}%`);
  console.log(`  Treasury: ${distribution.summary.treasuryAllocation}%`);

  return distribution;
});

// ============================================================================
// Example 2: Custom Token Distribution
// ============================================================================

export const exampleCustomDistribution = Effect.gen(function* () {
  const service = yield* TokenomicsCalculatorService;

  // Start with standard template but customize allocations
  const distribution = yield* service.calculateTokenDistribution(
    "standard",
    "1000000000",
    {
      "Public Sale": 50, // Increase public allocation
      Team: 25, // Reduce team allocation
      Investors: 15, // Reduce investor allocation
      Treasury: 10, // Keep treasury the same
    }
  );

  console.log("Custom Distribution:");
  distribution.allocations.forEach((alloc) => {
    console.log(`${alloc.category}: ${alloc.percentage}% (${alloc.amount})`);
  });

  return distribution;
});

// ============================================================================
// Example 3: Simulate Team Vesting
// ============================================================================

export const exampleTeamVesting = Effect.gen(function* () {
  const service = yield* TokenomicsCalculatorService;

  const simulation = yield* service.simulateVesting(
    {
      totalAmount: "30000000", // 30M tokens for team
      cliffMonths: 12, // 1-year cliff
      vestingMonths: 48, // 4-year vesting
      startDate: Date.now(),
    },
    60 // Project 5 years
  );

  console.log("Team Vesting Schedule:");
  console.log(`Total Amount: ${simulation.summary.totalAmount}`);
  console.log(`Cliff Amount: ${simulation.summary.cliffAmount}`);
  console.log(`Monthly Release: ${simulation.summary.monthlyRelease}`);
  console.log(
    `Completion: ${new Date(simulation.summary.completionDate).toLocaleDateString()}`
  );

  console.log(`\nFirst 24 Months:`);
  simulation.dataPoints.slice(0, 25).forEach((point) => {
    console.log(
      `Month ${point.month}: ${point.cumulativeAmount} (${point.percentageVested.toFixed(1)}%)`
    );
  });

  return simulation;
});

// ============================================================================
// Example 4: Calculate Staking APY
// ============================================================================

export const exampleStakingAPY = Effect.gen(function* () {
  const service = yield* TokenomicsCalculatorService;

  // Simple APY (no compounding)
  const simpleAPY = yield* service.calculateStakingAPY({
    totalStaked: "10000000",
    rewardRate: 0.05, // 5% base rate
    lockDuration: 30, // 30 days
    compoundingFrequency: "none",
  });

  // Daily compounding
  const dailyAPY = yield* service.calculateStakingAPY({
    totalStaked: "10000000",
    rewardRate: 0.05,
    lockDuration: 30,
    compoundingFrequency: "daily",
  });

  // Monthly compounding
  const monthlyAPY = yield* service.calculateStakingAPY({
    totalStaked: "10000000",
    rewardRate: 0.05,
    lockDuration: 30,
    compoundingFrequency: "monthly",
  });

  console.log("Staking APY Comparison:");
  console.log(`Simple (no compounding): ${(simpleAPY * 100).toFixed(2)}%`);
  console.log(`Daily compounding: ${(dailyAPY * 100).toFixed(2)}%`);
  console.log(`Monthly compounding: ${(monthlyAPY * 100).toFixed(2)}%`);
  console.log(
    `Bonus from daily compounding: ${((dailyAPY - simpleAPY) * 100).toFixed(2)}%`
  );

  return { simpleAPY, dailyAPY, monthlyAPY };
});

// ============================================================================
// Example 5: Project Treasury Growth
// ============================================================================

export const exampleTreasuryProjection = Effect.gen(function* () {
  const service = yield* TokenomicsCalculatorService;

  // Scenario: Treasury with declining balance
  const decliningTreasury = yield* service.projectTreasuryGrowth(
    {
      initialBalance: "5000000", // $5M initial
      monthlyInflow: "100000", // $100K monthly revenue
      monthlyOutflow: "150000", // $150K monthly burn
    },
    36 // 3-year projection
  );

  console.log("Declining Treasury Scenario:");
  console.log(`Initial Balance: $${decliningTreasury.summary.initialBalance}`);
  console.log(`Runway: ${decliningTreasury.summary.runwayMonths.toFixed(1)} months`);

  // Scenario: Treasury with growth
  const growingTreasury = yield* service.projectTreasuryGrowth(
    {
      initialBalance: "1000000", // $1M initial
      monthlyInflow: "200000", // $200K monthly revenue
      monthlyOutflow: "150000", // $150K monthly burn
    },
    36
  );

  console.log("\nGrowing Treasury Scenario:");
  console.log(`Initial Balance: $${growingTreasury.summary.initialBalance}`);
  console.log(`Final Balance: $${growingTreasury.summary.finalBalance}`);
  console.log(`Total Inflow: $${growingTreasury.summary.totalInflow}`);
  console.log(`Total Outflow: $${growingTreasury.summary.totalOutflow}`);

  return { decliningTreasury, growingTreasury };
});

// ============================================================================
// Example 6: Calculate Market Metrics
// ============================================================================

export const exampleMarketMetrics = Effect.gen(function* () {
  const service = yield* TokenomicsCalculatorService;

  const circulatingSupply = "400000000"; // 400M tokens (40% of 1B)
  const maxSupply = "1000000000"; // 1B max supply
  const price = "1.50"; // $1.50 per token

  const marketCap = yield* service.calculateMarketCap(circulatingSupply, price);
  const fdv = yield* service.calculateFullyDilutedValuation(maxSupply, price);

  console.log("Market Metrics:");
  console.log(`Price: $${price}`);
  console.log(`Circulating Supply: ${circulatingSupply}`);
  console.log(`Max Supply: ${maxSupply}`);
  console.log(`Market Cap: $${marketCap}`);
  console.log(`Fully Diluted Valuation: $${fdv}`);
  console.log(
    `Circulating %: ${((parseFloat(circulatingSupply) / parseFloat(maxSupply)) * 100).toFixed(1)}%`
  );

  return { marketCap, fdv };
});

// ============================================================================
// Example 7: Complete Tokenomics Analysis
// ============================================================================

export const exampleCompleteAnalysis = Effect.gen(function* () {
  const service = yield* TokenomicsCalculatorService;

  console.log("=== COMPLETE TOKENOMICS ANALYSIS ===\n");

  // 1. Distribution
  console.log("1. TOKEN DISTRIBUTION (DAO Launch)");
  const distribution = yield* service.calculateTokenDistribution("dao", "1000000000");
  distribution.allocations.forEach((alloc) => {
    console.log(`   ${alloc.category}: ${alloc.percentage}% (${alloc.amount})`);
  });

  // 2. Team Vesting
  console.log("\n2. FOUNDING TEAM VESTING");
  const teamAllocation = distribution.allocations.find((a) =>
    a.category.includes("Founding")
  );
  const vestingSimulation = yield* service.simulateVesting(
    {
      totalAmount: teamAllocation!.amount,
      cliffMonths: 0,
      vestingMonths: 48,
    },
    48
  );
  console.log(`   Total: ${vestingSimulation.summary.totalAmount}`);
  console.log(`   Monthly Release: ${vestingSimulation.summary.monthlyRelease}`);

  // 3. Staking Rewards
  console.log("\n3. STAKING REWARDS");
  const stakingAPY = yield* service.calculateStakingAPY({
    totalStaked: "100000000", // 10% of supply staked
    rewardRate: 0.08, // 8% base rate
    lockDuration: 90, // 90-day lock
    compoundingFrequency: "daily",
  });
  console.log(`   Base Rate: 8%`);
  console.log(`   Effective APY: ${(stakingAPY * 100).toFixed(2)}%`);

  // 4. Treasury Projection
  console.log("\n4. TREASURY PROJECTION");
  const treasuryProjection = yield* service.projectTreasuryGrowth(
    {
      initialBalance: "500000000", // 50% of supply in treasury
      monthlyInflow: "1000000", // $1M monthly protocol revenue
      monthlyOutflow: "500000", // $500K monthly expenses
    },
    36
  );
  console.log(`   Initial: $${treasuryProjection.summary.initialBalance}`);
  console.log(`   Final (3yr): $${treasuryProjection.summary.finalBalance}`);
  console.log(`   Net Gain: $${parseFloat(treasuryProjection.summary.finalBalance) - parseFloat(treasuryProjection.summary.initialBalance)}`);

  // 5. Market Metrics
  console.log("\n5. MARKET METRICS (at $2.00/token)");
  const circulatingSupply = "300000000"; // 30% circulating (public + airdrops)
  const marketCap = yield* service.calculateMarketCap(circulatingSupply, "2.00");
  const fdv = yield* service.calculateFullyDilutedValuation("1000000000", "2.00");
  console.log(`   Market Cap: $${marketCap}`);
  console.log(`   FDV: $${fdv}`);
  console.log(`   Circulating: 30%`);

  return {
    distribution,
    vestingSimulation,
    stakingAPY,
    treasuryProjection,
    marketCap,
    fdv,
  };
});

// ============================================================================
// Example 8: AI Agent Tokenomics
// ============================================================================

export const exampleAIAgentTokenomics = Effect.gen(function* () {
  const service = yield* TokenomicsCalculatorService;

  console.log("=== AI AGENT TOKENOMICS ===\n");

  // Distribution
  const distribution = yield* service.calculateTokenDistribution(
    "ai_agent",
    "10000000000" // 10B tokens for utility
  );

  console.log("Distribution:");
  distribution.allocations.forEach((alloc) => {
    console.log(`  ${alloc.category}: ${alloc.percentage}% (${alloc.amount})`);
  });

  // Staking for agents
  const agentStakingAPY = yield* service.calculateStakingAPY({
    totalStaked: "2000000000", // 20% staked
    rewardRate: 0.15, // 15% for agent operators
    lockDuration: 60,
    compoundingFrequency: "daily",
  });

  console.log(`\nAgent Operator Staking APY: ${(agentStakingAPY * 100).toFixed(2)}%`);

  return { distribution, agentStakingAPY };
});

// ============================================================================
// Run Examples
// ============================================================================

/**
 * Run all examples
 */
export const runAllExamples = Effect.gen(function* () {
  console.log("Running all tokenomics examples...\n");

  yield* exampleStandardDistribution;
  console.log("\n" + "=".repeat(80) + "\n");

  yield* exampleCustomDistribution;
  console.log("\n" + "=".repeat(80) + "\n");

  yield* exampleTeamVesting;
  console.log("\n" + "=".repeat(80) + "\n");

  yield* exampleStakingAPY;
  console.log("\n" + "=".repeat(80) + "\n");

  yield* exampleTreasuryProjection;
  console.log("\n" + "=".repeat(80) + "\n");

  yield* exampleMarketMetrics;
  console.log("\n" + "=".repeat(80) + "\n");

  yield* exampleCompleteAnalysis;
  console.log("\n" + "=".repeat(80) + "\n");

  yield* exampleAIAgentTokenomics;
});

/**
 * Execute examples (for testing)
 */
if (require.main === module) {
  Effect.runPromise(
    runAllExamples.pipe(Effect.provide(TokenomicsCalculatorServiceDefault))
  ).catch(console.error);
}
