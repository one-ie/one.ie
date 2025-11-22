"use client";

import { useState } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { daoActions, type ProposalType, type ContractAction } from "@/stores/dao";

interface ProposalCreatorProps {
	onSuccess?: (proposalId: string) => void;
	userAddress?: string;
}

export function ProposalCreator({ onSuccess, userAddress }: ProposalCreatorProps) {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [type, setType] = useState<ProposalType>("parameter_change");
	const [actions, setActions] = useState<ContractAction[]>([]);
	const [votingPeriodDays, setVotingPeriodDays] = useState("7");
	const [quorum, setQuorum] = useState("40");
	const [threshold, setThreshold] = useState("60");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const addAction = () => {
		setActions([
			...actions,
			{
				id: `action-${Date.now()}`,
				target: "",
				function: "",
				args: [],
				value: "",
			},
		]);
	};

	const removeAction = (id: string) => {
		setActions(actions.filter((a) => a.id !== id));
	};

	const updateAction = (id: string, field: keyof ContractAction, value: any) => {
		setActions(
			actions.map((a) => (a.id === id ? { ...a, [field]: value } : a))
		);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			// Validate required fields
			if (!title || !description) {
				alert("Please fill in all required fields");
				setIsSubmitting(false);
				return;
			}

			// Create proposal
			const proposal = daoActions.createProposal({
				title,
				description,
				type,
				proposer: userAddress || "0x0000...0000",
				actions,
				votingPeriodEnd: Date.now() + Number.parseInt(votingPeriodDays) * 24 * 60 * 60 * 1000,
				quorum: Number.parseInt(quorum),
				threshold: Number.parseInt(threshold),
				totalVotingPower: 2000000, // This would come from blockchain
			});

			// Reset form
			setTitle("");
			setDescription("");
			setActions([]);
			setVotingPeriodDays("7");
			setQuorum("40");
			setThreshold("60");

			// Success callback
			onSuccess?.(proposal.id);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Create Proposal</CardTitle>
				<CardDescription>
					Submit a new governance proposal for community voting
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Basic Information */}
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="title">Proposal Title *</Label>
							<Input
								id="title"
								placeholder="e.g., Increase Staking Rewards by 10%"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="type">Proposal Type</Label>
							<Select value={type} onValueChange={(v) => setType(v as ProposalType)}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="parameter_change">
										Parameter Change
									</SelectItem>
									<SelectItem value="treasury_spend">
										Treasury Spend
									</SelectItem>
									<SelectItem value="custom">
										Custom Action
									</SelectItem>
								</SelectContent>
							</Select>
							<p className="text-sm text-muted-foreground">
								{type === "parameter_change" && "Modify protocol parameters"}
								{type === "treasury_spend" && "Allocate funds from treasury"}
								{type === "custom" && "Execute custom contract calls"}
							</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">Description (Markdown) *</Label>
							<Textarea
								id="description"
								placeholder="# Proposal Summary&#10;&#10;Detailed description of the proposal...&#10;&#10;## Rationale&#10;- Key point 1&#10;- Key point 2"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								className="min-h-[200px] font-mono text-sm"
								required
							/>
							<p className="text-sm text-muted-foreground">
								Use Markdown for formatting. Include rationale, impact, and implementation details.
							</p>
						</div>
					</div>

					<Separator />

					{/* Actions Builder */}
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<div>
								<Label>Contract Actions</Label>
								<p className="text-sm text-muted-foreground">
									Define on-chain actions to execute if proposal passes
								</p>
							</div>
							<Button type="button" variant="outline" size="sm" onClick={addAction}>
								<Plus className="h-4 w-4 mr-2" />
								Add Action
							</Button>
						</div>

						{actions.length === 0 ? (
							<div className="rounded-lg border border-dashed p-8 text-center">
								<p className="text-sm text-muted-foreground">
									No actions added. Click "Add Action" to define contract calls.
								</p>
							</div>
						) : (
							<div className="space-y-4">
								{actions.map((action, index) => (
									<Card key={action.id} className="bg-muted/50">
										<CardContent className="pt-6 space-y-3">
											<div className="flex items-center justify-between">
												<Badge variant="outline">Action {index + 1}</Badge>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={() => removeAction(action.id)}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>

											<div className="grid gap-3">
												<div className="space-y-2">
													<Label>Target Contract</Label>
													<Input
														placeholder="0x..."
														value={action.target}
														onChange={(e) =>
															updateAction(action.id, "target", e.target.value)
														}
													/>
												</div>

												<div className="space-y-2">
													<Label>Function Name</Label>
													<Input
														placeholder="setRewardRate"
														value={action.function}
														onChange={(e) =>
															updateAction(action.id, "function", e.target.value)
														}
													/>
												</div>

												<div className="space-y-2">
													<Label>Arguments (comma-separated)</Label>
													<Input
														placeholder="1500, true"
														value={action.args.join(", ")}
														onChange={(e) =>
															updateAction(
																action.id,
																"args",
																e.target.value.split(",").map((s) => s.trim())
															)
														}
													/>
												</div>

												<div className="space-y-2">
													<Label>Value (optional, in SUI)</Label>
													<Input
														type="number"
														placeholder="0"
														value={action.value || ""}
														onChange={(e) =>
															updateAction(action.id, "value", e.target.value)
														}
													/>
												</div>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						)}
					</div>

					<Separator />

					{/* Voting Configuration */}
					<div className="space-y-4">
						<Label>Voting Configuration</Label>

						<div className="grid grid-cols-3 gap-4">
							<div className="space-y-2">
								<Label htmlFor="votingPeriod">Voting Period (days)</Label>
								<Input
									id="votingPeriod"
									type="number"
									min="1"
									max="30"
									value={votingPeriodDays}
									onChange={(e) => setVotingPeriodDays(e.target.value)}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="quorum">Quorum (%)</Label>
								<Input
									id="quorum"
									type="number"
									min="0"
									max="100"
									value={quorum}
									onChange={(e) => setQuorum(e.target.value)}
								/>
								<p className="text-xs text-muted-foreground">
									Min participation needed
								</p>
							</div>

							<div className="space-y-2">
								<Label htmlFor="threshold">Threshold (%)</Label>
								<Input
									id="threshold"
									type="number"
									min="50"
									max="100"
									value={threshold}
									onChange={(e) => setThreshold(e.target.value)}
								/>
								<p className="text-xs text-muted-foreground">
									% of "for" votes needed
								</p>
							</div>
						</div>
					</div>

					{/* Preview & Submit */}
					<div className="space-y-4">
						<Separator />
						<div className="flex items-center justify-between">
							<div className="text-sm text-muted-foreground">
								<p>Review your proposal before submitting</p>
							</div>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? (
									<>
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										Submitting...
									</>
								) : (
									"Submit Proposal"
								)}
							</Button>
						</div>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
