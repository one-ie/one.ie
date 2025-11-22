/**
 * Page Element Queries
 *
 * CYCLE-025: Read operations for page elements (UI components within funnel steps).
 *
 * Element Type: page_element
 * Properties:
 * - elementType: Type of element (headline, button, image, form, etc.)
 * - position: Display order within the step
 * - config: Element-specific configuration (text, color, size, action, etc.)
 * - styles: CSS styling properties
 * - visibility: Show/hide conditions
 *
 * Connections:
 * - step_contains_element: Links step to elements in display order
 *
 * @see /one/things/plans/clickfunnels-builder-100-cycles.md - CYCLE-025
 * @see /backend/convex/schema.ts - things table definition
 */

import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Get all elements for a specific step
 *
 * Returns elements ordered by position number.
 * Multi-tenant: Only returns elements for steps in user's group.
 *
 * @param stepId - The step to get elements for
 * @returns Array of page_element things ordered by position
 */
export const getElementsByStep = query({
  args: {
    stepId: v.id("things"),
  },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE: Get user identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // 2. GET USER'S GROUP: Find person record
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person?.groupId) {
      return [];
    }

    // 3. VERIFY STEP: Ensure step exists and belongs to user's group
    const step = await ctx.db.get(args.stepId);
    if (!step || step.groupId !== person.groupId) {
      return [];
    }

    // 4. GET ELEMENT CONNECTIONS: Query step_contains_element relationships
    const elementConnections = await ctx.db
      .query("connections")
      .withIndex("from_type", (q) =>
        q.eq("fromThingId", args.stepId).eq("relationshipType", "step_contains_element")
      )
      .collect();

    // 5. GET ELEMENT ENTITIES: Fetch each element thing
    const elementIds = elementConnections.map((conn) => conn.toThingId);
    const elements = await Promise.all(
      elementIds.map((elementId) => ctx.db.get(elementId))
    );

    // 6. FILTER & VALIDATE: Remove nulls and verify group ownership
    const validElements = elements.filter(
      (el) => el !== null && el.groupId === person.groupId && el.type === "page_element"
    );

    // 7. SORT BY POSITION: Order elements by properties.position
    const sortedElements = validElements.sort((a, b) => {
      const posA = a?.properties?.position ?? 0;
      const posB = b?.properties?.position ?? 0;
      return posA - posB;
    });

    // 8. ENRICH WITH CONNECTION METADATA (if any)
    return sortedElements.map((element) => {
      const connection = elementConnections.find((c) => c.toThingId === element._id);
      return {
        ...element,
        connectionMetadata: connection?.metadata,
      };
    });
  },
});

/**
 * Get a single element by ID
 *
 * Multi-tenant: Only returns element if it belongs to user's group.
 *
 * @param id - The element ID
 * @returns The page_element thing or null if not found/unauthorized
 */
export const getElement = query({
  args: {
    id: v.id("things"),
  },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE: Get user identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // 2. GET USER'S GROUP: Find person record
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person?.groupId) {
      return null;
    }

    // 3. GET ELEMENT: Fetch by ID and validate
    const element = await ctx.db.get(args.id);
    if (!element || element.groupId !== person.groupId) {
      return null; // Not found or unauthorized
    }

    // 4. VERIFY TYPE: Ensure it's actually a page_element
    if (element.type !== "page_element") {
      return null;
    }

    // 5. GET PARENT STEP: Find which step contains this element
    const stepConnection = await ctx.db
      .query("connections")
      .withIndex("to_type", (q) =>
        q.eq("toThingId", element._id).eq("relationshipType", "step_contains_element")
      )
      .first();

    // 6. ENRICH WITH CONTEXT
    return {
      ...element,
      stepId: stepConnection?.fromThingId ?? null,
      connectionMetadata: stepConnection?.metadata,
    };
  },
});

/**
 * Get elements by type for a step
 *
 * Filter elements by elementType (headline, button, image, etc.)
 * Useful for getting all buttons or all forms on a page.
 *
 * @param stepId - The step to get elements for
 * @param elementType - The type of elements to filter (headline, button, image, form, etc.)
 * @returns Array of page_element things matching the type, ordered by position
 */
export const getElementsByType = query({
  args: {
    stepId: v.id("things"),
    elementType: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE: Get user identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // 2. GET USER'S GROUP: Find person record
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person?.groupId) {
      return [];
    }

    // 3. VERIFY STEP: Ensure step exists and belongs to user's group
    const step = await ctx.db.get(args.stepId);
    if (!step || step.groupId !== person.groupId) {
      return [];
    }

    // 4. GET ELEMENT CONNECTIONS
    const elementConnections = await ctx.db
      .query("connections")
      .withIndex("from_type", (q) =>
        q.eq("fromThingId", args.stepId).eq("relationshipType", "step_contains_element")
      )
      .collect();

    // 5. GET ELEMENT ENTITIES
    const elementIds = elementConnections.map((conn) => conn.toThingId);
    const elements = await Promise.all(
      elementIds.map((elementId) => ctx.db.get(elementId))
    );

    // 6. FILTER BY TYPE AND VALIDATE
    const filteredElements = elements.filter(
      (el) =>
        el !== null &&
        el.groupId === person.groupId &&
        el.type === "page_element" &&
        el.properties?.elementType === args.elementType
    );

    // 7. SORT BY POSITION
    const sortedElements = filteredElements.sort((a, b) => {
      const posA = a?.properties?.position ?? 0;
      const posB = b?.properties?.position ?? 0;
      return posA - posB;
    });

    return sortedElements;
  },
});

/**
 * Get visible elements for a step
 *
 * Returns only elements that should be displayed (not hidden).
 * Respects visibility conditions and status.
 *
 * @param stepId - The step to get visible elements for
 * @returns Array of visible page_element things ordered by position
 */
export const getVisibleElements = query({
  args: {
    stepId: v.id("things"),
  },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE: Get user identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // 2. GET USER'S GROUP: Find person record
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person?.groupId) {
      return [];
    }

    // 3. VERIFY STEP: Ensure step exists and belongs to user's group
    const step = await ctx.db.get(args.stepId);
    if (!step || step.groupId !== person.groupId) {
      return [];
    }

    // 4. GET ELEMENT CONNECTIONS
    const elementConnections = await ctx.db
      .query("connections")
      .withIndex("from_type", (q) =>
        q.eq("fromThingId", args.stepId).eq("relationshipType", "step_contains_element")
      )
      .collect();

    // 5. GET ELEMENT ENTITIES
    const elementIds = elementConnections.map((conn) => conn.toThingId);
    const elements = await Promise.all(
      elementIds.map((elementId) => ctx.db.get(elementId))
    );

    // 6. FILTER FOR VISIBLE ELEMENTS
    const visibleElements = elements.filter(
      (el) =>
        el !== null &&
        el.groupId === person.groupId &&
        el.type === "page_element" &&
        el.status === "published" &&
        el.properties?.visibility !== false // Default to visible if not specified
    );

    // 7. SORT BY POSITION
    const sortedElements = visibleElements.sort((a, b) => {
      const posA = a?.properties?.position ?? 0;
      const posB = b?.properties?.position ?? 0;
      return posA - posB;
    });

    return sortedElements;
  },
});

/**
 * Search elements by name
 *
 * Full-text search on element names within a step.
 * Useful for finding specific elements in complex pages.
 *
 * @param stepId - The step to search within
 * @param searchTerm - Search query
 * @param limit - Maximum number of results (default: 20)
 * @returns Array of matching page_element things
 */
export const searchElements = query({
  args: {
    stepId: v.id("things"),
    searchTerm: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE: Get user identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // 2. GET USER'S GROUP: Find person record
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person?.groupId) {
      return [];
    }

    // 3. VERIFY STEP: Ensure step exists and belongs to user's group
    const step = await ctx.db.get(args.stepId);
    if (!step || step.groupId !== person.groupId) {
      return [];
    }

    // 4. GET ALL ELEMENTS FOR STEP (via connections)
    const elementConnections = await ctx.db
      .query("connections")
      .withIndex("from_type", (q) =>
        q.eq("fromThingId", args.stepId).eq("relationshipType", "step_contains_element")
      )
      .collect();

    const elementIds = elementConnections.map((conn) => conn.toThingId);
    const elements = await Promise.all(
      elementIds.map((elementId) => ctx.db.get(elementId))
    );

    // 5. FILTER AND SEARCH: Simple case-insensitive name matching
    const searchLower = args.searchTerm.toLowerCase();
    const matchingElements = elements
      .filter(
        (el) =>
          el !== null &&
          el.groupId === person.groupId &&
          el.type === "page_element" &&
          el.name.toLowerCase().includes(searchLower)
      )
      .slice(0, args.limit || 20);

    // 6. SORT BY POSITION
    return matchingElements.sort((a, b) => {
      const posA = a?.properties?.position ?? 0;
      const posB = b?.properties?.position ?? 0;
      return posA - posB;
    });
  },
});
