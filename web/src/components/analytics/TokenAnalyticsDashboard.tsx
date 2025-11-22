import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PriceChart } from "./PriceChart";
import { VolumeChart } from "./VolumeChart";
import { HolderDistribution } from "./HolderDistribution";
import { RiskScoreCard } from "./RiskScoreCard";
import { MetricsOverview } from "./MetricsOverview";
import { TradingPatternAlert } from "./TradingPatternAlert";
import { HolderList } from "./HolderList";
import type { TokenMetrics, RiskScore, TradingPattern, Holder } from "./types";

interface TokenAnalyticsDashboardProps {
	tokenId: string;
	metrics: TokenMetrics | null;
	riskScore: RiskScore | null;
	holders: Holder[];
	pattern: TradingPattern | null;
	isLoading?: boolean;
}

export function TokenAnalyticsDashboard({
	tokenId,
	metrics,
	riskScore,
	holders,
	pattern,
	isLoading = false,
}: TokenAnalyticsDashboardProps) {
	const [activeTab, setActiveTab] = useState("overview");

	if (isLoading && !metrics) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-32 w-full" />
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					<Skeleton className="h-64 w-full" />
					<Skeleton className="h-64 w-full" />
					<Skeleton className="h-64 w-full" />
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Trading Pattern Alert */}
			{pattern && <TradingPatternAlert pattern={pattern} />}

			{/* Metrics Overview */}
			<MetricsOverview metrics={metrics} isLoading={isLoading} />

			{/* Tabs for Different Views */}
			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="holders">Holders</TabsTrigger>
					<TabsTrigger value="risk">Risk Analysis</TabsTrigger>
				</TabsList>

				{/* Overview Tab */}
				<TabsContent value="overview" className="space-y-6">
					<div className="grid gap-6 md:grid-cols-2">
						<PriceChart
							data={metrics?.priceHistory || []}
							isLoading={isLoading}
						/>
						<VolumeChart
							data={metrics?.volumeHistory || []}
							isLoading={isLoading}
						/>
					</div>

					<div className="grid gap-6 md:grid-cols-3">
						<div className="md:col-span-2">
							<Card>
								<CardHeader>
									<CardTitle>Price & Volume Analysis</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="grid gap-4 md:grid-cols-2">
										<div>
											<div className="text-sm font-medium text-muted-foreground">
												24h High
											</div>
											<div className="text-2xl font-bold">
												$
												{metrics?.priceHistory
													? Math.max(
															...metrics.priceHistory.map((p) => p.price),
														).toFixed(6)
													: "0.00"}
											</div>
										</div>
										<div>
											<div className="text-sm font-medium text-muted-foreground">
												24h Low
											</div>
											<div className="text-2xl font-bold">
												$
												{metrics?.priceHistory
													? Math.min(
															...metrics.priceHistory.map((p) => p.price),
														).toFixed(6)
													: "0.00"}
											</div>
										</div>
										<div>
											<div className="text-sm font-medium text-muted-foreground">
												Total Volume
											</div>
											<div className="text-2xl font-bold">
												$
												{metrics?.volumeHistory
													? (
															metrics.volumeHistory.reduce(
																(sum, v) => sum + v.volume,
																0,
															) / 1000000
														).toFixed(2)
													: "0.00"}
												M
											</div>
										</div>
										<div>
											<div className="text-sm font-medium text-muted-foreground">
												Avg. Transaction
											</div>
											<div className="text-2xl font-bold">
												$
												{metrics?.volume24h && metrics?.transactions24h
													? (
															metrics.volume24h / metrics.transactions24h
														).toFixed(2)
													: "0.00"}
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
						<HolderDistribution holders={holders} isLoading={isLoading} />
					</div>
				</TabsContent>

				{/* Holders Tab */}
				<TabsContent value="holders" className="space-y-6">
					<div className="grid gap-6 md:grid-cols-3">
						<HolderDistribution holders={holders} isLoading={isLoading} />
						<div className="md:col-span-2">
							<Card>
								<CardHeader>
									<CardTitle>Distribution Metrics</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="grid gap-4 md:grid-cols-2">
										<div>
											<div className="text-sm font-medium text-muted-foreground">
												Top 10 Concentration
											</div>
											<div className="text-2xl font-bold">
												{metrics?.distribution.top10Holders.toFixed(2) || "0.00"}
												%
											</div>
											<div className="text-xs text-muted-foreground">
												{metrics?.distribution.top10Holders > 70
													? "⚠️ High concentration risk"
													: metrics?.distribution.top10Holders > 40
														? "⚠ Medium concentration"
														: "✓ Well distributed"}
											</div>
										</div>
										<div>
											<div className="text-sm font-medium text-muted-foreground">
												Total Holders
											</div>
											<div className="text-2xl font-bold">
												{holders.length.toLocaleString()}
											</div>
											<div className="text-xs text-muted-foreground">
												{holders.length > 1000
													? "✓ Good distribution"
													: holders.length > 100
														? "Growing community"
														: "Early stage"}
											</div>
										</div>
										<div>
											<div className="text-sm font-medium text-muted-foreground">
												Largest Holder
											</div>
											<div className="text-2xl font-bold">
												{holders[0]?.percentage.toFixed(2) || "0.00"}%
											</div>
											<div className="text-xs text-muted-foreground">
												{holders[0]?.percentage > 20
													? "⚠️ Centralization risk"
													: "✓ Decentralized"}
											</div>
										</div>
										<div>
											<div className="text-sm font-medium text-muted-foreground">
												Wallet Concentration
											</div>
											<div className="text-2xl font-bold">
												{metrics?.distribution.walletConcentration.toFixed(2) ||
													"0.00"}
											</div>
											<div className="text-xs text-muted-foreground">
												Gini coefficient
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>

					<HolderList holders={holders} isLoading={isLoading} limit={50} />
				</TabsContent>

				{/* Risk Analysis Tab */}
				<TabsContent value="risk" className="space-y-6">
					<div className="grid gap-6 md:grid-cols-3">
						<RiskScoreCard score={riskScore} isLoading={isLoading} />

						<div className="md:col-span-2 space-y-6">
							<Card>
								<CardHeader>
									<CardTitle>Risk Factors Breakdown</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="space-y-3">
										<div>
											<h4 className="text-sm font-medium mb-2">
												Rug Pull Risk
											</h4>
											<p className="text-xs text-muted-foreground">
												Assesses the likelihood of developers abandoning the
												project. Factors include liquidity lock status, team
												transparency, and token distribution.
											</p>
										</div>

										<div>
											<h4 className="text-sm font-medium mb-2">
												Liquidity Risk
											</h4>
											<p className="text-xs text-muted-foreground">
												Measures the ease of buying/selling without significant
												price impact. Low liquidity can lead to high slippage and
												difficulty exiting positions.
											</p>
										</div>

										<div>
											<h4 className="text-sm font-medium mb-2">
												Concentration Risk
											</h4>
											<p className="text-xs text-muted-foreground">
												Evaluates token distribution among holders. High
												concentration means few wallets control large portions,
												increasing manipulation risk.
											</p>
										</div>

										<div>
											<h4 className="text-sm font-medium mb-2">Contract Risk</h4>
											<p className="text-xs text-muted-foreground">
												Analyzes smart contract security, including ownership
												controls, upgrade mechanisms, and potential
												vulnerabilities.
											</p>
										</div>
									</div>
								</CardContent>
							</Card>

							{pattern && (
								<Card>
									<CardHeader>
										<CardTitle>Pattern Analysis</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<div>
											<h4 className="text-sm font-medium mb-2">
												Current Pattern: {pattern.pattern}
											</h4>
											<p className="text-sm text-muted-foreground">
												{pattern.description}
											</p>
										</div>
										<div>
											<h4 className="text-sm font-medium mb-2">
												What This Means
											</h4>
											{pattern.pattern === "accumulation" && (
												<p className="text-sm text-muted-foreground">
													Accumulation patterns often precede price increases as
													informed traders build positions. However, always
													conduct your own research.
												</p>
											)}
											{pattern.pattern === "distribution" && (
												<p className="text-sm text-muted-foreground">
													Distribution patterns may signal that early investors
													are taking profits. This could lead to price pressure.
													Monitor closely.
												</p>
											)}
											{pattern.pattern === "pump" && (
												<p className="text-sm text-muted-foreground">
													Pump patterns indicate unusual and potentially
													coordinated price action. Exercise extreme caution and
													avoid FOMO trading.
												</p>
											)}
											{pattern.pattern === "stable" && (
												<p className="text-sm text-muted-foreground">
													Stable patterns show healthy, organic trading activity
													with no concerning signals detected.
												</p>
											)}
										</div>
									</CardContent>
								</Card>
							)}
						</div>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
