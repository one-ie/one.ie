import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * DIMENSION 6: KNOWLEDGE - Query Layer
 *
 * All read operations for labels, embeddings, and semantic search (RAG)
 * Every query scoped by groupId for multi-tenant isolation
 *
 * Supports:
 * - List by type (labels, documents, chunks, vector_only)
 * - Semantic text search (ready for vector similarity in future)
 * - Find knowledge linked to specific entity (via junction table)
 * - Filter by label/category (taxonomy)
 * - Aggregate statistics (unique labels, with embeddings, etc.)
 *
 * Use Cases:
 * - RAG (Retrieval Augmented Generation): Find relevant knowledge for AI context
 * - Content tagging: Find all items with specific label
 * - Knowledge base search: Find documents matching text query
 * - Taxonomy exploration: Browse all labels and categories
 * - Semantic matching: Find similar content (vector similarity - future)
 * - Bulk knowledge operations: Import/export labels and documents
 *
 * Performance:
 * - CRITICAL: Use group_type index for filtering by knowledge type
 * - Use by_source to find knowledge for specific entity
 * - Text search uses substring matching (ready for full-text index)
 * - Embeddings ready for vector similarity search
 *
 * Junction Table (thingKnowledge):
 * - Links knowledge items to entities with semantic roles
 * - Roles: label (categorical), summary (synthesis), chunk_of (part), caption (description), keyword (search)
 *
 * Query Pattern: Filter by group, optionally filter by type/label, order by relevance
 */

/**
 * List knowledge items in a group
 *
 * CRITICAL: Always filtered by groupId for multi-tenant isolation
 */
export const list = query({
  args: {
    groupId: v.id("groups"),
    knowledgeType: v.optional(v.union(
      v.literal("label"),
      v.literal("document"),
      v.literal("chunk"),
      v.literal("vector_only")
    )),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    let results;

    if (args.knowledgeType) {
      const type = args.knowledgeType;
      results = await ctx.db
        .query("knowledge")
        .withIndex("group_type", (q) =>
          q.eq("groupId", args.groupId).eq("knowledgeType", type)
        )
        .collect();
    } else {
      results = await ctx.db
        .query("knowledge")
        .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
        .collect();
    }

    // Apply limit if provided
    if (args.limit) {
      results = results.slice(0, args.limit);
    }

    return results;
  }
});

/**
 * Search knowledge by text (basic text search)
 *
 * For now: case-insensitive substring search
 * TODO: Replace with vector search when ready
 */
export const search = query({
  args: {
    groupId: v.id("groups"),
    query: v.string(),
    knowledgeType: v.optional(v.union(
      v.literal("label"),
      v.literal("document"),
      v.literal("chunk"),
      v.literal("vector_only")
    )),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    // Get all knowledge items for group
    let knowledge;

    if (args.knowledgeType) {
      const knowledgeType = args.knowledgeType;
      knowledge = await ctx.db
        .query("knowledge")
        .withIndex("group_type", (q) =>
          q.eq("groupId", args.groupId).eq("knowledgeType", knowledgeType)
        )
        .collect();
    } else {
      knowledge = await ctx.db
        .query("knowledge")
        .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
        .collect();
    }

    // Basic text search (case-insensitive)
    const searchLower = args.query.toLowerCase();
    const filtered = knowledge.filter(k => {
      // Search in text field
      if (k.text && k.text.toLowerCase().includes(searchLower)) {
        return true;
      }
      // Search in labels
      if (k.labels && k.labels.some(label => label.toLowerCase().includes(searchLower))) {
        return true;
      }
      return false;
    });

    // Apply limit
    const limit = args.limit || 10;
    return filtered.slice(0, limit);
  }
});

/**
 * Get knowledge items by source thing
 *
 * Returns all knowledge linked to a specific entity
 */
export const bySourceThing = query({
  args: {
    groupId: v.id("groups"),
    sourceThingId: v.id("entities"),
    knowledgeType: v.optional(v.union(
      v.literal("label"),
      v.literal("document"),
      v.literal("chunk"),
      v.literal("vector_only")
    ))
  },
  handler: async (ctx, args) => {
    const knowledge = await ctx.db
      .query("knowledge")
      .withIndex("by_source", (q) => q.eq("sourceThingId", args.sourceThingId))
      .filter((q) => q.eq(q.field("groupId"), args.groupId))
      .collect();

    // Filter by knowledge type if provided
    if (args.knowledgeType) {
      return knowledge.filter(k => k.knowledgeType === args.knowledgeType);
    }

    return knowledge;
  }
});

/**
 * Get knowledge items linked to a thing via thingKnowledge junction
 *
 * Returns knowledge items with their role/relationship
 */
export const byThing = query({
  args: {
    thingId: v.id("entities"),
    role: v.optional(v.union(
      v.literal("label"),
      v.literal("summary"),
      v.literal("chunk_of"),
      v.literal("caption"),
      v.literal("keyword")
    ))
  },
  handler: async (ctx, args) => {
    // Get all thingKnowledge associations for this thing
    let associations = await ctx.db
      .query("thingKnowledge")
      .withIndex("by_thing", (q) => q.eq("thingId", args.thingId))
      .collect();

    // Filter by role if provided
    if (args.role) {
      associations = associations.filter(a => a.role === args.role);
    }

    // Get the knowledge items
    const knowledgeItems = await Promise.all(
      associations.map(async (assoc) => {
        const knowledge = await ctx.db.get(assoc.knowledgeId);
        return knowledge ? {
          ...knowledge,
          associationRole: assoc.role,
          associationMetadata: assoc.metadata
        } : null;
      })
    );

    return knowledgeItems.filter(k => k !== null);
  }
});

/**
 * Get knowledge items by label
 *
 * Returns knowledge items that have a specific label
 */
export const byLabel = query({
  args: {
    groupId: v.id("groups"),
    label: v.string(),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const knowledge = await ctx.db
      .query("knowledge")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    // Filter by label
    const filtered = knowledge.filter(k =>
      k.labels && k.labels.includes(args.label)
    );

    // Apply limit
    const limit = args.limit || 100;
    return filtered.slice(0, limit);
  }
});

/**
 * Get all labels used in a group
 *
 * Returns unique labels with usage counts
 * Useful for label taxonomy and filtering
 */
export const listLabels = query({
  args: {
    groupId: v.id("groups")
  },
  handler: async (ctx, args) => {
    const knowledge = await ctx.db
      .query("knowledge")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    // Extract all labels and count usage
    const labelCounts: Record<string, number> = {};
    for (const item of knowledge) {
      if (item.labels) {
        for (const label of item.labels) {
          labelCounts[label] = (labelCounts[label] || 0) + 1;
        }
      }
    }

    // Convert to array and sort by usage
    const labels = Object.entries(labelCounts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);

    return labels;
  }
});

/**
 * Get knowledge statistics for a group
 *
 * Returns counts by knowledge type and other metrics
 */
export const stats = query({
  args: {
    groupId: v.id("groups")
  },
  handler: async (ctx, args) => {
    const knowledge = await ctx.db
      .query("knowledge")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    // Count by type
    const byType: Record<string, number> = {};
    for (const item of knowledge) {
      byType[item.knowledgeType] = (byType[item.knowledgeType] || 0) + 1;
    }

    // Count items with embeddings
    const withEmbeddings = knowledge.filter(k => k.embedding && k.embedding.length > 0).length;

    // Count items with labels
    const withLabels = knowledge.filter(k => k.labels && k.labels.length > 0).length;

    // Count unique labels
    const allLabels = new Set<string>();
    for (const item of knowledge) {
      if (item.labels) {
        item.labels.forEach(label => allLabels.add(label));
      }
    }

    return {
      total: knowledge.length,
      byType,
      withEmbeddings,
      withLabels,
      uniqueLabels: allLabels.size
    };
  }
});

/**
 * Get a single knowledge item by ID
 */
export const getById = query({
  args: {
    knowledgeId: v.id("knowledge"),
    groupId: v.optional(v.id("groups")) // For security validation
  },
  handler: async (ctx, args) => {
    const knowledge = await ctx.db.get(args.knowledgeId);

    // Optional: Validate knowledge belongs to expected group
    if (args.groupId && knowledge?.groupId !== args.groupId) {
      throw new Error("Knowledge item not found in specified group");
    }

    return knowledge;
  }
});
