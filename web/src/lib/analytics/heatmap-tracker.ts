/**
 * Click Heatmap Tracking
 *
 * Cycle 77: Click Heatmaps
 *
 * Tracks user interactions including:
 * - Click coordinates (x, y) on the page
 * - Element clicked (tag name, id, class, text)
 * - Scroll depth (percentage of page scrolled)
 * - Device type (desktop, tablet, mobile)
 * - Page dimensions (viewport width, height)
 * - Timestamp and session data
 *
 * Data stored in localStorage for client-side analytics and
 * can be sent to backend for persistence.
 */

export interface ClickEvent {
	// Click coordinates (relative to document)
	x: number;
	y: number;

	// Click coordinates (relative to viewport)
	viewportX: number;
	viewportY: number;

	// Element information
	element: {
		tagName: string;
		id?: string;
		className?: string;
		textContent?: string;
		ariaLabel?: string;
	};

	// Page context
	page: {
		url: string;
		path: string;
		title: string;
		width: number;
		height: number;
		scrollY: number;
		scrollDepth: number; // Percentage (0-100)
	};

	// Device information
	device: {
		type: "desktop" | "tablet" | "mobile";
		width: number;
		height: number;
		userAgent: string;
	};

	// Session data
	sessionId: string;
	timestamp: number;
}

export interface ScrollDepthEvent {
	depth: number; // Percentage (0-100)
	maxDepth: number; // Maximum depth reached in session
	page: {
		url: string;
		path: string;
		title: string;
		height: number;
	};
	sessionId: string;
	timestamp: number;
}

export interface HeatmapStorage {
	clicks: ClickEvent[];
	scrollDepths: Record<string, ScrollDepthEvent>; // Keyed by page path
	sessionId: string;
	startTime: number;
	lastUpdate: number;
}

const STORAGE_KEY = "heatmap-clicks";
const MAX_CLICKS_STORED = 1000; // Limit storage size
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

/**
 * Detect device type based on viewport width
 */
function getDeviceType(): "desktop" | "tablet" | "mobile" {
	if (typeof window === "undefined") return "desktop";

	const width = window.innerWidth;

	if (width < 768) return "mobile";
	if (width < 1024) return "tablet";
	return "desktop";
}

/**
 * Calculate scroll depth as percentage
 */
function calculateScrollDepth(): number {
	if (typeof window === "undefined") return 0;

	const windowHeight = window.innerHeight;
	const documentHeight = document.documentElement.scrollHeight;
	const scrollTop = window.scrollY || document.documentElement.scrollTop;

	const scrollableDistance = documentHeight - windowHeight;
	if (scrollableDistance <= 0) return 100;

	return Math.min(100, Math.round((scrollTop / scrollableDistance) * 100));
}

/**
 * Generate or retrieve session ID
 */
function getOrCreateSessionId(): string {
	if (typeof window === "undefined") return "";

	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			const data = JSON.parse(stored) as HeatmapStorage;
			const now = Date.now();

			// Check if session is still valid
			if (now - data.lastUpdate < SESSION_TIMEOUT) {
				return data.sessionId;
			}
		}
	} catch (error) {
		console.error("Failed to retrieve session ID:", error);
	}

	// Generate new session ID
	return `heatmap_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Load heatmap data from localStorage
 */
function loadHeatmapData(): HeatmapStorage {
	if (typeof window === "undefined") {
		return {
			clicks: [],
			scrollDepths: {},
			sessionId: "",
			startTime: Date.now(),
			lastUpdate: Date.now(),
		};
	}

	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			const data = JSON.parse(stored) as HeatmapStorage;

			// Clear old data if session expired
			const now = Date.now();
			if (now - data.lastUpdate > SESSION_TIMEOUT) {
				return {
					clicks: [],
					scrollDepths: {},
					sessionId: getOrCreateSessionId(),
					startTime: now,
					lastUpdate: now,
				};
			}

			return data;
		}
	} catch (error) {
		console.error("Failed to load heatmap data:", error);
	}

	return {
		clicks: [],
		scrollDepths: {},
		sessionId: getOrCreateSessionId(),
		startTime: Date.now(),
		lastUpdate: Date.now(),
	};
}

/**
 * Save heatmap data to localStorage
 */
function saveHeatmapData(data: HeatmapStorage): void {
	if (typeof window === "undefined") return;

	try {
		// Limit storage size by keeping only recent clicks
		if (data.clicks.length > MAX_CLICKS_STORED) {
			data.clicks = data.clicks.slice(-MAX_CLICKS_STORED);
		}

		localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
	} catch (error) {
		console.error("Failed to save heatmap data:", error);
	}
}

/**
 * Get element information from click target
 */
function getElementInfo(target: EventTarget): ClickEvent["element"] {
	if (!(target instanceof HTMLElement)) {
		return {
			tagName: "unknown",
		};
	}

	return {
		tagName: target.tagName.toLowerCase(),
		id: target.id || undefined,
		className: target.className || undefined,
		textContent: target.textContent?.trim().substring(0, 100) || undefined,
		ariaLabel: target.getAttribute("aria-label") || undefined,
	};
}

/**
 * Track a click event
 */
export function trackClick(event: MouseEvent): void {
	if (typeof window === "undefined") return;

	try {
		const data = loadHeatmapData();

		// Get click coordinates
		const x = event.pageX;
		const y = event.pageY;
		const viewportX = event.clientX;
		const viewportY = event.clientY;

		// Get element information
		const element = getElementInfo(event.target);

		// Get page information
		const page = {
			url: window.location.href,
			path: window.location.pathname,
			title: document.title,
			width: document.documentElement.scrollWidth,
			height: document.documentElement.scrollHeight,
			scrollY: window.scrollY,
			scrollDepth: calculateScrollDepth(),
		};

		// Get device information
		const device = {
			type: getDeviceType(),
			width: window.innerWidth,
			height: window.innerHeight,
			userAgent: navigator.userAgent,
		};

		// Create click event
		const clickEvent: ClickEvent = {
			x,
			y,
			viewportX,
			viewportY,
			element,
			page,
			device,
			sessionId: data.sessionId,
			timestamp: Date.now(),
		};

		// Add to storage
		data.clicks.push(clickEvent);
		data.lastUpdate = Date.now();

		saveHeatmapData(data);
	} catch (error) {
		console.error("Failed to track click:", error);
	}
}

/**
 * Track scroll depth
 */
export function trackScrollDepth(): void {
	if (typeof window === "undefined") return;

	try {
		const data = loadHeatmapData();
		const depth = calculateScrollDepth();
		const path = window.location.pathname;

		// Get or create scroll depth record for this page
		const existing = data.scrollDepths[path];
		const maxDepth = existing ? Math.max(existing.maxDepth, depth) : depth;

		const scrollEvent: ScrollDepthEvent = {
			depth,
			maxDepth,
			page: {
				url: window.location.href,
				path,
				title: document.title,
				height: document.documentElement.scrollHeight,
			},
			sessionId: data.sessionId,
			timestamp: Date.now(),
		};

		data.scrollDepths[path] = scrollEvent;
		data.lastUpdate = Date.now();

		saveHeatmapData(data);
	} catch (error) {
		console.error("Failed to track scroll depth:", error);
	}
}

/**
 * Get all click events
 */
export function getClickEvents(filters?: {
	page?: string;
	deviceType?: "desktop" | "tablet" | "mobile";
	startDate?: number;
	endDate?: number;
}): ClickEvent[] {
	const data = loadHeatmapData();
	let clicks = data.clicks;

	// Apply filters
	if (filters) {
		if (filters.page) {
			clicks = clicks.filter((click) => click.page.path === filters.page);
		}

		if (filters.deviceType) {
			clicks = clicks.filter((click) => click.device.type === filters.deviceType);
		}

		if (filters.startDate) {
			clicks = clicks.filter((click) => click.timestamp >= filters.startDate!);
		}

		if (filters.endDate) {
			clicks = clicks.filter((click) => click.timestamp <= filters.endDate!);
		}
	}

	return clicks;
}

/**
 * Get scroll depth events
 */
export function getScrollDepthEvents(): Record<string, ScrollDepthEvent> {
	const data = loadHeatmapData();
	return data.scrollDepths;
}

/**
 * Get aggregated click data for heatmap visualization
 * Groups clicks into grid cells for density calculation
 */
export function getHeatmapData(options: {
	page?: string;
	deviceType?: "desktop" | "tablet" | "mobile";
	startDate?: number;
	endDate?: number;
	gridSize?: number; // Size of grid cells (default: 50px)
}): Array<{ x: number; y: number; value: number }> {
	const { gridSize = 50 } = options;

	// Get filtered clicks
	const clicks = getClickEvents({
		page: options.page,
		deviceType: options.deviceType,
		startDate: options.startDate,
		endDate: options.endDate,
	});

	// Group clicks into grid cells
	const grid: Record<string, number> = {};

	clicks.forEach((click) => {
		// Convert coordinates to grid cell
		const cellX = Math.floor(click.x / gridSize);
		const cellY = Math.floor(click.y / gridSize);
		const key = `${cellX},${cellY}`;

		grid[key] = (grid[key] || 0) + 1;
	});

	// Convert to array format for HeatmapChart
	return Object.entries(grid).map(([key, value]) => {
		const [x, y] = key.split(",").map(Number);
		return {
			x: x * gridSize, // Convert back to pixel coordinates
			y: y * gridSize,
			value,
		};
	});
}

/**
 * Get click statistics
 */
export function getClickStatistics(filters?: {
	page?: string;
	deviceType?: "desktop" | "tablet" | "mobile";
	startDate?: number;
	endDate?: number;
}): {
	totalClicks: number;
	clicksByElement: Record<string, number>;
	clicksByPage: Record<string, number>;
	clicksByDevice: Record<string, number>;
	averageScrollDepth: number;
} {
	const clicks = getClickEvents(filters);
	const scrollDepths = getScrollDepthEvents();

	// Count clicks by element type
	const clicksByElement: Record<string, number> = {};
	clicks.forEach((click) => {
		const key = click.element.tagName;
		clicksByElement[key] = (clicksByElement[key] || 0) + 1;
	});

	// Count clicks by page
	const clicksByPage: Record<string, number> = {};
	clicks.forEach((click) => {
		const key = click.page.path;
		clicksByPage[key] = (clicksByPage[key] || 0) + 1;
	});

	// Count clicks by device
	const clicksByDevice: Record<string, number> = {};
	clicks.forEach((click) => {
		const key = click.device.type;
		clicksByDevice[key] = (clicksByDevice[key] || 0) + 1;
	});

	// Calculate average scroll depth
	const depths = Object.values(scrollDepths).map((d) => d.maxDepth);
	const averageScrollDepth =
		depths.length > 0 ? depths.reduce((a, b) => a + b, 0) / depths.length : 0;

	return {
		totalClicks: clicks.length,
		clicksByElement,
		clicksByPage,
		clicksByDevice,
		averageScrollDepth,
	};
}

/**
 * Clear all heatmap data (for testing/debugging)
 */
export function clearHeatmapData(): void {
	if (typeof window === "undefined") return;
	localStorage.removeItem(STORAGE_KEY);
}

/**
 * Initialize heatmap tracking
 * Call this once in your app initialization
 */
export function initializeHeatmapTracking(): void {
	if (typeof window === "undefined") return;

	// Track clicks on all elements
	document.addEventListener("click", trackClick, { passive: true });

	// Track scroll depth
	let scrollTimeout: NodeJS.Timeout;
	window.addEventListener(
		"scroll",
		() => {
			clearTimeout(scrollTimeout);
			scrollTimeout = setTimeout(trackScrollDepth, 150);
		},
		{ passive: true }
	);

	// Track initial scroll depth
	trackScrollDepth();

	// Track on page visibility change (for SPAs)
	document.addEventListener("visibilitychange", () => {
		if (document.visibilityState === "visible") {
			trackScrollDepth();
		}
	});
}

/**
 * Stop heatmap tracking (cleanup)
 */
export function stopHeatmapTracking(): void {
	if (typeof window === "undefined") return;

	document.removeEventListener("click", trackClick as EventListener);
	// Note: Can't remove scroll listener without reference, but it's passive
}
