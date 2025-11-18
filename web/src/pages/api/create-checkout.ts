import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
	try {
		const {
			productTitle,
			productDescription,
			productImage,
			price,
			quantity,
			email,
		} = await request.json();

		// Validate inputs
		if (!productTitle || !price || !quantity || !email) {
			return new Response(
				JSON.stringify({ error: "Missing required fields" }),
				{ status: 400, headers: { "Content-Type": "application/json" } },
			);
		}

		// Check if Stripe is configured
		const stripeSecretKey = import.meta.env.STRIPE_SECRET_KEY;
		if (!stripeSecretKey) {
			return new Response(
				JSON.stringify({
					error:
						"Stripe is not configured. Please add STRIPE_SECRET_KEY to your environment variables.",
					setupUrl: "https://one.ie/docs/develop/stripe",
				}),
				{ status: 500, headers: { "Content-Type": "application/json" } },
			);
		}

		// Import Stripe
		const { default: Stripe } = await import("stripe");
		const stripe = new Stripe(stripeSecretKey, {
			apiVersion: "2024-12-18.acacia",
		});

		// Get origin for redirect URLs
		const origin = new URL(request.url).origin;

		// Create Stripe Checkout Session
		const session = await stripe.checkout.sessions.create({
			payment_method_types: ["card"],
			line_items: [
				{
					price_data: {
						currency: "usd",
						product_data: {
							name: productTitle,
							description: productDescription || "",
							images: productImage ? [productImage] : [],
						},
						unit_amount: Math.round(price * 100), // Convert to cents
					},
					quantity: quantity,
				},
			],
			mode: "payment",
			success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${origin}/checkout/cancel`,
			customer_email: email,
			metadata: {
				productTitle,
				quantity: quantity.toString(),
			},
		});

		// Return the checkout URL
		return new Response(JSON.stringify({ url: session.url }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Stripe checkout error:", error);
		return new Response(
			JSON.stringify({
				error:
					error instanceof Error ? error.message : "Payment processing failed",
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			},
		);
	}
};
