/**
 * Event Logger for Auth Operations
 *
 * Logs authentication events to the events dimension for monitoring and audit trails.
 * Maps to the 6-dimension ontology: events dimension tracks all auth actions.
 */

import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(
	import.meta.env.PUBLIC_CONVEX_URL || import.meta.env.NEXT_PUBLIC_CONVEX_URL
);

/**
 * Event types for authentication operations
 */
export const AUTH_EVENT_TYPES = {
	RATE_LIMIT_EXCEEDED: "rate_limit_exceeded",
	SIGN_IN_ATTEMPT: "sign_in_attempt",
	SIGN_IN_SUCCESS: "sign_in_success",
	SIGN_IN_FAILED: "sign_in_failed",
	SIGN_UP_ATTEMPT: "sign_up_attempt",
	SIGN_UP_SUCCESS: "sign_up_success",
	SIGN_UP_FAILED: "sign_up_failed",
	PASSWORD_RESET_REQUESTED: "password_reset_requested",
	PASSWORD_RESET_COMPLETED: "password_reset_completed",
	PASSWORD_RESET_FAILED: "password_reset_failed",
} as const;

export type AuthEventType =
	(typeof AUTH_EVENT_TYPES)[keyof typeof AUTH_EVENT_TYPES];

interface LogEventParams {
	type: AuthEventType;
	metadata: {
		email?: string;
		ipAddress?: string;
		userAgent?: string;
		endpoint?: string;
		reason?: string;
		resetAt?: number;
		retryAfter?: number;
		[key: string]: any;
	};
	actorId?: string;
	targetId?: string;
}

/**
 * Log an authentication event
 *
 * This creates an event in the events dimension following the 6-dimension ontology.
 * Events provide a complete audit trail of all authentication actions.
 */
export async function logAuthEvent(params: LogEventParams): Promise<void> {
	const { type, metadata, actorId, targetId } = params;

	try {
		// In a production implementation, this would call a Convex mutation
		// For now, log to console and prepare the event structure
		const event = {
			type,
			actorId: actorId || "system",
			targetId: targetId || null,
			timestamp: Date.now(),
			metadata: {
				...metadata,
				source: "auth_api",
				environment: import.meta.env.PROD ? "production" : "development",
			},
		};

		// TODO: Call Convex mutation when backend is ready
		// await convex.mutation("events:create", event);

		// For now, log to console for debugging
		console.log("[Auth Event]", event);
	} catch (error) {
		console.error("Failed to log auth event:", error);
		// Don't throw - logging failures shouldn't break auth flow
	}
}

/**
 * Log rate limit violation
 */
export async function logRateLimitViolation(params: {
	endpoint: string;
	ipAddress: string;
	email?: string;
	userAgent?: string;
	resetAt: number;
	retryAfter?: number;
}): Promise<void> {
	await logAuthEvent({
		type: AUTH_EVENT_TYPES.RATE_LIMIT_EXCEEDED,
		metadata: {
			endpoint: params.endpoint,
			ipAddress: params.ipAddress,
			email: params.email,
			userAgent: params.userAgent,
			resetAt: params.resetAt,
			retryAfter: params.retryAfter,
			reason: "Rate limit exceeded",
		},
	});
}

/**
 * Log sign-in attempt
 */
export async function logSignInAttempt(params: {
	email: string;
	ipAddress: string;
	userAgent?: string;
	success: boolean;
	reason?: string;
	userId?: string;
}): Promise<void> {
	await logAuthEvent({
		type: params.success
			? AUTH_EVENT_TYPES.SIGN_IN_SUCCESS
			: AUTH_EVENT_TYPES.SIGN_IN_FAILED,
		metadata: {
			email: params.email,
			ipAddress: params.ipAddress,
			userAgent: params.userAgent,
			reason: params.reason,
		},
		actorId: params.userId,
	});
}

/**
 * Log sign-up attempt
 */
export async function logSignUpAttempt(params: {
	email: string;
	ipAddress: string;
	userAgent?: string;
	success: boolean;
	reason?: string;
	userId?: string;
}): Promise<void> {
	await logAuthEvent({
		type: params.success
			? AUTH_EVENT_TYPES.SIGN_UP_SUCCESS
			: AUTH_EVENT_TYPES.SIGN_UP_FAILED,
		metadata: {
			email: params.email,
			ipAddress: params.ipAddress,
			userAgent: params.userAgent,
			reason: params.reason,
		},
		actorId: params.userId,
	});
}

/**
 * Log password reset request
 */
export async function logPasswordResetRequest(params: {
	email: string;
	ipAddress: string;
	userAgent?: string;
	success: boolean;
	reason?: string;
}): Promise<void> {
	await logAuthEvent({
		type: params.success
			? AUTH_EVENT_TYPES.PASSWORD_RESET_REQUESTED
			: AUTH_EVENT_TYPES.PASSWORD_RESET_FAILED,
		metadata: {
			email: params.email,
			ipAddress: params.ipAddress,
			userAgent: params.userAgent,
			reason: params.reason,
		},
	});
}
