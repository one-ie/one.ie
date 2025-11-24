import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Contact form queries - Ontology-aligned
 *
 * Queries contact_submission entities
 */

/**
 * List all contact submissions for a group
 */
export const list = query({
  args: {
    groupId: v.id("groups"),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("entities")
      .withIndex("group_type", (q) =>
        q.eq("groupId", args.groupId).eq("type", "contact_submission")
      )
      .order("desc");

    // Filter by status if provided
    if (args.status) {
      q = q.filter((q) => q.eq(q.field("status"), args.status));
    }

    // Apply limit if provided
    const results = args.limit ? await q.take(args.limit) : await q.collect();

    return results;
  },
});

/**
 * Get a single contact submission by ID
 */
export const getById = query({
  args: {
    contactId: v.id("entities"),
  },
  handler: async (ctx, args) => {
    const contact = await ctx.db.get(args.contactId);

    if (!contact) {
      return null;
    }

    if (contact.type !== "contact_submission") {
      throw new Error("Entity is not a contact submission");
    }

    return contact;
  },
});

/**
 * Count contact submissions by status
 */
export const countByStatus = query({
  args: {
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    const allContacts = await ctx.db
      .query("entities")
      .withIndex("group_type", (q) =>
        q.eq("groupId", args.groupId).eq("type", "contact_submission")
      )
      .collect();

    const statusCounts = {
      active: 0,
      archived: 0,
      draft: 0,
    };

    allContacts.forEach((contact) => {
      if (contact.status === "active") statusCounts.active++;
      else if (contact.status === "archived") statusCounts.archived++;
      else if (contact.status === "draft") statusCounts.draft++;
    });

    return statusCounts;
  },
});
