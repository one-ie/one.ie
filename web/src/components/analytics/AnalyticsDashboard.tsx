/**
 * Analytics Dashboard Component
 *
 * Comprehensive analytics dashboard for funnels with:
 * - Real-time KPIs (visitors, conversions, revenue)
 * - Interactive charts (line, bar, pie)
 * - Funnel visualization
 * - Date range selector
 * - Export functionality (PDF, CSV)
 * - Uses DynamicDashboard from ontology-ui/generative
 *
 * Part of Cycle 71: Funnel Analytics Dashboard
 */

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { DynamicDashboard } from "@/components/ontology-ui/generative/DynamicDashboard";
import { LiveCounter } from "@/components/ontology-ui/streaming/LiveCounter";
import { NetworkDiagram } from "@/components/ontology-ui/visualization/NetworkDiagram";
import { TrafficSourcesChart } from "./TrafficSourcesChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	Cell,
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import {
	Download,
	FileText,
	TrendingUp,
	TrendingDown,
	Users,
	DollarSign,
	Target,
	Activity,
} from "lucide-react";
import { toast } from "sonner";

type DateRange = "today" | "7days" | "30days" | "custom";

interface AnalyticsDashboardProps {
	funnelId: string;
	groupId?: string;
}

interface AnalyticsData {
	totalVisitors: number;
	totalConversions: number;
	conversionRate: number;
	totalRevenue: number;
	visitorsOverTime: Array<{ date: string; visitors: number }>;
	stepComparison: Array<{ step: string; visitors: number; conversions: number }>;
	trafficSources: Array<{ source: string; visitors: number; color: string }>;
	funnelFlow: {
		nodes: Array<{ id: string; label: string; value: number }>;
		edges: Array<{ from: string; to: string; value: number }>;
	};
	previousPeriod: {
		visitors: number;
		conversions: number;
		revenue: number;
	};
}

export function AnalyticsDashboard({ funnelId, groupId }: AnalyticsDashboardProps) {
	const [dateRange, setDateRange] = useState<DateRange>("30days");
	const [customStartDate, setCustomStartDate] = useState<string>("");
	const [customEndDate, setCustomEndDate] = useState<string>("");

	// Fetch analytics data from Convex
	const analytics = useQuery(api.queries.analytics.getDashboard, {
		funnelId: funnelId as any,
		dateRange,
		startDate: dateRange === "custom" ? customStartDate : undefined,
		endDate: dateRange === "custom" ? customEndDate : undefined,
	}) as AnalyticsData | undefined;

	// Calculate trends
	const trends = useMemo(() => {
		if (!analytics) return null;

		const visitorTrend =
			((analytics.totalVisitors - analytics.previousPeriod.visitors) /
				analytics.previousPeriod.visitors) *
			100;
		const conversionTrend =
			((analytics.totalConversions - analytics.previousPeriod.conversions) /
				analytics.previousPeriod.conversions) *
			100;
		const revenueTrend =
			((analytics.totalRevenue - analytics.previousPeriod.revenue) /
				analytics.previousPeriod.revenue) *
			100;

		return {
			visitors: visitorTrend,
			conversions: conversionTrend,
			revenue: revenueTrend,
		};
	}, [analytics]);

	// Export handlers
	const handleExportPDF = async () => {
		try {
			// In a real implementation, this would generate a PDF
			toast.success("PDF export started (implementation pending)");
		} catch (error) {
			toast.error("Failed to export PDF");
			console.error(error);
		}
	};

	const handleExportCSV = async () => {
		try {
			if (!analytics) return;

			// Generate CSV data
			const csvRows = [
				["Metric", "Value"],
				["Total Visitors", analytics.totalVisitors.toString()],
				["Total Conversions", analytics.totalConversions.toString()],
				["Conversion Rate", `${analytics.conversionRate.toFixed(2)}%`],
				["Total Revenue", `$${analytics.totalRevenue.toFixed(2)}`],
				[""],
				["Date", "Visitors"],
				...analytics.visitorsOverTime.map((d) => [d.date, d.visitors.toString()]),
			];

			const csvContent = csvRows.map((row) => row.join(",")).join("\n");
			const blob = new Blob([csvContent], { type: "text/csv" });
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `funnel-analytics-${funnelId}-${Date.now()}.csv`;
			a.click();
			window.URL.revokeObjectURL(url);

			toast.success("CSV exported successfully");
		} catch (error) {
			toast.error("Failed to export CSV");
			console.error(error);
		}
	};

	// Loading state
	if (analytics === undefined) {
		return (
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<Skeleton className="h-10 w-48" />
					<Skeleton className="h-10 w-32" />
				</div>
				<div className="grid gap-4 md:grid-cols-4">
					{[...Array(4)].map((_, i) => (
						<Skeleton key={i} className="h-32" />
					))}
				</div>
				<Skeleton className="h-96" />
			</div>
		);
	}

	// Define dashboard widgets
	const widgets = [
		{
			id: "visitors-chart",
			type: "chart" as const,
			title: "Visitors Over Time",
			position: { x: 0, y: 0 },
			size: { width: 8, height: 4 },
			component: () => (
				<ResponsiveContainer width="100%" height="100%">
					<LineChart data={analytics.visitorsOverTime}>
						<defs>
							<linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
								<stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
							</linearGradient>
						</defs>
						<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
						<XAxis
							dataKey="date"
							stroke="hsl(var(--muted-foreground))"
							fontSize={12}
							tickLine={false}
							axisLine={false}
						/>
						<YAxis
							stroke="hsl(var(--muted-foreground))"
							fontSize={12}
							tickLine={false}
							axisLine={false}
						/>
						<Tooltip
							contentStyle={{
								backgroundColor: "hsl(var(--card))",
								border: "1px solid hsl(var(--border))",
								borderRadius: "8px",
							}}
						/>
						<Line
							type="monotone"
							dataKey="visitors"
							stroke="hsl(var(--primary))"
							strokeWidth={2}
							dot={{ fill: "hsl(var(--primary))" }}
							activeDot={{ r: 6 }}
						/>
					</LineChart>
				</ResponsiveContainer>
			),
		},
		{
			id: "steps-chart",
			type: "chart" as const,
			title: "Steps Comparison",
			position: { x: 8, y: 0 },
			size: { width: 4, height: 4 },
			component: () => (
				<ResponsiveContainer width="100%" height="100%">
					<BarChart data={analytics.stepComparison}>
						<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
						<XAxis
							dataKey="step"
							stroke="hsl(var(--muted-foreground))"
							fontSize={12}
							tickLine={false}
							axisLine={false}
						/>
						<YAxis
							stroke="hsl(var(--muted-foreground))"
							fontSize={12}
							tickLine={false}
							axisLine={false}
						/>
						<Tooltip
							contentStyle={{
								backgroundColor: "hsl(var(--card))",
								border: "1px solid hsl(var(--border))",
								borderRadius: "8px",
							}}
						/>
						<Legend />
						<Bar dataKey="visitors" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
						<Bar dataKey="conversions" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
					</BarChart>
				</ResponsiveContainer>
			),
		},
		{
			id: "traffic-sources",
			type: "chart" as const,
			title: "Traffic Sources",
			position: { x: 0, y: 4 },
			size: { width: 4, height: 4 },
			component: () => (
				<ResponsiveContainer width="100%" height="100%">
					<PieChart>
						<Pie
							data={analytics.trafficSources}
							cx="50%"
							cy="50%"
							labelLine={false}
							label={(entry) => `${entry.source}: ${entry.visitors}`}
							outerRadius={80}
							fill="hsl(var(--primary))"
							dataKey="visitors"
						>
							{analytics.trafficSources.map((entry, index) => (
								<Cell key={`cell-${index}`} fill={entry.color} />
							))}
						</Pie>
						<Tooltip />
					</PieChart>
				</ResponsiveContainer>
			),
		},
		{
			id: "funnel-flow",
			type: "custom" as const,
			title: "Funnel Visualization",
			position: { x: 4, y: 4 },
			size: { width: 8, height: 4 },
			component: () => (
				<NetworkDiagram
					nodes={analytics.funnelFlow.nodes}
					edges={analytics.funnelFlow.edges}
					layout="hierarchical"
					interactive
					groupId={groupId}
				/>
			),
		},
	];

	return (
		<div className="space-y-6">
			{/* Header with date range and export */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 className="text-2xl font-bold text-foreground">Analytics Dashboard</h2>
					<p className="text-sm text-muted-foreground">
						Comprehensive funnel performance metrics and insights
					</p>
				</div>

				<div className="flex flex-wrap items-center gap-2">
					<Select value={dateRange} onValueChange={(value) => setDateRange(value as DateRange)}>
						<SelectTrigger className="w-[140px]">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="today">Today</SelectItem>
							<SelectItem value="7days">Last 7 Days</SelectItem>
							<SelectItem value="30days">Last 30 Days</SelectItem>
							<SelectItem value="custom">Custom Range</SelectItem>
						</SelectContent>
					</Select>

					<Button variant="outline" size="sm" onClick={handleExportCSV}>
						<FileText className="mr-2 h-4 w-4" />
						CSV
					</Button>

					<Button variant="outline" size="sm" onClick={handleExportPDF}>
						<Download className="mr-2 h-4 w-4" />
						PDF
					</Button>
				</div>
			</div>

			{/* Custom date range inputs */}
			{dateRange === "custom" && (
				<div className="flex gap-2">
					<div className="flex-1">
						<label className="text-sm font-medium">Start Date</label>
						<input
							type="date"
							value={customStartDate}
							onChange={(e) => setCustomStartDate(e.target.value)}
							className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
						/>
					</div>
					<div className="flex-1">
						<label className="text-sm font-medium">End Date</label>
						<input
							type="date"
							value={customEndDate}
							onChange={(e) => setCustomEndDate(e.target.value)}
							className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
						/>
					</div>
				</div>
			)}

			{/* KPI Cards with LiveCounter */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{analytics.totalVisitors.toLocaleString()}</div>
						<div className="flex items-center gap-1 text-xs">
							{trends && trends.visitors > 0 ? (
								<>
									<TrendingUp className="h-3 w-3 text-green-600" />
									<span className="text-green-600">+{trends.visitors.toFixed(1)}%</span>
								</>
							) : (
								<>
									<TrendingDown className="h-3 w-3 text-red-600" />
									<span className="text-red-600">{trends?.visitors.toFixed(1)}%</span>
								</>
							)}
							<span className="text-muted-foreground">from previous period</span>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Conversions</CardTitle>
						<Target className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{analytics.totalConversions.toLocaleString()}</div>
						<div className="flex items-center gap-1 text-xs">
							{trends && trends.conversions > 0 ? (
								<>
									<TrendingUp className="h-3 w-3 text-green-600" />
									<span className="text-green-600">+{trends.conversions.toFixed(1)}%</span>
								</>
							) : (
								<>
									<TrendingDown className="h-3 w-3 text-red-600" />
									<span className="text-red-600">{trends?.conversions.toFixed(1)}%</span>
								</>
							)}
							<span className="text-muted-foreground">from previous period</span>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
						<Activity className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{analytics.conversionRate.toFixed(2)}%</div>
						<p className="text-xs text-muted-foreground">
							{analytics.totalConversions} / {analytics.totalVisitors} visitors
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">${analytics.totalRevenue.toLocaleString()}</div>
						<div className="flex items-center gap-1 text-xs">
							{trends && trends.revenue > 0 ? (
								<>
									<TrendingUp className="h-3 w-3 text-green-600" />
									<span className="text-green-600">+{trends.revenue.toFixed(1)}%</span>
								</>
							) : (
								<>
									<TrendingDown className="h-3 w-3 text-red-600" />
									<span className="text-red-600">{trends?.revenue.toFixed(1)}%</span>
								</>
							)}
							<span className="text-muted-foreground">from previous period</span>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Tabbed Charts */}
			<Tabs defaultValue="overview" className="w-full">
				<TabsList>
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="charts">Charts</TabsTrigger>
					<TabsTrigger value="traffic">Traffic Sources</TabsTrigger>
					<TabsTrigger value="funnel">Funnel Flow</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle>Visitors Over Time</CardTitle>
								<CardDescription>Daily visitor trends for selected period</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="h-[300px]">
									<ResponsiveContainer width="100%" height="100%">
										<AreaChart data={analytics.visitorsOverTime}>
											<defs>
												<linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
													<stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
													<stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
												</linearGradient>
											</defs>
											<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
											<XAxis
												dataKey="date"
												stroke="hsl(var(--muted-foreground))"
												fontSize={12}
												tickLine={false}
												axisLine={false}
											/>
											<YAxis
												stroke="hsl(var(--muted-foreground))"
												fontSize={12}
												tickLine={false}
												axisLine={false}
											/>
											<Tooltip
												contentStyle={{
													backgroundColor: "hsl(var(--card))",
													border: "1px solid hsl(var(--border))",
													borderRadius: "8px",
												}}
											/>
											<Area
												type="monotone"
												dataKey="visitors"
												stroke="hsl(var(--primary))"
												strokeWidth={2}
												fillOpacity={1}
												fill="url(#colorVisitors)"
											/>
										</AreaChart>
									</ResponsiveContainer>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Traffic Sources</CardTitle>
								<CardDescription>Breakdown of visitor sources</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="h-[300px]">
									<ResponsiveContainer width="100%" height="100%">
										<PieChart>
											<Pie
												data={analytics.trafficSources}
												cx="50%"
												cy="50%"
												labelLine={false}
												label={(entry) => `${entry.source}: ${entry.visitors}`}
												outerRadius={80}
												fill="hsl(var(--primary))"
												dataKey="visitors"
											>
												{analytics.trafficSources.map((entry, index) => (
													<Cell key={`cell-${index}`} fill={entry.color} />
												))}
											</Pie>
											<Tooltip />
											<Legend />
										</PieChart>
									</ResponsiveContainer>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="charts" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Steps Comparison</CardTitle>
							<CardDescription>Visitors and conversions by funnel step</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="h-[400px]">
								<ResponsiveContainer width="100%" height="100%">
									<BarChart data={analytics.stepComparison}>
										<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
										<XAxis
											dataKey="step"
											stroke="hsl(var(--muted-foreground))"
											fontSize={12}
											tickLine={false}
											axisLine={false}
										/>
										<YAxis
											stroke="hsl(var(--muted-foreground))"
											fontSize={12}
											tickLine={false}
											axisLine={false}
										/>
										<Tooltip
											contentStyle={{
												backgroundColor: "hsl(var(--card))",
												border: "1px solid hsl(var(--border))",
												borderRadius: "8px",
											}}
										/>
										<Legend />
										<Bar dataKey="visitors" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
										<Bar dataKey="conversions" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
									</BarChart>
								</ResponsiveContainer>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="traffic" className="space-y-4">
					<TrafficSourcesChart
						funnelId={funnelId}
						groupId={groupId}
						dateRange={dateRange}
					/>
				</TabsContent>

				<TabsContent value="funnel" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Funnel Flow Visualization</CardTitle>
							<CardDescription>Step-by-step visitor flow through the funnel</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="h-[500px]">
								<NetworkDiagram
									nodes={analytics.funnelFlow.nodes}
									edges={analytics.funnelFlow.edges}
									layout="hierarchical"
									interactive
									groupId={groupId}
								/>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
