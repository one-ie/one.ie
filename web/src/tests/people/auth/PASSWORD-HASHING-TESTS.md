# Password Hashing Migration Tests (Cycle 5)

## Overview

This directory contains comprehensive tests for the password hashing migration from SHA-256 to Argon2id, as defined in Better Auth Roadmap Cycle 5.

## Test File

**Location:** `/web/src/tests/people/auth/password-hashing-migration.test.ts`

**Purpose:** Validate complete migration from SHA-256 to Argon2id password hashing

## Status

⚠️  **BLOCKED - Awaiting Cycles 1-4 completion**

See detailed status: `/one/events/test-results-argon2-migration.md`

## Test Coverage (24 Tests, 6 Categories)

### 1. New User Registration with Argon2id (3 tests)
- Hash new user passwords with Argon2id
- Create valid session for Argon2id user
- Reject wrong password for Argon2id user

### 2. Legacy User Login with SHA-256 (3 tests)
- Create legacy user with SHA-256 hash (test setup)
- Allow legacy user to login with SHA-256 hash
- Reject wrong password for legacy user

### 3. Password Rehashing on Login (3 tests)
- Rehash password to Argon2id on successful login
- Verify rehashed password works correctly
- Handle concurrent logins during rehashing

### 4. Session Creation After Login (4 tests)
- Create valid session for Argon2id user
- Create valid session for rehashed user
- Allow multiple active sessions per user
- Include session expiry metadata

### 5. Error Cases and Edge Cases (6 tests)
- Reject empty password
- Reject very weak passwords
- Handle corrupted hash gracefully
- Handle special characters in password
- Handle very long passwords
- Handle unicode characters in password

### 6. Migration Performance and Security (3 tests)
- Complete rehashing within acceptable time (< 1s)
- Not leak hash algorithm information in errors
- Maintain password hash security properties

## Prerequisites (Must Complete First)

### Cycle 1: Audit Current Implementation
- [ ] Read current auth.ts implementation
- [ ] Document SHA-256 usage
- [ ] Identify all password mutations
- [ ] Create security audit report

### Cycle 2: Design Migration Strategy
- [ ] Plan rehashing approach
- [ ] Design backward compatibility
- [ ] Document migration strategy
- [ ] Define rollback plan

### Cycle 3: Install Dependencies
- [ ] Create `backend/package.json`
- [ ] Install `@node-rs/argon2`
- [ ] Install `convex`
- [ ] Test Argon2 performance
- [ ] Verify Convex compatibility

### Cycle 4: Implement Argon2 Hashing
- [ ] Create `backend/convex/auth.ts`
- [ ] Implement Argon2id in signUp
- [ ] Add dual hash support in signIn
- [ ] Implement rehashing logic
- [ ] Create test helper (createLegacyUser)
- [ ] Define Convex schema
- [ ] Generate API types

## Running Tests (After Prerequisites)

### Quick Run
```bash
cd /home/user/one.ie/web
bun test src/tests/people/auth/password-hashing-migration.test.ts
```

### With Coverage
```bash
bun test --coverage src/tests/people/auth/password-hashing-migration.test.ts
```

### Watch Mode
```bash
bun test --watch src/tests/people/auth/password-hashing-migration.test.ts
```

## Expected Results

When all prerequisites are met, expect:

```
✓ Password Hashing Migration (SHA-256 → Argon2id) (24 tests)
  ✓ 1. New User Registration with Argon2id (3)
  ✓ 2. Legacy User Login with SHA-256 (3)
  ✓ 3. Password Rehashing on Login (3)
  ✓ 4. Session Creation After Login (4)
  ✓ 5. Error Cases and Edge Cases (6)
  ✓ 6. Migration Performance and Security (3)

Test Files  1 passed (1)
Tests  24 passed (24)
Duration  ~15s
Coverage  80%+
```

## Performance Targets

- **Total suite:** < 30 seconds
- **Per test:** < 1 second
- **Rehashing:** < 100ms
- **Coverage:** 80%+

## Security Validations

Each test validates:

1. **No plaintext passwords** stored
2. **Hash format** correct (Argon2id)
3. **Error messages** don't leak algorithm details
4. **Timing attacks** prevented (constant-time comparisons)
5. **Concurrent access** handled safely

## Troubleshooting

### Test fails with "Cannot find module 'backend/convex/_generated/api'"
**Solution:** Complete Cycles 1-4 first. Backend must be implemented.

### Test fails with "createLegacyUser is not defined"
**Solution:** Implement test helper in Cycle 4:
```typescript
// backend/convex/mutations/createLegacyUser.ts
export const createLegacyUser = mutation({
  handler: async (ctx, { email, password, name }) => {
    // Create user with SHA-256 hash for testing
  }
});
```

### Tests timeout
**Solution:** Check Convex deployment is running and accessible.

### Coverage below 80%
**Solution:** Verify all code paths are tested, add missing tests.

## Related Files

- **Roadmap:** `/one/things/plans/better-auth-roadmap.md`
- **Test Results:** `/one/events/test-results-argon2-migration.md`
- **Architecture:** `/one/knowledge/better-auth-architecture.md`
- **Test Utils:** `/web/src/tests/people/auth/utils.ts`

## Next Steps

1. **Complete Cycle 1:** Audit SHA-256 implementation
2. **Complete Cycle 2:** Design migration strategy
3. **Complete Cycle 3:** Install Argon2 dependencies
4. **Complete Cycle 4:** Implement Argon2 hashing
5. **Run Cycle 5 tests:** Execute this test suite
6. **Verify:** All 24 tests pass
7. **Document:** Update test results

## Contributing

When adding new password hashing tests:

1. Follow existing test structure
2. Use TestLogger for consistent logging
3. Include security validations
4. Test both positive and negative cases
5. Verify performance targets
6. Update this README

---

**Built with security and comprehensive testing in mind.**
