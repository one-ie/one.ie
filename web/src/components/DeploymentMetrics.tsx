import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

// Cost comparison data
const costData = [
  { provider: "Cloudflare", cost: 0, color: "#f97316" },
  { provider: "Vercel", cost: 229, color: "#000000" },
  { provider: "Netlify", cost: 240, color: "#00AD9F" },
  { provider: "AWS", cost: 350, color: "#FF9900" },
];

// Performance metrics
const performanceData = [
  { region: "N. America", latency: 45, coverage: "38%" },
  { region: "Europe", latency: 78, coverage: "27%" },
  { region: "Asia Pacific", latency: 112, coverage: "22%" },
  { region: "S. America", latency: 156, coverage: "8%" },
  { region: "Africa", latency: 203, coverage: "3%" },
  { region: "Oceania", latency: 134, coverage: "2%" },
];

// Build metrics
const buildMetrics = [
  { phase: "Install", duration: 3.2, color: "#8b5cf6" },
  { phase: "Type Check", duration: 2.1, color: "#3b82f6" },
  { phase: "Build", duration: 14, color: "#10b981" },
  { phase: "Optimize", duration: 1.8, color: "#f59e0b" },
  { phase: "Upload", duration: 4.5, color: "#ef4444" },
];

// Core Web Vitals (Real data from Lighthouse)
const webVitals = [
  { metric: "FCP", value: 0.3, good: 1.8, label: "First Contentful Paint (Desktop)" },
  { metric: "LCP", value: 0.7, good: 2.5, label: "Largest Contentful Paint (Desktop)" },
  { metric: "TBT", value: 0, good: 0.2, label: "Total Blocking Time" },
  { metric: "CLS", value: 0, good: 0.1, label: "Cumulative Layout Shift" },
];

const webVitalsMobile = [
  { metric: "FCP", value: 1.4, good: 1.8, label: "First Contentful Paint (Mobile)" },
  { metric: "LCP", value: 2.5, good: 2.5, label: "Largest Contentful Paint (Mobile)" },
  { metric: "TBT", value: 0, good: 0.2, label: "Total Blocking Time (Mobile)" },
  { metric: "CLS", value: 0, good: 0.1, label: "Cumulative Layout Shift (Mobile)" },
];

// Deployment trend
const deploymentTrend = [
  { date: "Nov 1", time: 30 },
  { date: "Nov 2", time: 27 },
  { date: "Nov 3", time: 25 },
  { date: "Nov 4", time: 22 },
  { date: "Nov 5", time: 20 },
  { date: "Nov 6", time: 19 },
];

export default function DeploymentMetrics() {
  return (
    <div className="space-y-8">
      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Cost
            </CardTitle>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Global Latency
            </CardTitle>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Edge Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">330+</div>
            <p className="text-xs text-muted-foreground">Data centers</p>
            <div className="mt-2">
              <Progress value={100} className="h-1" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-gradient-to-br from-green-500/10 to-background">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Lighthouse Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold text-green-600">100</div>
              <span className="text-sm text-muted-foreground">Desktop</span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <div className="text-2xl font-bold text-green-600">97</div>
              <span className="text-xs text-muted-foreground">Mobile</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Top 3% worldwide</p>
            <div className="mt-2">
              <Progress value={100} className="h-1" style={{ backgroundColor: "#10b981" }} />
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
                formatter={(value) => [`$${value}`, "Monthly Cost"]}
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Bar dataKey="cost" radius={[8, 8, 0, 0]}>
                {costData.map((entry) => (
                  <Cell key={entry.provider} fill={entry.color} />
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
                    if (name === "latency") return [`${value}ms`, "Latency"];
                    return [value, name];
                  }}
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Bar
                  dataKey="latency"
                  fill="#10b981"
                  radius={[0, 4, 4, 0]}
                  label={{ position: "right", formatter: (value: number) => `${value}ms` }}
                >
                  {performanceData.map((entry) => (
                    <Cell
                      key={entry.region}
                      fill={
                        entry.latency < 100
                          ? "#10b981"
                          : entry.latency < 200
                            ? "#f59e0b"
                            : "#ef4444"
                      }
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
                  {buildMetrics.map((entry) => (
                    <Cell key={entry.phase} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${value}s`}
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
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

      {/* Core Web Vitals - Desktop & Mobile */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Desktop Core Web Vitals */}
        <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-background">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Desktop Core Web Vitals</CardTitle>
                <CardDescription>Perfect 100/100 Lighthouse Score</CardDescription>
              </div>
              <Badge className="bg-green-500 text-white">100</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-2">
              {webVitals.map((vital) => (
                <div key={vital.metric} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">{vital.metric}</span>
                    <Badge variant="default" className="text-xs bg-green-600">
                      {vital.value === 0 ? "0" : `${vital.value}s`}
                    </Badge>
                  </div>
                  <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="absolute h-full bg-green-500"
                      style={{
                        width:
                          vital.value === 0
                            ? "100%"
                            : `${Math.min((vital.value / vital.good) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{vital.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Mobile Core Web Vitals */}
        <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-background">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Mobile Core Web Vitals</CardTitle>
                <CardDescription>Near-Perfect 97/100 on Slow 4G</CardDescription>
              </div>
              <Badge className="bg-green-500 text-white">97</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-2">
              {webVitalsMobile.map((vital) => (
                <div key={vital.metric} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">{vital.metric}</span>
                    <Badge variant="default" className="text-xs bg-green-600">
                      {vital.value === 0 ? "0" : `${vital.value}s`}
                    </Badge>
                  </div>
                  <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="absolute h-full bg-green-500"
                      style={{
                        width:
                          vital.value === 0
                            ? "100%"
                            : `${Math.min((vital.value / vital.good) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{vital.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lighthouse Screenshots */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>Lighthouse Performance Reports</CardTitle>
          <CardDescription>Real screenshots from Chrome DevTools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Desktop - Perfect 100/100</h4>
                <Badge className="bg-green-500">100</Badge>
              </div>
              <a
                href="/screenshots/lighthouse-desktop.png"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="/screenshots/lighthouse-desktop.png"
                  alt="Desktop Lighthouse Score - Perfect 100/100"
                  className="rounded-lg border border-border/50 hover:border-primary/50 transition-colors cursor-pointer"
                  loading="lazy"
                />
              </a>
              <p className="text-xs text-muted-foreground">
                🏆 FCP: 0.3s | LCP: 0.7s | TBT: 0ms | CLS: 0
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Mobile - Near-Perfect 97/100</h4>
                <Badge className="bg-green-500">97</Badge>
              </div>
              <a
                href="/screenshots/lighthouse-mobile.png"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="/screenshots/lighthouse-mobile.png"
                  alt="Mobile Lighthouse Score - 97/100"
                  className="rounded-lg border border-border/50 hover:border-primary/50 transition-colors cursor-pointer"
                  loading="lazy"
                />
              </a>
              <p className="text-xs text-muted-foreground">
                📱 FCP: 1.4s | LCP: 2.5s | TBT: 0ms | CLS: 0 (on Slow 4G)
              </p>
            </div>
          </div>
          <div className="mt-4 text-center">
            <a
              href="/news/perfect-lighthouse-scores-desktop-mobile"
              className="text-sm text-primary hover:underline"
            >
              Read the full performance optimization story →
            </a>
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
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                formatter={(value) => [`${value}s`, "Deployment Time"]}
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
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
