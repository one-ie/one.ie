/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * BetterAuthProvider - Authentication Provider Implementation
 *
 * Wraps Better Auth + Convex auth to implement DataProvider auth interface.
 * Maps backend Convex auth mutations to typed Effect operations.
 *
 * IMPORTANT: This is a THIN wrapper. It calls existing Convex auth mutations
 * without breaking them. Zero changes to backend required.
 */

import type { ConvexReactClient } from "convex/react";
import { Effect } from "effect";
import type {
  AuthError,
  AuthResult,
  Disable2FAArgs,
  LoginArgs,
  MagicLinkArgs,
  PasswordResetArgs,
  PasswordResetCompleteArgs,
  SignupArgs,
  TwoFactorSetup,
  TwoFactorStatus,
  User,
  Verify2FAArgs,
  VerifyEmailArgs,
} from "./DataProvider";
import {
  EmailAlreadyExistsError,
  EmailNotVerifiedError,
  Invalid2FACodeError,
  InvalidCredentialsError,
  InvalidTokenError,
  NetworkError,
  RateLimitExceededError,
  TokenExpiredError,
  TwoFactorRequiredError,
  UserNotFoundError,
  WeakPasswordError,
} from "./DataProvider";

/**
 * Error patterns for matching and mapping backend errors to typed errors
 */
interface ErrorPattern {
  matchers: (msg: string) => boolean;
  error: (msg: string) => AuthError;
}

const ERROR_PATTERNS: ErrorPattern[] = [
  {
    matchers: (msg) =>
      msg.includes("invalid email or password") ||
      msg.includes("invalid password") ||
      msg.includes("incorrect"),
    error: () => new InvalidCredentialsError(),
  },
  {
    matchers: (msg) => msg.includes("not found") || msg.includes("no user"),
    error: () => new UserNotFoundError(),
  },
  {
    matchers: (msg) => msg.includes("already exists") || msg.includes("email is already in use"),
    error: () => new EmailAlreadyExistsError(),
  },
  {
    matchers: (msg) => msg.includes("password") && msg.includes("weak"),
    error: () => new WeakPasswordError(),
  },
  {
    matchers: (msg) => msg.includes("token") && msg.includes("expired"),
    error: () => new TokenExpiredError(),
  },
  {
    matchers: (msg) => msg.includes("invalid") && (msg.includes("token") || msg.includes("link")),
    error: () => new InvalidTokenError(),
  },
  {
    matchers: (msg) => msg.includes("rate limit") || msg.includes("too many"),
    error: () => new RateLimitExceededError(),
  },
  {
    matchers: (msg) => msg.includes("email") && msg.includes("verified"),
    error: () => new EmailNotVerifiedError(),
  },
  {
    matchers: (msg) => msg.includes("2fa") || msg.includes("two-factor"),
    error: (msg) =>
      msg.includes("required") ? new TwoFactorRequiredError() : new Invalid2FACodeError(),
  },
];

/**
 * Parse backend error message to typed AuthError
 * Uses pattern matching for centralized error mapping
 */
function parseAuthError(error: unknown): AuthError {
  const message = String(error).toLowerCase();

  for (const pattern of ERROR_PATTERNS) {
    if (pattern.matchers(message)) {
      return pattern.error(message);
    }
  }

  // Default to network error
  return new NetworkError(String(error));
}

/**
 * Get auth token from cookies (client-side)
 */
function getAuthToken(): string | null {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie.split("; ");
  const authCookie = cookies.find((row) => row.startsWith("auth_token="));
  return authCookie ? authCookie.split("=")[1] : null;
}

/**
 * Set auth token in cookies (client-side)
 */
function setAuthToken(token: string) {
  if (typeof document === "undefined") return;
  // SameSite=Lax is required for cookies to be sent with fetch requests
  document.cookie = `auth_token=${token}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`; // 30 days
}

/**
 * Clear auth token from cookies (client-side)
 */
function clearAuthToken() {
  if (typeof document === "undefined") return;
  document.cookie = "auth_token=; path=/; max-age=0";
}

/**
 * Create auth methods for DataProvider
 */
export function createBetterAuthProvider(client: ConvexReactClient) {
  return {
    // ===== LOGIN =====
    login: (args: LoginArgs) =>
      Effect.tryPromise({
        try: async () => {
          const result = await client.mutation("auth:signIn" as any, {
            email: args.email,
            password: args.password,
          });

          if (result?.token) {
            setAuthToken(result.token);
          }

          return {
            success: true,
            token: result.token,
            userId: result.userId,
          } as AuthResult;
        },
        catch: (error) => parseAuthError(error),
      }),

    // ===== SIGNUP =====
    signup: (args: SignupArgs) =>
      Effect.tryPromise({
        try: async () => {
          const result = await client.mutation("auth:signUp" as any, {
            email: args.email,
            password: args.password,
            name: args.name,
            sendVerificationEmail: true,
            baseUrl:
              typeof window !== "undefined" ? window.location.origin : "http://localhost:4321",
          });

          if (result?.token) {
            setAuthToken(result.token);
          }

          return {
            success: true,
            token: result.token,
            userId: result.userId,
          } as AuthResult;
        },
        catch: (error) => parseAuthError(error),
      }),

    // ===== LOGOUT =====
    logout: () =>
      Effect.tryPromise({
        try: async () => {
          const token = getAuthToken();
          if (token) {
            await client.mutation("auth:signOut" as any, { token });
            clearAuthToken();
          }
        },
        catch: (error) => parseAuthError(error),
      }),

    // ===== GET CURRENT USER =====
    getCurrentUser: () =>
      Effect.tryPromise({
        try: async () => {
          const token = getAuthToken();
          if (!token) return null;

          const user = await client.query("auth:getCurrentUser" as any, { token });
          return user as User | null;
        },
        catch: (error) => parseAuthError(error),
      }),

    // ===== MAGIC LINK AUTH =====
    magicLinkAuth: (args: MagicLinkArgs) =>
      Effect.tryPromise({
        try: async () => {
          const result = await client.mutation("auth:signInWithMagicLink" as any, {
            token: args.token,
          });

          if (result?.token) {
            setAuthToken(result.token);
          }

          return {
            success: true,
            token: result.token,
            userId: result.userId,
          } as AuthResult;
        },
        catch: (error) => parseAuthError(error),
      }),

    // ===== PASSWORD RESET =====
    passwordReset: (args: PasswordResetArgs) =>
      Effect.tryPromise({
        try: async () => {
          await client.mutation("auth:requestPasswordReset" as any, {
            email: args.email,
            baseUrl:
              typeof window !== "undefined" ? window.location.origin : "http://localhost:4321",
          });
        },
        catch: (error) => parseAuthError(error),
      }),

    // ===== PASSWORD RESET COMPLETE =====
    passwordResetComplete: (args: PasswordResetCompleteArgs) =>
      Effect.tryPromise({
        try: async () => {
          await client.mutation("auth:resetPassword" as any, {
            token: args.token,
            password: args.newPassword,
          });
        },
        catch: (error) => parseAuthError(error),
      }),

    // ===== VERIFY EMAIL =====
    verifyEmail: (args: VerifyEmailArgs) =>
      Effect.tryPromise({
        try: async () => {
          await client.mutation("auth:verifyEmail" as any, {
            token: args.token,
          });

          return {
            success: true,
          } as AuthResult;
        },
        catch: (error) => parseAuthError(error),
      }),

    // ===== GET 2FA STATUS =====
    get2FAStatus: () =>
      Effect.tryPromise({
        try: async () => {
          const token = getAuthToken();
          const result = await client.query("auth:get2FAStatus" as any, { token });
          return result as TwoFactorStatus;
        },
        catch: (error) => parseAuthError(error),
      }),

    // ===== SETUP 2FA =====
    setup2FA: () =>
      Effect.tryPromise({
        try: async () => {
          const token = getAuthToken();
          if (!token) {
            throw new Error("Not authenticated");
          }

          const result = await client.mutation("auth:setup2FA" as any, { token });
          return result as TwoFactorSetup;
        },
        catch: (error) => parseAuthError(error),
      }),

    // ===== VERIFY 2FA =====
    verify2FA: (_args: Verify2FAArgs) =>
      Effect.tryPromise({
        try: async () => {
          const token = getAuthToken();
          if (!token) {
            throw new Error("Not authenticated");
          }

          await client.mutation("auth:verify2FA" as any, { token });
        },
        catch: (error) => parseAuthError(error),
      }),

    // ===== DISABLE 2FA =====
    disable2FA: (args: Disable2FAArgs) =>
      Effect.tryPromise({
        try: async () => {
          const token = getAuthToken();
          if (!token) {
            throw new Error("Not authenticated");
          }

          await client.mutation("auth:disable2FA" as any, {
            token,
            password: args.password,
          });
        },
        catch: (error) => parseAuthError(error),
      }),
  };
}
