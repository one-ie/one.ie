/**
 * Analytics Queries
 *
 * Queries for funnel analytics data including:
 * - KPIs (visitors, conversions, revenue)
 * - Time-series data (visitors over time)
 * - Step comparison data
 * - Traffic sources
 * - Funnel flow visualization
 *
 * Part of Cycle 71: Funnel Analytics Dashboard
 */

import { v } from "convex/values";
import { query } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

/**
 * Get Dashboard Analytics
 *
 * Returns comprehensive analytics data for a funnel including KPIs,
 * charts data, and funnel flow visualization.
 */
export const getDashboard = query({
	args: {
		funnelId: v.id("things"),
		dateRange: v.optional(v.union(v.literal("today"), v.literal("7days"), v.literal("30days"), v.literal("custom"))),
		startDate: v.optional(v.string()),
		endDate: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const { funnelId, dateRange = "30days", startDate, endDate } = args;

		// Calculate date range
		const now = Date.now();
		let rangeStart: number;
		let rangeEnd: number = now;

		if (dateRange === "custom" && startDate && endDate) {
			rangeStart = new Date(startDate).getTime();
			rangeEnd = new Date(endDate).getTime();
		} else if (dateRange === "today") {
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			rangeStart = today.getTime();
		} else if (dateRange === "7days") {
			rangeStart = now - 7 * 24 * 60 * 60 * 1000;
		} else {
			rangeStart = now - 30 * 24 * 60 * 60 * 1000;
		}

		// Calculate previous period for comparison
		const periodLength = rangeEnd - rangeStart;
		const previousStart = rangeStart - periodLength;
		const previousEnd = rangeStart;

		// Get funnel
		const funnel = await ctx.db.get(funnelId);
		if (!funnel || funnel.type !== "funnel") {
			throw new Error("Funnel not found");
		}

		// Get all events for this funnel in the date range
		const events = await ctx.db
			.query("events")
			.withIndex("by_target", (q) => q.eq("targetId", funnelId))
			.filter((q) =>
				q.and(
					q.gte(q.field("timestamp"), rangeStart),
					q.lte(q.field("timestamp"), rangeEnd)
				)
			)
			.collect();

		// Get previous period events for trend comparison
		const previousEvents = await ctx.db
			.query("events")
			.withIndex("by_target", (q) => q.eq("targetId", funnelId))
			.filter((q) =>
				q.and(
					q.gte(q.field("timestamp"), previousStart),
					q.lte(q.field("timestamp"), previousEnd)
				)
			)
			.collect();

		// Calculate KPIs
		const visitorEvents = events.filter(e => e.type === "funnel_view" || e.type === "step_view");
		const conversionEvents = events.filter(e => e.type === "funnel_completed");
		const totalVisitors = new Set(visitorEvents.map(e => e.actorId)).size;
		const totalConversions = conversionEvents.length;
		const conversionRate = totalVisitors > 0 ? (totalConversions / totalVisitors) * 100 : 0;

		// Calculate revenue (from conversion events with revenue data)
		const totalRevenue = conversionEvents.reduce((sum, event) => {
			const revenue = event.data?.revenue || 0;
			return sum + revenue;
		}, 0);

		// Previous period metrics
		const previousVisitorEvents = previousEvents.filter(e => e.type === "funnel_view" || e.type === "step_view");
		const previousConversionEvents = previousEvents.filter(e => e.type === "funnel_completed");
		const previousVisitors = new Set(previousVisitorEvents.map(e => e.actorId)).size;
		const previousConversions = previousConversionEvents.length;
		const previousRevenue = previousConversionEvents.reduce((sum, event) => {
			const revenue = event.data?.revenue || 0;
			return sum + revenue;
		}, 0);

		// Visitors over time (daily aggregation)
		const visitorsOverTime = generateTimeSeriesData(visitorEvents, rangeStart, rangeEnd);

		// Get funnel steps for comparison
		const steps = await ctx.db
			.query("things")
			.withIndex("by_type", (q) => q.eq("type", "funnel_step"))
			.filter((q) => q.eq(q.field("properties.funnelId"), funnelId))
			.collect();

		// Step comparison data
		const stepComparison = await Promise.all(
			steps.map(async (step) => {
				const stepViewEvents = events.filter(
					e => e.type === "step_view" && e.data?.stepId === step._id
				);
				const stepConversionEvents = events.filter(
					e => e.type === "step_completed" && e.data?.stepId === step._id
				);

				return {
					step: step.name,
					visitors: new Set(stepViewEvents.map(e => e.actorId)).size,
					conversions: stepConversionEvents.length,
				};
			})
		);

		// Traffic sources (extract from event data)
		const trafficSourceMap = new Map<string, number>();
		visitorEvents.forEach(event => {
			const source = event.data?.source || "direct";
			trafficSourceMap.set(source, (trafficSourceMap.get(source) || 0) + 1);
		});

		const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
		const trafficSources = Array.from(trafficSourceMap.entries()).map(([source, visitors], index) => ({
			source,
			visitors,
			color: colors[index % colors.length],
		}));

		// Funnel flow visualization
		const funnelFlow = generateFunnelFlow(steps, events);

		return {
			totalVisitors,
			totalConversions,
			conversionRate,
			totalRevenue,
			visitorsOverTime,
			stepComparison,
			trafficSources,
			funnelFlow,
			previousPeriod: {
				visitors: previousVisitors,
				conversions: previousConversions,
				revenue: previousRevenue,
			},
		};
	},
});

/**
 * Helper: Generate time series data for visitors
 */
function generateTimeSeriesData(
	events: Array<{ timestamp: number; actorId: string }>,
	startTime: number,
	endTime: number
): Array<{ date: string; visitors: number }> {
	const dayMs = 24 * 60 * 60 * 1000;
	const days = Math.ceil((endTime - startTime) / dayMs);

	const dailyVisitors = new Map<string, Set<string>>();

	// Aggregate visitors by day
	events.forEach(event => {
		const date = new Date(event.timestamp);
		const dateKey = date.toISOString().split('T')[0];

		if (!dailyVisitors.has(dateKey)) {
			dailyVisitors.set(dateKey, new Set());
		}
		dailyVisitors.get(dateKey)!.add(event.actorId);
	});

	// Generate complete time series (fill gaps with 0)
	const result: Array<{ date: string; visitors: number }> = [];
	for (let i = 0; i < days; i++) {
		const date = new Date(startTime + i * dayMs);
		const dateKey = date.toISOString().split('T')[0];
		const visitors = dailyVisitors.get(dateKey)?.size || 0;

		result.push({
			date: dateKey,
			visitors,
		});
	}

	return result;
}

/**
 * Helper: Generate funnel flow visualization data
 */
function generateFunnelFlow(
	steps: Array<{ _id: Id<"things">; name: string }>,
	events: Array<{ type: string; data?: any; actorId: string }>
): {
	nodes: Array<{ id: string; label: string; value: number }>;
	edges: Array<{ from: string; to: string; value: number }>;
} {
	// Sort steps by order
	const sortedSteps = [...steps].sort((a, b) => {
		const orderA = a.properties?.order || 0;
		const orderB = b.properties?.order || 0;
		return orderA - orderB;
	});

	// Calculate visitors for each step
	const nodes = sortedSteps.map((step) => {
		const stepViewEvents = events.filter(
			e => e.type === "step_view" && e.data?.stepId === step._id
		);
		const uniqueVisitors = new Set(stepViewEvents.map(e => e.actorId)).size;

		return {
			id: step._id,
			label: step.name,
			value: uniqueVisitors,
		};
	});

	// Calculate flow between steps
	const edges: Array<{ from: string; to: string; value: number }> = [];
	for (let i = 0; i < sortedSteps.length - 1; i++) {
		const currentStep = sortedSteps[i];
		const nextStep = sortedSteps[i + 1];

		// Find visitors who went from current to next step
		const currentVisitors = new Set(
			events
				.filter(e => e.type === "step_view" && e.data?.stepId === currentStep._id)
				.map(e => e.actorId)
		);

		const nextVisitors = new Set(
			events
				.filter(e => e.type === "step_view" && e.data?.stepId === nextStep._id)
				.map(e => e.actorId)
		);

		// Intersection: visitors who viewed both steps
		const flowVisitors = [...currentVisitors].filter(id => nextVisitors.has(id));

		edges.push({
			from: currentStep._id,
			to: nextStep._id,
			value: flowVisitors.length,
		});
	}

	return { nodes, edges };
}

/**
 * Get Real-Time Visitor Count
 *
 * Returns the current number of active visitors on a funnel.
 * Used by LiveCounter component.
 */
export const getLiveVisitors = query({
	args: {
		funnelId: v.id("things"),
	},
	handler: async (ctx, args) => {
		const { funnelId } = args;

		// Get events from last 5 minutes
		const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

		const recentEvents = await ctx.db
			.query("events")
			.withIndex("by_target", (q) => q.eq("targetId", funnelId))
			.filter((q) =>
				q.and(
					q.gte(q.field("timestamp"), fiveMinutesAgo),
					q.or(
						q.eq(q.field("type"), "funnel_view"),
						q.eq(q.field("type"), "step_view")
					)
				)
			)
			.collect();

		const uniqueVisitors = new Set(recentEvents.map(e => e.actorId)).size;

		return {
			count: uniqueVisitors,
		};
	},
});

/**
 * Get Total Conversions
 *
 * Returns the total number of conversions for a funnel.
 * Used by LiveCounter component.
 */
export const getTotalConversions = query({
	args: {
		funnelId: v.id("things"),
		dateRange: v.optional(v.union(v.literal("today"), v.literal("7days"), v.literal("30days"))),
	},
	handler: async (ctx, args) => {
		const { funnelId, dateRange = "30days" } = args;

		const now = Date.now();
		let rangeStart: number;

		if (dateRange === "today") {
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			rangeStart = today.getTime();
		} else if (dateRange === "7days") {
			rangeStart = now - 7 * 24 * 60 * 60 * 1000;
		} else {
			rangeStart = now - 30 * 24 * 60 * 60 * 1000;
		}

		const conversionEvents = await ctx.db
			.query("events")
			.withIndex("by_target", (q) => q.eq("targetId", funnelId))
			.filter((q) =>
				q.and(
					q.gte(q.field("timestamp"), rangeStart),
					q.eq(q.field("type"), "funnel_completed")
				)
			)
			.collect();

		return {
			count: conversionEvents.length,
		};
	},
});

/**
 * Get Total Revenue
 *
 * Returns the total revenue generated by a funnel.
 * Used by LiveCounter component.
 */
export const getTotalRevenue = query({
	args: {
		funnelId: v.id("things"),
		dateRange: v.optional(v.union(v.literal("today"), v.literal("7days"), v.literal("30days"))),
	},
	handler: async (ctx, args) => {
		const { funnelId, dateRange = "30days" } = args;

		const now = Date.now();
		let rangeStart: number;

		if (dateRange === "today") {
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			rangeStart = today.getTime();
		} else if (dateRange === "7days") {
			rangeStart = now - 7 * 24 * 60 * 60 * 1000;
		} else {
			rangeStart = now - 30 * 24 * 60 * 60 * 1000;
		}

		const conversionEvents = await ctx.db
			.query("events")
			.withIndex("by_target", (q) => q.eq("targetId", funnelId))
			.filter((q) =>
				q.and(
					q.gte(q.field("timestamp"), rangeStart),
					q.eq(q.field("type"), "funnel_completed")
				)
			)
			.collect();

		const totalRevenue = conversionEvents.reduce((sum, event) => {
			const revenue = event.data?.revenue || 0;
			return sum + revenue;
		}, 0);

		return {
			count: totalRevenue,
		};
	},
});

// ============================================================================
// CYCLE 72: CONVERSION TRACKING SYSTEM
// ============================================================================

import { ConversionTrackingService } from "../services/analytics/conversion-tracking";

/**
 * Get Conversions (Cycle 72)
 *
 * Returns detailed conversion data including attribution analysis
 */
export const getConversions = query({
	args: {
		funnelId: v.id("things"),
		startDate: v.optional(v.number()),
		endDate: v.optional(v.number()),
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

		// 3. Get funnel and verify access
		const funnel = await ctx.db.get(args.funnelId);
		if (!funnel || funnel.type !== "funnel") return null;

		const role = person.properties?.role;
		const isAuthorized = role === "platform_owner" || funnel.groupId === person.groupId;
		if (!isAuthorized) return null;

		// 4. Get funnel events
		const allEvents = await ctx.db.query("events").withIndex("by_time").collect();
		let funnelEvents = allEvents.filter((e) => e.metadata?.funnelId === args.funnelId);

		if (args.startDate) {
			funnelEvents = funnelEvents.filter((e) => e.timestamp >= args.startDate!);
		}
		if (args.endDate) {
			funnelEvents = funnelEvents.filter((e) => e.timestamp <= args.endDate!);
		}

		// 5. Calculate metrics
		const entryEvents = funnelEvents.filter((e) => e.type === "visitor_entered_funnel");
		const conversionEvents = funnelEvents.filter(
			(e) => e.type === "purchase_completed" || e.type === "visitor_converted"
		);

		const totalVisitors = new Set(entryEvents.map((e) => e.actorId)).size;
		const totalConversions = new Set(conversionEvents.map((e) => e.actorId)).size;
		const conversionRate = totalVisitors > 0 ? totalConversions / totalVisitors : 0;
		const revenue = conversionEvents.reduce((sum, e) => sum + (e.metadata?.value || 0), 0);

		// 6. Get attribution
		const attributionResult = await ConversionTrackingService.analyzeAttribution(
			funnelEvents.map((e) => ({
				_id: e._id,
				type: e.type as any,
				actorId: e.actorId,
				targetId: e.targetId,
				timestamp: e.timestamp,
				metadata: e.metadata,
			})),
			args.funnelId
		)();

		const attribution = attributionResult._tag === "Right" ? attributionResult.right : null;

		return {
			funnelId: args.funnelId,
			funnelName: funnel.name,
			totalVisitors,
			totalConversions,
			conversionRate,
			revenue,
			attribution,
		};
	},
});

/**
 * Get Funnel Flow (Cycle 72)
 *
 * Returns step-by-step funnel flow with drop-off analysis
 */
export const getFunnelFlow = query({
	args: {
		funnelId: v.id("things"),
		startDate: v.optional(v.number()),
		endDate: v.optional(v.number()),
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

		// 3. Get funnel and verify access
		const funnel = await ctx.db.get(args.funnelId);
		if (!funnel || funnel.type !== "funnel") return null;

		const role = person.properties?.role;
		const isAuthorized = role === "platform_owner" || funnel.groupId === person.groupId;
		if (!isAuthorized) return null;

		// 4. Get funnel steps
		const stepConnections = await ctx.db
			.query("connections")
			.withIndex("from_type", (q) =>
				q.eq("fromThingId", funnel._id).eq("relationshipType", "funnel_contains_step")
			)
			.collect();

		const steps = await Promise.all(
			stepConnections.map(async (conn) => {
				const step = await ctx.db.get(conn.toThingId);
				return {
					_id: step!._id,
					name: step!.name,
					sequence: conn.metadata?.sequence || 0,
				};
			})
		);

		steps.sort((a, b) => a.sequence - b.sequence);

		// 5. Get funnel events
		const allEvents = await ctx.db.query("events").withIndex("by_time").collect();
		let funnelEvents = allEvents.filter((e) => e.metadata?.funnelId === args.funnelId);

		if (args.startDate) {
			funnelEvents = funnelEvents.filter((e) => e.timestamp >= args.startDate!);
		}
		if (args.endDate) {
			funnelEvents = funnelEvents.filter((e) => e.timestamp <= args.endDate!);
		}

		// 6. Calculate flow
		const flowResult = await ConversionTrackingService.calculateFunnelFlow(
			funnelEvents.map((e) => ({
				_id: e._id,
				type: e.type as any,
				actorId: e.actorId,
				targetId: e.targetId,
				timestamp: e.timestamp,
				metadata: e.metadata,
			})),
			args.funnelId,
			funnel.name,
			steps
		)();

		return flowResult._tag === "Right" ? flowResult.right : null;
	},
});

/**
 * Get Drop-off Analysis (Cycle 72)
 *
 * Returns where visitors drop off in the funnel
 */
export const getDropoffAnalysis = query({
	args: {
		funnelId: v.id("things"),
		startDate: v.optional(v.number()),
		endDate: v.optional(v.number()),
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

		// 3. Get funnel and verify access
		const funnel = await ctx.db.get(args.funnelId);
		if (!funnel || funnel.type !== "funnel") return null;

		const role = person.properties?.role;
		const isAuthorized = role === "platform_owner" || funnel.groupId === person.groupId;
		if (!isAuthorized) return null;

		// 4. Get funnel steps
		const stepConnections = await ctx.db
			.query("connections")
			.withIndex("from_type", (q) =>
				q.eq("fromThingId", funnel._id).eq("relationshipType", "funnel_contains_step")
			)
			.collect();

		const steps = await Promise.all(
			stepConnections.map(async (conn) => {
				const step = await ctx.db.get(conn.toThingId);
				return {
					_id: step!._id,
					name: step!.name,
					sequence: conn.metadata?.sequence || 0,
				};
			})
		);

		steps.sort((a, b) => a.sequence - b.sequence);

		// 5. Get funnel events
		const allEvents = await ctx.db.query("events").withIndex("by_time").collect();
		let funnelEvents = allEvents.filter((e) => e.metadata?.funnelId === args.funnelId);

		if (args.startDate) {
			funnelEvents = funnelEvents.filter((e) => e.timestamp >= args.startDate!);
		}
		if (args.endDate) {
			funnelEvents = funnelEvents.filter((e) => e.timestamp <= args.endDate!);
		}

		// 6. Analyze drop-off
		const dropoffResult = await ConversionTrackingService.analyzeDropoff(
			funnelEvents.map((e) => ({
				_id: e._id,
				type: e.type as any,
				actorId: e.actorId,
				targetId: e.targetId,
				timestamp: e.timestamp,
				metadata: e.metadata,
			})),
			args.funnelId,
			steps
		)();

		return dropoffResult._tag === "Right" ? dropoffResult.right : null;
	},
});

/**
 * Get Session Journey (Cycle 72)
 *
 * Returns complete visitor journey through the funnel
 */
export const getSessionJourney = query({
	args: {
		sessionId: v.string(),
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

		// 3. Get session events
		const allEvents = await ctx.db.query("events").collect();
		const sessionEvents = allEvents.filter((e) => e.metadata?.sessionId === args.sessionId);

		if (sessionEvents.length === 0) return null;

		// 4. Verify access
		const firstEvent = sessionEvents[0];
		const visitor = await ctx.db.get(firstEvent.actorId);
		if (!visitor) return null;

		const role = person.properties?.role;
		const isAuthorized = role === "platform_owner" || visitor.groupId === person.groupId;
		if (!isAuthorized) return null;

		// 5. Sort and analyze
		const sortedEvents = sessionEvents.sort((a, b) => a.timestamp - b.timestamp);
		const startTime = sortedEvents[0].timestamp;
		const endTime = sortedEvents[sortedEvents.length - 1].timestamp;
		const duration = endTime - startTime;

		const converted = sortedEvents.some(
			(e) => e.type === "purchase_completed" || e.type === "visitor_converted"
		);

		const conversionEvent = sortedEvents.find(
			(e) => e.type === "purchase_completed" || e.type === "visitor_converted"
		);

		const conversionValue = conversionEvent?.metadata?.value || 0;
		const entryEvent = sortedEvents.find((e) => e.type === "visitor_entered_funnel");

		const source = entryEvent?.metadata?.source || "direct";
		const campaign = entryEvent?.metadata?.campaign;
		const medium = entryEvent?.metadata?.medium;
		const funnelId = entryEvent?.metadata?.funnelId;

		let funnelName;
		if (funnelId) {
			const funnel = await ctx.db.get(funnelId as any);
			funnelName = funnel?.name;
		}

		return {
			sessionId: args.sessionId,
			visitorId: firstEvent.actorId,
			funnelId,
			funnelName,
			startTime,
			endTime,
			duration,
			source,
			campaign,
			medium,
			converted,
			conversionValue,
			events: sortedEvents.map((e) => ({
				id: e._id,
				type: e.type,
				timestamp: e.timestamp,
				targetId: e.targetId,
				metadata: e.metadata,
			})),
		};
	},
});

// ============================================================================
// CYCLE 89: REVENUE ANALYTICS DASHBOARD
// ============================================================================

/**
 * Get Revenue Data (Cycle 89)
 *
 * Returns comprehensive revenue analytics including:
 * - KPIs (total revenue, AOV, LTV, refund rate)
 * - Revenue over time
 * - Revenue breakdown (by product, funnel, type)
 * - Cohort analysis
 * - MRR/ARR tracking
 */
export const getRevenueData = query({
	args: {
		dateRange: v.optional(
			v.union(
				v.literal("today"),
				v.literal("7days"),
				v.literal("30days"),
				v.literal("90days"),
				v.literal("custom")
			)
		),
		startDate: v.optional(v.string()),
		endDate: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const { dateRange = "30days", startDate, endDate } = args;

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

		if (!person?.groupId) {
			throw new Error("User must belong to a group");
		}

		// 3. Calculate date range
		const now = Date.now();
		let rangeStart: number;
		let rangeEnd: number = now;

		if (dateRange === "custom" && startDate && endDate) {
			rangeStart = new Date(startDate).getTime();
			rangeEnd = new Date(endDate).getTime();
		} else if (dateRange === "today") {
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			rangeStart = today.getTime();
		} else if (dateRange === "7days") {
			rangeStart = now - 7 * 24 * 60 * 60 * 1000;
		} else if (dateRange === "90days") {
			rangeStart = now - 90 * 24 * 60 * 60 * 1000;
		} else {
			rangeStart = now - 30 * 24 * 60 * 60 * 1000;
		}

		// Calculate previous period for comparison
		const periodLength = rangeEnd - rangeStart;
		const previousStart = rangeStart - periodLength;
		const previousEnd = rangeStart;

		// 4. Get revenue events (purchase_completed and subscription_payment_succeeded)
		const allEvents = await ctx.db.query("events").withIndex("by_time").collect();

		// Filter by group and date range
		const revenueEvents = allEvents.filter(
			(e) =>
				e.groupId === person.groupId &&
				(e.type === "purchase_completed" || e.type === "subscription_payment_succeeded") &&
				e.timestamp >= rangeStart &&
				e.timestamp <= rangeEnd
		);

		const previousRevenueEvents = allEvents.filter(
			(e) =>
				e.groupId === person.groupId &&
				(e.type === "purchase_completed" || e.type === "subscription_payment_succeeded") &&
				e.timestamp >= previousStart &&
				e.timestamp < previousEnd
		);

		// 5. Calculate KPIs
		const totalRevenue = revenueEvents.reduce(
			(sum, event) => sum + (event.metadata?.amount || event.metadata?.revenue || 0),
			0
		);

		const totalOrders = revenueEvents.filter((e) => e.type === "purchase_completed").length;
		const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

		// Calculate refunds
		const refundEvents = allEvents.filter(
			(e) =>
				e.groupId === person.groupId &&
				e.type === "refund_issued" &&
				e.timestamp >= rangeStart &&
				e.timestamp <= rangeEnd
		);

		const totalRefunds = refundEvents.reduce(
			(sum, event) => sum + (event.metadata?.amount || 0),
			0
		);

		const refundRate = totalRevenue > 0 ? (totalRefunds / totalRevenue) * 100 : 0;

		// Calculate LTV (simplified: average revenue per unique customer)
		const uniqueCustomers = new Set(revenueEvents.map((e) => e.actorId));
		const lifetimeValue = uniqueCustomers.size > 0 ? totalRevenue / uniqueCustomers.size : 0;

		// Previous period metrics
		const previousRevenue = previousRevenueEvents.reduce(
			(sum, event) => sum + (event.metadata?.amount || event.metadata?.revenue || 0),
			0
		);

		const previousOrders = previousRevenueEvents.filter((e) => e.type === "purchase_completed").length;
		const previousAOV = previousOrders > 0 ? previousRevenue / previousOrders : 0;

		const previousRefunds = allEvents
			.filter(
				(e) =>
					e.groupId === person.groupId &&
					e.type === "refund_issued" &&
					e.timestamp >= previousStart &&
					e.timestamp < previousEnd
			)
			.reduce((sum, event) => sum + (event.metadata?.amount || 0), 0);

		const previousRefundRate = previousRevenue > 0 ? (previousRefunds / previousRevenue) * 100 : 0;

		const previousUniqueCustomers = new Set(previousRevenueEvents.map((e) => e.actorId));
		const previousLTV = previousUniqueCustomers.size > 0 ? previousRevenue / previousUniqueCustomers.size : 0;

		// 6. Revenue over time (daily aggregation)
		const revenueOverTime = generateRevenueTimeSeries(revenueEvents, rangeStart, rangeEnd);

		// 7. Revenue by product
		const productRevenueMap = new Map<string, { revenue: number; orders: number }>();

		for (const event of revenueEvents.filter((e) => e.type === "purchase_completed")) {
			const productId = event.metadata?.productId || event.targetId;
			const productName = event.metadata?.productName || "Unknown Product";
			const amount = event.metadata?.amount || event.metadata?.revenue || 0;

			const key = `${productId}-${productName}`;
			const current = productRevenueMap.get(key) || { revenue: 0, orders: 0 };
			productRevenueMap.set(key, {
				revenue: current.revenue + amount,
				orders: current.orders + 1,
			});
		}

		const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];
		const revenueByProduct = Array.from(productRevenueMap.entries())
			.map(([key, data], index) => ({
				product: key.split("-")[1] || "Unknown",
				revenue: data.revenue,
				orders: data.orders,
				color: colors[index % colors.length],
			}))
			.sort((a, b) => b.revenue - a.revenue)
			.slice(0, 10); // Top 10 products

		// 8. Revenue by funnel
		const funnelRevenueMap = new Map<string, { revenue: number; orders: number }>();

		for (const event of revenueEvents.filter((e) => e.type === "purchase_completed")) {
			const funnelId = event.metadata?.funnelId;
			const funnelName = event.metadata?.funnelName || "Direct Sale";
			const amount = event.metadata?.amount || event.metadata?.revenue || 0;

			const key = funnelName;
			const current = funnelRevenueMap.get(key) || { revenue: 0, orders: 0 };
			funnelRevenueMap.set(key, {
				revenue: current.revenue + amount,
				orders: current.orders + 1,
			});
		}

		const revenueByFunnel = Array.from(funnelRevenueMap.entries())
			.map(([funnel, data], index) => ({
				funnel,
				revenue: data.revenue,
				orders: data.orders,
				color: colors[index % colors.length],
			}))
			.sort((a, b) => b.revenue - a.revenue);

		// 9. Revenue by type
		const productSalesRevenue = revenueEvents
			.filter((e) => e.type === "purchase_completed" && !e.metadata?.isUpsell && !e.metadata?.isOrderBump)
			.reduce((sum, e) => sum + (e.metadata?.amount || 0), 0);

		const upsellRevenue = revenueEvents
			.filter((e) => e.type === "purchase_completed" && e.metadata?.isUpsell)
			.reduce((sum, e) => sum + (e.metadata?.amount || 0), 0);

		const orderBumpRevenue = revenueEvents
			.filter((e) => e.type === "purchase_completed" && e.metadata?.isOrderBump)
			.reduce((sum, e) => sum + (e.metadata?.amount || 0), 0);

		const subscriptionRevenue = revenueEvents
			.filter((e) => e.type === "subscription_payment_succeeded")
			.reduce((sum, e) => sum + (e.metadata?.amount || 0), 0);

		const revenueByType = [
			{
				type: "Product Sales" as const,
				revenue: productSalesRevenue,
				percentage: totalRevenue > 0 ? (productSalesRevenue / totalRevenue) * 100 : 0,
				color: "#3b82f6",
			},
			{
				type: "Upsells" as const,
				revenue: upsellRevenue,
				percentage: totalRevenue > 0 ? (upsellRevenue / totalRevenue) * 100 : 0,
				color: "#10b981",
			},
			{
				type: "Order Bumps" as const,
				revenue: orderBumpRevenue,
				percentage: totalRevenue > 0 ? (orderBumpRevenue / totalRevenue) * 100 : 0,
				color: "#f59e0b",
			},
			{
				type: "Subscriptions" as const,
				revenue: subscriptionRevenue,
				percentage: totalRevenue > 0 ? (subscriptionRevenue / totalRevenue) * 100 : 0,
				color: "#8b5cf6",
			},
		];

		// 10. Cohort analysis (by month of first purchase)
		const cohortMap = new Map<string, { revenue: number; customers: Set<string> }>();

		for (const event of revenueEvents) {
			const customerId = event.actorId;
			const date = new Date(event.timestamp);
			const cohortKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
			const amount = event.metadata?.amount || event.metadata?.revenue || 0;

			if (!cohortMap.has(cohortKey)) {
				cohortMap.set(cohortKey, { revenue: 0, customers: new Set() });
			}

			const cohort = cohortMap.get(cohortKey)!;
			cohort.revenue += amount;
			cohort.customers.add(customerId);
		}

		const cohortRevenue = Array.from(cohortMap.entries())
			.map(([cohort, data]) => ({
				cohort,
				revenue: data.revenue,
				customers: data.customers.size,
				avgRevenue: data.customers.size > 0 ? data.revenue / data.customers.size : 0,
			}))
			.sort((a, b) => a.cohort.localeCompare(b.cohort));

		// 11. MRR/ARR calculation
		const subscriptionEvents = revenueEvents.filter((e) => e.type === "subscription_payment_succeeded");

		// Get unique active subscriptions
		const activeSubscriptions = new Set(subscriptionEvents.map((e) => e.metadata?.subscriptionId).filter(Boolean));

		// Calculate MRR (monthly recurring revenue)
		const mrr = subscriptionRevenue; // Simplified: total subscription revenue in period

		// Calculate MRR growth (comparing to previous period)
		const previousSubscriptionRevenue = previousRevenueEvents
			.filter((e) => e.type === "subscription_payment_succeeded")
			.reduce((sum, e) => sum + (e.metadata?.amount || 0), 0);

		const mrrGrowth =
			previousSubscriptionRevenue > 0
				? ((subscriptionRevenue - previousSubscriptionRevenue) / previousSubscriptionRevenue) * 100
				: 0;

		// ARR is MRR * 12
		const arr = mrr * 12;

		return {
			// KPIs
			totalRevenue,
			averageOrderValue,
			lifetimeValue,
			refundRate,

			// Revenue over time
			revenueOverTime,

			// Revenue breakdown
			revenueByProduct,
			revenueByFunnel,
			revenueByType,

			// Cohort analysis
			cohortRevenue,

			// MRR/ARR
			mrr,
			arr,
			mrrGrowth,
			subscriptionCount: activeSubscriptions.size,

			// Previous period comparison
			previousPeriod: {
				revenue: previousRevenue,
				aov: previousAOV,
				ltv: previousLTV,
				refundRate: previousRefundRate,
			},
		};
	},
});

/**
 * Helper: Generate revenue time series data
 */
function generateRevenueTimeSeries(
	events: Array<{ timestamp: number; metadata?: any }>,
	startTime: number,
	endTime: number
): Array<{ date: string; revenue: number; orders: number }> {
	const dayMs = 24 * 60 * 60 * 1000;
	const days = Math.ceil((endTime - startTime) / dayMs);

	const dailyRevenue = new Map<string, { revenue: number; orders: number }>();

	// Aggregate revenue by day
	events.forEach((event) => {
		const date = new Date(event.timestamp);
		const dateKey = date.toISOString().split("T")[0];
		const amount = event.metadata?.amount || event.metadata?.revenue || 0;

		if (!dailyRevenue.has(dateKey)) {
			dailyRevenue.set(dateKey, { revenue: 0, orders: 0 });
		}

		const day = dailyRevenue.get(dateKey)!;
		day.revenue += amount;
		day.orders += 1;
	});

	// Generate complete time series (fill gaps with 0)
	const result: Array<{ date: string; revenue: number; orders: number }> = [];
	for (let i = 0; i < days; i++) {
		const date = new Date(startTime + i * dayMs);
		const dateKey = date.toISOString().split("T")[0];
		const day = dailyRevenue.get(dateKey) || { revenue: 0, orders: 0 };

		result.push({
			date: dateKey,
			revenue: day.revenue,
			orders: day.orders,
		});
	}

	return result;
}
