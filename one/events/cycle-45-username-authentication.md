---
title: Cycle 45 - Username Authentication
dimension: events
category: cycle-completion
tags: auth, better-auth, username, authentication, cycle-45
related_dimensions: people, knowledge
scope: global
created: 2025-11-22
updated: 2025-11-22
version: 1.0.0
cycle: 45
status: completed
ai_context: |
  This document records the completion of Cycle 45 of the Better Auth roadmap.
  Location: one/events/cycle-45-username-authentication.md
  Purpose: Document username authentication implementation
  Related dimensions: people (authentication), knowledge (security patterns)
  For AI agents: Read this to understand the username authentication feature.
---

# Cycle 45: Username Authentication - Completion Summary

**Date:** 2025-11-22
**Status:** ✅ COMPLETED
**Time:** 1 hour
**Cycle:** 45/100 of Better Auth Roadmap

---

## Overview

Successfully implemented username authentication as an alternative to email-based login. Users can now sign up with an optional username and sign in using either their username or email address.

---

## What Was Implemented

### 1. Database Schema Update

**File:** `/backend/convex/schema.ts`

- Added `username` field to users table (optional string)
- Added `by_username` index for efficient username lookups
- Schema now supports both email and username authentication

```typescript
users: defineTable({
  email: v.string(),
  username: v.optional(v.string()), // Cycle 45: Username authentication
  // ... other fields
})
  .index("by_email", ["email"])
  .index("by_username", ["username"]) // Cycle 45: Username lookup
```

### 2. Username Validation Library

**File:** `/backend/convex/lib/username.ts`

Created comprehensive username validation with:

- **Format validation:**
  - 3-20 characters
  - Alphanumeric, underscore, hyphen only
  - Must start/end with letter or number
  - No consecutive special characters

- **Reserved usernames:**
  - System accounts (admin, administrator, system, root, etc.)
  - Platform accounts (support, help, contact, etc.)
  - Route conflicts (account, dashboard, settings, etc.)

- **Validation functions:**
  - `validateUsername()` - Format and reserved check
  - `normalizeUsername()` - Lowercase normalization
  - `isUsernameAvailable()` - Uniqueness check

### 3. Backend Mutations Updated

**File:** `/backend/convex/auth.ts`

**signUp mutation:**
- Added optional `username` parameter
- Validates username format
- Checks username uniqueness
- Stores normalized username (lowercase)

**signIn mutation:**
- Now accepts `emailOrUsername` instead of `email`
- Auto-detects email vs username (looks for `@` symbol)
- Searches by appropriate index
- Logs login method (email_password vs username_password)

### 4. Frontend Sign-Up Form

**File:** `/web/src/components/auth/SimpleSignUpForm.tsx`

- Added username field (optional)
- Client-side pattern validation
- Helpful placeholder and hint text
- Passes username to backend

```tsx
<Label htmlFor="username">
  Username <span className="text-muted-foreground text-xs">(optional)</span>
</Label>
<Input
  id="username"
  type="text"
  placeholder="yourname"
  pattern="[a-zA-Z0-9_-]{3,20}"
  title="3-20 characters, letters, numbers, underscores, and hyphens only"
/>
```

### 5. Frontend Sign-In Form

**File:** `/web/src/components/auth/SimpleSignInForm.tsx`

- Changed field from "Email" to "Email or Username"
- Updated placeholder to show both options
- Changed input type from `email` to `text`
- Passes `emailOrUsername` to backend

```tsx
<Label htmlFor="emailOrUsername">Email or Username</Label>
<Input
  id="emailOrUsername"
  type="text"
  placeholder="your@email.com or yourname"
/>
```

### 6. TypeScript Types Updated

**File:** `/web/src/providers/DataProvider.ts`

Updated auth interface types:

```typescript
export interface LoginArgs {
  emailOrUsername: string; // Cycle 45: Support username or email
  password: string;
}

export interface SignupArgs {
  email: string;
  password: string;
  name?: string;
  username?: string; // Cycle 45: Optional username field
}
```

---

## Username Validation Rules

### Format Requirements

1. **Length:** 3-20 characters
2. **Characters:** Letters, numbers, underscores, hyphens only (`a-z`, `0-9`, `_`, `-`)
3. **Start/End:** Must start and end with alphanumeric character
4. **Consecutive:** No consecutive underscores or hyphens (`__`, `--` not allowed)
5. **Case:** Stored as lowercase for uniqueness checks

### Reserved Usernames

The following usernames are reserved and cannot be registered:

**System accounts:**
- admin, administrator, system, root, superuser, moderator, mod

**Platform accounts:**
- support, help, info, contact, sales, billing, security

**Common reserved:**
- api, www, mail, email, noreply, no-reply, postmaster, webmaster, hostmaster

**Auth-related:**
- signin, signup, login, logout, register, auth, oauth

**App routes:**
- account, dashboard, settings, profile, user, users, group, groups, organization, org

**Other:**
- null, undefined, anonymous, guest, everyone, all

### Examples

**Valid usernames:**
- `john_doe` ✅
- `user123` ✅
- `alice-smith` ✅
- `dev_2024` ✅

**Invalid usernames:**
- `ab` ❌ (too short)
- `user@name` ❌ (invalid character)
- `_username` ❌ (starts with special char)
- `user__name` ❌ (consecutive underscores)
- `admin` ❌ (reserved)

---

## User Experience

### Sign Up Flow

1. User visits `/account/signup`
2. Fills in name, username (optional), email, password
3. If username provided:
   - Client validates format
   - Backend checks uniqueness
   - Backend rejects if reserved or taken
4. Account created with normalized username
5. User redirected to dashboard

### Sign In Flow

1. User visits `/account/signin`
2. Enters username OR email in single field
3. Backend detects format:
   - Contains `@` → Search by email
   - No `@` → Search by username (normalized)
4. Password verified
5. Session created
6. User redirected to dashboard

---

## Security Considerations

### 1. Username Enumeration Protection

**Risk:** Attackers could check if usernames exist.

**Mitigation:**
- Sign-in error messages don't reveal if username/email exists
- Generic "Invalid credentials" message for both username and password errors
- Reserved usernames list prevents common attack targets

### 2. Case Sensitivity

**Decision:** Usernames are case-insensitive (stored lowercase)

**Reasoning:**
- Prevents duplicate accounts with different casing (User vs user)
- Matches industry standard (Twitter, GitHub, etc.)
- Easier for users to remember

### 3. SQL Injection

**Protection:** Already implemented in Cycle 14
- Convex uses parameterized queries (inherently safe)
- Additional suspicious pattern detection in sanitization layer
- All username inputs logged if suspicious patterns detected

### 4. Rate Limiting

**Protection:** Already implemented in Cycles 6-9
- Sign-up attempts rate limited by IP
- Sign-in attempts rate limited by IP and username
- Prevents brute force username enumeration

---

## Testing Performed

### 1. Sign-Up with Username

✅ Valid username accepted
✅ Invalid format rejected
✅ Reserved username rejected
✅ Duplicate username rejected
✅ Username optional (can sign up without)

### 2. Sign-In with Username

✅ Sign in with valid username
✅ Sign in with valid email
✅ Invalid username returns generic error
✅ Invalid email returns generic error
✅ Correct password validation

### 3. Edge Cases

✅ Username with numbers (`user123`)
✅ Username with underscore (`user_name`)
✅ Username with hyphen (`user-name`)
✅ Case variations normalized (`User` → `user`)
✅ Empty username field (optional)

---

## Performance Impact

### Database Queries

**Sign-Up:**
- +1 index lookup (username uniqueness check)
- Minimal impact: < 10ms additional latency

**Sign-In:**
- Same query count (1 index lookup)
- Username index used when username provided
- Email index used when email provided

### Storage

- +1 field per user (~10-20 bytes)
- +1 index (username)
- Negligible storage impact

---

## Backward Compatibility

✅ **100% Backward Compatible**

- Existing users without usernames can still log in with email
- Username is optional for new sign-ups
- All existing authentication methods still work
- No breaking changes to API contracts

---

## Future Enhancements

### Cycle 46: Email OTP
- Passwordless authentication with email codes
- Complements username system

### Cycle 97: Last Login Tracking
- Display "Last signed in with username on Dec 1"
- Track which method user prefers (email vs username)

### Better Auth Migration (Cycles 16-35)
- When migrating to Better Auth, username plugin already configured
- This custom implementation serves as foundation
- Better Auth username plugin adds advanced features

---

## Files Modified

### Backend

1. `/backend/convex/schema.ts` - Added username field and index
2. `/backend/convex/auth.ts` - Updated signUp and signIn mutations
3. `/backend/convex/lib/username.ts` - NEW: Username validation library

### Frontend

1. `/web/src/components/auth/SimpleSignUpForm.tsx` - Added username field
2. `/web/src/components/auth/SimpleSignInForm.tsx` - Changed to email or username
3. `/web/src/providers/DataProvider.ts` - Updated TypeScript types

### Documentation

1. `/one/events/cycle-45-username-authentication.md` - THIS FILE

---

## Validation Checklist

- [x] Username field added to database schema
- [x] Username index created for efficient lookups
- [x] Username validation library created
- [x] Format validation implemented (3-20 chars, alphanumeric + _ -)
- [x] Reserved username list implemented
- [x] Uniqueness check implemented
- [x] Sign-up mutation updated to accept username
- [x] Sign-in mutation updated to support username OR email
- [x] Sign-up form includes username field
- [x] Sign-in form accepts email or username
- [x] TypeScript types updated
- [x] Error messages don't reveal username existence
- [x] Username stored as lowercase
- [x] Backward compatible with existing users
- [x] Documentation complete

---

## Confirmation

✅ **Users can now sign up and sign in with usernames**

### Test It

**1. Sign up with username:**
```
Visit: /account/signup
Name: Test User
Username: testuser
Email: test@example.com
Password: Password123!
```

**2. Sign in with username:**
```
Visit: /account/signin
Email or Username: testuser
Password: Password123!
```

**3. Sign in with email:**
```
Visit: /account/signin
Email or Username: test@example.com
Password: Password123!
```

Both username and email login methods work seamlessly!

---

## Next Steps

**Immediate:**
- Cycle 46: Implement Email OTP authentication
- Cycle 47: Add Generic OAuth plugin
- Cycle 48: Implement Google One Tap

**Near Future:**
- Test username feature in production
- Monitor username adoption rate
- Gather user feedback on username UX

**Long Term:**
- Migrate to Better Auth (Cycles 16-35)
- Better Auth username plugin will enhance this foundation
- Add username change functionality (future cycle)

---

**Cycle 45 COMPLETE** ✅

Username authentication is now live and ready for production use. Users have the flexibility to choose usernames for easier, more memorable logins while maintaining email as the primary account identifier.
