/**
 * ElementService - Page Element Management
 *
 * Manages page elements (UI components) within funnel steps using Effect.ts patterns.
 * Follows the 6-dimension ontology:
 * - Elements are things (type: "page_element")
 * - Element-step relationships are connections (type: "step_contains_element")
 * - All operations logged as events (element_added, element_updated, element_removed)
 * - Multi-tenant isolation via groupId
 *
 * @see /one/things/plans/clickfunnels-builder-100-cycles.md - Cycle 024
 * @see /one/knowledge/patterns/backend/service-template.md - Service pattern
 */

import { Effect, Context } from "effect";
import type { Id } from "../../_generated/dataModel";
import {
  PageNotFoundError,
  UnauthorizedPageAccessError,
  ValidationError,
  DatabaseError,
} from "./errors";

// ============================================================================
// Types
// ============================================================================

/**
 * Element types supported in funnel pages
 *
 * Based on common page builder elements from ClickFunnels, Unbounce, Webflow:
 * - Text: headline, subheadline, paragraph, list, quote
 * - Media: image, video, audio, iframe
 * - Forms: form, input, textarea, select, checkbox, radio, button
 * - Commerce: pricing_table, payment_button, countdown_timer, progress_bar
 * - Social: testimonial, social_share, social_feed
 * - Layout: container, column, row, divider, spacer
 * - Advanced: custom_html, custom_code, popup, survey
 */
export type ElementType =
  // Text Elements
  | "headline"
  | "subheadline"
  | "paragraph"
  | "list"
  | "quote"
  // Media Elements
  | "image"
  | "video"
  | "audio"
  | "iframe"
  // Form Elements
  | "form"
  | "input"
  | "textarea"
  | "select"
  | "checkbox"
  | "radio"
  | "button"
  // Commerce Elements
  | "pricing_table"
  | "payment_button"
  | "countdown_timer"
  | "progress_bar"
  | "order_bump"
  // Social Elements
  | "testimonial"
  | "social_share"
  | "social_feed"
  | "faq"
  // Layout Elements
  | "container"
  | "column"
  | "row"
  | "divider"
  | "spacer"
  // Advanced Elements
  | "custom_html"
  | "custom_code"
  | "popup"
  | "survey"
  | "chart"
  | "map"
  | "calendar";

/**
 * Element status lifecycle
 */
export type ElementStatus = "draft" | "active" | "published" | "archived";

/**
 * Element position and sizing data (stored in connection metadata)
 */
export interface ElementPosition {
  x: number; // X coordinate in grid (0-11 for 12-column grid)
  y: number; // Y coordinate in pixels or grid units
  width: number; // Width in grid columns (1-12)
  height: number; // Height in pixels or grid units
  zIndex: number; // Layer order for overlapping elements
}

/**
 * Input for creating a new element
 */
export interface CreateElementInput {
  stepId: Id<"things">;
  elementType: ElementType;
  name?: string; // Optional display name (e.g., "Hero Headline")
  position: ElementPosition;
  properties?: {
    // Text properties (headline, paragraph, etc.)
    text?: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    color?: string;
    textAlign?: "left" | "center" | "right" | "justify";
    lineHeight?: number;

    // Media properties (image, video, etc.)
    src?: string;
    alt?: string;
    autoplay?: boolean;
    loop?: boolean;
    controls?: boolean;

    // Button properties
    buttonText?: string;
    buttonAction?: "link" | "submit" | "next_step" | "popup";
    buttonLink?: string;
    buttonStyle?: "primary" | "secondary" | "outline" | "text";
    backgroundColor?: string;
    hoverColor?: string;

    // Form properties
    formFields?: Array<{
      name: string;
      type: string;
      label: string;
      placeholder?: string;
      required?: boolean;
      validation?: string;
    }>;
    submitText?: string;
    submitAction?: string;

    // Layout properties
    padding?: { top: number; right: number; bottom: number; left: number };
    margin?: { top: number; right: number; bottom: number; left: number };
    borderRadius?: number;
    borderWidth?: number;
    borderColor?: string;
    borderStyle?: string;
    boxShadow?: string;

    // Commerce properties
    price?: number;
    currency?: string;
    paymentIntegration?: string;
    timerEndDate?: number;

    // Advanced properties
    customCss?: string;
    customJs?: string;
    htmlContent?: string;

    // Animation properties
    animation?: string;
    animationDelay?: number;
    animationDuration?: number;

    // Extensible for type-specific properties
    [key: string]: any;
  };
}

/**
 * Input for updating an element
 */
export interface UpdateElementInput {
  name?: string;
  elementType?: ElementType;
  properties?: Record<string, any>;
  status?: ElementStatus;
}

/**
 * Input for updating element position
 */
export interface UpdateElementPositionInput {
  elementId: Id<"things">;
  position: Partial<ElementPosition>;
}

/**
 * Database interface (injected dependency)
 */
export interface DatabaseContext {
  get: (id: Id<"things">) => Promise<any>;
  insert: (table: string, data: any) => Promise<Id<"things">>;
  patch: (id: Id<"things">, data: any) => Promise<void>;
  query: (table: string) => any;
}

/**
 * Current user context (for authorization)
 */
export interface UserContext {
  userId: Id<"things">;
  groupId: Id<"groups">;
}

// ============================================================================
// Service Definition
// ============================================================================

/**
 * ElementService - Manages page elements and positioning
 */
export class ElementService extends Context.Tag("ElementService")<
  ElementService,
  {
    /**
     * Add a new element to a step
     */
    add: (
      input: CreateElementInput,
      user: UserContext
    ) => Effect.Effect<
      Id<"things">,
      | PageNotFoundError
      | UnauthorizedPageAccessError
      | ValidationError
      | DatabaseError
    >;

    /**
     * Get an element by ID
     */
    get: (
      elementId: Id<"things">,
      user: UserContext
    ) => Effect.Effect<
      any,
      PageNotFoundError | UnauthorizedPageAccessError | DatabaseError
    >;

    /**
     * List all elements for a step (ordered by zIndex)
     */
    listByStep: (
      stepId: Id<"things">,
      user: UserContext
    ) => Effect.Effect<
      any[],
      PageNotFoundError | UnauthorizedPageAccessError | DatabaseError
    >;

    /**
     * Update element properties
     */
    update: (
      elementId: Id<"things">,
      input: UpdateElementInput,
      user: UserContext
    ) => Effect.Effect<
      void,
      | PageNotFoundError
      | UnauthorizedPageAccessError
      | ValidationError
      | DatabaseError
    >;

    /**
     * Update element position (drag-and-drop, resize)
     */
    updatePosition: (
      input: UpdateElementPositionInput,
      user: UserContext
    ) => Effect.Effect<
      void,
      | PageNotFoundError
      | UnauthorizedPageAccessError
      | ValidationError
      | DatabaseError
    >;

    /**
     * Remove an element from a step
     */
    remove: (
      elementId: Id<"things">,
      user: UserContext
    ) => Effect.Effect<
      void,
      PageNotFoundError | UnauthorizedPageAccessError | DatabaseError
    >;
  }
>() {}

// ============================================================================
// Service Implementation
// ============================================================================

/**
 * Create ElementService implementation
 *
 * @param db - Database context (Convex ctx.db)
 * @returns ElementService implementation
 */
export const makeElementService = (db: DatabaseContext) =>
  ElementService.of({
    /**
     * Add a new element to a step
     */
    add: (input, user) =>
      Effect.gen(function* () {
        // 1. Validate step exists
        const step = yield* Effect.tryPromise({
          try: () => db.get(input.stepId),
          catch: () =>
            new PageNotFoundError({
              message: "Step not found",
              pageId: input.stepId,
            }),
        });

        if (!step) {
          return yield* Effect.fail(
            new PageNotFoundError({
              message: "Step not found",
              pageId: input.stepId,
            })
          );
        }

        // 2. Validate user has access to step (groupId match)
        if (step.groupId !== user.groupId) {
          return yield* Effect.fail(
            new UnauthorizedPageAccessError({
              message: "Not authorized to add elements to this step",
              userId: user.userId,
              pageId: input.stepId,
            })
          );
        }

        // 3. Validate element type
        const validElementTypes: ElementType[] = [
          "headline",
          "subheadline",
          "paragraph",
          "list",
          "quote",
          "image",
          "video",
          "audio",
          "iframe",
          "form",
          "input",
          "textarea",
          "select",
          "checkbox",
          "radio",
          "button",
          "pricing_table",
          "payment_button",
          "countdown_timer",
          "progress_bar",
          "order_bump",
          "testimonial",
          "social_share",
          "social_feed",
          "faq",
          "container",
          "column",
          "row",
          "divider",
          "spacer",
          "custom_html",
          "custom_code",
          "popup",
          "survey",
          "chart",
          "map",
          "calendar",
        ];

        if (!validElementTypes.includes(input.elementType)) {
          return yield* Effect.fail(
            new ValidationError({
              message: `Invalid element type: ${input.elementType}`,
              field: "elementType",
              value: input.elementType,
              constraint: "valid_element_type",
            })
          );
        }

        // 4. Validate position data
        if (
          input.position.x < 0 ||
          input.position.x > 11 ||
          input.position.width < 1 ||
          input.position.width > 12 ||
          input.position.x + input.position.width > 12
        ) {
          return yield* Effect.fail(
            new ValidationError({
              message:
                "Invalid position: Element must fit within 12-column grid",
              field: "position",
              value: input.position,
              constraint: "grid_bounds",
            })
          );
        }

        // 5. Generate element name if not provided
        const elementName =
          input.name ||
          `${input.elementType.charAt(0).toUpperCase() + input.elementType.slice(1)} Element`;

        // 6. Create element thing
        const elementId = yield* Effect.tryPromise({
          try: () =>
            db.insert("things", {
              type: "page_element",
              name: elementName,
              groupId: user.groupId,
              properties: {
                elementType: input.elementType,
                ...input.properties,
              },
              status: "draft",
              createdAt: Date.now(),
              updatedAt: Date.now(),
            }),
          catch: (error) =>
            new DatabaseError({
              message: "Failed to create element",
              operation: "insert_element",
              details: String(error),
            }),
        });

        // 7. Create connection: step_contains_element
        yield* Effect.tryPromise({
          try: () =>
            db.insert("connections", {
              fromThingId: input.stepId,
              toThingId: elementId,
              relationshipType: "step_contains_element",
              metadata: {
                position: input.position,
                elementType: input.elementType,
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

        // 8. Log event: element_added
        yield* Effect.tryPromise({
          try: () =>
            db.insert("events", {
              type: "element_added",
              actorId: user.userId,
              targetId: elementId,
              timestamp: Date.now(),
              metadata: {
                stepId: input.stepId,
                elementType: input.elementType,
                position: input.position,
                groupId: user.groupId,
              },
            }),
          catch: (error) =>
            new DatabaseError({
              message: "Failed to log element_added event",
              operation: "insert_event",
              details: String(error),
            }),
        });

        return elementId;
      }),

    /**
     * Get an element by ID
     */
    get: (elementId, user) =>
      Effect.gen(function* () {
        // 1. Get element
        const element = yield* Effect.tryPromise({
          try: () => db.get(elementId),
          catch: () =>
            new PageNotFoundError({
              message: "Element not found",
              pageId: elementId,
            }),
        });

        if (!element) {
          return yield* Effect.fail(
            new PageNotFoundError({
              message: "Element not found",
              pageId: elementId,
            })
          );
        }

        // 2. Validate access via groupId
        if (element.groupId !== user.groupId) {
          return yield* Effect.fail(
            new UnauthorizedPageAccessError({
              message: "Not authorized to access this element",
              userId: user.userId,
              pageId: elementId,
            })
          );
        }

        // 3. Get connection to find position and step
        const connection = yield* Effect.tryPromise({
          try: async () => {
            const conn = await db
              .query("connections")
              .filter(
                (c: any) =>
                  c.toThingId === elementId &&
                  c.relationshipType === "step_contains_element"
              )
              .first();
            return conn;
          },
          catch: (error) =>
            new DatabaseError({
              message: "Failed to query element connection",
              operation: "query_connection",
              details: String(error),
            }),
        });

        return {
          ...element,
          position: connection?.metadata?.position || {
            x: 0,
            y: 0,
            width: 12,
            height: 100,
            zIndex: 0,
          },
          stepId: connection?.fromThingId,
        };
      }),

    /**
     * List all elements for a step (ordered by zIndex)
     */
    listByStep: (stepId, user) =>
      Effect.gen(function* () {
        // 1. Validate step exists and user has access
        const step = yield* Effect.tryPromise({
          try: () => db.get(stepId),
          catch: () =>
            new PageNotFoundError({
              message: "Step not found",
              pageId: stepId,
            }),
        });

        if (!step) {
          return yield* Effect.fail(
            new PageNotFoundError({
              message: "Step not found",
              pageId: stepId,
            })
          );
        }

        if (step.groupId !== user.groupId) {
          return yield* Effect.fail(
            new UnauthorizedPageAccessError({
              message: "Not authorized to access this step",
              userId: user.userId,
              pageId: stepId,
            })
          );
        }

        // 2. Get all connections: step_contains_element
        const connections = yield* Effect.tryPromise({
          try: async () => {
            const conns = await db
              .query("connections")
              .filter(
                (c: any) =>
                  c.fromThingId === stepId &&
                  c.relationshipType === "step_contains_element" &&
                  !c.validTo
              )
              .collect();
            return conns;
          },
          catch: (error) =>
            new DatabaseError({
              message: "Failed to query step elements",
              operation: "query_connections",
              details: String(error),
            }),
        });

        // 3. Get all element things
        const elements = yield* Effect.tryPromise({
          try: async () => {
            const elementIds = connections.map((c: any) => c.toThingId);
            const elementsData = await Promise.all(
              elementIds.map((id: Id<"things">) => db.get(id))
            );
            return elementsData.filter(Boolean);
          },
          catch: (error) =>
            new DatabaseError({
              message: "Failed to fetch element details",
              operation: "get_elements",
              details: String(error),
            }),
        });

        // 4. Merge elements with position from connections
        const elementsWithPosition = elements.map((element: any) => {
          const connection = connections.find(
            (c: any) => c.toThingId === element._id
          );
          return {
            ...element,
            position: connection?.metadata?.position || {
              x: 0,
              y: 0,
              width: 12,
              height: 100,
              zIndex: 0,
            },
            stepId,
          };
        });

        // 5. Sort by zIndex (layer order)
        return elementsWithPosition.sort(
          (a, b) => a.position.zIndex - b.position.zIndex
        );
      }),

    /**
     * Update element properties
     */
    update: (elementId, input, user) =>
      Effect.gen(function* () {
        // 1. Get element and validate access
        const element = yield* Effect.tryPromise({
          try: () => db.get(elementId),
          catch: () =>
            new PageNotFoundError({
              message: "Element not found",
              pageId: elementId,
            }),
        });

        if (!element) {
          return yield* Effect.fail(
            new PageNotFoundError({
              message: "Element not found",
              pageId: elementId,
            })
          );
        }

        if (element.groupId !== user.groupId) {
          return yield* Effect.fail(
            new UnauthorizedPageAccessError({
              message: "Not authorized to update this element",
              userId: user.userId,
              pageId: elementId,
            })
          );
        }

        // 2. Validate input
        if (input.name !== undefined && input.name.trim().length === 0) {
          return yield* Effect.fail(
            new ValidationError({
              message: "Element name cannot be empty",
              field: "name",
              value: input.name,
              constraint: "required",
            })
          );
        }

        // 3. Merge properties
        const updatedProperties = input.properties
          ? { ...element.properties, ...input.properties }
          : element.properties;

        if (input.elementType) {
          updatedProperties.elementType = input.elementType;
        }

        // 4. Update element
        yield* Effect.tryPromise({
          try: () =>
            db.patch(elementId, {
              ...(input.name && { name: input.name }),
              properties: updatedProperties,
              ...(input.status && { status: input.status }),
              updatedAt: Date.now(),
            }),
          catch: (error) =>
            new DatabaseError({
              message: "Failed to update element",
              operation: "patch_element",
              details: String(error),
            }),
        });

        // 5. Log event: element_updated
        yield* Effect.tryPromise({
          try: () =>
            db.insert("events", {
              type: "element_updated",
              actorId: user.userId,
              targetId: elementId,
              timestamp: Date.now(),
              metadata: {
                updatedFields: Object.keys(input),
                groupId: user.groupId,
              },
            }),
          catch: (error) =>
            new DatabaseError({
              message: "Failed to log element_updated event",
              operation: "insert_event",
              details: String(error),
            }),
        });
      }),

    /**
     * Update element position (drag-and-drop, resize)
     */
    updatePosition: (input, user) =>
      Effect.gen(function* () {
        // 1. Get element and validate access
        const element = yield* Effect.tryPromise({
          try: () => db.get(input.elementId),
          catch: () =>
            new PageNotFoundError({
              message: "Element not found",
              pageId: input.elementId,
            }),
        });

        if (!element) {
          return yield* Effect.fail(
            new PageNotFoundError({
              message: "Element not found",
              pageId: input.elementId,
            })
          );
        }

        if (element.groupId !== user.groupId) {
          return yield* Effect.fail(
            new UnauthorizedPageAccessError({
              message: "Not authorized to update this element",
              userId: user.userId,
              pageId: input.elementId,
            })
          );
        }

        // 2. Get connection
        const connection = yield* Effect.tryPromise({
          try: async () => {
            const conn = await db
              .query("connections")
              .filter(
                (c: any) =>
                  c.toThingId === input.elementId &&
                  c.relationshipType === "step_contains_element" &&
                  !c.validTo
              )
              .first();
            return conn;
          },
          catch: (error) =>
            new DatabaseError({
              message: "Failed to query element connection",
              operation: "query_connection",
              details: String(error),
            }),
        });

        if (!connection) {
          return yield* Effect.fail(
            new PageNotFoundError({
              message: "Element connection not found",
              pageId: input.elementId,
            })
          );
        }

        // 3. Merge position data
        const currentPosition = connection.metadata?.position || {
          x: 0,
          y: 0,
          width: 12,
          height: 100,
          zIndex: 0,
        };
        const newPosition = { ...currentPosition, ...input.position };

        // 4. Validate new position
        if (
          newPosition.x < 0 ||
          newPosition.x > 11 ||
          newPosition.width < 1 ||
          newPosition.width > 12 ||
          newPosition.x + newPosition.width > 12
        ) {
          return yield* Effect.fail(
            new ValidationError({
              message:
                "Invalid position: Element must fit within 12-column grid",
              field: "position",
              value: newPosition,
              constraint: "grid_bounds",
            })
          );
        }

        // 5. Update connection metadata
        yield* Effect.tryPromise({
          try: () =>
            db.patch(connection._id, {
              metadata: {
                ...connection.metadata,
                position: newPosition,
              },
            }),
          catch: (error) =>
            new DatabaseError({
              message: "Failed to update element position",
              operation: "patch_connection",
              details: String(error),
            }),
        });

        // 6. Log event: element_updated (position change)
        yield* Effect.tryPromise({
          try: () =>
            db.insert("events", {
              type: "element_updated",
              actorId: user.userId,
              targetId: input.elementId,
              timestamp: Date.now(),
              metadata: {
                updatedFields: ["position"],
                previousPosition: currentPosition,
                newPosition,
                groupId: user.groupId,
              },
            }),
          catch: (error) =>
            new DatabaseError({
              message: "Failed to log element position update event",
              operation: "insert_event",
              details: String(error),
            }),
        });
      }),

    /**
     * Remove an element from a step
     */
    remove: (elementId, user) =>
      Effect.gen(function* () {
        // 1. Get element and validate access
        const element = yield* Effect.tryPromise({
          try: () => db.get(elementId),
          catch: () =>
            new PageNotFoundError({
              message: "Element not found",
              pageId: elementId,
            }),
        });

        if (!element) {
          return yield* Effect.fail(
            new PageNotFoundError({
              message: "Element not found",
              pageId: elementId,
            })
          );
        }

        if (element.groupId !== user.groupId) {
          return yield* Effect.fail(
            new UnauthorizedPageAccessError({
              message: "Not authorized to remove this element",
              userId: user.userId,
              pageId: elementId,
            })
          );
        }

        // 2. Get connection to find step
        const connection = yield* Effect.tryPromise({
          try: async () => {
            const conn = await db
              .query("connections")
              .filter(
                (c: any) =>
                  c.toThingId === elementId &&
                  c.relationshipType === "step_contains_element" &&
                  !c.validTo
              )
              .first();
            return conn;
          },
          catch: (error) =>
            new DatabaseError({
              message: "Failed to query element connection",
              operation: "query_connection",
              details: String(error),
            }),
        });

        const stepId = connection?.fromThingId;

        // 3. Soft delete element
        yield* Effect.tryPromise({
          try: () =>
            db.patch(elementId, {
              status: "archived",
              updatedAt: Date.now(),
            }),
          catch: (error) =>
            new DatabaseError({
              message: "Failed to archive element",
              operation: "patch_element",
              details: String(error),
            }),
        });

        // 4. Invalidate connection (set validTo)
        if (connection) {
          yield* Effect.tryPromise({
            try: () => db.patch(connection._id, { validTo: Date.now() }),
            catch: (error) =>
              new DatabaseError({
                message: "Failed to invalidate element connection",
                operation: "patch_connection",
                details: String(error),
              }),
          });
        }

        // 5. Log event: element_removed
        yield* Effect.tryPromise({
          try: () =>
            db.insert("events", {
              type: "element_removed",
              actorId: user.userId,
              targetId: elementId,
              timestamp: Date.now(),
              metadata: {
                stepId,
                elementType: element.properties?.elementType,
                groupId: user.groupId,
              },
            }),
          catch: (error) =>
            new DatabaseError({
              message: "Failed to log element_removed event",
              operation: "insert_event",
              details: String(error),
            }),
        });
      }),
  });
