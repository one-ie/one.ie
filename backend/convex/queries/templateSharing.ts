/**
 * Template Sharing Queries
 *
 * Cycle 59: Query shared templates with multi-tenant filtering
 */

import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Get templates shared by current user
 */
export const getMySharedTemplates = query({
  args: {
    visibility: v.optional(
      v.union(v.literal("private"), v.literal("team"), v.literal("public"))
    ),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // 2. Get current user
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.eq(t.field("properties").email, identity.email))
      .first();

    if (!person || !person.groupId) return [];

    // 3. Get templates in user's group
    const templates = await ctx.db
      .query("things")
      .withIndex("by_group_type", (q) =>
        q.eq("groupId", person.groupId).eq("type", "funnel_template")
      )
      .collect();

    // 4. Filter by visibility if specified
    let filtered = templates;
    if (args.visibility) {
      filtered = templates.filter(
        (t) => t.properties?.visibility === args.visibility
      );
    }

    // 5. Get share connections for each template
    const templatesWithShares = await Promise.all(
      filtered.map(async (template) => {
        const shares = await ctx.db
          .query("connections")
          .withIndex("to_type", (q) =>
            q
              .eq("toThingId", template._id)
              .eq("relationshipType", "shared_template")
          )
          .filter((c) => !c.validTo) // Only active shares
          .collect();

        return {
          ...template,
          shareCount: shares.length,
          shares: shares.map((s) => ({
            sharedAt: s.metadata?.sharedAt,
            visibility: s.metadata?.visibility,
            permission: s.metadata?.permission,
          })),
        };
      })
    );

    return templatesWithShares;
  },
});

/**
 * Get templates shared with current user (from others)
 */
export const getSharedWithMe = query({
  args: {},
  handler: async (ctx) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // 2. Get current user
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.eq(t.field("properties").email, identity.email))
      .first();

    if (!person || !person.groupId) return [];

    // 3. Get team templates (templates in same group by other users)
    const teamTemplates = await ctx.db
      .query("things")
      .withIndex("by_group_type", (q) =>
        q.eq("groupId", person.groupId).eq("type", "funnel_template")
      )
      .filter((t) => t.properties?.visibility === "team")
      .collect();

    // 4. Get public templates (from any group)
    const publicTemplates = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "funnel_template"))
      .filter((t) => t.properties?.visibility === "public")
      .take(100); // Limit public templates

    // 5. Combine and deduplicate
    const allTemplates = [...teamTemplates, ...publicTemplates];
    const uniqueTemplates = Array.from(
      new Map(allTemplates.map((t) => [t._id, t])).values()
    );

    // 6. Enrich with share metadata
    const enriched = uniqueTemplates.map((template) => ({
      ...template,
      isOwner: template.groupId === person.groupId,
      canDuplicate: template.properties?.sharePermission === "duplicate",
      sharedBy:
        template.groupId === person.groupId ? "Your team" : "Community",
    }));

    return enriched;
  },
});

/**
 * Get template by ID with share permissions check
 */
export const getTemplate = query({
  args: {
    templateId: v.id("things"),
  },
  handler: async (ctx, args) => {
    // 1. Get template
    const template = await ctx.db.get(args.templateId);
    if (!template) return null;

    // 2. Check authentication
    const identity = await ctx.auth.getUserIdentity();

    // 3. Public templates are always accessible
    if (template.properties?.visibility === "public") {
      return {
        ...template,
        canView: true,
        canDuplicate: template.properties?.sharePermission === "duplicate",
        canEdit: false,
      };
    }

    // 4. Require auth for private/team templates
    if (!identity) return null;

    // 5. Get current user
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.eq(t.field("properties").email, identity.email))
      .first();

    if (!person) return null;

    // 6. Check permissions
    const isOwner = template.groupId === person.groupId;
    const isTeamMember =
      template.properties?.visibility === "team" &&
      template.groupId === person.groupId;

    if (!isOwner && !isTeamMember) {
      return null; // No access
    }

    return {
      ...template,
      canView: true,
      canDuplicate:
        isOwner || template.properties?.sharePermission === "duplicate",
      canEdit: isOwner,
    };
  },
});

/**
 * Get share analytics for a template
 */
export const getShareAnalytics = query({
  args: {
    templateId: v.id("things"),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    // 2. Get current user
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.eq(t.field("properties").email, identity.email))
      .first();

    if (!person || !person.groupId) return null;

    // 3. Get template and verify ownership
    const template = await ctx.db.get(args.templateId);
    if (!template || template.groupId !== person.groupId) {
      return null;
    }

    // 4. Get all share events
    const shareEvents = await ctx.db
      .query("events")
      .withIndex("by_target", (q) =>
        q.eq("targetId", args.templateId).eq("type", "template_shared")
      )
      .collect();

    // 5. Get duplication events
    const duplicationEvents = await ctx.db
      .query("events")
      .withIndex("by_type", (q) => q.eq("type", "template_duplicated"))
      .filter((e) => e.metadata?.originalTemplateId === args.templateId)
      .collect();

    // 6. Get active shares
    const activeShares = await ctx.db
      .query("connections")
      .withIndex("to_type", (q) =>
        q
          .eq("toThingId", args.templateId)
          .eq("relationshipType", "shared_template")
      )
      .filter((c) => !c.validTo) // Only active
      .collect();

    return {
      templateId: args.templateId,
      templateName: template.name,
      currentVisibility: template.properties?.visibility || "private",
      currentPermission: template.properties?.sharePermission || "view",
      totalShares: shareEvents.length,
      activeshares: activeShares.length,
      totalDuplications: duplicationEvents.length,
      lastSharedAt: template.properties?.lastSharedAt,
      shareHistory: shareEvents.map((e) => ({
        timestamp: e.timestamp,
        visibility: e.metadata?.visibility,
        permission: e.metadata?.permission,
      })),
      duplications: duplicationEvents.map((e) => ({
        timestamp: e.timestamp,
        duplicatedBy: e.actorId,
      })),
    };
  },
});

/**
 * Check if current user can access a template
 */
export const canAccessTemplate = query({
  args: {
    templateId: v.id("things"),
  },
  handler: async (ctx, args) => {
    // 1. Get template
    const template = await ctx.db.get(args.templateId);
    if (!template) {
      return { canAccess: false, reason: "Template not found" };
    }

    // 2. Public templates are always accessible
    if (template.properties?.visibility === "public") {
      return {
        canAccess: true,
        canView: true,
        canDuplicate: template.properties?.sharePermission === "duplicate",
        canEdit: false,
      };
    }

    // 3. Check authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { canAccess: false, reason: "Authentication required" };
    }

    // 4. Get current user
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.eq(t.field("properties").email, identity.email))
      .first();

    if (!person) {
      return { canAccess: false, reason: "User not found" };
    }

    // 5. Check ownership
    const isOwner = template.groupId === person.groupId;
    if (isOwner) {
      return {
        canAccess: true,
        canView: true,
        canDuplicate: true,
        canEdit: true,
        reason: "Owner",
      };
    }

    // 6. Check team access
    if (
      template.properties?.visibility === "team" &&
      template.groupId === person.groupId
    ) {
      return {
        canAccess: true,
        canView: true,
        canDuplicate: template.properties?.sharePermission === "duplicate",
        canEdit: false,
        reason: "Team member",
      };
    }

    // 7. No access
    return {
      canAccess: false,
      reason: "Not authorized",
    };
  },
});
