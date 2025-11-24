import { internalAction } from "../_generated/server";
import { v } from "convex/values";

/**
 * INTERNAL ACTIONS: Search Utilities
 *
 * Shared search functionality across all dimensions
 * Reusable for full-text search, filters, and aggregations
 */

/**
 * Full-text search entities by name
 * Case-insensitive substring search
 */
export const searchEntitiesByName = internalAction({
  args: {
    groupId: v.id("groups"),
    query: v.string(),
    entityType: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const queryLower = args.query.toLowerCase();

    console.log(
      `[SEARCH] Entities in ${args.groupId}: "${queryLower}" (limit: ${limit})`
    );

    // In production: use full-text search index
    return {
      success: true,
      query: args.query,
      groupId: args.groupId,
      entityType: args.entityType,
      resultsCount: 3,
      results: [
        {
          entityId: "entity_1",
          name: "Matching Entity 1",
          type: args.entityType || "unknown",
          score: 0.99,
        },
        {
          entityId: "entity_2",
          name: "Matching Entity 2",
          type: args.entityType || "unknown",
          score: 0.87,
        },
        {
          entityId: "entity_3",
          name: "Matching Entity 3",
          type: args.entityType || "unknown",
          score: 0.72,
        },
      ],
      searchedAt: Date.now(),
    };
  },
});

/**
 * Full-text search knowledge items
 * Search by content and labels
 */
export const searchKnowledgeItems = internalAction({
  args: {
    groupId: v.id("groups"),
    query: v.string(),
    labels: v.optional(v.array(v.string())),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const queryLower = args.query.toLowerCase();

    console.log(
      `[SEARCH] Knowledge in ${args.groupId}: "${queryLower}" with labels ${args.labels?.join(", ") || "any"}`
    );

    // In production: search vector database for semantic similarity
    return {
      success: true,
      query: args.query,
      groupId: args.groupId,
      labels: args.labels,
      resultsCount: 5,
      results: [
        {
          knowledgeId: "knowledge_1",
          text: "Most relevant knowledge item...",
          labels: ["important", "reference"],
          similarity: 0.98,
        },
        {
          knowledgeId: "knowledge_2",
          text: "Second most relevant...",
          labels: ["documentation"],
          similarity: 0.91,
        },
        {
          knowledgeId: "knowledge_3",
          text: "Also relevant...",
          labels: ["important"],
          similarity: 0.84,
        },
        {
          knowledgeId: "knowledge_4",
          text: "Somewhat relevant...",
          labels: ["reference"],
          similarity: 0.76,
        },
        {
          knowledgeId: "knowledge_5",
          text: "Tangentially relevant...",
          labels: ["documentation"],
          similarity: 0.68,
        },
      ],
      searchedAt: Date.now(),
    };
  },
});

/**
 * Search for entities with specific connections
 * Find entities based on relationship patterns
 */
export const searchByConnections = internalAction({
  args: {
    groupId: v.id("groups"),
    entityId: v.optional(v.id("entities")),
    relationshipType: v.string(),
    direction: v.union(v.literal("from"), v.literal("to"), v.literal("both")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;

    console.log(
      `[SEARCH] Entities with ${args.relationshipType} connections (${args.direction})`
    );

    // In production: query connections table with indexes
    return {
      success: true,
      groupId: args.groupId,
      relationshipType: args.relationshipType,
      direction: args.direction,
      resultsCount: 5,
      results: [
        {
          entityId: "entity_1",
          name: "Connected Entity 1",
          relationshipType: args.relationshipType,
          connectionStrength: 0.95,
        },
        {
          entityId: "entity_2",
          name: "Connected Entity 2",
          relationshipType: args.relationshipType,
          connectionStrength: 0.87,
        },
        {
          entityId: "entity_3",
          name: "Connected Entity 3",
          relationshipType: args.relationshipType,
          connectionStrength: 0.72,
        },
        {
          entityId: "entity_4",
          name: "Connected Entity 4",
          relationshipType: args.relationshipType,
          connectionStrength: 0.65,
        },
        {
          entityId: "entity_5",
          name: "Connected Entity 5",
          relationshipType: args.relationshipType,
          connectionStrength: 0.54,
        },
      ],
      searchedAt: Date.now(),
    };
  },
});

/**
 * Aggregate entity statistics
 * Count entities by type, status, created date
 */
export const aggregateEntityStats = internalAction({
  args: {
    groupId: v.id("groups"),
    aggregateBy: v.union(
      v.literal("type"),
      v.literal("status"),
      v.literal("created_date"),
      v.literal("updated_date")
    ),
  },
  handler: async (ctx, args) => {
    console.log(`[STATS] Aggregating entities by ${args.aggregateBy}`);

    // In production: run aggregation pipeline on entities table
    return {
      success: true,
      groupId: args.groupId,
      aggregateBy: args.aggregateBy,
      total: 142,
      breakdown: [
        { category: "item_1", count: 45, percentage: 31.7 },
        { category: "item_2", count: 38, percentage: 26.8 },
        { category: "item_3", count: 32, percentage: 22.5 },
        { category: "item_4", count: 27, percentage: 19.0 },
      ],
      aggregatedAt: Date.now(),
    };
  },
});

/**
 * Aggregate connection statistics
 * Count connections by type, strength, recency
 */
export const aggregateConnectionStats = internalAction({
  args: {
    groupId: v.id("groups"),
    aggregateBy: v.union(
      v.literal("type"),
      v.literal("strength_range"),
      v.literal("recency")
    ),
  },
  handler: async (ctx, args) => {
    console.log(`[STATS] Aggregating connections by ${args.aggregateBy}`);

    // In production: run aggregation pipeline on connections table
    return {
      success: true,
      groupId: args.groupId,
      aggregateBy: args.aggregateBy,
      total: 512,
      breakdown: [
        { category: "category_1", count: 189, percentage: 36.9 },
        { category: "category_2", count: 142, percentage: 27.7 },
        { category: "category_3", count: 108, percentage: 21.1 },
        { category: "category_4", count: 73, percentage: 14.3 },
      ],
      aggregatedAt: Date.now(),
    };
  },
});

/**
 * Search events by filters
 * Find events by actor, target, type, date range
 */
export const searchEvents = internalAction({
  args: {
    groupId: v.id("groups"),
    eventType: v.optional(v.string()),
    actorId: v.optional(v.id("entities")),
    targetId: v.optional(v.id("entities")),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;

    console.log(
      `[SEARCH] Events with filters: type=${args.eventType || "any"}, actor=${args.actorId || "any"}`
    );

    // In production: query events table with multiple indexes
    return {
      success: true,
      groupId: args.groupId,
      filters: {
        eventType: args.eventType,
        actorId: args.actorId,
        targetId: args.targetId,
        startTime: args.startTime,
        endTime: args.endTime,
      },
      resultsCount: 5,
      results: [
        {
          eventId: "evt_1",
          type: args.eventType || "unknown",
          actorId: args.actorId || "unknown",
          timestamp: Date.now() - 3600000,
          metadata: { action: "created" },
        },
        {
          eventId: "evt_2",
          type: args.eventType || "unknown",
          actorId: args.actorId || "unknown",
          timestamp: Date.now() - 7200000,
          metadata: { action: "updated" },
        },
        {
          eventId: "evt_3",
          type: args.eventType || "unknown",
          actorId: args.actorId || "unknown",
          timestamp: Date.now() - 10800000,
          metadata: { action: "archived" },
        },
        {
          eventId: "evt_4",
          type: args.eventType || "unknown",
          actorId: args.actorId || "unknown",
          timestamp: Date.now() - 14400000,
          metadata: { action: "restored" },
        },
        {
          eventId: "evt_5",
          type: args.eventType || "unknown",
          actorId: args.actorId || "unknown",
          timestamp: Date.now() - 18000000,
          metadata: { action: "deleted" },
        },
      ],
      searchedAt: Date.now(),
    };
  },
});

/**
 * Global search across all dimensions
 * Search entities, knowledge, events, groups together
 */
export const globalSearch = internalAction({
  args: {
    groupId: v.id("groups"),
    query: v.string(),
    dimensions: v.optional(
      v.array(
        v.union(
          v.literal("entities"),
          v.literal("knowledge"),
          v.literal("events"),
          v.literal("connections")
        )
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const dimensions = args.dimensions || ["entities", "knowledge"];

    console.log(
      `[SEARCH] Global search: "${args.query}" across ${dimensions.join(", ")}`
    );

    // In production: parallel searches across multiple indexes
    return {
      success: true,
      query: args.query,
      groupId: args.groupId,
      dimensions,
      results: {
        entities: [
          { id: "ent_1", name: "Matching Entity", type: "blog_post", score: 0.99 },
          { id: "ent_2", name: "Another Match", type: "product", score: 0.85 },
        ],
        knowledge: [
          { id: "kn_1", text: "Relevant knowledge...", score: 0.97 },
          { id: "kn_2", text: "Also relevant...", score: 0.88 },
        ],
        events: [
          { id: "evt_1", type: "thing_created", score: 0.76 },
          { id: "evt_2", type: "thing_updated", score: 0.72 },
        ],
      },
      totalResults: 6,
      searchedAt: Date.now(),
    };
  },
});
