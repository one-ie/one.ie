# Passkey Implementation Strategy for Custom Convex Backend

**Version:** 1.0.0
**Date:** 2025-01-22
**Cycles:** 36-44 (Phase 3)

## Overview

Implement WebAuthn/FIDO2 passkeys for the custom Convex authentication system (NOT Better Auth component). Passkeys provide passwordless authentication using biometric sensors, hardware security keys, or platform authenticators.

## WebAuthn/FIDO2 Specification

**Core Concepts:**
- **Relying Party (RP)**: Our application (one.ie)
- **Authenticator**: User's device (Face ID, Touch ID, Windows Hello, security key)
- **Challenge**: Random value preventing replay attacks
- **Credential**: Public/private key pair stored on device

**Registration Flow:**
1. User initiates passkey registration
2. Server generates challenge and options
3. Browser calls `navigator.credentials.create()`
4. Authenticator creates key pair and signs challenge
5. Server verifies signature and stores public key

**Authentication Flow:**
1. User initiates passkey sign-in
2. Server generates challenge and credential IDs
3. Browser calls `navigator.credentials.get()`
4. Authenticator signs challenge with private key
5. Server verifies signature and creates session

## SimpleWebAuthn Library

**Why SimpleWebAuthn:**
- Simplifies WebAuthn complexity
- Type-safe TypeScript implementation
- Well-tested and maintained
- Works seamlessly with Convex

**Packages:**
- `@simplewebauthn/server` - Backend verification
- `@simplewebauthn/browser` - Frontend registration/authentication

**Key Functions:**

### Server (@simplewebauthn/server)
```typescript
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
```

### Browser (@simplewebauthn/browser)
```typescript
import {
  startRegistration,
  startAuthentication,
} from '@simplewebauthn/browser';
```

## Browser Compatibility

**Supported Browsers:**
- Chrome 67+ (Desktop/Android)
- Safari 13+ (macOS/iOS)
- Firefox 60+
- Edge 18+

**Platform Authenticators:**
- **macOS/iOS**: Touch ID, Face ID
- **Windows**: Windows Hello
- **Android**: Fingerprint, Face unlock
- **Linux**: FIDO2 security keys

**Graceful Degradation:**
- Check `window.PublicKeyCredential` support
- Fall back to email/password if unsupported
- Show appropriate UI based on support

## Custom Backend Integration

**Schema Design:**
```typescript
passkeys: defineTable({
  userId: v.id("users"),
  credentialId: v.string(), // Base64URL encoded
  publicKey: v.string(), // Base64URL encoded
  counter: v.number(), // Prevents replay attacks
  transports: v.optional(v.array(v.string())), // usb, nfc, ble, internal
  nickname: v.optional(v.string()), // "MacBook Pro Touch ID"
  lastUsedAt: v.optional(v.number()),
  createdAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_credential", ["credentialId"])
```

**Mutations Pattern:**
```typescript
// Registration: Start → Finish
registerPasskeyStart → Generate challenge
registerPasskeyFinish → Verify and store credential

// Authentication: Start → Finish
authenticatePasskeyStart → Generate challenge
authenticatePasskeyFinish → Verify and create session
```

**Session Integration:**
- Passkey authentication creates standard session
- Same session table and CSRF protection
- Event logging: `passkey_registered`, `user_login` (method: passkey)

## Security Considerations

**Challenge Management:**
- Generate cryptographically random challenges (32+ bytes)
- Store challenges temporarily (5 minutes expiration)
- Single-use challenges (prevent replay)

**Credential Storage:**
- Store public key only (private key stays on device)
- Base64URL encoding for transport
- Counter tracking prevents cloned credentials

**User Verification:**
- Require user verification (UV) for high-security operations
- Platform authenticators provide UV (biometrics)
- FIDO2 security keys may require PIN

## Implementation Roadmap

### Cycle 37: Install Dependencies
```bash
cd backend && npm install @simplewebauthn/server
cd ../web && bun add @simplewebauthn/browser
```

### Cycle 38: Backend Registration
- Add `passkeys` table and `passkeysChallenges` table to schema
- `registerPasskeyStart` mutation
- `registerPasskeyFinish` mutation

### Cycle 39: Frontend Registration
- `PasskeyRegistration.tsx` component
- Browser API integration
- Error handling

### Cycle 40: Backend Authentication
- `authenticatePasskeyStart` mutation
- `authenticatePasskeyFinish` mutation
- Session creation

### Cycle 41: Frontend Authentication
- `PasskeySignIn.tsx` component
- Add to sign-in page
- Conditional rendering

### Cycle 42: Management UI
- List passkeys
- Delete passkey
- Rename passkey
- Show last used

### Cycle 43: Multi-Passkey Support
- Multiple passkeys per user
- Selection UI (if multiple available)
- Test with 3+ devices

### Cycle 44: Testing & Documentation
- Test registration flow
- Test authentication flow
- Test management operations
- Browser compatibility testing
- User documentation

## Expected User Experience

**Registration:**
1. User clicks "Add Passkey" in account settings
2. System prompts: "Use Touch ID to create passkey"
3. User authenticates with biometric
4. Passkey saved: "MacBook Pro Touch ID"

**Authentication:**
1. User clicks "Sign in with passkey" on sign-in page
2. System prompts: "Use Touch ID to sign in"
3. User authenticates with biometric
4. Signed in instantly (no password needed)

**Management:**
1. User sees list of passkeys: "MacBook Pro", "iPhone 15", "YubiKey"
2. Can rename: "Work MacBook"
3. Can delete: Remove "Old iPhone"
4. Shows last used: "Used 2 hours ago"

## Success Criteria

- [ ] Passkeys work on macOS Touch ID
- [ ] Passkeys work on iOS Face ID
- [ ] Passkeys work on Windows Hello
- [ ] Passkeys work with FIDO2 security keys
- [ ] Users can register multiple passkeys
- [ ] Users can authenticate with any registered passkey
- [ ] Users can manage (rename, delete) passkeys
- [ ] Graceful degradation for unsupported browsers
- [ ] Complete event logging for audit trail
- [ ] Integration with existing custom auth system

## References

- **WebAuthn Spec**: https://www.w3.org/TR/webauthn-2/
- **SimpleWebAuthn Docs**: https://simplewebauthn.dev/
- **MDN Web Authentication API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API
- **Can I Use WebAuthn**: https://caniuse.com/webauthn

---

**Implementation Status:** Ready for Cycle 37 (Dependencies Installation)
