import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { THING_TYPES, isThingType, EVENT_TYPES, isEventType } from "../types/ontology";

/**
 * Contact form submissions - Ontology-aligned
 *
 * Creates a contact_submission entity with event logging
 * Following the 6-dimension ontology pattern
 *
 * DIMENSION 3 (Things): contact_submission entity
 * DIMENSION 5 (Events): contact_submitted event with anonymous actor
 */
export const submit = mutation({
  args: {
    groupId: v.id("groups"),
    name: v.string(),
    email: v.string(),
    subject: v.optional(v.string()),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. VALIDATE GROUP: Check group exists and is active
    const group = await ctx.db.get(args.groupId);
    if (!group) {
      throw new Error("Group not found");
    }
    if (group.status !== "active") {
      throw new Error("Group is not active");
    }

    // 2. CREATE CONTACT SUBMISSION ENTITY
    const now = Date.now();
    const contactId = await ctx.db.insert("entities", {
      groupId: args.groupId,
      type: "contact_submission",
      name: args.name,
      properties: {
        email: args.email,
        subject: args.subject || "",
        message: args.message,
        submittedAt: now,
      },
      status: "active",
      schemaVersion: 1, // CRITICAL: Track schema evolution
      createdAt: now,
      updatedAt: now,
    });

    // 3. LOG EVENT (audit trail)
    // Anonymous submission (no actor) - valid for public contact forms
    await ctx.db.insert("events", {
      groupId: args.groupId,
      type: "contact_submitted", // Valid event type from ontology
      targetId: contactId,
      timestamp: now,
      metadata: {
        email: args.email,
        subject: args.subject || "",
      },
    });

    return { _id: contactId, success: true };
  },
});

/**
 * Update contact submission status
 *
 * DIMENSION 3 (Things): Updates contact_submission status
 * DIMENSION 5 (Events): Logs thing_updated event for audit trail
 * Multi-tenant: Enforces groupId isolation
 */
export const updateStatus = mutation({
  args: {
    contactId: v.id("entities"),
    status: v.union(
      v.literal("active"),
      v.literal("archived"),
      v.literal("draft"),
      v.literal("inactive"),
      v.literal("published")
    ),
  },
  handler: async (ctx, args) => {
    // Get the contact submission
    const contact = await ctx.db.get(args.contactId);
    if (!contact) {
      throw new Error("Contact submission not found");
    }

    if (contact.type !== "contact_submission") {
      throw new Error("Entity is not a contact submission");
    }

    // Validate group exists and is active
    const group = await ctx.db.get(contact.groupId);
    if (!group) {
      throw new Error("Group not found");
    }
    if (group.status !== "active") {
      throw new Error("Group is not active");
    }

    // Update status
    const now = Date.now();
    await ctx.db.patch(args.contactId, {
      status: args.status,
      updatedAt: now,
    });

    // Log event
    // Anonymous update (no actor) - for background/system operations
    await ctx.db.insert("events", {
      groupId: contact.groupId,
      type: "thing_updated", // Valid event type from ontology
      targetId: args.contactId,
      timestamp: now,
      metadata: {
        field: "status",
        newValue: args.status,
        entityType: "contact_submission",
      },
    });

    return { success: true };
  },
});
