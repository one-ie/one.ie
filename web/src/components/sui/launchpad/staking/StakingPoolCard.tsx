"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StakeTokensModal } from "./StakeTokensModal";
import { UnstakeTokensModal } from "./UnstakeTokensModal";

interface StakingPool {
	id: string;
	tokenSymbol: string;
	tokenAddress: string;
	apy: number;
	lockDuration: number; // in days
	totalStaked: string;
	totalRewards: string;
	userStake?: string;
	userPendingRewards?: string;
	isActive: boolean;
}

interface StakingPoolCardProps {
	pool: StakingPool;
	onStakeSuccess?: () => void;
	onUnstakeSuccess?: () => void;
	onClaimSuccess?: () => void;
}

/**
 * StakingPoolCard - Display staking pool information
 *
 * Shows pool details including:
 * - Token information and APY
 * - Total staked and rewards
 * - User's stake and pending rewards
 * - Stake/Unstake/Claim action buttons
 */
export function StakingPoolCard({
	pool,
	onStakeSuccess,
	onUnstakeSuccess,
	onClaimSuccess,
}: StakingPoolCardProps) {
	const [isStakeModalOpen, setIsStakeModalOpen] = useState(false);
	const [isUnstakeModalOpen, setIsUnstakeModalOpen] = useState(false);
	const [isClaimingRewards, setIsClaimingRewards] = useState(false);

	const handleClaimRewards = async () => {
		setIsClaimingRewards(true);
		try {
			// TODO: Integrate with Convex mutation
			// await claimRewards({ poolId: pool.id });
			console.log("Claiming rewards for pool:", pool.id);
			onClaimSuccess?.();
		} catch (error) {
			console.error("Failed to claim rewards:", error);
		} finally {
			setIsClaimingRewards(false);
		}
	};

	const hasUserStake =
		pool.userStake && parseFloat(pool.userStake) > 0;
	const hasUserRewards =
		pool.userPendingRewards && parseFloat(pool.userPendingRewards) > 0;

	return (
		<>
			<Card className="hover:shadow-lg transition-shadow">
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-xl">
								{pool.tokenSymbol} Staking Pool
							</CardTitle>
							<CardDescription className="mt-1">
								Lock period: {pool.lockDuration} days
							</CardDescription>
						</div>
						<Badge
							variant={pool.isActive ? "default" : "secondary"}
							className="ml-2"
						>
							{pool.isActive ? "Active" : "Inactive"}
						</Badge>
					</div>
				</CardHeader>

				<CardContent className="space-y-4">
					{/* APY Display */}
					<div className="bg-primary/10 rounded-lg p-4 text-center">
						<div className="text-3xl font-bold text-primary">
							{pool.apy.toFixed(2)}%
						</div>
						<div className="text-sm text-muted-foreground mt-1">
							Annual Percentage Yield
						</div>
					</div>

					<Separator />

					{/* Pool Statistics */}
					<div className="grid grid-cols-2 gap-4">
						<div>
							<div className="text-sm text-muted-foreground">
								Total Staked
							</div>
							<div className="text-lg font-semibold mt-1">
								{parseFloat(pool.totalStaked).toLocaleString()}{" "}
								{pool.tokenSymbol}
							</div>
						</div>
						<div>
							<div className="text-sm text-muted-foreground">
								Total Rewards
							</div>
							<div className="text-lg font-semibold mt-1">
								{parseFloat(pool.totalRewards).toLocaleString()}{" "}
								{pool.tokenSymbol}
							</div>
						</div>
					</div>

					{/* User Statistics */}
					{hasUserStake && (
						<>
							<Separator />
							<div className="space-y-3 bg-secondary/20 rounded-lg p-4">
								<div className="text-sm font-medium">Your Position</div>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<div className="text-xs text-muted-foreground">
											Staked Amount
										</div>
										<div className="text-base font-semibold mt-1">
											{parseFloat(pool.userStake || "0").toLocaleString()}{" "}
											{pool.tokenSymbol}
										</div>
									</div>
									<div>
										<div className="text-xs text-muted-foreground">
											Pending Rewards
										</div>
										<div className="text-base font-semibold mt-1 text-primary">
											{parseFloat(
												pool.userPendingRewards || "0"
											).toLocaleString()}{" "}
											{pool.tokenSymbol}
										</div>
									</div>
								</div>
							</div>
						</>
					)}
				</CardContent>

				<CardFooter className="flex gap-2">
					<Button
						className="flex-1"
						onClick={() => setIsStakeModalOpen(true)}
						disabled={!pool.isActive}
					>
						Stake
					</Button>
					{hasUserStake && (
						<>
							<Button
								variant="outline"
								className="flex-1"
								onClick={() => setIsUnstakeModalOpen(true)}
							>
								Unstake
							</Button>
							{hasUserRewards && (
								<Button
									variant="secondary"
									onClick={handleClaimRewards}
									disabled={isClaimingRewards}
								>
									{isClaimingRewards ? "Claiming..." : "Claim"}
								</Button>
							)}
						</>
					)}
				</CardFooter>
			</Card>

			{/* Modals */}
			<StakeTokensModal
				open={isStakeModalOpen}
				onOpenChange={setIsStakeModalOpen}
				pool={pool}
				onSuccess={() => {
					setIsStakeModalOpen(false);
					onStakeSuccess?.();
				}}
			/>

			<UnstakeTokensModal
				open={isUnstakeModalOpen}
				onOpenChange={setIsUnstakeModalOpen}
				pool={pool}
				onSuccess={() => {
					setIsUnstakeModalOpen(false);
					onUnstakeSuccess?.();
				}}
			/>
		</>
	);
}
