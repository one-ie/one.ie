/* eslint-disable @typescript-eslint/no-explicit-any */
import type { APIRoute } from "astro";
import { ConvexHttpClient } from "convex/browser";
import {
	checkRateLimit,
	getClientIP,
	resetRateLimit,
} from "@/lib/auth/rate-limiter";
import {
	logRateLimitViolation,
	logSignInAttempt,
	logSignUpAttempt,
	logPasswordResetRequest,
} from "@/lib/auth/event-logger";

export const prerender = false;

const convex = new ConvexHttpClient(
	import.meta.env.PUBLIC_CONVEX_URL || import.meta.env.NEXT_PUBLIC_CONVEX_URL,
);

// Bridge Better Auth UI requests to our custom Convex auth
export const ALL: APIRoute = async ({ request, cookies }) => {
	const url = new URL(request.url);
	const pathname = url.pathname.replace("/api/auth", "");

	try {
		// Handle session endpoint for Better Auth UI
		if (pathname === "/get-session" || pathname === "/session") {
			const token = cookies.get("auth_token")?.value;

			if (!token) {
				return new Response(JSON.stringify({ user: null, session: null }), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				});
			}

			try {
				const user = await convex.query("auth:getCurrentUser" as any, {
					token,
				});

				if (!user) {
					return new Response(JSON.stringify({ user: null, session: null }), {
						status: 200,
						headers: { "Content-Type": "application/json" },
					});
				}

				return new Response(
					JSON.stringify({
						user: {
							id: user.id,
							email: user.email,
							name: user.name || null,
							emailVerified: false,
							image: null,
						},
						session: {
							id: token,
							userId: user.id,
							expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
						},
					}),
					{
						status: 200,
						headers: { "Content-Type": "application/json" },
					},
				);
			} catch (convexError) {
				// Gracefully handle Convex errors
				return new Response(JSON.stringify({ user: null, session: null }), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				});
			}
		}

		// Handle sign-out endpoint
		if (pathname === "/sign-out" && request.method === "POST") {
			const token = cookies.get("auth_token")?.value;

			if (token) {
				await convex.mutation("auth:signOut" as any, { token });
			}

			cookies.delete("auth_token", {
				path: "/",
			});

			return new Response(JSON.stringify({ success: true }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		}

		// Handle sign-in endpoint
		if (pathname === "/sign-in/email" && request.method === "POST") {
			const body = await request.json();
			const { email, password } = body;

			// RATE LIMITING: 5 attempts per 15 minutes per IP
			const clientIP = getClientIP(request);
			const rateLimitKey = `signin:${clientIP}`;
			const rateLimit = checkRateLimit(rateLimitKey, "SIGN_IN");

			if (!rateLimit.allowed) {
				// Log rate limit violation
				await logRateLimitViolation({
					endpoint: "/sign-in/email",
					ipAddress: clientIP,
					email,
					userAgent: request.headers.get("user-agent") || undefined,
					resetAt: rateLimit.resetAt,
				});

				return rateLimit.response!;
			}

			try {
				const result = await convex.mutation("auth:signIn" as any, {
					email,
					password,
				});

				cookies.set("auth_token", result.token, {
					path: "/",
					maxAge: 30 * 24 * 60 * 60,
					sameSite: "lax",
					httpOnly: true,
					secure: import.meta.env.PROD,
				});

				const user = await convex.query("auth:getCurrentUser" as any, {
					token: result.token,
				});

				// Reset rate limit on successful login
				resetRateLimit(rateLimitKey);

				// Log successful sign-in
				await logSignInAttempt({
					email,
					ipAddress: clientIP,
					userAgent: request.headers.get("user-agent") || undefined,
					success: true,
					userId: user?.id,
				});

				return new Response(
					JSON.stringify({
						user: user
							? {
									id: user.id,
									email: user.email,
									name: user.name || null,
									emailVerified: false,
									image: null,
								}
							: null,
						session: user
							? {
									id: result.token,
									userId: user.id,
									expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
								}
							: null,
					}),
					{
						status: 200,
						headers: { "Content-Type": "application/json" },
					},
				);
			} catch (error: any) {
				// Log failed sign-in attempt
				await logSignInAttempt({
					email,
					ipAddress: clientIP,
					userAgent: request.headers.get("user-agent") || undefined,
					success: false,
					reason: error.message,
				});

				throw error;
			}
		}

		// Handle sign-up endpoint
		if (pathname === "/sign-up/email" && request.method === "POST") {
			const body = await request.json();
			const { email, password, name } = body;

			// RATE LIMITING: 3 signups per hour per IP
			const clientIP = getClientIP(request);
			const rateLimitKey = `signup:${clientIP}`;
			const rateLimit = checkRateLimit(rateLimitKey, "SIGN_UP");

			if (!rateLimit.allowed) {
				// Log rate limit violation
				await logRateLimitViolation({
					endpoint: "/sign-up/email",
					ipAddress: clientIP,
					email,
					userAgent: request.headers.get("user-agent") || undefined,
					resetAt: rateLimit.resetAt,
				});

				return rateLimit.response!;
			}

			try {
				const result = await convex.mutation("auth:signUp" as any, {
					email,
					password,
					name: name || undefined,
				});

				cookies.set("auth_token", result.token, {
					path: "/",
					maxAge: 30 * 24 * 60 * 60,
					sameSite: "lax",
					httpOnly: true,
					secure: import.meta.env.PROD,
				});

				const user = await convex.query("auth:getCurrentUser" as any, {
					token: result.token,
				});

				// Reset rate limit on successful signup
				resetRateLimit(rateLimitKey);

				// Log successful sign-up
				await logSignUpAttempt({
					email,
					ipAddress: clientIP,
					userAgent: request.headers.get("user-agent") || undefined,
					success: true,
					userId: user?.id,
				});

				return new Response(
					JSON.stringify({
						user: user
							? {
									id: user.id,
									email: user.email,
									name: user.name || null,
									emailVerified: false,
									image: null,
								}
							: null,
						session: user
							? {
									id: result.token,
									userId: user.id,
									expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
								}
							: null,
					}),
					{
						status: 200,
						headers: { "Content-Type": "application/json" },
					},
				);
			} catch (error: any) {
				// Log failed sign-up attempt
				await logSignUpAttempt({
					email,
					ipAddress: clientIP,
					userAgent: request.headers.get("user-agent") || undefined,
					success: false,
					reason: error.message,
				});

				throw error;
			}
		}

		// Handle social sign-in endpoint (GitHub, Google)
		if (pathname === "/sign-in/social" && request.method === "POST") {
			const body = await request.json();
			const { provider } = body;

			// Redirect to the OAuth provider
			const baseUrl = new URL(request.url).origin;
			const redirectUrl = `${baseUrl}/api/auth/${provider}`;

			return new Response(null, {
				status: 302,
				headers: {
					Location: redirectUrl,
				},
			});
		}

		// Handle forgot password endpoint
		if (pathname === "/forgot-password" && request.method === "POST") {
			const body = await request.json();
			const { email } = body;

			// RATE LIMITING: 3 requests per hour per email
			const rateLimitKey = `password-reset:${email}`;
			const rateLimit = checkRateLimit(rateLimitKey, "PASSWORD_RESET");

			if (!rateLimit.allowed) {
				const clientIP = getClientIP(request);

				// Log rate limit violation
				await logRateLimitViolation({
					endpoint: "/forgot-password",
					ipAddress: clientIP,
					email,
					userAgent: request.headers.get("user-agent") || undefined,
					resetAt: rateLimit.resetAt,
				});

				return rateLimit.response!;
			}

			// Use production URL in production, localhost in dev
			const baseUrl = import.meta.env.PROD
				? "https://stack.one.ie"
				: new URL(request.url).origin;

			const clientIP = getClientIP(request);
			console.log("Calling requestPasswordReset action for:", email);

			try {
				const result = await convex.mutation(
					"auth:requestPasswordReset" as any,
					{
						email,
						baseUrl,
					}
				);
				console.log("Password reset result:", result);

				// Log successful password reset request
				await logPasswordResetRequest({
					email,
					ipAddress: clientIP,
					userAgent: request.headers.get("user-agent") || undefined,
					success: true,
				});
			} catch (error: any) {
				console.error("Error calling requestPasswordReset:", error);

				// Log failed password reset request
				await logPasswordResetRequest({
					email,
					ipAddress: clientIP,
					userAgent: request.headers.get("user-agent") || undefined,
					success: false,
					reason: error.message,
				});
			}

			return new Response(JSON.stringify({ success: true }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		}

		// Handle validate reset token endpoint
		if (pathname === "/validate-reset-token" && request.method === "GET") {
			const token = url.searchParams.get("token");

			if (!token) {
				return new Response(JSON.stringify({ error: "Token required" }), {
					status: 400,
					headers: { "Content-Type": "application/json" },
				});
			}

			const result = await convex.query("auth:validateResetToken" as any, {
				token,
			});

			if (!result.valid) {
				return new Response(
					JSON.stringify({ error: "Invalid or expired token" }),
					{
						status: 400,
						headers: { "Content-Type": "application/json" },
					},
				);
			}

			return new Response(JSON.stringify({ valid: true }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		}

		// Handle reset password endpoint
		if (pathname === "/reset-password" && request.method === "POST") {
			const body = await request.json();
			const { token, password } = body;

			// Note: Reset password uses token verification, not rate limiting by IP
			// The token itself is rate-limited via the forgot-password endpoint
			await convex.mutation("auth:resetPassword" as any, { token, password });

			return new Response(JSON.stringify({ success: true }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		}

		// Return 404 for unhandled routes
		return new Response(JSON.stringify({ error: "Not found" }), {
			status: 404,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error: any) {
		return new Response(
			JSON.stringify({ error: error.message || "Internal server error" }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			},
		);
	}
};
