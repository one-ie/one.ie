/**
 * Workspace & Team Management Mutations
 *
 * Wave 1 Creator Onboarding: Workspace creation, team invitations, wallet
 * Infer 21-25: Workspace, team, wallet operations
 */

import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { EVENT_TYPES } from "../types/ontology";
import {
  validateWorkspaceName,
  validateWorkspaceSlug,
  validateEthereumAddress,
  generateInvitationToken,
  onboardingService,
} from "../services/onboardingService";

// ============================================================================
// Infer 21: Create Workspace Mutation
// Creator creates their main workspace (replaces temporary one)
// ============================================================================

export const createWorkspace = mutation({
  args: {
    userId: v.id("entities"),
    name: v.string(),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. GET USER
    const user = await ctx.db.get(args.userId);
    if (!user || user.type !== "user") {
      return {
        success: false,
        error: "User not found",
      };
    }

    // 2. VALIDATE WORKSPACE NAME
    const nameCheck = onboardingService.validateWorkspaceName(args.name);
    if (!nameCheck.valid) {
      return {
        success: false,
        errors: { name: nameCheck.error || "Invalid workspace name" },
      };
    }

    // 3. GENERATE OR VALIDATE SLUG
    let slug = args.slug || args.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    slug = slug.replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens

    const slugCheck = onboardingService.validateWorkspaceSlug(slug);
    if (!slugCheck.valid) {
      return {
        success: false,
        errors: { slug: slugCheck.error || "Invalid slug" },
      };
    }

    // 4. CHECK IF SLUG ALREADY EXISTS
    const existingGroup = await ctx.db
      .query("groups")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    if (existingGroup) {
      return {
        success: false,
        errors: { slug: "This workspace slug is already taken" },
      };
    }

    // 5. CREATE NEW WORKSPACE GROUP
    const workspaceId = await ctx.db.insert("groups", {
      slug,
      name: args.name,
      type: "organization",
      description: args.description || `${user.properties.displayName}'s workspace`,
      metadata: {
        creatorId: args.userId,
        creatorEmail: user.properties.email,
      },
      settings: {
        visibility: "private",
        joinPolicy: "invite_only",
        plan: "starter",
        limits: {
          users: 10,
          storage: 5, // 5 GB
          apiCalls: 10000,
        },
      },
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // 6. CREATE WORKSPACE ENTITY (thing type: organization)
    const workspaceEntityId = await ctx.db.insert("entities", {
      groupId: workspaceId,
      type: "organization",
      name: args.name,
      properties: {
        slug,
        description: args.description || "",
        creatorId: args.userId,
        memberCount: 1,
        plan: "starter",
      },
      status: "active",
      schemaVersion: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // 7. CREATE "OWNS" CONNECTION (creator owns workspace)
    await ctx.db.insert("connections", {
      groupId: workspaceId,
      fromEntityId: args.userId,
      toEntityId: workspaceEntityId,
      relationshipType: "created_by",
      metadata: {
        role: "owner",
        joinedAt: Date.now(),
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // 8. CREATE "MEMBER_OF" CONNECTION (creator is member of workspace)
    // This would be a new connection type we need in the ontology
    // For now, use a generic connection
    await ctx.db.insert("connections", {
      groupId: workspaceId,
      fromEntityId: args.userId,
      toEntityId: workspaceEntityId,
      relationshipType: "updated_by", // Temporary until "member_of" is added
      metadata: {
        role: "owner",
        joinedAt: Date.now(),
        isActive: true,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // 9. UPDATE USER WITH WORKSPACE INFO
    await ctx.db.patch(args.userId, {
      properties: {
        ...user.properties,
        workspaceId,
        workspaces: [...(user.properties.workspaces || []), workspaceId],
        onboardingStep: "team",
      },
      updatedAt: Date.now(),
    });

    // 10. LOG WORKSPACE CREATION EVENT
    await ctx.db.insert("events", {
      groupId: workspaceId,
      type: "thing_created",
      actorId: args.userId,
      targetId: workspaceEntityId,
      timestamp: Date.now(),
      metadata: {
        entityType: "organization",
        step: "workspace",
        workspaceName: args.name,
        workspaceSlug: slug,
      },
    });

    return {
      success: true,
      data: {
        workspaceId,
        workspaceEntityId,
        slug,
        name: args.name,
        message: `Workspace "${args.name}" created successfully!`,
      },
    };
  },
});

// ============================================================================
// Infer 22: Invite Team Member Mutation
// Send invitation token to email for team collaboration
// ============================================================================

export const inviteTeamMember = mutation({
  args: {
    userId: v.id("entities"),
    workspaceId: v.id("groups"),
    invitedEmail: v.string(),
    role: v.union(v.literal("editor"), v.literal("viewer")),
  },
  handler: async (ctx, args) => {
    // 1. GET INVITER USER
    const inviter = await ctx.db.get(args.userId);
    if (!inviter || inviter.type !== "user") {
      return {
        success: false,
        error: "User not found",
      };
    }

    // 2. GET WORKSPACE
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) {
      return {
        success: false,
        error: "Workspace not found",
      };
    }

    // 3. CHECK AUTHORIZATION (only workspace owner can invite)
    if (
      workspace.metadata?.creatorId !== args.userId &&
      inviter.properties.role !== "owner"
    ) {
      return {
        success: false,
        error: "You do not have permission to invite team members",
      };
    }

    // 4. CHECK IF ALREADY MEMBER
    const existingMember = await ctx.db
      .query("entities")
      .withIndex("group_type", (q) =>
        q.eq("groupId", args.workspaceId).eq("type", "user")
      )
      .filter((q) => q.eq(q.field("properties.email"), args.invitedEmail))
      .first();

    if (existingMember) {
      return {
        success: false,
        error: "This person is already a team member",
      };
    }

    // 5. CHECK TEAM SIZE LIMITS
    const memberCount = await ctx.db
      .query("entities")
      .withIndex("group_type", (q) =>
        q.eq("groupId", args.workspaceId).eq("type", "user")
      )
      .collect();

    if (
      workspace.settings.limits &&
      memberCount.length >= workspace.settings.limits.users
    ) {
      return {
        success: false,
        error: "Team member limit reached for your plan",
      };
    }

    // 6. GENERATE INVITATION TOKEN
    const token = onboardingService.generateInvitationToken();
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

    // 7. CREATE INVITATION TOKEN RECORD
    const invitationId = await ctx.db.insert("invitationTokens", {
      groupId: args.workspaceId,
      token,
      invitedBy: args.userId,
      invitedEmail: args.invitedEmail,
      role: args.role,
      status: "pending",
      expiresAt,
      metadata: {
        workspaceName: workspace.name,
      },
      createdAt: Date.now(),
    });

    // 8. LOG INVITATION EVENT
    await ctx.db.insert("events", {
      groupId: args.workspaceId,
      type: "thing_updated",
      actorId: args.userId,
      targetId: undefined, // No specific target entity for invitation event
      timestamp: Date.now(),
      metadata: {
        entityType: "invitation",
        step: "team",
        invitedEmail: args.invitedEmail,
        role: args.role,
        invitationId,
        action: "team_member_invited",
      },
    });

    // 9. TODO: SEND INVITATION EMAIL
    // await sendTeamInvitationEmail(
    //   args.invitedEmail,
    //   token,
    //   workspace.name,
    //   inviter.properties.displayName
    // )

    return {
      success: true,
      data: {
        invitationId,
        token,
        invitedEmail: args.invitedEmail,
        message: `Invitation sent to ${args.invitedEmail}`,
      },
    };
  },
});

// ============================================================================
// Infer 23: Accept Invitation Mutation
// Recipient accepts invitation and joins workspace
// ============================================================================

export const acceptInvitation = mutation({
  args: {
    token: v.string(),
    acceptingUserEmail: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. FIND INVITATION TOKEN
    const invitation = await ctx.db
      .query("invitationTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!invitation) {
      return {
        success: false,
        error: "Invitation not found",
      };
    }

    // 2. CHECK IF EXPIRED
    if (invitation.expiresAt < Date.now()) {
      // Mark as expired
      await ctx.db.patch(invitation._id, {
        status: "expired",
      });

      return {
        success: false,
        error: "Invitation has expired",
      };
    }

    // 3. CHECK IF ALREADY ACCEPTED
    if (invitation.status !== "pending") {
      return {
        success: false,
        error: "This invitation has already been used",
      };
    }

    // 4. GET OR CREATE USER (simplified - would use Better Auth)
    let user = await ctx.db
      .query("entities")
      .withIndex("by_type", (q) => q.eq("type", "user"))
      .filter((q) => q.eq(q.field("properties.email"), args.acceptingUserEmail))
      .first();

    const workspaceId = invitation.groupId;

    let userId: any;
    if (!user) {
      // Create new user for this workspace
      userId = await ctx.db.insert("entities", {
        groupId: workspaceId,
        type: "user",
        name: args.acceptingUserEmail.split("@")[0],
        properties: {
          email: args.acceptingUserEmail,
          displayName: args.acceptingUserEmail.split("@")[0],
          role: invitation.role,
          emailVerified: false,
          onboardingStep: "workspace",
          onboardingCompleted: false,
        },
        status: "active",
        schemaVersion: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      // Fetch the created user
      const createdUser = await ctx.db.get(userId);
      if (createdUser && "groupId" in createdUser && "schemaVersion" in createdUser) {
        user = createdUser as any;
      }
    } else {
      // Update existing user's role in this workspace
      const currentRoles = user.properties.roles || {};
      currentRoles[workspaceId] = invitation.role;
      const userSchemaVersion = user.schemaVersion || 1;

      await ctx.db.patch(user._id, {
        properties: {
          ...user.properties,
          roles: currentRoles,
        },
        schemaVersion: userSchemaVersion,
        updatedAt: Date.now(),
      });
      userId = user._id;
    }

    if (!user) {
      return {
        success: false,
        error: "Failed to create or fetch user",
      };
    }

    // 5. MARK INVITATION AS ACCEPTED
    await ctx.db.patch(invitation._id, {
      status: "accepted",
      acceptedAt: Date.now(),
      acceptedBy: user._id,
    });

    // 6. CREATE CONNECTION (user member of workspace)
    // Get the workspace entity (skip if not found)
    const workspaceEntity = await ctx.db
      .query("entities")
      .withIndex("group_type", (q) =>
        q.eq("groupId", workspaceId).eq("type", "organization")
      )
      .first();

    if (workspaceEntity) {
      await ctx.db.insert("connections", {
        groupId: workspaceId,
        fromEntityId: user._id,
        toEntityId: workspaceEntity._id,
        relationshipType: "updated_by", // Temporary until "member_of" added
        metadata: {
          role: invitation.role,
          joinedAt: Date.now(),
          invitationAccepted: true,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    // 7. LOG ACCEPTANCE EVENT
    await ctx.db.insert("events", {
      groupId: workspaceId,
      type: "thing_updated",
      actorId: user._id,
      targetId: user._id,
      timestamp: Date.now(),
      metadata: {
        entityType: "user",
        step: "team",
        action: "invitation_accepted",
        invitationId: invitation._id,
      },
    });

    return {
      success: true,
      data: {
        userId: user._id,
        workspaceId,
        role: invitation.role,
        message: "Welcome to the team!",
      },
    };
  },
});

// ============================================================================
// Infer 24: Connect Wallet Mutation
// Creator connects blockchain wallet (MetaMask, WalletConnect, etc.)
// ============================================================================

export const connectWallet = mutation({
  args: {
    userId: v.id("entities"),
    walletAddress: v.string(),
    chainId: v.optional(v.number()),
    walletType: v.union(
      v.literal("metamask"),
      v.literal("walletconnect"),
      v.literal("rainbowkit"),
      v.literal("other")
    ),
  },
  handler: async (ctx, args) => {
    // 1. GET USER
    const user = await ctx.db.get(args.userId);
    if (!user || user.type !== "user") {
      return {
        success: false,
        error: "User not found",
      };
    }

    // 2. VALIDATE ETHEREUM ADDRESS
    const addressCheck = onboardingService.validateEthereumAddress(
      args.walletAddress
    );
    if (!addressCheck.valid) {
      return {
        success: false,
        error: addressCheck.error || "Invalid wallet address",
      };
    }

    // 3. NORMALIZE ADDRESS (to lowercase)
    const normalizedAddress = args.walletAddress.toLowerCase();

    // 4. CHECK IF ALREADY CONNECTED
    const existing = await ctx.db
      .query("walletConnections")
      .withIndex("by_address", (q) => q.eq("walletAddress", normalizedAddress))
      .first();

    if (existing && existing.creatorId !== args.userId) {
      return {
        success: false,
        error: "This wallet is already connected to another account",
      };
    }

    // 5. CREATE WALLET CONNECTION RECORD (not verified yet)
    const walletId = await ctx.db.insert("walletConnections", {
      groupId: user.groupId,
      creatorId: args.userId,
      walletAddress: normalizedAddress,
      chainId: args.chainId || 1, // Default to Ethereum mainnet
      walletType: args.walletType,
      verified: false,
      metadata: {
        connectedAt: Date.now(),
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // 6. UPDATE USER WITH WALLET ADDRESS
    const userSchemaVersion = user.schemaVersion || 1;
    await ctx.db.patch(args.userId, {
      properties: {
        ...user.properties,
        walletAddress: normalizedAddress,
        onboardingStep: "skills",
      },
      schemaVersion: userSchemaVersion,
      updatedAt: Date.now(),
    });

    // 7. LOG WALLET CONNECTION EVENT
    await ctx.db.insert("events", {
      groupId: user.groupId,
      type: "thing_updated",
      actorId: args.userId,
      targetId: args.userId,
      timestamp: Date.now(),
      metadata: {
        entityType: "user",
        step: "wallet",
        action: "wallet_connected",
        walletType: args.walletType,
        chainId: args.chainId || 1,
      },
    });

    return {
      success: true,
      data: {
        walletId,
        walletAddress: normalizedAddress,
        verified: false,
        message:
          "Wallet connected! Please verify with your wallet provider.",
      },
    };
  },
});

// ============================================================================
// Infer 25: Add Skills Mutation
// Creator adds expertise/skills with knowledge linking
// ============================================================================

export const addSkills = mutation({
  args: {
    userId: v.id("entities"),
    skills: v.array(v.string()),
    category: v.optional(v.string()), // e.g., "technical", "design", "marketing"
  },
  handler: async (ctx, args) => {
    // 1. GET USER
    const user = await ctx.db.get(args.userId);
    if (!user || user.type !== "user") {
      return {
        success: false,
        error: "User not found",
      };
    }

    // 2. VALIDATE SKILLS
    if (!args.skills || args.skills.length === 0) {
      return {
        success: false,
        error: "At least one skill required",
      };
    }

    if (args.skills.length > 50) {
      return {
        success: false,
        error: "Maximum 50 skills allowed",
      };
    }

    // 3. CREATE KNOWLEDGE ITEMS FOR EACH SKILL
    const createdSkillIds: string[] = [];

    for (const skill of args.skills) {
      // Skip empty skills
      if (!skill.trim()) continue;

      // Create knowledge label for skill
      const knowledgeId = await ctx.db.insert("knowledge", {
        groupId: user.groupId,
        knowledgeType: "label",
        text: skill.trim(),
        labels: ["expertise", "creator-skill", args.category || "general"],
        metadata: {
          type: "skill",
          category: args.category || "general",
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Link skill to user
      await ctx.db.insert("thingKnowledge", {
        thingId: args.userId,
        knowledgeId,
        role: "label",
        metadata: {
          type: "skill",
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      createdSkillIds.push(knowledgeId);
    }

    // 4. UPDATE USER WITH EXPERTISE
    const currentExpertise = user.properties.expertise || [];
    const newExpertise = Array.from(
      new Set([...currentExpertise, ...args.skills])
    );
    const userSchemaVersion = user.schemaVersion || 1;

    await ctx.db.patch(args.userId, {
      properties: {
        ...user.properties,
        expertise: newExpertise,
        onboardingStep: "complete",
        onboardingCompleted: true,
        onboardingCompletedAt: Date.now(),
      },
      schemaVersion: userSchemaVersion,
      updatedAt: Date.now(),
    });

    // 5. LOG SKILLS UPDATE EVENT
    await ctx.db.insert("events", {
      groupId: user.groupId,
      type: "thing_updated",
      actorId: args.userId,
      targetId: args.userId,
      timestamp: Date.now(),
      metadata: {
        entityType: "user",
        step: "skills",
        action: "skills_added",
        skillsCount: args.skills.length,
        category: args.category,
      },
    });

    return {
      success: true,
      data: {
        userId: args.userId,
        skillsAdded: args.skills.length,
        expertise: newExpertise,
        onboardingCompleted: true,
        message:
          "Skills added and onboarding completed! Welcome to ONE.",
      },
    };
  },
});
