# Email Service - Resend Integration

Complete email notification system for form submissions.

## Setup

### 1. Install Resend (if needed)

The email service uses fetch API only, no package installation required!

### 2. Get Resend API Key

1. Sign up at https://resend.com
2. Create an API key in dashboard
3. Add to Convex environment:

```bash
cd backend/
npx convex env set RESEND_API_KEY re_xxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. Verify Domain (Production)

**For production emails:**
1. Add your domain in Resend dashboard
2. Add DNS records (SPF, DKIM, DMARC)
3. Verify domain ownership

**For testing:**
- Use `onboarding@resend.dev` sender (100 emails/day limit)
- Emails only sent to your verified email addresses

## Usage

### Send Form Notifications

```typescript
import { EmailService } from "./services/email/email";
import { Effect } from "effect";

const emailProgram = EmailService.sendFormNotifications({
  submissionData: {
    formId: "form_123",
    formName: "Contact Form",
    submittedAt: Date.now(),
    fields: {
      name: "John Doe",
      email: "john@example.com",
      message: "I need help!"
    },
    submitterEmail: "john@example.com",
    submitterName: "John Doe"
  },
  adminEmail: "admin@example.com",
  sendUserConfirmation: true,
  userTemplate: {
    subject: "Thanks {name}!",
    body: "We got your message."
  },
  apiKey: process.env.RESEND_API_KEY!
});

const results = await Effect.runPromise(emailProgram);

// Check results
if (results.admin) {
  console.log("Admin email sent:", results.admin.id);
}

if (results.user) {
  console.log("User confirmation sent:", results.user.id);
}

if (results.errors.length > 0) {
  console.error("Email errors:", results.errors);
}
```

### Merge Tags

Use these tags in email templates:

- `{name}` - Submitter name
- `{email}` - Submitter email
- `{form_name}` - Form name
- `{submitted_at}` - Submission timestamp
- `{field_name}` - Any form field value

**Example:**
```typescript
subject: "Hi {name}, thanks for submitting {form_name}!"
body: "We received your message on {submitted_at} and will reply to {email} soon."
```

### Error Handling

```typescript
import { Effect } from "effect";

// Option 1: Try/catch
try {
  const results = await Effect.runPromise(emailProgram);
  console.log("Success:", results);
} catch (error) {
  console.error("Failed:", error);
}

// Option 2: Either (recommended)
const result = await Effect.runPromise(
  Effect.either(emailProgram)
);

if (result._tag === "Right") {
  console.log("Success:", result.right);
} else {
  console.error("Failed:", result.left);
}
```

## Email Templates

### Admin Notification

Auto-generated HTML table with all form fields. Always professional format.

### User Confirmation

Default template or custom template with merge tags.

**Default:**
```
Hi {name},

Thank you for submitting {form_name}. We'll get back to you soon.

Summary:
- name: John Doe
- email: john@example.com
- message: I need help!
```

**Custom:**
```typescript
userTemplate: {
  subject: "Thanks {name}!",
  body: `Hi {name},

Got your message: "{message}"

We'll reply to {email} within 24h.

Best,
Team`,
  replyTo: "support@example.com"
}
```

## API Reference

### `EmailService.sendFormNotifications`

```typescript
EmailService.sendFormNotifications({
  submissionData: {
    formId: string,
    formName: string,
    submittedAt: number,
    fields: Record<string, any>,
    submitterEmail?: string,
    submitterName?: string
  },
  adminEmail?: string,
  sendUserConfirmation?: boolean,
  userTemplate?: {
    subject: string,
    body: string,
    replyTo?: string
  },
  apiKey: string
}): Effect<Results, Error>
```

**Returns:**
```typescript
{
  admin?: ResendResponse,      // Admin email result
  user?: ResendResponse,       // User confirmation result
  errors: Array<{              // Any errors
    type: "admin" | "user",
    error: Error
  }>
}
```

### `processMergeTags`

```typescript
processMergeTags(
  template: string,
  data: FormSubmissionData
): Effect<string, EmailTemplateError>
```

Replaces merge tags in template string.

### `generateAdminNotification`

```typescript
generateAdminNotification(
  data: FormSubmissionData
): Effect<string, never>
```

Generates admin notification HTML.

### `generateUserConfirmation`

```typescript
generateUserConfirmation(
  data: FormSubmissionData,
  customTemplate?: EmailTemplate
): Effect<string, EmailTemplateError>
```

Generates user confirmation HTML (default or custom).

### `sendEmailViaResend`

```typescript
sendEmailViaResend(
  params: SendEmailParams,
  apiKey: string
): Effect<ResendResponse, ResendAPIError>
```

Low-level Resend API wrapper.

## Error Types

### `EmailServiceError`
General email service errors.

### `EmailTemplateError`
Template parsing/validation errors.

### `ResendAPIError`
Resend API request errors (network, auth, etc.).

## Monitoring

All email operations are logged to `events` table:

**Success:**
```typescript
{
  type: "email_sent",
  metadata: {
    emailType: "admin_notification" | "user_confirmation",
    recipient: "admin@example.com",
    emailId: "re_abc123"
  }
}
```

**Failure:**
```typescript
{
  type: "email_failed",
  metadata: {
    emailType: "admin_notification" | "user_confirmation",
    error: "Error message"
  }
}
```

## Resend Dashboard

Monitor emails at https://resend.com/emails:

- Delivery status
- Open rates
- Click rates
- Bounce rates
- Spam reports

## Rate Limits

**Free Plan:**
- 100 emails/day
- 3,000 emails/month

**Pro Plan:**
- 50,000 emails/month
- Custom limits available

**Recommendation:**
Start with free plan for testing, upgrade before launch.

## Best Practices

1. **Always verify sender domain** in production
2. **Test with test emails** before going live
3. **Monitor events table** for email failures
4. **Use merge tags** for personalization
5. **Don't block form submission** on email errors
6. **Log all email operations** for debugging
7. **Provide unsubscribe link** if sending marketing emails

## Troubleshooting

### "RESEND_API_KEY not configured"
```bash
npx convex env set RESEND_API_KEY re_xxxxx
```

### "Domain not verified"
Add domain in Resend dashboard and verify DNS records.

### "Rate limit exceeded"
Upgrade plan or wait until limit resets.

### "Invalid API key"
Regenerate API key in Resend dashboard.

### Emails not delivered
1. Check Resend dashboard for delivery status
2. Check spam folder
3. Verify recipient email is correct
4. Check events table for `email_failed` events

## Support

- Resend Docs: https://resend.com/docs
- Resend Support: support@resend.com
- ONE Platform: See `/one/events/cycle-065-complete.md`

---

**Email Service - Ready for production! ✅**
