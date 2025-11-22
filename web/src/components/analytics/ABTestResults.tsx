/**
 * A/B Test Results Component
 *
 * Displays comprehensive A/B test analysis with:
 * - Results table (variant, visitors, conversions, conversion rate, confidence)
 * - Winner badge highlighting the best-performing variant
 * - Bar chart showing conversions by variant
 * - Line chart showing performance over time
 * - Statistical significance indicators (95%, 99% confidence)
 * - Declare winner button to end test and apply winning variant
 * - Historical tests list
 *
 * Part of Cycle 76: A/B Test Results Dashboard
 */

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { DynamicTable } from "@/components/ontology-ui/generative/DynamicTable";
import { DynamicChart } from "@/components/ontology-ui/generative/DynamicChart";
import { StreamingChart } from "@/components/ontology-ui/streaming/StreamingChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Trophy,
	TrendingUp,
	TrendingDown,
	CheckCircle,
	AlertCircle,
	BarChart3,
	LineChart as LineChartIcon,
	Clock,
	Users,
	Target,
	Percent,
} from "lucide-react";
import { toast } from "sonner";

interface ABTestResultsProps {
	testId: string;
	funnelId: string;
	groupId?: string;
}

interface Variant {
	id: string;
	name: string;
	visitors: number;
	conversions: number;
	conversionRate: number;
	confidence: number;
	isControl: boolean;
	isWinner?: boolean;
}

interface ABTestData {
	id: string;
	name: string;
	status: "running" | "completed" | "paused";
	startDate: number;
	endDate?: number;
	variants: Variant[];
	performanceOverTime: Array<{
		timestamp: number;
		variantId: string;
		variantName: string;
		conversions: number;
		visitors: number;
	}>;
	winner?: string;
}

export function ABTestResults({ testId, funnelId, groupId }: ABTestResultsProps) {
	const [selectedTab, setSelectedTab] = useState<"overview" | "charts" | "history">("overview");

	// Fetch A/B test data from Convex
	const testData = useQuery(api.queries.abTests.getResults, {
		testId: testId as any,
	}) as ABTestData | undefined;

	// Fetch historical tests
	const historicalTests = useQuery(api.queries.abTests.listByFunnel, {
		funnelId: funnelId as any,
	});

	// Declare winner mutation
	const declareWinner = useMutation(api.mutations.abTests.declareWinner);

	// Calculate statistical significance
	const calculateConfidence = (variant: Variant, control: Variant): number => {
		// Simple z-test for proportion difference
		const p1 = variant.conversionRate / 100;
		const p2 = control.conversionRate / 100;
		const n1 = variant.visitors;
		const n2 = control.visitors;

		if (n1 === 0 || n2 === 0) return 0;

		const pPool = (variant.conversions + control.conversions) / (n1 + n2);
		const se = Math.sqrt(pPool * (1 - pPool) * (1 / n1 + 1 / n2));

		if (se === 0) return 0;

		const z = Math.abs(p1 - p2) / se;

		// Convert z-score to confidence level
		if (z >= 2.576) return 99; // 99% confidence
		if (z >= 1.96) return 95; // 95% confidence
		if (z >= 1.645) return 90; // 90% confidence
		return Math.min(Math.round(z * 50), 89);
	};

	// Determine winner
	const winner = useMemo(() => {
		if (!testData || testData.variants.length === 0) return null;

		const sorted = [...testData.variants].sort(
			(a, b) => b.conversionRate - a.conversionRate
		);

		const topVariant = sorted[0];
		const control = testData.variants.find((v) => v.isControl);

		if (!control) return null;

		const confidence = calculateConfidence(topVariant, control);

		return {
			...topVariant,
			confidence,
			isStatisticallySignificant: confidence >= 95,
		};
	}, [testData]);

	// Handle declare winner
	const handleDeclareWinner = async () => {
		if (!winner) {
			toast.error("No clear winner yet");
			return;
		}

		if (!winner.isStatisticallySignificant) {
			toast.error("Winner is not statistically significant (needs 95% confidence)");
			return;
		}

		try {
			await declareWinner({
				testId: testId as any,
				winnerId: winner.id as any,
			});

			toast.success(`Variant "${winner.name}" declared as winner!`);
		} catch (error) {
			toast.error("Failed to declare winner");
			console.error(error);
		}
	};

	// Loading state
	if (testData === undefined) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-32" />
				<Skeleton className="h-64" />
				<Skeleton className="h-96" />
			</div>
		);
	}

	// No data state
	if (!testData) {
		return (
			<Card>
				<CardContent className="flex flex-col items-center justify-center py-12">
					<AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
					<p className="text-lg font-medium">A/B Test Not Found</p>
					<p className="text-sm text-muted-foreground">The test may have been deleted</p>
				</CardContent>
			</Card>
		);
	}

	// Prepare table data
	const tableData = testData.variants.map((variant) => {
		const control = testData.variants.find((v) => v.isControl);
		const confidence = control ? calculateConfidence(variant, control) : 0;

		return {
			variant: variant.name,
			visitors: variant.visitors,
			conversions: variant.conversions,
			conversionRate: `${variant.conversionRate.toFixed(2)}%`,
			confidence: confidence,
			isControl: variant.isControl,
			isWinner: winner?.id === variant.id,
			rawConversionRate: variant.conversionRate,
		};
	});

	// Prepare chart data
	const barChartData = testData.variants.map((variant) => ({
		label: variant.name,
		value: variant.conversions,
	}));

	const lineChartData = testData.performanceOverTime.map((point) => ({
		timestamp: point.timestamp,
		value: point.conversions,
		label: point.variantName,
		variantName: point.variantName,
	}));

	// Table columns
	const columns = [
		{
			key: "variant",
			label: "Variant",
			render: (value: string, row: any) => (
				<div className="flex items-center gap-2">
					<span className="font-medium">{value}</span>
					{row.isControl && (
						<Badge variant="outline" className="text-xs">
							Control
						</Badge>
					)}
					{row.isWinner && (
						<Badge variant="default" className="text-xs bg-green-600">
							<Trophy className="h-3 w-3 mr-1" />
							Winner
						</Badge>
					)}
				</div>
			),
		},
		{
			key: "visitors",
			label: "Visitors",
			render: (value: number) => value.toLocaleString(),
		},
		{
			key: "conversions",
			label: "Conversions",
			render: (value: number) => value.toLocaleString(),
		},
		{
			key: "conversionRate",
			label: "Conversion Rate",
			render: (value: string, row: any) => (
				<div className="flex items-center gap-2">
					<span className="font-semibold">{value}</span>
					{!row.isControl && (
						<span
							className={`text-xs ${
								row.rawConversionRate > tableData.find((r) => r.isControl)?.rawConversionRate
									? "text-green-600"
									: "text-red-600"
							}`}
						>
							{row.rawConversionRate > tableData.find((r) => r.isControl)?.rawConversionRate ? (
								<TrendingUp className="h-4 w-4" />
							) : (
								<TrendingDown className="h-4 w-4" />
							)}
						</span>
					)}
				</div>
			),
		},
		{
			key: "confidence",
			label: "Confidence",
			render: (value: number) => (
				<Badge
					variant={value >= 95 ? "default" : value >= 90 ? "secondary" : "outline"}
					className={
						value >= 95
							? "bg-green-600"
							: value >= 90
								? "bg-yellow-600"
								: ""
					}
				>
					{value}%
				</Badge>
			),
		},
	];

	return (
		<div className="space-y-6">
			{/* Test Header */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-2xl">{testData.name}</CardTitle>
							<CardDescription>
								Started {new Date(testData.startDate).toLocaleDateString()}
								{testData.endDate && ` • Ended ${new Date(testData.endDate).toLocaleDateString()}`}
							</CardDescription>
						</div>
						<div className="flex items-center gap-2">
							<Badge
								variant={
									testData.status === "running"
										? "default"
										: testData.status === "completed"
											? "secondary"
											: "outline"
								}
								className={
									testData.status === "running"
										? "bg-green-600"
										: testData.status === "completed"
											? "bg-blue-600"
											: ""
								}
							>
								{testData.status === "running" && (
									<span className="flex items-center gap-1">
										<span className="relative flex h-2 w-2">
											<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
											<span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
										</span>
										Running
									</span>
								)}
								{testData.status === "completed" && "Completed"}
								{testData.status === "paused" && "Paused"}
							</Badge>
						</div>
					</div>
				</CardHeader>

				{/* Winner Card */}
				{winner && winner.isStatisticallySignificant && (
					<CardContent>
						<div className="rounded-lg border-2 border-green-600 bg-green-50 dark:bg-green-950 p-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<Trophy className="h-8 w-8 text-green-600" />
									<div>
										<p className="text-sm text-muted-foreground">Statistical Winner</p>
										<p className="text-xl font-bold text-green-600">{winner.name}</p>
										<p className="text-sm text-muted-foreground">
											{winner.conversionRate.toFixed(2)}% conversion rate • {winner.confidence}%
											confidence
										</p>
									</div>
								</div>
								{testData.status === "running" && (
									<Button onClick={handleDeclareWinner} className="bg-green-600 hover:bg-green-700">
										<CheckCircle className="mr-2 h-4 w-4" />
										Declare Winner
									</Button>
								)}
							</div>
						</div>
					</CardContent>
				)}
			</Card>

			{/* Key Metrics */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{testData.variants.reduce((sum, v) => sum + v.visitors, 0).toLocaleString()}
						</div>
						<p className="text-xs text-muted-foreground">Across all variants</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Conversions</CardTitle>
						<Target className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{testData.variants.reduce((sum, v) => sum + v.conversions, 0).toLocaleString()}
						</div>
						<p className="text-xs text-muted-foreground">Across all variants</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Best Performance</CardTitle>
						<Percent className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{winner ? `${winner.conversionRate.toFixed(2)}%` : "N/A"}
						</div>
						<p className="text-xs text-muted-foreground">{winner?.name || "No clear winner"}</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Duration</CardTitle>
						<Clock className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{testData.endDate
								? `${Math.round((testData.endDate - testData.startDate) / (1000 * 60 * 60 * 24))} days`
								: `${Math.round((Date.now() - testData.startDate) / (1000 * 60 * 60 * 24))} days`}
						</div>
						<p className="text-xs text-muted-foreground">
							{testData.status === "running" ? "Running" : "Completed"}
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Tabbed Content */}
			<Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as any)}>
				<TabsList>
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="charts">Charts</TabsTrigger>
					<TabsTrigger value="history">Historical Tests</TabsTrigger>
				</TabsList>

				{/* Overview Tab */}
				<TabsContent value="overview" className="space-y-4">
					<DynamicTable
						title="Variant Performance"
						description="Detailed results for each variant"
						data={tableData}
						columns={columns}
						searchable={false}
						sortable={true}
						filterable={false}
						paginated={false}
						exportable={true}
					/>
				</TabsContent>

				{/* Charts Tab */}
				<TabsContent value="charts" className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2">
						<DynamicChart
							title="Conversions by Variant"
							description="Total conversions for each variant"
							data={barChartData}
							defaultType="bar"
							showLegend={false}
							showGrid={true}
							animated={true}
							exportable={true}
							height={300}
						/>

						<StreamingChart
							data={lineChartData}
							type="line"
							title="Performance Over Time"
							xAxisKey="timestamp"
							yAxisKey="value"
							color="hsl(var(--primary))"
							maxDataPoints={100}
							showLegend={true}
							showGrid={true}
							height={300}
						/>
					</div>

					{/* Statistical Significance Explanation */}
					<Card>
						<CardHeader>
							<CardTitle>Statistical Significance</CardTitle>
							<CardDescription>Understanding confidence levels</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid gap-4 md:grid-cols-3">
								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<Badge variant="default" className="bg-green-600">
											99%
										</Badge>
										<span className="text-sm font-medium">High Confidence</span>
									</div>
									<p className="text-xs text-muted-foreground">
										Very strong evidence the difference is real, not due to chance
									</p>
								</div>

								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<Badge variant="default" className="bg-green-600">
											95%
										</Badge>
										<span className="text-sm font-medium">Standard Confidence</span>
									</div>
									<p className="text-xs text-muted-foreground">
										Strong evidence - industry standard for declaring a winner
									</p>
								</div>

								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<Badge variant="outline">&lt;95%</Badge>
										<span className="text-sm font-medium">Low Confidence</span>
									</div>
									<p className="text-xs text-muted-foreground">
										Insufficient evidence - continue testing or increase sample size
									</p>
								</div>
							</div>

							<Separator />

							<div className="rounded-lg bg-muted p-4">
								<p className="text-sm">
									<strong>Note:</strong> We recommend at least <strong>95% confidence</strong>{" "}
									before declaring a winner. This ensures the results are statistically significant
									and not due to random variation.
								</p>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Historical Tests Tab */}
				<TabsContent value="history">
					<Card>
						<CardHeader>
							<CardTitle>Historical A/B Tests</CardTitle>
							<CardDescription>All tests for this funnel</CardDescription>
						</CardHeader>
						<CardContent>
							{historicalTests === undefined ? (
								<Skeleton className="h-32" />
							) : historicalTests && historicalTests.length > 0 ? (
								<div className="space-y-2">
									{historicalTests.map((test: any) => (
										<div
											key={test._id}
											className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
										>
											<div>
												<p className="font-medium">{test.name}</p>
												<p className="text-sm text-muted-foreground">
													{new Date(test.startDate).toLocaleDateString()}
													{test.endDate && ` - ${new Date(test.endDate).toLocaleDateString()}`}
												</p>
											</div>
											<div className="flex items-center gap-2">
												<Badge
													variant={
														test.status === "running"
															? "default"
															: test.status === "completed"
																? "secondary"
																: "outline"
													}
												>
													{test.status}
												</Badge>
												{test.winner && (
													<Badge variant="default" className="bg-green-600">
														Winner: {test.winner}
													</Badge>
												)}
												<Button
													variant="outline"
													size="sm"
													onClick={() => (window.location.href = `/funnels/${funnelId}/ab-tests/${test._id}/results`)}
												>
													View Results
												</Button>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
									<BarChart3 className="h-12 w-12 mb-2" />
									<p>No historical tests found</p>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
