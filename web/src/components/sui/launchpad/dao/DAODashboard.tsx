"use client";

import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { Plus, Users, FileText, Activity, Wallet, Coins, TrendingUp } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	daoActions,
	$daoState,
	$activeProposals,
	type Proposal,
	type ProposalStatus,
} from "@/stores/dao";
import { ProposalCard } from "./ProposalCard";
import { VoteModal } from "./VoteModal";
import { ProposalCreator } from "./ProposalCreator";

interface DAODashboardProps {
	userAddress?: string;
	onConnect?: () => void;
}

export function DAODashboard({ userAddress, onConnect }: DAODashboardProps) {
	const daoState = useStore($daoState);
	const activeProposals = useStore($activeProposals);

	const [showCreator, setShowCreator] = useState(false);
	const [filter, setFilter] = useState<ProposalStatus | "all">("all");

	// Load sample data on mount (for demo purposes)
	useEffect(() => {
		if (daoState.proposals.length === 0) {
			daoActions.addSampleProposals();
		}
	}, []);

	// Filter proposals
	const filteredProposals = filter === "all"
		? daoState.proposals
		: daoState.proposals.filter((p) => p.status === filter);

	// Recent activity (last 5 proposals)
	const recentActivity = [...daoState.proposals]
		.sort((a, b) => b.createdAt - a.createdAt)
		.slice(0, 5);

	// Format numbers
	const formatNumber = (num: number | string) => {
		const n = typeof num === "string" ? Number.parseFloat(num) : num;
		if (n >= 1000000) return `${(n / 1000000).toFixed(2)}M`;
		if (n >= 1000) return `${(n / 1000).toFixed(2)}K`;
		return n.toFixed(0);
	};

	// Stats cards configuration
	const stats = [
		{
			title: "Total Members",
			value: formatNumber(daoState.stats.totalMembers),
			icon: Users,
			description: "Active DAO participants",
			trend: "+12% from last month",
		},
		{
			title: "Total Proposals",
			value: formatNumber(daoState.stats.totalProposals),
			icon: FileText,
			description: "All-time proposals",
			trend: `${daoState.stats.activeProposals} active`,
		},
		{
			title: "Treasury Balance",
			value: `${formatNumber(daoState.stats.treasuryBalance)} SUI`,
			icon: Wallet,
			description: "Available funds",
			trend: "+5.2% this quarter",
		},
		{
			title: "Governance Supply",
			value: formatNumber(daoState.stats.governanceTokenSupply),
			icon: Coins,
			description: "Total token supply",
			trend: "Fixed supply",
		},
	];

	// User's voting power
	const votingPowerPercentage = daoState.stats.governanceTokenSupply > 0
		? (daoState.stats.userVotingPower / Number.parseFloat(daoState.stats.governanceTokenSupply)) * 100
		: 0;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">DAO Governance</h1>
					<p className="text-muted-foreground mt-1">
						Participate in decentralized decision-making
					</p>
				</div>
				<div className="flex items-center gap-3">
					{!userAddress ? (
						<Button onClick={onConnect} size="lg">
							Connect Wallet
						</Button>
					) : (
						<Button onClick={() => setShowCreator(!showCreator)} size="lg">
							<Plus className="h-4 w-4 mr-2" />
							Create Proposal
						</Button>
					)}
				</div>
			</div>

			{/* Stats Grid */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{stats.map((stat) => {
					const Icon = stat.icon;
					return (
						<Card key={stat.title}>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									{stat.title}
								</CardTitle>
								<Icon className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{stat.value}</div>
								<p className="text-xs text-muted-foreground mt-1">
									{stat.description}
								</p>
								<div className="flex items-center gap-1 mt-2">
									<TrendingUp className="h-3 w-3 text-green-600" />
									<span className="text-xs text-green-600">
										{stat.trend}
									</span>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>

			{/* User's Voting Power */}
			{userAddress && daoState.stats.userVotingPower > 0 && (
				<Card className="bg-gradient-to-br from-primary/10 to-primary/5">
					<CardHeader>
						<CardTitle className="text-lg">Your Voting Power</CardTitle>
						<CardDescription>
							Your influence in DAO governance based on token holdings
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex items-center justify-between">
							<div>
								<p className="text-3xl font-bold">
									{formatNumber(daoState.stats.userVotingPower)}
								</p>
								<p className="text-sm text-muted-foreground mt-1">
									{votingPowerPercentage.toFixed(4)}% of total supply
								</p>
							</div>
							<Badge variant="secondary" className="text-base px-4 py-2">
								Active Voter
							</Badge>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Proposal Creator */}
			{showCreator && (
				<div className="animate-in slide-in-from-top">
					<ProposalCreator
						userAddress={userAddress}
						onSuccess={(id) => {
							setShowCreator(false);
							setFilter("active");
						}}
					/>
				</div>
			)}

			{/* Main Content */}
			<Tabs defaultValue="proposals" className="space-y-4">
				<TabsList>
					<TabsTrigger value="proposals">
						<FileText className="h-4 w-4 mr-2" />
						Proposals
					</TabsTrigger>
					<TabsTrigger value="activity">
						<Activity className="h-4 w-4 mr-2" />
						Recent Activity
					</TabsTrigger>
				</TabsList>

				{/* Proposals Tab */}
				<TabsContent value="proposals" className="space-y-4">
					{/* Filters */}
					<div className="flex items-center gap-2 flex-wrap">
						<span className="text-sm text-muted-foreground">Filter:</span>
						{[
							{ label: "All", value: "all" as const },
							{ label: "Active", value: "active" as const },
							{ label: "Passed", value: "passed" as const },
							{ label: "Failed", value: "failed" as const },
							{ label: "Executed", value: "executed" as const },
						].map((f) => (
							<Button
								key={f.value}
								variant={filter === f.value ? "default" : "outline"}
								size="sm"
								onClick={() => setFilter(f.value)}
							>
								{f.label}
								{f.value === "all" && (
									<Badge variant="secondary" className="ml-2">
										{daoState.proposals.length}
									</Badge>
								)}
								{f.value === "active" && (
									<Badge variant="secondary" className="ml-2">
										{activeProposals.length}
									</Badge>
								)}
							</Button>
						))}
					</div>

					{/* Proposals List */}
					{filteredProposals.length === 0 ? (
						<Card>
							<CardContent className="flex flex-col items-center justify-center py-12">
								<FileText className="h-12 w-12 text-muted-foreground mb-4" />
								<p className="text-lg font-medium">No proposals found</p>
								<p className="text-sm text-muted-foreground mt-1">
									{filter === "all"
										? "Be the first to create a proposal!"
										: `No ${filter} proposals at this time`}
								</p>
								{filter === "all" && userAddress && (
									<Button onClick={() => setShowCreator(true)} className="mt-4">
										<Plus className="h-4 w-4 mr-2" />
										Create Proposal
									</Button>
								)}
							</CardContent>
						</Card>
					) : (
						<div className="grid gap-4">
							{filteredProposals.map((proposal) => (
								<ProposalCard key={proposal.id} proposal={proposal} />
							))}
						</div>
					)}
				</TabsContent>

				{/* Activity Tab */}
				<TabsContent value="activity" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Recent Activity</CardTitle>
							<CardDescription>
								Latest proposals and governance events
							</CardDescription>
						</CardHeader>
						<CardContent>
							{recentActivity.length === 0 ? (
								<div className="flex flex-col items-center justify-center py-12">
									<Activity className="h-12 w-12 text-muted-foreground mb-4" />
									<p className="text-lg font-medium">No activity yet</p>
									<p className="text-sm text-muted-foreground mt-1">
										Activity will appear here as proposals are created and voted on
									</p>
								</div>
							) : (
								<div className="space-y-4">
									{recentActivity.map((proposal, index) => (
										<div key={proposal.id}>
											{index > 0 && <Separator className="my-4" />}
											<div className="flex items-start gap-4">
												<div className="flex-1 space-y-2">
													<div className="flex items-center gap-2">
														<h4 className="font-medium">{proposal.title}</h4>
														<Badge variant={
															proposal.status === "active" ? "default" :
															proposal.status === "passed" ? "secondary" :
															proposal.status === "executed" ? "secondary" :
															"outline"
														}>
															{proposal.status}
														</Badge>
													</div>
													<p className="text-sm text-muted-foreground">
														Created by {proposal.proposer.slice(0, 6)}...{proposal.proposer.slice(-4)}
														{" "}• {new Date(proposal.createdAt).toLocaleDateString()}
													</p>
													<div className="flex items-center gap-4 text-sm">
														<span className="text-green-600">
															For: {formatNumber(proposal.votesFor)}
														</span>
														<span className="text-red-600">
															Against: {formatNumber(proposal.votesAgainst)}
														</span>
														<span className="text-muted-foreground">
															Abstain: {formatNumber(proposal.votesAbstain)}
														</span>
													</div>
												</div>
												<Button
													variant="outline"
													size="sm"
													onClick={() => daoActions.openVoteModal(proposal)}
													disabled={proposal.status !== "active"}
												>
													{proposal.status === "active" ? "Vote" : "View"}
												</Button>
											</div>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* Vote Modal */}
			<VoteModal />
		</div>
	);
}
