---
title: "Analytics Dashboard Platform v1.0.0"
description: "Full analytics, team management, real-time data visualization, and custom reports"
feature: "dashboard"
organization: "ONE Platform"
personRole: "platform_owner"
ontologyDimensions: ["Things", "People", "Events", "Knowledge"]
assignedSpecialist: "agent-frontend"
totalCycles: 40
completedCycles: 0
createdAt: 2025-10-30
draft: false
---

# ONE Platform: Analytics Dashboard Platform v1.0.0

**Focus:** Comprehensive analytics dashboard with real-time metrics, team management, and data visualization
**Type:** Backend + Frontend (Astro + React 19 + Tailwind v4 + Recharts + Convex)
**Integration:** Convex for real-time data, role-based access control
**Process:** `Cycle 1-40 optimized sequence`
**Timeline:** 12-16 cycles per specialist per day (2-3 days total)
**Target:** Fully functional analytics and team management dashboard with working MVP by Cycle 10

---

## Cycle Budget (Optimized 40-Cycle Plan)

**Quick Wins (Cycles 1-10):** Working MVP with 3 key metrics displayed
**Backend Foundation (Cycles 11-15):** Schema + core queries/mutations
**Frontend Core (Cycles 16-25):** Components + pages with real data
**Polish & Features (Cycles 26-40):** Team management, reports, optimization

---

## Quick Wins (Cycles 1-10) - MVP Dashboard

**Goal:** Show tangible progress with a working dashboard displaying real metrics

### Cycle 1: Map to Ontology + Define Core Metrics
- [ ] **Ontology Mapping:**
  - [ ] **Groups:** Organization (dashboard owner)
  - [ ] **People:** Admin (platform_owner)
  - [ ] **Things:** metric (name, value, target), dashboard_config (layout)
  - [ ] **Connections:** user → dashboard (owns)
  - [ ] **Events:** dashboard_viewed, metric_updated
  - [ ] **Knowledge:** Metric trends, insights
- [ ] **3 Core Metrics (MVP):**
  - [ ] Total Users (count from things table where type='user')
  - [ ] Active Sessions (count from events in last 24h)
  - [ ] Conversion Rate (signup events / visitor events)

### Cycle 2: Sketch Dashboard Layout
- [ ] **Simple layout design:**
  - [ ] Header with title "Analytics Dashboard"
  - [ ] 3-column grid for metric cards
  - [ ] Each card: metric name, value, trend arrow
  - [ ] Mobile: single column stack
- [ ] **Use shadcn/ui components:**
  - [ ] Card, CardHeader, CardTitle, CardContent
  - [ ] Badge for trend indicators
  - [ ] Skeleton for loading states

### Cycle 3: Create Backend Schema for Metrics
- [ ] **backend/convex/schema.ts additions:**
  - [ ] Add `metrics` table (or extend `things` with type='metric')
  - [ ] Add indexes: by_groupId, by_type, by_timestamp
- [ ] **Define metric properties:**
  - [ ] name, value, unit, trend, comparisonValue, timestamp
- [ ] Run `npx convex dev` to regenerate types

### Cycle 4: Create Metrics Query
- [ ] **backend/convex/queries/metrics.ts:**
  - [ ] `list` query - get all metrics for dashboard
  - [ ] Filter by groupId for multi-tenancy
  - [ ] Return formatted data ready for display
- [ ] **Test query from CLI:**
  - [ ] `npx convex run queries.metrics:list`

### Cycle 5: Create Metrics Mutation
- [ ] **backend/convex/mutations/metrics.ts:**
  - [ ] `update` mutation - update metric value
  - [ ] Log event when metric changes
  - [ ] Calculate trend (compare to previous value)
- [ ] **Test mutation from CLI:**
  - [ ] Create sample metrics for testing

### Cycle 6: Create MetricCard Component
- [ ] **web/src/components/features/MetricCard.tsx:**
  - [ ] Props: name, value, unit, trend, comparison
  - [ ] Display value prominently (32px font)
  - [ ] Trend arrow (↑ green, ↓ red)
  - [ ] Comparison text "vs last period"
  - [ ] Use shadcn Card components
  - [ ] Loading skeleton state

### Cycle 7: Create Dashboard Page with SSR
- [ ] **web/src/pages/account/dashboard.astro:**
  - [ ] Fetch metrics via ConvexHttpClient (SSR)
  - [ ] Render 3 MetricCard components
  - [ ] 3-column grid (responsive)
  - [ ] Add `client:load` for real-time updates
- [ ] **Handle loading/error states:**
  - [ ] Skeleton on initial load
  - [ ] Error boundary for failed fetches

### Cycle 8: Add Real-time Updates with Convex
- [ ] **Enhance MetricCard with useQuery:**
  - [ ] Import `useQuery` from "convex/react"
  - [ ] Subscribe to metrics changes
  - [ ] Animate value changes (smooth transitions)
- [ ] **Test real-time flow:**
  - [ ] Update metric via mutation in one browser tab
  - [ ] Verify dashboard updates in another tab

### Cycle 9: Add Basic Line Chart
- [ ] **Install Recharts:** `bun add recharts`
- [ ] **Create SimpleChart component:**
  - [ ] Line chart showing metric over last 7 days
  - [ ] Use mock data for now (will connect later)
  - [ ] Responsive container
  - [ ] Simple tooltip
- [ ] **Add below metric cards on dashboard**

### Cycle 10: Deploy MVP + Test End-to-End
- [ ] **Deployment checklist:**
  - [ ] `bun run build` (verify no errors)
  - [ ] `bunx astro check` (TypeScript validation)
  - [ ] Deploy backend: `cd backend && npx convex deploy`
  - [ ] Deploy frontend: `cd web && wrangler pages deploy dist`
- [ ] **MVP acceptance criteria:**
  - [ ] Dashboard displays 3 real metrics from backend
  - [ ] Metrics update in real-time when changed
  - [ ] Page loads in < 2s
  - [ ] Mobile responsive
  - [ ] No console errors

---

## PHASE 2: BACKEND FOUNDATION (Cycle 11-15)

**Purpose:** Complete backend schema and core mutations/queries

### Cycle 11: Extend Metrics Schema
- [ ] **Add metric history tracking:**
  - [ ] Create `metric_history` table for time-series data
  - [ ] Store daily snapshots of metric values
  - [ ] Index by metric_id and date

### Cycle 12: Create Advanced Metrics Queries
- [ ] **backend/convex/queries/metrics.ts:**
  - [ ] `history` - get time series (last 30 days)
  - [ ] `compare` - compare two date ranges
  - [ ] `trends` - calculate growth rates
  - [ ] `aggregate` - sum/avg/min/max across metrics

### Cycle 13: Create Dashboard Config Mutations
- [ ] **backend/convex/mutations/dashboard.ts:**
  - [ ] `saveLayout` - persist widget arrangement
  - [ ] `addWidget` - add new metric to dashboard
  - [ ] `removeWidget` - remove metric from view
- [ ] Store config in `things` table with type='dashboard_config'

### Cycle 14: Add Event Logging
- [ ] **Log all dashboard interactions:**
  - [ ] dashboard_viewed (track page views)
  - [ ] metric_clicked (track engagement)
  - [ ] export_completed (track report usage)
- [ ] Use existing `events` table

### Cycle 15: Create Sample Data Generator
- [ ] **backend/convex/mutations/seed.ts:**
  - [ ] Generate 30 days of sample metrics
  - [ ] Create realistic trends (growth, seasonality)
  - [ ] Seed for development/testing
- [ ] Run once to populate dashboard with data

---

## PHASE 3: FRONTEND CORE (Cycle 16-25)

**Purpose:** Build complete dashboard UI with all chart types

### Cycle 16: Create Enhanced MetricCard
- [ ] **Add more features to MetricCard:**
  - [ ] Sparkline chart (last 7 days mini trend)
  - [ ] Click to expand to detailed view
  - [ ] Custom color based on metric type
  - [ ] Target progress indicator

### Cycle 17: Create Multi-Chart Dashboard Component
- [ ] **web/src/components/features/MetricCharts.tsx:**
  - [ ] Line chart for trends
  - [ ] Bar chart for comparisons
  - [ ] Area chart for cumulative metrics
- [ ] Use Recharts with responsive containers
- [ ] Shared tooltip and legend styles

### Cycle 18: Add Date Range Filter
- [ ] **Create DateFilter component:**
  - [ ] Preset buttons: 7d, 30d, 90d, 1y
  - [ ] Custom date picker
  - [ ] Apply filter to all charts
- [ ] Use nanostores for global filter state

### Cycle 19: Create Analytics Page
- [ ] **web/src/pages/account/analytics.astro:**
  - [ ] Grid of 4-6 detailed charts
  - [ ] Date filter at top
  - [ ] Export button (PDF/CSV)
  - [ ] Responsive layout

### Cycle 20: Add Chart Interactions
- [ ] **Interactive features:**
  - [ ] Hover tooltips with formatted values
  - [ ] Click data points to drill down
  - [ ] Toggle series on/off in legend
  - [ ] Zoom and pan for large datasets

### Cycle 21: Create Dashboard Navigation
- [ ] **Sidebar component:**
  - [ ] Overview (home)
  - [ ] Analytics (charts)
  - [ ] Team (coming soon)
  - [ ] Reports (coming soon)
- [ ] Active state styling
- [ ] Mobile hamburger menu

### Cycle 22: Add Loading States & Skeletons
- [ ] **Graceful loading:**
  - [ ] Skeleton cards while fetching
  - [ ] Shimmer animation
  - [ ] Progressive enhancement
- [ ] Use shadcn Skeleton component

### Cycle 23: Add Error Handling
- [ ] **Error boundaries:**
  - [ ] Catch query failures
  - [ ] Display user-friendly messages
  - [ ] Retry button
  - [ ] Fallback to cached data

### Cycle 24: Optimize Performance
- [ ] **Frontend optimizations:**
  - [ ] Lazy load charts (client:visible)
  - [ ] Memoize expensive calculations
  - [ ] Debounce filter changes
  - [ ] Code split Recharts bundle

### Cycle 25: Add Dark Mode Support
- [ ] **Theme-aware charts:**
  - [ ] Update Recharts colors for dark mode
  - [ ] Adjust metric card backgrounds
  - [ ] Test contrast ratios
- [ ] Use Tailwind dark: variant

---

## PHASE 4: TEAM & REPORTS (Cycle 26-35)

**Purpose:** Add team management and report generation

### Cycle 26: Create Team Schema
- [ ] **Extend backend for team features:**
  - [ ] Add team_invitations table
  - [ ] Store pending invites with expiry
  - [ ] Link to groups for multi-tenancy

### Cycle 27: Create Team Page
- [ ] **web/src/pages/account/team.astro:**
  - [ ] List team members (from people)
  - [ ] Role badges (admin, manager, member)
  - [ ] Last active timestamps
  - [ ] Invite button (modal)

### Cycle 28: Create Invite Flow
- [ ] **InviteModal component:**
  - [ ] Email input with validation
  - [ ] Role dropdown
  - [ ] Send mutation
  - [ ] Success toast notification

### Cycle 29: Create Report Builder
- [ ] **Simple report generator:**
  - [ ] Select metrics to include
  - [ ] Choose date range
  - [ ] Generate PDF or CSV
- [ ] Use jsPDF for PDF generation
- [ ] Use PapaParse for CSV export

### Cycle 30: Create Reports Page
- [ ] **web/src/pages/account/reports.astro:**
  - [ ] List saved reports
  - [ ] Report templates
  - [ ] Generate new report button
  - [ ] Download previous exports

### Cycle 31: Add Export Functionality
- [ ] **Export current view:**
  - [ ] Export button on analytics page
  - [ ] Save charts as PNG (html2canvas)
  - [ ] Export data as CSV
  - [ ] Email report (optional)

### Cycle 32: Add Notifications
- [ ] **Toast notifications:**
  - [ ] Metric threshold alerts
  - [ ] New team member joined
  - [ ] Report generated
- [ ] Use shadcn Toast component

### Cycle 33: Add Settings Page
- [ ] **web/src/pages/account/settings.astro:**
  - [ ] Profile settings
  - [ ] Notification preferences
  - [ ] Dashboard layout preferences
  - [ ] Dark mode toggle

### Cycle 34: Accessibility Pass
- [ ] **WCAG 2.1 AA compliance:**
  - [ ] Keyboard navigation
  - [ ] Screen reader labels
  - [ ] Focus indicators
  - [ ] Color contrast checks

### Cycle 35: Mobile Optimization
- [ ] **Responsive refinements:**
  - [ ] Touch-friendly targets
  - [ ] Swipeable charts on mobile
  - [ ] Simplified navigation drawer
  - [ ] Test on iOS/Android

---

## PHASE 5: POLISH & DEPLOYMENT (Cycle 36-40)

**Purpose:** Final optimizations and production deployment

### Cycle 36: Performance Audit
- [ ] **Run Lighthouse:**
  - [ ] Target score > 90
  - [ ] Optimize images
  - [ ] Reduce JavaScript bundle
  - [ ] Enable caching

### Cycle 37: Cross-browser Testing
- [ ] **Test on:**
  - [ ] Chrome (latest)
  - [ ] Firefox (latest)
  - [ ] Safari (latest)
  - [ ] Edge (latest)
- [ ] Fix any compatibility issues

### Cycle 38: Write Tests
- [ ] **Unit tests:**
  - [ ] MetricCard rendering
  - [ ] Chart data transformations
  - [ ] Filter logic
- [ ] **Integration tests:**
  - [ ] Dashboard page loads
  - [ ] Real-time updates work

### Cycle 39: Documentation
- [ ] **Create usage guide:**
  - [ ] How to add new metrics
  - [ ] How to customize dashboard
  - [ ] How to export reports
- [ ] Add JSDoc comments to components

### Cycle 40: Production Deployment
- [ ] **Deploy to production:**
  - [ ] Run full build (`bun run build`)
  - [ ] Deploy backend (`npx convex deploy`)
  - [ ] Deploy frontend (`wrangler pages deploy`)
  - [ ] Verify all features work
- [ ] **Smoke test:**
  - [ ] Metrics display correctly
  - [ ] Real-time updates work
  - [ ] Exports generate
  - [ ] Team invites send

---

## SUCCESS CRITERIA

**MVP (Cycle 10):**
- ✅ Dashboard displays 3 real metrics from Convex backend
- ✅ Metrics update in real-time when values change
- ✅ Basic line chart showing trend over time
- ✅ Page loads in < 2 seconds
- ✅ Mobile responsive layout
- ✅ No console errors or TypeScript issues

**Complete Platform (Cycle 40):**
- ✅ Analytics dashboard shows 6+ interactive charts (line, bar, area)
- ✅ Team management: invite members, assign roles
- ✅ Report builder creates and exports PDF/CSV
- ✅ Date range filtering works across all views
- ✅ Real-time data streams smoothly via Convex subscriptions
- ✅ Toast notifications for important events
- ✅ Dark mode support with proper contrast
- ✅ Lighthouse score > 90
- ✅ WCAG 2.1 AA accessible
- ✅ Cross-browser tested (Chrome, Firefox, Safari, Edge)

---

## Implementation Strategy

**Aggressive Parallelization:**
- Cycles 1-10 can run sequentially (foundation + MVP)
- Cycles 11-15 (backend) + Cycles 16-20 (frontend) can run in parallel
- Cycles 21-25 + Cycles 26-30 can overlap (different pages)
- Final polish (Cycles 36-40) runs sequentially

**Time Estimates:**
- Day 1: Cycles 1-15 (MVP + backend foundation) - 1 day
- Day 2: Cycles 16-30 (frontend + features) - 1 day
- Day 3: Cycles 31-40 (polish + deploy) - 0.5 days

**Total:** 2.5 days for complete dashboard platform

---

**Status:** Ready to build
**Next Action:** Start with Cycle 1 - Map to ontology and define 3 core metrics
**Specialist:** agent-frontend (with backend support when needed)
