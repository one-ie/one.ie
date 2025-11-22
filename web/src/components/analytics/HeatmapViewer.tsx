/**
 * Heatmap Viewer Component
 *
 * Cycle 77: Click Heatmaps
 *
 * Visual representation of click heatmap data with:
 * - Heatmap overlay showing click density
 * - Device filtering (desktop, tablet, mobile)
 * - Date range filtering
 * - Scroll depth visualization
 * - Click statistics and insights
 * - Export functionality
 *
 * Uses HeatmapChart from ontology-ui for visualization.
 */

import { useState, useMemo, useEffect } from "react";
import { HeatmapChart } from "@/components/ontology-ui/visualization/HeatmapChart";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
	getClickEvents,
	getHeatmapData,
	getClickStatistics,
	getScrollDepthEvents,
	initializeHeatmapTracking,
	type ClickEvent,
} from "@/lib/analytics/heatmap-tracker";
import {
	MousePointer2,
	Smartphone,
	Monitor,
	Tablet,
	ArrowDown,
	BarChart3,
	Download,
	RefreshCw,
} from "lucide-react";

type DeviceFilter = "all" | "desktop" | "tablet" | "mobile";
type DateRangeFilter = "today" | "7days" | "30days" | "all";

interface HeatmapViewerProps {
	/** Page path to filter (e.g., "/products") */
	page?: string;
	/** Auto-refresh interval in milliseconds */
	refreshInterval?: number;
	/** Show statistics panel */
	showStatistics?: boolean;
	/** Grid size for heatmap cells (pixels) */
	gridSize?: number;
}

export function HeatmapViewer({
	page,
	refreshInterval = 0,
	showStatistics = true,
	gridSize = 50,
}: HeatmapViewerProps) {
	const [deviceFilter, setDeviceFilter] = useState<DeviceFilter>("all");
	const [dateRangeFilter, setDateRangeFilter] = useState<DateRangeFilter>("7days");
	const [refreshKey, setRefreshKey] = useState(0);

	// Initialize tracking on mount
	useEffect(() => {
		initializeHeatmapTracking();
	}, []);

	// Auto-refresh
	useEffect(() => {
		if (refreshInterval > 0) {
			const interval = setInterval(() => {
				setRefreshKey((prev) => prev + 1);
			}, refreshInterval);

			return () => clearInterval(interval);
		}
	}, [refreshInterval]);

	// Calculate date range
	const dateRange = useMemo(() => {
		const now = Date.now();
		const ranges = {
			today: now - 24 * 60 * 60 * 1000,
			"7days": now - 7 * 24 * 60 * 60 * 1000,
			"30days": now - 30 * 24 * 60 * 60 * 1000,
			all: 0,
		};

		return {
			startDate: ranges[dateRangeFilter],
			endDate: now,
		};
	}, [dateRangeFilter]);

	// Get filtered click events
	const clicks = useMemo(() => {
		return getClickEvents({
			page,
			deviceType: deviceFilter === "all" ? undefined : deviceFilter,
			startDate: dateRange.startDate,
			endDate: dateRange.endDate,
		});
	}, [page, deviceFilter, dateRange, refreshKey]);

	// Get heatmap data for visualization
	const heatmapData = useMemo(() => {
		const data = getHeatmapData({
			page,
			deviceType: deviceFilter === "all" ? undefined : deviceFilter,
			startDate: dateRange.startDate,
			endDate: dateRange.endDate,
			gridSize,
		});

		// Convert to HeatmapChart format
		// Group by Y coordinate (rows) and X coordinate (columns)
		return data.map((point) => ({
			x: Math.floor(point.x / gridSize),
			y: Math.floor(point.y / gridSize),
			value: point.value,
		}));
	}, [page, deviceFilter, dateRange, gridSize, refreshKey]);

	// Get statistics
	const statistics = useMemo(() => {
		return getClickStatistics({
			page,
			deviceType: deviceFilter === "all" ? undefined : deviceFilter,
			startDate: dateRange.startDate,
			endDate: dateRange.endDate,
		});
	}, [page, deviceFilter, dateRange, refreshKey]);

	// Get scroll depth data
	const scrollDepths = useMemo(() => {
		const depths = getScrollDepthEvents();
		if (page) {
			const pageDepth = depths[page];
			return pageDepth ? [pageDepth] : [];
		}
		return Object.values(depths);
	}, [page, refreshKey]);

	// Top clicked elements
	const topElements = useMemo(() => {
		return Object.entries(statistics.clicksByElement)
			.sort(([, a], [, b]) => b - a)
			.slice(0, 10)
			.map(([element, count]) => ({
				element,
				count,
				percentage: (count / statistics.totalClicks) * 100,
			}));
	}, [statistics]);

	// Device breakdown
	const deviceBreakdown = useMemo(() => {
		return Object.entries(statistics.clicksByDevice).map(([device, count]) => ({
			device,
			count,
			percentage: (count / statistics.totalClicks) * 100,
		}));
	}, [statistics]);

	// Export heatmap data
	const handleExport = () => {
		const csvRows = [
			["X", "Y", "Clicks"],
			...heatmapData.map((d) => [d.x.toString(), d.y.toString(), d.value.toString()]),
		];

		const csvContent = csvRows.map((row) => row.join(",")).join("\n");
		const blob = new Blob([csvContent], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `heatmap-${page || "all"}-${Date.now()}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	};

	return (
		<div className="space-y-6">
			{/* Header with filters */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 className="text-2xl font-bold text-foreground">Click Heatmap</h2>
					<p className="text-sm text-muted-foreground">
						Visual representation of user click patterns
						{page && ` on ${page}`}
					</p>
				</div>

				<div className="flex flex-wrap items-center gap-2">
					{/* Device filter */}
					<Select
						value={deviceFilter}
						onValueChange={(value) => setDeviceFilter(value as DeviceFilter)}
					>
						<SelectTrigger className="w-[140px]">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">
								<div className="flex items-center gap-2">
									<BarChart3 className="h-4 w-4" />
									<span>All Devices</span>
								</div>
							</SelectItem>
							<SelectItem value="desktop">
								<div className="flex items-center gap-2">
									<Monitor className="h-4 w-4" />
									<span>Desktop</span>
								</div>
							</SelectItem>
							<SelectItem value="tablet">
								<div className="flex items-center gap-2">
									<Tablet className="h-4 w-4" />
									<span>Tablet</span>
								</div>
							</SelectItem>
							<SelectItem value="mobile">
								<div className="flex items-center gap-2">
									<Smartphone className="h-4 w-4" />
									<span>Mobile</span>
								</div>
							</SelectItem>
						</SelectContent>
					</Select>

					{/* Date range filter */}
					<Select
						value={dateRangeFilter}
						onValueChange={(value) => setDateRangeFilter(value as DateRangeFilter)}
					>
						<SelectTrigger className="w-[140px]">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="today">Today</SelectItem>
							<SelectItem value="7days">Last 7 Days</SelectItem>
							<SelectItem value="30days">Last 30 Days</SelectItem>
							<SelectItem value="all">All Time</SelectItem>
						</SelectContent>
					</Select>

					{/* Actions */}
					<Button variant="outline" size="sm" onClick={() => setRefreshKey((prev) => prev + 1)}>
						<RefreshCw className="h-4 w-4" />
					</Button>

					<Button variant="outline" size="sm" onClick={handleExport}>
						<Download className="mr-2 h-4 w-4" />
						Export
					</Button>
				</div>
			</div>

			{/* Statistics Cards */}
			{showStatistics && (
				<div className="grid gap-4 md:grid-cols-4">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
							<MousePointer2 className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{statistics.totalClicks.toLocaleString()}</div>
							<p className="text-xs text-muted-foreground">
								{dateRangeFilter === "all" ? "All time" : `Last ${dateRangeFilter}`}
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Avg Scroll Depth</CardTitle>
							<ArrowDown className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{statistics.averageScrollDepth.toFixed(1)}%</div>
							<p className="text-xs text-muted-foreground">
								{scrollDepths.length} page{scrollDepths.length !== 1 ? "s" : ""} tracked
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Desktop Clicks</CardTitle>
							<Monitor className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{statistics.clicksByDevice.desktop || 0}
							</div>
							<p className="text-xs text-muted-foreground">
								{((statistics.clicksByDevice.desktop || 0) / statistics.totalClicks * 100).toFixed(1)}% of total
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Mobile Clicks</CardTitle>
							<Smartphone className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{statistics.clicksByDevice.mobile || 0}
							</div>
							<p className="text-xs text-muted-foreground">
								{((statistics.clicksByDevice.mobile || 0) / statistics.totalClicks * 100).toFixed(1)}% of total
							</p>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Tabs for different views */}
			<Tabs defaultValue="heatmap" className="w-full">
				<TabsList>
					<TabsTrigger value="heatmap">Heatmap</TabsTrigger>
					<TabsTrigger value="elements">Top Elements</TabsTrigger>
					<TabsTrigger value="devices">Devices</TabsTrigger>
					<TabsTrigger value="scroll">Scroll Depth</TabsTrigger>
				</TabsList>

				{/* Heatmap visualization */}
				<TabsContent value="heatmap" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Click Density Heatmap</CardTitle>
							<CardDescription>
								Red areas indicate high click density, blue areas indicate low density
							</CardDescription>
						</CardHeader>
						<CardContent>
							{heatmapData.length > 0 ? (
								<HeatmapChart
									data={heatmapData}
									title=""
									colorScale={{
										min: "hsl(220, 70%, 80%)", // Light blue (low)
										mid: "hsl(45, 100%, 60%)", // Yellow (medium)
										max: "hsl(0, 100%, 60%)", // Red (high)
									}}
									cellWidth={60}
									cellHeight={40}
									showLabels={false}
									showTooltip={true}
									exportable={true}
								/>
							) : (
								<div className="flex h-64 items-center justify-center text-muted-foreground">
									<div className="text-center">
										<MousePointer2 className="mx-auto h-12 w-12 mb-4 opacity-20" />
										<p>No click data available</p>
										<p className="text-sm">Start clicking around the page to see heatmap data</p>
									</div>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* Top clicked elements */}
				<TabsContent value="elements" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Most Clicked Elements</CardTitle>
							<CardDescription>Elements ranked by total click count</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{topElements.map((item, index) => (
									<div key={item.element} className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<Badge variant="outline" className="w-8 justify-center">
												{index + 1}
											</Badge>
											<div>
												<code className="text-sm font-mono bg-muted px-2 py-1 rounded">
													{item.element}
												</code>
											</div>
										</div>
										<div className="flex items-center gap-4">
											<div className="text-right">
												<div className="text-sm font-medium">{item.count} clicks</div>
												<div className="text-xs text-muted-foreground">
													{item.percentage.toFixed(1)}%
												</div>
											</div>
											<div className="w-24 bg-muted rounded-full h-2">
												<div
													className="bg-primary h-2 rounded-full"
													style={{ width: `${item.percentage}%` }}
												/>
											</div>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Device breakdown */}
				<TabsContent value="devices" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Device Breakdown</CardTitle>
							<CardDescription>Click distribution across device types</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{deviceBreakdown.map((item) => (
									<div key={item.device} className="space-y-2">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												{item.device === "desktop" && <Monitor className="h-4 w-4" />}
												{item.device === "tablet" && <Tablet className="h-4 w-4" />}
												{item.device === "mobile" && <Smartphone className="h-4 w-4" />}
												<span className="font-medium capitalize">{item.device}</span>
											</div>
											<div className="text-sm">
												<span className="font-medium">{item.count}</span>
												<span className="text-muted-foreground ml-1">
													({item.percentage.toFixed(1)}%)
												</span>
											</div>
										</div>
										<div className="w-full bg-muted rounded-full h-2">
											<div
												className="bg-primary h-2 rounded-full transition-all"
												style={{ width: `${item.percentage}%` }}
											/>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Scroll depth */}
				<TabsContent value="scroll" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Scroll Depth Analysis</CardTitle>
							<CardDescription>How far users scroll on each page</CardDescription>
						</CardHeader>
						<CardContent>
							{scrollDepths.length > 0 ? (
								<div className="space-y-4">
									{scrollDepths.map((depth) => (
										<div key={depth.page.path} className="space-y-2">
											<div className="flex items-center justify-between">
												<code className="text-sm font-mono">{depth.page.path}</code>
												<span className="text-sm font-medium">{depth.maxDepth.toFixed(1)}%</span>
											</div>
											<div className="w-full bg-muted rounded-full h-3">
												<div
													className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all"
													style={{ width: `${depth.maxDepth}%` }}
												/>
											</div>
										</div>
									))}
									<Separator className="my-4" />
									<div className="text-sm text-muted-foreground">
										Average scroll depth: {statistics.averageScrollDepth.toFixed(1)}%
									</div>
								</div>
							) : (
								<div className="flex h-32 items-center justify-center text-muted-foreground">
									No scroll depth data available
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
