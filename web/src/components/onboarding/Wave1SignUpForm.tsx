/**
 * Wave1SignUpForm - Wave 1 Creator Onboarding Signup
 * Uses the Wave 1 signup mutation (6-digit code verification)
 * NOT the old Better Auth flow
 */

import { AlertCircle, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSignupOnboarding } from "@/hooks/useOnboarding";

interface Wave1SignUpFormProps {
  onSuccess?: (data: { userId: string; email: string; displayName: string }) => void;
  onError?: (error: string) => void;
}

export function Wave1SignUpForm({ onSuccess, onError }: Wave1SignUpFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [agreeToPrivacy, setAgreeToPrivacy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { mutate: signup, loading } = useSignupOnboarding();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!email.includes("@")) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = "Password must contain at least one uppercase letter";
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = "Password must contain at least one number";
    }

    if (!displayName) {
      newErrors.displayName = "Name is required";
    } else if (displayName.length < 2) {
      newErrors.displayName = "Name must be at least 2 characters";
    }

    if (!agreeToTerms) {
      newErrors.terms = "You must agree to the Terms of Service";
    }

    if (!agreeToPrivacy) {
      newErrors.privacy = "You must agree to the Privacy Policy";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Call Wave 1 signup mutation
    try {
      const result = await signup({
        email,
        password,
        displayName,
        agreeToTerms,
        agreeToPrivacy,
      });

      if (result) {
        toast.success("Account created! Check your email for the verification code.", {
          description: `A 6-digit code has been sent to ${email}`,
        });

        // Call success callback
        if (onSuccess) {
          onSuccess({
            userId: result.userId,
            email,
            displayName,
          });
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An unexpected error occurred";
      toast.error("Signup failed", {
        description: errorMsg,
      });
      if (onError) {
        onError(errorMsg);
      }
    }
  };

  return (
    <div className="space-y-6 w-full max-w-md">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold">Create Your Account</h2>
        <p className="text-sm text-muted-foreground">Start your creator journey on ONE</p>
      </div>

      {/* Terms Notice */}
      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-sm text-blue-800">
          We'll send a 6-digit verification code to your email (expires in 15 minutes)
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Display Name */}
        <div className="space-y-2">
          <Label htmlFor="displayName">Your Name</Label>
          <Input
            id="displayName"
            type="text"
            placeholder="Sarah Johnson"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={loading}
            className={errors.displayName ? "border-red-500" : ""}
          />
          {errors.displayName && <p className="text-sm text-red-500">{errors.displayName}</p>}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className={errors.password ? "border-red-500" : ""}
          />
          {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
          <PasswordStrengthIndicator password={password} />
        </div>

        {/* Terms */}
        <div className="space-y-3">
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              disabled={loading}
              className="mt-1"
            />
            <span className="text-sm text-muted-foreground">
              I agree to the{" "}
              <a href="/terms" className="text-primary hover:underline">
                Terms of Service
              </a>
            </span>
          </label>
          {errors.terms && <p className="text-sm text-red-500">{errors.terms}</p>}

          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={agreeToPrivacy}
              onChange={(e) => setAgreeToPrivacy(e.target.checked)}
              disabled={loading}
              className="mt-1"
            />
            <span className="text-sm text-muted-foreground">
              I agree to the{" "}
              <a href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </a>
            </span>
          </label>
          {errors.privacy && <p className="text-sm text-red-500">{errors.privacy}</p>}
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full" disabled={loading} size="lg">
          {loading ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Creating account...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Create Account & Get Code
            </>
          )}
        </Button>
      </form>

      {/* Info */}
      <div className="text-center text-sm text-muted-foreground">
        <p>
          Already have an account?{" "}
          <a href="/account/signin" className="text-primary hover:underline">
            Sign in here
          </a>
        </p>
      </div>
    </div>
  );
}
