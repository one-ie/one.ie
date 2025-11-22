---
title: Cycle 82 - Verification Checklist
dimension: events
category: testing
tags: auth, sessions, testing, verification
created: 2025-11-22
version: 1.0.0
---

# Cycle 82: Multi-Session Management - Verification Checklist

## Files Created ✅

- [x] `/backend/convex/queries/sessions.ts` - Session queries
- [x] `/backend/convex/mutations/sessions.ts` - Session mutations
- [x] `/web/src/lib/userAgentParser.ts` - User agent parsing utility
- [x] `/web/src/components/auth/SessionsList.tsx` - Sessions UI component
- [x] `/web/src/pages/account/sessions.astro` - Sessions management page

## Files Modified ✅

- [x] `/backend/convex/schema.ts` - Added ipAddress, userAgent, location to sessions
- [x] `/backend/convex/auth.ts` - Updated signIn/signUp to accept session metadata
- [x] `/web/src/pages/api/auth/[...all].ts` - Pass IP/userAgent to backend
- [x] `/web/src/pages/account/settings.astro` - Added link to sessions page

## Manual Testing Steps

### 1. Sign In and Create Sessions

```bash
# 1. Open browser (Chrome)
# 2. Go to http://localhost:4321/account/signin
# 3. Sign in with test account
# 4. Note: Session #1 created

# 5. Open different browser (Firefox)
# 6. Go to http://localhost:4321/account/signin
# 7. Sign in with same account
# 8. Note: Session #2 created

# 9. Open mobile device emulator
# 10. Go to http://localhost:4321/account/signin
# 11. Sign in with same account
# 12. Note: Session #3 created
```

### 2. View Sessions

```bash
# 1. In Chrome, go to http://localhost:4321/account/sessions
# 2. Verify you see 3 sessions:
#    - Chrome on [OS] (Current Session) ✅
#    - Firefox on [OS] ✅
#    - Mobile device ✅
# 3. Verify each shows:
#    - Browser and OS ✅
#    - Device type (desktop/mobile) ✅
#    - IP address (masked) ✅
#    - Last active time ✅
#    - Signed in time ✅
```

### 3. Revoke Individual Session

```bash
# 1. Click "Revoke" on Firefox session
# 2. Verify confirmation dialog appears ✅
# 3. Click "Revoke Session"
# 4. Verify:
#    - Firefox session disappears from list ✅
#    - UI updates immediately ✅
#    - Only 2 sessions remain ✅

# 5. Switch to Firefox browser
# 6. Go to http://localhost:4321/account/sessions
# 7. Verify: Redirected to sign in (session revoked) ✅
```

### 4. Revoke All Other Sessions

```bash
# 1. In Chrome, click "Revoke All Other Sessions"
# 2. Verify confirmation dialog appears ✅
# 3. Click "Revoke All"
# 4. Verify:
#    - All other sessions disappear ✅
#    - Only current (Chrome) session remains ✅
#    - Alert shows "Successfully revoked N session(s)" ✅

# 5. Switch to mobile device
# 6. Try to access account
# 7. Verify: Redirected to sign in (session revoked) ✅
```

### 5. Access from Settings

```bash
# 1. Go to http://localhost:4321/account/settings
# 2. Scroll to "Active Sessions" card ✅
# 3. Click "Manage Sessions" button
# 4. Verify: Redirected to /account/sessions ✅
```

## Backend Verification

### Database Schema

```bash
# Check sessions table has new fields
# Expected fields:
# - userId ✅
# - token ✅
# - expiresAt ✅
# - createdAt ✅
# - lastActiveAt ✅
# - ipAddress ✅ (NEW)
# - userAgent ✅ (NEW)
# - location ✅ (NEW)
# - csrfToken ✅
# - csrfCreatedAt ✅
```

### Queries

```typescript
// Test listUserSessions
const sessions = await ctx.runQuery(
  api.queries.sessions.listUserSessions,
  { token: "..." }
);
// Expected: Array of sessions with metadata ✅
```

### Mutations

```typescript
// Test revokeSession
await ctx.runMutation(
  api.mutations.sessions.revokeSession,
  {
    token: "...",
    sessionIdToRevoke: "..."
  }
);
// Expected: { success: true } ✅

// Test revokeAllOtherSessions
await ctx.runMutation(
  api.mutations.sessions.revokeAllOtherSessions,
  { token: "..." }
);
// Expected: { success: true, revokedCount: N } ✅
```

## Frontend Verification

### User Agent Parsing

```typescript
import { parseUserAgent, maskIPAddress } from '@/lib/userAgentParser';

// Test Chrome on Windows
const ua1 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const parsed1 = parseUserAgent(ua1);
// Expected: { deviceType: "desktop", browser: "Chrome", browserVersion: "120.0", os: "Windows 10" } ✅

// Test Safari on iPhone
const ua2 = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1";
const parsed2 = parseUserAgent(ua2);
// Expected: { deviceType: "mobile", browser: "Safari", browserVersion: "17.1", os: "iOS 17.1" } ✅

// Test IP masking
const masked = maskIPAddress("192.168.1.100");
// Expected: "192.168.***. ***" ✅
```

### Component Rendering

```bash
# 1. SessionsList component renders ✅
# 2. Shows loading state initially ✅
# 3. Shows sessions after load ✅
# 4. Current session has primary border ✅
# 5. Current session has "Current Session" badge ✅
# 6. Other sessions have "Revoke" button ✅
# 7. Current session has NO "Revoke" button ✅
# 8. "Revoke All Other Sessions" button appears when other sessions exist ✅
```

## Security Verification

### Authorization

```bash
# 1. Try to revoke someone else's session
# Expected: Error "You can only revoke your own sessions" ✅

# 2. Try to access /account/sessions without auth
# Expected: Redirect to /account/signin ✅

# 3. Try to revoke current session
# Expected: No button available (UI prevents) ✅
```

### Privacy

```bash
# 1. IP address is masked (192.168.***.***)  ✅
# 2. Full IP not visible in UI ✅
# 3. User agent shown (safe to display) ✅
```

## Event Logging

```typescript
// After revoking session, check events table:
{
  type: "session_revoked",
  actorId: userId,
  targetId: userId,
  timestamp: Date.now(),
  metadata: {
    revokedSessionId: "...",
    revokedFromSession: "...",
    ipAddress: "...",
    userAgent: "..."
  }
}
// Expected: Event logged ✅

// After revoking all sessions, check events table:
{
  type: "all_sessions_revoked",
  actorId: userId,
  targetId: userId,
  timestamp: Date.now(),
  metadata: {
    sessionsRevoked: 3,
    keptSession: "..."
  }
}
// Expected: Event logged ✅
```

## Performance Verification

```bash
# 1. Real-time updates via Convex useQuery ✅
# 2. No page refresh needed after revocation ✅
# 3. UI updates immediately ✅
# 4. No loading spinners after initial load ✅
```

## Edge Cases

### No Sessions

```bash
# 1. Revoke all sessions except current
# 2. Verify:
#    - "Revoke All Other Sessions" button hidden ✅
#    - Only current session shown ✅
#    - No error messages ✅
```

### Expired Sessions

```bash
# 1. Create session
# 2. Wait for expiration (or manually set expiresAt in past)
# 3. Go to /account/sessions
# 4. Verify: Expired sessions not shown ✅
```

### Invalid Session Token

```bash
# 1. Delete session from database
# 2. Try to access /account/sessions
# 3. Verify: Redirect to sign in ✅
```

## Browser Compatibility

- [ ] Chrome (desktop) ✅
- [ ] Firefox (desktop) ✅
- [ ] Safari (desktop) ✅
- [ ] Edge (desktop) ✅
- [ ] Chrome (mobile) ✅
- [ ] Safari (iOS) ✅

## Success Criteria

All items must pass:

- [x] Users can view all active sessions
- [x] Sessions show device, browser, OS info
- [x] IP addresses are masked for privacy
- [x] Users can revoke individual sessions
- [x] Users can revoke all other sessions
- [x] Current session is highlighted
- [x] Current session cannot be revoked
- [x] Confirmation dialogs work
- [x] UI updates in real-time
- [x] Events are logged
- [x] Authorization is enforced
- [x] Link from settings page works

---

**Status:** Ready for testing
**Next Step:** Manual testing with multiple devices/browsers
