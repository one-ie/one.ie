/**
 * VestingScheduleCard Component
 *
 * Card displaying a single vesting schedule with progress, details, and claim button.
 */

import type { VestingSchedule } from "./types";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ClaimButton } from "./ClaimButton";
import { VestingProgressBar } from "./VestingProgressBar";

interface VestingScheduleCardProps {
	schedule: VestingSchedule;
	vestedAmount: number;
	claimableAmount: number;
	onClaim?: (scheduleId: string) => Promise<void>;
}

export function VestingScheduleCard({
	schedule,
	vestedAmount,
	claimableAmount,
	onClaim,
}: VestingScheduleCardProps) {
	const formatDuration = (seconds: number) => {
		const days = Math.floor(seconds / (24 * 60 * 60));
		const months = Math.floor(days / 30);
		const years = Math.floor(months / 12);

		if (years > 0) {
			return `${years} year${years !== 1 ? "s" : ""}`;
		}
		if (months > 0) {
			return `${months} month${months !== 1 ? "s" : ""}`;
		}
		return `${days} day${days !== 1 ? "s" : ""}`;
	};

	const formatDate = (timestamp: number) => {
		return new Date(timestamp).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	const getStatusBadge = (status: VestingSchedule["status"]) => {
		switch (status) {
			case "active":
				return <Badge>Active</Badge>;
			case "completed":
				return <Badge variant="outline">Completed</Badge>;
			case "revoked":
				return <Badge variant="destructive">Revoked</Badge>;
			default:
				return <Badge variant="outline">{status}</Badge>;
		}
	};

	const cliffDate = schedule.startTime + schedule.cliffDuration * 1000;
	const endDate = schedule.startTime + schedule.vestingDuration * 1000;
	const isAfterCliff = Date.now() >= cliffDate;

	return (
		<Card className="hover:shadow-lg transition-shadow">
			<CardHeader>
				<div className="flex items-start justify-between">
					<div>
						<CardTitle>{schedule.tokenSymbol} Vesting</CardTitle>
						<CardDescription>
							ID: {schedule._id.slice(-8)}
						</CardDescription>
					</div>
					{getStatusBadge(schedule.status)}
				</div>
			</CardHeader>

			<CardContent className="space-y-4">
				{/* Progress Bar */}
				<VestingProgressBar
					totalAmount={schedule.totalAmount}
					vestedAmount={vestedAmount}
					claimedAmount={schedule.claimedAmount}
				/>

				<Separator />

				{/* Schedule Details */}
				<div className="grid grid-cols-2 gap-4 text-sm">
					<div>
						<p className="text-muted-foreground">Total Amount</p>
						<p className="font-medium">
							{schedule.totalAmount.toLocaleString()} {schedule.tokenSymbol}
						</p>
					</div>

					<div>
						<p className="text-muted-foreground">Claimed</p>
						<p className="font-medium">
							{schedule.claimedAmount.toLocaleString()} {schedule.tokenSymbol}
						</p>
					</div>

					<div>
						<p className="text-muted-foreground">Vested</p>
						<p className="font-medium">
							{vestedAmount.toLocaleString()} {schedule.tokenSymbol}
						</p>
					</div>

					<div>
						<p className="text-muted-foreground">Claimable</p>
						<p className="font-medium text-green-600 dark:text-green-400">
							{claimableAmount.toLocaleString()} {schedule.tokenSymbol}
						</p>
					</div>
				</div>

				<Separator />

				{/* Dates & Durations */}
				<div className="space-y-2 text-sm">
					<div className="flex justify-between">
						<span className="text-muted-foreground">Start Date</span>
						<span className="font-medium">
							{formatDate(schedule.startTime)}
						</span>
					</div>

					<div className="flex justify-between">
						<span className="text-muted-foreground">Cliff Period</span>
						<span className="font-medium">
							{formatDuration(schedule.cliffDuration)}
							{!isAfterCliff && (
								<Badge variant="outline" className="ml-2">
									Not Reached
								</Badge>
							)}
						</span>
					</div>

					<div className="flex justify-between">
						<span className="text-muted-foreground">Cliff Date</span>
						<span className="font-medium">{formatDate(cliffDate)}</span>
					</div>

					<div className="flex justify-between">
						<span className="text-muted-foreground">Vesting Duration</span>
						<span className="font-medium">
							{formatDuration(schedule.vestingDuration)}
						</span>
					</div>

					<div className="flex justify-between">
						<span className="text-muted-foreground">End Date</span>
						<span className="font-medium">{formatDate(endDate)}</span>
					</div>
				</div>
			</CardContent>

			<CardFooter>
				<ClaimButton
					scheduleId={schedule._id}
					claimableAmount={claimableAmount}
					tokenSymbol={schedule.tokenSymbol}
					disabled={schedule.status !== "active" || !isAfterCliff}
					onClaim={onClaim}
				/>
			</CardFooter>
		</Card>
	);
}
