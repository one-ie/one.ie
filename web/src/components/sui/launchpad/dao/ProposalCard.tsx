"use client";

import { useState, useEffect } from "react";
import { Clock, CheckCircle2, XCircle, Ban, CheckCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { daoActions, type Proposal, type ProposalStatus } from "@/stores/dao";
import { cn } from "@/lib/utils";

interface ProposalCardProps {
	proposal: Proposal;
	onVoteClick?: () => void;
	showActions?: boolean;
}

export function ProposalCard({
	proposal,
	onVoteClick,
	showActions = true,
}: ProposalCardProps) {
	const [timeRemaining, setTimeRemaining] = useState<string>("");

	// Calculate time remaining
	useEffect(() => {
		const updateTime = () => {
			if (proposal.status !== "active") {
				setTimeRemaining("");
				return;
			}

			const now = Date.now();
			const remaining = proposal.votingPeriodEnd - now;

			if (remaining <= 0) {
				setTimeRemaining("Ended");
				return;
			}

			const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
			const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
			const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

			if (days > 0) {
				setTimeRemaining(`${days}d ${hours}h remaining`);
			} else if (hours > 0) {
				setTimeRemaining(`${hours}h ${minutes}m remaining`);
			} else {
				setTimeRemaining(`${minutes}m remaining`);
			}
		};

		updateTime();
		const interval = setInterval(updateTime, 60000); // Update every minute

		return () => clearInterval(interval);
	}, [proposal.votingPeriodEnd, proposal.status]);

	// Calculate vote percentages
	const totalVotes = proposal.votesFor + proposal.votesAgainst + proposal.votesAbstain;
	const forPercentage = totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 0;
	const againstPercentage = totalVotes > 0 ? (proposal.votesAgainst / totalVotes) * 100 : 0;
	const abstainPercentage = totalVotes > 0 ? (proposal.votesAbstain / totalVotes) * 100 : 0;

	// Calculate participation
	const participation = proposal.totalVotingPower > 0
		? (totalVotes / proposal.totalVotingPower) * 100
		: 0;

	// Determine if quorum and threshold met
	const quorumMet = participation >= proposal.quorum;
	const thresholdMet = totalVotes > 0
		? (proposal.votesFor / totalVotes) * 100 >= proposal.threshold
		: false;

	// Format numbers
	const formatNumber = (num: number) => {
		if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
		if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
		return num.toString();
	};

	// Status badge configuration
	const statusConfig: Record<ProposalStatus, { label: string; variant: any; icon: any }> = {
		active: { label: "Active", variant: "default", icon: Clock },
		passed: { label: "Passed", variant: "secondary", icon: CheckCircle2 },
		failed: { label: "Failed", variant: "destructive", icon: XCircle },
		executed: { label: "Executed", variant: "secondary", icon: CheckCheck },
		cancelled: { label: "Cancelled", variant: "outline", icon: Ban },
	};

	const status = statusConfig[proposal.status];
	const StatusIcon = status.icon;

	return (
		<Card className="hover:shadow-md transition-shadow">
			<CardHeader>
				<div className="flex items-start justify-between gap-4">
					<div className="flex-1 space-y-1">
						<CardTitle className="text-xl">{proposal.title}</CardTitle>
						<CardDescription className="flex items-center gap-2 flex-wrap">
							<span>by {proposal.proposer.slice(0, 6)}...{proposal.proposer.slice(-4)}</span>
							<span>•</span>
							<span>{new Date(proposal.createdAt).toLocaleDateString()}</span>
						</CardDescription>
					</div>
					<div className="flex flex-col items-end gap-2">
						<Badge variant={status.variant} className="flex items-center gap-1">
							<StatusIcon className="h-3 w-3" />
							{status.label}
						</Badge>
						<Badge variant="outline" className="text-xs">
							{proposal.type.replace("_", " ")}
						</Badge>
					</div>
				</div>
			</CardHeader>

			<CardContent className="space-y-4">
				{/* Description Preview */}
				<p className="text-sm text-muted-foreground line-clamp-2">
					{proposal.description.split("\n").find((line) => line.trim() && !line.startsWith("#"))}
				</p>

				<Separator />

				{/* Vote Counts */}
				<div className="space-y-3">
					<div className="flex items-center justify-between text-sm">
						<span className="font-medium">Votes</span>
						<span className="text-muted-foreground">
							{formatNumber(totalVotes)} / {formatNumber(proposal.totalVotingPower)} ({participation.toFixed(1)}%)
						</span>
					</div>

					{/* Voting Bar */}
					<div className="relative h-8 w-full overflow-hidden rounded-md bg-muted">
						{/* For votes (green) */}
						<div
							className={cn(
								"absolute left-0 top-0 h-full bg-green-500 transition-all",
								forPercentage > 0 && "opacity-90"
							)}
							style={{ width: `${forPercentage}%` }}
						/>
						{/* Against votes (red) */}
						<div
							className={cn(
								"absolute top-0 h-full bg-red-500 transition-all",
								againstPercentage > 0 && "opacity-90"
							)}
							style={{
								left: `${forPercentage}%`,
								width: `${againstPercentage}%`,
							}}
						/>
						{/* Abstain votes (gray) */}
						<div
							className={cn(
								"absolute top-0 h-full bg-gray-400 transition-all",
								abstainPercentage > 0 && "opacity-90"
							)}
							style={{
								left: `${forPercentage + againstPercentage}%`,
								width: `${abstainPercentage}%`,
							}}
						/>

						{/* Labels */}
						<div className="absolute inset-0 flex items-center justify-around text-xs font-medium text-white px-2">
							{forPercentage >= 15 && (
								<span className="drop-shadow-md">For {forPercentage.toFixed(1)}%</span>
							)}
							{againstPercentage >= 15 && (
								<span className="drop-shadow-md">Against {againstPercentage.toFixed(1)}%</span>
							)}
							{abstainPercentage >= 15 && (
								<span className="drop-shadow-md">Abstain {abstainPercentage.toFixed(1)}%</span>
							)}
						</div>
					</div>

					{/* Detailed Vote Counts */}
					<div className="grid grid-cols-3 gap-2 text-xs">
						<div className="flex items-center gap-1">
							<div className="h-3 w-3 rounded-sm bg-green-500" />
							<span className="text-muted-foreground">For:</span>
							<span className="font-medium">{formatNumber(proposal.votesFor)}</span>
						</div>
						<div className="flex items-center gap-1">
							<div className="h-3 w-3 rounded-sm bg-red-500" />
							<span className="text-muted-foreground">Against:</span>
							<span className="font-medium">{formatNumber(proposal.votesAgainst)}</span>
						</div>
						<div className="flex items-center gap-1">
							<div className="h-3 w-3 rounded-sm bg-gray-400" />
							<span className="text-muted-foreground">Abstain:</span>
							<span className="font-medium">{formatNumber(proposal.votesAbstain)}</span>
						</div>
					</div>
				</div>

				{/* Quorum & Threshold */}
				<div className="grid grid-cols-2 gap-3 text-sm">
					<div className="space-y-1">
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground">Quorum</span>
							<span className={cn(
								"font-medium",
								quorumMet ? "text-green-600" : "text-muted-foreground"
							)}>
								{quorumMet ? "✓" : ""} {proposal.quorum}%
							</span>
						</div>
						<Progress value={Math.min(participation, 100)} className="h-1.5" />
					</div>
					<div className="space-y-1">
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground">Threshold</span>
							<span className={cn(
								"font-medium",
								thresholdMet ? "text-green-600" : "text-muted-foreground"
							)}>
								{thresholdMet ? "✓" : ""} {proposal.threshold}%
							</span>
						</div>
						<Progress value={Math.min(forPercentage, 100)} className="h-1.5" />
					</div>
				</div>

				{/* Time Remaining */}
				{timeRemaining && (
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Clock className="h-4 w-4" />
						<span>{timeRemaining}</span>
					</div>
				)}

				{/* User's Vote */}
				{proposal.userVote && (
					<div className="rounded-lg border bg-muted/50 p-3">
						<p className="text-sm font-medium">
							You voted: <span className="capitalize">{proposal.userVote.choice}</span>
							{" "}({formatNumber(proposal.userVote.votingPower)} votes)
						</p>
						{proposal.userVote.comment && (
							<p className="mt-1 text-xs text-muted-foreground">
								"{proposal.userVote.comment}"
							</p>
						)}
					</div>
				)}

				{/* Actions */}
				{showActions && (
					<div className="flex items-center gap-2 pt-2">
						{proposal.status === "active" && (
							<Button
								onClick={onVoteClick || (() => daoActions.openVoteModal(proposal))}
								className="flex-1"
							>
								{proposal.userVote ? "Change Vote" : "Vote"}
							</Button>
						)}
						<Button variant="outline" className="flex-1">
							View Details
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
