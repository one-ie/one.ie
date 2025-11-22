/**
 * UTM Tracking & Traffic Source Attribution
 *
 * Cycle 73: Traffic Source Tracking
 *
 * Captures and persists visitor traffic source data including:
 * - UTM parameters (source, medium, campaign, content, term)
 * - Referrer tracking (document.referrer)
 * - Traffic source categorization
 * - Session and conversion attribution
 *
 * Data stored in localStorage and event metadata for analytics.
 */

export interface UTMParameters {
	utm_source?: string;
	utm_medium?: string;
	utm_campaign?: string;
	utm_content?: string;
	utm_term?: string;
}

export type TrafficSourceType =
	| "organic"
	| "paid"
	| "email"
	| "social"
	| "direct"
	| "referral";

export interface TrafficSource {
	type: TrafficSourceType;
	source: string;
	medium: string;
	campaign?: string;
	content?: string;
	term?: string;
	referrer?: string;
	landingPage: string;
	timestamp: number;
	sessionId: string;
}

export interface TrafficSourceStorage {
	current: TrafficSource | null;
	history: TrafficSource[];
	sessionId: string;
	firstVisit: number;
	lastVisit: number;
}

const STORAGE_KEY = "traffic-source";
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

/**
 * Parse UTM parameters from URL search params
 */
export function parseUTMParameters(searchParams: URLSearchParams): UTMParameters {
	return {
		utm_source: searchParams.get("utm_source") || undefined,
		utm_medium: searchParams.get("utm_medium") || undefined,
		utm_campaign: searchParams.get("utm_campaign") || undefined,
		utm_content: searchParams.get("utm_content") || undefined,
		utm_term: searchParams.get("utm_term") || undefined,
	};
}

/**
 * Categorize traffic source based on UTM parameters and referrer
 */
export function categorizeTrafficSource(
	utm: UTMParameters,
	referrer: string
): TrafficSourceType {
	// UTM medium takes precedence
	if (utm.utm_medium) {
		const medium = utm.utm_medium.toLowerCase();
		if (medium.includes("cpc") || medium.includes("ppc") || medium.includes("paid")) {
			return "paid";
		}
		if (medium === "email") {
			return "email";
		}
		if (medium.includes("social")) {
			return "social";
		}
		if (medium === "organic") {
			return "organic";
		}
		if (medium === "referral") {
			return "referral";
		}
	}

	// Analyze referrer
	if (referrer) {
		const hostname = new URL(referrer).hostname.toLowerCase();

		// Search engines
		if (
			hostname.includes("google") ||
			hostname.includes("bing") ||
			hostname.includes("yahoo") ||
			hostname.includes("duckduckgo")
		) {
			return "organic";
		}

		// Social media
		if (
			hostname.includes("facebook") ||
			hostname.includes("twitter") ||
			hostname.includes("linkedin") ||
			hostname.includes("instagram") ||
			hostname.includes("tiktok") ||
			hostname.includes("youtube")
		) {
			return "social";
		}

		// Email providers
		if (hostname.includes("mail") || hostname.includes("gmail")) {
			return "email";
		}

		// Other referrers
		return "referral";
	}

	// No UTM or referrer = direct traffic
	return "direct";
}

/**
 * Generate or retrieve session ID
 */
function getOrCreateSessionId(): string {
	if (typeof window === "undefined") return "";

	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			const data = JSON.parse(stored) as TrafficSourceStorage;
			const now = Date.now();

			// Check if session is still valid
			if (now - data.lastVisit < SESSION_TIMEOUT) {
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
 * Load traffic source data from localStorage
 */
function loadTrafficSourceData(): TrafficSourceStorage {
	if (typeof window === "undefined") {
		return {
			current: null,
			history: [],
			sessionId: "",
			firstVisit: Date.now(),
			lastVisit: Date.now(),
		};
	}

	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			return JSON.parse(stored);
		}
	} catch (error) {
		console.error("Failed to load traffic source data:", error);
	}

	return {
		current: null,
		history: [],
		sessionId: getOrCreateSessionId(),
		firstVisit: Date.now(),
		lastVisit: Date.now(),
	};
}

/**
 * Save traffic source data to localStorage
 */
function saveTrafficSourceData(data: TrafficSourceStorage): void {
	if (typeof window === "undefined") return;

	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
	} catch (error) {
		console.error("Failed to save traffic source data:", error);
	}
}

/**
 * Track current page visit with UTM parameters and referrer
 */
export function trackPageVisit(url?: string): TrafficSource | null {
	if (typeof window === "undefined") return null;

	const currentUrl = url || window.location.href;
	const searchParams = new URLSearchParams(window.location.search);
	const referrer = document.referrer;

	// Parse UTM parameters
	const utm = parseUTMParameters(searchParams);

	// Only track if there are UTM parameters or a referrer (skip direct navigation)
	const hasUTM = Object.values(utm).some((value) => value !== undefined);
	const hasReferrer = referrer && !referrer.includes(window.location.hostname);

	if (!hasUTM && !hasReferrer) {
		// Direct traffic - still track but don't override existing source
		const data = loadTrafficSourceData();
		if (data.current) {
			// Update last visit time
			data.lastVisit = Date.now();
			saveTrafficSourceData(data);
			return data.current;
		}
	}

	// Categorize traffic source
	const type = categorizeTrafficSource(utm, referrer);

	// Create traffic source object
	const trafficSource: TrafficSource = {
		type,
		source: utm.utm_source || getDomainFromUrl(referrer) || "direct",
		medium: utm.utm_medium || type,
		campaign: utm.utm_campaign,
		content: utm.utm_content,
		term: utm.utm_term,
		referrer: referrer || undefined,
		landingPage: currentUrl,
		timestamp: Date.now(),
		sessionId: getOrCreateSessionId(),
	};

	// Load existing data
	const data = loadTrafficSourceData();

	// Update storage
	const newData: TrafficSourceStorage = {
		current: trafficSource,
		history: [...data.history, trafficSource].slice(-50), // Keep last 50
		sessionId: trafficSource.sessionId,
		firstVisit: data.firstVisit || Date.now(),
		lastVisit: Date.now(),
	};

	saveTrafficSourceData(newData);

	return trafficSource;
}

/**
 * Get current traffic source
 */
export function getCurrentTrafficSource(): TrafficSource | null {
	const data = loadTrafficSourceData();
	return data.current;
}

/**
 * Get traffic source history
 */
export function getTrafficSourceHistory(): TrafficSource[] {
	const data = loadTrafficSourceData();
	return data.history;
}

/**
 * Get traffic source for event metadata
 */
export function getTrafficSourceMetadata(): Record<string, unknown> {
	const source = getCurrentTrafficSource();
	if (!source) return {};

	return {
		source: source.source,
		medium: source.medium,
		campaign: source.campaign,
		content: source.content,
		term: source.term,
		referrer: source.referrer,
		type: source.type,
		sessionId: source.sessionId,
	};
}

/**
 * Extract domain from URL
 */
function getDomainFromUrl(url: string): string | null {
	if (!url) return null;

	try {
		const hostname = new URL(url).hostname;
		// Remove www. prefix
		return hostname.replace(/^www\./, "");
	} catch (error) {
		return null;
	}
}

/**
 * Get traffic source breakdown by type
 */
export function getTrafficSourceBreakdown(): Record<
	TrafficSourceType,
	number
> {
	const history = getTrafficSourceHistory();

	const breakdown: Record<TrafficSourceType, number> = {
		organic: 0,
		paid: 0,
		email: 0,
		social: 0,
		direct: 0,
		referral: 0,
	};

	history.forEach((source) => {
		breakdown[source.type]++;
	});

	return breakdown;
}

/**
 * Get traffic sources grouped by source name
 */
export function getTrafficSourcesBySources(): Record<string, number> {
	const history = getTrafficSourceHistory();

	const sources: Record<string, number> = {};

	history.forEach((source) => {
		const sourceName = source.source;
		sources[sourceName] = (sources[sourceName] || 0) + 1;
	});

	return sources;
}

/**
 * Get traffic sources grouped by campaign
 */
export function getTrafficSourcesByCampaign(): Record<string, number> {
	const history = getTrafficSourceHistory();

	const campaigns: Record<string, number> = {};

	history.forEach((source) => {
		if (source.campaign) {
			campaigns[source.campaign] = (campaigns[source.campaign] || 0) + 1;
		}
	});

	return campaigns;
}

/**
 * Clear traffic source data (for testing/debugging)
 */
export function clearTrafficSourceData(): void {
	if (typeof window === "undefined") return;
	localStorage.removeItem(STORAGE_KEY);
}

/**
 * Initialize tracking on page load
 * Call this once in your app initialization
 */
export function initializeTrafficTracking(): void {
	if (typeof window === "undefined") return;

	// Track initial page visit
	trackPageVisit();

	// Track subsequent navigation (for SPAs)
	if (typeof window !== "undefined" && "navigation" in window) {
		// Modern navigation API
		// @ts-ignore - navigation API is experimental
		window.navigation?.addEventListener("navigate", () => {
			trackPageVisit();
		});
	}
}
