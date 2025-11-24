import { query } from "../_generated/server";

/**
 * Get the default platform group
 */
export const getDefaultGroup = query({
  args: {},
  handler: async (ctx) => {
    const defaultGroup = await ctx.db
      .query("groups")
      .withIndex("by_slug", (q) => q.eq("slug", "platform"))
      .first();

    if (!defaultGroup) {
      throw new Error(
        "Default group not found. Please run initializeDefaultGroup mutation first."
      );
    }

    return defaultGroup;
  },
});
