/**
 * FormAnalyticsDashboard Component (Cycle 69)
 *
 * Comprehensive analytics dashboard for form performance:
 * - Conversion metrics (views, submissions, conversion rate, drop-off rate)
 * - Real-time charts (submissions over time, field drop-off funnel)
 * - Field analytics (which fields cause abandonment)
 * - Time tracking (average completion time, time per field)
 * - Device breakdown (desktop vs mobile)
 */

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { StreamingChart } from "@/components/ontology-ui/streaming/StreamingChart";
import { DynamicChart } from "@/components/ontology-ui/generative/DynamicChart";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  Target,
  Clock,
  Smartphone,
  Monitor,
  AlertTriangle,
} from "lucide-react";
import { formatDuration, formatDistance } from "date-fns";

interface FormAnalyticsDashboardProps {
  funnelId: Id<"things">;
}

export function FormAnalyticsDashboard({
  funnelId,
}: FormAnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d" | "all">(
    "7d"
  );

  // Query analytics data
  const analytics = useQuery(api.queries.forms.getAnalytics, {
    funnelId,
    timeRange,
  });

  // Calculate metrics
  const metrics = useMemo(() => {
    if (!analytics) return null;

    const conversionRate =
      analytics.totalViews > 0
        ? (analytics.totalSubmissions / analytics.totalViews) * 100
        : 0;

    const dropOffRate = 100 - conversionRate;

    const avgCompletionTime =
      analytics.completionTimes.length > 0
        ? analytics.completionTimes.reduce((a, b) => a + b, 0) /
          analytics.completionTimes.length
        : 0;

    return {
      totalViews: analytics.totalViews,
      totalSubmissions: analytics.totalSubmissions,
      conversionRate,
      dropOffRate,
      avgCompletionTime,
    };
  }, [analytics]);

  // Prepare chart data for submissions over time
  const submissionsChartData = useMemo(() => {
    if (!analytics?.submissionsByDate) return [];

    return analytics.submissionsByDate.map((item: any) => ({
      timestamp: item.date,
      value: item.count,
      label: new Date(item.date).toLocaleDateString(),
    }));
  }, [analytics]);

  // Prepare funnel chart data (field drop-off)
  const funnelChartData = useMemo(() => {
    if (!analytics?.fieldAnalytics) return [];

    // Sort by order, calculate funnel progression
    const sorted = [...analytics.fieldAnalytics].sort(
      (a, b) => a.order - b.order
    );

    return sorted.map((field) => ({
      label: field.fieldName,
      value: field.completions,
      category: field.abandonments > 50 ? "High Drop-off" : "Normal",
    }));
  }, [analytics]);

  // Prepare device breakdown data
  const deviceChartData = useMemo(() => {
    if (!analytics?.deviceBreakdown) return [];

    return [
      {
        label: "Desktop",
        value: analytics.deviceBreakdown.desktop || 0,
        category: "device",
      },
      {
        label: "Mobile",
        value: analytics.deviceBreakdown.mobile || 0,
        category: "device",
      },
      {
        label: "Tablet",
        value: analytics.deviceBreakdown.tablet || 0,
        category: "device",
      },
    ];
  }, [analytics]);

  if (analytics === undefined) {
    return (
      <div className="text-center py-8">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
        <p className="mt-2 text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">
          Performance Analytics
        </h2>
        <Select
          value={timeRange}
          onValueChange={(value: any) => setTimeRange(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Views */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Views
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalViews}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Form page views
            </p>
          </CardContent>
        </Card>

        {/* Total Submissions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Submissions
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalSubmissions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Completed forms
            </p>
          </CardContent>
        </Card>

        {/* Conversion Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Conversion Rate
            </CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metrics.conversionRate.toFixed(1)}%
            </div>
            <div className="flex items-center gap-1 mt-1">
              {metrics.conversionRate > 50 ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <p className="text-xs text-muted-foreground">
                {metrics.conversionRate > 50 ? "Excellent" : "Needs improvement"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Drop-off Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Drop-off Rate
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {metrics.dropOffRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Abandoned forms
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="funnel">Funnel</TabsTrigger>
          <TabsTrigger value="fields">Fields</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
        </TabsList>

        {/* Timeline: Submissions over time */}
        <TabsContent value="timeline">
          <StreamingChart
            data={submissionsChartData}
            type="area"
            title="Submissions Over Time"
            xAxisKey="timestamp"
            yAxisKey="value"
            color="hsl(var(--primary))"
            maxDataPoints={100}
            showLegend={false}
            showGrid={true}
            height={400}
          />
        </TabsContent>

        {/* Funnel: Field progression */}
        <TabsContent value="funnel">
          <DynamicChart
            title="Form Field Funnel"
            description="Track how users progress through each field"
            data={funnelChartData}
            defaultType="bar"
            showLegend={true}
            showGrid={true}
            animated={true}
            exportable={true}
            height={400}
          />
        </TabsContent>

        {/* Fields: Field analytics table */}
        <TabsContent value="fields">
          <Card>
            <CardHeader>
              <CardTitle>Field Analytics</CardTitle>
              <p className="text-sm text-muted-foreground">
                Which fields cause the most abandonment
              </p>
            </CardHeader>
            <CardContent>
              {analytics.fieldAnalytics && analytics.fieldAnalytics.length > 0 ? (
                <div className="space-y-4">
                  {analytics.fieldAnalytics
                    .sort((a, b) => b.abandonments - a.abandonments)
                    .map((field: any, index: number) => {
                      const abandonmentRate =
                        field.views > 0
                          ? (field.abandonments / field.views) * 100
                          : 0;

                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between border-b pb-3 last:border-b-0"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{field.fieldName}</h4>
                              {abandonmentRate > 30 && (
                                <Badge variant="destructive">
                                  High Drop-off
                                </Badge>
                              )}
                            </div>
                            <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{field.completions} completions</span>
                              <span>•</span>
                              <span>{field.abandonments} abandonments</span>
                              <span>•</span>
                              <span>
                                Avg time:{" "}
                                {field.avgTimeSpent
                                  ? `${(field.avgTimeSpent / 1000).toFixed(1)}s`
                                  : "N/A"}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className={`text-lg font-bold ${
                                abandonmentRate > 30
                                  ? "text-red-600"
                                  : abandonmentRate > 15
                                    ? "text-orange-600"
                                    : "text-green-600"
                              }`}
                            >
                              {abandonmentRate.toFixed(1)}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                              drop-off
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No field data available
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Devices: Device breakdown */}
        <TabsContent value="devices">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <DynamicChart
              title="Device Breakdown"
              description="Submissions by device type"
              data={deviceChartData}
              defaultType="pie"
              showLegend={true}
              showGrid={false}
              animated={true}
              exportable={true}
              height={400}
            />

            {/* Device Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Device Statistics</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Conversion rates by device
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Desktop */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Monitor className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-medium">Desktop</div>
                        <div className="text-sm text-muted-foreground">
                          {analytics.deviceBreakdown?.desktop || 0} submissions
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-600">
                        {analytics.deviceBreakdown?.desktop
                          ? (
                              (analytics.deviceBreakdown.desktop /
                                metrics.totalSubmissions) *
                              100
                            ).toFixed(1)
                          : 0}
                        %
                      </div>
                    </div>
                  </div>

                  {/* Mobile */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-medium">Mobile</div>
                        <div className="text-sm text-muted-foreground">
                          {analytics.deviceBreakdown?.mobile || 0} submissions
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        {analytics.deviceBreakdown?.mobile
                          ? (
                              (analytics.deviceBreakdown.mobile /
                                metrics.totalSubmissions) *
                              100
                            ).toFixed(1)
                          : 0}
                        %
                      </div>
                    </div>
                  </div>

                  {/* Tablet */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Monitor className="h-5 w-5 text-purple-600" />
                      <div>
                        <div className="font-medium">Tablet</div>
                        <div className="text-sm text-muted-foreground">
                          {analytics.deviceBreakdown?.tablet || 0} submissions
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-purple-600">
                        {analytics.deviceBreakdown?.tablet
                          ? (
                              (analytics.deviceBreakdown.tablet /
                                metrics.totalSubmissions) *
                              100
                            ).toFixed(1)
                          : 0}
                        %
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Time Tracking */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <CardTitle>Time Tracking</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Average time spent on form completion
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Average Completion Time */}
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {metrics.avgCompletionTime > 0
                  ? `${(metrics.avgCompletionTime / 1000).toFixed(1)}s`
                  : "N/A"}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Avg completion time
              </div>
            </div>

            {/* Fastest Completion */}
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {analytics.completionTimes && analytics.completionTimes.length > 0
                  ? `${(Math.min(...analytics.completionTimes) / 1000).toFixed(1)}s`
                  : "N/A"}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Fastest completion
              </div>
            </div>

            {/* Slowest Completion */}
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {analytics.completionTimes && analytics.completionTimes.length > 0
                  ? `${(Math.max(...analytics.completionTimes) / 1000).toFixed(1)}s`
                  : "N/A"}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Slowest completion
              </div>
            </div>
          </div>

          {/* Time Distribution */}
          {analytics.completionTimes && analytics.completionTimes.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-3">Time Distribution</h4>
              <div className="space-y-2">
                {[
                  { label: "< 30s", min: 0, max: 30000 },
                  { label: "30s - 1min", min: 30000, max: 60000 },
                  { label: "1min - 2min", min: 60000, max: 120000 },
                  { label: "> 2min", min: 120000, max: Infinity },
                ].map((range) => {
                  const count = analytics.completionTimes.filter(
                    (t: number) => t >= range.min && t < range.max
                  ).length;
                  const percentage =
                    (count / analytics.completionTimes.length) * 100;

                  return (
                    <div key={range.label} className="flex items-center gap-3">
                      <div className="text-sm font-medium w-24">
                        {range.label}
                      </div>
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary rounded-full h-2 transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="text-sm text-muted-foreground w-12 text-right">
                        {percentage.toFixed(0)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insights & Recommendations */}
      <Card className="border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100">
            Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
            {metrics.conversionRate < 30 && (
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>
                  <strong>Low conversion rate:</strong> Consider simplifying
                  your form or reducing the number of required fields.
                </p>
              </div>
            )}

            {analytics.fieldAnalytics?.some((f: any) => {
              const rate = f.views > 0 ? (f.abandonments / f.views) * 100 : 0;
              return rate > 30;
            }) && (
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>
                  <strong>High field drop-off:</strong> Some fields have high
                  abandonment rates. Review field labels and make them optional
                  if possible.
                </p>
              </div>
            )}

            {metrics.avgCompletionTime > 120000 && (
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>
                  <strong>Long completion time:</strong> Average completion
                  time is over 2 minutes. Consider breaking the form into
                  multiple steps.
                </p>
              </div>
            )}

            {analytics.deviceBreakdown?.mobile &&
              analytics.deviceBreakdown.mobile >
                analytics.deviceBreakdown.desktop && (
                <div className="flex items-start gap-2">
                  <Smartphone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p>
                    <strong>Mobile-first:</strong> Most submissions come from
                    mobile. Ensure your form is optimized for mobile devices.
                  </p>
                </div>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
