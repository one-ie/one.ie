/**
 * Order Bump Logic (Cycle 83)
 *
 * Business logic for order bumps, upsells, and checkout optimization
 * - Product selection algorithms
 * - Discount calculations
 * - Analytics tracking
 * - Payment intent updates
 */

import type { OrderBump, OrderBumpProduct } from "@/stores/checkout";
import type { CartItem } from "@/stores/cart";
import type { PaymentIntentRequest } from "@/types/stripe";

/**
 * Discount types for order bumps
 */
export type DiscountType = "percentage" | "fixed" | "bogo" | "free_shipping";

export interface OrderBumpConfig {
	productId: string;
	productName: string;
	productDescription: string;
	productImage?: string;
	originalPrice: number; // in cents
	discountType: DiscountType;
	discountValue: number; // percentage (0-100) or fixed amount in cents
	position: "before_payment" | "after_payment";
	maxQuantity?: number;
	conditions?: {
		minCartValue?: number; // in cents
		requiredProducts?: string[]; // product IDs
		excludedProducts?: string[]; // product IDs
	};
}

/**
 * Calculate discounted price based on discount type
 */
export function calculateDiscountedPrice(
	originalPrice: number,
	discountType: DiscountType,
	discountValue: number
): number {
	switch (discountType) {
		case "percentage":
			return Math.round(originalPrice * (1 - discountValue / 100));
		case "fixed":
			return Math.max(0, originalPrice - discountValue);
		case "bogo":
			return Math.round(originalPrice / 2); // Buy one get one = 50% off
		case "free_shipping":
			return originalPrice; // No discount on product, shipping is free
		default:
			return originalPrice;
	}
}

/**
 * Create an order bump from configuration
 */
export function createOrderBump(
	config: OrderBumpConfig,
	bumpIndex: number = 0
): OrderBump {
	const discountedPrice = calculateDiscountedPrice(
		config.originalPrice,
		config.discountType,
		config.discountValue
	);

	const discountPercentage =
		config.discountType === "percentage"
			? config.discountValue
			: Math.round(
					((config.originalPrice - discountedPrice) / config.originalPrice) * 100
			  );

	const product: OrderBumpProduct = {
		id: config.productId,
		name: config.productName,
		description: config.productDescription,
		image: config.productImage,
		originalPrice: config.originalPrice,
		discountedPrice,
		discountPercentage,
	};

	return {
		id: `bump-${config.productId}-${bumpIndex}`,
		product,
		position: config.position,
		accepted: false,
	};
}

/**
 * Check if cart meets order bump conditions
 */
export function meetsConditions(
	cart: CartItem[],
	conditions?: OrderBumpConfig["conditions"]
): boolean {
	if (!conditions) return true;

	// Check minimum cart value
	if (conditions.minCartValue) {
		const cartTotal = cart.reduce(
			(sum, item) => sum + item.price * item.quantity,
			0
		);
		if (cartTotal < conditions.minCartValue) return false;
	}

	// Check required products
	if (conditions.requiredProducts && conditions.requiredProducts.length > 0) {
		const cartProductIds = cart.map((item) => item.id);
		const hasRequired = conditions.requiredProducts.some((id) =>
			cartProductIds.includes(id)
		);
		if (!hasRequired) return false;
	}

	// Check excluded products
	if (conditions.excludedProducts && conditions.excludedProducts.length > 0) {
		const cartProductIds = cart.map((item) => item.id);
		const hasExcluded = conditions.excludedProducts.some((id) =>
			cartProductIds.includes(id)
		);
		if (hasExcluded) return false;
	}

	return true;
}

/**
 * Select order bumps based on cart contents
 */
export function selectOrderBumps(
	cart: CartItem[],
	availableBumps: OrderBumpConfig[],
	maxBumps: number = 3
): OrderBump[] {
	const validBumps = availableBumps
		.filter((config) => meetsConditions(cart, config.conditions))
		.slice(0, maxBumps)
		.map((config, index) => createOrderBump(config, index));

	return validBumps;
}

/**
 * Calculate order bump analytics
 */
export interface OrderBumpAnalytics {
	totalOffered: number;
	totalAccepted: number;
	acceptanceRate: number;
	averageOrderValue: number;
	totalRevenue: number;
	totalSavings: number;
}

export function calculateAnalytics(
	allBumps: OrderBump[],
	acceptedBumpIds: string[]
): OrderBumpAnalytics {
	const acceptedBumps = allBumps.filter((bump) =>
		acceptedBumpIds.includes(bump.id)
	);

	const totalOffered = allBumps.length;
	const totalAccepted = acceptedBumps.length;
	const acceptanceRate =
		totalOffered > 0 ? (totalAccepted / totalOffered) * 100 : 0;

	const totalRevenue = acceptedBumps.reduce(
		(sum, bump) => sum + bump.product.discountedPrice,
		0
	);

	const totalSavings = acceptedBumps.reduce(
		(sum, bump) =>
			sum + (bump.product.originalPrice - bump.product.discountedPrice),
		0
	);

	const averageOrderValue = totalAccepted > 0 ? totalRevenue / totalAccepted : 0;

	return {
		totalOffered,
		totalAccepted,
		acceptanceRate,
		averageOrderValue,
		totalRevenue,
		totalSavings,
	};
}

/**
 * Update payment intent with accepted bumps
 */
export function updatePaymentIntentWithBumps(
	baseRequest: PaymentIntentRequest,
	acceptedBumps: OrderBump[]
): PaymentIntentRequest {
	// Add accepted bumps as additional items
	const bumpItems = acceptedBumps.map((bump) => ({
		productId: bump.product.id,
		quantity: 1,
		// Store bump metadata for tracking
		metadata: {
			isOrderBump: "true",
			originalPrice: bump.product.originalPrice.toString(),
			discountedPrice: bump.product.discountedPrice.toString(),
		},
	}));

	return {
		...baseRequest,
		items: [...baseRequest.items, ...bumpItems],
		metadata: {
			...baseRequest.metadata,
			orderBumpCount: acceptedBumps.length.toString(),
			orderBumpRevenue: acceptedBumps
				.reduce((sum, bump) => sum + bump.product.discountedPrice, 0)
				.toString(),
		},
	};
}

/**
 * Predefined order bump templates for common scenarios
 */
export const orderBumpTemplates: Record<string, OrderBumpConfig> = {
	expressShipping: {
		productId: "shipping-express",
		productName: "Express Shipping",
		productDescription:
			"Get your order in 2-3 business days instead of 5-7 days",
		originalPrice: 1500, // $15.00
		discountType: "percentage",
		discountValue: 33, // 33% off = $10.00
		position: "before_payment",
	},

	giftWrapping: {
		productId: "gift-wrap",
		productName: "Premium Gift Wrapping",
		productDescription: "Beautiful gift wrap with personalized message card",
		originalPrice: 800, // $8.00
		discountType: "percentage",
		discountValue: 50, // 50% off = $4.00
		position: "before_payment",
	},

	extendedWarranty: {
		productId: "warranty-extended",
		productName: "Extended Warranty (2 Years)",
		productDescription: "Full coverage for 2 years beyond manufacturer warranty",
		originalPrice: 4900, // $49.00
		discountType: "percentage",
		discountValue: 40, // 40% off = $29.40
		position: "after_payment",
	},

	membershipTrial: {
		productId: "membership-vip",
		productName: "VIP Membership (1 Month Free)",
		productDescription: "Free shipping, exclusive deals, and early access",
		originalPrice: 999, // $9.99
		discountType: "percentage",
		discountValue: 100, // Free for first month
		position: "after_payment",
	},
};

/**
 * Track order bump event for analytics
 */
export function trackOrderBumpEvent(
	eventName: "offered" | "accepted" | "rejected",
	bump: OrderBump
) {
	// Google Analytics 4
	if (typeof window !== "undefined" && window.gtag) {
		window.gtag("event", `order_bump_${eventName}`, {
			bump_id: bump.id,
			bump_name: bump.product.name,
			bump_price: bump.product.discountedPrice / 100,
			bump_original_price: bump.product.originalPrice / 100,
			bump_discount_percentage: bump.product.discountPercentage,
			bump_position: bump.position,
		});
	}

	// Console log for debugging
	console.log(`[Order Bump ${eventName}]`, {
		id: bump.id,
		product: bump.product.name,
		price: `$${(bump.product.discountedPrice / 100).toFixed(2)}`,
	});
}
