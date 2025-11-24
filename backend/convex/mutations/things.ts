import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { THING_TYPES, isThingType, EVENT_TYPES, isEventType } from "../types/ontology";

/**
 * DIMENSION 3: THINGS
 *
 * All nouns in the system: users, agents, content, tokens, courses, etc.
 * Stored in "entities" database table (ontology calls it "things")
 * Each thing belongs to a group (groupId) for multi-tenant isolation
 * Flexible properties field for type-specific data
 *
 * Mutation Pattern:
 * 1. AUTHENTICATE user via Better Auth
 * 2. VALIDATE group exists and is active
 * 3. VALIDATE type against ontology composition (THING_TYPES)
 * 4. GET ACTOR (find user entity) for event logging
 * 5. CREATE thing in database
 * 6. LOG EVENT (audit trail)
 */
export const create = mutation({
  args: {
    groupId: v.id("groups"),
    type: v.string(), // Validated against THING_TYPES at runtime
    name: v.string(),
    properties: v.optional(v.any()),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("published"),
      v.literal("archived"),
      v.literal("inactive")
    ))
  },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE: Get user identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated: Must be logged in to create entities");
    }

    // 2. VALIDATE GROUP: Check group exists and is active
    const group = await ctx.db.get(args.groupId);
    if (!group) {
      throw new Error("Group not found");
    }
    if (group.status !== "active") {
      throw new Error("Group is not active");
    }

    // 3. VALIDATE TYPE: Check type is in THING_TYPES from ontology composition
    if (!isThingType(args.type)) {
      throw new Error(
        `Invalid entity type "${args.type}". Must be one of: ${THING_TYPES.join(", ")}`
      );
    }

    // 4. GET ACTOR: Find user entity for current user
    const actor = await ctx.db
      .query("entities")
      .withIndex("group_type", (q) =>
        q.eq("groupId", args.groupId).eq("type", "user")
      )
      .filter((q) =>
        q.eq(q.field("properties.userId"), identity.tokenIdentifier)
      )
      .first();

    // 5. CREATE ENTITY
    const now = Date.now();
    const entityId = await ctx.db.insert("entities", {
      groupId: args.groupId,
      type: args.type as any, // Type validated above
      name: args.name,
      properties: args.properties || {},
      status: args.status || "draft",
      schemaVersion: 1,
      createdAt: now,
      updatedAt: now
    });

    // 6. LOG EVENT (CRITICAL - audit trail)
    if (actor) {
      await ctx.db.insert("events", {
        groupId: args.groupId,
        type: "thing_created",
        actorId: actor._id,
        targetId: entityId,
        timestamp: now,
        metadata: {
          entityType: args.type,
          entityName: args.name,
          status: args.status || "draft"
        }
      });
    }

    return entityId;
  }
});

/**
 * Update an existing entity
 *
 * Validates entity belongs to group before updating
 * Logs changes in event metadata
 */
export const update = mutation({
  args: {
    entityId: v.id("entities"),
    name: v.optional(v.string()),
    properties: v.optional(v.any()),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("published"),
      v.literal("archived"),
      v.literal("inactive")
    ))
  },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated: Must be logged in to update entities");
    }

    // 2. GET EXISTING ENTITY
    const entity = await ctx.db.get(args.entityId);
    if (!entity) {
      throw new Error("Entity not found");
    }

    // 3. VALIDATE GROUP ACCESS
    const group = await ctx.db.get(entity.groupId);
    if (!group) {
      throw new Error("Group not found");
    }
    if (group.status !== "active") {
      throw new Error("Group is not active");
    }

    // 4. GET ACTOR
    const actor = await ctx.db
      .query("entities")
      .withIndex("group_type", (q) =>
        q.eq("groupId", entity.groupId).eq("type", "user")
      )
      .filter((q) =>
        q.eq(q.field("properties.userId"), identity.tokenIdentifier)
      )
      .first();

    // 5. BUILD UPDATE OBJECT
    const updates: any = {
      updatedAt: Date.now()
    };
    const changes: string[] = [];

    if (args.name !== undefined) {
      updates.name = args.name;
      changes.push("name");
    }
    if (args.properties !== undefined) {
      updates.properties = args.properties;
      changes.push("properties");
    }
    if (args.status !== undefined) {
      updates.status = args.status;
      changes.push("status");
    }

    // 6. UPDATE ENTITY
    await ctx.db.patch(args.entityId, updates);

    // 7. LOG EVENT
    const now = Date.now();
    if (actor) {
      await ctx.db.insert("events", {
        groupId: entity.groupId,
        type: "thing_updated",
        actorId: actor._id,
        targetId: args.entityId,
        timestamp: now,
        metadata: {
          entityType: entity.type,
          entityName: entity.name,
          changes
        }
      });
    }

    return args.entityId;
  }
});

/**
 * Archive an entity (soft delete)
 *
 * Sets status to "archived" - maintains audit trail
 * Does NOT delete data
 */
export const archive = mutation({
  args: {
    entityId: v.id("entities")
  },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated: Must be logged in to archive entities");
    }

    // 2. GET ENTITY
    const entity = await ctx.db.get(args.entityId);
    if (!entity) {
      throw new Error("Entity not found");
    }

    // 3. VALIDATE GROUP
    const group = await ctx.db.get(entity.groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    // 4. GET ACTOR
    const actor = await ctx.db
      .query("entities")
      .withIndex("group_type", (q) =>
        q.eq("groupId", entity.groupId).eq("type", "user")
      )
      .filter((q) =>
        q.eq(q.field("properties.userId"), identity.tokenIdentifier)
      )
      .first();

    // 5. ARCHIVE ENTITY
    const now = Date.now();
    await ctx.db.patch(args.entityId, {
      status: "archived",
      updatedAt: now,
      deletedAt: now
    });

    // 6. LOG EVENT
    if (actor) {
      await ctx.db.insert("events", {
        groupId: entity.groupId,
        type: "thing_deleted",
        actorId: actor._id,
        targetId: args.entityId,
        timestamp: now,
        metadata: {
          entityType: entity.type,
          entityName: entity.name,
          action: "archived"
        }
      });
    }

    return args.entityId;
  }
});

/**
 * Restore an archived entity
 *
 * Sets status back to "active"
 * Clears deletedAt timestamp
 */
export const restore = mutation({
  args: {
    entityId: v.id("entities")
  },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated: Must be logged in to restore entities");
    }

    // 2. GET ENTITY
    const entity = await ctx.db.get(args.entityId);
    if (!entity) {
      throw new Error("Entity not found");
    }

    if (entity.status !== "archived") {
      throw new Error("Entity is not archived");
    }

    // 3. VALIDATE GROUP
    const group = await ctx.db.get(entity.groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    // 4. GET ACTOR
    const actor = await ctx.db
      .query("entities")
      .withIndex("group_type", (q) =>
        q.eq("groupId", entity.groupId).eq("type", "user")
      )
      .filter((q) =>
        q.eq(q.field("properties.userId"), identity.tokenIdentifier)
      )
      .first();

    // 5. RESTORE ENTITY
    const now = Date.now();
    await ctx.db.patch(args.entityId, {
      status: "active",
      updatedAt: now
    });

    // 6. LOG EVENT
    if (actor) {
      await ctx.db.insert("events", {
        groupId: entity.groupId,
        type: "thing_updated", // Restoration is an update, not a new creation
        actorId: actor._id,
        targetId: args.entityId,
        timestamp: now,
        metadata: {
          entityType: entity.type,
          entityName: entity.name,
          action: "restored"
        }
      });
    }

    return args.entityId;
  }
});

/**
 * Submit contact form (creates contact_submission thing)
 * Part of Dimension 3: THINGS (contact_submission is a thing type)
 */
export const submitContact = mutation({
  args: {
    groupId: v.id("groups"),
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. VALIDATE GROUP
    const group = await ctx.db.get(args.groupId);
    if (!group) {
      throw new Error("Group not found");
    }
    if (group.status !== "active") {
      throw new Error("Group is not active");
    }

    // 2. CREATE CONTACT SUBMISSION THING
    const now = Date.now();
    const contactEntityId = await ctx.db.insert("entities", {
      groupId: args.groupId,
      type: "contact_submission",
      name: `Contact from ${args.name}`,
      properties: {
        name: args.name,
        email: args.email,
        subject: args.subject,
        message: args.message,
        status: "new",
      },
      status: "active",
      schemaVersion: 1,
      createdAt: now,
      updatedAt: now,
    });

    // 3. LOG EVENT (Contact form submission is anonymous, so no actorId)
    await ctx.db.insert("events", {
      groupId: args.groupId,
      type: "contact_submitted",
      actorId: undefined, // Anonymous submission
      targetId: contactEntityId,
      timestamp: now,
      metadata: {
        name: args.name,
        email: args.email,
        subject: args.subject,
        messagePreview: args.message.substring(0, 100),
      },
    });

    return {
      success: true,
      contactId: contactEntityId,
    };
  },
});
