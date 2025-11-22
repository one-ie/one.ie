/**
 * PageManagementPanel Integration Example
 *
 * Shows how to integrate PageManagementPanel with Convex backend
 * for real data fetching and mutations.
 *
 * This is a reference implementation. Copy patterns to your code.
 */

"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PageManagementPanel } from "./PageManagementPanel";
import { toast } from "@/components/ui/use-toast";

interface PageManagementWithConvexProps {
	websiteId: string;
}

/**
 * Integration wrapper that connects PageManagementPanel to Convex
 */
export function PageManagementWithConvex({
	websiteId,
}: PageManagementWithConvexProps) {
	// Query pages from Convex
	const pages = useQuery(api.queries.pages.listByWebsite, {
		websiteId,
	});

	// Mutations for page operations
	const createPageMutation = useMutation(api.mutations.pages.create);
	const deletePageMutation = useMutation(api.mutations.pages.delete);
	const duplicatePageMutation = useMutation(api.mutations.pages.duplicate);
	const setHomepageMutation = useMutation(api.mutations.pages.setHomepage);

	// Handle page creation
	const handlePageCreate = async (page: any) => {
		try {
			await createPageMutation({
				websiteId,
				name: page.name,
				slug: page.slug,
			});

			toast({
				title: "Success",
				description: `Page "${page.name}" created`,
			});
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to create page",
				variant: "destructive",
			});
		}
	};

	// Handle page deletion
	const handlePageDelete = async (pageId: string) => {
		try {
			await deletePageMutation({ pageId });

			toast({
				title: "Success",
				description: "Page deleted",
			});
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to delete page",
				variant: "destructive",
			});
		}
	};

	// Handle page duplication
	const handlePageDuplicate = async (pageId: string) => {
		try {
			await duplicatePageMutation({ pageId });

			toast({
				title: "Success",
				description: "Page duplicated",
			});
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to duplicate page",
				variant: "destructive",
			});
		}
	};

	// Handle setting homepage
	const handleSetHomepage = async (pageId: string) => {
		try {
			await setHomepageMutation({
				websiteId,
				pageId,
			});

			toast({
				title: "Success",
				description: "Homepage updated",
			});
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to set homepage",
				variant: "destructive",
			});
		}
	};

	// Show loading state while fetching pages
	if (pages === undefined) {
		return <div>Loading pages...</div>;
	}

	return (
		<PageManagementPanel
			websiteId={websiteId}
			pages={pages}
			onPageCreate={handlePageCreate}
			onPageDelete={handlePageDelete}
			onPageDuplicate={handlePageDuplicate}
			onSetHomepage={handleSetHomepage}
		/>
	);
}

/**
 * Convex Backend Implementation Reference
 *
 * This is what your backend queries and mutations should look like.
 * Place this code in `/backend/convex/queries/pages.ts` and `/backend/convex/mutations/pages.ts`
 */

/**
 * EXAMPLE: Query to list pages by website
 *
 * Location: /backend/convex/queries/pages.ts
 */
export const queryExample = `
import { query } from "../_generated/server";
import { v } from "convex/values";

export const listByWebsite = query({
  args: {
    websiteId: v.id("websites"),
  },

  handler: async (ctx, args) => {
    // Get pages for this website
    const pages = await ctx.db
      .query("pages")
      .withIndex("by_website", (q) =>
        q.eq("websiteId", args.websiteId)
      )
      .order("desc")
      .collect();

    return pages.map((page) => ({
      id: page._id,
      name: page.name,
      slug: page.slug,
      status: page.status,
      isHomepage: page.isHomepage,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
      viewCount: page.viewCount,
    }));
  },
});
`;

/**
 * EXAMPLE: Mutation to create a page
 *
 * Location: /backend/convex/mutations/pages.ts
 */
export const mutationCreateExample = `
import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    websiteId: v.id("websites"),
    name: v.string(),
    slug: v.string(),
  },

  handler: async (ctx, args) => {
    // Create page
    const pageId = await ctx.db.insert("pages", {
      websiteId: args.websiteId,
      name: args.name,
      slug: args.slug,
      status: "draft",
      isHomepage: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      viewCount: 0,
    });

    // Log event
    const identity = await ctx.auth.getUserIdentity();
    if (identity) {
      await ctx.db.insert("events", {
        type: "page_created",
        userId: identity.tokenIdentifier,
        targetId: pageId,
        websiteId: args.websiteId,
        timestamp: Date.now(),
      });
    }

    return pageId;
  },
});
`;

/**
 * EXAMPLE: Mutation to delete a page
 *
 * Location: /backend/convex/mutations/pages.ts
 */
export const mutationDeleteExample = `
import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const delete_ = mutation({
  args: {
    pageId: v.id("pages"),
  },

  handler: async (ctx, args) => {
    const page = await ctx.db.get(args.pageId);
    if (!page) throw new Error("Page not found");

    // Delete page
    await ctx.db.delete(args.pageId);

    // Log event
    const identity = await ctx.auth.getUserIdentity();
    if (identity) {
      await ctx.db.insert("events", {
        type: "page_deleted",
        userId: identity.tokenIdentifier,
        targetId: args.pageId,
        websiteId: page.websiteId,
        timestamp: Date.now(),
      });
    }

    return args.pageId;
  },
});
`;

/**
 * EXAMPLE: Mutation to set homepage
 *
 * Location: /backend/convex/mutations/pages.ts
 */
export const mutationSetHomepageExample = `
import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const setHomepage = mutation({
  args: {
    websiteId: v.id("websites"),
    pageId: v.id("pages"),
  },

  handler: async (ctx, args) => {
    // Unset current homepage
    const currentHomepage = await ctx.db
      .query("pages")
      .withIndex("by_website", (q) =>
        q.eq("websiteId", args.websiteId)
      )
      .filter((p) => p.isHomepage === true)
      .first();

    if (currentHomepage) {
      await ctx.db.patch(currentHomepage._id, {
        isHomepage: false,
      });
    }

    // Set new homepage
    await ctx.db.patch(args.pageId, {
      isHomepage: true,
    });

    // Log event
    const identity = await ctx.auth.getUserIdentity();
    if (identity) {
      await ctx.db.insert("events", {
        type: "page_set_homepage",
        userId: identity.tokenIdentifier,
        targetId: args.pageId,
        websiteId: args.websiteId,
        timestamp: Date.now(),
      });
    }

    return args.pageId;
  },
});
`;

/**
 * EXAMPLE: Schema definition for pages
 *
 * Location: /backend/convex/schema.ts
 */
export const schemaExample = `
export default defineSchema({
  pages: defineTable({
    // Identity
    websiteId: v.id("websites"),
    name: v.string(),
    slug: v.string(),

    // Content
    content: v.optional(v.string()),
    htmlContent: v.optional(v.string()),

    // Status
    status: v.union(v.literal("draft"), v.literal("published")),
    isHomepage: v.boolean(),

    // Analytics
    viewCount: v.number(),
    lastViewedAt: v.optional(v.number()),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),

    // Metadata
    metadata: v.optional(v.any()),
  })
    .index("by_website", ["websiteId"])
    .index("by_slug", ["websiteId", "slug"])
    .index("by_status", ["websiteId", "status"])
    .searchIndex("search_pages", {
      searchField: "name",
      filterFields: ["websiteId", "status"],
    }),
});
`;
