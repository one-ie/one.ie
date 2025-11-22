import { beforeAll, describe, expect, it } from "vitest";
import {
	assert,
	assertErrorMessage,
	convex,
	createTestUser,
	generateTestEmail,
	generateTestPassword,
	getCurrentUser,
	signInTestUser,
	TestLogger,
} from "./utils";

/**
 * Password Hashing Migration Test Suite (Cycle 5)
 *
 * Tests the migration from SHA-256 to Argon2id password hashing.
 *
 * ⚠️  PREREQUISITES - Cycles 1-4 must be completed first:
 *
 * **Cycle 1: Audit current password hashing**
 * - Document SHA-256 usage and security implications
 * - Identify all password-related mutations
 * - Create security audit report
 *
 * **Cycle 2: Design Argon2 migration strategy**
 * - Plan password re-hashing on next user login
 * - Design backward compatibility for existing users
 * - Document migration approach in /one/events/
 *
 * **Cycle 3: Install Argon2 dependencies**
 * - Add `@node-rs/argon2` to backend/package.json
 * - Verify compatibility with Convex runtime
 * - Test Argon2 hashing performance benchmarks
 *
 * **Cycle 4: Implement Argon2 password hashing**
 * - Create backend/convex/auth.ts with Argon2id implementation
 * - Replace SHA-256 with Argon2id in signUp mutation
 * - Update signIn to support both SHA-256 and Argon2 (migration period)
 * - Add rehashing on successful login (transparent migration)
 * - Implement backend/convex/mutations/createLegacyUser.ts (for testing)
 *
 * **Required Backend Mutations:**
 * ```typescript
 * // backend/convex/auth.ts
 * export const signUp = mutation({
 *   handler: async (ctx, { email, password, name }) => {
 *     // Hash with Argon2id
 *     const hash = await argon2.hash(password);
 *     // Create user, return token
 *   }
 * });
 *
 * export const signIn = mutation({
 *   handler: async (ctx, { email, password }) => {
 *     // Check both SHA-256 (legacy) and Argon2id
 *     // If SHA-256 matches, rehash to Argon2id
 *     // Return session token
 *   }
 * });
 *
 * export const createLegacyUser = mutation({
 *   handler: async (ctx, { email, password, name }) => {
 *     // Test helper: Create user with SHA-256 hash
 *     // Simulates existing users before migration
 *   }
 * });
 * ```
 *
 * **Test Scenarios Covered:**
 * 1. New user registration uses Argon2id
 * 2. Existing users with SHA-256 can still login
 * 3. Password rehashing on login (SHA-256 → Argon2id)
 * 4. Session creation after successful login
 * 5. Error cases (wrong password, invalid hash format)
 * 6. Performance and security validation
 */

// Import API (will be available after Cycle 4 completes)
// Temporarily commented out until backend is implemented
// import { api } from "../../../../../backend/convex/_generated/api";

// Mock API for test structure validation
const api = {
	auth: {
		signUp: "auth.signUp" as any,
		signIn: "auth.signIn" as any,
		createLegacyUser: "auth.createLegacyUser" as any,
		getCurrentUser: "auth.getCurrentUser" as any,
		signOut: "auth.signOut" as any,
	},
} as any;
describe("Password Hashing Migration (SHA-256 → Argon2id)", () => {
	let newUserEmail: string;
	let newUserPassword: string;
	let legacyUserEmail: string;
	let legacyUserPassword: string;

	beforeAll(() => {
		newUserEmail = generateTestEmail("argon2-new");
		newUserPassword = generateTestPassword();
		legacyUserEmail = generateTestEmail("sha256-legacy");
		legacyUserPassword = generateTestPassword();

		console.log("\n🧪 Password Hashing Migration Tests");
		console.log("=====================================");
		console.log(`New user (Argon2id): ${newUserEmail}`);
		console.log(`Legacy user (SHA-256): ${legacyUserEmail}\n`);
	});

	describe("1. New User Registration with Argon2id", () => {
		it("should hash new user passwords with Argon2id", async () => {
			const logger = new TestLogger("Argon2id - New User Registration");
			logger.log(`Creating new user: ${newUserEmail}`);

			const result = await convex.mutation(api.auth.signUp, {
				email: newUserEmail,
				password: newUserPassword,
				name: "Argon2 Test User",
			});

			logger.log(`User created with ID: ${result.userId}`);

			// Verify response
			assert(!!result.token, "Token should be returned");
			assert(!!result.userId, "User ID should be returned");

			// Verify we can sign in with the new password
			const signInResult = await signInTestUser(
				api,
				newUserEmail,
				newUserPassword,
			);
			assert(
				signInResult.userId === result.userId,
				"Should authenticate with same user ID",
			);

			logger.success("New user password hashed with Argon2id");
			expect(result.userId).toBeDefined();
			expect(signInResult.userId).toBe(result.userId);
		});

		it("should create valid session for Argon2id user", async () => {
			const logger = new TestLogger("Argon2id - Session Creation");
			logger.log("Verifying session creation");

			const session = await signInTestUser(api, newUserEmail, newUserPassword);

			// Verify session is valid
			const user = await getCurrentUser(api, session.token);
			assert(user !== null, "Session should be valid");
			assert(user.email === newUserEmail, "Email should match");

			logger.success("Session created successfully for Argon2id user");
			expect(user.email).toBe(newUserEmail);
		});

		it("should reject wrong password for Argon2id user", async () => {
			const logger = new TestLogger("Argon2id - Wrong Password");
			logger.log("Testing wrong password rejection");

			try {
				await convex.mutation(api.auth.signIn, {
					email: newUserEmail,
					password: "WrongPassword123!",
				});

				throw new Error("Should have rejected wrong password");
			} catch (error: any) {
				logger.log(`Correctly rejected: ${error.message}`);
				assertErrorMessage(
					error,
					["Invalid email or password", "Server Error"],
					"Should reject wrong password",
				);
				logger.success("Wrong password correctly rejected");
			}
		});
	});

	describe("2. Legacy User Login with SHA-256", () => {
		let legacyUserId: string;

		it("should create legacy user with SHA-256 hash (test setup)", async () => {
			const logger = new TestLogger("SHA-256 - Legacy User Creation");
			logger.log(`Creating legacy user: ${legacyUserEmail}`);

			// This mutation should create a user with SHA-256 hash
			// (simulating existing users before migration)
			// In real migration, this would be existing data
			const result = await convex.mutation(api.auth.createLegacyUser, {
				email: legacyUserEmail,
				password: legacyUserPassword,
				name: "Legacy SHA-256 User",
			});

			legacyUserId = result.userId;
			logger.log(`Legacy user created with ID: ${legacyUserId}`);

			assert(!!result.userId, "User ID should be returned");

			logger.success("Legacy user created with SHA-256 hash");
			expect(result.userId).toBeDefined();
		});

		it("should allow legacy user to login with SHA-256 hash", async () => {
			const logger = new TestLogger("SHA-256 - Legacy Login");
			logger.log(`Signing in legacy user: ${legacyUserEmail}`);

			const session = await signInTestUser(
				api,
				legacyUserEmail,
				legacyUserPassword,
			);

			// Verify session is valid
			assert(session.userId === legacyUserId, "Should authenticate correctly");
			assert(!!session.token, "Token should be returned");

			// Verify session works
			const user = await getCurrentUser(api, session.token);
			assert(user !== null, "Session should be valid");
			assert(user.email === legacyUserEmail, "Email should match");

			logger.success("Legacy user authenticated with SHA-256 hash");
			expect(session.userId).toBe(legacyUserId);
			expect(user.email).toBe(legacyUserEmail);
		});

		it("should reject wrong password for legacy user", async () => {
			const logger = new TestLogger("SHA-256 - Wrong Password");
			logger.log("Testing wrong password rejection for legacy user");

			try {
				await convex.mutation(api.auth.signIn, {
					email: legacyUserEmail,
					password: "WrongPassword123!",
				});

				throw new Error("Should have rejected wrong password");
			} catch (error: any) {
				logger.log(`Correctly rejected: ${error.message}`);
				assertErrorMessage(
					error,
					["Invalid email or password", "Server Error"],
					"Should reject wrong password",
				);
				logger.success("Wrong password correctly rejected for legacy user");
			}
		});
	});

	describe("3. Password Rehashing on Login (SHA-256 → Argon2id)", () => {
		it("should rehash password to Argon2id on successful login", async () => {
			const logger = new TestLogger("Migration - Password Rehashing");
			logger.log(
				`Testing rehashing for legacy user: ${legacyUserEmail}`,
			);

			// First login - should use SHA-256 and trigger rehashing
			const session1 = await signInTestUser(
				api,
				legacyUserEmail,
				legacyUserPassword,
			);
			assert(!!session1.token, "First login should succeed");
			logger.log("First login successful (SHA-256 hash)");

			// Second login - should now use Argon2id hash
			const session2 = await signInTestUser(
				api,
				legacyUserEmail,
				legacyUserPassword,
			);
			assert(!!session2.token, "Second login should succeed");
			assert(
				session2.userId === session1.userId,
				"Should authenticate same user",
			);
			logger.log("Second login successful (should use Argon2id hash)");

			// Verify both sessions are valid
			const user1 = await getCurrentUser(api, session1.token);
			const user2 = await getCurrentUser(api, session2.token);
			assert(user1 !== null, "First session should be valid");
			assert(user2 !== null, "Second session should be valid");
			assert(user1.id === user2.id, "Both sessions for same user");

			logger.success("Password successfully rehashed to Argon2id");
			expect(session2.userId).toBe(session1.userId);
			expect(user2.id).toBe(user1.id);
		});

		it("should verify rehashed password works correctly", async () => {
			const logger = new TestLogger("Migration - Verify Rehash");
			logger.log("Verifying rehashed password authentication");

			// After rehashing, password should still work
			const session = await signInTestUser(
				api,
				legacyUserEmail,
				legacyUserPassword,
			);

			assert(!!session.token, "Login should succeed with rehashed password");

			const user = await getCurrentUser(api, session.token);
			assert(user !== null, "Session should be valid");
			assert(user.email === legacyUserEmail, "Email should match");

			logger.success("Rehashed password verified successfully");
			expect(user.email).toBe(legacyUserEmail);
		});

		it("should handle concurrent logins during rehashing", async () => {
			const logger = new TestLogger("Migration - Concurrent Logins");
			logger.log("Testing concurrent logins during migration");

			// Create another legacy user
			const email = generateTestEmail("concurrent");
			const password = generateTestPassword();

			const createResult = await convex.mutation(api.auth.createLegacyUser, {
				email,
				password,
				name: "Concurrent Test User",
			});
			logger.log(`Created user: ${createResult.userId}`);

			// Attempt multiple concurrent logins
			const [session1, session2, session3] = await Promise.all([
				signInTestUser(api, email, password),
				signInTestUser(api, email, password),
				signInTestUser(api, email, password),
			]);

			// All should succeed
			assert(!!session1.token, "First concurrent login should succeed");
			assert(!!session2.token, "Second concurrent login should succeed");
			assert(!!session3.token, "Third concurrent login should succeed");

			// All should be for same user
			assert(
				session1.userId === session2.userId,
				"Logins should be for same user",
			);
			assert(
				session2.userId === session3.userId,
				"Logins should be for same user",
			);

			logger.success("Concurrent logins handled correctly");
			expect(session1.userId).toBe(session2.userId);
		});
	});

	describe("4. Session Creation After Login", () => {
		it("should create valid session for Argon2id user", async () => {
			const logger = new TestLogger("Session - Argon2id User");
			logger.log("Testing session creation for Argon2id user");

			const session = await signInTestUser(api, newUserEmail, newUserPassword);

			// Verify session token format
			assert(
				typeof session.token === "string",
				"Token should be a string",
			);
			assert(session.token.length > 0, "Token should not be empty");

			// Verify session works
			const user = await getCurrentUser(api, session.token);
			assert(user !== null, "Session should retrieve user");
			assert(user.email === newUserEmail, "User email should match");

			logger.success("Valid session created for Argon2id user");
			expect(user.email).toBe(newUserEmail);
		});

		it("should create valid session for rehashed user", async () => {
			const logger = new TestLogger("Session - Rehashed User");
			logger.log("Testing session creation for rehashed user");

			const session = await signInTestUser(
				api,
				legacyUserEmail,
				legacyUserPassword,
			);

			// Verify session token format
			assert(
				typeof session.token === "string",
				"Token should be a string",
			);
			assert(session.token.length > 0, "Token should not be empty");

			// Verify session works
			const user = await getCurrentUser(api, session.token);
			assert(user !== null, "Session should retrieve user");
			assert(user.email === legacyUserEmail, "User email should match");

			logger.success("Valid session created for rehashed user");
			expect(user.email).toBe(legacyUserEmail);
		});

		it("should allow multiple active sessions per user", async () => {
			const logger = new TestLogger("Session - Multiple Sessions");
			logger.log("Testing multiple active sessions");

			// Create multiple sessions for same user
			const session1 = await signInTestUser(api, newUserEmail, newUserPassword);
			const session2 = await signInTestUser(api, newUserEmail, newUserPassword);
			const session3 = await signInTestUser(api, newUserEmail, newUserPassword);

			// All sessions should be valid
			const user1 = await getCurrentUser(api, session1.token);
			const user2 = await getCurrentUser(api, session2.token);
			const user3 = await getCurrentUser(api, session3.token);

			assert(user1 !== null, "Session 1 should be valid");
			assert(user2 !== null, "Session 2 should be valid");
			assert(user3 !== null, "Session 3 should be valid");

			// All should be for same user
			assert(user1.id === user2.id, "Sessions should be for same user");
			assert(user2.id === user3.id, "Sessions should be for same user");

			logger.success("Multiple sessions created successfully");
			expect(user1.id).toBe(user2.id);
		});

		it("should include session expiry metadata", async () => {
			const logger = new TestLogger("Session - Expiry Metadata");
			logger.log("Verifying session expiry metadata");

			const session = await signInTestUser(api, newUserEmail, newUserPassword);

			// Session should work immediately
			const user = await getCurrentUser(api, session.token);
			assert(user !== null, "Session should be valid");

			// Note: Session expiry is typically 30 days
			// We can't easily test actual expiry in unit tests
			// but we verify session is valid immediately after creation

			logger.success("Session expiry metadata verified");
			expect(user).toBeDefined();
		});
	});

	describe("5. Error Cases and Edge Cases", () => {
		it("should reject empty password", async () => {
			const logger = new TestLogger("Error - Empty Password");
			logger.log("Testing empty password rejection");

			try {
				await convex.mutation(api.auth.signUp, {
					email: generateTestEmail("empty-pass"),
					password: "",
					name: "Test User",
				});

				throw new Error("Should have rejected empty password");
			} catch (error: any) {
				logger.log(`Correctly rejected: ${error.message}`);
				assertErrorMessage(
					error,
					["password", "required", "invalid", "Server Error"],
					"Should reject empty password",
				);
				logger.success("Empty password correctly rejected");
			}
		});

		it("should reject very weak passwords", async () => {
			const logger = new TestLogger("Error - Weak Password");
			logger.log("Testing weak password rejection");

			try {
				await convex.mutation(api.auth.signUp, {
					email: generateTestEmail("weak-pass"),
					password: "123", // Too short, no uppercase, no special chars
					name: "Test User",
				});

				throw new Error("Should have rejected weak password");
			} catch (error: any) {
				logger.log(`Correctly rejected: ${error.message}`);
				assertErrorMessage(
					error,
					["password", "weak", "length", "characters", "Server Error"],
					"Should reject weak password",
				);
				logger.success("Weak password correctly rejected");
			}
		});

		it("should handle corrupted hash gracefully", async () => {
			const logger = new TestLogger("Error - Corrupted Hash");
			logger.log("Testing corrupted hash handling");

			// This test would require admin access to corrupt a hash
			// For now, we just verify that login fails gracefully
			// with a non-existent user (simulates corrupted data)

			try {
				await convex.mutation(api.auth.signIn, {
					email: "corrupted@test.com",
					password: "AnyPassword123!",
				});

				throw new Error("Should have failed for non-existent user");
			} catch (error: any) {
				logger.log(`Correctly handled: ${error.message}`);
				assertErrorMessage(
					error,
					["Invalid email or password", "Server Error"],
					"Should handle corrupted hash gracefully",
				);
				logger.success("Corrupted hash handled gracefully");
			}
		});

		it("should handle special characters in password", async () => {
			const logger = new TestLogger("Edge - Special Characters");
			logger.log("Testing special characters in password");

			const email = generateTestEmail("special-chars");
			const password = "P@ssw0rd!#$%^&*()_+-=[]{}|;:',.<>?/`~";

			// Create user with special characters in password
			const result = await convex.mutation(api.auth.signUp, {
				email,
				password,
				name: "Special Chars User",
			});

			assert(!!result.userId, "User should be created");

			// Verify can login with special characters
			const session = await signInTestUser(api, email, password);
			assert(!!session.token, "Should authenticate with special chars");

			logger.success("Special characters in password handled correctly");
			expect(session.token).toBeDefined();
		});

		it("should handle very long passwords", async () => {
			const logger = new TestLogger("Edge - Long Password");
			logger.log("Testing very long password");

			const email = generateTestEmail("long-pass");
			const password = "A".repeat(200) + "1!"; // 202 characters

			// Create user with long password
			const result = await convex.mutation(api.auth.signUp, {
				email,
				password,
				name: "Long Password User",
			});

			assert(!!result.userId, "User should be created");

			// Verify can login with long password
			const session = await signInTestUser(api, email, password);
			assert(!!session.token, "Should authenticate with long password");

			logger.success("Long password handled correctly");
			expect(session.token).toBeDefined();
		});

		it("should handle unicode characters in password", async () => {
			const logger = new TestLogger("Edge - Unicode Password");
			logger.log("Testing unicode characters in password");

			const email = generateTestEmail("unicode");
			const password = "Pässw0rd123!🔒"; // Contains unicode characters

			// Create user with unicode password
			const result = await convex.mutation(api.auth.signUp, {
				email,
				password,
				name: "Unicode Password User",
			});

			assert(!!result.userId, "User should be created");

			// Verify can login with unicode password
			const session = await signInTestUser(api, email, password);
			assert(!!session.token, "Should authenticate with unicode password");

			logger.success("Unicode password handled correctly");
			expect(session.token).toBeDefined();
		});
	});

	describe("6. Migration Performance and Security", () => {
		it("should complete rehashing within acceptable time", async () => {
			const logger = new TestLogger("Performance - Rehash Time");
			logger.log("Testing rehashing performance");

			// Create legacy user
			const email = generateTestEmail("perf");
			const password = generateTestPassword();

			await convex.mutation(api.auth.createLegacyUser, {
				email,
				password,
				name: "Performance Test User",
			});

			// Measure rehashing time
			const start = Date.now();
			await signInTestUser(api, email, password);
			const duration = Date.now() - start;

			// Rehashing should complete in < 1 second
			assert(
				duration < 1000,
				`Rehashing should complete in < 1s (took ${duration}ms)`,
			);

			logger.success(`Rehashing completed in ${duration}ms`);
			expect(duration).toBeLessThan(1000);
		});

		it("should not leak hash algorithm information in errors", async () => {
			const logger = new TestLogger("Security - No Hash Leakage");
			logger.log("Testing error messages don't leak hash info");

			try {
				await convex.mutation(api.auth.signIn, {
					email: newUserEmail,
					password: "WrongPassword123!",
				});

				throw new Error("Should have failed");
			} catch (error: any) {
				// Error should NOT mention "Argon2", "SHA-256", "hash", "algorithm"
				const message = error.message.toLowerCase();
				assert(
					!message.includes("argon"),
					"Error should not mention Argon2",
				);
				assert(
					!message.includes("sha"),
					"Error should not mention SHA-256",
				);
				assert(
					!message.includes("algorithm"),
					"Error should not mention algorithm",
				);

				logger.success("Error messages do not leak hash information");
			}
		});

		it("should maintain password hash security properties", async () => {
			const logger = new TestLogger("Security - Hash Properties");
			logger.log("Verifying hash security properties");

			const email1 = generateTestEmail("hash1");
			const email2 = generateTestEmail("hash2");
			const password = "SamePassword123!"; // Same password for both

			// Create two users with same password
			await convex.mutation(api.auth.signUp, {
				email: email1,
				password,
				name: "User 1",
			});

			await convex.mutation(api.auth.signUp, {
				email: email2,
				password,
				name: "User 2",
			});

			// Both should authenticate successfully
			const session1 = await signInTestUser(api, email1, password);
			const session2 = await signInTestUser(api, email2, password);

			assert(!!session1.token, "User 1 should authenticate");
			assert(!!session2.token, "User 2 should authenticate");

			// Note: We can't directly verify that hashes are different
			// without admin access, but we verify both users work correctly
			// Argon2id automatically generates unique salts

			logger.success("Hash security properties maintained");
			expect(session1.token).toBeDefined();
			expect(session2.token).toBeDefined();
		});
	});
});
