"use node";

/**
 * Verification System
 * Code generation, validation, and token management for onboarding
 *
 * Infer 28: Email verification, invitation tokens, and related utilities
 */

import crypto from "crypto";

// ============================================================================
// Verification Code Management
// ============================================================================

/**
 * Generate a 6-digit verification code
 * Format: "123456"
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Validate a 6-digit code
 * Rules:
 * - Must be exactly 6 digits
 * - Must be numeric
 */
export function isValidVerificationCode(code: string): boolean {
  return /^\d{6}$/.test(code);
}

/**
 * Check if verification code has expired
 */
export function isVerificationCodeExpired(expiresAt: number): boolean {
  return expiresAt < Date.now();
}

// ============================================================================
// Invitation Token Management
// ============================================================================

/**
 * Generate a secure random invitation token
 * Uses: timestamp + random UUID + checksum
 * Format: "1730000000000-abc123def456-xyz789"
 */
export function generateInvitationToken(): string {
  const timestamp = Date.now().toString();
  const random1 = crypto
    .randomBytes(8)
    .toString("hex")
    .substring(0, 12);
  const random2 = crypto
    .randomBytes(8)
    .toString("hex")
    .substring(0, 12);

  return `${timestamp}-${random1}-${random2}`;
}

/**
 * Generate cryptographically secure token for sensitive operations
 * Uses crypto.randomBytes for higher entropy
 */
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Validate token format (basic check)
 */
export function isValidTokenFormat(token: string): boolean {
  // Should be at least 20 chars
  if (token.length < 20) return false;

  // Should contain hyphens (timestamp-random-random or hex)
  return token.includes("-") || /^[a-f0-9]{64}$/.test(token);
}

/**
 * Check if invitation token has expired
 */
export function isInvitationTokenExpired(expiresAt: number): boolean {
  return expiresAt < Date.now();
}

// ============================================================================
// Rate Limiting
// ============================================================================
//
// Rate limiting is handled by @convex-dev/rate-limiter component in auth.ts
// Do NOT duplicate rate limit logic here - it should be centralized in auth.ts
//

// ============================================================================
// Email Verification Helpers
// ============================================================================

/**
 * Generate verification link
 * Format: "https://one.ie/verify/TOKEN"
 */
export function generateVerificationLink(token: string): string {
  return `https://one.ie/verify/${token}`;
}

/**
 * Generate invitation acceptance link
 * Format: "https://one.ie/onboarding/accept-invite?token=TOKEN"
 */
export function generateInviteAcceptanceLink(token: string): string {
  return `https://one.ie/onboarding/accept-invite?token=${token}`;
}

/**
 * Extract token from verification link
 */
export function extractTokenFromLink(link: string): string | null {
  const match = link.match(/\/verify\/(.+)$/);
  if (!match) return null;
  return match[1];
}

// ============================================================================
// Email Address Validation Helpers
// ============================================================================

/**
 * Validate email format (basic RFC 5322)
 */
export function isValidEmail(email: string): boolean {
  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return email.length > 0 && email.length <= 255 && emailRegex.test(email);
}

/**
 * Normalize email (lowercase)
 */
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Extract domain from email
 */
export function getEmailDomain(email: string): string {
  const [, domain] = email.split("@");
  return domain || "";
}

/**
 * Check if email is from disposable domain
 * (simplified check - real implementation would have a list)
 */
export function isDisposableEmail(email: string): boolean {
  const disposableDomains = [
    "tempmail.com",
    "guerrillamail.com",
    "10minutemail.com",
    "mailinator.com",
  ];

  const domain = getEmailDomain(email);
  return disposableDomains.includes(domain.toLowerCase());
}

// ============================================================================
// Wallet Address Validation
// ============================================================================

/**
 * Validate Ethereum address format
 * Must be 0x followed by 40 hex characters
 */
export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Normalize Ethereum address to lowercase
 */
export function normalizeEthereumAddress(address: string): string {
  return address.toLowerCase();
}

/**
 * Validate Solana address format
 * Must be base58, 32-44 characters
 */
export function isValidSolanaAddress(address: string): boolean {
  const base58Regex = /^[1-9A-HJ-NP-Z]{32,44}$/;
  return base58Regex.test(address);
}

// ============================================================================
// Code Expiration
// ============================================================================

/**
 * Get code/token expiration duration
 */
export const EXPIRATION_TIMES = {
  emailVerification: 15 * 60 * 1000, // 15 minutes
  invitationToken: 7 * 24 * 60 * 60 * 1000, // 7 days
  passwordReset: 60 * 60 * 1000, // 1 hour
  magicLink: 24 * 60 * 60 * 1000, // 24 hours
} as const;

/**
 * Calculate expiration timestamp
 */
export function getExpirationTime(durationMs: number): number {
  return Date.now() + durationMs;
}

/**
 * Time remaining until expiration (in seconds)
 */
export function getTimeRemaining(expiresAt: number): number {
  const remaining = expiresAt - Date.now();
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}

/**
 * Human-readable time remaining
 * Returns: "5 minutes", "2 hours", "3 days", "just now", "expired"
 */
export function getReadableTimeRemaining(expiresAt: number): string {
  const seconds = getTimeRemaining(expiresAt);

  if (seconds <= 0) return "expired";
  if (seconds < 60) return `${seconds} seconds`;
  if (seconds < 3600) return `${Math.ceil(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.ceil(seconds / 3600)} hours`;

  return `${Math.ceil(seconds / 86400)} days`;
}

// ============================================================================
// Export all utilities
// ============================================================================

export const verificationService = {
  generateVerificationCode,
  isValidVerificationCode,
  isVerificationCodeExpired,
  generateInvitationToken,
  generateSecureToken,
  isValidTokenFormat,
  isInvitationTokenExpired,
  generateVerificationLink,
  generateInviteAcceptanceLink,
  extractTokenFromLink,
  isValidEmail,
  normalizeEmail,
  getEmailDomain,
  isDisposableEmail,
  isValidEthereumAddress,
  normalizeEthereumAddress,
  isValidSolanaAddress,
  getExpirationTime,
  getTimeRemaining,
  getReadableTimeRemaining,
};
