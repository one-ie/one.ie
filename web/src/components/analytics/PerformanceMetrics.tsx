/**
 * Performance Metrics Component
 *
 * Displays:
 * - Core Web Vitals dashboard
 * - Performance score with Lighthouse-style gauge
 * - Resource breakdown (JS, CSS, images)
 * - Performance issues and recommendations
 * - Real-time monitoring
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity,
  Zap,
  Image as ImageIcon,
  Code,
  Palette,
  AlertTriangle,
  CheckCircle,
  Info,
  TrendingUp,
  Clock,
  Gauge,
} from 'lucide-react';
import {
  getPerformanceAnalyzer,
  monitorPerformance,
  checkPerformanceBudget,
  type PerformanceReport,
  type PerformanceBudget,
  type CoreWebVitals,
} from '@/lib/performance/performance-analyzer';

interface PerformanceMetricsProps {
  /** Auto-refresh interval in ms (default: 5000) */
  refreshInterval?: number;
  /** Show detailed breakdown */
  detailed?: boolean;
}

export function PerformanceMetrics({ refreshInterval = 5000, detailed = true }: PerformanceMetricsProps) {
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [budgets, setBudgets] = useState<PerformanceBudget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial load
    loadPerformanceData();

    // Set up monitoring
    const interval = setInterval(() => {
      loadPerformanceData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const loadPerformanceData = async () => {
    try {
      const analyzer = getPerformanceAnalyzer();
      const [newReport, newBudgets] = await Promise.all([
        analyzer.generateReport(),
        checkPerformanceBudget(),
      ]);

      setReport(newReport);
      setBudgets(newBudgets);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load performance data:', error);
      setLoading(false);
    }
  };

  if (loading || !report) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Performance Metrics...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Activity className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Performance Score */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Performance Score</CardTitle>
              <CardDescription>Lighthouse-style overall performance rating</CardDescription>
            </div>
            <PerformanceScoreGauge score={report.score} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={report.score} className="h-2" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Last updated: {new Date(report.timestamp).toLocaleTimeString()}
              </span>
              <Badge variant={getScoreBadgeVariant(report.score)}>
                {getScoreLabel(report.score)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Core Web Vitals */}
      <div className="grid gap-4 md:grid-cols-3">
        <WebVitalCard
          name="LCP"
          description="Largest Contentful Paint"
          value={report.metrics.lcp}
          unit="ms"
          threshold={{ good: 2500, poor: 4000 }}
          icon={<Zap className="h-4 w-4" />}
        />
        <WebVitalCard
          name="FID"
          description="First Input Delay"
          value={report.metrics.fid}
          unit="ms"
          threshold={{ good: 100, poor: 300 }}
          icon={<Activity className="h-4 w-4" />}
        />
        <WebVitalCard
          name="CLS"
          description="Cumulative Layout Shift"
          value={report.metrics.cls}
          unit=""
          threshold={{ good: 0.1, poor: 0.25 }}
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      {/* Detailed Metrics */}
      {detailed && (
        <Tabs defaultValue="metrics" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="issues">Issues</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
          </TabsList>

          <TabsContent value="metrics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <MetricCard
                name="TTFB"
                description="Time to First Byte"
                value={report.metrics.ttfb}
                unit="ms"
                icon={<Clock className="h-4 w-4" />}
              />
              <MetricCard
                name="FCP"
                description="First Contentful Paint"
                value={report.metrics.fcp}
                unit="ms"
                icon={<Palette className="h-4 w-4" />}
              />
              <MetricCard
                name="Load Time"
                description="Total page load time"
                value={report.metrics.loadTime}
                unit="ms"
                icon={<Activity className="h-4 w-4" />}
              />
              <MetricCard
                name="DOM Content Loaded"
                description="DOM ready time"
                value={report.metrics.domContentLoaded}
                unit="ms"
                icon={<Code className="h-4 w-4" />}
              />
            </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Resource Breakdown</CardTitle>
                <CardDescription>Total page size: {formatBytes(report.metrics.totalSize)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ResourceBar
                  label="JavaScript"
                  size={report.metrics.jsSize}
                  total={report.metrics.totalSize}
                  icon={<Code className="h-4 w-4" />}
                  color="bg-yellow-500"
                />
                <ResourceBar
                  label="CSS"
                  size={report.metrics.cssSize}
                  total={report.metrics.totalSize}
                  icon={<Palette className="h-4 w-4" />}
                  color="bg-blue-500"
                />
                <ResourceBar
                  label="Images"
                  size={report.metrics.imageSize}
                  total={report.metrics.totalSize}
                  icon={<ImageIcon className="h-4 w-4" />}
                  color="bg-green-500"
                />
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm text-muted-foreground">Total Requests</span>
                  <Badge variant="outline">{report.metrics.requestCount}</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="issues" className="space-y-4">
            {report.issues.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                  <p className="text-lg font-semibold">No Performance Issues!</p>
                  <p className="text-sm text-muted-foreground">Your site is performing well</p>
                </CardContent>
              </Card>
            ) : (
              report.issues.map((issue, index) => (
                <Alert key={index} variant={issue.type === 'critical' ? 'destructive' : 'default'}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>{issue.message}</AlertTitle>
                  <AlertDescription>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {issue.metric}: {formatMetricValue(issue.value, issue.metric)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          (threshold: {formatMetricValue(issue.threshold, issue.metric)})
                        </span>
                      </div>
                      <p className="text-sm">{issue.suggestion}</p>
                    </div>
                  </AlertDescription>
                </Alert>
              ))
            )}

            {report.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {report.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="budget" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Budget</CardTitle>
                <CardDescription>Track metrics against recommended thresholds</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {budgets.map((budget, index) => (
                  <BudgetItem key={index} budget={budget} />
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function PerformanceScoreGauge({ score }: { score: number }) {
  const getColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <Gauge className={`h-16 w-16 ${getColor(score)}`} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold">{score}</span>
        </div>
      </div>
    </div>
  );
}

function WebVitalCard({
  name,
  description,
  value,
  unit,
  threshold,
  icon,
}: {
  name: string;
  description: string;
  value: number | null;
  unit: string;
  threshold: { good: number; poor: number };
  icon: React.ReactNode;
}) {
  const getStatus = (val: number | null) => {
    if (val === null) return 'unknown';
    if (val <= threshold.good) return 'good';
    if (val <= threshold.poor) return 'warning';
    return 'poor';
  };

  const status = getStatus(value);
  const statusColors = {
    good: 'bg-green-500',
    warning: 'bg-yellow-500',
    poor: 'bg-red-500',
    unknown: 'bg-gray-500',
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{name}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value !== null ? `${formatNumber(value)}${unit}` : 'N/A'}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
        <div className="flex items-center gap-2 mt-2">
          <div className={`h-2 w-2 rounded-full ${statusColors[status]}`} />
          <span className="text-xs capitalize">{status}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function MetricCard({
  name,
  description,
  value,
  unit,
  icon,
}: {
  name: string;
  description: string;
  value: number | null;
  unit: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{name}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value !== null ? `${formatNumber(value)}${unit}` : 'N/A'}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function ResourceBar({
  label,
  size,
  total,
  icon,
  color,
}: {
  label: string;
  size: number;
  total: number;
  icon: React.ReactNode;
  color: string;
}) {
  const percentage = (size / total) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium">{label}</span>
        </div>
        <div className="text-sm text-muted-foreground">
          {formatBytes(size)} ({percentage.toFixed(1)}%)
        </div>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function BudgetItem({ budget }: { budget: PerformanceBudget }) {
  const percentage = (budget.current / budget.budget) * 100;
  const statusColors = {
    good: 'bg-green-500',
    warning: 'bg-yellow-500',
    critical: 'bg-red-500',
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{budget.metric}</span>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {formatNumber(budget.current)} / {formatNumber(budget.budget)}
          </Badge>
          <div className={`h-2 w-2 rounded-full ${statusColors[budget.status]}`} />
        </div>
      </div>
      <Progress value={Math.min(percentage, 100)} className="h-2" />
    </div>
  );
}

function getScoreBadgeVariant(score: number): 'default' | 'secondary' | 'destructive' {
  if (score >= 90) return 'default';
  if (score >= 50) return 'secondary';
  return 'destructive';
}

function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 50) return 'Needs Improvement';
  return 'Poor';
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(2) + 'k';
  }
  return num.toFixed(0);
}

function formatMetricValue(value: number, metric: string): string {
  if (metric.includes('Size')) {
    return formatBytes(value * 1024 * 1024);
  }
  if (metric === 'CLS') {
    return value.toFixed(3);
  }
  return formatNumber(value);
}
