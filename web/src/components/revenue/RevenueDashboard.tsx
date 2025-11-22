/**
 * Revenue Dashboard Component
 *
 * Comprehensive revenue analytics dashboard with:
 * - Real-time KPIs (total revenue, AOV, LTV, refund rate)
 * - Interactive charts (line, bar, pie)
 * - Revenue breakdown by type
 * - Cohort analysis
 * - MRR/ARR tracking
 * - Export functionality (PDF, CSV)
 *
 * Part of Cycle 89: Revenue Analytics Dashboard
 */

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ExportReportModal } from "@/components/analytics/ExportReportModal";
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
	DollarSign,
	TrendingUp,
	TrendingDown,
	ShoppingCart,
	Users,
	RefreshCcw,
	Repeat,
	Calendar,
} from "lucide-react";

type DateRange = "today" | "7days" | "30days" | "90days" | "custom";

interface RevenueData {
	// KPIs
	totalRevenue: number;
	averageOrderValue: number;
	lifetimeValue: number;
	refundRate: number;

	// Revenue over time
	revenueOverTime: Array<{ date: string; revenue: number; orders: number }>;

	// Revenue breakdown
	revenueByProduct: Array<{ product: string; revenue: number; orders: number; color: string }>;
	revenueByFunnel: Array<{ funnel: string; revenue: number; orders: number; color: string }>;
	revenueByType: Array<{
		type: "Product Sales" | "Upsells" | "Order Bumps" | "Subscriptions";
		revenue: number;
		percentage: number;
		color: string;
	}>;

	// Cohort analysis
	cohortRevenue: Array<{
		cohort: string;
		revenue: number;
		customers: number;
		avgRevenue: number;
	}>;

	// MRR/ARR
	mrr: number;
	arr: number;
	mrrGrowth: number;
	subscriptionCount: number;

	// Previous period comparison
	previousPeriod: {
		revenue: number;
		aov: number;
		ltv: number;
		refundRate: number;
	};
}

export function RevenueDashboard() {
	const [dateRange, setDateRange] = useState<DateRange>("30days");
	const [customStartDate, setCustomStartDate] = useState<string>("");
	const [customEndDate, setCustomEndDate] = useState<string>("");

	// Fetch revenue data from Convex
	const revenueData = useQuery(api.queries.analytics.getRevenueData, {
		dateRange,
		startDate: dateRange === "custom" ? customStartDate : undefined,
		endDate: dateRange === "custom" ? customEndDate : undefined,
	}) as RevenueData | undefined;

	// Calculate trends
	const trends = useMemo(() => {
		if (!revenueData) return null;

		const revenueTrend =
			((revenueData.totalRevenue - revenueData.previousPeriod.revenue) /
				revenueData.previousPeriod.revenue) *
			100;
		const aovTrend =
			((revenueData.averageOrderValue - revenueData.previousPeriod.aov) /
				revenueData.previousPeriod.aov) *
			100;
		const ltvTrend =
			((revenueData.lifetimeValue - revenueData.previousPeriod.ltv) /
				revenueData.previousPeriod.ltv) *
			100;
		const refundRateTrend =
			((revenueData.refundRate - revenueData.previousPeriod.refundRate) /
				revenueData.previousPeriod.refundRate) *
			100;

		return {
			revenue: revenueTrend,
			aov: aovTrend,
			ltv: ltvTrend,
			refundRate: refundRateTrend,
		};
	}, [revenueData]);

	// Format currency
	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(value);
	};

	// Format percentage
	const formatPercent = (value: number) => {
		return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
	};

	// Loading state
	if (revenueData === undefined) {
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

	return (
		<div className="space-y-6">
			{/* Header with date range and export */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 className="text-2xl font-bold text-foreground">Revenue Analytics</h2>
					<p className="text-sm text-muted-foreground">
						Track revenue from all sales and subscription payments
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
							<SelectItem value="90days">Last 90 Days</SelectItem>
							<SelectItem value="custom">Custom Range</SelectItem>
						</SelectContent>
					</Select>

					<ExportReportModal
						defaultReportType="revenue"
						variant="outline"
						size="sm"
					/>
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

			{/* KPI Cards */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{formatCurrency(revenueData.totalRevenue)}</div>
						<div className="flex items-center gap-1 text-xs">
							{trends && trends.revenue > 0 ? (
								<>
									<TrendingUp className="h-3 w-3 text-green-600" />
									<span className="text-green-600">{formatPercent(trends.revenue)}</span>
								</>
							) : (
								<>
									<TrendingDown className="h-3 w-3 text-red-600" />
									<span className="text-red-600">{formatPercent(trends.revenue)}</span>
								</>
							)}
							<span className="text-muted-foreground">from previous period</span>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
						<ShoppingCart className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{formatCurrency(revenueData.averageOrderValue)}</div>
						<div className="flex items-center gap-1 text-xs">
							{trends && trends.aov > 0 ? (
								<>
									<TrendingUp className="h-3 w-3 text-green-600" />
									<span className="text-green-600">{formatPercent(trends.aov)}</span>
								</>
							) : (
								<>
									<TrendingDown className="h-3 w-3 text-red-600" />
									<span className="text-red-600">{formatPercent(trends.aov)}</span>
								</>
							)}
							<span className="text-muted-foreground">from previous period</span>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Lifetime Value</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{formatCurrency(revenueData.lifetimeValue)}</div>
						<div className="flex items-center gap-1 text-xs">
							{trends && trends.ltv > 0 ? (
								<>
									<TrendingUp className="h-3 w-3 text-green-600" />
									<span className="text-green-600">{formatPercent(trends.ltv)}</span>
								</>
							) : (
								<>
									<TrendingDown className="h-3 w-3 text-red-600" />
									<span className="text-red-600">{formatPercent(trends.ltv)}</span>
								</>
							)}
							<span className="text-muted-foreground">from previous period</span>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Refund Rate</CardTitle>
						<RefreshCcw className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{revenueData.refundRate.toFixed(2)}%</div>
						<div className="flex items-center gap-1 text-xs">
							{trends && trends.refundRate < 0 ? (
								<>
									<TrendingDown className="h-3 w-3 text-green-600" />
									<span className="text-green-600">{formatPercent(trends.refundRate)}</span>
								</>
							) : (
								<>
									<TrendingUp className="h-3 w-3 text-red-600" />
									<span className="text-red-600">{formatPercent(trends.refundRate)}</span>
								</>
							)}
							<span className="text-muted-foreground">from previous period</span>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* MRR/ARR Cards */}
			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
						<Repeat className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{formatCurrency(revenueData.mrr)}</div>
						<div className="flex items-center gap-1 text-xs">
							{revenueData.mrrGrowth > 0 ? (
								<>
									<TrendingUp className="h-3 w-3 text-green-600" />
									<span className="text-green-600">{formatPercent(revenueData.mrrGrowth)}</span>
								</>
							) : (
								<>
									<TrendingDown className="h-3 w-3 text-red-600" />
									<span className="text-red-600">{formatPercent(revenueData.mrrGrowth)}</span>
								</>
							)}
							<span className="text-muted-foreground">growth rate</span>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Annual Recurring Revenue</CardTitle>
						<Calendar className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{formatCurrency(revenueData.arr)}</div>
						<p className="text-xs text-muted-foreground">
							{revenueData.subscriptionCount} active subscriptions
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Avg Revenue per Sub</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{formatCurrency(revenueData.subscriptionCount > 0 ? revenueData.mrr / revenueData.subscriptionCount : 0)}
						</div>
						<p className="text-xs text-muted-foreground">
							per subscriber per month
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Tabbed Charts */}
			<Tabs defaultValue="overview" className="w-full">
				<TabsList>
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="breakdown">Breakdown</TabsTrigger>
					<TabsTrigger value="products">Products</TabsTrigger>
					<TabsTrigger value="cohorts">Cohorts</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle>Revenue Over Time</CardTitle>
								<CardDescription>Daily revenue and order volume</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="h-[300px]">
									<ResponsiveContainer width="100%" height="100%">
										<AreaChart data={revenueData.revenueOverTime}>
											<defs>
												<linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
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
												tickFormatter={(value) => `$${value.toLocaleString()}`}
											/>
											<Tooltip
												contentStyle={{
													backgroundColor: "hsl(var(--card))",
													border: "1px solid hsl(var(--border))",
													borderRadius: "8px",
												}}
												formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
											/>
											<Area
												type="monotone"
												dataKey="revenue"
												stroke="hsl(var(--primary))"
												strokeWidth={2}
												fillOpacity={1}
												fill="url(#colorRevenue)"
											/>
										</AreaChart>
									</ResponsiveContainer>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Revenue by Funnel</CardTitle>
								<CardDescription>Revenue distribution across funnels</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="h-[300px]">
									<ResponsiveContainer width="100%" height="100%">
										<PieChart>
											<Pie
												data={revenueData.revenueByFunnel}
												cx="50%"
												cy="50%"
												labelLine={false}
												label={(entry) => `${entry.funnel}: ${formatCurrency(entry.revenue)}`}
												outerRadius={80}
												fill="hsl(var(--primary))"
												dataKey="revenue"
											>
												{revenueData.revenueByFunnel.map((entry, index) => (
													<Cell key={`cell-${index}`} fill={entry.color} />
												))}
											</Pie>
											<Tooltip formatter={(value: number) => formatCurrency(value)} />
											<Legend />
										</PieChart>
									</ResponsiveContainer>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="breakdown" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Revenue by Type</CardTitle>
							<CardDescription>Breakdown of revenue sources</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="h-[400px]">
								<ResponsiveContainer width="100%" height="100%">
									<BarChart data={revenueData.revenueByType}>
										<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
										<XAxis
											dataKey="type"
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
											tickFormatter={(value) => `$${value.toLocaleString()}`}
										/>
										<Tooltip
											contentStyle={{
												backgroundColor: "hsl(var(--card))",
												border: "1px solid hsl(var(--border))",
												borderRadius: "8px",
											}}
											formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
										/>
										<Bar dataKey="revenue" radius={[8, 8, 0, 0]}>
											{revenueData.revenueByType.map((entry, index) => (
												<Cell key={`cell-${index}`} fill={entry.color} />
											))}
										</Bar>
									</BarChart>
								</ResponsiveContainer>
							</div>
							<div className="mt-4 grid grid-cols-2 gap-4">
								{revenueData.revenueByType.map((item) => (
									<div key={item.type} className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<div
												className="h-3 w-3 rounded-full"
												style={{ backgroundColor: item.color }}
											/>
											<span className="text-sm">{item.type}</span>
										</div>
										<span className="text-sm font-medium">{item.percentage.toFixed(1)}%</span>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="products" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Revenue by Product</CardTitle>
							<CardDescription>Top revenue-generating products</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="h-[400px]">
								<ResponsiveContainer width="100%" height="100%">
									<BarChart data={revenueData.revenueByProduct} layout="vertical">
										<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
										<XAxis
											type="number"
											stroke="hsl(var(--muted-foreground))"
											fontSize={12}
											tickLine={false}
											axisLine={false}
											tickFormatter={(value) => `$${value.toLocaleString()}`}
										/>
										<YAxis
											type="category"
											dataKey="product"
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
											formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
										/>
										<Bar dataKey="revenue" radius={[0, 8, 8, 0]}>
											{revenueData.revenueByProduct.map((entry, index) => (
												<Cell key={`cell-${index}`} fill={entry.color} />
											))}
										</Bar>
									</BarChart>
								</ResponsiveContainer>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="cohorts" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Cohort Analysis</CardTitle>
							<CardDescription>Revenue by customer acquisition date</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="h-[400px]">
								<ResponsiveContainer width="100%" height="100%">
									<BarChart data={revenueData.cohortRevenue}>
										<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
										<XAxis
											dataKey="cohort"
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
											tickFormatter={(value) => `$${value.toLocaleString()}`}
										/>
										<Tooltip
											contentStyle={{
												backgroundColor: "hsl(var(--card))",
												border: "1px solid hsl(var(--border))",
												borderRadius: "8px",
											}}
											formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
										/>
										<Legend />
										<Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
										<Bar dataKey="avgRevenue" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
									</BarChart>
								</ResponsiveContainer>
							</div>
							<div className="mt-4">
								<div className="grid grid-cols-4 gap-4 text-sm">
									<div className="font-medium">Cohort</div>
									<div className="font-medium text-right">Revenue</div>
									<div className="font-medium text-right">Customers</div>
									<div className="font-medium text-right">Avg/Customer</div>
								</div>
								{revenueData.cohortRevenue.map((cohort) => (
									<div key={cohort.cohort} className="grid grid-cols-4 gap-4 py-2 text-sm border-t">
										<div>{cohort.cohort}</div>
										<div className="text-right">{formatCurrency(cohort.revenue)}</div>
										<div className="text-right">{cohort.customers}</div>
										<div className="text-right">{formatCurrency(cohort.avgRevenue)}</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
