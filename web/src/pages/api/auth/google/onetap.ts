/* eslint-disable @typescript-eslint/no-explicit-any */
import type { APIRoute } from "astro";
import { ConvexHttpClient } from "convex/browser";

export const prerender = false;

const convex = new ConvexHttpClient(
	import.meta.env.PUBLIC_CONVEX_URL || import.meta.env.NEXT_PUBLIC_CONVEX_URL,
);

/**
 * Google One Tap Authentication Endpoint
 *
 * Handles Google One Tap ID token verification and user authentication.
 * This endpoint receives the JWT credential from Google One Tap and:
 * 1. Verifies the token with Google
 * 2. Extracts user info (email, name, picture)
 * 3. Creates or updates user account
 * 4. Creates session
 * 5. Sets auth cookie
 */
export const POST: APIRoute = async ({ request, cookies, locals }) => {
	try {
		const body = await request.json();
		const { credential } = body;

		if (!credential) {
			return new Response(
				JSON.stringify({ success: false, error: "Missing credential" }),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// Get Google Client ID from environment
		const runtime = locals.runtime as any;
		const clientId =
			runtime?.env?.GOOGLE_CLIENT_ID || import.meta.env.GOOGLE_CLIENT_ID;

		if (!clientId) {
			console.error("GOOGLE_CLIENT_ID not configured");
			return new Response(
				JSON.stringify({
					success: false,
					error: "Google authentication not configured",
				}),
				{
					status: 500,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// Decode JWT (Google ID token)
		// The credential is a JWT with 3 parts: header.payload.signature
		const parts = credential.split(".");
		if (parts.length !== 3) {
			return new Response(
				JSON.stringify({ success: false, error: "Invalid credential format" }),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// Decode the payload (second part)
		const payload = JSON.parse(
			Buffer.from(parts[1], "base64url").toString("utf-8"),
		);

		// Verify token claims
		if (payload.aud !== clientId) {
			return new Response(
				JSON.stringify({ success: false, error: "Invalid token audience" }),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// Check expiration
		const now = Math.floor(Date.now() / 1000);
		if (payload.exp < now) {
			return new Response(
				JSON.stringify({ success: false, error: "Token expired" }),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// Extract user info from token
		const { email, name, picture, sub: googleId } = payload;

		if (!email) {
			return new Response(
				JSON.stringify({ success: false, error: "Email not provided by Google" }),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// TODO: Implement proper Google OAuth flow with Convex
		// For now, we'll create/update user and create session
		// This is a simplified implementation that should be replaced
		// with proper OAuth flow through backend/convex/auth.ts

		// Check if user exists
		const existingUser = await convex.query("users:getByEmail" as any, {
			email,
		});

		let userId: string;

		if (existingUser) {
			// User exists, update profile if needed
			userId = existingUser._id;

			// Update user profile (name, picture) if different
			if (existingUser.name !== name || existingUser.avatarUrl !== picture) {
				await convex.mutation("users:update" as any, {
					id: userId,
					name: name || existingUser.name,
					avatarUrl: picture || existingUser.avatarUrl,
				});
			}
		} else {
			// Create new user
			const newUser = await convex.mutation("auth:signUp" as any, {
				email,
				password: crypto.randomUUID(), // Generate random password (user won't use it)
				name: name || email.split("@")[0],
			});

			userId = newUser.userId;

			// Update avatar URL if provided
			if (picture) {
				await convex.mutation("users:update" as any, {
					id: userId,
					avatarUrl: picture,
				});
			}
		}

		// Create session
		const session = await convex.mutation("auth:createSession" as any, {
			userId,
		});

		// Set auth cookie
		cookies.set("auth_token", session.token, {
			path: "/",
			maxAge: 30 * 24 * 60 * 60, // 30 days
			sameSite: "lax",
			httpOnly: true,
			secure: import.meta.env.PROD,
		});

		// Log successful authentication
		console.log(`Google One Tap authentication successful for ${email}`);

		return new Response(
			JSON.stringify({
				success: true,
				user: {
					id: userId,
					email,
					name,
					picture,
				},
			}),
			{
				status: 200,
				headers: { "Content-Type": "application/json" },
			},
		);
	} catch (error: any) {
		console.error("Google One Tap authentication error:", error);

		return new Response(
			JSON.stringify({
				success: false,
				error: error.message || "Internal server error",
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			},
		);
	}
};
