import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * E-COMMERCE: PRODUCT QUERIES
 *
 * Query operations for products following the 6-dimension pattern:
 * - All queries filter by groupId for multi-tenant isolation
 * - Read-only operations, no mutations
 * - Use indexes for performance
 */

/**
 * Get a single product by ID
 */
export const getProduct = query({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new Error("Product not found");
    }
    return product;
  },
});

/**
 * Get a product by slug (for SEO-friendly URLs)
 */
export const getProductBySlug = query({
  args: {
    groupId: v.id("groups"),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .filter((q) => q.eq(q.field("groupId"), args.groupId))
      .first();

    if (!product) {
      throw new Error("Product not found");
    }

    return product;
  },
});

/**
 * List all products for a group
 */
export const listProducts = query({
  args: {
    groupId: v.id("groups"),
    status: v.optional(v.union(v.literal("draft"), v.literal("active"), v.literal("archived"))),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let q;

    // Filter by group and category if provided
    if (args.category) {
      const category = args.category;
      q = ctx.db.query("products").withIndex("group_category", (q) =>
        q.eq("groupId", args.groupId).eq("category", category)
      );
    } else {
      q = ctx.db.query("products").withIndex("by_group", (q) => q.eq("groupId", args.groupId));
    }

    // Apply status filter if provided
    if (args.status) {
      q = q.filter((q) => q.eq(q.field("status"), args.status));
    }

    const products = await q.collect();
    return products;
  },
});

/**
 * Search products by name
 */
export const searchProducts = query({
  args: {
    groupId: v.id("groups"),
    query: v.string(),
    status: v.optional(v.union(v.literal("draft"), v.literal("active"), v.literal("archived"))),
  },
  handler: async (ctx, args) => {
    const status = args.status || "active";
    const products = await ctx.db
      .query("products")
      .withSearchIndex("search_products", (q) =>
        q.search("name", args.query)
          .eq("groupId", args.groupId)
          .eq("status", status)
      )
      .collect();

    return products;
  },
});

/**
 * Get products by category
 */
export const getProductsByCategory = query({
  args: {
    groupId: v.id("groups"),
    category: v.string(),
    status: v.optional(v.union(v.literal("draft"), v.literal("active"), v.literal("archived"))),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("products")
      .withIndex("group_category", (q) =>
        q.eq("groupId", args.groupId).eq("category", args.category)
      );

    // Apply status filter if provided
    if (args.status) {
      q = q.filter((q) => q.eq(q.field("status"), args.status));
    }

    const products = await q.collect();
    return products;
  },
});

/**
 * Get featured products
 */
export const getFeaturedProducts = query({
  args: {
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "active"),
          q.eq(q.field("featured"), true)
        )
      )
      .collect();

    return products;
  },
});

/**
 * Get product categories (unique categories with counts)
 */
export const getCategories = query({
  args: {
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    // Count products by category
    const categoryMap = new Map<string, number>();
    for (const product of products) {
      const count = categoryMap.get(product.category) || 0;
      categoryMap.set(product.category, count + 1);
    }

    // Convert to array
    const categories = Array.from(categoryMap.entries()).map(([name, count]) => ({
      name,
      count,
    }));

    return categories;
  },
});

/**
 * Get low inventory products (for admin alerts)
 */
export const getLowInventoryProducts = query({
  args: {
    groupId: v.id("groups"),
    threshold: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const threshold = args.threshold || 10;

    const products = await ctx.db
      .query("products")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "active"),
          q.lte(q.field("inventory"), threshold)
        )
      )
      .collect();

    return products;
  },
});

/**
 * Get product statistics for a group
 */
export const getProductStats = query({
  args: {
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    const active = products.filter((p) => p.status === "active").length;
    const draft = products.filter((p) => p.status === "draft").length;
    const archived = products.filter((p) => p.status === "archived").length;
    const total = products.length;

    const totalValue = products
      .filter((p) => p.status === "active")
      .reduce((sum, p) => sum + p.price * p.inventory, 0);

    const lowInventory = products.filter(
      (p) => p.status === "active" && p.inventory < 10
    ).length;

    return {
      total,
      active,
      draft,
      archived,
      totalValue,
      lowInventory,
    };
  },
});

/**
 * Get related products (same category, excluding current product)
 */
export const getRelatedProducts = query({
  args: {
    productId: v.id("products"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product || !("category" in product) || !product.category) {
      throw new Error("Product not found or has no category");
    }

    const limit = args.limit || 4;
    const category = product.category;

    const relatedProducts = await ctx.db
      .query("products")
      .withIndex("group_category", (q) =>
        q.eq("groupId", product.groupId).eq("category", category)
      )
      .filter((q) =>
        q.and(
          q.neq(q.field("_id"), args.productId),
          q.eq(q.field("status"), "active")
        )
      )
      .take(limit);

    return relatedProducts;
  },
});
