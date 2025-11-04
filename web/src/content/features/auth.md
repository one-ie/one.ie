---
title: "Authentication System"
description: "Enterprise-grade multi-method authentication with email, OAuth, magic links, 2FA, password reset, and session management."
featureId: "auth"
category: "authentication"
status: "completed"
version: "2.5.0"
releaseDate: 2025-10-30T00:00:00Z
organization: "ONE Platform"
ontologyDimensions: ["Groups", "People", "Events", "Connections"]
assignedSpecialist: "agent-backend"
specification:
  complexity: "complex"
  estimatedHours: 120
  dependencies: ["email-service", "user-management"]
  technologies: ["Better Auth", "Convex", "React", "Astro", "Zod"]
  apiEndpoints:
    - method: "POST"
      path: "/api/auth/signup"
      description: "Create new user account"
    - method: "POST"
      path: "/api/auth/signin"
      description: "Sign in with email/password or OAuth"
    - method: "POST"
      path: "/api/auth/magic-link"
      description: "Request passwordless magic link"
    - method: "POST"
      path: "/api/auth/2fa/setup"
      description: "Enable two-factor authentication"
    - method: "POST"
      path: "/api/auth/logout"
      description: "Sign out user and invalidate session"
ontologyMapping:
  groups: "Auth scoped to organization groups for multi-tenant isolation"
  people: "Creates person entities with roles (org_owner, org_user, customer, platform_owner)"
  events: "Logs signup, signin, password_reset, 2fa_enabled, logout events"
  connections: "Manages user-device sessions and OAuth provider connections"
useCases:
  - title: "First-Time User Registration"
    description: "New user creates account via email/password or OAuth, gets verified"
    userType: "New Customer"
    scenario: "1. Click sign up → 2. Choose method → 3. Verify email → 4. Set password → 5. Authenticated"
  - title: "Social Login"
    description: "User signs in instantly with Google, GitHub, or other OAuth providers"
    userType: "All Users"
    scenario: "1. Click 'Sign in with Google' → 2. Approve ONE access → 3. Authenticated"
  - title: "Passwordless Magic Link"
    description: "User receives one-click email link, no password needed"
    userType: "All Users"
    scenario: "1. Enter email → 2. Receive link → 3. Click link → 4. Authenticated"
  - title: "Two-Factor Authentication"
    description: "High-security login with phone verification"
    userType: "Security-Conscious Users"
    scenario: "1. Enter password → 2. Get SMS code → 3. Enter code → 4. Authenticated"
  - title: "Password Reset"
    description: "User recovers account via email"
    userType: "Forgot Password Users"
    scenario: "1. Click forgot password → 2. Verify email → 3. Get reset link → 4. Create new password"
features:
  - name: "Email/Password Authentication"
    description: "Traditional username/password sign up and login"
    status: "completed"
  - name: "OAuth Social Login"
    description: "Google, GitHub, Discord, Microsoft OAuth integration"
    status: "completed"
  - name: "Magic Link Passwordless"
    description: "One-click email authentication"
    status: "completed"
  - name: "Two-Factor Authentication"
    description: "SMS and authenticator app 2FA"
    status: "completed"
  - name: "Email Verification"
    description: "Verify email ownership before account activation"
    status: "completed"
  - name: "Password Reset Flow"
    description: "Secure password recovery via email"
    status: "completed"
  - name: "Session Management"
    description: "JWT-based persistent sessions across devices"
    status: "completed"
  - name: "Device Management"
    description: "View and manage authenticated devices"
    status: "in_development"
  - name: "Remember Device"
    description: "Skip 2FA on trusted devices"
    status: "planned"
marketingPosition:
  tagline: "Zero friction. Bank-level security."
  valueProposition: "Six authentication methods so users never get stuck. Enterprise security for everyone."
  targetAudience: ["SaaS platforms", "E-commerce stores", "Creator platforms", "Social networks"]
  competitiveAdvantage: "Better Auth + Convex backend = fastest, most secure auth system"
  pricingImpact: "free"
integrationLevel: "basic"
prerequisites:
  - "Better Auth configured"
  - "Email service (Resend)"
  - "OAuth provider credentials (optional)"
  - "2FA SMS provider (optional)"
relatedFeatures: ["user-management", "email-service", "sessions", "permissions"]
metrics:
  testCoverage: 96
  performanceScore: 99
  accessibilityScore: 100
  securityAudit: true
documentation:
  userGuide: "/docs/authentication"
  apiReference: "/docs/api/auth"
  videoTutorial: "https://youtube.com/watch?v=..."
tags: ["authentication", "security", "oauth", "passwordless", "2fa"]
featured: true
priority: "critical"
createdAt: 2025-09-01T00:00:00Z
updatedAt: 2025-10-30T00:00:00Z
draft: false
---

## Overview

The ONE Platform Authentication System provides enterprise-grade user authentication with six different methods. Users can sign up and sign in using email/password, OAuth social login, passwordless magic links, or two-factor authentication.

## Supported Methods

### 1. Email/Password
Traditional sign up with email and password. Password hashed with bcrypt, strength requirements enforced.

### 2. OAuth Social Login
- Google
- GitHub
- Discord
- Microsoft
- Custom OAuth providers

### 3. Magic Link Passwordless
One-click email authentication. No password required, ultra-secure.

### 4. Two-Factor Authentication
- SMS verification codes
- Authenticator apps (TOTP)
- Backup codes

### 5. Email Verification
Verify email ownership during sign up. Can be required or optional per organization.

### 6. Password Reset
Secure account recovery via email with time-limited reset links.

## Security Features

- **Password Hashing**: bcrypt with cost factor 12
- **Session Tokens**: JWT with 30-day expiration
- **Rate Limiting**: Brute force protection
- **HTTPS Only**: All auth endpoints TLS-encrypted
- **CSRF Protection**: Token-based CSRF prevention
- **Audit Trail**: Complete event logging

## Multi-Tenant Architecture

Each organization has isolated authentication:
- Separate user directories
- Per-organization password policies
- Custom OAuth providers
- Isolated session tokens

All scoped via `groupId` in the database.

## Next Steps

See individual feature pages for specific authentication methods.
