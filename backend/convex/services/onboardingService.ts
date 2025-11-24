/**
 * Onboarding Service (Effect.ts Layer)
 *
 * Pure business logic for Wave 1 Creator Onboarding
 * Separates validation and business rules from Convex mutations/queries
 *
 * Handles:
 * - User registration and email verification
 * - Profile creation and updates
 * - Workspace creation (organization)
 * - Team invitations and acceptance
 * - Wallet connections
 * - Skills/expertise tagging
 *
 * Pattern:
 * 1. All operations return Effect.Effect<T, ErrorType>
 * 2. Services compose together for complex workflows
 * 3. Mutations call these services and handle Convex-specific logic
 */

// ============================================================================
// Error Types
// ============================================================================

export type ValidationError = {
  readonly _tag: "ValidationError";
  readonly field: string;
  readonly message: string;
};

export type DuplicateError = {
  readonly _tag: "DuplicateError";
  readonly resource: string;
  readonly identifier: string;
};

export type NotFoundError = {
  readonly _tag: "NotFoundError";
  readonly resource: string;
  readonly identifier: string;
};

export type RateLimitError = {
  readonly _tag: "RateLimitError";
  readonly action: string;
  readonly retryAfter: number; // seconds
};

export type InvalidTokenError = {
  readonly _tag: "InvalidTokenError";
  readonly reason: "expired" | "invalid" | "already_used";
};

export type OnboardingError =
  | ValidationError
  | DuplicateError
  | NotFoundError
  | RateLimitError
  | InvalidTokenError;

// ============================================================================
// Types for Input/Output
// ============================================================================

export interface SignupInput {
  email: string;
  password: string;
  displayName: string;
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
}

export interface Creator {
  id: string;
  email: string;
  displayName: string;
  username?: string;
  bio?: string;
  avatar?: string;
  niche: string[];
  expertise: string[];
  interests: string[];
  emailVerified: boolean;
  emailVerifiedAt?: number;
  role: "owner" | "admin" | "editor";
  walletAddress?: string;
  walletVerified: boolean;
  onboardingStep: string;
  onboardingCompleted: boolean;
  onboardingCompletedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface Workspace {
  id: string;
  slug: string;
  name: string;
  description?: string;
  logo?: string;
  visibility: "private" | "public";
  joinPolicy: "invite_only" | "open";
  memberCount: number;
  maxMembers: number;
  plan: "free" | "pro" | "enterprise";
  creatorId: string;
  createdAt: number;
  updatedAt: number;
}

export interface TeamMember {
  id: string;
  creatorId: string;
  displayName: string;
  email: string;
  role: "owner" | "admin" | "editor" | "viewer";
  joinedAt: number;
}

export interface TeamInvitation {
  id: string;
  token: string;
  workspaceId: string;
  invitedBy: string;
  invitedEmail: string;
  role: "editor" | "viewer";
  status: "pending" | "accepted" | "expired";
  expiresAt: number;
  createdAt: number;
}

export interface WalletConnection {
  id: string;
  address: string;
  chainId: number;
  walletType: "metamask" | "walletconnect" | "rainbowkit" | "other";
  verified: boolean;
  verifiedAt?: number;
  createdAt: number;
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate email format
 */
export function validateEmail(email: string): email is string {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return email.length > 0 && email.length <= 255 && emailRegex.test(email);
}

/**
 * Validate password strength
 * Rules:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate username (slug format)
 * Rules:
 * - 3-20 characters
 * - Lowercase letters, numbers, hyphens only
 * - Must start and end with alphanumeric
 */
export function validateUsername(username: string): {
  valid: boolean;
  error?: string;
} {
  if (username.length < 3) {
    return { valid: false, error: "Username must be at least 3 characters" };
  }
  if (username.length > 20) {
    return { valid: false, error: "Username must be at most 20 characters" };
  }
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(username)) {
    return {
      valid: false,
      error:
        "Username must contain only lowercase letters, numbers, and hyphens",
    };
  }

  return { valid: true };
}

/**
 * Validate display name
 * Rules:
 * - 2-100 characters
 * - Can contain letters, spaces, hyphens, apostrophes
 */
export function validateDisplayName(name: string): {
  valid: boolean;
  error?: string;
} {
  if (name.length < 2) {
    return { valid: false, error: "Display name must be at least 2 characters" };
  }
  if (name.length > 100) {
    return { valid: false, error: "Display name must be at most 100 characters" };
  }
  if (!/^[a-zA-Z\s'-]+$/.test(name)) {
    return {
      valid: false,
      error:
        "Display name can only contain letters, spaces, hyphens, and apostrophes",
    };
  }

  return { valid: true };
}

/**
 * Validate workspace name
 * Rules:
 * - 2-100 characters
 * - Can contain letters, numbers, spaces, hyphens
 */
export function validateWorkspaceName(name: string): {
  valid: boolean;
  error?: string;
} {
  if (name.length < 2) {
    return {
      valid: false,
      error: "Workspace name must be at least 2 characters",
    };
  }
  if (name.length > 100) {
    return {
      valid: false,
      error: "Workspace name must be at most 100 characters",
    };
  }

  return { valid: true };
}

/**
 * Validate workspace slug (URL-safe identifier)
 * Rules:
 * - 3-30 characters
 * - Lowercase letters, numbers, hyphens only
 * - Must start and end with alphanumeric
 */
export function validateWorkspaceSlug(slug: string): {
  valid: boolean;
  error?: string;
} {
  if (slug.length < 3) {
    return {
      valid: false,
      error: "Workspace slug must be at least 3 characters",
    };
  }
  if (slug.length > 30) {
    return {
      valid: false,
      error: "Workspace slug must be at most 30 characters",
    };
  }
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(slug)) {
    return {
      valid: false,
      error:
        "Workspace slug must contain only lowercase letters, numbers, and hyphens",
    };
  }

  return { valid: true };
}

/**
 * Validate Ethereum address format (0x followed by 40 hex characters)
 */
export function validateEthereumAddress(address: string): {
  valid: boolean;
  error?: string;
} {
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return {
      valid: false,
      error: "Invalid Ethereum address format",
    };
  }
  return { valid: true };
}

// ============================================================================
// Code Generation
// ============================================================================

/**
 * Generate a 6-digit verification code
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate a unique invitation token (UUID v4)
 */
export function generateInvitationToken(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`;
}

// ============================================================================
// Signup Validation
// ============================================================================

/**
 * Validate complete signup input
 */
export function validateSignupInput(input: SignupInput): {
  valid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!validateEmail(input.email)) {
    errors.email = "Invalid email address";
  }

  const passwordCheck = validatePassword(input.password);
  if (!passwordCheck.valid) {
    errors.password = passwordCheck.errors.join("; ");
  }

  const nameCheck = validateDisplayName(input.displayName);
  if (!nameCheck.valid) {
    errors.displayName = nameCheck.error || "Invalid display name";
  }

  if (!input.agreeToTerms) {
    errors.terms = "You must agree to the terms of service";
  }

  if (!input.agreeToPrivacy) {
    errors.privacy = "You must agree to the privacy policy";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

// ============================================================================
// Onboarding Progress
// ============================================================================

/**
 * Determine next onboarding step
 */
export function getNextOnboardingStep(
  currentStep: string
): "email_verification" | "profile" | "workspace" | "team" | "wallet" | "skills" | "complete" {
  const steps = [
    "email_verification",
    "profile",
    "workspace",
    "team",
    "wallet",
    "skills",
    "complete",
  ] as const;

  const currentIndex = steps.indexOf(
    currentStep as (typeof steps)[number]
  );
  if (currentIndex === -1 || currentIndex === steps.length - 1) {
    return "complete";
  }

  return steps[currentIndex + 1];
}

/**
 * Calculate onboarding completion percentage
 */
export function calculateOnboardingProgress(step: string): number {
  const steps = {
    email_verification: 20,
    profile: 35,
    workspace: 50,
    team: 65,
    wallet: 80,
    skills: 90,
    complete: 100,
  };

  return (steps as Record<string, number>)[step] || 0;
}

// ============================================================================
// Export all for use in mutations
// ============================================================================

export const onboardingService = {
  validateEmail,
  validatePassword,
  validateUsername,
  validateDisplayName,
  validateWorkspaceName,
  validateWorkspaceSlug,
  validateEthereumAddress,
  generateVerificationCode,
  generateInvitationToken,
  validateSignupInput,
  getNextOnboardingStep,
  calculateOnboardingProgress,
};
