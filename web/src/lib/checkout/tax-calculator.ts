/**
 * Tax Calculator Utility - Frontend helper for tax calculations
 *
 * This utility provides frontend helpers for:
 * - Formatting tax amounts for display
 * - Calculating tax totals
 * - Displaying tax breakdowns
 * - Handling tax exemptions in UI
 *
 * IMPORTANT: Actual tax calculation happens on backend.
 * This is for display and client-side validation only.
 *
 * @see /backend/convex/services/payments/tax.ts - Backend tax logic
 * @see /backend/convex/mutations/tax.ts - Tax mutations
 */

// ============================================================================
// Types
// ============================================================================

export interface TaxBreakdownItem {
  taxType: string;
  rate: number;
  amount: number;
  jurisdiction: string;
}

export interface TaxCalculation {
  subtotal: number;
  taxAmount: number;
  total: number;
  taxRate: number;
  breakdown: TaxBreakdownItem[];
  exemptionApplied: boolean;
  calculationMethod: "stripe_tax" | "manual" | "exempt";
}

export interface TaxDisplayOptions {
  showBreakdown?: boolean;
  showRate?: boolean;
  showExemption?: boolean;
  currency?: string;
  locale?: string;
}

// ============================================================================
// Formatting Helpers
// ============================================================================

/**
 * Format currency amount for display
 *
 * @param amount - Amount in cents
 * @param currency - Currency code (default: USD)
 * @param locale - Locale for formatting (default: en-US)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

/**
 * Format tax rate as percentage
 *
 * @param rate - Tax rate (e.g., 8.5)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted percentage string
 */
export function formatTaxRate(rate: number, decimals: number = 2): string {
  return `${rate.toFixed(decimals)}%`;
}

/**
 * Format tax type display name
 *
 * @param taxType - Tax type code
 * @returns Human-readable tax type
 */
export function formatTaxType(taxType: string): string {
  const types: Record<string, string> = {
    sales_tax: "Sales Tax",
    vat: "VAT",
    gst: "GST",
    pst: "PST",
    hst: "HST",
  };

  return types[taxType] || taxType.replace(/_/g, " ").toUpperCase();
}

// ============================================================================
// Tax Display Components
// ============================================================================

/**
 * Generate tax line items for display in cart/checkout
 *
 * @param calculation - Tax calculation result
 * @param options - Display options
 * @returns Array of display line items
 */
export function getTaxLineItems(
  calculation: TaxCalculation,
  options: TaxDisplayOptions = {}
): Array<{
  label: string;
  amount: string;
  description?: string;
}> {
  const { currency = "USD", locale = "en-US" } = options;

  const lineItems: Array<{
    label: string;
    amount: string;
    description?: string;
  }> = [];

  // Subtotal
  lineItems.push({
    label: "Subtotal",
    amount: formatCurrency(calculation.subtotal, currency, locale),
  });

  // Tax breakdown or single tax line
  if (options.showBreakdown && calculation.breakdown.length > 0) {
    calculation.breakdown.forEach((item) => {
      lineItems.push({
        label: `${formatTaxType(item.taxType)} (${item.jurisdiction})`,
        amount: formatCurrency(item.amount, currency, locale),
        description: `${formatTaxRate(item.rate)} tax`,
      });
    });
  } else if (calculation.taxAmount > 0) {
    lineItems.push({
      label: "Tax",
      amount: formatCurrency(calculation.taxAmount, currency, locale),
      description: options.showRate
        ? `${formatTaxRate(calculation.taxRate)} tax`
        : undefined,
    });
  }

  // Exemption notice
  if (calculation.exemptionApplied && options.showExemption) {
    lineItems.push({
      label: "Tax Exemption Applied",
      amount: formatCurrency(0, currency, locale),
      description: "You are exempt from paying tax on this order",
    });
  }

  // Total
  lineItems.push({
    label: "Total",
    amount: formatCurrency(calculation.total, currency, locale),
  });

  return lineItems;
}

/**
 * Generate tax summary for display
 *
 * @param calculation - Tax calculation result
 * @param options - Display options
 * @returns Tax summary object
 */
export function getTaxSummary(
  calculation: TaxCalculation,
  options: TaxDisplayOptions = {}
): {
  totalLabel: string;
  totalAmount: string;
  taxLabel: string;
  taxAmount: string;
  effectiveRate: string;
  breakdown?: Array<{ label: string; amount: string; rate: string }>;
} {
  const { currency = "USD", locale = "en-US" } = options;

  const summary = {
    totalLabel: "Order Total",
    totalAmount: formatCurrency(calculation.total, currency, locale),
    taxLabel: calculation.exemptionApplied ? "Tax (Exempt)" : "Tax",
    taxAmount: formatCurrency(calculation.taxAmount, currency, locale),
    effectiveRate: formatTaxRate(calculation.taxRate),
  };

  if (options.showBreakdown && calculation.breakdown.length > 0) {
    return {
      ...summary,
      breakdown: calculation.breakdown.map((item) => ({
        label: `${formatTaxType(item.taxType)} - ${item.jurisdiction}`,
        amount: formatCurrency(item.amount, currency, locale),
        rate: formatTaxRate(item.rate),
      })),
    };
  }

  return summary;
}

// ============================================================================
// Client-Side Estimation (For Preview Only)
// ============================================================================

/**
 * Estimate tax amount (client-side preview only)
 *
 * WARNING: This is for UI preview only. Always use backend calculation
 * for actual charges. Tax rates may be outdated or incorrect.
 *
 * @param subtotal - Subtotal in cents
 * @param estimatedRate - Estimated tax rate (percentage)
 * @param currency - Currency code
 * @returns Estimated tax calculation
 */
export function estimateTax(
  subtotal: number,
  estimatedRate: number = 0,
  currency: string = "USD"
): TaxCalculation {
  const taxAmount = Math.round((subtotal * estimatedRate) / 100);
  const total = subtotal + taxAmount;

  return {
    subtotal,
    taxAmount,
    total,
    taxRate: estimatedRate,
    breakdown: [
      {
        taxType: "sales_tax",
        rate: estimatedRate,
        amount: taxAmount,
        jurisdiction: "Estimated",
      },
    ],
    exemptionApplied: false,
    calculationMethod: "manual",
  };
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate tax calculation response
 *
 * @param data - Tax calculation data from API
 * @returns True if valid, false otherwise
 */
export function isValidTaxCalculation(data: any): data is TaxCalculation {
  return (
    typeof data === "object" &&
    data !== null &&
    typeof data.subtotal === "number" &&
    typeof data.taxAmount === "number" &&
    typeof data.total === "number" &&
    typeof data.taxRate === "number" &&
    Array.isArray(data.breakdown) &&
    typeof data.exemptionApplied === "boolean" &&
    typeof data.calculationMethod === "string"
  );
}

/**
 * Validate tax breakdown item
 *
 * @param item - Breakdown item to validate
 * @returns True if valid, false otherwise
 */
export function isValidBreakdownItem(item: any): item is TaxBreakdownItem {
  return (
    typeof item === "object" &&
    item !== null &&
    typeof item.taxType === "string" &&
    typeof item.rate === "number" &&
    typeof item.amount === "number" &&
    typeof item.jurisdiction === "string"
  );
}

// ============================================================================
// Common Tax Rates (for estimation/preview only)
// ============================================================================

/**
 * Common US state sales tax rates (approximate)
 *
 * WARNING: These are estimates and may not reflect current rates.
 * Always use backend calculation for actual charges.
 */
export const US_STATE_TAX_RATES: Record<string, number> = {
  AL: 4.0, // Alabama
  AK: 0.0, // Alaska (no state sales tax)
  AZ: 5.6, // Arizona
  AR: 6.5, // Arkansas
  CA: 7.25, // California
  CO: 2.9, // Colorado
  CT: 6.35, // Connecticut
  DE: 0.0, // Delaware (no sales tax)
  FL: 6.0, // Florida
  GA: 4.0, // Georgia
  HI: 4.0, // Hawaii
  ID: 6.0, // Idaho
  IL: 6.25, // Illinois
  IN: 7.0, // Indiana
  IA: 6.0, // Iowa
  KS: 6.5, // Kansas
  KY: 6.0, // Kentucky
  LA: 4.45, // Louisiana
  ME: 5.5, // Maine
  MD: 6.0, // Maryland
  MA: 6.25, // Massachusetts
  MI: 6.0, // Michigan
  MN: 6.875, // Minnesota
  MS: 7.0, // Mississippi
  MO: 4.225, // Missouri
  MT: 0.0, // Montana (no sales tax)
  NE: 5.5, // Nebraska
  NV: 6.85, // Nevada
  NH: 0.0, // New Hampshire (no sales tax)
  NJ: 6.625, // New Jersey
  NM: 5.125, // New Mexico
  NY: 4.0, // New York
  NC: 4.75, // North Carolina
  ND: 5.0, // North Dakota
  OH: 5.75, // Ohio
  OK: 4.5, // Oklahoma
  OR: 0.0, // Oregon (no sales tax)
  PA: 6.0, // Pennsylvania
  RI: 7.0, // Rhode Island
  SC: 6.0, // South Carolina
  SD: 4.5, // South Dakota
  TN: 7.0, // Tennessee
  TX: 6.25, // Texas
  UT: 6.1, // Utah
  VT: 6.0, // Vermont
  VA: 5.3, // Virginia
  WA: 6.5, // Washington
  WV: 6.0, // West Virginia
  WI: 5.0, // Wisconsin
  WY: 4.0, // Wyoming
  DC: 6.0, // District of Columbia
};

/**
 * Common EU VAT rates (approximate)
 *
 * WARNING: These are estimates and may not reflect current rates.
 * Always use backend calculation for actual charges.
 */
export const EU_VAT_RATES: Record<string, number> = {
  AT: 20, // Austria
  BE: 21, // Belgium
  BG: 20, // Bulgaria
  HR: 25, // Croatia
  CY: 19, // Cyprus
  CZ: 21, // Czech Republic
  DK: 25, // Denmark
  EE: 22, // Estonia
  FI: 24, // Finland
  FR: 20, // France
  DE: 19, // Germany
  GR: 24, // Greece
  HU: 27, // Hungary
  IE: 23, // Ireland
  IT: 22, // Italy
  LV: 21, // Latvia
  LT: 21, // Lithuania
  LU: 17, // Luxembourg
  MT: 18, // Malta
  NL: 21, // Netherlands
  PL: 23, // Poland
  PT: 23, // Portugal
  RO: 19, // Romania
  SK: 20, // Slovakia
  SI: 22, // Slovenia
  ES: 21, // Spain
  SE: 25, // Sweden
};

/**
 * Get estimated tax rate for location
 *
 * @param country - Country code (ISO 2-letter)
 * @param state - State/province code (optional)
 * @returns Estimated tax rate (percentage)
 */
export function getEstimatedTaxRate(
  country: string,
  state?: string
): number {
  const countryCode = country.toUpperCase();

  // US states
  if (countryCode === "US" && state) {
    return US_STATE_TAX_RATES[state.toUpperCase()] || 0;
  }

  // EU VAT
  if (EU_VAT_RATES[countryCode] !== undefined) {
    return EU_VAT_RATES[countryCode];
  }

  // Default: no tax
  return 0;
}

// ============================================================================
// React Hooks (if using React)
// ============================================================================

/**
 * Example hook for tax calculation in React components
 *
 * Usage:
 * ```tsx
 * const { calculation, isLoading, error } = useTaxCalculation({
 *   amount: 10000,
 *   country: "US",
 *   state: "CA"
 * });
 * ```
 */
export function createUseTaxCalculation(convexClient: any) {
  return function useTaxCalculation(input: {
    amount: number;
    currency: string;
    country: string;
    state?: string;
    postalCode?: string;
    city?: string;
    customerId?: string;
    enabled?: boolean;
  }) {
    // This would use your Convex React hooks
    // Example placeholder:
    return {
      calculation: null as TaxCalculation | null,
      isLoading: false,
      error: null as Error | null,
    };
  };
}

// ============================================================================
// Export All
// ============================================================================

export default {
  formatCurrency,
  formatTaxRate,
  formatTaxType,
  getTaxLineItems,
  getTaxSummary,
  estimateTax,
  isValidTaxCalculation,
  isValidBreakdownItem,
  getEstimatedTaxRate,
  US_STATE_TAX_RATES,
  EU_VAT_RATES,
};
