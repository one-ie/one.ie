---
title: Production Deployment Checklist (Cycle 100)
dimension: events
category: deployment
tags: production, deployment, monitoring, ops
related_dimensions: knowledge, things
scope: global
created: 2025-11-22
version: 1.0.0
session_id: 01QMzqbMmdUc4fQx4zL1AEDT
ai_context: |
  This is the production deployment checklist for Better Auth implementation.
  Must be completed and verified before deploying to production.
  Location: one/events/production-deployment-checklist.md
  Purpose: Ensure safe, monitored production deployment
---

# Production Deployment Checklist (Cycle 100)

**Deployment Date:** [YYYY-MM-DD]
**Deployed By:** [Name]
**Version:** v1.0.0-better-auth
**Branch:** main
**Commit:** [SHA]

---

## Pre-Deployment Checklist

### 1. Environment Variables

**All environment variables must be set in production:**

#### Core Better Auth
- [ ] `BETTER_AUTH_SECRET` - 256-bit random secret (CRITICAL)
  - **Verify:** `echo $BETTER_AUTH_SECRET | wc -c` → Should be 64+ characters
  - **Status:** ⬜ Not Set / ✅ Set / ❌ Invalid

- [ ] `BETTER_AUTH_URL` - Production API URL
  - **Value:** `https://api.one.ie`
  - **Status:** ⬜ Not Set / ✅ Set / ❌ Invalid

- [ ] `BETTER_AUTH_BASE_PATH` - Auth endpoint path (optional)
  - **Value:** `/api/auth` (default)
  - **Status:** ⬜ Not Set / ✅ Set / ⚠️ Default

#### Database (Convex)
- [ ] `CONVEX_DEPLOYMENT` - Production deployment name
  - **Value:** `shocking-falcon-870` (production)
  - **Verify:** NOT using dev deployment
  - **Status:** ⬜ Not Set / ✅ Set / ❌ Invalid

- [ ] `CONVEX_DEPLOY_KEY` - Deployment key for CI/CD
  - **Status:** ⬜ Not Set / ✅ Set / ❌ Invalid

#### Email (Resend)
- [ ] `RESEND_API_KEY` - Production API key
  - **Verify:** Sending domain verified (one.ie)
  - **Status:** ⬜ Not Set / ✅ Set / ❌ Invalid

- [ ] `FROM_EMAIL` - Sender email address
  - **Value:** `noreply@one.ie`
  - **Status:** ⬜ Not Set / ✅ Set / ❌ Invalid

#### OAuth Providers
- [ ] `GITHUB_CLIENT_ID` - GitHub OAuth client ID
  - **Status:** ⬜ Not Set / ✅ Set / ❌ Invalid

- [ ] `GITHUB_CLIENT_SECRET` - GitHub OAuth secret
  - **Verify:** Callback URL set to `https://api.one.ie/auth/callback/github`
  - **Status:** ⬜ Not Set / ✅ Set / ❌ Invalid

- [ ] `GOOGLE_CLIENT_ID` - Google OAuth client ID
  - **Status:** ⬜ Not Set / ✅ Set / ❌ Invalid

- [ ] `GOOGLE_CLIENT_SECRET` - Google OAuth secret
  - **Verify:** Authorized redirect URI: `https://api.one.ie/auth/callback/google`
  - **Status:** ⬜ Not Set / ✅ Set / ❌ Invalid

#### Captcha (reCAPTCHA v3)
- [ ] `RECAPTCHA_SITE_KEY` - Public site key
  - **Status:** ⬜ Not Set / ✅ Set / ❌ Invalid

- [ ] `RECAPTCHA_SECRET_KEY` - Private secret key
  - **Verify:** Domain: one.ie, web.one.ie
  - **Status:** ⬜ Not Set / ✅ Set / ❌ Invalid

#### Monitoring & Error Tracking
- [ ] `SENTRY_DSN` - Sentry error tracking
  - **Status:** ⬜ Not Set / ✅ Set / ⚠️ Optional

- [ ] `AXIOM_API_TOKEN` - Log aggregation
  - **Status:** ⬜ Not Set / ✅ Set / ⚠️ Optional

- [ ] `SLACK_WEBHOOK_URL` - Alert notifications
  - **Channel:** #auth-alerts
  - **Status:** ⬜ Not Set / ✅ Set / ⚠️ Optional

#### Security
- [ ] `NODE_ENV` - Environment flag
  - **Value:** `production`
  - **Status:** ⬜ Not Set / ✅ Set / ❌ Invalid

- [ ] `FORCE_HTTPS` - Enforce HTTPS
  - **Value:** `true`
  - **Status:** ⬜ Not Set / ✅ Set / ⚠️ Default

**Environment Variables Summary:**
- Total Required: 15
- Set: [X]
- Not Set: [X]
- Invalid: [X]

**Action:** ⬜ Proceed / ❌ Block Deployment (missing required variables)

---

### 2. Secret Rotation

**Verify all secrets are rotated from development values:**

- [ ] `BETTER_AUTH_SECRET` is NEW (not from development)
  - **Verify:** Different from `.env.local`
  - **Status:** ⬜ Not Verified / ✅ Rotated / ❌ Same as Dev

- [ ] OAuth client secrets are NEW
  - **Verify:** GitHub and Google secrets are production-specific
  - **Status:** ⬜ Not Verified / ✅ Rotated / ❌ Same as Dev

- [ ] Database deployment is PRODUCTION
  - **Verify:** `CONVEX_DEPLOYMENT` !== dev deployment
  - **Status:** ⬜ Not Verified / ✅ Correct / ❌ Using Dev

- [ ] API keys are PRODUCTION
  - **Verify:** Resend, Sentry, Axiom keys are production
  - **Status:** ⬜ Not Verified / ✅ Rotated / ❌ Same as Dev

**Secret Storage:**
- [ ] Secrets stored in secure vault (1Password, AWS Secrets Manager)
- [ ] Secrets accessible only to authorized personnel (DevOps, platform_owner)
- [ ] Backup of secrets stored securely (encrypted, offline)
- [ ] Secrets NOT committed to git (verified with `git log -p | grep SECRET`)

**Action:** ⬜ Proceed / ❌ Block Deployment (insecure secrets)

---

### 3. Code Quality Gates

- [ ] All tests passing (unit, integration, E2E)
  - **Command:** `bun test`
  - **Expected:** 0 failures
  - **Status:** ⬜ Not Run / ✅ Pass / ❌ Fail

- [ ] TypeScript compilation successful
  - **Command:** `bunx astro check`
  - **Expected:** 0 errors
  - **Status:** ⬜ Not Run / ✅ Pass / ❌ Fail

- [ ] Linting passed
  - **Command:** `bun run lint`
  - **Expected:** 0 errors
  - **Status:** ⬜ Not Run / ✅ Pass / ❌ Fail

- [ ] Security audit passed (Cycle 99)
  - **Reference:** `/one/events/security-audit-checklist.md`
  - **Expected:** 0 critical/high vulnerabilities
  - **Status:** ⬜ Not Run / ✅ Pass / ❌ Fail

- [ ] Code review approved
  - **Reviewer:** [Name]
  - **PR:** [Link]
  - **Status:** ⬜ Pending / ✅ Approved / ❌ Rejected

**Action:** ⬜ Proceed / ❌ Block Deployment (quality gates not met)

---

### 4. Database Migrations

- [ ] Database schema up to date
  - **Verify:** `convex deploy` completes successfully
  - **Status:** ⬜ Not Run / ✅ Success / ❌ Fail

- [ ] Migration tested on staging
  - **Verify:** Staging deployment successful with production data
  - **Status:** ⬜ Not Tested / ✅ Tested / ⚠️ No Staging

- [ ] Rollback plan documented
  - **Plan:** Previous schema version available
  - **Status:** ⬜ Not Documented / ✅ Documented / ❌ No Plan

- [ ] Data migration completed (if applicable)
  - **Verify:** Argon2 migration complete (all passwords rehashed)
  - **Status:** ⬜ N/A / ✅ Complete / ❌ Incomplete

**Action:** ⬜ Proceed / ❌ Block Deployment (migration issues)

---

### 5. Documentation

- [ ] README.md updated
  - **Verify:** Better Auth features documented
  - **Status:** ⬜ Not Updated / ✅ Updated

- [ ] API documentation complete (Cycle 98)
  - **Verify:** Swagger UI at `/api/docs` works
  - **Status:** ⬜ Not Complete / ✅ Complete

- [ ] Admin guide complete
  - **File:** `/docs/admin-guide.md`
  - **Status:** ⬜ Not Complete / ✅ Complete

- [ ] Developer guide complete
  - **File:** `/docs/developer-guide.md`
  - **Status:** ⬜ Not Complete / ✅ Complete

- [ ] Runbooks documented
  - **Files:** `/docs/runbooks/*.md`
  - **Status:** ⬜ Not Complete / ✅ Complete

- [ ] Security policy updated
  - **File:** `SECURITY.md`
  - **Status:** ⬜ Not Updated / ✅ Updated

**Action:** ⬜ Proceed / ⚠️ Proceed with Warning (documentation incomplete)

---

## Deployment Process

### Step 1: Build

- [ ] **Build frontend:**
  ```bash
  cd web/
  bun run build
  ```
  - **Expected:** Build succeeds, no errors
  - **Output:** `dist/` directory created
  - **Status:** ⬜ Not Run / ✅ Success / ❌ Fail

- [ ] **Verify build size:**
  ```bash
  du -sh web/dist/
  ```
  - **Expected:** < 10MB
  - **Actual:** [X.X MB]
  - **Status:** ⬜ Not Checked / ✅ Acceptable / ⚠️ Large

### Step 2: Deploy Backend

- [ ] **Deploy Convex:**
  ```bash
  cd backend/
  npx convex deploy --prod
  ```
  - **Expected:** Deployment succeeds
  - **Output:** Deployment URL: `https://shocking-falcon-870.convex.cloud`
  - **Status:** ⬜ Not Run / ✅ Success / ❌ Fail

- [ ] **Verify backend health:**
  ```bash
  curl https://api.one.ie/health
  ```
  - **Expected:** 200 OK, `{ "status": "healthy" }`
  - **Status:** ⬜ Not Checked / ✅ Healthy / ❌ Unhealthy

### Step 3: Deploy Frontend

- [ ] **Deploy to Cloudflare Pages:**
  ```bash
  cd web/
  wrangler pages deploy dist --project-name=one-platform
  ```
  - **Expected:** Deployment succeeds
  - **Output:** Live URL: `https://web.one.ie`
  - **Status:** ⬜ Not Run / ✅ Success / ❌ Fail

- [ ] **Verify frontend loads:**
  ```bash
  curl -I https://web.one.ie
  ```
  - **Expected:** 200 OK
  - **Status:** ⬜ Not Checked / ✅ Success / ❌ Fail

### Step 4: DNS & SSL

- [ ] **DNS records configured:**
  - `api.one.ie` → Convex backend
  - `web.one.ie` → Cloudflare Pages
  - **Status:** ⬜ Not Configured / ✅ Configured

- [ ] **SSL certificates valid:**
  ```bash
  openssl s_client -connect api.one.ie:443 | grep "Verify return code"
  ```
  - **Expected:** `Verify return code: 0 (ok)`
  - **Status:** ⬜ Not Checked / ✅ Valid / ❌ Invalid

---

## Post-Deployment Verification

### Smoke Tests

**Run all 5 critical smoke tests:**

#### Test 1: User Signup
```bash
curl -X POST https://api.one.ie/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "smoketest+'$(date +%s)'@one.ie",
    "password": "SmokeTest123!",
    "name": "Smoke Test"
  }'
```
- **Expected:** 200 OK, `{ "sessionToken": "..." }`
- **Status:** ⬜ Not Run / ✅ Pass / ❌ Fail

#### Test 2: User Signin
```bash
curl -X POST https://api.one.ie/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "smoketest@one.ie",
    "password": "SmokeTest123!"
  }'
```
- **Expected:** 200 OK, `{ "sessionToken": "..." }`
- **Status:** ⬜ Not Run / ✅ Pass / ❌ Fail

#### Test 3: Session Validation
```bash
SESSION_TOKEN="<token_from_signin>"
curl https://api.one.ie/session \
  -H "Authorization: Bearer $SESSION_TOKEN"
```
- **Expected:** 200 OK, `{ "user": { "email": "..." } }`
- **Status:** ⬜ Not Run / ✅ Pass / ❌ Fail

#### Test 4: GitHub OAuth Flow
- **Method:** Manual test in browser
- **URL:** `https://web.one.ie/account/signin`
- **Action:** Click "Sign in with GitHub"
- **Expected:** Redirect to GitHub → Authorize → Redirect back → Logged in
- **Status:** ⬜ Not Run / ✅ Pass / ❌ Fail

#### Test 5: Rate Limiting
```bash
for i in {1..10}; do
  curl -X POST https://api.one.ie/auth/signin \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}' &
done
wait
```
- **Expected:** Some requests return 429 Too Many Requests
- **Status:** ⬜ Not Run / ✅ Pass / ❌ Fail

**Smoke Tests Summary:**
- Total: 5
- Passed: [X]
- Failed: [X]

**Action:** ⬜ Proceed / ❌ Rollback (smoke tests failed)

---

## Monitoring Setup

### Metrics Dashboard

- [ ] **Dashboard accessible:**
  - **URL:** `https://web.one.ie/admin/metrics`
  - **Status:** ⬜ Not Accessible / ✅ Live

- [ ] **Metrics updating in real-time:**
  - **Refresh rate:** Every 30 seconds
  - **Status:** ⬜ Not Updating / ✅ Updating

- [ ] **Key metrics visible:**
  - Login success rate
  - Active sessions
  - API latency (P50, P95, P99)
  - Error rate (4xx, 5xx)
  - **Status:** ⬜ Missing Metrics / ✅ All Visible

### Alerts Configuration

#### Alert 1: High Error Rate (Critical)
- [ ] **Configured:**
  - Condition: `error_rate_5xx > 1%` for 5 minutes
  - Channels: Slack (#auth-alerts), PagerDuty, Email
  - **Status:** ⬜ Not Configured / ✅ Configured

- [ ] **Tested:**
  - **Method:** Trigger artificial error, verify alert
  - **Status:** ⬜ Not Tested / ✅ Tested / ❌ Not Working

#### Alert 2: Low Login Success Rate (High)
- [ ] **Configured:**
  - Condition: `login_success_rate < 90%` for 10 minutes
  - Channels: Slack (#auth-alerts), Email
  - **Status:** ⬜ Not Configured / ✅ Configured

- [ ] **Tested:**
  - **Method:** Simulate low success rate, verify alert
  - **Status:** ⬜ Not Tested / ✅ Tested / ❌ Not Working

#### Alert 3: High Bot Activity (Medium)
- [ ] **Configured:**
  - Condition: `bot_attempts_blocked > 100` per hour for 15 minutes
  - Channels: Slack (#security-alerts)
  - **Status:** ⬜ Not Configured / ✅ Configured

- [ ] **Tested:**
  - **Status:** ⬜ Not Tested / ✅ Tested / ❌ Not Working

**Alerts Summary:**
- Total: 3+
- Configured: [X]
- Tested: [X]
- Working: [X]

**Action:** ⬜ Proceed / ⚠️ Proceed with Warning (alerts not fully tested)

---

## Performance Benchmarks

### Baseline Performance

Run load test with k6:
```bash
k6 run --vus 100 --duration 10m load-test.js
```

**Results:**

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Signup (P95) | < 1s | [X.XX]s | ⬜ / ✅ / ❌ |
| Signin (P95) | < 500ms | [XXX]ms | ⬜ / ✅ / ❌ |
| Session Validation (P95) | < 100ms | [XX]ms | ⬜ / ✅ / ❌ |
| OAuth Flow (P95) | < 3s | [X.XX]s | ⬜ / ✅ / ❌ |
| Error Rate | < 1% | [X.XX]% | ⬜ / ✅ / ❌ |

**Action:** ⬜ Proceed / ⚠️ Investigate Performance Issues / ❌ Rollback

---

## Rollback Plan

**If deployment fails or critical issues found:**

### Step 1: Assess Severity
- [ ] **Critical issue?** (User data at risk, complete outage)
  - **Action:** Immediate rollback
- [ ] **High issue?** (Major feature broken, high error rate)
  - **Action:** Rollback within 1 hour
- [ ] **Medium issue?** (Minor feature broken, acceptable error rate)
  - **Action:** Fix forward or schedule rollback

### Step 2: Execute Rollback

#### Rollback Frontend:
```bash
cd web/
wrangler pages deployment list --project-name=one-platform
wrangler pages deployment rollback <previous-deployment-id>
```

#### Rollback Backend:
```bash
cd backend/
npx convex deploy --prod --deployment <previous-deployment-name>
```

#### Verify Rollback:
```bash
curl https://web.one.ie
curl https://api.one.ie/health
```

### Step 3: Post-Rollback

- [ ] **Verify services healthy**
- [ ] **Notify team** (Slack: #deployments)
- [ ] **Document issue** (create incident report)
- [ ] **Schedule post-mortem** (within 24 hours)

**Rollback Contact:** [Name, Phone, Email]

---

## Sign-Off

### Pre-Deployment Sign-Off

- [ ] **Environment variables verified** - [Initials]
- [ ] **Secrets rotated** - [Initials]
- [ ] **Quality gates passed** - [Initials]
- [ ] **Documentation complete** - [Initials]

**Approved by:** [Name]
**Date:** [YYYY-MM-DD]
**Time:** [HH:MM UTC]

### Post-Deployment Sign-Off

- [ ] **Smoke tests passed** - [Initials]
- [ ] **Monitoring active** - [Initials]
- [ ] **Alerts configured** - [Initials]
- [ ] **Performance benchmarks met** - [Initials]

**Deployed by:** [Name]
**Deployment completed:** [YYYY-MM-DD HH:MM UTC]

---

## Post-Deployment Monitoring (First 24 Hours)

### Hour 1: Critical Monitoring
- [ ] Login success rate > 95%
- [ ] Error rate < 1%
- [ ] All alerts functional
- **Status:** [Update hourly]

### Hour 6: Stability Check
- [ ] No critical alerts triggered
- [ ] Performance within targets
- [ ] User feedback positive
- **Status:** [Update]

### Hour 24: Final Verification
- [ ] All metrics stable
- [ ] No rollback required
- [ ] Deployment successful
- **Status:** [Update]

---

## Deployment Complete! 🎉

**Deployment Status:** ⬜ In Progress / ✅ Complete / ❌ Rolled Back

**Next Steps:**
1. Monitor metrics for 7 days
2. Collect user feedback
3. Schedule post-deployment review
4. Plan next iteration (Phase 8?)

**Deployment Summary:**
- **Version:** v1.0.0-better-auth
- **Features:** [List key features]
- **Issues:** [List any known issues]
- **Uptime:** [XX.XX%]

**Celebrate:** 🎉 🎊 🥳

---

**Built with care, deployed with confidence, monitored with vigilance.**
