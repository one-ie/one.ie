/**
 * VestingDashboard Component
 *
 * Complete dashboard for managing vesting schedules with:
 * - Schedule list with progress bars
 * - Claimable amount highlighting
 * - Schedule details (cliff, duration, amounts)
 * - Timeline milestone visualization
 * - Claim history with transaction links
 * - Real-time updates via Convex
 */

import { useState } from "react";
import type { ClaimRecord, VestingMilestone, VestingSchedule } from "./types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClaimHistoryTable } from "./ClaimHistoryTable";
import { VestingScheduleCard } from "./VestingScheduleCard";
import { VestingTimeline } from "./VestingTimeline";

interface VestingDashboardProps {
	userId?: string;
	schedules?: VestingSchedule[];
	claims?: ClaimRecord[];
	loading?: boolean;
	onClaim?: (scheduleId: string) => Promise<void>;
	onRefresh?: () => void;
}

/**
 * Calculate vested amount for a schedule at current time
 */
function calculateVestedAmount(schedule: VestingSchedule): number {
	const now = Date.now();
	const startTime = schedule.startTime;
	const cliffTime = startTime + schedule.cliffDuration * 1000;
	const endTime = startTime + schedule.vestingDuration * 1000;

	// Before cliff: nothing vested
	if (now < cliffTime) {
		return 0;
	}

	// After vesting end: everything vested
	if (now >= endTime) {
		return schedule.totalAmount;
	}

	// During vesting: linear vesting
	const vestingElapsed = now - startTime;
	const vestingTotal = schedule.vestingDuration * 1000;
	const vestedPercentage = vestingElapsed / vestingTotal;

	return Math.floor(schedule.totalAmount * vestedPercentage);
}

/**
 * Calculate claimable amount (vested - claimed)
 */
function calculateClaimableAmount(schedule: VestingSchedule): number {
	const vested = calculateVestedAmount(schedule);
	const claimable = vested - schedule.claimedAmount;
	return Math.max(0, claimable);
}

/**
 * Generate timeline milestones for a schedule
 */
function generateMilestones(
	schedule: VestingSchedule,
	claims: ClaimRecord[]
): VestingMilestone[] {
	const milestones: VestingMilestone[] = [];
	const startTime = schedule.startTime;
	const cliffTime = startTime + schedule.cliffDuration * 1000;
	const endTime = startTime + schedule.vestingDuration * 1000;

	// Cliff milestone
	const cliffAmount = Math.floor(
		schedule.totalAmount * (schedule.cliffDuration / schedule.vestingDuration)
	);
	milestones.push({
		date: cliffTime,
		amount: cliffAmount,
		percentage: (cliffAmount / schedule.totalAmount) * 100,
		claimed: claims.some((c) => c.timestamp <= cliffTime && c.status === "completed"),
		isCliff: true,
	});

	// Quarterly milestones (25%, 50%, 75%, 100%)
	const milestonePercentages = [25, 50, 75, 100];
	milestonePercentages.forEach((pct) => {
		const milestoneTime = startTime + (schedule.vestingDuration * 1000 * pct) / 100;
		const milestoneAmount = Math.floor((schedule.totalAmount * pct) / 100);

		milestones.push({
			date: milestoneTime,
			amount: milestoneAmount,
			percentage: pct,
			claimed: claims.some(
				(c) => c.timestamp <= milestoneTime && c.status === "completed"
			),
		});
	});

	// Sort by date and remove duplicates
	return milestones
		.sort((a, b) => a.date - b.date)
		.filter(
			(m, i, arr) => i === 0 || m.date !== arr[i - 1].date
		);
}

export function VestingDashboard({
	userId,
	schedules = [],
	claims = [],
	loading = false,
	onClaim,
	onRefresh,
}: VestingDashboardProps) {
	const [selectedSchedule, setSelectedSchedule] = useState<string | null>(
		schedules.length > 0 ? schedules[0]._id : null
	);

	// Calculate totals
	const totalVested = schedules.reduce(
		(sum, s) => sum + calculateVestedAmount(s),
		0
	);
	const totalClaimed = schedules.reduce((sum, s) => sum + s.claimedAmount, 0);
	const totalClaimable = schedules.reduce(
		(sum, s) => sum + calculateClaimableAmount(s),
		0
	);

	const activeSchedules = schedules.filter((s) => s.status === "active");
	const completedSchedules = schedules.filter((s) => s.status === "completed");

	const selectedScheduleData = schedules.find(
		(s) => s._id === selectedSchedule
	);

	if (loading) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-32 w-full" />
				<Skeleton className="h-64 w-full" />
				<Skeleton className="h-64 w-full" />
			</div>
		);
	}

	if (schedules.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Vesting Dashboard</CardTitle>
					<CardDescription>No vesting schedules found</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground text-center py-8">
						You don't have any vesting schedules yet. When tokens are vested to
						you, they will appear here.
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header with stats */}
			<Card>
				<CardHeader>
					<div className="flex items-start justify-between">
						<div>
							<CardTitle>Vesting Dashboard</CardTitle>
							<CardDescription>
								{activeSchedules.length} active schedule
								{activeSchedules.length !== 1 ? "s" : ""}
								{completedSchedules.length > 0 &&
									`, ${completedSchedules.length} completed`}
							</CardDescription>
						</div>
						{onRefresh && (
							<Button variant="outline" size="sm" onClick={onRefresh}>
								Refresh
							</Button>
						)}
					</div>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="space-y-1">
							<p className="text-sm text-muted-foreground">Total Vested</p>
							<p className="text-2xl font-bold">
								{totalVested.toLocaleString()}
							</p>
							<p className="text-xs text-muted-foreground">
								Across {schedules.length} schedule
								{schedules.length !== 1 ? "s" : ""}
							</p>
						</div>

						<div className="space-y-1">
							<p className="text-sm text-muted-foreground">Total Claimed</p>
							<p className="text-2xl font-bold text-green-600 dark:text-green-400">
								{totalClaimed.toLocaleString()}
							</p>
							<p className="text-xs text-muted-foreground">
								{claims.length} claim{claims.length !== 1 ? "s" : ""}
							</p>
						</div>

						<div className="space-y-1">
							<p className="text-sm text-muted-foreground">Claimable Now</p>
							<p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
								{totalClaimable.toLocaleString()}
							</p>
							<Badge variant={totalClaimable > 0 ? "default" : "outline"}>
								{totalClaimable > 0 ? "Ready to Claim" : "Nothing Available"}
							</Badge>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Main content */}
			<Tabs defaultValue="schedules" className="space-y-4">
				<TabsList>
					<TabsTrigger value="schedules">Schedules</TabsTrigger>
					<TabsTrigger value="timeline">Timeline</TabsTrigger>
					<TabsTrigger value="history">Claim History</TabsTrigger>
				</TabsList>

				{/* Schedules Tab */}
				<TabsContent value="schedules" className="space-y-4">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
						{schedules.map((schedule) => (
							<VestingScheduleCard
								key={schedule._id}
								schedule={schedule}
								vestedAmount={calculateVestedAmount(schedule)}
								claimableAmount={calculateClaimableAmount(schedule)}
								onClaim={onClaim}
							/>
						))}
					</div>
				</TabsContent>

				{/* Timeline Tab */}
				<TabsContent value="timeline" className="space-y-4">
					{selectedScheduleData ? (
						<>
							{/* Schedule selector */}
							{schedules.length > 1 && (
								<div className="flex gap-2 flex-wrap">
									{schedules.map((schedule) => (
										<Button
											key={schedule._id}
											variant={
												selectedSchedule === schedule._id
													? "default"
													: "outline"
											}
											size="sm"
											onClick={() => setSelectedSchedule(schedule._id)}
										>
											{schedule.tokenSymbol}
										</Button>
									))}
								</div>
							)}

							<VestingTimeline
								milestones={generateMilestones(
									selectedScheduleData,
									claims.filter((c) => c.scheduleId === selectedSchedule)
								)}
								tokenSymbol={selectedScheduleData.tokenSymbol}
							/>
						</>
					) : (
						<p className="text-sm text-muted-foreground text-center py-8">
							Select a schedule to view timeline
						</p>
					)}
				</TabsContent>

				{/* Claim History Tab */}
				<TabsContent value="history">
					<ClaimHistoryTable
						claims={claims}
						tokenSymbol={
							schedules.length > 0 ? schedules[0].tokenSymbol : "TOKEN"
						}
					/>
				</TabsContent>
			</Tabs>
		</div>
	);
}
