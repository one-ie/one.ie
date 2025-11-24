import { internalAction } from "../_generated/server";
import { v } from "convex/values";

/**
 * INTERNAL ACTIONS: Event Logging
 *
 * Centralized event logging for audit trail
 * Called by mutations/queries/actions to record all changes
 * Ensures consistent event structure across system
 */

/**
 * Log entity created event
 * Called by mutations.entities.create
 */
export const logEntityCreated = internalAction({
  args: {
    groupId: v.id("groups"),
    entityId: v.id("entities"),
    entityType: v.string(),
    entityName: v.string(),
    actorId: v.id("entities"),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    console.log(
      `[LOG] Entity created: ${args.entityType} "${args.entityName}" by ${args.actorId}`
    );

    // In production: insert event record
    return {
      success: true,
      eventId: `evt_${Date.now()}`,
      eventType: "thing_created",
      groupId: args.groupId,
      entityId: args.entityId,
      actorId: args.actorId,
      loggedAt: Date.now(),
    };
  },
});

/**
 * Log entity updated event
 * Called by mutations.entities.update
 */
export const logEntityUpdated = internalAction({
  args: {
    groupId: v.id("groups"),
    entityId: v.id("entities"),
    entityType: v.string(),
    changes: v.array(v.string()),
    actorId: v.id("entities"),
  },
  handler: async (ctx, args) => {
    console.log(
      `[LOG] Entity updated: ${args.entityType} changed [${args.changes.join(", ")}]`
    );

    return {
      success: true,
      eventId: `evt_${Date.now()}`,
      eventType: "thing_updated",
      groupId: args.groupId,
      entityId: args.entityId,
      actorId: args.actorId,
      changes: args.changes,
      loggedAt: Date.now(),
    };
  },
});

/**
 * Log entity archived event
 * Called by mutations.entities.archive
 */
export const logEntityArchived = internalAction({
  args: {
    groupId: v.id("groups"),
    entityId: v.id("entities"),
    entityType: v.string(),
    actorId: v.id("entities"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    console.log(`[LOG] Entity archived: ${args.entityType}`);

    return {
      success: true,
      eventId: `evt_${Date.now()}`,
      eventType: "thing_deleted",
      groupId: args.groupId,
      entityId: args.entityId,
      actorId: args.actorId,
      metadata: { reason: args.reason || "user_archived" },
      loggedAt: Date.now(),
    };
  },
});

/**
 * Log connection created event
 * Called by mutations.connections.create
 */
export const logConnectionCreated = internalAction({
  args: {
    groupId: v.id("groups"),
    connectionId: v.id("connections"),
    relationshipType: v.string(),
    fromEntityId: v.id("entities"),
    toEntityId: v.id("entities"),
    actorId: v.id("entities"),
  },
  handler: async (ctx, args) => {
    console.log(
      `[LOG] Connection created: ${args.relationshipType} from ${args.fromEntityId}`
    );

    return {
      success: true,
      eventId: `evt_${Date.now()}`,
      eventType: "connection_created",
      groupId: args.groupId,
      connectionId: args.connectionId,
      actorId: args.actorId,
      relationshipType: args.relationshipType,
      loggedAt: Date.now(),
    };
  },
});

/**
 * Log connection updated event
 * Called by mutations.connections.upsert (update case)
 */
export const logConnectionUpdated = internalAction({
  args: {
    groupId: v.id("groups"),
    connectionId: v.id("connections"),
    relationshipType: v.string(),
    changes: v.array(v.string()),
    actorId: v.id("entities"),
  },
  handler: async (ctx, args) => {
    console.log(
      `[LOG] Connection updated: ${args.relationshipType} changed [${args.changes.join(", ")}]`
    );

    return {
      success: true,
      eventId: `evt_${Date.now()}`,
      eventType: "connection_updated",
      groupId: args.groupId,
      connectionId: args.connectionId,
      actorId: args.actorId,
      changes: args.changes,
      loggedAt: Date.now(),
    };
  },
});

/**
 * Log knowledge created event
 * Called by mutations.knowledge.create
 */
export const logKnowledgeCreated = internalAction({
  args: {
    groupId: v.id("groups"),
    knowledgeId: v.id("knowledge"),
    knowledgeType: v.string(),
    labels: v.optional(v.array(v.string())),
    actorId: v.id("entities"),
  },
  handler: async (ctx, args) => {
    console.log(
      `[LOG] Knowledge created: ${args.knowledgeType} with labels [${(args.labels || []).join(", ")}]`
    );

    return {
      success: true,
      eventId: `evt_${Date.now()}`,
      eventType: "knowledge_created",
      groupId: args.groupId,
      knowledgeId: args.knowledgeId,
      actorId: args.actorId,
      knowledgeType: args.knowledgeType,
      loggedAt: Date.now(),
    };
  },
});

/**
 * Log knowledge updated event
 * Called by mutations.knowledge.update
 */
export const logKnowledgeUpdated = internalAction({
  args: {
    groupId: v.id("groups"),
    knowledgeId: v.id("knowledge"),
    changes: v.array(v.string()),
    actorId: v.id("entities"),
  },
  handler: async (ctx, args) => {
    console.log(`[LOG] Knowledge updated: [${args.changes.join(", ")}]`);

    return {
      success: true,
      eventId: `evt_${Date.now()}`,
      eventType: "knowledge_updated",
      groupId: args.groupId,
      knowledgeId: args.knowledgeId,
      actorId: args.actorId,
      changes: args.changes,
      loggedAt: Date.now(),
    };
  },
});

/**
 * Log group event
 * Generic logging for group operations
 */
export const logGroupEvent = internalAction({
  args: {
    groupId: v.id("groups"),
    eventType: v.string(),
    actorId: v.optional(v.id("entities")),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    console.log(`[LOG] Group event: ${args.eventType} on group ${args.groupId}`);

    return {
      success: true,
      eventId: `evt_${Date.now()}`,
      eventType: args.eventType,
      groupId: args.groupId,
      actorId: args.actorId,
      metadata: args.metadata,
      loggedAt: Date.now(),
    };
  },
});

/**
 * Log user action event
 * Generic logging for user actions (login, export, etc.)
 */
export const logUserAction = internalAction({
  args: {
    userId: v.string(),
    groupId: v.id("groups"),
    action: v.string(),
    resource: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    console.log(`[LOG] User action: ${args.action} on ${args.resource || "resource"}`);

    return {
      success: true,
      eventId: `evt_${Date.now()}`,
      userId: args.userId,
      groupId: args.groupId,
      action: args.action,
      resource: args.resource,
      metadata: args.metadata,
      loggedAt: Date.now(),
    };
  },
});

/**
 * Log error event
 * Logs errors for debugging and monitoring
 */
export const logErrorEvent = internalAction({
  args: {
    groupId: v.optional(v.id("groups")),
    errorType: v.string(),
    errorMessage: v.string(),
    context: v.optional(v.any()),
    severity: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("critical")
    ),
  },
  handler: async (ctx, args) => {
    console.error(`[ERROR] ${args.severity.toUpperCase()}: ${args.errorType} - ${args.errorMessage}`);

    return {
      success: true,
      eventId: `err_${Date.now()}`,
      errorType: args.errorType,
      severity: args.severity,
      groupId: args.groupId,
      loggedAt: Date.now(),
    };
  },
});
