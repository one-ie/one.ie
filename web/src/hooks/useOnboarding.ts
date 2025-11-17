/**
 * useOnboarding - React hooks for Wave 1 Creator Onboarding
 *
 * Provides hooks for all onboarding mutations and queries
 * Uses ConvexHttpClient to call backend APIs
 */

import { ConvexHttpClient } from "convex/browser";
import { useCallback, useState } from "react";

// Initialize Convex client - URL comes from environment variable
const convexUrl = import.meta.env.PUBLIC_CONVEX_URL;
const client = new ConvexHttpClient(convexUrl);

// Error type for consistent error handling
export interface OnboardingError {
  message: string;
  field?: string;
  code?: string;
}

// ============================================================================
// Signup Hook - Named export for compatibility
// ============================================================================

export interface SignupInput {
  email: string;
  password: string;
  agreeToTerms?: boolean;
  agreeToPrivacy?: boolean;
}

export interface SignupResponse {
  userId: string;
  workspaceId?: string;
  success: boolean;
}

export function useSignupOnboarding() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<OnboardingError | null>(null);

  const mutate = useCallback(async (input: SignupInput): Promise<SignupResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await client.mutation("mutations:auth:signup", input);

      if (!result.success) {
        setError({
          message: result.error || "Signup failed",
          code: "SIGNUP_FAILED",
        });
        return null;
      }

      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError({ message, code: "SIGNUP_ERROR" });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

// Alias for backward compatibility
export function useSignup() {
  return useSignupOnboarding();
}

// ============================================================================
// Email Verification Hook - Named export for compatibility
// ============================================================================

export interface VerifyEmailInput {
  userId?: string;
  code: string;
}

export function useVerifyEmailOnboarding() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<OnboardingError | null>(null);

  const mutate = useCallback(async (input: VerifyEmailInput): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const result = await client.mutation("mutations:auth:verifyEmail", input);

      if (!result.success) {
        setError({
          message: result.error || "Verification failed",
          field: "code",
        });
        return false;
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError({ message });
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

// Alias for backward compatibility
export function useVerifyEmail() {
  const { mutate: verify, ...rest } = useVerifyEmailOnboarding();
  return { verify, ...rest };
}

// ============================================================================
// Resend Code Hook
// ============================================================================

export interface ResendCodeInput {
  userId?: string;
  email?: string;
}

export function useResendVerificationCode() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<OnboardingError | null>(null);
  const [nextRetryAt, setNextRetryAt] = useState<number | null>(null);

  const mutate = useCallback(async (input: ResendCodeInput): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const result = await client.mutation("mutations:auth:resendVerificationCode", input);

      if (!result.success) {
        const message = result.error || "Resend failed";
        const retryIn = result.retryAfter || 0;
        setNextRetryAt(Date.now() + retryIn * 1000);
        setError({
          message,
          code: "RATE_LIMITED",
        });
        return false;
      }

      setNextRetryAt(null);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError({ message });
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error, nextRetryAt };
}

// ============================================================================
// Update Profile Hook
// ============================================================================

export interface UpdateProfileInput {
  userId: string;
  displayName?: string;
  username?: string;
  bio?: string;
  avatar?: string;
}

export function useUpdateProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<OnboardingError | null>(null);

  const update = useCallback(async (input: UpdateProfileInput): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const result = await client.mutation("mutations:auth:updateProfile", input);

      if (!result.success) {
        setError({
          message: result.error || "Profile update failed",
          field: result.field,
        });
        return false;
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError({ message });
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { update, loading, error };
}

// ============================================================================
// Create Workspace Hook
// ============================================================================

export interface CreateWorkspaceInput {
  userId: string;
  name: string;
  slug: string;
  description?: string;
}

export interface CreateWorkspaceResponse {
  workspaceId: string;
  slug: string;
  name: string;
}

export function useCreateWorkspace() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<OnboardingError | null>(null);

  const create = useCallback(
    async (input: CreateWorkspaceInput): Promise<CreateWorkspaceResponse | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await client.mutation("mutations:workspace:createWorkspace", input);

        if (!result.success) {
          setError({
            message: result.error || "Workspace creation failed",
            field: result.field,
          });
          return null;
        }

        return result.data;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError({ message });
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { create, loading, error };
}

// ============================================================================
// Invite Team Member Hook
// ============================================================================

export interface InviteTeamMemberInput {
  workspaceId: string;
  email: string;
  role?: string;
}

export function useInviteTeamMember() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<OnboardingError | null>(null);

  const invite = useCallback(async (input: InviteTeamMemberInput): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const result = await client.mutation("mutations:workspace:inviteTeamMember", input);

      if (!result.success) {
        setError({
          message: result.error || "Invitation failed",
          field: "email",
        });
        return false;
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError({ message });
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { invite, loading, error };
}

// ============================================================================
// Connect Wallet Hook
// ============================================================================

export interface ConnectWalletInput {
  userId: string;
  walletAddress: string;
  chainId?: number;
  walletType?: string;
}

export function useConnectWallet() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<OnboardingError | null>(null);

  const connect = useCallback(async (input: ConnectWalletInput): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const result = await client.mutation("mutations:workspace:connectWallet", input);

      if (!result.success) {
        setError({
          message: result.error || "Wallet connection failed",
          field: "walletAddress",
        });
        return false;
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError({ message });
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { connect, loading, error };
}

// ============================================================================
// Add Skills Hook
// ============================================================================

export interface AddSkillsInput {
  userId: string;
  expertise: string[];
  interests: string[];
  niche: string[];
}

export function useAddSkills() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<OnboardingError | null>(null);

  const add = useCallback(async (input: AddSkillsInput): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const result = await client.mutation("mutations:workspace:addSkills", input);

      if (!result.success) {
        setError({
          message: result.error || "Skills update failed",
        });
        return false;
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError({ message });
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { add, loading, error };
}

// ============================================================================
// Check Username Available Hook
// ============================================================================

export function useCheckUsernameAvailable() {
  const [loading, setLoading] = useState(false);

  const check = useCallback(async (username: string): Promise<boolean> => {
    setLoading(true);

    try {
      const result = await client.query("queries:onboarding:checkUsernameAvailable", { username });
      return result.available ?? false;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { check, loading };
}

// ============================================================================
// Check Workspace Slug Available Hook
// ============================================================================

export function useCheckWorkspaceSlugAvailable() {
  const [loading, setLoading] = useState(false);

  const check = useCallback(async (slug: string): Promise<boolean> => {
    setLoading(true);

    try {
      const result = await client.query("queries:onboarding:checkWorkspaceSlugAvailable", { slug });
      return result.available ?? false;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { check, loading };
}

// ============================================================================
// Get Onboarding Status Hook
// ============================================================================

export interface OnboardingStatus {
  userId: string;
  currentStep: string;
  completed: boolean;
  completionDate?: number;
  progress: number;
  steps: {
    emailVerified: boolean;
    profileComplete: boolean;
    workspaceCreated: boolean;
    teamInvited: boolean;
    walletConnected: boolean;
    skillsAdded: boolean;
  };
}

export function useOnboardingStatus(userId: string | null) {
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!userId) return;

    setLoading(true);

    try {
      const result = await client.query("queries:onboarding:getOnboardingStatus", { userId });
      setStatus(result);
    } catch {
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return { status, loading, fetch };
}
