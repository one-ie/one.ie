# Launch Checklist - ONE Platform Production Deployment

**Version:** 1.0.0
**Target Date:** TBD
**Platform:** https://web.one.ie
**Status:** Pre-Launch Preparation

## Pre-Launch Phase (1 Week Before)

### Code Quality & Fixes

- [ ] Fix build errors in example pages
  - [ ] `/web/src/pages/examples/form-validation.astro` - DONE
  - [ ] `/web/src/pages/examples/analytics-export.astro` - IN PROGRESS
  - [ ] Scan all example pages for JSX in code blocks
  - [ ] Replace all `@apply` directives with direct CSS
- [ ] Run full production build successfully
  - [ ] `cd web && bun run build` completes without errors
  - [ ] Verify dist/ output contains all assets
- [ ] TypeScript type checking passes
  - [ ] `bunx astro check` shows 0 errors
  - [ ] Verify all imports resolve correctly
- [ ] Linting passes
  - [ ] `bun run lint` completes successfully

### Environment Configuration

- [ ] Create root `.env` file
  ```bash
  CLOUDFLARE_GLOBAL_API_KEY=your-key-here
  CLOUDFLARE_ACCOUNT_ID=your-account-id-here
  CLOUDFLARE_EMAIL=your-email@domain.com
  ```
- [ ] Create `web/.wrangler-env` file
  ```bash
  CLOUDFLARE_GLOBAL_API_KEY=your-key-here
  CLOUDFLARE_ACCOUNT_ID=your-account-id-here
  ```
- [ ] Configure backend Convex deployment
  ```bash
  cd backend
  npx convex dev  # Sets up CONVEX_DEPLOYMENT
  ```
- [ ] Set production Stripe keys (Convex dashboard)
  - [ ] STRIPE_SECRET_KEY (sk_live_...)
  - [ ] STRIPE_WEBHOOK_SECRET (whsec_...)
- [ ] Configure frontend environment (Cloudflare Pages dashboard)
  - [ ] PUBLIC_CONVEX_URL
  - [ ] PUBLIC_STRIPE_PUBLISHABLE_KEY

### Database & Backend

- [ ] Deploy Convex schema to production
  ```bash
  cd backend
  npx convex deploy --prod
  ```
- [ ] Verify all tables created:
  - [ ] groups
  - [ ] things
  - [ ] connections
  - [ ] events
  - [ ] knowledge
- [ ] Create root group (platform-level)
  ```javascript
  // Via Convex dashboard
  await ctx.db.insert("groups", {
    name: "Platform Root",
    type: "platform",
    status: "active",
    parentGroupId: null,
    createdAt: Date.now(),
    updatedAt: Date.now()
  });
  ```
- [ ] Create platform owner account
  - [ ] Register via Better Auth
  - [ ] Assign platform_owner role
  - [ ] Verify permissions
- [ ] Test all queries return correct data
- [ ] Test all mutations create events

### Frontend Build & Deploy

- [ ] Build frontend successfully
  ```bash
  cd web
  bun run build
  ```
- [ ] Deploy to Cloudflare Pages (preview)
  ```bash
  wrangler pages deploy dist --project-name=web --branch=preview
  ```
- [ ] Test preview deployment
  - [ ] All pages load correctly
  - [ ] No 404 errors
  - [ ] Images load
  - [ ] Styles apply correctly
- [ ] Deploy to production
  ```bash
  wrangler pages deploy dist --project-name=web --branch=production
  ```

### Domain & SSL

- [ ] Configure custom domain (web.one.ie)
  ```bash
  curl -X POST "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/web/domains" \
    -H "X-Auth-Email: $EMAIL" \
    -H "X-Auth-Key: $API_KEY" \
    -H "Content-Type: application/json" \
    --data '{"name":"web.one.ie"}'
  ```
- [ ] Configure DNS records
  - [ ] Type: CNAME
  - [ ] Name: web
  - [ ] Target: web-xxx.pages.dev
  - [ ] Proxy: Enabled
- [ ] Verify SSL certificate
  - [ ] Auto-generated certificate active
  - [ ] Force HTTPS enabled
  - [ ] Test https://web.one.ie loads

### Stripe Integration

- [ ] Switch to production Stripe keys
  - [ ] Update backend STRIPE_SECRET_KEY
  - [ ] Update frontend PUBLIC_STRIPE_PUBLISHABLE_KEY
- [ ] Configure production webhook
  - [ ] Endpoint: https://web.one.ie/api/webhooks/stripe
  - [ ] Events: payment_intent.succeeded, payment_intent.failed, charge.refunded
  - [ ] Copy webhook signing secret
  - [ ] Add to Convex: STRIPE_WEBHOOK_SECRET
- [ ] Test payment flow end-to-end
  - [ ] Create test funnel
  - [ ] Add product with price
  - [ ] Complete checkout
  - [ ] Verify payment in Stripe dashboard
  - [ ] Verify event logged in events table
- [ ] Test refund flow
  - [ ] Process refund in Stripe dashboard
  - [ ] Verify webhook received
  - [ ] Verify refund event logged

### Testing Suite

- [ ] Unit tests pass
  ```bash
  cd web
  bun test
  ```
- [ ] Integration tests pass
  - [ ] Funnel creation flow
  - [ ] Template marketplace
  - [ ] Analytics dashboard
  - [ ] Payment processing
- [ ] End-to-end tests
  - [ ] User registration
  - [ ] Funnel building
  - [ ] Publishing funnel
  - [ ] Viewing analytics
  - [ ] Processing payment
- [ ] Cross-browser testing
  - [ ] Chrome (latest)
  - [ ] Firefox (latest)
  - [ ] Safari (latest)
  - [ ] Edge (latest)
- [ ] Mobile testing
  - [ ] iOS Safari
  - [ ] Android Chrome
  - [ ] Responsive layouts
  - [ ] Touch interactions
- [ ] Performance testing
  - [ ] Lighthouse score >90
  - [ ] Core Web Vitals pass
  - [ ] LCP <2.5s
  - [ ] FID <100ms
  - [ ] CLS <0.1
- [ ] Load testing
  - [ ] 100 concurrent users
  - [ ] 500 concurrent users
  - [ ] 1000 concurrent users
  - [ ] Identify bottlenecks
  - [ ] Optimize if needed

### Security Audit

- [ ] No API keys in code
  - [ ] Grep for "sk_", "pk_", "whsec_"
  - [ ] Verify all keys in environment
- [ ] Authentication working
  - [ ] Better Auth configured
  - [ ] Login flow works
  - [ ] Logout works
  - [ ] Session persistence
- [ ] Authorization working
  - [ ] Group-based access control
  - [ ] Role-based permissions
  - [ ] Test unauthorized access blocked
- [ ] Input validation
  - [ ] All forms validate
  - [ ] Zod schemas enforced
  - [ ] Error messages shown
- [ ] HTTPS enforced
  - [ ] HTTP redirects to HTTPS
  - [ ] All assets served over HTTPS
- [ ] CORS configured
  - [ ] Only allowed origins
  - [ ] Credentials handled correctly
- [ ] Rate limiting
  - [ ] Mutations rate-limited
  - [ ] API endpoints protected
  - [ ] Test rate limit triggers
- [ ] SQL injection prevention
  - [ ] Convex handles this (verified)
- [ ] XSS protection
  - [ ] React escapes by default (verified)
  - [ ] No dangerouslySetInnerHTML used

### Monitoring & Analytics

- [ ] Error tracking configured (Sentry recommended)
  ```bash
  bun add @sentry/astro
  ```
- [ ] Sentry DSN configured
  - [ ] Add to astro.config.mjs
  - [ ] Test error capture
  - [ ] Verify errors appear in Sentry dashboard
- [ ] Analytics configured
  - [ ] Cloudflare Analytics enabled
  - [ ] Custom event tracking
  - [ ] Conversion tracking
- [ ] Performance monitoring
  - [ ] Web Vitals tracking
  - [ ] API response times
  - [ ] Convex function metrics
- [ ] Uptime monitoring
  - [ ] Pingdom / UptimeRobot configured
  - [ ] Alert contacts configured
  - [ ] Status page created

### Documentation

- [ ] User documentation complete
  - [ ] Getting started guide
  - [ ] Funnel builder tutorial
  - [ ] Template marketplace guide
  - [ ] Analytics guide
  - [ ] Payment setup guide
- [ ] Developer documentation complete
  - [ ] API reference
  - [ ] Integration guides
  - [ ] Deployment guide
  - [ ] Troubleshooting guide
- [ ] Update README.md
  - [ ] Production URLs
  - [ ] Installation instructions
  - [ ] Quick start guide
- [ ] Create changelog
  - [ ] Version 1.0.0 release notes
  - [ ] List all features
  - [ ] Known issues

## Launch Day

### Final Verification (2 Hours Before Launch)

- [ ] Run full production build
  ```bash
  cd web && bun run build
  ```
- [ ] Deploy backend
  ```bash
  cd backend && npx convex deploy --prod
  ```
- [ ] Deploy frontend
  ```bash
  cd web && wrangler pages deploy dist --project-name=web --branch=production
  ```
- [ ] Verify production URL: https://web.one.ie
- [ ] Test critical user flows:
  - [ ] Registration
  - [ ] Login
  - [ ] Create funnel
  - [ ] Publish funnel
  - [ ] View analytics
  - [ ] Process payment

### Launch Sequence

- [ ] **T-30 minutes:** Final smoke tests
- [ ] **T-15 minutes:** Enable production environment variables
- [ ] **T-10 minutes:** Deploy backend to production
- [ ] **T-5 minutes:** Deploy frontend to production
- [ ] **T-0:** Verify deployment live
- [ ] **T+5 minutes:** Test all critical flows
- [ ] **T+10 minutes:** Enable monitoring alerts
- [ ] **T+15 minutes:** Send launch announcement

### Launch Announcement

- [ ] Email to beta users
- [ ] Post on social media
- [ ] Update website homepage
- [ ] Submit to ProductHunt (optional)
- [ ] Post in relevant communities

## Post-Launch Phase (First Week)

### Immediate Monitoring (First 24 Hours)

- [ ] Monitor error rates
  - [ ] Check Sentry every hour
  - [ ] Fix critical errors immediately
- [ ] Watch performance metrics
  - [ ] Response times
  - [ ] Database queries
  - [ ] Page load times
- [ ] Track user activity
  - [ ] Registration count
  - [ ] Funnel creation count
  - [ ] Payment count
- [ ] Monitor uptime
  - [ ] 99.9% target
  - [ ] Alert on downtime

### First Week Tasks

- [ ] Gather user feedback
  - [ ] In-app feedback form
  - [ ] Email surveys
  - [ ] Social media listening
- [ ] Fix reported bugs
  - [ ] Triage by severity
  - [ ] Critical: Fix within 4 hours
  - [ ] High: Fix within 24 hours
  - [ ] Medium: Fix within 1 week
- [ ] Optimize based on metrics
  - [ ] Identify slow queries
  - [ ] Optimize database indexes
  - [ ] Add caching where needed
- [ ] Document known issues
  - [ ] Create GitHub issues
  - [ ] Prioritize for next release
- [ ] Plan next iteration
  - [ ] Review feature requests
  - [ ] Prioritize roadmap

## Rollback Plan

### Triggers for Rollback

- Critical errors affecting >10% of users
- Security vulnerability discovered
- Data corruption detected
- Payment processing failures
- Uptime <95% in first 24 hours

### Rollback Procedure

1. **Rollback Frontend:**
   ```bash
   # Via Cloudflare Pages dashboard
   # Select previous deployment
   # Click "Promote to Production"
   ```

2. **Rollback Backend:**
   ```bash
   cd backend
   # Via Convex dashboard
   # Select previous deployment
   # Click "Deploy"
   ```

3. **Verify Rollback:**
   - Test critical flows
   - Verify errors resolved
   - Monitor metrics

4. **Communicate:**
   - Send status update
   - Explain what happened
   - Provide timeline for fix

## Success Criteria

### Technical Metrics

- [ ] Uptime: >99.9%
- [ ] Error Rate: <0.1%
- [ ] API Response Time: <100ms (p95)
- [ ] Page Load Time: <2s (p95)
- [ ] Lighthouse Score: >90
- [ ] Build Time: <3 minutes

### Business Metrics

- [ ] User Registrations: >10 in first week
- [ ] Funnels Created: >5 in first week
- [ ] Templates Used: >3 different templates
- [ ] Payments Processed: >1 successful payment
- [ ] Conversion Rate: >1% average across funnels

### User Satisfaction

- [ ] No critical bugs reported
- [ ] Positive feedback ratio >80%
- [ ] Support tickets <5 per day
- [ ] Feature requests collected

## Risk Mitigation

### High Risk Items

**Build Errors**
- Risk: Deployment fails
- Mitigation: Fix all errors before launch
- Contingency: Rollback to stable branch

**Environment Configuration**
- Risk: Missing API keys
- Mitigation: Triple-check all environment variables
- Contingency: Have backup keys ready

**Payment Integration**
- Risk: Stripe webhook failures
- Mitigation: Test webhook thoroughly
- Contingency: Manual payment verification process

### Medium Risk Items

**Performance Under Load**
- Risk: Slow response times
- Mitigation: Load testing before launch
- Contingency: Cloudflare caching, Convex scaling

**Database Migration**
- Risk: Data loss
- Mitigation: Test migration in staging
- Contingency: Backup before migration

**Third-Party Integrations**
- Risk: API failures
- Mitigation: Graceful degradation
- Contingency: Fallback to manual processes

## Contact Information

**On-Call Team:**
- Platform Owner: [email]
- Backend Specialist: Convex support
- Frontend Specialist: Cloudflare support
- Ops Specialist: [email]

**Support Channels:**
- Email: support@one.ie
- Discord: [invite link]
- GitHub Issues: https://github.com/one-ie/one/issues

---

**Checklist Version:** 1.0.0
**Last Updated:** 2025-11-22
**Status:** Ready for Launch Preparation
