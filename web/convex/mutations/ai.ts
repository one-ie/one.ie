import { v } from "convex/values";
import { mutation } from "../_generated/server";

/**
 * AI Mutations
 *
 * Implements AI-powered page generation and modification:
 * - Uses OpenAI/Anthropic to generate page code from prompts
 * - ALWAYS creates events for AI operations
 * - ALWAYS tracks token usage and costs
 * - ALWAYS creates connections (ai_assistant → page)
 */

// ============================================================================
// GENERATE PAGE (AI-Powered)
// ============================================================================

export const generatePage = mutation({
  args: {
    websiteId: v.id("entities"),
    prompt: v.string(),
    pageType: v.optional(
      v.union(v.literal("landing_page"), v.literal("page"), v.literal("blog_post"))
    ),
    context: v.optional(
      v.object({
        brandColors: v.optional(
          v.object({
            primary: v.optional(v.string()),
            secondary: v.optional(v.string()),
            accent: v.optional(v.string()),
          })
        ),
        brandName: v.optional(v.string()),
        industry: v.optional(v.string()),
        targetAudience: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const creator = await ctx.db
      .query("entities")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((q) => q.eq(q.field("properties.email"), identity.email))
      .first();

    if (!creator) {
      throw new Error("Creator not found");
    }

    // 2. VALIDATE WEBSITE
    const website = await ctx.db.get(args.websiteId);
    if (!website || website.type !== "website") {
      throw new Error("Website not found");
    }

    // Verify ownership
    const ownership = await ctx.db
      .query("connections")
      .withIndex("from_type", (q) =>
        q.eq("fromEntityId", creator._id).eq("relationshipType", "owns")
      )
      .filter((q) => q.eq(q.field("toEntityId"), args.websiteId))
      .first();

    if (!ownership) {
      throw new Error("You do not own this website");
    }

    // 3. CHECK GROUP LIMITS (AI messages)
    if (!website.groupId) {
      throw new Error("Website has no group assigned");
    }

    const group = await ctx.db.get(website.groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    if (group.usage.aiMessages >= group.limits.aiMessages) {
      throw new Error(
        "AI message limit reached for this group. Please upgrade your plan."
      );
    }

    // 4. CREATE AI CONVERSATION RECORD
    const now = Date.now();
    const conversationId = await ctx.db.insert("entities", {
      type: "ai_conversation",
      name: `AI Generation: ${args.prompt.substring(0, 50)}...`,
      groupId: website.groupId,
      properties: {
        websiteId: args.websiteId,
        prompt: args.prompt,
        context: args.context || {},
        messages: [
          {
            role: "user",
            content: args.prompt,
            timestamp: now,
          },
        ],
        totalTokens: 0,
        conversationStatus: "generating",
      },
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    // 5. GENERATE PAGE CODE (Placeholder - will be replaced with actual AI call)
    // TODO: Replace with actual OpenAI/Anthropic API call
    const generatedCode = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${args.context?.brandName || "Generated Page"}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50">
  <div class="max-w-7xl mx-auto px-4 py-16">
    <h1 class="text-4xl font-bold text-gray-900 mb-4">
      ${args.context?.brandName || "Welcome"}
    </h1>
    <p class="text-lg text-gray-600">
      Generated from prompt: ${args.prompt}
    </p>
    <!-- AI-generated content will go here -->
  </div>
</body>
</html>
    `.trim();

    const tokensUsed = 500; // Placeholder
    const model = "gpt-4o"; // Placeholder

    // 6. CREATE PAGE ENTITY
    const pageName = args.context?.brandName
      ? `${args.context.brandName} - ${args.pageType || "Landing Page"}`
      : `Generated ${args.pageType || "Page"}`;

    const pageId = await ctx.db.insert("entities", {
      type: args.pageType || "landing_page",
      name: pageName,
      groupId: website.groupId,
      properties: {
        code: generatedCode,
        compiledHtml: generatedCode,
        prompt: args.prompt,
        context: args.context || {},
        generatedBy: "ai",
        aiModel: model,
        tokensUsed: tokensUsed,
        metadata: {
          description: args.prompt.substring(0, 160),
          keywords: [],
          ogImage: "",
        },
      },
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });

    // 7. CREATE CONNECTIONS
    // website → page
    await ctx.db.insert("connections", {
      fromEntityId: args.websiteId,
      toEntityId: pageId,
      relationshipType: "contains",
      metadata: {
        generatedBy: "ai",
        prompt: args.prompt,
      },
      createdAt: now,
    });

    // creator → page
    await ctx.db.insert("connections", {
      fromEntityId: creator._id,
      toEntityId: pageId,
      relationshipType: "created_by",
      metadata: {
        method: "ai_generation",
      },
      createdAt: now,
    });

    // ai_conversation → page
    await ctx.db.insert("connections", {
      fromEntityId: conversationId,
      toEntityId: pageId,
      relationshipType: "generated_by",
      metadata: {
        tokensUsed: tokensUsed,
        model: model,
      },
      createdAt: now,
    });

    // 8. UPDATE AI CONVERSATION
    await ctx.db.patch(conversationId, {
      properties: {
        ...((await ctx.db.get(conversationId))?.properties || {}),
        messages: [
          {
            role: "user",
            content: args.prompt,
            timestamp: now,
          },
          {
            role: "assistant",
            content: `Generated page with ID: ${pageId}`,
            timestamp: now + 1,
          },
        ],
        totalTokens: tokensUsed,
        conversationStatus: "completed",
        resultPageId: pageId,
      },
      updatedAt: now,
    });

    // 9. UPDATE GROUP USAGE
    await ctx.db.patch(website.groupId, {
      usage: {
        ...group.usage,
        aiMessages: group.usage.aiMessages + 1,
        pages: group.usage.pages + 1,
      },
      updatedAt: now,
    });

    // 10. LOG EVENTS
    await ctx.db.insert("events", {
      type: "ai_page_generated",
      actorId: creator._id,
      targetId: pageId,
      timestamp: now,
      metadata: {
        websiteId: args.websiteId,
        prompt: args.prompt,
        tokensUsed: tokensUsed,
        model: model,
        conversationId: conversationId,
      },
    });

    await ctx.db.insert("events", {
      type: "entity_created",
      actorId: creator._id,
      targetId: pageId,
      timestamp: now,
      metadata: {
        entityType: args.pageType || "landing_page",
        generatedBy: "ai",
        websiteId: args.websiteId,
      },
    });

    return {
      pageId,
      conversationId,
      tokensUsed,
      model,
    };
  },
});

// ============================================================================
// MODIFY PAGE (AI-Powered)
// ============================================================================

export const modifyPage = mutation({
  args: {
    pageId: v.id("entities"),
    prompt: v.string(),
    context: v.optional(v.object({
      section: v.optional(v.string()), // "hero", "features", "pricing", etc.
      action: v.optional(v.string()), // "add", "remove", "modify", "replace"
    })),
  },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const creator = await ctx.db
      .query("entities")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((q) => q.eq(q.field("properties.email"), identity.email))
      .first();

    if (!creator) {
      throw new Error("Creator not found");
    }

    // 2. VALIDATE PAGE
    const page = await ctx.db.get(args.pageId);
    if (!page || !["page", "landing_page", "blog_post"].includes(page.type)) {
      throw new Error("Page not found");
    }

    // Get website
    const websiteConnection = await ctx.db
      .query("connections")
      .withIndex("to_type", (q) =>
        q.eq("toEntityId", args.pageId).eq("relationshipType", "contains")
      )
      .first();

    if (!websiteConnection) {
      throw new Error("Page is not connected to a website");
    }

    const website = await ctx.db.get(websiteConnection.fromEntityId);
    if (!website || website.type !== "website") {
      throw new Error("Parent website not found");
    }

    // Verify ownership
    const ownership = await ctx.db
      .query("connections")
      .withIndex("from_type", (q) =>
        q.eq("fromEntityId", creator._id).eq("relationshipType", "owns")
      )
      .filter((q) => q.eq(q.field("toEntityId"), website._id))
      .first();

    if (!ownership) {
      throw new Error("You do not own this page's website");
    }

    // 3. CHECK GROUP LIMITS
    if (!website.groupId) {
      throw new Error("Website has no group assigned");
    }

    const group = await ctx.db.get(website.groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    if (group.usage.aiMessages >= group.limits.aiMessages) {
      throw new Error("AI message limit reached. Please upgrade your plan.");
    }

    // 4. MODIFY PAGE CODE (Placeholder - will be replaced with actual AI call)
    // TODO: Replace with actual OpenAI/Anthropic API call
    const previousCode = page.properties.code || "";
    const modifiedCode = `${previousCode}\n<!-- Modified: ${args.prompt} -->`;
    const tokensUsed = 300; // Placeholder
    const model = "gpt-4o"; // Placeholder

    // 5. UPDATE PAGE
    const now = Date.now();
    await ctx.db.patch(args.pageId, {
      properties: {
        ...page.properties,
        code: modifiedCode,
        compiledHtml: modifiedCode,
        lastModified: now,
        lastModificationPrompt: args.prompt,
        modificationHistory: [
          ...(page.properties.modificationHistory || []),
          {
            prompt: args.prompt,
            timestamp: now,
            tokensUsed: tokensUsed,
            model: model,
          },
        ],
      },
      updatedAt: now,
    });

    // 6. CREATE CONNECTION (ai_assistant → page modification)
    await ctx.db.insert("connections", {
      fromEntityId: creator._id, // Using creator as AI actor placeholder
      toEntityId: args.pageId,
      relationshipType: "modified",
      metadata: {
        prompt: args.prompt,
        tokensUsed: tokensUsed,
        model: model,
        action: args.context?.action || "modify",
        section: args.context?.section,
      },
      createdAt: now,
    });

    // 7. UPDATE GROUP USAGE
    await ctx.db.patch(website.groupId, {
      usage: {
        ...group.usage,
        aiMessages: group.usage.aiMessages + 1,
      },
      updatedAt: now,
    });

    // 8. LOG EVENT
    await ctx.db.insert("events", {
      type: "page_modified",
      actorId: creator._id,
      targetId: args.pageId,
      timestamp: now,
      metadata: {
        websiteId: website._id,
        prompt: args.prompt,
        tokensUsed: tokensUsed,
        model: model,
        action: args.context?.action || "modify",
        section: args.context?.section,
      },
    });

    return {
      pageId: args.pageId,
      tokensUsed,
      model,
      previousVersion: previousCode.length,
      newVersion: modifiedCode.length,
    };
  },
});
