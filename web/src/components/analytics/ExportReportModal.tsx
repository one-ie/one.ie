/**
 * ExportReportModal - Modal for configuring analytics report exports
 *
 * Features:
 * - Report type selection (Traffic, Conversions, Revenue, A/B Tests, Forms)
 * - Export format selection (CSV, Excel, PDF, JSON)
 * - Date range picker (Today, 7 days, 30 days, Custom)
 * - Optional filters (funnel, step, source, campaign)
 * - Download trigger with real-time progress
 *
 * Part of Cycle 80: Analytics Export & Reports
 *
 * @see /backend/convex/mutations/analytics.ts - exportReport mutation
 * @see /backend/convex/services/analytics/report-generator.ts - Export logic
 */

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import {
  Download,
  FileText,
  FileSpreadsheet,
  FileJson,
  CalendarIcon,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

type ReportType =
  | "traffic"
  | "conversions"
  | "revenue"
  | "ab_tests"
  | "forms"
  | "dashboard_widget";

type ExportFormat = "csv" | "xlsx" | "json" | "pdf";

type DateRangePreset = "today" | "7days" | "30days" | "custom";

interface ExportReportModalProps {
  /** Button trigger variant */
  variant?: "default" | "outline" | "ghost";
  /** Button size */
  size?: "default" | "sm" | "lg" | "icon";
  /** Pre-selected report type */
  defaultReportType?: ReportType;
  /** Pre-selected filters */
  defaultFilters?: {
    funnelId?: string;
    stepId?: string;
    source?: string;
    campaign?: string;
  };
  /** Custom trigger element */
  trigger?: React.ReactNode;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ExportReportModal({
  variant = "default",
  size = "default",
  defaultReportType = "traffic",
  defaultFilters,
  trigger,
}: ExportReportModalProps) {
  const [open, setOpen] = useState(false);
  const [reportType, setReportType] = useState<ReportType>(defaultReportType);
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [datePreset, setDatePreset] = useState<DateRangePreset>("30days");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [isExporting, setIsExporting] = useState(false);

  const exportReport = useMutation(api.mutations.analytics.exportReport);

  // Format icons
  const formatIcons: Record<ExportFormat, React.ReactNode> = {
    csv: <FileText className="h-4 w-4" />,
    xlsx: <FileSpreadsheet className="h-4 w-4" />,
    json: <FileJson className="h-4 w-4" />,
    pdf: <FileText className="h-4 w-4" />,
  };

  // Report type labels
  const reportTypeLabels: Record<ReportType, string> = {
    traffic: "Traffic Report",
    conversions: "Conversions Report",
    revenue: "Revenue Report",
    ab_tests: "A/B Tests Report",
    forms: "Forms Report",
    dashboard_widget: "Dashboard Widget",
  };

  // Handle export
  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Build date range
      const dateRange: any = { preset: datePreset };

      if (datePreset === "custom") {
        if (!startDate || !endDate) {
          toast.error("Please select both start and end dates");
          setIsExporting(false);
          return;
        }
        dateRange.startDate = startDate.getTime();
        dateRange.endDate = endDate.getTime();
      }

      // Call mutation
      const result = await exportReport({
        reportType,
        format,
        dateRange,
        filters: defaultFilters,
        title: reportTypeLabels[reportType],
      });

      // Download file
      downloadFile(
        result.content,
        result.filename,
        result.mimeType
      );

      toast.success(
        `Exported ${result.recordCount} records as ${format.toUpperCase()}`
      );

      setOpen(false);
    } catch (error) {
      console.error("Export failed:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to export report"
      );
    } finally {
      setIsExporting(false);
    }
  };

  // Download file helper
  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant={variant} size={size}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Export Analytics Report</DialogTitle>
          <DialogDescription>
            Configure and export your analytics data in multiple formats
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Report Type */}
          <div className="space-y-2">
            <Label htmlFor="reportType">Report Type</Label>
            <Select
              value={reportType}
              onValueChange={(value) => setReportType(value as ReportType)}
            >
              <SelectTrigger id="reportType">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="traffic">Traffic Report</SelectItem>
                <SelectItem value="conversions">Conversions Report</SelectItem>
                <SelectItem value="revenue">Revenue Report</SelectItem>
                <SelectItem value="ab_tests">A/B Tests Report</SelectItem>
                <SelectItem value="forms">Forms Report</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {reportType === "traffic" &&
                "Visitor analytics, sources, and page views"}
              {reportType === "conversions" &&
                "Conversion rates and funnel performance"}
              {reportType === "revenue" &&
                "Revenue analytics and transaction data"}
              {reportType === "ab_tests" &&
                "A/B test results and comparisons"}
              {reportType === "forms" && "Form submission analytics"}
            </p>
          </div>

          {/* Export Format */}
          <div className="space-y-2">
            <Label htmlFor="format">Export Format</Label>
            <Select
              value={format}
              onValueChange={(value) => setFormat(value as ExportFormat)}
            >
              <SelectTrigger id="format">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    {formatIcons.csv}
                    <span>CSV (Comma-separated values)</span>
                  </div>
                </SelectItem>
                <SelectItem value="xlsx">
                  <div className="flex items-center gap-2">
                    {formatIcons.xlsx}
                    <span>Excel (.xlsx)</span>
                  </div>
                </SelectItem>
                <SelectItem value="json">
                  <div className="flex items-center gap-2">
                    {formatIcons.json}
                    <span>JSON (Structured data)</span>
                  </div>
                </SelectItem>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    {formatIcons.pdf}
                    <span>PDF (Document)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label htmlFor="dateRange">Date Range</Label>
            <Select
              value={datePreset}
              onValueChange={(value) => setDatePreset(value as DateRangePreset)}
            >
              <SelectTrigger id="dateRange">
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Date Range */}
          {datePreset === "custom" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? (
                        format(startDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? (
                        format(endDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {/* Filters Info */}
          {defaultFilters && (
            <div className="rounded-lg border bg-muted/50 p-3 text-sm">
              <p className="font-medium mb-2">Active Filters:</p>
              <ul className="space-y-1 text-muted-foreground">
                {defaultFilters.funnelId && (
                  <li>• Funnel: {defaultFilters.funnelId}</li>
                )}
                {defaultFilters.stepId && (
                  <li>• Step: {defaultFilters.stepId}</li>
                )}
                {defaultFilters.source && (
                  <li>• Source: {defaultFilters.source}</li>
                )}
                {defaultFilters.campaign && (
                  <li>• Campaign: {defaultFilters.campaign}</li>
                )}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
