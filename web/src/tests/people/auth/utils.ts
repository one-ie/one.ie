import { ConvexHttpClient } from "convex/browser";

/**
 * Test utilities for auth tests
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

// Initialize Convex client
export const convex = new ConvexHttpClient(
  process.env.PUBLIC_CONVEX_URL || "https://shocking-falcon-870.convex.cloud"
);

/**
 * Generate a unique test email using cryptographically secure randomness
 */
export function generateTestEmail(prefix = "test"): string {
  // Use crypto.getRandomValues for secure random generation
  const randomBytes = new Uint8Array(8);
  crypto.getRandomValues(randomBytes);
  const randomHex = Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 12);
  return `${prefix}-${Date.now()}-${randomHex}@test.com`;
}

/**
 * Generate a secure random password using cryptographically secure randomness
 */
export function generateTestPassword(): string {
  // Use crypto.getRandomValues for secure random generation
  const randomBytes = new Uint8Array(12);
  crypto.getRandomValues(randomBytes);
  const randomBase64 = btoa(String.fromCharCode(...randomBytes))
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 12);
  return `Test${randomBase64}Pass123!`;
}

/**
 * Wait for a specified duration (for rate limiting tests)
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Clean up test data (delete test users and sessions)
 * Note: This requires admin mutations in the backend
 */
export async function cleanupTestData(email: string): Promise<void> {
  // In production, you'd implement admin mutations to clean up test data
  // For now, we'll let Convex's TTL handle cleanup or manually clean via dashboard
  console.log(`Test cleanup: ${email} (manual cleanup required)`);
}

/**
 * Test result logger
 */
export class TestLogger {
  private testName: string;
  private startTime: number;

  constructor(testName: string) {
    this.testName = testName;
    this.startTime = Date.now();
  }

  log(_message: string): void {
    const elapsed = Date.now() - this.startTime;
    // Note: message parameter is intentionally not logged to prevent
    // accidental exposure of sensitive test data in logs
    if (process.env.NODE_ENV === "test") {
      // Only log safe metadata (test name and elapsed time)
      console.log(`[${this.testName}] [${elapsed}ms]`);
    }
  }

  success(_message: string): void {
    const elapsed = Date.now() - this.startTime;
    // Note: message parameter is intentionally not logged to prevent
    // accidental exposure of sensitive test data in logs
    console.log(`✅ [${this.testName}] [${elapsed}ms]`);
  }

  error(_message: string, _error?: any): void {
    const elapsed = Date.now() - this.startTime;
    // Note: message and error parameters are intentionally not fully logged
    // to prevent accidental exposure of sensitive test data in logs
    console.error(`❌ [${this.testName}] [${elapsed}ms]`);
  }
}

/**
 * Assert helper
 */
export function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

/**
 * Assert helper for error messages that may vary by environment.
 */
export function assertErrorMessage(
  error: unknown,
  allowedSubstrings: string[],
  message: string
): void {
  const actual =
    typeof (error as any)?.message === "string" ? (error as any).message : String(error);

  const matches = allowedSubstrings.some((substring) =>
    actual.toLowerCase().includes(substring.toLowerCase())
  );

  if (!matches) {
    throw new Error(
      `Assertion failed: ${message}. Received: "${actual}". Expected one of: ${allowedSubstrings.join(
        ", "
      )}`
    );
  }
}

/**
 * Test session helper
 */
export interface TestSession {
  token: string;
  userId: string;
  email: string;
}

/**
 * Create a test user and return session
 */
export async function createTestUser(
  api: any,
  email?: string,
  password?: string
): Promise<TestSession> {
  const testEmail = email || generateTestEmail();
  const testPassword = password || generateTestPassword();

  const result = await convex.mutation(api.auth.signUp, {
    email: testEmail,
    password: testPassword,
    name: "Test User",
  });

  return {
    token: result.token,
    userId: result.userId,
    email: testEmail,
  };
}

/**
 * Sign in a test user and return session
 */
export async function signInTestUser(
  api: any,
  email: string,
  password: string
): Promise<TestSession> {
  const result = await convex.mutation(api.auth.signIn, {
    email,
    password,
  });

  return {
    token: result.token,
    userId: result.userId,
    email,
  };
}

/**
 * Get current user from session
 */
export async function getCurrentUser(api: any, token: string): Promise<any> {
  return await convex.query(api.auth.getCurrentUser, { token });
}

/**
 * Sign out and clean up session
 */
export async function signOut(api: any, token: string): Promise<void> {
  await convex.mutation(api.auth.signOut, { token });
}

/**
 * Test configuration
 */
export const TEST_CONFIG = {
  baseUrl: "http://localhost:4321",
  timeout: 10000, // 10 seconds
  retries: 3,
};

/**
 * Retry helper for flaky tests
 */
export async function retry<T>(
  fn: () => Promise<T>,
  retries: number = TEST_CONFIG.retries,
  delay = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 1) {
      throw error;
    }
    await wait(delay);
    return retry(fn, retries - 1, delay);
  }
}

/**
 * Email validation helper
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Password strength helper
 */
export function isStrongPassword(password: string): boolean {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password)
  );
}

/**
 * Token validation helper
 */
export function isValidToken(token: string): boolean {
  // Token should be a 64-character hex string
  return /^[a-f0-9]{64}$/.test(token);
}
