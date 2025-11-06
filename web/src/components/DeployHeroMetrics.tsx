import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { lazy, Suspense } from 'react';
import {
  Zap,
  Globe,
  DollarSign,
  TrendingUp,
  Clock,
  Gauge,
  Shield,
  Rocket,
} from 'lucide-react';

// Lazy load recharts to reduce initial bundle size
const AreaChart = lazy(() => import('recharts').then(mod => ({ default: mod.AreaChart })));
const Area = lazy(() => import('recharts').then(mod => ({ default: mod.Area })));
const BarChart = lazy(() => import('recharts').then(mod => ({ default: mod.BarChart })));
const Bar = lazy(() => import('recharts').then(mod => ({ default: mod.Bar })));
const ResponsiveContainer = lazy(() => import('recharts').then(mod => ({ default: mod.ResponsiveContainer })));
const Tooltip = lazy(() => import('recharts').then(mod => ({ default: mod.Tooltip })));
const Cell = lazy(() => import('recharts').then(mod => ({ default: mod.Cell })));

// Mini chart data
const deployTrend = [
  { day: 'Mon', time: 30 },
  { day: 'Tue', time: 27 },
  { day: 'Wed', time: 25 },
  { day: 'Thu', time: 22 },
  { day: 'Fri', time: 20 },
  { day: 'Sat', time: 19 },
];

const latencyData = [
  { region: 'NA', value: 45 },
  { region: 'EU', value: 78 },
  { region: 'APAC', value: 112 },
  { region: 'SA', value: 156 },
];

const costComparison = [
  { name: 'CF', cost: 0, color: '#f97316' },
  { name: 'Vercel', cost: 229, color: '#6b7280' },
  { name: 'Netlify', cost: 240, color: '#14b8a6' },
  { name: 'AWS', cost: 350, color: '#f59e0b' },
];

const lighthouseScores = [
  { metric: 'Perf', score: 100, color: '#10b981' },
  { metric: 'A11y', score: 100, color: '#10b981' },
  { metric: 'BP', score: 100, color: '#10b981' },
  { metric: 'SEO', score: 100, color: '#10b981' },
];

export function DeployHeroMetrics() {
  return (
    <div className="w-full space-y-8">
      {/* Primary Metrics Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Cost Metric with Mini Bar Chart */}
        <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <DollarSign className="h-4 w-4 text-primary/60" />
              <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600">
                100% Free
              </Badge>
            </div>
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Cost</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-primary">$0</span>
              <span className="text-sm text-muted-foreground">/month</span>
            </div>
            <Suspense fallback={<div className="h-10 bg-muted/20 animate-pulse rounded" />}>
              <ResponsiveContainer width="100%" height={40}>
                <BarChart data={costComparison} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <Bar dataKey="cost" radius={[4, 4, 0, 0]}>
                    {costComparison.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#f97316' : '#e5e7eb'} />
                    ))}
                  </Bar>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload[0]) {
                        return (
                          <div className="rounded-lg border bg-background px-2 py-1 text-xs shadow-sm">
                            <p className="font-medium">{payload[0].payload.name}: ${payload[0].value}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Suspense>
            <p className="text-xs text-muted-foreground">vs $229-350 others</p>
          </CardContent>
        </Card>

        {/* Deploy Speed with Trend */}
        <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-blue-500/5 via-background to-background">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Clock className="h-4 w-4 text-blue-500/60" />
              <Badge variant="secondary" className="text-xs bg-blue-500/10 text-blue-600">
                -37% faster
              </Badge>
            </div>
            <CardTitle className="text-sm font-medium text-muted-foreground">Deploy Speed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-blue-600">19</span>
              <span className="text-sm text-muted-foreground">seconds</span>
            </div>
            <Suspense fallback={<div className="h-10 bg-muted/20 animate-pulse rounded" />}>
              <ResponsiveContainer width="100%" height={40}>
                <AreaChart data={deployTrend} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="deployGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="time"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#deployGradient)"
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload[0]) {
                        return (
                          <div className="rounded-lg border bg-background px-2 py-1 text-xs shadow-sm">
                            <p className="font-medium">{payload[0].payload.day}: {payload[0].value}s</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Suspense>
            <p className="text-xs text-muted-foreground">Build → Deploy → Live</p>
          </CardContent>
        </Card>

        {/* Global Latency with Region Chart */}
        <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-purple-500/5 via-background to-background">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Globe className="h-4 w-4 text-purple-500/60" />
              <Badge variant="secondary" className="text-xs bg-purple-500/10 text-purple-600">
                330+ edges
              </Badge>
            </div>
            <CardTitle className="text-sm font-medium text-muted-foreground">Global Latency</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-purple-600">287</span>
              <span className="text-sm text-muted-foreground">ms avg</span>
            </div>
            <Suspense fallback={<div className="h-10 bg-muted/20 animate-pulse rounded" />}>
              <ResponsiveContainer width="100%" height={40}>
                <BarChart data={latencyData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {latencyData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.value < 100 ? '#10b981' : entry.value < 150 ? '#f59e0b' : '#ef4444'}
                      />
                    ))}
                  </Bar>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload[0]) {
                        return (
                          <div className="rounded-lg border bg-background px-2 py-1 text-xs shadow-sm">
                            <p className="font-medium">{payload[0].payload.region}: {payload[0].value}ms</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Suspense>
            <p className="text-xs text-muted-foreground">Across 4 continents</p>
          </CardContent>
        </Card>

        {/* Lighthouse Score with Mini Gauge */}
        <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-green-500/5 via-background to-background">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Gauge className="h-4 w-4 text-green-500/60" />
              <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600">
                Perfect
              </Badge>
            </div>
            <CardTitle className="text-sm font-medium text-muted-foreground">Lighthouse Score</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-green-600">100</span>
              <span className="text-sm text-muted-foreground">/100</span>
            </div>
            <div className="flex gap-1">
              {lighthouseScores.map((score, index) => (
                <div key={index} className="flex-1">
                  <div className="h-8 rounded bg-green-500/20 relative overflow-hidden">
                    <div
                      className="absolute bottom-0 w-full bg-green-500 transition-all"
                      style={{ height: `${score.score}%` }}
                    />
                  </div>
                  <p className="text-xs text-center mt-1 text-muted-foreground">{score.metric}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">All metrics perfect</p>
          </CardContent>
        </Card>
      </div>

      {/* Visual Comparison Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cost Breakdown */}
        <Card className="border-primary/20 bg-card/50 backdrop-blur lg:col-span-1">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Zero Cost Breakdown
            </CardTitle>
            <CardDescription className="text-sm">What's included for free</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Unlimited Bandwidth</span>
                <span className="text-sm font-bold text-green-600">✓ Free</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">330+ Edge Locations</span>
                <span className="text-sm font-bold text-green-600">✓ Free</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">DDoS Protection</span>
                <span className="text-sm font-bold text-green-600">✓ Free</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">SSL Certificates</span>
                <span className="text-sm font-bold text-green-600">✓ Free</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">100k Functions/day</span>
                <span className="text-sm font-bold text-green-600">✓ Free</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Analytics Dashboard</span>
                <span className="text-sm font-bold text-green-600">✓ Free</span>
              </div>
              <div className="mt-4 rounded-lg bg-green-500/10 p-3">
                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                  Total Monthly Savings: $229-350
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deployment Pipeline */}
        <Card className="border-primary/20 bg-card/50 backdrop-blur lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Rocket className="h-4 w-4 text-primary" />
              19-Second Deployment Pipeline
            </CardTitle>
            <CardDescription className="text-sm">From code to global edge in under 20 seconds</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Pipeline Steps */}
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-sm font-bold text-blue-600">
                    14s
                  </div>
                  <p className="text-xs font-medium">Build</p>
                  <p className="text-xs text-muted-foreground">600+ files</p>
                </div>
                <div className="text-center">
                  <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10 text-sm font-bold text-purple-600">
                    4.5s
                  </div>
                  <p className="text-xs font-medium">Upload</p>
                  <p className="text-xs text-muted-foreground">665 assets</p>
                </div>
                <div className="text-center">
                  <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-sm font-bold text-green-600">
                    0.5s
                  </div>
                  <p className="text-xs font-medium">Deploy</p>
                  <p className="text-xs text-muted-foreground">Edge functions</p>
                </div>
                <div className="text-center">
                  <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10 text-sm font-bold text-orange-600">
                    &lt;1s
                  </div>
                  <p className="text-xs font-medium">Replicate</p>
                  <p className="text-xs text-muted-foreground">330+ edges</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex h-2 overflow-hidden rounded-full bg-muted">
                  <div className="w-[74%] bg-blue-500" />
                  <div className="w-[24%] bg-purple-500" />
                  <div className="w-[2%] bg-green-500" />
                  <div className="w-[1%] bg-orange-500" />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0s</span>
                  <span className="font-medium text-foreground">19s total</span>
                </div>
              </div>

              {/* Live Status */}
              <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-sm font-medium">Live at oneie.pages.dev</p>
                  <Badge variant="outline" className="ml-auto text-xs">
                    Nov 6, 2025
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}