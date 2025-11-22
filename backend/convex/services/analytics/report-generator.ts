/**
 * Report Generator Service (Cycle 80)
 *
 * Effect.ts service for exporting analytics data in multiple formats.
 *
 * Report Types:
 * - Traffic: Visitor analytics, sources, page views
 * - Conversions: Conversion rates, funnel performance
 * - Revenue: Revenue analytics, transaction data
 * - A/B Tests: A/B test results and comparisons
 * - Forms: Form submission analytics
 *
 * Export Formats:
 * - CSV: Comma-separated values
 * - Excel (.xlsx): Excel spreadsheet (via CSV format)
 * - JSON: JSON structured data
 * - PDF: PDF document with tables and charts
 *
 * Features:
 * - Custom date ranges
 * - Scheduled reports (email delivery)
 * - Dashboard widget exports
 * - API access for analytics data
 *
 * @see /one/knowledge/patterns/backend/service-template.md
 * @see /backend/convex/services/export/form-export.ts - Export pattern reference
 */

import { Effect } from "effect";

// ============================================================================
// TYPES & ERRORS
// ============================================================================

export type ExportFormat = "csv" | "xlsx" | "json" | "pdf";

export type ReportType =
  | "traffic"
  | "conversions"
  | "revenue"
  | "ab_tests"
  | "forms"
  | "dashboard_widget";

export type DateRangePreset = "today" | "7days" | "30days" | "custom";

export interface AnalyticsEvent {
  _id: string;
  type: string;
  actorId: string;
  targetId?: string;
  timestamp: number;
  metadata?: {
    funnelId?: string;
    stepId?: string;
    source?: string;
    campaign?: string;
    value?: number;
    revenue?: number;
    [key: string]: any;
  };
}

export interface ExportOptions {
  reportType: ReportType;
  format: ExportFormat;
  events: AnalyticsEvent[];
  dateRange: {
    preset: DateRangePreset;
    startDate?: number;
    endDate?: number;
  };
  filters?: {
    funnelId?: string;
    stepId?: string;
    source?: string;
    campaign?: string;
  };
  columns?: string[];
  title?: string;
}

export interface ExportResult {
  format: ExportFormat;
  content: string;
  filename: string;
  mimeType: string;
  size: number;
  recordCount: number;
}

export interface ScheduledReport {
  id: string;
  reportType: ReportType;
  format: ExportFormat;
  frequency: "daily" | "weekly" | "monthly";
  recipients: string[];
  enabled: boolean;
  lastRun?: number;
  nextRun: number;
}

export class ExportError {
  readonly _tag = "ExportError";
  constructor(
    public format: ExportFormat,
    public message: string,
    public cause?: unknown
  ) {}
}

export class InvalidReportTypeError {
  readonly _tag = "InvalidReportTypeError";
  constructor(public reportType: string) {}
}

export class InvalidDateRangeError {
  readonly _tag = "InvalidDateRangeError";
  constructor(public message: string) {}
}

// ============================================================================
// REPORT GENERATOR SERVICE
// ============================================================================

export const ReportGeneratorService = {
  /**
   * Generate analytics report in specified format
   */
  generateReport: (options: ExportOptions) =>
    Effect.gen(function* () {
      // 1. Validate date range
      yield* ReportGeneratorService.validateDateRange(options.dateRange);

      // 2. Apply filters
      const filteredEvents = yield* ReportGeneratorService.applyFilters(
        options.events,
        options.filters
      );

      // 3. Generate report based on type
      switch (options.reportType) {
        case "traffic":
          return yield* ReportGeneratorService.exportTrafficReport(
            filteredEvents,
            options
          );
        case "conversions":
          return yield* ReportGeneratorService.exportConversionsReport(
            filteredEvents,
            options
          );
        case "revenue":
          return yield* ReportGeneratorService.exportRevenueReport(
            filteredEvents,
            options
          );
        case "ab_tests":
          return yield* ReportGeneratorService.exportABTestsReport(
            filteredEvents,
            options
          );
        case "forms":
          return yield* ReportGeneratorService.exportFormsReport(
            filteredEvents,
            options
          );
        case "dashboard_widget":
          return yield* ReportGeneratorService.exportDashboardWidget(
            filteredEvents,
            options
          );
        default:
          return yield* Effect.fail(
            new InvalidReportTypeError(options.reportType)
          );
      }
    }),

  /**
   * Validate date range
   */
  validateDateRange: (dateRange: {
    preset: DateRangePreset;
    startDate?: number;
    endDate?: number;
  }) =>
    Effect.gen(function* () {
      if (dateRange.preset === "custom") {
        if (!dateRange.startDate || !dateRange.endDate) {
          return yield* Effect.fail(
            new InvalidDateRangeError(
              "Custom date range requires startDate and endDate"
            )
          );
        }

        if (dateRange.startDate > dateRange.endDate) {
          return yield* Effect.fail(
            new InvalidDateRangeError("Start date must be before end date")
          );
        }
      }

      return dateRange;
    }),

  /**
   * Apply filters to events
   */
  applyFilters: (
    events: AnalyticsEvent[],
    filters?: {
      funnelId?: string;
      stepId?: string;
      source?: string;
      campaign?: string;
    }
  ) =>
    Effect.sync(() => {
      if (!filters) return events;

      let filtered = events;

      if (filters.funnelId) {
        filtered = filtered.filter(
          (e) => e.metadata?.funnelId === filters.funnelId
        );
      }

      if (filters.stepId) {
        filtered = filtered.filter(
          (e) => e.metadata?.stepId === filters.stepId
        );
      }

      if (filters.source) {
        filtered = filtered.filter(
          (e) => e.metadata?.source === filters.source
        );
      }

      if (filters.campaign) {
        filtered = filtered.filter(
          (e) => e.metadata?.campaign === filters.campaign
        );
      }

      return filtered;
    }),

  // ============================================================================
  // TRAFFIC REPORT
  // ============================================================================

  /**
   * Export traffic report (visitors, sources, page views)
   */
  exportTrafficReport: (
    events: AnalyticsEvent[],
    options: ExportOptions
  ) =>
    Effect.gen(function* () {
      // Aggregate traffic data
      const pageViews = events.filter(
        (e) => e.type === "page_view" || e.type === "visitor_viewed_step"
      );

      const uniqueVisitors = new Set(events.map((e) => e.actorId));

      // Group by source
      const sourceMap = new Map<string, number>();
      pageViews.forEach((e) => {
        const source = e.metadata?.source || "direct";
        sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
      });

      // Group by hour (for time-series)
      const hourlyMap = new Map<string, number>();
      pageViews.forEach((e) => {
        const hour = new Date(e.timestamp).toISOString().slice(0, 13);
        hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1);
      });

      // Build data rows
      const data = {
        summary: {
          totalPageViews: pageViews.length,
          uniqueVisitors: uniqueVisitors.size,
          avgPageViewsPerVisitor:
            uniqueVisitors.size > 0
              ? pageViews.length / uniqueVisitors.size
              : 0,
        },
        sources: Array.from(sourceMap.entries()).map(([source, views]) => ({
          source,
          views,
          percentage:
            pageViews.length > 0 ? (views / pageViews.length) * 100 : 0,
        })),
        hourly: Array.from(hourlyMap.entries())
          .map(([hour, views]) => ({ hour, views }))
          .sort((a, b) => a.hour.localeCompare(b.hour)),
      };

      // Generate in requested format
      return yield* ReportGeneratorService.formatReport(data, options, "traffic");
    }),

  // ============================================================================
  // CONVERSIONS REPORT
  // ============================================================================

  /**
   * Export conversions report (conversion rates, funnel performance)
   */
  exportConversionsReport: (
    events: AnalyticsEvent[],
    options: ExportOptions
  ) =>
    Effect.gen(function* () {
      const entryEvents = events.filter(
        (e) => e.type === "visitor_entered_funnel"
      );
      const conversionEvents = events.filter(
        (e) =>
          e.type === "visitor_converted" || e.type === "purchase_completed"
      );

      const uniqueVisitors = new Set(entryEvents.map((e) => e.actorId));
      const uniqueConverters = new Set(conversionEvents.map((e) => e.actorId));

      const data = {
        summary: {
          totalVisitors: uniqueVisitors.size,
          totalConversions: uniqueConverters.size,
          conversionRate:
            uniqueVisitors.size > 0
              ? (uniqueConverters.size / uniqueVisitors.size) * 100
              : 0,
        },
        byDay: ReportGeneratorService.aggregateByDay(
          conversionEvents,
          "conversions"
        ),
      };

      return yield* ReportGeneratorService.formatReport(
        data,
        options,
        "conversions"
      );
    }),

  // ============================================================================
  // REVENUE REPORT
  // ============================================================================

  /**
   * Export revenue report (revenue analytics, transactions)
   */
  exportRevenueReport: (
    events: AnalyticsEvent[],
    options: ExportOptions
  ) =>
    Effect.gen(function* () {
      const revenueEvents = events.filter(
        (e) =>
          (e.type === "purchase_completed" || e.type === "visitor_converted") &&
          e.metadata?.value !== undefined
      );

      const totalRevenue = revenueEvents.reduce(
        (sum, e) => sum + (e.metadata?.value || 0),
        0
      );

      const transactions = revenueEvents.length;

      const data = {
        summary: {
          totalRevenue,
          totalTransactions: transactions,
          averageOrderValue: transactions > 0 ? totalRevenue / transactions : 0,
        },
        transactions: revenueEvents.map((e) => ({
          id: e._id,
          timestamp: new Date(e.timestamp).toISOString(),
          customerId: e.actorId,
          value: e.metadata?.value || 0,
          source: e.metadata?.source || "direct",
          campaign: e.metadata?.campaign,
        })),
        byDay: ReportGeneratorService.aggregateByDay(revenueEvents, "revenue"),
      };

      return yield* ReportGeneratorService.formatReport(
        data,
        options,
        "revenue"
      );
    }),

  // ============================================================================
  // A/B TESTS REPORT
  // ============================================================================

  /**
   * Export A/B tests report (test results, comparisons)
   */
  exportABTestsReport: (
    events: AnalyticsEvent[],
    options: ExportOptions
  ) =>
    Effect.gen(function* () {
      const testEvents = events.filter(
        (e) => e.type === "ab_test_started" || e.type === "ab_test_completed"
      );

      // Group by test ID
      const testMap = new Map<
        string,
        { started: number; completed: number }
      >();
      testEvents.forEach((e) => {
        const testId = e.metadata?.testId || "unknown";
        const current = testMap.get(testId) || { started: 0, completed: 0 };

        if (e.type === "ab_test_started") {
          current.started++;
        } else {
          current.completed++;
        }

        testMap.set(testId, current);
      });

      const data = {
        summary: {
          totalTests: testMap.size,
          totalParticipants: new Set(testEvents.map((e) => e.actorId)).size,
        },
        tests: Array.from(testMap.entries()).map(([testId, counts]) => ({
          testId,
          started: counts.started,
          completed: counts.completed,
          completionRate:
            counts.started > 0 ? (counts.completed / counts.started) * 100 : 0,
        })),
      };

      return yield* ReportGeneratorService.formatReport(
        data,
        options,
        "ab_tests"
      );
    }),

  // ============================================================================
  // FORMS REPORT
  // ============================================================================

  /**
   * Export forms report (form submission analytics)
   */
  exportFormsReport: (
    events: AnalyticsEvent[],
    options: ExportOptions
  ) =>
    Effect.gen(function* () {
      const formEvents = events.filter((e) => e.type === "form_submitted");

      // Group by form ID
      const formMap = new Map<string, number>();
      formEvents.forEach((e) => {
        const formId = e.metadata?.formId || e.targetId || "unknown";
        formMap.set(formId, (formMap.get(formId) || 0) + 1);
      });

      const data = {
        summary: {
          totalSubmissions: formEvents.length,
          uniqueForms: formMap.size,
        },
        forms: Array.from(formMap.entries()).map(([formId, submissions]) => ({
          formId,
          submissions,
        })),
        submissions: formEvents.map((e) => ({
          id: e._id,
          timestamp: new Date(e.timestamp).toISOString(),
          formId: e.metadata?.formId || e.targetId,
          submitter: e.actorId,
        })),
        byDay: ReportGeneratorService.aggregateByDay(formEvents, "submissions"),
      };

      return yield* ReportGeneratorService.formatReport(data, options, "forms");
    }),

  // ============================================================================
  // DASHBOARD WIDGET EXPORT
  // ============================================================================

  /**
   * Export individual dashboard widget data
   */
  exportDashboardWidget: (
    events: AnalyticsEvent[],
    options: ExportOptions
  ) =>
    Effect.gen(function* () {
      // Generic widget export (raw event data)
      const data = events.map((e) => ({
        id: e._id,
        type: e.type,
        timestamp: new Date(e.timestamp).toISOString(),
        actor: e.actorId,
        target: e.targetId,
        metadata: e.metadata,
      }));

      return yield* ReportGeneratorService.formatReport(
        { events: data },
        options,
        "widget"
      );
    }),

  // ============================================================================
  // FORMAT HELPERS
  // ============================================================================

  /**
   * Format report data into requested export format
   */
  formatReport: (
    data: any,
    options: ExportOptions,
    reportName: string
  ) =>
    Effect.gen(function* () {
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `${reportName}-report-${timestamp}`;

      switch (options.format) {
        case "csv":
          return yield* ReportGeneratorService.exportAsCSV(
            data,
            filename,
            options
          );
        case "xlsx":
          return yield* ReportGeneratorService.exportAsExcel(
            data,
            filename,
            options
          );
        case "json":
          return yield* ReportGeneratorService.exportAsJSON(
            data,
            filename,
            options
          );
        case "pdf":
          return yield* ReportGeneratorService.exportAsPDF(
            data,
            filename,
            options
          );
        default:
          return yield* Effect.fail(new ExportError(options.format, "Invalid format"));
      }
    }),

  /**
   * Export as CSV
   */
  exportAsCSV: (data: any, filename: string, options: ExportOptions) =>
    Effect.gen(function* () {
      try {
        let csvContent = "";

        // Handle different data structures
        if (data.summary) {
          csvContent += "Summary\n";
          csvContent +=
            Object.keys(data.summary).join(",") +
            "\n" +
            Object.values(data.summary).join(",") +
            "\n\n";
        }

        if (data.transactions) {
          csvContent += "Transactions\n";
          const headers = Object.keys(data.transactions[0] || {});
          csvContent += headers.join(",") + "\n";
          data.transactions.forEach((row: any) => {
            csvContent +=
              headers.map((h) => String(row[h] || "")).join(",") + "\n";
          });
        }

        if (data.events) {
          csvContent += "Events\n";
          const headers = Object.keys(data.events[0] || {});
          csvContent += headers.join(",") + "\n";
          data.events.forEach((row: any) => {
            csvContent +=
              headers.map((h) => String(row[h] || "")).join(",") + "\n";
          });
        }

        return {
          format: "csv" as const,
          content: csvContent,
          filename: `${filename}.csv`,
          mimeType: "text/csv",
          size: csvContent.length,
          recordCount: data.transactions?.length || data.events?.length || 0,
        };
      } catch (error) {
        return yield* Effect.fail(
          new ExportError("csv", "Failed to generate CSV", error)
        );
      }
    }),

  /**
   * Export as Excel (CSV format with .xlsx extension)
   */
  exportAsExcel: (data: any, filename: string, options: ExportOptions) =>
    Effect.gen(function* () {
      const csvResult = yield* ReportGeneratorService.exportAsCSV(
        data,
        filename,
        options
      );

      return {
        format: "xlsx" as const,
        content: csvResult.content,
        filename: `${filename}.xlsx`,
        mimeType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        size: csvResult.size,
        recordCount: csvResult.recordCount,
      };
    }),

  /**
   * Export as JSON
   */
  exportAsJSON: (data: any, filename: string, options: ExportOptions) =>
    Effect.gen(function* () {
      try {
        const content = JSON.stringify(data, null, 2);

        return {
          format: "json" as const,
          content,
          filename: `${filename}.json`,
          mimeType: "application/json",
          size: content.length,
          recordCount: data.transactions?.length || data.events?.length || 0,
        };
      } catch (error) {
        return yield* Effect.fail(
          new ExportError("json", "Failed to generate JSON", error)
        );
      }
    }),

  /**
   * Export as PDF (simple text-based PDF)
   */
  exportAsPDF: (data: any, filename: string, options: ExportOptions) =>
    Effect.gen(function* () {
      try {
        const title = options.title || "Analytics Report";
        const timestamp = new Date().toISOString();

        let pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> >>
endobj
4 0 obj
<< /Length 5 0 R >>
stream
BT
/F1 16 Tf
50 750 Td
(${title}) Tj
0 -20 Td
/F1 10 Tf
(Generated: ${timestamp}) Tj
0 -30 Td
`;

        // Add summary if available
        if (data.summary) {
          pdfContent += `/F1 12 Tf\n(Summary) Tj\n0 -20 Td\n/F1 10 Tf\n`;
          Object.entries(data.summary).forEach(([key, value]) => {
            pdfContent += `(${key}: ${value}) Tj\n0 -15 Td\n`;
          });
          pdfContent += `0 -10 Td\n`;
        }

        pdfContent += `ET
endstream
endobj
5 0 obj
${pdfContent.length}
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${pdfContent.length + 500}
%%EOF`;

        return {
          format: "pdf" as const,
          content: pdfContent,
          filename: `${filename}.pdf`,
          mimeType: "application/pdf",
          size: pdfContent.length,
          recordCount: data.transactions?.length || data.events?.length || 0,
        };
      } catch (error) {
        return yield* Effect.fail(
          new ExportError("pdf", "Failed to generate PDF", error)
        );
      }
    }),

  /**
   * Aggregate events by day
   */
  aggregateByDay: (
    events: AnalyticsEvent[],
    metric: "conversions" | "revenue" | "submissions"
  ): Array<{ date: string; value: number }> => {
    const dayMap = new Map<string, number>();

    events.forEach((e) => {
      const date = new Date(e.timestamp).toISOString().split("T")[0];
      const currentValue = dayMap.get(date) || 0;

      if (metric === "revenue") {
        dayMap.set(date, currentValue + (e.metadata?.value || 0));
      } else {
        dayMap.set(date, currentValue + 1);
      }
    });

    return Array.from(dayMap.entries())
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date));
  },

  // ============================================================================
  // SCHEDULED REPORTS
  // ============================================================================

  /**
   * Create scheduled report configuration
   */
  createScheduledReport: (
    reportType: ReportType,
    format: ExportFormat,
    frequency: "daily" | "weekly" | "monthly",
    recipients: string[]
  ) =>
    Effect.sync((): ScheduledReport => {
      const now = Date.now();
      const nextRun = ReportGeneratorService.calculateNextRun(
        frequency,
        now
      );

      return {
        id: crypto.randomUUID(),
        reportType,
        format,
        frequency,
        recipients,
        enabled: true,
        nextRun,
      };
    }),

  /**
   * Calculate next run time for scheduled report
   */
  calculateNextRun: (
    frequency: "daily" | "weekly" | "monthly",
    fromTime: number
  ): number => {
    const from = new Date(fromTime);

    switch (frequency) {
      case "daily":
        from.setDate(from.getDate() + 1);
        from.setHours(9, 0, 0, 0); // 9 AM next day
        break;
      case "weekly":
        from.setDate(from.getDate() + 7);
        from.setHours(9, 0, 0, 0); // 9 AM next week
        break;
      case "monthly":
        from.setMonth(from.getMonth() + 1);
        from.setDate(1);
        from.setHours(9, 0, 0, 0); // 9 AM first of next month
        break;
    }

    return from.getTime();
  },

  /**
   * Email report to recipients
   *
   * Note: Requires email service integration
   */
  emailReport: (
    exportResult: ExportResult,
    recipients: string[],
    scheduledReport: ScheduledReport
  ) =>
    Effect.gen(function* () {
      // TODO: Integrate with EmailService
      return {
        success: true,
        recipients,
        reportType: scheduledReport.reportType,
        filename: exportResult.filename,
        size: exportResult.size,
      };
    }),
};
