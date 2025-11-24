import { mutation } from "../_generated/server";

/**
 * Initialize the default platform group
 * This should be run once on deployment
 */
export const initializeDefaultGroup = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if default group already exists
    const existingDefault = await ctx.db
      .query("groups")
      .withIndex("by_slug", (q) => q.eq("slug", "platform"))
      .first();

    if (existingDefault) {
      return { groupId: existingDefault._id, message: "Default group already exists" };
    }

    // Create the default platform group
    const groupId = await ctx.db.insert("groups", {
      slug: "platform",
      name: "ONE Platform",
      type: "organization",
      description: "Default platform organization",
      metadata: {},
      settings: {
        visibility: "public",
        joinPolicy: "open",
        plan: "starter",
        limits: {
          users: 1000,
          storage: 10000000, // 10GB
          apiCalls: 100000,
        },
      },
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { groupId, message: "Default group created successfully" };
  },
});
