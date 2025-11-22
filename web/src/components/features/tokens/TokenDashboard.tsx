"use client";

import * as React from "react";
import { useState } from "react";
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Copy,
	Share2,
	Download,
	ExternalLink,
	TrendingUp,
	TrendingDown,
	Users,
	Activity,
	DollarSign,
} from "lucide-react";

/**
 * Token data from Convex backend
 */
interface Token {
	_id: string;
	name: string;
	symbol: string;
	contractAddress: string;
	network: string;
	price: number;
	marketCap: number;
	totalSupply: number;
	holders: number;
	volume24h: number;
	priceChange24h: number;
	website?: string;
	twitter?: string;
	discord?: string;
	telegram?: string;
	riskScore?: number;
}

/**
 * Token holder data
 */
interface TokenHolder {
	address: string;
	balance: number;
	percentage: number;
	isContract: boolean;
}

/**
 * Token transaction data
 */
interface TokenTransaction {
	_id: string;
	hash: string;
	type: "transfer" | "mint" | "burn";
	from: string;
	to: string;
	amount: number;
	timestamp: number;
}

/**
 * Token stats for chart
 */
interface TokenStats {
	timestamp: number;
	price: number;
	volume: number;
}

interface TokenDashboardProps {
	tokenId: string;
	/**
	 * Optional: Use this to provide static data instead of Convex query
	 */
	staticData?: {
		token: Token;
		holders: TokenHolder[];
		transactions: TokenTransaction[];
		stats: TokenStats[];
	};
}

export function TokenDashboard({ tokenId, staticData }: TokenDashboardProps) {
	const [chartTimeframe, setChartTimeframe] = useState<"24h" | "7d" | "30d">(
		"7d",
	);

	// Convex queries (only if staticData not provided)
	const token = staticData?.token ?? useQuery(api.tokens.get, { id: tokenId });
	const holders =
		staticData?.holders ?? useQuery(api.tokens.getHolders, { id: tokenId });
	const transactions =
		staticData?.transactions ??
		useQuery(api.tokens.getTransactions, { id: tokenId });
	const stats =
		staticData?.stats ??
		useQuery(api.tokens.getStats, { id: tokenId, timeframe: chartTimeframe });

	// Loading state
	if (!token) {
		return <TokenDashboardSkeleton />;
	}

	// Helper functions
	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
		// TODO: Add toast notification
	};

	const shareToken = async () => {
		try {
			await navigator.share({
				title: `${token.name} (${token.symbol})`,
				text: `Check out ${token.name} on ${token.network}`,
				url: window.location.href,
			});
		} catch (err) {
			// Fallback to copy URL
			copyToClipboard(window.location.href);
		}
	};

	const exportData = () => {
		if (!holders) return;

		// Export holders as CSV
		const csv = [
			["Address", "Balance", "Percentage", "Type"],
			...holders.map((h) => [
				h.address,
				h.balance.toString(),
				`${h.percentage.toFixed(2)}%`,
				h.isContract ? "Contract" : "Wallet",
			]),
		]
			.map((row) => row.join(","))
			.join("\n");

		const blob = new Blob([csv], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `${token.symbol}-holders.csv`;
		a.click();
		URL.revokeObjectURL(url);
	};

	const formatNumber = (num: number) => {
		if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}B`;
		if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
		if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`;
		return num.toFixed(2);
	};

	const formatAddress = (address: string) => {
		return `${address.slice(0, 6)}...${address.slice(-4)}`;
	};

	const getRiskColor = (score?: number) => {
		if (!score) return "secondary";
		if (score < 30) return "default"; // Low risk
		if (score < 70) return "outline"; // Medium risk
		return "destructive"; // High risk
	};

	const getRiskLabel = (score?: number) => {
		if (!score) return "Unknown";
		if (score < 30) return "Low Risk";
		if (score < 70) return "Medium Risk";
		return "High Risk";
	};

	return (
		<div className="space-y-6">
			{/* Overview Section */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Price</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">${token.price.toFixed(6)}</div>
						<p
							className={`text-xs ${
								token.priceChange24h >= 0
									? "text-green-600 dark:text-green-400"
									: "text-red-600 dark:text-red-400"
							} flex items-center gap-1`}
						>
							{token.priceChange24h >= 0 ? (
								<TrendingUp className="h-3 w-3" />
							) : (
								<TrendingDown className="h-3 w-3" />
							)}
							{token.priceChange24h >= 0 ? "+" : ""}
							{token.priceChange24h.toFixed(2)}% (24h)
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Market Cap</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							${formatNumber(token.marketCap)}
						</div>
						<p className="text-xs text-muted-foreground">
							{formatNumber(token.totalSupply)} total supply
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Holders</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{formatNumber(token.holders)}
						</div>
						<p className="text-xs text-muted-foreground">Unique addresses</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">24h Volume</CardTitle>
						<Activity className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							${formatNumber(token.volume24h)}
						</div>
						<p className="text-xs text-muted-foreground">Trading volume</p>
					</CardContent>
				</Card>
			</div>

			{/* Chart Section */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>Price & Volume</CardTitle>
							<CardDescription>
								Token price and trading volume over time
							</CardDescription>
						</div>
						<div className="flex gap-2">
							<Button
								variant={chartTimeframe === "24h" ? "default" : "outline"}
								size="sm"
								onClick={() => setChartTimeframe("24h")}
							>
								24H
							</Button>
							<Button
								variant={chartTimeframe === "7d" ? "default" : "outline"}
								size="sm"
								onClick={() => setChartTimeframe("7d")}
							>
								7D
							</Button>
							<Button
								variant={chartTimeframe === "30d" ? "default" : "outline"}
								size="sm"
								onClick={() => setChartTimeframe("30d")}
							>
								30D
							</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<Tabs defaultValue="price" className="w-full">
						<TabsList className="grid w-full max-w-[400px] grid-cols-2">
							<TabsTrigger value="price">Price</TabsTrigger>
							<TabsTrigger value="volume">Volume</TabsTrigger>
						</TabsList>
						<TabsContent value="price" className="h-[350px] w-full pt-4">
							{stats && stats.length > 0 ? (
								<ResponsiveContainer width="100%" height="100%">
									<AreaChart
										data={stats}
										margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
									>
										<defs>
											<linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
												<stop
													offset="5%"
													stopColor="hsl(var(--color-primary))"
													stopOpacity={0.3}
												/>
												<stop
													offset="95%"
													stopColor="hsl(var(--color-primary))"
													stopOpacity={0}
												/>
											</linearGradient>
										</defs>
										<CartesianGrid
											strokeDasharray="3 3"
											stroke="hsl(var(--color-border))"
											vertical={false}
										/>
										<XAxis
											dataKey="timestamp"
											stroke="hsl(var(--color-muted-foreground))"
											fontSize={12}
											tickLine={false}
											axisLine={false}
											tickFormatter={(value) =>
												new Date(value).toLocaleDateString()
											}
										/>
										<YAxis
											stroke="hsl(var(--color-muted-foreground))"
											fontSize={12}
											tickLine={false}
											axisLine={false}
											tickFormatter={(value) => `$${formatNumber(value)}`}
										/>
										<Tooltip
											contentStyle={{
												backgroundColor: "hsl(var(--color-card))",
												border: "1px solid hsl(var(--color-border))",
												borderRadius: "8px",
												color: "hsl(var(--color-foreground))",
											}}
											formatter={(value: number) => [`$${value.toFixed(6)}`, ""]}
											labelFormatter={(label) =>
												new Date(label).toLocaleString()
											}
										/>
										<Area
											type="monotone"
											dataKey="price"
											stroke="hsl(var(--color-primary))"
											strokeWidth={2}
											fillOpacity={1}
											fill="url(#colorPrice)"
											name="Price"
										/>
									</AreaChart>
								</ResponsiveContainer>
							) : (
								<div className="flex h-full items-center justify-center text-muted-foreground">
									No chart data available
								</div>
							)}
						</TabsContent>
						<TabsContent value="volume" className="h-[350px] w-full pt-4">
							{stats && stats.length > 0 ? (
								<ResponsiveContainer width="100%" height="100%">
									<BarChart
										data={stats}
										margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
									>
										<CartesianGrid
											strokeDasharray="3 3"
											stroke="hsl(var(--color-border))"
											vertical={false}
										/>
										<XAxis
											dataKey="timestamp"
											stroke="hsl(var(--color-muted-foreground))"
											fontSize={12}
											tickLine={false}
											axisLine={false}
											tickFormatter={(value) =>
												new Date(value).toLocaleDateString()
											}
										/>
										<YAxis
											stroke="hsl(var(--color-muted-foreground))"
											fontSize={12}
											tickLine={false}
											axisLine={false}
											tickFormatter={(value) => `$${formatNumber(value)}`}
										/>
										<Tooltip
											contentStyle={{
												backgroundColor: "hsl(var(--color-card))",
												border: "1px solid hsl(var(--color-border))",
												borderRadius: "8px",
												color: "hsl(var(--color-foreground))",
											}}
											formatter={(value: number) => [`$${formatNumber(value)}`, ""]}
											labelFormatter={(label) =>
												new Date(label).toLocaleString()
											}
										/>
										<Bar
											dataKey="volume"
											fill="hsl(var(--color-accent))"
											radius={[4, 4, 0, 0]}
											name="Volume"
										/>
									</BarChart>
								</ResponsiveContainer>
							) : (
								<div className="flex h-full items-center justify-center text-muted-foreground">
									No chart data available
								</div>
							)}
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>

			{/* Holders & Transactions Section */}
			<div className="grid gap-4 lg:grid-cols-2">
				{/* Holders Table */}
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle>Top Holders</CardTitle>
								<CardDescription>
									Largest token holders by percentage
								</CardDescription>
							</div>
							<Button variant="outline" size="sm" onClick={exportData}>
								<Download className="mr-2 h-4 w-4" />
								Export CSV
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						{holders && holders.length > 0 ? (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Rank</TableHead>
										<TableHead>Address</TableHead>
										<TableHead className="text-right">Balance</TableHead>
										<TableHead className="text-right">%</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{holders.slice(0, 10).map((holder, index) => (
										<TableRow key={holder.address}>
											<TableCell className="font-medium">{index + 1}</TableCell>
											<TableCell className="font-mono text-xs">
												<div className="flex items-center gap-2">
													{formatAddress(holder.address)}
													{holder.isContract && (
														<Badge variant="outline" className="text-xs">
															Contract
														</Badge>
													)}
												</div>
											</TableCell>
											<TableCell className="text-right">
												{formatNumber(holder.balance)}
											</TableCell>
											<TableCell className="text-right">
												{holder.percentage.toFixed(2)}%
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						) : (
							<div className="flex h-32 items-center justify-center text-muted-foreground">
								No holder data available
							</div>
						)}
					</CardContent>
				</Card>

				{/* Transactions Table */}
				<Card>
					<CardHeader>
						<CardTitle>Recent Transactions</CardTitle>
						<CardDescription>Latest transfers, mints, and burns</CardDescription>
					</CardHeader>
					<CardContent>
						{transactions && transactions.length > 0 ? (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Type</TableHead>
										<TableHead>From/To</TableHead>
										<TableHead className="text-right">Amount</TableHead>
										<TableHead className="text-right">Time</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{transactions.slice(0, 10).map((tx) => (
										<TableRow key={tx._id}>
											<TableCell>
												<Badge
													variant={
														tx.type === "mint"
															? "default"
															: tx.type === "burn"
																? "destructive"
																: "outline"
													}
												>
													{tx.type}
												</Badge>
											</TableCell>
											<TableCell className="font-mono text-xs">
												<div className="flex flex-col gap-1">
													<span className="text-muted-foreground">
														{formatAddress(tx.from)}
													</span>
													<span>→ {formatAddress(tx.to)}</span>
												</div>
											</TableCell>
											<TableCell className="text-right">
												{formatNumber(tx.amount)}
											</TableCell>
											<TableCell className="text-right text-xs text-muted-foreground">
												{new Date(tx.timestamp).toLocaleTimeString()}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						) : (
							<div className="flex h-32 items-center justify-center text-muted-foreground">
								No transaction data available
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Contract Info & Socials Section */}
			<div className="grid gap-4 lg:grid-cols-2">
				{/* Contract Info */}
				<Card>
					<CardHeader>
						<CardTitle>Contract Information</CardTitle>
						<CardDescription>Smart contract details</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<div className="text-sm font-medium text-muted-foreground">
								Contract Address
							</div>
							<div className="flex items-center gap-2">
								<code className="flex-1 rounded-md bg-muted p-2 text-xs font-mono">
									{token.contractAddress}
								</code>
								<Button
									variant="outline"
									size="sm"
									onClick={() => copyToClipboard(token.contractAddress)}
								>
									<Copy className="h-4 w-4" />
								</Button>
							</div>
						</div>

						<Separator />

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-1">
								<div className="text-sm font-medium text-muted-foreground">
									Network
								</div>
								<Badge variant="secondary">{token.network}</Badge>
							</div>
							<div className="space-y-1">
								<div className="text-sm font-medium text-muted-foreground">
									Total Supply
								</div>
								<div className="text-sm font-medium">
									{formatNumber(token.totalSupply)}
								</div>
							</div>
						</div>

						{token.riskScore !== undefined && (
							<>
								<Separator />
								<div className="space-y-2">
									<div className="text-sm font-medium text-muted-foreground">
										Risk Assessment
									</div>
									<div className="flex items-center gap-2">
										<Badge variant={getRiskColor(token.riskScore)}>
											{getRiskLabel(token.riskScore)}
										</Badge>
										<span className="text-sm text-muted-foreground">
											Score: {token.riskScore}/100
										</span>
									</div>
								</div>
							</>
						)}

						<Separator />

						<div className="flex gap-2">
							<Button variant="outline" size="sm" className="flex-1" asChild>
								<a
									href={`https://etherscan.io/token/${token.contractAddress}`}
									target="_blank"
									rel="noopener noreferrer"
								>
									View on Etherscan
									<ExternalLink className="ml-2 h-3 w-3" />
								</a>
							</Button>
							<Button
								variant="outline"
								size="sm"
								className="flex-1"
								onClick={shareToken}
							>
								<Share2 className="mr-2 h-4 w-4" />
								Share
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Social Links */}
				<Card>
					<CardHeader>
						<CardTitle>Community & Resources</CardTitle>
						<CardDescription>Official links and social media</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{token.website && (
							<Button variant="outline" className="w-full justify-start" asChild>
								<a
									href={token.website}
									target="_blank"
									rel="noopener noreferrer"
								>
									<ExternalLink className="mr-2 h-4 w-4" />
									Website
								</a>
							</Button>
						)}
						{token.twitter && (
							<Button variant="outline" className="w-full justify-start" asChild>
								<a
									href={token.twitter}
									target="_blank"
									rel="noopener noreferrer"
								>
									<ExternalLink className="mr-2 h-4 w-4" />
									Twitter
								</a>
							</Button>
						)}
						{token.discord && (
							<Button variant="outline" className="w-full justify-start" asChild>
								<a
									href={token.discord}
									target="_blank"
									rel="noopener noreferrer"
								>
									<ExternalLink className="mr-2 h-4 w-4" />
									Discord
								</a>
							</Button>
						)}
						{token.telegram && (
							<Button variant="outline" className="w-full justify-start" asChild>
								<a
									href={token.telegram}
									target="_blank"
									rel="noopener noreferrer"
								>
									<ExternalLink className="mr-2 h-4 w-4" />
									Telegram
								</a>
							</Button>
						)}
						{!token.website &&
							!token.twitter &&
							!token.discord &&
							!token.telegram && (
								<div className="flex h-32 items-center justify-center text-muted-foreground">
									No social links available
								</div>
							)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

/**
 * Skeleton loader for TokenDashboard
 */
function TokenDashboardSkeleton() {
	return (
		<div className="space-y-6">
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<Card key={i}>
						<CardHeader>
							<Skeleton className="h-4 w-20" />
						</CardHeader>
						<CardContent>
							<Skeleton className="h-8 w-32" />
							<Skeleton className="mt-2 h-3 w-24" />
						</CardContent>
					</Card>
				))}
			</div>
			<Card>
				<CardHeader>
					<Skeleton className="h-6 w-40" />
				</CardHeader>
				<CardContent>
					<Skeleton className="h-[350px] w-full" />
				</CardContent>
			</Card>
			<div className="grid gap-4 lg:grid-cols-2">
				{Array.from({ length: 2 }).map((_, i) => (
					<Card key={i}>
						<CardHeader>
							<Skeleton className="h-6 w-32" />
						</CardHeader>
						<CardContent>
							<Skeleton className="h-64 w-full" />
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
