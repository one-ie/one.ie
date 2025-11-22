# Google One Tap Authentication

**Cycle 48 Implementation**

Google One Tap provides the fastest possible sign-in experience. Users who are already logged into Google can sign in with just one click - no password required!

## What is Google One Tap?

Google One Tap is a secure, one-click authentication method that:
- Shows automatically for users logged into Google
- Requires zero typing (no email, no password)
- Works across devices (if user is logged into Google)
- Is non-intrusive (appears in corner, easy to dismiss)
- Leverages Google's secure JWT authentication

## How It Works

### User Experience

1. User visits `/account/signin`
2. If user is logged into Google, One Tap prompt appears in top-right corner
3. Prompt shows user's Google profile picture and "Continue as [Name]"
4. User clicks button → Signed in instantly
5. Redirected to dashboard

**Total time: ~2 seconds** (vs 20-30 seconds for manual email/password)

### Technical Flow

```
┌─────────────────┐
│ Sign-In Page    │
│ Loads           │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ GoogleOneTap    │ Loads Google SDK asynchronously
│ Component       │ Checks if user logged into Google
└────────┬────────┘
         │
         ▼ (If logged in)
┌─────────────────┐
│ One Tap Prompt  │ Shows "Continue as [Name]"
│ Appears         │ User clicks
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Google Issues   │ Signed JWT credential (ID token)
│ JWT Credential  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Frontend Sends  │ POST /api/auth/google/onetap
│ to Backend      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Backend         │ 1. Decodes JWT
│ Validates       │ 2. Verifies signature
│                 │ 3. Checks audience & expiration
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Backend         │ 1. Check if user exists (by email)
│ Creates/Updates │ 2. Create user if new
│ User            │ 3. Update profile (name, picture)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Backend Creates │ 1. Generate session token
│ Session         │ 2. Set httpOnly cookie
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Frontend        │ Toast: "Welcome back!"
│ Redirects       │ Redirect to /account
└─────────────────┘
```

## Installation & Setup

### 1. Get Google Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project or select existing
3. Enable "Google Sign-In API"
4. Go to Credentials → Create OAuth 2.0 Client ID
5. Application type: Web application
6. Add authorized JavaScript origins:
   - `http://localhost:4321` (development)
   - `https://stack.one.ie` (production)
   - `https://your-domain.com` (your production domain)
7. Copy Client ID

### 2. Configure Environment Variables

**Development (`.env`):**
```bash
PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

**Production (Cloudflare Pages):**
```bash
# Add environment variable in Cloudflare dashboard:
# Settings → Environment Variables
PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

### 3. Component Usage

Google One Tap is already integrated in `SimpleSignInForm.tsx`. It automatically:
- Loads when sign-in page loads
- Shows prompt if user is logged into Google
- Handles authentication flow
- Redirects on success

**To use in other pages:**

```tsx
import { GoogleOneTap } from '@/components/auth/GoogleOneTap';

export function MyPage() {
  const googleClientId = import.meta.env.PUBLIC_GOOGLE_CLIENT_ID || '';

  return (
    <div>
      {googleClientId && (
        <GoogleOneTap
          clientId={googleClientId}
          onSuccess={(credential) => {
            console.log('User authenticated!');
          }}
          onError={(error) => {
            console.error('Authentication failed:', error);
          }}
          autoSelect={true}
          cancelOnTapOutside={false}
        />
      )}

      {/* Rest of your page */}
    </div>
  );
}
```

## Component API

### GoogleOneTap Props

```typescript
interface GoogleOneTapProps {
  // Required
  clientId: string;              // Google OAuth Client ID

  // Optional callbacks
  onSuccess?: (credential: string) => void;
  onError?: (error: Error) => void;

  // Optional configuration
  autoSelect?: boolean;          // Auto-select if only one Google account (default: true)
  cancelOnTapOutside?: boolean;  // Allow dismissing by clicking outside (default: false)
}
```

### Examples

**Basic Usage:**
```tsx
<GoogleOneTap clientId="your-client-id.apps.googleusercontent.com" />
```

**With Callbacks:**
```tsx
<GoogleOneTap
  clientId={clientId}
  onSuccess={(credential) => {
    console.log('Authenticated!', credential);
    // Custom success handling
  }}
  onError={(error) => {
    console.error('Failed:', error);
    // Custom error handling
  }}
/>
```

**Custom Configuration:**
```tsx
<GoogleOneTap
  clientId={clientId}
  autoSelect={false}         // Don't auto-select account
  cancelOnTapOutside={true}  // Allow dismissing by clicking outside
/>
```

## Backend API

### Endpoint: POST /api/auth/google/onetap

**Request:**
```json
{
  "credential": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (Success):**
```json
{
  "success": true,
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "User Name",
    "picture": "https://lh3.googleusercontent.com/..."
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Invalid credential format"
}
```

### Security

The backend validates:
- ✅ JWT signature (cryptographic verification)
- ✅ Token audience (matches your Client ID)
- ✅ Token expiration (not expired)
- ✅ Token issuer (from Google)

Session cookies are:
- ✅ httpOnly (not accessible via JavaScript)
- ✅ secure (HTTPS only in production)
- ✅ sameSite: lax (CSRF protection)
- ✅ 30-day expiration

## Features

### Auto-Select
If user has only one Google account, automatically select it. User just clicks "Continue" - no account selection needed.

```tsx
<GoogleOneTap clientId={clientId} autoSelect={true} />
```

### Dismiss Prompt
User can dismiss One Tap prompt by:
- Clicking X button in top-right of prompt
- Clicking outside prompt (if `cancelOnTapOutside={true}`)
- Pressing ESC key

### Non-Intrusive
One Tap appears in corner of screen, doesn't block content. User can:
- Ignore it and use email/password instead
- Dismiss it permanently for this session
- Use it for instant sign-in

## User Privacy

Google One Tap respects user privacy:

1. **Only shows if user is logged into Google**
   - If not logged in → No prompt appears
   - If logged out → No tracking or detection

2. **User must explicitly click**
   - No automatic sign-in without user action
   - Clear "Continue as [Name]" button

3. **Limited data access**
   - We only request: email, name, profile picture
   - No access to: contacts, calendar, drive, etc.

4. **User control**
   - Can dismiss at any time
   - Can revoke access in Google Account settings
   - Can sign out normally

## Testing

### Manual Testing Checklist

1. **Logged into Google (Chrome):**
   - [ ] Visit `/account/signin`
   - [ ] One Tap prompt appears in top-right
   - [ ] Shows correct Google account
   - [ ] Click "Continue as [Name]"
   - [ ] Redirects to `/account`
   - [ ] User is authenticated

2. **Not logged into Google (Incognito):**
   - [ ] Visit `/account/signin`
   - [ ] No One Tap prompt appears
   - [ ] No errors in console
   - [ ] Can still use email/password

3. **Multiple Google Accounts:**
   - [ ] One Tap shows account picker
   - [ ] Can select different account
   - [ ] Authentication works for all accounts

4. **Dismiss Prompt:**
   - [ ] Click X button → Prompt disappears
   - [ ] Prompt doesn't reappear on same session

5. **Mobile Testing:**
   - [ ] Works on iOS Safari
   - [ ] Works on Android Chrome
   - [ ] Touch-friendly UI

### Automated Testing

```typescript
// TODO: Add to test suite
describe('Google One Tap', () => {
  it('loads Google SDK', () => {
    // Test SDK loads successfully
  });

  it('shows prompt for logged-in users', () => {
    // Test prompt appears
  });

  it('handles authentication', () => {
    // Test JWT validation
  });

  it('creates session', () => {
    // Test session creation
  });
});
```

## Troubleshooting

### One Tap Doesn't Appear

**Possible causes:**
1. User not logged into Google → Expected behavior
2. GOOGLE_CLIENT_ID not set → Check environment variables
3. Domain not in authorized origins → Add to Google Cloud Console
4. User previously dismissed → Clear cookies and try again
5. Browser blocks third-party cookies → Use first-party cookies

**Debug:**
```javascript
// Check if SDK loaded
console.log(window.google?.accounts?.id);

// Check environment variable
console.log(import.meta.env.PUBLIC_GOOGLE_CLIENT_ID);
```

### Authentication Fails

**Possible causes:**
1. Token expired → Google issues short-lived tokens
2. Invalid audience → Check Client ID matches
3. CORS error → Verify domain in authorized origins
4. Backend error → Check server logs

**Debug:**
```bash
# Check backend logs
tail -f /var/log/app.log

# Test backend endpoint
curl -X POST http://localhost:4321/api/auth/google/onetap \
  -H "Content-Type: application/json" \
  -d '{"credential":"test-token"}'
```

### Prompt Appears But Nothing Happens

**Possible causes:**
1. Network error → Check browser console
2. Backend not responding → Check server status
3. Invalid JWT → Check token format

**Debug:**
```javascript
// Enable verbose logging in GoogleOneTap component
console.log('One Tap initialized');
console.log('Credential received:', credential);
```

## Performance

### Load Time
- Google SDK: ~100KB compressed
- Async loading: Non-blocking
- First render: <100ms
- Prompt appears: 200-500ms after page load

### Conversion Rates
Expected improvements:
- 20-50% increase in sign-in rate
- 80%+ reduction in time to sign-in
- 30%+ increase in mobile sign-ins

### Analytics

Track these metrics:
```typescript
// One Tap shown
analytics.track('one_tap_shown', {
  timestamp: Date.now()
});

// One Tap clicked
analytics.track('one_tap_clicked', {
  timestamp: Date.now()
});

// One Tap success
analytics.track('one_tap_success', {
  timestamp: Date.now(),
  userId: user.id
});

// One Tap dismissed
analytics.track('one_tap_dismissed', {
  timestamp: Date.now()
});
```

## Browser Support

✅ **Supported:**
- Chrome 89+ (desktop & mobile)
- Safari 14+ (desktop & mobile)
- Firefox 87+ (desktop & mobile)
- Edge 89+ (desktop)
- Samsung Internet 14+

⚠️ **Limited Support:**
- Safari < 14 (no One Tap UI)
- Firefox < 87 (fallback to regular OAuth)
- IE 11 (not supported, use email/password)

## Security Best Practices

1. **HTTPS Only in Production**
   - One Tap requires HTTPS in production
   - Local development uses HTTP (allowed)

2. **Validate JWT Server-Side**
   - Never trust client-side validation
   - Always verify signature, audience, expiration

3. **Use httpOnly Cookies**
   - Session tokens in httpOnly cookies
   - Not accessible via JavaScript
   - Protects against XSS

4. **Rotate Secrets**
   - Rotate GOOGLE_CLIENT_SECRET regularly
   - Monitor for unauthorized access
   - Revoke compromised credentials

5. **Rate Limiting**
   - Inherits from existing auth rate limiting
   - Prevents brute force attacks

## Future Enhancements

### Cycle 23: Better Auth Migration
- Migrate to Better Auth Google OAuth plugin
- Unified session management
- Better account linking

### Cycle 97: Last Login Tracking
- Track when user last used One Tap
- Display "Last signed in with Google on [date]"
- Analytics on authentication method preferences

### Cycle 82: Multi-Session Management
- Show all active sessions
- Revoke specific sessions
- See device and location

## Resources

- [Google One Tap Documentation](https://developers.google.com/identity/gsi/web/guides/overview)
- [Google Sign-In Best Practices](https://developers.google.com/identity/gsi/web/guides/best-practices)
- [Better Auth Roadmap](../../../one/things/plans/better-auth-roadmap.md)
- [Cycle 48 Specification](../../../one/things/plans/better-auth-roadmap.md#cycle-48)

## Support

**Issues or questions?**
- Check [Troubleshooting](#troubleshooting) section
- Review [Google One Tap Documentation](https://developers.google.com/identity/gsi/web/guides/overview)
- Open an issue on GitHub

---

**Built for speed, security, and user experience. ⚡**
