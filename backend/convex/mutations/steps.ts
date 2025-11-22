/**
 * Step Mutations - CYCLE 023
 *
 * CRUD operations for funnel steps following the 6-dimension ontology:
 * - ADD: Create new step in funnel
 * - UPDATE: Modify step properties
 * - REMOVE: Soft delete step from funnel
 * - REORDER: Change step sequence in funnel
 *
 * Key Principles:
 * 1. ALWAYS authenticate user
 * 2. ALWAYS validate groupId (multi-tenant isolation)
 * 3. ALWAYS validate funnel ownership
 * 4. ALWAYS log events (audit trail)
 * 5. ALWAYS update funnel metadata (stepCount, stepSequence)
 * 6. SOFT delete only (status: "archived")
 *
 * @see /one/things/plans/clickfunnels-builder-100-cycles.md
 * @see /backend/CLAUDE.md - Standard mutation patterns
 */

import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Step Types (from cycle plan):
 * - landing_page
 * - sales_page
 * - upsell_page
 * - downsell_page
 * - thank_you_page
 * - webinar_registration
 * - opt_in_page
 */
type StepType =
  | "landing_page"
  | "sales_page"
  | "upsell_page"
  | "downsell_page"
  | "thank_you_page"
  | "webinar_registration"
  | "opt_in_page";

// ============================================================================
// ADD STEP
// ============================================================================

/**
 * Add a new step to a funnel
 *
 * Thing Type: "funnel_step"
 * Connection: "funnel_contains_step" (funnel → step)
 * Event: "step_added"
 * Status: "draft" (requires explicit publish)
 */
export const addStep = mutation({
  args: {
    funnelId: v.id("things"),
    stepType: v.string(), // "landing_page", "sales_page", etc.
    name: v.string(),
    position: v.optional(v.number()), // Position in sequence (0-indexed)
    properties: v.optional(v.any()), // Step-specific configuration
  },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE: Get user identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. GET USER: Find user thing
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person || !person.groupId) {
      throw new Error("User must belong to a group");
    }

    // 3. GET FUNNEL: Verify exists and user has access
    const funnel = await ctx.db.get(args.funnelId);
    if (!funnel || funnel.type !== "funnel") {
      throw new Error("Funnel not found");
    }

    if (funnel.groupId !== person.groupId) {
      throw new Error("Unauthorized: Funnel belongs to different group");
    }

    // 4. VALIDATE FUNNEL STATUS: Can't add steps to archived funnels
    if (funnel.status === "archived") {
      throw new Error("Cannot add steps to archived funnel");
    }

    // 5. CHECK LIMITS: Max 50 steps per funnel (from cycle plan)
    const stepCount = funnel.properties?.stepCount || 0;
    if (stepCount >= 50) {
      throw new Error("Step limit exceeded (max 50 steps per funnel)");
    }

    // 6. VALIDATE STEP TYPE
    const validStepTypes: StepType[] = [
      "landing_page",
      "sales_page",
      "upsell_page",
      "downsell_page",
      "thank_you_page",
      "webinar_registration",
      "opt_in_page",
    ];

    if (!validStepTypes.includes(args.stepType as StepType)) {
      throw new Error(
        `Invalid step type: ${args.stepType}. Must be one of: ${validStepTypes.join(", ")}`
      );
    }

    // 7. CALCULATE SEQUENCE: Append to end or insert at position
    const stepSequence = (funnel.properties?.stepSequence as Id<"things">[]) || [];
    const sequence = args.position ?? stepSequence.length;

    // 8. CREATE STEP: Insert into things table
    const stepId = await ctx.db.insert("things", {
      type: "funnel_step",
      name: args.name,
      groupId: person.groupId,
      properties: {
        stepType: args.stepType,
        sequence, // Position in funnel (0-indexed)
        funnelId: args.funnelId,
        elements: [], // Array of element IDs (populated in Cycle 024)
        settings: {
          // Default step settings
          layout: args.properties?.layout || "default",
          backgroundColor: args.properties?.backgroundColor || "#ffffff",
          customCSS: args.properties?.customCSS || "",
          customJS: args.properties?.customJS || "",
        },
        seo: {
          metaTitle: args.properties?.metaTitle || args.name,
          metaDescription: args.properties?.metaDescription || "",
          ogImage: args.properties?.ogImage || null,
        },
        ...(args.properties || {}),
      },
      status: "draft", // Requires explicit publish
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // 9. CREATE CONNECTION: Link funnel to step
    await ctx.db.insert("connections", {
      fromThingId: args.funnelId,
      toThingId: stepId,
      relationshipType: "funnel_contains_step",
      metadata: {
        sequence,
        stepType: args.stepType,
      },
      validFrom: Date.now(),
      createdAt: Date.now(),
    });

    // 10. UPDATE FUNNEL: Increment step count and update sequence
    const newStepSequence = [...stepSequence];
    newStepSequence.splice(sequence, 0, stepId);

    await ctx.db.patch(args.funnelId, {
      properties: {
        ...funnel.properties,
        stepCount: stepCount + 1,
        stepSequence: newStepSequence,
      },
      updatedAt: Date.now(),
    });

    // 11. LOG EVENT: Audit trail
    await ctx.db.insert("events", {
      type: "step_added",
      actorId: person._id,
      targetId: stepId,
      timestamp: Date.now(),
      metadata: {
        funnelId: args.funnelId,
        funnelName: funnel.name,
        stepName: args.name,
        stepType: args.stepType,
        sequence,
        groupId: person.groupId,
      },
    });

    return stepId;
  },
});

// ============================================================================
// UPDATE STEP
// ============================================================================

/**
 * Update step properties
 *
 * Event: "entity_updated"
 * Validation: Must own funnel containing step
 */
export const updateStep = mutation({
  args: {
    id: v.id("things"),
    name: v.optional(v.string()),
    stepType: v.optional(v.string()),
    properties: v.optional(v.any()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. GET USER
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person || !person.groupId) {
      throw new Error("User must belong to a group");
    }

    // 3. GET STEP: Verify exists and user has access
    const step = await ctx.db.get(args.id);
    if (!step || step.type !== "funnel_step") {
      throw new Error("Step not found");
    }

    if (step.groupId !== person.groupId) {
      throw new Error("Unauthorized: Step belongs to different group");
    }

    // 4. GET FUNNEL: Verify ownership through funnel
    const funnelId = step.properties?.funnelId as Id<"things">;
    if (!funnelId) {
      throw new Error("Step is not associated with a funnel");
    }

    const funnel = await ctx.db.get(funnelId);
    if (!funnel || funnel.groupId !== person.groupId) {
      throw new Error("Unauthorized: Funnel belongs to different group");
    }

    // 5. UPDATE STEP: Merge new properties
    const updatedProperties = {
      ...step.properties,
      ...(args.properties || {}),
    };

    await ctx.db.patch(args.id, {
      ...(args.name && { name: args.name }),
      ...(args.stepType && {
        properties: {
          ...updatedProperties,
          stepType: args.stepType,
        },
      }),
      ...(args.status && { status: args.status }),
      properties: updatedProperties,
      updatedAt: Date.now(),
    });

    // 6. LOG EVENT
    await ctx.db.insert("events", {
      type: "entity_updated",
      actorId: person._id,
      targetId: args.id,
      timestamp: Date.now(),
      metadata: {
        entityType: "funnel_step",
        funnelId,
        stepName: step.name,
        updatedFields: Object.keys(args).filter((k) => k !== "id"),
        groupId: person.groupId,
      },
    });

    return args.id;
  },
});

// ============================================================================
// REMOVE STEP
// ============================================================================

/**
 * Remove step from funnel (soft delete)
 *
 * Event: "step_removed"
 * Status: any → archived
 * Note: Updates funnel stepCount and stepSequence
 */
export const removeStep = mutation({
  args: {
    id: v.id("things"),
  },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. GET USER
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person || !person.groupId) {
      throw new Error("User must belong to a group");
    }

    // 3. GET STEP
    const step = await ctx.db.get(args.id);
    if (!step || step.type !== "funnel_step") {
      throw new Error("Step not found");
    }

    if (step.groupId !== person.groupId) {
      throw new Error("Unauthorized: Step belongs to different group");
    }

    // 4. GET FUNNEL
    const funnelId = step.properties?.funnelId as Id<"things">;
    if (!funnelId) {
      throw new Error("Step is not associated with a funnel");
    }

    const funnel = await ctx.db.get(funnelId);
    if (!funnel || funnel.groupId !== person.groupId) {
      throw new Error("Unauthorized: Funnel belongs to different group");
    }

    // 5. CHECK IF ALREADY ARCHIVED
    if (step.status === "archived") {
      throw new Error("Step is already archived");
    }

    // 6. UPDATE STEP STATUS (SOFT DELETE)
    await ctx.db.patch(args.id, {
      status: "archived",
      updatedAt: Date.now(),
    });

    // 7. UPDATE FUNNEL: Decrement step count and remove from sequence
    const stepCount = funnel.properties?.stepCount || 0;
    const stepSequence = (funnel.properties?.stepSequence as Id<"things">[]) || [];
    const newStepSequence = stepSequence.filter((id) => id !== args.id);

    await ctx.db.patch(funnelId, {
      properties: {
        ...funnel.properties,
        stepCount: Math.max(0, stepCount - 1),
        stepSequence: newStepSequence,
      },
      updatedAt: Date.now(),
    });

    // 8. INVALIDATE CONNECTION: Set validTo on funnel_contains_step connection
    const connection = await ctx.db
      .query("connections")
      .withIndex("from_type", (q) =>
        q.eq("fromThingId", funnelId).eq("relationshipType", "funnel_contains_step")
      )
      .filter((c) => c.toThingId === args.id)
      .first();

    if (connection) {
      await ctx.db.patch(connection._id, {
        validTo: Date.now(),
      });
    }

    // 9. LOG EVENT
    await ctx.db.insert("events", {
      type: "step_removed",
      actorId: person._id,
      targetId: args.id,
      timestamp: Date.now(),
      metadata: {
        funnelId,
        funnelName: funnel.name,
        stepName: step.name,
        stepType: step.properties?.stepType,
        previousStatus: step.status,
        groupId: person.groupId,
      },
    });

    return args.id;
  },
});

// ============================================================================
// REORDER STEPS
// ============================================================================

/**
 * Reorder steps in funnel
 *
 * Event: "step_reordered"
 * Note: Updates funnel stepSequence and step sequence metadata
 */
export const reorderSteps = mutation({
  args: {
    funnelId: v.id("things"),
    stepIds: v.array(v.id("things")), // New order of step IDs
  },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. GET USER
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person || !person.groupId) {
      throw new Error("User must belong to a group");
    }

    // 3. GET FUNNEL
    const funnel = await ctx.db.get(args.funnelId);
    if (!funnel || funnel.type !== "funnel") {
      throw new Error("Funnel not found");
    }

    if (funnel.groupId !== person.groupId) {
      throw new Error("Unauthorized: Funnel belongs to different group");
    }

    // 4. VALIDATE STEP IDS: Ensure all steps exist and belong to funnel
    const currentSequence = (funnel.properties?.stepSequence as Id<"things">[]) || [];

    // Check length matches
    if (args.stepIds.length !== currentSequence.length) {
      throw new Error(
        `Invalid step count: expected ${currentSequence.length}, got ${args.stepIds.length}`
      );
    }

    // Check all IDs are valid and belong to funnel
    for (const stepId of args.stepIds) {
      if (!currentSequence.includes(stepId)) {
        throw new Error(`Step ${stepId} does not belong to funnel`);
      }

      // Verify step exists and belongs to correct group
      const step = await ctx.db.get(stepId);
      if (!step || step.groupId !== person.groupId) {
        throw new Error(`Invalid step: ${stepId}`);
      }
    }

    // 5. UPDATE FUNNEL: Set new sequence
    await ctx.db.patch(args.funnelId, {
      properties: {
        ...funnel.properties,
        stepSequence: args.stepIds,
      },
      updatedAt: Date.now(),
    });

    // 6. UPDATE STEP SEQUENCE METADATA: Update each step's sequence number
    for (let i = 0; i < args.stepIds.length; i++) {
      const stepId = args.stepIds[i];
      const step = await ctx.db.get(stepId);

      if (step) {
        await ctx.db.patch(stepId, {
          properties: {
            ...step.properties,
            sequence: i,
          },
          updatedAt: Date.now(),
        });
      }
    }

    // 7. UPDATE CONNECTIONS: Update sequence metadata in connections
    for (let i = 0; i < args.stepIds.length; i++) {
      const stepId = args.stepIds[i];

      const connection = await ctx.db
        .query("connections")
        .withIndex("from_type", (q) =>
          q
            .eq("fromThingId", args.funnelId)
            .eq("relationshipType", "funnel_contains_step")
        )
        .filter((c) => c.toThingId === stepId)
        .first();

      if (connection) {
        await ctx.db.patch(connection._id, {
          metadata: {
            ...connection.metadata,
            sequence: i,
          },
        });
      }
    }

    // 8. LOG EVENT
    await ctx.db.insert("events", {
      type: "step_reordered",
      actorId: person._id,
      targetId: args.funnelId,
      timestamp: Date.now(),
      metadata: {
        funnelId: args.funnelId,
        funnelName: funnel.name,
        previousSequence: currentSequence,
        newSequence: args.stepIds,
        groupId: person.groupId,
      },
    });

    return args.funnelId;
  },
});
