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
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Holder } from "./types";

interface HolderListProps {
	holders: Holder[];
	isLoading?: boolean;
	limit?: number;
}

export function HolderList({
	holders,
	isLoading = false,
	limit = 20,
}: HolderListProps) {
	const formatAddress = (address: string) => {
		return `${address.slice(0, 6)}...${address.slice(-4)}`;
	};

	const formatBalance = (balance: string) => {
		const num = parseFloat(balance);
		if (num >= 1000000000) {
			return `${(num / 1000000000).toFixed(2)}B`;
		}
		if (num >= 1000000) {
			return `${(num / 1000000).toFixed(2)}M`;
		}
		if (num >= 1000) {
			return `${(num / 1000).toFixed(2)}K`;
		}
		return num.toFixed(2);
	};

	const formatValue = (value: number) => {
		if (value >= 1000000) {
			return `$${(value / 1000000).toFixed(2)}M`;
		}
		if (value >= 1000) {
			return `$${(value / 1000).toFixed(2)}K`;
		}
		return `$${value.toFixed(2)}`;
	};

	const copyAddress = (address: string) => {
		navigator.clipboard.writeText(address);
		toast.success("Address copied to clipboard");
	};

	const getRankBadge = (rank: number) => {
		if (rank === 1) return { variant: "default" as const, icon: "🥇" };
		if (rank === 2) return { variant: "secondary" as const, icon: "🥈" };
		if (rank === 3) return { variant: "outline" as const, icon: "🥉" };
		return { variant: "outline" as const, icon: null };
	};

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Top Holders</CardTitle>
					<CardDescription>Largest token holders by balance</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						{[...Array(5)].map((_, i) => (
							<Skeleton key={i} className="h-12 w-full" />
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	if (!holders || holders.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Top Holders</CardTitle>
					<CardDescription>Largest token holders by balance</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex h-32 items-center justify-center text-muted-foreground">
						No holder data available
					</div>
				</CardContent>
			</Card>
		);
	}

	const displayedHolders = holders.slice(0, limit);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Top Holders</CardTitle>
				<CardDescription>
					Showing top {displayedHolders.length} holders out of{" "}
					{holders.length.toLocaleString()} total
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-16">Rank</TableHead>
							<TableHead>Address</TableHead>
							<TableHead className="text-right">Balance</TableHead>
							<TableHead className="text-right">Percentage</TableHead>
							<TableHead className="text-right">Value (USD)</TableHead>
							<TableHead className="w-24"></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{displayedHolders.map((holder) => {
							const badge = getRankBadge(holder.rank);
							return (
								<TableRow key={holder.walletAddress}>
									<TableCell>
										<div className="flex items-center gap-1">
											{badge.icon && <span>{badge.icon}</span>}
											<Badge variant={badge.variant} className="text-xs">
												#{holder.rank}
											</Badge>
										</div>
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-2">
											<code className="text-xs">
												{formatAddress(holder.walletAddress)}
											</code>
											<Button
												variant="ghost"
												size="sm"
												className="h-6 w-6 p-0"
												onClick={() => copyAddress(holder.walletAddress)}
											>
												<Copy className="h-3 w-3" />
											</Button>
										</div>
									</TableCell>
									<TableCell className="text-right font-mono text-sm">
										{formatBalance(holder.balance)}
									</TableCell>
									<TableCell className="text-right">
										<Badge
											variant={
												holder.percentage > 10
													? "destructive"
													: holder.percentage > 5
														? "outline"
														: "secondary"
											}
										>
											{holder.percentage.toFixed(2)}%
										</Badge>
									</TableCell>
									<TableCell className="text-right font-medium">
										{formatValue(holder.valueUSD)}
									</TableCell>
									<TableCell>
										<Button
											variant="ghost"
											size="sm"
											className="h-8 w-8 p-0"
											asChild
										>
											<a
												href={`https://solscan.io/account/${holder.walletAddress}`}
												target="_blank"
												rel="noopener noreferrer"
											>
												<ExternalLink className="h-3 w-3" />
											</a>
										</Button>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
