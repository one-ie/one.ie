import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * DIMENSION 3: THINGS - Query Layer
 *
 * All read operations for things (nouns: users, agents, content, tokens, courses)
 * Stored in "entities" database table (ontology calls it "things")
 * Every query scoped by groupId for multi-tenant isolation
 *
 * Supports:
 * - List by type with optional filtering (users, products, articles, etc.)
 * - Dashboard metrics (count by type, status, creation time)
 * - Full-text search on thing names
 * - Activity timeline (recent things, recently updated)
 * - Relationships (thing with all connections from/to)
 *
 * Performance:
 * - CRITICAL: Use group_type index for type filtering (10-100x faster)
 * - Use group_status index for workflow dashboards
 * - Use by_created/by_updated for timeline queries
 *
 * Query Pattern: Always filter by groupId first, then type/status
 */

/**
 * List things in a group with optional filters
 *
 * CRITICAL: Uses group_type index for efficient filtering
 * Always scoped by groupId for multi-tenant isolation
 */
export const list = query({
  args: {
    groupId: v.id("groups"),
    type: v.optional(v.string()),
    status: v.optional(v.string()),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    // CRITICAL: Use group_type index for efficiency
    let results;

    if (args.type) {
      results = await ctx.db
        .query("entities")
        .withIndex("group_type", (q) =>
          q.eq("groupId", args.groupId).eq("type", args.type as any)
        )
        .collect();
    } else {
      results = await ctx.db
        .query("entities")
        .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
        .collect();
    }

    // Filter by status if provided
    if (args.status) {
      results = results.filter(e => e.status === args.status);
    }

    // Apply limit if provided
    if (args.limit) {
      results = results.slice(0, args.limit);
    }

    return results;
  }
});

/**
 * Get a single entity by ID
 *
 * Optional groupId for security validation (ensures entity belongs to expected group)
 */
export const getById = query({
  args: {
    entityId: v.id("entities"),
    groupId: v.optional(v.id("groups")) // For security validation
  },
  handler: async (ctx, args) => {
    const entity = await ctx.db.get(args.entityId);

    // Optional: Validate entity belongs to expected group
    if (args.groupId && entity?.groupId !== args.groupId) {
      throw new Error("Entity not found in specified group");
    }

    return entity;
  }
});

/**
 * Search entities by name
 *
 * Case-insensitive search scoped to group
 */
export const search = query({
  args: {
    groupId: v.id("groups"),
    query: v.string(),
    type: v.optional(v.string()),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    // Get entities for group
    let results;

    if (args.type) {
      results = await ctx.db
        .query("entities")
        .withIndex("group_type", (q) =>
          q.eq("groupId", args.groupId).eq("type", args.type as any)
        )
        .collect();
    } else {
      results = await ctx.db
        .query("entities")
        .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
        .collect();
    }

    // Search by name (case-insensitive)
    const searchLower = args.query.toLowerCase();
    results = results.filter(e =>
      e.name.toLowerCase().includes(searchLower)
    );

    // Apply limit
    if (args.limit) {
      results = results.slice(0, args.limit);
    }

    return results;
  }
});

/**
 * Get an entity with all its connections
 *
 * Returns entity plus connections FROM and TO this entity
 * Useful for relationship visualization and graph queries
 */
export const getWithConnections = query({
  args: {
    entityId: v.id("entities"),
    groupId: v.optional(v.id("groups"))
  },
  handler: async (ctx, args) => {
    // Get entity
    const entity = await ctx.db.get(args.entityId);
    if (!entity) return null;

    // Validate group if provided
    if (args.groupId && entity.groupId !== args.groupId) {
      throw new Error("Entity not found in specified group");
    }

    // Get connections FROM this entity
    const connectionsFrom = await ctx.db
      .query("connections")
      .withIndex("from_entity", (q) => q.eq("fromEntityId", args.entityId))
      .filter((q) => q.eq(q.field("groupId"), entity.groupId))
      .collect();

    // Get connections TO this entity
    const connectionsTo = await ctx.db
      .query("connections")
      .withIndex("to_entity", (q) => q.eq("toEntityId", args.entityId))
      .filter((q) => q.eq(q.field("groupId"), entity.groupId))
      .collect();

    return {
      entity,
      connectionsFrom,
      connectionsTo
    };
  }
});

/**
 * Get entity activity timeline (events)
 *
 * Returns all events where this entity is the target
 * Ordered by timestamp (most recent first)
 */
export const getActivity = query({
  args: {
    entityId: v.id("entities"),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const entity = await ctx.db.get(args.entityId);
    if (!entity) return null;

    let q = ctx.db
      .query("events")
      .withIndex("by_target", (q) => q.eq("targetId", args.entityId));

    const events = await q.collect();

    // Sort by timestamp descending (most recent first)
    const sorted = events.sort((a, b) => b.timestamp - a.timestamp);

    // Apply limit if provided
    return args.limit ? sorted.slice(0, args.limit) : sorted;
  }
});

/**
 * Count entities by type in a group
 *
 * Useful for dashboard statistics
 */
export const countByType = query({
  args: {
    groupId: v.id("groups")
  },
  handler: async (ctx, args) => {
    const entities = await ctx.db
      .query("entities")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    // Group by type and count
    const counts: Record<string, number> = {};
    for (const entity of entities) {
      counts[entity.type] = (counts[entity.type] || 0) + 1;
    }

    return counts;
  }
});

/**
 * Count entities by status in a group
 *
 * Useful for workflow dashboards (draft/active/published/archived)
 */
export const countByStatus = query({
  args: {
    groupId: v.id("groups"),
    type: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    let entities;

    if (args.type) {
      entities = await ctx.db
        .query("entities")
        .withIndex("group_type", (q) =>
          q.eq("groupId", args.groupId).eq("type", args.type as any)
        )
        .collect();
    } else {
      entities = await ctx.db
        .query("entities")
        .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
        .collect();
    }

    // Group by status and count
    const counts: Record<string, number> = {};
    for (const entity of entities) {
      const status = entity.status || "draft";
      counts[status] = (counts[status] || 0) + 1;
    }

    return counts;
  }
});

/**
 * Get recently created entities in a group
 *
 * Ordered by createdAt timestamp (most recent first)
 */
export const getRecent = query({
  args: {
    groupId: v.id("groups"),
    type: v.optional(v.string()),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    let entities;

    if (args.type) {
      entities = await ctx.db
        .query("entities")
        .withIndex("group_type", (q) =>
          q.eq("groupId", args.groupId).eq("type", args.type as any)
        )
        .collect();
    } else {
      entities = await ctx.db
        .query("entities")
        .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
        .collect();
    }

    // Sort by createdAt descending (most recent first)
    const sorted = entities.sort((a, b) => b.createdAt - a.createdAt);

    // Apply limit if provided
    return args.limit ? sorted.slice(0, args.limit) : sorted;
  }
});

/**
 * Get recently updated entities in a group
 *
 * Ordered by updatedAt timestamp (most recent first)
 */
export const getRecentlyUpdated = query({
  args: {
    groupId: v.id("groups"),
    type: v.optional(v.string()),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    let entities;

    if (args.type) {
      entities = await ctx.db
        .query("entities")
        .withIndex("group_type", (q) =>
          q.eq("groupId", args.groupId).eq("type", args.type as any)
        )
        .collect();
    } else {
      entities = await ctx.db
        .query("entities")
        .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
        .collect();
    }

    // Sort by updatedAt descending (most recent first)
    const sorted = entities.sort((a, b) => b.updatedAt - a.updatedAt);

    // Apply limit if provided
    return args.limit ? sorted.slice(0, args.limit) : sorted;
  }
});

/**
 * List contact submissions (type: contact_submission thing)
 * Part of Dimension 3: THINGS
 */
export const listContacts = query({
  args: {
    groupId: v.id("groups"),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("entities")
      .withIndex("group_type", (q) =>
        q.eq("groupId", args.groupId).eq("type", "contact_submission")
      );

    const contacts = await q.collect();

    if (args.status) {
      return contacts.filter(
        (c) => c.properties?.status === args.status
      );
    }

    return contacts.sort((a, b) => b.createdAt - a.createdAt);
  },
});

/**
 * Get contact submission statistics
 */
export const getContactStats = query({
  args: {
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    const contacts = await ctx.db
      .query("entities")
      .withIndex("group_type", (q) =>
        q.eq("groupId", args.groupId).eq("type", "contact_submission")
      )
      .collect();

    const statusCounts = contacts.reduce((acc, contact) => {
      const status = contact.properties?.status || "new";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: contacts.length,
      byStatus: statusCounts,
    };
  },
});
