import { mutation } from "../_generated/server";
import { v } from "convex/values";

/**
 * DIMENSION 6: KNOWLEDGE + JUNCTION
 *
 * Labels, embeddings, and semantic search (RAG - Retrieval Augmented Generation)
 * Supports categorization, taxonomy, and vector similarity search
 *
 * Knowledge Types:
 * - label: Simple categorical tag (searchable, low storage)
 * - document: Full text with embedding (RAG source material)
 * - chunk: Chunked text for vector search (semantic similarity)
 * - vector_only: Embedding without text (privacy-preserving)
 *
 * Junction Table (thingKnowledge):
 * Links knowledge to things with role metadata:
 * - label: Knowledge is a label for the thing
 * - summary: Knowledge summarizes the thing
 * - chunk_of: Knowledge is a chunk of the thing's content
 * - caption: Knowledge describes an image/media
 * - keyword: Knowledge is a keyword for the thing
 *
 * Multi-tenant: Every knowledge item scoped by groupId
 * Audit trail: Create/update/delete logged as events
 *
 * Mutation Pattern: validate group → create/update knowledge → optionally link to thing → log event
 */
export const create = mutation({
  args: {
    groupId: v.id("groups"),
    type: v.union(v.literal("label"), v.literal("chunk"), v.literal("document")),
    text: v.string(),
    labels: v.optional(v.array(v.string())),
    embedding: v.optional(v.array(v.float64())),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Validate group exists
    const group = await ctx.db.get(args.groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    // Create knowledge item
    const knowledgeId = await ctx.db.insert("knowledge", {
      groupId: args.groupId,
      knowledgeType: args.type,
      text: args.text,
      labels: args.labels || [],
      embedding: args.embedding,
      metadata: args.metadata || {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Log event
    await ctx.db.insert("events", {
      groupId: args.groupId,
      type: "thing_created",
      actorId: undefined, // System-created
      targetId: knowledgeId as any,
      timestamp: Date.now(),
      metadata: {
        entityType: "knowledge",
        knowledgeType: args.type,
        hasEmbedding: !!args.embedding,
        labelCount: (args.labels || []).length,
      },
    });

    return knowledgeId;
  },
});

/**
 * Update knowledge item
 */
export const update = mutation({
  args: {
    id: v.id("knowledge"),
    text: v.optional(v.string()),
    labels: v.optional(v.array(v.string())),
    embedding: v.optional(v.array(v.float64())),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Knowledge item not found");
    }

    // Update knowledge item
    await ctx.db.patch(args.id, {
      ...(args.text && { text: args.text }),
      ...(args.labels && { labels: args.labels }),
      ...(args.embedding && { embedding: args.embedding }),
      ...(args.metadata && { metadata: args.metadata }),
      updatedAt: Date.now(),
    });

    // Log event
    await ctx.db.insert("events", {
      groupId: existing.groupId,
      type: "thing_updated",
      actorId: undefined,
      targetId: args.id as any,
      timestamp: Date.now(),
      metadata: {
        entityType: "knowledge",
        updated: Object.keys(args).filter((k) => k !== "id"),
      },
    });

    return args.id;
  },
});

/**
 * Delete knowledge item
 */
export const deleteKnowledge = mutation({
  args: {
    id: v.id("knowledge"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Knowledge item not found");
    }

    // Log event before deletion
    await ctx.db.insert("events", {
      groupId: existing.groupId,
      type: "thing_deleted",
      actorId: undefined,
      targetId: args.id as any,
      timestamp: Date.now(),
      metadata: {
        entityType: "knowledge",
        knowledgeType: existing.knowledgeType,
        text: existing.text?.substring(0, 100) || "", // First 100 chars
      },
    });

    // Delete knowledge item
    await ctx.db.delete(args.id);

    return { success: true };
  },
});

/**
 * Bulk create knowledge items (for document ingestion)
 */
export const bulkCreate = mutation({
  args: {
    groupId: v.id("groups"),
    items: v.array(
      v.object({
        type: v.union(v.literal("label"), v.literal("chunk"), v.literal("document")),
        text: v.string(),
        labels: v.optional(v.array(v.string())),
        embedding: v.optional(v.array(v.float64())),
        metadata: v.optional(v.any()),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Validate group exists
    const group = await ctx.db.get(args.groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    const ids = [];

    // Insert all items
    for (const item of args.items) {
      const id = await ctx.db.insert("knowledge", {
        groupId: args.groupId,
        knowledgeType: item.type,
        text: item.text,
        labels: item.labels || [],
        embedding: item.embedding,
        metadata: item.metadata || {},
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      ids.push(id);
    }

    // Log bulk creation event
    await ctx.db.insert("events", {
      groupId: args.groupId,
      type: "thing_created",
      actorId: undefined,
      targetId: ids[0] as any, // First item as target
      timestamp: Date.now(),
      metadata: {
        entityType: "knowledge",
        bulkOperation: true,
        count: args.items.length,
        types: args.items.map((i) => i.type),
      },
    });

    return { ids, count: ids.length };
  },
});

/**
 * Link knowledge to a thing (junction table pattern)
 */
export const linkToThing = mutation({
  args: {
    groupId: v.id("groups"),
    knowledgeId: v.id("knowledge"),
    thingId: v.id("entities"),
    role: v.optional(v.union(
      v.literal("label"),
      v.literal("summary"),
      v.literal("chunk_of"),
      v.literal("caption"),
      v.literal("keyword"),
    )),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Verify both exist
    const knowledge = await ctx.db.get(args.knowledgeId);
    const thing = await ctx.db.get(args.thingId);

    if (!knowledge || knowledge.groupId !== args.groupId) {
      throw new Error("Knowledge not found in group");
    }
    if (!thing || thing.groupId !== args.groupId) {
      throw new Error("Thing not found in group");
    }

    // Create junction record between thing and knowledge
    const junctionId = await ctx.db.insert("thingKnowledge", {
      thingId: args.thingId,
      knowledgeId: args.knowledgeId,
      role: args.role,
      metadata: args.metadata || {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Log event
    await ctx.db.insert("events", {
      groupId: args.groupId,
      type: "thing_created",
      actorId: args.thingId as any,
      targetId: args.knowledgeId as any,
      timestamp: Date.now(),
      metadata: {
        entityType: "knowledge_link",
        junctionId,
        role: args.role,
      },
    });

    return junctionId;
  },
});
