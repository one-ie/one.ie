import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/hooks/useAuth";
import { AuthCard } from "./AuthCard";
import { SocialLoginButtons } from "./SocialLoginButtons";
import { GoogleOneTap } from "./GoogleOneTap";

export function SimpleSignInForm() {
	const [emailOrUsername, setEmailOrUsername] = useState(""); // Cycle 45: Support username or email
	const [password, setPassword] = useState("");
	const { mutate: login, loading } = useLogin();

	// Get Google Client ID from environment
	const googleClientId =
		import.meta.env.PUBLIC_GOOGLE_CLIENT_ID ||
		import.meta.env.GOOGLE_CLIENT_ID ||
		"";

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			const result = await login({ emailOrUsername, password });

			if (result.success) {
				// Success
				toast.success("Welcome back!", {
					description:
						"Successfully signed in. Redirecting to your dashboard...",
				});

				setTimeout(() => {
					window.location.href = "/account";
				}, 1000);
			}
		} catch (err: unknown) {
			const error = err as { message?: string; _tag?: string } | null;
			const errorMessage = error?.message || "An unexpected error occurred";
			let title = "Unable to sign in";
			let description = `Error: ${errorMessage}. Please check your credentials and try again.`;

			// Check for typed errors
			if (error?._tag === "CSRFValidation") {
				title = "Security token expired";
				description =
					"Your security token has expired. Please refresh the page and try again.";
				// Optionally: Auto-refresh after showing error
				setTimeout(() => {
					window.location.reload();
				}, 2000);
			} else if (error?._tag === "InvalidCredentials") {
				title = "Incorrect password";
				description =
					"The password you entered is incorrect. Please try again or use the 'Forgot password' option.";
			} else if (error?._tag === "UserNotFound") {
				title = "Account not found";
				description =
					"No account exists with this email. Please sign up first or check your email address.";
			} else if (error?._tag === "EmailNotVerified") {
				title = "Email not verified";
				description =
					"Please verify your email address before signing in. Check your inbox for the verification link.";
			} else if (error?._tag === "AccountBlocked") {
				title = "Account blocked";
				description =
					"Your account has been suspended. Please contact support at support@example.com for assistance.";
			} else {
				// Fallback to message-based error handling
				if (
					errorMessage.toLowerCase().includes("not found") ||
					errorMessage.toLowerCase().includes("no user") ||
					errorMessage.toLowerCase().includes("doesn't exist")
				) {
					title = "Account not found";
					description =
						"No account exists with this email. Please sign up first or check your email address.";
				} else if (
					errorMessage.toLowerCase().includes("password") ||
					errorMessage.toLowerCase().includes("incorrect") ||
					errorMessage.toLowerCase().includes("invalid credentials")
				) {
					title = "Incorrect password";
					description =
						"The password you entered is incorrect. Please try again or use the 'Forgot password' option.";
				} else if (errorMessage.toLowerCase().includes("email")) {
					title = "Invalid email";
					description =
						"Please enter a valid email address (e.g., yourname@example.com).";
				} else if (
					errorMessage.toLowerCase().includes("network") ||
					errorMessage.toLowerCase().includes("connection") ||
					errorMessage.toLowerCase().includes("fetch")
				) {
					title = "Network error";
					description =
						"Unable to connect to the server. Please check your internet connection and try again.";
				} else if (errorMessage.toLowerCase().includes("timeout")) {
					title = "Request timeout";
					description =
						"The server is taking too long to respond. Please try again in a moment.";
				} else if (errorMessage.toLowerCase().includes("cors")) {
					title = "Configuration error";
					description =
						"There's a configuration issue preventing sign in. Please contact support.";
				} else if (
					errorMessage.toLowerCase().includes("blocked") ||
					errorMessage.toLowerCase().includes("suspended")
				) {
					title = "Account blocked";
					description =
						"Your account has been suspended. Please contact support at support@example.com for assistance.";
				} else if (
					errorMessage.toLowerCase().includes("verify") ||
					errorMessage.toLowerCase().includes("confirmation")
				) {
					title = "Email not verified";
					description =
						"Please verify your email address before signing in. Check your inbox for the verification link.";
				}
			}

			toast.error(title, {
				description: description,
			});
		}
	};

	const handleGithubSignIn = () => {
		window.location.href = "/api/auth/github";
	};

	const handleGoogleSignIn = () => {
		window.location.href = "/api/auth/google";
	};

	const handleAppleSignIn = () => {
		window.location.href = "/api/auth/apple";
	};

	const handleDiscordSignIn = () => {
		window.location.href = "/api/auth/discord";
	};

	const handleNotionSignIn = () => {
		window.location.href = "/api/auth/notion";
	};

	const handleFacebookSignIn = () => {
		window.location.href = "/api/auth/facebook";
	};

	const handleFigmaSignIn = () => {
		window.location.href = "/api/auth/figma";
	};

	return (
		<>
			{/* Google One Tap - Shows automatically for returning Google users */}
			{googleClientId && (
				<GoogleOneTap
					clientId={googleClientId}
					onSuccess={(credential) => {
						console.log("Google One Tap successful:", credential);
					}}
					onError={(error) => {
						console.error("Google One Tap error:", error);
					}}
					autoSelect={true}
					cancelOnTapOutside={false}
				/>
			)}

			<AuthCard
				title="Welcome Back"
				description="Sign in to your account"
				footer={
					<p className="text-sm text-muted-foreground text-center w-full">
						Don't have an account?{" "}
						<a href="/account/signup" className="text-primary hover:underline">
							Sign up
						</a>
					</p>
				}
			>
				<SocialLoginButtons
					mode="signin"
					onGithubClick={handleGithubSignIn}
					onGoogleClick={handleGoogleSignIn}
					onAppleClick={handleAppleSignIn}
					onDiscordClick={handleDiscordSignIn}
					onNotionClick={handleNotionSignIn}
					onFacebookClick={handleFacebookSignIn}
					onFigmaClick={handleFigmaSignIn}
				/>

			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="emailOrUsername">Email or Username</Label>
					<Input
						id="emailOrUsername"
						type="text"
						placeholder="your@email.com or yourname"
						value={emailOrUsername}
						onChange={(e) => setEmailOrUsername(e.target.value)}
						required
					/>
				</div>

				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<Label htmlFor="password">Password</Label>
						<a
							href="/account/forgot-password"
							className="text-xs text-primary hover:underline"
						>
							Forgot password?
						</a>
					</div>
					<Input
						id="password"
						type="password"
						placeholder="••••••••"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>
				</div>

				<Button type="submit" className="w-full" disabled={loading}>
					{loading ? "Signing in..." : "Sign In"}
				</Button>

				<div className="relative my-4">
					<div className="absolute inset-0 flex items-center">
						<span className="w-full border-t" />
					</div>
					<div className="relative flex justify-center text-xs uppercase">
						<span className="bg-background px-2 text-muted-foreground">Or</span>
					</div>
				</div>

				<div className="flex flex-col gap-2">
					<Button variant="outline" className="w-full" asChild>
						<a href="/account/email-otp">Sign in with email code</a>
					</Button>
					<Button variant="outline" className="w-full" asChild>
						<a href="/account/magic-link">Sign in with magic link</a>
					</Button>
				</div>
			</form>
		</AuthCard>
		</>
	);
}
