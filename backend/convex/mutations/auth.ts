/**
 * Authentication & Registration Mutations
 *
 * Wave 1 Creator Onboarding: Email signup, verification, profile
 * Infer 18-20: Core registration flow
 */

import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { EVENT_TYPES } from "../types/ontology";
import {
  validateEmail,
  validateSignupInput,
  generateVerificationCode,
  validateUsername,
  validateDisplayName,
  onboardingService,
} from "../services/onboardingService";

// ============================================================================
// Infer 18: Signup Mutation
// Create user account, send verification email
// ============================================================================

export const signup = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    displayName: v.string(),
    agreeToTerms: v.boolean(),
    agreeToPrivacy: v.boolean(),
  },
  handler: async (ctx, args) => {
    // 1. VALIDATE INPUT
    const validation = onboardingService.validateSignupInput(args);
    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors,
      };
    }

    // 2. CHECK IF EMAIL ALREADY EXISTS (simplified - would use Better Auth in production)
    const existingUser = await ctx.db
      .query("entities")
      .filter((q) =>
        q.and(
          q.eq(q.field("type"), "user"),
          q.eq(q.field("properties.email"), args.email)
        )
      )
      .first();

    if (existingUser) {
      return {
        success: false,
        errors: {
          email: "Email already registered",
        },
      };
    }

    // 3. CREATE TEMPORARY GROUP FOR USER (will be replaced when they create workspace)
    const tempGroupId = await ctx.db.insert("groups", {
      slug: `user-${args.email.split("@")[0]}-${Date.now()}`,
      name: `${args.displayName}'s Workspace`,
      type: "organization",
      description: "Temporary workspace during onboarding",
      metadata: {
        temporary: true,
        ownerEmail: args.email,
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

    // 4. CREATE USER ENTITY
    const creatorId = await ctx.db.insert("entities", {
      groupId: tempGroupId,
      type: "user",
      name: args.displayName,
      properties: {
        email: args.email,
        displayName: args.displayName,
        role: "owner",
        emailVerified: false,
        onboardingStep: "email_verification",
        onboardingCompleted: false,
        agreeToTerms: args.agreeToTerms,
        agreeToPrivacy: args.agreeToPrivacy,
        createdAt: Date.now(),
      },
      status: "active",
      schemaVersion: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // 5. GENERATE AND STORE VERIFICATION CODE
    const verificationCode = onboardingService.generateVerificationCode();
    const codeExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes

    const codeId = await ctx.db.insert("emailVerificationCodes", {
      email: args.email,
      code: verificationCode,
      expiresAt: codeExpiry,
      attempts: 0,
      verified: false,
      createdAt: Date.now(),
    });

    // 6. LOG SIGNUP EVENT
    await ctx.db.insert("events", {
      groupId: tempGroupId,
      type: "thing_created",
      actorId: creatorId,
      targetId: creatorId,
      timestamp: Date.now(),
      metadata: {
        entityType: "user",
        step: "signup",
      },
    });

    // 7. EMAIL SENDING NOTE
    // In production, use Resend Action or email service
    // For now, verification code is stored and can be resent via resendVerificationCode mutation
    console.log(
      `Verification code generated for ${args.email}: ${verificationCode}`
    );

    return {
      success: true,
      data: {
        userId: creatorId,
        groupId: tempGroupId,
        email: args.email,
        verificationCodeId: codeId,
        message:
          "Signup successful! Check your email for verification code.",
      },
    };
  },
});

// ============================================================================
// Infer 19: Email Verification Mutation
// Verify 6-digit code, mark email as verified
// ============================================================================

export const verifyEmail = mutation({
  args: {
    email: v.string(),
    code: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. FIND VERIFICATION CODE
    const verificationRecord = await ctx.db
      .query("emailVerificationCodes")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .order("desc")
      .first();

    if (!verificationRecord) {
      return {
        success: false,
        error: "No verification code found for this email",
      };
    }

    // 2. CHECK IF CODE IS EXPIRED
    if (verificationRecord.expiresAt < Date.now()) {
      return {
        success: false,
        error: "Verification code has expired",
      };
    }

    // 3. CHECK IF CODE MATCHES
    if (verificationRecord.code !== args.code) {
      // Increment attempts
      await ctx.db.patch(verificationRecord._id, {
        attempts: verificationRecord.attempts + 1,
      });

      // Check if too many attempts (rate limit)
      if (verificationRecord.attempts >= 5) {
        return {
          success: false,
          error: "Too many failed attempts. Request a new code.",
        };
      }

      return {
        success: false,
        error: "Incorrect verification code",
      };
    }

    // 4. MARK CODE AS VERIFIED
    await ctx.db.patch(verificationRecord._id, {
      verified: true,
      verifiedAt: Date.now(),
    });

    // 5. FIND USER AND UPDATE EMAIL VERIFICATION STATUS
    const user = await ctx.db
      .query("entities")
      .withIndex("by_type", (q) => q.eq("type", "user"))
      .filter((q) => q.eq(q.field("properties.email"), args.email))
      .first();

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    const userSchemaVersion = user.schemaVersion || 1;
    await ctx.db.patch(user._id, {
      properties: {
        ...user.properties,
        emailVerified: true,
        emailVerifiedAt: Date.now(),
        onboardingStep: "profile",
      },
      schemaVersion: userSchemaVersion,
      updatedAt: Date.now(),
    });

    // 6. LOG EMAIL VERIFICATION EVENT
    await ctx.db.insert("events", {
      groupId: user.groupId,
      type: "thing_updated",
      actorId: user._id,
      targetId: user._id,
      timestamp: Date.now(),
      metadata: {
        entityType: "user",
        step: "email_verification",
        action: "email_verified",
      },
    });

    return {
      success: true,
      data: {
        userId: user._id,
        email: args.email,
        verified: true,
        message:
          "Email verified! Continue to complete your profile.",
      },
    };
  },
});

// ============================================================================
// Infer 20: Update Profile Mutation
// Add profile info: username, bio, avatar, niche, expertise
// ============================================================================

export const updateProfile = mutation({
  args: {
    userId: v.id("entities"),
    username: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatar: v.optional(v.string()),
    niche: v.optional(v.array(v.string())),
    expertise: v.optional(v.array(v.string())),
    interests: v.optional(v.array(v.string())),
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

    // 2. VALIDATE OPTIONAL FIELDS
    const errors: Record<string, string> = {};

    if (args.username) {
      const usernameCheck = onboardingService.validateUsername(args.username);
      if (!usernameCheck.valid) {
        errors.username = usernameCheck.error || "Invalid username";
      } else {
        // Check if username already taken
        const existing = await ctx.db
          .query("entities")
          .withIndex("by_type", (q) => q.eq("type", "user"))
          .filter((q) =>
            q.eq(q.field("properties.username"), args.username)
          )
          .first();

        if (existing && existing._id !== args.userId) {
          errors.username = "Username already taken";
        }
      }
    }

    if (args.bio && args.bio.length > 500) {
      errors.bio = "Bio must be 500 characters or less";
    }

    if (Object.keys(errors).length > 0) {
      return {
        success: false,
        errors,
      };
    }

    // 3. UPDATE USER PROPERTIES
    const updates: Record<string, any> = {};
    if (args.username) updates.username = args.username;
    if (args.bio !== undefined) updates.bio = args.bio;
    if (args.avatar !== undefined) updates.avatar = args.avatar;
    if (args.niche !== undefined) updates.niche = args.niche;
    if (args.expertise !== undefined) updates.expertise = args.expertise;
    if (args.interests !== undefined) updates.interests = args.interests;
    updates.onboardingStep = "workspace";

    const userSchemaVersion = user.schemaVersion || 1;
    await ctx.db.patch(args.userId, {
      properties: {
        ...user.properties,
        ...updates,
      },
      schemaVersion: userSchemaVersion,
      updatedAt: Date.now(),
    });

    // 4. IF NICHE PROVIDED, CREATE KNOWLEDGE LABELS
    if (args.niche && args.niche.length > 0) {
      for (const nicheItem of args.niche) {
        // Create knowledge label
        const knowledgeId = await ctx.db.insert("knowledge", {
          groupId: user.groupId,
          knowledgeType: "label",
          text: nicheItem,
          labels: ["niche", "creator-interest"],
          metadata: { type: "niche" },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });

        // Link to user
        await ctx.db.insert("thingKnowledge", {
          thingId: args.userId,
          knowledgeId,
          role: "label",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
    }

    // 5. LOG UPDATE EVENT
    await ctx.db.insert("events", {
      groupId: user.groupId,
      type: "thing_updated",
      actorId: args.userId,
      targetId: args.userId,
      timestamp: Date.now(),
      metadata: {
        entityType: "user",
        step: "profile",
        fieldsUpdated: Object.keys(updates),
      },
    });

    return {
      success: true,
      data: {
        userId: args.userId,
        message: "Profile updated successfully!",
      },
    };
  },
});

// ============================================================================
// Resend Verification Code Mutation
// ============================================================================

export const resendVerificationCode = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. VALIDATE EMAIL
    if (!validateEmail(args.email)) {
      return {
        success: false,
        error: "Invalid email address",
      };
    }

    // 2. CHECK RATE LIMITING (max 5 codes per hour)
    const recentCodes = await ctx.db
      .query("emailVerificationCodes")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .filter((q) => q.gt(q.field("createdAt"), Date.now() - 60 * 60 * 1000))
      .collect();

    if (recentCodes.length >= 5) {
      return {
        success: false,
        error:
          "Too many verification code requests. Try again in 1 hour.",
      };
    }

    // 3. GENERATE NEW CODE
    const verificationCode = onboardingService.generateVerificationCode();
    const codeExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes

    await ctx.db.insert("emailVerificationCodes", {
      email: args.email,
      code: verificationCode,
      expiresAt: codeExpiry,
      attempts: 0,
      verified: false,
      createdAt: Date.now(),
    });

    // 4. TODO: SEND EMAIL
    // await sendVerificationEmail(args.email, verificationCode)

    return {
      success: true,
      message: "Verification code sent to your email",
    };
  },
});
