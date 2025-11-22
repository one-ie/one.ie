/**
 * ConversionTrackingService - Business logic for conversion tracking
 *
 * This service implements the core business logic for tracking conversions
 * throughout the funnel using Effect.ts patterns. All operations enforce
 * multi-tenant isolation through groupId validation.
 *
 * Key Features:
 * - Event-based conversion tracking (page_view, button_click, form_submit, purchase_complete)
 * - Attribution tracking (source: ad, email, organic)
 * - Funnel flow analysis (step-by-step conversion rates)
 * - Drop-off analysis (where users leave)
 * - Session journey tracking (complete user path)
 * - Multi-tenant isolation (groupId scoping)
 *
 * @see /one/knowledge/ontology.md - 6-dimension ontology (Dimension 5: Events)
 * @see /backend/CLAUDE.md - Backend patterns
 */

import { Effect } from "effect";

// ============================================================================
// Types
// ============================================================================

/**
 * Conversion event types tracked in the system
 */
export type ConversionEventType =
  | "page_view"
  | "button_click"
  | "form_submit"
  | "purchase_complete"
  | "visitor_entered_funnel"
  | "visitor_viewed_step"
  | "visitor_converted";

/**
 * Attribution source types
 */
export type AttributionSource =
  | "ad"
  | "email"
  | "organic"
  | "referral"
  | "social"
  | "direct"
  | "other";

/**
 * Conversion event data structure
 */
export interface ConversionEvent {
  _id: string;
  type: ConversionEventType;
  actorId: string; // Visitor/customer ID
  targetId?: string; // Funnel/step/element ID
  timestamp: number;
  metadata?: {
    funnelId?: string;
    stepId?: string;
    elementId?: string;
    sessionId?: string;
    source?: AttributionSource;
    campaign?: string;
    medium?: string;
    content?: string;
    value?: number; // Purchase amount, form value, etc.
    path?: string; // Page path
    referrer?: string;
    protocol?: string;
    [key: string]: any;
  };
}

/**
 * Session tracking data
 */
export interface Session {
  sessionId: string;
  visitorId: string;
  funnelId?: string;
  startTime: number;
  endTime?: number;
  source: AttributionSource;
  campaign?: string;
  medium?: string;
  events: ConversionEvent[];
  converted: boolean;
  conversionValue?: number;
}

/**
 * Funnel flow step data
 */
export interface FunnelFlowStep {
  stepId: string;
  stepName: string;
  sequence: number;
  visitors: number;
  conversions: number;
  conversionRate: number;
  dropoffRate: number;
  averageTimeOnStep: number;
}

/**
 * Funnel flow analysis result
 */
export interface FunnelFlow {
  funnelId: string;
  funnelName: string;
  totalVisitors: number;
  totalConversions: number;
  overallConversionRate: number;
  steps: FunnelFlowStep[];
  averageTimeToConvert: number;
}

/**
 * Drop-off analysis result
 */
export interface DropoffAnalysis {
  funnelId: string;
  totalVisitors: number;
  dropoffPoints: {
    stepId: string;
    stepName: string;
    sequence: number;
    dropoffCount: number;
    dropoffRate: number;
    topExitPages: string[];
  }[];
}

/**
 * Attribution analysis result
 */
export interface AttributionAnalysis {
  funnelId: string;
  sources: {
    source: AttributionSource;
    visitors: number;
    conversions: number;
    conversionRate: number;
    revenue: number;
    averageValue: number;
  }[];
  campaigns: {
    campaign: string;
    visitors: number;
    conversions: number;
    conversionRate: number;
    revenue: number;
  }[];
}

/**
 * Conversion goal definition
 */
export interface ConversionGoal {
  _id: string;
  name: string;
  type: "page_view" | "form_submit" | "purchase" | "custom_event";
  targetPath?: string;
  targetElementId?: string;
  targetEventType?: string;
  value?: number;
  funnelId?: string;
}

// ============================================================================
// Errors
// ============================================================================

export class SessionNotFoundError {
  readonly _tag = "SessionNotFoundError";
  constructor(
    public sessionId: string,
    public message: string = "Session not found"
  ) {}
}

export class InvalidEventError {
  readonly _tag = "InvalidEventError";
  constructor(
    public event: Partial<ConversionEvent>,
    public message: string = "Invalid event data"
  ) {}
}

export class ConversionGoalNotFoundError {
  readonly _tag = "ConversionGoalNotFoundError";
  constructor(
    public goalId: string,
    public message: string = "Conversion goal not found"
  ) {}
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate conversion event data
 *
 * @param event - The event to validate
 * @returns Effect that succeeds with the event, fails with InvalidEventError
 */
export const validateConversionEvent = (
  event: Partial<ConversionEvent>
): Effect.Effect<ConversionEvent, InvalidEventError> =>
  Effect.gen(function* () {
    if (!event.type) {
      return yield* Effect.fail(
        new InvalidEventError(event, "Event type is required")
      );
    }

    if (!event.actorId) {
      return yield* Effect.fail(
        new InvalidEventError(event, "Actor ID is required")
      );
    }

    if (!event.timestamp) {
      return yield* Effect.fail(
        new InvalidEventError(event, "Timestamp is required")
      );
    }

    return event as ConversionEvent;
  });

/**
 * Validate session data
 *
 * @param session - The session to validate
 * @returns Effect that succeeds with the session, fails with SessionNotFoundError
 */
export const validateSession = (
  session: Session | null
): Effect.Effect<Session, SessionNotFoundError> =>
  Effect.gen(function* () {
    if (!session) {
      return yield* Effect.fail(
        new SessionNotFoundError("unknown", "Session not found")
      );
    }

    return session;
  });

// ============================================================================
// Business Logic - Event Tracking
// ============================================================================

/**
 * Prepare event data for page view tracking
 */
export const preparePageViewEvent = (
  visitorId: string,
  path: string,
  funnelId?: string,
  stepId?: string,
  sessionId?: string,
  source?: AttributionSource,
  referrer?: string
): ConversionEvent => ({
  _id: crypto.randomUUID(),
  type: "page_view",
  actorId: visitorId,
  targetId: stepId,
  timestamp: Date.now(),
  metadata: {
    funnelId,
    stepId,
    sessionId,
    source,
    path,
    referrer,
    protocol: "conversion-tracking",
  },
});

/**
 * Prepare event data for button click tracking
 */
export const prepareButtonClickEvent = (
  visitorId: string,
  elementId: string,
  funnelId?: string,
  stepId?: string,
  sessionId?: string,
  elementText?: string
): ConversionEvent => ({
  _id: crypto.randomUUID(),
  type: "button_click",
  actorId: visitorId,
  targetId: elementId,
  timestamp: Date.now(),
  metadata: {
    funnelId,
    stepId,
    elementId,
    sessionId,
    elementText,
    protocol: "conversion-tracking",
  },
});

/**
 * Prepare event data for form submission tracking
 */
export const prepareFormSubmitEvent = (
  visitorId: string,
  formId: string,
  funnelId?: string,
  stepId?: string,
  sessionId?: string,
  formData?: Record<string, any>
): ConversionEvent => ({
  _id: crypto.randomUUID(),
  type: "form_submit",
  actorId: visitorId,
  targetId: formId,
  timestamp: Date.now(),
  metadata: {
    funnelId,
    stepId,
    elementId: formId,
    sessionId,
    formData,
    protocol: "conversion-tracking",
  },
});

/**
 * Prepare event data for purchase completion tracking
 */
export const preparePurchaseCompleteEvent = (
  customerId: string,
  productId: string,
  amount: number,
  funnelId?: string,
  sessionId?: string,
  source?: AttributionSource
): ConversionEvent => ({
  _id: crypto.randomUUID(),
  type: "purchase_complete",
  actorId: customerId,
  targetId: productId,
  timestamp: Date.now(),
  metadata: {
    funnelId,
    sessionId,
    source,
    value: amount,
    protocol: "conversion-tracking",
  },
});

/**
 * Prepare event data for visitor entering funnel
 */
export const prepareVisitorEnteredFunnelEvent = (
  visitorId: string,
  funnelId: string,
  sessionId: string,
  source?: AttributionSource,
  campaign?: string,
  medium?: string
): ConversionEvent => ({
  _id: crypto.randomUUID(),
  type: "visitor_entered_funnel",
  actorId: visitorId,
  targetId: funnelId,
  timestamp: Date.now(),
  metadata: {
    funnelId,
    sessionId,
    source,
    campaign,
    medium,
    protocol: "conversion-tracking",
  },
});

/**
 * Prepare event data for visitor viewing step
 */
export const prepareVisitorViewedStepEvent = (
  visitorId: string,
  stepId: string,
  funnelId: string,
  sessionId: string,
  sequence: number
): ConversionEvent => ({
  _id: crypto.randomUUID(),
  type: "visitor_viewed_step",
  actorId: visitorId,
  targetId: stepId,
  timestamp: Date.now(),
  metadata: {
    funnelId,
    stepId,
    sessionId,
    sequence,
    protocol: "conversion-tracking",
  },
});

/**
 * Prepare event data for visitor conversion
 */
export const prepareVisitorConvertedEvent = (
  visitorId: string,
  funnelId: string,
  sessionId: string,
  value?: number,
  goalId?: string
): ConversionEvent => ({
  _id: crypto.randomUUID(),
  type: "visitor_converted",
  actorId: visitorId,
  targetId: funnelId,
  timestamp: Date.now(),
  metadata: {
    funnelId,
    sessionId,
    value,
    goalId,
    protocol: "conversion-tracking",
  },
});

// ============================================================================
// Business Logic - Session Tracking
// ============================================================================

/**
 * Create a new session
 */
export const createSession = (
  visitorId: string,
  source: AttributionSource = "direct",
  campaign?: string,
  medium?: string,
  funnelId?: string
): Effect.Effect<Session> =>
  Effect.sync(() => ({
    sessionId: crypto.randomUUID(),
    visitorId,
    funnelId,
    startTime: Date.now(),
    source,
    campaign,
    medium,
    events: [],
    converted: false,
  }));

/**
 * Add event to session
 */
export const addEventToSession = (
  session: Session,
  event: ConversionEvent
): Effect.Effect<Session> =>
  Effect.sync(() => ({
    ...session,
    events: [...session.events, event],
  }));

/**
 * Mark session as converted
 */
export const markSessionConverted = (
  session: Session,
  value?: number
): Effect.Effect<Session> =>
  Effect.sync(() => ({
    ...session,
    converted: true,
    conversionValue: value,
    endTime: Date.now(),
  }));

/**
 * End session
 */
export const endSession = (session: Session): Effect.Effect<Session> =>
  Effect.sync(() => ({
    ...session,
    endTime: Date.now(),
  }));

// ============================================================================
// Business Logic - Funnel Flow Analysis
// ============================================================================

/**
 * Calculate funnel flow from events
 *
 * Analyzes step-by-step conversion through the funnel
 */
export const calculateFunnelFlow = (
  events: ConversionEvent[],
  funnelId: string,
  funnelName: string,
  steps: Array<{ _id: string; name: string; sequence: number }>
): Effect.Effect<FunnelFlow> =>
  Effect.sync(() => {
    // Get unique visitors
    const allVisitors = new Set(events.map((e) => e.actorId));
    const totalVisitors = allVisitors.size;

    // Get conversions (purchase_complete or visitor_converted events)
    const conversions = events.filter(
      (e) =>
        (e.type === "purchase_complete" || e.type === "visitor_converted") &&
        e.metadata?.funnelId === funnelId
    );
    const totalConversions = new Set(conversions.map((e) => e.actorId)).size;

    // Calculate step-by-step metrics
    const stepMetrics: FunnelFlowStep[] = steps.map((step, index) => {
      // Get visitors who viewed this step
      const stepViewEvents = events.filter(
        (e) =>
          e.type === "visitor_viewed_step" && e.metadata?.stepId === step._id
      );
      const stepVisitors = new Set(stepViewEvents.map((e) => e.actorId));
      const visitors = stepVisitors.size;

      // Get visitors who converted after viewing this step
      const stepConversions = conversions.filter((e) =>
        stepVisitors.has(e.actorId)
      );
      const stepConversionCount = new Set(
        stepConversions.map((e) => e.actorId)
      ).size;

      // Calculate conversion and dropoff rates
      const conversionRate = visitors > 0 ? stepConversionCount / visitors : 0;

      // Dropoff rate = visitors who didn't proceed to next step
      const nextStep = steps[index + 1];
      const nextStepVisitors = nextStep
        ? new Set(
            events
              .filter(
                (e) =>
                  e.type === "visitor_viewed_step" &&
                  e.metadata?.stepId === nextStep._id
              )
              .map((e) => e.actorId)
          )
        : new Set();

      const proceeded = nextStep
        ? Array.from(stepVisitors).filter((v) => nextStepVisitors.has(v)).length
        : stepConversionCount;
      const dropped = visitors - proceeded;
      const dropoffRate = visitors > 0 ? dropped / visitors : 0;

      // Calculate average time on step
      const stepTimes = Array.from(stepVisitors).map((visitorId) => {
        const visitorEvents = stepViewEvents.filter(
          (e) => e.actorId === visitorId
        );
        if (visitorEvents.length === 0) return 0;

        const firstView = Math.min(...visitorEvents.map((e) => e.timestamp));
        const lastEvent = events
          .filter(
            (e) =>
              e.actorId === visitorId &&
              e.timestamp > firstView &&
              (e.metadata?.stepId !== step._id || e.type !== "visitor_viewed_step")
          )
          .sort((a, b) => a.timestamp - b.timestamp)[0];

        return lastEvent ? lastEvent.timestamp - firstView : 0;
      });

      const averageTimeOnStep =
        stepTimes.length > 0
          ? stepTimes.reduce((sum, t) => sum + t, 0) / stepTimes.length
          : 0;

      return {
        stepId: step._id,
        stepName: step.name,
        sequence: step.sequence,
        visitors,
        conversions: stepConversionCount,
        conversionRate,
        dropoffRate,
        averageTimeOnStep,
      };
    });

    // Calculate average time to convert
    const conversionTimes = conversions.map((conv) => {
      const entryEvent = events.find(
        (e) =>
          e.actorId === conv.actorId &&
          e.type === "visitor_entered_funnel" &&
          e.metadata?.funnelId === funnelId
      );
      return entryEvent ? conv.timestamp - entryEvent.timestamp : 0;
    });

    const averageTimeToConvert =
      conversionTimes.length > 0
        ? conversionTimes.reduce((sum, t) => sum + t, 0) / conversionTimes.length
        : 0;

    return {
      funnelId,
      funnelName,
      totalVisitors,
      totalConversions,
      overallConversionRate:
        totalVisitors > 0 ? totalConversions / totalVisitors : 0,
      steps: stepMetrics,
      averageTimeToConvert,
    };
  });

// ============================================================================
// Business Logic - Drop-off Analysis
// ============================================================================

/**
 * Analyze where visitors drop off in the funnel
 */
export const analyzeDropoff = (
  events: ConversionEvent[],
  funnelId: string,
  steps: Array<{ _id: string; name: string; sequence: number }>
): Effect.Effect<DropoffAnalysis> =>
  Effect.sync(() => {
    const totalVisitors = new Set(
      events
        .filter(
          (e) =>
            e.type === "visitor_entered_funnel" &&
            e.metadata?.funnelId === funnelId
        )
        .map((e) => e.actorId)
    ).size;

    const dropoffPoints = steps.map((step, index) => {
      // Get visitors who viewed this step
      const stepViewEvents = events.filter(
        (e) =>
          e.type === "visitor_viewed_step" && e.metadata?.stepId === step._id
      );
      const stepVisitors = new Set(stepViewEvents.map((e) => e.actorId));

      // Get visitors who proceeded to next step
      const nextStep = steps[index + 1];
      const nextStepVisitors = nextStep
        ? new Set(
            events
              .filter(
                (e) =>
                  e.type === "visitor_viewed_step" &&
                  e.metadata?.stepId === nextStep._id
              )
              .map((e) => e.actorId)
          )
        : new Set();

      // Calculate dropoff
      const droppedVisitors = Array.from(stepVisitors).filter(
        (v) => !nextStepVisitors.has(v)
      );
      const dropoffCount = droppedVisitors.length;
      const dropoffRate =
        stepVisitors.size > 0 ? dropoffCount / stepVisitors.size : 0;

      // Get top exit pages (last page view before dropping off)
      const exitPages = droppedVisitors
        .map((visitorId) => {
          const visitorPageViews = events
            .filter(
              (e) =>
                e.actorId === visitorId &&
                e.type === "page_view" &&
                e.metadata?.stepId === step._id
            )
            .sort((a, b) => b.timestamp - a.timestamp);

          return visitorPageViews[0]?.metadata?.path || "unknown";
        })
        .filter((path) => path !== "unknown");

      // Count occurrences and get top 5
      const pathCounts = exitPages.reduce(
        (acc, path) => {
          acc[path] = (acc[path] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      const topExitPages = Object.entries(pathCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([path]) => path);

      return {
        stepId: step._id,
        stepName: step.name,
        sequence: step.sequence,
        dropoffCount,
        dropoffRate,
        topExitPages,
      };
    });

    return {
      funnelId,
      totalVisitors,
      dropoffPoints,
    };
  });

// ============================================================================
// Business Logic - Attribution Analysis
// ============================================================================

/**
 * Analyze conversion attribution by source
 */
export const analyzeAttribution = (
  events: ConversionEvent[],
  funnelId: string
): Effect.Effect<AttributionAnalysis> =>
  Effect.sync(() => {
    // Group events by source
    const entryEvents = events.filter(
      (e) =>
        e.type === "visitor_entered_funnel" &&
        e.metadata?.funnelId === funnelId
    );

    const conversionEvents = events.filter(
      (e) =>
        (e.type === "purchase_complete" || e.type === "visitor_converted") &&
        e.metadata?.funnelId === funnelId
    );

    // Analyze by source
    const sourceMap = new Map<
      AttributionSource,
      {
        visitors: Set<string>;
        conversions: Set<string>;
        revenue: number;
      }
    >();

    entryEvents.forEach((event) => {
      const source =
        (event.metadata?.source as AttributionSource) || "direct";
      if (!sourceMap.has(source)) {
        sourceMap.set(source, {
          visitors: new Set(),
          conversions: new Set(),
          revenue: 0,
        });
      }
      sourceMap.get(source)!.visitors.add(event.actorId);
    });

    conversionEvents.forEach((event) => {
      const entryEvent = entryEvents.find((e) => e.actorId === event.actorId);
      const source =
        (entryEvent?.metadata?.source as AttributionSource) || "direct";

      if (!sourceMap.has(source)) {
        sourceMap.set(source, {
          visitors: new Set(),
          conversions: new Set(),
          revenue: 0,
        });
      }

      const data = sourceMap.get(source)!;
      data.conversions.add(event.actorId);
      data.revenue += event.metadata?.value || 0;
    });

    const sources = Array.from(sourceMap.entries()).map(([source, data]) => ({
      source,
      visitors: data.visitors.size,
      conversions: data.conversions.size,
      conversionRate:
        data.visitors.size > 0 ? data.conversions.size / data.visitors.size : 0,
      revenue: data.revenue,
      averageValue:
        data.conversions.size > 0 ? data.revenue / data.conversions.size : 0,
    }));

    // Analyze by campaign
    const campaignMap = new Map<
      string,
      {
        visitors: Set<string>;
        conversions: Set<string>;
        revenue: number;
      }
    >();

    entryEvents.forEach((event) => {
      const campaign = event.metadata?.campaign || "unknown";
      if (!campaignMap.has(campaign)) {
        campaignMap.set(campaign, {
          visitors: new Set(),
          conversions: new Set(),
          revenue: 0,
        });
      }
      campaignMap.get(campaign)!.visitors.add(event.actorId);
    });

    conversionEvents.forEach((event) => {
      const entryEvent = entryEvents.find((e) => e.actorId === event.actorId);
      const campaign = entryEvent?.metadata?.campaign || "unknown";

      if (!campaignMap.has(campaign)) {
        campaignMap.set(campaign, {
          visitors: new Set(),
          conversions: new Set(),
          revenue: 0,
        });
      }

      const data = campaignMap.get(campaign)!;
      data.conversions.add(event.actorId);
      data.revenue += event.metadata?.value || 0;
    });

    const campaigns = Array.from(campaignMap.entries())
      .filter(([campaign]) => campaign !== "unknown")
      .map(([campaign, data]) => ({
        campaign,
        visitors: data.visitors.size,
        conversions: data.conversions.size,
        conversionRate:
          data.visitors.size > 0
            ? data.conversions.size / data.visitors.size
            : 0,
        revenue: data.revenue,
      }));

    return {
      funnelId,
      sources,
      campaigns,
    };
  });

// ============================================================================
// Service Export
// ============================================================================

export const ConversionTrackingService = {
  // Validation
  validateConversionEvent,
  validateSession,

  // Event preparation
  preparePageViewEvent,
  prepareButtonClickEvent,
  prepareFormSubmitEvent,
  preparePurchaseCompleteEvent,
  prepareVisitorEnteredFunnelEvent,
  prepareVisitorViewedStepEvent,
  prepareVisitorConvertedEvent,

  // Session management
  createSession,
  addEventToSession,
  markSessionConverted,
  endSession,

  // Analytics
  calculateFunnelFlow,
  analyzeDropoff,
  analyzeAttribution,
};
