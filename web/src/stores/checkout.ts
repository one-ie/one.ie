/**
 * Checkout State Management
 * Manages order bumps, upsells, and checkout session state
 * Uses Nanostores for reactive state management
 */

import { atom, computed } from "nanostores";

export interface OrderBumpProduct {
	id: string;
	name: string;
	description: string;
	image?: string;
	originalPrice: number;
	discountedPrice: number;
	discountPercentage?: number;
}

export interface OrderBump {
	id: string;
	product: OrderBumpProduct;
	position: "before_payment" | "after_payment";
	accepted: boolean;
}

export interface CheckoutSession {
	orderBumps: OrderBump[];
	acceptedBumpIds: string[];
	updatedAt: number;
}

// Load checkout session from localStorage
const loadCheckout = (): CheckoutSession => {
	if (typeof window === "undefined") {
		return { orderBumps: [], acceptedBumpIds: [], updatedAt: Date.now() };
	}

	try {
		const stored = localStorage.getItem("checkout-session");
		if (stored) {
			return JSON.parse(stored) as CheckoutSession;
		}
	} catch (error) {
		console.error("Failed to load checkout session:", error);
	}

	return { orderBumps: [], acceptedBumpIds: [], updatedAt: Date.now() };
};

// Save checkout session to localStorage
const saveCheckout = (session: CheckoutSession): void => {
	if (typeof window === "undefined") return;

	try {
		localStorage.setItem("checkout-session", JSON.stringify(session));
	} catch (error) {
		console.error("Failed to save checkout session:", error);
	}
};

// Checkout session atom
export const $checkoutSession = atom<CheckoutSession>(loadCheckout());

// Computed: Total bump amount
export const $bumpTotal = computed($checkoutSession, (session) =>
	session.orderBumps
		.filter((bump) => session.acceptedBumpIds.includes(bump.id))
		.reduce((sum, bump) => sum + bump.product.discountedPrice, 0)
);

// Computed: Number of accepted bumps
export const $acceptedBumpCount = computed(
	$checkoutSession,
	(session) => session.acceptedBumpIds.length
);

// Computed: Acceptance rate for analytics
export const $bumpAcceptanceRate = computed($checkoutSession, (session) => {
	if (session.orderBumps.length === 0) return 0;
	return (session.acceptedBumpIds.length / session.orderBumps.length) * 100;
});

// Checkout actions
export const checkoutActions = {
	/**
	 * Initialize order bumps for the current checkout session
	 */
	initializeOrderBumps: (bumps: OrderBump[]) => {
		const session = $checkoutSession.get();
		const newSession = {
			...session,
			orderBumps: bumps,
			updatedAt: Date.now(),
		};
		$checkoutSession.set(newSession);
		saveCheckout(newSession);
	},

	/**
	 * Toggle order bump acceptance
	 */
	toggleOrderBump: (bumpId: string) => {
		const session = $checkoutSession.get();
		const isAccepted = session.acceptedBumpIds.includes(bumpId);

		const newAcceptedIds = isAccepted
			? session.acceptedBumpIds.filter((id) => id !== bumpId)
			: [...session.acceptedBumpIds, bumpId];

		const newSession = {
			...session,
			acceptedBumpIds: newAcceptedIds,
			updatedAt: Date.now(),
		};

		$checkoutSession.set(newSession);
		saveCheckout(newSession);

		// Track analytics event
		if (typeof window !== "undefined" && window.gtag) {
			window.gtag("event", isAccepted ? "order_bump_removed" : "order_bump_added", {
				bump_id: bumpId,
				bump_name: session.orderBumps.find((b) => b.id === bumpId)?.product.name,
			});
		}
	},

	/**
	 * Accept an order bump
	 */
	acceptOrderBump: (bumpId: string) => {
		const session = $checkoutSession.get();
		if (session.acceptedBumpIds.includes(bumpId)) return;

		const newSession = {
			...session,
			acceptedBumpIds: [...session.acceptedBumpIds, bumpId],
			updatedAt: Date.now(),
		};

		$checkoutSession.set(newSession);
		saveCheckout(newSession);

		// Track analytics
		if (typeof window !== "undefined" && window.gtag) {
			const bump = session.orderBumps.find((b) => b.id === bumpId);
			window.gtag("event", "order_bump_accepted", {
				bump_id: bumpId,
				bump_name: bump?.product.name,
				bump_value: bump?.product.discountedPrice,
			});
		}
	},

	/**
	 * Reject an order bump
	 */
	rejectOrderBump: (bumpId: string) => {
		const session = $checkoutSession.get();
		const newSession = {
			...session,
			acceptedBumpIds: session.acceptedBumpIds.filter((id) => id !== bumpId),
			updatedAt: Date.now(),
		};

		$checkoutSession.set(newSession);
		saveCheckout(newSession);
	},

	/**
	 * Clear checkout session
	 */
	clearCheckoutSession: () => {
		const newSession = {
			orderBumps: [],
			acceptedBumpIds: [],
			updatedAt: Date.now(),
		};
		$checkoutSession.set(newSession);
		saveCheckout(newSession);
	},

	/**
	 * Get accepted bumps for payment intent
	 */
	getAcceptedBumps: () => {
		const session = $checkoutSession.get();
		return session.orderBumps.filter((bump) =>
			session.acceptedBumpIds.includes(bump.id)
		);
	},
};
