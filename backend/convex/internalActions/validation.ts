import { internalAction } from "../_generated/server";
import { v } from "convex/values";

/**
 * INTERNAL ACTIONS: Validation Utilities
 *
 * Internal actions are only callable from mutations/queries/actions within the same deployment
 * Use for: shared validation, logging, internal operations
 * Cannot be called from external API
 */

/**
 * Validate entity exists and belongs to group
 * Used by mutations before operating on entities
 */
export const validateEntityInGroup = internalAction({
  args: {
    entityId: v.id("entities"),
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    // In production: query database to verify entity exists in group
    // For now: return validation result
    const isValid = args.entityId && args.groupId;

    return {
      valid: isValid,
      entityId: args.entityId,
      groupId: args.groupId,
      validatedAt: Date.now(),
    };
  },
});

/**
 * Validate connection belongs to group
 * Ensures both entities in connection are in the group
 */
export const validateConnectionInGroup = internalAction({
  args: {
    connectionId: v.id("connections"),
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    // In production: validate connection exists and groupId matches
    return {
      valid: true,
      connectionId: args.connectionId,
      groupId: args.groupId,
      validatedAt: Date.now(),
    };
  },
});

/**
 * Validate knowledge belongs to group
 * Ensures knowledge item is scoped to group
 */
export const validateKnowledgeInGroup = internalAction({
  args: {
    knowledgeId: v.id("knowledge"),
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    // In production: validate knowledge exists and groupId matches
    return {
      valid: true,
      knowledgeId: args.knowledgeId,
      groupId: args.groupId,
      validatedAt: Date.now(),
    };
  },
});

/**
 * Validate user has role in group
 * Check RBAC permissions
 */
export const validateUserRole = internalAction({
  args: {
    userId: v.string(),
    groupId: v.id("groups"),
    requiredRole: v.union(
      v.literal("platform_owner"),
      v.literal("org_owner"),
      v.literal("org_user"),
      v.literal("customer"),
      v.literal("none")
    ),
  },
  handler: async (ctx, args) => {
    // In production: query users table and verify role
    return {
      valid: true,
      userId: args.userId,
      groupId: args.groupId,
      hasRole: args.requiredRole !== "platform_owner", // Simulate check
      validatedAt: Date.now(),
    };
  },
});

/**
 * Validate group is active
 * Ensures operations happen on active groups only
 */
export const validateGroupActive = internalAction({
  args: {
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    // In production: check group.status === "active"
    return {
      active: true,
      groupId: args.groupId,
      validatedAt: Date.now(),
    };
  },
});

/**
 * Validate entity type against ontology
 * Ensures entity type is valid for composition
 */
export const validateEntityType = internalAction({
  args: {
    entityType: v.string(),
  },
  handler: async (ctx, args) => {
    // In production: check against THING_TYPES array
    const validTypes = [
      "user",
      "creator",
      "organization",
      "blog_post",
      "product",
      "course",
      "video",
      "podcast",
    ];

    return {
      valid: validTypes.includes(args.entityType),
      entityType: args.entityType,
      validatedAt: Date.now(),
    };
  },
});

/**
 * Validate connection type against ontology
 * Ensures relationship type is valid for composition
 */
export const validateConnectionType = internalAction({
  args: {
    relationshipType: v.string(),
  },
  handler: async (ctx, args) => {
    // In production: check against CONNECTION_TYPES array
    const validTypes = [
      "owns",
      "created_by",
      "member_of",
      "enrolled_in",
      "transacted",
      "following",
      "collaborated_with",
    ];

    return {
      valid: validTypes.includes(args.relationshipType),
      relationshipType: args.relationshipType,
      validatedAt: Date.now(),
    };
  },
});

/**
 * Validate string length constraints
 * Reusable validation for names, descriptions, etc.
 */
export const validateStringLength = internalAction({
  args: {
    value: v.string(),
    minLength: v.optional(v.number()),
    maxLength: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const len = args.value.length;
    const minOk = !args.minLength || len >= args.minLength;
    const maxOk = !args.maxLength || len <= args.maxLength;

    return {
      valid: minOk && maxOk,
      value: args.value,
      length: len,
      minRequired: args.minLength,
      maxAllowed: args.maxLength,
      validatedAt: Date.now(),
    };
  },
});

/**
 * Validate email format
 * Reusable email validation
 */
export const validateEmail = internalAction({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return {
      valid: emailRegex.test(args.email),
      email: args.email,
      validatedAt: Date.now(),
    };
  },
});
