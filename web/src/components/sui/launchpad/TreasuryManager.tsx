"use client";

import { useState } from "react";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
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
import {
	Wallet,
	Clock,
	CheckCircle2,
	XCircle,
	Users,
	Plus,
	Send,
	Shield,
	TrendingUp,
	AlertCircle,
	Trash2,
} from "lucide-react";

// Types
interface Asset {
	symbol: string;
	balance: string;
	usdValue?: number;
	decimals: number;
	coinType: string;
}

interface Transaction {
	id: string;
	type: "transfer" | "add_owner" | "remove_owner" | "update_threshold";
	status: "pending" | "completed" | "rejected" | "executed";
	proposer: string;
	createdAt: number;
	executedAt?: number;
	approvals: string[];
	threshold: number;
	data: {
		recipient?: string;
		amount?: string;
		asset?: string;
		owner?: string;
		newThreshold?: number;
	};
}

interface Owner {
	address: string;
	name?: string;
	addedAt: number;
}

interface TreasuryState {
	address: string;
	balance: Asset[];
	owners: Owner[];
	threshold: number;
	pendingTransactions: Transaction[];
	completedTransactions: Transaction[];
	totalValue: number;
}

interface TreasuryManagerProps {
	treasuryId: string;
	userAddress?: string;
	onTransactionProposed?: (txId: string) => void;
	onTransactionApproved?: (txId: string) => void;
	onTransactionRejected?: (txId: string) => void;
}

export function TreasuryManager({
	treasuryId,
	userAddress,
	onTransactionProposed,
	onTransactionApproved,
	onTransactionRejected,
}: TreasuryManagerProps) {
	// Mock data - in production, this would use Convex queries
	// const treasury = useQuery(api.queries.sui.treasury.get, { treasuryId });
	const [treasury] = useState<TreasuryState>({
		address: "0x1234...5678",
		balance: [
			{
				symbol: "SUI",
				balance: "1000000",
				usdValue: 5000,
				decimals: 9,
				coinType: "0x2::sui::SUI",
			},
			{
				symbol: "USDC",
				balance: "10000",
				usdValue: 10000,
				decimals: 6,
				coinType: "0x123::usdc::USDC",
			},
		],
		owners: [
			{ address: "0xaaa...111", name: "Alice", addedAt: Date.now() - 86400000 },
			{ address: "0xbbb...222", name: "Bob", addedAt: Date.now() - 86400000 },
			{ address: "0xccc...333", name: "Carol", addedAt: Date.now() - 43200000 },
		],
		threshold: 2,
		pendingTransactions: [
			{
				id: "tx1",
				type: "transfer",
				status: "pending",
				proposer: "0xaaa...111",
				createdAt: Date.now() - 3600000,
				approvals: ["0xaaa...111"],
				threshold: 2,
				data: {
					recipient: "0xddd...444",
					amount: "100000",
					asset: "SUI",
				},
			},
			{
				id: "tx2",
				type: "add_owner",
				status: "pending",
				proposer: "0xbbb...222",
				createdAt: Date.now() - 7200000,
				approvals: ["0xbbb...222", "0xccc...333"],
				threshold: 2,
				data: {
					owner: "0xeee...555",
				},
			},
		],
		completedTransactions: [
			{
				id: "tx3",
				type: "transfer",
				status: "executed",
				proposer: "0xaaa...111",
				createdAt: Date.now() - 172800000,
				executedAt: Date.now() - 172000000,
				approvals: ["0xaaa...111", "0xbbb...222"],
				threshold: 2,
				data: {
					recipient: "0xfff...666",
					amount: "50000",
					asset: "SUI",
				},
			},
		],
		totalValue: 15000,
	});

	const [proposeDialogOpen, setProposeDialogOpen] = useState(false);
	const [manageOwnersDialogOpen, setManageOwnersDialogOpen] = useState(false);
	const [selectedTxType, setSelectedTxType] = useState<string>("transfer");

	// Form state
	const [transferForm, setTransferForm] = useState({
		recipient: "",
		amount: "",
		asset: "SUI",
	});
	const [ownerForm, setOwnerForm] = useState({
		address: "",
		name: "",
	});
	const [thresholdForm, setThresholdForm] = useState({
		newThreshold: treasury.threshold.toString(),
	});

	const isOwner = treasury.owners.some((o) => o.address === userAddress);

	// Handlers
	const handleProposeTransaction = async () => {
		// In production: await useMutation(api.mutations.sui.treasury.proposeTransaction)
		console.log("Proposing transaction:", selectedTxType, {
			transfer: transferForm,
			threshold: thresholdForm,
		});
		setProposeDialogOpen(false);
		onTransactionProposed?.("new-tx-id");
	};

	const handleApproveTransaction = async (txId: string) => {
		// In production: await useMutation(api.mutations.sui.treasury.approveTransaction)
		console.log("Approving transaction:", txId);
		onTransactionApproved?.(txId);
	};

	const handleRejectTransaction = async (txId: string) => {
		// In production: await useMutation(api.mutations.sui.treasury.rejectTransaction)
		console.log("Rejecting transaction:", txId);
		onTransactionRejected?.(txId);
	};

	const handleAddOwner = async () => {
		// In production: await useMutation(api.mutations.sui.treasury.addOwner)
		console.log("Adding owner:", ownerForm);
		setManageOwnersDialogOpen(false);
	};

	const handleRemoveOwner = async (address: string) => {
		// In production: await useMutation(api.mutations.sui.treasury.removeOwner)
		console.log("Removing owner:", address);
	};

	const handleUpdateThreshold = async () => {
		// In production: await useMutation(api.mutations.sui.treasury.updateThreshold)
		console.log("Updating threshold:", thresholdForm);
	};

	const formatAmount = (amount: string, decimals: number) => {
		return (Number(amount) / 10 ** decimals).toFixed(2);
	};

	const formatAddress = (address: string) => {
		return `${address.slice(0, 6)}...${address.slice(-4)}`;
	};

	const formatTimeAgo = (timestamp: number) => {
		const seconds = Math.floor((Date.now() - timestamp) / 1000);
		if (seconds < 60) return `${seconds}s ago`;
		const minutes = Math.floor(seconds / 60);
		if (minutes < 60) return `${minutes}m ago`;
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours}h ago`;
		const days = Math.floor(hours / 24);
		return `${days}d ago`;
	};

	const getTransactionIcon = (type: string) => {
		switch (type) {
			case "transfer":
				return <Send className="h-4 w-4" />;
			case "add_owner":
				return <Plus className="h-4 w-4" />;
			case "remove_owner":
				return <Trash2 className="h-4 w-4" />;
			case "update_threshold":
				return <Shield className="h-4 w-4" />;
			default:
				return <AlertCircle className="h-4 w-4" />;
		}
	};

	const getTransactionTitle = (tx: Transaction) => {
		switch (tx.type) {
			case "transfer":
				return `Transfer ${formatAmount(tx.data.amount || "0", 9)} ${tx.data.asset}`;
			case "add_owner":
				return `Add Owner ${formatAddress(tx.data.owner || "")}`;
			case "remove_owner":
				return `Remove Owner ${formatAddress(tx.data.owner || "")}`;
			case "update_threshold":
				return `Update Threshold to ${tx.data.newThreshold}`;
			default:
				return "Unknown Transaction";
		}
	};

	const calculateApprovalProgress = (tx: Transaction) => {
		return (tx.approvals.length / tx.threshold) * 100;
	};

	const canUserApprove = (tx: Transaction) => {
		return (
			isOwner &&
			!tx.approvals.includes(userAddress || "") &&
			tx.status === "pending"
		);
	};

	const hasUserApproved = (tx: Transaction) => {
		return tx.approvals.includes(userAddress || "");
	};

	return (
		<div className="space-y-6">
			{/* Treasury Balance Section */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Value</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							${treasury.totalValue.toLocaleString()}
						</div>
						<p className="text-xs text-muted-foreground">Multi-sig treasury</p>
					</CardContent>
				</Card>

				{treasury.balance.map((asset) => (
					<Card key={asset.coinType}>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								{asset.symbol}
							</CardTitle>
							<Wallet className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{formatAmount(asset.balance, asset.decimals)}
							</div>
							{asset.usdValue && (
								<p className="text-xs text-muted-foreground">
									≈ ${asset.usdValue.toLocaleString()}
								</p>
							)}
						</CardContent>
					</Card>
				))}

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Multi-sig</CardTitle>
						<Shield className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{treasury.threshold}/{treasury.owners.length}
						</div>
						<p className="text-xs text-muted-foreground">
							Approval threshold
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Actions */}
			<div className="flex gap-2">
				<Dialog open={proposeDialogOpen} onOpenChange={setProposeDialogOpen}>
					<DialogTrigger asChild>
						<Button disabled={!isOwner}>
							<Plus className="mr-2 h-4 w-4" />
							Propose Transaction
						</Button>
					</DialogTrigger>
					<DialogContent className="max-w-md">
						<DialogHeader>
							<DialogTitle>Propose Transaction</DialogTitle>
							<DialogDescription>
								Create a new transaction that requires multi-sig approval.
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4">
							<div>
								<Label htmlFor="tx-type">Transaction Type</Label>
								<Select value={selectedTxType} onValueChange={setSelectedTxType}>
									<SelectTrigger id="tx-type">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="transfer">Transfer Funds</SelectItem>
										<SelectItem value="add_owner">Add Owner</SelectItem>
										<SelectItem value="remove_owner">Remove Owner</SelectItem>
										<SelectItem value="update_threshold">
											Update Threshold
										</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{selectedTxType === "transfer" && (
								<>
									<div>
										<Label htmlFor="recipient">Recipient Address</Label>
										<Input
											id="recipient"
											placeholder="0x..."
											value={transferForm.recipient}
											onChange={(e) =>
												setTransferForm({
													...transferForm,
													recipient: e.target.value,
												})
											}
										/>
									</div>
									<div>
										<Label htmlFor="amount">Amount</Label>
										<Input
											id="amount"
											type="number"
											placeholder="0.00"
											value={transferForm.amount}
											onChange={(e) =>
												setTransferForm({
													...transferForm,
													amount: e.target.value,
												})
											}
										/>
									</div>
									<div>
										<Label htmlFor="asset">Asset</Label>
										<Select
											value={transferForm.asset}
											onValueChange={(value) =>
												setTransferForm({ ...transferForm, asset: value })
											}
										>
											<SelectTrigger id="asset">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{treasury.balance.map((asset) => (
													<SelectItem key={asset.symbol} value={asset.symbol}>
														{asset.symbol} ({formatAmount(asset.balance, asset.decimals)} available)
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								</>
							)}

							{selectedTxType === "update_threshold" && (
								<div>
									<Label htmlFor="threshold">New Threshold</Label>
									<Input
										id="threshold"
										type="number"
										min="1"
										max={treasury.owners.length}
										value={thresholdForm.newThreshold}
										onChange={(e) =>
											setThresholdForm({ newThreshold: e.target.value })
										}
									/>
									<p className="text-xs text-muted-foreground mt-1">
										Current: {treasury.threshold}/{treasury.owners.length}
									</p>
								</div>
							)}
						</div>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setProposeDialogOpen(false)}
							>
								Cancel
							</Button>
							<Button onClick={handleProposeTransaction}>Propose</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				<Dialog
					open={manageOwnersDialogOpen}
					onOpenChange={setManageOwnersDialogOpen}
				>
					<DialogTrigger asChild>
						<Button variant="outline" disabled={!isOwner}>
							<Users className="mr-2 h-4 w-4" />
							Manage Owners
						</Button>
					</DialogTrigger>
					<DialogContent className="max-w-md">
						<DialogHeader>
							<DialogTitle>Manage Owners</DialogTitle>
							<DialogDescription>
								Add or remove multi-sig owners and update threshold.
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4">
							<div className="space-y-2">
								<h4 className="text-sm font-medium">Current Owners</h4>
								{treasury.owners.map((owner) => (
									<div
										key={owner.address}
										className="flex items-center justify-between p-2 border rounded-md"
									>
										<div>
											<p className="text-sm font-medium">
												{owner.name || formatAddress(owner.address)}
											</p>
											<p className="text-xs text-muted-foreground">
												{formatAddress(owner.address)}
											</p>
										</div>
										{treasury.owners.length > treasury.threshold && (
											<Button
												variant="ghost"
												size="icon-sm"
												onClick={() => handleRemoveOwner(owner.address)}
											>
												<Trash2 className="h-4 w-4 text-destructive" />
											</Button>
										)}
									</div>
								))}
							</div>

							<div className="space-y-2">
								<h4 className="text-sm font-medium">Add New Owner</h4>
								<div>
									<Label htmlFor="owner-address">Address</Label>
									<Input
										id="owner-address"
										placeholder="0x..."
										value={ownerForm.address}
										onChange={(e) =>
											setOwnerForm({ ...ownerForm, address: e.target.value })
										}
									/>
								</div>
								<div>
									<Label htmlFor="owner-name">Name (optional)</Label>
									<Input
										id="owner-name"
										placeholder="Alice"
										value={ownerForm.name}
										onChange={(e) =>
											setOwnerForm({ ...ownerForm, name: e.target.value })
										}
									/>
								</div>
								<Button onClick={handleAddOwner} className="w-full">
									Add Owner
								</Button>
							</div>
						</div>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setManageOwnersDialogOpen(false)}
							>
								Close
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			{/* Pending Transactions Section */}
			<div>
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-lg font-semibold">Pending Transactions</h3>
					<Badge variant="outline">
						{treasury.pendingTransactions.length} pending
					</Badge>
				</div>

				{treasury.pendingTransactions.length === 0 ? (
					<Card>
						<CardContent className="pt-6">
							<div className="text-center text-muted-foreground">
								<Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
								<p>No pending transactions</p>
							</div>
						</CardContent>
					</Card>
				) : (
					<div className="grid gap-4">
						{treasury.pendingTransactions.map((tx) => (
							<Card key={tx.id}>
								<CardHeader>
									<div className="flex items-start justify-between">
										<div className="flex items-start gap-3">
											<div className="p-2 bg-primary/10 rounded-md">
												{getTransactionIcon(tx.type)}
											</div>
											<div>
												<CardTitle className="text-base">
													{getTransactionTitle(tx)}
												</CardTitle>
												<CardDescription>
													Proposed by {formatAddress(tx.proposer)} •{" "}
													{formatTimeAgo(tx.createdAt)}
												</CardDescription>
											</div>
										</div>
										<Badge
											variant={
												tx.approvals.length >= tx.threshold
													? "default"
													: "outline"
											}
										>
											{tx.approvals.length >= tx.threshold
												? "Ready"
												: "Awaiting"}
										</Badge>
									</div>
								</CardHeader>
								<CardContent className="space-y-4">
									{/* Approval Progress */}
									<div className="space-y-2">
										<div className="flex items-center justify-between text-sm">
											<span className="text-muted-foreground">
												Approvals ({tx.approvals.length}/{tx.threshold})
											</span>
											<span className="font-medium">
												{Math.round(calculateApprovalProgress(tx))}%
											</span>
										</div>
										<Progress value={calculateApprovalProgress(tx)} />
									</div>

									{/* Approvers */}
									<div className="flex flex-wrap gap-2">
										{treasury.owners.map((owner) => {
											const hasApproved = tx.approvals.includes(owner.address);
											return (
												<Badge
													key={owner.address}
													variant={hasApproved ? "default" : "outline"}
												>
													{hasApproved && (
														<CheckCircle2 className="mr-1 h-3 w-3" />
													)}
													{owner.name || formatAddress(owner.address)}
												</Badge>
											);
										})}
									</div>

									{/* Transaction Details */}
									{tx.type === "transfer" && (
										<div className="text-sm space-y-1 p-3 bg-muted/50 rounded-md">
											<div className="flex justify-between">
												<span className="text-muted-foreground">To:</span>
												<span className="font-mono">
													{formatAddress(tx.data.recipient || "")}
												</span>
											</div>
											<div className="flex justify-between">
												<span className="text-muted-foreground">Amount:</span>
												<span className="font-medium">
													{formatAmount(tx.data.amount || "0", 9)}{" "}
													{tx.data.asset}
												</span>
											</div>
										</div>
									)}
								</CardContent>
								<CardFooter className="flex gap-2">
									{hasUserApproved(tx) ? (
										<Button variant="outline" disabled className="flex-1">
											<CheckCircle2 className="mr-2 h-4 w-4" />
											Already Approved
										</Button>
									) : canUserApprove(tx) ? (
										<>
											<Button
												variant="outline"
												className="flex-1"
												onClick={() => handleRejectTransaction(tx.id)}
											>
												<XCircle className="mr-2 h-4 w-4" />
												Reject
											</Button>
											<Button
												className="flex-1"
												onClick={() => handleApproveTransaction(tx.id)}
											>
												<CheckCircle2 className="mr-2 h-4 w-4" />
												Approve
											</Button>
										</>
									) : (
										<Button variant="outline" disabled className="flex-1">
											{tx.approvals.length >= tx.threshold
												? "Awaiting Execution"
												: "Awaiting Approvals"}
										</Button>
									)}
								</CardFooter>
							</Card>
						))}
					</div>
				)}
			</div>

			{/* Transaction History Section */}
			<div>
				<h3 className="text-lg font-semibold mb-4">Transaction History</h3>
				<Card>
					<CardContent className="p-0">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Type</TableHead>
									<TableHead>Details</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Approvals</TableHead>
									<TableHead>Date</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{treasury.completedTransactions.length === 0 ? (
									<TableRow>
										<TableCell colSpan={5} className="text-center py-8">
											<div className="text-muted-foreground">
												No transaction history
											</div>
										</TableCell>
									</TableRow>
								) : (
									treasury.completedTransactions.map((tx) => (
										<TableRow key={tx.id}>
											<TableCell>
												<div className="flex items-center gap-2">
													{getTransactionIcon(tx.type)}
													<span className="capitalize">
														{tx.type.replace("_", " ")}
													</span>
												</div>
											</TableCell>
											<TableCell>
												<div className="text-sm">
													{tx.type === "transfer" && (
														<>
															{formatAmount(tx.data.amount || "0", 9)}{" "}
															{tx.data.asset}
															<div className="text-xs text-muted-foreground">
																to {formatAddress(tx.data.recipient || "")}
															</div>
														</>
													)}
													{tx.type === "add_owner" && (
														<>Add {formatAddress(tx.data.owner || "")}</>
													)}
													{tx.type === "remove_owner" && (
														<>Remove {formatAddress(tx.data.owner || "")}</>
													)}
													{tx.type === "update_threshold" && (
														<>Threshold → {tx.data.newThreshold}</>
													)}
												</div>
											</TableCell>
											<TableCell>
												<Badge
													variant={
														tx.status === "executed" ? "default" : "outline"
													}
												>
													{tx.status === "executed" && (
														<CheckCircle2 className="mr-1 h-3 w-3" />
													)}
													{tx.status}
												</Badge>
											</TableCell>
											<TableCell>
												<span className="text-sm">
													{tx.approvals.length}/{tx.threshold}
												</span>
											</TableCell>
											<TableCell>
												<div className="text-sm">
													{tx.executedAt
														? formatTimeAgo(tx.executedAt)
														: formatTimeAgo(tx.createdAt)}
												</div>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			</div>

			{/* Owner Information */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Users className="h-5 w-5" />
						Multi-sig Owners
					</CardTitle>
					<CardDescription>
						{treasury.threshold} out of {treasury.owners.length} signatures
						required for transactions
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{treasury.owners.map((owner, index) => (
							<div
								key={owner.address}
								className="flex items-center justify-between p-3 border rounded-md"
							>
								<div className="flex items-center gap-3">
									<div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
										<span className="text-sm font-medium">{index + 1}</span>
									</div>
									<div>
										<p className="font-medium">
											{owner.name || formatAddress(owner.address)}
										</p>
										<p className="text-sm text-muted-foreground font-mono">
											{formatAddress(owner.address)}
										</p>
									</div>
								</div>
								{owner.address === userAddress && (
									<Badge variant="outline">You</Badge>
								)}
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
