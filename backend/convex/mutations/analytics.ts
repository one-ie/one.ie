/**
 * Analytics Mutations - Write operations for conversion tracking
 *
 * All mutations MUST:
 * 1. Authenticate user
 * 2. Validate groupId for multi-tenant isolation
 * 3. Log events to audit trail
 *
 * @see /backend/CLAUDE.md - Mutation patterns
 * @see /one/knowledge/ontology.md - 6-dimension ontology (Dimension 5: Events)
 */

import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { ConversionTrackingService } from "../services/analytics/conversion-tracking";

// ============================================================================
// Track Page View
// ============================================================================

/**
 * Track a page view event
 *
 * Creates event: page_view
 *
 * Use case: Track when visitor views a funnel step/page
 */
export const trackPageView = mutation({
  args: {
    visitorId: v.id("things"), // Visitor/customer thing ID
    path: v.string(),
    funnelId: v.optional(v.id("things")),
    stepId: v.optional(v.id("things")),
    sessionId: v.optional(v.string()),
    source: v.optional(
      v.union(
        v.literal("ad"),
        v.literal("email"),
        v.literal("organic"),
        v.literal("referral"),
        v.literal("social"),
        v.literal("direct"),
        v.literal("other")
      )
    ),
    referrer: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Get visitor (no authentication required for public tracking)
    const visitor = await ctx.db.get(args.visitorId);
    if (!visitor) {
      throw new Error("Visitor not found");
    }

    // 2. Prepare event data using service
    const eventData = ConversionTrackingService.preparePageViewEvent(
      args.visitorId,
      args.path,
      args.funnelId,
      args.stepId,
      args.sessionId,
      args.source,
      args.referrer
    );

    // 3. Log event
    const eventId = await ctx.db.insert("events", {
      type: "page_view",
      actorId: args.visitorId,
      targetId: args.stepId,
      timestamp: Date.now(),
      metadata: {
        funnelId: args.funnelId,
        stepId: args.stepId,
        sessionId: args.sessionId,
        source: args.source,
        path: args.path,
        referrer: args.referrer,
        protocol: "conversion-tracking",
      },
    });

    return eventId;
  },
});

// ============================================================================
// Track Button Click
// ============================================================================

/**
 * Track a button click event
 *
 * Creates event: button_click
 *
 * Use case: Track when visitor clicks a button (CTA, link, etc.)
 */
export const trackButtonClick = mutation({
  args: {
    visitorId: v.id("things"),
    elementId: v.id("things"), // Element thing ID
    funnelId: v.optional(v.id("things")),
    stepId: v.optional(v.id("things")),
    sessionId: v.optional(v.string()),
    elementText: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Get visitor
    const visitor = await ctx.db.get(args.visitorId);
    if (!visitor) {
      throw new Error("Visitor not found");
    }

    // 2. Get element
    const element = await ctx.db.get(args.elementId);
    if (!element) {
      throw new Error("Element not found");
    }

    // 3. Log event
    const eventId = await ctx.db.insert("events", {
      type: "button_click",
      actorId: args.visitorId,
      targetId: args.elementId,
      timestamp: Date.now(),
      metadata: {
        funnelId: args.funnelId,
        stepId: args.stepId,
        elementId: args.elementId,
        sessionId: args.sessionId,
        elementText: args.elementText,
        protocol: "conversion-tracking",
      },
    });

    return eventId;
  },
});

// ============================================================================
// Track Form Submit
// ============================================================================

/**
 * Track a form submission event
 *
 * Creates event: form_submitted (existing event type)
 *
 * Use case: Track when visitor submits a form
 */
export const trackFormSubmit = mutation({
  args: {
    visitorId: v.id("things"),
    formId: v.id("things"), // Form element thing ID
    funnelId: v.optional(v.id("things")),
    stepId: v.optional(v.id("things")),
    sessionId: v.optional(v.string()),
    formData: v.optional(v.any()), // Form field values
  },
  handler: async (ctx, args) => {
    // 1. Get visitor
    const visitor = await ctx.db.get(args.visitorId);
    if (!visitor) {
      throw new Error("Visitor not found");
    }

    // 2. Get form
    const form = await ctx.db.get(args.formId);
    if (!form) {
      throw new Error("Form not found");
    }

    // 3. Log event (use existing form_submitted event type)
    const eventId = await ctx.db.insert("events", {
      type: "form_submitted",
      actorId: args.visitorId,
      targetId: args.formId,
      timestamp: Date.now(),
      metadata: {
        funnelId: args.funnelId,
        stepId: args.stepId,
        elementId: args.formId,
        sessionId: args.sessionId,
        formData: args.formData,
        protocol: "conversion-tracking",
      },
    });

    return eventId;
  },
});

// ============================================================================
// Track Purchase Complete
// ============================================================================

/**
 * Track a purchase completion event
 *
 * Creates event: purchase_completed (existing event type)
 *
 * Use case: Track when visitor completes a purchase
 */
export const trackPurchaseComplete = mutation({
  args: {
    customerId: v.id("things"), // Customer thing ID
    productId: v.id("things"), // Product thing ID
    amount: v.number(),
    funnelId: v.optional(v.id("things")),
    sessionId: v.optional(v.string()),
    source: v.optional(
      v.union(
        v.literal("ad"),
        v.literal("email"),
        v.literal("organic"),
        v.literal("referral"),
        v.literal("social"),
        v.literal("direct"),
        v.literal("other")
      )
    ),
  },
  handler: async (ctx, args) => {
    // 1. Get customer
    const customer = await ctx.db.get(args.customerId);
    if (!customer) {
      throw new Error("Customer not found");
    }

    // 2. Get product
    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    // 3. Log event (use existing purchase_completed event type)
    const eventId = await ctx.db.insert("events", {
      type: "purchase_completed",
      actorId: args.customerId,
      targetId: args.productId,
      timestamp: Date.now(),
      metadata: {
        funnelId: args.funnelId,
        sessionId: args.sessionId,
        source: args.source,
        value: args.amount,
        amount: args.amount,
        productId: args.productId,
        protocol: "conversion-tracking",
      },
    });

    // 4. If part of a funnel, also log visitor_converted event
    if (args.funnelId) {
      await ctx.db.insert("events", {
        type: "visitor_converted",
        actorId: args.customerId,
        targetId: args.funnelId,
        timestamp: Date.now(),
        metadata: {
          funnelId: args.funnelId,
          sessionId: args.sessionId,
          value: args.amount,
          protocol: "conversion-tracking",
        },
      });
    }

    return eventId;
  },
});

// ============================================================================
// Track Visitor Entered Funnel
// ============================================================================

/**
 * Track when a visitor enters a funnel
 *
 * Creates event: visitor_entered_funnel
 * Creates connection: visitor_entered_funnel
 *
 * Use case: Track funnel entry point for attribution
 */
export const trackVisitorEnteredFunnel = mutation({
  args: {
    visitorId: v.id("things"),
    funnelId: v.id("things"),
    sessionId: v.string(),
    source: v.optional(
      v.union(
        v.literal("ad"),
        v.literal("email"),
        v.literal("organic"),
        v.literal("referral"),
        v.literal("social"),
        v.literal("direct"),
        v.literal("other")
      )
    ),
    campaign: v.optional(v.string()),
    medium: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Get visitor
    const visitor = await ctx.db.get(args.visitorId);
    if (!visitor) {
      throw new Error("Visitor not found");
    }

    // 2. Get funnel
    const funnel = await ctx.db.get(args.funnelId);
    if (!funnel || funnel.type !== "funnel") {
      throw new Error("Funnel not found");
    }

    // 3. Create connection (visitor → funnel)
    const connectionId = await ctx.db.insert("connections", {
      fromThingId: args.visitorId,
      toThingId: args.funnelId,
      relationshipType: "visitor_entered_funnel",
      metadata: {
        sessionId: args.sessionId,
        source: args.source || "direct",
        campaign: args.campaign,
        medium: args.medium,
      },
      validFrom: Date.now(),
      createdAt: Date.now(),
    });

    // 4. Log event
    const eventId = await ctx.db.insert("events", {
      type: "visitor_entered_funnel",
      actorId: args.visitorId,
      targetId: args.funnelId,
      timestamp: Date.now(),
      metadata: {
        funnelId: args.funnelId,
        sessionId: args.sessionId,
        source: args.source || "direct",
        campaign: args.campaign,
        medium: args.medium,
        protocol: "conversion-tracking",
      },
    });

    return { eventId, connectionId };
  },
});

// ============================================================================
// Track Visitor Viewed Step
// ============================================================================

/**
 * Track when a visitor views a funnel step
 *
 * Creates event: visitor_viewed_step
 * Creates connection: visitor_viewed_step
 *
 * Use case: Track step progression through funnel
 */
export const trackVisitorViewedStep = mutation({
  args: {
    visitorId: v.id("things"),
    stepId: v.id("things"),
    funnelId: v.id("things"),
    sessionId: v.string(),
    sequence: v.number(),
  },
  handler: async (ctx, args) => {
    // 1. Get visitor
    const visitor = await ctx.db.get(args.visitorId);
    if (!visitor) {
      throw new Error("Visitor not found");
    }

    // 2. Get step
    const step = await ctx.db.get(args.stepId);
    if (!step || step.type !== "funnel_step") {
      throw new Error("Step not found");
    }

    // 3. Get funnel
    const funnel = await ctx.db.get(args.funnelId);
    if (!funnel || funnel.type !== "funnel") {
      throw new Error("Funnel not found");
    }

    // 4. Create connection (visitor → step)
    const connectionId = await ctx.db.insert("connections", {
      fromThingId: args.visitorId,
      toThingId: args.stepId,
      relationshipType: "visitor_viewed_step",
      metadata: {
        funnelId: args.funnelId,
        sessionId: args.sessionId,
        sequence: args.sequence,
      },
      validFrom: Date.now(),
      createdAt: Date.now(),
    });

    // 5. Log event
    const eventId = await ctx.db.insert("events", {
      type: "visitor_viewed_step",
      actorId: args.visitorId,
      targetId: args.stepId,
      timestamp: Date.now(),
      metadata: {
        funnelId: args.funnelId,
        stepId: args.stepId,
        sessionId: args.sessionId,
        sequence: args.sequence,
        protocol: "conversion-tracking",
      },
    });

    return { eventId, connectionId };
  },
});

// ============================================================================
// Track Conversion Goal
// ============================================================================

/**
 * Track when a visitor achieves a custom conversion goal
 *
 * Creates event: visitor_converted
 *
 * Use case: Track custom conversion events (signup, download, etc.)
 */
export const trackConversionGoal = mutation({
  args: {
    visitorId: v.id("things"),
    goalId: v.id("things"), // Conversion goal thing ID
    funnelId: v.optional(v.id("things")),
    sessionId: v.optional(v.string()),
    value: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. Get visitor
    const visitor = await ctx.db.get(args.visitorId);
    if (!visitor) {
      throw new Error("Visitor not found");
    }

    // 2. Get goal
    const goal = await ctx.db.get(args.goalId);
    if (!goal) {
      throw new Error("Goal not found");
    }

    // 3. Log conversion event
    const eventId = await ctx.db.insert("events", {
      type: "visitor_converted",
      actorId: args.visitorId,
      targetId: args.funnelId || args.goalId,
      timestamp: Date.now(),
      metadata: {
        funnelId: args.funnelId,
        sessionId: args.sessionId,
        goalId: args.goalId,
        value: args.value,
        protocol: "conversion-tracking",
      },
    });

    return eventId;
  },
});

// ============================================================================
// Create Session
// ============================================================================

/**
 * Create a new visitor session
 *
 * Creates thing: session (stored in metadata, not separate thing)
 *
 * Use case: Start tracking a visitor's journey
 */
export const createSession = mutation({
  args: {
    visitorId: v.id("things"),
    source: v.optional(
      v.union(
        v.literal("ad"),
        v.literal("email"),
        v.literal("organic"),
        v.literal("referral"),
        v.literal("social"),
        v.literal("direct"),
        v.literal("other")
      )
    ),
    campaign: v.optional(v.string()),
    medium: v.optional(v.string()),
    funnelId: v.optional(v.id("things")),
  },
  handler: async (ctx, args) => {
    // 1. Get visitor
    const visitor = await ctx.db.get(args.visitorId);
    if (!visitor) {
      throw new Error("Visitor not found");
    }

    // 2. Generate session ID
    const sessionId = crypto.randomUUID();

    // 3. Log session start event (using entity_created)
    const eventId = await ctx.db.insert("events", {
      type: "entity_created",
      actorId: args.visitorId,
      targetId: args.visitorId,
      timestamp: Date.now(),
      metadata: {
        entityType: "session",
        sessionId,
        source: args.source || "direct",
        campaign: args.campaign,
        medium: args.medium,
        funnelId: args.funnelId,
        protocol: "conversion-tracking",
      },
    });

    return { sessionId, eventId };
  },
});

// ============================================================================
// End Session
// ============================================================================

/**
 * End a visitor session
 *
 * Logs session end event
 *
 * Use case: Track when visitor leaves or session times out
 */
export const endSession = mutation({
  args: {
    visitorId: v.id("things"),
    sessionId: v.string(),
    converted: v.boolean(),
    conversionValue: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. Get visitor
    const visitor = await ctx.db.get(args.visitorId);
    if (!visitor) {
      throw new Error("Visitor not found");
    }

    // 2. Log session end event (using entity_updated)
    const eventId = await ctx.db.insert("events", {
      type: "entity_updated",
      actorId: args.visitorId,
      targetId: args.visitorId,
      timestamp: Date.now(),
      metadata: {
        entityType: "session",
        sessionId: args.sessionId,
        sessionEnded: true,
        converted: args.converted,
        conversionValue: args.conversionValue,
        protocol: "conversion-tracking",
      },
    });

    return eventId;
  },
});

// ============================================================================
// A/B Testing (Cycle 75)
// ============================================================================

/**
 * Create A/B Test
 *
 * Creates a new A/B test for a funnel with variants, traffic split,
 * success metrics, and duration settings.
 *
 * Thing type: ab_test
 * Event type: ab_test_created
 * Connection type: ab_test_for_funnel
 */
export const createABTest = mutation({
	args: {
		funnelId: v.id("things"),
		name: v.string(),
		description: v.optional(v.string()),
		testType: v.union(
			v.literal("headline"),
			v.literal("cta_button"),
			v.literal("image"),
			v.literal("entire_page"),
			v.literal("funnel_flow")
		),
		variants: v.array(
			v.object({
				name: v.string(), // A, B, C, D, E
				trafficPercent: v.number(), // 0-100
				changes: v.any(), // JSON describing what changed
			})
		),
		successMetric: v.union(
			v.literal("conversion_rate"),
			v.literal("revenue"),
			v.literal("time_on_page"),
			v.literal("form_completion"),
			v.literal("click_through_rate")
		),
		startDate: v.optional(v.number()),
		endDate: v.optional(v.number()),
		minimumSampleSize: v.optional(v.number()),
		confidenceLevel: v.optional(v.number()), // 90, 95, 99
	},
	handler: async (ctx, args) => {
		// 1. Authenticate
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error("Not authenticated");
		}

		// 2. Get user's person record
		const person = await ctx.db
			.query("things")
			.withIndex("by_type", (q) => q.eq("type", "creator"))
			.filter((q) => q.eq(q.field("properties.email"), identity.email))
			.first();

		if (!person || !person.groupId) {
			throw new Error("User must belong to a group");
		}

		// 3. Verify funnel exists and user has access
		const funnel = await ctx.db.get(args.funnelId);
		if (!funnel || funnel.type !== "funnel" || funnel.groupId !== person.groupId) {
			throw new Error("Funnel not found or unauthorized");
		}

		// 4. Validate variants
		if (args.variants.length < 2 || args.variants.length > 5) {
			throw new Error("Must have between 2 and 5 variants");
		}

		// 5. Validate traffic split adds up to 100%
		const totalTraffic = args.variants.reduce((sum, v) => sum + v.trafficPercent, 0);
		if (Math.abs(totalTraffic - 100) > 0.01) {
			throw new Error(`Traffic split must total 100% (currently ${totalTraffic}%)`);
		}

		// 6. Create A/B test thing
		const testId = await ctx.db.insert("things", {
			type: "ab_test",
			name: args.name,
			groupId: person.groupId,
			status: "draft", // Will be "active" when started
			properties: {
				funnelId: args.funnelId,
				description: args.description,
				testType: args.testType,
				variants: args.variants,
				successMetric: args.successMetric,
				startDate: args.startDate,
				endDate: args.endDate,
				minimumSampleSize: args.minimumSampleSize || 100,
				confidenceLevel: args.confidenceLevel || 95,
				// Results tracking
				results: {
					variantStats: args.variants.map((v) => ({
						name: v.name,
						visitors: 0,
						conversions: 0,
						conversionRate: 0,
						revenue: 0,
						avgTimeOnPage: 0,
					})),
					winner: null,
					significanceReached: false,
					pValue: null,
				},
			},
			createdAt: Date.now(),
			updatedAt: Date.now(),
		});

		// 7. Create connection from test to funnel
		await ctx.db.insert("connections", {
			fromThingId: testId,
			toThingId: args.funnelId,
			relationshipType: "ab_test_for_funnel",
			validFrom: Date.now(),
			createdAt: Date.now(),
		});

		// 8. Log event
		await ctx.db.insert("events", {
			type: "ab_test_created",
			actorId: person._id,
			targetId: testId,
			timestamp: Date.now(),
			metadata: {
				funnelId: args.funnelId,
				funnelName: funnel.name,
				testType: args.testType,
				variantCount: args.variants.length,
				successMetric: args.successMetric,
				groupId: person.groupId,
			},
		});

		return {
			testId,
			message: "A/B test created successfully",
		};
	},
});

/**
 * Start A/B Test - Activates test and begins traffic splitting
 * Event type: ab_test_started
 */
export const startABTest = mutation({
	args: {
		testId: v.id("things"),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new Error("Not authenticated");

		const person = await ctx.db
			.query("things")
			.withIndex("by_type", (q) => q.eq("type", "creator"))
			.filter((q) => q.eq(q.field("properties.email"), identity.email))
			.first();

		if (!person || !person.groupId) throw new Error("User must belong to a group");

		const test = await ctx.db.get(args.testId);
		if (!test || test.type !== "ab_test" || test.groupId !== person.groupId) {
			throw new Error("Test not found or unauthorized");
		}

		if (test.status !== "draft") {
			throw new Error("Test must be in draft status to start");
		}

		await ctx.db.patch(args.testId, {
			status: "active",
			properties: {
				...test.properties,
				startDate: Date.now(),
			},
			updatedAt: Date.now(),
		});

		await ctx.db.insert("events", {
			type: "ab_test_started",
			actorId: person._id,
			targetId: args.testId,
			timestamp: Date.now(),
			metadata: {
				testName: test.name,
				testType: test.properties?.testType,
				variantCount: test.properties?.variants?.length,
				groupId: person.groupId,
			},
		});

		return { message: "A/B test started successfully" };
	},
});

/**
 * Stop A/B Test - Stops test and freezes results
 * Event type: ab_test_completed
 */
export const stopABTest = mutation({
	args: {
		testId: v.id("things"),
		declareWinner: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new Error("Not authenticated");

		const person = await ctx.db
			.query("things")
			.withIndex("by_type", (q) => q.eq("type", "creator"))
			.filter((q) => q.eq(q.field("properties.email"), identity.email))
			.first();

		if (!person || !person.groupId) throw new Error("User must belong to a group");

		const test = await ctx.db.get(args.testId);
		if (!test || test.type !== "ab_test" || test.groupId !== person.groupId) {
			throw new Error("Test not found or unauthorized");
		}

		if (test.status !== "active") {
			throw new Error("Test must be active to stop");
		}

		await ctx.db.patch(args.testId, {
			status: "archived",
			properties: {
				...test.properties,
				endDate: Date.now(),
				results: {
					...test.properties?.results,
					winner: args.declareWinner || test.properties?.results?.winner,
				},
			},
			updatedAt: Date.now(),
		});

		await ctx.db.insert("events", {
			type: "ab_test_completed",
			actorId: person._id,
			targetId: args.testId,
			timestamp: Date.now(),
			metadata: {
				testName: test.name,
				winner: args.declareWinner,
				duration: Date.now() - (test.properties?.startDate || test.createdAt),
				groupId: person.groupId,
			},
		});

		return { message: "A/B test stopped successfully", winner: args.declareWinner };
	},
});

// ============================================================================
// Export Analytics Report (Cycle 80)
// ============================================================================

/**
 * Export analytics report in multiple formats
 *
 * Creates event: analytics_generated
 *
 * Use case: Export analytics data for external analysis, scheduled reports
 *
 * Formats: CSV, Excel, PDF, JSON
 * Report types: Traffic, Conversions, Revenue, A/B tests, Forms
 */
export const exportReport = mutation({
  args: {
    reportType: v.union(
      v.literal("traffic"),
      v.literal("conversions"),
      v.literal("revenue"),
      v.literal("ab_tests"),
      v.literal("forms"),
      v.literal("dashboard_widget")
    ),
    format: v.union(
      v.literal("csv"),
      v.literal("xlsx"),
      v.literal("json"),
      v.literal("pdf")
    ),
    dateRange: v.object({
      preset: v.union(
        v.literal("today"),
        v.literal("7days"),
        v.literal("30days"),
        v.literal("custom")
      ),
      startDate: v.optional(v.number()),
      endDate: v.optional(v.number()),
    }),
    filters: v.optional(
      v.object({
        funnelId: v.optional(v.id("things")),
        stepId: v.optional(v.id("things")),
        source: v.optional(v.string()),
        campaign: v.optional(v.string()),
      })
    ),
    columns: v.optional(v.array(v.string())),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. GET USER AND VALIDATE GROUP
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((q) => q.eq(q.field("properties.email"), identity.email))
      .first();

    if (!person || !person.groupId) {
      throw new Error("User must belong to a group");
    }

    // 3. CALCULATE DATE RANGE
    const now = Date.now();
    let rangeStart: number;
    let rangeEnd: number = now;

    if (args.dateRange.preset === "custom") {
      if (!args.dateRange.startDate || !args.dateRange.endDate) {
        throw new Error("Custom date range requires startDate and endDate");
      }
      rangeStart = args.dateRange.startDate;
      rangeEnd = args.dateRange.endDate;
    } else if (args.dateRange.preset === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      rangeStart = today.getTime();
    } else if (args.dateRange.preset === "7days") {
      rangeStart = now - 7 * 24 * 60 * 60 * 1000;
    } else {
      rangeStart = now - 30 * 24 * 60 * 60 * 1000;
    }

    // 4. FETCH EVENTS IN DATE RANGE
    let eventsQuery = ctx.db
      .query("events")
      .withIndex("by_time", (q) =>
        q.gte("timestamp", rangeStart).lte("timestamp", rangeEnd)
      );

    const allEvents = await eventsQuery.collect();

    // Filter by groupId (only events from things in this group)
    const groupEvents: any[] = [];
    for (const event of allEvents) {
      const actor = await ctx.db.get(event.actorId);
      if (actor && actor.groupId === person.groupId) {
        groupEvents.push({
          _id: event._id,
          type: event.type,
          actorId: event.actorId,
          targetId: event.targetId,
          timestamp: event.timestamp,
          metadata: event.metadata,
        });
      }
    }

    // 5. GENERATE REPORT USING SERVICE
    const { ReportGeneratorService } = await import(
      "../services/analytics/report-generator"
    );

    const exportOptions = {
      reportType: args.reportType,
      format: args.format,
      events: groupEvents,
      dateRange: args.dateRange,
      filters: args.filters,
      columns: args.columns,
      title: args.title,
    };

    // Run Effect.ts service
    const reportEffect = ReportGeneratorService.generateReport(exportOptions);
    const reportResult = await reportEffect.pipe(
      (effect: any) => effect,
      async (effect: any) => {
        try {
          return await effect;
        } catch (error: any) {
          if (error._tag === "ExportError") {
            throw new Error(`Export failed: ${error.message}`);
          } else if (error._tag === "InvalidReportTypeError") {
            throw new Error(`Invalid report type: ${error.reportType}`);
          } else if (error._tag === "InvalidDateRangeError") {
            throw new Error(`Invalid date range: ${error.message}`);
          }
          throw error;
        }
      }
    );

    // 6. LOG EVENT
    await ctx.db.insert("events", {
      type: "analytics_generated",
      actorId: person._id,
      targetId: person.groupId,
      timestamp: Date.now(),
      metadata: {
        reportType: args.reportType,
        format: args.format,
        dateRange: args.dateRange,
        recordCount: reportResult.recordCount,
        fileSize: reportResult.size,
        filename: reportResult.filename,
        protocol: "analytics-export",
      },
    });

    // 7. RETURN EXPORT RESULT
    return {
      success: true,
      content: reportResult.content,
      filename: reportResult.filename,
      mimeType: reportResult.mimeType,
      size: reportResult.size,
      recordCount: reportResult.recordCount,
    };
  },
});

// ============================================================================
// Session Recording (Cycle 78)
// ============================================================================

/**
 * Save Session Recording
 *
 * Stores a recorded user session with all events (DOM mutations, clicks, scrolls)
 * for later playback and analysis.
 *
 * Event type: session_recorded
 *
 * Privacy: Uses rrweb masking to hide sensitive data (passwords, credit cards)
 */
export const saveSessionRecording = mutation({
	args: {
		sessionId: v.string(),
		visitorId: v.string(), // Can be anonymous visitor ID
		funnelId: v.optional(v.id("things")),
		startTime: v.number(),
		endTime: v.number(),
		duration: v.number(),
		pageViews: v.array(v.string()),
		device: v.object({
			userAgent: v.string(),
			viewport: v.object({
				width: v.number(),
				height: v.number(),
			}),
			platform: v.string(),
		}),
		conversion: v.optional(
			v.object({
				converted: v.boolean(),
				conversionType: v.optional(v.string()),
				revenue: v.optional(v.number()),
			})
		),
		events: v.any(), // rrweb events array (eventWithTime[])
	},
	handler: async (ctx, args) => {
		// Note: Session recording is public-facing, no authentication required
		// This allows recording of anonymous visitor sessions

		// 1. If funnelId provided, get funnel to use groupId
		let groupId = "default-org";
		let actorId: any = null;

		if (args.funnelId) {
			const funnel = await ctx.db.get(args.funnelId);
			if (funnel) {
				groupId = funnel.groupId || groupId;
			}
		}

		// 2. Try to find existing visitor thing, or create placeholder
		// In production, this would be linked to actual visitor tracking
		const existingVisitor = await ctx.db
			.query("things")
			.withIndex("by_type", (q) => q.eq("type", "customer"))
			.filter((q) => q.eq(q.field("properties.visitorId"), args.visitorId))
			.first();

		if (existingVisitor) {
			actorId = existingVisitor._id;
		} else {
			// Create anonymous visitor thing
			actorId = await ctx.db.insert("things", {
				type: "customer",
				name: `Visitor ${args.visitorId.substring(0, 8)}`,
				groupId: groupId as any,
				status: "active",
				properties: {
					visitorId: args.visitorId,
					anonymous: true,
					firstSeen: args.startTime,
				},
				createdAt: Date.now(),
				updatedAt: Date.now(),
			});
		}

		// 3. Store session recording as event
		const eventId = await ctx.db.insert("events", {
			type: "session_recorded",
			actorId,
			targetId: args.funnelId,
			timestamp: args.startTime,
			metadata: {
				sessionId: args.sessionId,
				funnelId: args.funnelId,
				visitorId: args.visitorId,
				startTime: args.startTime,
				endTime: args.endTime,
				duration: args.duration,
				pageViews: args.pageViews,
				device: args.device,
				conversion: args.conversion,
				events: args.events, // Full rrweb event stream
				protocol: "session-recording",
			},
		});

		// 4. If conversion occurred, also log conversion event
		if (args.conversion?.converted && args.funnelId) {
			await ctx.db.insert("events", {
				type: "visitor_converted",
				actorId,
				targetId: args.funnelId,
				timestamp: args.endTime,
				metadata: {
					sessionId: args.sessionId,
					funnelId: args.funnelId,
					value: args.conversion.revenue || 0,
					conversionType: args.conversion.conversionType,
					protocol: "session-recording",
				},
			});
		}

		return {
			eventId,
			message: "Session recording saved successfully",
		};
	},
});
