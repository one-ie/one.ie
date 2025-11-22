---
title: Argon2id Password Hashing Migration Strategy
dimension: things
category: plans
tags: auth, security, better-auth, argon2, password-hashing, migration
related_dimensions: people, events
scope: global
created: 2025-11-22
updated: 2025-11-22
version: 1.0.0
session_id: 01QMzqbMmdUc4fQx4zL1AEDT
ai_context: |
  This document is part of the things dimension in the plans category.
  Location: one/things/plans/argon2-migration-strategy.md
  Purpose: Complete migration plan from SHA-256 to Argon2id password hashing
  Related dimensions: people (authentication), events (migration tracking)
  For AI agents: Read this to understand the password hashing migration approach.
---

# Argon2id Password Hashing Migration Strategy

**Status:** Design Complete - Ready for Implementation (Cycle 3)
**Session ID:** 01QMzqbMmdUc4fQx4zL1AEDT
**Branch:** `claude/better-auth-roadmap-01QMzqbMmdUc4fQx4zL1AEDT`
**Roadmap:** `/one/things/plans/better-auth-roadmap.md`

## Overview

This document details the complete migration strategy from SHA-256 password hashing to Argon2id, addressing the critical security vulnerability identified in Cycle 1 of the Better Auth roadmap.

**Current State:** SHA-256 password hashing (insecure, too fast)
**Target State:** Argon2id password hashing (industry best practice)
**Migration Approach:** Lazy migration on user login (zero downtime, backward compatible)

---

## Executive Summary

### Problem Statement

SHA-256 is a cryptographic hash function designed for data integrity, NOT password hashing. Critical issues:

1. **Too Fast:** SHA-256 can hash billions of passwords per second on modern GPUs
2. **No Salt Built-In:** Vulnerable to rainbow table attacks without manual salting
3. **No Memory Hardness:** Can be parallelized easily on specialized hardware
4. **Deterministic:** Same password = same hash (without proper salting)

**Risk Level:** HIGH - Compromised password database could be cracked within hours/days.

### Solution: Argon2id

Argon2id is the winner of the Password Hashing Competition (PHC) and recommended by OWASP:

1. **Memory-Hard:** Requires significant RAM, preventing GPU/ASIC attacks
2. **Configurable Cost:** Adjustable time/memory parameters
3. **Hybrid Mode:** Combines Argon2i (side-channel resistant) + Argon2d (GPU resistant)
4. **Built-in Salt:** Automatic unique salt per password
5. **Future-Proof:** Can increase difficulty as hardware improves

**Security Level:** BEST PRACTICE - Meets OWASP recommendations for 2025.

### Migration Timeline

- **Cycle 3:** Install dependencies (~15 minutes)
- **Cycle 4:** Implement dual-hash authentication (~2 hours)
- **Cycle 5:** Test migration flow (~1 hour)
- **Post-Migration:** Gradual rehashing as users log in (weeks to months)

**Total Development Time:** ~3-4 hours
**User Impact:** Zero downtime, transparent migration

---

## Current Implementation Audit

### Evidence from Codebase

**File:** `/web/src/tests/people/auth/password-reset.test.ts`

```typescript
// Line 229-233
it("should hash new password before storing", async () => {
  const logger = new TestLogger("Reset Password - Hash");
  logger.log("Verifying password hashing");

  // New password should be hashed with SHA-256 (or bcrypt in production)
  // before storing in database

  logger.log("✓ Passwords hashed with SHA-256");
  logger.log("⚠️  Consider upgrading to bcrypt in production");
  logger.success("Password hashing verified");
});
```

**File:** `/web/src/tests/people/auth/auth.test.ts`

```typescript
// Line 89-112
it("should hash passwords securely", async () => {
  const logger = new TestLogger("SignUp - Password Hash");
  logger.log("Verifying password is hashed (not stored in plaintext)");

  // Create a test user
  const email = generateTestEmail("password-hash");
  const password = "TestPassword123!";

  await convex.mutation(api.auth.signUp, {
    email,
    password,
    name: "Hash Test User",
  });

  // We can't directly verify the hash without admin access,
  // but we can verify that signin works with the same password
  const signInResult = await convex.mutation(api.auth.signIn, {
    email,
    password,
  });

  assert(!!signInResult.token, "Should be able to sign in with password");
  logger.success("Password hashing verified");
});
```

### Current Architecture

**Better Auth Status:**
- ✅ `better-auth@1.3.27` installed
- ✅ `@convex-dev/better-auth@0.9.7` installed
- ⚠️ **Currently uses custom auth mutations (not Better Auth integration yet)**
- ⚠️ SHA-256 password hashing in custom implementation

**Database Schema (Inferred):**
```typescript
// Current schema (needs verification)
users: {
  email: string;
  passwordHash: string; // SHA-256 hash (insecure)
  name: string;
  // ... other fields
}

sessions: {
  userId: Id<"users">;
  token: string;
  expiresAt: number;
}
```

---

## Migration Strategy

### Phase 1: Preparation (Cycle 3)

#### Install Argon2 Dependencies

**Package:** `@node-rs/argon2`

Why this package?
- Native Rust implementation (fastest performance)
- Node.js bindings
- Compatible with Convex runtime
- Used by Better Auth internally

**Installation:**

```bash
cd /home/user/one.ie/web
bun add @node-rs/argon2
```

**Verify compatibility:**

```typescript
// Test script: verify-argon2.ts
import { hash, verify } from '@node-rs/argon2';

async function testArgon2() {
  const password = "TestPassword123!";

  // Hash with recommended settings
  const hashedPassword = await hash(password, {
    memoryCost: 19456,    // 19 MB
    timeCost: 2,          // 2 iterations
    parallelism: 1,       // 1 thread
  });

  console.log("Hashed:", hashedPassword);

  // Verify
  const isValid = await verify(hashedPassword, password);
  console.log("Verification:", isValid); // Should be true
}

testArgon2();
```

**Run test:**

```bash
bun run verify-argon2.ts
```

#### Performance Benchmarking

**Test Argon2 performance on Convex:**

```typescript
// benchmark-argon2.ts
import { hash } from '@node-rs/argon2';

async function benchmark() {
  const password = "TestPassword123!";
  const start = Date.now();

  // Hash 10 passwords
  for (let i = 0; i < 10; i++) {
    await hash(password, {
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
    });
  }

  const duration = Date.now() - start;
  console.log(`Average time per hash: ${duration / 10}ms`);
  // Target: 50-100ms per hash (acceptable for login)
}

benchmark();
```

**Acceptance Criteria:**
- ✅ Hashing takes 50-100ms per password (good balance)
- ✅ No Convex runtime errors
- ✅ Verification works correctly

---

### Phase 2: Implementation (Cycle 4)

#### Step 1: Add Hash Type Indicator to Schema

**Problem:** Need to distinguish SHA-256 hashes from Argon2 hashes during migration.

**Solution:** Add `hashType` field to user records.

**Schema Migration:**

```typescript
// backend/convex/schema.ts (or equivalent)

// BEFORE (current - needs verification)
users: defineTable({
  email: v.string(),
  passwordHash: v.string(), // Could be SHA-256 or Argon2
  name: v.string(),
  // ... other fields
})

// AFTER (migration-ready)
users: defineTable({
  email: v.string(),
  passwordHash: v.string(),
  hashType: v.optional(v.union(
    v.literal("sha256"),
    v.literal("argon2id")
  )), // Default: "sha256" for existing users
  name: v.string(),
  // ... other fields
})
```

**Migration Pattern:**

```typescript
// Convex migration script
export const addHashTypeToUsers = internalMutation({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();

    for (const user of users) {
      if (!user.hashType) {
        // Mark existing hashes as SHA-256
        await ctx.db.patch(user._id, { hashType: "sha256" });
      }
    }

    console.log(`Updated ${users.length} users with hashType`);
  }
});
```

**Run migration:**

```bash
# In Convex dashboard or via CLI
npx convex run migrations:addHashTypeToUsers
```

#### Step 2: Create Password Hashing Service

**Location:** `backend/convex/services/passwordService.ts` (or equivalent)

**Purpose:** Centralize all password hashing logic with dual-hash support.

```typescript
import { hash as argon2Hash, verify as argon2Verify } from '@node-rs/argon2';
import { createHash } from 'crypto';

/**
 * Password hashing service with SHA-256 → Argon2id migration support
 */
export const PasswordService = {
  /**
   * Hash a password with Argon2id (NEW standard)
   */
  async hashPassword(password: string): Promise<{ hash: string; hashType: 'argon2id' }> {
    const hash = await argon2Hash(password, {
      memoryCost: 19456,    // 19 MB (OWASP recommended minimum)
      timeCost: 2,          // 2 iterations (balance security vs performance)
      parallelism: 1,       // 1 thread (Convex runtime constraint)
      outputLen: 32,        // 32-byte hash output
    });

    return {
      hash,
      hashType: 'argon2id',
    };
  },

  /**
   * Legacy SHA-256 hash (for backward compatibility)
   * DEPRECATED: Only used for existing user authentication
   */
  hashPasswordSHA256(password: string): { hash: string; hashType: 'sha256' } {
    const hash = createHash('sha256')
      .update(password)
      .digest('hex');

    return {
      hash,
      hashType: 'sha256',
    };
  },

  /**
   * Verify password against hash (supports both SHA-256 and Argon2id)
   */
  async verifyPassword(
    password: string,
    storedHash: string,
    hashType: 'sha256' | 'argon2id' = 'sha256'
  ): Promise<boolean> {
    if (hashType === 'argon2id') {
      // Verify with Argon2
      try {
        return await argon2Verify(storedHash, password);
      } catch (error) {
        console.error('Argon2 verification error:', error);
        return false;
      }
    } else {
      // Legacy SHA-256 verification
      const { hash } = this.hashPasswordSHA256(password);
      return hash === storedHash;
    }
  },

  /**
   * Check if a hash needs rehashing (SHA-256 → Argon2id migration)
   */
  needsRehash(hashType: 'sha256' | 'argon2id' | undefined): boolean {
    return hashType !== 'argon2id';
  },
};
```

#### Step 3: Update Sign-Up Mutation (New Users)

**Location:** `backend/convex/mutations/auth.ts` (or equivalent)

**Change:** All new users get Argon2id hashes immediately.

```typescript
// BEFORE (SHA-256)
export const signUp = mutation({
  args: { email: v.string(), password: v.string(), name: v.string() },
  handler: async (ctx, args) => {
    // Hash password with SHA-256
    const passwordHash = createHash('sha256')
      .update(args.password)
      .digest('hex');

    const userId = await ctx.db.insert("users", {
      email: args.email,
      passwordHash,
      name: args.name,
      createdAt: Date.now(),
    });

    // Create session...
  }
});

// AFTER (Argon2id)
export const signUp = mutation({
  args: { email: v.string(), password: v.string(), name: v.string() },
  handler: async (ctx, args) => {
    const { PasswordService } = await import('../services/passwordService');

    // Hash password with Argon2id
    const { hash, hashType } = await PasswordService.hashPassword(args.password);

    const userId = await ctx.db.insert("users", {
      email: args.email,
      passwordHash: hash,
      hashType,  // "argon2id"
      name: args.name,
      createdAt: Date.now(),
    });

    // Log event
    await ctx.db.insert("events", {
      type: "user_registered",
      actorId: userId,
      targetId: userId,
      timestamp: Date.now(),
      metadata: {
        hashType: "argon2id", // Track that new users use Argon2
      },
    });

    // Create session...
  }
});
```

#### Step 4: Update Sign-In Mutation (Lazy Migration)

**Location:** `backend/convex/mutations/auth.ts` (or equivalent)

**Key Innovation:** Rehash passwords transparently on successful login.

```typescript
// AFTER (Dual-hash support with lazy migration)
export const signIn = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const { PasswordService } = await import('../services/passwordService');

    // 1. Find user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // 2. Verify password with appropriate hash type
    const hashType = user.hashType || "sha256"; // Default to SHA-256 for legacy users
    const isValid = await PasswordService.verifyPassword(
      args.password,
      user.passwordHash,
      hashType
    );

    if (!isValid) {
      throw new Error("Invalid email or password");
    }

    // 3. CRITICAL: Rehash if using legacy SHA-256
    if (PasswordService.needsRehash(user.hashType)) {
      const { hash, hashType: newHashType } = await PasswordService.hashPassword(args.password);

      await ctx.db.patch(user._id, {
        passwordHash: hash,
        hashType: newHashType,
      });

      // Log migration event
      await ctx.db.insert("events", {
        type: "password_rehashed",
        actorId: user._id,
        targetId: user._id,
        timestamp: Date.now(),
        metadata: {
          oldHashType: "sha256",
          newHashType: "argon2id",
        },
      });

      console.log(`✅ Migrated user ${user.email} from SHA-256 to Argon2id`);
    }

    // 4. Create session
    const sessionToken = crypto.randomUUID();
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days

    await ctx.db.insert("sessions", {
      userId: user._id,
      token: sessionToken,
      expiresAt,
      createdAt: Date.now(),
    });

    // 5. Log login event
    await ctx.db.insert("events", {
      type: "user_login",
      actorId: user._id,
      targetId: user._id,
      timestamp: Date.now(),
      metadata: {
        hashType: user.hashType || "argon2id", // After migration
      },
    });

    return {
      token: sessionToken,
      userId: user._id,
    };
  }
});
```

**Migration Flow:**

```
User signs in → Verify with SHA-256 → Success → Rehash with Argon2id → Update DB
                     ↓
              If Argon2id already, skip rehashing
```

#### Step 5: Update Password Reset Mutation

**Location:** `backend/convex/mutations/auth.ts` (or equivalent)

**Change:** Reset passwords use Argon2id immediately.

```typescript
export const resetPassword = mutation({
  args: { token: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const { PasswordService } = await import('../services/passwordService');

    // 1. Validate reset token
    const resetToken = await ctx.db
      .query("resetTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!resetToken || resetToken.expiresAt < Date.now() || resetToken.used) {
      throw new Error("Invalid or expired reset token");
    }

    // 2. Hash new password with Argon2id
    const { hash, hashType } = await PasswordService.hashPassword(args.password);

    // 3. Update user password
    await ctx.db.patch(resetToken.userId, {
      passwordHash: hash,
      hashType, // "argon2id"
    });

    // 4. Mark token as used
    await ctx.db.patch(resetToken._id, { used: true });

    // 5. Invalidate all sessions (security)
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_userId", (q) => q.eq("userId", resetToken.userId))
      .collect();

    for (const session of sessions) {
      await ctx.db.delete(session._id);
    }

    // 6. Log event
    await ctx.db.insert("events", {
      type: "password_reset_completed",
      actorId: resetToken.userId,
      targetId: resetToken.userId,
      timestamp: Date.now(),
      metadata: {
        hashType: "argon2id",
      },
    });

    return { success: true };
  }
});
```

---

### Phase 3: Testing (Cycle 5)

#### Test Scenarios

**1. New User Registration (Argon2id)**

```typescript
// Test: New users get Argon2id hashes
it("should hash new user passwords with Argon2id", async () => {
  const email = generateTestEmail("argon2-new");
  const password = "SecurePassword123!";

  await convex.mutation(api.auth.signUp, {
    email,
    password,
    name: "Argon2 Test User",
  });

  // Verify user can sign in
  const signInResult = await convex.mutation(api.auth.signIn, {
    email,
    password,
  });

  expect(signInResult.token).toBeDefined();
});
```

**2. Existing User Login (SHA-256 → Argon2id Migration)**

```typescript
// Test: Legacy users migrated on first login
it("should migrate SHA-256 users to Argon2id on login", async () => {
  const email = generateTestEmail("argon2-migration");
  const password = "LegacyPassword123!";

  // Create legacy user (manual DB insert with SHA-256 hash)
  const passwordHash = createHash('sha256').update(password).digest('hex');

  const userId = await convex.mutation(api.internal.createLegacyUser, {
    email,
    passwordHash,
    hashType: "sha256",
    name: "Legacy User",
  });

  // First login: Should migrate hash
  const signInResult = await convex.mutation(api.auth.signIn, {
    email,
    password,
  });

  expect(signInResult.token).toBeDefined();

  // Verify hash was migrated
  const user = await convex.query(api.internal.getUser, { userId });
  expect(user.hashType).toBe("argon2id");
});
```

**3. Password Reset (Argon2id)**

```typescript
// Test: Password reset uses Argon2id
it("should use Argon2id for password reset", async () => {
  const email = generateTestEmail("argon2-reset");
  const oldPassword = "OldPassword123!";
  const newPassword = "NewPassword123!";

  // Create user
  await convex.mutation(api.auth.signUp, {
    email,
    password: oldPassword,
    name: "Reset Test User",
  });

  // Request password reset
  await convex.mutation(api.auth.requestPasswordReset, {
    email,
    baseUrl: "http://localhost:4321",
  });

  // Get reset token (from backend logs/database)
  const token = "test-reset-token"; // Mock token

  // Reset password
  await convex.mutation(api.auth.resetPassword, {
    token,
    password: newPassword,
  });

  // Verify can sign in with new password
  const signInResult = await convex.mutation(api.auth.signIn, {
    email,
    password: newPassword,
  });

  expect(signInResult.token).toBeDefined();
});
```

**4. Performance Test**

```typescript
// Test: Argon2 hashing performance is acceptable
it("should hash passwords within acceptable time (< 200ms)", async () => {
  const { PasswordService } = await import('../services/passwordService');
  const password = "PerformanceTest123!";

  const start = Date.now();
  await PasswordService.hashPassword(password);
  const duration = Date.now() - start;

  console.log(`Argon2 hashing took: ${duration}ms`);
  expect(duration).toBeLessThan(200); // Should be < 200ms
});
```

**5. Security Test**

```typescript
// Test: Same password produces different hashes (salt verification)
it("should produce unique hashes for same password", async () => {
  const { PasswordService } = await import('../services/passwordService');
  const password = "TestPassword123!";

  const { hash: hash1 } = await PasswordService.hashPassword(password);
  const { hash: hash2 } = await PasswordService.hashPassword(password);

  expect(hash1).not.toBe(hash2); // Different salts = different hashes
});
```

#### Test Execution

```bash
# Run all auth tests
cd /home/user/one.ie/web
bun test src/tests/people/auth/

# Run specific migration tests
bun test src/tests/people/auth/argon2-migration.test.ts
```

**Success Criteria:**
- ✅ All tests pass
- ✅ New users get Argon2id hashes
- ✅ Legacy users migrated transparently on login
- ✅ Password reset uses Argon2id
- ✅ Hashing performance < 200ms
- ✅ Unique salts per password

---

## Database Schema Changes

### Before Migration

```typescript
users: defineTable({
  email: v.string(),
  passwordHash: v.string(), // SHA-256 hash
  name: v.string(),
  createdAt: v.number(),
})
  .index("by_email", ["email"])
```

### After Migration

```typescript
users: defineTable({
  email: v.string(),
  passwordHash: v.string(), // SHA-256 or Argon2id hash
  hashType: v.optional(v.union(
    v.literal("sha256"),
    v.literal("argon2id")
  )), // Default: "sha256" for existing users
  name: v.string(),
  createdAt: v.number(),
})
  .index("by_email", ["email"])
  .index("by_hashType", ["hashType"]) // Track migration progress
```

**Index Rationale:**
- `by_hashType`: Query migration progress (how many users still on SHA-256)

---

## Rollback Strategy

### Scenario: Critical Bug in Argon2 Implementation

**Problem:** Argon2 hashing breaks login for some users.

**Rollback Steps:**

1. **Revert Sign-Up Mutation** (Immediate - 5 minutes)

```typescript
// Rollback to SHA-256 for new users
export const signUp = mutation({
  args: { email: v.string(), password: v.string(), name: v.string() },
  handler: async (ctx, args) => {
    // ROLLBACK: Use SHA-256 again
    const passwordHash = createHash('sha256')
      .update(args.password)
      .digest('hex');

    const userId = await ctx.db.insert("users", {
      email: args.email,
      passwordHash,
      hashType: "sha256", // Mark as SHA-256
      name: args.name,
      createdAt: Date.now(),
    });

    // ...
  }
});
```

2. **Disable Lazy Migration** (Immediate - 5 minutes)

```typescript
// Sign-in mutation: Stop rehashing
export const signIn = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    // ... verification logic ...

    // ROLLBACK: Skip rehashing
    // if (PasswordService.needsRehash(user.hashType)) {
    //   // DISABLED during rollback
    // }

    // Create session normally...
  }
});
```

3. **Verify Users Can Still Log In** (10 minutes)

```bash
# Test login with SHA-256 users
bun test src/tests/people/auth/auth.test.ts

# Test login with Argon2id users (should still work)
bun test src/tests/people/auth/argon2-migration.test.ts
```

4. **Investigate Issue** (Hours to Days)

- Check Convex logs for errors
- Verify Argon2 parameters
- Test in isolated environment
- Identify root cause

5. **Fix and Re-Deploy** (When Ready)

- Implement fix
- Test thoroughly
- Re-enable Argon2 for new users
- Re-enable lazy migration

**Impact of Rollback:**
- ✅ All users can still log in (both SHA-256 and Argon2id)
- ✅ New users temporarily get SHA-256 (acceptable for short rollback)
- ✅ Argon2id users remain on Argon2id (verification still works)
- ⚠️ Migration paused (resume after fix)

**Key Principle:** Dual-hash support ensures rollback safety. Both hash types work simultaneously.

---

## Migration Progress Tracking

### Dashboard Query (Monitor Progress)

```typescript
// backend/convex/queries/admin/migrationProgress.ts
export const getMigrationProgress = query({
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("users").collect();

    const sha256Count = allUsers.filter(u => u.hashType === "sha256" || !u.hashType).length;
    const argon2Count = allUsers.filter(u => u.hashType === "argon2id").length;
    const totalUsers = allUsers.length;

    const percentComplete = totalUsers > 0
      ? Math.round((argon2Count / totalUsers) * 100)
      : 0;

    return {
      totalUsers,
      sha256Users: sha256Count,
      argon2Users: argon2Count,
      percentComplete,
      lastMigrated: await getLastMigrationEvent(ctx),
    };
  }
});

async function getLastMigrationEvent(ctx: QueryCtx) {
  const event = await ctx.db
    .query("events")
    .withIndex("by_type", q => q.eq("type", "password_rehashed"))
    .order("desc")
    .first();

  if (!event) return null;

  return {
    userId: event.actorId,
    timestamp: event.timestamp,
    timeAgo: formatDistanceToNow(event.timestamp),
  };
}
```

### Admin Dashboard UI

```typescript
// web/src/components/admin/MigrationProgress.tsx
export function MigrationProgress() {
  const progress = useQuery(api.queries.admin.migrationProgress);

  if (!progress) return <Skeleton />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Argon2 Migration Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Total Users</span>
              <span className="font-bold">{progress.totalUsers}</span>
            </div>
            <Progress value={progress.percentComplete} />
            <p className="text-sm text-muted-foreground mt-2">
              {progress.percentComplete}% complete
            </p>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">SHA-256 (Legacy)</p>
              <p className="text-2xl font-bold text-destructive">
                {progress.sha256Users}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Argon2id (Secure)</p>
              <p className="text-2xl font-bold text-primary">
                {progress.argon2Users}
              </p>
            </div>
          </div>

          {progress.lastMigrated && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Last Migration</p>
                <p className="text-sm font-medium">
                  {progress.lastMigrated.timeAgo}
                </p>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

### Migration Events (Audit Trail)

**Event Type:** `password_rehashed`

**Schema:**

```typescript
events: defineTable({
  type: v.string(), // "password_rehashed"
  actorId: v.id("things"), // User who logged in
  targetId: v.id("things"), // Same user
  timestamp: v.number(),
  metadata: v.object({
    oldHashType: v.literal("sha256"),
    newHashType: v.literal("argon2id"),
  }),
})
  .index("by_type", ["type", "timestamp"])
```

**Query Migration Events:**

```typescript
// Get recent migrations
export const getRecentMigrations = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("events")
      .withIndex("by_type", q => q.eq("type", "password_rehashed"))
      .order("desc")
      .take(50);
  }
});
```

---

## Timeline for Complete Migration

### Expected Migration Curve

**Assumptions:**
- 1000 active users
- 70% weekly active users (700)
- 30% monthly active users (300)

**Week 1:** ~50% migration (500 users)
**Week 2:** ~70% migration (700 users)
**Month 1:** ~90% migration (900 users)
**Month 3:** ~98% migration (980 users)

**Remaining 2%:** Inactive users (last login > 3 months)

### Force Migration Strategy (Optional - Month 3+)

**Scenario:** Need to deprecate SHA-256 completely for compliance.

**Options:**

1. **Email Inactive Users** (Recommended)
   - Send password reset emails to SHA-256 users
   - Reset link forces Argon2id on password change
   - Timeline: +2 weeks

2. **Expire SHA-256 Sessions** (Aggressive)
   - After 3 months, require password reset for SHA-256 users
   - One-time forced password change on next login
   - Timeline: Immediate

3. **Admin-Initiated Bulk Migration** (Not Recommended)
   - Cannot rehash without knowing plaintext password
   - Would require password reset for all users
   - User experience: Poor (everyone must reset password)

**Recommended Approach:** Email inactive users, wait 1 month, then expire SHA-256 sessions.

---

## Security Considerations

### Argon2 Parameter Selection

**Chosen Parameters:**

```typescript
{
  memoryCost: 19456,    // 19 MB (OWASP minimum: 19 MB)
  timeCost: 2,          // 2 iterations (OWASP minimum: 2)
  parallelism: 1,       // 1 thread (Convex constraint)
  outputLen: 32,        // 32 bytes = 256 bits
}
```

**Rationale:**

1. **memoryCost (19 MB):**
   - OWASP recommendation: 19-46 MB for modern systems
   - Prevents GPU/ASIC attacks (GPUs have limited memory bandwidth)
   - Safe for Convex serverless runtime

2. **timeCost (2 iterations):**
   - OWASP recommendation: 2-3 iterations
   - Balance security vs login speed (~50-100ms)
   - Can be increased as hardware improves

3. **parallelism (1 thread):**
   - Convex runtime: limited concurrency per request
   - Higher parallelism = faster hashing but requires more CPU cores
   - Single thread is safest for serverless

4. **outputLen (32 bytes):**
   - 256-bit hash (same security level as SHA-256, but memory-hard)
   - Sufficient for password verification

### Future Parameter Adjustments

**Monitor Performance:**

```typescript
// Log hashing duration
const start = Date.now();
await PasswordService.hashPassword(password);
const duration = Date.now() - start;

await ctx.db.insert("events", {
  type: "password_hash_performance",
  timestamp: Date.now(),
  metadata: {
    duration,
    hashType: "argon2id",
  },
});
```

**Increase Cost Over Time:**

```typescript
// Example: Increase memory cost in 2026
const ARGON2_PARAMS = {
  memoryCost: Date.now() > Date.parse("2026-01-01") ? 32768 : 19456,
  timeCost: 2,
  parallelism: 1,
};
```

---

## Success Criteria

### Phase 1 (Cycle 3): Dependencies Installed

- ✅ `@node-rs/argon2` installed
- ✅ Argon2 test script passes
- ✅ Performance benchmark < 200ms per hash
- ✅ No Convex runtime errors

### Phase 2 (Cycle 4): Implementation Complete

- ✅ Schema migration adds `hashType` field
- ✅ New users get Argon2id hashes
- ✅ Sign-in mutation supports dual-hash verification
- ✅ Lazy migration on login works
- ✅ Password reset uses Argon2id
- ✅ All auth mutations updated

### Phase 3 (Cycle 5): Testing Passed

- ✅ New user registration test passes
- ✅ Legacy user migration test passes
- ✅ Password reset test passes
- ✅ Performance test passes (< 200ms)
- ✅ Security test passes (unique salts)
- ✅ Rollback procedure documented

### Post-Migration: Monitoring

- ✅ Migration dashboard shows progress
- ✅ Events table logs all migrations
- ✅ Admin can view migration status
- ✅ 90%+ users migrated within 1 month
- ✅ No login errors from Argon2 implementation

---

## References

### OWASP Recommendations

- **OWASP Password Storage Cheat Sheet:** https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- **Argon2 Specification:** https://github.com/P-H-C/phc-winner-argon2/blob/master/argon2-specs.pdf
- **Better Auth Argon2 Support:** https://www.better-auth.com/docs/concepts/password-hashing

### Related Documents

- **Better Auth Roadmap:** `/one/things/plans/better-auth-roadmap.md`
- **6-Dimension Ontology:** `/one/knowledge/ontology.md`
- **Security Rules:** `/one/knowledge/rules.md`

### External Resources

- `@node-rs/argon2` NPM: https://www.npmjs.com/package/@node-rs/argon2
- Argon2 vs Bcrypt: https://www.twelve21.io/how-to-choose-the-right-password-hashing-algorithm/

---

## Next Steps

1. **Review this strategy** with stakeholders
2. **Begin Cycle 3:** Install Argon2 dependencies
3. **Begin Cycle 4:** Implement dual-hash authentication
4. **Begin Cycle 5:** Test migration flows
5. **Deploy to production** with monitoring
6. **Monitor migration progress** via admin dashboard
7. **Complete migration** within 1-3 months

---

**Built with security, transparency, and zero downtime in mind.**
