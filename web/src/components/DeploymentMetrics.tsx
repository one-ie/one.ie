import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Area,
  AreaChart
} from 'recharts';

// Cost comparison data
const costData = [
  { provider: 'Cloudflare', cost: 0, color: '#f97316' },
  { provider: 'Vercel', cost: 229, color: '#000000' },
  { provider: 'Netlify', cost: 240, color: '#00AD9F' },
  { provider: 'AWS', cost: 350, color: '#FF9900' },
];

// Performance metrics
const performanceData = [
  { region: 'N. America', latency: 45, coverage: '38%' },
  { region: 'Europe', latency: 78, coverage: '27%' },
  { region: 'Asia Pacific', latency: 112, coverage: '22%' },
  { region: 'S. America', latency: 156, coverage: '8%' },
  { region: 'Africa', latency: 203, coverage: '3%' },
  { region: 'Oceania', latency: 134, coverage: '2%' },
];

// Build metrics
const buildMetrics = [
  { phase: 'Install', duration: 3.2, color: '#8b5cf6' },
  { phase: 'Type Check', duration: 2.1, color: '#3b82f6' },
  { phase: 'Build', duration: 14, color: '#10b981' },
  { phase: 'Optimize', duration: 1.8, color: '#f59e0b' },
  { phase: 'Upload', duration: 4.5, color: '#ef4444' },
];

// Core Web Vitals
const webVitals = [
  { metric: 'FCP', value: 0.8, good: 1.8, label: 'First Contentful Paint' },
  { metric: 'LCP', value: 1.2, good: 2.5, label: 'Largest Contentful Paint' },
  { metric: 'CLS', value: 0.02, good: 0.1, label: 'Cumulative Layout Shift' },
  { metric: 'TTI', value: 1.1, good: 3.8, label: 'Time to Interactive' },
];

// Deployment trend
const deploymentTrend = [
  { date: 'Nov 1', time: 30 },
  { date: 'Nov 2', time: 27 },
  { date: 'Nov 3', time: 25 },
  { date: 'Nov 4', time: 22 },
  { date: 'Nov 5', time: 20 },
  { date: 'Nov 6', time: 19 },
];

export function DeploymentMetrics() {
  return (
    <div className="space-y-8">
      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">$0.00</div>
            <p className="text-xs text-muted-foreground">Forever free tier</p>
            <div className="mt-2">
              <Progress value={0} className="h-1" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Global Latency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">287ms</div>
            <p className="text-xs text-muted-foreground">Average worldwide</p>
            <div className="mt-2">
              <Progress value={71} className="h-1" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Edge Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">330+</div>
            <p className="text-xs text-muted-foreground">Data centers</p>
            <div className="mt-2">
              <Progress value={100} className="h-1" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lighthouse Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">100</div>
            <p className="text-xs text-muted-foreground">All categories</p>
            <div className="mt-2">
              <Progress value={100} className="h-1 bg-green-100" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cost Comparison Chart */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>Monthly Cost Comparison</CardTitle>
          <CardDescription>For 100GB bandwidth, 1M requests/month</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={costData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="provider" />
              <YAxis />
              <Tooltip
                formatter={(value) => [`$${value}`, 'Monthly Cost']}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Bar dataKey="cost" radius={[8, 8, 0, 0]}>
                {costData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 flex items-center justify-center gap-4 text-xs">
            <span className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-[#f97316]" />
              Cloudflare (FREE)
            </span>
            <span className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-[#000000]" />
              Vercel ($229)
            </span>
            <span className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-[#00AD9F]" />
              Netlify ($240)
            </span>
            <span className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-[#FF9900]" />
              AWS ($350)
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Global Latency Chart */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Global Latency by Region</CardTitle>
            <CardDescription>Response time from edge locations (ms)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={performanceData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis type="number" domain={[0, 250]} />
                <YAxis dataKey="region" type="category" width={80} />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === 'latency') return [`${value}ms`, 'Latency'];
                    return [value, name];
                  }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Bar dataKey="latency" fill="#10b981" radius={[0, 4, 4, 0]} label={{ position: 'right', formatter: (value: number) => `${value}ms` }}>
                  {performanceData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.latency < 100 ? '#10b981' : entry.latency < 200 ? '#f59e0b' : '#ef4444'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Build Pipeline Breakdown */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Build Pipeline Performance</CardTitle>
            <CardDescription>Average duration per phase (seconds)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={buildMetrics}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="duration"
                >
                  {buildMetrics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${value}s`}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              {buildMetrics.map((metric) => (
                <div key={metric.phase} className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded" style={{ backgroundColor: metric.color }} />
                  <span className="text-muted-foreground">{metric.phase}:</span>
                  <span className="font-semibold">{metric.duration}s</span>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Badge variant="outline" className="text-primary">
                Total Build Time: 25.6s
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Core Web Vitals */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>Core Web Vitals Performance</CardTitle>
          <CardDescription>All metrics in the "Good" range</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {webVitals.map((vital) => (
              <div key={vital.metric} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">{vital.metric}</span>
                  <Badge variant={vital.value <= vital.good * 0.5 ? 'default' : 'secondary'} className="text-xs">
                    {vital.value}s
                  </Badge>
                </div>
                <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="absolute h-full bg-green-500"
                    style={{ width: `${(vital.value / vital.good) * 100}%` }}
                  />
                  <div className="absolute right-0 h-full w-px bg-yellow-500" style={{ left: '50%' }} />
                </div>
                <p className="text-xs text-muted-foreground">{vital.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Deployment Speed Trend */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>Deployment Speed Improvement</CardTitle>
          <CardDescription>Total deployment time over the past week</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={deploymentTrend}>
              <defs>
                <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                formatter={(value) => [`${value}s`, 'Deployment Time']}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Area
                type="monotone"
                dataKey="time"
                stroke="#f97316"
                fill="url(#colorTime)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Improvement</span>
            <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
              37% faster than Nov 1
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}