/**
 * Funnel Flow Diagram Component
 *
 * Interactive funnel flow visualization using NetworkDiagram with:
 * - Funnel steps as nodes (sized by visitor count)
 * - Conversion rates on edges (thickness by conversion volume)
 * - Drop-off highlights in red
 * - Click-to-drill-down analytics
 *
 * Part of Cycle 74: Funnel Flow Visualization
 */

import { useState, useMemo } from "react";
import { NetworkDiagram, type NetworkNode, type NetworkLink } from "@/components/ontology-ui/visualization/NetworkDiagram";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TrendingDown, TrendingUp, Users, Target, AlertTriangle } from "lucide-react";
import type { FunnelStep } from "@/types/funnel-builder";

// Analytics data per step
export interface StepAnalytics {
	stepId: string;
	stepName: string;
	stepType: string;
	visitors: number;
	conversions: number; // Number who proceeded to next step
	conversionRate: number; // Percentage who converted
	dropOffRate: number; // Percentage who left
	avgTimeOnPage: number; // Seconds
	revenue?: number; // Optional revenue data
}

// Connection between steps
export interface StepConnection {
	fromStepId: string;
	toStepId: string;
	conversionCount: number; // Number of visitors who moved from -> to
	conversionRate: number; // Percentage
	dropOffCount: number; // Number who didn't proceed
}

export interface FunnelFlowDiagramProps {
	steps: FunnelStep[];
	analytics: StepAnalytics[];
	connections: StepConnection[];
	onStepClick?: (stepId: string) => void;
	highlightDropOffThreshold?: number; // Threshold for red highlighting (default 30%)
}

export function FunnelFlowDiagram({
	steps,
	analytics,
	connections,
	onStepClick,
	highlightDropOffThreshold = 30,
}: FunnelFlowDiagramProps) {
	const [selectedStep, setSelectedStep] = useState<StepAnalytics | null>(null);
	const [drillDownOpen, setDrillDownOpen] = useState(false);

	// Convert funnel steps + analytics into network nodes
	const nodes: NetworkNode[] = useMemo(() => {
		return analytics.map((stepAnalytics) => {
			const step = steps.find((s) => s.id === stepAnalytics.stepId);
			const isHighDropOff = stepAnalytics.dropOffRate > highlightDropOffThreshold;

			return {
				id: stepAnalytics.stepId,
				label: stepAnalytics.stepName,
				type: stepAnalytics.stepType,
				cluster: isHighDropOff ? "high-dropoff" : "normal",
				data: {
					visitors: stepAnalytics.visitors,
					conversions: stepAnalytics.conversions,
					conversionRate: stepAnalytics.conversionRate,
					dropOffRate: stepAnalytics.dropOffRate,
					revenue: stepAnalytics.revenue,
					avgTimeOnPage: stepAnalytics.avgTimeOnPage,
					// Size node based on visitor count (logarithmic scale)
					size: Math.max(50, Math.min(200, Math.log(stepAnalytics.visitors + 1) * 30)),
				},
			};
		});
	}, [steps, analytics, highlightDropOffThreshold]);

	// Convert step connections into network edges
	const edges: NetworkLink[] = useMemo(() => {
		return connections.map((conn) => {
			const fromAnalytics = analytics.find((a) => a.stepId === conn.fromStepId);
			const isLowConversion = conn.conversionRate < (100 - highlightDropOffThreshold);

			return {
				source: conn.fromStepId,
				target: conn.toStepId,
				label: `${conn.conversionRate.toFixed(1)}%`,
				// Edge thickness based on conversion volume (normalized)
				strength: Math.min(1, conn.conversionCount / (fromAnalytics?.visitors || 1)),
				type: isLowConversion ? "drop-off" : "normal",
			};
		});
	}, [connections, analytics, highlightDropOffThreshold]);

	// Calculate overall funnel metrics
	const funnelMetrics = useMemo(() => {
		if (analytics.length === 0) return null;

		const totalVisitors = analytics[0]?.visitors || 0;
		const finalConversions = analytics[analytics.length - 1]?.conversions || 0;
		const overallConversionRate = totalVisitors > 0 ? (finalConversions / totalVisitors) * 100 : 0;

		const totalRevenue = analytics.reduce((sum, step) => sum + (step.revenue || 0), 0);
		const avgTimeInFunnel = analytics.reduce((sum, step) => sum + step.avgTimeOnPage, 0);

		// Find biggest drop-off point
		const biggestDropOff = analytics.reduce(
			(max, step) => (step.dropOffRate > max.rate ? { stepName: step.stepName, rate: step.dropOffRate } : max),
			{ stepName: "", rate: 0 }
		);

		return {
			totalVisitors,
			finalConversions,
			overallConversionRate,
			totalRevenue,
			avgTimeInFunnel,
			biggestDropOff,
		};
	}, [analytics]);

	const handleNodeClick = (node: NetworkNode) => {
		const stepAnalytics = analytics.find((a) => a.stepId === node.id);
		if (stepAnalytics) {
			setSelectedStep(stepAnalytics);
			setDrillDownOpen(true);
			onStepClick?.(node.id);
		}
	};

	// Format time in seconds to readable format
	const formatTime = (seconds: number): string => {
		if (seconds < 60) return `${seconds}s`;
		const minutes = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${minutes}m ${secs}s`;
	};

	return (
		<div className="space-y-6">
			{/* Overall Funnel Metrics */}
			{funnelMetrics && (
				<div className="grid gap-4 md:grid-cols-4">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
							<Users className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{funnelMetrics.totalVisitors.toLocaleString()}</div>
							<p className="text-xs text-muted-foreground">Entered funnel at Step 1</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Final Conversions</CardTitle>
							<Target className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{funnelMetrics.finalConversions.toLocaleString()}</div>
							<p className="text-xs text-muted-foreground">Completed entire funnel</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
							<TrendingUp className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{funnelMetrics.overallConversionRate.toFixed(2)}%</div>
							<p className="text-xs text-muted-foreground">Overall funnel performance</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Biggest Drop-Off</CardTitle>
							<AlertTriangle className="h-4 w-4 text-destructive" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-destructive">{funnelMetrics.biggestDropOff.rate.toFixed(1)}%</div>
							<p className="text-xs text-muted-foreground">{funnelMetrics.biggestDropOff.stepName}</p>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Network Diagram */}
			<Card>
				<CardHeader>
					<CardTitle>Funnel Flow Visualization</CardTitle>
					<CardDescription>
						Node size = visitor count • Edge thickness = conversion volume • Red = high drop-off
					</CardDescription>
				</CardHeader>
				<CardContent>
					<NetworkDiagram
						nodes={nodes}
						links={edges}
						title="Step-by-Step Flow"
						layoutType="hierarchical"
						showClusters={false}
						interactive
						onNodeClick={handleNodeClick}
					/>

					{/* Legend */}
					<div className="mt-4 flex flex-wrap items-center gap-4 rounded-lg border bg-muted/50 p-4">
						<div className="flex items-center gap-2">
							<div className="h-3 w-3 rounded-full bg-primary" />
							<span className="text-sm text-muted-foreground">Normal flow</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="h-3 w-3 rounded-full bg-destructive" />
							<span className="text-sm text-muted-foreground">High drop-off (&gt;{highlightDropOffThreshold}%)</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="h-1 w-8 bg-foreground" style={{ height: "4px" }} />
							<span className="text-sm text-muted-foreground">Edge thickness = conversion volume</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="h-8 w-8 rounded-full border-2 border-foreground" />
							<span className="text-sm text-muted-foreground">Node size = visitor count</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Step Analytics Table */}
			<Card>
				<CardHeader>
					<CardTitle>Step-by-Step Breakdown</CardTitle>
					<CardDescription>Click any row to view detailed analytics</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b">
									<th className="py-2 text-left font-medium">Step</th>
									<th className="py-2 text-left font-medium">Type</th>
									<th className="py-2 text-right font-medium">Visitors</th>
									<th className="py-2 text-right font-medium">Conversions</th>
									<th className="py-2 text-right font-medium">Conv. Rate</th>
									<th className="py-2 text-right font-medium">Drop-Off</th>
									<th className="py-2 text-right font-medium">Avg Time</th>
									<th className="py-2 text-right font-medium">Revenue</th>
								</tr>
							</thead>
							<tbody>
								{analytics.map((step, index) => {
									const isHighDropOff = step.dropOffRate > highlightDropOffThreshold;
									const prevStep = index > 0 ? analytics[index - 1] : null;
									const change = prevStep ? ((step.visitors - prevStep.conversions) / prevStep.conversions) * 100 : 0;

									return (
										<tr
											key={step.stepId}
											className="cursor-pointer border-b transition-colors hover:bg-muted/50"
											onClick={() => {
												setSelectedStep(step);
												setDrillDownOpen(true);
												onStepClick?.(step.stepId);
											}}
										>
											<td className="py-3">
												<div className="flex items-center gap-2">
													<span className="font-medium">{step.stepName}</span>
													{isHighDropOff && <AlertTriangle className="h-4 w-4 text-destructive" />}
												</div>
											</td>
											<td className="py-3">
												<Badge variant="outline">{step.stepType}</Badge>
											</td>
											<td className="py-3 text-right font-mono">{step.visitors.toLocaleString()}</td>
											<td className="py-3 text-right font-mono">{step.conversions.toLocaleString()}</td>
											<td className="py-3 text-right">
												<div className="flex items-center justify-end gap-1">
													<span className="font-medium">{step.conversionRate.toFixed(1)}%</span>
													{step.conversionRate > 70 ? (
														<TrendingUp className="h-3 w-3 text-green-600" />
													) : step.conversionRate < 40 ? (
														<TrendingDown className="h-3 w-3 text-destructive" />
													) : null}
												</div>
											</td>
											<td className="py-3 text-right">
												<span className={isHighDropOff ? "font-bold text-destructive" : ""}>
													{step.dropOffRate.toFixed(1)}%
												</span>
											</td>
											<td className="py-3 text-right font-mono text-muted-foreground">
												{formatTime(step.avgTimeOnPage)}
											</td>
											<td className="py-3 text-right font-mono">
												{step.revenue ? `$${step.revenue.toLocaleString()}` : "-"}
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>

			{/* Drill-Down Dialog */}
			<Dialog open={drillDownOpen} onOpenChange={setDrillDownOpen}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>{selectedStep?.stepName} - Detailed Analytics</DialogTitle>
						<DialogDescription>Deep dive into this step's performance metrics</DialogDescription>
					</DialogHeader>

					{selectedStep && (
						<div className="space-y-6">
							{/* Key Metrics Grid */}
							<div className="grid gap-4 md:grid-cols-3">
								<Card>
									<CardHeader className="pb-2">
										<CardTitle className="text-sm font-medium">Visitors</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="text-2xl font-bold">{selectedStep.visitors.toLocaleString()}</div>
									</CardContent>
								</Card>

								<Card>
									<CardHeader className="pb-2">
										<CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="text-2xl font-bold">{selectedStep.conversionRate.toFixed(1)}%</div>
										<p className="text-xs text-muted-foreground">
											{selectedStep.conversions} proceeded to next step
										</p>
									</CardContent>
								</Card>

								<Card>
									<CardHeader className="pb-2">
										<CardTitle className="text-sm font-medium">Drop-Off Rate</CardTitle>
									</CardHeader>
									<CardContent>
										<div
											className={`text-2xl font-bold ${
												selectedStep.dropOffRate > highlightDropOffThreshold ? "text-destructive" : ""
											}`}
										>
											{selectedStep.dropOffRate.toFixed(1)}%
										</div>
										<p className="text-xs text-muted-foreground">
											{Math.floor((selectedStep.visitors * selectedStep.dropOffRate) / 100)} visitors left
										</p>
									</CardContent>
								</Card>
							</div>

							{/* Additional Metrics */}
							<div className="space-y-3 rounded-lg border p-4">
								<div className="flex justify-between">
									<span className="text-sm text-muted-foreground">Step Type</span>
									<Badge variant="outline">{selectedStep.stepType}</Badge>
								</div>
								<div className="flex justify-between">
									<span className="text-sm text-muted-foreground">Average Time on Page</span>
									<span className="font-mono text-sm">{formatTime(selectedStep.avgTimeOnPage)}</span>
								</div>
								{selectedStep.revenue !== undefined && (
									<div className="flex justify-between">
										<span className="text-sm text-muted-foreground">Revenue Generated</span>
										<span className="font-mono text-sm font-medium">${selectedStep.revenue.toLocaleString()}</span>
									</div>
								)}
							</div>

							{/* Recommendations */}
							{selectedStep.dropOffRate > highlightDropOffThreshold && (
								<div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
									<div className="flex items-start gap-2">
										<AlertTriangle className="mt-0.5 h-5 w-5 text-destructive" />
										<div className="space-y-2">
											<p className="font-medium text-destructive">High Drop-Off Detected</p>
											<p className="text-sm text-muted-foreground">
												This step is losing {selectedStep.dropOffRate.toFixed(1)}% of visitors. Consider:
											</p>
											<ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
												<li>Simplifying the page layout</li>
												<li>Adding trust signals (testimonials, guarantees)</li>
												<li>Reducing form fields or friction points</li>
												<li>A/B testing different headlines or CTAs</li>
											</ul>
										</div>
									</div>
								</div>
							)}

							{/* Action Buttons */}
							<div className="flex justify-end gap-2">
								<Button variant="outline" onClick={() => setDrillDownOpen(false)}>
									Close
								</Button>
								<Button
									onClick={() => {
										// Navigate to step editor or detailed analytics
										window.location.href = `/funnels/${selectedStep.stepId}/edit`;
									}}
								>
									Edit Step
								</Button>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
