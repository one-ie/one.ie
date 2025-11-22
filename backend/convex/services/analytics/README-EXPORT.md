# Analytics Export & Reports

**Cycle 80 - Complete**

Export analytics data in multiple formats (CSV, Excel, JSON, PDF) for external analysis and scheduled reporting.

---

## Quick Start

### Frontend Usage

```tsx
import { ExportReportModal } from "@/components/analytics/ExportReportModal";

// Basic usage
<ExportReportModal />

// Pre-selected report type
<ExportReportModal defaultReportType="revenue" />

// With filters
<ExportReportModal
  defaultFilters={{
    funnelId: "funnel_id",
    source: "email",
  }}
/>
```

### Backend Usage

```typescript
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const exportReport = useMutation(api.mutations.analytics.exportReport);

const result = await exportReport({
  reportType: "conversions",
  format: "csv",
  dateRange: { preset: "30days" },
});

// Download file
const blob = new Blob([result.content], { type: result.mimeType });
const url = URL.createObjectURL(blob);
const link = document.createElement("a");
link.href = url;
link.download = result.filename;
link.click();
```

---

## Report Types

### 1. Traffic Report

**Type:** `"traffic"`

**Data:**
- Total page views
- Unique visitors
- Average page views per visitor
- Traffic sources breakdown (direct, email, organic, etc.)
- Hourly time-series data

**Use cases:**
- Understand visitor behavior
- Identify traffic sources
- Optimize marketing campaigns

### 2. Conversions Report

**Type:** `"conversions"`

**Data:**
- Total visitors
- Total conversions
- Conversion rate (%)
- Daily conversion trends

**Use cases:**
- Track funnel performance
- Measure conversion rates
- Identify conversion patterns

### 3. Revenue Report

**Type:** `"revenue"`

**Data:**
- Total revenue
- Total transactions
- Average order value
- Transaction details (ID, timestamp, customer, value, source)
- Daily revenue trends

**Use cases:**
- Financial analysis
- Revenue forecasting
- Customer value tracking

### 4. A/B Tests Report

**Type:** `"ab_tests"`

**Data:**
- Total tests
- Total participants
- Test-by-test breakdown (started, completed, completion rate)

**Use cases:**
- Compare test variants
- Measure test effectiveness
- Optimize landing pages

### 5. Forms Report

**Type:** `"forms"`

**Data:**
- Total submissions
- Unique forms
- Form-by-form breakdown
- Daily submission trends

**Use cases:**
- Track lead generation
- Measure form effectiveness
- Identify form issues

---

## Export Formats

### CSV (Comma-separated values)

**Format:** `"csv"`
**Mime Type:** `text/csv`
**File Extension:** `.csv`

**Best for:**
- Excel/Google Sheets import
- Data analysis tools
- Universal compatibility

**Structure:**
```csv
Summary
totalPageViews,uniqueVisitors,avgPageViewsPerVisitor
1234,567,2.18

Transactions
id,timestamp,customerId,value,source
abc123,2025-01-15T10:30:00Z,customer_1,99.99,email
```

### Excel (.xlsx)

**Format:** `"xlsx"`
**Mime Type:** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
**File Extension:** `.xlsx`

**Best for:**
- Microsoft Excel
- Business reports
- Formatted spreadsheets

**Note:** Currently generates CSV format compatible with Excel. For true .xlsx format with formatting, consider integrating `exceljs` library.

### JSON (Structured data)

**Format:** `"json"`
**Mime Type:** `application/json`
**File Extension:** `.json`

**Best for:**
- API integrations
- Developer tools
- Nested data structures

**Structure:**
```json
{
  "summary": {
    "totalRevenue": 12345.67,
    "totalTransactions": 89,
    "averageOrderValue": 138.72
  },
  "transactions": [
    {
      "id": "abc123",
      "timestamp": "2025-01-15T10:30:00Z",
      "customerId": "customer_1",
      "value": 99.99,
      "source": "email"
    }
  ],
  "byDay": [
    { "date": "2025-01-15", "value": 299.97 }
  ]
}
```

### PDF (Document)

**Format:** `"pdf"`
**Mime Type:** `application/pdf`
**File Extension:** `.pdf`

**Best for:**
- Presentations
- Shareable reports
- Summary views

**Note:** Currently generates simple text-based PDF with summary data. For rich PDFs with charts, consider integrating `PDFKit` or `jsPDF` library.

---

## Date Ranges

### Presets

```typescript
// Today (midnight to now)
{ preset: "today" }

// Last 7 days
{ preset: "7days" }

// Last 30 days (default)
{ preset: "30days" }
```

### Custom Range

```typescript
{
  preset: "custom",
  startDate: new Date("2025-01-01").getTime(),
  endDate: new Date("2025-01-31").getTime(),
}
```

**Validation:**
- Custom range requires both `startDate` and `endDate`
- `startDate` must be before `endDate`
- Dates are in Unix timestamp (milliseconds)

---

## Filters (Optional)

```typescript
{
  filters: {
    funnelId: "funnel_abc123",    // Filter by specific funnel
    stepId: "step_xyz789",         // Filter by specific step
    source: "email",               // Filter by traffic source
    campaign: "summer_sale",       // Filter by campaign
  }
}
```

**Supported values:**
- `funnelId`: Thing ID (type: "funnel")
- `stepId`: Thing ID (type: "funnel_step")
- `source`: "ad" | "email" | "organic" | "referral" | "social" | "direct" | "other"
- `campaign`: String (campaign name)

---

## Multi-Tenant Security

✅ **Automatic isolation:** Users can only export data from their own organization

**How it works:**
1. User authentication required
2. User's `groupId` retrieved
3. Events filtered by actor's `groupId`
4. No cross-organization data leakage

**Security guarantees:**
- ❌ Users cannot export other organizations' data
- ❌ Unauthenticated requests are rejected
- ✅ All exports are scoped to user's organization
- ✅ Audit trail via `analytics_generated` event

---

## Event Logging

Every export creates an `analytics_generated` event:

```typescript
{
  type: "analytics_generated",
  actorId: person._id,
  targetId: person.groupId,
  timestamp: Date.now(),
  metadata: {
    reportType: "revenue",
    format: "csv",
    dateRange: { preset: "30days" },
    recordCount: 1234,
    fileSize: 45678,
    filename: "revenue-report-2025-01-15.csv",
    protocol: "analytics-export",
  }
}
```

**Use cases:**
- Audit trail (who exported what, when)
- Usage analytics (which reports are popular)
- Compliance tracking
- Debugging export issues

---

## Error Handling

### Authentication Errors

```typescript
try {
  await exportReport({ ... });
} catch (error) {
  // "Not authenticated"
  // Solution: User must sign in
}
```

### Invalid Report Type

```typescript
try {
  await exportReport({
    reportType: "invalid_type", // ❌
    ...
  });
} catch (error) {
  // "Invalid report type: invalid_type"
  // Solution: Use one of: traffic, conversions, revenue, ab_tests, forms
}
```

### Invalid Date Range

```typescript
try {
  await exportReport({
    dateRange: {
      preset: "custom",
      startDate: Date.now(),
      endDate: Date.now() - 7 * 24 * 60 * 60 * 1000, // ❌ End before start
    },
    ...
  });
} catch (error) {
  // "Invalid date range: Start date must be before end date"
  // Solution: Ensure startDate < endDate
}
```

### Export Generation Errors

```typescript
try {
  await exportReport({ ... });
} catch (error) {
  // "Export failed: <specific error>"
  // Solution: Check service logs, verify data integrity
}
```

---

## Performance Considerations

### Query Optimization

- ✅ Uses `by_time` index on events table
- ✅ Filter-then-aggregate pattern (reduces memory)
- ✅ Limit date range to avoid large queries

### Export Size Limits

| Format | Recommended Max | Hard Limit |
|--------|-----------------|------------|
| CSV    | 100K records    | Memory-bound |
| Excel  | 100K records    | Excel import limits |
| JSON   | 50K records     | Memory-bound |
| PDF    | 30 rows         | Readability limit |

**For large datasets:**
- Use filters to reduce data
- Export in batches (multiple date ranges)
- Consider scheduled reports (coming soon)

### Client-Side Download

- ✅ File generation happens in browser (no server load)
- ✅ Uses Blob API for efficient downloads
- ✅ No temporary files on server

---

## Scheduled Reports (Coming Soon)

**Planned features:**

```typescript
// Create scheduled report
const scheduledReport = await createScheduledReport({
  reportType: "revenue",
  format: "xlsx",
  frequency: "weekly",
  recipients: ["user@example.com"],
});

// Email report automatically
// Daily: 9 AM every day
// Weekly: 9 AM every Monday
// Monthly: 9 AM first of month
```

**Requirements:**
- Email service integration (Resend/SendGrid)
- Cron job or scheduled function
- Email templates for reports

---

## API Access (Coming Soon)

**Planned features:**

```bash
# REST API for external access
curl -X POST https://api.one.ie/analytics/export \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "reportType": "revenue",
    "format": "json",
    "dateRange": { "preset": "30days" }
  }'
```

**Requirements:**
- REST API endpoint
- API key authentication
- Rate limiting

---

## Examples

### Example 1: Monthly Revenue Report

```typescript
const result = await exportReport({
  reportType: "revenue",
  format: "xlsx",
  dateRange: { preset: "30days" },
  title: "Monthly Revenue Report",
});

// Result:
// {
//   success: true,
//   content: "...",
//   filename: "revenue-report-2025-01-15.xlsx",
//   mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//   size: 12345,
//   recordCount: 567
// }
```

### Example 2: Funnel Conversions (Custom Date Range)

```typescript
const result = await exportReport({
  reportType: "conversions",
  format: "csv",
  dateRange: {
    preset: "custom",
    startDate: new Date("2025-01-01").getTime(),
    endDate: new Date("2025-01-31").getTime(),
  },
  filters: {
    funnelId: "funnel_abc123",
  },
  title: "January Funnel Conversions",
});
```

### Example 3: Traffic Sources (JSON for API)

```typescript
const result = await exportReport({
  reportType: "traffic",
  format: "json",
  dateRange: { preset: "7days" },
});

// Parse JSON
const data = JSON.parse(result.content);
console.log(data.sources); // [{ source: "email", views: 1234, percentage: 45.6 }]
```

---

## Files Reference

- **Service:** `/backend/convex/services/analytics/report-generator.ts`
- **Mutation:** `/backend/convex/mutations/analytics.ts` (exportReport)
- **Component:** `/web/src/components/analytics/ExportReportModal.tsx`
- **Example Page:** `/web/src/pages/examples/analytics-export.astro`
- **Documentation:** `/one/events/cycle-080-analytics-export.md`

---

## Support

**Issues?** File an issue with:
- Report type
- Export format
- Date range
- Error message
- Expected vs actual behavior

**Feature requests?** Suggest improvements for:
- New report types
- Export formats
- Filters
- Scheduled reports
- API access
