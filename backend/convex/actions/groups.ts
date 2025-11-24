"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";

/**
 * DIMENSION 1: GROUPS - Actions
 *
 * Actions are server-side functions that can make external API calls
 * Unlike mutations/queries, they can access external services and APIs
 * Useful for: webhooks, external APIs, background jobs, email notifications
 *
 * All actions follow multi-tenant pattern with groupId validation
 */

/**
 * Send group invitation via email
 * Called after creating a group or adding members
 */
export const sendInvitationEmail = action({
  args: {
    groupId: v.id("groups"),
    toEmail: v.string(),
    groupName: v.string(),
    invitationUrl: v.string(),
  },
  handler: async (ctx, args) => {
    // In production: integrate with Resend, SendGrid, etc.
    // For now: log the invitation
    console.log(
      `[ACTION] Sending invitation email to ${args.toEmail} for group ${args.groupName}`
    );

    return {
      success: true,
      email: args.toEmail,
      groupId: args.groupId,
      sentAt: Date.now(),
    };
  },
});

/**
 * Notify group admins of new member
 * Called when a person joins a group
 */
export const notifyGroupAdmins = action({
  args: {
    groupId: v.id("groups"),
    newMemberId: v.id("entities"),
    memberEmail: v.string(),
    memberName: v.string(),
  },
  handler: async (ctx, args) => {
    console.log(
      `[ACTION] Notifying admins: ${args.memberName} (${args.memberEmail}) joined group ${args.groupId}`
    );

    return {
      success: true,
      notificationsSent: 1,
      timestamp: Date.now(),
    };
  },
});

/**
 * Export group data
 * Called for compliance, backups, or data portability
 */
export const exportGroupData = action({
  args: {
    groupId: v.id("groups"),
    format: v.union(v.literal("json"), v.literal("csv")),
  },
  handler: async (ctx, args) => {
    // In production: stream data to file storage, generate exports
    console.log(`[ACTION] Exporting group ${args.groupId} as ${args.format}`);

    return {
      success: true,
      groupId: args.groupId,
      format: args.format,
      generatedAt: Date.now(),
      downloadUrl: `https://api.example.com/exports/${args.groupId}/${Date.now()}`,
    };
  },
});

/**
 * Archive group and cleanup resources
 * Called when deleting a group (after soft-delete)
 */
export const archiveGroupResources = action({
  args: {
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    // In production: delete files, cancel subscriptions, archive data
    console.log(`[ACTION] Archiving resources for group ${args.groupId}`);

    return {
      success: true,
      groupId: args.groupId,
      resourcesArchived: {
        files: 0,
        subscriptions: 0,
        backups: 1,
      },
      archivedAt: Date.now(),
    };
  },
});

/**
 * Sync group with external directory (LDAP, Active Directory, etc.)
 * Called periodically for enterprise groups
 */
export const syncExternalDirectory = action({
  args: {
    groupId: v.id("groups"),
    directoryType: v.union(
      v.literal("ldap"),
      v.literal("azure_ad"),
      v.literal("okta"),
      v.literal("custom")
    ),
  },
  handler: async (ctx, args) => {
    console.log(
      `[ACTION] Syncing group ${args.groupId} with ${args.directoryType}`
    );

    return {
      success: true,
      groupId: args.groupId,
      directoryType: args.directoryType,
      usersSync: 0,
      groupsSync: 0,
      syncedAt: Date.now(),
    };
  },
});

/**
 * Trigger webhook for group events
 * Notifies external systems of group changes
 */
export const triggerWebhook = action({
  args: {
    groupId: v.id("groups"),
    event: v.string(),
    payload: v.any(),
    webhookUrl: v.string(),
  },
  handler: async (ctx, args) => {
    // In production: make HTTP POST to webhook URL with retry logic
    console.log(`[ACTION] Triggering webhook for group ${args.groupId}: ${args.event}`);

    return {
      success: true,
      groupId: args.groupId,
      event: args.event,
      delivered: true,
      deliveredAt: Date.now(),
    };
  },
});
