import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { CONNECTION_TYPES } from "../types/ontology";

/**
 * DIMENSION 4: CONNECTIONS
 *
 * All relationships between entities (things)
 * Bidirectional with temporal validity (validFrom/validTo)
 * Rich metadata support for relationship properties
 *
 * Examples:
 * - Page created_by User
 * - BlogPost posted_in BlogCategory
 * - Product purchased by User
 * - CartItem variant_of Product
 *
 * Multi-tenant: Every connection scoped by groupId
 * Audit trail: Every create/update logged as event
 *
 * Relationship Types: Dynamic from ontology composition
 * Mutation Pattern:
 * 1. Validate group isolation (both entities same group)
 * 2. Validate relationship type is in ontology
 * 3. Create/update connection
 * 4. Log event
 */

// Relationship type validator (auto-generated from ontology composition)
const relationshipTypeValidator = v.union(
  ...CONNECTION_TYPES.map((t) => v.literal(t))
) as any;

export const create = mutation({
  args: {
    groupId: v.id("groups"), // CRITICAL: Multi-tenant isolation
    fromEntityId: v.id("entities"),
    toEntityId: v.id("entities"),
    relationshipType: relationshipTypeValidator,
    metadata: v.optional(v.any()),
    strength: v.optional(v.number()),
    validFrom: v.optional(v.number()),
    validTo: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (args.fromEntityId === args.toEntityId) {
      throw new Error("Cannot connect an entity to itself");
    }

    // VALIDATE: Both entities belong to the group
    const fromEntity = await ctx.db.get(args.fromEntityId);
    const toEntity = await ctx.db.get(args.toEntityId);

    if (!fromEntity || fromEntity.groupId !== args.groupId) {
      throw new Error("From entity not found in group");
    }
    if (!toEntity || toEntity.groupId !== args.groupId) {
      throw new Error("To entity not found in group");
    }

    // GET ACTOR (for event logging)
    const identity = await ctx.auth.getUserIdentity();
    const actor = identity ? await ctx.db
      .query("entities")
      .withIndex("group_type", (q) =>
        q.eq("groupId", args.groupId).eq("type", "user")
      )
      .filter((q) =>
        q.eq(q.field("properties.userId"), identity.tokenIdentifier)
      )
      .first() : undefined;

    const now = Date.now();
    const id = await ctx.db.insert("connections", {
      groupId: args.groupId, // CRITICAL: Include groupId
      fromEntityId: args.fromEntityId,
      toEntityId: args.toEntityId,
      relationshipType: args.relationshipType,
      metadata: args.metadata,
      strength: args.strength,
      validFrom: args.validFrom,
      validTo: args.validTo,
      createdAt: now,
      updatedAt: now,
    });

    // LOG EVENT
    if (actor) {
      await ctx.db.insert("events", {
        groupId: args.groupId,
        type: "thing_created",
        actorId: actor._id,
        targetId: id as any,
        timestamp: now,
        metadata: {
          entityType: "connection",
          relationshipType: args.relationshipType,
          fromEntityId: args.fromEntityId,
          toEntityId: args.toEntityId
        }
      });
    }

    return id;
  },
});

export const upsert = mutation({
  args: {
    groupId: v.id("groups"), // CRITICAL: Multi-tenant isolation
    fromEntityId: v.id("entities"),
    toEntityId: v.id("entities"),
    relationshipType: relationshipTypeValidator,
    metadata: v.optional(v.any()),
    strength: v.optional(v.number()),
    validFrom: v.optional(v.number()),
    validTo: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // VALIDATE: Both entities belong to the group
    const fromEntity = await ctx.db.get(args.fromEntityId);
    const toEntity = await ctx.db.get(args.toEntityId);

    if (!fromEntity || fromEntity.groupId !== args.groupId) {
      throw new Error("From entity not found in group");
    }
    if (!toEntity || toEntity.groupId !== args.groupId) {
      throw new Error("To entity not found in group");
    }

    const existing = await ctx.db
      .query("connections")
      .withIndex("bidirectional", (q) =>
        q
          .eq("fromEntityId", args.fromEntityId)
          .eq("toEntityId", args.toEntityId)
          .eq("relationshipType", args.relationshipType)
      )
      .filter((q) => q.eq(q.field("groupId"), args.groupId))
      .first();

    // GET ACTOR (for event logging)
    const identity = await ctx.auth.getUserIdentity();
    const actor = identity ? await ctx.db
      .query("entities")
      .withIndex("group_type", (q) =>
        q.eq("groupId", args.groupId).eq("type", "user")
      )
      .filter((q) =>
        q.eq(q.field("properties.userId"), identity.tokenIdentifier)
      )
      .first() : undefined;

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        metadata: args.metadata,
        strength: args.strength,
        validFrom: args.validFrom,
        validTo: args.validTo,
        updatedAt: now
      });

      // LOG UPDATE EVENT
      if (actor) {
        await ctx.db.insert("events", {
          groupId: args.groupId,
          type: "thing_updated",
          actorId: actor._id,
          targetId: existing._id as any,
          timestamp: now,
          metadata: {
            entityType: "connection",
            relationshipType: args.relationshipType,
            action: "updated"
          }
        });
      }

      return existing._id;
    }

    const id = await ctx.db.insert("connections", {
      groupId: args.groupId, // CRITICAL: Include groupId
      fromEntityId: args.fromEntityId,
      toEntityId: args.toEntityId,
      relationshipType: args.relationshipType,
      metadata: args.metadata,
      strength: args.strength,
      validFrom: args.validFrom,
      validTo: args.validTo,
      createdAt: now,
      updatedAt: now
    });

    // LOG CREATE EVENT
    if (actor) {
      await ctx.db.insert("events", {
        groupId: args.groupId,
        type: "thing_created",
        actorId: actor._id,
        targetId: id as any,
        timestamp: now,
        metadata: {
          entityType: "connection",
          relationshipType: args.relationshipType,
          fromEntityId: args.fromEntityId,
          toEntityId: args.toEntityId
        }
      });
    }

    return id;
  },
});

export const bulkCreate = mutation({
  args: {
    groupId: v.id("groups"), // CRITICAL: Multi-tenant isolation
    connections: v.array(
      v.object({
        fromEntityId: v.id("entities"),
        toEntityId: v.id("entities"),
        relationshipType: relationshipTypeValidator,
        metadata: v.optional(v.any()),
      })
    ),
  },
  handler: async (ctx, { groupId, connections }) => {
    // VALIDATE: All entities belong to the group
    for (const c of connections) {
      const fromEntity = await ctx.db.get(c.fromEntityId);
      const toEntity = await ctx.db.get(c.toEntityId);

      if (!fromEntity || fromEntity.groupId !== groupId) {
        throw new Error(`From entity ${c.fromEntityId} not found in group`);
      }
      if (!toEntity || toEntity.groupId !== groupId) {
        throw new Error(`To entity ${c.toEntityId} not found in group`);
      }
    }

    // GET ACTOR (for event logging)
    const identity = await ctx.auth.getUserIdentity();
    const actor = identity ? await ctx.db
      .query("entities")
      .withIndex("group_type", (q) =>
        q.eq("groupId", groupId).eq("type", "user")
      )
      .filter((q) =>
        q.eq(q.field("properties.userId"), identity.tokenIdentifier)
      )
      .first() : undefined;

    const now = Date.now();
    const results = [] as any[];
    for (const c of connections) {
      if (c.fromEntityId === c.toEntityId) continue;

      const id = await ctx.db.insert("connections", {
        groupId, // CRITICAL: Include groupId
        fromEntityId: c.fromEntityId,
        toEntityId: c.toEntityId,
        relationshipType: c.relationshipType,
        metadata: c.metadata,
        createdAt: now,
        updatedAt: now
      });

      results.push(id);

      // LOG EVENT for each connection
      if (actor) {
        await ctx.db.insert("events", {
          groupId,
          type: "thing_created",
          actorId: actor._id,
          targetId: id as any,
          timestamp: now,
          metadata: {
            entityType: "connection",
            relationshipType: c.relationshipType,
            fromEntityId: c.fromEntityId,
            toEntityId: c.toEntityId,
            bulkOperation: true
          }
        });
      }
    }
    return results;
  },
});

/**
 * Remove a connection
 */
export const remove = mutation({
  args: {
    connectionId: v.id("connections"),
  },
  handler: async (ctx, args) => {
    // Get the connection to access its groupId for event logging
    const connection = await ctx.db.get(args.connectionId);
    if (!connection) {
      throw new Error("Connection not found");
    }

    // GET ACTOR (for event logging)
    const identity = await ctx.auth.getUserIdentity();
    const actor = identity ? await ctx.db
      .query("entities")
      .withIndex("group_type", (q) =>
        q.eq("groupId", connection.groupId).eq("type", "user")
      )
      .filter((q) =>
        q.eq(q.field("properties.userId"), identity.tokenIdentifier)
      )
      .first() : undefined;

    // Delete the connection
    await ctx.db.delete(args.connectionId);

    // LOG EVENT
    if (actor) {
      await ctx.db.insert("events", {
        groupId: connection.groupId,
        type: "thing_deleted",
        actorId: actor._id,
        targetId: args.connectionId as any,
        timestamp: Date.now(),
        metadata: {
          entityType: "connection",
          relationshipType: connection.relationshipType,
          fromEntityId: connection.fromEntityId,
          toEntityId: connection.toEntityId,
        }
      });
    }

    return { success: true };
  },
});

