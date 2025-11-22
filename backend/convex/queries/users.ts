/**
 * User Queries - Get current user information
 *
 * These queries help frontend components get the current authenticated user's
 * Thing ID and other metadata.
 */

import { query } from "../_generated/server";

/**
 * Get current user's Thing record (creator)
 *
 * Returns the current authenticated user's thing record, which includes:
 * - _id (Thing ID) - needed for event queries
 * - groupId - for multi-tenant isolation
 * - role - for permission checks
 * - properties - user metadata
 *
 * Returns null if not authenticated
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    // 1. Get auth identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // 2. Find user's thing record by email
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person) {
      return null;
    }

    // 3. Return user data
    return {
      _id: person._id,
      name: person.name,
      email: person.properties?.email,
      groupId: person.groupId,
      role: person.properties?.role,
      avatar: person.properties?.avatar,
      metadata: person.properties,
    };
  },
});
