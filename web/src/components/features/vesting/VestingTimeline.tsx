/**
 * VestingTimeline Component
 *
 * Visual timeline showing past, current, and future vesting milestones.
 */

import type { VestingMilestone } from "./types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface VestingTimelineProps {
	milestones: VestingMilestone[];
	tokenSymbol: string;
}

export function VestingTimeline({
	milestones,
	tokenSymbol,
}: VestingTimelineProps) {
	const now = Date.now();

	const formatDate = (timestamp: number) => {
		return new Date(timestamp).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	const getMilestoneStatus = (milestone: VestingMilestone) => {
		if (milestone.claimed) return "claimed";
		if (milestone.date <= now) return "claimable";
		return "upcoming";
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "claimed":
				return "bg-green-500";
			case "claimable":
				return "bg-blue-500";
			case "upcoming":
				return "bg-gray-300 dark:bg-gray-600";
			default:
				return "bg-gray-300";
		}
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "claimed":
				return <Badge className="bg-green-500">Claimed</Badge>;
			case "claimable":
				return <Badge className="bg-blue-500">Claimable</Badge>;
			case "upcoming":
				return <Badge variant="outline">Upcoming</Badge>;
			default:
				return null;
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Vesting Timeline</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{milestones.map((milestone, index) => {
						const status = getMilestoneStatus(milestone);
						const isPast = milestone.date < now;
						const isCurrent = milestone.date <= now && !milestone.claimed;

						return (
							<div key={index} className="flex gap-4">
								{/* Timeline indicator */}
								<div className="flex flex-col items-center">
									<div
										className={`w-4 h-4 rounded-full ${getStatusColor(status)} ${
											isCurrent ? "ring-4 ring-blue-200 dark:ring-blue-800" : ""
										}`}
									/>
									{index < milestones.length - 1 && (
										<div
											className={`w-0.5 h-12 ${
												isPast
													? "bg-primary"
													: "bg-gray-300 dark:bg-gray-600"
											}`}
										/>
									)}
								</div>

								{/* Milestone content */}
								<div className="flex-1 pb-4">
									<div className="flex items-start justify-between mb-1">
										<div>
											<div className="font-medium">
												{formatDate(milestone.date)}
												{milestone.isCliff && (
													<Badge variant="outline" className="ml-2">
														Cliff
													</Badge>
												)}
											</div>
											<div className="text-sm text-muted-foreground">
												{milestone.amount.toLocaleString()} {tokenSymbol} (
												{milestone.percentage}%)
											</div>
										</div>
										{getStatusBadge(status)}
									</div>
								</div>
							</div>
						);
					})}
				</div>

				<Separator className="my-4" />

				{/* Legend */}
				<div className="flex gap-4 text-xs">
					<div className="flex items-center gap-2">
						<div className="w-3 h-3 bg-green-500 rounded-full" />
						<span className="text-muted-foreground">Claimed</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-3 h-3 bg-blue-500 rounded-full" />
						<span className="text-muted-foreground">Claimable</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full" />
						<span className="text-muted-foreground">Upcoming</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
