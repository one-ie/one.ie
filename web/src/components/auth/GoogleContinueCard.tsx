import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronRight, X } from "lucide-react";

interface GoogleAccount {
	id: string;
	email: string;
	name: string;
	image?: string;
	provider: string;
}

interface GoogleContinueCardProps {
	onContinue?: () => void;
	onDismiss?: () => void;
	showDismiss?: boolean;
}

/**
 * Google Continue Card Component
 *
 * Displays a beautiful card showing logged-in Google users with "Continue as [Name]" button.
 * Automatically detects if user has an active Google session and shows their profile.
 *
 * @example
 * ```tsx
 * <GoogleContinueCard
 *   onContinue={() => router.push('/dashboard')}
 *   showDismiss={true}
 * />
 * ```
 */
export function GoogleContinueCard({
	onContinue,
	onDismiss,
	showDismiss = true,
}: GoogleContinueCardProps) {
	const [googleAccount, setGoogleAccount] = useState<GoogleAccount | null>(
		null,
	);
	const [loading, setLoading] = useState(true);
	const [isSigningIn, setIsSigningIn] = useState(false);

	useEffect(() => {
		checkGoogleSession();
	}, []);

	const checkGoogleSession = async () => {
		try {
			// Get current session
			const { data: session } = await authClient.useSession();

			if (session?.user) {
				// Check if user has a Google account linked
				const accounts = await authClient.user.listAccounts();

				const googleAcc = accounts?.find(
					(acc: any) => acc.providerId === "google",
				);

				if (googleAcc) {
					setGoogleAccount({
						id: session.user.id,
						email: session.user.email,
						name: session.user.name || session.user.email,
						image: session.user.image,
						provider: "google",
					});
				}
			}
		} catch (error) {
			console.error("Error checking Google session:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleContinue = async () => {
		if (!googleAccount) return;

		setIsSigningIn(true);
		try {
			// User is already logged in, just trigger callback
			onContinue?.();
		} catch (error) {
			console.error("Error continuing with Google:", error);
		} finally {
			setIsSigningIn(false);
		}
	};

	const handleDismiss = () => {
		setGoogleAccount(null);
		onDismiss?.();
	};

	// Don't render if no Google account or still loading
	if (loading || !googleAccount) {
		return null;
	}

	// Get initials for avatar fallback
	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	return (
		<Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5 shadow-lg transition-all hover:shadow-xl hover:border-primary/40">
			{showDismiss && (
				<button
					onClick={handleDismiss}
					className="absolute top-3 right-3 rounded-full p-1 hover:bg-muted transition-colors"
					aria-label="Dismiss"
				>
					<X className="h-4 w-4 text-muted-foreground" />
				</button>
			)}

			<CardContent className="p-6">
				<div className="flex items-center gap-4">
					{/* Google Logo */}
					<div className="shrink-0">
						<div className="relative">
							<Avatar className="h-14 w-14 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
								<AvatarImage
									src={googleAccount.image}
									alt={googleAccount.name}
								/>
								<AvatarFallback className="bg-primary/10 text-primary font-semibold">
									{getInitials(googleAccount.name)}
								</AvatarFallback>
							</Avatar>
							{/* Google Badge */}
							<div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
								<svg className="h-5 w-5" viewBox="0 0 24 24">
									<path
										fill="#4285F4"
										d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
									/>
									<path
										fill="#34A853"
										d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
									/>
									<path
										fill="#FBBC05"
										d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
									/>
									<path
										fill="#EA4335"
										d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
									/>
								</svg>
							</div>
						</div>
					</div>

					{/* User Info */}
					<div className="flex-1 min-w-0">
						<p className="text-sm text-muted-foreground mb-1">
							Continue as
						</p>
						<p className="font-semibold text-foreground truncate">
							{googleAccount.name}
						</p>
						<p className="text-sm text-muted-foreground truncate">
							{googleAccount.email}
						</p>
					</div>

					{/* Continue Button */}
					<Button
						onClick={handleContinue}
						disabled={isSigningIn}
						size="lg"
						className="shrink-0 gap-2 shadow-md"
					>
						{isSigningIn ? (
							<>
								<div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
								Continuing...
							</>
						) : (
							<>
								Continue
								<ChevronRight className="h-4 w-4" />
							</>
						)}
					</Button>
				</div>

				{/* Bottom hint */}
				<p className="text-xs text-muted-foreground mt-4 text-center">
					Not you?{" "}
					<button
						onClick={handleDismiss}
						className="underline hover:text-foreground transition-colors"
					>
						Use a different account
					</button>
				</p>
			</CardContent>
		</Card>
	);
}
