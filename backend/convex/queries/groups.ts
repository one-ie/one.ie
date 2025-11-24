import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * DIMENSION 1: GROUPS - Query Layer
 *
 * All read operations for groups (multi-tenant isolation boundary)
 * Supports:
 * - Direct lookup by ID or slug
 * - Hierarchical queries (ancestors, descendants, breadcrumbs)
 * - Aggregated statistics (entities, connections, events, knowledge)
 * - Full-text search with type/visibility filters
 *
 * Query Pattern: All queries filter by user permissions (future enhancement)
 * Performance: Use indexes for efficient filtering on type, status, created time
 */

/**
 * Get a group by its URL slug
 * Used for URL-based routing: one.ie/group/:slug
 */
export const getBySlug = query({
  args: {
    slug: v.string()
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("groups")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  }
});

/**
 * Get a group by ID
 */
export const getById = query({
  args: {
    groupId: v.id("groups")
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.groupId);
  }
});

/**
 * List groups with optional filters
 */
export const list = query({
  args: {
    type: v.optional(v.union(
      v.literal("friend_circle"),
      v.literal("business"),
      v.literal("community"),
      v.literal("dao"),
      v.literal("government"),
      v.literal("organization")
    )),
    status: v.optional(v.union(
      v.literal("active"),
      v.literal("archived")
    )),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    let groups;

    // Filter by type if provided
    if (args.type) {
      const type = args.type;
      groups = await ctx.db
        .query("groups")
        .withIndex("by_type", (q) => q.eq("type", type))
        .collect();
    } else {
      groups = await ctx.db
        .query("groups")
        .collect();
    }

    // Filter by status if provided
    if (args.status) {
      groups = groups.filter((g) => g.status === args.status);
    }

    // Apply limit if provided
    return args.limit ? groups.slice(0, args.limit) : groups;
  }
});

/**
 * Get direct children (subgroups) of a parent group
 * Non-recursive - only immediate children
 */
export const getSubgroups = query({
  args: {
    parentGroupId: v.id("groups")
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("groups")
      .withIndex("by_parent", (q) => q.eq("parentGroupId", args.parentGroupId))
      .collect();
  }
});

/**
 * Get entire group hierarchy recursively
 * Returns all descendants (children, grandchildren, etc.)
 */
export const getHierarchy = query({
  args: {
    rootGroupId: v.id("groups"),
    maxDepth: v.optional(v.number()) // Prevent infinite recursion
  },
  handler: async (ctx, args) => {
    const maxDepth = args.maxDepth || 10;
    const allSubgroups: any[] = [];
    const queue: Array<{ id: string; depth: number }> = [
      { id: args.rootGroupId, depth: 0 }
    ];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current || current.depth >= maxDepth) continue;
      if (visited.has(current.id)) continue; // Prevent cycles
      visited.add(current.id);

      // Get direct children
      const subgroups = await ctx.db
        .query("groups")
        .withIndex("by_parent", (q) => q.eq("parentGroupId", current.id as any))
        .collect();

      for (const subgroup of subgroups) {
        allSubgroups.push({
          ...subgroup,
          depth: current.depth + 1,
          parentId: current.id
        });
        queue.push({ id: subgroup._id, depth: current.depth + 1 });
      }
    }

    return allSubgroups;
  }
});

/**
 * Get path from root to a specific group (breadcrumb trail)
 * Returns: [root, parent, grandparent, ..., targetGroup]
 */
export const getGroupPath = query({
  args: {
    groupId: v.id("groups")
  },
  handler: async (ctx, args) => {
    const path: any[] = [];
    let currentId: string | undefined = args.groupId;
    const maxIterations = 10; // Prevent infinite loops
    let iterations = 0;

    while (currentId && iterations < maxIterations) {
      const group = await ctx.db.get(currentId as any) as any;
      if (!group) break;

      path.unshift(group); // Add to beginning of array
      currentId = group.parentGroupId;
      iterations++;
    }

    return path;
  }
});

/**
 * Check if a group is a descendant of another group
 * Useful for permission checks: "Is user in parent group or any subgroup?"
 */
export const isDescendantOf = query({
  args: {
    groupId: v.id("groups"),
    ancestorGroupId: v.id("groups")
  },
  handler: async (ctx, args) => {
    if (args.groupId === args.ancestorGroupId) {
      return true; // A group is considered its own descendant
    }

    let currentId: string | undefined = args.groupId;
    const maxIterations = 10;
    let iterations = 0;

    while (currentId && iterations < maxIterations) {
      const group = await ctx.db.get(currentId as any) as any;
      if (!group) return false;

      if (group.parentGroupId === args.ancestorGroupId) {
        return true;
      }

      currentId = group.parentGroupId;
      iterations++;
    }

    return false;
  }
});

/**
 * Get all entities in a group hierarchy (recursive)
 * Returns entities from the root group and all subgroups
 */
export const getEntitiesInHierarchy = query({
  args: {
    rootGroupId: v.id("groups"),
    entityType: v.optional(v.string()),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    // Get all subgroups
    const hierarchy = await ctx.db
      .query("groups")
      .withIndex("by_parent", (q) => q.eq("parentGroupId", args.rootGroupId))
      .collect();

    // Build list of all group IDs (root + subgroups)
    const allGroupIds = [args.rootGroupId];
    const queue = [...hierarchy];
    const maxIterations = 100;
    let iterations = 0;

    while (queue.length > 0 && iterations < maxIterations) {
      const current = queue.shift();
      if (!current) continue;

      allGroupIds.push(current._id);

      // Get children of current group
      const children = await ctx.db
        .query("groups")
        .withIndex("by_parent", (q) => q.eq("parentGroupId", current._id))
        .collect();

      queue.push(...children);
      iterations++;
    }

    // Get all entities from all groups
    const entities = await ctx.db
      .query("entities")
      .filter((q) =>
        q.or(
          ...allGroupIds.map(id => q.eq(q.field("groupId"), id))
        )
      )
      .collect();

    // Filter by entity type if provided
    let filteredEntities = entities;
    if (args.entityType) {
      filteredEntities = entities.filter(e => e.type === args.entityType);
    }

    // Apply limit if provided
    return args.limit ? filteredEntities.slice(0, args.limit) : filteredEntities;
  }
});

/**
 * Get all connections in a group hierarchy (recursive)
 */
export const getConnectionsInHierarchy = query({
  args: {
    rootGroupId: v.id("groups"),
    relationshipType: v.optional(v.string()),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    // Get all subgroups (same logic as getEntitiesInHierarchy)
    const hierarchy = await ctx.db
      .query("groups")
      .withIndex("by_parent", (q) => q.eq("parentGroupId", args.rootGroupId))
      .collect();

    const allGroupIds = [args.rootGroupId];
    const queue = [...hierarchy];
    const maxIterations = 100;
    let iterations = 0;

    while (queue.length > 0 && iterations < maxIterations) {
      const current = queue.shift();
      if (!current) continue;

      allGroupIds.push(current._id);

      const children = await ctx.db
        .query("groups")
        .withIndex("by_parent", (q) => q.eq("parentGroupId", current._id))
        .collect();

      queue.push(...children);
      iterations++;
    }

    // Get all connections from all groups
    const connections = await ctx.db
      .query("connections")
      .filter((q) =>
        q.or(
          ...allGroupIds.map(id => q.eq(q.field("groupId"), id))
        )
      )
      .collect();

    // Filter by relationship type if provided
    let filteredConnections = connections;
    if (args.relationshipType) {
      filteredConnections = connections.filter(c => c.relationshipType === args.relationshipType);
    }

    // Apply limit if provided
    return args.limit ? filteredConnections.slice(0, args.limit) : filteredConnections;
  }
});

/**
 * Get all events in a group hierarchy (recursive)
 */
export const getEventsInHierarchy = query({
  args: {
    rootGroupId: v.id("groups"),
    eventType: v.optional(v.string()),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    // Get all subgroups (same logic)
    const hierarchy = await ctx.db
      .query("groups")
      .withIndex("by_parent", (q) => q.eq("parentGroupId", args.rootGroupId))
      .collect();

    const allGroupIds = [args.rootGroupId];
    const queue = [...hierarchy];
    const maxIterations = 100;
    let iterations = 0;

    while (queue.length > 0 && iterations < maxIterations) {
      const current = queue.shift();
      if (!current) continue;

      allGroupIds.push(current._id);

      const children = await ctx.db
        .query("groups")
        .withIndex("by_parent", (q) => q.eq("parentGroupId", current._id))
        .collect();

      queue.push(...children);
      iterations++;
    }

    // Get all events from all groups
    const events = await ctx.db
      .query("events")
      .filter((q) =>
        q.or(
          ...allGroupIds.map(id => q.eq(q.field("groupId"), id))
        )
      )
      .order("desc") // Most recent first
      .collect();

    // Filter by event type if provided
    let filteredEvents = events;
    if (args.eventType) {
      filteredEvents = events.filter(e => e.type === args.eventType);
    }

    // Apply limit if provided
    return args.limit ? filteredEvents.slice(0, args.limit) : filteredEvents;
  }
});

/**
 * Get group statistics
 */
export const getStats = query({
  args: {
    groupId: v.id("groups"),
    includeSubgroups: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    let groupIds = [args.groupId];

    // Include subgroups if requested
    if (args.includeSubgroups) {
      const hierarchy = await ctx.db
        .query("groups")
        .withIndex("by_parent", (q) => q.eq("parentGroupId", args.groupId))
        .collect();

      const queue = [...hierarchy];
      const maxIterations = 100;
      let iterations = 0;

      while (queue.length > 0 && iterations < maxIterations) {
        const current = queue.shift();
        if (!current) continue;

        groupIds.push(current._id);

        const children = await ctx.db
          .query("groups")
          .withIndex("by_parent", (q) => q.eq("parentGroupId", current._id))
          .collect();

        queue.push(...children);
        iterations++;
      }
    }

    // Count entities
    const entities = await ctx.db
      .query("entities")
      .filter((q) =>
        q.or(
          ...groupIds.map(id => q.eq(q.field("groupId"), id))
        )
      )
      .collect();

    // Count connections
    const connections = await ctx.db
      .query("connections")
      .filter((q) =>
        q.or(
          ...groupIds.map(id => q.eq(q.field("groupId"), id))
        )
      )
      .collect();

    // Count events
    const events = await ctx.db
      .query("events")
      .filter((q) =>
        q.or(
          ...groupIds.map(id => q.eq(q.field("groupId"), id))
        )
      )
      .collect();

    // Count knowledge entries
    const knowledge = await ctx.db
      .query("knowledge")
      .filter((q) =>
        q.or(
          ...groupIds.map(id => q.eq(q.field("groupId"), id))
        )
      )
      .collect();

    // Count members (entities with type "creator")
    const members = entities.filter(e => e.type === "creator");

    return {
      group,
      stats: {
        members: members.length,
        entities: entities.length,
        connections: connections.length,
        events: events.length,
        knowledge: knowledge.length,
        subgroups: args.includeSubgroups ? groupIds.length - 1 : 0
      }
    };
  }
});

/**
 * Search groups by name or slug
 */
export const search = query({
  args: {
    query: v.string(),
    type: v.optional(v.union(
      v.literal("friend_circle"),
      v.literal("business"),
      v.literal("community"),
      v.literal("dao"),
      v.literal("government"),
      v.literal("organization")
    )),
    visibility: v.optional(v.union(
      v.literal("public"),
      v.literal("private")
    )),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const searchTerm = args.query.toLowerCase();
    let groups = await ctx.db.query("groups").collect();

    // Filter by search term (name or slug)
    groups = groups.filter(g =>
      g.name.toLowerCase().includes(searchTerm) ||
      g.slug.toLowerCase().includes(searchTerm)
    );

    // Filter by type if provided
    if (args.type) {
      groups = groups.filter(g => g.type === args.type);
    }

    // Filter by visibility if provided
    if (args.visibility) {
      groups = groups.filter(g => g.settings.visibility === args.visibility);
    }

    // Filter to only active groups
    groups = groups.filter(g => g.status === "active");

    // Apply limit if provided
    return args.limit ? groups.slice(0, args.limit) : groups;
  }
});
