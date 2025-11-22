---
title: Phase 7 Implementation Guide
dimension: events
category: guides
tags: phase-7, implementation, quick-reference
related_dimensions: knowledge
scope: global
created: 2025-11-22
version: 1.0.0
---

# Phase 7 Implementation Guide

**Quick Reference for Developers Implementing Phase 7**

---

## What Is Phase 7?

Phase 7 (Cycles 95-100) adds the **final polish and production readiness** to the Better Auth implementation:

1. **Cycle 95:** Captcha Protection (bot prevention)
2. **Cycle 96:** Have I Been Pwned (password breach detection)
3. **Cycle 98:** OpenAPI Documentation (developer docs)
4. **Cycle 99:** Security Audit (OWASP Top 10 validation)
5. **Cycle 100:** Production Deployment (monitoring + alerts)

**Total Time:** 2-3 days
**Risk Level:** 🟢 Low

---

## File Overview

### Specifications (READ FIRST)
1. **`phase-7-polish-production-spec.md`** - Complete quality specification
   - User flows with time budgets
   - Acceptance criteria
   - Technical test specifications
   - 6-dimension ontology mapping

2. **`phase-7-summary.md`** - Executive summary (THIS FILE first!)
   - Overview of all deliverables
   - Success criteria
   - Timeline and risk assessment

### Security
3. **`security-audit-checklist.md`** - OWASP Top 10 audit (71 tests)
   - Manual and automated testing
   - Vulnerability tracking
   - Remediation planning

4. **`production-deployment-checklist.md`** - Deployment runbook
   - Environment variable setup
   - Pre/post deployment verification
   - Smoke tests
   - Monitoring setup

### Tests (IMPLEMENT THESE)
5. **`backend/convex/lib/captcha.test.ts`** - Captcha test suite (23 tests)
6. **`backend/convex/lib/hibp.test.ts`** - HIBP test suite (28 tests)

---

## Implementation Order

### Day 1: Security Features (Parallel)

**Morning - Cycle 95: Captcha Protection**
```bash
# 1. Install dependencies
cd backend/
bun add @google-cloud/recaptcha-enterprise

# 2. Create captcha.ts
# Location: backend/convex/lib/captcha.ts
# Reference: phase-7-polish-production-spec.md (Cycle 95)

# 3. Update auth mutations
# Location: backend/convex/mutations/auth.ts
# Add captcha validation to signUp and signIn

# 4. Run tests
bun test backend/convex/lib/captcha.test.ts

# Time estimate: 2-3 hours
```

**Afternoon - Cycle 96: HIBP Integration**
```bash
# 1. No dependencies needed (uses fetch)

# 2. Create hibp.ts
# Location: backend/convex/lib/hibp.ts
# Reference: phase-7-polish-production-spec.md (Cycle 96)

# 3. Update auth mutations
# Location: backend/convex/mutations/auth.ts
# Add HIBP validation to signUp and changePassword

# 4. Run tests
bun test backend/convex/lib/hibp.test.ts

# Time estimate: 2-3 hours
```

**Total Day 1:** 4-6 hours

---

### Day 2: Documentation & Audit

**Morning - Cycle 98: OpenAPI Documentation**
```bash
# 1. Install dependencies
cd backend/
bun add swagger-jsdoc swagger-ui-express

# 2. Generate OpenAPI spec
# Location: backend/openapi.yaml
# Reference: phase-7-polish-production-spec.md (Cycle 98)

# 3. Create Swagger UI page
# Location: web/src/pages/api/docs.astro

# 4. Verify
open http://localhost:4321/api/docs

# Time estimate: 3-4 hours
```

**Afternoon - Cycle 99: Security Audit**
```bash
# 1. Run automated scans
npm audit --production --audit-level=high
docker run -t owasp/zap2docker-stable zap-baseline.py -t https://api.one.ie

# 2. Complete manual tests
# Reference: security-audit-checklist.md

# 3. Document findings
# Location: one/events/security-audit-report.md

# Time estimate: 3-4 hours
```

**Total Day 2:** 6-8 hours

---

### Day 3: Production Deployment

**Full Day - Cycle 100: Deploy to Production**
```bash
# 1. Complete pre-deployment checklist
# Reference: production-deployment-checklist.md

# 2. Build
cd web/ && bun run build

# 3. Deploy backend
cd backend/ && npx convex deploy --prod

# 4. Deploy frontend
cd web/ && wrangler pages deploy dist

# 5. Run smoke tests (5 tests)
# Reference: production-deployment-checklist.md

# 6. Set up monitoring
# Create metrics dashboard at /admin/metrics
# Configure alerts (Slack, email, PagerDuty)

# 7. Verify
open https://web.one.ie
open https://api.one.ie/health
open https://web.one.ie/admin/metrics

# Time estimate: 4-6 hours
```

**Total Day 3:** 4-6 hours

---

## Testing Strategy

### Unit Tests (Run Continuously)
```bash
# Captcha tests
bun test backend/convex/lib/captcha.test.ts

# HIBP tests
bun test backend/convex/lib/hibp.test.ts

# Expected: All tests pass (51 total)
```

### Integration Tests (Run Before Deployment)
```bash
# Full test suite
cd web/ && bun test

# Expected: All tests pass
```

### E2E Tests (Run on Staging)
```bash
# Complete user flows
bun test e2e/

# Expected: All flows complete within time budgets
```

### Security Tests (Run Before Production)
```bash
# OWASP Top 10 validation
# Reference: security-audit-checklist.md

# Expected: 0 critical, 0 high vulnerabilities
```

---

## Quality Gates

### Cannot Start Implementation Until:
- [x] Specification reviewed and approved
- [x] Test cases understood
- [x] Environment variables configured
- [x] Monitoring infrastructure ready

### Cannot Deploy to Production Until:
- [ ] All unit tests pass (51 tests)
- [ ] All integration tests pass
- [ ] All E2E tests pass
- [ ] Security audit passes (0 critical/high)
- [ ] Smoke tests pass (5/5)
- [ ] Monitoring active
- [ ] Documentation complete

---

## Environment Variables (Production)

### Required for Cycle 95 (Captcha)
```bash
RECAPTCHA_SITE_KEY=<your_site_key>
RECAPTCHA_SECRET_KEY=<your_secret_key>
```

### Required for Cycle 100 (Monitoring)
```bash
SENTRY_DSN=<sentry_dsn>
AXIOM_API_TOKEN=<axiom_token>
SLACK_WEBHOOK_URL=<webhook_url>
```

**Reference:** `production-deployment-checklist.md` for complete list

---

## Success Criteria

### Cycle 95: Captcha Protection
- [x] Specification complete
- [ ] Implementation complete
- [ ] Tests passing (23/23)
- [ ] Bot attempts blocked
- [ ] Events logged

### Cycle 96: HIBP Integration
- [x] Specification complete
- [ ] Implementation complete
- [ ] Tests passing (28/28)
- [ ] Pwned passwords detected
- [ ] Users warned

### Cycle 98: OpenAPI Documentation
- [x] Specification complete
- [ ] Implementation complete
- [ ] Swagger UI live
- [ ] All endpoints documented (40+)
- [ ] Examples working

### Cycle 99: Security Audit
- [x] Checklist created (71 tests)
- [ ] Automated scans complete
- [ ] Manual tests complete
- [ ] 0 critical/high vulnerabilities
- [ ] Audit report generated

### Cycle 100: Production Deployment
- [x] Checklist created
- [ ] Environment variables set
- [ ] Smoke tests pass (5/5)
- [ ] Monitoring active
- [ ] Alerts configured
- [ ] Documentation complete

---

## Common Issues & Solutions

### Issue: Captcha provider timeout
**Solution:** Fallback strategy (allow signup, log warning)
**Reference:** `captcha.test.ts` - Fallback Strategy tests

### Issue: HIBP API unavailable
**Solution:** Fallback to password strength only
**Reference:** `hibp.test.ts` - Fallback Strategy tests

### Issue: Security scan false positives
**Solution:** Document justification in audit report
**Reference:** `security-audit-checklist.md` - Findings section

### Issue: Deployment failure
**Solution:** Execute rollback plan
**Reference:** `production-deployment-checklist.md` - Rollback Plan

---

## Getting Help

### Documentation
- **Complete Spec:** `phase-7-polish-production-spec.md`
- **Executive Summary:** `phase-7-summary.md`
- **Security Audit:** `security-audit-checklist.md`
- **Deployment:** `production-deployment-checklist.md`

### Test Files
- **Captcha Tests:** `backend/convex/lib/captcha.test.ts`
- **HIBP Tests:** `backend/convex/lib/hibp.test.ts`

### External Resources
- **reCAPTCHA Docs:** https://developers.google.com/recaptcha
- **HIBP API Docs:** https://haveibeenpwned.com/API/v3
- **OpenAPI Spec:** https://swagger.io/specification/
- **OWASP Top 10:** https://owasp.org/Top10/

---

## Quick Commands

### Run All Phase 7 Tests
```bash
bun test backend/convex/lib/captcha.test.ts
bun test backend/convex/lib/hibp.test.ts
```

### Run Security Audit
```bash
npm audit --production --audit-level=high
```

### Deploy to Production
```bash
cd backend/ && npx convex deploy --prod
cd web/ && wrangler pages deploy dist
```

### Check Monitoring
```bash
open https://web.one.ie/admin/metrics
```

---

## Timeline Summary

| Day | Cycles | Time | Deliverables |
|-----|--------|------|--------------|
| 1 | 95-96 | 4-6h | Captcha + HIBP implemented and tested |
| 2 | 98-99 | 6-8h | OpenAPI docs + Security audit complete |
| 3 | 100 | 4-6h | Production deployment + monitoring |

**Total:** 2-3 days (14-20 hours)

---

## Sign-Off

**Quality Agent:** Specifications complete ✅
**Test Coverage:** Comprehensive (51+ tests) ✅
**Ontology Alignment:** Validated ✅
**Production Readiness:** Checklists created ✅

**Status:** ✅ READY FOR IMPLEMENTATION

---

**Let's build this!** 🚀
