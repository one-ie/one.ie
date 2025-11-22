---
title: Email OTP Authentication Guide
dimension: knowledge
category: guides
tags: auth, email-otp, passwordless, security
related_dimensions: people, events
scope: global
created: 2025-11-22
ai_context: |
  Developer guide for Email OTP (One-Time Password) authentication system.
  Location: one/knowledge/email-otp-guide.md
  Purpose: How to use and configure Email OTP authentication
  Related: Cycle 46 implementation
---

# Email OTP Authentication Guide

## Overview

Email OTP (One-Time Password) provides passwordless authentication using 6-digit codes sent via email. Users enter their email, receive a code, and sign in without needing to remember a password.

## How It Works

### User Flow

1. **Visit sign-in page** → Click "Sign in with email code"
2. **Enter email** → System generates 6-digit code
3. **Check email** → Code sent to inbox (10-minute expiration)
4. **Enter code** → System verifies and creates session
5. **Signed in** → Redirected to account page

### Security Features

- **Rate limiting:** 3 requests per hour per email
- **Short expiration:** Codes expire in 10 minutes
- **Limited attempts:** Maximum 3 verification attempts per code
- **One-time use:** Code invalidated after successful use
- **Secure generation:** Cryptographically secure random codes
- **Auto-cleanup:** Expired codes automatically deleted

## Usage

### Sign In Route

**URL:** `/account/email-otp`

```astro
<!-- Link from any page -->
<a href="/account/email-otp">Sign in with email code</a>
```

### Integration in Sign-In Page

Already integrated in the default sign-in page:

```tsx
// web/src/components/auth/SimpleSignInForm.tsx
<Button variant="outline" className="w-full" asChild>
  <a href="/account/email-otp">Sign in with email code</a>
</Button>
```

## Backend API

### Request OTP Code

```typescript
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const requestOtp = useMutation(api.emailOtp.requestOtp);

// Request code
const result = await requestOtp({ email: "user@example.com" });

// Returns:
{
  success: true,
  expiresAt: 1700000000000,
  code: "123456" // Only in development mode
}
```

### Verify OTP Code

```typescript
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const verifyOtp = useMutation(api.emailOtp.verifyOtp);

// Verify code
const result = await verifyOtp({
  email: "user@example.com",
  code: "123456"
});

// Returns:
{
  token: "session_token_here",
  userId: "user_id_here",
  isNewUser: true // true if account just created
}

// Store session token
localStorage.setItem("sessionToken", result.token);
```

### Check Active OTP

```typescript
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const otpStatus = useQuery(api.emailOtp.hasActiveOtp, {
  email: "user@example.com"
});

// Returns:
{
  hasActive: true,
  expiresAt: 1700000000000,
  canResendAt: 1699999400000 // Can resend after 1 minute
}
```

## Configuration

### Development Mode

In development, OTP codes are:
- Logged to console
- Shown in toast notification
- Valid for 10 minutes

**Example console output:**
```
[DEV MODE] OTP Code for user@example.com: 123456
```

### Production Setup

1. **Set up Resend account** (https://resend.com)

2. **Add environment variables:**
```bash
# .env.local
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com
RESEND_FROM_NAME=ONE Platform
```

3. **Update emailOtp.ts mutation:**
```typescript
// backend/convex/emailOtp.ts
// Replace TODO with Resend email sending

import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`,
  to: args.email,
  subject: "Your ONE sign-in code",
  html: `
    <h2>Your verification code</h2>
    <p>Use this code to sign in to ONE:</p>
    <h1 style="font-size: 32px; letter-spacing: 8px;">${code}</h1>
    <p>This code expires in 10 minutes.</p>
    <p>If you didn't request this code, you can safely ignore this email.</p>
  `
});
```

## Email Template

### Basic Template

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Sign-In Code</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; padding: 40px;">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <h1 style="margin: 0; font-size: 24px; color: #18181b;">ONE Platform</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding-bottom: 24px;">
              <p style="margin: 0; font-size: 16px; color: #3f3f46;">Your verification code is:</p>
            </td>
          </tr>

          <!-- Code -->
          <tr>
            <td align="center" style="padding: 24px; background-color: #f4f4f5; border-radius: 8px;">
              <div style="font-size: 48px; font-weight: 700; letter-spacing: 8px; color: #18181b; font-family: 'Courier New', monospace;">
                {{CODE}}
              </div>
            </td>
          </tr>

          <!-- Expiration -->
          <tr>
            <td style="padding-top: 24px;">
              <p style="margin: 0; font-size: 14px; color: #71717a;">
                This code expires in 10 minutes.
              </p>
            </td>
          </tr>

          <!-- Security note -->
          <tr>
            <td style="padding-top: 32px; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0; font-size: 12px; color: #a1a1aa;">
                If you didn't request this code, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

Replace `{{CODE}}` with the actual 6-digit code.

## Error Handling

### Common Errors

**Rate limit exceeded:**
```typescript
"Rate limit exceeded. You can request another code in 45 minutes."
```

**Invalid code:**
```typescript
"Invalid code. 2 attempts remaining."
```

**Expired code:**
```typescript
"Code has expired. Please request a new code."
```

**Too many attempts:**
```typescript
"Too many failed attempts. Please request a new code."
```

### Error Handling Example

```typescript
try {
  const result = await verifyOtp({ email, code });
  // Success
} catch (err) {
  const error = err as { message?: string };

  if (error.message?.includes("Rate limit")) {
    // Show rate limit message
  } else if (error.message?.includes("expired")) {
    // Offer to resend
  } else if (error.message?.includes("attempts")) {
    // Show max attempts error
  } else {
    // Generic error
  }
}
```

## Testing

### Manual Testing (Development)

1. **Start development servers:**
```bash
# Terminal 1: Backend
cd backend && npx convex dev

# Terminal 2: Frontend
cd web && bun run dev
```

2. **Visit sign-in page:**
```
http://localhost:4321/account/signin
```

3. **Click "Sign in with email code"**

4. **Enter email and request code:**
- Code appears in console
- Code appears in toast notification

5. **Enter code and verify:**
- Should create session
- Should redirect to /account

### Automated Testing

```typescript
// Example test
import { test, expect } from '@playwright/test';

test('Email OTP flow', async ({ page }) => {
  // Navigate to OTP page
  await page.goto('/account/email-otp');

  // Enter email
  await page.fill('input[type="email"]', 'test@example.com');
  await page.click('button:has-text("Send code")');

  // Wait for code step
  await expect(page.locator('text=Enter verification code')).toBeVisible();

  // Get code from console (dev mode)
  const code = await getCodeFromConsole();

  // Enter code
  await page.fill('[data-testid="otp-input"]', code);

  // Should redirect to account
  await expect(page).toHaveURL('/account');
});
```

## Security Best Practices

### Implementation Checklist

- [x] Rate limiting enabled (3 per hour)
- [x] Short expiration (10 minutes)
- [x] Limited attempts (3 per code)
- [x] One-time use enforced
- [x] Secure random generation
- [x] HTTPS only in production
- [x] Session tokens secured
- [x] Event logging enabled

### Production Deployment

**Before deploying:**

1. Configure Resend API key
2. Test email delivery
3. Verify rate limiting works
4. Test on staging environment
5. Monitor error rates
6. Set up alerts for failures

**Monitoring:**

```typescript
// Check OTP usage
const otpStats = await ctx.db
  .query("events")
  .withIndex("by_type", q => q.eq("type", "email_otp_requested"))
  .filter(q => q.gte(q.field("timestamp"), Date.now() - 24 * 60 * 60 * 1000))
  .collect();

console.log(`OTP requests in last 24 hours: ${otpStats.length}`);
```

## Troubleshooting

### Code not received

**Check:**
1. Email address is correct
2. Check spam folder
3. Verify Resend API key is valid
4. Check Resend dashboard for delivery status
5. Verify from email is verified in Resend

### Code invalid

**Check:**
1. Code hasn't expired (10 minutes)
2. Haven't exceeded 3 attempts
3. Using the most recent code
4. No typos in code entry

### Rate limit issues

**Solutions:**
1. Wait for rate limit to reset (shown in error message)
2. Check if another user is requesting codes for same email
3. Adjust rate limit if needed (in production only)

## Migration to Better Auth

When migrating to Better Auth (Cycles 16-35), the current implementation is compatible:

```typescript
// Future Better Auth setup
import { betterAuth } from "better-auth";
import { emailOtp } from "better-auth/plugins";

const auth = betterAuth({
  plugins: [
    emailOtp({
      sendEmail: async ({ email, code }) => {
        // Use existing Resend setup
        await sendOtpEmail(email, code);
      },
      expiresIn: 10 * 60, // 10 minutes
      maxAttempts: 3,
    })
  ]
});
```

## References

- Cycle 46 Implementation: `/one/events/cycle-46-email-otp-complete.md`
- Better Auth Roadmap: `/one/things/plans/better-auth-roadmap.md`
- Backend Code: `/backend/convex/emailOtp.ts`
- Frontend Components: `/web/src/components/auth/EmailOtp*.tsx`
- Resend Docs: https://resend.com/docs
- Better Auth Docs: https://www.better-auth.com/docs/plugins/email-otp

---

**Built for security, simplicity, and seamless user experience.**
