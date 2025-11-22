---
title: Better Auth Architecture - Building a Beautiful, Modular, Error-Free System
dimension: knowledge
category: architecture
tags: auth, better-auth, architecture, best-practices, modularity
related_dimensions: things, connections, events
scope: global
created: 2025-11-22
updated: 2025-11-22
version: 1.0.0
ai_context: |
  This document is part of the knowledge dimension in the architecture category.
  Location: one/knowledge/better-auth-architecture.md
  Purpose: Architectural principles for building a beautiful, modular, error-free auth system
  Related dimensions: things, connections, events
  For AI agents: Read this to understand Better Auth architectural best practices.
---

# Better Auth Architecture: Building a Beautiful, Modular, Error-Free System

**Philosophy:** Authentication should be invisible, secure, and delightful.

---

## 🏗️ Architectural Principles

### 1. **Separation of Concerns**

Better Auth enforces clean separation:

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                   │
│  (React Components - Beautiful, Accessible UI)          │
├─────────────────────────────────────────────────────────┤
│                    BUSINESS LOGIC LAYER                 │
│  (Better Auth Hooks - Validation, Events, Logging)      │
├─────────────────────────────────────────────────────────┤
│                    DATA ACCESS LAYER                    │
│  (Convex Database - User, Account, Session tables)      │
├─────────────────────────────────────────────────────────┤
│                    INTEGRATION LAYER                    │
│  (OAuth Providers, Email, SMS, Web3)                    │
└─────────────────────────────────────────────────────────┘
```

**Never mix layers.** Each layer only talks to the layer directly below it.

---

### 2. **Modular Design**

Every feature is a **plugin** that can be enabled/disabled independently:

```typescript
// convex/auth.ts
import { betterAuth } from "better-auth";
import { passkey, organization, twoFactor } from "better-auth/plugins";

export const auth = betterAuth({
	// Core always enabled
	emailAndPassword: { enabled: true },

	// Modular plugins - enable only what you need
	plugins: [
		passkey(), // Biometric auth
		organization(), // Multi-tenant
		twoFactor(), // TOTP/SMS
	],
});
```

**Benefits:**
- ✅ Start simple, add complexity as needed
- ✅ No unused code bloating the bundle
- ✅ Easy to test in isolation
- ✅ Clear dependency graph

---

### 3. **Component-Based UI**

Every auth flow is a **self-contained component**:

```
web/src/components/auth/
├── GoogleContinueCard.tsx      # "Continue as [Name]" card
├── SignInPage.tsx              # Full sign-in page
├── SignUpPage.tsx              # Full sign-up page
├── SocialLoginButtons.tsx      # OAuth provider buttons
├── TwoFactorSettings.tsx       # 2FA management
├── PasskeySettings.tsx         # Passkey management
├── SessionList.tsx             # Active sessions
└── OrganizationSwitcher.tsx    # Multi-tenant org selector
```

**Component Principles:**
1. **Single Responsibility**: One component = one auth flow
2. **Composition Over Inheritance**: Compose complex UIs from simple components
3. **Props for Configuration**: No hardcoded values, everything configurable
4. **Error Boundaries**: Each component handles its own errors gracefully

---

### 4. **Type Safety Throughout**

TypeScript eliminates entire classes of bugs:

```typescript
// Server: Define extended user type
export const auth = betterAuth({
	user: {
		additionalFields: {
			role: {
				type: "string",
				required: true,
			},
			organizationId: {
				type: "string",
				required: false,
			},
		},
	},
});

// Client: Automatically infer types
type User = typeof authClient.$Infer.User;
// User now includes role and organizationId - fully typed!

const user: User = await authClient.getUser();
user.role; // ✅ TypeScript knows this exists
user.invalidField; // ❌ Compile error
```

**Type Safety Guarantees:**
- No runtime type errors
- Autocomplete in IDE
- Refactoring confidence
- API contract enforcement

---

### 5. **Error-Free Through Validation**

**Validate at boundaries, trust internally:**

```typescript
// 1. Validate at the boundary (API endpoint)
betterAuth({
	databaseHooks: {
		user: {
			create: {
				before: async (user) => {
					// Validation happens HERE
					if (!isValidEmail(user.email)) {
						throw new Error("Invalid email format");
					}

					if (user.password && user.password.length < 8) {
						throw new Error("Password must be at least 8 characters");
					}

					// Check for pwned password
					if (await isPwnedPassword(user.password)) {
						throw new Error(
							"This password has been compromised in a data breach",
						);
					}

					return true; // Validation passed
				},
			},
		},
	},
});

// 2. Internal code trusts validated data
async function createUserAccount(user: ValidatedUser) {
	// No need to re-validate - we know it's valid
	await db.insert("users", user);
}
```

**Validation Layers:**
1. **Client-side**: Immediate feedback (UX)
2. **API boundary**: Security (never trust client)
3. **Database constraints**: Final safety net

---

### 6. **Hooks for Extension**

**Better Auth hooks = Extension points without modification:**

```typescript
betterAuth({
	databaseHooks: {
		user: {
			create: {
				after: async (user) => {
					// ✅ Log to events dimension
					await logEvent({
						type: "user_created",
						userId: user.id,
						metadata: { email: user.email },
					});

					// ✅ Send welcome email
					await sendEmail({
						to: user.email,
						template: "welcome",
						data: { name: user.name },
					});

					// ✅ Add to default organization
					await addToOrganization(user.id, "default-org");
				},
			},
		},

		session: {
			create: {
				after: async (session) => {
					// ✅ Log login event
					await logEvent({
						type: "user_logged_in",
						userId: session.userId,
						metadata: {
							ipAddress: session.ipAddress,
							userAgent: session.userAgent,
						},
					});

					// ✅ Update last login timestamp
					await updateLastLogin(session.userId);
				},
			},
		},
	},
});
```

**Hooks Enable:**
- Event logging (audit trails)
- Email notifications
- Multi-tenant scoping
- Analytics tracking
- Custom business logic

**Without changing Better Auth core code!**

---

## 🎨 Beautiful UI Principles

### 1. **Progressive Disclosure**

Don't overwhelm users with all options at once:

```tsx
// ❌ BAD: Everything visible
<SignInForm>
	<EmailInput />
	<PasswordInput />
	<UsernameInput />
	<PhoneInput />
	<GoogleButton />
	<GitHubButton />
	<AppleButton />
	<PasskeyButton />
	<MagicLinkButton />
</SignInForm>

// ✅ GOOD: Progressive disclosure
<SignInForm>
	{/* Primary: Most common */}
	<EmailInput />
	<PasswordInput />
	<SignInButton />

	{/* Secondary: One-click options */}
	<Divider text="Or continue with" />
	<SocialButtons providers={["google", "github"]} />

	{/* Tertiary: Hidden until needed */}
	<CollapsibleSection trigger="More sign-in options">
		<PasskeyButton />
		<MagicLinkButton />
		<PhoneButton />
	</CollapsibleSection>
</SignInForm>
```

### 2. **Instant Feedback**

Show users what's happening immediately:

```tsx
// ✅ Loading states
{
	isLoading && <Spinner />;
}

// ✅ Success animations
{
	isSuccess && <CheckmarkAnimation />;
}

// ✅ Error messages
{
	error && <ErrorMessage>{error.message}</ErrorMessage>;
}

// ✅ Password strength
<PasswordInput onChange={(pw) => setStrength(calculateStrength(pw))} />
<PasswordStrengthMeter strength={strength} />
```

### 3. **Accessibility First**

Every component must be keyboard-navigable and screen-reader friendly:

```tsx
<Button
	onClick={handleSignIn}
	disabled={isLoading}
	aria-label="Sign in with Google"
	aria-busy={isLoading}
>
	{isLoading ? (
		<span className="sr-only">Signing in...</span>
	) : (
		"Sign in with Google"
	)}
</Button>
```

---

## 🔒 Security Architecture

### Defense in Depth

**Multiple layers of security:**

```
┌───────────────────────────────────────────────────────┐
│  Layer 1: Rate Limiting (Brute Force Protection)     │
├───────────────────────────────────────────────────────┤
│  Layer 2: CSRF Tokens (Cross-Site Request Forgery)   │
├───────────────────────────────────────────────────────┤
│  Layer 3: Input Validation (SQL Injection, XSS)      │
├───────────────────────────────────────────────────────┤
│  Layer 4: Argon2 Password Hashing (Credential Theft) │
├───────────────────────────────────────────────────────┤
│  Layer 5: httpOnly Cookies (XSS Session Theft)       │
├───────────────────────────────────────────────────────┤
│  Layer 6: Session Rotation (Session Fixation)        │
└───────────────────────────────────────────────────────┘
```

**If one layer fails, others protect the system.**

### Principle of Least Privilege

Users only get what they need:

```typescript
// ❌ BAD: Everyone is admin
const user = await getUser();
// user.role = 'admin' by default

// ✅ GOOD: Minimal permissions by default
const user = await getUser();
// user.role = 'customer' by default

// Explicit escalation required
if (user.organizationId) {
	const org = await getOrganization(user.organizationId);
	if (org.ownerId === user.id) {
		user.role = "org_owner"; // Only if they own the org
	}
}
```

---

## 🧪 Testing Strategy

### Test Pyramid

```
           ┌─────────┐
          ╱           ╲
         ╱  E2E Tests  ╲      10% - Full user flows
        ╱   (Slow)      ╲
       ├─────────────────┤
      ╱                   ╲
     ╱  Integration Tests  ╲   20% - API + Database
    ╱      (Medium)         ╲
   ├─────────────────────────┤
  ╱                           ╲
 ╱      Unit Tests             ╲  70% - Pure functions
╱          (Fast)               ╲
└─────────────────────────────────┘
```

**Unit Tests** (Fast, many):

```typescript
describe("Password validation", () => {
	it("should reject passwords shorter than 8 characters", () => {
		expect(isValidPassword("short")).toBe(false);
	});

	it("should require uppercase letter", () => {
		expect(isValidPassword("lowercase123")).toBe(false);
	});

	it("should accept strong passwords", () => {
		expect(isValidPassword("StrongPass123!")).toBe(true);
	});
});
```

**Integration Tests** (Medium speed, fewer):

```typescript
describe("Sign up flow", () => {
	it("should create user and send welcome email", async () => {
		const user = await authClient.signUp.email({
			email: "test@example.com",
			password: "SecurePass123!",
		});

		expect(user).toBeDefined();
		expect(emailsSent).toContain("test@example.com");
	});
});
```

**E2E Tests** (Slow, critical paths only):

```typescript
test("User can sign up, verify email, and access dashboard", async ({
	page,
}) => {
	await page.goto("/signup");
	await page.fill('input[name="email"]', "test@example.com");
	await page.fill('input[name="password"]', "SecurePass123!");
	await page.click('button[type="submit"]');

	// Check email was sent
	const email = await getLastEmail();
	const verificationLink = extractLink(email.body);

	// Verify email
	await page.goto(verificationLink);

	// Should redirect to dashboard
	expect(page.url()).toContain("/dashboard");
});
```

---

## 📊 Monitoring & Observability

### What to Monitor

**1. Authentication Metrics:**

```typescript
// Track in hooks
betterAuth({
	databaseHooks: {
		session: {
			create: {
				after: async (session, context) => {
					// ✅ Log successful login
					await trackMetric("auth.login.success", 1, {
						provider: context.provider, // "google", "email", "github"
						deviceType: parseUserAgent(session.userAgent).device,
						location: getLocationFromIP(session.ipAddress),
					});
				},
			},
		},

		user: {
			create: {
				after: async (user, context) => {
					// ✅ Track signups by source
					await trackMetric("auth.signup.total", 1, {
						source: context.source, // "organic", "referral"
						provider: context.provider,
					});
				},
			},
		},
	},
});
```

**2. Error Tracking:**

```typescript
try {
	await authClient.signIn.email({ email, password });
} catch (error) {
	// ✅ Track auth errors
	await trackError("auth.login.error", error, {
		email: email, // Hash it!
		errorType: error.code,
	});

	// Show user-friendly message
	setError("Invalid email or password");
}
```

**3. Performance Metrics:**

```typescript
const start = performance.now();
const session = await authClient.getSession();
const duration = performance.now() - start;

// ✅ Track session lookup time
trackMetric("auth.session.lookup.duration", duration);

// Alert if > 100ms
if (duration > 100) {
	alertSlowQuery("Session lookup slow", { duration });
}
```

---

## 🎯 6-Dimension Ontology Integration

### Mapping Better Auth to Ontology

```typescript
// GROUPS: Organizations
await createOrganization({
	name: "Acme Corp",
	groupId: generateId(), // Maps to groups.id
});

// PEOPLE: Users with roles
await createUser({
	email: "user@example.com",
	role: "org_owner", // Maps to people dimension roles
});

// THINGS: Sessions, Passkeys
await createSession({
	userId: user.id,
	type: "session", // Maps to things.type
});

// CONNECTIONS: Account linking
await linkAccount({
	userId: user.id,
	provider: "google",
	type: "linked_account", // Maps to connections.type
});

// EVENTS: All auth actions
await logEvent({
	type: "user_logged_in",
	userId: user.id,
	metadata: { provider: "google" },
	timestamp: Date.now(),
});

// KNOWLEDGE: User preferences, security settings
await storeKnowledge({
	userId: user.id,
	category: "security_preferences",
	data: { twoFactorEnabled: true },
});
```

**Every auth action creates events** → Complete audit trail.

---

## 🚀 Deployment Checklist

### Pre-Production

- [ ] All passwords hashed with Argon2id
- [ ] Rate limiting enabled on all auth endpoints
- [ ] CSRF protection active
- [ ] SSL/TLS certificates valid (HTTPS)
- [ ] Environment variables set in production
- [ ] OAuth callback URLs point to production domain
- [ ] Database backups configured
- [ ] Monitoring dashboards created
- [ ] Error alerts configured (Slack, email)

### Production

- [ ] Smoke tests passed
- [ ] All auth flows tested in production
- [ ] Performance benchmarks met (<100ms session lookup)
- [ ] Security audit completed
- [ ] Incident response plan documented
- [ ] Team trained on auth system

---

## 📚 Best Practices Summary

### DO ✅

1. **Use Better Auth hooks** for all custom logic
2. **Validate at API boundaries**, trust internally
3. **Log all auth events** to events dimension
4. **Separate users from accounts** (account linking)
5. **Enable only plugins you need** (modular)
6. **Type everything** with TypeScript
7. **Test the happy path and edge cases**
8. **Monitor auth metrics** continuously

### DON'T ❌

1. **Don't roll your own crypto** (use Argon2)
2. **Don't store plaintext passwords** (ever)
3. **Don't skip rate limiting** (brute force attacks)
4. **Don't trust client-side validation** (always validate server-side)
5. **Don't hardcode secrets** (use environment variables)
6. **Don't ignore security updates** (update Better Auth regularly)
7. **Don't skip HTTPS** in production (cookies won't work)
8. **Don't mix authentication and business logic** (separation of concerns)

---

## 🎓 Learning Path

**Week 1: Foundations**

- Understand users vs accounts
- Set up Better Auth with Convex
- Implement email/password auth
- Add OAuth providers (GitHub, Google)

**Week 2: Security**

- Add rate limiting
- Enable CSRF protection
- Implement Argon2 password hashing
- Add hooks for event logging

**Week 3: Advanced Features**

- Add passkeys (WebAuthn)
- Implement organizations
- Add multi-session management
- Enable subscription integration

**Week 4: Production**

- Security audit
- Performance optimization
- Monitoring setup
- Deploy to production

---

## 🔗 References

- [Better Auth Documentation](https://www.better-auth.com/docs/introduction)
- [Session Management](https://www.better-auth.com/docs/concepts/session-management)
- [TypeScript](https://www.better-auth.com/docs/concepts/typescript)
- [Hooks](https://www.better-auth.com/docs/concepts/hooks)
- [User & Accounts](https://www.better-auth.com/docs/concepts/users-accounts)
- [6-Dimension Ontology](/one/knowledge/ontology.md)
- [Better Auth Roadmap](/one/things/plans/better-auth-roadmap.md)

---

**Built with security, simplicity, and infinite scale in mind.**
