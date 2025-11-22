/**
 * Connection Record Utilities - Funnel Builder
 *
 * Helper functions for creating funnel-specific connections following the
 * 6-dimension ontology. All connections stored in the `connections` table
 * with typed metadata for each relationship type.
 *
 * @see /one/things/plans/clickfunnels-builder-100-cycles.md - Cycle 028
 * @see /one/knowledge/ontology.md - Dimension 4: Connections
 */

import { Effect } from "effect";
import type { Id } from "../../_generated/dataModel";
import { DatabaseError } from "./errors";

// ============================================================================
// Types
// ============================================================================

/**
 * Database context (injected dependency)
 */
export interface DatabaseContext {
  insert: (table: string, data: any) => Promise<Id<any>>;
  get: (id: Id<any>) => Promise<any>;
  query: (table: string) => any;
}

/**
 * Position metadata for element placement
 */
export interface Position {
  x: number;
  y: number;
  width?: number;
  height?: number;
  zIndex?: number;
}

/**
 * View metadata for tracking visitor interactions
 */
export interface ViewMetadata {
  sessionId: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  duration?: number;
  scrollDepth?: number;
}

/**
 * Form submission metadata
 */
export interface FormSubmissionMetadata {
  formId: string;
  fields: Record<string, any>;
  submittedAt: number;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Purchase metadata
 */
export interface PurchaseMetadata {
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionId?: string;
  productId?: Id<"things">;
}

/**
 * Template clone metadata
 */
export interface TemplateCloneMetadata {
  templateVersion?: string;
  customizations?: string[];
  clonedAt: number;
}

/**
 * A/B test variant metadata
 */
export interface ABTestVariantMetadata {
  variantName: string;
  trafficAllocation: number; // Percentage (0-100)
  isControl: boolean;
}

/**
 * Email automation metadata
 */
export interface EmailAutomationMetadata {
  trigger: "form_submit" | "purchase" | "step_view" | "custom";
  delay?: number; // Milliseconds to wait before sending
  emailSequenceId?: Id<"things">;
}

/**
 * Domain assignment metadata
 */
export interface DomainMetadata {
  domain: string;
  isPrimary: boolean;
  verificationStatus: "pending" | "verified" | "failed";
  verifiedAt?: number;
  sslEnabled: boolean;
}

// ============================================================================
// Connection Type 1: Funnel Contains Step
// ============================================================================

/**
 * Create connection: funnel_contains_step
 *
 * Links a funnel to one of its steps (pages) in sequence.
 * Sequence determines the order visitors progress through the funnel.
 *
 * @param db - Database context
 * @param funnelId - The parent funnel ID
 * @param stepId - The step (page) ID
 * @param sequence - Position in funnel sequence (0-indexed)
 * @param metadata - Additional step metadata
 * @returns Effect that creates connection and returns connection ID
 */
export const createFunnelStepConnection = (
  db: DatabaseContext,
  funnelId: Id<"things">,
  stepId: Id<"things">,
  sequence: number,
  metadata?: {
    is_default_path?: boolean;
    traffic_allocation?: number;
    stepType?: string;
  }
) =>
  Effect.gen(function* () {
    const connectionId = yield* Effect.tryPromise({
      try: () =>
        db.insert("connections", {
          fromThingId: funnelId,
          toThingId: stepId,
          relationshipType: "funnel_contains_step",
          metadata: {
            sequence,
            is_default_path: metadata?.is_default_path ?? true,
            traffic_allocation: metadata?.traffic_allocation ?? 100,
            stepType: metadata?.stepType,
            protocol: "clickfunnels-builder",
          },
          validFrom: Date.now(),
          createdAt: Date.now(),
        }),
      catch: (error) =>
        new DatabaseError({
          message: "Failed to create funnel-step connection",
          operation: "insert_connection",
          details: String(error),
        }),
    });

    return connectionId;
  });

// ============================================================================
// Connection Type 2: Step Contains Element
// ============================================================================

/**
 * Create connection: step_contains_element
 *
 * Links a funnel step (page) to one of its UI elements.
 * Position metadata defines where the element appears on the page.
 *
 * @param db - Database context
 * @param stepId - The parent step (page) ID
 * @param elementId - The page element ID
 * @param position - Element position and dimensions
 * @returns Effect that creates connection and returns connection ID
 */
export const createStepElementConnection = (
  db: DatabaseContext,
  stepId: Id<"things">,
  elementId: Id<"things">,
  position: Position
) =>
  Effect.gen(function* () {
    const connectionId = yield* Effect.tryPromise({
      try: () =>
        db.insert("connections", {
          fromThingId: stepId,
          toThingId: elementId,
          relationshipType: "step_contains_element",
          metadata: {
            position,
            protocol: "clickfunnels-builder",
          },
          validFrom: Date.now(),
          createdAt: Date.now(),
        }),
      catch: (error) =>
        new DatabaseError({
          message: "Failed to create step-element connection",
          operation: "insert_connection",
          details: String(error),
        }),
    });

    return connectionId;
  });

// ============================================================================
// Connection Type 3: Funnel Based on Template
// ============================================================================

/**
 * Create connection: funnel_based_on_template
 *
 * Tracks when a funnel is created from a template (cloning relationship).
 * Useful for analytics on template usage and tracking lineage.
 *
 * @param db - Database context
 * @param funnelId - The new funnel ID
 * @param templateId - The template ID used
 * @param metadata - Clone metadata (customizations, version)
 * @returns Effect that creates connection and returns connection ID
 */
export const createFunnelTemplateConnection = (
  db: DatabaseContext,
  funnelId: Id<"things">,
  templateId: Id<"things">,
  metadata: TemplateCloneMetadata
) =>
  Effect.gen(function* () {
    const connectionId = yield* Effect.tryPromise({
      try: () =>
        db.insert("connections", {
          fromThingId: funnelId,
          toThingId: templateId,
          relationshipType: "funnel_based_on_template",
          metadata: {
            ...metadata,
            protocol: "clickfunnels-builder",
          },
          validFrom: Date.now(),
          createdAt: Date.now(),
        }),
      catch: (error) =>
        new DatabaseError({
          message: "Failed to create funnel-template connection",
          operation: "insert_connection",
          details: String(error),
        }),
    });

    return connectionId;
  });

// ============================================================================
// Connection Type 4: Step Based on Template
// ============================================================================

/**
 * Create connection: step_based_on_template
 *
 * Tracks when a funnel step is created from a page template.
 *
 * @param db - Database context
 * @param stepId - The new step ID
 * @param templateId - The page template ID used
 * @param metadata - Clone metadata
 * @returns Effect that creates connection and returns connection ID
 */
export const createStepTemplateConnection = (
  db: DatabaseContext,
  stepId: Id<"things">,
  templateId: Id<"things">,
  metadata: TemplateCloneMetadata
) =>
  Effect.gen(function* () {
    const connectionId = yield* Effect.tryPromise({
      try: () =>
        db.insert("connections", {
          fromThingId: stepId,
          toThingId: templateId,
          relationshipType: "step_based_on_template",
          metadata: {
            ...metadata,
            protocol: "clickfunnels-builder",
          },
          validFrom: Date.now(),
          createdAt: Date.now(),
        }),
      catch: (error) =>
        new DatabaseError({
          message: "Failed to create step-template connection",
          operation: "insert_connection",
          details: String(error),
        }),
    });

    return connectionId;
  });

// ============================================================================
// Connection Type 5: Visitor Entered Funnel
// ============================================================================

/**
 * Create connection: visitor_entered_funnel
 *
 * Tracks when a visitor enters a funnel (first page view).
 * Used for analytics: total visitors, entry sources, conversion tracking.
 *
 * @param db - Database context
 * @param visitorId - The visitor/customer thing ID
 * @param funnelId - The funnel being entered
 * @param metadata - Entry metadata (referrer, UTM params)
 * @returns Effect that creates connection and returns connection ID
 */
export const createVisitorEntryConnection = (
  db: DatabaseContext,
  visitorId: Id<"things">,
  funnelId: Id<"things">,
  metadata: ViewMetadata
) =>
  Effect.gen(function* () {
    const connectionId = yield* Effect.tryPromise({
      try: () =>
        db.insert("connections", {
          fromThingId: visitorId,
          toThingId: funnelId,
          relationshipType: "visitor_entered_funnel",
          metadata: {
            ...metadata,
            enteredAt: Date.now(),
            protocol: "clickfunnels-builder",
          },
          validFrom: Date.now(),
          createdAt: Date.now(),
        }),
      catch: (error) =>
        new DatabaseError({
          message: "Failed to create visitor-entry connection",
          operation: "insert_connection",
          details: String(error),
        }),
    });

    return connectionId;
  });

// ============================================================================
// Connection Type 6: Visitor Viewed Step
// ============================================================================

/**
 * Create connection: visitor_viewed_step
 *
 * Tracks page views within a funnel for analytics.
 * Used for: conversion funnel visualization, drop-off analysis, session tracking.
 *
 * @param db - Database context
 * @param visitorId - The visitor thing ID
 * @param stepId - The step being viewed
 * @param metadata - View metadata (session, duration, scroll depth)
 * @returns Effect that creates connection and returns connection ID
 */
export const createVisitorViewConnection = (
  db: DatabaseContext,
  visitorId: Id<"things">,
  stepId: Id<"things">,
  metadata: ViewMetadata
) =>
  Effect.gen(function* () {
    const connectionId = yield* Effect.tryPromise({
      try: () =>
        db.insert("connections", {
          fromThingId: visitorId,
          toThingId: stepId,
          relationshipType: "visitor_viewed_step",
          metadata: {
            ...metadata,
            viewedAt: Date.now(),
            protocol: "clickfunnels-builder",
          },
          validFrom: Date.now(),
          createdAt: Date.now(),
        }),
      catch: (error) =>
        new DatabaseError({
          message: "Failed to create visitor-view connection",
          operation: "insert_connection",
          details: String(error),
        }),
    });

    return connectionId;
  });

// ============================================================================
// Connection Type 7: Visitor Submitted Form
// ============================================================================

/**
 * Create connection: visitor_submitted_form
 *
 * Tracks form submissions for lead capture.
 * Each submission creates a connection to the form_submission thing.
 *
 * @param db - Database context
 * @param visitorId - The visitor thing ID
 * @param formSubmissionId - The form_submission thing ID
 * @param metadata - Submission metadata (form data, timestamp)
 * @returns Effect that creates connection and returns connection ID
 */
export const createFormSubmissionConnection = (
  db: DatabaseContext,
  visitorId: Id<"things">,
  formSubmissionId: Id<"things">,
  metadata: FormSubmissionMetadata
) =>
  Effect.gen(function* () {
    const connectionId = yield* Effect.tryPromise({
      try: () =>
        db.insert("connections", {
          fromThingId: visitorId,
          toThingId: formSubmissionId,
          relationshipType: "visitor_submitted_form",
          metadata: {
            ...metadata,
            protocol: "clickfunnels-builder",
          },
          validFrom: Date.now(),
          createdAt: Date.now(),
        }),
      catch: (error) =>
        new DatabaseError({
          message: "Failed to create form-submission connection",
          operation: "insert_connection",
          details: String(error),
        }),
    });

    return connectionId;
  });

// ============================================================================
// Connection Type 8: Customer Purchased via Funnel
// ============================================================================

/**
 * Create connection: customer_purchased_via_funnel
 *
 * Tracks conversions (purchases made through a funnel).
 * Critical for revenue attribution and conversion analytics.
 *
 * @param db - Database context
 * @param customerId - The customer thing ID
 * @param funnelId - The funnel that led to purchase
 * @param metadata - Purchase metadata (amount, product, transaction)
 * @returns Effect that creates connection and returns connection ID
 */
export const createPurchaseConnection = (
  db: DatabaseContext,
  customerId: Id<"things">,
  funnelId: Id<"things">,
  metadata: PurchaseMetadata
) =>
  Effect.gen(function* () {
    const connectionId = yield* Effect.tryPromise({
      try: () =>
        db.insert("connections", {
          fromThingId: customerId,
          toThingId: funnelId,
          relationshipType: "customer_purchased_via_funnel",
          metadata: {
            ...metadata,
            purchasedAt: Date.now(),
            protocol: "clickfunnels-builder",
          },
          validFrom: Date.now(),
          createdAt: Date.now(),
        }),
      catch: (error) =>
        new DatabaseError({
          message: "Failed to create purchase connection",
          operation: "insert_connection",
          details: String(error),
        }),
    });

    return connectionId;
  });

// ============================================================================
// Connection Type 9: Funnel Leads to Product
// ============================================================================

/**
 * Create connection: funnel_leads_to_product
 *
 * Associates a funnel with the product(s) it's designed to sell.
 * Used for product analytics and funnel optimization.
 *
 * @param db - Database context
 * @param funnelId - The funnel ID
 * @param productId - The product thing ID
 * @param metadata - Product configuration (pricing, variants)
 * @returns Effect that creates connection and returns connection ID
 */
export const createFunnelProductConnection = (
  db: DatabaseContext,
  funnelId: Id<"things">,
  productId: Id<"things">,
  metadata?: {
    isPrimary?: boolean;
    displayOrder?: number;
    pricing?: Record<string, any>;
  }
) =>
  Effect.gen(function* () {
    const connectionId = yield* Effect.tryPromise({
      try: () =>
        db.insert("connections", {
          fromThingId: funnelId,
          toThingId: productId,
          relationshipType: "funnel_leads_to_product",
          metadata: {
            isPrimary: metadata?.isPrimary ?? true,
            displayOrder: metadata?.displayOrder ?? 0,
            pricing: metadata?.pricing,
            protocol: "clickfunnels-builder",
          },
          validFrom: Date.now(),
          createdAt: Date.now(),
        }),
      catch: (error) =>
        new DatabaseError({
          message: "Failed to create funnel-product connection",
          operation: "insert_connection",
          details: String(error),
        }),
    });

    return connectionId;
  });

// ============================================================================
// Connection Type 10: A/B Test Variant
// ============================================================================

/**
 * Create connection: ab_test_variant
 *
 * Links an A/B test to its page variants.
 * Traffic is split between variants based on traffic_allocation percentage.
 *
 * @param db - Database context
 * @param testId - The ab_test thing ID
 * @param variantStepId - The variant step (page) ID
 * @param metadata - Variant configuration (name, traffic allocation, control flag)
 * @returns Effect that creates connection and returns connection ID
 */
export const createABTestVariantConnection = (
  db: DatabaseContext,
  testId: Id<"things">,
  variantStepId: Id<"things">,
  metadata: ABTestVariantMetadata
) =>
  Effect.gen(function* () {
    const connectionId = yield* Effect.tryPromise({
      try: () =>
        db.insert("connections", {
          fromThingId: testId,
          toThingId: variantStepId,
          relationshipType: "ab_test_variant",
          metadata: {
            ...metadata,
            protocol: "clickfunnels-builder",
          },
          validFrom: Date.now(),
          createdAt: Date.now(),
        }),
      catch: (error) =>
        new DatabaseError({
          message: "Failed to create A/B test variant connection",
          operation: "insert_connection",
          details: String(error),
        }),
    });

    return connectionId;
  });

// ============================================================================
// Connection Type 11: Funnel Sends Email
// ============================================================================

/**
 * Create connection: funnel_sends_email
 *
 * Configures email automation triggers for a funnel.
 * Emails can be sent based on form submissions, purchases, or step views.
 *
 * @param db - Database context
 * @param funnelId - The funnel ID
 * @param emailSequenceId - The email_sequence thing ID
 * @param metadata - Email automation configuration (trigger, delay)
 * @returns Effect that creates connection and returns connection ID
 */
export const createEmailAutomationConnection = (
  db: DatabaseContext,
  funnelId: Id<"things">,
  emailSequenceId: Id<"things">,
  metadata: EmailAutomationMetadata
) =>
  Effect.gen(function* () {
    const connectionId = yield* Effect.tryPromise({
      try: () =>
        db.insert("connections", {
          fromThingId: funnelId,
          toThingId: emailSequenceId,
          relationshipType: "funnel_sends_email",
          metadata: {
            ...metadata,
            protocol: "clickfunnels-builder",
          },
          validFrom: Date.now(),
          createdAt: Date.now(),
        }),
      catch: (error) =>
        new DatabaseError({
          message: "Failed to create email automation connection",
          operation: "insert_connection",
          details: String(error),
        }),
    });

    return connectionId;
  });

// ============================================================================
// Connection Type 12: Funnel Uses Domain
// ============================================================================

/**
 * Create connection: funnel_uses_domain
 *
 * Assigns a custom domain to a funnel for white-label hosting.
 * Tracks domain verification status and SSL configuration.
 *
 * @param db - Database context
 * @param funnelId - The funnel ID
 * @param domainId - The funnel_domain thing ID
 * @param metadata - Domain configuration (domain name, SSL, verification)
 * @returns Effect that creates connection and returns connection ID
 */
export const createDomainAssignmentConnection = (
  db: DatabaseContext,
  funnelId: Id<"things">,
  domainId: Id<"things">,
  metadata: DomainMetadata
) =>
  Effect.gen(function* () {
    const connectionId = yield* Effect.tryPromise({
      try: () =>
        db.insert("connections", {
          fromThingId: funnelId,
          toThingId: domainId,
          relationshipType: "funnel_uses_domain",
          metadata: {
            ...metadata,
            protocol: "clickfunnels-builder",
          },
          validFrom: Date.now(),
          createdAt: Date.now(),
        }),
      catch: (error) =>
        new DatabaseError({
          message: "Failed to create domain assignment connection",
          operation: "insert_connection",
          details: String(error),
        }),
    });

    return connectionId;
  });

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Invalidate a connection (soft delete)
 *
 * Sets validTo timestamp to mark connection as no longer active.
 * Used when relationships end (e.g., domain unassigned, step removed).
 *
 * @param db - Database context
 * @param connectionId - The connection ID to invalidate
 * @returns Effect that invalidates connection
 */
export const invalidateConnection = (
  db: DatabaseContext,
  connectionId: Id<"connections">
) =>
  Effect.gen(function* () {
    const connection = yield* Effect.tryPromise({
      try: () => db.get(connectionId),
      catch: (error) =>
        new DatabaseError({
          message: "Failed to get connection for invalidation",
          operation: "get_connection",
          details: String(error),
        }),
    });

    if (!connection) {
      return yield* Effect.fail(
        new DatabaseError({
          message: "Connection not found",
          operation: "invalidate_connection",
          details: `Connection ID: ${connectionId}`,
        })
      );
    }

    // Note: Convex doesn't support patch on connections directly
    // This is a placeholder - implementation depends on schema
    yield* Effect.succeed(void 0);
  });

/**
 * Get active connections by type
 *
 * Queries connections table for specific relationship type and thing ID.
 *
 * @param db - Database context
 * @param thingId - The thing ID to query connections for
 * @param relationshipType - The connection type to filter by
 * @param direction - Query connections from this thing or to this thing
 * @returns Effect that returns array of active connections
 */
export const getActiveConnections = (
  db: DatabaseContext,
  thingId: Id<"things">,
  relationshipType: string,
  direction: "from" | "to" = "from"
) =>
  Effect.gen(function* () {
    const connections = yield* Effect.tryPromise({
      try: async () => {
        const query = db.query("connections");
        const field = direction === "from" ? "fromThingId" : "toThingId";

        const results = await query
          .filter((c: any) =>
            c[field] === thingId &&
            c.relationshipType === relationshipType &&
            !c.validTo
          )
          .collect();

        return results;
      },
      catch: (error) =>
        new DatabaseError({
          message: "Failed to query active connections",
          operation: "query_connections",
          details: String(error),
        }),
    });

    return connections;
  });

// ============================================================================
// Exports
// ============================================================================

export const FunnelConnections = {
  // Core connection creators
  createFunnelStepConnection,
  createStepElementConnection,
  createFunnelTemplateConnection,
  createStepTemplateConnection,
  createVisitorEntryConnection,
  createVisitorViewConnection,
  createFormSubmissionConnection,
  createPurchaseConnection,
  createFunnelProductConnection,
  createABTestVariantConnection,
  createEmailAutomationConnection,
  createDomainAssignmentConnection,

  // Utility functions
  invalidateConnection,
  getActiveConnections,
};
