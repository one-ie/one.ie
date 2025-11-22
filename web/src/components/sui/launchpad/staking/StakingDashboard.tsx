"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

interface UserStake {
	id: string;
	poolId: string;
	poolName: string;
	tokenSymbol: string;
	stakedAmount: string;
	pendingRewards: string;
	apy: number;
	lockEndDate: Date;
	isLocked: boolean;
}

interface StakingDashboardProps {
	userStakes: UserStake[];
	onClaimAll?: () => void;
	onViewPool?: (poolId: string) => void;
}

/**
 * StakingDashboard - Overview of all user stakes
 *
 * Features:
 * - User stakes across all pools
 * - Total staked value and rewards
 * - Pool performance comparison
 * - Claim all rewards button
 * - Quick navigation to individual pools
 */
export function StakingDashboard({
	userStakes,
	onClaimAll,
	onViewPool,
}: StakingDashboardProps) {
	const [isClaimingAll, setIsClaimingAll] = useState(false);

	// Calculate totals
	const totalStakedValue = userStakes.reduce(
		(sum, stake) => sum + parseFloat(stake.stakedAmount),
		0
	);

	const totalPendingRewards = userStakes.reduce(
		(sum, stake) => sum + parseFloat(stake.pendingRewards),
		0
	);

	// Group stakes by token for aggregated view
	const stakesByToken = userStakes.reduce(
		(acc, stake) => {
			const existing = acc.get(stake.tokenSymbol) || {
				staked: 0,
				rewards: 0,
				pools: 0,
			};

			acc.set(stake.tokenSymbol, {
				staked: existing.staked + parseFloat(stake.stakedAmount),
				rewards: existing.rewards + parseFloat(stake.pendingRewards),
				pools: existing.pools + 1,
			});

			return acc;
		},
		new Map<string, { staked: number; rewards: number; pools: number }>()
	);

	const handleClaimAll = async () => {
		setIsClaimingAll(true);
		try {
			// TODO: Integrate with Convex mutation
			// await claimAllRewards();
			console.log("Claiming all rewards");
			await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate claim
			onClaimAll?.();
		} catch (error) {
			console.error("Failed to claim all rewards:", error);
		} finally {
			setIsClaimingAll(false);
		}
	};

	const getDaysRemaining = (lockEndDate: Date) => {
		const diff = lockEndDate.getTime() - new Date().getTime();
		return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
	};

	const hasRewards = totalPendingRewards > 0;

	return (
		<div className="space-y-6">
			{/* Summary Cards */}
			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="pb-3">
						<CardDescription>Total Staked</CardDescription>
						<CardTitle className="text-3xl">
							${totalStakedValue.toLocaleString()}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-xs text-muted-foreground">
							Across {userStakes.length} pool{userStakes.length !== 1 ? "s" : ""}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-3">
						<CardDescription>Pending Rewards</CardDescription>
						<CardTitle className="text-3xl text-primary">
							${totalPendingRewards.toLocaleString()}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<Button
							size="sm"
							onClick={handleClaimAll}
							disabled={!hasRewards || isClaimingAll}
							className="w-full"
						>
							{isClaimingAll ? "Claiming..." : "Claim All Rewards"}
						</Button>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-3">
						<CardDescription>Active Tokens</CardDescription>
						<CardTitle className="text-3xl">
							{stakesByToken.size}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-xs text-muted-foreground">
							{Array.from(stakesByToken.keys()).join(", ")}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Aggregated View by Token */}
			<Card>
				<CardHeader>
					<CardTitle>Staking Overview by Token</CardTitle>
					<CardDescription>
						Aggregated view of your positions across all pools
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{Array.from(stakesByToken.entries()).map(([token, data]) => (
							<div key={token}>
								<div className="flex items-center justify-between py-3">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
											{token.slice(0, 1)}
										</div>
										<div>
											<div className="font-medium">{token}</div>
											<div className="text-sm text-muted-foreground">
												{data.pools} pool{data.pools !== 1 ? "s" : ""}
											</div>
										</div>
									</div>
									<div className="text-right">
										<div className="font-semibold">
											{data.staked.toLocaleString()} {token}
										</div>
										<div className="text-sm text-primary">
											+{data.rewards.toLocaleString()} rewards
										</div>
									</div>
								</div>
								<Separator />
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Detailed Stakes Table */}
			<Card>
				<CardHeader>
					<CardTitle>All Active Stakes</CardTitle>
					<CardDescription>
						Detailed view of your positions in each pool
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Pool</TableHead>
								<TableHead>Staked</TableHead>
								<TableHead>Rewards</TableHead>
								<TableHead>APY</TableHead>
								<TableHead>Lock Status</TableHead>
								<TableHead className="text-right">Action</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{userStakes.map((stake) => {
								const daysRemaining = getDaysRemaining(stake.lockEndDate);
								return (
									<TableRow key={stake.id}>
										<TableCell>
											<div>
												<div className="font-medium">{stake.poolName}</div>
												<div className="text-sm text-muted-foreground">
													{stake.tokenSymbol}
												</div>
											</div>
										</TableCell>
										<TableCell>
											<div className="font-medium">
												{parseFloat(stake.stakedAmount).toLocaleString()}
											</div>
											<div className="text-sm text-muted-foreground">
												{stake.tokenSymbol}
											</div>
										</TableCell>
										<TableCell>
											<div className="font-medium text-primary">
												{parseFloat(stake.pendingRewards).toLocaleString()}
											</div>
											<div className="text-sm text-muted-foreground">
												{stake.tokenSymbol}
											</div>
										</TableCell>
										<TableCell>
											<Badge variant="secondary">{stake.apy.toFixed(2)}%</Badge>
										</TableCell>
										<TableCell>
											{stake.isLocked ? (
												<div className="flex items-center gap-2">
													<Badge variant="outline" className="border-yellow-500/50">
														🔒 Locked
													</Badge>
													<span className="text-xs text-muted-foreground">
														{daysRemaining}d
													</span>
												</div>
											) : (
												<Badge variant="outline" className="border-green-500/50">
													✓ Unlocked
												</Badge>
											)}
										</TableCell>
										<TableCell className="text-right">
											<Button
												size="sm"
												variant="ghost"
												onClick={() => onViewPool?.(stake.poolId)}
											>
												View Pool
											</Button>
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>

					{userStakes.length === 0 && (
						<div className="text-center py-12">
							<p className="text-muted-foreground">
								You don't have any active stakes yet.
							</p>
							<p className="text-sm text-muted-foreground mt-2">
								Browse available staking pools to get started.
							</p>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Performance Comparison */}
			{userStakes.length > 1 && (
				<Card>
					<CardHeader>
						<CardTitle>Pool Performance Comparison</CardTitle>
						<CardDescription>
							Compare returns across your active stakes
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{userStakes
								.sort((a, b) => b.apy - a.apy)
								.map((stake) => {
									const returnRate =
										(parseFloat(stake.pendingRewards) /
											parseFloat(stake.stakedAmount)) *
										100;

									return (
										<div key={stake.id} className="space-y-2">
											<div className="flex items-center justify-between text-sm">
												<span className="font-medium">{stake.poolName}</span>
												<span className="text-primary">{stake.apy.toFixed(2)}% APY</span>
											</div>
											<div className="relative h-2 bg-secondary rounded-full overflow-hidden">
												<div
													className="absolute h-full bg-primary transition-all duration-300"
													style={{
														width: `${Math.min(returnRate, 100)}%`,
													}}
												/>
											</div>
											<div className="flex items-center justify-between text-xs text-muted-foreground">
												<span>Current Return: {returnRate.toFixed(2)}%</span>
												<span>
													+{parseFloat(stake.pendingRewards).toLocaleString()}{" "}
													{stake.tokenSymbol}
												</span>
											</div>
										</div>
									);
								})}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
