/**
 * Email OTP Form - Passwordless authentication via email code
 * Cycle 46: Email OTP plugin implementation
 *
 * FEATURES:
 * - Email input with validation
 * - 6-digit OTP code input
 * - Resend code with cooldown timer
 * - Error handling
 * - Auto-focus on code input
 */

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { AuthCard } from "./AuthCard";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Mail, ArrowLeft } from "lucide-react";

type Step = "email" | "code";

export function EmailOtpForm() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [canResendAt, setCanResendAt] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number>(0);

  const requestOtp = useMutation(api.emailOtp.requestOtp);
  const verifyOtp = useMutation(api.emailOtp.verifyOtp);

  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Countdown timer for resend button
  useEffect(() => {
    if (!canResendAt) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((canResendAt - now) / 1000));

      setCountdown(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        setCanResendAt(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [canResendAt]);

  /**
   * Step 1: Request OTP code
   */
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Email required", {
        description: "Please enter your email address",
      });
      return;
    }

    setIsRequestingOtp(true);

    try {
      const result = await requestOtp({ email });

      if (result.success) {
        setExpiresAt(result.expiresAt);
        setCanResendAt(Date.now() + 60 * 1000); // Can resend after 1 minute
        setStep("code");

        toast.success("Code sent!", {
          description: `Check your email at ${email} for a 6-digit code.`,
        });

        // In development, show code in console
        if (result.code) {
          console.log(`[DEV MODE] Your OTP code: ${result.code}`);
          toast.info("Development Mode", {
            description: `Your code is: ${result.code}`,
            duration: 10000,
          });
        }
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      const errorMessage = error?.message || "Failed to send code";

      toast.error("Unable to send code", {
        description: errorMessage,
      });
    } finally {
      setIsRequestingOtp(false);
    }
  };

  /**
   * Resend OTP code
   */
  const handleResendOtp = async () => {
    if (canResendAt && Date.now() < canResendAt) {
      toast.error("Please wait", {
        description: `You can resend the code in ${countdown} seconds`,
      });
      return;
    }

    setIsRequestingOtp(true);

    try {
      const result = await requestOtp({ email });

      if (result.success) {
        setExpiresAt(result.expiresAt);
        setCanResendAt(Date.now() + 60 * 1000); // Can resend after 1 minute
        setCode(""); // Clear previous code

        toast.success("New code sent!", {
          description: "Check your email for a fresh 6-digit code.",
        });

        // In development, show code in console
        if (result.code) {
          console.log(`[DEV MODE] Your OTP code: ${result.code}`);
          toast.info("Development Mode", {
            description: `Your new code is: ${result.code}`,
            duration: 10000,
          });
        }
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      const errorMessage = error?.message || "Failed to resend code";

      toast.error("Unable to resend code", {
        description: errorMessage,
      });
    } finally {
      setIsRequestingOtp(false);
    }
  };

  /**
   * Step 2: Verify OTP code
   */
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (code.length !== 6) {
      toast.error("Invalid code", {
        description: "Please enter the complete 6-digit code",
      });
      return;
    }

    setIsVerifying(true);

    try {
      const result = await verifyOtp({ email, code });

      if (result.token) {
        // Store session token
        localStorage.setItem("sessionToken", result.token);

        toast.success(result.isNewUser ? "Welcome!" : "Welcome back!", {
          description: result.isNewUser
            ? "Your account has been created. Redirecting..."
            : "Successfully signed in. Redirecting...",
        });

        setTimeout(() => {
          window.location.href = "/account";
        }, 1000);
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      const errorMessage = error?.message || "Invalid code";

      toast.error("Verification failed", {
        description: errorMessage,
      });

      // Clear code on error
      setCode("");
    } finally {
      setIsVerifying(false);
    }
  };

  /**
   * Go back to email input
   */
  const handleBackToEmail = () => {
    setStep("email");
    setCode("");
    setExpiresAt(null);
    setCanResendAt(null);
  };

  // Email input step
  if (step === "email") {
    return (
      <AuthCard
        title="Sign in with email"
        description="Enter your email to receive a one-time code"
        footer={
          <p className="text-sm text-muted-foreground text-center w-full">
            Prefer a password?{" "}
            <a href="/account/signin" className="text-primary hover:underline">
              Sign in with password
            </a>
          </p>
        }
      >
        <form onSubmit={handleRequestOtp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
                autoFocus
              />
            </div>
            <p className="text-xs text-muted-foreground">
              We'll send a 6-digit code to your email
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isRequestingOtp}>
            {isRequestingOtp ? "Sending code..." : "Send code"}
          </Button>
        </form>
      </AuthCard>
    );
  }

  // OTP verification step
  return (
    <AuthCard
      title="Enter verification code"
      description={`We sent a 6-digit code to ${email}`}
      footer={
        <p className="text-sm text-muted-foreground text-center w-full">
          Wrong email?{" "}
          <button
            onClick={handleBackToEmail}
            className="text-primary hover:underline"
          >
            Change email
          </button>
        </p>
      }
    >
      <form onSubmit={handleVerifyOtp} className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="otp-input" className="text-center block">
            Verification code
          </Label>
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={code}
              onChange={(value) => setCode(value)}
              autoFocus
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <p className="text-xs text-center text-muted-foreground">
            {expiresAt && (
              <>Code expires in {Math.max(0, Math.ceil((expiresAt - Date.now()) / 60000))} minutes</>
            )}
          </p>
        </div>

        <div className="space-y-3">
          <Button type="submit" className="w-full" disabled={isVerifying || code.length !== 6}>
            {isVerifying ? "Verifying..." : "Verify code"}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={isRequestingOtp || (canResendAt !== null && Date.now() < canResendAt)}
              className="text-sm text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {canResendAt && Date.now() < canResendAt
                ? `Resend code in ${countdown}s`
                : "Resend code"}
            </button>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleBackToEmail}
            className="w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to email
          </Button>
        </div>
      </form>
    </AuthCard>
  );
}
