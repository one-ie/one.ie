import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { EVENT_TYPES } from "../types/ontology";

/**
 * DIMENSION 2: PEOPLE
 *
 * Authorization & governance: who can do what in the system
 * People are represented as Things with type="user" + role metadata
 *
 * 4 Standard Roles:
 * - platform_owner: Full platform access (manages all organizations)
 * - org_owner: Full organization access (creates subgroups, manages members)
 * - org_user: Limited organization access (can create things, not manage users)
 * - customer: External access (read-only or specific resource access)
 *
 * Links to Better Auth:
 * Properties.userId = Better Auth user identifier
 * Properties.email = User email from auth system
 *
 * Convenience Mutations:
 * This file wraps entities mutations for human-specific operations
 * (create person, update role, manage group membership)
 *
 * Mutation Pattern: validate group → create/update person entity → manage connections → log event
 */

/**
 * Create a person (convenience wrapper for entities.create)
 */
export const create = mutation({
  args: {
    groupId: v.id("groups"),
    name: v.string(),
    email: v.string(),
    role: v.union(
      v.literal("platform_owner"),
      v.literal("org_owner"),
      v.literal("org_user"),
      v.literal("customer")
    ),
    userId: v.optional(v.string()), // Better Auth user ID
    properties: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Validate group exists
    const group = await ctx.db.get(args.groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    // Check if person with this email already exists in group
    const existing = await ctx.db
      .query("entities")
      .withIndex("group_type", (q) =>
        q.eq("groupId", args.groupId).eq("type", "user")
      )
      .filter((q) => q.eq(q.field("properties.email"), args.email))
      .first();

    if (existing) {
      throw new Error("Person with this email already exists in this group");
    }

    // Create person entity
    const personId = await ctx.db.insert("entities", {
      groupId: args.groupId,
      type: "user",
      name: args.name,
      properties: {
        email: args.email,
        role: args.role,
        userId: args.userId,
        ...args.properties,
      },
      status: "active",
      schemaVersion: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // TODO: Create connection to group when "member_of" is added to ontology
    // await ctx.db.insert("connections", {
    //   groupId: args.groupId,
    //   fromEntityId: personId,
    //   toEntityId: args.groupId as any,
    //   relationshipType: "member_of",
    //   metadata: {
    //     role: args.role,
    //     joinedAt: Date.now(),
    //   },
    //   createdAt: Date.now(),
    //   updatedAt: Date.now(),
    // });

    // Log event (using valid event type from ontology)
    await ctx.db.insert("events", {
      groupId: args.groupId,
      type: "thing_created",
      actorId: personId,
      targetId: personId,
      timestamp: Date.now(),
      metadata: {
        entityType: "user",
        email: args.email,
        role: args.role,
      },
    });

    return personId;
  },
});

/**
 * Update person role
 */
export const updateRole = mutation({
  args: {
    personId: v.id("entities"),
    newRole: v.union(
      v.literal("platform_owner"),
      v.literal("org_owner"),
      v.literal("org_user"),
      v.literal("customer")
    ),
    actorId: v.optional(v.id("entities")), // Who is making the change
  },
  handler: async (ctx, args) => {
    const person = await ctx.db.get(args.personId);
    if (!person || person.type !== "user") {
      throw new Error("Person not found");
    }

    const oldRole = person.properties?.role;
    const personSchemaVersion = person.schemaVersion || 1;

    // Update person properties
    await ctx.db.patch(args.personId, {
      properties: {
        ...person.properties,
        role: args.newRole,
      },
      schemaVersion: personSchemaVersion,
      updatedAt: Date.now(),
    });

    // Update member_of connection metadata
    const memberConnection = await ctx.db
      .query("connections")
      .withIndex("from_entity", (q) => q.eq("fromEntityId", args.personId))
      .filter((q) => q.eq(q.field("relationshipType"), "member_of"))
      .first();

    if (memberConnection) {
      await ctx.db.patch(memberConnection._id, {
        metadata: {
          ...memberConnection.metadata,
          role: args.newRole,
          roleChangedAt: Date.now(),
        },
      });
    }

    // Log event (using valid event type from ontology)
    await ctx.db.insert("events", {
      groupId: person.groupId,
      type: "thing_updated",
      actorId: args.actorId || args.personId,
      targetId: args.personId,
      timestamp: Date.now(),
      metadata: {
        entityType: "user",
        action: "role_changed",
        oldRole,
        newRole: args.newRole,
      },
    });

    return args.personId;
  },
});

/**
 * Update person profile
 */
export const updateProfile = mutation({
  args: {
    personId: v.id("entities"),
    name: v.optional(v.string()),
    properties: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const person = await ctx.db.get(args.personId);
    if (!person || person.type !== "user") {
      throw new Error("Person not found");
    }

    // Update person
    const personSchemaVersion = person.schemaVersion || 1;
    await ctx.db.patch(args.personId, {
      ...(args.name && { name: args.name }),
      ...(args.properties && {
        properties: {
          ...person.properties,
          ...args.properties,
        },
      }),
      schemaVersion: personSchemaVersion,
      updatedAt: Date.now(),
    });

    // Log event (using valid event type from ontology)
    await ctx.db.insert("events", {
      groupId: person.groupId,
      type: "thing_updated",
      actorId: args.personId,
      targetId: args.personId,
      timestamp: Date.now(),
      metadata: {
        entityType: "user",
        action: "profile_updated",
        updated: Object.keys(args).filter((k) => k !== "personId"),
      },
    });

    return args.personId;
  },
});

/**
 * Remove person from group (soft delete)
 */
export const removeFromGroup = mutation({
  args: {
    personId: v.id("entities"),
    actorId: v.optional(v.id("entities")),
  },
  handler: async (ctx, args) => {
    const person = await ctx.db.get(args.personId);
    if (!person || person.type !== "user") {
      throw new Error("Person not found");
    }

    // Soft delete person (archive)
    await ctx.db.patch(args.personId, {
      status: "archived",
      updatedAt: Date.now(),
    });

    // Remove member_of connection
    const memberConnection = await ctx.db
      .query("connections")
      .withIndex("from_entity", (q) => q.eq("fromEntityId", args.personId))
      .filter((q) => q.eq(q.field("relationshipType"), "member_of"))
      .first();

    if (memberConnection) {
      await ctx.db.delete(memberConnection._id);
    }

    // Log event (using valid event type from ontology)
    await ctx.db.insert("events", {
      groupId: person.groupId,
      type: "thing_deleted",
      actorId: args.actorId || args.personId,
      targetId: args.personId,
      timestamp: Date.now(),
      metadata: {
        entityType: "user",
        action: "removed_from_group",
        email: person.properties?.email,
        role: person.properties?.role,
      },
    });

    return { success: true };
  },
});

/**
 * Add person to multiple groups
 */
export const addToGroups = mutation({
  args: {
    personId: v.id("entities"),
    groupIds: v.array(v.id("groups")),
    role: v.optional(
      v.union(
        v.literal("platform_owner"),
        v.literal("org_owner"),
        v.literal("org_user"),
        v.literal("customer")
      )
    ),
  },
  handler: async (ctx, args) => {
    const person = await ctx.db.get(args.personId);
    if (!person || person.type !== "user") {
      throw new Error("Person not found");
    }

    const connectionIds = [];

    for (const groupId of args.groupIds) {
      // Verify group exists
      const group = await ctx.db.get(groupId);
      if (!group) {
        continue; // Skip non-existent groups
      }

      // Check if already a member
      const existing = await ctx.db
        .query("connections")
        .withIndex("from_entity", (q) => q.eq("fromEntityId", args.personId))
        .filter((q) =>
          q.and(q.eq(q.field("relationshipType"), "member_of"), q.eq(q.field("toEntityId"), groupId as any))
        )
        .first();

      if (existing) {
        continue; // Skip if already member
      }

      // Create member_of connection
      const connectionId = await ctx.db.insert("connections", {
        groupId,
        fromEntityId: args.personId,
        toEntityId: groupId as any, // Cast group ID as entity for now
        relationshipType: "member_of",
        metadata: {
          role: args.role || person.properties?.role || "org_user",
          joinedAt: Date.now(),
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      connectionIds.push(connectionId);

      // Log event (using valid event type from ontology)
      await ctx.db.insert("events", {
        groupId,
        type: "thing_created",
        actorId: args.personId,
        targetId: args.personId,
        timestamp: Date.now(),
        metadata: {
          entityType: "user",
          action: "added_to_group",
          groupId,
          groupName: group.name,
        },
      });
    }

    return { connectionIds, count: connectionIds.length };
  },
});

