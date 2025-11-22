/**
 * Template Versions - Queries
 *
 * Cycle 60: Template versioning system with complete history.
 *
 * Features:
 * - Version history retrieval
 * - Changelog tracking
 * - Version comparison
 * - Rollback support
 *
 * @see /one/things/plans/clickfunnels-builder-100-cycles.md
 */

import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Get all versions of a template
 */
export const getVersions = query({
	args: {
		templateId: v.id("things"),
	},
	handler: async (ctx, args) => {
		// 1. Authenticate
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) return [];

		// 2. Get user's group
		const person = await ctx.db
			.query("things")
			.withIndex("by_type", (q) => q.eq("type", "creator"))
			.filter((t) => t.properties?.email === identity.email)
			.first();

		if (!person?.groupId) return [];

		// 3. Get template and verify ownership
		const template = await ctx.db.get(args.templateId);
		if (!template || template.groupId !== person.groupId) {
			return [];
		}

		// 4. Find all version connections
		const versionConnections = await ctx.db
			.query("connections")
			.withIndex("from_type", (q) =>
				q
					.eq("fromThingId", args.templateId)
					.eq("relationshipType", "has_version")
			)
			.collect();

		// 5. Get all version things
		const versions = await Promise.all(
			versionConnections.map((conn) => ctx.db.get(conn.toThingId))
		);

		// 6. Filter out nulls and sort by version number (descending)
		const validVersions = versions
			.filter((v) => v !== null)
			.sort((a, b) => {
				const versionA = a!.properties?.versionNumber || 0;
				const versionB = b!.properties?.versionNumber || 0;
				return versionB - versionA;
			});

		return validVersions;
	},
});

/**
 * Get a specific version by version number
 */
export const getVersion = query({
	args: {
		templateId: v.id("things"),
		versionNumber: v.string(), // "1.0", "1.1", "2.0", etc.
	},
	handler: async (ctx, args) => {
		// 1. Authenticate
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) return null;

		// 2. Get user's group
		const person = await ctx.db
			.query("things")
			.withIndex("by_type", (q) => q.eq("type", "creator"))
			.filter((t) => t.properties?.email === identity.email)
			.first();

		if (!person?.groupId) return null;

		// 3. Get template and verify ownership
		const template = await ctx.db.get(args.templateId);
		if (!template || template.groupId !== person.groupId) {
			return null;
		}

		// 4. Find version connection
		const versionConnections = await ctx.db
			.query("connections")
			.withIndex("from_type", (q) =>
				q
					.eq("fromThingId", args.templateId)
					.eq("relationshipType", "has_version")
			)
			.collect();

		// 5. Get versions and find matching version number
		const versions = await Promise.all(
			versionConnections.map((conn) => ctx.db.get(conn.toThingId))
		);

		const version = versions.find(
			(v) => v?.properties?.versionNumber === args.versionNumber
		);

		return version || null;
	},
});

/**
 * Get latest version of a template
 */
export const getLatestVersion = query({
	args: {
		templateId: v.id("things"),
	},
	handler: async (ctx, args) => {
		// 1. Authenticate
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) return null;

		// 2. Get user's group
		const person = await ctx.db
			.query("things")
			.withIndex("by_type", (q) => q.eq("type", "creator"))
			.filter((t) => t.properties?.email === identity.email)
			.first();

		if (!person?.groupId) return null;

		// 3. Get template and verify ownership
		const template = await ctx.db.get(args.templateId);
		if (!template || template.groupId !== person.groupId) {
			return null;
		}

		// 4. Find all version connections
		const versionConnections = await ctx.db
			.query("connections")
			.withIndex("from_type", (q) =>
				q
					.eq("fromThingId", args.templateId)
					.eq("relationshipType", "has_version")
			)
			.collect();

		// 5. Get all version things
		const versions = await Promise.all(
			versionConnections.map((conn) => ctx.db.get(conn.toThingId))
		);

		// 6. Find latest version (highest version number)
		const latestVersion = versions
			.filter((v) => v !== null)
			.sort((a, b) => {
				const versionA = parseVersion(a!.properties?.versionNumber || "0.0");
				const versionB = parseVersion(b!.properties?.versionNumber || "0.0");
				return versionB - versionA;
			})[0];

		return latestVersion || null;
	},
});

/**
 * Get changelog for a template (all version events)
 */
export const getChangelog = query({
	args: {
		templateId: v.id("things"),
	},
	handler: async (ctx, args) => {
		// 1. Authenticate
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) return [];

		// 2. Get user's group
		const person = await ctx.db
			.query("things")
			.withIndex("by_type", (q) => q.eq("type", "creator"))
			.filter((t) => t.properties?.email === identity.email)
			.first();

		if (!person?.groupId) return [];

		// 3. Get template and verify ownership
		const template = await ctx.db.get(args.templateId);
		if (!template || template.groupId !== person.groupId) {
			return [];
		}

		// 4. Get all version creation events
		const events = await ctx.db
			.query("events")
			.withIndex("by_target", (q) => q.eq("targetId", args.templateId))
			.filter((e) =>
				e.type === "template_version_created" ||
				e.type === "template_updated"
			)
			.order("desc")
			.collect();

		// 5. Enrich events with actor info
		const enrichedEvents = await Promise.all(
			events.map(async (event) => {
				const actor = await ctx.db.get(event.actorId);
				return {
					...event,
					actorName: actor?.name || "Unknown",
					actorEmail: actor?.properties?.email || "",
				};
			})
		);

		return enrichedEvents;
	},
});

/**
 * Compare two versions
 */
export const compareVersions = query({
	args: {
		templateId: v.id("things"),
		versionA: v.string(),
		versionB: v.string(),
	},
	handler: async (ctx, args) => {
		// 1. Authenticate
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) return null;

		// 2. Get user's group
		const person = await ctx.db
			.query("things")
			.withIndex("by_type", (q) => q.eq("type", "creator"))
			.filter((t) => t.properties?.email === identity.email)
			.first();

		if (!person?.groupId) return null;

		// 3. Get template and verify ownership
		const template = await ctx.db.get(args.templateId);
		if (!template || template.groupId !== person.groupId) {
			return null;
		}

		// 4. Get both versions
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

		const versionAData = versions.find(
			(v) => v?.properties?.versionNumber === args.versionA
		);
		const versionBData = versions.find(
			(v) => v?.properties?.versionNumber === args.versionB
		);

		if (!versionAData || !versionBData) {
			return null;
		}

		// 5. Calculate differences
		const differences = calculateDifferences(
			versionAData.properties,
			versionBData.properties
		);

		return {
			versionA: versionAData,
			versionB: versionBData,
			differences,
		};
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
 * Helper: Calculate differences between two version properties
 */
function calculateDifferences(propsA: any, propsB: any): any {
	const differences: any = {
		added: [],
		removed: [],
		modified: [],
	};

	const keysA = Object.keys(propsA);
	const keysB = Object.keys(propsB);

	// Find added keys
	for (const key of keysB) {
		if (!keysA.includes(key)) {
			differences.added.push({ key, value: propsB[key] });
		}
	}

	// Find removed keys
	for (const key of keysA) {
		if (!keysB.includes(key)) {
			differences.removed.push({ key, value: propsA[key] });
		}
	}

	// Find modified keys
	for (const key of keysA) {
		if (keysB.includes(key) && JSON.stringify(propsA[key]) !== JSON.stringify(propsB[key])) {
			differences.modified.push({
				key,
				oldValue: propsA[key],
				newValue: propsB[key],
			});
		}
	}

	return differences;
}
