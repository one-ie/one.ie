/**
 * Onboarding Queries (Read Operations)
 *
 * Wave 1 Creator Onboarding: Fetch user, workspace, team, and status
 * Infer 26: All read operations for onboarding workflow
 */

import { query } from "../_generated/server";
import { v } from "convex/values";

// ============================================================================
// Get Current User (Creator)
// ============================================================================

export const getCurrentUser = query({
  args: {
    userId: v.id("entities"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user || user.type !== "user") {
      return null;
    }

    return {
      id: user._id,
      email: user.properties.email,
      displayName: user.properties.displayName,
      username: user.properties.username,
      bio: user.properties.bio,
      avatar: user.properties.avatar,
      niche: user.properties.niche || [],
      expertise: user.properties.expertise || [],
      interests: user.properties.interests || [],
      emailVerified: user.properties.emailVerified,
      emailVerifiedAt: user.properties.emailVerifiedAt,
      role: user.properties.role || "owner",
      walletAddress: user.properties.walletAddress,
      walletVerified: user.properties.walletVerified || false,
      walletConnectedAt: user.properties.walletConnectedAt,
      onboardingStep: user.properties.onboardingStep,
      onboardingCompleted: user.properties.onboardingCompleted,
      onboardingCompletedAt: user.properties.onboardingCompletedAt,
      agreeToTerms: user.properties.agreeToTerms,
      agreeToPrivacy: user.properties.agreeToPrivacy,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },
});

// ============================================================================
// Get Onboarding Status with Progress
// ============================================================================

export const getOnboardingStatus = query({
  args: {
    userId: v.id("entities"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user || user.type !== "user") {
      return null;
    }

    const step = user.properties.onboardingStep || "email_verification";
    const steps = [
      "email_verification",
      "profile",
      "workspace",
      "team",
      "wallet",
      "skills",
      "complete",
    ];
    const stepIndex = steps.indexOf(step);
    const progress = Math.round(((stepIndex + 1) / steps.length) * 100);

    return {
      userId: user._id,
      currentStep: step,
      completed: user.properties.onboardingCompleted || false,
      completionDate: user.properties.onboardingCompletedAt,
      progress,
      steps: {
        emailVerified: user.properties.emailVerified || false,
        profileComplete: !!user.properties.username,
        workspaceCreated: !!user.properties.workspaceId,
        teamInvited: false, // Would check for team members
        walletConnected: !!user.properties.walletAddress,
        skillsAdded: (user.properties.expertise || []).length > 0,
      },
    };
  },
});

// ============================================================================
// Check Username Availability
// ============================================================================

export const checkUsernameAvailable = query({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("entities")
      .filter((q) =>
        q.and(
          q.eq(q.field("type"), "user"),
          q.eq(q.field("properties.username"), args.username)
        )
      )
      .first();

    return {
      username: args.username,
      available: !existing,
    };
  },
});

// ============================================================================
// Check Email Registered
// ============================================================================

export const checkEmailExists = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("entities")
      .filter((q) =>
        q.and(
          q.eq(q.field("type"), "user"),
          q.eq(q.field("properties.email"), args.email)
        )
      )
      .first();

    return {
      email: args.email,
      exists: !!existing,
      userId: existing?._id,
    };
  },
});

// ============================================================================
// Get Workspace with Members
// ============================================================================

export const getWorkspace = query({
  args: {
    workspaceId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    const workspace = await ctx.db.get(args.workspaceId);

    if (!workspace || !("slug" in workspace)) {
      return null;
    }

    const ws = workspace as any;

    // Count members
    const members = await ctx.db
      .query("entities")
      .filter((q) =>
        q.and(
          q.eq(q.field("groupId"), args.workspaceId),
          q.eq(q.field("type"), "user")
        )
      )
      .collect();

    return {
      id: args.workspaceId,
      slug: ws.slug || "",
      name: ws.name,
      description: ws.description || "",
      type: ws.type,
      visibility: ws.settings?.visibility || "private",
      joinPolicy: ws.settings?.joinPolicy || "invite_only",
      plan: ws.settings?.plan || "starter",
      memberCount: members.length,
      maxMembers: ws.settings?.limits?.users || 10,
      creatorId: ws.metadata?.creatorId,
      createdAt: ws.createdAt,
      updatedAt: ws.updatedAt,
    };
  },
});

// ============================================================================
// List Workspace Members
// ============================================================================

export const getWorkspaceMembers = query({
  args: {
    workspaceId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query("entities")
      .withIndex("group_type", (q) =>
        q.eq("groupId", args.workspaceId).eq("type", "user")
      )
      .collect();

    return members.map((member) => ({
      id: member._id,
      email: member.properties.email,
      displayName: member.properties.displayName,
      username: member.properties.username,
      avatar: member.properties.avatar,
      role: member.properties.role || "editor",
      joinedAt: member.createdAt,
    }));
  },
});

// ============================================================================
// Get Pending Invitations for Workspace
// ============================================================================

export const getPendingInvitations = query({
  args: {
    workspaceId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    const invitations = await ctx.db
      .query("invitationTokens")
      .withIndex("group_status", (q) =>
        q.eq("groupId", args.workspaceId).eq("status", "pending")
      )
      .collect();

    // Filter out expired ones
    const now = Date.now();
    const active = invitations.filter((inv) => inv.expiresAt > now);

    return active.map((inv) => ({
      id: inv._id,
      invitedEmail: inv.invitedEmail,
      role: inv.role,
      invitedBy: inv.invitedBy,
      createdAt: inv.createdAt,
      expiresAt: inv.expiresAt,
      expiresIn: Math.ceil((inv.expiresAt - now) / (1000 * 60 * 60 * 24)), // Days
    }));
  },
});

// ============================================================================
// Get User's Workspaces
// ============================================================================

export const getUserWorkspaces = query({
  args: {
    userId: v.id("entities"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user || user.type !== "user") {
      return [];
    }

    const workspaceIds = (user.properties.workspaces as Array<any>) || [];

    const workspaces = await Promise.all(
      workspaceIds.map(async (wsId: string) => {
        const ws = await ctx.db.get(wsId as any);
        if (!ws || !("slug" in ws)) return null;

        const wsTyped = ws as any;

        const members = await ctx.db
          .query("entities")
          .filter((q) =>
            q.and(
              q.eq(q.field("groupId"), wsId),
              q.eq(q.field("type"), "user")
            )
          )
          .collect();

        return {
          id: wsId,
          slug: wsTyped.slug || "",
          name: wsTyped.name,
          description: wsTyped.description || "",
          visibility: wsTyped.settings?.visibility || "private",
          plan: wsTyped.settings?.plan || "starter",
          memberCount: members.length,
          createdAt: wsTyped.createdAt,
        };
      })
    );

    return workspaces.filter((ws) => ws !== null);
  },
});

// ============================================================================
// Get Creator Skills/Expertise
// ============================================================================

export const getCreatorSkills = query({
  args: {
    userId: v.id("entities"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user || user.type !== "user") {
      return {
        userId: args.userId,
        expertise: [],
        interests: [],
        niche: [],
        knowledge: [],
      };
    }

    // Get linked knowledge items
    const knowledgeLinks = await ctx.db
      .query("thingKnowledge")
      .withIndex("by_thing", (q) => q.eq("thingId", args.userId))
      .collect();

    const knowledge = await Promise.all(
      knowledgeLinks.map(async (link) => {
        const kb = await ctx.db.get(link.knowledgeId);
        if (!kb) return null;
        return {
          id: kb._id,
          text: (kb as any).text || "",
          labels: ((kb as any).labels as any) || [],
          type: (kb as any).knowledgeType,
          metadata: (kb as any).metadata,
        };
      })
    );

    return {
      userId: args.userId,
      expertise: user.properties.expertise || [],
      interests: user.properties.interests || [],
      niche: user.properties.niche || [],
      knowledge: knowledge.filter((k) => k !== null),
    };
  },
});

// ============================================================================
// Get Wallet Connections
// ============================================================================

export const getWalletConnections = query({
  args: {
    userId: v.id("entities"),
  },
  handler: async (ctx, args) => {
    const wallets = await ctx.db
      .query("walletConnections")
      .withIndex("by_creator", (q) => q.eq("creatorId", args.userId))
      .collect();

    return wallets.map((wallet) => ({
      id: wallet._id,
      address: wallet.walletAddress,
      chainId: wallet.chainId,
      walletType: wallet.walletType,
      verified: wallet.verified,
      verifiedAt: wallet.verifiedAt,
      createdAt: wallet.createdAt,
    }));
  },
});

// ============================================================================
// Check Workspace Slug Availability
// ============================================================================

export const checkWorkspaceSlugAvailable = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("groups")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    return {
      slug: args.slug,
      available: !existing,
    };
  },
});

// ============================================================================
// Get Invitation by Token (for accepting invitations)
// ============================================================================

export const getInvitationByToken = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const invitation = await ctx.db
      .query("invitationTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!invitation) {
      return null;
    }

    // Get workspace info
    const workspace = await ctx.db.get(invitation.groupId);

    // Check if expired
    const isExpired = invitation.expiresAt < Date.now();

    return {
      id: invitation._id,
      workspaceId: invitation.groupId,
      workspaceName: workspace?.name,
      workspaceSlug: workspace?.slug,
      invitedEmail: invitation.invitedEmail,
      role: invitation.role,
      status: invitation.status,
      isExpired,
      expiresAt: invitation.expiresAt,
      createdAt: invitation.createdAt,
    };
  },
});

// ============================================================================
// Get Onboarding Events for Audit Trail
// ============================================================================

export const getOnboardingEvents = query({
  args: {
    userId: v.id("entities"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user || user.type !== "user") {
      return [];
    }

    const events = await ctx.db
      .query("events")
      .withIndex("actor_type", (q) => q.eq("actorId", args.userId))
      .order("desc")
      .take(args.limit || 50);

    return events.map((event) => ({
      id: event._id,
      type: event.type,
      timestamp: event.timestamp,
      metadata: event.metadata,
    }));
  },
});
