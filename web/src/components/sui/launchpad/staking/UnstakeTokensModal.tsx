"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface StakingPool {
	id: string;
	tokenSymbol: string;
	tokenAddress: string;
	apy: number;
	lockDuration: number;
	totalStaked: string;
	totalRewards: string;
	userStake?: string;
	userPendingRewards?: string;
	isActive: boolean;
}

interface UnstakeTokensModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	pool: StakingPool;
	onSuccess?: () => void;
}

/**
 * UnstakeTokensModal - Modal for unstaking tokens
 *
 * Features:
 * - Staked amount display
 * - Amount to unstake input
 * - Lock period check with warnings
 * - Rewards summary
 * - Combined unstake + claim flow
 */
export function UnstakeTokensModal({
	open,
	onOpenChange,
	pool,
	onSuccess,
}: UnstakeTokensModalProps) {
	const [amount, setAmount] = useState("");
	const [isUnstaking, setIsUnstaking] = useState(false);
	const [lockEndDate, setLockEndDate] = useState<Date | null>(null);
	const [isLocked, setIsLocked] = useState(false);

	useEffect(() => {
		// Mock lock end date calculation - replace with actual data from backend
		if (pool.userStake && parseFloat(pool.userStake) > 0) {
			const mockLockEnd = new Date();
			mockLockEnd.setDate(mockLockEnd.getDate() + pool.lockDuration);
			setLockEndDate(mockLockEnd);
			setIsLocked(mockLockEnd > new Date());
		}
	}, [pool]);

	const userStakedAmount = pool.userStake || "0";
	const userPendingRewards = pool.userPendingRewards || "0";

	const handleMaxClick = () => {
		setAmount(userStakedAmount);
	};

	const handleUnstake = async () => {
		setIsUnstaking(true);
		try {
			// TODO: Integrate with Convex mutation
			// await unstake({
			//   poolId: pool.id,
			//   amount,
			//   claimRewards: true
			// });
			console.log("Unstaking tokens:", {
				poolId: pool.id,
				amount,
				claimRewards: true,
			});
			await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate unstaking
			onSuccess?.();
			handleClose();
		} catch (error) {
			console.error("Failed to unstake tokens:", error);
		} finally {
			setIsUnstaking(false);
		}
	};

	const handleClose = () => {
		setAmount("");
		onOpenChange(false);
	};

	const isValidAmount =
		amount &&
		parseFloat(amount) > 0 &&
		parseFloat(amount) <= parseFloat(userStakedAmount);

	const totalToReceive =
		parseFloat(amount || "0") + parseFloat(userPendingRewards);

	const getDaysRemaining = () => {
		if (!lockEndDate) return 0;
		const diff = lockEndDate.getTime() - new Date().getTime();
		return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
	};

	const daysRemaining = getDaysRemaining();

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Unstake {pool.tokenSymbol}</DialogTitle>
					<DialogDescription>
						Withdraw your staked tokens and claim pending rewards.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					{/* Staked Amount Display */}
					<div className="bg-secondary/20 rounded-lg p-4 space-y-2">
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground">Staked Amount</span>
							<span className="font-semibold">
								{parseFloat(userStakedAmount).toLocaleString()}{" "}
								{pool.tokenSymbol}
							</span>
						</div>
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground">Pending Rewards</span>
							<span className="font-semibold text-primary">
								{parseFloat(userPendingRewards).toLocaleString()}{" "}
								{pool.tokenSymbol}
							</span>
						</div>
					</div>

					{/* Lock Status */}
					{isLocked && (
						<div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 space-y-2">
							<div className="flex items-center gap-2">
								<Badge variant="outline" className="border-yellow-500/50">
									🔒 Locked
								</Badge>
								<span className="text-sm font-medium">
									{daysRemaining} days remaining
								</span>
							</div>
							<p className="text-xs text-muted-foreground">
								Lock ends:{" "}
								{lockEndDate?.toLocaleDateString("en-US", {
									month: "short",
									day: "numeric",
									year: "numeric",
								})}
							</p>
							<p className="text-xs text-yellow-600 dark:text-yellow-500">
								⚠️ Early withdrawal may incur a penalty fee
							</p>
						</div>
					)}

					{/* Amount to Unstake */}
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<Label htmlFor="unstake-amount">Amount to Unstake</Label>
						</div>
						<div className="relative">
							<Input
								id="unstake-amount"
								type="number"
								placeholder="0.00"
								value={amount}
								onChange={(e) => setAmount(e.target.value)}
								className="pr-16"
							/>
							<Button
								size="sm"
								variant="ghost"
								className="absolute right-1 top-1 h-7 text-xs"
								onClick={handleMaxClick}
							>
								MAX
							</Button>
						</div>
						{amount && !isValidAmount && (
							<p className="text-xs text-destructive">
								Invalid amount or exceeds staked balance
							</p>
						)}
					</div>

					<Separator />

					{/* Withdrawal Summary */}
					<div className="bg-primary/10 rounded-lg p-4 space-y-3">
						<div className="text-sm font-medium">Withdrawal Summary</div>
						<div className="space-y-2 text-sm">
							<div className="flex justify-between">
								<span className="text-muted-foreground">Unstake Amount</span>
								<span className="font-medium">
									{amount || "0"} {pool.tokenSymbol}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Claimed Rewards</span>
								<span className="font-medium text-primary">
									+{parseFloat(userPendingRewards).toLocaleString()}{" "}
									{pool.tokenSymbol}
								</span>
							</div>
							{isLocked && (
								<div className="flex justify-between text-yellow-600 dark:text-yellow-500">
									<span>Early Withdrawal Penalty</span>
									<span className="font-medium">-5%</span>
								</div>
							)}
							<Separator />
							<div className="flex justify-between text-base">
								<span className="font-medium">Total to Receive</span>
								<span className="font-bold text-primary">
									{isLocked
										? (totalToReceive * 0.95).toFixed(4)
										: totalToReceive.toFixed(4)}{" "}
									{pool.tokenSymbol}
								</span>
							</div>
						</div>
					</div>

					{/* Additional Info */}
					<div className="text-xs text-muted-foreground">
						💡 Your pending rewards will be automatically claimed when you
						unstake.
					</div>
				</div>

				<DialogFooter className="flex-col sm:flex-col gap-2">
					{isLocked && (
						<p className="text-xs text-center text-muted-foreground">
							Proceeding will charge a 5% early withdrawal penalty
						</p>
					)}
					<Button
						onClick={handleUnstake}
						disabled={!isValidAmount || isUnstaking}
						className="w-full"
						variant={isLocked ? "destructive" : "default"}
					>
						{isUnstaking
							? "Processing..."
							: isLocked
								? "Unstake Early (with penalty)"
								: "Unstake & Claim"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
