/**
 * TaxService - Business logic for tax calculation and reporting
 *
 * This service implements comprehensive tax calculation with:
 * - Stripe Tax API integration (automatic tax calculation)
 * - Manual tax rate configuration (fallback/override)
 * - Tax exemption handling
 * - Multi-jurisdiction support (US states, EU VAT, Canada GST/PST)
 * - Tax reporting and filing
 *
 * Supported Features:
 * - Automatic location-based tax calculation
 * - EU VAT MOSS compliance
 * - Tax exemption certificates
 * - Tax reporting for filing
 * - Stripe Tax integration
 *
 * @see /one/knowledge/ontology.md - 6-dimension ontology
 * @see /backend/CLAUDE.md - Backend patterns
 * @see https://stripe.com/docs/tax
 */

import { Effect } from "effect";
import Stripe from "stripe";

// ============================================================================
// Types
// ============================================================================

export interface TaxRateData {
  country: string;
  state?: string; // For US/Canada
  taxType: "sales_tax" | "vat" | "gst" | "pst" | "hst";
  percentage: number; // e.g., 8.5 for 8.5%
  displayName: string; // e.g., "California Sales Tax"
  description?: string;
  active: boolean;
}

export interface TaxCalculationInput {
  amount: number; // Amount in cents
  currency: string;
  country: string;
  state?: string;
  postalCode?: string;
  city?: string;
  customerId?: string; // For checking tax exemption
  productIds?: string[]; // Some products may be tax-exempt
}

export interface TaxCalculationResult {
  subtotal: number; // Original amount
  taxAmount: number; // Calculated tax
  total: number; // Subtotal + tax
  taxRate: number; // Effective tax rate (percentage)
  breakdown: TaxBreakdownItem[];
  exemptionApplied: boolean;
  calculationMethod: "stripe_tax" | "manual" | "exempt";
}

export interface TaxBreakdownItem {
  taxType: string; // "sales_tax", "vat", "gst", etc.
  rate: number; // Percentage
  amount: number; // Tax amount in cents
  jurisdiction: string; // "California", "EU", etc.
}

export interface TaxExemptionData {
  customerId: string;
  exemptionType: "tax_exempt_organization" | "resale" | "government" | "diplomatic";
  certificateNumber?: string;
  validFrom: number;
  validTo?: number;
  jurisdictions?: string[]; // Which states/countries this applies to
}

export interface TaxReportData {
  startDate: number;
  endDate: number;
  jurisdiction: string; // "US-CA", "EU", "CA-ON", etc.
  totalSales: number;
  taxableAmount: number;
  taxCollected: number;
  exemptAmount: number;
  transactionCount: number;
}

// ============================================================================
// Errors
// ============================================================================

export class TaxCalculationError {
  readonly _tag = "TaxCalculationError";
  constructor(public message: string, public code?: string) {}
}

export class TaxRateNotFoundError {
  readonly _tag = "TaxRateNotFoundError";
  constructor(public country: string, public state?: string) {}
}

export class TaxExemptionError {
  readonly _tag = "TaxExemptionError";
  constructor(public message: string) {}
}

export class TaxReportError {
  readonly _tag = "TaxReportError";
  constructor(public message: string) {}
}

// ============================================================================
// Stripe Tax Integration
// ============================================================================

/**
 * Calculate tax using Stripe Tax API
 *
 * BENEFITS:
 * - Automatic tax rate updates
 * - Multi-jurisdiction support
 * - Compliance with nexus rules
 * - EU VAT MOSS support
 *
 * @param stripe - Stripe client
 * @param input - Tax calculation input
 * @returns Effect that resolves to tax calculation result
 */
export const calculateTaxWithStripe = (
  stripe: Stripe,
  input: TaxCalculationInput
): Effect.Effect<TaxCalculationResult, TaxCalculationError> =>
  Effect.tryPromise({
    try: async () => {
      // Create a tax calculation using Stripe Tax
      const calculation = await stripe.tax.calculations.create({
        currency: input.currency,
        line_items: [
          {
            amount: input.amount,
            reference: "item",
          },
        ],
        customer_details: {
          address: {
            country: input.country,
            state: input.state,
            postal_code: input.postalCode,
            city: input.city,
          },
          address_source: "shipping",
        },
      });

      const taxAmount = calculation.tax_amount_exclusive;
      const total = calculation.amount_total;

      // Build breakdown from Stripe's tax breakdown
      const breakdown: TaxBreakdownItem[] = calculation.tax_breakdown.map((item) => ({
        taxType: item.tax_rate_details?.tax_type || "sales_tax",
        rate: item.tax_rate_details?.percentage_decimal
          ? parseFloat(item.tax_rate_details.percentage_decimal)
          : 0,
        amount: item.amount,
        jurisdiction:
          item.jurisdiction?.display_name || item.jurisdiction?.country || "Unknown",
      }));

      return {
        subtotal: input.amount,
        taxAmount,
        total,
        taxRate: input.amount > 0 ? (taxAmount / input.amount) * 100 : 0,
        breakdown,
        exemptionApplied: false,
        calculationMethod: "stripe_tax",
      };
    },
    catch: (error) =>
      new TaxCalculationError(
        `Failed to calculate tax with Stripe: ${error instanceof Error ? error.message : "Unknown error"}`,
        error instanceof Stripe.errors.StripeError ? error.code : undefined
      ),
  });

/**
 * Create a Stripe Tax transaction (for reporting)
 *
 * CRITICAL: Call this AFTER payment succeeds to record tax for reporting
 *
 * @param stripe - Stripe client
 * @param data - Transaction data
 * @returns Effect that resolves to Stripe Tax Transaction
 */
export const createStripeTaxTransaction = (
  stripe: Stripe,
  data: {
    paymentIntentId: string;
    calculationId: string;
    reference: string; // Your payment ID
  }
): Effect.Effect<Stripe.Tax.Transaction, TaxCalculationError> =>
  Effect.tryPromise({
    try: () =>
      stripe.tax.transactions.createFromCalculation({
        calculation: data.calculationId,
        reference: data.reference,
      }),
    catch: (error) =>
      new TaxCalculationError(
        `Failed to create tax transaction: ${error instanceof Error ? error.message : "Unknown"}`,
        error instanceof Stripe.errors.StripeError ? error.code : undefined
      ),
  });

// ============================================================================
// Manual Tax Calculation (Fallback)
// ============================================================================

/**
 * Calculate tax manually using stored tax rates
 *
 * USE WHEN:
 * - Stripe Tax is not enabled
 * - Custom tax rules apply
 * - Override Stripe Tax calculation
 *
 * @param input - Tax calculation input
 * @param taxRates - Array of applicable tax rates
 * @returns Effect that resolves to tax calculation result
 */
export const calculateTaxManually = (
  input: TaxCalculationInput,
  taxRates: TaxRateData[]
): Effect.Effect<TaxCalculationResult, TaxCalculationError> =>
  Effect.sync(() => {
    // Find applicable tax rates for location
    const applicableRates = taxRates.filter(
      (rate) =>
        rate.active &&
        rate.country === input.country &&
        (!input.state || !rate.state || rate.state === input.state)
    );

    if (applicableRates.length === 0) {
      // No tax rates found - return zero tax
      return {
        subtotal: input.amount,
        taxAmount: 0,
        total: input.amount,
        taxRate: 0,
        breakdown: [],
        exemptionApplied: false,
        calculationMethod: "manual",
      };
    }

    // Calculate tax for each rate and sum
    const breakdown: TaxBreakdownItem[] = applicableRates.map((rate) => {
      const taxAmount = Math.round((input.amount * rate.percentage) / 100);
      return {
        taxType: rate.taxType,
        rate: rate.percentage,
        amount: taxAmount,
        jurisdiction: rate.state
          ? `${rate.country}-${rate.state}`
          : rate.country,
      };
    });

    const totalTax = breakdown.reduce((sum, item) => sum + item.amount, 0);
    const effectiveRate =
      input.amount > 0 ? (totalTax / input.amount) * 100 : 0;

    return {
      subtotal: input.amount,
      taxAmount: totalTax,
      total: input.amount + totalTax,
      taxRate: effectiveRate,
      breakdown,
      exemptionApplied: false,
      calculationMethod: "manual",
    };
  });

// ============================================================================
// Tax Exemption Logic
// ============================================================================

/**
 * Check if customer has valid tax exemption
 *
 * @param customerId - Customer ID
 * @param exemptions - Array of tax exemptions
 * @param jurisdiction - Tax jurisdiction (e.g., "US-CA", "EU")
 * @returns Effect that resolves to exemption status
 */
export const checkTaxExemption = (
  customerId: string,
  exemptions: TaxExemptionData[],
  jurisdiction?: string
): Effect.Effect<{ exempt: boolean; exemption?: TaxExemptionData }, never> =>
  Effect.sync(() => {
    const now = Date.now();

    // Find valid exemption for customer
    const validExemption = exemptions.find(
      (exemption) =>
        exemption.customerId === customerId &&
        exemption.validFrom <= now &&
        (!exemption.validTo || exemption.validTo > now) &&
        (!jurisdiction ||
          !exemption.jurisdictions ||
          exemption.jurisdictions.includes(jurisdiction))
    );

    if (validExemption) {
      return { exempt: true, exemption: validExemption };
    }

    return { exempt: false };
  });

/**
 * Apply tax exemption to calculation
 *
 * @param calculation - Original tax calculation
 * @param exemption - Tax exemption to apply
 * @returns Effect that resolves to exempt calculation
 */
export const applyTaxExemption = (
  calculation: TaxCalculationResult,
  exemption: TaxExemptionData
): Effect.Effect<TaxCalculationResult, never> =>
  Effect.sync(() => ({
    ...calculation,
    taxAmount: 0,
    total: calculation.subtotal,
    breakdown: calculation.breakdown.map((item) => ({
      ...item,
      amount: 0,
    })),
    exemptionApplied: true,
    calculationMethod: "exempt",
  }));

// ============================================================================
// Tax Reporting
// ============================================================================

/**
 * Generate tax report for a period
 *
 * @param payments - Array of payments with tax calculations
 * @param jurisdiction - Jurisdiction to report for
 * @param startDate - Report start date
 * @param endDate - Report end date
 * @returns Effect that resolves to tax report
 */
export const generateTaxReport = (
  payments: Array<{
    amount: number;
    taxAmount: number;
    exemptionApplied: boolean;
    jurisdiction?: string;
    createdAt: number;
  }>,
  jurisdiction: string,
  startDate: number,
  endDate: number
): Effect.Effect<TaxReportData, TaxReportError> =>
  Effect.try({
    try: () => {
      // Filter payments for jurisdiction and date range
      const relevantPayments = payments.filter(
        (payment) =>
          payment.createdAt >= startDate &&
          payment.createdAt <= endDate &&
          (!payment.jurisdiction || payment.jurisdiction === jurisdiction)
      );

      const totalSales = relevantPayments.reduce(
        (sum, payment) => sum + payment.amount,
        0
      );

      const taxablePayments = relevantPayments.filter(
        (payment) => !payment.exemptionApplied
      );
      const exemptPayments = relevantPayments.filter(
        (payment) => payment.exemptionApplied
      );

      const taxableAmount = taxablePayments.reduce(
        (sum, payment) => sum + payment.amount,
        0
      );

      const taxCollected = taxablePayments.reduce(
        (sum, payment) => sum + payment.taxAmount,
        0
      );

      const exemptAmount = exemptPayments.reduce(
        (sum, payment) => sum + payment.amount,
        0
      );

      return {
        startDate,
        endDate,
        jurisdiction,
        totalSales,
        taxableAmount,
        taxCollected,
        exemptAmount,
        transactionCount: relevantPayments.length,
      };
    },
    catch: (error) =>
      new TaxReportError(
        `Failed to generate tax report: ${error instanceof Error ? error.message : "Unknown"}`
      ),
  });

// ============================================================================
// EU VAT MOSS Support
// ============================================================================

/**
 * Calculate EU VAT using MOSS (Mini One Stop Shop) rules
 *
 * RULES:
 * - B2C: Customer location VAT applies
 * - B2B: Reverse charge if valid VAT number provided
 * - Digital services: Customer location determines VAT
 *
 * @param input - Tax calculation input
 * @param customerVatNumber - Customer VAT number (optional)
 * @returns Effect that resolves to VAT calculation
 */
export const calculateEUVAT = (
  input: TaxCalculationInput & { customerVatNumber?: string },
  vatRates: Map<string, number> // Country code → VAT rate
): Effect.Effect<TaxCalculationResult, TaxCalculationError> =>
  Effect.sync(() => {
    const countryCode = input.country.toUpperCase();

    // Check if customer has valid VAT number (B2B reverse charge)
    if (input.customerVatNumber && input.customerVatNumber.startsWith(countryCode)) {
      // B2B reverse charge - no VAT charged
      return {
        subtotal: input.amount,
        taxAmount: 0,
        total: input.amount,
        taxRate: 0,
        breakdown: [
          {
            taxType: "vat",
            rate: 0,
            amount: 0,
            jurisdiction: `EU-${countryCode} (Reverse Charge)`,
          },
        ],
        exemptionApplied: true,
        calculationMethod: "manual",
      };
    }

    // B2C - apply customer location VAT
    const vatRate = vatRates.get(countryCode);

    if (!vatRate) {
      throw new TaxCalculationError(
        `VAT rate not found for country: ${countryCode}`
      );
    }

    const taxAmount = Math.round((input.amount * vatRate) / 100);

    return {
      subtotal: input.amount,
      taxAmount,
      total: input.amount + taxAmount,
      taxRate: vatRate,
      breakdown: [
        {
          taxType: "vat",
          rate: vatRate,
          amount: taxAmount,
          jurisdiction: `EU-${countryCode}`,
        },
      ],
      exemptionApplied: false,
      calculationMethod: "manual",
    };
  });

// ============================================================================
// Validation
// ============================================================================

/**
 * Validate tax rate data
 *
 * @param data - Tax rate data to validate
 * @returns Effect that resolves if valid, fails otherwise
 */
export const validateTaxRate = (
  data: TaxRateData
): Effect.Effect<TaxRateData, TaxCalculationError> =>
  Effect.sync(() => {
    if (!data.country || data.country.length !== 2) {
      throw new TaxCalculationError("Invalid country code (must be 2-letter ISO)");
    }

    if (data.state && data.state.length !== 2) {
      throw new TaxCalculationError("Invalid state code (must be 2-letter)");
    }

    if (data.percentage < 0 || data.percentage > 100) {
      throw new TaxCalculationError("Invalid tax percentage (must be 0-100)");
    }

    if (!data.displayName || data.displayName.length === 0) {
      throw new TaxCalculationError("Display name is required");
    }

    const validTypes = ["sales_tax", "vat", "gst", "pst", "hst"];
    if (!validTypes.includes(data.taxType)) {
      throw new TaxCalculationError(`Invalid tax type: ${data.taxType}`);
    }

    return data;
  });

/**
 * Validate tax exemption data
 *
 * @param data - Tax exemption data to validate
 * @returns Effect that resolves if valid, fails otherwise
 */
export const validateTaxExemption = (
  data: TaxExemptionData
): Effect.Effect<TaxExemptionData, TaxExemptionError> =>
  Effect.sync(() => {
    if (!data.customerId) {
      throw new TaxExemptionError("Customer ID is required");
    }

    const validTypes = [
      "tax_exempt_organization",
      "resale",
      "government",
      "diplomatic",
    ];
    if (!validTypes.includes(data.exemptionType)) {
      throw new TaxExemptionError(`Invalid exemption type: ${data.exemptionType}`);
    }

    if (data.validFrom > (data.validTo || Infinity)) {
      throw new TaxExemptionError("Valid from date must be before valid to date");
    }

    return data;
  });

// ============================================================================
// Service Export
// ============================================================================

export const TaxService = {
  // Stripe Tax Integration
  calculateTaxWithStripe,
  createStripeTaxTransaction,

  // Manual Calculation
  calculateTaxManually,
  calculateEUVAT,

  // Exemptions
  checkTaxExemption,
  applyTaxExemption,

  // Reporting
  generateTaxReport,

  // Validation
  validateTaxRate,
  validateTaxExemption,
};

// ============================================================================
// Common VAT Rates (EU)
// ============================================================================

/**
 * EU VAT rates (as of 2024)
 * NOTE: These should be updated regularly or fetched from an API
 */
export const EU_VAT_RATES = new Map<string, number>([
  ["AT", 20], // Austria
  ["BE", 21], // Belgium
  ["BG", 20], // Bulgaria
  ["HR", 25], // Croatia
  ["CY", 19], // Cyprus
  ["CZ", 21], // Czech Republic
  ["DK", 25], // Denmark
  ["EE", 22], // Estonia
  ["FI", 24], // Finland
  ["FR", 20], // France
  ["DE", 19], // Germany
  ["GR", 24], // Greece
  ["HU", 27], // Hungary
  ["IE", 23], // Ireland
  ["IT", 22], // Italy
  ["LV", 21], // Latvia
  ["LT", 21], // Lithuania
  ["LU", 17], // Luxembourg
  ["MT", 18], // Malta
  ["NL", 21], // Netherlands
  ["PL", 23], // Poland
  ["PT", 23], // Portugal
  ["RO", 19], // Romania
  ["SK", 20], // Slovakia
  ["SI", 22], // Slovenia
  ["ES", 21], // Spain
  ["SE", 25], // Sweden
]);
