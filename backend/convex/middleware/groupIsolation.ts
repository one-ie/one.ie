/**
 * GROUP ISOLATION MIDDLEWARE
 *
 * Enforces multi-tenant isolation by validating that all operations
 * stay within a single group. Prevents cross-tenant data leakage.
 *
 * Pattern: Use createGroupIsolationMiddleware(groupId) to wrap queries
 * and ensure all accessed entities belong to the same group.
 *
 * CRITICAL: This must be applied to EVERY query and mutation that touches
 * grouped data (things, connections, events, knowledge).
 *
 * Validation checks:
 * 1. validateThing(ctx, thingId) - Ensure thing.groupId === groupId
 * 2. validateConnection(ctx, fromId, toId) - Ensure both things same groupId
 * 3. validateEvent(ctx, actorId?, targetId?) - Ensure all actors/targets same groupId
 */

import { QueryCtx, MutationCtx } from "../_generated/server";

export interface GroupIsolationMiddleware {
  validateThing: (ctx: QueryCtx | MutationCtx, thingId: string) => Promise<void>;
  validateConnection: (
    ctx: QueryCtx | MutationCtx,
    fromId: string,
    toId: string
  ) => Promise<void>;
  validateEvent: (
    ctx: QueryCtx | MutationCtx,
    actorId?: string,
    targetId?: string
  ) => Promise<void>;
  groupId: string;
}

/**
 * Create a group isolation middleware for a specific group
 *
 * @param groupId - The group to isolate
 * @returns Middleware object with validators
 */
export function createGroupIsolationMiddleware(
  groupId: string
): GroupIsolationMiddleware {
  return {
    groupId,

    /**
     * Validate that a thing belongs to this group
     *
     * @throws Error if thing not found or belongs to different group
     */
    validateThing: async (
      ctx: QueryCtx | MutationCtx,
      thingId: string
    ): Promise<void> => {
      const thing = await ctx.db.get(thingId as any);

      if (!thing) {
        throw new Error(`Access denied: Thing ${thingId} not found`);
      }

      if ((thing as any).groupId !== groupId) {
        throw new Error(
          `Access denied: Cross-group reference. Thing ${thingId} belongs to group ${(thing as any).groupId}, not ${groupId}`
        );
      }
    },

    /**
     * Validate that both things in a connection belong to this group
     *
     * @throws Error if either thing not found or belongs to different group
     */
    validateConnection: async (
      ctx: QueryCtx | MutationCtx,
      fromId: string,
      toId: string
    ): Promise<void> => {
      const fromThing = await ctx.db.get(fromId as any);
      const toThing = await ctx.db.get(toId as any);

      if (!fromThing) {
        throw new Error(
          `Access denied: From entity ${fromId} not found in group ${groupId}`
        );
      }

      if (!toThing) {
        throw new Error(
          `Access denied: To entity ${toId} not found in group ${groupId}`
        );
      }

      if ((fromThing as any).groupId !== groupId) {
        throw new Error(
          `Access denied: Cross-group reference. From entity ${fromId} belongs to group ${(fromThing as any).groupId}, not ${groupId}`
        );
      }

      if ((toThing as any).groupId !== groupId) {
        throw new Error(
          `Access denied: Cross-group reference. To entity ${toId} belongs to group ${(toThing as any).groupId}, not ${groupId}`
        );
      }
    },

    /**
     * Validate that event participants (actor and target) belong to this group
     *
     * @param actorId - Optional actor ID
     * @param targetId - Optional target ID
     * @throws Error if any specified entity belongs to different group
     */
    validateEvent: async (
      ctx: QueryCtx | MutationCtx,
      actorId?: string,
      targetId?: string
    ): Promise<void> => {
      if (actorId) {
        const actor = await ctx.db.get(actorId as any);

        if (actor && (actor as any).groupId !== groupId) {
          throw new Error(
            `Access denied: Cross-group reference. Actor ${actorId} belongs to group ${(actor as any).groupId}, not ${groupId}`
          );
        }
      }

      if (targetId) {
        const target = await ctx.db.get(targetId as any);

        if (target && (target as any).groupId !== groupId) {
          throw new Error(
            `Access denied: Cross-group reference. Target ${targetId} belongs to group ${(target as any).groupId}, not ${groupId}`
          );
        }
      }
    },
  };
}

/**
 * HIERARCHICAL GROUP VALIDATION
 *
 * Extended validation for hierarchical group access.
 * Parent groups can access child groups' data (configurable).
 *
 * Example: Organization (parent) can access Department (child) data
 */
export interface HierarchicalGroupValidation {
  validateGroupAccess: (
    ctx: QueryCtx | MutationCtx,
    userGroupId: string,
    dataGroupId: string
  ) => Promise<boolean>;
}

/**
 * Validate hierarchical group access
 *
 * Rules:
 * - User's group === data's group → Always allow (same tenant)
 * - User's group is parent of data's group → Allow (parent can access child)
 * - User's group is child of data's group → Deny (child cannot access parent)
 * - User's group is sibling of data's group → Deny (isolation)
 *
 * @param ctx - Convex context
 * @param userGroupId - User's primary group
 * @param dataGroupId - Data's group
 * @returns true if access allowed, false otherwise
 */
export async function validateGroupAccess(
  ctx: QueryCtx | MutationCtx,
  userGroupId: string,
  dataGroupId: string
): Promise<boolean> {
  // Same group - always allow
  if (userGroupId === dataGroupId) {
    return true;
  }

  // Check if user's group is parent of data's group
  let currentGroup = await ctx.db.get(dataGroupId as any);

  while (currentGroup && (currentGroup as any).parentGroupId) {
    if ((currentGroup as any).parentGroupId === userGroupId) {
      return true; // User's group is ancestor
    }
    currentGroup = await ctx.db.get((currentGroup as any).parentGroupId);
  }

  // User's group is not ancestor - deny access
  return false;
}

/**
 * SANITIZED QUERY FACTORY
 *
 * Creates a wrapped query function that automatically enforces group isolation.
 * Instead of manually calling validateThing in every query, use this factory.
 *
 * Usage:
 *   const getThing = createGroupSafeQuery(
 *     async (ctx, id) => await ctx.db.get(id),
 *     { groupId, validateOnAccess: true }
 *   )
 */
export interface GroupSafeQueryOptions {
  groupId: string;
  validateOnAccess?: boolean; // Validate on first access
  validateAllReferences?: boolean; // Validate nested references
}

export function createGroupSafeQuery<T, U>(
  queryFn: (ctx: QueryCtx | MutationCtx, args: T) => Promise<U>,
  options: GroupSafeQueryOptions
) {
  return async (
    ctx: QueryCtx | MutationCtx,
    args: T
  ): Promise<U> => {
    const middleware = createGroupIsolationMiddleware(options.groupId);

    // Execute query
    const result = await queryFn(ctx, args);

    // Optional: Validate result if it's a thing/connection with groupId
    if (options.validateOnAccess && result) {
      const anyResult = result as any;
      if (anyResult.groupId && anyResult.groupId !== options.groupId) {
        throw new Error(
          `Access denied: Result belongs to group ${anyResult.groupId}, not ${options.groupId}`
        );
      }
    }

    return result;
  };
}

/**
 * GROUP ISOLATION TESTING UTILITIES
 *
 * For testing and debugging group isolation violations
 */
export const GroupIsolationTests = {
  /**
   * Find all cross-group references in connections
   * Returns connections that violate isolation
   */
  findCrossGroupConnections: async (ctx: QueryCtx | MutationCtx) => {
    const violations: any[] = [];

    const connections = await ctx.db.query("connections").collect();

    for (const conn of connections) {
      const fromThing = await ctx.db.get((conn as any).fromEntityId);
      const toThing = await ctx.db.get((conn as any).toEntityId);

      if (
        fromThing &&
        toThing &&
        (fromThing as any).groupId !== (toThing as any).groupId
      ) {
        violations.push({
          connectionId: conn._id,
          fromGroupId: (fromThing as any).groupId,
          toGroupId: (toThing as any).groupId,
          relationshipType: (conn as any).relationshipType,
        });
      }

      if (
        fromThing &&
        (fromThing as any).groupId !== (conn as any).groupId
      ) {
        violations.push({
          connectionId: conn._id,
          issue: "From entity in different group",
          fromThingGroupId: (fromThing as any).groupId,
          connectionGroupId: (conn as any).groupId,
        });
      }

      if (toThing && (toThing as any).groupId !== (conn as any).groupId) {
        violations.push({
          connectionId: conn._id,
          issue: "To entity in different group",
          toThingGroupId: (toThing as any).groupId,
          connectionGroupId: (conn as any).groupId,
        });
      }
    }

    return violations;
  },

  /**
   * Find all events with orphaned actors/targets
   */
  findOrphanedEventReferences: async (ctx: QueryCtx | MutationCtx) => {
    const violations: any[] = [];

    const events = await ctx.db.query("events").collect();

    for (const event of events) {
      const groupId = (event as any).groupId;
      const actorId = (event as any).actorId;
      const targetId = (event as any).targetId;

      if (actorId) {
        const actor = await ctx.db.get(actorId);
        if (!actor) {
          violations.push({
            eventId: event._id,
            issue: "Actor not found",
            actorId,
            groupId,
          });
        } else if ((actor as any).groupId !== groupId) {
          violations.push({
            eventId: event._id,
            issue: "Actor in different group",
            actorGroupId: (actor as any).groupId,
            eventGroupId: groupId,
          });
        }
      }

      if (targetId) {
        const target = await ctx.db.get(targetId);
        if (!target) {
          violations.push({
            eventId: event._id,
            issue: "Target not found",
            targetId,
            groupId,
          });
        } else if ((target as any).groupId !== groupId) {
          violations.push({
            eventId: event._id,
            issue: "Target in different group",
            targetGroupId: (target as any).groupId,
            eventGroupId: groupId,
          });
        }
      }
    }

    return violations;
  },
};
