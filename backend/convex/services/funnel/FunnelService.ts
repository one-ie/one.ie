/**
 * Funnel Service - Pure Business Logic for Funnel Management
 *
 * Implements funnel CRUD operations using Effect.ts for type-safe, composable operations.
 *
 * Part of Cycle 13: Create FunnelService
 * Integrates with Cycle 19: Rate limiting
 *
 * @see /one/things/plans/clickfunnels-builder-100-cycles.md
 * @see /one/knowledge/patterns/backend/service-template.md
 */

import { Effect } from "effect";
import { Id } from "../../_generated/dataModel";

// ============================================================================
// ERROR TYPES
// ============================================================================

export class FunnelNotFoundError {
  readonly _tag = "FunnelNotFoundError";

  constructor(
    public readonly funnelId: string,
    public readonly message: string = "Funnel not found"
  ) {}
}

export class FunnelAlreadyPublishedError {
  readonly _tag = "FunnelAlreadyPublishedError";

  constructor(
    public readonly funnelId: string,
    public readonly message: string = "Funnel is already published"
  ) {}
}

export class InvalidFunnelSequenceError {
  readonly _tag = "InvalidFunnelSequenceError";

  constructor(
    public readonly funnelId: string,
    public readonly message: string
  ) {}
}

export class UnauthorizedFunnelAccessError {
  readonly _tag = "UnauthorizedFunnelAccessError";

  constructor(
    public readonly funnelId: string,
    public readonly userId: string,
    public readonly message: string = "Unauthorized access to funnel"
  ) {}
}

export class FunnelValidationError {
  readonly _tag = "FunnelValidationError";

  constructor(
    public readonly field: string,
    public readonly message: string
  ) {}
}

export type FunnelError =
  | FunnelNotFoundError
  | FunnelAlreadyPublishedError
  | InvalidFunnelSequenceError
  | UnauthorizedFunnelAccessError
  | FunnelValidationError;

// ============================================================================
// TYPES
// ============================================================================

export interface FunnelData {
  _id: Id<"things">;
  type: "funnel";
  name: string;
  groupId: Id<"groups">;
  properties: {
    description?: string;
    slug: string;
    domain?: string;
    stepCount?: number;
    settings?: FunnelSettings;
    seo?: FunnelSEO;
  };
  status: "draft" | "active" | "published" | "archived";
  createdAt: number;
  updatedAt: number;
}

export interface FunnelSettings {
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
  };
  tracking?: {
    googleAnalyticsId?: string;
    facebookPixelId?: string;
    customScript?: string;
  };
  features?: {
    enableABTesting?: boolean;
    enableAnalytics?: boolean;
    enableEmailSequence?: boolean;
  };
}

export interface FunnelSEO {
  title?: string;
  description?: string;
  ogImage?: string;
  favicon?: string;
}

export interface CreateFunnelInput {
  name: string;
  description?: string;
  groupId: Id<"groups">;
  settings?: FunnelSettings;
}

export interface UpdateFunnelInput {
  name?: string;
  properties?: Partial<FunnelData["properties"]>;
  status?: FunnelData["status"];
}

export interface FunnelMetrics {
  visitors: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
  averageOrderValue: number;
}

// ============================================================================
// SERVICE IMPLEMENTATION
// ============================================================================

/**
 * FunnelService - Pure business logic for funnel operations
 *
 * All methods return Effect types for composable, type-safe operations.
 * Database operations should be injected by the caller (Convex mutations).
 */
export const FunnelService = {
  /**
   * Validate funnel name
   */
  validateName: (name: string) =>
    Effect.gen(function* () {
      if (!name || name.trim().length === 0) {
        return yield* Effect.fail(
          new FunnelValidationError("name", "Funnel name is required")
        );
      }

      if (name.length > 100) {
        return yield* Effect.fail(
          new FunnelValidationError(
            "name",
            "Funnel name must be 100 characters or less"
          )
        );
      }

      return name.trim();
    }),

  /**
   * Generate URL-safe slug from name
   */
  generateSlug: (name: string) =>
    Effect.sync(() => {
      return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/-+/g, "-") // Replace multiple hyphens with single
        .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
    }),

  /**
   * Validate funnel can be published
   *
   * Requirements:
   * - Must have at least one step
   * - Must have valid slug
   * - Must not already be published
   */
  validateForPublish: (funnel: FunnelData) =>
    Effect.gen(function* () {
      // Check if already published
      if (funnel.status === "published") {
        return yield* Effect.fail(
          new FunnelAlreadyPublishedError(funnel._id)
        );
      }

      // Check has steps
      const stepCount = funnel.properties?.stepCount || 0;
      if (stepCount === 0) {
        return yield* Effect.fail(
          new FunnelValidationError(
            "steps",
            "Funnel must have at least one step before publishing"
          )
        );
      }

      // Check has valid slug
      if (!funnel.properties?.slug) {
        return yield* Effect.fail(
          new FunnelValidationError(
            "slug",
            "Funnel must have a valid slug before publishing"
          )
        );
      }

      return funnel;
    }),

  /**
   * Calculate funnel metrics from events
   *
   * @param events - Array of funnel-related events
   * @returns Calculated metrics
   */
  calculateMetrics: (events: any[]) =>
    Effect.sync((): FunnelMetrics => {
      // Count unique visitors (distinct actorIds)
      const visitorIds = new Set(events.map((e) => e.actorId));
      const visitors = visitorIds.size;

      // Count conversions (purchase_completed events)
      const purchaseEvents = events.filter(
        (e) => e.type === "purchase_completed"
      );
      const conversions = purchaseEvents.length;

      // Calculate conversion rate
      const conversionRate = visitors > 0 ? conversions / visitors : 0;

      // Calculate revenue
      const revenue = purchaseEvents.reduce(
        (sum, e) => sum + (e.metadata?.amount || 0),
        0
      );

      // Calculate average order value
      const averageOrderValue = conversions > 0 ? revenue / conversions : 0;

      return {
        visitors,
        conversions,
        conversionRate,
        revenue,
        averageOrderValue,
      };
    }),

  /**
   * Validate funnel sequence integrity
   *
   * Ensures steps are properly ordered with no gaps
   */
  validateSequence: (steps: any[], funnelId: string) =>
    Effect.gen(function* () {
      if (steps.length === 0) {
        return steps; // Empty sequence is valid
      }

      // Check for sequence numbers
      const sequences = steps
        .map((s) => s.metadata?.sequence)
        .filter((s) => s !== undefined)
        .sort((a, b) => a - b);

      // Check for gaps
      for (let i = 0; i < sequences.length - 1; i++) {
        if (sequences[i + 1] - sequences[i] > 1) {
          return yield* Effect.fail(
            new InvalidFunnelSequenceError(
              funnelId,
              `Gap in funnel sequence: missing step between ${sequences[i]} and ${sequences[i + 1]}`
            )
          );
        }
      }

      // Check for duplicates
      const uniqueSequences = new Set(sequences);
      if (uniqueSequences.size !== sequences.length) {
        return yield* Effect.fail(
          new InvalidFunnelSequenceError(
            funnelId,
            "Duplicate sequence numbers found in funnel steps"
          )
        );
      }

      return steps;
    }),

  /**
   * Prepare funnel data for creation
   */
  prepareCreateData: (input: CreateFunnelInput) =>
    Effect.gen(function* () {
      // Validate name
      const validatedName = yield* FunnelService.validateName(input.name);

      // Generate slug
      const slug = yield* FunnelService.generateSlug(validatedName);

      // Prepare properties
      const properties = {
        description: input.description,
        slug,
        stepCount: 0,
        settings: input.settings || {},
      };

      return {
        type: "funnel" as const,
        name: validatedName,
        groupId: input.groupId,
        properties,
        status: "draft" as const,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    }),

  /**
   * Prepare funnel data for update
   */
  prepareUpdateData: (input: UpdateFunnelInput) =>
    Effect.gen(function* () {
      const updates: any = {
        updatedAt: Date.now(),
      };

      // Validate and update name if provided
      if (input.name) {
        updates.name = yield* FunnelService.validateName(input.name);
      }

      // Update properties if provided
      if (input.properties) {
        updates.properties = input.properties;
      }

      // Update status if provided
      if (input.status) {
        updates.status = input.status;
      }

      return updates;
    }),
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if user owns funnel (to be used in Convex mutations)
 */
export function checkFunnelOwnership(
  funnel: FunnelData,
  userGroupId: Id<"groups">
): boolean {
  return funnel.groupId === userGroupId;
}

/**
 * Get funnel status display text
 */
export function getFunnelStatusText(
  status: FunnelData["status"]
): string {
  const statusMap = {
    draft: "Draft",
    active: "Active",
    published: "Published",
    archived: "Archived",
  };
  return statusMap[status] || status;
}

/**
 * Check if funnel can be edited
 */
export function isFunnelEditable(funnel: FunnelData): boolean {
  return funnel.status !== "archived";
}

/**
 * Check if funnel is live
 */
export function isFunnelLive(funnel: FunnelData): boolean {
  return funnel.status === "published";
}
