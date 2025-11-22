---
title: Monitoring & Analytics System
dimension: knowledge
category: monitoring
tags: monitoring, analytics, metrics, uptime, quotas, web-vitals
related_dimensions: events, groups, people, things
scope: global
created: 2025-11-22
updated: 2025-11-22
version: 1.0.0
ai_context: |
  This document describes the monitoring and analytics system for tracking deployments,
  builds, performance, uptime, and resource quotas in the ONE platform.
---

# Monitoring & Analytics System

**Version:** 1.0.0
**Status:** Complete - Cycle 27
**Purpose:** Track deployments, builds, performance metrics, uptime, and enforce resource quotas

---

## Overview

The monitoring system provides comprehensive tracking of:

1. **Deployments** - Track each deployment with metrics
2. **Build Metrics** - Aggregate build performance statistics
3. **Core Web Vitals** - LCP, FID, CLS for performance monitoring
4. **Site Uptime** - Uptime percentage, response times, regional data
5. **Quotas** - Enforce deployment and build limits per user/month

---

## Architecture

### Database Tables

#### `deployments`
Tracks individual deployment records:
- **Ownership**: groupId, personId, thingId (website)
- **Metadata**: deploymentId, projectName, branch, environment
- **Status**: queued, building, deploying, success, failed, cancelled
- **Metrics**: buildTimeMs, deployTimeMs, totalTimeMs, filesChanged
- **Errors**: errorMessage, errorCode
- **Timestamps**: startedAt, completedAt

**Indexes:**
- `by_group_person` - Filter by group and user
- `by_group_date` - Time-series queries
- `by_project` - Project-specific tracking
- `by_status` - Status filtering
- `by_environment` - Environment filtering

#### `buildMetrics`
Daily aggregated build performance:
- **Tracking**: Date, groupId, personId
- **Statistics**: buildsCompleted, buildsFailed, successRate
- **Performance**: avgBuildTimeMs, minBuildTimeMs, maxBuildTimeMs
- **Coverage**: projectsDeployed, uniqueProjectsDeployed
- **Deployment**: avgDeployTimeMs, avgTotalTimeMs

**Indexes:**
- `by_group_date` - Historical analysis
- `by_person_date` - Individual user trends
- `by_date` - System-wide trends

#### `webVitals`
Core Web Vitals tracking (LCP, FID, CLS):
- **Ownership**: groupId, thingId (website), pageUrl
- **Metrics**: LCP, FID (optional), CLS with ratings
- **Score**: overallScore (0-100)
- **Additional**: FCP, TTFB, interaction time
- **Source**: cloudflare, web_vitals_api, crux, synthetic

**Indexes:**
- `by_group_date` - Group analytics
- `by_thing_date` - Website-specific trends
- `by_url_date` - Page-specific tracking
- `by_date` - System-wide trends

#### `siteUptime`
Site availability and response time tracking:
- **Ownership**: groupId, thingId, siteUrl
- **Metrics**: uptimePercentage, checksPassed/Failed, downtimeMinutes
- **Performance**: avgResponseTimeMs, minResponseTimeMs, maxResponseTimeMs
- **Regional**: regions array with uptime per region
- **Incidents**: alertCount, incidents array
- **Source**: cloudflare, custom_monitor, api_endpoint

**Indexes:**
- `by_group_date` - Group tracking
- `by_thing_date` - Website trends
- `by_url_date` - URL-specific data
- `by_date` - System timeline

#### `deploymentQuotas`
Monthly quota tracking and enforcement:
- **Ownership**: groupId, personId, month (YYYY-MM)
- **Limits**: deploymentsAllowed, buildsAllowed, storageGbAllowed
- **Usage**: deploymentsUsed, buildsUsed, storageGbUsed
- **Status**: active, warning (80%+), exceeded, suspended
- **Enforcement**: enforceLimit, allowOverage

**Indexes:**
- `by_group_month` - Group monthly quotas
- `by_person_month` - User monthly quotas
- `by_month` - System-wide quota usage
- `by_status` - Quota alert status

---

## API Reference

### Mutations

#### `logDeployment`
Log a deployment with metrics.

```typescript
await ctx.runMutation('logDeployment', {
  groupId: v.id('groups'),
  personId: v.id('people'),
  thingId: v.optional(v.id('things')),
  deploymentId: 'deploy_123',
  projectName: 'my-website',
  branch: 'main',
  environment: 'production', // or preview, staging, development
  status: 'success', // or queued, building, deploying, failed, cancelled
  buildTimeMs: 3200,
  deployTimeMs: 1500,
  deploymentUrl: 'https://deploy_123.project.pages.dev',
  productionUrl: 'https://project.pages.dev',
  filesChanged: 45,
  errorMessage: undefined, // Only for failed deployments
  errorCode: undefined,
  metadata: { /* custom data */ }
});
```

**Response**: `deploymentId` (Convex ID)

#### `logBuildMetrics`
Log daily build performance statistics.

```typescript
await ctx.runMutation('logBuildMetrics', {
  groupId: v.id('groups'),
  personId: v.id('people'),
  buildsCompleted: 5,
  buildsFailed: 1,
  avgBuildTimeMs: 3500,
  minBuildTimeMs: 2100,
  maxBuildTimeMs: 5200,
  projectsDeployed: 2,
  uniqueProjectsDeployed: 2,
  avgDeployTimeMs: 1800,
  avgTotalTimeMs: 5300,
  metadata: { /* custom data */ }
});
```

**Response**: `metricsId` (Convex ID)

#### `logWebVitals`
Log Core Web Vitals data.

```typescript
await ctx.runMutation('logWebVitals', {
  groupId: v.id('groups'),
  thingId: v.id('things'), // website
  pageUrl: 'https://example.com',
  lcp: {
    value: 2100, // milliseconds
    rating: 'good', // or needs-improvement, poor
    sampleSize: 150,
    percentile75: 2450
  },
  fid: { // Optional, FID deprecated in favor of INP
    value: 45,
    rating: 'good',
    sampleSize: 150,
    percentile75: 100
  },
  cls: {
    value: 0.05, // dimensionless, 0-1
    rating: 'good',
    sampleSize: 150,
    percentile75: 0.1
  },
  overallScore: 92, // 0-100
  firstContentfulPaint: 1200, // Optional
  timeToFirstByte: 300, // Optional
  interactiveTime: 3800, // Optional
  source: 'cloudflare', // or web_vitals_api, crux, synthetic
  metadata: { /* custom data */ }
});
```

**Response**: `webVitalsId` (Convex ID)

#### `logSiteUptime`
Log site uptime and response time data.

```typescript
await ctx.runMutation('logSiteUptime', {
  groupId: v.id('groups'),
  thingId: v.id('things'), // website
  siteUrl: 'https://example.com',
  uptimePercentage: 99.95,
  downtimeMinutes: 5,
  checksPassed: 1435,
  checksFailed: 1,
  checksTotal: 1436, // Calculated internally
  avgResponseTimeMs: 234,
  minResponseTimeMs: 120,
  maxResponseTimeMs: 890,
  regions: [
    {
      name: 'US-West',
      uptime: 99.99,
      avgResponseTimeMs: 150
    },
    {
      name: 'EU-Central',
      uptime: 99.90,
      avgResponseTimeMs: 350
    }
  ],
  statusPageUrl: 'https://status.example.com',
  alertCount: 2,
  incidents: ['incident_123', 'incident_124'],
  source: 'cloudflare', // or custom_monitor, api_endpoint
  metadata: { /* custom data */ }
});
```

**Response**: `uptimeId` (Convex ID)

#### `updateDeploymentQuota`
Update monthly deployment quota usage.

```typescript
await ctx.runMutation('updateDeploymentQuota', {
  groupId: v.id('groups'),
  personId: v.id('people'),
  deploymentsIncrement: 1,
  buildsIncrement: undefined,
  storageGbIncrement: undefined
});
```

**Response**: `quotaId` (Convex ID)

#### `checkDeploymentQuota`
Check if deployment is allowed (enforces quota).

```typescript
const allowed = await ctx.runMutation('checkDeploymentQuota', {
  groupId: v.id('groups'),
  personId: v.id('people')
});

// Returns:
// {
//   allowed: boolean,
//   deploymentsUsed: number,
//   deploymentsAllowed: number,
//   deploymentsRemaining: number,
//   status: 'ok' | 'warning' | 'exceeded',
//   message: string
// }
```

---

### Queries

#### `getDeploymentMetrics`
Get deployment statistics for a group/user.

```typescript
const metrics = await ctx.runQuery('getDeploymentMetrics', {
  groupId: v.id('groups'),
  personId: v.optional(v.id('people')), // Filter by user
  days: 30 // Time range
});

// Returns:
// {
//   total: number,
//   successful: number,
//   failed: number,
//   successRate: number, // 0-100
//   avgBuildTimeMs: number,
//   avgDeployTimeMs: number,
//   avgTotalTimeMs: number,
//   timeRange: { days: number, startDate: ISO8601 }
// }
```

#### `getBuildMetrics`
Get build performance metrics.

```typescript
const metrics = await ctx.runQuery('getBuildMetrics', {
  groupId: v.id('groups'),
  personId: v.optional(v.id('people')),
  days: 30
});

// Returns aggregated build metrics across the period
```

#### `getWebVitals`
Get Core Web Vitals for a website.

```typescript
const vitals = await ctx.runQuery('getWebVitals', {
  groupId: v.id('groups'),
  thingId: v.id('things'),
  days: 7
});

// Returns:
// {
//   available: boolean,
//   latest: { lcp, fid?, cls, overallScore },
//   trends: { lcp, fid?, cls }, // Direction and percent change
//   avgOverallScore: number,
//   sampleDays: number,
//   timeRange: { days, startDate }
// }
```

#### `getUptimeStatus`
Get site uptime and response time data.

```typescript
const uptime = await ctx.runQuery('getUptimeStatus', {
  groupId: v.id('groups'),
  thingId: v.id('things'),
  days: 30
});

// Returns:
// {
//   available: boolean,
//   latest: { date, uptimePercentage, avgResponseTimeMs, alertCount },
//   aggregated: { avgUptimePercentage, totalDowntimeMinutes, avgResponseTimeMs },
//   regions: [ /* regional data */ ],
//   sampleDays: number,
//   timeRange: { days, startDate }
// }
```

#### `getDeploymentHistory`
Get recent deployments.

```typescript
const history = await ctx.runQuery('getDeploymentHistory', {
  groupId: v.id('groups'),
  personId: v.optional(v.id('people')),
  projectName: v.optional(v.string()),
  limit: 50
});

// Returns array of deployments with latest first
```

#### `getQuotaStatus`
Get current month's deployment quota.

```typescript
const quota = await ctx.runQuery('getQuotaStatus', {
  groupId: v.id('groups'),
  personId: v.optional(v.id('people'))
});

// Returns:
// {
//   month: 'YYYY-MM',
//   status: 'active' | 'warning' | 'exceeded' | 'suspended',
//   deployments: { used, allowed, remaining, percentUsed },
//   builds: { used, allowed, remaining, percentUsed },
//   storage: { used, allowed, remaining, percentUsed },
//   enforceLimit: boolean,
//   allowOverage: boolean
// }
```

#### `getAnalyticsDashboard`
Comprehensive analytics dashboard combining all metrics.

```typescript
const dashboard = await ctx.runQuery('getAnalyticsDashboard', {
  groupId: v.id('groups'),
  personId: v.optional(v.id('people'))
});

// Returns:
// {
//   period: { days, startDate },
//   deployments: { /* metrics */ },
//   builds: { /* metrics */ },
//   quota: { /* quota status */ },
//   recent: { deployments: [ /* last 5 */ ] }
// }
```

---

## Integration Guide

### With Cloudflare Pages

Integrate deployment tracking with Cloudflare:

```typescript
// After Cloudflare deployment
await ctx.runMutation('logDeployment', {
  groupId,
  personId,
  deploymentId: deployment.id, // From Cloudflare API
  projectName: deployment.project_name,
  environment: 'production',
  status: 'success',
  buildTimeMs: deployment.build_time,
  deployTimeMs: deployment.deploy_time,
  deploymentUrl: deployment.url,
  productionUrl: deployment.production_url,
  filesChanged: deployment.files_changed
});
```

### With Cloudflare Analytics

Ingest Core Web Vitals from Cloudflare:

```typescript
// Fetch from Cloudflare Insights API
const vitals = await cloudflareInsights.getWebVitals(siteUrl);

await ctx.runMutation('logWebVitals', {
  groupId,
  thingId,
  pageUrl: siteUrl,
  lcp: vitals.lcp,
  fid: vitals.fid,
  cls: vitals.cls,
  overallScore: vitals.overall_score,
  source: 'cloudflare'
});
```

### With Uptime Monitors

Track uptime from monitoring services:

```typescript
// From Cloudflare Radar or custom monitor
const uptimeData = await monitor.getStatus(siteUrl);

await ctx.runMutation('logSiteUptime', {
  groupId,
  thingId,
  siteUrl,
  uptimePercentage: uptimeData.uptime_percent,
  downtimeMinutes: uptimeData.downtime_minutes,
  checksPassed: uptimeData.checks_passed,
  checksFailed: uptimeData.checks_failed,
  avgResponseTimeMs: uptimeData.avg_response_time,
  minResponseTimeMs: uptimeData.min_response_time,
  maxResponseTimeMs: uptimeData.max_response_time,
  source: 'cloudflare'
});
```

---

## Quota Enforcement

### Monthly Quotas

Quotas reset on the 1st of each month:

```typescript
// Starter Plan
deploymentsAllowed: 100
buildsAllowed: 500
storageGbAllowed: 50

// Pro Plan
deploymentsAllowed: 1000
buildsAllowed: 5000
storageGbAllowed: 500

// Enterprise
deploymentsAllowed: unlimited
buildsAllowed: unlimited
storageGbAllowed: custom
```

### Status Levels

- **`active`** - 0-79% used
- **`warning`** - 80-99% used (alerts sent)
- **`exceeded`** - 100%+ used (deployments blocked if enforceLimit)
- **`suspended`** - Organization suspended by admin

### Enforcement Options

```typescript
// Soft limit - allows overages
enforceLimit: false
allowOverage: true
// User can still deploy, but marked as overage

// Hard limit - blocks operations
enforceLimit: true
allowOverage: false
// Deployment rejected with quota error
```

---

## Performance Metrics

### Build Performance

Typical targets:
- **Build time**: < 3 seconds
- **Deploy time**: < 2 seconds
- **Total time**: < 5 seconds
- **Success rate**: > 95%

### Web Vitals Targets (Google CWV)

**Good:**
- LCP: < 2.5 seconds
- FID: < 100 milliseconds
- CLS: < 0.1

**Needs Improvement:**
- LCP: 2.5 - 4 seconds
- FID: 100 - 300 milliseconds
- CLS: 0.1 - 0.25

**Poor:**
- LCP: > 4 seconds
- FID: > 300 milliseconds
- CLS: > 0.25

### Uptime Targets

- **99.9%** (3 nines) - < 43 minutes downtime/month
- **99.99%** (4 nines) - < 4 minutes downtime/month
- **99.999%** (5 nines) - < 26 seconds downtime/month

---

## Health Analysis

### Deployment Health

The system analyzes deployment health:

```typescript
// Excellent: success rate > 95%
// Good: success rate > 80%
// Needs improvement: success rate > 60%
// Poor: success rate < 60%
```

### Web Vitals Health

```typescript
// Excellent: overall score > 90
// Good: overall score > 75
// Needs improvement: overall score > 50
// Poor: overall score < 50
```

### Uptime Health

```typescript
// Excellent: uptime > 99.9%
// Good: uptime > 99%
// Needs improvement: uptime > 95%
// Poor: uptime < 95%
```

---

## Recommendations

The system provides actionable recommendations:

**Deployment Issues:**
- Investigate failed deployments
- Optimize build pipeline
- Parallelize build steps

**Web Vitals Issues:**
- Optimize LCP: improve server response, minify CSS, optimize images
- Improve FID: break down long tasks, defer non-critical work
- Fix CLS: add explicit dimensions, avoid inserting above content

**Uptime Issues:**
- Implement redundancy and failover
- Optimize response time with CDN
- Review database queries and caching

---

## Alerting

Alerts are triggered for:

- Deployment failures (status = failed)
- Quota warnings (80%+ used)
- Quota exceeded (100%+ used)
- Web Vitals degradation (> 5% change)
- Uptime below target (< 99%)
- Response time above target (> 1000ms)

---

## Troubleshooting

### Deployments not being tracked

1. Check that `logDeployment` is called after Cloudflare deployment
2. Verify `groupId` and `personId` are valid
3. Check deployment status is one of: queued, building, deploying, success, failed, cancelled

### Quotas not enforcing

1. Ensure `updateDeploymentQuota` is called for each deployment
2. Check `enforceLimit` setting (default: true)
3. Verify quota record exists for current month

### Web Vitals missing

1. Check integration with Cloudflare Insights or web_vitals API
2. Verify `source` field is one of: cloudflare, web_vitals_api, crux, synthetic
3. Ensure website has sufficient traffic for metrics

---

## Best Practices

### 1. Log Events Consistently
Always log deployment events immediately after completion:
```typescript
// Success case
await logDeployment({ status: 'success', ... });

// Failure case
await logDeployment({
  status: 'failed',
  errorMessage: 'Build failed',
  errorCode: 'BUILD_ERROR'
});
```

### 2. Monitor Trends
Review metrics weekly:
- Deployment success rate
- Build performance trends
- Web Vitals trends
- Uptime status

### 3. Act on Alerts
When quota reaches warning (80%):
1. Alert user
2. Suggest upgrade
3. Or reduce usage

### 4. Regular Maintenance
- Clean up old deployment records (archive after 90 days)
- Review quotas annually
- Update performance targets

---

## Related Documents

- `/one/knowledge/architecture.md` - System architecture
- `/one/connections/patterns.md` - Mutation/Query patterns
- `/one/knowledge/ontology.md` - 6-dimension model
- `/backend/CLAUDE.md` - Backend development guide

---

**Built with monitoring-first principles: measure everything, alert meaningfully, improve continuously.**
