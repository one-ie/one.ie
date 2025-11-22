/**
 * EmailVerificationForm - 6-digit email verification code input
 *
 * Allows users to enter the 6-digit code sent to their email
 * with automatic resend and countdown timer
 */

import { AlertCircle, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	useResendVerificationCode,
	useVerifyEmailOnboarding,
} from "@/hooks/useOnboarding";

interface EmailVerificationFormProps {
	email: string;
	onSuccess: () => void;
	onBack?: () => void;
}

export function EmailVerificationForm({
	email,
	onSuccess,
	onBack,
}: EmailVerificationFormProps) {
	const [code, setCode] = useState("");
	const [codeError, setCodeError] = useState("");
	const [resendCountdown, setResendCountdown] = useState(0);
	const { mutate: verify, loading: verifying } = useVerifyEmailOnboarding();
	const {
		mutate: resend,
		loading: resending,
		nextRetryAt,
	} = useResendVerificationCode();

	// Countdown timer for resend
	useEffect(() => {
		if (!nextRetryAt) {
			setResendCountdown(0);
			return;
		}

		const interval = setInterval(() => {
			const remaining = Math.max(
				0,
				Math.ceil((nextRetryAt - Date.now()) / 1000),
			);
			setResendCountdown(remaining);

			if (remaining <= 0) {
				clearInterval(interval);
			}
		}, 1000);

		return () => clearInterval(interval);
	}, [nextRetryAt]);

	// Format code input (6 digits only)
	const handleCodeChange = (value: string) => {
		const cleaned = value.replace(/\D/g, "").slice(0, 6);
		setCode(cleaned);
		setCodeError("");
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!code || code.length !== 6) {
			setCodeError("Please enter a valid 6-digit code");
			return;
		}

		try {
			const result = await verify({ email, code });

			if (result.success) {
				toast.success("Email verified!", {
					description: "Your email has been verified successfully.",
				});
				onSuccess();
			}
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Verification failed";

			if (message.includes("Too many failed attempts")) {
				setCodeError("Too many incorrect attempts. Please request a new code.");
			} else if (message.includes("expired")) {
				setCodeError("Code has expired. Please request a new one.");
			} else if (message.includes("Incorrect")) {
				setCodeError("Incorrect code. Please try again.");
			} else {
				setCodeError(message);
			}
		}
	};

	const handleResendCode = async () => {
		if (resendCountdown > 0) return;

		try {
			await resend(email);
			toast.success("Code sent!", {
				description: "A new verification code has been sent to your email.",
			});
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Failed to resend code";
			toast.error("Resend failed", { description: message });
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{/* Info Alert */}
			<Alert>
				<AlertCircle className="h-4 w-4" />
				<AlertDescription>
					We've sent a 6-digit verification code to{" "}
					<span className="font-semibold">{email}</span>
				</AlertDescription>
			</Alert>

			{/* Code Input */}
			<div className="space-y-2">
				<Label htmlFor="code">Verification Code</Label>
				<Input
					id="code"
					type="text"
					placeholder="000000"
					value={code}
					onChange={(e) => handleCodeChange(e.target.value)}
					maxLength={6}
					className="text-center text-lg tracking-widest font-mono"
					disabled={verifying}
					autoComplete="one-time-code"
				/>
				{codeError && (
					<p className="text-sm font-medium text-destructive">{codeError}</p>
				)}
			</div>

			{/* Submit Button */}
			<Button
				type="submit"
				className="w-full"
				disabled={verifying || code.length !== 6}
			>
				{verifying ? "Verifying..." : "Verify Email"}
			</Button>

			{/* Resend Section */}
			<div className="space-y-3 pt-2 border-t">
				<p className="text-sm text-muted-foreground">
					Didn't receive the code?
				</p>

				{resendCountdown > 0 ? (
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Clock className="w-4 h-4" />
						<span>You can resend in {resendCountdown}s</span>
					</div>
				) : (
					<Button
						type="button"
						variant="outline"
						className="w-full"
						onClick={handleResendCode}
						disabled={resending}
					>
						{resending ? "Sending..." : "Resend Code"}
					</Button>
				)}
			</div>

			{/* Back Button */}
			{onBack && (
				<Button
					type="button"
					variant="ghost"
					className="w-full"
					onClick={onBack}
					disabled={verifying}
				>
					Back
				</Button>
			)}
		</form>
	);
}
