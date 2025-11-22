/**
 * FunnelService - Business logic for funnel management
 *
 * This service implements the core business logic for managing funnels
 * using Effect.ts patterns. All operations enforce multi-tenant isolation
 * through groupId validation.
 *
 * Key Features:
 * - Multi-tenant isolation (groupId scoping)
 * - Role-based access control
 * - Pure business logic (no database calls)
 * - Composable with Effect.gen
 *
 * @see /one/knowledge/ontology.md - 6-dimension ontology
 * @see /backend/CLAUDE.md - Backend patterns
 */

import { Effect, Context } from "effect";
import {
  FunnelNotFoundError,
  FunnelAlreadyPublishedError,
  InvalidFunnelSequenceError,
  UnauthorizedFunnelAccessError,
  FunnelLimitExceededError,
  FunnelInvalidStatusError,
  FunnelDuplicateNameError,
} from "./errors";

// ============================================================================
// Types
// ============================================================================

export interface Funnel {
  _id: string;
  type: "funnel";
  name: string;
  groupId: string;
  properties: {
    slug?: string;
    description?: string;
    stepCount?: number;
    settings?: FunnelSettings;
  };
  status: "draft" | "active" | "published" | "archived";
  createdAt: number;
  updatedAt: number;
}

export interface FunnelSettings {
  seo?: {
    title?: string;
    description?: string;
    ogImage?: string;
  };
  tracking?: {
    googleAnalytics?: string;
    facebookPixel?: string;
    customScripts?: string[];
  };
  branding?: {
    logo?: string;
    favicon?: string;
    colors?: {
      primary?: string;
      secondary?: string;
    };
  };
}

export interface Person {
  _id: string;
  type: "creator" | "customer" | "team_member";
  groupId: string;
  properties: {
    email: string;
    role: "platform_owner" | "org_owner" | "org_user" | "customer";
  };
}

export interface Group {
  _id: string;
  slug: string;
  name: string;
  type: string;
  status: "active" | "inactive" | "suspended" | "archived";
  settings?: {
    limits?: {
      maxFunnels?: number;
      maxStepsPerFunnel?: number;
    };
  };
}

// ============================================================================
// Access Control Helpers
// ============================================================================

/**
 * Check if a user has access to a specific group
 *
 * Rules:
 * - platform_owner: Access to all groups
 * - org_owner: Access only to their group
 * - org_user: Access only to their group
 * - customer: No access to funnel management
 *
 * @param person - The user requesting access
 * @param groupId - The group being accessed
 * @returns Effect that succeeds if access is granted, fails with UnauthorizedFunnelAccessError otherwise
 */
export const checkGroupAccess = (
  person: Person,
  groupId: string
): Effect.Effect<void, UnauthorizedFunnelAccessError> =>
  Effect.gen(function* () {
    const role = person.properties.role;

    // Platform owners have access to all groups
    if (role === "platform_owner") {
      return;
    }

    // Customers cannot manage funnels
    if (role === "customer") {
      return yield* Effect.fail(
        new UnauthorizedFunnelAccessError({
          message: "Customers cannot manage funnels",
          userId: person._id,
          funnelId: groupId,
        })
      );
    }

    // Org owners and org users can only access their own group
    if (person.groupId !== groupId) {
      return yield* Effect.fail(
        new UnauthorizedFunnelAccessError({
          message: "No access to this group",
          userId: person._id,
          funnelId: groupId,
        })
      );
    }
  });

/**
 * Check if a user has access to a specific funnel
 *
 * @param person - The user requesting access
 * @param funnel - The funnel being accessed
 * @returns Effect that succeeds if access is granted, fails with UnauthorizedFunnelAccessError otherwise
 */
export const checkFunnelAccess = (
  person: Person,
  funnel: Funnel
): Effect.Effect<void, UnauthorizedFunnelAccessError> =>
  Effect.gen(function* () {
    // Check access to the funnel's group
    yield* checkGroupAccess(person, funnel.groupId);
  });

/**
 * Check if a user can modify a funnel (requires org_owner or platform_owner)
 *
 * @param person - The user requesting access
 * @param funnel - The funnel being modified
 * @returns Effect that succeeds if modification is allowed, fails with UnauthorizedFunnelAccessError otherwise
 */
export const checkFunnelModifyAccess = (
  person: Person,
  funnel: Funnel
): Effect.Effect<void, UnauthorizedFunnelAccessError> =>
  Effect.gen(function* () {
    // First check basic access
    yield* checkFunnelAccess(person, funnel);

    const role = person.properties.role;

    // Only platform_owner and org_owner can modify funnels
    if (role !== "platform_owner" && role !== "org_owner") {
      return yield* Effect.fail(
        new UnauthorizedFunnelAccessError({
          message: "Only organization owners can modify funnels",
          userId: person._id,
          funnelId: funnel._id,
        })
      );
    }
  });

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate that a funnel can be published
 *
 * Requirements:
 * - Must be in draft or active status
 * - Must have at least one step
 *
 * @param funnel - The funnel to validate
 * @returns Effect that succeeds with the funnel, fails with appropriate error
 */
export const validateForPublish = (
  funnel: Funnel
): Effect.Effect<
  Funnel,
  FunnelAlreadyPublishedError | InvalidFunnelSequenceError
> =>
  Effect.gen(function* () {
    // Check if already published
    if (funnel.status === "published") {
      return yield* Effect.fail(
        new FunnelAlreadyPublishedError({
          message: "Funnel is already published",
          funnelId: funnel._id,
        })
      );
    }

    // Check if funnel has steps
    const stepCount = funnel.properties.stepCount ?? 0;
    if (stepCount === 0) {
      return yield* Effect.fail(
        new InvalidFunnelSequenceError({
          message: "Funnel must have at least one step before publishing",
          details: `Funnel "${funnel.name}" has ${stepCount} steps`,
        })
      );
    }

    return funnel;
  });

/**
 * Validate that a funnel can be unpublished
 *
 * @param funnel - The funnel to validate
 * @returns Effect that succeeds with the funnel, fails with FunnelInvalidStatusError
 */
export const validateForUnpublish = (
  funnel: Funnel
): Effect.Effect<Funnel, FunnelInvalidStatusError> =>
  Effect.gen(function* () {
    if (funnel.status !== "published") {
      return yield* Effect.fail(
        new FunnelInvalidStatusError({
          message: "Only published funnels can be unpublished",
          funnelId: funnel._id,
          currentStatus: funnel.status,
          requestedStatus: "active",
        })
      );
    }

    return funnel;
  });

/**
 * Check if group has reached funnel limit
 *
 * @param group - The group to check
 * @param currentCount - Current number of funnels in the group
 * @returns Effect that succeeds if under limit, fails with FunnelLimitExceededError
 */
export const checkFunnelLimit = (
  group: Group,
  currentCount: number
): Effect.Effect<void, FunnelLimitExceededError> =>
  Effect.gen(function* () {
    const maxFunnels = group.settings?.limits?.maxFunnels ?? 100;

    if (currentCount >= maxFunnels) {
      return yield* Effect.fail(
        new FunnelLimitExceededError({
          message: `Group has reached maximum funnel limit of ${maxFunnels}`,
          organizationId: group._id,
          currentCount,
          limit: maxFunnels,
        })
      );
    }
  });

/**
 * Check if funnel name is unique within group
 *
 * @param groupId - The group to check
 * @param name - The funnel name to check
 * @param existingFunnel - Existing funnel with this name (if any)
 * @returns Effect that succeeds if name is unique, fails with FunnelDuplicateNameError
 */
export const checkUniqueFunnelName = (
  groupId: string,
  name: string,
  existingFunnel: Funnel | null
): Effect.Effect<void, FunnelDuplicateNameError> =>
  Effect.gen(function* () {
    if (existingFunnel) {
      return yield* Effect.fail(
        new FunnelDuplicateNameError({
          message: `A funnel with the name "${name}" already exists in this organization`,
          name,
          organizationId: groupId,
        })
      );
    }
  });

// ============================================================================
// Event Logging Helpers
// ============================================================================

/**
 * Event log structure for audit trail
 */
export interface EventLogInput {
  type: string;
  actorId: string;
  targetId?: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

/**
 * Prepare event data for funnel creation
 *
 * @param funnelId - The created funnel ID
 * @param userId - The user who created the funnel
 * @param groupId - The group the funnel belongs to
 * @param funnelName - The name of the funnel
 * @param category - The funnel category
 * @returns Event log input for funnel_created event
 */
export const prepareFunnelCreatedEvent = (
  funnelId: string,
  userId: string,
  groupId: string,
  funnelName: string,
  category: string
): EventLogInput => ({
  type: "funnel_created",
  actorId: userId,
  targetId: funnelId,
  timestamp: Date.now(),
  metadata: {
    groupId,
    funnelName,
    category,
    protocol: "clickfunnels-builder",
  },
});

/**
 * Prepare event data for funnel update
 *
 * @param funnelId - The updated funnel ID
 * @param userId - The user who updated the funnel
 * @param groupId - The group the funnel belongs to
 * @param updatedFields - Array of field names that were updated
 * @returns Event log input for entity_updated event (funnel type)
 */
export const prepareFunnelUpdatedEvent = (
  funnelId: string,
  userId: string,
  groupId: string,
  updatedFields: string[]
): EventLogInput => ({
  type: "entity_updated",
  actorId: userId,
  targetId: funnelId,
  timestamp: Date.now(),
  metadata: {
    groupId,
    entityType: "funnel",
    updatedFields,
    protocol: "clickfunnels-builder",
  },
});

/**
 * Prepare event data for funnel publish
 *
 * @param funnelId - The published funnel ID
 * @param userId - The user who published the funnel
 * @param groupId - The group the funnel belongs to
 * @param funnelName - The name of the funnel
 * @returns Event log input for funnel_published event
 */
export const prepareFunnelPublishedEvent = (
  funnelId: string,
  userId: string,
  groupId: string,
  funnelName: string
): EventLogInput => ({
  type: "funnel_published",
  actorId: userId,
  targetId: funnelId,
  timestamp: Date.now(),
  metadata: {
    groupId,
    funnelName,
    publishedAt: Date.now(),
    protocol: "clickfunnels-builder",
  },
});

/**
 * Prepare event data for funnel unpublish
 *
 * @param funnelId - The unpublished funnel ID
 * @param userId - The user who unpublished the funnel
 * @param groupId - The group the funnel belongs to
 * @param funnelName - The name of the funnel
 * @returns Event log input for funnel_unpublished event
 */
export const prepareFunnelUnpublishedEvent = (
  funnelId: string,
  userId: string,
  groupId: string,
  funnelName: string
): EventLogInput => ({
  type: "funnel_unpublished",
  actorId: userId,
  targetId: funnelId,
  timestamp: Date.now(),
  metadata: {
    groupId,
    funnelName,
    unpublishedAt: Date.now(),
    protocol: "clickfunnels-builder",
  },
});

/**
 * Prepare event data for funnel duplication
 *
 * @param originalFunnelId - The ID of the original funnel
 * @param newFunnelId - The ID of the duplicated funnel
 * @param userId - The user who duplicated the funnel
 * @param groupId - The group the funnels belong to
 * @param originalName - The name of the original funnel
 * @param newName - The name of the new funnel
 * @returns Event log input for funnel_duplicated event
 */
export const prepareFunnelDuplicatedEvent = (
  originalFunnelId: string,
  newFunnelId: string,
  userId: string,
  groupId: string,
  originalName: string,
  newName: string
): EventLogInput => ({
  type: "funnel_duplicated",
  actorId: userId,
  targetId: newFunnelId,
  timestamp: Date.now(),
  metadata: {
    groupId,
    originalFunnelId,
    originalName,
    newName,
    protocol: "clickfunnels-builder",
  },
});

/**
 * Prepare event data for funnel archive
 *
 * @param funnelId - The archived funnel ID
 * @param userId - The user who archived the funnel
 * @param groupId - The group the funnel belongs to
 * @param funnelName - The name of the funnel
 * @returns Event log input for funnel_archived event
 */
export const prepareFunnelArchivedEvent = (
  funnelId: string,
  userId: string,
  groupId: string,
  funnelName: string
): EventLogInput => ({
  type: "funnel_archived",
  actorId: userId,
  targetId: funnelId,
  timestamp: Date.now(),
  metadata: {
    groupId,
    funnelName,
    archivedAt: Date.now(),
    protocol: "clickfunnels-builder",
  },
});

// ============================================================================
// Business Logic
// ============================================================================

export const FunnelService = {
  /**
   * Validate funnel can be published
   */
  validateForPublish,

  /**
   * Validate funnel can be unpublished
   */
  validateForUnpublish,

  /**
   * Check group access
   */
  checkGroupAccess,

  /**
   * Check funnel access
   */
  checkFunnelAccess,

  /**
   * Check funnel modify access
   */
  checkFunnelModifyAccess,

  /**
   * Check funnel limit
   */
  checkFunnelLimit,

  /**
   * Check unique funnel name
   */
  checkUniqueFunnelName,

  /**
   * Generate a URL-safe slug from funnel name
   */
  generateSlug: (name: string): Effect.Effect<string> =>
    Effect.sync(() =>
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
    ),

  /**
   * Calculate funnel metrics from events
   */
  calculateMetrics: (events: any[]): Effect.Effect<FunnelMetrics> =>
    Effect.sync(() => {
      const visitors = new Set(events.map((e) => e.actorId)).size;
      const submissions = events.filter(
        (e) => e.type === "form_submitted"
      ).length;
      const purchases = events.filter(
        (e) => e.type === "purchase_completed"
      ).length;

      const conversionRate = visitors > 0 ? purchases / visitors : 0;
      const submissionRate = visitors > 0 ? submissions / visitors : 0;

      const revenue = events
        .filter((e) => e.type === "purchase_completed")
        .reduce((sum, e) => sum + (e.metadata?.amount || 0), 0);

      return {
        visitors,
        submissions,
        purchases,
        conversionRate,
        submissionRate,
        revenue,
      };
    }),

  /**
   * Event preparation functions for audit trail
   */
  prepareFunnelCreatedEvent,
  prepareFunnelUpdatedEvent,
  prepareFunnelPublishedEvent,
  prepareFunnelUnpublishedEvent,
  prepareFunnelDuplicatedEvent,
  prepareFunnelArchivedEvent,
};

export interface FunnelMetrics {
  visitors: number;
  submissions: number;
  purchases: number;
  conversionRate: number;
  submissionRate: number;
  revenue: number;
}
