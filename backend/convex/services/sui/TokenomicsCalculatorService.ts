/**
 * Tokenomics Calculator Service
 *
 * Pure calculation service for tokenomics simulations using Effect.ts.
 * No blockchain interaction - all calculations are deterministic and testable.
 *
 * @module TokenomicsCalculatorService
 */

import { Effect, Context } from "effect";

// ============================================================================
// Error Types
// ============================================================================

/**
 * Base error for tokenomics calculation failures
 */
export class TokenomicsCalculationError {
  readonly _tag = "TokenomicsCalculationError";
  constructor(
    readonly message: string,
    readonly details?: unknown
  ) {}
}

/**
 * Validation error for invalid input parameters
 */
export class ValidationError {
  readonly _tag = "ValidationError";
  constructor(
    readonly field: string,
    readonly message: string
  ) {}
}

/**
 * Union of all possible service errors
 */
export type ServiceError = TokenomicsCalculationError | ValidationError;

// ============================================================================
// Template Types
// ============================================================================

/**
 * Supported tokenomics templates
 */
export type TokenomicsTemplate =
  | "standard"
  | "team_vesting"
  | "fair_launch"
  | "dao"
  | "ai_agent"
  | "revenue_share";

/**
 * Allocation category
 */
export interface Allocation {
  category: string;
  percentage: number;
  amount: string;
  vestingMonths?: number;
  cliffMonths?: number;
  description?: string;
}

/**
 * Token distribution breakdown
 */
export interface Distribution {
  template: TokenomicsTemplate;
  totalSupply: string;
  allocations: Allocation[];
  summary: {
    publicAllocation: number;
    teamAllocation: number;
    treasuryAllocation: number;
    otherAllocation: number;
  };
}

// ============================================================================
// Vesting Types
// ============================================================================

/**
 * Vesting schedule parameters
 */
export interface VestingSchedule {
  totalAmount: string;
  cliffMonths: number;
  vestingMonths: number;
  startDate?: number; // Timestamp
}

/**
 * Monthly vesting data point
 */
export interface VestingDataPoint {
  month: number;
  date: number; // Timestamp
  vestedAmount: string;
  cumulativeAmount: string;
  percentageVested: number;
  remainingAmount: string;
}

/**
 * Complete vesting simulation
 */
export interface VestingSimulation {
  schedule: VestingSchedule;
  projectionMonths: number;
  dataPoints: VestingDataPoint[];
  summary: {
    totalAmount: string;
    cliffAmount: string;
    monthlyRelease: string;
    completionDate: number;
  };
}

// ============================================================================
// Staking Types
// ============================================================================

/**
 * Staking pool parameters
 */
export interface StakingPool {
  totalStaked: string;
  rewardRate: number; // Annual rate (0.05 = 5%)
  lockDuration: number; // Days
  compoundingFrequency?: "daily" | "weekly" | "monthly" | "none";
}

// ============================================================================
// Treasury Types
// ============================================================================

/**
 * Treasury parameters
 */
export interface TreasuryParams {
  initialBalance: string;
  monthlyInflow: string;
  monthlyOutflow: string;
}

/**
 * Monthly treasury projection
 */
export interface TreasuryDataPoint {
  month: number;
  balance: string;
  inflow: string;
  outflow: string;
  netChange: string;
  runway: number; // Months remaining
}

/**
 * Complete treasury projection
 */
export interface TreasuryProjection {
  params: TreasuryParams;
  projectionMonths: number;
  dataPoints: TreasuryDataPoint[];
  summary: {
    initialBalance: string;
    finalBalance: string;
    totalInflow: string;
    totalOutflow: string;
    runwayMonths: number;
    breakEvenMonth?: number;
  };
}

// ============================================================================
// Template Configurations
// ============================================================================

/**
 * Get template configuration
 */
function getTemplateConfig(template: TokenomicsTemplate): Allocation[] {
  switch (template) {
    case "standard":
      return [
        {
          category: "Public Sale",
          percentage: 40,
          amount: "0",
          description: "Initial public offering",
        },
        {
          category: "Team",
          percentage: 30,
          amount: "0",
          vestingMonths: 24,
          cliffMonths: 0,
          description: "Team allocation with 2-year vesting",
        },
        {
          category: "Investors",
          percentage: 20,
          amount: "0",
          vestingMonths: 12,
          cliffMonths: 0,
          description: "Early investors with 1-year vesting",
        },
        {
          category: "Treasury",
          percentage: 10,
          amount: "0",
          description: "Protocol treasury for operations",
        },
      ];

    case "team_vesting":
      return [
        {
          category: "Team",
          percentage: 60,
          amount: "0",
          vestingMonths: 48,
          cliffMonths: 12,
          description: "Team allocation with 4-year vesting, 1-year cliff",
        },
        {
          category: "Public Sale",
          percentage: 30,
          amount: "0",
          description: "Public allocation",
        },
        {
          category: "Treasury",
          percentage: 10,
          amount: "0",
          description: "Protocol treasury",
        },
      ];

    case "fair_launch":
      return [
        {
          category: "Public Sale",
          percentage: 100,
          amount: "0",
          description: "100% fair launch - no pre-sale or team allocation",
        },
      ];

    case "dao":
      return [
        {
          category: "Treasury",
          percentage: 50,
          amount: "0",
          description: "DAO-controlled treasury",
        },
        {
          category: "Community Airdrops",
          percentage: 30,
          amount: "0",
          description: "Community rewards and airdrops",
        },
        {
          category: "Founding Team",
          percentage: 20,
          amount: "0",
          vestingMonths: 48,
          cliffMonths: 0,
          description: "Founding team with 4-year vesting",
        },
      ];

    case "ai_agent":
      return [
        {
          category: "Utility Rewards",
          percentage: 70,
          amount: "0",
          description: "Agent task completion rewards",
        },
        {
          category: "Staking Rewards",
          percentage: 20,
          amount: "0",
          description: "Token staking incentives",
        },
        {
          category: "Team",
          percentage: 10,
          amount: "0",
          vestingMonths: 24,
          cliffMonths: 0,
          description: "Development team allocation",
        },
      ];

    case "revenue_share":
      return [
        {
          category: "Token Holders",
          percentage: 40,
          amount: "0",
          description: "Direct revenue distribution to holders",
        },
        {
          category: "Stakers",
          percentage: 30,
          amount: "0",
          description: "Enhanced rewards for stakers",
        },
        {
          category: "Team",
          percentage: 20,
          amount: "0",
          vestingMonths: 24,
          cliffMonths: 0,
          description: "Team allocation with vesting",
        },
        {
          category: "Development Fund",
          percentage: 10,
          amount: "0",
          description: "Ongoing development and improvements",
        },
      ];

    default:
      return [];
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Parse string number to BigInt (handles decimals by scaling)
 */
function parseTokenAmount(amount: string): bigint {
  const [whole, decimals = ""] = amount.split(".");
  const scaled = whole + decimals.padEnd(18, "0");
  return BigInt(scaled.slice(0, whole.length + 18));
}

/**
 * Format BigInt back to string with decimals
 */
function formatTokenAmount(amount: bigint, decimals: number = 18): string {
  const str = amount.toString().padStart(decimals + 1, "0");
  const whole = str.slice(0, -decimals) || "0";
  const frac = str.slice(-decimals);
  return `${whole}.${frac}`.replace(/\.?0+$/, "");
}

/**
 * Validate positive number
 */
function validatePositive(field: string, value: number): Effect.Effect<void, ValidationError> {
  if (value <= 0) {
    return Effect.fail(
      new ValidationError(field, `${field} must be positive, got ${value}`)
    );
  }
  return Effect.void;
}

/**
 * Validate percentage (0-1)
 */
function validatePercentage(field: string, value: number): Effect.Effect<void, ValidationError> {
  if (value < 0 || value > 1) {
    return Effect.fail(
      new ValidationError(field, `${field} must be between 0 and 1, got ${value}`)
    );
  }
  return Effect.void;
}

/**
 * Validate token amount string
 */
function validateTokenAmount(field: string, amount: string): Effect.Effect<void, ValidationError> {
  if (!/^\d+(\.\d+)?$/.test(amount)) {
    return Effect.fail(
      new ValidationError(field, `${field} must be a valid number, got ${amount}`)
    );
  }
  const parsed = parseFloat(amount);
  if (parsed <= 0) {
    return Effect.fail(
      new ValidationError(field, `${field} must be positive, got ${amount}`)
    );
  }
  return Effect.void;
}

// ============================================================================
// Service Definition
// ============================================================================

/**
 * TokenomicsCalculatorService
 *
 * Pure calculation service for tokenomics modeling and simulation.
 * All functions are deterministic and return Effect for composability.
 */
export class TokenomicsCalculatorService extends Context.Tag("TokenomicsCalculatorService")<
  TokenomicsCalculatorService,
  {
    /**
     * Calculate token distribution based on template
     *
     * @param template - Tokenomics template to use
     * @param totalSupply - Total token supply
     * @param customAllocations - Optional custom allocations (overrides template)
     * @returns Effect with distribution breakdown
     *
     * @example
     * ```typescript
     * const distribution = yield* service.calculateTokenDistribution(
     *   "standard",
     *   "1000000000"
     * );
     * // Returns: { template: "standard", totalSupply: "1000000000", allocations: [...] }
     * ```
     */
    calculateTokenDistribution: (
      template: TokenomicsTemplate,
      totalSupply: string,
      customAllocations?: Partial<Record<string, number>>
    ) => Effect.Effect<Distribution, ServiceError>;

    /**
     * Simulate vesting schedule over time
     *
     * @param schedule - Vesting parameters
     * @param projectionMonths - Number of months to project
     * @returns Effect with month-by-month vesting data
     *
     * Formula:
     * - Before cliff: 0 tokens vested
     * - After cliff: Linear vesting over vestingMonths
     * - Monthly release = totalAmount / vestingMonths
     *
     * @example
     * ```typescript
     * const simulation = yield* service.simulateVesting(
     *   {
     *     totalAmount: "1000000",
     *     cliffMonths: 12,
     *     vestingMonths: 48,
     *   },
     *   60
     * );
     * ```
     */
    simulateVesting: (
      schedule: VestingSchedule,
      projectionMonths: number
    ) => Effect.Effect<VestingSimulation, ServiceError>;

    /**
     * Calculate effective APY for staking pool
     *
     * @param pool - Staking pool parameters
     * @returns Effect with APY as decimal (0.05 = 5%)
     *
     * Formula:
     * - Simple APY = rewardRate
     * - Compound APY = (1 + r/n)^n - 1
     *   where r = annual rate, n = compounding periods per year
     *
     * @example
     * ```typescript
     * const apy = yield* service.calculateStakingAPY({
     *   totalStaked: "10000000",
     *   rewardRate: 0.05,
     *   lockDuration: 30,
     *   compoundingFrequency: "daily",
     * });
     * // Returns: 0.05127 (5.127% with daily compounding)
     * ```
     */
    calculateStakingAPY: (pool: StakingPool) => Effect.Effect<number, ServiceError>;

    /**
     * Project treasury growth and runway
     *
     * @param params - Treasury parameters
     * @param projectionMonths - Months to project
     * @returns Effect with treasury projections
     *
     * Formula:
     * - Balance[n] = Balance[n-1] + Inflow - Outflow
     * - Runway = Balance / MonthlyOutflow (if outflow > inflow)
     *
     * @example
     * ```typescript
     * const projection = yield* service.projectTreasuryGrowth(
     *   {
     *     initialBalance: "5000000",
     *     monthlyInflow: "100000",
     *     monthlyOutflow: "150000",
     *   },
     *   36
     * );
     * ```
     */
    projectTreasuryGrowth: (
      params: TreasuryParams,
      projectionMonths: number
    ) => Effect.Effect<TreasuryProjection, ServiceError>;

    /**
     * Calculate market capitalization
     *
     * @param totalSupply - Circulating supply
     * @param pricePerToken - Current price per token
     * @returns Effect with market cap
     *
     * Formula: MarketCap = CirculatingSupply × Price
     *
     * @example
     * ```typescript
     * const marketCap = yield* service.calculateMarketCap("1000000", "1.50");
     * // Returns: "1500000"
     * ```
     */
    calculateMarketCap: (
      totalSupply: string,
      pricePerToken: string
    ) => Effect.Effect<string, ServiceError>;

    /**
     * Calculate fully diluted valuation
     *
     * @param maxSupply - Maximum possible supply
     * @param pricePerToken - Current price per token
     * @returns Effect with FDV
     *
     * Formula: FDV = MaxSupply × Price
     *
     * @example
     * ```typescript
     * const fdv = yield* service.calculateFullyDilutedValuation("10000000", "1.50");
     * // Returns: "15000000"
     * ```
     */
    calculateFullyDilutedValuation: (
      maxSupply: string,
      pricePerToken: string
    ) => Effect.Effect<string, ServiceError>;
  }
>() {}

// ============================================================================
// Service Implementation
// ============================================================================

/**
 * Live implementation of TokenomicsCalculatorService
 */
export const TokenomicsCalculatorServiceLive = TokenomicsCalculatorService.of({
  calculateTokenDistribution: (template, totalSupply, customAllocations) =>
    Effect.gen(function* () {
      // Validate inputs
      yield* validateTokenAmount("totalSupply", totalSupply);

      // Get template config
      const templateAllocations = getTemplateConfig(template);

      if (templateAllocations.length === 0) {
        return yield* Effect.fail(
          new ValidationError("template", `Unknown template: ${template}`)
        );
      }

      // Parse total supply
      const supply = parseTokenAmount(totalSupply);

      // Apply custom allocations if provided
      let allocations = templateAllocations;
      if (customAllocations) {
        allocations = templateAllocations.map((alloc) => {
          const customPercentage = customAllocations[alloc.category];
          if (customPercentage !== undefined) {
            return { ...alloc, percentage: customPercentage };
          }
          return alloc;
        });

        // Validate total equals 100%
        const total = allocations.reduce((sum, a) => sum + a.percentage, 0);
        if (Math.abs(total - 100) > 0.01) {
          return yield* Effect.fail(
            new ValidationError(
              "allocations",
              `Allocations must sum to 100%, got ${total}%`
            )
          );
        }
      }

      // Calculate amounts
      const allocationsWithAmounts = allocations.map((alloc) => {
        const amount = (supply * BigInt(Math.floor(alloc.percentage * 100))) / BigInt(10000);
        return {
          ...alloc,
          amount: formatTokenAmount(amount),
        };
      });

      // Calculate summary
      const summary = {
        publicAllocation: allocationsWithAmounts
          .filter((a) => a.category.toLowerCase().includes("public"))
          .reduce((sum, a) => sum + a.percentage, 0),
        teamAllocation: allocationsWithAmounts
          .filter((a) => a.category.toLowerCase().includes("team"))
          .reduce((sum, a) => sum + a.percentage, 0),
        treasuryAllocation: allocationsWithAmounts
          .filter((a) => a.category.toLowerCase().includes("treasury"))
          .reduce((sum, a) => sum + a.percentage, 0),
        otherAllocation: 0,
      };
      summary.otherAllocation =
        100 - summary.publicAllocation - summary.teamAllocation - summary.treasuryAllocation;

      return {
        template,
        totalSupply,
        allocations: allocationsWithAmounts,
        summary,
      };
    }),

  simulateVesting: (schedule, projectionMonths) =>
    Effect.gen(function* () {
      // Validate inputs
      yield* validateTokenAmount("totalAmount", schedule.totalAmount);
      yield* validatePositive("cliffMonths", schedule.cliffMonths);
      yield* validatePositive("vestingMonths", schedule.vestingMonths);
      yield* validatePositive("projectionMonths", projectionMonths);

      const totalAmount = parseTokenAmount(schedule.totalAmount);
      const startDate = schedule.startDate || Date.now();

      // Calculate monthly release after cliff
      const monthlyRelease = totalAmount / BigInt(schedule.vestingMonths);

      // Generate data points
      const dataPoints: VestingDataPoint[] = [];

      for (let month = 0; month <= projectionMonths; month++) {
        const date = startDate + month * 30 * 24 * 60 * 60 * 1000; // Approximate month

        let vestedAmount = BigInt(0);
        let cumulativeAmount = BigInt(0);

        if (month < schedule.cliffMonths) {
          // Before cliff: nothing vested
          vestedAmount = BigInt(0);
          cumulativeAmount = BigInt(0);
        } else if (month >= schedule.cliffMonths + schedule.vestingMonths) {
          // After vesting complete: all tokens vested
          vestedAmount = BigInt(0);
          cumulativeAmount = totalAmount;
        } else {
          // During vesting: linear release
          const monthsSinceCliff = month - schedule.cliffMonths;
          vestedAmount = monthlyRelease;
          cumulativeAmount = monthlyRelease * BigInt(monthsSinceCliff + 1);
        }

        const percentageVested = Number((cumulativeAmount * BigInt(10000)) / totalAmount) / 100;
        const remainingAmount = totalAmount - cumulativeAmount;

        dataPoints.push({
          month,
          date,
          vestedAmount: formatTokenAmount(vestedAmount),
          cumulativeAmount: formatTokenAmount(cumulativeAmount),
          percentageVested,
          remainingAmount: formatTokenAmount(remainingAmount),
        });
      }

      // Calculate completion date
      const completionDate =
        startDate + (schedule.cliffMonths + schedule.vestingMonths) * 30 * 24 * 60 * 60 * 1000;

      // Cliff amount (first release after cliff)
      const cliffAmount = monthlyRelease;

      return {
        schedule,
        projectionMonths,
        dataPoints,
        summary: {
          totalAmount: schedule.totalAmount,
          cliffAmount: formatTokenAmount(cliffAmount),
          monthlyRelease: formatTokenAmount(monthlyRelease),
          completionDate,
        },
      };
    }),

  calculateStakingAPY: (pool) =>
    Effect.gen(function* () {
      // Validate inputs
      yield* validateTokenAmount("totalStaked", pool.totalStaked);
      yield* validatePercentage("rewardRate", pool.rewardRate);
      yield* validatePositive("lockDuration", pool.lockDuration);

      const annualRate = pool.rewardRate;

      // Calculate APY based on compounding frequency
      switch (pool.compoundingFrequency) {
        case "daily": {
          // APY = (1 + r/365)^365 - 1
          const dailyRate = annualRate / 365;
          const apy = Math.pow(1 + dailyRate, 365) - 1;
          return apy;
        }

        case "weekly": {
          // APY = (1 + r/52)^52 - 1
          const weeklyRate = annualRate / 52;
          const apy = Math.pow(1 + weeklyRate, 52) - 1;
          return apy;
        }

        case "monthly": {
          // APY = (1 + r/12)^12 - 1
          const monthlyRate = annualRate / 12;
          const apy = Math.pow(1 + monthlyRate, 12) - 1;
          return apy;
        }

        case "none":
        default: {
          // Simple APY (no compounding)
          return annualRate;
        }
      }
    }),

  projectTreasuryGrowth: (params, projectionMonths) =>
    Effect.gen(function* () {
      // Validate inputs
      yield* validateTokenAmount("initialBalance", params.initialBalance);
      yield* validateTokenAmount("monthlyInflow", params.monthlyInflow);
      yield* validateTokenAmount("monthlyOutflow", params.monthlyOutflow);
      yield* validatePositive("projectionMonths", projectionMonths);

      const initialBalance = parseTokenAmount(params.initialBalance);
      const monthlyInflow = parseTokenAmount(params.monthlyInflow);
      const monthlyOutflow = parseTokenAmount(params.monthlyOutflow);

      // Generate projections
      const dataPoints: TreasuryDataPoint[] = [];
      let currentBalance = initialBalance;
      let totalInflow = BigInt(0);
      let totalOutflow = BigInt(0);
      let breakEvenMonth: number | undefined;

      for (let month = 0; month <= projectionMonths; month++) {
        // Calculate net change
        const netChange = monthlyInflow - monthlyOutflow;

        // Calculate runway (months until balance reaches zero)
        let runway = 0;
        if (monthlyOutflow > monthlyInflow && currentBalance > BigInt(0)) {
          const netBurn = monthlyOutflow - monthlyInflow;
          runway = Number(currentBalance / netBurn);
        } else if (monthlyInflow >= monthlyOutflow) {
          runway = Infinity;
        }

        dataPoints.push({
          month,
          balance: formatTokenAmount(currentBalance),
          inflow: formatTokenAmount(monthlyInflow),
          outflow: formatTokenAmount(monthlyOutflow),
          netChange: formatTokenAmount(netChange),
          runway,
        });

        // Check for break-even (first month where balance increases)
        if (breakEvenMonth === undefined && netChange > BigInt(0)) {
          breakEvenMonth = month;
        }

        // Update balance for next month
        currentBalance = currentBalance + netChange;
        if (currentBalance < BigInt(0)) {
          currentBalance = BigInt(0); // Can't go negative
        }

        totalInflow = totalInflow + monthlyInflow;
        totalOutflow = totalOutflow + monthlyOutflow;
      }

      // Calculate runway from initial state
      const runwayMonths =
        monthlyOutflow > monthlyInflow
          ? Number(initialBalance / (monthlyOutflow - monthlyInflow))
          : Infinity;

      return {
        params,
        projectionMonths,
        dataPoints,
        summary: {
          initialBalance: params.initialBalance,
          finalBalance: formatTokenAmount(currentBalance),
          totalInflow: formatTokenAmount(totalInflow),
          totalOutflow: formatTokenAmount(totalOutflow),
          runwayMonths: Math.min(runwayMonths, projectionMonths),
          breakEvenMonth,
        },
      };
    }),

  calculateMarketCap: (totalSupply, pricePerToken) =>
    Effect.gen(function* () {
      // Validate inputs
      yield* validateTokenAmount("totalSupply", totalSupply);
      yield* validateTokenAmount("pricePerToken", pricePerToken);

      const supply = parseTokenAmount(totalSupply);
      const price = parseTokenAmount(pricePerToken);

      // MarketCap = Supply × Price
      const marketCap = (supply * price) / BigInt(10 ** 18); // Adjust for decimals

      return formatTokenAmount(marketCap);
    }),

  calculateFullyDilutedValuation: (maxSupply, pricePerToken) =>
    Effect.gen(function* () {
      // Validate inputs
      yield* validateTokenAmount("maxSupply", maxSupply);
      yield* validateTokenAmount("pricePerToken", pricePerToken);

      const supply = parseTokenAmount(maxSupply);
      const price = parseTokenAmount(pricePerToken);

      // FDV = MaxSupply × Price
      const fdv = (supply * price) / BigInt(10 ** 18); // Adjust for decimals

      return formatTokenAmount(fdv);
    }),
});

// ============================================================================
// Default Export
// ============================================================================

/**
 * Default layer for the TokenomicsCalculatorService
 */
export const TokenomicsCalculatorServiceDefault = TokenomicsCalculatorService.toLayer(
  TokenomicsCalculatorServiceLive
);
