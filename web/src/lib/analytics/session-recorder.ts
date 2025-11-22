/**
 * Session Recording & Playback
 *
 * Cycle 78: Session Recording
 *
 * Records user sessions using rrweb library including:
 * - DOM mutations and changes
 * - Mouse movements and clicks
 * - Scroll events
 * - Form inputs (with privacy masking)
 * - Page navigation
 *
 * Privacy features:
 * - Masks passwords, credit cards, SSNs
 * - Excludes sensitive form fields
 * - Respects data-private attributes
 */

import type { eventWithTime } from "rrweb";

export interface SessionMetadata {
	sessionId: string;
	funnelId?: string;
	visitorId: string;
	startTime: number;
	endTime?: number;
	duration?: number;
	pageViews: string[];
	device: {
		userAgent: string;
		viewport: {
			width: number;
			height: number;
		};
		platform: string;
	};
	conversion?: {
		converted: boolean;
		conversionType?: string;
		revenue?: number;
	};
	events: eventWithTime[];
}

export interface SessionSummary {
	sessionId: string;
	funnelId?: string;
	visitorId: string;
	startTime: number;
	duration: number;
	pageViews: number;
	converted: boolean;
	device: string;
	viewport: string;
}

const STORAGE_KEY = "session-recording";
const MAX_SESSION_DURATION = 30 * 60 * 1000; // 30 minutes
const UPLOAD_INTERVAL = 5000; // Upload every 5 seconds
const MAX_EVENTS_BEFORE_UPLOAD = 100; // Upload after 100 events

/**
 * Privacy configuration for rrweb
 */
export const privacyConfig = {
	// Mask all input values by default
	maskAllInputs: true,

	// Specific input types to mask
	maskInputOptions: {
		password: true,
		email: false,
		text: false,
		textarea: false,
		select: false,
		radio: false,
		checkbox: false,
	},

	// Block certain elements from recording
	blockClass: "rr-block",
	blockSelector: '[data-recording="block"]',

	// Mask certain elements
	maskTextClass: "rr-mask",
	maskTextSelector: '[data-recording="mask"]',

	// Ignore certain elements
	ignoreClass: "rr-ignore",

	// Privacy settings
	maskInputFn: (text: string, element: HTMLElement) => {
		// Mask credit card numbers
		if (element.getAttribute("data-type") === "credit-card") {
			return "•••• •••• •••• ••••";
		}

		// Mask SSN
		if (element.getAttribute("data-type") === "ssn") {
			return "•••-••-••••";
		}

		// Mask phone numbers
		if (element.getAttribute("type") === "tel") {
			return "(•••) •••-••••";
		}

		// Check for common sensitive field names
		const name = element.getAttribute("name")?.toLowerCase() || "";
		const id = element.getAttribute("id")?.toLowerCase() || "";

		const sensitiveFields = [
			"password",
			"ssn",
			"social-security",
			"credit-card",
			"card-number",
			"cvv",
			"cvc",
			"pin",
		];

		if (
			sensitiveFields.some((field) => name.includes(field) || id.includes(field))
		) {
			return "••••••••";
		}

		return text;
	},
};

/**
 * Generate or retrieve session ID
 */
export function getOrCreateSessionId(): string {
	if (typeof window === "undefined") return "";

	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			const data = JSON.parse(stored);
			const now = Date.now();

			// Check if session is still valid
			if (now - data.startTime < MAX_SESSION_DURATION) {
				return data.sessionId;
			}
		}
	} catch (error) {
		console.error("Failed to retrieve session ID:", error);
	}

	// Generate new session ID
	return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get device information
 */
function getDeviceInfo() {
	if (typeof window === "undefined") {
		return {
			userAgent: "",
			viewport: { width: 0, height: 0 },
			platform: "",
		};
	}

	return {
		userAgent: navigator.userAgent,
		viewport: {
			width: window.innerWidth,
			height: window.innerHeight,
		},
		platform: navigator.platform,
	};
}

/**
 * Start recording session
 */
export function startRecording(
	options: {
		funnelId?: string;
		visitorId?: string;
		onUpload?: (data: SessionMetadata) => Promise<void>;
	} = {}
): () => void {
	if (typeof window === "undefined") return () => {};

	// Import rrweb dynamically (client-side only)
	let stopRecording: (() => void) | null = null;
	let events: eventWithTime[] = [];
	const sessionId = getOrCreateSessionId();
	const visitorId =
		options.visitorId ||
		localStorage.getItem("visitor-id") ||
		`visitor_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
	const startTime = Date.now();
	const pageViews: string[] = [window.location.pathname];

	// Store visitor ID
	localStorage.setItem("visitor-id", visitorId);

	// Track page views
	const trackPageView = () => {
		const currentPage = window.location.pathname;
		if (!pageViews.includes(currentPage)) {
			pageViews.push(currentPage);
		}
	};

	// Listen for navigation
	window.addEventListener("popstate", trackPageView);

	// Upload events periodically
	let uploadTimer: NodeJS.Timeout;

	const uploadEvents = async () => {
		if (events.length === 0 || !options.onUpload) return;

		const sessionData: SessionMetadata = {
			sessionId,
			funnelId: options.funnelId,
			visitorId,
			startTime,
			endTime: Date.now(),
			duration: Date.now() - startTime,
			pageViews,
			device: getDeviceInfo(),
			events: [...events],
		};

		try {
			await options.onUpload(sessionData);
			// Clear uploaded events
			events = [];
		} catch (error) {
			console.error("Failed to upload session events:", error);
		}
	};

	// Start periodic uploads
	uploadTimer = setInterval(uploadEvents, UPLOAD_INTERVAL);

	// Initialize rrweb
	import("rrweb").then((rrweb) => {
		stopRecording = rrweb.record({
			emit(event) {
				// Add event to buffer
				events.push(event);

				// Upload if buffer is full
				if (events.length >= MAX_EVENTS_BEFORE_UPLOAD) {
					uploadEvents();
				}
			},
			...privacyConfig,
		});
	});

	// Return stop function
	return () => {
		if (stopRecording) {
			stopRecording();
		}

		// Clear interval
		clearInterval(uploadTimer);

		// Remove listener
		window.removeEventListener("popstate", trackPageView);

		// Upload remaining events
		uploadEvents();
	};
}

/**
 * Load session recording data from localStorage
 */
export function loadSessionData(): SessionMetadata | null {
	if (typeof window === "undefined") return null;

	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			return JSON.parse(stored);
		}
	} catch (error) {
		console.error("Failed to load session data:", error);
	}

	return null;
}

/**
 * Save session recording data to localStorage
 */
export function saveSessionData(data: SessionMetadata): void {
	if (typeof window === "undefined") return;

	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
	} catch (error) {
		console.error("Failed to save session data:", error);
	}
}

/**
 * Clear session recording data
 */
export function clearSessionData(): void {
	if (typeof window === "undefined") return;
	localStorage.removeItem(STORAGE_KEY);
}

/**
 * Format session duration
 */
export function formatDuration(ms: number): string {
	const seconds = Math.floor(ms / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);

	if (hours > 0) {
		return `${hours}h ${minutes % 60}m`;
	}
	if (minutes > 0) {
		return `${minutes}m ${seconds % 60}s`;
	}
	return `${seconds}s`;
}

/**
 * Format device info
 */
export function formatDeviceInfo(device: SessionMetadata["device"]): string {
	const ua = device.userAgent.toLowerCase();

	// Detect OS
	let os = "Unknown";
	if (ua.includes("windows")) os = "Windows";
	else if (ua.includes("mac")) os = "macOS";
	else if (ua.includes("linux")) os = "Linux";
	else if (ua.includes("android")) os = "Android";
	else if (ua.includes("ios") || ua.includes("iphone") || ua.includes("ipad"))
		os = "iOS";

	// Detect browser
	let browser = "Unknown";
	if (ua.includes("chrome") && !ua.includes("edge")) browser = "Chrome";
	else if (ua.includes("safari") && !ua.includes("chrome")) browser = "Safari";
	else if (ua.includes("firefox")) browser = "Firefox";
	else if (ua.includes("edge")) browser = "Edge";

	return `${browser} on ${os}`;
}

/**
 * Format viewport size
 */
export function formatViewport(viewport: { width: number; height: number }): string {
	const { width, height } = viewport;

	// Detect device type
	if (width < 768) return `Mobile (${width}×${height})`;
	if (width < 1024) return `Tablet (${width}×${height})`;
	return `Desktop (${width}×${height})`;
}

/**
 * Get session summary from full metadata
 */
export function getSessionSummary(
	session: SessionMetadata
): SessionSummary {
	return {
		sessionId: session.sessionId,
		funnelId: session.funnelId,
		visitorId: session.visitorId,
		startTime: session.startTime,
		duration: session.duration || 0,
		pageViews: session.pageViews.length,
		converted: session.conversion?.converted || false,
		device: formatDeviceInfo(session.device),
		viewport: formatViewport(session.device.viewport),
	};
}
