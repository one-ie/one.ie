/**
 * Custom Event Tracking System
 *
 * Cycle 79: Custom Event Tracking
 *
 * Provides a flexible event tracking system for business events with:
 * - Pre-built event library (video_played, pdf_downloaded, etc.)
 * - Custom event definition and triggering
 * - Event goals and targets
 * - Local storage and backend persistence
 * - Rich metadata support
 *
 * Usage:
 * ```typescript
 * import { trackEvent, EventLibrary } from '@/lib/analytics/custom-events';
 *
 * // Use pre-built event
 * trackEvent(EventLibrary.VIDEO_WATCHED, { duration: 120, videoId: 'intro-video' });
 *
 * // Define and track custom event
 * trackEvent('button_clicked', { buttonId: 'cta-primary', page: '/pricing' });
 * ```
 */

export interface CustomEventDefinition {
	/** Unique event name (e.g., 'video_watched') */
	name: string;
	/** Human-readable display name */
	displayName: string;
	/** Event description */
	description: string;
	/** Event category for grouping */
	category: 'engagement' | 'conversion' | 'content' | 'navigation' | 'error' | 'custom';
	/** Expected properties schema (for validation) */
	properties?: Record<string, 'string' | 'number' | 'boolean' | 'object'>;
	/** Icon emoji for display */
	icon?: string;
}

export interface CustomEvent {
	/** Event name */
	name: string;
	/** Event timestamp */
	timestamp: number;
	/** Session ID */
	sessionId: string;
	/** Event properties/metadata */
	properties: Record<string, unknown>;
	/** Current page URL */
	pageUrl: string;
	/** User ID (if authenticated) */
	userId?: string;
	/** Group ID (for multi-tenant) */
	groupId?: string;
}

export interface EventGoal {
	/** Goal ID */
	id: string;
	/** Event name to track */
	eventName: string;
	/** Goal target (e.g., 1000 events) */
	target: number;
	/** Current count */
	current: number;
	/** Goal period ('day' | 'week' | 'month' | 'all-time') */
	period: 'day' | 'week' | 'month' | 'all-time';
	/** Goal start date */
	startDate: number;
	/** Goal end date (optional) */
	endDate?: number;
	/** Goal status */
	status: 'active' | 'completed' | 'failed' | 'archived';
}

const STORAGE_KEY_EVENTS = 'custom-events';
const STORAGE_KEY_GOALS = 'custom-event-goals';
const MAX_STORED_EVENTS = 1000; // Keep last 1000 events in localStorage

// ============================================================================
// Event Library - Pre-built Common Events
// ============================================================================

export const EventLibrary = {
	// Content Engagement
	VIDEO_PLAYED: {
		name: 'video_played',
		displayName: 'Video Played',
		description: 'User started playing a video',
		category: 'engagement' as const,
		icon: '▶️',
		properties: {
			videoId: 'string',
			title: 'string',
			duration: 'number',
		},
	},
	VIDEO_WATCHED: {
		name: 'video_watched',
		displayName: 'Video Watched',
		description: 'User watched a video (>80% completion)',
		category: 'engagement' as const,
		icon: '✓',
		properties: {
			videoId: 'string',
			watchTime: 'number',
			percentWatched: 'number',
		},
	},
	PDF_DOWNLOADED: {
		name: 'pdf_downloaded',
		displayName: 'PDF Downloaded',
		description: 'User downloaded a PDF file',
		category: 'content' as const,
		icon: '📄',
		properties: {
			fileName: 'string',
			fileSize: 'number',
			fileUrl: 'string',
		},
	},
	ARTICLE_READ: {
		name: 'article_read',
		displayName: 'Article Read',
		description: 'User read an article (>50% scroll)',
		category: 'engagement' as const,
		icon: '📖',
		properties: {
			articleId: 'string',
			title: 'string',
			readTime: 'number',
		},
	},

	// Conversion Events
	FORM_SUBMITTED: {
		name: 'form_submitted',
		displayName: 'Form Submitted',
		description: 'User submitted a form',
		category: 'conversion' as const,
		icon: '📝',
		properties: {
			formId: 'string',
			formName: 'string',
			fields: 'object',
		},
	},
	SIGNUP_STARTED: {
		name: 'signup_started',
		displayName: 'Signup Started',
		description: 'User started signup process',
		category: 'conversion' as const,
		icon: '🚀',
		properties: {
			source: 'string',
			plan: 'string',
		},
	},
	SIGNUP_COMPLETED: {
		name: 'signup_completed',
		displayName: 'Signup Completed',
		description: 'User completed signup',
		category: 'conversion' as const,
		icon: '✅',
		properties: {
			userId: 'string',
			plan: 'string',
			source: 'string',
		},
	},
	TRIAL_STARTED: {
		name: 'trial_started',
		displayName: 'Trial Started',
		description: 'User started free trial',
		category: 'conversion' as const,
		icon: '🎁',
		properties: {
			plan: 'string',
			trialDays: 'number',
		},
	},
	PURCHASE_INITIATED: {
		name: 'purchase_initiated',
		displayName: 'Purchase Initiated',
		description: 'User started checkout process',
		category: 'conversion' as const,
		icon: '🛒',
		properties: {
			productId: 'string',
			productName: 'string',
			price: 'number',
		},
	},

	// Navigation Events
	PAGE_VIEWED: {
		name: 'page_viewed',
		displayName: 'Page Viewed',
		description: 'User viewed a page',
		category: 'navigation' as const,
		icon: '👁️',
		properties: {
			pageUrl: 'string',
			pageTitle: 'string',
		},
	},
	LINK_CLICKED: {
		name: 'link_clicked',
		displayName: 'Link Clicked',
		description: 'User clicked a link',
		category: 'navigation' as const,
		icon: '🔗',
		properties: {
			linkUrl: 'string',
			linkText: 'string',
			linkId: 'string',
		},
	},
	BUTTON_CLICKED: {
		name: 'button_clicked',
		displayName: 'Button Clicked',
		description: 'User clicked a button',
		category: 'navigation' as const,
		icon: '🔘',
		properties: {
			buttonId: 'string',
			buttonText: 'string',
			location: 'string',
		},
	},
	SEARCH_PERFORMED: {
		name: 'search_performed',
		displayName: 'Search Performed',
		description: 'User performed a search',
		category: 'navigation' as const,
		icon: '🔍',
		properties: {
			query: 'string',
			resultsCount: 'number',
		},
	},

	// Error Events
	ERROR_OCCURRED: {
		name: 'error_occurred',
		displayName: 'Error Occurred',
		description: 'An error occurred in the application',
		category: 'error' as const,
		icon: '⚠️',
		properties: {
			errorMessage: 'string',
			errorCode: 'string',
			stack: 'string',
		},
	},
	FORM_ERROR: {
		name: 'form_error',
		displayName: 'Form Error',
		description: 'User encountered a form validation error',
		category: 'error' as const,
		icon: '❌',
		properties: {
			formId: 'string',
			fieldName: 'string',
			errorMessage: 'string',
		},
	},
} as const;

// ============================================================================
// Session Management
// ============================================================================

function getOrCreateSessionId(): string {
	if (typeof window === 'undefined') return '';

	const SESSION_KEY = 'analytics-session-id';
	const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

	try {
		const stored = sessionStorage.getItem(SESSION_KEY);
		if (stored) {
			const { id, timestamp } = JSON.parse(stored);
			const now = Date.now();

			// Check if session is still valid
			if (now - timestamp < SESSION_TIMEOUT) {
				// Update timestamp
				sessionStorage.setItem(SESSION_KEY, JSON.stringify({ id, timestamp: now }));
				return id;
			}
		}
	} catch (error) {
		console.error('Failed to retrieve session ID:', error);
	}

	// Generate new session ID
	const newId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
	sessionStorage.setItem(SESSION_KEY, JSON.stringify({ id: newId, timestamp: Date.now() }));
	return newId;
}

// ============================================================================
// Event Storage (localStorage)
// ============================================================================

function loadStoredEvents(): CustomEvent[] {
	if (typeof window === 'undefined') return [];

	try {
		const stored = localStorage.getItem(STORAGE_KEY_EVENTS);
		if (stored) {
			return JSON.parse(stored);
		}
	} catch (error) {
		console.error('Failed to load stored events:', error);
	}

	return [];
}

function saveStoredEvents(events: CustomEvent[]): void {
	if (typeof window === 'undefined') return;

	try {
		// Keep only the last MAX_STORED_EVENTS
		const trimmed = events.slice(-MAX_STORED_EVENTS);
		localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(trimmed));
	} catch (error) {
		console.error('Failed to save events:', error);
	}
}

// ============================================================================
// Track Event (Main API)
// ============================================================================

/**
 * Track a custom event
 *
 * @param eventName - Name of the event (use EventLibrary or custom string)
 * @param properties - Event properties/metadata
 * @param options - Optional tracking options
 *
 * @example
 * ```typescript
 * // Pre-built event
 * trackEvent(EventLibrary.VIDEO_WATCHED, {
 *   videoId: 'intro-2024',
 *   duration: 120,
 *   percentWatched: 95
 * });
 *
 * // Custom event
 * trackEvent('pricing_page_viewed', {
 *   plan: 'pro',
 *   cta: 'hero-button'
 * });
 * ```
 */
export function trackEvent(
	eventName: string | CustomEventDefinition,
	properties: Record<string, unknown> = {},
	options: {
		userId?: string;
		groupId?: string;
		persistToBackend?: boolean;
	} = {}
): CustomEvent {
	if (typeof window === 'undefined') {
		console.warn('trackEvent called on server side, ignoring');
		return {} as CustomEvent;
	}

	// Extract event name
	const name = typeof eventName === 'string' ? eventName : eventName.name;

	// Create event object
	const event: CustomEvent = {
		name,
		timestamp: Date.now(),
		sessionId: getOrCreateSessionId(),
		properties,
		pageUrl: window.location.href,
		userId: options.userId,
		groupId: options.groupId,
	};

	// Store locally
	const events = loadStoredEvents();
	events.push(event);
	saveStoredEvents(events);

	// Update goals
	updateEventGoals(name);

	// Log to console in development
	if (import.meta.env.DEV) {
		console.log('📊 Event tracked:', name, properties);
	}

	// TODO: Persist to backend (Convex)
	if (options.persistToBackend) {
		persistEventToBackend(event).catch((error) => {
			console.error('Failed to persist event to backend:', error);
		});
	}

	return event;
}

/**
 * Persist event to backend (Convex)
 */
async function persistEventToBackend(event: CustomEvent): Promise<void> {
	// TODO: Implement Convex mutation call
	// This would call a Convex mutation to store the event in the events table
	console.log('TODO: Persist event to backend:', event);
}

// ============================================================================
// Event Retrieval
// ============================================================================

/**
 * Get all tracked events
 */
export function getAllEvents(): CustomEvent[] {
	return loadStoredEvents();
}

/**
 * Get events by name
 */
export function getEventsByName(eventName: string): CustomEvent[] {
	const events = loadStoredEvents();
	return events.filter((e) => e.name === eventName);
}

/**
 * Get events by date range
 */
export function getEventsByDateRange(startDate: number, endDate: number): CustomEvent[] {
	const events = loadStoredEvents();
	return events.filter((e) => e.timestamp >= startDate && e.timestamp <= endDate);
}

/**
 * Get events by session
 */
export function getEventsBySession(sessionId: string): CustomEvent[] {
	const events = loadStoredEvents();
	return events.filter((e) => e.sessionId === sessionId);
}

/**
 * Get event count by name
 */
export function getEventCount(eventName: string): number {
	return getEventsByName(eventName).length;
}

/**
 * Get event counts grouped by name
 */
export function getEventCounts(): Record<string, number> {
	const events = loadStoredEvents();
	const counts: Record<string, number> = {};

	events.forEach((event) => {
		counts[event.name] = (counts[event.name] || 0) + 1;
	});

	return counts;
}

/**
 * Get top events by count
 */
export function getTopEvents(limit: number = 10): Array<{ name: string; count: number }> {
	const counts = getEventCounts();
	return Object.entries(counts)
		.map(([name, count]) => ({ name, count }))
		.sort((a, b) => b.count - a.count)
		.slice(0, limit);
}

// ============================================================================
// Event Goals
// ============================================================================

function loadStoredGoals(): EventGoal[] {
	if (typeof window === 'undefined') return [];

	try {
		const stored = localStorage.getItem(STORAGE_KEY_GOALS);
		if (stored) {
			return JSON.parse(stored);
		}
	} catch (error) {
		console.error('Failed to load stored goals:', error);
	}

	return [];
}

function saveStoredGoals(goals: EventGoal[]): void {
	if (typeof window === 'undefined') return;

	try {
		localStorage.setItem(STORAGE_KEY_GOALS, JSON.stringify(goals));
	} catch (error) {
		console.error('Failed to save goals:', error);
	}
}

/**
 * Create an event goal
 */
export function createEventGoal(
	eventName: string,
	target: number,
	period: 'day' | 'week' | 'month' | 'all-time' = 'all-time'
): EventGoal {
	const goal: EventGoal = {
		id: `goal_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
		eventName,
		target,
		current: getEventCount(eventName),
		period,
		startDate: Date.now(),
		status: 'active',
	};

	// Set end date based on period
	if (period !== 'all-time') {
		const now = new Date();
		const endDate = new Date(now);

		if (period === 'day') {
			endDate.setDate(endDate.getDate() + 1);
		} else if (period === 'week') {
			endDate.setDate(endDate.getDate() + 7);
		} else if (period === 'month') {
			endDate.setMonth(endDate.getMonth() + 1);
		}

		goal.endDate = endDate.getTime();
	}

	const goals = loadStoredGoals();
	goals.push(goal);
	saveStoredGoals(goals);

	return goal;
}

/**
 * Update goal progress when events are tracked
 */
function updateEventGoals(eventName: string): void {
	const goals = loadStoredGoals();
	let updated = false;

	goals.forEach((goal) => {
		if (goal.eventName === eventName && goal.status === 'active') {
			goal.current += 1;

			// Check if goal is completed
			if (goal.current >= goal.target) {
				goal.status = 'completed';
			}

			// Check if goal expired
			if (goal.endDate && Date.now() > goal.endDate && goal.status === 'active') {
				goal.status = 'failed';
			}

			updated = true;
		}
	});

	if (updated) {
		saveStoredGoals(goals);
	}
}

/**
 * Get all event goals
 */
export function getAllGoals(): EventGoal[] {
	return loadStoredGoals();
}

/**
 * Get active event goals
 */
export function getActiveGoals(): EventGoal[] {
	return loadStoredGoals().filter((g) => g.status === 'active');
}

/**
 * Get goal by ID
 */
export function getGoalById(goalId: string): EventGoal | undefined {
	return loadStoredGoals().find((g) => g.id === goalId);
}

/**
 * Delete a goal
 */
export function deleteGoal(goalId: string): void {
	const goals = loadStoredGoals();
	const filtered = goals.filter((g) => g.id !== goalId);
	saveStoredGoals(filtered);
}

/**
 * Archive a goal
 */
export function archiveGoal(goalId: string): void {
	const goals = loadStoredGoals();
	const goal = goals.find((g) => g.id === goalId);
	if (goal) {
		goal.status = 'archived';
		saveStoredGoals(goals);
	}
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Clear all stored events (for testing/debugging)
 */
export function clearAllEvents(): void {
	if (typeof window === 'undefined') return;
	localStorage.removeItem(STORAGE_KEY_EVENTS);
}

/**
 * Clear all goals (for testing/debugging)
 */
export function clearAllGoals(): void {
	if (typeof window === 'undefined') return;
	localStorage.removeItem(STORAGE_KEY_GOALS);
}

/**
 * Get event definition from library
 */
export function getEventDefinition(eventName: string): CustomEventDefinition | undefined {
	const libraryEvent = Object.values(EventLibrary).find((e) => e.name === eventName);
	return libraryEvent;
}

/**
 * Get all event definitions from library
 */
export function getAllEventDefinitions(): CustomEventDefinition[] {
	return Object.values(EventLibrary);
}

/**
 * Export events as CSV
 */
export function exportEventsAsCSV(): string {
	const events = loadStoredEvents();

	// CSV header
	const headers = ['Name', 'Timestamp', 'Session ID', 'Page URL', 'Properties'];
	const rows = [headers];

	// CSV rows
	events.forEach((event) => {
		rows.push([
			event.name,
			new Date(event.timestamp).toISOString(),
			event.sessionId,
			event.pageUrl,
			JSON.stringify(event.properties),
		]);
	});

	return rows.map((row) => row.join(',')).join('\n');
}

/**
 * Download events as CSV file
 */
export function downloadEventsCSV(): void {
	if (typeof window === 'undefined') return;

	const csv = exportEventsAsCSV();
	const blob = new Blob([csv], { type: 'text/csv' });
	const url = window.URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = `custom-events-${Date.now()}.csv`;
	a.click();
	window.URL.revokeObjectURL(url);
}
