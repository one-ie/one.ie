"use client";

import { useState } from "react";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
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

interface StakeTokensModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	pool: StakingPool;
	onSuccess?: () => void;
}

// Lock duration options (in days)
const LOCK_DURATIONS = [
	{ days: 7, label: "1 Week", apyMultiplier: 1.0 },
	{ days: 30, label: "1 Month", apyMultiplier: 1.2 },
	{ days: 90, label: "3 Months", apyMultiplier: 1.5 },
	{ days: 180, label: "6 Months", apyMultiplier: 2.0 },
	{ days: 365, label: "1 Year", apyMultiplier: 2.5 },
];

/**
 * StakeTokensModal - Modal for staking tokens
 *
 * Features:
 * - Amount input with balance validation
 * - Lock duration selector
 * - Estimated rewards calculator
 * - Approve + Stake flow
 */
export function StakeTokensModal({
	open,
	onOpenChange,
	pool,
	onSuccess,
}: StakeTokensModalProps) {
	const [amount, setAmount] = useState("");
	const [lockDuration, setLockDuration] = useState<string>("30");
	const [isApproving, setIsApproving] = useState(false);
	const [isStaking, setIsStaking] = useState(false);
	const [isApproved, setIsApproved] = useState(false);

	// Mock user balance - replace with actual wallet balance
	const userBalance = "10000";

	const selectedDuration = LOCK_DURATIONS.find(
		(d) => d.days.toString() === lockDuration
	);
	const effectiveApy = selectedDuration
		? pool.apy * selectedDuration.apyMultiplier
		: pool.apy;

	// Calculate estimated rewards
	const calculateEstimatedRewards = () => {
		if (!amount || parseFloat(amount) <= 0 || !selectedDuration) return "0";

		const principal = parseFloat(amount);
		const days = selectedDuration.days;
		const yearlyReturn = principal * (effectiveApy / 100);
		const estimatedReturn = (yearlyReturn * days) / 365;

		return estimatedReturn.toFixed(4);
	};

	const handleApprove = async () => {
		setIsApproving(true);
		try {
			// TODO: Integrate with wallet approval
			// await approveToken({ tokenAddress: pool.tokenAddress, amount });
			console.log("Approving tokens:", amount);
			await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate approval
			setIsApproved(true);
		} catch (error) {
			console.error("Failed to approve tokens:", error);
		} finally {
			setIsApproving(false);
		}
	};

	const handleStake = async () => {
		setIsStaking(true);
		try {
			// TODO: Integrate with Convex mutation
			// await stake({
			//   poolId: pool.id,
			//   amount,
			//   lockDuration: parseInt(lockDuration)
			// });
			console.log("Staking tokens:", {
				poolId: pool.id,
				amount,
				lockDuration,
			});
			await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate staking
			onSuccess?.();
			handleClose();
		} catch (error) {
			console.error("Failed to stake tokens:", error);
		} finally {
			setIsStaking(false);
		}
	};

	const handleClose = () => {
		setAmount("");
		setLockDuration("30");
		setIsApproved(false);
		onOpenChange(false);
	};

	const handleMaxClick = () => {
		setAmount(userBalance);
	};

	const isValidAmount =
		amount &&
		parseFloat(amount) > 0 &&
		parseFloat(amount) <= parseFloat(userBalance);

	const estimatedRewards = calculateEstimatedRewards();

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Stake {pool.tokenSymbol}</DialogTitle>
					<DialogDescription>
						Lock your tokens to earn rewards. Higher lock periods offer better
						returns.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					{/* Amount Input */}
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<Label htmlFor="amount">Amount</Label>
							<div className="text-sm text-muted-foreground">
								Balance: {parseFloat(userBalance).toLocaleString()}{" "}
								{pool.tokenSymbol}
							</div>
						</div>
						<div className="relative">
							<Input
								id="amount"
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
								Insufficient balance or invalid amount
							</p>
						)}
					</div>

					{/* Lock Duration Selector */}
					<div className="space-y-2">
						<Label htmlFor="lock-duration">Lock Duration</Label>
						<Select value={lockDuration} onValueChange={setLockDuration}>
							<SelectTrigger id="lock-duration">
								<SelectValue placeholder="Select duration" />
							</SelectTrigger>
							<SelectContent>
								{LOCK_DURATIONS.map((duration) => (
									<SelectItem
										key={duration.days}
										value={duration.days.toString()}
									>
										<div className="flex items-center justify-between w-full">
											<span>{duration.label}</span>
											<Badge variant="secondary" className="ml-2 text-xs">
												{(pool.apy * duration.apyMultiplier).toFixed(1)}% APY
											</Badge>
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<Separator />

					{/* Estimated Rewards */}
					<div className="bg-secondary/20 rounded-lg p-4 space-y-3">
						<div className="text-sm font-medium">Staking Summary</div>
						<div className="space-y-2 text-sm">
							<div className="flex justify-between">
								<span className="text-muted-foreground">Stake Amount</span>
								<span className="font-medium">
									{amount || "0"} {pool.tokenSymbol}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Lock Period</span>
								<span className="font-medium">
									{selectedDuration?.label || "-"}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Effective APY</span>
								<span className="font-medium text-primary">
									{effectiveApy.toFixed(2)}%
								</span>
							</div>
							<Separator />
							<div className="flex justify-between text-base">
								<span className="font-medium">Estimated Rewards</span>
								<span className="font-bold text-primary">
									+{estimatedRewards} {pool.tokenSymbol}
								</span>
							</div>
						</div>
					</div>

					{/* Warning */}
					<div className="text-xs text-muted-foreground bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
						⚠️ Your tokens will be locked for {selectedDuration?.label || "the selected period"}. Early withdrawal may result in penalties.
					</div>
				</div>

				<DialogFooter>
					{!isApproved ? (
						<Button
							onClick={handleApprove}
							disabled={!isValidAmount || isApproving}
							className="w-full"
						>
							{isApproving ? "Approving..." : "Approve Tokens"}
						</Button>
					) : (
						<Button
							onClick={handleStake}
							disabled={!isValidAmount || isStaking}
							className="w-full"
						>
							{isStaking ? "Staking..." : "Stake Tokens"}
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
