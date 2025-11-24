import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * DIMENSION 4: CONNECTIONS - Query Layer
 *
 * All read operations for relationships between entities
 * Every query scoped by groupId for multi-tenant isolation
 *
 * Supports:
 * - Connections FROM an entity (outgoing relationships)
 * - Connections TO an entity (incoming relationships)
 * - Bidirectional query between two entities
 * - Filter by relationship type (owns, member_of, transacted, etc.)
 * - Relationship metadata exploration
 *
 * Use Cases:
 * - Graph traversal (find all users in a group)
 * - Social features (followers, following, collaborators)
 * - Financial (transactions, token holdings, staking)
 * - Organizational (reporting structure, teams)
 * - Content (references, citations, source attribution)
 * - Enrollment/Education (students, courses, teachers)
 *
 * Performance:
 * - CRITICAL: Use from_entity/to_entity indexes for efficient lookup
 * - Use group_type index to filter by relationship type
 *
 * Query Pattern: Start with entity ID, then filter by relationship type
 */

// Relationship type validator (auto-generated from ontology composition)
const relationshipTypeValidator = v.union(
  v.literal("owns"),
  v.literal("created_by"),
  v.literal("clone_of"),
  v.literal("trained_on"),
  v.literal("powers"),
  v.literal("authored"),
  v.literal("generated_by"),
  v.literal("published_to"),
  v.literal("part_of"),
  v.literal("references"),
  v.literal("member_of"),
  v.literal("following"),
  v.literal("moderates"),
  v.literal("participated_in"),
  v.literal("manages"),
  v.literal("reports_to"),
  v.literal("collaborates_with"),
  v.literal("holds_tokens"),
  v.literal("staked_in"),
  v.literal("earned_from"),
  v.literal("purchased"),
  v.literal("enrolled_in"),
  v.literal("completed"),
  v.literal("teaching"),
  v.literal("transacted"),
  v.literal("notified"),
  v.literal("referred"),
  v.literal("communicated"),
  v.literal("delegated"),
  v.literal("approved"),
  v.literal("fulfilled"),
);

export const listFrom = query({
  args: {
    groupId: v.id("groups"), // CRITICAL: Multi-tenant isolation
    fromEntityId: v.id("entities"),
    relationshipType: v.optional(relationshipTypeValidator),
  },
  handler: async (ctx, { groupId, fromEntityId, relationshipType }) => {
    let q = ctx.db
      .query("connections")
      .withIndex("from_entity", (q) => q.eq("fromEntityId", fromEntityId));
    if (relationshipType) {
      q = ctx.db
        .query("connections")
        .withIndex("from_type", (q) =>
          q.eq("fromEntityId", fromEntityId).eq("relationshipType", relationshipType as any)
        );
    }
    const connections = await q.collect();

    // FILTER by groupId for security (multi-tenant isolation)
    return connections.filter(c => c.groupId === groupId);
  },
});

export const listTo = query({
  args: {
    groupId: v.id("groups"), // CRITICAL: Multi-tenant isolation
    toEntityId: v.id("entities"),
    relationshipType: v.optional(relationshipTypeValidator),
  },
  handler: async (ctx, { groupId, toEntityId, relationshipType }) => {
    let q = ctx.db
      .query("connections")
      .withIndex("to_entity", (q) => q.eq("toEntityId", toEntityId));
    if (relationshipType) {
      q = ctx.db
        .query("connections")
        .withIndex("to_type", (q) =>
          q.eq("toEntityId", toEntityId).eq("relationshipType", relationshipType as any)
        );
    }
    const connections = await q.collect();

    // FILTER by groupId for security (multi-tenant isolation)
    return connections.filter(c => c.groupId === groupId);
  },
});

export const listBetween = query({
  args: {
    groupId: v.id("groups"), // CRITICAL: Multi-tenant isolation
    fromEntityId: v.id("entities"),
    toEntityId: v.id("entities"),
    relationshipType: v.optional(relationshipTypeValidator),
  },
  handler: async (ctx, { groupId, fromEntityId, toEntityId, relationshipType }) => {
    const q = ctx.db
      .query("connections")
      .withIndex("bidirectional", (q) =>
        q
          .eq("fromEntityId", fromEntityId)
          .eq("toEntityId", toEntityId)
          .eq("relationshipType", relationshipType || ("owns" as any))
      );
    // If relationshipType not provided, fall back to manual filter
    if (!relationshipType) {
      const all = await ctx.db
        .query("connections")
        .withIndex("from_entity", (q) => q.eq("fromEntityId", fromEntityId))
        .collect();
      // FILTER by groupId and toEntityId
      return all.filter((c) => c.groupId === groupId && c.toEntityId === toEntityId);
    }
    const connections = await q.collect();

    // FILTER by groupId for security (multi-tenant isolation)
    return connections.filter(c => c.groupId === groupId);
  },
});

export const listByType = query({
  args: {
    groupId: v.id("groups"), // CRITICAL: Multi-tenant isolation
    relationshipType: relationshipTypeValidator,
    limit: v.optional(v.number())
  },
  handler: async (ctx, { groupId, relationshipType, limit }) => {
    // Use group_type index for efficient filtering
    const connections = await ctx.db
      .query("connections")
      .withIndex("group_type", (q) =>
        q.eq("groupId", groupId).eq("relationshipType", relationshipType)
      )
      .collect();

    return limit ? connections.slice(0, limit) : connections;
  },
});

