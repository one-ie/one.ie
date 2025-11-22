/**
 * Element Mutations - CYCLE 026
 *
 * CRUD operations for page elements following the 6-dimension ontology:
 * - ADD: Create new element on a step
 * - UPDATE: Modify element properties or styling
 * - UPDATE_POSITION: Move/resize element on canvas
 * - REMOVE: Soft delete element
 *
 * Key Principles:
 * 1. ALWAYS authenticate user
 * 2. ALWAYS validate groupId (multi-tenant isolation)
 * 3. ALWAYS log events (audit trail)
 * 4. SOFT delete only (status: "archived")
 * 5. Type-safe with Convex validators
 * 6. Create connections to parent step
 *
 * Element Types (37 total):
 * - TEXT: headline, subheadline, paragraph, bullet_list, testimonial_text
 * - MEDIA: image, video, audio_player, image_gallery, background_video
 * - FORMS: input_field, textarea, select_dropdown, checkbox, radio_buttons, submit_button, multi_step_form
 * - COMMERCE: pricing_table, buy_button, product_card, cart_summary, order_bump_checkbox, coupon_code_input
 * - SOCIAL_PROOF: testimonial_card, review_stars, trust_badges, social_media_feed, customer_count_ticker
 * - URGENCY: countdown_timer, stock_counter, limited_offer_banner, exit_intent_popup
 * - INTERACTIVE: faq_accordion, tabs, progress_bar, quiz_survey, calendar_booking, live_chat_widget
 *
 * @see /one/things/plans/clickfunnels-builder-100-cycles.md
 * @see /one/things/plans/cycle-005-page-element-types.md
 * @see /backend/CLAUDE.md - Standard mutation patterns
 */

import { mutation } from "../_generated/server";
import { v } from "convex/values";

// ============================================================================
// VALID ELEMENT TYPES
// ============================================================================

const VALID_ELEMENT_TYPES = [
  // TEXT (5)
  "headline",
  "subheadline",
  "paragraph",
  "bullet_list",
  "testimonial_text",
  // MEDIA (5)
  "image",
  "video",
  "audio_player",
  "image_gallery",
  "background_video",
  // FORMS (7)
  "input_field",
  "textarea",
  "select_dropdown",
  "checkbox",
  "radio_buttons",
  "submit_button",
  "multi_step_form",
  // COMMERCE (6)
  "pricing_table",
  "buy_button",
  "product_card",
  "cart_summary",
  "order_bump_checkbox",
  "coupon_code_input",
  // SOCIAL PROOF (5)
  "testimonial_card",
  "review_stars",
  "trust_badges",
  "social_media_feed",
  "customer_count_ticker",
  // URGENCY (4)
  "countdown_timer",
  "stock_counter",
  "limited_offer_banner",
  "exit_intent_popup",
  // INTERACTIVE (6)
  "faq_accordion",
  "tabs",
  "progress_bar",
  "quiz_survey",
  "calendar_booking",
  "live_chat_widget",
] as const;

// ============================================================================
// ADD ELEMENT
// ============================================================================

/**
 * Add a new element to a funnel step
 *
 * Thing Type: "page_element"
 * Connection: "step_contains_element" (step → element)
 * Event: "element_added"
 * Status: "active"
 */
export const addElement = mutation({
  args: {
    stepId: v.id("things"),
    elementType: v.string(), // One of VALID_ELEMENT_TYPES
    name: v.optional(v.string()), // Display name for element
    settings: v.any(), // Element-specific settings (text, url, fields, etc.)
    styling: v.optional(v.any()), // CSS properties (color, fontSize, padding, etc.)
    position: v.object({
      x: v.number(), // X coordinate on canvas
      y: v.number(), // Y coordinate on canvas
      width: v.number(), // Width in px or %
      height: v.number(), // Height in px or %
      zIndex: v.number(), // Layer order
    }),
    responsive: v.optional(v.any()), // Mobile/tablet/desktop breakpoints
    visibility: v.optional(v.any()), // Show/hide rules
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

    // 3. VALIDATE ELEMENT TYPE: Ensure valid element type
    if (!(VALID_ELEMENT_TYPES as readonly string[]).includes(args.elementType)) {
      throw new Error(
        `Invalid element type: ${args.elementType}. Must be one of: ${VALID_ELEMENT_TYPES.join(", ")}`
      );
    }

    // 4. GET STEP: Verify step exists and user has access
    const step = await ctx.db.get(args.stepId);
    if (!step || step.type !== "funnel_step") {
      throw new Error("Step not found");
    }

    if (step.groupId !== person.groupId) {
      throw new Error("Unauthorized: Step belongs to different group");
    }

    // 5. CHECK LIMITS: Max 100 elements per step
    const existingElements = await ctx.db
      .query("connections")
      .withIndex("from_type", (q) =>
        q.eq("fromThingId", args.stepId).eq("relationshipType", "step_contains_element")
      )
      .collect();

    if (existingElements.length >= 100) {
      throw new Error("Element limit exceeded (max 100 per step)");
    }

    // 6. GENERATE DEFAULT NAME: If not provided
    const elementName = args.name || `${args.elementType}_${Date.now()}`;

    // 7. CREATE ELEMENT: Insert into things table
    const elementId = await ctx.db.insert("things", {
      type: "page_element",
      name: elementName,
      groupId: person.groupId,
      properties: {
        elementType: args.elementType,
        settings: args.settings || {},
        styling: args.styling || {},
        position: args.position,
        responsive: args.responsive || {
          mobile: { visible: true },
          tablet: { visible: true },
          desktop: { visible: true },
        },
        visibility: args.visibility || {
          hidden: false,
          conditions: [],
        },
      },
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // 8. CREATE CONNECTION: Link element to step
    await ctx.db.insert("connections", {
      fromThingId: args.stepId,
      toThingId: elementId,
      relationshipType: "step_contains_element",
      metadata: {
        position: args.position,
        sequence: existingElements.length + 1, // Order on page
      },
      validFrom: Date.now(),
      createdAt: Date.now(),
    });

    // 9. UPDATE STEP: Increment element count
    const currentElementCount = step.properties?.elementCount || 0;
    await ctx.db.patch(args.stepId, {
      properties: {
        ...step.properties,
        elementCount: currentElementCount + 1,
      },
      updatedAt: Date.now(),
    });

    // 10. LOG EVENT: Audit trail
    await ctx.db.insert("events", {
      type: "element_added",
      actorId: person._id,
      targetId: elementId,
      timestamp: Date.now(),
      metadata: {
        elementType: args.elementType,
        elementName,
        stepId: args.stepId,
        position: args.position,
        groupId: person.groupId,
      },
    });

    return elementId;
  },
});

// ============================================================================
// UPDATE ELEMENT
// ============================================================================

/**
 * Update element properties, settings, or styling
 *
 * Event: "element_updated"
 * Validation: Must own element via groupId
 */
export const updateElement = mutation({
  args: {
    id: v.id("things"),
    name: v.optional(v.string()),
    settings: v.optional(v.any()), // Merge with existing settings
    styling: v.optional(v.any()), // Merge with existing styling
    responsive: v.optional(v.any()),
    visibility: v.optional(v.any()),
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

    // 3. GET ELEMENT: Verify exists and user has access
    const element = await ctx.db.get(args.id);
    if (!element || element.type !== "page_element") {
      throw new Error("Element not found");
    }

    if (element.groupId !== person.groupId) {
      throw new Error("Unauthorized: Element belongs to different group");
    }

    // 4. UPDATE ELEMENT: Merge new properties
    const updatedProperties = {
      ...element.properties,
      ...(args.settings && {
        settings: { ...element.properties?.settings, ...args.settings },
      }),
      ...(args.styling && {
        styling: { ...element.properties?.styling, ...args.styling },
      }),
      ...(args.responsive && {
        responsive: args.responsive,
      }),
      ...(args.visibility && {
        visibility: args.visibility,
      }),
    };

    await ctx.db.patch(args.id, {
      ...(args.name && { name: args.name }),
      properties: updatedProperties,
      updatedAt: Date.now(),
    });

    // 5. LOG EVENT
    await ctx.db.insert("events", {
      type: "element_updated",
      actorId: person._id,
      targetId: args.id,
      timestamp: Date.now(),
      metadata: {
        entityType: "page_element",
        elementType: element.properties?.elementType,
        updatedFields: Object.keys(args).filter((k) => k !== "id"),
        groupId: person.groupId,
      },
    });

    return args.id;
  },
});

// ============================================================================
// UPDATE ELEMENT POSITION
// ============================================================================

/**
 * Update element position, size, or z-index (for drag-and-drop)
 *
 * Event: "element_updated"
 * Use case: Canvas drag-and-drop, resize, layer reordering
 */
export const updateElementPosition = mutation({
  args: {
    id: v.id("things"),
    position: v.object({
      x: v.optional(v.number()),
      y: v.optional(v.number()),
      width: v.optional(v.number()),
      height: v.optional(v.number()),
      zIndex: v.optional(v.number()),
    }),
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

    // 3. GET ELEMENT: Verify exists and user has access
    const element = await ctx.db.get(args.id);
    if (!element || element.type !== "page_element") {
      throw new Error("Element not found");
    }

    if (element.groupId !== person.groupId) {
      throw new Error("Unauthorized: Element belongs to different group");
    }

    // 4. UPDATE POSITION: Merge with existing position
    const currentPosition = element.properties?.position || {
      x: 0,
      y: 0,
      width: 100,
      height: 50,
      zIndex: 1,
    };

    const updatedPosition = {
      ...currentPosition,
      ...args.position,
    };

    await ctx.db.patch(args.id, {
      properties: {
        ...element.properties,
        position: updatedPosition,
      },
      updatedAt: Date.now(),
    });

    // 5. UPDATE CONNECTION METADATA: Keep connection in sync
    const connection = await ctx.db
      .query("connections")
      .withIndex("to_type", (q) =>
        q.eq("toThingId", args.id).eq("relationshipType", "step_contains_element")
      )
      .first();

    if (connection) {
      await ctx.db.patch(connection._id, {
        metadata: {
          ...connection.metadata,
          position: updatedPosition,
        },
      });
    }

    // 6. LOG EVENT
    await ctx.db.insert("events", {
      type: "element_updated",
      actorId: person._id,
      targetId: args.id,
      timestamp: Date.now(),
      metadata: {
        entityType: "page_element",
        elementType: element.properties?.elementType,
        action: "position_updated",
        newPosition: updatedPosition,
        groupId: person.groupId,
      },
    });

    return args.id;
  },
});

// ============================================================================
// REMOVE ELEMENT
// ============================================================================

/**
 * Remove element from step (soft delete)
 *
 * Event: "element_removed"
 * Status: active → archived
 * Note: SOFT delete only (never hard delete)
 */
export const removeElement = mutation({
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

    // 3. GET ELEMENT: Verify exists and user has access
    const element = await ctx.db.get(args.id);
    if (!element || element.type !== "page_element") {
      throw new Error("Element not found");
    }

    if (element.groupId !== person.groupId) {
      throw new Error("Unauthorized: Element belongs to different group");
    }

    // 4. CHECK IF ALREADY ARCHIVED
    if (element.status === "archived") {
      throw new Error("Element is already archived");
    }

    // 5. GET PARENT STEP: For updating element count
    const connection = await ctx.db
      .query("connections")
      .withIndex("to_type", (q) =>
        q.eq("toThingId", args.id).eq("relationshipType", "step_contains_element")
      )
      .first();

    if (!connection) {
      throw new Error("Element has no parent step");
    }

    const step = await ctx.db.get(connection.fromThingId);
    if (!step) {
      throw new Error("Parent step not found");
    }

    // 6. UPDATE STATUS (SOFT DELETE)
    await ctx.db.patch(args.id, {
      status: "archived",
      updatedAt: Date.now(),
    });

    // 7. ARCHIVE CONNECTION: Soft delete connection too
    await ctx.db.patch(connection._id, {
      validTo: Date.now(), // Mark connection as ended
    });

    // 8. UPDATE STEP: Decrement element count
    const currentElementCount = step.properties?.elementCount || 0;
    await ctx.db.patch(connection.fromThingId, {
      properties: {
        ...step.properties,
        elementCount: Math.max(0, currentElementCount - 1),
      },
      updatedAt: Date.now(),
    });

    // 9. LOG EVENT
    await ctx.db.insert("events", {
      type: "element_removed",
      actorId: person._id,
      targetId: args.id,
      timestamp: Date.now(),
      metadata: {
        elementType: element.properties?.elementType,
        elementName: element.name,
        stepId: connection.fromThingId,
        previousStatus: element.status,
        groupId: person.groupId,
      },
    });

    return args.id;
  },
});

// ============================================================================
// RESTORE ELEMENT
// ============================================================================

/**
 * Restore archived element
 *
 * Event: "entity_updated"
 * Status: archived → active
 */
export const restoreElement = mutation({
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

    // 3. GET ELEMENT: Verify exists and user has access
    const element = await ctx.db.get(args.id);
    if (!element || element.type !== "page_element") {
      throw new Error("Element not found");
    }

    if (element.groupId !== person.groupId) {
      throw new Error("Unauthorized: Element belongs to different group");
    }

    // 4. VALIDATE STATUS
    if (element.status !== "archived") {
      throw new Error("Element is not archived");
    }

    // 5. GET CONNECTION: For updating step count
    const connection = await ctx.db
      .query("connections")
      .withIndex("to_type", (q) =>
        q.eq("toThingId", args.id).eq("relationshipType", "step_contains_element")
      )
      .first();

    if (!connection) {
      throw new Error("Element has no parent step");
    }

    const step = await ctx.db.get(connection.fromThingId);
    if (!step) {
      throw new Error("Parent step not found");
    }

    // 6. RESTORE TO ACTIVE
    await ctx.db.patch(args.id, {
      status: "active",
      updatedAt: Date.now(),
    });

    // 7. RESTORE CONNECTION: Remove validTo
    await ctx.db.patch(connection._id, {
      validTo: undefined,
    });

    // 8. UPDATE STEP: Increment element count
    const currentElementCount = step.properties?.elementCount || 0;
    await ctx.db.patch(connection.fromThingId, {
      properties: {
        ...step.properties,
        elementCount: currentElementCount + 1,
      },
      updatedAt: Date.now(),
    });

    // 9. LOG EVENT
    await ctx.db.insert("events", {
      type: "entity_updated",
      actorId: person._id,
      targetId: args.id,
      timestamp: Date.now(),
      metadata: {
        entityType: "page_element",
        elementType: element.properties?.elementType,
        action: "restored",
        elementName: element.name,
        groupId: person.groupId,
      },
    });

    return args.id;
  },
});
