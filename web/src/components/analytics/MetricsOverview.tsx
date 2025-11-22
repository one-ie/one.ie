import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
	TrendingUp,
	TrendingDown,
	DollarSign,
	Users,
	Activity,
	BarChart3,
} from "lucide-react";
import type { TokenMetrics } from "./types";

interface MetricsOverviewProps {
	metrics: TokenMetrics | null;
	isLoading?: boolean;
}

export function MetricsOverview({
	metrics,
	isLoading = false,
}: MetricsOverviewProps) {
	if (isLoading) {
		return (
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{[...Array(4)].map((_, i) => (
					<Card key={i}>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<Skeleton className="h-4 w-20" />
							<Skeleton className="h-4 w-4 rounded" />
						</CardHeader>
						<CardContent>
							<Skeleton className="h-8 w-24" />
							<Skeleton className="mt-1 h-3 w-32" />
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	if (!metrics) {
		return (
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardContent className="flex h-32 items-center justify-center">
						<p className="text-sm text-muted-foreground">No metrics available</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	const formatPrice = (value: number) => {
		if (value < 0.01) {
			return `$${value.toFixed(6)}`;
		}
		return `$${value.toFixed(2)}`;
	};

	const formatVolume = (value: number) => {
		if (value >= 1000000) {
			return `$${(value / 1000000).toFixed(2)}M`;
		}
		if (value >= 1000) {
			return `$${(value / 1000).toFixed(2)}K`;
		}
		return `$${value.toFixed(2)}`;
	};

	const formatMarketCap = (value: number) => {
		if (value >= 1000000000) {
			return `$${(value / 1000000000).toFixed(2)}B`;
		}
		if (value >= 1000000) {
			return `$${(value / 1000000).toFixed(2)}M`;
		}
		return `$${(value / 1000).toFixed(2)}K`;
	};

	const isPositiveChange = metrics.priceChange24h >= 0;

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			{/* Price */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Current Price</CardTitle>
					<DollarSign className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{formatPrice(metrics.price)}</div>
					<div
						className={`flex items-center text-xs ${
							isPositiveChange ? "text-green-600" : "text-red-600"
						}`}
					>
						{isPositiveChange ? (
							<TrendingUp className="mr-1 h-3 w-3" />
						) : (
							<TrendingDown className="mr-1 h-3 w-3" />
						)}
						{isPositiveChange ? "+" : ""}
						{metrics.priceChange24h.toFixed(2)}% (24h)
					</div>
				</CardContent>
			</Card>

			{/* Market Cap */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Market Cap</CardTitle>
					<BarChart3 className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">
						{formatMarketCap(metrics.marketCap)}
					</div>
					<p className="text-xs text-muted-foreground">
						Total supply value in USD
					</p>
				</CardContent>
			</Card>

			{/* Volume 24h */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Volume (24h)</CardTitle>
					<Activity className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">
						{formatVolume(metrics.volume24h)}
					</div>
					<p className="text-xs text-muted-foreground">
						{metrics.transactions24h.toLocaleString()} transactions
					</p>
				</CardContent>
			</Card>

			{/* Holders */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Holders</CardTitle>
					<Users className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">
						{metrics.holders.toLocaleString()}
					</div>
					<p className="text-xs text-muted-foreground">
						Top 10: {metrics.distribution.top10Holders.toFixed(1)}% of supply
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
