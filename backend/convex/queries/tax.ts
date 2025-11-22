/**
 * Tax Queries - Read operations for tax data
 *
 * All queries MUST:
 * 1. Authenticate user
 * 2. Filter by groupId (multi-tenant isolation)
 * 3. Return only data user has access to
 *
 * @see /backend/CLAUDE.md - Query patterns
 * @see /one/knowledge/ontology.md - 6-dimension ontology
 */

import { query } from "../_generated/server";
import { v } from "convex/values";

// ============================================================================
// List Tax Rates
// ============================================================================

/**
 * List all tax rates for the organization
 */
export const listTaxRates = query({
  args: {
    active: v.optional(v.boolean()),
    country: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // 2. Get user's group
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person || !person.groupId) {
      return [];
    }

    // 3. Query tax rates with groupId scope
    let q = ctx.db
      .query("things")
      .withIndex("by_group_type", (q) =>
        q.eq("groupId", person.groupId).eq("type", "tax_rate")
      );

    const taxRates = await q.collect();

    // 4. Apply filters
    let filtered = taxRates;

    if (args.active !== undefined) {
      filtered = filtered.filter((rate) =>
        args.active ? rate.status === "active" : rate.status === "archived"
      );
    }

    if (args.country) {
      filtered = filtered.filter(
        (rate) => rate.properties?.country === args.country
      );
    }

    return filtered.map((rate) => ({
      _id: rate._id,
      name: rate.name,
      country: rate.properties?.country,
      state: rate.properties?.state,
      taxType: rate.properties?.taxType,
      percentage: rate.properties?.percentage,
      description: rate.properties?.description,
      active: rate.status === "active",
      createdAt: rate.createdAt,
      updatedAt: rate.updatedAt,
    }));
  },
});

// ============================================================================
// Get Tax Rate
// ============================================================================

/**
 * Get a specific tax rate by ID
 */
export const getTaxRate = query({
  args: { id: v.id("things") },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // 2. Get user's group
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person || !person.groupId) {
      return null;
    }

    // 3. Get tax rate and verify group ownership
    const taxRate = await ctx.db.get(args.id);
    if (
      !taxRate ||
      taxRate.type !== "tax_rate" ||
      taxRate.groupId !== person.groupId
    ) {
      return null;
    }

    return {
      _id: taxRate._id,
      name: taxRate.name,
      country: taxRate.properties?.country,
      state: taxRate.properties?.state,
      taxType: taxRate.properties?.taxType,
      percentage: taxRate.properties?.percentage,
      description: taxRate.properties?.description,
      active: taxRate.status === "active",
      createdAt: taxRate.createdAt,
      updatedAt: taxRate.updatedAt,
    };
  },
});

// ============================================================================
// List Tax Exemptions
// ============================================================================

/**
 * List all tax exemptions for the organization
 */
export const listTaxExemptions = query({
  args: {
    customerId: v.optional(v.id("things")),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // 2. Get user's group
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person || !person.groupId) {
      return [];
    }

    // 3. Query tax exemptions with groupId scope
    let q = ctx.db
      .query("things")
      .withIndex("by_group_type", (q) =>
        q.eq("groupId", person.groupId).eq("type", "tax_exemption")
      );

    const exemptions = await q.collect();

    // 4. Apply filters
    let filtered = exemptions;

    if (args.customerId) {
      filtered = filtered.filter(
        (exemption) => exemption.properties?.customerId === args.customerId
      );
    }

    if (args.active !== undefined) {
      filtered = filtered.filter((exemption) =>
        args.active
          ? exemption.status === "active"
          : exemption.status === "archived"
      );
    }

    // 5. Enrich with customer data
    const enriched = await Promise.all(
      filtered.map(async (exemption) => {
        const customer = exemption.properties?.customerId
          ? await ctx.db.get(exemption.properties.customerId)
          : null;

        return {
          _id: exemption._id,
          customerId: exemption.properties?.customerId,
          customerName: customer?.name,
          exemptionType: exemption.properties?.exemptionType,
          certificateNumber: exemption.properties?.certificateNumber,
          validFrom: exemption.properties?.validFrom,
          validTo: exemption.properties?.validTo,
          jurisdictions: exemption.properties?.jurisdictions,
          notes: exemption.properties?.notes,
          active: exemption.status === "active",
          createdAt: exemption.createdAt,
          updatedAt: exemption.updatedAt,
        };
      })
    );

    return enriched;
  },
});

// ============================================================================
// Get Tax Exemption
// ============================================================================

/**
 * Get a specific tax exemption by ID
 */
export const getTaxExemption = query({
  args: { id: v.id("things") },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // 2. Get user's group
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person || !person.groupId) {
      return null;
    }

    // 3. Get exemption and verify group ownership
    const exemption = await ctx.db.get(args.id);
    if (
      !exemption ||
      exemption.type !== "tax_exemption" ||
      exemption.groupId !== person.groupId
    ) {
      return null;
    }

    // 4. Get customer data
    const customer = exemption.properties?.customerId
      ? await ctx.db.get(exemption.properties.customerId)
      : null;

    return {
      _id: exemption._id,
      customerId: exemption.properties?.customerId,
      customerName: customer?.name,
      exemptionType: exemption.properties?.exemptionType,
      certificateNumber: exemption.properties?.certificateNumber,
      validFrom: exemption.properties?.validFrom,
      validTo: exemption.properties?.validTo,
      jurisdictions: exemption.properties?.jurisdictions,
      notes: exemption.properties?.notes,
      active: exemption.status === "active",
      createdAt: exemption.createdAt,
      updatedAt: exemption.updatedAt,
    };
  },
});

// ============================================================================
// List Tax Calculations
// ============================================================================

/**
 * List tax calculations for the organization
 */
export const listTaxCalculations = query({
  args: {
    paymentId: v.optional(v.id("things")),
    customerId: v.optional(v.id("things")),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // 2. Get user's group
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person || !person.groupId) {
      return [];
    }

    // 3. Query tax calculations with groupId scope
    let q = ctx.db
      .query("things")
      .withIndex("by_group_type", (q) =>
        q.eq("groupId", person.groupId).eq("type", "tax_calculation")
      );

    const calculations = await q.collect();

    // 4. Apply filters
    let filtered = calculations;

    if (args.paymentId) {
      filtered = filtered.filter(
        (calc) => calc.properties?.paymentId === args.paymentId
      );
    }

    if (args.customerId) {
      filtered = filtered.filter(
        (calc) => calc.properties?.customerId === args.customerId
      );
    }

    if (args.startDate) {
      filtered = filtered.filter((calc) => calc.createdAt >= args.startDate!);
    }

    if (args.endDate) {
      filtered = filtered.filter((calc) => calc.createdAt <= args.endDate!);
    }

    // 5. Sort by date (newest first) and limit
    const sorted = filtered.sort((a, b) => b.createdAt - a.createdAt);
    const limited = args.limit ? sorted.slice(0, args.limit) : sorted;

    return limited.map((calc) => ({
      _id: calc._id,
      subtotal: calc.properties?.subtotal,
      taxAmount: calc.properties?.taxAmount,
      total: calc.properties?.total,
      taxRate: calc.properties?.taxRate,
      breakdown: calc.properties?.breakdown,
      exemptionApplied: calc.properties?.exemptionApplied,
      calculationMethod: calc.properties?.calculationMethod,
      country: calc.properties?.country,
      state: calc.properties?.state,
      currency: calc.properties?.currency,
      paymentId: calc.properties?.paymentId,
      customerId: calc.properties?.customerId,
      createdAt: calc.createdAt,
    }));
  },
});

// ============================================================================
// Get Tax Calculation
// ============================================================================

/**
 * Get a specific tax calculation by ID
 */
export const getTaxCalculation = query({
  args: { id: v.id("things") },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // 2. Get user's group
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person || !person.groupId) {
      return null;
    }

    // 3. Get calculation and verify group ownership
    const calc = await ctx.db.get(args.id);
    if (
      !calc ||
      calc.type !== "tax_calculation" ||
      calc.groupId !== person.groupId
    ) {
      return null;
    }

    return {
      _id: calc._id,
      subtotal: calc.properties?.subtotal,
      taxAmount: calc.properties?.taxAmount,
      total: calc.properties?.total,
      taxRate: calc.properties?.taxRate,
      breakdown: calc.properties?.breakdown,
      exemptionApplied: calc.properties?.exemptionApplied,
      calculationMethod: calc.properties?.calculationMethod,
      country: calc.properties?.country,
      state: calc.properties?.state,
      postalCode: calc.properties?.postalCode,
      city: calc.properties?.city,
      currency: calc.properties?.currency,
      paymentId: calc.properties?.paymentId,
      customerId: calc.properties?.customerId,
      exemptionId: calc.properties?.exemptionId,
      createdAt: calc.createdAt,
    };
  },
});

// ============================================================================
// List Tax Reports
// ============================================================================

/**
 * List tax reports for the organization
 */
export const listTaxReports = query({
  args: {
    jurisdiction: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // 2. Get user's group
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person || !person.groupId) {
      return [];
    }

    // 3. Query tax reports with groupId scope
    let q = ctx.db
      .query("things")
      .withIndex("by_group_type", (q) =>
        q.eq("groupId", person.groupId).eq("type", "tax_report")
      );

    const reports = await q.collect();

    // 4. Apply filters
    let filtered = reports;

    if (args.jurisdiction) {
      filtered = filtered.filter(
        (report) => report.properties?.jurisdiction === args.jurisdiction
      );
    }

    if (args.startDate) {
      filtered = filtered.filter(
        (report) => report.properties?.endDate >= args.startDate!
      );
    }

    if (args.endDate) {
      filtered = filtered.filter(
        (report) => report.properties?.startDate <= args.endDate!
      );
    }

    // 5. Sort by date (newest first) and limit
    const sorted = filtered.sort((a, b) => b.createdAt - a.createdAt);
    const limited = args.limit ? sorted.slice(0, args.limit) : sorted;

    return limited.map((report) => ({
      _id: report._id,
      name: report.name,
      jurisdiction: report.properties?.jurisdiction,
      startDate: report.properties?.startDate,
      endDate: report.properties?.endDate,
      totalSales: report.properties?.totalSales,
      taxableAmount: report.properties?.taxableAmount,
      taxCollected: report.properties?.taxCollected,
      exemptAmount: report.properties?.exemptAmount,
      transactionCount: report.properties?.transactionCount,
      generatedAt: report.properties?.generatedAt,
      generatedBy: report.properties?.generatedBy,
      createdAt: report.createdAt,
    }));
  },
});

// ============================================================================
// Get Tax Report
// ============================================================================

/**
 * Get a specific tax report by ID
 */
export const getTaxReport = query({
  args: { id: v.id("things") },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // 2. Get user's group
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person || !person.groupId) {
      return null;
    }

    // 3. Get report and verify group ownership
    const report = await ctx.db.get(args.id);
    if (
      !report ||
      report.type !== "tax_report" ||
      report.groupId !== person.groupId
    ) {
      return null;
    }

    return {
      _id: report._id,
      name: report.name,
      jurisdiction: report.properties?.jurisdiction,
      startDate: report.properties?.startDate,
      endDate: report.properties?.endDate,
      totalSales: report.properties?.totalSales,
      taxableAmount: report.properties?.taxableAmount,
      taxCollected: report.properties?.taxCollected,
      exemptAmount: report.properties?.exemptAmount,
      transactionCount: report.properties?.transactionCount,
      generatedAt: report.properties?.generatedAt,
      generatedBy: report.properties?.generatedBy,
      createdAt: report.createdAt,
    };
  },
});

// ============================================================================
// Get Tax Summary
// ============================================================================

/**
 * Get tax summary for dashboard
 */
export const getTaxSummary = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // 2. Get user's group
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person || !person.groupId) {
      return null;
    }

    const startDate = args.startDate || Date.now() - 30 * 24 * 60 * 60 * 1000; // Default: last 30 days
    const endDate = args.endDate || Date.now();

    // 3. Query tax calculations for period
    const calculations = await ctx.db
      .query("things")
      .withIndex("by_group_type", (q) =>
        q.eq("groupId", person.groupId).eq("type", "tax_calculation")
      )
      .filter((t) => t.createdAt >= startDate && t.createdAt <= endDate)
      .collect();

    // 4. Calculate totals
    const totalTaxCollected = calculations.reduce(
      (sum, calc) => sum + (calc.properties?.taxAmount || 0),
      0
    );

    const totalSales = calculations.reduce(
      (sum, calc) => sum + (calc.properties?.subtotal || 0),
      0
    );

    const exemptTransactions = calculations.filter(
      (calc) => calc.properties?.exemptionApplied
    ).length;

    const totalTransactions = calculations.length;

    // 5. Group by jurisdiction
    const byJurisdiction = calculations.reduce(
      (acc, calc) => {
        const jurisdiction = calc.properties?.state
          ? `${calc.properties?.country}-${calc.properties?.state}`
          : calc.properties?.country || "Unknown";

        if (!acc[jurisdiction]) {
          acc[jurisdiction] = {
            jurisdiction,
            taxCollected: 0,
            sales: 0,
            transactionCount: 0,
          };
        }

        acc[jurisdiction].taxCollected += calc.properties?.taxAmount || 0;
        acc[jurisdiction].sales += calc.properties?.subtotal || 0;
        acc[jurisdiction].transactionCount += 1;

        return acc;
      },
      {} as Record<
        string,
        {
          jurisdiction: string;
          taxCollected: number;
          sales: number;
          transactionCount: number;
        }
      >
    );

    return {
      totalTaxCollected,
      totalSales,
      totalTransactions,
      exemptTransactions,
      averageTaxRate:
        totalSales > 0 ? (totalTaxCollected / totalSales) * 100 : 0,
      byJurisdiction: Object.values(byJurisdiction),
      startDate,
      endDate,
    };
  },
});
