/**
 * Template Versions - Mutations
 *
 * Cycle 60: Create and manage template versions.
 *
 * Features:
 * - Create new version from template update
 * - Rollback to previous version
 * - Archive old versions
 * - Version metadata management
 *
 * @see /one/things/plans/clickfunnels-builder-100-cycles.md
 */

import { mutation } from "../_generated/server";
import { v } from "convex/values";

/**
 * Create a new version when template is updated
 */
export const createVersion = mutation({
	args: {
		templateId: v.id("things"),
		changelog: v.string(),
		versionType: v.union(
			v.literal("major"), // Breaking changes (1.0 → 2.0)
			v.literal("minor"), // New features (1.0 → 1.1)
			v.literal("patch")  // Bug fixes (1.0.0 → 1.0.1)
		),
	},
	handler: async (ctx, args) => {
		// 1. Authenticate
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error("Not authenticated");
		}

		// 2. Get user's group
		const person = await ctx.db
			.query("things")
			.withIndex("by_type", (q) => q.eq("type", "creator"))
			.filter((t) => t.properties?.email === identity.email)
			.first();

		if (!person || !person.groupId) {
			throw new Error("User must belong to a group");
		}

		// 3. Get template and verify ownership
		const template = await ctx.db.get(args.templateId);
		if (!template || template.groupId !== person.groupId) {
			throw new Error("Unauthorized");
		}

		// 4. Get latest version to determine next version number
		const versionConnections = await ctx.db
			.query("connections")
			.withIndex("from_type", (q) =>
				q
					.eq("fromThingId", args.templateId)
					.eq("relationshipType", "has_version")
			)
			.collect();

		const versions = await Promise.all(
			versionConnections.map((conn) => ctx.db.get(conn.toThingId))
		);

		const latestVersion = versions
			.filter((v) => v !== null)
			.sort((a, b) => {
				const versionA = parseVersion(a!.properties?.versionNumber || "1.0.0");
				const versionB = parseVersion(b!.properties?.versionNumber || "1.0.0");
				return versionB - versionA;
			})[0];

		// 5. Calculate next version number
		const currentVersion = latestVersion?.properties?.versionNumber || "0.0.0";
		const nextVersion = incrementVersion(currentVersion, args.versionType);

		// 6. Create version snapshot as new thing
		const versionId = await ctx.db.insert("things", {
			type: "template_version",
			name: `${template.name} v${nextVersion}`,
			groupId: person.groupId,
			status: "active",
			properties: {
				...template.properties,
				versionNumber: nextVersion,
				changelog: args.changelog,
				versionType: args.versionType,
				parentTemplateId: args.templateId,
				snapshotDate: Date.now(),
			},
			createdAt: Date.now(),
			updatedAt: Date.now(),
		});

		// 7. Create connection linking version to template
		await ctx.db.insert("connections", {
			fromThingId: args.templateId,
			toThingId: versionId,
			relationshipType: "has_version",
			metadata: {
				versionNumber: nextVersion,
				versionType: args.versionType,
			},
			validFrom: Date.now(),
			createdAt: Date.now(),
		});

		// 8. Log event
		await ctx.db.insert("events", {
			type: "template_version_created",
			actorId: person._id,
			targetId: args.templateId,
			timestamp: Date.now(),
			metadata: {
				versionId,
				versionNumber: nextVersion,
				versionType: args.versionType,
				changelog: args.changelog,
				groupId: person.groupId,
			},
		});

		return {
			versionId,
			versionNumber: nextVersion,
		};
	},
});

/**
 * Rollback template to a previous version
 */
export const rollbackToVersion = mutation({
	args: {
		templateId: v.id("things"),
		versionNumber: v.string(),
	},
	handler: async (ctx, args) => {
		// 1. Authenticate
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error("Not authenticated");
		}

		// 2. Get user's group
		const person = await ctx.db
			.query("things")
			.withIndex("by_type", (q) => q.eq("type", "creator"))
			.filter((t) => t.properties?.email === identity.email)
			.first();

		if (!person || !person.groupId) {
			throw new Error("User must belong to a group");
		}

		// 3. Get template and verify ownership
		const template = await ctx.db.get(args.templateId);
		if (!template || template.groupId !== person.groupId) {
			throw new Error("Unauthorized");
		}

		// 4. Find version to rollback to
		const versionConnections = await ctx.db
			.query("connections")
			.withIndex("from_type", (q) =>
				q
					.eq("fromThingId", args.templateId)
					.eq("relationshipType", "has_version")
			)
			.collect();

		const versions = await Promise.all(
			versionConnections.map((conn) => ctx.db.get(conn.toThingId))
		);

		const targetVersion = versions.find(
			(v) => v?.properties?.versionNumber === args.versionNumber
		);

		if (!targetVersion) {
			throw new Error("Version not found");
		}

		// 5. Create backup of current state before rollback
		const backupId = await ctx.db.insert("things", {
			type: "template_version",
			name: `${template.name} (backup before rollback)`,
			groupId: person.groupId,
			status: "archived",
			properties: {
				...template.properties,
				versionNumber: "backup",
				changelog: `Backup before rollback to v${args.versionNumber}`,
				snapshotDate: Date.now(),
				isBackup: true,
			},
			createdAt: Date.now(),
			updatedAt: Date.now(),
		});

		// 6. Restore properties from target version
		const { versionNumber, changelog, versionType, parentTemplateId, snapshotDate, ...restoreProps } = targetVersion.properties;

		await ctx.db.patch(args.templateId, {
			properties: restoreProps,
			updatedAt: Date.now(),
		});

		// 7. Log event
		await ctx.db.insert("events", {
			type: "template_rolled_back",
			actorId: person._id,
			targetId: args.templateId,
			timestamp: Date.now(),
			metadata: {
				rolledBackTo: args.versionNumber,
				backupId,
				groupId: person.groupId,
			},
		});

		return {
			success: true,
			versionNumber: args.versionNumber,
			backupId,
		};
	},
});

/**
 * Archive old versions (cleanup)
 */
export const archiveVersion = mutation({
	args: {
		versionId: v.id("things"),
	},
	handler: async (ctx, args) => {
		// 1. Authenticate
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error("Not authenticated");
		}

		// 2. Get user's group
		const person = await ctx.db
			.query("things")
			.withIndex("by_type", (q) => q.eq("type", "creator"))
			.filter((t) => t.properties?.email === identity.email)
			.first();

		if (!person || !person.groupId) {
			throw new Error("User must belong to a group");
		}

		// 3. Get version and verify ownership
		const version = await ctx.db.get(args.versionId);
		if (!version || version.groupId !== person.groupId) {
			throw new Error("Unauthorized");
		}

		// 4. Archive version
		await ctx.db.patch(args.versionId, {
			status: "archived",
			updatedAt: Date.now(),
		});

		// 5. Log event
		await ctx.db.insert("events", {
			type: "template_version_archived",
			actorId: person._id,
			targetId: args.versionId,
			timestamp: Date.now(),
			metadata: {
				versionNumber: version.properties?.versionNumber,
				groupId: person.groupId,
			},
		});

		return { success: true };
	},
});

/**
 * Update version metadata (changelog, notes)
 */
export const updateVersionMetadata = mutation({
	args: {
		versionId: v.id("things"),
		changelog: v.optional(v.string()),
		notes: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		// 1. Authenticate
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error("Not authenticated");
		}

		// 2. Get user's group
		const person = await ctx.db
			.query("things")
			.withIndex("by_type", (q) => q.eq("type", "creator"))
			.filter((t) => t.properties?.email === identity.email)
			.first();

		if (!person || !person.groupId) {
			throw new Error("User must belong to a group");
		}

		// 3. Get version and verify ownership
		const version = await ctx.db.get(args.versionId);
		if (!version || version.groupId !== person.groupId) {
			throw new Error("Unauthorized");
		}

		// 4. Update metadata
		await ctx.db.patch(args.versionId, {
			properties: {
				...version.properties,
				...(args.changelog && { changelog: args.changelog }),
				...(args.notes && { notes: args.notes }),
			},
			updatedAt: Date.now(),
		});

		// 5. Log event
		await ctx.db.insert("events", {
			type: "template_version_metadata_updated",
			actorId: person._id,
			targetId: args.versionId,
			timestamp: Date.now(),
			metadata: {
				versionNumber: version.properties?.versionNumber,
				updatedFields: Object.keys(args).filter(k => k !== "versionId"),
				groupId: person.groupId,
			},
		});

		return { success: true };
	},
});

/**
 * Helper: Parse version string to number for comparison
 */
function parseVersion(versionString: string): number {
	const parts = versionString.split(".").map(Number);
	return parts[0] * 1000000 + (parts[1] || 0) * 1000 + (parts[2] || 0);
}

/**
 * Helper: Increment version based on type
 */
function incrementVersion(
	currentVersion: string,
	versionType: "major" | "minor" | "patch"
): string {
	const parts = currentVersion.split(".").map(Number);
	const major = parts[0] || 0;
	const minor = parts[1] || 0;
	const patch = parts[2] || 0;

	switch (versionType) {
		case "major":
			return `${major + 1}.0.0`;
		case "minor":
			return `${major}.${minor + 1}.0`;
		case "patch":
			return `${major}.${minor}.${patch + 1}`;
		default:
			return currentVersion;
	}
}
