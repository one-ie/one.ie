import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Download,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";

interface PluginMetric {
  name: string;
  executions: number;
  successRate: number;
  errorRate: number;
  avgExecutionTime: number;
  trend: "up" | "down" | "stable";
}

interface DailyExecution {
  date: string;
  executions: number;
  errors: number;
  avgTime: number;
}

export function PluginAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");
  const [selectedPlugin, setSelectedPlugin] = useState<string>("all");

  // Mock data - in production, this would come from Convex
  const metrics: PluginMetric[] = [
    {
      name: "plugin-solana",
      executions: 1234,
      successRate: 98.5,
      errorRate: 1.5,
      avgExecutionTime: 245,
      trend: "up",
    },
    {
      name: "plugin-knowledge",
      executions: 892,
      successRate: 99.2,
      errorRate: 0.8,
      avgExecutionTime: 189,
      trend: "stable",
    },
    {
      name: "plugin-discord",
      executions: 567,
      successRate: 95.3,
      errorRate: 4.7,
      avgExecutionTime: 312,
      trend: "down",
    },
    {
      name: "plugin-browser",
      executions: 445,
      successRate: 97.1,
      errorRate: 2.9,
      avgExecutionTime: 1234,
      trend: "up",
    },
    {
      name: "plugin-openrouter",
      executions: 723,
      successRate: 99.7,
      errorRate: 0.3,
      avgExecutionTime: 567,
      trend: "stable",
    },
  ];

  const dailyExecutions: DailyExecution[] = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
      .toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    executions: Math.floor(Math.random() * 500) + 200,
    errors: Math.floor(Math.random() * 20),
    avgTime: Math.floor(Math.random() * 300) + 200,
  }));

  const totalExecutions = metrics.reduce((sum, m) => sum + m.executions, 0);
  const avgSuccessRate =
    metrics.reduce((sum, m) => sum + m.successRate, 0) / metrics.length;
  const avgErrorRate =
    metrics.reduce((sum, m) => sum + m.errorRate, 0) / metrics.length;

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  const exportData = () => {
    // In production, this would generate a CSV file
    console.log("Exporting analytics data...");
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedPlugin} onValueChange={setSelectedPlugin}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plugins</SelectItem>
              {metrics.map((metric) => (
                <SelectItem key={metric.name} value={metric.name}>
                  {metric.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" onClick={exportData}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExecutions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Last {timeRange}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgSuccessRate.toFixed(1)}%</div>
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +2.5% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgErrorRate.toFixed(1)}%</div>
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <TrendingDown className="w-3 h-3" />
              -0.8% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Execution Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(
                metrics.reduce((sum, m) => sum + m.avgExecutionTime, 0) / metrics.length
              )}
              ms
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all plugins
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="executions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="executions">Executions Over Time</TabsTrigger>
          <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
          <TabsTrigger value="distribution">Plugin Distribution</TabsTrigger>
        </TabsList>

        {/* Executions Over Time */}
        <TabsContent value="executions">
          <Card>
            <CardHeader>
              <CardTitle>Daily Executions</CardTitle>
              <CardDescription>
                Plugin execution trends over the last {timeRange}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={dailyExecutions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="executions"
                    stroke="#8884d8"
                    strokeWidth={2}
                    name="Executions"
                  />
                  <Line
                    type="monotone"
                    dataKey="errors"
                    stroke="#ff4444"
                    strokeWidth={2}
                    name="Errors"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Metrics */}
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Comparison</CardTitle>
              <CardDescription>
                Average execution time by plugin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={metrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="avgExecutionTime" fill="#8884d8" name="Avg Time (ms)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plugin Distribution */}
        <TabsContent value="distribution">
          <Card>
            <CardHeader>
              <CardTitle>Plugin Usage Distribution</CardTitle>
              <CardDescription>
                Execution count by plugin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={metrics}
                    dataKey="executions"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label={(entry) => `${entry.name} (${entry.executions})`}
                  >
                    {metrics.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Top Performing Plugins */}
      <Card>
        <CardHeader>
          <CardTitle>Plugin Leaderboard</CardTitle>
          <CardDescription>
            Ranked by executions and success rate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Plugin</TableHead>
                <TableHead className="text-right">Executions</TableHead>
                <TableHead className="text-right">Success Rate</TableHead>
                <TableHead className="text-right">Error Rate</TableHead>
                <TableHead className="text-right">Avg Time</TableHead>
                <TableHead className="text-center">Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics
                .sort((a, b) => b.executions - a.executions)
                .map((metric, index) => (
                  <TableRow key={metric.name}>
                    <TableCell className="font-medium">#{index + 1}</TableCell>
                    <TableCell className="font-medium">{metric.name}</TableCell>
                    <TableCell className="text-right">
                      {metric.executions.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={
                          metric.successRate >= 95 ? "default" : "secondary"
                        }
                      >
                        {metric.successRate.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={
                          metric.errorRate < 5 ? "secondary" : "destructive"
                        }
                      >
                        {metric.errorRate.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{metric.avgExecutionTime}ms</TableCell>
                    <TableCell className="text-center">
                      {metric.trend === "up" ? (
                        <TrendingUp className="w-4 h-4 text-green-500 mx-auto" />
                      ) : metric.trend === "down" ? (
                        <TrendingDown className="w-4 h-4 text-red-500 mx-auto" />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
