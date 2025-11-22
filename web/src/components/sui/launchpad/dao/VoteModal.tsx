"use client";

import { useState } from "react";
import { useStore } from "@nanostores/react";
import { ThumbsUp, ThumbsDown, Minus, Loader2 } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
	daoActions,
	$voteModalOpen,
	$selectedProposal,
	$daoState,
	type VoteChoice,
} from "@/stores/dao";
import { cn } from "@/lib/utils";

export function VoteModal() {
	const isOpen = useStore($voteModalOpen);
	const proposal = useStore($selectedProposal);
	const daoState = useStore($daoState);

	const [selectedChoice, setSelectedChoice] = useState<VoteChoice | null>(null);
	const [comment, setComment] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Get user's voting power from DAO state
	const votingPower = daoState.stats.userVotingPower;

	const handleVote = async () => {
		if (!proposal || !selectedChoice) return;

		setIsSubmitting(true);

		try {
			// Cast vote
			daoActions.castVote(
				proposal.id,
				selectedChoice,
				votingPower,
				comment || undefined
			);

			// Close modal and reset
			daoActions.closeVoteModal();
			setSelectedChoice(null);
			setComment("");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleClose = () => {
		if (!isSubmitting) {
			daoActions.closeVoteModal();
			setSelectedChoice(null);
			setComment("");
		}
	};

	if (!proposal) return null;

	// Format numbers
	const formatNumber = (num: number) => {
		if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
		if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
		return num.toString();
	};

	// Vote options configuration
	const voteOptions: Array<{
		choice: VoteChoice;
		label: string;
		icon: any;
		color: string;
		bgColor: string;
		hoverColor: string;
		description: string;
	}> = [
		{
			choice: "for",
			label: "Vote For",
			icon: ThumbsUp,
			color: "text-green-600",
			bgColor: "bg-green-50 dark:bg-green-950",
			hoverColor: "hover:bg-green-100 dark:hover:bg-green-900",
			description: "Support this proposal",
		},
		{
			choice: "against",
			label: "Vote Against",
			icon: ThumbsDown,
			color: "text-red-600",
			bgColor: "bg-red-50 dark:bg-red-950",
			hoverColor: "hover:bg-red-100 dark:hover:bg-red-900",
			description: "Oppose this proposal",
		},
		{
			choice: "abstain",
			label: "Abstain",
			icon: Minus,
			color: "text-gray-600",
			bgColor: "bg-gray-50 dark:bg-gray-950",
			hoverColor: "hover:bg-gray-100 dark:hover:bg-gray-900",
			description: "Count towards quorum but not vote",
		},
	];

	// Check if user has already voted
	const hasVoted = !!proposal.userVote;
	const previousVote = proposal.userVote?.choice;

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="text-xl">
						{hasVoted ? "Change Your Vote" : "Cast Your Vote"}
					</DialogTitle>
					<DialogDescription>
						{hasVoted
							? `You previously voted "${previousVote}". You can change your vote below.`
							: "Choose how you want to vote on this proposal"}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 py-4">
					{/* Proposal Details */}
					<div className="space-y-3">
						<div>
							<h3 className="font-semibold text-lg">{proposal.title}</h3>
							<div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
								<Badge variant="outline">{proposal.type.replace("_", " ")}</Badge>
								<span>•</span>
								<span>by {proposal.proposer.slice(0, 6)}...{proposal.proposer.slice(-4)}</span>
							</div>
						</div>

						<p className="text-sm text-muted-foreground line-clamp-3">
							{proposal.description.split("\n").find((line) => line.trim() && !line.startsWith("#"))}
						</p>
					</div>

					<Separator />

					{/* Voting Power */}
					<div className="rounded-lg border bg-muted/50 p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium">Your Voting Power</p>
								<p className="text-xs text-muted-foreground mt-0.5">
									Based on your governance token holdings
								</p>
							</div>
							<div className="text-right">
								<p className="text-2xl font-bold">{formatNumber(votingPower)}</p>
								<p className="text-xs text-muted-foreground">
									{((votingPower / proposal.totalVotingPower) * 100).toFixed(2)}% of total
								</p>
							</div>
						</div>
					</div>

					{/* Vote Options */}
					<div className="space-y-3">
						<Label>Select Your Vote</Label>
						<div className="grid gap-3">
							{voteOptions.map((option) => {
								const Icon = option.icon;
								const isSelected = selectedChoice === option.choice;
								const wasPreviousVote = previousVote === option.choice;

								return (
									<button
										key={option.choice}
										type="button"
										onClick={() => setSelectedChoice(option.choice)}
										className={cn(
											"relative flex items-center gap-4 p-4 rounded-lg border-2 transition-all text-left",
											isSelected
												? `${option.bgColor} border-current ${option.color}`
												: "border-border hover:border-muted-foreground",
											option.hoverColor
										)}
									>
										<div
											className={cn(
												"flex h-12 w-12 items-center justify-center rounded-lg",
												isSelected ? option.color : "text-muted-foreground",
												isSelected ? option.bgColor : "bg-muted"
											)}
										>
											<Icon className="h-6 w-6" />
										</div>
										<div className="flex-1">
											<div className="flex items-center gap-2">
												<p className="font-medium">{option.label}</p>
												{wasPreviousVote && (
													<Badge variant="outline" className="text-xs">
														Current
													</Badge>
												)}
											</div>
											<p className="text-sm text-muted-foreground">
												{option.description}
											</p>
										</div>
										{isSelected && (
											<div className={cn("h-5 w-5 rounded-full border-2", option.color)}>
												<div className={cn("h-full w-full rounded-full scale-50", option.bgColor)} />
											</div>
										)}
									</button>
								);
							})}
						</div>
					</div>

					{/* Optional Comment */}
					<div className="space-y-2">
						<Label htmlFor="comment">
							Comment (Optional)
						</Label>
						<Textarea
							id="comment"
							placeholder="Share your reasoning for this vote..."
							value={comment}
							onChange={(e) => setComment(e.target.value)}
							className="min-h-[100px]"
							maxLength={500}
						/>
						<p className="text-xs text-muted-foreground">
							{comment.length}/500 characters
						</p>
					</div>

					{/* Vote Summary */}
					{selectedChoice && (
						<div className="rounded-lg border bg-primary/5 p-4">
							<p className="text-sm font-medium mb-2">Vote Summary</p>
							<div className="space-y-1 text-sm">
								<div className="flex justify-between">
									<span className="text-muted-foreground">Your choice:</span>
									<span className="font-medium capitalize">{selectedChoice}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">Voting power:</span>
									<span className="font-medium">{formatNumber(votingPower)}</span>
								</div>
								{comment && (
									<div className="flex justify-between">
										<span className="text-muted-foreground">Comment:</span>
										<span className="font-medium">Yes</span>
									</div>
								)}
							</div>
						</div>
					)}

					{/* Warning for no voting power */}
					{votingPower === 0 && (
						<div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950 p-4">
							<p className="text-sm font-medium text-amber-900 dark:text-amber-100">
								No Voting Power
							</p>
							<p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
								You need to hold governance tokens to participate in voting.
							</p>
						</div>
					)}
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
						Cancel
					</Button>
					<Button
						onClick={handleVote}
						disabled={!selectedChoice || votingPower === 0 || isSubmitting}
					>
						{isSubmitting ? (
							<>
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								Submitting...
							</>
						) : hasVoted ? (
							"Update Vote"
						) : (
							"Submit Vote"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
