/**
 * Tax Mutations - Tax calculation and management operations
 *
 * All mutations MUST:
 * 1. Authenticate user
 * 2. Validate groupId access
 * 3. Call TaxService (business logic)
 * 4. Create things/connections/events following ontology
 * 5. Log events after operations
 *
 * Thing Types:
 * - tax_rate: Tax rate configuration
 * - tax_calculation: Calculated tax for a payment
 * - tax_exemption: Tax exemption certificate
 * - tax_report: Tax filing report
 *
 * @see /backend/CLAUDE.md - Mutation patterns
 * @see /one/knowledge/ontology.md - 6-dimension ontology
 */

import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { TaxService, EU_VAT_RATES } from "../services/payments/tax";
import { StripeService } from "../services/payments/stripe";
import { Effect } from "effect";

// ============================================================================
// Helper: Get Stripe Configuration
// ============================================================================

const getStripeConfig = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secretKey || !webhookSecret) {
    throw new Error(
      "Stripe configuration missing. Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET"
    );
  }

  return { secretKey, webhookSecret };
};

// ============================================================================
// Create Tax Rate
// ============================================================================

/**
 * Create a manual tax rate configuration
 *
 * CRITICAL:
 * - Only org owners can create tax rates
 * - Creates tax_rate thing
 * - Logs tax_rate_created event
 */
export const createTaxRate = mutation({
  args: {
    country: v.string(),
    state: v.optional(v.string()),
    taxType: v.union(
      v.literal("sales_tax"),
      v.literal("vat"),
      v.literal("gst"),
      v.literal("pst"),
      v.literal("hst")
    ),
    percentage: v.number(),
    displayName: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. Get user and validate role
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person || !person.groupId) {
      throw new Error("User must belong to a group");
    }

    // Validate user is org owner
    const role = person.properties?.role || "org_user";
    if (role !== "org_owner" && role !== "platform_owner") {
      throw new Error("Only organization owners can create tax rates");
    }

    // 3. Validate tax rate data
    const program = Effect.gen(function* () {
      const validated = yield* TaxService.validateTaxRate({
        country: args.country,
        state: args.state,
        taxType: args.taxType,
        percentage: args.percentage,
        displayName: args.displayName,
        description: args.description,
        active: true,
      });

      return validated;
    });

    await Effect.runPromise(program);

    // 4. Create tax_rate thing
    const taxRateId = await ctx.db.insert("things", {
      type: "tax_rate",
      name: args.displayName,
      groupId: person.groupId,
      properties: {
        country: args.country,
        state: args.state,
        taxType: args.taxType,
        percentage: args.percentage,
        description: args.description,
        active: true,
      },
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // 5. Create connection: person created tax_rate
    await ctx.db.insert("connections", {
      fromThingId: person._id,
      toThingId: taxRateId,
      relationshipType: "created_by",
      metadata: {
        entityType: "tax_rate",
      },
      validFrom: Date.now(),
      createdAt: Date.now(),
    });

    // 6. Log event
    await ctx.db.insert("events", {
      type: "entity_created",
      actorId: person._id,
      targetId: taxRateId,
      timestamp: Date.now(),
      metadata: {
        entityType: "tax_rate",
        country: args.country,
        state: args.state,
        taxType: args.taxType,
        percentage: args.percentage,
        groupId: person.groupId,
      },
    });

    return {
      taxRateId,
      displayName: args.displayName,
      percentage: args.percentage,
    };
  },
});

// ============================================================================
// Calculate Tax for Payment
// ============================================================================

/**
 * Calculate tax for a payment using Stripe Tax or manual rates
 *
 * CRITICAL:
 * - Checks tax exemption first
 * - Uses Stripe Tax if enabled, falls back to manual
 * - Creates tax_calculation thing
 * - Logs tax_calculated event
 */
export const calculateTax = mutation({
  args: {
    amount: v.number(),
    currency: v.string(),
    country: v.string(),
    state: v.optional(v.string()),
    postalCode: v.optional(v.string()),
    city: v.optional(v.string()),
    customerId: v.optional(v.id("things")),
    paymentId: v.optional(v.id("things")),
    useStripeTax: v.optional(v.boolean()), // Default: true if Stripe Tax enabled
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. Get user
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person || !person.groupId) {
      throw new Error("User must belong to a group");
    }

    // 3. Check for tax exemptions
    let exemptionApplied = false;
    let exemptionId: string | undefined;

    if (args.customerId) {
      const exemptions = await ctx.db
        .query("things")
        .withIndex("by_group_type", (q) =>
          q.eq("groupId", person.groupId).eq("type", "tax_exemption")
        )
        .filter(
          (t) =>
            t.properties?.customerId === args.customerId &&
            t.status === "active"
        )
        .collect();

      if (exemptions.length > 0) {
        const jurisdiction = args.state
          ? `${args.country}-${args.state}`
          : args.country;

        const program = Effect.gen(function* () {
          const exemptionCheck = yield* TaxService.checkTaxExemption(
            args.customerId!,
            exemptions.map((e) => ({
              customerId: e.properties?.customerId || "",
              exemptionType: e.properties?.exemptionType,
              certificateNumber: e.properties?.certificateNumber,
              validFrom: e.createdAt,
              validTo: e.properties?.validTo,
              jurisdictions: e.properties?.jurisdictions,
            })),
            jurisdiction
          );

          return exemptionCheck;
        });

        const exemptionCheck = await Effect.runPromise(program);

        if (exemptionCheck.exempt) {
          exemptionApplied = true;
          exemptionId = exemptions[0]._id;
        }
      }
    }

    // 4. Calculate tax (exempt or calculate)
    let taxCalculation;

    if (exemptionApplied) {
      // Tax exempt - no tax charged
      taxCalculation = {
        subtotal: args.amount,
        taxAmount: 0,
        total: args.amount,
        taxRate: 0,
        breakdown: [],
        exemptionApplied: true,
        calculationMethod: "exempt" as const,
      };
    } else if (args.useStripeTax !== false) {
      // Use Stripe Tax API
      const config = getStripeConfig();
      const program = Effect.gen(function* () {
        const stripe = yield* StripeService.initializeStripe(config);

        const calculation = yield* TaxService.calculateTaxWithStripe(stripe, {
          amount: args.amount,
          currency: args.currency,
          country: args.country,
          state: args.state,
          postalCode: args.postalCode,
          city: args.city,
          customerId: args.customerId,
        });

        return calculation;
      });

      try {
        taxCalculation = await Effect.runPromise(program);
      } catch (error) {
        // Fallback to manual calculation if Stripe Tax fails
        console.warn("Stripe Tax failed, falling back to manual:", error);

        // Get manual tax rates
        const taxRates = await ctx.db
          .query("things")
          .withIndex("by_group_type", (q) =>
            q.eq("groupId", person.groupId).eq("type", "tax_rate")
          )
          .filter((t) => t.status === "active")
          .collect();

        const program = Effect.gen(function* () {
          const calculation = yield* TaxService.calculateTaxManually(
            {
              amount: args.amount,
              currency: args.currency,
              country: args.country,
              state: args.state,
            },
            taxRates.map((rate) => ({
              country: rate.properties?.country || "",
              state: rate.properties?.state,
              taxType: rate.properties?.taxType || "sales_tax",
              percentage: rate.properties?.percentage || 0,
              displayName: rate.name,
              description: rate.properties?.description,
              active: true,
            }))
          );

          return calculation;
        });

        taxCalculation = await Effect.runPromise(program);
      }
    } else {
      // Manual calculation
      const taxRates = await ctx.db
        .query("things")
        .withIndex("by_group_type", (q) =>
          q.eq("groupId", person.groupId).eq("type", "tax_rate")
        )
        .filter((t) => t.status === "active")
        .collect();

      const program = Effect.gen(function* () {
        const calculation = yield* TaxService.calculateTaxManually(
          {
            amount: args.amount,
            currency: args.currency,
            country: args.country,
            state: args.state,
          },
          taxRates.map((rate) => ({
            country: rate.properties?.country || "",
            state: rate.properties?.state,
            taxType: rate.properties?.taxType || "sales_tax",
            percentage: rate.properties?.percentage || 0,
            displayName: rate.name,
            description: rate.properties?.description,
            active: true,
          }))
        );

        return calculation;
      });

      taxCalculation = await Effect.runPromise(program);
    }

    // 5. Create tax_calculation thing
    const taxCalculationId = await ctx.db.insert("things", {
      type: "tax_calculation",
      name: `Tax for ${args.currency} ${args.amount / 100}`,
      groupId: person.groupId,
      properties: {
        subtotal: taxCalculation.subtotal,
        taxAmount: taxCalculation.taxAmount,
        total: taxCalculation.total,
        taxRate: taxCalculation.taxRate,
        breakdown: taxCalculation.breakdown,
        exemptionApplied: taxCalculation.exemptionApplied,
        calculationMethod: taxCalculation.calculationMethod,
        country: args.country,
        state: args.state,
        postalCode: args.postalCode,
        city: args.city,
        currency: args.currency,
        customerId: args.customerId,
        paymentId: args.paymentId,
        exemptionId,
      },
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // 6. Create connection: payment includes tax
    if (args.paymentId) {
      await ctx.db.insert("connections", {
        fromThingId: args.paymentId,
        toThingId: taxCalculationId,
        relationshipType: "references",
        metadata: {
          connectionType: "payment_includes_tax",
          taxAmount: taxCalculation.taxAmount,
        },
        validFrom: Date.now(),
        createdAt: Date.now(),
      });
    }

    // 7. Log event
    await ctx.db.insert("events", {
      type: "tax_calculated",
      actorId: person._id,
      targetId: taxCalculationId,
      timestamp: Date.now(),
      metadata: {
        subtotal: taxCalculation.subtotal,
        taxAmount: taxCalculation.taxAmount,
        total: taxCalculation.total,
        taxRate: taxCalculation.taxRate,
        exemptionApplied: taxCalculation.exemptionApplied,
        calculationMethod: taxCalculation.calculationMethod,
        country: args.country,
        state: args.state,
        groupId: person.groupId,
      },
    });

    return {
      calculationId: taxCalculationId,
      ...taxCalculation,
    };
  },
});

// ============================================================================
// Grant Tax Exemption
// ============================================================================

/**
 * Grant tax exemption to a customer
 *
 * CRITICAL:
 * - Only org owners can grant exemptions
 * - Creates tax_exemption thing
 * - Logs tax_exemption_granted event
 */
export const grantTaxExemption = mutation({
  args: {
    customerId: v.id("things"),
    exemptionType: v.union(
      v.literal("tax_exempt_organization"),
      v.literal("resale"),
      v.literal("government"),
      v.literal("diplomatic")
    ),
    certificateNumber: v.optional(v.string()),
    validFrom: v.optional(v.number()),
    validTo: v.optional(v.number()),
    jurisdictions: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. Get user and validate role
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person || !person.groupId) {
      throw new Error("User must belong to a group");
    }

    // Validate user is org owner
    const role = person.properties?.role || "org_user";
    if (role !== "org_owner" && role !== "platform_owner") {
      throw new Error("Only organization owners can grant tax exemptions");
    }

    // 3. Get customer and validate access
    const customer = await ctx.db.get(args.customerId);
    if (!customer || customer.groupId !== person.groupId) {
      throw new Error("Customer not found");
    }

    // 4. Validate exemption data
    const program = Effect.gen(function* () {
      const validated = yield* TaxService.validateTaxExemption({
        customerId: args.customerId,
        exemptionType: args.exemptionType,
        certificateNumber: args.certificateNumber,
        validFrom: args.validFrom || Date.now(),
        validTo: args.validTo,
        jurisdictions: args.jurisdictions,
      });

      return validated;
    });

    await Effect.runPromise(program);

    // 5. Create tax_exemption thing
    const exemptionId = await ctx.db.insert("things", {
      type: "tax_exemption",
      name: `${args.exemptionType} - ${customer.name}`,
      groupId: person.groupId,
      properties: {
        customerId: args.customerId,
        exemptionType: args.exemptionType,
        certificateNumber: args.certificateNumber,
        validFrom: args.validFrom || Date.now(),
        validTo: args.validTo,
        jurisdictions: args.jurisdictions,
        notes: args.notes,
      },
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // 6. Create connection: customer has tax exemption
    await ctx.db.insert("connections", {
      fromThingId: args.customerId,
      toThingId: exemptionId,
      relationshipType: "references",
      metadata: {
        connectionType: "customer_has_tax_exemption",
        exemptionType: args.exemptionType,
      },
      validFrom: args.validFrom || Date.now(),
      validTo: args.validTo,
      createdAt: Date.now(),
    });

    // 7. Log event
    await ctx.db.insert("events", {
      type: "tax_exemption_granted",
      actorId: person._id,
      targetId: exemptionId,
      timestamp: Date.now(),
      metadata: {
        customerId: args.customerId,
        customerName: customer.name,
        exemptionType: args.exemptionType,
        certificateNumber: args.certificateNumber,
        jurisdictions: args.jurisdictions,
        groupId: person.groupId,
      },
    });

    return {
      exemptionId,
      exemptionType: args.exemptionType,
      validFrom: args.validFrom || Date.now(),
      validTo: args.validTo,
    };
  },
});

// ============================================================================
// Revoke Tax Exemption
// ============================================================================

/**
 * Revoke a tax exemption
 */
export const revokeTaxExemption = mutation({
  args: {
    exemptionId: v.id("things"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. Get user and validate role
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person || !person.groupId) {
      throw new Error("User must belong to a group");
    }

    // Validate user is org owner
    const role = person.properties?.role || "org_user";
    if (role !== "org_owner" && role !== "platform_owner") {
      throw new Error("Only organization owners can revoke tax exemptions");
    }

    // 3. Get exemption and validate access
    const exemption = await ctx.db.get(args.exemptionId);
    if (
      !exemption ||
      exemption.type !== "tax_exemption" ||
      exemption.groupId !== person.groupId
    ) {
      throw new Error("Tax exemption not found");
    }

    // 4. Archive exemption (soft delete)
    await ctx.db.patch(args.exemptionId, {
      status: "archived",
      properties: {
        ...exemption.properties,
        revokedAt: Date.now(),
        revokedBy: person._id,
        revokeReason: args.reason,
      },
      updatedAt: Date.now(),
    });

    // 5. Update connection validTo
    const connection = await ctx.db
      .query("connections")
      .withIndex("to_type", (q) =>
        q
          .eq("toThingId", args.exemptionId)
          .eq("relationshipType", "references")
      )
      .first();

    if (connection) {
      await ctx.db.patch(connection._id, {
        validTo: Date.now(),
      });
    }

    // 6. Log event
    await ctx.db.insert("events", {
      type: "entity_archived",
      actorId: person._id,
      targetId: args.exemptionId,
      timestamp: Date.now(),
      metadata: {
        entityType: "tax_exemption",
        customerId: exemption.properties?.customerId,
        exemptionType: exemption.properties?.exemptionType,
        revokeReason: args.reason,
        groupId: person.groupId,
      },
    });

    return {
      exemptionId: args.exemptionId,
      revoked: true,
    };
  },
});

// ============================================================================
// Generate Tax Report
// ============================================================================

/**
 * Generate tax report for filing
 *
 * CRITICAL:
 * - Only org owners can generate reports
 * - Creates tax_report thing
 * - Logs tax_report_generated event
 */
export const generateTaxReport = mutation({
  args: {
    jurisdiction: v.string(), // e.g., "US-CA", "EU", "CA-ON"
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. Get user and validate role
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person || !person.groupId) {
      throw new Error("User must belong to a group");
    }

    // Validate user is org owner
    const role = person.properties?.role || "org_user";
    if (role !== "org_owner" && role !== "platform_owner") {
      throw new Error("Only organization owners can generate tax reports");
    }

    // 3. Get all tax calculations for the period
    const taxCalculations = await ctx.db
      .query("things")
      .withIndex("by_group_type", (q) =>
        q.eq("groupId", person.groupId).eq("type", "tax_calculation")
      )
      .filter(
        (t) =>
          t.createdAt >= args.startDate &&
          t.createdAt <= args.endDate &&
          t.status === "active"
      )
      .collect();

    // 4. Generate report using TaxService
    const program = Effect.gen(function* () {
      const report = yield* TaxService.generateTaxReport(
        taxCalculations.map((calc) => ({
          amount: calc.properties?.subtotal || 0,
          taxAmount: calc.properties?.taxAmount || 0,
          exemptionApplied: calc.properties?.exemptionApplied || false,
          jurisdiction: calc.properties?.state
            ? `${calc.properties?.country}-${calc.properties?.state}`
            : calc.properties?.country,
          createdAt: calc.createdAt,
        })),
        args.jurisdiction,
        args.startDate,
        args.endDate
      );

      return report;
    });

    const report = await Effect.runPromise(program);

    // 5. Create tax_report thing
    const reportId = await ctx.db.insert("things", {
      type: "tax_report",
      name: `Tax Report - ${args.jurisdiction} (${new Date(args.startDate).toLocaleDateString()} - ${new Date(args.endDate).toLocaleDateString()})`,
      groupId: person.groupId,
      properties: {
        jurisdiction: args.jurisdiction,
        startDate: args.startDate,
        endDate: args.endDate,
        totalSales: report.totalSales,
        taxableAmount: report.taxableAmount,
        taxCollected: report.taxCollected,
        exemptAmount: report.exemptAmount,
        transactionCount: report.transactionCount,
        generatedAt: Date.now(),
        generatedBy: person._id,
      },
      status: "published",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // 6. Create connection: person generated report
    await ctx.db.insert("connections", {
      fromThingId: person._id,
      toThingId: reportId,
      relationshipType: "created_by",
      metadata: {
        entityType: "tax_report",
      },
      validFrom: Date.now(),
      createdAt: Date.now(),
    });

    // 7. Log event
    await ctx.db.insert("events", {
      type: "tax_report_generated",
      actorId: person._id,
      targetId: reportId,
      timestamp: Date.now(),
      metadata: {
        jurisdiction: args.jurisdiction,
        startDate: args.startDate,
        endDate: args.endDate,
        totalSales: report.totalSales,
        taxCollected: report.taxCollected,
        transactionCount: report.transactionCount,
        groupId: person.groupId,
      },
    });

    return {
      reportId,
      ...report,
    };
  },
});

// ============================================================================
// Update Tax Rate
// ============================================================================

/**
 * Update an existing tax rate
 */
export const updateTaxRate = mutation({
  args: {
    taxRateId: v.id("things"),
    percentage: v.optional(v.number()),
    displayName: v.optional(v.string()),
    description: v.optional(v.string()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. Get user and validate role
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person || !person.groupId) {
      throw new Error("User must belong to a group");
    }

    // Validate user is org owner
    const role = person.properties?.role || "org_user";
    if (role !== "org_owner" && role !== "platform_owner") {
      throw new Error("Only organization owners can update tax rates");
    }

    // 3. Get tax rate and validate access
    const taxRate = await ctx.db.get(args.taxRateId);
    if (
      !taxRate ||
      taxRate.type !== "tax_rate" ||
      taxRate.groupId !== person.groupId
    ) {
      throw new Error("Tax rate not found");
    }

    // 4. Update tax rate
    await ctx.db.patch(args.taxRateId, {
      name: args.displayName || taxRate.name,
      properties: {
        ...taxRate.properties,
        ...(args.percentage !== undefined && { percentage: args.percentage }),
        ...(args.description !== undefined && { description: args.description }),
        ...(args.active !== undefined && { active: args.active }),
      },
      status: args.active === false ? "archived" : taxRate.status,
      updatedAt: Date.now(),
    });

    // 5. Log event
    await ctx.db.insert("events", {
      type: "entity_updated",
      actorId: person._id,
      targetId: args.taxRateId,
      timestamp: Date.now(),
      metadata: {
        entityType: "tax_rate",
        updatedFields: Object.keys(args).filter((k) => k !== "taxRateId"),
        groupId: person.groupId,
      },
    });

    return {
      taxRateId: args.taxRateId,
      updated: true,
    };
  },
});
