/**
 * InsightsReport - Comprehensive weekly/monthly AI clone analytics report
 *
 * Features:
 * - Key metrics cards
 * - Trend indicators (up/down/neutral)
 * - Performance charts
 * - Top questions table
 * - Knowledge gaps
 * - Suggested actions
 * - Export as PDF/JSON
 *
 * Uses Convex queries and CloneAnalyticsService for advanced analytics
 */

import { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  AlertCircle,
  CheckCircle,
  Info,
  XCircle,
} from 'lucide-react';
import * as CloneAnalyticsService from '@/lib/services/CloneAnalyticsService';
import { Effect } from 'effect';

interface InsightsReportProps {
  cloneId: Id<'things'>;
}

type TimeRange = 'day' | 'week' | 'month' | 'all';

export function InsightsReport({ cloneId }: InsightsReportProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [exporting, setExporting] = useState(false);

  // Fetch comprehensive insights report from Convex
  const report = useQuery(api.queries['clone-analytics'].getInsightsReport, {
    cloneId,
    timeRange,
  });

  if (!report) {
    return (
      <div className="space-y-4">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <Card key={i}>
              <CardContent className="h-32 animate-pulse bg-muted" />
            </Card>
          ))}
      </div>
    );
  }

  const handleExportJSON = () => {
    setExporting(true);
    const json = CloneAnalyticsService.exportReportAsJSON(report as any);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clone-report-${timeRange}-${Date.now()}.json`;
    a.click();
    setExporting(false);
  };

  const handleExportMarkdown = () => {
    setExporting(true);
    const markdown = CloneAnalyticsService.exportReportAsMarkdown(report as any);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clone-report-${timeRange}-${Date.now()}.md`;
    a.click();
    setExporting(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Insights Report</h2>
          <p className="text-muted-foreground">
            Comprehensive analytics for your AI clone
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Last Day</SelectItem>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportJSON} disabled={exporting}>
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
          <Button variant="outline" onClick={handleExportMarkdown} disabled={exporting}>
            <Download className="h-4 w-4 mr-2" />
            Export MD
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Conversations"
          value={report.summary.totalConversations}
          trend={getTrend(report.performance.conversations, 10)}
          description={`${report.performance.avgMessagesPerConversation} avg msgs/conv`}
        />
        <MetricCard
          title="Total Messages"
          value={report.summary.totalMessages}
          trend={getTrend(report.performance.totalMessages, 50)}
          description={`${report.performance.userMessages} from users`}
        />
        <MetricCard
          title="Avg Response Time"
          value={`${Math.round(report.performance.avgResponseTimeMs / 1000)}s`}
          trend={
            report.performance.avgResponseTimeMs > 5000
              ? 'down'
              : report.performance.avgResponseTimeMs < 2000
                ? 'up'
                : 'neutral'
          }
          description="Time to respond"
        />
        <MetricCard
          title="Satisfaction"
          value={`${report.satisfaction.avgRating}/5`}
          trend={report.satisfaction.trend === 'positive' ? 'up' : report.satisfaction.trend === 'negative' ? 'down' : 'neutral'}
          description={`${report.satisfaction.satisfactionRate}% satisfied`}
        />
      </div>

      {/* Insights & Alerts */}
      {report.insights && report.insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
            <CardDescription>Important findings from this period</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {report.insights.map((insight: any, i: number) => (
              <InsightAlert key={i} insight={insight} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Sentiment Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Sentiment Analysis</CardTitle>
          <CardDescription>
            User sentiment across {report.sentiment.totalAnalyzed} messages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SentimentBar
            label="Positive"
            count={report.sentiment.sentiment.positive.count}
            percentage={report.sentiment.sentiment.positive.percentage}
            color="hsl(142 76% 36%)"
          />
          <SentimentBar
            label="Neutral"
            count={report.sentiment.sentiment.neutral.count}
            percentage={report.sentiment.sentiment.neutral.percentage}
            color="hsl(48 96% 53%)"
          />
          <SentimentBar
            label="Negative"
            count={report.sentiment.sentiment.negative.count}
            percentage={report.sentiment.sentiment.negative.percentage}
            color="hsl(0 84% 60%)"
          />
          <Separator />
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Overall Sentiment</span>
            <Badge
              variant={
                report.sentiment.overallSentiment === 'positive'
                  ? 'default'
                  : report.sentiment.overallSentiment === 'negative'
                    ? 'destructive'
                    : 'secondary'
              }
            >
              {report.sentiment.overallSentiment}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Top Topics */}
      <Card>
        <CardHeader>
          <CardTitle>Top Topics Discussed</CardTitle>
          <CardDescription>What users are asking about most</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {report.topics.topics.map((topic: any, i: number) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium">{topic.topic}</div>
                  <div className="text-xs text-muted-foreground">
                    {topic.sampleQuestions.length > 0 &&
                      topic.sampleQuestions[0].slice(0, 80) + '...'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{topic.count}</div>
                  <div className="text-xs text-muted-foreground">mentions</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Knowledge Gaps */}
      {report.gaps.gaps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Knowledge Gaps Detected</CardTitle>
            <CardDescription>
              Questions your clone couldn't answer confidently
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.gaps.gaps.slice(0, 5).map((gap: any, i: number) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{i + 1}</TableCell>
                    <TableCell className="max-w-md">
                      <div className="truncate">{gap.question}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{gap.reason}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Add Training
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {report.gaps.totalGaps > 5 && (
              <div className="mt-4 text-center text-sm text-muted-foreground">
                +{report.gaps.totalGaps - 5} more gaps detected
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Suggested Actions */}
      {report.actions && report.actions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommended Actions</CardTitle>
            <CardDescription>Steps to improve clone performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {report.actions.map((action: any, i: number) => (
              <ActionItem key={i} action={action} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Satisfaction Ratings Distribution */}
      {report.satisfaction.totalRatings > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Satisfaction Ratings</CardTitle>
            <CardDescription>
              Distribution of {report.satisfaction.totalRatings} user ratings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <RatingBar
                key={rating}
                rating={rating}
                count={report.satisfaction.ratingDistribution[rating] || 0}
                total={report.satisfaction.totalRatings}
              />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function MetricCard({
  title,
  value,
  trend,
  description,
}: {
  title: string;
  value: string | number;
  trend: 'up' | 'down' | 'neutral';
  description: string;
}) {
  const TrendIcon =
    trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor =
    trend === 'up'
      ? 'text-green-600'
      : trend === 'down'
        ? 'text-red-600'
        : 'text-gray-600';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <TrendIcon className={`h-4 w-4 ${trendColor}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function InsightAlert({ insight }: { insight: any }) {
  const Icon =
    insight.type === 'success'
      ? CheckCircle
      : insight.type === 'warning'
        ? AlertCircle
        : insight.type === 'error'
          ? XCircle
          : Info;

  const colorClass =
    insight.type === 'success'
      ? 'text-green-600 bg-green-50 border-green-200'
      : insight.type === 'warning'
        ? 'text-yellow-600 bg-yellow-50 border-yellow-200'
        : insight.type === 'error'
          ? 'text-red-600 bg-red-50 border-red-200'
          : 'text-blue-600 bg-blue-50 border-blue-200';

  return (
    <div className={`flex gap-3 p-3 rounded-lg border ${colorClass}`}>
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <div className="font-medium">{insight.title}</div>
        <div className="text-sm mt-1">{insight.message}</div>
      </div>
    </div>
  );
}

function SentimentBar({
  label,
  count,
  percentage,
  color,
}: {
  label: string;
  count: number;
  percentage: number;
  color: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
          <span className="font-medium">{label}</span>
        </div>
        <div className="text-muted-foreground">
          {count} ({percentage}%)
        </div>
      </div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}

function ActionItem({ action }: { action: any }) {
  const priorityColor =
    action.priority === 'urgent'
      ? 'destructive'
      : action.priority === 'high'
        ? 'default'
        : action.priority === 'medium'
          ? 'secondary'
          : 'outline';

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border">
      <Badge variant={priorityColor}>{action.priority}</Badge>
      <div className="flex-1">
        <div className="font-medium">{action.action}</div>
        <div className="text-sm text-muted-foreground mt-1">{action.reason}</div>
      </div>
    </div>
  );
}

function RatingBar({
  rating,
  count,
  total,
}: {
  rating: number;
  count: number;
  total: number;
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="flex items-center gap-3">
      <div className="text-sm font-medium w-12">{rating} stars</div>
      <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-sm text-muted-foreground w-16 text-right">
        {count} ({Math.round(percentage)}%)
      </div>
    </div>
  );
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getTrend(value: number, threshold: number): 'up' | 'down' | 'neutral' {
  if (value > threshold * 1.2) return 'up';
  if (value < threshold * 0.8) return 'down';
  return 'neutral';
}
