/**
 * Traffic Sources Chart Component
 *
 * Cycle 73: Traffic Source Tracking
 *
 * Visualizes traffic sources using TreemapChart with:
 * - Hierarchical breakdown (Type → Source → Campaign)
 * - Conversion tracking by source
 * - ROI calculation per source
 * - Interactive drilldown
 * - Real-time updates from Convex
 */

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { TreemapChart, type TreemapNode } from "@/components/ontology-ui/visualization/TreemapChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	Legend,
} from "recharts";
import {
	TrendingUp,
	TrendingDown,
	Users,
	Target,
	DollarSign,
	ExternalLink,
} from "lucide-react";
import {
	getTrafficSourceBreakdown,
	getTrafficSourcesBySources,
	getTrafficSourcesByCampaign,
	type TrafficSourceType,
} from "@/lib/analytics/utm-tracker";

type DateRange = "today" | "7days" | "30days" | "custom";

interface TrafficSourcesChartProps {
	funnelId?: string;
	groupId?: string;
	dateRange?: DateRange;
}

interface SourceData {
	source: string;
	medium: string;
	campaign?: string;
	visitors: number;
	conversions: number;
	conversionRate: number;
	revenue: number;
	roi?: number;
}

interface SourceMetrics {
	totalVisitors: number;
	totalConversions: number;
	totalRevenue: number;
	averageConversionRate: number;
	averageROI: number;
	sources: SourceData[];
}

const SOURCE_TYPE_COLORS: Record<TrafficSourceType, string> = {
	organic: "hsl(var(--chart-1))",
	paid: "hsl(var(--chart-2))",
	email: "hsl(var(--chart-3))",
	social: "hsl(var(--chart-4))",
	direct: "hsl(var(--chart-5))",
	referral: "hsl(142, 71%, 45%)", // Green for referrals
};

export function TrafficSourcesChart({
	funnelId,
	groupId,
	dateRange = "30days",
}: TrafficSourcesChartProps) {
	const [selectedType, setSelectedType] = useState<TrafficSourceType | "all">("all");
	const [viewMode, setViewMode] = useState<"treemap" | "bar">("treemap");

	// Fetch traffic source data from Convex
	const trafficData = useQuery(
		api.queries.analytics.getTrafficSources,
		funnelId
			? {
					funnelId: funnelId as any,
					dateRange,
				}
			: "skip"
	) as SourceMetrics | undefined;

	// Calculate treemap data with hierarchy: Type → Source → Campaign
	const treemapData = useMemo((): TreemapNode[] => {
		if (!trafficData?.sources) return [];

		// Group by type
		const byType: Record<string, SourceData[]> = {};

		trafficData.sources.forEach((source) => {
			const type = categorizeSource(source.medium);
			if (!byType[type]) {
				byType[type] = [];
			}
			byType[type].push(source);
		});

		// Build tree structure
		const treeNodes: TreemapNode[] = Object.entries(byType).map(([type, sources]) => {
			// Group sources by source name
			const bySource: Record<string, SourceData[]> = {};

			sources.forEach((source) => {
				if (!bySource[source.source]) {
					bySource[source.source] = [];
				}
				bySource[source.source].push(source);
			});

			// Build source nodes with campaign children
			const sourceNodes: TreemapNode[] = Object.entries(bySource).map(([sourceName, items]) => {
				const totalVisitors = items.reduce((sum, item) => sum + item.visitors, 0);
				const totalConversions = items.reduce((sum, item) => sum + item.conversions, 0);
				const totalRevenue = items.reduce((sum, item) => sum + item.revenue, 0);

				// Campaign children (if multiple campaigns exist for this source)
				const campaignNodes: TreemapNode[] =
					items.length > 1
						? items
								.filter((item) => item.campaign)
								.map((item) => ({
									name: item.campaign || "Default",
									value: item.visitors,
									data: {
										visitors: item.visitors,
										conversions: item.conversions,
										conversionRate: item.conversionRate,
										revenue: item.revenue,
										roi: item.roi,
									},
								}))
						: [];

				return {
					name: sourceName,
					value: totalVisitors,
					children: campaignNodes.length > 0 ? campaignNodes : undefined,
					data: {
						visitors: totalVisitors,
						conversions: totalConversions,
						conversionRate: (totalConversions / totalVisitors) * 100,
						revenue: totalRevenue,
					},
				};
			});

			const totalVisitors = sourceNodes.reduce((sum, node) => sum + (node.value || 0), 0);

			return {
				name: type,
				value: totalVisitors,
				color: SOURCE_TYPE_COLORS[type as TrafficSourceType],
				children: sourceNodes,
				data: {
					type,
					visitors: totalVisitors,
				},
			};
		});

		// Filter by selected type if not "all"
		if (selectedType !== "all") {
			return treeNodes.filter((node) => node.name === selectedType);
		}

		return treeNodes;
	}, [trafficData, selectedType]);

	// Top sources for bar chart
	const topSources = useMemo(() => {
		if (!trafficData?.sources) return [];

		return trafficData.sources
			.sort((a, b) => b.visitors - a.visitors)
			.slice(0, 10)
			.map((source) => ({
				name: source.source,
				visitors: source.visitors,
				conversions: source.conversions,
				revenue: source.revenue,
			}));
	}, [trafficData]);

	// Source comparison data
	const sourceComparison = useMemo(() => {
		if (!trafficData?.sources) return [];

		return trafficData.sources.map((source) => ({
			source: source.source,
			conversionRate: source.conversionRate,
			roi: source.roi || 0,
		}));
	}, [trafficData]);

	if (trafficData === undefined) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-10 w-64" />
				<Skeleton className="h-96" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header with metrics */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{trafficData.totalVisitors.toLocaleString()}
						</div>
						<p className="text-xs text-muted-foreground">
							Across {trafficData.sources.length} sources
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Conversions</CardTitle>
						<Target className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{trafficData.totalConversions.toLocaleString()}
						</div>
						<p className="text-xs text-muted-foreground">
							{trafficData.averageConversionRate.toFixed(2)}% avg rate
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							${trafficData.totalRevenue.toLocaleString()}
						</div>
						<p className="text-xs text-muted-foreground">
							${(trafficData.totalRevenue / trafficData.totalConversions).toFixed(2)} per
							conversion
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Average ROI</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{trafficData.averageROI > 0 ? "+" : ""}
							{trafficData.averageROI.toFixed(1)}%
						</div>
						<p className="text-xs text-muted-foreground">Return on ad spend</p>
					</CardContent>
				</Card>
			</div>

			{/* Controls */}
			<div className="flex flex-wrap items-center gap-4">
				<div className="flex items-center gap-2">
					<label className="text-sm font-medium">View:</label>
					<Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
						<TabsList>
							<TabsTrigger value="treemap">Treemap</TabsTrigger>
							<TabsTrigger value="bar">Bar Chart</TabsTrigger>
						</TabsList>
					</Tabs>
				</div>

				<div className="flex items-center gap-2">
					<label className="text-sm font-medium">Filter:</label>
					<Select
						value={selectedType}
						onValueChange={(value) => setSelectedType(value as TrafficSourceType | "all")}
					>
						<SelectTrigger className="w-[160px]">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Sources</SelectItem>
							<SelectItem value="organic">Organic</SelectItem>
							<SelectItem value="paid">Paid Ads</SelectItem>
							<SelectItem value="email">Email</SelectItem>
							<SelectItem value="social">Social Media</SelectItem>
							<SelectItem value="direct">Direct</SelectItem>
							<SelectItem value="referral">Referral</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Visualization */}
			{viewMode === "treemap" ? (
				<TreemapChart
					data={treemapData}
					title="Traffic Sources Breakdown"
					enableDrilldown
					showTooltip
					colorScheme={Object.values(SOURCE_TYPE_COLORS)}
					aspectRatio={16 / 9}
					onNodeClick={(node) => {
						console.log("Selected node:", node);
					}}
				/>
			) : (
				<Card>
					<CardHeader>
						<CardTitle>Top 10 Traffic Sources</CardTitle>
						<CardDescription>Visitors, conversions, and revenue by source</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="h-[400px]">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart data={topSources}>
									<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
									<XAxis
										dataKey="name"
										stroke="hsl(var(--muted-foreground))"
										fontSize={12}
										tickLine={false}
									/>
									<YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} />
									<Tooltip
										contentStyle={{
											backgroundColor: "hsl(var(--card))",
											border: "1px solid hsl(var(--border))",
											borderRadius: "8px",
										}}
									/>
									<Legend />
									<Bar dataKey="visitors" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
									<Bar dataKey="conversions" fill="hsl(var(--chart-2))" radius={[8, 8, 0, 0]} />
								</BarChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Source Comparison Table */}
			<Card>
				<CardHeader>
					<CardTitle>Source Performance Comparison</CardTitle>
					<CardDescription>Conversion rates and ROI by traffic source</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{trafficData.sources
							.sort((a, b) => b.visitors - a.visitors)
							.slice(0, 10)
							.map((source) => (
								<div key={`${source.source}-${source.medium}`} className="flex items-center gap-4">
									<div className="flex-1">
										<div className="flex items-center gap-2">
											<span className="font-medium">{source.source}</span>
											<Badge variant="outline" className="text-xs">
												{source.medium}
											</Badge>
											{source.campaign && (
												<span className="text-xs text-muted-foreground">
													{source.campaign}
												</span>
											)}
										</div>
										<div className="flex items-center gap-4 text-sm text-muted-foreground">
											<span>{source.visitors.toLocaleString()} visitors</span>
											<span>{source.conversions.toLocaleString()} conversions</span>
											<span>${source.revenue.toLocaleString()} revenue</span>
										</div>
									</div>

									<div className="flex items-center gap-6">
										<div className="text-right">
											<div className="text-sm font-medium">
												{source.conversionRate.toFixed(2)}%
											</div>
											<div className="text-xs text-muted-foreground">Conv. Rate</div>
										</div>

										{source.roi !== undefined && (
											<div className="text-right">
												<div className="flex items-center gap-1 text-sm font-medium">
													{source.roi > 0 ? (
														<TrendingUp className="h-3 w-3 text-green-600" />
													) : (
														<TrendingDown className="h-3 w-3 text-red-600" />
													)}
													<span className={source.roi > 0 ? "text-green-600" : "text-red-600"}>
														{source.roi > 0 ? "+" : ""}
														{source.roi.toFixed(1)}%
													</span>
												</div>
												<div className="text-xs text-muted-foreground">ROI</div>
											</div>
										)}
									</div>
								</div>
							))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

/**
 * Categorize source based on medium
 */
function categorizeSource(medium: string): TrafficSourceType {
	const m = medium.toLowerCase();

	if (m.includes("cpc") || m.includes("ppc") || m.includes("paid")) {
		return "paid";
	}
	if (m === "email") {
		return "email";
	}
	if (m.includes("social")) {
		return "social";
	}
	if (m === "organic") {
		return "organic";
	}
	if (m === "referral") {
		return "referral";
	}

	return "direct";
}
