/**
 * Funnel Step Queries
 *
 * CYCLE-022: Read operations for funnel steps with multi-tenant scoping.
 *
 * Step Type: funnel_step
 * Properties:
 * - funnelId: Reference to parent funnel
 * - sequence: Order in funnel (0-indexed)
 * - slug: URL-safe identifier
 * - pageType: Type of page (landing, checkout, upsell, downsell, thank-you)
 * - settings: Page configuration (SEO, tracking, custom code)
 * - design: Visual configuration (theme, layout, colors)
 *
 * Connections:
 * - funnel_contains_step: Links funnel to steps in sequence
 * - step_contains_element: Links step to UI elements
 *
 * @see /one/things/plans/clickfunnels-builder-100-cycles.md - CYCLE-022
 * @see /backend/convex/schema.ts - things table definition
 */

import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get all steps for a specific funnel
 *
 * Returns steps ordered by sequence number.
 * Multi-tenant: Only returns steps for funnels in user's group.
 *
 * @param funnelId - The funnel to get steps for
 * @returns Array of funnel_step things ordered by sequence
 */
export const getStepsByFunnel = query({
  args: {
    funnelId: v.id("things"),
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

    if (!person?.groupId) {
      return [];
    }

    // 3. Verify funnel exists and belongs to user's group
    const funnel = await ctx.db.get(args.funnelId);
    if (!funnel || funnel.groupId !== person.groupId) {
      return [];
    }

    // 4. Get all funnel_contains_step connections for this funnel
    const connections = await ctx.db
      .query("connections")
      .withIndex("from_type", (q) =>
        q.eq("fromThingId", args.funnelId).eq("relationshipType", "funnel_contains_step")
      )
      .collect();

    // 5. Get all steps referenced in connections
    const stepIds = connections.map((conn) => conn.toThingId);
    const steps = await Promise.all(
      stepIds.map((stepId) => ctx.db.get(stepId))
    );

    // 6. Filter out null values and verify group ownership
    const validSteps = steps.filter(
      (step) => step !== null && step.groupId === person.groupId
    );

    // 7. Sort by sequence (stored in step properties)
    const sortedSteps = validSteps.sort((a, b) => {
      const seqA = a?.properties?.sequence ?? 0;
      const seqB = b?.properties?.sequence ?? 0;
      return seqA - seqB;
    });

    // 8. Enrich with connection metadata
    return sortedSteps.map((step) => {
      const connection = connections.find((c) => c.toThingId === step._id);
      return {
        ...step,
        connectionMetadata: connection?.metadata,
      };
    });
  },
});

/**
 * Get a single step by ID
 *
 * Multi-tenant: Only returns step if it belongs to user's group.
 *
 * @param id - The step ID
 * @returns The funnel_step thing or null if not found/unauthorized
 */
export const getStep = query({
  args: {
    id: v.id("things"),
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

    if (!person?.groupId) {
      return null;
    }

    // 3. Get step and verify group ownership
    const step = await ctx.db.get(args.id);
    if (!step || step.groupId !== person.groupId) {
      return null; // Not found or unauthorized
    }

    // 4. Verify it's actually a funnel_step
    if (step.type !== "funnel_step") {
      return null;
    }

    // 5. Get associated elements (optional enrichment)
    const elementConnections = await ctx.db
      .query("connections")
      .withIndex("from_type", (q) =>
        q.eq("fromThingId", step._id).eq("relationshipType", "step_contains_element")
      )
      .collect();

    // 6. Get funnel this step belongs to
    const funnelConnection = await ctx.db
      .query("connections")
      .withIndex("to_type", (q) =>
        q.eq("toThingId", step._id).eq("relationshipType", "funnel_contains_step")
      )
      .first();

    return {
      ...step,
      elementCount: elementConnections.length,
      funnelId: funnelConnection?.fromThingId ?? null,
    };
  },
});

/**
 * Get published steps for a funnel
 *
 * Returns only steps with status = "published".
 * Used for rendering live funnel to visitors.
 *
 * @param funnelId - The funnel to get published steps for
 * @returns Array of published funnel_step things ordered by sequence
 */
export const getPublishedSteps = query({
  args: {
    funnelId: v.id("things"),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate (optional for public funnels, but we'll verify funnel status)
    const identity = await ctx.auth.getUserIdentity();

    // 2. Get funnel and check if it's published
    const funnel = await ctx.db.get(args.funnelId);
    if (!funnel) {
      return [];
    }

    // 3. Only return steps if funnel itself is published
    if (funnel.status !== "published") {
      // If user is authenticated and owns the funnel, allow preview
      if (identity) {
        const person = await ctx.db
          .query("things")
          .withIndex("by_type", (q) => q.eq("type", "creator"))
          .filter((t) => t.properties?.email === identity.email)
          .first();

        // If not the owner, return empty
        if (!person || funnel.groupId !== person.groupId) {
          return [];
        }
      } else {
        // Not authenticated and funnel not published
        return [];
      }
    }

    // 4. Get all funnel_contains_step connections
    const connections = await ctx.db
      .query("connections")
      .withIndex("from_type", (q) =>
        q.eq("fromThingId", args.funnelId).eq("relationshipType", "funnel_contains_step")
      )
      .collect();

    // 5. Get all steps
    const stepIds = connections.map((conn) => conn.toThingId);
    const steps = await Promise.all(
      stepIds.map((stepId) => ctx.db.get(stepId))
    );

    // 6. Filter for published steps only
    const publishedSteps = steps.filter(
      (step) => step !== null && step.status === "published"
    );

    // 7. Sort by sequence
    const sortedSteps = publishedSteps.sort((a, b) => {
      const seqA = a?.properties?.sequence ?? 0;
      const seqB = b?.properties?.sequence ?? 0;
      return seqA - seqB;
    });

    return sortedSteps;
  },
});

/**
 * Get step by funnel and slug
 *
 * Useful for rendering specific pages in the funnel by URL.
 * Example: /f/my-funnel/landing-page
 *
 * @param funnelId - The funnel ID
 * @param slug - The step's URL slug
 * @returns The funnel_step thing or null if not found
 */
export const getStepBySlug = query({
  args: {
    funnelId: v.id("things"),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Get funnel
    const funnel = await ctx.db.get(args.funnelId);
    if (!funnel) {
      return null;
    }

    // 2. Get all steps for this funnel
    const connections = await ctx.db
      .query("connections")
      .withIndex("from_type", (q) =>
        q.eq("fromThingId", args.funnelId).eq("relationshipType", "funnel_contains_step")
      )
      .collect();

    // 3. Get all steps and find matching slug
    const stepIds = connections.map((conn) => conn.toThingId);
    const steps = await Promise.all(
      stepIds.map((stepId) => ctx.db.get(stepId))
    );

    // 4. Find step with matching slug
    const matchingStep = steps.find(
      (step) =>
        step !== null &&
        step.type === "funnel_step" &&
        step.properties?.slug === args.slug
    );

    return matchingStep ?? null;
  },
});

/**
 * Get step with full details (including elements)
 *
 * Returns step with all associated page elements.
 * Used in the funnel builder editor.
 *
 * @param id - The step ID
 * @returns Step with elements array
 */
export const getStepWithElements = query({
  args: {
    id: v.id("things"),
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

    if (!person?.groupId) {
      return null;
    }

    // 3. Get step and verify ownership
    const step = await ctx.db.get(args.id);
    if (!step || step.groupId !== person.groupId || step.type !== "funnel_step") {
      return null;
    }

    // 4. Get all elements for this step
    const elementConnections = await ctx.db
      .query("connections")
      .withIndex("from_type", (q) =>
        q.eq("fromThingId", step._id).eq("relationshipType", "step_contains_element")
      )
      .collect();

    // 5. Fetch all element things
    const elementIds = elementConnections.map((conn) => conn.toThingId);
    const elements = await Promise.all(
      elementIds.map((elementId) => ctx.db.get(elementId))
    );

    // 6. Filter valid elements and sort by position
    const validElements = elements
      .filter((el) => el !== null && el.groupId === person.groupId)
      .sort((a, b) => {
        const posA = a?.properties?.position ?? 0;
        const posB = b?.properties?.position ?? 0;
        return posA - posB;
      });

    return {
      ...step,
      elements: validElements,
    };
  },
});
