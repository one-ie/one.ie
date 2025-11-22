/**
 * CheckoutWithBumps Component (Cycle 83)
 *
 * Complete checkout flow with order bump integration
 * - Displays order bumps before/after payment form
 * - Updates payment intent with accepted bumps
 * - Tracks analytics
 * - Handles payment submission
 *
 * Usage:
 * <CheckoutWithBumps
 *   cartItems={items}
 *   orderBumps={bumps}
 * />
 */

import React, { useEffect, useMemo } from "react";
import { useStore } from "@nanostores/react";
import { $cart } from "@/stores/cart";
import {
	$checkoutSession,
	$bumpTotal,
	checkoutActions,
} from "@/stores/checkout";
import { OrderBumpList } from "./OrderBump";
import { CheckoutForm } from "@/components/shop/interactive/CheckoutForm";
import { OrderSummary } from "@/components/shop/payment/OrderSummary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
	selectOrderBumps,
	orderBumpTemplates,
	updatePaymentIntentWithBumps,
	trackOrderBumpEvent,
} from "@/lib/checkout/order-bump-logic";
import type { OrderBumpConfig } from "@/lib/checkout/order-bump-logic";
import type { OrderCalculation } from "@/types/stripe";

interface CheckoutWithBumpsProps {
	/** Order bump configurations to offer */
	bumpConfigs?: OrderBumpConfig[];
	/** Maximum number of bumps to show */
	maxBumps?: number;
	/** Show bumps before payment form */
	showBumpsBeforePayment?: boolean;
	/** Show bumps after payment form */
	showBumpsAfterPayment?: boolean;
	/** Callback when payment is successful */
	onPaymentSuccess?: () => void;
	/** Callback when payment fails */
	onPaymentError?: (error: Error) => void;
}

export function CheckoutWithBumps({
	bumpConfigs,
	maxBumps = 3,
	showBumpsBeforePayment = true,
	showBumpsAfterPayment = false,
	onPaymentSuccess,
	onPaymentError,
}: CheckoutWithBumpsProps) {
	const cart = useStore($cart);
	const checkoutSession = useStore($checkoutSession);
	const bumpTotal = useStore($bumpTotal);

	// Default bump configs if none provided
	const defaultBumpConfigs: OrderBumpConfig[] = [
		{
			...orderBumpTemplates.expressShipping,
			position: "before_payment",
		},
		{
			...orderBumpTemplates.giftWrapping,
			position: "before_payment",
		},
		{
			...orderBumpTemplates.extendedWarranty,
			position: "after_payment",
		},
	];

	const configs = bumpConfigs || defaultBumpConfigs;

	// Initialize order bumps on mount
	useEffect(() => {
		const selectedBumps = selectOrderBumps(cart.items, configs, maxBumps);
		checkoutActions.initializeOrderBumps(selectedBumps);

		// Track offered bumps
		selectedBumps.forEach((bump) => trackOrderBumpEvent("offered", bump));
	}, [cart.items.length]); // Re-run if cart items change

	// Calculate order total including bumps
	const orderCalculation: OrderCalculation = useMemo(() => {
		const cartSubtotal = cart.items.reduce(
			(sum, item) => sum + item.price * item.quantity,
			0
		);

		const subtotal = cartSubtotal + bumpTotal;
		const shipping = cartSubtotal > 5000 ? 0 : 999; // Free shipping over $50
		const tax = Math.round(subtotal * 0.08); // 8% tax
		const total = subtotal + shipping + tax;

		return {
			subtotal,
			shipping,
			tax,
			total,
			currency: "usd",
		};
	}, [cart.items, bumpTotal]);

	// Handle bump toggle
	const handleBumpToggle = (bumpId: string) => {
		checkoutActions.toggleOrderBump(bumpId);

		const bump = checkoutSession.orderBumps.find((b) => b.id === bumpId);
		if (bump) {
			const isAccepted = checkoutSession.acceptedBumpIds.includes(bumpId);
			trackOrderBumpEvent(isAccepted ? "rejected" : "accepted", bump);
		}
	};

	// Split bumps by position
	const bumpsBeforePayment = checkoutSession.orderBumps.filter(
		(bump) => bump.position === "before_payment"
	);
	const bumpsAfterPayment = checkoutSession.orderBumps.filter(
		(bump) => bump.position === "after_payment"
	);

	// Handle checkout submission
	const handleCheckoutSubmit = async (data: any) => {
		try {
			// Create payment intent with accepted bumps
			const acceptedBumps = checkoutActions.getAcceptedBumps();
			const paymentIntentRequest = updatePaymentIntentWithBumps(
				{
					items: cart.items.map((item) => ({
						productId: item.id,
						quantity: item.quantity,
						selectedColor: item.variant?.color,
						selectedSize: item.variant?.size,
					})),
					currency: "usd",
				},
				acceptedBumps
			);

			// TODO: Call your payment API here
			console.log("Payment Intent Request:", paymentIntentRequest);
			console.log("Shipping Address:", data.shippingAddress);

			onPaymentSuccess?.();
		} catch (error) {
			console.error("Payment failed:", error);
			onPaymentError?.(error as Error);
		}
	};

	if (cart.items.length === 0) {
		return (
			<Card>
				<CardContent className="p-8 text-center">
					<p className="text-muted-foreground">Your cart is empty</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="grid gap-6 lg:grid-cols-3">
			{/* Main Checkout Column */}
			<div className="space-y-6 lg:col-span-2">
				{/* Checkout Header */}
				<div>
					<h1 className="text-3xl font-bold">Checkout</h1>
					<p className="text-muted-foreground">
						Complete your order in just a few steps
					</p>
				</div>

				{/* Order Bumps (Before Payment) */}
				{showBumpsBeforePayment && bumpsBeforePayment.length > 0 && (
					<>
						<OrderBumpList
							bumps={bumpsBeforePayment}
							acceptedBumpIds={checkoutSession.acceptedBumpIds}
							onToggle={handleBumpToggle}
							variant="default"
						/>
						<Separator />
					</>
				)}

				{/* Checkout Form */}
				<CheckoutForm
					total={orderCalculation.total}
					onSubmit={handleCheckoutSubmit}
				/>

				{/* Order Bumps (After Payment) */}
				{showBumpsAfterPayment && bumpsAfterPayment.length > 0 && (
					<>
						<Separator />
						<OrderBumpList
							bumps={bumpsAfterPayment}
							acceptedBumpIds={checkoutSession.acceptedBumpIds}
							onToggle={handleBumpToggle}
							variant="featured"
						/>
					</>
				)}
			</div>

			{/* Order Summary Sidebar */}
			<div className="space-y-4">
				<OrderSummary items={cart.items} calculation={orderCalculation} />

				{/* Bump Summary */}
				{checkoutSession.acceptedBumpIds.length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle className="text-base">Order Bumps</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							{checkoutSession.orderBumps
								.filter((bump) =>
									checkoutSession.acceptedBumpIds.includes(bump.id)
								)
								.map((bump) => (
									<div
										key={bump.id}
										className="flex items-center justify-between text-sm"
									>
										<span className="text-muted-foreground">
											{bump.product.name}
										</span>
										<span className="font-medium">
											${(bump.product.discountedPrice / 100).toFixed(2)}
										</span>
									</div>
								))}
							<Separator />
							<div className="flex items-center justify-between font-semibold">
								<span>Bump Total</span>
								<span className="text-primary">
									${(bumpTotal / 100).toFixed(2)}
								</span>
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
