import { query } from "../_generated/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";

/**
 * DIMENSION 2: PEOPLE - Query Layer
 *
 * All read operations for people (users with roles)
 * People are represented as entities with type="user"
 *
 * Supports:
 * - Lookup person by email (within a group)
 * - Lookup person by Better Auth userId
 * - List all people in a group
 * - Filter by role (platform_owner, org_owner, org_user, customer)
 * - Get person's group memberships
 *
 * Use Cases:
 * - User profile lookup
 * - Authentication flow (find user by email or userId)
 * - Directory/team listing
 * - Role-based access control
 * - Admin dashboards (all people in org)
 *
 * Performance:
 * - Use group_type index for efficient filtering by user type
 * - Filter by email or userId in-memory (low cardinality filter)
 *
 * Query Pattern: Filter by groupId and type="user", then filter by email/userId
 */

/**
 * Get person by email (within a group)
 */
export const getByEmail = query({
  args: {
    groupId: v.id("groups"),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const person = await ctx.db
      .query("entities")
      .withIndex("group_type", (q) =>
        q.eq("groupId", args.groupId).eq("type", "user")
      )
      .filter((q) => q.eq(q.field("properties.email"), args.email))
      .first();

    return person || null;
  },
});

/**
 * Get person by Better Auth userId
 */
export const getByUserId = query({
  args: {
    groupId: v.id("groups"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const person = await ctx.db
      .query("entities")
      .withIndex("group_type", (q) =>
        q.eq("groupId", args.groupId).eq("type", "user")
      )
      .filter((q) => q.eq(q.field("properties.userId"), args.userId))
      .first();

    return person || null;
  },
});

/**
 * List all people in a group with optional role filter
 */
export const list = query({
  args: {
    groupId: v.id("groups"),
    role: v.optional(v.union(
      v.literal("platform_owner"),
      v.literal("org_owner"),
      v.literal("org_user"),
      v.literal("customer")
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const people = await ctx.db
      .query("entities")
      .withIndex("group_type", (q) =>
        q.eq("groupId", args.groupId).eq("type", "user")
      )
      .collect();

    if (args.role) {
      return people
        .filter((p) => p.properties?.role === args.role)
        .slice(0, args.limit || 100);
    }

    return people.slice(0, args.limit || 100);
  },
});

/**
 * Get person's memberships (all groups they belong to)
 */
export const getMemberships = query({
  args: {
    personId: v.id("entities"),
  },
  handler: async (ctx, args) => {
    const connections = await ctx.db
      .query("connections")
      .withIndex("from_entity", (q) => q.eq("fromEntityId", args.personId))
      .filter((q) => q.eq(q.field("relationshipType"), "member_of"))
      .collect();

    // Get group details for each membership
    const memberships = [];
    for (const conn of connections) {
      // The groupId should be stored in metadata
      const groupId = conn.metadata?.groupId as Id<"groups"> | undefined;
      if (groupId) {
        const group = await ctx.db.get(groupId);
        if (group) {
          memberships.push({
            groupId: group._id,
            groupName: group.name,
            groupType: group.type,
            role: conn.metadata?.role || "member",
            joinedAt: conn.metadata?.joinedAt,
          });
        }
      }
    }

    return memberships;
  },
});
