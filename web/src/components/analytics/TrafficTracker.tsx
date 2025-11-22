/**
 * Traffic Tracker Component
 *
 * Cycle 73: Traffic Source Tracking
 *
 * Client-side component that initializes UTM tracking on page load.
 * Tracks all page visits and sends events to Convex for analytics.
 *
 * Usage: Add to Layout.astro with client:load directive
 */

import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
	initializeTrafficTracking,
	trackPageVisit,
	getCurrentTrafficSource,
	getTrafficSourceMetadata,
} from "@/lib/analytics/utm-tracker";

interface TrafficTrackerProps {
	/**
	 * Group ID for multi-tenant analytics
	 */
	groupId?: string;

	/**
	 * Funnel ID to associate traffic with specific funnel
	 */
	funnelId?: string;

	/**
	 * Enable debug logging
	 */
	debug?: boolean;
}

export function TrafficTracker({ groupId, funnelId, debug = false }: TrafficTrackerProps) {
	const logEvent = useMutation(api.mutations.analytics.logTrafficEvent);

	useEffect(() => {
		// Initialize UTM tracking on mount
		initializeTrafficTracking();

		// Track current page visit
		const trafficSource = trackPageVisit();

		if (debug) {
			console.log("[TrafficTracker] Initialized:", {
				trafficSource,
				groupId,
				funnelId,
			});
		}

		// Log event to Convex if we have a traffic source
		if (trafficSource) {
			const metadata = getTrafficSourceMetadata();

			logEvent({
				type: "page_view",
				groupId: groupId || "default",
				funnelId: funnelId as any,
				metadata: {
					...metadata,
					url: window.location.href,
					path: window.location.pathname,
					title: document.title,
				},
			}).catch((error) => {
				if (debug) {
					console.error("[TrafficTracker] Failed to log event:", error);
				}
			});
		}

		// Track navigation changes (for SPAs)
		const handleNavigation = () => {
			const source = trackPageVisit();
			if (debug) {
				console.log("[TrafficTracker] Navigation tracked:", source);
			}

			if (source) {
				const metadata = getTrafficSourceMetadata();
				logEvent({
					type: "page_view",
					groupId: groupId || "default",
					funnelId: funnelId as any,
					metadata: {
						...metadata,
						url: window.location.href,
						path: window.location.pathname,
						title: document.title,
					},
				}).catch((error) => {
					if (debug) {
						console.error("[TrafficTracker] Failed to log navigation event:", error);
					}
				});
			}
		};

		// Listen for navigation events
		if (typeof window !== "undefined" && "navigation" in window) {
			// Modern Navigation API (experimental)
			// @ts-ignore
			window.navigation?.addEventListener("navigate", handleNavigation);

			return () => {
				// @ts-ignore
				window.navigation?.removeEventListener("navigate", handleNavigation);
			};
		}
	}, [groupId, funnelId, debug, logEvent]);

	// This component renders nothing
	return null;
}

/**
 * Standalone tracking function for manual tracking
 *
 * Usage in Astro pages:
 * ```astro
 * <script>
 *   import { trackConversion } from '@/components/analytics/TrafficTracker';
 *   trackConversion('purchase', { revenue: 99.99 });
 * </script>
 * ```
 */
export async function trackConversion(
	type: string,
	metadata?: Record<string, unknown>
): Promise<void> {
	if (typeof window === "undefined") return;

	const source = getCurrentTrafficSource();
	if (!source) {
		console.warn("[TrafficTracker] No traffic source found for conversion");
		return;
	}

	const trackingMetadata = getTrafficSourceMetadata();

	// Send to Convex
	try {
		// Note: This requires a client-side Convex client
		// For server-side tracking, use the mutation directly
		console.log("[TrafficTracker] Conversion tracked:", {
			type,
			source: trackingMetadata,
			metadata,
		});

		// TODO: Send to Convex via mutation
		// This would require accessing the Convex client from global context
	} catch (error) {
		console.error("[TrafficTracker] Failed to track conversion:", error);
	}
}
